# kotlin Standard function

* kotlin 에는 @FunctionalInterface 와 유사한 편의 함수를 제공한다.
    * 확장함수로 구현되어 있으며, 모든 객체에서 사용 가능하다.
    * scope function 이라 불리며, 이 글에선 let, with, also, apply, run 만 정리한다.


## 들어가며

- kotlin 은 아래처럼 lambda 를 사용할 수 있다.

`{ s1: Int, s2: Int -> s1 + s2 }`

```kotlin
@Test
@DisplayName("(1) lambda")
fun lambda() {
    val first = 1
    val second = 2
    val expect = first + second

    val add = { s1: Int, s2: Int -> s1 + s2 }

    assertEquals(expect, add(first, second))
}
```

- lambda 의 인자가 1개일 경우, it keyword 로 축약 가능하다. `{it.multi()}`
- 다만, compiler 가 `it` 의 타입을 추론 할 수 있게, 최소한의 정보가 필요하다.


```kotlin
@Test
@DisplayName("(2) lambda shortcut")
fun sortLambda() {
    val num = 5
    val expect = 10
    val multiply: (number: Int) -> Int = { it.times(2) }

    val actual = multiply(num)

    assertEquals(expect, actual)
}
```

`val multiply: (number: Int) -> Int = { it.times(2) }`


- 함수의 마지막 parameter 가 lambda 로 표현 가능 할 경우, `{}` 로 넘겨줄 수 있다.

```kotlin
fun addSuffix(host: String, suffix: (str: String) -> String) = host + suffix(host)


@Test
@DisplayName("(3) lambda parameter")
fun lambdaParam() {
    val origin = "https://github.com"
    val suffix: (str: String) -> String = { "-$it" }

    // (1)
    val expect = origin + suffix(origin)

    val actual = addSuffix(origin, suffix)

    assertEquals(expect, actual)

    // (2) addSuffix 마지막 타입으로, compiler 가 it 유추 가능
    val actual2 = addSuffix(origin) { "-$it" }

    assertEquals(expect, actual2)
}
```

- koltin 에는 `확장 함수` 라는 개념이 존재한다.
    - 외부에서 Object Type 의 함수를 추가하는 개념

```kotlin
fun Any.toJson(): String = mapper.writeValueAsString(this)
```


## 들어가며 2..

- Kotlin 에서 function 은 first citizen 이다.
    - 함수를 변수에 할당 할 수 있다.
- `Literal` 은 소스 코드 내에 고정 값을 표현하는 표기법이다.
    - 변수에 값을 할당하는 표기법.


함수의 Literal 방법에는 2가지가 있음

- lambda 를 이용한 function literal
- 익명 함수를 이용한 function literal

```kotlin
val lambdaLiteral: (Int, Int) -> Int = { first: Int, second: Int -> first + second }

val anonymousLiteral = fun(x: Int, y: Int) = x + y
```

## 수신 객체 와 수신 객체 지정 람다 (Function Literals with Receiver)

* function literal 을 아래처럼 사용 할 수 있다.

```kotlin
val receiver = fun(receiverStr:String, block: String.() -> Int):Int {
    return block(receiverStr)
}
```

* parameter 로 확장 함수를 넘기는 형태
    * 위 처럼 사용할 경우 String 내부에 선언된 함수들을 it 키워드 없이 사용 할 수 있다.
    * 함수를 실행 시킬 객체를 `수신객체` 라 말한다.
    * 넘기는 람다를 `수신 객체 지정 람다` 라 말한다. `Function Literals with Receiver`

```kotlin
@Test
fun receiverBot() {
    val receiverInt = receiver("5") {
        // 수신객체가 아니였으면 it.toInt() 로 사용해야한다.
        toInt() 
    }

    assertEquals(5, receiverInt)
}
```

* 수신 객체 타입을 호출 할 경우, 첫번째 parameter 는 수신객체를 넣어줘야한다.
* 단, 확장 함수로 수신객체 타입을 사용할 경우, 자동으로 자기 자신이 paramter 로 넘어간다. (아래 코드 참고)

```kotlin
fun String.receiver(block: String.() -> Int):Int {
     // 본인의 함수를 호출 시엔 수신객체를 넘길 필요 없다.
     // 확장함수 내에서, 확장함수를 호출하는 느낌이기때문에 this.block() 으로 간주된다.
    return block()
}
```

