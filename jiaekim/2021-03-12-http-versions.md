# HTTP 프로토콜 1.0 vs 1.1 vs 2.0

## 1. HTTP 1.0
- 브라우저 친화적인 프로토콜
- 요청 및 응답에 대한 메타 데이터를 포함하는 헤더 필드 제공(Status code, Content-Type 등)
- Response: Content-Type에 Http 파일 외에도 스크립트, 스타일 시트, 미디어 등을 전송 가능
- Method: GET, HEAD, POST
- Connection 특성: 응답 직후 종료

```
(Connection 1 Establishment - TCP Three-Way Handshake)
Connected to xxx.xxx.xxx.xxx

(Request)
GET /my-page.html HTTP/1.0 
User-Agent: NCSA_Mosaic/2.0 (Windows 3.1)

(Response)
HTTP/1.0 200 OK 
Content-Type: text/html 
Content-Length: 137582
Expires: Thu, 01 Dec 1997 16:00:00 GMT
Last-Modified: Wed, 1 May 1996 12:45:26 GMT
Server: Apache 0.84
<HTML> 
A page with an image
  <IMG SRC="/myimage.gif">
</HTML>

(Connection 1 Closed - TCP Teardown)
```
![HTTP 1.0](https://miro.medium.com/max/660/1*mxYdkCxS5MPFBDaHeFS8JQ.png)
- 단점: 각 모든 요청에 따라 새로운 연결을 열고, 응답이 전송된 후 즉시 닫기 때문에 새로운 연결이 설정 될 때마다 TCP 3-way Handshake가 발생함.

## 2. HTTP 1.1
#### 2.1 HTTP 1.1이란?
- 오늘날 가장 많이 사용되는 HTTP 버전
- 영구 및 파이프 라인 연결, 압축/압축 해제, 가상 호스팅, 캐시 등이 추가되어 응답속도가 빨라지고 대역폭이 절약되는 등 성능 최적화 및 기능 향상
- Upgrade로 WebSocket 전환 가능
- Method: GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS
- Connection 특성: long-lived
```
(Connection 1 Establishment - TCP Three-Way Handshake)
Connected to xxx.xxx.xxx.xxx

(Request 1)
GET /en-US/docs/Glossary/Simple_header HTTP/1.1
Host: developer.mozilla.org
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:50.0) Gecko/20100101 Firefox/50.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: https://developer.mozilla.org/en-US/docs/Glossary/Simple_header

(Response 1)
HTTP/1.1 200 OK
Connection: Keep-Alive
Content-Encoding: gzip
Content-Type: text/html; charset=utf-8
Date: Wed, 20 Jul 2016 10:55:30 GMT
Etag: "547fa7e369ef56031dd3bff2ace9fc0832eb251a"
Keep-Alive: timeout=5, max=1000
Last-Modified: Tue, 19 Jul 2016 00:59:33 GMT
Server: Apache
Transfer-Encoding: chunked
Vary: Cookie, Accept-Encoding
[content]

(Request 2)
GET /static/img/header-background.png HTTP/1.1
Host: developer.cdn.mozilla.net
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:50.0) Gecko/20100101 Firefox/50.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: https://developer.mozilla.org/en-US/docs/Glossary/Simple_header

(Response 2)
HTTP/1.1 200 OK
Age: 9578461
Cache-Control: public, max-age=315360000
Connection: keep-alive
Content-Length: 3077
Content-Type: image/png
Date: Thu, 31 Mar 2016 13:34:46 GMT
Last-Modified: Wed, 21 Oct 2015 18:27:50 GMT
Server: Apache
[image content of 3077 bytes]

(Connection 1 Closed - TCP Teardown)
```
- 연결을 설정하기 전에 TCP 3-way Handshake 발생. 마지막으로 모든 데이터를 Client로 보낸 후 Server는 더 이상 보낼 데이터가 없다는 메세지를 보내고, 그 이후 연결을 닫는다.
- 즉, HTTP1.1은 여러 Request-Response에 대해 동일한 연결을 재사용할 수 있다.
#### 2.2 HTTP 1.1 Keep Alive와 Pipeline
##### HTTP 1.0 "Closed" vs HTTP 1.1 "Keep-Alive"
![HTTP 1.1 Keep-Alive](https://miro.medium.com/max/550/1*hr47CCH4G0B6z24i0w-fsg.gif)
- `HTTP 1.0`: TCP Connection은 HTTP 요청마다 3-way Handshake와 TearDown을 반복한다.
- `HTTP 1.1`: 하나의 TCP Connection이 열려있으면 (Established 상태), 그 연결을 통해 여러 Request에 대한 Response를 받을 수 있다.
##### HTTP 1.1의 Connection "Keep Alive(Pipelining)" vs "Keep-Alive(Multiple)"
![HTTP 1.1 Pipelining](https://miro.medium.com/max/550/1*z9GvQFsjDhXpm-5MDM81mQ.gif)
- `HTTP 1.1 Keep-Alive Pipelining`: Pipelining을 사용할 때, client는 여러 request를 response의 응답을 기다리지 않고 보낼 수 있다.
- `HTTP 1.1 Keep-Alive Multiple Connections`: 클라이언트는 많은 양의 objects를 검색하는 성능을 높이기 위해 TCP 다중 연결을 할 수 있다.

#### 2.3 HOLB(Head Of Line Blocking) - 특정 응답 지연
- Http Pipelining으로 하나의 connection을 통해 다수개의 파일을 Request/Response 받을 수 있지만 첫 번째 Response가 지연되면, 다음 두, 세번째 Response는 첫번째 응답처리가 완료되기 전까지 대기하게 되기 때문에 Head Of Line Blocking(HOLB)가 발생한다.
![HOLB](https://user-images.githubusercontent.com/31475037/89241058-d77c9480-d638-11ea-9145-41cb238a4b9f.png)

## 3. HTTP 2.0
![Http2.0](https://media.vlpt.us/images/taesunny/post/eddc9c22-7d46-4899-877c-f8ce751609d5/image.png)
HTTP 2.0은 HTTP 1.1 프로토콜을 계승해 동일한 API면서 성능 향상에 초점을 맞췄다.
기존에 Plain Text(평문)을 사용하고 개행으로 구별되던 HTTP/1.x 프로토콜과 달리 2.0은 바이너리 포맷으로 인코딩된 Message, Frame으로 구성된다.
- Stream: 구성된 연결 내에서 전달되는 바이트의 양방향 흐름, 하나 이상의 메시지가 전달 가능하다.
- Message: 논리적 요청 또는 응답 메시지에 매핑되는 프레임의 전체 시퀀스이다.
- Frame: Http/2.0에서 통신의 최소 단위, 각 최소 단위에는 하나의 프라임 헤더가 포함된다. 이 프라임 헤더는 최소한으로 프레임이 속하는 스트림을 식별한다. Headers Type Frame, Data Type Frame이 존재한다.


#### Multiplexed Streams
- 한 Connection으로 동시에 여러 개 메시지를 주고 받을 수 있으며, Response는 순서에 상관없이 stream으로 주고받는다.
#### Stream Prioritization
- 리소스간 우선순위를 설정해 클라이언트가 먼저 필요한 리소스부터 보내준다.
#### Server Push
- 서버는 클라이언트의 요청에 대해 요청하지 않은 리소스를 마음대로 보내줄 수 있다.
- 즉, 클라이언트가 요청하기 전에 필요하다고 예상되는 리소스를 Server에서 먼저 요청한다. 
예) http만 요청했는데 http와 css, js, image를 함께 전송해주는 등
#### Header Compression
- Header table과 Huffman Encoding 기법(HPAC 압축방식)을 이용해 압축했다.
- 이전 Header의 내용과 중복되는 필드를 재전송하지 않아 데이터를 절약했다.
![Header Compression](https://media.vlpt.us/images/taesunny/post/7c860f2e-c1e9-4410-bc8e-fc8512ea84d2/image.png)
## HTTP 1.0 vs 1.1 vs 2.0
![HTTP versions](https://user-images.githubusercontent.com/31475037/89241056-d77c9480-d638-11ea-8ef4-7d9d475ac560.png)

## 참고자료
- [HTTP versions](https://medium.com/platform-engineer/evolution-of-http-69cfe6531ba0#:~:text=HTTP%20has%20four%20versions%20%E2%80%94%20HTTP,future%20will%20be%20HTTP%2F2.0.)
- [gRPC](https://chacha95.github.io/2020-06-15-gRPC1/)
- [HTTP 2.0](https://velog.io/@taesunny/HTTP2HTTP-2.0-%EC%A0%95%EB%A6%AC#:~:text=HTTP%2F2%EC%97%90%EC%84%9C%EB%8A%94%20%EC%97%AC%EB%9F%AC%20%ED%8C%8C%EC%9D%BC,%EC%9D%B4%EB%9F%AC%ED%95%9C%20%EB%AC%B8%EC%A0%9C%EB%A5%BC%20%ED%95%B4%EA%B2%B0%ED%95%98%EC%98%80%EB%8B%A4.&text=TCP%20%EC%97%B0%EA%B2%B0%20%ED%95%98%EB%82%98%EB%A1%9C%20%EC%97%AC%EB%9F%AC%20%EC%9A%94%EC%B2%AD,%EC%9D%B4%20%EC%A1%B4%EC%9E%AC%20%ED%95%A0%20%EC%88%98%20%EC%9E%88%EB%8B%A4.)