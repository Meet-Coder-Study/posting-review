# System Design - URL Shorter

## Intro

URL 단축은 긴 URL에 대해 더 짧은 Alias를 만드는 데 사용된다.

사용자가 URL Shorter 서비스를 통해 만들어진 짧은 링크를 클릭하면 원래 URL로 리다이렉션되어 사용자가 기대했던 서비스를 정상적으로 제공할 수 있게 된다.

짧은 링크는 많은 공간을 절약하는데 도움을 주고, 사용자가 URL을 잘못 입력할 가능성을 줄어들게 하여 다양한 부분에서 사용되고 있다.

기존
```http
https://www.educative.io/courses/grokking-the-system-design-interview/m2ygV4E81AR
```

TinyURL
```http
https://tinyurl.com/rxcsyr3r
```

짧아진 URL은 실제 URL의 3/1 길이로 줄어든다.

URL Shorter는 여러 장치에서 링크를 최적화하고, 개별 링크를 추적하여 잠재고객을 분석하고, 광고 캠페인의 실적을 측정한다거나, 연결된 원본 URL을 숨기는 용도로도 사용된다.

## 1. 시스템 요구 사항 및 목표

> 설계에 대한 내용을 다루기 위해서는 항상 요구사항을 명확하게 해야하고, 시스템의 정확한 범위를 찾기 위해 노력해야 한다.

URL Shorter 시스템은 일반적으로 아래와 같은 요구사항을 충족해야 한다.

### 기능 요구사항
1. URL이 주어지면 서비스에서 더 짧고 고유한 별칭을 생성해야 한다. 이것을 짧은 링크라고 한다. 이 링크는 응용 프로그램에 쉽게 복사하여 붙여넣을 수 있을 만큼 짧아야 한다.
2. 사용자가 짧은 링크에 액세스하면 당사 서비스는 사용자를 원래 링크로 리다이렉션해야 한다.
3. 사용자는 선택적으로 자신의 URL에 대한 사용자 정의 짧은 링크를 선택할 수 있어야 한다.
4. 링크는 표준 기본 시간이 지나면 만료된다. 사용자는 만료 시간을 지정할 수 있어야 한다.

### 비기능 요구사항
1. 시스템은 가용성이 높아야 한다. 이는 서비스가 다운되면 모든 URL 리다이렉션이 실패하기 때문이다.
2. URL 리다이렉션은 최소한의 대기 시간으로 실시간으로 발생해야 한다.
3. 짧은 링크는 추측할 수 없어야 한다.

### 확장된 요구사항
1. 분석, 예를 들어 리다이렉션이 몇 번이나 발생했는지?
2. 개발된 서비스는 다른 서비스에서도 REST API를 통해 액세스가 가능해야 한다.

## 2. 용량 추정 및 제약사항
URL Shorter 시스템은 읽기에 대한 요청이 많을 것이다. 새로운 URL Shorter에 비해 많은 리다이렉션 요청이 있을 것으로 예상된다.

읽기와 쓰기 비율이 100:1 이라고 가정할 때, 트래픽 추정치 100:1 읽기/쓰기 비율로 매월 5억 개의 새로운 짧은 링크가 발생한다고하면, 같은 기간동안 50B 리다이렉션을 기대할 수 있다.
```math
100 * 500M = 50B
```

시스템의 QPS(초당 쿼리 수)는
```math
5억 / (30일 * 24시간 * 3600초) = ~200 URL/s
```

100:1 읽기/쓰기 비율을 고려할 때 초당 URL 리다이렉션은 아래와 같다.
```math
100 * 200 URL/s = 20K/s
```

`저장 추정치`: 모든 URL 단축 요청을 5년 동안 저장한다고 가정할 떄, 매월 5억 개의 새 URL이 있을 것으로 예상하므로, 저장할 것으로 예상되는 총 개체 수는 300억개 이다.
```math
5억 * 5년 * 12개월 = 300억
```

저장된 각 객체가 약 500바이트라고 가정할 때, 총 15TB의 스토리지가 필요하다.
```math
300억 * 500바이트 = 15TB
```

`예상 대역폭`: 쓰기 요청의 경우 초당 200개의 새 URL이 예상되므로, 서비스에 대한 총 수신 데이터는 초당 100KB가 된다.
```math
200 * 500바이트 = 100KB/s
```