이제부터 설명할 함수 `scope function` 들이 위 수신객체를 이용하여 구현되어 있다.

#### Let

```kotlin
@kotlin.internal.InlineOnly
public inline fun <T, R> T.let(block: (T) -> R): R
```

객체 자신을 인자로 사용하여, R 을 리턴하는 함수이다.

> 대표적으로 Null check(Elvis) 와 함께 사용된다.

```kotlin
@Test
fun let() {
    val number: Int? = null

    // number.times(2) // compile error

    val multi = number?.let {
        it.times(2)
    } ?: 0 
    // number?.times(2) ?: 0

    assertEquals(0, multi)
}
```

또한 변수의 가독성을 향상 시킬 목적으로, it 가 사용된다.

```kotlin
val numbers = listOf("one", "two", "three", "four")
val modifiedFirstItem = numbers.first().let { firstItem ->
    println("The first item of the list is '$firstItem'")
    if (firstItem.length >= 5) firstItem else "!" + firstItem + "!"
}.toUpperCase()
```

Java 의 Funtion.class 과 유사한 method signature.

#### with

```kotlin
public inline fun <T, R> with(receiver: T, block: T.() -> R): R
```

param으로 receiver 객체(`수신 객체`)를 전달 하고, 객체에게 시킬 함수를 전달한다.
람다 signature 에서 볼 수 있듯, `block: T.() -> R` 전달되는 함수는 수신 객체의 확장함수 타입으로 전달된다.

즉, 함수 내부에서 it를 keyword 를 쓰지 않고, 내부 property / function에 접근할 수 있다.

> this 가 수신 객체가 된다.

with 는 함수의 결과 없이, context 의 함수 / property 를 호출하려 할때 사용하거나 `with this object, do the following`
혹은, 함수 / property 를 계산하기 위한 helper object 용도로 사용 하는 것을 추천한다.

```kotlin
val numbers = mutableListOf("one", "two", "three")
with(numbers) {
    println("'with' is called with argument $this")
    println("It contains $size elements")
}

// helper
val numbers = mutableListOf("one", "two", "three")
val firstAndLast = with(numbers) {
    "The first element is ${first()}," +
    " the last element is ${last()}"
}
println(firstAndLast)
```


#### run

```kotlin
public inline fun <T, R> T.run(block: T.() -> R): R 
public inline fun <R> run(block: () -> R): R 
```
> run 은 with / let 과 유사하다.

주로 어떤 값을 계산할 필요가 있거나, 여러개의 지역 변수 범위를 제한 하고자 할때 사용한다.

```
val result = service.run {
    // with 처럼 수신 객체를 명시하진 않지만, this 로 사용가능
    port = 8080
    query(prepareRequest() + " to port $port")
}

// the same code written with let() function:
val letResult = service.let {
    it.port = 8080
    it.query(it.prepareRequest() + " to port ${it.port}")
}
```

> 함수의 선언과 차이가 없음

```kotlin
val hexNumberRegex = run {
    // 지역변수 제한 용도
    val digits = "0-9"
    val hexDigits = "A-Fa-f"
    val sign = "+-"

    Regex("[$sign]?[$digits$hexDigits]+")
}

for (match in hexNumberRegex.findAll("+1234 -FFFF not-a-number")) {
    println(match.value)
}
```

#### also

```kotlin
public inline fun <T> T.also(block: (T) -> Unit): T {
    contract {
        callsInPlace(block, InvocationKind.EXACTLY_ONCE)
    }
    block(this)
    return this
}
```

전달받은 람다(`반환값이 없는`)를 수행하고, `자기 자신`을 return 하는 함수이다.
수신 객체 지정 람다가 아니기때문에, this (`as a lambda receiver` ) keyword 생략이 불가능하다.

object 로 람다 함수를 수행시키기 위해 실행되며, object 의 함수 / property 보단 객체의 참조가 필요할때 사용된다.

> 바깥 scope 의 객체에 `this` 같은 키워드를 사용하기 싫을때 이용 할 수 있다.

`and also do the following with the object.`

