# Spring Data Redis와 JSON 직렬화 

Spring Data Redis는 기본적으로 Java 직렬화를 지원한다. 즉, Spring Data Redis의 RedisTemplate이 별도 직렬화 설정을 하지 않는다면 Java 직렬화로 객체를 직렬화한다.

> JdkSerializationRedisSerializer 참고

```java
@Configuration
public class RedisConfiguration {
  @Bean
  public RedisTemplate<?, ?> redisTemplate(LettuceConnectionFactory connectionFactory) {
    RedisTemplate<?, ?> redisTemplate = new RedisTemplate<>();
    redisTemplate.setConnectionFactory(connectionFactory);
    return redisTemplate;
  }
}
```

위와 같이 RedisTemplate에 대한 설정이 가능하다.

```java
@RestController
@RequestMapping("/java")
public class JavaSerializingController {
    private static final String JAVA_SERIALIZE_KEY = "java_person";

    @Resource(name = "redisTemplate")
    private ValueOperations<String, Object> valueOperations;

    @GetMapping("/serialize")
    public void serialize() {
        Person person = new Person("pkch", 29);
        valueOperations.set(JAVA_SERIALIZE_KEY, person);
    }

    @GetMapping("/deserialize")
    public ResponseEntity<?> deserialize() {
        return ResponseEntity.ok(valueOperations.get(JAVA_SERIALIZE_KEY));
    }
}

public class Person {
  private String name;
  private int age;

  public Person(String name, int age) {
    this.name = name;
    this.age = age;
  }

  public String getName() {
    return name;
  }

  public int getAge() {
    return age;
  }
}
```

이때 만약 Java 직렬화를 사용하기 위한 Serializable을 구현하지 않는다면 다음과 같은 에러가 나타난다.

```bash
$ curl http://localhost:8080/java/serialize
```

위 JavaSerializingController의 `/java/serialize` 는 Person 객체를 직렬화하는 api이다. 이를 호출하면 다음과 같이 에러가 발생한다.

```
java.lang.IllegalArgumentException: DefaultSerializer requires a Serializable payload but received an object of type [edu.pkch.redis.serialize.pojo.Person]
```

때문에 Person 객체를 Java 직렬화를 사용할 수 있도록 Serializable을 구현하면 해결할 수 있다.

```java
public class Person implements Serializable {
  private String name;
  private int age;

  public Person(String name, int age) {
    this.name = name;
    this.age = age;
  }

  public String getName() {
    return name;
  }

  public int getAge() {
    return age;
  }
}
```

위와 같이 Serializable을 구현하면 Person 객체는 Java 직렬화를 사용할 수 있으므로 아래와 같이 직렬화되어 Redis에 저장된다.

```
127.0.0.1:6379> get "\xac\xed\x00\x05t\x00\x0bjava_person"
"\xac\xed\x00\x05sr\x00$edu.pkch.redis.serialize.pojo.Person\x8b=\xbb\xb0\x9a1\xc6\x18\x02\x00\x02I\x00\x03ageL\x00\x04namet\x00\x12Ljava/lang/String;xp\x00\x00\x00\x1dt\x00\x04pkch"
```

이렇게 Redis에 Person 객체를 저장한 상태에서 저장된 Person을 역직렬화하는 JavaSerializingController의 `/java/deserialize` 를 호출하면 다음과 같은 결과가 나타난다.

```bash
$ curl http://localhost:8080/java/deserialize

{"name":"pkch","age":29}
```

단, 위와 같이 Java 직렬화를 활용하는 JdkSerializationRedisSerializer를 사용하면 redis에 저장할 때 클래스에 대한 부가정보를 같이 저장하게 된다.

`new Person("pkch", 29)`에 대한 redis 저장은 다음과 같다.

```
key: "\xac\xed\x00\x05t\x00\x0bjava_person"
value: "\xac\xed\x00\x05sr\x00$edu.pkch.redis.serialize.pojo.Person\x8b=\xbb\xb0\x9a1\xc6\x18\x02\x00\x02I\x00\x03ageL\x00\x04namet\x00\x12Ljava/lang/String;xp\x00\x00\x00\x1dt\x00\x04pkch"
```

## Redis Data Json 직렬화

앞서 살펴본 Spring Data Redis의 기본 직렬화 도구인 JdkSerializationRedisSerializer를 사용하면 불필요한 Java 클래스 정보를 저장한다. 또한 Java 직렬화의 단점을 그대로 가지게 된다.

