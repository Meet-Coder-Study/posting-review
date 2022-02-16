# Docker Desktop 사용하지 않고 Docker 사용하기 

## Docker Desktop 유료화
[Docker Desktop이 유료화](https://www.docker.com/pricing)가 됨에 따라서 기업에서 데스크톱 docker를 사용하기 위해서는  
월 구독료를 지불해야 한다. 2022년 1월까지가 유예기간이었고 2월부터는 250명 이상의 직원이 속한 매출 1,000만 달러 이상의 기업은 무료로 Docker Desktop을 이용할 수 없다.

## Docker Desktop? Docker Engine? Docker CLI? 
그렇다면 서버마다 월 구독료를 내야하는 것인가? 그렇지는 않다. 유료화가 진행된 것은 Docker Desktop이지 Docker Engine 자체는 아니기 때문이다. 이게 무슨 말인지 이해하려면 일단 Docker Engine과 Docker CLI를 구별해야 한다.

우선 많이들 혼동하는 부분이 있는데 일단 컨테이너와 Docker는 동일한 개념이 아니다. 컨테이너 기술은 [여러 컨테이너 런타임](https://kubernetes.io/docs/setup/production-environment/container-runtimes/)으로 구현할 수 있도 Docker는 그 중에 하나일 뿐이다.

Docker Engine(Daemon)과 Docker CLI(Client)를 Docker라는 용어로 묶어서 사용하는데 두 가지는 별도로 설치되고 관리될 수 있기 때문에 구별이 필요하다.

간단히 말하면 Docker Engine은 데몬 형태로 실행하는 컨테이너 엔진 그 자체이고 Docker CLI는 우리가 사용하는 `docker` 명령어 인터페이스이다. 보통 Docker Engine을 설치할 때 Docker CLI를 같이 설치하기 때문에 Docker CLI의 존재를 모르는 경우가 있다.

예를 들어 [CentOS에 Docker를 설치할 때](https://docs.docker.com/engine/install/centos/#install-using-the-repository) `sudo yum install docker-ce docker-ce-cli containerd.io` 명령어로 설치를 진행하는데 여기서 docker-ce가 Docker Engine에 해당하고 docker-ce-cli가 Docker CLI에 해당한다.

(참고로 Docker Engine의 경우 Community Edition(CE)과 Enterprise Editoin(EE)이 있는데 Docker Engine CE만 무료이다.)

그리고 `docker ps`를 쳤을 때 다음과 같은 메세지를 본 적이 있을 것이다.
```bash
> docker ps
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```
`Is the docker daemon running?` 메세지가 말해주듯이 `docker` 명령어를 연결하여 사용할 Docker Engine이 꺼져있거나 설치되지 않았음을 나타낸다.

Docker Desktop으로 돌아와서 Docker Desktop은 데스크톱 환경에서 Docker를 사용할 수 있게 해주는 프로그램이다. 여기서 데스크톱 환경은 Mac와 Windows에 해당한다. Docker Desktop을 설치하면 Docker Engine, Docker CLI, 그리고 GUI 환경까지 제공해준다. 

유료화가 진행되는 것은 Docker Desktop이지 Docker Engine, Docker CLI는 아니기 때문에 내가 Docker Engine와 Docker CLI를 별도로 설치할 경우 무료로 Docker를 사용할 수 있다.

그러나 여기서 문제가 있는데 Docker Engine을 Linux에 Community Edition으로 설치하는 것은 가능하다 Mac이나 Windows 환경에서 Docker Engine을 사용하기 위해서는 반드시 Docker Desktop을 설치해야 한다. 다시 말해서 Mac과 Windows에서는 Docker Desktop 없이 '직접적으로' Docker를 사용할 수 없는 방법은 없는 것이다.

제목은 Docker Desktop의 대체재를 찾는다고 이야기하고 Docker Engine과 Docker CLI의 차이에 대한 이야기만 하더니 Docker Desktop을 피해갈 수 없다는 이야기를 해서 혼란스러울 수도 있다. 그럼에도 불구하고 오픈소스 커뮤니티의 도움으로 우리는 '간접적으로' Docker를 사용할 수 있는 방법이 있다.

여기서 말하는 간접적인 방법이란 Mac이나 Windows와 같은 데스크톱 환경이 아닌 Linux 같은 서버환경을 VM 만들고 거기에 Docker Engine CE를 설치하는 것이다. 그리고 Docker CLI를 VM 내의 Docker Engine에 연결하는 것이다.

정리하며 다음과 같다.
```bash
# Docker Desktop 사용시 (유료)
[HostOS] docker cli =(docker.sock)=> [HostOS] docker Engine
# Docker CLI + Docker Engine(VM) 사용시 
[HostOS] docker cli =(docker.sock)=> [GuestVM] docker Engine
```

Windows WSL 내에 docker를 설치하는 것은 Linux 내에서 Docker를 구성하는 것과 유사하기 때문에 이 글에서는 Mac 중심으로 설명하겠다.

Mac에서 Docker CLI는 다음과 같은 방법으로 설치할 수 있다.
```bash
brew install docker
```

이제 Docker CLI에 연결할 Docker Engine을 구성하는 방법은 다음과 같다.

## Lima
[Lima](https://github.com/lima-vm/lima)는 Mac에서 Linux VM을 손쉽게 관리할 수 있는 오픈소스이다. Lima로 Docker Engine CE가 설치된 Ubuntu를 설치하고 호스트 Docker CLI를 연결하여 사용할 수 있다.

```bash
# lima 설치
brew install lima 
limactl --version
# limactl shell docker

# Docker Engine CE가  설치된 Ubuntu VM 설정파일 다운로드
wget https://raw.githubusercontent.com/lima-vm/lima/master/examples/docker.yaml
cat ./docker.yaml

# lima로 VM 생성
limactl start ./docker.yaml

# 생성한 VM 조회 (VM명은 docker)
limactl list
 
# 생성한 VM 중지 및 삭제
limactl stop docker
limactl delete docker
 
# VM과 ${HOME} 디렉토리를 공유하는지 확인
ls /Users
limactl shell docker /Users

# docker VM에 ssh 접속 혹은 명령어 전달
# limactl shell ${INSTANCE} [COMMAND...]
limactl shell docker
limactl shell docker ls -al
 
# VM 외부에서 docker cli를 연결
export DOCKER_HOST=$(limactl list docker --format 'unix://{{.Dir}}/sock/docker.sock')
docker info # lima-docker인지 확인
docker run hello-world
# Hello from Docker!
```

## Minkube
데스크톱용 Kubernetes으로 알려져 있지만 minikube가 컨테이너 엔진을 생성하기 때문에 호스트에서 Docker CLI를 연결하여 다음과 같이 사용할 수 있다. 
> Slicon M1 Mac에서는 VirtualBox가 사용불가해서 minikube 기동시 driver=virtualbox 옵션을 사용할 수 없다. (다른 드라이버 옵션에 대해서는 테스트를 진행하지 않았음)   
```bash
# minikube 설치
rew install --cask virtualbox
brew install minikube
minikube start --driver=virtualbox

# docker cli를 연결 생성된 VirtuaboxVM 내 docker engine에 연결하여 사용
eval $(minikube docker-env)
docker run hello-world 
```

## Rancher Desktop
[Rancher Desktop](https://rancherdesktop.io/)은 Rancher에서 만든 데스크톱용 Kubernetes이자 Docker Desktop의 대체재로서 부상하고 있다. Docker Desktop과 동일하게 단순히 다운로드/설치/실행하는 방식으로 손쉽게 Kubernetes 환경을 구축할 수 있는데 여기서 dockerd(moby)를 Container Runtime으로 선택할 경우 별도의 환경변수 설정없이 바로 Docker CLI에 연결하여 사용할 수 있다.
```bash
# Rancher 설치후 docker 명령어 실행
docker info
# Name: lima-rancher-desktop 확인

docker run hello-world
```

## Podman
[Podman](https://podman.io/)은 daemonless container engine으로서 RedHat이 운영하고 있는 Docker의 대체재로서의 오픈소스이다. 여기서 daemonless라 함은 별도의 프로세스의 실행없이 컨테이너를 제어할 수 있다는 의미이다.

`alias docker=podman`으로 마치 docker와 거의 유사한 인터페이스를 사용할 수 있다.

Podman은 내부적으로 Podman이 설치된 Podman Engine(VM)을 실행하는 방식으로 동작한다.
```bash
[HostOS] Podman Client =(sock, no volume mount!)=> [GuestVM(Podman Machine)] Podman
```
그러나 아쉽게도 현재까지는 v3까지 릴리즈되었으나 HostOS와 Podman Machine 간에 볼륨 마운트가 지원되지 않아서  컨테이너에 볼륨을 마운트할 수 없다.
(다시 말해서 run 명령어 뒤에 -v 옵션을 주어도 볼륨 공유가 되지 않기 때문에 제대로 동작하지 않음. 이 옵션은 v4부터 지원예정)

```bash
brew install podman

# podman machine 시작
podman machine init
podman machine start
 
# podman machine 실행 확인
podman info 

# podman 실행
podman run -dt -p 8080:80/tcp docker.io/library/httpd

# docker 처럼 사용
alias docker=podman
docker run -dt -p 8080:80/tcp docker.io/library/httpd
```

## 결론
Docker Desktop이 갑자기 유료화됨에 따라서 오픈소스 진영에서 아직 Docker Desktop을 대체할만한 방법이 정리되지 않은 것 같고 위에서 언급한 대체재들이 모두 미성숙한 상태이다. 따라서 자신의 환경에 맞게 가장 쉽게 사용할 수 있는 방안을 선택하고 더 좋은 방안이 나올 경우 빠르게 변화하는 것이 더 좋은 전략이 될 것으로 생각한다. 여러가지 방안들을 검토해본 결과 비용에 크게 구애받지 않는다면... 그냥 Docker Desktop을 유료로 구매해서 사용하자!...

# 참고
- [Slicon M1 Mac에서 Lima로 Docker Desktop 대체 하기](https://breezymind.com/slicon-m1-mac-lima-docker-desktop-alternative/)
- [Slicon M1 Mac에서 쿠버네티스 환경 구축하기 (feat. lima+minikube)
  ](https://breezymind.com/slicon-m1-mac-kubernetes-env-with-lima-minikube/)
- [Mac에서 Docker Desktop 사용하지 않고 Docker 사용하기 (feat. minikube)](https://blog.bsk.im/2021/09/07/macos-docker-without-docker-feat-minikube-ko/) 
