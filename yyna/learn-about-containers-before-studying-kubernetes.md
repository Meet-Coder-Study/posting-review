# Kubernetes 배우기 전에 Container에 대해 알아보기

### 우리는 왜 컨테이너가 필요한가

컨테이너에 대해 잘 알지 못했던 Diagnomics 인턴 시절 힘들었던 일 중 하나를 꼽으라면 단연 서버 환경 설정이다. 당시 개발하던 프로그램마다 사용하는 라이브러리 버전이 달라서 설정하는 데 애를 먹곤 했다. 리눅스 초보였던 나는 그러다 설정이 꼬이기라도 하면 OS를 밀고 다시 깔기 위해 주머니에 우분투 부팅 USB를 지니고 다녔다.

이런 Compatibility Issue를 해결하기 위해 Docker 가 세상에 등장했다.  
docker는 분리된 별도의 환경을 가지는 컨테이너에서 각각의 애플리케이션을 실행할 수 있도록 해준다.

- 이제 개발자는 애플리케이션을 개발하고 docker 컨테이너로 만들기만 하면 된다.
- 유니온 마운트 기반으로 효율적으로 실행 환경을 이미지로 만들고 공유할 수 있다.
- 초기 버전의 도커는 [LXC](https://linuxcontainers.org/)를 그대로 사용했으나 이후 cgroups, namespace API를 직접 실행하는 libcontainer 라이브러리를 개발하고 LXC없이 동작할 수 있게 됐고 libcontainer 리팩토링을 통해 만들어진 rucC를 사용하고 있다.

### 컨테이너란 무엇인가

- 완전히 분리된 환경
- 가상머신 처럼 각자의 프로세스, 서비스, 네트워크 인페이스, 마운트를 가진다. (OS kernel 을 공유한다는 점이 가상머신과 다르다.)
- 컨테이너로 실행된 프로세스는 커널을 공유하지만, namespace, cgroups, root 디렉터리 격리 등의 커널 기능을 활용해 격리되어 실행된다.
- 호스트 머신에게는 프로세스로 인식되고 컨테이너 관점에서는 마치 독립적인 환경을 가진 가상머신처럼 보인다.

### 그렇다면, 컨테이너와 가상머신은 어떻게 다를까?

![container-vs-virtual-machine](./image/learn-about-containers-before-studying-kubernetes/1.png 'container-vs-virtual-machine')
