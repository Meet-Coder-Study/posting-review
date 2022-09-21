### 사전 지식 

#### Async/Sync

어떤 task에는 응답과 요청이 존재한다. 동기와 비동기는 요청과 응답의 차이에서 나타난다.

+ Async(비동기)

  작업에 대한 요청을 한 후 응답의 여부에 상관없이 다음 작업으로 넘긴다.

+ Sync(동기)

  작업에 대한 요청을 한 후 응답이 올 때까지 다음 작업으로 넘기지 않는다. 순서가 중요할 때 사용한다.

#### KVO(Key-Value Observing)

- 객체 프로퍼티의 변경사항을 다른 객체에게 알리기 위해 사용하는 코코아 프로그래밍 패턴
- Model과 View와 같이 논리적으로 분리된 파트 간의 변경사항을 전달하는데 유용함
- NSObject를 상속한 클래스에서만 KVO를 사용할 수 있음 
- 참고 : https://zeddios.tistory.com/1220

#### Serial/Concurrent

- Serial : 
  Serial queues(private dispatch queus)는 큐에 추가된 순서대로 한번에 하나의 task 실행
  직렬 방식
  현재 실행 중인 task는 dispatch queues에서 관리하는 고유한 스레드에서 실행된다. 
  필요한 만큼 사용가능 하며, 각 큐는 다른 모든 큐와 관련하여 동시에 작동한다. -> 만약 serial queue 4개 작성시 각 큐는 한번에 하나의 task만 실행하지만 최대 4개의 task가 각 큐에서 동시에 실행된다. 
  + Main dispatch queue
    main 쓰레드에서 task를 실행하는 전역적으로 사용 가능한 serial queue
    이 큐는 앱의 실행 루프( run time loop)와 함께 작동하여 큐에 있는 task의 실행을 실행루프에 연결된 다른 이벤트 소스의 실행과 얽힌다. main 스레드에서 실행되므로 main queue는 종종 앱의 주요 동기화 지점으로 사용된다. 
- Concurrent:
  Concurrent queues(global dispatch queue)는 동시에 하나 이상의 task를 실행하지만 task는 큐에 추가된 순서대로 계속 시작된다.
  특정 시점에서 실행되는 정확한 task의 수는 가변적이며 시스템 조건에 따라 다르다. 
  iOS 5 이상에서는 큐 타입으로  DISPATCH_QUEUE_CONCURRENT를 지정하여 사용자가 동시에 dispatch queue를 생성할 수 있다.
  앱에 사용할 사전에 정의된 global concurrent queues가 4개 있다. 

#### QoS(Quality of Service)

이 class는 DispatchQueue에서 수행할 작업을 분류한다. 
중요도를 표시하고 시스템이 우선순위를 정하여 이에 따라 스케쥴링을 정한다. 우선순위가 높은 작업이 더 빨리 수행되고, 리소스가 많으므로 일반적으로 우선순위가 높은 작업이 우선순위가 낮은 작업보다 더 많은 에너지가 필요하다. -> 앱이 responsive하며 에너지 효율에 대한 보장을 해준다. 

추가 참고: https://zeddios.tistory.com/521

#### API

##### Operation

Single task와 관련된 코드와 데이터를 나타내는 추상 클래스 

GCD를 기반으로 여러가지 기능을 추가한 추상 클래스라고 생각 (예를 들어, dispatchqueue에서 작업한 코드를 취소할 방법이 없지만 이를 하기 위해서 operation을 사용한다.)

**기능** 

1. 데이터와 기능을 캡슐화했기 때문에 재사용이 가능하다. 
2. 해당 작업의 실행 상태(실행, 정지, 대기 등)를 알 수 있고 이를 통해 operation들을 취소 혹은 순서 지정이 가능하다.(왜냐하면 Operation은 OperationQueue에 들어가기 전까지 실행되지 않기 때문이다.)

https://developer.apple.com/documentation/foundation/operation

https://tong94.tistory.com/17

#### 쓰레드 활용법 : GCD(Grand Central Dispatch), NSOperation

GCD는 순정 C API이다. 반면 NSOperationQueue는 object-C객체이다. 따라서 NSOperationQueue가 조금 더 무겁다. NSOperationQueue, Operation(swift3부터 NSOperation -> Operation으로 변경)을 사용하는 이점은 다음과 같다.

1. 작업 취소
   Operation Queue를 사용하면 취소는 간단히 할 수 있다. 이미 시작한 작업은 취소하지 못할지라도 작업이 실행하지 않게는 할 수 있다. 반면 GCD 큐는 이미 스케쥴된 블록을 취소할 수 있는 방법이 없다. 
