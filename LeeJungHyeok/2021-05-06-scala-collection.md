## 가변 컬렉션

우리에게 익숙한 불변의 컬렉션 List, Set, Map은 생성된 후 변경 할 수 없다.

```jsx
var m = Map("AAPL" -> 597, "MSFT" -> 40)
m = m - "AAPL"
```

이렇게 보면 가변 처럼 보이지만 두번째 Line에서 m은 기존의 [("AAPL", 597), ("MSFT", 40)] 객체에서

[("MSFT", 40)]으로 바뀌는 것이 아니라 새로운 객체를 만들고 m이 새로운 객체를 참조하는 것이다.

![불변](images/immutable%20code.png)

![불변 결과](images/immutable%20result.png)

그러나 가변적인 데이터가 필요한, 가변적인 데이터를 사용하는 것이 확실히 더 안전한 때가 있다고 한다.

예를 들어 if문을 통해 조건문 블록을 작성하거나 별도의 데이터 구조를 반복하면서 각 변환 에 따라 저장할 필요 없이 리스트에 항목을 추가 하고싶을 수 있다.


|불변의 타입| 가변적인 대응 타입|
|------|---|
|collection.immutable.List|collection.mutable.Buffer|
|collection.immutable.Set|collection.mutable.Set|
|collection.immutable.map|collection.mutable.Map|



collection.immutable 패키지는 스칼라에서 현재 네임스페이스에 자동으로 추가가되지만

collection.mutable의 경우 가변의 컬렉션을 생성할 때 그 타입의 전체 패키지 이름을 포함해야한다.

```jsx
val nums = collection.mutable.Buffer(1)
```

그리고 위에서 설명한 불변컬렉션 사진을 가변컬렉션으로 변경 해서 보면

![가변](images/mutable%20code.png)

![가변 결과](images/mutable%20result.png)

다음과 같이 같은 객체임을 확인 할 수 있다.

만약 가변적인 컬렉션에서 불변 리스트로 변경하고 싶다면 다음과 같이 전환 할 수 있다.

```jsx
val nums = collection.mutable.Buffer(1).toList
```

불변 또한 가변으로 변경이 가능하다.

```jsx
val nums = Map("AAPL" -> 597, "MSFT" -> 40)
nums.toBuffer
```

그리고 예제를 통해 객체를 확인해보면

![buffer](images/mutable%20map%20code.png)

![buffer result](images/mutable%20map%20result.png)

다음과 같이 나오는 것을 볼수 있다.

### 예제

Buffer는 다양한 컬렉션으로 변경이 가능하다 아래 예제를 보면

![buffer](images/buffer%20code.png)

![buffer result](images/buffer%20result.png)

각 컬렉션으로 변경했을때 그 컬렉션에 맞게 변경된 것을 볼 수 있다.

## 컬렉션 빌더

Buffer 타입은 범용적으로 사용되는 좋은 가변적인 컬렉션으로 List와 유사하지만 그 내용을 추가, 삭제, 교체 할 수 있다.

Buffer의 유일한 단점은 너무 광범위 하게 적용될 수 있다는 것이다.

예를 들어 반복문 내에서 컬렉션을 반복적으로 추가하고 싶다면 Buffer 대신 Builder를 사용하는 것이 더 나을 것이다.

Builder는 Buffer를 단순화한 형태로, 할당된 컬렉션 타입을 생성하고, 추가(appen) 연산만을 지원하도록 제한되어 있다.

![builder](images/builder%20code.png)

![builder result](images/builder%20result.png)

Builder를 사용하는 이유는 Buffer의 getClass와 Builder의 getClass를 보면

Buffer와 달리 Builder는 자신의 타입에 대응 하는 불변의 타입이 무엇인지 알고 있다 ( SetBuilder)

불변의 컬렉션으로 전환하기 위해 단지 가변적인 컬렉션을 반복적으로 생성한다면 Builder 타입을 사용하는 것이 낫다.

그러나 가변적인 컬렉션을 만드는 동안 Iterator연산이 필요하거나 불변의 컬렉션으로 전환할 계획이 없다면, Buffer나 다른 가변적인 컬렉션 타입중 하나를 사용하는 것이 더 적합하다.