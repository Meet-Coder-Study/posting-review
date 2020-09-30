# 자바스크립트 함수와 간단하게 리덕스 구현해보기

> 위 내용은 우아한 테크러닝 3기 2일차 내용 중 일부입니다.
> 
> 중간에 제가 어느정도 안다고 생각하는 내용은 일부 누락이 있을 수 있습니다.

```jsx
let y = 10
```

위와 같이 자바스크립트에서 값이라고 취급하는 것들은 변수에 대입할 수 있다.

여기서 다른 언어들 `주로 C나 Java 같은 컴파일 언어`과 다른 점이 자바스크립트에서 함수를 값으로 취급한다는 것!

# 함수

```jsx
function foo() {
	return 0;	
}
```

자바스크립트의 함수는 값을 무조건 반환하도록 설계되어있다. 위는 함수 정의문으로 함수를 정의한 것이다.

```jsx
const bar = function bar() {
	
}

bar()
```

위는 함수 정의식으로 함수를 정의한 것이다.

위처럼 대입할 함수에 이름을 지정하더라도 변수의 이름을 차용한다. 때문에 함수 정의식에서는 대입할 함수의 이름을 생략할 수 있다.

```jsx
(function() {
	// ...
})()
```

즉시실행함수를 정의한 것으로 정의할 때 단 한번만 실행된 후 다시는 실행할 수 없다.

자바스크립트의 함수는 값의 역할을 한다. 따라서 함수의 인자로 함수를 대입할 수 있다. 물론 반환값으로도 함수를 사용할 수 있다.

## Callback

함수에게 다른함수의 호출을 위임하는 패턴

```jsx
const y = foo(function() {
	// ...
})
```

foo의 인자로 전달한 함수를 콜백함수라고 한다.

## new 함수

new 함수를 호출하면

- 빈 객체를 만듦
- 이 객체를 함수에 new로 호출할 함수에 전달
- 해당 함수의 this에 만든 빈 객체를 매핑
- this를 리턴값으로 반환

위 동작이 자바스크립트 내부에서 이뤄진다. 

## ES6+

### Arrow Function

```jsx
// ES6 >=
const foo = function() {
	// ...
}

// ES6 <=
const bar = () => {
	// ...
}
```

> 자바스크립트는 식과 문으로 이뤄진다.
식은 값으로 반환될 수 있는 문장을 의미. `식의 마무리는 세미콜론`
문은 식 이외의 문장 `문의 마무리는 세미콜론이 아님 ex. 조건문, 반복문`

### class

```jsx
class bar {
	constructor() {
		// ...
	}
}
```

function에 new를 하는 것보다 훨씬 명시적으로 정의할 수 있다.
먼저 constructor가 명시적으로 드러나있다는 것과 class는 일반 함수로 사용할 수 없지만 일반 함수는 new함수로 호출도 가능하고 일반 함수로도 호출 할 수 있다. 즉, 클래스를 만들기 위한 틀로 사용하고 싶지만 일반함수로는 그렇게 하지 못한다는 점이 제약점이다.

### this와 클로저

```jsx
const person = {
	name: '박경철',
	getName() {
		return this.name
	}
}

console.log(person.getName()) // 박경철
```

위 this가 결정되는 방식이 있다.

1. 실행하는 맥락상 소유자

    ```jsx
    console.log(person.getName())
    ```

    위 경우 getName의 this는 person이 가지고 있으므로 this는 person이 된다.

2. 확인이 안되는 경우

    ```jsx
    const man = person.getName

    console.log(man()) // error!
    ```

    호출자에서 확인이 안되는 경우 this는 전역객체가 된다.

3. bind

    ```jsx
    const man = person.getName.bind(person)

    console.log(man()) // 박경철
    ```

    함수 내부의 this를 결정해주도록 하는 함수. 모든 함수가 가지고 있다.

### Closure

보통 값을 보호하기 위해 많이 사용.

