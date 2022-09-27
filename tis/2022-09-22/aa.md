# 의존성 관리 및 리팩토링 기준과 방법

## 목차

1.  프로젝트 구조를 변경하는 이유
2.  프로젝트 구조를 변경하기 위한 결정
3.  프로젝트 구조를 변경하기 위해 사용한 기술 - 종속성 메트릭스
4.  마지막으로

## 프로젝트 구조를 변경하는 이유

auth 패키지의 책임은 로그인 로그아웃 기능, 공통 관심사 처리 있는 등 책임이 많다고 판단해 기능에 따라 분리했다.

```
├── auth
│   ├── authorization
│   │   └── secured
│   ├── config
│   ├── context
│   ├── domain
│   ├── filter
│   │   └── handler
│   ├── kakao
│   │   └── dto
│   ├── provider
│   ├── token
│   ├── ui
│   │   └── dto
│   └── userdetails
...
```

### 문제 1 - Auth 패키지의 책임

1.  로그인 기능
2.  로그아웃 기능
3.  공통 관심사 처리
4.  권한 확인
5.  인가된 사용자만 접근
6.  사용자 인증

### 문제 1 해결 1 - 의존 방향에 따른 분리

처음 문제를 해결하기 위해 의존 방향에 따라 분리했다. 공통 관심사를 global 패키지로 분리하면서 auth 모듈 관리를 시작했다.

1.  global 모듈
    1.  모든 모듈이 의존할 수 있는 기능 관리
    2.  공통 관심사를 처리 관리
2.  auth 모듈
    1.  로그인, 로그아웃 기능 구현
    2.  토큰 관리 기능 구현

위와 같은 기준으로 모듈을 구성했다.

```
├── auth
│   ├── domain
│   └── ui
├── global
│   ├── authorization
│   ├── config
│   ├── context
│   ├── filter
│   ├── provider
│   ├── token
│   └── userdetails
...
```

### 문제 1 해결 2 - 기능 단위 분리

아키텍처를 기준으로 auth 모듈 기능 단위로 분리했다. 분리 기준은 레이어드 아키텍처다.

![image](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcNxotP%2FbtrMJ06Ekle%2FzDwYzo6YSRuF0hX2uFskZk%2Fimg.png)

각 영역마다 맡은 기능을 레이어에 맞게 구성했다.

```
├── auth
│   ├── domain
│   ├── infra
│   ├── serivce
│   └── ui
...
```

### 문제 1 해결 3 - 기술적인 부분 격리

위와 마찬가지로 아키텍처 기준으로 infra에서 외부 의존성이 강한 클래스를 관리했지만, 그중 Kakao API를 의존하는 클래스 파일이 많아 소셜 로그인을 사용하는 기능에 대한 결합도가 약해졌고, Kakao API와 관련된 클래스를 묶어서 관리했다.

```
├── kakao
│   ├── KakaoAuthenticationClient.java
│   ├── KakaoAuthenticationService.java
│   ├── KakaoAuthorizationClient.java
│   ├── KakaoConfigurer.java
│   ├── KakaoPropertiesConfigurer.java
│   └── dto
│       ├── KakaoAccessToken.java
│       └── KakaoUserInfo.java
```

즉 결과로 만들어진 모듈 구조는 아래와 같다.

```
├── auth
│   ├── domain
│   ├── infra
│   ├── kakao
│   ├── serivce
│   └── ui
```

## 프로젝트 구조를 변경하기 위한 기준

프로젝트를 구조를 수정할 때, 순환 참조가 발생하지 않도록 관리하기 위해 많은 시간을 소요했다. 구조를 변경하면서 문제가 발생하지 않는 리팩토링을 위해 고민할 결과 아래 세 가지만 지켜도 충분히 문제가 발생하지 않았다.

1.  공통 관심사인가
    1.  공통 관심사인 부분을 global 모듈에서 처리해 순방향 의존성을 처리한다.
2.  기술에 의존적인가
    1.  auth 모듈 내 기술 의존적인 클래스를 격리해 한 곳에서 관리한다.
3.  순환참조 문제가 발생할 가능성이 있는가
    1.  global, auth 분리 및 auth 리팩토링을 통해 순환 참조가 발생하지 않도록 순방향으로 의존되게 설계했다.

## 프로젝트 구조를 변경하기 위해 사용한 방법 - 종속성 메트릭스

프로젝트 내의 구조는 종속성 메트릭스를 이용해 의존 관계를 단방향으로 리팩토링했다.

### 종속성 메트릭스(Dependency Structure Matrix)란

종속성 메트릭스란 영역 간의 관계를 2차원 메트릭스에 나타낸 테이블이다. 종속성 메트릭스를 이용해 각 영역 간의 의존 관계와 의존 강도 그리고 순환 참조를 파악할 수 있다.

### 영역 간 결합도 확인

종속성 메트릭스를 이용하면 모듈 간의 결합도를 쉽게 파악할 수 있고, 클래스 간의 결합도를 파악할 수 있다.

**모듈 간 의존도 확인**

![image](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbjRLLw%2FbtrMIXJoF9q%2F8mckAn0BuyFkLsuU7z7iB1%2Fimg.png)

💡 자주색으로 표현된 영역을 더블 클릭하면 아래 그림과 같이 모듈에 포함된 클래스 간의 의존도를 쉽게 파악할 수 있다.

![image](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FtbDqh%2FbtrMK2CUWd0%2F5VSsOI60paLcIoFMpWqvMK%2Fimg.png)

**클래스 간 의존도 확인**

![image](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbPvsiJ%2FbtrMG2SyHva%2FKNpMNbpf0iyHqfF1LYabz0%2Fimg.png)

### 영역 간 의존 강도 확인

필요에 따라 원하는 영역을 선택하면 의존 강도를 쉽게 확인할 수 있다.

![image](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbGP6lS%2FbtrMKntNK1h%2FM5Rv3owmRRRtUNWg7ELhtk%2Fimg.png)

💡 이미지를 볼 때 녹색 영역이 노란색 영역을 의존한다고 보면 된다.

### 의존하는 영역 확인

영역 이름을 선택해 어느 영역이 의존하고 있는지 쉽게 파악 가능하다.

![image](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdwUGBE%2FbtrMIsQDNqK%2FRBbVFfEDXGqyzcKcH9ruSk%2Fimg.png)

💡 위와 마찬가지로 녹색 영역이 노란색 영역을 의존한다고 보면 된다.

## 마지막으로

### 분리 기준

1.  아키텍처 특성에 따라 분리
2.  기술적인 의존성에 따른 분리
3.  순환 참조가 발생하는가

### 메트릭스 사용

1.  영역을 기준으로 의존도 확인
2.  클래스 기준으로 의존도 확인

### 분리 기준에 따라 메트릭스를 활용한 모듈 구성 결과

```
├── auth
│   ├── domain
│   ├── exception
│   ├── infra
│   ├── kakao
│   │   └── dto
│   ├── serivce
│   └── ui
│       └── dto
├── global
│   ├── authorization
│   │   └── secured
│   ├── config
│   ├── context
│   ├── filter
│   │   └── handler
│   ├── provider
│   ├── token
│   └── userdetails
...
```
