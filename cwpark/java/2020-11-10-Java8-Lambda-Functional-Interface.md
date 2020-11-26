# Java 8 람다와 함수형 인터페이스



자바 8 부터 추가된 람다 표현식은 자바 혁신의 핵심이다. 람다 표현식과 함수형 인터페이스를 살펴보고 두 개념의 차이점도 파악해보자. 

- 람다 표현식: 익명 클래스를 람다 표현식으로 변경하는 과정을 알아보자.

- 람다 표현식 주요 문법: 람다 표현식에서 사용할 수 있는 주요 문법을 알아 보자.

- 함수형 인터페이스: 함수형 인터페이스란? 어떻게 사용할까? 람다 표현식과의 관계는?

- 메서드 참조: 메서드 참조란? 사용 시 장점을 알아보자



## 람다 표현식이 왜 필요할까?

자바 기반 프로그램은 계속 비대해지고 있다. 프레임워크와 라이브러리가 추가되면서 인터페이스 기반으로 개발이 많이 되는데 이로 인해 프로그램의 명세(인터페이스)를 제공하는 경우가 많다.

익명 클래스가 많아지면 어떻게 될까? 사용자가 관심있어할 비즈니스 로직보다 그것을 담기 위한 겉치레 코드가 더 많아진다.

다음의 Comparable 인터페이스를 통해 알아보자.

```java
public class BaseballPlayer implements Comparable<BaseballPlayer> {
  private String teamName;
  private String playerName;
  private String position;
  private int ranking;
  
  @Override
  public int compareTo(BaseballPlayer baseballPlayer) {
    return playerName.compareTo(baseballPlayer.getPlayerName());
  }
}
```

`BaseballPlayer`클래스를 선언하면서 `Comparable` 인터페이스를 구현하여 객체를 비교하는 메서드를 만들었다. 

이와 다르게 클래스 내부에 기능을 정의하지 않고 외부에서 비교 기능을 주입할 수도 있다.

```java
public class SortCollection {
  
  public static void main(String[] args) {
    List<BaseballPlayer> list = new ArrayList<BaseballPlayer>();
    
    list.sort(new Comparator<BaseballPlayer>(){
      @Override
      public int compare(BaseballPlayer o1, BaseballPlayer o2) {
        return o1.getPlayerName().compareTo(o2.getPlayerName());
      }
    });
  }
}
```

어떤 것을 정렬하는 기준은 매우 다양하다 BaseballPlayer의 경우 이름이 될수도 있고 나이가 될 수도 있다. 자바 컬렉션 프레임워크는 비교 관련 연산을 외부에서 정의해서 전달하도록 인터페이스를 남겨놓은 것이다. 



익명 클래스를 이용해서 코드를 작성하면 반복되는 코드가 자주 발생하는 문제점이 있다.

첫 번째 sort메서드의 구현을 람다 표현식으로 바꿔보자.

```java
list.sort(
  (BaseballPlayer o1, BaseballPlayer o2) 
	  -> o1.getPlayerName().compareTo(o2.getPlayerName())
);
```

위 코드를 람다 표현식이 아닌 익명 클래스를 이용하면 다음과 같다.

```java
 list.sort(new Comparator<BaseballPlayer>(){
      @Override
      public int compare(BaseballPlayer o1, BaseballPlayer o2) {
        return o1.getPlayerName().compareTo(o2.getPlayerName());
      }
    });
```



람다 표현식을 쓰면서 다음과 같은 장점을 얻었다.

- 이름 없는 함수를 선언할 수 있다. 메서드의 이름을 명시할 필요가 없다.
- 소스 코드의 분량을 줄일 수 있다.
- 코드를 파라미터로 전달할 수 있다.



상세한 문법을 이해하기 위해 익명 클래스 메서드 선언 방식을 람다 표현식으로 변경하는 과정을 차례대로 살펴보자.

다음은 스레드 프로그래밍 시 필요한 Runnable 인터페이스의 run 메서드다.

