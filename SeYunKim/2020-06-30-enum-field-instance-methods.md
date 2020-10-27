> [예제코드](https://github.com/ksy90101/ex-code/tree/master/enum-field-ex)

- Enum 필드로 클래스와 메소드를 넣어 보는 예제입니다.
- 주문,  결제,  종료라는 기능이 있다고 해봅시다.
- 원하는 기능을 입력했을때, 그 기능에 맞는 메소드를 실행시키도록 하겠습니다.

## Field에 Instance 넣기

- RunController

```java
package enumfield.ex.controller;

public interface RunController {
	void run();
}
```

- OrderContoller

```java
package enumfield.ex.controller;

public class OrderController implements RunController {
	@Override
	public void run() {
		System.out.println("주문을 받습니다.");
	}
}
```

- PaymentController

```java
package enumfield.ex.controller;

public class PaymentController implements RunController {
	@Override
	public void run() {
		System.out.println("결제를 진행합니다.");
	}
}
```

- ExitController

```java
package enumfield.ex.controller;

public class ExitController implements RunController {
	@Override
	public void run() {
		System.out.println("시스템을 종료합니다.");
		System.exit(0);
	}
}
```

- InputView

```java
package enumfield.ex.view;

import java.util.Scanner;

public class InputView {
	private static final Scanner scanner = new Scanner(System.in);

	public static int inputFunctionNumber() {
		System.out.println("해당 기능의 번호를 입력해주세요.");
		System.out.println("1 - 주문");
		System.out.println("2 - 결제");
		System.out.println("3 - 종료");
		return scanner.nextInt();
	}
}
```

- Application

```java
package enumfield.ex;

import enumfield.ex.function.Function;
import enumfield.ex.view.InputView;

public class Application {
	public static void main(String[] args) {
		while (true) {
			Function function = Function.of(InputView.inputFunctionNumber());
			function.run();
		}
	}
}
```

- Function
- 

```java
package enumfield.ex.function;

import java.util.Arrays;

import enumfield.ex.controller.ExitController;
import enumfield.ex.controller.OrderController;
import enumfield.ex.controller.PaymentController;
import enumfield.ex.controller.RunController;

public enum Function {
	ORDER(1, OrderController::new),
	PAYMENT(2, PaymentController::new),
	EXIT(3, ExitController::new);

	private final int number;
	private final RunController runController;

	Function(final int number, final RunController runController) {
		this.number = number;
		this.runController = runController;
	}

	public static Function of(int number){
		return Arrays.stream(Function.values())
			.filter(function -> function.isSameNumber(number))
			.findFirst()
			.orElseThrow(() -> new IllegalArgumentException("해당 기능을 찾을 수 없습니다."));
	}

	private boolean isSameNumber(int number){
		return this.number == number;
	}

	public void run() {
		runController.run();
	}
}
```

- 위 코드에서 `runController` 필드에 메소드 참조로 OrderController::new를 넣었습니다.
- 이럴때, 제대로 동작 할까요?

```java
해당 기능의 번호를 입력해주세요.
1 - 주문
2 - 결제
3 - 종료
1
해당 기능의 번호를 입력해주세요.
1 - 주문
2 - 결제
3 - 종료
2
해당 기능의 번호를 입력해주세요.
1 - 주문
2 - 결제
3 - 종료
3
```

- 저희가 원하는 결과는 1을 입력했을때 OrderController.run()을 실행하는 것인데, 전혀 실행되지 않고 있습니다.
- 일단 Class를 출력해보면, 아래와 같이 람다라고 나옵니다. 즉, 메소드 참조도 람다의 한 종류이기 때문에 람다라고 나오는 것 입니다.

```java
enumfield.ex.function.Function$$Lambda$1/1791741888
```

- 즉, 위의 코드는 아래와 같이 RunController.run()에 로직이 들어가게 됩니다.

```java
package enumfield.ex.function;

import java.util.Arrays;

import enumfield.ex.controller.ExitController;
import enumfield.ex.controller.OrderController;
import enumfield.ex.controller.PaymentController;
import enumfield.ex.controller.RunController;

public enum Function {
	ORDER(1, () -> new OrderController()),
	PAYMENT(2, () -> new PaymentController()),
	EXIT(3, () -> new ExitController());

	private final int number;
	private final RunController runController;

	Function(final int number, final RunController runController) {
		this.number = number;
		this.runController = runController;
	}

	public static Function of(int number){
		return Arrays.stream(Function.values())
			.filter(function -> function.isSameNumber(number))
			.findFirst()
			.orElseThrow(() -> new IllegalArgumentException("해당 기능을 찾을 수 없습니다."));
	}

	private boolean isSameNumber(int number){
		return this.number == number;
	}

	public void run() {
		runController.run();
	}
}
```

- 즉, run() 메소드는 컨트롤러 인스턴스를 생성하는 로직만 수행하게 되는 것 입니다.
- 그렇다면 저희가 원하도록 변경해보도록 하겠습니다

```java
package enumfield.ex.function;

import java.util.Arrays;

import enumfield.ex.controller.ExitController;
import enumfield.ex.controller.OrderController;
import enumfield.ex.controller.PaymentController;
import enumfield.ex.controller.RunController;

public enum Function {
	ORDER(1, new OrderController()),
	PAYMENT(2, new PaymentController()),
	EXIT(3, new ExitController());

	private final int number;
	private final RunController runController;

	Function(final int number, final RunController runController) {
		this.number = number;
		this.runController = runController;
	}

	public static Function of(int number){
		return Arrays.stream(Function.values())
			.filter(function -> function.isSameNumber(number))
			.findFirst()
			.orElseThrow(() -> new IllegalArgumentException("해당 기능을 찾을 수 없습니다."));
	}

	private boolean isSameNumber(int number){
		return this.number == number;
	}

	public void run() {
		runController.run();
	}
}
```

- 이렇게 직접 인스턴스를 넣어준다면 저희가 원하는 클래스가 들어가게 될 것입니다.

```java
해당 기능의 번호를 입력해주세요.
1 - 주문
2 - 결제
3 - 종료
1
enumfield.ex.controller.OrderController
주문을 받습니다.
해당 기능의 번호를 입력해주세요.
1 - 주문
2 - 결제
3 - 종료
2
enumfield.ex.controller.PaymentController
결제를 진행합니다.
해당 기능의 번호를 입력해주세요.
1 - 주문
2 - 결제
3 - 종료
3
enumfield.ex.controller.ExitController
시스템을 종료합니다.
```

- 이렇게 람다가 아니라 Controller.class가 들어간걸 확인할 수 있습니다.

## Enum Field → Method

### FunctionalInterface

- 지금까지 Enum을 사용하면서 많이 사용한 방법인데, 함수형 인터페이스를 이용해 enum에 메소드를 넣는 것 이였습니다.
- 그렇다면 메소드를 어떻게 넣을까요?
- RunCotroller Interface를 FunctionalInterface로 변경하겠습니다.

```java
package enumfield.ex.controller;

@FunctionalInterface
public interface RunController {
	void run();
}
```

- Function에 이제 메소드를 넣어보도록 하겠습니다. 위에서 이용한 람다를 이용해서 필드에 값을 넣어보도록 하겠습니다.

```java
package enumfield.ex.function;

import java.util.Arrays;

import enumfield.ex.controller.RunController;

public enum FunctionFieldMethod {
	ORDER(1, () -> {
		System.out.println("주문을 받습니다.");
	}),
	PAYMENT(2,() -> {
		System.out.println("결제를 진행합니다.");
	}),
	EXIT(3, () -> {
			System.out.println("시스템을 종료합니다.");
			System.exit(0);
	});

	private final int number;
	private final RunController runController;

	FunctionFieldMethod(final int number, final RunController runController) {
		this.number = number;
		this.runController = runController;
	}

	public static FunctionFieldMethod of(int number){
		return Arrays.stream(FunctionFieldMethod.values())
			.filter(functionFieldMethod -> functionFieldMethod.isSameNumber(number))
			.findFirst()
			.orElseThrow(() -> new IllegalArgumentException("해당 기능을 찾을 수 없습니다."));
	}

	private boolean isSameNumber(int number){
		return this.number == number;
	}

	public void run() {
		runController.run();
	}
}
```

```java
해당 기능의 번호를 입력해주세요.
1 - 주문
2 - 결제
3 - 종료
1
주문을 받습니다.
해당 기능의 번호를 입력해주세요.
1 - 주문
2 - 결제
3 - 종료
2
결제를 진행합니다.
해당 기능의 번호를 입력해주세요.
1 - 주문
2 - 결제
3 - 종료
3
시스템을 종료합니다.
```

- 위와 같이 잘 실행 되는것을 확인할 수 있습니다.

- enum에 메소드를 필드에 넣을 수 있는 방법은 하나 더 있습니다.
- 추상 메서드를 이용하는 방법인데요. 아래와 같이 코드를 변경해주시면 됩니다.

```java
package enumfield.ex.function;

import java.util.Arrays;

import enumfield.ex.controller.RunController;

public enum FunctionFieldMethod2 {
	ORDER(1){
		@Override
		public void run() {
			System.out.println("주문을 받습니다.");
		}
	},
	PAYMENT(2){
		@Override
		public void run() {
			System.out.println("결제를 진행합니다.");
		}
	},
	EXIT(3){
		@Override
		public void run() {
			System.out.println("시스템을 종료합니다.");
			System.exit(0);
		}
	};
	
	private final int number;

	FunctionFieldMethod2(final int number) {
		this.number = number;
	}

	public abstract void run();

	public static FunctionFieldMethod2 of(int number){
		return Arrays.stream(FunctionFieldMethod2.values())
			.filter(functionFieldMethod -> functionFieldMethod.isSameNumber(number))
			.findFirst()
			.orElseThrow(() -> new IllegalArgumentException("해당 기능을 찾을 수 없습니다."));
	}

	private boolean isSameNumber(int number){
		return this.number == number;
	}
}
```

- 가독성이 떨어진다는 단점이 있어서 잘 사용하지 않습니다. 위의 방식으로 함수형 인터페이스를 이용하시는걸 추천합니다.
- 이와 동일하게 `RunController Interface`를 상속 받아 구현하는 방법도 있습니다.

```java
package enumfield.ex.function;

import java.util.Arrays;

import enumfield.ex.controller.RunController;

public enum FunctionFieldMethod3 implements RunController {
	ORDER(1){
		@Override
		public void run() {
			System.out.println("주문을 받습니다.");
		}
	},
	PAYMENT(2){
		@Override
		public void run() {
			System.out.println("결제를 진행합니다.");
		}
	},
	EXIT(3){
		@Override
		public void run() {
			System.out.println("시스템을 종료합니다.");
			System.exit(0);
		}
	};

	private final int number;

	FunctionFieldMethod3(final int number) {
		this.number = number;
	}

	public abstract void run();

	public static FunctionFieldMethod3 of(int number){
		return Arrays.stream(FunctionFieldMethod3.values())
			.filter(functionFieldMethod -> functionFieldMethod.isSameNumber(number))
			.findFirst()
			.orElseThrow(() -> new IllegalArgumentException("해당 기능을 찾을 수 없습니다."));
	}

	private boolean isSameNumber(int number){
		return this.number == number;
	}
}
```

- 가장 많이 사용하는 것은 필드로 함수형 인터페이스를 만들고, 람다를 사용하는 방법이 가장 많이 사용합니다. 가독성 측면에서 훨씬 좋거든요. 그러나, 로직이 길어진다면 메소드 분리를 해야 하는 것을 알고 계셔야 합니다.

## 정리

- 맨날 람다를 이용해 메소드만 넣다보니, 인스턴스 주입에 대해서 헷깔려서 해맸던 기억이 나네요.
- enum의 활용법은 무궁무진하기 때문에, 여러가지 기능들을 알고 계시면 좋을꺼 같아요!
