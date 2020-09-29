# 스프링 배치 Tasklet과 청크지향 프로세싱

스프링 배치에서 하나의 배치 작업을 Job이라고 합니다.

그리고 각 Job은 여러 Step `단계`로 이뤄져 있습니다.

[](./images/springbatch.png)

이때 각 Step을 처리하기 위한 방법으로 스프링 배치에서는 Tasklet과 Chunks 방식을 제공하고 있습니다.

위 그림과 같이 Step을 Reader, Processor, Writer로 구분한 후 청크 단위로 배치를 처리하는 방식을 스프링 배치에서 권장하는 방법입니다.

## 그럼 Tasklet은?

Tasklet은 청크 지향 프로세싱 방식에서 Step을 Reader, Processor, Writer로 나눈 방식과 달리 하나의 단계로 처리하는 방식입니다.

즉, Reader 없이 단순 저장하는 로직이 필요하거나 Client를 통해 요청하는 작업이 필요할 수 있는데 이런 작업을 할 때 Tasklet을 사용할 수 있습니다.

```java
public interface Tasklet {
	@Nullable
	RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception;
}
```

Tasklet은 `execute` 메서드를 가지고 있는 인터페이스입니다. Step에서 `RepeatStatus.FINISHED`를 반환하거나 exception이 발생할 때까지 반복적으로 작업을 실행하게 됩니다.

### Tasklet 예시

> 간단하게 배치를 돌리면 슬랙에 알림을 보내는 작업을 한다고 가정합니다.

```java
@Slf4j
@Configuration
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "job.name", havingValue = SlackNotificationBatchJobConfiguration.JOB_NAME) // 1
public class SlackNotificationBatchJobConfiguration {
    public static final String JOB_NAME = "slackNotificationBatchJob";
    public static final String STEP_NAME = "slackNotificationStep";
    public static final String TASKLET_NAME = STEP_NAME + "-tasklet";

    private final JobBuilderFactory jobBuilderFactory; // 2
    private final TaskletStepBuilder taskletStepBuilder;
    private final SlackNotifier slackNotifier;

    @Bean(JOB_NAME) // 3
    public Job slackNotificationBatchJob(Step slackNotificationStep) {
        return jobBuilderFactory.get(JOB_NAME)
                .preventRestart()
                .start(slackNotificationStep)
                .build();
    }

    @Bean(STEP_NAME) // 4
    @JobScope
    public Step slackNotificationStep(@Qualifier(TASKLET_NAME) Tasklet notifier) {
        return taskletStepBuilder
                .tasklet(notifier)
                .build();
    }

    @Bean(TASKLET_NAME) // 5
    @StepScope
    public Tasklet notifyTasklet(@Value("#{jobParameter[to]}") String to) {
        return (contribution, chunkContext) -> {
            try {
                slackNotifier.notify(to);
                return RepeatStatus.FINISHED;
            } catch (Exception e) {
                log.error("slack notifier error occured. to: {}, message: {}", to, e.getMessage(), e);
                throw e;
            }
        };
    }
}
```

1. 위 예시에서는 하나의 Job Configuration 밖에 없지만 하나의 Batch Application 내에서는 여러 잡이 존재할 수 있다. 이때, 실행할 필요가 없는 빈을 생성할 이유가 없다. 따라서 애플리케이션에서 실행할 Job을 설정하는 `spring.batch.job.names` 파라미터에 포함된 Job만 생성되도록 위와 같이 설정할 수 있다.

> Test에서는 여러 Job이 발견되면 `spring.batch.job.names`에 상관없이 여러 Job을 찾는거 같음...

```java
Caused by: org.springframework.beans.factory.NoUniqueBeanDefinitionException: No qualifying bean of type 'org.springframework.batch.core.Job' available: expected single matching bean but found 2: inactiveUserJob,slackNotificationBatchJob
```

2. Spring Batch에서는 Job과 Step을 쉽게 생성할 수 있도록 `BuilderFactory`를 제공한다.

3. Job을 정의한 부분이다.

이때 get에는 정의할 Job의 이름을 정한다. 이 이름은 Spring Batch의 메타 테이블인 `BATCH_JOB_INSTANCE`에 `JOB_NAME`으로 저장된다.

[](./images/2020-09-26__3.42.55.png)

