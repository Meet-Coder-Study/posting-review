코틀린과 스프링을 같이 쓰게 되면 거의 junit5를 사용을 한다. 하지만, Kotest라는 테스트 프레임워크가 인기가 높아지고 있어 요번에 kotest란 무엇인가부터 시작하여, 명세 스타일, 매처, 익셉션에 대해서 알아보았다.

  

### Kotest에 대한 여행을 떠나보자.

## Kotest 란?

-   코틀린을 위한 오픈 소스 테스트 프레임워크이다.
-   multi-plaform test framework로 Test-framework, Assertions Library, Property Testing을 독립적으로 사용할 수 있다.

## Kotest의 명세 스타일

Kotest는 여러 명세 스타일이 있습니다. 이러한 명세 스타일은 Kotest에 대한 부분도 있고, 여러 언어에 맞춘 테스트 스타일도 제공을 해줍니다.

[Fun       Spec](https://kotest.io/docs/framework/testing-styles.html#fun-spec)     : ScalaTest
      [Describe    Spec](https://kotest.io/docs/framework/testing-styles.html#describe-spec)    : Javascript frameworks and RSpec
      [Should    Spec](https://kotest.io/docs/framework/testing-styles.html#should-spec)    : A Kotest original
      [String    Spec](https://kotest.io/docs/framework/testing-styles.html#string-spec):    A Kotest original
      [Behavior    Spec](https://kotest.io/docs/framework/testing-styles.html#behavior-spec):    BDD frameworks
      [Free    Spec](https://kotest.io/docs/framework/testing-styles.html#free-spec):    ScalaTest
      [Word    Spec](https://kotest.io/docs/framework/testing-styles.html#word-spec):    ScalaTest
      [Feature    Spec](https://kotest.io/docs/framework/testing-styles.html#feature-spec):    Cucumber
      [Expect    Spec](https://kotest.io/docs/framework/testing-styles.html#expect-spec):    A Kotest original
      [Annotation    Spec](https://kotest.io/docs/framework/testing-styles.html#annotation-spec):    JUnit

이러한 명세 스타일을 사용하기 위해서는 클래스에서 상속받아 사용을  해야 합니다.  요번 포스팅에서는 Kotest Original인 String Spec, Should Spec, Expect Spec, Behavior Spec, Annotation Spece에 대해서만 설명하도록 하겠습니다.

### 1. StringSpec

![](https://blog.kakaocdn.net/dn/bBy4mQ/btrzv4usWeI/Y4EVS0PtAU0OAc9PyqIjak/img.png)

StringSpec 스타일은 StringSpec을 상속받아 사용이 가능하다.

StringSpec은 설명이 들어가 있는 문자열 뒤에 람다를 추가해서 개별 테스트를 작성한다.

![](https://blog.kakaocdn.net/dn/bx081Q/btrzxwjdQSy/BA2kqmq8kiEW14k24ybadk/img.png)

### 2. ShouldSpec

![](https://blog.kakaocdn.net/dn/deXWOt/btrzwkYdaFY/rc9bGoB6flK1XbHYuVum1K/img.png)

ShouldSpec은 문맥 블록을 그룹 짓는 데 사용하고, 말단에 테스트 블록을 추가한다. 테스트를 설명하는 문자열에 대해서 context()을 호출하면 되고, 테스트 블록 자체는 should() 함수 호출로 정의하면 된다.

![](https://blog.kakaocdn.net/dn/kA3lL/btrzuVSWV7T/RGAFmVrhnCjeiCFwKkkZU1/img.png)

### 3. ExpectSpec

![](https://blog.kakaocdn.net/dn/ya4eU/btrzw9hxV8M/VAmWAaxe56k4LyPYZ0kgC0/img.png)

ExpectSpec은 context()를 통하여 계층을 표현할 수 있다. 계층을 표현하고 그 테스트 코드는 모두 expect()를 사용하여 테스트 코드를 짤 수 있다. expect()는 ShouldSpec의 should()와 같다고 생각하면 된다.

> ExpectSpec()과 ShouldSpec()의 구조는  같아 보인다.  문맥 차이가 아닐까?  기대하는  것과  해야만 하는  것?

![](https://blog.kakaocdn.net/dn/bmUER8/btrzvAHdzzF/1NJEzHueR4KtDyywlBSCi0/img.png)

### 4. BehaviorSpec

BehaviorSpec은 BDD(행동 주도 개발)을 뜻한다.  **given() / Given(), `when`(), When(), then()/Then()**이라는 함수로 구분되는 세 가지 수준으로 제공한다.

![](https://blog.kakaocdn.net/dn/00OQP/btrzvbVvlWX/wEYTGmiKkxROaoFiNx4QMK/img.png)

![](https://blog.kakaocdn.net/dn/xlAkF/btrzwRBvm0t/cvEJlxatKxh28UIOUC1hYK/img.png)

### 5. AnnotationSpec

DSL과 같은 테스트 명세를 사용하지 않고 테스트 클래스 메서드에 붙인 @Test  애너테이션에  의존한다. Junit과 비슷함.

![](https://blog.kakaocdn.net/dn/kYhGG/btrzvwSBV7a/KODgGA153OKyYWEDTLZrq1/img.png)

![](https://blog.kakaocdn.net/dn/bb4l5G/btrzvLPzE4U/iLDnfiW8dwmYntDZ8HZrck/img.png)

## Kotest의 Matcher

테스트에 대한 결과를 확인하기 위하여 Kotest는 Matcher라는 것을 지원한다. 지금까지 써왔던 shouldBe도 Matcher의 한 종류이다. Matcher는 일반 함수 호출이나 중위 연사자 형태로 사용할 수 있는 확장 함수로 정의된다.

  

Matcher의 종류는 생각보다 많기 때문에 공식문서에서 찾아서 사용하길 바란다.

[https://kotest.io/docs/assertions/core-matchers.html](https://kotest.io/docs/assertions/core-matchers.html)

[](https://kotest.io/docs/assertions/core-matchers.html)

Core Matchers | Kotest

Matchers provided by the kotest-assertions-core module.

kotest.io

## Kotest의 인스펙터

컬렉션 함수에 대한 확장 함수로, 그룹에 대해 테스트할 경우 사용이 된다.

forAll() / forNone() : 모든 원소가 만족하는지, 만족하지 않는지 테스트한다.
forExactly(n) : 정확히 n개의 원소가 만족하는지 검사한다.
forAtLeast(n)/forAtMost(n) : 최소 n개를 만족하는지, 최대 n개를 만족하는지  테스트한다.
forSome() : 만족하는 원소가 존재하는지 검사하고, 모든 원소가 만족하지 않음을 검사한다.

  

## Kotest의 예외처리

shouldThrow()를 통하여 예외처리를 할 수가 있다.

![](https://blog.kakaocdn.net/dn/cE8k3A/btrzxyuKUkN/QT1aj3FCP7kXn7XXfoUaA0/img.png)

## 회고

Kotest에 대해서 알아봤는데, 확실히 기존에 테스트 코드를 junit5에서 작성했기 때문에, 테스트 코드가 대게 자바스러운 느낌이 조금씩 있었다.

Kotest로 테스트케이스를  몇 개  짜 보니깐  코틀린스러운  테스트 케이스가  만들어졌다. 다음 프로젝트에서는 코틀린 + 스프링 + Kotest를 통하여 진행을  해봐야 되겠다.

설마.. 테스트 모듈도  유행 타는  건 아니겠지..?
