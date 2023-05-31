[5 Advanced React Patterns](https://javascript.plainenglish.io/5-advanced-react-patterns-a6b7624267a6)
[Advanced React Patterns Github](https://github.com/alexis-regnaud/advanced-react-patterns)

## 변경에 유연한 컴포넌트 개발하기

## Compound Component Pattern
Compound Component 패턴을 사용하면 Prop drilling을 피하면서 선언적인 컴포넌트를 생성할 수 있습니다. 또한 관심사 분리로 커스터마이즈하기 좋습니다.

```tsx
import React from "react";
import { Counter } from "./Counter";

function Usage() {
  const handleChangeCounter = (count) => {
    console.log("count", count);
  };

  return (
    <Counter onChange={handleChangeCounter}>
      <Counter.Decrement icon="minus" />
      <Counter.Label>Counter</Counter.Label>
      <Counter.Count max={10} />
      <Counter.Increment icon="plus" />
    </Counter>
  );
}

export { Usage };
```

### Pros

- API 복잡성 감소: 부모 컴포넌트내에 모든 props를 관리하여 자식 컴포넌트로 전달하는 것을 방지하며 적절하게 자식 컴포넌트에게 props를 할당할 수 있습니다.
![](https://miro.medium.com/v2/resize:fit:4800/format:webp/1*w85jLF0VEja0MAveEg4w1A.png)

- 유연한 마크업 구조: 다양한 케이스에 대응하는 UI 유연성을 제공할 수 있습니다. 예를 들어, 자식 컴포넌트들의 순서를 변경하거나 어떤 것이 표시되어야 하는지를 정의할 수 있습니다.
![](https://miro.medium.com/v2/resize:fit:4800/format:webp/1*2jExoAFGc1T-EhZe1F-3TA.png)

- 관심사 분리: 대부분의 로직은 부모 컴포넌트에서 집중되어 처리되며 자식 컴포넌트들과 컨텍스트를 사용하여 상태와 핸들러를 공유합니다. 이로 인해 관심사 분리를 명확하게 할 수 있습니다.
![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*NMgnhqwbOb6jA_q0rt4kEA.png)

### Cons

- 너무 높은 UI의 유연성: 잘못된 자식 컴포넌트 순서, 필수 자식 컴포넌트 누락 등의 상황이 생길 수 있습니다.
![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*ax33uL1Vk8gWTbuVZpPwoQ.png)

- 큰 JSX: 이 패턴은 JSX 행의 수를 늘릴 것이며, 특히 린터(EsLint)나 코드 포맷터(Prettier)를 사용하는 경우 단일 컴포넌트의 규모에서는 큰 문제처럼 보이지 않지만, 전체적인 관점에서 보면 큰 차이가 생길 수 있습니다.
![](https://miro.medium.com/v2/resize:fit:720/format:webp/1*Gl77TWP-Hnp0AmaLx5aS9Q.png)

## 추가 자료
[patterns.dev](https://www.patterns.dev/posts/compound-pattern)
[ketncdodds blog](https://kentcdodds.com/blog/compound-components-with-react-hooks)
