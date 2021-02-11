# SQL의 DDL, DML, DCL, TCL

## 서론

- SQL(Structured Query Language)란 구조적 질의 언어라는 의미로 질의 언어를 통해 데이터베이스를 제어, 관리 할 수 있다.
- SQL은 DDL, DML, DCL로 나눌 수 있습니다.
- 각 언어의 특징을 살펴보도록 하겠습니다.
- 해당 모든 테스트는 MySQL 8.0.17 환경에서 진행합니다.

## DDL(Data Definition Language) - 데이터 정의 언어

- 데이터베이스를 정의하는 언어로 데이터베이스를 생성, 수정, 삭제 등의 역할을 하는 언어

### CREATE

- 데이터베이스, 테이블을 만드는 역할
- 데이터베이스 생성

    ```sql
    CREATE database test
    ```

  ![sql_purpose_kinds-1](https://github.com/ksy90101/TIL/blob/master/database/image/sql_purpose_kinds-1.png?raw=true)

- 테이블 생성

    ```sql
    CREATE table user (
    	user_id int not null,
        name char(16) not null,
        email char(16) not null,
        primary key(user_id)
    );
    ```

  ![sql_purpose_kinds-2](https://github.com/ksy90101/TIL/blob/master/database/image/sql_purpose_kinds-2.png?raw=true)

### ALTER

- 테이블을 수정하는 역할
- 테이블의 컬럼을 추가하는 SQL

    ```sql
    ALTER TABLE user ADD age int;
    ```

  ![sql_purpose_kinds-3](https://github.com/ksy90101/TIL/blob/master/database/image/sql_purpose_kinds-3.png?raw=true)

### DROP

- 데이터베이스, 테이블을 삭제하는 역할
- 테이블 삭제하는 SQL

    ```sql
    DROP TABLE user;
    ```

  ![sql_purpose_kinds-4](https://github.com/ksy90101/TIL/blob/master/database/image/sql_purpose_kinds-4.png?raw=true)

### TRUNCATE

- 테이블을 초기화하는 역할

## DML(Data Manipulation Language) - 데이터 조작 언어

- 정의된 데이터베이스에 입력된 레코드를 삽입,조회,수정,삭제를 하는 언어

### SELECT

- 레코드를 조회하는 역할
- 레코드 전체 조회 SQL

    ```sql
    SELECT * FROM user
    ```

  ![sql_purpose_kinds-2](https://github.com/ksy90101/TIL/blob/master/database/image/sql_purpose_kinds-2.png?raw=true)

### INSERT

- 레코드를 삽입하는 역할
- 한개의 레코드를 삽입하는 SQL

    ```sql
    INSERT INTO user(user_id, name, email) VALUES (1, 'rutgo', 'ksy90101@gmail.com');
    ```

  ![sql_purpose_kinds-5](https://github.com/ksy90101/TIL/blob/master/database/image/sql_purpose_kinds-5.png?raw=true)

### UPDATE

- 레코드를 수정하는 역할
- email을 변경하는 SQL

    ```sql
    UPDATE user 
    SET email='ksy90101@naver.com'
    WHERE user_id = 1;
    ```

  ![sql_purpose_kinds-6](https://github.com/ksy90101/TIL/blob/master/database/image/sql_purpose_kinds-6.png?raw=true)

### DELETE

- 레코드를 삭제하는 역할

    ```sql
    DELETE FROM user
    WHERE user_id = 1;
    ```

  ![sql_purpose_kinds-7](https://github.com/ksy90101/TIL/blob/master/database/image/sql_purpose_kinds-7.png?raw=true)

## DCL(Data Control Language) - 데이터 제어 언어

- 데이터베이스에 접근하거나 객체에 권한을 주는 역할을 하는 언어

### GRANT

- 데이터베이스 사용자에게 권한을 주는 역할

### REVOKE

- 데이터베이스 사용자에게 권한을 박탈하는 역할

### COMMIT

- 트랜잭션의 작업이 정상적이라면 반영하는 역할

### ROLLBACK

- 트랜잭션 작업이 비정상적이라면 다시 되돌리는 역할

### SET TRANSACTION

- 트랜잭션 모드 설정하는 역할
- 예를들면 트랜잭션 격리 수준등을 설정한다

### BEGIN

- 트랜잭션 시삭

### SAVEPOINT

- 저장 지점을 설정하는 것으로 임시 저장이라고 생각하면 좋을거 같습니다.

### LOCK

- 데이터베이스의 리소스 접근 제한을 하기 위한 명령어

## TCL(Transaction Control Language)

- DCL에서 COMMIT과 ROLLBACK, SAVEPONT을 지칭한다.
- 즉, 트랜잭션을 제어하는 언어이다.

## 결론

- DDL을 통해 데이터베이스, 테이블을 생성,변경,제거를 하고
- DML을 통해 레코드를 생성,변경,조회,제거를 하고
- DCL을 통해 데이터베이스의 접근 권한이나 작업 결과를 반영, 리셋을 진행한다.
