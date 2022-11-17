# 모노레포

![모노레포](https://engineering.linecorp.com/wp-content/uploads/2022/04/turborepo1.png)

## 모놀리식 방식

장점

- 서로 직접 의존하기 때문에 코드 재사용 용이하다.
- 빌드 및 배포 과정이 단순하다

단점

- 관심 분리가 어렵다
- 기능 추가나 삭제가 리포지터리 전체에 영향을 준다.

## 멀티 레포 방식

장점

- 소스 코드를 모듈화한 뒤 각 모듈에 독자적인 영역을 부여하고 버전 관리를 통해 관심을 분리한다.
- 기능 변경이 다른 리포지터리에 직접 영향을 미치지 않는다.

단점

- 코드 단계에서의 재사용이 어렵다.
- 빌드와 배포 과정이 복잡하다.

## 모노레포 방식

모놀리식 리포지터리와 멀티레포의 장점을 모두 취하고자 등장했습니다.

장점

- 리포지터리가 하나이기 때문에 모든 프로젝트의 코드와 자원(assets) 간의 관계와 의존성을 한눈에 확인할 수 있습니다.

- 모든 커밋 히스토리가 한 리포지터리에 남기 때문에 히스토리를 추적하거나 전체 리포지터리의 개발 방향을 이해하는 게 쉬워집니다.

- 여러 곳에서 중복으로 사용하는 자산들(테스트 코드 등)을 공유하고 재사용할 수 있습니다.

## 도구

### Lerna

Lerna는 Babel 개발자에 의해 개발되어 2015년부터 다수의 프로젝트에서 모노레포 관리 도구로 사용되어 왔다. 2022년 5월 현재 Nx의 개발사인 Nrwl이 프로젝트 관리 권한을 인수했다.

Yarn으로 모노레포를 구성할 수는 있지만 여러 workspace의 버전 관리, 테스트, 빌드, 배포, 게시 등의 작업은 일일이 구성해야 한다. Lerna는 이러한 작업을 최적화한다.

### Nx

Nx는 구글 개발자들이 만든 오픈소스 프로젝트이다. 모노레포 구성을 위한 다양한 개발 도구를 제공하고 Angular, React와 같은 프런트엔드 프레임워크 기반의 개발 환경 구성뿐 아니라 Express, Nest.js와 같은 백엔드 기술 기반의 개발까지 폭넓게 지원하고 있다.

이뿐만 아니라 workspace 생성 시 Cypress, Jest 등을 기반으로 한 테스트 환경까지 설정해주기 때문에, 초기 모노레포 개발 환경 구축 비용을 크게 줄여준다.

### Turborepo

Vercel에서(2021년 12월에 인수) 개발 및 운영하고 있는 JavaScript/TypeScript를 위한 모노레포 빌드 시스템이다.

Turborepo는 증분 빌드(incremental build), 병렬 처리 기법을 통해 빌드 성능을 끌어올리고, Pipeline의 쉬운 설정과 profiling, trace 등 다양한 시각화 기능을 제공해 관리 편의성을 높인 것이 특징이다.

- incremental build

  작업 진행을 캐싱해 이미 계산된 내용은 건너 뛰는 것을 의미합니다.
  
  ![incremental build](https://engineering.linecorp.com/wp-content/uploads/2022/04/turborepo4.png)

- Parallel execution

  모든 코어를 사용하는 병렬 실행을 목표로 합니다. 지정된 태스크 단위로 의존성을 판단해 최대한 병렬적으로 작업을 진행합니다.

  ![Parallel execution](https://engineering.linecorp.com/wp-content/uploads/2022/04/turborepo6.png)

- Task Pipelines

  태스크 간의 연결을 정의해서 빌드를 언제 어떻게 실행할지 판단해 최적화합니다.
  
  [Running Tasks in a Monorepo](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)

- Profile in browser

  빌드 프로필로 빌드 과정을 시각화하면 병목 지점을 쉽게 찾을 수 있습니다.
  
  ![Profile in browser](https://engineering.linecorp.com/wp-content/uploads/2022/04/turborepo8.png)

그리고 그 외에 pnpm, yarn berry도 있습니다.

다음에는 꼭 Real World로... 도전해보기...

[Turborepo로 모노레포 개발 경험 향상하기](https://engineering.linecorp.com/ko/blog/monorepo-with-turborepo)

[모던 프론트엔드 프로젝트 구성 기법 - 모노레포 도구 편](https://d2.naver.com/helloworld/7553804)
