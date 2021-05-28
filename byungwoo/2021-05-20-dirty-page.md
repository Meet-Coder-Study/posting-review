# dirty page가 I/O에 미치는 영향 

## 1. dirty page란
- 아래와 같이 커널은 PageCache를 이용해서 디스크에 있는 파일의 내용을 메모리에 잠시 저장하고, 필요할 때마다 메모리에 접근해서 사용
  ![image](https://t1.daumcdn.net/thumb/R1280x0/?fname=http://t1.daumcdn.net/brunch/service/user/3Y0/image/67kq6rzLGnrsfH8FaO50KCWQWLA.png)

### Dirty Page
> 읽은 파일이 디스크에 업데이트 되지 않고 page cache 내 특정 공간에만 업데이트 되어 있는 경우가 있는데 이때 그 특정 공간을 dirty page라고 함
![image](https://t1.daumcdn.net/thumb/R1280x0/?fname=http://t1.daumcdn.net/brunch/service/user/3Y0/image/VlfUgu465zooZluSshi1WBNR3Ow.png)

### Page Writeback (Dirty Page 동기화 과정)
#### 순서
1. PageCache b == Disk b
    - 맨 처음 pagecache에 있는 데이터와 디스크에 있는 데이터는 동일한 데이터를 유지
2. PageCache d != Disk b
    - b 파일이 d로 변경
    - 이때 커널은 변경된 내용을 디스크에 바로 저장하지 않고 매핑된 page cache의 내용을 변경
    - 그리고 해당 페이지는 ditry page가 됨
3. PageCache d == Disk d
    - 그 후 일정한 조건이 되면 커널은 다양한 방법으로 dirty page의 내용을 실제 디스크에 쓰게 되며 이런 일련의 과정을 **dirty page 동기화**라고 함
#### 의의
- dirty page가 생성될 때마다 디스크에 쓰게 되면 상당량의 쓰기 I/O를 일으켜서 성능을 저하시킬 수 있음
- 따라서 커널은 몇가지 조건을 만들어서 해당 조건을 만족시키면 dirty page로 디스크를 동기화 (=page writeback)
- 보통 flush라는 단어가 들어간 커널 스레드(pdflush, flush, bdflush 등)가 이 작업을 진행
- I/O가 많이 발생하는 서버에서는 dirty page를 언제 얼마나 동기화 시키느냐가 중요한 성능 튜닝의 요소

## 2 dirty page 관련 커널 파라미터
```bash
> sysctl -a | grep -i dirty
vm.dirty_background_ratio = 10
vm.dirty_background_bytes = 0
vm.dirty_ratio = 20
vm.dirty_bytes = 0
vm.dirty_writeback_centisecs = 500
vm.dirty_expire_centisecs = 1000
```

### 1. vm.dirty_background_ratio
> dirty page의 내용을 백그라운드로 동기화할 때 그 기준이 되는 비율
- ex) 10 -> dirty page가 전체 메모리의 10/100일 때 실행
- vm.dirty_ratio보다 크면 vm.dirty_ratio의 절반값으로 수정된다.

### 2. vm.dirty_background_bytes
> dirty page의 내용을 백그라운드로 동기화할 때 그 기준이 되는 절대적인 bytes 값
- 0보다 높게 설정할 경우 `vm.dirty_background_ratio` 값은 무시된다.

### 3. vm.dirty_ratio
> dirty page에 대한 싱크 작업을 background로 하지 않고 해당 프로세스의 쓰기 I/O를 블락시킨 후 수행하는 싱크 작업의 기준 비율. dirty page에 대한 일종의 hard limit
- ex) 20 -> dirty page가 전체 메모리의 20/100일 때 실행
- 최소값은 5이며 5보다 작은 값으로 해도 강제로 5로 재설정 된다.

### 4. vm.dirty_bytes
> dirty page에 대한 싱크 작업을 background로 하지 않고 해당 프로세스의 쓰기 I/O를 블락시킨 후 수행하는 싱크 작업의 기준이 되는 절대적인 bytes 값
- 0보다 높게 설정할 경우 `vm.dirty_ratio` 값은 무시된다.

### 5. vm.dirty_writeback_centisecs
> flush 데몬이 background에서 깨어나는 기준이 되는 값. 이 값에 해당하는 시간을 주기로 캐시를 체크해서 dirty page들을 디스크에 flush함
- ex) 500 -> 5초
- 0으로 설정할 경우 flush 데몬 스레드를 주기적으로 실행하지 않는다.

### 6. vm.dirty_expire_centisecs
>  vm.dirty_writeback_centisecs 값에 의해 깨어난 flush 커널 스레드가 디스크에 싱크시킬 dirty page의 기준을 찾을 때 기준이 되는 값
- ex) 1000 -> 10초

