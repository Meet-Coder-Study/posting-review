# 클린 아키텍처 3부 (설계 원칙)

 좋은 소프트웨어 아키텍처를 위한 유명한 원칙 SOLID 에 대해서 알아보겠습니다.
 
 SOLID 원칙은 함수와 데이터 구조를 클래스로 배치하는 방법, 그리고 이들 클래스를 서로 결합하는 방법을 설명합니다. '클래스'라는 단어를 사용했다고 해서 SOLID 원칙이 객체 지향 소프트웨어에만 적용된다는 뜻은 아닙니다. 여기에서 클래스는 단순히 함수와 데이터를 결합한 집합을 가리킵니다. 소프트웨어 시스템은 모두 이러한 집합을 포함하며, 이러한 집합이 클래스라고 불릴 수도 있고 아닐 수도 있습니다.
 
---

#### SOLID 원칙

##### SRP : 단일 책임 원칙(Single Responsibility Principle)
 
 소프트웨어 모듈은 변경의 이유가 하나, 단 하나여야만 합니다. 이 원칙은 모든 모듈은 단 하나의 일만 해야한다는 의미로 받아들이기 쉽습니다.(저 또한 잘못 받아들이고 있었습니다..^^;) 단 하나의 일만 해야 한다는 원칙은 따로 있습니다. 그것은 바로 "함수는 반드시 하나의, 단 하나의 일만 해야 한다는 원칙"입니다. 이 원칙은 커다란 함수를 작은 함수들로 리팩토링하는 더 저수준에서 사용됩니다.
 
 역사적으로 SRP는 아래와 같이 기술되어 왔습니다.
> 단일 모듈은 변경의 이유가 하나, 오직 하나뿐이어야 한다.

 소프트웨어 시스템은 사용자와 이해관계자를 만족시키기 위해 변경됩니다. SRP가 말하는 '변경의 이유'란 바로 이들 사용자와 이해관계자를 가리킵니다. 이 원칙은 아래와 같이 바꿔말할 수도 있습니다.
> 하나의 모듈은 하나의, 오직 하나의 액터에 대해서만 책임져야한다.

#### SRP를 위반하는 징후

##### 징후 1. 우발적 중복

![Employee 클래스](./images/employee.png)
Employee 클래스

 이 클래스는 SRP를 위반하는데, 이들 세 가지 메서드가 서로 매우 다른 세 명의 액터를 책임지기 때문입니다.
 
* calculatePay() 메서드는 회계팀에서 기능을 정의하며, CFO 보고를 위해 사용합니다.
* reportHours() 메서드는 인사팀에서 기능을 정의하고 사용하며, COO 보고를 위해 사용합니다.
* save() 메서드는 데이터베이스 관리자가 기능을 정의하고, CTO 보고를 위해 사용합니다.

 개발자가 이 세 메서드를 Employee라는 단일 클래스에 배치하여 세 액터가 서로 결합되어 버렸습니다. 이 결합으로 인해 CFO 팀에서 결정한 조치가 COO 팀이 의존하는 무언가에 영향을 줄 수 있습니다.
 
 예를 들어 calculatePay() 메서드와 reportHours() 메서드가 초과 근무를 제외한 업무 시간을 계산하는 알고리즘을 공유한다고 해보겠습니다. 코드의 중복을 없애기 위해 두 메서드는 regularHours()라는 메서드를 공통적으로 사용합니다.

![공유된 알고리즘](./images/shared.png)

 만약 CFO 팀에서 초과 근무를 제외한 업무 시간을 계산하는 방식을 수정한다면 COO 팀에도 영향을 주게됩니다.
 
