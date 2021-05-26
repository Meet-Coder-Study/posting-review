# Docker Compose 사용법

## Docker Compose란?

Docker Compose란 복수의 컨테이너를 정의하고 실행하기 위한 도구입니다. `docker run`을 통해서 실행하는 모든 어플리케이션은 `docker-compose` 명령어를 사용하여 실행할 수 있습니다. docker-compose를 사용하면 왜 유용한지에 대해서는 [다음 글](https://github.com/Meet-Coder-Study/posting-review/blob/master/byungwoo/2021-02-04-docker-compose.md) 에 자세히 기술되어 있습니다.

## docker-compose 설치
docker와는 별도로 [공식 문서](https://docs.docker.com/compose/install/) 를 참고하여 해당하는 운영체제에 맞추어 `docker-compose` 설치합니다.  

## docker-compose.yml 파일 작성
docker-compose의 핵심이자 전부인 docker-compose.yml 파일입니다. docker-compose.yml 파일은 다음과 같이 구성되어 있습니다.
여기서는 [3.x 버전의 docker-compose file](https://docs.docker.com/compose/compose-file/compose-file-v3/) 을 기준으로 설명합니다.)

다음과 같이 파일이 구성되어 있다고 가정합니다.
(docker-compose.yml을 제외한 나머지 파일은 `부록`을 참고하시길 바랍니다.)
```
> tree ./example 
./example
├── Dockerfile
├── README.md
├── requirements.txt
├── app.py
└── docker-compose.yml
```

docker-compose.yml 파일을 작성합니다. 요청을 받는 web과 요청횟수를 기록하는 카운터 역할의 redis 서비스를 작성합니다.
```yml
version: "3.9"  # optional since v1.27.0

services:
  web:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - README.md:/docs/README.md
      - logvolume01:/var/log
    networks:
      - service-network
  redis:
    image: redis
    networks:
      - service-network

volumes:
  logvolume01: {}
networks:
  service-network: {}
```

docker-compose 파일의 기본구조는 다음과 같습니다.
```yml
version: "3.9" # docker-compose 설정파일 버전
services:
  service1:
    # 첫번째 서비스 설정
  service2:
    # 두번째 서비스 설정
  # ...

# 네트워크, 볼륨 등 docker resource 설정 
networks:
  # 네트워크 설정
volumes:
  # 볼륨 설정
```
이 구조를 통해서 볼 때 위의 docker-compose.yml 파일은 2개의 서비스(web, redis)로 이루어져 있습니다.

docker-compose를 활용하여 web, redis 서비스를 기동합니다. `-d(--detach)` 옵션을 사용하면 백그라운드로 실행합니다.
```bash
> docker-compose up -d        
Creating network "example_service-network" with the default driver
Creating volume "example_logvolume01" with default driver
Creating example_web_1   ... done
Creating example_redis_1 ... done
```

`docker-compose ps` 명령어를 활용하여 기동된 서비스(컨테이너)를 조회합니다.
```
> docker-compose ps
     Name                    Command               State           Ports         
---------------------------------------------------------------------------------
example_redis_1   docker-entrypoint.sh redis ...   Up      6379/tcp              
example_web_1     flask run                        Up      0.0.0.0:5000->5000/tcp
```

web 서비스의 경우 `5000:5000`으로 포트가 노출되어 있습니다. 요청을 보내어 응답을 확인합니다. 
```
> curl localhost:5000
Hello World! I have been seen 1 times.
> curl localhost:5000
Hello World! I have been seen 2 times.
```

## docker-compose.yml 파일 내의 구성요소
docker-compose.yml 파일 내의 구성요소와 옵션들을 살펴보겠습니다. 모든 구성요소와 옵션들을 살펴볼 수는 없기에 자주 사용되는 핵심 옵션들 위주로 기술하였습니다.  

### project
docker-compose.yml 파일에는 명시되어 있는 옵션은 아니지만 docker-compose 내의 서비스(컨테이너) 앞에 prefix로 붙는 이름입니다. `docker-compose -p ${project}`와 같이 명시하여 사용할 수 있지만 명시하지 않을 경우 docker-compose.yml 파일이 있는 폴더명을 프로젝트명으로 사용합니다.
주의: `docker-compose -p ${project} up`으로 기동할 경우 이후에 조회(ps), 종료(down)시에도 모두 -p 옵션을 붙여야 제어가 가능합니다.


### version
docker-compose.yml 파일의 버전입니다. 
docker-compose.yml 파일은 [v2](https://docs.docker.com/compose/compose-file/compose-file-v2/), [v3](https://docs.docker.com/compose/compose-file/compose-file-v3/) 버전에 따라서 작성문법이 다르며 마이너 버전에 따라서 사용할 수 있는 옵션이 조금씩 다릅니다. 
더불어 Docker Engine과 호환되는 docker-compose.yml 파일의 버전을 [확인](https://docs.docker.com/compose/compose-file/) 해야 합니다.

### service
docker-compose.yml 파일을 통해서 제어하고자 하는 서비스(컨테이너)입니다.

#### images
서비스(컨테이너)가 사용할 이미지입니다.

#### build
컨테이너를 기동하기 전에 build를 진행하는 경로를 기술합니다. 기본적으로 ./Dockerfile을 기본 도커파일로 사용하나 필요시 `build.dockerfile` 옵션에 도커파일의 이름과 경로를 지정할 수 있습니다. images 옵션을 따로 주지 않을 경우 `${service}:latest` 이름으로 이미지가 생성됩니다.

#### ports
`${컨테이너 외부}:${컨테이너 내부}`와 같이 노출시킬 포트를 매핑하는 옵션입니다.

#### volumes
도커 볼륨 혹은 호스트 볼륨을 마운트하여 사용합니다. 도커 볼륨의 경우 docker-compose.yml 파일에 선언된 볼륨만 `docker-compose.yml`에서 사용할 수 있습니다.
```yaml
version: "3.9"
services:
  web:
    # ...
    volumes:
      - README.md:/docs/README.md # 호스트의 README.md 파일을 컨테이너 내부 /docs/README.md에 마운트   
      - logvolume01:/var/log # 선언된 도커 볼륨 logvolume01을 컨테이너 내부 /var/log에 마운트
# ...
volumes:
  logvolume01: {} # 도커볼륨 logvolume01 선언 
```

#### networks
서비스(컨테이너)가 소속된 네트워크 입니다. 따로 지정하지 않을 경우 `default_${project}`와 같이 지정됩니다. 기본적으로 컨테이너는 같은 네트워크에 있어야 서로 통신이 가능합니다. 

### volume
도커 볼륨을 선언합니다. 기본적으로 이름은 `${project}_${volume}`와 같은 형식으로 생성됩니다.
선언된 도커 볼륨은 `docker-compose up`시에 컨테이너와 함께 생성됩니다.

### network
도커 네트워크를 선언합니다. 기본적으로 이름은 `${project}_${network}`와 같은 형식으로 생성됩니다.
선언된 도커 네트워크는 `docker-compose up`시에 컨테이너와 함께 생성됩니다.

## docker-compose 명령어 사용법
### [SERVICES...]
`docker-compose [COMMAND] [SERVICES...]`의 형태로 지정된 서비스(컨테이너)만 제어가 가능합니다. 예를 들어서 web, redis 중에 web만 기동하고 싶을 경우 `docker-compose up -d web`와 같이 실행합니다.

### docker-compose up
`docker-compose up` 실행시 다음의 순서로 진행합니다. 이미 생성된 경우 해당 단계를 건너뜁니다. (멱등성) 
1. 서비스를 띄울 네트워크 생성
2. 필요한 볼륨 생성(혹은 이미 존재하는 볼륨과 연결)
3. 필요한 이미지 풀(pull)
4. 필요한 이미지 빌드(build)
5. 서비스 실행 (`depends_on` 옵션 사용시 서비스 의존성 순서대로 실행)

#### --build
이미 빌드가 되었더라도 강제로 빌드를 진행합니다.

#### --d
백그라운드로 실행합니다.

#### --force-recreate
docker-compose.yml 파일의 변경점이 없더라도 강제로 컨테이너를 재생성합니다. 다시 말해서 컨테이너가 종료되었다가 다시 생성됩니다.

### docker-compose down
서비스를 멈추고 삭제합니다. 컨테이너와 네트워크를 삭제합니다.

#### --volume
선언된 도커 볼륨도 삭제합니다.

### docker-compose stop, docker-compose start
서비스를 멈추거나, 멈춰 있는 서비스를 시작합니다.

### docker-compose ps
현재 환경에서 실행 중인 각 서비스의 상태를 표시합니다.

### docker-compose logs
컨테이너 로그를 확인합니다.

#### -f
`tail -f`와 유사하게 컨테이너 로그를 실시간으로 확인합니다. (follow)

### docker-compose exec
실행 중인 컨테이너에 해당 명령어를 실행합니다.
```bash
> docker-compose exec django ./manage.py makemigrations
> docker-compose exec db psql postgres postgres
```

### docker-compose run
특정 명령어를 일회성으로 실행하지만 컨테이너를 batch성 작업으로 사용하는 경우에 해당합니다.
이미 기동하고 있는 컨테이너에 명령어를 실행하고자 하면 `docker-compose exec`을 사용하는 반면에 `docker-compose run`을 사용할 경우 컨테이너를 기동시키고 특정 명령어를 실행이 완료된 후에 컨테이너를 종료합니다.
```bash
> docker-compose exec web echo "hello world" # 이미 실행된 web 컨테이너에서 echo "hello world"를 실행
> docker-compose run web echo "hello world" # web 컨테이너에서 echo "hello world"를 실행하고 컨테이너 종료
```

## 부록: 기타 파일
- Dockerfile
```Dockerfile
FROM python:3.7-alpine
WORKDIR /code
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
RUN apk add --no-cache gcc musl-dev linux-headers
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
EXPOSE 5000
COPY . .
CMD ["flask", "run"]
```
- app.py
```bash
import time

import redis
from flask import Flask

app = Flask(__name__)
cache = redis.Redis(host='redis', port=6379)

def get_hit_count():
    retries = 5
    while True:
        try:
            return cache.incr('hits')
        except redis.exceptions.ConnectionError as exc:
            if retries == 0:
                raise exc
            retries -= 1
            time.sleep(0.5)

@app.route('/')
def hello():
    count = get_hit_count()
    return 'Hello World! I have been seen {} times.\n'.format(count)
```
- README.md
```markdown
# I am README.md
```
- requirements.txt.txt
```text
flask
redis
```

## 참고
- [Overview of Docker Compose](https://docs.docker.com/compose/)
- [도커 컴포즈를 활용하여 완벽한 개발 환경 구성하기](https://www.44bits.io/ko/post/almost-perfect-development-environment-with-docker-and-docker-compose)
- [How to understand the difference between docker-compose’s up vs run vs exec commands](https://zhao-li.medium.com/how-to-understand-the-difference-between-docker-composes-up-vs-run-vs-exec-commands-a506151967df)