# 자바스크립트 코딩의 기술(시리즈 3 - 특수한 컬렉션을 이용해 코드 명료성을 극대화하라)

- 자바스크립크 코딩의 기술 책을 읽고 복습 겸 정리하는 포스팅이다.
- 시리즈 1이 시작이며 시리즈 몇까지는 갈지는 진행하면서 가늠잡아 보겠다.

## 객체를 이용해 정적인 키-값을 탐색하라(TIP10)

- 데이터에 따라 UI에 색상을 적용해야 하는 경우를 생각해보자.
- 다음 예제 코드와 같이 배열에 16진수 값을 넣었지만, 이것만으로 각각 무슨 의미인지 알 수 없다.

``` javascript
const colors = ['#d10202', '#19d836','#0e33d8'];
```

- 사용자 정보를 담은 배열처럼 구조적으로 유사하고 다른 데이터와 교체해도 괜찮은 경우와 다르게 위에서 살펴본 색상들은 각각 **다른 목적**으로, 즉 사용자에게 값을 표시하기 위해 사용한다. 적색이 첫번쨰인지 세번째인지 중요하지 않다.
- 배열이 적절하지 않고 키-값 컬렉션을 사용해야 한다면 대부분의 개발자는 객체를 선택한다.
- 원칙적으로 객체는 변화가 없고 구조화된 키-값 데이터를 다루는 경우에 유용하다. 반면에, 자주 갱신되거나 실행되기 전에는 알 수 없는 동적인 정보를 다루기에는 적합하지 않다.
- 예를 들어 색상 컬렉션을 공유한느 경우에는 객체를 선택하는것이 좋다. 데이터가 변경될 가능성이 없기 때문이다.

``` javascript
const colors = {
  red: '#d10202',
  green: '#19d836',
  blue: '#0e33d8'
}
``` 

- 설정 파일을 종종 객체로 작성하는데, **설정 파일이 런타임 전에 설정되고 단순한 정적인 정보를 담은 키-값 저장소이기때문이다.**

``` javascript
export const config = {
  endpoint: 'http://pragprog.com',
  key: 'secretkey'
}
``` 

- 객체를 프로그래밍적으로 정의하면 아래 코드와 같다.
- 함수내에세 각각 함수에서 (새로운) 객체를 생성하고 다른 함수에 넘겨준다. 이렇게 하면 조작 또는 갱신을 하지 않으므로 정적인 정보가 된다.

``` javascript
function getBill(item) {
  return {
    name: item.name,
    due: twoWeeksFromNow(),
    total: calculateTotal(item.price),
  };
}

const bill = getBill({
  name: '객실 청소',
  price: 30
});

function displayBill(bill) {
  return `${bill.name} 비용은 ${bill.total} 달러이며 납부일은 ${bill.due}입니다.`;
}
``` 

## `Object.assign()`으로 조작 없이 객체를 생성하라(TIP11)

- 객체도 배열과 마찬가지로 부수 효과로 인한 문제를 조심해야 한다.
- 객체에 무심코 필드(속성)를 추가하거나 변경하면 심각한 문제가 발생할 수 있다.
- 예를 들면, 키-값이 쌍인 여러 개인 객체가 있다.
- 객체에 기존 데이터가 있는 상태에서 새로운 필드를 추가 또는 외부 API에서 데이터를 가져와 할당하는 경우가 자주 발생한다.
- 새로운 필드, 데이터 할당되지 않는 경우는 디폴트 값으로 채운다.
- 위에 부합하게 작성한 아래코드를 보자.

``` javascript
const defaults = {
  author: '',
  title: '',
  year: 2017,
  rating: null
};

const book = {
  author: 'Joe Morgan',
  title: 'Simplifying Javascript',
};

function addBookDefaults(book, defaults) {
  const fields = Object.keys(defaults);
  const updated = {};
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    updated[field] = book[filed] || defaults[field]
  }
  return updated;
}
``` 

- 위코드는 잘 작동하지만 길다
- `Object.assign()`을 이용하면 다른 객체의 속성을 이용해서 객체를 갱신할 수 있습니다.
- 사용법은 맨처음 객체부터 적용되고 가장 나중에 전달한 객체가 맨 마지막으로 적용되면서 덮어 씌운다.


``` javascript
Object.assign(defaults, book)
// {author: "Joe Morgan", title: "Simplifying Javascript", year: 2017, rating: null}

const anotherBook = {
  title: 'Another Book', 
  year: 2016
};

Object.assign(defaults, anotherBook);
// {
//   author: 'Joe Morgan', // defaults 객체가 변경된 걸 볼 수 있다.
//   title: 'Another book',
//   year: 2016,
//   rating: null
// }

Object.assign({}, defaults, anotherBook); // 이렇게하면 빈객체가 변경되고 결과는 defaults, anotherBook 객체를 합친것과 같다.
```