따라서 Java 직렬화를 그대로 사용하기보다는 일반적으로 데이터 직렬화에 많이 사용하는 Json 직렬화를 RedisTemplate에 적용한다.

```java
@Configuration
public class RedisConfiguration {
  @Bean
  public RedisTemplate<?, ?> redisTemplate(LettuceConnectionFactory connectionFactory) {
    RedisTemplate<?, ?> redisTemplate = new RedisTemplate<>();
    redisTemplate.setConnectionFactory(connectionFactory);
    redisTemplate.setKeySerializer(new StringRedisSerializer());
    redisTemplate.setValueSerializer(new GenericJackson2JsonRedisSerializer());
    return redisTemplate;
  }
}
```

위와 같이 key와 value Serializer를 각각 StringRedisSerializer와 GenericJackson2JsonRedisSerializer로 변경한다.

```java
@RestController
@RequestMapping("/json")
public class JsonSerializingController {
  private static final String JSON_SERIALIZE_KEY = "json_person";
  private static final Logger logger = LoggerFactory.getLogger(JsonSerializingController.class);

  @Resource(name = "redisTemplate")
  private ValueOperations<String, Object> valueOperations;

  @GetMapping("/serialize")
  public void serialize() {
    Person person = new Person("pkch", 29);
    valueOperations.set(JSON_SERIALIZE_KEY, person);
  }

  @GetMapping(value = "/deserialize")
  public ResponseEntity<Person> deserialize() {
    Person person = (Person) valueOperations.get(JSON_SERIALIZE_KEY);
    logger.info("deserialize person. name: {}, age: {}", person.getName(), person.getAge());
    return ResponseEntity.ok(person);
  }
}

public class Person {
  private String name;
  private int age;

  private Person() {}

  public Person(String name, int age) {
    this.name = name;
    this.age = age;
  }

  public String getName() {
    return name;
  }

  public int getAge() {
    return age;
  }
}
```

앞선 JavaSerializingController와 마찬가지로 JsonSerializingController를 정의하였다. `/json/serialize`와 `/json/deserialize` 는 각각 Person 객체를 직렬화하여 저장 / 역직렬화하여 조회하는 api이다.

```java
$ curl http://localhost:8080/json/serialize
```

위와 같이 `/json/serialize`를 호출하면 redis에는 다음과 같이 저장된다.

```
$ get json_person

"{\"@class\":\"edu.pkch.redis.serialize.pojo.Person\",\"name\":\"pkch\",\"age\":29}"
```

위와 같이 `json_person` 키로 조회하면 json 형태로 person 객체가 직렬화되어 저장된 것을 확인할 수 있다. 이때 `@class`를 키로 가지는 해당 json의 클래스 정보도 함께 저장된 것을 확인할 수 있다.

이는 GenericJackson2JsonRedisSerializer에서 기본적으로 `@class`로 클래스 정보를 넣어두도록 설정하기 때문이다.

```java
public GenericJackson2JsonRedisSerializer() {
  this((String) null);
}

public GenericJackson2JsonRedisSerializer(@Nullable String classPropertyTypeName) {

  this(new ObjectMapper());

  registerNullValueSerializer(mapper, classPropertyTypeName);

  if (StringUtils.hasText(classPropertyTypeName)) {
    mapper.enableDefaultTypingAsProperty(DefaultTyping.NON_FINAL, classPropertyTypeName);
  } else {
    mapper.enableDefaultTyping(DefaultTyping.NON_FINAL, As.PROPERTY);
  }
}
```

앞서 저장한 값을 `/json/deserialize`로 조회하면 다음과 같은 결과가 나온다.

```
$ curl http://localhost:8080/json/deserialize

{"name":"pkch","age":29}
```

참고로 RedisTemplate의 Operation들은 내부적으로 `ObjectMapper#readValue(byte[], Object)`를 사용한다. 

이때 readValue는 기본적으로 Json Object를 Java의 LinkedHashMap으로 변환한다.

