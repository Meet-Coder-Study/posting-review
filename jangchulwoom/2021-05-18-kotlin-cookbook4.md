[코틀린 쿡북](http://www.yes24.com/Product/Goods/90452827)을 읽고, 인상 깊었던 내용을 정리한다.

> 책의 목차만 동일하며, 내용은 이해한대로 재구성한다.


들어가며, inline과 관련된 [kotlin in action](http://www.yes24.com/Product/Goods/55148593)의 8장의 내용을 먼저 이야기한다.

# 들어가며 - Higher-Order Function

Kotlin 은 Higher-Order Function (`이하 고차함수`)에 대하여, Inline keyword 를 지원한다.
고차함수란, 함수를 인자로 받거나, 함수를 반환하는 함수를 의미한다.

> kotlin 은 function이 first citizen 이기에 고차함수를 사용할 수 있다.

대표적인 고차함수가, stream/ sequence 에서 사용하는 `filter / map` 함수 이다.

```kotlin
public inline fun <T> Iterable<T>.filter(predicate: (T) -> Boolean): List<T> {
    return filterTo(ArrayList<T>(), predicate)
```

inline keyword 가 없는 고차 함수에 람다를 사용하면, `.class` 로 컴파일 될때 interface 의 함수안에 body가 구현한다.

```kotlin
/** A function that takes 0 arguments. */
public interface Function0<out R> : Function<R> {
    /** Invokes the function. */
    public operator fun invoke(): R
}
```

> argument 의 수에 따라, Function$N 이라는 이름의 Interface 로 대체된다.

즉, 고차함수를 사용할때마다, 익명 클래스의 객체가 생기고, 이는 overhead를 발생시킨다.

*여담*

lambda 함수도 Nullable 하게 설정할 수 있으며, safe call 을 사용 할 수 있다.

```kotlin
fun <T> T.printBoolean(predicate: ((T) -> Boolean)?) {
    print(predicate?.invoke(this))
}

// 구현 부 
@Test
fun filter() {
    "true".printBoolean { it.toBoolean() }
}
```

## 들어가며 - inline

*[inline keyword](https://kotlinlang.org/docs/inline-functions.html)*

고차 함수 사용 시, Overhead 를 막기 위해, kotlin 에서는 inline 이라는 keyword 를 지원한다.
function 선언 부에 inline modifier 를 추가하면, compile 시 함수 호출 코드를 구현으로 대체한다.

또한 inline keyword function 뿐 아니라 함수의 인자로 넘어오는 람다도 inline 취급되는데, 넘어온 함수를 변수에 할당 할 경우 inline 으로 대체 할 수 없다.

> .class 코드에 함수 호출 부를 구현으로 바꾸는 방식이여서, 함수를 새로운 변수에 할당 할 경우, inline 을 할 수 없다.

```kotlin
inline fun <T, R> Array<out T>.foldNotInline(initial: R, operation: (acc: R, T) -> R): R {
    var accumulator = initial
    val function = operation // compile error 발생
    for (element in this) function(accumulator, element)
    return accumulator
}
```

> error

```
Illegal usage of inline-parameter 'operation' in 'public inline fun <T, R> Array<out T>.foldNotInline(initial: R, operation: (acc: R, T) -> R): R defined in cookbook.chap04 in file InlineTest.kt'. Add 'noinline' modifier to the parameter declaration
> Task :compileTestKotlin FAILED
```

위 예시 뿐 아니라, 넘어온 함수를 (inline이 아닌) 다른 함수의 paramter로 넘기는 방식도 마찬가지이다.

```kotlin
inline fun <T, R> Array<out T>.foldNotInline(initial: R, operation: (acc: R, T) -> R): R {
    var accumulator = initial
    for (element in this) {
        secondFunction(initial, element, operation) // compile error !!
    }

    return accumulator
}

fun <T, R> secondFunction(first: R, second: T, operation: (acc: R, T) -> R) = operation(first, second)
```

만약 inline 함수의 param 에 inline 을 제거하고 싶다면, `noinline` 을 붙이면 된다.

유사한 이유로, kotlin 의 Sequence 는 inline 으로 대체되지 않는다. 때문에 모든 collection 에 asSequence 를 붙이는건 피해야한다.

```kotlin
public fun <T, R> Sequence<T>.map(transform: (T) -> R): Sequence<R> {
    return TransformingSequence(this, transform)
}
```

> 지연 초기화를 위해, 중간 함수를 property 로 저장하기 때문에 inline 을 사용 할 수 없다.

## 들어가며 - non-local return

`non-local return` 이란 자신을 둘러싸고 있는 블록보다, 더 바깥에 있는 블록을 끝내는 것을 의미한다.

```kotlin
@Test
fun nonLocal(){
    listOf(1,4,7).forEach {
        if( it == 1){
            return
        }
    }
    println("안녕")
}
```

위 forEach 안에 있는 return 은 자기 자신의 블록이 아닌, nonLocal 함수 블록을 끝내버린다.

> 컴파일 시에 inline 으로 대체되기때문에 위 같은 처리가 가능하다.

만약 inline 함수가 아니라면, 다른 변수에 저장되거나 함수의 return 으로 사용될 수 있기 때문에, 위 같은 처리는 불가능하다.

```kotlin
@Test
fun nonLocalNotInline(){
    listOf(1,4,7).forEachNotInline {
        if( it == 1){
            return // compile error!! 'return' is not allowed here
        }
    }
    println("안녕")
}
```

만약 inline 이 아닌 함수를 return 하기 위해선, label 사용 해야한다. `return@forEachNotInline`
또한 아래처럼 label 이름을 지정 할 수 도 있다.
```kotlin
listOf(1,4,7).forEachNotInline label@{
            if( it == 1){
                return@label
            }
        }
```

> non-local 과 구분하기 위함


위 label 이 불필요해보인다면, 무명 함수를 사용하여, local return 을 사용 할 수 있다.

```kotlin
@Test
fun nonLocalNotInlineFun(){
    listOf(1,4,7).forEachNotInline(fun(it:Int){
        if( it == 1){
            return
        }
    })
    println("안녕") // 출력된다 !
}
```


## 4.1 알고리즘에서 fold 사용하기

fold 함수를 사용하여, Collection / Sequence를 하나의 값으로 축약(`reduce`)시킨다. 함수의 구현은 아래와 같다.

```kotlin
public inline fun <T, R> Iterable<T>.fold(initial: R, operation: (acc: R, T) -> R): R {
    var accumulator = initial
    for (element in this) accumulator = operation(accumulator, element)
    return accumulator
}
```

초기값을 하나 받아(`initial: R`), 초기값과 Iterable 의 원소로 함수를 실행시키는 형태(`(acc: R, T) -> R`)이다. fold 함수의 대표적인 예제는 sum 연산이다.

```kotlin
@Test
fun fold() {
    val list = listOf(1, 5, 7, 9)

    val sum = list.fold(0) { init, element -> init + element }

    assertEquals(sum, 22)
    assertEquals(sum, sum(*list.toIntArray()))
}
fun sum(vararg nums: Int) =
    nums.fold(0) { acc, n -> acc + n }
```

*여담으로..*

argumentParam 으로 `vararg` 를 받는 경우, spread 연산을 사용할 수 있다. (`*ArrayVariable`)
단, Kotlin 에서 spread 연산은 array 만 지원한다.

collection spread에 대해, [이슈](https://youtrack.jetbrains.com/issue/KT-12663)로 등록은 되어있으나, 아직 미지원

fold는 factorial 에서 더 재밌게(?) 표현된다.

> 일반 Factorial

```kotlin
fun recursiveFactorial(n: Long): BigInteger =
    when (n) {
        0L, 1L -> BigInteger.ONE
        else -> BigInteger.valueOf(n) * recursiveFactorial(n - 1)
    }
```

> fold 를 사용한 factorial

```kotlin
fun recursiveFactorialFold(n: Long): BigInteger =
    when (n) {
        0L, 1L -> BigInteger.ONE
        else -> (2..n).fold(BigInteger.ONE) { init, acc -> init * BigInteger.valueOf(acc) }
    }
```

> 피보나치

```kotlin
fun fibonarcciFold(n: Int) =
    (2 until n).fold(1 to 1) { pair, _ ->
        pair.second to (pair.first + pair.second)
    }.second
```

위 피보나치는 acc 값을 고려하지 않기때문에 `_`을 사용했다. 흥미로운 점은 누적 값의 타입이 범위의 원소 타입과 다르다는 것이다.
`원소 타입은 Int, 누적 값은 Pair이다.`

## 4.2 reduce 함수를 사용해 축약하기

reduce는 fold 와 동일한 목적으로 사용되는데, 두 함수의 큰 차이점은 초기 값 인자가 없다는 점이다.

reduce 의 구현은 아래와 같다.

```kotlin
public inline fun <S, T : S> Array<out T>.reduce(operation: (acc: S, T) -> S): S {
    if (isEmpty())
        throw UnsupportedOperationException("Empty array can't be reduced.")
    var accumulator: S = this[0]
    for (index in 1..lastIndex) {
        accumulator = operation(accumulator, this[index])
    }
    return accumulator
}
```

fold와는 다르게, 첫번째 인자를 초기값으로 할당하여, 인자로 전달된 람다를 실행시키는 구조이다.

> 사용 예시

```kotlin
@Test
fun reduce() {
    val result = arrayOf(1, 4, 8).reduce { acc, item ->
        acc * item
    }
    assertEquals(32, result)
}
```

> 그렇다면, 인자가 2개인 fold 보단 reduce 를 쓰는게 더 편하지 않을까?

reduce는 parameter로 넘겨진 lambda가 첫번째 인자에 대해서는 수행되지 않는다.

각각의 입력 값을 2배로 곱한 합을 reduce로 구현해보자.

```kotlin
@Test
fun reduce_badCase() {
    val result = arrayOf(1, 3, 7).reduce { acc, item ->
        acc + (2 * item)
    }
    assertEquals(21, result)
}
```

사용자의 기대는, 1 / 3 / 7 을 2배로 곱한 값들의 합을 구하는 것이지만, 첫번째 item 이 초기값으로 할당 됨으로 로직에선 제외된다.

> 첫번째 item에 추가 연산이 필요 없을때만 reduce 를 사용해라.

*여담으로* java 에서는 overload를 이용하여, reduce 를 제공한다. (fold / reduce 구분하지 않는다.)

## 4.3 꼬리 재귀 적용하기

tailrec 이라는 keyword 를 붙이면, compiler 가 재귀 함수를 반복 문으로 변경한다.

> 사용할 일이 극히 드믈거 같아, 정리하진 않는다.