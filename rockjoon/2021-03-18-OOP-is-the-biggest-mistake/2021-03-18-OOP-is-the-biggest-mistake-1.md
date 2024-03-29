# 객체지향 프로그래밍은 컴퓨터 과학의 최대 실수이다. - 1

> 다음은 
[Object-Oriented Programming is the Biggest Mistake of Computer Science](https://suzdalnitski.com/oop-will-make-you-suffer-846d072b4dce)를 번역하고 느낀점을 적은 글입니다. (오역 주의바랍니다) 긴 글이라 많은 부분을 생략하였습니다. 자세한 내용은 원문을 참조 바랍니다. 
```
한 가족이 평화롭게 고속도로를 운전하고 있었다.
수백번을 오갔던 도로지만 그날은 평소와 달랐다. 갑자기 엑셀이 멈춰지지 않았던 것이다.
차는 계속해서 가속되었고 끝내 150피트의 스키드 마크를 남기고 간신히 둑 앞에 멈춰섰다. 
```
이 끔찍한 악몽은 2007년 토요타캠리를 몰던 한 여성에게 실제로 발생한 일이다. 토요타 캠리는 약 십년 간 이와 같은 엑셀 오작동을 발생시켰고 이로 인해 100여명이 사망했다. 

전문가은 소프트웨어의 결함을 의심했다. 이들은 18개월의 조사 끝에 결국 토요타의 `스파게티 코드`로 인한 소프트웨어 결함임을 입증하였다. 결국 토요타는 900만대의 차를 리콜하고 수십억 달러를 배상해야 했다.

## 스파게티 코드가 문제가 될까?

이는 비단 토요타만의 문제가 아니다. 346명의 생명을 앗아가고 600억 달러 이상의 경제적 손실을 가져왔던 보잉 737기의 충돌 역시 스파게티 코드에 의한 사고였다.

스파게티 코드는 전세계를 오염시키고 있다. 비행기의 컴퓨터, 의료 기기, 핵발전 시설 등은 결국 사람에 의해 작성되는 코드 위에서 작동한다.

```
If the code doesn’t run, then it’s broken.
Yet if people can’t understand the code, then it will be broken. Soon.
```
> 코드가 작동하지 않는다면, 고장난 것이다.
그러나 사람이 이해할 수 없는 코드가 있다면, 이는 머지않아 고장날 것이다.

인간의 두뇌는 훌륭하지만, 한계가 있다. 우리의 두뇌는 한번에 많은 것을 수행할 수 없다.   
이는 곧 프로그램 코드가 인간의 두뇌를 압도하지 않는 범위에서 작성되야 한다는 것을 뜻한다. 

하지만 스파게티 코드는 인간이 코드를 이해하기 어렵게 만든다. 

## 무엇이 스파게티 코드를 만드는가?

그렇다면 무엇이 스파게티 코드를 만드는 것일까? 그것은 바로 **무질서(entropy)** 이다.  
우주의 존재하는 모든 것은 결국 무질서하게 된다. 충분한 **제한**이 없다면 말이다.

우리가 도로에 제한 속도를 두고, 신호등을 설치하는 것도 결국 같은 이유이다. 규칙과 제한을 만들고 사고를 방지하기 위해서이다.

프로그래밍에도 똑같이 적용할 수 있다. 이러한 **제한은 프로그래머에게 맡겨서는 안된다.** 
이는 강제적으로 적용되어야 한다.

## OOP는 왜 재앙의 뿌리일까?

우린 어떻게 충분한 **제한**을 강제하고 스파게티 코드를 방지할 수 있을까? 두 가지 방법이 있다.  
수동적으로 하는 방법과 자동적인 방법이다.

수동적인 방법은 에러를 범하기 쉽다. 인간은 항상 실수를 한다.  
따라서 수동적인 방법보다 자동적으로 강제하는 방법이 올바르다.

불행히도 OOP는 우리가 찾고 있는 해결책이 아니다. 누군가는 DI, TDD, DDD 등과 같은 OOP의 다양한 관습에 충분히 숙달될 수 있다. 그러나 이 모든 것들은 프로그래밍 패러다임 그 자체에서 강제되는 것이 아니다. 

OOP의 어떤 특징도 스파게티 코드를 막지 못한다.  
`캡슐화`는 프로그램 전반에 상태를 흩뿌리고 감춘다.  
`상속`은 혼란을 가중시킬 뿐이다.  
`다형성`은 더 심각하다. 프로그램이 실행될 때 정확히 어떻게 작동할지 알 수 없는 것은 전혀 장점이 아니다.

또한 OOP는 기본적으로 **참조를 공유(shared by reference)** 한다.  
한 부분에서의 변화는 프로그램의 다른 어느 곳에 영향을 미친다.

이러한 OOP "괴물"은 당신을 매일 괴롭히고 밤마다 악몽 속에 찾아 올 것이다.

> 2탄에서 계속...


