# lombok 사용법 - 2(@EqualsAndHashCode, @data, @NonNull, @Cleanup, Val, @Value, @builder,  @SneakyThrows, @Log, @Synchronized)

> [예제코드](https://github.com/ksy90101/Java-TIL-ex/tree/master/blog-ex-lombok)

## @EqualsAndHashCode

- `Equals()`와 `HashCode()`를 만들어주는 어노테이션입니다.

```java
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;

@AllArgsConstructor
@EqualsAndHashCode
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

    public boolean equals(final Object o) {
        if (o == this) {
            return true;
        } else if (!(o instanceof Member)) {
            return false;
        } else {
            Member other = (Member)o;
            if (!other.canEqual(this)) {
                return false;
            } else {
                label39: {
                    Object this$email = this.email;
                    Object other$email = other.email;
                    if (this$email == null) {
                        if (other$email == null) {
                            break label39;
                        }
                    } else if (this$email.equals(other$email)) {
                        break label39;
                    }

                    return false;
                }

                Object this$name = this.name;
                Object other$name = other.name;
                if (this$name == null) {
                    if (other$name != null) {
                        return false;
                    }
                } else if (!this$name.equals(other$name)) {
                    return false;
                }

                if (this.age != other.age) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    }

    protected boolean canEqual(final Object other) {
        return other instanceof Member;
    }

    public int hashCode() {
        int PRIME = true;
        int result = 1;
        Object $email = this.email;
        int result = result * 59 + ($email == null ? 43 : $email.hashCode());
        Object $name = this.name;
        result = result * 59 + ($name == null ? 43 : $name.hashCode());
        result = result * 59 + this.age;
        return result;
    }
}
```

```java
@DisplayName("@EqualsAndHashCode 학습 테스트")
@Test
void equalsAndHashCodeTest() {
    Member member1 = new Member("럿고@gmail.com", "럿고", 28);
    Member member2 = new Member("럿고@gmail.com", "럿고", 28);
    assertThat(member1).isEqualTo(member2);
}
```

### 속성값

- `exclude` : 특정 필드를 포함하지 않게 함.

```java
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;

@AllArgsConstructor
@EqualsAndHashCode(exclude = "age")
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

    public boolean equals(final Object o) {
        if (o == this) {
            return true;
        } else if (!(o instanceof ExcludeMember)) {
            return false;
        } else {
            ExcludeMember other = (ExcludeMember)o;
            if (!other.canEqual(this)) {
                return false;
            } else {
                Object this$email = this.email;
                Object other$email = other.email;
                if (this$email == null) {
                    if (other$email != null) {
                        return false;
                    }
                } else if (!this$email.equals(other$email)) {
                    return false;
                }

                Object this$name = this.name;
                Object other$name = other.name;
                if (this$name == null) {
                    if (other$name != null) {
                        return false;
                    }
                } else if (!this$name.equals(other$name)) {
                    return false;
                }

                return true;
            }
        }
    }

    protected boolean canEqual(final Object other) {
        return other instanceof ExcludeMember;
    }

    public int hashCode() {
        int PRIME = true;
        int result = 1;
        Object $email = this.email;
        int result = result * 59 + ($email == null ? 43 : $email.hashCode());
        Object $name = this.name;
        result = result * 59 + ($name == null ? 43 : $name.hashCode());
        return result;
    }
}
```

```java
@DisplayName("Exclude 속성 학습테스트")
    @Test
    void excludeTest() {
        ExcludeMember member1 = new ExcludeMember("럿고@gmail.com", "럿고", 28);
        ExcludeMember member2 = new ExcludeMember("럿고@gmail.com", "럿고", 22);
        assertThat(member1).isEqualTo(member2);
    }
```

- `onparam` : 파라미터에 어노테이션을 붙일 수 있게 하는 것
- `of` : 명시적으로 특정 필드를 포함하게 하는 것
- `allSuper` : 부모 클래스의 equalsAndHashcode 호출

```java
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NonNull;

@AllArgsConstructor
@EqualsAndHashCode(of = {"email","name"}, callSuper = true, onParam = @__(@NonNull))
public class AttributionMember extends SuperMember{
    private String email;
    private String name;
    private int age;
}

```

```java
import lombok.EqualsAndHashCode;

@EqualsAndHashCode
public abstract class SuperMember {
    private Long id;
}
```

```java
import lombok.NonNull;

public class AttributionMember extends SuperMember {
    private String email;
    private String name;
    private int age;

    public AttributionMember(final String email, final String name, final int age) {
        this.email = email;
        this.name = name;
        this.age = age;
    }

    public boolean equals(@NonNull final Object o) {
        if (o == null) {
            throw new NullPointerException("o is marked non-null but is null");
        } else if (o == this) {
            return true;
        } else if (!(o instanceof AttributionMember)) {
            return false;
        } else {
            AttributionMember other = (AttributionMember)o;
            if (!other.canEqual(this)) {
                return false;
            } else if (!super.equals(o)) {
                return false;
            } else {
                label40: {
                    Object this$email = this.email;
                    Object other$email = other.email;
                    if (this$email == null) {
                        if (other$email == null) {
                            break label40;
                        }
                    } else if (this$email.equals(other$email)) {
                        break label40;
                    }

                    return false;
                }

                Object this$name = this.name;
                Object other$name = other.name;
                if (this$name == null) {
                    if (other$name != null) {
                        return false;
                    }
                } else if (!this$name.equals(other$name)) {
                    return false;
                }

                return true;
            }
        }
    }

    protected boolean canEqual(@NonNull final Object other) {
        return other instanceof AttributionMember;
    }

    public int hashCode() {
        int PRIME = true;
        int result = super.hashCode();
        Object $email = this.email;
        result = result * 59 + ($email == null ? 43 : $email.hashCode());
        Object $name = this.name;
        result = result * 59 + ($name == null ? 43 : $name.hashCode());
        return result;
    }
}
```

```java
@DisplayName("callSuper, of, onParam  속성 학습테스트")
@Test
void attributionTest() {
    AttributionMember member1 = new AttributionMember("럿고@gmail.com", "럿고", 28);
    AttributionMember member2 = new AttributionMember("럿@gmail.com", "럿고", 22);
    assertThat(member1).isEqualTo(member2);
}
```

- `doNotUserGetters` : 기본적으로 getter가 있으면 해당 메소드가 호출된다. 이를 사용하지 않고 필드를 직접 호출하는 것
- `onlyExplicitlyIncluded` : `@ToString`과 `@EqualsAndHashCode`를 필드에 선언할 수 있게 되었다. 이 기능을 적용하기 위해 true로 선언해줘야 한다.

> exclude와 of는 같이 사용할 수 없습니다.

## @Data

- @Getter + @Setter + @RequiredArgsConstructor + @ToString + @EqualsAndHashCode
- 만능 처럼 보이지만, 실제로는 사용하면 안된다.
- 이유는 무분별한 @Setter 사용으로 객체의 불변성을 보장할 수가 없기 때문이다. 객체는 최대한 불변성을 보장해야 한다.
- 그냥 이런 어노테이션도 있구나 라는 생각으로 넘어가자.

### 속성값

- `staticConstructor`
    - static한 생성자를 만들어 준다.
    - 이걸 사용한다면 생성자를 사용할 수 없다.(static한 생성자만 사용가능)

```java
import lombok.Data;

@Data(staticConstructor = "create")
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

    private Member() {
    }

    public static Member create() {
        return new Member();
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

    public void setEmail(final String email) {
        this.email = email;
    }

    public void setName(final String name) {
        this.name = name;
    }

    public void setAge(final int age) {
        this.age = age;
    }

    public boolean equals(final Object o) {
        if (o == this) {
            return true;
        } else if (!(o instanceof Member)) {
            return false;
        } else {
            Member other = (Member)o;
            if (!other.canEqual(this)) {
                return false;
            } else {
                label39: {
                    Object this$email = this.getEmail();
                    Object other$email = other.getEmail();
                    if (this$email == null) {
                        if (other$email == null) {
                            break label39;
                        }
                    } else if (this$email.equals(other$email)) {
                        break label39;
                    }

                    return false;
                }

                Object this$name = this.getName();
                Object other$name = other.getName();
                if (this$name == null) {
                    if (other$name != null) {
                        return false;
                    }
                } else if (!this$name.equals(other$name)) {
                    return false;
                }

                if (this.getAge() != other.getAge()) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    }

    protected boolean canEqual(final Object other) {
        return other instanceof Member;
    }

    public int hashCode() {
        int PRIME = true;
        int result = 1;
        Object $email = this.getEmail();
        int result = result * 59 + ($email == null ? 43 : $email.hashCode());
        Object $name = this.getName();
        result = result * 59 + ($name == null ? 43 : $name.hashCode());
        result = result * 59 + this.getAge();
        return result;
    }

    public String toString() {
        return "Member(email=" + this.getEmail() + ", name=" + this.getName() + ", age=" + this.getAge() + ")";
    }
}
```

```java
import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MemberTest {

    @DisplayName("getter & setter 학습 테스트")
    @Test
    void getterTest() {
        Member member = Member.create();
        member.setEmail("럿고@gmail.com");
        member.setName("럿고");
        member.setAge(28);
        assertThat(member.getEmail()).isEqualTo("럿고@gmail.com");
        assertThat(member.getName()).isEqualTo("럿고");
        assertThat(member.getAge()).isEqualTo(28);
    }

    @DisplayName("Equals 학습테스트")
    @Test
    void testEquals() {
        Member member = Member.create();
        member.setEmail("럿고@gmail.com");
        member.setName("럿고");
        member.setAge(28);

        Member expected = Member.create();
        expected.setEmail("럿고@gmail.com");
        expected.setName("럿고");
        expected.setAge(28);

        assertThat(member).isEqualTo(expected);
    }

    @DisplayName("toString 학습테스트")
    @Test
    void testToString() {
        Member member = Member.create();
        member.setEmail("럿고@gmail.com");
        member.setName("럿고");
        member.setAge(28);
        assertThat(member.toString()).isEqualTo("Member(email=럿고@gmail.com, name=럿고, age=28)");
    }

    @DisplayName("canEqual 학습테스트")
    @Test
    void canEqualTest() {
        Member member = Member.create();
        member.setEmail("럿고@gmail.com");
        member.setName("럿고");
        member.setAge(28);

        Member expected = Member.create();

        assertThat(member.canEqual(expected)).isTrue();
    }
}
```

## @NonNull

- 메서드 파라미터나, 필드, 메서드 등에 사용되며 null이 들어왔을 경우 예외를 발생시킨다.
- 이 어노테이션을 사용하면 아래와 같은 코드가 추가된다.

```java
if (person == null) {
      throw new NullPointerException("person is marked @NonNull but is null");
    }
```

```java
import lombok.AllArgsConstructor;
import lombok.NonNull;

@AllArgsConstructor
public class Member {
    @NonNull
    private String email;
}
```

```java
import lombok.NonNull;

public class Member {
    @NonNull
    private String email;

    public Member(@NonNull final String email) {
        if (email == null) {
            throw new NullPointerException("email is marked non-null but is null");
        } else {
            this.email = email;
        }
    }
}
```

```java
@DisplayName("@NonNull 학습테스트")
@Test
void nonNullTest() {
    assertThatThrownBy(() ->  new Member(null)).isInstanceOf(NullPointerException.class);
}
```

## @Cleanup

- try-with-resource 구문과 비슷한 효과를 가지며, 구문이 종료될 때 AutoCloseable 인터페이스의 close가 호출되는 try-with-resource와 달리 Scope가 종료될 때 close()가 호출됨.

```java
import lombok.Cleanup;
import java.io.*;

public class CleanupExample {
  public static void main(String[] args) throws IOException {
    @Cleanup 
	InputStream in = new FileInputStream(args[0]);
    @Cleanup 
	OutputStream out = new FileOutputStream(args[1]);
    byte[] b = new byte[10000];
    
    while (true) {
      int r = in.read(b);
      if (r == -1) break;
      out.write(b, 0, r);
    }
  }
}
```

```java
import java.io.*;

public class CleanupExample {
  public static void main(String[] args) throws IOException {
    InputStream in = new FileInputStream(args[0]);
    try {
      OutputStream out = new FileOutputStream(args[1]);
      try {
        byte[] b = new byte[10000];
        while (true) {
          int r = in.read(b);
          if (r == -1) break;
          out.write(b, 0, r);
        }
      } finally {
        if (out != null) {
          out.close();
        }
      }
    } finally {
      if (in != null) {
        in.close();
      }
    }
  }
}
```

## Val

- 객체 타입을 추론해 불변 값을 선언한다.
- 지역변수와 `forEach`문 에서만 사용이 가능하다.
- 선언 이후 변경하려고 하면 `error: cannot assign a value to final variable email`이와 같은 에러를 발생시킨다.

```java
import lombok.RequiredArgsConstructor;
import lombok.val;

@RequiredArgsConstructor
public class Member {
    private final String email;

    public String getEmail() {
        val email = this.email;
        return email;
    }
}
```

```java
public class Member {
    private final String email;

    public String getEmail() {
        String email = this.email;
        return email;
    }

    public Member(final String email) {
        this.email = email;
    }
}
```

```java
@DisplayName("val 학습테스트")
@Test
void valTest() {
    Member member = new Member("럿고@gmail.com");
    assertThat(member.getEmail()).isEqualTo("이메일 : 럿고@gmail.com");
}
```

## @Value

- @Data 어노테이션과 비슷하지만 필드를 변경할 수 없는 불변 객체가 만들지며, 필드에 @With 어노테이션을 이용하면 with필드명(값) 메소드가 만들어지는데, 이 메소드를 이용하면 값을 변경한 새로운 객체를 만들어준다. 값을 변경하지 않는 프로그래밍에서 아주 유용하게 활용된다.
- 1.18.10 version 이전에는 @Wither를 사용해야 한다.

### 속성값

- @Value
    - `staticConstructor`
        - static한 생성자를 만들어 준다.
- @With
    - value
        - 필드의 접근제어자를 지정한다.
    - onMethod
        - 메서드의 어노테이션을 추가한다.
    - onParam
        - 파라미터에 어노테이션을 추가한다.

```java
import lombok.AccessLevel;
import lombok.Value;
import lombok.With;

@Value
public class Member {
    @With(AccessLevel.PRIVATE)
    String email;
}
```

```java
public final class Member {
    private final String email;

    public Member(final String email) {
        this.email = email;
    }

    public String getEmail() {
        return this.email;
    }

    public boolean equals(final Object o) {
        if (o == this) {
            return true;
        } else if (!(o instanceof Member)) {
            return false;
        } else {
            Member other = (Member)o;
            Object this$email = this.getEmail();
            Object other$email = other.getEmail();
            if (this$email == null) {
                if (other$email != null) {
                    return false;
                }
            } else if (!this$email.equals(other$email)) {
                return false;
            }

            return true;
        }
    }

    public int hashCode() {
        int PRIME = true;
        int result = 1;
        Object $email = this.getEmail();
        int result = result * 59 + ($email == null ? 43 : $email.hashCode());
        return result;
    }

    public String toString() {
        return "Member(email=" + this.getEmail() + ")";
    }

    private Member withEmail(final String email) {
        return this.email == email ? this : new Member(email);
    }
}
```

## @Builder

- 빌더 패턴을 적용한 객체 생성 메소드/클래스를 만들어준다

```java
import lombok.AllArgsConstructor;
import lombok.Getter;

@lombok.Builder
@AllArgsConstructor
@Getter
public class Member {
    private String email;
    private String name;
}
```

```java
public class Member {
    private String email;
    private String name;

    public static Member.MemberBuilder builder() {
        return new Member.MemberBuilder();
    }

    public Member(final String email, final String name) {
        this.email = email;
        this.name = name;
    }

    public String getEmail() {
        return this.email;
    }

    public String getName() {
        return this.name;
    }

    public static class MemberBuilder {
        private String email;
        private String name;

        MemberBuilder() {
        }

        public Member.MemberBuilder email(final String email) {
            this.email = email;
            return this;
        }

        public Member.MemberBuilder name(final String name) {
            this.name = name;
            return this;
        }

        public Member build() {
            return new Member(this.email, this.name);
        }

        public String toString() {
            return "Member.MemberBuilder(email=" + this.email + ", name=" + this.name + ")";
        }
    }
}
```

```java
import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MemberTest {

    @DisplayName("@Builder 학습테스트")
    @Test
    void builderTest() {
        Member member = Member.builder()
                .email("럿고@gmail.com")
                .build();

        assertThat(member.getEmail()).isEqualTo("럿고@gmail.com");
        assertThat(member.getName()).isNull();;
    }
}
```

### 속성값

- builderMethodName
    - builder의 메서드명을 지정할 수 있다.
- buildMethodName
    - build 메서드명을 지정할 수 있다.
- builderClassName
    - builder Class명을 지정할 수 있다.
- toBuilder
    - 복사본을 만들 수 있는 메서드를 제공한다.
- access
    - 접근 제어자를 지정할 수 있다.
- setterPrefix
    - setter를 생성할때 prefix로 set 말고 다른 것을 지정할 수 있다.

```java
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder(builderClassName = "MemberBuilder", builderMethodName = "memberBuilder", buildMethodName = "memberBuild",
        toBuilder = true, access = AccessLevel.PROTECTED, setterPrefix = "member")
@AllArgsConstructor
@Getter
public class AttributionMember {
    private String email;
    private String name;
}
```

```java
public class AttributionMember {
    private String email;
    private String name;

    protected static AttributionMember.MemberBuilder memberBuilder() {
        return new AttributionMember.MemberBuilder();
    }

    protected AttributionMember.MemberBuilder toBuilder() {
        return (new AttributionMember.MemberBuilder()).memberEmail(this.email).memberName(this.name);
    }

    public AttributionMember(final String email, final String name) {
        this.email = email;
        this.name = name;
    }

    public String getEmail() {
        return this.email;
    }

    public String getName() {
        return this.name;
    }

    protected static class MemberBuilder {
        private String email;
        private String name;

        MemberBuilder() {
        }

        public AttributionMember.MemberBuilder memberEmail(final String email) {
            this.email = email;
            return this;
        }

        public AttributionMember.MemberBuilder memberName(final String name) {
            this.name = name;
            return this;
        }

        public AttributionMember memberBuild() {
            return new AttributionMember(this.email, this.name);
        }

        public String toString() {
            return "AttributionMember.MemberBuilder(email=" + this.email + ", name=" + this.name + ")";
        }
    }
}
```

## @SneakyThrows

- 메서드 선언부에 사용되는 `throws` 키워드 대신 사용하는 어노테이션
- 논란이 여지가 있는 어노테이션이지만, 롬복 홈페이지에서 다음과 같은 상황에서 사용하라고 소개하고있다.
    - `Runnable` 같은 인터페이스로 불필요하게 엄격한 인터페이스
    - 발생 할 수 없는 예외로 예를 들어 new String(someByteArray, "UTF-8"); 에서 UnsupportedEncodingException 이다. JVM은 기본적으로 UTF-8을 항상 사용하고 있기 때문에 절대 발생할 수가 없다.
- 아래 예제와 같이 try-catch문을 자동으로 만들어준다.

```jsx
import java.io.UnsupportedEncodingException;

import lombok.SneakyThrows;

public class SneakyThrowsEx {

    @SneakyThrows(UnsupportedEncodingException.class)
    public String utf8ToString(byte[] bytes){
        return new String(bytes, "UTF-8");
    }

    @SneakyThrows
    public void run(){
        throw new Throwable();
    }
}
```

```jsx
import java.io.UnsupportedEncodingException;

public class SneakyThrowsEx {
    public SneakyThrowsEx() {
    }

    public String utf8ToString(byte[] bytes) {
        try {
            return new String(bytes, "UTF-8");
        } catch (UnsupportedEncodingException var3) {
            throw var3;
        }
    }

    public void run() {
        try {
            throw new Throwable();
        } catch (Throwable var2) {
            throw var2;
        }
    }
}
```

## @Log

- log 필드를 자동으로 생성해주며, 지원되는 Logger에 따라 다른 어노테이션을 사용하면 된다.

![lombok-2-1](https://github.com/ksy90101/TIL/blob/master/java/image/lombok-2-1.png?raw=true)

## @Synchronized

- 메서드에서 사용되는 어노테이션으로 기본적으로 지원하는 `synchronized` 보다 더 세세한 설정이 가능하다. 기본적으로 static, instance 단위로 lock을 걸지만 이 어노테이션은 파라미터로 입력받는 객체 단위로 lcok을 건다. 파라미터로 아무것도 입력하지 않는다면 어노테이션이 사용된 메소드 단위로 락을 건다.

```jsx
package blog.ex.lombok.sneakythrows;

import lombok.Synchronized;

public class SynchronizedEx {
    private final Object readLock = new Object();

    @Synchronized
    public static void hello() {
        System.out.println("world");
    }

    @Synchronized
    public int answerToLife() {
        return 42;
    }

    @Synchronized("readLock")
    public void foo() {
        System.out.println("bar");
    }
}
```

```jsx
public class SynchronizedEx {
    private static final Object $LOCK = new Object[0];
    private final Object $lock = new Object[0];
    private final Object readLock = new Object();

    public SynchronizedEx() {
    }

    public static void hello() {
        synchronized($LOCK) {
            System.out.println("world");
        }
    }

    public int answerToLife() {
        synchronized(this.$lock) {
            return 42;
        }
    }

    public void foo() {
        synchronized(this.readLock) {
            System.out.println("bar");
        }
    }
}
```

## 정리

- 아직 정리 하지 않은 어노테이션들이 많지만, 사용을 잘 하지 않는 것들이다.
- 사실 지금까지 정리한 것들 중에서도 자주 사용되는것은 한정적이다.
- 나중에 기회가 된다면 다른 어노테이션들도 정리해도록 하겠습니다.
