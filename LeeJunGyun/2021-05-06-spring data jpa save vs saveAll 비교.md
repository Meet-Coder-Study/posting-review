> **source 는 [Github](https://github.com/leechoongyon/spring-boot-jpa-example) 에 있습니다.**

## save 동작 원리
- save 동작 원리는 [이전 글](https://insanelysimple.tistory.com/300) 참고하시면 됩니다.

## saveAll 동작 원리
- 간략히 설명하면 save(xxx) 는 1건을 저장하는 메소드이며, saveAll 은 다건이상의 데이터를 저장하는 메소드입니다.
- 아래 로직만 보면 saveAll 은 save() 를 호출하는 구조로 되어있습니다.
- 그럼 대량의 데이터를 처리할 때, save, saveAll 은 같은 성능으로 처리될까요? 

```java
    
    SimpleJpaRepository.java
    
	@Transactional
	@Override
	public <S extends T> S save(S entity) {

		if (entityInformation.isNew(entity)) {
			em.persist(entity);
			return entity;
		} else {
			return em.merge(entity);
		}
	}

	@Transactional
	@Override
	public <S extends T> List<S> saveAll(Iterable<S> entities) {

		Assert.notNull(entities, "Entities must not be null!");

		List<S> result = new ArrayList<S>();

		for (S entity : entities) {
			result.add(save(entity));
		}

		return result;
	}


```



## save, saveAll 성능 비교
- 아래와 같이 성능 테스트를 진행했는데 10000건 이상 돌리면 컴퓨터가 안좋아서 멈춰버리거나 상당히 오래 걸립니다...
- 100건 정도 돌렸으며, saveAll 이 좀 더 성능이 잘나오는 것을 확인했습니다.
- reference 보면 테스트 결과가 있고, saveAll 이 확실히 성능이 잘 나온다고 합니다.

```java

@RunWith(SpringRunner.class)
@DataJpaTest
public class MemberRepositoryTest {

    @Autowired
    private MemberRepository memberRepository;

    private final int SIZE = 100;

    @Test
    public void save_대량_성능_테스트() throws Exception {
        long start = System.currentTimeMillis();
        for (int i = 0 ; i < SIZE ; i++) {
            Member member = Member.builder()
                    .age(10)
                    .name("test")
                    .telNo("123")
                    .build();
            memberRepository.save(member);
        }
        System.out.println("elapsed time : "  + (System.currentTimeMillis() - start));
    }

    @Test
    public void saveAll_대량_성능_테스트() throws Exception {
        long start = System.currentTimeMillis();
        List<Member> members = new ArrayList<>();
        for (int i = 0 ; i < SIZE ; i++) {
            Member member = Member.builder()
                    .age(10)
                    .name("test")
                    .telNo("123")
                    .build();
            members.add(member);
        }
        memberRepository.saveAll(members);
        System.out.println("elapsed time : "  + (System.currentTimeMillis() - start));
    }
}


```

## 왜 성능차이가 발생하는걸까요?

#### save() flow

###### 기존트랜잭션이 존재할 경우
- save() 를 호출했는데 기존 트랜잭션이 존재할 경우 save() 는 기존 트랜잭션에 참여하게 됩니다.
- 기존 트랜잭션에 참여 하지만, @Transactional 이 걸려있기에 spring 의 프록시 로직을 타게 됩니다.
- 그렇기에 그만큼의 resource 가 더 들게 됩니다.

###### 기존트랜잭션이 없을 경우 
- 기존 트랜잭션이 없을 경우 트랜잭션이 생성됐다가 종료됩니다.
- 그렇기에 리소스 소모가 상당히 클 것 입니다.  

#### saveAll() flow

###### 기존트랜잭션 존재할 경우 
- 기존 트랜잭션이 존재하기에 기존 트랜잭션에 참여하게 됩니다.
- saveAll --> save 를 호출하지만 같은 인스턴스에서 내부 호출하기에 프록시 로직을 타지 않습니다.

###### 기존트랜잭션 없을 경우
- 한 번의 트랜잭션을 생성하고, save() 를 여러 번 호출하며, 같은 인스턴스에서 내부 호출하기에 프록시 로직을 타지 않습니다. 

## 결론
- 다건 데이터를 insert 할 때, saveAll 을 사용하는게 좋습니다.
- 다음 주제는 @Transactional 이 어떻게 동작하는지 찾아보고 정리할 예정입니다.

## Reference
- https://www.baeldung.com/spring-data-save-saveall