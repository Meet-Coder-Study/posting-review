의식의 흐름대로 어떻게 application.properties 를 스프링 부트가 이해할 수 있는지 알아보자.
어느 시점부터 동작 방식이 변경되었다.

Spring 2.4.0 부터 application.properties 를 인식하는 것이 스프링부트 코드 내에서 변경되었음을 코드를 통해 확인할 수 있었다.

이전에는 `ConfigFileApplicationListener`  를 통해서 application.properties 를 로드할 수 있었지만 이제는 `ConfigDataEnvironmentPostProcessor` 를 통해서 application.properties 를 불러올 수 있게 되었다.

그럼 SpringBoot 코드상에서 어떻게 가져오는지 하나씩 살펴보면 아래와 같다.(다소 장황하고 길다. 차라리 실제로 스프링부트 코드를 실행시키면서 디버깅 모드로 천천히 따라가는 것을 추천한다.)

```java

// SpringApplication.java 

public ConfigurableApplicationContext run(String... args) {  
   long startTime = System.nanoTime();  
   DefaultBootstrapContext bootstrapContext = createBootstrapContext();  
   ConfigurableApplicationContext context = null;  
   configureHeadlessProperty();  
   SpringApplicationRunListeners listeners = getRunListeners(args);  
   listeners.starting(bootstrapContext, this.mainApplicationClass);  
   try {  
      ApplicationArguments applicationArguments = new DefaultApplicationArguments(args);  
      **ConfigurableEnvironment environment = prepareEnvironment(listeners, bootstrapContext, applicationArguments); ==> Look At This !!!
      configureIgnoreBeanInfo(environment);  
      Banner printedBanner = printBanner(environment);  
      context = createApplicationContext();  
      context.setApplicationStartup(this.applicationStartup);  
      prepareContext(bootstrapContext, context, environment, listeners, applicationArguments, printedBanner);  
      refreshContext(context);  
      afterRefresh(context, applicationArguments);  
      Duration timeTakenToStartup = Duration.ofNanos(System.nanoTime() - startTime);  
      if (this.logStartupInfo) {  
         new StartupInfoLogger(this.mainApplicationClass).logStarted(getApplicationLog(), timeTakenToStartup);  
      }  
      listeners.started(context, timeTakenToStartup);  
      callRunners(context, applicationArguments);  
   }  
   catch (Throwable ex) {  
      handleRunFailure(context, ex, listeners);  
      throw new IllegalStateException(ex);  
   }  
   try {  
      Duration timeTakenToReady = Duration.ofNanos(System.nanoTime() - startTime);  
      listeners.ready(context, timeTakenToReady);  
   }  
   catch (Throwable ex) {  
      handleRunFailure(context, ex, null);  
      throw new IllegalStateException(ex);  
   }  
   return context;  
}
```


```java
// SpringApplication.java 

private ConfigurableEnvironment prepareEnvironment(SpringApplicationRunListeners listeners,  
      DefaultBootstrapContext bootstrapContext, ApplicationArguments applicationArguments) {  
   // Create and configure the environment  
   ConfigurableEnvironment environment = getOrCreateEnvironment();  
   configureEnvironment(environment, applicationArguments.getSourceArgs());  
   ConfigurationPropertySources.attach(environment);  
   
   listeners.environmentPrepared(bootstrapContext, environment); <===🔥🔥🔥 Look At this
   
   DefaultPropertiesPropertySource.moveToEnd(environment);  
   Assert.state(!environment.containsProperty("spring.main.environment-prefix"),  
         "Environment prefix cannot be set via properties.");  
   bindToSpringApplication(environment);  
   if (!this.isCustomEnvironment) {  
      EnvironmentConverter environmentConverter = new EnvironmentConverter(getClassLoader());  
      environment = environmentConverter.convertEnvironmentIfNecessary(environment, deduceEnvironmentClass());  
   }  
   ConfigurationPropertySources.attach(environment);  
   return environment;  
}
```

