# CRA 없이 React 프로젝트 시작하기

Mono-Repo를 구성하기전에 React 프로젝트 부터 구성을 해볼려고 합니다.

CRA 의존을 하지 않고 webpack + react 프로젝트를 처음부터 세팅하는 방법을 소개해드릴려고 합니다.

## 패키지 설치

```shell
yarn init
// package.json 생성

yarn add react react-dom
// react 설치

<!-- yarn add -D typescript @types/react @types/react-dom -->
<!-- 타입스크립트 설치 -->

yarn add -D webpack webpack-cli webpack-dev-server
// webpack 설치

yarn add -D html-webpack-plugin clean-webpack-plugin
// webpack plugin 설치

yarn add -D babel-loader css-loader style-loader
// webpack loader 설치

yarn add -D @babel/core @babel/preset-react @babel/preset-env
// babel 설치
```

## babel

```javascript
// babel.config.js
module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-react"],
};
// @babel/preset-env ES6 이상의 문법을 ES5 이하로 변환해준다.
// @babel/preset-react jsx 문법을 js 코드로 변환해준다
```

## webpack

```javascript
// webpack.config.js
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: { react_app: "./src/index.js" },
  // 번들링이 시작되는 파일
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  // 번들링이 완료되면 저장될 경로와 번들링 파일 이름
  resolve: { extensions: [".js", ".jsx", ".css"] },
  // 번들링의 대상이 될 파일 확장자
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: "/node_modules/",
        loader: "babel-loader",
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
    ],
  },
  // webpack에 연결할 loader를 등록하는 객체
  // 파일들을 등록된 규칙에 맞게 모듈로 연결
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
  // 번들링된 결과물에 특정 효과를 주는 도구
  // CleanWebpackPlugin 이전 번들링을 지워줌
  // HtmlWebpackPlugin 번들링된 파일을 script 태그에 주입시켜줌
  devServer: {
    host: "localhost",
    port: 3000,
    hot: true,
    open: true,
  },
  // 객체의 조건에 맞게 개발 서버를 열어줌
};
```

## html

```html
<!-- ./public/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## js

```javascript
// ./src/index.js
import React from "react";
import ReactDOM from "react-dom/client";

const App = () => {
  return <div>Hello Taekyeom</div>;
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

## React 18 이슈

`ReactDOM.render`가 더 이상 React 18 에서는 지원하지 않는 이슈입니다. 따라서 `createRoot`으로 수정해야합니다.

// Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17.

[react-18-upgrade-guide](https://ko.reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html)

```javascript
// before
// ./src/index.js
import ReactDOM from "client";

ReactDOM.render(<App />, document.getElementById("root"));
```

```javascript
// after
// ./src/index.js
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

[Create-React-App 없이 리액트 프로젝트 시작하기](https://www.youtube.com/watch?v=wSzh8iSdYUQ&ab_channel=CodeStates)
