# React 라이브러리를 직접 만들어보기

React 라이브러리의 ```createElement```, ```render```, ```renderElement``` 메소드를 직접 만들어 보며 간략하게 React를 만들어 보려 한다.

## 1. createElement 구현

createElement 는 첫번째 인자는 html 태그 타입, 두번째 인자는 props 객체, 세번째 인자는 children 을 받아 리턴해줄 수 있도록 작성한다.

```javascript
function createElement(type, props = {}, ...children) {
  return { type, props, children };
}
```
```javascript
import React from "react";
import ReactDOM from "react-dom";

/* @jsx createElement */
function createElement(type, props = {}, ...children) {
  return { type, props, children };
}

function StudyList (props) {
  return (
    <ul>
      <li>React</li>
      <li>Redux</li>
      <li>TypeScript</li>
    </ul>
  )
}

function App() {
  return (
    <div>
      <h1>Hello</h1>
      <StudyList />
    </div>
  );
}

console.log(<App />);
```
위와 같이 /* @jsx createElement */ 같은 주석을 달아주면 JSX 문법이 React.createElement가 아닌 위 구현한 createElement로 사용할 수 있다.

<img width="601" alt="스크린샷 2020-10-01 오후 9 43 44" src="https://user-images.githubusercontent.com/35620465/94811005-c0d39d80-042f-11eb-8666-881510e3c3fc.png">

그래서 App 컴포넌트를 로그 찍어본 결과 JSX 코드와 동일하게 컴파일 되지만 우리가 작성했던 vdom 형태와는 조금 다른 것 같다.
type 이 html 태그를 표현해줘야 하는데, function App 으로 표현해주고 있어 변경이 필요하다.

```javascript
function createElement(type, props = {}, ...children) {
  if (typeof type === "function") {
    return type.apply(null, [props, ...children]);
  }

  return { type, props, children };
}
```

type 이 'function' 일 때 apply 메소드를 이용해 기존 매개변수를 그대로 넣어 호출해준다.  
```apply``` 메소드는 함수를 호출할 때 사용되는 것이다. 첫번째 인자로 함수 내에서 사용할 this 값을 전달해주고, 두번째 인자로 함수에서 사용할 매개변수를 전달해준다. 매개변수의 구분은 배열로 모두 묶어 전달해준다.

<img width="613" alt="스크린샷 2020-10-01 오후 9 59 07" src="https://user-images.githubusercontent.com/35620465/94812206-63d8e700-0431-11eb-9211-a851838bba7f.png">

위와 같이 이전에 작성했던 vdom 과 같은 모양으로 type, props, children 이 출력 되는 것을 볼 수 있다.

## render, renderElement 구현

이제 이것을 화면에 렌더 시켜주기 위해서 우리는 render 함수를 구현해야 한다.

```javascript
function renderElement (node) {
  if (typeof node === 'string') {
    return document.createTextNode(node)
  }
  const el = document.createElement(node.type);
  node.children.map(renderElement).forEach(element => {
    el.appendChild(element);
  });
  return el;
}

function render (vdom, container) {
  container.appendChild(renderElement(vdom))
}

function createElement(type, props = {}, ...children) {
  if (typeof type === 'function') {
    return type.apply(null, [props, ...children])
  }
  return { type, props, children };
}

function Row (props) {
  return <li>{ props.label }</li>;
}

function StudyList (props) {
  return (
    <ul>
      <li>React</li>
      <li>Redux</li>
      <li>TypeScript</li>
      <Row label="???" />
    </ul>
  )
}

function App () {
  return (
    <div>
      <h1>Hello</h1>
      <StudyList />
    </div>
  )
}

console.log(<App />);
render(<App />, document.getElementById('root'));
```

재귀함수를 이용해서 node의 타입이 string이 될 때 까지 반복해서 계속 생성하게 한다. appendChild 함수를 이용해서 부모 노드의 자식노드 리스트들 중 마지막 자식 다음으로 자식을 붙입니다.  
이렇게 해서 다음과 같이 정상적으로 화면이 렌더링 되는 것 을 볼 수 있다.

<img width="350" alt="스크린샷 2020-10-01 오후 10 10 27" src="https://user-images.githubusercontent.com/35620465/94813440-f4fc8d80-0432-11eb-8734-f3588cf27c26.png">

React 에서 화면에 요소들을 렌더링하는데 가장 기본적으로 필요한 함수 3가지를 구현해봤다. 이로써 실제 React 내부에서 DOM, node 들과 요소들을 어떻게 처리하는지 잘 알 수 있었다.
