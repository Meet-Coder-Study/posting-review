# 스프링 부트 테스트 종류 (@SpringBootTest, @WebMvcTest, @DataJpaTest, @RestClientTest, @JsonTest)

> [처음배우는 스프링 부트 2](https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=168752840)
> [예제코드](https://github.com/ksy90101/book-spring-boot-start)

- 테스트 스타터는  크게 두 가지 모듈로 구성됩니다.
    - spring-boot-test
    - spring-boot-test-autoconfigure
- 보통 spring-boot-starter-test로 두 모듈을 함께 사용합니다.

[ksy90101/TIL](https://github.com/ksy90101/TIL/blob/master/spring/spring-boot-starter-test-exclude-vintage.md)

- 스프링 부트 1.4부터 추가된 어노테이션
    - @SpringBootTest
    - @WebMvcTest
    - @DataJpaTest
    - @RestClientTest
    - @JsonTest
    - @JdbcTest
- 스프링 부트2 추가된 어노테이션
    - @WebFluxTest
    - @JooqTest
    - @DataLdapTest
    - @DataNeo4jTest
    - @DataRedisTest

## 3.1. @SpringBootTest

- 통합 테스트를 제공하는 기본적인 스프링 부트 테스트 어노테이션이다.
- 애플리케이션이 실행될 때 설정을 임의로 바꾸어 테스트를 진행할 수 있으며, 여러 단위 테스트를 하나의 통합된 테스트로 수행할 때 적합하다.
- 실제 구동되는 애플리케이션과 똑같이 애플리케이션 컨텍스트를 로드하여 테스트하기 때문에 하고 싶은 테스트를 모두 수행이 가능하다.
- 단, 애플리케이션에 설정된 빈을 모두 로드하기 때문에 애플리케이션 규모가 클수록 느려지기 때문에 단위 테스트라는 의미가 희석된다.
- JUnit5에서는 `@ExtendWith(SpringExtension.class)`가 이미 안에 존재하기 때문에 생략이 가능하다.
- JUnit4에서는 @SpringBootTest를 사용하기 위해 JUnit 실행에 필요한 SpringJUnit4ClassRunner 클래스를 상속받은 @RunWith(SpringRunner.class)를 꼭 붙여서 사용해야 한다.

- 기본으로 제공되는 테스트 코드

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@SpringBootTest
public class TestApplicationTests {
    @Test
    void contextLoads() {
    }
}
```

- 이 클래스를 실행하면 애플리케이션 컨텍스트를 로드하여 스프링 부트 테스트를 진행합니다.
- @ExtendWith 어노테이션을 사용하면 JUnit에 내장된 러너를 사용하는 대신, 어노테이션에 정의된 러너 클래스를 사용합니다.

- @SpringBootTest 파라미터 사용하기

```java
import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {"property.value=propertyValue",
        "value=test"}, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = {TestApplication.class})
public class PropertyTest {
    @Value("${property.value}")
    private String propertyValue;

    @Value("${value}")
    private String value;

    @DisplayName("@SpringBootTest properties 학습 테스트")
    @Test
    void propertyTest() {
        assertThat(this.propertyValue).isEqualTo("propertyValue");
        assertThat(this.value).isEqualTo("test");
    }
}
```

```java
import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(value = {"property.value=propertyValue",
        "value=test"}, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = {TestApplication.class})
public class ValueTest {
    @Value("${property.value}")
    private String propertyValue;

    @Value("${value}")
    private String value;

    @DisplayName("@SpringBootTest properties 학습 테스트")
    @Test
    void propertyTest() {
        assertThat(this.propertyValue).isEqualTo("propertyValue");
        assertThat(this.value).isEqualTo("test");
    }
}
```

> value와 properties를 같이 사용하면 안됩니다. (에러 발생)

- value : 테스트가 실행되기 전 적용할 프로퍼티를 주입시킬 수 있다. 즉, 기존의 프로퍼티를 오버라이드함.
- properties : 테스트가 실행되기 전에 {key=value} 형식으로 프로퍼티 추가가 가능
- classes : 애플리케이션 컨텍스트에 로드할 클래스를 지정할 수 있음. 따로 지정하지 않는다면 `@SpringBootConfiguration`을 찾아 로드
- webEnvironment

[](https://github.com/ksy90101/TIL/blob/master/spring/spring-boot-test-web-environment)

- @SpringBootTest를 사용할 때 몇가지 추가적인 팁
    - 프로파일 환경마다 다른 데이터소스를 갖는다면 `@ActiveProfiles("local")`과 같은 방식으로 원하는 프로파일 환경값을 부여하면 된다.
    - 테스트에서 @Transcational을 사용하면 테스트를 마치고 나서 수정된 데이터가 롤백됨. 다만 테스트가 서버의 다른 스레드에서 실행 중이면 WebEnviroment의 RANDOM_PORT나 DEFINED_PORT를 사용하여 테스트를 수행해도 트랜잭션이 롤백되지 않습니다.
    - @SpringBootTest는 기본적으로 검색 알고리즘을 사용하여 @SpringBootApplication이나 @SpringBootConfiguration 어노테이션을 찾습니다. 스프링 부트 테스트이기 때문에 해당 어노테이션 중 하나는 필수입니다.

- 테스트 스타터에 포함된 자동 설정 패키지(spring-boot-test-autoconfigure)를 사용하면 주제에 따라 가볍게 테스트가 가능하다.
- 테스트 어노테이션명은 @...Test 형식으로 되어 있으서 주제에 관련된 빈만 애플리케이션 컨텍스트에 로드함.

## 3.2. @WebMvcTest

- MVC를 위한 테스트로 웹에서 테스트하기 힘든 컨트롤러를 테스트 하는데 적합하다.
- 웹상에서 요청과 응답에 대해 테스트를 할 수 있으며 시큐리티 혹은 필터까지 자동으로 테스트하며 수동으로 추가/삭제가 가능하다.

- 이 어노테이션을 사용하면 MVC 관련 설정인 @Controller, @ControllerAdvie, @JsonComponent, Filter, WebMvcConfigurer, HandlerMethodArgumentResolver만 로드 되기 때문에 @SpringBootTest 어노테이션보다 가볍게 테스트가 가능

```java
import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String title;
    @Column
    private LocalDateTime publishedAt;

    @Builder
    public Book(final String title, final LocalDateTime publishedAt) {
        this.title = title;
        this.publishedAt = publishedAt;
    }
}
```

```java
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
}
```

```java
import java.util.List;