그리고 start로 해당 Job에서 실행할 Step을 정의하는데 위 예시에서는 슬랙알림을 보내는 하나의 Step만 필요하므로 `slackNotificationStep` 하나만 정의하였다. 만약 추가 Step을 정의하고 싶다면 `next` 등으로 정의가능하다.

또한 조건부로 Step이 실패했을때 어떤 Step을 실행할 것인지 등에 대해서도 정의가능하다.

4. Job의 Step을 정의한 부분이다. chunk를 사용하도록 정의할 수 있고 위처럼 tasklet으로 정의할 수 있다.

이때, `@JobScope`을 정의하였는데 Job이 실행될 때마다 빈을 초기화하도록 만드는 어노테이션이다. 이를 통해 JobParameters를 Job이 실행하는 JobExecutionContext나 StepContext 단계에서 할당하도록 만들 수 있다.

참고로 `@JobScope`은 Job의 하위 단계인 Step에 정의가능하다.

5. Tasklet을 정의한 부분이다.

여기에서는 `slackNotifier`를 사용하여 `jobParameters`로 할당 받은 `to`에게 알림을 보내도록 동작하는 로직이 구현되어있다. 이때 알림 전송이 성공하면 `RepeatStatus.FINISHED`를 반환하여 배치를 끝내도록하고 실패하면 `Exception`을 던져 배치를 끝내도록 한다.

`RepeatStatus`에는 `FINISHED` 말고 `CONTINUABLE`이 있는데 이를 반환하면 다시 배치를 동작한다.

### 테스트

```java
@ActiveProfiles("local")
@SpringBatchTest
@SpringBootTest
@TestPropertySource(properties = "job.name=" + SlackNotificationBatchJobConfiguration.JOB_NAME)
class SlackNotificationBatchJobConfigurationTest {

    @Autowired
    private JobLauncherTestUtils jobLauncherTestUtils;

    @Test
    void slackNotificationBatchJob() throws Exception {
        // given
        JobParameters jobParameters = new JobParametersBuilder()
                .addString("to", "pkch")
                .toJobParameters();

        // when
        JobExecution jobExecution = jobLauncherTestUtils.launchJob(jobParameters);

        // then
        BatchStatus status = jobExecution.getStatus();
        assertThat(status).isEqualTo(BatchStatus.COMPLETED);
    }
}
```

위와 같이 테스트 작성하여 동작하면

```java
2020-09-26 16:00:46.872  INFO 42646 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=slackNotificationBatchJob]] launched with the following parameters: [{to=pkch}]
2020-09-26 16:00:46.882  INFO 42646 --- [           main] o.s.batch.core.job.SimpleStepHandler     : Executing step: [slackNotificationStep]
2020-09-26 16:00:46.885  INFO 42646 --- [           main] edu.pkch.batch.components.SlackNotifier  : send slack notification to pkch
2020-09-26 16:00:46.887  INFO 42646 --- [           main] o.s.batch.core.step.AbstractStep         : Step: [slackNotificationStep] executed in 5ms
2020-09-26 16:00:46.890  INFO 42646 --- [           main] o.s.b.c.l.support.SimpleJobLauncher      : Job: [SimpleJob: [name=slackNotificationBatchJob]] completed with the following parameters: [{to=pkch}] and the following status: [COMPLETED] in 17ms
```

## 청크 지향 프로세싱

위와 같이 Takelet 형태로 배치잡을 처리할수도 있지만 Spring Batch에서는 배치 작업을 청크단위로 나눠 처리하는 청크 지향 프로세싱을 권장한다.

[](./images/chunk-oriented-processing.png)

> Chunk-oriented Processing의 일반적인 형태

청크 지향 프로세싱은 청크 단위로 트랜잭션을 묶어 데이터를 처리한다. 이때, Chunk는 데어터의 덩어리로 하나의 커밋에 처리되는 row의 수를 의미한다.

Chunk 단위로 데이터를 만들어내는 방식은 다음과 같다.

먼저 `ItemReader`에서 하나의 아이템씩 값을 가져온다. 그리고 해당 아이템을 처리할 필요가 있는 경우 `ItemProcessor`를 거쳐 값을 처리한다. 이렇게 설정한 Chunk의 수만큼 데이터를 가져온 뒤에 `ItemWriter`로 최종 쓰기처리를 한다.

### 예시