```java
public class ThreadExample {
  public static void main(Stringp[] args) {
    Thread thread = new Thread(new Runnable() {
      //run 메서드를 구현
      @Override
      public void run() {
        System.out.println("Hello world!");
      }
    });
    thread.start();
  }
}
```

이 코드를 람다 표현식으로 변경하기 전에 메서드를 구성하는 4가지 요소를 알아보자.

>1. 메서드의 이름
>2. 메서드에 전달되는 파라미터 목록
>3. 메서드를 구현한 본문
>4. 메서드의 리턴타입

여기서 중요한 부분은 무엇일까? 바로 2번과 3번의 파라미터 목록과 메서드를 구현한 본문이다. 1번과 4번을 과감히 생략하여 코드를 단순화하는 것이 람다 표현식의 핵심이다.



1 단계: 익명 클래스 선언 부분 제거

```java
Thread thread = new Thread(new Runnable() {
  @Override
  public void run() {
    System.out.println("Hello world");
  }
});
```

위 코드에서 제거할 부분은 인터페이스의 이름이다. 

2 단계: 메서드 선언 부분 제거

````java
Thread thread = new Thread(
  @Override
  public void run() {
    System.out.println("Hello world");
  }
);
````

메서드의 구성요소 중 메서드명인 *run()* 부분과 리턴타입 *void* 부분을 제거한다. 리턴 타입이 생략되더라도 컴파일러는 데이터 타입 추론을 통해 자동으로 리턴타입을 결정한다.

3 단계: 람다 문법으로 정리

```java
Thread thread = new Thread(
  () {
    System.out.println("Hello world");
  }
);
```

이제 이를 람다 문법으로 표현해야한다. 람다에서는 파라미터 목록을 메서드의 본문으로 전달한다는 의미로 `->` 기호를 사용한다. 

4 단계: 최종 결과

```java
Thread thread = new Thread( () -> System.out.println("Hello world"));
```



정리하자면 람다 표현식은 세 가지로 구성되어 있다.

- 파라미터 목록: 메서드의 파라미터 목록을 정의한다.
- 화살표(->) : 파라미터와 코드의 구현 부분을 구분한다.
- 메서드 본문: 파라미터를 받아서 이를 처리하고 결과를 리턴하는 코드 영역이다.

```
(파라미터 목록) -> 한줄 자바 코드
혹은
(파라미터 목록) -> {자바 코드 문장들;}
```



| 유형             | 예제                                       | 설명                                                         |
| ---------------- | ------------------------------------------ | ------------------------------------------------------------ |
| 파라미터 값 소비 | (String name) -> System.out.println(name)  | - 파라미터로 전달된 값을 기반으로 데이터를 처리하고 완료한다.<br />- 리턴 타입이 void 유형이다. |
| 불 값 리턴       | (String value) -> "someValue".equal(value) | - 파라미터로 전달된 값을 기반으로 불 값을 리턴한다. <br />- 주로 전달된 값의 유형성을 검증하거나 전달된 값을 비교한다. |
| 객체 생성        | () -> new SomeClass()                      | - 파라미터로 전달되는 것 없이 객체를 생성하며 리턴 값도 없다. |
| 객체 변형        | (String a) -> a.substring(0, 10)           | - 파라미터로 전달된 값을 변경해서 다른 객체로 리턴한다.      |
| 값을 조합        | (int min, int max) -> (min + max)  / 2     | 파라미터로 전달된 값을 조합하여 새로운 값을 리턴한다.        |



람다 표현식 자체를 변수로 선언할 수 있다.

```java
Thead thread = new Thread( () -> System.out.println("Hello World") );
```

람다 표현식 자체를 재사용하려면 코드를 분리하는 것이 좋을 것이다. 

```java
Runnable runImpl = () -> System.out.println("Hello World");
Thread thread = new Thread(runImpl);
```

위 코드를 메서드로 변경하자.

```java
public Runnable getRunnable() {
  return () -> System.out.println("Hello world"); // Runnable 객체를 생성하여 리턴
}
Runnable runImpl = getRunnable();
```



**형식 추론**

