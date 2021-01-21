# 고차 함수 `higher order function`

명령형 언어에서 문제를 해결할 때 상태를 변경하거나 반복문을 사용하여 단계별로 정의한다. 반면 함수형 언어에서는 문제 해결을 위해서 반드시 고차함수를 사용한다.

함수형 프로그래밍에서는 다음 두 조건 중 하나를 만족하는 함수를 고차함수 `higher order function`라고 한다.

- 함수를 매개변수로 받는 함수
- 함수를 반환하는 함수

```kotlin
// 함수를 인자로 받는 함수
fun argumentFunction(func: () -> Int): String {
   return func().toString()
}

// 함수를 반환하는 함수
fun returnFunction(): (a: Int) -> Int {
	 return { it * 2 }
}
```

이런 고차함수는 코드의 재사용성을 높여주고 기능 확장을 도와준다.

```kotlin
@ParameterizedTest
@MethodSource("higherOrderFunction")
@DisplayName("고차함수의 재사용성")
internal fun higherOrderFunction(func: (Int, Int) -> Int, x: Int, y: Int, expected: Int) {
    // given
    fun higherOrder(operation: (Int, Int) -> Int, x: Int, y: Int): Int {
        return operation(x, y)
    }

    // when
    val actual = higherOrder(func, x, y)

    // then
    assertThat(actual).isEqualTo(expected)
}

private companion object TestParams {
    val plus: (Int, Int) -> Int = { x, y -> x + y }
    val minus: (Int, Int) -> Int = { x, y -> x - y }
    val multiple: (Int, Int) -> Int = { x, y -> x * y }
    val divide: (Int, Int) -> Int = { x, y -> x / y }

    @JvmStatic
    fun higherOrderFunction() = listOf(
        Arguments { arrayOf(plus, 1, 2, 3) },
        Arguments { arrayOf(minus, 2, 1, 1) },
        Arguments { arrayOf(multiple, 2, 2, 4) },
        Arguments { arrayOf(divide, 4, 2, 2) }
    )
}
```

다음과 같이 고차함수 `higherOrder`를 사용하면 하나의 시그니처를 가지고 인자로 전달하는 함수를 다르게 하여 다양한 기능을 구현할 수 있다.

또한 기능의 확장도 쉽게 할 수 있다. 만약 두 수의 합의 제곱 기능을 구현해야한다면 고차함수의 인자로 합의 제곱을 계산하는 함수를 전달하면 된다.

```kotlin
fun higherOrder(operation: (Int, Int) -> Int, x: Int, y: Int): Int {
    return operation(x, y)
}

val plusAndPower: (Int, Int) -> Double = { x, y -> (x + y).toDouble().pow(2) }

higherOrder(plusAndOrder, 1, 2) // 9.0
```

만약 각 기능을 명령형 언어로 구현한다면 각 기능하다 함수 시그너처를 구현해야한다. 기능 추가 또한 추가 시그니처를 개발해야한다.

```kotlin
fun add(x: Int, y: Int) = x + y
fun minus(x: Int, y: Int) = x - y
fun multiple(x: Int, y: Int) = x * y
fun divide(x: Int, y: Int) = x / y
```

## 부분 함수

입력값이 특정한 범위 내에 있을때만 함수를 실행하고 싶을때가 있다. 함수형 언어에서는 이를 부분 함수를 통해 구현할 수 있다. Kotlin에서 언어 차원에서 지원하지는 않는다. 다음과 같이 PartialFunction을 구현하여 부분함수를 사용할 수 있다.

```kotlin
class PartialFunction<in P, out R>(
    private val condition: (P) -> Boolean,
    private val func: (P) -> R
): (P) -> R {
    override fun invoke(p1: P): R = when {
        condition(p1) -> func(p1)
        else -> throw IllegalArgumentException("${p1}은 허용되지 않은 값입니다.")
    }
}
```

클래스 PartialFunction은 조건을 체크하는 `condition` 람다와 실제 로직이 들어있는 `func` 람다 필드가 존재한다. 다음과 같이 `condition`과 `func`을 인자로 전달하여 사용할 수 있다.

