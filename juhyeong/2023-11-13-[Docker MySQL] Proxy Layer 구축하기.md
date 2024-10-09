## **개요**

이전  포스팅에서는 마스터 서버에 장애가 발생했을 때 슬레이브 서버를 마스터 서버로 승격시키는 과정을 자동화하는 `Orchestrator`를 활용한 `고가용성(High Availability, HA)` 구성에 대해 살펴보았습니다. 이를 통해 마스터 서버의 모든 데이터 변경 사항이 자동으로 슬레이브 서버에 동기화되게 되며, 이를 통해 데이터의 일관성을 유지하고 마스터 서버의 부하를 효율적으로 분산시킬 수 있었습니다.

**하지만, HA 구성만으로는 애플리케이션과 DB 서버 사이의 동기화 문제를 해결할 수 없습니다.** 예를 들어, 애플리케이션의 설정 정보에는 장애가 발생한 db001이 마스터 DB로 설정되어 있다면, db001에 문제가 생겨 db002가 새로운 마스터가 되었을 때에도 애플리케이션은 계속 db001을 바라보도록 설정되어 있고, db001에 접속하려고 계속 시도하는 문제가 발생할 수 있습니다.

**이번 포스팅에서는 이러한 문제를 해결하기 위해 애플리케이션과 DB 서버 사이에 프록시 역할을 해주는 레이어를 구성하여, 애플리케이션의 설정 변경이나 재시작 없이 자동으로 변경된 마스터 DB로 연결하고, READ와 WRITE 요청에 따라 분산하는 방법을 알아보겠습니다.**

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fcn5Dg5%2FbtsAa9AMJKu%2FkPxVpatgb67pPIaKNZnhSK%2Fimg.png)

## **Proxy Layrer 구성**

#### **디렉토리 및 파일 설정**

먼저 `ProxySQL`을 구성할 디렉토리를 생성합니다.

```shell
mkdir -p /db/proxysql/data /db/proxysql/conf
chmod 777 /db/proxysql /db/proxysql/data /db/proxysql/conf
```

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F6Y8RW%2Fbtsz90Lqfpq%2FeuZFfhovQjUKgibJuaYD1K%2Fimg.png)
지금까지 이전 내용들 그대로 잘 따라왔다면, 위와 같이 디렉토리가 구성되었을 겁니다.

다음으로, `/db/proxysql/conf` 디렉토리에 cnf 형식의 파일을 생성하고, 설정 내용을 작성합니다. 예를 들어, `/db/proxysql/conf/proxysql.cnf` 파일을 생성하고 아래의 내용을 작성합니다.

```shell
datadir="/var/lib/proxysql"
admin_variables=
{
    admin_credentials="admin:admin;radmin:radmin"
    mysql_ifaces="0.0.0.0:6032"
}
mysql_variables=
{
    threads=4
    max_connections=2048
    default_query_delay=0
    default_query_timeout=36000000
    have_compress=true
    poll_timeout=2000
    interfaces="0.0.0.0:6033"
    default_schema="information_schema"
    stacksize=1048576
    server_version="5.5.30"
    connect_timeout_server=3000
    monitor_username="monitor"
    monitor_password="monitor"
    monitor_history=600000
    monitor_connect_interval=60000
    monitor_ping_interval=10000
    monitor_read_only_interval=1500
    monitor_read_only_timeout=500
    ping_interval_server_msec=120000
    ping_timeout_server=500
    commands_stats=true
    sessions_sort=true
    connect_retries_on_failure=10
}
```

여기서 `ProxySQL`의 데이터 디렉토리, 관리자 계정 정보, MySQL 인터페이스 및 포트 설정 등을 지정할 수 있으며, 아래의 명령어를 통해 `proxysql.cnf`의 권한을 644로 지정합니다.

```shell
chmod 644 proxysql.cnf
```

각 설정 항목에 대해 간단하게 살펴보면 다음과 같습니다.

