# Caffeine Cache
## 1. 서론 
#### 1.1 캐시 ??
먼저, 캐시(Cache)는 임시 저장소라는 뜻을 가지고 있다.

복잡한 연산, DB 작업, 외부 서버의 요청 결과 등을 캐시에 저장한 상태에서, 동일한 요청이 들어오면 이전에 수행했던 작업을 하는 대신에 저장소에 있는 데이터를 꺼내 동일한 결과를 돌려주는 역할을 한다.

<br>

#### 1.2 장점
만약 아래 그림 처럼 공지사항과 같은 동일한 결과를 반본적으로 돌려주는 API 가 있다고 생각하자.

이 API는 요청을 받으면 매번 Controller --> Service --> Repository 를 거친다음 DB 조회 및 로직을 처리하는 과정을 반복적으로 진행한다.

즉, 동일한 결과를 보여주는 작업을 반복적으로 진행하기 때문에 비효율적이다.

<img width="800" src="https://user-images.githubusercontent.com/60383031/138899499-d28e4d8f-1fc1-4530-b12b-fb5614875041.png">


위와 같은 상황에서 캐시를 사용한다면 첫 번째 요청 이후 부터는 캐시에 저장되어 있는 데이터를 바로 읽어서 전달하면 되기 때문에 시스템 부하를 줄일 수 있다.

<br>

#### 1.3 언제 ??
캐시는 보통 동일한 결과가 반복적으로 발생하는 작업에서 주로 사용된다.

매번 다른 결과를 돌려주는 상황에서 캐시를 사용한다면, 오히려 캐시에 값을 저장하고 값을 꺼내오는 과정 자체가 시스템 부하만 증가시키기 때문에 사용할 이유가 없다.

<br>

#### 1.4 종류
1.4.1 로컬 캐시
- 장점
    - 각 서버 내에 저장된 데이터를 바로 읽기 때문에 속도가 빠르다.
    - 별도의 인프라 세팅이 필요없다.
- 단점
    - 여러 인스턴스를 사용할 때, 만약 하나의 인스턴스라도 캐싱된 데이터가 바뀌면 정합성을 보장하지 못한다.
    - 서버의 저장 공간을 사용하기 때문에 주의가 필요하다.

<img width="800" src="https://user-images.githubusercontent.com/60383031/138902813-418ad6ae-1518-4022-b779-79e7c4282708.png">

1.4.2 글로벌 캐시
- 장점
    - 여러 인스턴스가 동일한 값을 바라본다.
    - 즉, 서버 간 데이터 공유가 쉽다.

- 단점
    - 네트워크 비용이 발생한다.
    - 별도의 인프라 세팅이 필요하다.
    
<img width="800" src="https://user-images.githubusercontent.com/60383031/138903973-26e71f89-de93-4d13-8939-441f8775d54c.png">


<br>

## 2. Caffeine Cache
Baeldung 에서는 Caffeine Cache 를 아래와 같이 소개하고 있다.

<img width="800" src="https://user-images.githubusercontent.com/60383031/138907628-b24082b4-1005-45cf-bec6-8c10c20c24ac.png">


Caffeine 공식 문서에서는 아래와 같이 소개하고 있다.

<img width="800" src="https://user-images.githubusercontent.com/60383031/138915240-11ba186d-9643-43d8-a578-e893342789bc.png">


공통적으로 High Performance Java caching Library 라고 소개하고 있다.

문서를 읽어보면 캐시와 ConcurrentMap 과의 차이점도 설명으로 덧붙이고 있다.

ConcurrentMap 에 저장된 데이터는 해당 Map 이 제거될 때까지 영구적으로 보관된다고 한다. 

반면에 캐시는 evict 로직이 Auto 로 동작하게끔 구성이 된다고 한다.

그리고 Caffeine Cache 는 eviction policy 로 Window TinyLfu 라는 것을 사용하는데 이것을 사용함으로써 최적의 적중률(near-optimal hit rate)을 보여준다고 한다.

