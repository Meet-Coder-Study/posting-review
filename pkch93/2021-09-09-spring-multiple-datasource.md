# Spring Multiple DataSource

- [Spring Multiple DataSource](#spring-multiple-datasource)
  - [DataSource 설정](#datasource-설정)
  - [EntityManagerFactories 설정](#entitymanagerfactories-설정)
  - [JpaTransactionManager 설정](#jpatransactionmanager-설정)
  - [참고](#참고)

애플리케이션 개발을 하다보면 2개 이상의 DB에 접근해야할 경우가 있다. Spring Boot에서는 기본적으로 하나의 DataSource에 대해서 설정을 하기 때문에 2개 이상의 DB에 접근해야한다면 직접 DataSource 설정을 해주어야한다.

## DataSource 설정

핵심은 주 DataSource에 `@Primary` 어노테이션을 붙이는 것이다. 이를 통해 명시적으로 DataSource를 사용할 때 이외에 암묵적으로 DataSource를 사용하더라도 애플리케이션에서 어떤 DataSource를 사용해야할 지 알 수 있다.

```java
@Configuration(proxyBeanMethods = false)
public class MyDataSourcesConfiguration {

    @Bean
    @Primary
    @ConfigurationProperties("app.datasource.first")
    public DataSourceProperties firstDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @Primary
    @ConfigurationProperties("app.datasource.first.configuration")
    public HikariDataSource firstDataSource(DataSourceProperties firstDataSourceProperties) {
        return firstDataSourceProperties.initializeDataSourceBuilder().type(HikariDataSource.class).build();
    }

    @Bean
    @ConfigurationProperties("app.datasource.second")
    public BasicDataSource secondDataSource() {
        return DataSourceBuilder.create().type(BasicDataSource.class).build();
    }

}
```

위와 같이 `@Primary`로 firstDataSource를 등록했다. 이 경우 `DataSource`를 그냥 `@Autowired`로 주입하는 경우 firstDataSource가 주입된다.

```java
@Configuration
public class DataSourceInjectTest {

    @Autowired
    private DataSource dataSource; // firstDataSource

    // ...
}
```

## EntityManagerFactories 설정

JPA 사용시 각 DB에 연결할 EntityManager가 필요하다. 생성한 DataSource의 수만큼 EntityManagerFactory가 필요하므로 이 또한 설정해주어야한다.

EntityManagerFactory를 생성하기 위한 강력하고 쉬운 방법으로 Spring에서는 LocalContainerEntityManagerFactoryBean를 제공한다.

기본적으로 Spring Boot에서는 LocalContainerEntityManagerFactoryBean의 빌더인 EntityManagerFactoryBuilder를 빈으로 등록하고 있어 이를 주입 받아 생성할 수 있다.

EntityManagerFactoryBuilder를 통해 LocalContainerEntityManagerFactoryBean를 생성하면 properties나 yml 설정 파일로 지정한 JpaProperties를 그대로 사용할 수 있다.

```java
@Configuration(proxyBeanMethods = false)
public class MyEntityManagerFactoryConfiguration {

    @Bean
    @ConfigurationProperties("app.jpa.first")
    public JpaProperties firstJpaProperties() {
        return new JpaProperties();
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean firstEntityManagerFactory(DataSource firstDataSource,
            JpaProperties firstJpaProperties) {
        EntityManagerFactoryBuilder builder = createEntityManagerFactoryBuilder(firstJpaProperties);
        return builder.dataSource(firstDataSource).packages(Order.class).persistenceUnit("firstDs").build();
    }

    private EntityManagerFactoryBuilder createEntityManagerFactoryBuilder(JpaProperties jpaProperties) {
        JpaVendorAdapter jpaVendorAdapter = createJpaVendorAdapter(jpaProperties);
        return new EntityManagerFactoryBuilder(jpaVendorAdapter, jpaProperties.getProperties(), null);
    }

    private JpaVendorAdapter createJpaVendorAdapter(JpaProperties jpaProperties) {
        return new HibernateJpaVendorAdapter();
    }

}
```

만약 2개 이상의 EntityManagerFactory를 활용한다면 주 DataSource에 `@Primary`를 붙였던거처럼 EntityManagerFactory에도 동일하게 설정해주어야한다.

> Spring Data JPA의 Repository를 사용한다면 `@EnableJpaRepositories`를 통해 적용할 EntityManagerFactory 설정 등이 필요하다.

## JpaTransactionManager 설정

마지막으로 JPA을 사용하면서 Spring의 트랜잭션 지원을 받야아한다면 JpaTransactionManager를 등록해주어야한다.

```java
@Primary
@Bean(name = "firstTransactionManager")
public PlatformTransactionManager firstTransactionManager(
        @Qualifier("firstEntityManagerFactory") LocalContainerEntityManagerFactoryBean firstEntityManagerFactory
) {
    return new JpaTransactionManager(firstEntityManagerFactory.getObject());
}

@Bean(name = "secondTransactionManager")
public PlatformTransactionManager firstTransactionManager(
        @Qualifier("secondEntityManagerFactory") LocalContainerEntityManagerFactoryBean secondEntityManagerFactory
) {
    return new JpaTransactionManager(secondEntityManagerFactory.getObject());
}
```

위와 같이 마찬가지로 주 DB에 접근해야하는 TransactionManager에 `@Primary`를 붙여준다.

## 참고

baeldung 참고: [https://www.baeldung.com/spring-data-jpa-multiple-databases](https://www.baeldung.com/spring-data-jpa-multiple-databases)

Spring Data Access 8.2 Configure Two DataSources 참고: [https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-access.configure-two-datasources](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-access.configure-two-datasources)