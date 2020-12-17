# Java Enum 활용
이번에는 Java Enum을 활용 하는 방법에 대해서 알아보고자 한다.  

## 예제
Java Enum을 활용 하는 과정을 예제 구현 코드를 통해 설명 해보자 한다.  

구현 목표 : 계산기  
구현 기능 : 덧셈, 뺄셈, 곱셈, 나눗셈  

## 구현 과정 
일단 Enum을 사용한다기 보다 구현에만 집중하여 작성을 해보자 
```java
public class CalculatorMachine {

    private static final String PLUS = "+";
    private static final String MINUS = "-";
    private static final String MULTIPLE = "*";
    private static final String DIVIDE = "/";

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int result = 0;
        int firstValue = scanner.nextInt();
        String calculator = scanner.next();
        int secondValue = scanner.nextInt();
        if (PLUS.equals(calculator)) {
            result = firstValue + secondValue;
        } else if (MINUS.equals(calculator)) {
            result = firstValue - secondValue;
        } else if (MULTIPLE.equals(calculator)) {
            result = firstValue * secondValue;
        } else if (DIVIDE.equals(calculator)) {
            result = firstValue / secondValue;
        }
        System.out.println(result);
    }
}
```
scanner를 통해 연산자와 연산을 할 두가지 int형 값을 입력 받고 연산자의 종류에 따라
if-else를 통해 구분하여 연산 하도록 구현했다.  
예외 처리가 신경 쓰이지만 일단 넘어가자  
이제 Enum을 생성하여 리팩토링을 해보자 
```java
public class CalculatorMachine {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        double firstValue = scanner.nextDouble();
        String operator = scanner.next();
        double secondValue = scanner.nextDouble();
        CalculatorSymbol operator1 = CalculatorSymbol.findOperator(operator);
        Calculator calculator = new Calculator(firstValue, operator1.getSymbol(),secondValue);
        System.out.println(calculator.CalculateValue());
    }
}

public class Calculator {

    public double firstValue;
    private final CalculatorSymbol symbol;
    private final double secondValue;

    public Calculator(double firstValue, String operator, double secondValue) {
        this.firstValue = firstValue;
        this.symbol = CalculatorSymbol.findOperator(operator);
        this.secondValue = secondValue;
    }

    public double CalculateValue() {
        if (CalculatorSymbol.PLUS.getSymbol().equals(symbol.getSymbol())) {
            return firstValue + secondValue;
        } else if (CalculatorSymbol.MINUS.getSymbol().equals(symbol.getSymbol())) {
            return firstValue - secondValue;
        } else if (CalculatorSymbol.MULTIPLE.getSymbol().equals(symbol.getSymbol())) {
            return firstValue * secondValue;
        } else if (CalculatorSymbol.DIVIDE.getSymbol().equals(symbol.getSymbol())) {
            return firstValue / secondValue;
        }
        return 0;
    }
}
public enum CalculatorSymbol {
    PLUS("+"),
    MINUS("-"),
    MULTIPLE("*"),
    DIVIDE("/");

    private final String value;

    CalculatorSymbol(String k) {
        this.value = k;
    }

    public String getSymbol() {
        return this.value;
    }

    public static CalculatorSymbol findOperator(String operator) {
        return Arrays.stream(CalculatorSymbol.values())
                .filter(symbol ->symbol.value.equals(operator))
                .findFirst()
                .orElseThrow(NullPointerException::new);
    }
}
```
지난번 설명 했던 것처럼 기본적인 Enum 사용법을 통해 구현했다.
Calculator를 생성자에서 입력받은 연산자에 맞는 CalculatorSymbol Enum을 생성했고, 이를 따라 연산자를 구별하는 로직을 구현하였다.  
그리고 처음 구현 했던 코드에서 Calculator 역할을 하는 코드를 따로 class로 구분하여 구현했다.  
main메소드 에서는 간단하게 보이지만 Calculator class를 보면 아직 조건 분기 로직이 신경 쓰인다.  
더불어 CalculatorMachine 클래스에서 Enum클래스가 보이는것이 불편해보인다.  
CalculatorMachine은 계산기 클래스 인데 과연 여기서 CalculatorSymbol Enum 클래스에서 연산자를 찾는 findOperator 메서드를 호출하는 코드가 보여지는게 맞는걸까? 라는 의심도 든다.  

이를 좀 더 간단하게 표현 할 수 없을까 ??  
CalculatorMachine에 Enum클래스를 안보이게 할 순 없을까?  
나중에 다루겠지만 Enum에 함수형 인터페이스를 통해 Enum을 더 효과적으로 효율적으로 사용 할 수 있다.  
다음을 보자  

```java
import java.util.Scanner;

public class CalculatorMachine {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        double firstValue = scanner.nextDouble();
        String operator = scanner.next();
        double secondValue = scanner.nextDouble();
        Calculator calculator = new Calculator(firstValue, operator,secondValue);
        System.out.println(calculator.calculateValue());
    }
}
public class Calculator {

    public double firstValue;
    private final CalculatorSymbol symbol;
    private final double secondValue;

    public Calculator(double firstValue, String operator, double secondValue) {
        this.firstValue = firstValue;
        this.symbol = CalculatorSymbol.findOperator(operator);
        this.secondValue = secondValue;
    }

    public double calculateValue() {
        CalculatorSymbol operator = CalculatorSymbol.findOperator(symbol.getSymbol());
        return operator.calculate(firstValue, secondValue);
    }
}
public enum CalculatorSymbol {
    PLUS("+", (a, b) -> a + b),
    MINUS("-",(a, b) -> a - b),
    MULTIPLE("*",(a, b) -> a * b),
    DIVIDE("/",(a, b) -> a / b);

    private final String value;
    private final BiFunction<Double, Double, Double> calculateValue;

    CalculatorSymbol(String symbol, BiFunction<Double, Double, Double> calculateValue) {
        this.value = symbol;
        this.calculateValue = calculateValue;
    }

    public String getSymbol() {
        return this.value;
    }

    public Double calculate(double firstValue, double secondValue) {
        return this.calculateValue.apply(firstValue,secondValue);
    }

    public static CalculatorSymbol findOperator(String operator) {
        return Arrays.stream(CalculatorSymbol.values())
                .filter(symbol ->symbol.value.equals(operator))
                .findFirst()
                .orElseThrow(NullPointerException::new);
    }

}
```
함수형 인터페이스를 구현한게 신경 쓰이지만 그부분은 제외하고 이외의 코드를 보자!  
일단 Enum에서 변경된 모습을 보면 PLUS("+", (a,b) -> a+b)를 보면 PLUS를 하면 무언가 두 parameter를 받아 더하는 연산을 하는거 같다.  
그리고 그 연산은 public Double calculator 메서드가 해주는거 같다  
이렇게 되니 그전에는 Calculator 혹은 CalculatorMachine클래스에서 이루어진 연산이 Enum에서 이루어지는것을 확인 할 수 있다.  
그리고 Calculator 클래스와 CalculatorMachine클래스의 코드가 더 간단해진것을 확인 할 수 있다.  
이처럼 Enum과 함수형 인터페이스를 활용 하면 class에 역할에 맞게 구현이 되고 코드 또한 더 간결하게 표현 되는 것을 볼 수 있다.
간단한 구현 같은 경우 바로 Enum을 사용하여 구현할 수 도 있겠지만, 연습을 할 땐 기능에만 집중하여 빠르게 구현하고 하나씩 리팩토링 해본다면 Enum을 사용하는 이유, 장점, 활용 방안을 더 확실하게 이해 할 수 있을거라 생각한다.  
