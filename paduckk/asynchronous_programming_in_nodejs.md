# asynchronous_programming_in_nodejs

## 서론

`NodeJS`가 무엇인지 알기 위해 구글에 `NodeJS란` 검색을 하면 매우 다양한 정보가 나옵니다.

```
Node.js는 확장성 있는 네트워크 애플리케이션 개발에 사용되는 소프트웨어 플랫폼이다.
작성 언어로 자바스크립트를 활용하며 Non-blocking I/O와 단일 스레드 이벤트 루프를 통한 높은 처리 성능을 가지고 있다.
```

> 출처 위키백과

무슨 말 일까요 🤨?
프로그래밍을 배운지 얼마 안 된 저에게는 너무 어려운 단어들이었고 차츰 공부하고 `NodeJS`를 사용하며 하나 하나 이해 했지만 그 당시엔 자료와 블로그 글 들을 봐도 잘 와닿지 않는 부분들이 많았습니다.

따라서 `NodeJS`가 무엇인지 검색 할 때 나오는

- 논 블럭킹 IO
- 이벤트 드리븐, 단일 스레드 이벤트 루프
- callback 패턴
- Promise
- async/await

이 항목들을 쉽게 프로그래밍에 갓 입문한 분들에게 쉽게 와닿는 말들로 풀어 보고자 합니다.

## Non Blocking IO

Non Blocking IO는 IO 작업이 코드의 진행을 막지 않는 다는 의미 입니다.

Non Blocking IO 단어 하나 하나 찬찬히 의미를 살펴 봅시다

IO는 Input, Output을 의미합니다. 프로그램에서 IO의 의미는

- Input은 프로그램 안으로 들어오는 입력
- Output은 프로그램 밖으로 내보내는 출력

우리가 개발하는 프로그램 내에서의 입출력에는 여러 종류가 있습니다.

- Disk I/O : 파일 불러오기, 파일 쓰기 등..
- Network I/O : 네트워크 요청을 통한 입출력, (ex: http request..)

이러한 작업들의 특징이 무엇 일까요? 요청에 대한 응답이 지연 시간이 길고 예측이 어렵다는 점입니다.

네트워크 요청은 말 할 필요도 없고 파일 읽기로 예를 들면 용량이 작은 파일의 경우 매우 빠르게 불러와 지겠지만 용량이 큰 파일의 경우 오래 걸리거나 너무 크면 읽기에 실패 할 수 도 있습니다. 또한 불필요하게 메인 스레드가 멈출 수도 있다는 점이 있습니다.

```jsx
- 콘솔에 '안녕하세요' 출력하기
- '../file.txt' 경로의 파일_읽기
- file 변수에 담기
- 콘솔에 file변수 출력하기
```

위에는 파일을 읽어와 콘솔에 출력하는 수도코드 입니다. 파일을 읽은 후 콘솔에 파일 변수를 출력하기 위해선 파일 읽기 작업이 모두 끝난 후에 `file` 변수에 담아 콘솔로 출력을 하여야 합니다.

이 수도 코드를 Blocking IO로 제어 할 때와 NonBlocking IO로 제어 할 때의 예시를 살펴 보겠습니다.

```java
import java.io.FileOutputStream;
import java.io.IOException;

public class Main {
    public static void main(String[] args) throws IOException {
        // 여기서 파일을 전부 불러오기전 까지 코드의 진행이 Blocking 됩니다
        try (FileOutputStream output = new FileOutputStream("../file.txt")){
            System.out.print(output);
        }
    }
}
```

java sdk의 File Io 라이브러리를 사용해서 파일을 읽은 후 콘솔에 출력 하였습니다.

이번엔 `Node.js`에서의 파일 읽기를 예시를 들어 보겠습니다. `Node.js`에서는 FileSystem의 약자인 fs 모듈로 파일 IO 관련 작업을 처리 할 수 있습니다.

```jsx
const fs = require("fs");

let file = null;

fs.readFile("../file.txt", (err, data) => {
  file = data.toString();
});

console.log(file);
```

여기서의 결과는 콘솔에 파일의 내용이 출력 되는게 아닌 `null`이 출력 됩니다.

왜냐하면 `Node.js`가 Non Blocking IO이기 때문 입니다. 코드의 진행이 IO 작업을 만나게 되면 IO 작업을 처리해줄 다른 스레드에 넘겨 버리고 그 다음 코드를 진행 하기 때문에 파일이 읽히기 전에 `console.log`가 출력 되어버립니다.

```jsx
const fs = require("fs");

let file = null;

fs.readFile("../file.txt", (err, data) => {
  file = data.toString();
  console.log(file);
});
```

올바르게 동작하기 위해선 위와 같이 콜백 패턴을 활용하여야 합니다. 콜백 패턴에 대해서는 잠시 후에 자세히 설명 드리도록 하겠습니다.

그렇다면 Node.js에서의 모든 IO는 NonBlocking이냐 라고 한다면 그렇진 않습니다.

```jsx
const fs = require("fs");

const file = fs.readFileSync("../file.txt").toString();

console.log(file);
```

`fs.readFileSync`라는 메서드는 BlockingIO 예시와 정확히 일치하여 동작합니다.

자바에서는 동기적으로 동작하는 메서드에 `Sync`라는 접두어를 붙이지 않았습니다.

