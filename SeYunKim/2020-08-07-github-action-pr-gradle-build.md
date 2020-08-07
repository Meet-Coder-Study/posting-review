# Github Action을 이용해 Push, PR 시 Gradle Build Test를 진행해보자.

> [예제코드](https://github.com/ksy90101/TIL-ex/blob/master/.github/workflows/gradle.yml)

## Github Action이란?

- 소프트웨어 WorkFlow를 자동화 할 수 있도록 도와준다.
- WorkFlow의 대표적인 예
    - Test Code, 배포, 자동화 스크립트, 다양한 버전에서 실행되는지 확인 등...

## Github Action을 이용해서 Build 진행 방법

![github-action-1](https://github.com/ksy90101/TIL/blob/master/infra/image/github-action-1.png?raw=true)

- 위에서 Action 탭을 클릭한다.

![github-action-2](https://github.com/ksy90101/TIL/blob/master/infra/image/github-action-2.png?raw=true)

- 위와 같이 기본 설정 WorkFlow가 존재한다.
- Set up this workflow를 클릭한다.

```text
# This workflow will build a Java project with Gradle
# For more information see: https://help.github.com/actions/language-and-framework-guides/building-and-testing-java-with-gradle

name: Java CI with Gradle

on:
  push:
    branches: master
  pull_request:
    branches: mastert

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 1.8
      uses: actions/setup-java@v1
      with:
        java-version: 1.8
    - name: Grant execute permission for gradlew
      run: chmod +x gradlew
    - name: Build with Gradle
      run: ./gradlew build
```

- 하나씩 살펴보도록 하겠습니다.

## on - push & pull_request - branch

- 단어에서도 보듯이, `push`와 `PR`의 Event가 발생했을 때를 이야기 하는 것이빈다.
- 또한, 별도의 branch를 설정할 수 있으며, 여러개를 설정하고 싶다면 아래와 같이 적어주시면 됩니다.

```text
on:
	push:
		branches:
			- master
			- deveplop
```

### jobs - build

- 말 그대로 job을 실행한 다는 것인데, build라는 작업을 진행한다는 의미입니다.

### runs-on

- 특별한 가상 환경에서 하고 싶다면 적어주면 됩니다. 위에 예제에서는 Ubuntu 최신 버전을 사용한다는 것으로(ubuntu-18.04)버전 입니다.
- 아래와 같이 여러가지 환경에서 실행해볼 수 있도록 제공합니다.

![github-action-3](https://github.com/ksy90101/TIL/blob/master/infra/image/github-action-3.png?raw=true)

### Java 1.8 설치

```text
    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 1.8
      uses: actions/setup-java@v1
      with:
        java-version: 1.8
```

- steps은 한 단계로 실행한다는 의미입니다.
- 위에서 보듯이 Java-version 1.8을 설치한다는 의미로 build를 위해 JDK를 설치해줘야 하기 때문에, 첫번째 단계로 진행합니다.

### Gradlew 권한 설정

```text
    - name: Grant execute permission for gradlew
      run: chmod +x gradlew
```

- 기본적으로 gradlew의 권한이 설정이 되어 있지 않다. 권한 설정을 해서 사용 가능하도록 한다.

### Build

```text
    - name: Build with Gradle
      run: ./gradlew build
```

- 실제 Build를 하는 명령어이다.

### 실제 과정

- 위의 작업 순서대로 진행되면서 총 Build를 진행한다.

### working-directory

- 하나의 저장소에서 frontEnd폴더와 backEnd 폴더를 분리시켜서 작업하는 경우가 있다.
- github Action Script를 만들면 저장소의 Root에 github 폴더에 들어가게 된다.
- 그렇다면 기본적으로 저장소의 root로 Build를 진행할텐데, Spring Project가 없기 때문에 build를 실패할 것이다.
- 따라서 working-directory 라고, 환경 변수를 설정하고 그 폴더에서 Build를 진행하라고 해야 한다.

```text
runs-on: ubuntu-latest
    env:
      working-directory: ./backend
```

- 위와 같이 환경 변수로 폴더 명을 working-directory를 Build를 해야 하는 폴더로 지정해야 합니다.
- 위에서 진행한 job step들 중에 working-directory에서 job들에게 working-directory를 붙여 줍니다.

```text
- name: Grant execute permission for gradlew
      run: chmod +x gradlew
      working-directory: ${{ env.working-directory }}
- name: Build with Gradle
      run: ./gradlew build
      working-directory: ${{ env.working-directory }}
```

## Slack과 연동하여 Build 성공 및 실패 여부 메시지 보내기

```text
- name: Slack Notify
      if: failure()
      uses: rtCamp/action-slack-notify@v2.1.0
      env:
        SLACK_CHANNEL: group-dev
        SLACK_COLOR: '#FF2D00'
        SLACK_USERNAME: 'Github Action'
        SLACK_ICON: https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png
        SLACK_TITLE: Build Failure - ${{ github.event.pull_request.title }}
        SLACK_MESSAGE: PR Url - ${{ github.event.pull_request.url }}
        SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK_URL }}
```

- Github Action에서 slack 전송을 하기 위해 새로운 플러그인을 사용한다.
- 여기서 특징은 SLACK_WEBHOOK_URL을 넣어줘야 하는데, 이게 KEY값이기 때문에 Github Repository에 Secret에다가 넣는다.
- 그럼 일단, 슬랙봇을 만들어서 WEBHOOK_URL을 받아야 한다.

### WEBHOOK_URL 발급

- [Slack API](https://api.slack.com/) 홈페이지에 접속한다.
- Your Apps를 클릭하고, Create New APP으로 새로운 SLACK BOT을 만듭니다.

![github-action-4](https://github.com/ksy90101/TIL/blob/master/infra/image/github-action-4.png?raw=true)

- 만들면 아래와 같이 기본 정보들이 나오게 되는데, 이때 Incoming Webhooks를 클릭합니다.

![github-action-5](https://github.com/ksy90101/TIL/blob/master/infra/image/github-action-5.png?raw=true)

- 활성화를 시키고, `Add New Webhook to Workspace`를 체크해서 메시지를 보낼 채널을 추가합니다.
- 이때 아까 Github Action에 추가해야하는 것은 Webhook URL로 아래 사진에 있는 값을 복사합니다.

![github-action-6](https://github.com/ksy90101/TIL/blob/master/infra/image/github-action-6.png?raw=true)

- 복사한 Webhook URL을 아래의 Secrets에 등록해준다.

![github-action-7](https://github.com/ksy90101/TIL/blob/master/infra/image/github-action-7.png?raw=true)

- 그렇다면 Slack에 build 결과를 알려줄것이다.

### PR시 Build 확인 방법

- Entity 추가

```java
public class User {
    private String name;
    private int age;

    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }
}
```

- 실패하는 테스트 생성

```java
import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserTest {

    @DisplayName("생성자 확인")
    @Test
    void constructorTest() {
        User user = new User("럿고", 28);
        assertThat(user.getAge()).isEqualTo(30);
    }
}
```

- PR 보내기

![github-action-8](https://github.com/ksy90101/TIL/blob/master/infra/image/github-action-8.png?raw=true)

- 위의 사진처럼 github action에서 Build를 실행한다.
- 실패하는 테스트를 만들어서 PR을 보냈기 때문에 build 실패가 나온다.

![github-action-9](https://github.com/ksy90101/TIL/blob/master/infra/image/github-action-9.png?raw=true)

- 성공하는 테스트로 PR을 보내기 위해 테스트를 변경한다.

```java
import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserTest {

    @DisplayName("생성자 확인")
    @Test
    void constructorTest() {
        User user = new User("럿고", 28);
        assertThat(user.getAge()).isEqualTo(28);
    }
}
```

![github-action-10](https://github.com/ksy90101/TIL/blob/master/infra/image/github-action-10.png?raw=true)

- 위와 같이 빌드가 성공하는 걸 볼수있다.

## 정리

- 매번 개발을 하면서 Build를 돌려보고 커밋을 하고 Push를 하는 것을 잊게 된다.
- Github Action으로 휴먼 에러를 방지할수 있을 것 같다.
- Github Action에는 이 기능말고도 많은 기능들이 있다.