읽기 요청의 경우 초당 ~20K URL 리다이렉션이 예상되므로 서비스의 총 나가는 데이터는 초당 10MB가 된다.
```math
20K * 500바이트 = ~10MB/s
```

`메모리 추정치`: 자주 액세스되는 인기 있는 URL 중 일부를 캐시하게 되면 이를 저장하는데 얼마나 많은 메모리가 필요할까?
URL의 20%가 트래픽의 80%를 생성한다는 80-20 규칙을 따른다면, 20%의 URL을 캐싱한다고 가정한다.

초당 20,000개의 요청이 있으므로 하루 17억개의 요청을 받게 된다.
```math
20K * 3600초 * 24시간 = ~17억
```

이러한 요청의 20%를 캐시하기 위해서는 170GB의 메모리가 필요하다.
```math
0.2 * 17억 * 500바이트 = ~170GB
```

`대략적인 추정치`: 매월 5억개의 새 URL과 100:1 읽기:쓰기 비율을 가정할 때, 서비스에 대한 대략적인 추정치를 정리해본다.

| URL 유형   | 예상 시간   |
|----------|---------|
| 새 URL    | 200/초   |
| URL 리디렉션 | 20K/s   |
| 수신 데이터   | 100KB/초 |
| 발신 데이터   | 10MB/초  |
| 5년간 보관   | 15TB    |
| 캐시용 메모리  | 170GB   |

## 3. 시스템 API
> 요구 사항을 확정하고 나면 항상 시스템  API를 정의하는 것이 좋다.
> 이것은 시스템에서 기대되는 것을 명시적으로 명시해야 한다.

REST API를 사용하여 서비스 기능을 노출할 수 있다.

### 단축 URL 생성
```url
createURL(api_dev_key, original_url, custom_alias=none, user_name=none, expire_date=none)
```
| 타입     | 매개변수         | 설명                                                             |
|--------|--------------|----------------------------------------------------------------|
| String | api_dev_key  | 등록된 계정의 API 개발자 키입니다. <br/>이것은 무엇보다도 할당량에 따라 사용자를 제한하는 데 사용됩니다. |
| String | original_url | 축소할 원본 URL입니다.                                                 |
| String | custom_alias | URL에 대한 선택적 사용자 지정 키입니다.                                       |
| String | user_name    | 인코딩에 사용할 선택적 사용자 이름입니다.                                        |
| String | expire_date  | 단축 URL의 선택적 만료 날짜입니다.
|String|url|성공적인 삽입은 단축된 URL을 반환합니다. <br/>그렇지 않으면 오류 코드를 반환합니다.|

### 단축 URL 삭제
```url
deleteURL(api_dev_key, url_key)
```
여기서 url_key는 검색할 단축 url을 나타내는 문자열이다. 성공적인 삭제는 "URL removed"을 반환하는 것이다.

> 남용하는 것에 대한 대책

악의적인 사용자에 대해서 남용을 방지하기 위해서 api_dev_key를 통해 사용자를 제한할 수 있다. 각 api_dev_key는 일정 기간당 특정 수의 URL 생성 및 리다이렉션에 대해서 제한할 수 있다.

## 4. 데이터베이스 디자인
> 설계 초기 시 DB 스키마를 정의하면, 다양한 구성 요소 간의 데이터 흐름을 이해하는 데 도움이 되고, 나중에 데이터 분할에 대한 지침이 된다.

위의 케이스에서 정의한 내용에서 데이터의 특성을 추출
1. 수십억 개의 기록을 저장해야 한다.
2. 한 번에 저장하는 각 객체의 용량은 1K 미만의 데이터
3. 어떤 사용자가 URL을 생성했는 지 저장하는 것 외에는 레코드 간에 연관관계가 존재하지 않는다.
4. 서비스는 쓰기보다 읽기에 대한 요청이 많다.

### 데이터베이스 스키마
<mark style="background: #FFF3A3A6;">URL 매핑에 대한 정보를 저장하기 위한 테이블</mark> 과 <mark style="background: #FFF3A3A6;">짧은 링크를 생성한 사용자 데이터를 위한 테이블</mark> 이 필요하다.


