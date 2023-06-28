---
title: 'CSS에 타입을 입히다 (vanilla-extract)'
description: vanilla-extract에 대해 정리합니다.'
date: '2023-06-28'
slug: 'css-in-ts-vanilla-extract'
thumbnail: './images/vanilla-extract-thumbnail.png'
thumbnail_alt: 'vanilla-extract-thumbnail'
category: 'development'
---

# vanilla-extract

<Callout>
  💡 "CSS-in-TS" 방식의 vanilla-extract에 대해 정리합니다. 피드백은 언제나 환영입니다:)
</Callout>

[vanilla-extract](https://vanilla-extract.style/)는 **제로 런타임 타입스크립트 스타일시트**이다.
CSS에도 타입스크립트의 힘을 가져오고자 한 것이 인상적이다.
이번 글을 통해 vanilla-extract을 정리하고자 한다.

## 기존 스타일 방식의 문제점

### CSS 모듈의 한계

className에 사용되는 스타일들은 런타임에 서로 다른 클래스 이름들로 자동으로 난독화한다.
그래서 다른 스타일시트에서 작성한 클래스 이름과 충돌하지 않는다.

클래스 이름 방식의 단점은 className에 넣는 스타일 값들이 `string` 타입이다.
그래서 컴파일 타임에서도 오타에 의한 에러를 잡아내기 힘들며 파일과 스타일 코드가 많아질수록 개발 효율이 급격하게 낮아지게 된다.

### CSS-in-JS 라이브러리 단점

CSS-in-JS는 CSS에서도 자바스크립트 문법을 사용할 수 있다.
컴포넌트 파일과 관련된 코드를 같이 둘 수 있으며([colocation](https://kentcdodds.com/blog/colocation)) 기본적으로 스타일을 지역 스코프로 지정한다.

하지만 CSS-in-JS는 런타임 오버헤드 발생시킨다. 일반 CSS로 직렬화 과정을 거치면서 앱의 성능에 영향을 끼친다.
또한, 번들 크기도 증가한다.

## vanilla-extract 주요 특징

> Use TypeScript as your preprocessor. Write type‑safe, locally scoped classes, variables and themes, then generate static CSS files at build time.

### Zero runtime

**zero runtim**은 vanilla-extract에서 강조하는 주요 특징이다.

타입스크립트 방식의 vanilla-extract로 쓴 코드는 자바스크립트 번들 사이즈에 영향을 주지 않는다.
즉, 브라우저에서 번들 결과를 남기는 것이 아닌 편집하는 동안 코드를 실행하는 것이다.

이를 이해하기 위해 컴파일타임 평가를 알아보고자 한다.

**컴파일타임 평가**

```js
const add = (a, b) => a + b

console.log(add(1, 2))
```

컴파일 결과 미리 평가된 코드가 남는다.
이를 통해 런타임에서의 비용을 줄일 수 있는 것이다.

**컴파일타임 결과**

```js
console.log(3)
```

이와 같은 과정이 CSS에도 적용된다고 생각하면 좋을 것 같다.

### Typescript

**CSS-in-TS**로 스타일에 타입스크립트를 적용한다.
타입스크립트를 통해 CSS 속성들을 쉽게 찾을 수 있다.
당연히 오타와 같은 실수도 방지할 수 있다.

또한, vanilla-extract 타입은 **타입 정의 구문에 대한 설명**과 편집하고 있는 **MDN 문서에 대한 링크를 제공**해준다.
이는 번거롭게 구글링하는 과정을 줄이게 한다.

<Image
  src="https://raw.githubusercontent.com/jgjgill/blog/main/contents/development/css-in-ts-vanilla-extract/images/code-description-helper.png"
  alt="code-description-helper"
/>

## vanilla-extract 사용법

### CSS properties

모든 스타일링 API는 스타일 객체로 가져온다.
CSS 속성들은 `camelCase`로 선언된다.

```js
import { style, globalStyle } from '@vanilla-extract/css'

export const myStyle = style({
  display: 'flex',
  paddingTop: '3px',
})

globalStyle('body', {
  margin: 0,
})
```

```css
.app_myStyle__sznanj0 {
  display: flex;
  padding-top: 3px;
}
body {
  margin: 0;
}
```

### Vendor Prefixed

`-webkit-tap-highlight-color`과 같은 벤더 프리식스(Vender Prefix) 속성은 처음 `-`를 제거하고 `PascalCase`를 사용한다.

```js
import { style } from '@vanilla-extract/css'

export const myStyle = style({
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
})
```

```css
.styles_myStyle__1hiof570 {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
```

### CSS Variables

vanilla-extract에서는 `vars`라는 키와 함께 사용된다.

```js
import { style } from '@vanilla-extract/css'

const myStyle = style({
  vars: {
    '--my-global-variable': 'purple',
  },
})
```

```css
.styles_myStyle__1hiof570 {
  --my-global-variable: purple;
}
```

`vars` 키는 `createVar` API를 통해서도 허용된다.

```js
import { style, createVar } from '@vanilla-extract/css'

const myVar = createVar()

const myStyle = style({
  vars: {
    [myVar]: 'purple',
  },
})
```

```css
.styles_myStyle__1hiof571 {
  --myVar__1hiof570: purple;
}
```

### Media Queries

일반적인 CSS와 달리 스타일 정의 안에 `@media` 키를 사용하여 미디어 쿼리를 포함한다.
미디어 쿼리는 파일의 마지막에 처리되어 다른 스타일보다 높은 우선순위를 갖게 한다.

```js
import { style } from '@vanilla-extract/css'

const myStyle = style({
  '@media': {
    'screen and (min-width: 768px)': {
      padding: 10,
    },
    '(prefers-reduced-motion)': {
      transitionProperty: 'color',
    },
  },
})
```

```css
@media screen and (min-width: 768px) {
  .styles_myStyle__1hiof570 {
    padding: 10px;
  }
}
@media (prefers-reduced-motion) {
  .styles_myStyle__1hiof570 {
    transition-property: color;
  }
}
```

### Theming

전역적인 테마를 다루기 위해 `createTheme`을 사용한다.
`createTheme`는 두 가지를 반환한다.

- **A class name**: 제공된 테마 변수에 대한 컨테이너 클래스
- **A theme contract**: 제공된 테마 구현의 모양과 일치하는 CSS 변수의 타입 데이터 구조

```js
import { createTheme } from '@vanilla-extract/css'

export const [themeClass, vars] = createTheme({
  color: {
    brand: 'blue',
  },
  font: {
    body: 'arial',
  },
})
```

```css
.theme_themeClass__z05zdf0 {
  --color-brand__z05zdf1: blue;
  --font-body__z05zdf2: arial;
}
```

현재 존재하는 theme contract(테마 계약?)을 활용하여 새로운 테마 값을 생성할 수 있다.

```js
export const otherThemeClass = createTheme(vars, {
  color: {
    brand: 'red',
  },
  font: {
    body: 'helvetica',
  },
})
```

```css
.theme_otherThemeClass__z05zdf3 {
  --color-brand__z05zdf1: red;
  --font-body__z05zdf2: helvetica;
}
```

이외에도 여러 API들이 존재하고 확장을 위해 구축된 [Sprinkles](https://vanilla-extract.style/documentation/packages/sprinkles/), [Recipes](https://vanilla-extract.style/documentation/packages/recipes/)와 같은 라이브러리도 존재한다.

이는 다음에 기회가 되면 사용해보면서 정리하는 방향으로... 😂

## 체화하기

간단하게 vanilla-extract를 사용해보자.
사용 환경은 `Vite`, `react-ts`로 진행된다.

vanilla-extract 라이브러리를 설치한다.

```
yarn add @vanilla-extract/css
```

Vite 구성 플러그인을 더한다.

```
yarn add -D @vanilla-extract/vite-plugin
```

`vite.config.js`에서 플러그인을 추가한다.

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
})
```

설정은 끝났다. 이제 사용만 하면 된다.

vanilla-extract은 `.css.ts` 방식으로 파일을 작성한다.
이를 통해 스타일에 대한 타입 추론이 가능하다.

타입스크립트의 도움을 받으며 `Header`를 만들어보자.

**Header.css.ts**

<Image
  src="https://raw.githubusercontent.com/jgjgill/blog/main/contents/development/css-in-ts-vanilla-extract/images/header-css-code.gif"
  alt="header-css-code"
/>

CSS에서도 편하게 타입스크립트가 적용되는 것을 확인할 수 있다.

이제 스타일을 적용하자.

```js
import { PropsWithChildren } from 'react'
import * as styles from './Header.css'

interface HeaderProps {}

function Header({ children }: PropsWithChildren<HeaderProps>) {
  return (
    <div className={styles.root}>
      <h1>{children}</h1>
    </div>
  )
}

export default Header
```

`import`할 때 `.ts`가 제거되는 것을 볼 수 있다.

다음과 같이 잘 적용된다.

<Image
  src="https://raw.githubusercontent.com/jgjgill/blog/main/contents/development/css-in-ts-vanilla-extract/images/result-code.png"
  alt="result-code"
/>

만들어진 코드를 구체적으로 살펴보면 Zero runtime과 관련해서 사용된 스타일 코드가 난독화를 거쳐 만들어진다.

**style 태그**

<Image
  src="https://raw.githubusercontent.com/jgjgill/blog/main/contents/development/css-in-ts-vanilla-extract/images/style-code.png"
  alt="style-code"
/>

**난독화가 적용된 class 이름**

<Image
  src="https://raw.githubusercontent.com/jgjgill/blog/main/contents/development/css-in-ts-vanilla-extract/images/classname-code.png"
  alt="classname-code"
/>

가볍게 사용해봤는데, CSS에도 타입스크립트를 적용한다는 점이 가장 매력적으로 다가왔고 스타일을 객체로 적용하는 점이 구조적으로 좋게 느껴졌다.
앞으로도 계속 vanilla-extract에 적응하고 더 깊은 기능들을 사용하면서 개발 효율성을 높이고 싶다. 😚

## 출처

- [vanilla-extract](https://vanilla-extract.style)
- [RF21 – Mark Dalgleish – Zero-runtime CSS-in-TypeScript with vanilla-extract
  ](https://www.youtube.com/watch?v=23VqED_kO2Q)
- [Vanilla Extract - CSS in JS at compile time
  ](https://www.youtube.com/watch?v=SeVF1OFy5_I)
- [CSS in TypeScript with vanilla-extract](https://css-tricks.com/css-in-typescript-with-vanilla-extract)
