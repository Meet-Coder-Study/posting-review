# Java 개발자가 배우는 Kotlin - 상수 표현하기

Java에서는 보통 상수 표현을 할 때 `static final` 키워드를 사용한다. 하지만 Kotlin에서는 `static` 키워드를 지원하지 않기 때문에 `static final`을 사용할 수 없다. 그러면 어떻게 Kotlin에서는 상수를 표현할까?

## 상수 표현하기

### const

> [Compile-time constants](https://kotlinlang.org/docs/properties.html#compile-time-constants) 참고 

컴파일 타임에 읽기 전용 프로퍼티를 정의하는 경우 `const` 키워드를 통해 정의할 수 있다.

```kotlin
const val JOB_NAME = "batchJob"

class BatchJob {
	// ...
}
```

단, `const`는 String, Int와 같은 Primitive 타입의 변수만 정의할 수 있다. 그리고 getter를 커스텀 할 수 없다.

`const` 변수는 kt 파일의 최상위에 정의해야하며 `object`나 `companion`의 멤버 변수로도 정의할 수 있다.

### companion

> [Companion object](https://kotlinlang.org/docs/object-declarations.html#companion-objects) 참고 

companion object도 상수를 정의하기 좋은 방법이다. companion object 내부에 `const val`로도 정의가 가능하지만 Primitive 타입이 아닌 다른 타입을 정의해야한다면 `val`로 표현해서 정의할수도 있다.

```kotlin
class PhoneNumber(
	private val value: String
) {
	companion object {
		private val REGEX: Pattern = Pattern.compile("^01([0|1|6|7|8|9])-?([0-9]{3,4}-?([0-9]{4})$")
	}

	init {
		if (!REGEX.matcher(value).matches()) {
			throw IllegalArgumentException("전화번호 형식과 맞지 않습니다.")
		}
	}
}
```

## Kotlin에서 static을 지원하지 않는 이유

그럼 Kotlin은 Java에서 지원하는 `static` 키워드를 지원하지 않는 이유는 무엇일까?

이는 `static`이 OOP에 적합하지 않고 이를 대체하기 위한 방법들로 Companion Object나 object로 싱글턴을 구현할 수 있도록 지원해주기 때문이다. Java에서도 static 함수를 사용하는 경우 OOP의 도움을 받을 수 없다.

```java
public abstract class Hello {

    public void hello() {
        System.out.println("hello");
    }
}
```

다음과 같이 추상 클래스 `Hello`가 있다고 가정한다. 이를 확장하여 `hello world`를 찍는 함수를 만드는 `HelloWorld`를 정의한다.

```java
public class HelloWorld extends Hello {

    public static void helloworld() {
        super.hello(); // compile error!: super cannot be referenced from a static context
        System.out.println("world");
    }

    @Override // compile error!: Static methods cannot be annotated with @Override
    public static void hello() {
        System.out.println("hello world");
    }
}
```

위 `HelloWorld`의 예시처럼 static 함수 내에서는 상위 클래스의 요소에 접근하는 `super`와 상위 클래스의 메서드를 재정의하는 `@Override`가 불가하다. 만약 `static` 함수가 아니었다면 `Hello` 클래스를 확장하여 `hello`을 재정의하거나 `Hello`의 `hello` 메서드를 활용할 수 있었을 것이다.

이런 단점을 보완하기 위해 Java에서 지원하는 `static`을 없애고 기법으로 활용되던 Companion object를 언어 자체의 기능으로 내재화하였다.

> 물론 Kotlin은 기존 Java와의 호환성을 위해 `@JvmStatic` 어노테이션으로 Companion object 내부의 변수, 함수를 `static`으로 만들 수 있다. 

## 참고

[Best Practices for Using Constants in Kotlin | Baeldung on Kotlin](https://www.baeldung.com/kotlin/constants-best-practices)

[Why is there no static keyword in Kotlin?](https://softwareengineering.stackexchange.com/questions/356415/why-is-there-no-static-keyword-in-kotlin)