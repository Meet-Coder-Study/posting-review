# package manager workspace와 monorepo tools

## workspace

현재 `22.11.17` 가장 널리 사용되는 패키지 매니저는 npm, yarn, pnpm이다. 이들 패키지 매니저 모두 workspace 기능을 제공한다. 참고로 패키지 매니저에서 제공하는 workspace도 모노레포 툴의 일종이라고 볼 수 있다.

다만, package manager workspace는 전문적인 monorepo 툴들에 비해 많은 기능을 지원하지 않는다. 공통적으로 사용하는 의존성 정도 공유하는 정도만 지원한다.

## 모노레포

> [모노레포 필요성](https://www.notion.so/c9cb395168854b34969a6f087548a7b9) 참고

현재 `22.11.17` 널리 사용되는 모노레포 툴에는 Bazel, Gradle, Lage, Lerna, Nx, Rush, Pants, Turborepo 등이 있다.

### 성능

#### 로컬 캐싱

task의 결과를 저장해놓고 동일한 task를 실행할 때 반복해서 처리하지 않도록 도와주는 기능

![local-computation-caching](https://user-images.githubusercontent.com/30178507/202447237-39c83157-0c86-4f25-8c24-6c6345310563.svg)

보통 시간이 많이드는 빌드 작업이나 테스트를 위와 같은 형태로 처리하기도 한다.

> Gradle의 경우 프로젝트내 의존성 변경이 없다면 빌드 / 테스트에 필요한 의존성을 캐시하고 그대로 사용한다. 

#### task orchestration

병렬로 순서에 맞게 task를 처리할 수 있도록 지원하는 기능.

![local-task-orchestration](https://user-images.githubusercontent.com/30178507/202447331-d65aec9f-7b83-4812-8cb3-bcada1b9b760.svg)

다음과 같이 빨간색 task는 회색 task에 영향을 받지만 노란색 task에는 영향을 받지 않는다고 가정한다. 이때 빨간색 task를 실행하기 위해 노란색 task 완료를 기다릴 필요가 없으므로 회색, 노란색 task를 병렬로 실행할 수 있다. 모노레포 툴은 위와 같은 orchestration을 도와준다.

#### 분산 캐시

장비 간 캐시를 지원하는 기능이다. 보통 팀 내에서 CI를 구성할 때 많이 고려할 수 있는 기능이다.

![distributed-computation-caching](https://user-images.githubusercontent.com/30178507/202447342-be073b5b-595e-4137-a9df-501f06578fd1.svg)

이를 통해 팀에 누군가가 빌드에 성공했다면 다른 팀원은 코드를 수정하지 않았다면 캐싱을 통해 task를 처리할 수 있다.

> Turborepo의 경우 자체적으로 제공하는 클라우드 서버를 통해 분산 캐시 기능을 제공한다. 

#### 분산 task 실행 `Distributed task execution (DTE)`

여러 task를 처리할 수 있는 기능.

![distributed-tasks-execution](https://user-images.githubusercontent.com/30178507/202447726-d8b3861a-7eb6-487d-9ce9-b73a190168e5.svg)

위 기능을 통해 비교적 비용이 드는 빌드, 테스팅 작업에 필요한 로컬 자원을 지키면서 개발이 가능하다.

참고로 분산 task 실행 `Distributed task execution (DTE)` 기능은 일부 모노레포 툴에서만 제공한다. Bazel, Nx, Pants에서 제공하며 Gradle, Rush는 제한적으로 사용할 수 있다.

> Nx에서는 기본적으로 여러 task들을 병렬로 실행하기 때문에 DTE로 실행 완료까지 걸리는 유휴 시간을 줄일 수 있다고 안내한다. Nx는 자체 Nx Cloud를 통해서 기능을 제공한다.

#### 원격 실행

여러 머신에 대해 task를 실행할 수 있도록 지원하는 기능. 원격 실행은 Bazel과 Pants에서 기능을 제공한다.

> Bazel은 gRPC를 통해 원격 실행 및 원격 캐싱을 지원한다. 이를 통해 여러 머신에서의 빌드 및 테스트를 실행할 수 있다.

#### 영향받는 프로젝트 및 패키지 탐지

변경에 따라 영향받는 프로젝트 또는 패키지를 탐지하는 기능

![dependency-graph](https://user-images.githubusercontent.com/30178507/202447723-84c993b2-628e-45ab-8b36-5c4fd49246c4.svg)

### 프로젝트 파악

#### 워크스페이스 분석

워크스페이스의 프로젝트 그래프를 분석하여 파악을 도와주는 기능이다.

![workspace-analysis](https://user-images.githubusercontent.com/30178507/202447719-6f8aac45-96a1-44d6-8e88-a9dce942c6eb.svg)

> Gradle의 경우 `dependencies` 명령을 통해 의존성 그래프를 확인할 수 있다. gradle은 `build.gradle` 또는 `build.gradle.kts`에 정의된 의존성을 확인해서 그래프를 분석한다.
>
> 그외 Lerna, Lage, Turborepo 등은 `package.json`의 의존성을 확인해서 그래프를 분석한다.


#### 의존성 그래프 시각화

프로젝트와 task들 사이의 의존성 관계를 시각화하여 어떻게 의존하는지를 한눈에 볼 수 있도록 지원하는 기능이다.

> Nx의 경우 의존성 그래프에 검색, 필터링, 숨기기, 포커스, 쿼리 기능도 지원한다.

[https://www.youtube.com/watch?v=v87Y8NgAYLo](https://www.youtube.com/watch?v=v87Y8NgAYLo)

### 프로젝트 관리

#### 소스코드 공유

소스코드 부분을 공유할 수 있도록 지원하는 기능.

![source-code-sharing](https://user-images.githubusercontent.com/30178507/202447714-4b63d049-afa1-490c-ae12-dd8e70f800c7.svg)

Lerna, Lage, Turborepo의 경우는 npm 패키지들만 공유할 수 있도록 지원한다.

> 아마 라이브러리에 대한 사용들을 의미하는 것 같다. 즉, Lerna, Lage, Turborepo는 npm repositories에 등록된 패키지들을 공유받아 사용할 수 있으며 Gradle은 MavenCentral, jcenter와 같은 저장소에서 의존성을 공유받아 사용할 수 있다는 의미로 보인다.

#### 일관성

모노레포 툴은 특정 프레임워크, 언어에 상관 없이 일관된 경험을 제공해주어야한다.

Lage, Lerna, Turborepo 등은 오직 npm 스크립트만 지원을 하기 때문에 특정 도구에 의존한다고 할 수 있다. 따라서 일관성이 부족하다라고 말할 수 있다.

#### 코드 생성

말그대로 코드를 생성하는 기능이다.

Nx와 Pants에서 위 기능을 강력하게 제공한다. 그외 다른 툴들은 외부 코드 생성기를 사용할 수 있도록 지원한다.

> Nx의 경우 컴포넌트, 기능에 대한 틀을 만들어 생성할 수 있도록 만들어주며 라이브러리가 특정 구조로 생성할 수 있도록도 만들 수 있다. 특히 컴포넌트를 업데이트하는 경우 코드 생성기를 사용하면 일관된 방식으로 생성할 수 있다.
>
> `nx generate @pkch/node:app myapp` 와 같이 generate 명령으로 generator 이름을 넣어주면 해당 generator에 정의된 대로 코드를 생성해준다. 

#### 제약과 가시성

레포지토리의 의존성 관계를 제한하기 위한 기능을 제공한다.

![project-constrains-and-visibility](https://user-images.githubusercontent.com/30178507/202448022-687ab35e-d46b-4546-9c4f-58d036dda091.svg)

> 위 모노레포 툴에 대한 기능 비교는 [모노레포 툴 비교 페이지](https://monorepo.tools/#tools-review)에서 확인할 수 있다. 

## package manager workspace vs monorepo tools

package manager workspaces는 Lerna, Turborepo와 같은 전문적인 모노레포 도구에 비해 지원하는 것들은 많지 않다. 단순히 공통 요소를 공유하는 것 정도만 가능하다.

<img width="830" alt="compare" src="https://user-images.githubusercontent.com/30178507/202448172-e66c0a00-2d2d-4e6b-92eb-813bb562a60e.png">

> [https://d2.naver.com/helloworld/7553804](https://d2.naver.com/helloworld/7553804) 참고

위 표에서도 볼 수 있듯이 package manager의 모노레포 기능은 그렇게 많은 기능을 지원하지 않는다. 다만, package manager는 모든 프로젝트에서 필수로 사용하는 만큼 만약 공통 요소만 공유하는 정도로만 사용한다면 충분히 package manager의 workspaces 만으로도 충분할 것이다.

그 외 다양한 기능이 필요하다면 모노레포 툴을 사용할 수 있을 것이다. 특히 코드 공유, 제약과 가시성, 로컬캐싱, 프로젝트 감지 기능은 있으면 개발 편의성을 높여줄 수 있기 때문에 대규모 프로젝트라면 package manager의 workspace 기능보다는 모노레포 툴을 사용하는 것이 맞지 않을까 싶다.

## 참고

[Monorepo Explained](https://monorepo.tools/)

[Selecting the Right Tool for Your Monorepo](https://blog.bitsrc.io/selecting-the-right-tool-for-your-monorepo-fafe409134b3)