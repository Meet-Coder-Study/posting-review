> **source 는 [Github](https://github.com/leechoongyon/spring-boot-jpa-example) 에 있습니다.**

## spring-data-jpa save 동작 원리
- spring-data-jpa save source 를 보면 아래와 같습니다.
- entity 가 새로 생성할 예정이라면 persist() 를 호출하고, 그렇지 않다면 merge() 를 호출합니다.

```java

SimpleJpaRepository.java

/*
 * (non-Javadoc)
 * @see org.springframework.data.repository.CrudRepository#save(java.lang.Object)
 */
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

```

## isNew 는 어떻게 동작하는건가?

### Entity 가 언제 new 로 인식돼는지 설명

The following table describes the strategies that Spring Data offers for detecting whether an entity is new:

| `@Id`-Property inspection (the default)               | By default, Spring Data inspects the version property of the given entity. If the identifier property is `null` or `0` in case of primitive types, then the entity is assumed to be new. Otherwise, it is assumed to not be new. |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| `@Version`-Property inspection                        | If a property annotated with `@Version` is present and `null`, or in case of a version property of primitive type `0` the entity is considered new. If the version property is present but has a different value, the entity is considered to not be new. If no version property is present Spring Data falls back to inspection of the Id-Property. |
| Implementing `Persistable`                            | If an entity implements `Persistable`, Spring Data delegates the new detection to the `isNew(…)` method of the entity. See the [Javadoc](https://docs.spring.io/spring-data/data-commons/docs/current/api/index.html?org/springframework/data/domain/Persistable.html) for details.*Note: Properties of `Persistable` will get detected and persisted if you use `AccessType.PROPERTY`. To avoid that, use `@Transient`.* |
| Providing a custom `EntityInformation` implementation | You can customize the `EntityInformation` abstraction used in the repository base implementation by creating a subclass of the module specific repository factory and overriding the `getEntityInformation(…)` method. You then have to register the custom implementation of module specific repository factory as a Spring bean. Note that this should rarely be necessary. |

#### 식별자 (@Id)
- 첫번째는 식별자가 null 또는 0일 경우 new 상태로 인식합니다. (@Id 가 붙은 것이 식별자)
- 여기서 주의할게 Long 타입과 같이 Wrapper 일 경우 null 을 newState 인식하고, int 와 같이 Primitive 일 경우 new 상태로 인식합니다.

```java

    @Test
    public void ID식별자_ISNEW_테스트() throws Exception {
        EntityInformation<IsNewSampleWithPrimitiveId, Long> entityInformation =
                new JpaMetamodelEntityInformation<>(IsNewSampleWithPrimitiveId.class, entityManager.getMetamodel());

        IsNewSampleWithPrimitiveId sample = new IsNewSampleWithPrimitiveId();
        // 아무 것도 세팅 안했으니 isNew -> true
        Assert.assertThat(entityInformation.isNew(sample), is(true));

        // @Id 에 값이 존재하니 new 가 아님.
        sample.setId(1L);
        Assert.assertThat(entityInformation.isNew(sample), is(false));

        // @Id 에 다시 null 을 넣으면 newState 상태
        sample.setId(null);
        Assert.assertThat(entityInformation.isNew(sample), is(true));
    }

```

#### @Version
- 두번째는 Entity 필드에 @Version 이라는 것이 달려있는데 해당 필드가 null 이면 new 로 간주합니다. Version property 가 존재하고 다른 값을 가지고 있으면 new 가 아닙니다.
- 여기서 주의할게 Entity 에 @Version 이 들어가는 순간 @Version 값이 null 이고, @Id 에 값이 들어가도 newState 상태입니다.
    - 즉, @Version 이 들어가면 isNew 내부에서 @Id 를 newState 의 기준으로 사용하지 않습니다. 

```java

    @Test
    public void VERSION_ISNEW_테스트() throws Exception {
        EntityInformation<SampleWithVersion, Long> entityInformation =
                new JpaMetamodelEntityInformation<>(SampleWithVersion.class, entityManager.getMetamodel());

        SampleWithVersion sampleWithVersion = new SampleWithVersion();

        Assert.assertThat(entityInformation.isNew(sampleWithVersion), is(true));

        // version 에 값이 들어가는 순간 NewState 가 아님.
        sampleWithVersion.setVersion(1L);
        Assert.assertThat(entityInformation.isNew(sampleWithVersion), is(false));

        // version 에 null 들어가는 순간 newState
        sampleWithVersion.setVersion(null);
        Assert.assertThat(entityInformation.isNew(sampleWithVersion), is(true));

        // Entity 에 @Version 이 들어가는 순간 식별자에 값이 들어가도 newState 상태를 판별하지 못함.
        sampleWithVersion.setId(1L);
        Assert.assertThat(entityInformation.isNew(sampleWithVersion), is(false));
    }

```
    
    
- @Version 에 대해 간략히 설명하면, Entity 에서 Lock 을 잡고 싶을 때 Version 을 사용합니다.
- 아래 예제와 같이 where 를 통해 version 에 맞는 record 를 찾이 못할 경우 OptimisticLockException 을 발생시킵니다. (이미 다른 스레드가 변경했음)
    
```oracle-sql
update test 
set version + 1 
where version = #{version} 
``` 

#### Persistable
- 세번째는 Persistable interface 를 구현한 것입니다.
    - Persistable interface 는 getId(), isNew() method 를 제공하는 interface 입니다.
    - 즉, Persistable 을 구현한 Entity 는 구현한 isNew() method 에 따라 Entity 가 new 인지 아닌지를 판단합니다.
    - 아래 예시는 isNew 를 무조건 false 를 반환하는 예시입니다.
    
```java
@Entity
public class Test implements Persistable<Long> {
    @Override
    public Long getId() {
        return null;
    }

    @Override
    public boolean isNew() {
        return false;
    }
}
```    

- 여기서 주의할게 Entity 에서 Persistable 을 implement 하는 순간 @Id, @Version 은 isNew 를 구별할 수 있는 기준이 되지 않습니다.
- 아래 메소드는 EntityInformation 을 어떤 객체로 주입할지를 담당하는 메소드입니다.
- Persistable 을 구현하는 순간 isNew 는 Persistable 을 구현한 Entity 객체에서 판단합니다.
  
```java
	
    @SuppressWarnings({ "rawtypes", "unchecked" })
	public static <T> JpaEntityInformation<T, ?> getEntityInformation(Class<T> domainClass, EntityManager em) {

		Assert.notNull(domainClass, "Domain class must not be null!");
		Assert.notNull(em, "EntityManager must not be null!");

		Metamodel metamodel = em.getMetamodel();

		if (Persistable.class.isAssignableFrom(domainClass)) {
			return new JpaPersistableEntityInformation(domainClass, metamodel);
		} else {
			return new JpaMetamodelEntityInformation(domainClass, metamodel);
		}
	}

```



#### EntityInformation customize
- 네번째는 EntityInformation 을 customize 하는 것입니다. 세번째 항목과 유사하게 개발자가 customize 한대로 isNew 를 판단합니다.
- SimpleJpaRepository 에서 EntityInformation 을 빈 주입하게 설정돼있으니, 커스터마이징 하고 싶으면 아래 생성자에 customize 한 객체를 주입해주면 됩니다.

```java

	public SimpleJpaRepository(JpaEntityInformation<T, ?> entityInformation, EntityManager entityManager) {

		Assert.notNull(entityInformation, "JpaEntityInformation must not be null!");
		Assert.notNull(entityManager, "EntityManager must not be null!");

		this.entityInformation = entityInformation;
		this.em = entityManager;
		this.provider = PersistenceProvider.fromEntityManager(entityManager);
	}

``` 


## persist 와 merge 의 동작 원리

#### persist
- persist 는 입력받은 member 데이터를 가지고 insert 문을 바로 호출합니다.

```java
    
    // MemberApiController
    @PostMapping("/api/training3/members")
    public MemberResponse saveMember(@RequestBody @Valid MemberRequest request) {
        Member member = Member.create(request);
        Long memberId = memberService.saveMember(member);
        return new MemberResponse(memberId);
    }
    
    // Member.java
    public static Member create(MemberRequest request) {
        Member member = Member.builder()
                .name(request.getName())
                .telNo(request.getTelNo())
                .age(request.getAge())
                .build();
        return member;
    }
    
    // MemberService.java
    public Long saveMember(Member member) {
        Member result = memberRepository.save(member);
        return result.getId();
    }

```


#### merge
- 아래 예시를 보면 Member 데이터를 만들 때, ID (PK) 를 미리 입력하고 있습니다.

```java
     // MemberApiController
    @PostMapping("/api/training3/members")
    public MemberResponse saveMember(@RequestBody @Valid MemberRequest request) {
        Member member = Member.createContainsId(request);
        Long memberId = memberService.saveMember(member);
        return new MemberResponse(memberId);
    }
    
    // Member.java
    public static Member createContainsId(MemberRequest request) {
        Member member = Member.builder()
                .id(7L)
                .name(request.getName())
                .telNo(request.getTelNo())
                .age(request.getAge())
                .build();
        return member;
    }
    
    // MemberService.java
    public Long saveMember(Member member) {
        Member result = memberRepository.save(member);
        return result.getId();
    }
```

- 위와 같이 작성하고 실행했을 때, select 를 해서 데이터가 존재하는지 확인한 후, 없으면 insert 문이 동작하게 됩니다.
- insert 할 데이터가 많다면 성능 저하를 일으킵니다.

```text

2021-04-27 21:17:20.986 DEBUG 3932 --- [nio-8080-exec-2] org.hibernate.SQL                        : 
    select
        member0_.member_id as member_i1_1_0_,
        member0_.age as age2_1_0_,
        member0_.name as name3_1_0_,
        member0_.tel_no as tel_no4_1_0_ 
    from
        member member0_ 
    where
        member0_.member_id=?
2021-04-27 21:17:20.988 TRACE 3932 --- [nio-8080-exec-2] o.h.type.descriptor.sql.BasicBinder      : binding parameter [1] as [BIGINT] - [7]
2021-04-27 21:17:20.994 DEBUG 3932 --- [nio-8080-exec-2] org.hibernate.SQL                        : 
    call next value for hibernate_sequence
2021-04-27 21:17:20.999 DEBUG 3932 --- [nio-8080-exec-2] org.hibernate.SQL                        : 
    insert 
    into
        member
        (age, name, tel_no, member_id) 
    values
        (?, ?, ?, ?)

```


## 결론
- insert 할 때, 위에 4가지 isNew 조건을 확인해서 persist 로 동작하도록 만드는 것이 좋습니다.
- @Version, Persistable, EntityInformation customize 은 평소에 거의 쓰지 않으니 @Id 값이 null 또는 0인지만 판별하면 persist 로 동작하는 것을 알 수 있습니다. 

## Reference
- https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#reference
- https://stackoverflow.com/questions/2572566/java-jpa-version-annotation
- https://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/domain/Persistable.html