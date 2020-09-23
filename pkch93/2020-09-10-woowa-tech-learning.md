# 우아한 테크러닝 3일차, 4일차

# 3일차 - React 기초

## Virtual DOM 만들어보기

Real DOM은 Virtual DOM보다 더 Low 레벨이라 복잡도가 높다. 또한 이런 Real DOM을 직접 다루는 것은 성능 저하를 유발한다. 이를 보완하여 좀 더 DOM을 다루기 쉽게 하기위해 React가 등장했다.
Virtual DOM이 왜 필요한지 참고: [https://velopert.com/3236](https://velopert.com/3236)

```jsx
function createElement(type, props = {}, ...children) {
	return { type, props, children }
}
```

babel의 기능중에 아래와 같이 JSX로 Virtual DOM을 만드는 함수를 변경할 수 있다. 기본적으로 createElement이다.

```jsx
/* @jsx H */
```

위와 같은 옵션을 제공해주는데 이는 virtual DOM을 만드는 함수를 H로 변경하는 옵션이다.

어떤 것이 바벨과 같은 트랜스파일링을 해주는 것인지, 어떤 것이 리엑트가 해주는 것인지 알아야하고 컴파일타임과 런타임에 일어나는 일을 알아야한다.

이런 가상돔이 현제 실제로 랜더링된 DOM과 비교하여 ReactDOM.render에서 실제 DOM에 랜더한다.

### JSX와 Builtin 컴포넌트

JSX에서 사용자 컴포넌트는 반드시 대문자로 해야한다. 이것이 JSX에서 `div`, `h1`과 같은 builtin 컴포넌트들과 사용자 커스텀 컴포넌트를 구분하는 방법이다.

따라서 위 createElement에서 type이 함수라면 분기처리를 해주어야한다.

```jsx
function createElement(type, props = {}, ...children) {
	if (typeof type === 'function') {
		return type.apply(null, [props, ...children])
	}

	return { type, props, children }
}
```

이렇게 createElement를 구현하면 다음과 같이 App을 확인할 수 있다.

![https://user-images.githubusercontent.com/30178507/92744164-31047b80-f3bc-11ea-9640-4d8231c0fbc6.png](https://user-images.githubusercontent.com/30178507/92744164-31047b80-f3bc-11ea-9640-4d8231c0fbc6.png)

### render

```jsx
function render(virtualDom, container) {
	container.appendChild(renderElement(virtualDom))
}
```

render는 DOM tree와 container를 인자로 받는다. render는 단순히 virtualDom을 container에 붙이는 역할이다.

> 참고로 renderElement는 가상돔을 실제 container에 붙이는 역할을 한다.

### renderElement

```jsx
function renderElement(node) {
	const el = document.createElement(node.type)

	return el
}
```

먼저 인자로 받는 node의 타입으로 element를 만든다.
그리고 node의 children이 존재한다. 따라서 node의 children들도 모두 실제 DOM element로 만들어주어야한다.

```jsx
function renderElement(node) {
	const el = document.createElement(node.type)

	node.children.map(renderElement).foreach(element => {
		el.appendChild(element)
	})

	return el
}
```

단, JSX에서 맨 마지막 요소는 String이다. 따라서 이를 방어하는 코드가 필요하다.

```jsx
function renderElement(node) {
	if (typeof node === 'string') {
		return document.createTextNode(node)
	}

	const el = document.createElement(node.type)

	node.children.map(renderElement).foreach(element => {
		el.appendChild(element)
	})

	return el
}
```

이런식으로 React의 가장 기초를 구현하였다.

> 라이브러리 코드 보는 요령
초기 release 버전을 먼저 확인하여 라이브러리 초기 컨셉을 확인한 후 한 뎁스씩 요령껏 볼 것.

## React의 기본

react 컴포넌트를 정의하는 방법은 class 방식과 function 방식이 존재한다.
이때 react의 컴포넌트는 render가 필수적으로 구현되어 있어야한다. 즉, JSX `createElement`를 통해 virtualDOM을 만들어야하기 때문이다. `react 컴포넌트 자체는 UI를 만드는 능력이 없다.`

class 컴포넌트는 다음과 같은 구조를 가진다.

```jsx
class Hello extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		// ...
	}
} 
```

### 상태

React hook 전까지는 class에서만 상태를 가질 수 있었다.

```jsx
function App() {
	let state = 10;

	return (
		<div>
			<h1>상태</h1>
		</div>
	)
}
```

위와 같이 함수형 컴포넌트에서 상태를 구현하려면 내부에 변수를 두어 사용해야할텐데 함수는 호출될 때마다 내부 변수가 새롭게 생겨나므로 상태를 가질 수 없었다.

단, 클래스 컴포넌트의 경우는 객체이므로 인스턴스 생성한 후 계속 변수에 상태를 유지할 수 있다. 따라서 초기 리액트에서 상태를 다루는 경우 클래스 컴포넌트, 화면을 다루는 경우 함수형 컴포넌트로 주로 사용했었다.

> command - presentational component 패턴

상태와 마찬가지로 라이프사이클도 함수와 클래스의 차이를 그대로 가진다.
함수형 컴포넌트는 함수 생성 후 return만이 존재하므로 라이프사이클이 존재하지 않았다. 반면, 클래스 컴포넌트는 처음 인스턴스를 생성한 후 이 인스턴스를 다루므로 라이프사이클이 존재한다.

### React Hooks

hook은 함수형 컴포넌트에서 상태를 가질수 있도록 지원해주는 스팩이다.

```jsx
function App() {
	const result = useState(1)

	return (
		<div>
			<h1>상태</h1>
		</div>
	)
}
```

위와 같이 `useState`를 사용하면 함수형 컴포넌트에서 state를 사용할 수 있다.
`useState`는 배열로 나타나며 첫번째 값은 초기값, 두번째 값은 상태를 바꾸는 dispatch 함수이다.

### Hooks의 상태를 update하면 render가 되는 이유

react가 컴포넌트를 만들때 createElement가 호출된다. 그리고 createElement의 최상단이 함수인 경우와 함수를 호출하는 시점에 hook 코드가 호출되는 경우 hook 전역 배열에 초기값과 dispatch를 넣어둔다. 그리고 2번째 호출일때는 hook state를 초기화하는 과정을 무시한다.

컴포넌트가 중첩된 순서대로 hook 전역 배열에서 관리하기 때문에 반드시 최상위 레벨에서만 hook을 사용해야한다. 그리고 전역 배열은 리엑트 컴포넌트를 키로 가지고 있기 때문에 일반함수에서는 사용할 수 없다.

그리고 해당 컴포넌트에 hook이 호출되었다는 것을 리액트가 알고 있기 때문에 클래스 컴포넌트와 같이 라이프사이클을 가질 수 있는 것이다. `useEffect 등`

# 4일차

```jsx
import React from 'react'

export default () => {
    return (
      <div>
        <header>
          <h1>React & Typescript</h1>
        </header>
        <ul>
          <li>1회차: Overview</li>
          <li>2회차: redux 만들기</li>
          <li>3회차: React 만들기</li>
          <li>4회차: Component Design 및 Async</li>
        </ul>
      </div>
    )
}
```

위와 같은 React 앱이 있을때 상태에 해당하는 데이터는 1회차, 2회차 등으로 나타난 세션 목록들이다.

```jsx
// index.js

import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

const sessions = [
  { order: 1, title: "1회차: Overview" },
  { order: 2, title: "2회차: redux 만들기" },
  { order: 3, title: "3회차: React 만들기" },
  { order: 4, title: "4회차: Component Design 및 Async" }
];

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App sessions={sessions} />
  </React.StrictMode>,
  rootElement
);
```

```jsx
// App.js

import React from 'react'

export default ({ sessions }) => {
    return (
      <div>
        <header>
          <h1>React & Typescript</h1>
        </header>
        <ul>
					{
						sessions.map(session => (<li>{session}</li>))
					}
        </ul>
      </div>
    )
} 
```

따라서 데이터로 사용되는 세션 목록들을 상위 컴포넌트에서 props로 받아올 수 있다. `위 경우 세션 정보들을 api 통신으로 받아온다고 가정`

이때 처음 할 수 있는 고민이 `어느 정도로 컴포넌트를 쪼갤것인가`이다. 최대한 작은 단위로 컴포넌트를 쪼개는 것이 좋다. 그리고 `언제 쪼갤까` 라고 생각이 들었다면 바로 실행하는 것이 좋다. 추후에는 이런 작은 것들이 쌓이고 너무 범위가 많아져 수정할 엄두가 안날 수 있기 때문이다.

따라서 위 코드에서 반복되는 `<li>{session}</li>`를 하나의 컴포넌트로 도출할 수 있다.

```jsx
import React from 'react'

const SessionItem = ({ title }) => <li>{title}</li>

export default ({ sessions }) => {
    return (
      <div>
        <header>
          <h1>React & Typescript</h1>
        </header>
        <ul>
					{
						sessions.map(session => (<SessionItem title={session.title} />))
					}
        </ul>
      </div>
    )
} 
```

`SessionItem`을 정의하여 위와 같이 정의할 수 있다.

## state

위 React 앱에서 `session의 order 값에 따라 보여주는 방식이 달라질수있다`는 요구사항이 추가되었다고 가정한다.

이런 상황에서 정렬 방식이 달라질때마다 뷰를 다시 랜더링해줘야한다. 때문에 React의 컴포넌트 리랜더링 매커니즘을 이용하기 위해 state를 사용해야한다.

일단 정렬을 한 세션들을 보여줄 컴포넌트를 뽑아야한다.

```jsx
const OrderedSessions = ({ order, sessions }) =>
  sessions
    .sort((session1, session2) => {
      return order === "ASC"
        ? session1.order - session2.order
        : session2.order - session1.order;
    })
    .map((session) => <SessionItem title={session.title} />
)
```

## Class

```jsx
import React from 'react'

const SessionItem = ({ title }) => <li>{title}</li>

class ClassApp extends React.Component {
	constructor(props) {
		super(props)
		
		this.onToggleDisplayOrder = this.onToggleDisplayOrder.bind(this)
		this.state = { order: 'ASC' }
	}

	onToggleDisplayOrder() {
		this.setState(
			{ order: this.state.order === 'ASC' ? 'DESC' : 'ASC' }
		)
	}

	render() {
		return (
      <div>
        <header>
          <h1>React & Typescript</h1>
        </header>
				<span>정렬상태: {this.state.order}</span>
				<button onClick={this.onToggleDisplayOrder}>재정렬</button>
        <ul>
					{
						this.props.sessions.map(session => (<SessionItem title={session.title} />))
					}
        </ul>
      </div>
    )

	}
}

export default ClassApp
```

hooks가 없었던 시절에는 state를 관리할 수 있는 방법이 위와 같이 class 컴포넌트였다. 따라서 위와 같이 상태를 가져야하는 경우 class로 변경해야했다.

이런 문제때문에 hooks 이전에는 최상위 컴포넌트 `주로 class 컴포넌트`에서 props를 관리하고 하위 컴포넌트에서 상위 컴포넌트에서 전달하는 props를 가지고 뷰를 그려주는 방식을 많이 사용했었다.

### function과 arrow function의 this

참고로 자바스크립트에서 function과 arrow function의 this 컨택스트가 달라진다.

function으로 정의하는 경우 this는 호출되는 환경에 따라서 this가 달라진다. 때문에 this가 콜백으로 전달하는 경우 콜백을 호출하는 컨텍스트의 this가 해당 function의 this가 되는 것이다.

따라서 위 `onToggleDisplayOrder`로 선언하는 경우 constructor에서 `this.onToggleDisplayOrder = this.onToggleDisplayOrder.bind(this)`위와같이 해당 function의 this를 맡춰줘야했다.

이런 이유로 예전 React 코드에서는 bind 관련 코드가 많았다.

하지만 arrow function의 경우 this는 정의된 컨텍스트의 this를 따르게 된다.

만약 위 `onToggleDisplayOrder`을 arrow function으로 변경하게 되면 this는 `ClassApp`에서 정의되었으므로 classApp의 인스턴스가 된다.

```jsx
const onToggleDisplayOrder = () => {
	this.setState(
		this.state.order === 'ASC' ? 'DESC' : 'ASC'	
	)
}
```

이 경우 this는 ClassApp의 인스턴스가 된다. 때문에 ES6 이후로 React에서 arrow function을 사용하게 되면서 위 bind 코드가 많이 사라졌다.

## Function

React 16.8.x 이후로 Hooks가 생기면서 Class 뿐만 아니라 Function에서도 상태를 관리할 수 있게 되었다.

```jsx
import React, { useState } from 'react'

const SessionItem = ({ title }) => <li>{title}</li>

export default ({ sessions }) => {
		const [order, setOrder] = useState('ASC')

		const onToggleDisplayOrder = () => {
			setOrder(order === 'ASC' ? 'DESC' : 'ASC')
		}

    return (
      <div>
        <header>
          <h1>React & Typescript</h1>
        </header>
				<span>정렬상태: {order}</span>
				<button onClick={onToggleDisplayOrder}>재정렬</button>
        <ul>
					{
						sessions.map(session => (<SessionItem title={session.title} />))
					}
        </ul>
      </div>
    )
} 
```

위와 같이 `useState`와 같은 Hooks API로 함수에서 state를 관리할 수 있다.

이때 `setOrder`와 같은 상태를 바꾸는 Hooks API는 `onToggleDisplayOrder`와 같이 함수에 감싸서 사용되어야한다.

## 비동기와 generator

```jsx
function* foo() {
	// ...
}
```

위와 같이 `function` 오른쪽에 `*`가 붙은 함수를 generator라고 한다.

```jsx
async function bar() {
	// ...
}
```

반면 `async` 키워드를 사용하면 비동기 함수를 정의할 수 있다. `async` 내에서 사용할 수 있는 `await`는 Promise와 함께 사용하여야한다.

이런 함수들은 Promise와 관련이 있다.

### Promise

```jsx
const p = new Promise(function(resolve, reject) {
	// ...
})
```

Promise는 callback을 인자로 받는데 이때 callback의 첫번째 인자는 `resolve`, 두번째 인자는 `reject`가 된다.

### generator

```jsx
function* make() {
	return 1
}

const i = make()
```

generator 함수를 호출하면 GeneratorFunctionPrototype을 리턴한다. 즉, 일반적인 함수와는 다르다. generator는 코루틴의 개념을 일부 차용하여 구현한 것이다.

```jsx
function* makeNumber() {
	let num = 1
	
	while(true) {
		yield num++		
	}
}

const i = makeNumber()
```

기존의 return문은 함수를 종료시키는 명령이다. generator는 전달할 값을 모두 제공할 때까지 함수가 종료되면 안된다. 따라서 generator용의 return을 따로 정의해두었다. 이것이 바로 `yield`이다.

위와 같이 `makeNumber`를 정의하고 호출을 하면 `i`에게 generator를 실행할 객체를 전달해주는 것이다. `GeneratorFunctionPrototype`

실행을 위해서는 next를 호출하는 것이다.

```jsx
i.next()
```

이렇게 호출하면 makeNumber에서 yield된 값을 객체형태로 받는다.

```jsx
{
	value: 1,
	done: false
}
```

value는 yield된 값, done은 generator가 마지막인지 여부를 알려주는 것이다. false라면  generator가 yield 할 값이 있다는 의미이다.

### generator 활용

이렇게 generator는 내부의 상태를 계속 유지한다는 특징이 있다.
이런 특징을 통해 비동기를 동기적으로 사용할 수 있다.

```jsx
const delay = ms => new Promise(() => setTimeout(resolve, ms))

function* main() {
	console.log('시작')
  yield delay(3000)
	console.log('3초 뒤')
}

const m = main()

const { value } = m.next()
value.then(() => {
	m.next()
})

delay(3000).then(() => {
	console.log('3초 뒤')
})
```

마치 순서대로 진행되는 동기적 코드를 만들때 generator를 사용하기도 한다. 이를 통해 바깥에서 내부 동작을 동기적으로 제어할 수 있도록 만들 수 있다.

실제로 async를 babel로 트랜스파일링하면 generator와 Promise로 되어있다.

```jsx
async function main2() {
	console.log('시작')
	await delay(3000)
	console.log('3초 뒤')
}

main2()
```

위 main2는 main과 동일하게 동작한다.