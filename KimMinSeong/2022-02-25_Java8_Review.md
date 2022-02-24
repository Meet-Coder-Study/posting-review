## Java 그리고 Java8

**자바(Java)** 는 썬 마이크로시스템즈에서 1995년 개발한 객체 지향 프로그래밍 언어입니다. <br>
한국의 개발자 절반 이상이 개발 언어로 Java를 사용할 만큼 대중적인 언어이며, <br>
2010년 오라클 인수 이후 Java9 부터는 6개월 마다 새로운 버전이 출시되어 현재는 17버전까지 나왔습니다. <br>
<br>
그중 Java8, Java11, Java17의 경우 **LTS(Long Term Support)** 라고 하여  <br>
타 버전보다 기능 개선이 많이 되고, 보안 업데이트와 버그 수정이 비교적 길게 지원되는 버전을 의미합니다. <br>
<img src = "https://user-images.githubusercontent.com/43296963/155568957-23710fce-0fe0-4386-93d1-05a9275307f5.png" width="600px">
<p>
이렇게 17버전까지 나온 자바 버전 중 어떤 버전이 가장 널리 사용되고 있을까요? <br>
IntelliJ를 만든 JetBrains에서 자바 개발자를 대상으로 한 설문 조사 결과를 보면 2021년까지는 아직도 Java8이 우세한 것을 볼 수 있습니다. <br>
Java11도 2020년 32%에 비해 많이 상승하였습니다. <br>
<img src = "https://user-images.githubusercontent.com/43296963/155568899-38b4467e-d6b3-4b06-b806-d87bed5c0ec0.png" width="500px">
 <br>
그렇다면 Java8을 가장 많이 사용하는 이유는 무엇일까요? <br>
가장 큰 이유는 '다른 버전들은 버전8 위에 조금씩 업그레이드된 부분을 쌓아 올렸다' 라고 할 만큼 Java8에 기본적인 기능들이 구축되어 있기 때문입니다. <br>
그 외에도 '안정성', '호환성', '마지막 32비트 지원' 등의 이유가 있습니다. <br>

<p>
  
---
 
Java 개발자 중 가장 많은 사람들이 사용하며 모던 자바로 불리는 Java8 버전의 특징과 예제를 살펴보면 다음과 같습니다. <br>
### 1. 동작 파라미터화(람다와 메서드 참조)

어떤 데이터에 대해 조건에 따라 값을 다르게 가져오려는 경우 Java7에서는 각각의 케이스에 대해 작성해야 했습니다.<br>
이 경우 조건이 많아질 수록 작성해야 하는 중복된 부분이 많아지게 됩니다.<br>

```
// 초록 사과를 가져오기 위한 filterGreenApples 메서드
public static List<Apple> filterGreenApples(List<Apple> inventory) {
        List<Apple> result = new ArrayList<Apple>();
        for (Apple apple : inventory) {
            if (AppleColor.GREEN.getColor().equals(apple.getColor())) {
                result.add(apple);
            }
        }
        return result;
    }
}

// 무거운 사과를 가져오기 위한 filterHeavyApples 메서드
public static List<Apple> filterHeavyApples(List<Apple> inventory) {
        List<Apple> result = new ArrayList<Apple>();
        for (Apple apple : inventory) {
            if (apple.getWeight() > 150) {
                result.add(apple);
            }
        }
        return result;
    }
}
```

Java8에서는 Predicate라는 개념이 추가되어 중복되는 부분에 대해 간결하게 표현이 가능해졌습니다.

```
// 조건부분만 구현
public static boolean isGreenApple(Apple apple) {
    return AppleColor.GREEN.getColor().equals(apple.getColor());
}
public static boolean isHeavyApple(Apple apple) {
    return apple.getWeight() > 150;
}

// ApplePredicate를 파라미터로 받는다
public static List<Apple> filterApples(List<Apple> inventory, ApplePredicate p) {
    List<Apple> result = new ArrayList<>();

    for(Apple apple : inventory) {
        if(p.test(apple)) {
            result.add(apple);
        }
    }

    return result;
}

// Predicate는 다음과 같이 Apple::isGreenApple, Apple::isHeavyApple 형식으로
filterApples(inventory, Apple::isGreenApple);
filterApples(inventory, Apple::isHeavyApple);
```

또는 람다 표현식(lambda expression)을 이용하여 표현할 수 있게 되었습니다

```
filterApples(inventory, (Apple a) -> GREEN.equals(a.getColor()));
filterApples(inventory, (Apple a) -> a.getWeight() > 150);
```

  
### 2. 스트림

기존 for, foreach를 사용하여 데이터를 가공하던 부분을 스트림 API를 사용하여 가독성과 성능을 향상 시켰습니다. <br>
또한 **파이프라인** 이라는 게으른 형식의 연산을 사용하여 기존 Collection를 사용할 때 보다 간결하게 코드를 작성 할 수 있게 되었습니다.

