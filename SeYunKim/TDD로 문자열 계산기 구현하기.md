# 단위 테스트로 문자열 계산기 구현하기 - 1

## 요구사항
- 사용자가 입력한 문자열 값에 따라 사칙연산 수행
- 계산 우산순위는 입력 값에 따라 순서가 결정(사칙연산 계산 우선순위 무시)
- 사칙연산(+, -, *, /)만 가능
- 예를들어 "2 + 3 * 4/ 2"를 입력할 경우 10을 출력

## Number 클래스
- 객체지향 생활 체조 3. 원시값과 문자열을 포장하라.
- 위에 객체지향 생활 체조를 지키기 위해 숫자를 포장한 클래스를 만들었습니다.

````java
package domain;

public class Number {
	private int number;

	public Number(int number) {
		this.number = number;
	}

	public int getNumber() {
		return number;
	}
}
````

## Operation Class 
- 사칙연산을 모아놓은 클래스입니다.
- 함수형 인터페이스와 람다를 이용해 가독성을 높였습니다.
- 다형성을 이용해 if문으로 구현해야 할 것을 enum에서 함수형 인터페이스로 구현하였습니다.
- [참고링크](https://www.slipp.net/questions/566)

```java
package domain;

import java.util.function.BiFunction;

public enum Operation {
	PLUS("+",
		(operator, operand) -> new Number(operator.getNumber() + operand.getNumber())),
	MINUS("-",
		(operator, operand) -> new Number(operator.getNumber() - operand.getNumber())),
	MULTIPLICATION("*",
		(operator, operand) -> new Number(operator.getNumber() * operand.getNumber())),
	DIVISION("/",
		(operator, operand) -> new Number(operator.getNumber() / operand.getNumber()));

	private String symbol;
	private BiFunction<Number, Number, Number> calculator;

	Operation(String symbol, BiFunction<Number, Number, Number> calculator) {
		this.symbol = symbol;
		this.calculator = calculator;
	}

	public Number calculate(Number operator, Number operand) {
		return calculator.apply(operator, operand);
	}

	public String getSymbol() {
		return symbol;
	}
}
```

## InputView Class

- 콘솔에서 입력을 받기 위해서 InputView를 구현했습니다.
- 사실 View와 Controller 통신은 `DTO`로 하는 것이 좋지만, 콘솔이면서 간단한 문자열 계산기 이기 떄문에 String을 바로 리턴하겠습니다.
- 여기서 잠시, inputRestart 메서드는 `y`와 `n`이라는 값만 들어와야 합니다.
- 따라서 Validation을 해줘야 할텐데, 그 부분은 `enum`으로 관리한다면 쉽게 할 수 있습니다.

````java
package calculator.view;

import java.util.NoSuchElementException;
import java.util.Scanner;

import calculator.domain.Answer;

public class InputView {
    private static Scanner scanner = new Scanner(System.in);

    public static String enterOperation() {
        OutputView.InputOperationGuide();
        return scanner.nextLine();
    }

    public static Answer InputRestart(){
        OutputView.isStartGuide();
        String isRestart = scanner.nextLine();
        
        try{
            return Answer.of(isRestart);
        }catch (NoSuchElementException e){
            System.out.println(e.getMessage());
            InputRestart();
        }
        
        throw new IllegalStateException("너무 많이 호출하셨습니다.");
    }
}
````

- 사실, 재귀로 저렇게 계속 값을 받는다면 스택오버플로우가 발생할 수 있습니다.
- 아울러 무한루프에 빠질수도 있습니다.
- 그러나 현 상황에서는 가장 간단하게 다시 값을 받을 수 있는 방법이 아닐까 생각합니다...ㅎㅎ

## Answer Class
- 위에서 이야기 했듯이, 또 계산을 하고 싶다면 `y` 또는 `n`을 입력하는데, 다른 값이 들어오면 안되기 때문에, Validation을 하기 위해 만든 enum입니다.

````java
package calculator.domain;

import java.util.Arrays;
import java.util.NoSuchElementException;

public enum Answer {
    YES("y"), NO("n");

    private String answer;

    Answer(String answer) {
        this.answer = answer;
    }

    public static Answer of(String input) {
        return Arrays.stream(Answer.values())
            .filter(answer -> answer.getAnswer()
                .equals(input.toLowerCase()))
            .findFirst()
            .orElseThrow(() -> new NoSuchElementException("잘못된 대답입니다. y 또는 n을 입력해주세요."));
    }

    public String getAnswer() {
        return answer;
    }
}
````

## OutPutView Class
- 계산식을 입력을 안내하는 메서드
- 다시 시작할지 여부를 안내하는 메서드
- 결과를 출력하는 메서드
- 총 3가지의 메서드로 이루어져있습니다.

````java
package calculator.view;

import calculator.domain.Number;

public class OutputView {
    public static void InputOperationGuide() {
        System.out.println("계산할 문자열을 입력해주세요.");
    }

    public static void isStartGuide() {
        System.out.println("계산기를 다시 이용하시겠습니까?(y, n)");
    }

    public static void outputResult(Number number) {
        StringBuilder result = new StringBuilder();
        result.append("계산 결과는")
            .append(number.getNumber())
            .append(" 입니다.");
        
        System.out.println(result);
    }
}
````
- `StringBulider`를 사용한 이유는 String 연산을 할 경우 성능상으로 효율성이 떨어지기 때문입니다.
- 그러나 사실, 최근 컴퓨터들은 이정도는 충분히 커버할 수 있기 때문에 크게 걱정할 필요는 없지만, 왠만하면 String 연산 시, StringBulider를 이용하는 것을 추천합니다!

## 정리 및 다음 시간
- 여기서 가장 배워야 할점은 전략패턴 방식인 다형성을 이용한 enum 구현입니다.
- 사칙연산에 따라서 각각의 패턴을 가지고 있고 그에 맞춰 전략을 구현합니다.
- 다음 시간에 다룰 것들
    1. 이부분을 실제 사용해 보면서 자세하게 설명해보겠습니다.
    2. 다음 시간에는 지금까지 만든 Class를 이용해 실제 문자열 계산기를 구현해보고, 그에 맞춰 단위 테스트를 작성해보도록 하겠습니다.
    3. 아울러 아직 `Validation`에 대한 기능이 남아 있기 때문에 그 부분도 다음시간에 다뤄보도록 하겠습니다.
