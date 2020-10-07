# 정적분석도구 SonarQube

## 정적분석도구란?

- 정적분석이란 프로그램의 실행 없이 코드를 분석하는 것 입니다.
- 비용이 추가로 들지 않으면서 코드의 품질을 검토하고, 잘못된 부분을 옳은 방향으로 고칠 수 있도록 도와주는 다양한 도구들을 말한다.

- 개발자의 역량 향상과 미래의 장애 발생 확률을 줄이는 역할을 한다.
- 잘 알고 있는 JavaScript의 ESLint나 Prettier도 정적분석도구로 불린다.
- 또한 테스트 커버리지를 확인할 수 있는 Jacoco도 정적분석도구라 불린다.

## SonarQube란?

![sonarqube-apply-java-1](https://github.com/ksy90101/TIL/blob/master/infra/image/sonarqube-apply-java-1.png?raw=true)

- 코드를 분석하여 중복, 테스트 커버리지, 코드 복잡도, 버그, 보안 취약성 등을 리포팅 해주며 IDE, 빌드도구, CI 도구와 통합하여 사용해 분석할 수 있다.
- 위와 사진처럼 여러가지의 도구를 이용해 코드 품질을 확인할 수 잇다.

## SonarQube Architecture

![sonarqube-apply-java-2](https://github.com/ksy90101/TIL/blob/master/infra/image/sonarqube-apply-java-2.png?raw=true)

- SonarQube Serve
    - 3가지 메인 프로세스 구동
    - Web Server: 분석 결과, 설정 페이지 제공
    - Serach Server: ElasticSearch 서버, 검색 기능 제공
    - Compute Engine Server: 정적 분석 결과 생성하여 DB에 저장
- SonarQube Databse
    - 기본 설정들과 프로젝트 분석 스냅샷들을 저장
    - 설치 시 기본으로 H2 DB 사용
    - 설정을 통해 다양한 DB 사용가능
- SonarQube Plugin
    - 내부에서 사용하는 다양한 기능을 플러그인 형태로 설치 가능
- SonarQube Scanner
    - 프로젝트 정적 분석을 수행하는 툴로 다양한 형식으로 제공
    - CI와 연계해서 사용 가능

## SonarQube Integration

![sonarqube-apply-java-3](https://github.com/ksy90101/TIL/blob/master/infra/image/sonarqube-apply-java-3.png?raw=true)

- 코드 작성 후 Sonar Lint 등을 통해 코드 분석 실행
- 개발자는 분석을 통해 수정된 완성 코드를 SCM으로 Push
- CI 서버에서 트리거 된 빌드 수행 시 SonarQube Scanner를 실행
- SonarQube Scanner는 생성한 분석 리포트 처리를 위해 SonarQube로 전송
- SonarQube Server는 분석 리포트 결과를 처리하여 DB에 저장 후 웹 서버를 통해 제공
- 개발자는 분석 결과를 통해 코드 수정
- 관리자는 결과 보고서를 받음

## Docker를 이용해 SonarQube 설치하기

```text
docker container run -d -p 9000:9000 -p 9092:9092 --name sonarqube sonarqube
```

- 9000 포트는 SonarQube, 9092는 SonarQube 내부의 H2이다. 초기 아이디와 비밀번호는 admin/admin이다.
- 제가 이걸 적용하는 단계에서는 EC2-Ubuntu 환경을 이용했습니다. 그러나 보안 그룹에서 9000 Port가 오픈되어 있지 않아 소나큐브에 접속할 수 가 없었습니다.
- 소나큐브의 Port를 변경하는 작업을 먼저 진행했습니다.
- docker container bash로 접속

```text
sudo docker exec -it [container-id || container-name] /bin/bash
```

- 도커 컨테이너에 들어간 후에 `/config/sonar.properties` 파일에 들어갑니다.
- 포트를 변경하는 곳은 아래와 같은 곳입니다. (맨 처음 주석처리가 되어 있습니다. 주석을 해제해주는 것이 중요합니다!)
- 찾기 힘들다면 `/web.port`를 실행하면 해당 라인으로 이동합니다.

![sonarqube-apply-java-4](https://github.com/ksy90101/TIL/blob/master/infra/image/sonarqube-apply-java-4.png?raw=true)

- 사진과 같이 원하는 포트로 변경해주시면 됩니다.
- `IP:port`로 접속하면 아래와 같은 소나큐브 사이트가 나오게 됩니다.
- 기본적으로 admin / admin 으로 접속이 가능합니다.

![sonarqube-apply-java-5](https://github.com/ksy90101/TIL/blob/master/infra/image/sonarqube-apply-java-5.png?raw=true)

## SonarQube + Gradle + Jacoco

- Gradle을 이용해 SonarQube의 리포트를 만들어 보겠습니다.

```groovy
buildscript {
    dependencies {
        classpath "org.sonarsource.scanner.gradle:sonarqube-gradle-plugin:3.0"
    }
}
subprojects {
    apply plugin: "org.sonarqube"
    sonarqube {
        properties {
            property "sonar.host.url", {snoarqubeServer}
            property "sonar.sources", "src"
            property "sonar.language", "java"
            property "sonar.projectVersion", "1.1.0-SNAPSHOT"
            property "sonar.sourceEncoding", "UTF-8"
            property "sonar.coverage.jacoco.xmlReportPaths", "${buildDir}/reports/jacoco/test/jacocoTestReport.xml"
            property "sonar.test.inclusions", "**/*Test.java"
        }
    }
}
```

- 현재 테스트 환경은 멀티 모듈방식입니다. 따라서 gradle이 조금 다를수 있습니다.
- 중요한건 plugin을 추가하고, 각 값들을 넣어주는 것 입니다.
- 또한 `sonar.coverage.jacoco.xmlReportPaths` 이 속성을 이용해 jacoco랑 연동해 결과를 확인할 수 있습니다.

## 진행 사항 이슈

### java.lang.OutOfMemoryError: Metaspace

- 원인: 자바 클래스 메타데이터(자바 클래스에 대한 VM 내부표현)는 원시 메모리(== 메타공간)에 할당된다. 클래스 메타데이터가 할당될 메타공간이 모두 소모되면() `java.lang.OutOfMemoryError: Metaspace`가 발생한다. 클래스 메타데이터가 할당될 공간은 `MaxMetaSpaceSize` 매개변수로 제한된다.
- 조치: `MaxMetaSpaceSize` 값을 늘려 설정한다. `MaxMetaSpaceSize`는 자바 힙과 동일한 주소 공간에 할당된다. 자바 힙의 크기를 줄이면 더 많은 공간을 확보할 수 있다. 자바 힙 공간에 여유가 있는 경우에 고려해볼 수 있다.

### **Java 8 의 Metaspace 영역**

- 기존의 PermGen 영역에는 Class/Method의 Meta정보, Static Object, 상수화된 String Object, Class와 관련된 배열 객체 Meta 정보, JVM 내부적인 객체들과 최적화컴파일러(JIT)의 최적화 정보 등이 저장되었다.
- 그 중 **Static Object** 를 저장하는 경우 객체의 모든 부분이 PermGen에 저장되기 때문에 개발자의 실수로 OOM이 발생하는 경우가 많았다.
- 때문에, Java 8에서 Metaspace가 도입되면서 Static Object 및 상수화된 String Object를 heap 영역으로 옮김으로써, 최대한 GC가 될 수 있도록 하였다.

> 튜닝 옵션-XX:MetaspaceSize : JVM이 사용하는 네이티브 메모리 -XX:MaxMetaspaceSize : metaspace의 최대 메모리

### 원인

- Gradle은 Gradle Daemon을 사용하여 빌드의 성능을 향상시키 위해 데이터를 메모리에 캐싱합니다.
- 이러한 캐싱때문에 Memory가 오버가 된것 입니다
- 그래서 Stop을 이용해 Daemon을 정지시키는 작업을 진행함으로써 해결했습니다.

### 결과

- 결론 Build를 진행하는 중에 Sonarqube까지 하는 것은 Memory 문제가 발생합니다.
- 따라서 Task를 각자 따로 가져가는 방식으로 사용하도록 했습니다.

```text
./gradlew clean build
./gradlew :module1:sonarqube
./gradlew --stop
./gradlew :module2:sonarqube
./gradlew --stop
```

- 이런식으로 소나큐브 Task를 따로 실행 하고 그 후 Daemon을 정지시키는 방식으로 캐싱 전략을 제거했습니다.

## 결과 화면

![sonarqube-apply-java-6](https://github.com/ksy90101/TIL/blob/master/infra/image/sonarqube-apply-java-6.png?raw=true)

- 화면과 같이 버그와 코드 스멜, 테스트 커버리지 등 많은 걸 확인할 수 있습니다.
- 이런걸 통해 더욱더 깔끔하고 성능을 향상시킬 수 있는 애플리케이션을 만들수 있다고 생각합니다.

## 결론

- 더욱더 좋은 애플리케이션을 만들기 위해서는 소나큐브는 필수라고 생각합니다.
- Memory Issue 같은 경우에는 아직 임시 방편입니다. 좀더 좋은 방법이 있으면 나중에 다시 글을 써보도록 하겠습니다.
- Github + Jenkins + Sonarqube를 결합하여 더욱더 좋은 방법으로 사용도 가능합니다. 이 부분도 다음에 글을 써보도록 하겠습니다.

## 참고자료

[소스 정적 분석도구 SonarQube 리서칭](https://joypinkgom.tistory.com/20)

[[java] 자바 메모리누수(with 힙덤프) 분석하기](http://honeymon.io/tech/2019/05/30/java-memory-leak-analysis.html)

[Java Memory 간단히 살펴보기](https://mirinae312.github.io/develop/2018/06/04/jvm_memory.html)
