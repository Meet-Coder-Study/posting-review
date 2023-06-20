# Overview

Java의 주요한 특징 중 하나는 ‘하위 호환성'입니다. 자바는 이전 버전과의 호환성을 위해 최대한 보수적으로 발전하였으며 그로인해 자바 생태계를 유지를 했지만 언어적 한계를 극복하기 보다는 보완을 해왔습니다. 그 중 대표적인 케이스가 제네릭(Generic)입니다.

제네릭는 자바 1.5버전부터 생겨난 개념입니다. 잠시 예제 코드를 보겠습니다.

```java
List list = new ArrayList();
list.add(1)
String foo = (String) list.get(0); // 런타임 에러 발생 (ClassCastExceptions)
```

위의 코드는 에러가 발생할 것을 누구나 예측할 수 있지만 컴파일러는 감지하지 못합니다. 이에 타입을 명시해서 객체 컴파일러가 에러를 감지하고 캐스팅의 필요성을 제거하는 것이 제네릭을 사용하는 이점입니다.

```java
List<Integer> list = new ArrayList<>();
list.add(1)
String foo = (String) list.get(0); // 컴파일 에러 발생
```

따라서 컴파일 시점에서 안전하게 타입을 사용할 수 있습니다.

제네릭 타입는 자바 1.5버전부터 생겨났습니다. 자바는 하위호환성을 중요하게 생각합니다. 따라서 제네릭 타입을 선언한 코드들도 1.5 이하의 하위 버전에서 동작을 해야했습니다. 이를 위해 제네릭 타입은 컴파일에서만 작성을 하고 런타임 시점에 제네릭 타입을 모두 소거해버립니다. 다른 클래스들과의 충돌을 없애기 위해서입니다.

