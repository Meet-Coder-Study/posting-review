# Immutable Class in Java
---

1. Immutable Class 이해하기
2. Immutable Class 장점
3. Immutable Class 만들기

---

## 1. Immutable Class 이해하기

### (1). Immutable Class란?

* 불변 객체란 한번 초기화 되면 `변하지 않는 객체`를 의미한다.
* 다만 값이 변하지는 않지만 `재할당`은 가능하다.

```java
public static void main(String[] args){
        Integer i1 = 1;
        Integer i2 = i1;
}
```
자바의 Immutable class 중 하나인 Integer 클래스의 경우
위의 예에서 i2에 i1을 대입하여 같은 객체를 가리키돋록 `변할 것 같지만`
`i2는 변하지 않고 새로운 객체를 생성하게 된다. `

### (2). 자바의 Immutable class

   
---

## 2. Immutable Class 장점

### (1). 인스턴스 캐싱의 경우 메모리 효율성을 높일 수 있다.
값이 불편하기 때문에 미리 인스턴스를 만들어 놓는 인스턴스 캐싱에서 효율성이 극대화된다.


### (2). 멀티 스레드 환경에서의 안정성
값이 변하지 않고 필요할 때마다 재생성 되기 때문에 멂티스레드 환경에서 값의 변경에 따른 위험에서 안전하다.


---

## 3. Immutable Class 만들기

* 클래스에 final을 추가하여 상속 불가능하도록 함.
* 모든 필드를 private으로 하여 직접 접근할 수 없도록 함.
* setter메소드를 제공하지 않음.
* 모든 mutable 변수를 final로 선언하여 한번만 할당되도록 함.
* 모든 필드를 deep copy를 위한 생성자로 초기화 함.



---
참고한 자료   

