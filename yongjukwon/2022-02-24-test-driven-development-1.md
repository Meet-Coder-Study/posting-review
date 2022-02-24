# [Test Driven Development] Part 1, chapter 1

> ### Preface
<br/>

- Test-Driven Development (TDD) 의 목표는 Clean Code 이다

- Clean Code 가 의미 있는 목표인 이유

  1. 버그의 늪을 걱정하지 않고 개발의 완성을 예상 할 수 있다

  2. 작성하려는 코드의 모든 부분을 볼 수 있는 기회를 준다 (나무보다는 숲)

- Rules for Development with TDD

- 작성한 automated test 가 실패했을 경우에만 새 코드를 작성 (코드 작성 전 실패하는 automated test 작성)

- 중복코드 제거

- TDD는 프로그래밍 중 결정과 피드백 사이의 자각하는 과정이자 그 사이의 갭을 메꿔주는 기술이다

<br/>

> ### Introduction
\
어느 금요일, 매니저가 고객 Peter를 소개시켜준다. 피터는 우리가 개발한 자산관리 어플리케이션 WyCash를 쓰고 있다.  

피터는 모든 기능에 만족하지만 USD만 지원하는 기능에 더해서 다른 통화들도 지원가능한 지 묻는다.

\
이 책에서는 이 문제를 Test-Driven Development(TDD)를 통해 다룰 것이다.  

다음 두 가지 간단한 rule만 따르면 된다.

`1. 코드 작성 전에 실패하는 오토메이션 테스트를 작성해라`  
`2. Duplication을 제거해라`


<br/>

> ### Part 1: The Money Example   
\
현재 지원하는 리포트는 다양한 통화를 지원하지 않기 때문에 오른쪽 리포트와 같이 업데이트 되어야 한다

|현재 지원하는 리포트|다양한 통화가 표기된 리포트| 환전율
|:--:|:--:|:--:|
|<table><tr><th>투자 대상</th><th>Shares</th><th>Price</th><th>Total</th></tr><tr><td>AAPL</td><td>1000</td><td>25</td><td>25000</td></tr><tr><td>MSFT</td><td>400</td><td>100</td><td>40000</td></tr></table>|<table> <tr><th>투자 대상</th><th>Shares</th><th>Price</th><th>Total</th></tr><tr><td>AAPL</td><td>1000</td><td>25 USD</td><td>25000 USD</td></tr><tr><td>MSFT</td><td>400</td><td>100 KRW</td><td>40000 KRW</td></tr><tr><td></td><td></td><td>Total</td><td>60000 USD</td></tr></table>|<table> <tr><th>From</th><th>To</th><th>Rate</th></tr><tr><td>KRW</td><td>USD</td><td>1.5</td></tr></table>|  

새로운 리포트를 지원하기 위해 어떤 기능들이 필요할까?

바꾸어 말해서 어떤 테스트를 작성하고, 통과했을 때 작성한 코드틀 통해 자신감 있게 새로운 리포트를 정확하게 지원한다고 할 수 있을까?  

- 두 개의 다른 통화로 이루어진 돈을 환율로 비교해 더할 수 있어야 한다

- 주어진 Shares 와 Price 를 곱해서 Total을 계산해야 한다

이 두가지 테스트를 간단하게 바꾸어 to-do list로 변환해 보면 다음과 같다

>`@ To-do list `   
>$5 + 10 KRW = $10 (환율이 2:1일 떄)  
>$5 * 2 = $10

두 번째 곱셈부터 테스트를 작성해보자. 테스트를 작성할 때는 테스트를 위한 완벽한 interface가 있다고 가정하자.

```Java
  public void testMultiplication() {
    Dollar five = new Dollar(5);
    five.times(2);
    assertEquals(10, five.amount);
  }
```

코드 작성 후의 to-do list

>`@ To-do list `   
> $5 + 10 KRW = $10 (환율이 2:1일 떄)  
> $5 * 2 = $10  
> Make "amount" private  
> Dollar side-effects?  
> Money rounding?


이 코드는 현재 컴파일도 안 되지만 쉽게 고칠 수 있는 상태이다. 코드가 컴파일 되게 하기 위해서 어떤 것들을 고쳐야 할까?  
총 4가지 컴파일 에러가 존재한다.
  - No class Dollar
  - No constructor
  - No Method times(int)
  - No field amount

