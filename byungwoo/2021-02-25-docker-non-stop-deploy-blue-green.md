# 도커를 활용한 무중단 배포 (Blue/Green)

## 준비사항
1. 본인의 환경에 맞추어서 [docker-compose](https://docs.docker.com/compose/install/) 명령어를 설치합니다.
2. 프로젝트 폴더를 생성하고 아래와 같이 `docker-compose.yml`, `nginx.conf` 파일을 생성합니다.
```
docker-non-stop-deploy
├── docker-compose.yml
└── proxy
    └── nginx.conf
```
3. `docker-compose.yml` 파일을 작성합니다.
- nginx, app1, app2에 app3, app4를 더하여 nginx 뒤에 총 4개의 컨테이너로 구성합니ㅏㄷ.
- nginx만 클라이언트에서 접근할 수 있게 포트가 노출되어 있고 app1~4는 nginx을 통해서 로드밸런싱된 트래픽을 수신합니다. 
- app 이미지로 [bithavoc/hello-world-env](https://github.com/bithavoc/hello-world-env) 를 사용합니다. 실제로는 웹프레임워크가 사용되겠지만 예시를 단순화하기 위해서 사용하였습니다. `GET /`으로 요청을 보낼 경우 `Hi there, I love ! ${MESSAGE}`와 같이 환경변수 `MESSAGE`가 응답본문에 나타납니다. 환경변수를 변경하는 작업으로 버전 업그레이드를 표현하겠습니다.
```yml
version: '3.8'
services:
  # nginx
  nginx:
    image: nginx:latest
    container_name: nginx
    ports:
      - "80:80"
    volumes:
      - ./proxy/nginx.conf:/etc/nginx/nginx.conf
  # nginx을 통해서 로드밸런싱되는 app1~4
  app1:
    image: bithavoc/hello-world-env
    environment:
      - 'MESSAGE=app1,v1'
  app2:
    image: bithavoc/hello-world-env
    environment:
      - 'MESSAGE=app2,v1'
```
4. nginx의 설정 파일인 `nginx.conf`를 작성합니다.
- 설정 수정 후 `service nginx reload` 명령어를 실행하면 nginx을 중단하지 않고 설정을 반영 할 수 있습니다.
- `listen 80`, `location /`을 통해서 요청을 받고 `proxy_pass http://apps` 설정을 통해서 `upstream apps` 부분으로 이동하여 app1~4의 3000번 포트로 로드밸런싱을 진행합니다.
```
user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # load balancing
    upstream apps {
        server app1:3000;
        server app2:3000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            # proxy pass
            proxy_pass http://apps;

            proxy_http_version 1.1;
            proxy_redirect off;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

    }

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log  main;

    sendfile on;
    keepalive_timeout 65;
    include /etc/nginx/conf.d/*.conf;
}
```
5. 요청을 지속적으로 날릴 `request.sh`를 작성합니다.
```shell
#!/bin/bash
while true; do curl localhost:80; echo ""; sleep 1; done
```

## Blue/Green 배포
![blue-green.png](images/blue-green.png)
- 출처: [Nginx, Docker를 활용한 무중단 배포맛보기](https://medium.com/sjk5766/nginx-docker%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EB%AC%B4%EC%A4%91%EB%8B%A8-%EB%B0%B0%ED%8F%AC%EB%A7%9B%EB%B3%B4%EA%B8%B0-8b4f8571ab24)

Blue-Green 배포는 다음의 순서로 진행됩니다.
- step1: 배포 전 상태입니다. 기존 서버 2대가 로드 밸런서 뒷 단에서 동작합니다. 배포가 완료된 신규 서버를 준비합니다.
- step2: 배포 할 신규 서버가 준비되면 신규 서버를 로드 밸런서에 추가하고 기존 서버를 제거합니다.


### 준비
nginx와 v1 상태인 app1, app2를 실행합니다.
```bash
> docker-compose up -d nginx app1 app2 
Creating nginx ... 
Creating docker-non-stop-deploy_app2_1 ... 
Creating nginx                         ... done
Creating docker-non-stop-deploy_app2_1 ... done
```
다른 터미널을 열어서 `request.sh`를 실행합니다. 연결된 app1, app2에서 v1 응답이 오는 것을 확인할 수 있습니다.
```shell
Hi there, I love ! app1,v1
Hi there, I love ! app2,v1
Hi there, I love ! app1,v1
Hi there, I love ! app2,v1
```

### Step 1
docker-compose.yml 파일에 신규버전 v2를 가진 app3와 app4를 추가합니다.
```yaml
# 생략
  app1:
    image: bithavoc/hello-world-env
    environment:
      - 'MESSAGE=app1,v1'
  app2:
    image: bithavoc/hello-world-env
    environment:
      - 'MESSAGE=app2,v1'
  app3:
    image: bithavoc/hello-world-env
    environment:
      - 'MESSAGE=app3,v2'
  app4:
    image: bithavoc/hello-world-env
    environment:
      - 'MESSAGE=app4,v2'
```
docker-compose 명령어로 app3, app4만 실행합니다.
```bash
docker-compose up -d
Creating docker-non-stop-deploy_app4_1 ... done
Creating docker-non-stop-deploy_app3_1 ... done
```
`docker-compose ps`로 조회를 해보면 app1~4까지 실행된 것을 볼 수 있다.
```bash
> docker-compose ps
            Name                           Command               State         Ports       
-------------------------------------------------------------------------------------------
docker-non-stop-deploy_app1_1   /root/app                        Up                        
docker-non-stop-deploy_app2_1   /root/app                        Up                        
docker-non-stop-deploy_app3_1   /root/app                        Up                        
docker-non-stop-deploy_app4_1   /root/app                        Up                        
nginx                           /docker-entrypoint.sh ngin ...   Up      0.0.0.0:80->80/tcp                                
```
그러나 요청은 여전히 v1 버전인 app1, app2에서만 온다. 그 이유는 nginx에 app1~2만 연결되었기 때문입니다.
```bash
Hi there, I love ! app1,v1
Hi there, I love ! app2,v1
```

### Step 2
nginx.conf 파일을 다음과 같이 수정하여 app3~4를 바라보도록 수정합니다.
```
user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    upstream apps {
        server app1:3000;
        server app2:3000;
    }

    # 추가
    upstream new-apps {
        server app3:3000;
        server app4:3000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            # 수정
            proxy_pass http://new-apps;

            proxy_http_version 1.1;
            proxy_redirect off;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

    }

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log  main;

    sendfile on;
    keepalive_timeout 65;
    include /etc/nginx/conf.d/*.conf;
}
```

nginx에 무중단 리로드 명령을 보냅니다.
```bash
> docker-compose exec nginx service nginx reload
[ ok ] Reloading nginx: nginx.
```

이제 app3~4에서 v2 응답이 오는 것을 확인할 수 있습니다.
```
Hi there, I love ! app3,v2
Hi there, I love ! app4,v2
```

v2 응답이 잘 나오는 것을 확인하면 app1 app2를 중지합니다.
```bash
docker-compose rm -s app1 app2
Going to remove docker-non-stop-deploy_app1_1, docker-non-stop-deploy_app2_1
Are you sure? [yN] y
Removing docker-non-stop-deploy_app1_1 ... done
Removing docker-non-stop-deploy_app2_1 ... done
```

### Rollback
물론 예상치 못하게 v2 버전에 버그가 있거나 응답이 잘 오지 않을 수가 있습니다.

다음과 같이 nginx.conf를 수정하여 다시 app1,app2를 바라보고  v1으로 롤백할 수 있습니다.

(app1,app2 서비스를 내렸다면 `docker-compose up -d app1 app1`으로 다시 기동해야 합니다)

nginx.conf를 다음과 같이 다시 수정합니다. (혹은 수정하기 전의 파일을 백업했다가 이름으르 바꾸어서 재활용할 수 있습니다.)
```shell
  upstream apps {
    server app1:3000;
    server app2:3000;
  }
  server {
    listen 80;
    server_name localhost;

    location / {
      # 수정
      proxy_pass http://apps;
    }
```
nginx에 무중단 리로드 명령을 보냅니다.
```bash
> docker-compose exec nginx service nginx reload
[ ok ] Reloading nginx: nginx.
```

다시 app1~2에서 v1 응답이 오는 것을 확인할 수 있습니다.
```
Hi there, I love ! app3,v2
Hi there, I love ! app4,v2
```

## 참고
- [Nginx, Docker를 활용한 무중단 배포맛보기](https://medium.com/sjk5766/nginx-docker%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EB%AC%B4%EC%A4%91%EB%8B%A8-%EB%B0%B0%ED%8F%AC%EB%A7%9B%EB%B3%B4%EA%B8%B0-8b4f8571ab24)
- [Docker-compose로 Node Express 환경 구축하기](https://medium.com/sjk5766/docker-compose%EB%A1%9C-node-express-%ED%99%98%EA%B2%BD-%EA%B5%AC%EC%B6%95%ED%95%98%EA%B8%B0-7c9ab4544172)
- [hello-world-env docker image](https://github.com/bithavoc/hello-world-env)

