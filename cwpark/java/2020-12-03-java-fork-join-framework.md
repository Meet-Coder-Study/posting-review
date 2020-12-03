# 자바 포크/조인 프레임워크

자바 7에서 공개된 포크/조인 프레임워크는 자바 5의 컨커런트 API를 완성했다. 컨커런트 API는 스레드를 생성하는 것에 초점을 맞췄지만, 자바 7에서는 스레드와의 연관성을 관리할 수 있는 기능과 하드웨어 자원을 효율적으로 활용하는 방법을 제공한다. 포크/조인 프레임워크는 컨커런트 API의 스펙을 따른다. 따라서, java.util.concurrent  패키지의 ExecutorService를 구현한 클래스다. 새로운 기능이 아닌, 인터페이스의 구현체가 추가된 것이다. 그런데 포크, 조인의 의미는 무엇일까?

- 포크(Fork) : 다른 프로세스(혹은 스레드, 태스크)를 여러 개로 쪼개서 새롭게 생성한다.
- 조인(Join) : 포크하여 실행한 프로세스 또는 스레드(태스크)의 결과를 취합한다.

![image-20201202212856297](java-8-fork-join.png)

위 그림은 포크/조인 프레임워크의 개념도를 도식화한 것이다. 하나의 큰 작업에서 출발하여 하위 작업으로 포크를 실행한다. 포크를 더 실행할 수 있다면 쪼갤 수 없는 단위까지 하위 작업을 만든다. 이후 분할된 하위 작업들의 결과가 나오면 이것들을 조인하여 최종 결과를 얻는다.

이렇게 하위 작업으로 분할하는 이유는 무엇일까? 하위 작업으로 분할하면 여러 스레드가 동시에 병렬로 처리할 수 있다. 멀티 코어 기반의 하드웨어의 성능을 십분 활용할 수 있다는 것이다. 

자바는 어떻게 어떤 작업을 하위 작업으로 분할가능한지 알 수 있을까? 개발자가 그 역할을 해야만 한다. 개발자는 태스크의 분할 가능 여부에 대한 코드를 작성해야 한다.

포크/조인 프레임워크의 java.util.concurrent 패키지에 추가된 대표적 클래스를 살펴보자.

- ForkJoinPool : 포크/조인 프레임워크의 모체다. 스레드 풀의 일종이며, 등록된 태스크를 관리하고 모니터링을 수행한다. 이때 사용되는 알고리즘은 워크-스틸링 알고리즘이다.
- ForkJoinTask: RecursiveTask의 상위 클래스다. ForkJoinPool에서 실행 가능한 태스크는 ForkJoinTask를 상속한다. 하지만 개발자가 직접 컨트롤하진 않는다.
- RecursiveTask: 실제 업무를 처리하는 태스크가 상속해야하는 추상 클래스다. 이 클래스의 compute 메서드를 구현해야 한다.
- RecursiveAction: RecursiveTask와 비슷한 용도로 사용되지만 결과는 리턴하지 않는다. 즉 태스크를 실행하고 결과를 취합하는 조인 작업이 필요 없다.

이 중 개발가 직접 개발해야하는 클래스는 ForkJoinPool, RecursiveTask와 RecursiveAction이다. 

포크/조인 프레임워크의 시작은 RecursiveTask를 구현하는 것에서 출발한다. 이름에 재귀(Recursive)가 붙은 이유는 무엇일까? 태스크를 분리하고 실행하는 내용을 가지고 있기 때문이다. 예를 들어, 다음과 같이 구현해야 한다.

```java
if (하위 작업으로 분리할 수 있는가?){
  하위 작업으로 분리,
  재귀 호출
} else {
  태스크 실행
}
```

실제 코드를 보면 다음과 같다.

