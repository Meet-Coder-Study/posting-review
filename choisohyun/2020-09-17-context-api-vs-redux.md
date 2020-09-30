# [React] Context API 와 Redux 비교하기

> 리액트에서 전역 상태를 관리할 때 많이 쓰는 Context API 와 Redux를 사용법과 장단점 위주로 비교해 보겠습니다.

## 개요

1. 전역 상태 관리는 언제 할까?
2. Context API의 특징
3. Redux의 특징
4. 요약 및 결론

## 1. 전역 상태 관리는 언제 할까?

> 상태 관리는 View 중심으로 이루어진 React Component에서 `변하는 값에 대한 상태를 관리한다`고 할 수 있습니다.

- 우선, React의 useState를 이용하면 지역 상태 관리를 할 수 있습니다. 이를 사용하는 컴포넌트 안 혹은 props로 전달할 때만 하위 컴포넌트에서 사용할 수 있습니다.
- 모든 상태 관리를 useState만을 이용하여 진행할 수도 있습니다. 하지만 여러 컴포넌트에서 사용되는 상태라면 props로 하나씩 내려 주기에는 한계가 있습니다.
- 이 때 사용하는 전역 상태 관리 도구가 Context API, Redux 등과 같은 도구들입니다.

## 2. Context API의 특징

- React에서만 사용할 수 있습니다. (리액트 내장 기능)
- Entry 파일(root)에서 구성한 Provider를 내려 주는 형식입니다.
- 사용하고자 하는 컴포넌트에서 작성한 Dispatch와 State를 꺼내서 사용합니다.
- reducer를 여러 개 만들면 Provider에서 여러 단계로 만들어 사용할 수 있습니다.

### 사용 방식

#### Context 생성

- createContext를 통해 상태를 저장하게 됩니다.
- initState에 초기 상태값을 객체 형태로 넣으면 됩니다.

```jsx
import { createContext } from "react";
const GameBoardStateContext = createContext(initState});
```

#### Action 생성

- 액션을 지정하여 Reducer에서 서로 다른 타입일 때 다른 로직을 진행시킬 수 있습니다.

```jsx
export type Action = { type: "UPDATE"; payload };
```

#### Reducer 생성

- 액션에 따라 state를 변경시키는 로직을 작성할 수 있습니다.

```jsx
import { Action } from "@/actions/gameBoardAction";
import { GameBoardState } from "@/contexts/gameBoardContext";

const gameBoardReducer = (state: GameBoardState, action: Action): GameBoardState => {
  switch (action.type) {
    case "UPDATE":
      return {
        ...action.payload,
        // 변경되는 payload 로직 작성
      };
    default:
      throw new Error("Unhandled action");
  }
};
```

#### Provider 생성

- 위에서 작성한 GameBoardStateContext를 Provider로 하여 state값을 value로 넣습니다.
- React의 useReducer에서 상태값과 dispatch를 value로 사용할 수 있습니다. (해당 예제에서는 state만 Provider로 사용하였지만 중첩된 Provider로 여러 상태를 넣을 수 있습니다.)

```jsx
export const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameBoard, gameBoardDispatch] = useReducer(gameBoardReducer, initState);

  return (
    <GameBoardStateContext.Provider value={gameBoard}>{children}</GameBoardStateContext.Provider>
  );
};
```

#### Entry 파일에 적용

- 위에서 생성한 Provider를 Entry 파일인 App의 root에 감싸 주면 Provider 밑에 작성하는 하위 컴포넌트들에서 상태를 꺼내 사용할 수 있습니다.

```jsx
const App = () => {
  return (
    <>
      <ContextProvider>// 하위 컴포넌트들</ContextProvider>
    </>
  );
};
```

#### 개별 컴포넌트에서 사용하기

- 하위 컴포넌트에서 상태를 사용할 때는 useContext를 통해 state 값을 꺼내 사용 가능합니다.

```jsx
import { useContext } from "react";

const state = useContext(GameBoardStateContext);
```

## 3. Redux의 특징

- React, Vue와 같은 프레임워크 환경에서 사용할 수 있습니다.
- 상태를 저장하는 Store를 따로 가지고 있습니다.
- thunk, saga와 같은 미들웨어를 추가적으로 사용하여 구성할 수 있습니다.
- Redux devtool extension을 사용하면 상태에 대한 디버깅이 가능합니다.
- 전역 상태 관리 외에도 로컬스토리지 상태저장, 버그리포트 첨부 기능 등의 기능들을 사용할 수 있습니다.

