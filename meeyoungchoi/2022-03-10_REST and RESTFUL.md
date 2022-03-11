# Rest AND Restful

## Rest

- HTTP 프로토콜로 데이터를 전달하는 아키텍처
- 플랫폼에 제약 없이 데이터를 주고 받을 수 있도록 설계된 Server-Client 아키텍쳐
- 각 플랫폼에 맞게 서버를 일일이 만드는 것이 굉장히 비효율 적이다
- HTTP 메서드를 사용하여 어떤 플랫폼을 사용하든지 클라이언트와 서버 간 동일하게 데이터를 주고 받을 수 있는 아키텍처를 만들었다
- 순수하게 데이터만 전송하겠다

## Rest 구성 요소

### Rest API 구성 요소

- 자원(RESOURCE) - URI
    - 리소스가 URI를 통해 식별되어야 한다
- 행위(Verb) - HTTP 메서드
- 표현(Representations)
    - 표현을 활용하여 리소스 조작

## Restful

`Client - Server 구조`

- 클라이언트와 서버의 관심사가 명확히 분리되어 있어야 한다
- 서로간 의존성이 줄어든다
- 서버는 비즈니스 로직 처리에 집중하고 클라이언트는 인증 이나 세션 , 로그인 정보등을 관리하는데 집중한다

`Stateless (무상태성)`

- 서버가 클라이언트의 상태를 저장하지 않는다
- 서버는 들어오는 요청에 대해서만 처리한다
- 클라이언트가 요청을 할때 HTTP Request 헤더에 저장된 정보에 따라 처리한다

`자원 식별`

- REST API에서는 자원을 나타내기 위해 명사 사용

`HTTP 메서드를 통해 리소스 조작`

- GET/POST/PUT/PATCH/DELETE를 통하여 서버측에 데이터 전달
- 이러한 기준을 적용하여 API를 설계해야 한다

`Cacheable (캐시 기능)`

- HTTP 웹표준을 사용
- HTTP가 가진 캐싱 기능이 적용된다
- Last-Modified 태그나 E-Tag를 사용하여 캐싱 구현 가능
- 캐싱이 가능한 지에 대한 라벨링 필요
- cacheable한 경우 동일한 요청에 대해 응답 데이터를 재사용할 수 있다

`Self-descriptiveness (자체 표현 구조)`

- REST API 자체 표현구조를 가짐
- 데이터가 어떤 것을 의미하는가
- 데이터를 어떻게 조작할 수 있는지 와 같은 내용이 포함되어 있어야 한다
- 메시지만 보고 도 쉽게 이해 할 수 있음

`처리 결과를 HTTP 상태코드로 변환`

| 코드 | 상태 | 설명 |
| --- | --- | --- |
| 200 | OK | 요청이 정상적으로 처리됨 |
| 201 | Created | 요청이 정상적으로 처리되고, 신규 리소스가 작성됨 |
| 204 | No Content | 요청이 정상적으로 처리되었지만, 응답 헤더에 담아 반환해줄 정보는 없음 (HTTP Response Body가 존재하지 않는다 , 응답할 데이터가 없다) |
| 400 | Bad Request | 서버가 이해할 수 없는 무효한 요청임 |
| 401 | Unauthorized | 요청된 리소스는 인증이 필요함 |
| 403 | Forbidden | 요청된 리소스는 거부됨 |
| 404 | Not Found | 요청된 리소스는 서버에 존재하지 않음 |
| 500 | Internal Server Error | 서버에서 에러가 발생함 |

### REST API 중심 규칙

- URI는 자원을 표현해야 한다
- 행위에 대한 정보가 들어가면 안된다

```java
GET /members/delete/1   (x)
```

-올바른 표현방법
- 자원에 대한 행위는 HTTP Method (GET, POST, PUT, DELETE)로 표현

```java
DELETE /members/1   (o)
```

### HTTP 메서드 역할

`POST`

- 새로운 리소스 생성

`GET`

- 리소스 조회
- 객체에 대한 상세 정보를 가져옴

`PUT`

- 리소스 수정

`PATCH`

- 리소스의 일부분 수정

`DELETE`

- 리소스 삭제

### URI 설계 방법

- `/` 는 계층 관계를 나타낼때 필요

```java
http://restapi.example.com/houses/apartments
http://restapi.example.com/animals/mammals/whales
```

- URI의 마지막 문자로 `/` 가 포함되면 안된다

```java
http://restapi.example.com/houses/apartments/ (X)
http://restapi.example.com/houses/apartments  (0)
```

- 하이픈(-)은 URI 리소스의 단어를 여러단어로 표현하기 위해 사용한다
- 밑줄(_)은 URI에 사용하지 않는다
- URI 경로에는 소문자가 적합
- 파일 확장자는 URI에 포함시키지 않는다
- Content-Type 헤더에 미디어타입 정보를 명시해 줘야 한다

```java
http://restapi.example.com/members/soccer/345/photo.jpg (X)
```

- 리소스간 관계를 표현하는 방법 (연관관계)

```java
GET : /users/{userid}/devices (일반적으로 소유 ‘has’의 관계를 표현할 때)
```

```java
GET : /users/{userid}/likes/devices (관계명이 애매하거나 구체적 표현이 필요할 때)
```

- 자원을 표현하는 Collection과 Document
- `Collection` - 문서들의 집합
- `Document` - 문서
- 컬럭션은 복수로 사용 가능

```java
http:// restapi.example.com/sports/soccer/players/13
```

참고 - 

[https://meetup.toast.com/posts/92](https://meetup.toast.com/posts/92)

[https://engkimbs.tistory.com/855](https://engkimbs.tistory.com/855)

[https://repo.yona.io/doortts/blog/issue/12](https://repo.yona.io/doortts/blog/issue/12)

[https://jaeseongdev.github.io/development/2021/06/15/REST의-기본-원칙-6가지/](https://jaeseongdev.github.io/development/2021/06/15/REST%EC%9D%98-%EA%B8%B0%EB%B3%B8-%EC%9B%90%EC%B9%99-6%EA%B0%80%EC%A7%80/)

[https://thesoul214.github.io/server/2019/02/26/Restful-1.html](https://thesoul214.github.io/server/2019/02/26/Restful-1.html)

[https://gmlwjd9405.github.io/2018/09/21/rest-and-restful.html](https://gmlwjd9405.github.io/2018/09/21/rest-and-restful.html)

[https://www.whatap.io/ko/blog/40/](https://www.whatap.io/ko/blog/40/)

[https://sanghaklee.tistory.com/61](https://sanghaklee.tistory.com/61)

[https://pronist.dev/146](https://pronist.dev/146)

[https://beenii.tistory.com/134](https://beenii.tistory.com/134)
