# Kubernetes
> 쿠버네티스는 컨테이너화된 워크로드와 서비스를 관리하기 위한 이식성이 있고, 확장가능한 오픈소스 플랫폼이다. 쿠버네티스는 선언적 구성과 자동화를 모두 용이하게 해준다.
> 
> Kubernetes is a portable, extensible, open-source platform for managing containerized workloads and services, that facilitates both declarative configuration and automation
<center>https://kubernetes.io/ko/docs/concepts/overview/what-is-kubernetes/</center>

- 워크로드: 주어진 기간에 시스템에 의해 실행되어야 할 작업의 할당량. 쿠버네티스에서는 컨테이너로 구성된 작업을 의미.
- 이식성: 다른 환경에서 동일한 소프트웨어를 사용할 수 있다는 것
- 선언적 구성(declarative configuration) vs. 명령어 구성(imperative configuration)
  - 선언적 구성: 결과를 생성하기 위해 원하는 상태를 선언(ex. apply, diff)
  - 명령어 구성: 사용자가 직접 일련의 조치를 취하는 구성(ex. create, delete, replace)

# Kubernetes Objects 
- 쿠버네티스 시스템에서 영속성을 가지는 기본 구성 단위
- 쿠버네티스의 구성요소(Components, ex. kube-apiserver, etcd, kubelet, ...)와는 다른 개념이므로 유의

## 기본 오브젝트
### Pod
![pod.png](https://subicura.com/assets/article_images/2019-05-19-kubernetes-basic-1/pod.png)
<center>https://subicura.com/2019/05/19/kubernetes-basic-1.html</center>

- "고래 떼"를 일컫는 말에서 유래
- '하나 이상의 컨테이너'로 구성된 오브젝트
- 동일한 네트워크와 볼륨(스토리지)을 공유
- 스케일링과 복제가 되는 기본 단위
- Pod를 직접 배포하는 일은 없음

### Replica Set
![replicaset.png](https://subicura.com/assets/article_images/2019-05-19-kubernetes-basic-1/replicaset.png)
<center>https://subicura.com/2019/05/19/kubernetes-basic-1.html</center>

- 구) Replication Controller
- Stateless 어플리케이션을 복제하기 위한 용도로 사용
- Pod의 복제를 담당하는 오브젝트

### Service
![service.png](https://miro.medium.com/max/913/0*YxZrrdmKZ4Hw2s1c.png)
<center>https://medium.com/avmconsulting-blog/external-ip-service-type-for-kubernetes-ec2073ef5442</center>

- Pod로 트래픽을 프록시하고 로드밸런싱을 담당하는 오브젝트


### Storage
#### Persistent Volume
- Pod에서 사용하는 데이터를 보존하기 하기 위한 볼륨 오브젝트
#### Config Map
- Pod에서 사용하는 설정파일 오브젝트
- ex) Nginx의 nginx.conf, Elasticsearch의 elasticsearch.yml 등 
#### Secret
- Pod에서 사용하는 암호화된 설정파일 오브젝트
- ex) Database 계정, 패스워드

## 클러스터 구성 오브젝트
![namespace-label.png](https://subicura.com/assets/article_images/2019-05-19-kubernetes-basic-1/namespace-label.png)
<center>Namespace와 Label</center>
<center>https://subicura.com/2019/05/19/kubernetes-basic-1.html</center>

### Namespace
- 쿠버네티스 오브젝트를 위한 폴더
- 쿠버네티스 오브젝트는 생성되면 무조건 하나의 Namespace에 속하게 된다.
- 최초 클러스터 구성시 default와 kube-system Namespace가 생성됨
- Namespace 별로 역할기반접근제어(RBAC, Role-Based Access Control) 규칙을 다르게 설정할 수 있음
- Namespace 별로 리소스(cpu, memomry) 제한을 줄 수 있음

### Label
- 쿠버네티스 오브젝트를 식별하기 위한 key-value
- Label Query 또는 Label Selector를 통해서 특정 key-value를 가진 오브젝트에 대해서만 명령을 내릴 수 있음  

### Annotation
- 오브젝트에 할당한 메타데이터
- Label과 다르게 식별용도로 사용하지 않음
- 시스템이 필요한 정보들을 담고 있어서 쿠버네티스 클라이언트나 라이브러리가 활용하는데 사용 (ex. nginx-ingress에서 사용하는 정보)
- 배포시 변경사유나 담당자 정보를 적는 데에도 사용

## 고급 오브젝트
### Deployment
- 오브젝트의 한 버전에서 다른 버전으로 안전한 롤아웃을 나타내기 위해 사용하는 오브젝트
- Replica Set에 배포방식을 추가한 것

### Ingress
![ingress.png](https://subicura.com/assets/article_images/2019-05-19-kubernetes-basic-1/ingress.png)
<center>https://subicura.com/2019/05/19/kubernetes-basic-1.html</center>

- 경로 및 호스트 기반 HTTP 로드밸런서와 라우터 객체(L7)
- 외부에서 유입되는 트래픽을 특정 Service로 라우팅하는 역할  

### Stateful Set
- Database와 같이 Stateful 성격을 가지는 Pod를 관리하는 오브젝트
- Deployment가 Stateless 어플리케이션을 배포하기 위해 사용한다면 Stateful Set은 Stateful 어플리케이션을 배포하기 위해서 사용
- Pod 이름에 대해서 임의의 해시가 아닌 규칙성을 부여하여 순차적으로 증가
- 배포시 순차적인 기동과 업데이트
- 개별 Pod 마다 다른 볼륨을 사용할 수 있음

## 배치 워크로드
### Job
- 배치 또는 일회성 워크로드 오브젝트
- Job에 의해 생성된 Pod는 작업을 완료하고 종료할 때까지만 실행됨
- 동일한 Pod를 여러개 만들어서 병렬처리 가능 

### Cron Job
- Job에 스케줄링 기능을 추가한 오브젝트

## 클러스터 에이전트와 유틸리티
### 데몬셋
- 모든 노드(서버)에 1개씩 배포되는 오브젝트
- 주로 모니터링 용도로 사용

# 참고
- [쿠버네티스 공식 문서](https://kubernetes.io/ko/docs/home/)
- [매니징 쿠버네티스](http://www.yes24.com/Product/Goods/73416815)
- [쿠버네티스 시작하기 - Kubernetes란 무엇인가?](https://subicura.com/2019/05/19/kubernetes-basic-1.html)
- [쿠버네티스 안내서 설치부터 배포까지 <실습편>](https://subicura.com/k8s/)
- [쿠버네티스 구성요소 : 객체(Object), 컨트롤러(Controller), 템플릿(Template)](https://arisu1000.tistory.com/27832)
