# JS의 메소드와 기능들

자바스크립트를 공부하면서 헷갈리거나 자주 사용하는 메서드, 새롭게 알게된 메서드, 기능 등을 정리해 볼게요~

### 배열

1. 배열에서 실행

```js
const fruits = ["🥑", "🍉"];
//forEach : 배열의 항목을 순환하며 처리
fruits.forEach((fruit) => console.log(fruit));
// find : 조건 만족하는 첫번째 항목 리턴
const result = students.find((student) => student.score === 90);
// some : 배열안에서 조건 통과여부 boolean 으로 반환
const result = students.some((student) => student.score < 50);
// every : 배열에서 모든 항목에 대해 조건에 맞는지 boolean 으로 반환
const result2 = students.every((student) => student.score >= 50);
// reduce : 배열에서 모든 항목에 대해 주어진 리듀서 함수를 실행하여 하나의 결과를 반환 (callback[, initialValue])
const result = students.reduce((acc, curr) => acc + curr, 0);
//push : 배열 끝에 항목 추가
fruits.push("🍒");
//pop : 배열 끝의 항목 제거
fruits.pop();
//unshift : 배열 앞에 항목 추가
fruits.unshift("🥑", "🍍");
//shift : 배열 맨 앞의 항목 제거
fruits.shift();
//splice : 인덱스를 사용하여 자르기
fruits.splice(1, 1);
//indexOf : 해당요소의 인덱스 찾기 //includes : 포함여부를 boolean으로 리턴
console.log(fruits.indexOf("🍒"));
console.log(fruits.includes("🍒"));
console.log(fruits.lastIndexOf("🍒"));
//reverse : 배열의 순서를 반대로 하기
fruits.reverse();
```

2. 새로운 배열을 return

```js
// concat : 배열을 합쳐서 새로운 배열 리턴
const array1 = ["a", "b"];
const array2 = ["d", "e"];
const array3 = array1.concat(array2);
// slice : 배열을 인덱스로 잘라 새로운 배열 리턴
const array4 = array.slice(2, 5);
// filter : 조건 만족하는 새로운 배열을 리턴
const result = students.filter((student) => student.enrolled);
// map : 배열의 모든 요소에 로직을 실행한 새로운 배열을 리턴
const result = students.map((student) => student.score);
```

3. 문자열

: join, replace, slice등

### Object

- Object.assign : 객체를 복사할 때 사용, 객체를 복사하여 새로운 객체를 리턴한다.
- Object.entries : 객체의 key, value 쌍의 배열을 for...in 와 같은 순서로 리턴한다
- Object.keys : 객체의 key 값을 배열로 리턴한다.
- Object.values : 객체의 value 값을 배열로 리턴한다.
- Object.freeze : 객체의 값을 동결한다. 더이상 변할 수 없는 값으로 상수선언하여 사용하기도 한다.

### DOM 관련

- classList : element의 클래스 이름을 공백을 기준으로 배열로 가져온다.
- className : element의 클래스 이름을 문자열로 가져온다.

css나 추가 기능을 위해 클래스 이름이 공백을 기준으로 여러개가 설정되어 있는 경우가 많다. 특정 요소가 들어간 클래스이름을 가져오고 싶다면 classList로 가져오는 것이 좋다.

- querySelect : css에서 접근할 때와 같이 태그, 클래스이름, 아이디 등 선택자로 구분하여 해당하는 첫번째 요소를 가져올 수 있다.
- querySelectAll : 해당 요소가 포함되는 모든 요소를 배열로 가져온다.
- getElementByTagName, getElementById, getElementByClassName : 태그, 클래스이름, 아이디에 따라 구분하여 해당하는 모든 요소를 가져올 수 있다.

querySelect 위주로 많이 사용된다고 한다. querySelectAll과 getElementByClassName을 사용했을 때, 차이점이 있다. querySelectAll은 해당 메서드가 불러졌을 때, 정보를 가져온다. getElementByClassName은 사용되는 시점의 정보를 가져온다. 이외에도 querySelectAll : O(n) 보다 getElementBy\* : O(1) 가 더 빠르게 작동한다.

