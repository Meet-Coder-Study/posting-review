# Context

`useContext`는 부모-자식 간의 컴포넌트에서 props를 전달하지 않고도 상태를 관리할 수 있도록 도와준다. 이를 통해 Props Drilling을 방지할 수 있다.

> [Props Drilling 참고](https://slog.website/post/13)


## useContext 사용하기

`useContext`를 사용하기 위해서는 먼저 `createContext`로 Context를 생성해야한다.

```tsx
import { createContext } from 'react';

const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee"
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222"
  }
};

const ThemeContext = React.createContext(themes.light);
```

`createContext`로 생성한 `Context`의 `Provider`를 사용하여 `Context`가 가진 값을 사용하고자하는 컴포넌트에 감싸주어야한다.

```tsx
function App() {
  return (
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}
```

위와 같이 `ThemeContext.Provider`를 감싸주면 하위 컴포넌트에서 `useContext`를 통해 `ThemeContext`에 저장된 값을 사용할 수 있다.

```tsx
function Toolbar(props) {
  const theme = useContext(ThemeContext);
  return (
		<button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}
```

즉, 위와 같이 `Toolbar`에서 `ThemeContext`의 값을 가져와 사용할 수 있다. 단, 현재 useContext로 가져온 theme은 `themes.dark` 형태로 전달된다.

### Context의 기본값

`Context`에 기본값을 설정하는 듯한 2가지 방법을 볼 수 있었다.

먼저 `createContext`의 인자를 주는 방식이다.

```tsx
const ThemeContext = React.createContext(themes.light);
```

`themes.light`를 인자로 줌으로써 ThemeContext의 기본값을 `themes.light`로 준듯한 인상을 준다. `themes.light`도 기본값으로 사용되기는 하지만 사용될때는 하위 컨텍스트에서 적절한 `Provider`를 찾지 못했을때 사용된다.

```tsx
function App() {
  return (
    <Toolbar />
  );
}

function Toolbar(props) {
  const theme = useContext(ThemeContext);
  return (
		<button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}
```

방금 예시에서 `App`에 `ThemeContext.Provider`만 제거했다. 이 경우 `Toolbar`에서 사용하고 있는 `useContext(ThemeContext)`는 적절한 `Provider`를 찾지 못하고 이때 `createContext`의 인자로 전달한 값이 반환된다.

두번째 방식은 `Context.Provider`의 value에 값을 전달하는 방식이다. `Context.Provider`는 하위 컴포넌트 트리에 value를 사용할 수 있도록 전달하는 역할을 한다. 때문에 `Context.Provider`가 있는 경우에는 value의 값을 `useContext`를 통해 사용할 수 있다.

## state와 함께 사용하기

상태 관리 API와 함께 Context를 사용한다면 상태의 변화에 따라 구독하고 있는 컴포넌트도 리랜더링된다.

```tsx
// App.tsx
export default () => {
  return (
    <CounterProvider>
        <h1>hello</h1>
        <Counter />
    </CounterProvider>
  );
};
```

위와 같은 `App.tsx`가 있다고 가정한다. 이를 `useState`와 `useReducer`를 각각 이용해서 카운트를 올리고 내리는 코드를 짜본다.

### with useState

먼저 `context.tsx`에 `Context`와 `useState`를 연결한 `CountProvider`를 작성한다.

```tsx
// context.tsx
import React, { createContext, useState } from "react";

const initialCount = {
  count: 0,
  addCount: () => new Error(),
  minusCount: () => new Error()
};

export const CountContext = createContext(initialCount);

export default ({ children }: { children: React.ReactNode }) => {
  const [count, setCount] = useState(0);

  const addCount = () => setCount((prevCount) => prevCount + 1);
  const minusCount = () => setCount((prevCount) => prevCount - 1);

  const contextValue = {
    count,
    addCount,
    minusCount
  };

  return (
    <CountContext.Provider value={contextValue}>
      {children}
    </CountContext.Provider>
  );
};
```

그리고 이 context를 Counter 컴포넌트에서 사용한다.

```tsx
import { useContext } from "react";
import { CounterContext } from "./context";

export default () => {
  const { count, addCount, minusCount } = useContext(CounterContext);

  return (
    <>
      <h1>카운트: {count}</h1>
      <button onClick={() => addCount()}>+</button>
      <button onClick={() => minusCount()}>-</button>
    </>
  );
};
```

상위 컴포넌트인 `App.tsx`에서 `CounterProvider`에 감싸져 있으므로 `CounterContext`를 가지고 `useContext`의 값을 가져올 수 있다. 이제 `+`나 `-`를 누르면 기존 카운트에 각각 1씩 더하거나 빼진다.

### with useReducer

Counter 예시는 매우 간단해서 `useState`로도 충분할 수 있지만 더 복잡한 로직이 들어올때는 `useReducer`를 사용할 수 있다. 참고로 `useReducer`는 `useState`의 변형으로 다수의 하위 로직을 가지는 경우에 사용하면 좋다.

```tsx
// context.tsx
import React, { createContext, Dispatch, useReducer } from "react";

interface Counter {
  count: number;
}

interface CounterAction {
  type: "increment" | "decrement";
}

type CounterDispatch = Dispatch<CounterAction>;

function reducer(state: Counter, action: CounterAction) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

const initialState = {
  count: 0
};

export const CounterContext = createContext<Counter>(initialState);
export const CounterDispatchContext = createContext<CounterDispatch>(
  () => new Error("error")
);

export default ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <CounterContext.Provider value={state}>
      <CounterDispatchContext.Provider value={dispatch}>
        {children}
      </CounterDispatchContext.Provider>
    </CounterContext.Provider>
  );
};
```

`useReducer`의 context.tsx는 위와 같다. `useState`로 구현했을때와 동일하게 카운트를 더하고 빼는 기능을 구현했다.

> 앞선 `useState`를 사용할 때처럼 하나의 Context를 활용할수도 있지만 Dispatch를 관리하는 Context는 따로 관리하도록 구현하였다.

참고로 Provider의 value 값의 변화는 `Object.is`를 통해 감지한다. 때문에 객체를 value로 보내는 경우 의도치 않은 컴포넌트가 랜더링되는 문제가 발생할 수 있다.

이를 방지하기 위해 위 예시처럼 객체가 아닌 value를 사용하거나 Context를 사용하는 컴포넌트에 useState를 활용할 수 있다.

```tsx
import { useContext } from "react";
import { CounterContext, CounterDispatchContext } from "./context";

export default () => {
  const { count } = useContext(CounterContext);
	const dispatch = useContext(CounterDispatchContext);

  return (
    <>
      <h1>카운트: {count}</h1>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
    </>
  );
};
```

마찬가지로 상위 컴포넌트인 `App.tsx`에서 `useReducer`를 통해 구현한 `CounterProvider`에 감싸져 있으므로 `useContext`를 통해 `CounterContext`와 `CounterDispatchContext`에 설정한 값을 사용할 수 있다.

## Context API 성능 최적화

Context API는 하위 컴포넌트 트리에서 prop drilling 없이 state에 접근할 수 있도록 만들어준다. 다만, 하나의 Context에 사용하는 state를 모두 관리하도록 만들면 성능상 문제가 생길 수 있다. Context의 일부 값만 사용하는 경우가 있을텐데 다른 컴포넌트에서 Context의 state 값 중 하나를 변경하더라도 리랜더링이 발생하기 때문이다.

다음과 같은 Counter context가 있다고 가정한다.

```tsx
import React, { createContext, useState, useCallback } from "react";

const initial = {
  count: 0,
  addCount: () => {},
  minusCount: () => {}
};

export const CountContext = createContext(initial);

export default ({ children }: { children: React.ReactNode }) => {
  const [count, setCount] = useState(0);
  const addCount = useCallback(() => setCount((prevCount) => prevCount + 1), []);
  const minusCount = useCallback(() => setCount((prevCount) => prevCount - 1), []);

  const initialState = { count, addCount, minusCount };

  return (
    <CountContext.Provider value={initialState}>
      {children}
    </CountContext.Provider>
  );
};
```

CountContext에서는 count 값 뿐만 아니라 count의 수를 1 늘리는 addCount 함수, 1 빼는 minusCount 함수도 관리한다.

```tsx
// Counter.tsx

import { useEffect, useContext } from "react";
import { CountContext } from "./context";

export default () => {
  const { count } = useContext(CountContext);

  useEffect(() => {
    console.log("Counter re-render");
  });

  return <h1>{count}</h1>;
};
```

```tsx
// HandleCount.tsx
import { useEffect, useContext } from "react";
import { CountContext } from "./context";

export default () => {
  const { addCount, minusCount } = useContext(CountContext);

  useEffect(() => {
    console.log("HandleCount re-render");
  });

  return (
    <div>
      <button onClick={addCount}>+</button>
      <button onClick={minusCount}>-</button>
    </div>
  );
};
```

```tsx
// App.tsx
import "./styles.css";
import Counter from "./Counter";
import HandleCount from "./HandleCount";
import Context from "./context";

export default function App() {
  return (
    <div className="App">
      <Context>
        <Counter />
        <HandleCount />
      </Context>
    </div>
  );
}
```

위와 같이 CountContext의 값 중 count는 Counter 컴포넌트에서, addCount와 minusCount는 HandleCount 컴포넌트에서 사용한다. 위와 같이 구성하면 HandleCount에서 사용하지 않는 count가 변경되더라도 HandleCount에 리랜더링이 발생한다.

> [codesandbox](https://codesandbox.io/s/usecontext-edu-quftwc) 예제 코드 참고

위와 같은 문제 때문에 HandleCount 컴포넌트에서는 count를 사용하지 않도록 Context를 분리하거나 Context Selector 패턴을 사용해야한다.

### Context 값 분리하기

context를 다음과 같이 변경하여 분리한다.

```tsx
import React, { createContext, useState, useCallback } from "react";

const initialCount = 0;

export const CountContext = createContext(initialCount);
export const AddCountContext = createContext(() => {});
export const MinusCountContext = createContext(() => {});

export default ({ children }: { children: React.ReactNode }) => {
  const [count, setCount] = useState(0);
  const addCount = useCallback(() => setCount((prevCount) => prevCount + 1), []);
  const minusCount = useCallback(() => setCount((prevCount) => prevCount - 1), []);

  return (
    <CountContext.Provider value={count}>
      <AddCountContext.Provider value={addCount}>
        <MinusCountContext.Provider value={minusCount}>
          {children}
        </MinusCountContext.Provider>
      </AddCountContext.Provider>
    </CountContext.Provider>
  );
};
```

위와 같이 CountContext에 count, addCount, minusCount를 각각의 Context로 분리한다. 여기서 addCount와 minusCount는 useCallback으로 처리하는데 count가 변경될 때 새로운 함수가 만들어지지 않아야 addCount와 minusCount를 사용하는 컴포넌트도 리랜더링이 발생하지 않기 때문이다.

context를 변경했으니 HandleCount도 변경한다.

```tsx
import { useEffect, useContext } from "react";
import { AddCountContext, MinusCountContext } from "./context";

export default () => {
  const addCount = useContext(AddCountContext);
  const minusCount = useContext(MinusCountContext);

  useEffect(() => {
    console.log("HandleCount re-render");
  });

  return (
    <div>
      <button onClick={addCount}>+</button>
      <button onClick={minusCount}>-</button>
    </div>
  );
};
```

위와 같이 새로 정의한 AddCountContext와 MinusCountContext를 사용하도록 만든다.

> [codesandbox 예제 코드](https://codesandbox.io/s/usecontext-seperate-context-wzgfoh) 참고

### Context Selector

만약 Context를 분리하지 않는다면 Selector 방식을 통해 최적화 할 수 있다.

```tsx
import React, { createContext, useContext, useCallback, useState } from "react";

const initial = {
  count: 0,
  addCount: () => {},
  minusCount: () => {}
};

const CountContext = createContext(initial);

export const withCountSelector = (Component: React.ComponentType<{ count: number }>) => {
  const ComponentMemo = React.memo(Component);

  return () => {
    const { count } = useContext(CountContext);
    return <ComponentMemo count={count} />;
  };
};

export const withCountHandlerSelector = (
  Component: React.SFC<{ addCount: () => void; minusCount: () => void }>
) => {
  const ComponentMemo = React.memo(Component);

  return () => {
    const { addCount, minusCount } = useContext(CountContext);
    return <ComponentMemo addCount={addCount} minusCount={minusCount} />;
  };
};

export default ({ children }: { children: React.ReactNode }) => {
  const [count, setCount] = useState(0);
  const addCount = useCallback(
    () => setCount((prevCount) => prevCount + 1),
    []
  );
  const minusCount = useCallback(
    () => setCount((prevCount) => prevCount - 1),
    []
  );

  const initialState = { count, addCount, minusCount };

  return (
    <CountContext.Provider value={initialState}>
      {children}
    </CountContext.Provider>
  );
};
```

위와 같이 with로 시작하는 Selector를 정의하여 최적화가 가능하다. withCountSelector와 withCountHandlerSelector를 사용하도록 Counter와 HandleCount를 변경한다.

```tsx
// Counter.tsx
import { useEffect } from "react";
import { withCountSelector } from "./context";

const Counter = withCountSelector(({ count }) => {
  useEffect(() => {
    console.log("Counter re-render");
  });

  return <h1>{count}</h1>;
});

export default Counter;
```

```tsx
// HandleCount.tsx
import { useEffect } from "react";
import { withCountHandlerSelector } from "./context";

export default withCountHandlerSelector(({ addCount, minusCount }) => {
  useEffect(() => {
    console.log("HandleCount re-render");
  });

  return (
    <div>
      <button onClick={addCount}>+</button>
      <button onClick={minusCount}>-</button>
    </div>
  );
});
```

위와 같이 withCountSelector와 withCountHandlerSelector를 사용하여 다음과 같이 리랜더링을 방지할 수 있다.

> [codesandbox](https://codesandbox.io/s/usecontext-selectors-pxt2w0) 예제 코드 참고

# 참고

[Context - React](https://ko.reactjs.org/docs/context.html#when-to-use-context)

[Hooks API Reference - React](https://ko.reactjs.org/docs/hooks-reference.html#usecontext)

[Guide to useContext with Blog Example](https://liz-hard.medium.com/guide-to-usecontext-with-blog-example-856c58425724)

[How to Use and Implement Context and useContext Hook with example React Hook's - Beginner Guide](https://medium.com/geekculture/how-to-use-and-implement-context-and-usecontext-hook-with-example-react-hooks-beginner-guide-cb3058a5b4de)

[React Hooks as State Management!(useContext, useEffect, useReducer)](https://medium.com/@seantheurgel/react-hooks-as-state-management-usecontext-useeffect-usereducer-a75472a862fe)

[The Problem with React's Context API](https://leewarrick.com/blog/the-problem-with-context/)

[4. TypeScript 와 Context API 활용하기](https://react.vlpt.us/using-typescript/04-ts-context.html)