### 유의사항
- 위의 6개의 값들은 완전히 독립적으로 동작하지 않는다.
- ex)
  - flush 커널 스레드가 자주 실행될 경우 (vm.dirty_writeback_centisecs, vm.dirty_expire_centisecs 값이 작을 경우)
  - vm.dirty_background_ratio에 설정된 기준만큼 dirty page가 캐시에 존재하기도 전에 비워질 수 있음


## 3. dirty page 동기화 방식 종류
### (1) 백그라운드 동기화
>  dirty page의 생성량이 일정 수준을 넘으면 백그라운드로 flush 커널 스레드가 동작하면서 동기화하는 방식
- `vm.dirty_background_ratio`와 `vm.dirty_ratio`를 통해서 조절 가능 (명령어를 통해서 명시적으로 이루어지지 않는 동기화)

### (2) 주기적 동기화
> 일정 시간을 주기로 flush 커널 스레드가 깨어나서 특정 조건에 해당하는 dirty page를 동기화하는 방식
- `vm.dirty_writeback_centisec`, `vm.dirty_expire_centisecs`를 통해서 조절 가능

### (3) 명시적 동기화
> sync, fsync 등의 명령어를 통해 명시적으로 동기화시키는 방식
- ex) `sync` 명령어를 직접 사용하여 dirty page를 비울 수 있다

## 4. dirty page 동기화 예제
### (1) 백그라운드 동기화 예제
- (참고) 기본값 복원시
```bash
sudo sysctl -w vm.dirty_writeback_centisecs=500
sudo sysctl -w vm.dirty_background_ratio=10
```
- 설정 변경
```bash
sudo sysctl -w vm.dirty_writeback_centisecs=0 #주기적 동기화 off
sudo sysctl -w vm.dirty_background_ratio=1 #백그라운드 동기화 기준 1/100
```
- 초당 1MB 쓰기작업을 일으키는 `test_dirtypage.c` 작성
```c
#include <stdlib.h>
#include <stdio.h>
#include <fcntl.h>

#define MEGABYTE 1024*1024

int main(){

int output_fd;
char message[MEGABYTE] = "";
char file_name[] = "./test.dump";

int count = 0;

output_fd = open(filename, O_CREAT | O_C_RDWR | O_TRUNC);

for(;;){
 count++;
 write(output_fd, message, MEGABYTE);
 printf("Write File - Current Size : %d KB\n", count*1024);
 sleep(1);
 }

 return 0;
}
```
- 컴파일 및 실행
```bash
# 컴파일
> gcc -o test test_dirtypage.c #컴파일
# 실행
> ./test
Write File - Current Size : 1024 KB
Write File - Current Size : 2048 KB
Write File - Current Size : 3072 KB
# ...
```
- dirty page 모니터링
```bash
> cat show_dirty.sh
#!/bin/bash
while true
do
 cat /proc/meminfo | grep -i dirty
 sleep 1
done

> ./show_dirty.sh
# ... 
Dirty:              83100 kB
Dirty:              84044 kB
Dirty:              85068 kB
Dirty:                 72 kB
# ...
```
- 전체 시스템 메모리 8GB 중에서 1/100수준인 80MB 수준에서 dirty page 동기화가 진행된다.

### (2) 주기적 동기화 예제
- (참고) 기본값 복원시
```bash
sudo sysctl -w vm.dirty_background_ratio=10
sudo sysctl -w vm.dirty_ratio=20
sudo sysctl -w vm.dirty_writeback_centisecs=500
sudo sysctl -w vm.dirty_expire_centisecs=3000
```
- 설정 변경
```bash
sudo sysctl -w vm.dirty_background_ratio=20 #20%로 상향 조정
sudo sysctl -w vm.dirty_ratio=40 #40%로 상향 조정
sudo sysctl -w vm.dirty_writeback_centisecs=500 #5초마다 flush 커널 스레드 깨움
sudo sysctl -w vm.dirty_expire_centisecs=1000 #10초가 넘은 dirty page 동기화
```
- 실행
```bash
# 실행
> ./test
Write File - Current Size : 1024 KB
Write File - Current Size : 2048 KB
Write File - Current Size : 3072 KB
# ...
```
- dirty page 모니터링
```bash
> ./show_dirty.sh
Dirty:                24 kB
Dirty:              1080 kB
Dirty:              2252 kB
Dirty:              3316 kB
Dirty:              4340 kB
Dirty:              5236 kB
Dirty:              6268 kB
Dirty:              7292 kB
Dirty:              8452 kB
Dirty:              9476 kB
Dirty:                60 kB
# ...
```
- 10초가 넘어가는 10~15MB 사이의 구간에서 5초 주기로 깨어나는 flush 커널 스레드가 작동한다.
- 다시 말해서 생성된지 10초가 넘은 시점에서 dirty page를 비운다. (dirty page 동기화)

