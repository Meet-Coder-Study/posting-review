# @Value와 @ConfigurationProperties를 이용해 yaml 파일 매핑하기

> [예제코드](https://github.com/ksy90101/TIL-ex/tree/master/spring-yaml-properties-ex)

## 1. 환경 프로퍼티 파일 설정하기

- 프로퍼티 파일은 설정 관련 및 기타 정적 값을 `key-value`으로 관리한다.
- 기존에는 `XML`을 이용하여 설정할 수 있었지만, 지금은 yaml, properties를 이용해 간단하게 파일을 설정할 수 있다.
- 확장자는 `.yml`을 사용한다.
- 이번 글에서는 ymal을 이용해 프로퍼터 값을 관리해볼 것이다.

### 1.1. ymal이란?

- YAML Ain’t Markup Language
- 최근 스프링과 쿠버네티스 같은 프로그램의 설정 파일로 사용하고 있다.

```yaml
server:
	port:80
```

- 위의 예제는 스프링의 포트 값을 설정하는 것으로 들여쓰기를 이용해 계층 구조를 쉽게 파악할 수 있기 때문에 가독성이 좋다.
- YAML을 사용하기 위해서는 `SnackYAML` 라이브러리르 사용해야 하지만 `spring-boot-starter`에 기본적으로 내장되어 있어 별도 설정 없이 사용이 가능하다.

### 1.2. profile에 따른 환경 구성 분리

- 개발을 하게 된다면 로컬환경과  개발할때의 개발환경과 실제 서비스를 배포하는 운영 환경과 다르게 설정을 줘야 할 경우가 있다.
- YAML 파일에서는 `---`를 이용해 손쉽게 환경 설정을 나눌수가 있다.

```elm
server:
    port:80
---
spring:
    profiles: local
server:
    port: 8080
---
spring:
    profiles: dev
server:
    port:8081
---
spring:
    profiles: prod
server:
    port: 8082
```

- 하나의 파일에 모두 넣을수도 있지만, `application-{profile}.yml`을 이용하면 파일을 분리할 수 있다.
- 예를들어 dev profile로 실행한다면 `application-dev.yml` 파일이 우선순위가 1순위가 되며 나머지 프로퍼티들의 값은 `application.yml` 설정이 적용된다.

## 1.3. YAML 파일 매핑하기

- 클래스, 메서드, 필드 등 프로그램 요소에 필요한 정보를 제공하는 기법으로 타깃 요소를 제어, 관리, 명시하는 등 다양한 기능을 제공한다.

### 1.3.1. 특징

- 유연한 바인딩
    - 프로퍼티값을 객체에 바인딩 할 경우 필드를 Camel Case로 선언하고 프로퍼티의 키는 다양한 형식(Camel Case, Kabab Case, Undersocre...)으로 선언하여 바인딩이 가능하다.
- 메타데이터 지원
    - 프로퍼티의 키에 대한 정보를 JSON으로 제공한다.
    - 키의 이름, 타입, 설명, 디폴트값 등 키 사용에 앞서 힌트가 되는 정보를 알 수 있다.
    - `META-INF/spring-configuration-metadata.json`에서 확인할 수 있다.

    ```json
    {"groups": [
        {
            "name": "server",
            "type": "org.springframework.boot.autoconfigure.web.ServerProperties",
            "sourceType": "org.springframework.boot.autoconfigure.web.ServerProperties"
        },
        {
            "name": "spring.jpa.hibernate",
            "type": "org.springframework.boot.autoconfigure.orm.jpa.JpaProperties$Hibernate",
            "sourceType": "org.springframework.boot.autoconfigure.orm.jpa.JpaProperties",
            "sourceMethod": "getHibernate()"
        }
        ...
    ],"properties": [
        {
            "name": "server.port",
            "type": "java.lang.Integer",
            "sourceType": "org.springframework.boot.autoconfigure.web.ServerProperties"
        },
        {
            "name": "server.address",
            "type": "java.net.InetAddress",
            "sourceType": "org.springframework.boot.autoconfigure.web.ServerProperties"
        },
        {
              "name": "spring.jpa.hibernate.ddl-auto",
              "type": "java.lang.String",
              "description": "DDL mode. This is actually a shortcut for the \"hibernate.hbm2ddl.auto\" property.",
              "sourceType": "org.springframework.boot.autoconfigure.orm.jpa.JpaProperties$Hibernate"
        }
        ...
    ],"hints": [
        {
            "name": "spring.jpa.hibernate.ddl-auto",
            "values": [
                {
                    "value": "none",
                    "description": "Disable DDL handling."
                },
                {
                    "value": "validate",
                    "description": "Validate the schema, make no changes to the database."
                },
                {
                    "value": "update",
                    "description": "Update the schema if necessary."
                },
                {
                    "value": "create",
                    "description": "Create the schema and destroy previous data."
                },
                {
                    "value": "create-drop",
                    "description": "Create and then destroy the schema at the end of the session."
                }
            ]
        }
    ]}
    ```

- SpEL(Spring Expression Language, 스프링 표현 언어) 평가
    - 런타임에 객체 참조에 대해 질의하고 조작하는 기능을 지원
    - 특히 메서드 호출 및 기본 문자열 템플릿 기능을 제공

## 1.4. @Value

- YMAL의 특징 중에 SpEL 평가만 지원한다. (유연한 바인딩, 메타데이터 지원을 하지 않는다.)
- 프로퍼티의 키를 사용하여 특정 값을 호출할 수 있습니다.
- 정확한 키를 입력해야 하며 값이 없을 경우 예외 처리를 해줘야 합니다.

## 예제

```yaml
property:
    test:
        name: property depth test

propertyTest: test

propertyTestArray: a,b,c

propertyTestList: a,b,c
```

```java
import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class ValueTest {
    @Value("${property.test.name}") // depth가 존재하는 값은 .으로 구분해서 값을 매핑
    private String propertyTestName;

    @Value("${propertyTest}") // 단일 값을 매핑
    private String propertyTest;

    @Value("${noKey:default value}") // 키 값이 존재하지 않은 경우 default 값을 설정하여 매핑
    private String defaultValue;

    @Value("${propertyTestArray}") // 배열형으로 매핑
    private String[] propertyTestArray;

    @Value("#{'${propertyTestList}' .split(',')}") // ,을 기준으로 리스트형으로 매핑
    private List<String> propertyTestList;

    @DisplayName("property @Value 학습테스트")
    @Test
    void valueAnnotationTest() {
        assertAll(
                () -> assertThat(this.propertyTestName).isEqualTo("property depth test"),
                () -> assertThat(this.propertyTest).isEqualTo("test"),
                () -> assertThat(this.defaultValue).isEqualTo("default value"),
                () -> assertThat(this.propertyTestArray).hasSize(3),
                () -> assertThat(this.propertyTestList).hasSize(3)
        );
    }
}
```

## 1.5. @ConfigurationProperties

- YMAL의 특징 중에 유연한 바인딩, 메타데이터를 지원합니다. 그러나 SpEL을 지원하지 않습니다.
- @Value와 다른 점은 또한 prefix를 사용하여 값을 바인딩 합니다. 즉, 접두사를 활용하여 원하는 객체를 바인딩 해주며, 원하는 형을 선택하여 더 객체 지향적으로 프로퍼티의 매핑이 가능합니다.
- 새로운 의존성을 추가해줘야 가능하다.

> You can easily generate your own configuration metadata file from items annotated with @ConfigurationProperties by using the spring-boot-configuration-processor jar. The jar includes a Java annotation processor which is invoked as your project is compiled. To use the processor, include a dependency on spring-boot-configuration-processor.
This dependency ensures that the additional metadata is available when the annotation processor runs during compilation.
The processor picks up both classes and methods that are annotated with @ConfigurationProperties. The Javadoc for field values within configuration classes is used to populate the description attribute.

```json
 annotationProcessor "org.springframework.boot:spring-boot-configuration-processor"
```

- 사용하려면 해당 클래스를 Bean으로 등록해줘야 한다.

> You cannot use constructor binding with beans that are created by the regular Spring mechanisms (e.g. @Component beans, beans created via @Bean methods or beans loaded using @Import)

### 1.5.1. 예제

```yaml
fruit:
  fruits:
    - name: banana
      color: yellow
    - name: apple
      color: red
    - name: water melon
      color: green
```

```java
import java.util.List;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties("fruit")
public class FruitProperty {
    private final List<Map<String, String>> fruits;

    public FruitProperty(List<Map<String, String>> fruits) {
        this.fruits = fruits;
    }

    public List<Map<String, String>> getFruits() {
        return fruits;
    }
}
```

```java
import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class FruitPropertyTest {

    @Autowired
    private FruitProperty fruitProperty;

    @DisplayName("Property ConfigurationProperty Test")
    @Test
    void configurationPropertyTest() {
        List<Map<String, String>> fruits = fruitProperty.getFruits();

        assertAll(
                () -> assertThat(fruits).hasSize(3),
                () -> assertThat(fruits.get(0).get("name")).isEqualTo("banana"),
                () -> assertThat(fruits.get(0).get("color")).isEqualTo("yellow")
        );
    }
}
```

### 1.5.2. POJO 매핑하기

- 기본 컬렉션 뿐 아니라 POJO 타입도 매핑해준다.
- 여기서 주의할 점은 setter가 무조건 있어야 바인딩이 가능하다

> no need to provide constructor with argument.Only setters and getters are fineI

```yaml
number:
  numbers:
    - name: one
      value: 1
    - name: two
      value: 2
    - name: three
      value: 3
```

```java
public class Number {
    private String name;
    private int value;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }
}
```

```java
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties("number")
public class Numbers {
    private final List<Number> numbers;

    public Numbers(List<Number> numbers) {
        this.numbers = numbers;
    }

    public List<Number> getNumbers() {
        return numbers;
    }
}
```

```java
import static org.assertj.core.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class NumbersTest {

    @Autowired
    private Numbers numbers;

    @DisplayName("POJO ConfigurationProperties Test")
    @Test
    void pojoConfigurationPropertiesTest() {
        final List<Number> numberList = this.numbers.getNumbers();

        assertThat(numberList).hasSize(3);
        assertThat(numberList.get(0).getName()).isEqualTo("one");
        assertThat(numberList.get(0).getValue()).isEqualTo(1);
    }
}
```

## 결론

![value-configuration-properties-yaml-mapping-1](https://github.com/ksy90101/TIL/blob/master/spring/img/value-configuration-properties-ymal-mapping-1.png?raw=ture)

- 위의 차이점을 알고, 필요할 때 더 정확한 annotation을 사용하는 것이 중요하다.
- key값의 집합은 POJO로 바인딩을 해야 더 객체지향적이며, 빈 주입 구조화와 안전한 객체를 만들수 있습니다. 따라서 `@ConfigurationProperties`를 사용하는 것이 더 좋습니다.

## 참고자료

[처음 배우는 스프링 부트 2](https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=168752840&start=slayer)

[Spring Boot Features](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-external-config-yaml)

[Configuration Metadata](https://docs.spring.io/spring-boot/docs/2.3.3.RELEASE/reference/html/appendix-configuration-metadata.html#configuration-metadata-annotation-processor)
