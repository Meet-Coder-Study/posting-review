# Module Federation for vite & rollup

저번주에는 Webpack 5에 추가된 기능으로 Module Federation을 통해 Micro Frontend Architecture 구성하는 방법을 설명했습니다.

이번주에는 Module Federation을 다른 build 도구(vite)에서 구현하기 위해 겪은 과정을 설명해드릴려고 합니다.

들어가기에 앞서 vue 프로젝트를 생성을 위해 많은 개발자들은 `vue-cli(webpack)`, `vite`를 사용합니다.

제가 다니고 있는 회사에서는 `vue3 + vite`, `vue3 + webpack`을 프로젝트들이 구성되어있습니다. 대부분 프로젝트들을 `vue3 + vite`로 마이그레이션 되어있는 상태입니다.

## [Vite(비트)](https://vitejs-kr.github.io/)

> 비트는 Vue 창시자 Evan You가 만든 새로운 프론트엔드 도구로 프랑스어로 빠르다를 의미하며 빠르고 간결한 모던 웹 프로젝트 개발 경험에 초점을 맞춰 탄생한 빌드 도구입니다.

상황에 따라 ESbuild와 Rollup 두가지를 번들러를 사용합니다. 개발용 서버에서는 Esbuild를 통해 번들링 하고 프러덕션 버전으로 빌드를 위해서는 Rollup을 통해 번들링 합니다.

### [왜 번들링 시에는 Esbuild를 사용하지 않나요?](https://vitejs-kr.github.io/guide/why.html#why-not-bundle-with-esbuild)

> Esbuild는 굉장히 빠른 속도로 번들링이 가능하다는 장점이 있으나, 번들링에 필수적으로 요구되는 기능인 `코드 분할(Code-splitting)` 및 `CSS와 관련된 처리`가 아직 미비합니다. 
> Vite에서 사용중인 Rollup은 이에 대해 조금 더 검증되었고 유연한 처리가 가능하게끔 구현되어 있기에 현재로서는 이를 사용하고 있으며, 
> 향후 Esbuild가 안정화 되었을 때 어떤 프로덕션 번들링 도구가 적절할 것인지 다시 논의할 예정입니다.

실제로 [ESbuild 로드맵](https://esbuild.github.io/faq/#upcoming-roadmap)을 살펴 보시면 
Code Splitting 그리고 CSS content type 와 같은 이슈들을 처리하기 위해 진행중이라고 합니다.

## [Vite Module-Federation 지원 여부?](https://github.com/vitejs/vite/issues/148)

> 이것은 롤업 수준에서 해결해야 하는 것입니다. 논의할 가치가 있는 것이지만 Vite의 범위를 벗어납니다.

## [vite-plugin-federation](https://github.com/originjs/vite-plugin-federation)

vite에서 module federation의 (유사한) 기능을 사용하기 위해 사용할 라이브러리입니다.

(실제로 현업에서는 webpack과 같이 많은 개발자들이 사용하며 검증되지 않아서 사용하기 힘들다고 생각합니다.)

## vite.config.js

```javascript
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'home',
      filename: 'remoteEntry.js',
      exposes: {
        './Component1': {
          name: 'component',
          import: './src/components/Component1.vue',
        },
      },
      remotes: {
        remote1: 'http://localhost:5000/assets/remoteEntry.js',
      },
      shared: ['vue'],
    }),
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'esm',
        entryFileNames: 'assets/[name].js',
      },
    },
  },
});
```

### federation

federation 에서는 module federation과 동일한 구성을 가지고 있습니다.

- name

  해당앱의 유일한 이름으로 중복된 이름이 있으면 안됩니다.

- filename

  해당 앱을 다른 앱에서 사용하기 위한 정보가 담긴 Manifest 파일의 이름을 지정합니다.

- remotes

  해당 앱이 사용할 리모트 앱들을 정의하는 곳입니다.

- exposes

  외부에서 사용하기 위해 expose 시킬 모듈들을 정의합니다.

- shared

  런타임에 Federated된 앱 간에 공유하거나 공유받을 의존성 패키지를 정의합니다.

### [build](https://vitejs-kr.github.io/config/build-options.html)

Evan You의 말처럼 rollup 단계에서 build 시켜 사용하기 위한 옵션을 설정하는 부분입니다.

- target

  브라우저 호완성을 위해 es를 정의합니다.

- [rollupOptions](https://rollupjs.org/guide/en/#big-list-of-options)

  - format

    생성된 번들파일의 형식을 정의합니다.

  - entryFileNames

    진입점이 될 파일 위치를 정의합니다.
  
[제가 만든 micro-vue-vite-demo](https://github.com/JoelGoat/micro-fe-vue-vite-demo)

[vite 공식 문서(번역)](https://vitejs-kr.github.io/guide/)
