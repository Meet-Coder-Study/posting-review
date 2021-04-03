# 크로스 브라우징 정의

모든 브라우저와 디바이스에서 가능한 **동등한** 수준의 정보, 기능을 제공하는 것. ex) 스크린 리더에서도 사이트를 읽을 수 있도록 함

- 똑같이 보일 필요는 없음( 최신 버전에서는 3D 이미지를 구버전 브라우저에서는 평면 도형을 보여주는 방식 )
- 플랫폼 사용자가 수용 가능한 수준으로 핵심 기능과 정보를 제공하도록 하는 것 (심지어 출력물도 고려, 폰트에 색상 속성 사용 자제)

# 크로스 브라우징 원칙

- 특정 브라우저에 종속성을 가진 기능은 가급적 사용을 배제한다.
- 웹 사이트는 그래픽을 연결하지 않은 상태로도 사용 가능해야 한다.
  - 핵심 정보는 반드시 텍스트/HTML 포맷으로 제공되어야 한다. ex) flash 같은 것으로 전체 화면을 구성해서는 안된다.
  - 핵심 정보를 표현하는데 이미지를 사용하는 것은 최소화해야 한다. 사용한다면 텍스트 형식의 alt 값을 제공해야 한다.
- HTML 태그로 스타일을 지정하지 않는다. CSS를 사용한다.

# 크로스 브라우징 이슈 해결법

- [caniuse.com](http://caniuse.com) 에서 브라우저 호환성을 확인한다.
- 폴리필을 사용한다. 단, 사이트 로딩속도를 고려한다. 정보 전달이나 사용자 경험에 치명적이지 않은 경우에는 graceful degradation할 수 있다.
- HTML 폴백을 사용한다.

```html
<video id="video" controls preload="metadata" poster="img/poster.jpg">
  <source src="video/tears-of-steel-battle-clip-medium.mp4" type="video/mp4" />
  <source
    src="video/tears-of-steel-battle-clip-medium.webm"
    type="video/webm"
  />
  <!-- Offer download -->
  <!-- non-supporting browsers will effectively ignore the outer element -->
  <p>
    Your browser does not support HTML5 video; here is a link to
    <a href="video/tears-of-steel-battle-clip-medium.mp4">view the video</a>
    directly.
  </p>
</video>
```

- css 폴백을 사용한다.

```html
<!--[if lte IE 8]>
  <script src="ie-fix.js"></script>
  <link href="ie-fix.css" rel="stylesheet" type="text/css" />
<![endif]-->
```

# 바벨

최신 자바스크립트 코드를 변환 하여 구버전의 브라우저에 호환되도록 하는 트랜스파일러.

최근에는 JSX, 타입스크립트 등 확장 문법을 지원하는데도 사용

## 빌드

1. Parsing : 코드를 syntax tree로 변환
2. Transforming : AST를 실제 코드로 변경
3. Printing : 변경된 결과물을 출력

## Transforming

- 바벨 코어는 Parsing과 Printing만 수행
- Transforming 작업은 **플러그인**이 처리
- 플러그인을 모아놓은 것이 **프리셋**
  - preset-flow, preset-react, preset-typescript : flow, react, typescript를 위한 프리셋
  - preset-env : ES6 변환에 사용되는 프리셋
    - target : 타겟 브라우저의 버전 지정
    - useBuiltIns : 폴리필 설정 (ex. ie 에서 Promise 사용)

```jsx
// babel.config.js:
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          chrome: "79", // 크롬 79까지 지원하는 코드를 만든다
          ie: "11"
        }
      },
      {
        useBuiltIns: "usage", // 폴리필 사용 방식 지정
        corejs: {
          // 폴리필 버전 지정
          version: 2
        }
      }
    ]
  ]
};
```

## 바벨 실행

- CLI 사용
- webpack의 babel-loader 사용

```jsx
// webpack.config.js:
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader" // 바벨 로더를 추가한다
      }
    ]
  }
};
```
