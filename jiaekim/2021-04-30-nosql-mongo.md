# NoSQL

## NoSQL의 등장 배경
예전의 컴퓨팅 시스템은 기업의 업무를 자동화하고 효율화하는 데 그 목적이 있었다. 그래서 기업의 복잡한 데이터를 저장하고 그 데이터 간의 관계를 저장하고 분석하는 데 최적화되어 있었다. 기업의 업무 시스템은 해당 기업의 생산과 판매를 목적으로 하였고, 거기에서 생성되는 데이터의 양은 한계를 가지고 있었다.

그러나 최근에는 인터넷의 발전과 함께 SNS나 다양한 서비스 시스템이 전 세계 사람들을 대상으로 하는 대규모의 데이터를 생산해내며 데이터의 패러다임이 한정된 규모의 복잡성이 높은 데이터에서 단순한 대량의 데이터로 넘어가기 시작했다. 이는 기존의 데이터의 저장 시스템으로는 해결할 수 없는 여러 가지 한계를 일으켰고 결국에는 새로운 형태의 데이터 저장 기술을 요구하여 NoSQL이 나오게 되었다.

## NoSQL의 특징

### 1. 데이터 간의 관계를 정의하지 않는다.
- RDBMS가 관계형 데이터베이스로 데이터의 관계를 외래 키 등으로 정의하고 이를 이용하여 조인 등의 관계형 연산을 한다고 하면, NoSQL은 데이터 간의 관계를 정의하지 않는다. 데이터 테이블은 그냥 하나의 테이블이며, 각 테이블 간의 관계를 정의하지도 않고 일반적으로 테이블 간의 조인도 불가능하다.

### 2. RDBMS에 비해 훨씬 더 대용량의 데이터를 저장할 수 있음.
- NoSQL이 나온 계기 자체가 대용량 데이터에서의 RDBMS의 복잡도와 용량 한계를 극복하기 위한 만큼, 페타 바이트 급의 대용량 데이터를 저장할 수 있다.


### 3. 분산형 구조
- NoSQL은 기존의 RDBMS와는 다르게 하나의 고성능 머신에 데이터를 저장하는 것이 아니라, 일반적인 서버 수십 대를 연결하여 데이터를 저장 및 처리하는 구조를 갖는다. 즉 분산형 구조를 통해서 데이터를 여러 대의 서버에 분산하여 저장하고, 분산 시에 데이터를 상호 복제 하여 특정 서버가 장애가 났을 때에도 데이터 유실이나 서비스 중지가 없는 형태의 구조이다.

### 4. 고정되지 않은 테이블 스키마
`RDBMS에서 간단한 테이블 구조 예시`
|||
| - | - | - |
| ID: int | 이름: varchar(255) | 주소: varchar(255) |

- RDBMS와는 다르게 테이블 스키마가 유동적이다. 예를 들어 RDBMS의 경우 테이블이 다음과 같은 형태로 되어 있을 때 해당 테이블은 반드시 숫자, 이름, 문자열, 주소 문자열만 들어갈 수 있다.

`NoSQL에서 간단한 테이블 구조 예시`
|||||
| - | - | - | - | - |
| ID: int | 이름: varchar(255) | 
| ID: int | 이름: varchar(255) | 주소: varchar(255) |
| ID: int | 이름: varchar(255) | 성별: char(1) |
| ID: int | 영문이름: varchar(255) | 국적: varchar(10) | 전화: varchar(50) |
| ID: int | 영문이름: varchar(255) |

위와 같이 ID로 사용하는 키 부분에만 타입이 동일하고 생략되지 않는 (Mandatory) 필드로 지정하면 값이 해당하는 칼럼은 어떤 타입이든 어떤 이름이 오든 모두 허용된다.

## NoSQL의 분류
### 1. Key/Value Store
- 가장 기본적인 패턴으로 대부분의 NoSQL에서 기본적으로 Key/Value 개념을 지원한다. Key/Value Store란 고유한 키에 하나의 값을 가진 형태를 이야기한다. Put(Key, Value), Value := get(Key) 형태의 API로 접근한다.
- `Put(Key, Value), Value := get(Key)` 형태의 API로 접근
- Value는 String이나 Integer같은 Primitive 타입이 될 수도 있지만, 조금 더 확장된 개념으로 Key 안에 (Column, Value) 조합으로 된 여러 개의 필드를 갖는 Colomn Family 개념도 있다.
- 예를 들어 사용자 이름을 키로 두고, 성별, 주소, 나이들은 각각의 칼럼이 될 수 있다.
- 대표적인 제품으로는 Oracle의 Coherence, Redis 등이 있다.
### 2. Ordered Key/Value Store
- Key/Value Store의 확장된 형태로, Key/Value Store와 데이터 저장 방식은 동일하나 데이터가 내부적으로 키를 순서로 정렬해서 저장한다.
- NoSQL은 RDBMS의 ORDER BY와 같은 기능을 제공하지 않기 때문에 결과 값을 업데이트 날짜 등으로 정렬해서 보여주는 것은 Ordered Key/Value Store가 절대적으로 유리하다.
- 대표적인 제품으로는 아파치의 HBase, Coassandra 등이 있다.
### 3. Document Key/Value Store
- Key/Value Store의 확장된 형태로, 기본적으로 Key/Value Store이다. 키에 해당하는 값 필드에 데이터를 저장하는 구조는 같으나, 저장하는 값의 데이터 타입으로 Document(XML, JSON, YAML 등의 구조화된 데이터 타입) 타입을 사용한다.
- Document Store 기반의 NOSQL은 제품에 따라 다르기는 하지만 대부분 추가적인 기능 (Sorting, Join, Grouping 등)을 제공한다. 
- 대표적인 제품으로는 MongoDB, CouchDB, Riak 등이 있다.

## NoSQL(MongoDB) vs RDBMS 차이
| NoSQL(MongoDB) | RDBMS |
| - | - |
| 데이터베이스 (Database) | 데이터베이스 (Database) |
| 컬렉션 (Collection) | 테이블 (Table) |
| 도큐먼트 (Document) | 레코드 (Record OR Row) |
| 필드 (Field) | 컬럼 (Column) |
| 인덱스 (Index) | 인덱스 (Index) |
| 쿼리의 결과로 "커서(Cursor)" 반환 | 쿼리의 결과로 "레코드(Record)" 반환 |

## 참고자료
  - [DB - MongoDB란?](https://coding-start.tistory.com/273)
  - 조대협의 서버사이드 - 대용량 아키텍처와 성능튜닝 책 - NoSQL