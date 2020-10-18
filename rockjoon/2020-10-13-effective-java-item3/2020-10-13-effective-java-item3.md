# [이펙티브 자바] 아이템3. private 생성자나 열거 타입으로 싱글턴임을 보증하라

## 1. 싱글턴이란?
---
### (1). 싱글턴 의미
인스턴스를 오직 하나만 생성할 수 있는 클래스

### (2) 싱글턴의 예 
1) 무상태 객체(stateless object)
```
무상태 객체란?
인스턴스 필드가 없는 객체. 하지만 클래스 필드는 가질 수 있다.(static final)
```
> [무상태 객체 참조](https://stackoverflow.com/questions/9735601/what-is-stateless-object-in-java)

2) 설계상 유일해야 하는 시스템 컴포넌트
* ex) 유틸 클래스, 스프링의 Bean, logger객체 등

### (3) 싱글턴의 단점
테스트하기 어려울 수 있다.
* 싱글턴 인스턴스를 가짜(mock) 구현으로 대체할 수 없기 때문이다.
* 가짜(mock) 구현 테스트들은 대부분 `인터페이스 구현이나 상속을 이용해 껍데기만 구현`하여�테스트하도록 되어 있다.
* 싱글턴 메소드는 `생성자가 private`으로 감춰져 있다.
* 따라서 인터페이스를 구현을 통해 생성한 싱글턴 인스턴스가 아니라면 **가짜(mock) 객체를 만들 수 없으므로 테스트에 어려움**이 있다.
----
## 2. 싱글턴을 만드는 방법
---
### (1). public static final 필드 방식
```java
public class Singletone1 {
    public static final Singletone1 INSTANCE = new Singletone1();
    
    private Singletone1(){}
    
    public void method1(){}
}
```
* 위의 예에서 `INSTANCE` 필드는 **public static final**로 선언되어 있다.
* `INSTANCE` 필드는 초기화될 때 private 생성자를 딱 한번만 호출하므로 싱글턴이 보장된다.

### (1-1). public static final 필드 방식의 장점
* 해당 클래스가 싱글턴임이 명백히 드러난다.
* 코드가 간결하다.

### (2). 정적 팩터리 방식
```java
public class StaticFactorySingleTone {
    private static final StaticFactorySingleTone INSTANCE = new StaticFactorySingleTone();

    private StaticFactorySingleTone(){}

    public static StaticFactorySingleTone getInstance(){
        return INSTANCE;
    }
    
    public void method1(){}
}
```
* public static final 필드 방식과 다르게 `INSTANCE` 필드를 private으로 선언한다.
* 그리고 정적 팩토리 메서드 `getInstance()`를 통해 `INSTANCE` 필드를 반환 받는다.

### (2-1). 정적 팩터리 방식의 장점
* 정적 팩터리 메서드를 수정하여 싱글턴이 아니도록 수정할 수 있다.
* 정적 팩터리 메서드를 **제네릭으로** 만들 수 있다.
* 정적 팩터리의 **메서드 참조**를 `공급자`(supplier)로 사용할 수 있다.
* * 위의 예제에서 getInstance를 메서드 참조로 변환하면 `StaticFactorySingleTone::getInstance`형태가 되고 이를 람다식의 Supplier\<StaticFactorySingleTone>로 사용 할 수 있다.

### (3). 위의 방식들의 단점
* 리플렉션 API인 `AccessibleObject.setAccessible`을 사용해 private생성자를 호출할 수 있다.
* 이러한 공격을 방어하려면 생성자에서 두 번째 객체가 생성될 때 예외를 던지게 할 수 있다.
* 싱글턴 클래스를 직렬화하려면 Serializable구현만으로는 부족하다.
* 모든 인스턴스 필드를 transient로 선언하고 readResolve 메소드를 제공해야 한다.


## 3. 열거 타입 방식의 싱글턴
```java
public enum EnumSingleTone {
    INSTANCE;
    
    public void method(){}
}
```
* 원소가 하나뿐인 열거 타입 또한 싱글턴을 보증한다.
* 이 방법은 간결하고, 추가 노력 없이 직렬화 할 수 있으며, 리플렉션 공격도 막아 준다.
* **따라서 대부분 상황에서 원소가 하나인 열거 타입이 싱글턴을 만드는 가장 좋은 방법이다.**
* 다만 열거 타입은 기본적으로 Enum을 상속하고 있으므로 다른 클래스를 상속해야 한다면 이 방법을 사용할 수 없다.


## 4. 코멘트

* 이번 아이템3의 주제는 '싱글턴의 장점'이 아니라 `싱글턴을 만드는 좋은 방법`에 대한 것이다.
* 싱글턴은 private 생성자 때문에 `상속받을 수 없고`, `전역 상태`를 만들기 때문에 객체지향에 어울리지 않는다. 
* 또한 mock 테스트가 어렵다는 점과, 싱글톤 클래스와 싱글톤 클래스를 사용하는 곳 사이의 결합도가 높아 지는 등의 단점이 존재 한다.
* 따라서 싱글턴은 **제한적으로 영리하게**(앞서 살펴 본 무상태 객체, 시스템 컴포넌트 등에서) 사용할 필요가 있다 고 *개인적으로 생각한다.* 
---
참고자료  이펙티브 자바 3/E - 조슈아 블로크