-   **datadir="/var/lib/proxysql":** ProxySQL의 데이터 디렉토리 경로를 지정
-   **admin_variables**: 관리자 계정에 대한 설정을 지정하는 섹션
-   **admin_credentials="admin:admin;radmin:radmin"**: 관리자 계정의 사용자 이름과 비밀번호를 설정. 여기서는 "admin" 사용자의 비밀번호를 "admin"으로 설정하고, "radmin" 사용자의 비밀번호를 "radmin"으로 설정함
-   **mysql_ifaces="0.0.0.0:6032"**: ProxySQL 관리 인터페이스의 IP 주소와 포트를 설정. 여기서는 모든 IP 주소에서 6032 포트로 접속할 수 있도록 설정함
-   **mysql_variables**: MySQL 서버에 대한 설정을 지정하는 섹션
-   **threads=4**: ProxySQL에서 사용할 쓰레드 수
-   **max_connections=2048**: ProxySQL에서 허용할 최대 동시 접속 수
-   **default_query_delay=0**: 쿼리 실행에 대한 딜레이를 설정.
-   **default_query_timeout=36000000**: 쿼리 실행에 대한 타임아웃 시간을 설정(밀리 초)
-   **have_compress=true**: 압축을 지원하는지 여부를 설정
-   **poll_timeout=2000**: ProxySQL이 쿼리 결과를 폴링하는 주기를 설정(밀리 초)
-   **interfaces="0.0.0.0:6033"**: ProxySQL의 MySQL 인터페이스의 IP 주소와 포트를 설정. 여기서는 모든 IP 주소에서 6033 포트로 접속할 수 있도록 설정함
-   **default_schema="information_schema"**: 기본 스키마를 설정
-   **stacksize=1048576**: ProxySQL의 스택 크기를 설정
-   **server_version="5.5.30"**: ProxySQL이 사용할 MySQL 서버의 버전을 설정
-   **connect_timeout_server=3000**: MySQL 서버에 대한 연결 타임아웃 시간을 설정(밀리 초)
-   **monitor_username="monitor"**: Monitor 유저의 사용자 이름을 설정
-   **monitor_password="monitor"**: Monitor 유저의 비밀번호를 설정
-   **monitor_history=600000**: Monitor 유저의 이력을 저장하는 시간을 설정(밀리 초)
-   **monitor_connect_interval=60000**: Monitor 유저가 MySQL 서버와의 연결을 확인하는 주기를 설정(밀리 초)
-   **monitor_ping_interval=10000**: Monitor 유저가 MySQL 서버에 핑을 보내는 주기를 설정(밀리 초)
-   **monitor_read_only_interval=1500**: Monitor 유저가 읽기 전용 모드로 전환하는 주기를 설정(밀리 초)
-   **monitor_read_only_timeout=500**: Monitor 유저가 읽기 전용 모드로 전환되기까지의 타임아웃 시간을 설정(밀리 초)
-   **ping_interval_server_msec=120000**: MySQL 서버에 대한 핑을 보내는 주기를 설정(밀리 초)
-   **ping_timeout_server=500**: MySQL 서버에 대한 핑 응답의 타임아웃 시간을 설정(밀리 초)
-   **commands_stats=true**: 쿼리 실행에 대한 통계 정보를 수집하는 기능을 활성화
-   **sessions_sort=true**: 세션을 정렬하여 가장 부하가 적은 서버에 우선적으로 연결하도록 함
-   **connect_retries_on_failure=10**: MySQL 서버에 연결 시도 중 실패할 경우 재시도 횟수를 설정

위의 설정을 통해 `ProxySQL`은 MySQL 서버와의 연결 및 관리를 담당하며, 애플리케이션의 접속 정보를 동적으로 업데이트하여 변경된 마스터 DB로 연결할 수 있게 됩니다.

### **ProxySQL 컨테이너 실행**

ProxySQL 컨테이너를 실행하기 위해 다음 명령어를 사용합니다.

```shell
docker run -i -t --name proxysql -h proxysql \
  --net mybridge --net-alias=proxysql \
  -p 16032:6032 -p 16033:6033 \
  -v /db/proxysql/data:/var/lib/proxysql \
  -v /db/proxysql/conf/proxysql.cnf:/etc/proxysql.cnf \
  -d proxysql/proxysql
```

그리고 `docker ps` 명령어를 통해 ProxySQL 컨테이너가 정상적으로 실행 중인지 확인할 수 있습니다.

```shell
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}"
```

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc9nXmR%2FbtsAaZkWGPa%2FkzwPfbJKM3edmUneJiKo2K%2Fimg.png)

### **ProxySQL 관리 인터페이스 접속 확인**

ProxySQL 관리 인터페이스에 접속하기 위해서는 MySQL 클라이언트가 필요합니다. 일반적으로 ProxySQL에는 MySQL 클라이언트가 내장되어 있기 때문에 ProxySQL 컨테이너에 접속한 후에 바로 사용할 수 있습니다.

아래 명령어를 사용하여 접속을 확인할 수 있습니다. 주의해야 할 점은 포트 번호를 나타내는 -P 옵션은 대문자로 작성해야 한다는 것입니다. 소문자로 작성하면 접속이 되지 않습니다.

```shell
docker exec -it proxysql mysql -h 127.0.0.1 -P 6032 -u radmin -pradmin
```

