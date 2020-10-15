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

제 애플리케이션에서는 `mysql`와 `nginx`를 필요로 합니다. 따라서 다음과 같이 `docker-compose.yml`을 구성하였습니다.

```
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
      test: ['CMD', 'curl', 'http://localhost:8080/healthcheck']
      interval: 30s
      timeout: 10s
      retries: 5
    entrypoint: ['java', '-jar', '-Dspring.profiles.active=dev', 'app.jar']
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
      test: ['CMD', '/usr/bin/mysql', '--host=dev-db', '--port=3306', '--user=root', '--password=****', '-e', 'show databases;']
      interval: 30s
      timeout: 10s
      retries: 5

networks:
  external:
```