다시 말해 제네릭 타입은 컴파일전에만 유효합니다. 따라서 Java에서는 런타임 시점에 본인의 제네릭 타입을 알 수 없고 사용을 할 수 없습니다. ([자바에서는 이를 해결하기 위해 raw 타입의 방법을 사용할 수 있는데 권장하는 방법이 아니다.](http://happinessoncode.com/2018/02/08/java-generic-raw-type/)) 

# 공변성, 반공병성, 무변성

제네릭을 알아보기 위해서는 공변성(covariance), 반공병성(countervaraince), 무변성(invariant)을 이해해야 합니다. 일단 다음과 같은 객체들의 예시를 확인해보겠습니다.

우선 공통적인 단어인 변성(variance)에 대해서 알아보겠습니다. 변성은 타입의 계층 관계(Type Hierarchy)에서 서로 다른 타입 간에 어떤 관계가 있는지를 나타내는 개념입니다. 제네릭(Generic)을 사용할 때 기저 타입(Base Type)이 같고 타입 인자(Type argument)가 다른 경우 서로 어떤 관계가 있는지를 나타내는 것이라고 보면 됩니다.

```java
public class Animal {
    private String name;
    private String sex;
    private Integer age;
}
```

```java
public class Cat extends Animal {}
```

```java
public class Dog extends Animal {}
```

```java
public class RussianBlueCat extends Cat{}
```

![](https://velog.velcdn.com/images/eastperson/post/829d88fc-efb9-4712-ad76-2fcba503c385/image.png)


위의 예시에서 `Cat`은 `Animal`의 하위 타입이고 `Cat`이 `Animal`을 대체해서 사용할 수 있다는 것을 알 수 있습니다. 이는 **리스코프 치환 원칙(Liskov Substitution Principle)** 에 해당합니다. 상위 타입이 사용되는 곳에는 언제나 하위 타입의 인스턴스를 넣어도 동작할 수 있어야 합니다. 

`List<Cat>`에서 `List`는 기저 타입, `Cat`은 타입 인자입니다. 따라서 `List<Animal>`에서 `Cat` 타입의 객체를 추가할 수 있습니다. 그런데 `List<Cat>`은 `List<Animal>`의 하위 타입일까요? 그렇지 않습니다. 이는 제네릭 타입이 무공변이기 때문입니다.

## Java Array의 공변성

```java
public class Main {
    public static void main(String[] args) {
        Cat[] cats = new Cat[3];
        cats[0] = new Cat("야옹이1", "male", 5);
        cats[1] = new Cat("야옹이2", "female", 5);
        cats[2] = new Cat("야옹이2", "male", 5);
        walk(cats);
    }

    private static void walk(Animal[] animals) {
        for (Animal animal : animals) {
            System.out.println(animal.getName() + ": 걸음걸음");
        }
    }
}
```

```java
야옹이1: 걸음걸음
야옹이2: 걸음걸음
야옹이2: 걸음걸음
```

기본적으로 자바의 배열은 공변입니다. 따라서 `Animal[]`를 인자로 받는 메서드에서도 `Cat[]` 배열을 인자로 받아 메서드를 실행시킵니다. 즉, `Cat[]`는 `Animal[]`의 하위 타입입니다. 자바 배열의 이러한 공변성은 문제를 발생시킵니다.

```java
public class Main {
    public static void main(String[] args) {
        Dog[] dogs = new Dog[3];
        Animal[] animals = dogs;
        animals[0] = new Cat("야옹이", "female", 3);
        Dog dog = dogs[0]; // 런타임 ArrayStoreException 발생
    }
}
```

위와 같은 컴파일러가 감지하지 못하는 런타임 예외가 발생합니다. 공변성은 보장되지만 type-safe하지 않은 문제가 발생합니다.

## Java Generic의 공변성, 반공변성, 무공변성

제네릭은 타입의 경계를 선언할 수 있습니다. 계층 구조간의 상한(upper bound), 하한(lower bound)의 경계를 제한할 수 있습니다. 이러한 문법은 각 타입 생성자에게 리스코프 치환 법칙을 허용하므로서 유연한 설계를 가능하게 해줍니다.

|  | bound | java | 변성 |
| --- | --- | --- | --- |
| 상한 경계 | Upper bound | Type<? extends T> | 공변성(covariant) |
| 하한 경계 | Lower bound | Type<? super T> | 반공변성(contravariant) |
| unbounded Type | unbounded | Type<T> or Type<? extends Object> | 무공변성(invariant) |

### 무공변성

```java
List<RussianBlueCat> list = new ArrayList<Object>(); // 컴파일 에러
List<RussianBlueCat> list2 = new ArrayList<Animal>(); // 컴파일 에러
List<RussianBlueCat> list3 = new ArrayList<Cat>(); // 컴파일 에러
List<RussianBlueCat> list4 = new ArrayList<RussianBlueCat>();
```

![](https://velog.velcdn.com/images/eastperson/post/58f21323-e3b2-4e1f-acb8-6335812bcc39/image.png)


무공변성은 선언한 타입 인자의 타입만 사용이 가능합니다. 

### 공변성

```java
List<? extends Animal> list = new ArrayList<Object>(); // 컴파일 에러
List<? extends Animal> list2 = new ArrayList<Animal>();
List<? extends Animal> list3 = new ArrayList<Cat>();
List<? extends Animal> list4 = new ArrayList<RussianBlueCat>();
```

![](https://velog.velcdn.com/images/eastperson/post/7da51480-1208-4790-89d1-e1e19cd107fb/image.png)



`List<? extends Animal>`는 `ArrayList<Object>`의 하위 타입이므로 공변성이 적용되었습니다.

### 반공병성

```java
List<? super Cat> list = new ArrayList<Object>();
List<? super Cat> list2 = new ArrayList<Animal>();
List<? super Cat> list3 = new ArrayList<Cat>();
List<? super Cat> list4 = new ArrayList<RussianBlueCat>(); // 컴파일 에러
```

![](https://velog.velcdn.com/images/eastperson/post/ec47f6e7-c7fc-4a1b-ae73-e1a1f71a127d/image.png)


`List<? super Cat>`는 `ArrayList<RussianBlueCat>`의 상위 타입이므로 반공변성이 적용되었습니다.

![](https://velog.velcdn.com/images/eastperson/post/4e101ffe-6263-469f-85c3-c1c1d8b4e0c3/image.png)


이렇게 제네릭 타입은 변성을 적용하여 타입 안전(type-safe)과 
프 치환 원칙을 동반하였습니다.

# Reference

- [Java Generics Interview Questions (+Answers)](https://www.baeldung.com/java-generics-interview-questions)

- [[Java] Generic Type erasure란 무엇일까?](https://devlog-wjdrbs96.tistory.com/263)

- [Variance in programming languages](https://rubber-duck-typing.com/posts/2018-05-01-variance-in-programming-languages.html)

- [Java Generics - Lower and Upper bound](http://egloos.zum.com/ryukato/v/1182733)

- [JVM 언어 의 공변](https://wjdtn7823.tistory.com/88)

- [Type Erasure](https://docs.oracle.com/javase/tutorial/java/generics/erasure.html)

- [Generic Type Erasure는 어떻게 타입캐스팅을 하는건가요?](https://woodcock.tistory.com/37)

- [Java 제네릭 - Raw Type을 쓰면 안되는 이유](http://happinessoncode.com/2018/02/08/java-generic-raw-type/)

- [가변성(Variance) 알아보기 - 공변, 무공변, 반공변](https://sungjk.github.io/2021/02/20/variance.html)

- [JAVA 제네릭 배열을 생성하지 못하는 이유](https://pompitzz.github.io/blog/Java/whyCantCreateGenericsArray.html#_1-%E1%84%87%E1%85%A2%E1%84%8B%E1%85%A7%E1%86%AF%E1%84%8B%E1%85%B3%E1%86%AB-%E1%84%80%E1%85%A9%E1%86%BC%E1%84%87%E1%85%A7%E1%86%AB-%E1%84%8C%E1%85%A6%E1%84%82%E1%85%A6%E1%84%85%E1%85%B5%E1%86%A8%E1%84%8B%E1%85%B3%E1%86%AB-%E1%84%87%E1%85%AE%E1%86%AF%E1%84%80%E1%85%A9%E1%86%BC%E1%84%87%E1%85%A7%E1%86%AB)

- [제네릭, 그리고 변성(Variance)에 대한 고찰 (1) - Java](https://asuraiv.tistory.com/16)

- [자바의 변성 - 공변/무공변/반공변, 사용지점 변성과 선언 지점 변성](https://scshim.tistory.com/531)

- [객체지향 개발 5대 원칙 (SOLID)](https://velog.io/@lsb156/%EA%B0%9D%EC%B2%B4%EC%A7%80%ED%96%A5-%EA%B0%9C%EB%B0%9C-5%EB%8C%80-%EC%9B%90%EC%B9%99-SOLID)

- [공변성, 반공변성, 무공변성이란?](https://velog.io/@lsb156/covariance-contravariance)

- [[java] 배열(Array)과 컬렉션 제네릭의 차이](https://sabarada.tistory.com/123?category=815130)

- [Java 배열과 리스트의 공변성과 반공변성, 무공변성](https://junroot.github.io/programming/Java-%EB%B0%B0%EC%97%B4%EA%B3%BC-%EB%A6%AC%EC%8A%A4%ED%8A%B8%EC%9D%98-%EA%B3%B5%EB%B3%80%EC%84%B1%EA%B3%BC-%EB%B0%98%EA%B3%B5%EB%B3%80%EC%84%B1,-%EB%AC%B4%EA%B3%B5%EB%B3%80%EC%84%B1/)

- [[Java] Generic Type erasure란 무엇일까?](https://devlog-wjdrbs96.tistory.com/263)