### 사용 방식

#### Action 생성

- 상태가 변하는 것에 대한 액션을 함수로 작성합니다.

```jsx
export const focusChange = (payload) => {
  return {
    type: "focusChange",
    payload,
  };
};
```

#### Reducer 생성

- 초기 상태를 설정하고, Action을 type으로 구별하여 상태를 업데이트하는 로직을 Reducer로 작성합니다.

```jsx
const initialState = {
  startDate: null,
  endDate: null,
  focusedInput: START_DATE,
};

const datePickerReducer = (state = initialState, action) => {
  switch (action.type) {
    case "focusChange":
      return { ...state, focusedInput: action.payload };
    default:
      return state;
  }
};
```

#### Store 생성

- redux의 createStore를 통해 store의 인자에 생성한 Reducer를 넣어 생성합니다.
- 만약 Reducer가 여러 개라면 combineReducer를 통해 Reducer를 하나로 합치는 과정을 추가로 진행해야 합니다.

```jsx
import { createStore } from "redux";
const store = createStore(datePickerReducer);
```

#### react-redux의 Provider로 root에 store 등록

- Entry 파일에서 Provider에 store를 등록합니다.

```jsx
import { Provider } from "react-redux";
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
);
```

#### useSelector로 개별 컴포넌트에서 사용

- 상태 값을 사용하고자 하는 컴포넌트에서 useSelector로 상태 객체를 꺼내서 사용할 수 있습니다.
- 아래는 state를 distructuring한 모습입니다.

```jsx
import { useSelector } from "react-redux";
const {
  datePickerReducer: { startDate, endDate },
} = useSelector((state) => state);
```

## 4. 요약 및 결론

- 결론적으로 보면 Context API와 Redux는 사용법과 그 구조에 조금 차이가 있을 뿐 전역 상태를 관리한다는 점에서는 유사합니다. 애초에 Redux가 Context API를 기반으로 만들어진 것이기 때문이기도 합니다.
- 단순 전역 상태 관리만 있어도 된다면 Context API, 디버깅이나 로깅 등의 상태 관리 외의 기능이나 미들웨어가 필요하다면 Redux를 사용하는 것이 좋다고 여겨집니다.
- 사용 방식 예제는 진행했던 프로젝트에서 약식으로 인용하였습니다. 아래를 통해 전체 코드를 볼 수 있습니다.

  - [Context API](https://github.com/codesquad-member-2020/baseball-09)
  - [Redux](https://github.com/codesquad-member-2020/airbnb-08)

- 경험 상으로는 Context API와 Redux 모두 상태 관리를 편하게 해 준다는 점에서 장점이 있었고, 사용법에서는 큰 차이를 느끼지 않았습니다.
  - Context API는 React를 사용할 때 추가 dependency 없이 사용할 수 있어서 가볍게 사용할 수 있다는 점에서 좋았습니다. 하지만 상태를 넘겨줄 때 상태가 여러 개라면 Provider를 중첩해서 내려 줘야 하기 때문에 그런 불편했습니다.
  - Redux는 saga, thunk와 같은 미들웨어를 추가적으로 사용할 수 있어 비동기 처리를 따로 Util로 처리할 수 있어서 좋았습니다. 추가 설정을 통해 디버깅을 가시적으로 할 수도 있어 편했습니다. 하지만 미들웨어를 사용하기 위해 관련 개념을 이해해야 하기 때문에 어려운 점이 있었습니다.

## 참고

[https://www.robinwieruch.de/redux-vs-usereducer](https://www.robinwieruch.de/redux-vs-usereducer)

[https://medium.com/@ca3rot/아마-이게-제일-이해하기-쉬울걸요-react-redux-플로우의-이해-1585e911a0a6](https://medium.com/@ca3rot/%EC%95%84%EB%A7%88-%EC%9D%B4%EA%B2%8C-%EC%A0%9C%EC%9D%BC-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-%EC%89%AC%EC%9A%B8%EA%B1%B8%EC%9A%94-react-redux-%ED%94%8C%EB%A1%9C%EC%9A%B0%EC%9D%98-%EC%9D%B4%ED%95%B4-1585e911a0a6)

[https://velog.io/@cada/React-Redux-vs-Context-API#context](https://velog.io/@cada/React-Redux-vs-Context-API#context)

https://ko.reactjs.org/docs/context.html#before-you-use-context
