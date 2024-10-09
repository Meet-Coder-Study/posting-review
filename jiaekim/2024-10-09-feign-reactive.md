# Spring Cloud OpenFeign과Reactive-Feign (WebFlux)

## 0. 개요

> 왜 feign-reactive를 사용하려 하는가?

- 신규 프로젝트 중 WebFlux + Kotlin 으로 개발하는 프로젝트가 있음.
- 트래픽이 많은 API들이 있고 read 전용이라 webflux로 비동기 처리로 성능을 높이자고 결정됨.
- 팀내 다른 MSA 도메인군에는 OpenFeign과 서킷브레이커로 Resilience4j를 사용 중.
- 개발하는 신규 도메인에서 다른 도메인에 HTTP 통신으로 데이터를 받아와야함. 기존에는 OpenFeign을 사용하고 있다보니, WebClient 말고 Feign을 비동기로 사용할 수 있는 방식은 없는지 뒤져보는 중에 feign-reactive 프로젝트를 발견함.
- 개인적으로 webflux도 kotlin도 공부만 하고 프로젝트에 도입해보는건 처음이라 삽질 오지게 하는중.

## 1. OpenFeign이란?

Feign은 선언적 웹 서비스 클라이언트

즉, 웹 서비스 클라이언트를 쉽게 작성할 수 있도록 도와주는 역할을 담당 (어플리케이션간의 서비스 호출을 단순화하고 클라이언트 코드를 간결하게 유지할 수있음)

```java
@FeignClient("stores")
public interface StoreClient {
    @RequestMapping(method = RequestMethod.GET, value = "/stores")
    List<Store> getStores();

    @RequestMapping(method = RequestMethod.GET, value = "/stores")
    Page<Store> getStores(Pageable pageable);

    @RequestMapping(method = RequestMethod.POST, value = "/stores/{storeId}", consumes = "application/json")
    Store update(@PathVariable("storeId") Long storeId, Store store);
}
```

부가적인 기능을 제공함. 예를 들면 요청과 응답 로깅, 헤더. 설정, 에러 핸들링, 서킷브레이커 연동 등.

기타 부하 분산된 http 클라이언트 제공을 위해 eureka와 spring cloud loadbalancer를 통합함.

## 2. WebFlux

- Spring WebFlux는 반응형 프로그래밍(Reactive Programing) 방식을 통해 ‘이벤트 기반의 비동기식 애플리케이션’을 구축할 수 있는 프레임워크임.
- 반응형 스트림(Reactive Stream) - Publisher-Subscriber 패턴으로 데이터를 처리함.

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/7960517c-d800-4f90-ad44-7cda15f11a41/3f5eb803-cc5c-4a29-a92a-8bd53baaa636/image.png)

- 반응형 스트림 처리 과정
    1. subscribe
        1. Subscriber를 Publisher에 등록하고 데이터 스트림을 수신할 준비가 되었음을 Publisher에게 알린다.
    2. onSubscribe
        1. Publisher가 Subscriber에게 데이터 스트림을 전송 하기 전에 호출된다. 이. 메서드를 통해 subscriber는 subscription 객체를 받아들여 데이터 양을 제어할 수 있음.
    3. request(n) / cancel
        1. Publisher에게 n개의 데이터를 요청하고, cancel 메서드는 데이터 스트림을 취소함.
    4. onNext(data)
        1. Publisher가 생성한 데이터를 Subscriber에게 전달함. 이 메서드는 데이터가 전송할 때마다 호출됨.
    5. onComplete/onError
        1. Publisher가 모든 데이터를 전송하고, 더 이상 데이터가 없을 때 호출
        2. onComplete: 모든 데이터를 성공적으로 전달 완료
        3. onError: 데이터 전송 중 오류 발생
- Mono: Reactive Stream의 Publisher중 하나로 0개 혹은 1개의 데이터를 생성함. Mono를 사용해서 비동기적으로 결과를 반환하면 구독하는 클라이언트는 결과를 생성할 때까지 블로킹하지 않고 다른 작업 수행 가능
- Flux: Reactive Stream의 Publisher중 하나로 여러개의 데이터 항목을 생성함. 그 외에는 Mono와 동일함.
- 백프레셔(BackPressure): 비동기 스트림 처리에서 데이터 양을 제어하는 것. Publisher가 생성한 데이터를 Subscriber가 처리할 수 있는 데이터 양을 Subscription을 통해 제어하여 시스템의 안전성을 보장

## 3. WebClient란?

- Spring Framework 5부터 도입된 비동기식 HTTP 통신을 위한 클라이언트
- Non-Blocking I/O 모델을 기반으로 하며, 비동기 및 리액티브 스트림 처리 지원

```java
WebClient webClient = WebClient.create();
String url = "https://api.example.com/users/{id}";
Mono<User> userMono = webClient.get()
        .uri(url, 1)
        .retrieve()
        .bodyToMono(User.class);
```

## 4. Feign-Reactive

OpenFeign에서 WebClient와 같은 반응형 클라이언트 사용할 수 있도록 지원 (예정)
- https://cloud.spring.io/spring-cloud-openfeign/reference/html/#reactive-support

공식 라이브러리
- https://github.com/OpenFeign/feign/tree/master/reactive

비공식 라이브러리이지만 공식 홈에서는 지원전까지 아래 프로젝트 사용을 추천하고 있음.
- https://github.com/PlaytikaOSS/feign-reactive

```java
@Headers({ "Accept: application/json" })
public interface IcecreamServiceApi {

  @RequestLine("GET /icecream/flavors")
  Flux<Flavor> getAvailableFlavors();

  @RequestLine("GET /icecream/mixins")
  Flux<Mixin> getAvailableMixins();

  @RequestLine("POST /icecream/orders")
  @Headers("Content-Type: application/json")
  Mono<Bill> makeOrder(IceCreamOrder order);

  @RequestLine("GET /icecream/orders/{orderId}")
  Mono<IceCreamOrder> findOrder(@Param("orderId") int orderId);

  @RequestLine("POST /icecream/bills/pay")
  @Headers("Content-Type: application/json")
  Mono<Void> payBill(Publisher<Bill> bill);
}
```

## 6. 참고자료

- https://docs.spring.io/spring-framework/reference/web/webflux.html
- https://docs.spring.io/spring-framework/reference/web/webflux-webclient.html
- https://cloud.spring.io/spring-cloud-openfeign/reference/html/#spring-cloud-feign
- https://adjh54.tistory.com/232