두 가지 테이블이 필요하다고 할 때, 어떠한 데이터베이스를 사용해야 할 지 고민이 필요할 수 있다.
다만 위의 3번에 "...레코드 간에 연관관계가 존재하지 않는다."라는 힌트를 통해 DynamoDB, Cassandra, Riak와 같은 NoSQL 저장소를 선택할 수 있다.

> SQL과 NoSQL에 대한 비교를 참고

## 5. 기본 시스템 설계 및 알고리즘
> 현재 주어진 문제를 해결하기 위해 고민해야 할 것은 `URL에 대한 짧고 고유한 키 값을 어떻게 생성할 것인가?` 이다.

URL의 마지막 8자는 생성하려는 단축키를 구성한다.

### a. 인코딩된 실제 URL

주어진 URL의 고유한 해시를 계산 후, 나온 결과 값을 인코딩하여 표시할 수 있다. 인코딩은 base36([az, 0-9]), base62([AZ, az, 0-9]), base64('+', '/' 추가) 사용이 가능하다.

> 여기서 고민해야 할 내용은 단축키의 길이는 어느정도가 적당할 것인가 이다.

base64 인코딩을 사용하면 6자 길이의 키가 64^6 = ~687억개의 가능한 문자열이 된다.
base64 인코딩을 사용하면 8자 길이의 키가 64^8 = ~281조 개의 가능한 문자열이 된다.

> 용량이 68.7B인 고유 문자열을 사용하여 시스템에 6개의 문자 키가 충분하다고 가정을 해본다.

MD5 알고리즘을 해시 함수로 사용하면, 128비트 해시 값이 생성된다. base64 인코딩 후에는 21자 이상의 문자열을 얻게된다. (각 base64 문자는 해시 값의 6비트를 인코딩, 6 * 21 = 126)
단축키 6(또는 8)자를 위한 공간만 있다. 키를 어떻게 선택할까? 키는 처음 6자(또는 8자)를 사용할 수 있다.
이로 인해 키가 중복될 가능성이 있는데, 이를 해결하기 위해 인코딩 문자열에서 다른 문자를 선택하거나 일부 문자를 교환할 수 있다.

> 솔루션의 다른 문제는 무엇일까? 인코딩 체계에는 몇 가지 문제가 존재한다.

1. 여러 사용자가 동일한 URL을 입력하면 동일한 단축 URL을 얻을 수 있으므로 허용되지 않는다.
2. URL의 일부가 URL인코딩되는 경우

> 해결책
- 각 입력 URL에 증가하는 시퀀스 번호를 추가하여 고유하게 만든 다음 해당 해시를 생성할 수 있다.

하지만 이 시퀀스 번호를 데이터베이스에 저장할 필요는 없다. 이 접근 방식에서 발생할 수 있는 문제는 계속 증가하는 시퀀스 번호일 수 있다.

> 또 다른 문제점으로 계속 증가하는 번호가 overflow될 수 있을까?

증가하는 시퀀스 번호를 추가하면 서비스 성능에도 영향을 미치게 된다.

> 또 다른 해결책

- 사용자 ID를 입력 URL에 추가하는 것이다.

그러나 사용자가 로그인 하지 않은 경우 사용자에게 고유한 키를 선택하도록 요청해야 한다. 이후에도 충돌이 발생하면 고유한 키를 얻을 때까지 키를 계속 생성해야 한다.

#### URL Shorter Request Flow

1. Client는 Shorten URL을 서버에 요청
2. Encode URL을 인코딩
3. 인코딩된 URL을 DB에 저장
4. 중복 발생으로 인한 실패를 서버에서 체크
5. 시퀀스 추가 및 재 인코딩
6. 인코딩된 URL을 DB에 저장
7. 성공적으로 저장된 경우, 사용자에게 shortended URL을 반환

### b. 오프라인에서의 키 생성

임의의 6자리 문자열을 미리 생성하여 데이터베이스에 저장하는 독립 실행형 키 생성 서비스(KGS)를 가질 수 있다.
URL을 단축하고자 할 때마다 이미 생성된 키 중 하나를 가져와 사용한다. 이러한 접근 방식은 작업을 매우 간단하고 빠르게 만든다. URL을 인코딩 하지 않을 뿐 아니라 중복이나 충돌에 대해 걱정할 필요가 없다. KGS는 Key-DB에 삽입된 모든 키가 고유한지 확인한다.

