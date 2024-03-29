
### Fact

> 앞으로의 학습 방향을 고민해보기 위해 토스는 어떤 문제를 고민하는지, 어떻게 해결하고 있는지를 중점으로 컨퍼런스를 시청했다.

토스는 거대해지면서 보안과 안정성에 집중하고 있다. 편리한 금융 서비스에서 편리함을 제공하기 위해서는 안정성과 보안성이 기반이 되어야 한다. **안정성**과 **보안성**을 얻기 위한 기술적 도전이 필요하다.

> 그 중 이미지 학습 솔루션 구축 이야기와 Server Driven UI 이야기를 정리했다.

#### 1. 이미지 학습 솔루션 구축

##### 1️⃣ 배경

신원이 보장된 사용자들만 금융 거래를 진행할 수 있도록 토스는 신분증 검사를 실시했다. 신분증 사진 제출 단계에서 원본만 가져올 수 있도록 수기로 검사를 진행했는데, 이 과정에서 인력이 많이 필요했고, 인력에 비례해 휴먼 에러가 상승하는 문제가 발생했다.

##### 2️⃣ 해결 방법

토스는 수기 검증 이후에 AI를 활욜해 휴먼 에러를 체크하는 과정을 추가해 서비스 안정성을 추가했다.

##### 3️⃣ 진행 방식

1. AI를 활용하기 위햇 학습 데이터 수집할 필요가 있었는데, 신원 서비스에서 수기 검증 데이터를 활용했다. 신원 서비스에 트래픽 부담을 줄이기 위해서 프록시 서버에서 이미지 처리 후 검증 과정을 이어나갔다.

> 아마 큐와 같은 자료구조를 이용해 비동기적으로 처리를 진행하고, 트래픽 리미터를 구현해 트래픽을 조절했을 것으로 보인다.

2. 데이터는 총 80,000이 존재했고, 9:1 비율로 학습과 검증을 진행했다.

> 학습용으로 7,2000장 검증용으로 8,000장

3. 정확도를 끌어올리기 위해 여러 도구들을 비교했고, 최종적으로 RegNet을 활용했다고 한다.

<img width="836" alt="스크린샷 2023-06-28 오후 7 11 53" src="https://github.com/this-is-spear/cloud-pricing-comparison-table/assets/92219795/6d6b9893-a8b2-4e36-9b7f-3e21bd58fc0d">


> 정확도가 높아지는 만큼 지연 시간도 늘어나는 모습을 보인다.


##### 4️⃣ 적용 단계

적용해서 동작하는 기능은 총 두개이다.

- 신분증 수기 검증 더블 체크 (휴먼 에러 방지)
- 신분증 도용이 의심되는 경우 금융 거래 제한

신분증 도용이 의심되는 경우 금융 거래 제한하는 경우 대출 서비스는 신원 서비스에서 답변이 늦게 오면 실시간 신분증 이상 탐지 시스템에서 신원 정보를 비교할 수 있는 기능을 추가로 제공하고 있다.

<img width="839" alt="스크린샷 2023-06-28 오후 7 12 06" src="https://github.com/this-is-spear/cloud-pricing-comparison-table/assets/92219795/ef6fca05-5894-46cc-9cd4-7e7f335db237">

실시간 신분증 이상 탐지 시스템은 값을 이용한 비교 수치만 가능하다. Threshold를 높이면 고객의 불편함을 줄일 수 있다. 반면 이상 신분증 놓칠 활률 높아지니 주의할 필요가 있다.

<img width="836" alt="스크린샷 2023-06-28 오후 7 12 33" src="https://github.com/this-is-spear/cloud-pricing-comparison-table/assets/92219795/44862523-30e7-4ba3-8eb4-4fc825844947">

> 그래서... FNR을 줄이는 선택을 한 것일까..? Precision이 높아지는 상황을 어떻게 해결하지..?

토스는 수기 검증에 우선순위를 부여해 고객의 불편함 최소화하고 있다.

##### 5️⃣ 정리하자면

