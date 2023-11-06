## **개요**

이전 포스팅에서는 `MySQL`의 `Master-Slave` 복제 구성 방법에 대해 살펴보았습니다. 이를 통해 마스터 서버의 모든 데이터 변경 사항이 자동으로 슬레이브 서버에 동기화되게 되며, 이를 통해 데이터의 일관성을 유지하고 마스터 서버의 부하를 효율적으로 분산시킬 수 있습니다.

하지만, 마스터 서버에 문제가 발생하여 중단되면, 슬레이브 서버가 있음에도 불구하고 운영자가 직접 조치를 취하기 전까지는 슬레이브 서버를 마스터 서버로 대체하여 사용하는 것이 불가능하다는 문제가 또한 존재했었습니다.

이번 게시글에서는 이러한 문제를 해결하기 위해 마스터 서버에 장애가 발생했을 때 슬레이브 서버를 마스터 서버로 승격시키는 과정을 자동화하는 `Orchestrator`를 활용한 `고가용성(High Availability, HA)` 구성에 대해 설명하도록 하겠습니다. 과정은 크게 아래 두 가지입니다.

1.  HA 수동 설정
2.  HA 자동화(Auto Failover)

## **1. HA 수동 설정하기**

### **1.1 Orchestator 컨테이너 생성**

먼저, Orchestator 컨테이너를 생성합니다. Orchestrator는 MySQL 복제 토폴로지 관리를 위한 [오픈소스](https://github.com/openark/orchestrator) 입니다. 도구입니다. 이를 통해 MySQL 복제 구성의 상태를 모니터링하고, 자동 복구, 복제 톨폴로지 변경 등의 작업을 수행할 수 있습니다.

```shell
docker run -i -t --name orchestrator -h orchestrator \
  --net mybridge --net-alias=orchestrator \
  -p 3000:3000 \
  -d openarkcode/orchestrator:latest
```

### **1.2 dbcontainer의 ip대역 확인**

다음으로, db001 컨테이너의 IP 대역을 확인합니다. 이는 Orchestator를 위한 MySQL 사용자를 생성할 때 필요한데, docker의 inspect 명령어를 사용하여 아래와 같이 컨테이너의 IP 주소를 확인할 수 있습니다.

```
docker inspect --format '{{.NetworkSettings.Networks.mybridge.IPAddress}}' db001
```
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FtSBdd%2FbtszM2oIAg1%2FbuyRLpmWm2MkdqDoWK2vPK%2Fimg.png)
### **1.3 Orchestrator를 위한 MySQL 사용자 생성**

db001 컨테이너에서 Orchestrator를 위한 MySQL 사용자를 생성합니다. 이 사용자는 Orchestrator가 MySQL 서버에 접속하여 필요한 작업을 수행하기 위해 사용됩니다.

```shell
docker exec -it -uroot db001 /bin/bash

mysql -uroot -p

CREATE USER orc_client_user@'172.%' IDENTIFIED BY 'orc_client_password';

# SUPER, PROCESS, REPLICATION SLAVE, RELOAD 권한은 Orchestator가 MySQL 서버에 접속하여 복제 구성의 상태를 확인하거나 변경하는 데 필요
GRANT SUPER, PROCESS, REPLICATION SLAVE, RELOAD ON *.* TO orc_client_user@'172.%';

# Orchestrator가 복제 상태를 확인하는 데 필요
GRANT SELECT ON mysql.slave_master_info TO orc_client_user@'172.%';
```

### **1.4 Orchestrator 접속확인**

이제 Orchestrator에 접속하여 설정이 정상적으로 완료되었는지 확인합니다. Orchestrator는 웹 인터페이스를 제공하므로 웹 브라우저를 통해 접속할 수 있습니다.

```shell
http://{docker_host:ip}:3000/web/clusters
```

여기서 `{docker_host:ip}` 부분에는 Docker 호스트의 IP 주소를 입력합니다. 만약 AWS EC2 인스턴스를 사용한다면, 이 부분에 EC2 인스턴스의 퍼블릭 IP 주소를 입력해야 하며 EC2 보안 그룹 설정에서 3000번 포트로 들어오는 트래픽을 허용하도록 인바운드 설정을 해야 합니다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb7h2B7%2FbtszKIShP2Y%2FH6uKN68gYv5CIfYF8Sh8S1%2Fimg.png)
웹 사이트에 접속한 후, 상단 메뉴에서 `'Cluster' > 'Discover'`를 선택하여 새로운 DB를 등록합니다. `'Host:'`란에 호스트명이나 IP 주소를 입력하고 `'Submit'` 버튼을 클릭하면 Orchestrator가 해당 DB를 자동으로 찾아서 등록합니다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FHxeSB%2FbtszKdrmpw7%2FD0x5c0Os6CWAlSEZF6Sp7k%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FXyr8l%2FbtszKdx8wDZ%2FWjtIRD30smAJCrWsZjKbVk%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F4W2fb%2FbtszKbNRFOw%2FFzWLIYktI6X4G68qxkGkA1%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbbSPiK%2FbtszH8c2MWi%2FUJb5ENLG2VP51rIPFky9Ck%2Fimg.png)