지금 까지의 람다 표현식에서 한 번 더 살을 뺄 수 있을까? 리턴 타입을 추론할 수 있다면 파라미터의 타입도 추론할 수 있지 않을까? 다음 2개 코드는 동일한 람다 표현식이다. 하지만 마지막 줄은 타입을 생략하였다.

```java
(String a) -> System.out.println(a);
(a) -> System.out.println(a);
```



**람다 표현식의 변수 사용 범위**

지금까지 살펴본 람다 표현식에서 사용한 변수들은 파라미터로 전달받은 것들이다. 하지만 외부 변수, 즉 멤버 변수나 메서드 내부 로컬 변수를 참조할 수도 있다.

```java
int threadNumber = 100;
list.stream().forEach((String s) -> System.out.println(s + ", " + threadNumber));
```

여기서 주의할 점은 람다 표현식에서 사용하는 외부 변수는 반드시 final이거나 final과 유사한 조건이어야 한다. 즉, final 키워드를 붙이지 않아도 값이 변경될 가능성이 없어야 한다.



## 함수형 인터페이스 기본

지금까지 익명 클래스를 람다 표현식으로 변경하면서 의문점이 발생할 것이다. 익명 클래스는 여러 개의 메서드를 표현한다. 반면, 람다 표현식은 메서드의 이름이 없다. 어떻게 컴파일러는 어떤 메서드를 구현할지를 알고 컴파일할 수 있을까?

람다 표현식을 쓸 수 있는 인터페이스는 오직 **public 메서드 하나** 만을 가지는 인터페이스여야만 한다. 자바 8에서는 이러한 종류의 인터페이스를 특별히 **함수형 인터페이스** 라고 하며 함수형 인터페이스에서 제공하는 단 하나의 추상 메서드를 **함수형 메서드**라고 한다.

함수형 인터페이스임을 명시하기 위해 `@FuntionalInterface` 가 제공된다. 자바 8은 대표적인 함수형 인터페이스들이 만들어지는 패턴을 규격화 해놓았다. 주된 패턴의 내용은 다음과 같다.

| 인터페이스명   | 메서드명          | 내용                                                         |
| -------------- | ----------------- | ------------------------------------------------------------ |
| Consumer<T>    | void accept(T t)  | - 파라미터를 전달하여 처리하고 결과를 리턴 받을 필요가 없는 경우 사용<br />- 받기만 하고 반환하지 않으므로 Consumer(소비자)라는 이름이 붙음 |
| Function<T, R> | R apply(T t)      | - 전달할 파라미터를 다른 값으로 변환하여 리턴할 때 사용<br />- 주로 값을 변경하거나 매핑할 때 사용함 |
| Predicate<T>   | boolean test(T t) | - 전달 받은 값에 대해 참/거짓 값을 리턴할 때 사용함 <br />- 주로 데이터를 필터링할 때 사용함 |
| Supplier<T>    | T get()           | - 파라미터 없이 리턴 값만 있는 경우 사용<br />- Consumer와 정확히 반대되는 개념이다. |



### Consumer 인터페이스

Consumer 인터페이스는 이름 그대로 요청받은 내용을 소비하고 아무런 값을 리턴하지 않는다.

```java
public class ConsumerExample {
  public static void executeConsumer(List<String> nameList, Consumer<String> consumer) {
    for(String name: nameList) {
      consumer.accept(name);
    }
  } 
  // Consumer 인터페이스 활용
  public static void main(String[] args) {
    List<String> nameList = new ArrayList<>();
    nameList.add("정수빈");
    nameList.add("김재호");
    nameList.add("오재원");
    ConsumerExample.executeConsumer(nameList, 
                                   (String name) -> System.out.println(name));
  }
  
}
```

여기서 람다 표현식이 사용된 부분을 살펴보자.

```java
ConsumerExample.executeConsumer(nameList, (String name) -> System.out.println(name));
```

위 코드를 다음과 같이 바꾸면 동일한 결과가 발생할까?

```java
public Consumer<String> getExpression() {
  return (String name) -> System.out.println(name);
}
ConsumerExample.executeConsumer(nameList, getExpression());
```

결과는 동일하다. 단순히 Consumer 인터페이스를 별도의 메서드로 정의하였을 뿐이다.



