# Java Serialize

참고1: [https://woowabros.github.io/experience/2017/10/17/java-serialize.html](https://woowabros.github.io/experience/2017/10/17/java-serialize.html)
참고2: [https://woowabros.github.io/experience/2017/10/17/java-serialize2.html](https://woowabros.github.io/experience/2017/10/17/java-serialize2.html)

## Overview

자바 직렬화는 자바 시스템 간 데이터를 주고받을 때 큰 이점을 가진다. 자바 개발자는 자바 객체 데이터를 전송하는데 크게 신경 쓰지 않고 데이터를 주고 받을 수 있도록 직렬화가 도와준다.

시스템적으로는 JVM의 메모리에 상주하는 객체 데이터를 바이트 형태로 변환하는 기술과 바이트 형태의 데이터를 객체로 변환하여 JVM으로 상주시키는 형태를 같이 이야기한다.

데이터 변환 및 전송 속도를 최적화한 이진 직렬화 방법도 존재한다. `Protocol Buffer`나 `Apache Avro`가 그 예시이다.

다양한 직렬화 종류: [https://j.mearie.org/post/122845365013/serialization](https://j.mearie.org/post/122845365013/serialization)

## 직렬화/역직렬화 사용방법

### 직렬화

자바의 `int`, `double` 등의 Primitive 타입과 `java.io.Serializable`을 상속받은 객체는 직렬화의 기본 조건을 갖췄다고 할 수 있다.

```java
import java.io.Serializable;

public class Person implements Serializable {
    
    private final String name;
    private final int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
```

이렇게 일반 객체라도 `Serializable`을 구현한다면 직렬화 할 수 있는 조건을 갖췄다고 할 수 있다.

이렇게 직렬화 조건을 갖춘 객체를 실제로 직렬화하기 위해서는 `java.io.ObjectOutputStream`을 사용한다.

```java
Person person = new Person("pkch", 28);

try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream()) {
    try (ObjectOutputStream objectOutputStream = new ObjectOutputStream(byteArrayOutputStream)) {
        objectOutputStream.writeObject(person);
    }
}
```

위와 같이 직렬화를 할 수 있다.

### 역직렬화

역직렬화를 하기 위해서는 직렬화 대상이 되는 객체의 클래스가 클래스 패스에 존재해야하며 `import`되어있어야한다. 이때 주의할 점은 **직렬화하는 시스템이 서로 다를 수 있다는 점**이다.

또한 직렬화 대상의 객체와 동일한 serialVersionUID가 필요하다. 단, 무조건 필수로 지정할 필요는 없다. 지정하지 않는 경우 자바에서 클래스의 해시값을 사용하여 자동으로 매핑해준다.

## 직렬화와 serialVersionUID

단, 직렬화/역직렬화에 주의할 점도 더러있다.

먼저, serialVerionUID를 설정하지 않은 경우 직렬화를 했을 때 클래스 구조 변경에 매우 불리해진다. 이미 직렬화된 객체들은 이전 버전의 구조로 직렬화되었을 것이며 이후 클래스 구조가 변경된 객체와 serialVersionUID가 달라져 역직렬화할 수 없게 된다.

serialVerionUID 관련: [https://docs.oracle.com/javase/6/docs/platform/serialization/spec/class.html#4100](https://docs.oracle.com/javase/6/docs/platform/serialization/spec/class.html#4100)

따라서 클래스를 자주 변경해야하는 경우 serialVersionUID를 설정해주는 것이 클래스 변경에 대한 혼란도 줄여줄 수 있다.

다만, serialVersionUID가 같더라도 모든 문제가 해결되는 것은 아니다.

```java
import java.io.Serializable;

public class Person implements Serializable {
    
    private final char[] name; // String -> char[]
    private final int age;

    public Person(char[] name, int age) {
        this.name = name;
        this.age = age;
    }
}
```

위와 같이 `String`에서 `char[]`으로 타입이 변경된 경우 `java.lang.ClassCastException`를 유발한다. 이는 `int`를 `long`으로 바꾸는 경우에도 마찬가지이다. 이를 통해 자바 직렬화가 타입에 매우 엄격하다는 것을 알 수 있다.

다만, serialVerionUID가 같다면 변수 추가 및 메서드 추가에는 크게 문제가 없다. 없는 변수라면 기본값 또는 null 처리된다.

> 단, 오류는 나지 않지만 스팩에서는 비호환적이라 소개

참고: [https://stackoverflow.com/questions/16261383/delete-field-from-old-java-class-implementing-serializable?fbclid=IwAR107-NDchLr6KAC8MfFaazY0rvsXmO2Tp9lX5ooL9XZnDKpUlST7YISFvA#answer-16261562](https://stackoverflow.com/questions/16261383/delete-field-from-old-java-class-implementing-serializable?fbclid=IwAR107-NDchLr6KAC8MfFaazY0rvsXmO2Tp9lX5ooL9XZnDKpUlST7YISFvA#answer-16261562)

## 실무에서 사용시 주의할 점

- DB, 캐시 등 외부에 장기간 저장하는 정보는 직렬화를 지양할 것.

    역직렬화 대상 클래스가 언제 변할 지 모르는 상황에서 예기치 못한 예외가 발생할 포인트가 될 수 있다.

- 개발자가 직접 제어할 수 있는 객체가 아닌 프레임워크, 라이브러리의 객체 직렬화는 지양할 것.

    프레임워크/라이브러리 버전업 시 serialVersionUID가 변경되는 문제가 있을 수 있다.

- 자바 직렬화는 객체에 저장된 기본 데이터 뿐만 아니라 타입 정보, 클래스 메타 정보를 가지고 있으므로 용량을 상상 이상으로 많이 차지하게 된다. `JSON 같은 포멧에서는 최소 2배 ~ 최대 10배의 차이`

    특히 많이 사용하는 Spring Data Redis, Spring Session 등은 자바 직렬화를 기본으로 사용하므로 이를 염두해두어야한다.