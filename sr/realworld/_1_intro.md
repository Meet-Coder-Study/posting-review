## Intro

그냥 저냥 살고 있는 개발자의 **RealWorld** 생존기

이번 블로그 포스팅에 대한 주제는 [realworld](https://github.com/gothinkster/realworld) 라는 github 레포지토리의 내용이다.

> **이건 왜 하려는 걸까?**

- `공부를 한다`고 노력은 했지만 정작 내 지식이 아닌 것 처럼 느껴졌다.
- 뭔가 만들어 보고 싶은데, 키워드만 알고 있지 구현하는 방법은 모른다. 그래서 개념적으로 공부하더라도 그 내용을 `구현하진 못한다.`
- 과연 `구현하지 못하는 개념`에 대해서 스스로 알고 있다고, 떠든다 한들 진짜 아는 걸까?

그래서 나는 장바구니에 `공부하기 위한 책`을 지웠다.

![장바구니 삭제](https://github.com/SeokRae/TIL/blob/master/realworld/images/delete_item.png)

---

## Realworld 생존 가이드

FrontEnd 와 BackEnd 개발자가 생존할 수 있도록 [Medium.com](http://Medium.com) 의 클론 사이트인 [Conduit](https://demo.realworld.io/#/) 라는
사이트를 만들 수 있는 API를 스펙을 제공한다.

> [**참고**](https://gothinkster.github.io/realworld/docs/intro)

새로운 RealWorld를 구현하기 위해 뛰어든 개발자들에게 [Starter Kit](https://github.com/gothinkster/realworld-starter-kit) 를 제공하고 있고,
먼저  `RealWorld`에 뛰어든 [선배 개발자들이 진행하고 있는 레포](https://codebase.show/projects/realworld) 또한 제공하고 있어서 충분한 가이드가 될 수 있다.

### 1. Realworld에 생존하기 위해 고려해야하는 조건들 살펴보기

자신만의 기술 스택 또는 구현 방식에 고려해야하는 몇 가지 조건이 있다. 이는 어떤 Realworld를 구현하더라도 지켜야 하는 부분이고, 더 큰 Realworld를 구현하는데 있어서 기초 체력이 되는 부분이 될
것이다.

- **Realworld의 코드는 `단순하게 작성`해야 한다.**
    - 프로젝트의 `단순함`은 다른 개발자들에게 아키텍처에 대한 분석 시간을 줄여줄 수 있다.
    - 단순하게 구현한 아키텍처는 초기 스타트업의 MVP(Minumum Viable Product)를 반영한다 라고 생각하면 좋다.
    - 기능적으로 `완전`하고 `안정적`이지만 불필요할 정도로 `오버 엔지니어링`이 되어서는 안된다.
- **테스트 코드 기반의 개발을 지향하지만 이는 필수가 아니다.**
    - 초기 스타트업의 MVP의 목표를 반영한다는 목표는 시장에 상품의 적합성을 찾는 것이 주된 목표이기 때문에 해당 조건이 충족되기 전까지는 TDD나 테스트를 적용하지 않는 것이 맞다고 판단한다.
    - 테스트 코드 없이 구현된 상품이 PMF(Product-market fit)를 찾을 가능성이 훨씬 높다.

```text
모든 경우에 `TDD 또는 테스트 코드 == over-engineering`가 통용되는 것은 아니다.
```

### 2. API 스펙을 통해 어떤 것을 구현해야 하는지 알아보기

realworld는 개발자가 맨땅에 헤딩까진 하지 않아도 되게끔 가이드를 제공하고 있다.

`백엔드 개발자`, `프론트 개발자`, `모바일 개발자` 모두에게 RealWorld에 뛰어들 수 있도록
필요한 [API Sepc](https://gothinkster.github.io/realworld/docs/specs/backend-specs/introduction/) 을 제공한다.

여기서는 백엔드 개발자에게 제공하는 부분에 대해서 정리해 보도록 한다.

- [EndPoints](https://gothinkster.github.io/realworld/docs/specs/backend-specs/endpoints)

  먼저 EndPoints는 인증이 `필요한 부분`과 `필요 없는 부분` 또는 `옵션`으로 구분할 수 있다.

  요청 헤더의 `Authentication` 값을 읽어 토큰 정보를 읽어올 수 있다.

    ```text
    Authentication: Token jwt.token.here
    ```

  EndPoint 정보를 통해 스프링의 경우 Controller의 RequestMapping 설정 정보를 설계 할 수 있다.

- [API Response Format](https://gothinkster.github.io/realworld/docs/specs/backend-specs/api-response-format)

    - 해당 프로젝트의 컨텐츠 유형은 `Content-Type: application/json; charset=utf-8` 로 규정되어 있다.

- [Error Handling](https://gothinkster.github.io/realworld/docs/specs/backend-specs/error-handling)

  해당 프로젝트는 오류 처리에 대한 메시지 포맷이 존재한다.

    - 승인되지 않은 요청의 경우 401
    - 금지된 요청의 경우 403
    - 찾을 수 없는 요청의 경우 404
    - 요청이 유효성 검사에 실패하는 경우 422

- [CORS](https://gothinkster.github.io/realworld/docs/specs/backend-specs/cors)

    - CORS를 설정하려는 경우 OPTIONS에도 처리해야 한다.
    - 올바른 `Access-Control-Allow-Origin`및 `Access-Control-Allow-Headers` 를 반환해야 한다.

- [Postman](https://gothinkster.github.io/realworld/docs/specs/backend-specs/postman)

    - Realword의 가이드를 제공할 때 API 엔드 포인트를 테스트하는데 사용할 수
      있는 [Postman 컬렉션](https://github.com/gothinkster/realworld/blob/main/api/Conduit.postman_collection.json) 을 제공하고 있다.
    - 해당 컬렉션을 테스트 해보기 위한 [가이드](https://github.com/gothinkster/realworld/tree/main/api) 또한 제공하고 있다.

- [Tests](https://gothinkster.github.io/realworld/docs/specs/backend-specs/tests)

    - 위에서 테스트 코드는 선택이라 이야기 했지만 하나 이상의 단위 테스트를 포함하여 프로젝트가 동작하는 방식을 보여줘야 한다.
    - 다만 **통합 테스트는 필요하지 않다.**

### 3. API 스펙에 대한 핵심 공통 기능 (최소)

어떤 Realworld에 뛰어들더라도 꼭 해야 하는 퀘스트가 존재한다.

- JWT를 통한 사용자 인증(로그인, 가입 페이지 + 설정 페이지의 로그아웃 버튼)
- 사용자(User)에 대한 CRU* (가입 및 설정 페이지, 삭제 기능 X)
- 글(Article)에 대한 CURD
- 글에 대한 댓글 CR*D 구현(수정 기능 X)
- 글에 대한 페이징
- 관심 글 기능
- 다른 사용자 팔로우

## Realworld에서 얻을 수 있는 내용과 짚고 넘어갈 내용들

- 깃 플로우
- 코드 커버리지를 통해 얻을 수 있는 것과 그를 돕는 도구들
- 인증 및 인가 프로세스
- 아키텍처

## 앞으로 작성할 내용들

1. RealWorld를 구현하는데 도움을 주는 도구들이 어떤식으로 도움이 되는가?
    1. Jacoco
    2. SonarQube
2. 아키텍처와 도메인 설계에 얼마나 주관을 갖고 있을까?
3. JWT 기반의 인증처리 구현하면서 느낀점
4. Service, Controller 레이어에 대한 테스트 코드를 작성하는 방법
5. 단위 테스트 vs 통합 테스트 & 인수테스트에 대한 개념 알고가기
6. RealWorld에서 나는 생존할 수 있을까?