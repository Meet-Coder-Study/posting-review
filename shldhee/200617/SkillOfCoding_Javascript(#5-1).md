# 자바스크립트 코딩의 기술(시리즈 5  - 반복문을 단순하게 만들어라(1/2))

- 자바스크립트 코딩의 기술 책을 읽고 복습 겸 정리하는 포스팅이다.
- 시리즈 1이 시작이며 시리즈 몇까지는 갈지는 진행하면서 가늠잡아 보겠다.

## 개요

- 데이터를 순회할 때 사용하는 배열메서드를 알아보자.
- 여태까지 `for`문만 사용했으면 이제 적합한 도구(배열메서드)를 사용해보자.

## 화살표 함수로 반복문을 단순하게 만들어라(TIP20)

- 화살표 함수(`=>`)를 이용해 관련 없는 정보(기존 함수에서)를 제거하는 방법을 알아보자.
- 필요없는 정보
  - `function` 키워드
  - 인수를 감싸는 괄호
  - `return` 키워드
  - 중괄호
- `this`와 관련된 문맥 내용도 있으나 여기서는 지나가고 나중에 `TIP36`에서 살펴볼 것이다.
- 영문 이름 값을 받아 첫 번째 글자를 대문자로 변경하는 함수를 살펴보자.

``` javascript
// 이름이 있는 '기명함수'
function capitalize(name) {
     return name[0].toUpperCase() + name.slice(1);
}

// 이름이 없어 변수에 할당하는 '익명함수'
const capitalize = function (name) {
     return name[0].toUpperCase() + name.slice(1);
}

// 화살표 함수를 사용한 익명함수
const capitalize = name =>  name[0].toUpperCase() + name.slice(1);
```

- 인수를 감싸를 괄호 없앰 : `(name) -> name`
- 중괄호 없앰 : `{} -> ''`
- return 없앰 : `return -> ''`
- function 없앰 : `function -> =>`

- 자바스크립트에서는 함수를 다른 함수에 인수로 전달할 수 있다.(콜백함수)

``` javascript
function applyCustomGreeting(name, callback) {
     return callback(capitalize(name))
}

// callback을 기명함수로 넣어줘도 되지만 익명 함수를 생성하여 넘기는것이 더 편리하다.
applyCustomGreeting('mark', function (name) {
     return `안녕, ${name}!`;
});

// 이걸 화살표 함수를 사용해서 변경해보자.
applyCustomGreeting('mark',  name => `안녕, ${name}!`;);
```

- 배열 메서드를 살펴보면서 화살표 함수를 자주 보고 사용하게 될 것이다.

## 배열 메서드로 반복문을 짧게 작성하라(TIP21)

- 배열 메서드를 이용해 긴 반복문을 한 줄로 줄이는 방법을 배워보자.
- `for`문을 아예 사용하지 말라는것은 아니다.
- 모던 스크립트의 장점을 살려 간결함, 가독성, 예측가능성을 갖춘 코드를 지향하자는 것이다.
- 문자열로 작성한 가격 배열을 부동 소수점 값으로 변환하는 기본적인 반복문을 통해 살펴보자.
  - 배열에 숫자형식이 아닌 문자열이 있고, 숫자로 변환할 수 있는 값만 필요로 하는 경우도 추가!

``` javascript
const prices = ['1.0', 'negotiable', '2.55'];

const formattedPrices = [];
for (let i = 0; i <  prices.length; i++) {
     const price = parseFloat(prices[i]);
     if (price) { // 문자열이 올 경우 NaN 반환
          formattedPrices.push(price);
     }
}
```

- 복잡하고, 가독성이 좋지 않고, 예측하기 어렵다.
  - 3행에서 데이터를 다루기 전에 새로운 컬렉션을 선언
  - `let`이 블록 유효 범위이므로 밖에서 빈배열 선언ㅠㅠ
  - 마지막으로 `for`문은 값을 변화하는 작업과 불필요한 값을 제외하는 작업을 포함해 2가지 관심사로 분리된다.(예측가능성 훼손)

### 배열메서드의 종류

- `map()` : 형태를 바꿀수 있고, 길이는 유지
- `sort()` : 형태나 길이는 변경되지 않고, 순서만 변경
- `filter()` : 길이를 변경하지만 형태는 유지
- `find()` : 배열을 반환하지 않고, 1개의 데이터만 반환, 형태는 유지
- `forEach()` : 형태를 이용하지만 아무것도 반환하지 않는다.
- `reduce()` : 길이, 형태 변경가능 무엇이든 처리 가능!

- 위에서 살펴본 코드를 배열메서드를 사용해보자.

``` javascript
const prices = ['1.0', 'negotiable', '2.55'];
const formattedPrices = prices.map(price => parseFloat(price))
// [1.0, NaN, 2.55]
.filter(price => price);
// [1.0, 2.55]
```

- `map()`을 이용해 배열의 길이는 유지, 형태를 변경(실수로)
- `filter()`를 이용해 배열의 길이를 변경, 형태는 유지
- 간결하고, 가독성이 좋고, 예측가능하다!

## `map()` 메서드로 비슷한 길의 배열을 생성하라(TIP22)

- `map()` 메서드를 사용해 배열에 들어있는 정보의 부분집합을 생성해보자.
- 연주자 목록이 담긴 컬렉션에서 다루는 악기만 추출해보자.
- `for`문을 사용해 개선해가면서 `map()` 메서드를 사용하자.

``` javascript
const band = [{
     name: 'corbett',
     instrument: 'guitar',
},{
     name: 'evan',
     instrument: 'guitar',
},{
     name: 'sean',
     instrument: 'bass',
},{
     name: 'brett',
     instrument: 'drums',
}]

// for문을 이용한 방식
const instrumnets = [];
for (let i = 0; i < band.length; i++) {
     const instrument = band[i].instrument;
     instruments.push(instrument);
}

// instrument를 가져오는 함수를 별도로 만들자.
function getInstrument(member) {
     return member.instrument;
}

// 별도의 함수를 사용
const instrumnets = [];
for (let i = 0; i < band.length; i++) {
     instruments.push(getInstrument(band[i]);
}

```

- `map()` 메서드를 사용하기 위해 해야 할 일은 원본 배열의 각 항목을 인수로 받아 새롭게 생성될 배열에 담길 값을 반화하는 함수를 만드는 것뿐이다.(이미 함수를 작성했다.)
- `map()` 메서드는 실행결과에서 반환된 값을 배열에 담는다. 따라서, 빈배열에 `push()` 하는 코드가 필요 없다.

``` javascript
const instruments = band.map(getInstrument);
//  ["guitar", "guitar", "bass", "drums"]
```

- `map()` 메서드는 원본 배열과 같은 길이의 배열을 생성하는 경우라면 모든 곳에 사용할 수 있다.

## `filter()`와 `find()`로 데이터의 부분집합을 생성하라(TIP23)

- 배열에 담긴 항목의 형태는 유지하면서, 배열의 길이를 변경하는 방법을 배워보자.
- 문자열이 담긴 간단한 배열에 필터링을 적용하는 예제를 살펴보자.
  - 이름이 `Dav`와 비슷한 사람들을 찾아보자.

``` javascript
const team = [
     'Michelle B',
     'Dave L',
     'Dave C',
     'Courtne B',
     'Davina M',
];

'Dave'.match(/Dav/);
// ["Dav", index: 0, input: "Dave", groups: undefined]
'Michelle'.match(/Dav/);
// null
```

- `match()` 메서드는 문자열이 정규 표현식과 일치하면 일치한 항목에 대한 정보를 배열로 반환하고 일치하지 않으면 `null`을 반환한다.

``` javascript
const daves = [];
for (let i = 0; i < team.length; i++) {
     if (team[i].match(/Dav/)) {
          daves.push(team[i]);
     }
})
```

- `for`문을 이용해 풀었지만 역시 우아하지 않다.
- `filter()` 메서드를 이용해보자.

``` javascript
const daves = team.filter(member => member.match(/Dav/));
```

- 한줄로 우아하게(간단, 예측가능성, 가독성이 좋은) 해결했다.
- `filter()` 메서드는 `true`인 값들은 유지되고 새로운 배열에 담겨진다. `false`인 값들을 제외된다.
- 최정적으로 반환되는 배열에는 실제 값들이 담긴다.

``` javascript
const scores = [30, 72, 60, 82];
function getNumberOfPassingScores(scores) {
     const passing = scores.filter(score => score > 59);
     // [82, 72]
     return passing.length;
}
// 2

// 조건이 일치하지 않는 경우도 빈배열을 반환한다.
const scores = [30, 72, 60, 82];
function getNumberOfPassingScores(scores) {
     const passing = scores.filter(score => score === 100);
     // []
     return passing.length;
}
// 0
```

- 가끔 일치하는 단 하나의 값을 찾을때가 있는데 이떄 `find()` 메서드를 사용한다.
- 일치하는 값을 찾자마자 순회를 멈춘다.
- 근무중인 '기념 도서관' 사서를 찾는 코드를 살펴보자.

``` javascript
const instructors = [{
     name: '짐',
     libraaries: ['미디어교육정보 도서관']
},{
     name: '새라',
     libraaries: ['기념 도서관', '문헌정보학 도서관']
},{
     name: '엘리엇',
     libraaries: ['중앙 도서관']
}]

let memorialInstructor;
for (let i = 0; i < instructors.length; i++) {
     if (instructors[i].libraries.includes('기념 도서관')) {
          memorialInstructor = instructors[i];
          break;
     }
})
```

- 첫번째 사서는 일치하지 않고 두번째 사서가 일치하니 `break` 사용해 반복문을 멈췄다.
- `find()`를 사용해보자.

``` javascript
const librarian = instructors.find(instructor => {
     return instructor.libraries.incdlues('기념 도서관');
})
```

- 우아한 코드가 다시 만들어졌다. `const`를 예측 가능해졌다.
- `find()`를 사용해 일치하는 값을 찾지 못하는 경우엔 `undefined`를 반환한다.
- 단란평가를 사용해 기본값을 추가해보자.

``` javascript
const image = [{
     path: './me.png',
     profile: false
}];
const profile = images.find(image => image.profile) || {
     path: './default.png'
}
```

- `find()` 함수의 아쉬운점은 도서관 이름인 '기념 도서관'을 하드코딩해야 되는 부분이다.
- 이 부분은 커링을 통해 극복이 가능하다.

``` javascript
const findByLibrary = library => instructor => {
     return instructor.libraries.incdlues(library);
};
const librarian = instructors.find(findByLibrary('미디어교육정보 도서관'));

//
const librarian = instructors.find(instructor => {
     return instructor.libraries.incdlues('기념 도서관');
})
이런식으로 여러개 작성하지 않아도 위에 커링을 사용한 코드를 보면 findByLibrary 인수만 변경하면 하나의 함수로 활용이 가능하다.
```

- 커링은 아까 말했듯이 나중에 배울것이다.

## 결론

- 배열메서드를 반정도 알아봤는데 대충 감으로 사용했던 것들이 어떤식으로 만들어졌는지 알게 되었다.
- 자료구조에 맞게 어떤 배열메서드를 사용할지에 대해 감이 잡혔다.
- 배열메서드는 필수로 자유자재로 익혀야 편하다!