`ApplicationEnvironmentPreparedEvent` 라는 이벤트를 발행합니다.
```java
// SpringApplicationRunListeners.java

void environmentPrepared(ConfigurableBootstrapContext bootstrapContext, ConfigurableEnvironment environment) {  
   doWithListeners("spring.boot.application.environment-prepared",  
         (listener) -> listener.environmentPrepared(bootstrapContext, environment));  
}
```

`listener.environmentPrepared` 가 실행됩니다.

`EventPublishingRunListener.java` 에 의해 `environmentPrepared()` 가 동작됩니다.

```java
// EventPublishingRunListener.java

@Override  
public void environmentPrepared(ConfigurableBootstrapContext bootstrapContext,  
      ConfigurableEnvironment environment) {  
   this.initialMulticaster.multicastEvent(  
         new ApplicationEnvironmentPreparedEvent(bootstrapContext, this.application, this.args, environment));  
}
```

initialMulticaster 가 뭔지는 모르겠지만, 뭔가 다중 목적지에 뿌려주는 역할을 하는 것 처럼 보입니다.
`ApplicationEnvironmentPreparedEvent` 를 전달받고자 하는 것으로 보이고 이는 `EnvironmentPostProcessorApplicationListener` 에서 받습니다.
```java
// EnvironmentPostProcessorApplicationListener.java

@Override  
public void onApplicationEvent(ApplicationEvent event) {  
   if (event instanceof ApplicationEnvironmentPreparedEvent) {  
      onApplicationEnvironmentPreparedEvent((ApplicationEnvironmentPreparedEvent) event);  <====== 여기를 타고 간다.
   }  
   if (event instanceof ApplicationPreparedEvent) {  
      onApplicationPreparedEvent();  
   }  
   if (event instanceof ApplicationFailedEvent) {  
      onApplicationFailedEvent();  
   }  
}
```
```java
// EnvironmentPostProcessorApplicationListener.java

private void onApplicationEnvironmentPreparedEvent(ApplicationEnvironmentPreparedEvent event) {  
   ConfigurableEnvironment environment = event.getEnvironment();  
   SpringApplication application = event.getSpringApplication();  
   for (EnvironmentPostProcessor postProcessor : getEnvironmentPostProcessors(application.getResourceLoader(),  
         event.getBootstrapContext())) {  
      postProcessor.postProcessEnvironment(environment, application);  
   }  
}
```

여기서 구현체가 postProcessor 가 여러개가 있습니다.
![[Pasted image 20220820003607.png]]

이 중에 우리가 봐야할 객체는 `ConfigDataEnvironmentPostProcessor` 이다.

```java
// ConfigDataEnvironmentPostProcessor.java

void postProcessEnvironment(ConfigurableEnvironment environment, ResourceLoader resourceLoader,  
      Collection<String> additionalProfiles) {  
   try {  
      this.logger.trace("Post-processing environment to add config data");  
      resourceLoader = (resourceLoader != null) ? resourceLoader : new DefaultResourceLoader();  
      getConfigDataEnvironment(environment, resourceLoader, additionalProfiles).processAndApply();  
   }  
   catch (UseLegacyConfigProcessingException ex) {  
      this.logger.debug(LogMessage.format("Switching to legacy config file processing [%s]",  
            ex.getConfigurationProperty()));  
      configureAdditionalProfiles(environment, additionalProfiles);  
      postProcessUsingLegacyApplicationListener(environment, resourceLoader);  
   }  
}
```

여기서 핵심은
`getConfigDataEnvironment(environment, resourceLoader, additionalProfiles).processAndApply();` 이것이다.

getConfigDataEnvironment(environment, resourceLoader, additionalProfiles) 에서 `ConfigDataEnvironment` 를 반환하고, 해당 `ConfigDataEnvironment` 에서
`processAndApply`을 실행한다.

