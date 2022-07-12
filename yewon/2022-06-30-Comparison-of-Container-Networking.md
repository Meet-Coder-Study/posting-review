# A Comparison of Container Networking

## network latency의 major factor
  - OS network stack을 통과할 시에 
  - kernel의 context switch 시에
  - NIC과 user-level buffer 간의 과도한 데이터 이동시
- clustering, orchestration, replica task등을 수행해야 하기 때문에 intercontainer network 성능이 중요
- docker overlay mode에서 docker가 common하게 쓰는 tunneling 기술은 VxLAN.
  - shared-memory를 사용하는 방식보다 처리량이나 latency 손해
  - TCP/IP 스택을 local에서 한번, v-switch 에서 두번 돌아서.

## methods

### Flannel & Weave

- Flannel - 원래의 패킷을 UDP로 한번 더 감싸서, 출발지, 목적지의 정보를 담아 전달.
- Weave - docker 컨테이너들을 한겹으로 감싸서 가상 네트워크 생성.

### DPDK(Data Plain Development Kit)

- data plain 라이브러리 + NIC 드라이버
- OS 커널을 건너띄고 전용 CPU 코어를 할당받아 패킷을 전달
- kernel에서 해당 패킷을 처리하는게 아니라, DPDK의 라이브러리가 해당 패킷을 처리
- 네트워크 스택을 따르는 일반적으로 아는 "패킷"을 부여받음
- 이를 통해 kernel이 원래 수행하던 패킷 처리 기능을 직접 구현해야 함

### OvS-DPDK

- Open vSwitch - hypervisor단에서 switch 가상화
- switch 가상화를 통해 netlink를 구현해두고, 그 위에 DPDK를 활용.

### RDMA

- network 대기시간 🔽
- host의 CPU 처리비용 🔽
- data transport 비용 🔽 (OS bypass로)
- kernel overhead 🔽 처리량🔼
