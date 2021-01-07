# WebClient VS RestTemplate

## RestTemplate이란?

![resttemplate-vs-webclient-1](https://github.com/ksy90101/TIL/blob/master/spring/img/resttemplate-vs-webclient-1.png?raw=ture)

- Spring은 오랫동안 웹 클라이언트 추상화로 RestTemplate을 제공하고 있었습니다.
- 내부적으로 RestTemplate은 요청 당 스레드 모델을 기반으로 하는 Java Servlet API를 사용합니다.
- 이 의미는 웹 클라이언트가 응답을 받을 때 까지 스레드가 차단되는데, 여기서 문제점은 각각의 스레드가 일정량의 메모리와 CPU를 사용합니다.
- 이때, 결과를 기다리는 느린 서비스를 기다리는 수신 요청이 많다고 한다면 요청이 쌓이고 많은 스레드를 생성해서 스레드 풀을 소모하거나 사용 가능한 모든 메모리를 차지하게 될 것입니다. 또한 빈번한 Context Switch을 통해 성능 저하가 발생할 수 있습니다.
- 가장 쉽게 생각하면 응답이 올때까지 다음 행동을 절대 처리 못한다는 의미라고 생각하면 될거 같습니다.

### Deprecated된 이유는?

- 사진에 있는 Java Docs를 확인하면 RestTemplate은 WebClinet로 대체된것으로 보인다.
- 자바 Docs을 확인해보면 Spring 5.0부터 RestTemplate은 향후 변경 및 버그에 대한 간단한 것만 처리한다고 적혀 있습니다.
- 아울러 좀 더 현대적이고 동기화, 비동기, 스트리밍을 지원하는 WebClient를 사용하라고 권장하고 있습니다.

[RestTemplate (Spring Framework 5.3.2 API)](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/client/RestTemplate.html)

- 사실 지금 위의 사진과 Javadoc에서도 봤듯이 Deprecated가 된것은 아닙니다. 그러나 현재 WebClient를 사용하라고 권장하고 있어 많은 개발자들이 Deprecated 될 예정이지 않을까 라는 추측을 하고 있는 상태입니다.
- 그러나 RestTemplate도 Spring 4부터 비동기 방식을 지원했었는데, AsyncRestTemplate라는 객체입니다. 그러나 이 객체는 현재 완전히 Deprecated 된 상태입니다.

### 그렇다면 WebClient로 변경하는것이 좋은가?

- 말씀드렸듯이 Spring5에서는 현재 Deprecated가 되지 않았고, 간단한 버그나 변화같은 경우는 계속해서 업데이트를 할 예정이라고 한다. 따라서 굳이 잘 쓰고 있는 RestTemplate을 변경하지 않아도 된다고 개인적으로 생각한다. 그러나 향후 미래를 생각하거나, 또한 새롭게 작성하는 코드는 WebClient를 이용해 작성하는 것을 더 권장하는 바이다.

## WebClient

- Spring Reactive Framework에서 제공하는 비동기식 비 차단 방식을 사용합니다.
- RestTemplate과 다른 점은 RestTemplate은 스레드를 사용하지만, WebClient는 각 이벤트에 대한 "작업"과 같은 것을 만들어 놓습니다. 즉, 이벤트 기반 아키텍쳐를 사용하게 되는데, 결과적으로 동기 / 차단 방식에 비해 더 적은 스레드와 시스템 리소스를 사용하면서 더 많은 로직을 처리할 수 있습니다.
- 아울러 또한 위에서 설명한 Non-Blocking뿐만 아니라 Blocking도 지원합니다.

## 성능차이

- 실제 코드를 보면서 성능 차이를 살펴보도록 하겠습니다.
- 간단한 테스트를 위해 아래와 같이 API를 만들도록 하겠습니다. 각자 5초, 3초를 걸릴수 있도록 아래와 같이 Thread.sleep()을 사용했습니다.

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/hello")
    public String hello() throws InterruptedException {
        Thread.sleep(5000);

        return "Hello";
    }

    @GetMapping("world")
    public String world() throws InterruptedException {
        Thread.sleep(3000);

        return "World";
    }
}
```

### RestTemplate 1번 호출

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StopWatch;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AppRunner.class);

    private final RestTemplateBuilder restTemplateBuilder;

    public AppRunner(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplateBuilder = restTemplateBuilder;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        RestTemplate restTemplate = restTemplateBuilder.build();

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();

        String helloResult = restTemplate.getForObject("http://localhost:8080/hello", String.class);
        log.info(helloResult);

        String worldResult = restTemplate.getForObject("http://localhost:8080/world", String.class);
        log.info(worldResult);

        stopWatch.stop();

        log.info("{}", stopWatch.prettyPrint());
    }
}
```

