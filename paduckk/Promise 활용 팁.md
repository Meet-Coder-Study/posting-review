# Promise 활용 팁

Date: Aug 13, 2020

## Promise 활용 팁

Promise 객체는 비동기 작업이 맞이할 미래의 완료 또는 실패와 그 결과 값을 나타냅니다.

Promise는 기존에 자바스크립트 비동기 방식을 callback 패턴을 사용할 때의 문제점을 보완하기 위해 나왔습니다.

제가 Promise를 사용하며 오해하고 있던 점과 활용 팁에 대해 간단히 정리 해보겠습니다.

### Promise 화

우선 콜백 패턴을 Promise로 객체화 시키는 간단한 예제를 보겠습니다.

- 콜백 패턴 사용시

    ```tsx
    setTimeout(() => 10, 1000)
    ```

- 위의 함수를 프로미스화

    ```tsx
    const promise = new Promise((res) => setTimeout(() => res(10), 1000))
    ```

매우 복잡해 보입니다. 하나씩 설명해보면 

1. 생성자로 넘겨주는 함수의 인자로 `resolve` 함수가 들어옵니다.
2. 비동기 함수의 콜백 함수안에서 `resoleve` 함수를 호출해줍니다.

이렇게 구현시 만들어진 promise의 then절에 `resolve`함수에 인자로 넣어준 값인 `10`이 넘어오게 됩니다

위처럼 복잡한 과정을 단순화 해주는 promisify라는 라이브러리가 존재 합니다.

Nodejs에선 내장 객체인 util에 포함 되어 있고 npm에 promisify 관련 여럿 라이브러리들이 존재합니다.

[es6-promisify](https://www.npmjs.com/package/es6-promisify)

### Promise 실행 시점

Promise를 사용하며 오해를 했던 부분이 있었습니다. 

Promise의 비동기 요청이 시작 되는 시점이 Promise가 생성되는 시점 일까요? then 메서드를 실행한 시점일까요?

저는 후자로 잘 못 알고 있었으나 Promise는 생성되는 시점에 바로 비동기 요청이 실행 되고 `then` 메서드는 Promise를 실행 해라가 아닌 단지 콜백 함수를 등록 해주는 메서드였습니다.

단순히 콜백함수만 등록하기 위해서 사용한다면 기존 콜백 패턴이 더 단순하고 편해 보일 수 있으나 콜백 헬 문제를 해결하기 위해 나왔듯이 비동기 요청이 연쇄 될 경우 훨씬 가독성이 좋아집니다.

간단한 테스트를 통해 확인 해보겠습니다.

```tsx
const promise = new Promise((res) => setTimeout(() => console.log('hi') || res(10), 1000))
```

이 코드를 실행 해보면 then 메서드를 붙이지 않더라도 1초뒤에 console.log가 실행 됨을 알 수 있습니다.

그렇다면 Promise를 원하는 시점에 실행 되게 하려면 어떻게 해야할까요?

간단하게 함수로 한 번 싸주시면 됩니다

```tsx
const createPromise = () => new Promise((res) => setTimeout(() => console.log('hi') || res(10), 1000))

...

createPromise().then(console.log) // 'hi', 10
```

### Promise.all

Promise.all은 인자로 받은 배열 안의 모든 Promise들이 settle되 었을때 then메서드안의 콜백을 실행 시킵니다.

저는 앞서 말한 실행 시점에 대한 오해 때문에 배열에 프로미스를 담기전엔 실행이 안되고 Promise.all을 실행 시킨 후에야 동시에 프로미스들의 비동기 요청이 실행 되는 줄 알았으나. 앞서 설명드린것 처럼 Promise는 생성 시점에 실행되어지고 Promise.all의 역할은 배열로 넘겨받은 모든 프로미스들이 종료된 시점에 콜백을 실행 할 수 있게 도와주는 유틸입니다.

- Promise.all  ⇒ 동시에 비동기 요청하는 함수 `X`
- Promise.all  ⇒ 인자로 넘겨받은 프로미스들이 모두 종료된 시점에 콜백을 실행해주는 함수 `O`

```tsx
const promises = []

promises.push(axios.get("box/1")) // 이때 이미 1에대해 요청이 됨
promises.push(axios.get("box/2"))

Promise.all(promises).then(([box1, box2]) => console.log('?')) 

// Promise.all은 box/1, box/2에대해 동시에 요청을 해주는 함수가 아니라 두 함수가 비동기 요청을 마치고 Settle된 시점에 then절의 콜백을 실행 해준다.
```

### Promise.all 에러 핸들링 팁

Promise.all을 사용 할 경우 배열에 담긴 Promise 객체 중 하나라도 오류를 반환 할 경우 then에 등록된 콜백이 실행 되지 않습니다.

이런 경우에는 각각의 Promise에 catch 메서드를 붙힌 후에 넘겨 주면 됩니다.

```tsx
const promises = []

promises.push(axios.get("box/1").catch(console.error))
promises.push(axios.get("box/2").catch(console.error))

Promise.all(promises).then(([box1, box2]) => console.log('?')) 

// 에러난 경우 catch에 등록된 콜백함수에서 반환한 값이 넘어온다.
```

```tsx
Promise.all([crreatePromise(), new Promise((res,rej) => setTimeout(() => rej('?'),1000*4))]).then(console.log)

// Uncaught (in promise) ?
// hi

// then절에 등록된 console.log가 실행되지않고 종료됨
```

```tsx
Promise.all([crreatePromise(), (new Promise((res,rej) => setTimeout(() => rej('?'),1000*4))).catch(console.log)]).then(console.log)

// ?
// hi
// [10, undefined]

// 두 번째 등록된 프로미스의 catch절에서 undefined를 반환하여 [10, undefined] 반환 되어짐
```