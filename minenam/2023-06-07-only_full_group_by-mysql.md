# only_full_group_by 모드 - MySQL 트러블슈팅

> 기본 환경: docker image mysql:latest

## 문제

아래와 같은 쿼리문 실행

```sql
SELECT cs.clientId, cs.clientName, cg.groupId, g.groupName
    FROM Clients AS cs
    LEFT OUTER JOIN ClientGroups cg ON cs.clientId = cg.clientId
    LEFT OUTER JOIN `Groups` g ON g.groupId = cg.groupId GROUP BY cs.clientId
```

에러 메시지 발생

```bash
[42000][1055] Expression #3 of SELECT list is not in GROUP BY clause and contains nonaggregated column 'sendingo_test.cg.groupId' which is not functionally dependent on columns in GROUP BY clause; this is incompatible with sql_mode=only_full_group_by
```

## 시도 및 해결

### sql_mode 조회

```sql
SELECT @@sql_mode;

SELECT @@session.sql_mode;

-- 기본 : ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
```

### sql_mode 변경

- `ONLY_FULL_GROUP_BY` 제외한 값으로 설정

```sql
-- 모든 설정 초기화
SET GLOBAL sql_mode ='';
SET SESSION sql_mode = '';

-- ONLY_FULL_GROUP_BY 를 제외하고 설정
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
```


## 알게 된 점
### **SQL `only_full_group_by` 모드**

- MySQL에서 사용되는 SQL_MODE
- GROUP BY 절에서 선택되지 않은 컬럼이나 함수를 사용할 때 발생하는 에러를 방지함

만약 `only_full_group_by` 모드가 설정되어 있지 않으면, 위에서 말한 에러가 발생하지 않음. 
하지만 해당 모드를 해제하면 데이터베이스에서 잘못된 결과를 출력할 수 있기 때문에, 데이터 일관성에 문제가 생길 수 있음.

예시:
```sql
SELECT column1, column2, AVG(column3)
FROM table1
GROUP BY column1
```

위 SQL 쿼리에서 column2는 GROUP BY 절에 넣지 않은 컬럼

`only_full_group_by` 모드가 설정되어 있지 않은 경우, 문제 없이 실행되나 column2는 column1 별로 다른 값을 가질 수 있으므로, 결과가 불일치할 가능성이 높음

따라서, `only_full_group_by` 모드는 데이터 일관성을 유지하기 위해 꼭 설정해주는 것이 좋음.

설정 방법:

```sql
SET GLOBAL sql_mode=(SELECT CONCAT(@@sql_mode, ',ONLY_FULL_GROUP_BY'));
```


## 참고자료
- [only_full_group_by | MySQL :: MySQL 5.7 Reference Manual :: 12.20.3 MySQL Handling of GROUP BY](https://dev.mysql.com/doc/refman/5.7/en/group-by-handling.html)
- [MySQL :: MySQL 5.7 Reference Manual :: 5.1.10 Server SQL Modes](https://dev.mysql.com/doc/refman/5.7/en/sql-mode.html#sql-mode-setting)
- [유사 문제 해결 사례](https://github.com/laradock/laradock/issues/218)
   
