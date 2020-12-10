# PECS(Producer Extends, Consumer Super) 이해하기



조슈아 블로크는 자바 제너릭의 와일드카드 사용법을 쉽게 익히기 위해 PECS라고 이름을 지었다. PECS는 연상기호(Mnemonic)이다. PECS란 Producer Extends, Consumer Super의 줄임말로, 생산자는 extends하고, 소비자는 super한다는 말이다. 여기서 생산자, 소비자는 무엇을 뜻하는 것이고 이것들이 extends, super한다는 말은 도대체 무슨 의미일까?

먼저 PECS를 살펴보기 전에, 자바의 파라미터 타입은 공변(covariant)하지 않고 **불변(invariant)** 하다는 것을 이해해야 한다. 자바는 배열에서는 공변을 유지하지만 제너릭에서는 불변이다. String은 Object의 서브 타입이다. 인정하는가? 그렇다면, List\<String>은 List\<Object>의 서브타입인가? 그렇지 않다. [존 스키트(Jon Skeet)가 작성한 예제](https://stackoverflow.com/a/2745301/697449)를 통해 살펴보자.

```java
List<Dog> dogs = new List<Dog>();
List<Animal> animals = dogs; // Incompatible types 컴파일 오류 !
animals.add(new Cat()); // 고양이를 집어넣는다.
Dog dog = dogs.get(0); // 이게 고양이일까 개일까?
```

귀류법으로 이것이 왜 런타임에 안전하지 않는지 증명해보자. 제너릭이 공변이라고 하고, Animal이 Dog과 Cat의 상위 타입이라고 가정하자. 먼저, List\<Animal> 타입에 List\<Dog> 인스턴스를 할당했다. 3번째 줄에서 animals에 Cat 인스턴스를 추가하여 dogs의 0번을 꺼내면 이것이 고양이일까? 분명히 개를 기대했을 텐데 말이다. 이처럼 제너릭 공변을 허용한다면 런타임에 안전하지 못하다.

Array의 경우를 살펴보자.

```java
String[] strings = new String[2];
Object[] objects = strings; // 유효함
Object[0] = 12; // 런타임 오류 !
```

이 코드는 컴파일에 성공한다. 하지만 실행해보면, 3번째 줄에서 `java.lang.ArrayStoreException` 런타임 오류가 발생한다. 런타임에 타입안정성을 보장하지 못한다. 이것이 제너릭이 탄생한 이유다. 

제너릭이 공변을 허용하지 않는 이유는 제너릭의 **타입 지우개(type erasure)** 때문이다. 제너릭이 바이트코드로 번역되는 순간 타입정보는 없어진다. 타입이 없어진다는 것은 리스트에 담긴 것이 개인지 고양이인지 모른다는 것이다. 따라서, 컴파일 시점에 공변을 막아두는 것이다.



이제 제너릭이 불변이라는 것은 이해했다. 그렇다면 이대로 순응하며 자바를 사용해야할까? 사실 제너릭을 사용하지 않아도 코드를 사용하는데는 큰 불편함이 없지만, 똑같은 코드가 재사용되는 부분을 한층 더 넓힐 수 있다. "생산자는 확장한다(Producer extends)"는 의미를 살펴보자. 

다음과 같이 두 리스트를 만들어보자. 

```java
List<Animal> animals = new ArrayList<Animals>();
List<Dog> dogs = new ArrayList<Dog>();
```

List는 Collection 인터페이스를 상속하므로 addAll 메서드의 정의를 그대로 상속한다. addAll 메서드는 다음과 같은 명세를 따른다.

```java
boolean addAll(Collection<? extends E> C);
```

여기서 *?*는 **와일드카드**를 의미한다. 여기에 extends를 사용하면 E라는 파라미터 타입을 상속하는 타입을 모두 받는다는 의미다. `List<Animal>` 의 경우, Animal이 E 타입으로 대체될 것이다. 

```java
animals.addAll(dogs);
```

Dog는 Animal 타입을 상속(extends)하므로 addAll()의 파라미터가 될 수 있다. 와일드 카드는 일종의 언어적 트릭이다. 와일드 카드를 사용하여 Collection\<Dog>이 Collection\<Animal>가 상속하는 것처럼 만들게 했다. 

조슈아 블로크의 이야기로 넘어가면 "생산자는 확장한다(Producer extends)"에서 생산자는 Dog가 된다. 즉 Dog는 자신의 항목을 바깥으로 꺼낸다는 것이다. 그래야 자기가 가진 항목을 Animal 컬렉션에 넣을 수 있기 때문이다.

이와 반대로 "소비자는 슈퍼한다(Consumers super)"라는 말은 반공변과 관련이 있다. 반공변은 List\<Dog>가 들어올 자리에 List\<Animal>를 사용할 수 있다는 것이다. 즉, List\<하위타입> 대신에 List\<상위타입>을 사용할 수 있다는 것이다.

```java
public static void add(List<? super Animal> list) {
  list.add(new Dog());
}
```

이 코드를 보면, 파라미터인 list에 하위 타입인 Dog를 집어넣었다. 무언가를 집어 넣는 행위는 리스트 입장에서 소비를 의미하므로 `List<? super Animal> list` 는 소비자(Consumer)가 된다. List\<Object>는 add 메서드의 파라미터로 올 수 있는가? 가능하다. 하위 클래스의 자리에 상위 클래스가 올 수 있으므로 이것을 반공변이라고 한다. 



PECS를 정리하자면, 어떠한 제너릭 타입의 컬렉션이 항목을 집어넣는 일(소비)을 한다면 super를 사용하라는 것이다. 반대로, 어떠한 제너릭 타입의 컬렉션이 항목을 내뱉는 일(생산)을 한다면 extends를 사용하라. 



추가적으로, 조슈아 블로크는 리턴타입에는 와일드카드를 사용하지 마라고 말한다. 와일드 카드는 파라미터에만 사용하는 것을 권고한다. 와일드 카드는 API에 숨겨져야 하는데, 사용자가 와일드카드를 인지하고 사용해야하는 상황이 생기기 때문이다.

---

폴리글랏 프로그래밍. 임백준. 한빛미디어. 2015.

(조슈아 블로크의 자바 강의)https://www.youtube.com/watch?v=V1vQf4qyMXg

https://stackoverflow.com/questions/4343202/difference-between-super-t-and-extends-t-in-java/34077112

https://stackoverflow.com/questions/2745265/is-listdog-a-subclass-of-listanimal-why-are-java-generics-not-implicitly-po/2745301#2745301



