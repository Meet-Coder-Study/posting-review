# 자바 제너릭의 지우개(eraser)

자바 제너릭의 지우개 기능은 컴파일 과정에서 '제너릭' 혹은 '타입 파라미터'와 관련된 정보를 남김 없이 지운다. 자바에서 제너릭과 관련된 정보는 소스코드 차원에서만 존재한다. 코드가 컴파일되고 바이트코드가 되면 모든 것이 제너릭 이전의 자바 5 코드와 다를 것이 없다. 

여러분이 코드를 작성할 때 `List<Integer>` 와 `List<Double>` 은 서로 다른 타입으로 인식할 것이다. 하지만 바이트코드에서는 둘다 똑같은 `List`다. 왜 이것이 문제가 될까?

JVM이 모두가 똑같은 `List` 를 처리한다면 실행시간에 타입정보를 알 수 없으니 타입에 접근할 수 없다. 따라서 성능 향상을 기대할 수 없는 것이다.  C#의 경우와 비교해보자. C#은 제너릭 타입을 컴파일하면 IL(intermediate language) 코드가 타입 정보와 함께 남게 된다. IL코드는 자바의 바이트코드와 같은 개념이다. `List<Integer>` 와 `List<Double>` 이 다른 IL 코드라는 것이다. 게다가 C#의 저스트인타임 컴파일러는 IL 코드를 바이너리 코드로 컴파일할 때, 여전히 타입 파라미터 내용을 기억한다. 따라서, C#의 제너릭은 자바의 제너릭보다 실행시간 성능이 좋으며, 코드를 간결하게 작성할 수 있는 것이다.

자바가 C#처럼 컴파일 이후에도 타입 정보를 가질 수는 없을까? 이렇게 하려면, JVM과 저스트인타임 컴파일러를 대대적으로 손봐야한다. 자바는 이미 널리 사용되고 있었고, 호환성을 위해 모험을 감행하기 어려웠다.

자바의 제너릭 특징을 C#코드와 비교해서 살펴보자. 다음의 C# 코드는 제너릭 메서드다.

```c#
public void Add<E>(E fruit)
{
  if (fruit.GetType() == typeof(Apple))
    Console.out.WriteLine("I got an apple");
  else if(fruit.GetType() == typeof(List<Apple>))
    Console.out.WriteLine("I got a list of apples");
} 
```

이 메서드는 E라는 제너릭 타입을 인자로 받는다. `GetType()` 메서드는 객체의 실행시간 타입을 반환한다. `typeof` 는 컴파일시간 타입을 반환하는 키워드다. 자바로 표현하자면, `GetType()` 은 `instanceof` 와 비슷하고, `typeof` 는 리플렉션이나 Class 객체를 이용한 것과 비슷하다. 

```java
public <E> void add(E fruit) {
  if (fruit instanceof Apple)
    System.out.println("I got an apple");
  else if (fruit instanceof List<Apple>)
    System.out.println("I got a list of apples");
}
```

이 자바 코드는 불행히도 컴파일되지 못한다. 자바 컴파일러는 다음과 같은 에러 메시지를 출력한다.

> "Cannot perform instanceof check against parametererized type List\<Apple\>. Use the form List\<?\> instead since further generic type information will be erased at runtime."
>
> "파라미터화된 타입 List\<Apple\>에 대해서는 instanceof 검사를 수행할 수 없습니다. 실행시간에는 제너릭 타입과 관련된 정보가 지워지므로 List\<?\> 를 사용하세요."

컴파일러가 List\<Apple\> 대신 사용하려고 알려주는 List\<?\> 는 결국 제너릭을 사용하지 않는 자바 5 이전의 List 로 작성하라는 것과 마찬가지다. 여기에서 '?'는 '\<? extends Object\>' 의 축약형이다. 자바의 모든 클래스가 Object의 하위클래스이므로 생략된 것이다. 컴파일 에러를 피하기 위해 다음과 같이 작성해보자

```java
public <E> void add(E fruit) {
  if (fruit instanceof Apple) 
   System.out.println("I got an apple");
  else if (fruit instanceof List<?>)
    System.out.println("I got a list of apples");
}
```

하지만 이 코드는 그냥 제너릭을 사용하지 말라는 것과 같다. 만약 리스트 안에 사과가 아니라 배나 귤이 담겨 있어도 "I got a list of apples" 라는 결과를 얻게 된다. 이것이 자바의 제너릭이 제한적인 이유다. 자바의 제너릭을 만든 마틴 오더스키는 자바의 제너릭을 디자인할 당시 제약 때문에 어쩔 수 없었다고 설명했다. 새로운 코드가 과거 제너릭을 사용하지 않은 코드와 호환되기 위해서는 피할 수 없는 선택이었다는 것이다. 바이트코드와 JVM의 내부를 뜯어 내지 않는 이상, 지우개 기능은 자바와 영원히 운명을 함께할 것이다.



---

폴리글랏 프로그래밍, 임백준, 한빛미디어(2015)