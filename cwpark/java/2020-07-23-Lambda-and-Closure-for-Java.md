## 자바 개발자를 위한 람다와 클로저

클로저는 자바스크립트와 같은 함수형 프로그래밍을 사용하는 개발자라면 친숙하게 느껴질 것이다. 여러분이 자바 개발자라면 함수형 프로그래밍을 잘 하지 않는다고 생각할 수 있지만, 이미 제한적으로나마 람다와 클로저를 사용하고 있다.

<img src="/Users/johnpark/Dev/posting-review/cwpark/images/image-20200720053134663.png" height="300px"/>

클로저는 람다와 밀접한 관련이 있다. '닫힘'을 뜻하는 closure는 그 의미가 곧바로 와닿지 않는다. 클로저는 자신을 둘러싼 외부 코드에서 선언한 변수를 마음대로 접근할 수 있는 코드를 말한다. 바깥을 둘러싼 큰원은 '외부의 코드'를 의미한다. 이 원에 둘러싸여 있는 코드를 '내부의 코드'라고 한다. 내부의 코드가 바깥에서 선언된 `n`과 같은 변수에 접근할 수 있다면, 이 작은 원 내부의 코드를 클로져라고 한다. 클로져의 입장에서 `n`은 __자유변수(free variable)__ 혹은, __사로잡힌 변수(captured variable)__이라고 불린다. 자바에는 이미 클로저 '비슷한'것이 존재해왔다.

```java
public void foo() {
  final int n = 1;
  JButton button = new JButton("Click me");
  button.addActionListener(new ActionListener() {
    public void actionPerformed(ActionEvent e) {
      System.out.println("Clicked! n = " + n);
    }
  });
}
```

이 코드를 실행하면 어떤 동작이 일어날지는 쉽게 알 수 있다. 사용자가 마우스로 `"Click me"` 라고 적힌 버튼을 누르면 콘솔 화면에는 `"Clicked! n = 1"` 이 출력된다. 여기에 `addActionListener` 라는 메서드에게 필요한 코드는 익명클래스다. 익명클래스는 인터페이스를 별도의 장소에서 미리 구현하지 않고 곧바로 구현하도록 만들 수 있는 문법이다. 앞의 그림을 이용해 이 코드를 설명하면, 큰 원에 해당하는 것이 `foo()` 메서드이고, `ActionListener` 를 구현하고 있는 익명클래스는 작은 원에 해당한다.

그렇다면 익명클래스는 클로져인가? 이것에 대해서는 논쟁의 여지가 있다.  이 코드의 변수 `n` 을 `final` 키워드를 생략하면 이 코드는 컴파일되지 않는다. 자바는 값이 변할 수 있는 변경가능한(mutable)한 자유변수를 허용하지 않기 때문이다.

클로저를 이야기할 때 함께 따라 붙는 람다는 무엇일까? 람다는 익명클래스보다 더 간단하고 범위가 작은 __익명메서드__라고 말할 수 있다.  다음의 두 코드를 비교해 보자.

```java
new ActionListener() {
  public void actionPerformed(ActionEvent e) {
    System.out.println("Clicked! n = " + n);
  }
}
```



```java
public void foo() {
  final int n = 1;
  JButton button = new JButton("Clicke me");
  button.addActionListener( () -> {
    System.out.println("Clicked! n = " + n);
  });
}
```

첫 번째 코드가 익명클래스이다. 이 익명클래스 `ActionListener`를 익명메서드로 바꿨다. 클로저와 람다는 서로 밀접하게 연관되어 있지만 다른 개념이다. 클로저는 외부에 정의된 변수를 참조하는 코드조각이다. 위 람다 코드에서 `n`에 대한 참조를 생략하여 `() -> System.out.println("Clicked!")` 라고 작성해보자. 이것은 여전히 람다 표현식이지만, 외부에 정의된 변수에 대한 참조가 이루어지지 않았으므로 클로저가 아니다. 반면, `() -> System.out.println("Clicked! n = " + n)` 이라는 식으로 작성되었다면 이것은 람다 표현식임과 동시에 클로저다.

만약 final 변수를 사용하지 않으려면 컴파일러를 속이는 트릭을 이용하면 된다.

```java
public class Main {
    static class Counter {
        int value;
    }
    public static void main(String[] args) throws InterruptedException {
        Counter c = new Counter();
        c.value = 3;
        Thread t = new Thread(
                () -> System.out.println(c.value++)
        );

        t.start();
        Thread.sleep(100);
        System.out.println(c.value); 

    }
}
```

위 코드의 출력 값은 각각 `3`, `4` 이다. 이러한 사이드 이펙트는 함수형 프로그래밍의 변경 불가능성 법칙을 무시한다. 조슈아블로흐는 변경 불가능성(immutability)를 최대한 활용하라고 한다. <이펙티브 자바>에서 블로흐는 코드의 변경불가능성과 관련하여 다음 다섯 가지 규칙을 권장했다.

>1. 객체의 상태를 변경시키는 메서드를 제공하지 마라.
>2. 클래스가 상속되지 못하도록 만들어라.(final)
>3. 모든 필드를 final로 선언하라
>4. 모든 필드를 private으로 선언하라
>5. 변경불가능성을 만족시키지 못하는 컴포넌트에 대한 접근을 통제하라.

__변경불가능성(immutability)__은 함수형 프로그래밍 패러다임이 갖는 매우 중요한 덕목이다. 블로흐의 다섯 가지 규칙은 멀티 쓰레딩 환경에서 중요한 의미를 갖는다. 왜냐하면, 객체가 생성된 다음에 값이나 상태가 불변하는 객체는 멀티쓰레딩 환경에서도 동시성 문제를 염려하지 않으면서 안전하게 사용할 수 있기 때문이다. 이러한 스타일이 바람직한 것이라고 말할 수 있다면 언어 자체의 기능으로 구현하지 않을 이유는 무엇인가? "자바는 이미 충분히 복잡하다."는 것이 조슈아 블로흐의 설명이다. 제임스 고슬링과 블로흐가 __자바의 단순성__을 지키기 위해 부단히 노력해왔음을 인정해야 한다.  

이렇게 제한적으로 사용하는 클로저인 익명클래스는 진정한 의미에서 클로저일까? 이에 대한 논쟁이 거듭해서 이어져왔고, 자바 커뮤니티의 최고의 파트너인 닐 게프터와 조슈아 블로흐는 함수형 시스템 도입에서 서로 입장을 달리한다.

닐 게프터에 의하면 클로저는 __'어휘문맥(lexcial context)안에 존재하는 자유변수(free variables)를 이용하는 함수'__를 의미한다. 여기서 어휘문맥은 여는 괄호 '{' 와 닫는 괄호 '}' 사이에 존재하는 코드의 범위를 의미한다. 자유변수는 이러한 문맥의 바깥에서 정의되었지만 클로저 내부에서 참조되는 변수를 의미한다. 게프터는 익명클래스를 클로저로 보지 않았다. 블로흐는 클로저와 관련된 기능은 그 정도면 충분하다고 생각했다. 게프터는 자바에 함수 타입을 도입할 것을 주장했다. 블로흐는 타입을 추가하는 것은 자바의 철학인 간단명료함에 위배된다고 말했다. 

---

폴리글랏 프로그래밍, 임백준, 한빛미디어(2015)

https://dzone.com/articles/java-8-lambas-limitations-closures