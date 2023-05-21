# #살아있다 #자프링외길12년차 #코프링2개월생존기 정리

## 코틀린의 철학

> 코틀린은 **자바와의 상호운용성**에 초점을 맞춘 **실용적**이고 **간결**하며 **안전한** 언어이다.
> 

### 간결성

언어가 간결하다는 건 그 언어로 작성된 코드로 읽을 때 의도를 쉽게 파악할 수 있다는 의미다.

```kotlin
data class Person {
	val id: UUID,
	val firstname: String,
	val lastname: String,

}
```

- 데이터 보관을 목적으로 사용하는 클래스가 필요할 때는 class 앞에 data를 붙여 정의한다.
- 프로퍼티에 대한 getter(), setter(), equals(), hashCode(), toString(), copy(), componentN() 메서드를 컴파일 시점에 자동으로 생성한다.
    - Java에서는 Lombok(외부 툴)을 통해 위 기능을 제공했지만, Kotlin은 언어 차원에서 위 기능을 제공한다.

```kotlin
val persons = repository.findByLastname("Kim")
val filteredPersons = persons.filter { it.address.city == "Seoul" }
```

- 표준 라이브러리의 풍부한 API와 고차 함수의 도움을 받아 간결하게 목적을 달성할 수 있다.

```kotlin
fun double(x: Int): Int = x * 2
val beDoubled = double(2)
```

- 단일표현 함수는 등호(=)로 함수 정의와 바디를 구분하여 짧게 표현할 수 있다.

코드가 간결하면 작성하는데도, 읽는데도 시간도 덜 걸리게 된다 → 생산성 증가

### 안정성

안정성을 높이려고 방어코드를 많이 작성하면 생산성은 떨어진다. (트레이드 오프) 코틀린은 이 간극을 줄이기 위해 여러 가지 노력을 했다.

```kotlin
val nullable: String? = null // 널이 될 수 있음
val nonNullable: String = "" // 널이 될 수 없음
```

- null이 될 수  없는 값을 추적하며, NullPointException 발생을 방지한다.

```kotlin
val value = loadValue()
if (value is String) {
	// 문자열 타입이 제공하는 메서드를 사용할 수 있음
	value.uppercase(Locale.getDefault())
}
```

- 타입 검사와 캐스트가 한 연산자에 의해 이뤄지며 ClassCastException 발생을 방지한다.

```kotlin
val scopeRange = when(CreditScore.EXCELLENT) {
	CreditScore.BAD -> 300..629
	CreditScore.FAIR -> 630..689
	CreditScore.GOOD -> 690..719
	CreditScore.EXCELLENT -> 720..850
}

enum class CreditScore {
	BAD, FAIR, GOOD, EXCELLENT
}
```

- break 문이 없어도 된다.
- 열거형 같은 특별한 타입과 함께 쓰면 모든 값이 평가되었는지 확인한다.

## 그만 널 잊으라고 (null을 안전하게 다루는 방법)

### 자바에 익숙한 코틀린 코드 → 이것은 자바인가, 코틀린인가

```kotlin
fun from(posts: Array<Post?>): Array<PostDto> {

	return posts.map({ post ->
		if (post == null) {
			throw Error("Post Object is null")
		}
		if (post.id == null) {
			throw Error("Id field is null in post object")
		}
		PostDto(
			post.id,
			post.text,
			post.author.id,
			post.createdAt,
			post.updatedAt
		)
	}).toTypedArray()
}
```

### 안전한 호출 연산자 : `?.`

```kotlin
fun from(posts: Array<Post?>): Array<PostDto> {

	return posts.map({ post ->
		if (post?.id == null) {
			throw Error("Id field is null in post object")
		}
		PostDto(
			post.id,
			post.text,
			post.author.id,
			post.createdAt,
			post.updatedAt
		)
	}).toTypedArray()
}
```

- `post?.id`
    - post가 null이 아니라면 id를 가져온다

### 엘비스 연산자 : `?:`

```kotlin
fun from(posts: Array<Post?>): Array<PostDto> {

	return posts.map({ post ->
		PostDto(
			post?.id ?: throw Error("Id field is null in post object"),
			post.text,
			post.author.id,
			post.createdAt,
			post.updatedAt
		)
	}).toTypedArray()
}
```

