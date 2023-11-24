저번주 내용에 이어 분리하여 작성을 진행하려 하였으나 추가를 진행하는 것이 더 좋다고 생각이 들어 추가를 진행하여 업로드 하였습니다.
이미지가 다수 첨부되어 있기에 블로그로 보시는 것을 권장드립니다.

[블로그 링크](https://anggeum.tistory.com/entry/ECS-ECS-Capacity-Provider-Deep-Dive-1)

## 추가 내용
### CPR = 50로 설정되는 경우 예시 추가
① 운영에 요구되어지는 인스턴스 수량은 10(=M)개로 CAS가 판단하며 CPR = 0.5를 만족하기 위해 EC2를 20대 생성을 진행한다. 여기서 10대는 예비 인스턴스로 구성되어지며 별도의 Task는 할당되지 않는다.

② ~ ③ Spike성 트래픽이 발생하는 경우, CAS가 운영에 요구되어지는 수량은 20(=M)으로 판단하는 경우(가정), CPR = 0.5를 만족하기 위해 동작중인 EC2는 총 40대가 되어지게 된다. 여기서 20대는 예비 인스턴스로 이루어진다.

④ ~ ⑤ Spike 성 트래픽이 다시 발생하는경우, CAS 가 운영에 요구되어지는 수량은 40(=M)으로 판단하는 경우(가정) CPR = 0.5를 만족하기 위해 동작중인 총 EC2는 80대로 구성되며, 여기서 40대는 예비 인스턴스로 이루어진다.
(* 예비인스턴스 = Task가 할당되지 않은 인스턴스)

### M에 대한 고찰
Capacity Provider Reservation 에 대해서 한가지 의문이 들 것이다. M(필요한 인스턴스 개수)는 어떤 근거로 산정이 되어지는 부분이다.

공식 문서/블로그 내용을 보았을 때, CAS에서 정의하는 M 은, 
"필요한 인스턴스(M) 적절한 개수를 선정하는 것은 굉장히 어려운 부분이며 이러한 고민을 덜어줄 수 있도록 CAS는 적절한 M값을 구하는데 있어 좋은 추론을 해주는 역할을 수행한다. 여기서 M은 서비스를 운영하는데 최소로 필요한 개수이다" 
[+] https://aws.amazon.com/ko/blogs/containers/deep-dive-on-amazon-ecs-cluster-auto-scaling/
Since we can’t in general know the optimal value of M, CAS instead tries to make a good estimate. CAS can estimate a lower bound on the optimal number of instances to add based on the instance types that the ASG is configured to use, and use that value for M. In other words, you will need at least M more instances to run all of the provisioning tasks. CAS calculates M in this case as follows:

여기서 중요한 특징중 하나는, 구성되는 예비 인스턴스들(증설대상)에 대하여 Spot Instance + 다른 EC2 Type을 지정할 수 있으며 이를 통해 비용절감의 효과를 기대할 수 있다.

‘M’ 값의 산정은 기본적으로  binpack 방식으로 계산이 이루어지며 실제 scaling을 binpack으로 진행한다.
(하지만 사용자가 지정한 placement strategy가 있다면 이 기준이 우선적으로 적용 된다.)

예를 들자면, 1개의 Task가 2 CPU, 메모리 8G,  를 사용하도록 정의 되어 있고 Task가 할당된 인스턴스 유형은  g5.4xlarge (vCPU 16, GPU memory 24GB) 로 주어지는 상황을 가정하자.
여기서, 트래픽 유입으로 10개의 추가 task가 필요해 진다고 하면 총 20 CPU, 80G 메모리가 필요되어진다. 필요한 총 CPU 개수는 20개 이므로 이를 충족하기 위해 필요한 ‘M’은 2개가 되지만 (20/16 = 1.25) GPU 메모리 필요량은 80GB 이므로 필요한 ‘M’은 4개이다. (80/24 = 3.33..)

이 경우 필요한 M은 4로 산정이 된다.
 

또한, Scaling이 되어 결정되는 최종 M의 값은 [N + minimumScalingStepSize, N + maximumScalingStepSize] 의 범위를 벗어나지 않는다.
- minimumScalingStepSize ,  maximumScalingStepSize  값은 항상 양의 값으로 정해져야 하며. minimumScalingStepSize = 1 , maximumScalingStepSize  = 10000 의 기본값을 지니게 된다.
- minimumScalingStepSize,  maximumScalingStepSize 값 설정은 CLI 명령어를 통해서만 조정이 가능하다.
[+] https://docs.aws.amazon.com/cli/latest/reference/ecs/create-capacity-provider.html

### 추가 검토사항
블로그 내 ECS Capacity Provider 을 이용하는데 있어 ECS Task 배치 제약 유형으로 distinctInstace 외엔 권장하지 않는다고 해석되는 문구.

Task placement constraints are considered. However, any placement constraint other than distinctInstance is not recommended.
distinctInstance 내용을 이해하기 위해 아래 공식문서 내용을 참조해본 결과, distinctInstance EC2 : Task  비율을 1:1 로 가져가는 것으로 해석이 되는데 여기서, CAS를 이용하는 경우 1인스턴스에 1 task가 할당되도록 권장하는 내용인지 확인 필요.
