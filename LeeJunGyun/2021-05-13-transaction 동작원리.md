## 스프링 @Transaction 동작 원리
- 스프링 @Transactional 의 주된 개념은 AOP proxy 입니다.
- 여기서 AOP, Proxy 에 관련해서 자세히는 다루지 않겠습니다.
- 이 부분을 좀 더 상세화 해보면 Spring core 에서 @Transacational 이 붙은 메소드를 찾아서 (AOP mechanism) Proxy Object 를 만듭니다.
- Proxy object 를 통해 proxy mechanism 이 동작되고, 실제 호출하는 메소드를 감싸서 트랜잭션을 적용하게 됩니다. 
    - 정확히는 Proxy Object 은 TransactionInterceptor 를 호출하고, 여기서 트랜잭션 commit, rollback 등을 처리합니다.

## 스프링 @Transaction 동작 원리 예시
- 아래 예시는 jdbc 를 활용해서 예시로 표현된 것입니다.
 
#### Proxy mechanism 적용 전
```java
@Service
public class TestService {

    @Transactional
    public Long saveMember(Member member) {

            // call SQL  
    }

}
```
   
#### Proxy mechanism 적용 후
```java
@Service
public class TestService {

    @Transactional
    public Long saveMember(Member member) {
        Connection connection = dataSource.getConnection();
        try (connection) {

            connection.setAutoCommit(false);

            // call SQL

            connection.commit();
        } catch (SQLException e) {
            connection.rollback();
        }
    }
}
```

## 주의할 점
- Spring 의 proxy 메커니즘은 오직 외부 메서드 호출을 통해서만 동작합니다.
- 만약 같은 서비스 내의 메소드가 같은 서비스 내의 @Transaction 이 붙은 메소드를 호출할 경우 proxy mechanism 이 동작안합니다.
- 즉, 트랜잭션이 제대로 동작하지 않습니다.

```text
    In proxy mode (which is the default), only external method calls coming in through the proxy are intercepted. 
    This means that self-invocation (in effect, a method within the target object calling another method of the target object) 
    does not lead to an actual transaction at runtime even if the invoked method is marked with @Transactional. 
    Also, the proxy must be fully initialized to provide the expected behavior, 
    so you should not rely on this feature in your initialization code (that is, @PostConstruct)
```


## reference
- https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#transaction
- https://stackoverflow.com/questions/1099025/spring-transactional-what-happens-in-background
- https://www.marcobehler.com/guides/spring-transaction-management-transactional-in-depth