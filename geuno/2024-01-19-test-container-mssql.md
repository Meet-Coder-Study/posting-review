
# Spring MSSQL Test Container 도입기
 
&emsp;이번에 여러 환경에 대해서 `Jenkins`를 이용하여 배포 파이프라인을 구성하면서 빌드를 하는 PC와 배포를 하는 PC가 달라지는 상황이 있었다. <br>
&emsp;그리고 그 빌드 PC에서는 여러 환경에 대한 배포의 빌드를 동시에 진행하게 되었는데 이 때, `container`로 띄워놓은 `database`를 동시에 여러 빌드가 참조하게 되니 (심지어 같은 데이터베이스의 같은 테이블을 바라봄) 당연히 동시에 진행되면 테스트가 다 깨지면서 빌드가 실패하게 되었다. <br> 
&emsp;환경별로 DB를 다 다르게 구성을 해서 Spring의 test profile도 환경별로 다 나눠야 하나 라는 이상한 고민을 하다가 `TestContainer`를 도입하면 test가 진행될 때 외부 의존성(Container로 떠 있는 MSSQL DB)이 없어짐으로써 아주 깔끔한 구성이 되겠다는 생각에 도입을 진행해 봤다.

## MSSQL Test Container 구성[^footnote1]
 가이드[^footnote3]를 보고 진행을 했다. 코드는 아래와 같다.
