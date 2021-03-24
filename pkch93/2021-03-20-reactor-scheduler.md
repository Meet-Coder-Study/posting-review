# Scheduler

Reactor는 여느 리엑티브 구현체 라이브러리와 같이 `ex. RxJava` 동시성 모델을 강요하지 않는다. 즉, 리엑티브 라이브러리를 사용한다고 해서 무조건 동시성을 사용해야한다는 것은 아니라는 의미이다. 동시성을 사용할지 말지에 대한 결정은 개발자에게 맡기며 만약 동시성 모델을 사용한다면 라이브러리 차원에서 동시성을 지원해준다.

Mono와 Flux가 지원하는 대부분의 연산자`Operators`는 이전에 실행중인 스레드를 가지고 작업을 수행한다. 만약 Mono나 Flux를 실행할 스레드를 지정하지 않는 경우에는 해당 Mono나 Flux의 subscribe를 호출한 스레드에서 실행이 된다.

```java
public static void main(String[] args) throws InterruptedException {
  final Mono<String> mono = Mono.just("hello "); 

  Thread t = new Thread(() -> mono
      .map(msg -> msg + "thread ")
      .subscribe(v -> 
          System.out.println(v + Thread.currentThread().getName()) 
      )
  )

  t.start();
  t.join();
}
```

위 코드의 실행 결과는 다음과 같다.

```
hello thread Thread-0
```

새롭게 생성하여 할당한 Thread로 `Mono#subscribe`를 호출했기 때문이다.

Reactor에서는 어떤 스레드에서 실행할지를 `Scheduler`를 활용하여 정한다. `ExecutorService`와 유사한 책임을 가진다고 볼 수 있지만 테스트를 위한 가상 시간, 트램펄린 `?`, 즉각적인 스케줄링 드의 다양한 기능들을 지원해준다.

## Reactor Scheduling Methods

Reactor에서 멀티스레딩 실행을 지원하는 메서드로 publishOn과 subscribeOn이 있다.

이들 메서드는 subscribe시 Publisher와 Subscriber 사이의 작업들 `operators`을 어떻게 스케줄링할지를 결정한다.

### publishOn