##### 징후 2. 병합

 소프 파일에 다양하고 많은 메서드를 포함하면 병합이 자주 발생하게 됩니다. 특히 이들 메서드가 서로 다른 액터를 책임진다면 병합이 발생할 가능성은 확실히 더 높아집니다.
 
 예를 들어 DBA가 속한 CTO 팀에서 데이터베이스의 Employee 테이블 스키마를 약간 수정하기로 결정했다고 하겠습니다. 이와 동시에 인사 담당자가 속한 COO 팀에서는 reportHours() 메서드의 보고서 포맷을 변경하기로 결정했다고 하겠습니다.
 
 두 명의 서로 다른 개발자가, 그리고 아마도 서로 다른 팀에 속했을 두 개발자가 Employee 클래스를 체크아웃받은 후 변경사항을 적용하기 시작할 것입니다. 그리고 이들 변경사항은 서로 충돌하게 될 것입니다. 결과적으로 병합이 발생하게 됩니다.
 
 이 문제를 벗어나는 방법은 서로 다른 액터를 뒷받침하는 코드를 서로 분리하는 것입니다.

##### 해결책

 이 문제의 해결책은 다양한데, 그 모두가 메서드를 각기 다른 클래스로 이동시키는 방식입니다.
 
 가장 확실한 해결책은 데이터와 메서드를 분리하는 방식입니다. 즉, 아무런 메서드가 없는 간단한 데이터 구조인 EmployeeData 클래스를 만들어, 세 개의 클래스가 공유하도록 하는 것입니다.

![클래스 분리](./images/segregation.png)

```java
public class EmployeeData {
    private Long idx;
    private String name;

    public EmployeeData(Long idx, String name) {
        this.idx = idx;
        this.name = name;
    }

    public int getRegularHours() {
        return 8;
    }
}
```

```java
public class PayCalculator {
    private EmployeeData employeeData;

    public PayCalculator(EmployeeData employeeData) {
        this.employeeData = employeeData;
    }

    public int calculatePay() {
        return employeeData.getRegularHours() * 10_000;
    }
}
```

```java
public class HourReporter {
    private EmployeeData employeeData;

    public HourReporter(EmployeeData employeeData) {
        this.employeeData = employeeData;
    }

    public int reportHours() {
        return employeeData.getRegularHours() + 1;
    }
}
```

```java
public class EmployeeSaver {
    private EmployeeData employeeData;

    public EmployeeSaver(EmployeeData employeeData) {
        this.employeeData = employeeData;
    }

    public void saveEmployee() {
        //Save logic..
    }
}
```

 하지만 이 해결책은 개발자가 세 가지 클래스를 인스턴스화하고 추적해야 한다는 게 단점입니다. 이러한 문제점을 위해 흔히 쓰는 기법으로 퍼사드(Facade) 패턴이 있습니다.

![퍼사드 패턴](./images/facade.png)

```java
public class EmployeeFacade {

    private EmployeeData employeeData;

    public EmployeeFacade(EmployeeData employeeData) {
        this.employeeData = employeeData;
    }

    public int calculatePay() {
        return new PayCalculator(employeeData).calculatePay();
    }

    public int reportHours() {
        return new HourReporter(employeeData).reportHours();
    }

    public void saveEmployee() {
        new EmployeeSaver(employeeData).saveEmployee();
    }
}
```

 EmployeeFacade 에 코드는 거의 없습니다. **이 클래스는 세 클래스의 객체를 생성하고, 요청된 메서드를 가지는 객체로 위임하는 일을 책임집니다.**
 
---
 
##### OCP : 개방-폐쇄 원칙(Open-Closed Principle)

 기존 코드를 수정하기보다는 반드시 새로운 코드를 추가하는 방식으로 시스템의 행위를 변경할 수 있도록 설계해야만 소프트웨어 시스템을 쉽게 변경할 수 있다는 것이 이 원칙의 요지입니다.

