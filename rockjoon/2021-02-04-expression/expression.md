# Expression 에 관한 재미있는 사실들


## 표현식 (expression)이란?

오라클 자바 공식 문서에는 이렇게 정의되어 있다.
```
An expression is a construct made up of variables, operators, and method invocations,
which are constructed according to the syntax of the language, that evaluates to a single value.
```
중요한 내용을 살펴 보면 표현식은 다음을 만족하는 구조라고 볼 수 있다.
1. 변수, 연산자, 메소드 호출로 구성 된다.
2. 값을 결정(반환)한다.

> 공식 문서에서는 언급 되지 않지만 표현식에는 리터럴도 포함된다. 

> 결정한다는 표현이 다소 애매할 수 있는 있는데, **표현식을 통해 값을 연산하고 이를 반환**한다는 느낌으로 이해하면 될 것 같다.


## 표현식의 예

```java
int a = 1; 
int b = 2;
int result = a + b - 3;
```
위의 코드에서 `a + b - 3` 은 표현식이다.

```java
if ( a == b) {
    System.out.println("true");
}
```
위의 코드에서 `a == b`는 표현식이다.

이처럼 변수, 연산자, 메소드 호출 등으로 구성되어 값을 결정하는데 쓰이는 구조를 `표현식`이라 한다.

## 표현식의 범위는 언어마다 조금씩 다르다.
표현식 자체는 프로그래밍 전반적으로 쓰이는 공통된 개념이지만 언어에 따라 표현식으로 인정되는 문법이 조금씩 다르다. 

대표적으로 할당문은 **자바와 c에서 표현식으로 사용**할 수 있다. (대부분의 언어에서는 할당문이 표현식이 아닌 **선언문**(statement)이다.)

그렇다면 다음의 소스 코드는 컴파일에 성공할 수 있을까?
```java
public static void main(String[] args) {
        int a = 10;
        int p;
        int t = (p = a);
        System.out.println(t);
    }
```
뭔가 이상한 것 같지만 **정상적으로 컴파일** 되고 10을 출력한다.     
자바에서는 `할당문이 표현식으로 사용`될 수 있고, `표현식은 값을 반환`하기 때문에 가능한 것이다.

## 표현식의 활용
다음의 코드가 실행되면 콘솔에 무엇이 출력될까? 
```java
boolean b = false;

if (b = true) {
    System.out.println("true");
} else {
    System.out.println("false");
}
```
정답은 `true`이다.
그 이유는 `(b = true)`라는 표현식이 true를 반환하기 때문이다.    
false를 반환하기 위해서는 `(b == true)`라는 표현식을 사용해야 한다.

이러한 특성을 활용하여 다음과 같은 코드를 만들 수 있다.
```java
public SQLInteger(Integer obj) {
        if (isnull = (obj == null))
        ;
        else
        value = obj.intValue();
    }
```
널체크를 하는 좋은 방법들이 다양하게 있지만, 이러한 방법도 생각해 볼 수 있을 것이다.

이처럼 표현식을 잘 활용하면 코드를 더 심플하고, 직관적으로 만들 수 있다.      

## 참고 자료

https://docs.oracle.com/javase/tutorial/java/nutsandbolts/expressions.html

https://www.programiz.com/java-programming/expressions-statements-blocks

http://bryanpendleton.blogspot.com/2009/05/java-assignment-expression.html

https://medium.com/@guven.seckin.4/the-difference-between-expression-and-statement-89e74596e546
