# 켠김에 빌드까지: docker와 gaze로 구성하는 자동화된 개발환경 

## 도커로 구성하는 개발환경과 운영환경
컨테이너 오케스트레이션이 대중화가 되면서 어플리케이션을 컨테이너화하고 배포하는 일이 많아졌습니다. 더불어 컨테이너화를 통해서 코드와 실행환경을 묶어서 배포할 수 있게 되어서 "로컬에서는 되던데 서버에서는 왜 안되나요?..."라는 질문이 조금씩 사라지고 있습니다.

개발하고 배포하는 이미지를 만드는 과정은 보통 다음과 같은 세 가지 형태를 띕니다. 첫번째는 도커 없이 개발을 완료한 후에 도커파일로 빌드한 후에 이미지를 푸쉬하는 방식입니다. Spring Boot의 경우 `./gradlew bootRun`, Flask의 경우 `python3 -m flask run`의 명령어로 실행한 상태에서 개발을 완료한 후에 이미지를 빌드하는 것입니다. 이 방법은 개발속도는 빠를 수도 있지만 도커 없이 개발하는 상태에서 없었던 문제가 도커파일로 빌드한 후에 나타날 경우 이를 찾거나 해결하는 데에 오래걸릴 수 있다는 단점이 있습니다. 

두 번째는 소스폴더를 마운트하여 개발환경을 도커로 구성하는 방법입니다. '도커로 개발환경 구성하기'라고 검색할 경우 가장 많이 나오는 예시입니다. 도커로 어플리케이션을 debug 모드로 소스코드 폴더를 마운트하여 소스코드에서 변경점이 생길 경우 리로드가 되면서 변경사항을 실시간으로 확인할 수 있는 방법입니다. 컨테이너화한 상태에서 개발을 진행하하기는 하지만 프로덕션에서는 앞단에 웹서버를 두거나 WSGI를 두는 경우가 많아서 개발단계에서 사용한 컨테이너와 프로덕션에서 사용되는 컨테이너가 다른 경우가 있습니다. 예를 들어 자바스크립트 프로젝트의 경우 `npm run dev`로 어플리케이션을 실행하는 방식으로 도커를 실행할 수 있지만 프로덕션에서는 `npm run build`의 결과물을 웹서버가 실행하는 방식으로 진행되어서 개발용 도커파일과 운영용 도커파일이 달라질 수 있습니다.

마지막으로 운영환경의 도커파일 개발환경 단계에서 사용하는 방법입니다. 다시 말해서 웹서버/WSGI를 갖춘 도커를 개발단계에서 부터 사용하는 것입니다. 운영환경과 가장 유사한 환경에서 개발을 하기 때문에 개발자 역시 프로덕션에 대한 이해도가 생길 수 있고 빌드 후에 생기는 문제에 대해서도 개발단계에서 직접 확인할 수 있습니다. 그러나 이 방법의 가장 큰 단점은 소스코드 변경시 빌드를 다시 실행하고 도커로 실행하기까지 시간이 오래 걸린다는 점이지만 이 단점을 '자동화' 방법으로 어느 정도 극복할 수 있는 방법을 소개합니다.

