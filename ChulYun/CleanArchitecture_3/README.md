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
 
---

##### LSP : 리스코프 치환 원칙(Liskov Substitution Principle)

 상호 대체 가능한 구성요소를 이용해 소프트웨어 시스템을 만들 수 있으려면, 이들 구성요소는 반드시 서로 치환 가능해야 한다는 계약을 반드시 지켜야 한다는 원칙입니다.
 
---

##### ISP : 인터페이스 분리 원칙(Interface Segregation Principle)

 소프트웨어 설계자는 사용하지 않는 것에 의존하지 않아야 한다는 원칙입니다.
 
---

##### DIP : 의존성 역전 원칙(Dependency Inversion Principle)

 고수준 정책을 구현하는 코드는 저수준 세부사항을 구현하는 코드에 의존하지 않고, 대신 새부사항이 정책에 의존해야 한다는 원칙입니다.
 
---

#### 참고자료

[Clean Architecture](http://www.kyobobook.co.kr/product/detailViewKor.laf?ejkGb=KOR&mallGb=KOR&barcode=9788966262472&orderClick=LAG&Kc=) <<로버트C. 마틴 지음>>