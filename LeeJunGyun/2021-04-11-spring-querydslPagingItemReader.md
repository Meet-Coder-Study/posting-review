`Reference 보고 정리했습니다.`

## 1. spring-batch QuerydslPagingItemReader 개념

#### 1.1 QuerydslPagingItemReader
- spring-batch 에서 사용가능한 querydsl 기반 ItemReader 이며, Paging 기능을 사용할 수 있습니다.
    - Paging 기능은 전체 데이터 중 일부 데이터를 조회하는 기법
    - 예를 들면, 1만건의 데이터가 있을 때, 1\~100, 101\~200 ... 이런 순으로 데이터를 가져오는 것입니다.
    - 왜 Paging 을 쓰냐하면 DB 데이터를 한꺼번에 메모리에 올리다가 Out Of Memory 가 떨어질 수 있기 때문입니다.

#### 1.2 Querydsl, JPQL
- querydsl 은 코드로 SQL, JPQL 을 표현합니다.
    - 타입 체크 가능합니다. (컴파일 시점에)
    - 동적 쿼리 작성 편합니다.
- JPQL 은 SQL 과 비슷한 문법을 가진 객체 지향 쿼리입니다.
    - 타입 체크가 안됩니다. (컴파일 시점에) 
    - 실행 시점에 오류를 알 수 있습니다.
    - learning cost 있습니다.
    - Jpa 메소드를 사용하면 JPQL 로 변경되서 실행되는 구조입니다.
    - 동적 쿼리 작성이 극악입니다. (JPQL 을 더해서 동적쿼리를 만들어야 함.)
     
## 2. QuerydslPagingItemReader 설명
- 자세한 source 는 reference 를 참고하시면 됩니다. 
- 핵심은 JpaPagingItemReader 에 offset 이나 page 관련 JPQL 만 들어가면 되니 JpaPagingItemReader 를 복사한 후, 수정하면 됩니다. (아래 소스)
    - doReadPage 메소드에서 offset, limit 를 넣어주면 제대로 동작합니다.
    - doReadPage 에 트랜잭션 로직들을 빼준게 있는데 어차피 spring-batch transcation manager 가 관리를 해주기에 문제 없습니다. 

```java

 JPAQuery<T> query = createQuery()
                .offset(getPage() * getPageSize())
                .limit(getPageSize());

```

## 3. JpaPagingItemReader 에서 왜 트랜잭션을 처리하지?
- 기존 JpaPagingItemReader 로직을 보면 아래와 같습니다.
- 아래 doReadPage 를 해석해보면 다음과 같습니다.
    - transacted = true 옵션이라고 가정했을 때, query 를 호출해서 데이터를 가져오기 전,
    - 트랜잭션을 가져온다. 트랜잭션의 begin 을 설정하고.
    - 그런 뒤 flush, clear 를 한다. (=영속성컨텍스트를 비운다는 얘기다)
    - 그런 뒤 데이터를 조회하고, results (메모리) 에 데이터를 담고
- Reference 에 나와있는 글을 보면 JdbcCursorItemReader 와 동작을 일치하기 위해서 이와 같이 했다고 나와있습니다.
    - JdbcCursorItemReader 는 cursor 를 별도 트랜잭션으로 열어서 처리하기에 spring transaction 에 참여하지 않는다고 되어있습니다.
    - 이 부분을 조금 더 집중적으로 살펴보면 다음과 같습니다.
    - JdbcCursorItemReader 는 별도 connection 으로 db 와 연결해 fetchSize 만큼 데이터를 읽어오는 방식입니다.
    - 처음 fetchSize 만큼 읽어오고, fetchSize 만큼 데이터를 다 처리했으면 또 다시 fetchSize 만큼 읽어옵니다. 데이터를 다 읽을 때까지 이를 반복합니다.
    - 그렇기에 JdbcCursorItemReader 는 오랫동안 Connection 이 열려있어야 합니다. 만약 Spring Managed transaction 을 사용한다면, commit 후 close 가 되기에 reader 에서 더 이상 데이터를 읽어오지 못합니다.
    - 그렇기에 JdbcCursorItemReader 는 별도의 트랜잭션으로 관리됩니다. 
