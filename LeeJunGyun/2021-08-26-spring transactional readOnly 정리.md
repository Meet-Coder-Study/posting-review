## spring transactional readOnly 성능 관련 정리
- org.springframework.transaction.annotation.Transactional 의 readOnly 에 대해서 찾아봤습니다.

```
public abstract boolean readOnly
A boolean flag that can be set to true if the transaction is effectively read-only, allowing for corresponding optimizations at runtime.
Defaults to false.

This just serves as a hint for the actual transaction subsystem; 
it will not necessarily cause failure of write access attempts. 
A transaction manager which cannot interpret the read-only hint will not throw an exception when asked for a read-only transaction but rather silently ignore the hint.

See Also:
TransactionDefinition.isReadOnly(), TransactionSynchronizationManager.isCurrentTransactionReadOnly()
Default:
false
```

- 요약하면 readOnly 설정을 주면 transactionManager 에 읽기전용 hint 가 적용이 됩니다.
- transactionManager 가 읽기전용 hint 를 적용할 수 없다면 무시합니다.


## hibernate, readOnly 관련 정리
- hibernate 에서 readOnly 설정이 들어갈 경우 트랜잭션 commit 시, flush 를 하지 않습니다.
  - 정확히는 session 의 flush_mode 가 FLUSH_MANUAL 로 변경
- flush 하는 resource + flush 를 안함으로써 dirty checking 을 안하는 resource 가 제거되니 성능 향상이 있습니다.

## 결론
- service 중에 읽기만 하는 것은 읽기 전용 service 로 묶어두는게 좋을 것 같습니다.
- 아래와 같이 조회만 있는 서비스는 별도 서비스로 만들어서 readOnly 를 전체적으로 적용하고, cud 가 발생하는 서비스는 따로 만들어서 Transactional 을 적용하면 깔끔할 것 같습니다.
- 조회용 서비스, cud 전용 서비스 이렇게 분리해둔다면 유지보수하는데 좋을 것이라 생각됩니다.

```java

@Service
@Transactional(readOnly = true)
public class MemberService {
    public Member getMember(xxx) {
        
    }
    
    public List<Member> getMembers(xxx) {
        
    }
}

```


## reference
- https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/Transactional.html
- https://tech.yangs.kr/22