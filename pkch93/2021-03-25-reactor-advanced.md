# reactor advanced

> 배압 `Backpressure`, Hot/Cold Stream, Processor에 대한 이야기

## 배압 `Backpressure`

backpressure 참고: [https://stackoverflow.com/questions/57296097/how-does-backpressure-work-in-project-reactor](https://stackoverflow.com/questions/57296097/how-does-backpressure-work-in-project-reactor)

배압은 본질적으로 소비자가 생산자에게 피드백을 주는 채널이다. 소비자는 배압을 통해 생산자의 데이터를 조절할 수 있다. 즉, Observable의 속도 조절을 Subscriber가 통제하는 강력한 메커니즘이다. 이렇게 느슨한 결합으로도 생산자와 소비자를 관리할 수 있다는 큰 장점이 있다.

배압은 종종 일괄 처리되므로 오버헤드를 최소화 할 수 있다. Subscriber가 정말 느리더라도 이 느린 속도가 즉시 반영되므로 전반적인 시스템 안정성이 유지된다.

Subscriber에서 무거운 작업은 피하고 flatMap 등으로 무거운 작업을 분담시켜 소비자의 부하를 분산할 수도 있다. 이렇게 Subscriber에서 장시간 작업을 피하여 배압의 필요성을 줄여도 좋지만 연산자가 배압을 지원하는지 파악하여 배압을 적용하는 방법도 좋다.

### onBackPressure

배압은 파이프라인에서 `onBackpressureBuffer`, `onBackpressureDrop`, `onBackpressureError`, `onBackpressureLastest` 메서드로 배압 전략을 적용할 수 있다.

- onBackpressureBuffer

    요청을 처리하는데 버퍼를 두어 처리한다. 배압이 될 만한 부분을 버퍼에 넣어 한꺼번에 Subscriber가 요청하는 만큼 배출한다.

    ![](https://user-images.githubusercontent.com/30178507/112487583-30638d80-8dc0-11eb-8408-44fc902c7d9e.png)

    인자없이 기본으로 사용할 수도 있고 `ttl`, `consumer`, `schedulers` 등을 인자로 넣어 배압에 사용할 수 있다.

- onBackpressureDrop

    만약 Subscriber가 데이터를 받아들일 준비가 되지 않았다면 그래도 `Drop`하는 배압 전략이다.

    ![](https://user-images.githubusercontent.com/30178507/112487591-30fc2400-8dc0-11eb-927b-ab593bc62cbb.png)

- onBackpressureError

    Subscriber가 데이터를 받아들일 수 없는 상황에서 데이터를 방출하는 경우 `Exceptions.failWithOverflow`를 onError로 내보내는 배압 전략

    ![](https://user-images.githubusercontent.com/30178507/112487595-322d5100-8dc0-11eb-9d57-1bbb2b6b5833.png)

- onBackpressureLastest

    Subscriber가 데이터를 받을 수 없는 상황에서 가장 최근에 온 데이터를 방출하는 배압 전략

    ![](https://user-images.githubusercontent.com/30178507/112487601-335e7e00-8dc0-11eb-9a05-d752dba4a58f.png)

## Hot vs Cold

RxJava나 Reactor같은 Reactive 구현체들은 Hot과 Cold 두 종류의 데이터 스트림을 지원한다.

먼저 Cold는 일련의 비동기 데이터 스트림이며 subscribe가 이뤄지기 전에는 아무일도 일어나지 않는다. `즉, 데이터가 흐르지 않는다.`

대표적으로 HTTP 요청을 받아 처리할 때 Cold 데이터 스트림을 사용한다.

반면 Hot Publisher는 Subscriber의 수에 의존하지 않는다. Hot Publisher에 특정 Subscriber가 구독을 하더라도 그때부터 데이터가 흐르지 않는다. Hot Publisher는 이미 Subscriber가 구독하기 전부터 데이터가 흐르고 있는다.

![](https://user-images.githubusercontent.com/30178507/112487606-33f71480-8dc0-11eb-850d-9891f4bc5ee1.png)

```java
@Test
void hot() {
    // given
    Sinks.Many<Integer> hotSource = Sinks.unsafe().many().multicast().directBestEffort();
    Flux<Integer> hotFlux = hotSource.asFlux();

    hotFlux.subscribe(d -> System.out.println("Subscriber 1 to Hot Source: " + d));

    hotSource.emitNext(1, FAIL_FAST);
    hotSource.tryEmitNext(2).orThrow();

    hotFlux.subscribe(d -> System.out.println("Subscriber 2 to Hot Source: " + d));

    hotSource.emitNext(3, FAIL_FAST);
    hotSource.emitNext(4, FAIL_FAST);
    hotSource.emitComplete(FAIL_FAST);
}
```

위 결과는 다음과 같다.

```
Subscriber 1 to Hot Source: 1
Subscriber 1 to Hot Source: 2
Subscriber 1 to Hot Source: 3
Subscriber 2 to Hot Source: 3
Subscriber 1 to Hot Source: 4
Subscriber 2 to Hot Source: 4
```

hot stream은 구독 이후에 들어오는 데이터에 대해서 신호를 받는다. 때문에 `Subscriber 1`은 1, 2, 3, 4 모두를 받아 출력을 한 반면 `Subscriber 2`는 2가 데이터 스트림에 들어온 이후에 구독이 되었기 때문에 3, 4 밖에 받지 못했다.

## Processor

Processor는 Publisher와 Subscriber를 함께 구현하는 인터페이스로 Reactive Streams 스팩이다.

```java
public interface Processor<T, R> extends Subscriber<T>, Publisher<R> {
}
```

즉, Publisher-Subscriber 사이에서 추가적인 로직을 적용할 때 사용할 수 있다. 즉, Reactive Streams 구현 사이에 공유되는 단계를 추가할 수 있다. 단, 대부분의 경우는 Processor를 피하고 Publisher의 연산자 `Operators`를 통해 단계를 추가하는 것을 권한다.

Processor를 처음 사용할 때 가장 흔한 실수가 Subscriber 인터페이스에서 `onNext`, `onComplete`, `onError` 등을 호출하는 점이다.

Reactive Streams 스팩에 따르면 외부 동기화 관련된 호출을 하는 경우는 매우 주의해야한다. Processor는 Publisher를 노출하는 대신 Subscriber를 통과해야하는 Reactive Stream API를 필요로하지 않는 이상 거의 유용하지 않다

참고로 Reactor Processor 구현체는 `DirectProcessor`, `UnicastProcessor`, `EmitterProcessor`, `ReplayProcessor`를 지원했는데 이들 API는 deprecated 되었으며 reactor 3.5.0에서 제거될 예정이다.
