# 자바 스트림 개념

## 1. 스트림 소개

### (1) 스트림이란 ?

스트림이란 컬렉션(또는 배열)의 요소를 람다식으로 처리하는 반복자

---

## 2. 스트림 특징
스트림의 특징은 `람다식`, `내부반복자`, `중간처리와 최종처리` 3가지가 있다.  

### (1). 람다식  
스트림에서 제공하는 메소드는 대부분 **함수적 인터페이스를 매개변수**로 가지기 때문에 람다식으로 표현할 수 있다.   

### (2). 내부반복자  
* 외부반복자 : 일반적인 반복문인 for와 while문에 해당.    
* 외부반복자는 개발자가 `직접 요소들을 반복`하고, `요소당 처리해야할 코드`를 제어
* 내부반복자 : `컬렉션 내부에서 요소들이 반복되`고, 요소당 `처리해야할 코드만` 전달
* 내부반복자는 **내부적으로 반복 순서를 변경**하거나, **병렬 처리**를 할 수 있기 때문에 더 효율적

### (3). 중간처리와 최종처리
* 중간처리란 매핑, 필터링, 정렬 등의 작업을 뜻한다.
* 최종 처리는 반복, 카운팅, 평균, 합계 등의 집계처리를 뜻한다.
* 스트림은 이처럼 중간처리와 최종처리가 나뉘어져 있다. (그 이유는 파이프라인 항목에서)

---

## 3 스트림 소스의 종류
스트림을 사용할 수 있는 스트림 소스의 종류는 다음이 있다.
* 컬렉션 
```java
new ArrayList().stream()
```
* 배열
```java
Arrays.stream(arr)
```
* 숫자 범위
```java
IntStream.rangeClosed(1, 100)   //1 부터 100까지의 정수 범위의 스트림
```
* 파일
```java
Files.lines(path, Charset.defaultCharset());    // 해당 path의 파일의 라인을 스트림에 저장
```
* 디렉토리
```java
Files.list(path);   // path의 파일 또는 디렉토리 하위의 정보를 가져옴.
```
---

## 4. 파이프라인
### (1) 파이프라인이란?
파이프라인이란 `여러 개의 스트림이 연결되어 있는 구조`를 뜻한다.

### (2) 중간 처리와 최종 처리
* 우리가 스트림을 사용하는 이유는 대량의 **데이터를 집계**하여 원하는 결과물을 얻기 위해서 이다.
* 그러나 데이터를 집계하기 위해서는 중간처리가 필요한 경우가 있다.
* 이로 인해 `중간처리를 담당 하는 중간 스트림`과 `최종 처리를 담당하는 최종 스트림`을 연결하게 되고, 이러한 구조를 `파이프라인`이라 한다.
* 여기서  **가장 마지막 스트림은 최종 처리**(집계 처리) 스트림, **그 외의 다른 스트림을 중간 스트림**으로 구분 한다.
* 중간 스트림과 최종 스트림을 구분하는 가장 쉬운 방법은 리턴 타입이 Stream일 경우 중간스트림이고, 리턴타입이 객체 또는 기본값일 경우 최종 스트림이다.

### (3) lazy evaluation
* 파이프라인에서는 lazy evaluation 방식이 사용된다.
* lazy 방식이란 해당 값이 `실행되는 시점에 처리하지 않고` 기다렸다가, 그 값이 `실제로 필요할 때 처리`하는 것을 뜻한다.
* 말로 하면 그 뜻이 바로 이해가 되지 않는다. 아래 예제를 보자.
```java
if( fn1() || fn2() ){
    start();
}
```
* 자바에서 || 연산은 lazy 방식으로 처리된다. 즉, 위의 예제에서는
    1. fn1()과 fn2()가 실행되는 시점에 **처리하지 않고 기다림**
    2. 값이 실제로 필요한 시점, 즉 이 예제에서는 if문 안의 값이 true인지 false인지 확인하는 시점이 왔을 때 비로소 fn1()과 fn2()를 실행
    3. fn1()이 true를 반환한다면, fn2()는 실행할 필요 없이 start()가 실행됨.

* 반대로 || 연상이 lazy방식이 아닌 eager방식이라고 가정한다면 어떻게 될까?(lazy evaluation의 반대를 eager evaluation이라 한다.)
    1. fn1() 실행 시점이 오면 fn1()을 바로 실행
    2. fn2() 실행 시점이 오면 fn2()를 바로 실행
    3. start()까지 실행 순서가 오게 되면 그제서야 실행했던 fn1과 fn2의 값을 다시 확인
    4. 둘 중 하나가 true이면 start()를 실행

* 이렇게 lazy방식은 fn1()만 실행하면 되지만, eager방식은 fn1()과 fn2()를 모두 실행하게 된다.
* 따라서 lazy방식을 사용하는 stream은 성능상의 이점이 있다.

---

## 참고자료

이것이 자바다 - 신용권 (한빛미디어)