위 명령어를 실행하면 proxysql 컨테이너에 접속하여 MySQL 클라이언트를 실행하고, `127.0.0.1` 주소와 `6032` 포트를 통해 ProxySQL 관리 인터페이스에 접속합니다. `proxysql.cnf`에 명시했던 `radmin` 사용자로 접속하며, 비밀번호는 지정했던 `radmin`입니다. 이를 통해 ProxySQL 관리 인터페이스에 정상적으로 접속할 수 있습니다.

## **테스트 환경 구성**

테스트를 위한 데이터베이스를 생성하고, 애플리케이션에서 사용할 유저와 ProxySQL용 `모니터링 유저`를 생성한 후, ProxySQL `호스트 그룹`에 DB 서버 정보를 입력하여 쿼리를 분산시킬 수 있는 환경을 구성해 보겠습니다.

#### **테스트 데이터베이스 생성**

```sql
docker exec -it -uroot db001 /bin/bash

mysql -uroot -p

CREATE DATABASE testdb DEFAULT CHARACTER SET utf8;

USE testdb;

CREATE TABLE insert_test(
    hostname VARCHAR(5) NOT NULL,
    insert_time DATETIME NOT NULL
);
```

#### **애플리케이션에서 사용할 유저 생성**

```sql
CREATE USER appuser@'%' IDENTIFIED BY 'apppass';

GRANT SELECT, INSERT, UPDATE, DELETE ON testdb.* TO appuser@'%';

FLUSH PRIVILEGES;
```

#### **ProxySQL용 모니터링 유저 생성**

```sql
CREATE USER 'monitor'@'%' IDENTIFIED BY 'monitor';

GRANT REPLICATION CLIENT ON *.* TO 'monitor'@'%';

FLUSH PRIVILEGES;
```

#### **ProxySQL 호스트 그룹에 DB 서버 정보 입력**

```sql
-- Write 호스트 그룹에 db001 서버 정보 입력
INSERT INTO mysql_servers(hostgroup_id, hostname, port) VALUES (10, 'db001', 3306);

-- Read 호스트 그룹에 db001, db002, db003 서버 정보 입력
INSERT INTO mysql_servers(hostgroup_id, hostname, port) VALUES (20, 'db001', 3306);
INSERT INTO mysql_servers(hostgroup_id, hostname, port) VALUES (20, 'db002', 3306);
INSERT INTO mysql_servers(hostgroup_id, hostname, port) VALUES (20, 'db003', 3306);

-- Replication 관련 설정
INSERT INTO mysql_replication_hostgroups VALUES (10, 20, 'read_only', '');

-- 변경된 설정을 적용
LOAD MYSQL SERVERS TO RUNTIME;
SAVE MYSQL SERVERS TO DISK;
```

#### **어플리케이션 유저 정보 입력**

```sql
-- 어플리케이션 유저 정보 입력
INSERT INTO mysql_users(username, password, default_hostgroup, transaction_persistent)
VALUES ('appuser', 'apppass', 10, 0);

-- 변경된 설정을 적용
LOAD MYSQL USERS TO RUNTIME;
SAVE MYSQL USERS TO DISK;
```

#### **쿼리 룰 정보 입력**

```sql
-- 쿼리 룰 정보 입력
INSERT INTO mysql_query_rules(rule_id, active, match_pattern, destination_hostgroup)
VALUES (1, 1, '^SELECT.*FOR UPDATE$', 10);

INSERT INTO mysql_query_rules(rule_id, active, match_pattern, destination_hostgroup)
VALUES (2, 1, '^SELECT', 20);

-- 변경된 설정을 적용
LOAD MYSQL QUERY RULES TO RUNTIME;
SAVE MYSQL QUERY RULES TO DISK;
```

위와 같은 순서로 작업을 수행하면, 테스트 환경이 구성됩니다. ProxySQL을 통해 쿼리가 분산되는지 확인하기 위해서는 반드시 위의 순서대로 작업을 진행해야 합니다. ProxySQL의 설정 값이 제대로 들어갔는지 확인하기 위해서는 아래의 명령어를 통해 `mysql_servers`, `mysql_users`, `mysql_query_rules` 테이블에서 값을 확인할 수 있습니다.

```sql
SELECT * FROM mysql_servers;
SELECT * FROM mysql_users;
SELECT rule_id, active, match_pattern, destination_hostgroup, apply FROM mysql_query_rules;
```

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcqFc05%2FbtsAc40oSwO%2FrFD8rnADVDLsJlnx7VsKtk%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fld8w1%2Fbtsz6MmZFKd%2FUcZ5Wx6iPXRM8ToelKurKk%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FIrQX0%2FbtsAbbS2y4k%2Fh3BLKRMm1KQYovzWWQANq0%2Fimg.png)

#### Connect 테스트 스크립트 작성(app_test_conn.sh)