![](https://user-images.githubusercontent.com/30178507/111774609-0e1acd00-88f3-11eb-8e70-c2df082e34c2.png)

publishOn은 publishOn이 호출된 이후의 연산자에 다음과 같은 영향을 끼친다.

1. Scheduler가 선택한 Thread에 실행 컨택스트를 옮긴다.
2. onNext는 순서대로 발생하므로 이는 단일 스레드를 사용한다.
3. 특정 스케줄러에서 실행되지 않는 한 publishOn 이후의 연산자들은 같은 Thread에서 실행된다.

```java
@Test
void publishOn() throws InterruptedException {
    Scheduler s = Schedulers.newParallel("parallel-scheduler", 4);

    final Flux<String> flux = Flux
            .range(1, 2)
            .map(i -> {
                System.out.println("previous publishOn: " + Thread.currentThread().getName());
                return 10 + i;
            })
            .publishOn(s)
            .filter(i -> {
                    System.out.println("after publishOn: " + Thread.currentThread().getName());
                    return i % 2 == 0;
            })
            .map(i -> {
                System.out.println("after publishOn: " + Thread.currentThread().getName());
                return "value " + i;
            });

    Thread thread = new Thread(() -> flux.subscribe(System.out::println));

    thread.start();
    thread.join();
}
```

위 코드의 결과는 다음과 같다.

```
previous publishOn: Thread-3
previous publishOn: Thread-3
after publishOn: parallel-scheduler-1
after publishOn: parallel-scheduler-1
after publishOn: parallel-scheduler-1
value 12
```

즉, publishOn 이전의 `range`, `map`은 호출한 Thread `Thread-3`에서 호출한 것을 알 수 있다. publishOn 이후의 `filter`, `map` 연산은 새로이 생성한 ParallelScheduler로 실행이 된 것을 알 수 있다.

#### publishOn과 병렬처리

보통 publishOn은 병렬처리를 지원하기 위해서 많이 사용한다. 데이터의 생성 및 subscribe는 실행한 메인 스레드가 담당하도록 하는 반면 데이터의 소모를 병렬적으로 처리하도록 만드는 것이다.

![](https://user-images.githubusercontent.com/30178507/111774613-0fe49080-88f3-11eb-8865-ee648abc3e87.png)

위 그림은 세 개의 원소를 시간에 따라 방출하고 연산자에 따라 원소를 변환하는 과정을 담고 있는데 원소의 동기적인 특성 때문에 각 변환 단계에서 원소를 하나씩 이동해야한다. 그리고 다음 처리를 시작하기 위해서는 이전 작업을 완료해야한다.

![](https://user-images.githubusercontent.com/30178507/111774622-1115bd80-88f3-11eb-885a-5a99c3679d29.png)

이런 문제를 publishOn을 사용하면 조금이나마 처리 속도가 빨라질 수 있다. 처리 단계 사이에 비동기영역을 두어 병렬처리를 할 수 있게 지원한다. 이 덕분에 왼쪽의 영역이 오른쪽 영역의 처리 결과를 기다릴 필요가 없게된다.

단, 병렬처리를 활용하기 위해서는 각 작업 구조들을 잘 파악하여 병렬로 변경했을때 영향이 없는지를 잘 파악해야한다.

### subscribeOn

![](https://user-images.githubusercontent.com/30178507/111774634-1410ae00-88f3-11eb-8c1f-a38bf1788ca0.png)

publishOn이 연산과정을 Thread에 할당하는 것이라면 subscribeOn을 구독 과정을 Thread에 할당하는 스케줄러 연산자이다. publishOn은 실행된 이후의 연산자에만 적용되지만 subscribeOn은 순서에 상관이 없이 적용된다.

subscribeOn은 원소를 방출하는 컨텍스트에 영향을 미친다.

1. 데이터 스트림이 구독하는 Thread를 변경한다.
2. 이 Thread는 Scheduler가 선택한다.

## Schedulers

Schedulers는 Reactor의 Scheduler를 제공해주는 추상클래스이다. 다음과 같은 정적메서드를 통해 다양한 Scheduler를 지원한다.

- **Schedulers#immediate** `현재 실행중인 컨텍스트가 없는 경우`

    로직을 수행할 때 Runnable로 할당하여 현재 스레드에서 할당하도록 만듬

    ```java
    @Test
    void immediate() throws InterruptedException {
        // given
        Scheduler scheduler = Schedulers.immediate();

        // when & then
        Thread thread = new Thread(() -> {
            System.out.println("current thread: " + Thread.currentThread().getName());

            Mono.just("helloworld!")
                    .map(msg -> msg + " pkch!")
    	              .subscribeOn(scheduler)
                    .subscribe(msg -> System.out.println("subscribe thread: " + Thread.currentThread().getName()));
        });

        thread.start();
        thread.join();
    }
    ```

    위 코드의 실행 결과는 다음과 같다. 

    ```java
    current thread: Thread-3
    subscribe thread: Thread-3
    ```

    즉, subscribe를 호출한 스레드와 내부적으로 Subscription을 수행하는 스레드가 같은 것을 확인할 수 있다.

- **Schedulers#single** `하나의 스레드에서 재사용을 하는 경우`

    모든 작업을 한 개의 전용 워커`Thread`로 처리하는 **SingleScheduler**를 반환한다.
    위 Scheduler는 모든 호출을 하나의 스레드로 받는다. 만약에 하나의 요청에 하나의 스레드가 새로 생길 원한다면 `Schedulers#newSingle`을 사용해야한다. 

    ```java
    @Test
    void single() throws InterruptedException {
        // given
        Scheduler scheduler = Schedulers.single();

        // when & then
        Thread thread = new Thread(() -> {
            System.out.println("current thread: " + Thread.currentThread().getName());

            Mono.just("helloworld!")
                    .map(msg -> msg + " pkch!")
                    .subscribeOn(scheduler)
                    .subscribe(msg -> System.out.println("subscribe thread: " + Thread.currentThread().getName()));
        });

        thread.start();
        thread.join();
    }
    ```

    위 코드의 실행 결과는 다음과 같다.

    ```
    current thread: Thread-3
    subscribe thread: single-1
    ```

    즉, subscribe를 호출한 스레드와 내부적으로 Subscription을 수행하는 스레드가 다른 것을 확인할 수 있다.

- **Schedulers#boundedElastic** `I/O 작업에 적합`

    동적으로 워커`Thread`를 만들고 캐시하는 **CachedScheduler**를 반환한다.

    ```java
    @Test
    void boundedElastic() throws InterruptedException {
        // given
        Scheduler scheduler = Schedulers.boundedElastic();
        Scheduler scheduler2 = Schedulers.elastic();

        // when & then
        Thread thread = new Thread(() -> {
            System.out.println("current thread: " + Thread.currentThread().getName());

            Mono.just("helloworld!")
                    .map(msg -> msg + " pkch!")
                    .subscribeOn(scheduler)
                    .subscribe(msg -> System.out.println("subscribe thread: " + Thread.currentThread().getName()));
        });

        thread.start();
        thread.join();
    }
    ```

    위 코드의 실행 결과는 다음과 같다.

    ```
    current thread: Thread-3
    subscribe thread: boundedElastic-1
    ```

    즉, subscribe를 호출한 스레드와 내부적으로 Subscription을 수행하는 스레드가 다른 것을 확인할 수 있다.

    CachedScheduler는 기본적으로 60초간 스레드가 사용되지 않으면 스레드 풀에서 제거한다. 그 이전에 재사용된다면 따로 생성을 하지 않고 재사용한다. 기본적으로는 CPU 코어의 10배로 스레드 풀 크기를 가진다.

    참고로 **Schedulers#elastic**도 있는데 이 메서드와 반환 타입인 **ElasticScheduler**는 `reactor 3.5.0`에서 deprecated 될 예정이다. 배압 `Backpressure` 문제를 감추고 너무 많은 Thread를 만들어내는 경향때문이다.

    > Schedulers#elastic는 unbound thread pool이다. 때문에 무한정 thread가 생성될 수 있다.

- **Schedulers#parallel** `CPU 작업에 적합`

    병렬 작업을 위한 **ParallelScheduler**를 반환한다. 기본적으로 스레드풀 크기는 CPU 코어 수로 설정되며 CPU 작업을 할 때 적절하다.

    ```java
    @Test
    void parallel() throws InterruptedException {
        // given
        Scheduler scheduler = Schedulers.parallel();

        // when & then
        Thread thread = new Thread(() -> {
            System.out.println("current thread: " + Thread.currentThread().getName());

            Mono.just("helloworld!")
                    .map(msg -> msg + " pkch!")
                    .subscribeOn(scheduler)
                    .subscribe(msg -> System.out.println("subscribe thread: " + Thread.currentThread().getName()));
        });

        thread.start();
        thread.join();
    }
    ```

    위 코드의 실행 결과는 다음과 같다.

    ```
    current thread: Thread-3
    subscribe thread: parallel-1
    ```

    즉, subscribe를 호출한 스레드와 내부적으로 Subscription을 수행하는 스레드가 다른 것을 확인할 수 있다.

- **Schedulers#fromExecutorService**

    위 Reactor에서 기본적으로 제공하는 Scheduler 이외에 기존재하는 ExecutorService를 기반으로 Scheduler를 만들 수 있도록 제공한다.

### 참고

Threading and Schedulers 참고: [https://projectreactor.io/docs/core/release/reference/#schedulers](https://projectreactor.io/docs/core/release/reference/#schedulers)

Reactor Schedulers 참고: [https://projectreactor.io/docs/core/release/api/reactor/core/scheduler/Schedulers.html](https://projectreactor.io/docs/core/release/api/reactor/core/scheduler/Schedulers.html)

토비의 봄 Reactive Streams Schedulers: [youtube.com/watch?v=Wlqu1xvZCak](http://youtube.com/watch?v=Wlqu1xvZCak)