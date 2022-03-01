# SpringWebFlux 구경하기 - 1편 SpringWebFlux 란?

**해당 글은 Spring WebFlux 공식문서를 참고하여 작성하였습니다.**

## Spring WebFlux란 무엇이고, 탄생한 이유에 대해서 알아보자.

무엇일까? 
- Reactive Stack Web Framework 이다.
- Reactive Streams back pressure 지원한다.
- Netty, Undertow, Servlet 3.1 server에서 실행 된다.

탄생한 이유?
- 적은 쓰레드로 동시 처리를 제어하고 적은 하드웨어 리소스로 확장하기 위해 Non-Blocking Web Stack 이 필요해서 만들어졌음
- Netty Server를 사용하기 위함.
- 함수형 프로그래밍을 적극 지원하기 위함.

##  Spring WebFlux를 도와주는 비동기 라이브러리

Spring WebFlux를 사용한다면, 어플리케이션이 모두 비동기로 돌아가야 하기 때문에 함수형 API가 필요하다. 이러한 함수형 API를 지원해주는 비동기 라이브러리는 아래와 같다.

- Reactor : Spring Reactive의 정식 라이브러리 
- RxJava : Observable Stream을 사용하는 자바 비동기 라이브러리
- Coroutine : 코틀린 비동기 라이브러리

## Spring WebFlux를 지원하는 Server

Spring WebFlux에서 지원하는 Server는 아래와 같다.

- Netty (Default) 
- Tomcat :
- Jetty 
- Servlet 3.1 Container 
- Undertow 

## Spring MVC과 Spring WebFlux의 차이점

Spring MVC와 Spring WebFlux는 모두 Annotated controller를 사용할 수 있다는 점은 동일하다.

차이점은 무엇이 있을까?

그 다른 점은 바로 동시성 모델에서 나타난다고 한다.

- Spring MVC :  어플리케이션 처리 중인 쓰레드가 잠시 중단 될 수 있다.
- Spring WebFlux : 실행 중인 쓰레드가 중단되지 않는다는 전제가 있다. 따라서 Non-Blocking Server는 작은 쓰레드 풀로 고정해놓고 처리가 가능하다고 한다.

추가로 Spring MVC와 Spring WebFlux 중에 선택을 해야한다면, 기능에 대해서 그리고 가지고 있는 API에 대해서 선택을 해야한다. 

아래 그림은 Spring MVC와 Spring WebFlux에서 공통 되는 것과 그리고 각각 다른 것들을 나타내주고 있다.

![Spring MVC VS WebFlux](https://godekdls.github.io/images/reactivespring/spring-mvc-and-webflux-venn.png)

## Spring WebFlux는 언제써야 할까?

개인적으로 Spring WebFlux 사용 시점은 

- Non-Blocking 서버를 사용해야 할때
- 경량의 함수형 웹 프레임워크를 찾을 때
- Nosql을 사용할 때

은 이렇다. 그리고 나와 함께하는 팀원들이 Spring WebFlux를 환영하는가, 내가 프로젝트를 남기고 떠났을 때 과연 Spring WebFlux로 만들어진 프로젝트에 대해서 유지보수가 가능해지는가 가장 중요한 것 같다.

## 회고

전 회사에서 RDB를 이용하여 메신저 서버를 만들었다. RDB를 이용했기 때문에 수 많은 메시지가 들어올 때  항상 동시성 문제를 일어났고, 이러한 동시성 문제를 해결하기 위하여 transaction 튜닝을 했다. 이러한 transaction 튜닝은 성능 이슈 및 일관성에 대한 이슈가 항상 나를 붙잡았었다. 

이러한 기억을 가지고 현재는 퇴사를 하여 다른 회사로 이직했지만 최근 대규모 시스템 설계에 대한 책에서 메신저 시스템 설계를 보고 한가지 해보고 싶은게 생겼다.

바로 채팅 서버를 RDB를 사용하는게 아닌 Nosql를 사용하여 데이터에 대한 흐름을 비동기 처리로 하여 만드는 것이다.

현재 Spring WebFlux를 보는 이유도 바로 비동기 처리를 위한 서버를 만들기 위해서이다. 

아직 Spring WebFlux의 소개 밖에 정리를 못했지만, 앞으로 Netty Server 안에서 Spring WebFlux가 돌아가는지 그리고 Reactor API는 무엇이 있는지, WebFlux 설정에 대해서 알아 볼 생각이다.
