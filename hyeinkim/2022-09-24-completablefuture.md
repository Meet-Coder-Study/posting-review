# CompletableFuture
- `implements Future<T>, CompletionStage<T>`

## Future의 문제점

- Future를 외부에서 완료시킬 수 없다. (취소하거나 get()에 타임아웃 설정할 수는 있다.)
- 블로킹 코드(`get()`)를 사용하지 않고서는 작업이 끝났을 때 콜백을 실행할 수 없다.
- 여러 Future를 조합할 수 없다.
    - 예) Event 정보 가져온 다음 Event에 참석하는 회원 목록 가져오기
- 예외 처리용 API를 제공하지 않는다.

```kotlin
val executorService = Executors.newFixedThreadPool(4)
val future = executorService.submit(() -> "hello");
```

## CompletableFuture의 장점

- 스레드의 선언 없이 비동기 연산 작업을 구현할 수 있고 병렬 프로그래밍이 가능
- 파이프라인 형태로 작업을 연결할 수 있어서 비동기 작업의 순서를 정의하고 관리할 수 있다.

## 1. 비동기로 작업 실행

### runAsync()

- Runnable 구현체를 이용해서 비동기 연산 작업을 하기 위한 새로운 CompletableFuture 객체를 리턴한다.
- Runnable의 run 메서드는 void 타입이기 때문에 값을 외부에 리턴할 수 없다. (스레드 실행 결과를 확인할 수 없다)

```java
public static CompletableFuture<Void> runAsync(Runnable runnable) {
	return asyncRunStage(ASYNC_POOL, runnable);
}
```

```kotlin
@Test
fun `runAsync`() {
	val completableFuture = CompletableFuture.runAsync {
		// [ForkJoinPool.commonPool-worker-19] : Hello
		println("[${Thread.currentThread().name}] : Hello")
	}
}
```

### supplyAsync()

- Supplier 구현체를 이용해서 비동기 연산 작업을 하기 위한 새로운 CompletableFuture 객체를 리턴한다.
    - Supplier : 파라미터 없이 리턴 값만 있는 경우 사용
- Supplier는 리턴 값이 있기 때문에 받아서 결과를 확인할 수 있다.

```java
public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier) {
	return asyncSupplyStage(ASYNC_POOL, supplier);
}
```

```kotlin
@Test
fun `supplySync`() {
	val completableFuture = CompletableFuture.supplyAsync {
		println("[${Thread.currentThread().name}] : Hello")
		"Hello"
	}
    assertThat(completableFuture.get()).isEqualTo("Hello")
}
```

## 2. 콜백 제공

### thenApply(Function)

- 현재 단계가 성공적으로 종료되었을 경우, 메서드의 파라미터로 전달된 Function 구현체를 실행하기 위한 CompletionStage 객체를 리턴한다.
    - Function : 전달할 파라미터를 다른 값으로 변환해서 리턴할 때 사용
- 리턴 값을 받아서 다른 값으로 바꾸는 콜백
- ex) API 요청 후 리턴 값을 DTO로 변환

```java
public <U> CompletableFuture<U> thenApply(Function<? super T,? extends U> fn) {
	return uniApplyStage(null, fn);
}
```

```kotlin
@Test
fun `thenApply 리턴 값을 받아 다른 값으로 바꾸는 콜백`() {
	val completableFuture = CompletableFuture.supplyAsync {
		println("[${Thread.currentThread().name}] : Hello")
		"Hello"
    }.thenApply { s ->
		println("[${Thread.currentThread().name}] : $s")
        s.uppercase()
    }

    assertThat(completableFuture.get()).isEqualTo("HELLO")
}
```

### thenAccept(Consumer)

- 현재 단계가 성공적으로 종료되었을 경우, 메서드의 파라미터로 전달된 Consumer 구현체를 실행하기 위한 CompletionStage 객체를 리턴한다.
    - Consumer : 파라미터를 전달해서 처리한 후 결과를 리턴받을 필요가 없을 때 사용
- 리턴 값을 또 다른 작업으로 처리하는 콜백
- ex) API 요청 작업 후 리턴 값을 로깅

```java
public CompletableFuture<Void> thenAccept(Consumer<? super T> action) {
	return uniAcceptStage(null, action);
}
```

```kotlin
@Test
fun `thenAccept 리턴 값을 받아 다른 작업으로 처리하는 콜백`() {
	val completableFuture = CompletableFuture.supplyAsync {
		println("[${Thread.currentThread().name}] : Hello")
        "Hello"
	}.thenAccept { s ->
		println("[${Thread.currentThread().name}] : $s")
	}
	completableFuture.get()
}
```

### thenRun(Runnable)

- 현재 단계가 성공적으로 종료되었을 경우, 메서드의 파라미터로 전달된 Runnable 구현체를 실행하기 위한 CopletionState 객체를 리턴한다.
- 결과 값 없이 다음 작업을 실행하는 콜백

```java
public CompletableFuture<Void> thenRun(Runnable action) {
	return uniRunStage(null, action);
}
```

```kotlin
@Test
fun `thenRun 다음 작업 실행하는 콜백`() {
	val completableFuture = CompletableFuture.runAsync {
		println("[${Thread.currentThread().name}] : Hello")
    }.thenRun {
        println("[${Thread.currentThread().name}] : World")
    }
}
```

## 3. 조합

### thenCompose()

- 두 작업이 서로 이어서 실행하도록 조합한다.

```kotlin
@Test
fun `thenCompose 두 작업을 이어서 실행`() {
	val helloWorld = CompletableFuture.supplyAsync {
			"Hello"
	}.thenCompose { s -> CompletableFuture.supplyAsync { "$s World" } }

	assertThat(helloWorld.get()).isEqualTo("Hello World")
}
```

### thenCombine()

- 두 작업을 독립적으로 실행하고 다 종료했을 때 콜백 실행

### allOf()

- 여러 작업을 모두 실행하고 모든 작업 결과에 콜백 실행

### anyOf()

- 여러 작업을 모두 실행하고 모든 작업 결과에 콜백 실행

## 4. 예외 처리

### exeptionally(Function)

```kotlin
@Test
fun `exceptionally 예외 처리`() {
	val throwError = true
	val hello = CompletableFuture.supplyAsync {
		if (throwError) {
			throw IllegalArgumentException()
        }
		println("[${Thread.currentThread().name}] : Hello")
        "Hello"
    }.exceptionally { error ->
		println(error)
        "Error"
    }
    assertThat(hello.get()).isEqualTo("Error")
}
```

## Q. 스레드 풀을 만들지 않고 어떻게 별도 스레드에서 동작했을까?

- ForkJoinPool
    - Java7부터 제공. `Executor` 구현체.
- 따로 스레드 풀을 적용하고 싶으면 두 번째 파라미터에 `Executor`를 지정해주면 된다.

```java
public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier,Executor executor) {
	return asyncSupplyStage(screenExecutor(executor), supplier);
}
```

## 참고자료

- [더 자바, Java8](https://www.inflearn.com/course/the-java-java8/dashboard)
- [Practical 모던 자바](http://www.yes24.com/Product/Goods/92529658)
- [Guide To CompletableFuture](https://www.baeldung.com/java-completablefuture)