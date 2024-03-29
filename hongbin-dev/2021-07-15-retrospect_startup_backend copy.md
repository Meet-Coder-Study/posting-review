어느덧 6개월이 지났다. 이전 포스팅처럼 사고도 많이 치고 고생도 많이 했다. 얼마 전 수습을 무사히 마치고 정식으로 계약하게되었다🙂 6개월간 느낀 점을 적어보려고 한다.


## 레거시 코드
마이리얼트립은 모놀리식프로젝트를 마이크로서비스로 전환하고 있다. 우리 팀 일부는 모놀리식 프로젝트를 맡고 있고, 마이크로서비스로 전환을 서포팅하거나, 기존에 사용하던 많은 기능들을 유지보수하고있다. 프로젝트가 워낙 오래되고, 많은 요구사항에 히스토리가 굉장히 많았다.

프로젝트를 유지보수하다보면 히스토리가 너무 많아 건드리기 힘든 코드들이 있었다. 뭐하나 잘못 건드리면 전면장애가 났었고, 이런 건드리기 어려운 코드들 때문에 유지보수가 어려워졌다.

또 프로젝트 내의 코드들을 계속 활용하다 보니 나만의 혹은 팀만의 Best practice를 찾기가 어려워졌다. 중복되는 코드들, 여러 사람이 거쳐 간 코드와 난잡한 컨벤션에 재미가 떨어지고 있었다.

오래된 코드를 만지다 보니 탓을 많이 했다. '이때 이 코드들은 왜 이렇게 짰나? 여긴 왜 트랜잭션 롤백이 안되는 구조로 되어있나?' 등 같은 팀원들에게 이야기를 물으며 의견을 나눴다.

결국 나왔던 이야기는 결국 **리소스**였다. 자주 바뀌는 요구사항, 짧은 기간, 바쁜 일정이 합쳐지니 유지보수가 어려운 코드가 나온다였다.

시간이 지나니 나도 안 좋은 코드들을 양산하고 있었고, 당장 몇 달 전 내 코드만 보더라도 '왜 이렇게 짰지?'라는 생각이 든다.

또 유튜브에서 접하게 된 '우리가 가진 문제는 어제의 최선이었다'라는 말에도 흥미롭게 들었다.
[배달의민족 CEO에게 뽑고 싶은 개발자를 물어보았다 [Youtube]](https://www.youtube.com/watch?v=3H4umWD5bwI)


## 재밌게 일하는 방법 찾기
고민을 하다가 든 가장 가까운 생각은 '재밌게 일하는 방법 찾기'였다. 어차피 일할 거 재밌게 일해야 하지 않을까? 왜 재미가 없는지 생각하며 재밌는 환경으로 만들려고 노력했다.


### 왜 유지보수가 어려웠을까?
우선 이 문제가 시작이었다. 적은 리소스에 가장 많은 의존성이 있는 게 우리 프로젝트였다. 그러다 보니 같은 프로젝트를 담당하더라도 다른영역의 히스토리들은 무지했다.

이 부분을 해결하고 싶었다. 문서화를 더 하려 노력했고, 우리의 프로젝트를 다시 돌아보는 게 좋겠다고 느꼈다. 팀원분들도 이 문제를 공감해주셨고 우리프로젝트를 공부하는 시간을 가져 지식을 공유하거나 루비/레일즈를 공부하는 시간을 만들었다. 이 시간의 공부한 것을 문서화하며 우리만의 Best practice와 컨벤션을 맞춰가고 있다.


### 내 프로젝트를 더 좋아하기
처음 루비언의 선입견 때문인지 언어의 흥미가 떨어졌다. 이게 문제라고 생각하여 내 프로젝트를 좋아하려고 노력했다. Ruby를 공부하고, Rails도 공부를 하려고 노력했다.

루비언어의 간결함, 자유로움의 많은 장점으로 점점 흥미로움이 생겼다. 현재는 자바보다 루비로 재밌게 프로그래밍하고 있다. 바쁜 기간이 지나가면 루비로 사이드 프로젝트를 진행해보려고 한다.


### 탓하지 않기
탓하지 않으려고 했다. 나중에 '시간이 없어서 이렇다, ~~~이러한 히스토리 때문에...' 등의 탓을 하기가 싫었다. 그래서 지금 프로젝트에서 최선을 다 하려 하고, 눈앞에 보이는 문제들을 바로 이슈로 만들고 즉각 해결하고 넘어가려 한다.

다른 사람들에게 조금이라도 나은 코드, 유지보수 가능한 코드를 전달하고싶다

### 공부의 방향
이전엔 당장 필요하지않지만 알아두면 좋을 것 같거나, 유명기업들에서 사용하는 기술들을 공부했었다. '당장의 우리 프로젝트의 기술부채가 많은데, 이게 소용이 있을까?'라는 생각이 들었다.

공부의 방향도 바꿨다. 우리가 사용하는 기술들이 어떤 게 있을지 정리했었고, 그 기술부터 먼저 알아야겠다고 생각했다. 기술의 부채를 알려면, 그 기술을 먼저 알아야 하지 않을까?


## 끝
![취직한 죠르디](https://images.velog.io/images/allen/post/8da77911-4203-4b00-bbb9-4a190d3c90a9/image.png)
많은 시행착오를 겪다보니 6~7개월이 금세 지나갔다. 내일도 재밌게 일하고싶다 🏃‍♂️