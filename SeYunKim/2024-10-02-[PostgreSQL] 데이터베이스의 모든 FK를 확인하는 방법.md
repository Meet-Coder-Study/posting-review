# 서론

- 최근 회사에서 하나의 DB를 두개의 DB로 분리하는 멀티 DB의 적용을 진행하고 있습니다.
- 그 작업을 진행하면서 가장 먼저 한 작업한 일은 각각의 DB에 들어가 있는 테이블들이 FK로 연결되어 있는 부분을 체크하고 FK를 해제해야 하는 것을 해제 해야 하는 일이였습니다.
    - 1번 DB에 A테이블, 2번 DB에 B 테이블이 있다고 했을때 A테이블에 B테이블의 FK가 있을 경우 2번 데이터베이스로 이전을 하지 못하며, 사실상 FK자체를 적용할수가 없다고 생각해주시면 좋을거 같습니다.

# FK(Foreign Key)란?

- 외래키라고 부르며, RDBMS에서 관계를 지정할때 사용합니다.
- FK를 사용하는 이유는 FK와 PK간의 일관성을 유지하기 위함입니다.
- 외래키 설정 방법은 아래와 같습니다.
    
    ```sql
    ALTER TABLE child_table
    ADD CONSTRAINT constraint_name
    FOREIGN KEY (column1, column2, ...)
    REFERENCES parent_table (column1, column2, ...);
    
    ```
    
    여기서 `child_table`은 외래 키를 추가하려는 테이블, `parent_table`은 참조되는 테이블입니다.
    
- 외래키는 무결성을 유지하기 위해 여러가지 옵션들이 있습니다.
    - `ON DELETE CASCADE`: 참조된 행이 삭제될 때 참조하는 행도 함께 삭제됩니다.
    - `ON DELETE SET NULL`: 참조된 행이 삭제될 때 참조하는 행의 외래 키 값이 NULL로 설정됩니다.
    - `ON UPDATE CASCADE`: 참조된 행의 키 값이 변경될 때 참조하는 행의 외래 키 값도 함께 변경됩니다.
    
- cf) github에서는 FK를 사용하지 않는다고 합니다. (https://news.hada.io/topic?id=878) 이번 멀티 DB를 하면서 온라인 스키마 이관에 문제가 생긴다는 부분에서 공감을 하게 되었습니다.
    - 샤딩을 어렵게 합니다
    - 성능을 저하시키고
    - 온라인 스키마 이관 에도 문제가 됩니다.

# SQL로 FK 조회하는 법

```sql
SELECT
    tc.constraint_name,
    tc.table_name AS child_table,
    kcu.column_name AS child_column,
    ccu.table_name AS parent_table,
    ccu.column_name AS parent_column
FROM
    information_schema.table_constraints AS tc
JOIN
    information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN
    information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
```

- `constraint_name`: 외래 키 제약 조건의 이름.
- `child_table`: 외래 키를 포함하는 자식 테이블의 이름.
- `child_column`: 자식 테이블 내의 외래 키 컬럼 이름.
- `parent_table`: 외래 키에 의해 참조되는 부모 테이블의 이름.
- `parent_column`: 부모 테이블 내에서 참조되는 컬럼의 이름.

- 위의 쿼리를 통해 FK가 걸려있는 부분들을 알수 있었습니다.
- 또한 일단 저희는 모든 FK를 제거하기 보단, DB를 분리할때 문제가 되는 서로 다른 DB에 있는 테이블들이 FK로 되어 있는 경우에만 하였습니다.
- 그래서 조건을 좀더 처리하였습니다.

```jsx
...
AND child_table IN ('..') # 외래 키를 포함하는 테이블중에 옮길려고 하는 테이블 or 옮기지 않을 테이블 (2번 조회가 필요)
AND parent_table IN ('..') # 외래 키를 포함하는 테이블중에 옮길려고 하는 테이블 or 옮기지 않을 테이블 (2번 조회가 필요) 
```

- 위와 같은 조건을 추가해 2번을 추가해 확실하게 필요한 테이블을 조회하였습니다.

# 결론

- 현재 회사에서는 특별한 경험을 하는 중입니다. 원래 존재하는 데이터베이스를 두개의 데이터베이스로 분리하는 작업을 하면서, FK에 대해서 공부하게 되었습니다.
- 또한 FK를 제거함으로써 애플리케이션에서 위와 같은 제약조건을 잘 설정해야 한다는것이 중요합니다.
    - 현재 회사에서는 ruby on rails를 사용함으로써 rails에서는 모델 연관관계 설정에서 `dependant`를 이용해 제약조건을 걸어야 합니다. 놓치는게 없는지 확인이 필요합니다.
    - Spring JPA에서는 모델 연관관계 설정에서 `cascade` **** 를 통해 설정할수 있습니다. 또한 이벤트 리스너를 통해서도 가능합니다.
- 마지막으로 해당 쿼리를 통해 FK를 조회해서 꾸준히 확인하는것도 중요하다고 생각합니다. 이걸 확인할 수 있는 어드민 같은게 있으면 좋을거 같기도 하네요.