- 중첩되지 않는 객체는 위와 같이 사용한다. 
- 중첩된 객체는 위와 같이 사용하며 얕은 복사로 이루어져 참조위 위치를 복사하므로 원본 또는 복사한 객체를 변경하면 둘다 변경 된다.


``` javascript
const defaultEmployee = {
  name: {
    first: '',
    last: '',
  },
  years: 0,
};

const employee = Object.assign({}, defaultEmployee);

employee.name.first = 'Joe';
defaultEmployee;

// {
//   name:
//   {
//     first: "Joe", 원본이 변경되었다.
//     last: ""
//   },
//   years: 0
// }
``` 

- 중첩된 객체를 복사하려면 중첩된 객체가 있는 경우 아래코드 `Object.assign()`를 이용한다.
- 물론 외부 라이브러리 로대시의 `cloneDeep()` 메서드를 이용해도 된다.

``` javascript
const employee2 = Object.assing(
  {},
  defaultEmployee,
  {
    name: Object.assign({}, defaultEmployee.name),
  },
);
``` 

## 객체 펼침 연산자로 정보를 갱신하라.(TIP12)

- 앞에서 살펴봤던 `Object.assign()` 에서 아쉬웠던 부분을 보충할 수 있는데 객체 펼침 연산자를 살펴보자.


``` javascript
const book = {
  title: 'Reason',
  author: 'Derek Parfit',
};

const update = { ...book, year: 1984 }
// {title: "Reason", author: "Derek Parfit", year: 1984}

//  동일한 키를 추가할 경우 마지막에 선언된 값을 사용한다,
const update2 = { ...book, title: 'Good job' }
// {title: "Good job", author: "Derek Parfit"}
``` 

- TIP11 에서 `Object.assign()`을 이용한 코드를 객체 펼침 연산자로 리팩토링 하자

``` javascript
const defaults = {
  author: '',
  title: '',
  year: 2017,
  rating: null
};

const book = {
  author: 'Joe Morgan',
  title: 'Simplifying Javascript',
};

// Object.assign({}, defaults, anotherBook);
const bookWithDefaults = { ...defaults, ...book };
// {author: "Joe Morgan", title: "Simplifying Javascript", year: 2017, rating: null}
``` 

- 중첩된 객체 복사는 역시 같은 문제(얕은 복사로 진행)가 발생한다.

``` javascript
const employee2 = Object.assing(
  {},
  defaultEmployee,
  {
    name: Object.assign({}, defaultEmployee.name),
  },
);

// 펼침 연산자로 변경
// 코드가 더 명확해지고 간결해졌다.

const employee = {
  ...defaultEmployee,
  name: {
    ...defaultEmployee.name
  }
}
```

## 맵으로 명확하게 키-값 데이터를 갱신하라(TIP13)

- 데이터 변경이 잦은 키-값 컬렉션에 맵 객체를 사용하는 방법을 살펴보자.
- 객체보다 맵을 사용할 경우 보통
  - 키-값 쌍이 자주 추가되거나 삭제되는 경우
  - 키가 문자열이 아닌 경우

- 첫째로 키-값 쌍이 자주 추가되거나 삭제되는 경우 살펴보자.
  - 반려견 입양 사이트를 예를 들어 보자.
  - 사람들이 덩치가 큰, 작은, 검정색인 등 선호하는 반려견이 다르기 때문에 강아지 목록에 필터링 기능을 추가하면 좋을 것이다.


``` javascript
const dogs =[
  {
    이름: '맥스',
    크기: '소형견',
    견종: '보스턴테리어',
    색상: '검정색'
  },
  {
    이름: '도니',
    크기: '대형건',
    견종: '래브라도레트리버',
    색상: '검정색'
  },
  {
    이름: '섀도',
    크기: '중형견',
    견종: '래브라도레트리버',
    색상: '갈색'
  }
]
``` 

- 강아지 컬렉션은 배열이다. 각 항목이 동일한 형태이므로 괜찮은 선택이다.
- 여기에 적용된 필터링 조건 목록을 담은 컬렉션이 필요하다.
- 필러팅 조건은 예를들면 키(색상), 값(검정색)을 가진 컬렉션이다.
- 이 조건 필터링을 추가하면 강아지 2마리가 있는 배열이 나온다. 세부 구현은 현재 알 필요 없다.

- **맵이 명세에 추가된 까닭을 이해하려면 같은 문제를 일반적인 객체로 해결하는 방법을 생각해봐야 한다.**


``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 
``` javascript
``` 