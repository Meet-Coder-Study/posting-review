# [ 이펙티브 자바 ] 아이템5. 자원을 직접 명시하지 말고 의존 객체 주입을 사용하라

많은 클래스가 하나 이상의 자원에 의존한다.

다음은 사전(dictionary)에 의존하는 맞춤법 검사기(SpellChecker)클래스의 예이다.


(1). 정적 유틸리티 클래스 (인스턴스 생성을 막고, static 메소드를 사용)
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