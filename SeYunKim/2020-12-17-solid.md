# 객체지향 설계를 위한 SOLID 원칙

## 참고자료

- [객체지향 개발 5대 원리: SOLID](http://www.nextree.co.kr/p6960/)
- [객체지향 설계의 5가지 원칙 S.O.L.I.D](https://sabarada.tistory.com/36)

## SRP(Single Responsibility Principle - 단일 책임 원칙)

- 객체는 오직 하나의 책임을 가져야 한다.
- 객체는 오직 하나의 변경의 이유만을 가져야 한다.

### 여러 원인에 의한 변경(Divergent Change)

- 여분의 클래스를 통해 혼재되어 있는 각 책임을 각각의 개별 클래스로 분할하여 클래스 당 하나의 책임만을 맡도록 하는 것이 중요하다.
- 중요한 점은 책임만 분리하는 것이 아니라, 두 클래스간의 관계의 복잡도를 줄이도록 설계하는 것도 중요하다.
- 만약 클래스들이 유사하고 비슷한 책임을 중복해서 갖고 있다면 부모 클래스를 만들어 상속받을 수 있도록 하는것이 중요하다.
- 따라서 각각의 클래스들의 유사한 책임들은 부모에게 명백히 위임하고 다른 책임들은 각자에게 정의해야 한다.

### 산탄총 수술(Shotgun Surgery)

- 산탄총은 하나의 총알에 여러 개의 탄이 들어있어 맞게 되면 여러 개의 탄들을 일일이 찾아서 치료해야 한다.
- 즉, 하나의 책임이 여러 개의 클래스로 분리되어 있다면 그 책임을 다하기 위해 여러 개의 클래스들을 찾아야 한다.
- 따라서 단일 책임 원칙에 입각해 설계하는 것을 산탄총 수술이라고 한다.

### 예시

- 로또 생성기 프로그램을 만들려고 했을때, Money라는 클래스를 만들게 됩니다.
- 이름과 같이 돈과 관련된 모든 책임을 넘긴다고 생각하면 좋을꺼 같습니다.
- 조금 극단적으로 생각하여, 로또 게임에서 사용자가 내는 돈과 당첨금액 또한 수익율까지 모두 Money에서 관리한다고 생각해보자.

    ```java
    public class UserMoney {
      private int userMoney;
      private int winningMoney;
      private int earningRate;

      public UserMoney(int userMoney, int winningMoney) {
          validateUserMoney(userMoney);
          validateWinningMoney(winningMoney);
          this.userMoney = userMoney;
          this.winningMoney = winningMoney;
      }

      // 로또 티켓이 몇장인지 나타내는 메소드
      public int giveLottoTicketNumber(){
          return this.userMoney / 1000;
      }

      // 1000원단위로 쪼갠 후, 남은 돈을 나타내는 메소드
      public int giveChangeMoney(){
          return this.userMoney & 1000;
      }

      // 수익율을 계산하는 메소드
      public int calculateEarningRate(){
          this.earningRate = winningMoney / userMoney * 100;
          validateEarningRate();
          return earningRate;
      }

      public void validateUserMoney(int userMoney){

      }

      public void validateWinningMoney(int winningMoney){

      }

      public void validateEarningRate(){

      }
    }

    ```

- 예시로 간단하게 짰지만, 각 필드의 Validation과 계산까지 너무 많은 일을 하고 있다고 생각한다.
- 혹시, 돈을 가지고 하는 계산이 추가되거나, 돈과 관련된 새로운 필드가 추가된다면 코드는 끊임없이 길어질 것이다.
- 그렇다면 이 코드를 SRP에 맞춰 책임을 분리 해주자.

```java
public class UserMoney {
  private int userMoney;

  public UserMoney(int userMoney, int winningMoney) {
      validateUserMoney(userMoney);
      this.userMoney = userMoney;
  }

  // 로또 티켓이 몇장인지 나타내는 메소드
  public int giveLottoTicketNumber(){
      return this.userMoney / 1000;
  }

  // 1000원단위로 쪼갠 후, 남은 돈을 나타내는 메소드
  public int giveChangeMoney(){
      return this.userMoney & 1000;
  }

  public void validateUserMoney(int userMoney){}

  public int getUserMoney() {
      return userMoney;
  }
}

```

```java
public class WinningMoney {
    private int winningMoney;

    public WinningMoney(int winningMoney) {
        validateWinningMoney(winningMoney);
        this.winningMoney = winningMoney;
    }

    public void validateWinningMoney(int winningMoney){}

    public int getWinningMoney() {
        return winningMoney;
    }
}

```

```java
public class EarningRate {
    private int earningRate;

    private EarningRate() {
    }

    public int calculateEarningRate(WinningMoney winningMoney, UserMoney userMoney) {
        this.earningRate = winningMoney.getWinningMoney() / userMoney.getUserMoney() * 100;
        validateEarningRate();
        return earningRate;
    }

    public void validateEarningRate() {

    }
}

```

- 위와 같이 쪼갠다면 각자 책임을 최대한 분리했다고 생각합니다.
- 혹시, 이 세개를 한번에 관리하고 싶다면 DTO를 사용해보는 것도 좋을듯 합니다.

```java
public class MoneyDto {
	  private UserMoney userMoney;
    private WinningMoney winningMoney;

    public MoneyDto(UserMoney userMoney, WinningMoney winningMone) {
        this.userMoney = userMoney;
        this.winningMoney = winningMoney;
    }

    public UserMoney getUserMoney() {
        return userMoney;
    }

    public WinningMoney getWinningMoney() {
        return winningMoney;
    }
}

```

- 또한 올바른 클래스 이름은 해당 클래스의 해당 클래스의 책임을 나타낼 수 있는 가장 좋은 방법입니다.
- 각 클래스는 하나의 개념을 나타내야 합니다.
- 마지막으로 객체지향 생활체조 규칙 7 `2개 이상의 인스턴스 변수를 가진 클래스를 쓰지 않는다`가 있는데, 이것은 SRP를 잘 활용하라는 이야기 같습니다!
- 2개 이상의 인스턴스 변수를 가진 클래스를 안쓰다 보면 충분히 SRP를 잘 할 수 있을꺼 같습니다!

### 추가예제

- AOP도 SRP를 해결하기 위해 나온 개념입니다.
- 추가 정보는 [AOP]([https://github.com/ksy90101/TIL/blob/master/spring/AOP.md](https://github.com/ksy90101/TIL/blob/master/spring/AOP.md)) 여기서 참고해주시면 좋겠습니다.

```java
import java.util.List;

import org.springframework.stereotype.Service;

import jojoldu.aop.ex.common.Board;
import jojoldu.aop.ex.common.BoardRepository;

@Service
public class BoardService {

	private final BoardRepository boardRepository;

	public BoardService(final BoardRepository boardRepository) {
		this.boardRepository = boardRepository;
	}

	public void save(Board board) {
		boardRepository.save(board);
	}

	public List<Board> findAll() {
		long startTime = System.currentTimeMillis();
		List<Board> boards = boardRepository.findAll();
		long endTime = System.currentTimeMillis();
		System.out.printf("시작 시간 : %d, 끝나는 시간 %d, 총 걸리는 시간 : %d \n",
			startTime, endTime, endTime - startTime);
		return boards;
	}
}
```

- 이와 같은 코드가 있다고 했을때, findAll() 메서드는 전체를 조회하는 기능 + 성능 측정 이라는 두 가지 책임을 가지고 있다고 생각할 수 있습니다.
- 따라서 AOP를 이용해 두가지의 일을 분리해서 처리하면 SRP를 지킬수 있다고 생각합니다.

```java
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Target;

@Documented
@Target(ElementType.METHOD)
public @interface PerfLogger {
}
```

```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;

@Aspect
public class Performance {
	@Around("@annotation(jojoldu.aop.ex.aop.PerfLogger)")
	public Object calculatePerformanceTime(ProceedingJoinPoint proceedingJoinPoint) {
		Object result = null;
		try {
			long startTime = System.currentTimeMillis();
			result = proceedingJoinPoint.proceed();
			long endTime = System.currentTimeMillis();

			System.out.printf("시작 시간 : %d, 끝나는 시간 %d, 총 걸리는 시간 : %d \n",
				startTime, endTime, endTime - startTime);
		} catch (Throwable throwable) {
			System.out.println(throwable.getMessage());
		}
		return result;
	}
}
```

```java
import java.util.List;

import org.springframework.stereotype.Service;

import jojoldu.aop.ex.common.Board;
import jojoldu.aop.ex.common.BoardRepository;

@Service
public class AopBoardService {

	private final BoardRepository boardRepository;

	public AopBoardService(final BoardRepository boardRepository) {
		this.boardRepository = boardRepository;
	}

	public void save(Board board) {
		boardRepository.save(board);
	}

	@PerfLogger
	public List<Board> findAll() {
		List<Board> boards = boardRepository.findAll();
		return boards;
	}
}
```

## OCP(Open-Closed Principle - 개방-폐쇄 원칙)

- 객체는 확장에 대해서는 개방적이고 수정에 대해서는 폐쇄적이어야 한다.
- 객체 기능의 확장을 허용하고 스스로의 변경은 피해야 한다.
- 즉, 변경을 위한 비용은 가능한 줄이고 확장을 위한 비용은 가능한 극대화 해야 한다는 의미로 요구사항의 변경이나 추가사항이 발생하더라도, 기존 구성요소는 수정이 일어나지 말아야 하며, 기존 구성요소를 쉽게 확장해서 재사용할 수 있어야 합니다.
- 로버트 C. 마틴은 OCP는 관리가능하고 쉽게 확장해서 재사용 가능한 코드를 만드는 기반이며, 중요 메커니즘은 추상화와 다형성이라고 설명하고 있습니다.

### 적용방법

1. 변경될 것과 변하지 않을 것을 엄격히 구분합니다.
2. 이 두 모듈이 만나는 지점에 인터페이스를 정의합니다.
3. 구현에 의존하기보다 정의한 인터페이스에 의존하도록 코드를 작성합니다.

### 예시

- 우아한테크코스 2기 오프라인 테스트였던 치킨집 미션에서 OCP 예제를 찾을 수 있습니다.
- 조건 중 하나가 현금 결제시, 5% 할인이 있었으며, 카드로 계산할시 원금액을 그대로 받은 조건이 있었습니다.
- 여기서 OCP를 적용시킬 수 있습니다.

    ```java
    public class PaymentCalculator {
      private int paymentMoney;

      public PaymentCalculator(int paymentMoney) {
          this.paymentMoney = paymentMoney;
      }

      public int cardPay(){
          return this.paymentMoney;
      }

      public int cashPay(){
          return (int)(this.paymentMoney * 0.95);
      }
    }

    ```

- 이런식으로 한가지 클래스에 카드계산과 현금계산을 같이 구현했했습니다. 이렇게 된다면, OCP를 위반한 것이 됩니다.
- 아울러 우스겟소리로 현금 절반, 카드 절반으로 계산한다고 하면, 계산을 하기가 힘들게 될것입니다.
- OCP를 적용해서 코드를 리팩토링 해보겠습니다.

```java
public interface PaymentCalculator {
    public int pay();
}

```

```java
public class Payment {
    private int payment;

    public Payment(int payment) {
        this.payment = payment;
    }

    public int getPayment() {
        return payment;
    }
}

```

```java
public class CashPayment extends Payment implements PaymentCalculator{
    public CashPayment(int payment) {
        super(payment);
    }

    @Override
    public int pay() {
        return (int)(super.getPayment() * 0.95);
    }
}

```

```java
public class CardPayment extends Payment implements PaymentCalculator{
    public CardPayment(int payment) {
        super(payment);
    }

    @Override
    public int pay() {
        return super.getPayment();
    }
}

```

```java
public class Recipe {
    private int totalPayment;

    public void CalculateTotalPayment(PaymentCalculator paymentCalculator){
        totalPayment += paymentCalculator.pay();
    }

    public int getTotalPayment() {
        return totalPayment;
    }
}

```

- 차후, 현금결제와 카드결제가 다른 쿠폰이 있다면 인터페이스를 통해 쉽게 구현이 가능하며, 또다른 조건이었던 `음료수 값은 할인에 들어가지 않는다.` 라는 조건은 `Payment` Class에서 쉽게 확장이 가능할 것입니다!

### 주의해야 할 점

- 확장되는 것과 변경되지 않는 모듈을 분리하는 과정에서 크기 조절을 실패하면 오히려 관계가 더 복잡해질 수 있습니다.
- 인터페이스는 가능하면 변경되서는 안됩니다. 따라서 인터페이스를 정의할 때 여러 경우의 수에 대한 고려와 예측이 필요합니다!
- 그러나, 과도한 예측은 불필요한 작업을 만들게 됩니다.
- 인터페이스 설계에서 적당한 추상화 레벨을 선택해야 합니다.
- 그래디 부치에 의하면 `추상화란 다른 모든 종류의 객체로부터 식별될 수 있는 객체의 본질적인 특징`이라고 정의합니다. 즉, 이 '행위'에 대한 본질적인 정의를 통해 인터페이스를 식별해야 합니다.

## LSP(Liskov Substitution Principle - 리스코프 치환 원칙)

- 자식 클래스는 언제나 자신의 부모 클래스를 대체할 수 있다는 원칙이다.
- 부모 클래스가 들어갈 자리에 자식 클래스를 넣어도 계획대로 잘 작동해야 하는 것이다.
- A is B라는 상속 관계가 있을때, B는 sub class이고 A는 base class입니다. 이때 B의 행위는 A의 행위의 예상할 수 있는 범위내에서 이루어져야 한다는 것이다.
- 이것이 상속의 본질인데, 이를 지키지 않으면 부모 클래스 본래의 의미가 변해 `is-a` 관계가 망가져 다형성을 지킬 수 없게 된다.
- OCP를 위반하지 않도록 인도하는 원칙이다.

### 예제

- 로또 게임을 예를 들어, 로또볼의 자동생성한 `LottoTicekt`은 정렬을 위해 `List<LottoBall>`이 되어야 하고, 당첨 로또볼들은 중복을 제거 하기 위해 `Set<LottoBall>`이 돼야 한다고 생각해보자.
- 둘이 같은 기능이지만, `return type`만 다른 것이다.

```java
import java.util.List;
import java.util.stream.Collectors;

public class LottoBallGenerator {
    public List<LottoBall> generateLottoBall(List<Integer> lottoBalls){
        return lottoBalls.stream().map(LottoBall::new).collect(Collectors.toList());
    }
}

```

```java
public class LottoBall {
    private int lottoBall;

    public LottoBall(int lottoBall) {
        this.lottoBall = lottoBall;
    }
}

```

```java
import java.util.List;

public class LottoTicket extends LottoBallGenerator{
    @Override
    public List<LottoBall> generateLottoBall(List<Integer> lottoBalls) {
        return super.generateLottoBall(lottoBalls);
    }
}

```

```java
import java.util.List;
import java.util.Set;

public class WinningBalls extends LottoBallGenerator{

    @Override
    public Set<LottoBall> generateLottoBall(List<Integer> lottoBalls) {
        return super.generateLottoBall(lottoBalls);
    }
}

```

- 위와 같이 구현한다면, WinningBalls Class에서 에러가 발생할 것이다
- 부모 클래스에서는 `List`를 return하는데 자식 클래스에서는 'Set'을 요구하기 때문이다.
- 이렇게 되면 LSP를 위반하게 된 것이다. `is a` 관계를 다시 정의해보자.

```java
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class LottoBallGenerator {
    public Collection<LottoBall> generateLottoBall(List<Integer> lottoBalls){
        return lottoBalls.stream().map(LottoBall::new).collect(Collectors.toList());
    }
}

```

- 위와 같이 부모 클래스에서 `return type`을 Colleaction으로 해준다면, `is a` 관계가 정의될 것이다.

## ISP(Interface Segregation Principle - 인터페이스 분리 원칙)

- 한 클래스는 자신이 사용하지 않는 인터페이스는 구현하지 말아야 한다는 원리입니다.
- 즉, 어떤 클래스가 다른 클래스에 종속될 때에는 가능한 최소한의 인터페이스만을 사용해야 합니다.
- 그래서 인터페이스를 다시 작게 나누어 만든다.
- OCP와 비슷한 느낌도 있지만, 엄연히 다른 원칙이다.
- 하지만, ISP를 지킨다면 OCP도 잘 지키게 될 확률이 비약적으로 증가한다.
- 정확히 말하면 인터페이스의 SRP이다.

## DIP(Dependency Inversion Principle - 의존성 역전 원칙)

- 추상성이 높고 안정적인 고수준의 클래스는 구체적이고 불안정한 저수준의 클래스에 의존해서는 안된다는 원칙이다.
- 일반적으로 객체지향의 인터페이스를 통해서 이 원칙을 준수할 수 있게 된다.
- 클라이언트는 저수준의 클래스에서 추상화한 인터페이스만을 바라보기 때문에, 이 인터페이스를 구현한 클래스는 클라이언트에 어떤 변경도 없이 얼마든지 나중에 교체될 수 있다.
- 어떤 class를 참조해야 하는 상황이 생긴다면 그 class를 직접 참조하는 것이 아니라 그 대상의 추상 클래스를 만들어서 사용하라는 원칙입니다.
- 즉, 객체 지향에서는 상위모듈을 하위 모듈에 독립화를 시키는 행동을 하라는 의미입니다.
- 디자인패턴 중에서 전략 패턴이 대표적인 예이다.

### 예제

- 우아한테크코스 Level1 2주차 미션이였던 자동차 경주 게임에서 `Random Value`로 차를 움직이는 기능이 있다고 합시다.
- `Random Value`를 생성하는 곳을 Car에게 책임을 줘보도록 하겠습니다.

```java
public class Car {
    private static final int FORWARD_NUMBER = 4;
    private Name name;
    private int position;

    public Car(Name name) {
        this.name = name;
        this.position = 0;
    }
    public int createRandomValue(){
        return (int) (Math.random() * 10);
    }
    public int movePosition() {
        if (createRandomValue() > FORWARD_NUMBER) {
            this.position++;
        }
        return position;
    }
}

```

- 이렇게 되어 있다면, 일단 첫번째로 테스트 코드를 작성하기가 굉장히 어려울 것입니다.
- 랜덤값은 예측을 할 수 없기떄문에, 테스트를 거의 못한다고 봐야 되겠네요.
- 테스트를 위해서 특정값을 넣을 수 있도록 리팩토링 해보겠습니다.

```java
public interface CarMoveValueGenerator {
    int generateCarMoveValue();
}

```

- 일단 차를 움직일 수 있는 값을 만드는 `interface`를 만듭니다.

```java
public class Car {
    private static final int FORWARD_NUMBER = 4;
    private Name name;
    private int position;
    private CarMoveValueGenerator carMoveValueGenerator = () -> (int) (Math.random() * RANDOM_LIMIT_VALUE);

    public Car(Name name) {
        this.name = name;
        this.position = 0;
    }

    public int movePosition() {
        if (carMoveValueGenerator.generateCarMoveValue() > FORWARD_NUMBER) {
            this.position++;
        }
        return position;
    }
}

```

- 이런식으로 리팩토링을 한다면, 테스트에서도 충분히 테스트 코드를 작성할 수 있을 것입니다.

```java
import org.junit.jupiter.api.Test;
import racingcar.domain.Generator.CarMoveValueGenerator;

import static org.assertj.core.api.Assertions.assertThat;

public class CarTest {

    @Test
    void 전진하기() {
        Name name = new Name("pobi");
        CarMoveValueGenerator carMoveValueGenerator = () -> 10;
        Car car = new Car(name);
        assertThat(car.movePosition(carMoveValueGenerator)).isEqualTo(1);
    }

    @Test
    void 정지하기() {
        Name name = new Name("pobi");
        CarMoveValueGenerator carMoveValueGenerator = () -> 3;
        Car car = new Car(name);
        assertThat(car.movePosition(carMoveValueGenerator)).isEqualTo(0);
    }
}

```

- 이렇게 한다면, 내가 값을 마음대로 조정할 수 있게 됩니다.
- 그러나 이것도 아직은 `DIP`를 위반하고 있습니다.
- DIP는 `불안정한 저수준의 클래스에 의존해선 안된다`라고 합니다.
- 지금 람다를 사용한 경우는 불안정한 저수준의 클래스에 의존하고 있다고 보면 좋습니다.
- 따라서 람다를 지우고, `RandomValue`라는 클래스를 만들어서 상속받아, `@Override`를 해준다면 더 좋을 것 같습니다.

```java
package racingcar.domain;

import racingcar.domain.Generator.CarMoveValueGenerator;

public class RandomValue implements CarMoveValueGenerator {
    @Override
    public int generateCarMoveValue() {
        return (int)(Math.random() * 10);
    }
}

```

## 정리

- SOLID 원칙을 지키면서 객체지향적인 사고방식이 중요하다는 건 분명하지만, 이것 보다 더 우선해야 하는 것은 고객의 요구사항대로 동작해야 한다는 것입니다.
- 디자인이 아무리 잘 되어 있고, 멋진 기능이 있다고 해도 요구사항과 다르다면 잘못된 프로그램이라고 생각하시면 좋을것 같습니다.
- 따라서 객체지향 원칙인 SOLID는 반드시 `고객의 만족`을 충족한다는 전재하에 적용되어야 합니다.
1. 소프트웨어가 고객이 원하는 기능을 하도록 하세요.
2. 객체지향 기본원리를 적용해서 소프트웨어를 유연하게 하세요.
3. 유지보수와 재사용이 쉬운 디자인을 위해 노력하세요.
