# Overview

이벤트(event)라는 용어는 '과거에 벌어진 어떤 것'을 의미한다. 이벤트가 발생한다는 것은 상태가 변경됐다는 것을 의미한다. 이벤트를 활용하기 위해서는 이벤트에 반응하여 원하는 동작을 수행하는 기능을 구현해야 한다.

이벤트는 기본적으로 이벤트 생성 주체 -> 이벤트 디스패처(이벤트 퍼블리셔) -> 이벤트 핸들러(이벤트 구독자)로 구성되어있다. 이벤트 핸들러는 생성 주체가 발생한 이벤트에 반응하며 이벤트를 생성주체한테 전달받아 이벤트에 담긴 데이터를 이용해서 원하는  기능을 실행한다. 이벤트 생성 주체와 이벤트 핸들러를 연결해 주는 것이 이벤트 디스패처이다. 이벤트 생성 주체는 이벤트를 생성해서 디스패처에 이벤트를 전달하고 디스패처는 해당 이벤트를 처리할 수 있는 핸들러에 이벤트를 전달한다.

스프링에서 제공하는 `ApplicationEvent`는 시스템간의 강결합을 느슨하게 만들어줄 수 있는 좋은 도구다. `ApplicationEvent`는위에서 언급한 이벤트가 될 것이고 `applicationEventPublisher`로 이벤트를 발행하며 `ApplicationEventListener` 로 핸들링할 수 있다.

스프링 4.2부터 `@EventListner`가 나오면서 이벤트를 발행하고 핸들링하기가 매우 간편해졌다. 아래와 같이 사용할 수 있다. 

```kotlin
@Service
@Transactional
class MemberService(
    private val memberRepository: MemberRepository,
    private val applicationEventPublisher: ApplicationEventPublisher
) {

    fun registerProcess(registerMemberRequestData: RegisterMemberRequestData): RegisterMemberResponseData {
	// 1. 회원 등록
        val savedMember = register(registerMemberRequestData)
				
	// 2. 회원 등록 이벤트 발행
	val registeredMemberEvent = RegisteredMemberEvent(savedMember.id!!, savedMember.email!!)
	applicationEventPublisher.publishEvent(registeredMemberEvent)

	return RegisterMemberResponseData(memberId = savedMember.id)
     }

    private fun register(requestData: RegisterMemberRequestData): Member {
        val newMember = Member(nickname = requestData.nickname, email = requestData.email)
        return memberRepository.save(newMember)
    }
}
```

```kotlin
@Component
class MemberEventHandler(
    private val mailService: MailService
) {
    @EventListener
    fun sendSuccessMail(registeredMemberEvent: RegisteredMemberEvent) {
        mailService.sendSuccessRegisteredMemberMail(registeredMemberEvent.memberId, registeredMemberEvent.email)
    }
}
```

지금은 서비스 로직에 `applicationEventPublisher`를 주입하여 발행을 하고 있다. 하지만 POJO로 풍부한 도메인 모델(Rich Domain Model)을 구현하거나 JPA Entity에 선언된 메서드에서 Event를 발행하려면 어떻게 해야할까?

소개드릴 방법 4가지가 있다.

# `ApplicationEventPublisher`를 인자로 넘기기

메서드를 사용하는 시점은 런타임 시점일 것이다. 빈이 등록된 객체에서 applicationEventPublisher를 주입하여 사용하면 된다.

```kotlin
@Service
@Transactional
class MemberService(
    private val memberRepository: MemberRepository,
    private val applicationEventPublisher: ApplicationEventPublisher
) {
	fun updateNickname(memberId: Long) {
	    val member = memberRepository.findById(memberId).orElseThrow()
	    member.updateNickname("수정", applicationEventPublisher)
	}
}
```

```kotlin
@Entity
class Member(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column(columnDefinition = "varchar(20)")
    var nickname: String? = null,
    val email: String? = null
) {

    fun updateNickname(newNickname: String, applicationEventPublisher: ApplicationEventPublisher) {
        this.nickname = newNickname
        applicationEventPublisher.publishEvent(UpdateMemberEvent(memberId = this.id!!, nickname = newNickname))
    }
}
```

하지만 이 방식은 POJO 도메인 모델 혹은 JPA Entity에 스프링 프레임워크의 ApplicationEventPublisher 의존성을 추가하게 된다. 따라서 이 객체를 단위 테스트하기 위해서 테스트 대역(Test Double)을 사용해야만 한다. 

# `@DomainEvents` 사용

스프링 빈을 파라미터로 넘기는 로직은 한정적일 수 있다. 이벤트를 발행해야하는 로직마다 메서드에 인자 타입으로 추가를 해줘야하며 이 도메인을 사용하는 스프링 빈 객체에서도 빈 주입을 해야한다. 도메인 로직 내부에서 이벤트를 발행할 수 있는 방법이 있다.

Spring Data의 @DomainEvents를 활용하는 방법이다.

```kotlin
@Entity
class Member(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column(columnDefinition = "varchar(20)")
    var nickname: String? = null,
    val email: String? = null
) {

    @Transient
    private val domainEvents: MutableList<Any> = ArrayList()

    fun updateNickname(newNickname: String) {
        this.nickname = newNickname
        domainEvents += UpdateMemberEvent(memberId = this.id!!, nickname = newNickname)
    }

    @DomainEvents
    fun domainEvents(): MutableList<Any> {
        return domainEvents
    }

    @AfterDomainEventPublication
    fun clearDomainEvents() {
        domainEvents.clear()
    }
}
```