```java
public class ForkJoinDirSize extends RecursiveTask<Long> {
  private final Path path;
  
  public ForkJoinDirSize(Path path) {
    this.path = path;
  }
  
  @Override
  protected Long compute() {
    long fileSize = 0;
    
    // 디렉터리일 경우 하위 작업으로 분리한다.
    if(Files.isDirectory(path)) {
      try {
        List<Path> fileList = Files.list(path).collect(Collectors.toList());
        List<ForkJoinDirSize> subTaskList = new ArrayList<>();
        
        // 하위 작업을 생성하고 포크시킨다.
        for(Path file : fileList) {
          ForkJoinDirSize subTask = new ForkJoinDirSize(file);
          subTask.fork();
          // 작업 목록을 관리하기 위해 List 객체에 추가한다.
          subTaskList.add(subTask);
          Long subSize = 0L;
          
          // 하위 작업들이 종료될 때까지 대기한다.
          for (ForkJoinDirSize subTask : subTaskList) {
            subSize += subTask.join();
          }
          
          return subSize;
        } catch (IOException e) {
          System.out.println("Error :" + path);
        }
      }
      // 파일인 경우 크기를 리턴한다.
      else {
        try {
          fileSize = Files.size(path);
        } catch(IOException e) {
          System.out.println("Error :" + path);
        }
      }
      return fileSize;
    }
    
    // RecursiveTask 사용 예
    public static void main(String[] args) {
      Path rootPath = Paths.get("c:\\Program files");
      // 포크 조인 스레드 풀 생성
      ForkJoinPool pool = new ForkJoinPool();
      System.out.printf("병렬 처리 크기 : %s\n", pool.getParallelism());
      System.out.printf("합계 : %s\n", pool.invoke(new ForkJoinDirSize(rootPath)));
    }
  }
}
```

위 예제는 특정 디렉터리에 포함된 모든 파일의 크기를 구하는 프로그램이다. 순차적으로 디렉터리르 순회하면서 크기를 조회하는 것이 아니라, 병렬 처리를 이용하여 값을 읽어들여 합계를 구하기 위해 포크/조인 프레임워크를 사용하였다.

주목해야할 부분은 RecursiveTask의 추상 메서드인 compute의 구현부분이다.

`if(Files.isDirectory(path))`

주어진 Path가 디렉터리라면 하위 작업을 생성하여 재귀처리한다. 파일이라면 그 크기를 구하여 리턴한다. 

```java
for(Path file : fileList) {
  ForkJoinDirSize subTask = new ForkJoinDirSize(file);
  subTask.fork();
  subTaskList.add(subTask);
}
```

위 코드를 보면 ForkJoinDirSize 객체를 생성했다. 하위 작업을 생성하는 것이다. 해당 객체의 fork() 메서드를 호출하면 어떤일이 발생할까? 백그라운드에서 멀티 스레드 형태로 이 태스크를 실행하겠다는 의미다. 다음 줄에서는 List 배열에 추가하여 실행된 결과를 리턴받을 수 있도록 했다.

앞서, 포크를 했다면 조인을 해서 결과를 취합해야 한다는 것을 설명했다. 위 예제에서는 다음과 같이 동작한다.

```java
Long subSize = 0L;

for (ForkJoinDirSize subTask : subTaskList) {
  subSize += subTask.join();
}
```



실질적인 코드 작성은 여기까지다. 이 코드를 직접 실행하는 클라이언트 역할을 하는 코드를 작성해야 한다. 이 떄 ForkJoinPool 을 이용해야 한다. ForkJoinPool을 생성할 때 스레드 풀 크기를 지정할 수 있는데, 지정하지 않는다면 자동으로 JVM이 선택한다.

```java
ForkJoinPool pool = new ForkJoinPool();
System.out.printf("병렬 처리 크기 : %s\n", pool.getParallelism());
System.out.printf("합계 : %s\n", pool.invoke(new ForkJoinDirSize(rootPath)));
```

코드를 실행하면 많은 하위 작업이 생성된다. 하지만, 스레드 풀은 4개이므로 동시에 실행하는 작업은 4개다. 

