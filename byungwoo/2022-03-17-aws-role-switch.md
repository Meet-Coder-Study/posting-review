# AWS Role Assume

## 프롤로그
어느날 회사에서 팀장님이 AWS IAM 이야기를 합니다. AWS Role의 핵심은 Role Assume이지.
역할을 추정한다고? 응? 그래서 궁금해서 찾아봤습니다.

## AWS IAM
AWS Identity and Access Management(IAM)은 AWS 리소스에 대한 액세스를 안전하게 제어할 수 있는 웹 서비스입니다. IAM을 사용하여 리소스를 사용하도록 인증(로그인) 및 권한 부여(권한 있음)된 대상을 제어합니다.
아래는 자격증명(Identity)의 종류입니다.

### Root User
Amazon Web Services(AWS) 계정을 처음 생성하는 경우에는 계정의 모든 AWS 서비스 및 리소스에 대한 전체 액세스 권한을 지닌 하나의 자격 증명으로 시작합니다. 
> ❗일상적인 작업, 심지어 관리 작업의 경우에도 루트 사용자를 사용하지 마실 것을 강력히 권장합니다.


### IAM User
AWS Identity and Access Management(IAM) 사용자는 AWS에서 생성하는 엔터티로서 AWS와 상호 작용하기 위해 해당 엔터티를 사용하는 사람 또는 애플리케이션을 나타냅니다. AWS에서 사용자는 이름과 자격 증명으로 구성됩니다.



### IAM User Group
IAM 사용자 그룹은 IAM 사용자의 집합입니다. 사용자 그룹을 활용하면 다수의 사용자들에 대한 권한을 지정함으로써 해당 사용자들에 대한 권한을 더 쉽게 관리할 수 있습니다.
- 한 사용자 그룹에 여러 사용자가 포함될 수 있으며 한 사용자가 다중 사용자 그룹에 속할 수 있습니다.
- 사용자 그룹은 중첩될 수 없습니다. 즉, 사용자 그룹은 사용자만 포함할 수 있으며 다른 그룹은 포함할 수 없습니다.
- AWS 계정의 모든 사용자를 자동으로 포함하는 기본 사용자 그룹은 없습니다. 이러한 사용자 그룹이 필요한 경우 하나 만들어 새로운 사용자를 각각 해당 그룹에 할당해야 합니다.
- AWS 계정의 IAM 리소스 수와 크기는 제한되어 있습니다.

![group](https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/images/Relationship_Between_Entities_Example.diagram.png)



### IAM Role
IAM 역할은 계정에 생성할 수 있는, 특정 권한을 지닌 IAM 자격 증명입니다. AWS에서 자격 증명이 할 수 있는 것과 없는 것을 결정하는 권한 정책을 갖춘 AWS 자격 증명이라는 점에서 IAM 역할은 IAM 사용자와 유사합니다.

왜 필요한가? 출입증과 같은 개념
외부인 혹은 EC2 인스턴스에 역할을 부여할 수 있음

### [IAM 임시 자격 증명](https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/id_credentials_temp.html)
임시 자격 증명은 기본적으로 IAM 역할에 사용되지만 다른 용도로도 사용됩니다. 일반 IAM 사용자보다 제한된 권한을 갖는 임시 자격 증명을 요청할 수 있습니다. 이렇게 하면 제한된 자격 증명으로는 허용되지 않는 작업을 뜻하지 않게 수행하는 것을 방지할 수 있습니다. 임시 자격 증명의 장점은 설정한 기간이 지나면 자동으로 만료된다는 것입니다. 자격 증명의 유효 기간을 통제할 수 있습니다.
임시자격증명의 장점은 보안을 유지하면서 유연하게 AWS 자원에 대한 권한을 제공할 수 있음

### 정책이란?
정책은 자격 증명이나 리소스와 연결될 때 해당 권한을 정의하는 AWS의 객체입니다.
예를 들어 무엇에 대해서 무엇무엇을 할 수 있다는 매핑 파일 

## 실습
### Role Switch
1. 루트 계정으로 로그인 (가급적 관리자 IAM 사용자를 만들기를 권장하나 실습에서는 따로 제공하지 않음)
2. 테스트 계정 생성 (권한 없음), Tㅁester
3. Tester로 로그인. 아무것도 안보임. S3 메뉴도 안보임
4. S3 접근 권한이 있는 역할 생성, S3TestRole
- Maximum session duration 설정으로 만료시간을 설정할 수 있음 (기본값 1시간)
4. STS policy 생성
5. Tester로 로그인. Switch Role 클릭
6. Tester로 S3 메뉴 접근

### 교차 계정 Role Switch
- 위의 Role Switch에서 역할 생성시 `다른 AWS 계정(Another AWS account)`을 선택하면 됨

# 참고
- [역할 전환](https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/id_roles_use_switch-role-console.html)
- [AWS IAM 역할(Role)은 정확히 무엇인가요? 어떻게 써야 할까요](https://jonnung.dev/posts/2021-01-28-aws-iam-role/)
- https://whchoi98.gitbook.io/aws-iam/iam-role