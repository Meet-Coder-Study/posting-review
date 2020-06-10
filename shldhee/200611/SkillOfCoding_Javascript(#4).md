# 자바스크립트 코딩의 기술(시리즈 4 - 조건문을 깔끔하게 작성하라)

- 자바스크립트 코딩의 기술 책을 읽고 복습 겸 정리하는 포스팅이다.
- 시리즈 1이 시작이며 시리즈 몇까지는 갈지는 진행하면서 가늠잡아 보겠다.

## 개요

- 이번장에서 참과 거짓에 관련된 코드를 간결하게 작성하는 방법을 알아보자.

1. **참과 거짓에 대한 기초 지식**
2. **삼항 연산자**
3. **단락 평가**

## 거짓 값이 있는 조건문을 축약하라(TIP17)

- 거짓 값과 참 값을 이용해 서로 다른 정보를 확인하는 방법을 알아보자.
- 불 자료형(`boolean type`)이라고 부르는 원시값 `true`, `false`  와 참(`truthy`) 또는 거짓(`falsy`) 값이라고 부르는것들에 대한 차이를 살펴보자.
- 우선 동등과 일치에 대해 살펴보자.

``` javascript
1 == '1' // true 동등 : 자료형이 다른 값을 비교할때 == 이용해서 동등인지 확인 가능
1 === '1' // false 일치 : 동일한 값 또는 엄격히 일치하는 값이란 값뿐만 아니라 자료형도 같은것을 말한다.
```

### 거짓값의 목록

- false
- **null**
- **0**
- NaN(숫자가아님)
- **''**
- **""**

- `[]`, `{}` 은 참이다!
- `[].length`, `Object.keys({}).length` 로 참/거짓을 판단한다.
- 정의되지 않은 키의 값을 가져오면 `undefined` 이다.

``` javascript
const employee = {
 name: 'Eric',
 equipmentTraining: true, // 장비교육이 받았는지 안받았는지
}

function listCerts(employee) {
 if (employee.equipmentTraining) { // 장비 교육 수료 후 인증서 받기
  employee.certificates = ['Equipment'];
  // 조작
  delete employee.equipmentTraining; // 인증서 받았으니 지워버렸다.
 }
 // 코드가 더 있습니다.
}
function checkAuthorization() {
 if (!employee.equipmentTraining) { // 존재하지 않으니 undefined는 false이므로 이 조건식을 통과한다.
  return '기계를 작동할 권한이 없습니다.';
 }
 return `반값습니다, ${employee.name} 님`;
}
listCerts(employee);
checkAuthorization(employee);
// '기계를 작동할 권한이 없습니다.'
```

- 객체에 정의되지 않는 키를 요청하면 `undefined`를 반환하면 원하지 않는 결과가 나왔다.
- 장비 교육 받고 인증서도 받았는데 작동할 권한이 없다고 나왔다.
- 위 문제를 해결하려면?

 1. 데이터 조작하지 않기(`equipmentTraining` 지우지 않기)
 2. 조작해야된다면 엄격할 일치(`===`) 사용하기

``` javascript
function checkAuthorization() {
 if (employee.equipmentTraining !== true) {
  return '기계를 작동할 권한이 없습니다.';
 }
 return `반값습니다, ${employee.name} 님`;
}
```

- 코드가 늘어났지만 일치를 사용해 원하는 결과를 얻을 수 있게 되었다.

## 삼항 연산자로 빠르게 데이터를 확인하라(TIP18)

- 삼항 연산자를 통해 재할당을 피하는 팁을 알아보자.

``` javascript
if (active) {
 var display = 'bold'
} else {
 var display = 'normal'
}

개선 코드
var display = active ? 'bold' : 'normal';
```

- `var`를 사용하고 `if` 을 사용했을때랑 삼항연산자로 개선한 코드다.
- 더 단순하고 예측도 가능하고, 변수 재할당도 줄일 수 있다.
- `let`,`const` 를 사용한 예제를 살펴보자.

``` javascript
const title = "과장"
if (title === '과장') {
 const permissions = ['근로시간',  '수당'];
} else {
 const permissions = ['근로시간']
}
permissions;
// Uncaught ReferenceError: permissions is not defined
```

- 새로운 변수 선언 방식은 블록 유효 범위 이므로 블록밖에서 안에 선언한 변수에 접근할 수가 없다.

-

``` javascript
const title = "과장"
let permissions;
if (title === '과장') {
 permissions = ['근로시간',  '수당'];
} else {
 permissions = ['근로시간']
}
permissions;
// ["근로시간", "수당"]
```

- 위에 예제를 작동되게 하려면  `let` 으로 변경하고 `if/else` 문앞에서 재할당을 해야 된다.
- 변수가 생성되는 시점, 잠재적인 유효 범위 충돌, 재할당 등을 불편함을 없애려면 삼항 연산자를 사용하면 된다.

``` javascript
const permissions = title === '과장' ? ['근로시간','수당'] : ['근로시간'];
```

- 훨씬 깔끔하고 예측 가능한 값이 되었다.
- 삼항 연산자를 여러개 연결해서 사용할 수 있지만 가독성이 떨어지면서 비효율적이다.

``` javascript
const permissions = title === '부장' || title === '과장' ?
     title === '과장' ?
     ['근로시간', '초과근무승인', '수당'] :
     ['근로시간','초과근무승인'] :
     ['근로시간'];


// 개선 코드
function getTimePermissions({title}) {
 if (title === '과장') {
  return ['근로시간', '초과근무승인', '수당'];
 }
 if (title === '부장') {
  return ['근로시간', '초과근무승인'];
 }
 return ['근로시간']
}

const permissions = getTimePermissions({title:'사원'});
// 근로시간
```

- 코드를 완전히 블록 외부로 분리해서 독립적인 함수로 만든다.
- 삼항 연산자는 코드를 단순화할 수 있어서 사용할 만한 가치가 있는 경우에만 쓴다.
- 사용할 만한 가치가 없다고 생각되면 `if` 문으로 돌아가는것이 좋다.

## 단락 평가를 이용해 효율성을 극대화하라(TIP19)

- 이번에는 단락 평가를 이용해 조건문을 가장 짧은 표현식으로 줄여보자.
- 단락 평가는 가장 타당한 정보를 먼저 위치시켜서 정보 확인을 건너뛰는것이다.
- `||` 으로 작성하는 `OR`연산자는 선택 가능한 값 중 하나라도 `true` 이면 `true` 반환

``` javascript
const name = 'joe' || 'I have no name';
name;
// 'joe'
```

- `&&` 으로 작성하는 `AND` 연산자는 거짓값이 발생하는 즉시 중단

``` javascript
const name = false && 'I have no name';
name;
// false
```

- 단락 평가를 사용하는 예제를 살펴보자.

``` javascript
function getIconPath(icon) {
 const path = icon.path ? icon.path : 'uploads/defaults.png';
 return `https://assets.foo.com/${path}`
}

