# Vue3 Composition API에 대해 알아보자

> Vue3가 나오면서 Composition API가 제공되고 있다. Composition API가 왜 나왔는지 알아보고 뭔지 알아보자.

## 개요

-   Sharing State
-   Suspense

## Sharing State

-   API 호출 작업을 할때, 로딩 상태, 에러 상태, try/catch구문을 사용한다.
-   Composition API에서 사용하는 법을 살펴보자.
-   아래는 이전 포스팅에 연장인 예제 코드이다.

```
/src/App.js
<template>
  <div>
    Search for <input v-model="searchInput" /> 
    <div>
      <p>Loading: {{ loading }}</p>
      <p>Error: {{ error }}</p>
      <p>Number of events: {{ results }}</p>
    </div>
  </div>
</template>
<script>
import { ref, watch } from "@vue/composition-api";
import eventApi from "@/api/event.js";
export default {
  setup() {
    const searchInput = ref("");
    const results = ref(null);
    const loading = ref(false);
    const error = ref(null);
    async function loadData(search) {
      loading.value = true;
      error.value = null;
      results.value = null;
      try {
        results.value = await eventApi.getEventCount(search.value);
      } catch (err) {
        error.value = err;
      } finally {
        loading.value = false;
      }
    }
    watch(searchInput, () => {
      if (searchInput.value !== "") {
        loadData(searchInput);
      } else {
        results.value = null;
      }
    });
    return { searchInput, results, loading, error };
  }
};
</script>
```

