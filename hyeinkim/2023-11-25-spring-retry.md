# Spring-retry

## Retry가 사용되는 경우

외부 서비스에 데이터를 조회할 때, 잠시 서버에 문제가 생기거나 네트워크 오류로 응답을 받지 못할 때가 있다. 이런 경우 다시 요청을 하면 응답을 받을 수 있는 확률이 높기 때문에 재시도를 한다.

## Retry 정책

### SimpleRetryPolicy

- 예외 집합에 대해 고정된 횟수만큼 재시도하는 정책
- `maxAttempts`를 명시하지 않을 경우, 기본 최대 3번까지 재시도

```kotlin
RetryTemplate.builder()
            .maxAttempts(5) // 최대 5번까지 재시도
            .retryOn(TimeoutException::class.java)
            .build()
```

## BackOff 정책

| Backoff 정책 | delay | maxDelay | multiplier | random |
| --- | --- | --- | --- | --- |
| FixedFixBackOffPolicy | o | x | x | x |
| UniformRandomBackOffPolicy | o | o | x | x |
| ExponentialBackOffPolicy | o | o | o | x |
| ExponentialRandomBackOffPolicy | o | o | o | o |
- `delay`
    - 재시도 사이의 대기 시간
        - Fixed인 경우 기간 (`backOffPeriod`)
        - Exponential 인 경우 초기값 (`initialInterval`)
        - Uniform 인 경우 최소값 (`minInterval`)
    - 기본은 1000ms
- `maxDelay`
    - 재시도 사이의 최대 대기 시간
- `multiplier`
    - 다음 백오프 지연을 계산하는 데 사용할 승수
- `random`
    - `multiplier` 가 0보다 클 경우 백오프 지연을 지터로 무작위화

### FixedBackOffPolicy

- 재시도 하기 전 일정 기간 동안 대기하는 정책
    - 설정한 기간(`backOffPeriod`) 만큼 sleep
- `backOffPeriod` 을 명시하지 않을 경우 기본 1초

```java
protected void doBackOff() throws BackOffInterruptedException {
		try {
			sleeper.sleep(this.backOffPeriod.get());
		}
		catch (InterruptedException e) {
			throw new BackOffInterruptedException("Thread interrupted while sleeping", e);
		}
	}
```

### UniformRandomBackOffPolicy

- 재시도 하기 전 랜덤한 기간 동안 대기하는 정책
    - 최소(`minBackOffPeriod`)와 최대 기간(`maxBackOffPeriod`) 사이 랜덤한 기간만큼 sleep

```java
protected void doBackOff() throws BackOffInterruptedException {
		try {
			Long min = this.minBackOffPeriod.get();
			long delta = this.maxBackOffPeriod.get() == this.minBackOffPeriod.get() ? 0
					: this.random.nextInt((int) (this.maxBackOffPeriod.get() - min));
			this.sleeper.sleep(min + delta);
		}
		catch (InterruptedException e) {
			throw new BackOffInterruptedException("Thread interrupted while sleeping", e);
		}
	}
```

### ExponentialBackOffPolicy

- 지수 형태의 백오프 기간 동안 대기하는 정책. 매 시도 후 대기 시간이 기하급수적으로 증가한다.
    - interval과 maxInterval 중 더 큰 interval만큼 sleep. 다음은 현재 interval * multiplier sleep

```java
@Override
	public void backOff(BackOffContext backOffContext) throws BackOffInterruptedException {
		ExponentialBackOffContext context = (ExponentialBackOffContext) backOffContext;
		try {
			long sleepTime = context.getSleepAndIncrement();
			if (this.logger.isDebugEnabled()) {
				this.logger.debug("Sleeping for " + sleepTime);
			}
			this.sleeper.sleep(sleepTime);
		}
		catch (InterruptedException e) {
			throw new BackOffInterruptedException("Thread interrupted while sleeping", e);
		}
	}
```

