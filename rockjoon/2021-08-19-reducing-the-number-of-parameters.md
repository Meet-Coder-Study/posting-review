# 파라미터 수 줄이기

##

```
매개변수 목록은 짧게 유지하자. 4개 이하가 좋다.

- 이펙티브 자바 (아이템51)
```
```java
3개 이상의 매개변수는 가능한한 피해야 한다.

- 클린 코드
```

## 1. 메서드 내부에서 처리하기

굳이 파라미터로 전달할 필요가 없는 경우에는 메서드 내부에서 처리할 수 있다.
```java
// 리스트와 그 길이를 받는 함수
public List<Integer> take(List<Integer> list, int size) {
    ...
}

// 리스트만 받아 길이를 계산한다.
public List<Integer> take(List<Integer> list) {
        int size = list.size();
        ...
}
```
위의 예제와 같이 단순한 경우는 문제가 없지만 다음과 같은 경우는 어떨까?
```java
List<Integer> list = List.of(1, 2, 3);
//외부에서 size를 계산한다.
int size = list.size();

public List<Integer> take(List<Integer> list) {
    // 이미 계산된 size를 다시 계산하게 된다.
    int size = list.size();
        ...
}
```
만약 함수 외부에서 이미 필요한 값을 계산했다면? 이를 함수 내부에서 다시 계산하는 것이 불필요할 수 있다.  

개인적으로는 이런 경우라고 하더라도 함수 내부에서 다시 계산하는 것이 일반적으로 더 좋다고 생각한다.  
그 이유는 메서드의 외부 의존성을 줄일 수 있기 때문이다.  
만약 위의 예에서 size가 도중에 변경된다면 함수 내부에서 list.size()와 size의 값이 같음을 보장할 수 없다.

다만, 이는 상황에 따라 다를 것이다. 외부에서 연산하는 작업이 무겁다면 이를 메서드 내부에서 중복되는 것이 매우 비효율적일 것이다.

## 2. 객체로 감싸기
여러가지 파라미터를 하나의 객체로 감싸 전달한다.
```java
// 구매를 처리하는 함수에서 유저 아이디, 상품이름, 상품 수량을 각각 전달 받고 있다.
public void purchase(Long userId, String productName, int amount) {
    ...
}

//Order라는 객체로 감싸 전달한다.
public void purchase(Order order) {
        ...
}
```
이처럼 파라미터를 하나의 객체로 표현할 수 있는 경우 파라미터를 묶어 전달한다.  
하지만 서로 다른 성격의 파라미터의 경우 객체 하나로 감싸기 애매할 경우가 있다.  

만약 요구사항이 사용자가 업로드한 이미지로 티셔츠를 제작하여 판매하는 기능이라면 어떻게 될까?
```java
public void purchase(Order oder, Path filePath) {
    ...
}

// OrderAndPath라는 역할이 모호한 객체를 만든다...?
public void purchase(OrderAndPath orderAndPath) {
    ...
}
```
이 경우 order와 filePath라는 서로 관련 없는 객체를 하나로 묶기가 애매하다. 그렇게 되면 객체의 응집도가 낮아지기 때문이다.  

## 3. 메서드 분리하기
위의 예에서는 파라미터를 하나로 묶기 보다는 메서드를 분리하는 것이 더 적절하다.  
즉 파일을 업로드하는 메서드와, 구매를 진행하는 메서드를 각각 만드는 것이다.
이를 통해 메서드의 역할을 분명히 하고 파라미터 수를 줄일 수 있다. 

```java
uploadImage(Path filePath);
purchase(order);
```

## 4. 빌더 패턴을 메서드에 적용하기