```
val numbers = mutableListOf("one", "two", "three")
numbers
    // 대표적인 케이스가 로깅 
    .also { println("The list elements before adding new one: $it") }
    .add("four")
```


#### apply

```kotlin
public inline fun <T> T.apply(block: T.() -> Unit): T
```

also 와 유사한 형태지만, 수신 객체 지정람다를 받는 함수이다.
주로, object 의 property 를 할당하기 위한 용도로 사용된다. `this 사용 혹은 생략 가능하기 때문`

```kotlin
@Test
fun also() {
    val personA = Person()
    val person = Person().also {
        it.name = "hello"
    }
    assertEquals(personA, person)
}

@Test
fun apply(){
    val person = Person().apply {
        name = "hello"
    }
    assertNotNull(person)
}
```

## Scope Function 의 차이

Scope Function의 대표적인 차이점은 아래 2가지이다.

- Context Object 를 참조하는 방법 (`this` , `it`)
- 값 리턴 여부

### Context Object 를 참조하는 방법 (it / this 의 차이)

`Function Literals with Receiver` 인 경우 this를 사용하며,`lambda argument` 인 경우 it를 사용한다

```kotlin
fun main() {
    val str = "Hello"
    // this
    str.run {
        println("The receiver string length: $length")
        //println("The receiver string length: ${this.length}") // does the same
    }

    // it
    str.let {
        println("The receiver string's length is ${it.length}")
    }
}
```

`this`

run, with, apply 는 `Function Literals with Receiver` 로, this 로 context object 를 참조할 수 있다.    
즉, 일반 함수 처럼 사용 할 수 있다.

```kotlin
val person: Person = with(Person()) {
    this.name = name  // 이름 충돌의 경우 this 명시 
    language = myLanguage                 
    // printName()  // private 함수는 접근 불가 
    this // return 
}
```

위 함수를 보면, 별다른 keyword 없이 `Person` property에 접근할 수 있다.
this 를 생략하여, 짧은 코드를 만들 수 있지만, 구별하기 어려울 수 있다는 단점이 있다.
때문에, context object 에 함수를 직접 호출하거나, property 할당할때 사용하는걸 추천한다.


`it`

let / also 는 lambda argument 로 argument 를 명시하지 않으면, it 를 사용 할 수 있다.

> this 보다 짧고 읽기 쉬우며, argument 로 사용한다. (ex => 자바 stream function)

다만, this 처럼 object의 함수 및 property 에 별다른 키워드 없이 접근 할 수는 없다.

> 객체의 참조를 갖고 다른 함수의 인자가 되는 케이스로 자주 사용된다.


`정리`
같은 로직을 `this` / `it` 로 동일하게 사용할 수 있으나, 객체 내부 property 나 함수에 접근하는 경우는 this 를, 아닌 경우는 it 를 사용하자.

### 값 리턴 여부

- `apply` and `also` return the context object. (객체 스스로를 반환)
- `let`, `run`, and `with` return the lambda result. (람다 결과를 반환)

#### return the context object.

`apply` 와 `also` 는 `object 스스로를 반환`한다.

> object 스스로를 반환 => object chaining 할 수 있다.

```
val numberList = mutableListOf<Double>()
numberList.also { println("Populating the list") }
    .apply {
        add(2.71)
        add(3.14)
        add(1.0)
    }
    .also { println("Sorting the list") }
    .sort()
```

#### return the lambda result.

`let`, `run` 과 `with` 은 `람다의 결과를 반환`한다.    
때문에 결과를 할당하거나, `result 의 결과`를 chaining 하는 형태로 사용할 수 있다.


#### 정리하며

kotlin 공식 문서에는 아래 문구가 적혀있다.

`The choice mainly depends on your intent and the consistency of use in your project.`

> 결론 :: 팀 일관성에 맞춰서 사용하자 !!

#### 참고


(코틀린 의 apply, with, let, also, run 은 언제 사용하는가?)[https://medium.com/@limgyumin/%EC%BD%94%ED%8B%80%EB%A6%B0-%EC%9D%98-apply-with-let-also-run-%EC%9D%80-%EC%96%B8%EC%A0%9C-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94%EA%B0%80-4a517292df29] 

(scope-functions.html)[https://kotlinlang.org/docs/scope-functions.html#takeif-and-takeunless]

