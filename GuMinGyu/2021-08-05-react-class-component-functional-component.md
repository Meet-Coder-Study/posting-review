---
title: React가 Class Component에서 Functional Component로 패러다임을 전환한 이유
author: mingyu.gu
date: 2021.08.05
---

# React가 Class Component에서 Functional Component로 패러다임을 전환한 이유

## 1. Reusing logic

> you often end up with this wrapper hell

React 개발자들은 code 재사용을 위해 `Higher-order components`, `Render props` 두 메인 패턴을 사용하고 있습니다.

하지만 이런 패턴의 사용은 컴포넌트의 재구성을 강요하며, 코드의 추적을 어렵게 만듭니다. 이런 패턴들을 사용하게 되면 React 개발자 도구에서 providers, hoc, render props 그리고 다른 추상화 레이어로 둘러싸인 "레퍼 지옥(wrapper hell)"을 보게 됩니다.

Hook을 사용하면 컴포넌트로 부터 상태관련 로직을 추상화 할 수 있습니다. 이를 통해 독립적인 테스트와 재사용이 가능합니다. **Hook은 계층의 변화없이 상태 관련 로직을 재사용할 수 있도록 도와줍니다.** 이것은 많은 컴포넌트들 사이에서 Hook을 공유하기 쉽게 만들어 줍니다.

상태로직의 재사용의 경우 Vue2에서는 Mixin을 사용하기에 React에서도 Mixin을 만들어 Class Component에 붙여 사용하면 되지 않느냐고 할 수 있겠지만, React 팀은 Mixin의 사용을 예전부터 극도로 싫어했습니다.

### mixin을 싫어하는 이유

[Mixins Considered Harmful - React Blog](https://ko.reactjs.org/blog/2016/07/13/mixins-considered-harmful.html)

## 2. Giant components

> logic split across different life cycles

life-cycle method를 파악하기 힘들어 컴포넌트가 unmounted 될 때 리소스를 clean up 하는 것을 잊거나 life-cycle method와 관련없는 로직들이 섞여들어가기도 쉽습니다.
또한 life-cycle 관련 로직들이 한 공간안에 묶여 있기 때문에 컴포넌트들을 작게 분리하기 힘들고 테스트하기도 어렵습니다.

이런 문제를 해결하기 위해 life-cycle method를 기반으로 쪼개는 것 보다는, **hook을 통해 서로 비슷한 것을 하는 작은 함수의 묶음으로 컴포넌트를 나누는 방법을 사용할 수 있게 만들었습니다.**

## 3. Confusing classes

> difficult for both humans and machines

### Hard for humans

Class Component를 사용할 때 이벤트 핸들러가 등록되는 방법을 정확히 파악해야 했으며, JavaScript의 `this`가 어떻게 동작하는지도 알아야만 했습니다.

React 내의 함수와 Class 컴포넌트의 구별, 각 요소의 사용 타이밍 등은 숙련된 React 개발자 사이에서도 의견이 일치하지 않습니다. (많은 개발자들이 binding하는 방식과 class에서 동작하는 작업들에 혼란을 많이 느꼈다고 react-core 팀에 많이 호소를 했다고 합니다.)

### Hard for machines

React App을 빌드해서 manified component file들을 보게된다면 manified된 method names과 여전히 manified되지 않은 method name들을 볼 수 있습니다. manified되지 않은 method name이 있다는 것은 사용하지 않는 method가 있더라도 삭제되지 않는 다는 것을 이야기하고, 이는 컴파일시간이 오래걸리는 것을 말해줍니다.(functional component에서는 사용하지 않는 inner function들이 자동삭제) 이는 class가 hot reloading을 안정적으로 구현하기 어렵다는 것을 말해줍니다.

실제로 react-core team이 class component 와 functional component를 prototyping하여 컴파일러가 컴포넌트 성능을 개선시킬 수 있는지 테스트 해보았을 때, 클래스형 컴포넌트는 컴파일러가 최적화하는 것을 어렵게하는 일부 패턴들이 있었다고 합니다.

# reference

- https://youtu.be/dpw9EHDh2bM?t=287
- https://ko.reactjs.org/docs/hooks-intro.html#motivation
