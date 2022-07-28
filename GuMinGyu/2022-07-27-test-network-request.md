---
title: test network request
---

요즘 https://github.com/mswjs/msw 과 같은 api mocking 라이브러리들이 떠오르는 것 같다. 테스트를 하거나 개발을 하려고 했으나 backend api 배포가 되지않아 개발 병목이 걸린경우 많이 사용하는데 최근에 e2e 테스트의 모든 network request를 mocking하여 사용하는 곳을 본적이 있어 제 생각을 정리해보았습니다.

# e2e 테스트에서 api mocking 하는게 옳은가?

e2e 테스트를 하면 api 관련 작업에 꽤나 머리가 아플때가 많습니다.

## e2e 테스트에서 api 관련 문제들

1. api endpoint가 망분리되어 있다면 곤란하다. (github actions에서 돌릴 수 없다. - enterprise github가 아닌경우)
2. 여러 케이스들을 테스트하기 위해 db에 seed-data를 만들어줘야 한다.
3. ci 돌리는데 시간이 엄청 걸린다.
4. edge case 테스트가 힘들다. (2번과 유사한 문제)

그럼 어떻게 해결할 수 있을까?? 보통 api mocking으로 많이 해결한다.

cypress를 예로 들면

```js
// we set the response to be the activites.json fixture
cy.intercept('GET', '/activities/*', { fixture: 'activities.json' })
```

이렇게 하면 응답도 빠르고 edge 케이스들도 테스트하기 쉬워진다. 하지만 api request를 모두 mocking 해버리면 e2e(end to end)라고 부를 수 있을까?

api response를 mocking하여 테스트 할 때와 mocking하지 않을 때를 비교해보자.

## 실제 서버를 사용하여 테스트하는 경우

### 장점
- 테스트가 좀 더 신뢰가 간다.
  - 예전에 backend spec이 변경되었는데 공유를 받지 못하여 client 코드를 수정하지 못한 문제를 e2e 테스트로 발견한 경험이 있다.

### 단점
- seed data가 필요하다. (backend engineer가 db에 tc를 넣어줘야 한다.)
- 느리다 ㅠ
- 엣지 케이스를 테스트하기 어렵다.

## api response를 mocking하여 사용하는 경우

### 장점
- response body, header 모두 제어하여 테스트할 수 있다.
- 빠르다 (< 20ms)

### 단점
- mocking한 데이터가 실제 응답과 일치한다는 보장이 없다.


## 어떻때 api를 mocking하여 사용해야 하나?

실제 서버를 사용하여 테스트하는 경우 장점이 한개, 단점이 3개, api를 mocking한 경우 장점이 2개 단점이 1개이다. 이렇게만 보면 api를 mocking한게 좋아보이지만 우리는 테스트의 본질을 잊어서는 안된다.
테스트는 곧 코드에 대한 신뢰이다. 실제 서버를 사용하여 테스트하는게 테스트의 본질에 맞기에 실제 서버를 사용하는게 옳다.

하지만 단점도 무시할 수는 없기에, 중요한 유저 시나리오에는 실제 서버를 찔러 테스트를 하고, 그렇지 않는 경우에는(매우 특수한 edge case들) api mocking하는게 맞지 않을까 생각이 된다.

## reference
- https://docs.cypress.io/guides/guides/network-requests#Stub-Responses
