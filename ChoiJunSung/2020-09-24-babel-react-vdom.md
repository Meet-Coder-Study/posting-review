# React에서 babel의 동작원리 & React와 Virtual DOM 이해하기

## 먼저 babel이란?

Babel 은 자바스크립트 컴파일러이다. 최신 버전의 자바스크립트 문법은 브라우저가 이해할 수 없다.  때문에 babel이 브라우저가 이해할 수 있는 문법으로 변환해준다.  
이로써 ES6, ES7 등의 최신 문법을 사용해서 개발을 할 수 있는것이다.

## React 에서 babel의 동작

```javascript
function App() {
  return <h1 id="header">Tech Hello!</h1>;
}
```

위와 같은 기본적인 jsx 코드가 있다. 이 코드는 babel을 거치게 되면  

```javascript
function App() {
  return /*@__PURE__*/ React.createElement(
    "h1",
    {
      id: "header",
    },
    "Hello Tech"
  );
}
```
로 변하게 된다. 

### React.createElement

두번째 줄을 보면 React의 createElement 함수로 변환된다.  
babel이 이러한 처리를 해주기 때문에  

```javascript
import React, { createElement } from 'react'
```
를 해주지 않아도 사용할 수 있는 것 이다.  
React로 컴포넌트 파일을 만들때 React를 사용하고 있지도 않은데 React가 import 되어 있지 않다는 에러를 많이 봤을 것 이다.  
위와 연관이 되어 있기 때문에 에러가 발생 한다는 것을 알 수 있다.  
createElement 의 두번째 첫번째 인자는 태그네임,  
두번쨰 인자는 props 객체,  
세번째 인자는 children인 것을 볼 수 있다.

## React와 Virtual DOM 이해하기

### React 가 개발된 이유

```javascript
const list = [
    { title: "React에 대해 알아봅시다." },
    { title: "Redux에 대해 알아봅시다." },
    { title: "Typescript에 대해 알아봅시다." },
];

const rootElement = document.getElementById("root");
```

위와 같이 간단한 list 객체 배열이 있다.  
이것은 rootElement의 innerHTML 을 이용해 문자열 Element를 생성해 직접적으로 넣어줄 수 있다.  

```javascript
function app(items) {
  rootElement.innerHTML = `
    <ul>
      ${items.map((item) => `<li>${item.title}</li>`).join("")}
    </ul>
  `;
}

app(list);
```
하지만 위의 app 함수는 innerHTML 같이 DOM에 직접 접근해 구조를 변경하고 있다.
DOM에 직접 접근하는 것은 규모가 커지게되면 복잡해질 수 있으므로 사용하지 않는 것이 좋다.
이러한 문제를 해결하기 위해서 Facebook이 React라는 라이브러리를 개발하게 되었다.
React는 DOM을 Virtual DOM으로 변환해 조금 더 간단하게 개발자가 사용할 수 있도록 만들었다.

### React와 Virtual DOM 이해하기
기본적인 React의 구조는 아래와 같이 구성된다.

```javascript
import React from "react";
import ReactDOM from "react-dom";

function App() {
  return (
    <div>
      <h1>Hello?</h1>
      <ul>
        <li>React</li>
        <li>Redux</li>
        <li>MobX</li>
        <li>Typescript</li>
      </ul>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
```

App 함수의 반환값은 JSX 문법이며 HTML 태그와 비슷하게 사용해 컴포넌트를 만든다.
ReactDOM은 render라는 정적메서드를 가지며 2개의 인자를 받는다.
첫 번째 인자는 화면에 렌더링할 컴포넌트이며 두 번째는 컴포넌트를 렌터링할 요소다.
위의 코드를 아래와 같이 컴포넌트를 분리할 수 도 있다.

```javascript
import React from "react";
import ReactDOM from "react-dom";

function StudyList() {
  return (
    <ul>
      <li>React</li>
      <li>Redux</li>
      <li>MobX</li>
      <li>Typescript</li>
    </ul>
  );
}

function App() {
  return (
    <div>
      <h1>Hello?</h1>
      <StudyList />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
```

App 내부에 있던 ul > li 컴포넌트들을 StudyList 함수로 만들어 분리했다.
컴포넌트를 분리하면서 StudyList 같이 이름을 갖는 함수가 생기며 코드를 관리하기 더 쉬워졌다.
또한 JSX에도 HTML과 동일하게 태그에 속성을 사용할 수 있다.

```javascript
function StudyList() {
  return (
    <ul>
      <li className="item">React</li>
      <li className="item">Redux</li>
      <li className="item">MobX</li>
      <li className="item">Typescript</li>
    </ul>
  );
}
```

HTML에서는 class 속성을 사용하지만 JSX에서는 className을 사용한다.
위의 StudyList 함수에서 반환하는 JSX 엘리먼트들을 객체로 바꾸어 표현하면 아래와 같다.

```javascript
const vdom = {
    type: "ul",
    props: {},
    children: [
        { type: "li", props: { className: "item" }, children: "React" },
        { type: "li", props: { className: "item" }, children: "Redux" },
        { type: "li", props: { className: "item" }, children: "Typescript" },
        { type: "li", props: { className: "item" }, children: "MobX" },
    ],
};
```
```<StudyList/>```에 속성을 넘기는 경우 StudyList 함수는 아래와 같이 바뀔 것이다.

```javascript
function StudyList(props) {
  return (
    <ul>
      <li className="item">React</li>
      <li className="item">Redux</li>
      <li className="item">MobX</li>
      <li className="item">Typescript</li>
    </ul>
  );
}

function App() {
  return (
    <div>
      <h1>Hello?</h1>
      <StudyList item="abcd" id="hoho" />
    </div>
  );
}
```
위와 같이 변경된 코드에 따라 생기는 StudyList의 Virtual DOM은 아래와 같을 것이다.

```javascript
const vdom = {
  type: "ul",
  props: { item: "abcd", id: "hoho" },
  children: [
    { type: "li", props: { className: "item" }, children: "React" },
    { type: "li", props: { className: "item" }, children: "Redux" },
    { type: "li", props: { className: "item" }, children: "Typescript" },
    { type: "li", props: { className: "item" }, children: "MobX" },
  ],
};
```
위와 같이 생성된 객체를 render 메서드가 실제 HTML 태그로 변경시켜 화면에 그려준다.
위의 vdom 객체 구성에 따라 React는 하나의 부모에서 아래의 자식들을 만드는 방식을 갖는다.

직접 DOM이 아닌 위와 같은 방식으로 vdom 객체형식을 만드니 React에서의 vdom의 구조를 어느정도 알 수 있을 것 같다.