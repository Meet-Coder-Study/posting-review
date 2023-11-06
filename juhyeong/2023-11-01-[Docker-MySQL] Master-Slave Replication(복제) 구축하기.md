## **개요**

MySQL의 Master-Slave Replication은 데이터 일관성(Consistency) 및 가용성(Availability)을 보장하기 위해 널리 쓰이는 기술입니다. 이 글에서는 Docker라는 컨테이너 도구를 활용하여 MySQL 환경에서 Master-Slave Replication을 구현하는 방법을 설명하려고 합니다. 이 과정은 크게 두 부분으로 나누어 설명하겠습니다.

1.  Master-Slave Replication 구성하기
2.  Bridge Network을 이용한 Replication 구성

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbVgyqJ%2Fbtszw8wR6lt%2FKTzJL7jaohwAD9kZUYc9HK%2Fimg.png)

## **Replication 동작 원리**

MySQL의 복제 기능은 클라이언트의 데이터 변경사항을 마스터 서버에서 슬레이브 서버로 복사하는 방식으로 작동합니다. 이 과정은 크게 4단계로 이루어집니다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbo2asj%2FbtszvJEhB4b%2FmN4CukD5yF7ZIkEOgVrNP1%2Fimg.png)
1.  **변경사항의 기록**: 클라이언트가 데이터 변경을 요청하고 이를 Commit하면, 이 변경사항은 먼저 마스터 서버에 존재하는 Binary log에 기록됩니다. Binary log는 MySQL 서버에서 데이터 변경사항을 추적하기 위해 사용되는 로그 파일입니다.
2.  **변경사항의 전송**: 마스터 서버의 Master Thread는 Binary log를 읽어 슬레이브 서버로 비동기적으로 전송합니다. 이 과정은 복사되는 시간을 기다려주지 않기 때문에, 큰 데이터 변경사항이 있더라도 마스터 서버의 작업이 지연되지 않습니다.
3.  **변경사항의 저장**: 슬레이브 서버의 I/O Thread는 마스터 서버로부터 받은 변경 데이터를 Relay log에 기록합니다. Relay log는 마스터 서버로부터 받은 Binary log를 저장하는 슬레이브 서버의 로그 파일입니다.
4.  **변경사항의 적용**: 마지막으로, 슬레이브 서버의 SQL Thread는 Relay log의 기록을 읽어 슬레이브 서버의 스토리지 엔진에 최종적으로 적용합니다. 이렇게 하여 마스터 서버의 데이터 변경사항이 슬레이브 서버에도 반영되게 됩니다.

테스트 환경: Amazone Linux

## **1. Master-Slave Replication 구성하기**

### **1.1 디렉토리 및 파일 설정**

먼저, Master와 Slave 서버를 위한 디렉토리와 파일을 설정해야 합니다. 이 단계에서는 데이터, 로그, 설정 파일을 저장할 공간을 만들어 줍니다.

```shell
mkdir -p /db/db001/data /db/db002/data /db/db003/data

chmod 777 /db/db001 /db/db001/data
chmod 777 /db/db002 /db/db002/data 
chmod 777 /db/db003 /db/db003/data

mkdir -p /db/db001/log /db/db001/conf
mkdir -p /db/db002/log /db/db002/conf
mkdir -p /db/db003/log /db/db003/conf

chmod 777 /db/db001/log /db/db001/conf
chmod 777 /db/db002/log /db/db002/conf
chmod 777 /db/db003/log /db/db003/conf
```

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FHieiZ%2FbtszuHtgSKt%2FtiEOMc9QXBSW1M8yceAsFK%2Fimg.png)
위 명령들을 실행하면, 필요한 디렉토리들이 생성됩니다.

### **1.2 MySQL 설정**

이 단계에서는 각각의 서버에 대한 MySQL 설정 파일을 만들고, 각 서버마다 고유한 설정을 정의합니다. 주요 설정에는 binlog, gtid, server-id 등이 있으며, 이들은 데이터 복제에 필요한 설정들입니다. master(db001)를 제외한 slave(db002, db003)에는 read_only 설정이 추가됩니다. 이 설정들의 간략한 설명은 다음과 같습니다.

