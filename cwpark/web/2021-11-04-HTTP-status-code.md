# HTTP 상태코드

## **HTTP 상태코드**

클라이언트가 보낸 요청의 처리 상태를 응답에서 알려주는 기능

- 1xx(Informational): 요청이 수신되어 처리 중
- 2xx(Successful): 요청 정상 처리 완료
- 3xx(Redirection): 요청을 완료하려면 추가 행동이 필요
- 4xx(Client Error): 클라이언트 오류, 잘못된 문법 등으로 서버가 요청을 수행할 수 없음
- 5xx(Server Error): 서버 오류, 서버가 정상 요청을 처리하지 못함

> Q) 만약 모르는 상태코드가 나타난다면?서버가 상태코드를 반환 했지만 클라이언트가 인식할 수 없다면?클라이언트는 상위 코드로 처리함ex ) 299??? -> 2xx(Successful), 정상적으로 처리된 것으로 인식ex ) 451??? -> 4xx(Client Error), 클라이언트의 요청 오류로 인식
> 

### **1xx(Informational)**

- 요청이 수신되어 처리 중이라는 것으로 알림
- 거의 사용되지 않음

### **2xx(Successful)**

- 클라이언트의 요청이 성공적으로 처리됨

200 OK

- 200 Status Code만 사용하는 경우가 많음

201 Created, 요청이 성공하여 새로운 리소스가 생성됨, POST로 정상적으로 등록됐을 경우 사용됨

```
// 요청
POST /members HTTP/1.1
Content-Type: application/json
{
  "username" : "young",
  "age": 20
}
```

```
// 응답
HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 34
Location: /members/100

{
  "username": "young",
  "age": 20
}
```

- 생성된 리소스는 응답의 Location 헤더 필드로 식별한다.

202 Accepted

- 요청은 접수되었으나 아직 처리가 완료되지 않음
- ex) 배치 처리

204 No Content

- 서버가 요청을 성공적으로 수행했지만, 응답 페이로드 본문에 보낼 데이터가 없음
- ex) 웹 문서 편집기에서 save 버튼과 같이 같은 화면을 유지해야하는 경우

### **3xx(Redirection)**

- 요청을 완료하기 위해 유저 에이전트의 추가 초지가 필요함을 알릴 때 사용되는 상태 코드
- 웹 브라우저는 3xx 응답 결과에 Location 헤더가 있으면, Location 위치로 자동으로 이동한다.

리다이렉션의 흐름을 설명하자면,

1. 요청이 전송됨

```
GET /event HTTP/1.1
Host: localhost:8080
```

1. 서버는 /new-event라는 위치로 이동함을 알리기 위해 Location 헤더에 /new-event 주소를 넣어 반환함

```
HTTP/1.1 301 Moved Permanently
Locaiton: /new-event
```

1. 웹 브라우저는 3xx 상태코드를 보고 Location 헤더의 키 값으로 다시 서버에 요청함

```
GET /new-event HTTP/1.1
Host: localhost:8080
```

1. 서버는 성공적으로 응답함

```
HTTP/1.1 200 OK
...
```

리다이렉션의 종류

- 영구 리다이렉션(Permanent)
    - 리소스의 URI가 영구적으로 이동함
    - 301 Moved Permanently
        - 리다이렉트시 요청 메서드가 GET으로 변하고, 본문이 제거될 수 있음
    - 308 Permanent Redirect
        - 301과 기능은 같지만, 리다이렉트 요청 메서드와 본문을 그대로 유지하여 다시 요청함
        - 308은 사실 잘 사용되지 않는다. 왜냐하면, 새로운 URI는 요청 본문이 같은 경우가 적기 때문임
- 일시 리다이렉션(Temporary)
    - 302 Found
        - 리다이렉션 요청 메서드가 GET으로 변하고 본문이 제거될 수 있음
        - 스펙이 모호한 이유는 하위호환성 때문임
        - 영구 리다이렉션과 기능이 같음
    - 307 Temporary Redirect
        - 302와 기능은 같음
        - 리다이렉션 요청 메서드와 본문을 유지하여 리다이렉션함
    - 303 See Other
        - 302와 다르게 반드시 메서드가 GET으로 변경됨
        - 리다이렉션시 요청메서드가 GET으로 변경
    - **일시 리다이렉션이 꼭 필요한 경우**
        - PRG: Post/Redirection/Get
        - 만약 POST로 상품 주문 후 웹 브라우저를 새로고침 한다면? 중복 주문이 들어갈 수 있는 문제가 발생
        - POST 요청 후 결과를 GET으로 리다이렉트함
        - 새로고침을 해도 GET으로 조회하게 됨
            1. 사용자가 주문을 하기 위해 브라우저는 POST로 요청함
            
            ```
            // Request
            POST /order HTTP/1.1
            Host: localhost:8080
            
            itemId=mouse&count=1
            ```
            
            1. 주문 데이터를 DB에 반영한다.
            2. 302 리다이렉션으로 응답함
            
            ```
            // Response
            HTTP/1.1 302 Found
            Location: /order-result/19
            ```
            
            1. 웹 브라우저는 리다이렉션을 하기 위해 다시 GET 요청
            
            ```
            GET /order-result/19 HTTP/1.1
            Host: localhost:8080
            ```
            
            1. 응답
            
            ```
            HTTP/1.1 OK
            
            <html>주문완료</html>
            ```
    
- 특수 리다이렉션
    - 304 Not Modified
        - 캐시를 위해 사용한다.
        - 클라이언트에게 리소스가 수정되지 않았음을 알려준다.
        - 클라이언트는 304를 응답코드로 받으면 로컬PC에 저장된 캐시를 사용한다.
        - 304 응답은 메시지 바디를 사용하면 안된다.

### **4xx(Client Error)**

- 오류의 원인이 클라이언트에 있을 때, 보내는 상태코드임
- 클라이언트가 잘못된 요청을 하므로, 재시도에 항상 실패함(5xx는 재시도에도 성공할 수 있음)
- 400 Bad Request
    - 요청 구문, 메시지 문법, API 스펙 오류 등
    - 클라이언트는 요청 내용을 검토하고 다시 올바르게 전송해야함
- 401 Unauthorized
    - 로그인이 되지 않았을 경우**(이름과 다르게 로그인이 되지 않은(Unauthenticatd) 에러임)**
    - 401 오류 발생시 WWW-Authenticate 헤더에 인증 방법을 설명해야함
      
        > ⚠️ 참고인증(Authentication): 본인이 누구인지 확인 (로그인)인가(Authorization): 권한과 관련된 확인 작업(Admin 처럼 특정 리소스에 접근가능한 권한 검사)
        > 
- 403 Forbidden
    - 서버가 요청을 이해했지만, 승인을 거부함
    - 예를 들어, Admin 등급이 아닌 사용자가 로그인을 성공 했지만, Admin 등급의 접근 권한이 없을 경우
- 404 Not Found
    - 요청 리소스를 찾을 수 없음
    - 또는, 클라이언트가 권한이 없는 리소스에 접근할 때 해당 리소스를 숨기고 싶을 때 사용함

### **5xx(Server Error)**

- 500 Internal Server Error
    - 서버 내부에 오류 발생
    - 애매한 서버 오류는 모두 500으로 처리함
- 503 Service Unavailablㄷ
    - 서버의 과부하로 인해 처리를 요청할 수 없거나 예정된 작업으로 인해 잠시 요청을 처리할 수 없을 때 사용
    - Retry-After 헤더 필드로 얼마 뒤에 복구가능한지 알려줘야 함
