# String vs StringBuilder vs StringBuffer

## String

- immutable(불변)의 특징을 가진다.
    - 객체를 생성한 후에 상태를 변경할수 없습니다.
- JVM 메모리 중에 힙(Heap) 영역에 생성된다.
- 불변이기 때문에 멀티쓰레드 환경에서 동기화를 신경 쓸 필요가 없다.
- 리터럴("")로 선언하면 특수하게 String  Constantpool이라는 공간에 생성되며 이 메모리 공간은 절대 변하지 않는다. 즉, 문자열 값은 절대 변하지 않은다.

![string-stringbuilder-stringbuffer-1](https://github.com/ksy90101/TIL/blob/master/java/image/string-stringbuilder-stringbuffer-1.png?raw=true)

- 즉, + 연산이나, concat 메서드를 사용해 문자열을 변환해도 메모리 공간내의 값이 변하는 것이 아니라 String Constant pool이라는 공간 메모리 안에 새로운 메모리를 할당 받아 새로운 객체를 생성한다.
- 이렇게 연산을 할 떄마다 새로운 문자열이 만들어 지면 기존 문자열은 가바지 콜렉터에 의해 제거 되지만, 제거 시기가 언제인지 모르기 때문에 성능이 떨어지게 된다.

## StringBuilder

![string-stringbuilder-stringbuffer-2](https://github.com/ksy90101/TIL/blob/master/java/image/string-stringbuilder-stringbuffer-2.png?raw=true)

- 위의 String 객체가 불변의 특성을 가지고 있어 단점들을 보안하기 위해 JDK 1.5에서 release 하게 되었다.
- mutable(가변)의 특징을 가진다.
- 빌더패턴을 이용해 String을 처리한다고 생각하면 좋을거 같습니다.(그러나 해당 StringBuilder가 빌더 패턴을 사용한거지에 대한 논란은 있습니다.)

[StringBuilder - Java Articles](https://www.javarticles.com/2014/12/stringbuilder.html)

- StringBuffer에 비해 Thread-Safe 하지 않지만, 싱글쓰레드 환경에서는 연산처리가 굉장히 빠르다.

### 적절한 경우

- 문자열 연산이 많고 싱글쓰레드 환경에서 사용하는 것이 좋다.

## StringBuffer

![string-stringbuilder-stringbuffer-3](https://github.com/ksy90101/TIL/blob/master/java/image/string-stringbuilder-stringbuffer-3.png?raw=true)

- mutable(가변)의 특징을 가진다.
- StringBuilder와 기능을 똑같지만, 멀티쓰레드 환경을 고려해 `synchronized` 키워드를 사용해 동기화를 할 수 있다. 즉, Thread-Safe한 객체이다.

### 적절한 경우

- 멀티쓰레드 환경이며 문자열의 연산이 많이 필요할 경우 사용하면 좋다.

### 정리

- String은 불변으로써 연산이 많다면 인스턴스 생성이 계속되어 성능이 떨어지므로 연산보다는 조회가 많고 멀티쓰레드 환경에서 사용하면 좋다.
- StringBuilder는 연산이 자주 발생할 경우 문자열을 변경할수 있기 때문에 성능적으로 유리하게 된다. 따라서 동기화가 필요없는 싱글쓰레드 환경에서 사용하는 것이 좋다.
- StringBuffer는 연산이 자주 발생할 경우 문자열을 변경할 수 있기 때문에 성능적으로 유리하게 된다. 그러나 synchronized 키워드를 사용하기 때문에 동기화가 필요한 멀티 쓰레드 환경에서 사용하는 것이 좋다.

## 참고자료

[JAVA String, StringBuffer, StringBuilder 차이점](https://jeong-pro.tistory.com/85)