- 애플리케이션 구동 중에 확인할 수 있도록 AppRunner를 사용했습니다.

```java
---------------------------------------------
ns         %     Task name
---------------------------------------------
8112640209  100%
```

- 실제 8초가 걸리는걸 확인할 수 있습니다.

## RestTemplate 100번 호출

- 실제 100번을 호출한다면 8초는 너무 길기 때문에 0.5초, 1초로 변경해서 돌려보도록 하겠습니다.

```java
@Override
public void run(ApplicationArguments args) throws Exception {
    RestTemplate restTemplate = restTemplateBuilder.build();

    StopWatch stopWatch = new StopWatch();
    stopWatch.start();

    for (int i = 0; i < 100; i++) {
        String helloResult = restTemplate.getForObject("http://localhost:8080/hello", String.class);
        log.info(helloResult);

        String worldResult = restTemplate.getForObject("http://localhost:8080/world", String.class);
        log.info(worldResult);

    }
    stopWatch.stop();

   log.info("{}", stopWatch.prettyPrint());
}
```

- 간단하게 for문을 이용했습니다.

```java
---------------------------------------------
ns         %     Task name
---------------------------------------------
151319590405  100%
```

- 이와 같이 1500 * 100 정도의 시간이 걸리는걸 확인할 수 있습니다.

### WebClient 호출 - 1회 호출

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StopWatch;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Configuration
public class AppRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AppRunner.class);

    private final WebClient.Builder webClientBuilder;

    public AppRunner(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        WebClient webClient = webClientBuilder.build();

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();

        Mono<String> helloMono = webClient.get().uri("http://localhost:8080/hello")
                .retrieve().bodyToMono(String.class);
        helloMono.subscribe(s-> {
            log.info(s);
            if(stopWatch.isRunning()){
                stopWatch.stop();
            }
            log.info(stopWatch.prettyPrint());
            stopWatch.start();
        });

        Mono<String> worldMono = webClient.get().uri("http://localhost:8080/world")
                .retrieve().bodyToMono(String.class);
        worldMono.subscribe(s -> {
            log.info(s);
            if(stopWatch.isRunning()){
                stopWatch.stop();
            }
            log.info(stopWatch.prettyPrint());
            stopWatch.start();
        });
    }
}
```

- 간단하게 각 REST 통신시 마다 시간을 찍어봤습니다.

```java
---------------------------------------------
ns         %     Task name
---------------------------------------------
3332389687  063%  
1961842958  037%
```

- 실제 두개를 합쳐도 5초 정도 나오는걸 확인할 수 있습니다.
- 실제 두개는 같이 진행하고 있기 때문에 Hello를 진행하고 있을때 이미 World로 진행하고 있는 거라고 생각 하면 좋을거 같습니다.

### WebClient 호출하기 - 100번

- List에 호출이 넣고, 모든 호출이 끝나면 얼마나 걸리는지 확인하도록 하겠습니다.
- 시간은 위의 RestTemplate 테스트와 동일한 시간으로 변경하겠습니다.

```java
package com.spring.test;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StopWatch;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Configuration
public class AppRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AppRunner.class);

    private final WebClient.Builder webClientBuilder;

    public AppRunner(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        WebClient webClient = webClientBuilder.build();
        List<String> result = new ArrayList<>();

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();

        for (int i = 0; i < 100; i++) {
            Mono<String> helloMono = webClient.get().uri("http://localhost:8080/hello")
                    .retrieve().bodyToMono(String.class);
            helloMono.subscribe(result::add);

            Mono<String> worldMono = webClient.get().uri("http://localhost:8080/world")
                    .retrieve().bodyToMono(String.class);
            worldMono.subscribe(result::add);
        }

        stopWatch.stop();
        log.info(stopWatch.prettyPrint());
    }
}
```

- 아래와 같이 시간이 걸리는걸 확인할 수 있습니다.

```java
StopWatch '': running time = 1443995052 ns
```

## 참고자료

[Spring WebClient vs. RestTemplate | Baeldung](https://www.baeldung.com/spring-webclient-resttemplate)

[RestTemplate과 WebClient](https://madplay.github.io/post/difference-between-resttemplate-and-webclient?fbclid=IwAR2Xrpow1cU6sMqe601Jn0A-xQi6mEBeyqVSePNdEswgvOgL7PGA4cdHPnE)

[[Spring Boot #31] 스프링 부트 RestTemplate, WebClient](https://engkimbs.tistory.com/808)