`'Cluster' > 'Dashboard'`로 이동해서 보면 db001을 포함하여 총 3대의 서버가 정상적으로 동작하고 있음을 알 수 있습니다. 이를 통해 앞서 설정한 내용이 제대로 적용되었으며, Orchestrator가 각 서버에 정상적으로 접속하여 상태 정보를 가져오고 있는 것을 확인할 수 있습니다.

### **1.5 HA 테스트**

앞서 설정한 `High Availability(HA)` 설정이 정상적으로 작동하는지 테스트해 보겠습니다. 이를 위해 db001 컨테이너를 고의로 정지시켜 봅니다.

```shell
docker stop db001
```

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbbYvCy%2FbtszLrJbGIG%2FqMDVWmTAbkNH8E3l3uZC41%2Fimg.png)
db001 컨테이너가 정지됨에 따라 Orchestrator의 `'Dashboard'`에서 db001의 상태가 `'Recovery needed'`로 표시된 것을 확인할 수 있으며, db001에 연결되어 있던 db002와 db003의 상태가 `'Disconnected'`로 변경된 것을 확인할 수 있습니다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbVu5dN%2FbtszLkKa3RJ%2FPJAu7flQjXICpUxWoM6fRk%2Fimg.png)
이 상태에서 `'Recovery'` 버튼을 클릭하여 db002를 새로운 Master로 승격시켜 보겠습니다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdgrIaa%2FbtszJ2qaShP%2FtZOqIsI7cFKfOZvKIJ0zEK%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbK8Io8%2FbtszQEA0fZz%2Fdj5TUCXUA4BypS4yXMllck%2Fimg.png)
이 작업 이후, db001과 db002과 분리된 것을 확인할 수 있습니다. 또한 db002가 새로운 Master가 되었고, db003은 db002의 Slave로 변경되었습니다. 또한 db001은 여전히 `'Recovery needed'` 상태로 남아있습니다.

### **1.6 Container db002와 db003 db 상태 확인**

db002와 db003에 접속하여 DB의 상태를 확인해 봅시다.

```shell
# Docker 컨테이너 접속
docker exec -it -uroot db002 /bin/bash

# MySQL 접속
mysql -uroot -p

# Slave 정보 확인
show slave status\G
```

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbABcxy%2FbtszQDvifwR%2F643ksGsrkhtiM6oX6bMz91%2Fimg.png)
위 명령을 실행하면 db002의 Slave 정보가 전부 사라진 것을 확인할 수 있습니다. 또한, `read_only`가 0으로 설정되어 있어 쓰기가 가능한 상태로 변경된 것을 확인할 수 있습니다. 이는 db002가 새로운 Master로 정상적으로 승격되었음을 의미합니다. 이어서 db003의 Slave 정보를 확인하여 Master가 db002로 변경되었는지 확인합니다.

```shell
# Docker 컨테이너 접속
docker exec -it -uroot db003 /bin/bash

# MySQL 접속
mysql -uroot -p

# Slave 정보 확인
show slave status\G
```

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbujb4e%2FbtszRS6WZIu%2FtS4stcTifmVYoWe87R1uq0%2Fimg.png)
db003의 Slave 정보에서 Master가 db002로 변경된 것을 확인할 수 있습니다. 이는 HA 설정에 따라 db002가 새 Master로 승격되었고, db003가 db002의 Slave로 정상적으로 변경되었음을 나타냅니다.

### **1.7 db001 복구 및 db002의 slave로 설정**

이제 db001 컨테이너를 다시 시작하고 db002의 Slave로 설정해 보겠습니다. 먼저, db001을 시작합니다.

```shell
docker start db001
```

그다음, db001에 접속합니다.

```shell
docker exec -it -uroot db001 /bin/bash

mysql -uroot -p

# 데이터베이스를 읽기 전용 모드로 설정
SET GLOBAL read_only = 1;

# MySQL 복제를 위해 새 마스터 서버의 상세 정보를 설정
CHANGE MASTER TO MASTER_HOST='db002', MASTER_USER='repl', MASTER_PASSWORD='repl', MASTER_AUTO_POSITION=1;

# 복제 시작
START SLAVE;

# 복제 설정 확인
show slave status\G
```

위 명령을 순서대로 실행하면 db001이 db002의 Slave로 설정되며, db002에서 발생하는 모든 데이터 변경사항이 db001에도 동일하게 적용됩니다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbmpIN1%2FbtszLW98K27%2FXmh1VFIAILfL20l7tKlj71%2Fimg.png)
마지막으로, Orchestrator에서 db002 cluster를 확인하면 db001이 Slave로 추가된 것을 확인할 수 있습니다.

## **2. HA 자동화(Auto Failover)**

위에서는 Master DB의 장애 후에 `수동으로 Failover`를 시킨 경우를 살펴보았습니다. 이번에는 사람의 개입 없이 `자동으로 Failover`를 처리하는 방법, 즉 `Auto Failover`에 대해 알아보겠습니다.