const icon = {
 path: 'acme/bar.png'
}

getIconPath(icon);
// "https://assets.foo.com/acme/bar.png"
```

- 위 코드는 `icon.path`를 2번 확인한다.
- `||` 연산자를 사용해보자.

``` javascript
function getIconPath(icon) {
 const path = icon.path || 'uploads/defaults.png';
 return `https://assets.foo.com/${path}`
}
```

- 단락 평가의 가장 좋은 부분은 표현식 끝에 기본값을 추가할 수 있는 점이다.
- 단락 평가의 다른 좋은 점은 바로 오류를 방지하는 것이다.

``` javascript
const userConfig1 = {};
const userConfig2 = {
 images: []
};
const userConfig3 = {
 images: [
  'me.png',
  'work.png'
 ]
};

// 원하는 값을 가져올떄 || 연산자를 사용, 이때 속성이 정의되지 않는 경우
const img = userConfig1.images[0] || 'default.png';
// image 속성이 없으므로 에러 발생
// Uncaught TypeError: Cannot read property '0' of undefined

// 수정하기 위해서는 여러 번 중첩된 조건문을 사용해야 한다.
function getFirstImage(userConfig) {
 let img = 'default.png';
 if (userConfig.images) {
  img = userConfig.images[0];
 }
 return img
}

// 위 코드는 잘작동하지만 배열(images)에 항목이 없으면 undefined 반환
getFirstImage(userConfig2);
// undefined

// 해결하기 위해 조건문을 한번 더 중첩한다.
function getFirstImage(userConfig) {
 let img = 'default.png';
 if (userConfig.images) {
  if(userConfig.images.length) {
   img = userConfig.images[0];
  }
 }
 return img
}
```

- 코드의 가독성과 아름다움이 모두 사라졌습니다.....
- `&&` 연산자를 이용해 수정해보자.

``` javascript
function getImage(userConfig) {
 if (userConfig.images && userConfig.images.length > 0) {
  return userConfig.images[0];
 }
 return 'default.png'
}

// 삼항연산자 사용
function getImage(userConfig) {
 const images = userConfig.images;
 return images && images.length ? images[0] : 'default.png';
}
```

- 역시 삼항연산자처럼 짧은 수록 좋긴 하지만 코드가 가독성이 나빠지고 이해하기 어려우면 간단 명료하게 하는것이 더 좋다.

## 결론

- 조건문을 나열 또는 삼항연산자로 사용할때 상황을 잘 구분하자.
- 코드를 줄이는 것도 좋지만 가장 중요한건 코드를 통한 의사소통과 가독성임을 잊지 말자.