> 소프트웨어 개체(artifact)는 확장에는 열려 있어야 하고, 변경에는 닫혀 있어야 한다.

 ##### 사고 실험

 재무제표를 웹 페이지로 보여주는 시스템이 있다고 생각해보겠습니다. 그리고 이해관계자가 동일한 정보를 보고서 형태로 변환해서 프린터로 출력해 달라고 요청했다고 해보겠습니다.
 
 이 경우 당연히 새로운 코드를 작성해야 합니다. 소프트웨어 아키텍처가 훌륭하다면 변경되는 코드의 양은 최소화될 것입니다. 이상적인 변경량은 0입니다.
 
 코드의 변경량을 최소화하기 위해서는 서로 다른 목적으로 변경되는 요소를 적절하게 분리하고(단일 책임 원칙: SRP), 이들 요소 사이의 의존성을 체계화(의존성 역전 원칙: DIP)해야 합니다.
 
![OCP](./images/ocp.png)

 위 그림의 좌측 상단의 컴포넌트는 Controller 입니다. 우측 상단에서는 Interactor 컴포넌트를, 우측 하단에서는 Database 컴포넌트를 볼 수 있습니다. 좌측 하단에는 Presenter 와 View 를 담당하는 네 가지 컴포넌트가 위치합니다. <I>로 표시된 클래스는 인터페이스이며, <DS>로 표시된 클래스는 데이터 구조입니다.
 
##### 주목해야할 점
1. 모든 의존성이 소스 코드 의존성을 나타냅니다.
2. 주목해야할 점은 이중선은 화살표와 오직 한 방향으로만 교차합니다.

 위의 주목해야할 점과 아래의 그림을 보면, 모든 컴포넌트 관계는 단방향으로 이루어진다는 사실을 알 수 있습니다. 이들 화살표는 변경으로부터 보호하려는 컴포넌트를 향하도록 그려집니다.
 
![component_relation](./images/component_relation.png) 

 **A 컴포넌트에서 발생한 변경으로부터 B 컴포넌트를 보호하려면 반드시 A 컴포넌트가 B 컴포넌트에 의존해야 합니다.**
 
 이 예제의 경우 Presenter에서 발생한 변경으로부터 Controller를 보호하고자 하고 있습니다. 그리고 View에서 발생한 변경으로부터 Presenter를 보호하고자 하고 있습니다. Interactor는 다른 모든 것에서 발생한 변경으로부터 보호하고자 합니다.
 
 Interactor는 왜 모든 변경으로부터 보호하려고 하는걸까요? 그 이유는 바로 Interactor가 업무 규칙을 포함하기 때문입니다. Interactor는 애플리케이션에서 가장 높은 수준의 정책을 포함합니다. Interactor 입장에서는 Controller가 부수적이지만 Controller는 Presenter와 View에 비해서는 중심적인 문제를 담당합니다. 마찬가지로 Presenter가 Controller 보다는 부수적이라도 View 보다는 중심적인 문제를 처리합니다.
 
 이처럼 OCP는 시스템의 아키텍처를 떠받치는 원동력 중 하나입니다. OCP의 목표는 시스템을 확장하기 쉬운 동시에 변경으로 인해 시스템이 너무 많은 영향을 받지 않도록 하는 데 있습니다. 이러한 목표를 달성하려면 시스템을 컴포넌트 단위로 분리하고, 저수준 컴포넌트에서 발생한 변경으로부터 고수준 컴포넌트를 보호할 수 있는 형태의 의존성 계층구조가 만들어지도록 해야 합니다.
 
---

##### LSP : 리스코프 치환 원칙(Liskov Substitution Principle)

 상호 대체 가능한 구성요소를 이용해 소프트웨어 시스템을 만들 수 있으려면, 이들 구성요소는 반드시 서로 치환 가능해야 한다는 원칙입니다. 바바라 리스코프가 정의한 조건은 아래와 같습니다.

> 여기서 요구되는 것은 다음의 치환 속성과 같은 것이다. S형의 각 객체 o1에 대해 T형의 객체 o2가 하나 있고, T에 의해 정의된 모든 프로그램 P에서 T가 S로 치환될 때, P의 동작이 변하지 않으면 S는 T의 서브타입이다.

 조금 더 쉽게 설명되어 있는 오브젝트라는 책의 내용을 따오면 아래와 같은 내용으로 정리될 수 있습니다.
 