```java
@Container
private static final MSSQLServerContainer<?> SQLSERVER_CONTAINER = new MSSQLServerContainer<>(
   "mcr.microsoft.com/mssql/server:2022-latest").acceptLicense();

@DynamicPropertySource
static void setProperties(DynamicPropertyRegistry dynamicPropertyRegistry) {
  dynamicPropertyRegistry.add("spring.datasource.url", SQLSERVER_CONTAINER::getJdbcUrl);
  dynamicPropertyRegistry.add("spring.datasource.username", SQLSERVER_CONTAINER::getUsername);
  dynamicPropertyRegistry.add("spring.datasource.password", SQLSERVER_CONTAINER::getPassword);
};

static {
  SQLSERVER_CONTAINER.start();
 }

```
그러나 이와 같이 구성하면 구성되어진 testContainer의 Database로 connection을 맺지 않고, 계속 yaml 파일에 정의되어 있는 JdbcUrl에 연결을 맺고 테스트가 진행됐었다. 당연히, TestContainer의 포트를 고정시키고 yaml 파일에 url을 박아넣으면 되지 않을까?! 라는 생각을 했지만 [TestContainer 문서](https://java.testcontainers.org/features/networking/)를 보면 아래와 같이 적혀있다.
> From the host's perspective Testcontainers actually exposes this on a random free port. This is by design, to avoid port collisions that may arise with locally running software or in between parallel test runs.

즉, 디자인적으로 포트 충돌 방지하기 위해서 랜덤으로 꼭 생성된다는 것이다. 어쩔 수 없이 yaml 파일에 정적으로 박아넣는것은 불가능했다.

### DataSource Bean 커스터마이징[^footnote2]
&emsp;그래서 생각한 것이 `DataSource` 를 직접 정의해서 Bean으로 등록하는 것이었다. `DataSource` 직접 정의 하는 코드는 아래와 같다.
```java
@Bean
public DataSource dataSource() {
  DataSourceBuilder<?> dataSourceBuilder = DataSourceBuilder.create();
  dataSourceBuilder.driverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
  dataSourceBuilder.url(SQLSERVER_CONTAINER.getJdbcUrl());
  dataSourceBuilder.username(SQLSERVER_CONTAINER.getUsername());
  dataSourceBuilder.password(SQLSERVER_CONTAINER.getPassword());
  dataSourceBuilder.type(HikariDataSource.class);
  return dataSourceBuilder.build();
}
```
>❗️ `주의점` : 어디선가 `DriverManagerDataSource`를 이용하여 `DataSource`를 빈으로 등록하는 코드를 보고 따라했었는데
> 해당 구현체로는 Hibernate의 ddl-auto가 제대로 적용이 안되는 문제가 발생했었음. 왜인지는 조금 더 확인이 필요

### DataSource Bean을 Test ApplicationContext에 적용하기
&emsp;보통 Spring Boot Test에서 통합테스트를 하게 되면 `@SpringBootTest` 어노테이션을 주로 활용하게 되는데, 해당 어노테이션은 알아서 `@SpringBootConfiguration`(`@SpringBootApplication` 어노테이션 안에 포함되어 있는 어노테이션)을 찾고 `Bean`들을 `ApplicationContext`에 로드하면서 구성하게 된다. <br>
그러나, `@SpringBootTest` 안에 classes라는 필드를 활용하면 `@SpringBootApplication` 을 자동으로 먼저 찾지 않고, 
해당 필드의 클래스들을 이용하여 `ApplicationContext`를 구성하게 된다. 즉 아래와 같이 적용이 가능하다.
```java
@SpringBootTest(classes = {ContextConfig.class, MainSpringBootApplication.class})
@ActiveProfiles("test")
public interface IntegrationTest {
}

@Configuration
@EnableAutoConfiguration
public class ContextConfig {

  @Container
  public static final MSSQLServerContainer<?> SQLSERVER_CONTAINER = new MSSQLServerContainer<>(
    "mcr.microsoft.com/mssql/server:2022-latest").acceptLicense();


  @Bean
  public DataSource dataSource() {
    DataSourceBuilder<?> dataSourceBuilder = DataSourceBuilder.create();
    dataSourceBuilder.driverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
    dataSourceBuilder.url(SQLSERVER_CONTAINER.getJdbcUrl());
    dataSourceBuilder.username(SQLSERVER_CONTAINER.getUsername());
    dataSourceBuilder.password(SQLSERVER_CONTAINER.getPassword());
    dataSourceBuilder.type(HikariDataSource.class);
    return dataSourceBuilder.build();
  }


  static {
    SQLSERVER_CONTAINER.start();
  }
}
```
위와 같이 코드를 구성하면, `@SpringBootTest` 어노테이션이 `ApplicationContext`를 구성할때, `ContextConfig`에 있는 Bean과, `MainSpringBootApplication`의 Bean들 만을 이용하여 `ApplicationContext`를 구성하게 된다. (`@SpringBootConfiguration` 에 대한 auto-detection을 하지 않음)<br>

### TestConfiguration에 대한 부연설명
추가적으로, 테스트를 구성하다보면 `@TestConfiguration`을 사용할 때도 있는데 `@TestConfiguration`은 `@Configuration`과는 달리 `@SpringBootConfiguration`의 auto-detection을 막지는 못한다.
```java
@SpringBootTest(classes = {TestConfig.class})
@ActiveProfiles("test")
public interface IntegrationTest {
}

@TestConfiguration
public class TestConfig {
  ...
}
```
&ensp;이 때 `@SpringBootTest`가 `TestConfig`에 있는 Bean 만으로 `ApplicationContext`를 만드려고 시도하는 것이 아닌, `@SpringBootConfiguration`을 내부적으로 또 찾아서, Bean을 추가적으로 등록하여 `ApplicationContext`를 구성하게 된다. <br>
보통 `@Configuration`은 `ApplicationContext`를 구성하기 위해서 사용되는 것 같고, `@TestConfiguration` 은 테스트를 위해서 `ApplicationContext`에서 구성된 Bean을 Customizing을 한다거나, 추가적으로 Bean을 등록하고자 할때 사용한다고 한다. [참고문서](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/test/context/TestConfiguration.html)

## 결론
&ensp;이번에 TestContainer를 도입하게 되면서 Spring Boot Test 에서 ApplicationContext를 구성하기 위해 어떻게 해야 하는지 좀 제대로 배우게 된 계기가 된 것같다. 해당 글에는 담기지 않은 엄청난 뻘짓들이 많았는데 그러면서 동작 원리를 이해할 수 있었다. 그리고 TestContainer를 도입함으로써 Jenkins 배포 파이프라인 또한 매우 깔끔하게 잘 동작하는 성과를 얻었다.

## 참고
[^footnote1]: [TestContainer for Java: MS SQL Server Module](https://java.testcontainers.org/modules/databases/mssqlserver/)
[^footnote2]: [Baeldung: Spring Boot Configure Data Source Programmatic](https://www.baeldung.com/spring-boot-configure-data-source-programmatic)
[^footnote3]: [Medium: Integration testing of SpringBoot with MS SQL Server using TestContainers](https://tipsontech.medium.com/integration-testing-of-springboot-with-ms-sql-server-using-testcontainers-22058cb50b54)

