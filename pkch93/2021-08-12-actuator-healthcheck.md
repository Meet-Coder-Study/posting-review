# Spring Boot Actuator와 헬스체크

- [Spring Boot Actuator와 헬스체크](#spring-boot-actuator와-헬스체크)
  - [Actuator health](#actuator-health)
  - [Cloud와 헬스체크](#cloud와-헬스체크)
  - [참고](#참고)

Spring Boot Actuator를 사용하면 기본적으로 health에 대해서 노출을 한다. `management.endpoints.web.exposure.include`의 health가 기본적으로 설정이 되어있기 때문이다.

Actuator의 health는 `/actuator/health`로 지원하며 path는 `management.endpoints.web.base-path`와 `management.endpoints.web.path-mapping.health`로 변경할 수 있다.

> `management.endpoints.web.base-path`의 기본값은 `/actuator`이고 `management.endpoints.web.path-mapping.health`의 기본값은 `/health`이다. 이들 각 값은 변경하여 actuator endpoint를 변경할 수 있다.

Spring Boot Actuator의 헬스체크는 애플리케이션 뿐만 아니라 애플리케이션에서 `starter` 의존성으로 포함한 도구들까지 헬스체크를 한다.

`spring-boot-starter-data-jpa`라면 등록한 DataSource의 url로 등록한 데이터베이스에 헬스체크를 하고 `spring-boot-starter-redis`를 사용한다면 등록한 redis에 헬스체크를 한다.

헬스체크를 하는 것까지는 좋지만 만약 하나의 서비스라도 헬스체크에 실패한다면 Actuator의 헬스체크는 503 에러를 응답하면서 실패하게된다.

## Actuator health

```groovy
// build.gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '2.5.3'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
}

group 'edu.pkch'
version '1.0.0'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'

    runtimeOnly 'mysql:mysql-connector-java'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

test {
    useJUnitPlatform()
}
```

위와 같이 actuator와 테스트를 위해 jpa, redis starter 의존성을 넣었다.

```yaml
# application.yml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/test?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: root
    password: password

  redis:
    host: localhost
    port: 6379
```

```yaml
# docker-compose.yml
version: "3.9"
services:
  db:
    image: mysql:5.7.35
    container_name: actuator-test-db
    ports:
      - '3306:3306'
    environment:
      - MYSQL_DATABASE=test
      - MYSQL_ROOT_PASSWORD=password
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
  redis:
    image: redis:latest
    container_name: actuator-test-redis
    ports:
      - '6379:6379'
```

그리고 로컬에서 mysql과 redis를 띄울 수 있도록 `docker-compose` 파일 설정을 하고 애플리케이션이 로컬에 띄워진 mysql과 redis에 연결할 수 있도록 `application.yml`을 설정한다.

mysql과 redis 컨테이너가 띄워진 상태에서 애플리케이션을 띄우고 actuator의 헬스체크 엔드포인트인 `/actuator/health`를 호출하면 다음과 같이 응답이 나타난다.

```bash
$ curl -v http://localhost:8080/actuator/health
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 8080 (#0)
> GET /actuator/health HTTP/1.1
> Host: localhost:8080
> User-Agent: curl/7.64.1
> Accept: */*
>
< HTTP/1.1 200
< Content-Type: application/vnd.spring-boot.actuator.v3+json
< Transfer-Encoding: chunked
< Date: Thu, 12 Aug 2021 14:17:29 GMT
<
* Connection #0 to host localhost left intact
{"status":"UP"}* Closing connection 0
```

mysql과 redis가 띄워진 상태이기 때문에 문제없이 200 응답이 나타난다.

좀더 구체적인 응답을 보고싶다면 `management.endpoint.health.show-details=always` 설정을 추가한다.

```yaml
management:
  endpoint:
    health:
      show-details: always
```

위 설정을 추가하고 `/actuator/health`를 호출하면 다음과 같은 응답을 볼 수 있다.

```bash
$ curl -v http://localhost:8080/actuator/health
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 8080 (#0)
> GET /actuator/health HTTP/1.1
> Host: localhost:8080
> User-Agent: curl/7.64.1
> Accept: */*
>
< HTTP/1.1 200
< Content-Type: application/vnd.spring-boot.actuator.v3+json
< Transfer-Encoding: chunked
< Date: Thu, 12 Aug 2021 14:20:45 GMT
<
* Connection #0 to host localhost left intact
{"status":"UP","components":{"db":{"status":"UP","details":{"database":"MySQL","validationQuery":"isValid()"}},"diskSpace":{"status":"UP","details":{"total":1000240963584,"free":765815021568,"threshold":10485760,"exists":true}},"ping":{"status":"UP"},"redis":{"status":"UP","details":{"version":"6.2.5"}}}}* Closing connection 0
```

컴포넌트 중 db와 redis가 떠져있다는 의미로 `status`가 `UP`으로 응답이 내려온다.

이 상태에서 만약 redis 컨테이너를 내리면 어떻게 될까?

```bash
$ docker stop actuator-test-redis
```

위 명령어로 docker-compose로 띄웠던 redis 컨테이너를 종료한다. 그 후 `/actuator/health`를 호출하면 503 에러를 볼 수 있다.

```bash
$ curl -v http://localhost:8080/actuator/health
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 8080 (#0)
> GET /actuator/health HTTP/1.1
> Host: localhost:8080
> User-Agent: curl/7.64.1
> Accept: */*
>
< HTTP/1.1 503
< Content-Type: application/vnd.spring-boot.actuator.v3+json
< Transfer-Encoding: chunked
< Date: Thu, 12 Aug 2021 14:23:44 GMT
< Connection: close
<
* Closing connection 0
{"status":"DOWN","components":{"db":{"status":"UP","details":{"database":"MySQL","validationQuery":"isValid()"}},"diskSpace":{"status":"UP","details":{"total":1000240963584,"free":765835714560,"threshold":10485760,"exists":true}},"ping":{"status":"UP"},"redis":{"status":"DOWN","details":{"error":"org.springframework.dao.QueryTimeoutException: Redis command timed out; nested exception is io.lettuce.core.RedisCommandTimeoutException: Command timed out after 300 millisecond(s)"}}}}%
```

redis와 헬스체크가 실패하면서 `status`가 `DOWN`으로 변경된 것을 볼 수 있다.

그렇다면 `/actuator/health` 이외에 애플리케이션에서 제공하는 다른 엔드포인트도 503 에러가 나타나는걸까?

```java
@GetMapping("/health")
public String health() {
    return "OK";
}
```

위와 같이 `/health` 엔드포인트를 하나 추가한 후 다시 애플리케이션을 실행해본다.

```java
$ curl -v http://localhost:8080/health
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 8080 (#0)
> GET /health HTTP/1.1
> Host: localhost:8080
> User-Agent: curl/7.64.1
> Accept: */*
>
< HTTP/1.1 200
< Content-Type: text/plain;charset=UTF-8
< Content-Length: 2
< Date: Thu, 12 Aug 2021 14:27:18 GMT
<
* Connection #0 to host localhost left intact
OK* Closing connection 0
```

위 `/health`는 정상적으로 200 응답을 주는 것을 확인할 수 있다. 즉, 애플리케이션은 정상이지만 헬스체크에서 503 Service UnAvailable 응답이 나타나는 것이다.

> 물론 redis를 사용하는 기능에서는 문제가 발생한다.

## Cloud와 헬스체크

클라우드에서는 인스턴스 그룹 관리로 헬스체크를 통해 해당 인스턴스에 트래픽을 보낼지와 인스턴스를 종료하고 새로 띄울지 등의 기능을 제공한다.

> 헬스체크는 3대 클라우드 서비스인 AWS, GCP, MS Azure에서 모두 지원한다.
>
> 이 글에서는 AWS를 주로 사용했으므로 AWS를 기준으로 한다.

AWS에서는 하나 이상의 대상에 요청을 라우팅하기위해 대상 그룹 `Target Group`을 사용한다. 보통 ELB에 대상 그룹을 연결하여 사용한다.

이때 AWS에서 인스턴스의 상태가 UnHealthy가 되면 다른 HTTP 503 Service Unavailable 에러 응답을 전달한다.

즉, `/actuator/health`를 사용하는 상태에서 redis를 사용하지 않는 다른 기능은 사용이 가능하지만 전체 기능이 다운되는 현상이 발생할 수 있다.

따라서 `/actuator`의 헬스체크는 Target Group의 헬스체크로 사용하지 않고 별도 헬스체크 엔드포인트를 만들어 활용하거나 `management.health.defaults.enabled=false` 설정을 통해 다른 시스템의 상태가 애플리케이션에 영향을 주지 않도록 만드는 것이 좋아보인다.

## 참고

Actuator health endpoint: [https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.health](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.health)