> "서브타입은 그것의 기반 타입에 대해 대체 가능해야 한다"는 것으로 클라이언트가 "차이점을 인식하지 못한 채 파생 클래스의 인터페이스를 통해 서브 클래스를 사용할 수 있어야 한다."는 것이다.

##### 상속을 사용하도록 가이드하기

![LSP](./images/lsp.png)

 Billing 어플리케이션에서 License라는 인터페이스에 의존하고 있고, License에는 PersonalLicense와 BusinessLicense라는 두 가지 '하위 타입'이 존재합니다. 이들 두 하위 타입은 서로 다른 알고리즘을 이용해서 라이센스 비용을 계산합니다.
 
 위의 그림은 LSP 원칙을 준수하는데, Billing 어플리케이션의 행위가 License 하위 타입 중 무엇을 사용하는지에 전혀 의존하지 않기 때문입니다. 이들 하위 타입은 모두 License 타입을 치환할 수 있습니다.

##### 정사각형/직사각형 문제

 LSP를 위반하는 전형적인 문제로는 유명한 정사각형/직사각형 문제가 있습니다.
 
![정사각형/직사각형](./images/square_rectangle.png)

 이 예제에서 Square는 Rectangle의 하위 타입으로는 적합하지 않은데, Rectangle의 높이와 너비는 서로 독립적으로 변경될 수 있는 반면, Square의 높이와 너비는 반드시 함께 변경되기 때문입니다. User는 협력하고 있는 상대가 Rectangle이라고 생각하므로 혼동이 생길 수 있습니다.
 
##### OCP와의 관계

> 자식 클래스가 클라이언트의 관점에서 부모 클래스를 대체할 수 있다면 기능 확장을 위해 자식 클래스를 추가하더라도 코드를 수정할 필요가 없어진다. 따라서 리스코프 치환 원칙은 개방-패쇄 원칙을 만족하는 설계를 위한 전제 조건이다. 일반적으로 리스코프 치환 원칙 위반은 잠재적인 개방-패쇄 원칙 위반이다.
>
> **오브젝트<<조영호님 저서>> 460페이지 중 일부..**
 
---

##### ISP : 인터페이스 분리 원칙(Interface Segregation Principle)

 소프트웨어 설계자는 사용하지 않는 것에 의존하지 않아야 한다는 원칙입니다.
 
![ISP 위반](./images/isp.png)

 위 그림에서 다수의 사용자가 OPS 클래스의 오퍼레이션을 이용하고 있습니다. 여기서 User1은 오직 op1을, User2는 op2만을, User3는 op3만을 사용한다고 가정해보겠습니다. 그리고 OPS 클래스가 정적 타입 언어로 작성된 클래스라고 해보겠습니다.
 
 이 경우 User1에서는 op2와 op3를 전혀 사용하지 않음에도 User1의 소스 코드는 두 메서드에 의존하게 됩니다. 이러한 의존성으로 인해 OPS 클래스에서 op2의 소스 코드가 변경되면 User1과 관련된 코드는 전혀 변경되지 않았음에도 User1도 다시 컴파일한 후 새로 배포해야 합니다. 
 
 이러한 문제는 아래의 그림처럼 오퍼레이션을 인터페이스 단위로 분리하여 해결할 수 있습니다.

![ISP](./images/isp_seperated.png)

 인터페이스가 이와 같이 변경되면 User1은 U1Ops와 op1에는 의존하지만 OPS에는 의존하지 않게 됩니다. 따라서 OPS에서 발생한 변경이 User1과는 전혀 관계가 없는 변경이라면, User1을 다시 컴파일하고 새로 배포하는 상황은 초래되지 않습니다.
 
---

