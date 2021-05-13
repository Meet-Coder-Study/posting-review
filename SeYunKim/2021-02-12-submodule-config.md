# Git Submodule 설정하기

## 서브모듈(Submodule)이란?

- 하나의 저장소 안에 있는 또 다른 별개의 저장소입니다.
- 보통 다른 원격 저장소를 가져와 서브모듈을 사용하게 됩니다.

## 🔨서브모듈(Submodule) 설정

```shell
git submodule add https://github.com/{사용자명}/{저장소명}.git {폴더명}
```

- 위의 명령어를 실행하면 지정한 폴더명으로 폴더가 생성되면서 서브모듈이 생성됩니다.
- 저는 아래와 같이 명령어를 사용했습니다.

```shell
git submodule add https://github.com/Meet-Coder-Study/study-platform-submodule.git config
```

- 아울러 아래와 같이 `.gitmodules`라는 파일이 생성됩니다.

```gitignore
[submodule "config"]
	path = config
	url = https://github.com/Meet-Coder-Study/study-platform-submodule.git
```

- 서브모듈을 연결했다면 서브 모듈을 업데이트를 해줘야 하는데요. 아래와 같은 명령어를 사용하면 됩니다.

```
git submodule update --init --recursive
```

- 이후에 commit후 push를 하면 아래와 같이 나오는걸 확인할 수 있습니다.

![submodule_config_1](https://github.com/ksy90101/TIL/blob/master/git/image/submodule_config_1.png?raw=true)

## 서브모듈이 있는 프로젝트 clone

```java
git clone --recurse-submodules https://github.com/{사용자명}/{저장소명}.git
```

- 위의 명령어를 사용하면 쉽게 clone을 할수 있습니다.

## 서브모듈 업데이트

```java
git submodule update
```

- 위의 명령어를 사용하면 서브모듈의 변경 사항을 업데이트 하게 되는데요. 하지만, 서브모듈 로컬 저장소는 Detached HEAD 상태로 남게 됩니다. 즉, 내용을 추적하는 로컬 브랜치가 없게 됩니다.
- 따라서 아래와 같이 명령어에 옵션을 추가해주면 upstream에서 변경된 커밋을 가져오게 됩니다.

```java
git submodule update --remote
```

```java
git submodule update --init --recursive
```

- 위 명령어를 사용하면 서브모듈을 초기화해서 master(main)을 기본적으로 최신으로 업데이트가 하게 됩니다.

## 서브모듈 default brach 변경하기

```java
git config -f .gitmodules submodule.{서브모듈명}.branch
{변경하고 싶은 브랜치명}
```

- 기본적으로 submodule은 master(main)을 바라보고 있게 된다. 원하는 브랜치가 있다면 위의 명령어를 이용해 변경해주면 된다.

## 🔖 팁

- 개발을 할 때 숨겨야 할 값이 있어야 할때, private 저장소를 만들어 submodule로 연결해놓는다.
- 예를들어 DB 정보 값 같은 경우는 외부에 노출되면 안되는데, 그럴 경우 서브모듈을 이용하면 손쉽게 숨길수 있다.
- Java 개발 시 멀티 모듈 방식을 이용해 개발을 할 경우 여러 군데에서 값이 필요할 수가 있다.
- Gradle을 사용한다면 아래와 같이 copy task를 사용하면 쉽게 복사해 여러 군데에 서브모듈에 있는 파일을 이용할 수 있다.

```java
task copyConfigSettings(type: Copy) {
    description = "Copy application-*.yml from config"
    from './config'
    into 'src/main/resources/'
}
```

## 출처

[Git 의 서브모듈(Submodule)](https://sgc109.github.io/2020/07/16/git-submodule/)

[Git - 서브모듈](https://git-scm.com/book/ko/v2/Git-%EB%8F%84%EA%B5%AC-%EC%84%9C%EB%B8%8C%EB%AA%A8%EB%93%88)