- 토스는 신분증 검사 과정에서 휴먼 에러를 방지하기 위해서 AI를 활용했다.
- 신원 서비스에서 데이터를 수집해 전처리 및 학습을 진행하고 적용했다.
- 신원 서비스의 트래픽 부담을 줄이기 위해 중간에 프록시 서버를 배치했다.
- 결과적으로 이상 신분증을 차단해 안전한 금융 서비스 제공하고 있다.

#### 2. Server Driven UI

동적인 서비스 변경에서 효율적으로 움직이기 위해서 DST를 사용하고 있다.

기존은 데이터 기반 설계로 운영하고 있었지만, 데이터 변경에 따라 UI도 변경되어야 하는 두 번의 작업으로 인해 결과가 사용자에게 전달되기까지 최소 일주일이 걸렸다.

> 이슈가 발생해도 결과 반영까지 오래걸렸다.

<img width="838" alt="스크린샷 2023-06-28 오후 7 12 42" src="https://github.com/this-is-spear/cloud-pricing-comparison-table/assets/92219795/5f6c257d-7e20-43f7-85c1-8beef5f5a34f">


HomeDST팀은 데이터만 서빙하는 게 아니라 UI도 함께 서빙해 사용자 기능을 빠르게 전달하고 있다. 서버는 UI와 데이터를 함께 전달하고 클라이언트는 해당 데이터만 전달하는 역할을 한다.

결과적으로 HomeDST 팀은 클라이언트는 데이터를 해석하지 않고 바로 표현하고 있다. 아래 코드는 서버에서 응답으로 전달하는 코드다. 서버에서 타입을 정의하면 클라이언트는 타입에 맞게 렌더링한다.

<img width="834" alt="스크린샷 2023-06-28 오후 7 13 11" src="https://github.com/this-is-spear/cloud-pricing-comparison-table/assets/92219795/494cfa16-847a-4a1e-aba0-6e52fad9b080">
서버에서는 이벤트 핸들러도 제공한다. 클라이언트는 이벤트 핸들러에 맞게 서비스를 제공한다. 또한 사용자가 어떤 동작을 많이 하는지 파악하기 위해서 이벤트 로그로 존재한다.

<img width="837" alt="스크린샷 2023-06-28 오후 7 13 18" src="https://github.com/this-is-spear/cloud-pricing-comparison-table/assets/92219795/4467979f-6e51-4c8a-9003-820d54e3a7e9">

##### 정리

DST의 장점은 다음과 같다.

- 클라이언트에서 `event log`를 관리하게 되면 누락되는 경우가 많지만, 핸들러를 클릭했을 때, `event log`를 기록하게 서버에서 강제한다면 그럴 걱정은 하지 않아도 된다.
- 클라이언트가 변경되더라도 쉽게 반응할 수 있다.
- `impression log`도 쉽게 추가할 수 있다.

> `event log` 말고도 `impression log`도 제공하는데, 사용자가 봤는지를 판단하기 위한 지표다.

주의할 점 또는 단점은 다음과 같다.

- 새로운 UI를 만든다면 결국 앱을 업데이트해야 한다.
- DST와 관련된 버그가 생길 수 있다.
- 서버에 모든 로직을 옮기기엔 현실적인 문제가 있다.
- 서버, 클라이언트가 서로 분담하던 일을 서버가 맡게 되면서 서버 개발자의 리소스가 많이 요구될 수 있다.

### Feeling

- `이미지 학습 솔루션 구축`에서 자동화를 위해 AI를 활용하는 모습을 보며 프로그래밍은 문제를 해결하기 위한 수단 중 하나라는 것을 다시금 깨닫게 됐다.
- `Server Driven UI`에서 서버의 역할을 데이터 서빙하는 역할이라고 단정했던 편견을 깨뜨릴 수 있었다.

### Finding

- 토스는 신분증 검사 과정에서 이상 신분증을 차단해 안전한 금융 서비스 제공하고 있다. 이상 신분증을 파악하기 위해 AI를 활용했다. 또한 신원 서비스의 트래픽 부담을 줄이기 위해 중간에 프록시 서버를 배치했다.
- 토스는 백엔드와 프론트 간 버전 차이로 인해 가치 전달이 지연되는 문제를 해결하기 위해 Server Driven UI를 시도하고 있다.

### Affirmation

- Server Driven UI는 실제로 해보면 즐길 수 있을 듯 하다.
