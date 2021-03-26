# Kubernetes Probes
Probe는 컨테이너에서 [Kubelet](https://kubernetes.io/ko/docs/concepts/overview/components/#kubelet) 의해 주기적으로 수행되는 진단(diagnostic)이다. 쉽게 말하면 컨테이너의 Health Check 및 그 결과에 대한 조치를 수행한다.

![startcraft-probe.png](images/startcraft-probe.png)
<center>네, 스타크래프트의 그 프로브랑 역할이 같습니다...</center>

## Handlers
Kubelet은 다음 중 세 가지 중 하나의 핸들러를 호출하여 Probe를 수행한다.

### 1. ExecAction
컨테이너 내에서 지정된 명령어를 실행한다. 명령어 상태 코드 0으로 종료되면 진단이 성공한 것으로 간주한다.
```yml
apiVersion: v1
kind: Pod
metadata:
  labels:
    test: liveness
  name: liveness-exec
spec:
  containers:
  - name: liveness
    image: k8s.gcr.io/busybox
    args:
    - /bin/sh
    - -c
    - touch /tmp/healthy; sleep 30; rm -rf /tmp/healthy; sleep 600
    livenessProbe:
      exec:
        command:
        - cat
        - /tmp/healthy
        # /tmp/healthy 파일이 있으면 성공
      initialDelaySeconds: 5
      periodSeconds: 5
```

### 2. TCPSocketAction
지정된 포트에서 컨테이너의 IP 주소에 대해 TCP 검사를 수행한다. 포트가 활성화되어 있다면 진단이 성공한 것으로 간주한다.
```yml
apiVersion: v1
kind: Pod
metadata:
  name: goproxy
  labels:
    app: goproxy
spec:
  containers:
  - name: goproxy
    image: k8s.gcr.io/goproxy:0.1
    ports:
    - containerPort: 8080
    readinessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 10
    livenessProbe:
      tcpSocket:
        port: 8080
      # 8080 port가 open되어 있으면 성공
      initialDelaySeconds: 15
      periodSeconds: 20
```

### 3. HTTPGetAction
지정된 포트 및 경로에서 컨테이너의 IP 주소에 대한 HTTP Get 요청을 수행한다. 응답의 상태코드가 200 보다 크고 400 보다 작으면 진단이 성공한 것으로 간주한다.
```yml
apiVersion: v1
kind: Pod
metadata:
  labels:
    test: liveness
  name: liveness-http
spec:
  containers:
  - name: liveness
    image: k8s.gcr.io/liveness
    args:
    - /server
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
        httpHeaders:
        - name: Custom-Header
          value: Awesome
          # `curl -H "Custom-Heade: Awesome" localhost:8080/healthz` 요청을 보내서 200 OK 나오면 성공
      initialDelaySeconds: 3
      periodSeconds: 3
```
만약 `HTTP POST`를 사용하고 싶다면 [다음](https://stackoverflow.com/a/53807567) 과 같이 `ExecAction`을 사용하면 된다.

## Probe 결과
Probe 수행 후 다음의 결과 중 하나를 갖는다.
- Success: 컨테이너가 진단을 통과함.
- Failure: 컨테이너가 진단에 실패함.
- Unknown: 진단 자체가 실패하였으므로 아무런 액션도 수행되면 안됨.

## Probe의 종류
Probe는 다음의 세 가지 종류가 있으며 각각 다음과 같은 역할을 담당한다.
파드 내 컨테이너 기동시 스타트업 프로브, 활성 프로브, 준비성 프로브 순으로 진행된다고 보고 설정을 하면 된다.

### 1. 활성 프로브(livenessProbe)
컨테이너가 동작 중인지 여부를 나타낸다. 만약 결과가 실패한다면, kubelet은 컨테이너를 죽이고, 해당 컨테이너는 재시작 정책의 대상이 된다. 만약 컨테이너가 활성 프로브를 제공하지 않는 경우, 기본 상태는 Success이다.

예를 들어 `localhost:8080/health`로 컨테이너 내부에서 http 요청을 보냈을 때 200 OK 응답이 나오지 않는다면 해당 컨테이너는 의미가 없는 컨테이너로 간주하고 재시작을 해야되기 때문에 liveness probe로 설정할 수 있다.


### 2. 준비성 프로브(readinessProbe)
컨테이너가 요청을 처리할 준비가 되었는지 여부를 나타낸다. 만약 준비성 프로브가 실패한다면, 엔드포인트 컨트롤러는 파드에 연관된 모든 서비스들의 엔드포인트에서 파드의 IP주소를 제거한다. 준비성 프로브의 초기 지연 이전의 기본 상태는 Failure이다. 만약 컨테이너가 준비성 프로브를 지원하지 않는다면, 기본 상태는 Success이다.

예를 들어 `localhost:8080/ready`로 요청을 보내서 200 OK가 나오는 경우에만 파드 앞에 연결된 서비스에서 로드밸런싱을 진행한다.

### 3. 스타트업 프로브(startupProbe)
컨테이너 내의 애플리케이션이 시작되었는지를 나타낸다. 스타트업 프로브가 주어진 경우, 성공할 때까지 다른 나머지 프로브는 활성화되지 않는다. 만약 스타트업 프로브가 실패하면 활성프로브와 동일하게 kubelet이 컨테이너를 죽이고, 컨테이너는 재시작 정책에 따라 처리된다. 컨테이너에 스타트업 프로브가 없는 경우, 기본 상태는 Success이다.

서비스를 시작하는 데에 오랜 시간이 걸리는 컨테이너가 있는 파드에 사용한다. 예를 들어 Spring Boot Application이 컨테이너 내부에서 기동되는 데에 오래 걸려서 앞에서 활성 프로브가 몇번의 실패를 거듭하는 현상이 지속된다면 스타트업 프로브를 사용하여 활성 프로브가 시작되는 시점을 뒤로 늦춰서 불필요한 활성 프로브 실패를 줄일 수 있다.


# 참고
- [파드 라이프사이클](https://kubernetes.io/ko/docs/concepts/workloads/pods/pod-lifecycle/)
- [Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [kubernetes Pod의 진단을 담당하는 서비스 : probe](https://medium.com/finda-tech/kubernetes-pod%EC%9D%98-%EC%A7%84%EB%8B%A8%EC%9D%84-%EB%8B%B4%EB%8B%B9%ED%95%98%EB%8A%94-%EC%84%9C%EB%B9%84%EC%8A%A4-probe-7872cec9e568)