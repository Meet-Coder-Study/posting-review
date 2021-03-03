# Lazy Evaluation

## lazy evaluation에서 evaluation이란?

lazy evaluation에서 lazy는 `느긋한, 게으른`이라는 뜻이다.

**evaluation**은 한글로 번역하면 `평가/판단` 이라는 뜻을 가진다.	

예를 들어 `3 + 5` 라는 표현식이 있을 때 **컴퓨터의 입장**에서는 저 표현식이 무엇을 의미하는지 **판단**할 것이다.

그리고 그 결과로 8이라는 값을 도출해 낼 것이다. evaluation이란 이처럼 컴퓨터가 해당 식이나 값을 판단하는 것을 뜻하고
간단하게 말하면 `연산`한다고 할 수 있다.

## 그렇다면 lazy evaluation이란 무엇일까?

보통 lazy evaluation을 검색하면 이러한 설명이 나온다. 

`마지막까지 결과를 보고 난 후 연산을 수행하는 것`,  `연산의 수행을 최대한 늦추는 것`

틀린말은 아니지만 확 와닿는 표현은 아니다. 이러한 설명은 어떨까?

`필요 없는 것은 연산하지 않는 것`

개인적으로 이 설명이 lazy evaluation을 가장 간단하면서도 명확하게 표현한다고 생각한다.

## 필요 없는 것은 연산하지 않는 것

필요 없는데도 연산하는 경우가 있나? 라고 생각할 수 도 있다. 있다! 그것도 매우 흔하다.

다음의 코드를 살펴보자.

```java
    public static void main(String[] args) {
        final int number = 4;
        final boolean computeResult = compute(number);
        final boolean processResult = process(number);
     if ( computeResult && processResult) {
            System.out.println("true");
        } else {
            System.out.println("false");
        }
    }

    public static boolean compute(int number) {
        System.out.println("computing number : " + number);
        // 복잡한 계산...
        return false;
    }

    public static boolean process(int number) {
        System.out.println("process number : " + number);
        // 복잡한 계산
        return false;
    }
```

이를 실행한 결과는 다음과 같다.
```java
computing number : 4
process number : 4
false
```

`(computeResult && processResult)` 는 둘 중 하나만 false여도 값이 결정되기 때문에 나머지 값은 연산할 필요가 없다.

하지만 이 코드에서는 computeResult와 processResult를 선언할 때 각각의 연산을 수행고 있다.

즉 `필요 없는데도 불구하고 연산`하는 것이다.


이는 다음과 같이 간단히 변경될 수 있다.

```java
    public static void main(String[] args) {
        final int number = 4;
        if ( compute(number) && process(number)) {
            System.out.println("true");
        } else {
            System.out.println("false");
        }
    }
```

이를 실행한 결과는 다음과 같다.

```java
computing number : 4
false
```
compute메서드가 실행되면 process의 결과는 필요 없기 때문에 실행되지 않는다.

그렇다면 첫번째의 예제와 같이 필요가 없는데도 실행하는 이유는 무엇일까?

여러 이유가 있겠지만 이 경우에는 가독성 때문일 것이다. if의 조건문을 더 명확하게 표현하려면 연산을 변수안에 담는 것이 깔끔하다.

특히 메소드 이름이 길고, 매개변수가 많을 경우 더더욱 가독성이 떨어진다.

## lambda를 활용한 lazy evaluation

이런 경우 람다를 이용하여 이를 해결할 수 있다. 람다는 기본적은 lazy 하게 작동한다.

아래의 예를 살펴보자.
```java
public class LazyCodeExample {
    public static void main(String args[]) {
        final int number = 4;
        final Supplier<Boolean> computeResult = () -> compute(number);
        final Supplier<Boolean> processResult = () -> process(number);
        if (computeResult.get() && processResult.get()) {
            System.out.println("TRUE");
        } else {
            System.out.println("FALSE");
        }
    }
    public static boolean compute(final int number) {
        System.out.println("computing number : " + number);
        return false;
    }
    public static boolean process(final int number) {
        System.out.println("processing number : " + number);
        return false;
    }
}
```
위의 예에서 computeResult에는 람다 표현식이 할당되어 있다. 즉, 실제로  computeResult가 나타내는 것은 함수의 실행이 아닌

Supplier라는 함수형 인터페이스이다. 이 부분에서는 함수가 실행되는 것이 아니라 선언만 되어 있다.

그리고 실제로 다음이 호출되면 함수가 실행되는 것이다.
```java
computeResult.get()
```
이와 같은 원리로 람다를 통해 lazy evaluation을 구현할 수 있고, 이는 Stream이 Lazy하게 작동하게 한다.

## (번외) 스프링의 Lazy Loading

스프링에는 레이지 로딩이라는 개념이 있다. 용어는 조금 다르지만 결국 같은 의도를 같고 있다.

`
필요하지 않으면 수행하지 않는다.
`

스프링에서는 그 대상이 Bean이 된다. 스프링은 기본적으로 컨테이너가 Bean을 미리 생성해놓고 관리한다.

하지만 미리 생성한 빈이 사용되지 않는다면? 자원의 낭비가 될 것이다.

이를 대비한 전략이 레이지 로딩이고, @Lazy 어노테이션을 선언하게 간편하게 레이지 로딩을 구현할 수 있다.

```java
@Component
@Lazy
public class Lazy {
    //...   
}
```
해당 빈이 사용될 때 로딩된다.

