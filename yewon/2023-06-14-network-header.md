# network header
![image](https://github.com/Meet-Coder-Study/posting-review/assets/45934061/dc68a1be-877e-45fc-a3fd-6ec86944e77d)

network는 기본적으로 protocol 이다. 정해진 통신규약을 통해 통신하고. 이 과정에서 서로를 알아보기 위해 정해진 자리수의 비트값을 활용하여 각 layer에서 서로가 원하는 값을 공유한다. link layer에서는 link layer에서 정해둔 값만큼의 헤더값으로 캡슐화 하고, network layer에서는 network layer가 정해둔 값만큼의 헤더값으로 캡슐화 하는 방식의 과정을 통해 보내고싶어 하는 데이터를 잘 캡슐화 해 보내고, 이를 받은 remote는 한겹씩 header를 까보고 원하는 데이터 처리, 혹은 작업을 한 뒤에 다음 레이어로 해당 데이터를 전송한다.
network header가 어떤 레이어에서 어떤 방식으로 캡슐화 되고, 이 캡슐화되는 과정에서 더해진 값들이 어떤 의미를 가지는지 알게되면 네트워크를 이해하고 활용하는데에 많은 도움이 될 수 있다.

## link layer header
![image](https://github.com/Meet-Coder-Study/posting-review/assets/45934061/cb3b9101-41d1-414f-b3fc-6ded04ac3e72)

link layer header는 link layer에서 사용하는 값들이 담겨있다. router, switch등이 활용하여 routing을 어떻게 할건지, 다음 hop은 어디가 될 것인지, multicast 할 것인지 broadcast 할 것인 등에 영향을 주는 값들이 여기있다. 
- SFD (Start Frame Delimiter) : frame 시작을 알리는 값.
- DA (Destination Address) : 다음 목적지의 2계층 주소값
- SA (Source Address) : 출발지의 2계층 주소값
- Type / Length : 상위계층 프로토콜 종류 표시 / 프레임 길이
- FCS(CRC) : 오류검사를 위한 값

## network layer header
network layer에는 다른 여러가지 protocol이 있을 수 있겠지만, 흔히들 많이 쓰는 걸로는 ipv4, ipv6가 있다. 우스개소리로 network는 ip왕국이라고도 하니, ip친구들과는 친하게 지내시길 바라겠다.
ipv4와 ipv6는 여러가지 말이 있지만 우선 주소고갈문제로 ipv4를 대체하기 위해 나온것이 ipv6고, 이 과정에서 header size도 다르고, header 내용도 좀 다르다. ipv4에는 없는 header값이 ipv6에는 있기도 하고, ipv4에선 있지만 ipv6에서는 없는 헤더값도 있다.
![image](https://github.com/Meet-Coder-Study/posting-review/assets/45934061/7bb961ba-b649-4f1b-bfab-db5c2257a58a)

### IPv4 header

[커널코드에서 살펴보는 IPv4 header 값](https://elixir.bootlin.com/linux/latest/source/include/uapi/linux/ip.h#L87)

- version : 4.
- ihl (Header Length) : 헤더길이
- tos (Type of Service) : 서비스품질을 나타내는 값. 패킷처리 우선순위를 나타내기 위한 필드라고 생각하면 된다.
- tot_len (Total Packet Length) : IP header 및 데이터를 포함한 ip 패킷 전체의 길이를 fragmentation 되기 이전의 길이로 표시하는 값. 최대값은 2<sup>16</sup>-1
- id (Fragment Identifier) : fragmentation 된 패킷들이 서로가 한 데이터 그램안에 있는 것을 알아보기위해 같은 값을 가지는 값.
- frag_off (Fragmentation Flag) : fragmentation 할건지 말건지 정하는데 쓰이는 값.
- ttl (Time to Live) : 한 홉을 지날때마다 작아지는 값. packet이 최대 몇개의 여정을 할 수 있는지 정하는 값이다. 0이되면 더이상 전달하지 않기 때문에 대부분의 경우 맥스값으로 채워진다. 
- protocol : 상위계층 프로토콜이 뭔지 알려주는 값.
- check : 헤더 오류검출을 위한 값
- saddr : host의 IPv4 주소
- daddr : remote의 IPv4 주소

### IPv6 header

[커널코드에서 살펴보는 IPv6 header 값](https://elixir.bootlin.com/linux/latest/source/include/uapi/linux/ipv6.h#L118)

- priority : IPv4의 TOS와 같은 값.
- version : 6
- flow_lbl (flow label) : 해당 flow의 label 값. flow별로 가지는 고유한 값.  
- payload_len : 확장 header와 상위계층 데이터만을 포함하는 값. IPv4의 tot_len과 비슷한 값을 뽑고싶다면 ipv6의 원래 기본헤더값인 40을 더해줘야 한다. 
- nexthdr (next header) : IPv4의 protocol과 같은 값. 
- hop_limit : IPv4의 ttl과 같은 값.
- saddr : host의 IPv6 주소
- daddr : host의 IPv6 주소

## Transport layer header
transport layer에서 가장 많이 쓰는건 TCP와 UDP. 

### TCP header
![image](https://github.com/Meet-Coder-Study/posting-review/assets/45934061/6f7c7f1f-464c-4967-95e2-6f7abc3cf70b)

[커널코드에서 살펴보는 TCP header 값](https://elixir.bootlin.com/linux/v4.14/source/include/uapi/linux/tcp.h#L25)
- source : host의 port 넘버
- dest : remote의 port 넘버
- seq : 패킷의 sequence number
- ack_seq : 수신하기로 기대하는 다음 sequence number
- flag bit : URG, ACK, PSH, RST, SYN, FIN
- window : window size
- check : 헤더 오류검출을 위한 값
- urg_ptr : TCP segment에 포함된 긴급 데이터 pointer

### UDP header
![image](https://github.com/Meet-Coder-Study/posting-review/assets/45934061/ed87b243-d668-46ab-b745-30f3ed39a1d7)

[커널코드에서 살펴보는 UDP header 값](https://elixir.bootlin.com/linux/v4.14/source/include/uapi/linux/udp.h#L23)
- source : host의 port 넘버
- dest : remote의 port 넘버
- len : 헤더와 데이터를 합한 길이
- check : 헤더 오류검출을 위한 값
