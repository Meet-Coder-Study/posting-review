# 트랜잭션

## DB 응용

- OLTP(OnLine Transaction Processing)
    - 복수의 사용자에서 발생되는 트랜잭션을 DB가 처리하고 돌려주는 과정
    - 응답속도가 빠름
    - 데이터 처리가 얼마나 정확하고 무결한지가 중요
    - index 로 데이터에 소량 접근하여 소량의 읽기를 해오는 경우
    - 데이터 수정이 비교적 많이 일어나는 경우
- OLAP(OnLine Analytical Processing)
    - 데이터를 분석하여 유의미한 정보를 제공해주는 처리방법
    - 오래 걸림, 상대적으로 응답속도가 느림
    - 다량의 데이터를 다량으로 읽기를 하는 경우

## Transaction(트랜잭션)

- 트랜잭션의 영어 의미는 "거래"
- 무언가를 주고 받는 행위를 의미
- DB에서는 **쪼갤 수 없는 작업의 단위**를 의미
- ACID(Atomicity, Consistency, Isolation, Durability) 4가지 특성을 가짐
- 데이터 부정합을 방지하고자 사용

## 1. Atomicity(원자성)

- All or Nothing
- 전혀 수행되지 않거나 완전히 수행된 되어야 한다.
- 트랜잭션의 단위는 원자성을 가지며 하나의 묶음이 쪼갤 수 없는 작업의 단위가 됨
- A가 B에게 1000원을 주고 아이스크림을 사는 경우, 돈을 지불하고 아이스크림을 받는 전체가 하나로 이루어져야 한다. 중간에 돈만 나가고 아이스크림을 받지 못하는 상태가 생기면 안 됨

```text
1. A.money -= 1000
2. B.money += 1000
3. A.bag += IceCream
4. B.bag -= IceCream
```

## 2. Consistency(일관성)

- 트랜잭션을 수행하고 나면 **하나의 일관된 상태(Correct Status)에서 다른 일관된 상태**로 바뀌어야 한다.
- 일관된 상태(Correct State): 도메인의 유효범위, 기타 제약조건 등을 위반하지 않는 상태
- Correct State -----(Transaction)-----> Correct State
- 예시, 잔액이 0이상이어야 하는 경우(제약조건)

```text
1. 1000원을 가지고 있다.
2. +200원
3. -1500원
=> 잔액이 -300이 되므로 정상상태가 아님

1. 1000원을 가지고 있다.
2. -1500원
3. +1600원
=> 결과적으로 +100인 상황이므로 정상상태임
```

- 일시적으로 비정상상태이더라도 최종 결과는 정상상태이므로 트랜잭션 수행이 가능

## 3. Isolation(고립성)

- 한 트랜잭션이 실행되는 동안 외부에서는 트랜잭션 접근이 불가
- 싱글스레드처럼 동작한다는 의미(한번에 하나의 트랜잭션만 수행하면 항상 고립성은 보장)
- 실제로는 동시에 여러 트랜잭션이 수행되지만 한번에 하나씩 수행한 것과 동일한 결과를 가져야 함
- OS의 세마포어(semaphore)와 비슷한 개념으로 `lock & execute unlock`을 통해 고립성 보장
- 데이터를 읽을 때, 여러 트랜잭션이 읽을 수 있도록 허용하는 `shared_lock`을 함(readOnly)
- 데이터를 쓸 때, 다른 트랜잭션이 읽고 쓸수 없도록 `exclusive_lock`을 사용
- lock, unlock을 잘못 사용시 데드락 상태 가능성 => 2PL(2 Phase Locking protocol) 이 고안됨
- 2PL 프로토콜: 여러 트랜잭션이 공유하고 있는 데이터를 동시에 접근할 없도록 하기 위한 목적
- 2단계의 locking(growing phase: read_lock, write_lock & shrinking phase: unlock)
- growing phase 다음에 shrinking phase가 실행되게 되어 있음
- 보통 트랜잭션이 commit 을 만날때까지 lock 상태를 가지고 있다가 commit 되면 unlock 됨