2. 의존 작업
   다른 작업이 성공적으로 수행된 후에 실행할 수 있게 하는 작업 계층을 만들 수 있다. 
3. 작업 프로퍼티 키-값 관찰
   KVO를 통해 작업이 취소되었는지 알 수 있는 isCancelled, 작업이 끝났는지 확인하는 isFinished 같은 것들이 있다. 이를 통해 GCD보다 세세하게 제어할 수 있다. 
4. 작업 우선순위
   각 작업은 QoS가 있다. 작업들 간의 우선순위를 설정한다. GCD는 이를 하기 위한 직접적인 방법이 없으며 큐 우선순위는 가지지만 개별 블록이 아닌 전체 큐에 대해 우선순위를 설정한다. 
5. 작업의 재사용
   NSBlockOpertaion 같은 NSOperation의 하위 클래스 중 하나를 사용하는 것이 아니라면 스스로 자신의 하위 클래스를 생성해야한다. 이러한 코드는 코드 내에서 재사용할 수 있다. 

참고 : https://blog.naver.com/PostView.nhn?blogId=horajjan&logNo=220888295104&redirect=Dlog&widgetTypeCall=true



## NSOperationQueue

- operation의 실행을 관리하는 큐
- 준비 상태, 상호 운용 종속성, 우선 순위 등을 기반으로 실행한다.
  - 우선 순위가 같을 경우 먼저 큐에 들어 온 순서대로 처리
- 큐에 한번 들어가면 작업이 완료되었다고 보고 할 때까지 대기열에 남아 있음
  - NSOperation의 finished가 true 일때
- NSOperation의 작업 실행 과정
  `ready → executing → finished`
  state는 암묵적으로 해당 키패스에 KVO 통지를 하게됨. 이에 대응하는 프로퍼티가 true 반환
- 작업 취소
  - 개체가 대기열에 남아 있지만 최대한 빨리 작업을 중지해야한다고 알림
  - 현재 작업이 실행 중일 경우 작업 개체의 state가 취소 상태를 확인하고 수행 중인 작업을 중지한 다음 완료됨으로 표시함
- **KVO을 사용해 작업 진행 사항 감시 가능**

## Grand Central Dispatch(GCD)

* iOS에서 제공하는 쉽고 편한 멀티 스레딩 처리를 위한 API
* 개발자가 실행할 테스크를 생성하고 DispatchQueue에 추가하면 GCD는 테스크에 맞는 스레드를 자동으로 생성해서 실행하고 작업이 종료되면 해당 스레드를 제거 
* 앱의 기본 스레드 또는 백그라운드 스레드에서 작업을 serial 또는 concurrent 방식으로 관리하는 개체
* First In First Out 방식으로 동작한다. 따라서 queues에 추가하는 테스크는 항상 추가된 순서대로 시작된다. 
* 앱 실행시 시스템에서 기본적으로 2개의 Queue를 만들어 준다. 
  1. Main Queue: 메인 스레드(UI 스레드)에서 사용 되는 Serial Queue로 모든 UI 처리는 메인 스레드에서 처리를 해야한다.
  2. Global Queue: 편의상 사용할수 있게 만들어 놓은 Concurrent Queue로 Global Queue는 처리 우선 순위를 위한 qos(Quality of service) 파라미터 제공하여 병렬적으로 동시에 처리를 하기때문에 작업 완료의 순서는 정할수 없지만 우선적으로 일을 처리하게 할수 있다.

|                | 차이점                                                       |
| -------------- | ------------------------------------------------------------ |
| GCD            | 작업이 복잡하지 않고 간단하게 처리하거나 특정 유형의 시스템 이벤트를 비동기적으로 처리할 때 적합하다. (예를 들면 타이머, 프로세스 등의 관련 이벤트) <br /><br />오버헤드가 있지만 사용하기 매우 간편 |
| OperationQueue | 비동기적으로 실행되어야 하는 작업을 객체 지향적인 방법으로 사용하는 데 적합하다.<br /><br /> KVO(key Value Observing)를 사용해 작업 진행 상황을 감시하는 방법이 필요할 때도 적합하다.<br /> 동시에 실행할 수 있는 Operation의 최대 수를 지정할 수 있다.<br /><br /> Operation을 일시 중지, 다시 시작 및 취소를 할 수 있습니다. |





참고

https://zeddios.tistory.com/513
