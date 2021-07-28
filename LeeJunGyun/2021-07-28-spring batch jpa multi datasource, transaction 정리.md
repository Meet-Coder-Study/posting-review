> source 는 [Github](https://github.com/leechoongyon/spring-bootb-batch-multi-datasource-example) 에 있습니다.

## spring batch multi datasource jpa 정리
- spring batch 에서 2개 이상의 다른 데이터 베이스에 접근하는 예제를 정리했습니다.
- 이 예제에서는 h2, MySQL 을 jpa 를 통해 저장하는 예제를 정리했습니다.

## data source 세팅 부분

#### LazyConnectionDataSourceProxy
-  LazyConnectionDataSourceProxy 로 wrapping 한 이유는 스프링의 경우 트랜잭션 시작 시,
   datasource 의 connection 를 사용하건 안하건 커넥션을 확보합니다.
-  그로 인해 불필요한 리소스가 발생하게되고, 이를 줄이기 위해 LazyConnectionDataSourceProxy 로
   wrapping 할 경우 실제 커넥션이 필요한 경우에만 datasource 에서 connection 을 반환합니다.
-  즉, Multi DataSource 에서 해당 설정을 넣어주면 좋습니다. single datasource 에서는
   미리 가져오면 거의 왠만하면 쓰겠지만 2개 이상의 datasource 의 경우는 안쓰는 datasource 가
   있을 수 있기에 이 설정을 넣어주면 좋습니다.

#### DataSource 에 Primary 설정
- spring-batch 의 경우 배치 실행, 아규먼트 등을 관리하는 테이블이 있습니다.
- primary 설정을 넣어주면 spring-batch 관리 테이블은 해당 데이터소스로 접근합니다.

```java

@Configuration
@RequiredArgsConstructor
public class DataSourceConfiguration {
    private static final String MAIN_PROPERTIES = "spring.datasource.main.hikari";
    private static final String SUB_PROPERTIES = "spring.datasource.sub.hikari";

    public static final String MAIN_DATASOURCE = "mainDataSource";
    public static final String SUB_DATASOURCE = "subDataSource";

    @Bean
    @ConfigurationProperties(prefix = MAIN_PROPERTIES)
    public HikariConfig mainHikariConfig() {
        return new HikariConfig();
    }


    @Primary // batch job repository datasource 는 primary 설정 datasource 로 설정됨.
    @Bean(MAIN_DATASOURCE)
    public DataSource mainDataSource() {
        return new LazyConnectionDataSourceProxy(new HikariDataSource(mainHikariConfig()));
    }

    @Bean
    @ConfigurationProperties(prefix = SUB_PROPERTIES)
    public HikariConfig subHikariConfig() {
        return new HikariConfig();
    }

    @Bean(SUB_DATASOURCE)
    public DataSource subDataSource() {
        return new LazyConnectionDataSourceProxy(new HikariDataSource(subHikariConfig()));
    }
}

```


## jpa 설정 부분

#### package 설정 부분
- MAIN, SUB 로 데이터베이스 설정을 나누었으며, 각각의 설정 별로 package 를 분리했습니다.
- MAIN 은 com.example.batch.domain.main, SUB 은 com.example.batch.domain.sub

## TransactionManager 부분
- MAIN, SUB TransactionManager 를 설정했으며, Main 이 주 TransactionManager 입니다
- ChainedTransactionManager 를 통해 MAIN, SUB 을 묶었습니다.

```java

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties({JpaProperties.class, HibernateProperties.class})
public class JpaConfiguration {
    @Primary
    @Bean(name = MAIN_TRANSACTION_MANAGER)
    public PlatformTransactionManager mainTransactionManager(
            @Qualifier(MAIN_ENTITY_MANAGER_FACTORY) LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        return new JpaTransactionManager(Objects.requireNonNull(entityManagerFactory.getObject()));
    }

    @Bean(name = SUB_TRANSACTION_MANAGER)
    public PlatformTransactionManager subTransactionManager(
            @Qualifier(SUB_ENTITY_MANAGER_FACTORY) LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        return new JpaTransactionManager(Objects.requireNonNull(entityManagerFactory.getObject()));
    }

    @Bean(name = CHAINED_TRANSACTION_MANAGER)
    public PlatformTransactionManager chainedTransactionManager(
             @Qualifier(MAIN_TRANSACTION_MANAGER) PlatformTransactionManager mainTransactionManager
            ,@Qualifier(SUB_TRANSACTION_MANAGER) PlatformTransactionManager subTransactionManager) {
        return new ChainedTransactionManager(mainTransactionManager, subTransactionManager);
    }


    public static final String MAIN_REPOSITORY_PACKAGE = "com.example.batch.repository.main";
    public static final String SUB_REPOSITORY_PACKAGE = "com.example.batch.repository.sub";

    @Configuration
    @EnableJpaRepositories(
             basePackages = MAIN_REPOSITORY_PACKAGE
            ,entityManagerFactoryRef = JpaConfiguration.MAIN_ENTITY_MANAGER_FACTORY
            ,transactionManagerRef = JpaConfiguration.MAIN_TRANSACTION_MANAGER
    )
    public static class MainJpaRepositoriesConfig{}

    @Configuration
    @EnableJpaRepositories(
            basePackages = SUB_REPOSITORY_PACKAGE
            ,entityManagerFactoryRef = JpaConfiguration.SUB_ENTITY_MANAGER_FACTORY
            ,transactionManagerRef = JpaConfiguration.SUB_TRANSACTION_MANAGER
    )
    public static class SubJpaRepositoriesConfig{}

}

```

#### ChainedTransactionManager 동작 방식
- 아래 그림과 같이 Transaction 1, Transaction 2 가 트랜잭션을 시작하고 비즈니스 로직을 처리합니다.

- 비즈니스 로직을 처리한 후, 순차적으로 트랜잭션을 commit/rollback 처리하는 것이 ChainedTransactionManager 의 동작 방식입니다.

- 이 트랜잭션 매니저의 문제점은 Transaction 2 가 commit 된 후, Transaction 1 이 commit 에 실패할 수 있습니다.

- 그렇기에 이 점을 유의해서 사용해야합니다.

![동작방식](./images/ChainedTransactionManager.png)



## spring batch 에서 트랜잭션 매니저를 적용하는 방법
- 아래 소스와 같이 stepBuilder 에 transactionManager 를 ChainedTransactionManager 로 설정해줍니다.
- transactionManager 를 설정안하면 transactionManager 이름을 가진 빈이 기본 값입니다.

```java

@Configuration
public class MultiDataSourceJob {

    @Bean
    public Step multiDataSourceStep01() {
        return stepBuilderFactory.get("multiDataSourceStep01")
                .<MainSubDTO, MainSubDTO>chunk(CHUNK_SIZE)
                .reader(multiDataSourceBean)
                .writer(multiDataSourceBean)
                .transactionManager(chainedTransactionManager)
                .build()
                ;
    }
}

```

## 테스트
- chunk_size = 1 로 맞췄으며, writer 가 5번 수행된 후, Exception 을 발생시켰습니다.
- 이렇게 수행한 이유는 같은 트랜잭션 매니저가 동작되는 것을 테스트 하기 위함입니다.

- 아래와 같이 수행했을 때, 각각 MAIN, SUB DATABASE 에는 5개의 데이터가 쌓입니다.



![데이터적재](./images/data1.png)

```java

@RunWith(SpringRunner.class)
@SpringBatchTest
@SpringBootTest(classes={MultiDataSourceJob.class, MultiDataSourceBean.class, TestConfig.class})
public class MultiDataSourceJobIntegrationTest {
    @Test(expected = RuntimeException.class)
    public void 멀티데이터소스_통합_테스트() throws Exception {
        JobExecution jobExecution = jobLauncherTestUtils.launchJob();
        Assert.assertThat(jobExecution.getStatus(),  is(BatchStatus.COMPLETED));
        Assert.assertThat(jobExecution.getExitStatus(),  is(ExitStatus.COMPLETED));
    }
}

@Slf4j
@Component
@StepScope
@RequiredArgsConstructor
public class MultiDataSourceBean implements ItemReader<MainSubDTO>, ItemWriter<MainSubDTO>  {

    private final MainRepository mainRepository;
    private final SubRepository subRepository;

    private int readCount = 10;
    private int currentCount = 0;

    private int writeCount = 0;
    private int stopWriteCount = 5;

    @Override
    public MainSubDTO read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException {
        if (currentCount == readCount) {
            return null;
        }
        currentCount++;

        Main main = Main.builder()
                .desc("main desc...")
                .build();
        Sub sub = Sub.builder()
                .etc("sub etc...")
                .build();
        return MainSubDTO.builder()
                .main(main)
                .sub(sub)
                .build();
    }

    @Override
    public void write(List<? extends MainSubDTO> items) throws Exception {
        if (writeCount == stopWriteCount) {
            throw new RuntimeException("트랜잭션 테스트");
        }

        items.forEach(item -> {
            mainRepository.save(item.getMain());
            subRepository.save(item.getSub());
        });

        writeCount++;
    }
}



```


## ChainedTransactionManager 를 해결하는 방법
- ChainedTransactionManager 의 문제점은 1개의 트랜잭션은 성공적으로 동작을 했는데 다른 1개의 트랜잭션이 실패하는 것에 대해 문제가 발생할 수 있습니다.
- 위에 예제는 1개의 스텝에서 2개의 database 에 crud 하는 예제이고 위 문제를 내포하고 있습니다. 하지만 이는 거의 일어나지 않을 확률이 많습니다.
- 위 문제를 해결하기 위해서 스텝을 2개로 나누는 것입니다. 한개의 스텝에서 MAIN 데이터베이스에 데이터를 crud 하고, 또 다른 스텝에서는 SUB 데이터베이스 데이터를 CRUD 합니다.
- 이렇게 할 경우 위 문제는 해결이 가능합니다.
- 2개의 스텝으로 처리할 경우 특징은 다음과 같습니다.
    - 소스가 길어집니다. (=프로그램의 복잡도가 증가한다. 프로그램이 실패했을 때, 고려할점이 많아진다.)
    - ChainedTransactionManager 의 트랜잭션 문제점을 고민안해도 됩니다.
- 1개의 스텝으로 처리할 경우 특징은 간단하다는 것입니다.

## 결론
- 제 개인적인 생각으로는 일반적으로는 ChainedTransactionManager 를 사용하며, 데이터 정합성이 정말 중요한 업무의 경우 트랜잭션을 분리해서 처리하는 것이 좋다고 생각합니다.
- 트랜잭션 장애는 거의 발생하지 않으며, 이로 인해 얻을 수 있는 이점이 더 많다고 생각됩니다.

## reference
- https://terasoluna-batch.github.io/guideline/5.0.0.RELEASE/en/Ch05_Transaction.html
- https://jojoldu.tistory.com/506
- https://kwonnam.pe.kr/wiki/springframework/lazyconnectiondatasourceproxy