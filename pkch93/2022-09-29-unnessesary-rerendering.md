# 불필요한 re-rendering을 막자

> https://www.developerway.com/posts/react-re-renders-guide 글을 학습한 내용입니다.

리엑트에서 렌더링은 상태 `state`의 변화와 관련있다. 상태를 사용하고 있는 컴포넌트에서 해당 상태가 변경되면 리렌더링이 발생한다. 이때 해당 컴포넌트의 하위 컴포넌트도 모두 리렌더링이 발생하기 때문에 하위 컴포넌트 트리가 큰 컴포넌트라면 성능상 문제가 발생할 수 있다. 때문에 불필요한 리렌더링은 발생하지 않도록 최적화할 필요가 있다.

## 언제 리렌더링이 발생할까?

불필요한 리렌더링을 막기 위해서는 언제 리렌더링이 발생하는지 알아야한다.

### state의 변경

state 변경시 컴포넌트가 리렌더링된다.

```tsx
const Component = () => {
	const [count, setCount] = useState<number>(0);
	
	return (
		<>
			<h1>{count}</h1>
			<button onClick={() => setCount(prevCount => prevCount + 1)}>+</button> // re-render
		</>
	)
};
```

위 예시에서 `+` 버튼을 클릭하면 `setCount`가 실행되면서 `Component`에서 사용하는 state가 변경된다. state가 변경되면서 `Component`가 리렌더링된다.

### 상위 컴포넌트의 리렌더링

상위 컴포넌트의 리렌더링이 발생하면 하위 컴포넌트도 리렌더링된다.

```tsx
// ParentComponent
import React, { useState, useEffect } from "react";

import ChildComponent from "../ChildComponent";

export default () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    console.log("parent re-render");
  });

  return (
    <>
      <ChildComponent />
      <h1>{count}</h1>
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>+</button>
    </>
  );
};
```

```tsx
// ChildComponent
import { useEffect } from "react";

export default () => {
  useEffect(() => {
    console.log("child re-render");
  });

  return <h1>카운트</h1>;
};
```

`+` 버튼을 누르면 상위 컴포넌트인 `ParantComponent`에서 관리하는 count 상태가 변경이 되고 그 하위 컴포넌트인 `ChildComponent`도 동시에 리렌더링이 발생한다.

### context의 변경

ContextProvider로 제공하는 value를 사용하는 모든 컴포넌트는 리렌더링이 발생한다. 이때 context의 값 중 변경된 값을 사용하지 않더라도 리렌더링이 발생한다.

### hooks 변경

hooks 내부에서 state나 context의 변경이 이뤄질 경우 해당 hooks를 사용하는 컴포넌트의 예상치 못한 리랜더링이 발생할 수 있다.

## 조합