```java
/**
 * ObjectMapper를 기본으로 사용하는 경우 Object 객체에 대해서 LinkedHashMap으로 deserialize 한다.
 *
 * @throws JsonProcessingException
 */
@Test
void readValueWithoutActivateDefaultTyping() throws JsonProcessingException {
  // given
  ObjectMapper objectMapper = new ObjectMapper();
  String personJson = "{\"@class\":\"edu.pkch.redis.serialize.pojo.Person\",\"name\":\"pkch\",\"age\":29}";

  // when
  LinkedHashMap<String, Object> actual = (LinkedHashMap<String, Object>) objectMapper.readValue(personJson, Object.class);

  // then
  assertThat(actual.get("@class")).isEqualTo("edu.pkch.redis.serialize.pojo.Person");
  assertThat(actual.get("name")).isEqualTo("pkch");
  assertThat(actual.get("age")).isEqualTo(29);
}

/**
 * ObjectMapper에서 activateDefaultTyping를 사용하게되면 @class의 정보를 가지고 객체를 직렬화한다.
 *
 * @throws JsonProcessingException
 */
@Test
void readValueWithActivateDefaultTyping() throws JsonProcessingException {
  // given
  ObjectMapper objectMapper = new ObjectMapper();
  objectMapper.activateDefaultTyping(objectMapper.getPolymorphicTypeValidator(), ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);
  String personJson = "{\"@class\":\"edu.pkch.redis.serialize.pojo.Person\",\"name\":\"pkch\",\"age\":29}";

  // when
  Person actual = (Person) objectMapper.readValue(personJson, Object.class);

  // then
  assertThat(actual.getName()).isEqualTo("pkch");
  assertThat(actual.getAge()).isEqualTo(29);
}
```

만약 activateDefaultTyping을 사용한다면 `@class` 의 값을 토대로 역직렬화한다. 즉, LinkedHashMap 대신 Person으로 직렬화 할 수 있다.

> 참고로 위 activateDefaultTyping은 GenericJackson2JsonRedisSerializer의 설정을 그대로 따름

#### 참고. JSON과 매핑되는 Java Type

JSON | Java Type
:---: | :---:
object | LinkedHashMap<String, Object>
array | ArrayList\<Object>
string | String
number (no fraction) | Integer / Long / BigInteger
number (fraction) | Double / BigDecimal
true / false | Boolean
null | null

