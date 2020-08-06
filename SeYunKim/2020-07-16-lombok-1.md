# Lombok 사용법 1 (XXXArgsConstructor, Getter, Setter, ToString)

> [예제코드](https://github.com/ksy90101/Java-TIL-ex/tree/master/blog-ex-lombok)

### Lombok Dependecy 설정

```groovy
configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}x
```

```groovy
compileOnly 'org.projectlombok:lombok'
annotationProcessor 'org.projectlombok:lombok'
```

- `Configurations` : 의존성 그룹으로 dependencies를 통해  의존성 그룹에 라이브러리를 추가해주는 개념이다.
- `complieOnly`: 컴파일 시 필요한 라이브러리이다.
- `extendsFrom` : 컴파일 시 형식을 확장한다는 의미다.
- `annotationProcessor` : 일반적으로 Annotation에 대한 코드 베이스를 검사, 수정, 생성하는데 사용되며, 본질적으로 Java 컴파일러의 플로그인의 일종이다.

### IntelliJ IDEA에서의 Lombok 사용법

- 아래의 사진과 같이 Lombok Plugin을 설치한다.

![lombok-1-1](https://github.com/ksy90101/TIL/blob/master/java/image/lombok-1-1.png?raw=true)

- 아래 사진과 같이 `Enable annotation processing`을 체크한다.\

![lombok-1-2](https://github.com/ksy90101/TIL/blob/master/java/image/lombok-1-2.png?raw=true)

## @XXXArgsConstructor

### @NoArgsConstructor

- 기본 생성자 생성해주는 어노테이션이다.

```java
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class Member {
    private String email;
    private String name;
    private int age;
}
```

```java
public class Member {
    private String email;
    private String name;
    private int age;

    public Member() {
    }
}
```

```java
@Test
void noArgsConstructor() {
    Member member = new Member();
    assertThat(member).isNotNull();
}
```

### @AllArgsConstructor

- 모든 필드의 생성자를 만들어 준다.

```java
import lombok.AllArgsConstructor;

@AllArgsConstructor
public class AllMember {
    private String email;
    private String name;
    private int age;
}
```

```java
public class AllMember {
    private String email;
    private String name;
    private int age;

    public AllMember(final String email, final String name, final int age) {
        this.email = email;
        this.name = name;
        this.age = age;
    }
}
```

```java
@Test
void allArgsConstructorTest() {
    AllMember allMember = new AllMember("럿고@gmail.com", "럿고", 28);
    assertThat(allMember).isNotNull();
}
```

### @RequiredArgsConstructor

- `final` 또는 `@NonNull`이 붙어 있는 필드만생성자를 자동으로 생성한다.

```java
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class RequiredMember {
    private final String name;
    @NonNull
    private String email;
    private int age;
}
```

```java
import lombok.NonNull;

public class RequiredMember {
    private final String name;
    @NonNull
    private String email;
    private int age;

    public RequiredMember(final String name, @NonNull final String email) {
        if (email == null) {
            throw new NullPointerException("email is marked non-null but is null");
        } else {
            this.name = name;
            this.email = email;
        }
    }
}
```

```java
@Test
void name() {
    RequiredMember requiredMember = new RequiredMember("럿고", "럿고@gmail.com");
    assertThat(requiredMember).isNotNull();
}
```

### 속성 값

- `access` : 접근제어자를 지정할 수 있다.
    - `AccessLevel.PUBLIC` : 디폴트 값
    - `AccessLevel.PROTECTED`
    - `AccessLevel.PRIVATE`
    - `AccessLevel.PACKAGE`
    - `AccessLevel.MODULE`

- `force` : final  필드를 기본값으로 지정이 가능하다. - NoArgsConstructor에서만 있음.
- `onConstructor`: 생성자에 어노테이션을 작성할 수 있다.
- `staticName`: static한 생성자를 만들어준다.

```java
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@NoArgsConstructor(force = true, access = AccessLevel.PROTECTED)
@RequiredArgsConstructor(onConstructor = @__(@NonNull))
@AllArgsConstructor(staticName = "create", access = AccessLevel.PROTECTED)
public class AttributionMember {
    private final String email;
    private final String name;
    private int age;
}
```

```java
import lombok.NonNull;

public class AttributionMember {
    private final String email;
    private final String name;
    private int age;

    protected AttributionMember() {
        this.email = null;
        this.name = null;
    }

    @NonNull
    public AttributionMember(final String email, final String name) {
        this.email = email;
        this.name = name;
    }

    private AttributionMember(final String email, final String name, final int age) {
        this.email = email;
        this.name = name;
        this.age = age;
    }

    protected static AttributionMember create(final String email, final String name, final int age) {
        return new AttributionMember(email, name, age);
    }
}
```

```java
import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;

class AttributionMemberTest {
    @Test
    void forceTest() {
        AttributionMember attributionMember = new AttributionMember();
        assertThat(attributionMember).isNotNull();
    }

    @Test
    void onConstructorTest(){
        AttributionMember attributionMember =new AttributionMember("럿고@email.com","럿고");
        assertThat(attributionMember).isNotNull();
    }

    @Test
    void staticNameTest() {
        AttributionMember attributionMember =AttributionMember.create("럿고@email.com", "럿고", 28);
        assertThat(attributionMember).isNotNull();
    }
}
```

## @Getter & @Setter

### @Getter

- getter메서드를 생성해준다. 클래스 또는 필드에 가능하다.

```java
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class Member {
    private String email;
    private String name;
    private int age;
}
```

```java
public class Member {
    private String email;
    private String name;
    private int age;

    public Member(final String email, final String name, final int age) {
        this.email = email;
        this.name = name;
        this.age = age;
    }

    public String getEmail() {
        return this.email;
    }

    public String getName() {
        return this.name;
    }

    public int getAge() {
        return this.age;
    }
}
```

```java
@Test
void getterTest() {
    Member member = new Member("럿고@gmail.com", "럿고", 28);
    assertThat(member.getEmail()).isEqualTo("럿고@gmail.com");
    assertThat(member.getName()).isEqualTo("럿고");
    assertThat(member.getAge()).isEqualTo(28);
}
```

- 필드

```java
package blog.ex.lombok.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class FieldMember {
	@Getter
	private String name;
	private String email;
}
```

```java
public class FieldMember {
    private String name;
    private String email;

    public FieldMember(final String name, final String email) {
        this.name = name;
        this.email = email;
    }

    public String getName() {
        return this.name;
    }
}
```

```java
@Test
void fieldGetterTest() {
	FieldMember fieldMember = new FieldMember("럿고", "럿고@gmail.com");
	assertThat(fieldMember.getName()).isEqualTo("럿고");
}
```

### 속성값

- `@Getter(AccessLevel.PRIVATE)` 또는 `value()`
    - 접근제어자를 지정할 수 있다.
- `onMethod` : 메서드의 어노테이션을 작성할 수 있다.
- `onParam` : 파라미터의 어노테이션을 작성할 수 있는 속성이다.(setter 에만 존재)

```java
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@AllArgsConstructor
@Getter(value = AccessLevel.PROTECTED, onMethod = @__(@NonNull))
@Setter(value = AccessLevel.PROTECTED, onParam = @__(@NonNull))
public class Member {
    private String email;
    private String name;
    private int age;
}
```

```java
import lombok.NonNull;

public class Member {
    private String email;
    private String name;
    private int age;

    public Member(final String email, final String name, final int age) {
        this.email = email;
        this.name = name;
        this.age = age;
    }

    @NonNull
    protected String getEmail() {
        return this.email;
    }

    @NonNull
    protected String getName() {
        return this.name;
    }

    @NonNull
    protected int getAge() {
        return this.age;
    }

    protected void setEmail(@NonNull final String email) {
        if (email == null) {
            throw new NullPointerException("email is marked non-null but is null");
        } else {
            this.email = email;
        }
    }

    protected void setName(@NonNull final String name) {
        if (name == null) {
            throw new NullPointerException("name is marked non-null but is null");
        } else {
            this.name = name;
        }
    }

    protected void setAge(@NonNull final int age) {
        this.age = age;
    }
}
```

- `lazy` : getter에만 있는 속성으로 그대로 필드의 값을 지연시키는 것이다. 이때 무조건 final 필드여야 하며, 값이 false일 경우에는 객체 생성 시 값을 호출하지만, true일 경우에는 getter 메서드를 호출할 때  값을 호출한다.

## @ToString

```java
package blog.ex.lombok.domain.tostring;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.ToString;

@AllArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Member {
    private String email;
    private String name;
    private int age;
}
```

```java
public class Member {
    private String email;
    private String name;
    private int age;

    protected Member(final String email, final String name, final int age) {
        this.email = email;
        this.name = name;
        this.age = age;
    }

    public String toString() {
        return "Member(email=" + this.email + ", name=" + this.name + ", age=" + this.age + ")";
    }
}
```

```java
@DisplayName("toString 학습 테스트")
@Test
void toStringTest() {
    Member member = new Member("럿고@gmail.com", "럿고", 28);
    assertThat(member.toString()).isEqualTo("Member(email=럿고@gmail.com, name=럿고, age=28)");
}
```

### 속성값

- `exclude` : 특정 필드를 포함하지 않게 함.

```java
import lombok.AllArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@ToString(exclude = "name")
public class ExcludeMember {
    private String email;
    private String name;
    private int age;
}
```

```java
public class ExcludeMember {
    private String email;
    private String name;
    private int age;

    public ExcludeMember(final String email, final String name, final int age) {
        this.email = email;
        this.name = name;
        this.age = age;
    }

    public String toString() {
        return "ExcludeMember(email=" + this.email + ", age=" + this.age + ")";
    }
}
```

```java
@DisplayName("toString exclude 속성 학습 테스트")
@Test
void toStringExcludeTest() {
    ExcludeMember excludeMember = new ExcludeMember("럿고@gmail.com", "럿고", 28);
    assertThat(excludeMember.toString()).isEqualTo("ExcludeMember(email=럿고@gmail.com, age=28)");
}
```

- `includeFieldNames` : 필드 이름을 출력 여부
- `of` : 명시적으로 특정 필드를 포함하게 하는 것
- `callSuper` : 부모 클래스의 toString 호출
- `doNotUserGetters` : 기본적으로 getter가 있으면 해당 메소드가 호출된다. 이를 사용하지 않고 필드를 직접 호출하는 것

```java
import lombok.AllArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@ToString
public abstract class SuperMember {
    private Long id;
}
```

```java
import lombok.ToString;

@ToString(callSuper = true, of = {"age", "email"}, includeFieldNames = false, doNotUseGetters = true)
public class AttributesMember extends SuperMember {
    private final String email;
    private final String name;
    private final int age;

    public AttributesMember(Long id, String email, String name, int age) {
        super(id);
        this.email = email;
        this.name = name;
        this.age = age;
    }
}
```

```java
public class AttributesMember extends SuperMember {
    private final String email;
    private final String name;
    private final int age;

    public AttributesMember(Long id, String email, String name, int age) {
        super(id);
        this.email = email;
        this.name = name;
        this.age = age;
    }

    public String toString() {
        return "AttributesMember(super=" + super.toString() + ", " + this.email + ", " + this.age + ")";
    }
}
```

```java
@DisplayName("toString includeFieldNames, of, callSuper, doNotUserGetters 속성 학습 테스")
@Test
void attributesTest() {
    AttributesMember attributionMember = new AttributesMember(1L,"럿고@gmail.com", "럿고", 28);
    assertThat(attributionMember.toString()).isEqualTo("AttributesMember(super=SuperMember(id=1), 럿고@gmail.com, 28)");
}
```

- `onlyExplicitlyIncluded` : `@ToString`과 `@EqualsAndHashCode`를 필드에 선언할 수 있게 되었다. 이 기능을 적용하기 위해 true로 선언해줘야 한다.
