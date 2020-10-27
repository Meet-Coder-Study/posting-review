# 자바스크립트 코딩의 기술(시리즈 5 - 반복문을 단순하게 만들어라(2/2))

- 자바스크립트 코딩의 기술 책을 읽고 복습 겸 정리하는 포스팅이다.
- 시리즈 1이 시작이며 시리즈 몇까지는 갈지는 진행하면서 가늠잡아 보겠다.

## 개요

- 데이터를 순회할 때 사용하는 배열메서드를 알아보자.
- 여태까지 `for`문만 사용했으면 이제 적합한 도구(배열메서드)를 사용해보자.

## `forEach()`로 동일한 동작을 적용하라.(TIP24)

- `forEach()` 메서드를 이용해 배열의 각 항목에 동작을 적용하는 방법을 살펴보자.
- `map(), filter(), find()`와 달리 `forEach()`는 배열을 전혀 변경하지 않는다.
- 대신, 모든 항목에 동일한 동작을 수행 한다.
- 회원들에게 이메일로 초대장을 보내는 예제 코드를 보면서 살펴보자.

```javascript
const sailingClub = ['Lee', 'Andy', 'Kim', 'Mike', 'Song'];

for (let i = 0; i < sailingClub.length; i++) {
  sendEmail(salingClub[i]); // sendEmail 함수는 메일을 보내는 로직인데 세부구현은 알 필요 없다.
}
```

- 사실 이 코드보다 간단하게 만들기는 어렵다.
- `forEach()`가 가치 있는 이유는 다른 메서드처럼 코드를 단순하게 만들기 때문이 아니고
  1. 다른 배열 메서드와 같이 작동하면서 함께 연결 할 수 있다.(체이닝)
  2. 예측가능하다.
- `forEach()`를 사용할 때 외부에 영향을 주는, 즉 부수효과가 있는 코드를 작성해야 합니다.

```javascript
const names = ['walter', 'white'];
const capitalized = names.forEach((name) => name.toUpperCase());

capitalized;
// undefined
```

- 위 코드는 실행해도 아무런 변화가 없다. 왜냐하면 `forEach()` 메서드 안에서 부수 효과가 없다, 즉 함수 외부에 영향을 주지 않는다.

```javascript
const names = ['walter', 'white'];
let capitalized = [];
names.forEach((name) => capitalized.push(name.toUpperCase()));

capitalized;
// ['WALTER', 'WHITE']
```

- 위 코드처럼 빈배열 생성하고 `forEach()`문안에서 결과를 담으면 되지만 배열을 직접 조작하는 방법은 좋지 않고 또 `map()` 메서드를 이용해 처리 가능하다.

```javascript
sailingClub.forEach((member) => sendEmail(member));
```

- 위 코드는 이메일을 보내는 것은 부수 효과(사이드 이펙트)지만, 데이터를 조작하지 않습니다.
- 이럴때 `forEach()`를 사용하면 약간의 예측 가능성을 얻을 수 있다.
- 다음 팁에서는 `forEach()`의 다른 이점인 체이닝을 이용해 여러 동작을 하나의 프로세스로 결합하는 방법을 살펴보자.

## 체이닝으로 메서드를 연결하라.(TIP25)

- 이번에는 체이닝(chaining)으로 여러 배열 메서드를 연결해 실행하는 방법을 살펴보자.
- 체이닝을 간단히 정의하면, 값을 다시 할당하지 않고 반환된 객체에 메서드를 즉시 호출하는 것을 의미한다.
- 앞에 살펴봤던 회원들에게 메일 보내는 예제를 통해 알아보자.
  - 회원정보를 담은 배열은 더 다양한 데이터가 담겨 있을테지만 여기서는 이름, 활동 여부, 이메일만 추가했다.

```javascript
const sailors = [
  {
    name: 'yi hong',
    active: true,
    email: 'yh@hproductions.io',
  },
  {
    name: 'alex',
    active: true,
    email: '',
  },
  {
    name: 'nate',
    active: false,
    email: '',
  },
];
```

- 우선 활동 하고 있는 사람을 추려보자.

