# 자바스크립트 코딩의 기술(시리즈 7 - 유연한 함수를 만들어라)

- 자바스크립트 코딩의 기술 책을 읽고 복습 겸 정리하는 포스팅이다.
- 시리즈 1이 시작이며 시리즈 몇까지는 대지는 진행하면서 가늠잡아 보겠다.

## 개요

- 이 장에서는 함수의 사용법을 다룰 예정이며, 기본기는 다루지 않을 예정이다.
  - 테스트 가능한 코드 작성법
  - 화살표 함수의 매개변수에 대한 개념
  - 함수를 반환하는 고차함수와 재사용 가능한 함수
  - 화살표 함수의 문맥 개념

## 테스트하기 쉬운 함수를 작성하라(TIP32)

- 테스트를 작성하면 코드를 쉽게 리팩토링 가능
- 오래된 코드를 쉽게 이해 가능
- 마지막으로 명확하고 버그가 적은 코드를 작성 가능
- 위와 같은 장점들이 있지만 현실을 테스트를 작성하는것 쉽지 않다.(테스트 작성의 어려움, 코드가 외부 의존성이 강하게 결합, 개발속도가 느림 등..)
- 아래 코드를 통해 테스트 코드에 대해 알아보자.

```javascript
import { getTaxInformation } from './taxService';

function formatPrice(user, { price, location }) {
  const rate = getTaxInformation(location); // <label id="test.external" />
  const taxes = rate ? `추가 세금 $${price * rate}` : '추가 세금';

  return `${user}님의 합계 금액: $${price} 및 ${taxes}`;
}
```

- 테스트 할 때 어려운 부분은 바로 `getTaxInformation()` 외부 함수를 호출 할때 시작된다.
- 이 함수가 외부 서비스, 설정 파일, 네트워크 통신 등에 의존하게 될 경우 복잡해진다.
- 우리는 단지 return되는 문자열만 필요할 뿐이다.
- 이 문제를 해결하려면 모의 객체(mock)을 생성해서 함수를 가로채고 명시적인 반환값을 설정한다.
  - 가짜 함수를 생성해서 가짜 값을 반환한다 라고 이해했다.

```javascript
import expect from 'expect';
import sinon from 'sinon';
import * as taxService from './taxService';
import { formatPrice } from './problem';

describe('가격 표시', () => {
  let taxStub;

  beforeEach(() => {
    taxStub = sinon.stub(taxService, 'getTaxInformation'); // <label id="test.stub" />
  });

  afterEach(() => {
    taxStub.restore(); // <label id="test.restore" />
  });

  it('세금 정보가 없으면 세금 추가를 안내해야 한다', () => {
    taxStub.returns(null); // <label id="test.stub2" />
    const item = { price: 30, location: 'Oklahoma' };
    const user = 'Aaron Cometbus';
    const message = formatPrice(user, item);
    const expectedMessage = 'Aaron Cometbus님의 합계 금액: $30 및 추가 세금';
    expect(message).toEqual(expectedMessage);
  });

  it('세금 정보가 있으면 세금 금액을 알려줘야 한다', () => {
    taxStub.returns(0.1);

    const item = { price: 30, location: 'Oklahoma' };
    const user = 'Aaron Cometbus';
    const message = formatPrice(user, item);
    const expectedMessage = 'Aaron Cometbus님의 합계 금액: $30 및 추가 세금 $3';
    expect(message).toEqual(expectedMessage);
  });
});
```

