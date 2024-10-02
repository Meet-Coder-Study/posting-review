# [MySQL] 계층형 테이블 설계 및 쿼리 성능 분석

# 개요

쇼핑몰 사이드 프로젝트를 진행하던 중, 카테고리 테이블 설계에 대한 고민이 들었습니다.

상품의 카테고리는 다음과 같은 계층 구조를 같습니다.

<img width="1109" alt="%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA_2022-10-30_%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE_1 50 36_2" src="https://github.com/user-attachments/assets/940eb98f-f0b2-4689-8cac-65b853f235a7">

 가장 먼저 설계했던 테이블 구조는 테이블에 부모 키에 대한 컬럼을 추가해서 셀프조인 또는 계층형 쿼리를 이용하여 조회하는 것이었습니다. 하지만 더 나은 설계가 있을지 조사해서 정리해보았습니다.

계층 트리 구조의 depth와 데이터의 크기, 비즈니스 규칙에 따라서도 설계에 큰 영향을 주는 부분이라고 생각하여 다음과 같이 정했습니다.

- 상품 카테고리의 최대 depth : 4
- depth 당 카테고리 개수 : 20

**필요한 쿼리**

- 전체 카테고리 리스트 조회
- 하위 카테고리 리스트 조회
- 특정 카테고리의 상품 리스트 조회
- 특정 카테고리의 하위 카테고리 상품 리스트 조회
- 상품 리스트 조회시 상품의 카테고리 경로 조회

---

# 계층형 테이블 구조 종류

### 1. Adjacency List

부모의 PK를 컬럼으로 저장하여, 자기 자신을 재귀적으로 참조하는 구조입니다.

ID가 주어지면 부모나 자식을 조회하기 쉽고, 새로운 카테고리를 추가하기도 쉽습니다.

depth가 한정되어 있고 수정/삭제가 거의 일어나지 않는 경우 고려할 수 있을 것 같습니다.

재귀 쿼리를 지원하는 RDB를 사용하는 경우 조금 더 효율적으로 사용할 수 있습니다.