```java
static class ExponentialBackOffContext implements BackOffContext {

		private final double multiplier;

		private long interval;

		private final long maxInterval;

		private Supplier<Long> intervalSupplier;

		private Supplier<Double> multiplierSupplier;

		private Supplier<Long> maxIntervalSupplier;

		public ExponentialBackOffContext(long interval, double multiplier, long maxInterval,
				Supplier<Long> intervalSupplier, Supplier<Double> multiplierSupplier,
				Supplier<Long> maxIntervalSupplier) {
			this.interval = interval;
			this.multiplier = multiplier;
			this.maxInterval = maxInterval;
			this.intervalSupplier = intervalSupplier;
			this.multiplierSupplier = multiplierSupplier;
			this.maxIntervalSupplier = maxIntervalSupplier;
		}

		public synchronized long getSleepAndIncrement() {
			long sleep = getInterval();
			long max = getMaxInterval();
			if (sleep > max) {
				sleep = max;
			}
			else {
				this.interval = getNextInterval();
			}
			return sleep;
		}

		protected long getNextInterval() {
			return (long) (this.interval * getMultiplier());
		}

		public double getMultiplier() {
			return this.multiplierSupplier != null ? this.multiplierSupplier.get() : this.multiplier;
		}

		public long getInterval() {
			return this.intervalSupplier != null ? this.intervalSupplier.get() : this.interval;
		}

		public long getMaxInterval() {
			return this.maxIntervalSupplier != null ? this.maxIntervalSupplier.get() : this.maxInterval;
		}

	}
```

### ExponentialRandomBackOffPolicy

- 지수 백오프에서 임의성을 추가
- 지터
    - 백오프에 일정 수준의 임의성을 추가하여 재시도가 시간을 두고 분산되게 한다.
- ExponentialBackOffPolicy 확장

```java
static class ExponentialRandomBackOffContext extends ExponentialBackOffPolicy.ExponentialBackOffContext {

		private final Random r = new Random();

		public ExponentialRandomBackOffContext(long expSeed, double multiplier, long maxInterval,
				Supplier<Long> expSeedSupplier, Supplier<Double> multiplierSupplier,
				Supplier<Long> maxIntervalSupplier) {

			super(expSeed, multiplier, maxInterval, expSeedSupplier, multiplierSupplier, maxIntervalSupplier);
		}

		@Override
		public synchronized long getSleepAndIncrement() {
			long next = super.getSleepAndIncrement();
			next = (long) (next * (1 + r.nextFloat() * (getMultiplier() - 1)));
			if (next > super.getMaxInterval()) {
				next = super.getMaxInterval();
			}
			return next;
		}

	}
```

## Retry 예제

### dependency 추가

```kotlin
dependencies {
    implementation("org.springframework.retry:spring-retry:2.0.4")
		implementation("org.springframework:spring-aspects") // @Retryable을 사용할 경우
}
```

### 1. @Retryable

@Retryable은 Spring AOP를 사용하기 때문에 spring-aspects 의존성도 추가해줘야 한다.

```kotlin
@EnableRetry
@SpringBootApplication
class SpringRetryApplication
```

```kotlin
    @Retryable(
        retryFor = [TimeoutException::class],
        maxAttempts = 5,
        backoff = Backoff(delay = 1000, maxDelay = 5000, multiplier = 2.0, random = true),
    )
    fun getHotels(hotelIds: List<Long>): List<HotelDto> {
        // 호텔 목록 조회
        logger.info("호텔 목록을 가져옵니다...")
        throw TimeoutException("read timeout")
    }
```

- `retryFor` : TimeoutException이 발생하면 재시도
- `maxAttempts` : 최대 5번까지 재시도
- `backoff`
    - `ExponentialRandomBackOffPolicy`
    - 재시도시 처음은 1초 대기, 그 이후는 1

고정으로 연속해서 재시도할 경우, 외부 서버의 rate limit(처리율 제한)에 막힐 수 있다. rate limit을 회피하면서 재시도를 해서 응답 성공을 높일 수 있다.

```java
    @Recover
    fun recover(e: TimeoutException, hotelIds: List<Long>): List<HotelDto> {
        throw RuntimeException("호텔 조회가 실패했습니다. $hotelIds")
    }
```

- 최대 재시도 횟수까지 요청후 실패하면 `@Recover` 의 메서드가 호출된다.
- 리턴값이 재시도하는 메서드와 같은 타입이어야 한다.