```kotlin
@ParameterizedTest
@MethodSource("partialFunction")
@DisplayName("부분함수 테스트")
internal fun partialFunction(n: Int, expected: Int) {
    // given
    val condition: (Int) -> Boolean = { it in 1..10 }
    val func: (Int) -> Int = { it * it }

    val power: PartialFunction<Int, Int> = PartialFunction(condition, func)

    // when
    val actual = power(n)

    // then
    assertThat(actual).isEqualTo(expected)
}

private companion object TestParams {
    @JvmStatic
    fun partialFunction() = listOf(
        Arguments { arrayOf(1, 1) },
        Arguments { arrayOf(2, 4) },
        Arguments { arrayOf(3, 9) },
        Arguments { arrayOf(4, 16) },
        Arguments { arrayOf(5, 25) },
        Arguments { arrayOf(6, 36) },
        Arguments { arrayOf(7, 49) },
        Arguments { arrayOf(8, 64) },
        Arguments { arrayOf(9, 81) },
        Arguments { arrayOf(10, 100) }
    )
}
```

0 이하, 11 이상의 값이 들어가면 `IllegalArgumentException`이 발생한다.

> 참고로 위 `partialFunction` 테스트에서 PartialFunction의 인스턴스 power를 메서드처럼 활용하고 있다.
이는 `PartialFunction` 클래스가 invoke를 재정의`override`하기 때문이다. Kotlin에서는 클래스의 `invoke` 함수를 이름 없이 호출할 수 있다.

이를 Java로도 비슷하게 구현할 수 있다.

```java
public class PartialFunc<T, R> {
    private final Predicate<T> condition;
    private final Function<T, R> func;

    public PartialFunc(Predicate<T> condition, Function<T, R> func) {
        this.condition = condition;
        this.func = func;
    }

    public R invoke(T t) {
        if (condition.test(t)) {
            return func.apply(t);
        }

        throw new IllegalArgumentException();
    }
}
```

Java에서는 언어차원에서 함수형 인터페이스에 대해서는 람다문법을 허용한다.
Java 표준 라이브러리에서 제공하는 `Predicate`, `Function`을 사용하여 부분함수를 구현할 수 있다.

```java
@ParameterizedTest
@MethodSource
@DisplayName("[Java] 부분함수 테스트")
void partialFunction(int n, int expected) {
    // given
    Predicate<Integer> condition = (i) -> 1 <= i && i <= 10;
    Function<Integer, Integer> func = (i) -> i * i;

    PartialFunc<Integer, Integer> partialFunction = new PartialFunc<>(condition, func);

    // when
    int actual = partialFunction.invoke(n);

    // then
    assertThat(actual).isEqualTo(expected);
}

private static Stream<Arguments> partialFunction() {
    return Stream.of(
            Arguments.of(1, 1),
            Arguments.of(2, 4),
            Arguments.of(3, 9),
            Arguments.of(4, 16),
            Arguments.of(5, 25),
            Arguments.of(6, 36),
            Arguments.of(7, 49),
            Arguments.of(8, 64),
            Arguments.of(9, 81),
            Arguments.of(10, 100)
    );
}
```

확실히 사용했을때 Kotlin보다는 함수적으로 처리된다는 느낌이 안든다. 또한 언어 차원에서 부분적으로 람다를 지원하기 때문에 만약 표준라이브러리에서 제공하는 함수형 인터페이스 중 사용할만한게 없는 경우에는 커스텀해서 구현해줘야하는 불편함도 있다.

## 부분 적용 함수

> 부분 함수와 전혀 다릅니다.

함수는 기본적으로는 필요한 인자를 모두 전달하여 호출해야한다.

```java
private static int add(int x, int y) {
	return x + y;
}

add(1, 2); // OK
add(1) // compile error!
```

함수형 프로그래밍에서는 매개변수의 일부만 전달할 수 있고 아예 전달하지 않을수도 있다. 이렇게 매개변수의 일부분만 전달받았을때 제공받은 매개변수만 가지고 부분 적용 함수를 생성할 수 있다.

```kotlin
fun <P1, P2, R> ((P1, P2) -> R).partial(p1: P1): (P2) -> R {
    return { p2 -> this(p1, p2) }
}

fun <P1, P2, R> ((P1, P2) -> R).backPartial(p2: P2): (P1) -> R {
    return { p1 -> this(p1, p2) }
}
```

부분적용함수를 만들어주는 확장함수이며 위 코드는 2개의 인자만 받아 리턴하는 람다를 부분적용함수로 바꾸는 함수들이다.

