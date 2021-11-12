# Mybatis Start!
이번 스터디를 진행하면서 어떤 글을 쓸까 생각하다 앞으로의 직장생활에 도움이 되는 글을 쓰는게 좋을거같다는 생각이들었다.  
그리고 들어는 봤지만 해보진 않았던 Mybatis에 대해서 정리 해보기로 했다.  

## Mybatis
[mybatis.org](https://mybatis.org/mybatis-3/ko/index.html)  
위 링크를 보면 Mybatis를 다음과 같이 설명 하고있다.  
```
마이바티스는 무엇인가?
마이바티스는 개발자가 지정한 SQL, 저장프로시저 그리고 몇가지 고급 매핑을 지원하는 퍼시스턴스 프레임워크이다. 
마이바티스는 JDBC로 처리하는 상당부분의 코드와 파라미터 설정및 결과 매핑을 대신해준다. 
마이바티스는 데이터베이스 레코드에 원시타입과 Map 인터페이스 
그리고 자바 POJO 를 설정해서 매핑하기 위해 XML과 애노테이션을 사용할 수 있다.
```
항상 그랬듯 눈에 보이는 단어들 몇개를 정리 해보면
### Persistence Framework
```
퍼시스턴스 프레임워크(Persistence Framework)는 
데이터의 저장, 조회, 변경, 삭제를 다루는 클래스 및 설정 파일들의 집합이다.

퍼시스턴스 프레임워크를 사용하면 JDBC 프로그래밍의 복잡함이나 번거로움 없이 간단한 작업만으로 
데이터베이스와 연동되는 시스템을 빠르게 개발할 수 있으며 안정적인 구동도 보장한다.
```
### JDBC
```
JDBC(Java Database Connectivity)는 자바에서 데이터베이스에 접속할 수 있도록 하는 자바 API이다.
JDBC는 데이터베이스에서 자료를 쿼리하거나 업데이트하는 방법을 제공한다.
```

즉 Mybatis는 개발자가 데이터베이스와 연동되는 시스템을 빠르고 안정적으로 개발 할 수 있도록 도와주는 Persistence Framework
라고 정리 할 수 있을거 같다.  

## SqlSessionFactoryBuilder, SqlSessionFactory, SqlSession
Mybatis의 핵심 컴포넌트 중에는
SqlSessionFactoryBuilder, SqlSessionFactory, SqlSession이 있는데 설명하면 다음과 같다.

|이름|내용|
|------|---|
|SqlSessionFactoryBuilder|설정파일에 따라 SqlSessionFactory 생성
|SqlSessionFactory|SqlSession 객체를 생성
|SqlSession|맵퍼파일에서 SQL를 찾아 JDBC 드라이버를 통해 SQL을 질의 후 data를 반환하는 객체

그림을 통해 설명하면
![](./images/Mybatis%20SqlSessionFactory.png)
mybatis-config.xml에서 Mybatis관련 설정을 SqlSessionFactoryBuilder를 통해 설정하여 SqlSessionFactory를 만들수 있다.   

```java
    inputStream input = Resources.getResourceAsStream("mybatis-config.xml")) {
    factory = new SqlSessionFactoryBuilder().build(input);
```
SqlSessionFactoryBuilder의 build() 메서드를 통해 만들어진 SqlSessionFactory를 통해 SqlSession을 만들수 있는데  
SqlSession은 위에서 설명 하듯 Mapper파일에서 Sql을 찾아 JDBC드라이버를 통해 SQL을 질의 후 data를 반환 하는 객체 라고 되어있는데  
간단하게 설명하면 SqlSession을 통해 select, insert 등의 sql을 사용하기 위한 역할을 가지고 있다고 생각 하면된다.(나중에 자세하게 설명하겠다.)  
SqlSession은 Thread-Safe하지 않기 때문에 스프링의 경우 SqlSessionFactory를 Spring-Container에 등록하여 사용하는 것이 좋고,  
만약 스프링을 사용하지 않는다면 try-catch-finally에서 SqlSessionFactory.openSession()으로 SqlSession을 열고 사용이 끝나면 SqlSession의 close()메서드를 호출하여 닫아주는 것이 좋다.    
```java
SqlSession sqlSession = sqlSessionFactory.openSession();
try{
    return sqlSession.select("dao.mapper.selectById");
} fianlly {
    sqlSession.close();
}
```
물론 이 외에도 Interface로 필요한 Method를 만들고 xml파일과 연결하여 xml파일에서 Query문을 작성하여 DB와 통신 할 수도있고,   
설정의 경우 xml을 사용하지 않고 하는 방법등 다양한 방법이 있는데 이는 이후 작성할 글에서 소개 하고자 한다.

다음 포스팅은 Mybatis설정을 다양한 예시를 통해 소개 할 것이다.

## 출처
[Data Makes Our Future](https://data-make.tistory.com/543)  
[Mybatis 한글 번역](https://mybatis.org/mybatis-3/ko/index.html)  
[sqlSession bean등록](https://iotsw.tistory.com/82)  
[Mybatis 소개](https://didalgus.github.io/2020/12/09/Mybatis.html)  