참고: [https://enterkey.tistory.com/392](https://enterkey.tistory.com/392)

### GenericJackson2JsonRedisSerializer와 ObjectMapper

앞서 살펴본 GenericJackson2JsonRedisSerializer의 기본 생성자는 `new ObjectMapper()`로 ObjectMapper의 기본 생성을 사용한다.

```java
public GenericJackson2JsonRedisSerializer() {
  this((String) null);
}

public GenericJackson2JsonRedisSerializer(@Nullable String classPropertyTypeName) {

  this(new ObjectMapper()); // default ObjectMapper

  registerNullValueSerializer(mapper, classPropertyTypeName);

  if (StringUtils.hasText(classPropertyTypeName)) {
    mapper.enableDefaultTypingAsProperty(DefaultTyping.NON_FINAL, classPropertyTypeName);
  } else {
    mapper.enableDefaultTyping(DefaultTyping.NON_FINAL, As.PROPERTY);
  }
}
```

거기에 `registerNullValueSerializer`와 `activateDefaultTyping`를 설정한다.

> 참고로 enableDefaultTyping은 deprecated된 API
enableDefaultTyping에서도 activateDefaultTyping를 그대로 사용한다.

```java
@Deprecated
public ObjectMapper enableDefaultTyping(DefaultTyping applicability, JsonTypeInfo.As includeAs) {
  return activateDefaultTyping(getPolymorphicTypeValidator(), applicability, includeAs);
}
```

GenericJackson2JsonRedisSerializer에서 제공하는 ObjectMapper 기본 설정 때문에 json에 `@class`가 추가되고 null을 처리하는 Serializer를 ObjectMapper에 등록한다.

다만, 이 ObjectMapper는 Spring Boot에서 기본으로 제공하는 ObjectMapper가 아니다. 따라서 Spring Boot의 기본 설정을 생각한다면 에러가 발생할 수 있다. 대표적으로 `DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES`이다.

`new ObjectMapper()`는 `DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES`를 true로 설정한다. 즉, 역직렬화시 json에 존재하는 필드가 클래스 필드로 존재하지 않는다면 `UnrecognizedPropertyException` 에러가 발생한다. 

반면 Spring Boot는 `DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES` 기능을 꺼둔채로 ObjectMapper 빈을 생성한다.

참고: [https://www.baeldung.com/spring-boot-customize-jackson-objectmapper](https://www.baeldung.com/spring-boot-customize-jackson-objectmapper)

```
$ get json_person

"{\"@class\":\"edu.pkch.redis.serialize.pojo.Person\",\"name\":\"pkch\",\"age\":29}"
```

만약 위와 같이 redis에 들어있다고 가정한다. 그런데 이제 person에 나이를 관리하는게 이슈가 되어서 age를 지워야한다는 요구사항이 있다.

```java
public class Person {

  private String name;

  private Person() {}

  public Person(String name) {
    this.name = name;
  }

  public String getName() {
    return name;
  }
}
```

따라서 Person에 age를 삭제한채로 배포를 하게 될텐데 이 상태에서 `/json/deserialize`를 호출하면 다음과 같은 에러가 나타난다.

```
com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException: Unrecognized field "age" (class edu.pkch.redis.serialize.pojo.Person), not marked as ignorable (one known property: "name"])
 at [Source: (byte[])"{"@class":"edu.pkch.redis.serialize.pojo.Person","name":"pkch","age":29}"; line: 1, column: 72] (through reference chain: edu.pkch.redis.serialize.pojo.Person["age"])
```

위 에러는 `new ObjectMapper()`가 `DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES`를 켜놓고 있기 때문이다. 따라서 기본 GenericJackson2JsonRedisSerializer를 사용한다면 Spring Boot에서 사용하는 ObjectMapper와 약간 상이하다는 것을 상기해야한다.

### Spring Boot의 ObjectMapper로 교체

사실 일관성있게 모든 ObjectMapper가 동일한 설정을 가지도록 하고 싶을 수 있다. 이를 위해서 `GenericJackson2JsonRedisSerializer(ObjectMapper)`를 활용할수도 있다.

GenericJackson2JsonRedisSerializer에 ObjectMapper를 인자로 받는 생성자도 존재한다. 이 생성자는 GenericJackson2JsonRedisSerializer의 mapper만 인자로 받은 ObjectMapper로 할당한다.

```java
public GenericJackson2JsonRedisSerializer(ObjectMapper mapper) {

  Assert.notNull(mapper, "ObjectMapper must not be null!");
  this.mapper = mapper;
}
```

위를 활용하여 다음과 같이 RedisConfiguration을 설정할 수 있다.

```java
@Configuration
public class RedisConfiguration {
  @Bean
  public RedisTemplate<?, ?> redisTemplate(LettuceConnectionFactory connectionFactory,
                                           ObjectMapper objectMapper) {
    RedisTemplate<?, ?> redisTemplate = new RedisTemplate<>();
    redisTemplate.setConnectionFactory(connectionFactory);
    redisTemplate.setKeySerializer(new StringRedisSerializer());
    redisTemplate.setValueSerializer(new GenericJackson2JsonRedisSerializer(objectMapper));
    return redisTemplate;
  }
}
```

Spring Boot에서 빈으로 등록한 ObjectMapper를 GenericJackson2JsonRedisSerializer의 ObjectMapper로 사용하도록 설정한 것이다.

이렇게 설정한 상태로 `/json/serialize`와 `/json/deserialize`를 호출해본다.

```
$ get json_person

"{\"name\":\"pkch\",\"age\":29}"
```

```
java.lang.ClassCastException: class java.util.LinkedHashMap cannot be cast to class edu.pkch.redis.serialize.pojo.Person (java.util.LinkedHashMap is in module java.base of loader 'bootstrap'; edu.pkch.redis.serialize.pojo.Person is in unnamed module of loader 'app')
```

전자는 먼저 `/json/serialize`를 호출한 결과로 redis에 저장된 내용이고 후자는 저장된 person 객체를 역질렬화할 때 에러가 발생한 것을 확인할 수 있다.

보면 Spring Boot가 기본 제공하는 ObjectMapper는 `activateDefaultTyping`를 하지 않아 `@class`가 직렬화시에 함께 저장되지 않았으며 역직렬화시에는 json object를 어떤 타입으로 역직렬화할 지 모르기 때문에 LinkedHashMap으로 역직렬화하게된다. 이때 LinkedHashMap을 Person으로 타입 캐스팅을 할 수 없기 때문에 에러가 발생한 것이다.

위 이슈로 GenericJackson2JsonRedisSerializer을 Spring Boot의 ObjectMapper로 교체하는 것은 사실상 불가능하다고 볼 수 있다. 차라리 새로운 ObjectMapper를 생성하여 `DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES`를 꺼두고 `activateDefaultTyping`와 `registerNullValueSerializer`를 설정해두는 것이 낫지 않을까 생각한다.

### 읽어보면 좋을만한글

RedisTemplate 을 이용해서 Multi Pojo get/set 할 때 이슈사항: [https://mongsil-jeong.tistory.com/25](https://mongsil-jeong.tistory.com/25)