```kotlin
@Test
@DisplayName("부분 적용 함수")
internal fun partialAppliedFunction() {
    // given
    val stringAdd: (String, String) -> String = { str1, str2 -> str1 + str2 }
    val partialHello: (String) -> String = stringAdd.partial("hello")

		// when
    val actual1 = partialHello(" world")
    val actual2 = partialHello(" pkch")

    // then
    assertThat(actual1).isEqualTo("hello world")
    assertThat(actual2).isEqualTo("hello pkch")
}
```

위 `stringAdd`는 두 문자열을 합하는 람다이다. `stringAdd`를 가지고 `partial`로 부분적용함수를 만든다. 이때 `hello` 문자열을 input으로 줬으니 `partialHello`에는 `str1`의 값으로 `hello`가 적용된 상태인 것이다. 따라서 `partialHello` 부분적용함수를 통해 다양한 문자열을 생성할 수 있다.

이렇게 코드를 재사용하는데에도 부분적용함수를 사용할 수 있지만 커링 함수를 만들때도 필요하다.

> 참고로 함수형 프로그래밍 관련 글에는 `함수에 어떤 값을 적용했다` 라는 표현을 종종 볼 수 있다. 이때 `적용했다`는 어떤 값을 함수의 매개변수로 넣는다를 의미한다. 즉, 실제 호출이 일어나 결과를 받는다는 의미가 아니다.

## 커링

커링은 여러 매개변수를 받는 함수를 분리하여 단일 매개변수를 받는 부분적용함수의 체인으로 만드는 기법이다.

```kotlin
fun add(x: Int, y: Int, z: Int) = x + y + z

add(1, 2, 3) // 6
```

위 `add`는 우리가 흔히 아는 함수이다. 세 인자를 받아 결과값 하나를 반환한다. 이를 커링함수로 바꿔본다.

```kotlin
fun add(x: Int): (Int) -> (Int) -> Int {
	return { y -> { z -> x + y + z } }
}
```

위 `add` 함수는 함수를 반환한다. 즉, 부분 적용 함수 형태로 나눠서 반환하게 된다.

```kotlin
@Test
@DisplayName("커링 함수")
internal fun currying() {
    // given
    val plusThree = add(1)(2)

    // when
    val actual1 = plusThree(3)
    val actual2 = plusThree(5)

    // then
    assertThat(actual1).isEqualTo(6);
    assertThat(actual2).isEqualTo(8);
}
```

이렇게 커링을 사용하게 되면 최종 마지막 호출이 이뤄지기 전까지는 함수의 실행을 늦출 수 있다. 따라서 `plusThree`는 아직 실행된 상태가 아니다. 또한 이전에 적용한 인자를 재사용할 수 있다. 때문에 위 테스트 코드에서 `plusThree`를 활용하여 3과 5를 더한 것을 볼 수 있다.

> 흔히 커링의 대표적인 구현체가 `redux`라고 말한다.

## 합성 함수

합성 함수는 함수를 매개변수로 받고 함수를 반환할 수 있는 고차 함수를 활용하여 두 개의 함수를 결합하는 것을 의미한다. 수학에서는 다음과 같이 합성 함수를 표현한다.

```
(fｏg)(x) = f(g(x))
```

즉, 위 표현으로는 g 함수가 매개변수 x를 받아 실행한 결과를 f 함수가 받아 호출한 결과와 같다고 할 수 있다.

```kotlin
val plusThree = { i -> i + 3 }
val plusFive = { i -> i + 5 }

val composed = { i -> plusThree(plusFive(i)) }

composed(1) // 9

```

## 합성 함수 일반화

따로 Kotlin에서는 합성 함수로 변환하는 작업을 언어차원에서 지원하지는 않는다. 따라서 이를 도와주는 확장함수를 다음과 같이 정의할 수 있다.

```kotlin
infix fun <F, G, R> ((F) -> R).compose(g: (G) -> F): (G) -> R {
    return { f -> this(g(f)) }
}
```

> 참고로 infix 함수는 일반적으로 함수를 호출할때 사용하는 `.`, `()` 없이 호출할 수 있게 해준다.

```kotlin
@Test
@DisplayName("합성 함수")
internal fun composeFunction() {
    // given
    val plusThree: (Int) -> Int = { i -> i + 3 }
    val plusFive: (Int) -> Int = { i -> i + 5 }

    val composed = plusThree compose plusFive

    // when
    val actual = composed(1)

    // then
    assertThat(actual).isEqualTo(9)
}
```

infix 함수 compose를 활용하여 이전 예제와 같이 plusThree와 plusFive를 합성함수로 표현할 수 있다.