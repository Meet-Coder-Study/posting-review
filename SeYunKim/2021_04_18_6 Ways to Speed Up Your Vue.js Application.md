![image](https://user-images.githubusercontent.com/53366407/115134332-3872be00-a04a-11eb-8da5-2928739869df.png)

만약 Google의 PageSpeed Insights나 Google Lighthouse를 사용해봤다면, 아래와 같은 웹페이지의 성능 평가를 봤을 것이다.

![image](https://user-images.githubusercontent.com/53366407/115134337-3dd00880-a04a-11eb-9d11-8c3d3c674946.png)

어떻게 하면 웹사이트의 속도가 향상될 수 있는지에 대한 진단의 통계들을 받았을 것이다.

쉽게 수정되는 것, 사용하지 않는 파일, 느리거나 많은 공간을 차지하는 요청들을 볼 수 있어 몇몇 진단들을 꽤 유용할 수 있습니다.

메인 쓰레드 작업, 자바 스크립트 실행 시간와 같은 것을 보여주는 진단들은 문제점을 보여주지만, 실제 문제를 해결하기 위해 도움이 되지는 않습니다.

이 글은 Vue Application이 가능한 빠르게 동작할 수 있도록 몇가지 단계를 소개합니다.

단계들을 통해 무엇을 고쳐야 할지 추측하는 것이 아니라 정확히 알 수 있을 겁니다.

### 1. 필요한 항목만 업데이트 하자(Update Only What's Needed)

Vue.JS에서 발생할 수 있는 가장 심각한 문제중 하나는 동일한 요소들이나 요소들이 필요한 횟수보다 랜더링이 되는 것입니다. 이러한 일이 왜, 어떻게 발생하는지 이해하기 위해서는 우리는 Vue의 반응형(reactivity)를 알아야 합니다.

이 예제는 Vue.js 공식문서에서 가져온 것이며, 반응형(reactivity) 속성과 반응형(reactivity)이 아닌 속성을 보여줍니다. Vue에는 반응형(reactivty)가 있습니다. : data, computed, 반응형(reactivty) 속성에 의존하는 methods 등

```jsx
var vm = new Vue({
  data: {
    a: 1
  }
})
// `vm.a` is now reactive

vm.b = 2
// `vm.b` is NOT reactive
```

그러나 `{{ 'value' }}`, `{{ new Date()}}`와 같은 순수 JavaScript 코드는 반응형(reactivty) 속성처럼 Vue가 추적하지 않습니다.

그렇다면 반응형(reactivty)와 중복 랜더링과 어떤 연관관계가 있을까요?

`data`에 아래와 같은 object가 있다고 해봅시다.

```jsx
values: [{id: 1, t: 'a'}, {id: 2, t: 'b'}]
```

그리고 `v-for` 을 사용해 랜더링을 해봅시다.

```jsx
<div v-for="value in values" :key="value.id">{{ value.t }}</div>
```

위의 values에 새로운 값이 추가되었을때 Vue는 전체 목록을 재 랜더링 할것입니다. 확실할까요? 아래와 같이 한번 적어봅시다.

```jsx
<div v-for="value in values" :key="value.id">
  {{ value.t }}
  {{ new Date() }}
</div>
```

JavaScript Date 객체는 반응형이 아니므로 랜더링에 전혀 영향을 주지 않습니다. 만약 요소를 다시 랜더링을 할때만, 호출됩니다. 이 예제에서 values에 값이 추가되거나 제거될때만 모든 재 랜더리된 요소들에게서만 새로운 날짜가 나타날것입니다.

 

좀더 최적화된 페이지를 기대하기 위해 어떤걸 해야 할까요? 새로운 요소나, 변경된 요소에 대해서 새로운 날짜를 보여주고, 다른 모든 요소들은 재 랜더링이 되면 안됩니다.

그럼, key는 무엇이고, 왜 전달할까요? key 속성은 Vue가 어떤 요소를 알아야 하는지 도와줍니다. 만약 배열의 순서가 변경되면, key는 Vue가 다시 차례로 반복하는 것 대신, 요소들이 제자리에 섞을 수 있도록 도와줍니다.

key를 지정하는 것이 중요하지만, 그것만으로는 충분하지 않습니다. 최상의 성능을 얻기 위해 자식 컴포넌트를 만들어야 합니다. 이 해결법은 아주 간단합니다. 작고 가볍게 Vue app의 컴포넌트를 나누면 됩니다.

```jsx
<item :itemValue="value" v-for="item in items" :key="item.id" />
```

Item 컴포넌트는 반응형으로 변화가 있을 때만 업데이트를 하게 됩니다. (예를들어 [Vue.set](https://vuejs.org/v2/api/#Vue-set))

목록을 랜더링할 때 컴포넌트들을 사용하면 엄청난 향상을 얻을 수 있습니다. 만약 배열으로 부터 값을 추가하거나, 제거하면, 다시 하나씩 모든 컴포넌트들을 랜더링 하지 안습니다. 만약 배열이 정렬되어 있다면 제공된 key에 의존하여 요소를 섞습니다.

만약 컴포넌트가 진짜 가볍다면, 하나 더 할 수 있습니다. value와 같은 완벽한 객체를 전달하는 것 대신에 `:itemText="value.t"` 와 같은 기본 타입(String or Number) 건네주는 겁니다. 이걸 사용해, `<item>` 은 전달받은 기본 타입이 변화될때만 재랜더링을 합니다. 반응형(reactive) 변경으로 업데이트가 되는걸 의미하지만, 업데이트는 필요 없습니다.

### 2. 중복 랜더링을 제거하자.(Eliminate Duplicate Rendering)

전체 목록이나 무거운 요소를 필요 이상으로 랜더링하는 것 꽤 골치아픈 문제이지만, 매우 쉽게 발생할 수 있습니다.

data에 `entities` 값을 가지는 컴포넌트가 있다고 해봅시다.

만약 이전 단계를 따라왔다면, 각 엔티티를 랜더링 하기 위한 자식 컴포너틑를 아마 가지고 있을것입니다.

```jsx
<entity :entity="entity" v-for="entity in entities" :key="entity.id" />
```

`<entity>` 는 아래와 같은 template 입니다.

```jsx
<template>
  <div>
    <div>{{ user.status }}</div>
    <div>{{ entity.value }}</div>
  </div>
</template>
```

`entity.value` 를 출력하지만, vuex state로부터 사용자는 값을 사용할수 있습니다. 지금 사용자 토큰을 refresh하는 인증 함수 또는 어디선가 전역 사용자 속성이 어디서든 변할 수 있는 것이 있다고 해봅시다. 이렇게 하면 user.status가 같다 해도 언제든지 전체 view가 업데이트가 될 것입니다.

이러한 것을 다루기 위한 몇가지 방법이 있습니다. 간단한 방법중 하나는 userStatus와 같은 user.status 값을 부모로부터 prop으로 전달받으면 됩니다. 만약 값이 변화되지 않았다면 랜더링 할필요가 없기 때문에 다시 랜더링을 하지 않을겁니다.

여기서 핵심은 랜더링 의존성을 알아야 하는 겁니다. props, data, computed 중 어떤것으로 인해 재 랜더링이 발생할수 있습니다.

어떻게 중복 랜더링을 식별할 수 있을까요?

첫번째는 [공식 Vue.js dev tools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd?hl=en)를 설치하는 것입니다.

그리고 "성능 탭(Performance tab)"을 사용해 Vue app's 성능(performance)를 측정합니다. start and stop을 눌러 app이 실행되는 동안 성능 확인을 합니다.

![image](https://user-images.githubusercontent.com/53366407/115134346-445e8000-a04a-11eb-8bda-0efe0a36b65e.png)

그리고 "Component Render"탭에 들어갑니다.

만약 100개의 컴포넌트들이 페이지에서 랜더가 된다면, 100개의 `created` 이벤트가 발생할 것입니다. 

여기서 중요한건 `updated` 이벤트입니다. 만약 `created` 이벤트보다 `updated` 이벤트가 더 많다면, 실제 값의 업데이트 없이 중복 랜더링으로 이어지는 중복 변화를 가질수도 있습니다.

만약 일괄로 업데이트를 하는것 대신 entities 값을 여러번 변경하면 문제가 발생할 수 있습니다. 또한 만약Firestore와 같은 실시간 데이터베이스를 사용하면 기대하는 것 이상으로 snapshot을 얻는 문제가 발생할 수도 있습니다.(특히 연관관계가 있는 documents를 수정하는 Firesotre trigger가 있다면 업데이트 마다 많은 snapshot을 받을수도 있습니다.)

필요 이상으로 `entities` 값을 여러번 변경하는걸 피하는 것이 해결책입니다. Firestroe snapshot인 경우에는 debounce 또는 throttle 기능을 사용하여 자주 `entities` 를 변경하지 않도록 할 수 있습니다.

### 3. Event Handling을 최적화 하라.(Optimize Event Handling)

모든 이벤트들이 동일하게 생성되는게 아니기 때문에, 각 이벤트들에 대해 올바르게 최적화 되어 있는지 확인해야 합니다.

`@mouseover` 와 `window.scroll` 이벤트가 가장 좋은 두가지 예입니다. 이러한 두가지 이벤트는 평범한 사용에도 몇번 작동될수가 있습니다. 만약 현재 사용하는 이벤트 핸들러가 비싼 비용의 계산이라면, 이 계산은 초당 여러번 실행이 되어 Application의 지연을 발생시킵니다. 해결법은 debounce 함수를 사용해 이러한 이벤트를 처리하는 횟수를 제한하는 겁니다.

### 4. 느린 컴포넌트를 줄이거나 삭제하라(Remove or Reduce Slow Components)

새로운 컴포넌트를 생성할때, 특히 third-party 컴포넌트를 가져올 때, 잘 동작하는지 확인해야 합니다.

Vue.js dev tools "성능 탭(performance tab)을 사용해 각 컴포넌트들이 사용되는 랜더링 시간을 추산할 수 있습니다. 새로운 컴포넌트를 추가할 때, 이미 가지고 있는 컴포넌트와 비교해 랜더링 시간이 얼마나 걸리는지 확인할 수 있습니다.

만약 새로운 컴포넌트가 가지고 있는 컴포넌트보다 더 많은 시간이 걸린다면, 대체 컴포넌트를 찾거나, 컴포넌트를 삭제하거나, 사용을 줄이도록 노력해야 합니다.

![image](https://user-images.githubusercontent.com/53366407/115134347-49bbca80-a04a-11eb-8c99-e40fbf2eefd8.png)

### 5. 한번만 랜더링하라.(Render Once)

![image](https://user-images.githubusercontent.com/53366407/115134350-4de7e800-a04a-11eb-90e2-71f95347114b.png)

위 내용은 Vue.js 공식문서에 있는 내용입니다. 만약 오직 한번만 `mounted` 이벤트가 랜더링 되는 요소들이 있다면 `v-once` 지시자를 사용할 수 있습니다.

전체 session이 변경되지 않도록 요구하는 데이터가 있는 app 한 부분이 있다고 가정해보겠습니다. `v-once` 지시자를 사용함으로써 그 부분을 오직 한번만 랜더링하도록 할 수 있습니다.

### 6. 가상 스크롤(Virual Scrolling)

이제 Vue App의 성능 최적화를 위한 마지막 단계입니다. 데스크톱에서 Facebook을 스크롤 한적이 있나요? (또는 Twitter, Instagram 등 유명한 소셜 미디어) 틀림없이 해본적이 있을겁니다. 페이지의 느려진 속도 없이 끝까지 스크롤을 할 수 있습니다. 그러나 Vue app에서 거대한 랜더링할 목록이 있으면, 페이지를 내릴 수록 속도가 느려지는걸 확인할 수 있을 겁니다.

만약 페이징 기능 대신에 무한 스크롤을 구현하기로 결정했다면 가상 스크롤 및 items의 거대한 목록을 랜더링할 수 있는 다음 2가지 오픈소스 중 하나를 사용할 수 있습니다.

- [https://github.com/tangbc/vue-virtual-scroll-list](https://github.com/tangbc/vue-virtual-scroll-list)
- [https://github.com/Akryum/vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller)

둘다 사용해본 결과 `vue-virtual-scroll-list` 가 좀더 쉽게 사용할 수 있고, UI를 손상시키는 `absolute position`에 의존하지 않기 때문에 더 좋은거 같습니다.

### 결론

이 글은 비록 모든 시나리오를 다루진 않았지만, 6가지 방법은 Vue application의 일반적인 성능 문제를 다룹니다. 최고의 front end 성능을 달성하는 것은 깨닫는 것 보다 더 중요합니다. 개발자들은 보통 app을 사용하는 사용자보다 더 좋은 컴퓨터를 가지고 있습니다. 사용자가 컴퓨터를 사용하지 않고 느리고 구시대적인 스마트폰일수도 있습니다. 

그래서 개발자는 최적의 사용자 경험을 제공하고 자신의 최고의 능력을 발휘해야 합니다. 이 6가지 방법을 Checklist로 사용하여 모든 사용자들이 원할하게 Vue app을 사용할 수 있도록 도와줄겁니다.

## 원본글

[https://betterprogramming.pub/6-ways-to-speed-up-your-vue-js-application-2673a6f1cde4](https://betterprogramming.pub/6-ways-to-speed-up-your-vue-js-application-2673a6f1cde4)