- `post?.id ?: throw Error("Id field is null in post object")`
    - post가 null이 아니라면 id를 가져오고, id가 null이면 예외가 발생한다.

### 널 아님을 단언 : `!!`

```kotlin
fun from(posts: Array<Post?>): Array<PostDto> {

	return posts.map({ post ->
		PostDto(
			post?.id!!,
			post.text,
			post.author.id,
			post.createdAt,
			post.updatedAt
		)
	}).toTypedArray()
}
```

- `post?.id!!`
    - id는 null이 아님을 단언
- id가 확실히 null이 아닐 때 사용한다.
- id가 null이면 NullPointerException이 발생한다.

## 다 놀았니? 이제 할 일을 하자

```kotlin
fun mapItem(item: NewsItem<*>): NewsItemDto {
	if (item is NewsItem.NewTopic) {
		return NewsItemDto(item.content.title, item.content.author)
	} else if (item is NewItem.NewPost) {
		return NewsItemDto(item.content.text, item.content.author)
	} else {
		throw IllegalArgumentException("This item cannot be converted")
	}
}
```

### 문(statement)과 식(expression)

- 문 : 아무런 **값을 만들어내지 않음**
- 식 : **값을 만들어낼 수 있는 것**. 다른 식의 하위 요소로 계산에 참여할 수도 있음

> 자바에서는 모든 제어 구조가 문(statement), 
코틀린에서는 루프를 제외한 모든 제어 구조가 식(expression)
> 

```kotlin
fun mapItem(item: NewsItem<*>): NewsItemDto {
	return if (item is NewsItem.NewTopic) {
		NewsItemDto(item.content.title, item.content.author)
	} else if (item is NewItem.NewPost) {
		NewsItemDto(item.content.text, item.content.author)
	} else {
		throw IllegalArgumentException("This item cannot be converted")
	}
}
```

코틀린은 타입추론이 가능하므로 더 줄일 수 있다. **단일 표현식**으로 나타낸다.

```kotlin
fun mapItem(item: NewsItem<*>) = if (item is NewsItem.NewTopic) {
		NewsItemDto(item.content.title, item.content.author)
	} else if (item is NewItem.NewPost) {
		NewsItemDto(item.content.text, item.content.author)
	} else {
		throw IllegalArgumentException("This item cannot be converted")
}
```

코틀린에서는 자바의 `switch`문과 비슷한 `when`이 있다. 

```kotlin
fun mapItem(item: NewsItem<*>) = when (item) {
	is NewsItem.NewTopic -> NewsItemDto(item.content.title, item.content.author)
	is NewItem.NewPost -> NewsItemDto(item.content.text, item.content.author)
	else -> throw IllegalArgumentException("This item cannot be converted")
}
```

### 봉인해서 까먹지 않기

현재 `when`에서는 `item` 객체의 타입에 따라 조건을 분기하고 있는데, 만약 이 상황에서 새로운 서브 클래스(`NewsList`)를 추가한다면 어떻게 될까?

```kotlin
abstract class NewsItem<out C> {
	val type: String
			get() javaClass.simpleName
	abstract val content: C

	data class NewsTopic(...) : NewsItem<TopicDetail>()
	data class NewsPost(...) : NewsItem<Post>()
	data class NewsList(...) : NewsItem<List>()
}

fun mapItem(item: NewsItem<*>) = when (item) {
	is NewsItem.NewTopic -> NewsItemDto(item.content.title, item.content.author)
	is NewItem.NewPost -> NewsItemDto(item.content.text, item.content.author)
	else -> throw IllegalArgumentException("This item cannot be converted")
}
```

`NewsList`가 추가되면 else문에 해당하기 때문에 `IllegalArgumentException`이 발생한다. 이는 의도하지 않은 오작동으로 볼 수 있다.

