---
title: '참조 복사에 대해 알아보기'
description: '참조 복사와 관련하여 정리합니다.'
date: '2023-06-07'
slug: 'development'
thumbnail: './images/reference-copy-thumbnail.png'
thumbnail_alt: 'reference-copy-thumbnail'
category: 'development'
---

# 참조 복사 정리하기

<Callout>
  💡 참조 복사와 관련된 개념 및 기능들을 정리합니다. 피드백은 언제나 환영입니다:)
</Callout>

기본형이 아닌 값들은 참조로 다루어져 객체가 변수에 저장될 때 객체의 메모리 위치를 나타내는 **식별자**를 저장한다.
그래서 값을 복사할 때 유의해야 한다.

## 얕은 복사

**얕은 복사**에서는 [Object.assign()](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) 혹은 [스프레드 연산자](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Spread_syntax)를 사용할 수 있지만,
깊게 중첩된 속성의 경우 원본과 복사본 모두 영향을 받게 된다.

```js
const theOriginal = {
  someProp: 'with a string value',
  anotherProp: {
    withAnotherProp: 1,
    andAnotherProp: true,
  },
}

const theShallowCopy = Object.assign({}, theOriginal)

theShallowCopy.aNewProp = 'a new value'
console.log(theOriginal.aNewProp) // undefined

theShallowCopy.anotherProp.aNewProp = 'a new value'
console.log(theOriginal.anotherProp.aNewProp) // a new value
```

```js
const myOriginal = {
  someProp: 'with a string value',
  anotherProp: {
    withAnotherProp: 1,
    andAnotherProp: true,
  },
}

const myShallowCopy = { ...myOriginal }

myShallowCopy.aNewProp = 'a new value'
console.log(myOriginal.aNewProp) // undefined

myShallowCopy.anotherProp.aNewProp = 'a new value'
console.log(myOriginal.anotherProp.aNewProp) // a new value
```

## 깊은 복사

**깊은 복사**는 원본 객체와는 별도의 객체를 만들어 원본객체가 변경되어도 복사본은 영향을 받지 않는다.

### JSON.parse(), JSON.stringify()

`JSON.parse(), JSON.stringify()`은 다음과 같이 사용할 수 있다.

```js
const myDeepCopy = JSON.parse(JSON.stringify(myOriginal))
```

이 해결 방법은 유용하고 많이 사용되지만,
몇 가지 단점을 가지고 있다.

- **재귀 데이터 구조**: `JSON.stringify()`는 재귀 데이터 구조를 사용하면 에러를 던진다. 이는 연결 리스트나 트리에서 주로 발생한다.
- **내장 타입**: `JSON.stringify()`는 값에 `Map`, `Set`, `Date`, `RegExp`, `ArrayBuffer`와 같은 JS 내장 기능이 포함되어 있으면 에러를 던진다.
- **함수**: `JSON.stringify()`는 빠르게 함수를 버린다.

### structuredClone()

`structuredClone()`은 다음과 같이 사용할 수 있다.

```js
const myDeepCopy = structuredClone(myOriginal)
```

`structuredClone()`은 [모든 주요 브러우저에서 지원](https://caniuse.com/?search=structuredClone)된다.

또한, `structuredClone()`은 `JSON.stringify()` 방식의 단점들을 보완해준다.
**재귀 데이터 구조**를 다룰 수 있고 **내장 타입**을 지원한다.

**stringify와 structuredClone 비교**

```js
const Person = {
  name: 'John',
  date: new Date('2022-03-25'),
  friends: ['Steve', 'Karen'],
}

const buggyCopy = JSON.parse(JSON.stringify(Person))
// {name: 'John', date: '2022-03-25T00:00:00.000Z', friends: Array(2)}

const bugfreeCopy = structuredClone(Person)
// {name: 'John', date: Fri Mar 25 2022 09:00:00 GMT+0900 (한국 표준시), friends: Array(2)}
```

JSON은 객체를 문자열로 인코딩하는 형식으로 다른 타입과 함께 사용하면 작동하는 방법을 예측하기 어려워진다.
그래서 `JSON.stringify()`은 예상한 대로 결과가 나오지 않는 것이다.

**structuredClone() 한계**

`JSON.stringify()`의 대부분의 단점을 보완했지만,
`structuredClone()`에서도 몇 가지 제한 사항이 존재한다.

- **함수**: `JSON.stringify()`와 동일하게 함수가 포함되어 있으면 빠르게 버린다.
- **프로토타입**: 클래스 인스턴스와 함께 사용하면 객체의 프로토타입 체인은 버려져서 반환 값이 순수 함수가 된다.
- **복제 불가**: `Error`나 DOM 노드와 같은 일부 값은 복제가 불가능하여 에러를 던진다.

비록 `structuredClone`에서도 아직 일부 제한되는 점이 있지만,
이전보다 **쉽고 직관적**으로 깊은 복사를 수행할 수 있어 가장 좋게 느껴진다.

## 마무리

이번에도 개념을 학습하면서 MDN에 [번역](https://github.com/mdn/translated-content/pull/13592)을 함께 진행했다.
번역을 하게 되면 MDN 문서를 꼼꼼하게 살펴보게 되는데,
그러면서 `structuredClone`에서 사용된 `transfer`이라는 용어와 개념에 대해서도 새로 알 수 있었다.

학습과 번역을 같이 진행하는 방식이 시간이 많이 소요되지만,
학습 내용이 나에게 더 와닿아서 기억에 오래 남고 번역을 마무리하며 목표한 바를 이루었다는 성취감을 주어서 좋은 것 같다.

## 출처

- [Deep-copying in JavaScript using structuredClone](https://web.dev/structured-clone/)
- [structuredClone() global function](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)
- [Deep Copying Objects With The StructuredClone API](https://blog.openreplay.com/deep-copying-objects-with-the-structuredclone-api/)