##### DIP : 의존성 역전 원칙(Dependency Inversion Principle)

 고수준 정책을 구현하는 코드는 저수준 세부사항을 구현하는 코드에 의존하지 않고, 대신 새부사항이 정책에 의존해야 한다는 원칙입니다. 즉, 의존성 역전 원칙에서 말하는 유연성이 극대화된 시스템이란 소스 코드 의존성이 추상적인 요소에 의존하며 구체적인 요소에는 의존하지 않는 시스템을 말합니다.
 
 자바와 같은 정적 타입 언어에서 이 말은 use, import, include 구문은 오직 인터페이스나 추상 클래스 같은 추상적인 선언만 참조해야 한다는 뜻입니다. 구체적인 대상에는 절대로 의존해서는 안됩니다. 하지만 이 아이디어를 규칙으로 보기에는 비현실적인 요소가 있습니다. 소프트웨어 시스템이라면 반드시 구체적인 많은 장치에 반드시 의존하기 때문입니다. 예를 들어 자바에서 String은 구체 클래스이며, 이를 애써 추상 클래스로 만들려는 시도는 현실성이 없어보입니다.
 
 반면 String 클래스는 매우 안정적입니다. String 클래스가 변경되는 일은 거의 없으며, 있더라도 엄격하게 통제됩니다. 프로그래머와 아키텍트는 String 클래스에서 변덕스러운 변경이 자주 발생하리라고 염려할 필요가 없습니다.
 
 이러한 이유로 DIP를 논할 때 운영체제나 플랫폼 같이 안정성이 보장된 환경에 대해서는 무시하는 편입니다. 이들 환경에 대한 의존성은 용납하는데, 변경되지 않는다면 의존할 수 있다는 사실을 이미 알고 있기 때문입니다.
 
##### 안정된 추상화

 추상 인터페이스는 변경이 생기면 이를 구체화한 구현체들도 따라서 수정해야 합니다. 반대로 구체적인 구현체에 변경이 생기더라도 그 구현체가 구현하는 인터페이스는 항상, 좀 더 정확히 말하면 대다수의 경우 변경될 필요가 없습니다. 따라서 인터페이스는 구현체보다 변동성이 낮습니다. 
 
##### DIP 원칙이 전달하는 코딩 실천법 요약

* 변동성이 큰 구체 클래스를 참조하지 말라. 대신 추상 인터페이스를 참조하라. 이 규칙은 객체 생성 방식을 강하게 제약하며, 일반적으로 추상 팩토리를 사용하도록 강제한다.
* 변동성이 큰 구체 클래스로부터 파생하지 말라. 정적 타입 언어에서 상속은 소스 코드에 존재하는 모든 관계 중에서 가장 강력한 동시에 뻣뻣해서 변경하기 어렵습니다. 따라서 상속은 아주 신중하게 사용해야 합니다. 동적 타입 언어라면 문제가 덜 되겠지만, 의존성을 가진다는 사실에는 변함이 없습니다. 따라서 신중에 신중을 거듭하는게 가장 현명한 선택입니다.
* 구체 함수를 오버라이드 하지 말라. 대체로 구체 함수는 소스 코드 의존성을 필요로 합니다. 따라서 구체 함수를 오버라이드 하면 이러한 의존성을 제거할 수 없게 되며, 실체로는 그 의존성을 상속하게 됩니다. 이러한 의존성을 제거하려면, 차라리 추상 함수로 선언하고 구현체들에서 각자의 용도에 맞게 구현해야 합니다.
* 구체적이며 변동성이 크다면 절대로 그 이름을 언급하지 말라.

##### 팩토리

 위의 규칙들을 준수하려면 변동성이 큰 구체적인 객체는 특별히 주의해서 생성해야 합니다. 모든 언어에서 객체를 생성하려면 해당 객체를 구체적으로 정의한 코드에 대해 소스 코드 의존성이 발생합니다.
 
 자바 등 대다수의 객체 지향 언어에서 이처럼 바람직하지 못한 의존성을 처리할 때 추상 팩토리를 사용하곤 합니다.

