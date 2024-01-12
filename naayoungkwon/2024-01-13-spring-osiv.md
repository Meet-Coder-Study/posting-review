### 알고있었던 것

JPA에서 영속성 컨텍스트라고 하여 1차 캐시, 쓰기 지연, 변경 감지 등의 장점을 가지고 있다.
쓰기 지연, 변경 감지는 츠랜잭션을 커밋하면 엔티티 매니저에서 영속성 컨텍스크를 플러시하며 DB에 동기화하게 된다.

Transaction 밖에서도 계속 변경 감지를 하는 것 처럼 select + update query가 발생해 찾아보던 중 OSIV에 대해 알게되었다.


## OSIV

> Open Session In View : 영속성 컨텍스트 뷰를 열어둔다. 
영속성 컨텍스트가 살아있으면 Entity는 영속 상태로 유지된다.

- 이전에 요청당 트랜잭션 방식의 OSIV였으나 Presentation layer에서 Entity르 변경할 수 있다는 문제로 인해 최근에는 거의 사용하지 않는다.
- Spring framework가 제공하는 OSIV는 `비지니스 계층에서만 트랜잭션을 유지`하는 방식이다.

### 비지니스 계층 트랜잭션 동작 원리

![](https://github.com/Meet-Coder-Study/posting-review/assets/34162358/e2e548c1-75ca-4938-a675-16abfcfdc73c)


1. 클라이언트의 요청이 들어오면 Filter, Interceptor에서 영속성 컨텍스트를 생성한다.
	- transaction은 시작하지 않는다.
2. 서비스 계층에서 @Transactional로 트랜잭션을 시작할 때 1번에서 미리 생성해둔 영속성 컨텍스트를 찾아와서 트랜잭션을 시작한다.
3. 서비스 계층이 끝나면 트랜잭션을 커밋하고 영속성 컨텍스트를 flush
   - **Transaction은 끝내지만 영속성 컨텍스트는 종료하지 않는다.**
4. 컨트롤러와 뷰까지 영속성 컨텍스트가 유지되므로 조회한 엔티티는 영속 상태를 유지한다.
5. 필터, 인터셉터로 요청이 돌아오면 영속성 컨텍스트를 종료한다.
	- **flush 호출 없이 바로 종료한다.**
    

여기서 영속성 컨텍스트를 통한 모든 편경은 트랜잭션 안에서만 이루어져야 하는데,
**프레젠테이션 계층에서는 transaction이 없으므로 Entity를 수정할 수 없고 조회만 가능하다.**

### 내가 겪었던 상황

```java
class MyService{

	public void update(List<Integer> ids){
    	List<Content> contents = externalApi.get(ids);
    	contentRepository.saveAll(contents); // (1)
        
        List<Picture> pictures = pictureRepository.findAllByIds(ids); // (2)
        String url = pictures.get(0).getUrl();
        // etc.. (3)
    
    }

}

```

위의 코드에서 contents를 saveAll (1) 이후에 전혀 건드리지 않았으나 계속 dirty checking을 하고있었다.
update method을 @Transactional 처리하지 않았는데 왜 그 이후의 코드를 수행할 때 마다 dirty checking을 하게되는지 이해하지 못했다.

OSIV로 인해 영속성 컨텍스트가 살아있다면, (1) 이후에 (2), (3) 위치에서 repository를 사용하면서 트랜젝션이 계속 발생하게 되고, 비록 다른 트랜젝션으로 분리되어 있으나 하나의 영속성 컨텍스트를 공유하고 있다.

(1) 이후 다른 트랜잭션을 커밋하면서 변경 감지가 동작하게 된 것이다.
별도 값을 수정은 하지 않았지만 Entity column이 Object type이라 Object.equals로 비교를 하면서 영속성 컨텍스트와 다르다고 판단해 변경되었다고 판단했다.
이부분도 미쳐 생각하지 못한 부분이긴 했지만 이번 글의 주제는 아니다.
(@EqualsAndHashCode 에 대한 글 참고 : https://jojoldu.tistory.com/536)

> 책에서도 엔티티를 수정한 직후에 트랜잭션을 시작하는 서비스 계층을 호출하면 문제가 발생하기 때문에 엔티티를 변경하는 경우 비지니스 로직을 먼저 전부 다 호출하라고 하고있다.


참고로 OSIV는 default true로 되어있다.
### 스프링 OSIV의 단점

- 같은 영속성 컨텍스를 여러 트랜잭션이 공유할 수 있다는 점을 주의해야한다.
- 프레젠테이션 계층에서 엔티티를 수정하고 나서 비지니스 로직을 수행하면 엔티티가 수정될 수 있다.
- 프레젠테이션 계층에서 지연 로딩에 의한 쿼리가 수행될 수 있어 성능 튜닝 시에 확인해야할 부분이 넓다.
- 영속성 컨텍스트가 사라지면서 DB connection을 반환하는데, 너무 오랜시간 데이터베이스 커넥션을 사용하면서 커넥션이 전체적으로 부족할 수 있다.
  - 요청이 많지 않은 간단한 서비스나 커넥션을 많이 사용하지 않은 곳에서는 OSIV true
  - 실시간 서비스에서는 OSIV false를 권장

---
참조
책 : 자바 ORM 표준 JPA 프로그래밍
https://hstory0208.tistory.com/entry/SpringJPA-OSIV-%EC%A0%84%EB%9E%B5%EC%9D%B4%EB%9E%80-%EC%96%B8%EC%A0%9C-%EC%82%AC%EC%9A%A9%ED%95%B4%EC%95%BC-%ED%95%A0%EA%B9%8C