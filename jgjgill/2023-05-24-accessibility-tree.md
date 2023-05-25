# 접근성 트리 정리하기

## 들어가기

React 문서에서 UI 트리와 관련된 부분을 읽어보는 과정에서 새로운 용어를 접하게 되었다.

> Browsers use many tree structures to model UI. The DOM represents HTML elements, the CSSOM does the same for CSS. There’s even an Accessibility tree!

**DOM**과 **CSSOM**는 브라우저 렌더링 과정을 공부하면서 접해본 경험이 있지만,
**Accessibility tree**는 이번에 처음 알게 되었다.
이번 기회에 **접근성 트리**가 무엇인지 알아보면 좋을 것 같다.

### 접근성 트리란?

접근성 트리는 **웹 접근성**을 평가하고 개선하기 위해 사용된다.
여기서 웹 접근성은 모든 사람이 웹 사이트나 애플리케이션에 동등하게 접근할 수 있는 능력을 의미한다.
그래서 주로 장애를 가진 사람들을 위해 고려된다.

접근성 트리는 웹 페이지의 구조를 시각적으로 표현하여 **대부분의 HTML 요소에 대한 정보와 관련된 접근성**을 포함한다.
플랫폼별 접근성 API에서 스크린 리더와 같은 **보조 기술이 이해할 수 있는 표현을 제공**하기 위해 사용한다.

예를 들어 스크린 리더를 위한 사용자를 고려할 때 모든 시각적인 UI를 고려할 필요가 없다.
DOM 트리와는 비슷하지만, 시각적인 표현을 제외한 더 적은 정보와 노드들로 구성된다.

<image
  src="https://raw.githubusercontent.com/jgjgill/blog/main/contents/development/learn-about-accessibility-tree/images/screen-reader-dom-api-mockup.png"
  alt="screen-reader-dom-api-mockup"
/>

접근성 트리로 구성된 페이지는 대략 다음과 같이 오래된 웹 페이지와 같은 형태가 된다.

<image
  src="https://raw.githubusercontent.com/jgjgill/blog/main/contents/development/learn-about-accessibility-tree/images/1990s-style-web-page.png"
  alt="1990s-style-web-page"
/>

따라서 개발자는 **페이지의 의미들(semantics)을 적절하게 표현**하는 것이 중요하다.
페이지의 중요한 요소들(elements)이 올바르게 접근할 수 있도록 역할(role), 상태(state), 속성(property), 이름(name), 설명(description)들을 명시해야 한다.
이를 통해 보조 기술이 적절하게 정보에 접근할 수 있다.

### 접근성 트리 생성 과정

브라우저는 마크업을 **DOM 트리**로 불리는 내부적인 표현으로 전환시킨다.
DOM 트리는 모든 마크업의 요소, 특성, 텍스트 노드를 표현하는 객체들을 포함한다.
그 다음 브라우저는 DOM 트리에 기반된 **접근성 트리**를 생성한다.
접근성 트리는 플랫폼별 접근성 API에서 보조 기술이 이해할 수 있는 표현을 제공하기 위해 사용된다.

### Devtool에서 접근성 트리 확인하기

크롬에서는 다음과 같이 접근성 트리 사용을 설정할 수 있다.

<image
  src="https://raw.githubusercontent.com/jgjgill/blog/main/contents/development/learn-about-accessibility-tree/images/chrome-accessibility-tree.gif"
  alt="chrome-accessibility-tree"
/>

## 나아가기

### MDN 기여하기

MDN 문서에 한글로 된 접근성 트리 문서가 없어서 [번역](https://github.com/mdn/translated-content/pull/13360)을 했다.
공부하면서 겸사 겸사 개발 커뮤니티에도 도움을 줄 수 있어서 성취감도 얻고 좋은 것 같다.😄

## 출처

- [Accessibility tree](https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree)
- [The Accessibility Tree](https://web.dev/the-accessibility-tree/)
- [Full accessibility tree in Chrome DevTools](https://developer.chrome.com/blog/full-accessibility-tree/)
