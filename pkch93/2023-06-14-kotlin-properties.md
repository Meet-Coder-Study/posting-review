# Java 개발자가 배우는 Kotlin - 프로퍼티

Kotlin의 프로퍼티는 Java의 필드와 비슷해보이지만 전혀 다른 개념이다. 일단 프로퍼티는 getter, setter를 가진다. 이때 getter와 setter는 필드를 기반으로 값을 처리한다.

```kotlin
class Person(name: String?) {
	var name: String? = null
			get() = field?.toUpperCase()
			set(value) {
				if (!value.isNullOrBlank()) {
					field = value
				}
			}

	// ...
}

val person = Person("pkch")
person.name // Pkch
person.name = "" // setter에서 유효성 처리
person.name // Pkch
```

따라서 위와 같이 `get`과 `set` 키워드로 각각 getter와 setter를 커스터마이징 할 수 있다.

단, 위 Person의 name을 주 생성자 `primary constructor`에서 getter/setter 커스터마이징은 불가하다.

```kotlin
class Person(
	var name: String? = null
			get() = field?.toUpperCase()
			set(value) {
				if (!value.isNullOrBlank()) {
					field = value
				}
			}
) // ERROR
```

위와 같이 Kotlin에서는 주 생성자에 getter/setter를 정의할 수 없도록 하므로 본문에서 프로퍼티를 정의한 경우에만 getter/setter를 정의할 수 있다.

## 프로퍼티 특성에 따라 가능한 것들

### getter 정의

이렇게 Kotlin의 프로퍼티는 위와 같은 특성을 가지므로 필드를 가지지 않도록 만들수도 있다.

```kotlin
class Person(
	val firstName: String,
	val lastName: String,
) {
	val fullName: String
		get() = "$lastName $firstname"

	// ...
}
```

위와 같이 정의하면 fullName은 필드를 가지지 않고 getter만 정의된다.

### 인터페이스 프로퍼티

프로퍼티라는 특성 때문에 Kotlin에서는 인터페이스에 프로퍼티 정의가 가능하다.

```kotlin
interface Bird {
	val name: String
}
```

이렇게 인터페이스 Bird에는 name 프로퍼티를 정의할 수 있다. 그리고 하위 클래스에는 name을 override해서 정의가 가능하다.

```kotlin
open class Bird {
	// ...
}

class Chicken: Bird() {
	override val name = "chicken"
}

class Duck: Bird(
	override val name: String,
) {
}
```

Java에서도 인터페이스에 필드 정의가 가능은 하지만 `public static final`로 정의되므로 상수 취급한다.

```java
interface Person {
	Integer ADULT_AGE = 19;
}
```

## 어노테이션 붙이기

Java 기반의 라이브러리들은 어노테이션을 기반으로 동작을 지원하는 경우가 많다. Java Bean 규약에 따라서 getter/setter로 동작하는 경우도 있고 필드 기반으로 동작을 하는 경우가 있다.

Kotlin에서는 프로퍼티에 어노테이션을 붙이면 필드에 붙이는 것으로 간주한다.

```kotlin
import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDateTime

data class Response<T>(
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
	val responseDateTime: LocalDateTime,
	val data: T
)
```

위와 같이 responseDateTime에 붙이면 responseDateTime 필드에 `@JsonFormat` 어노테이션이 적용된다. 단, `com.fasterxml.jackson.annotation.JsonFormat`은 getter에 적용되는 어노테이션이므로 위 responseDateTime은 JSON으로 변환시 정의했던 포멧인 `yyyy-MM-dd HH:mm:ss`가 아닌 `yyyy-MM-dd'T'HH:mm:ss.SSS` 기본 포멧으로 컨버팅된다.

따라서 다음과 같이 파생 프로퍼티로 정의해서 getter에 어노테이션을 붙일수도 있다.

```kotlin
class Response<T>(
	val data: T,
	responseDateTime: LocalDateTime	
) {
	val responseDateTime: LocalDateTime = responseDateTime
		@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
		get
}
```

위와 같이 정의할 수도 있지만 data 클래스에서는 주 생성자에 반드시 `val/var` 키워드를 붙여야하므로 data 키워드가 클래스에서 빠진 것을 볼 수 있다. 그리고 코드가 보다 장황해졌다.

이 때문에 Kotlin에서는 어노테이션의 대상을 지정하는 문법을 제공한다.

### use-site targets

> [Annotation use-site targets](https://kotlinlang.org/docs/annotations.html#annotation-use-site-targets) 참고

다음과 같은 대상들을 제공한다.

- `file`
- `property`
    
    참고로 property로 지정한 어노테이션은 Java에서는 사용이 불가하다.
    
- `field`
- `get`
    
    프로퍼티의 getter에 적용
    
- `set`
    
    프로퍼티의 setter에 적용
    
- `receiver`
    
    프로퍼티나 확장함수의 리시버 파라미터에 적용
    
- `param`
    
    생성자의 파라미터에 적용
    
- `setparam`
    
    setter의 파라미터에 적용
    
- `delegate`

사용 방법은 사용하는 어노테이션 앞에 대상을 정의하는 것이다. 앞선 예시에서는 getter에 어노테이션을 적용하기 위해 `@get:JsonFormat`으로 정의가 가능하다.

```kotlin
import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDateTime

data class Response<T>(
	@get:JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
	val responseDateTime: LocalDateTime,
	val data: T
)
```

이렇게 정의하면 data class를 유지할 수 있고 보다 간단하게 어노테이션 적용이 가능하다.

참고로 대상 지정 없이 사용했을때 `@JsonFormat`이 필드에 적용되었던 이유는 기본 대상 지정 방식을 어노테이션에 붙은 `@Target`에 따르기 때문이다.

```java
@Target(
	{
		ElementType.ANNOTATION_TYPE,
		ElementType.FIELD,
		ElementType.METHOD,
		ElementType.PARAMETER,
    ElementType.TYPE
	}
)
@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotation
public @interface JsonFormat {
	// ...
}
```

위와 같이 `@JsonFormat`은 `ANNOTATION_TYPE`, `FIELD`, `METHOD`, `PARAMETER`, `TYPE` 5가지를 가진다. 여기서 Kotlin 프로퍼티에 적용되는 `Target`으로 `FIELD`가 사용되었으므로 필드에 어노테이션이 적용된다.

만약 적용한 어노테이션에 여러 `ElementType`을 적용이 가능한 경우에는 다음과 같은 적용 가능한 순서로 어노테이션을 적용한다.

- `param`
- `property`
- `field`

## 참고

[Effective Kotlin Item 16. 프로퍼티는 동작이 아니라 상태를 나타내야 한다](https://product.kyobobook.co.kr/detail/S000001033129)
