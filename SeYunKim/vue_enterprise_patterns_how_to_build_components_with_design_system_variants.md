번형 스타일 제공자를 사용해 변형 스타일를 공유 

많은 프로젝트 특히 대규모 프로젝트에는 컴포넌트들의 모양과 느낌에 대한 가이드 역할을 하는 디자인 시스템이 있습니다. 아래 예와 같이 Figma에서 다른 버튼 번형에 대한 디자인들을 볼 수 있습니다.

![https://miro.medium.com/max/1400/0*SpnCY_0rL895pgrY.png](https://miro.medium.com/max/1400/0*SpnCY_0rL895pgrY.png)

웹사이트의 주요 액션에 대한 버튼은 primary, secondary와 같이  다양한 번형을 가질수 있습니다. 또한 danger와 같이 사용자의 액션에 대해 위험을 나타내는 번형도 있습니다.  이러한 번형을 구현하는 방법은 여러가지가 있습니다. CSS 변수나 모듈을 사용해 깔끔하고 효과적으로 이를 관리할 수 있는 방법을 공유해보도록 하겠습니다.

- 디자인 시스템 기반으로 번형이 있는 Button, Tag 컴포넌트를 생성하는 방법
- CSS 변수나 모듈을 활용해 구성 요소 번형을 구현하는 방법
- VariantStyleProvider 컴포넌트를 사용해 여러 구성 요소들 사이의 번형 스타일을 공유하는 방법

## 프로젝트 설정

You can find the GitHub repository with a full code example [here](https://github.com/ThomasFindlay/build-vue-component-with-variants-using-css-variables). I have used [Vite](https://vitejs.dev/) to scaffold a new project for this tutorial. If you would like to follow this tutorial, you can create a new project with Vite by running one of the commands shown below:

- [예제 Gtihub Code](https://github.com/ThomasFindlay/build-vue-component-with-variants-using-css-variables)
- 이 예제 코드들은 Vite를 사용해 구성하였습니다. 따라서 Vite로 새프로젝트를 만들면 됩니다.

```jsx
yarn create @vitejs/app
```

Let’s start with creating a new `BaseButton.vue` component.

일단 BaseButton 컴포넌트를 만드는것부터 해보도록 하겠습니다.

**src/components/BaseButton.vue**

```jsx
<template>
  <button :class="[$style.baseButton]" v-bind="$attrs">
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    variant: {
      type: String,
      validators: value =>
        ['primary', 'secondary', 'warning', 'danger'].includes(value),
    },
  },
}
</script>

<style module>
.baseButton {
  border: none;
  background: transparent;
  padding: 0.6rem 1rem;
}
</style>
```

하나의 `variant` props만 있는 매우 간단한 구조입니다. 이제부터 각 번형에 대한 버튼을 추가해보도록 하겠습니다.

**src/App.vue**

```jsx
<template>
  <div :class="$style.container">
    <BaseButton variant="primary"> Primary </BaseButton>
    <BaseButton variant="secondary"> Secondary </BaseButton>
    <BaseButton variant="warning"> Warning </BaseButton>
    <BaseButton variant="danger"> Danger </BaseButton>
  </div>
</template>

<script>
import BaseButton from './components/BaseButton.vue'
export default {
  components: {
    BaseButton,
  },
}
</script>

<style module>
.container {
  width: 300px;
  margin: 2rem auto;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(4, 1fr);
  justify-content: center;
}
</style>
```

기본 윤곽선에 초점이 맞춰져 있기 때문에 기본 윤곽선 색상이 표시가 되는걸 확인할 수 있습니다.

![https://miro.medium.com/max/902/0*sXCsk_wiUrX4WqQa.png](https://miro.medium.com/max/902/0*sXCsk_wiUrX4WqQa.png)

이제 기본설정을 만들었기 때문에 BaseButton 구성 요소의 각 변형에 대해 CSS 변수와 스타일을 추가해보도록 하겠습니다. 여기서는 CSS 모듈을 사용하도록 하겠습니다.

## CSS 변수 및 BaseButton 컴포넌트 번형

일단 첫번째로 `variables.css` 에 아래와 같이 CSS 변수를 추가합니다.

**src/styles/variables.css**

```css
:root {
  --primary-text-color: #eff6ff;
  --primary-bg-color: #1d4ed8;
  --secondary-text-color: #1d4ed8;
  --secondary-bg-color: #eff6ff;
  --warning-text-color: #c2410c;
  --warning-bg-color: #fff7ed;
  --danger-text-color: #b91c1c;
  --danger-bg-color: #fee2e2;
}
```

main 파일에 애플리케이션 컴포넌트에서 접근할 수 있도록 파일을 가져옵니다.

**src/main.js**

```jsx
import { createApp } from 'vue'
import './styles/variables.css'
import App from './App.vue'

createApp(App).mount('#app')
```

Next, we need to update the `BaseButton` component. There are three things we need to do:

다음 작업은 `BaseButton` 을 수정해야 합니다. 아래와 같이 3가지 작업이 있습니다.

1. `variant` prop을 기반으로 변형 스타일을 추가합니다.
2. 클래스에 `color`, `background-color` 속성을 추가합니다.
3. 각 번형된 클래스에 CSS 변수를 추가합니다.

**src/components/BaseButton.vue**

먼저 `Button` 태그에 클래스를 변경합니다. 또한 적절한 번형 클래스도 받아옵니다. 이 클래스는 `variant` prop에 의해 결정됩니다.

```jsx
<template>
  <button :class="[$style.baseButton, $style[variant]]" v-bind="$attrs">
    <slot />
  </button>
</template>
```

다음으로 `color` 와 `background-color` 속성을 추가합니다. 이는 `variables.css` 파일에 정의된 CSS 변수입니다. 

```css
<style module>
.baseButton {
  border: none;
  padding: 0.6rem 1rem;
  color: var(--btn-text-color);
  background-color: var(--btn-bg-color);
}

.primary {
  --btn-text-color: var(--primary-text-color);
  --btn-bg-color: var(--primary-bg-color);
}

.secondary {
  --btn-text-color: var(--secondary-text-color);
  --btn-bg-color: var(--secondary-bg-color);
}

.warning {
  --btn-text-color: var(--warning-text-color);
  --btn-bg-color: var(--warning-bg-color);
}

.danger {
  --btn-text-color: var(--danger-text-color);
  --btn-bg-color: var(--danger-bg-color);
}
</style>
```

이제 다시 보면 아래와 같이 나올것 입니다.

![https://miro.medium.com/max/876/0*hMMcFbJ0OQh-7MAf.png](https://miro.medium.com/max/876/0*hMMcFbJ0OQh-7MAf.png)

hover, active, disabled와 같은 다른 상태도 변수를 추가할 수 있습니다.

첫번째 목표엿던 여러 번형을 지원하는 버튼 구성요소를 만들었습니다. 그러나 동일한 번형을 지원해야 하는 다른 구성 요소를 만들어야 한다면 어떻게 해야 할까요? 예를들어 tag 컴포넌트와 말이죠.

## 번형이 있는 BaseTag 컴포넌트

일단 `BaseTag.vue` 를 만들고 랜더링을 해보도록 하겠습니다.

**src/components/BaseTag.vue**

```jsx
<template>
  <div :class="[$style.baseTag, $style[variant]]" v-bind="$attrs">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    variant: {
      type: String,
      validators: value =>
        ['primary', 'secondary', 'warning', 'danger'].includes(value),
    },
  },
}
</script>

<style module>
.baseTag {
  border: none;
  border-radius: 1.5rem;
  padding: 0.6rem 1rem;
  color: var(--tag-text-color);
  background: var(--tag-bg-color);
}

.primary {
  --tag-text-color: var(--primary-text-color);
  --tag-bg-color: var(--primary-bg-color);
}

.secondary {
  --tag-text-color: var(--secondary-text-color);
  --tag-bg-color: var(--secondary-bg-color);
}

.warning {
  --tag-text-color: var(--warning-text-color);
  --tag-bg-color: var(--warning-bg-color);
}

.danger {
  --tag-text-color: var(--danger-text-color);
  --tag-bg-color: var(--danger-bg-color);
}
</style>
```

**src/App.vue**

```jsx
<template>
  <div :class="$style.container">
    <BaseButton variant="primary"> Primary </BaseButton>
    <BaseButton variant="secondary"> Secondary </BaseButton>
    <BaseButton variant="warning"> Warning </BaseButton>
    <BaseButton variant="danger"> Danger </BaseButton>
  </div>
  <div :class="$style.container">
    <BaseTag variant="primary"> Primary </BaseTag>
    <BaseTag variant="secondary"> Secondary </BaseTag>
    <BaseTag variant="warning"> Warning </BaseTag>
    <BaseTag variant="danger"> Danger </BaseTag>
  </div>
</template>

<script>
import BaseButton from './components/BaseButton.vue'
import BaseTag from './components/BaseTag.vue'
export default {
  components: {
    BaseButton,
    BaseTag,
  },
}
</script>
```

그럼 아래와 같이 4개의 버튼과 4개의 태그가 나올것입니다.

![https://miro.medium.com/max/1010/0*gHxF_AkWkB-SFT7x.png](https://miro.medium.com/max/1010/0*gHxF_AkWkB-SFT7x.png)

현재 `BaseButton` 과 `BaseTag` 에 중복코드들이 많습니다. 현재는 2개이지만, 20개라고 생각해봅니다. 또한 기존 요소를 다른 CSS 변수로 수정해야 한다면 번형이 있는 모든 단일 구성 요소들은 별도로 업데이트를 해줘야 합니다. 이러한 문제를 해결하기 위해 적절한 스타일을 전달한 `slots` 을 사용해보도록 하겟습니다.

CSS 모듈의 장점은 스타일을 쉽게 전달하고 구성할 수 잇다는 점입니다. 따라서 우리는 `VariantStyleProvider.vue` 를 만드는 것으로 시작해보도록 하겠습니다. 이 컴포넌트는 3가지 일을 합니다.

1. Accept a `variant` prop
2. `variant` props 받음
3. `color` , `background-color` 속성에 대한 번형 스타일을 정의
- slot을 랜더링 하고 `baseVariant` 에 적절한 `variant` 클래스를 전달합니다.

**src/components/VariantStyleProvider.vue**

```jsx
<template>
  <slot :variantStyle="[$style.baseVariant, $style[variant]]" />
</template>

<script>
export default {
  props: {
    variant: {
      type: String,
      validators: value =>
        ['primary', 'secondary', 'warning', 'danger'].includes(value),
    },
  },
}
</script>

<style module>
.baseVariant {
  color: var(--variant-text-color);
  background-color: var(--variant-bg-color);
}

.primary {
  --variant-text-color: var(--primary-text-color);
  --variant-bg-color: var(--primary-bg-color);
}

.secondary {
  --variant-text-color: var(--secondary-text-color);
  --variant-bg-color: var(--secondary-bg-color);
}

.warning {
  --variant-text-color: var(--warning-text-color);
  --variant-bg-color: var(--warning-bg-color);
}

.danger {
  --variant-text-color: var(--danger-text-color);
  --variant-bg-color: var(--danger-bg-color);
}
</style>
```

현재 `VariantStyleProvider` 컴포넌트가 번형 스타일을 처리하고 있기 떄문에 `BaseButton` 과 `BaseTag` 에서 중복 코드로 작성되어 있는 스타일들을 제거할 수 있습니다. 또한 추가적으로 `VariantStyleProvider` 를 사용해 아래와 같이 사용한다면 중복코드를 제거할 수 있습니다.

**src/components/BaseButton.vue**

```jsx
<template>
  <VariantStyleProvider :variant="variant">
    <template #default="{ variantStyle }">
      <button :class="[$style.baseButton, variantStyle]" v-bind="$attrs">
        <slot />
      </button>
    </template>
  </VariantStyleProvider>
</template>

<script>
import VariantStyleProvider from './VariantStyleProvider.vue'

export default {
  components: {
    VariantStyleProvider,
  },
  props: {
    variant: {
      type: String,
      validators: value =>
        ['primary', 'secondary', 'warning', 'danger'].includes(value),
    },
  },
}
</script>

<style module>
.baseButton {
  border: none;
  padding: 0.6rem 1rem;
}
</style>
```

**src/components/BaseTag.vue**

```jsx
<template>
  <VariantStyleProvider :variant="variant">
    <template #default="{ variantStyle }">
      <div :class="[$style.baseTag, variantStyle]" v-bind="$attrs">
        <slot />
      </div>
    </template>
  </VariantStyleProvider>
</template>

<script>
import VariantStyleProvider from './VariantStyleProvider.vue'

export default {
  components: {
    VariantStyleProvider,
  },
  props: {
    variant: {
      type: String,
      validators: value =>
        ['primary', 'secondary', 'warning', 'danger'].includes(value),
    },
  },
}
</script>

<style module>
.baseTag {
  border: none;
  border-radius: 1.5rem;
  padding: 0.6rem 1rem;
}
</style>
```

둘다 깔끔해 졌고 코드 중복을 제거함으로써 한 군데에서 코드를 관리할 수 있게 되었습니다. 이러한 패턴은 유지보수를 하고 확장하는데 많은 도움을 줍니다. 새 번형 컴포넌트를 만든다 해도 `variables.css` 와 `VariantStyleProvider.vue` 만 관리하면 됩니다.