```java
void processAndApply() {  
   ConfigDataImporter importer = new ConfigDataImporter(this.logFactory, this.notFoundAction, this.resolvers,  
         this.loaders);  
   registerBootstrapBinder(this.contributors, null, DENY_INACTIVE_BINDING);  
   ConfigDataEnvironmentContributors contributors = processInitial(this.contributors, importer);  <=== Look At this!!!
   ConfigDataActivationContext activationContext = createActivationContext(  
         contributors.getBinder(null, BinderOption.FAIL_ON_BIND_TO_INACTIVE_SOURCE));  
   contributors = processWithoutProfiles(contributors, importer, activationContext);  
   activationContext = withProfiles(contributors, activationContext);  
   contributors = processWithProfiles(contributors, importer, activationContext);  
   applyToEnvironment(contributors, activationContext, importer.getLoadedLocations(),  
         importer.getOptionalLocations());  
}
```

```java
// ConfigDataEnvironment.java

private ConfigDataEnvironmentContributors processInitial(ConfigDataEnvironmentContributors contributors,  
      ConfigDataImporter importer) {  
   this.logger.trace("Processing initial config data environment contributors without activation context");  
   contributors = contributors.withProcessedImports(importer, null);  
   registerBootstrapBinder(contributors, null, DENY_INACTIVE_BINDING);  
   return contributors;  
}
```

```java
// ConfigDataEnvironmentContributors.java


ConfigDataEnvironmentContributors withProcessedImports(ConfigDataImporter importer,  
      ConfigDataActivationContext activationContext) {  
   ImportPhase importPhase = ImportPhase.get(activationContext);  
   this.logger.trace(LogMessage.format("Processing imports for phase %s. %s", importPhase,  
         (activationContext != null) ? activationContext : "no activation context"));  
   ConfigDataEnvironmentContributors result = this;  
   int processed = 0;  
   while (true) {  
      ConfigDataEnvironmentContributor contributor = getNextToProcess(result, activationContext, importPhase);  
      if (contributor == null) {  
         this.logger.trace(LogMessage.format("Processed imports for of %d contributors", processed));  
         return result;  
      }  
      if (contributor.getKind() == Kind.UNBOUND_IMPORT) {  
         ConfigDataEnvironmentContributor bound = contributor.withBoundProperties(result, activationContext);  
         result = new ConfigDataEnvironmentContributors(this.logger, this.bootstrapContext,  
               result.getRoot().withReplacement(contributor, bound));  
         continue;      }  
      ConfigDataLocationResolverContext locationResolverContext = new ContributorConfigDataLocationResolverContext(  
            result, contributor, activationContext);  
      ConfigDataLoaderContext loaderContext = new ContributorDataLoaderContext(this);  
      List<ConfigDataLocation> imports = contributor.getImports();  
      this.logger.trace(LogMessage.format("Processing imports %s", imports));  
      Map<ConfigDataResolutionResult, ConfigData> imported = importer.resolveAndLoad(activationContext,  
            locationResolverContext, loaderContext, imports);  <==== 여기!!!
      this.logger.trace(LogMessage.of(() -> getImportedMessage(imported.keySet())));  
      ConfigDataEnvironmentContributor contributorAndChildren = contributor.withChildren(importPhase,  
            asContributors(imported));  
      result = new ConfigDataEnvironmentContributors(this.logger, this.bootstrapContext,  
            result.getRoot().withReplacement(contributor, contributorAndChildren));  
      processed++;  
   }  
}
```

`ConfigDataEnvironmentContributors contributors = processInitial(this.contributors, importer);` 이 코드가 properties 를 찾는 코드이다.

근데 여기서 재미난 부분이다.

아직 명확히 이해한 것은 아니나, `configDataEnvironmentContributors` 의 역할이 크다.

`configDataEnvironmentContributors` 는 어디서 값을 가져올 것인가를 세팅한다.

kind location resource configDataOptions 의 순서로 String 값이 박혀있다.
```text
ROOT null null []
    EXISTING null null []
    EXISTING null null []
    EXISTING null null []
    EXISTING null null []
    EXISTING null null []
    EXISTING null null []
    INITIAL_IMPORT null null []
    INITIAL_IMPORT null null []

```

각각의 configDataEnvironmentContributor 를 돌면서 파일을 찾는다.