-   log_bin: 바이너리 로깅을 활성화한다. 바이너리 로그는 복제와 트랜잭션 복구에 필요하며, 로그 파일에 모든 데이터 변경이 기록된다.
-   binlog_format: 바이너리 로그 이벤트가 저장되는 형식을 지정한다. ROW는 각 행 변경을 로그에 기록한다.
-   gtid_mode 및 enforce-gtid-consistency: GTID(Global Transaction Identifier)를 활성화한다. GTID는 각 트랜잭션에 고유한 ID를 부여하여 복제를 더 안정적이고 쉽게 관리하도록 한다.
-   server-id: 복제 구성에서 각 MySQL 서버를 고유하게 식별하는 데 사용된다.
-   log\_slave\_updates:슬레이브 서버가 자신의 바이너리 로그에 복제된 트랜잭션을 기록하도록 한다.
-   datadir: MySQL 데이터 파일이 저장되는 디렉토리를 지정한다.
-   socket: MySQL 서버의 유닉스 소켓 파일의 위치를 지정한다.
-   read_only: 슬레이브 서버에서만 사용되며, 슬레이브에서 모든 변경을 거부하여 모든 변경이 마스터에서만 발생하도록 한다.

1.1에서 생성한 /db/dbxxx/conf 디렉토리에 cnf 형식의 파일을 생성하고, 위의 설정 내용을 작성합니다. 예를 들어, db001의 MySQL 설정을 위해 /db/db001/conf/my.cnf 파일을 생성하고 아래의 내용을 기록합니다.

#### **db001 MySQL 설정**

```shell
# db001의 MySQL 설정 예시
[mysqld]
log_bin                     = mysql-bin
binlog_format               = ROW
gtid_mode                   = ON
enforce-gtid-consistency    = true
server-id                   = 100
log_slave_updates
datadir                     = /var/lib/mysql
socket                      = /var/lib/mysql/mysql.sock

# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links              = 0

log-error                   = /var/log/mysql/mysqld.log
pid-file                    = /var/run/mysqld/mysqld.pid

report_host                 = db001

[mysqld_safe]
pid-file                    = /var/run/mysqld/mysqld.pid
socket                      = /var/lib/mysql/mysql.sock
nice                        = 0
```

위와 같은 방식으로 나머지 서버(db002, db003)의 설정 파일도 작성합니다. 이때, 각 설정 파일의 server-id는 고유해야 하며, 슬레이브 서버의 경우 read\_only 설정을 추가해야 합니다.

#### **db002 MySQL 설정**

```shell
# db002의 MySQL 설정 예시

[mysqld]
log_bin                     = mysql-bin
binlog_format               = ROW
gtid_mode                   = ON
enforce-gtid-consistency    = true
server-id                   = 200
log_slave_updates
datadir                     = /var/lib/mysql
socket                      = /var/lib/mysql/mysql.sock
read_only

# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links              = 0

log-error                   = /var/log/mysql/mysqld.log
pid-file                    = /var/run/mysqld/mysqld.pid

report_host                 = db002

[mysqld_safe]
pid-file                    = /var/run/mysqld/mysqld.pid
socket                      = /var/lib/mysql/mysql.sock
nice                        = 0
```

#### **db003 MySQL 설정**

```shell
# db003의 MySQL 설정 예시

[mysqld]
log_bin                     = mysql-bin
binlog_format               = ROW
gtid_mode                   = ON
enforce-gtid-consistency    = true
server-id                   = 300
log_slave_updates
datadir                     = /var/lib/mysql
socket                      = /var/lib/mysql/mysql.sock
read_only

# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links              = 0

log-error                   = /var/log/mysql/mysqld.log
pid-file                    = /var/run/mysqld/mysqld.pid

report_host                 = db003

[mysqld_safe]
pid-file                    = /var/run/mysqld/mysqld.pid
socket                      = /var/lib/mysql/mysql.sock
nice                        = 0
```

### **1.3 Docker 컨테이너 실행**

이제 각 MySQL 서버를 Docker 컨테이너로 실행합니다. db001, db002, db003의 이름으로 각각의 서버를 실행합니다.

```shell
docker run -i -t --name db001 -h db001 -p 3306:3306 \
-v /db/db001/data:/var/lib/mysql \
-v /db/db001/log:/var/log/mysql \
-v /db/db001/conf:/etc/percona-server.conf.d \
-e MYSQL_ROOT_PASSWORD="root" -d percona:5.7.30
```

```shell
docker run -i -t --name db002 -h db002 -p 3307:3306 \
-v /db/db002/data:/var/lib/mysql \
-v /db/db002/log:/var/log/mysql \
-v /db/db002/conf:/etc/percona-server.conf.d \
-e MYSQL_ROOT_PASSWORD="root" -d percona:5.7.30
```

```shell
docker run -i -t --name db003 -h db003 -p 3308:3306 \
-v /db/db003/data:/var/lib/mysql \
-v /db/db003/log:/var/log/mysql \
-v /db/db003/conf:/etc/percona-server.conf.d \
-e MYSQL_ROOT_PASSWORD="root" -d percona:5.7.30
```