## 3. 동작방식 비교: 백그라운드 동기화 vs. 주기적 동기화
![image](https://jihooyim1.gitbooks.io/linuxbasic/content/contents/img/background_sync_and_cycle_sync.png)
- 결국 wb_do_writeback() 함수는 백그라운드와 주기적 동기화 두가지 방식에서 모두 호출된다.
- vm.dirty_background_ratio로 백그라운드 동기화 스레드를 깨우든 vm.dirty_writeback_centisecs로 주기적 동기화 스레드를 깨우거든 background ratio에 맞게 dirty page를 동기화하는 것뿐 아니라 생성된 지 특정 시간 이상이 된 dirty page 동기화도 함께 진행한다는 것을 알 수 있다.
- **다시 말해서 백그라운드 동기화와 주기적인 동기화는 flush 커널 스레드를 깨우는 기준은 다르지만 실제로 실행하는 작업은 동일하다.**

## 4 dirty page 설정과 I/O 패턴 분석 및 적용
### Case 1 vs. Case 2.
| 구분 | dirty_background_ratio | dirty_radio | dirty_writeback_centisecs |dirty_expire_centisecs |비고|
| --- | --- | --- | --- | --- |--- |
| Case 1 | **10 (=10%)** |  20 (=20%) | 500 (=5초) | **3000 (=30초)** |Case 2에 비해 '덜 자주' 동기화|
| Case 2 |**1 (=1%)**|  20 (=20%) | 500 (=5초) |**1000 (=10초)** | Case 1에 비해 '자주' 동기화|
- 공통
    - vm.dirty_background_bytes=0, vm.dirty_bytes=0 (bytes로 설정하는 절대값 기준 동기화는 off)
    - 총 시스템 메모리: 8GB
    - `iostat -x`로 IO 사용량(util) 조회하여 비교

#### Case 1
- Dirty Page 변화: 0 kb -> 800MB -> 0 kb
- I/O 사용량(util): 0% -> 100% -> 0%
- flush 커널스레드가 깨어나는 조건이 더 길어지는 대신에 한 번에 동기화해야하는 양이 더 많기 때문

#### Case 2
- Dirty Page 변화: 0kb -> 80MB (Case 1번과 비교하여 1/10의 수준) -> 0kb
- I/O 사용량(util): 0% -> 98% -> 0% (최대 98%로 Case 1보다는 작아졌다)
- 자주 flush 커널스레드가 깨어나지만 한 번에 동기화해야하는 양이 Case 1에 비해 적기 때문

### 분석
#### flush 커널
- 자주 깨어나면 io util(%)이 비교적 적지만 flush 커널 스레드가 자주 깨어나는 단점이 있음
- flush 커널 스레드가 너무 자주 깨어나면 스케줄링에 대한 오버헤드가 발생
- 멀티 스레드 환경의 애플리케이션의 경우 불필요하게 자주 깨어나는 flush 커널 스레드에 cpu 리소스를 빼앗길 수 있기 때문에 성능 저하가 발생할 수 있음
-  늦게 깨우면 flush 커널 스레드는 자주 깨어나진 않지만 io util(%)가 높아지는 단점이 있음

### 적용
- 초당 1MB의 dirty page를 생성하는 애플리케이션이 서로 다른 두개의 시스템에서 동작하고 있다고 가정
#### 초당 10MB의 쓰기작업을 견딜 수 있는 A 시스템 vs. 초당 100MB의 쓰기 작업을 견딜 수 있는 B 시스템
- A 시스템은 10MB단위로 dirty page를 동기화할 수 있도록 설정하는 것 이 전체적인 성능에 도움이 된다
- B 시스템은 디스크의 성능이 좋기 때문에 굳이 10MB 수준에서 flush 커널 스레드를 깨울 필요가 없다
- **결론적으로 같은 애플리케이션을 사용하더라도 운영하고 있는 시스템에 따라 dirty page 동기화는 다른 전략을 취해야 한다**

## 5 요약
- vm.dirty_ratio의 최소값은 5이다. 5보다 작은 값으로 해도 강제로 5로 재설정된다.
- vm.dirty_background_ratio가 vm.dirty_ratio보다 크면 강제로 절반값으로 수정된다.
- vm.dirty_background_bytes, vm.dirty_bytes 값이 설정되어 있다면 각각 vm.dirty_background_ratio, vm.dirty_ratio 값은 무시된다.
- vm.dirty_writeback_centisecs가 0이면 주기적인 동기화를 실행하지 않는다.
- vm.dirty_ratio에 설정한 값 이상으로 dirty page가 생성되면 성능 저하가 발생한다.
- dirty page를 너무 빨리 동기화시키면 flush 커널 스레드가 너무 자주 깨어나게 되며, 너무 늦게 동기화시키면 동기해야할 dirty page가 많아서 vm.dirty_ratio에 도달할 가능성이 커지게 된다. 따라서 워크로드와 시스템 구성에 맞게 dirty page 동기화 수준을 설정해주어야한다.

# 참고
- https://jihooyim1.gitbooks.io/linuxbasic/content/contents/10.html
- https://brunch.co.kr/@alden/32
- https://brunch.co.kr/@alden/33
- https://jjudrgn.tistory.com/26