- 예제에서는 [`mocha` 테스트 프레임워크](https://mochajs.org/)를 사용했으며 모카에 대한 설명은 하지 않는다.
- `taxStub = sinon.stub(taxService, 'getTaxInformation');` 여기서 `taxStub` 스텁을 생성
  - `getTaxInformation` 함수를 덮어 써서 간단한 반환값을 반환한다.
  - `taxStub.returns(반환값);`
- `taxStub.restore();` 테스트 꾸러미가 종료되면 원래의 메서드를 사용하도록 코드를 복구한다.


- 만약 예제 코드보다 더 많은 외부함수를 호출하고 밀접하게 결합된 코드는 `의존성 주입(dependency injection)`을 하자. 의존성을 인수로 전달하는 것이다.


```javascript
function formatPrice(user, { price, location }, getTaxInformation) {
  const rate = getTaxInformation(location);
  const taxes = rate ? `추가 세금 $${price * rate}` : '추가 세금';
  return `${user}님의 합계 금액: $${price} 및 ${taxes}`;
}
```

- 위와 같이 `getTaxInformation()`을 인수로 전달한다.
- 이제 스텁이 필요하지 않게 되었고, 테스트를 작성할 때 불러오기를 생략할 필요가 없다.
- 그 대신에 필요한 값을 반환하는 간단한 함수를 작성하면 된다.

```javascript
import expect from 'expect';

import { formatPrice } from './test';

describe('가격 표시', () => {
  it('세금 정보가 없으면 세금 추가를 안내해야 한다', () => {
    const item = { price: 30, location: 'Oklahoma' };
    const user = 'Aaron Cometbus';
    const message = formatPrice(user, item, () => null); // 스텁 대신 () => null 로 간단한 함수 반환!!
    expect(message).toEqual('Aaron Cometbus님의 합계 금액: $30 및 추가 세금');
  });

  it('세금 정보가 있으면 세금 금액을 알려줘야 한다', () => {
    const item = { price: 30, location: 'Oklahoma' };
    const user = 'Aaron Cometbus';
    const message = formatPrice(user, item, () => 0.1);
    expect(message).toEqual('Aaron Cometbus님의 합계 금액: $30 및 추가 세금 $3');
  });
});
```

- 테스트 코드를 작성하기 쉬워졌고, 코드가 단일 책임을 갖도록 책임을 줄이는 면에서도 효율적이다.
- 테스트 작성이 어렵다면 테스트를 작성하기 쉽게 코드를 변경해야 한다.
- 또한, 다른 문제가 발생해도 포기하지 말아야 한다. 강하게 결합된 코드는 복잡성의 한 모습이다.
- 기술적으로 틀리지 않았지만 명확하지 않은 코드가 있기도 하다.(이에 대한 부분은 [조슈아 모크의 글](https://www.toptal.com/javascript/writing-testable-code-in-javascript)을 추천)

## 화살표 함수로 복잡도를 낮춰라.(TIP33)

- 화살표 함수에서 인수를 해체 할당하는 방법, 객체를 반환하는 방법, 고차함수를 만드는 방법을 배워보자.

- 해체 할당하는 방법과 객체를 반환하는 방법은 아래 코드로 살펴보자.

```javascript
const name = {
  first: 'Lemmy',
  last: 'Kilmister',
};

function getName({ first, last }) {
  return `${first} ${last}`;
}

const getName = ({ first, last }) => `${first} ${last}`

getName(name) // "Lemmy Kilmister"
```

- 화살표 함수를 사용하고 매개변수의 객체을 `()` 감싼다.
- `return`값이 객체를 반환할 경우는 꼭 화살표 우측 반환될 객체를 `()` 감싼다.
  - `const getName = ({ first, last }) => ({ fullName:`${first} ${last}`})`;

- 이제 다른 함수를 반환하는 고차함수를 만들어 보자.(자세히는 다음팁에서 살펴볼 예정)

``` javascript
const discounter = discount => {
  return price => {
    return price * (1 - discount);
  };
};
const tenPercentOff = discounter(0.1); // discount 매개변수에 할당
tenPercentOff(100); // 90 // price 매개변수에 할당

tenPercentOff = (price) => {
  return price * (1 - 0.1)
}

// return 생략, 중괄호 생략한 고차함수
const discounter = discount => price => price * (1 - discount);

// 첫번째 매개변수 바로 뒤에 괄호를 연결해서 두 번째 매개변수를 전달하면, 첫번째 함수에 이어 바로 두번째 함수를 호출한다.
discounter(0.1)(100);
```

## 부분 적용 함수로 단일 책임 매개변수를 관리하라(TIP34)

- 고차 함수를 이용해 매개변수에 단일 책임을 부여하는 방법을 살펴보자.
- 고차 함수는 다른 함수를 반환하므로 최소 2단계의 매개변수가 존재한다.
- 웹사이트에 행사 안내 페이지가 있다고 가정하자. 아래 코드를 통해 살펴보자.
  - 장소, 건물(`building`), 관리자(`manager`) 등은 크게 달라지지 않지만, 행사 내용(`program`)이 달라질 수 있다.
  - 건물, 담당자, 프로그램 또는 전시회라는 세 가지 인수를 받아 하나의 정보 집합으로 결합하는 함수를 만들자.

```javascript
const building = {
  hours: '8 a.m. - 8 p.m.',
  address: 'Jayhawk Blvd',
};

const manager = {
  name: 'Augusto',
  phone: '555-555-5555',
};

const program = {
  name: 'Presenting Research',
  room: '415',
  hours: '3 - 6',
};

const exhibit = {
  name: 'Emerging Scholarship',
  contact: 'Dyan',
};

function mergeProgramInformation(building, manager, event) {
  const { hours, address } = building;
  const { name, phone } = manager;
  const defaults = {
    hours,
    address,
    contact: name,
    phone,
  };

return { ...defaults, ...event };
}
```

- 첫번째, 두번째 매개변수는 (`building, manager`)로 항상 동일하다. 반복 호출 중이다.

```javascript
const programInfo = mergeProgramInformation(building, manager, program);
// {hours: "3 - 6", address: "Jayhawk Blvd", contact: "Augusto", phone: "555-555-5555", name: "Presenting Research", …}
const exhibitInfo = mergeProgramInformation(building, manager, exhibit);
//  {
//     address: "Jayhawk Blvd"
//     contact: "Dyan"
//     hours: "8 a.m. - 8 p.m."
//     name: "Emerging Scholarship"
//     phone: "555-555-5555"
//  }
```

- 고차함수를 이용해서 단일 책임 매개변수를 만들어 앞에 위치한 2개의 인수를 재사용해보자.

```javascript
function mergeProgramInformation(building, manager) {
  const { hours, address } = building;
  const { name, phone } = manager;
  const defaults = {
    hours,
    address,
    contact: name,
    phone,
  };

  return program => {
    return { ...defaults, ...program };
  };
}

const programInfo = mergeProgramInformation(building, manager)(program);
const exhibitInfo = mergeProgramInformation(building, manager)(exhibit);
```

- 첫 번째 매개변수 조합은 `building, manager` 기본 동일한 데이터이며, 두 번째 매개변수는 기초 데이터를 덮어 쓰는 사용자 지정 정보이다.
- 고차함수 호출법은 괄호에 이어 괄호를 작성하면 된다.
- 반복까지는 제거되지 않았지만 부분 적용을 사용하면 가능하다. 다음 팁에서 배운다. (반환된 함수를 재사용하는 방법)

- 나머지 매개변수는 한번만 사용이 가능하지만 떄로는 여러 차례 사용이 필요한 경우도 있다.
- 배열 데이터가 있거나 원본 데이터에 일대일로 대응되는 추가 데이터가 있는 경우 자주 발생한다.
- 아래는 지역과 새를 결과값 배열로 쌍으로 연결해야 하는 코드이다.

```javascript
function getBirds(...states) {
  return ['meadowlark', 'robin', 'roadrunner'];
}
const birds = getBirds('kansas', 'wisconsin', 'new mexico');
// ['meadowlark', 'robin', 'roadrunner']

const zip = (...left) => (...right) => {
  return left.map((item, i) => [item, right[i]]);
};
zip('kansas', 'wisconsin', 'new mexico')(...birds);
// [
//   ['kansas', 'meadowlark'],
//   ['wisconsin', 'robin'],
//   ['new mexico', 'roadrunner']
// ]
```

- 2개의 배열을 쌍으로 결합하는 것은 일반적인 작업이므로 이런 함수를 zip 함수라고 부른다.
- 원본 배열을 넘겨 받는 고차함수가 필요(...left)
- 결과값을 배열을 넘겨받아서 결합하는 함수를 반환(...right)
- 변수가 독립적이므로 나머지 매개변수를 두 번 모두 사용 가능하다.

## 커링과 배열 메서드를 조합한 부분 적용 함수를 사용하라 (TIP35)

- 함수의 부분 적용을 통해 변수를 저장해두는 방법을 살펴보자.
- 앞에 팁에서 살펴봤떤 예제코드를 이어 간다.
  - `(building, manager)` 를 재사용하려고 아래와 같이 코드를 작성했다.
  - 첫번째 함수 호출의 반환값을 변수에 할당하면 된다.

```javascript
// 1 고차함수 이용
const setStrongHallProgram = mergeProgramInformation(building, manager);
const programInfo = setStrongHallProgram(program);
const exhibitInfo = setStrongHallProgram(exhibit);

// 2 하드 코딩
const setStrongHallProgram = program => {
  const defaults = {
    hours: '8 a.m. - 8 p.m.',
    address: 'Jayhawk Blvd',
    name: 'Augusto',
    phone: '555-555-5555'
  }
  return { ...defaults, ...program}
}
const programs = setStrongHallProgram(program);
const exhibit = setStrongHallProgram(exhibit);
```

- 고차 함수를 이용하면 매개변수를 별도로 분리할 수 있다. 하지만, 함수를 완전히 분리하기 전에 **함수에 필요한 인수의 수를 줄일 수 있도록 인수를 분리하는 것이 훨씬 더 중요하다**
- 한번에 인수를 하나만 받는 함수를 `커링(currying)`이라고 한다.

> 커링과 부분 적용 함수의 차이점은 커링은 인수 하나를 받는 고차함수가 다른 함수를 반환한다. 이때 반환되는 함수 역시 인수 하나만 받을 수 있다. 부분 적용 함수는 원래의 함수보다 항수(인수의 수)가 적은 함수를 반환한다.(예를 들면, 3개의 인수를 받는 함수인데 2개의 인수를 받는 함수를 반환)

- 강아지 배열과 필터 조건을 인수로 받은 후 필터링 조건에 맞는 강아지의 이름만 모아서 반환하는 함수를 작성해보자.

```javascript
onst dogs = [
  {
    이름: '맥스',
    무게: 10,
    견종: '보스턴 테리어',
    지역: '위스콘신',
    색상: '검정색',
  },
  {
    이름: '도니',
    무게: 90,
    견종: '래브라도레트리버',
    지역: '캔자스',
    색상: '검정색',
  },
  {
    이름: '섀도',
    무게: 40,
    견종: '래브라도레트리버',
    지역: '위스콘신',
    색상: '갈색',
  },
];

// 아래와 같은 함수를 만든다.
function getDogNames(dogs, filter) {
  const [key, value] = filter;
  return dogs
    .filter(dog => dog[key] === value)
    .map(dog => dog['이름']);
}

getDogNames(dogs, ['색상', '검정색']);
// ['맥스', '도니']
```

- 잘 작동하지만 제약이 심하다. 2가지 문제 발생한다.
  - 필터 함수에 제약(즉, `===` 를 사용해야 한다. 예를 들면, 무게 20kg 이하인 강아지를 찾기를 할 수 없다.)
  - `map`은 검사하는 항목만 인수로 받을 수 있다. 외부 변수를 사용할 수 없다.

- 먼저, 첫번째 문제부터 해결하자. 기준 체중보다 적게 나가는 강아지를 찾는 함수

```javascript
function getDogNames(dogs, filterFunc) {
  return dogs
  .filter(filterFunc)
  .map(dog => dog['이름'])
}

getDogNames(dogs, dog => dog['무게'] < 20);
// ['맥스']
```

- 하드 코딩 대신 필터 함수에 콜백 함수를 전달한다.
- 하지만 20과 같은 값을 하드코딩되어 있다. **즉, 변수를 사용할 때 직접 코딩해서 넣거나 유효 범위의 충돌이 없는지 확인하는 절차를 거치고 있다.**
- 부분 적용 함수를 이용해보자.

```javascript
const weightCheck = weight => dog => dog['무게'] < weight;
getDogNames(dogs, weightCheck(20));
// ['맥스']
getDogNames(dogs, weightCheck(50));
// ['맥스', '섀도']
```

- `getDogNames` 함수를 다시 작성할 필요가 없다. 재사용이 가능하고, 유효 범위 충돌이 발생할 가능성도 거의 없다.

- 커링을 사용해보자.

```javascript
const identity = field => value => dog => dog[field] === value;
const colorCheck = identity('색상');
const stateCheck = identity('지역');

getDogNames(dogs, colorCheck('갈색'));
// ['섀도']
getDogNames(dogs, stateCheck('캔자스'));
// ['섀도']
```

- 커링을 사용하면 두 개의 함수와, 두 개의 인수 집합을 제한할 필요가 없다.
- 모든 조건을 충족하거나, 최소한 하나의 조건을 충족하는 강아지를 찾는 경우

```javascript
function allFilters(dogs, ...checks) {
  return dogs
  .filter(dog => checks.every(check => check(dog)))
  .map(dog => dog['이름']);
}
allFilters(dogs, colorCheck('검정색'), stateCheck('캔자스'));
// ['도니']

function anyFilters(dogs, ...checks) {
  return dogs
  .filter(dog => checks.some(check => check(dog)))
  .map(dog => dog['이름']);
}

anyFilters(dogs, weightCheck(20), colorCheck('갈색'));
```

## 화살표 함수로 문맥 혼동을 피하라(TIP36)

- 화살표 함수를 이용해 문맥 오류를 피하는 방법을 살펴보자.
- 객체에서 `this`가 메서드에서 어떻게 작동되는지 살펴보자.

``` javascript
const validator = {
  message: '는 유효하지 않습니다.',
  setInvalidMessage(field) {
    return `${field}${this.message}`;
  },
};

validator.setInvalidMessage('도시');
// 도시는 유효하지 않습니다.
```

- `this`는 객체를 가리킨다.
- `setInvalidMessage` 메서드가 호출될 때, 함수에서 `this` 바인딩을 생성하면서 객체를 문맥에 포함시킨다.

- 문맥 다룰때 자주하는 실수를 살펴보자.
- 객체에 담긴 함수를 다른 함수의 콜백 함수로 사용하는 경우

``` javascript
const validator = {
  message: '는 유효하지 않습니다.',
  setInvalidMessages(...fields) {
    return fields.map(function (field) {
      return `${field}${this.message}`;
    });
  },
};
validator.setInvalidMessages('aa','bb')
// ["aaundefined,bbundefined"]
``` 

- 책에서는 에러 난다고 `message` 속성이 없다고 에러난다고 하는데 실행시키면 위와 같이 `undefined`를 반환한다. `this`는 전역를 바라본다.
- `map()` 메서드의 문맥에서 호출되므로 바인딩이 `validator` 객체가 아니다.

``` javascript
const validator = {
  message: '는 유효하지 않습니다.',
  setInvalidMessages(...fields) {
    return fields.map(field => {
      return `${field}${this.message}`;
    });
  },
};

validator.setInvalidMessages('도시');
// ['도시는 유효하지 않습니다.']
```

- 화살표 함수를 사용하면 문맥을 새로 바인딩하지 않아 `validator`에 바인딩 된다.


- 아래 같은 경우도 조심해야 한다. 화살표 함수는 다시 말하지만 새로 문맥을 만들지 않기 때문에 전역을 참고한다.

``` javascript
const validator = {
  message: '는 유효하지 않습니다.',
  setInvalidMessage: field => `${field}${this.message}`,
};
validator.setInvalidMessage('hi');
// "hiundefined"
```

## 결론

- 함수에 대해 살펴본 챕터였는데 생각보다 나한테는 어려웠다.
- 이해가 되지 않아 책에 있는 내용을 그대로 옮겨쓴 것도 많았다.
- 특히 부분 적용 함수, 커링은 사용을 거의 안해봐서 생소했다. 물론 테스트 코드 함수까지!
- 화살표 함수로 간략하고 가독성 좋은 코드를 작성하면 좋을 것 같다.