[차이점 stackoverflow](https://stackoverflow.com/questions/14377590/queryselector-and-queryselectorall-vs-getelementsbyclassname-and-getelementbyid/39213298#39213298)

- className으로 받아오는 경우 startsWith, contains, includes 등으로 일치여부를 확인할 수 있다. 추가적으로 className이 붙는 경우가 많기 때문에 온전한 문자열 일치여부보다는 해당 내용 포함여부를 검사하는 방법이 있다.

- innerHTML : html를 반환한다. html 요소를 추가할 수 있다.
- insertAdjacentHTML : innerHtml과는 다르게 요소 안의 이미 존재하는 요소는 건드리지 않는다. html을 추가할 수 있다.  
  `$li.insertAdjacentHTML('afterend', '<div id="two">two</div>');`
- innerText : 태그의 내부 텍스트를 사람이 읽을 수 있는 요소만 가져온다.
- textContext : script와 style 요소를 포함한 요소의 콘텐츠를 가져온다.

[innerText와 textContext의 차이점 mdn](https://developer.mozilla.org/ko/docs/Web/API/Node/innerText)

### event

1.  eventHandler를 사용하는 방법

```js
//1.
ul.addEventListener("dblclick", handleEditing);
//2.
ul.addEventListener("dblclick", (e) => handleEditing(e));
```

이벤트 처리시 `depth`가 깊어져서 생기는 실수를 방지하고 가독성을 위해 함수로 이벤트 핸들링을 해주는 것이 좋다. 1과 2의 차이는 이벤트를 바로 넘겨줄 것인지, 이벤트의 특정 요소를 구조분해할당하여 넘겨줄 것인지를 결정할 수 있다는 것이다. 1의 경우에는 이벤트를 넘겨 함수에서 이벤트 처리를 해준다면, 2번의 경우에는 개발자가 이벤트 핸들러에 e만 넘기는 것이 아니라 전역 변수나 다양한 속성을 조정하여 넘길 수 있다는 장점이 있다.

2. keypress, keydown, keyup의 차이

- keypress : ctrl, shift, alt 등의 수정키와 Escape는 이벤트 인식되지 않음. 키보드를 누르고 있을 때 뗄때까지 이벤트 실행.
- keydown : 키가 눌렸을 때, 이벤트 인식. 키보드를 누르고 있을 때 1번의 이벤트 실행.
- keyup : 키가 눌렸다가 올라올 때, 이벤트 인식. 키보드를 누르고 있다면 뗄 때 이벤트 실행.

키보드가 눌러지고 있을 경우를 고려해 보아야 한다. API 통신 등이 이벤트에 걸려있다면, 키보드가 눌려있는 동안 과도한 API 사용이 일어날 것이다.

3. class에서 eventBinding을 하는 3가지 방법

```js
//class에서 eventBinding 하는 3가지 방법
 constructor() {
    this.field.addEventListener("click", this.onClick);
   // this.onClick = this.onClick.bind(this);  binding1
    //this.field.addEventListener("click", (event) => this.onClick(event)); binding2
  }
// binding 3
 onClick = (event) => {
   console.log(event.target);
  };

```

### 표준 내장 객체

1. Proxy : 프록시는 특정 객체를 감싸 가해지는 작업을 중간에 가로채거나 재정의 하는 객체이다.  
   target과 handler의 파라미터를 받는다.

```js
const proxy = new Proxy(target, handler);
```

- target : 감싸게 될 객체, proxy가 가상화하는 실제 객체.
- handler : 동작을 가로채는 trap이 담긴 객체  
  trap에는 몇가지 메서드가 있는데, 그 중 get은 프로퍼티를 읽을 때, set은 프로퍼티에 쓸 때 작동한다. set에서는 값을 쓰는 것이 성공이면 반드시 true를 리턴해야 한다.

사용 예시로는 get의 todolist 객체를 담고, set 내부에 render함수를 등록하여 객체가 바뀔 때마다 render함수가 작동될 수 있게 등록할 수 있다.

[Proxy MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
[Proxy 관련 사용법](https://ko.javascript.info/proxy)
[todolist 참고 코드](https://github.com/next-step/js-todo-list-step1/tree/devjang/src)

### 기타

1. static : 정적 메서드는 클래스에서 만들수 있으며, 인스턴스화 없이 사용이 가능하다. 클래스가 인스턴스화 되면 호출할 수 없다. 유틸리티 함수를 만드는데 사용되기도 한다.

[static mdn](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Classes/static)

2. Symbol : primite data type의 일종으로 고유한 값을 생성한다. 매번 생성시 마다 고유 값을 생성하며, 같은 데이터로 인식하는 심볼을 작성하기 위해서는 Symbol.for(), Symbol.keyFor()를 사용할 수 있다.

```js
//symbol, create unique identifiers for objects
const symbol1 = Symbol("id");
const symbol2 = Symbol("id");
console.log(symbol1 === symbol2); // false
const gSymbol1 = Symbol.for("id");
const gSymbol2 = Symbol.for("id");
console.log(gSymbol1 === gSymbol2); //true
console.log(
  `value: ${symbol1.description}, type: ${typeof symbol1.description}`
); // value: id, type: string
```

### 정리

vanilla JavaScript로 투두리스트를 작성하는 스터디를 하면서, 자바스크립트의 메서드나 사용법에 대해 좀 더 알게 되었다. 상태변화에 따른 렌더링이 전체적으로 발생되는 것에서 리액트가 부분적으로 상태변화를 발생시키는 점에 대한 장점에 대해 느낄 수 있었다. 모듈화 작업에 대한 연습을 하면서 상태의 데이터 흐름을 단방향으로 가져가는 필요성에 대해서도 알 수 있었다. 다른 분들이 작성한 코드를 보면서 좀 더 정리된 코드를 작성하는 방식, 다양한 구조로 작성하는 방식을 보며 배우는 점이 많았다.
