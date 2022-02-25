# Vue2에서 Meta Title를 테스트 해보자.

> Vue 2.6.12와 jest 26.6.3, vue-meta 2.4.0 버전을 기준으로 해당 글은 작성되었습니다.

## 🧐 Vue-meta란?

Vue 전용 HTML MetaData 관리하는 툴로써, 페이지에 Meta 데이터를 쉽게 추가할 수 있습니다.

```
// Component.vue
{
  metaInfo: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  }
}
```

```
<!-- Rendered HTML tags in your page -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
```

위에 코드에서 해당 MetaData를 지정하면 아래와 같이 HTML 태그로 랜더가 되는 방식이라고 생각하시면 됩니다.

### Title이란?

```
{
  metaInfo: {
    title: 'Foo Bar'
  }
}
```

```
<head>
    <title>Foo Bar</title>
</head>
```

![image](https://user-images.githubusercontent.com/53366407/147744431-5515812c-613c-4ad7-a8fe-c9a5e7f3c82e.png)

`<head>` 태그 내에 위치하는 태그로 웹 페이지의 제목을 브라우저 최상단에 표시하게 됩니다.

### Title 태그는 왜 중요한가?

`<title>` 태그는 검색엔진 즉 SEO에 유용합니다. 검색엔진은 `<title>` 태그를 웹페이지의 제목으로 인지하고, 검색노출에도 사용합니다. 또한 `<title>` 태그가 없는 요소는 HTML 문서로 간주하지 않습니다.

## ⌨️ Vue-meta 라이브러리를 이용해 Title을 작성해보자.

```
<template>
...
</template>

<script>
export default {
  name: 'Index',
  metaInfo() {
    const postTitle = this.post?.title || '';
    const title = [postTitle, 'Enthusiastically, Steady, Slowly'].join(' | ');
    return { title };
  },
  computed: {
    ...mapState('post', ['post']),
    }
};

</script>
```

위와 같이 작성하게 되면 브라우저 탭 제목에 `${postTitle} | Enthusiastically, Steady, Slowly` 가 나오게 될것입니다.

쉽게 웹 브라우저의 타이틀을 지정할 수 있게 됩니다.

그러면 매번 이걸 수동으로 QA를 할수 없기 때문에 테스트 코드를 작성함으로써, 실제 어떻게 검증할 수 있는지 확인해봅시다.

## ⌨️ Vue-meta를 이용해 Title을 지정한 것에 대해 테스트 코드를 작성해보자.

> Vuex와 Router를 Mocking했지만, 메인으로 작성하는 주제가 아니기 때문에 간단하게 언급만 하고 넘어가겠습니다.

```
import { shallowMount, createLocalVue } from '@vue/test-utils';
import VueMeta from 'vue-meta';
import Vuex from 'vuex';
import Index from '@/containers/post/_views/Index.vue';
import store from '@/store';
import { SET_POST } from '@/store/post/mutation-types';
import { Course } from '@/types/posts';
import { postFixture } from '~spec/fixtures';

const localVue = createLocalVue();
localVue.use(VueMeta);
localVue.use(Vuex);

describe('Index.vue Test', () => {
  const post = new Post(postFixture.post);
  store.commit(`post/${SET_POST}`, { post });

  const $route = {
    name: 'post-index',
    path: '/post/1',
    params: { postId: 1 },
  };

  const wrapper = shallowMount(Index, {
    localVue,
    store,
    mocks: {
      $route,
    },
  });

  it('페이지의 Title Meta 값이 정상적으로 나오는지 확인', () => {
    const title = [postTitle, 'Enthusiastically, Steady, Slowly'].join(' | ');

    expect(wrapper.vm.$meta().refresh().metaInfo.title).toBe(title);
  });
});
```

테스트를 할때 Vue app에서 쓸 라이브러리를 따로 지정해서 주입을 시켜주는것이 좋습니다. 사용하는 모든 라이브러리를 주입시키면 테스트 속도가 저하가 되며, 불필요한 내용들이 들어가기 때문에, 최소한으로 하는 것이 중요합니다. 현재 저희는 Vue-meta에 대한 값을 테스트 하려고 하기 때문에 아래와 같이 주입시켜주면 됩니다.

```
const localVue = createLocalVue();
localVue.use(VueMeta);
```

기본적으로 우리는 Vuex에 있는 값을 사용해 타이틀에 동적인 데이터를 넣기 때문에 테스트 코드를 작성할때도 Vuex를 목킹해서 Fixture를 만들어서 넣어줘야 합니다.

관련된 코드는 아래와 같습니다.

```
const localVue = createLocalVue();
localVue.use(VueMeta);
localVue.use(Vuex);

const post = new Post(postFixture.post);
store.commit(`post/${SET_POST}`, { post });

const wrapper = shallowMount(Index, {
  localVue,
  store,
});
```

### $meta()를 살펴보자.

[vue-meta](https://vue-meta.nuxtjs.org/api/#plugin-methods) 에서 플러그인으로 지원하는것으로 여러가지 기능을 지원합니다.

-   **getOptions :** 상호 작용하려는 다른 라이브러리에서 사용할 수 있습니다.
-   **setOptions :** 이 메소드를 호출하여 런타임 중에 일부 플러그인 옵션을 토글할 수 있습니다.
-   **addApp :** 다른 라이브러리와 통합을 개선하기 위해 `addApp`메타 정보를 추가하는 데 사용할 수 있습니다.
-   **refresh**: 현재 메타데이터를 새 메타데이터로 업데이트합니다.
-   **inject**: 전역 주입 옵션을 사용하여 주입할 개체를 전달할 수 있습니다.
-   **pause:** 메타 데이터 업데이트를 중지합니다.
-   **resume:** 메타 데이터 업데이트를 다시 합니다.

### metaInfo를 살펴보자.

-   **title**: `<title>` 태그의 값을 넣습니다.

```
    {
      metaInfo: {
        title: 'Foo Bar'
      }
    }

    <title>Foo Bar</title>
```

-   **titleTemplate:** `%s` 를 이용해 title의 값을 넣어서 템플릿을 만듭니다.

```
    {
      metaInfo: {
        title: 'Foo Bar',
        titleTemplate: '%s - Baz'
      }
    }

    <title>Foo Bar - Baz</title>
```

-   **htmlAttrs, headAttrs, bodyAttrs :** `<html>`, `<head>`, `<body>` 태그에 속성값을 추가합니다.

```
    {
      metaInfo: {
        htmlAttrs: {
          lang: 'en',
          amp: true
        },
        bodyAttrs: {
          class: ['dark-mode', 'mobile']
        }
      }
    }
    <html lang="en" amp>
    <body class="dark-mode mobile">Foo Bar</body>
```

-   **base :** `<base>` 태그에 매핑됩니다.

```
    {
      metaInfo: {
        base: { target: '_blank', href: '/' }
      }
    }
    <base target="_blank" href="/">
```

-   **meta**: `<meta>` 태그에 매핑됩니다.

```
    {
      metaInfo: {
        meta: [
          { charset: 'utf-8' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' }
        ]
      }
    }

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
```

-   **link**: `<link>` 태그에 매핑됩니다.

```
    {
      metaInfo: {
        link: [
          { rel: 'stylesheet', href: '/css/index.css' },
          { rel: 'favicon', href: 'favicon.ico' }
        ]
      }
    }

    <link rel="stylesheet" href="/css/index.css">
    <link rel="favicon" href="favicon.ico">
```

-   **style**: `<style>` 태그에 매핑됩니다.

```
    {
      metaInfo: {
        style: [
          { cssText: '.foo { color: red }', type: 'text/css' }
        ]
      }
    }
    <style type="text/css">.foo { color: red }</style>
```

-   **script**: `<script>` 태그에 매핑됩니다.

```
    {
      metaInfo: {
        script: [
          { src: 'https://cdn.jsdelivr.net/npm/vue/dist/vue.js', async: true, defer: true }
        ],
      }
    }

    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js" async defer></script>
```

> 더 존재하지만, 기본적인 것만 설명을 적겠습니다.

## 📝 결론

어렵진 않지만, 동적 데이터를 title에 적을수 있다는 점에서도 엄청난 장점을 가지고 있으며, 명시적으로 title을 작성을 할 수 있기 때문에 쉽게 MetaData를 추가할 수 있다는게 가장 큰 장점인듯 합니다.

개인적으로 테스트를 진행할때는 단위테스트로 진행해도 충분히 가능한 검증 가능한 부분이라고 생각이 듭니다.

SEO에 중요한 작용을 하기 떄문에 title 태그가 중요한 부분에서는 꼭 테스트 코드를 추가하는 것을 추천드립니다.