포크/조인 프레임워크를 사용하지 않고, 기존에  순차처리를 사용하는 것과 성능 차이는 얼만큼 날까?

```javascript
public class DirSize {
  // 재귀 호출되는 메서드
  protected Long compute(Path path) {
    long fileSize = 0;
    try {
      List<Path> fileList = Files.list(path).collect(Collectors.toList());
      
      for (Path file : fileList) {
        if(Files.isDirectory(file)) {
          fileSize += compute(file);
        } else {
          fileSize += Files.size(file);
        }
      }
    } catch (IOException e) {
      System.out.porintln("Error : " + path);
    }
    return fileSize;
  }
  
  // 재귀 호출 예
  public static void main(String[] args) {
    long startTime = System.currentTImeMillis();
    Path rootPath = Paths.get("C:\\Program Files");
    
    DirSize dirSize = new DirSize();
    System.out.printf("합계 : %s \n", dirSize.compute(rootPath));
    
    long endTime = System.currentTimeMillis();
    
    System.out.printf("처리 시간 : " + (endTime - startTime));
  }
}
```

위 코드의 처리 시간은 약 4.8초가 소요된다. 앞선 포크/조인 프레임워크보다 시간이 많이 사용되었고 CPU 사용률이 낮다는 것을 알 수 있다.

현실 세계에서는 데이터를 분리하는 수많은 기준과 방법이 있다. 이 기준에 부합하여 데이터를 나누어야한다. 잘못 사용하면 하드웨어의 자원을 많이 소모하며 처리 속도가 느려지는 역효과가 날 수 있다.



## Future 와 CompletableFuture



### Future

RecursiveTask와 RecursiveAction의 명세를 보면 모두 Future 인터페이스를 구현한 추상 클래스다. Future 인터페이스는 자바 5에서 공개한 컨커런트 API에 포함되어 있다.

Future 인터페이스의 설명을 보면 **"비동기 연산의 결과를 표현한다"** 라고 정의한다. 이 인터페이스의 메서드를 살펴보면, 연산 작업이 완료되었는지 확인할 수 있는 메서드, 완료될 때까지 대기하고 완료된 결과를 조회하는 메서드를 가지고 있다.

```java
public class FutureExample {
  // 제곱을 계산하는 Callable 객체 생성
  public Callable<Long> calSqaure(long value) {
    Callable<Long> callable = new Callable<Long>() {
      @Override
      public Long call() throws Exception {
        Long returnValue = value * value;
        TimeUnit.SECONDS.sleep(1);
        System.out.println(value + "의 제곱근은 " + returnValue);
        return returnValue;
      }
    };
    return callable;
  }
  
  public void executeTest() {
    List<Long> sampleDataList =
      Arrays.asList(1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L, 9L, 10L);
    List<Future<Long>> futureList = new ArrayList<>();
    
    // 스레드풀 생성
    ExecutorService servicePool = Executors.newFixedThreadPool(4);
    
    // Callable 객체를 생성하고 스레드 풀에 등록한다.
    // 등록된 스레드에 대해 Future 객체를 리턴받는다.
    for (Long sampleValue : sampleDataList) {
      Future<Long> future = servicePool.submit(calSquare(sampleValue));
      futureList.add(future);
    }
    
    Long sumValue = 0L;
    
    // Future 목록 결과 확인
    for(Future<Long> future : futureList) {
      try {
        // 결과를 읽어 들일 때까지 대기
        // 대기하는 동안 스레드가 계산을 하고 값을 리턴한다.
        sumValue += future.get();
      } catch(ExecutionException | InterruptedException e) {
        e.printStackTrace();
      }
    }
    
    System.out.println("최종 합계 :" + sumValue);
    
    servicePool.shutdown();
  }
  
  public static void main(String[] args) {
    FutureExample futureExample = new FutureExample():
    futureExample.executeTest();
  }
}
```



