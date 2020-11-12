# Micrometer

Micrometer docs: [https://micrometer.io/docs/concepts](https://micrometer.io/docs/concepts)

Micrometer는 JVM 기반의 애플리케이션에서 메트릭을 수집하기 위한 라이브러리이다. Micrometer는 로깅에서 Facade 역할을 하는 slf4j와 같이 메트릭의 Facade 역할을 한다. 때문에 애플리케이션에서 사용할 메트릭 벤더를 정하고 사용할 필요없이 다양한 벤더를 사용하도록 만들어준다.

## Registry

`Meter`는 애플리케이션에서 메트릭 수집을 위한 인터페이스이다.

Micrometer의 Meter들은 `MeterRegistry`가 생성을 담당한다. 각 모니터링 시스템들은 `MeterRegistry` 구현체를 지원한다. Micrometer에서는 메모리에 meter의 마지막 값을 가지고 있는 `SimpleMeterRegistry`를 지원한다.

```java
MeterRegistry registry = new SimpleMeterRegistry();
```

참고로 `SimpleMeterRegistry`는 Spring에서 주입받을 수 있다.

### Composite registries

Micrometer는 하나 이상의 모니터링 시스템에 동시에 메트릭을 전달할 수 있도록 `CompositeMeterRegistry`를 지원한다.

```java
CompositeMeterRegistry composite = new CompositeMeterRegistry();

Counter compositeCounter = composite.counter("counter");
compositeCounter.increment(); (1)

SimpleMeterRegistry simple = new SimpleMeterRegistry();
composite.add(simple); (2)

compositeCounter.increment(); (3)
```

1. `compositeCounter`의 count를 증가시킨다. 단, 아직 CompositeMeterRegister에는 어떤 Register도 등록된 것이 없기 때문에 여전히 counter는 0이다.
2. CompositeMeterRegister에 SimpleMeterRegistry를 등록
3. CompositeMeterRegister에 MeterRegistry가 등록되어있으므로 counter가 1 증가한다. 만약 여러 MeterRegistry가 등록되어있다면 다른 모든 MeterRegistry들도 counter가 1 증가한다.

## Meters

> Meter는 수집하고자 하는 메트릭을 의미

Micrometer는 `Timer`, `Counter`, `Gauge`, `DistributionSummary`, `LongTaskTimer`, `FunctionCounter`, `FunctionTimer`, `TimeGauge` 를 포함한 Meter를 지원한다.

- Timer: 시스템의 latency(지연 시간) 혹은 이벤트 빈도를 측정하기 위해서 Timers를 사용할 수 있다. Timer는 이벤트가 발생한 수와 총 시간을 기록한다.
- Counter: Counter는 애플리케이션에서 특정 속성에 대한 카운트를 기록한다. Build method 혹은 MetricRegistry의 helper method를 통해 custom counter를 생성할 수 있다.
- Gauge: Gauge는 Meter의 현재 값을 보여준다. 다른 Meter와 다르게 Guage는 데이터의 변경이 관찰 된 경우에만 데이터를 기록한다. 캐시 등의 통계를 모니터링 할 때 유용하다.

meter는 자체 `name`과 `dimension`으로 유니크하게 구별할 수 있다. `dimension`은 다르게 말하면 `tag`와 같다. Micrometer에서도 Tag 인터페이스를 지원한다.

일반적으로 `name`을 피벗으로 사용할 수 있어야한다.
`dimensions`은 특히 이름이 붙은 메트릭에 대해 상위 단계에서 하위 단계로 메트릭을 조회할 수 있도록 허용한다.

> 아마 피벗 `pivot`은 '기준' 이라고 바꿔 말할 수 있을거 같다.

### Naming Meters

Micrometer는 네이밍컨벤션으로 기본적으로 소문자를 사용하며 `.`을 구분한다. `ex. counter.sqs`

모니터링 시스템에서는 각각 자신들이 추천하는 네이밍컨벤션이 있는데 Micrometer에서 이에 맞게 변경해준다. 즉, Micrometer의 네이밍컨벤션으로 등록을 하면 각 모니터링 구현체에 맞게 네이밍을 변경해준다.

만약 Micrometer의 기본 네이밍컨벤션을 변경하고 싶다면 `NamingConvention`을 구현하여 등록해주어야한다.

```java
registry.config().namingConvention(myCustomNamingConvention);
```

> 참고! 각 시스템의 네이밍컨벤션

1. Prometheus - http_server_requests_duration_seconds `snake_case`
2. Atlas - httpServerRequests `camelCase`
3. Graphite - http.server.requests `.`
4. InfluxDB - http_server_requests `snake_case`

#### Tag Naming

```java
registry.counter("database.calls", "db", "users")
registry.counter("http.requests", "uri", "/api/users")
```

database와 http request의 콜수 측정을 가정한다.

Micrometer에서는 `database.calls`나 `http.requests`와 같이 의미있는 최소한의 단위까지 설정해주는 것을 권장한다. 그 후에 하위 단위로 `db`나 `uri` 이름을 추가하여 그룹화 할 수 있다.

```java
registry.counter("calls", "class", "database", "db", "users");

registry.counter("calls", "class", "http", "uri", "/api/users");
```

위와 같이 calls로 묶어서 database나 http request의 콜수를 집계하는 것은 추천하지 않는 방식이다.

#### Common tags

Registry 수준에서 Common Tags를 설정할 수 있다. 이때 등록된 Common Tags들은 모니터링 시스템에 보고된 모든 메트릭에 추가된다.

보통 `host`, `instance`, `region`, `stack` 등과 같이 운영환경에서 상위 수준에서 하위 수준으로 조회할 수 있도록 사용한다.

> 참고로 Spring에서는 `MeterRegistryCustomizer` 빈으로 common tags를 추가할 수 있다.

#### Tag values

태그의 값은 null이 되면 안된다.

## Meter Filters

각각의 Registry들은 여러 Meter Filter들로 구성한다. 이를 통해 메트릭에 대한 세밀한 제어를 가능하게 한다. Meter Filters는 크게 3가지 기능을 제공한다.

1. Deny/Accept
2. Transform
3. Configure

아래는 meterFiler의 예시이다.

```java
registry.config()
    .meterFilter(MeterFilter.ignoreTags("too.much.information"))
    .meterFilter(MeterFilter.denyNameStartsWith("jvm"));
```

위와 같이 체이닝으로 여러 MeterFilter를 등록할 수 있다.

### Deny/Accept

```java
new MeterFilter() {
    @Override
    public MeterFilterReply accept(Meter.Id id) {
       if(id.getName().contains("test")) {
          return MeterFilterReply.DENY;
       }
       return MeterFilterReply.NEUTRAL;
    }
}
```

다음은 Meter Filter의 예시이다.
들어오는 Meter에 대해서 `MeterFilterReply`를 리턴하는데 `MeterFilterReply`의 상태를 통해 Meter를 등록할 지 말지 필터링한다.

MeterFilterReply의 상태는 3가지가 존재한다.

1. `DENY`: meter를 등록하지 않음
2. `NEUTRAL`: 해당 meter에 대해 다른 MeterFilter들이 `DENY`하지 않는다면 등록.
3. `ACCEPT`: MeterFilter에서 `ACCEPT`를 반환하면 해당 meter는 즉시 등록된다.

### Transform

```java
new MeterFilter() {
    @Override
    public Meter.Id map(Meter.Id id) {
       if(id.getName().startsWith("test")) {
          return id.withName("extra." + id.getName()).withTag("extra.tag", "value");
       }
       return id;
    }
}
```

Transform 설정 예시는 위와 같다. 위 에시는 `test`로 시작하는 meter에 대해서 prefix를 추가하는 Transform 방식이다. 즉, meter의 이름을 변경하도록 만들 수 있다. 이 기능을 사용하기 위해서는 `Meter.Id`를 리턴한다.

### Configure

`Timer`와 `DistributionSummary`는 filter들을 통해 구성할 수 있는 `count`, `total`, `max` 같은 값을 포함하는 분산 통계 정보를 담고 있다. 미리 계산된 퍼센트, SLAs, 히스토그램도 분산 통계 정보에 포함된다.

```java
new MeterFilter() {
    @Override
    public DistributionStatisticConfig configure(Meter.Id id, DistributionStatisticConfig config) {
        if (id.getName().startsWith(prefix)) {
            return DistributionStatisticConfig.builder()
                    .publishPercentiles(0.9, 0.95)
                    .build()
                    .merge(config);
        }
        return config;
    }
};
```

일반적으로 구성하고자 하는 정보를 모아서 `DistributionStatisticConfig`를 구성해야한다. 그리고 파라미터로 전달된 config와 `merge`가 필요하다.

Spring Boot에서는 name prefix에 대한 퍼센트, SLAs, 히스토그램 정보를 구성하기 위한 property 기반의 필터를 제공한다.

## With Spring Boot Actuator

Spring Boot 공식문서 참고: [https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#production-ready-metrics](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#production-ready-metrics)

Spring Camp 2019 Monitoring with Actuator: [https://www.youtube.com/watch?v=l-fsLKrePQg](https://www.youtube.com/watch?v=l-fsLKrePQg)

Spring Boot Actuator는 Micrometer에 대한 Auto-Configuration을 지원한다. 이를 통해 Actuator에서 제공하는 다양한 메트릭들을 Micrometer와 함께 모니터링 시스템에서 활용할 수 있다.

Auto-Configuration을 활용하려면 먼저 사용하고자 하는 모니터링 툴의 Micrometer Registry 의존성 설정이 필요하다.

```groovy
// build.gradle
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-actuator'
	implementation 'io.micrometer:micrometer-registry-influx'
}
```

위와 같이 influxDB의 Micrometer Registry 의존성 설정을 하면 자동으로 Spring Boot에서 설정을 해준다.

InfluxDB 외에도 Prometheus, New Relic, JMX 등 다양한 모니터링 툴을 지원한다. 각종 모니터링 툴에 대한 설정은 [이 문서](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#production-ready-metrics-export)를 참고한다.

### 지원하는 메트릭

Spring Boot에서는 다음 메트릭들을 기본 지원해준다.

- JVM 메트릭
  - memory와 buffer pool
  - Garbage Collection
  - Thread Utilization
  - Number of class load/unload
- CPU 메트릭
- File descriptor 메트릭
- kafka consumer와 producer 메트릭
- Log4j2/Logback 메트릭
- Uptime 메트릭
- Tomcat 메트릭

위 기본 메트릭과 함께 다음 의존성이 있는 경우 해당하는 의존성의 메트릭도 지원한다.

- Spring MVC
- Spring WebFlux
- Jersey Server

  micrometer-jersey2 모듈이 classpath에 존재한다면 사용할 수 있다.

- HTTP Client

  RestTemplate이나 WebClient의 메트릭을 지원

- Cache

  Caffeine, EhCache 2, Hazelcast, JCache 구현체를 지원

- DataSource

  `jdbc.connections`가 붙은 메트릭으로 DataSource 메트릭을 수집할 수 있다.

- Hibernate

  Hibernate의 `EntityManagerFactory`가 있다면 사용할 수 있다.

- RebbitMQ
- Kafka

### 커스텀 메트릭

위 지원하는 메트릭 이외에 필요한 메트릭을 사용하고 싶다면 `MeterRegistry`를 사용할 수 있다.
Spring Boot에서는 `MeterRegistry`를 기본 빈으로 제공하고 있으므로 주입 후 원하는 지표를 수집할 수 있다.

```java
@RestController
public class TestController {
		private final Counter counter;

    public CountController(MeterRegistry registry) {
				counter = registry.counter("my.counter", "health");
    }

		@GetMapping("/healthcheck")
		public String health() {
				this.counter.increment();
				return "OK";
		}
}
```

위와 같이 `my.counter`라는 지표명과 `health`라는 태그를 설정한 후 `/healthcheck` 엔드포인트로 접근한 수를 계산하기 위해 counter를 증가시킨다. 이를 통해 내가 원하는 메트릭을 수집할 수 있다.
