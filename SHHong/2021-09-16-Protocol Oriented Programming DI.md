# 프로토콜 지향 프로그래밍(Protocol Oriented Programming)

Swift는 객체 지향 프로그래밍, 함수 지향 프로그래밍, 프로토콜 지향 프로그래밍을 모두 담고 있는 언어이다.



프로토콜 지향 프로그래밍의 장점은 

여러 개의 프로토콜을 채택할 수 있고 메모리 구조에 대한 특정 요구 사항이 없다. (선택적 채택도 가능하다.)

또한 모든 타입에서 채택이 가능하다. (객체 지향 프로그래밍은 클래스만 상속하여 사용할 수 있었음.)

타입으로 사용 가능하므로 활용도가 높고 보다 깔끔한 구현과 재사용성을 높일 수 있다. 

## 프로토콜 프래그래밍이 중요한 이유 

구현이 아닌 인터페이스에 맞추어 개발하라는 말이 있다. 그만큼 인터페이스는 중요하다. 

여기서 프로토콜과 인터페이스는 무슨 연관일까? 프로토콜은 의도한 행위만 노출 시키는 것이다. 그에 따른 상세 구현은

프로토콜을 채택한 곳에서 행위를 하는 것이기 때문에 그 **의도**만을 나타내는 인터페이스, 프로토콜 인 것이다. 



의도한 행위 만을 노출 시킴으로서 그 외 상태에 대한 캡슐화가 이루어진다. 

구현체가 아닌 프로토콜에 의존적이면, 구현을 바꾸기가 쉬워진다. 인터페이스만 충족된다면, 사용되는 곳에서는 신경쓰지 않는다.



### 주의할 점

프로토콜의 구현을 바꾸는 건 쉽다는 장점이 있지만 프로토콜 자체를 바꾸는 일은 모든 구현체, 해당 프로토콜을 사용하는 객체, 테스트 코드에 영향을 주기 때문에 어려운 작업이 된다. 따라서 프로토콜을 설계할 때 적절한 권한(역할)을 부여해야 하여 변경을 최소화 해야 한다.

extension을 통해 부분 기본 구현으로 좀더 유연한 개발이 가능해보인다. 

## Dependency Injection(DI): 의존성 주입

### 의존성 주입이란? 

표준을 정의할 수 있고, 정의된 표준을 바탕으로 같은 설계를 하게 해주는 것 

#### 장점 

1. 재사용성을 높여준다.
2. 테스트하기 좋다.
3. 코드를 단순화 시켜준다.
4. 종속적이던 코드의 수도 줄여준다.
5. 사용 목적을 파악하기 쉽다. 코드의 가독성이 높아진다. 
6. 종속성이 감소한다. 구성 요소의 종속성이 감소하면 변경에 민감하지 않다. 
7. 결합도를 낮추면서 유연성과 확장성은 향상사킨다.
8. 객체 간의 의존 관계를 설정할 수 있다. 
9. 객체 간의 의존관계를 없애거나 줄일 수 있다. 



그럼 의존성은 무엇이고 주입은 무엇일까 ?



### 의존성이란?

의존 관계를 가지는 상황에 대한 이해를 하면 좋은데 

만일 A클래스를 B클래스의 인스턴스로 만들고 이 인스턴스로 B클래스 내부에 작업을 하게 된다면 

B클래스는 자연스럽게 A클래스에 대한 의존 관계가 생기게 된다. 



### 주입이란?

내부가 아니라 외부에서 객체를 생성해서 넣어주는 것을 주입이라고 한다. 

B클래스 내부에 A클래스의 인스턴스를 생성하는 것이 아닌 

A클래스를 사용할 공간을 비워두고 B클래스의 인스턴스를 생성할 때(외부)

A클래스를 넣어주는 것을 주입이라고 한다.



### 의존성과 주입을 합친 의존성 주입을 다시 살펴보면 ....?

내부에 만든 변수를 외부에서 넣어주게 하면 의존성 주입이 된다. 

> B클래스 내부에 A클래스의 인스턴스를 생성하는 것이 아닌
>
> A클래스를 사용할 공간을 비워두고 B클래스의 인스턴스를 생성할 때(외부)
>
> A클래스를 넣어주는 것

 위 예시는 클래스 생성이었지만 함수를 이용해서 외부에서 넣거나 할 수 있다.

#### 하지만 의존성을 주입하는 것만으로 의존성 주입이라고 하지 않는다.



### 의존성 분리란?

의존성 주입은 의존성을 분리시켜 사용한다. 

의존성 분리는 의존관계 역전의 원칙으로 의존관계를 분리시킨다. 

> #### 의존관계 역전 원칙이란?
>
> 객체 지향 프로그래밍에서 의존관계 역전 원칙은 소프트웨어 모듈들을 분리하는 특정 형식을 지칭한다. 이 원칙에 따르면 상위 계층이 하위 계층에 의존하는 전통적인 의존관계를 역전 시킴으로써 상위 계층이 하위 계층의 구현으로 부터 독립되게 할 수 있따. 
>
> 1. 상위 모듈은 하위 모듈에 의존해서는 안된다. 상위 모듈과 하위 모듈 모두 추상화에 의존해야 한다. 
> 2. 추상화는 세부 사항에 의존해서는 안된다. 세부사항이 추상화에 의존해야 한다. 
>
> 출처: https://ko.wikipedia.org/wiki/의존관계_역전_원칙

상위 모듈이 하위 모듈을 의존하게 되는 상황에서 이를 반전시켜 하위 계층의 구현으로 부터 독립하게 된다. ... 어떻게 하지 ? 

Interface를 이용하는 것인데, iOS에서는 이를 protocol로 이용한다. 

--->의존관계를 독립 시킨다. 



### IOC(Inversion Of Control): 제어의 역전 

프로그래머가 작성한 프로그램이 라이브러리의 흐름 제어를 받게 되는 디자인 패턴 

+ 프로그램 제어권을 프레임워크가 가져가는 것
+ 개발자는 비지니스 로직에만 신경쓰면 됨 
+ 개발자가 annotation, xml 등을 통해 설정 해 놓으면 Container가 알아서 처리
+ SOLID 원칭 중 S를 지킬 수 있게 됨(?)

------> 보완할 필요가 있음



## 의존성 주입 3가지 방법

### 1. Constructor Injection(생성자 주입)

```swift
protocol Eatable {
    var calorie: Int { get }
}

struct Noodle: Eatable {
    var calorie: Int {
        return 250
    }
}

struct Restaurant {
    let food: Eatable
    
    init(food: Eatable) {
        self.food = food
    }
}

let restaurant = Restaurant(food: Noodle())
```

### 2. Property Injection

```swift
protocol Eatable {
    var calorie: Int { get }
}

struct Noodle: Eatable {
    var calorie: Int {
        return 250
    }
}

struct Restaurant {
    var food: Eatable?
}

var restaurant = Restaurant()
restaurant.food = Noodle()
```

### 3. Method Injection

```swift
protocol Eatable {
    var calorie: Int { get }
}

struct Noodle: Eatable {
    var calorie: Int {
        return 250
    }
}

class Restaurant {
    var food: Eatable?
    
    func setUp(food: Eatable) {
        self.food = food
    }
}

var restaurant = Restaurant()
restaurant.setUp(food: Noodle())
```





참고

https://lena-chamna.netlify.app/post/dependency_injection/

https://medium.com/@jang.wangsu/di-dependency-injection-이란-1b12fdefec4f

https://eunjin3786.tistory.com/115

