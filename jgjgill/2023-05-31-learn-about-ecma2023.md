---
title: 'ECMA2023에 대해 알아보기 - 배열 메서드 중심으로'
description: '배열 메서드 중심으로 ECMA2023에 대해 정리합니다.'
date: '2023-05-31'
slug: 'learn-about-ecma2023'
thumbnail: './images/ecma-script-2023-thumbnail.png'
thumbnail_alt: 'ecma-script-2023-thumbnail'
category: 'development'
---

# ECMA2023 정리하기

<Callout>💡 ECMA2023에 대해 정리합니다. 피드백은 언제나 환영입니다:)</Callout>

## ECMA2023

최근 ECMA2023에 대한 글들을 읽게 되면서 한 번 정리하는 시간을 가져야겠다는 생각을 했다.
[ECMA2023 명세서](https://tc39.es/ecma262/2023/)에서는 다음 문구를 살펴볼 수 있다.
대략적으로 어떤 부분들이 추가됐는지 확인할 수 있다.

> ECMAScript 2023, the 14th edition, introduced the toSorted, toReversed, with, findLast, and findLastIndex methods on Array.prototype and TypedArray.prototype, as well as the toSpliced method on Array.prototype; added support for #! comments at the beginning of files to better facilitate executable ECMAScript files; and allowed the use of most Symbols as keys in weak collections.

다음 [문서](https://github.com/tc39/proposals/blob/5d5b509133ab57f7953484354977b310d1414e21/finished-proposals.md)를 통해서도 스펙에 적용된 제안들에 대해 살펴볼 수 있다.
ECMA2023에는 다음과 같은 제안들이 적용되었다는 것을 확인할 수 있다.

- [Array find from last](https://github.com/tc39/proposal-array-find-from-last)
- [Hashbang Grammar](https://github.com/tc39/proposal-hashbang)
- [Symbols as WeakMap keys](https://github.com/tc39/proposal-symbols-as-weakmap-keys)
- [Change Array by Copy](https://github.com/tc39/proposal-change-array-by-copy)

이번 글에서는 자주 사용될 배열 메서드에 대해 살펴볼 것이다.
다른 제안들은 간략하게 요약만 하고 넘어가고자 한다.

- **Hashbang Grammer**: Hashbang(`#!`) 동작 통일화 및 표준화
- **Symbols as WeakMap keys**: `WeakMap`에 키 값으로 `Symbol`의 사용을 허용하도록 확장

## Array find from last

자주 사용하는 `find`와 `findIndex` 메서드와 반대되는 메서드들이 추가되었다.
기존 메서드는 앞에서부터 탐색을 시작하여 첫 번째로 만족하는 값을 반환한다.
그래서 뒤에 있는 값을 찾기 위해서는 `[...arr].reverse().find()`, `[...arr].reverse().findIndex()`와 같은 과정을 거쳐야 한다.

이는 `reverse` 메서드에 의해 **불필요한 변이(mutation)**, 기존 배열의 변이를 피하기 위해 **불필요한 복제**가 발생한다.
또한, `findIndex`같은 경우 **인덱스를 계산하는 것이 복잡해지는 문제**도 발생한다.

### findLast

`findLast` 메서드는 배열을 역순으로 반복하고 조건에 만족하는 첫 번째 값을 반환한다.
만약 요소가 없으면 `undefined`를 반환한다.

```js
const array1 = [5, 12, 50, 130, 44]

const found = array1.findLast((element) => element > 45)

console.log(found)
// 예상 출력: 130
```

### findLastIndex

`findLastIndex` 메서드는 배열을 역순으로 반복하고 조건에 만족하는 첫 번째 값의 인덱스를 반환한다.
만약 요소가 없으면 -1를 반환한다.

```js
const array1 = [5, 12, 50, 130, 44]

const isLargeNumber = (element) => element > 45

console.log(array1.findLastIndex(isLargeNumber))
// 예상 출력: 3
// 요소 인덱스의 값: 130
```

## Change Array by Copy

배열과 관련된 작업을 하다보면 `reverse`, `sort`, `splice` 메서드를 자주 사용하게 된다.
이때 이 메서드들은 기존 배열에 변이, 즉 `mutation`이 발생한다.

또한, 배열의 특정 값을 변경할때도 `mutation`이 불가피하게 발생한다.
`arr[2] = 'NEW_VALUE'`와 같은 방식으로 값을 변경하는데, 기존 배열에 변이가 발생한다.

이를 피하기 위해 기존 배열을 복사하고 변경하는 불필요한 과정을 거치게 된다.
`Array.from`, 스프레드 연산자 등 여러 방법을 통해 배열의 복사본을 만들 수 있지만,
**상태 변경 전에 복사를 먼저 수행**하는 것은 상당히 번거롭게 느껴진다.

### toReversed

`toReversed` 메서드는 `reverse` 메서드의 복사 버전이다.
새로운 배열로 요소들을 역순으로 반환한다.

```js
const items = [1, 2, 3]
console.log(items) // [1, 2, 3]

const reversedItems = items.toReversed()
console.log(reversedItems) // [3, 2, 1]
console.log(items) // [1, 2, 3]
```

### toSorted

`toSorted` 메서드는 `sort` 메서드의 복사 버전이다.
새로운 배열로 요소들을 정렬된 형태로 반환한다.

```js
const months = ['Mar', 'Jan', 'Feb', 'Dec']
const sortedMonths = months.toSorted()
console.log(sortedMonths) // ['Dec', 'Feb', 'Jan', 'Mar']
console.log(months) // ['Mar', 'Jan', 'Feb', 'Dec']
```

### toSpliced

`toSpliced` 메서드는 `splice` 메서드의 복사 버전이다.
새로운 배열로 주어진 인덱스에 요소들이 제거되거나 교체된 형태로 반환한다.

```js
const months = ['Jan', 'Mar', 'Apr', 'May']

// 인덱스 1에 요소 삽입
const months2 = months.toSpliced(1, 0, 'Feb')
console.log(months2) // ["Jan", "Feb", "Mar", "Apr", "May"]

// 인덱스 2부터 2개의 요소 삭제
const months3 = months2.toSpliced(2, 2)
console.log(months3) // ["Jan", "Feb", "May"]

// 인덱스 1부터 1개의 요소에서 2개의 요소 교체
const months4 = months3.toSpliced(1, 1, 'Feb', 'Mar')
console.log(months4) // ["Jan", "Feb", "Mar", "May"]

// 기존 배열은 변경되지 않는다.
console.log(months) // ["Jan", "Mar", "Apr", "May"]
```

### with

`with` 메서드는 주어진 인덱스의 값을 변경하기 위해 사용하는 괄호 표기법(bracket notation)의 복사 버전이다.
새로운 배열로 주어진 인덱스에 교체된 값으로 반환한다.

```js
const arr = [1, 2, 3, 4, 5]
console.log(arr.with(2, 6)) // [1, 2, 6, 4, 5]
console.log(arr) // [1, 2, 3, 4, 5]
```

## 마무리

ECMA2023에는 기존에 자주 사용하는 배열 메서드들이 더 편리하게 개선되어서 많이 와닿았다.
앞으로 추가된 메서드들을 자주 사용할 것 같다.

이번 글을 작성하면서도 ECMA2023뿐만 아니라 ECMAScript에 대해서도 알아볼 수 있었다.
문서들이 잘 정리되어 있어서 좋았다.
기능들이 어떠한 이유로 추가되었는지, 어떻게 사용하는지 등 자세히 설명되어 있어 빠르게 기능들을 파악할 수 있었다.
알지 못했던 여러 유용한 기능들이 존재하고 앞으로도 계속해서 편리한 기능들이 추가될 예정이어서 ECMA 표준에 지속해서 관심을 가지려고 한다.

## 출처

- [Array.prototype.findLast()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
- [Array.prototype.findLastIndex()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findLastIndex)
- [Array.prototype.toReversed()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed)
- [Array.prototype.toSorted()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
- [Array.prototype.toSpliced()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced)
- [Array.prototype.with()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/with)
