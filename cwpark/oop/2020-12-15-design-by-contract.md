# 계약에 의한 설계(Design By Contract)

인터페이스만으로는 객체의 행동에 관한 다양한 관점을 전달하기는 어렵다. 부수효과를 쉽고 명확하게 표현할 수 있는 커뮤니케이션의 수단이 계약에 의한 설계이다.

계약에 의한 설계를 사용하면 객체간 협력에 필요한 다양한 제약과 부수효과를 명시적으로 정의하고 문서화할 수 있다. 클라이언트 개발자는 오퍼레이션의 구현을 살펴보지 않아도 객체의 사용법을 쉽게 알 수 있다. 또한, 주석보다 효율적이다. 주석과 다르게 시간의 흐름에 뒤처질 걱정을 하지 않아도 된다.

## 부수효과를 명시적으로

객체지향에서 객체들은 협력이라는 울타리 안에서 수행한다. 인터페이스는 객체가 수신할 수 있는 메시지를 정의할 수 있다. 하지만 객체 사이의 **의사소통 방식**을 정의할 수 없다.  

```C#
class Event
{
  public bool isSatisfied(RecurringSchedule schedule) { ... }
  public void Reschedule(RecurringSchedule schedule) {
    Contract.Requires(IsSatisfied(schedule));
  }
}
```

이 코드는 일정 관리 프로그램의 한 부분이다. 정해진 흐름상, Event 클래스의 클라이언트가 IsSatisfied 메서드를 호출하여 RecurringSchedule의 조건을 만족시키는지 여부를 확인하고, Reschedule 메서드를 호출해야 한다.

`Contract.Requires` 를 코드에 작성함으로써, 클라이언트 개발자는 `IsSatisfied` 메서드의 반환값이 true여야만 `Reschedule` 메서드를 호출할 수 있다는 사실을 알 수 있다.

## 계약

계약은 다음과 같은 특징을 갖는다.

- 각 계약 당사자는 계약으로부터 **이익(benefit)**을 기대하고 이익을 얻기 위해 **의무(obligation)**를 이행한다.
- 각 계약 당사자의 이익과 의무는 계약서에 **문서화**된다.

한쪽의 의무가 반대쪽의 권리가 된다. 두 계약 당사자 중 어느 한쪽이라도 명시된 의무를 위반하면 계약은 정상적으로 완료되지 않는다.



## 계약에 의한 설계

버트란드 마이어는 Eiffel 언어를 만들면서 사람들 사이에 계약을 이용해 계약에 의한 설계기법을 고안했다.

- 협력에 참여하는 각 객체는 계약으로부터 이익을 기대하고 이익을 얻기 위해 의무를 이행한다.
- 협력에 참여하는 각 객체의 이익과 의무는 객체의 인터페이스 상에 문서화된다.

계약에 의한 설계 개념은 "인터페이스에 대해 프로그래밍하라"라는 원칙을 확장한 것이다. 

다음 메서드는 자바 언어로 reverse 메서드의 구성요소를 표현했다. 

```java
public Reservation resver(Customer customer, int audienceCount)
```

- 가시성은 public이므로 외부에서 호출할 수 있다.
- 이 메서드를 사용하려면, Customer타입과 int 타입의 인자를 전달해야 한다.
- 메서드 실행이 성공하면 반환 타입으로 Reserveration 인스턴스를 반환한다.

이러한 오퍼레이션의 시그니처만으로도 어느 정도까지는 클라이언트와 서버 간의 협력을 위한 제약조건을 명시할 수 있다. 하지만, 계약에 의한 설계는 더 구체적이다. 클라이언트 개발자가 reserver 메서드를 호출할 때 customer 값으로 null을 전달한다면 어떨까? audienceCount의 값으로 음수를 전달한다면 어떨까? 이 메서드는 고객의 예약정보를 생성하는 것이므로, 한 명 이상의 예약자에 대해 예약 정보를 생성해야 한다. customer는 null이면 안되며, audienceCount의 값은 최소 1이상이어야 한다. 이 계약을 코드로 작성해야 한다.

```java
public class Screening {
  private Movie movie; // not null
  private int sequence; // >= 1
  private LocalDateTime whenScreend; // after current
}
```

위와 같이 Screening(상영정보) 객체는 오퍼레이션에서 명시할 수 있는 것보다 더 엄격한 제약이 필요하다.



클라이언트는 자신이 원하는 값을 서버가 반환할 것이라 기대한다. 서버는 자신이 정한 범위의 값들만 클라이언트가 전달할 것으로 예상한다. 클라이언트는 메시지 전송 전과 후의 서버 상태가 정상일 것이라 기대한다. 이 특징을 통해 계약에 의한 설계를 구성하는 세 가지 요소를 알 수 있다.

- 사전조건(precondition) : 메서드가 호출되기 전에 만족해야할 조건. 메서드의 요구사항을 명시한다. 사전조건을 만족해야할 것은 메서드를 실행하는 주체인 **클라이언트**다.
- 사후조건(postcondition) : 메서드가 실행하고 클라이언트에게 보장해야하는 조건. 사후조건을 만족하는 것은 **서버**의 의무다.
- 불변식(invariant) : 항상 참이라고 보장되는 서버의 조건.



## 사전조건

사전조건이란 메서드가 정상적으로 실행되기 위해 만족해야할 조건이다. 클라이언트가 사전조건을 만족하지 못했다면 클라이언트에 버그가 있음을 의미한다.

```c#
public Reservation Reserve(Customer customer, int audienceCount)
{
  Contract.Requires(customer != null);
  Contract.Requires(audienceCount >= 1);
	return new Reservation(customer, this, calculateFee(audienceCount), audienceCount);
}
```

