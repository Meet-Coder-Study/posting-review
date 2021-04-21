# 시스템 구성 정보 확인하기


인프라/시스템 엔지니어가 아닌 이상 서버의 시스템 구성 정보를 직접 확인하는 일은 드문 일입니다. 그러나 어플리케이션 역시 서버의 시스템 위에 구동되기 때문에 어플리케이션의 성능 역시 시스템으로부터 자유로울 수는 없을 것입니다. 깊게는 아니더라도 [DevOps와 SE를 위한 리눅스 커널 이야기](http://www.yes24.com/Product/Goods/44376723) 의 `1. 시스템 구성 정보 확인하기`를 읽고 정리해보았습니다. 

## 1. 커널 정보 확인하기

### uname (Unix NAME)
uname 명령어를 사용하여 커널버전을 확인할 수 있스습니다.
```bash
> uname -a
Linux ${호스트명} 3.10.0-693.11.1.el7.x86_64 #1 SMP Mon Dec 4 23:52:40 UTC 2017 x86_64 x86_64 x86_64 GNU/Linux
# Linux -> 커널명
# ${호스트명} -> 호스트명
# 3.10.0-693.11.1.el7.x86_64 -> 커널 릴리즈 번호
# #1 SMP Mon Dec 4 23:52:40 UTC 2017 -> 커널 버전과 빌드된 날짜 정보
# x86_64 -> 시스템 아키첵처 정보
# GNU/Linux -> OS
```

운영체제의 정확한 버전을 알고 싶다면 다음과 같이 확인할 수 있습니다.
```bash
> cat /etc/*-release
CentOS Linux release 7.4.1708 (Core)
```

### dmesg (Display MESsaGe, Driver MESsaGe)
dmesg 명령어를 통해서 커널이 부팅할 때 나오는 메시지와 운영 중에 발생하는 메시지를 볼 수 있습니다.
```bash
> dmesg | grep -i kernel | more
Command line : ro root=UUID=3e7b88fa-c176-4c82-b309-c74eea5752e0
intel_idle.max_cstate=0 crashkernel=auto biosdevname=0 console=tty0
console=ttyS1 # 커널파라미터
Reserving 129MB of memory at 48MB for crashkernel (System RAM : 9216MB) # crashkernal
Memory : 32834356k/3407816k available (5428k kernel code, 534728k absent,
709632k reserved, 6982k data, 1300k init) # 메모리
```
- dmesg를 사용해서 부팅시 사용한 커널 파라미터를 확인할 수 있습니다.
- `crashkernel` 단어를 통해서 `crashkernel` 대한 이미지를 로딩했다는 것을 알 수 있습니다. 커널은 다양한 이유로 [커널 패닉](https://namu.wiki/w/%EC%BB%A4%EB%84%90%20%ED%8C%A8%EB%8B%89) 상태에 빠질 수 있습니다. 커널 패닉 상태에 빠지게 되면 사용자의 입력을 받아들일 수 없게 됩니다.
- `Memory:` 단어를 통해서 부팅시에 커널이 인식하는 메모리의 정보를 확인할 수 있습니다.

`/boot/config-$(uname -r)` 파일 시스템 조회를 통해서 부팅 커널 컴파일 파라미터를 확인할 수 있습니다.  
```bash
> cat /boot/config-$(uname -r) | more
# ...
CONFIG_64BIT=y
CONFIG_X86_64=y
CONFIG_X86=y
# ...
```

## 2. CPU 정보 확인하기
### dmidecode -t processor (Desktop Management Interface table DECODEr)
dmidecode 명령어를 통해서 CPU(processor) 정보를 확인할 수 있습니다.
```bash
> dmidecode -t processor
# ...

# Socket 1
Handle 0x0400, DMI type 4, 42 bytes
Processor Information
        Socket Designation: CPU1
# ...
        Version: Intel(R) Xeon(R) CPU E5-2620 v4 @ 2.10GH
# ...
        Core Count: 8
        Thread Count: 16

# Socket 2
Handle 0x0401, DMI type 4, 42 bytes
Processor Information
        Socket Designation: CPU2
# ...
```
`dmidecode -t processor`의 결과로 Socket, Core Count, Thread Count 정보를 확인할 수 있습니다.
- Socket: 물리적 CPU
- Core Count: CPU 코어 개수
- Thread Count: [하어퍼스레딩](https://ko.wikipedia.org/wiki/%ED%95%98%EC%9D%B4%ED%8D%BC%EC%8A%A4%EB%A0%88%EB%94%A9) 기술을 통해서 사용가능한 멀티코어 개수. 논리적 코어 개수.

`/proc/cpuinfo` 파일 시스템을 조회하는 방법으로도 CPU에 대한 정보를 확인할 수 있습니다. 여기서 각각의 processor는 위에서 확인한 Thread와 동일한 32개의 논리적 코어를 의미합니다.
```bash
> cat /proc/cpuinfo
# 0번째 프로세서
processor       : 0
vendor_id       : GenuineIntel
cpu family      : 6
model           : 79
model name      : Intel(R) Xeon(R) CPU E5-2620 v4 @ 2.10GHz
# ...

# 32번째 프로세서
processor       : 31
# ...
```

추가적으로 lscpu 명령어를 통해서 집계된 CPU 정보(Socket, Core, Thread)를 확인할 수 있습니다.
```bash
> lscpu
Architecture:          x86_64
CPU op-mode(s):        32-bit, 64-bit
Byte Order:            Little Endian
CPU(s):                32
On-line CPU(s) list:   0-31
Thread(s) per core:    2
Core(s) per socket:    8
Socket(s):             2
NUMA node(s):          2
Vendor ID:             GenuineIntel
CPU family:            6
Model:                 79
Model name:            Intel(R) Xeon(R) CPU E5-2620 v4 @ 2.10GHz
# ...
```

## 3. 메모리 정보 확인하기
### dmidecode -t memory
`dmidecode -t memory` 명령어를 통해서 메모리 보드와 메모리를 확인할 수 있습니다.
- Physical Memory Array: 메모리가 꽂혀있는 보드
- Memory Device: 실제로 시스템에 꽂혀 있는 메모리 장비
```bash
> dmidecode -t memory
# ...
Handle 0x1000, DMI type 16, 23 bytes
Physical Memory Array
# ...

Handle 0x1100, DMI type 17, 40 bytes
Memory Device
# ...

Handle 0x1100, DMI type 17, 40 bytes
Memory Device
# ...
```

메모리 카드의 개수가 많기 때문에 다음과 같이 Memory Device만 필터해서 볼 경우 16G 메모리 2개가 꽂혀 있는 것을 확인할 수 있습니다.
```bash
> dmidecode -t memory | grep -i size:
        Size: 16384 MB
        Size: No Module Installed # 빈 슬롯
# ...
        Size: 16384 MB
        Size: No Module Installed # 빈 슬롯
# ...
```

free 명령어를 통해서 총 32G 시스템 메모리 사이즈를 확인할 수 있습니다.
```bash
> free -m
              total        used        free      shared  buff/cache   available
Mem:          31896        9135        7090        1158       15669       13733
Swap:          4095        1411        2684
```

## 4. 디스크 정보 확인하기
### df (Disk Free)
df 명령어를 통해서 파티션과 디스크 타입을 확인할 수 있습니다.
- hda: IDE(Integrated Drive Electronics, 주로 개인용 인터페이스) 방식의 디스크입니다.
- sda: SCSI(Small Computer System Interface, 주로 서버용 인터페이스) 방식의 디스크와 최근에 나오는 SATA(Serial Advanced Technology Attachment), SAS(Serial Attached SCSI)와 같은 일반적인 하드디스크입니다.
- vda: 가상서버에서 흔히 볼 수 있는 디스크 타입이며 하이퍼바이저 위에서 동작 중인 서버에서 볼 수 있습니다.
```bash
# 물리서버에서
> df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        20G   13G  7.9G  61% /
# ...

# 가상서버(VM)에서
> df -h
Filesystem                        Size  Used Avail Use% Mounted on
/dev/vda2                          98G   82G   17G  84% /
# ...
```

참고로 물리서버인지 가상서버인지 직접적으로 확인하는 방법은 다음과 같습니다.
```bash
# 물리
> dmidecode -s system-product-name
PowerEdge R630 # Dell
# 가상(VM)
> dmidecode -s system-product-name
OpenStack Nova # 오픈스택 가상화 기술
```

### smartctl (self-Monitoring, analysis and reporting technology)
smartctl 명령어를 통해서 디스크의 물리적인 정보(제조사, 시리얼번호, 펌웨어 버전)를 확인할 수 있습니다. [RAID 컨트롤러](https://m.blog.naver.com/vspress/220899481343) 를 통해서 만들어진 논리적 볼륨일 경우 RAID 컨트롤러를 -d 옵션에 추가하여 디스크의 정보를 확인할 수 있다.
```bash
# smartctl -a ${디스크 위치} -d ${RAID 컨트롤러},${디스크 베이 번호}
> smartctl -a /dev/sda -d megaraid,0
# ...
/dev/sda [megaraid_disk_00] [SAT]: Device open changed type from 'megaraid,0' to 'sat+megaraid,0'
=== START OF INFORMATION SECTION ===
Device Model:     SSDSC2KG960G7R
Serial Number:    BTYM73100EE2960CGN
LU WWN Device Id: 5 5cd2e4 14de5e59f
Add. Product Id:  DELL(tm)
Firmware Version: SCV1DL56
# ...
```

## 5. 네트워크 정보 확인하기
### lspci (LiSt PCI)
lspci 명령어를 통해서 네트워크 카드의 정보를 확인할 수 있습니다.
```bash
> lspci | grep -i ether
01:00.0 Ethernet controller: Broadcom Limited NetXtreme BCM5720 Gigabit Ethernet PCIe # 제조사: Broadcom
```

### ethtool 
ethtool 명령어를 통해서 해당 네트워크 카드가 어느정도의 속도까지 지원이 가능한지, 연결되어 있는 속도는 얼마인지, 네트워크 연결은 정상적인지 확인할 수 있습니다.
- 1000baseT/Half 1000baseT/Full -> 최대 1000Mb/s를 지원함을 의미 ([참고](https://ddooooki.tistory.com/16))
- Speed: 1000Mb/s -> 현재 속도
- Link detected: yes -> 네트워크 연결 정상 여부
```bash
> ethtool eth0
Settings for eth0:
        Supported ports: [ TP ]
        # 지원 속도
        Supported link modes:   10baseT/Half 10baseT/Full
                                100baseT/Half 100baseT/Full
                                1000baseT/Half 1000baseT/Full
        Supported pause frame use: No
        Supports auto-negotiation: Yes
        # 지원 속도
        Advertised link modes:  10baseT/Half 10baseT/Full
                                100baseT/Half 100baseT/Full
                                1000baseT/Half 1000baseT/Full
# ...
        # 현재 속도
        Speed: 1000Mb/s
# ...
        # 네트워크 연결 정상 여부
        Link detected: yes
```

`ethtool -i`를 통해서 네트워크 카드의 자세한 정보를 확인할 수 있습니다. 특정 커널 드라이버에서 문제가 생겼을 경우 서버의 네트워크 카드가 어떤 커널 드라이버를 사용하는지 확인할 때 사용합니다.
```bash
> ethtool -i eth0
driver: tg3
version: 3.137
firmware-version: FFV20.6.52 bc 5720-v1.39
expansion-rom-version:
bus-info: 0000:01:00.0
supports-statistics: yes
supports-test: yes
supports-eeprom-access: yes
supports-register-dump: yes
supports-priv-flags: no
```

## 참고
- [DevOps와 SE를 위한 리눅스 커널 이야기](http://www.yes24.com/Product/Goods/44376723)
- [Linux Kernal Basic - 1. 시스템 구성 정보 확인하기](https://jihooyim1.gitbooks.io/linuxbasic/content/contents/01.html)