모든 컨테이너가 정상적으로 생성되었는지 확인하기 위해 docker ps 명령어를 사용합니다. 이 명령어는 현재 실행 중인 모든 컨테이너의 목록을 보여주며, `--format` 옵션을 추가하여 출력 형식을 지정하면, ID, 이름, 상태 등 필요한 정보만 보다 편리하게 확인할 수 있습니다.

```shell
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}"
```

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc2Q5SI%2FbtszuFI09uj%2FL34msAKclneXkqNr8V4Muk%2Fimg.png)
### **1.4 복제 사용자 생성 및 권한 부여**

이 단계에서는 마스터 서버에서 복제를 위한 사용자를 생성하고, 필요한 권한을 부여합니다. 이를 위해 다음과 같은 명령어를 실행합니다:

```shell
# Docker 컨테이너 접속
docker exec -it -uroot db001 /bin/bash

# MySQL 접속
mysql -uroot -p

# 복제 사용자 생성
CREATE USER 'repl'@'%' IDENTIFIED BY 'repl';

# 복제 권한 부여(여기서 'REPLICATION SLAVE'는 복제 슬레이브 권한을 의미)
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

# 권한 즉시 적용
FLUSH PRIVILEGES;
```

### **1.5 Slave 서버 설정(db002 및 db003 Replication 설정)**

이제 각 슬레이브 서버에 대해 복제 설정을 진행합니다. 여기서 db002와 db003은 슬레이브 서버의 컨테이너 이름입니다. 각 슬레이브 서버에 대해 동일한 설정을 진행하며, 각 설정은 다음과 같습니다:

```
# Docker 컨테이너 접속
docker exec -it -uroot db002 /bin/bash
# 또는
docker exec -it -uroot db003 /bin/bash

# MySQL 접속
mysql -uroot -p

# 이전 복제 설정 초기화
reset master;

# Master 서버 정보 설정
CHANGE MASTER TO MASTER_HOST='172.17.0.1', \
        MASTER_USER='repl', MASTER_PASSWORD='repl',  \
        MASTER_AUTO_POSITION=1;

# 복제 시작
START SLAVE;
```

여기서 `MASTER_HOST`는 마스터 서버의 IP 주소나 호스트 이름이며, `MASTER_USER`와 `MASTER_PASSWORD`는 앞서 마스터 서버에서 생성한 복제 사용자의 정보입니다. `MASTER_AUTO_POSITION=1`은 GTID 기반 복제를 활성화하는 설정입니다.

복제가 성공적으로 진행되었는지 확인하기 위해 아래의 명령어를 실행합니다. 여기서 `Slave_IO_Running`와 `Slave_SQL_Running` 상태가 모두 'Yes'로 출력되는지 확인하면 됩니다. 'Yes'로 출력되면 슬레이브 서버가 마스터 서버로부터 데이터를 정상적으로 받아올 수 있고, 받아온 데이터를 정상적으로 실행할 수 있다는 의미입니다.

```
show slave status\G
```

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbSGY0o%2FbtszA5ZJXbf%2FCfEsxLJ9d5vW4KvFJmjtF1%2Fimg.png)
## **2. Bridge Network을 이용한 Replication 구성**

Docker의 Bridge Network는 Docker 컨테이너 간의 통신을 가능하게 하는 네트워크 모드입니다. 이는 각 컨테이너에 대해 격리된 네트워크 환경을 제공하며, 컨테이너 간에는 네트워크 연결을 통해 통신할 수 있습니다.

Docker 컨테이너는 언제든지 재시작될 수 있으며, 컨테이너가 재시작되면 해당 컨테이너의 IP 주소가 변경될 수 있는데, 이는 MySQL의 복제 설정이나 `고가용성(High Availability, HA)` 설정에 문제를 일으킬 수 있습니다. 왜냐하면 이러한 설정들은 특정 IP 주소를 참조하기 때문에, IP 주소가 변경되면 복제나 HA 설정이 제대로 작동하지 않을 수 있기 때문입니다.

이러한 문제를 방지하기 위해 `Docker`의 `Bridge Network`를 사용하여 net alias를 설정할 수 있습니다. net alias는 특정 컨테이너를 참조하는 데 사용되는 추가적인 DNS 이름으로, 이를 사용하면 컨테이너의 IP 주소가 변경되더라도 net alias는 동일하게 유지되어 복제나 HA 설정이 영향을 받지 않습니다.

Bridge Network를 구성하고 net alias를 설정하는 방법은 다음과 같습니다.

### **2.1 Bridge Network 생성**

먼저 docker network create 명령어를 사용하여 Bridge Network를 생성합니다.

```shell
# 생성
docker network create --driver bridge mybridge

# 확인
docker network ls
```

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FpUhwo%2FbtszyLVuTkB%2FhkSWNx1ym9czeUmwZ1RfKK%2Fimg.png)
### **2.2 컨테이너 생성 및 Bridge Network 연결**

