# Java 개발자가 배우는 Kotlin - Functional Interface

Java에는 Functional Interface라는 개념이 있다. 바로 1개의 함수만을 갖는 인터페이스를 의미한다.

```java
@FunctionalInterface
public interface Function<T, R> {

    R apply(T t);

    default <V> Function<V, R> compose(Function<? super V, ? extends T> before) {
        Objects.requireNonNull(before);
        return (V v) -> apply(before.apply(v));
    }

    default <V> Function<T, V> andThen(Function<? super R, ? extends V> after) {
        Objects.requireNonNull(after);
        return (T t) -> after.apply(apply(t));
    }

    static <T> Function<T, T> identity() {
        return t -> t;
    }
}
```

Function은 비구현된 함수 apply 1개만 존재하므로 Functional Interface로 사용가능하다. 때문에 Function의 구현은 람다 표현식으로 대체될 수 있다.

```java
Function<Integer, Integer> multiple = x -> x * 2
```

위와 같이 Integer 인자를 1개 받아 2배로 곱해서 반환하는 함수를 람다를 통해 즉석 구현할 수 있다.

## SAM 컨벤션

> SAM은 Single Abstract Method의 약자로 1개의 추상 메서드를 의미

Java와 마찬가지로 Kotlin에서도 인터페이스에 abstract 메서드가 하나밖에 없는 경우 인터페이스를 구현 클래스를 따로 정의할 필요 없이 구현할 수 있다.

단, Java 같이 바로 람다로 정의할 수는 없다.

```kotlin
val multiple: Function<Int, Int> = (x) -> x * 2 
```

만약 바로 구현이 필요하다면 다음과 같이 구현해야한다.

```kotlin
val multiple = Function<Int, Int> { it * 2 }
```

즉, Function SAM을 생성한다는 느낌으로 Kotlin에서는 문법을 잡은걸로 보인다.

### fun interface

Kotlin에서는 `@FunctionInterface`와 같이 어노테이션 기반으로 함수형 인터페이스를 지정하는 게 아니라 언어 자체에 기능을 내제화했다. `fun` 키워드를 인터페이스에 붙이는 방식으로 가능하다.

```kotlin
fun interface Printer {
    fun print() 
}
```

위 Printer는 fun 키워드를 붙여 함수형 인터페이스로 정의되었다. 따라서 다음과 같이 람다 형태로 사용이 가능하다.

```kotlin
fun printFromPrinter(printer: Printer) {
    printer.print()
}

printFromPrinter { println("Hello, SAM!") }
```

만약 Printer에 `fun`을 붙이지 않는다면 함수형 인터페이스로 취급되지 않기 떄문에 람다식으로 사용할 수 없고 인터페이스를 구현하는 형태로 사용해야한다.

```kotlin
interface Printer {
    fun print() 
}

printFromPrinter(object : Printer {
    override fun print() {
        println("Hello, world!")
    }
})
```

> 참고로 Kotlin에서는 익명 클래스를 구현할 때 `object` 키워드를 앞에 명시해야한다.

Java에서는 `@FunctionalInterface`가 없어도 암묵적으로 1개의 메서드만 있는 인터페이스는 함수형 인터페이스로 취급되지만 Kotlin은 그렇지 못하다.