```javascript
const active = sailors.filter((sailor) => sailor.active);
```

- 그 다음 이메일을 가지고 있으면 해당 이메일을 사용하고, 없으면 기본 이메일 주소를 사용한다.

```javascript
const emails = active.map(
  (member) => member.email || `${member.name}@wiscsail.io`
);
```

- 마지막으로 이메일을 보낸다.

```javascript
emails.forEach((sailor) => sendEmail(sailor));
```

- 위 코드들은 결과값을 계속 변수에 할당했다.
- 체이닝을 사용하면 변수에 할당하는 과정이 생략된다.
- `forEach()` 메서드는 배열을 반환하지 않으므로 가장 마지막에 사용해야 한다.

```javascript
sailors
  .filter((sailor) => sailor.active)
  .map((sailor) => sailor.email || `${sailor.name}@wiscsail.io`)
  .forEach((sailor) => sendEmail(sailor));
```

- 체이닝에 단점은 새로운 메서드를 호출할때마다 반환된 배열 전체를 다시 반복한다는 점이다.
- `for`문을 이용할 경우 `name, active, email`을 각 한 번씩해서 총 3번 반복하면 된다.
- 하지만 체이닝을 사용할 경우, `filter()`에서 3번, `map()`에서 2번, `forEach()`에서 2번 총 7번을 반복한다.
- 대규모 데이터를 다루지 않는 이상 그리 중요하진 않다.
- 다음 팁에서는 `reduce()` 메서드를 배워보자.

## `reduce()`로 배열 데이터를 변환하라.(TIP26)

- `reduce()` 메서드는 원본 배열과는 크기(길이)와 형태가 다른 새로운 배열을 생성한다.
- 배열을 이용해 다른 새로운 자료구조 데이터를 만들어야 할때 사용한다.
- 예제를 통해 알아보자.

```javascript
const callback = function(collectedValues, item) {
  return [...collectedValues, item]; // 누적된 값을 반환하는 반환값
};

const saying = ['veni', 'vedi', 'veci'];
const initialValue = [];
const copy = saying.reduce(callback, initialValue); // 콜백함수, 기본값을 받는다.
copy; // ['veni', 'vedi', 'veci'];
```

- 콜백함수의 `return [...collectedValues, item]` 이 부분을 계속 누적하면서 반환한다.
  1. 첫 순회때는 `collectedValues`의 값은 `initialValue`이다.
  2. 따라서 첫 순회때 return 값은 [...[], 'veni'] 이다.
  3. 2번째 순회때는 `collectedValues`의 값은 `[...[], 'veni']` 이므로
  4. 따라서 두번재 순회때 return 값은 [...[...[], 'veni'], 'vedi'] 이다.
  5. 3번째 역시 2번째랑 같은 원리이다.
  6. 결국 마지막 반환값은 `['veni', 'vedi', 'veci']`이다.

* 강아지 입양 사이트에 사용할 컬렉션에서 고윳값을 분류해 보는 예제를 통해 더 알아보자.

```javascript
const dogs = [
  {
    이름: '맥스',
    크기: '소형견',
    견종: '보스턴테리어',
    색상: '검정색',
  },
  {
    이름: '도니',
    크기: '대형건',
    견종: '래브라도레트리버',
    색상: '검정색',
  },
  {
    이름: '섀도',
    크기: '중형견',
    견종: '래브라도레트리버',
    색상: '갈색',
  },
];

// 위 자료구조를 아래와 같이 나타내보는 코드
//  ["검정색", "갈색"]
```

- 원하는 고윳값이 색상일때 `reduce()` 메서드를 사용해 살펴보자.

```javascript
const colors = dogs.reduce((colors, dog) => {
  if (colors.includes(dog['색상'])) {
    return colors;
  }
  return [...colors, dog['색상']];
}, []);

console.log(colors); //  ["검정색", "갈색"]
```

