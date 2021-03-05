# Reactive Streams

Java Reactive Stream 공식 문서: [https://www.reactive-streams.org/](https://www.reactive-streams.org/)

Reactive Streams은 JVM에서 non-blocking으로 비동기 스트림 처리 프로세스를 제공하는 표준이다. runtime 환경 뿐 아니라 network protocol에서 사용할 수 있도록 목표하여 탄생하였다. JDK에서는 JDK9 버전의 java.util.concurrent.Flow 인터페이스로 사용할 수 있다.

Reactive Stream으로 리엑티브 프로그래밍을 구현한 라이브러리로는 대표적으로 RxJava와 Reactor가 있다. 전자는 안드로이드 진영에서 후자는 Spring 서버 진영에서 주로 사용되고 있다.

## 등장 배경

스트림 데이터, 특히, 현재 살아있는 데이터를 다룰 때 비동기 시스템에서 특별한 관리가 필요하다. 가장 두드러진 문제는 빠른 데이터가 스트림을 압도하지 않도록 리소스의 소모가 제어될 수 있어야한다는 점이었다. 비동기는 컴퓨터 자원을 병렬적으로 사용할 수 있도록, 즉, 컴퓨터 자원을 효율적으로 활용할 수 있도록 만들기 위한 필연적인 방법이었다.

위 문제를 해결하기 위해 Reactive Streams를 구상했다. Reactive Streams는 비동기의 경계를 가로지르는 데이터의 변화를 관장했다. 이를 통해 완전히 non-blocking과 비동기적인 동작을 명령할 수 있게 되었다.

## 설정

기본적으로 JDK 9의 main jar에는 Reactive Streams가 포함되어있다. 그 이전 버전에는 다음과 같은 의존성을 명시해야한다.

### maven

```xml
<dependency>
  <groupId>org.reactivestreams</groupId>
  <artifactId>reactive-streams</artifactId>
  <version>1.0.3</version>
</dependency>
<dependency>
  <groupId>org.reactivestreams</groupId>
  <artifactId>reactive-streams-tck</artifactId>
  <version>1.0.3</version>
</dependency>
<dependency>
  <groupId>org.reactivestreams</groupId>
  <artifactId>reactive-streams-tck-flow</artifactId>
  <version>1.0.3</version>
</dependency>
<dependency>
  <groupId>org.reactivestreams</groupId>
  <artifactId>reactive-streams-examples</artifactId>
  <version>1.0.3</version>
</dependency>
```

### gradle

```groovy
implementation 'org.reactivestreams:reactive-streams:1.0.3'
implementation 'org.reactivestreams:reactive-streams-tck:1.0.3'
implementation 'org.reactivestreams:reactive-streams-tck-flow:1.0.3'
implementation 'org.reactivestreams:reactive-streams-examples:1.0.3'
```

### 각 라이브러리의 Scope

#### reactive-streams

reactive-streams api 참고: [https://github.com/reactive-streams/reactive-streams-jvm/tree/v1.0.3/api](https://github.com/reactive-streams/reactive-streams-jvm/tree/v1.0.3/api)

`reactive-streams`는 Reactive Programming 구현을 위한 Publisher, Subscriber, Subscription, Processor 인터페이스를 제공한다.

Publisher 구현체는 무한대의 데이터를 제공해 줄 수 있으며 Subscriber가 감당할 수 있는 만큼에 따라서 데이터를 보낸다. 이는 Subscription의 도움을 받아 구현할 수 있다.

`Publisher#subscribe`를 호출해야 Publisher가 가진 데이터를 Subscriber에게 데이터를 전달할 수 있다. 이때 `Publisher#subscribe`에서는 Subscriber의 메서드 규약을 따라야한다.

```java
onSubscribe onNext* (onError | onComplete)?
```

위 내용이 Subscriber의 규약 `Protocol`이다. `Publisher#subscribe`에서 `Subscriver#onSubscribe`를 반드시 호출해야한다. 그리고 데이터를 전달해줄만큼 `Subscriber#onNext`를 호출해주어야한다.

그리고 데이터 스트림이 끝난다면 `Subscriber#onComplete` 데이터 전달하면서 에러가 발생한다면 `Subscriber#onError`를 호출해야한다.

- Publisher `Observable`

    ```java
    public interface Publisher<T> {
        public void subscribe(Subscriber<? super T> s);
    }
    ```

    1. `Subscriber#onNext`를 호출하는 총 횟수는 반드시 `Subscription#request`로 넘어오는 수보다 작거나 같아야한다. 즉, request로 요청하는 수보다 많이 `Subscriber#onNext`를 호출해서는 안된다.
    2. Publisher는 요청온 것보다 더 적은 `Subscriber#onNext`를 호출할수도 있으며 `Subscriber#onComplete`이나 `Subscriber#onError`가 호출되면 종료할 수 있어야한다.

        이 규약은 Publisher가 요청`Subscription#request`으로 받은 수보다 더 적은 데이터를 전달할 수 있다는 것을 명확히하기 위함이다. 단순히 모든 데이터를 전달하지 못할 수도 있고, 실패한 상태이거나, 비어있는 데이터 스트림이거나 이미 완료된 데이터 스트림일 수 있다.

    3. 반드시 Subscriber에 `onSubscribe`, `onNext`, `onError`, `onComplete`는 순서에 맞게 호출해야한다.
    4. Publisher가 실패한다면 반드시 `Subscriber#onError`를 호출해야한다.

        Subscriber는 `Subscriber#onError`를 통해 Publisher가 에러 상태임을 인지하고 리소스 정리 및 에러 처리를 할 수 있다.

    5. Publisher가 성공적으로 종료된다면 반드시 `Subscriber#onComplete`을 호출해야한다.

        Subscriber가 종료 이후 작업이나 리소스 정리를 하기 위함

    6. Publisher가 `Subscriber#onError`나 `Subscriber#onComplete`를 호출할 때 Subscriber의 Subscription은 cancelled를 염두에 두어야한다.

        `Subscription#cancel`인 상태인 경우에는 `onError`나 `onComplete`을 호출했을 때와 동일하게 처리가 된다.

    7. `Subscriber#onError`나 `Subscriber#onComplete`과 같이 스트림이 종료 상태가 되면 더이상 Subscriber에 데이터를 전달하면 안된다.
    8. Subscription이 취소되면 더이상 데이터를 전달하면 안된다.

        이는 `Subscriber#onNext`는 비동기적으로 동작하므로 지연이 발생할 수 있기 때문이다.

    9. `Publisher#subscribe`는 반드시 인자로 제공한 Subscriber의 `onSubscribe`를 호출해야한다.

        만약 인자 Subscriber가 null이라면 반드시 NullPointerException을 던저야하며 다른 상황에서 실패가 된다면 `onError`를 호출해야한다.

    10. `Publisher#subscribe`는 여러번 원하는 만큼 호출이 가능하지만 호출마다 매번 다른 Subscriber와 함께해야한다.

        Publisher가 같은 Subscriber에 동일한 데이터를 여러번 전달함을 전제로 하지 않음.

    11. Publisher는 여러 Subscriber를 Subscription을 통해서 제어할 수 있다.

- Subscriber `Observer`

    ```java
    public interface Subscriber<T> {
        public void onSubscribe(Subscription s);
        public void onNext(T t);
        public void onError(Throwable t);
        public void onComplete();
    }
    ```

    1. Subscriber는 반드시 `Subscription#request`를 통해 데이터를 요청해야한다.

        얼마나 많은 데이터를 Subscriber가 받아들일 수 있는지는 전적으로 Subscriber의 책임이다.
        재전송을 통한 데이터의 재정렬`데이터 순서를 맞추는 작업을 뜻하는걸로 보임`을 피하기 위해서 동기식 Subscriber 구현에서는 신호 처리 끝에 Subscription 메서드를 호출하는 것을 강력히 추천한다.

        Subscriber는 자신이 처리할 수 있는 상한선을 기준으로 `Subscription#request`로 요청하는데 이는 하나씩 요청하는 것은 `stop-the-wait`의 비효율적인 형태가 되기 때문이다.

    2. Subscriber는 신호 처리가 Publisher의 응답에 부정적인 영향을 끼친다고 생각되면 이 신호를 비동기식으로 전달할 것을 추천한다.

        Subscriber는 Publisher가 CPU cycle을 수신하지 못하도록 차단해서는 안되기 때문이다.

    3. `Subscriber#onComplete`과 `Subscriber#onError`는 `Subscription`과 `Publisher`의 어떤 메서드에서도 실행되어서는 안된다.

        이는 Publisher, Subscription, Subscriber 간의 사이클, race condition을 방지하기 위함이다.

        > 여기서 말하는 `어떤 메서드`는 인터페이스에 정의된 `subscribe`, `onSubscribe` 등이 아닌 다른 기능을 위해 정의한 메서드를 의미하는 것으로 보임

    4. `Subscriber#onComplete`과 `Subscriber#onError`는 반드시 Subscription이 취소될 수 있음을 고려해야한다.
    5. Subscriber는 반드시 인자로 주어진 `Subscription#cancel`을 호출해야한다.
    6. Subscriber는 반드시 Subscription이 필요하지 않을때 `Subscription#cancel`을 호출해야한다.

        Subscriber가 Subscription을 버리는 방법은 `cancel`을 호출하는 방법 뿐이다. `cancel`을 호출하면 `Subscription`이 가지고 있는 자원을 안전하고 즉시 회수할 수 있어야한다.

    7. Subscriber는 반드시 `Subscription#request`나 `Subscription#cancel`을 순서대로 호출해야한다.
    8. Subscriber는 `Subscription#cancel` 이후에도 반드시 하나 이상의 `onNext` 신호를 받을 준비가 되어 있어야한다. 만약 `Subscription#cancel` 이후에도 여전히 지연상태가 생긴다면 `Subscription#cancel`은 즉시 작업을 정리하는 것을 보장할 수 없다.

        이는 `Subscription#cancel`과 Publisher가 cancel을 확인하는 사이의 지연을 방지하기 위함이다.

    9. Subscriber는 반드시 `onComplete`을 받을 준비가 되어있어야한다. 그렇지 않으면 `Subscription#request`를 사용해야한다.

        이 규칙을 Subscriber가 Publisher가 요청을 줄 수 있는지 확인하기 위해 풀링할 필요가 없다.

    10. Subscriber는 반드시 `onError`을 받을 준비가 되어있어야한다. 그렇지 않으면 `Subscription#request`를 사용해야한다.
    11. Subscriber는 각각의 신호를 처리하기 전에 반드시 각 신호 메서드에서 호출이 발생하는지 확인해야한다. 즉, Subscriber는 처리 로직에 신호 `onNext`로 전달받은 데이터를 적절히 처리해야한다.

        이는 신호에 대한 비동기 처리를 thread-safe해야할 필요가 있기 때문이다.
        참고: [https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html#jls-17.4.5](https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html#jls-17.4.5)

    12. `Subscriber#onSubscribe`는 반드시 주어진 Subscriber의 onSubscribe를 호출해야한다.
    13. `onSubscribe`, `onNext`, `onError`, `onComplete`의 인자로 null이 온다면 반드시 NullPointerException을 던져야하며 다른 실패상황에서는 `Subscription#cancel`을 호출해야한다.

- Subscription

    ```java
    public interface Subscription {
        public void request(long n);
        public void cancel();
    }
    ```

    1. `Subscription#request`나 `Subscription#cancel`은 반드시 `Subscriber`의 컨텍스트에서 호출되어야한다.
    2. Subscription은 반드시 Subscriber에 `onNext`, `onSubscribe`에서 동기적으로 `Subscription#request`를 호출할 수 있도록 허용해야한다.
    3. `Subscription#request`는 Publisher와 Subscriber 사이에 가능한 동기적 재귀의 상한선을 두어야한다.

        request와 onNext 사이에 상호 재귀에 대한 상한선을 두는 규약이다. 상한은 1(한번)을 추천한다.

    4. `Subscription#request`는 시의적절하게 반환하여 호출자의 반응성을 존중할 수 있어야한다.

        request는 `non-obstuction` 메서드의 의도로 설계가 되었으며 이를 통해 빠르게 실행될 수 있다. 이를 통해 호출자의 스레드의 실행을 지연하거나 무거운 계산을 피할 수 있다.

    5. `Subscription#cancel`은 반드시 시의적절하게 반환하여 호출자의 반응성을 존중함과 동시에 반드시 멱등성을 가지고 thread-safe 해야한다.
    6. `Subscription#cancel`되면 추가적인 `Subscription#request`는 안전하게 호출이 가능해야한다.
    7. `Subscription#cancel`되면 추가적인 `Subscription#cancel`는 안전하게 호출이 가능해야한다.

        > 6, 7은 잘 이해가 안됨

    8. `Subscription#cancel`이 되지 않는 동안에는 `Subscription#request`는 반드시 각 Subscriber에 전달될 수 있는 추가적인 데이터의 수만큼 전달할 수 있어야한다.
    9. `Subscription#cancel`이 되지 않는 동안에는 `Subscription#request`는 만약 인자가 0이하라면 IllegalArgumentException을 `onError`에 신호로 보내야한다.
    10. `Subscription#cancel`이 되지 않는 동안에는 `Subscription#request`는 Subscriber에 동기적으로 `onNext`를 호출해야한다.
    11. `Subscription#cancel`이 되지 않는 동안에는 `Subscription#request`는 Subscriber에 동기적으로 `onComplete`이나 `onError`를 호출해야한다.
    12. `Subscription#cancel`이 되지 않는 동안에는 `Subscription#cancel`은 Subscriber가 더이상 데이터를 받기를 원치 않는 경우에 데이터를 그만내려달라는 의미로 호출해야한다.
    13. `Subscription#cancel`이 되지 않는 동안에는 `Subscription#cancel`은 Publisher와 Subscriber가 가지고 있는 참조를 끊어버리기 위해 호출해야한다.
    14.  `Subscription#cancel`이 되지 않는 동안에는 `Subscription#cancel`을 호출하면 다른 Subscriber가 없는 경우 Publisher가 종료될 수 있다.
    15. `Subscription#cancel`을 하는 동안에는 정상적으로 데이터를 제공해야한다.

        즉, cancel 동안에 예외를 던지는 것을 허용하지 않는다.

    16. `Subscription#request`를 하는 동안에는 정상적으로 데이터를 제공해야한다.

        즉, request 동안에 예외를 던지는 것을 허용하지 않는다.

    17. `Subscription`은 request시에 `java.lang.Long.MAX_VALUE`까지 지원해야한다. 이때 `java.lang.Long.MAX_VALUE`의 의미는 무한히 데이터를 받아들일  수 있다는 의미이다.

- Processor

    ```java
    public interface Processor<T, R> extends Subscriber<T>, Publisher<R> {
    }
    ```

    1. Processor는 진행단계 `processing stage`를 뜻하며 Publisher와 Subscriber의 규약을 둘다 지켜야한다.
    2. Processor는 onError의 복구 로직을 선택할 수 있다. 만약 복구를 하기로 선택했다면 반드시 `Subscription#cancel`일때를 고려해야한다. 그렇지 않으면 Subscriber로 즉시 onError를 전파해야한다.

### reactive-streams-tck

reactive-streams-tck: [https://github.com/reactive-streams/reactive-streams-jvm/tree/master/tck](https://github.com/reactive-streams/reactive-streams-jvm/tree/master/tck)

> The Technology Compatibility Kit (TCK) is a standard test suite for conformance testing of implementations.

`reactive-streams-tck`는 `reactive-streams`의 각 요소들이 만족해야하는 규약을 지키고 있는지 테스트하기 위한 라이브러리이다.

### reactive-streams-tck-flow

reactive-streams-tck-flow: [https://github.com/reactive-streams/reactive-streams-jvm/tree/master/tck-flow](https://github.com/reactive-streams/reactive-streams-jvm/tree/master/tck-flow)

말그대로 `java.util.concurrent.Flow.*`를 위한 tck 라이브러리이다.

> 참고로 Flow는 Java 9에서 지원하는 Reactive Streams의 구현체이다.
위 API의 등장으로 기존에 제공되던 `java.util.Observable`은 Deprecated 되었음.

### reactive-streams-examples

reactive-streams-examples: [https://github.com/reactive-streams/reactive-streams-jvm/tree/master/examples](https://github.com/reactive-streams/reactive-streams-jvm/tree/master/examples)

> reactive-streams 팀에서 제공하는 예시 코드이다.

## 간단하게 구현해보기

```java
package edu.pkch.reactivestreams;

import org.reactivestreams.Subscriber;
import org.reactivestreams.Subscription;

public class ReactiveObserver<T> implements Subscriber<T> {

    @Override
    public void onSubscribe(Subscription s) {
        s.request(Long.MAX_VALUE);
    }

    @Override
    public void onNext(T t) {
        System.out.println("subscribe: " + t);
    }

    @Override
    public void onError(Throwable t) {
        System.out.println("error: " + t.getClass().getName());
    }

    @Override
    public void onComplete() {
        System.out.println("data stream completed");
    }
}
```

```java
public class ReactiveObservable<T> implements Publisher<T> {
    private final List<T> data;

    private ReactiveObservable(List<T> data) {
        this.data = data;
    }

    public static <T> ReactiveObservable<T> create(List<T> data) {
        return new ReactiveObservable<>(data);
    }

    @Override
    public void subscribe(Subscriber<? super T> subscriber) {
        subscriber.onSubscribe(new Subscription() {
            private boolean cancelled;

            @Override
            public void request(long n) {
                try {
                    for(long i = 0; i < n; i++) {
                        if (cancelled) {
                            return;
                        }

                        if (data.size() <= i) {
                            break;
                        }

                        subscriber.onNext(data.get((int) i));
                    }

                    subscriber.onComplete();
                } catch (Throwable t) {
                    subscriber.onError(t);
                }
            }

            @Override
            public void cancel() {
                this.cancelled = true;
            }
        });
    }
}
```

```java
@Test
void reactiveStreams() {
    Publisher<Integer> publisher = ReactiveObservable.create(List.of(1, 2, 3, 4, 5));
    Subscriber<Integer> subscriber = new ReactiveObserver<>();

    publisher.subscribe(subscriber);
}
```

> 참고로 위 코드는 규약을 전부 지키는 코드는 아님