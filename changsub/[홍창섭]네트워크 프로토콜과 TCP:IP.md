# \<Network\> 네트워크 프로토콜과 TCP / IP 모델

## Network Protocol이란?
- 네트워크로 연결된 디바이스 사이에서 정상적으로 데이터를 주고 받기 위한 송수신에 관련된 규약(프로토콜)이다.
- 쉽게 말하면, 내가 구글링을 하면서 정보를 얻어오는 행위를 할때, 서버-클라이언트간의 지켜야 하는 약속이라고 보면 된다.

## OSI 7 참조 모델
- 국제 표준화 기구에서 발표한 참조 모델이다.
- 실제 프로토콜로 구현된 경우는 적고, 연구/학습을 위한 참고용을 사용된다.
- TCP/IP모델과 달리 7계층으로 이루어져 있다.

## TCP / IP 모델
- 하지만 기존 모델(OSI 참조 모델)의 복잡성과 중복성을 해결하기 위해 TCP/IP 모델(인터넷 표준 모델)을 도입해서 네트워크 프로토콜로 사용하기 시작했다.
- TCP/IP 모델의 경우 아래와 같이 5계층을 Layering하여 구성 되어 있다.
- (물리 계층+데이터링크 계층)을 합쳐서 네트워크 인터페이스 계층라고 한다.
![image](https://user-images.githubusercontent.com/64846408/125462460-d4d3c033-ae30-434f-a80f-9f16ae6b2fee.png){: width="200" height="200"}
![image](https://user-images.githubusercontent.com/64846408/125461703-1f15f3f0-775d-4400-b4f9-2a44d0ea2bd8.png)
### 네트워크 인터페이스 계층
- 라우터 간의 신뢰성 있는 데이터 전송을 담당하는 계층이다. 즉, 흔히 알고 있는 랜카드(NIC)를 이용해서 해당 계층에서 통신을 진행한다.
- 또한 MAC 주소가 데이터 링크 계층에서 이용된다.
		 
### 네트워크 계층
- TCP / IP 모델에서는 \_인터넷 계층\_이라고 불리며, 포워딩과 라우팅을 담당하는 계층이다.
- IP 모델만 사용시 비연결성과 비신뢰성 문제가 존재해서 TCP를 사용해야 한다.
- TransPort 계층에서 전송받은 세그먼트에 IP헤더를 붙여 패킷(datagram)으로 만들어서 네트워크 인터페이스 계층으로 내려보내준다.
- 지정된 IP주소에 패킷이라는 데이터를 전달한다.
- IP주소의 경우 Longest Prefix Matching방식으로 다음 라우터에 전달한다.
- Forwarding : Forwarding-Table을 분석하고 IP헤더를 붙인 다음, 라우터로 해당 패킷을 보내는 동작이다.(나무를 보는 느낌)
- Routing : 시작점에서 끝점까지의 최적 경로를 찾는 동작이다.(숲을 보는 느낌)

#### Longest Prefix Matching
- 포워딩 테이블에 존재하는 IP주소를 앞에서부터 많이 겹치는 Link Interface로 전송하는 방식이다.
- 아래의 경우 `11001000 00010111 00011000 101010101`를 목적지 IP주소로 가지면, 1번 Link-Interface 로 보내진다.
- Link-Interface는 다음 차례의 라우터라고 보면된다.
![image](https://user-images.githubusercontent.com/64846408/125462326-74368602-054b-4317-b25d-e58c66f657c1.png)

### 전송 계층(Transport Layer)
- TCP 또는 UDP 프로토콜을 사용해서 Payload에 TCP 헤더를 붙여 세그먼트를 전송한다.
- TCP 세그먼트에는 포트 넘버에 대한 정보도 포함 되어 있다.
- 포트와 IP주소의 차이점은 공통적인 아파트의 동호수라고 보면된다. 아파트 주소가 IP주소라 볼 수 있고, 해당 아파트의 동호수가 포트넘버라고 보면된다.
![image](https://user-images.githubusercontent.com/64846408/125461464-8d141906-3416-4631-992b-7c17bd824609.png)

### 응용 계층(Application Layer)
- 클라이언트와 가장 가까운 계층으로 클라이언트가 소프트웨어 어플리케이션과 통신할 수 있게 해준다.
- 응용프로그램(application)들이 데이터를 교환하기 위해 사용되는 프로토콜이다.
- 흔히 우리가 알고 있는 HTTP 프로토콜도 해당 계층의 프로토콜이다.

###### Reference
1. 2021년 영남대학교 박영덕 교수님의 컴퓨터 네트워크 실습 강의
2. 김영한님의 HTTP 웹 기본지식 강좌

[image-1]:	file:///Users/hongchangsub/Desktop/posting-review/changsub/images/%E1%84%82%E1%85%A6%E1%84%90%E1%85%B3%E1%84%8B%E1%85%AF%E1%84%8F%E1%85%B3%20%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%90%E1%85%A9%E1%84%8F%E1%85%A9%E1%86%AF%E1%84%80%E1%85%AA%20TCP:IP%203.png
[image-2]:	file:///Users/hongchangsub/Desktop/posting-review/changsub/images/%E1%84%82%E1%85%A6%E1%84%90%E1%85%B3%E1%84%8B%E1%85%AF%E1%84%8F%E1%85%B3%20%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%90%E1%85%A9%E1%84%8F%E1%85%A9%E1%86%AF%E1%84%80%E1%85%AA%20TCP:IP%204.png
[image-3]:	file:///Users/hongchangsub/Desktop/posting-review/changsub/images/%E1%84%82%E1%85%A6%E1%84%90%E1%85%B3%E1%84%8B%E1%85%AF%E1%84%8F%E1%85%B3%20%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%90%E1%85%A9%E1%84%8F%E1%85%A9%E1%86%AF%E1%84%80%E1%85%AA%20TCP:IP%201.png
[image-4]:	file:///Users/hongchangsub/Desktop/posting-review/changsub/images/%E1%84%82%E1%85%A6%E1%84%90%E1%85%B3%E1%84%8B%E1%85%AF%E1%84%8F%E1%85%B3%20%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%90%E1%85%A9%E1%84%8F%E1%85%A9%E1%86%AF%E1%84%80%E1%85%AA%20TCP:IP%202.png
