# Java enum name vs toString

Java enum에서는 정의한 enum의 이름을 `name` 메서드로 확인할 수 있다.

```java
public class EnumTest {

	@Test
	void name() {
		assertThat(Type.STUDENT.name()).isEqualTo("STUDENT");
	}

	enum Type {
		STUDENT,
		PROFESSOR
	}
}
```

단, `Enum#name`은 오버라이드가 불가능하기 때문에 Enum에 정의한 이름만 계속 반환하게된다. 만약 다른 이름을 써야한다면 `toString`을 사용할 수 있다.

```java
public final String name() {
    return name;
}
```

> Enum#name은 final 메서드로 정의되어 있기 때문에 오버라이드 할 수 없다.

```java
public String toString() {
    return name;
}
```

기본적으로 Enum의 toString은 name을 그대로 반환한다. 즉, 기본 구현은 `Enum#name`과 동일하다.

다만, 여느 Java 객체처럼 toString은 오버라이드가 가능하다. 따라서 원하는 형태로 Enum의 이름을 사용하고 싶다면 toString을 오버라이드하여 사용할 수 있다.
