# [ 이펙티브 자바 ] 아이템5. 자원을 직접 명시하지 말고 의존 객체 주입을 사용하라

많은 클래스가 하나 이상의 자원에 의존한다.

다음은 `사전(dictionary)`에 의존하는 `맞춤법 검사기(SpellChecker)클래스`의 안좋은 예이다.


(1). 정적 유틸리티 클래스 (인스턴스 생성을 막고, static 필드와 메소드를 사용)
```java
public class SpellChecker {
    private static final Lexicon dictionary = ...;
    
    private SpellChecker(){}
    
    public static boolean isValid(String word){ ... }
}
```
(2). 싱글턴 방식
```java
public class SpellChecker {
    private static final Lexicon dictionary = ...;

    private SpellChecker(){}
    public static SpellChecker INSTANCE = new SpellChecker();

    public static boolean isValid(String word){ ... }
}
```
하지만 SpellChecker에서 사용하는 사전은 영어 사진이 될 수도 있고 국어 사전이 될 수도 있다.        
위의 두 방법 모두 **dictionary가 변화한다고 가정했을 때 그리 좋은 모습이 아니다.**  

* 사전의 변화를 대비 하기 위하여 클래스 안에서 사전을 종류별로 선언하는 것은 코드를 매우 복잡하게 만든다.
* final을 제거하고 사전을 변경할 수 있는 메소드를 추가하는 것은 오류를 내기 쉬우며, 멀티스레드 환경에서는 사용할 수 없다.

또한 **테스트하기 용이하지 않다.**(private 생성자로 인해 mock구현이 힘들다. - 아이템3 참조)

> 따라서 정적 유틸리티 방식과 싱글턴 방식은 모두 **사용하는 자원에 따라 동작이 달라지는 클래스에는 어울리지 않다.**
---
하지만 이 조건에 적합한 간단한 패턴이 있다. 바로 `인스턴스를 생성할 때 생성자에 자원을 넘겨주는 방식`이다.
```java
public class SpellChecker {
    private static final Lexicon dictionary;

    // 생성자에 자원을 전달
    public SpellChecker(Lexicon dictionary){
        this.dictionary = Objects.requireNonNull(dictionary);
    }

    public static boolean isValid(String word){ ... }
}
```
위의 방법은 
* 사전의 변화하더라도 영향을 받지 않고
* 테스트에도 어려움이 없으며
* 불변을 보장하여 멀티 스레드 환경에서도 사용할 수 있다.

---

생성자에 자원을 전달하는 방법의 변형으로 자원 대신 `자원을 생성하는 팩터리`를 넘겨주는 방식이 있다.
> 팩터리 : 특정 타입의 인스턴스를 만들어주는 객체
즉, 다음과 같이 생성자의 매개 변수로 Supplier<T>가 오는 패턴을 말한다.
```java
public SpellChecker(Supplier<Lexicon> dictionaryFactory){
        this.dictionary = dictionaryFactory.get();
    }
```
위의 생성자는 다음과 같이 호출하게 된다.
```java
SpellChecker(() -> new Lexicon());
```

