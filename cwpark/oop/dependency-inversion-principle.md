# 의존성 역전 원칙



>1. 상위 수준의 모듈은 하위 수준의 모듈에 의존해서는 안 된다. 둘 모두 추상화에 의존해야 한다.
>2. 추상화는 구체적인 사항에 의존해서는 안 된다. 구체적인 사항은 추상화에 의존해야 한다.

예를 들어 살펴보자.

다음의 Movie 는 구체 클래스인 AmountDiscountPolicy를 알고 있기 때문에 결합도가 높아진다. 재사용성과 유연성이 저해된다.

```java
public class Movie {
  private AmountDiscountPolicy discountPolicy;
}
```

Movie가 하는 역할은 영화의 티켓 가격을 계산한다고 가정하자. 그에 비해 AmountDiscountPolicy는 영화의 가격에서 특정 금액만큼을 할인해주는 더 구체적인 수준의 메커니즘이다. 정리 하자면, Movie는 상위 수준의 클래스이고 AmountDiscountPolicy는 하위 수준의 클래스다.



Movie와 AmountDiscountPolicy 사이의 협력을 이야기해보자. 두 객체 사이의 협력의 본질은 영화의 가격 계산이다. __객체 사이의 협력이 존재할 때 그 협력의 본질을 담는 것은 상위 수준의 정책이다.__ 하지만, AmountDiscountPolicy를 다른 객체인 PercentDiscountPolicy로 변경한다고 해보자. 이 때 영향을 받는 것은 협력의 본질인 Movie다.

![image-20200826122942675](../images/image-20200826122942675.png)

이 그림은 상위 수준 클래스인 Movie가 하위 수준 클래스인 AmountDiscountPolicy에 의존하는 것을 보여준다. 이 그림의 문제점은 의존성의 방향이 잘못됐다는 것이다. Movie에서 AmountDiscountPolicy가 아니라 그 반대인 AmountDiscountPolicy가 Movie를 의존해야 한다.

이러한 의존성 방향의 문제점을 해결해주는 것은 __추상화(Abstraction)__다. Movie와 AmountDiscountPolicy가 모두 추상화에 의존하도록 바꿔야 한다.

![image-20200826123516400](../images/image-20200826123516400.png)



전통적인 절차적 방법에는 상위 수준의 모듈이 하위 수준의 모듈에 의존하는 경향이 만연해 있었다. 따라서, 로버트 마틴이 이 용어에 '역전(inversion)'이라는 단어를 쓴 이유가 의존성의 방향이 전통적인 절차형 프로그래밍과는 반대 방향을 나타내기 위해서다.

스프링 프레임워크는 의존성 역전을 잘 활용한 예다.

> IoC is also known as *dependency injection* (DI). It is a process whereby objects define their dependencies, that is, the other objects they work with, only through constructor arguments, arguments to a factory method, or properties that are set on the object instance after it is constructed or returned from a factory method. The container then *injects* those dependencies when it creates the bean. This process is fundamentally the inverse, hence the name *Inversion of Control* (IoC), of the bean itself controlling the instantiation or location of its dependencies by using direct construction of classes, or a mechanism such as the *Service Locator* pattern.

IoC는 의존성 주입으로도 알려져 있다. 거칠게 말해 IoC와 의존성 주입은 같다. 스프링은 하나의 거대한 IoC 컨테이너다. 이 컨테이너는 빈이라는 객체들의 의존성을 주입한다. 이것이 역전되었다고 설명하는 이유는, 빈 자신이 인스턴스화를 제어하지 않기 때문이다.

![img](https://docs.spring.io/spring/docs/3.2.x/spring-framework-reference/html/images/container-magic.png)

이 그림은 높은 관점에서 스프링이 어떻게 동작하는지를 바라본 것이다. 여러분이 작성한 애플리케이션의 클래스(POJO)들이 이 클래스들의 의존관계를 설명한 설정 메타정보들과 조합되어서 ApplicationContext가 생성되고 초기화된다. 

---

오브젝트, 조영호, 위키북스

https://docs.spring.io/spring/docs/3.2.x/spring-framework-reference/html/beans.html