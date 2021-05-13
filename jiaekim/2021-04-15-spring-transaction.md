# Spring 트랜잭션 처리

보통 스프링에서 트랜잭션 처리를 할 때 `@Transactional` 어노테이션을 이용하여 스프링에서 제공하는 선언적 트랜잭션을 이용했다.

그런데 메서드 단위가 아니라 메서드 내의 특정 구간만 트랜잭션 처리를 해야하는 경우 어떻게 할 수 있을까?

그리고 우리가 사용하던 `@Transactional` 어노테이션을 이용해서 스프링에서는 어떤식으로 트랜잭션 기능을 처리할 수 있었을까?

기존에 JDBC로 개발을 할 때는 직접 JDBC 연결을 맺고, commit과 rollback을 호출하여 처리했는데 Spring에서는 직접 개발자들이 트랜잭션 처리를 하지 않아도 되도록 추상화해서 제공하고 있다.

## 스프링 프레임워크 트랜잭션 추상화
### 1. 선언적 트랜잭션 방식
#### @Transactional
클래스, 메서드 위에 @Transactional이 추가되면 이 클래스에 트랜잭션 기능이 적용된 프록시 객체가 생성된다. 

이 프록시 객체는 @Transactional이 포함된 메서드가 호출될 경우, `PlatformTransactionManager`를 사용하여 트랜잭션을 시작하고, 정상 여부에 따라 Commit 또는 Rollback 한다.

```java
@Transactional
public boolean updateStudy(Study study){
  ...
}
```