```java
2023-11-18 10:21:04.977  INFO 50330 --- 호텔 목록을 가져옵니다...
2023-11-18 10:21:06.929  INFO 50330 --- 호텔 목록을 가져옵니다...
2023-11-18 10:21:10.271  INFO 50330 --- 호텔 목록을 가져옵니다...
2023-11-18 10:21:15.277  INFO 50330 --- 호텔 목록을 가져옵니다...
2023-11-18 10:21:20.283  INFO 50330 --- 호텔 목록을 가져옵니다...

java.lang.RuntimeException: 호텔 조회가 실패했습니다. [1, 2, 3, 4]
```

```kotlin
    @Retryable(
        maxAttempts = 5,
        backoff = Backoff(delay = 1000, maxDelay = 5000, multiplier = 2.0, random = true),
        noRetryFor = [IllegalArgumentException::class],
    )
    fun getHotels(hotelIds: List<Long>): List<HotelDto> {
        // 호텔 목록 조회
        logger.info("호텔 목록을 가져옵니다...")
        if (hotelIds.contains(-1)) {
            throw IllegalArgumentException("유효하지 않은 호텔 ID 입니다")
        }
        throw TimeoutException("read timeout")
    }
```

- `maxAttempts` : 최대 5번까지 재시도
- `backoff`
    - `ExponentialRandomBackOffPolicy`
    - 재시도 할 때 1초 ~ 최대 5초까지 랜덤한 간격을 두고 요청한다.
- `noRetryFor` : `IllegalArgumentException` 이 발생할 경우 재시도하지 않는다.

-1 처럼 유효하지 않은 ID가 올 경우 재시도를 해도 성공할 수 없다. 이 때 `noRetryFor`를 사용하면 다른 `Exception`은 재시도를 하되, `IlleagalArgumentException`이 발생하면 재시도를 하지 않을 수 있다. 이처럼 특정 Exception에만 재시도 하기를 원하지 않을 경우 사용한다.

```java
2023-11-18 10:24:20.552  INFO 50379 --- 호텔 목록을 가져옵니다...

Cannot locate recovery method; nested exception is java.lang.IllegalArgumentException: 유효하지 않은 호텔 ID 입니다
```

참고 : recovery 메서드를 지정하지 않으면 ‘Cancot locate recovery method’가 뜬다. 

### 2. RetryTemplate

```kotlin
@Configuration
class RetryConfig {

    @Bean
    fun fixedRetryTemplate(): RetryTemplate {
        return RetryTemplate.builder()
            .maxAttempts(5)
            .fixedBackoff(1000) // FixedBackOffPolicy
            .retryOn(TimeoutException::class.java)
            .build()
    }
}
```

```kotlin
    fun getBooking(bookingId: Long): BookingDto {
        return fixedRetryTemplate.execute(RetryCallback<BookingDto, TimeoutException> {
            logger.info("예약을 가져옵니다... (${it.retryCount + 1})")
            throw TimeoutException("read timeout")
        }, RecoveryCallback {
            throw RuntimeException("예약 조회가 실패했습니다.")
        })
    }
```

```java
public interface RetryOperations {

	<T, E extends Throwable> T execute(RetryCallback<T, E> retryCallback) throws E;

	<T, E extends Throwable> T execute(RetryCallback<T, E> retryCallback, RecoveryCallback<T> recoveryCallback)
			throws E;

	<T, E extends Throwable> T execute(RetryCallback<T, E> retryCallback, RetryState retryState)
			throws E, ExhaustedRetryException;

	<T, E extends Throwable> T execute(RetryCallback<T, E> retryCallback, RecoveryCallback<T> recoveryCallback,
			RetryState retryState) throws E;

}
```

```java
public interface RetryCallback<T> {

    T doWithRetry(RetryContext context) throws Throwable;
}
```

## 참고자료

[https://github.com/spring-projects/spring-retry](https://github.com/spring-projects/spring-retry)

[https://medium.com/@vmoulds01/springboot-retry-random-backoff-136f41a3211a](https://medium.com/@vmoulds01/springboot-retry-random-backoff-136f41a3211a)