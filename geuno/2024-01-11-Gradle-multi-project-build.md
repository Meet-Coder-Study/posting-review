# Gradle Multi Project Build 구성하기

## 기본 개념

### Plugin
 Plugin은 gradle에서 주요 개념인 Project에서 사용가능한 `task`를 더해줄 수 있는 개념
 - 예를 들어 java 플러그인에는 java를 컴파일하는 `compileJava` task가 포함
 - 또한, jar 파일을 생성해내는 `bootJar` task는 `org.springframework.boot` plugin에 포함되어 있음

### Task
 Task 는 빌드 작업에서 수행되는 독립적인 작업을 가리킴 (e.g compiling classes, creating a JAR, generating Javadoc ...)
```
# Task 등록
tasks.register('hello') {
    doLast {
        println 'Hello world!'
    }
}

# Task configuration(등록된 태스크에 대해 configuration 설정은 아래와 같이 진행)
tasks.named('hello') {
    doFirst {
        println 'Hello Venus'
    }
}
```

## Subproject 구성[^footnote3]
Gradle Multi Project build를 하기 위해서는 root 프로젝트(settings.gradle 파일이 있는 경로)와 그 아래 subproject(e.g. app, lib) 들로 구성되도록 코드 구성을 아래와 같이 변경해야 한다.
각각의 subproject에는 src 폴더와 build.gradle 파일이 존재해야 함
```
Project layout
.
├── app
│   ├── src
│   └── build.gradle
├── shared
│   ├── src
│   └── build.gradle
├── services
│   └── person-service
│       ├── src
│       │   └──...
│       └── build.gradle
└── settings.gradle
```
그 후, root 프로젝트에 subproject들을 등록시켜주기 위해 settings.gradle 파일을 아래와 같이 변경하기

```
rootProject.name = 'dependencies-java' // root 프로젝트의 이름
include 'api', 'shared', 'services:person-service' // 
```

### Subproject들 사이의 의존성 구현
만약 app subproject가 shared subproject를 사용하려 한다면, app 프로젝트의 `build.gradle`에 아래와 같이 dependency를 추가하면 됨
```
dependencies {
    implementation project(':shared')
}
```
### Subproject들 사이에 공통적으로 사용되는 의존성 관리 방법[^footnote2]
모든 subproject에서 사용되는 공통 Configuration(repository, dependencies..)들을 root project의 build.gradle에서 관리할 수 있음 <br>
`allprojects`, `subprojects` 라는 명령어를 통해 구성을 공통적으로 적용이 가능하고, 아래는 내가 사용한 root project의 build.gradle 예시

```
plugins {
    id 'java'
    id 'org.springframework.boot' version '2.7.6'
    id 'io.spring.dependency-management' version '1.0.15.RELEASE'
    id 'checkstyle'
}

allprojects {
    repositories {
        mavenCentral()
    }
}


subprojects {
    sourceCompatibility = '17'

    apply plugin: 'java'
    apply plugin: 'org.springframework.boot'
    apply plugin: 'io.spring.dependency-management'
    apply plugin: 'checkstyle'

    ext {
        springCloudVersion = "2021.0.5"
    }

    checkstyle {
        maxWarnings = 0 // 규칙이 어긋나는 코드가 하나라도 있을 경우 빌드 fail을 내고 싶다면 이 선언을 추가한다.
        configFile = file("${rootDir}/formatter/naver-checkstyle-rules.xml")
        configProperties = ["suppressionFile": "${rootDir}/formatter/naver-checkstyle-suppressions.xml"]
        toolVersion = "10.6.0"  // checkstyle 버전 8.24 이상 선언
    }

    // io.spring.dependency-management plugin 에서 제공하는 기능
    // https://docs.spring.io/dependency-management-plugin/docs/current-SNAPSHOT/reference/html/#introduction
    dependencyManagement {
        imports {
            mavenBom "org.springframework.cloud:spring-cloud-dependencies:${springCloudVersion}"
        }
    }

    dependencies {

    }
}

tasks.named('bootJar') {
    enabled = false
}
```

## TroubleShooting
 Gradle Multi Project Build를 Spring Project에 적용하면서 겪었던 몇가지 문제점이 있었음
1. SpringBootApplication main 함수가 포함된 클래스가 있는 모듈을 제외한 나머지 모듈에서는 bootJar task가 수행되면 아래와 같이 에러가 발생함 
  ```shell
  Execution failed for task ':common:bootJar'.
  > Error while evaluating property 'mainClass' of task ':common:bootJar'.
   > Failed to calculate the value of task ':common:bootJar' property 'mainClass'.
      > Main class name has not been configured and it could not be resolved
  ```
  위 에러를 수정하기 위해서는 common 모듈에서 `bootJar` task를 위의 `build.gradle`에서와 같이 enabled = false로 설정을 해주거나, `springframework plugin`을 apply false로 plugin 적용을 하지 않아야 위 에러가 발생하지 않음
  ```
    plugins {
      id 'org.springframework.boot' version '2.7.6' apply false
    }
  ```
2. 다른 모듈(subproject)에 있는 Component를 어떻게 사용할 것인지?
- (해당 모듈로 의존성이 생기는 방법) 직접 해당 클래스를 import 해서, Configuration에 Bean으로 등록
- (해당 모듈에 의존성 생기지 않고 등록) @ComponentScan 에서 적용된 basePackage의 구조와 같도록 해당 모듈의 패키지 구조를 설계하면, @ComponentScan이 해당 모듈의 component 또한 자동으로 Bean Scanning을 진행해줌 (직접 해보진 못했는데 그렇다고 함.. [^footnote])

  ```java
  @SpringBootApplication(scanBasePackages = "com.example.multimodule")

  // 위와 같이 되어 있을때, BeanScanning을 진행할 모듈의 root 패키지 구조를 
  // com.example.multimodule로 하면 해당 패키지 아래에 있는 Bean들을 자동으로 찾아줌
  ```

## 참고
[^footnote]: [Spring Guide: Creating a Multi Module Project](https://spring.io/guides/gs/multi-module/)
[^footnote2]: [Reflectoring.io: Building a Multi-Module Spring Boot Application with Gradle](https://reflectoring.io/spring-boot-gradle-multi-module/)
[^footnote3]: [Gradle: Creating a Basic Multi-Project Build](https://docs.gradle.org/current/userguide/multi_project_builds.html)