> `동시성`에 대한 문제

키가 사용되는 즉시, 다시 사용되지 않도록 데이터베이스에 표시해야 한다. 여러 서버가 동시에 키를 읽는 경우 두 개 이상의 서버가 데이터베이스에 동일한 키를 읽으려고 하는 시나리오가 발생할 수 있다.

> `동시성`을 해결하는 방법

서버는 KGS를 사용하여 데이터베이스의 키를 읽거나 표시할 수 있다. KGS는 두 개의 테이블을 사용하여 키를 저장할 수 있다. 하나는 아직 사용되지 않은 키를 관리용이고, 다른 하나는 사용된 모든 키를 관리하는 용도이다. KGS가 서버 중 하나에 키를 제공하는 즉시 사용된 키 테이블로 이동할 수 있다. KGS는 서버가 필요할 때마다 신속하게 제공하기 위해 항상 일부 키를 메모리에 보관할 수 있다.

단순성을 위해 KGS는 메모리에 일부 키를 로드하는 즉시 사용된 키 테이블로 이동할 수 있다. 이렇게 하면 각 서버가 고유한 키를 갖게 된다. 로드된 모든 키를 일부 서버에 할당하기 전에 KGS가 죽으면 우리는 해당 키를 낭비하게 될 것이다.

KGS는 또한 여러 서버에 동일한 키를 제공하지 않도록 해야 한다. 이를 위해 키를 제거하고, 서버에 제공하기 전에 키를 보유하고 있는 데이터 구조를 동기화(또는 lock설정) 해야 한다.

> key-DB 크기?

base64 인코딩을 사용하면 68.7B 사이즈의 고유한 6자 키를 생성할 수 있다. 하나의 영문, 숫자를 저장하는데 1바이트가 필요한 경우 이 모든 키를 다음 위치에 저장할 수 있다.

```math
6(키당 문자 수) * 68.7B(고유키) = 412GB
```

> KGS는 단일 실패 지점(SOF)은 아닌지? -> YES

이런 문제를 해결하기 위해 KGS의 대기 복제본을 가질 수 있다. 기본 서버가 죽을 때마다 대기 서버가 인계받아 키를 생성하고 제공할 수 있다.

> 각 앱 서버가 key-DB에서 일부 키를 캐시할 수 있을까? -> YES

캐시를 통해 속도를 높이는 것이 가능하다. 하지만 이러한 경우 응용 프로그램 서버가 모든 키를 사용하기 전에  죽으면 결국 해당 키를 잃게 된다. 이것은 68B의 고유한 6자리 키가 있기 때문에 허용될 수 있다.

> 키를 조회하는 기능에 대한 수행

전체 URL을 얻기 위해 데이터베이스에서 키를 조회할 수 있다. DB에 있는 경우 HTTP 302 리다이렉션 상태를 브라우저에 다시 발행하여 요청의 "위치" 필드에 저장된 URL을 전달한다. 해당 키가 시스템에 없으면 "HTTP 404 Not Found" 상태를 발행하거나 사용자를 홈페이지로 다시 리다이렉션해야 한다.

> 사용자 지정 별칭에 크기 제한을 걸어야 할 지?

해당 서비스는 사용자 지정 alias를 지원한다. 사용자는 원하는 키를 선택할 수 있지만 사용자 지정 별칭을 제공해야 하는 것은 아니다. 그러나 일관된 URL 데이터베이스를 확보하기 위해 사용자 지정 별칭에 크기 제한을 적용하는 것이 합리적이며, 바람직하다. 사용자가 고객 키당 최대 16자를 지정할 수 있다고 가정한다.

## 6. 데이터 분할 및 복제
DB를 확장하려면 수십개억 개의 URL에 대한 정보를 저장할 수 있도록 분할해야 한다. 따라서 데이터를 서로 다른 DB 서버에 나누어 저장하는 분할 방식을 개발해야 한다.

### a. 범위 기반 파티셔닝

