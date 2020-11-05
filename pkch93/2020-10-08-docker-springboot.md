# docker로 개발 테스트 환경 구축하기

## Overview

본 주제에 앞서 docker를 활용하게 된 계기는 다음과 같습니다.

현재 사이드프로젝트를 진행중인데 여기서 저는 서버개발을 맡고 있습니다. 그외 클라이언트 개발 팀원이 IOS를 담당하여 개발 중에 있습니다.

> 참고로 우응증 환자를 위한 무드 트래킹을 주제로 사이드 프로젝트를 진행하고 있습니다.

여기서 어느정도 서버는 기능 개발이 끝나서 API 문서 전달 및 더미데이터를 쏴보며 테스트할 수 있도록 인프라 구축이 필요하다고 생각했습니다.

다만, AWS의 RDS 등을 사용하기에는 비용이 많이 부담되었습니다. RDS 중 제일 낮은 스펙의 인스턴스도 한달에 25달러 정도의 비용이 들었었습니다. 때문에 EC2 인스턴스에 DB를 띄워 더미데이터를 제공하는 방식으로 결정하였습니다.

하지만 이 경우도 문제가 되는 것이 인스턴스에 매번 mysql을 깔고, 더미데이터를 넣어주고, 애플리케이션을 띄운 후에 nignx를 연결하는 것까지 작업을 해주어야 했습니다. 이런 번거로움을 해결하기 위해 docker 컨테이너를 사용하기로 결정하였고 docker-compose를 통해 하나의 명령어로 인프라 환경을 구축하였습니다.

## 개발 / 배포 환경

- 개발 환경

|     skill     |   version   |
| :-----------: | :---------: |
|     java      | openJDK 1.8 |
|  Spring Boot  |    2.3.1    |
|     mysql     |   5.7.31    |
| h2 (테스트용) |      -      |

> 서버가 Spring Boot로 구성되어 있으므로 Spring Boot 환경에서 배포 도커라이징에 대해 다룹니다.

- 배포 환경

|     skill      |    version     |
| :------------: | :------------: |
|     docker     |       -        |
| docker-compose |       -        |
|    aws ec2     | amazon linux 2 |

### 참고사항

