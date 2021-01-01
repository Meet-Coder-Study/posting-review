# 람다 표현식

##함수형 인터페이스 
람다 표현식에 대해서 알아보기 전에 람다 표현식을 쓰기 위해선 함수형 인터페이스에 대해서 알아야 하는데 함수형 인터페이스는 다음과 같은 형식을 함수형 인터페이스라고 한다  
```java
/*
하나의 추상메서드를 지정하는 인터페이스
Ex)
*/
public interface Predicate<T> {
    boolean test (T t);
}
```
이다.

몇가지 예제를 통해 좀 더 설명하면
```java
//1.
public interface Adder {
    int add(int a, int b);
}

//2.
public interface SmartAdder extends Adder {
    int add(double a, double b);
}
//3.
public interface Nothing {
}
```
여기서 함수형 인터페이스는 1번이고 2,3번은 함수형 인터페이스가 아니다.
2번의 경우 상속을 받고 있고 3번은 추상 메서드가 없기 때문에 함수형 인터페이스가 아니다.

##람다 표현식
람다 표현식은 함수형 인터페이스를 통해서 사용 할 수 있다.
위 예시에서
```java
public interface Adder {
    int add(int a, int b);
}
```
이 함수형 인터페이스를 통해 람다 표현식을 작성해보면  
```java
public class Calculator {
    public static void main(String[] args) {
        //1
        Adder temp = (int a, int b) -> a+b;
        //2
        System.out.println(temp.add(1,2));
        
        //3
        Adder temp2 = (int a, int b) -> a+b+2;
        //4
        System.out.println(temp2.add(1,2));
    }

}
```
추상 메서드의 경우 return 과 parameter가 있을뿐 그 안의 구현체는 존재 하지 않는데 1,3번을 보면 람다 표현식을 인터페이스인 Adder에 대입 하게되면 람다 표현식이 추상 메서드의 구현체로 전달 된다.  
추상 메서드와 람다 표현식을 보면 람다 표현식에서 (int a, int b)는 추상 메서드의 파라미터를, a+b는 추상 메서드의 구현을 나타내고 더불어 a+b의 결과는 int이기 때문에 우리는 반환값까지 나타내는것을 알 수 있다.  
즉 temp에서 add를 호출할경우 두 파라미터를 더하여 반환하는 구현이 실행이 되고, temp2에서는 두 파라미터를 더하고 거기에 2를 더한 후 반환하는 구현이 실행된다.  

##왜 쓸까?
```java
public interface Adder {
    int add(int a, int b);
}
```
```java
public class Calculator {

    public static void main(String[] args) {
        Calculator calculator = new Calculator();
        calculator.temp3((int a, int b) -> a+b);
    }
    
    public int temp3(Adder adder) {
        int a = 1;
        int b = 2;
        return adder.add(a,b);
    }

}
```
예제를 보면  
1. 함수(람다 표현식)를 변수나 데이터에 할당 할 수 있다.  
        Adder temp2 = (int a, int b) -> a+b+2;
2. 함수(람다 표현식)를 parameter로 전잘 받거나 함수의 결과로 함수(람다 표현식)를 반환 하도록 했다.
```java
public class Calculator {

    public static void main(String[] args) {
        Calculator calculator = new Calculator();
        calculator.temp3((int a, int b) -> a+b); // parameter 전달,
        Adder adder = calculator.temp4();
        
    }
    
    public int temp3(Adder adder) {
        int a = 1;
        int b = 2;
        return adder.add(a,b);
    }

    public Adder temp4() {
        return (int a, int b) -> a+b; // 람다 표현식 반환;
    }
}
```
람다 표현식으로 인해서, 함수를 변수나 데이터에 할당 할 수 있게 됬고, parameter, 반환도 할 수 있게 되면서 일급 객체로 사용을 할 수 있게 됬는데,  
이는 명령형 프로그래밍과 더불어 일급 객체를 사용할 수 있게 되면서 함수형 프로그래밍의 이점들도 누릴 수 있게 되었다.  

