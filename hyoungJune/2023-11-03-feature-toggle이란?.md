### 글의 원본

MartinFowler : https://martinfowler.com/articles/feature-toggles.html

# Feature Toggles?

- 코드를 변경하지 않고도 시스템 동작을 수정할 수 있도록 하는 기술이다.
- 사용자에게 새로운 기능을 신속하면서도 안전하게 제공하는 데 도움이 되는 일련의 패턴이다.

<img width="702" alt="스크린샷 2023-11-03 오후 9 47 06" src="https://github.com/Flamme1004K/posting-review/assets/50702723/4c5893c9-4a7e-424a-9949-3e0c342fbb6a">

- Feature toggle은 toggle points, toggle router, toggle context, toggle configuration으로 구성되어 있다.
	- toggle points :  토글을 이용하여 소스 코드 상에서 분기를 나누는데 사용되어진다.
	- toggle router : 토글을 동적으로 제어하는데 사용되어진다.
		- toggle router는 인메모리 저장소부터 분산 시스템까지 다양하게 구현되어진다.
	- toggle context : 요청에서 오는 특수한 cookie나 http header 값을 통하여 사용자를 식별하기 위하여 사용되어 진다.
	- toggle configuration : 토글 라우터에게 값을 주어 환경에 맞도록 사용되어지도록 역활을 한다.
		- 런타임에 관리자 UI를 통하여 토글을 수정할 수 있도록 해야한다.
- Feature toggle의 종류로써 Release Toggles, Experiment Toggles, Ops Toggles, Permissioning Toggles로 되어있다.

# Feature Toggle의 종류

## Release Toggles(릴리즈 토글)
Release Toggles는 [기능]릴리즈와 [코드]배포를 분리하는 지속적 배포 원칙을 구현하는 가장 일반적인 방법입니다. 대표적으로 trunk-based development에 사용되어집니다. 프로덕션 환경에 개발이 덜 된 코드나 테스트가 되지 않은 코드를 배포할 수 있게하며, 구현이 된 코드에 대해서는 상황에 맞춰서 Release 할 수 있도록 합니다.

<img width="684" alt="스크린샷 2023-11-03 오후 9 47 35" src="https://github.com/Flamme1004K/posting-review/assets/50702723/4768f575-d719-4047-9f4e-e67e410a53f8">

Release Toggle의 주기는 짧게 가져갑니다. 그렇기 때문에 일반적으로 1~2주 이상 유지되지 않아야 합니다. 다만 특정 상황에 대해서 더 오랜 기간동안 유지할 수도 있습니다. Release Toggles는 특정 Release version에 대해서는 토글 값이 동일하게 하고, 새로운 Release 배포를 통하여 토글을 변경하는 방식으로 사용되어집니다.

## Experiment Toggles(실험 토글)
Experiment Toggles는 사용자에 따라 하나 또는 다른 경로로 일관되게 요청을 보내고, 이를 통하여 각각 경로에서 일어난 효과에 대해 비교할 수 있도록 합니다. 대표적으로 A/B 테스트가 있으며, 이커머스에서 구매 흐름이나 버튼의 클릭 유도 문구 등을 데이터 기반으로 최적화하는데 사용합니다.

<img width="692" alt="스크린샷 2023-11-03 오후 9 47 51" src="https://github.com/Flamme1004K/posting-review/assets/50702723/72264a90-49d1-4a38-812c-61341432ada4">

Experiment Toggle은 유의미한 결과를 생성할 수 있도록 몇시간 또는 몇주 동안 동일한 구성으로 유지되어야합니다. 단, 시스템을 변경하면 실험 결과가 무효화될 위험이 있으므로 시스템을 변경하는 것보다 오래 유지하는 것은 좋지 않습니다. 그리고 Experiment Toggle의 매우 동적이기 때문에 요청에 대해 다른 사용자를 대신할 수도 있고, 똑같은 요청에 대해 다른 결과 나타납니다.

## Ops Toggles(운영 토글)
Ops Toggles는 성능에 미치는 새로운 기능을 출시했을 때 기능적인  부분에 대해서 문제가 일어났을 경우 신속하게 비활성화할 수 있도록 합니다. 즉, 시스템 동작의 운영 제어 시에 사용이 됩니다.
Ops 토글은 비교적 수명이 짧고, 새로운 기능의 운영 측면에 대해 확신이 생기면 해당 플래그를 폐기 처리합니다. 다만, 시스템에 대해서 높은 부하가 있을 경우에 중요하지 않은 시스템 기능을 끌 수 있도록 긴 수명을 가지게 할 수도 있습니다. 예를 들어, 부하가 많을 때 상대적으로 생성 비용이 많이 드는 패널 비활성 기능, 수동으로 관리되는 서킷 브레이커를 볼 수가 있습니다.

<img width="696" alt="스크린샷 2023-11-03 오후 9 48 10" src="https://github.com/Flamme1004K/posting-review/assets/50702723/c6ebb966-08f3-4d03-8a16-caef1fd7c846">

Ops toggles는 주요 제어 기능에 대해 시스템 운영에게 넘겨질 수 있으며, 해당 토글을 통하여 문제가 발생할 시에 신속하게 대응할 수 있게끔 해줍니다. 즉, 문제가 생겼을 경우 새 릴리즈 배포를 하지 않고 토글로도 충분히 대응이 가능해집니다.

## Permissioning Toggles(권한 토글)
Permissioning Toggles는 유료 사용자에게만 켜는 기능, 내부 사용자만 사용할 수 있는 기능, 베타 사용자만 사용할 수 있는 기능 등, 즉, 특정 사용자에게 제공되는 기능이나 제품 환경을 변경하는데 사용됩니다.

<img width="692" alt="스크린샷 2023-11-03 오후 9 48 32" src="https://github.com/Flamme1004K/posting-review/assets/50702723/d9d2bfaa-ef16-40aa-9fac-dbd5da5c3cf1">

Permmissioning Toggles을 유료 사용자에게만 노출되는 기능을 관리하는 방법으로 사용되었다면, 다른 기능 토글에 비해 수명이 매우 길어질 수가 있습니다. 이러한 Permmissioning Toggles는 권한을 가진 사용자별로 다르므로 항상 요청별로 이루어지는 동적인 토글입니다.