해시 키의 첫 글자를 기반으로 URL을 별도의 파티션에 저장할 수 있다. 따라서 문자 'A'로 시작하는 모든 URL 해시 키를 한 파티션에 저장하고, 문자 'B'로 시작하는 키를 다른 파티션에 저장하는 식이다. 이 접근 방식을 범위 기반 파티셔닝이라고 한다. 덜 자주 발생하는 특정 문자를 하나의 데이터베이스 파티션으로 결합할 수도 있다. 따라서 항상 예측 가능한 방식으로 URL을 저장/찾을 수 있는 정적 분할 방식을 개발해야 한다.

이 접근방식의 주요 문제점은 불균형한 DB 서버로 이어질 수 있다. 예를 들어 문자 'E'로 시작하는 모든 URL을 DB 파티션에 저장하기로 결정했지만 나중에 문자 'E'로 시작하는 URL이 너무 많다는 것을 늦게 알아차릴 수 있다.

### b. 해시 기반 파티셔닝
현재 체계에서는 저장하고 있는 객체의 해시를 만들고, 그 해시를 기반으로 사용할 파티션을 계산한다. '키'의 해시 또는 짧은 링크를 사용하여 데이터 개체를 저장할 파티션을 결정할 수 있다.

해싱 기능은 URL을 무작위로 다른 파티션에 배포한다. (해싱 기능은 항상 '키'를 [1..256] 범위의 숫자에 매핑할 수 있다.) 이 숫자는 객체를 저장하는 파티션을 나타낸다.

이 접근 방식은 여전히 오버로드된 파티션으로 이어질 수 있으며, 이는 Consistent Hashing을 사용하여 해결할 수 있다.

## 7. 캐시

자주 액세스 하는 URL의 경우 캐시 전략을 사용할 수 있다. 전체 URL을 해당 해시와 함께 저장할 수 있는 Memcached, Redis와 같은 솔루션을 사용할 수 있다. 따라서 어플리케이션 서버는 백엔드 스토리지에 도달하기 전에 캐시에 원하는 URL이 있는지 빠르게 확인이 가능하다.

> 캐시 메모리에 대한 고민

캐시 전략을 통한 서비스를 하려는 경우 캐시의 메모리 고민을 안할 수가 없다. 메모리의 크기는 일일 트래픽의 20%로 시작할 수 있으며 클라이언트의 사용 패턴에 따라 필요한 캐시 서버 수를 조정할 수도 있다. 위에서 예상한 일일트래픽의 20%를 캐시하려면 170GB의 메모리가 필요하다.

캐시를 사용하게 되면 캐시 제거 정책 또한 중요한데, 캐시가 가득차서 링크를 최신 URL로 교체하려는 경우 어떠한 기준으로 선택해야할까?
일반적으로 이를 위한 알고리즘인 LRU가 해당 시스템에 대한 합리적인 정책이 될 수 있다. LRU 알고리즘은 가장 최근에 사용된 URL을 먼저 삭제한다. LinkedHashMap 또는 이와 같이 유사한 데이터 구조를 사용하여 최근에 액세스한 URL을 추적하는 URL 및 해시를 저장하는 것이 가능하다.

효율성을 더욱 높이기 위해 캐싱 서버를 복제하여 서버 간에 부하를 분산시킬 수 있다.

> 각 캐시본을 어떻게 업데이트 할 수 있을까?

캐시 누락이 있을 떄 마다 서버는 백엔드 데이터베이스에 도달하게된다. 이런 일이 발생할 때마다 캐시를 업데이트하고 모든 캐시 복제본에 새 항목을 전달할 수 있다. 각 복제본은 새 항목을 추가하여 캐시를 업데이트 할 수 있다. 복제본은 이미 해당 항목이 있는 경우 무시하면 된다.

### Shorten URL에 대한 액세스 요청 흐름

