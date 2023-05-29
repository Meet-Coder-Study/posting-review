# Java 개발자가 배우는 Kotlin - 생성자

Java와 Kotlin이 차이가 난다고 많이 느끼는 부분이 Class의 생성자를 정의하는 방식이다.

Java는 Class의 필드를 정의하고 필요한 생성자를 정의하는 방식으로 되어있는 반면 Kotlin은 기본적으로 필요한 필드를 클래스 정의와 함께 생성자로 정의한다.

```java
public class Post {
	private final String title;
	private final String content;
	
	public Post(String title, String content) {
		this.title = title;
		this.content = content;
	}

	// ...
}
```

```kotlin
class Post(
	val title: String,
	val content: String
)
```

각각 Java와 Kotlin에서 Post 클래스를 표현한 코드 예시이다. 둘 다 동일한 동작을 한다. Kotlin에서는 클래스 선언하면서 괄호 `()` 내부에 필드를 정의하면서 동시에 생성자를 정의하는 것이다. 이를 primary constructor라고 한다.

참고로 primary constructor는 필요하다면 private constructor로 명시하여 외부에서 호출할 수 없도록 만들 수 있다.

```kotlin
class Post
	private constructor (
		val title: String,
		val content: String
)
```

## init

primary constructor는 어떤 코드도 정의할 수 없다. 만약 primary constructor에서 처리해야하는 로직이 있다면 이는 `init` 블록에서 정의할 수 있다.

```kotlin
class PhoneNumber(
    private val value: String
) {
    companion object {
				private val REGEX: Pattern = Pattern.compile("^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$")
    }

    init {
        if (!REGEX.matcher(value).matches()) {
            throw IllegalArgumentException("전화번호 형식과 맞지 않습니다.")
        }
    }
} 
```

위와 같이 init 블록 내부에서 필드의 유효성 검사를 할 수 있다.

```kotlin
class PhoneNumber(
    private val value: String
) {
    companion object {
				private val KOREA_INTERNATIONAL_NUMBER = 82
				private val REGEX: Pattern = Pattern.compile("^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$")
    }

    init {
        if (!REGEX.matcher(value).matches()) {
						println("${value}는 유효한 번호입니다.")
            throw IllegalArgumentException("전화번호 형식과 맞지 않습니다.")
        }
    }

		val internationalPhoneNumber = "${PhoneNumber.KOREA_INTERNATIONAL_NUMBER}+ ${value}".also(::println)

		init {
			println("국제번호는 ${internationalPhoneNumber}입니다.")
		}
}
```

init 블록과 프로퍼티 정의는 나타난 순서대로 동작한다. `PhoneNumber` 객체를 생성하면 아래와 같은ㅍ 메세지가 콘솔에 남는다.

```
01039821447는 유효한 번호입니다.
82+ 01039821447
국제번호는 82+ 01039821447입니다.
```

## secondary constructor

`primary constructor` 말고도 새로운 생성자가 필요하다면 정의할 수 있도록 지원한다. `constructor` 키워드를 통해 정의가능하다.

```kotlin
class PostDto {
    val title: String
    val content: String
    
    constructor(post: Post) {
        this.title = post.title
        this.content = post.content
    }
}
```

참고로 위 코드는 primary constructor와 init 블록을 사용한 아래 코드와 동일하다.

```kotlin
class PostDto(post: Post) {
    val title: String
    val content: String

    init {
        this.title = post.title
        this.content = post.content
    }
}
```

만약 primary constructor가 있는 상태에서 secondary constructor를 정의한다면 반드시 primary constructor를 호출해야한다.

```kotlin
class PostDto
	private constructor(
  val title: String
  val content: String
) {
  constructor(post: Post): this(post.title, post.content)
}
```

위와 같이 primary constructor가 존재하는 상태에서 secondary constructor를 정의했다면 primary constructor를 호출하도록 만들어야한다.

secondary constructor에 로직 수행이 필요하다면 중괄호 `{}` 내에 코드를 정의한다.

```kotlin
class PostDto
	private constructor(
  val title: String
  val content: String
) {
  constructor(post: Post): this(post.title, post.content) {
		println("${title} - ${content}")
	}
}
```

## 참고

[Kotlin Class constructors](https://kotlinlang.org/docs/classes.html#constructors)
