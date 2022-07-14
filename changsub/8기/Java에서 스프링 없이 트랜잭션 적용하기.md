# \<DB\> Java에서 스프링 없이 트랜잭션 적용하기
> 우선 해당 내용은 MVC 패턴 기반하에서 코드가 작성됩니다.
사실 저희가 사용하는 Spring이나 다른 프레임워크들은 아래에 나올 일련의 과정을 좀 더 수월하게 진행시켜주는 역할을 수행합니다.
본격적으로 프레임워크 없이 트랜잭션을 한번 구현해보겠습니다.
> 본 예제의 시나리오는 간단한 계좌이체 상황입니다.
## 트랜잭션 적용하지 않은 경우
```java
@RequiredArgsConstructor
public class MemberServiceNoTransaction {
    private final MemberRepositoryV1 memberRepositoryV1;

    public void accountTransfer(String fromId, String toId, int money) throws SQLException {
        Member fromMember = memberRepositoryV1.findById(fromId);
        Member toMember = memberRepositoryV1.findById(toId);

        memberRepositoryV1.update(fromId, fromMember.getMoney() - money);
        validation(toMember);
        memberRepositoryV1.update(toId, toMember.getMoney() + money);

    }
    //로직 수행 중 예외 발생 상황을 위해 만든 메서드
    private void validation(Member toMember) {
        if (toMember.getMemberId().equals("ex")) {
            throw new IllegalStateException("이체중 예외 발생");
        }
    }
}
```
-위 서비스 코드의 문제점이 무엇인지 파악이 되시나요?만약 `validation 메서드`에서 예외가 발생한 경우 돈을 송금하는 사람의 계좌에서 빼낸 돈을 원복하는 과정이 없다는 것입니다.
즉,**앞서 저희가 배운 트랜잭션이 제대로 작동하지 않는 코드**입니다.테스트 코드를 통해 구체적으로 알아봅시다.(Junit5 사용)
```java
class MemberServiceNoTransactionTest {

    public static final String MEMBER_A = "memberA";
    public static final String MEMBER_B = "memberB";
    public static final String MEMBER_EX = "ex";

    private MemberRepositoryV1 memberRepositoryV1;
    private MemberServiceNoTransaction memberServiceNoTransaction;

    @BeforeEach
    void beforeEach() {
        DriverManagerDataSource driverManagerDataSource = new DriverManagerDataSource(URL, USERNAME, PASSWORD);
        memberRepositoryV1 = new MemberRepositoryV1(driverManagerDataSource);
        memberServiceNoTransaction = new MemberServiceNoTransaction(memberRepositoryV1);
    }

    @AfterEach
    void afterEach() throws SQLException {
        memberRepositoryV1.delete(MEMBER_A);
        memberRepositoryV1.delete(MEMBER_B);
        memberRepositoryV1.delete(MEMBER_EX);
    }

    @Test
    @DisplayName("Success")
    void accountTransfer() throws SQLException {
        //given
        Member memberA = new Member(MEMBER_A, 10000);
        Member memberB = new Member(MEMBER_B, 10000);
        memberRepositoryV1.save(memberA);
        memberRepositoryV1.save(memberB);
        //when
memberServiceNoTransaction.accountTransfer(memberA.getMemberId(), memberB.getMemberId(), 2000);
        //then
        Member findMemberA = memberRepositoryV1.findById(memberA.getMemberId());
        Member findMemberB = memberRepositoryV1.findById(memberB.getMemberId());
        assertThat(findMemberA.getMoney()).isEqualTo(8000);
        assertThat(findMemberB.getMoney()).isEqualTo(12000);
    }

    @Test
    @DisplayName("Fail")
    void accountTransferFail() throws SQLException {
        //given
        Member memberA = new Member(MEMBER_A, 10000);
        Member memberEx = new Member(MEMBER_EX, 10000);
        memberRepositoryV1.save(memberA);
        memberRepositoryV1.save(memberEx);
        //when
        assertThatThrownBy(() -> memberServiceNoTransaction
                .accountTransfer(memberA.getMemberId(), memberEx.getMemberId(), 2000))
                .isInstanceOf(IllegalStateException.class);
        //then
        Member findMemberA = memberRepositoryV1.findById(memberA.getMemberId());
        Member findMemberB = memberRepositoryV1.findById(memberEx.getMemberId());
        assertThat(findMemberA.getMoney()).isEqualTo(8000);
        assertThat(findMemberB.getMoney()).isEqualTo(10000);
    }
}
```
성공하는 케이스의 경우 계좌이체 로직이 실행되는 동안 아무런 예외가 발생하지 않았기에 무리없이 작동하는것을 볼 수 있습니다.하지만 Fail 테스트의 경우 중간에 일부러 예외를 터지게 만들었습니다.**즉,돈이 나가는 사람으로부터 2000원 빠져나가기만 하고 받는 사람은 적용이 되지 않은것이죠.**상식적인 선에서 위와 같은 예외가 발생하면 rollback을 통해 되돌려 놓아야 하지만 저희 서비스단은 아직 그러한 기능이 없기에 각각 계좌잔고가 8000원,10000원임을 검증 코드를 통해 확인 할 수 있습니다. 
![](Screen%20Shot%202022-07-09%20at%204.30.23%20PM.png) 
## 트랜잭션 적용하기
```java
@RequiredArgsConstructor
public class MemberServiceWithTransaction {
    private final MemberRepositoryV2 memberRepository;
    private final DataSource dataSource;

    public void accountTransfer(String fromId, String toId, int money) throws SQLException {
        Connection connection = dataSource.getConnection();//service -> repository로 con을 넘겨야해서
        try {
            connection.setAutoCommit(false);//Transaction 시작
            bizLogic(connection, fromId, toId, money);
            connection.commit();//성공시 커밋

        } catch (Exception e) {
            connection.rollback();//실패시 롤백
            throw new IllegalStateException(e);
        } finally {
            release(connection);
        }
    }

    private void bizLogic(Connection connection, String fromId, String toId, int money) throws SQLException {
        Member fromMember = memberRepository.findById(connection, fromId);
        Member toMember = memberRepository.findById(connection, toId);
        //간단한 계좌이체 로직
        memberRepository.update(connection, fromId, fromMember.getMoney() - money);
        validation(toMember);
        memberRepository.update(connection, toId, toMember.getMoney() + money);
    }

    private void release(Connection connection) {
        if (connection != null) {
            try {
                connection.setAutoCommit(true);//해당 커넥션을 바로 close()할 경우 setAutoCommit-false인채로 Pool로 돌아감
                connection.close();
            } catch (Exception e) {
                log.error("error", e);
            }
        }
    }

    private void validation(Member toMember) {
        //이전 단계와 동일
    }
}
```
앞선 단계에 비해서 상당히 많은 로직들이 서비스단에 들어간것을 확인 할 수 있습니다.차근차근 설명해보겠습니다.
1. bizLogic : 이전단계에서는 accountTransfer 메서드 내에서 비지니스 로직을 적용시켰습니다.하지만 트랜잭션 적용을 하게 되면 accountTransfer 메서드에 추가되는 내용이 많기에 로직을 뽑아내어 메서드화시켰습니다.
2. release : 앞서 트랜잭션을 배웠을때, 세션에서 트랜잭션의 시작과 끝을 담당한다고 했습니다.또한 이러한 세션은 커넥션마다 가질 수 있습니다.그렇기에 accountTransfer 메서드에서 직접 생성한 커넥션을 커넥션 풀에 다시 반납하는 역할을 수행합니다. 해당 메서드는 finally 블럭 내부에 있어 최종적으로 무조건 실행되는 코드입니다.
이제 accountTransfer 메서드의 내부를 살펴보겠습니다.우선 **하나의 동일한 커넥션에서 하나의 트랜잭션이 시작되고 끝**나기에 **service단에서 커넥션을 생성**해 repository단으로 넘겨줍니다.이후 try-catch-finally 구문을 통해 예외가 발생했을 경우 rollback을 시켜주고 그렇지 않을 경우 commit을 합니다.저희가 직접 sql에 명령어로 설정해줬던 setAutoCommit 설정도 try 구문내에서 bizLogic을 호출하기 전에 False로 설정하는 것 또한 확인하실 수 있습니다.
그러나 이미 스프링 MVC를 접해보신 분들이라면 service단에서 위와 같은 구조를 취하는 것이 상당히 귀찮고 번거롭다고 생각하실것입니다.(service단의 경우 비지니스 로직을 중점적으로 다루는 영역인데 지금은 DB에 관한 설정까지 다뤄야하고 있습니다)
그래도 트랜잭션을 적용했으니 테스트코드를 통해 동작을 확인해봅시다.
```java
package hello.jdbc.service;

import hello.jdbc.donmain.Member;
import hello.jdbc.repository.MemberRepositoryV2;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import java.sql.SQLException;

import static hello.jdbc.connection.ConnectionConst.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/*
* 트랜잭션 - 커넥션 파라미터 전달을 통해 동기화
* */
@Slf4j
class MemberServiceWithTransactionTest {

    public static final String MEMBER_A = "memberA";
    public static final String MEMBER_B = "memberB";
    public static final String MEMBER_EX = "ex";

    private MemberRepositoryV2 memberRepository;
    private MemberServiceWithTransaction memberService;

    @BeforeEach
    void beforeEach() {
        DriverManagerDataSource driverManagerDataSource = new DriverManagerDataSource(URL, USERNAME, PASSWORD);
        memberRepository = new MemberRepositoryV2(driverManagerDataSource);
        memberService = new MemberServiceWithTransaction(memberRepository,driverManagerDataSource);
    }
    @AfterEach
    void afterEach() throws SQLException {
        //이전 테스트코드와 동일
    }
    @Test
    @DisplayName("Success")
    void accountTransfer() throws SQLException {
        //이전 테스트코드와 동일
    }
    @Test
    @DisplayName("Fail")
    void accountTransferFail() throws SQLException {
        //given
        Member memberA = new Member(MEMBER_A, 10000);
        Member memberEx = new Member(MEMBER_EX, 10000);
        memberRepository.save(memberA);
        memberRepository.save(memberEx);
        //when A -> B로 2000원 송금
        assertThatThrownBy(() -> memberService
                .accountTransfer(memberA.getMemberId(), memberEx.getMemberId(), 2000))
                .isInstanceOf(IllegalStateException.class);

        //then
        Member findMemberA = memberRepository.findById(memberA.getMemberId());
        Member findMemberB = memberRepository.findById(memberEx.getMemberId());
        assertThat(findMemberA.getMoney()).isEqualTo(10000);
        assertThat(findMemberB.getMoney()).isEqualTo(10000);
    }

}
```
Fail 케이스에 대한 테스트를 보시면 이전과는 다르게 검증단계에서 송금하는 측과 수금하는 측의 계좌 잔고 모두 10000으로 설정한것을 보실 수 있습니다.아래와 같이 **rollback이 정상적으로 작동**하여 상식적인 계좌이체 로직이 돌아가는것을 볼 수 있습니다.
![](Screen%20Shot%202022-07-09%20at%204.42.25%20PM.png)
하지만 여전히 저희는 서비스 레이어에서 트랜잭션을 사용하기 위해 JDBC 기술에 의존한다는 문제점을 가지고 있습니다.이러한 문제는 스프링이라는 프레임워크가 어떻게 해결했는지 다음 포스팅에서 알려드리겠습니다.

Ref : [김영한 - 스프링 DB 1](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-db-1/dashboard)