## Gaze - 파일 저장할 때마다 명령 실행하기
자동화에 사용할 오픈소스는 [Gaze](https://github.com/wtetsu/gaze)입니다. Star 수는 많지 않지만 [GeekNews에서 소개](https://news.hada.io/topic?id=4677&utm_source=slack&utm_medium=bot&utm_campaign=T012P6ABDHQ) 되었었고 특정 언어나 도구에 종속되지 않고 감시하는 파일을 설정하고 실행하려는 명령어를 자유롭게 지정할 수 있습니다.

gaze를 설치하고 `gaze *.txt -c "echo {{file}}"`으로 실행할 경우 해당 폴더에 변화가 생긴 텍스트 파일명을 echo로 확인할 수 있습니다.

[gaze로 변경된 파일을 직접 실행할 수도 있습니다.](https://user-images.githubusercontent.com/515948/73607575-1fbfe900-45fb-11ea-813e-6be6bf9ece6d.gif)

## python flask 프로젝트 구성
python flask로 웹서비스를 개발한다고 가정하고 다음과 같이 간단하게 프로젝트를 구성합니다.
```
(/path/to/app) tree  
├── Dockerfile
├── app.py
├── docker-compose.yml
└── requirements.txt
```
```dockerfile
# Dockerfile
FROM python:3.8-slim-buster
WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY . .
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]
```
```python
# app.py
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, Docker!'%
```
```yaml
# docker-compose.yml
version: '3.8'
services:
  flask:
    build:
      context: .
      dockerfile: ./Dockerfile
    image: flask
    restart: always
    container_name: flask
    ports:
      - 5000:5000
```
```requirements.txt
Flask==1.1.2
```

앱을 실행하면 'Hello, Docker!'를 응답하는 간단한 웹서버입니다. `docekr-compose up` 명령어로 앱을 실행합니다.
```bash
# --build 옵션을 주어서 빌드와 실해을 동시해 수행합니다.
> docker-compose up --build -d
# ...
Creating flask ... done
```
curl 요청으르 날려서 응답을 확인합니다.
```bash
> curl localhost:5000 
Hello, Docker!
```

이제 소스코드를 변경합니다. "Hello, Docker!"를 "Hello, Flask!"으로 변경합니다.
```python
# app.py
# ...
@app.route('/')
def hello_world():
    return 'Hello, Flask!'
```

변경된 어플리케이션을 확인하려면 다시 빌드해야 합니다. `docker-compose up`을 다시 한번 실행하고 요청을 보내어 변경된 부분을 확인합니다.
```bash
> docker-compose up --build -d
# ...
# 캐시된 부분이 있어서 최초 빌드보다 빠릅니다. 
Recreating flask ... done
> curl localhost:5000
Hello, Flask! 
```

## gaze 명령어를 이용하여 자동화
이제 반복해야할 지점을 확인하였습니다. 소스코드(*.py)에 변경점이 생기면 `docker-compose up --build -d`를 실행하도록 설정하겠습니다.
```bash
> gaze -c "docker-compose up --build -d" -r *.py
# *.py 파일이 변경되면 "docker-compose up --build -d" 명령어를 실행하도록 설정
# -r: 앞서 실행중인 명령어가 끝나지 않았다면 종료하고 재실행 (보통 서버 리로드시 많이 사용)
# 실행이 되면 foreground로 파일의 변화를 감지하고 있음 
```

다른 창에서 app.py 파일을 수정합니다.
```python
# app.py
# ...
@app.route('/')
def hello_world():
    return 'Hello, Flask! Again!'
```

파일을 수정하자마자 gaze가 실행된 창에서 *.py 파일의 변화를 감지하고 `docker-compose up`을 실행하여 빌드하고 재시작합니다.
```bash
> gaze -c "docker-compose up --build -d" -r *.py
[docker-compose up --build -d]
Building flask
# ...
Recreating flask ... done
```

다른 창에서 curl을 날려서 변경된 것을 확인합니다.
```bash
> curl localhost:5000
Hello, Flask! Again!%
```

## gaze 파일을 이용하여 자동화
파일마다 다른 명령어 설정을 주거나 혹은 변화를 감지했을 때 실행할 명령어를 파일의 형태로 저장하고 싶을 경우 `.gaze.yml` 파일을 만들어서 사용할 수 있습니다.
```bash
> cat .gaze.yml
commands:
  - ext: .py
    cmd: docker-compose up --build -d
  - ext: .txt
    cmd: echo {{file}}
```

설정파일을 작성한 후에는 -f 옵션으로 설정파일을 지정하여 다음과 같이 실행할 수 있습니다.
```bash
> gaze -r -f ./.gaze.yml *
```

동일하게 파일의 변화를 감지하면 ./.gaze.yml 파일에 기술된 `docker-compose up -d` 명령어를 실행하여 빌드와 실행을 자동화합니다.

자 이제 자동화된 개발환경으로 개발을 진행하면 됩니다. 

## 참고
- https://github.com/wtetsu/gaze
- https://docs.docker.com/language/python/