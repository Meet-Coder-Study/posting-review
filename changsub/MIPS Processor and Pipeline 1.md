# Processor Architecture Part1 - MIPS Processor and Pipeline 1

## 선수지식
- MIPS ISA(RISC구조)에 대한 다음과 같은 이해도가 필요하다.
	1. 산술/논리연산자의 종류(add,sub,and,slt…등등)
	2. 메모리 참조 연산의 종류(lw,sw)
	3. 분기 연산자의 종류(beq,j)
- Combinational / Sequential 회로의 차이점
	- Combinational : 단순계산만 하는 회로 -\> **오직 ALU**
	- Sequential : 상태에 따라 결과가 달라지는 회로(flip-flop 이용)
- PC register : Program Counter의 약자로 현재 수행하고자 하는 Program의 주소 또는 다음에 실행하고자 하는 Program의 주소를 담고있는 레지스터이다.
- ALU : CPU의 계산 유닛이라고 보면된다. 1)단순한 산술연산,2)load/stote연산시 메모리 주소를 계산,3)brnach 연산시 타겟주소를 계산하는 역할을 한다.
- Instruction Memory : decode 단계에서 명령어를 읽어오는 메모리이다.
- Data Memory : 연산에 필요한 실제 데이터를 가지고 있는 메모리이다.
- 기본적으로 CPU은 DataPath와 Control로 구성되어있다.
- CPU가 명령어 한 세트를 가져오면 다음과 같은 순서로 해당 명령어를 수행한다.
- Fetching Instructions-\>Decoding-\>Exec 순으로 실행된다.

## Fetching Instructions
- 쉽게 말해 실행한 명령어를 가져오는 단계이다.
- 먼저 PC 레지스터에서 현재 실행할 명령어의 주소를 Adder에 전달하여 4를 더한다.
- 위 동작이 곧 PC = PC + 4를 하여 PC 레지스터에 다음에 실행할 명령어의 주소를 저장하는 과정이다.
- 이러한 명령어 업데이트는 항상 이뤄지는 것이기에 이를 제어하는 Control Signal이 따로 필요없다.
![](Screen%20Shot%202021-12-01%20at%208.57.53%20PM.png)

## Decoding Instructions
- 첫번째, fetched된 명령어의 opcode와 function filed를 각각 Control Unit으로 보내주는 과정이다.
- 두번째, 해당 명령어의 rs,rt 값을 IM에서 읽어온다.
![](Screen%20Shot%202021-12-01%20at%209.05.58%20PM.png)


## Exec1 - R 타입 명령어
![](Screen%20Shot%202021-12-01%20at%209.11.03%20PM.png)
- R 타입의 경우, rs rt는 물론 해당 연산의 결과를 저장하는 rd 레지스터까지 존재한다.
- 아래 그림과 같이 명령어로부터 rs rt 두가지 값을 받고, 해당 값을 CPU의 계산기인 ALU에 넣어줍니다.
- 이후, 계산 결과가 overflow 또는 zero값(false)이 아닌 이상 피드백을 통해 결과를 다시 IM으로 넣어줍니다.다시 되돌아간 값이 쓰여지는 주소는 rd의 주소입니다.
- 이러한 피드백 작용을 매번 발생하지 않기 때문에, **RegWrite**라는 신호를 통해서 제어됩니다.
 ![](Screen%20Shot%202021-12-01%20at%209.11.55%20PM.png)

## Exec2 - I 타입 Load,Store
![](Screen%20Shot%202021-12-02%20at%205.05.17%20PM.png)
- I 타입의 경우, rd 레지스터가 존재하지 않으며 대표적인 연산으로 load와 store가 존재한다.(lw,sw)
- load의 경우, rt 레지스터의 주솟값에 있는 값을 rs에 저장한다.
- store의 경우, rs에 있는 값을 rt의 주솟값에 해당하는 메모리에 저장한다.
- 아래 그림을 보면, Read Addr 1,2를 통해 rs,rt의 값들이 IM에 들어오며 store의 경우, 값을 저장할 주소를 Read Data1으로 보내 ALU를 통해 계산시키는 동시에 Read Data2는 바로 해당 주소에 rs 값을 메모리에 저장시킨다. load연산은 ReadData로 읽은 rs의 주솟값을 ALU로 보내 최종 주소를 계산하고 해당 주소에 존재하는 값을 DM으로 feedback하여 rt에 저장한다.
![](Screen%20Shot%202021-12-02%20at%205.38.21%20PM.png)