### **2.1 Auto Failover를 위한 Orchestrator의 설정 변경**

먼저, `Auto Failover`를 위해 Orchestrator의 설정을 변경해야 합니다. 아래의 명령어들을 실행하여 설정을 변경하고 Orchestrator를 재시작합니다.

```shell
# Orchestrator가 실행되고 있는 Docker 컨테이너에 접속
docker exec -it orchestrator /bin/bash

# /etc/ 디렉토리로 이동하여 orchestrator.conf.json 파일을 연다.
cd /etc/
vi orchestrator.conf.json

# 아래의 설정들을 추가
"RecoverMasterClusterFilters":[
"*"
],

"PromotionIgnoreHostnameFilters": ["db003"],

# Orchestrator를 재시작
docker restart orchestrator
```

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fcb3h9l%2FbtszMb69OW2%2FVdPYyJi7IqD5kZRMfFLNpk%2Fimg.png)
각 설정에 대한 설명은 다음과 같습니다.

-   **`"RecoverMasterClusterFilters"`: \["\*"\]**: 이 설정은 모든 클러스터에서 Master 서버 장애 복구를 시도하도록 합니다.
-   "**`PromotionIgnoreHostnameFilters"`:\["db003"\]:** 이 설정은 db003 서버를 Master로 승격하는 것을 무시하도록 합니다. 즉, db003는 항상 Slave의 역할만 수행하게 됩니다.

이렇게 설정을 변경하면, 이후부터는 Master 서버에 장애가 발생하면 Orchestrator가 자동으로 다른 서버를 Master로 승격시키고 장애가 발생한 서버를 복구하는 작업을 수행하게 됩니다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FQAoiv%2FbtszKeKCbH7%2FKkH8Ie9ztFPaSLQBpkRku1%2Fimg.png)
Orchestrator의 설정을 변경하고 재시작한 후에, Orchestrator 웹 인터페이스의 좌측 상단에 위치한 하트 표시를 보면 불이 들어오게 됩니다. 이는 Orchestror가 자동으로 Master Recovery를 수행할 수 있는 상태임을 의미합니다. 따라서, 이후에는 Master 서버에 장애가 발생하더라도 Orchestrator가 자동으로 Failover를 처리하고, 장애가 발생한 Master 서버를 복구할 수 있습니다.

### **2.3 장애 상황 생성**

마찬가지로 장애 상황을 만들기 위해 Master DB인 db002 컨테이너를 정지시켜 보겠습니다.

```shell
docker stop db002
```

위 명령을 실행하면 db002 컨테이너가 정지되어 장애 상황이 발생합니다. 이때, Orchestrator는 설정에 따라 자동으로 Failover를 수행하게 됩니다.

Failover가 정상적으로 수행되면, Cluster는 db002와 db001로 분리되며, db003이 db001의 Slave로 설정 변경되는 모습을 볼 수 있습니다. 이는 Orchestrator가 장애 상황을 정상적으로 감지하고, 새로운 Master로 db001을 승격시킨 후, db003을 db001의 Slave로 재배치한 것을 의미합니다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F2sPNZ%2FbtszRSeO2CJ%2FqX5TWcVVjDxW69LJGhjUtK%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FNoWBJ%2FbtszKcMNo5D%2FPh1BORV3LI6CKc6SY5B7q1%2Fimg.png)
## **정리**

이번 내용에서는 마스터 서버에 장애가 발생했을 때 슬레이브 서버를 마스터 서버로 승격시키는 과정을 자동화하는 `Orchestrator를 활용한 고가용성(High Availability, HA)` 구성에 대해 알아보았습니다.

**하지만, 이렇게 HA 구성을 통해 DB 서버의 장애를 처리하더라도 애플리케이션의 DB 접속 정보가 업데이트되지 않으면 여전히 문제가 발생할 수 있습니다.** 예를 들어, 애플리케이션의 설정 정보에는 장애가 발생한 db001이 master DB로 설정되어 있다면, db001에 문제가 생겨 db002가 새로운 master가 되었을 때에도 애플리케이션은 계속 db001을 바라보도록 설정되어 있고, db001에 접속하려고 계속 시도할 것입니다.

**즉, 데이터베이스 레벨에서는 db001에서 오류가 발생하여 Failover가 이루어져 서비스를 지속할 준비가 되었지만, 애플리케이션에서는 아직도 계속 장애 상황인 것입니다.** 따라서, 이런 상황에서는 애플리케이션의 DB 접속 정보를 오류가 발생한 db001에서 새로운 master인 db002로 변경하는 작업이 필요하고, 이런 경우에는 대부분 전체 애플리케이션을 재시작해야 하는 상황이 발생합니다.

이런 문제를 해결하기 위해 **다음 내용에서는 애플리케이션과 DB 서버 사이에 proxy 역할을 해주는 레이어를 하나 만들어서, 애플리케이션의 설정 변경이나 재시작 없이 자동으로 변경된 master DB로 연결하도록 하는 방법을 알아보도록 하겠습니다.**