```
/*
* 1. 통화별로 트랜잭션을 그룹화한 다음에 해당 통화로 일어난 모든 트랜잭션 합계를 계산하시오(Map<Currency, Integer>)
* 2. 트랜잭션을 비싼 트랜잭션과 저렴한 트랜잭션 두 그룹으로 분류하시오(Map<Boolean, List<Transaction>>)
*/

// Collection 버전
Map<Currency, List<Transaction>> transactionsByCurrencies = new HashMap<>();
for (Transaction transaction : transactions) {
    Currency currency = transaction.getCurrency();
    List<Transaction> transactionsForCurrency = transactionsByCurrencies.get(currency);
    if (transactionsForCurrency == null) {
        transactionsForCurrency = new ArrayList<>();
        transactionsByCurrencies.put(currency, transactionsForCurrency);
    }
    transactionsForCurrency.add(transaction);
}

// Stream(함수형 프로그래밍) 버전
Map<Currency, List<Transaction>> transactionsByCurrencies2 = transactions.stream().collect(groupingBy(Transaction::getCurrency));
```

  
### 3. CompletableFuture 클래스 
Java5의 Future 인터페이스를 구현한 CompletableFuture가 추가되었습니다.  
Future를 사용하는 경우 현실의 복잡한 로직을 구현하기 어려운 문제가 있었습니다.

```
ExecutorService executorService = Executors.newCachedThreadPool(); 
Future<Double> future = executorService.submit(new Callable<Double>() { 
    public Double call() { 
        return someLongComputation(); 
    } 
}); 

doSomethingElse(); 

try { 
    Double result = future.get(1, TimeUnit.SECONDS); // 타임아웃 시간 지정
} catch (InterruptedException e) { 
    // 계산중 예외
} catch (ExecutionException e) { 
    // 인터럽트 발생
} catch (TimeoutException e) { 
    // 타임아웃 발생
}
```

CompletableFuture는 람다표현식과 파이프라인 메소드를 이용하여 다양한 비동기 작업을 처리할 수 있습니다. <br>
또한 기존 Future와 관련한 공통 디자인 패턴을 함수형 프로그래밍으로 간결하게 표현할 수 있도록 다양한 메서드를 지원합니다.

```
public List<String> findPricesFuture(String product) {
    List<CompletableFuture<String>> priceFutures =
            shops.stream()
                    .map(shop -> CompletableFuture.supplyAsync(() -> shop.getName() + " price is " + shop.getPrice(product)))
                    .collect(Collectors.toList());

    return priceFutures.stream()
            .map(CompletableFuture::join)
            .collect(Collectors.toList());
}

// CompletableFuture의 supplyAsync 사용으로 더 간결하게
public Future<Double> getPrice(String price) { 
	return CompletableFuture.supplyAsync(() -> calculatePrice(price)); 
}
```

  
    
### 4. Optional 클래스
T 형식의 값을 반환하거나 Optional.empty(값이 없음)라는 정적 메서드를 반환할 수 있는 Optional<T> 클래스가 추가되었습니다.  
값이 없을 때 에러를 발생시킬 수 있는 null 대신 정해진 데이터 형식을 제공할 수 있습니다.

```
// BEFORE
String name = null;
if(insurance != null){
    name = insurance.getName();
}

// AFTER
Optional<Insurance> optInsurance = Optional.ofNullable(insurance);
Optional<String> name = optInsurance.map(Insurance::getName);
```

  
### 5. 디폴트 메서드(default method)
인터페이스에서 새로운 기능을 추가했을 때 사용자가 추가된 기능에 대해 구현하지 않아도 되도록 디폴드 메서드를 지원합니다.

```
// 상속과 관련된 문제가 있음..
public interface A {
      default void hello {
            print A
      }
}

public interface B extends A {
      default void hello {
            print B
      }
}

public class C implements B, A {
      public static void main(String... args) {
            new C().hello();	// print B
      }
}
```

### 6. 그 외에도 날짜 시간 API인 java.time 패키지 추가, JVM PermGen 영역 삭제 등의 변경 사항들이 있습니다.

---

### 참고
+ https://www.jetbrains.com/ko-kr/lp/devecosystem-2021/java/
+ https://velog.io/@alicesykim95/%EC%9E%90%EB%B0%94-%EB%B2%84%EC%A0%848-11-17#-java11
+ https://namu.wiki/w/Java/%EB%B2%84%EC%A0%84
+ https://dzone.com/articles/a-guide-to-java-versions-and-features
+ https://blog.naver.com/gngh0101/221328402797
+ 모던 자바 인 액션(Raoul-Gabriel Urma 저, 우정은 역)
