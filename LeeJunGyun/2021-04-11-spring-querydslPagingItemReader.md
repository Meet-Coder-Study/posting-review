`Reference 보고 정리했습니다.`

## 1. spring-batch QuerydslPagingItemReader 개념

#### 1.1 QuerydslPagingItemReader
- spring-batch 에서 사용가능한 querydsl 기반 ItemReader 이며, Paging 기능을 사용할 수 있습니다.
    - Paging 기능은 전체 데이터 중 일부 데이터를 조회하는 기법
    - 예를 들면, 1만건의 데이터가 있을 때, 1~100, 101~200 ... 이런 순으로 데이터를 가져오는 것입니다.
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
     
## 2. QuerydslPagingItemReader source
- 기존 JpaPagingItemReader 에 offset 이나 page 관련 JPQL 만 들어가면 되니 JpaPagingItemReader 를 복사한 후, 수정하면 됩니다.
- doReadPage 메소드에서 offset, limit 를 넣어주면 제대로 동작합니다.
- doReadPage 에 트랜잭션 로직들을 빼준게 있는데 어차피 spring-batch transcation manager 가 관리를 해주기에 문제 없습니다. 
- 여기서 좀 특이한점은 doReadPage 에서 트랜잭션 관리 처리가 있는데 이건 아래에서 자세히 다뤄보기로 합니다.

  
```java
package org.example.batch.reader;

import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.batch.item.database.AbstractPagingItemReader;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.util.ClassUtils;
import org.springframework.util.CollectionUtils;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Function;


/**
 * QuerydslPagingItemReader
 * @param <T>
 */

public class QuerydslPagingItemReader<T> extends AbstractPagingItemReader<T> {

    protected final Map<String, Object> jpaProperties = new HashMap<>();
    protected EntityManagerFactory entityManagerFactory;
    protected EntityManager entityManager;
    protected Function<JPAQueryFactory, JPAQuery<T>> queryFunction;
    protected boolean transacted = true;    //default value

    protected QuerydslPagingItemReader() {
        setName(ClassUtils.getShortName(QuerydslPagingItemReader.class));
    }

    public QuerydslPagingItemReader(EntityManagerFactory entityManagerFactory,
                                    int pageSize,
                                    Function<JPAQueryFactory,
                                    JPAQuery<T>> queryFunction) {
        this();
        this.entityManagerFactory = entityManagerFactory;
        this.queryFunction = queryFunction;
        setPageSize(pageSize);
    }

    public void setTransacted(boolean transacted) {
        this.transacted = transacted;
    }

    @Override
    protected void doOpen() throws Exception {
        super.doOpen();

        entityManager = entityManagerFactory.createEntityManager(jpaProperties);
        if (entityManager == null) {
            throw new DataAccessResourceFailureException("Unable to obtain an EntityManager");
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doReadPage() {

        clearIfTransacted();
    
        // 이 부분이 기존 JpaPagingItemReader 트랜잭션 관련 로직.
//        if (transacted) {
//            tx = entityManager.getTransaction();
//            tx.begin();
//
//            entityManager.flush();
//            entityManager.clear();
//        }//end if

        /**
         * 이게 핵심 로직임. 기존 JpaPagingItemReader 에다가 뒤에 offset, limit 을 추가.
         */
        JPAQuery<T> query = createQuery()
                .offset(getPage() * getPageSize())
                .limit(getPageSize());

        initResults();

        fetchQuery(query);
    }

    protected void clearIfTransacted() {
        if (transacted) {
            entityManager.clear();
        }
    }

    protected JPAQuery<T> createQuery() {
        JPAQueryFactory queryFactory = new JPAQueryFactory(entityManager);
        return queryFunction.apply(queryFactory);
    }

    protected void initResults() {
        if (CollectionUtils.isEmpty(results)) {
            results = new CopyOnWriteArrayList<>();
        } else {
            results.clear();
        }
    }

    protected void fetchQuery(JPAQuery<T> query) {
        if (!transacted) {
            List<T> queryResult = query.fetch();
            for (T entity : queryResult) {
                entityManager.detach(entity);
                results.add(entity);
            }
        } else {
            results.addAll(query.fetch());
        }
    }

    @Override
    protected void doJumpToPage(int index) {
    }

    @Override
    protected void doClose() throws Exception {
        entityManager.close();
        super.doClose();
    }
}
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
- Cursor 나 Paging 이나 배치 프로그램에서 대용량 데이터를 가져오는 기법 중 하나이기에 동일한 consistent 를 위해 이렇게 작성했을 것이라고 spring-batch 담당자가 얘기해줍니다. 
    - 그럼 굳이 트랜잭션 처리를 안해도 될 것 같습니다.    
    
```java
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

## 5. QuerydslPagingItemReader 테스트
```java
package org.example.batch.reader;

import org.example.batch.domain.Member;
import org.example.batch.domain.QMember;
import org.example.batch.repository.MemberRepository;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import javax.persistence.EntityManagerFactory;

import static org.hamcrest.Matchers.is;

@RunWith(SpringRunner.class)
@SpringBootTest
public class QuerydslPagingItemReaderTest {

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Autowired
    private MemberRepository memberRepository;

    private final int pageSize = 1;


    @Test
    public void querydslPagingItemReaderTest() throws Exception {
        Member member = Member.builder()
                .name("test1")
                .build();
        Member member2 = Member.builder()
                .name("test2")
                .build();
        memberRepository.save(member);
        memberRepository.save(member2);

        QuerydslPagingItemReader<Member> reader = new QuerydslPagingItemReader<>(entityManagerFactory, pageSize, queryFactory -> queryFactory
                .selectFrom(QMember.member))
                ;

        reader.open(new ExecutionContext());

        Assert.assertThat(reader.read().getName(), is("test1"));
        Assert.assertThat(reader.read().getName(), is("test2"));
    }
}
```

## 6. pageSize 는 chunkSize 랑 동일하게 하는 것이 좋음.
- chunkSize 는 데이터를 몇 개 가져올까 하는 것입니다.
- pageSize 는 QuerydslPagingItemReader 가 데이터를 한꺼번에 얼마만큼 읽을지를 결정하는 properties 입니다.
- chunkSize 가 100이라면, pageSize 도 100이여야 조회할 때 한꺼번에 조회를 해옵니다.
- 만약 chunkSize 가 100이고, pageSize 가 50이라면 두번에 걸쳐 조회를 하기에 그만큼의 리소스 소모가 발생합니다. 

## Reference
- https://woowabros.github.io/experience/2020/02/05/springbatch-querydsl.html
- https://ict-nroo.tistory.com/117