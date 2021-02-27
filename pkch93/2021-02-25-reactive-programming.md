# Reactive Programming

Reactive Programming 참고: [http://sculove.github.io/blog/2016/06/22/Reactive-Programming/](http://sculove.github.io/blog/2016/06/22/Reactive-Programming/)

Reactive Programming이란?: [http://reactivex.io/intro.html](http://reactivex.io/intro.html)

Reactive Manifesto: [https://www.reactivemanifesto.org/ko](https://www.reactivemanifesto.org/ko)

Reactive Programming은 선언적 코드를 사용하여 비동기 파이프라인 코드를 작성하는 새로운 패러다임이다. 이벤트 기반의 모델로 비동기적 일련의 이벤트를 처리하는데 사용된다. 이렇게 코드를 작성하는 이유는 저수준의 비동기, 병렬 처리 코드를 쉽게 작성하면서 더 효율적으로 컴퓨터 자원을 사용하기 위함이다.

Reactive Programming은 [Observer Pattern](https://johngrib.github.io/wiki/observer-pattern/)을 확장하여 지원한다. Observable은 observer의 메서드를 호출하면서 item이나 정보를 호출하는 역할을 한다. 반면 Observer는 Observable을 subscribe한다. 따라서 subscriber, watcher, reactor 등으로도 불린다.

Observable이 강력한 이유는 A stream에 의해 B stream이 영향을 받는 경우 A만 바꿔도 B를 자동으로 바꿀 수 있다. 즉, 데이터의 동기화가 간편하다. 이는 A, B stream 사이 관계를 선언적으로 선언했기에 가능한 일이다. 또한, Observable은 다수의 value를 다룰 수 있다는 점도 큰 장점이다.

이런 장점들로 비동기처리 로직을 동기식처럼 개발할 수 있다는 장점에 인기를 끌고 있다.

## pull? push?

토비의 봄 Reactive Programming (1) Reactive Streams: [https://www.youtube.com/watch?v=8fenTR3KOJo](https://www.youtube.com/watch?v=8fenTR3KOJo)

Reactive Programming이 Observer Pattern을 확장하였다고 했다. 그럼 왜 Reactive Programming은 Observer Pattern을 선택했을까?

### Iterable과 Observable

iterable와 observable의 개념 참고: [https://ahea.wordpress.com/2017/02/02/iterable와-observable의-개념/](https://ahea.wordpress.com/2017/02/02/iterable%EC%99%80-observable%EC%9D%98-%EA%B0%9C%EB%85%90/)

Observable과 쌍대성 `duality`를 이루는 개념이 바로 Iterable이다.

> 쌍대성 `duality`이란 A와 B가 있을때 A에 성립하는 정리를 뒤집어서 B에도 적용할 수 있는 성질이다. 즉, A와 B의 본질이 같다는 뜻이다.

Iterable은 데이터를 사용하는 Consumer가 직접 데이터를 끌어가야한다는 점에서 pull 방식으로 불리는 반면 Observable은 데이터를 사용하는 Consumer인 Observer가 Observable이 통지해주는대로 `notify` 데이터를 받기 때문에 push 방식으로 불린다. `Observable이 Observer에 데이터를 던져줌`

```java
@Test
@DisplayName("Iterable은 pull 방식의 대표적인 시퀀스이다.")
void pulling() {
    // given
    Iterable<Integer> numbers = () -> new Iterator<Integer>() {
        List<Integer> temp = new ArrayList<>(
                Arrays.asList(1, 2, 3, 4, 5)
        );

        @Override
        public boolean hasNext() {
            return !temp.isEmpty();
        }

        @Override
        public Integer next() {
            return temp.remove(0);
        }
    };

    // when & then
    for (int number : numbers) {
        assertThat(number <= 5).isTrue();
    }
}
```

위와 같이 pull 방식과 push 방식은 비동기 처리 방식에서 차이를 보인다. pull 방식은 Consumer가 Iterable의 데이터를 직접 조회하고 가져와야한다. 이때 조회하는 로직에 대해 프로그래머가 직접 비동기 처리 로직을 작성해주어야한다.

```java
@Test
@DisplayName("[Iterable과 비동기] Iterable은 pull 방식의 대표적인 시퀀스이다.")
void pulling_with_async() {
    // given
    Iterable<Integer> numbers = () -> new Iterator<Integer>() {
        List<Integer> temp = new ArrayList<>(
                Arrays.asList(1, 2, 3, 4, 5)
        );

        @Override
        public boolean hasNext() {
            return !temp.isEmpty();
        }

        @Override
        public Integer next() {
            return temp.remove(0);
        }
    };

    // when
    Iterator<Integer> iterator = numbers.iterator();

    // then
    IntStream.rangeClosed(1, 5)
            .forEach(notUse -> CompletableFuture.runAsync(iterator::next));
}
```

이렇게 데이터를 가지고 있는 `Iterable`에서 값을 가져오는 `pull` 방식으로는 비동기로직을 작성을 클라이언트가 하도록 만든다. `Iterable에서 비동기 지원하는 경우도 가능하긴함...`

반면 push 방식에서는 Observable 자체를 비동기 로직으로 처리하여도 문제가 없다. push 방식의 Observable 데이터를 소비하는 Observer는 이미 전달되는 데이터를 비동기로 처리하기 때문이다. 때문에 Observable이 비동기로 처리하든 동기로 처리하든 Observer는 전달되는 데이터를 비동기로 처리한다.

```java
@Test
@DisplayName("Observable은 push 방식의 대표적인 구현체이다.")
void push() {
    // given
    IntObservable observable = new IntObservable();
    Observer observer1 = new Observer() {
        List<Integer> saved = new ArrayList<>();

        @Override
        public void update(Observable obs, Object update) {
            saved.add((Integer) update);
            System.out.println("observer1: " + saved);
        }
    };
    Observer observer2 = new Observer() {
        List<Integer> saved = new ArrayList<>();

        @Override
        public void update(Observable obs, Object update) {
            saved.add((Integer) update);
            System.out.println("observer2: " + saved);
        }
    };
    observable.addObserver(observer1);
    observable.addObserver(observer2);

    IntObservable observable2 = new IntObservable();
    observable2.addObserver(observer1);

    Executor executor = Executors.newFixedThreadPool(2);

    // when & then
    executor.execute(observable);
    executor.execute(observable2);
}

static class IntObservable extends Observable implements Runnable {
    @Override
    public void run() {
        for (int i = 1; i <= 5; i++) {
            setChanged();
            notifyObservers(i);
        }
    }
}
```

> 위 `Observable`로 비동기 동작을 쉽게 구현이 가능하다.

이점에서 Observable의 구현을 비동기로 만들면 프로그래머가 직접 비동기를 구현할 필요없이 간단하게 비동기 프로그램을 구현할 수 있는 장점이 생긴다. 비동기 로직을 Observable을 통해 추상화할 수 있다는 점에서 Reactive Programming이 Observer Pattern을 활용하는 것이 아닌가 생각한다.

### Observer Pattern의 단점

Observer Pattern은 다음과 같은 단점이 존재한다.

1. Complete이 언제 될 것인가?

    Observable은 Observer들에게 변경사항을 전파하는데 언제가 마지막 전파인지를 확인할 수 없다.

2. Error

    복구 가능한 예외에 대해 예외가 전파되는 방식을 처리할 수 없다. 예외를 받았을때 다시 재시도를 하거나 fallback을 해줄 방법이 없다.

Reactive Programming은 Observer Pattern이 기존에 가지고 있는 문제를 보완하였다. `Subscription`, `onComplete`, `onError`

**Iterable과 Observable의 duality**

event | Iterable `pull` | Observable `push`
-- | -- | --
데이터 조회 | T next() | onNext(T)
에러 처리 | throw Exception | onError(Exception)
마지막 여부 | !hasNext() | onCompleted()

따라서 Iterable과 Obserable은 위와 같이 데이터 조회,에러처리, 완료처리에 대한 쌍대성을 만족한다. 

## asynchronous data streams

Reactive Programming은 기존 Observable을 확장하여 스트림으로 본다.

이벤트, 값의 변화 등 모든 데이터의 흐름을 시간 순서에 의해 전달되어지는 스트림으로 처리한다. 즉, 스트림은 시간 순서에 의해 전달되어진 값들의 collection이라고 생각할 수 있다.

이렇게 시간 순서에 의해 전달된 데이터를 처리하기 위해서 Reactive Programming은 다양한 연산자 `Operators`를 제공한다.

### Operators

ReactiveX Operators 참고: [http://reactivex.io/documentation/operators.html](http://reactivex.io/documentation/operators.html)

대부분의 Reactive Programming 구현체들은 데이터 스트림의 값들을 다루기 위한 다양한 연산자를 제공한다.

- 생성 연산자 `create`, `defer`
- 변환 연산자 `map`, `flatMap`
- 필터 연산자 `filter`
- 병합 연산자 `merge`, `zip`
- 그외 `delay`, `observeOn`, `subscribeOn`

> 참고로 Reactive Programming 구현체에서는 다음과 같이 마블 다이어그램을 통해 연산자의 동작 방식을 표현하고 있다.

![](https://user-images.githubusercontent.com/30178507/109169898-9f4ec600-77c3-11eb-832a-eb476b459dd7.png)

### 체이닝

대부분의 `Operators`은 Observable을 리턴한다. 즉, `Operators`를 이어서 실행할 수 있는 체이닝이 가능하다는 의미이다. `Observable` 체인은 체인을 시작하는 원래 `Observable`에서 독립적으로 작동하지는 않지만 각 연산자는 체인의 직전 생성자에서 생성된 `Observable`에서 동작한다.

이런 체이닝은 내부적으로는 비동기로 동작하지만 코드상으로는 동기적으로 작성할 수 있도록 도와준다.

## Funtional Reactive Programming `FRP`에 대해서

때때로 Reactive Programming에 대해 Functional Reactive Programming이라고 칭하는 경우가 있다. 다만, 적어도 ReactiveX의 구현체들 `RxJava, RxJS` 등은 FRP가 아니다.

> It is sometimes called “functional reactive programming” but this is a misnomer. ReactiveX may be functional, and it may be reactive, but “functional reactive programming” is a different animal.

Funtional Reactive Programming은 시간이 지남에 따른 지속적인 값의 변화를 원칙으로한다. 하지만 Reactive Programming은 시간이 지남에 따라 방출되는 이산형 값에 대해 동작한다. 또한 데이터 스트림을 병합하는 과정에서 사이드이펙트를 일으킬 수 있다. `순수하지 못한 함수`

이런 원칙부터 Funtional Reactive Programming을 따르지 않으므로 `Functional하다` 라고는 말할 수 있겠지만 Funtional Reactive Programming이라고 말하기는 어렵다.
