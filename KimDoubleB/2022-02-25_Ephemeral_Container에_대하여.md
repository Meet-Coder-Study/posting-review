# Ephemeral Container 에 대하여

Ephemeral Container는 한국어로 ‘임시 컨테이너'이다. 말 그대로 임시 컨테이너를 Pod에 추가하는 것을 의미한다. `임시(Ephemeral)` 라는 용어에 맞게 직접적으로 애플리케이션에 필요한 기능 및 빌드 작업에 필요해서 추가하는 것이 아닌 디버깅/트러블 슈팅/서비스 점검 등 목적으로 활용하기 위함이다.

<br>

### 음... 임시 컨테이너가 왜 필요할까?

임시 컨테이너의 필요성을 알기 위해선 Pod를 알 필요가 있다. Pod는 Deployment/ReplicaSet 등에 의해 계속적인 교체가 되는 일회성의 개념으로 설계되었다. 그렇기에 한번 생성된 이상 컨테이너를 추가할 수 없도록 설계되어있다. 만약 변경을 하고 싶은 경우, Deployment 등을 재배포함으로써 컨테이너를 변경한다.

그러나 기능 추가 등이 아닌 디버깅/트러블 슈팅 같은 목적을 위해서 현재 Pod 내 컨테이너 상황을 확인 및 검사해야하는 경우가 있다. 이를 위해 **새로운 컨테이너를 사용**해 내부 상태 확인 및 검사를 할 수 있도록 `Ephemeral Container`가 추가되었다.

<br>

### 임시 컨테이너는 뭐가 다른가?

일반 Pod에 정의된 컨테이너는 실행이 보장된다. 여러 프로브(`livenessProbe`, `readinessProbe`)를 통해 실행에 대한 보장을 하고, 재시작 로직을 수행하기도 한다. 하지만 임시 컨테이너는 `임시(Ephemeral)` 라는 이름에 맞게 실행이 보장되지 않는다. 앞서 말한 프로브라던지, 재시작 같은 기능이 없다. 즉, 실행을 보장하지 않는다. 이런 점에서 **임시 컨테이너를 애플리케이션의 기능을 위해 사용하는 것은 적합하지 않다.**

임시 컨테이너 자체는 일반 컨테이너의 Spec인 `ContainerSpec` 를 사용한다. 하지만 앞서 말한 것처럼 여러 프로브 등과 같이 호환하지 않는 필드들이 많다. 허용하는 필드에 대한 더 자세한 설명은 [API 문서를 참조](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#ephemeralcontainer-v1-core)하자.

<br>

### kubectl exec를 사용하면 되지 않나?

위에서 임시 컨테이너의 사용처를 이야기할 때, `컨테이너 상황을 확인 및 검사`를 이야기했다. 근데 kubernetes를 조금 다뤄본 사람이라면 알겠지만, 보통 컨테이너 내 상황을 알고 싶을 때(디버깅/트러블슈팅 등) `kubectl exec` 명령어를 활용해 쉘로 접근한다. 즉, 직접 pod 내 컨테이너에 들어가 확인하는 것이다. 

- 이 글에서는 쉘로 이야기 하고 있지만, 의미상 `디버깅 유틸`이라고 이해하면 된다.

<br>

근데 이게 불가능한 경우가 있다. `kubectl exec` 명령어를 통해 쉘로 접근하는 것은 모든 경우에 가능한 것이 아니기 때문이다.

- +) `kubectl exec` 명령어 사용법은 다음과 같다. `kubectl exec [-it] [POD_NAME] -- [COMMAND]`

<br>

보통 많이들 `kubectl exec -it {pod-name} -- sh` 를 활용하는데 `sh` 같이 쉘(또는 `/bin/bash` 등)을 실행시켜 접속한다. 하지만 **컨테이너 내 쉘이 없는 경우는 어떻게 될까?** 당연히 위 명령어는 불가능하다. 결국, 쉘로 컨테이너에 접속이 불가능해지는 것이다. 이런 경우, 임시 컨테이너가 활용될 수 있는 것이다.

