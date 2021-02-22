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