동기적으로 동작하는 메서드에 `Sync`라는 접두어를 나타낸다는 것은 다르게 표현 하자면

`Nodejs`의 `fs.readFile`은 동기인지 비동기인지에 대한 정보가 없어도 아 IO 작업이니 비동기 방식으로 처리해야 되는 구나라고 인지 하는게 중요합니다.

- fs.readFile
- fs.readFileSync ← Sync라는 단어가 붙어 동기적으로 동작 한다는 걸 알려줍니다.

## CallBack Pattern

> 프로그래밍에서 콜백(callback)은 다른 코드의 인수로서 넘겨주는 실행 가능한 코드를 말한다.
> 콜백을 넘겨받는 코드는 이 콜백을 필요에 따라 즉시 실행할 수도 있고, 아니면 나중에 실행할 수도 있다.

`Node.js`에서 IO 작업이 논블럭킹으로 동작하기 때문에 비동기 방식으로 처리 하여야 한다 하였습니다.

그렇다면 비동기 방식처리를 어떻게 해주어야 할까요? 우선 콜백 패턴이 있습니다.

콜백 패턴을 풀어서 설명하면

`콜` => 호출하다, `백` => 나중에

합치면 "나중에 호출한다" 입니다. 나중은 특정한 사건(event)이 발생한 시점, 사건이 발생 했을때 입니다.

예를 들어

- 파일 읽기를 요청 했다면 파일읽기가 종료한 시점
- 키보드에 `Enter`키가 눌린 시점
- 클라이언트에서 요청이 들어온 시점

호출은 함수 호출을 의미 합니다.

이제 합치면 "어느 특정한 사건(event)이 발생한 순간 함수를 호출한다." 입니다.

그렇다면 Node.js 코드로 콜백 패턴을 어떻게 나타내는지 보도록 하겠습니다.

```jsx
const fs = require("fs");

// 함수 생성
const callbackFn = function (err, data) {
  const file = data.toString();
  console.log(file);
};

// readFile의 두번째 인자로 함수를 전달
fs.readFile("../file.txt", callbackFn);
```

JS에서 함수는 `[일급객체](https://ko.wikipedia.org/wiki/%EC%9D%BC%EA%B8%89_%EA%B0%9D%EC%B2%B4)`이기 때문에 값으로써 변수에 할당하거나 함수의 인자로 넘겨 줄 수 있습니다.

`fs.readFile('불러올 파일 경로', '파일 읽기가 끝난 후 실행 할 함수')`

fs.readFile의 동작을 하나 하나 살펴보면

- 첫번 째 인자로 불러 올 파일 경로를 받고 2번째 인자로 파일 읽기가 끝났을때 실행 할 함수를 넘겨 받습니다
- 파일 읽기가 종료되면 넘겨받은 함수 `callbackFn`의 2번째 인자에 읽기에 성공한 data를 넣어 `호출` 합니다

비동기 요청이 끝나고 돌아오는 시점은 알 수가 없기 때문에 그 시점이 오면 이 함수 호출해 하는 패턴이 콜백 패턴입니다.

따라서 JS에서는 함수를 인자로 넘겨 콜백패턴을 구현 할 수 있습니다.

여기서 초보자 분들이 콜백패턴에서 가장 많이 하시는 실수 하나를 짚고 넘어 가도록 하겠습니다.

함수를 변수에 담거나 인자로 넘기는 것 과 함수를 호출 하는 것의 차이를 명확히 이해 하셔야 합니다.

1초 뒤에 10 + 30의 결과를 알려주는 코드를 작성한다 해봅시다.

```jsx
const sum = (a, b) => {
  console.log(a + b);
  return a + b;
};

// 1
setTimeout(sum, 1000);

// 2
setTimeout(sum(10, 30), 1000);
```

1번 예시는 완전하지 않치만 함수를 setTimeOut 함수의 첫번째 인자에 1초뒤에 실행 될 함수를 올바르게 넘겨 주었습니다 하지만 (10, 30) 인자의 값은 넘겨주지 못해 NaN이 나올 것 입니다.

2번 예시가 함수를 값으로 넘겨주지 않고 함수가 호출하고 반환한 값을 넘겨주는 대표적인 잘못된 사용법이라 볼 수 있습니다.

2번 예시를 살펴보면

```jsx
// 1. setTimeout(sum(10, 30), 1000)
// 2 . setTimeout(40, 1000)
```

sum(10,30)이 먼저 호출되어 40이 반환되고 setTimeout에 첫 번째 인자로 40이 넘어가 함수가 넘어간게 아닌 값이 넘어간 것 을 알 수 있습니다.

콜백 함수를 넘길때 인자도 같이 넘기고 싶어서 위와 같은 실수를 저지릅니다.

이런 문제를 해결하기 위해 함수를 한번더 감싸 줌으로 써 간단하게 해결 할 수 있습니다.

```jsx
setTimeOut(() => sum(10, 30), 1000);
```

`sum(10, 30)`을 한 번 함수로 감싸줌으로써 즉시 실행되는 것이 아닌 감싸고 있는 함수가 호출되는 시점에 호출되게 됩니다.

이러한 패턴은 콜백 패턴에서 많이 쓰이는 방법으로 코드로 직접 처보시며 이해 해 보시는 것이 중요합니다.
