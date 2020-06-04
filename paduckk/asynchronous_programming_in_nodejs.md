# asynchronous_programming_in_nodejs

## 서론

nodeJS가 무엇인지 알기 위해 구글에 nodejs란 검색을 하면 매우 다양한 정보가 나옵니다.

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

IO는 Input, Output을 의미합니다.  프로그램에서 IO의 의미는

- Input은 프로그램 안으로 들어오는 입력
- Output은 프로그램 밖으로 내보내는 출력

우리가 개발하는 프로그램 내에서의 입출력에는 여러 종류가 있습니다. 

- Disk I/O : 파일 불러오기, 파일 쓰기 등..
- Network I/O :  네트워크 요청을 통한 입출력, (ex: http request..)

이러한 작업들의 특징이 무엇 일까요?  요청에 대한 응답이 지연 시간이 길고 예측이 어렵다는 점입니다.

네트워크 요청은 말 할 필요도 없고 파일 읽기로 예를 들면 용량이 작은 파일의 경우 매우 빠르게 불러와 지겠지만 용량이 큰 파일의 경우 오래 걸리거나  너무 크면 읽기에 실패 할 수 도 있습니다. 또한 불필요하게 메인 스레드가 멈출 수도 있다는 점이 있습니다.

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

public class WriteFile {
    public static void main(String[] args) throws IOException {
        // 여기서 파일을 전부 불러오기전 까지 코드의 진행이 Blocking 됩니다
        FileOutputStream output = new FileOutPutStream("../file.txt");
        output.close();
				system.out.print(output)
    }
}
```

java sdk의 File Io 라이브러리를 사용해서 파일을 읽은 후 콘솔에 출력 하였습니다.

이번엔 `Node.js`에서의 파일 읽기를 예시를 들어 보겠습니다. `Node.js`에서는 FileSystem의 약자인 fs 모듈로 파일 IO 관련 작업을 처리 할 수 있습니다.

```jsx
const fs = require('fs')

let file = null

fs.readFile('../file.txt', (err, data) => {
	file = data.toString()
})

console.log(file)
```

여기서의 결과는 콘솔에 파일의 내용이 출력 되는게 아닌 `null`이 출력 됩니다.

왜냐하면 `Node.js`가 Non Blocking IO이기 때문 입니다. 코드의 진행이 IO 작업을 만나게 되면 IO 작업을 처리해줄 다른 스레드에 넘겨 버리고 그 다음 코드를 진행 하기 때문에 파일이 읽히기 전에 `console.log`가 출력 되어버립니다. 

```jsx
const fs = require('fs')

let file = null

fs.readFile('../file.txt', (err, data) => {
	file = data.toString()
	console.log(file)
})
```

올바르게 동작하기 위해선 위와 같이 콜백 패턴을 활용하여야 합니다. 콜백 패턴에 대해서는 잠시 후에 자세히 설명 드리도록 하겠습니다.

그렇다면 Node.js에서의 모든 IO는 NonBlocking이냐 라고 한다면 그렇진 않습니다.

```jsx
const fs = require('fs')

const file = fs.readFileSync('../file.txt').toString()

console.log(file)
```

`fs.readFileSync`라는 메서드는 BlockingIO 예시와 정확히 일치하여 동작합니다. 

하지만 메서드 이름에서 알 수 있듯이 Node.js의 기본 IO작업의 동작은 Non Blocking이라는 걸 이해 하는게 중요합니다.

- fs.readFile
- fs.readFileSync ← Sync라는 단어가 붙어 동기적으로 동작 한다는 걸 알려줍니다.