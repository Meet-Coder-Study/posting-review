# Elasticsearch 정리 
## 1. Elasticsearch ??

<img width="1000" src="https://user-images.githubusercontent.com/60383031/146576055-98999c5a-e360-4255-aa81-8da335f538da.png">

Apache Lucene 검색 라이브러리를 기반으로 만들어진 검색 엔진이다.

Elasticsearch 는 기본적으로 검색 엔진으로 사용되지만 Time series 데이터에 대한 활용도 가능하다.

또한 NoSQL 처럼 Key-Value 형태의 Document 를 저장하여 활용이 가능하다. 

<br>

## 2. Elasticsearch 특징
#### (1) Immutable 
Elasticsearch 에서 사용하는 자료구조는 Immutable 형이다. 

한 번 색인된 문서는 변경이 되지 않는다. 즉 수정이 불가능하다.

<img width="1000" src="https://user-images.githubusercontent.com/60383031/146572222-41e4e458-5010-4510-b1a3-71f809a716c3.png">

Elasticsearch 에서 update api 를 호출하면 내부적으로 Document 를 삭제하고 새로 삽입하는 방식으로 동작을 한다.

추가적으로 삭제를 진행할 때는 실제로 바로 삭제하는 것이 아니고 삭제했다는 mark 만 남긴다.

mark 처리된 데이터들은 추후 조회가 될 때 세그먼트가 병합처리가 발생하는데 이때 삭제가 이루어진다.

<br>

#### (2) Inverted index file
문서 중싱이 아니라 색인어 중심으로 탐색을 수행한다.

일반적으로 RDBMS 는 아래와 같이 데이터를 저장하고 탐색을 진행한다.

<img width="1000" src="https://user-images.githubusercontent.com/60383031/146573365-4a2cdfa9-972f-47a6-96f8-61f6beff7242.png">

테이에서 Text 에 fox 가 포함된 행들을 가져온다면, 위 그림과 같이 Text 필드를 한 줄씩 탐색하면서 'fox' 가 있으면 가져오고 아니면 skip 하는 방식으로 탐색한다.

<br>

Elasticsearch 에서는 아래와 같이 데이터를 저장한다.

<img width="1000" src="https://user-images.githubusercontent.com/60383031/146573478-2f5519e0-10e4-4e80-b4b0-292dbadcd093.png">

만약 'fox' 찾는다면, 아래와 같이 바로 'fox' 를 포함하고 있는 도큐먼트들의 id 를 바로 가져올 수 있다.

<img width="1000" src="https://user-images.githubusercontent.com/60383031/146573700-7e82ac78-5c24-45c8-98b5-614291202de7.png">

inverted index (역 인덱스) 은 데이터가 계속 늘어나도 RDBMS 와 같이 탐색을 할 행이 게속 늘어나는 것이 아니기 때문에 속도 저하 없이 빠르게 탐색이 가능하다.

<br>

# 3. Elasticsearch 용어 정리
|DMBS          |Elasticsearch           |
|--------------|------------------------|
|DBMS HA 구성   |Cluster                 |
|DBMS Instance |Node                    |
|Table         |Index                   |
|Partition     |Shard / Routing         |
|Row           |Document                |
|Column        |Field                   |
|Join          |Nested or Parent / Child|
|Index         |Analyzed                |
|Primary Key   |_id                     |
|Schema        |Mappings                |

<br>

# 4. Elasticsearch 컴포넌트
<img width="800" src="https://user-images.githubusercontent.com/60383031/146578188-7fb3b614-7ed6-46e3-9a04-c65fa58034ef.png">

#### (1) Cluster
Node 들의 모음이다.

<br>

#### (2) Node
Elasticsearch 인스턴스가 시작 될 때 실행한다.

노드의 이름을 지정하고 역할을 정의 해서 용도에 맞게 운영한다.

| 종류               |기능                                                                             |
|-------------------|--------------------------------------------------------------------------------|
| Master 노드        | 일반적으로 Node, Index, Shard 등에 대한 상태와 Cluster 운영/관리를 한다.                  |
| Data 노드          | 일반적으로 색인, 질의, 분석 등에 대한 거의 모든 작업(CRUD)을 수행하며, 색인 데이터를 저장하고 있다.  |
| Coordinating 노드  | 일반적으로 검색 요청에 대한 routing, 결과에 대한 merging, sorting 에 대한 작업을 한다.        |

<br>

#### (3) Index
Index 는 여러개의 물리적인 Shard 구성이 되어있다.

즉, 아래에서 확인할 Primary shard 와 Replica shard 로 구성이 되며, Data Node 에만 위치한다.

