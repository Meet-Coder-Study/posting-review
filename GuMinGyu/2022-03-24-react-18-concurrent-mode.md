---
title: React v18 Concurrent mode
date: 2022-03-24
tags: [react]
keywords: ["react 18", "react", "concurrent mode"]
---

아직 React 18이 정식 릴리즈되지 않았지만 [React 18 Plan](https://ko.reactjs.org/blog/2021/06/08/the-plan-for-react-18.html)을 통해 어떤 기능들이 추가되는지 대부분 알고 있을 것이라고 생각됩니다. 아마 실제로 사용하고 있는 팀들도 있을 것 같네요.

react-18-plan 블로그의 첫 문단을 읽어보면 react 18에서 어떤 부분을 강조하고 있는지 나옵니다.

> When it’s released, React 18 will include out-of-the-box improvements (like automatic batching), new APIs (like startTransition), and a new streaming server renderer with built-in support for React.lazy.
>
> 이러한 기능들이 가능한건 "concurrent rendering"이라고 부르는 opt-in 매커니즘이 React 18에 추가되었기 때문이다. 이것은 React가 동시에 여러 버전의 UI를 준비할 수 있게합니다. 이러한 변화는 인지 범위 밖에 있지만 실제 성능과 인지 성능을 모두 개선할 수 있는 새로운 가능성을 열어줍니다.

글에서 "concurrent rendering"을 강조하고 있듯이 이번 v18의 핵심주제는 concurrent rendering입니다.

React v16.3에 나온 Fiber도 그렇고 이번 v18에 올라온 Concurrent mode에도 그렇듯이 UX을 매우 중시하여 지속적으로 개선시키는 노력을 하고 있습니다. 그리고 그러한 노력에는 update-rendering을 할때 발생하는 recoiliation의 시간이 오래걸리면 UX를 해치는데 이를 어떻게 최적화할 수 있을까? 라는 문제해결이 바탕이 된 것 같습니다.

React Fiber의 경우 Reconciliation에서 시간이 오래걸릴 경우 main-thread를 계속 점유하고 있으니 RequestAnimationFrame Queue에 쌓여 있는 작업들이 화면주사율에 따라 제대로 실행되지않아 버벅이는 문제를 해결하고자 나왔습니다.

이번 Concurrent mode의 경우 RequestAnimationFrame에서 확장하여 다른 유저 이벤트들도 제대로 보여주지 않는 문제들을 해결하려고 했습니다. 예를 들자면 렌더링이 진행중일 때 유저가 input창에 key를 입력해도 입력한 key가 보이지 않는경우 (Blocking rendering의 문제)가 있습니다.

React 팀의 지속적인 관심과 노력으로 위의 문제점들을 해결하려고 했던 것 같고 이번 v18에 concurrent mode를 적용함으로써 도입되는 매우 유용한 기능들도 있습니다.

다음으로 공식문서에 올라왔던 Concurrent 모드 소개 페이지를 읽기 쉽게 제가 조금 가다듬어 보았습니다. 아직 읽어보지 않으셨다면 읽어보시면 좋을 것 같습니다.

> [Concurrent 모드 소개(실험 단계)](https://ko.reactjs.org/docs/concurrent-mode-intro.html) 포스팅을 참고하여 작성했습니다.

## Blocking vs Interruptible Rendering

React를 포함한 UI 라이브러리들은 화면의 렌더링(create or update)을 시작하면 다른 일을 수행할 수 없습니다. 이러한 것을 "blocking rendering"이라고 합니다.

Concurrent 모드에서는, 렌더링이 차단되지 않고 인터럽트가 가능해집니다. 이는 UX를 개선하며 이전에 사용할 수 없었던 기능들을 사용할 수 있도록 만들어줍니다.

### Interruptible Rendering

필터링 가능한 제품 목록 페이지를 생각해세요. 필터에 입력을 할 때마다 버벅거림을 느낀 적이 있나요? 제품 목록을 업데이트하는 몇몇 작업에서 이는 불가피할 수 있습니다. 그러면 어떻게 이런 문제를 해결할 수 있을까요?

버벅거림을 해결하는 한 가지 방법은 입력을 Debouncing 하는 것입니다. Debouncing하면, 사용자가 타이핑을 멈춰야만 목록을 업데이트합니다. 하지만, 타이핑하고 있을 때 UI가 업데이트하지 않는 사실이 실망스러울 수 있습니다. 이에 대한 대안으로, 입력을 throutle하여 목록을 최대 빈도수로 업데이트 할 수 있습니다.(예를들어 200ms 마다) 그러나 저전력 장치에서는 여전히 버벅거릴 것입니다. Debouncing & Throutling 모두 최적이 아닌 UX를 가져다줍니다.

버벅거리는 이유는 간단합니다. 렌더링이 시작되면 중간에 다른 작업이 끼어들 수 없기 때문입니다. 그래서 렌더링이 진행중인 경우 텍스트 입력의 키를 눌러도 입력된 키가 input창에 바로 보이지 않습니다. 이런 blocking rendering을 사용하고 컴포넌트의 일정량 작업을 하면 항상 버벅임이 발생할 것 입니다.

**Concurrent 모드는 렌더링을 인터럽트 가능하도록 만듦으로써 근본적인 문제를 수정합니다.** 이러한 사실은 사용자가 다른 키를 누를 때, React는 브라우저에 텍스트 입력을 업데이트하는 것을 차단할 필요가 없음을 의미합니다. 대신 React는 브라우저가 입력에 대한 업데이트를 paint하고 메모리 내에 있는 업데이트 목록을 계속 렌더링할 수 있도록 합니다. 렌더링이 끝나면 React는 DOM을 업데이트하고 변경 사항들을 화면에 반영합니다.

개념상으로, React가 "브랜치에서" 모든 업데이트를 준비하는 것으로 생각할 수 있습니다. Concurrent모드에서 React는 더 중요한 일을 위해 진행 중인 업데이트를 중단할 수 있고 그리고서 이전 작업으로 돌아갈 수도 있습니다.

Concurrent모드 기술은 UI에서 디바운싱과 스로틀링의 필요성을 줄입니다. 렌더링은 중단이 가능하기 때문에 버벅거림을 피하고자 일부러 작업을 지연시킬 필요가 없습니다.

### 의도적인 로딩 시퀀스

앱에서 두 화면 사이를 탐색한다고 가정하겠습니다. 경우에 따라서, 새 화면에서 사용자에게 "충분히 좋은" 로딩 state를 보여주기 위해 필요한 코드와 데이터를 불러오지 못 할 수 있습니다. 빈 화면이나 큰 스피너로 전환하는 것은 어려운 일이 될 수 있지만 일반적으로 필요한 코드와 데이터를 가져오는 데에 그렇게 많은 시간이 소요되지않습니다. **React가 기존 화면에서 조금 더 오래 유지할 수 있고 새 화면을 보여주기 전에 "안좋은" 로딩 state를 "건너띌 수" 있다면 더 좋지 않을까요?**

Concurrent 모드에서는 이 기능이 내장되어 있습니다. React는 먼저 메모리에서 새로운 화면을 준비하기 시작합니다. 그래서 React는 더 많은 콘텐츠를 불러올 수 있도록 DOM을 업데이트하기 전에 기다릴 수 있습니다. (즉 새로운 화면을 준비하기 전까지 이전 화면을 계속 표시합니다.)

### 동시성

**Concurrent모드에서 React는 여러 작업을 동시에, 다른 팀원들이 각자 작업할 수 있는 브랜치처럼, 진행할 수 있습니다.**

- CPU 바운드 업데이트의 경우 Concurrency는 더욱 긴급한 업데이트가 이미 시작한 렌더링을 "중단" 할 수 있습니다.
- IO 바운드 업데이트(예를 들어 네트워크에서 코드나 데이터를 가져오는 것)의 경우 Concurrency는 모든 데이터가 도달하기 전에 React가 메모리에서 렌더링을 시작할 수 있으며 빈 로딩 state표시를 무시할 수 있음을 의미합니다.

React는 휴리스틱을 사용하여 업데이트의 "급함" 정도를 결정하고 몇 줄의 코드를 수정해서 사용자가 모든 상호작용에 대해 원하는 사용자의 경험을 얻을 수 있도록 합니다.

### 생산에 연구를 투입

Concurrent모드 내부적으로 사용하는 다른 "우선순위"는 사람들의 인식에 대한 조사에서의 상호 작용에 대한 부분과 대략적으로 일치합니다.

Concurrent 모드를 통한 목적은 UI 조사 결과를 추상화시키고 그것을 사용할 관용적인 방법을 제공하는 것입니다.
