# java-test-fixtures

- [java-test-fixtures](#java-test-fixtures)
  - [사용하기](#사용하기)
  - [test-fixtures jar](#test-fixtures-jar)
  - [참고](#참고)

java-test-fixtures는 gradle 5.6부터 추가된 플러그인이다.

test를 작성하다보면 테스트를 위한 더미데이터를 만드는 것도 리소스를 소모한다. 테스트 더미 데이터를 어디에서 관리할 지를 정하는 것도 큰 리소스이다.

`src/main`에서 테스트 더미를 관리하면 해당 모듈을 의존하는 다른 모듈에서 모르고 사용할 가능성도 있고 `src/test`는 다른 모듈에서 의존할 방법이 없으므로 중복해서 더미 데이터를 만들수 밖에 없다. (또는 테스트 더미용 모듈을 만들어서 관리할수는 있다.

```java
public class Post {
    private final String title;
    private final String content;
    private final PostStatus status;

    private final int like;
    private final int dislike;

    private final List<Comment> comments;
    private final List<HashTag> hashTags;

    public Post(String title,
                String content,
                PostStatus status,
                List<Comment> comments,
                List<HashTag> hashTags) {
        this.title = title;
        this.content = content;
        this.status = status;
        this.comments = comments;
        this.hashTags = hashTags;
    }
}

public enum PostStatus {
    DISPLAY,
    BLOCK,
    DELETED
}

public class Comment {
    private final String content;
    private final int like;
    private final int dislike;

    public Comment(String content, int like, int dislike) {
        this.content = content;
        this.like = like;
        this.dislike = dislike;
    }
}

public class HashTag {
    private final String value;

    public HashTag(String value) {
        this.value = value;
    }
}
```

위와 같이 게시판 글, 댓글, 해시태그를 표현하는 도메인 모델이 위와 같다고 가정한다. 이때 게시판 글 `Post` 테스트를 하기 위해서는 다음과 같이 생성이 필요하다.

```java
@Test
void post() {
  Post post = new Post(
          "title",
          "content",
          PostStatus.DISPLAY,
          Collections.emptyList(),
          Collections.emptyList()
  );

  // ...
}
```

만약 comment나 hashTag가 있는 글이라면 다음과 같이 생성을 해야한다.

```java
@Test
void post2() {
  Comment comment1 = new Comment("content1", 0, 0);
  Comment comment2 = new Comment("content2", 1, 0);
  
  HashTag hashTag = new HashTag("hashTag");
  
  Post post = new Post(
          "title",
          "content",
          PostStatus.DISPLAY,
          List.of(comment1, comment2),
          List.of(hashTag)
  );

  // ...
}
```

만약 인기글의 기준이 comment가 30개 이상인 글이라고 하는 경우 인기글을 생성하기 위해서는 30개의 comment를 생성해야한다.

```java
@Test
void hotPost() {
    Comment comment1 = new Comment("content1", 0, 0);
    Comment comment2 = new Comment("content2", 0, 0);
    Comment comment3 = new Comment("content3", 0, 0);
    Comment comment4 = new Comment("content4", 0, 0);
    Comment comment5 = new Comment("content5", 0, 0);
    Comment comment6 = new Comment("content6", 0, 0);
    Comment comment7 = new Comment("content7", 0, 0);
    Comment comment8 = new Comment("content8", 0, 0);
    Comment comment9 = new Comment("content9", 0, 0);
    Comment comment10 = new Comment("content10", 0, 0);
    Comment comment11 = new Comment("content11", 0, 0);
    Comment comment12 = new Comment("content12", 0, 0);
    Comment comment13 = new Comment("content13", 0, 0);
    Comment comment14 = new Comment("content14", 0, 0);
    Comment comment15 = new Comment("content15", 0, 0);
    Comment comment16 = new Comment("content16", 0, 0);
    Comment comment17 = new Comment("content17", 0, 0);
    Comment comment18 = new Comment("content18", 0, 0);
    Comment comment19 = new Comment("content19", 0, 0);
    Comment comment20 = new Comment("content20", 0, 0);
    Comment comment21 = new Comment("content21", 0, 0);
    Comment comment22 = new Comment("content22", 0, 0);
    Comment comment23 = new Comment("content23", 0, 0);
    Comment comment24 = new Comment("content24", 0, 0);
    Comment comment25 = new Comment("content25", 0, 0);
    Comment comment26 = new Comment("content26", 0, 0);
    Comment comment27 = new Comment("content27", 0, 0);
    Comment comment28 = new Comment("content28", 0, 0);
    Comment comment29 = new Comment("content29", 0, 0);
    Comment comment30 = new Comment("content30", 0, 0);

    HashTag hashTag = new HashTag("hashTag");

    Post post = new Post(
            "title",
            "content",
            PostStatus.DISPLAY,
            List.of(comment1, comment2, comment3, comment4, comment5, comment6, comment7, comment8, comment9, comment10, comment11, comment12, comment13, comment14, comment15, comment16, comment17, comment18, comment19, comment20, comment21, comment22, comment23, comment24, comment25, comment26, comment27, comment28, comment29, comment30),
            List.of(hashTag)
    );
    
    // ...
}
```

> 물론 for문이나 Stream을 통해 간략하게 만들수도 있다... 위 예시는 보기만해도 숨막히게 일부러 구성해보았다.
> 

인기글 같은 경우는 테스트 픽스처를 만들기 매우 번거로우므로 private 메서드를 통해 인기글 픽스처를 만들 수 있다.

```java
@Test
void hotPost2() {
  Post post = createHotPost(); 

  // ...
}

private Post createHotPost() {
  Comment comment1 = new Comment("content1", 0, 0);
  Comment comment2 = new Comment("content2", 0, 0);
  Comment comment3 = new Comment("content3", 0, 0);
  Comment comment4 = new Comment("content4", 0, 0);
  Comment comment5 = new Comment("content5", 0, 0);
  Comment comment6 = new Comment("content6", 0, 0);
  Comment comment7 = new Comment("content7", 0, 0);
  Comment comment8 = new Comment("content8", 0, 0);
  Comment comment9 = new Comment("content9", 0, 0);
  Comment comment10 = new Comment("content10", 0, 0);
  Comment comment11 = new Comment("content11", 0, 0);
  Comment comment12 = new Comment("content12", 0, 0);
  Comment comment13 = new Comment("content13", 0, 0);
  Comment comment14 = new Comment("content14", 0, 0);
  Comment comment15 = new Comment("content15", 0, 0);
  Comment comment16 = new Comment("content16", 0, 0);
  Comment comment17 = new Comment("content17", 0, 0);
  Comment comment18 = new Comment("content18", 0, 0);
  Comment comment19 = new Comment("content19", 0, 0);
  Comment comment20 = new Comment("content20", 0, 0);
  Comment comment21 = new Comment("content21", 0, 0);
  Comment comment22 = new Comment("content22", 0, 0);
  Comment comment23 = new Comment("content23", 0, 0);
  Comment comment24 = new Comment("content24", 0, 0);
  Comment comment25 = new Comment("content25", 0, 0);
  Comment comment26 = new Comment("content26", 0, 0);
  Comment comment27 = new Comment("content27", 0, 0);
  Comment comment28 = new Comment("content28", 0, 0);
  Comment comment29 = new Comment("content29", 0, 0);
  Comment comment30 = new Comment("content30", 0, 0);

  HashTag hashTag = new HashTag("hashTag");

  return new Post(
          "title",
          "content",
          PostStatus.DISPLAY,
          List.of(comment1, comment2, comment3, comment4, comment5, comment6, comment7, comment8, comment9, comment10, comment11, comment12, comment13, comment14, comment15, comment16, comment17, comment18, comment19, comment20, comment21, comment22, comment23, comment24, comment25, comment26, comment27, comment28, comment29, comment30),
          List.of(hashTag)
  );
}
```

private 메서드를 만들면 같은 테스트 클래스에서는 인기글 테스트 픽스처를 만들기 수월해진다.

다만, 다른 테스트 클래스에서는 위와 똑같은 테스트 픽스처 생성 메서드를 필요로 할 수 있다. 만약 자주 사용되는 픽스처라면 테스트 생성 팩토리를 정의할 수 있다.

```java
public class HotPostFactory {
  public static Post createHotPost() {
    Comment comment1 = new Comment("content1", 0, 0);
    Comment comment2 = new Comment("content2", 0, 0);
    Comment comment3 = new Comment("content3", 0, 0);
    Comment comment4 = new Comment("content4", 0, 0);
    Comment comment5 = new Comment("content5", 0, 0);
    Comment comment6 = new Comment("content6", 0, 0);
    Comment comment7 = new Comment("content7", 0, 0);
    Comment comment8 = new Comment("content8", 0, 0);
    Comment comment9 = new Comment("content9", 0, 0);
    Comment comment10 = new Comment("content10", 0, 0);
    Comment comment11 = new Comment("content11", 0, 0);
    Comment comment12 = new Comment("content12", 0, 0);
    Comment comment13 = new Comment("content13", 0, 0);
    Comment comment14 = new Comment("content14", 0, 0);
    Comment comment15 = new Comment("content15", 0, 0);
    Comment comment16 = new Comment("content16", 0, 0);
    Comment comment17 = new Comment("content17", 0, 0);
    Comment comment18 = new Comment("content18", 0, 0);
    Comment comment19 = new Comment("content19", 0, 0);
    Comment comment20 = new Comment("content20", 0, 0);
    Comment comment21 = new Comment("content21", 0, 0);
    Comment comment22 = new Comment("content22", 0, 0);
    Comment comment23 = new Comment("content23", 0, 0);
    Comment comment24 = new Comment("content24", 0, 0);
    Comment comment25 = new Comment("content25", 0, 0);
    Comment comment26 = new Comment("content26", 0, 0);
    Comment comment27 = new Comment("content27", 0, 0);
    Comment comment28 = new Comment("content28", 0, 0);
    Comment comment29 = new Comment("content29", 0, 0);
    Comment comment30 = new Comment("content30", 0, 0);

    HashTag hashTag = new HashTag("hashTag");

    return new Post(
            "title",
            "content",
            PostStatus.DISPLAY,
            List.of(comment1, comment2, comment3, comment4, comment5, comment6, comment7, comment8, comment9, comment10, comment11, comment12, comment13, comment14, comment15, comment16, comment17, comment18, comment19, comment20, comment21, comment22, comment23, comment24, comment25, comment26, comment27, comment28, comment29, comment30),
            List.of(hashTag)
    );
  }
}
```

> 테스트용이므로 `java/test` 내에 선언한다.

위와 같이 생성하면 다른 테스트 클래스에서도 인기글 테스트 픽스처를 손쉽게 생성할 수 있다.

```java
@Test
void hotPost {
  Post hotPost = HotPostFactory.createHotPost();

  // ...
}
```

이렇게 되면 테스트 데이터 준비 과정을 줄일 수 있고 보다 가독성 있는 테스트를 구성할 수 있다.

다만, gradle 멀티 모듈 구성에서는 앞서 정의한 `HotPostFactory`를 사용할 수 없다. 다른 모듈에서 중복으로 생성하거나 별도 테스트용 모듈을 정의해서 `testImplementation` 할 수 있도록 만들어야한다.

```
├── domain
│   ├── build.gradle
│   └── src
│       └── main
│       │   └── edu
│       │       └── pkch
│       │           └── domain
│       │               ├── Post.java
│       │               ├── Comment.java
│       │               ├── HashTag.java
│       │
|       └── test
│           └── edu
│               └── pkch
│                   └── domain
│                   │   ├── PostTest.java
│                   │   ├── HotPostTest.java
│                   │
│                   └── support
│                       ├── HotPostFactory.java
│
│
├── test-support
    ├── build.gradle
    └── src
        └── main
            └── edu
                └── pkch
                    └── support
                        ├── HotPostFactory.java
```

위와 같이 `test-support`라는 테스트 모듈을 정의해서 타모듈에서 사용할 수 있도록 만들수있다.

```groovy
// build.gradle
dependencies {
	testImplementation project(":test-support")
}
```

이를 통해서 test-support 모듈의 `edu.pkch.support.HotPostFactory`를 타 모듈에서도 사용할 수 있다.

단, `HotPostFactory` 하나만 관리를 하는 경우 모듈 생성에 부담이 있을 수 있고 그렇다고 테스트 하위의 support 패키지로 모듈마다 사용을 한다면 중복을 감수하고 사용을 해야할 것이다.

이런 문제를 해결하기 위해 중복을 제거하고 테스트 픽스처를 별도로 의존받을 수 있도록 **java-test-fixtures** 플러그인이 도와준다.

## 사용하기

먼저 java-test-fixture 플러그인을 등록한다.

```groovy
plugins {
  id 'java'
  id 'java-library'
  id 'java-test-fixtures'
}
```

> 참고로 java-test-fixtures는 java나 java-library 플러그인을 필요로한다.

위와 같이 플러그인 설정하면 testFixtures라는 SourceSet이 자동으로 생성되며 testFixtures 폴더 하위에 테스트 더미를 작성할 수 있다.

```
├── domain
    ├── build.gradle
    └── src
        └── main
        │    └── edu
        │       └── pkch
        │           └── domain
        │               ├── Post.java
        │               ├── Comment.java
        │               ├── HashTag.java
        │
        └── test
        │     └── edu
        │        └── pkch
        │            └── domain
        │               ├── PostTest.java
        │               ├── HotPostTest.java
        └── testFixtures
              └── edu
                └── pkch
                    └── domain
                        ├── HotPostFactory.java    
```

`java-test-fixtures` 플러그인을 추가하면 `src/testFixtures` 하위에 테스트 픽스처를 생성할 수 있다.

위와 같이 `src/testFixtures`에 정의하고 `HotPostFactory`를 만들어서 사용하면 된다. 같은 모듈에서는 별도 testFixtures 주입없이 사용이 가능하다.

만약 타 모듈에서 `domain` 모듈의 `testFixtures`에 정의된 `HotPostFactory`을 사용하려면 다음과 같이 주입이 필요하다.

```groovy
// build.gradle
dependencies {
  testImplementation testFixtures(project(":domain"))
}
```

t위와 같이 `testImplementation`으로 테스트에서 사용이 가능하다.

## test-fixtures jar

test-fixtures를 사용하게 되면 빌드시 test-fixtures용 jar도 함께 생성된다.

<img width="558" alt="test-fixture-1" src="https://user-images.githubusercontent.com/30178507/158815277-471268de-40da-4278-9e07-0ec46c19bbaa.png">

빌드시 `java-test-fixtures` 플러그인에 의해 추가된 테스트인 `testFixturesClasses`, `testFixturesJar`도 함께 실행되기 때문이다. `testImplementation`으로 testFixtures 의존을 받는다는 것은 결국 위 test-fixtures jar를 받는다는 의미이다.

따라서 test-fixtures jar 생성을 못하도록 설정을 하면 testFixtures에 정의한 클래스를 사용할 수 없다.

```groovy
// domain 모듈 build.gradle

testFixturesJar.enabled = false
```

위와 같이 설정을 하고 빌드하면 test-fixtures jar는 생성이 되지 않는다.

<img width="558" alt="test-fixture-2" src="https://user-images.githubusercontent.com/30178507/158815287-dcdfe084-2efb-42bb-8298-98ac77958c38.png">

이렇게 만들고 난 뒤 타 모듈에서 domain의 testFixtures에서 정의한 HotPostFactory를 사용하면 다음과 같이 `java.lang.NoClassDefFoundError`가 발생한다.

```
PostServiceTest > post() FAILED
    java.lang.NoClassDefFoundError at PostServiceTest.java:10
        Caused by: java.lang.ClassNotFoundException at PostServiceTest.java:10
```

이를 통해서 `java-test-fixtures`는 위 test-fixtures jar를 기반으로 의존성 주입을 지원하는걸 확인할 수 있다. testFixturesJar도 jar 테스크를 확장하고 있기 때문에 jar에서 지원하는 기능을 사용할 수 있다.

```groovy
// domain 모듈 build.gradle
testFixturesJar {
    archiveVersion = ''
}
```

만약 위와 같이 설정을 한다면 버전정보는 사라지며 `domain-test-fixtures.jar` 라는 이름의 jar로 생성이 된다.

<img width="558" alt="test-fixture-3" src="https://user-images.githubusercontent.com/30178507/158815294-0234409c-c9d8-45c1-9d1b-cc1f111a82d2.png">

> Jar 테스크는 다음 문서를 참고할 수 있다. [https://docs.gradle.org/current/dsl/org.gradle.api.tasks.bundling.Jar.html](https://docs.gradle.org/current/dsl/org.gradle.api.tasks.bundling.Jar.html)

## 참고

Using test fixtures 참고: [https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures)