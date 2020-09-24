# styled-components로 디자인 시스템 따라해보기 - 1

styled-components의 기초적인 내용을 숙지한다면 더 편하게 읽을 수 있는 내용입니다. 기초적인 내용을 알고 싶은 분들은 styled-components 공식 사이트의 [Getting Started 문서](https://styled-components.com/docs/basics#getting-started)를 참고해주세요.

## 디자인 시스템

![Material Design](https://www.sketchappsources.com/resources/source-image/baseline-material-design-components-marina.jpg)

**디자인 시스템**. '디자인' 세 글자가 들어가기에 개발자들에겐 생소할 수 있는 단어입니다. 게다가 '시스템'이라기에 더 어렵게 느껴질 수도 있는데요. 생각만큼 그렇게 어려운 개념은 아닙니다. 마이리얼트립 배재민 디자이너의 말을 빌려오자면,

> ‘디자이너로서 일의 효율성을 높이기 위해 고민했을 때, 가장 먼저 떠오른게 디자인 시스템이었어요. 디지털 디자인에서 디자인 시스템이란, 서비스를 만드는데 사용한 공통 컬러, 서체, 인터랙션, 각종 정책 및 규정에 관한 모든 컴포넌트를 정리해놓은 것을 뜻합니다. 불필요한 커뮤니케이션을 없애기 위해 체계적으로 정리한 시스템이죠.’ ***(***[***디자인, 시스템, 그리고 숫자 : 마이리얼트립 배재민 디자이너 인터뷰 중***](https://publy.co/content/2686)***)***

`서비스를 만드는데 사용한 공통 컬러, 서체, 인터랙션, 각종 정책 및 규정에 관한 모든 컴포넌트를 정리해놓은 것`이 바로 디자인 시스템입니다. 구글의 메터리얼 디자인이나, 애플의 휴먼디자인 인터페이스, 에어비앤비의 디자인 시스템 등이 디자인 시스템의 좋은 예입니다. 개발자에게도 알고 보면 친숙한 개념인데요. 예를 들어, React에서 스타일 작업을 할 때 많이 사용되는 [Material UI](material-ui.com)는 구글의 메터리얼 디자인 시스템을 개발자가 사용하기 쉽게 프레임워크, 즉 코드의 형태로 옮겨 놓은 것입니다.

이번 포스트에서는 당연하게도 메터리얼 디자인 정도의 복잡한 디자인 시스템은 다루지 않습니다. 개발자 한 명이 다룰 수 있는 양이 아니기도 하구요. 복잡하고 많은 UI를 가진 프로젝트고, 빠른 시간내에 제작해야 한다면 UI 프레임워크나 라이브러리를 사용하는 게 좋겠죠. 디자이너에게도 어려운 디자인을 어설프게 건드는 것보단, 이미 검증된 디자인을 가져다 사용하는게 보통 더 좋은 퀄리티를 보장해줍니다.

하지만 디자인이 많이 필요하지 않은 작은 프로젝트거나, 세부적인 UI 디테일까지 손보고 싶은 경우도 있겠죠. 프로젝트 밑바닥부터 CSS를 작성하고 싶은 분도 있을 것입니다. 이번 포스트에서는 그런 분들을 위해 제가 공부하면서 배웠던 것들을 공유하고자 합니다. React에서 styled-components를 사용해서 스타일 코드의 중복을 어떻게 더 줄이고, 모듈화해서 사용할 수 있을지 알아보겠습니다.

## 패키지 설치

styled-components를 프로젝트 디렉토리에 설치합니다.

```zsh
npm install --save styled-components
```

## 컴포넌트 만들기

간단한 컴포넌트 하나를 만들어봅니다.

```js
// src/App.js
import React from "react";

export default function App() {
  return (
    <div className="App">
      <h1>Hello World</h1>
     <p>Lorem ipsum dolor sit amet</p>
      <button>My name is Button</button>
    </div>
  );
}
```

## styled-components 적용하기

styled-component를 import 해서 기본 HTML 태그들에 간단한 스타일을 적용해봅시다.

```js
import React from "react";
import styled from "styled-components";

export default function App() {
  return (
    <div className="App">
      <Title>Hello World</Title>
      <Paragraph>Lorem ipsum dolor sit amet</Paragraph>
      <Button>My name is Button</Button>
    </div>
  );
}

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: blue;
`;

const Paragraph = styled.p`
  font-size: 1.125rem;
 font-weight: 400;
  line-height: 1.5;
`;

const Button = styled.button`
  padding: 0.5em;
  border-radius: 6px;
  background-color: white;
`;

```

## 스타일 변수로 분리하기

`font-size` 나 `color` 등의 CSS 속성들을 여러 컴포넌트에서 사용한다면, 그 속성은 변수로 분리해주는 편이 좋습니다.

CSS 속성을 변수로 분리하는 데는 2가지 방법이 있습니다.

1. [CSS var()](https://developer.mozilla.org/ko/docs/Web/CSS/var) 사용하기
2. [styled-components의 ThemeProvider](https://styled-components.com/docs/advanced) 사용하기

### 1. CSS var() 사용

`var()` 구문을 사용해서 CSS 에서도 일종의 전역 변수처럼 반복되는 속성값들을 저장해두고 사용할 수 있습니다. 보통 이 전역 변수들을 `:root`  수도 클래스 안에서 선언합니다. styled-component를 사용한다면 각 컴포넌트별로 스타일을 지정해주기에 전역 변수를 어디서 선언해야 할지 난감할 수가 있는데, 이는 GlobalStyle을 사용함으로써 해결할 수 있습니다.

`styles` 폴더를 생성하고, 아래 `GlobalStyle.js` 파일을 만듭니다.

```js
// src/styles/GlobalStyle.js
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  // 변수명 앞에 두 개의 대시(--)를 붙여서 사용합니다.
  // :root 의사 클래스는 문서 트리의 루트 요소를 선택합니다. <html> 요소와 동일합니다.
  :root {
    --font-size-md: 1.5rem;
    --font-size-base: 1.125rem;
    --color-white: white; // 간단하게 white로 설정했지만, 보통은 rgb값이나 hex값으로 설정합니다.
    --color-blue: blue;
  }
`;

export default GlobalStyle;
```

최상단 컴포넌트(`App.js`)에서 `GlobalStyle`을 import해서 사용할 수 있습니다.

```js
import React from "react";
import styled from "styled-components";
import GlobalStyle from "./styles/GlobalStyle";

export default function App() {
  return (
    <div className="App">
      <GlobalStyle />
      <Title>Hello World</Title>
      <Paragraph>Lorem ipsum dolor sit amet</Paragraph>
      <Button>My name is Button</Button>
    </div>
  );
}

const Title = styled.h1`
  // var(변수명)으로 사용합니다.
  font-size: var(--font-size-md);
  font-weight: 800;
  color: var(--color-blue);
`;

const Paragraph = styled.p`
  font-size: var(--font-size-base);
  font-weight: 400;
  line-height: 1.5;
`;

const Button = styled.button`
  padding: 0.5em;
  border-radius: 6px;
  background-color: var(--white);
`;
```

### 2. styled-components의 ThemeProvider 사용

`ThemeProvider` 는 React의 Context API를 사용해서 설정한 값들을 하위 컴포넌트들에게 전달해줍니다. 전달된 값은 `props.theme`에 접근해서 사용할 수 있습니다.

실습을 위해 `styles` 디렉토리 안에 `theme.js` 파일을 만듭니다. 쉽게 객체 리터럴로 생성해주면 됩니다. 1번 예제에서 사용했던 것처럼 font-size와 color를 위한 변수를 만들었습니다.

```js
// src/styles/theme.js
const fontSize = {
  md: "1.5rem",
  base: "1.125rem"
};

const color = {
  white: "white",
  blue: "blue"
};

const theme = {
  fontSize,
  color
};

export default theme;
```

Theme를 사용할 최상단 컴포넌트에서 import 해줍니다. `ThemeProvider` 로 하위 컴포넌트들을 감싸서 값을 전달해줍니다.

```js
// src/App.js
import React from "react";
import styled, { ThemeProvider } from "styled-components";
import theme from "./styles/theme";

export default function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Title>Hello World</Title>
        <Paragraph>Lorem ipsum dolor sit amet</Paragraph>
        <Button>My name is Button</Button>
      </ThemeProvider>
    </div>
  );
}

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: 800;
  color: ${({ theme }) => theme.color.blue};
`;

const Paragraph = styled.p`
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 400;
  line-height: 1.5;
`;

const Button = styled.button`
  padding: 0.5em;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.color.white};
`;
```

이번 포스트에선 간단하게 CSS 속성값들을 어떻게 변수화시켜 관리할지에 대해 알아봤습니다. 다음 포스트에선 변수뿐 아니라, 스타일 컴포넌트 자체를 더 모듈화시켜 사용할 수 있는 방법에 대해 알아보겠습니다.

예제 코드는 아래에서 확인할 수 있습니다.

<iframe src="https://codesandbox.io/embed/styled-components-design-system-jlob0?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="styled-components-design-system-1"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>
