# Spring Logback profile 조합 전략

> [예제코드](https://github.com/ksy90101/TIL-ex/tree/master/logback-profile-ex)

## 이전 코드

- 최근 프로젝트를 진행하면서 Logback 관련 공부를 하다가 조합을 이용한 Profile 전략 방식을 발견했다.
- 전에는 아래와 같이 각 프로파일마다 파일을 만들었고, 사실 dev와 prod는 슬랙 알림 방식과 파일 방식은 중복이였다.

### logback-local.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="20 seconds">
    <include resource="org/springframework/boot/logging/logback/base.xml"/>
</configuration>
```

### logback-dev.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="30 seconds">
    <property resource="config/application-log.yml"/>

    <property name="SLACK_WEBHOOK_URI" value="${logging.slack.dev.webhookUri}"/>
    <property name="LOG_PATH" value="../logs"/>

    <timestamp key="dailyLog" datePattern="yyyy-MM-dd"/>

    <!-- File -->
    <appender name="ROLLING" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/logback/logback_dev_${dailyLog}.log</file>
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}:%-3relative][%thread] %-5level %logger{35} - %msg%n</pattern>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/logback/logback_dev_${dailyLog}.%d\(.%i\).log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
    </appender>

    <!-- SLACK -->
    <appender name="SLACK" class="com.github.maricn.logback.SlackAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}:%-3relative][%thread] %-5level %logger{35} - %msg%n</pattern>
        </layout>
        <webhookUri>${SLACK_WEBHOOK_URI}</webhookUri>
        <username>taggle bot</username>
        <colorCoding>true</colorCoding>
    </appender>

    <appender name="ASYNC_SLACK" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="SLACK"/>
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>ERROR</level>
        </filter>
    </appender>

    <root level="error">
        <appender-ref ref="ROLLING"/>
        <appender-ref ref="ASYNC_SLACK"/>
    </root>

</configuration>
```

### logback-prod.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="30 seconds">
    <property resource="config/application-log.yml"/>

    <property name="SLACK_WEBHOOK_URI" value="${logging.slack.prod.webhookUri}"/>
    <property name="LOG_PATH" value="../logs"/>

    <property name="SLACK_WEBHOOK_URI" value="${logging.slack.prod.webhookUri}"/>

    <!-- FILE -->
    <appender name="ROLLING" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/logback/logback_prod_${dailyLog}.log</file>
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}:%-3relative][%thread] %-5level %logger{35} - %msg%n</pattern>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/logback/logback_prod_${dailyLog}.%d\(.%i\).log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
    </appender>

    <!-- SLACK -->
    <appender name="SLACK" class="com.github.maricn.logback.SlackAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <pattern>[%d{yyyy-MM-dd HH:mm:ss}:%-3relative][%thread] %-5level %logger{35} - %msg%n</pattern>
        </layout>
        <webhookUri>${SLACK_WEBHOOK_URI}</webhookUri>
        <username>taggle bot</username>
        <colorCoding>true</colorCoding>
    </appender>

    <appender name="ASYNC_SLACK" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="SLACK"/>
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>ERROR</level>
        </filter>
    </appender>

    <root level="error">
        <appender-ref ref="ROLLING"/>
        <appender-ref ref="ASYNC_SLACK"/>
    </root>

</configuration>
```

- 따라서 이번 기회에 공부를 하면서 로그부분을 리팩토링을 진행하기 시작했다.

## 수정 방식

- Console은 기본 Spring 로그 전략을 사용했습니다. 아래 링크를 참고하시면 관련 내용을 확인할 수 있습니다.  수정을 하면서 문제였던 부분은 기본 로그 전략이 콘솔과 파일 둘다 존재했었습니다. 그리고 파일 전략을 사용하기위해 LOG_PATH를 선언해놨기 때문에 임시 폴더가 아닌 로컬로 실행할 때도 spring.log 파일명으로 로그가 생성되는걸 확인할 수 있었습니다. 아래 링크에 있는 방법으로 콘솔만 스프링 기본 로그 전략을 사용하도록 수정했습니다.

- [Spring Boot Base Logback](https://github.com/ksy90101/TIL/blob/master/spring/spring-boot-base-logback.md)

- 일단, 기본적으로 logback은 아래와 같이 한 파일에 profile에 맞춰서 수정을 하였다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="30 seconds">
    <springProperty name="SLACK_WEBHOOK_URI" source="logging.slack.webhook-uri"/>
    <property name="LOG_PATH" value="../logs"/>
    <timestamp key="dailyLog" datePattern="yyyy-MM-dd"/>

    <springProfile name="console-logging">
        <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
        <include resource="org/springframework/boot/logging/logback/console-appender.xml"/>
    </springProfile>

    <springProfile name="file-logging">
        <appender name="ROLLING" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>${LOG_PATH}/logback/logback_${dailyLog}.log</file>
            <encoder>
                <pattern>[%d{yyyy-MM-dd HH:mm:ss}:%-3relative][%thread] %-5level %logger{35} - %msg%n</pattern>
            </encoder>
            <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
                <fileNamePattern>${LOG_PATH}/logback/logback_${dailyLog}.%d\(.%i\).log</fileNamePattern>
                <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                    <maxFileSize>100MB</maxFileSize>
                </timeBasedFileNamingAndTriggeringPolicy>
            </rollingPolicy>
        </appender>
    </springProfile>

    <springProfile name="slack-logging">
        <appender name="SLACK" class="com.github.maricn.logback.SlackAppender">
            <layout class="ch.qos.logback.classic.PatternLayout">
                <pattern>[%d{yyyy-MM-dd HH:mm:ss}:%-3relative][%thread] %-5level %logger{35} - %msg%n</pattern>
            </layout>
            <webhookUri>${SLACK_WEBHOOK_URI}</webhookUri>
            <username>taggle bot</username>
            <colorCoding>true</colorCoding>
        </appender>
        <appender name="ASYNC_SLACK" class="ch.qos.logback.classic.AsyncAppender">
            <appender-ref ref="SLACK"/>
            <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
                <level>ERROR</level>
            </filter>
        </appender>
    </springProfile>

    <root>
        <springProfile name="console-logging">
            <appender-ref ref="CONSOLE"/>
        </springProfile>
        <springProfile name="file-logging">
            <appender-ref ref="ROLLING"/>
        </springProfile>
        <springProfile name="slack-logging">
            <appender-ref ref="ASYNC_SLACK"/>
        </springProfile>
    </root>
</configuration>
```