## 여담
### Lambda(람다)
람다 표현식을 설명하면서 왜 "람다" 표현식이라고 이야기를 하는지 궁금했다.  
책에선 우리가 개발을 하면서 사용하는 "람다"는 람다 미적분학, 람다 대수의 시스템에서 유래 했다고 한다.
그리고 좀 더 찾아보니 함수형 프로그래밍은  람다 대수를 기반으로 구성이 되있다고 한다.
람다 대수를 정리 하기 전에 일단 람다 대수의 핵심개념만 보면 람다 추상화, 자유변수의 개념이 있다.
```
F(x) = x+y 라는 함수가 있을때 이를 λx.x+y 이런 형식으로 추상화 하는데 이를 람다 추상화 라고 하고,
여기서 y는 x에 묶여있지 않으므로 자유변수 라고 말한다.

(λx. x+1)5 를 우리가 익숙한 형태로 바꾸면 f(x) = x+1, x=5; 이고 결과는 6이 된다.
```
그럼 왜 우리는 람다라고 부르게 되었을까?
**지금부터는 지극히 개인적인 생각을 정리 한것 입니다. 주의해주세요**  
1. 함수
프로그래밍이 아니라 수학적으로 함수를 생각해보자, 수학적으로 함수는 함수의 이름도 필요가 없고, 그저 입력값과 그에 대한 연산만 있을 뿐이다.  
그와 더불어 자바 에서는 익명 클래스 즉 클래스의 이름이 익명으로된 클래스가 있다.  
아래 코드는 동작 파라미터화 때 작성했던 익명 클래스 코드인데, 여기서 보면 우리는 Apple객체를 변수로 받아 어떤 연산을 반환하는 구현을 했다.  
```java
    public static void main(String[] args) {
        List<Apple> apples = filterApples(apples,new ApplePredicate() {
            public boolean test(Apple apple) {
                return "green".equals(apple.getColor()) && 150 > apple.getWeight();
            }       
    });
}
```  
test 메서드에서 apple, "green".equals(apple.getColor()) && 150 > apple.getWeight();을 본후 다음 수식을 보자  
(λapple."green".equals(apple.getColor()) && 150 > apple.getWeight());  
그리고 이걸 우리눈에 익숙한 함수형태로 보면 편한 상태로 수정해보면  
f(apple) = "green".equals(apple.getColor()) && 150 > apple.getWeight()  
이렇게 함수의 형태로 표현 할 수 있고 람다 대수로 표현 할 수 있기 때문에 람다라는 말을 붙인거 같은데 왜 굳이 람다 대수였을까?.  

2.람다 대수 
람다 대수를 선택한 이유를 알기 위해선 과거로 갈필요가 있다.  
**불완전성 정리**
"불완전성 정리란 증명의 핵심은 모든 수학적인 논리 체계에는 논리 자체적으로 증명할 수 없는 명제들이 존재한다."  
라는 말인데 어렵다  
내가 이해한건 우리가 지금까지 논리적으로 증명한것을 가지고 아직 증명하지 못한 것들을 다 증명 할 수 없다 라고 이해했다.  
마치 우리가 장난감 블록으로 모든것을 만들수 없듯이.  
그래서 학자들을 내가 풀 수 있는 문제에 집중 했다고한다.  

그리고 이때 앨런 튜링의 컴퓨터의 시초인 튜링기계,와 알론조 처치의 람다 대수 등이 만들어 졌다고 한다.  
여기서 두명이 연구를 한끝에 튜링기계에서 연산될 수 있는 모든 계산 가능한 알고리즘 연산은 처치의 람다 대수로 표현이 가능하고  
반대로 람다 대수로 표현 할 수 있는 모든 것들은 튜링기계에서도 연산이 가능하다는 것을 밝혔다고 한다.  
그리고 현재 우리가 사용하는 프로그래밍 언어들은 튜링 완전하다고 하는데 튜링 완전함이란 프로그래밍 언어나 추상 기계가 튜링 기계와 동일한 계산 능력을 가진다는 의미라고 한다.  

종합해보면 익명클래스는 함수의 형태와 같은데, 익명 클래스는 자바 프로그래밍 언어 기법중 하나고 자바 프로그래밍 언어는 튜링 완전 하고  
튜링기계는 람다 대수로 표현이 가능하기 때문에 람다 대수의 표현 방식을 여러 프로그래밍언어에서 각 언어에 맞게 표현했고, 그래서 람다 표현식 혹은 람다 라고 부르게 된거같다는 생각이 들었다.  

그리고 더해서 람다 대수를 기반으로 만든 프로그래밍 언어를 함수형 프로그래밍 언어 라고 하고, 함수형 프로그래밍의 특징에는 일급 함수, 익명 함수, 클로져 등등이 있는데.  
자바에서도 함수형 프로그래밍의 개념을 도입하면 코드의 간결성, 프로그램의 상태를 불변 시킬수 있고 ( 함수형태로 이루어져 있기 때문에 입력값에 따른 출력값만 확인하면되기 때문 ) 그로인한 편한 프로그램 동작의 예측의 장점을 가지기 위해서 함수형 프로그래밍의 개념을 도입한거같다는 생각을 하게되었다 