import org.springframework.stereotype.Service;

import book.spring.test.ex.domain.Book;
import book.spring.test.ex.domain.BookRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class BookService {
    private final BookRepository bookRepository;

    public List<Book> getBookList() {
        return this.bookRepository.findAll();
    }
}
```

```java
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import book.spring.test.ex.service.BookService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Controller
public class BookController {
    private final BookService bookService;

    @GetMapping("/books")
    public String getBookList(final Model model) {
        model.addAttribute("bookList", this.bookService.getBookList());

        return "book";
    }
}
```

```java
import static org.hamcrest.Matchers.contains;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;
import java.util.Collections;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import book.spring.test.ex.domain.Book;
import book.spring.test.ex.service.BookService;

@WebMvcTest(BookController.class)
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookService bookService;

    @DisplayName("getBookList(): 정상 동작 테스트")
    @Test
    void getBookListTest() throws Exception {
        final Book book = new Book("Spring Boot Book", LocalDateTime.now());
        given(this.bookService.getBookList()).willReturn(Collections.singletonList(book));

        this.mockMvc.perform(get("/books"))
                .andExpect(status().isOk()) // status Code == 200(OK)
                .andExpect(view().name("book")) // viewName == book
                .andExpect(model().attributeExists("bookList")) // 모델 프로퍼티 중에 bookList가 있는지 확인
                .andExpect(model().attribute("bookList", contains(book))); // bookList에 위의 book 객체가 있는지 확인
    }
}
```

- 위와 같이 MockMvc를 사용하면 해당 URL의 상태값, 반환값에 대한 테스트를 수행할 수 있음.
- WebMvcTest를 사용하기 위해서는 테스트할 특정 컨트롤러명을 명시해줘야 한다.
- 왜냐하면 모든 의존성을 로드하는 것이 아니라 해당 컨트롤러에 관련된 빈만 로드하여 가벼운 MVC테스트를 할 수 있게 하기 때문이다. 아울러 MockMvc를 주입시켰기 때문에 전체 HTTP 서버를 실행하지 않고 테스트가 가능

- 여기서 주의해야 할 점은 Service는 테스트 적용 대상이 아니기 때문에 인터페이스를 구현한 구현체는 없지만, @MockBean을 사용해 컨트롤러 내부의 의존성 요소인 서비스를 가짜 객체로 대체하였으며, 이와 같은 가짜 객체를 목 객체라고 합니다. 목 객체는 실제 객체는 아니지만 특정 행위를 지정하여 실제 객체처럼 동작하게 할 수 있음.

## 3.3. @DataJpaTest

- JPA 관련 설정만 로드하며, 데이터소스의 설정이 정상적인지, JPA를 사용하여 데이터를 제대로 생성, 수정, 삭제하는 지에 대한 테스트가 가능
- 또한 내장형 데이터베이스(h2)를 이용해 실제 데이터베이스를 사용하지 않고 테스트 데이터베이스로 테스트가 가능
- 기본적으로 임베디드 데이터베이스(메인 메모리를 데이터 저장소로 하여 데이터베이스를 애플리케이션에 내장하여 운용하는 데이터 베이스 시스템으로 메인 메모리를 주 저장소로 사용하기 때문에 성능이 빠르지만 데이터 손실 가능성이 존재) 사용하며, @Entity 클래스를 스캔하여 스프링 데이터 JPA 저장소를 구성한다.
- 최적화한 별도의 데이터소스를 사용하고 싶다면 아래와 같이 기본 설정 데이터 소스를 사용하지 않도록 하며 된다.

```java
@ActiveProfiles("...")
@AutoConfigureTestDatabase(replace= AutoConfigureTestDatabase.Replace.NONE)
```

- AutoConfigureTestDatabase의 기본값은 `ANY`로 기본적으로 내장된 데이터소스를 사용한다. 예제와 같이 NONE을 사용하면 @ActiveProfiles에 설정한 프로파일 환경값에 따라 데이터소스가 적용
- 위 방법 외에 applciation.yml에서 `spring.test.database.replace: NONE`으로 변경하면 된다.
- @DataJpaTest는 JPA 테스트가 끝날 때마다 자동으로 테스트에 사용한 데이터를 롤백한다.
- 또한, 어떤 테스트 데이터베이스를 사용할 것인지 선택할 수 있다.(H2, Derby, HSQL...)

```jsx
// 프로퍼티 설정
spring.test.database.connection: H2

