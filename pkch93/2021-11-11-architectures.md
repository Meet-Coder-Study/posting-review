# Layered Architecture와 Hexagonal Architecture

![get your hands dirty on clean architecture](https://user-images.githubusercontent.com/30178507/141300136-c4b2bf93-18e3-4670-920c-55716f85354a.png)

> 이 글은 `get Your Hands Dirty on Clean Architecture (Tom Hombergs 저)`의 1, 2장을 읽고 정리한 글입니다.

## Layered Architecture

전통적인 웹 애플리케이션의 Layered Architecture는 Web, Domain, Persistence 레이어로 구성되어있다. 이때 중요한 점은 레이어 간 의존 흐름이 단방향으로 이뤄져야한다는 점이다. 

![](https://learning.oreilly.com/api/v2/epubs/urn:orm:book:9781839211966/files/image/B15547_01_01.jpg)

즉, 요청을 받아 적절한 비즈니스 로직으로 라우팅하는 Web 레이어와 도메인 엔티티의 현재 상태를 수정, 조회하기 위한 Persistence 레이어에 상관없이 Domain 레이어에서 비즈니스 로직을 작성할 수 있다. Web과 Persistence 레이어는 Domain 레이어의 로직에는 영향을 미치지 않기 때문에 구현 기술을 자유롭게 바꿀 수 있다.

단, 잘못하면 레이어는 잘못된 습관이 스며들도록 만드는 다양한 측면들이 존재하며 시간이 지날수록 애플리케이션의 변화를 어렵게 만든다.

### Layered Architecture의 문제점

`get Your Hands Dirty on Clean Architecture (Tom Hombergs 저)` 책에서는 Layered Architecture의 문제점으로 `Database 기반의 설계`, `레이어의 경계를 무시할 수 있다.`, `테스트를 어렵게 만든다.`, `Use Case를 숨길 수 있다.`, `병렬로 작업하는 것을 어렵게 만든다.`를 제시한다.

- Database 기반의 설계

전통적인 Layered Architecture는 데이터베이스에 기초한다. 이는 몇몇 이유에서 문제가 있다.

먼저 비즈니스 로직을 작성하는데는 오로지 비즈니즈 로직의 요구사항을 이해하고 정확하게 구현하는 것에 초점을 맞춰야한다. 그래야 이를 바탕으로 Persistence와 Web 레이어를 구축할 수 있다.

이 과정에서 데이터베이스 중심적인 설계를 불러오는 요소는 ORM 프레임워크를 사용하는 것이다. ORM 프레임워크를 Layered Architecture에 함께 사용하는 것은 Persistence 측면에서 비즈니스 로직을 녹일 우려가 있다.

![](https://learning.oreilly.com/api/v2/epubs/urn:orm:book:9781839211966/files/image/B15547_01_02.jpg)

즉, Domain 레이어의 Entity는 Persistence 레이어와 강한 결합을 이끌게 된다. 이는 도메인 로직을 구현하면서 eager, lazy 로딩 문제, 트랜잭션 관리, 캐시 초기화 등의 문제들을 신경쓰게 만든다.

- 레이어의 경계를 무시할 수 있다.

Layered Architecture는 기본적으로 하위 바탕이 되는, 의존하고 있는 레이어에는 접근을 허용한다. 단, 이 부분이 Layered Architectured 스타일에서 이 룰을 강제하지 않는다. 때문에 레이어에 어울리지 않는 각종 컴포넌트, 유틸 클래스 등이 하위 레이어에 몰릴 수 있다.

> 즉, 언어 자체에서 레이어 간의 의존성을 검사하는 방법을 제공하지 않고 강제하지 않기 때문에 경계를 무시할 수 있다.

![](https://learning.oreilly.com/api/v2/epubs/urn:orm:book:9781839211966/files/image/B15547_01_03.jpg)

따라서 위와 같이 Persistence 레이어에 모든것이 몰려있는 기이한 현상이 나타날 수 있다.

- 테스트를 어렵게 만들 수 있다.

![](https://learning.oreilly.com/api/v2/epubs/urn:orm:book:9781839211966/files/image/B15547_01_04.jpg)

위와 캡처와 같이 중간 레이어를 무시하고 Web 레이어가 바로 Persistence 레이어에 접근하는 경우가 있을 수 있다. 처음 위와 같이 사용한다면 괜찮아 보일 수 있지만 계속해서 위와 같은 형태가 이어진다면 다음 2가지 문제가 있을 수 있다.

먼저, 기능 확장에 문제가 생길 수 있다. Web 레이어에서 단일 단위로 접근하여 만든 비즈니스 로직은 더 많은 도메인 로직이 추가될수록 애플리케이션 전반에 필수 도메인 로직이 분산되고 책임이 뒤섞여 복잡도를 높일 수 있다.

두번째는 Web 레이어의 테스트 문제이다. Domain 레이어 뿐만 아니라 Persistence 레이어에 목킹 처리가 필요하다. 이는 테스트 작성에 복잡도를 더할 수 있다. 복잡한 테스트는 결국 일정 등의 이유로 테스트가 작성되지 않는 로직으로 이어질 수 있다. 테스트 코드를 작성하는 것보다 의존성을 이해하고 목킹하는데 더 많은 시간이 걸리기 때문이다.

- Use Case를 숨길 수 있다.

우리는 보통 기능을 추가하거나 변경할 때 올바른 위치를 찾기 마련이다. 때문에 아키텍처는 이를 빠르게 찾을 수 있도록 도와줄 수 있어야한다. 단, Layered Architecture가 이를 얼마나 도와줄 수 있나?

앞서 본 것처럼 Layered Architecture는 도메인 로직이 여러 레이어에 걸쳐서 쉽게 흩어질 수 있다. 이는 새로운 기능을 추가하는데 올바른 위치를 찾는 것을 어렵게 만든다. 거기에 더해서 Layered Architecture는 도메인 서비스의 크기에 대해서 어떠한 룰로 강제를 하지 않는다. 이는 하나의 도메인 서비스가 여러 Use Case에 대한 도메인 로직을 가질 수 있다는 의미이고 그만큼 비대해진다는 의미이다.

![](https://learning.oreilly.com/api/v2/epubs/urn:orm:book:9781839211966/files/image/B15547_01_05.jpg)

위와 같이 비대해진 서비스는 너무 많은 의존성을 가지므로 테스트를 어렵게 만들 뿐만 아니라 Use Case를 담당하는 서비스를 찾기 어렵게 만든다.

> `Use Case를 숨길 수 있다.`의 가정은 단일 서비스에서 비즈니스를 모두 구현한다는 것을 전제하는 것으로 보인다.

- 병렬로 작업하는 것을 어렵게 만든다.

만약 3명의 개발자가 있고 하나의 기능에서 각각 Web, Domain, Persistence 도메인을 맡아서 개발한다고 가정한다. 이 경우 3명의 개발자가 각각 기능을 구현하기 위해서 작업을 시작할 수 없다. Domain 레이어의 작업자는 Persistence 작업이 될 때까지 대기해야하며 Web 레이어 작업자 또한 Domain 레이어 작업을 대기해야한다.

3명의 개발자가 각 레이어 간 interface나 스팩을 정의해두고 로직을 병렬적으로 개발할수도 있다. 단, 이 경우는 데이터베이스 기반의 설계를 하지 않는 경우에만 가능하다.

## Clean Architecture와 Hexagonal Architecture

로버트 마틴 `Robert C.Martin`은 그의 저서 Clean Architecture에서 다음과 같이 이야기한다.

> 비즈니스 룰은 프레임워크, 데이터베이스, UI, 외부 애플리케이션 및 인터페이스에 독립적이고 테스트가 가능해야한다.

이 의미는 도메인 로직은 외부로 향하는 종속성을 가지지 않아야한다는 것이다. 이는 DIP `Dependency Inversion Principle`의 도움으로 모든 종속성은 도메인 코드를 가리키도록 만들 수 있다.

![](https://learning.oreilly.com/api/v2/epubs/urn:orm:book:9781839211966/files/image/B15547_02_03.jpg)

즉, 위 캡처처럼 아키텍처의 레이어 간의 모든 의존성은 안쪽으로 향해야한다는 것이다. 여기서 핵심은 도메인 엗티티가 Use Case 사이에서 접근이 된다는 점이다. 그리고 Use Case는 하나의 책임 `SRP에서 말하는 것처럼 변경할 이유가 하나만 가지도록`만을 가짐으로써 비대한 서비스 문제를 피할 수 있다.

위와 같은 아키텍처에서는 도메인 코드가 Persistence, UI 등을 전혀 모르기 때문에 비즈니스 룰에 더욱 집중하여 사용할 수 있다.

그리고 Hexagonal Architecture가 로버트 마틴의 Clean Architecture의 원리를 적용한 아키텍처이다.

![](https://learning.oreilly.com/api/v2/epubs/urn:orm:book:9781839211966/files/image/B15547_02_04.jpg)

Hexagonal Architecture는 위와 같은 형태를 띈다. Port 내부의 요구사항에 대한 UseCase와 Entity는 외부 요소로부터 보호를 받는 형태로 되어있고 애플리케이션 외부의 요소들은 전부 Port를 거치도록 되어있다.

외부로 향하는 종속성이 없기 때문에 로버트 마틴의 Clean Architecture의 종속성 규칙을 따른다고 할 수 있다.

이와 같이 Hexagonal Architecture를 통해 UI나 Persistence에 독립적으로 도메인 로직에 집중하여 구현할 수 있다.
