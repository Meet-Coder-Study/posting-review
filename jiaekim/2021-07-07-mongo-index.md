# MongoDB 인덱스 설계하기
## 1. Index란?
도서관의 책들이 정리되어 있을 때 700번대에는 어떤 책들이 있고, 어떤 순서로 정렬되어 있는지를 알고 책의 번호만을 가지고 빠르게 해당 책에 접근할 수 있는 것과 같이 `인덱스`는 어떤 정보가 어디에 있는지 빠르게 접근할 수 있는 `색인`과 같은 역할을 한다.
만약 책에 번호가 없다면 우리는 도서관의 모든 책들을 전부 찾아봐야 하듯, MongoDB에 index가 없다면 우리는 데이터베이스 내의 모든 Document를 하나하나 찾아야 한다.

즉, 이와 같이 MongoDB의 인덱스를 작성하기 위해서는 내가 가진 데이터들을 효과적으로 검색하기 위해 `어떤 키들을 어떤 순서로 정렬해두어야 할지`를 생각해야 한다.

## 2. Index 설계 전략
### 2.1 실행할 쿼리 종류를 고려하여 인덱스를 생성한다.
  - 실행할 쿼리들을 고려해서 인덱스를 만들고, 효율적인 쿼리를 위해 인덱스 필드의 순서 및 정렬 순서를 지정한다.
### 2.2 읽기 비용이 많이 드는지, 쓰기 비용이 많이 드는지 고려한다.
  - 쿼리 성능을 위해서는 인덱스가 반드시 필요하지만, 인덱스에는 유지 비용이 들어간다. 도큐먼트를 생성, 수정, 삭제할때마다, 인덱스도 새로운 도큐먼트를 포함하도록 수정해야 한다. 따라서 쓰기가 발생하면 이런 추가적인 비용이 발생하므로 읽기 위주의 어플리케이션인지 확인하여 인덱스 유지 비용을 상쇄할 수 있는지를 고려한다.
### 2.3 메모리 크기를 고려해야 한다.
  - 인덱스를 생성하면 그만큼 실제 데이터와 별개로 메모리 공간을 사용하게 되므로 인덱스를 많이 만들면 많은 메모리를 사용하게 된다. 만약 작업중인 데이터를 RAM에서 모두 처리하지 못하면 쿼리 성능 저하를 일으킬 수 있다.

이와 같이 모두 고려해서 하는 것이 좋지만, 가장 좋은 방법은 실제 상용에서 돌릴 데이터와 비슷한 데이터 셋을 만들어두고, 프로파일링을 통해 어떤 구성이 성능적으로 좋은지 확인하는 것이다.
만약 사용되지 않는 인덱스가 있다면 이 과정에서 삭제한다.

## 3. MongoDB 핵심 Index 
### 3.1 Single Key Index (단일 인덱스)
![Single Index](https://docs.mongodb.com/manual/images/index-ascending.bakedsvg.svg)

```js
db.records.createIndex( { score: 1 } )
```

```js
db.records.find( { score: 2 } )
db.records.find( { score: { $gt: 10 } } )
```
- 쿼리에서 단 하나의 key만 사용한다면 단일 키 인덱스를 사용한다.
- 1: 오름차순, -1: 내림차순
- 일렬로 나열되어 있기 때문에 찾는 순서는 중요하지 않다.

### 3.2 Compound Index (복합 인덱스)
![Compound Index](https://docs.mongodb.com/manual/images/index-compound-key.bakedsvg.svg)

```js
db.collection.createIndex({ userid: 1, score: -1 })
```
```js
db.collection.find( { userid: "ca2", score: { $gt: 30 } } )
```
- 쿼리에서 검색에 여러 키가 사용되었다면 이 인덱스 타입으로 정의한다.
- 복합 인덱스가 여러 키를 지정했다고 해서, 각각 다른 쿼리에서 각각의 키로 검색할 수 있는 구조가 아니라, 한 쌍으로 있다고 생각해야 한다.
- 위 예시에서는 userid는 원하는대로 오름차순을 하고, score는 같은 userid일 경우 내림차순으로 정렬 되어있다. 

## 4. MongoDB 인덱스의 종류

### 4.1 Unique Index (고유 인덱스)
```js
db.collection.createIndex({username: 1}, {unique: true})
```
- 특정 필드가 unique해야 한다는 제약조건을 걸 때 사용

### 4.2 Hashed Index (해시 인덱스)
```js
db.collection.createIndex({recipe_name: 'hased'})
```
- 해시 된 샤드 키를 사용하여 샤딩 컬렉션을 지원한다. 필드의 해시 인덱스를 샤딩된 클러스터에서 데이터를 분할하기 위한 샤딩키로 사용한다는 뜻.
- 해시 된 샤드 키를 사용해서 컬렉션을 샤딩하면 데이터를 더 고르게 분산시킬 수 있다.
- 다중 키 해시 인덱스는 허용되지 않는다.

### 4.3 Sparse Index (희소 인덱스)
```js
db.collection.createIndex({user_id:1}, {sparse: true, unique: false})
```
- null 값을 가질 수 있는 엔트리가 있을 때, null이 아닌 도큐먼트를 대상으로 인덱스를 걸 수 있다.
- 예시로, 익명으로만 된 상품평에 대한 질의를 거의(혹은 전혀) 하지 않는다면 user_id에 대해 희소 인덱스를 생성할 수 있다.
  
## 참고 자료
- https://docs.mongodb.com/manual/indexes/
- https://blog.ull.im/engineering/2019/04/05/mongodb-indexing-strategy.html
- MongoDB In Action