Window TinyLfu 에 대하여 궁금하다면 [해당 링크](https://www.fatalerrors.org/a/caffeine-cache-details.html) 를 읽어보길 바란다.

<br>

## 3. EhCache 3.xx
EhCache 는 Java 진영에서 유명한 Local Cache 라이브러리 종류 중 하나이다.

EhCache 는 Caffeine Cache 보다 더 많은 기능을 제공해준다.

분산 처리, Cache Listener 그리고 Off Heap 에 캐싱된 데이터를 저장할 수 있다. 그 외 더 많은 기능들은 공식문서에서 확인할 수 있다.

<br>

아래 그림은 [EhCache 공식문서](https://www.ehcache.org/documentation/3.1/clustered-cache.html) 에 있는 Distributed Caching 관련 내용이다.

<img width="800" src="https://user-images.githubusercontent.com/60383031/139099852-929bc1f9-f425-455d-b7b1-7b32a96e5e8e.png">

위 그림을 보면 각 어플리케이션 내에 저장되어 있는 캐시를 Terracotta 라는 Hub 역할을 하는 분산 캐시 서버에 동기화하는 과정을 볼 수 있다.

EhCache 의 Distributed Caching 에 대하여 좀 더 알아보고 싶다면 [해당 링크](https://www.nextree.co.kr/p3151/) 를 참고하길 바란다.

<br>

아래 그림은 [EhCache 공식문서](https://www.ehcache.org/documentation/3.4/tiering.html) 에 있는 Storage tiers hierarchy 구조이다.

<img width="800" src="https://user-images.githubusercontent.com/60383031/138923286-3749f17e-f0b7-42d5-abe2-e2787e448a07.png">

EhCache 는 Heap 메모리 공간 이외에 데이터를 저장할 수 있는 Off Heap 기능을 지원한다. 

Off Heap 기능을 사용하면 GC 로 부터 자유로워 질 수 있는 장점이 있다. 

하지만, Off Heap 에 저장되어 있는 데이터를 저장 및 불러올 떄는 직렬화 비용이 발생하게 된다.

<br>

## 4. 벤치마크
[Caffeine Cache 공식 문서](https://github.com/ben-manes/caffeine/wiki/Benchmarks) 에서 제공하는 Bench Mark 데이터를 살펴보자

Throughput: 단위 시간당 디지털 데이터 전송으로 처리하는 양

ops/s: operations per second (초당 작업)

<br>

#### 4.1 읽기 100% 측정

<img width="800" src="https://user-images.githubusercontent.com/60383031/138918037-141b3e1a-254a-4f31-a625-fc986b75a1f2.png">

읽기 100% 성능 측정 테스트에서는 Caffeine Cache 가 가장 좋은 성능을 보여주었고 그 다음으로는 ConcurrentLinkedHashMap 이 좋은 성능을 보여주었다.

위에서 비교했던 EhCache 는 다소 아쉬운 성능을 보여주었다.

<br>

#### 4.2 읽기 75% 쓰기 25% 측정


<img width="800" src="https://user-images.githubusercontent.com/60383031/138918162-c30037d0-601e-47c8-9e2d-6a1a77356cb6.png">


읽기 75% 쓰기 25% 성능 측정 테스트에서도 역시 Caffeine Cache 가 가장 좋은 성능을 보여주었고 그 다음으로는 ConcurrentLinkedHashMap 이 좋은 성능을 보여주었다.

하지만, 읽기 100% 성능 측정과는 다르게 Caffeine Cache 와 ConcurrentLinkedHashMap 의 성능 차이가 2배 정도 차이가 나는 것을 볼 수 있다.

마찬가지로 위에서 비교했던 EhCache 는 다소 아쉬운 성능을 보여주었다.

<br>

#### 4.3 쓰기 100% 측정

<img width="800" src="https://user-images.githubusercontent.com/60383031/138918235-c7e9dd10-727a-4ebd-a8df-9cb314ddc603.png">

쓰기 100% 성능 측정 테스트에서도 역시 Caffeine Cache 가 가장 좋은 성능을 보여주었고 그 다음으로는 ConcurrentLinkedHashMap 이 좋은 성능을 보여주었다.

마찬가지로 Caffeine Cache 와 ConcurrentLinkedHashMap 의 성능 차이가 2배 정도 차이가 나는 것을 볼 수 있다.

<br>

## 5. 요약 
Caffeine Cache 는 EhCache 처럼 다양한 기능은 제공하지는 않는다.

하지만, 심플하게 메모리에 데이터를 캐싱하고 불러오는 작업만 한다면 가장 뛰어난 성능을 보여준다.

각 장단점이 명확하기 때문에 만약 로컬 캐시를 도입한다면 위 내용들을 고려하여 도입하면 좋을 것 같다.