```java
@Configuration
@ConditionalOnProperty(name = "spring.batch.job.names", havingValue = InactiveUserJobConfiguration.JOB_NAME)
@RequiredArgsConstructor
public class InactiveUserJobConfiguration {
    public static final String JOB_NAME = "inactiveUserBatchJob";
    public static final String STEP_NAME = "inactiveUserBatchStep";
    public static final String READER_NAME = STEP_NAME + "-reader";
    public static final String PROCESSOR_NAME = STEP_NAME + "-processor";
    public static final String WRITER_NAME = STEP_NAME + "-writer";

    @Value("${chunkSize:25}")
    private int chunkSize;
    private int count;

    public static List<String> RAW_NUMBERS = IntStream.rangeClosed(1, 1000)
            .mapToObj(String::valueOf)
            .collect(Collectors.toList());

    @Bean(JOB_NAME) // 1
    public Job inactiveUserBatchJob(JobBuilderFactory jobBuilderFactory,
                                    @Qualifier(STEP_NAME) Step inactiveUserBatchStep) {
        return jobBuilderFactory.get(JOB_NAME)
                .preventRestart()
                .incrementer(new RunIdIncrementer())
                .start(inactiveUserBatchStep)
                .build();
    }

    @Bean(STEP_NAME) // 2
    public Step inactiveUserBatchStep(StepBuilderFactory stepBuilderFactory) {
        return stepBuilderFactory.get(STEP_NAME)
                .<String, Integer>chunk(chunkSize)
                .reader(reader())
                .processor(processor())
                .writer(writer())
                .build();
    }

    @Bean(READER_NAME) // 3
    public ItemReader<String> reader() {
        return () -> {
            if (count != 1000) {
                count += 1;
                return RAW_NUMBERS.remove(0);
            }

            return null;
        };
    }

    @Bean(PROCESSOR_NAME) // 4
    public ItemProcessor<String, Integer> processor() {
        return Integer::parseInt;
    }

    @Bean(WRITER_NAME) // 4
    public ItemWriter<Integer> writer() {
        return System.out::println;
    }
}
```

1000개의 String을 batch작업을 통해 Integer로 바꾸는 간단한 배치를 작업해보았습니다.

1. Job을 설정하는 단계. 청크지향 프로세싱을 사용하는 Job에서도 Tasklet에서와 큰 차이가 없습니다.

2. Step을 설정하는 단계. 이 부분부터 조금씩 달라집니다.

먼저 나눌 청크의 단위를 `chunk`의 인자로 전달합니다. 현재 위 예시에서는 기본적으로 `25`개씩 청크를 나눕니다.
그리고 reader, processor, writer를 정의합니다.

3. reader를 정의한 부분.

위 예시에서는 미리 1000개의 String 숫자를 정의하여 하나씩 전달하는 용도로 구현하였습니다. 이때 null을 리턴하게되면 더이상 배치를 진행하지 않습니다.

그리고 하나씩 `remove(0)`을 통해 리턴을 한 이유는 Spring Batch가 reader와 processor에서 하나씩 값을 읽고 가공한 후 chunk 숫자만큼 모이면 이 데이터를 writer로 전달하기 때문입니다.

4. processor와 writer를 정의한 부분.

processor에서는 Reader에서 String 형태로 전달한 item을 Integer로 변환합니다. 그리고 writer에서는 chunk 단위로 모인 값들을 출력하는 역할을 합니다.

실제로는 writer에서 db에 저장하는 로직을 가질 것입니다.

이렇게 작성한 코드를 실행하면 다음과 같이 나타납니다.

[](./images/chunk-processing-result.png)

이렇게 위 예시에서 정의한 `inactiveUserBatchJob`이 실행됨을 확인할 수 있으며 writer에서 작성한 `System.out::println` 부분이 25개씩 나타나는 것을 확인할 수 있습니다.

만약 chunk를 500씩 설정한다면 다음과 같이 나타납니다.

[](./images/chunk-processing-result2.png)

500개씩 println으로 값이 찍히는 것을 확인할 수 있습니다.

### 참고자료

- https://docs.spring.io/spring-batch/docs/current/reference/html/index.html
- https://cheese10yun.github.io/spring-batch-basic/
- https://jojoldu.tistory.com/search/Spring%20batch
- https://www.baeldung.com/spring-batch-tasklet-chunk
