# Micro Frontend Architecture (feat: module federation)

## Micro Fronend Architecture

![mfa](https://martinfowler.com/articles/micro-frontends/deployment.png)

전체 화면을 작동할 수 있는 단위로 나누어 개발한 후 서로 조립하는 방식입니다.

## Module Federation

2020년 10월 10일 webpack 5가 릴리스했고 그 때 추가된 기능들 중 하나입니다.

Multiple separate builds should form a single application. These separate builds should not have dependencies between each other, so they can be developed and deployed individually.

번역하자면 여러 개의 개별 빌드가 단일 애플리케이션을 형성해야 하고. 이러한 개별 빌드는 서로 의존성이 없어서, 개별적으로 개발하고 배포할 수 있습니다라고 하고있습니다.

## Terminology

- host

  모듈을 소비하는 주체

- remote

  소비되는 모듈을 노출시키는 주체

- bidirectional module federation

  서로가 모듈을 소비하고 소비되는 모듈을 노출시키는 행위

## webpack.config.js 살펴보기

```javascript
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

const deps = require("./package.json").dependencies;

module.exports = {
  // other webpack configs...
  plugins: [
    new ModuleFederationPlugin({
      name: "host",
      filename: "remoteEntry.js",
      remotes: {
        remote1: "remote1@http://localhost:3000/remoteEntry.js",
        remote2: "remote2@http://localhost:3001/remoteEntry.js",
        remote3: "remote3@http://localhost:3002/remoteEntry.js",
      },
      exposes: {
        "./Component1": "./src/Component1.jsx",
        "./Component2": "./src/Component2.jsx",
        "./utils1": "./src/utils1.js",
        "./utils2": "./src/utils2.js",
        "./store1": "./src/store1.js",
        "./store2": "./src/store2.js",
      },
      shared: {
        ...deps,
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: deps["react-dom"],
        },
      },
    }),
  ],
};
```

- name

  해당앱의 유일한 이름으로 중복된 이름이 있으면 안됩니다.

- filename

  해당 앱을 다른 앱에서 사용하기 위한 정보가 담긴 Manifest 파일의 이름을 지정합니다. (기본값: remoteEntry.js)

- remotes

  해당 앱이 사용할 리모트 앱들을 정의하는 곳입니다.

- exposes

  외부에서 사용하기 위해 expose 시킬 모듈들을 정의합니다.

- shared

  런타임에 Federated된 앱 간에 공유하거나 공유받을 의존성 패키지를 정의합니다.

## index.js 살펴보기

```javascript
// App.jsx
import React from "react";
import ReactDOM from "react-dom";

import "./index.scss";

import MainLayout from "./MainLayout";

ReactDOM.render(<MainLayout />, document.getElementById("app"));
```

```javascript
// index.js
import("./App");
```

dynamic import를 통해서 lazy하게 앱의 main 코드를 불러오게 합니다.

웹팩이 앱을 실행하기 전에 Module Federation을 통해 통합되는 그 리모트 앱들을 로드하는 작업을 진행합니다.

## Host App에서 Remote App의 Component 모듈들을 렌더링시키기

```javascript
import Component1 from "host/Component1";
import Component2 from "host/Component2";
```

[https://martinfowler.com/articles/micro-frontends.html](https://martinfowler.com/articles/micro-frontends.html)

[https://webpack.kr/blog/2020-10-10-webpack-5-release/](https://webpack.kr/blog/2020-10-10-webpack-5-release/)

[https://webpack.kr/concepts/module-federation](https://webpack.kr/concepts/module-federation)

[https://indepth.dev/posts/1173/webpack-5-module-federation-a-game-changer-in-javascript-architecture](https://indepth.dev/posts/1173/webpack-5-module-federation-a-game-changer-in-javascript-architecture)

[https://www.youtube.com/watch?v=0Eq6evGKJ68&t=510s](https://www.youtube.com/watch?v=0Eq6evGKJ68&t=510s)

[https://www.youtube.com/watch?v=lKKsjpH09dU&t=1117s](https://www.youtube.com/watch?v=lKKsjpH09dU&t=1117s)

[https://github.com/module-federation/module-federation-examples](https://github.com/module-federation/module-federation-examples)