// 어노테이션 설정
@AutoConfigureTestDatabase(connection = H2)
```

- BookJpaTest

```java
import static org.assertj.core.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
class BookRepositoryTest {
    private static final String BOOK_TITLE = "Spring Boot Book";

    @Autowired
    private TestEntityManager testEntityManager;

    @Autowired
    private BookRepository bookRepository;

    @DisplayName("save() : book 저장하기 테스트")
    @Test
    void saveTest() {
        final Book book = Book.builder()
                .title(BOOK_TITLE)
                .publishedAt(LocalDateTime.now())
                .build();

        testEntityManager.persist(book);

        assertThat(bookRepository.getOne(book.getId())).isEqualTo(book);
    }

    @DisplayName("BookList 저장후 검색 테스트")
    @Test
    void searchAfterSaveAllTest() {
        final Book book1 = Book.builder()
                .title(BOOK_TITLE)
                .publishedAt(LocalDateTime.now())
                .build();
        testEntityManager.persist(book1);
        final Book book2 = Book.builder()
                .title(BOOK_TITLE)
                .publishedAt(LocalDateTime.now())
                .build();
        testEntityManager.persist(book2);
        final Book book3 = Book.builder()
                .title(BOOK_TITLE)
                .publishedAt(LocalDateTime.now())
                .build();
        testEntityManager.persist(book3);

        final List<Book> books = bookRepository.findAll();

        assertThat(books).hasSize(3);
        assertThat(books).contains(book1, book2, book3);
    }

    @DisplayName("저장하고 삭제 테스트")
    @Test
    void deleteAfterSave() {
        final Book book1 = Book.builder()
                .title(BOOK_TITLE)
                .publishedAt(LocalDateTime.now())
                .build();
        testEntityManager.persist(book1);
        final Book book2 = Book.builder()
                .title(BOOK_TITLE)
                .publishedAt(LocalDateTime.now())
                .build();
        testEntityManager.persist(book2);
        final Book book3 = Book.builder()
                .title(BOOK_TITLE)
                .publishedAt(LocalDateTime.now())
                .build();
        testEntityManager.persist(book3);

        List<Book> books = bookRepository.findAll();

        assertThat(books).hasSize(3);

        bookRepository.deleteAll();

        books = bookRepository.findAll();

        assertThat(books).hasSize(0);
    }
}
```

- 위의 테스트 외에도 올바르게 도메인 관계가 매핑되는지 여부도 테스트가 가능하다.

## 3.4. @RestClientTest

- RestClientTest는 Rest 관련 테스트를 도와주는 어노테이션
- REST 통신의 데이터형으로 사용되는 JSON 형식이 예상대로 응답을 반환하는지 테스트

```java
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import book.spring.test.ex.domain.Book;

