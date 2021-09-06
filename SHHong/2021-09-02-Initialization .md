# Initialization (초기화)

### 생성자란?(Initializer)

구조체, 클래스, 열거형에 대한 인스턴스를 생성할 때 **저장 속성**에 대한 초기값을 설정해야 한다. 

> Why?
>
> 초기값이 설정되어 있지 않으면 저장 속성을 저장하기 위한 고유의 데이터 저장 공간이 생기는데 이때 어떠한 값도 들어 있지 않다면 오류가 발생하기 때문이다.
>
> (열거형의 경우 메모리 공간이 필요한 저장 속성은 선언할 수 없다.)

*Q) 그럼 계산 속성은 초기화를 안해줘도 되는가?*

*A) YES*  --> 계산 속성은 메서드로 취급



초기화 메서드는 함수이다. ```init()```이라는 메서드를 사용한다. 메서드는 func를 앞에 붙혀줘야 하는거 아닌가 싶지만 스위프트의 약속으로 ```init()```만 구현해주면 된다. 

#### ```init()```을 따로 하지 않아도 되는 경우

1. 구조체의 경우 --> ```init()``` + 멤버와이즈 이니셜라이저 제공

2. 클래스에서 모든 저장 속성의 초기화가 존재하는 경우 

   ```swift
   // 저장 속성의 초기값이 있는 경우 init()을 구현하지 않아도 된다. (자동 생성)
   class Aclass {
       let a = 3
       let b = 4
     
     //init() { } ---> 생략
   }
   
   let a = Aclass()
   //
   class Aclass {
       let a : Int
       let b : Int
       var c : Int {
           return a + b
       }
       
       init(a: Int, b: Int) {
           self.a = a
           self.b = b
       }
   }
   
   let a = Aclass(a: 3, b: 4)
   print(a.c) // 7
   ```



# Designated init(지정 생성자)

```init()``` 형태를 가지는 생성자를 지정 생성자라고 한다. 

지정 생성자는 모든 저장 속성을 초기화해야 한다. 모든 생성자는 오버로딩이 가능하다.

> 오버로딩이란?
>
> 동일한 함수명을 가지고 편의와 목적을 위해 파라미터의 다양한 형태로 생성하는 것
>
> 단, 오버로딩의 경우에도 모든 저장 속성을 초기화해야 한다는 원칙은 변하지 않는다.

<img src="/Users/shhong/Library/Application Support/typora-user-images/image-20210902192032082.png" alt="image-20210902192032082" style="zoom: 33%;" />

# Convenience init (편의 생성자)

지정 생성자보다 적은 파라미터를 가지고 편리하게 생성하기 위한 생성자이다. 

**편의**라는 말이 붙은 것처럼 초기화를 편리하게 하기 위함이 목적이다. 모든 속성을 초기화할 필요가 없다. 

지정 초기화 메서드를 오버로딩할 수 있으나 편의 생성자로 만드는 것이 개발자의 실수를 줄일 수 있는 방법이다. 



다만, 편의 생성자는 지정생성자에게 의존하기 때문에 편의 생성자 내부에는 

반드시 자기 단계의 지정생성자를 호출하는 코드가 존재해야 한다. 이때 지정생성자를 이미 호출하는 다른 편의 생성자를 호출해도 가능하다. 



다른 목적은 상속을 할 경우에 서브클래스에서 override를 하지 못하는 목적이 있다.(원칙) 

<img src="https://docs.swift.org/swift-book/_images/initializerDelegation01_2x.png" alt="../_images/initializerDelegation01_2x.png" style="zoom: 50%;" />

```swift
class Bird {
    var name: String
    var age: Int
    
    init(name: String, age: Int) {
        self.name = name
        self.age = age
    }
    
    convenience init() {
        self.init(name: "새", age: 1)
    }
}

let aBird = Bird(name: "새", age: 1)
let bBird = Bird()

// 동일한 결과이다.
```



# 상속과 생성자

### 지정 생성자의 상속

생성자는 기본적으로 상속되지 않고 재정의가 원칙이다. 

```swift
class Vehicle {
    var numberOfWheels = 0
    var description: String {
        return "\(numberOfWheels) wheel(s)"
    }
}

let vehicle = Vehicle()
print("Vehicle: \(vehicle.description)")
// Vehicle: 0 wheel(s)

class Bicycle: Vehicle {
    override init() {
        super.init() 
        numberOfWheels = 2
    }
}

class Hoverboard: Vehicle {
    var color: String
    init(color: String) {
        self.color = color
        // super.init() implicitly called here
    }
    override var description: String {
        return "\(super.description) in a beautiful \(color)"
    }
}

let hoverboard = Hoverboard(color: "silver")
print("Hoverboard: \(hoverboard.description)")
// Hoverboard: 0 wheel(s) in a beautiful silver

```

### 편의 생성자의 상속

편의 생성자는 재정의가 불가한 것이 원칙이다.



참고

https://zeddios.tistory.com/141

https://docs.swift.org/swift-book/LanguageGuide/Initialization.html