### Function 인터페이스

이 인터페이스는 특정한 클래스를 파라미터로 받아서 처리한 후 리턴한다. 먼저 두 개의 제너릭 타입인 T 와 R을 정의해야 한다. T는 파라미터를 의미하고 R은 리턴 타입을 의미한다. 

```java
public class FunctionExample {
  public static int executeFunction(String context, Function<String, Integer> function) {
    return function.apply(context);
  }
  
  // Function 인터페이스 실행
  public static void main(String[] args) {
    FunctionExample.executeFunction("Hello welcom to Java world", 
                                   (String context) -> context.length());
  }
}
```



### Predicate 인터페이스

Predicate 인터페이스는 리턴 타입이 참 또는 거짓 중 하나만을 선택하는 불 타입일 때 사용한다.

```java
public class PredicateExample {
  public static boolean isValid(String name, Predicate<String> predicate) {
    return predicate.test(name);
  }
  
  public static void main(Stringp[] args) {
    PredicateExample.isValid("", (String name) -> !name.isEmpty());
  }
}
```



### Supplier 인터페이스

이 함수형 인터페이스는 '공급자' 라는 의미다. Consumer와 정 반대의 개념이다. 입력 파라미터는 없고 리턴 타입만 존재한다.

```java
public class SupplierExample {
  public static String executeSupplier(Supplier<String> supplier) {
    return supplier.get();
  }
  
  // Supplier 실행 예제
  public static void main(String[] args) {
    String version = "java upgrade book, version 0.1 BETA";
    SupplierExample.executeSupplier(() -> {return version;});
  }
}
```



## 함수형 인터페이스 응용



### 기본형 (primitive) 데이터를 위한 인터페이스

자바의 데이터 타입은 기본형과 객체형으로 구분된다. 기본형 데이터를 객체형으로 변환하는 것을 박싱(Boxing)이라고 한다. 객체형을 기본형으로 변경하는 것을 언박싱(un-boxing)이라고 한다. 자바에서는 컴파일러가 자동으로 박싱과 언박싱을 대신해주므로 이를 오토 박싱/언박싱(Auto Boxing/Unboxing)이라고 한다. 하지만 오토 박싱/언박싱에서 소모되는 자원이 크므로, 자바는 기본형을 처리하기 위한 인터페이스를 만들어 놓았다.

```java
public class IntPredicateExample {
  // Integer 형만을 허용하는 Predicate 인터페이스 정의
  public static boolean isPositive(int i, IntPredicate intPredicate) {
    return intPredicate.test(i);
  }
  
  // IntPredicate 실행 예제
  public static void main(String[] args) {
    for(int i = 0; i < 1_000_000; i++) {
      IntPredicateExample.isPositive(i, (int integerValue) -> integerValue > 0);
    }
  }
}
```

입력한 파라미터가 2개라면 어떨까? 이 경우, 접두어가 `Bi` 로 시작되는 인터페이스를 사용할 수 있다.

```java
public class BiConsumerExample {
  public static void executeBiConsumer(String param1, String param2, BiConsumer<String, String> biConsumer) {
    biConsumer.accpet(param1, param2);
  }
  // BiConsumer 실행 예제
  public static void main(String[] args) {
    BiConsumer<String, String> biConsumer = (String param1, String param2) -> {
      System.out.println(param1);
      System.out.println(param2);
    };
    BiConsumerExample.executeBiConsumer("Hello ", "World !", biConsumer);
  }
}
```

두 개 파라미터가 필요할 수도 있지만 세 개 이상일 경우 컬렉션에 담을 것을 고려하자.



### Operator 인터페이스

앞서 살펴본 함수형 인터페이스 이외에 Operator 인터페이스가 기본 함수형 인터페이스로 제공된다. Operator 인터페이스가 잘 사용되지 않는 이유는 특정한 정수 혹은 실수형 데이터만을 위해 존재하기 때문이다. 다음은 Operator 인터페이스 중 하나인 UnaryOperator의 명세다.

```java
@FunctionInterface
public interface UnaryOperator<T> extends Function<T, T> { ... }
```