이제 생성된 Bridge Network를 이용하여 각 MySQL 서버의 컨테이너를 생성합니다. 각 컨테이너는 'mybridge'라는 이름의 네트워크에 연결되며, 'db001', 'db002', 'db003'라는 net alias를 각각 부여받습니다. 이를 통해 각 컨테이너는 서로 통신할 수 있는 환경을 구성하게 됩니다.

```shell
docker run -i -t --name db001 -h db001 -p 3306:3306 \
--net mybridge --net-alias=db001 \
-v /db/db001/data:/var/lib/mysql \
-v /db/db001/log:/var/log/mysql \
-v /db/db001/conf:/etc/percona-server.conf.d \
-e MYSQL_ROOT_PASSWORD="root" -d percona:5.7.30
```

```shell
docker run -i -t --name db002 -h db002 -p 3307:3306 \
--net mybridge --net-alias=db002 \
-v /db/db002/data:/var/lib/mysql \
-v /db/db002/log:/var/log/mysql \
-v /db/db002/conf:/etc/percona-server.conf.d \
-e MYSQL_ROOT_PASSWORD="root" -d percona:5.7.30
```

```shell
docker run -i -t --name db003 -h db003 -p 3308:3306 \
--net mybridge --net-alias=db003 \
-v /db/db003/data:/var/lib/mysql \
-v /db/db003/log:/var/log/mysql \
-v /db/db003/conf:/etc/percona-server.conf.d \
-e MYSQL_ROOT_PASSWORD="root" -d percona:5.7.30
```

여기서 `--net mybridge` 옵션은 컨테이너를 'mybridge' 네트워크에 연결하라는 의미이고, `--net-alias=db001` 같은 옵션은 컨테이너에 'db001'이라는 net alias를 부여하라는 의미입니다. 이 net alias를 통해 컨테이너의 IP 주소가 바뀌더라도, 이 alias를 통해 컨테이너를 참조할 수 있습니다. 이를 통해, 컨테이너의 IP 주소가 변경되더라도 복제 설정이 영향을 받지 않게 됩니다.

### **2.3 Slave 서버 설정(db002 및 db003 Replication 설정)**

이전과 다르게 이번에는 MASTER_HOST에 IP 주소 대신 마스터 서버의 이름을 사용합니다. 이렇게 하면, 마스터 서버의 IP 주소가 변경되더라도 설정에 영향을 주지 않게 됩니다.

```shell
# Docker 컨테이너 접속
docker exec -it -uroot db002 /bin/bash
# 또는
docker exec -it -uroot db003 /bin/bash

# MySQL 접속
mysql -uroot -p

# 이전 복제 설정 초기화
reset master;

# Master 서버에 대한 복제 설정
CHANGE MASTER TO MASTER_HOST='db001', \
        MASTER_USER='repl', MASTER_PASSWORD='repl',  \
        MASTER_AUTO_POSITION=1;

# 복제 시작
START SLAVE;
```

마찬가지로 성공 여부는 아래의 명령어를 통해 확인할 수 있습니다.

```shell
show slave status\G
```

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbDKJpX%2FbtszuFI1gvI%2Fki6rqCT5244GhpFVYUqX0k%2Fimg.png)
## **Replication 테스트**

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fuc5qG%2FbtszvD5g4F8%2F0kQADkpz3t9BVWG7GQAPf0%2Fimg.png)
마스터 서버의 MySQL에서 데이터를 추가했을 때, 슬레이브 서버의 MySQL에서도 정상적으로 데이터가 조회되는걸 확인할 수 있습니다.

## **정리**

여기까지 MySQL의 Master-Slave 복제 구성 방법에 대해 살펴보았습니다. 위 구성은 마스터 서버의 모든 데이터 변경 사항이 자동으로 슬레이브 서버에 동기화되게 되며, 이를 통해 데이터의 일관성을 유지하고 마스터 서버의 부하를 호율적으로 분산시킬 수 있습니다.

하지만, 현재 구성에서는 마스터 서버에 문제가 발생하여 중단되면, 슬레이브 서버가 있음에도 불구하고 운영자가 직접 조치를 취하기 전까지는 슬레이브 서버를 마스터 서버로 대체하여 사용하는 것이 불가능하다는 문제가 존재합니다. 이러한 문제를 해결하기 위해, 다음 글에서는 마스터 서버에 장애가 발생했을 때 슬레이브 서버를 마스터 서버로 승격시키는 과정을 자동화하는 Orchestrator를 활용한 고가용성(High Availability, HA) 구성에 대해 설명하도록 하겠습니다.