## 4. Durability(지속성)

- 완료(commit)된 트랜잭션은 영구적으로 보존되야야 함
- JDBC connection 에서 자동 커밋이 기본설정
- commit 되어야 데이터가 반영이 완료됨

## Recovery

- commit: 트랜잭션의 완료를 나타내는 용어
- 버퍼캐시가 disk 에 쓰여지기 전에 항상 관련 redo, undo 가 먼저 쓰여진다.
- redo: 쿼리문을 다시 발생시킬 수 있을 만큼의 충분한 정보를 가짐
- undo(rollback): 쿼리문이 다시 없던 일로 만들 수 있을 만큼의 충분한 정보를 가짐
- 검사점(checkpoint) 이후의 장애(failure)시점을 기준으로 undo와 redo를 판단
  ![redo,undo](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=http%3A%2F%2Fcfile5.uf.tistory.com%2Fimage%2F9914C5345A7E60EA05DB09)

*이미지출처:https://victorydntmd.tistory.com/130*

## DBMS 간략한 구조

![DMBS 구조](https://d2.naver.com/content/images/2015/06/helloworld-407507-1.png)

*이미지 출처:https://d2.naver.com/helloworld/407507*

- 질의처리기(Query Processor)와 저장시스템(Storage System)으로 나뉨
- 데이터를 고정길이 페이지로 저장하며, 디스크에서 읽거나 쓸 때 페이지 단위의 입출력이 이루어짐
- 페이지 관리 모듈: 페이지 버퍼, 버퍼 관리자라고 함
- 버퍼에서 디스크에 작성되어야 데이터가 저장됨
- 페이지들이 버퍼 관리자의 교체알고리즘에 따라 디스크에 출력

## Transaction Isolation Levels (4 단계)

### READ UNCOMMITTED

- commit, rollback 여부와 상관없이 다른 트랜잭션에서 값을 읽기 가능
- 정합성에 문제가 꽤 많은 격리수준임
- dirty read: 트랜잭션이 완료되지 않았는데도 다른 트랜잭션에서 볼 수 있는 현상

### READ COMMITTED

- commit 되어야만 다른 트랜잭션에서 조회 가능
- 같은 트랜잭션이더라도 스냅샷이 다시 생성됨(consistent non-locking read)
- update 경우, row에 걸린 lock이 걸렸지만, semi-consistent 읽기를 진행하여 최신 커밋된 버전으로 읽을 수 있음

### REPEATABLE READ

- Mysql에서 InnoDB의 기본 설정
- 같은 트랜잭션의 처음상태의 스냅샷으로 읽음. consistent read 가 가능
- 커밋된 내용에 대해서만 조회가능한 격리수준
- 트랜잭션마다 id를 부여하여 트랜잭션id 보다 작은 번호에서만 변경한 것만 읽기 가능

### SERIALIZABLE

- 가장 엄격한 격리수준
- InnoDB에서 조회작업은 잠금을 걸지 않고 동작하나 serializable에서는 읽기에서도 공유잠금을 설정함
- 자동커밋이 켜져있다면 읽기도 하나의 트랜잭션으로 관리됨
- 동시처리 능력이 다른 격리 수준보다 떨어지고 성능저하 발생

# 참고

- [생활코딩 DB 강의](https://www.opentutorials.org/course/1555/8770)
- [naver D2 트랜잭션](https://d2.naver.com/helloworld/407507)
- [acid 참고블로그](https://victorydntmd.tistory.com/129)
- [mysql transaction isolation level](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html)
- [redo, undo 블로그](https://victorydntmd.tistory.com/130)
- [트랜잭션 격리수준 참고 블로그](https://joont92.github.io/db/%ED%8A%B8%EB%9E%9C%EC%9E%AD%EC%85%98-%EA%B2%A9%EB%A6%AC-%EC%88%98%EC%A4%80-isolation-level/)