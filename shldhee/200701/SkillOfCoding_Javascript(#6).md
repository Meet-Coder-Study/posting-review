# 자바스크립트 코딩의 기술(시리즈 6 - 매개변수와 return 문을 정리하라)

- 자바스크립트 코딩의 기술 책을 읽고 복습 겸 정리하는 포스팅이다.
- 시리즈 1이 시작이며 시리즈 몇까지는 갈지는 진행하면서 가늠잡아 보겠다.

## 개요

- 함수 인수를 변경하는 계획을 세워보고, 간결하면서 유연성을 제공하는 매개변수를 생성하는 방법을 알아보자.
- 예를 들면, 함수는 인수 2개를 받고 있었는데 갑자기 받을 인자가 늘어 6개의 인자를 받게 될 경우 대처하는 방법 등을 살펴보자.

## 매개변수 기본값을 생성하라(TIP28)

- 이번 팁에서 매개변수가 채워져 있지 않을 때 매개변수 기본값으로 값을 설정하는 방법을 알아보자.
- 파운드(pound)를 킬로그램(kilogram)으로 변환하는 코드를 보면서 알아보자.
  - pound를 2.2로 나눠야 kilogram으로 변환된다.

```javascript
function convertWeight(weight) {
  return weight / 2.2;
}
```

- 온스(ounce)도 변환해야 한다는 요구사항이 생겼다.
  - ounce는 1pound === 16ounce 이므로 ounce / 16으로 계산한다.

```javascript
function convertWeight(weight, ounces) {
  const oz = ounces ? ounces / 16 : 0;
  const total = weight + oz;
  return total / 2.2;
}

convertWeight(44, 11);
// 20.3125
convertWeight(44, 8);
// 20.227272727272727
convertWeight(6, 9.6);
// 2.9999999999999996
```

- `convertWeight(6, 9.6);` 를 실행하면 `3`이 나와야 되는데 `2.999999...`가 나온다.
  - `9.6 / 16 = 0.6`이므로 6.6 / 2.2는 3이다.
  - 3이 나오지 않는 이유는 `부동 소수점 연산` 때문이다. [부동 소수점 참고](https://steemit.com/kr/@modolee/floating-point)
  - 따라서 반올림을 해줘야 한다. 반올림을 해야하니 소수점은 2자리까지 표시할 것이다.

```javascript
function roundToDecimalPlace(number, decimalPlaces) {
  const round = 10 ** decimalPlaces;
  console.log(round);
  console.log(number * round);
  console.log(Math.round(number * round));
  return Math.round(number * round) / round;
}

roundToDecimalPlace(30.8412, 2);
// 100
// 3084.12
// 3084
// 30.84
roundToDecimalPlace(30.8452, 2);
// 100
// 3084.52
// 3085
// 30.85

function convertWeight(weight, ounces, roundTo) {
  const oz = ounces / 16 || 0;
  const total = weight + oz;
  const conversion = total / 2.2;

  // const round = roundTo || 2;-> 이 방법이 있지만 roundTo가 0이라면 false이므로 2를 반환한다.
  const round = roundTo === undefined ? 2 : roundTo; // 따라서 undefined를 명시적으로 표기한다.

  return roundToDecimalPlace(conversion, round);
}
```

- 위와 같이 코드를 작성하면 잘 동작한다. 하지만, 정의되지 않은 변수(매개변수)로 인해 발생하는 삼항 연산자나 단락 평가때문에 코드가 길어졌다.
- 이 부분은 매개변수에 기본값을 할당하면 더 효율적이고 가독성이 좋은 코드가 된다.

```javascript
function convertWeight(weight, ounces = 0, roundTo = 2) {
  const total = weight + ounces / 16;
  const conversion = total / 2.2;

  return roundToDecimalPlace(conversion, roundTo);
}
```

- 매개변수에 타입도 확인 가능하다.
- 하지만, 매개변수 기본값 사용시 단점이 있다. 바로 사용하지 않고 싶은 매개 변수도 순서대로 입력해야 한다.

```javascript
function convertWeight(weight, ounces = 4, roundTo = 2) {
  // ...
}
convertWeight(4, 0, 2);
// undefined를 입력하면 기본값(4)을 사용하지만 잘못해서 null을 입력하게되면 null를 반환한다.
convertWeight(4, undefined, 2);
convertWeight(4, null, 2);
```

- 이 문제를 해결하기 위해서는 매개변수를 객체로 전달하는 것이다.
- 다음 팁에서 살펴보자.

## 해체 할당으로 객체 속성에 접근하라.(TIP29)

- 해체 할당으로 객체와 배열에서 정보를 빠르게 가져오는 방법을 살펴보자.

```javascript
const landscape = {
  title: 'Landscape',
  photographer: 'Nathan',
  equipment: 'Canon',
  format: 'digital',
  src: '/landscape-nm.jpg',
  location: [32.7122222, -103.1405556],
};
```

- 위 객체에서 특정 속성들을 순서에 따라 보여지고 나머지 속성들을 나열하고 싶을때(아래 HTML 코드를 반환) 어떻게 할까?

```html
<img alt="Landscape 사진 Nathan 촬영" src="/landscape-nm.jpg" />
<div>Landscape</div>
<div>Nathan</div>
<div>위도: 32.7122222</div>
<div>경도: -103.1405556</div>
<div>
  equipment: Canon <br />
  format: digital
</div>
```

- 아래 코드처럼 `photo`라는 객체를 매개변수로 하고 `photo.key` 이런식으로 속성에 하나하나 점표기법으로 접근해야 한다.
- 과도한 정보를 다룰때는 순서를 정할 속성들을 변수로 선언하고, 이 속성들을 객체에서 제거한다. 그리고 나중에 객체를 나열하게되면 모든 정보를 나열할 수 있다.

```javascript
function displayPhoto(photo) {
  const title = photo.title;
  const photographer = photo.photographer || 'Anonymous';
  const location = photo.location;
  const url = photo.src;

  const copy = { ...photo };
  delete copy.title;
  delete copy.photographer;
  delete copy.location;
  delete copy.src;

  const additional = Object.keys(copy).map((key) => `${key}: ${copy[key]}`);

  return `
    <img alt="${title} 사진 ${photographer} 촬영" src="${url}" />
    <div>${title}</div>
    <div>${photographer}</div>
    <div>위도: ${location[0]} </div>
    <div>경도: ${location[1]} </div>
    <div>${additional.join(' <br/> ')}</div>
  `;
}
```

- 위 코드의 2/3를 객체에서 정볼르 가져오는데 할애하고 있다.
- 위 코드를 개선 시키기전에 `해체 할당`이라는 것을 알아보자.

```javascript
const landscape = {
  photographer: 'LEE',
};
const { photographer } = landscape;

console.log(photographer);
// LEE
```

- 객체에 있는 키와 같은 이름의 변수를 생성(`photographer`)
- 객체에 있는 키에 연결된 값을 생성한 변수의 값으로 할당
- 할당하는 변수와 키의 값이 **무조건 일치**해야 한다.
- 만약 키가 존재하지 않으면?

```javascript
const landscape = {
  photographer: 'LEE',
};
const { photographer, title, size = 100 } = landscape;

console.log(photographer);
// LEE
console.log(title);
// undefined
console.log(size);
// 100
```

- 키가 존재 하지 않으면 `undefined`를 반환
- 해체 할당하면서 기본값을 할당 수 있다.(`size`)
- 만약 키 이름을 모를경우, 해체 할당에서 어떻게 가져올 수 있을까?

```javascript
const landscape = {
  photographer: 'LEE',
  location: 'seoul',
  date: '2020-07-01',
};
const { photographer, ...additional } = landscape;

console.log(photographer);
// LEE
console.log(additional);
// {location: "seoul", date: "2020-07-01"}
```

- `...` 펼침 연산자(`spread operator`)랑 똑같은데 여기서는 나머지 매개변수(`rest parameter`)라고 부른다.
- 나머지 매개변수를 사용하면 아까 위에서 본 맨 처음 코드와 같은 사진 객체를 복사한 후 `photographer` 키를 삭제한것과 같다.

```javascript
const copy = { ...landscape };
delete copy.photographer;

const additional = Object.keys(copy).map((key) => `${key}: ${copy[key]}`);
```

- 여태까지 변수의 이름을 키값으로 사용했지만 변수의 이름을 변경할 수 있다.

```javascript
const landscape = {
  src: '/land.jpg',
};
const { src: url } = landscape;

console.log(src);
// error VM2117:6 Uncaught ReferenceError: src is not defined
console.log(url);
// /land.jpg
```

- **배열에도 해체 할당이 가능합니다.**
- 대신 배열에는 키 값이 없기 때문에, 배열에 담긴 순서대로 할당해야 한다.

```javascript
const customLocation = ['32', '127'];
const [latidute, longtitude] = customLocation;

console.log(latidute);
// '32'
console.log(longtitude);
// '127'
```

- 처음 코드를 객체 해체 할당으로 정리해보면 아래와 같다.

```javascript
function displayPhoto(photo) {
  const {
    title,
    photographer = 'Anonymous',
    location: [latitude, longitude],
    src: url,
    ...other
  } = photo;
  const additional = Object.keys(other).map((key) => `${key}: ${other[key]}`);
  return `
    <img alt="${title} 사진 ${photographer} 촬영" src="${url}" />
    <div>${title}</div>
    <div>${photographer}</div>
    <div>위도: ${latitude} </div>
    <div>경도: ${longitude} </div>
    <div>${additional.join(' <br/> ')}</div>
  `;
}
```

- 해체 할당의 가장 큰 장점은 해체 할당을 함수의 매개변수에 적용할 수 있다는 것이다.
- 대신 매개변수에 적용하게되면 `const` 대신 `let`으로 선언하므로 재할당이 가능해진다.
- 아래 코드는 매개변수에 해체 할당을 적용한 것이다.

```javascript
function displayPhoto({
  title,
  photographer = 'Anonymous',
  location: [latitude, longitude],
  src: url,
  ...other
}) {
  const additional = Object.keys(other).map((key) => `${key}: ${other[key]}`);
  return `
    <img alt="${title} 사진 ${photographer} 촬영" src="${url}" />
    <div>${title}</div>
    <div>${photographer}</div>
    <div>위도: ${latitude} </div>
    <div>경도: ${longitude} </div>
    <div>${additional.join(' <br/> ')}</div>
  `;
}
```

## 키-값 할당을 단순화하라.(TIP30)

- 축약한 키-값 할당을 이용해 객체를 빠르게 만드는 방법을 살펴보자.
- 위도, 경도를 가지고 지역 정보를 조회하고 새로운 객체를 만들어 보자.

```javascript
const landscape = {
  title: 'Landscape',
  photographer: 'Nathan',
  location: [32.7122222, -103.1405556],
};

getRegion(location); // 위경도를 매개변수로 사용하여 아래 region을 반환, 이함수는 자세히 몰라도 된다.

const region = {
  city: 'Hobbs',
  county: 'Lea',
  state: {
    name: 'New Mexico',
    abbreviation: 'NM',
  },
};

function getCityAndState({ location }) {
  const { city, state } = determineCityAndState(location);
  return {
    city,
    state: state.abbreviation,
  };
  // {
  //   city: 'Hobbs',
  //   state: 'NM'
  // }
}
```

- 만약 객체에서 한 가지 정보만 제거하고 나머지는 그대로 유지하고 싶다면?

```javascript
function setRegion({ location, ...details }) {
  const { city, state } = determineCityAndState(location);
  return {
    city,
    state: state.abbreviation,
    ...details,
  };
}

setRegion(landscape);
//
{
  title: 'Landscape',
  photographer: 'Nathan',
  city: 'Hobbs',
  state: 'NM'
}

```

- `location`을 빼서, 나머지 매개변수를 사용하면 `location` 정보만 제거 된다.

## 나머지 매개변수로 여러 개의 인수를 변수로 전달하라.(TIP31)

- 나머지 매개변수(`rest parameter`)를 이용해 개수를 알 수 없는 다수의 매개변수를 전달하는 방법을 살펴보자.
- 사진 앱으로 예를 들어보자. 사진 태그의 길이를 일정 수준으로 제한두고자 한다.
- 아래 코드는 제한 크기, 태그 배열을 매개변수로 받는 함수이다.

```javascript
function validateCharacterCount(max, items) {
  return items.every((item) => item.length < max);
}

validateCharacterCount(10, ['Hobbs', 'Eagles']);
// true
```

- `items.length`가 `max`보다 모두 작으면 `true`를 반환하는 `every`메서드를 사용한 함수이다.
- 이 함수의 단점은 `items`의 컬렉션 형식을 강제한다.(배열) 예를 들어 `'Hobbs'대신 ['Hobbs']`로 전달해야 한다.
- 이문제는 `arguments` 객체를 이용해 해결할수 있는데 아래 코드와 같다.

```javascript
function getArguments() {
  return arguments;
}
getArguments('Bloomsday', 'June 16');
// { '0': 'Bloomsday', '1': 'June 16' }

function validateCharacterCount(max) {
  console.log(arguments);
  // Arguments(2) [10, "wvoquie", callee: ƒ, Symbol(Symbol.iterator): ƒ]
  const items = Array.prototype.slice.call(arguments, 1);
  console.log(items);
  // ["wvoquie"]
  return items.every((item) => item.length < max);
}

validateCharacterCount(10, 'wvoquie');
// true

const tags = ['Hobbs', 'Eagles'];
validateCharacterCount(10, ...tags);
// true
```

- `arguments`는 유사배열이므로 배열로 변환한 다음 배열 메서드를 호출했다.
- 전달할 변수가 이미 배열이라면 펼침 연산자를 사용한다.(`...tags`)
- 작동을 잘 되지만, `arguments` 객체를 다루기 떄문에 문법이 난해하고, 가독성도 좋지 않다.
- 나머지 매개변수(`rest parameter`)를 사용해 개선해보자.

```javascript
function getArguments(...args) {
  return args;
}
getArguments('Bloomsday', 'June 16');
// ['Bloomsday', 'June 16']

function validateCharacterCount(max, ...items) {
  return items.every((item) => item.length < max);
}

validateCharacterCount(10, 'wvoquie');
// true

validateCharacterCount(10, ...['wvoquie']);
// true

const tags = ['Hobbs', 'Eagles'];
validateCharacterCount(10, ...tags);
// true

// true
validateCharacterCount(10, 'Hobbs', 'Eagles');
```

- 단순, 간결해지고 예측가능성이 높아졌다.
- 함수를 보자마자 최소 2개 이상의 인수를 받을 수 있다는 것을 알 수 있다.
- **나머지 매개변수**를 사용하는 이유

  1. 인수를 배열로 다루는 것을 다른 개발자들한테 알리는 경우
  2. 코드 디버깅에 좋다.(추가 매개변수를 가져오는 것으로 의심되는 라이브러리 함수를 해석하는데 도움이 된다., 길데 나열된 인수 확인이 가능하다.)
     - 아래 예제에서 `map()` 메서드에서 나머지 매개변수를 사용하여 추가 인수를 확인해보자.
     ```javascript
     function debug() {
       ['Spirited Away', 'Princess Mononoke'].map((film, ...other) => {
         console.log(other);
         return film.toLowerCase();
       });
       // [0, ['Spirited Away', 'Princess Mononoke']]
       // [1, ['Spirited Away', 'Princess Mononoke']]
     }
     ```
  3. 나머지 인수는 함수 간에 속성을 전달하면서 해당 속성을 조작할 필요가 없을때 사용하면 좋다.

     - 아래 예제는 여러 개의 함수를 감싸서 인수를 전달하는 코드이다. 정보를 업데이트하면서 모달창을 닫는 작업이다.

     ```javascript
     function applyChanges(...args) {
       updateAccount(...args);
       closeModal();
     }

     applyChanges(name, age);
     ```

- 나머지 매개변수만을 위한 것은 아니다.
- 키-값 쌍이나, 배열에 담긴 나머지 값을 가져올때 사용이 가능하다.

```javascript
function shift() {
  const queue = ['stop', 'collaborate', 'listen'];
  const [first, ...remaining] = queue;
  first;
  // 'stop'
  remaining;
  // ['collaborate', 'listen'];
  return [first, remaining];
}
```

- `shift()` 배열 메소드 대신 위와 같이 사용이 가능하다.
- 첫번째 요소만 반환한 후 제거한다.
- 단점은 나머지 매개변수를 언제나 **마지막 인수에만 사용**해야한다.

```javascript
const [...beginnig, last] = ['chobo', 'joong su','go su'];
// Uncaught SyntaxError: Rest element must be last element
```

## 결론

- 매개변수 기본값을 사용하면 단락평가, 삼항연산자를 줄일 수 있어 더 간결해지고 직관적이다.
- 해체 할당으로 객체의 값을 키값과 동일한 변수명으로 할당이 가능하다.
- 펼침 연산자, 나머지 매개변수는 사용하는 형태는 똑같으나 사용하는 용도는 다르니 잘 구별해야 한다.
  - 무의식적으로 사용하고 있지만 다시 한번 용어 공부를 할 필요성을 느꼈다.
