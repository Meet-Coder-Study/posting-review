# docker를 넘어서 docker-compose를 써보자 (feat. 컨테이너 오케스트레이션 & IaC)

![docker-compose-button.jpg](./images/docker-compose-button.jpg)

도커(컨테이너)를 써야 하는 이유에 대해서는 여러 [글](https://www.44bits.io/ko/post/why-should-i-use-docker-container) 에서 언급하고 있습니다. 그러나 생각보다 [docker-compose](https://docs.docker.com/compose/) 를 써야 하는 이유에 대해서 설명해주는 글은 많이 보지 못한 것 같습니다.

[docker](https://docs.docker.com/engine/reference/commandline/cli/) 를 넘어서 [docker-compose](https://docs.docker.com/compose/reference/overview/) 를 써야하는 이유는 무엇일까요? 제가 생각하는 docker-compose가 갖는 특징이자 장점은 다음과 같습니다.

1. 가장 쉽고 작은 단위의 컨테이너 오케스트레이션 도구입니다.
2. 가장 쉽고 작은 단위의 IaC(Infrastructure as Code)의 구현체입니다.

저도 무슨 말인지 어려운 것 같으니 좀 구체화해서 설명드리겠습니다.

## 컨테이너 오케스트레이션과 docker-compose
컨테이너 오케스트레이션이란 여러 컨테이너들의 생명주기를 관리하는 도구를 말합니다. 다시 말해서 한 개 이상의 컨테이너를 배포, 확장 및 삭제를 좀 더 용이할 수 있게 도와주는 도구입니다. Kubernetes, Docker Swarm, Mesos 등이 컨테이너 오케스트레이션 도구의 사례로 나오지만 docker-compose도 작은 컨테이너 오케스트레이션 도구입니다.

컨테이너 오케스트레이션이라고 하면 거대하고 수많은 컨테이너를 관리하는 것만 생각하는 경우가 있는데 2개 정도의 컨테이너를 동시에 실행하거나 scale out하는 것만으로도 컨테이너 오케스트레이션이라고 할 수 있습니다. docker-compose는 `docker-compose up` 명령어를 통해서 docker-compose.yml에 기술된 모든 서비스(컨테이너)를 실행할 수 있고 `docker-compose up [SERVICE...]`와 같이 특정 서비스만 독립적으로 제어할 수 있습니다.

```shell
docker-compose up #docker-compose.yml 파일 내에 모든 서비스 실행
docker-compose up service1 #docker-compose.yml 파일 내에 service1만 실행
docker-compose scale service1=2 service2=4 #service1은 2개, service2는 4개로 scale out  
```

## IaC(Infrastructure as Code)와 docker-compose
IaC(Infrastructure as Code), 다시 말해서 "코드로서의 인프라"란 코드의 형태로 인프라를 관리하고 제어하는 것을 의미합니다. 코드를 실행하여 소프트웨어 어플리케이션이 실행하듯이 json이나 yaml 같이 DSL(Domain Specific Languange)의 형태로 인프라를 정의하고 실행하여 인프라를 구축하는 개념을 말합니다.

docker-compose의 경우 `docker-compose.yml`이라는 파일 형태로 컨테이너를 관리합니다. 이 docker-compose 파일에는 도커 컨테이너 뿐만 아니라 docker network, volume, config 등의 자원을 함께 기술하여 함께 관리할 수 있습니다. 더불어 docker-compose 파일 자체는 총체적인 서비스의 실행환경을 의미하는 인프라이기 때문에 docker-compose 파일을 작성하는 것만으로도 패키지 설치와 실행과정을 하나의 파일로 표현할 수 있고 하나의 명령어(docker-compose up)만으로 실행환경 구축과 실행이 동시에 가능합니다.   


## 예제를 통해 알아보는 docker와 docker-compose의 차이

docker-compose의 효용을 이야기하기 위해서는 동일한 작업을 docker로 구성하는 것과 비교하는 것이 직관적입니다.

예제를 통해서 docker와 docker-compose의 컨테이너 실행의 차이를 알아보겠습니다.

여기서는 [Get started with Docker Compose](https://docs.docker.com/compose/gettingstarted/) 에 나와있는 web과 redis 서비스를 예시를 활용하겠습니다.

예제는 2개의 서비스로 구성되어 있습니다.
- web: python flask framework를 활용한 웹서비스입니다. app.py 코드 작성하고 Dockerfile을 사용하여 `flask:latest`라는 이름으로 이미지를 빌드한 후 기동합니다.
- redis: `redis:alpine` 이미지를 사용한 후 기동합니다. web 서비스의 요청 횟수를 저장합니다.

먼저 프로젝트 디렉토리를 생성하고 디렉토리로 이동합니다.
```shell
mkdir composetest
cd composetest
```

web 서비스의 코드인 `app.py`를 작성합니다.
```python
import time

import redis
from flask import Flask

app = Flask(__name__)
# redis:6379를 통해서 통신합니다.
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
    return 'Hello from Docker! I have been seen {} times.\n'.format(count)
```

다음으로 web 서비스의 필수 pip 패키지를 기술한 `requirements.txt`를 작성합니다.
```text
flask
redis
```

도커를 빌드하기 위한 `Dockerfile`을 작성합니다.
```dockerfile
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

### docker를 통해서 실행하기
먼저 web 이미지를 빌드합니다. `web:latest`라는 이름으로 빌드합니다.
```shell
docker build -f Dockerfile . -t web:latest
```

web과 redis를 docker로 실행합니다.
```shell
docker run -it -p5000:5000 -d --name web web:latest
docker run -it -d --name redis redis:alpine
```

`localhost:5000`으로 요청을 보내서 결과를 확인합니다.
```shell
> curl localhost:5000
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
<title>500 Internal Server Error</title>
<h1>Internal Server Error</h1>
<p>The server encountered an internal error and was unable to complete your request. Either the server is overloaded or there is an error in the application.</p>
```

앗! 500에러가 발생합니다. 제대로 배포된 것이 아닌 것을 알려주고 있습니다.

확인을 해보니 `app.py`에서 `redis.Redis(host='redis', port=6379)` 부분을 보니 `redis:6379` 주소로 통신을 해야하는데 현재 두 도커 컨테이너는 동일한 docker network에 있지 않아서 통신이 되지 않고 있습니다.

service-network라는 docker network를 생성하고 두 컨테이너를 service-network에 연결합니다.
```shell
docker network create service-network
docker network connect service-network web
docker network connect service-network redis
```

다시 localhost:5000으로 요청을 보내어 결과를 확인합니다.
여러번 요청할 때마다 redis에 값이 저장되어 결과값이 증가하는 것을 확인할 수 있습니다.
```shell
> curl localhost:5000
Hello from Docker! I have been seen 1 times.
> curl localhost:5000
Hello from Docker! I have been seen 2 times.
```

(간단하지는 않았지만) docker를 활용하여 web과 redis 두 개의 서비스(컨테이너) 실행을 완료하였습니다. 

### docker-compose를 통해서 실행하기
이번에는 docker-compose를 통해서 실행하도록 하겠습니다.

web, redis 그리고 service-network까지 포함하여 docker-compose.yml 파일을 작성합니다.
```yaml
version: "3.9"
services:
  web:
    container_name: "web"
    image: "web:latest"
    build: .
    ports:
      - "5000:5000"
    networks:
      - service-network
  redis:
    container_name: "redis"
    image: "redis:alpine"
    networks:
      - service-network

networks:
  service-network:
    name: service-network
```

`docker-compose up` 명령어로 web, redis 서비스(컨테이너)를 기동합니다.
service-network도 동시에 생성되는 것을 확인할 수 있습니다.
* 사실 docker-compose 파일 내의 서비스(컨테이너)는 별도의 network를 명시하지 않으면 기본 네트워크를 생성하여 서비스들을 포함시키기 때문에 service-network를 기술하지 않아도 동작하는 데에는 이상 없습니다.
```shell
> docker-compose up -d
Creating network "service-network" with the default driver
Creating redis ... done
Creating web   ... done
```

`localhost:5000`으로 요청을 보내서 확인합니다.
```shell
> curl localhost:5000
Hello from Docker! I have been seen 1 times.
> curl localhost:5000
Hello from Docker! I have been seen 2 times.
```
(너무도 간단하게) docker-compose를 통해서 두 개의 서비스(컨테이너)를 실행하고 결과를 확인하였습니다.


## docker vs. docker-compose
여러개의 서비스를 실행하기 위해서는 docker로는 최소한 다음의 명령어를 사용하여 서비스를 기동해야합니다.
 
```shell
docker network create service-network
# --network 옵션을 사용하면 docker network에 해당 컨테이너를 포함하는 작업을 함께 실행할 수 있습니다.
docker run service1 --network service-network -d # 세부 옵션 생략
docker run service2 --network service-network -d # 세부 옵션 생략
```

docker-compose에서는 이 과정을 하나로 단축시킬 수 있습니다.
```shell
# docker-compose.yml 작성 후
docker-compose up -d
```

서비스(컨테이너)에 대한 수정이 필요한 경우, 예를 들어 노출 포트의 변경이나 이미지의 교체를 위해서 docker에서는 다음과 같은 명령어를 통한 작업이 수반됩니다.
```shell
# service-network 생성한 상태에서
docker stop service1 service2
docker rm service1 service2
docker run service1 --network service-network -d # 세부 옵션 생략
docker run service2 --network service-network -d # 세부 옵션 생략
```
서비스의 개수가 늘어날수록 위의 명령어의 개수는 배로 늘어납니다.

docker-compose에서는 서비스(컨테이너) 옵션의 수정 및 재배포가 다음과 같이 이루어집니다.
```shell
# docker-compose.yml 수정 후
docker-compose up -d
```

음?

![bob.png](images/bob.png)

## 정리
[코드로 인프라 관리하기](http://www.yes24.com/Product/Goods/36551650) 에는 아래와 같이 5가지 원칙이 기술되어 있습니다.
1. 시스템은 쉽게 다시 만들 수 있다.
2. 시스템은 일회용이다.
3. 시스템은 일관성이 있다.
4. 절차는 반복가능하다.
5. 설계는 항상 변한다.

docker-compose는 컨테이너에 대해서 쉬운 생성과 삭제, 일관적인 결과보장, 그리고 반복과 쉬운 수정을 가능하게 합니다. Git 프로젝트 저장소 최상위 경로 docker-compose.yml 파일을 작성하고 README.md 파일에 `docker-compose up -d` 명령어를 가이드하는 것만으로도 쉽고 빠른 `Getting Started` 가이드를 작성 할 수 있습니다.    

* 복잡한 docker 명령어를 docker-compose 파일로 변경을 해주는 [Composerize](https://www.composerize.com/) 도 활용하길 추천드립니다.

## 참고
- [왜 굳이 도커(컨테이너)를 써야 하나요?](https://www.44bits.io/ko/post/why-should-i-use-docker-container)
- [Overview of Docker Compose](https://docs.docker.com/compose/)
- [Get started with Docker Compose](https://docs.docker.com/compose/gettingstarted/)
- [Compose file version 3 reference](https://docs.docker.com/compose/compose-file/compose-file-v3/)
- [docker](https://docs.docker.com/engine/reference/commandline/docker/)
- [docker-compose](https://docs.docker.com/compose/reference/overview/)
- [코드로 인프라 관리하기](http://www.yes24.com/Product/Goods/36551650)