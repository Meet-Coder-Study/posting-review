# Blue/Green 무중단 배포를 진행해보자.

## 무중단 배포란?

- 예전에는 배포라고 하면 팀의 아주 큰 이벤트로 배포날을 결정해 새벽시간에 남아서 배포를 해야했습니다.
- 잦은 배포가 있다면 매 새벽마다 남아서 배포를 해야 했습니다. 이럴때 치명적인 문제가 발견되면 새벽에 문제 해결 후에 아침이 되면 긴급 점검을 올리고 수정을 해야 했습니다.
- 이렇게 배포가 서비스를 정지해야만 가능할때는 롤백조차 어렵기 때문에 고생이 많았습니다.
- 그래서 서비스를 정지시키지 않고 배포하는 방법을 찾기 시작했습니다. 이렇게 서비스를 정지시키지 않고 배포를 계속하는 것이 무중단 배포라고 합니다.

## Blue/Green 이란?

- 가장 간단하고 쉽게 무중단 배포를 구현할 수 있습니다. 기본적으로 릴리즈와 관련된 모든 시간을 줄이기 위한 기술입니다. 앱 출시 전에 준비하는 매우 빠른 방법이며 배포판의 이슈가 감지되면 빠르게 롤백도 가능합니다.

### 시나리오

![blue-green-deployment-1](https://github.com/ksy90101/TIL/blob/master/infra/image/blue-green-deployment-1.png?raw=true)

- 먼저 똑같은 환경을 지닌 인프라를 2Set을 준비한다.
- 현재 운영하고 있는 서버는 초록색 인프라에서 진행중입니다.
- 새로운 버전을 릴리즈 하기 위해 초록색 인프라에 덮어 씌우는 것이 아닌, 비어있는 파란색 인프라에 배포를 하게 됩니다.
- 파란색 인프라에서는 새로운 버전 빌드 작업을 수행하고 초록색으로 트래픽을 보내주는 LB, Router, Proxy 등의 타켓을 파란색 인프라로 변경합니다.
- 혹시 배포시 문제가 발생했다면 초록색 인프라로 다시 바라보게 하면 됩니다.(롤백)

### 고려해야 할 점

- 기존 초록색에서 Long-term 트랜잭션이 수행되고 있다면 파란색으로 전활할때 해당 트랜잭션이 제대로 수행되지 못한다. 물론 새로운 요청도 정상적으로 처리해야 한다. 이 문제는 DB backend에서 처리해주면 좋지만 실상 그렇게 동작하는 경우는 거의 없다.
- 초록색이 가지고 있는 DB Migration도 큰 고려사항이다. 마이그레이션이 정상적으로 수행되었다 한들 V2 파란색이 문제가 생겨 롤백을 수행할 때에도 해당 DB 정보도 롤백에 대한 고려가 되어야 한다.
- 이러한 방법에서는 두 세트의 인프라를 준비되어야 하고, 그만큼 두배의 가격이 발생한다.

## Nginx를 이용한 Blue/Green 무중단배포

- 이 방법은 굳이 두개의 인프라가 필요하지는 않는다.
- 간단하게 설명하면 1대의 Nginx와 2대의 Spring Boot Jar를 사용한다고 생각하면 될거 같습니다.

![blue-green-deployment-2](https://github.com/ksy90101/TIL/blob/master/infra/image/blue-green-deployment-2.png?raw=true)

- 위와 같이 사용자는 서버 포트로 접속을 하고 Nginx는 해당 Spring Boot로 요청을 전달한다.
    - 현재 포트는 port 8081이다.
- 이때 새로운 버전인 1.1을 배포해야 한다고 가정하자.

![blue-green-deployment-3](https://github.com/ksy90101/TIL/blob/master/infra/image/blue-green-deployment-3.png?raw=true)

- 그렇다면 위의 사진처럼 port 8082에서 배포후에 새로운 서버를 띄운 후(port번호 8082) Noginx가 8082 port를 바라보게 한 뒤 Ningx를 Reload하면 된다.
- 이때 Ningx는 Reload하는데 1초만 걸리기 떄문에 평소보다 많은 시간을 줄일 수가 있습니다.
- 또한 혹시 배포 후 이슈가 생겼다면 바로 port 8081을 바라보게 해서 롤백도 가능합니다.

### 리버스 프록시

- 위의 사진과 같이 Nginx가 외부의 요청을 받아 backend 서버로 요청을 전달하는 행위를 리버스 프록시라고 합니다.
- 이렇게 사용하는 장점은 backend 서버에게 요청을 골고루 분배하거나 한번 요청왔던 리소스등은 캐시하여 리버스 프록시 서버에서 바로 응답을 내려주는 속도 측면 등 여러가지 장점이 존재합니다.

## 무중단 배포 구축하기

## Spring Boot 코드

### profile 확인 api

```java
import java.util.Arrays;
import java.util.List;

import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("api/v1/profiles")
public class ProfileController {
    private final Environment environment;

    @GetMapping
    public String profile() {
        final List<String> profiles = Arrays.asList(environment.getActiveProfiles());
        final List<String> prodProfiles = Arrays.asList("prod1", "prod2");
        final String defaultProfile = profiles.get(0);

        return Arrays.stream(environment.getActiveProfiles())
                .filter(prodProfiles::contains)
                .findAny()
                .orElse(defaultProfile);
    }
}
```

- 현재의 prod가 무엇인지를 확인해야 한다. prod1, prod2에서 왔다갔다 할것이기 때문에 확인하는 코드가 필요하다.

## Spring boot actator

```groovy
implementation('org.springframework.boot:spring-boot-starter-actuator')
```

- health check를 위해 의존성을 추가한다.
- 실제로 빌드가 완료되어 배포가 되어있는지 확인하고 해당 포트를 변경해줘야 하기 때문에 필요한 의존성이다.
- 이 의존성에서 사용하는 부분은 ``/health` 이며, up인 경우에 제대로 빌드되어 배포가되어 있는 경우이다.

### application-prod.yml

```yaml
spring:
  profiles: prod1
server:
  port: 8081

---

spring:
  profiles: prod2
server:
  port: 8082
```

- 배포를 다르게 두고 왔다갔다 해야 하기 때문에 포트 설정을 각 환경에 따라 다르게 해줘야 하기 때문에 추가했다.

### Nginx 설정

- `/etc/nginx/sites-enabled/default`  파일에 들어가 설정을 합니다.

```shell script
server {
        listen 80 default_server;
        listen [::]:80 default_server;

        root /var/www/dev.taggle.kr;

        server_name dev.taggle.kr;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;
        include /etc/nginx/conf.d/service-url.inc;

        location / {
                proxy_pass $service_url;
                proxy_set_header X-Real_IP $remote_addr;
                proxy_set_header X-Forwarded_For $proxy_add_x_forwarded_for;
                proxy_set_header Host $http_host;
        }
}
```

- proxy_pass : 요청이 오면 `http://localhost:8080`로 전달
- proxy_set_header XXX : 실제 요청 데이터를 header의 각 항목에 할당
    - ex) `proxy_set_header X-Real-IP $remote_addr`: Request Header의 X-Real-IP에 요청자의 IP를 저장

```shell script
set $service_url http://127.0.0.1:8081;
```

## deploy.sh

```shell script
BASE_PATH=/home/ubuntu
BUILD_PATH=$(ls $BASE_PATH/taggle/deploy/*.jar)
JAR_NAME=$(basename $BUILD_PATH)
echo "> build 파일명: $JAR_NAME"

echo "> build 파일 복사"
DEPLOY_PATH=$BASE_PATH/taggle/deploy/temp/
cp $BUILD_PATH $DEPLOY_PATH

echo "> 현재 구동중인 Set 확인"
CURRENT_PROFILE=$(curl -s http://localhost/api/v1/profiles)
echo "> $CURRENT_PROFILE"

# 쉬고 있는 set 찾기: set1이 사용중이면 set2가 쉬고 있고, 반대면 set1이 쉬고 있>음
if [ $CURRENT_PROFILE == prod1 ]
then
  IDLE_PROFILE=prod2
  IDLE_PORT=8082
elif [ $CURRENT_PROFILE == prod2 ]
then
  IDLE_PROFILE=prod1
  IDLE_PORT=8081
else
echo "> 일치하는 Profile이 없습니다. Profile: $CURRENT_PROFILE"
  echo "> pord1을 할당합니다. IDLE_PROFILE: pord1"
  IDLE_PROFILE=prod1
  IDLE_PORT=8081
fi

echo "> application.jar 교체"
IDLE_APPLICATION=$IDLE_PROFILE-taggle-web-*.jar
IDLE_APPLICATION_PATH=$DEPLOY_PATH$IDLE_APPLICATION

ln -Tfs $DEPLOY_PATH$JAR_NAME $IDLE_APPLICATION_PATH

echo "> $IDLE_PROFILE 에서 구동중인 애플리케이션 pid 확인"
IDLE_PID=$(pgrep -f $IDLE_APPLICATION)

if [ -z $IDLE_PID ]
then
  echo "> 현재 구동중인 애플리케이션이 없으므로 종료하지 않습니다."
else
  echo "> kill -15 $IDLE_PID"
  kill -15 $IDLE_PID
  sleep 5
fi
echo "> $IDLE_PROFILE 배포"
nohup java -jar -Dspring.profiles.active=$IDLE_PROFILE $IDLE_APPLICATION_PATH &

echo "> $IDLE_PROFILE 10초 후 Health check 시작"
echo "> curl -s http://localhost:$IDLE_PORT/actuator/health "
sleep 10

for retry_count in {1..10}
do
  response=$(curl -s http://localhost:$IDLE_PORT/actuator/health)
  up_count=$(echo $response | grep 'UP' | wc -l)

  if [ $up_count -ge 1 ]
  then # $up_count >= 1 ("UP" 문자열이 있는지 검증)
      echo "> Health check 성공"
      break
  else
      echo "> Health check의 응답을 알 수 없거나 혹은 status가 UP이 아닙니다."
      echo "> Health check: ${response}"
  fi

  if [ $retry_count -eq 10 ]
  then
echo "> Health check 실패. "
    echo "> Nginx에 연결하지 않고 배포를 종료합니다."
    exit 1
  fi

  echo "> Health check 연결 실패. 재시도..."
  sleep 10
done
```

- 간단하게 설명하면 ``/api/v1/profiles`를 가지고 해당 환경을 확인하고 if문을 실행한다.
- prod1인 경우에는 prod2로 빌드를 하고 prod2인 경우에는 prod1인 빌드를 진행한다.
- 빌드가 모두 완료되면 해당 애플리케이션을 실행시키며, `health`를 이용해 해당 애플리케이션을 체크한다.

### Switch.sh

```shell script
# 쉬고 있는 prod 찾기: prod1이 사용중이면 pord2가 쉬고 있고, 반대면 prod1이 쉬고 있>음
if [ $CURRENT_PROFILE == prod1 ]
then
  IDLE_PORT=8082
elif [ $CURRENT_PROFILE == prod2 ]
then
  IDLE_PORT=8081
else
  echo "> 일치하는 Profile이 없습니다. Profile: $CURRENT_PROFILE"
  echo "> 8081을 할당합니다."
  IDLE_PORT=8081
fi

echo "> 전환할 Port: $IDLE_PORT"
echo "> Port 전환"
echo "set \$service_url http://127.0.0.1:${IDLE_PORT};" |sudo tee /etc/nginx/conf.d/service-url.inc

PROXY_PORT=$(curl -s http://localhost/api/v1/profiles)
echo "> Nginx Current Proxy Port: $PROXY_PORT"

echo "> Nginx Reload"
sudo service nginx reload
```

- 배포되어있는 prod를 확인해 해당 포트를 설정해 설정해놓은 `service-url.inc` 에 포트 번호를 변경하고 nginx를 재 실행한다.

## 결론

- 무중단 배포라 한들, 1초 정도의 nginx의 재실행 시간이 필요하긴 하다.
- 그러나 적은 비용으로 배포 시간을 최소한으로 할 수 있는 방법이다.

## 참고자료

[7) 스프링부트로 웹 서비스 출시하기 - 7. Nginx를 활용한 무중단 배포 구축하기](https://jojoldu.tistory.com/267)
