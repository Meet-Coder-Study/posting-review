# Spring Multiple DataSource

- [Spring Multiple DataSource](#spring-multiple-datasource)
  - [DataSource 설정](#datasource-설정)
  - [EntityManagerFactory와 JpaTransactionManager 설정](#entitymanagerfactory와-jpatransactionmanager-설정)
  - [테스트](#테스트)
  - [참고](#참고)

애플리케이션 개발을 하다보면 2개 이상의 DB에 접근해야할 경우가 있다. Spring Boot에서는 기본적으로 하나의 DataSource에 대해서 설정을 하기 때문에 2개 이상의 DB에 접근해야한다면 직접 DataSource 설정을 해주어야한다.

## DataSource 설정

핵심은 주 DataSource에 `@Primary` 어노테이션을 붙이는 것이다. 이를 통해 명시적으로 DataSource를 사용할 때 이외에 암묵적으로 DataSource를 사용하더라도 애플리케이션에서 어떤 DataSource를 사용해야할 지 알 수 있다.

```java
@Configuration
public class DataSourceConfig {

    @Bean
    @ConfigurationProperties("mysql.datasource.config")
    public HikariConfig mysqlHikariConfig() {
        return new HikariConfig();
    }

    @Bean
    @Primary
    public HikariDataSource mysqlDataSource(@Qualifier("mysqlHikariConfig") HikariConfig mysqlHikariConfig) {
        return new HikariDataSource(mysqlHikariConfig);
    }

    @Bean
    @ConfigurationProperties("postgres.datasource.config")
    public HikariConfig postgresHikariConfig() {
        return new HikariConfig();
    }

    @Bean
    public HikariDataSource postgresDataSource(@Qualifier("postgresHikariConfig") HikariConfig postgresHikariConfig) {
        return new HikariDataSource(postgresHikariConfig);
    }
}

```

위와 같이 `@Primary`로 mysqlDataSource 등록했다. 이 경우 `DataSource`를 그냥 `@Autowired`로 주입하는 경우 MySQL을 바라보고 있는 mysqlDataSource가 주입된다.

```java
@Configuration
public class DataSourceInjectTest {

    @Autowired
    private DataSource dataSource; // mysqlDataSource

    // ...
}
```

참고로 HikariDataSource도 HikariConfig를 확장하고 있기 때문에 HikariDataSource를 생성하는 빈 메서드에 `ex. mysqlDataSource, postgresDataSource` `@ConfigurationProperties`를 지정할 수 있다.

```java
@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("mysql.datasource.config")
    public HikariDataSource mysqlDataSource() {
        return new HikariDataSource();
    }

    @Bean
    @ConfigurationProperties("postgres.datasource.config")
    public HikariDataSource postgresDataSource() {
        return new HikariDataSource();
    }
}
```

설정에 사용한 application.yml은 다음과 같다.

```yaml
mysql:
  datasource:
    config:
      driver-class-name: com.mysql.cj.jdbc.Driver
      jdbc-url: jdbc:mysql://localhost:3306/jpaedu?useSSL=false
      url: jdbc:mysql://localhost:3306/jpaedu?useSSL=false
      username: root
      password: password
      pool-name: mysql-hikari-pool
      max-life-time: 5000
      maximum-pool-size: 50

postgres:
  datasource:
    config:
      driver-class-name: org.postgresql.Driver
      jdbc-url: jdbc:postgresql://localhost:5432/jpaedu
      username: postgres
      password: password
      pool-name: postgres-hikari-pool
```

## EntityManagerFactory와 JpaTransactionManager 설정

JPA 사용시 각 DB에 연결할 EntityManager가 필요하다. 생성한 DataSource의 수만큼 EntityManagerFactory가 필요하므로 이 또한 설정해주어야한다.

EntityManagerFactory를 생성하기 위한 강력하고 쉬운 방법으로 Spring에서는 LocalContainerEntityManagerFactoryBean를 제공한다.

기본적으로 Spring Boot에서는 LocalContainerEntityManagerFactoryBean의 빌더인 EntityManagerFactoryBuilder를 빈으로 등록하고 있어 이를 주입 받아 생성할 수 있다.

```java
@Configuration
@EnableJpaRepositories(
        basePackages = MYSQL_ENTITY_BASE_PACKAGES,
        entityManagerFactoryRef = MYSQL_ENTITY_MANAGER_FACTORY_NAME,
        transactionManagerRef = MYSQL_TRANSACTION_MANAGER_NAME
)
public class MysqlEntityManagerConfig {
    public static final String MYSQL_ENTITY_BASE_PACKAGES = "edu.pkch.datajpa.mysql";
    public static final String MYSQL_ENTITY_MANAGER_FACTORY_NAME = "mysqlEntityManagerFactory";
    public static final String MYSQL_TRANSACTION_MANAGER_NAME = "mysqlTransactionManager";
    public static final String MYSQL_PERSISTENCE_UNIT_NAME = "default";

    @Bean(MYSQL_ENTITY_MANAGER_FACTORY_NAME)
    @Primary
    public LocalContainerEntityManagerFactoryBean mysqlEntityManagerFactory(EntityManagerFactoryBuilder entityManagerFactoryBuilder, HikariDataSource mysqlDataSource) {
        return entityManagerFactoryBuilder
                .dataSource(mysqlDataSource)
                .packages(MYSQL_ENTITY_BASE_PACKAGES)
                .persistenceUnit(MYSQL_PERSISTENCE_UNIT_NAME)
                .properties(properties)
                .build();
    }

    @Bean(MYSQL_TRANSACTION_MANAGER_NAME)
    @Primary
    public JpaTransactionManager mysqlTransactionManager(LocalContainerEntityManagerFactoryBean mysqlEntityManagerFactory) {
        return new JpaTransactionManager(mysqlEntityManagerFactory.getObject());
    }
}
```
위 설정은 주 DB인 MySQL에 접근하기 위한 EntityManagerFactory와 TransactionManager 설정이다. 주 DB에 대한 설정이므로 `@Primary`를 붙여 설정했다.

참고로 EntityManagerFactoryBuilder를 통해 LocalContainerEntityManagerFactoryBean를 생성하면 properties나 yml 설정 파일로 지정한 JpaProperties를 그대로 사용할 수 있다.

그 이유로는 LocalContainerEntityManagerFactoryBean을 생성하기 위해 사용하는 EntityManagerFactoryBuilder에 답이 있다.

```java
@Bean
@ConditionalOnMissingBean
public EntityManagerFactoryBuilder entityManagerFactoryBuilder(JpaVendorAdapter jpaVendorAdapter,
        ObjectProvider<PersistenceUnitManager> persistenceUnitManager,
        ObjectProvider<EntityManagerFactoryBuilderCustomizer> customizers) {
    EntityManagerFactoryBuilder builder = new EntityManagerFactoryBuilder(jpaVendorAdapter,
            this.properties.getProperties(), persistenceUnitManager.getIfAvailable());
    customizers.orderedStream().forEach((customizer) -> customizer.customize(builder));
    return builder;
}
```

위와 같이 Spring Boot에서는 AutoConfiguration을 통해서 위와 같이 EntityManagerFactoryBuilder 빈을 만들어준다.

> org.springframework.boot.autoconfigure.orm.jpa.JpaBaseConfiguration#entityManagerFactoryBuilder 참고

이때 builder를 만들때 EntityManagerFactoryBuilder의 두번째 인자로 JpaProperties의 properties가 들어가는 것을 확인할 수 있다. 따라서 `spring.jpa.properties` 설정은 문제없이 동작한다.

다만 `spring.jpa.hibernate`로 설정하는 HibernateProperties는 동작하지 않는다.

```java
@Bean
@Primary
@ConditionalOnMissingBean({ LocalContainerEntityManagerFactoryBean.class, EntityManagerFactory.class })
public LocalContainerEntityManagerFactoryBean entityManagerFactory(EntityManagerFactoryBuilder factoryBuilder) {
    Map<String, Object> vendorProperties = getVendorProperties();
    customizeVendorProperties(vendorProperties);
    return factoryBuilder.dataSource(this.dataSource).packages(getPackagesToScan()).properties(vendorProperties)
            .mappingResources(getMappingResources()).jta(isJta()).build();
}
```

위는 JpaBaseConfiguration에서 entityManagerFactory 빈을 생성하는 빈 메서드이다. 기본으로 entityManagerFactory 빈을 생성할때는 `getVendorProperties`를 통해 추상클래스인 JpaBaseConfiguration의 구현 클래스에서 정의한 JPA 구현체의 프로퍼티를 가져와서 설정한다.

반면 방금 설정한 `mysqlEntityManagerFactory`는 따로 프로퍼티 설정을 하지 않았기 때문에 hibernate 설정은 누락이 된다.

```java
@Bean(MYSQL_ENTITY_MANAGER_FACTORY_NAME)
@Primary
public LocalContainerEntityManagerFactoryBean mysqlEntityManagerFactory(EntityManagerFactoryBuilder entityManagerFactoryBuilder, HikariDataSource mysqlDataSource) {
    return entityManagerFactoryBuilder
            .dataSource(mysqlDataSource)
            .packages(MYSQL_ENTITY_BASE_PACKAGES)
            .persistenceUnit(MYSQL_PERSISTENCE_UNIT_NAME)
            .build();
}
```

따라서 EntityManagerFactory를 생성할 때 properties를 넣어서 설정하는 등의 방법이 필요하다.

> 위와 같이 구현된 이유를 생각해보면 JPA는 Java ORM의 인터페이스이고 JPA의 구현체는 Hibernte 뿐만 아니라 다양한 구현체가 올 수 있기 때문에 동작하는 구현체에 맞게 EntityManagerFactory 빈을 만들기 위함이 아닐까싶다.

마지막으로 JPA을 사용하면서 Spring의 트랜잭션 지원을 받야아한다면 JpaTransactionManager를 등록해주어야한다.

```java
@Bean(MYSQL_TRANSACTION_MANAGER_NAME)
@Primary
public JpaTransactionManager mysqlTransactionManager(LocalContainerEntityManagerFactoryBean mysqlEntityManagerFactory) {
    return new JpaTransactionManager(mysqlEntityManagerFactory.getObject());
}
```

참고로 Spring Data JPA의 Repository를 사용한다면 `@EnableJpaRepositories`를 통해 적용할 EntityManagerFactory 설정 등이 필요하다.

```java
@EnableJpaRepositories(
        basePackages = MYSQL_ENTITY_BASE_PACKAGES,
        entityManagerFactoryRef = MYSQL_ENTITY_MANAGER_FACTORY_NAME,
        transactionManagerRef = MYSQL_TRANSACTION_MANAGER_NAME
)
```

위와 같이 basePagackes에는 스캔할 Repository의 패키지 설정, entityManagerFactoryRef는 스캔된 Repository가 사용할 EntityManagerFactory 참조 설정, transactionManagerRef는 스캔된 Repository가 사용할 TransactionManger 참조를 설정한다.


다음은 Postgres에 대한 EntityManagerFactory와 TransactionManager 설정이다.

```java
@Configuration
@EnableJpaRepositories(
        basePackages = POSTGRES_ENTITY_BASE_PACKAGES,
        entityManagerFactoryRef = POSTGRES_ENTITY_MANAGER_FACTORY_NAME ,
        transactionManagerRef = POSTGRES_TRANSACTION_MANAGER_NAME
)
public class PostgresEntityManagerConfig {
    public static final String POSTGRES_ENTITY_BASE_PACKAGES = "edu.pkch.datajpa.postgresql";
    public static final String POSTGRES_ENTITY_MANAGER_FACTORY_NAME = "postgresEntityManagerFactory";
    public static final String POSTGRES_TRANSACTION_MANAGER_NAME = "postgresTransactionManager";
    public static final String POSTGRES_PERSISTENCE_UNIT_NAME = "legacy";

    @Bean(POSTGRES_ENTITY_MANAGER_FACTORY_NAME)
    public LocalContainerEntityManagerFactoryBean postgresEntityManagerFactory(EntityManagerFactoryBuilder entityManagerFactoryBuilder, @Qualifier("postgresDataSource") HikariDataSource postgresDataSource) {
        return entityManagerFactoryBuilder
                .dataSource(postgresDataSource)
                .packages(POSTGRES_ENTITY_BASE_PACKAGES)
                .persistenceUnit(POSTGRES_PERSISTENCE_UNIT_NAME)
                .properties(properties)
                .build();
    }

    @Bean(POSTGRES_TRANSACTION_MANAGER_NAME)
    public JpaTransactionManager postgresTransactionManager(
            @Qualifier(POSTGRES_ENTITY_MANAGER_FACTORY_NAME) LocalContainerEntityManagerFactoryBean postgresEntityManagerFactory
    ) {
        return new JpaTransactionManager(postgresEntityManagerFactory.getObject());
    }
}
```

## 테스트

위 같은 설정으로 엔티티를 정의해서 테스트를 해본다. MySQL에는 Member 테이블을 정의해서 데이터가 정상적으로 들어가는지 보는 반면 Postgresql에는 legacymember 테이블을 정의하여 데이터가 정상적으로 들어가는지 본다.

이를 위해 먼저 엔티티를 정의한다.

```java
@Entity
@Table
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nickname;

    @Builder
    public Member(Long id, String nickname) {
        this.id = id;
        this.nickname = nickname;
    }
}
```

위 Member 엔티티 클래스의 위치는 `edu.pkch.datajpa.mysql`이다. 위 패키지에 `MemberRepository`도 정의한다.

```java
@Entity
@Table
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LegacyMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nickname;

    @Builder
    public LegacyMember(String nickname) {
        this.nickname = nickname;
    }
}
```

마찬가지로 LegacyMember 엔티티 클래스의 위치는 `edu.pkch.datajpa.postgresql`이다. 위 패키지에 `LegacyMemberRepository`도 정의한다.

마지막으로 테스트를 위한 엔드포인트를 만든다.

```java
@RestController
@RequestMapping("/member")
public class MemberController {
    private final MemberRepository memberRepository;

    public MemberController(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @PostMapping
    public void createMember() {
        memberRepository.save(
                Member.builder()
                        .nickname("member")
                        .build()
        );
    }
}
```

```java
@RestController
@RequestMapping("/legacy/member")
public class LegacyMemberController {
    private final LegacyMemberRepository legacyMemberRepository;

    public LegacyMemberController(LegacyMemberRepository legacyMemberRepository) {
        this.legacyMemberRepository = legacyMemberRepository;
    }

    @PostMapping
    public void createLegacyMember() {
        legacyMemberRepository.save(
                LegacyMember.builder()
                        .nickname("legacy-member")
                        .build()
        );
    }
}
```

`/member`로 `POST` 요청을 하면 MySQL의 Member 테이블에 nickname이 `member`인 데이터가 insert 되고 `/legacy/member`로 `POST` 요청을 하면 Postgresql의 legacymember 테이블에 nickname이 `legacy-member`인 데이터가 insert 된다.

```text
src
    ├── main
    │   ├── java
    │   │   └── edu
    │   │       └── pkch
    │   │           └── datajpa
    │   │               ├── SpringDataJpaEduApplication.java
    │   │               ├── config
    │   │               │   ├── DataSourceConfig.java
    │   │               │   ├── MysqlEntityManagerConfig.java
    │   │               │   └── PostgresEntityManagerConfig.java
    │   │               ├── controller
    │   │               │   ├── LegacyMemberController.java
    │   │               │   └── MemberController.java
    │   │               ├── mysql
    │   │               │   ├── Member.java
    │   │               │   └── MemberRepository.java
    │   │               └── postgresql
    │   │                   ├── LegacyMember.java
    │   │                   └── LegacyMemberRepository.java
    │   └── resources
    │       └── application.yml

```

> 참고로 위 구조가 테스트용 프로젝트의 패키지 구조이다.

```shell
curl -X POST http://localhost:8080/member
```

위와 같이 호출하고 확인하면 정상적으로 MySQL에 데이터가 들어간 것을 확인할 수 있다.

<img width="419" alt="스크린샷 2021-09-12 오후 3 51 46" src="https://user-images.githubusercontent.com/30178507/132977806-a9fcdba0-5602-4a75-ada3-d2d4edc1e454.png">

마찬가지로 `/legacy/member`를 호출하면 Postgres에 데이터가 들어간 것을 확인할 수 있다.

```shell
curl -X POST http://localhost:8080/legacy/member
```

<img width="419" alt="스크린샷 2021-09-12 오후 3 51 19" src="https://user-images.githubusercontent.com/30178507/132977804-7533b436-fcd1-4c8b-ab4c-e4093e56a8e0.png">

## 참고

baeldung 참고: [https://www.baeldung.com/spring-data-jpa-multiple-databases](https://www.baeldung.com/spring-data-jpa-multiple-databases)

Spring Data Access 8.2 Configure Two DataSources 참고: [https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-access.configure-two-datasources](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-access.configure-two-datasources)