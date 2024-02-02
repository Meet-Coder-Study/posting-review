
### 들어가기 전에

AOP가 어떤 로직을 기준으로 핵심적인 관점, 부가적인 관점으로 나누어서 보고 그 관점을 기준으로 모듈화하는 것을 안다는 정도로 알고있었고, 실제 개발에 적용해볼 기회가 없어서 상세하게 공부하는 것을 미뤘다가 도입해볼 기회가 생겨서 (최종적으로는 반영하지 않음), 무분별한 코드 복붙을 최소화해 학습한 것을 정리해보려고 한다.

인프런 강의가 생각보다 길어서 머리 속에 있는 실타래를 정리한다는 차원에서 정리했다.

# 프록시

> AOP가 어떻게 적용되는지를 알기 위해 프록시 패턴에 대해서 알아본다.

## 프록시란

`대리자`라는 뜻으로, 네트워크에서 클라이언트와 서버간의 중계역할로, 통신을 대리 수행하는 대리자를 말한다.

### 프록시의 주요 기능

- 접근 제어, 캐싱
- 부가 기능 추가 : 원래 서버가 제공하는 기능에 더해서 부가 기능을 수행한다.
- 프록시 체인 : 대리자가 또 다른 대리자를 부를 수 있고, 클라이언트는 대리자를 통해 요청했기 때문에 그 이후 과정은 모른다.

## 프록시 패턴

- GOF 디자인 패턴에서 프록시 패턴과 데코레터 패턴 둘 다 프록시를 사용하는 방법이지만 이 둘을 의도에 따라 구분한다.
- 프록시 패턴의 의도: 다른 개체에 대한 `접근을 제어`하기 위해 대리자를 제공
- 데코레이터 패턴의 의도: 객체에 추가 책임(기능)을 동적으로 추가하고, `기능 확장`을 위한 유연한 대안 제공

그러면 다음 부터 프록시를 어떻게 구현했는지 두 가지 방식을 알아보려고 한다.

### 인터페이스 기반 프록시

