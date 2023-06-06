# eBPF
## ebpf란?
![Overview](https://ebpf.io/static/e293240ecccb9d506587571007c36739/b14d5/overview.png)
> extend the capabilities of the kernel without requiring to change kernel source code or load kernel modules.

커널 변경 없이 커널에 코드를 삽입해 커널단에서 observability를 향상시키거나, 특정한 call을 수행시키는 등의 행위를 할 수 있는 기술이다.

원래는 Berkeley Packet Filter라는 이름으로 BPF로 출범했지만, 이후 extended version인 eBPF가 등장하고, 단순 패킷필터링보다 더 많은 작업을 수행하게 됨으로써 단순한 packet filter 기술이 아니라 "BPF"라는 단일어로 사용되는 기술이 되었다.

![Syscall hook](https://ebpf.io/static/b4f7d64d4d04806a1de60126926d5f3a/b14d5/syscall-hook.png)

- 커널 함수를 호출하여 커널 호출 시 특정한 동작을 수행하거나 
- 미리 지정된 시스템 콜을 호출하여 커널 동작에 영향을 주는 등의 작업을 할 수 있다.

## how to?
c로 이루어진 BPF 코드를 짜 bytecode로 변환하고, kernel에 로드하면 된다. 그렇지만 이건 너무 어려운 일이고, 개발자 입장에서 쉽지 않은 일이니 다른 방법을 찾아보자.
### eBPF frontend
![](https://www.brendangregg.com/eBPF/ebpf_tracing_landscape_jan2019.png)
#### raw BPF
쓰지마세요...이거아니야...

#### BCC
https://github.com/iovisor/bcc
![](https://github.com/iovisor/bcc/raw/master/images/bcc_tracing_tools_2019.png)
가장 일반적으로 사용되고, 접근성이 높으며, 라이브러리 업데이트가 빠르고 레퍼런스가 가장 많은 툴킷/라이브러리다. 일반적으로 bpf를 활용할때 가장 먼저 고려하게 되는 frontend이다, JIT로 bpf 프로그램을 컴파일하여 커널에 로드시켜 준다.

- kprobe(커널 동작 추적)
- kretprobe(커널 동작 끝날시 호출되는 시스템)
- uprobe(userspace 동작 추적)
- uretprobe(userspace 동작 끝날시 호출)

기본적으로 python을 기반으로 구성되어있고 pip를 통해 설치가 가능하다.

#### bpftrace
https://github.com/iovisor/bpftrace
![](https://github.com/iovisor/bpftrace/raw/master/images/bpftrace_probes_2018.png)
one-line으로 복잡한 언어 설정/실행과정이 적게 bpf프로그램을 실행할 수 있고, 이를 통해 간단한 수준의 bpf programming을 할 수 있는 장점이 있는 frontend다.

- kprobe
- kretprobe
- uprobe
- uretprobe

모두를 활용할 수 있지만, bcc에 비해 범위가 다소 떨어지는 것은 사실이다.

#### BPF-CORE & libbpf
https://nakryiko.com/posts/bpf-core-reference-guide/
https://github.com/libbpf/libbpf

bcc의 제한성이 마음에 들지않아, 직접 bpf프로그램을 CORE(Compile Once – Run Everywhere)를 활용해 compile하고, 이후 libbpf로 커널에 로드하여 활용하는 경우로 활용하는 케이스가 많다.
bcc가 지원하지 않는 툴킷을 활용하거나 시스템콜이 필요하다면 반드시 활용해야 하지만, 커널단의 직접 조작을 필요로 하지 않는다면 대부분의 경우 고려하지 않아도 된다.
bcc에 비해서 압도적으로 좋은 점은 jit compiler가 아니다보니 디펜던시 이슈가 적고, 이를 통해 compile된 byte code자체의 용량도 10배 이상 차이 난다는 점.
