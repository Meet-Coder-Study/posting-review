# [if(kakao)2020] JUnit5를 시작하며

## JUnit이란?

- Java + Test
- xUnit은 테스팅 프레임워크로 Java뿐만 아니라 CUnit(C언어), PyUnit(Python) 등이 있다.
- 이름과 마찬가지로 Unit Test(단위 테스트) 도구로 Tast Class를 만들수 있도록 도와주는 도구라고 생각하면 된다.

## JUnit4? JUnit5?

- JUnit4는 릴리즈 된지가 벌써 10년이 넘었습니다. (2020년 기준)
- 현재는 릴리즈 계획이 없으며 현재는 JUnit5를 사용하기를 권장하고 있습니다.

### 왜 다시 만들었는가?

- IDE, Build Tool의 강한 결합
- @RunWith의 부족한 확장성
    - Junit4에서는 한개만 사용이 가능했음. [[참고링크]](http://junit.sourceforge.net/javadoc/org/junit/runner/RunWith.html)
    - JUnit5에서는 @ExtendWith으로 Extension 클래스를 여러개 지정할 수 있다. [[참고링크]](https://junit.org/junit5/docs/5.3.0/api/org/junit/jupiter/api/extension/ExtendWith.html)   
    - 조합하려면 @Rule을 활용해야 했다.

    ```java
    @RunWith(Paramerterized.class)
    public class RuleTest {
    	@Rule
    	private MockitoRule mockitoRule = MockitoJunit.rule();
    }
    ```

- Big Jar 형태로 많은 책임이 존재했다.

    ![if-kakao-2020-junit4-vs-junit5-1](https://github.com/ksy90101/TIL/blob/master/java/image/if-kakao-2020-junit4-vs-junit5-1.png?raw=true)

- 위와 같은 문제점을 해결하기 위해 Junit Lambda팀이 구성되었고 좋은 소프트웨어를 만들기 위해 돈이 필이했고 크라우드 펀딩으로 개발 자금을 모아 예상외로 돈이 모이게 되었다.

## JUnit5

- JUnit5는 몇가지 목표를 가지고 만들어지기 시작했습니다.

### Simple(최대한 단순하게)

- Less is more
- 예를 들면 JUnit4의 모든 테스트는 public으로 선언해야 가능했지만, JUnit5에서는 패키지에서도 테스트를 할 수 있도록 변경했습니다.

```java
@Test
public void testInPublic() {
	assertEquals("Public Test", "Junit4");
}

@Test
void testInPackage() {
	assertEquals("Package Test", "Junit5");
}
```

### Extension(기능보단 확장성을)

![if-kakao-2020-junit4-vs-junit5-2](https://github.com/ksy90101/TIL/blob/master/java/image/if-kakao-2020-junit4-vs-junit5-2.png?raw=true)

- JUnit4에서의 여러가지의 확장점들을 통합해 처리합니다.
- @ExtenWith, @RegisterExtension, Java의 ServiceLoader를 통해 등록이 가능합니다.
- Extension은 선언된 순서대로 등록되고 Class, Method에 적용이 가능합니다.

![if-kakao-2020-junit4-vs-junit5-3](https://github.com/ksy90101/TIL/blob/master/java/image/if-kakao-2020-junit4-vs-junit5-3.png?raw=true)

### Third Party

- 위와 같은 확장성을 통해 많은 Third Party Engin & Extension들이 오픈소스 환경에서 만들어지고 있습니다.

[junit-team/junit5](https://github.com/junit-team/junit5/wiki/Third-party-Extensions)

![if-kakao-2020-junit4-vs-junit5-4](https://github.com/ksy90101/TIL/blob/master/java/image/if-kakao-2020-junit4-vs-junit5-4.png?raw=true)

## JUinit5의 아키텍처

- Vintage(JUnit)
- Jupiter(JUnit5)
- Platform(Extension)

![if-kakao-2020-junit4-vs-junit5-5](https://github.com/ksy90101/TIL/blob/master/java/image/if-kakao-2020-junit4-vs-junit5-5.png?raw=true)

- 위와 같은 구조로 관심사를 분리해 확장하기 쉬운 구조를 얻게 되었다.

## JUnit5 Basic

- 라이프 사이클

![if-kakao-2020-junit4-vs-junit5-6](https://github.com/ksy90101/TIL/blob/master/java/image/if-kakao-2020-junit4-vs-junit5-6.png?raw=true)

![if-kakao-2020-junit4-vs-junit5-7](https://github.com/ksy90101/TIL/blob/master/java/image/if-kakao-2020-junit4-vs-junit5-7.png?raw=true)

- @Category: 실행 그룹을 설정할 수 있는 것

    ```java
    public interface SlowTests {}
    ```

    - 위와 같이 카테고리를 설정해 SlowTests.class가 붙어 있는 어노테이션의 테스트만 실행할 수 있었다.
    - JUnit4의 기능
- @Tag: 해당 태크가 붙은 테스트를 바로 실행가능 하도록 함.
- @Category vs @Tag : JUnit4에서는 직접 클래스를 만들어서 그 클래스를 실행했어야 하지만, JUnit5에서는 String으로 지정해 그 Tag를 빌드 도구에 추가만 하면 해당 테스트를 돌릴 수 있다.
- @Ignore : 해당 테스트 케이스를 skip
- @Disabled : 해당 테스트 케이스를 skip
    - 실제 몇개의 테스트가 skip되었는지 확인할 수 있다.

## JUnit5 Assert

### assertAll

- JUnit4에서는 하나의 assert가 실패하면 그 뒤에 assert들을 실행하지 않았습니다.
- 이제는 assertAll을 활용해 여러개의 assert가 가능합니다.
- 즉, 중간에 선언된 assert문이 실패해도 선언된 모든 assert문을 실행하고 결과를 반환합니다.

```java
@Test
void assertAllTest() {
	String name = "kakaostory";
	
	assertAll(
		() -> assertEquals("kakaostory", name.toLowerCase()),
		() -> assertEquals("KAKAOSTORY", name.toUpperCase())
	);
}
```

### assertThrows

- JUnit4에서는 예외 메시지에 대한 검증을 위해 다른 방법을 사용했어야 하지만 JUnit5에서는 쉽게 예외를 검증할 수 있게 되었습니다.
- 또한 assertDoesNotThrows를 통해 예외가 발생하지 않는 경우도 검증할 수 있습니다.

```java
@Test
void assertThrowsTest() {
	Exception exception = assertThrows(
		ArithmeticException.class, () -> calculator.divide(1,0)
	);

	assertEquals("/ by zero", exception.getMessage());
}
```

### assertTimeout

- JUnit4는 어노테이션으로 테스트 시간을 검증했지만 Junit5에서는 테스트 실행시간에 대한 기능이 추가되었으며 assertTimeoutPreemptively를 이용해 기대 시간을 초과하면 테스트를 즉시 실패시키는 기능도 추가되었습니다.

```java
@Test
void assertTimeoutTest() {
	assertTimeout(ofSeconds(1), () -> { Thread.sleep(5000); });
	
	assertTimeoutPreemptively(ofSeconds(1), () -> { Thread.sleep(5000); });
```

## JUnit5 Feature

### @DisplayName

- 한글, 스페이스, 이모지, 특수문자 등도 가능하며 해당 테스트의 의미를 더욱더 잘 나타낼 수 있다.
- Class, Method Level에서 선언이 가능하빈다.
- @DisplayNameGeneration을 활용하면 표기 방법을 변경할 수도 있다.

```java
@DisplayName("DisplayName")
class DisplayNameDemo {
	@Test
	@DisplayNAme("스페이스, ✆, 👍")
	void displayNameTest() {
}
```

### @Nested

- 계층구조를 통해 BDD 스타일도 가능하게 되었다.

```java
@DisplayName("Calculator 클래스")
public class CalculatorTest {
	private Calculator cal = new Claculator();

	@Nested
	@DisplayName("Plus Method는")
	class PlusMethod {
		@Nested
		@DisplayName("더하는 숫자가 음수인 경우")
		class Handle_Minus_Number {
			private static final int munusSume = -2;
			@Test
			@DisplayName("0과 음수를 더하면 음수를 반환한다.")
			void return_sum_of_minus_number() {
				assertEquals(minusSum, cal.sum(minusSum, 0);
			}
		}
	}
}
```

### @ParameterizedTest

- @ParameterizedTest는 Jupiter-Params org.junit.jupiter:junit-jupiter-params 의존성을 필요로 합니다.
- 여러 개의 테스트 데이터를 매개변수 형태로 쉽고 간편하게 사용이 가능합니다.
- 최소 하나의 Source Annotion이 필요합니다.
- Null, Empty, Value, Csv, Enum, Method 등 다양한 형태의 Soruce가 존재합니다.

```java
@ParmeterizedTest
@EnumSource(value = City.class, names = { "SEOUL", "PARIS" })
void city_enum_test(City city) {
		assertTrue(EnumSet.of(City.SEOUL, City.PARIS).contains(city));
}
```

### Dynamic Test

- JUnit4는 컴파일 시점에 제한되었지만, JUnit5는 런타임 환경으로 생성 및 수행됩니다.
- 이를 통해 외부의 자원을 활용하거나, 랜덤 데이터를 생성해 활용할 수 있습니다.
- 타이틀을 활용하면 조금 더 가독성이 높은 테스트를 작성할 수 있습니다.

```java
@TestFactory
Stream<DynamicNode> dynamicTests() {
		return Stream.of("ifkakao", "junit5", "kakaostory")
			.map(text ->
				dynamicTest("Include Kakao", () -> assertTrue(text.contains("kakao")))
			);
}
```

### Parallel Execution

- Class, Method로 테스트를 병렬로 실행 가능합니다.
- 설정값을 통해 테스트 실행에 대한 전략 변경이 가능합니다.
- 실제로 데이터 동기화 처리는 되지 않고, 각각의 테스트 실행 시점을 조율합니다.

```java
@Execution(CONCURRENT)
class ParalleTests {
	private static final String IFKAKAO = "ifkakao";

	@Test
	@ResourceLock(value = SYSTEM_PROPERTIES, mode = READ_WRITE)
	void writeResourceTest() {
		System.setProperty(IFKAKAO, "2020");
		assertEquals("2020", System.getProperty(IFKAKAO));
	}
}
```

## Spring에서의 JUnit4 vs JUnit5

### Spring - JUnit4

- JUnit4에서는 하나의 @RunWith만 사용해야 하기 때문에 기능을 @Rule을 통해 확장했습니다.
- Spring에서는 SpringClassRule, SpringMethodRule을 제공하고 있었습니다.
- 이러한 문제로 테스트 작성에 불편함을 가지고 있었습니다.

```java
@RunWith(MockitoJUnitRunner.class)
public class SpringRuleTest {
	@ClassRule
	private static final SpringClassRule classRule = new SpringClassRule();
	@Rule
	public SpringMethodRule methodRule = new SpringMethodRule();
}
```

### Spring - JUnit5

- @Rule 대신 @ExtendWith(SpringExtension.class)를 추가하면 쉽게 스프링 테스트를 할 수 있습니다.
- Spring 5.0, Spring 2.2.0 이후로 기본 JUnit5로 변경되었습니다.

## 정리

- JUnit5에서는 많은 새로운 기능이 추가되었고 Third Party를 활용해 많은 확장성이 도입되었으며 Spring에서는 현재 기본값으로 사용하고 있기 때문에 JUnit4에서 JUnit5로 변경합시다!

[if(kakao)2020](https://if.kakao.com/session/108)
