## 왜 나는 Mybatis를 어려워 할까
이 글은 다양한 Mybatis설정 해보려고 이것저것 해보다가 멘탈도 나가고 왜 못했는지 변명하는 글입니다. ㅜㅜ

### 현업
이번에 개발자로 일을 하게 되면 Mybatis를 접하게 되었다.
그러면서 특이한 점을 봤는데 
    1. 유사한 이름의 Table이기도 했고, column의 차이만 있는 Table이 여러개 있었다.
    2. Sql에 로직이 들어가 있다.

이 두가지였다.  
구조가 잘못됐다 좋은것같다 라고 판단 하긴 힘들었지만, 지금까지 짧은 개발 경험에선 보지 못한 구조 였다.  
좋은것 안좋은것을 떠나 개발자에 따라 같은 로직이더라도 테이블 설계는 천차만별로 작성될거같다는 생각이 들었고, 그럼 이해하는 개발자는
고통스럽겠다고 생각했다.  

그리고 Sql에 로직이 들어가있었는데, Test Code는 내가 생각하는 DataBase의 역할은 데이터를 순수한 조회, 삭제, 수정, 삽입하는 정도로 생각했는데
조건에 따라 CRUD을 실행하는 것이었다. 
조건에 따라 Test Code를 작성하면 괜찮겠지 라고 생각했지만, 로직이 변경되는 순간 Service Logic뿐만 아니라 .xml에서 query까지 확인 해야 하니 
이슈의 공수가 더 들어가고 더불어 실수를 할 요소가 많아 질 수 있겠다는 생각이 들었다.

### 다양한 설정
Mybatis에 대한 글 [해당 글](https://mybatis.org/mybatis-3/ko/configuration.html#properties) 을보면서 xml에서 설정하는 것 부터 시작하여 
.properties, Configuration에서 설정하는 방법으로 파생하여 글을 시리즈 별로 작성하고싶었다.  

그리고 시간이 날 때 마다 여러 설정에 관련된 글을 찾아봤는데, SpringBoot, Spring, SpringMVC 등등 각각 설정하는 환경이 조금씩 달랐다.  
어찌저찌 설정을 했다고 생각해도 클래스에서 메서드 호출도 인식을 못했다는 에러만 무성할 뿐 원인이 뭔지 찾기 힘들었다.  

### 그래서 어떻게 할건가
결국 원하는 글을 완성 하는 것을 달성하진 못했지만, 얻은 것은 있었다.  
내가 이걸 이해한다면, 기존에는 yml, properties에서 설정 했던 것보다 좀더 상세하게 설정 할 수 있을것이고, 이걸 기반으로 code와 DB를 연결하는 것,  
원하는 데이터를 가져오는 과정을 세밀하게 이해 할 수 있을 거라는 생각이 들었다.  
그리고 SpringBoot 뿐만 아니라 Spring, SpringMVC에서 설정을 체감 해본다면 그냥 글을 읽었을 때 보다 더 많은 경험치가 될거라는 생각도 들었다.  

이번 포스팅 이후 한번의 포스팅이 남아 있는데, 그때는 다음과 같은 주제로 작성 할것이다.  
"Mybatis 설정 1편 : xml로 설정해보는 Mybatis"

이번 기수의 마무리를 내가 생각하는 Mybatis의 다양한 설정에 대한 글의 시작점으로 마무리 할 수 있었음 좋겠다.  

ps : JDBC, JPA최고 !

### 글을 작성하기위해 찾아 봤던 글들
[Spring-Boot-MyBatis-설정-방법](https://atoz-develop.tistory.com/entry/Spring-Boot-MyBatis-%EC%84%A4%EC%A0%95-%EB%B0%A9%EB%B2%95)  
[mybatis-The content of element type "configuration" must match ... 에러](https://chemeez.tistory.com/106)  
[Spring boot + Mybatis 연결하기](https://charlie-choi.tistory.com/218)  
[Java Resource 사용(getResource(),getResourceAsStream())](https://zincod.tistory.com/142)  
[게시판 만들기(1) - 프로젝트 생성과 설정.](https://tjdans.tistory.com/7)  
[MyBatis와 스프링 연동](https://sangwon-story.tistory.com/entry/4-MyBatis%EC%99%80-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%97%B0%EB%8F%99)  
[JAVA 자바 마이바티스 mybatis 사용하기](https://xianeml.tistory.com/47)  
[Spring Boot + MyBatis 설정 방법(HikariCP, H2)](https://atoz-develop.tistory.com/entry/Spring-Boot-MyBatis-%EC%84%A4%EC%A0%95-%EB%B0%A9%EB%B2%95)  
[myBatis 설정(Properties 파일 설정 방식)](https://cattaku.tistory.com/6)  
[Spring Boot 에서 Context Path 설정하기](https://linkeverything.github.io/springboot/spring-context-path/)  