- 다시 본론으로 돌아와 왜 JpaPagingItemReader 에서 트랜잭션을 별도로 관리하는 기능을 제공하는 이유는 cursor 와 같은 일관성있는 방법을 제시하는 것이라고 설명이 돼있습니다.  
    - 하지만 이 부분을 조금 고민해보면, cursor 는 streaming 방식으로 데이터를 계속 가져오는 것이고.
    - Paging 은 범위를 지정해서 Page 단위로 가져오는 것이기에 cursor 와 같은 방법이 필요하지는 않을 것 같습니다.
    - Spring Managed Transaction 이 시작할 때, Connection 을 가져올테고. 해당 Connection 으로 Page 크기만큼 데이터를 가져올테니 문제가 안될 것이라 생각됩니다.  
     
    
```java
    
    // JpaPagingItemReader.java

    @Override
	@SuppressWarnings("unchecked")
	protected void doReadPage() {

		EntityTransaction tx = null;
		
		if (transacted) {
			tx = entityManager.getTransaction();
			tx.begin();
			
			entityManager.flush();
			entityManager.clear();
		}//end if

		Query query = createQuery().setFirstResult(getPage() * getPageSize()).setMaxResults(getPageSize());

		if (parameterValues != null) {
			for (Map.Entry<String, Object> me : parameterValues.entrySet()) {
				query.setParameter(me.getKey(), me.getValue());
			}
		}

		if (results == null) {
			results = new CopyOnWriteArrayList<>();
		}
		else {
			results.clear();
		}
		
		if (!transacted) {
			List<T> queryResult = query.getResultList();
			for (T entity : queryResult) {
				entityManager.detach(entity);
				results.add(entity);
			}//end if
		} else {
			results.addAll(query.getResultList());
			tx.commit();
		}//end if
	}

```

## 4. JpaPagingItemReader 는 왜 hibernate.default_batch_fetch_size 안먹히는가?
- QuerydslPagingItemReader 공부하다가 해당 내용을 알게 되서 적어놓았습니다.
- 이것과 별개로 트랜잭션 안에서만 동작하는 hibernate.default_batch_fetch_size 옵션이 JpaPagingItemReader 에서는 안먹힙니다.
- spring-batch 자체 내에서 commitCount 단위로 트랜잭션을 관리하고 있는데 JpaPagingItemReader 에서 또 트랜잭션 처리를 해버리니 해당 옵션이 안먹힙니다.
- 그래서 @OneToMany 관계에서 hibernate.default_batch_fetch_size 옵션을 써도 하위 엔티티 조회할 때, 상위 엔티티 조회해서 In Query 로 조회를 안합니다. 

## 5. pageSize 는 chunkSize 랑 동일하게 하는 것이 좋음.
- chunkSize 는 데이터를 몇 개 가져올까 하는 것입니다.
- pageSize 는 QuerydslPagingItemReader 가 데이터를 한꺼번에 얼마만큼 읽을지를 결정하는 properties 입니다.
- chunkSize 가 100이라면, pageSize 도 100이여야 조회할 때 한꺼번에 조회를 해옵니다.
- 만약 chunkSize 가 100이고, pageSize 가 50이라면 두번에 걸쳐 조회를 하기에 그만큼의 리소스 소모가 발생합니다. 

## 6. commit-interval 비교
- chunkSize 는 ChunkedOrientedTasklet 방식에서 reader --> processor 를 호출할 횟수를 의미합니다.
- commit-interval = 100 일 때, reader --> processor 를 1사이클이라 한다면 이 사이클 횟수가 100이 됐을 때, writer 로 List 데이터가 넘어갑니다.
- 만약 reader 에서 한 건씩 넘기는게 아니라 2건씩 데이터를 넘긴다면, commit-interval = 100 이여도 최종적으로 writer 로 넘어가는 List size 는 200이 됩니다.  


## Reference
- https://woowabros.github.io/experience/2020/02/05/springbatch-querydsl.html
- https://ict-nroo.tistory.com/117
- https://blog.codecentric.de/en/2012/03/transactions-in-spring-batch-part-2-restart-cursor-based-reading-and-listeners/
- https://sheerheart.tistory.com/entry/Spring-Batch-commitinterval%EC%97%90-%EB%8C%80%ED%95%9C-%EC%A0%95%EB%A6%AC