### 들어가기 전에

stream map, filter, forEach 등에서 람다식을 사용해왔지만
JavaScript를 쓸 때 처럼 람다식을 변수에 저장하고 활용하는 방식을 거의 사용하지 않다보니, 함수형 인터페이스에 대한 내용이 부족한 것 같아 알아봤다.

## 함수형 프로그래밍의 개념

> 일급 객체 함수, 순수 함수, 고차 함수


### 일급 객체 함수

- 함수의 인스턴스를 생성해서 해당 함수의 인스턴스를 참조하는 변수를 할당할 수 있음을 의미
- 자바의 메서드는 일급 객체가 아니다.
- 메서드를 함수처럼 사용하는 최신 방법은 자바의 람다식을 사용하는 것

### 순수 함수

- 실행할 때 부수 효과가 일어나지 않고 동일한 매개변수가 주어졌을 때 항상 같은 값을 반환하는 함수

### 고차 함수

- 함수를 매개변수로 갖거나 다르함수를 결과로 바노한하는 함수
- 람다식으로 고차 함수를 구현한다.
- Collections.sort 메서드는 고차 함수다. 두 번째 매개변수가 람다식임

## 순수 함수형 프로그래밍 규칙

### 상태 없음

- 자신이 속한 클래스나 객체의 멤버 변수를 참조할 수는 없다.

### 부수 효과 없음

- 함수 범위 바깥의 외부 상태를 변경할 수 없다.
    - 함수 외부 상태 : 해당 함수를 포함한 클래스나 객체의 멤버 변수, 함수에 매개변수로 전달되는 멤버 변수, 외부 시스템의 상태

### 불변 변수

- 불변 변수를 사용해 쉽고 직관적인 방식으로 부수 효과를 방지할 수 있다.

### 반복 보다 재귀 선호

- 재귀는 함수 호출을 반복하며 반복문 처럼 동작하므로 함수형 코드다.
- 꼬리 재귀를 사용해 성능 저하를 개선해야한다.
    - 대부분의 컴파일러는 꼬리 재귀를 최적화하여 성능 저하를 방지한다.

## 함수형 인터페이스

- 1 개의 추상 메소드를 갖는 인터페이스.
- default나 static은 여러개 있어도 무방하다
- `@FunctionalInterface` 어노테이션이 없어도 함수형 인터페이스로 동작하고 사용하는 데 문제는 없지만, 인터페이스 검증과 유지보수를 위해 붙여주는 게 좋다.
- 예시
    
    ```java
    @FunctionalInterface
    interface CustomInterface<T> {
        // abstract method 오직 하나
        T myCall();
    
        // default method 는 존재해도 상관없음
        default void printDefault() {
            System.out.println("Hello Default");
        }
    
        // static method 는 존재해도 상관없음
        static void printStatic() {
            System.out.println("Hello Static");
        }
    }
    
    public interface MyFunctionInterface<T> {
      public void myMethod();
    }
    
    public class Main {
      public static void main(String args[]) {
        MyFunctionInterface<Integer> myFunctionInterface = () -> {
          System.out.println("실행");
        };
      }
    }

    ```
    

### Java에서 제공하는 것

| 함수형 인터페이스 | Descripter | Method | 사용 예시 |
| ----- | ----- | ----- | ----- |
| Predicate | T -> boolean | boolean test(T t) | stream filter에 사용 |
| Consumer | T -> void | void accept(T t) | forEach |
| Supplier | () -> T | T get() | 무에서 유를 생산. lazy evaluation 가능 |
| Function<T, R> | T -> R | R apply(T t) | stream map |
| Comparator | (T, T) -> int | int compare(T o1, T o2) |  |
| Runnable | () -> void | void run() | 스레드에서 실행될 수 있는 작업을 나타내는 인터페이스 |
| Callable | () -> T | V call() | 실행 결과를 반환할 수 있습니다. call 메서드를 구현하고 Future<V>를 통해 비동기적으로 결과를 얻을 수 있다. |

  
  
### 람다식 내부의 try-catch 걷어내기

  map을 사용할 때 내부에 Exception이 발생할 것 같으면 다음과 같이 쓴 코드가 많았다.
  ```java
  stream().map(element -> {
      try {
          return convert(element);
      } catch(Exception e){
          log.error("error : {}", e.messsage(), e);
          return null;
      }
  	})
  	.filter(Objects::nonNull)
   	.collect(Collectors.toList());
  }
  ```
  Error를 handling 하는 방식에 따라 다르겠지만, 람다식 내부에 try-catch문에 있는게 싫어서 functional interface를 정의하고 map 내부를 감싸도록 수정했다.
  
  ```java
  @FunctionalInterface
  public interface FunctionWithThrows<T, R, E extends Exception> {

    R apply(T t) throws E;

}
  
  public interface MyCustomFunctionalInterface {

    static <T, R, E extends Exception> Function<T, R> funcWtException(
        FunctionWithThrows<T, R, E> functionWithThrows) {
      return arg -> {
        try {
          return functionWithThrows.apply(arg);
        } catch (Exception e) {
          throw new MyServiceException(e);
        }
      };
    }
}
  
  
  stream().map(funcWtException(this::convert))
          .filter(Objects::nonNull)
      	.collect(Collectors.toList());
  ```
  
---

참고

자바 코딩 인터뷰 완벽 가이드

https://developer-talk.tistory.com/460