근데 컨테이너에 쉘이 없는 경우가 어떤 경우인가? 싶었다. 공식문서에서 말하길 Google에서 만든 [distroless](https://github.com/GoogleContainerTools/distroless) 컨테이너 이미지가 대표적인 예라고 한다.

- `distroless` 컨테이너 이미지는 **애플리케이션과 애플리케이션의 의존성만을 갖고 있는 컨테이너 이미지이다**(이런 이미지를 Mnimal image라고 부르는 것 같다)**.** 즉, 리눅스 환경에서의 패키지 매니저, 쉘 등의 프로그램들은 포함되어 있지 않다.
- 그럼 왜 `distroless` 이미지를 사용하는가?
    - 다른 의존성을 포함하고 있지 않으니 attack vectors를 줄일 수 있다. 여러 의존성이 포함되다보면 보안적 결함이 발생할 수 있는데, 의존성 자체를 줄이니 보안적 결함을 줄일 수 있다고 이해했다.
    - 일단 애플리케이션과 관련된 의존성만을 포함하는 이미지이기에 용량이 매우 작다. 이미지가 작을 수록 리소스 사용량이 줄어들고 배포 속도가 빨라지는 이점이 있다. 공식문서에서는 `debian` 를 예시로 드는데, `alpine` 컨테이너 이미지와 `distroless` 컨테이너 이미지를 비교하면 거의 2배 가량 차이가 난다고 한다.
    - 추가로 더 많은 여러 이점들이 존재하는데, 이렇다보니 많은 개발자들이 base image로 `distroless`를 선택한다고 한다.
    

<br>

### 예시

예시에 들어가기 이전에 kubernetes 버전과 kubectl 버전이 `1.23` 이상인지 확인하자.

```bash
$ kubectl version
Client Version: version.Info{Major:"1", Minor:"23", GitVersion:"v1.23.3", GitCommit:"816c97ab8cff8a1c72eccca1026f7820e93e0d25", GitTreeState:"clean", BuildDate:"2022-01-25T21:17:57Z", GoVersion:"go1.17.6", Compiler:"gc", Platform:"darwin/amd64"}
Server Version: version.Info{Major:"1", Minor:"23", GitVersion:"v1.23.1", GitCommit:"86ec240af8cbd1b60bcc4c03c20da9b98005b92e", GitTreeState:"clean", BuildDate:"2021-12-16T11:34:54Z", GoVersion:"go1.17.5", Compiler:"gc", Platform:"linux/amd64"}
```

<br>

아무튼 `distroless` 이미지들은 shell이 없기에 `kubenetes exec` 명령어을 통해 쉘로 접근할 수 없다. `distroless` 이미지를 베이스로 해서 예시로 만들어볼까 했지만 좀 복잡해질 것 같아서 비슷하게 쉘이 존재하지 않는 이미지인 `k8s.gcr.io/pause:3.1`로 예시로 들어보자.

- `distroless` 이미지를 베이스로 예시를 만들어보고자한다면 [예시 Dockerfile](https://github.com/GoogleContainerTools/distroless/tree/main/examples)들을 참고하자.

```bash
$ kubectl run ephemeral-demo --image=k8s.gcr.io/pause:3.1 --restart=Never
pod/ephemeral-demo created

$ kubectl exec -it ephemeral-demo -- sh
OCI runtime exec failed: exec failed: container_linux.go:370: starting container process caused: exec: "sh": executable file not found in $PATH: unknown
command terminated with exit code 126
```

위에서 보는 것처럼 접속이 불가능하다.

<br>

Ephemeral Container를 사용해보자. [kubectl debug 명령어](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#debug)를 사용한다.

```bash
$ kubectl debug -it ephemeral-demo --image=busybox --target=ephemeral-demo
Targeting container "ephemeral-demo". If you don't see processes from this container it may be because the container runtime doesn't support this feature.
Defaulting debug container name to debugger-wjwz8.
If you don't see a command prompt, try pressing enter.
/ #
/ # ps -ef
PID   USER     TIME  COMMAND
    1 root      0:00 /pause
    8 root      0:00 sh
   15 root      0:00 ps -ef
/ # ls
bin   dev   etc   home  proc  root  sys   tmp   usr   var
```

- `--target` 파라미터를 통해 연결하기 원하는 컨테이너 이름을 명시해주면 된다. 해당 컨테이너의 프로세스 네임스페이스를 대상으로 연결하게 된다.

<br>

`kubectl describe` 를 통해 해당 파드의 정보를 조회해보자.

```bash
$ kubectl describe pod ephemeral-demo

...
Ephemeral Containers:
  debugger-wjwz8:
    Container ID:   docker://5e39922f588dde0da25fd213b121f6c0e494d54e7f9c6771a403d4bdb444f23e
    Image:          busybox
    Image ID:       docker-pullable://busybox@sha256:afcc7f1ac1b49db317a7196c902e61c6c3c4607d63599ee1a82d702d249a0ccb
    Port:           <none>
    Host Port:      <none>
    State:          Terminated
      Reason:       Completed
      Exit Code:    0
      Started:      Tue, 08 Feb 2022 00:50:47 +0900
      Finished:     Tue, 08 Feb 2022 00:53:28 +0900
    Ready:          False
    Restart Count:  0
    Environment:    <none>
    Mounts:         <none>
...
```

- `Ephemeral Containers` 항목으로 따로 임시 컨테이너에 대한 정보가 조회되는 것을 볼 수 있다.

<br>

`kubectl edit` 을 통해 manifest를 조회해보자.

```bash
$ kubectl edit pod ephemeral-demo

...
spec:
	ephemeralContainers:
	  - image: busybox
	    imagePullPolicy: Always
	    name: debugger-wjwz8
	    resources: {}
	    stdin: true
	    targetContainerName: ephemeral-demo
	    terminationMessagePath: /dev/termination-log
	    terminationMessagePolicy: File
	    tty: true
...
```

- spec에 ephemeralContainers 필드로 명시되어져 있는 것을 볼 수 있다.
- 그렇다고 해서 직접 추가할 수 있는 것은 아니다. 임시 컨테이너는 `ephemeralcontainers` handler를 사용해서 만들어지기 때문에 `kubectl edit`을 사용해 직접 추가하는 것을 불가능하다.

<br>

임시 컨테이너도 일반 컨테이너 이미지와 마찬가지로 파드에 추가된 이후에는 변경되거나 제거될 수 없다.

- 임시 컨테이너에 대한 정보는 계속 누적된다. 즉, 임시 컨테이너를 3번 생성했다면 `kubectl describe`, `kubectl edit` 등으로 정보를 조회할 때 3개의 `Ephemeral Containers` 가 조회된다.

<br>

### References

- https://github.com/kubernetes/enhancements/issues/277
- [https://github.com/kubernetes/enhancements/blob/master/keps/sig-node/277-ephemeral-containers/README.md](https://github.com/kubernetes/enhancements/blob/master/keps/sig-node/277-ephemeral-containers/README.md)
- [https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/](https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/)
- [https://www.infoq.com/news/2022/02/kubernetes-ephemeral-containers/](https://www.infoq.com/news/2022/02/kubernetes-ephemeral-containers/)