![Factory](./images/factory.png)

 위의 그림에서 추상 팩토리를 사용한 구조를 볼 수 있습니다. Application은 Service 인터페이스를 통해 ConcreteImpl을 사용하지만, Application에서는 어떤 식으로든 ConcreteImpl의 인스턴스를 생성해야 합니다. ConcreteImpl에 대해 소스 코드 의존성을 만들지 않으면서 이 목적을 이루기 위해 Application은 ServiceFactory 인터페이스의 makeSvc 메서드를 호출합니다. 이 메서드는 ServiceFactory로부터 파생된 ServiceFactoryImpl에서 구현됩니다. 그리고 ServiceFactoryImpl 구현체가 ConcreteImpl의 인스턴스를 생성한 후 Service타입으로 반환합니다.
 
 그림의 곡선은 아키텍처 경계를 뜻합니다. 이 곡선은 구체적인 것들로부터 추상적인 것들을 분리합니다.
 
 제어흐름은 소스 코드 의존성과는 정반대 방향으로 곡선을 가로지르고 있습니다. 다시 말해 소스 코드 의존성은 제어흐름과는 반대 방향으로 역전되고 있습니다. 이 원칙을 의존성 역전(Dependency Inversion)이라고 부릅니다.
 
##### 구체 컴포넌트

 경계선 아래의 흐름을 보면 ServiceFactoryImpl 구체 클래스가 ConcreteImpl 구체 클래스에 의존하고 있습니다. 따라서 DIP에 위배됩니다. 이는 일반적인 일입니다. DIP 위배를 모두 없앨 수는 없습니다. 하지만 DIP를 위배하는 클래스들은 적은 수의 구체 컴포넌트 내부로 모을 수 있고, 이를 통해 시스템의 나머지 부분과 분리할 수 있습니다.
 
 대다수의 시스템은 이러한 구체 컴포넌트를 최소한 하나는 포함할 것입니다. 흔히 이 컴포넌트를 메인(Main)이라고 부르는데, main 함수를 포함하기 때문입니다. 위와 같은 그림의 경우는 main 함수가 ServiceFactoryImpl의 인스턴스를 생성한 후, 이 인스턴스를 ServiceFactory 타입으로 전역 변수에 저장할 것입니다. 그런 다음 Application은 이 전역 변수를 이용해서 ServiceFactoryImpl의 인스턴스에 접근할 것입니다.
 
![패키지 구조](./images/package.png)

##### Application

```java
public class Application {
    private Service service;

    public Application(ServiceFactory serviceFactory) {
        this.service = serviceFactory.makeSvc();
    }

    public void exec() {
        service.doService();
    }
}
```

##### Service

```java
public interface Service {
    void doService();
}
```

##### ServiceImpl

```java
public class ConcreteImpl implements Service {
    @Override
    public void doService() {
        System.out.println("Do something...");
    }
}
```

##### ServiceFactory

```java
public interface ServiceFactory {
    Service makeSvc();
}
```

##### ServiceFactoryImpl

```java
public class ServiceFactoryImpl implements ServiceFactory {
    @Override
    public Service makeSvc() {
        return new ConcreteImpl();
    }
}
```

##### Main

```java
public class Main {

    private final static ServiceFactory serviceFactory = new ServiceFactoryImpl();

    public static void main(String[] args) {
        Application application = new Application(serviceFactory);
        application.exec();
    }
}
```

---

#### 참고자료

[Clean Architecture](http://www.kyobobook.co.kr/product/detailViewKor.laf?ejkGb=KOR&mallGb=KOR&barcode=9788966262472&orderClick=LAG&Kc=) <<로버트C. 마틴 지음>>

[오브젝트](http://www.kyobobook.co.kr/product/detailViewKor.laf?ejkGb=KOR&mallGb=KOR&barcode=9791158391409&orderClick=LAG&Kc=) <<조용호 지음>>