UnaryOperator가 Function의 하위 인터페이스임을 알 수 있다. UnaryOperator 뿐만이 아니라 Operator 인터페이스가 모두 Function 인터페이스의 하위 인터페이스이다.



```java
public class UnaryOperatorExample {
  // UnaryOperator 인터페이스 사용 예
  public static void main(String[] args) {
    UnaryOperator<Integer> operatorA = (Integer t ) -> t * 2;
    System.out.println(operatorA.apply(1));
    System.out.println(operatorA.apply(2));
    System.out.println(operatorA.apply(3));
  }
}
```

```java
public class BinaryOperatorExample {
  
  public static void main(String[] args) {
    BinaryOperator<Integer> operatorA = (Integer a, Integer b) -> a + b;
    
    System.out.println(operatorA.apply(1, 2));
    System.out.println(operatorA.apply(2, 3));
    System.out.println(operatorA.apply(3, 4));
  }
}
```



## 메서드 참조

메서드 참조(method reference)는 함수 자체를 메서드의 파라미터로 전달하는 것을 말한다. 메서드 참조의 장점은 람다 표현식과 다르게, 코드를 여러 곳에서 재사용할수 있고 자바의 기본 제공 메서드 뿐만 아니라, 직접 개발한 메서드도 사용할 수 있다는 점이다. 

메서드 참조는 람다 표현식을 한 번 더 축약한 것이다. 람다 표현식을 대체한다기보다 상호 보완한다고 봐야 한다.

람다 표현식을 살펴보면 **->** 기호 왼쪽의 파라미터 목록은 형식적인 것이다.

```java
(String name) -> System.out.println(name) // 람다 표현식
```

**->** 기호를 생략하여 실제 처리할 메서드만을 따로 구분할 수 있다.

```java
System.out::println // 메서드 참조 구문
```

람다 표현식에서 메서드 참조로 바뀌면서 어떤 것들이 생략되었는가? 파라미터의 이름과 파라미터의 타입이 생략되었고, **->** 기호와 메서드의 소괄호와 파라미터가 생략되었다.

```java
public class OldPrintList {
  // for each 구문 예제
  public static void main(String[] args) {
    List<String> list = new ArrayList<String>();
    
    // for each 문장을 이용한 데이터 출력
    for (String entity: list) {
      System.out.println(entity);
    }
  }
}
```

자바 8에서는 for each 코드를 단 한 줄로 바꿀 수 있다. 

```java
List<String> list = new ArrayList<String>();
...
list.stream().forEach((String entity) -> System.out.println(entity));
```

이 예제는 람다 표현식이며 이 코드에 메서드 참조를 사용하면 다음과 같이 더 축약할 수 있다.

```java
list.stream().forEach(System.out::println);
```

```java
public class MethodReferenceExample {
  public static MethodReferenceExample of() {
    return new MethodReferenceExample();
  }
  // 데이터 처리 로직 정의
  public static void executeMethod(String entity) {
    if(entity != null && !"".equals(entity)) {
      System.out.println("Contents : " + entity);
      System.out.println("Length : " + entity.length());
    }
  }
  
  // 대문자 변경 코드
  public void toUpperCase(String entity) {
		System.out.println(entity.toUpperCae());
  }
  
  // 실행 예제
  public static void main(String[] args) {
    List<String> list = new ArrayList<String>();
    list.add("a");
    list.add("b");
    list.add("c");
    
    // 정적 메서드 참조
    list.stream().forEach(MethodReferenceExample::executeMethod);
    
    // 한정적 메서드 참조
    list.stream().forEach(MethodReferenceExample.of()::toUpperCase);
      
    // 비한정적 메서드 참조
    list.stream().map(String::toUpperCase).forEach(System.out::println);
  } 
}
```

위 예제를 보면 메서드를 참조를 정의하는 문법은 두 가지다.

- 클래스명::메서드명
- 객체 변수명::메서드명



### 정적 메서드 참조

```java
Integer::parseInt
(String s) -> Integer.parseInt(s)
```

