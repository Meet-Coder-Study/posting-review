# Immutable Class in Java
---

1. Immutable Class 이해하기
2. Immutable Class 장점
3. Immutable Class 만들기

---

## 1. Immutable Class 이해하기

### (1). Immutable Class란?

* 불변 클래스(혹은 객체)란 한번 초기화 되면 `변하지 않는 객체`를 의미한다.
* 다만 `재할당`은 가능하다.

```java
public static void main(String[] args){
        Integer i1 = 1;
        i1 = 2;
}
```
Integer 클래스는 자바의 대표적인 Immutable class 중 하나이다.   
위의 예에서 i1에 '1'을 대입하여 초기화를 하고,   
이후 다시 i1에 '2'를 할당하였다. 그렇다면 `Integer i1은 변한 것일까?`   
   
정답은 '변하지 않았다'이다. 이는 i1이 값을 변경한 것이 아니라,   
`내부적으로 Integer객체를 새롭게 생성`하였기 때문이다.   
이러한 특성을 갖는 객체를 '불변 객체'(Immutable)라고 한다.
   
   
---

## 2. Immutable Class 장점

### (1). 인스턴스 캐싱

Immutable 객체는 인스턴스 캐싱을 구현할 때 사용되는데, 이는 인스턴스를 공유하여 메모리를 절약하는데 효과가 있다.   
>인스턴스 캐싱이란?   
반복적으로 사용되는 인스턴스를 미리 저장해 놓고 필요시 저장된 인스턴스를 사용하는 것

![](images/repeat.jpg)

예를 들어 자바의 *Integer 클래스*는 **내부적으로 인스턴스 캐싱을 사용**하고 있는데,   
`일정 범위의 정수를 미리 생성하여 캐쉬 배열에 저장해 놓았다가, 어플리케이션에서 사용될 때 꺼내서 사용하는 형태`이다.   

이떄, 한 어플리케이션에서 '1'이라는 Integer 값을 100번 사용한다고 가정해보자.   
Integer가 Immutable하지 않아서 값이 수시로 바뀐다면 끔찍한 부작용이 뒤따를 것이다.   
때문에 인스턴스 캐싱에서는 Immutable class가 사용된다.




### (2). 상태의 안정성 보장
다음과 같이 사용되는 Integer 객체가 있다고 한다면,
```java
public static void main(String[] args){
        Integer i = new Integer(20);
        System.out.println(i);
        operate(i);
        System.out.println(i);
    }

    private static void operate(Integer i) {
        i = i + 1;
    }
```
```java
20
20
```

### (3). thread safe
앞서 살펴본 2번의 이유로, 근본적으로 멀티 스레드 환경에서 안정성이 보장된다.

---

## 3. Immutable Class 만들기

* (1). 클래스에 final을 추가하여 상속 불가능하도록 함.
* (2). 모든 필드를 private으로 하여 직접 접근할 수 없도록 함.
* (3). 모든 mutable 변수를 final로 선언하여 한번만 할당되도록 함.
* (4). setter메소드를 제공하지 않음
* (5). 생성자에서 필드들이 deep copy 되도록 생성.
* (6). getter 메소드에서 리턴 값을 clone() 또는 new()로 생성.

```java
public final class Immutable {      //(1) final class

    private final String name;      //(2) private field
    private final int age;          //(3) final field
    private final HashMap<Integer, String> map;

    public String getName(){
        return name;
    }
    public int getAge(){
        return age;
    }

    public HashMap<Integer, String> getMap() {
        return (HashMap<Integer, String>) map.clone();    
         //(6) getter 에서 clone() 사용
    }

    //(4) setter x

    //(5) deep copy constructor 
    public Immutable(String name, int age, HashMap<Integer, String> map) {
        this.name = name;
        this.age = age;
        HashMap<Integer, String> newMap = new HashMap<>();
        for(Integer key : map.keySet()){
            newMap.put(key, map.get(key));
        }
        this.map = newMap;
    }
}
---
참고한 자료   
* https://www.journaldev.com/129/how-to-create-immutable-class-in-java
* https://woowacourse.github.io/javable/2020-06-24/caching-instance
* https://devonce.tistory.com/26
* https://www.tutorialspoint.com/primitive-wrapper-classes-are-immutable-in-java

