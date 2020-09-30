# HTTP Cookie 헤더 살펴보기



인터넷 상에서 클라이언트와 서버가 서로 응답과 요청을 한다. 이 때, 중심 정보 이외에도 부가 정보 혹은 서로에게 지시할 정보를 같이 전송하기 위해 HTTP 헤더가 필요하다. 그중 헤더에서 클라이언트와 서버가 주고받는 쿠키는 브라우저에 정보를 저장하기 위해서라고 흔히 알고 있다. 브라우저에 정보를 저장하긴 하지만, 주된 스토리지 역할은 하지 않는다. 웹브라우저의 Web Storage API, IndexedDB가 추가되면서 쿠키의 클라이언트 사이드 데이터 저장 기능이 주요 기능에서 사라졌다. 굳이 쓰려고 한다면 문제는 없지만, MDN에서는 아래와 같이 설명한다.

> Cookies were once used for general client-side storage. While this was legitimate when they were the only way to store data on the client, it is now recommended to use modern storage APIs.

기술이 발전하면서 그 의미가 바뀐 예라고 할 수 있다. 스토리지 API와 크게 다른점은 서버와 클라이언트가 매 요청마다 주고 받는다는 점이다. 

 쿠키는 다음 세 가지 목적을 위해 사용된다.

- 세션 관리 : 로그인(jsessionid가 그 예다), 쇼핑 장바구니 등 서버가 기억해야할 정보
- 개인화 : 사이트의 테마 등, 유저가 선호하는 설정
- 트래킹 : 유저의 행동을 기록하고 분석

쿠키는 서버가 먼저 요청한다. **Set-Cookie** 헤더를 통해 어떠한 값을 저장하라고 클라이언트(브라우저)에게 지시한다. 예를 들어, `Set-Cookie: UserID=JohnDoe; Max-Age=3600; Version=1` 을 보내고 나면, 클라이언트는 브라우저에 이 값을 저장해두다가 다음 번 요청시 Cookie에 해당 값들을 보낸다. `Cookie: UserID=JohnDoe; Max-Age=3600; Version=1`

이외에도 쿠키를 설명하는 제어 옵션들이 존재한다. **Secure** 는 서버가 HTTPS 프로토콜 위에 암호화된 요청임을 클라이언트에게 알린다. http를 사용한다고 해서 반드시 요청이 불가능한 것은 아니지만, 이 경우 쿠키 설정을 할 수 없다. 

**HttpOnly**는 JavaScript의 Document.cookie API의 접근을 막기 위해서 존재한다. 왜냐하면 JavaScript를 non-HTTP로 취급하기 때문이다. 브라우저의 보안이 강화되면서 스크립트를 이용한 쿠키 조작이 불가능하도록 추가된 사항이다.

**SameSite** 특성은 서버가 요청하는 값인데, 쿠키를 cross-origin 으로 보내지 말아달라고 클라이언트에게 말하는 것이다. 여기서 Site라는 개념을 파악해야 한다. http://example.com과 http://example:com:8080은 같은 Site일까? 아니면,  http://example.com과 http://example:com/foo/bar 는 같은 Site일까? 둘 다 맞다. 하지만 https://developer.mozilla.org/en-US/docs/ 는 분명 https://example.com과 다르다. Site는 Scheme과 port에 상관 없다. 달라도 괜찮다는 의미다. (URL에 관한 자세한 사항은 https://en.wikipedia.org/wiki/Uniform_Resource_Identifier 참고).

SameSite 특성이 탄생하게 된 계기는 cross-site request forgery attacks(CSRF) 이라고 부르는 "사이트 요청 간 위조" 때문이다. cross-origin 이 허용된다면 공격자가 정상적인 사용자의 행동으로 위조한다. 자세한 사항은 https://developer.mozilla.org/en-US/docs/Glossary/CSRF를 참고하자.

SameSite의 값은 3가지가 있다. 서버는 클라이언트로부터 쿠키를 받을 때 같은 사이트로 부터 받을 수 있다. 이것을 `Strict`로 지정하면 된다. `Lax` 는 제한이 덜하다. 클라이언트가 외부 사이트로부터 이동할 때에 요청하게 되는 경우가 있다. link를 타고 갈 때가 그렇다. `None` 은 어떠한 cross-site 요청에 대한 제한이 없다는 의미다.

```
Set-Cookie: key=value; SameSite=Strict
```





---



https://developer.mozilla.org/ko/docs/Web/HTTP/Headers

https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies

