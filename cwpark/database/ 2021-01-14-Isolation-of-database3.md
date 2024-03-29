

# 관계형 데이터베이스의 고립성(Isolation) of ACID (3)

## 직렬성(Serializability)

트랜잭션은 경합 상황(race condition)에서 취약하다. 다음 3가지 상황을 통해 왜 쓰기 왜곡(write skew)과 유령 읽기(phantom read)가 어려운 문제인지 알 수 있다.

- 고립성 수준은 이해하기가 어렵고, 데이터베이스마다 그 구현이 일관적이지 않다.
- 애플리케이션 코드를 보면, 특정 고립성 수준에서 안전하게 실행될 수 있을지 확신하기 어렵다.
- 경합 상황을 감지하는 좋은 도구가 없다.

이러한 여러가지 어려운 경합 상황에서 가장 확실한 해결책은 직렬 수준으로 고립성을 높이는 것이다. 직렬화 고립성은 가장 엄격한 고립성 수준이다. 트랜잭션들이 병렬로 실행되더라도 그 결과는 마치 한번에 단 하나의 트랜잭션만 실행되는 것처럼 만들어준다.

직렬화 수준의 고립성을 총 3가지 구현 방법이 존재한다.

1. 말그대로 트랜잭션을 일렬로(serial) 실행한다.
2. 2단계 락(Two-phase Locking)을 사용한다.
3. 낙관적 동시성 제어인 직렬화 스냅샷 고립성(Serializable Snapshot Isolation)을 사용한다.

## 1. 직렬로 실행하기

동시성 문제를 가장 간단하게 해결하는 방법은 동시성을 완전히 없애는 것이다. 즉, 트랜잭션을 하나의 스레드에서 하나씩만 실행하는 것이다. 멀티 스레드에서 동작하는 것이 지난 30년동안 좋은 성능을 위한 필수라고 여겼음에도, 싱글 스레드로 트랜잭션을 실행하도록 만든 장점은 무엇이었을까?

- RAM 가격은 하락하고 있다. 메모리에 데이터를 저장해 두는 것이 합리적으로 여기게 되었다. 트랜잭션이 필요한 데이터를 메모리에서 가져올 수 있다면 트랜잭션은 디스크에서 데이터를 가져오는 것보다 훨씬 빠를 것이다.
- 데이터베이스 설계자는 OLTP 트랜잭션은 보통 짧으며 적은 수의 읽기와 쓰기만을 수행한다는 것을 깨달았다. 반면, 긴 시간동안 수행되는 분석용 쿼리는 읽기만 할 것이다. 따라서, 스냅샷 수준의 고립성이면 충분할 것이다.

트랜잭션을 직렬로 실행할 때, 동시성 제어가 어렵지 않다. 하지만 단일 CPU 코어로는 데이터베이스 처리량은 제한된다. 많은 읽기 처리량이 필요한 애플리케이션은 싱글 스레드 트랜잭션이 병목(bottleneck) 이 될 수 있다. 다중 CPU 코어로 개수를 늘리거나, 여러 노드로 개수를 늘린다면, 데이터를 파티셔닝해야할 것이다. 각각의 CPU에 트랜잭션을 하나씩 처리하도록 한다면 처리량이 늘어날 것이다.

하지만, 어떤 트랜잭션은 여러 파티션에 접근해야할 필요가 있다. VoltDB는 초당 1000 개의 크로스-파티션 쓰기 처리량을 지원한다. 이 정도의 처리량은 싱글 파티션의 처리량보다 못미치는 수준이며, 노드를 더 추가한다고 해서 증가할 수 없다. 싱글 파티션에서 사용될 수 있는 트랜잭션인지를 판단하려면, 애플리케이션이 사용하는 데이터의 구조를 파악해야 한다. 간단한 키-밸류 형식의 데이터는 파티셔닝이 매우 쉽다. 하지만, 다중 세컨더리 인덱스를 가진 데이터를 처리하려면 크로스 파티션이 필요하다.

## 2. 2단계 락(Two-Phase Locking)

2단계 락은 여러 트랜잭션이 동시에 같은 객체를 읽는 것을 허용한다. 단, 다른 트랜잭션이 그것에 쓰기 작업을 하지 않는 이상말이다. 만약 하나의 트랜잭션이라도 어떤 객체에 쓰기 작업을 한다면 배타적 접근이 필요하다. 2단계 락은 MySQL(InnoDB엔진)과 SQL Server에서는 직렬성(Serializable) 고립성 수준이며, IBM DB2에서는 반복적 읽기(repetable read) 고립성 수준이다.

락은 두 가지 종류가 있다. 공유 모드(shared mode)와 배타적 모드(exclusive mode)다. 어떻게 락이 사용되는지 살펴보자.

- 만약 한 트랜잭션이 하나의 객체에 읽기 작업을 하려고 한다면, 가장 먼저 이 객체는 공유 모드(shared mode)로 이 객체에 락을 걸어야 한다. 다른 트랜잭션이 동시에 공유 모드로 락을 획득하는 것은 가능하다. 하지만 다른 트랜잭션이 이 객체에 배타적 모드를 가지고 있다면 기다려야 한다.
- 만약 트랜잭션이 쓰기 작업을 원하다면, 가장 먼저 이 객체는 배타적 모드로 락을 걸어야 한다. 다른 트랜잭션이 어떤 락 종류(공유 모드 또는 배타적 모드)를 가지더라도 접근이 불가능하다.
- 만약 트랜잭션이 읽기 작업 후 쓰기 작업을 원한다면, 공유 모드에서 배타적 모드로 업그레이드해야 한다. 
- 트랜잭션이 락을 얻은 후에 이 락을 트랜잭션이 끝날 때 까지 계속 가지고 있어야 한다. 두 단계(two-phase) 라는 단어는 여기서 유래한다. 첫 번째 단계는 락을 얻을 떄를 말하며, 두 번째 단계는 모든 락이 풀리는 때를 말한다.

2 단계 락의 성능은 어떨까?

- 2 단계 락은 1970년대 이후로 잘 사용되지 않는다. 왜냐하면 트랜잭션 처리량과 응답 시간이 굉장히 느리기 때문이다.
- 락을 얻고 반납하는 오버헤드 때문이기도 하지만, 동시성이 제한이 성능 저하의 주된 이유이다.

인덱스-레인지(Index-range) 락은 트랜잭션이 락을 얻기 위해 객체에 락이 걸려있는지 매번 체크하는 오버헤드를 줄이기 위해 인덱스-레인지 락 (또는, 넥스트 키 락)을 지원한다. 방을 예약하는 예제로 인덱스 레인지락을 설명해보자. 

- 방마다 room_id가 부여된다. 그리고 인덱스를 가진다. 또는, 예약 시작시간(start_time)과 예약 종료시간(end_time)에도 인덱스를 갖는다.
- 만약 room_id에 인덱스를 갖는다면, 123번이라는 방 번호를 찾기 위해 사용할 수 있다. 
- 시간을 기준으로 인덱스를 사용한다면, 날짜에 해당하는 범위에 공유 락을 획득할 수 있다. 예를 들어, 2018년 1월 1일 오후 12시부터 13시 까지를 범위로 락을 획득할 수 있다.

이처럼 인덱스 레인지 락은 기간과 같은 범위에 락을 부여할 수 있는 인덱스에 유용하다. 

(다음 포스팅에 계속, 3. 직렬화 스냅샷 고립성(Serializable Snapshot Isolation, SSI))

---

Desingning Data-Intensive Application. Martin Kleppmann. O'REILLY. 2017.

