# Spring에서으로 Log를 Slack으로 받아보기

> [예제코드](https://github.com/ksy90101/TIL-ex/tree/master/logback-slack-ex)

## Log를 사용하는 이유

- 최소한으로 로그는 서비스 동작 상태를 파악하고 장애를 파악하기 위해 사용합니다.
- 이러한 로그들은 분석하면서 서비스 지표 확인, 트랜잭션, 성능, 버그 등을 다양한 정보로 확인이 가능합니다.

## LogBack이란?

- Log를 효율적으로 관리하기 위해서 사용하는 것입니다.
- 현재 core, classic, access의 세가지 모듈로 나눠져 있다.
- 코어 모듈은 다른 두 개의 모듈을 위한 기반이며, classic 모듈은 코어를 확장하는데 사용하며 access는 서블릿 컨테이너와 통합되어 HTTP-access 로그 기능을 제공한다.
- 스프링에서는 기본적으로 logback을 사용한다.

## Spring Boot Base Logback

[ksy90101/TIL](https://github.com/ksy90101/TIL/blob/master/spring/spring-boot-base-logback.md)

## logback-slack-appender

[maricn/logback-slack-appender](https://github.com/maricn/logback-slack-appender)

### 의존성 추가

```groovy
implementation 'com.github.maricn:logback-slack-appender:1.4.0'
```

### XML 설정

```xml
	<?xml version="1.0" encoding="UTF-8" ?>
	<configuration>
		...
		<appender name="SLACK" class="com.github.maricn.logback.SlackAppender">
			<!-- Slack API token -->
			<token>1111111111-1111111-11111111-111111111</token>
			<!-- Slack incoming webhook uri. Uncomment the lines below to use incoming webhook uri instead of API token. -->
			<webhookUri>https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX</webhookUri>
			<!-- Channel that you want to post - default is #general -->
			<channel>#api-test</channel>
			<!-- Formatting (you can use Slack formatting - URL links, code formatting, etc.) -->
			<layout class="ch.qos.logback.classic.PatternLayout">
				<pattern>%-4relative [%thread] %-5level %class - %msg%n</pattern>
			</layout>
			<!-- Username of the messages sender -->
			<username>${HOSTNAME}</username>
			<!-- Emoji to be used for messages -->
			<iconEmoji>:stuck_out_tongue_winking_eye:</iconEmoji>
			<!-- If color coding of log levels should be used -->
			<colorCoding>true</colorCoding>
		</appender>
		<!-- Currently recommended way of using Slack appender -->
		<appender name="ASYNC_SLACK" class="ch.qos.logback.classic.AsyncAppender">
			<appender-ref ref="SLACK" />
			<filter class="ch.qos.logback.classic.filter.ThresholdFilter">
				<level>ERROR</level>
			</filter>
		</appender>
		<root>
			<level value="ALL" />
			<appender-ref ref="ASYNC_SLACK" />
		</root>
	</configuration>
```

- <token>
    - SLACK TOKEN을 넣는 공간입니다.
    - 저는 webhookUri를 사용했기 떄문에 token부분은 제외했습니다.
    - 노출이 되면 안되는 부분이기 때문에 property를 사용해 처리하는걸 추천합니다.
- <webhookUri>
    - SLACK webhookUri를 넣는 부분입니다.
    - webhookUri는 어떻게 가져오는지는 아래에서 설정하도록 하겠습니다.
    - token과 마찬가지로 노출이 되면 안되는 부분이기 때문에 property값으로 처리하도록 하겠습니다.
- <channel>
    - token을 사용했을 경우 어느 채널로 해당 로그를 푸시할지 결정하는 부분입니다.
    - 디폴트 값은 general 입니다.
- <layout>, <pattern>
    - 해당 부분은 슬랙 메시지를 커스텀 하는 부분입니다.
    - 아울러 로그를 어떻게 슬랙으로 보내줄지 결정하는 부분입니다.
- <username>
    - 메시지를 보낼 사용자 이름으로 봇 네임을 적어주면 됩니다.
- <iconEmoji>
    - 메시지를 전송할때 이모지를 사용할지를 결정하는 부분입니다.
- <colorCoding>
    - 로그 레벨마다 색이 다르게 설정해놨을 경우 그에 맞춰 메시지 색을 사용할지를 결정하는 부분입니다.
- ASYNC_SLACK
    - 현재 추천하는 방식으로 appender를 비동기 방식으로 사용하는걸 권장하고 있습니다.
    - 동기와 비동기의 차이는 아래에서 설정하도록 하겠습니다.
- <filter>
    - 기본적으로 레벨을 가지고 필터를 설정할 수 있습니다.
    - 위의 예제는 ERROR레벨만 슬랙 메시지를 보내겠다는 의미입니다.
    - 슬랙과 같은 메신저를 이용해 받을 경우에는 심각한 오류인 경우에만 로그를 받아보는것이 좋습니다.(그렇지 않으면 알람이 계속 울리게 되는 문제가 발생합니다.)

## AsyncAppender

- 비동기라는 이름처럼 빠르다는 장점이 있습니다.
- 그러나 단점으로 부하가 심한 상황에서는 WARN 이하 레벨 로그는 기본적으로 20%가 유실될 수있고 비동기 큐에 로그가 쌓인 상태에서 프로세스가 종료되면 해당 로그는 기록되지 않고 종료되는 단점이 있습니다.
- 또한 Method name, Line Number 등이 출력되지 않습니다.(기본적으로 출력을 하지 않는 것뿐이고 출력하다록 설정이 가능하다.) → `includeCallerData=true`를 이용하면 되지만, 성능 저하가 발생한다는 점은 알고 있어야 한다.
- 이러한 손실율에 대해서 커스텀할 수 있도록 제공해주기도 한다.
    - 버퍼 용량을 늘릴 수 있습니다.
    - 버퍼가 최대 용량에 도달하면 Logback에 이벤트를 삭제하도록 지시 할 수 있습니다.
    - 버릴 이벤트 유형을 제어 할 수 있습니다. ERROR 이벤트 전에 TRACE 이벤트를 삭제가 가능합니다.

### Async vs Sync 차이

![logback-slack-appender-1](https://github.com/ksy90101/TIL/blob/master/spring/img/logback-slack-appender-1.png?raw=ture)

## 예제코드

### 테스트 코드

```java
package logback.slack.ex;

import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import ch.qos.logback.classic.Logger;
import lombok.extern.java.Log;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootApplication
public class ExApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExApplication.class, args);
        log.error("테스트");
    }

}

```

- 테스트를 위해 애플리케이션이 실행되면 error 레벨로 "테스트"라고 나오도록 설정했습니다.
- 아울러 편리함을 위해 lombok을 추가했습니다.

### application.yml

```yaml
logging:
  slack:
    webhook-uri: SLACK_WEBHOOK_URI 추가
  config: classpath:logback-slack.xml
```

- slack webhookUri와 해당 로그백 설정 파일을 추가하는 작업을 했습니다.

### logback-slack.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<configuration>
    <springProperty name="SLACK_WEBHOOK_URI" source="logging.slack.webhook-uri"/>
    <appender name="SLACK" class="com.github.maricn.logback.SlackAppender">
        <!-- Slack API token -->
        <!-- <token>1111111111-1111111-11111111-111111111</token>-->
        <!-- Slack incoming webhook uri. Uncomment the lines below to use incoming webhook uri instead of API token. -->
        <webhookUri>${SLACK_WEBHOOK_URI}</webhookUri>
        <!-- Channel that you want to post - default is #general -->
        <!-- <channel>#api-test</channel>-->
        <!-- Formatting (you can use Slack formatting - URL links, code formatting, etc.) -->
        <layout class="ch.qos.logback.classic.PatternLayout">
            <pattern>%-4relative [%thread] %-5level %class - %msg%n</pattern>
        </layout>
        <!-- Username of the messages sender -->
        <username>posting bot</username>
        <!-- Emoji to be used for messages -->
        <iconEmoji>:stuck_out_tongue_winking_eye:</iconEmoji>
        <!-- If color coding of log levels should be used -->
        <colorCoding>true</colorCoding>
    </appender>
    <!-- Currently recommended way of using Slack appender -->
    <appender name="ASYNC_SLACK" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="SLACK"/>
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>ERROR</level>
        </filter>
    </appender>
    <root>
        <level value="ALL"/>
        <appender-ref ref="ASYNC_SLACK"/>
    </root>
</configuration>
```

- 위에서 설명햇던 그대로 입니다. 또한 기본 설정을 사용했습니다.

### 결과

![logback-slack-appender-2](https://github.com/ksy90101/TIL/blob/master/spring/img/logback-slack-appender-2.png?raw=ture)

- 위와 같이 로그가 슬랙 메시지로 오는 걸 확인할 수 있습니다.

## SLACK Webhook uri 가져오기

- Slack api 홈페이지에서 봇을 만들고 나면 아래와 같이 화면이 나오게 됩니다.

![logback-slack-appender-3](https://github.com/ksy90101/TIL/blob/master/spring/img/logback-slack-appender-3.png?raw=ture)

- 여기서 Features → incoming Webhooks을 선택합니다.

![logback-slack-appender-4](https://github.com/ksy90101/TIL/blob/master/spring/img/logback-slack-appender-4.png?raw=ture)

- 아래로 내리다 보면 `add New Webhook to Workspace`버튼이 있으며 해당 버튼을 눌러 원하는 채널을 선택하면 아래와 같이 webhook URL이 나옵니다.

![logback-slack-appender-5](https://github.com/ksy90101/TIL/blob/master/spring/img/logback-slack-appender-5.png?raw=ture)

## 결론

- 예상치 못한 에러가 발생했을 경우 error 레벨을 사용하는데, 손쉽게 바로 알 수 있는 방법은 메신저의 알람방법이라고 생각합니다.
- 토이프로젝트를 했을 경우에는 서버에 직접 매번 로그를 확인할 수 없기 때문에 슬랙 로그 어펜더가 많은 도움을 줄거라고 생각합니다.

## 참고자료

[권남](https://kwonnam.pe.kr/wiki/java/logback/asyncappender)