```kotlin
sealed class NewsItem<out C> {
	val type: String
			get() javaClass.simpleName
	abstract val content: C

	data class NewsTopic(...) : NewsItem<TopicDetail>()
	data class NewsPost(...) : NewsItem<Post>()
	data class NewsList(...) : NewsItem<List>()
}

fun mapItem(item: NewsItem<*>) = when (item) {
	is NewsItem.NewTopic -> NewsItemDto(item.content.title, item.content.author)
	is NewItem.NewPost -> NewsItemDto(item.content.text, item.content.author)
	else -> throw IllegalArgumentException("This item cannot be converted")
}
```

class 앞에 `sealed`를 추가하면 `when` 식에서 컴파일 오류가 발생한다. 따라서 처리하지 않은 `NewsList` 타입을 조건에 추가해줘야 컴파일 오류가 해결된다.

  

## 오버하지마

```kotlin
class Post(
    val id: Long?,
    val text: String,
    val author: AggregateReference<User, Long>,
    val topic: AggregateReference<Topic, Long>,
    val ceratedAt: Date,
    val updatedAt: Date
) {
    constructor(
        text: String, 
        author: AggregateReference<User, Long>,
        topic: AggregateReference<Topic, Long>,
        createdAt: Date
    ) : this(null, text, author, topic, createdAt, createdAt)
    
    constructor(
        text: String, 
        author: AggregateReference<User, Long>,
        topic: AggregateReference<Topic, Long>,
    ) : this(null, text, author, topic, Date())   
}
```

```kotlin
Post(null, "", Ref.to(authorId), Ref.to(topicId), Date(), Date())
Post(null, "", Ref.to(authorId), Ref.to(topicId), Date())
Post(null, "", Ref.to(authorId), Ref.to(topicId))
```

여기서 authorId와 topicId를 바꿔서 넣으면 어떻게 될까? → 타입이 같기 때문에 문제 없이 작동한다. 이는 오작동이고 실수이다. 

### 이름 붙인 인자(Named arguments)

```kotlin
Post (
	id = null,
	text = "...",
	author = AggregateReference.to(authorId)
	topic = AggregateReference.to(topicId),
	createdAt = Date(),
	updatedAt = Date()
)

Post (
	text = "..."
	author = AggregateReference.to(authorId),
	topic = AggregateReference.to(topicId),
	createdAt = Date()
)

Post(
	text = "..."
	author = AggregateReference.to(authorId),
	topic = AggregateReference.to(topicId)
)
```

- 순서와 무관하게 바인드하고자 하는 속성을 바인드 할 수 있다.
- 전달하는 인자의 순서를 바꿔도 무관하다.

### 기본 인자(Default arguments)

```kotlin
class Post (
	val id: Long? = null,
	val text: String,
	val author: AggregateReference<User, Long>,
	val topic: AggregateReference<Topic, Long>,
	val createdAt: Date = Date(),
	val updatedAt: Date = Date()
)

Post(
	text = "..."
	author = AggregateReference.to(authorId),
	topic = AggregateReference.to(topicId)
)
```

- 생성자의 파라미터를 작성할 때 기본값을 줄 수 있다.
- 전달하지 않은 인자는 기본값으로 세팅된다.

> 사실상 빌더 패턴을 언어 레벨에서 제공하고 있는 것이다.
> 

## 뭣이 중헌디

```kotlin
@SpringBootConfiguration
@EnableJdbcRepositories
class DataConfigurations : AbstractJdbcConfiguration() {
    
    @Bean
    fun dataSource(environment: Environment): DataSource {
        val type = environment.getRequiredProperty("type", EmbeddedDatabaseType::class.java)
        val scriptEncoding = environment.getProperty("script-encoding", "utf-8")
        val separator = environment.getProperty("seperator", ";")
        val scripts = environment.getProperty("scripts", List::class.java) 
            ?.map { it.toString() } 
            ?.toTypedArray()

        val builder = EmbeddedDatabaseBuilder()
        builder.setType(type)
        builder.setScriptEncoding(scriptEncoding)
        builder.setSeparator(separator)
        builder.addScripts(*scripts ?: emptyArray())
        return builder.build()
    }
}
```