> [리엑트 컴포지션](https://www.notion.so/acb34ba5968b4741a857c0976589a75b) 참고

### state 관리 주체 변경

만약 다양한 상태를 관리하는 컴포넌트의 경우 해당 상태를 나누어 DOM 트리의 격리된 부분에서만 사용하도록 만드는 것이 효과적일 수 있다. 예를 들어 form의 상태를 다룰때 상위 컴포넌트에서 해당 form에서 사용할 모든 상태를 관리하고 뷰를 그리는 하위 컴포넌트에 각각의 상태를 관리하는 방법이 있다.

### children

state를 통해 변경되는 부분을 children 주변으로 감싸는 방법이다. 이렇게 하면 children 컴포넌트는 리랜더링에 영향을 받지 않는다.

```tsx
import { useState } from "react";

const Component = () => {
	const [count, setCount] = useState(0);

	return (
		<>
			<VerySlowComponent />
			<button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
		</>
	);
};
```

위와 같이 Counter를 구성하는 경우 `+` 버튼을 클릭할 때마다 VerySlowComponent가 리랜더링된다. 이를 방지하기 위해서는 count 상태를 관리하는 컴포넌트를 따로 두고 조합을 통해 VerySlowComponent를 받는 방식으로 변경해야한다.

```tsx
import React, { useState } from "react";

interface Props {
	children: React.ReactNode
}

const Counter = ({ children }: Props) => {
	const [count, setCount] = useState(0);

	return (
		<>
			{children}
			<button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
		</>
	);
};

const Component = () => {
	return (
		<Counter>
			<VerySlowComponent />
		</Counter>
	);
}
```

위와 같이 변경하면 이제 VerySlowComponent는 이제 count state 변경에 영향을 받지 않기 때문에 count를 변경하더라도 리랜더링이 발생하지 않는다.

### 컴포넌트 전달

children 전달과 유사한 방법이다. props로 전달한 컴포넌트는 리랜더링의 영향을 받지 않는다.

```tsx
import React, { useState } from "react";

interface Props {
	component: React.ReactNode
}

const Counter = ({ component }: Props) => {
	const [count, setCount] = useState(0);

	return (
		<>
			{component}
			<button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
		</>
	);
};

const Component = () => {
	return (
		<Counter component={<VerySlowComponent />}/>
	);
}
```

## React.memo

> [React.memo](https://www.notion.so/9fe15fdba5b046daae3857fa3f7ca370) 참고

`React.memo`를 감싸서 props가 변경되지 않는 이상 해당 컴포넌트가 리랜더링되지 않도록 만들 수 있다.

앞선 **상위 컴포넌트의 리랜더링** 예시도 React.memo를 활용하여 해결할 수 있다.

```tsx
// ParentComponent
import React, { useState, useEffect } from "react";

import ChildComponent from "../ChildComponent";
const ChildComponentMemo = React.memo(ChildComponent);

export default () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    console.log("parent re-render");
  });

  return (
    <>
      <ChildComponentMemo />
      <h1>{count}</h1>
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>+</button>
    </>
  );
};
```

위와 같이 변경하면 count가 변경될 때마다 발생하던 `parent re-render`, `child re-render` 로그가 `parent re-render`만 발생하게된다.

### memo 컴포넌트가 value props를 사용하는 경우

props로 전달하는 value 값도 메모이제이션하여 전달할 수 있다. 이때는 `useMemo` hooks를 사용한다.

앞선 상위 컴포넌트의 랜더링 예시에서 ChildComponent에 obj로 객체를 받도록 변경했다고 가정한다.

```tsx
// ParentComponent
import React, { useState, useEffect } from "react";

import ChildComponent from "../ChildComponent";

const ChildComponentMemo = React.memo(ChildComponent);

export default () => {
  const [count, setCount] = useState<number>(0);
  const temp = { hello: "world" };

  useEffect(() => {
    console.log("parent re-render");
  });

  return (
    <>
      <ChildComponentMemo obj={temp} />
      <h1>{count}</h1>
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>+</button>
    </>
  );
};
```

```tsx
// ChildComponent
import { useEffect } from "react";

interface Props {
  obj: {
    hello: string
  }
}

export default ({ obj }: Props) => {
  useEffect(() => {
    console.log("child re-render");
  });

  return (
   <>
     <h1>카운트</h1>;
     {obj.hello}
   </> 
  )
};
```

ParentComponent에서 ChildComponent의 obj로 넘기는 temp는 객체이기 때문에 그냥 사용했을 경우 리렌더링마다 새로운 객체를 생성해서 전달한다. 즉, `React.memo`로 메모이제이션을 하더라도 props가 이전과 달라졌기 때문에 리랜더링이 발생한다. 심지어 객체의 내용물이 같더라도 말이다.

이런 리랜더링을 방지하기 위해서는 `useMemo`를 사용하여 이전과 동일한 객체가 넘어가도록 만들어야한다.

```tsx
// ParentComponent
import React, { useState, useEffect, useMemo } from "react";

import ChildComponent from "../ChildComponent";

const ChildComponentMemo = React.memo(ChildComponent);

export default () => {
  const [count, setCount] = useState<number>(0);
  const temp = useMemo(() => ({ hello: "world" }), []);

  useEffect(() => {
    console.log("parent re-render");
  });

  return (
    <>
      <ChildComponentMemo obj={temp} />
      <h1>{count}</h1>
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>+</button>
    </>
  );
};
```

위와 같이 useMemo를 사용하면 temp는 항상 동일하다. `2번째 인자의 deps 배열이 비어있기 때문` 따라서 이전과 동일한 props를 전달하게 되고 리랜더링을 막을 수 있게 된다.

### memo 컴포넌트의 props로 컴포넌트를 넘기는 경우

props로 컴포넌트나 children을 전달하는 경우 props로 컴포넌트를 넘기는 Parent가 리랜더링되면 props로 전달하려는 컴포넌트들도 리랜더링된다. 이때도 `React.memo`를 통해 메모이제이션을 하면 리랜더링을 피할 수 있다.

앞선 상위 컴포넌트의 랜더링 예시를 활용하여 ChildComponent에 컴포넌트를 전달하는 예시를 아래와 같이 구성해본다.

```tsx
// ParentComponent
import React, { useState, useEffect } from "react";

import ChildComponent from "../ChildComponent";
import Count from "../Count";

const ChildComponentMemo = React.memo(ChildComponent);

export default () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    console.log("parent re-render");
  });

  return (
    <>
      <ChildComponentMemo count={<Count />} />
      <h1>{count}</h1>
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>+</button>
    </>
  );
};
```

```tsx
// ChildComponent
import React, { useEffect } from "react";

interface Props {
  count: React.ReactNode;
}

export default ({ count }: Props) => {
  useEffect(() => {
    console.log("child re-render");
  });

  return <>{count}</>;
};
```

```tsx
// Count
import { useEffect } from "react";

export default () => {
  useEffect(() => {
    console.log("count re-render");
  });

  return <h1>카운트</h1>;
};
```

위와 같이 구성하여 ChildComponent에 Count 컴포넌트를 그대로 전달하면 다음과 같이 `+` 버튼을 누를때마다 매번 parent, child, count 세 컴포넌트에서 리랜더링이 발생한다.

즉, 아무 state도 받지 않는 Count임에도 ParentComponent가 리랜더링되면서 Count도 리랜더링되는 것이다. 때문에 Count도 `React.memo`를 통해 메모이제이션 한다면 count가 리랜더링 되는 문제를 막을 수 있다.

```tsx
// ParentComponent
import React, { useState, useEffect } from "react";

import ChildComponent from "../ChildComponent";
import Count from "../Count";

const CountMemo = React.memo(Count);

export default () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    console.log("parent re-render");
  });

  return (
    <>
      <ChildComponent count={<CountMemo />} />
      <h1>{count}</h1>
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>+</button>
    </>
  );
};
```

참고로 ChildComponent의 리랜더링은 막을 수 없다. props와 children은 object이기 때문에 상위 컴포넌트의 리랜더링마다 props가 다른 객체로 변경된다. 이를 방지하기 위해서는 전달하는 CountMemo에 useMemo를 사용해야한다.

```tsx
// ParentComponent
import React, { useState, useEffect, useMemo } from "react";

import ChildComponent from "../ChildComponent";
import Count from "../Count";

const ChildComponentMemo = React.memo(ChildComponent);

export default () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    console.log("parent re-render");
  });

  return (
    <>
      <ChildComponentMemo count={useMemo(() => <Count />, [])} />
      <h1>{count}</h1>
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>+</button>
    </>
  );
};
```

다음과 같이 React.memo와 useMemo를 활용해서 Count가 동일한 참조를 반환하도록 만들면 이제 child도 리랜더링을 피할 수 있다.
