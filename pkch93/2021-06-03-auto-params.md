# AutoParams

C#의 테스트 데이터 생성 라이브러리인 [AutoFixture](https://github.com/AutoFixture/AutoFixture)에 영감을 받아 작성된 라이브러리이다.

AutoFixture와 같이 테스트 데이터를 자동으로 생성하도록 만들어주는 라이브러리이다. Junit의 `@ParameterizedTest`와 함께 사용되어 테스트의 파라미터로 필요한 데이터를 주입받아 사용할 수 있도록 지원해준다.

`junit-jupiter-params`의 `@ValueSource`, `@CsvSource` 같이 `@AutoSource`를 테스트 메서드에 붙임으로써 테스트 데이터 자동 생성을 지원한다.

## 사용하기

AutoParams는 JDK 1.8 이상부터 지원한다. 의존성은 다음과 같이 주입하면 된다.

```groovy
// build.gradle
testImplementation 'io.github.javaunit:autoparams:0.2.2'
```

## 기능

Primitive부터 Java에서 지원하는 기본 Object `String, UUID, BigInteger 등`, Enum, Collection 등의 자동 데이터 생성을 지원한다. 지원하는 타입은 다음과 같다.

- int
- long
- float
- double
- boolean
- char
- String
- UUID
- BigInteger

> 위 기준은 AutoParams의 github에서 소개한 타입을 기준으로 함.
위 타입말고도 LocalDateTime, BigDecimal 등도 지원하는 듯 보임.

- Arrays
- List
- Set
- Map
- Stream

```java
@ParameterizedTest
@AutoSource
void integerAutoParams(int x, int y) {
  // given & when
  int actual = Integer.sum(x, y);
  System.out.println(String.format("x: %d / y: %d", x, y));

  // then
  assertThat(actual).isEqualTo(x + y);
}
```

위와 같이 테스트 메서드에 `@AutoSource`를 사용하여 int 값을 자동으로 주입받을 수 있다. 위 타입들은 위와 같이 사용가능하다.

참고로 int와 Integer의 경우는 `javax.validation.constraints.Max`와 `javax.validation.constraints.Min`으로 생성되는 값의 최대 최소 값을 설정할 수 있다.

```java
@ParameterizedTest
@AutoSource
void integerAutoParamsWithMinMax(@Min(1) @Max(10) int x) {
    assertThat(x >= 1).isTrue();
    assertThat(x <= 10).isTrue();

    System.out.println(String.format("x: %d", x));
}
```

그밖에 `junit-jupiter-params`에서 지원하는 `@ValueSource`나 `@CsvSource`도 각각 `@ValueAutoSource`와 `@CsvAutoSource`로 지원한다.

```java
@ParameterizedTest
@CsvAutoSource({"16, foo"})
void testMethod(int arg1, String arg2, String arg3) {
    assertEquals(16, arg1);
    assertEquals("foo", arg2);
    assertNotEquals(arg2, arg3);
}

class ValueContainer {

    private final String value;

    public ValueContainer(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

}

@ParameterizedTest
@ValueAutoSource(strings = {"foo"})
void testMethod(@Fixed String arg1, String arg2, ValueContainer arg3) {
    assertEquals("foo", arg2);
    assertEquals("foo", arg3.getValue());
}
```

`@Fixed`는 `@Fixed`가 붙은 파라미터가 이후에 나타나는 파라미터의 값을 고정시킨다. 만약 중간에 타입이 달라지거나 `@Fixed`가 붙은 파라미터 이전의 인자들은 값을 고정시키지 않는다.

위 예시에서는 ValueContainer의 value가 String이므로 이 값이 `foo`로 고정된다.

### Customization

앞선 기능들은 대부분 자동으로 데이터를 만들어준다. 다만, 자동으로 만들어 주는 데이터들이 테스트하려는 비즈니스에 맞지 않는 경우도 있을 것이다. 따라서 비즈니스 요구사항에 맞는 제약사항을 반영한 테스트 데이터가 필요할 수 있다.

이를 위해서 AutoParams에서는  `Customizer` 인터페이스와 `@Customization` 어노테이션을 통해서 테스트 데이터에 대한 자동 생성을 지원한다.

```java
public static class PostCustomization implements Customizer {
  @Override
  public ObjectGenerator customize(ObjectGenerator generator) {
    return (query, context) -> query.getType().equals(Post.class)
            ? new ObjectContainer(factory(context))
            : generator.generate(query, context);
  }

  private Post factory(ObjectGenerationContext context) {
    UUID id = (UUID) context.generate(() -> UUID.class);
    LocalDateTime createdAt = LocalDateTime.now();
    LocalDateTime modified = LocalDateTime.now();
    boolean deleted = false;

    String title = generateRandomString(ThreadLocalRandom.current().nextInt(100));
    String content = generateRandomString(ThreadLocalRandom.current().nextInt(1000));

    return new Post(id, title, content, createdAt, modified, deleted);
  }

  private String generateRandomString(int length) {
    byte[] bytes = new byte[length];
    new Random().nextBytes(bytes);

    return new String(bytes, StandardCharsets.UTF_8);
  }
}

@Getter
public static class Post {
  private UUID id;
  private String title;
  private String content;
  private LocalDateTime createdAt;
  private LocalDateTime modifiedAt;

  private boolean deleted;

  public Post(UUID id, String title, String content, LocalDateTime createdAt, LocalDateTime modifiedAt, boolean deleted) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
    this.deleted = deleted;
  }

  @Override
  public String toString() {
    return "Post{" +
            "id=" + id +
            ", title='" + title + '\'' +
            ", content='" + content + '\'' +
            ", createdAt=" + createdAt +
            ", modifiedAt=" + modifiedAt +
            ", deleted=" + deleted +
            '}';
  }
}
```

Post가 기본적으로 `deleted`가 `false`이고 타이틀이 100자 이내, 글 내용이 1000자 이내라고 가정할 때 `org.javaunit.autoparams.customization.Customizer`를 구현한 PostCustomization를 통해 처리할 수 있다.

파라미터가 `Post` 타입이라면 직접 커스텀한 Post 인스턴스 객체를 생성하여 전달하도록 만든다. 이렇게 PostCustomization를 구현한 뒤 다음과 같이 사용하고자 하는 테스트 메서드에 `@Customization`으로 등록하여 적용할 수 있다.

```java
@ParameterizedTest
@AutoSource
@Customization(PostCustomization.class)
void postCustomization(Post post) {
  System.out.println(post);
}
```

위와 같이 `@Customization(PostCustomization.class)`를 달아서 PostCustomization으로 설정한 사항이 적용된다.

### 참고

AutoParams github: [https://github.com/JavaUnit/AutoParams](https://github.com/JavaUnit/AutoParams)