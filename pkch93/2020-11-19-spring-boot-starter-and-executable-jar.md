# Spring Boot Basic

docs: [https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)

Spring Boot란 Spring 기반의 애플리케이션을 단독으로 생성하여 실행할 수 있도록 지원해주는 도구이다.

Spring Boot는 다음과 같은 목적으로 진행된 프로젝트이다.

- 스프링 개발 환경에서 쉽고 빠르게 시작할 수 있는 경험 제공
- Spring Boot 기본설정에서 벗어난 요구사항에 대한 커스텀 설정을 간단하게
- Embedded Server, Security, Metrics 등 다양한 공통 기능 제공
- 환경 설정을 위한 코드와 XML 설정 제거

  Spring Boot 이전의 Spring 개발환경은 환경 구축에만 2주정도 걸렸다고 한다.

> 2020.11.17 현재 Spring Boot 2.4.0이 최신 버전이며 Java 8과 Spring 5.3.1이 필요하다.

# starters

Spring Boot에서는 애플리케이션에서 포함할 수 있는 편의성 dependency descriptor를 제공한다. 이것이 바로 starters이다. 보통 `spring-boot-starter-*`의 형태로 이뤄진다.

Spring MVC를 사용한다고 가정한다. Spring Boot에서는 `spring-boot-starter-web`을 제공한다. 만약 `spring-boot-starter-web`을 의존성에 추가하면 다음과 같은 의존성이 들어온다.

```groovy
// build.gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
		// ...
}
```