Future 인터페이스를 사용하여 얻은 장점은 무엇일까? 비동기 연산을 할 수 있다는 것이다. 게다가 저수준의 스레드 프로그래밍이 필요 없다. 두 번째로, 처리 상태를 확인하고 결과를 쉽게 get() 메서드로 조회할 수 있다는 것이다.

스레드 태스크를 정의할 때 Runnable 대신 Callable 인터페이스를 사용한 이유는 무엇일까? 사실, ExecutorService의 submit 메서드는 입력 파라미터로 Runnable과 Callable 모두 받을 수 있다.

- Runnable은 메서드가 void형인 run 메서드만 존재한다. **실행 결과를 리턴하지 않는다.**
- Callable은 비동기로 데이터를 처리하고 **결과를 리턴할 수 있다.**



### CompletableFuture

CompletableFuture는 자바8에서 추가된 기능으로 Future인터페이스의 구현체다. Future 인터페이스만으로 충분하지 않기 때문에 이 구현체가 추가되었다. 어떤 기능이 추가되어 있을까? 

- 스레드 선언 없이 비동기 연산 작업을 구현하고 병렬 프로그래밍이 가능하다.
- 람다 표현식과 함수형 프로그래밍을 사용하여 코드의 양을 줄일 수 있다.
- 파이프라인 형태로 작업을 연결하고, 비동기 작업의 순서를 정의하고 관리할 수 있다.

CompletableFuture의 주요 메서드를 살펴보자.

| 메서드      | 설명                                                         |
| ----------- | ------------------------------------------------------------ |
| runAsync    | Runnable 구현체를 이용하여 비동기 연산 작업을 위한 CompletableFuture객체를 리턴한다. |
| supplyAsync | Supplier 함수형 인터페이스의 구현체를 이용하여 CompletableFuture 객체를 리턴한다. |
| thenAccpet  | 현재 단계가 성공적으로 종료되면, 메서드의 파라미터로 전달한 Consumer 함수형 인터페이스의 구현체를 실행할 수 있는 CompletionStage 객체를 리턴한다. |
| thenRun     | 현재 단계가 성공적으로 종료되면, 메서드의 파라미터로 전달된 Runnable 구현체를 실행할 수 있는 CompletionState 객체를 리턴한다. |
| complete    | 현재 태스크를 종료한다. 만약 태스크가 동작 중이면, get 메서드 처럼 작업을 마무리할 때까지 대기하고 최종 결과를 리턴한다. |

위 메서드 목록의 'then'을 보면 자바 8의 스트림 API와 연관이 깊다는 것을 알 수 있다. CompletableFuture 클래스 역시 파이프라인으로 스트림을 연결할 수 있다.

```java
public class CompletableFutureExample {
  // CompletableFuture 사용 예
  public static void main(String[] args) {
    // 첫 번째 Runnable 인터페이스를 정의
    Runnable mainTask = () -> {
      try {
        TimeUnit.SECONDS.sleep(2);
      } catch (Exception e) {}
    }
    System.out.println("Main Task : " + Thread.currentThread().getName());
  };
  // 두 번째 Runnable 인터페이스르 정의
  Runnable subTask = 
    () -> System.out.println("Next Task : " + Thread.currentThread().getName());
  
  // ExecutorService 정의
  ExecutorService executor = Executors.newFixedThreadPool(2);
  CompletableFuture.runAsync(mainTask, executor).thenRun(subTask);
  CompletableFuture.runAsync(mainTask, executor).thenRun(subTask);
  CompletableFuture.runAsync(mainTask, executor).thenRun(subTask);
  CompletableFuture.runAsync(mainTask, executor).thenRun(subTask);
}
```

이 예제에서는 2개의 고정된 스레드 풀을 사용했다. 위 예제에서는 runAsync 메서드를 사용하였다. 이와 비슷한 supplyAsync와의 차이점은 다음과 같다.

