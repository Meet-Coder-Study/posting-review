# Redux 미들웨어

# 미들웨어란?

클라이언트와 서버간의 통신을 담당하는 시스템 소프트웨어 또는 컴퓨터와 컴퓨터의 연결을 담당하는 시스템 소프트웨어

→ Middle(중간) + Ware(소프트웨어) 의 합성어!

# Redux  미들웨어

![Redux%20%E1%84%86%E1%85%B5%E1%84%83%E1%85%B3%E1%86%AF%E1%84%8B%E1%85%B0%E1%84%8B%E1%85%A5%207ea70e1fdf6d4d029dd024064ecd4c28/redux-middleware.png](Redux%20%E1%84%86%E1%85%B5%E1%84%83%E1%85%B3%E1%86%AF%E1%84%8B%E1%85%B0%E1%84%8B%E1%85%A5%207ea70e1fdf6d4d029dd024064ecd4c28/redux-middleware.png)

출처 : [https://redux-advanced.vlpt.us/images/redux-middleware.png](https://redux-advanced.vlpt.us/images/redux-middleware.png)

액션이 디스패치 되어 리듀서에서 처리 전 사전에 지정된 작업들을 설정

→ 액션과 리듀서 사이의 중간자!

리덕스 미들웨어는 리덕스가 지니고 있는 핵심 기능으로 Context API 또는 MobX를 사용하는 것과 차별화 되는 부분!

## 미들웨어 수행 작업

→ 액션이 디스패치 된 다음, 리듀서에게 해당 액션을 받아와서 업데이트하기 전 추가적 작업 수행

- 특정 조건에 따라 액션 무시
- 액션 콘솔 출력 or 서버쪽에서 로깅
- 액션 디스패치 시 수정해 리듀서에게 전달
- 특정 액션 발생 시 특정 동작 실행

## 미들웨어 동작

→ dispatch() 메소드를 통해 store로 가고 있는 액션을 가로채는 코드로 미들웨어는 하나의 함수!!

```jsx
const middleware = store => next => action => {
  ...
}

function middleware(store) {
  return function (next) {
    return function (action) {
      ...
    };
  };
};
```

- `store` : 리덕스 스토어 인스턴스
    - `dispatch` `getState` `subscribe` 내장 함수 포함
- `next` : 액션을 다음 미들웨어에게 전달
    - `next(action)` 형태로 사용
    - 다음 미들웨어 존재하지 않을 시 리듀서에게 액션 전달
    - `next` 호출 X 시 액션이 무시되어 리듀서에게로 전달X
- `action` : 처리하고 있는 액션 객체

→ 리덕스 스토어에는 여러 개의 미들웨어 등록 가능

- `next(action)` 호출 시 다음 미들웨어로 액션 넘어감
- `store.dispatch` 사용시 다른 액션 추가적으로 발생 가능

## 미들웨어 적용

- 스토어에 미들웨어 적용시 applyMiddleware 함수 사용

```jsx
const store = createStore(rootReducer, applyMiddleware(미들웨어));
```

# 비동기 작업 위한 Redux 미들웨어

## Redux 동기적인 흐름

→ 리덕스는 동기적인 흐름을 통해 동작한다!

액션 객체 생성

디스패치 액션 발생 스토어에 알림

리듀서 정해진 로직에 의해 액션 처리 후 상태값 반환

→ 시간 딜레이 시켜 동작, 외부 데이터 요청해 그에 따른 응답 화면에 보여주는 비동기 작업 처리 어려움

→ 비동기 작업을 처리하는 데 리덕스 미들웨어 주로 사용

## 비동기 위한 미들웨어 라이브러리 종류

- **redux-thunk → 비동기 작업 처리시 가장 많이 사용 미들웨어**
    - 객체가 아닌 함수 형태의 액션을 디스패치 가능하게 함
- redux-saga
    - 특정 액션이 디스패치되었을 때 정해진 로직에 따라 다른 액션을 디스패치 시키는 규칙 작성으로 비동기 작업 처리
- redux-observable
- redux-promise-middleware

## Redux-thunk 이용한 비동기 작업

- Redux-thunk 사용하면 액션 객체가 아닌 함수 디스패치 가능!
- 리덕스 창시자인 댄 아브라모프가 만들었음

### Thunk란?

- 특정 작업을 나중에 할 수 있도록 미루기 위해 함수 형태로 감싼 것
- ex ) 주어진 파라미터에 1을 더하는 함수 생성

    ```jsx
    const addOne = x => x + 1;
    addOne(1); //2

    //연산 나중으로 미룸
    const addOne = x => x + 1;
    function addOneThunk = x => addOne(x);

    const fn = addOneThunk(1);
    setTimeout(() => {
    	const value = fn(); //여기서 실행된다!!
    	console.log(value);
    },1000);//1초 뒤

    ```

    →redux-thunk lib 사용하면 thunk 함수 만들어서 디스패치 가능

    ```jsx
    const simpleThunk = () => (dispatch, getState) => {
    	//현재 상태 참조할 수 있고, 새 액션 디스패치 가능
    }
    ```

    → 리덕스 미들웨어 함수 전달 받음 → store의 dispatch와 getState를 파라미터로 넣어 호출

### Redux-thunk 적용

- index.js

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './modules';
import logger from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk from 'redux-thunk';

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(ReduxThunk, logger)) //여러개의 미들웨어 적용
); 

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
```

- modules/counter.js

```jsx
import {createAction, handlerActions} from 'redux-actions';

// 액션 타입
const INCREASE = 'INCREASE';
const DECREASE = 'DECREASE';

// 액션 생성 함수
export const increase = () => ({ type: INCREASE });
export const decrease = () => ({ type: DECREASE });

export const increaseAsync = () => dispatch => {
  setTimeout(() => dispatch(increase()), 1000);//counter 값을 비동기적으로 변경
};
export const decreaseAsync = () => dispatch => {
  setTimeout(() => dispatch(decrease()), 1000);
};

// 초깃값(객체 아닌 숫자도 가능)
const initialState = 0;

export default function counter(state = initialState, action) {
  switch (action.type) {
    case INCREASE:
      return state + 1;
    case DECREASE:
      return state - 1;
    default:
      return state;
  }
}
```

- container/CounterContainer.js

```jsx
import React from 'react';
import Counter from '../components/Counter';
import { useSelector, useDispatch } from 'react-redux';
import { increaseAsync, decreaseAsync } from '../modules/counter';

function CounterContainer() {
  const number = useSelector(state => state.counter);
  const dispatch = useDispatch();

  const onIncrease = () => {
    dispatch(increaseAsync());
  };
  const onDecrease = () => {
    dispatch(decreaseAsync());
  };

  return (
    <Counter number={number} onIncrease={onIncrease} onDecrease={onDecrease} />
  );
}

export default CounterContainer;
```

# 출처

[https://rollercoaster25.tistory.com/78](https://rollercoaster25.tistory.com/78)

[https://helloworld-88.tistory.com/121](https://helloworld-88.tistory.com/121)

리액트를 다루는 기술