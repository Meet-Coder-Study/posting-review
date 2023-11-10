## Goal
Auto Scaling Group 내 인스턴스들의 Memory 지표값들을 Group Level에서 산출하여 관측하는 것을 목적으로 한다.


## Issue
메모리 메트릭 관측 목표가 Cloudwatch agent 를 이용하는 이유 중 하나이며 인스턴스 개별적으로만 메모리 메트릭이 확인 가능한 상황이다. 인스턴스들의 메모리 메트릭을 그룹 레벨에서(인스턴스 집합의 평균 값) 확인을 해야하는 경우 별도 설정이 추가적으로 요구되어진다.


## Solution
Config 파일 설정 및 내용 적용은 ASG group instance 모든 인스턴스에 공통적으로 적용해야 하는 상황이다. 그렇기에 골든이미지로 별도로 구성하는 것이 효율적이다. 그렇기 않은 환경이라면 앤서블이나 SSM Run command 기능을 활용하여 명령어 실행이 필요하다. (필자는 SSM Run command를 통해 해당 기능을 배포하였고 다음 골든 이미지 업데이트 시기까지 /etc/rc.local에서 config 설정 및 적용 스크립트가 실행되어지도록 설정하였다.)

기타 설정내용 블로그 내용으로 대체
[블로그 링크](https://anggeum.tistory.com/entry/AWS-CloudWatch-agent%EB%A5%BC-%ED%86%B5%ED%95%9C-Group-%EB%A0%88%EB%B2%A8-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B4%80%EC%B0%B0%ED%95%98%EA%B8%B0)