![spring-tx](https://docs.spring.io/spring-framework/docs/4.2.x/spring-framework-reference/html/images/tx.png)

스프링 프레임워크의 선언적 트랜잭션 지원에 관한 주요한 개념은 이 기능이 AOP 프록시에 의해 지원되며, Transaction Advice는 메타데이터에 의해 작동한다. AOP와 트랜잭션 메타데이터의 결합은 AOP 프록시를 생성하는데, 이 프록시는 적절한 PlatformTransactionManager 구현체와 TransactionInterceptor를 함께 사용하여 메서드 호출을 중심으로 트랜잭션을 동작시킨다.

이 때, 메소드에서 unchecked Exception이 발생할 경우 rollback 된다. (RuntimeException의 하위 클래스)

### 2. 프로그래밍적 트랜잭션 방식
스프링 프레임워크에서 제공하는 프로그래밍 방식 트랜잭션 관리는 두 가지가 있다.
- TransactionTemplate 이용
- PlatformTransactionManager 구현체 직접 사용

스프링 팀은 프로그래밍 방식 트랜잭션 관리에 있어 TransactionTemplate 사용을 권장한다. 두 번째 방식은 예외 핸들링이 더 가볍다는 점 외엔 JTA UserTransaction API 를 사용하는 것과 유사하다. 

### 2.1  TransactionTemplate 사용
트랜잭션 컨텍스트에서 실행하면서 TransactionTemplate 을 사용하는 어플리케이션 코드는 다음과 같다. TransactionCallback 구현체는 트랜잭션 컨텐스트에서 실행할 코드를 작성하도록 한다. 그리고 커스텀 TransactionCallback의 인스턴스를 TransactionTemplate의 execute(..) 메서드로 전달한다.

```java
public class SimpleService implements Service {

    // single TransactionTemplate shared amongst all methods in this instance
    private final TransactionTemplate transactionTemplate;

    // use constructor-injection to supply the PlatformTransactionManager
    public SimpleService(PlatformTransactionManager transactionManager) {
        Assert.notNull(transactionManager, "The 'transactionManager' argument must not be null.");
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    public Object someServiceMethod() {
        return transactionTemplate.execute(new TransactionCallback() {
            // the code in this method executes in a transactional context
            public Object doInTransaction(TransactionStatus status) {
                updateOperation1();
                return resultOfUpdateOperation2();
            }
        });
    }
}
```

반환값이 없다면 TransactionCallbackWithoutResult 클래스를 사용한다.

```java
transactionTemplate.execute(new TransactionCallbackWithoutResult() {
    protected void doInTransactionWithoutResult(TransactionStatus status) {
        updateOperation1();
        updateOperation2();
    }
});
```

콜백 안의 코드는 파라미터로 제공된 TransactionStatus 객체의 setRollbackOnly() 메서드를 호출하여 트랜잭션을 롤백할 수 있다.

```java
transactionTemplate.execute(new TransactionCallbackWithoutResult() {
    protected void doInTransactionWithoutResult(TransactionStatus status) {
        try {
            updateOperation1();
            updateOperation2();
        } catch (SomeBusinessExeption ex) {
            status.setRollbackOnly();
        }
    }
});
```

### 2.2 PlatformTransactionManager 구현체 직접 사용
트랜잭션 관리를 위해 org.springframework.transaction.PlatformTransactionManager 를 직접 사용할 수도 있다. 간단하게 사용중인 PlatformTransactionManager 의 구현체를 빈에 넘기면 된다. 그리고 TransactionDefinition 과 TransactionStatus 객체를 사용해서 트랜잭션을 초기화하고 롤백하고 커밋할 수 있다.

```java
DefaultTransactionDefinition def = new DefaultTransactionDefinition();
// explicitly setting the transaction name is something that can only be done programmatically
def.setName("SomeTxName");
def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);

TransactionStatus status = txManager.getTransaction(def);
try {
    // execute your business logic here
} catch (MyException ex) {
    txManager.rollback(status);
    throw ex;
}
txManager.commit(status);
```

인터페이스 정보는 아래와 같다.

```java
public interface PlatformTransactionManager {
    TransactionStatus getTransaction( 
        TransactionDefinition definition) throws TransactionException;
    void commit(TransactionStatus status) throws TransactionException;
    void rollback(TransactionStatus status) throws TransactionException;
}
```
```java
public interface TransactionStatus extends SavepointManager {
    boolean isNewTransaction();
    boolean hasSavepoint();
    void setRollbackOnly();
    boolean isRollbackOnly();
    void flush();
    boolean isCompleted();
}
```

### 프로그래밍 방식 vs 선언적 방식
트랜잭션 작업이 많지 않다면 프로그래밍 방식은 대개 좋은 선택이 된다. 예를 들어, 트랜잭션 작업은 몇 개의 update 가 전부인 웹 어플레케이션을 개발한다면 스프링이나 다른 기술을 사용한 트랜잭션 프록시 설정을 원치 않을 수 있다. 이런 경우에 TransactionTemplate 은 좋은 처리 방법이다. 명시적으로 트랜잭션 이름을 세팅하는 일은 오직 프로그래밍 방식 트랜잭션 관리에서만 할 수 있는 일이기도 하다.

다른 한편으로는, 어플리케이션에 수많은 트랜잭션 작업이 필요하다면 일반적으로 선언적 트랜잭션 관리가 좋다. 이 방식은 트랜잭션 관리를 비즈니스 로직과 분리하며, 설정하기 어렵지 않다. 스프링 프레임워크를 사용하면 EJB CMT 를 사용할 때보다 선언적 트랜잭션 관리 설정 비용이 크게 줄어든다.

개인적으로는 주로 `@Transactional` 선언적 방식이 편해서 자주 사용하고 있었는데, 이번에 메서드 내에서 일부 구간만 트랜잭션을 잡고 먼저 커밋을 해주어야 했어서 `TransactionTemplate`을 사용해보았다. TransactionTemplate은 스프링에서 자동으로 처리해주니 개발자가 신경쓸 일이 더 줄어든다는 장점이 있었던 듯 하다. 더 공부해보고 나중엔 더 잘써야지...

### 참고자료
- [Spring Docs 트랜잭션 관리](https://docs.spring.io/spring-framework/docs/4.2.x/spring-framework-reference/html/transaction.html)