프록시 패턴 적용 전 의존 관계
![](https://velog.velcdn.com/images/kny8092/post/7e1d8795-24e9-44d1-be52-77d66e276595/image.png)
![](https://velog.velcdn.com/images/kny8092/post/acc32211-fdde-4def-ad75-fed65e8f129d/image.png)

프록시 패턴 적용 후 의존 관계
![](https://velog.velcdn.com/images/kny8092/post/79baca81-6555-49ba-8da8-52a77b726e8a/image.png)
![](https://velog.velcdn.com/images/kny8092/post/37774c43-e498-49c3-be86-4c0bf61de1da/image.png)
각 인터페이스에 맞는 프록시 구현체를 추가하고 이를 빈으로 등록하며, 프록시 구현체가 실제 구현체의 참조를 가지고 있는 구조다.

```java
@RequiredArgsConstructor
public class MyServiceInterfaceProxy implments MyService {
	
	private final MyService target;
    private final LogTrace logTrace;
    
    @Override
    public String do(){
    	logTrace.begin();
        String result = target.do(); // target을 호출
        logTrace.end();
        return result;
    }

}

@Configuration
public class InterfaceProxyConfig {
	
    @Bean
    public MyService myService(LogTrace logTrace){
 		MyServiceImpl serviceImpl = new MyServiceImpl(myRepository(logTrace));
        return new MyServiceInterfaceProxy(serviceImpl, logTrae);
    }
}
```

- 프록시를 생성하고 프록시를 실제 스프링 빈으로 등록하고, 실제 객체는 스프링 빈으로 등록하지 않는다.
- 이후 스프링 빈을 주입하면 실채 객체 대신 프록시 객체가 주입된다.
- 프록시는 내부에 실제 객체를 참조하고 있다.
- 프록시 객체는 스프링 컨테이너가 관리하고 자바 힙 메모리에도 올라간다.
- 반면 실제 객체는 자바 힙 메모리에는 올라가지만 스프링 컨테이너가 관리하지 않는다.

### 클래스 기반 프록시

인터페이스가 없고 구체 클래스만 있을 때 프록시를 적용하는 방식은 다음과 같다.

프록시 패턴 적용 전 의존 관계
![](https://velog.velcdn.com/images/kny8092/post/16d33032-7944-4902-9d30-aab559a304ad/image.png)


프록시 패턴 적용 후 의존 관계
![](https://velog.velcdn.com/images/kny8092/post/25409248-beca-4279-9ecc-9d0af8395aa9/image.png)
![](https://velog.velcdn.com/images/kny8092/post/d8faa6a9-a0f1-44dd-88fe-8b28e8ec30e0/image.png)

```java
@RequiredArgsConstructor
public class MyServiceProxy extends MyConcreteService {
	
	private final MyConcreteService target;
    private final LogTrace logTrace;
    
    @Override
    public String do(){
    	logTrace.begin();
        String result = target.do(); // target을 호출
        logTrace.end();
        return result;
    }

}
```
프록시 구현체에 참조로 정의한 형식이 인터페이스이고 구체 클래스를 주입하느냐, 참조 부터 구체 클래스이고 이를 바로 주입하냐의 차이다.

### 문제점

위에서 적용한 프록시는 기존 코드를 변경하지 않고 부가 기능을 적용하지만, 프록시 클래스를 너무 많이 만들어야한다.
프록시를 적용하는 클래스가 다를 뿐, LogTrace라는 하나의 부가 기능을 사용하고 있다.
프록시 클래스를 하나만 만들어 모든 곳에 적용하는 방식을 `동적 프록시`라고 한다.

## JDK dynamic proxy와 CGLIB

> 프록시의 로직은 동일하지만 어떤 메소드에 적용할 것인가가 다른 경우, 매번 프록시 클래스를 생성하지 않고 동적으로 런타임에 프록시 객체를 만드는 것을 동적 프록시라 한다.

JDK dynamic proxy와 CGLIB가 어디서 나온 이름인지 찾아보다가 [Spring 공식 문서](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)에서 다음과 같이 이야기하고있다.
> Spring AOP uses either JDK dynamic proxies or CGLIB to create the proxy for a given target object. JDK dynamic proxies are built into the JDK, whereas CGLIB is a common open-source class definition library 

- JDK (Java Development Kit)에서 제공하는 `java.lang.reflect.Proxy`, `java.lang.reflect.InvocationHandler` 를 사용하여 동적 프록시를 생성하는 것이며
- CGLIB는 open source library다.

### Reflection
- Reflection은 [이전에 정리](https://velog.io/@kny8092/TypeReference%EB%8A%94-%EC%99%9C-%ED%95%84%EC%9A%94%ED%95%9C%EA%B1%B8%EA%B9%8C)했으니 추가로 정리하지는 않았다.
- 요지는 공통화를 위해서 클래스/실행 할 메서드의 메타 정보를 가져와서 메서드를 호출한다.
- 주의할 점은 Reflection은 런타임에 동작하기 때문에, 컴파일 시점에 오류를 유의해야한다.

### JDK Dynamic proxy

- JDK 동적 프록시는 **인터페이스를 기반**으로 프록시를 동적으로 만들어준다.
- InvocationHandler 인터페이스를 구현한다.
```java
public interface InvocationHandler {
	public Object invoke(Object proxy, Method method, Object[] args) throws Throwable;
    // proxy : 프록시 자기 자신. method : 호출한 메서드. args : 메서드 전달인자
	// 부가 기능 및 method.invoke(target, args); 을 실행하도록 구현한다.
    // target : 자신이 호출할 대상 인스턴스로 예시에서 구현할 때는 생성자 주입을 해둠
}
```
- 앞서 본 예제들에서는 1개의 부가 로직 프록시 구현 클래스는 1개의 메인 로직 클래스를 위해 정의했다.
- JDK 동적 프록시의 경우, 1개의 부가 로직 프록시 구현 클래스(LogInvocationHandler)를 `정의`해 두면 N개의 메인 로직 클래스들(MyService, MyRepository, BookingService, BookingRepository.. etc)을 넣을 N개의 `프록시 구현 인스턴스` (LogInvocationHandler 인스턴스)를 **생성**해서 Proxy 객체를 만들면(Proxy.newProxyInstance) 된다.

```java
MyRepository myRepositoryTarget = new MyRepositoryImpl();
LogInvocationHandler handler1 = new LogInvocationHandler(myRepositoryTarget);

MyService myServiceTarget = new MyServiceImpl(myRepositoryTarget);
LogInvocationHandler handler2 = new LogInvocationHandler(myServiceTarget);

MyRepository repositoryProxy = (MyRepository) Proxy.newProxyInstance(MyRepository.class.getClassLoader(), new Class[]
{MyRepository.class}, handler1); // $Proxy1
MyService serviceProxy = (MyService) Proxy.newProxyInstance(MyService.class.getClassLoader(), new Class[]
{MyService.class}, handler2); // $Proxy2

// LogInvocationHandler라는 부가기능을 하나만 정의해두어도 기능이 필요한 곳의 동적 프록시를 생성해낼 수 있다.
repositoryProxy.findById(id);
serviceProxy.mapToHotel(id);
```
![](https://velog.velcdn.com/images/kny8092/post/4e3ea9aa-c14a-4c6b-a8fe-d4487978e7bd/image.png)
![](https://velog.velcdn.com/images/kny8092/post/8b1bdd04-52a1-4d19-8def-31a4624e5371/image.png)

[baeldung 예시](https://www.baeldung.com/java-dynamic-proxies)를 봐도 잘 나와있으니 긴 코드는 생략.

#### 한계

- JDK 동적 프록시는 인터페이스가 필수여서 클래스만 있는 경우에는 적용하기가 어렵다.


### CGLIB

- CGLIB를 사용하면 인터페이스가 없어도 구체 클래스만 가지고 동적 프록시를 만들어낼 수 있다.
- open source library이지만, spring framework에서 포함하고 있어 별도 라이브러리 추가 없이 사용할 수 있다.
- 앞서서는 InvocationHandler를 구현했다면, CGLIB에서는 MethodInterceptor를 구현하면 된다.
```java
public interface MethodInterceptor extends Callback {
     Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable;
     // obj : CGLIB가 적용된 객체, method : 호출한 메서드. args : 메서드 전달인자, proxy : 메서드 호출에 사용
     // target : 자신이 호출할 대상 인스턴스로 예시에서 구현할 때는 생성자 주입을 해둠
     // method.invoke를 해도 되지만 성능상 proxy.invoke를 권장한다.
}
```
![](https://velog.velcdn.com/images/kny8092/post/612cb393-bd3b-40f3-9f48-e1edd820f9a9/image.png)


[baeldung 예시](https://www.baeldung.com/cglib)에서 Enhancer를 사용해 프록시를 생성하는 과정이 잘 나와있어 사용하는 코드는 생략.

#### 한계

클래스 기반 프록시는 상속을 사용하기 때문에 몇가지 제약이 있다.
- 부모 클래스의 생성자를 체크해야 한다. CGLIB는 자식 클래스를 동적으로 생성하기 때문에 기본 생성자가 필요하다.
- 클래스에 `final` 키워드가 붙으면 상속이 불가능하다. CGLIB에서는 예외가 발생한다.
- 메서드에 `final` 키워드가 붙으면 해당 메서드를 오버라이딩 할 수 없다. CGLIB에서는 프록시 로직이 동작하지 않는다.

### 두 방식을 어떻게 나누어 적용할까

- 인터페이스가 있는 경우 JDK dynamic proxy를 적용하고, 구체 클래스만 있는 경우에는 CGLIB를 적용하려면 어떻게 해야할까 
- 조건에 따라 프록시 로직을 관리하는 **팩토리**를 사용해보자.

## 프록시 팩토리

> Spring은 동적 프록시를 통합해서 편리하게 만들어주는 프록시 팩토리를 제공한다.

![](https://velog.velcdn.com/images/kny8092/post/42cd4d3f-5372-455a-8998-7676fd28dc46/image.png)

- 앞서 JDK dynamic proxy는 InvocationHandler를, CGLIB는 MethodInterceptor를 implements 한 클래스를 만들어 부가 기능 로직을 정의해두었다.
- 그러면 프록시 팩토리에서도 InvocationHandler, MethodInterceptor 각각을 미리 정의해두어야할까?
- Spring은 부가 기능을 적용하기 위해 `Advice`를 만들어, **개발자가 Advice만 구현해두면** 프록시 팩토리에서 InvocationHandler, MethodInterceptor가 알아서 Advice를 호출하도록 해두었다. 
- Advice를 만들기 위해서는 다음 인터페이스를 구현한다.
```java
package org.aopalliance.intercept;

// ❌ not CGLIB MethodInterceptor, ⭕️ yes spring-aop MethodInterceptor
public interface MethodInterceptor extends Interceptor {

     Object invoke(MethodInvocation invocation) throws Throwable;
     // MethodInvocation : 내부에 다음 메서드를 호출하는 방법, 현재 프록시 객체 인스턴스, args , 메서드 정보 등 이전에 파라미터로 들어온 부분들이 다 뭉쳐있다.
     // invocation.proceed() 가 메인 메서드 실행 부분
}
```
- Advice라고 해놓고 왠 Interceptor인가 하면 상속 관계는 다음과 같이 되어있다.
![](https://velog.velcdn.com/images/kny8092/post/d765ace6-af48-4875-b7ef-0821030da751/image.png)

Advice 정의와 프록시 팩토리를 사용하는 부분도 코드는 검색하면 많으니까 생략.


# AOP

AOP를 사용하기 위해 부가 기능을 어떻게 실제 로직에 붙일까? ~~(앞에서 다 이야기함)~~

1. 컴파일 시점 (위빙)
    - 컴파일 시점에 AspectJ 컴파일러가 부가 기능 코드를 핵심기능 코드에 붙여버린다.
2. 클래스 로딩 시점(로드 타임 위빙)
    - .class를 JVM에 저장하기 전에 조작할 수 있는 기능을 사용한다.
3. 런타임 시점(프록시)
    - 실행이 된 다음에 자바 언어가 제공하는 범위 안에서 부가 기능을 적용
    - 스프링 빈에만 AOP를 적용할 수 있다.
    
특수한 컴파일러나 클래스 로더 조작기를 지정해서 조작하는 방식은 복잡하고 어렵다.
하지만 프록시를 사용하는 방식은 복잡한 설정 없이 Spring만 있으면 AOP를 적용할 수 있다.

그렇다면,
- Q1. Component Scan을 통해 Bean 등록을 지정한 클래스는 실제 메인 로직이 있는 클래스인데 어떻게 Proxy가 적용된걸까?
- Q2. Proxy를 어떤 클래스에, 어떤 부가 기능을 적용할지에 대한 Proxy 생성 코드가 있는 Config 파일은 등록할 spring bean 마다 전부 만들어야하는걸까?

이 질문들의 해답은 `빈 후처리기`이다.

## 빈 후처리기 (BeanPostProcessor)

> 스프링이 빈 저장소에 등록할 목적으로 생성한 객체를 빈 저장소에 등록하기 직전에 조작하고 싶을 때 사용한다.

![](https://velog.velcdn.com/images/kny8092/post/0528e485-1275-4124-ad0f-8421fe76aacc/image.png)

```java
public interface BeanPostProcessor {
    Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException
    Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException
}
```
### Spring bean 등록 과정 with 빈 후처리기
- Spring Bean으로 등록할 객체들을 생성한다
- Spring Bean 저장소에 등록 직전에 빈 후처리기에 전달한다.
- 빈 후처리기는 전달된 bean 객체를 **조작하거나 다른 객체로 바꿔치기**할 수 있다.
- 그대로 전달, 조작 또는 다른 객체로 바꿔치기해서 반환한 객체를 빈 저장소에 등록한다.

![](https://velog.velcdn.com/images/kny8092/post/03ccf19b-70c3-44d5-bd76-4bf2554712f5/image.png)

- 이 과정에서 **부가 기능이 필요한지 검사**(Q2의 해답) + **실제 로직이 있는 클래스 대신 Proxy으로 바꿔치기**(Q1의 해답) 하면서 빈에 등록되면서 별도로 프록시 생성 코드를 없앨 수 있다.

### Pointcut, Advice, Advisor

Spring이 제공하는 빈 후처리기를 설명하기 위해 잠깐 다음 3가지를 간단하게 설명한다.

- **Pointcut** : 어디에 부가 기능을 적용하고 적용하지 않을지 판단하는 필터링 로직
- **Advice** : 프록시가 호출하는 부가 기능
- **Advisor** : (포인트컷 1 + 어드바이스 1). Pointcut에 해당되지 않으면 Advice를 적용하지 않는다.

![](https://velog.velcdn.com/images/kny8092/post/cdfe08b3-2daa-4c09-9552-7b3ba58876da/image.png)

- 스프링은 여러 어드바이저 사용을 위해 여러 프록시를 생성하지 않도록, 하나의 프록시에 여러 어드바이저를 적용할 수 있도록 만들어 뒀다.
- **하나의 target에 여러 AOP가 동시에 적용되어도, 스프링 AOP는 target 마다 하나의 프록시만 생성한다.**

```java
ServiceInterface target = new ServiceImpl();
ProxyFactory proxyFactory = new ProxyFactory(target);

//가장 일반적인 Advisor 구현체. Pointcut과 Advice를 넣어준다. 
NameMatchMethodPointcut pointcut = new NameMatchMethodPointcut();
pointcut.setMappedNames("request*", "order*", "save*");
DefaultPointcutAdvisor timeAdvisor = new DefaultPointcutAdvisor(pointcut, new TimeAdvice());

DefaultPointcutAdvisor loggingAdvisor = new DefaultPointcutAdvisor(Pointcut.TRUE, new LoggingAdvice());

proxyFactory.addAdvisor(timeAdvisor);
proxyFactory.addAdvisor(loggingAdvisor);

ServiceInterface proxy = (ServiceInterface) proxyFactory.getProxy();
proxy.save();
```

![](https://velog.velcdn.com/images/kny8092/post/6e8af827-84b0-481b-8ac2-11a51e86fc2d/image.png)

### Spring이 제공하는 빈 후처리기

다음 라이브러리를 추가하면 **aspectJ** 관련 라이브러리를 등록하고, **자동 프록시 생성기**가 spring bot가 AOP 관련 클래스를 자동으로 Spring bean에 등록해준다.

`implementation 'org.springframework.boot:spring-boot-starter-aop'`


#### 자동 프록시 생성기의 작동 과정

![](https://velog.velcdn.com/images/kny8092/post/c86b51c6-0783-4e45-8ced-097a80201605/image.png)

- 스프링 애플리케이션 로딩 시점에 자동 프록시 생성기를 호출한다.
- 자동 프록시 생성기는 @Aspect가 있는 bean을 모두 찾는다.
- @Aspect Advisor builder를 통해 Advisor를 생성하고 Advisor builder 내부에 저장한다.

![](https://velog.velcdn.com/images/kny8092/post/b846d223-e5de-45e1-93d5-b45ff7fe2f18/image.png)
- 이후 Advisor를 기반으로 Pointcut을 사용해 프록시 적용 대상인지 확인하여 프록시를 생성한다.
  - 이때 클래스의 메서드들 중 하나만 Pointcut 조건을 만족해도 프록시 적용 대상이 된다.

> 포인트컷은 자동 프록시 생성기가 포인트 컷을 사용해 빈이 프록시를 생성해야할지 판단하기 위해 한번, 
프록시가 실제 호출 될 때 Advise를 적용할지 판단하는 단계에서 또 한번 사용된다.


자동 프록시 생성기 작동과정이 @Aspect 기준으로 설명해서 이해가 어려우면 @Aspect 내용을 한번 읽고 돌아오자.

**자동 프록시 생성기 덕분에 편하게 프록시를 적용할 수 있었고, 개발자는 Advisor만 빈으로 등록해주면 된다.**
그럼 이제 Advisor를 편하게 만드는 방법을 알아본다.

## @Aspect

- 스프링 애플리케이션에 프록시를 적용하려면 `Pointcut`과 `Advice`로 구성되어 있는 `Advisor`를 만들어 스프링 빈으로 등록하면 된다.
- 자동 프록시 생성기는 스프링 빈으로 등록된 Advisor들을 찾고, Spring bean들에 자동으로 프록시를 적용해준다.
- Spring은 `@Aspect` annotation으로 편리하게 Advisor 생성 기능을 지원한다.
- `@Aspect` 는 AOP을 가능하게 하는 AspectJ 프로젝트에서 제공하는 annotation 이다. 


```java
@Aspect
@Component // spring bean으로 등록해줘야한다.
public class LoggingAspect{
	private final Logging logging;
    
	@Around("execution(* hello.proxy.app..*(..))") // Pointcut 표현식
    public Object execute(ProceedingJoinPoint joinPoint) throws Throwable { // 해당 메소드가 Advice
    	logging.begin(); // 부가 로직
        Object result = jointPoint.proceed(); // 메인 로직. 실제 호출 대상을 호출
    	logging.end(); // 부가 로직
        return result;
    }
}

```

## AOP 관련 용어 정리

![](https://velog.velcdn.com/images/kny8092/post/695c5d5b-5048-49d9-bb6f-c64b8e21b464/image.png)


- Joinpoint
    - **어드바이스가 적용될 수 있는 위치**, 메소드 실행, 생성자 호출, 필드 값 접근
    - 추상적인 개념으로 AOP를 적용할 수 있는 모든 지점이라 생각하면 된다
    - 조인포인트는 항상 메소드 실행 지점으로 제한된다
- Pointcut
    - 조인 포인트 중에서 어드바이스가 적용될 위치를 선별
    - AspectJ 표현식을 사용해서 지정
- target
    - 어드바이스를 받는 객체. 포인트컷으로 결정
- Advice
    - 부가기능 그 자체
    - Around, Before, After 와 같은 다양한 종류의 어드바이스가 있음
- Aspect
    - Advice + Pointcut 모듈화
    - Advice를 어디(Pointcut)에 적용할 것인가? 로 생각하면 된다.
- Advisor
    - 하나의 어드바이스와 하나의 포인트 컷으로 구성
    - 스프링 AOP에서만 사용되는 용어
- Weaving
    - pointcut으로 결정한 타겟의 조인 포인트에 어드바이스를 적용하는 것

## Advice

Around를 제일 많이 사용하고 그 다음으로 Before인 것 같아, 간단한 특징과 처리되는 순서만 정리한다.

- `Around`
    - joinPoint 실행 여부를 선택할 수 있다.
    - 파라미터가 ProceedingJoinPoint
    - **proceed()에 argument를 다른걸 전달할 수 있다.**
        - joinPoint.proceed(args[])
    - **반환 값 변환, 예외 변환을 결정할 수 있다.**
    - proceed() 호출을 0 ~ N번 할 수 있다.
- `Before`
    - 파라미터가 JoinPoint
    - **작업의 흐름을 변경할 수 없다**
    - 메서드 종료 시 자동으로 다음 타겟이 호출된다.
    - 예외 발생 시 다음코드 호출되지 않음
- `After Returning`
    - returning = “리턴값 이름” → 파라미터에 Object “result”
    - returning 절에 지정된 타입의 값을 반환하는 메서드만 대상으로 실행한다.
    - return 하는 객체를 바꾸려면 Around를 사용해야 한다.
        - 굳이 객체 내부를 조작하려면 setter로는 가능하다
- `After Throwing`
- `After`
- @Around만 parameter가 ProceedingJoinPoint를 사용할 수 있고, 나머지는 JoinPoint
  - 상속 관계 : `public interface ProceedingJoinPoint extends JoinPoint {}`
  - ProceedingJoinPoint는 proceed()로 다음 어드바이스나 타켓을 호출할 수 있다.
- @Around만 joinPoint 메서드의 req, res를 조작할 수 있다. 

### 실행 순서

- 어드바이스는 기본적으로 순서를 보장하지 않는다.
- 만약 @Aspect 단위로 순서를 지정하려면 @Order(순위) 를 지정한다.
- 동일한 @Aspect안에서 동일한 Joinpoint의 실행 순서는 아래와 같다.
![](https://velog.velcdn.com/images/kny8092/post/43725d30-20b7-4414-b82f-7dedfbd49764/image.png)

### Around 외에 다른 어드바이스가 있는 이유

- `@Around` 가 가장 넓은 기능을 제공하는 것은 맞지만, 실수할 가능성이 있다.
- 예시) Around에서 joinPoint.proceed() 호출을 누락한 경우
- 반면에 `@Before` , `@After` 같은 Advice는 기능은 적지만 실수할 가능성이 낮고, 코드도 단순하다.
- 가장 중요한 점은 **코드를 작성 한 의도가 명확하게 드러난다**


## Pointcut

`@Around` 에 포인트컷 표현식을 직접 넣을 수 도 있지만, `@Pointcut` 애노테이션을 사용해서 별도로 분리할 수 도 있다.
포인트컷 표현식은 execution과 같은 포인트컷 지시자로 시작한다.

```java
@Aspect
public class MyAspect{
	@Pointcut(execution(* hello.aop.member.*.*(..)))
    private void allMember(){} // 포인트컷 시그니쳐 : allMember(), 반환 타입은 void여야하며 코드 내용은 비워둔다.
    
    @Pointcut(execution(public *(..)))
    private void allPublic(){}
    
    @Around("allMember() && allPublic()") // 포인트컷 시그니쳐 사용하면서 조합 할 수 있다 ( &&, ||, !)
    public Object doLog(ProceedingJoinPoint joinPoint) throws Throwable {
         log.info("[log] {}", joinPoint.getSignature());
         return joinPoint.proceed();
    }

}
```
### execution

- 메소드 실행 조인 포인트를 매칭한다. 스프링 AOP에서 가장 많이 사용하고, 기능도 복잡하다.
- `execution(접근자? 반환타입 선언타입?메서드이름(파라미터) 예외?)`
    - ? 은 생략 가능
    - 제일 많이 생략한 포인트컷 : `execution(* *(..))` -> 반환 타입과 메서드 이름이 상관없고 파라미터 타입과 파라미터가 몇 개이던 상관없다는 뜻
    
#### pattern matching

처음에 AOP Pointcut 보고 이게 무슨 외계어인가 했는데 패턴 매칭 규칙을 간단하게 알아본다.

- ex) 메서드 명 패턴 hell로 시작하는 것 → `execution(* hell*(..))`
  - *을 앞 뒤에 넣을 수 있음
- 특정 패키지 내부의 모든 클래스/메소드 → `execution(* hello.aop.member.*.*(..))`
- 더 하위 패키지 까지 다 일치하려면 → `execution(* hello.aop.member**..***.*(..))`
- 상위 타입 매칭 → `execution(* hello.aop.member.MemberService.*(..))`
  - 부모를 적어도 자식도 매칭 알아서 된다
  - 부모에는 없고 **자식 클래스에만 있는 메소드는 못찾음**
- 파라미터 1개 허용 → `execution(* *(*))`
- 첫 번째 파라미터가 String이고 뒤는 상관 없다 → `execution(* *(String, ..))`
    
### within

- 해당 타입이 매칭되면 그 안에 메서드들이 자동으로 매칭된다
- `within(hello.aop.member.MemberServiceImpl)`
- 표현식에 정확하게 타입이 맞아야하기 때문에 부모를 적어둬도 자식 타입과 매칭되지 않는다.
    - 인터페이스 선정하지 말것
- 실무에서는 execution을 더 많이 사용하는 듯함.

### args

- 인자가 주어진 타입의 인스턴스인 조인 포인트
- 기본 문법은 execution과 같다.
- execution은 파라미터 타입이 정확히 매칭되어야하는데, **args는 부모 타입을 허용**한다.
- args(String), args(Object), args(), args(..), args(*), args(String, ..)
- args는 런타임에 전달된 인수로 판단하기 때문에 동적이다.
- 파라미터 바인딩에서 주로 사용하는 지시자

### @annoatation
- 메서드가 주어진 애노테이션을 가지고 있는 조인 포인트를 매칭
- 메소드 앞에 붙여두니 직관적으로 AOP가 적용되는걸 알 수 있어서 좋았다.
- 예시 코드는 [Baeldung 참고](https://www.baeldung.com/spring-aop-annotation)

### etc

- 이 외에도 this, target, @target, @within, @args, bean이 있다.
- 실무에서 잘 사용되지 않아 정리는 생략

### 매개 변수 전달

- 다음 포인트컷 표현식을 사용해서 어드바이스에 매개변수를 전달할 수 있다.
    - this, target, args,@target, @within, @annotation, @args

```java
@Around("allMember() && args(arg,..)")
public Object logArgs2(ProceedingJoinPoint joinPoint, BookInfo arg) throwsb Throwable {
    log.info("[logArgs2]{}, arg={}", joinPoint.getSignature(), arg);
    return joinPoint.proceed();
}
```

## 내부 호출 문제

- 대상 객체의 내부에서 메서드 호출이 발생하면 프록시를 거치지 않고 객체를 직접 호출하는 문제가 발생한다.
- 자바에서 메서드 앞에 별도의 참조가 없으면 this 라는 뜻으로 자기 자신의 인스턴스를 가리킨다
- 결과적으로 자기 자신의 내부 메서드를 호출할 때, this는 실제 대상 객체의 인스턴스를 뜻한다.
- 결과적으로 이런 내부 호출은 프록시를 거치지 않아 어드바이스도 적용할 수 없다.

~~AOP 내부 호출이 안된다는건 @Transactional 때문에 알고는 있었는데, 입사해서 코드 파악하다가 @Transactional이 붙어있는 메서드인데 외부에서 호출하는 것이 아닌 내부에서만 호출하고 있는 코드를 목격한 적 있다. ㅇㅅㅇ~~ 

아무튼 이 부분 때문에 팀장님께 private method에 @Transactional 어떻게 적용하는게 좋을지 여쭤본 적있는데 강의에서 권장하는 방식 처럼 구조를 변경하는 방식을 추천해주셨다.


# 마무리하며

강의 자체도 길다보니 중간에 핵심 부분은 노션에 정리했지만, 그래도 머릿속에 뭐가 있긴한데..ㅁㄴㅇㄹ 상태였다.
내용이 많아도 학교다닐 때 A4에 정리하던 것 처럼 했더니, 강의의 길었던 내용들이 생각안날 때 이 포스팅 읽어봐도 빨리 리마인드가 될 것 같다.
더 필요한 문법은 공식문서 찾아보자.

~~학교다닐 땐 전과목을 이렇게 정리하고 모아둠~~

<img src="https://velog.velcdn.com/images/kny8092/post/e0a38761-cc31-4ddd-9227-cb8e164decc5/image.png" width="20%" height="20%">



---
참고
인프런 스프링 핵심원리-고급편
Baeldung
