# Microservice Communication Patterns
## 원문
https://reflectoring.io/microservice-communication-patterns/

<br>

## 1. Synchronous Calls
<img width="1000" src="https://user-images.githubusercontent.com/60383031/158197330-550d7f94-7da9-4b5b-b121-3133fe4baf96.png">

### 1) 특징

- 구현 하기 가장 쉬운 Communication pattern 이다.
- 서비스1 은 서비스2 가 요청 처리를 완료하고 응답을 반환할 때까지 대기한다.
- 동기식이기 때문에 구조가 간단하다.
- Netflix 의 Feign 그리고 Hystrix 라이브러리를 사용할 수 있다.

### 2) Timeouts
- 서비스1 이 서비스2로 요청을 보내고, 서비스2 가 요청을 처리 도중에 서비스1 에서 timeout 예외가 발생한다면 ???
- 두 서비스 간에 데이터가 일치하지 않을  수 있다.

### 3) Strong Coupling
- 동기 서비스 간에는 강한 결합을 생성한다.

### 4) Easy to Implement
- 동기 서비스는 구현이 쉽다.

<br>

## 2. Simple Messaging
<img width="1000" src="https://user-images.githubusercontent.com/60383031/158197539-27daf053-0661-4985-bf98-d27a3d8bb3e4.png">

### 1) 특징
- 서비스1은 메시지 브로커에게 메시지만 보내고 잊으면된다.
- 서비스2는 메시지 브로커로부터 메시지를 구독하기만 하면된다.
- 서비스1, 서비스2는 서로의 존재를 알 필요가 없다.
- 메시지 브로커를 기준으로 페이로드가 포함된 메시지를 서로 주고 받기만 하면된다.

### 2) Automatic Retry 
- 메시지 브로커 라이브러리에 따라 Retry 기능이 제공된다.
- 서비스2가 사용이 불가능한 상태일 때, 서비스2가 정상화될 떄까지 메시지 전달을 시도한다.
- 물론 서비스2가 polling 하는 구조라면 고려할 필요는 없다.

### 3) Loose Coupling
- 서비스2는 서비스1 을 호출하지 않기 때문에 느슨한 결합을 유지할 수 있다.

### 4) Message Broker must not fail
- 메시지 브로커에 문제가 발생하면 안된다. 
- 메시지 브로커에 데이터가 중앙 집권화되기 때문에 hell will break loose 할 것이다.

### 5) Pipeline contains Schema
- 메시지 구조가 변경된 경우 모든 클라이언트가 변경된 메시지 구조를 처리할 수 있어야 한다.
- 이는 마이크로서비스의 주요 목표 중 하나인 independent deployments (독립 배포)와는 모순된다.
- 이러한 모순은 하위 호환성이 보장되게 변경하는 것으로 완화할 수 있다.

### 6) Two-Phase Commit
- 서비스1, 서비스2 를 서로 같은 트랜잭션으로 묶고 싶다면 Two-Phase commit 을 사용할 수 있다.
- 단, 데이터베이스나 메시지 브로커가 지원을 안할 수도 있으며 좋은 성능을 기대하기 힘들다. (거의 사용하지 않음)
- 참고: https://www.youtube.com/watch?v=urpF7jwVNWs&ab_channel=%EC%B5%9C%EB%B2%94%EA%B7%A0 (7분부터)

<br>

## 3. Transactional Messaging
<img width="1000" src="https://user-images.githubusercontent.com/60383031/158197674-9e3b067d-9e6e-46d7-bff5-fba7e4fb74ca.png">

### 1) 특징
- 메시지를 브로커에 전달하기 전에 데이터베이스에 저장하는 방식
- 수신자는 메시지를 송신하고 처리하기 전에 데이터베이스에 저장한다.

### 2) No Need for Two-Phase Commit
- 메시지를 보내는 쪽과 받는 쪽의 로컬 데이터베이스에 저장하기 때문에 언제든 롤백, 복구가 가능하다.


### 3) Message Broker may Fail
- 데이터베이스에 메시지가 저장이되기 때문에, 브로커에 장애가 나더라도 데이터베이스에서 메시지를 조회하면 된다.

### 4) Complex Setup
- 아키텍처를 구성하기엔 다소 복잡하다.
- 왜냐하면 발행해야하는 메시지를 데이터베이스에 저장해야하기 때문이다.
- 또한 데이터베이스로부터 데이터를 polling 하고 처리되지 않은 메시지에 대한 처리 로직을 작성해야한다. (메시지 처리 유실 ??)
    - 송신측: 매사지 브로커로 전송
    - 수신측: 메시지를 처리하는 비즈니스 로직 호출
    
<br>

## 4. Zero-Payload Events
<img width="1000" src="https://user-images.githubusercontent.com/60383031/158197853-861f577f-b26a-48e1-baed-3d1b03144658.png">

### 1) 특징
- 페이로드에 대한 포인터만 메시지로 전달한다.
- 예를들어 Order ID = 4711 주문이 배송되었다는 메시지를 발행한다고 가정해보자
- 제로페이로드 방식을 사용한다면 서비스1은 메시지에 EventType = orderShipped 그리고 Order ID = 4711 만 포함해서 브로커에 전달한다.
- 그리고 수신자는 송시자를 호출해서 주문 데이터를 요청한다.

### 2) Dumb Pipe
- 메시지 구조가 정말 심플하기 때문에 하위 호환성에 대한 고려를 할 필요가 없다.

### 3) Combinable with Transactional Messaging
- 메시지 브로커에 장애가 발생해도 재시도를 할 수 있다. (페이로드는 서비스1을 호출해서 얻기 떄문인 것 같음)
- 이벤트 페이로드를 얻기 위하여 서비스 간에 동기적인 호출이 필요하다.
- 따라서 서비스의 복잡도가 올라간다.