- `reduce()` 메서드는 맨 뒷부분부터 보면 결과값 예측이 가능하다. 여기선 `return [...colors, dog['색상']];` 부분이다.
- 첫행에 `colors` 매개변수는 콜백의 반환값을 누적한 값이다. , 6행의 `[]` 정의를 내리지 않았으면 `dogs`의 첫번째 요소를 사용한다.
- 5행 누적값을 반환하는 코드가 없으며 에러가 발생한다.
- `reduce()`를 이용해 데이터의 일분를 반환해 크기(길이)를 변경했고, 형태도 변경했다.

* 강아지 객체의 모든 키에 대해 고윳값을 뷴류하면 어떻게 해야 될까?
* `map()` 메서드를 여러 번 실행하는 방법도 있지만 간단한 방법 `reduce()`를 사용해보자.

```javascript
const filters = dogs.reduce(
  (filters, item) => {
    filters.breed.add(item['견종']);
    filters.size.add(item['크기']);
    filters.color.add(item['색상']);
    return filters;
  },
  {
    breed: new Set(),
    size: new Set(),
    color: new Set(),
  }
);

// {breed: Set(2), size: Set(3), color: Set(2)}
//  breed: Set(2) {"보스턴테리어", "래브라도레트리버"}
//  color: Set(2) {"검정색", "갈색"}
//  size: Set(3) {"소형견", "대형건", "중형견"}
```

- `Set()`(고유 항목만 남기는 컬렉션)을 사용해 중복된 값들을 없앤다.

* 개발자들이 있는 정보로 언어별로 몇명인지 세는 코드를 살펴보자.

```javascript
const developers = [
  {
    name: 'Jeff',
    language: 'php',
  },
  {
    name: 'Ashley',
    language: 'python',
  },
  {
    name: 'Sara',
    language: 'python',
  },
  {
    name: 'Joe',
    language: 'javascript',
  },
];

const aggregated = developers.reduce((specialities, developer) => {
  const count = specialities[developer.language] || 0;
  return {
    ...specialities,
    [developer.language]: count + 1,
  };
}, {});

console.log(aggregated);
// {php: 1, python: 2, javascript: 1}
```

- 배열메서드는 훌륭하지만 `for in, for of`를 사용하는 경우도 있다., 다음팁에서 알아보자.

## `for...in`, `for...of`문으로 반복문을 정리하다.(TIP27)

- `for...in`문을 이용한 이터러블에 대한 반복문과 `for...of`문을 이용한 객체에 대한 반복문을 통해 반복문의 명료성을 유지하는 방법을 살펴보자.

- 필요한 결과와 일치하지 않을 때와 자료구조가 배열이 아닌 경우에는 배열메서드를 사용할 필요가 없을 수도 있다.(컨벤션마다 다르다. 어디서는 배열메서드를 사용하라고하고, 어디서는 `for...of, for...in`문을 사용하라고 한다.)

* 아래 코드는 사용자가 회사를 선택하면 정보를 추가, 삭제하는 작업이므로 맵을 사용하면 쉽게 처리할 수 있다. 이 코드를 통해 `for...in, for...of`를 살펴보자.

```javascript
const firms = new Map()
  .set(10, 'Zoom')
  .set(23, 'Apple')
  .set(33, 'Google');

// Map(3) {10 => "Zoom", 23 => "Apple", 33 => "Google"}
```

- `isAvailable()` 함수는 이용할 수 있는 회사인지 체크하는 코드인데 자세한 내용은 알 필요 없다.
- 이제 선택한 회사들 모두 서비스를 사용할 수 있는지, 없는지 확인해보는 코드를 살펴보자.
- 만약 하나라도 사용할 수 없다면 사용할 수 없는 회사만 사용할 수 없다는 메세지를 반환한다.

```javascript
function checkConflicts(firms, isAvailable) {
  // START:loop
  const entries = [...firms];
  for (let i = 0; i < entries.length; i++) {
    const [id, name] = entries[i];
    if (!isAvailable(id)) {
      return `${name}는 사용할 수 없습니다`;
    }
  }
  return '모든 회사를 사용할 수 있습니다';
  // END:loop
}

function checkConflicts(firms, isAvailable) {
  // START:reduce
  const message = [...firms].reduce((availability, firm) => {
    const [id, name] = firm;
    if (!isAvailable(id)) {
      return `${name}는 사용할 수 없습니다`;
    }
    return availability;
  }, '모든 회사를 사용할 수 있습니다');
  return message;
  // END:reduce
}
```

