# [ 이펙티브 자바 ] 아이템7. 다 쓴 객체 참조를 해제하라.

자바는 gc의 존재로 인해 프로그래머가 메모리를 직접 관리할 일이 없다.

하지만 항상 그런 것 만은 아니다.

다음의 코드를 살펴보자. 문제점을 파악할 수 있겠는가?

```java
public class Stack {

    private Object[] elements;
    private int size = 0;
    private static final int DEFAULT_INITIAL_CAPACITY = 16;

    public Object[] getElements() {
        return elements = new Object[DEFAULT_INITIAL_CAPACITY];
    }

    public void push(Object e) {
        ensureCapacity();
        elements[size++] = e;
    }

    public Object pop() {
        if (size == 0)
            throw new EmptyStackException();
        return elements[--size];
    }

    private void ensureCapacity() {
        if (elements.length == size) {
            elements = Arrays.copyOf(elements, 2 * size + 1);
        }
    }

}
```

겉보기에는 큰 문제가 없어보일 수 있지만,

이 스택을 사용하는 프로그램은 시간이 지날 수록 gc의 활동량과 메모리 사용량이 늘어나 

심한 경우 OutOfMemoryError까지 발생시킬 수 있다. 

그 이유는 바로 `pop()` 메서드에 있다.
 
pop()메서드에서는 최상위의 데이터를 꺼내고 나서 단순히 배열의 이전 인덱스로 돌아가기만 한다.

즉, pop된 데이터는 **여전히 남아 있는 것이다.**

---

## gc의 기본 작동 원리

gc는 기본적으로 `unreachable한 객체`에 대해 작동하게 되어있다.

여기서 unreachable이라는 것은 참조가 더 이상 메모리 영역에 닿지 않는 것을 뜻한다.

```java
String a = "old";
a = "new";          // 변수 a의 참조는 더이상 "old"에 닿지 않는다.
```

하지만 위의 스택에서는 pop을 하더라도 **pop된 데이터에 닿을 수 있다.**

즉, unreachable하지 않다.

단지 배열의 익덱스를 원래대로 더해주기만 하면 되는 것이다.

그렇다면 이 스택의 메모리 누수를 막는 해결법은 무엇이 있을까? 

방법은 간단하다. 다쓴 참조를 참조 해제(null) 해주기만 하면된다.
```java
public Object pop() {
    if (size == 0)
        throw new EmptyStackException();
    Object result = elements[--size];
    elements[size] = null;      // 다쓴 참조를 null 처리 한다.
    return result;
}
```

---

## 참조 해제

다만 모든 객체에 대해 참조가 사라지자 마자 null처리를 할 필요는 없다.

이는 오늘날의 **똑똑해진 gc에 비해 특별히 좋은 것이 없을 뿐더러, 코드의 가독성을 해칠 수 있다.**

가장 좋은 방법은 해당 `참조를 담은 변수를 유효 범위(scope) 밖으로 밀어내는 것`이다.

때문에 변수의 범위는 가능한한 최소로 정의하는 것이 좋다.

---

## 직접 null 처리가 필요한 경우

대부분의 경우 gc에게 참조 해제를 맡기되, 다음의 경우에는 특별히 신경 쓸 필요가 있다.

*1*. 자기 메모리를 직접 관리하는 클래스

위에서 살펴본 Stack처럼, 스스로 메모리를 관리하는 경우에는 gc가 더 이상 쓸모없는 객체인지 알 길이 없기 때문에 직접 null 처리가 필요하다.

*2*. 캐시

다쓴 객체를 캐시에 넣고 나서 그냥 놔둔다면 이 역시 메모리 누수의 주범이 될 수 있다.

해결법 중 하나는 `WeakHashMap`을 사용하는 것이다. WeakHashMap을 이용하여 캐싱하면 다 쓴 엔트리는 즉시 자동으로 제거된다.

*3*. 리스너 혹은 콜백

콜백을 등록만 하고 명확히 해지하지 않는다면, 콜백은 계속 쌓일 수 있다. 

이 경우에는 약한 참조로 저장하는 것이 하나의 방법이 될 수 있다.

---

## 코멘트

* 오늘날에는 위에서 언급한 경우를 제외하면 거의 직접 참조해제를 할 일이 없다.
* 따라서 위에서 살펴본 예외 상황을 잘 숙지하고, 평소에는 변수의 scope를 최소화 하는 것을 습관화 하는 것이 중요할 것 같다.
* 메모리 누수는 발생하면 골치아파진다. 예방이 가장 중요하다!

