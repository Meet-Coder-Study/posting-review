# Spring cloud sleuth
## 1. Sleuth? 
시스템 로그로 디버깅을 할 때, 확인하려는 메서드가 비동기로 호출되거나 멀티 스레드로 동작 한다면 히스토리를 추적하기 무척 어려울 것이다.

이때 Spring cloud sleuth 를 사용한다면 좀 더 편리한 로깅 환경을 제공 받을 수 있다.

먼저, Spring cloud sleuth 가 무엇인지 공식 문서를 통해 확인해보자.

<img width="800" src="https://user-images.githubusercontent.com/60383031/140541697-a575394d-8000-4491-be41-b5ebe9680a97.png">

공식 문서에서는 Sleuth 를 사용하면 요청과 메시지들을 추적할 수 있게 해준다고 적혀있다.

이를 통해 요청에 대한 히스토리를 연관 시킬 수 있다고 소개하고 있다. 

이러한 기능은 Microservice architecture 에서 사용하였을 때 정말 유용하다고 할 수 있다.

<img width="800" src="https://user-images.githubusercontent.com/60383031/141467816-5c7da27f-d17b-4e3a-a3a6-4193b6d43011.png">

위 그림을 보면, 각각의 서버는 요청을 보낼 때 추적 정보를 보내는 것을 볼 수 있다.

각 정보는 Protocol 의 Header 를 통해 전달하며, 정보를 수신한 서버는 다음 서버에게 동일한 정보를 제공하는 방식으로 요청 흐름을 추적할 수 있다.


<br>

## 2. 구성 요소

<img width="800" src="https://user-images.githubusercontent.com/60383031/140540840-771c2ade-effd-4754-a23f-2616c0b1e0e5.jpeg">

#### (1) Trace Id 
전체 작업에 할당된 ID 이다.

작업은 각각의 작은 단위들로 구성되어 있다고 한다면, 각각의 작은 단위들은 공통의 Trace ID 를 갖고 있다.


#### (2) Span Id
각각의 작은 단위들이 가지고 있는 ID 이다.

모두 서로 다른 ID 를 가지고 있기 때문에 서로 다른 작업 단위들을 구분해주는 역할을 할 수 있다.




<br>

## 3. 예제 
이제 어플리케이션에 Spring cloud sleuth 를 적용하여 로깅이 어떻게 변하는지 확인하려고 한다.

테스트는 싱글 어플리케이션으로 진행하였고, 두 가지 케이스를 통해 로깅이 어떤식으로 되는지 살펴보자.

<br>

#### Case 1. 싱글 스레드

예제 코드
```java
@Slf4j
@RestController
public class HelloController {
  
  @GetMapping("/hello")
  public String helloSleuth() {
    log.info("Hello sleuth");
    log.info("Bye sleuth");
    
    return "ok";
  }

}
```

<br>

실행 결과

<img width="800" src="https://user-images.githubusercontent.com/60383031/140612802-448f733e-e083-4c7c-9af5-0b011bc3fd8d.png">

어플리케이션을 실행시키고 GET /hello 를 호출했을 때 위의 결과 처럼 로깅이 되는 것을 볼 수 있다.

출력 된 로그는 순서대로 어플리케이션 이름, Trace ID, Span ID 이다.

위 예제에서는 Trace ID 와 Span ID 가 동일한 것을 볼 수 있다.


<br>

#### Case 2. 두개 이상의 스레드

```java
@Slf4j 
@RequiredArgsConstructor
@RestController
public class TestController {

  private final Executor executor;

  @GetMapping("/new-thread")
  public String newThread() {
    log.info("create newThread");

    Runnable runnable = () -> {
      log.info("I'm inside the new thread");
    };
    executor.execute(runnable);

    log.info("I'm done");

    return "ok";
  }
}
```

<img width="800" src="https://user-images.githubusercontent.com/60383031/140612761-11392181-2134-4cd4-a4c0-5659d34d37ed.png">

어플리케이션을 실행시키고 GET /new-thread 를 호출했을 때 위의 결과 처럼 로깅이 되는 것을 볼 수 있다.

살펴보아야할 점은 서로 다른 thread 에서 실행되고 있지만, Trace ID 는 동일하다는 것을 볼 수 있다.

즉, MSA 환경이 아닌 모놀리스 방식의 싱글 어플리케이션이라도 Sleuth 를 적용한다면 각 요청의 흐름을 추적하기에 많은 도움을 받을 수 있다.


<br>

## 참고
https://happycloud-lee.tistory.com/216

https://dzone.com/articles/tracing-in-microservices-with-spring-cloud-sleuth

https://engineering.linecorp.com/ko/blog/line-ads-msa-opentracing-zipkin/

https://www.studytonight.com/post/request-tracing-in-microservices-using-spring-cloud-sleuth-andzipkin

https://refactorfirst.com/distributed-tracing-with-spring-cloud-sleuth.html

https://www.baeldung.com/spring-cloud-sleuth-single-application

https://docs.spring.io/spring-cloud-sleuth/docs/current/reference/html/getting-started.html#getting-started