- 위 코드는 간단한 반복문이다. 맵을 배열로 변환했으므로 배열 메서드를 사용해보자.
- 하지만 적합한 배열 메서드가 없는데 우선 `find()` 메서드를 사용해보자.

```javascript
function findConflicts(firms, isAvailable) {
  // START:find
  const unavailable = [...firms].find((firm) => {
    const [id] = firm;
    return !isAvailable(id);
  });

  if (unavailable) {
    return `${unavailable[1]}는 사용할 수 없습니다`;
  }

  return '모든 회사를 사용할 수 있습니다';
  // END:find
}
```

- 다음은 `reduce()` 메서드를 사용해보자.

```javascript
function checkConflicts(firms, isAvailable) {
  // START:reduce
  const message = [...firms].reduce((availability, firm) => {
    const [id, name] = firm;
    if (!isAvailable(id)) {
      return `${name}는 사용할 수 없습니다`;
    }
    return availability;
  }, '모든 회사를 사용할 수 있습니다');
  return message;
  // END:reduce
}
```

- 문제점들은 우선 `find()` 메서드는 2단계를 거쳐야 된다. 이용할 수 없는 회사를 체크, 메시지를 반환
- `reduce()` 메서드는 가독성이 떨어진다.
- 그리고 `find()`는 이용불가능한 회사 중에 첫번째 회사만 찾을 수 있고, `reduce()`는 마지막 회사만 찾을 수 있다.

* 맵에는 펼침 연산자를 사용할 수 있게 해주는 **맵이터레이터**가 존재한다.
* `for...of`문으로 이터레이터 사용이 가능하므로 살펴보자.

```javascript
function checkConflicts(firms, isAvailable) {
  // START:for
  for (const firm of firms) {
    const [id, name] = firm;
    if (!isAvailable(id)) {
      return `${name}는 사용할 수 없습니다`;
    }
  }
  return '모든 회사를 사용할 수 있습니다';
  // END:for
}
```

- 맵을 배열로 바꾸는 작업을 하지 않아도 된다.
- 문제는 반복문으로 무엇이든 할 수 있으므로 예측 가능성이 떨어진다.(하지만 배열메서드에서도 조작은 가능하다.)
- 따라서, 배열메서드와 `for...of`는 적재적소에 잘 사용하면 된다.

* 그리고 `for...of`와 비슷한 `for...in`을 알아보자.
* `for...in`은 키-값 객체에서만 작동한다.
* 객체에 필요한 작업을 할때 `Object.keys()`를 이용해 배열을 생성하여 객체의 속성을 순회한다.
* 하지만 `for...in` 사용하면 바로 키사용이 가능하다.

```javascript
const firms = {
  '10': 'Zoom',
  '23': 'Apple',
  '33': 'Google',
};

function checkConflicts(firms, isAvailable) {
  // START:for
  for (const id in firms) {
    if (!isAvailable(parseInt(id, 10))) {
      return `${firms[id]}는 사용할 수 없습니다`;
    }
  }
  return '모든 회사를 사용할 수 있습니다';
  // END:for
}
```

- 배열 표기법으로 접근이 가능한데 키를 정수로 사용하려면 `parseInt()`를 사용해야 한다.
  ![ArrayDisplay](https://user-images.githubusercontent.com/20432185/85911491-8b337d00-b860-11ea-9f3e-ae586fe4f26f.png)
- `for...in`도 `for...of`와 마찬가지로 `Object.keys()`와 잘 비교해서 적재적소에 사용해야 한다.

## 결론

- 이로써 배열메서드에 관한 내용이 마무리되었다.
- 배열메서드를 자유자재로 사용할 수 있으면 모던스크립트를 반은 할 수 있다고 말해도 될것 같다.
- 여러 자료구조(컬렉션)을 바탕으로 연습해보자.