- 일단 예전과 달라지는 점이 slack WebhookUri가 개발 서버와 운영 서버에 따라 다른걸 가지고 있다는 것이다.
- 처음에는 property 태그를 사용해서 했는데 인식을 하지 못했다.
- 그러던 중 springProperty 태그를 사용해서 application.yml에 있는 값을 가져오니 원하던 대로 profile에 따라 다른 값을 줄 수 있었다.
- 또한 파일 로그와 콘솔 로그 같은 경우에는 error가 아닌 info로 로그레벨을 설정을 해야 될때가 있다. 그러나 슬랙 알람은 우리가 예측하지 못한 예외(즉 error 레벨)만 알림 설정을 해야 하기 때문에 filter를 이용해 로그 레벨이 ERROR인 경우에만 슬랙 로그 전략을 사용하도록 하였다.
- 여기서 또한 중요한 부분은 springProfile 태그이다. 이 태그로 yaml 파일에서 각 profile에 맞춰서 로그 조합 전략을 사용할 수 있다.

```yaml
spring:
  profiles:
    active: local

logging:
  config: classpath:logback/logback.xml
---
spring.profiles: local
spring:
  profiles:
    include:
      - console-logging
logging:
  level:
    root: info
---
spring.profiles: dev
spring:
  profiles:
    include:
      - file-logging
      - slack-logging
logging:
  level:
    root: info
  slack:
    webhook-uri: "uri 넣기"
---
spring.profiles: prod
spring:
  profiles:
    include:
      - file-logging
      - slack-logging
logging:
  level:
    root: info
  slack:
    webhook-uri: "uri넣기"
```

- 모든 로그 레벨을 info로 설정하였고 로컬에서는 콘솔 전략만, 개발환경과 운영환경에서는 파일와 슬랙 전략을 사용하도록 조합하였습니다.
- 또한 따로 logback폴더를 만들었기 때문에 logging.config로 파일을 불러오도록 설정하였습니다.
- 간단한 테스트를 위해 아래와 같이 로그를 찍는 코드를 작성했습니다.

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class ExApplication {

    private final Logger logger = LoggerFactory.getLogger(ExApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(ExApplication.class, args);
    }

    @GetMapping()
    public String index(){
        logger.error("hello world");

        return "hello world";
    }
}
```

- 이제 테스트를 위해 각 profile(local, dev, prod)로 실행을 해서 로그가 어떻게 찍히는지 확인해보도록 하겠습니다.

### profile local 실행

![spring-logback-profile-combination-1](https://github.com/ksy90101/TIL/blob/master/spring/img/spring-logback-profile-combination-1.png?raw=ture)

- 위와 같이 콘솔에만 찍히는걸 확인할 수 있습니다.

### profile dev % prod 실행

![spring-logback-profile-combination-2](https://github.com/ksy90101/TIL/blob/master/spring/img/spring-logback-profile-combination-2.png?raw=ture)

- 콘솔 로그는 사용하지 않기 때문에 콘솔에는 아무것도 안찍히는걸 확인할 수 있습니다.

![spring-logback-profile-combination-3](https://github.com/ksy90101/TIL/blob/master/spring/img/spring-logback-profile-combination-3.png?raw=ture)

- 슬랙 알람이 가는걸 확인할 수 있습니다.

![spring-logback-profile-combination-4](https://github.com/ksy90101/TIL/blob/master/spring/img/spring-logback-profile-combination-4.png?raw=ture)

- 아울러 파일에도 로그가 생성되는걸 확인할 수 있습니다.

## 정리

- 예전 방식에 비해 중복코드가 사라지게 되고 새로운 profile이 추가되었을 때 쉽게 로그를 사용할 수 있다는 장점이 있었습니다.
- Toast 기술 블로그에서는 배포 단계에 맞춰 필요한 조합을 미리 구성해두고 쓰고 배포 환경에 따라 유연성을 가지고 가는 것이 조합을 사용하는 가장 큰 장점이라고 한다.

## 참고자료

[(Spring Boot)Logging과 Profile 전략 : TOAST Meetup](https://meetup.toast.com/posts/149)