`while (true) {  ... }` 시작되는 부분에서 찾는다.

끝에
`INITIAL_IMPORT null null []` <= 여기는 File 을 찾는다. 각각이 우선순위를 가진다.
`INITIAL_IMPORT null null []` <= 여기서 classpath:/application.properties  찾는다.

그럼 각 한줄이 어떻게 파일을 찾는지 살펴보면 다음과 같다.

`importer.resolveAndLoad(activationContext,locationResolverContext, loaderContext, imports);  <==== 여기!!!``

```java
Map<ConfigDataResolutionResult, ConfigData> resolveAndLoad(ConfigDataActivationContext activationContext,  
      ConfigDataLocationResolverContext locationResolverContext, ConfigDataLoaderContext loaderContext,  
      List<ConfigDataLocation> locations) {  
   try {  
      Profiles profiles = (activationContext != null) ? activationContext.getProfiles() : null;  
      List<ConfigDataResolutionResult> resolved = resolve(locationResolverContext, profiles, locations);  <=== Look at this!!
      return load(loaderContext, resolved);  
   }  
   catch (IOException ex) {  
      throw new IllegalStateException("IO error on loading imports from " + locations, ex);  
   }  
}
```

```java
// StandardConfigDataLocationResolver.java

private List<ConfigDataResolutionResult> resolve(ConfigDataLocationResolverContext locationResolverContext,  
      Profiles profiles, List<ConfigDataLocation> locations) {  
   List<ConfigDataResolutionResult> resolved = new ArrayList<>(locations.size());  
   for (ConfigDataLocation location : locations) {  
      resolved.addAll(resolve(locationResolverContext, profiles, location));  
   }  
   return Collections.unmodifiableList(resolved);  
}
```

실질적으로 configuration 파일을 찾는 코드이다.


다시 뒤로 돌아가서 `EnvironmentPostProcessorApplicationListener.onApplicationEnvironmentPreparedEvent` 을 모두다 순회한 뒤에는

`SpringApplication.prepareEnvironment(SpringApplicationRunListeners listeners,  DefaultBootstrapContext bootstrapContext, ApplicationArguments applicationArguments)` 으로 돌아와서

environment 를 확인하면 PropertySource 가 추가 됨을 확인할 수 있다.

![[Pasted image 20220820010645.png]]


이 쯤에서 자연스럽게 지나가서 놓친 중요한 부분 하나가 있다. 바로

`EnvironmentPostProcessor` 이다.

이 놈은 진짜로 중요하다. 왜 중요한지는 [SpringBoot 문서](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#howto.application.customize-the-environment-or-application-context)를 통해서 살펴보면 다음과 같다.

만약 application.properties 가 아닌 custom 한 foo.yml 을 resources 을 사용하고 싶다면 어떻게 해야될까?

이전에는 `@PropertySource` 를 통해서 리소스를 불러왔었지만, 이는 추천하는 방식이 아니라고 한다. 또는 @PropertySource 는 yml 을 지원하지 않기 때문에 이슈가 발생할 수 있습니다.

그래서 `EnvironmentPostProcessor` 가 더 필요합니다.

아래와 같은 코드를 작성해야만 foo.yml 을 리소스로 활용할 수 있다.

```java
public class MyEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private final YamlPropertySourceLoader loader = new YamlPropertySourceLoader();

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Resource path = new ClassPathResource("com/example/myapp/config.yml");
        PropertySource<?> propertySource = loadYaml(path);
        environment.getPropertySources().addLast(propertySource);
    }

    private PropertySource<?> loadYaml(Resource path) {
        Assert.isTrue(path.exists(), () -> "Resource " + path + " does not exist");
        try {
            return this.loader.load("custom-resource", path).get(0);
        }
        catch (IOException ex) {
            throw new IllegalStateException("Failed to load yaml configuration from " + path, ex);
        }
    }

}
```
```
// META-INF/spring.factories

org.springframework.boot.env.EnvironmentPostProcessor=com.example.YourEnvironmentPostProcessor
```