![https://user-images.githubusercontent.com/30178507/99683028-3d473c00-2ac3-11eb-9f2a-0bc2770f8882.png](https://user-images.githubusercontent.com/30178507/99683028-3d473c00-2ac3-11eb-9f2a-0bc2770f8882.png)

> Spring Boot 2.3.6.RELEASE 기준

위와 같이 Spring 환경에서 web 기능을 사용하기 위한 다양한 의존성을 `spring-boot-starter-web` 하나만으로 제공해준다.

mvnrepository 참고: [https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-web/2.3.5.RELEASE](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-web/2.3.5.RELEASE)

web 이외에 Spring Boot에서는 다양한 starter 의존성들을 지원한다.
starters 참고: [https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using-boot-starter](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using-boot-starter)

## 나만의 starter 만들기

custom starter는 다음 2가지 사항을 포함해야한다.

- `acme`를 위한 auto-configuration 코드를 포함한 `autoconfigure` 모듈

  `acme`는 주어진 기술에 인프라를 자동으로 구성하고 커스텀하기 위한 코드를 포함한 starter를 의미

- `starter` 모듈은 `autoconfigure` 모듈 뿐 아니라 `acme` 및 일반적으로 유용한 추가 의존성을 제공하는 모듈이다. 즉, `starter` 라이브러리 사용자가 필요한 모든 것을 제공해야한다.

### Naming

커스텀 `spring-boot-starter`의 이름에는 `spring-boot`로 모듈 이름을 시작할 수 없다 포함할 수 없다. `offcial support를 위함`

보통은 모듈이름 + `spring-boot-starter`로 붙이는 것 같음.

### Configuration Keys `properties`

커스텀 `spring-boot-starter`가 Configuration Key들을 지원하는 경우 유니크한 네임스페이스를 가져야한다. 특히 Spring Boot에서 이미 사용하고 있는 `server, management, spring 등` 네임스페이스는 포함하면 안된다.

Configuration Keys에 대해 Spring Boot에서는 다음 컨벤션을 가진다.

1. `The`나 `A`로 description을 시작하지 말 것.
2. Boolean인 경우 `Whether`나 `Enable`로 description을 시작할 것.
3. Collection 기반의 타입은 콤마로 구분할 수 있도록 description을 `Comma-separated list`로 시작할 것.
4. 시간을 표현하는 변수에 대해서는 `long`보다는 `java.time.Duration`을 사용할 것.
5. 런타임에 결정되어야하는 값이 아니라면 default value를 description에 기술하지 말 것.

위 설명은 `META-INF/spring-configuration-metadata.json`으로 만들어지는 Configuration Keys에 대한 문서에 들어간다.

참고로 `spring-boot-autoconfigure` 내부에 보면 `META-INF/spring-configuration-metadata.json`가 있는데 `spring-boot-autoconfigure`에서 지원하는 properties에 대해 확인할 수 있다.

![https://user-images.githubusercontent.com/30178507/99683029-3e786900-2ac3-11eb-8074-39c086b76836.png](https://user-images.githubusercontent.com/30178507/99683029-3e786900-2ac3-11eb-8074-39c086b76836.png)

### autoconfigure module

`autoconfigure` 모듈은 starter 라이브러리를 시작하는데 필수적인 모든 것을 포함해야한다. 여기에는 Configuration Keys와 함께 컴포넌트들을 커스텀하게 만들기 위한 CallBack 인터페이스들을 포함한다.

Spring Boot는 `META-INF/spring-autoconfigure-metadata.properties` 메타데이터 파일의 Auto-Configuration 상태를 가져오기 위해 Annotation Processor를 사용한다. 이 파일이 포함되어 있다면 일치하지 않는 설정사항을 필터링하는 데 사용되어 부팅 시간을 줄일 수 있다.

gradle 4.6 이상을 사용한다면 다음과 같이 의존성을 추가한다.

```groovy
dependencies {
    annotationProcessor "org.springframework.boot:spring-boot-autoconfigure-processor"
}
```

### starter module

starter는 사실 빈 jar이다.

![https://user-images.githubusercontent.com/30178507/99683035-3fa99600-2ac3-11eb-9115-a8bd07f8f4b7.png](https://user-images.githubusercontent.com/30178507/99683035-3fa99600-2ac3-11eb-9115-a8bd07f8f4b7.png)

위는 `spring-boot-starter-web`jar이다. 내부에는 실제 코드가 들어있는 jar는 없고 txt 파일 뿐이다.
이 starter의 목적은 라이브러리에 포함되어야하는 필수 의존성을 제공하기 위함이다. 때문에 선택적으로 제공해야하는 의존성은 starter에 포함되어서는 안된다.

# Executable jars

Spring Boot에서는 운영환경에서 실행할 수 있는 jar를 생성할 수 있다. 즉, 독립적으로 실행가능한 jar를 만들 수 있는 것이다.

참고로 Java에서는 중첩된 jar `즉, jar 내부에 있는 jar`를 로드하는 표준 방법을 제공하지 않는다. 따라서 많은 개발자들은 `uber jars`를 사용하였다. `uber jars`는 하나의 archive `아마 jar`에 애플리케이션의 모든 의존성에 해당하는 클래스들을 패키징하는 방법이다. 단, 이 방법은 애플리케이션에 어떤 라이브러리가 들어있는지 보기 어렵다는 단점이 있다.

Spring Boot에서는 직접 중첩된 jar를 접근하는 방법으로 해결한다. [참고](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#executable-jar)

gradle에서는 `spring-boot-gradle-plugin`을 추가하면 Executable jar 패키징이 가능하다.

## jar? war?

jar vs war packaging 참고: [https://www.baeldung.com/java-jar-war-packaging](https://www.baeldung.com/java-jar-war-packaging)

jar는 라이브러리, resources, 메타데이터 파일을 포함하는 패키지 파일 포멧이다. 필수적으로 압축된 `.class` 파일과 컴파일된 자바 라이브러리 리소스, 애플리케이션을 포함한다.

기본적으로 jar는 다음과 같은 구조를 가진다.

```groovy
META-INF/
    MANIFEST.MF
com/
    baeldung/
        MyApplication.class
```

`META-INF/MANIFEST.MF`는 jar에 저장된 메타데이터 정보이다.

반면 war는 Web Application에 대한 패키징에 사용되며 보통 Servlet/JSP 컨테이너에 배포되는데 사용한다. 단독으로 사용을 불가능하다. `컨테이너와 함께 사용되어야함`

기본적으로 war는 다음과 같은 구조를 가진다.

```groovy
META-INF/
    MANIFEST.MF
WEB-INF/
    web.xml
    jsp/
        helloWorld.jsp
    classes/
        static/
        templates/
        application.properties
    lib/
        // *.jar files as libs
```

jar와 마찬가지로 archive의 메타데이터인 `META-INF/MANIFEST.MF`가 있다. 그리고 jar랑은 다르게 `WEB-INF`가 존재한다. 이는 static web resource `html, css, js, image 등 정적파일`를 가지는 public directory이며 Servlet 클래스, 라이브러리 jar, web.xml을 포함한다.

즉, war는 단독으로 실행이 불가능하다. 이런점에서 Spring Boot에서는 단독으로 실행이 가능한 jar를 활용한 기능을 제공하는 것으로 보인다.
