# RESTful API 6가지 제약 조건

## REST이란?

- Representational State Transfer의 약자로 로이필딩에 의해 만들어졌습니다.
- 웹 서버에서에서 사용하는 것으로 애플리케이션 사이의 결합도를 낮춰 설계하는 아키텍쳐 스타일입니다.
- 즉, 결합도를 낮춰 서버 / 클라이언트가 별도로 구축되고 결헙할 수 있게 하는 것이다.
- 이러한 결합도를 낮추기 위해 6가지의 제약 조건을 가지고 있으며 제약 조건을 잘 지켜야 RESTful하다고 할 수 있습니다.

## RESTful API 제약조건

### Client-Server

- 이 조건의 기본 원칙은 관심사의 명확한 분리입니다.
- 사용자들에게 제공하는 Interface인 User Interface와 데이터 스토리지(ex. DB), 알고리즘 등 서버 내부의 작업을 분리함으로써 User Interface는 여러 플랫폼에서의 이식성을 향상 시킬 수 있으며 서버는 그 구성요소를 단순화하여 확장성을 단순화 할 수 있습니다.
- 이 조건을 따르게 되면 클라이언트와 서버는 서로 의존하지 않고 서로 진화 할 수 있는데, 클라이언트는 서버의 URI만 알고 있으면 되기 때문입니다.

### Stateless

- 무상태성
- 서버에서 클라이언트의 상태 정보를 저장하지 않고 들어오는 요청에 대해서만 처리하여 구현을 단순화 하는 것이다.
- 이러다 보니 클라이언트의 모든 요청은 서보가 요청을 알아듣는데 필요한 모든 정보를 담고 있어여 합니다.
- 세션 상태도 클라이언트 쪽에 보관되어 클라이언트 요청 시 세션을 같이 보내 서버와 같이 데이터베이스와 같은  서비스로 전송되어 일정 기간동안 지속 상태를 유지하여 인증하는데 사용하게 된다.

### Cacheable

- 캐시 가능
- 즉 요청에 대한 응답 내의 데이터에 해당 요청은 캐시가 가능한지 불가능 한지 명세를 해줘야 합니다.
- 캐시 사용이 가능하면 클라이언트는 응답 데이터를 재사용 할 수 있어야 합니다.
- `cache-control` 헤더를 통해 캐시 여부를 명시해줘야 합니다.
- Last-Modified, E-Tag를 이용하여 캐시 구현이 가능합니다.

### Uniform Interface

- URI로 지정된 리소스에 균일하고 통일된 인터페이스를 제공해야 한다.
- 아키텍처를 단순하게 분리하여 독립적으로 만들 수 있다는 장점이 있다.
- Resource Identification in Reqeust
    - 요청의 자원식별이라는 의미로 요청 부분에서 개별 자원에 대한 식별을 할 수 있어야 하며 예를 들면 URI가 있다.
    - http://localhost:8080/resource/1
    - 서버는 데이터베이스의 내부 자료를 직접 전송하는 대신, DB의 레코드를 HTML, XML, JSON 등 형태로 전송한다.
- Manipulation of Resources Through Representations
    - 메시지를 통한 자원을 조작한다는 의미로 클라이언트의 요청에 어떤 자원에 대한 적절한 표현과 작업을 수행하기 위한 메타데이터를 충분히 갖추고 있다면 이 것은 서버 상에서 해당 자원을 변경, 삭제할 수 있는 충분한 정보를 가지고 있다는 의미이다.
    - 예를들면 Content-Type: Application/JSON 같은 경우가 된다.
- Self-Descriptive Message
    - 자기 서술적 메시지라는 의미로 각 메시지는 자신을 어떻게 처리해야 하는지 충분한 정보를 포햄해야 한다는 의미입니다.
    - 예를 들어 `GET / HTTP/1.1` 이러한 요청을 보낸다고 했을 때 목적지가 빠져 있기 때문에 이 조건을 충족시키지 못했다.
    - 아래와 같이 나오는 것이 조건을 충족시킨 것이다.

    ```
    GET / HTTP1.1
    Host: localhost:8080
    ```

    - 응답도 똑같다. 아래와 같이 JSON으로 반환했다고 보자.

    ```
    HTTP/1.1 200 OK
    { name: rutgo }
    ```

    - 어떤 데이터 형식인지 알수가 없다. 따라서 아래와 같이 응답을 해줘야 한다.

    ```
    HTTP/1.1 200 OK
    Conent-Type: application/json

    { name: rutgo }
    ```

- Hypermedia As The Engine Of Application State(HATEOAS)
    - 애플리케이션 상태에 대한 엔진으로서의 하이퍼미디어
    - 즉, 단순히 결과 데이터만이 아닌 결롼 리소스 정보를 포함해야 한다는 의미 입니다.

### Layered System

- 서버는 중개 서버(게이트웨어), 프록시)나 로드 밸런싱, 공유 캐시 등의 기능을 사용하여 확장성 있는 시스템을 구성할 수 있다.

### Code-On-Demand

- 클라이언트는 서버에서 자바 애플릿, 자바스크립트 실행 코드를 전송받아 기능을 일시적으로 확장할 수 있다.
- 이 제약 조건은 선택 가능합니다.

## 참고자료

[[REST API] REST API에 관하여_6가지 제약조건](https://sabarada.tistory.com/26)

[REST 제대로 알고 프로젝트에 적용하기](https://daimhada.tistory.com/141)

[REST(REpresentational State Transfer)](https://velog.io/@codemcd/RESTREpresentational-State-Transfer-hgk2muj4l2)
