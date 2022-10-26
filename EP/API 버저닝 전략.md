# Overview

소프트웨어 관리를 하다보면 ‘의존성 지옥’ 문제에 빠지게 된다. 의존성이 높은 시스템에서 명세를 엄격하게하면 모든 패키지의 버전을 업그레이드 해야 배포할 수 있는 경우가 생긴다. 반대로 느슨하게 관리를 하면 버전이 엉켜서 호환이 안맞는 경우가 생길 수있다.

이번 글에서는 크게 2가지의 의존성의 버저닝 전략에 대해 다룰 것이다. 흔히 우리가 라이브러리 의존성을 추가할 때 자주 접하는 API의 버저닝의 명세와 외부 웹 API를 호출할 때, 제공하는 엔드포인트의 버전별 호환성 전략에 대해서 알아본다.

- API 버저닝 전략 - 명세
- 웹 API 버저닝 전략 - 호환성

# 버전 관리의 명세 기준 SemVer

![image](https://user-images.githubusercontent.com/66561524/198076379-6ae23c5c-f0f2-4b71-a694-f8226704d201.png)

**Semantic Versioning Specification**

`x.y.z`의 체계를 따르는 버전 전략이다.

- MAJOR: 이전 버전과 호환되지 않는 API 변경
    - 주 버전으로 0으로 시작되면 개발 중임을 의미한다. 즉 불안정한(unstable) 버전이므로 사용 중간에 사용법이 지속적으로 바뀔 수 있다.
    - 1보다 클 경우 각 버전 내에서 API 명세가 많이 바뀌지 않으며 바뀌더라도 이전 버전에 대한 호환성이 보장될 것임을 예상할 수 있다.
- MINOR: 이전버전과 호환되면서 기능의 변경이나 추가된 경우
    - 직전 버전의 API 명세를 그대로 사용하더라도 z 버전의 업데이트보다는 큰 변경이 있을 때 올린다.
- PATCH: 버그 수정
    - MAJOR 혹은 MINOR 버전이 올라갈경우 0으로 초기화된다.

가령 회사에서 사용하는 Semver를 준수하는 외부 라이브러리가 2.7.3에서 2.7.4로 변경이 되었을 때, 버그를 수정했다고 볼 수 있고 2.8.0이면 기능의 변경, 3.0.0이면 호환이 안되는 새로운 버전의 개발이 되었다고 보면 된다. 

Patch 버전 뒤에는 하이픈(-)이나 마침표(.)로 식별자를 붙여 배포 전의 버전을 네이밍할 수 있다.

- `1.0.0-alpha`
- `1.0.0-alpha.1`

하지만 결국의 Semver의 버전업 기준은 주관적이다. 개발 조직에 따라 표준이 제각각인 것이다. 즉 실제 코딩에서의 변경에 대한 의미를 개발자가 주관적으로 판단하고 수동적으로 관리를 해야한다. 문서화나 버저닝 작업을 수행하는 소프트웨어 개발자는 이에 대한 인식이 중요하다.

## 라인의 HeadVer

[https://github.com/line/headver](https://github.com/line/headver)

![image](https://user-images.githubusercontent.com/66561524/198076420-ce7ab7da-38fe-4ab1-b9b8-676e38f163c1.png)

기존 Semver는 수동으로 버전을 관리하는 지점이 major, minor, patch 이렇게 3가지이다. 라인은 이 문제를 해결하기 위 headver 개념을 도입했다. header는 버전의 단계를 3가지로 가져가지만 아래와 같이 구분한다.

```java
{head} - manual. Zero-based number.
{yearweek} - automatic. 2-digit for year and 2-digit for week number.
{build} - automatic. Incremental number from a build server.
```

따라서 수동으로 개발자가 관리하는 포인트는 head만 사용하고 나머지는 자동화로 만들어 놓았다. headver의 뜻은 아래와 같다.

The name `HeadVer` stands for **"only head number is enough to maintain!"**
 because it only allows to set the first number manually, and rest numbers are automatic

# API 버전 관리 전략

---

이미 배포된 API를 변경하면 API 사용자는 예전 처럼 API를 사용할 수 있을까?

2013년 [Jacques Dubray는](https://web.archive.org/web/20180202134605/https://www.ebpml.org/blog2/index.php/2013/11/25/understanding-the-costs-of-versioning) 웹 API 버전 관리 전략을 세 가지 범주(Knot, Point-to-Point 및 Compatible)로 분류하고 각 범주에서 시간 경과에 따른 비용을 측정하는 방법에 대한 공식을 작성했다.

> API 변경시 API 사용자에게 추가로 소요되는 비용은 개발자에게는 크게 와닿지 않을 수도 있다. API 사용자에게 아무런 즉각적인 비즈니스 가치도 만들어주지 못하는 변경은 기존 API에 변경이 없을것이라고 예상한 API 사용자에게 단순히 비용이 아니라 프로젝트 계획 붕괴, 예산 초과등으로 이어질 수 있는 큰 위험이라는 점을 이해하는 것이 핵심이다. - 장자끄 뒤브레(Jacques Dubray), 버저닝 비용 이해(Inderstanding the Costs of Versioning)
> 

[The Costs of Versioning an API](https://www.infoq.com/news/2013/12/api-versioning/)

## 웹 API 변경 유형 3가지 by 뒤브레
![image](https://user-images.githubusercontent.com/66561524/198076499-ad3f1183-80e7-4993-8044-1f58348eb882.png)

- 매듭(knot) : 모든 API 사용자가 단 하나의 버전에 묶여 있다. API가 변경되면 모든 사용자도 함께 변경을 반영해야 하므로 여파를 몰고 온다.

`/api/example`

외부 API로 위의 엔드포인트에 의존을 하고 있을 때 해당 엔드포인트에서 제공하는 request/response 및 내부 로직을 변경하는 것이다. 의존하고 있는 모든 서비스가 영향을 받을 수 있다.

![image](https://user-images.githubusercontent.com/66561524/198076531-5d1f85c3-834e-40f5-9586-87b1b35b9e1e.png)

- 점대점(point-to-point) : 사용자마다 별도의 API 서버를 통해 API를 제공한다. 사용자별로 적절한 시점에 API를 변경할 수 있다.

`/api/v1/example`

`/api/v2/example`

`/api/v3/example`

사용자는 기존에 의존하던 엔드포인트를 변경하지 않아도 된다. 만일 사용자가 상위의 버전을 사용하고 싶으면 상위 API 명세에 맞춰 개발을 하고 엔드포인트를 변경하면 된다. 또한 새로운 사용자는 가장 최신 버전의 엔드포인트에 의존하면 된다. 대다수의 웹 API 개발자들이 이 방식을 선호한다.

![image](https://user-images.githubusercontent.com/66561524/198076567-10a1c09e-320e-4ce0-9ec5-0d5696695e1a.png)

- 호환성 버저닝(compatible versioning) : 모든 사용자가 호환 가능한 하나의  API 서비스 버전을 사용한다.

`/api/v1/example`

`/api/v2/example`

`/api/v3/example`

하위 호환성이 적용되어 있는 API이기 때문에 v1을 사용했던 사용자, v2를 사용했던 사용자도 추가 개발없이 v3을 사용할 수 있다. v3에서 추가된 기능도 같이 사용할 수 있다. 하지만 API 개발자는 하위호환성을 제공해야하기 때문에 초기 비용이 많이 발생한다.

## 성능 비교

![image](https://user-images.githubusercontent.com/66561524/198076609-91be733b-7edb-4eed-a679-8e64d826ec8c.png)

- x축은 진화하는 API의 버전을 나타낸다.
- Y축은 API 변경 대응 비용을 나타낸다.

매듭 방식의 비용은 급속도로 증가한다. 변경하는 양이 적더라도 영향은 엄청나다. API 사용자는 변경된 API에 포함된 기능을 사용하지 않아도 강제적으로 업그레이드를 해야한다.

점대점방식은 여전히 적지 않은 비용이 소요되고 증가속도가 가파르다. API 사용자에게 미치는 영향을 줄지만 개발팀은 그만큼 많은 API를 제공해야 한다.

호환성 방식은 가장 효율적으로 보인다. 동일한 API에 기존 사용자도 그대로 사용하고 추가된 기능도 사용할 수 있다. API 사용자는 자기 상황에 맞춰 적합할 때 업그레이드 하면 된다. 여러 버전을 관리할 필요가 없어 부담이 적다. 다만 초기 개발 비용이 많이들게 된다.

# Reference

---

[버저닝 전략 어떻게 할 것인가](https://jypthemiracle.medium.com/%EB%B2%84%EC%A0%80%EB%8B%9D-%EC%A0%84%EB%9E%B5-%EC%96%B4%EB%96%BB%EA%B2%8C-%ED%95%A0-%EA%B2%83%EC%9D%B8%EA%B0%80-63a93a9cb960)

[https://github.com/line/headver](https://github.com/line/headver)

[쳬계적인 버전관리, Semver - 지어소프트 개발 가이드](http://developer.gaeasoft.co.kr/development-guide/knowledge/management/systematic-versioning-with-semver/)

[Semantic Versioning 2.0.0](https://semver.org/)

[API Change Strategy | Nordic APIs |](https://nordicapis.com/api-change-strategy/)

[네이버쇼핑](https://search.shopping.naver.com/book/catalog/32491903647)
