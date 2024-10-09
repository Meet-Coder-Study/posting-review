# HTTP 헤더를 활용해 캐시 데이터를 관리하는 일

## 공부하게 된 계기

스프링 클라우드가 4.0 버전 부터 응답 데이터를 캐싱하는 동작을 지원하고 있다.
`cache-control` 을 `no-cache` 로 설정 했을 때 `304 not-modified` 가 반환되는 모습을 봤고
응답 간에 헤더를 활용해 데이터의 라이프 사이클을 제어하는 모습이 신기했다.

그래서 `cache` 를 제어하기 위해 `header` 에 입력되는 값들을 확인해보기로 했다.

## 캐싱이란

캐시 목적은 처리율이 다른 시스템 사이의 병목 현상을 해결하기 위해서다.
운영체제에서는 CPU 읽기 속도와 디스크 읽기 속도 차이를 좁히기 위해 캐시 레이어인 메모리를 뒀다.

대부분 캐시 레이어는 빠른 영역보다는 크게 느린 영역보다는 적게 사용하고 있다.
그 이유는 가격이 비싸기 때문이다.
그럼 디스크 영역보다 적은 공간을 쓰는게 가능한 이유는 뭘까.
바로 캐시는 참조 지역성을 띄기 때문이다.

참조 지역성은 조회하려는 데이터와 관계된 데이터가 다음에 조회하는 경우가 높다.
다음에 조회될 가능성이 높은 데이터를 미리 읽어 두게 된다.

## 응답을 캐싱하는 일이란

그 빠르고 느린 관계는 HTTP 통신 과정에서도 나타난다.
HTML 코드와 달리 이미지나 JS 파일이 느리게 도착한다면 사용자는 느린 응답을 받게 된다.
이런 불편감을 줄이기 위해 캐시 레이어를 두고 있다.
HTTP 통신에서는 클라이언트에서 캐시 레이어를 두는 방법이 있고 서버에서 캐시 레이어를 두는 방법이 있다.

결국 두 개다 사용하는 경우가 많지만 분리해서 생각한다면 데이터의 라이프 사이클을 쉽게 파악해서 캐시로 인해 발생하는 문제를 해결 할 수 있어보인다.

### 서버에서 캐싱하는 입장

서버 사이드에서 캐시를 관리하는 일은 CDN 처럼 활용하기 위해서라고 생각하면 된다.
사용하는 이유는 동일한 컨텐츠를 여러 클라이언트에게 전달하기 위해 사용하는 방법이다.

서버 처리율을 줄여준다는 장점은 있지만 클라이언트와의 통신 시간이 존재해 클라이언트에 저장하는 것보다 느리다는 단점이 있다.

### 클라이언트에서 캐싱하는 입장

클라이언트에서 캐싱하는 방법은 사용자 컴퓨터 내부에 데이터를 저장해 재활용하는 방법이다.
만약 캐시가 없다면 서버에게 데이터를 요청하게 된다.

서버에서 캐싱하는 방법보다 빠르른 장점이 있지만 사용자에 의해 데이터 생명 주기가 관리되기 떄문에 동작을 쉽사리 예측 할 수 없다.
만약 스토리지를 사용하지 않는 사용자라면 서버에 많은 요청을 보내 느린 응답을 받을 수 없는 상황이 올 수 있다.

## 통신에서 캐싱을 활용하는 방법

통신에서 캐싱을 활용하는 방법은 `cache-control`을 사용하는 방법과 `etag` 를 활용하는 방법이 있다.
통신에서 캐싱을 활용하기 위해 헤더에 어떠한 값을 저장하는 모습을 확인하고 그에 따른 단점도 파악해보자.

### `cache-control`

헤더에 `cache-control`를 정하면 자신이 갖고 있는 리소스를 클라이언트에 저장한 후 데이터가 적절한지 확인하게 된다.
`cache-control`로 데이터를 제어하는 방법은 크게 두 가지로 나뉜다.

- no-cache : 캐시는 저장하지만 서버에 지속적으로 검증한다.
- no-store : 캐시에 절대 저장하지 않는다.

`cache-control`의 큰 단점은 리소스가 변경됐는지 여부를 파악하기 어렵다는 것이다.
요청으로 전달한 값으로 데이터가 변경됐는지 확인이 필요한데 힌트가 적을수록 변경됐는지 여부를 파악하기 어렵다.

### `if-none-match`

`cache-control` 외에도 `etag`를 활용해 데이터 생명 주기를 관리 할 수 있다.
`if-none-match`에 추가된 식별값으로 변경됐는지 확인하고 변경되지 않았으면 가지고 있던 리소스를 재활용한다.

`etag`의 큰 단점은 `etag` 상태도 관리 대상이라는 점이다.
여러 대의 서버를 활용해 제공한다면 `etag` 를 공유 할 수 있는 스토리지 공간이 필요하다.

### `if-modified-science`

`if-modified-science`는 언제 수정됐는지 여부로 데이터 생명 주기를 관리한다.
수정 날짜도 마찬가지로 공유할 수 있는 스토리지 공간이 필요하다.


## 스프링 게이트웨이에서

### cache-control

스프링 게이트웨이는 `cache-control` 를 활용해 캐시를 컨트롤 하고 있다.
`no-cache` 는 다음처럼 본문이 없는 데이터를 반환해 빠른 통신을 지향하고 있다.

```java
public class SetStatusCodeAfterCacheExchangeMutator implements AfterCacheExchangeMutator {
	@Override
	public void accept(ServerWebExchange exchange, CachedResponse cachedResponse) {
        //...

		if (!CollectionUtils.isEmpty(cachedResponse.body()) && isRequestNoCache(requestHeaders)) {
            // no-cache 인 경우 304 반환
			response.setStatusCode(HttpStatus.NOT_MODIFIED);
		}
	}

	private boolean isRequestNoCache(HttpHeaders requestHeaders) {
		return requestHeaders.getCacheControl() != null && requestHeaders.getCacheControl().contains("no-cache");
	}
}

public class ResponseCacheManager {
    //...

	Mono<Void> processFromCache(ServerWebExchange exchange, String metadataKey, CachedResponse cachedResponse) {
		//...
		if (HttpStatus.NOT_MODIFIED.equals(response.getStatusCode())) {
            // 상태 코드가 304인 경우 본문이 없는 응답을 반환한다.
			return response.writeWith(Mono.empty());
		}
        //...
	}
    // ...
}
```

아직 게이트웨이에는 `if-none-match`와 `if-modified-science`를 식별 할 수 있는 기능을 제공하고 있지 않는 듯 하다.

## 참고 자료

- 인프런 강의 : https://www.inflearn.com/course/http-%EC%9B%B9-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/dashboard
- 서버 & 클라이언트 사이드 캐시 : https://edgemesh.com/blog/difference-between-server-side-caching-and-client-side-caching-and-which-is-good-for-your-website
- 웹 캐시 똑똑하게 다루기 : https://toss.tech/article/smart-web-service-cache
