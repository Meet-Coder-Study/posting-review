# CORS에 대해서 알아보자.

## CORS란?

- Cross-Origin Resource Sharing
- 교차 출처 자원 공유
- 여기서 자원, 공유에 대한 단어의 뜻은 잘 알고 있지만 교차 출처라는 단어가 어색하게 느껴질 수 있습니다.
- 지금부터 교차라는 단어보다는 다른이라는 단어로 변경해서 이야기를 해보도록 하겠습니다.
- 즉, 다른 출처 자원 공유라는 것입니다.
- 간단하게 이야기 하면 다른 출처에 대한 자원의 공유에 대해 어떻게 해야 하는지에 대해 나타내는 것이라는 것이라고 할 수 있습니다.

## 출처(Origin)란?

- 아래와 같은 URL이 있다고 해봅시다.

```
https://github.com/woowacourse/jwp-was/issues?q=럿고&sort=oldest#foo
```

- URL은 내부적으로 구성요소가 또 존재합니다.

![cors-1](https://github.com/ksy90101/TIL/blob/master/web/img/cors-1.png?raw=true)

- 이 중에 Protocol, Host, Port 이 세개를 가지고 출처라고 합니다.
- 저희는 쉽게 해당 출처를 알수가 있는데요.
- 개발자 도구를 이용해 Location의 객체에 origin을 출력해보면 됩니다.
- 즉, `console.log(location.origin);` 으로 출력하면 됩니다.

## SOP란?

- Same-Origin Policy
- 동일 출처 정책
- 다른 출처가 있다면 같은 출처도 있겠죠?
- 바로 SOP가 같은 출처에 대한 정책인데요.
- 2011년 RFC 6454에 처음 등장한 보안 정책으로 같은 출처에서만 리소스를 공유할 수 있다는 의미입니다.
- 현재 `cross-site HTTP`에는 모두 이 정책이 적용되어 있습니다.
- 그러나 웹에서 다른 출처의 리소스를 가져오는 것은 굉장히 흔한 일입니다. 그래서 몇가지 예외사항을 두기로 했습니다.

### 예외 사항

- CORS 정책을 지킨 요청
- 실행 가능한 스크립트
- 랜더될 이미지
- 스타일 시트

## 같은 출처 vs 다른 출처

![cors-2](https://github.com/ksy90101/TIL/blob/master/web/img/cors-2.png?raw=true)

- 사진과 같이 맨 위에 저런 URL이 있다고 해보겠습니다.
- 첫번째 URL은 프로토콜, 호스트, 포트 모두 같기 때문에 같은 출처라고 할 수 있습니다.
- 두번째 URL은 현재 프로토콜이 다르기 때문에 다른 출처라고 할 수 있습니다.
- 세번째 URL은 포트번호가 명시되어 있는데, RFC 표준 상 `http(80)`, `https(433)`은 생략이 가능합니다. 따라서 원래 URL에 포트번호가 붙어 있던거와 똑같기 때문에 같은 출처라고 할 수 있습니다.
- 네번째 URL은 호스트가 다르기 때문에 다른 출처입니다.
- 다섯번째 URL은 포트번호가 다릅니다. 제가 포트번호까지 출처라고 바라봐야 한다고 했지만, 애매한 부분이 있습니다. CORS는 브라우저의 구현 정책이기 때문에 브라우저마다 출처를 다르게 볼 수 있습니다.
- 그러나 다행이게도 현재 IE를 제외한 나머지는 포트번호까지 출처로 보고 있기 때문에 IE는 그만 보내줄때가 된거 같습니다.

![cors-3](https://github.com/ksy90101/TIL/blob/master/web/img/cors-3.png?raw=true)

## CORS와 SOP가 나오게 된 이유

- 사실 웹 환경은 굉장히 오픈되어 있습니다. 서로 가지고 있는 자원들을 공유하는 것이 웹 환경의 장점이라고 생각합니다. 그러나 좋은 리소스가 있을 만큼 나쁜 리소스들도 있기 때문에 웹은 그만큼 취약함이 존재합니다.
- 또한 웹은 개발자 도구를 이용해 DOM 구조, 어느 서버와 통신하는지 리소스의 출처가 어딘지 등 각종 정보를 아무런 제제없이 열람이 가능합니다.
- 그러기 때문에 서로 통신하는 것에 대해 아무런 제약이 없다면 `CSRF, XSS` 같은 정보 탈취에 대한 취약함이 존재하기 때문에 위와 같은 정책을 만들게 되었습니다.

## CORS 시나리오

- Orgin == Access-Contorl-Allow-Origin
- 요청의 Origin 헤더와 응답의 Access-Contorl-Allow-Origin이 같다면 CORS를 지켰다고 할수 있다는 걸 생각하고 각각의 시나리오를 알아보도록 하겠습니다.

### Preflight Request Flow

![cors-4](https://github.com/ksy90101/TIL/blob/master/web/img/cors-4.png?raw=true)

- 여기서 Preflight란 예비요청이라는 뜻으로 개발할 때 가장 많이 마주치는 시나리오입니다.
- 쉽게 생각하면 브라우저는 요청을 한번에 보내지 않고 예비 요청과 본 요청을 나누어 서버로 전송합니다.
- 실제 요청을 살펴보도록 하겠습니다.

![cors-5](https://github.com/ksy90101/TIL/blob/master/web/img/cors-5.png?raw=true)

- 예비 요청을 보면 `Origin`뿐만 아니라 `Access-Control-Request-Method`를 통해 이후 GET 메서드를 사용할 것과 `Access-Control-Request-Headers`를 통해 `Content-Type` 헤더를 사용할 것을 알려주고 있습니다.
- 이후 서버는 `Access-Control-Allow-Origin`을 통해 요청에 대한 허용 출처를 응답하게 되며 브라우저는 요청에 `Origin`과 `Access-Control-Allow-Origin`을 비교해 출처가 같으면 본 요청을 보내고 다르면 본 요청을 보내지 않고 위와 같은 에러를 발생시키게 됩니다.

### Preflight Request 특징

- OPTIONS 메서드로 예비요청을 보내고 본 요청을 보냅니다.
- `Origin` 에 대한 정보 뿐만 아니라 자신이 예비 요청 이후 보낼 본 요청에 대한 다른 정보들도 같이 포함되어 있습니다. (예를들어 Access-Control-Request-Headers, Access-Control-Request-Method 등)
- 요청에 Origin과 응답의 Access-Control-Allow-Origin 브라우저가 비교해 출처를 판단하여 다르면 에러를 발생시키고 접근할 수 있는 출처라면 본 요청을 보내 요청을 처리합니다.
- 서버 사이드 영역이 아닌 브라우저 영역이기 때문에 서버는 200대 성공코드를 반환합니다.

### Simple Request Flow

![cors-6](https://github.com/ksy90101/TIL/blob/master/web/img/cors-6.png?raw=true)

- Preflight와 다른 점은 예비요청이 없이 예비요청을 본 요청에서 같이 처리한다는 점입니다.
- 예비요청에서 검사하는 Origin == Access-Control-Allow-Origin을 본 요청에서 처리한다고 생각하면 됩니다.
- 간단 요청이라 불리우는 이것은 제약사항들이 있어서 잘 사용하지 않습니다.

![cors-7](https://github.com/ksy90101/TIL/blob/master/web/img/cors-7.png?raw=true)

### Simple Request 제약사항

- 요청의 메소드는 GET, HEAD, POST 중 하나여야 한다.
- Accept, Accept-Language, Content-Language, Content-Type, DPR, Downlink, Save-Data, Viewport-Width, Width를 제외한 헤더를 사용하면 안됩니다.
- 만약 Content-Type를 사용하는 경우 application/x-www-form-urlencoded, multipart/form-data, text/plain 만 허용합니다.

- 메서드는 3개만 사용할 수 있을수도 있습니다. 그러나 인증 헤더인 Authrization도 사용을 하지 못하고 Content-Type에서 application/json을 허용하지 않기 때문에 거의 볼수 없다고 생각하면 좋을거 같습니다.

### Credentialed Request Flow

![cors-8](https://github.com/ksy90101/TIL/blob/master/web/img/cors-8.png?raw=true)

- 일반적으로 API 요청 메서드는 Cookie의 정보를 넣지 않습니다. 그러나 credentials 옵션을 통해 요청 헤더에 Cookie를 넣을수 있습니다. 각각의 옵션에 대한 값은 아래와 같습니다.

![cors-9](https://github.com/ksy90101/TIL/blob/master/web/img/cors-9.png?raw=true)

- 이렇게 Cookie의 있는 값으로 보안을 강화하기 위해 인증을 확인하는 방법이라고 생각하면 좋겠습니다.

![cors-10](https://github.com/ksy90101/TIL/blob/master/web/img/cors-10.png?raw=true)

### Credentialed Request 특징

- Access-Control-Allow-Origin에는 *을 사용할 수 없고 명시적인 URL을 넣어줘야 합니다.
- 응답 헤더에는 반드시 Access-Control-Allow-Credentials: true가 있어야 합니다.

## 결론

### Server Side

- 프론트 엔드 개발자를 위해 응답 헤더에 올바른 Access-Control-Allow-Origin을 받을 수 있도록 세팅해줘야 합니다.

### Client Side

- Webpack Dev Server로 리버스 프록싱 하여 우회가 가능하지만 로컬 환경에서만 해결이 가능합니다.
- 가장 좋은 방법은 서버 개발자에게 도움을 요청하는 것 입니다.

## 참고자료

**[https://evan-moon.github.io/2020/05/21/about-cors/](https://evan-moon.github.io/2020/05/21/about-cors/)**

**[https://developer.mozilla.org/ko/docs/Web/HTTP/CORS](https://developer.mozilla.org/ko/docs/Web/HTTP/CORS)**

**[https://ko.javascript.info/fetch-crossorigin](https://ko.javascript.info/fetch-crossorigin)**
