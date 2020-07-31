# 대용량 테이블에 컬럼 추가하기

### Table of Contents

- [대용량 테이블에 컬럼 추가하기](#대용량-테이블에-컬럼-추가하기)
    - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [문제 상황](#문제-상황)
  - [DB 상태를 보자](#db-상태를-보자)
  - [alter table을 대체하자](#alter-table을-대체하자)
  - [문제 해결](#문제-해결)

## Overview

이때까지의 나는 RDB에서 ddl을 다루는 일은 지극히 개인 프로젝트, 학습용으로 사용한 것이 전부다. 이때 데이터는 많아봐야 1,000개가 안될 것이다.
회사에서도 운영환경에서 ddl은 DBA분들의 권한이었고 개발환경에서도 이미 기본적인 것들이 갖춰져 있었기 때문에 크게 건드릴 것이 없었다. 즉, 내가 이때까지 ddl을 사용한 환경은 많아봐야 1,000개 정도의 데이터인 것이다.

그런 나에게 개발환경에서 컬럼을 추가해야할 일이 생겼다. 그것도 2,000만개 이상의 데이터가 있는 테이블에서!

> 사실 2천만건 이상의 테이블도 많지만... 제가 처음 다뤄본거라 ㅎㅎ

## 문제 상황

흔히 데이터베이스, SQL을 공부할 때 테이블의 스키마를 바꾸는 작업은 `alter`를 통해 한다고 배웠다. 나 또한 `alter table` 명령을 통해서 컬럼을 추가하려고 시도했다.

> 참고
>
> 참고로 위 작업의 환경은 AWS Aurora 2.07 `mysql 5.7`이며 db.t3.small을 사용하였습니다.

```sql
alter table hello add column tinyint(1);
``` 

위와 같이 ddl을 사용하면 간단히 컬럼이 추가될 줄 알았다. 지금껏 그래왔듯이....

하지만 나의 workbench는 다음과 같이 응답한다.

```
Error Code: 2013. Lost connection to MySQL server during query
```

이런 메세지와 함께 30초내로 ddl이 종료했었다. 처음에는 workbench의 타임아웃 설정때문에 이렇게 쿼리가 실패하는 줄 알았다.

따라서 [타임아웃 시간을 바꿔주는 설정](https://stackoverflow.com/questions/10563619/error-code-2013-lost-connection-to-mysql-server-during-query)으로 타임아웃을 바꿔줬다.

그러자 다음과 같은 에러를 뿜었다.

```
Error Code: 2013. Lost connection to MySQL server during query
```

그렇다! 똑같이 에러가 나타나고 있었다. 다만, 실행 시간이 ddl을 실행할 때마다 다르게 나타났다. 이 때문에 타임아웃 문제는 아니라고 생각했다.

## DB 상태를 보자

계속 일정한 시간이 아니라 들쑥날쑥하게 쿼리가 실행되고 실패하다보나 DB 인프라에 문제가 있는거라 생각했다.

따라서 AWS 콘솔을 키고 RDS 상태를 확인한 결과, 컬럼을 추가하는 컬럼을 사용할 때마다 CPU가 100%씩 사용하는 것을 확인할 수 있었다. 그리고 메모리 사용량도 계속 늘어 결국 RDS 인스턴스가 셧다운이 되어버린 것이다. 셧다운이 되는 바람에 mysql 서버에서 응답을 내려주지 못해 `Error Code: 2013. Lost connection to MySQL server during query` 에러가 나타난 것이다.

> alter table을 사용했을 때 메모리를 소모하는 이유는 확인해볼 것.

## alter table을 대체하자

사실 rds 인스턴스의 성능이 낮았기 때문에 인스턴스 스팩을 늘려서 처리해도 
따라서 다른 해결책을 찾을 필요가 생겼다. 열심히 서치한 결과 다음과 같은 해결책을 찾을 수 있었다.

1. aurora fast ddl

[참고](https://docs.aws.amazon.com/ko_kr/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Managing.FastDDL.html)

`alter table`을 사용하는 db가 aws aurora를 사용하고 있기에 고려할 수 있는 선택지였다. 테이블 복사하거나 다른 dml에 영향을 주지 않고 table 스키마를 변경할 수 있도록 지원하는 기능이다.

다만, 위 기능은 `Aurora Lab mode`를 활성화해야 사용가능하다. 개발 환경이라 사용해도 될 법 햇지만 뭔가 찝찝해서 최후순위로 고려하게 되었다.

2. `select insert`

[https://jojoldu.tistory.com/244](https://jojoldu.tistory.com/244) 이 링크에 나와있는 것처럼 스키마를 변경할 테이블을 복사하여 진행하는 방법도 있다.

복사테이블 생성 -> 복사 테이블에 원본 테이블 데이터를 복사 -> 테이블 이름 변경의 순으로 데이블에 스키마를 변경하는 방법이다.

또한 작업하려는 테이블에 FK가 없었고 별도 설치 없이 SQL 만으로 간단하게 처리 할 수 있었기 때문에 위 방법을 최우선순위로 두었다.

3. pt-online-schema-change

[https://jojoldu.tistory.com/358](https://jojoldu.tistory.com/358)

찾다보니 Percona의 pt-online-schema-change 스크립트도 있다는 걸 알게되었다. 이 방법은 지정한 chunkSize만큼 또는 unique key 기준으로 데이터를 끊어서 원본 데이터 전체를 신규 테이블로 복사한다. 때문에 CPU 부하나 메모리 부하가 덜해서 적용할 수 있을 거라 생각했다.

단, pt-online-schema-change 스크립트를 설치해야한다는 번거로움이 있어 2번 방법이 실패한 경우에 사용해보기로 하였다.

## 문제 해결

그렇게 신규 복사 테이블을 만들고 `select insert`를 통해 데이터를 복사하였다.

이때 CPU를 90% 가까이 사용하였지만 문제없이 테이블 스키마 변경이 완료되었다. `약 10~20분 정도 소요`

db에 대해 더 공부해야겠지만 ddl을 사용했을때 왜 이렇게 메모리, CPU를 많이 소모하면서 실패하는지와 dml을 사용하였을 때는 왜 성공했는지 둘의 동작 방식 차이를 학습할 필요성을 느꼈다.