이 에러들을 고치기 위해서 필요한 코드는 다음과 같다
  - No class Dollar
  ```Java
    class Dollar
  ```
  - No constructor 
  ```Java
    Dollar(int amount) {}
  ```
  - No Method times(int)
  ```Java
    void times(int multiplier) {}
  ```
  - No field amount
  ```Java
    int amount;
  ```

위와 같이 고친 후 테스트를 실행하면 컴파일은 되지만 테스트는 실패한다. 10을 예상했지만 실제 값은 0이 나오기 때문이다.  

테스트 실패는 과정이다. 어떤 것이 문제인지 아는 것은, 문제가 무엇인지 모르는 채 실패하는 것보다 낫다.  

이제 우리의 문제는 `다양한 통화 지원` 에서 `현재 테스트 pass, 그리고 그 다음 테스트 pass`로 변했다.

우리는 이 테스트 실패를 다음 코드로 고칠 수 있다.

```Java
  int amount = 10;
```

다음 단계로 넘어가기 전에 우리는 이 코드를 리팩토링 해야 한다. 아래 cycle 을 잊지 말자.
```
  1. 작은 테스트 작성
  2. 모든 테스트 실행 > 실패
  3. 작은 코드 변경
  4. 모든 테스트 실행 > 성공
  5. Duplication 제거를 위해 리팩토링 
```

amount에 10이라는 값을 주면서 우리는 1번부터 4번까지 완성했다. 5번을 진행 해야 하는데 어디에서 duplication을 찾을 수 있을까?  

보통 duplication은 코드들 사이에서 보이지만 여기서는 테스트의 데이터와 코드의 데이터 사이에서 찾을 수 있다. 찾기 어렵다면 코드를 다음과 같이 바꾸면 어떨까?

```Java
  int amount = 5 * 2;
```
10은 우리도 모르는 사이에 우리의 머릿 속에서 계산된 값이다. 이제 5와 2는 두 군데(테스트, 코드)에 존재한다. 어떻게 하면 이 duplication 을 없앨 수 있을까?

>`@ To-do list `   
> $5 + 10 KRW = $10 (환율이 2:1일 떄)  
> `$5 * 2 = $10`  
> Make "amount" private  
> Dollar side-effects?  
> Money rounding?

만약 값을 `times()` 메소드 안으로 움직이면?

```Java
  int amount;

  void times(int multiplier) {
    amount = 5 * 2;
  }
```

테스트는 여전히 통과한다. 너무 작은 코드 변화라고 생각하는가?  

`TDD는 작디 작은 과정을 진행하는 게 아니라 그 작디 작은 과정을 진행할 수 있게 만드는 것이라는 것을 기억하자.   `

`매 번 이런 과정을 거칠 수는 없지만 매 번 큰 과정들만 진행하다 보면 그 속의 작은 과정들이 적합한지 알 수 없을 것이다.`

다음으로 5는 어디서 얻을 수 있는 값인가? Constructor로 전달된 값이므로 이렇게 바꿀 수 있다.

```Java
  Dollar(int amount) {
    this.amount = amount;
  }
```

이어서 이제는 times()에서 이 값을 쓸 수 있다.
```Java
  void times(int multiplier) {
    amount = amount * 2;
  }
```

다음으로 multiplier로 전달되는 값이 2이므로 이 역시 바꿀 수 있다
```Java
  void times(int multiplier) {
    amount = amount * multiplier;
  }
```

마지막으로 Java syntax를 안다면 다음과 같이 바꿀 수 있다
```Java
  void times(int multiplier) {
    amount *= multiplier;
  }
```

이렇게 to-do list 중 하나를 지울 수 있게 되었다.


>`@ To-do list `   
> $5 + 10 KRW = $10 (환율이 2:1일 떄)  
> <strike>`$5 * 2 = $10`**</strike>  
> Make "amount" private  
> Dollar side-effects?  
> Money rounding?

> ETC.  
> `Dependency and Duplication`  
> Unlike most problems in life, where eliminating the symptoms only makes the problem pop up elsewhere in worse form, `eliminating duplication in programs eliminates dependency.` That's why the second rule appears in TDD. By eliminating duplication before we go on to the next test, we maximize our chance of being able to get the next test running with one and only one change.