# Overview

분산 시스템(Distributed System) 환경에서는 비즈니스 로직을 분산해서 메시지를 전달하는 방식으로 기능을 만들어냅니다. 이 때 시스템간의 통신이 실패했을 때, 실제로 그 통신이 요청에서 오류가 났는지, 외부 시스템의 오류가 났는지, 응답 오는 과정에서 오류가 났는지를 알아낼 수가 없습니다. [‘두 장군 문제(Two Generals’ Problem)’](https://en.wikipedia.org/wiki/Two_Generals%27_Problem)는 신뢰할 수 없는 두 네트워크간의 합의는 불가능하다는 내용을 다루고 있습니다.

따라서 시스템간의 통신에서 반드시 메시지 전달을 성공시켜야하는 로직이 있다면 이를 구현하기 위해 재시도 전략(Retry Strategy)과 이를 받아내는 시스템이 멱등(Idempotency)하게 처리를 한다면 메시지의 ‘최소 1회 전달’을 보장할 수 있습니다.

메시지를 송신하는 클라이언트는 로직이 실패한 경우 다시 동일한 요청을 보내는 재시도 전략이 필요한데요. 하지만 이러한 재시도 전략을 단순하게 반복 로직으로 처리하면 어떻게 될까요? 

![image](https://github.com/eastperson/posting-review/assets/66561524/49f81c11-1d86-49da-9412-78bff8dd9a83)
https://www.tylercrosse.com/ideas/exponential-backoff

외부 시스템과의 네트워크 장애로 인해 30초 정도 요청을 처리할 수 있는 경우, 5초의 타임아웃으로 인해 5회 재시도를 하게 되면 보내는 클라이언트와 요청을 받는 수신 서버에서는 해당 요청에 대해 5배나 부하가 더해집니다. 무분별한 재시도가 아니라 전략적으로 재시도 간의 기간을 설정하여 이러한 상황에 대해서 대비할 수 있어야 합니다. 대표적인 재시도 전략으로 **지수 백오프(Exponential backoff)** 를 먼저 알아보겠습니다.


# 지수 백오프(Exponential backoff)

[지수 백오프](https://en.wikipedia.org/wiki/Exponential_backoff)는 일부 프로세스의 속도를 제곱으로 감소시켜 점진적으로 허용 가능한 속도를 찾는 알고리즘입니다. 주로 시스템과 프로세스에서 사용되며 네트워크 상황에서 많이 사용됩니다.

```
wait_interval = base * multiplier^n
```

base는 최초 지연시간입니다. 첫번째 retry까지가 되는 시간입니다. n은 실패가 일어나서 재시도를 하게 되는 횟수입니다. multipier는 임의의 값이며 서비스마다 개별적으로 설정해서 재시도 횟수를 최소화하는 방법입니다. 아래의 그림에서 base는 100, multipier는 2입니다.

![image](https://github.com/eastperson/posting-review/assets/66561524/8b2d0981-67c2-489b-bd89-62956cf4aaf1)
https://www.tylercrosse.com/ideas/exponential-backoff

이러한 방법을 통해 해당하는 서비스마다 지연되는 시간의 파라미터를 변경할 수 있습니다. 하지만 이 재시도도 너무 값이 커질 수 있으므로 최대 지연값도 같이 설정하는 것이 좋습니다. 가령 최대 지연값이 4초인 경우 1-2-4-4-4 … 이런식으로 재시도를 할 수 있습니다. 이는 ‘truncated exponential backoff’으로 불립니다.

하지만 이러한 재시도 전략에도 문제가 있습니다. 가령 클라이언트가 A 서버를 평균적으로 100ms당 1회 호출하는 로직이 있다고 하겠습니다. 하지만 실패를 했을 경우 지수 백오프를 통해 첫 번째 재시도는 100ms, 두번 째 재시도는 200ms, 세번째 재시도는 400ms후에 시도하는 로직이 있습니다. A 서버가 400ms가 오류가 발생했을 때 A 서비스가 요청을 받는 호출은 다음과 같습니다.

|  | call #1 | call #2 | call #3 | call #4 | call #5 | call #6 |
| --- | --- | --- | --- | --- | --- | --- |
| 100ms | try#1 |  |  |  |  |  |
| 200ms | try#2 | try#1 |  |  |  |  |
| 300ms |  | try#2 | try#1 |  |  |  |
| 400ms | try#3 |  | try#2 | try#1 |  |  |
| 500ms |  | try#3(success) |  | try#2(success) | try#1(success) |  |
| 600ms |  |  | try#3(success) |  |  | try#1(success) |
| 700ms |  |  |  |  |  |  |
| 800ms | try#4 |  |  |  |  |  |

이러면 500ms때에는 일반 요청(call#2)과 재시도(call#4, call#5)이 겹처서 총 3번의 요청이 하나의 서비스에 동시에 들어옵니다. 이렇게 일반적인 요청과 의도적으로 지연이 되었던 요청이 동시에 겹치는 문제를 ‘[Thundering herd problem](https://en.wikipedia.org/wiki/Thundering_herd_problem)’라고도 합니다. 기존 백오프 전략과 지수 백오프 전략 모두 이 문제를 해결하지는 못합니다.

## **Thundering herd problem**

[Thundering herd problem](https://nick.groenen.me/notes/thundering-herd/)은 컴퓨터 공학적으로는 이벤트가 발생할 때, 이벤트를 기다리는 많은 프로세스가 깨어나는데 하나의 프로세스만 이벤트를 처리할 수 있을 때 발생하는 문제를 뜻합니다. 이를 확장하여 분산환경에서는 클라이언트 서버간의 관계에서 아래의 경우에 적용됩니다.

- 잠금/뮤텍스가 해제될 때 여러 프로세스가 깨어나는 경우
- 서버에서 연결이 끊긴 클라이언트가 모두 동시에 재연결을 시도하는 경우
- 여러 개의 예약된 작업이 모두 동시에 깨어나는 경우(예: 정시 또는 자정에 트리거되는 크론잡)

# Jitter

지수 백오프는 지연시간을 점차 늘려 네트워크 트래픽 몰림을 방지하는 방법입니다. 하지만 여전히 늘어나는 간격이 일정하므로 특정 시간대에 동일하게 재시도를 하게 됩니다.

![image](https://github.com/eastperson/posting-review/assets/66561524/11ad05e8-762a-442b-b0a1-8378e150d17c)
https://www.baeldung.com/resilience4j-backoff-jitter

이 문제를 방지하기 위해 재시도하는 요청의 트래픽을 균등하게 분산시키기 위한 방법으로 대기 간격에 무작위성을 추가하는 방법입니다. 아까 위에서 봤던 지수 백오프 로직에서 jitter를 추가하면 아래와 같습니다.

```
wait_interval = (base * 2^n) +/- (random_interval)
```

random_interval는 충돌을 피하기 위해 매번 새롭게 생성되는 값입니다.

![image](https://github.com/eastperson/posting-review/assets/66561524/f1b6fbea-e70a-4c34-bf4d-8c9332375311)
https://www.baeldung.com/resilience4j-backoff-jitter

이렇게 jitter를 사용하면 요청의 충돌을 균등하게 분산시킬 수 있고 지수 백오프를 사용하여 idle time을 지연시켜서 동시에 트래픽이 몰리는 구조를 해결할 수 있습니다.

![image](https://github.com/eastperson/posting-review/assets/66561524/5b610688-ce99-486f-8ea1-e3fd64bd154f)
https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/

AWS Blog에서 포스팅한 성능 테스트에서는 위와 같이 FullJitter의 성능을 확인할 수 있습니다.

# Reference

- [Better Retries with Exponential Backoff and Jitter | Baeldung](https://www.baeldung.com/resilience4j-backoff-jitter)

- [좀 더 우아한 Retry (Expenential Backoff with Jitter)](https://velog.io/@jazz_avenue/좀-더-우아한-Retry-Expenential-Backoff-with-Jitter)

- [Exponential Backoff And Jitter | Amazon Web Services](https://aws.amazon.com/ko/blogs/architecture/exponential-backoff-and-jitter/)

- [[기타] Retry 전략에 대해서(Exponential Backoff, Jitter)](https://jungseob86.tistory.com/12)

- [The Hardest Part of Microservices: Calling Your Services - Java Code Geeks](https://www.javacodegeeks.com/2017/04/hardest-part-microservices-calling-services.html)

- [Exponential Backoff and Jitter ⏳](https://www.tylercrosse.com/ideas/exponential-backoff)

- [Exponential backoff](https://nick.groenen.me/notes/exponential-backoff/)

- [Understanding Retry Pattern With Exponential Back-Off and Circuit Breaker Pattern - DZone](https://dzone.com/articles/understanding-retry-pattern-with-exponential-back)
[Retry strategy  |  Cloud Storage  |  Google Cloud](https://cloud.google.com/storage/docs/retry-strategy)
[Retry pattern - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry)
[메시지 전달 전략과 두 장군 문제(Message Delivery Semantics and Two Generals’ Problem)](https://medium.com/monday-9-pm/메시지-전달-전략과-두-장군-문제-message-delivery-semantics-and-two-generals-problem-f8f1c7646c0b)
