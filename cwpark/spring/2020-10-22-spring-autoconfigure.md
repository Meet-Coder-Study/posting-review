# 스프링 자동 구성, Spring Autoconfiguration



스프링 프레임워크 4.0 이후 도입된 조건부 구성(Conditional Configuration)은 구성 클래스를 만드는 작업을 대신해준다. 예를 들어, Thymeleaf, Spring Data JPA, Spring MVC 등의 구성이 있다. 스프링 부트에서는 spring-boot-autoconfigure 라는 라이브러리가 그 역할을 한다. 

우리가 스프링부트에 Spring Data Jpa 이나 JdbcTemplate 의존성을 추가하고, 이와 관련된 bean은 어떻게 이러한 의존성이 존재하는지를 알 수 있을까?

```java
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnootetedTypeMetadata;

public class JdbcTemplateCondition implements Condition {
  @Override
  public boolean matches(ConditionContext context, AnootatedTypeMetadata metadata) {
    try {
      context.getClassLoader().loadClass("org.springframework.jdbc.core.JdbcTempalte");
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
```

위 예제는 JdbcTemplate이 클래스패스에 존재하는 지 확인하여 불리언 값을 반환하는 조건 클래스이다. `org.springframework.context.annotation.Condition` 인터페이스를 상속하였다는 것을 볼 수 있다.

이 클래스를 사용하려면 빈을 선언할 때 `@Conditional` 어노테이션을 붙여준다.

```java
@Conditional(JdbcTemplateCondition.class)
@Bean
public MyService myService() {
  //...
}
```

JdbcTemplate이 클래스패스에 있을 때만, MyService 빈이 생성된다. 그렇지 않으면 이 빈 선언은 무시된다.

​	

```java
@Configuration
@ConditionalOnClass({DataSource.class, EmbeddedDatabaseType.class})
@EnableConfigurationProperties(DataSourceProperties.class)
@Import({ Register.class, DataSourcePoolMetadataProvidersConfiguration.class})
public class DataSourceAutoConfiguration {
  //...
}
```

이 자동 구성 빈은 `@Configuration` 이 붙여져있다. 즉, 자체적으로 빈을 정의하는 것을 알 수 있다. 또한, `@ConditionalOnClass` 는 DataSource와 EmbeddedDatabaseType가 모두 클래스패스에 있어야만 이 구성 클래스가 활성화된다.

이 클래스 내부에 중첩된 클래스 중 하나가 `JdbcTemplateConfiguration` 이 있다.

```java
@Configuration
@Conditional(DataSourceAutoConfiguration.DataSourceAvailableCondition.class)
protected static class JdbcTemplateConfiguration {
  @Autowired(required=false)
  private DataSource dataSource;
  
  @Bean
  @ConditionalOnMissingBean(JdbcOperations.class)
  public JdbcTeamplate jdbcTemplate() {
    return new JdbcTeamplte(this.dataSource);
  }
//  ...
}
```



다음과 같이 그래이들 의존성을 추가한다고 가정하자. 어떻게 스프링부트의 자동 구성이 이루어질까?

```groovy

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
	implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	runtimeOnly 'com.h2database:h2'
}
```

- H2가 클래스패스에 존재하므로 내장 H2 데이터베이스를 생성한다. 생성하는 빈 타입은 `javax.sql.DataSource` 다. 
- 하이버네이트 엔티티 매니저(Entity Manager)가 스프링 데이터 Jpa에 의해 클래스패스에 위치하게 된다.
- 스프링 데이터 JPA가 클래스패스에 존재하므로, 리포지토리 인터페이스에 구현체를 자동으로 생성하기 위해 스프링 데이터 JPA를 구성한다.

- Thymeleaf가 클래스패스에 존재하므로, Thymeleaf가 스프링 MVC의 뷰 옵션으로 구성된다(Thymeleaf 템플릿 리졸버, 템플릿 엔진, 뷰 리졸버). 템플릿 리졸버는 클래스패스 루트 기준으로 /template 에 있는 템플릿을 해석하도록 구성된다.

- 웹 스타터 의존성이 스프링 MVC가 클래스패스에 있는 것을 알고 DispatcherServlet을 구성하여 스프링 MVC를 활성화한다.
- 톰캣이 클래스패스에 존재하므로 8080 포트에서 수신 대기하는 내장 톰캣 컨테이너를 시작한다.

---

스프링 부트 코딩 공작소. 크레이그 월즈. 2017. 길벗