@Service
public class BookRestService {
    private final RestTemplate restTemplate;

    public BookRestService(final RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.rootUri("/api/books")
                .build();
    }

    public Book getBook() {
        return restTemplate.getForObject("/api/books", Book.class);
    }
}
```

```java
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import book.spring.test.ex.domain.Book;
import book.spring.test.ex.service.BookRestService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
public class BookApiController {
    private final BookRestService bookRestService;

    @GetMapping(path = "/api/books", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Book> getBook() {
        final Book book = bookRestService.getBook();

        return ResponseEntity.ok(book);
    }
}
```

- RestTemplateBuilder
    - RestTemplate을 핸들링하는 빌더 객체로 connectionTimeout, ReadTimeOut 설정 등이 가능하다.
- getForObject()
    - Get 방식으로 통신하는 것으로 URI에 요청을 보내고 요청에 대한 응답을 명시한다.
- book.json

```jsx
{
  "idx": null,
  "title": "테스트",
  "publishedAt": null
}
```

- BookRestTest

```java
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.HttpServerErrorException;

import book.spring.test.ex.domain.Book;
import book.spring.test.ex.service.BookRestService;

@RestClientTest(BookRestService.class)
public class BookRestTest {

    @Autowired
    private BookRestService bookRestService;

    @Autowired
    private MockRestServiceServer mockRestServiceServer;

    @DisplayName("rest 테스트")
    @Test
    void restTest() {
        mockRestServiceServer.expect(requestTo("/api/books"))
                .andRespond(withSuccess(new ClassPathResource("/book.json", getClass()), MediaType.APPLICATION_JSON));

        final Book book = bookRestService.getBook();

        assertThat(book.getTitle()).isEqualTo("Spring Boot Book");
    }

    @DisplayName("rest error 테스트")
    @Test
    void restErrorTest() {
        mockRestServiceServer.expect(requestTo("/api/books"))
                .andRespond(withServerError());

        assertThatThrownBy(() -> bookRestService.getBook())
                .isInstanceOf(HttpServerErrorException.class);
    }
}
```

- @RestClientTest
    - 테스트 대상이 되는 빈을 주입받는다.
- MockRestServiceServer
    - 클라이언트와 서버 사이의 REST 테스트를 위한 객체
    - 내부에서 RestTemplate을 바인딩하여 실제로 통신이 이루어지게끔 구성할 수도 있다.
    - 이때 Mock을 사용하기 때문에 실제로 통신을 이루어지지 않지만, 지정한 경로에 예상되는 반환값 혹인 에러를 반환하도록 명시하여 간단하게 테스트를 진행함

## 3.5. @JsonTest

- JSON 테스트 지원
- 직렬화(serialization), 역직렬화(deserialization)를 수행하는 라이브러리인 Gson, Jackson API 테스트를 제공

```java
import static org.assertj.core.api.Assertions.*;

import java.io.IOException;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;

import book.spring.test.ex.domain.Book;

@JsonTest
public class BookJsonTest {

    @Autowired
    private JacksonTester<Book> json;

    @DisplayName("json 테스트")
    @Test
    void jsonTest() throws IOException {
        final Book book = Book.builder()
                .title("Spring Boot Book")
                .build();

        final String content = "{\"title\": \"Spring Boot Book\"}";

        assertThat(json.parseObject(content).getTitle()).isEqualTo(book.getTitle());
        assertThat(json.write(book)).isEqualToJson("/book.json");
        assertThat(json.write(book)).hasJsonPathStringValue("title");
        assertThat(json.write(book)).extractingJsonPathStringValue("title").isEqualTo("Spring Boot Book");
    }
}
```

## 3.6. 마치며

- 스프링 부트 어노테이션은 JUnit 자체에 내장된 테스트 메서드를 스프링에서 사용하기 편하도록 구성되어 있기 때문에 편하게 테스트를 할 수 있다.
