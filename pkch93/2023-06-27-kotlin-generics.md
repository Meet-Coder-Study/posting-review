# Java 개발자가 배우는 Kotlin - Generics

Java와 마찬가지로 Kotlin도 제네릭을 지원한다.

```kotlin
class Box<T>(t: T) {
    var value = t
}
```

위 Box의 value는 제네릭으로 전달하는 T의 타입에 따라 달라진다.

```kotlin
val box: Box<Int> = Box(1)
```

그리고 Kotlin에서는 제네릭 타입 추론을 지원하므로 다음과 같이 생략해도된다.

```kotlin
val box = Box(1)
```

Box에 인자로 들어가는 타입이 Int이므로 `Box<Int>`로 코틀린 컴파일러가 추론한다.

## variance

Java의 타입시스템에는 wildcard `?`가 존재한다. 단, Kotlin에는 wildcard가 존재하지 않으며 대신 선언 지점 변성 `declaration-site variance`와 type projections을 제공한다.

참고로 Java의 wildcard는 사용 지점 변성 `use-site variance`을 의미한다.

> [Java에 wildcard가 존재하는 이유](https://www.notion.so/74dbef1c1f47406cbeab5fd2925f31e7?pvs=21) 

> 참고로 변성은 `List<String>`과 `List<Any>` 같이 base 타입이 같고 타입 인자가 다른 여러 타입이 서로 어떤 관계를 갖는지 설명하는 개념

변성이 존재하는 이유를 List를 예로 들어 설명한다.

```kotlin
fun print(values: List<Any>) {
	println(values.joinToString())
}

print(listOf("a", "b"))
// a, b
```

위와 같이 print 함수의 인자 values에 String을 넣어도 잘 동작한다. String은 Any의 하위타입이기 때문이다.
위 예시는 List가 변경되지 않았다. 이제 List가 변경될 수 있는 상황을 본다.

```kotlin
fun addValues(values: MutableList<Any>) {
	values.add(1)
}

val words = mutableListOf("a", "b")
addValues(words) // not error
println(words.maxBy { it.length }) // error!
```

변경할 수 있는 리스트인 `words`를 `addValues`의 인자로 전달한다. `addValues`는 `MutableList<Any>`로 정의되어있기 때문에 `MutableList<String>`도 인자로 받아들일 수 있다. 단, `addValues`의 body에서 `Int`를 words에 넣게되는데 이 경우 `ClassCastException`이 발생한다.

위 예시는 `MutableList<Any>`가 필요한 곳에 `MutableList<String>`을 전달해서는 안된다는 의미이다. 이는 변경이 가능한 `MutableList<Any>`에서는 어떤 타입도 전달되기 때문이다. 만약 추가 / 변경이 일어나지 않는 List라면 안전하다.

따라서 Kotlin에서는 List의 변경 가능성에 따라 적절한 인터페이스를 선택하면 불안전한 함수 호출을 방지할 수 있다. immutable List에서는 더 구체적인 타입의 원소를 갖는 List를 전달할 수 있다.

### 공변성

`공변하다`라고 말할 수 있는 경우는 `A`가 `B`의 하위타입일 때 `List<A>`가 `List<B>`의 하위타입인 경우이다.
즉, 공변성은 하위 타입 관계를 유지할 수 있는지 여부이다. 공변성이 없는 경우, 즉, 인스턴스 타입 사이의 하위 타입의 관계가 성립하지 않으면 **무공변**이라고 한다.

> 참고로 Java의 모든 클래스는 무공변이다.

Kotlin에서 제네릭 클래스가 타입 파라미터에 대해서 공변적임을 표시하려면 타입 파라미터 앞에 `out`을 붙여야한다.

```kotlin
interface Producer<out T> {
	fun produce(): T
}
```

위 Producer 인터페이스는 T에 대해 공변적이라고 선언하는 것이다.

단, 위와 같이 타입 파라미터를 공변적으로 지정하면 타입 안정성 보장을 위해서 공변 파라미터는 항상 out 위치에만 있어야한다. 즉, T 타입을 생산은 할 수 있지만 소비할 수는 없다는 의미이다.

이는 생성자에도 적용된다. 생성자에서 `val`이나 `var`을 정의하는 경우 `val`은 문제없이 타입 파라미터를 사용할 수 있다. getter만 생성되기 때문이다. 반면 `var`은 setter도 포함하기 때문에 out 위치에만 있을 수 있는 타입 파라미터를 사용할 수 없다.

> 참고로 `Producer<out T: TUpper>`와 같이 정의하면 T의 상위 타입을 TUpper까지 정의할 수 있다.
> 

### 반공변성

반공변성은 공변성의 반대이다. 타입 `B`가 `A`의 하위 타입인 경우 `List<A>`가 `List<B>`의 하위타입인 경우를 반공변성이라고 한다.

```kotlin
interface Consumer<in T> {
	fun consume(value: T): String
}
```

위와 같이 반공변성을 표현하기 위해서는 타입 파라미터 앞에 `in`을 붙인다. 타입 인자를 오직 인 위치에서만 사용가능하다는 뜻이다. 인자로 들어오는 타입이 T보다 구체적이면 안되기 때문이다.

위와 같이 class, interface 선언 시점에 `in`, `out`으로 변성을 지정하는 방식은 선언 지점 변성 `declaration-site variance`라고 한다. 선언 지점 변성은 해당 클래스를 사용하는 모든 장소에서 변성이 적용되므로 편리하고 코드가 간결해진다.

### Type Projections

Java는 선언 지점 변성이 아닌 사용 지점 변성 `use-site variance`만을 지원한다. `? extends T`나 `? super T`와 같이 지원한다. Kotlin에서도 동일하게 `in`, `out`으로 사용 지점 변성을 사용할 수 있다.

Java의 `? extends T`와 Kotlin `out`이 동일하고 Java `? super T`와 Kotlin `in`이 동일하다.

#### Star Projections

제네릭 타입 인자 정보가 없음을 표현하기 위해서 Kotlin에서는 스타 프로젝션을 사용할 수 있다. 즉, 인자를 알 수 없는 제네릭 타입을 표현할 때 사용한다.

- `Foo<out T : TUpper>`가 있을때 만약 `Foo<*>`로 지정하면 `Foo<out T>`와 동일한 효과를 가진다.
- `Foo<in T>` 가 있을때 만약 `Foo<*>`로 지정하면 이는 `Foo<in Nothing>`과 동일하다.
- `Foo<T: TUpper>`는 무공변으로 `out`, `in`에 둘다 사용가능하다. 따라서 `Foo<*>`는 `Foo<out T>`와 `Foo<in Nothing>`을 표현한다.

## Generic Constraints

공변성을 제한하는 방법 이외에도 Generic 타입으로 올 수 있는 타입을 제한할 수 있는 방법을 제공한다.

```kotlin
fun<T : Comparable<T>> sort(list: List<T>) { ... }
```

위와 같이 Java의 extends에 대응되는 upper bound 방식으로 Generic 타입을 제한할 수 있다. 만약 upper bound를 설정하지 않으면 기본적으로는 `Any?`로 지정된다. 즉, null을 포함한 모든 값이 올 수 있다는 의미이다. upper bound의 가장 대표적인 사례는 `Any`를 지정하는 것이다.

```kotlin
fun<T : Any> sort(list: List<T>) { ... }
```

`Any?`와 달리 `Any`는 null이 올 수 없기 때문에 null을 방지하는데 사용할 수 있다.

### where

기본적으로 `<>` 내에서는 하나의 타입 파라미터만 제한할 수 있다. 만약 여러 타입으로 제한해야 한다면 **where**를 사용할 수 있다.

```kotlin
fun <T> copyWhenGreater(list: List<T>, threshold: T): List<String>
    where T : CharSequence,
          T : Comparable<T> {
    return list.filter { it > threshold }.map { it.toString() }
}
```

이때 Generic 타입인 T로 올 수 있는 타입은 where 절로 지정한 모든 타입을 만족해야한다. 즉, 위 예시에서는 `CharSequence`와 `Comparable<T>`을 둘 다 구현하는 타입이어야 T의 타입으로 올 수 있다.

## reified parameter

JVM 특성상 JVM언어의 제네릭은 런타임에는 Type Erasure를 통해 타입인자 정보를 알 수 없다.

즉, `List<String>`과 `List<Int>`는 컴파일 단계에서는 컴파일러가 제네릭의 타입을 알고 있기 때문에 서로 다른 타입임을 알고 있지만 런타임에서는 둘다 `List`로 인식된다. 그렇더라도 런타임에는 전자의 리스트는 `String` 값만 후자의 리스트는 `Int` 값만 들어있다고 가정할 수 있는데 이는 컴파일러가 제네릭으로 정의된 타입만을 각 리스트의 값으로 넣어주는 것을 보장하기 때문이다.

Kotlin에서 함수를 inline으로 정의하여 제네릭 타입 인자가 지워지지 않게 만들 수 있다. 이렇게 타입이 지워지지않은 인자를 Kotlin에서는 실체화된 `reified` 파라미터라고 부른다.

실체화된 파라미터로 다음과 같은 작업을 할 수 있다.

1. 타입 검사와 캐스팅 `is, !is, as, as?`
2. Kotlin Reflection `::class`
3. Kotlin의 타입에 대응하는 java.lang.Class 얻기 `::class.java`
4. 다른 함수 호출시 타입 인자로 사용

단, 다음은 지원하지 않는다.

1. 타입 파라미터 클래스의 인스턴스 생성
2. 타입 파라미터 클래스의 동반 객체 메서드 호출
3. 실체화한 타입 파라미터를 요구하는 함수를 호출하면서 실체화하지 않은 타입 파라미터로 받은 타입을 호출
4. 클래스, 프로퍼티, 인라인 함수가 아닌 함수의 타입 파라미터를 reified로 지정

### reified parameter의 예시

```kotlin
inline fun <reified T> getType() = T::class.java

val typeOfString = getType<String>()
println(typeOfString) // class java.lang.String

```

위 예시에서는 `reified`를 사용하여 함수 인자로 전달된 타입 `T`를 실체화하여 사용하고 있다. 이를테면 String 타입이라면 `::class.java`로 클래스를 반환하여 출력할 수 있다. 이처럼 `reified`를 사용하면 런타임시 타입을 유지할 수 있다.

#### inline 함수의 제네릭 타입 인자

inline 함수에서 제네릭 타입 인자를 사용하면 컴파일러는 해당 함수의 복사본을 생성한다. 이 복사본은 제네릭 타입 인자를 포함하고 있으며, 함수 호출 시 해당 인자에 대해 타입 파라미터를 지정한다. 이를 통해 함수 호출 시 매번 새로운 인스턴스를 생성하지 않고, 인라인된 코드를 효율적으로 실행할 수 있다.

하지만, 함수 내부에서 인자로 전달받은 객체를 다른 함수에 전달하는 경우, **해당 함수도 인라인화가 되어야 한다.** 그렇지 않으면 함수 호출시마다 객체를 생성하게 되며, 성능상의 이슈가 발생할 수 있다. 따라서 함수 내에서 다른 함수를 호출하는 경우에도 해당 함수를 inline으로 선언해야 한다.

#### 제네릭 타입 인자 제약 조건

Kotlin에서 제네릭 타입 인자에 제약 조건을 추가할 수 있다. 이를테면, `T`는 `Comparable<T>` 인터페이스를 구현해야 한다는 제약 조건을 추가할 수 있다. 이를테면 다음과 같이 사용할 수 있다.

```kotlin
fun <T: Comparable<T>> max(first: T, second: T): T {
    return if (first > second) first else second
}

```

위 예시에서는 `T`가 `Comparable<T>` 인터페이스를 구현하도록 제한하고 있다. 이를 통해 `max` 함수 내에서 `>` 연산자를 사용할 수 있다.
