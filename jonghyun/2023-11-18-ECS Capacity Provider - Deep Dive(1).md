ECS Capacity Provider 도입 검토를 진행중이며 공식문서/Blog 내용을 참조하여 Capacity Provider 특성에 대하여 이해한 내용을 바탕으로 정리한 내용이다. 공식 블로그 글을 읽고 내용 이해가 잘 되지 않는 부분은 AWS SA 분에게 도움을 받았다.

## 이용 목적
ECS Capacity Provider 도입을 검토하고자 하는 이유로써는 서비스 특성때문이다.
서비스 특성상 예고 없이 spike 성의 트래픽이 자주 발생하는 서비스 특징을 지닌다. 예기치 못한 상황에서 순간적으로 급증/급감하는 트래픽에 따른 유연성이 부족한 현황이다.
- Scale-Out 과정이 완료(Ready to Serve)되는 시점에서 급증한 트래픽이 다시 급감하여 비효율적인 리소스들을 사용하는 상황 발생한다.
- Scale-Out 메커니즘이 발현된 시점에서 언제 다시 급증하기에는 모르는 상황이기에 함부로 Scale-In을 할 수 없는 상황이다. (현재 수동으로 Scale-In 진행중) 그렇기에  적절한 상황에서의 Scale-In 을 통해 비용절감이 필요하다.

이미지가 여러장 있기에 블로그 링크로 대체 하겠습니다.
**Blog Link**: [링크 클릭](https://anggeum.tistory.com/entry/ECS-ECS-Capacity-Provider-Deep-Dive-1)

## 참조
[+] https://aws.amazon.com/ko/blogs/containers/deep-dive-on-amazon-ecs-cluster-auto-scaling/