[##_Image|kage@bTt8Nm/btqLJVFMWgQ/OWMAujWKmxDgkVeC1ju7I0/img.gif|alignCenter|width="100%" data-origin-width="0" data-origin-height="0" data-ke-mobilestyle="widthContent"|||_##]

### Sharing State Composition API

-   위에 살펴본 API 호출 로직(결과, 로딩, 에러 상태 사용)은 공통으로 많이 사용된다.
-   컴포지션 함수로 분리해보자.

```
/composables/use-promise.js
import { ref } from "@vue/composition-api";
export default function usePromise(fn) { // fn은 API call
  const results = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const createPromise = async (...args) => { // Args는 searchInput에서 보낸다
    loading.value = true;
    error.value = null;
    results.value = null;
    try {
      results.value = await fn(...args);
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };
  return { results, loading, error, createPromise };
}
```

-   `usePromise` 함수 파라미터 `fn`은 보통 API call 함수를 많이 사용한다.
-   `usePromise`를 사용하는 App.js를 살펴보자

```
<template>
  <div>
    Search for <input v-model="searchInput" /> 
    <div>
      <p>Loading: {{ getEvents.loading }}</p>
      <p>Error: {{ getEvents.error }}</p>
      <p>Number of events: {{ getEvents.results }}</p>
    </div>
  </div>
</template>
<script>
import { ref, watch } from "@vue/composition-api";
import eventApi from "@/api/event.js";
import usePromise from "@/composables/use-promise";
export default {
  setup() {
    const searchInput = ref("");
    const getEvents = usePromise(search =>
      eventApi.getEventCount(search.value)
    );

    watch(searchInput, () => {
      if (searchInput.value !== "") {
        getEvents.createPromise(searchInput);
      } else {
        getEvents.results.value = null;
      }
    });
    return { searchInput, getEvents };
  }
};
</script>
```

-   위와 같이 사용하면 어떤 컴포넌트에서든 `usePromise`를 호출해 사용 가능하다.

### 주의사항

-   `...getEvents`를 사용하지말고 `getEvents`를 사용해 캡슐화 하고, 데이터가 어디서 오는지 명확하게 표기하는것이 좋다.

```
...getEvents
<template>
  <div>
    Search for <input v-model="searchInput" /> 
    <div>
      <p>Loading: {{ loading }}</p>
      <p>Error: {{ error }}</p>
      <p>Number of events: {{ results }}</p>
    </div>
  </div>
</template>
<script>
...
export default {
  setup() {
    ...
    return { searchInput, ...getEvents };
  }
};
</script>

getEvents
<template>
  <div>
    Search for <input v-model="searchInput" /> 
    <div>
      <p>Loading: {{ getEvents.loading }}</p>
      <p>Error: {{ getEvents.error }}</p>
      <p>Number of events: {{ getEvents.results }}</p>
    </div>
  </div>
</template>
<script>
...
export default {
  setup() {
    ...
    return { searchInput, getEvents };
  }
};
</script>
```

-   Vue3에서는 정상 작동하지만, Vue2 composition API를 불러오는 경우에는 `.value`를 수동으로 붙혀 줘야 한다.(지금은 수정되어있는지 확인을 해봐야 한다.)

[##_Image|kage@AWM8T/btqLFoa7v9l/LEXcwYCiArvpb2HrkeH8kk/img.png|alignCenter|width="100%" data-origin-width="0" data-origin-height="0" data-ke-mobilestyle="widthContent"|||_##]

## Suspense

-   백엔드 데이터를 불러올때 API를 많이 호출한다. API 데이터가 로드될때, 좋은 인터페이스는 로딩을 표시한다.Vue에서는 `v-if`,`v-else`문으로 로딩중일때, 로딩완료되었을때 분기로 `HTML`을 2개 작성하여 보여준다.
-   API 호출하는 컴포넌트가 여러개 있을 경우, API호출하는 컴포넌트마다 작성해야되므로 코드는 복잡해진다.
-   Vue3에서는 React16.6에서 나온 `Suspense`에 가져왔다. 비동기 작업이 완료될때까지 기다릴수 있게 해준다.

```
<template>
  <Suspense>
    <template #default>
      <!-- 비동기 호출이 1개 이상있는 컴포넌트들 -->
    </template>
    <template #fallback>
      <!-- 로딩중일때 보여주고 싶은것 -->
    </template>
  </Suspense>
</template>
```

-   기본적으로 `#default`를 렌더링하려고 하나 만약 여기에 `setup()`에 비동기 호출이 있으면 비동기 호출이 완료될때까지 `#fallback`을 보여준다. 완료되면 `#default` 보여준다.
-   예제를 살펴보자.

```
<template>
  <Suspense>
    <template #default>
      <Event />
    </template>
    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
<script>
import Event from "@/components/Event.vue";
export default {
  components: { Event },
};
</script>

// Event
<template>
...
</template>
<script>
import useEventSpace from "@/composables/use-event-space";
export default {
  async setup() {
    const { capacity, attending, spacesLeft, increaseCapacity } = await useEventSpace();
    return { capacity, attending, spacesLeft, increaseCapacity };
  },
};
</script>
```

-   `await useEventSpace()` API 호출을 한다. 호출이 완료될때까지는 Loading... 메세지가 보이고 완료되면 `Event` 컴포넌트가 보여진다.

[##_Image|kage@kBNFd/btqLJWsqs6P/6pjxe9frfuXUoinh9Dk9yk/img.gif|alignCenter|width="100%" data-origin-width="0" data-origin-height="0" data-ke-mobilestyle="widthContent"|||_##]

-   `Suspense`는 한개뿐아니라 여러개의 API 호출에서도 사용이 가능하다.

```
<template>
  <Suspense>
    <template #default>
      <Event />
      <Event />
    </template>
    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

[##_Image|kage@D7cFc/btqLIHCeNBw/yZrF7GuzAxu5e9pBFb5XK0/img.gif|alignCenter|width="100%" data-origin-width="0" data-origin-height="0" data-ke-mobilestyle="widthContent"|||_##]

-   강력한 점은 중첩된 컴포넌트 자식 API 호출이 모두 완료될때까지 기다린다.

### 에러 처리 방법

-   API 호출할때 에러가 날 경우 `v-if`와 새로운 라이프 사이클 `onErrorCaptured`를 사용해 처리할수 있다.

```
<template>
  <div v-if="error">Uh oh .. {{ error }}</div>
  <Suspense v-else>
    <template #default>
      <Event />
    </template>
    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
<script>
import Event from "@/components/Event.vue";
import { ref, onErrorCaptured } from "vue";
export default {
  components: { Event },
  setup() {
    const error = ref(null);
    onErrorCaptured((e) => {
      error.value = e;
      return true;
    });
    return { error };
  },
};
</script>
```

-   `onErrorCaptured`에서 `return true`는 오류 전파를 방지한다.(`propagation`)
-   이렇게 하면 브라우져 콘솔에서 에러를 발견할 수가 없다.

### 로딩 스켈레톤

-   `Suspense`를 사용하면 스켈레톤을 쉽게 만들 수 있다.

```
<template>
  <Suspense>
    <template #default>
      <Event />
    </template>
    <template #fallback>
      여기에 Skeleton 코드 작성
    </template>
  </Suspense>
</template>
```

[##_Image|kage@bxhrgt/btqLQcnu3uH/WbQVwPNHCs3Ourm3uvweG0/img.gif|alignCenter|width="100%" data-origin-width="0" data-origin-height="0" data-ke-mobilestyle="widthContent"|||_##]

## 참조

-   [vue-mastery](https://www.vuemastery.com)
-   [VueCompositionAPI](https://composition-api.vuejs.org/api.html#ref)
-   [vue.js](https://v3.vuejs.org/)