docker 참고: [https://subicura.com/2017/01/19/docker-guide-for-beginners-1.html](https://subicura.com/2017/01/19/docker-guide-for-beginners-1.html)

docker-compose 공식문서: [https://docs.docker.com/compose/](https://docs.docker.com/compose/)

프로젝트 파일 구조는 다음과 같습니다.

```
.
├── Dockerfile
├── HELP.md
├── api-core
│   ├── build.gradle
│   └── src
├── build.gradle
├── core
│   ├── build.gradle
│   └── src
├── core-test
│   ├── build.gradle
│   └── src
├── domain
│   ├── build.gradle
│   └── src
├── external-api
│   ├── build.gradle
│   ├── docker
│   ├── docker-compose.dev.yml
│   ├── docker-compose.yml
│   └── src
├── gradle
│   └── wrapper
├── gradle.properties
├── gradlew
├── gradlew.bat
├── infrastructures
│   └── rdb
└── settings.gradle
```

gradle 멀티모듈 형태로 구성하고 있으며 위 프로젝트에서 배포할 대상 모듈은 `external-api` 입니다. 때문에 `docker-compose.yml` 파일이 `external-api` 모듈에만 존재하고 있습니다.

## Dockerfile 및 docker-compose.yml 구성 고민

> 참고로 Dockerfile은 현재 프로젝트를 도커 이미지화 하기 위한 DSL입니다.
>
> docker-compose.yml은 간단히 도커 실행 옵션을 미리 적어둔 문서라고 할 수 있습니다.

우선 저의 경우 gradle 멀티 모듈 형태로 프로젝트를 구성하고 있습니다. 현재는 `external-api`만 배포 대상이지만 추가로 배포될 수 있는 모듈이 생길 수 있다는 가정하에 도커 이미지 생성을 정의한 파일인 Dockerfile과 도커 실행 옵션을 정의한 docker-compose.yml을 어떻게 구성할지 고민이 필요했습니다.

### Dockerfile

배포 될 수 있는 모듈마다 각각의 Dockerfile, docker-compose.yml을 가지는 형태입니다.

```Dockerfile
FROM openjdk:8-jdk

ARG JAR_FILE="./build/libs/*.jar"

COPY ${JAR_FILE} app.jar
```

위와 같이 구성되었습니다. 이때, 문제가 Dockerfile이 있는 위치를 중심으로 도커 이미지를 생성하는 컨텍스트를 형성합니다. 때문에 `external-api` 모듈에서 활용하는 `core`, `core-test`, `api-core`, `domain` 모듈들이 컨텍스트에 들어오지 못하는 문제가 발생합니다.

따라서 Dockerfile을 모듈 내에 둔 것이 아닌 루트 프로젝트 위치에 두어 이를 해결했습니다.

```Dockerfile
FROM openjdk:8-jdk

ARG module
ARG JAR_FILE="./$module/build/libs/*.jar"

COPY ${JAR_FILE} app.jar
```

위는 최종 결정한 Dockerfile입니다. Dockerfile을 빌드할 때 `module`이라는 인자를 받아 해당 모듈을 이미지로 만들도록 구성했습니다. 이를 통해 대부분 비슷한 Dockerfile의 중복을 해결한 점도 있습니다.

### 참고! Docker 이미지를 만들때 jar를 만드는 것이 아니라 미리 jar를 만든 후 이를 도커 이미지로 만드는 이유

제 사이드 프로젝트에는 `./gradlew`가 존재합니다. 따라서 이미지 빌드할 때 jar를 만들지 않고 미리 jar를 만들어서 이미지로 만드는 지 궁금할 수 있을거 같네요.

저도 처음에는 이미지를 만들때 jar를 만들도록 다음과 같이 Dockerfile을 구성하였습니다.

```Dockerfile
FROM openjdk:8-jdk

WORKDIR ./external-api

CMD ["./gradlew", "build"]

ARG JAR_FILE=./external-api/build/libs/*.jar

COPY ${JAR_FILE} app.jar
```

다만, 위 경우 `./gradlew`를 찾을 수 없다는 에러와 함께 이미지 빌드가 실패하였습니다. 이 이유는 아직 발견하지 못했습니다...

따라서 구글 서치 후 gradle 이미지를 활용하면 빌드가 가능한 걸 확인할 수 있었습니다.

단, 이 경우 제 프로젝트에서 사용하는 gradle의 버전을 다운로드하는 시간이 소요되었고 무엇보다도 마지막 `COPY ${JAR_FILE} app.jar` 명령이 실행되지 않았습니다. 빌드한 jar를 찾지 못한 거 같은데 이 부분도 아직 이유를 발견하지 못했습니다...

때문에 현재 방법과 같이 먼저 빌드를 한 후 나온 jar를 도커 이미지로 만드는 방식을 사용하고 있습니다.

### docker-compose.yml 구성

제 애플리케이션에서는 `mysql`를 필요로 합니다. 따라서 다음과 같이 `docker-compose.yml`을 구성하였습니다.

```
version: "3.8" # 1

services:
  app: # 2
    container_name: desserts-external
    entrypoint: ['java', '-jar', '-Dspring.profiles.active=beta', 'app.jar']
    build: .
    ports:
      - 8080:8080
    networks:
      - database
    depends_on:
      - dev-db
  dev-db: # 3
    image: mysql:5.7.31
    environment:
      MYSQL_ROOT_PASSWORD: ****
      MYSQL_DATABASE: desserts
      MYSQL_USER: user
      MYSQL_PASSWORD: ****
    networks:
      - database
    ports:
      - 3306:3306

networks:
  database:
```

1. 처음에 docker-compose 파일 포멧 버전 중 가장 최신인 `3.8`을 사용하였습니다.

[docker-compose file format](https://docs.docker.com/compose/compose-file/)

2. 제가 작성한 Spring Boot 애플리케이션을 이미지로 만든 후 컨테이너에 올리기 위한 설정입니다.

참고로 services에 각각의 컨테이너가 시작될때의 설정을 정의합니다. 위 `docker-compose.yml`은 Spring Boot는 app으로 mysql은 dev-db로 정의하여 사용하고 있습니다.

```yaml
app: # 2
  container_name: desserts-external
  entrypoint: ["java", "-jar", "-Dspring.profiles.active=dev", "app.jar"]
  build:
    context: ..
    args:
      module: external-api
  ports:
    - 8080:8080
  networks:
    - database
  depends_on:
    - dev-db
```

Dockerfile을 최상위 루트 프로젝트 폴더에 위치하였기 때문에 `build.context`를 상위 폴더 `,,`로 보도록 설정하였습니다.

그리고 Dockerfile이 module이라는 인자를 통해서 어떤 모듈을 빌드할 지 인식하므로 `build.args.module` 값을 설정해주었습니다.

```Dockerfile
FROM openjdk:8-jdk

ARG module
ARG JAR_FILE="./$module/build/libs/*.jar"

COPY ${JAR_FILE} app.jar
```

따라서 docker-compose.yml에서 정의한 args가 Dockerfile에서 이미지를 빌드할 때 사용될 수 있었습니다.

즉, docker-compose.yml에서 `args.module`을 external-api로 전달하였는데 이 값이 `ARG module`에 매핑이 되면서 사용이 가능한 것입니다.

그리고 애플리케이션은 db가 띄워져 있는 상태에서 띄워져야하기 때문에 `depends_on`에 `dev_db`를 명시해주었습니다.

3. mysql 컨테이너 설정입니다.

```yaml
dev-db: # 3
  image: mysql:5.7.31
  environment:
    MYSQL_ROOT_PASSWORD: ****
    MYSQL_DATABASE: desserts
    MYSQL_USER: user
    MYSQL_PASSWORD: ****
  networks:
    - database
  ports:
    - 3306:3306
```

image로는 [dockerhub](https://hub.docker.com/)에 올라와있는 mysql 이미지를 사용합니다. 참고로 docker는 컨테이너를 빌드할 때 현재 docker의 image에 존재하지 않는다면 dockerhub에서 찾습니다.

그 후 제가 사용할 database 설정 및 user 설정을 해주었습니다. 환경변수 관련해서는 [dockerhub#mysql](https://hub.docker.com/_/mysql)에서 확인할 수 있습니다.

그리고 app과 dev-db에 `networks`를 database로 설정하였는데 이는 기본적으로 docker-compose로 컨테이너를 띄울때 `<상위폴더 이름>_default`로 이름을 정의하는데 위와 같이 정의하면 `<상위폴더 이름>_database`로 만들 수 있기 때문에 위와 같이 설정하였습니다.

#### 주의사항

docker-compose로 컨테이너들을 띄우는 경우 포트 매핑을 했기 때문에 app에서 localhost로 접근이 가능하다고 생각할 수 있습니다.

따라서 저도 `datasource.url`을 다음과 같이 정의했었습니다.

```yaml
datasource:
  url: jdbc:mysql://localhost:3306/desserts?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
```

하지만 위 컨테이너들은 docker-compose를 띄울때 매핑한 docker network에 묶여있습니다. 즉 app 컨테이너에서의 localhost는 app 컨테이너 내부 환경이기 때문에 app 컨테이너 외부에 있는 dev-db 컨테이너를 localhost로는 인식하지 못합니다.

따라서 위와 같이 url을 설정하는 경우 다음과 같은 에러 메세지가 나타납니다

```
Communications link failure

The last packet sent successfully to the server was 0 milliseconds ago. The driver has not received any packets from the server.
```

docker-compose로 빌드시 docker network는 각각의 컨테이너는 services의 이름에 맞춰 도메인을 매핑합니다. 따라서 dev-db를 연결하려면 다음과 같이 url을 설정해야합니다.

```yaml
datasource:
  url: jdbc:mysql://dev-db:3306/desserts?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
```

### docker-compose 2.4로 파일 포멧 버전을 바꾼 이유

단, 위 처음 작성한 docker-compose.yml은 동작하지 않습니다. dev-db는 띄워지더라도 app이 db 연결에 실패하여 실행이 되지 않습니다.

그 이유는 `depends_on`과 관련있습니다. [docker-compose 3 file format](https://docs.docker.com/compose/compose-file/#service-configuration-reference) 문서에는 다음과 같은 주의사항이 있습니다.

```
There are several things to be aware of when using depends_on:

- depends_on does not wait for db and redis to be “ready” before starting web - only until they have been started. If you need to wait for a service to be ready, see Controlling startup order for more on this problem and strategies for solving it.
- Version 3 no longer supports the condition form of depends_on.
- The depends_on option is ignored when deploying a stack in swarm mode with a version 3 Compose file.
```

즉, `depends_on`은 다른 컨테이너가 띄워질 때까지 기다리라는 의미가 아니며 컨테이너가 시작될 때까지만 기다린다는 것입니다. 따라서 띄워질 때까지 기다리게 하기 위해서는 별도 조치가 필요했습니다.

이를 위해 가장 편한 방법인 condition 옵션을 활용하기로 했습니다. 다만 이 옵션은 3 버전 이후로는 사용할 수 없으므로 `2.4`로 버전을 낮추어 사용했습니다

```yaml
version: "2.4"

services:
  app:
    container_name: desserts-external # 1
    entrypoint: ['java', '-jar', '-Dspring.profiles.active=dev', 'app.jar']
    build:
      context: ..
      args:
        module: external-api
    image: desserts-external # 2
    networks:
      - external
    depends_on:
      dev-db:
        condition: service_healthy
  dev-db:
    container_name: desserts-dev-db # 1
    image: mysql:5.7.31
    volumes:
      - /var/lib/mysql
      - ./docker/database:/docker-entrypoint-initdb.d # 3
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    environment:
      MYSQL_ROOT_PASSWORD: ****
      MYSQL_DATABASE: desserts
      MYSQL_USER: user
      MYSQL_PASSWORD: ****
    networks:
      - external
    ports:
      - 3306:3306
    healthcheck:
      test: ['CMD', '/usr/bin/mysql', '--host=dev-db', '--port=3306', '--user=root', '--password=1234', '-e', 'show databases;']
      interval: 30s
      timeout: 10s
      retries: 5

networks:
  external:
```

위 docker-compose.yml은 dev-db가 안정적으로 띄워질때까지 기다린 후 app 컨테이너를 실행합니다. dev-db의 healthcheck를 통해 어떻게 컨테이너가 띄워졌는지 체크할 명령어 및 옵션을 정의하였으며 app에서는 `condition: service_healthy`를 통해 헬스체크가 통과하면 컨테이너를 실행하도록 설정하였습니다.

위와 같이 정의하면 드디어... app이 실행되는 것을 확인할 수 있습니다..!

> docker-compose up

그 외 자잘한 옵션들이 추가 되었습니다.

1. 컨테이너 이름을 명시적으로 지정하였습니다.

2. 이미지 이름도 명시적으로 지정하였습니다.

3. docker mysql에서 초기 데이터를 설정하는 방법입니다.

[dockerhub#mysql](https://hub.docker.com/_/mysql)에서 Initializing a fresh instance 부분에 초기데이터를 저장하는 방법에 대해 명시되어 있습니다.

실행하고자 하는 sql을 `/docker-entrypoint-initdb.d`에 볼륨으로 매핑하면 매핑된 sql이 컨테이너가 띄워질 때 실행이 됩니다.

위 설정에서는 `./docker/database` 폴더 내부에 초기 설정 sql을 넣어두었습니다.

### nginx 추가

nginx도 추가를 합니다.

```yaml
proxy:
  container_name: desserts-external-proxy
  image: nginx:latest # 1
  ports:
    - 80:80
  volumes:
    - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf # 2
  networks:
    - external
  depends_on:
    app:
      condition: service_healthy # 3
```

1. 컨테이너를 띄울 때 dockerhub의 `nginx:latest` 이미지를 사용합니다.

2. 기본적으로 nginx 설정 파일은 `/etc/nginx/nginx.conf`에 위치합니다. 이를 제가 설정한 `nginx.conf`로 대체하기 위해서 위와 같이 볼륨 매핑을 합니다.

[nginx 참고](https://github.com/Blog-Posting/posting-review/blob/master/ChulYun/2020-08-06-nginx-understanding.md)

3. nginx 또한 매핑할 애플리케이션이 띄워진 후에 컨테이너가 띄워져야합니다. 따라서 app 컨테이너가 healthy할 때 띄워지도록 `condition` 설정을 했습니다.

따라서 app도 다음과 같이 healthcheck가 포함됩니다.

```yaml
app:
  container_name: desserts-external # 1
  entrypoint: ["java", "-jar", "-Dspring.profiles.active=dev", "app.jar"]
  build:
    context: ..
    args:
      module: external-api
  image: desserts-external # 2
  networks:
    - external
  depends_on:
    dev-db:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "curl", "http://localhost:8080/healthcheck"]
    interval: 30s
    timeout: 10s
    retries: 5
```

### dev 환경일 때 파일 분리

현재는 dev 환경 밖에 존재하지 않지만 추후에는 beta나 prod 같은 추가 환경이 필요할 수 있습니다.

docker-compose는 `docker-compose up` 명령을 사용할 때 `docker-compose.yml`과 `docker-compose.override.yml`을 찾습니다.

그리고 별도 설정 파일을 사용하기 위해서는 `-f` 옵션으로 지정할 수 있도록 지원합니다.

이를 활용하여 환경별 설정을 분리할 수 있겠다는 생각을 가지고 현재 `docker-compose.yml`에서 dev 환경에만 필요한 설정을 `docker-compose.dev.yml`로 분리하였습니다.

- docker-compose.yml

```yaml
version: "2.4"

services:
  proxy:
    container_name: desserts-external-proxy
    image: nginx:latest
    ports:
      - 80:80
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
    networks:
      - external
    depends_on:
      app:
        condition: service_healthy
  app:
    container_name: desserts-external
    build:
      context: ..
      args:
        module: external-api
    image: desserts-external
    networks:
      - external
    healthcheck:
      test: ["CMD", "curl", "http://localhost:8080/healthcheck"]
      interval: 30s
      timeout: 10s
      retries: 5

networks:
  external:
```

- docker-compose.dev.yml

```yaml
version: "2.4"

services:
  app:
    entrypoint: ["java", "-jar", "-Dspring.profiles.active=dev", "app.jar"]
    depends_on:
      dev-db:
        condition: service_healthy
  dev-db:
    container_name: desserts-dev-db
    image: mysql:5.7.31
    volumes:
      - /var/lib/mysql
      - ./docker/database:/docker-entrypoint-initdb.d
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    environment:
      MYSQL_ROOT_PASSWORD: ****
      MYSQL_DATABASE: desserts
      MYSQL_USER: user
      MYSQL_PASSWORD: ****
    networks:
      - external
    ports:
      - 3306:3306
    healthcheck:
      test:
        [
          "CMD",
          "/usr/bin/mysql",
          "--host=dev-db",
          "--port=3306",
          "--user=root",
          "--password=1234",
          "-e",
          "show databases;",
        ]
      interval: 30s
      timeout: 10s
      retries: 5

networks:
  external:
```

nginx는 모든환경에서 사용하지만 db는 prod 환경에서는 AWS의 RDS 등 실 DB를 사용할 가능성이 높습니다. 따라서 dev-db의 컨테이너 설정을 `docker-compose.dev.yml`로 옮겼습니다. 이에 따라 app의 condition도 dev 환경에서만 필요하므로 함께 옮겼습니다.

그리고 app의 실행옵션도 달라야하므로 entrypoint 부분도 `docker-compose.dev.yml`로 옮겨주었습니다.

이를 통해 `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up` 명령을 사용하면 개발 테스트 환경으로 컨테이너가 띄워집니다..!

### TODO

- docker-compose 파일 포멧 버전 업. 3버전 이상에서 healthy 상태일때 컨테이너가 띄워지도록 수정
- docker swarm으로 컨테이너 관리 (or Kubernates)
