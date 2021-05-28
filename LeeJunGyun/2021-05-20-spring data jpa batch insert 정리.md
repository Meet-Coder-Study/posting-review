> source 는 [Github](https://github.com/leechoongyon/spring-boot-jpa-example) 에 있습니다.

## spring data jpa batch insert 란?
- batch insert 라는 것은 여러 개의 SQL Statement 를 하나의 구문으로 처리할 수 있습니다. 
- 정확히는 위 기능은 jdbc batch 기능이며, hibernate 에서 위 기능을 이용해서 처리하는 것입니다.
- 여러 개의 구문을 여러 번 network 를 통해 보내는 것이 아니라 합쳐서 1개로 보내기에 성능 개선을 할 수 있습니다.
- 아래 예시를 보면 3개의 insert statements 를 하나의 PreparedStatement 로 실행해준다는 것입니다.
    - 자세한건 spring data jpa 동작원리 에서 설명하겠습니다.

```sql

insert into test (column01, column02) values ('test01', 'test02');
insert into test (column01, column02) values ('test03', 'test04');
insert into test (column01, column02) values ('test05', 'test06');

```

## spring data jpa batch insert 사용하는 방법?

#### hibernate.jdbc.batch_size
- hibernate.jdbc.batch_size 란 최대 몇 개까지 statements 를 batch 처리를 할 것인지에 대한 옵션입니다.

```text
hibernate.jdbc.batch_size
Controls the maximum number of statements Hibernate will batch together before asking the driver to execute the batch. 
Zero or a negative number disables this feature.
```

- 사용방법

```yaml

spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 1000

```




#### hibernate.order_updates, hibernate.order_inserts
- 위 batch_size 옵션 외에도 이 2개 옵션은 jdbc batch 기능을 더욱 효과적으로 사용할 수 있도록 도와줍니다.
- 위 기능을 먼저 살펴보고 넘어가면 update, insert 문의 실행 순서를 정렬해주는 옵션입니다.
- 예를 들면 아래와 같습니다. 옵션을 적용하기 전에는 아래 순서대로 실행이 됐는데, 옵션을 적용한 후에는 같은 구문끼리 정렬을 해주는 겁니다.
- 이렇게 되면 jdbc batch 기능을 통해 일괄 처리를 할 때, 더욱 효율적으로 처리가 가능합니다.
    - 옵션을 적용한 후에는 일괄 처리하는 숫자가 더욱 많아지게 되는 겁니다.   


```sql
# before apply option
update test set column01 = 'test3' where regdate = '20210510';
update test2 set column02 = 'test5' where regdate = '20210511';
update test set column01 = 'test4' where regdate = '20210512';
update test2 set column02 = 'test6' where regdate = '20210513';

# after apply option
update test set column01 = 'test3' where regdate = '20210510';
update test set column01 = 'test4' where regdate = '20210512';
update test2 set column02 = 'test5' where regdate = '20210511';
update test2 set column02 = 'test6' where regdate = '20210513';


```


- 사용방법

```yaml

spring:
  jpa:
    properties:
      hibernate:
        jdbc:
        order_inserts: true
        order_updates: true

```




## spring data jpa batch insert 동작 원리
- 이 기능을 좀 더 상세히 설명하면, hibernate.jdbc.batch_side 옵션은 java 의 addBatch 를 이용하는 것입니다.
- java 의 addBatch 는 하나의 statements 가 등록이 되면, 이것에 대한 copy 본을 만듭니다.
- 뒤에 후속 구문들은 이 copy 된 구문을 계속해서 재사용합니다. 커밋이 되거나, 커서가 닫히거나 기타 등등일 떄까지.  
- 그렇기에 batch insert 를 효율적으로 사용하기 위해 hibernate.order_updates, hibernate.order_inserts 와 같은 옵션이 필요합니다.



## 다음 포스팅
- 다음 포스팅은 소스 예제를 작성하고 성능 측정, jpa bulk insert 최적화 방법을 작성할 예정입니다.


## reference
- https://www.baeldung.com/spring-data-jpa-batch-inserts
- https://docs.jboss.org/hibernate/orm/5.2/userguide/html_single/Hibernate_User_Guide.html#batch
- https://www.vertica.com/docs/9.2.x/HTML/Content/Authoring/ConnectingToVertica/ClientJDBC/BatchInsertsUsingJDBCPreparedStatements.htm