```kotlin
val builder = EmbeddedDatabaseBuilder()
builder.setType(type)
builder.setScriptEncoding(scriptEncoding)
builder.setSeparator(separator)
builder.addScripts(*scripts ?: emptyArray())
builder.build()
```

### 스코프 함수로 가독성 높이기

```kotlin
@SpringBootConfiguration
@EnableJdbcRepositories
class DataConfigurations : AbstractJdbcConfiguration() {

	@Bean
	fun datasource(environmnet: Environment) : DataSource {
		val type = environment.getRequiredProperty(
			"type",
			EmbeddedDatabaseType::class.java
		)
		val scriptEncoding = environment.getProperty()
		// ...

		return EmbeddedDatabaseBuilder().apply {
			setType(type)
			setScriptEncoding(scriptEncoding)
			setSeprator(seperator)
			addScript(*scripts ?: emptyArray())
		}.build()
	}

}
```

```kotlin
EmbeddedDatabaseBuilder().apply {
	setType(type)
	setScriptEncoding(scriptEncoding)
	setSeprator(seperator)
	addScript(*scripts ?: emptyArray())
}.build()
```

- 스코프함수 중 하나인 apply를 사용해서 EmbeddedDatabaseBuilder의 프로퍼티에 접근할 수 있다.
    - builder 변수를 일일히 사용하지 않고, this로 프로퍼티를 세팅하면 된다. (this는 생략 가능)

```kotlin
var arawn = Traveler("arawn", "Seoul", 1000)
arawn.moveTo("New York")
arawn.pay(10)

val grizz = Traveler("Grizz", "Seoul", 1000).let {
	it.moveTo("London")
	it.pay(10)
}

val dan = Traveler("Dan").apply {
	moveTo("Vencouver")
	earn(50)
}

travelerRepository.findByName("Root")?.run {
	moveTo("Firenze")
}
```

### 편하고 안전하게 꺼내쓰기(with Kotlin support)

```kotlin
@SpringBootConfiguration
@EnableJdbcRepositories
class DataConfigurations : AbstractJdbcConfiguration() {
    
    @Bean
    fun dataSource(environment: Environment): DataSource {
        val type = environment.getRequiredProperty("type", EmbeddedDatabaseType::class.java)
        val scriptEncoding = environment.getProperty("script-encoding", "utf-8")
        val separator = environment.getProperty("seperator", ";")
        val scripts = environment.getProperty("scripts", List::class.java) 
            ?.map { it.toString() } 
            ?.toTypedArray()

		return EmbeddedDatabaseBuilder().apply {
			setType(type)
			setScriptEncoding(scriptEncoding)
			setSeprator(seperator)
			addScript(*scripts ?: emptyArray())
		}.build()
    }
}
```

확장함수를 이용하면 편하고 안전하게 환경 변수를 꺼내서 쓸 수 있다.

```kotlin
@SpringBootConfiguration
@EnableJdbcRepositories
class DataConfigurations : AbstractJdbcConfiguration() {
    
    @Bean
    fun dataSource(environment: Environment): DataSource {
        val type = environment.getRequiredProperty<EmbeddedDatabaseType>("type")
        val scriptEncoding = environment.get("scriptEncoding") ?: "utf-8"
        val separator = environment.get("seperator") ?: ";"
        val scripts = environment.getProperty<Array<String>>("scripts")

		return EmbeddedDatabaseBuilder().apply {
			setType(type)
			setScriptEncoding(scriptEncoding)
			setSeprator(seperator)
			addScript(*scripts ?: emptyArray())
		}.build()
    }
}
```

### 확장함수(Extension functions)

- 확장함수 : 어떤 클래스의 멤버 메서드인 것처럼 호출할 수 있지만, 그 클래스 밖에 선언된 함수

```kotlin
inline fun <reified T> PropertyResolver.getProperty(key: String) : T? = 
	getProperty(key, T::class.java)
```

- Environment는 PropertyResolver를 상속한다.
- 스프링은 PropertyResolver를 확장해 몇가지 편의 기능을 코틀린의 확장 함수로 제공한다.

## 참고자료
- [#살아있다 #자프링외길12년차 #코프링2개월생존기](https://www.youtube.com/watch?v=RBQOlv0aRl4)