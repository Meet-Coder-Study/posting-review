# Stack vs Queue

- 코딩에 대한 설명은 Java로 합니다. 따라서 메서드들이 모두 Java 기반인 걸 감안해주시면 감사하겠습니다.

## 선형구조(Linear Structure)

- 데이터들이 일렬로 저장되어 있는 형태입니다.
- 일렬로 저장하는 방식은 리스트와 각 데이터가 다음 데이터의 위치를 가지는 연결 리스트 두 가지 방식이 있습니다.
- 일렬로 쭉 저장되어 있는 데이터를 사용하는 방법은 리스트와 연결 리스트 외에 사용 방법에 따라 스택, 큐, 데크가 추가됩니다.

## Stack

- 한 쪽 끝에서만 자료를 넣고 뺄 수 있는 LIFO(Last In First Out) 형식의 자료 구조
- 즉, 가장 최근에(마지막에) 스택에 추가한 항목이 가장 먼저 제거될 항목이다.

![stack-vs-queue-1](https://github.com/ksy90101/TIL/blob/master/computerScience/image/stack-vs-queue-1.png?raw=true)

### Stack의 연산

- pop() : 스택에서 가장 위에 있는 항목을 제거한다.
- push(item): item 하나를 스택의 가장 윗 부분으로 추가한다.
- peek() : 가장 위에 있는 항목을 반환한다.
- isEmpty() : 스택이 비어 있을 때의 true를 반환한다.
- search() : 데이터의 위치를 반환

### 자바 코드

```java
public class Stack<E> {
    private final E[] stack;
    private int top;

    public Stack(final int size) {
        this.top = -1;
        this.stack = new E[size];
    }

    public void push(final E item) {
        stack[++top] = item;
    }

    public E peek() {
        return stack[top];
    }

    public E pop() {
        return stack[top--];
    }

    public int search(final E item) {
        for (int i = 0; i < top; i++) {
            if (stack[i] == item) {
                return i + 1;
            }
        }

        return -1;
    }

    public boolean isEmpty() {
        return stack.length == 0;
    }

}
```

### 언제 사용되는가?

- 대표적으로 프로그램을 수행할때 사용한다.
- Main 프로그램에서 함수 A를 호출하면 Main 프로그램 위에 함수 A가 쌓이고, 함수 A의 수행 중에 함수 B가 호출되면 함수 A위에 함수 B가 스택처럼 샇이게 된다.
- 실제 실행이 되면 함수 B → 함수 A 이 순서대로 실행되는데 이게 바로 LIFO 이다.

## Queue

- 데이터가 입력된 순서대로 쌓고, 먼저 들어온 데이터 부터 사용하는 FIFO(First In First Out)입니다.
- 이때 데이터를 넣는 것은 ENQUEUE, 데이터를 꺼내는 것을 DEQUEUE라고 한다.

![stack-vs-queue-2](https://github.com/ksy90101/TIL/blob/master/computerScience/image/stack-vs-queue-2.png?raw=true)

### Queue의 연산

- peek() : 맨 앞에 있는 데이터를 가져온다. (== element())
- remove(): 맨 앞에 있는 데이터를 꺼낸다.(제거) (== poll())
- add() : 큐에 데이터를 삽입한다. ( == offer())
- isEmpty(): 큐가 비어있는지 확인한다.

![stack-vs-queue-3](https://github.com/ksy90101/TIL/blob/master/computerScience/image/stack-vs-queue-3.png?raw=true)

### 자바 코드

```java
import java.util.NoSuchElementException;

public class Queue<T> {
    private Node<T> first;
    private Node<T> last;

    public Queue() {
        first = null;
        last = null;
    }

    public void add(final T data) {
        final Node<T> t = new Node(data);

        if (last != null) {
            last.next = t;
        }

        last = t;

        if (first == null) {
            first = last;
        }
    }

    public T remove() {
        if (first == null) {
            throw new NoSuchElementException();
        }

        final T data = first.data;
        first = first.next;

        return data;
    }

    public T peek() {
        if (first == null) {
            throw new NoSuchElementException();
        }

        return first.data;
    }

    public boolean isEmpty() {
        return first == null;
    }

    class Node<T> {
        private final T data;
        private Node<T> next;

        Node(final T data) {
            this.data = data;
        }
    }
}
```

### 언제 사용되는가?

- 컴퓨터 안에 여러 개의 프로세스가 수행 중인데, 새로운 프로세스가 수행되어야 하는 경우 기존에 수행되던 프로세스 중에서 가장 먼저 메모리에 올라온 프로세스가 실행되고, 새로운 프로세스를 메모리에 올리게 됩니다. 이런 경우 운영체제는 프로세스를 큐로 관리합니다.
- 운영체제에서 수행 중인 프로그램에 이벤트가 발생하면 발생한 이벤트를 큐에 저장되고, 수행중인 프로그램이 큐에 저장된 것을 앞에서부터 읽어 와서 처리합니다.

## 참고자료

[[Data Structure] Stack vs. Queue?](https://velog.io/@filoscoder/Data-Structure-Stack-vs.-Queue)

[[자료구조]Queue - add vs offer](https://goodteacher.tistory.com/112)
