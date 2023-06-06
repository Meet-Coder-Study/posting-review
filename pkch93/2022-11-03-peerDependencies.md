# peerDependencies

peerDependencies란 실제로 패키지에서 import하지는 않지만 특정 라이브러리나 툴에 호환성을 필요로 할 경우에 명시하는 dependencies이다.

## peerDependencies 동작

npm 3부터 npm 6까지는 peerDependencies가 자동으로 설치되지 않았고 버전이 맞지 않더라도 경고 문구만 떴다. 하지만 `npm@7`부터는 기본으로 peerDependencies가 설치되고 이 버전이 맞지 않는 경우 에러도 발생한다.

```json
{
  "name": "example",
  "dependencies": {
    "react": "16.8.6"
  },
  "devDependencies": {
    "@testing-library/react-hooks": "^7.0.2"
  }
}
```

예시로 위 example 프로젝트에서는 `react` 버전을 `16.8.6`을 사용하고 `@testing-library/react-hooks` 버전을 `^7.0.2` 로 정의한다. 이때 `@testing-library/react-hooks`는 `peerDependencies`로 react 버전을 `16.9` 이상을 요구하기 때문에 `npm@7` 이상에서는 설치가 되지 않는다.

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! 
npm ERR! While resolving: example@undefined
npm ERR! Found: react@16.8.6
npm ERR! node_modules/react
npm ERR!   react@"16.8.6" from the root project
npm ERR! 
npm ERR! Could not resolve dependency:
npm ERR! peer react@">=16.9.0" from @testing-library/react-hooks@7.0.2
npm ERR! node_modules/@testing-library/react-hooks
npm ERR!   dev @testing-library/react-hooks@"^7.0.2" from the root project
npm ERR! 
npm ERR! Fix the upstream dependency conflict, or retry
npm ERR! this command with --force, or --legacy-peer-deps
npm ERR! to accept an incorrect (and potentially broken) dependency resolution.
npm ERR! 
npm ERR! See /Users/chulsea/.npm/eresolve-report.txt for a full report.

npm ERR! A complete log of this run can be found in:
npm ERR!     /Users/chulsea/.npm/_logs/2022-11-03T09_37_22_133Z-debug-0.log
```

peerDependencies를 정의하는 경우에는 정의한 의존성을 함께 설치한다. 
예시로 `example` 프로젝트에서 peerDependencies로 `4.7.0` 버전의 lodash를 정의한다고 가정한다.

```json
{
	"name": "example",
	"peerDependencies": {
		"lodash": "4.7.0"
	}
}
```

위와 같이 정의하면 `example` 을 설치할때 peerDepencies 설치시에 `4.7.0` 버전의 lodash도 함께 설치한다. 

![](https://user-images.githubusercontent.com/30178507/199705071-c63528d1-7486-4b86-9143-56325c4dcd85.png)

## peerDependencies의 필요성

peerDependencies는 왜 필요할까? 이를 알기 위해서 먼저 패키지 매니저가 sub-dependencies를 다루는 방식과 플러그인에 대해 알아야한다.

### 패키지 매니저가 sub-dependencies를 다루는 방법

```
|---a@2.0.0
|---some-library@1.0.0
	|---a@1.1.2
```

위 의존성처럼 `2.0.0` 버전의 a 의존성과 `1.0.0` 버전의 some-library를 사용한다고 가정한다. some-library에는 `1.1.2` 버전의 a 의존성을 사용하고 있다. 이때 some-library에는 내 프로젝트의 `2.0.0` 버전의 a 의존성을 방해하지 않고 사용하는 `1.1.2` 버전의 a 의존성 카피가 있기 때문에 문제없이 동작한다.

### 플러그인

의존성 패키지가 다른 패키지에 직접 import 되는 것은 아니지만 그 호스트 패키지와 호환성을 가지고 있는 것을 표현하고 싶을 수 있다. 이를 일반적으로 플러그인이라고 한다.

> 종종 플러그인을 라이브러리 의존성, 라이브러리 패키지라고도 한다.
> 

플러그인의 경우 호스트, 즉, 해당 플러그인을 사용하는 프로젝트의 의존성을 함께 사용하도록 되어있다.

```
|---a@2.0.0
|---some-library@1.0.0
	|---a@1.1.2
```

따라서 위 의존성 그래프가 플러그인의 의존성 그래프라면 런타임에 some-library에서 미묘하게 오류가 발생할 수 있다.

### 플러그인의 의존성 문제 해결법

따라서 위 문제를 해결하기 위해서 peerDependencies를 사용한다. 위 예시의 some-library에서 호환되는 호스트 패키지 버전을 peerDepedencies에 명시하여 해결할 수 있다.

```json
{
	"name": "some-library",
	"peerDependencies": {
		"a": "1.x"
	}
}
```

위와 같이 peerDependencies에 `a` 의존성과 호환되는 버전을 명시할 수 있다.

단, 위 경우 `npm@7` 이상에서는 위 예시의 의존성 그래프에서는 에러가 발생한다. 호스트에 설치된 `a` 의존성의 버전이 `1.x`에 해당하지 않는 `2.0.0`이기 때문이다.

## peerDependencies 정의 팁

dependencies와는 달리 peerDependencies를 정의할 때는 관대하게 정의해야한다. 특히 peerDependencies를 특정 패치 버전으로 특정하면 안된다.

```json
{
	"name": "example",
	"peerDependencies": {
		"lodash": "4.7.0"
	}
}
```

위와 같이 `example`의 peerDependencies를 `4.7.0` 버전의 lodash를 사용하는 경우 호스트의 lodash와 다른 플러그인에서 사용하는 lodash 버전을 올리거나 내릴 수 없이 `4.7.0`을 사용해야한다.

때문에 peerDependencies의 버전을 정의할 때 가장 좋은 방식은 [semver](https://semver.org/)를 따르는 것이다.

위 버전 정의 뿐만 아니라 프로젝트 전체에서 꼭 싱글턴으로 사용되는 패키지인 경우에만 peerDependencies로 정의하는 것을 추천한다. `lodash`의 경우는 여러 프로젝트에서 다양한 버전을 사용하고 있기 때문에 의존성 관리가 쉽지 않다. 다만, `react`나 `nextjs`는 한 프로젝트에서 꼭 하나만 필요한, 즉, 싱글턴으로 사용되는 패키지이기 때문에 이 경우는 peerDependencies로 정의해도 좋다.

## 참고

[package.json에 쌓여있는 개발 부채](https://yceffort.kr/2021/10/debt-of-package-json#2-peerdependencies-%EB%8F%84-%EC%9E%90%EC%84%B8%ED%9E%88-%ED%99%95%EC%9D%B8%ED%95%B4%EB%B3%B4%EC%9E%90)

[Peer Dependencies는 왜 쓸까?](https://bohyeon-n.github.io/deploy/etc/peerdependencies.html)

[FEconf 2022 - 100+ 페이지 모노레포 우아하게 운영하기](https://www.youtube.com/watch?v=ajtpcFkXqqg&t=16795s)