1. 사용자는 서버에 단축 URL 요청
2. 서버는 캐시에서 먼저 Origin URL을 찾는다.
	1. Origin URL을 찾았다면
		1. 단축 URL의 expired date 또는 사용자의 permission을 확인
		2. 권한이 없거나 기간이 만료된 URL의 경우 401 에러를 반환
		3. 권한도 있고 기간이 만료되지 않은 경우 origin URL로 리다이렉트
	2. Origin URL을 찾지 못했다면
		1. DB에서 origin url을 찾는다.
		2. url을 찾지 못했다면 사용자에게 url을 찾을 수 없다는 오류 메시지를 반환
		3. url을 찾았다면, cache에 update
		4. url의 expired date를 확인 user permission을 확인 후 유효하면 origin url으로 리다이렉트
		5. url이 유요하지 않은 경우 401 오류 반환

## 8. 로드밸런서

시스템의 특정 구간에 로드 밸런서를 고려할 수 있다.
1. 클라이언트와 애플리케이션 서버 간
2. 애플리케이션 서버와 데이터베이스 서버 간
3. 애플리케이션 서버와 캐시 서버 간

처음 들어오는 요청을 백엔드 서버 간에 균등하게 분배하는 간단한 라운드 로빈 방식을 사용할 수 있다. 이러한 LB의 구현은 간단하고 오버헤드가 발생하지 않는다. 이 접근 방식의 또 다른 이점은 서버가 작동하지 않는 경우 LB가 해당 서버를 rotation에서 제외하여 해당 서버로의 트래픽 전송을 중지하는 것이다.

라운드 로빈의 분제점은 서버 부하를 고려하지 않아, 결과적으로 서버에 과부하가 걸리거나 느린 경우 LB는 해당 서버로의 새로운 요청 전송을 중단하지 않는다. 이를 처리하기 위해 백엔드 서버에 부하에 대해 주기적으로 쿼리하고, 이를 기반으로 트래픽을 조정하는 보다 지능적인 LB 솔루션을 배치할 수 있다.

## 9. 데이터 갱신 및 DB 정리

url은 영구적으로 남아있도록 관리 해야 할까? 아니면 제거해야 할까? 사용자가 지정한 만료 시간이 되면 링크는 어떻게 될까?

만료된 링크를 계속 검색하여 제거하기로 선택했다면 데이터베이스에 많은 부담이 가해질 것이다. 대신 만료된 링크를 천천히 제거하고 지연 정리를 수행할 수도 있다. 만료된 링크만 삭제되지만 일부 만료된 링크는 더 오래 지속될 수 있지만 사용자에게 반환되지는 않는다.

- 사용자가 만료된 링크에 액세스 하려고 할 때마다, 링크를 삭제하고, 사용자에게 오류를 반환하는 방식
- 별도의 정리 서비스를 주기적으로 실행하여 스토리지 및 캐시에서 만료된 링크를 제거하는 방식
  (이러한 서비스는 매우 가볍고 사용자 트래픽이 적을 것으로 예상되는 경우에만 실행)
- 각 링크에 대한 기본 만료 시간을 설정하는 방식
- 만료된 링크를 제거한 후 키를 다시 키 DB에 넣어서 재사용하는 방식

> 일정 기간 동안 방문하지 않은 링크는 제거해야할까?

## 10. 원격 측정
> 단축 URL이 사용된 횟수, 사용자의 요청 정보와 같은 통계는 어떻게 저장해야 할까?

- 추적할 가치가 있는 몇 가지 정보
	- 방문자의 국가
	- 액세스 날짜 및 시간
	- 클릭을 참조한 웹 페이지
	- 페이지에 액세스한 브라우저 또는 플랫폼

## 11. 보안 및 권한
> 사용자가 개인 URL을 만들거나 특정 사용자 집합이 URL에 액세스 하도록 허용하는 것에 대한 고민

데이터베이스의 각 URL과 함께 권한 수준을 저장할 수도 있다. 특정 URL을 볼 수 있는 권한이 있는 UserID를 저장하기 위해 별도의 테이블을 만들 수 있다. 사용자에게 권한이 없고, URL에 액세스하려고 하면 401 오류를 다시 보낼 수 있다.
Cassandra와 같은 NoSQL의 와이드 컬럼 데이터베이스에 데이터를 저장하고 있다는 점을 감안할 떄 테이블 저장 권한의 키는 해시가 될 것이다. 컬럼에는 URL을 볼 수 있는 권한이 있는 사용자의 userId가 저장될 것이다.


>참고 - https://www.educative.io/courses/grokking-the-system-design-interview