정적 메서드 참조는 말그대로 정적 메서드를 가져오는 것이다. 정적 메서드 참조는 인스턴스가 필요없다.



### 비한정적 메서드 참조

비한정적(unbound) 메서드 참조는 static 메서드를 참조하는 것과 유사하다. 비한정적이라는 표현은 특정 객체를 참조하기 위한 변수를 지정하지 않았다는 뜻이다. 아래의 코드가 그것을 잘 설명한다.

`String::toUpperCase`  

String 클래스의 toUpperCase는 static메서드가 아니다. 즉 클래스가 객체화 되어야 사용할 수 있는 메서드다. 하지만 위 코드는 마치 static 메서드를 참조하는 것처럼 정의하였다. 

하지만 파라미터가 두 개일 경우 코드 가독성을 해칠 수 있다는 것에 주의해야 한다. 다음의 코드를 살펴보면 sorted 메서드에 있는 람다 표현식을 메서드 참조 형태로 변경하면 다음과 같다.

```java
list.stream().sorted((String a, String b) -> a.compareTo(b));
list.stream().sorted(String::compareTo);
```



### 한정적 메서드 참조

한정적(unbound) 메서드 참조는 특정 객체의 변수로 제한하여 참조한다. 예를 들어, 현재 날짜를 구하기 위해 Calendar 클래스의 getTime 메서드를 호출하면 다음과 같다.

```java
Calendar.getInstance()::getTIme
```

위 예제에서는 Calendar의 객체를 생성하였고 getTime으로 인스턴스의 메서드를 호출하였다. 이 코드를 람다 표현식으로 이용하면 다음과 같다.

```java
Calendar cal = Calendar.getInstance();
() -> cal.getTime();
```

위 코드의 단점은 메서드 참조에 의해 값이 처리될 때마다 Calendar 객체를 생성한다는 점이다. 이는 불필요한 자원을 소모하므로 외부에서 단 한번만 생성할 수 있도록 다음과 같이 재활용할 수 있다.

```java
Calendar cal = Calendar.getInstance(); // 객체 생성
cal::getTime // 메서드 참조 구문, cal 변수를 참조한다.
```

이처럼 미리 메서드를 한 번만 생성하고 변수를 이용하여 메서드 참조를 하는 것을 한정적 메서드라고 한다.

한편, 메서드 참조는 파라미터 목록까지 생략되므로 코드를 읽는 사람이 오히려 더 혼란스러울 수 있다.



### 생성자 참조

생성자도 메서드의 한 유형이지만 자바는 생성자와 메서드를 엄격히 구분한다. 생성자는 리턴타입이 없다. 생성자는 오직 객체가 생성될 때만 호출할 수 있다. 생성자 참조는 다음과 같은 문법을 사용한다.

`클래스명:new`

```java
public class ConstructorReferenceExample {
  private String name;
  public ConstructorReferenceExample(String name) {
    this.name = name;
  }
  
  @Override
  public String toString() {
    return "Laptop bran name : " + name;
  }
  public static void main(String[] args) {
    List<String> list = new ArrayList<>();
    list.add("Applet");
    list.add("Samsung");
    list.add("LG");
    
    System.out.println("Lambda Expression !");
    // 람다 표현식
        list.stream().map((String name) -> new ConstructorReferenceExample(name))
                .forEach((ConstructorReferenceExample data) -> System.out.println(data));

        System.out.println("Constructor Reference !");
        // 생성자 참조
        list.stream().map(ConstructorReferenceExample::new)
                .forEach((ConstructorReferenceExample data) -> System.out.println(data));

        System.out.println("Method Reference !");
        // 생성자 참조, 메서드 참조로 변환
        list.stream().map(ConstructorReferenceExample::new)
                .forEach(System.out::println);
}
```



### 람다 표현식 조합하기

#### Consumer 조합

Consumer 함수형 인터페이스의 기본 메서드인 `accept` 외에도 `andThen` 메서드가 제공된다.

`andThen(Consumer<? super T> after)`

