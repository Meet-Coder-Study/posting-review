# Java 개발자가 배우는 Kotlin - 동등성 비교

Kotlin에서 equals는 `==`로 동등성 비교를 할 때 동작한다.

```kotlin
val a = "a"
"a" == a // true
```

즉, 위 `"a" == a`에서 `String#equals`가 사용된다. Java에서 `==`는 객체의 경우 참조가 같은지를 비교하기 때문에 `"a" == a`는 false가 되는 반면 Kotlin에서는 equals가 호출되므로 true이다.

그러면 Kotlin에서 참조가 같은지 비교는 어떻게 할까? `===` 를 사용하면 된다.

```kotlin
val a = "a"
"a" === a // false
a === a // true
```

`===`는 참조가 같은지를 판단한다. Java의 `==`와 동일한 역할을 한다.

> 참조가 같은지 판단에 대해서는 “동일성” 비교라는 말로 표현한다.

## 참고

[Effective Kotlin Item 40. equals 규약을 지켜라](https://product.kyobobook.co.kr/detail/S000001033129)
