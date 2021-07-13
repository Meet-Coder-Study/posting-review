# HTTP Keep-Alive

### 1. Keep-Alive 사용이유

일반적인 웹 환경에서는 TCP 프로토콜 기반으로 HTTP 요청과 응답이 이루어진다. TCP에서는 신뢰성 있는 데이터 통신을 위해 접속 가능한 상태를 만들기 위한 3핸드 쉐이크 과정과 안전하게 접속종료를 위한 4핸드 쉐이크 과정을 거치게 된다.
```bash
  TCP 커넥션 오픈 ---->  HTTP 요청 ----> HTTP 응답 ----> TCP 커넥션 해제
  (3 핸드쉐이크)                                    (4핸드 쉐이크)
```
핸드쉐이크를 통한 안정적이고 신뢰성 있는 데이터 통신이 TCP의 장점이지만, 요청 수가 많을 경우 요청 수에 따라 커넥션이 생성되기 때문에 CPU 사용률 증가와 매 요청마다 이루어지는 핸드쉐이크 과정으로 인해 네트워크 속도가 느려지고, 커넥션 해제 과정 중 TIME_WAIT 소켓 문제 가능성이 조금 더 높은 빈도로 발생할 수 있는 단점이 있다.

위와 같은 문제점을 보완하기 위하여 여러 요청에 대해 단일 커넥션을 유지(재사용)하기 위한 기술인 Keep-alive 혹은 Persistent Connection 기술이 나오게 되었다.
```bash
  커넥션 유지
                         +---------------------------+
                         |                           |                                         
                         v                       +------+
  TCP 커넥션 오픈 ---->  HTTP 요청 ----> HTTP 응답 -- | wait |  --> TCP 커넥션 해제
  (3handshake)                                   +------+      (4handshake)
                                                 (timeout)
```          

(정확히는 HTTP 1.0에서부터는 Keep-Alive라 지칭하고 HTTP 1.1에서부터는 Persistent Connection이라고 지칭한다)

### 2. HTTP 1.1의 지속커넥션

HTTP 1.0에서는 Keep-alive을 통한 커넥션 유지가 표준화되지 않는 기술이었다. 클라이언트와 서버 모두 Connection 헤더에 keep-alive를
넣어야 커넥션이 유지되었다.

```bash
Connection: keep-alive
``` 
하지만, 설계에 문제가 있어 잘 동작하지 않는 문제가 있었다고 한다.(일명 멍청한 프록시 문제가 발생했다고 함) 

HTTP 1.1에서부터는 위의 문제를 개선하고 표준화된 기술로 되어 default로 지속 커넥션(keep-alive)가 활성화 되어있다. 클라이언트와 서버 모두 HTTP 1.1을 구현하고 있다면 지속커넥션을 사용할 수 있다. 
   
2.1) keep-alive 옵션
- `max` : 한 커넥션에서 최대 요청 수   
- `timeout` : 유휴상태에서의 keep-alive 유지시간(초 단위)

2.2) 제한과 규칙 
 - 커넥션 해제시 응답 헤더에 `Connection: close`로 응답된다. 
 - 정확한 Content-length값 혹은 청크 인코딩(chunked transfer encoding)으로 처리

### 3. 이점 및 단점

 3.1) 이점
- 커넥션 수가 적기 때문에 CPU와 메모리 사용량이 낮다.
- 네트워크의 혼잡도가 더 낮아지게 된다. 
- 후속 요청의 네트워크 지연감소(no handshaking)
- 커넥션 해제 중 TIME_WAIT 문제 빈도수 감소 

 3.2) 단점 
- 커넥션을 유지하기 때문에 사용되지 않더라도 유휴 상태에서 리소스를 계속 점유(적절한 timeout 설정이 필요)



### 4. 간단한 테스트
개념으로만 살펴보기에는 뭔가 아쉬워서 부족하지만 간단한 테스트를 진행하였다. nginx 웹서버에서 keep-alive를 활성화, 비활성화하여 개념과 
비슷하게 동작하는지 간단하게 살펴보자.
  
nginx에서 요청시 커넥션이 유지되는지 확인하기 위해서는 우선 로그 설정이 필요하다. nginx가 설치된 폴더 내부에 nginx.conf파일에서 
로그를 수정한다. 

```bash
http {
    include       mime.types;
    default_type  application/octet-stream;
     
    #로그 포맷 수정 혹은 추가   
    log_format connection '$remote_addr - $remote_user [$time_local]  $status '
                          '"$connection $connection_requests"';
    #로그 저장 위치 
    access_log /opt/homebrew/var/log/nginx/connection.log  connection;
}
#...생략
```

 $conntcion을 추가하면 커넥션의 시리얼 넘버를 확인할 수 있어 동일한 커넥션을 사용하는지 알아볼 수 있다. $connection_requests는 해당 커넥션에서 이루어진 요청수를 의미한다.  
 localhost:8080으로 여러 횟수 접속하면 위에 access_log를 설정한 `/opt/homebrew/var/log/nginx/connection.log`에서 
 커넥션 시리얼 넘버가 유지되지는 확인이 가능하다.

 nginx에서는 keep-alive의 커넥션을 유지할 수 있는 최대요청수인 `max`값은 default로 1000으로 잡혀있다. 테스트를 위해 5로 수정하고 테스트해보자 


 ```bash
127.0.0.1 - - [13/Jul/2021:22:05:33 +0900]  304 "22 1"
127.0.0.1 - - [13/Jul/2021:22:05:35 +0900]  304 "22 2"
127.0.0.1 - - [13/Jul/2021:22:05:36 +0900]  304 "22 3"
127.0.0.1 - - [13/Jul/2021:22:05:37 +0900]  304 "22 4"
127.0.0.1 - - [13/Jul/2021:22:05:37 +0900]  304 "22 5"
 ```  
시리얼넘버 22번 커넥션이 총 5번 요청을 처리한 로그이다.



[ 참고 ]  

 - [https://www.youtube.com/watch?v=MBgEhSUOlXo&t=47s](https://www.youtube.com/watch?v=MBgEhSUOlXo&t=47s)

[https://blog.insightdatascience.com/learning-about-the-http-connection-keep-alive-header-7ebe0efa209d](https://blog.insightdatascience.com/learning-about-the-http-connection-keep-alive-header-7ebe0efa209d)



-https://datatracker.ietf.org/doc/html/rfc2616#page-44

https://evan-moon.github.io/2019/11/17/tcp-handshake/


- [위키피디아](https://en.wikipedia.org/wiki/HTTP_persistent_connection#HTTP_1.0)
- [Jmeter사용법 참고 유투브](https://www.youtube.com/watch?v=1AyxqIePusA&t=321s)
- [Nginx 공식문서](http://nginx.org/en/docs/)
http://tlog.tammolo.com/blog/4-cf6edc94-2ac1-4b59-b7bd-99b5fbb00287/
- [https://www.geeksforgeeks.org/http-non-persistent-persistent-connection/](https://www.geeksforgeeks.org/http-non-persistent-persistent-connection)
[https://whatisthenext.tistory.com/123](https://whatisthenext.tistory.com/123)
- https://feel5ny.github.io/2019/09/04/HTTP_004_02/