```jsx
const person = {
	age: 10,
}

person.age = 500 // js에서는 객체 동적 바인딩으로 가능!
```

이렇게 동적 바인딩으로부터 값을 보호하기위해 클로저를 많이 사용한다.

```jsx
function makePerson() {
	let age = 10;

	return {
		getAge() {
			return age
		},
		setAge(x) {
			age = x
		}
	}
}
```

즉, getAge와 setAge 함수는 상위 makePerson 함수의 값 age에 클로저로 접근할 수 있다.

# 바닐라 자바스크립트로 리덕스 구현해보기

## 리덕스 아키텍처 `Flux Architecture`

앱에서 전역적으로 쓰이는 상태를 보관하는 곳 → store
각자 컴포넌트은 여기서 필요한 데이터를 뽑아서 쓴다. 단, 리엑트 이전에는 불가능했던 부분. 왜냐하면 전역으로 보관하는 상태가 1개 변경될 때마다 모든 UI가 변경되었기 때문.

이게 가능한 이유는 리엑트가 가상돔을 사용하여 다른 부분만 UI를 변경하기 때문에 가능.

## 리덕스 구현해보기

### createStore

```jsx
// redux.js

function createStore() {
		return {} 
}
```

store는 전역적으로 상태를 관리하기 위한 객체

```jsx
// index.js
import { createStore } from 'redux'

const store = createStore();

store.person = {} // danger!
```

리덕스의 store는 immutable해야한다. 즉, 컴포넌트는 리덕스의 상태를 변경할 수 없다. 단, 위 createStore는 단순 객체를 반환하므로 위 `store.person`처럼 동적바인딩이 가능한 상태가 된다.

따라서 클로저를 활용하여 캡슐화해주어야한다.

```jsx
// redux.js
export function createStore() {
	let state;
	const getState = () => ({ ...state })
	return {
		getState,
	}
}
```

또한, state를 그냥 getState에서 제공하지 않고 새로운 객체로 state를 제공

### reducer

> redux의 store에 저장하고 있는 상태를 변경하기 위한 방법.

```jsx
// index.js
import { createStore } from 'redux'

function reducer(state, action) {
	if (action.type === 'action') {
		state.action = 'OK'
	}

	return state
}

const store = createStore(reducer);
```

```jsx
// redux.js
export function createStore(reducer) {
	let state;
	const getState = () => ({ ...state })

	reducer(state, {
		type: 'action'
	})

	return {
		getState,
	}
}
```

단, 위와 같이 reducer를 사용하게 되면 `즉, 직접 store의 state에 접근하게 되면` getState와 같이 state를 숨긴 이유가 없게된다. 따라서 reducer에서도 state를 리턴할 때는 기존 store의 state와 참조를 끊기 위해 새로운 객체로 반환해야한다.

```jsx
// index.js
import { createStore } from 'redux'

function reducer(state, action) {
	if (action.type === 'action') {
		return {
			...state,
			action: 'OK',
		}
	}
}

const store = createStore(reducer);
```

### dispatch

이제 reducer까지 구현했다. 즉, store에 상태를 변경할 수 있는 방법을 제공해주었다. 다만, 상태 변경을 호출할 수 있는 방법을 아직 정의하지 못했다. redux에서는 이 방법을 위해서 dispatch라는 개념을 제공한다.

```jsx
// redux.js
export function createStore(reducer) {
	let state;
	const getState = () => ({ ...state })
	const dispatch = payload => {
		state = reducer(state, payload)
	}

	return {
		getState,
		dispatch,
	}
}
```

```jsx
// index.js
import { createStore } from 'redux'

function reducer(state = {}, action) {
	if (action.type === 'action') {
		return {
			...state,
			action: 'OK',
		}
	}
}

const store = createStore(reducer);

store.dispatch({ type: 'action' })
// 외부에서 store의 상태를 변경할 수 있도록 dispatch 사용
```