C#의 `Contract.Requires ` 메서드는 클라이언트가 계약에 명시된 조건을 만족시키지 못할 경우 `ContractException`  예외를 을 발생시킨다. 예를 들어 다음과 같다.

```c#
var reservation = screening.Reserver(null 2);
```



## 사후조건

사후 조건은 메서드의 실행 결과가 올바른지, 실행 후에 객체가 유효한 상태인지를 검증한다. 사후조건은 다음 세 가지 용도로 사용된다.

- 인스턴스 변수의 상태가 올바른가?
- 메서드에 전달된 파라미터의 값이 올바르게 변경되었나?
- 반환값이 올바른가?

사후 조건을 정의하기 위한 메서드로는 `Contract.Ensures`  메서드가 있다. Reserve 메서드의 사후조건은 반환 값인 Reservation 인스턴스가 null이 되어서는 안 된다는 것이다.

```c#
public Reservation Reserve(Customer customer, int audienceCount) 
{
  Contract.Requires(customer != null);
  Contract.Requires(customer != null);
  Contract.Ensures(Contract.Result<Reservation>() != null);
  return new Reservation(customer, this, calculateFee(audienceCount), audienceCount);
}
```

Ensuers 메서드 안에서 사용된 Contract.Result\<T> 메서드가 바로 Reserver 메서드의 실행 결과에 접근할 수 있게 해주는 메서드다.

만약 return 문이 하나 이상인 종료지점에도 가능할까? 가능하다. 다음 메서드는 return 문이 if-else 로 나누어져 있다.

```c#
public decimal Buy(Ticket ticket)
{
  if (bag.invited)
  {
    bag.Ticket = ticket;
    return 0;
  }
  else
  {
    bag.Ticket = ticket;
    bag.MinusAmount(ticket.Fee);
    return ticket.Fee;
  }
}
```

Buy 메서드는 초대장(bag.invited)이 존재한다면 0원을 리턴하고, 초대장이 없다면 티켓의 요금을 반환한다. Contract.Result\<T> 메서드는 각각 return 문에 사후조건을 달아주는 수고를 덜어준다. 

```c#
public decimal Buy(Ticket ticket)
{
  Contract.Requires(ticket != null);
  Contract.Ensures(Contract.Result<decimal>() >= 0);
  if (bag.invited)
  {
    bag.Ticket = ticket;
    return 0;
  }
  else
  {
    bag.Ticket = ticket;
    bag.MinusAmount(ticket.Fee);
    return ticket.Fee;
  }
}
```



## 불변식

클라이언트가 어떤 메서드에 인스턴스를 파라미터를 넘기고 나서, 반환값을 성공적으로 받았지만 파라미터로 제공한 이 인스턴스의 상태값이 클라이언트 모르게 바뀐다면 코드에 악영향을 미칠 수 있을 것이다. 불변식은 이러한 경우에 필요하다. 불변식의 두 가지 특징을 정리하면 다음과 같다.

- 불변식은 클래스의 모든 인스턴스가 생성된 후 만족되는 조건이다.
- 불변식은 클라이언트가 호출할 수 있는 모든 메서드가 준수해야 한다.

불변식은 모든 메서드의 사전조건과 사후조건에 추가되는 공통조건이다. 불변식을 수작업으로 작성한다면 모든 메서드에 동일한 불변식을 추가해야 한다.

C#의 Code Contracts 라이브러리는 Contract.Invariant 메서드를 통해 불변식 검증을 제공한다. 

```c#
public class Screening
{
  private Movie movie;
  private int sequence;
  private DateTime whenScreend;
  
  [ContractInvariantMethod]
  private void Invariant() {
    Contract.Invariant(movie != null);
    Contract.Invariant(sequence >= 1);
    Contract.Invariant(whenScreend > DateTime.Now);
  }
}
```



## 자바에서 지원하는 DBC 라이브러리

자바에서 지원하는 DBC 라이브러리 중 구글에서 지원하는 [Cofoja](https://github.com/nhatminhle/cofoja)가 있다. 사용법을 간단히 살펴보면 다음과 같다.

`com.google.java.contract` 패키지에 3가지 어노테이션이 있다.

- `@Requires` 메서드 사전조건
- `@Ensures` 메서드 사후조건 
- `@Invariant` 클래스와 인터페이스 불변식

아래는 제곱근을 구하는 메서드 예제다.

```java
@Require("x >= 0")
@Ensures("result >= 0")
static double sqrt(double x);
```



Cofoja는 사용상 불편한 점이 있다. javac을 실행하며 -processor 옵션을 이용해 클래스패스에 `com.google.java.contract.core.apt.AnnotationProcessor` 을 다음 처럼 추가해줘야 한다.

```linux
javac -processor com.google.java.contract.core.apt.AnnotationProcessor YourClass.java
```

또한, 각 조건에 들어가는 식들이 문자열 리터럴로 되어 있어서 실수하기 쉽다.  바이트코드를 생성하고나서 커맨드라인 옵션에 다음을 추가해줘야한다. 

```bash
$ java -javaagent:path/to/agent.jar YourMainClass
```



이렇게 Java에서는 라이브러리를 사용할 수 있지만 C#에 비해 굉장히 불편하다. 이를 보완할 수 있는 방법으로, TDD를 통해 DBC 작성하는 것이 효율적일 수도 있다. 단, 테스트 코드에 명시된 계약은 클라이언트에 의해 알아차리기 어렵는 단점이 있다.

---

오브젝트. 조영호. 위키북스. 2019.
