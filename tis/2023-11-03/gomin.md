# 잘하고 있는지 걱정 되서 한 정리

요즘 업무를 잘하고 있는지 걱정이 많았다. 해야 할 업무를 찾고 개선하고 싶은데 목표와 명분이 없어서 행동이 위축된다. 
[필독! 개발자 온보딩 가이드](https://www.yes24.com/Product/Goods/119108069?pid=123487&cosemkid=go16850187529137235&gad_source=1&gclid=Cj0KCQjwtJKqBhCaARIsAN_yS_mcATyB-Iia_JEpIoGAWgYQ9XVAKtD5m0PSz3SWxBCjq0jDjXseCJ4aAnynEALw_wcB) 책을 읽는데 개발자로서 경계해야 할 점을 알려주고 있어서 책에 맞게 잘 수행하고 있는지 비교해보기로 했다.

### 진행 과정

작은 리팩토링은 꾸준하게 테스트 범위를 정하고 테스트를 추가하면서 제품에 기여할 수 있지만 요즘은 아쉬운 프로세스를 개선하고 싶은 마음이 크다. 책에서는 대규모 리팩터링을 통해 기술부채를 상환하는 과정은 다음처럼 정의한다.

1. 상황 사실 그대로 설명한다.
2. 부채의 위험과 비용을 기술한다.
3. 해결책을 제안한다.
4. 대안에 대해 논의한다.
5. 트레이드 오프를 비교한다.

장애 상황 들을 확인했을 때 서버 단위의 레이턴시 지표가 필요해보였고 시스템 메트릭 수집을 보강할 필요성을 느꼈다. JVM 상태 체크는 가능하지만, MSA 구조로 구성된 시스템에서는 서버 간 연결 상태 체크가 필요해보였다.

책에서 있는 전략을 고려해 1 번과 2 번을 미리 공유했고, 3 번 이후의 전략을 세워야 했다. 상황에 맞게 다음 진행 작업을 정리했다.

1. 개선할 점과 관련해 불편한 점을 추합한다.
2. 샘플을 보여주고 이해관계자의 반응을 파악한다.
3. 긍정적인 반응을 받으면 개선한다.

### 실패를 경계하자.

진행 작업을 정리하는 일도 중요하지만 실패를 대비하기 위한 방법도 필수였다. 특히나 관리가 안되서 사용되지 않는 코드들이 꽤나 많았다. 그런 제품들은 너무 아쉬웠는데, 내가 만든 제품도 그런 문제가 발생하지 않도록 개선이 필요했다.

- 구현에서 실패를 대비하기 위해 투자 비용을 줄이기 위해서 샘플 프로젝트로 시도하는 일이었다. 신기술에만 집중해 최대한 빠르게 팀원들에게 공유하는 방법을 선택했다.
- 운영에서 실패를 대비하기 위해 개선할 부분이 제품에 영향이 가지 않도록 주의하고 관리 포인트를 최대한으로 줄이도록 신경쓰려고 한다.

데이터베이스인 경우 지속적으로 관리가 필요한데 데이터가 많이 쌓이는 시스템 지표 특성상 관리 주기가 꽤나 빈번해 보였다. 아직 개인적인 추측일 뿐이지만 오래된 데이터들을 방출하는 방식으로 운영한다면 관리 주기를 늦출 수 있어보인다.

### 경계해야 할 부분 - 악동이 되지 말자.

책에서는 업무를 하면서 악동이 되지 말라고 한다. 사내 표준에서 벗어나 새로운 도구를 사용한다면 추가 비용이 발생하기 때문이다. 표준을 변경 할 때 우선순위, 소유권, 비용, 구현 세부 내역 등을 고려할 필요가 있었다. 이미 팀내에 지표 대시보드, 로그 집계 도구가 존재하는데 서버 간 연결 상태 체크가 필요한지 진지하게 고민할 필요가 있었다. MSA로 구성된 제품이기 때문에 새로운 표준을 제시할 만큼 필요해보였다.

### 마지막으로

책에서 지켜야 할 일과 피해야 할 일을 공유하고 있다. 그 중 필요한 부분만 발췌했다.

| 지키자                     | 피하자               |
|-------------------------|-------------------|
| 코드를 이용해 자주 실험하자         | 코드를 찍어내지 마라       |
| 멀리캐스트/비동기식으로 의사소통을 진행해라 | 위험과 실패를 두려워 하지 마라 |
| 변경사항을 작게 유지하자           | 질문하기를 두려워하지 마라    |
| -                       | 회사 표준을 무시하지 마라    |

앞으로 신경써야 할 부분들을 정리했다.

- 빠른 학습
- 안정적이게
- 업무에 충실하자

첫 번째는 테스트 등을 건너뛰고 새로운 기술을 학습하는 데 초점을 맞추는 일이다. 새로운 기술을 학습해 공유하기 위해서는 선택과 집중이 요구됐다. 내가 선택한 건 새로운 기술을 학습하는 일이고 그에 맞게 집중해서 빠르게 팀에 공유를 진행했다.

두 번째는 되도록 검증된 기술을 사용하는 일이다. 새롭게 추가되거나 유지가 되지 않은 안정적이지 않은 라이브러리를 최대한 경계하고 있다.

마지막으로는 업무에 충실할 수 있도록 한다. 이 부분이 가장 걱정되는 부분이다. 흥미로 인해 우선순위가 낮은 업무부터 할 수 없는 노릇이다. 이런 작업들은 최대한 업무 외적으로 진행 중이다.

내가 잘하고 있는지 걱정이 많다. 모든 업무는 한 번 시작하면 다시 돌아가기 어려워보여서 더 신중해진다. 그래도 신중함이 소극적인 행동으로 변하지 않도록 책을 읽으면서 신경쓰고 있다. 앞으로도 꼼꼼하면서도 넓은 발자취를 남겨보려 한다.