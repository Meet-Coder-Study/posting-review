> [예제코드](https://github.com/ksy90101/jpa-lifecycle-properties-ex)

- Spring Data JPA는 스키마를 자동으로 생성해준다.
- 스키마를 생성하는 [application.properties](http://application.properties) 값을 한번 살펴보자.

- 아래와 같은 Entity를 만들어 본다.

```java
package jpa.hands.on.part1;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="station")
public class Station {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(name = "name", nullable = false)
	private String name;

	protected Station() {
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}
}
```

- 위의 엔티티의 생성 SQL DDL을 콘솔에 찍고 싶다면 어떻게 해야 할까?
- 아래에 있는 속성 들은 기본적으로 하이버네이트가 하기 떄문에 기본적으로 JPA Entity가 실행될때 자동으로 스키마를 생성해주는 것에만 가능하다.(예를들어 schma.sql, data.sql를 만든 것들은 이 속성으로 sql을 나타내지 못한다.)

1. spring.jpa.properties.hibernate.show_sql=true
    - SQL을 출력한다.

    ```sql
    Hibernate: drop table if exists station CASCADE 
    Hibernate: create table station (id bigint generated by default as identity, name varchar(255) not null, primary key (id))
    ```

2. spring.jpa.properties.hibernate.format_sql=true
    - 위의 SQL은 한줄로 나타나 있기 때문에 보기가 불편하다. 따라서 보기 편하게 format을 지원한다.

    ```sql
    Hibernate: 
        
        drop table if exists station CASCADE 
    Hibernate: 
        
        create table station (
           id bigint generated by default as identity,
            name varchar(255) not null,
            primary key (id)
        )
    ```

3. spring.jpa.properties.hibernate.use_sql_comments=true
    - 이 테스트를 위해 Repository와 테스트 코드를 추가한다.

    ```java
    package jpa.hands.on.part1;

    import org.springframework.data.jpa.repository.JpaRepository;

    public interface StationRepository extends JpaRepository<Station, Long> {
    }
    ```

    ```java
    package jpa.properties.ex.domain;

    import static org.assertj.core.api.Assertions.*;
    import static org.junit.jupiter.api.Assertions.*;

    import org.junit.jupiter.api.Test;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

    @DataJpaTest
    class StationRepositoryTest {

    	@Autowired
    	private StationRepository stationRepository;

    	@Test
    	void saveTest() {
    		Station station = new Station("잠실역");
    		Station actual = stationRepository.save(station);
    		assertAll(
    			() -> assertThat(actual.getId()).isNotNull(),
    			() -> assertThat(actual.getName()).isEqualTo(station.getName())
    		);
    	}
    }
    ```

    - 디버깅이 용이하도록 SQL문 이외에 추가적인 정보를 출력해 준다.

    ```sql
    Hibernate: 
        /* insert jpa.hands.on.part1.Station
            */ insert 
            into
                station
                (id, name) 
            values
                (null, ?)
    ```

4. logging.level.org.hibernate.type.descriptor.sql=trace
    - SQL문 중 물음표로 표기된 부분(Bind Parameter)라고 하는데, 이걸 출력한다.

    ```java
    Hibernate: 
        /* insert jpa.hands.on.part1.Station
            */ insert 
            into
                station
                (id, name) 
            values
                (null, ?)
    2020-07-08 19:22:02.441 TRACE 29455 --- [    Test worker] o.h.type.descriptor.sql.BasicBinder      : binding parameter [1] as [VARCHAR] - [잠실역]
    ```

5. logging.level.org.springframework.jdbc.datasource.init.ScriptUtils=DEBUG
    - data.sql과 schema.sql를 출력한다.
    - 이걸 테스트 하기 위해 data.sql을 만들어 쿼리를 하나 추가한다.

    ```sql
    insert into station (name) values ('잠실새내역');
    ```

    ```text
    2020-07-08 19:44:09.472 DEBUG 29602 --- [         task-2] o.s.jdbc.datasource.init.ScriptUtils     : Executing SQL script from URL [file:/Users/seyunkim/workspace/lecture/jpa-hands-on/build/resources/main/data.sql]
    2020-07-08 19:44:09.474 DEBUG 29602 --- [         task-2] o.s.jdbc.datasource.init.ScriptUtils     : 1 returned as update count for SQL: insert into station (name) values ('잠실새내역')
    2020-07-08 19:44:09.474 DEBUG 29602 --- [         task-2] o.s.jdbc.datasource.init.ScriptUtils     : Executed SQL script from URL [file:/Users/seyunkim/workspace/lecture/jpa-hands-on/build/resources/main/data.sql]
    ```
