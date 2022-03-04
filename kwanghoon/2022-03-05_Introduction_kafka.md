# Apache Kafka 
## (아파치 카프카 애플리케이션 프로그래밍 책 앞 부분 간단 정리)
<img width="500" src="https://user-images.githubusercontent.com/21074282/113962307-63972980-9862-11eb-8c25-ac168eff08ab.png">


## 카프카란 ??
<img width="1000" src="https://user-images.githubusercontent.com/60383031/156583233-898c494f-9b22-4182-b518-3d2581c2d232.png">

- 애플리케이션들의 데이터를 한 곳에 모아 처리할 수 있는 미들웨어
- 대용량의 데이터를 수집하고 이를 사용자들이 실시간 스트림으로 소비할 수 있게 만들어 준다.
- 즉, 카프카를 중앙에 배치함으로써 Source, Target 애플리케이션 사이의 의존도를 최소화할 수 있다.

<br>

## 아키텍처
<img width="1000" src="https://user-images.githubusercontent.com/60383031/156583801-0d14ddec-6663-42a2-965e-6bb3141178cd.png">

- 크게 프로듀서, 토픽, 파티션, 컨슈머 등으로 분류할 수 있다.

<br>

#### 토픽
<img width="1000" src="https://user-images.githubusercontent.com/60383031/156584326-261d44e1-43aa-474d-9cff-1f20f9b0169f.png">

- 카프카에서 데이터를 구분하기 위해 사용되는 단위
- 토픽은 1개 이상의 파티션을 소유하고 있다.
- 파티션에는 프로듀서가 보낸 데이터가 저장 ---> 이 데이터를 레코드라 부른다.

<br>

<img width="1000" src="https://user-images.githubusercontent.com/60383031/156593133-f19d6574-5206-47f0-97ee-5a34850cba8d.png">

- 레코드를 병렬로 처리하고 싶다면 컨슈머와 파티션 개수를 늘리면 된다.
- 파티션은 Queue 와 비슷한 자료구조이다.
- 단, Queue 는 pop() 하면 레코드를 삭제하지만 카프카는 삭제하지 않는다.
- 이러한 특징 때문에 다양한 목적을 가진 컨슈머 그룹들이 토픽의 데이터에 모두 접근할 수 있다.

<br>

#### 프로듀서
- 카프카에서 데이터의 시작점은 프로듀서이다.
- 카프카에 필요한 데이터를 선언, 브로커의 특정 토픽의 파티션에 전송한다.

<br>

#### 컨슈머
- 컨슈머는 적재된 데이터를 사용하기 위해 브로커로부터 데이터를 가져와서 처리를 담당한다.
- 컨슈머 운영 방법은 크게 2가지가 있다.
    - (1) 1개 이상의 컨슈머로 이루어진 컨슈머 그룹 운영
    - (2) 토픽의 특정 파티션만 구독하는 컨슈머 운영

<img width="1000" src="https://user-images.githubusercontent.com/60383031/156598266-e0985553-160e-477f-8394-0a1a7830307f.png">

- 컨슈머 그룹으로 묶인 컨슈머가 토픽을 구독해서 데이터를 가져갈 때, 1개의 파티션은 최대 1개의 컨슈머에 할당 가능하다.
- 반대로 1개의 컨슈머는 여러 개의 파티션에 할당될 수 있다.
- 컨슈머 개수가 가져고가자 하는 토픽의 파티션 개수보다 같거나 작아야한다.

<br>

<img width="1000" src="https://user-images.githubusercontent.com/60383031/156598743-83877e89-d163-4492-8ba5-6aee2df960ef.png">

- 위 그림처럼 운영하는 것은 문제되지 않는다.

<br>

<img width="1000" src="https://user-images.githubusercontent.com/60383031/156609844-468df427-baa1-43ff-82c9-901272f03dcf.png">

- 위 그림은 파티션 개수보다 컨슈머 개수가 더 많다.
- 데이터를 처리하지 못하는 컨슈머 4번은 잉여자원으로 남게된다.

<br>

<img width="1000" src="https://user-images.githubusercontent.com/60383031/156599388-9e356242-a975-4e1e-8ec6-5ed89a63368a.png">

- 목적에 맞게 그룹을 나누어서 운영할 수 있다. 
- Example) 하둡, 엘라스틱 서치, NoSQL 등 ...

<br>

<img width="1000" src="https://user-images.githubusercontent.com/60383031/156600254-4ac9b826-9216-4a9c-b959-fd663043ec61.png">

- 컨슈머는 카프카 브로커로부터 데이터를 어디까지 가져갔는지 Commit 을 통해 기록한다.
- 데이터를 중복 처리하지 않기 위해서는 컨슈머 애플리케이션이 오프셋 커밋을 정상적으로 처리했는지 검증해야 한다.

<br>

## 영속성
- 카프카는 다른 메시징 플랫폼과는 다르게 데이터를 파일 시스템에 저장한다.
- 따라서 종료되더라도 데이터는 유실되지 않는다.
- 파일 시스템에 저장하고 읽는 것은 메모리에 저장하는 것보다 느릴 수 밖에 없다.
- 따라서 운영체제의 page cache 영역을 메모리에 따로 생성하는 방식으로 성능 이슈를 개선했다.

<br>

## 멱등성 프로듀서
<img width="700" src="https://user-images.githubusercontent.com/60383031/156608307-4296e05c-e0e5-461c-a95e-6cf4d0f04da2.png">


- 멱등성이란 여러 번 연산을 수행하더라도 동일한 결과를 나타내는 것을 뜻한다.
- 멱등성 프로듀서는 동일한 데이터를 여러 번 전송하더라도 카프카 클러스터에 단 한 번만 저장됨을 의미한다.
- 기본 프로듀서는 at least once delivery 를 지원한다. 즉, 두 번 이상 적재할 가능성이 있기 때문에 데이터 중복이 발생할 수 있다.
- 따라서 Exactly once delivery 지원이 필요하다.
- 해당 옵션은 enable.idempotence 옵션을 true 로 설정하면 된다.
- 멱등성 프로듀서는 프로듀서의 PID, 시퀀스 넘버를 확인하여 Exactly once delivery 를 보장한다.

<br>

<img width="700" src="https://user-images.githubusercontent.com/60383031/156608678-f96ec88c-cd0c-4209-a045-2bc012d9dc17.png">

- 멱등성 프로듀서의 시퀀스 넘버는 0부터 시작하여 1씩 더한 값이 전달된다.
- 멱등성 프로듀서가 전송한 데이터의 PID, 시퀀스 넘버를 검증하는 과정에서 시퀀스 넘버 검증에 실패하면 OutOfOrderSequenceException 이 발생할 수 있다.
- 해당 오류는 브로커가 예상한 시퀀스 넘버와 다른 번호의 데이터의 적재 요청이 왔을 때 발생한다.
