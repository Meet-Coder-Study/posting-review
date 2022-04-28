# [JavaScript Code Styling Best Practices — Maximum Function Length, Callbacks, Parameters](https://medium.com/swlh/javascript-code-styling-best-practices-maximum-function-length-callbacks-parameters-26098e465cd1)

JavaScript는 매우 관대한 언어입니다. 실행은 되지만, 오류가 있는 코드를 작성하기에 너무 쉽습니다.

이 글에서는 함수의 길이를 줄이고, 깊은 콜백 중첩을 제거하고 함수에 포함해야 하는 매개변수의 수에 대해서 살펴보도록 하겠습니다.

## **Maximum Function Length (최대 함수 길이)**

함수는 최대한 짧아야 좋습니다. 20 ~ 30줄이 함수의 최대 길이라고 생각합니다.

한가지만 수행해야 하며, 그 이상 함수가 수행할 필요는 없습니다.

길이를 줄이면 읽기가 더 쉬워지고, 길어지면 읽기가 어려워집니다.

긴 함수의 내용은 따르기가 어렵습니다. 여기서 많은 변수, 조건, 로프 및 다른 함수 등등에 대한 사항들이 있습니다.

예를들어 짧은 함수는 아래와 같습니다.

```jsx
const subtract = (a, b) => a - b;
```

단지 한줄로 작성되었으며, 하는 일은 2개의 수를 빼는 한 가지 일만 합니다.

이와 같이 우리 코드에서는 짧은 코드를 작성하도록 노력해야 합니다.

쓸모없는 빈 줄도 한줄에 포함되기도 합니다. 예를들어 블록 뒤에 빈 줄 하나 이상이 필요하지 않으며, 더 많을수록 쓸모 없을수 있습니다.

## **Maximum Depth of Nested Callbacks (중첩 콜백의 최대 깊이)**

중첩된 콜백의 depth(깊이)를 최소화 해야 합니다. 여기에는 동기 및 비동기 콜백 모두 포함됩니다.

중첩된 콜백은 어느 다른 깊은 중첩된 코드보다 따르기가 어렵습니다.

동기 코드의 경우 코드를 별도의 줄로 분리하여 중첩된 콜백을 피해야 합니다.

예를 들어 중첩된 동기 콜백이 있는 경우에는 

```jsx
const arr = [1, 2, 3];
const arr2 = [1, 2, 3];
const bigArr = [];
arr.forEach(a => {
  bigArr.push(...arr2.map(x => x + a));
})
```

아래와 같이 JavaScript의 자체 함수로 중첩을 제거할 수 있습니다.

```jsx
bigArr.push(...arr2.map(x => x + a));
```

예를 들어 아래와 같이 작성할수도 있습니다.

```jsx
const arr = [1, 2, 3];
const arr2 = [1, 2, 3];
const bigArr = [];
const map = (arr, a) => arr.map(x => x + a)
arr.forEach(a => {
  bigArr.push(...map(arr, a));
})
```

이런 식으로 `map` 의 콜백을 외부로 이동시켜 `forEach` 콜백에서 해당 콜백을 중첩할 일이 없게 할수도 있습니다.

비동기 콜백 중첩을 대체하려면 비동기 콜백을 깊이 중첩할 필요 없도록 `Promise`를 사용하면 됩니다.

`Promise` 를 사용하면 원하는 만큼 순차적으로 실행할 수 있으며, 이것은 빠르게 처리할 수 없는 중첩된 비동기 콜백보다 훨씬 낫습니다.

`Promise` 형태로 제공되지 않는 비동기 경우 `Promise` 생성자를 이용해 `Promise` 로 변환할 수 있습니다.

예를 들어, 여러개의 `setTimout` 을 연결하려는 경우 둘 이상의 `setTimeout` 호출을 순차적으로 연결 할 수 있도록 `setTimeout`을 호출하는 `Promise` 인스턴스를 반환하는 함수를 만들 수 있습니다. 

아래 코드를 통해 2개의 `setTimeout` 호출을 함게 연결하고 순차적으로 실행할 수 있습니다.

```jsx
const delayRun = (fn, ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      fn();
      resolve();
    }, ms)
  })
}(async () => {
  await delayRun(() => console.log('foo'), 1000);
  await delayRun(() => console.log('bar'), 1100);
})();
```

위의 코드에서 `delayRun` 함수를 사용하는 `fn` 함수가 있으며, 실행을 `ms` 만큼 지연하는데 걸리는 시간을 `setTimeout` 에 전달합니다.

`delayRun` 함수는 `fn` 함수의 콜백에서 실행되는 `promise` 를 바노한합니다.

그 다음에 `async` 함수에서 2개의 다른 `delayRun` 콜백 함수로 실행합니다.

1초 후에 첫 번째 호출을 하고 1.1초 후에 2번째 호출을 실행하도록 하는 것 입니다.

## **Maximum Number of Parameters in a Function (함수의 최대 매개변수 수)**

함수의 매개변수는 최소로 유지되어야 합니다.

최대 갯수는 5개이어야 하며, 그 이상은 너무 많습니다.

함수가 취하는 매개변수가 많을수록 잘못된 순서로 데이터를 전달하거나, 잘못된 유형이나 형식의 데이터를 전달하는 실수를 할 가능성이 높습니다.

5개 보다 더 많은 매개변수가 필요하면 모든 매개변수를 객체에 넣고 구조 분해 할당을 하는것이 좋습니다.

함수에는 다음과 같은 코드가 허용되는 이유입니다.

```jsx
const foo = (a, b) => {}

const bar = ({
  foo,
  bar,
  baz,
  qux,
  a,
  b
}) => {}
```

`foo` 의 매개변수가 2개뿐이므로 허용할 수 있는 한계의 미만이며, `bar` 에는 6개의 변수로 구조화 되는 하나의 개체 매개변수가 있기 때문에 허용됩니다.

최소한 객체 매개변수와 함께 전달된 항목의 순서에 대해 걱정할 필요가 없기 때문입니다.

## 결론

중첩된 콜백은 읽기 어려우므로 제거해야 합니다.

함수의 길이도 쉽게 읽고 추적할 수 있도록 줄어야 합니다.

또한 실수의 가능성을 줄이기 위해 코드의 매개변수 수도 최소화 해야 합니다.
