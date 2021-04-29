[코틀린 쿡북](http://www.yes24.com/Product/Goods/90452827)을 읽고, 인상 깊었던 내용을 정리한다.

> 책의 목차만 동일하며, 내용은 이해한대로 재구성한다.

## 2.1 코틀린에서 Null 허용 타입 사용하기

Kotlin은 Nullable Type과 NotNull Type을 구별한다.

```kotlin
val nullableType: String? 
val notNullType: String
```

`2.1`에선 Null Object을 다루는 방법을 소개한다.

### 0. base

분기문을 통한 null check.

```kotlin
fun nullableMap(isEmpty: Boolean): List<String>? = if (!isEmpty) {
    mutableListOf("hi", "hello", "안녕")
} else {
    null
}
```

### 1. not null 단언 연산자 (code smell)

not null assertion(`!!`) 을 통한 체크.

```kotlin
@Test
@DisplayName("not null 단언 연산자 case")
fun handle() {
    // code smell
    try {
        val nullableList: List<String> = nullableMap(isEmpty = true)!!
        fail()
    } catch (ex: NullPointerException) {
        // success
    }
}
```

### 2. safe call case

safe call (`?.`) 을 통한 체크.

```kotlin 
@Test
@DisplayName("safe call case")
fun handleNullable() {
    val nullableList: List<String>? = nullableMap(isEmpty = true)

    assertEquals(null, nullableList?.map { it to it.length }?.size,
            "변수가 null 이 아니면 수행, null 이면 null return")
}
```

### 3. safe call + Elvis case

safe call 과 Elvis 를 통한 체크.

```kotlin
@Test
@DisplayName("safe call + Elvis case")
fun elvis() {
    val nullableList: List<String>? = nullableMap(isEmpty = true)

    val notNullMap: List<Pair<String, Int>> = nullableList?.map { it to it.length } ?: emptyList()
    assertEquals(0, notNullMap.toMap().size)
}
```

위 예제와는 안맞긴 하지만.. `let`을 이용하여 null check 를 할 수 있다.

```kotlin
@Test
@DisplayName("let")
fun let() {
    val nullableList: List<String>? = nullableMap(isEmpty = true)

    val notNullMap: List<Pair<String, Int>> = nullableList?.let { list ->
        list.map { it to it.length }
    } ?: emptyList()

    assertEquals(0, notNullMap.toMap().size)
}
```

## 2.2 자바에 널 허용성 지시자 추가하기

Java 와 kotlin을 함께 사용하고, nullablilty annotation을 강제하고 싶을 경우, 일부 annotation과 compileOption 을 사용할 수 있다.

> gradle 설정

```
compileKotlin {
  kotlinOptions {
    freeCompilerArgs = ["-Xjsr305=strict"]
    jvmTarget = "1.8"
  }
}
```

> 지원 annotation

```
- JetBrains (@Nullable and @NotNull from the org.jetbrains.annotations package)
- Android (com.android.annotations and android.support.annotations)
- JSR-305 (javax.annotation, more details below)
- FindBugs (edu.umd.cs.findbugs.annotations)
- Eclipse (org.eclipse.jdt.annotation)
- Lombok (lombok.NonNull)
```

> 예시 Java

```java
public String getNameWithPrefix(@NonNull String prefix){
    return prefix + name;
}
```

> 예시 Kotlin

```kotlin
@Test
fun getName() {
    val prefix = "얼죽아:"
    val name = "장철운"
    val person = Person(name, null, 82)

    assertEquals(prefix + name, person.getNameWithPrefix(prefix))
    /*
        freeCompilerArgs = ["-Xjsr305=strict"] 추가 시, 아래 코드가 컴파일 에러 발생
        person.getName(null)
        */
}
```

Java 와 kotlin을 함께 사용한다면, `@nonnull & @nullable` annotation을 사용하자.


## 2.3 자바를 위한 메서드 중복 (default param)

kotlin 에선 Default Parameter 를 지원하는데, Java 에서 사용 할 경우 추가 Annotation (`@JvmOverloads`) 선언이 필요로하다.

### 0. Kotlin

```kotlin
class CustomMap<T, R> @JvmOverloads constructor(val mutableMap: MutableMap<T, R> = mutableMapOf()) : MutableMap<T, R> by mutableMap

@JvmOverloads
fun <T, R> CustomMap<T, R>.add(key: T, value: R, mergeFunction: (R, R) -> R = { first, second -> first }): Map<T, R> {
    val isExistKey = this[key] != null
    if (isExistKey) {
        val mergeValue = mergeFunction(this.getValue(key), value)
        this.plus(key to mergeValue)
        return this
    }

    this.plus(key to value)
    return this
}
```

> JAVA 에서 호출

```java
@Test
void defaultParameter() {
    String hhkb = "HHKB";
    CustomMap<String, String> keyboardGroupCountry = new CustomMap<>(new HashMap<>());
    keyboardGroupCountry.put("japan", hhkb);
    keyboardGroupCountry.put("korea", "한성");

    // annotation 을 달지 않으면, default param 지원 x
    //DefaultParameterKt.add(keyboardGroupCountry,"japan","real-force")
    DefaultParameterKt.add(keyboardGroupCountry, "japan", "real-force");

    assertEquals(hhkb, keyboardGroupCountry.get("japan"));
}

@Test
@DisplayName("kotlin 의 constructor keyword 필요")
void defaultParameterWithConstructor() {
    String hhkb = "HHKB";
    CustomMap<String, String> keyboardGroupCountry = new CustomMap<>();
    keyboardGroupCountry.put("japan", hhkb);
    keyboardGroupCountry.put("korea", "한성");

    DefaultParameterKt.add(keyboardGroupCountry, "japan", "real-force");

    assertEquals(hhkb, keyboardGroupCountry.get("japan"));
}
```

kotlin 생성자에 `@JvmOverloads` 를 붙이려면, `constructor` keyword 를 붙여야한다.

또한, kotlin 의 확장함수를 Java에서 호출하려하면, `$this`를 넘겨줘야한다.
아래는 java 로 Decompile 된 kotlin 확장함수이다.



```java
@JvmOverloads
@NotNull
public static final Map add(@NotNull CustomMap $this$add, Object key, Object value, @NotNull Function2 mergeFunction) {
    Intrinsics.checkNotNullParameter($this$add, "$this$add");
    Intrinsics.checkNotNullParameter(mergeFunction, "mergeFunction");
    boolean isExistKey = $this$add.get(key) != null;
    if (isExistKey) {
        Object mergeValue = mergeFunction.invoke(MapsKt.getValue((Map)$this$add, key), value);
        MapsKt.plus((Map)$this$add, TuplesKt.to(key, mergeValue));
        return (Map)$this$add;
    } else {
        MapsKt.plus((Map)$this$add, TuplesKt.to(key, value));
        return (Map)$this$add;
    }
}
```

### 2.9 to로 Pair 인스턴스 생성하기 (infix)

kotlin 은 `infix` 라는 keyword로 `중위 함수`를 선언할 수 있다.

```kotlin
infix fun String.concatenate(str: String) = "$this $str"

@Test
@DisplayName("infix function")
fun infix() {
    val expect = "my cat is cute"

    assertEquals(expect, "my cat is" concatenate "cute")
}
```

함수를 문장처럼 쓸 수 있다는 장점(?)이 있음.

> 단언문과 함께 사용하면, 문장처럼 만들 수 있을거 같다.

대표적인 중위 함수가 `Pair`이며, 아래처럼 사용 할 수 있다.

```kotlin
@Test
@DisplayName("Pair")
fun pair() {
    val map = mapOf("key" to "value", "key2" to "value")

    assertEquals(2, map.size)
    assertEquals("value", map["key2"])

    // (A, B) 로 할당도 가능 componentN
    val (key, value) = "key" to "value"

    assertEquals("key", key)
    assertEquals("value", value)
}
```

## 3.1 const와 val 차이 이해하기

const 는 `modifier keyword` 이며, compile time 의 상수이다.

*compile time의 상수*

```
- 최상위 함수 또는 object keyword 와 함께 사용되어야한다. (static)
- Compile 시점에 값을 사용할 수 있도록, main 함수를 포함한 모든 함수의 바깥쪽에서 할당돼야한다. 
- 또한 생성자 / 함수 호출로 변수할당을 할 수 없으며, 기본 타입의 래퍼 클래스여야한다.
- getter 를 갖지 않는다.
```


*val과 const*

val 은 runtime에 변수 할당이 가능하며, keyword 이다.
`modifier keyword` 가 아니며, val 과 const는 같이 사용되어야한다.

> modifier keyword => 이미 정의된 keyword 에 추가 의미를 부여한다. (ex abstract / annotaion / public ..)

```kotlin
class Task @JvmOverloads constructor(val name: String, _priority: Int = DEFAULT_PRIORITY, keyword: String) {
    companion object {
        const val MIN_PRIORITY = 1 // 일반 class 안에는 선언이 안된다.
        const val MAX_PRIORITY = 5
        const val DEFAULT_PRIORITY = 3
    }

    var priority = validPriority(_priority) // _priority 바로 할당
        set(value) {
            field = validPriority(value)
        }

    private fun validPriority(p: Int) = p.coerceIn(MIN_PRIORITY, MAX_PRIORITY)
}

class ConstVal {
    @Test
    fun task() {
        val expect = 5
        val securityTask = Task("보안 이슈",keyword = "hello")

        securityTask.priority = expect

        assertEquals(expect, securityTask.priority)
    }
}
```

const는 Java 로 decompile 했을 때, 큰 차이가 없다. object 내에 선언되기에 static final 로 선언되며, 접근 제한자와 Getter 여부의 차이만 있다.

> kotlin 에서 compile time 에 변수 할당을 강제할때 사용된다.

## 3.2 사용자 정의 획득자와 설정자 생성하기

kotlin class 도 다른 객체지향 언어와 마찬가지로, 캡슐화를 지원한다.
다만, Kotlin은 default 접근제한자가 public 인데, 얼핏봤을때 데이터 은닉 원칙을 침해하는 것처럼 보인다.

```kotlin
class MonsterHunter(val rank: Int, val weapon: String)

class SetterGetter {
    @Test
    fun getterSetter() {
        val monsterHunter = MonsterHunter(18, "Bow")

        assertEquals(18, monsterHunter.rank)
        assertEquals("Bow", monsterHunter.weapon)
    }
}
```

코틀린은 이러한 데이터 은닉을 특이한 방법으로 해결한다.

```kotlin
class MonsterHunter(val rank: Int, val weapon: String) {
    var palicoRank = 0
        set(value) {
            field = value.coerceIn(1..20)
        }
}
```

생성자를 통해 변수를 생성 할 경우, getter/ setter 가 자동으로 생기지만, 위처럼 class 안에 property를 선언하여 사용자 정의 getter / setter 를 만들 수 있다.

속성을 정의하는 문법은 아래와 같다.

```kotlin
var <propertyName>[: <PropertyType>] [= <property_initializer>]
[<getter>]
[<setter>]
```

> [] 는 선택사항을 나타낸다.

*backing field*

- 기본 getter / setter 를 사용하는 경우 (생성자 선언과 class 내부 property 선언도 마찬가지)
- 사용자 정의 getter / setter를 사용하며, `field` 변수를 사용하는 경우

위 상황에서 kotlin은 backing field 를 생성한다.

> field 변수는 getter / setter 안에서 사용할 수 있다.

위에서 설명했듯, kotlin에서 property를 직접 호출할때, setter / getter를 통해 접근되는데, 내부 setter 에서도 마찬가지이다.

```kotlin
var palicoRank = 0
        set(value) {
            palicoRank = value.coerceIn(1..20)
        }
```

위처럼 backing field 를 사용하지 않고, `palicoRank`를 직접 참조하면 setter 를 재호출하게 되고, 재귀가 발생하게 된다.

> 객체 내부에서 property를 접근할때도, setter/getter 를 통해서만 접근된다.


## 3.3 데이터 클래스 정의하기

kotlin 에서는 equals / hashCode / toString 등 기본 함수(?)를 지원하는 keyword 가 있다.

```kotlin
data class Product(val name:String, val price:Double, val onSale:Boolean)
```

data keyword 를 사용하면, 아래 함수들이 구현된다.

```
- equals / hasCode (주의 : 주생성자에 선언된 속성을 바탕으로 생성한다.)
- toString
- copy (주의 : 얕은 복사)
- component
- ...
```

`equals / hasCode` 는 Effective Java 에서 설명한 알고리즘 기반으로 생성된다.
주 생성자를 기준으로 함수가 생성된다. (아래 참조)

```kotlin
data class Product(var name: String, var price: Double, var onSale: Boolean) {
    var isCoupon = false
}

class DataClass {
    @Test
    fun dataClass() {
        val product = Product("옷", 1000.0, false)
        product.isCoupon = true

        val notCouponProduct = Product("옷", 1000.0, false)
        product.isCoupon = false

        assertTrue(product == notCouponProduct)
    }

    @Test
    fun copy() {
        val product = Product("옷", 1000.0, false)
        product.isCoupon = true

        val notCouponProduct = product.copy()

        assertTrue(product == notCouponProduct)
        assertFalse(notCouponProduct.isCoupon)
    }
}
```

> 참고:: kotlin 의 `==` 는 equals 를 호출한다. 값을 비교하려면 `===` 사용

또한 copy는 얕은 복사를 지원한다.

```kotlin
data class Product(var name: String, var price: Double, var onSale: Boolean, var option: Option? = null) {
    var isCoupon = false
}

@Test
fun copy_swallowCopy() {
    val product = Product("옷", 1000.0, false, Option("색상"))
    val notCouponProduct = product.copy()

    assertFalse(product === notCouponProduct, "복사한 객체는 다른 객체")
    assertTrue(product.option === notCouponProduct.option, "내부 object 는 같은 참조")
}
```

copy 뿐만아니라, componentN 함수도 지원한다. `syntactic sugar`

```kotlin
@Test
fun component() {
    val product = Product("옷", 1000.0, false, Option("색상"))
    val (name, price, onSale, option) = product

    assertTrue(name== product.name)
    assertTrue(price== product.price)
}
```

## 여담으로 ..

*주생성자? / 부생성자?*

Kotlin은 주생성자와 다수의 부생성자를 가질수 있다.
class 선언 시, 괄호로 둘러쌓인 코드를 주 생성자라고 부른다.

```kotlin
class Product(val name:String, val price:Double, val onSale:Boolean)

class Product private constructor(val name:String, val price:Double, val onSale:Boolean)
```

부 생성자란, class body에 선언된 생성자를 의미하며, 기본 생성자를 호출하여 초기화 해야한다.

```kotlin
data class Product(var name: String, var price: Double, var onSale: Boolean) {
    constructor(name: String, price: Double) : this(name, price, true) 
}
```

`init keyword`

```
The primary constructor cannot contain any code. Initialization code can be placed in initializer blocks, which are prefixed with the init keyword:
```

기본 생성자에 코드가 포함될 수 없으므로, init block 으로 객체 초기화 시, 함수를 호출 할 수 있다.

```kotlin
data class Product(var name: String, var price: Double, var onSale: Boolean) {
    init {
        println("init ${this.name}")
    }

    constructor(name: String, price: Double) : this(name, price, true) {
        println("부생성자 ${this.onSale}")
    }
}


val product = Product("옷", 1000.0)
```

> 결과

```
init 옷
부생성자 true
```

호출 순서는 아래와 같다.

```
primary -> init -> secondary 
```


*끗*