- runAsync : Runnable 인터페이스 구현체를 실행한다. run 메서드가 void 이므로 결과 값을 받을 수 없다.
- supplyAsync : Supplier 인터페이스 구현체를 실행시킨다. Supplier 인터페이스는 자바의 함수형 인터페이스 중 하나다. 입력 파라미터는 없고. 리턴값만 존재한다. 따라서 runAsync와의 차이점은 리턴 값이 존재한다는 것이다.

두 메서드의 공통점은 static 메서드다. 객체를 생성하지 않아도 메서드 호출이 가능하고, 메서드를 호출하면 새로운 CompletableFuture 객체를 호출하여 이전 태스크를 연결할 수 있다.

위 예제에서 사용한 thenRun은 CompletableFuture 객체에 두 번째로 정의한 Runnable 인터페이스인 subTask를 연결한 것이다. 이처럼 파이프라인을 구성할 수 있다.

다음 예제를 이용하여 동기식 API를 비동기식으로 바꾸는 작업을 살펴보자. 이 예제는 보험료를 계산하는 코드다.

```java
public class InsuranceCalculator {
  public int calculatePrice(Map condition) {
    // 기본 가격
    int price = 10000;
    
    // 보험료를 계산하는 로직 대신 10초 대기하는 것으로 대체
    try {
      TimeUnit.SECONDS.sleep(10);
    } catch (Exception e) {}
    
    // 가격을 리턴한다.
    return price;
  }
  
  public static void main(String[] args) {
    InsuranceCalculator cal = new InsuranceCalculator();
    
    // 5회에 걸쳐 계산한다.
    for (int i = 0; i < 5 ; i++) {
      System.out.printf("계산 차수 %s :%s\n", (i+1), cal.calculatePrice(null));
    }
  }
}
```

위 예제는 5회에 걸쳐 보험료를 계산하는 코드다. 하나의 계산 작업에 10초가 소모되므로 총 50초의 시간이 걸린다. 이 코드를 비동기 처리 방식으로 변경하려면 어떻게 해야할까? 총 두 가지 방법이 있다.

첫 번째로, calculatePrice 메서드는 그대로 두고, 이를 호출하는 로직을 비동기로 작성하는 것이다.

```java
ExecutorService service = Executors.newFixedThreadPool(5);
List<Future<Integer>> futureList = new ArrayList<>();

for (int i = 0; i < 5; i++) {
  // 비동기 처리되도록 메서드를 호출한다.
  Future<Integer> future = service.submit(() -> {
    return new InsuranceCalculator().calculatePrice(null);
  });
}

// 계산 결과 출력
futureList.forEach((future) ->{
  try {
    System.out.printf("계산 결과 : %s\n", future.get());
  } catch (Exception e ) {
    e.printStackTrace();
  }
});
```

이 코드를 살펴보면 기존 동기 방식에 비해 코딩량이 많아졌다. 또한 개발자가 직접 병렬처리를 구현해야 한다.

두 번째로 선택할 수 있는 방법은 calculatePrice 메서드가 비동기로 처리되도록 내부 구조를 변경하는 것이다.

```java
public Future<Integer> calculatePriceAsync(Map condition) {
  CompletableFuture<Integer> future = new CompletableFuture<>();
  // 스레드를 생성하고 실행할 작업을 CompletableFuture에 등록한다.
  new Thread( () -> {
    int price = calculatePrice(condition);
    // 처리 상태에 대해 레퍼런스를 등록한다.
    future.complete(price);
  }).start();
  return future;
}
```

위 메서드는 new Thread() 를 이용하여 스레드를 생성한다. 또한, 스레드에 대한 참조를 얻기 위해 CompletableFuture 클래스를 미리 생성하고 가격계산 처리결과를 이 future 객체에 저장한다. 나중에 이 API를 사용하는 개발자는 이 메서드가 리턴하는 Future 객체의 get 메서드를 호출하기만 하면 된다.



---

Practical 모던자바. 장윤기. 인사이트.