![Untitled](https://github.com/user-attachments/assets/f790a5cf-3414-40ea-9732-0df72aee65f5)

### 2. Nested Table

컬럼에 부모 PK를 저장하는게 아니라 자식에 대한 정보를 저장하는 방식입니다.

주로 두개의 컬럼을 저장하는데 lft 컬럼에는 모든 자식의 lft 컬럼보다 작은 값이, rgt 컬럼에는 모든 자식의 rgt 컬럼보다 큰 값이 들어갑니다.

1번 방식에 비해 조인 횟수를 줄이기 위해 사용합니다.

조회 쿼리의 성능이 좋은데, 특히 특정 ID의 하위 트리를 조회하기가 편합니다.

lgt, rgt를 다시 계산해야하기 때문에 추가하거나 수정할 때 자주 이루어지는 경우 좋은 방식이 아닙니다.

<img width="588" alt="%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA_2022-11-01_%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE_3 56 19" src="https://github.com/user-attachments/assets/faa1ab7c-0894-40d3-8fd5-58affb729cc9">

상품테이블

상품ID (PK)

상품명

카테고리 ID (FK)

카테고리테이블

카테고리 ID (PK)

1Depth

2Depth

3Depth

4Depth

### 3. Closure Table

데이터와 별개로 부모 자식 관계가 될 수 있는 모든 PK 쌍을 별도 테이블에 저장하는 방식입니다.

데이터 관리가 편하고, 조회 쿼리의 성능이 좋지만 저장 공간을 가장 많이 사용합니다.

![Untitled 1](https://github.com/user-attachments/assets/2c896db2-2407-48b2-a9fc-596ef6592a78)

### 4. Path Enumeration

디렉터리 구조처럼 특정 기호를 구분자로 사용하여 부모 키를 path에 저장하는 방식입니다.

LIKE 검색을 통해 서브트리를 조회할 수 있고 정렬하기가 편합니다.

조회하거나 데이터를 저장하는 쿼리가 간단하지만 정합성을 검증하기가 어렵습니다.

![Untitled 2](https://github.com/user-attachments/assets/07a6b107-ca90-47f2-b67b-bd138306c9ec)

### 테이블 생성 및 테스트 데이터 준비

```sql

DELIMITER $$
DROP PROCEDURE IF EXISTS categoryPathInsertLoop$$

CREATE PROCEDURE categoryPathInsertLoop()
BEGIN
DECLARE i INT DEFAULT 1;
DECLARE j INT DEFAULT 1;
DECLARE k INT DEFAULT 1;
DECLARE l INT DEFAULT 1;
DECLARE size INT DEFAULT 20;

WHILE i <= size DO
    INSERT INTO categories_path(ancestor, descendant, depth)
		VALUES(i, i, 1);
	SET j = 1;
    WHILE j <= size DO
		-- INSERT INTO category(id, name, parent_id) VALUES((size * i)+j,concat('카테고리',i,'-',j), i);
        INSERT INTO categories_path(ancestor, descendant, depth)
			VALUES((size * i)+j, (size * i)+j, 2);
				INSERT INTO categories_path(ancestor, descendant, depth)
			VALUES(i, (size * i)+j, 1);

		SET k = 1;
        WHILE k <= size DO
				INSERT INTO categories_path(ancestor, descendant, depth)
			VALUES(size*((size * i)+j)+k, size*((size * i)+j)+k, 3);
				INSERT INTO categories_path(ancestor, descendant, depth)
			VALUES((size * i)+j, size*((size * i)+j)+k, 2);
				INSERT INTO categories_path(ancestor, descendant, depth)
			VALUES(i, size*((size * i)+j)+k, 1);
				
			SET l = 1;
			WHILE l <= size DO
                -- INSERT INTO category(id, name, parent_id) VALUES((size*(size*((size * i)+j)+k))+l,concat('카테고리',i,'-',j,'-',k,'-',l), size*((size * i)+j) + k);

				INSERT INTO categories_path(ancestor, descendant, depth)
			VALUES((size*(size*((size * i)+j)+k))+l, (size*(size*((size * i)+j)+k))+l, 4);
				INSERT INTO categories_path(ancestor, descendant, depth)
			VALUES(size*((size * i)+j)+k, (size*(size*((size * i)+j)+k))+l, 3);
				INSERT INTO categories_path(ancestor, descendant, depth)
			VALUES((size * i)+j, (size*(size*((size * i)+j)+k))+l, 2);
				INSERT INTO categories_path(ancestor, descendant, depth)
			VALUES(i, (size*(size*((size * i)+j)+k))+l, 1);

				SET l = l + 1;
            END WHILE;
			SET k = k + 1;
		END WHILE;
		SET j = j + 1;
	END WHILE;
	SET i = i + 1;
END WHILE;
END$$
DELIMITER $$
CALL categoryPathInsertLoop;
DROP PROCEDURE IF EXISTS categoryPathInsertLoop;
```

# 쿼리 성능 비교

## 전체 카테고리 리스트 조회 쿼리

### 1. Adjacency List

쿼리문

```sql
WITH RECURSIVE cte AS
(
	SELECT 
		  id
        , cast(name AS CHAR(200)) AS name
        , cast(id AS CHAR(200)) AS path
        , 0 AS depth
    FROM category WHERE parent_id IS NULL
    UNION ALL
    SELECT 
		  c.id
		, CONCAT(REPEAT(' ', cte.depth+1), c.name)
        , CONCAT(cte.path, ", ", c.id)
        , cte.depth+1
	FROM category c JOIN cte ON
    cte.id=c.parent_id
)
SELECT
  cte.id
, cte.name
, cte.path
, cte.depth
FROM cte
;
```

EXPLAIN 결과

![Untitled 3](https://github.com/user-attachments/assets/98b7a6be-4bcb-4c68-a8e0-49a3883d7f4e)

EXPLAIN ANALYZE 결과

```sql
-> Table scan on cte  (cost=196.69..204.50 rows=426) (actual time=451.808..478.956 rows=168420 loops=1)
    -> Materialize recursive CTE cte  (cost=196.67..196.67 rows=426) (actual time=451.796..451.796 rows=168420 loops=1)
        -> Index lookup on category using parent_id (parent_id=NULL), with index condition: (category.parent_id is null)  (cost=7.00 rows=20) (actual time=0.382..0.391 rows=20 loops=1)
        -> Repeat until convergence
            -> Nested loop inner join  (cost=147.02 rows=406) (actual time=0.060..162.584 rows=84200 loops=2)
                -> Filter: (cte.id is not null)  (cost=4.75 rows=20) (actual time=0.009..14.551 rows=84210 loops=2)
                    -> Scan new records on cte  (cost=4.75 rows=20) (actual time=0.003..10.632 rows=84210 loops=2)
                -> Index lookup on c using parent_id (parent_id=cte.id)  (cost=5.18 rows=20) (actual time=0.002..0.002 rows=1 loops=168420)
```

### 2. Closure Table

쿼리문

```sql
SELECT
	  a.id
	, a.name
    , b.depth
FROM
categories a
JOIN categories_path b
ON a.id = b.ancestor
AND b.descendant = b.ancestor
ORDER BY name
```

EXPLAIN 결과

![Untitled 4](https://github.com/user-attachments/assets/e85e95fa-e7b3-4593-aaf9-654692125df3)

EXPLAIN ANALYZE 결과

```sql
-> Nested loop inner join  (cost=75732.65 rows=167992) (actual time=110.744..220.199 rows=168420 loops=1)
    -> Sort: a.`name`  (cost=16935.45 rows=167992) (actual time=110.715..118.124 rows=168420 loops=1)
        -> Table scan on a  (cost=16935.45 rows=167992) (actual time=0.110..26.652 rows=168420 loops=1)
    -> Single-row index lookup on b using PRIMARY (ancestor=a.id, descendant=a.id)  (cost=0.25 rows=1) (actual time=0.000..0.000 rows=1 loops=168420)
```

## 상품 리스트 조회시 상품마다 카테고리 경로 조회

### 1. Adjacency List

쿼리문

```sql
WITH RECURSIVE cte AS
(
	SELECT 
		  id
        , cast(name AS CHAR(200)) AS name
        , cast(id AS CHAR(200)) AS path
        , 1 AS depth
    FROM category WHERE parent_id IS NULL
    UNION ALL
    SELECT 
		  c.id
		, CONCAT(REPEAT(' ', cte.depth+1), c.name)
        , CONCAT(cte.path, ", ", c.id) AS path
        , cte.depth+1
	FROM category c JOIN cte ON
    cte.id=c.parent_id
)
SELECT
	  p.id
    , p.name
    , cte.path
FROM product p, cte
WHERE p.category_id = cte.id

LIMIT 1000;
```

EXPLAIN 결과

![Untitled 5](https://github.com/user-attachments/assets/81a37d4b-7366-43bc-a415-f4ded7891930)

EXPLAIN ANALYZE 결과

```sql
-> Limit: 1000 row(s)  (cost=3839.30 rows=1000) (actual time=474.293..476.355 rows=1000 loops=1)
    -> Nested loop inner join  (cost=3839.30 rows=4240) (actual time=474.286..476.306 rows=1000 loops=1)
        -> Filter: (cte.id is not null)  (cost=196.33..50.43 rows=426) (actual time=467.595..469.517 rows=8520 loops=1)
            -> Table scan on cte  (cost=196.69..204.50 rows=426) (actual time=467.578..469.076 rows=8520 loops=1)
                -> Materialize recursive CTE cte  (cost=196.67..196.67 rows=426) (actual time=467.569..467.569 rows=168420 loops=1)
                    -> Index lookup on category using parent_id (parent_id=NULL), with index condition: (category.parent_id is null)  (cost=7.00 rows=20) (actual time=2.960..2.969 rows=20 loops=1)
                    -> Repeat until convergence
                        -> Nested loop inner join  (cost=147.02 rows=406) (actual time=0.286..168.330 rows=84200 loops=2)
                            -> Filter: (cte.id is not null)  (cost=4.75 rows=20) (actual time=0.010..14.915 rows=84210 loops=2)
                                -> Scan new records on cte  (cost=4.75 rows=20) (actual time=0.003..10.852 rows=84210 loops=2)
                            -> Index lookup on c using parent_id (parent_id=cte.id)  (cost=5.18 rows=20) (actual time=0.002..0.002 rows=1 loops=168420)
        -> Index lookup on p using category_id (category_id=cte.id)  (cost=7.90 rows=10) (actual time=0.001..0.001 rows=0 loops=8520)
```

### 2. Closure Table

쿼리문

```sql
SELECT
	  p.id
    , p.name
    , c1.name
FROM product p
JOIN categories c1
ON p.category_id = c1.id
LEFT JOIN categories_path c2
ON p.category_id = c2.descendant
GROUP BY p.id
LIMIT 1000;
```

EXPLAIN 결과

![Untitled 6](https://github.com/user-attachments/assets/47429728-597f-45f2-8b81-38cb140c5e6a)

EXPLAIN ANALYZE 결과

```sql
-> Limit: 1000 row(s)  (cost=787225.56 rows=1000) (actual time=0.770..10.858 rows=1000 loops=1)
    -> Group (no aggregates)  (cost=787225.56 rows=1000) (actual time=0.757..10.746 rows=1000 loops=1)
        -> Nested loop left join  (cost=787125.61 rows=1000) (actual time=0.729..9.969 rows=4001 loops=1)
            -> Nested loop inner join  (cost=392663.80 rows=250) (actual time=0.617..4.904 rows=1001 loops=1)
                -> Filter: (p.category_id is not null)  (cost=0.55 rows=250) (actual time=0.432..1.173 rows=1001 loops=1)
                    -> Index scan on p using PRIMARY  (cost=0.55 rows=250) (actual time=0.420..1.036 rows=1001 loops=1)
                -> Single-row index lookup on c1 using PRIMARY (id=p.category_id)  (cost=0.25 rows=1) (actual time=0.003..0.003 rows=1 loops=1001)
            -> Covering index lookup on c2 using fk_descendant_idx (descendant=p.category_id)  (cost=0.25 rows=4) (actual time=0.003..0.004 rows=4 loops=1001)
```

# 참조

[https://ahnndroid.wordpress.com/2015/05/08/안티-패턴-2-순진한-트리-naive-trees/](https://ahnndroid.wordpress.com/2015/05/08/%EC%95%88%ED%8B%B0-%ED%8C%A8%ED%84%B4-2-%EC%88%9C%EC%A7%84%ED%95%9C-%ED%8A%B8%EB%A6%AC-naive-trees/)

[https://blog.yevgnenll.me/posts/save-tree-in-mysql-closure-pattern-hierarchy-structure](https://blog.yevgnenll.me/posts/save-tree-in-mysql-closure-pattern-hierarchy-structure)
