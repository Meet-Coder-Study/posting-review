## Javaagnet에 대한 학습



### Javaagent란?

우선 [JDK 17](https://docs.oracle.com/en/java/javase/17/docs/api/java.instrument/java/lang/instrument/package-summary.html) 문서를 읽어보기로 했다.

`Javaagent`는 `JVM`에서 실행되는 프로그램을 계측할 수 있도록 하는 서비스를 제공한다. 
이러한 서비스는 만들어진 도구는 모니터링 에이전트, 프로파일러, 커버리지 분석기, 이벤트 로거 등이 존재한다.

`Instrumentation` 인터페이스를 보면 다음과 같은 설명이 있다.

> This class provides services needed to instrument Java programming language code. 
> Instrumentation is the addition of byte-codes to methods for the purpose of gathering data to be utilized by tools. 
> Since the changes are purely additive, these tools do not modify application state or behavior

요약하자면 코드를 계측하는 데 필요한 서비스를 제공하며 데이터를 수집할 목적으로 메서드에 바이트 코드를 추가해 원하는 데이터를 계측하는 일을 말한다.
그리고 계측하는 동안 애플리케이션 상태나 동작을 수정하지 않으니 걱정하지 않아도 된다.
그러나 에이전트로 인해 클래스 또는 모듈이 변환되는 상황이 생기니 에이전트의 신뢰성을 확인할 책임이 존재한다.

### Javaagent의 사용

Javaagent는 크게 정적 계측과 동적 계측으로 나뉜다.

- 정적 계측
  - 명령과 동시에 로드될 agent jar 파일 지정하는 방법
  - agent jar 파일을 패키지 내부에 도포하는 방법
- 동적 계측
  - 클래스 로딩 시점에 계측하는 방법

각 계측에 맞게 필요한 메서드가 존재한다.
원하는 방법으로 agent를 연결했다면 아래에 맞는 메서드 구현이 필수다.

정적 계측을 위해서 `premain` 메서드를 구현해야 한다.

```java
public static void premain(String agentArgs, Instrumentation inst) {
  //...
}
```

동적 계측을 위해서 `agentmain` 메서드를 구현해야 한다.

```java
public static void agentmain(String agentArgs, Instrumentation inst) {
  //...
}
```

주의할 점은 manifest 설정이 필요하다는 점이다. 무턱대고 구현하고 붙인다고 실행되지 않는다.

[manifest customizing 문서](https://maven.apache.org/plugins/maven-jar-plugin/examples/manifest-customization.html)를 보면 쉽게 설정할 수 있다.
그런데 pom.xml 사용하는 곳을 보기 어렵다. 그래서 `gradle`로 설정했다.

> Premain-Class
> 
>> When an agent is specified at JVM launch time this attribute specifies the agent class. That is, the class containing the premain method. When an agent is specified at JVM launch time this attribute is required. If the attribute is not present the JVM will abort. Note: this is a class name, not a file name or path.

즉, `premain` 메서드가 있는 클래스를 지정한다고 보면 된다. `다음은 build.gradle.kts`이다.

```kotlin

...

tasks.jar {
  manifest {
    attributes(
      mapOf(
        "Premain-Class" to "tis.Hello",
        "Can-Redefine-Classes" to false,
        "Can-Retransform-Classes" to false,
        "Can-Set-Native-Method-Prefix" to false
      )
    )
  }
}
```

자세한 내용은 아래에 내포했다.

> Premain-Class
>> `premain` 메서드가 있는 클래스를 지정한다. 속성이 없으면 JVM이 중단된다.
>
> Agent-Class
>> 구현이 VM이 시작된 후 에이전트를 시작하는 메커니즘을 지원하는 경우 에이전트를 지정한다. 이 속성이 없으면 에이전트가 시작되지 않는다.
>
> Launcher-Agent-Class
>> JAR로 시작하는 메커니즘을 지원하는 경우 기본 매니페스트에는 main이 호출되기 전 에이전트의 클래스 이름을 지정하기 위해 이 속성이 포함될 수 있다.
>
> Boot-Class-Path
>> 부트스트랩 클래스 로더가 검색할 경로 목록이다. 경로는 디렉터리나 라이브러리(많은 플랫폼에서 일반적으로 JAR 또는 zip 라이브러리라고 함)를 나타낸다. 이 속성은 선택 사항이며 기본값은 없다.
>
> Can-Redefine-Classes
>> 에이전트에 필요한 클래스를 재정의하는 기능이다. 이 속성은 선택 사항이며 기본값은 false이다.
>
> Can-Retransform-Classes
>> 에이전트에 필요한 클래스를 변환하는 기능입니다. 이 속성은 선택 사항이며 기본값은 false이다.
>
> Can-Set-Native-Method-Prefix
>> 에이전트에 필요한 기본 메서드 접두사를 설정하는 기능이다. 이 속성은 선택 사항이며 기본값은 false이다.


사용 방법을 간단하게 요약하자면

1. 원하는 agent를 구현한다.
2. manifest에 속성을 추가한다.
3. 사용하려는 애플리케이션에 추가한다.
4. 애플리케이션을 실행한다.

### 마지막으로

테스트하면서 발생한 시행착오도 있었다. 
정말 간단하게 hello 만 찍어보자 했지만 두 번이나 출력되는 상황이 발생했다.

```java
public static void premain(String agentArgs, Instrumentation inst) {
    System.out.println("hello!!");
}
```

유추했을 때는 클래스 로더에 읽으면서 한 번, 그리고 재정의 할 때 한 번으로 확인 된다. 
아직 학습하고 있는 상황이라 어림 짐작만 할 수 있었는데 어떻게 하면 확인 할 수 있을지 고민해봐야겠다.


javaagent 학습할 수 있는 방법은 다양하다. 블로그 글도 설정 잘 되어 있고 공식 문서도 잘 되어 있다.
거기다 [강의](https://www.inflearn.com/course/the-java-code-manipulation) 도 존재한다.
아직 보진 못했지만 나중에 봐야겠다.

### 참고자료

- [Baeldung java-instrumentation](https://www.baeldung.com/java-instrumentation)
- [JDK 17 instrument](https://docs.oracle.com/en/java/javase/17/docs/api/java.instrument/java/lang/instrument/package-summary.html)
- [JDK 17 instrumentation](https://docs.oracle.com/en/java/javase/17/docs/api/java.instrument/java/lang/instrument/Instrumentation.html)
