# Overview

최근 여러 책을 읽으면서 `CheckedException`과 `UncheckedException`에 대한 의견을 보았고 상반된 의견을 정리해보았다.

![image](https://user-images.githubusercontent.com/66561524/195867171-fcf4c6c7-c4d4-43af-987b-7c5253b5b654.png)

- 박성철(현 마켓컬리 리드, 전 우아한 형제 기술 이사)

# Checked Exception은 필요하다.

---

2003년에 James Gosling을 Checked Exception에 대한 주제로 인터뷰한 내용이다. 이 당시 일부 개발자는 Checked Exception은 강력한 애플리케이션을 구축하는 데 도움이 된다고 생각하고 반대로 생산성을 저해한다는 의견이 분분했던 시절이다.

## 제임스 고슬링

- C++ 프로그래밍에서 모든 함수는 return을 할 때 Error가 발생하는지 확인을 해야만 했다.
- 그는 더 나은 방법을 필요하다고 판단하여 자바에 exceptions 이라는 개념을 포함했다.
- 그의 Checked Exception의 의도는 가능한 개발자가 예외를 처리하도록 강제하는 것이었다.
- Checked Exception은 메서드 시그니쳐에 선언하거나 처리(handle) 해야한다.
- 이는 신뢰성(reliability)와 복원력(resilience)를 높이기 위한 것이었다.
- 이는 우발적인 상황에 발생한 에러를 복구(recover) 하려는 의도가 있었다.

[https://www.artima.com/articles/failure-and-exceptions](https://www.artima.com/articles/failure-and-exceptions)

다음은 ‘엘레강트 오브젝트’에 나온 내용이다. 엘레강트 오브젝트는 다소 개발자들 사이에서 논란이 많은 책이다. 하지만 저자가 제시하는 의견이 일리가 있으니 내용도 확인해볼만 하다.

## 엘레강트 오브젝트

- 언체크 예외를 사용하는 것은 실수이며 모든 예외는 체크 예외여야 한다.
- 체크(checked) 예외를 잡기 위해 체크 예외는 항상 가시적인(visible) 이유가 있다. 만일 예외가 없다면 우리는 해롭고 안전하지 않은 메서드를 다루고 있는 것이다.
- 대조적으로 언체크(unchecked) 예외는 무시할 수 있으며 예외를 잡지 않아도 무방하다. 언어가 예외처리를 강조하지 않는다. 체크 예외는 항상 가시적이지만 언체크 예외는 공개적이지 않다.

[https://www.yegor256.com/2015/07/28/checked-vs-unchecked-exceptions.html](https://www.yegor256.com/2015/07/28/checked-vs-unchecked-exceptions.html)

다음은 조슈아 블로크의 ‘이펙티브 자바’에 담긴 내용이다. checked exception의 사용성을 인정하고 런타임 예외와의 사용법을 구분하였다.

## 이펙티브 자바

- 복구 가능한 조건에 대해 체크된 예외를 사용하고 프로그래밍 오류에 대해서는 런타임 예외를 사용해야 한다. **(아이템 70)**
    - 호출하는 쪽에서 복구하리라 여겨지는 상황에서는 Checked Exception을 사용해야 한다.
    - 복구에 필요한 정보를 알려주는 메서드를 제공해야 한다.
- 발생한 예외를 프로그래머가 처리하여 안정성을 높게끔 해준다. **(아이템 71)**
    - 어떤 메서드가 Checked Exception을 던질 수 있다고 선언됐다면 이를 호출하는 코드에서는 catch 블록을 두어 그 예외를 붙잡아 처리하거 더 바깥으로 던져 문제를 전파해야 한다.

# Checked Exception은 필요하지 않다.

# 스프링

스프링 Transactional API는 checked exception은 에러로 잡지 않는다.

> *In its default configuration, the Spring Framework’s transaction infrastructure code marks a transaction for rollback only in the case of runtime, unchecked exceptions. That is, when the thrown exception is an instance or subclass of `RuntimeException`. ( `Error` instances also, by default, result in a rollback). Checked exceptions that are thrown from a transactional method do not result in rollback in the default configuration.*

- 스프링 프레임워크의 트랜잭션 인프라 코드는 오직 런타임에서 발생하는 unchecked 예외에서만 롤백마크를 찍는다.
- Checked 예외는 롤백을 발생시키지 않는다.

> This is defined behaviour. From the [docs](http://static.springsource.org/spring/docs/3.0.x/spring-framework-reference/html/transaction.html#transaction-declarative-attransactional-settings):
>
> Any RuntimeException triggers rollback, and any checked Exception does not.
>
> This is common behaviour across all Spring transaction APIs. By default, if a `RuntimeException` is thrown from within the transactional code, the transaction will be rolled back. If a checked exception (i.e. not a `RuntimeException`) is thrown, then the transaction will not be rolled back.
>
> The rationale behind this is that `RuntimeException` classes are generally taken by Spring to denote unrecoverable error conditions.
>
> This behaviour can be changed from the default, if you wish to do so, but how to do this depends on how you use the Spring API, and how you set up your transaction manager.

- 그 이유는 RuntimeException 클래스가 일반적으로 Spring에서 복구 불가능한 오류 조건을 나타내기 위해 사용하기 때문이다.
- Checked 예외는 수동으로 설정을 해줘야지 롤백으로 만들 수 있다.

[10. Transaction Management](https://docs.spring.io/spring-framework/docs/3.0.x/spring-framework-reference/html/transaction.html#transaction-declarative-attransactional-settings)

EJB 시절부터 있었던 관습이라고 한다.

## 코틀린

코틀린에서는 checked exception이 없다. 코틀린 공식 문서에서는 자바를 제외한 다른 언어는 checked exception이 없고 코틀린도 이를 따른다며 checked exception이 없는 이유를 서술했다.

> Examination of small programs leads to the conclusion that requiring exception specifications could both enhance developer productivity and enhance code quality, but experience with large software projects suggests a different result – decreased productivity and little or no increase in code quality.
> - Bruce Eckel (Thinking in Java의 저자)

- 소규모 프로그램을 검사하면 예외 사항을 요구하는 것이 개발자의 생산성과 코드 품질을 향상시킬 수 있다는 결론으로 이어진다.
- 그러나 대규모 소프트웨어 프로젝트에서는 생산성이 저하되고 코드 품질이 전혀 향상되지 않았다는 결과가 나타났다.

```java
try {
    log.append(message)
} catch (IOException e) {
    // Must be safe
}
```

- 대부분 catch 부분을 비어놓는다.

[](https://kotlinlang.org/docs/exceptions.html#checked-exceptions)

[Java's checked exceptions were a mistake (and here's what I would like to do about it)](https://radio-weblogs.com/0122027/stories/2003/04/01/JavasCheckedExceptionsWereAMistake.html)

[artima - The Trouble with Checked Exceptions](https://www.artima.com/articles/the-trouble-with-checked-exceptions)

## **Checked exceptions: Java’s biggest mistake**

- Checked exception의 의도는 플래그를 지정하고 개발자가 가능한 예외를 처리하도록 강제하는 것이다.
    - Checked exception은 메서드 시그니처에서 선언하거나 직접 처리해야한다.
- 소프트웨어 안정성 및 복원력을 장려하기 위한 것이다.
    - 예측 가능한 결과인 우발적인 상황에서 ‘복구’ 하려는 의도가 있다.
    - 하지만 ‘복구’가 실제를 무엇을 수반하는지에 대한 명확성이 부족했다.

### 단점

- 런타임 예외랑 Checked 예외는 기능적으로 동일하다.
- Checked exception을 반대하는 의견의 큰 주장은 대부분의 예외는 복원할 수 없다는 점이다.
    - 우리는 에러가 발생한 코드나 서브 시스템을 소유하지 않고 구현을 볼수도 알 책임도 없다는 것 이다.
    - 수정 가능한 비상 사태를 식별하는 것이 아니라 수정이 불가능한 시스템 신뢰성 문제를 계속해서 선언해야 하는것이다.
    - 예외를 던지는 것은 모든 하위 메서드, 호출 트리에 누적이 된다.
        - EJB 개발자는 이것을 경험했다. 선언된 예외외에 다른 예외가 있는 메서드를 호출하려면 수십 개의 메서드를 조정해야 햇다.
        - 기능하지 않는 catch-throw 블록의 엄청난 수(프로젝트 당 2000개 이상)이 필요하게 되었다.
        - 예외 삼키기 ,원인 숨기기, 이중 로깅, 초기화되지 않는 데이터 반환이 만연해졌고 잘못된 코드가 성행했다.
        - 결국 개발자들은 이러한 기능하지 않는 catch 블록에 대해 반란을 일으켰다.
- 자바 8의 함수형 인터페이스도 checked exception을 선언하지 않는다. java의 변경된 방향성을 거기서 요약할 수 있다.

[why does transaction roll back on RuntimeException but not SQLException](https://stackoverflow.com/questions/7125837/why-does-transaction-roll-back-on-runtimeexception-but-not-sqlexception)

[Checked exceptions: Java's biggest mistake](https://literatejava.com/exceptions/checked-exceptions-javas-biggest-mistake/)

[Checked Exceptions are Evil](https://phauer.com/2015/checked-exceptions-are-evil/)

# Conclusion

자바의 예외는 이전 언어에 비해 안정성 및 오류 처리면에서 장점이 있었습니다. checked exception은 ‘실패’가 아닌 ‘우발적인 상황’을 처리하려는 시도였습니다. 예측가능한 예외를 강조하고 개발자가 이를 처리하게 하는 것이었습니다.

하지만 광범위한 시스템과 복구 불가능한 실패를 강제로 선언하는 것에 대해서는 생각을 하지 못했습니다. 이러한 실패는 checked exception으로 선언될 수 없었습니다.

실패는 일반적인 코드에서 가능하며 EJB, Swing/AWT 컨테이너는 가장 바깥쪽에서 예외 핸들러를 두어 이를 처리했습니다. 트랜잭션을 롤백하고 오류를 반환하는 것이었습니다. 

Spring, Hibernate 등의 자바 프레임워크/벤더는 런타임 예외만 사용합니다. Josh Bloch(Java Collections 프레임워크), Rod Johnson, Anders Hejlsberg(C#의 아버지), Gavin King 및 Stephen Coebourn(JodaTime)과 같은 인물은 모두 checked 예외에 반대했습니다.

java 8 이후에서는 람다는 앞으로의 근본적인 단계이다. 이러한 기능은 내부의 기능적 작업에서 ‘제어 흐름’을 추상화 한다. checked 예외와 ‘즉시 선언 또는 처리’에 대한 요구 사항을 무용지물로 만든다.

# Reference

[2절 체크 예외(checked exception)만 던지세요](https://www.notion.so/2-checked-exception-986904e4b2e94890aa1db21adfdac720) 

[4장 예외](https://www.notion.so/4-853f6eba4f7e46b3a747b8b7d89d177f) 

[TIL/Kotlin Checked Exception 처리.md at main · eastperson/TIL](https://github.com/eastperson/TIL/blob/main/Kotlin/Kotlin%20Checked%20Exception%20%EC%B2%98%EB%A6%AC.md)

[Checked Exception vs Unchecked Exception](https://velog.io/@osy7207/Checked-Exception-vs-Unchecked-Exception)

[Spring Transaction Exception 상황에서 Rollback 처리하기](https://interconnection.tistory.com/122)

[Java에서 Checked Exception은 언제 써야 하는가?](https://blog.benelog.net/1901121)