```shell
#!/bin/bash
while true;
do
  mysql -uappuser -papppass -h{docker_host:ip} -P16033 -N -e "SELECT @@hostname, NOW()" 2>&1 | grep -v "Warning"
  sleep 1
done
```

#### Insert 테스트 스크립트 작성(app_test_insert.sh)

```shell
#!/bin/bash
for i in {1..30};
do
  mysql -uappuser -papppass -h{docker_host:ip} -P16033 -N -e "INSERT INTO testdb.insert_test SELECT @@hostname,now()" 2>&1| grep -v "Warning"
  sleep 1
done
```

위 스크립트들은 테스트를 위한 간단한 예시입니다. `app_test_conn.sh`는 `프록시 포트(16033)`를 통해 ProxySQL에 접속하여 SELECT 쿼리를 수행하고, 수행한 컨테이너의 호스트네임과 현재 시간을 출력합니다. `app_test_insert.sh`는 프록시 포트를 통해 ProxySQL에 접속하여 30번의 INSERT 쿼리를 수행합니다.

`{docker_host:ip}` 부분에는 본인의 `도커 호스트 IP`를 적어주시면 됩니다.

## **테스트 확인**

#### **app_test_conn.sh 실행 결과**

```shell
sh app_test_conn.sh
```

위 명령어를 실행하여 `app_test_conn.sh` 스크립트를 실행하면, `3대의 MySQL 서버`에서 작업이 분산되어 처리되는 것을 확인할 수 있습니다. 각각의 쿼리 결과에는 `호스트네임`과 `현재 시간`이 출력됩니다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbSJPRi%2Fbtsz88QzsAr%2FlklNKAnceI8TWtY9CB3U30%2Fimg.png)

#### **app_test_insert.sh 실행 결과**

```shell
sh app_test_insert.sh
```

위 명령어를 실행하여 `app_test_insert.sh` 스크립트를 실행하고, db001에 접속하여 테이블을 조회해 보면 모든 INSERT 쿼리가 db001을 통해서만 수행된 것을 확인할 수 있습니다. 이는 ProxySQL이 설정된 대로 `Write 호스트 그룹(db001)`으로 모든 쓰기 작업을 전달하기 때문입니다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcAeq7n%2FbtsAaXAPJfh%2FAuyHhre5MjLJHXyetj0FyK%2Fimg.png)

위 테스트를 통해 `app_test_conn.sh`에서는 쿼리가 `3대의 MySQL 서버`로 분산되어 처리되고, `app_test_insert.sh`에서는 모든 INSERT 쿼리가 db001을 통해서만 수행되는 것을 확인할 수 있습니다. 이는 ProxySQL을 통해 쿼리가 적절하게 분산되는 환경이 구성되었음을 나타냅니다.

## **Fail Over Test**

Failover 테스트를 진행해 보겠습니다. 시뮬레이션은 다음과 같습니다.

1.  insert_test 테이블 데이터 초기화
2.  app_test_insert.sh 실행
3.  app_test_insert.sh 실행 도중 db001 컨테이너 인위적으로 중단(Failover 상황 연출)
4.  select 쿼리를 통해 데이터가 어떻게 처리되는지 확인

![](https://blog.kakaocdn.net/dn/btOBkm/btsAeEtI6Qv/e8PdfKDDHOpx2aUTKt8nZK/img.gif)

위 시뮬레이션 테스트를 보면 `db001에서만 INSERT`가 되다가 `db001이 중단된 이후에는 db002로부터 INSERT`가 되는 것을 확인할 수 있습니다. 이는 ProxySQL을 통해 Failover가 발생하더라도 애플리케이션에서는 동일한 접속 정보를 유지하고 계속해서 사용할 수 있음을 나타냅니다.

Failover 테스트를 통해 ProxySQL이 적절히 동작하여 Master 서버가 변경되더라도 애플리케이션에서는 정상적으로 작동하는 것을 확인할 수 있습니다.

## **정리**

여기까지 Proxy Layer 구축에 대해 알아보았습니다. **이를 통해 애플리케이션과 DB 서버 사이에 프록시 역할을 해주는 레이어를 구성하여, 애플리케이션의 접속 관리, 로드 밸런싱, 장애 복구 등을 보다 효과적으로 관리할 수 있게 되었습니다.** ProxySQL을 사용하여 데이터베이스 접속과 쿼리 분산을 관리하고, Failover 상황에서도 애플리케이션이 중단되지 않고 작동할 수 있도록 구성되었습니다.


**이전 포스팅**

1.  [\[Docker MySQL\] Master-Slave Replication(복제) 구축하기](https://github.com/Meet-Coder-Study/posting-review/pull/1237)
2.  [\[Docker MySQL\] Orchestrator를 이용한 High Availability(HA) 구축하기](https://github.com/Meet-Coder-Study/posting-review/pull/1256)