그리고 색인과 질의는 Shard 별로 Thread 단위로 실행이 된다.

따라서 Data 노드에 할당 되는 (Index 당) Shard 수는 사용하고 있는 인스턴스의 코어 수를 기준으로 정의할 수 있다.

<br>

#### (4) Shard
물리적인 데이터가 저장되어 있는 단위이다.

Indexing 요청이 들어오면 분산 된 노드에 위치한 shard 로 문서를 색인한다.

| 종류             | 설명                                                                                  |
|-----------------|--------------------------------------------------------------------------------------|
| Primary Shard   | 색인 요청이 들어오면 가장 먼저 생성되는 데이터 <br> 즉, 원본 데이터 <br> 개수를 늘러 성능 개선을 할 수 있음 |
| Replica Shard   | 복제 된 Shard <br> 검새 성능 개선 하기 위한 용도 |

 
<br>

# 4. Searching
사용자가 입력한 검색어를 기반으로 정확한 의도를 파악하고 결과를 찾도록 있도록 도와준다.

추가로 NoSQL 개념으로 사용한다면, 데이터를 인덱싱 후에 저장 된 데이터를 Range Query 등을 사용하여 데이터를 검색할 수 있다.

지원하는 쿼리는 Query Term, Match, Range, Compound Query 인 Boolean 이다.

그 외 Script, Function score 등도 사용 된다.


| 종류           | 설명                                                                  |
|---------------|----------------------------------------------------------------------|
| Term Query    | Exact matching <br> 사용자가 입력한 검색어와 정확히 일치하는 것을 찾음            |
| Match Query   | 한번 더 분석 후 분석 된 token 을 가지고 matching <br> 입력한 쿼리와 비슷한 것을 찾음 |


<br>

# 5. Query
#### 5.1 Query and Filter context
| 종류           | 기능                                   |
|---------------|---------------------------------------|
| Query context | 문서가 질의 절과 얼마나 잘 일치 하는지를 확인 <br> 매칭 결과에 대한 관련성을 _score 라는 필드에 점수를 매긴 후에 정렬해서 반환|
| Filter Query  | 문서가 질의 절과 일치하는 지를 확인 <br> 질의 결과에 대한 cache 를 하기 때문에 동일하게 반복 호출 시 검색 성능 향상  |

 
#### 5.2 Boolean Query
복합 쿼리 유형으로 하나 이상의 boolean 절을 작성해야한다.

|종류       |기능                                    |
|----------|---------------------------------------|
|must      | 문서 매칭된 결과를 반환하며, score 에 반영 o  |
|filter     | 문서 매칭된 결과를 반환하며, score 에 반영 x  |
|should    | 문서 매칭이 될 수도 있음                   |
|must_not  | 문서 매칭되지 않은 결과를 반환, scoring 무시  |

쿼리 예시
```http request
GET <인덱스명>/_search
{
  "query": {
    "bool": {
      "must": [
        { <쿼리> }, …
      ],
      "must_not": [
        { <쿼리> }, …
      ],
      "should": [
        { <쿼리> }, …
      ],
      "filter": [
        { <쿼리> }, …
      ]
    }
  }
}
```

<br>

# 6. Indexing
#### (1) Full Indexing
- 전체 데이터에 대해서 색인 하는 과정이다.
- 전체 색인을 하는 이유는 변경된 정보를 반영하면서 데이터에 대한 동기화가 깨질 수도 있고 불필요한 정보가 남아 있을 수 있기 때문이다.
- 단점으로는 전체 색인 대상 데이터가 클 경우 작업 비용이 많이 들 수 있다.

#### (2) Incremental Indexing
- 색인된 데이터에 변경이 발생 했을 경우, 해당 데이터를 색인에 반영 한다.
- 해당 작업은 특정 크기나 주기로 나누어서 색인하도록 기능을 구현한다.
- 진행 방법은 두 가지정도로 생각해볼 수 있다.
  - (1) 현재 서비스 중인 인덱스에 직접 색인을 수행
  - (2) 별도 인덱스를 생성 후에 해당 인덱스에 저장하고, 현재 서비스 중인 인덱스에 걸려있는 Alias 에 맵핑, 중복 된 데이터는 병합 등의 처리를 한다.




#### 참고
https://fastcampus.co.kr/data_red_jhw
https://esbook.kimjmin.net/02-install/2.1
https://fdv.github.io/running-elasticsearch-fun-profit/003-about-lucene/003-about-lucene.html
https://esbook.kimjmin.net/06-text-analysis/6.1-indexing-data