```java
public class AndThenExample {
  // Consuemr 조합 예제
  public static void main(String[] args) {
    Consumer<String> consumer =
      (String text) -> System.out.println("Hello :" + text);
    Consumer<String> consumerAndThen =
      (String text) -> System.out.println("Text Length :" + text.length);
    
    // Consuemr 인터페이스 조합
    consumer.andThen(consumerAndThen).accpet("Java");
  }
}
```

```
Hello : Java
Text Length : 4
```



#### Predicate 조합

Predicate 의 기본 메서드인 test 이외에 두 개의 추가적인 메서드가 제공되낟.

| 메서드명                        | 내용                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| and(Predicate<? super T> other) | 조합된 Predicate 객체를 리턴한다. test 메서드 호출 시 조합된 Predicate 객체의 리턴 결과를 and 연산으로 판단하여 그 결과를 리턴한다. |
| or(Predicate<? super T> other)  | 조합된 Predicate 객체를 리턴한다. test 메서드 호출 시 조합된 Predicate 객체의 리턴 결과를 or 연산으로 판단하여 그 결과를 리턴한다. |



```java
public class Person {
  // 이름
  private String name;
  // 성별
  private String gender;
  // 나이
  private int age;
  // getter setter
}
```



```java
public class PredicateAndExample {
  // 남자인지 판단
  public static Predicate<Person> isMale() {
    return (Person p) -> "male".equals.getGender():
  }
  // 성인인지 판단
  public static Predicate<Person> isAdult() {
    return (Person p) -> p.getAge() > 20;
  }
  
  // Predicate 조합
  public static void main(String[] args) {
    Predicate<Person> predicateA = PredicateAndExample.isMale();
    Predicate<Person> predicateB = PredicateAndExample.isAdult();
    
    // Predicate 객체 조합
    Predicate<Person> predicateAB = preidcateA.and(predicateB);

    Person person = new Person();
    person.setName("David Chang");
    person.setAge(35);
    person.setGender("male");
    
		System.out.println(person.getName() + " 's result :" + predicateAB.test(person));
  }
}
```



#### Function 조합

Consumer 인터페이스와 마찬가지로 andThen 메서드가 존재한다.

```java
public class FunctionAndThenExample {
  // Function 인터페이스 조합
  public staitc void main(String[] args) {
    Function<String, Integer> parseIntFunction =
      (String str) -> Integer.parseInt(str) + 1;
    Function<Integer, String> intToStrFunction =
      (Integer i) -> "String: " + Integer.toString(i);
    
    System.out.println(parseIntFunction.apply("1000"));
    System.out.println(intToStrFunction.apply(1000));
    //Function 객체 조합 후 실행
    System.out.println(parseIntFunction.andThen(intToStrFunction).apply("1000"))
    
  }
}
```

```
1001
String : 1000
String : 1001
```



```java
public class FunctionComposeExample {
  // Function 인터페이스와 compose 예제
  public static void main(String[] args) {
    Function<String, Integer> parseIntFunction = 
      (String str) -> Integer.parseInt(str) + 1;
    Function<Integer, String> intToStrFunction =
      (Integer i) -> "String :" + Integer.toString(i);
    System.out.println(parseIntFunction.apply("1000"));
    System.out.println(parseIntFunction.apply(1000));
    // 2개 람다 표현식 조합
    System.out.println(intToStrFunction.compose(parseIntFunction).apply("1000"));
  }
}
```

이 compose 예제는 앞서 작성한 `FunctionAndThenExample` 의 결과와 동일하다. compose는 andThen 조합과 순서만 다르다는 것을 파악할 수 있다.



### 정리

- 람다 표현식은 파라미터 목록과 내부 로직만을 남긴다.
- 람다 표현식을 사용할 수 있는 인터페이스를 함수형 인터페이스라고 하며 함수형 인터페이스는 오직 하나의 public 메서드만을 가져야 한다.
- 일상적 프로그래밍에서 패턴화하여 미리 만들어놓은 것이 `java.util.function` 패키지다.
- 매서드 참조는 람다 표현식과 다르다. 메서드를 빌려올 대상을 구분할 수 있다.

---

Practical 모던자바. 장윤기. 인사이트.


