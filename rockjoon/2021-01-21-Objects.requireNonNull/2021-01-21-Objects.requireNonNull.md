# Objects.requireNonNull()를 왜 쓸까?

`Objects.requireNonNull()` 메서드는 이펙티브 자바를 읽다 보면 자주 볼 수 있다.    
이름을 보면 무엇을 하는지 얼추 유추가 가능하지만 실제로 사용해본 적이 없는 메서드이다.  
때문에 왠지 모를 호기심이 생겨 알아 보게 되었다.

## Objects.requireNonNull()이란?

이름에서 알 수 있듯 이 메서드는 non-null을 표시하는 역할을 한다.    

```java
public static <T> T requireNonNull(T obj) {
        if (obj == null)
            throw new NullPointerException();
        return obj;
    }
```
requireNonNull메서드의 내부는 다소 충격적이다. 왜냐하면 너무나도 **당연한** 코드이기 때문이다.  

---

## 왜 쓸까?
참조 객체가 널일 때 어쨋든 NPE가 나는 것은 당연한 것이기 때문에 잘 와닿지 않을 수 있다.

이를 사용하는 이유는 크게 다음과 같다.

* explicity (명시성)
* fail_fast 

---

## explicit

다음과 같이 A를 참조하는 B클래스가 있을 때
```java
public class A {

}
```

```java
public class B {
    A a;

    public B(A a) {
        this.a = Objects.requireNonNull(a);
    }
}
```
코드 상에서 A가 null이 아니어야 함을 명시적으로 표현할 수 있다.   
따라서 과거에 짠 코드가 미래에 사용될 때 해당 객체가 null이면 안된다는 것을 개발자가 **명시적으로 알 수 있다.**

---

## fail-fast
`fail-fast`란 장애가 발생한 시점에서 즉시 (혹은 최대한 빠르게) 파악할 수 있는 것을 뜻한다.  
위의 B클래스는 다음과 같이 객체 생성 시점에 바로 익셉션이 발생할 것이다.
```java
A a = null;
B b = new B(a);     // 생성 시점에 바로 NPE 발생
```
---
반면 다음과 같이 requireNonNull을 사용하지 않은 경우는 어떨까?
```java
public class BfailSlow {

    A a;

    public BfailSlow(A a) {
        this.a = a;     //Objects.requireNonNull 사용x
    }

    //...getter
}
```
바로 익셉션을 발생하지 않고 이후에 해당 객체가 사용될 때 알 수 있게 된다.
```java
A a = null;
BfailSlow b_slow = new BfailSlow(a);
b_slow.getA();      // 객체 생성 이후에 늦게 NPE 발생
```
이는 시스템이 복잡해 질 수록 장애를 발견하기 어렵게 만들 수 있다.    

---
## 기타 장점
* **디버깅이 용이**해지고 안정성이 높아 진다.

* 항상 같은 시점에 익셉션을 발생시키는 것은 시스템의 **일관성**을 높이고. 개발자가 나머지 부분에 더 신경 쓸 수 있게 해준다.

* NPE를 명시적으로 던지는 것이 JVM이 발견해서 발생시키는 것 보다 **성능상의 이점**이 있다고 한다.     

---

## vs Optional

### 목적

- Optional은 **null일지도 모르는 값을 처리하는데** 초점이 맞춰져 있지만   
- requireNonNull은 해당 참조가 **null일 경우 즉시 개발자에게 알리는 것**이 목적이다.

### 사용 형태

- Optional은 리턴타입에 사용되는 것이 권장된다.   
- requireNonNull은 메서드 내부에서 큰 제약 없이 사용될 수 있다.

### requireNonNullElseGet
자바9버전 부터는 다음과 같은 메서드가 추가되면서 Optional과 비슷하게 사용이 가능하다.
```java
requireNonNullElseGet(T obj, Supplier<? extends T> supplier)
```

---

참고    
* https://stackoverflow.com/questions/45632920/why-should-one-use-objects-requirenonnull
* https://stackoverflow.com/questions/43928556/why-explicitly-throw-a-nullpointerexception-rather-than-letting-it-happen-natura