```kotlin
@Entity
class Member(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column(columnDefinition = "varchar(20)")
    var nickname: String? = null,
    val email: String? = null
) {

		fun updateNickname(memberId: Long) {
        val member = memberRepository.findById(memberId).orElseThrow()
        member.updateNickname("수정")
        memberRepository.save(member)
    }
}
```

이렇게 `@DomainEvents`를 활용해서 발행하는 방법이 있다. 이렇게 발행한 또한 이 이벤트를 발행하는 trigger 역할하는 메서드가 JpaRepository의 save() 메서드이다.

[Spring Data JPA - Publishing Domain Events When Changing an Entity](https://thorben-janssen.com/spring-data-jpa-domain-event/)

`EventPublishingRepositoryProxyPostProcessor`의 설명 문서를 보면

> RepositoryProxyPostProcessor to register a MethodInterceptor to intercept CrudRepository.save(Object) and CrudRepository.delete(Object) methods and publish events potentially exposed via a method annotated with DomainEvents. If no such method can be detected on the aggregate root, no interceptor is added. Additionally, the aggregate root can expose a method annotated with AfterDomainEventPublication. If present, the method will be invoked after all events have been published.
> 

save와 delete 메서드를 사용할 때 프록시 객체는 `EventPublishingMethodInterceptor`를 통해  `ApplicationEventPublisher` 를 주입받아 이벤트를 발행함을 알 수 있다.

다만 `DomainEvents`는 조금 복잡한 보일러 플레이트 코드를 매번 작성해줘야한다는 단점이 있다. 이를 깔끔하게 해결해주는 객체가 있다.

# `AbstractAggregateRoot<T>` 객체 사용

`AbstractAggregateRoot<T>` 를 상속받은 Entity는 간단한 reigsterEvent() 메서드만으로도 이벤트를 발행할 수 있다.

```kotlin
@Entity
class Member(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column(columnDefinition = "varchar(20)")
    var nickname: String? = null,
    val email: String? = null
) : AbstractAggregateRoot<Member>() {

    fun updateNickname(newNickname: String) {
        this.nickname = newNickname
        registerEvent(UpdateMemberEvent(memberId = this.id!!, nickname = newNickname))
    }
}
```

내부 로직을 보면 위에 작성한 로직과 동일함을 알 수 있다.

```kotlin
public class AbstractAggregateRoot<A extends AbstractAggregateRoot<A>> {

	private transient final @Transient List<Object> domainEvents = new ArrayList<>();

	/**
	 * Registers the given event object for publication on a call to a Spring Data repository's save methods.
	 *
	 * @param event must not be {@literal null}.
	 * @return the event that has been added.
	 * @see #andEvent(Object)
	 */
	protected <T> T registerEvent(T event) {

		Assert.notNull(event, "Domain event must not be null");

		this.domainEvents.add(event);
		return event;
	}

	/**
	 * Clears all domain events currently held. Usually invoked by the infrastructure in place in Spring Data
	 * repositories.
	 */
	@AfterDomainEventPublication
	protected void clearDomainEvents() {
		this.domainEvents.clear();
	}

	/**
	 * All domain events currently captured by the aggregate.
	 */
	@DomainEvents
	protected Collection<Object> domainEvents() {
		return Collections.unmodifiableList(domainEvents);
	}

...
}
```

다만 자바는 다중 상속이을 지원하지 않기 때문에 BaseEntity, AuditEntity 처럼 추상화된 Entity가 있을 경우 부분적으로 Event를 사용하기가 번거로울 수 있다. 그리고 이 로직 또한 JpaRepository의 save(), delete() 메서드가 이벤트를 발행하는 trigger가 된다. 그러면 더티체킹을 사용하거나 임의로 이벤트를 발생시킬 때는 이 로직을 사용할 수 없다. 어떻게 이 문제를 해결해야할까?

# `ApplicationEventPublisher`를 static 변수에 담아서 사용

다양한 방법이 있다. dirty checking이 일어나는 로직에 AOP를 걸어준다던가, 커스텀 어노테이션을 추가해주던가. 하지만 근본적으로 `ApplicationEventPublisher`를 사용하기에 이를 전역적으로 사용할 수 있게 static 변수에 담아주는 로직을 선택했다.

내용은 ‘도메인주도개발 시작하기’ 책의 예제를 가져왔다.

```kotlin
object Events {
    private lateinit var applicationEventPublisher: ApplicationEventPublisher

    fun setPublisher(applicationEventPublisher: ApplicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher
    }

    fun raise(event: Any) {
        this.applicationEventPublisher.publishEvent(event)
    }
}
```

```kotlin
@Configuration
class EventsConfiguration(
    private val applicationContext: ApplicationContext
) : InitializingBean {

    override fun afterPropertiesSet() {
        Events.setPublisher(applicationContext)
    }
}
```

```kotlin
@Entity
class Member(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column(columnDefinition = "varchar(20)")
    var nickname: String? = null,
    val email: String? = null
) : AbstractAggregateRoot<Member>() {

    fun updateNickname(newNickname: String) {
        this.nickname = newNickname
        Events.raise(UpdateMemberEvent(memberId = this.id!!, nickname = newNickname))
    }
}
```

여기서 우리는 어떤 문제를 예상할 수 있을까? 스프링 빈 객체는 stateless하게 만들기 때문에 여러 스레드에 공유하는 static 변수에 담아두어 사용해도 큰 문제가 발생하지 않을 것 같다. 다만 이러한 변수의 메모리는 jvm method area에 저장되므로 주의해야 한다.

[ServletContainer와 SpringContainer는 무엇이 다른가?](https://sigridjin.medium.com/servletcontainer와-springcontainer는-무엇이-다른가-626d27a80fe5)
