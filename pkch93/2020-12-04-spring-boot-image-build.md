# Spring Boot Image Build

gradle plugin docs: [https://docs.spring.io/spring-boot/docs/2.4.0/gradle-plugin/reference/htmlsingle/#build-image](https://docs.spring.io/spring-boot/docs/2.4.0/gradle-plugin/reference/htmlsingle/#build-image)

create efficient docker images with spring boot 2.3.0: [https://spring.io/blog/2020/08/14/creating-efficient-docker-images-with-spring-boot-2-](https://spring.io/blog/2020/08/14/creating-efficient-docker-images-with-spring-boot-2-3)3

creating docker images with spring boot 2.3.0: [https://spring.io/blog/2020/01/27/creating-docker-images-with-spring-boot-2-3-0-m1](https://spring.io/blog/2020/01/27/creating-docker-images-with-spring-boot-2-3-0-m1)

Spring Boot Docker Layers를 사용해야하는 이유: [https://springframework.guru/why-you-should-be-using-spring-boot-docker-layers/](https://springframework.guru/why-you-should-be-using-spring-boot-docker-layers/)

> Spring Boot 2.3.0 이상부터 지원하는 Docker 지원에 대한 이야기

# 널리 알려진 Spring Boot 애플리케이션 이미지화

```yaml
.
├── Dockerfile
├── build.gradle
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradle.properties
├── gradlew
├── gradlew.bat
├── settings.gradle
└── src
    ├── main
    │   ├── java
    │   │   └── edu
    │   │       └── pkch
    │   │           └── build
    │   │               ├── EduApplication.java
    │   │               └── controller
    │   │                   └── HelloController.java
    │   └── resources
    └── test
        ├── java
        └── resources
```

위와 같은 구조에 `/hello` 엔드포인트로 hello 문자열을 반환하는 `HelloController`가 존재한다.

```java
@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "hello";
    }
}
```

이런 일련의 Spring Boot 애플리케이션을 `./gradlew build`로 실행가능한 jar를 만든 후에 도커 이미지로 빌드한다.

```docker
FROM openjdk:8-jdk-alpine
EXPOSE 8080
ARG JAR_FILE=build/libs/*.jar
ADD ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

위와 같은 Dockerfile로 `build/libs`에 위치한 Spring Boot 애플리케이션 jar를 도커 이미지로 만든다.
`docker build -t edu-app .`으로 빌드를 하면 다음과 같이 `edu-app` 이미지가 만들어진다.

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8264cd83-97d2-440c-91eb-b284334115be/_2020-12-04__5.32.10.png](https://user-images.githubusercontent.com/30178507/101170170-66e69280-3681-11eb-976e-449c0a2f6d8e.png)

이미지 빌드를 한 후 `docker images` 명령으로 확인해보면 `edu-app` 이미지가 만들어진 것을 확인할 수 있다.

위와 같이 빌드 후에 나타난 jar를 도커 이미지화 하는 것이 일반적으로 Spring Boot 애플리케이션을 도커 이미지/컨테이너화 하기 위한 방법이었다.

단, 위와 같이 이미지를 만들게 되면 두가지 문제가 존재한다.

1. jar unpacking이 불가하다. 위와 같이 jar를 만들게 되면 애플리케이션 코드 뿐만 아니라 각종 의존성이 모두 하나의 jar로 만들어진다. `fat jar` 이 경우 애플리케이션을 구동할 때 다소 오버헤드가 있을 수 있고 이 문제는 컨테이너 환경에서 더욱 두드러진다.

    fat jars 빌드를 하지 말아야하는 이유: [https://product.hubspot.com/blog/the-fault-in-our-jars-why-we-stopped-building-fat-jars](https://product.hubspot.com/blog/the-fault-in-our-jars-why-we-stopped-building-fat-jars)

2. 애플리케이션 업데이트에 비효율적이다. 도커 이미지는 layer들로 만들어지는데 위 예시에서는 애플리케이션 코드와 필요한 의존성들이 하나의 layer에 포함된다. 사용하는 의존성들의 버전보다 애플리케이션 코드를 더 자주 컴파일할 수 있기 때문에 이들을 분리하는 것이 좋다.

이런 문제를 해결하기 위해서 Spring Boot 2.3.0부터 buildpack 지원과 Layered jars 기능을 제공한다.

# bootBuildImage

Spring Boot 2.3.0부터 `spring-boot-gradle-plugin`에 포함된 task이다. `spring-boot-maven-plugin`에도 동일하게 포함된다.
bootBuildImage task는 [Cloud Native Buildpacks](https://buildpacks.io/docs/reference/spec/platform-api/#users) `CNB`를 사용하여 빌드한 jars로 Image를 만들도록 도와준다.

참고로 Cloud Native Buildpacks는 보안적인 이유로 non-root 유저로 이미지를 빌드하고 run한다.
bootBuildImage task는 bootJar의 launch script 설정을 사용하지 않는다.

## Docker Daemon

bootBuildImage는 Docker Daemon에 접근해야한다. 기본적으로 local의 Docker Daemon에 접근한다.

이때 Docker Daemon의 접근 정보를 환경변수나 `gradle-plugin`에서 지원하는 docker properties로 설정이 가능하다.

- `DOCKER_HOST / host`: Docker Daemon의 host와 port `e.g. tcp:192.168.99.100:2376`
- `DOCKER_TLS_VERIFY / tlsVerify`: `1 / true`로 설정한다면 HTTPS 프로토콜을 사용할 수 있다.
- `DOCKER_CERT_PATH / certPath`: HTTPS 통신을 위해 사용할 key file과 certificate의 경로. 단, `DOCKER_TLS_VERIFY / tlsVerify`가 `1 / true`가 아니라면 값을 무시한다.

## Docker Registry

`builder`나 `runImage` properties가 설정된 Docker Image는 private Docker Registry에 저장된다. 이 private Docker Registry는 인증이 필요한데 bootBuildImage에서 인증정보는 `docker.builderRegistry` properties로 제공할 수 있다.

또한 public Docker Registry `ex. dockerHub` 에 생성한 이미지를 올릴때에도 인증정보가 필요하다. 이때는 `docker.publishRegistry`로 설정한다.

`docker.builderRegistry`와 `docker.publishRegistry` 인증 정보는 user 정보나 token 정보가 된다.

### docker.builderRegistry

- username
- password
- url
- email
- token

## Image Customizations

`gradle-plugin`에서는 이미지 생성을 제어 `orchestrate` 하기 위해서 [builder](https://buildpacks.io/docs/concepts/components/builder/)를 사용할 수 있다. builder는 여러 buildpack들을 포함할 수 있다. 생성된 이미지의 이름은 기본적으로 project properties에서 가져온다.

### properties

- builder: 이미지 빌드에 사용할 builder의 이름. 기본적으로 `paketobuildpacks/builder:base` 사용
- runImage: 이미지를 컨테이너에 띄울때 사용할 이름. 기본값은 따로 없음.
- imageName: 생성된 이미지의 이름. 기본적으로 `[docker.io/library/${project.name}:${project.version}](http://docker.io/library/${project.name}:${project.version})` 사용
- pullPolicy: registry에서 실행할 이미지나 builder를 가져올 때 사용할 정책. 정책에는 `ALWAYS`, `NEVER`, `IF_NOT_PRESENT`가 있으며 기본값은 `ALWAYS`이다.
- environment: 빌더에 전달할 환경변수
- cleanCache: 빌드전에 캐시를 제거할지 말지 설정하는 properties. 기본적으로 `false`
- verboseLogging: builder의 상세 로깅을 활성화할지 설정하는 properties. 기본적으로 `false`
- publish: Docker Registry에 이미지를 올릴지 말지 설정하는 properties. 기본적으로 `false`

# Layered jars

> 참고로 Spring Boot 2.4.0부터는 기본적으로 layering을 한다.

만약 buildpack을 사용하지 않고 이미지를 만들고 싶은 경우가 있다. 이런 경우를 위해서 Spring Boot에서는 `layered jars` 기능을 제공한다.

`layered jars`가 아닌 `fat jars`로 만든 경우 다음과 같은 구조로 만들어진다.

```
META-INF/
  MANIFEST.MF
org/
  springframework/
    boot/
      loader/
        ...
BOOT-INF/
  classes/
    ...
  lib/
    ...
```

1. jar를 로딩하기 위해 사용되는 클래스 `org.springframework.boot/loader`
2. 애플리케이션의 클래스 `BOOT-INF/classes`
3. 애플리케이션이 의존하고 있는 클래스 `BOOT-INF/lib`

이 3가지 주요 구조를 가진다. 이런 jar 포멧을 Spring Boot만이 가지고 있다. 이런 `fat jars`를 각 layer에 맞춰 나눠서 다음과 같이 빌드가 가능하다.

```
META-INF/
  MANIFEST.MF
org/
  springframework/
    boot/
      loader/
        ...
BOOT-INF/
  layers/
    <name>/
      classes/
        ...
      lib/
        ...
    <name>/
      classes/
        ...
      lib/
        ...
  layers.idx
```

크게 달라지는 부분이 `BOOT-INF/layers`와 `layers.idx`이다.
이전에는 하나의 classes와 lib가 있었다면, `layered jars`에서는 layer 별로 `classes`와 `lib`를 가진다.

기본적으로 다음 layer들을 만들어준다.

1. `dependencies`: release dependencies 대상 `버전에 SNAPSHOT이 들어있지 않은 의존성`
2. `snapshot-dependencies`: snapshot dependencies 대상 `버전에 SNAPSHOT이 들어있는 의존성`
3. `spring-boot-loader`: jar loader 클래스
4. `application`: application classes 및 resources 대상

이렇게 분리한 이유는 library 코드의 경우는 거의 변하지 않는다. 때문에 캐시로 재사용할 수 있도록 자체 layers에 위치한다. `아마 dependencies와 snapshot-dependencies`
반면 애플리케이션 코드는 자주 변화하기 때문에 별도의 layer로 분리가 된다.

jar의 layer들을 추출하고 싶다면 `jarmode`를 사용할 수 있다.

`java -Djarmode=layertools -jar {jarpath} list`와 같이 명령하면 해당 jar의 layer를 알려준다.

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6f9e5b4a-800f-4b41-afae-93376225f165/_2020-12-04__9.02.14.png](https://user-images.githubusercontent.com/30178507/101170174-677f2900-3681-11eb-88be-d569b707fbd4.png)

위와 같이 `dependencies`, `spring-boot-loader`, `snapshot-dependencies`, `application`이 있는 것을 볼 수 있다.

`list`이외에 `extract`로 image 생성에 필요한 layer를 뽑아올 수 있다.
`java -Djarmode=layertools -jar {jarpath} extract` 명령을 사용하니 사용한 폴더에 각 layer들이 생성됨을 볼 수 있다.

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/270507f9-6c99-4f67-b90d-02a05ca572bc/_2020-12-04__9.09.53.png](https://user-images.githubusercontent.com/30178507/101170175-68b05600-3681-11eb-9eab-ad52e87f642f.png)

- 참고: `build.gradle`

    ```groovy
    plugins {
        id 'java'
        id 'org.springframework.boot' version "${springBootVersion}"
        id "io.spring.dependency-management" version "${springDependenciesVersion}"
    }

    group 'edu.pkch'
    version '1.0.0.SpringDockerBuild'

    repositories {
        mavenCentral()
    }

    dependencies {
        implementation 'org.springframework.boot:spring-boot-starter-web'
        testImplementation 'org.springframework.boot:spring-boot-starter-test'
    }

    test {
        useJUnitPlatform()
    }
    ```

- `dependencies`

    ```
    .
    └── BOOT-INF
        └── lib
            ├── jackson-annotations-2.11.3.jar
            ├── jackson-core-2.11.3.jar
            ├── jackson-databind-2.11.3.jar
            ├── jackson-datatype-jdk8-2.11.3.jar
            ├── jackson-datatype-jsr310-2.11.3.jar
            ├── jackson-module-parameter-names-2.11.3.jar
            ├── jakarta.annotation-api-1.3.5.jar
            ├── jakarta.el-3.0.3.jar
            ├── jul-to-slf4j-1.7.30.jar
            ├── log4j-api-2.13.3.jar
            ├── log4j-to-slf4j-2.13.3.jar
            ├── logback-classic-1.2.3.jar
            ├── logback-core-1.2.3.jar
            ├── slf4j-api-1.7.30.jar
            ├── snakeyaml-1.27.jar
            ├── spring-aop-5.3.1.jar
            ├── spring-beans-5.3.1.jar
            ├── spring-boot-2.4.0.jar
            ├── spring-boot-autoconfigure-2.4.0.jar
            ├── spring-boot-jarmode-layertools-2.4.0.jar
            ├── spring-context-5.3.1.jar
            ├── spring-core-5.3.1.jar
            ├── spring-expression-5.3.1.jar
            ├── spring-jcl-5.3.1.jar
            ├── spring-web-5.3.1.jar
            ├── spring-webmvc-5.3.1.jar
            ├── tomcat-embed-core-9.0.39.jar
            └── tomcat-embed-websocket-9.0.39.jar
    ```

    위와 같이 application에서 사용하는 의존성 코드 `jar`들이 담겨있다.

- `snapshot-dependencies`

    snapshot 의존성이 없으므로 비어있다.

- `spring-boot-loader`

    ```groovy
    .
    └── org
        └── springframework
            └── boot
                └── loader
                    ├── archive
                    ├── data
                    ├── jar
                    ├── jarmode
                    └── util
    ```

    다음과 같이 spring boot jar를 실행시키는 클래스들이 포함되어있다.

- `application`

    ```groovy
    .
    ├── BOOT-INF
    │   ├── classes
    │   │   └── edu
    │   │       └── pkch
    │   │           └── build
    │   │               ├── EduApplication.class
    │   │               └── controller
    │   │                   └── HelloController.class
    │   ├── classpath.idx
    │   └── layers.idx
    └── META-INF
        └── MANIFEST.MF
    ```

    작성한 `EduApplication`과 `HelloController` 클래스가 있는 것을 볼 수 있다. 여기에 `classpath.idx`와 `layers.idx`가 존재한다.

    ```
    // classpath.idx
    - "spring-webmvc-5.3.1.jar"
    - "spring-web-5.3.1.jar"
    - "spring-boot-autoconfigure-2.4.0.jar"
    - "spring-boot-2.4.0.jar"
    - "jakarta.annotation-api-1.3.5.jar"
    - "spring-context-5.3.1.jar"
    - "spring-aop-5.3.1.jar"
    - "spring-beans-5.3.1.jar"
    - "spring-expression-5.3.1.jar"
    - "spring-core-5.3.1.jar"
    - "snakeyaml-1.27.jar"
    - "jackson-datatype-jdk8-2.11.3.jar"
    - "jackson-datatype-jsr310-2.11.3.jar"
    - "jackson-module-parameter-names-2.11.3.jar"
    - "jackson-databind-2.11.3.jar"
    - "tomcat-embed-websocket-9.0.39.jar"
    - "tomcat-embed-core-9.0.39.jar"
    - "jakarta.el-3.0.3.jar"
    - "logback-classic-1.2.3.jar"
    - "log4j-to-slf4j-2.13.3.jar"
    - "jul-to-slf4j-1.7.30.jar"
    - "spring-jcl-5.3.1.jar"
    - "jackson-annotations-2.11.3.jar"
    - "jackson-core-2.11.3.jar"
    - "logback-core-1.2.3.jar"
    - "slf4j-api-1.7.30.jar"
    - "log4j-api-2.13.3.jar"
    ```

    위 `classpath.idx`는 application jar가 위 jar를 classpath에 포함해야한다는 것을 알려준다.

    ```
    // layers.idx
    - "dependencies":
      - "BOOT-INF/lib/"
    - "spring-boot-loader":
      - "org/"
    - "snapshot-dependencies":
    - "application":
      - "BOOT-INF/classes/"
      - "BOOT-INF/classpath.idx"
      - "BOOT-INF/layers.idx"
      - "META-INF/"
    ```

    참고로 layer의 순서는 애플리케이션 코드가 변경되었을때 이전 layer가 캐시될 가능성을 결정하기 때문에 중요하다. 위 layer 순서로 Docker/OCI Image에 추가된다. `아마 buildpack으로 이미지를 만들때가 아닌가 싶음`

## Layered Jars Configuration

Spring Boot 2.4.0부터는 기본적으로 `bootJar` task가 layered jars를 만들어준다. 만약 `layered jars`가 아닌 기존의 `fat jars`로 만들고 싶다면 다음과 같이 설정할 수 있다.

```groovy
bootJar {
	layered {
		enabled = false
	}
}
```

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/9410788d-7565-44e5-968b-d51de1a528c9/_2020-12-04__9.56.44.png](https://user-images.githubusercontent.com/30178507/101170295-9a292180-3681-11eb-84c4-e46345a210f9.png)

만약 위와 같이 layered를 false로 설정하고 `-Djarmode=layertools`로 실행을 하면 `Unsupported jarmode 'layertools'` 문구가 나타난다. 즉, `layered jar`로 생성되지 않았기 때문이다.

`layered jar` 모드에서는 `spring-boot-jarmode-layertools`가 의존성에 추가된다. 만약 `spring-boot-jarmode-layertools`가 의존성에 포함되는 것이 원치않다면 다음과 같이 `includeLayerTools`를 false로 설정할 수 있다.

```groovy
bootJar {
	layered {
		includeLayerTools = false
	}
}
```

## Custom Layered jars

기존에 `dependencies`, `spring-boot-loader`, `snapshot-dependencies`, `application` 이외에 커스텀한 layer를 만들고 싶을 수 있다. `spring-boot-gradle-plugin`에서는 다음과 같이 커스텀 설정을 할 수 있다.

```groovy
bootJar {
	layered {
		application {
			intoLayer("spring-boot-loader") {
				include "org/springframework/boot/loader/**"
			}
			intoLayer("application")
		}
		dependencies {
			intoLayer("application") {
				includeProjectDependencies()
			}
			intoLayer("snapshot-dependencies") {
				include "*:*:*SNAPSHOT"
			}
			intoLayer("dependencies")
		}
		layerOrder = ["dependencies", "spring-boot-loader", "snapshot-dependencies", "application"]
	}
}
```

`layered` DSL은 다음 3가지 부분으로 정의된다.

1. application: application classes와 resources가 어떻게 layered될지를 정의
2. dependencies: dependencies가 어떻게 layered될지를 정의
3. layerOrder: 정의된 layer들이 어떤 우선순위를 갖는지 정의. 앞에 올수록 우선순위가 높다.

거기에 `intoLayer` closure가 있는데 각 layer에 어떤 내용들이 있을지를 정의할 수 있다. 이때 `intoLayer`는 위에서 아래로 정의된 순서로 읽으며 이전 layer에서 포함되지 않은 부분은 후순위의 `intoLayer`에서 사용한다.

`intoLayer`는 include와 exclude를 지원하며 위와같이 `org/springframework/boot/loader/**`로 Ant-style의 패턴 매칭과 `group:artifact[:version` 패턴 매칭도 지원한다.

만약 include가 없다면 이전 `intoLayer`에서 언급되지 않은 모든 부분을 포함하고 반대로 exclude가 없다면 아무것도 제외하지 않는다.

추가로 `includeProjectDependencies`와 `excludeProjectDependencies`를 제공하는데 각각 프로젝트의 의존성을 추가할 때나 제외할 때 사용한다.

### Example

```groovy
bootJar {
    layered {
        application {
            intoLayer("edu-1")
        }
        dependencies {
            intoLayer("snapshot-dependencies") {
                include "*:*:*SNAPSHOT"
            }
            intoLayer("dependencies")
        }
        layerOrder = ["dependencies", "snapshot-dependencies", "edu-1"]
    }
}
```

만약 위와같이 `layered` DSL 설정을 했을때 다음과 같이 layered jars가 만들어진다.

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8766c61e-d277-4255-88b8-8da7615f4cfe/_2020-12-04__10.27.33.png](https://user-images.githubusercontent.com/30178507/101170177-69e18300-3681-11eb-96a1-7da884eb88c5.png)

즉, `intoLayer`로 정의한 `edu-1`과 `snapshot-dependencies`, `edu-1` 3개의 layer가 생성됨을 확인할 수 있다.

```
.
├── BOOT-INF
│   ├── classes
│   │   └── edu
│   │       └── pkch
│   │           └── build
│   │               ├── EduApplication.class
│   │               └── controller
│   │                   └── HelloController.class
│   ├── classpath.idx
│   └── layers.idx
├── META-INF
│   └── MANIFEST.MF
└── org
    └── springframework
        └── boot
            └── loader
                ├── ClassPathIndexFile.class
                ├── ExecutableArchiveLauncher.class
                ├── JarLauncher.class
                ├── LaunchedURLClassLoader$DefinePackageCallType.class
                ├── LaunchedURLClassLoader$UseFastConnectionExceptionsEnumeration.class
                ├── LaunchedURLClassLoader.class
                ├── Launcher.class
                ├── MainMethodRunner.class
                ├── PropertiesLauncher$1.class
                ├── PropertiesLauncher$ArchiveEntryFilter.class
                ├── PropertiesLauncher$ClassPathArchives.class
                ├── PropertiesLauncher$PrefixMatchingArchiveFilter.class
                ├── PropertiesLauncher.class
                ├── WarLauncher.class
                ├── archive
                │   ├── Archive$Entry.class
                │   ├── Archive$EntryFilter.class
                │   ├── Archive.class
                │   ├── ExplodedArchive$AbstractIterator.class
                │   ├── ExplodedArchive$ArchiveIterator.class
                │   ├── ExplodedArchive$EntryIterator.class
                │   ├── ExplodedArchive$FileEntry.class
                │   ├── ExplodedArchive$SimpleJarFileArchive.class
                │   ├── ExplodedArchive.class
                │   ├── JarFileArchive$AbstractIterator.class
                │   ├── JarFileArchive$EntryIterator.class
                │   ├── JarFileArchive$JarFileEntry.class
                │   ├── JarFileArchive$NestedArchiveIterator.class
                │   └── JarFileArchive.class
                ├── data
                │   ├── RandomAccessData.class
                │   ├── RandomAccessDataFile$1.class
                │   ├── RandomAccessDataFile$DataInputStream.class
                │   ├── RandomAccessDataFile$FileAccess.class
                │   └── RandomAccessDataFile.class
                ├── jar
                │   ├── AbstractJarFile$JarFileType.class
                │   ├── AbstractJarFile.class
                │   ├── AsciiBytes.class
                │   ├── Bytes.class
                │   ├── CentralDirectoryEndRecord$1.class
                │   ├── CentralDirectoryEndRecord$Zip64End.class
                │   ├── CentralDirectoryEndRecord$Zip64Locator.class
                │   ├── CentralDirectoryEndRecord.class
                │   ├── CentralDirectoryFileHeader.class
                │   ├── CentralDirectoryParser.class
                │   ├── CentralDirectoryVisitor.class
                │   ├── FileHeader.class
                │   ├── Handler.class
                │   ├── JarEntry.class
                │   ├── JarEntryCertification.class
                │   ├── JarEntryFilter.class
                │   ├── JarFile$1.class
                │   ├── JarFile$JarEntryEnumeration.class
                │   ├── JarFile.class
                │   ├── JarFileEntries$1.class
                │   ├── JarFileEntries$EntryIterator.class
                │   ├── JarFileEntries.class
                │   ├── JarFileWrapper.class
                │   ├── JarURLConnection$1.class
                │   ├── JarURLConnection$JarEntryName.class
                │   ├── JarURLConnection.class
                │   ├── StringSequence.class
                │   └── ZipInflaterInputStream.class
                ├── jarmode
                │   ├── JarMode.class
                │   ├── JarModeLauncher.class
                │   └── TestJarMode.class
                └── util
                    └── SystemPropertyUtils.class
```

위는 `edu-1` layer이다. application에 정의한 `edu-1`에 애플리케이션 classes와 `spring-boot-loader` 클래스들이 있는 것을 볼때 application closure에서 애플리케이션 코드와 spring-boot-loader에 대한 layer를 담당하는 것으로 보인다.

```
.
└── BOOT-INF
    └── lib
        ├── jackson-annotations-2.11.3.jar
        ├── jackson-core-2.11.3.jar
        ├── jackson-databind-2.11.3.jar
        ├── jackson-datatype-jdk8-2.11.3.jar
        ├── jackson-datatype-jsr310-2.11.3.jar
        ├── jackson-module-parameter-names-2.11.3.jar
        ├── jakarta.annotation-api-1.3.5.jar
        ├── jakarta.el-3.0.3.jar
        ├── jul-to-slf4j-1.7.30.jar
        ├── log4j-api-2.13.3.jar
        ├── log4j-to-slf4j-2.13.3.jar
        ├── logback-classic-1.2.3.jar
        ├── logback-core-1.2.3.jar
        ├── slf4j-api-1.7.30.jar
        ├── snakeyaml-1.27.jar
        ├── spring-aop-5.3.1.jar
        ├── spring-beans-5.3.1.jar
        ├── spring-boot-2.4.0.jar
        ├── spring-boot-autoconfigure-2.4.0.jar
        ├── spring-boot-jarmode-layertools-2.4.0.jar
        ├── spring-context-5.3.1.jar
        ├── spring-core-5.3.1.jar
        ├── spring-expression-5.3.1.jar
        ├── spring-jcl-5.3.1.jar
        ├── spring-web-5.3.1.jar
        ├── spring-webmvc-5.3.1.jar
        ├── tomcat-embed-core-9.0.39.jar
        └── tomcat-embed-websocket-9.0.39.jar
```

반면 dependencies에서는 `build.gradle`에 정의된 dependencies의 jar를 어떻게 layer할지를 결정하는 것으로 보인다.