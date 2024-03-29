# 카산드라 데이터 모델링

아파치 카산드라는 테이블에 데이터를 저장하고, 각 테이블은 행(row)과 열(column)으로 구성된다. 카산드라는 CQL(Cassandra Query Langauge)이라고 하는 질의 언어를 사용한다. 관계형 데이터베이스의 SQL과 매우 비슷하다. 

아파치 카산드라는 관계형 데이터베이스 모델과는 다르다.



## 쿼리 기반 (Query-Driven) 데이터 모델링

데이터 모델링은 엔티티를 식별하고 그 관계를 정의 하는 작업이다. 관계형 데이터베이스에서, 데이터가 테이블에 위치하여 외래키(foreign key)를 이용하여 다른 테이블의 데이터를 참조한다. 여기까지는 비슷하지만, 관계형 데이터베이스와의 큰 차이점 한가지가 있다. 카산드라는 쿼리 기반(query-driven)의 데이터모델링을 사용한다. 관계형 데이터베이스의 쿼리는 여러 테이블을 참조하는 것이 일반적이다. 여기서 성능의 이슈가 생긴다. 대신, 카산드라는 쿼리가 하나의 테이블을 참조하여 데이터를 빠르게 접근할 수 있도록 최적화된 모델링을 사용한다. 



## 조인(Join) 은 없다

카산드라는 관계형 데이터베이스 모델에서 흔히 사용하는 테이블 조인이 없다. 따라서, 모든 필드(columns)가 하나의 테이블에 미리 모여있어야 한다. 하나의 테이블에 필요한 데이터를 모두 넣는다면, 다른 테이블에도 데이터가 중복이 될 수 있지 않을까? 관계형 데이터베이스에서는 이것을 반정규화(denormalization)라고 한다. 반정규화는 데이터의 무결성을 해칠 수도 있지만 높은 처리량(throughput)과 빠른 읽기 성능을 보장한다. 결론적으로, 설계는 트레이드 오프다. 무결성이 중요한가? 속도가 중요한가? 어느 것이 중요한지는 상황에 따라 다르다.



## 카산드라 데이터 모델링 핵심

카산드라는 클러스터 노드에 데이터를 분산하여 저장하는 분산 데이터베이스다. 카산드라에는 기본 키와 파티션 키가 있다. 이 키를 기준으로 클러스터 간에 데이터를 고르게 분배할 수 있다. 파티션 키의 개수를 적게 유지하는 것이 카산드라 데이터 모델링의 핵심이다. 파티션 키가 여러개 있다고 생각해보자.  파티션 키에 따라 분포된 데이터가 여러 노드에 위치할 것이고, 각 노드 별로 어느 키를 가지고 있는지 요청을 보내는 것이 비용이며, 이는 결국 속도 저하를 초래한다. 우리가 관계형 데이터베이스의 테이블을 모델링할 때를 떠올려보자. 관계형 데이터베이스의 데이터 모델링은 테이블 중심으로 이루어진다. 테이블을 만들고 다른 테이블의 외래키를 사용한다. 쿼리는 JOIN문을 사용하여 이에 맞춰서 따라 작성될 뿐이다. 반면, 카산드라는 쿼리 중심의 데이터 모델링이다. 



## 파티션

파티션 키는 노드 간에 데이터를 고르게 분배할 때 사용된다. 파티션 키는 기본 키의 첫 번째 필드로부터 생성된다. 파티션된 데이터는 빠르게 이 데이터를 조회하기 위해 해시 테이블 구조로 저장된다. 

다음은 `t` 라는 테이블을 생성하는 테이블 생성 문이다.

```cql
CREATE TABLE t {
 id int,
 k int,
 v text,
 PRIMARY KEY (id)
};
```

테이블 `t` 는 기본 키로 `id` 를 가지고 있다. 그렇다면, 파티션 키는 어떻게 될까? 파티션 키 또한 `id` 라는 값에 맞춰 분할된다.

다음의 경우는 기본 키를 두 필드로 구성한 예제다.

```cql
CREATE TABLE t (
	id int,
  c text,
  k int,
  v text,
  PRIMARY KEY (id, c)
);
```

위 예제의 테이블 `t` 는 두 개의 필드를 기본키로 가지므로 파티션 키 또한 두 필드를 이용해 만들어진다. 첫 번째 `id` 는 파티션 키를 생성하는데 사용되고, 두 번째 `c` 필드는 하나의 파티션 내에서 정렬을 위해 사용되는 클러스터링 키가 된다. 이처럼 일반적인 카산드라 데이터 모델링은 첫 번째 필드는 해싱되어서 해시 테이블의 키 값이 된다. 그리고 나머지 필드는 클러스터링 키가 되어 하나의 파티션 안에서 데이터 정렬에 사용 된다. 기본 키가 아닌 필드는 어떻게 사용될까? 이러한 필드는 별도로 인덱스하여 쿼리 성능을 높이는데 사용될 수도 있다.

파티션 키를 두 개로 사용할 수는 없을까? 가능하다. 다음 처럼 소괄호로 묶어주는 방식을 사용한다.

```cql
CREATE TABLE t (
	id1 int,
	id2 int,
	c1 text,
	c2 text,
	k int,
	v text,
	PRIMARY KEY ((id1, id2), c1, c2)
);
```

파티션 키는 `id1`, `id2` 가 되고 클러스터링 키는 `c1`, `c2 ` 가 된다.

## 데이터 모델링 예제

데이터 모델링은 예제로 살펴보자. 여기 잡지를 형상화한 `magzine` 이라는 데이터가 있다. 이 데이터는 식별자(id), 이름(name), 발행 빈도(publication frequency), 출판사(publisher), 출판 일(publication date) 라는 필드로 구성된다. 어떠한 쿼리가(Q1이라고 하자) 이 잡지의 이름과 발행 빈도를 리스트로 뽑아내고 싶다고 한다면, 파티션 키는 이러한 정보들을 하나씩 식별하는 `id` 만 있으면 될 것이다.

![../_images/Figure_1_data_model.jpg](https://cassandra.apache.org/doc/latest/_images/Figure_1_data_model.jpg)

여기에 또 다른 쿼리(Q2)가 있다. 이 쿼리는 출판사를 기준으로 모든 잡지 이름을 얻어내려고 한다. 이에 맞춰, Q2는 `publisher` 라는 필드가 파티션 키가 되어야 할 것이다. 그리고 `id` 는 `publisher` 라는 파티션 내에서 정렬하는 용도로 사용되고 위해 클러스터링 키가 될 것이다.

![../_images/Figure_2_data_model.jpg](../images/Figure_2_data_model.png)

이제 위의 예제를 DDL 문장으로 옮겨보자.

Q1 쿼리에 대해서는 다음과 같이 작성할 수 있다.

```cql
CREATE TABLE magizine_name(id int PRIMARY KEY, name text, publicationFrequency text)
```

Q2 쿼리는 다음과 같이 클러스터링 키를 둔다.

```cql
CREATE TABLE magzine_publisher (
  publisher text, 
  id int, 
  name text, 
  publicationFrequency text, 
  PRIMARY KEY (publisher, id) 
) WITH CLUSTERING ORDER BY (id DESC)
```





---

출처: https://cassandra.apache.org/doc/latest/data_modeling/intro.html

