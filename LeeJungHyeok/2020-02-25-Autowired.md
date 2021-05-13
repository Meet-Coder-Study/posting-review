# Autowired
이전에 Spring DI에서 다음과 같은 코드가 있었다.  
```java

    @Configuration // 스프링 설정 클래스를 의미한다. 이 어노테이션을 붙여야 스프링 설정 클래스로 사용할 수 있다.
    public class AppCtx{

        @Bean // 빈객체를 생성한다는 것을 의미한다. 
        public SomeDao someDao() {
            return new SomeDao();
        }

        @Bean
        public SomeService someService() {
            return new SomeService(someDao());
        }

        @Bean
        public SomePasswordService somePasswordService() {
            SomePasswordService somePasswordService = new SomePasswordService();
            somePasswordService.setMemberDao(someDao());
            return somePasswordService;
        }
    }
```
여기서 somePasswordService를 보면 의존 대상을 생성자, 혹은 setter를 통해 주입했는데 여기서는 somePasswordService에서 직접 주입을 한다.  

스프링은 위처럼 설정 코드에서 직접 주입하지 않고, 스프링이 자동으로 의존하는 빈 객체를 주입해주는 기능이 있는데 이를 자동 주입이라고 한다.  

## @Autowired
@Autowired를 사용하면 스프링이 알아서 의존 객체를 찾아서 주입해준다.  
```java

    @Configuration // 스프링 설정 클래스를 의미한다. 이 어노테이션을 붙여야 스프링 설정 클래스로 사용할 수 있다.
    public class SomePasswordService{

        @Autowired
        SomeDao someDao;

        @Bean
        public void passwordChangeService() {
            SomeEntity someEntity = someDao.someMethod();
        }
    }
```

위를 보면 SomeDao someDao에 @Autowired를 통해 자동 의존주입을 하도록 했다.  
그리고 passwordChangeService메서드를 보면 따로 주입하는 코드가 없이 바로 someDao객체 안의 메서드를 호출 하는 것을 볼 수 있다.  

@Autowired는 메서드에도 붙일 수 있다.

```java


@Configuration // 스프링 설정 클래스를 의미한다. 이 어노테이션을 붙여야 스프링 설정 클래스로 사용할 수 있다.
public class SomePasswordService {

    SomeDao someDao;

    @Autowired
    public void setSomDao(MemberDao memberDao) {
        this.someDao = memberDao;
    }
}

@Configuration
public class AppCtx {
    @Bean
    public SomeDao someDao() {
        return new SomeDao();
    }
        
        ....

    @Bean
    public SomePrinter somePrinter() {
        return new SomePrinter();
    }
    
    @Bean
    public SomeInfoPrinter someInfoPrinter() {
        SomeInfoPrinter someInfoPrinter = new SomeInfoPrinter();
        return someInfoPrinter;
    }
}
```
위 코드에서 보면 SomePasswordService에서 class field에 @Autowired를 하지 않고 메서드에 만 했고, 그 아래 AppCtx클래스를 보면 
SomePasswordService의 setter메서드를 호출 하지 않는 것을 볼 수 있다.  
이 코드에서 Spring을 실행시키면 AppCtx.someDao()는 빈 객체의 메서드인데 @Autowired를 붙이면 스프링은 해당 메서드를 호출 하고, 
메서드 파라미터 타입에 따라 해당하는 빈 객체를 찾아 인자로 주입한다. 
여기서는 MemberDao를 주입한다.


## 일치하는 빈이 없을 경우

```java
public class SomeRegisterService {
    @Autowired
    private SomeDao someDao;

    public SomeRegisterService() {
    }

}

public class MemberListPrinter {

        private MemberDao memberDao;
        private MemberPrinter printer;

        public MemberListPrinter() {
        }

....

        @Autowired
        public void setMemberDao(MemberDao memberDao) {
            this.memberDao = memberDao;
        }

        @Autowired
        public void setMemberPrinter(MemberSummaryPrinter printer) {
            this.printer = printer;
        }
}
...
public class SomePasswordService {

    SomeDao someDao;

    @Autowired
    public void setSomDao(MemberDao memberDao) {
        this.someDao = memberDao;
    }
}

@Configuration
public class AppCtx {
        //
        // @Bean
        // public SomeDao someDao() {
        // 	return new someDao();
        // }
,.....
    }
```
@Autowired를 setSomDao에 적했지만 AppCtx에서 주석 처리를 하게되면 @Autowired를 적용한 대상인 setSomeDao와 일치하는 빈이 없게된다.  
이상황에서 Spring을 실행하면
```
Unsatisfied dependency expressed through field 'memberDao'; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'spring.MemberDao' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
Exception in thread "main" org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'memberRegSvc': Unsatisfied dependency expressed through field 'memberDao'; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'spring.MemberDao' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@org.springframework.beans.factory.annotation.Autowired(required=true)}
```

이런 내용이 포함된 Exception 메세지가 출력되는데 이는 SomeRegisterService의 SomeDao에 주입할 SomeDao빈이 존재 하지 않아 에러가 발생 한다는 사실을 알려준다.  


## 다음 내용
만약 @Autowired 어노테이션을 붙인 주입 대상에 일치하는 빈이 2개 이면 어떻게 될까?
그리고 이를 다룰수 있는 @Qualifier에 대해서 알아보자  
