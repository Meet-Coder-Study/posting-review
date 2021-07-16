> 최근 웹소켓을 활용한 서비스를 개발하면서 알게된 내용을 간략하게나마 적어봅니다.

### WebSocket 이란?

웹소켓은 보통 http, long polling, sse와 비교되어 언급되는 기술 중 하나입니다. `WebSocket`을 검색해보면 위키피디아에 다음과 같이 기록되어 있습니다.

> 웹소켓(WebSocket)은 하나의 TCP 접속에 전이중 통신 채널을 제공하는 컴퓨터 통신 프로토콜이다.
> https://ko.wikipedia.org/wiki/%EC%9B%B9%EC%86%8C%EC%BC%93

전이중 통신 채널을 제공한다는 말은 무엇일까요? 조금 더 읽어보면 다음과 같은 문장이 있습니다. 

> 웹소켓 프로토콜은 HTTP 폴링과 같은 반이중방식에 비해 더 낮은 부하를 사용하여 웹 브라우저(또는 다른 클라이언트 애플리케이션)과 웹 서버 간의 통신을 가능케...

단순 HTTP 통신은 반이중방식이라고 적혀있는데요. 우리가 흔히 사용하는 HTTP 통신은 요청을 해야 그것에 대한 응답을 전달받을 수 있습니다. 이를 단방향통신이라고도 부르기도 하지요. 반면에 **WebSocket은 양방향 통신으로 요청을 하지 않아도 서버에서 응답을 전달할 수 있습니다.** 뿐만 아니라, 서버와 클라이언트는 양방향 통신을 하기 위해 서로 연결을 유지하고 있기 때문에 여러가지 장점이 있습니다.

### Spring WebSocket with Stomp

**웹소켓은 현재 텍스트와 바이너리 형태의 메시지를 지원합니다.** (이외에도 확장성을 염두해두고 있기도 합니다.) [RFC 6455#section-1.2](https://datatracker.ietf.org/doc/html/rfc6455#section-1.2) 문서를 보면 TCP frame에 Opcode라는 값으로 메시지 타입을 결정하는데요. Spring에서는 이를 사용자가 처리할 수 있도록 `WebSocketHandler` 인터페이스 하위에 `TextWebSocketHandler`, `BinaryWebSocketHandler`를 제공합니다. 하지만, 본문에 대한 포맷이라던지(plain text? json? xml?) 정의된 것이 하나도 없습니다. 다르게 말하면 자유롭게 정의할 수 있다는 뜻이죠. 

<br>

그렇기때문에 때로는 이러한 정의를 내리는데 상당히 많은 시간을 소비하기도 합니다. (이러한 과정은 우리가 이벤트기반 시스템을 설계할 때 메시지를 정의하는 것과 비슷하다고 볼 수 있을 것 같네요.) **Spring에서는 공식적으로 Stomp를 상위 레벨의 프로토콜로 사용할 수 있도록 지원하고 있습니다.** Stomp란 텍스트 지향 메시징 프로토콜로 여러 방면에서 이를 사용하고 있습니다.

- https://stomp.github.io
- https://stomp.github.io/implementations.html

Stomp는 very simple 이라는 강점을 내세울 수 있을 정도로 단순하며 사용하가 쉽습니다. 형태는 다음과 같습니다.

```
COMMAND
header1:value1
header2:value2

Body^@
```

### 메세지 처리 흐름

![img message-flow](https://docs.spring.io/spring-framework/docs/4.3.x/spring-framework-reference/html/images/message-flow-simple-broker.png)

_https://docs.spring.io/spring-framework/docs/4.3.x/spring-framework-reference/html/websocket.html#websocket-stomp-message-flow_

<br>

공식 문서에 있는 그림으로, 한 방(?)에 정리할 수 있습니다. 

1. 클라이언트로 부터 header와 payload 담은 메시지를 전달받으면
2. request channel (InboundChannel)에서 이를 알맞은 MessageHandler에 전달합니다.
3. 애노테이션 기반의 로직 처리가 포함되는 경우, `SimpAnnotationMethodMessageHandler`를 통해 `@Controller`를 호출합니다.
4. 로직 처리 후, 반환된 값을 기반으로 메시지를 만들어 broker channel에 전달합니다.
5. broker channel은 `SimpleBrokerMessageHandler`를 통해 구독자들을 가져옵니다.
6. 그리고 각각의 구독자들에게 response channel (OutboundChannel)로 메시지를 전달합니다.

하면서 편했던 점은 날 것(?)에 경우, 별도 처리해줘야 할 부분이 상당히 많았겠지만 이를 프레임워크 레벨에서 Stomp와 결합해 상당히 많은 것을 지원해주고있어 단순 command만으로 손쉽게 처리할 수 있다는 점입니다.

> CONNECT, DISCONNECT, SUBSCRIBE, SEND, ....
> - 커넥션 연결/끊기,
> - 구독을 하게된 유저들을 별도로 관리할 필요가 없다는 점, (물론 필요할 수도 있음)
> - 메시지 전송

### 튜닝 포인트

각 채널에는 **(cpu processor * 2) 갯수 만큼의 쓰레드를 가진 쓰레드풀**을 기본적으로 가집니다. blocking IO가 거의 없는 경우라면 기본설정으로도 충분하다고 생각합니다만, [문서에도 나와있듯이](https://docs.spring.io/spring-framework/docs/4.3.x/spring-framework-reference/html/websocket.html#websocket-stomp-configuration-performance) blocking io가 많은 경우에는 적절한 설정을 해야합니다. 이번에 개발한 서비스의 경우는 거의 모든 메시지마다 외부 api를 호출하기 때문에 stress test를 통해 적정 수치를 맞추어 사용하고 있습니다.

### 배포전략

![img blue-green-deployment](https://www.redhat.com/cms/managed-files/blue-green-deployment-model.gif)

본 서비스를 기존 서비스랑 다르게(rolling 배포) 약간 변형된 [blue/green 배포전략](https://www.redhat.com/ko/topics/devops/what-is-blue-green-deployment)을 사용하고 있습니다. 웹소켓은 결국 커넥션을 연결하고 있고 배포를 하게되면 기존 애플리케이션이 내려가면서 커넥션이 끊기게 됩니다. 그럼 중간 로드밸런서를 통해 다른 애플리케이션에 다시 커넥션을 맺고자 시도할텐데요. 이를 rolling 배포로 하게되면 최악의 경우, 서버 댓수만큼 커넥션을 연결/끊기를 반복할 것 입니다. 그렇기 떄문에 새배포 버전에 트래픽을 스위칭하는 방식의 배포 전략인 **blue/green을 사용하는 것이 사용자 경험 측면에서 좋을 수 있습니다.**

### 참고

- https://ko.wikipedia.org/wiki/%EC%9B%B9%EC%86%8C%EC%BC%93
- https://datatracker.ietf.org/doc/html/rfc6455
- https://stomp.github.io/implementations.html
- https://docs.spring.io/spring-framework/docs/4.3.x/spring-framework-reference/html/websocket.html
- https://www.redhat.com/ko/topics/devops/what-is-blue-green-deployment
