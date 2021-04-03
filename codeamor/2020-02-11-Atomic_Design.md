# Atomic Design이란?

![image](https://user-images.githubusercontent.com/65898889/107655010-8542bd00-6cc6-11eb-99c8-bf5b743bf13a.png)

# 필요성

기존의 마크업(대표적으로 jQuery)은 페이지 하나를 통으로 작업을 했기 때문에, 클래스 분기나 css 상속 등 다양한 것들을 고려하여 웹 페이지를 제작해야 했습니다.
하지만 React나 Vue 와 같은 환경에서 개발을 할 때는 각 요소들을 하나의 기능으로 보고 독립적인 UI 컴포넌트를 만들어 페이지를 구성하게 됩니다.

React와 같은 컴포넌트 재사용에 특화된 환경에서 작업을 할 때에는 디자인 시안 보면서 컴포넌트를 나누는 기준을 고민할 수 밖에 없습니다.

따라서 컴포넌트 재사용성을 최적화 시키는 것이 화면단 개발에서 중점이 되는데, 오늘은 그 방법론 중 하나인 Atomic Design Pattern에 대해 소개하겠습니다.

# Atomic Design

![image](https://user-images.githubusercontent.com/65898889/107655146-9db2d780-6cc6-11eb-966e-fd50337bbbca.png)

2013년 브래드 프로스트(Brad Frost)라는 스타일가이드 관련 경험도가 높은 웹디자이너가 제시한 `Atomic Design`은

생물화학적 개념인 원자, 분자, 유기체 등을 디자인 패턴에 적용시켜서 인터페이스를 세분화한 디자인 시스템을 만드는 방법론입니다.

![image](https://user-images.githubusercontent.com/65898889/107655318-cd61df80-6cc6-11eb-8ac4-6877a537f16c.png)

## 원자(atom)

가장 기본적인 구성 요소입니다.

라벨, 인풋 요소나 버튼 등 1차원 적인 요소들을 의미합니다.

## 분자(molucules)

의미가 분명한 아톰 혹은 의미가 흐린 아톰들끼리 결합하여 보다 구체적인 의미를 지니는 UI 단위를 만들게 됩니다.

## 유기체(organism)

분자들이 결합하여 보다 큰 의미를 지니는 유기체를 구성합니다.

## 템플릿 (template)

유기체들이 모여 실질적 디자인 화면 산출물(레이아웃)을 만들게 됩니다.

## 페이지 (page)

템플릿에서 완성된 레이아웃에 더미 데이터 혹은 실제 데이터를 넣어 특정 인터페이스 페이지를 만들게 됩니다.

<br>

![2021-02-11-atomic_page_ani](https://user-images.githubusercontent.com/65898889/107657242-56c5e180-6cc8-11eb-8f6c-d57326ad55f8.gif)

# Storybook

Storybook은 UI 개발을 위한 도구입니다.
외부 환경에 의존하지 않고 독립된 환경에서 뷰에만 집중하여 UI를 컴포넌트 별로 분리한 개발 환경을 제공합니다.

[스토리북 공식 문서 튜토리얼](https://www.learnstorybook.com/intro-to-storybook/react/en/get-started/)

![image](https://user-images.githubusercontent.com/65898889/107653290-ce920d00-6cc4-11eb-80b9-3d7cbb433c05.png)

## Airbnb 스토리북 예시

[Airbnb Date Storybook](https://airbnb.io/react-dates/?path=/story/daypicker--default)

# Atomic Design 의 장점

- 컴포넌트 재사용의 효율을 최대로 올릴 수 있습니다.

- 간단 명료하고, 데이터의 타입과 기능의 명세를 통해 각각의 컴포넌트의 역할을 바로 알 수 있습니다.

# Atomic Design 의 단점

- 러닝 커브가 높습니다.

- UI 변화에 유연하지 않습니다.

- 실제로 1개월 동안 스타트업 기업에서 Storybook을 활용해 협업을 해보았는데, 개발 진행 속도가 현저하게 떨어졌습니다. 컴포넌트 재사용성을 고려하는 것에 시간 소모가 컸고, 비슷하지만 미묘하게 다른 컴포넌트들을 커스텀 하는 것도 처음에 쉽지가 않아서 상당히 애를 먹었습니다. 스타트업에서 스토리북을 도입하는 것은 모 아니면 도가 될 수도 있어서 신중히 결정해야 한다고 합니다.

# Reference

[개인 블로그](https://blog.hyungsub.com/entry/%EC%95%84%ED%86%A0%EB%AF%B9%EB%94%94%EC%9E%90%EC%9D%B8-Atomic-Design-%EC%9B%90%EC%9E%90%EB%8B%A8%EC%9C%84%EB%94%94%EC%9E%90%EC%9D%B8-%EB%B0%A9%EB%B2%95%EB%A1%A0-%EA%B0%84%EB%8B%A8%ED%95%98%EA%B2%8C-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B3%A0-%EC%9D%91%EC%9A%A9%ED%95%98%EA%B8%B0)

[Line Entry의 Atomic Design 적용기](https://www.youtube.com/watch?v=33yj-Q5v8mQ)
