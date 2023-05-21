# React에 StoryBook을 입혀보자.

## 도입

- 최근 회사에서 webpack의 Module Federation을 도입하게 되면서 React 프로젝트를 도입할 수 있는 기회가 생기게 되었다.
- 아울러 그에 맞춰서 백지에서 시작하는 프로젝트를 할 수 있게 되었는데, 그에 맞춰 Storybook을 세팅한 이야기를 작성해보려고 한다.

## React 프로젝트 생성

- React의 간단한 프로젝트를 생성하기 위해 [create-react-app](https://github.com/facebook/create-react-app) 을 사용해 간단히 만들어 본다.

```bash
npx create-react-app react-storybook-playround
```

## Storybook 구축

- storybook은 아래 명령어로 간단히 구축이 가능합니다.

```bash
npx storybook init
```

- 그렇다면 아래와 같은 의존성과 스크립트가 포함됩니다.

```json
"scripts": {
    "storybook": "start-storybook -p 6006 -s public",
    "build-storybook": "build-storybook -s public"
  },

"devDependencies": {
    "@storybook/addon-actions": "^6.5.9",
    "@storybook/addon-essentials": "^6.5.9",
    "@storybook/addon-interactions": "^6.5.9",
    "@storybook/addon-links": "^6.5.9",
    "@storybook/builder-webpack5": "^6.5.9",
    "@storybook/manager-webpack5": "^6.5.9",
    "@storybook/node-logger": "^6.5.9",
    "@storybook/preset-create-react-app": "^4.1.2",
    "@storybook/react": "^6.5.9",
    "@storybook/testing-library": "^0.0.13",
    "babel-plugin-named-exports-order": "^0.0.2",
    "prop-types": "^15.8.1",
    "webpack": "^5.73.0"
  }
```

- 또한 default 폴더와 설정 파일이 생성됩니다.

<img width="241" alt="image" src="https://user-images.githubusercontent.com/53366407/178131428-80eccda0-5d6a-4779-be6d-a20ed70016c4.png">

## 실행해보기

```json
npm run storybook
```

<img width="1788" alt="image" src="https://user-images.githubusercontent.com/53366407/178131436-476336c9-d673-464b-87ea-7404f14ab05c.png">

- 위와 같이 6006 port로 스토리북이 실행됩니다.

## main.js 살펴보기

```jsx
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/preset-create-react-app"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-webpack5"
  }
}
```

- 기본적으로 아래와 같은 환경설정을 지원합니다.
    - `stories` - story files의 위치를 작성해놓는 배열
    - `addons` -  addons(storybook의 외부 플러그인)의 사용 목록
    - `webpackFinal` - 웹팩 설정
    - `babel` - 바벨 설정
    - `framework` - 프로임워크의 특별한 설정
    
- 참고로 해당 파일은 TypeScript로도 가능합니다.

- 위에 설정보다 더 많은 설정을 보기 위해선 [이 페이지](https://storybook.js.org/docs/react/configure/overview#configure-your-storybook-project)를 참고해주세요.

## preview.js

```jsx
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
```

- 스토리북을 보여주는 global layout을 잡을 수 있는 파일입니다.

## Story 살펴보기

- 기본적으로 만든 Story 파일을 한번 살펴보겠습니다.

```jsx
import React from 'react';

import { Button } from './Button';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  primary: true,
  label: 'Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Button',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  label: 'Button',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Button',
};
```

- title : 메뉴에서 나오는 타이틀을 적는것으로 `/` 통해 계층으로 작성이 가능합니다.
- component: 어떤 컴포넌트를 스토리로 만들지 파일을 넣습니다.
- argTypes는 옵션입니다.
- 기본적인 세팅은 Template에 넣어둡니다.
- 그리고 Temlate.bind()로 각 Story를 만들어 둡니다.

## 결론

- 현재 도입은 간단히 컴포넌트를 관리하고 문서를 만드는 용으로 작성하려고 합니다.
- 도입을 하였을때 기대한 바는 아래와 같습니다.
    - 컴포넌트 단위로 개발이 쉬워집니다. (스토리를 먼저 만들고 개발을 진행함.)
    - 차후 비슷한 컴포넌트를 storybook으로 확인해 재사용성을 높입니다.
    - chromatic을 도입해 UI 테스트를 진행합니다.
    - test addons를 통해 컴포넌트 단위 테스트를 진행합니다.
    - 새로운 개발자가 들어왔을때 storybook을 통해 프론트엔드 컴포넌트를 파악이 가능합니다.
- 계속 도입을 통해 차후 개발 시 좋은 영향을 끼치리라 기대하고 있습니다.
