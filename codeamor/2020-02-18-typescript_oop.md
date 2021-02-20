# 객체지향의 원칙

![image](https://user-images.githubusercontent.com/65898889/108365968-2b4c7500-723b-11eb-8086-51ca8b5f969d.png)

## 캡슐화(Encapsulation)

감기약의 캡슐 안에는 다양한 성분의 가루가 있습니다.

우리는 그 안에 어떤 것이 들어 있는지 신경쓰지 않고 하나의 감기약만 먹으면 감기를 치료할 수 있습니다.

이와 마찬가지로 관련 있는 데이터와 함수를 한 오브젝트 안에 담아 두고 외부에서 보일 필요가 없는 데이터를 잠 숨겨 놓음으로써 캡슐화를 할 수가 있습니다.

어떤 관련성을 가지는 데이터들을 오브젝트로 묶어 낼 것인지, 어떤 데이터를 외부에서 볼 수 있게끔 만들 것인지 고민하는 것이 OOP의 출발이라고 할 수 있습니다.

## 추상화(Abstraction)

내부의 복잡한 기능들을 우리가 전부 이해하지 않더라도 외부에서 간단한 인터페이스를 통해 쓸 수 있는 것을 말합니다.

우리가 커피 머신이 내부적으로 어떻게 동작하는지 몰라도 외부에 노출되어 있는 버튼들(인터페이스)만 누르면 커피를 만들 수 있는 것처럼, 외부에서만 보이는 인터페이스 함수를 이용해 오브젝트를 사용하는 것입니다.

## 상속(Inheritance)

커피 머신이라는 클래스가 정의되어 있습니다.

커피 머신은 필요한 데이터와 함수를 가지고 있습니다. 상속을 이용하게 되면 잘 만들어진 커피 머신의 데이터와 함수를 그대로 가지고 오면서, 내가 필요한 기능을 더해서 다른 종류의 커피 머신을 만들 수 있게 됩니다.

상속의 관계는 `parent-child`, `super-sub`, `base-derived` 클래스라고도 부릅니다.

그리고 이런 상속은 IS-A 관계라고도 불립니다.

## 다형성(Polymorphism)

상속을 통해 만들어진 여러 커피 머신들이 어떤 종류인지 우리는 전혀 신경쓰지 않고, 커피를 만드는 임의의 공통 함수 makeCoffee()를 이용해서 커피 머신에 접근할 수 있게 됩니다.

# 캡슐화 적용해보기

정보를 은닉하는 과정

`BEANS_GRAMM_PER_SHOT`, `coffeeBeans` 등은 외부에서 접근할 필요가 없습니다.

```ts
type CoffeCup = {
  shots: number;
  hasMilk: boolean;
};
// 접근 제어자
// public: 기본적으로 외부에서 볼 수 있는 공개 상태
// private: 외부에서 볼 수 없고, 접근 불가
// protected: 상속할 때 외부에서는 접근 불가, 자식 클래스에서만 접근 가능
class CoffeeMaker {
  private static BEANS_GRAMM_PER_SHOT: number = 7; // class level
  private coffeeBeans: number = 0; // instance(object) level

  private constructor(coffeeBeans: number) {
    this.coffeeBeans = coffeeBeans;
  }
  // static 키워드를 붙여서 무언가 오브젝트를 만들 수 있는 함수를 제공한다면, 누군가가 생성자를 사용해서 생성하는 것을 금지하기 위해서 씁니다.
  // 따라서 constructor에 private을 붙여서 항상 static 메서드를 이용할 수 있도록 권장하는 것이 낫습니다.
  static makeMachine(coffeeBeans: number): CoffeeMaker {
    return new CoffeeMaker(coffeeBeans);
  }

  fillCoffeeBeans(beans: number) {
    if (beans < 0) {
      throw new Error("value for beans should be greater than 0");
    }
    this.coffeeBeans += beans;
  }

  makeCoffee(shots: number): CoffeCup {
    if (this.coffeeBeans < shots * CoffeeMaker.BEANS_GRAMM_PER_SHOT) {
      throw new Error("Not enough coffee beans!");
    }

    this.coffeeBeans -= shots * CoffeeMaker.BEANS_GRAMM_PER_SHOT;
    return {
      shots,
      hasMilk: false,
    };
  }
}

const maker = CoffeeMaker.makeMachine(32);
console.log(maker); // CoffeeMaker { coffeeBeans: 32 }
```

# 추상화 적용해보기

언어마다 추상화의 레벨이 다르지만, 타입스크립트에서는 캡슐화를 통한 추상화와 인터페이스를 통한 추상화를 할 수 있습니다.

```ts
type CoffeeCup = {
  shots: number;
  hasMilk: boolean;
};

// makeCoffee 함수를 이용하기 위한 인터페이스
interface CoffeeMaker {
  makeCoffee(shots: number): CoffeeCup;
}

// 좀 더 다양한 기능(커피콩을 채우고 커피 머신을 청소해주는)을 추가한 인터페이스
interface CommercialCoffeeMaker {
  makeCoffee(shots: number): CoffeeCup;
  fillCoffeeBeans(beans: number): void;
  clean(): void;
}
// 이 클래스를 위에서 만든 interface 규격을 따라가게 만듭니다. (implements)
class CoffeeMachine implements CoffeeMaker, CommercialCoffeeMaker {
  private static BEANS_GRAMM_PER_SHOT: number = 7; // class level
  private coffeeBeans: number = 0; // instance(object) level

  private constructor(coffeeBeans: number) {
    this.coffeeBeans = coffeeBeans;
  }
  static makeMachine(coffeeBeans: number): CoffeeMachine {
    return new CoffeeMachine(coffeeBeans);
  }
  // 커피콩을 채워주는 함수
  fillCoffeeBeans(beans: number) {
    if (beans < 0) {
      throw new Error("value for beans should be greater than 0");
    }
    this.coffeeBeans += beans;
  }
  // 커피 머신을 청소하는 함수
  clean() {
    console.log("cleaning the machine...");
  }
  // 커피콩을 갈아주는 함수
  private grindBeans(shots) {
    console.log(`grinding beans for ${shots}`);
    if (this.coffeeBeans < shots * CoffeeMachine.BEANS_GRAMM_PER_SHOT) {
      throw new Error("Not enough coffee beans!");
    }
    this.coffeeBeans -= shots * CoffeeMachine.BEANS_GRAMM_PER_SHOT;
  }
  // 커피 머신을 예열하는 함수
  private preheat(): void {
    console.log("heating up... 🔥");
  }
  // 커피를 추출하는 함수
  private extract(shots: number): CoffeeCup {
    console.log(`Pulling ${shots} shots... ☕`);
    return {
      shots,
      hasMilk: false,
    };
  }
  // 커피를 만드는 함수
  makeCoffee(shots: number): CoffeeCup {
    this.grindBeans(shots);
    this.preheat();
    return this.extract(shots);
  }
}

class AmateurUser {
  constructor(private machine: CoffeeMaker) {}
  makeCoffee() {
    const coffee = this.machine.makeCoffee(2);
    console.log(coffee);
  }
}

class ProBarista {
  constructor(private machine: CommercialCoffeeMaker) {}
  makeCoffee() {
    const coffee = this.machine.makeCoffee(2);
    console.log(coffee);
    this.machine.fillCoffeeBeans(45);
    this.machine.clean();
  }
}

const maker: CoffeeMachine = CoffeeMachine.makeMachine(32);
const amateur = new AmateurUser(maker);
const pro = new ProBarista(maker);
amateur.makeCoffee();
/* 실행 결과
grinding beans for 2
heating up... 🔥
Pulling 2 shots... ☕
{ shots: 2, hasMilk: false }
*/
pro.makeCoffee();
/* 실행 결과
grinding beans for 2
heating up... 🔥
Pulling 2 shots... ☕
{ shots: 2, hasMilk: false }
cleaning the machine...
*/
```

아마추어는 커피 머신 청소를 안했는데 프로 바리스타는 청소까지 마쳤습니다!

# 상속 적용해보기

```ts
type CoffeeCup = {
  shots: number;
  hasMilk: boolean;
};

interface CoffeeMaker {
  makeCoffee(shots: number): CoffeeCup;
}

class CoffeeMachine implements CoffeeMaker {
  private static BEANS_GRAMM_PER_SHOT: number = 7; // class level
  private coffeeBeans: number = 0; // instance(object) level

  constructor(coffeeBeans: number) {
    this.coffeeBeans = coffeeBeans;
  }
  static makeMachine(coffeeBeans: number): CoffeeMachine {
    return new CoffeeMachine(coffeeBeans);
  }

  fillCoffeeBeans(beans: number) {
    if (beans < 0) {
      throw new Error("value for beans should be greater than 0");
    }
    this.coffeeBeans += beans;
  }

  clean() {
    console.log("cleaning the machine...");
  }

  private grindBeans(shots) {
    console.log(`grinding beans for ${shots}`);
    if (this.coffeeBeans < shots * CoffeeMachine.BEANS_GRAMM_PER_SHOT) {
      throw new Error("Not enough coffee beans!");
    }
    this.coffeeBeans -= shots * CoffeeMachine.BEANS_GRAMM_PER_SHOT;
  }

  private preheat(): void {
    console.log("heating up... 🔥");
  }

  private extract(shots: number): CoffeeCup {
    console.log(`Pulling ${shots} shots... ☕`);
    return {
      shots,
      hasMilk: false,
    };
  }

  makeCoffee(shots: number): CoffeeCup {
    this.grindBeans(shots);
    this.preheat();
    return this.extract(shots);
  }
}
// 커피 머신 클래스를 상속한 카페라테 머신 클래스
class CaffeLatteMachine extends CoffeeMachine {
  // 한번 설정하고 바뀌지 않는다면 readonly 키워드를 붙여줄 수 있습니다.
  // 커피 머신의 시리얼 넘버(고유 번호)를 생성자에 추가시켰습니다.
  constructor(beans: number, public readonly serialNumber: string) {
    super(beans);
  }
  private steamMilk(): void {
    console.log("Steaming some milk... 🥛");
  }
  makeCoffee(shots: number): CoffeeCup {
    const coffee = super.makeCoffee(shots);
    this.steamMilk();
    return {
      ...coffee,
      hasMilk: true,
    };
  }
}

const latteMachine = new CaffeLatteMachine(23, "SSM-2319");
const coffee = latteMachine.makeCoffee(1);
console.log(coffee); // { shots: 1, hasMilk: true }
console.log(latteMachine.serialNumber);
/*
grinding beans for 1
heating up... 🔥
Pulling 1 shots... ☕
Steaming some milk... 🥛
SSM-2319
*/
```

# 다형성 적용해보기

```ts
type CoffeeCup = {
  shots: number;
  hasMilk?: boolean;
  hasSugar?: boolean;
};

interface CoffeeMaker {
  makeCoffee(shots: number): CoffeeCup;
}

class CoffeeMachine implements CoffeeMaker {
  private static BEANS_GRAMM_PER_SHOT: number = 7; // class level
  private coffeeBeans: number = 0; // instance(object) level

  constructor(coffeeBeans: number) {
    this.coffeeBeans = coffeeBeans;
  }
  static makeMachine(coffeeBeans: number): CoffeeMachine {
    return new CoffeeMachine(coffeeBeans);
  }

  fillCoffeeBeans(beans: number) {
    if (beans < 0) {
      throw new Error("value for beans should be greater than 0");
    }
    this.coffeeBeans += beans;
  }

  clean() {
    console.log("cleaning the machine...");
  }

  private grindBeans(shots) {
    console.log(`grinding beans for ${shots}`);
    if (this.coffeeBeans < shots * CoffeeMachine.BEANS_GRAMM_PER_SHOT) {
      throw new Error("Not enough coffee beans!");
    }
    this.coffeeBeans -= shots * CoffeeMachine.BEANS_GRAMM_PER_SHOT;
  }

  private preheat(): void {
    console.log("heating up... 🔥");
  }

  private extract(shots: number): CoffeeCup {
    console.log(`Pulling ${shots} shots... ☕`);
    return {
      shots,
      hasMilk: false,
    };
  }

  makeCoffee(shots: number): CoffeeCup {
    this.grindBeans(shots);
    this.preheat();
    return this.extract(shots);
  }
}

class CaffeLatteMachine extends CoffeeMachine {
  constructor(beans: number, public readonly serialNumber: string) {
    super(beans);
  }
  private steamMilk(): void {
    console.log("Steaming some milk... 🥛");
  }
  makeCoffee(shots: number): CoffeeCup {
    const coffee = super.makeCoffee(shots);
    this.steamMilk();
    return {
      ...coffee,
      hasMilk: true,
    };
  }
}

class SweetCoffeeMaker extends CoffeeMachine {
  makeCoffee(shots: number): CoffeeCup {
    const coffee = super.makeCoffee(shots);
    return {
      ...coffee,
      hasSugar: true,
    };
  }
}

// 다양한 커피 머신들이 들어있는 machines 배열
const machines: CoffeeMaker[] = [
  new CoffeeMachine(16),
  new CaffeLatteMachine(16, "SSM-2319"),
  new SweetCoffeeMaker(16),
  new CoffeeMachine(16),
  new CaffeLatteMachine(16, "SSM-2319"),
  new SweetCoffeeMaker(16),
];

// machines 배열을 순회하면서 각각의 요소 마다 내부 코드 실행
machines.forEach((machine) => {
  console.log("-----------------------------");
  machine.makeCoffee(1);
  machine.makeCoffee;
});
/*
-----------------------------
grinding beans for 1
heating up... 🔥
Pulling 1 shots... ☕
-----------------------------
grinding beans for 1
heating up... 🔥
Pulling 1 shots... ☕
Steaming some milk... 🥛
-----------------------------
grinding beans for 1
heating up... 🔥
Pulling 1 shots... ☕
-----------------------------
grinding beans for 1
heating up... 🔥
Pulling 1 shots... ☕
-----------------------------
grinding beans for 1
heating up... 🔥
Pulling 1 shots... ☕
Steaming some milk... 🥛
-----------------------------
grinding beans for 1
heating up... 🔥
Pulling 1 shots... ☕
*/
```

다형성은 하나의 인터페이스 또는 부모의 클래스를 상속한 자식 클래스들이 인터페이스와 부모 클래스에 있는 함수들을 다른 방식으로 다양하게 구성함으로써 말 그대로 다양성을 부여할 수 있게 하는 것입니다.

다형성의 장점은 내부적으로 구현된 다양한 클래스들이 한 가지의 인터페이스를 구현하거나 동일한 부모 클래스를 상속했을 때, 동일한 함수를 어떤 클래스인지 구분하지 않고 공통된 api를 호출할 수 있다는 것입니다.

# 상속의 문제점

카페 라떼 머신처럼 우유를 포함한 커피를 만드는 클래스가 있다면 설탕을 더 넣어 달달한 커피를 만들어 주는 클래스도 있을 수 있습니다.

```ts
class SweetCoffeeMaker extends CoffeeMachine {}
```

그런데 만약 달달한 카페 라떼를 먹고 싶은 상황이 생겼고, 상속의 구조를 그대로 가져간다면 어떨까요?

우유와 설탕을 동시에 상속할 수 있는 클래스를 하나 더 만들어야 할까요?

나중에 요구 사항이 계속 추가될 수록 계속해서 상속으로 만드는 것은 문제가 생길 수 있습니다.

상속이라는 것은 수직적으로 관계가 형성되는 것을 의미합니다..

상속의 치명적인 문제는, 내가 어떤 부모 클래스의 행동을 수정하게 되면 이 수정 사항 때문에 이것을 상속한 모든 자식 클래스에 영향을 미칠 수가 있다는 것입니다.

그리고 새로운 기능을 도입하고자 할 때, 상속의 구조를 가져오는 것은 상당한 스트레스가 될 수 있습니다.

그리고 가장 큰 문제는!! **TypeScript에서는 하나 이상의 부모 클래스를 상속할 수가 없습니다.**

이런 문제점을 극복할 수 있는 개념이 바로 조합(Composition)입니다.

# 조합(Composition)

```ts
type CoffeeCup = {
  shots: number;
  hasMilk?: boolean;
  hasSugar?: boolean;
};

interface CoffeeMaker {
  makeCoffee(shots: number): CoffeeCup;
}

class CoffeeMachine implements CoffeeMaker {
  private static BEANS_GRAMM_PER_SHOT: number = 7; // class level
  private coffeeBeans: number = 0; // instance(object) level

  constructor(coffeeBeans: number) {
    this.coffeeBeans = coffeeBeans;
  }
  static makeMachine(coffeeBeans: number): CoffeeMachine {
    return new CoffeeMachine(coffeeBeans);
  }

  fillCoffeeBeans(beans: number) {
    if (beans < 0) {
      throw new Error("value for beans should be greater than 0");
    }
    this.coffeeBeans += beans;
  }

  clean() {
    console.log("cleaning the machine...");
  }

  private grindBeans(shots) {
    console.log(`grinding beans for ${shots}`);
    if (this.coffeeBeans < shots * CoffeeMachine.BEANS_GRAMM_PER_SHOT) {
      throw new Error("Not enough coffee beans!");
    }
    this.coffeeBeans -= shots * CoffeeMachine.BEANS_GRAMM_PER_SHOT;
  }

  private preheat(): void {
    console.log("heating up... 🔥");
  }

  private extract(shots: number): CoffeeCup {
    console.log(`Pulling ${shots} shots... ☕`);
    return {
      shots,
      hasMilk: false,
    };
  }

  makeCoffee(shots: number): CoffeeCup {
    this.grindBeans(shots);
    this.preheat();
    return this.extract(shots);
  }
}
// 우유를 만들고, 설탕을 공급해주는 클래스를 따로 만들어 줍니다.
// 싸구려 우유 거품기 함수
class CheapMilkSteamer {
  // 우유를 스팀하는 함수
  private steamMilk(): void {
    console.log("Steaming some milk... 🥛");
  }
  // 우유를 만드는 함수: 만들어진 커피 컵을 받아서 내부에서 열심히 만든 우유 거품을 붓고, 다시 커피 컵과 우유 포함 여부를 리턴하는 함수
  makeMilk(cup: CoffeeCup): CoffeeCup {
    this.steamMilk();
    return {
      ...cup,
      hasMilk: true,
    };
  }
}
// 설탕 제조기
class CandySugarMixer {
  // 설탕을 가져오는 함수
  private getSugar() {
    console.log("Getting some sugar from candy 🍭");
    return true;
  }
  // 설탕 용기에서 설탕을 가져오는 함수
  addSugar(cup: CoffeeCup): CoffeeCup {
    const sugar = this.getSugar();
    return {
      ...cup,
      hasSugar: sugar,
    };
  }
}

// 카페 라떼 머신
class CaffeLatteMachine extends CoffeeMachine {
  constructor(
    beans: number,
    public readonly serialNumber: string,
    // Dependency Injection(DI): 필요한 기능을 외부에서 내부로 주입시킵니다.
    private milkFrother: CheapMilkSteamer
  ) {
    super(beans);
  }

  makeCoffee(shots: number): CoffeeCup {
    const coffee = super.makeCoffee(shots);
    return this.milkFrother.makeMilk(coffee);
  }
}

// 달달한 커피 머신
class SweetCoffeeMaker extends CoffeeMachine {
  constructor(private beans: number, private sugar: CandySugarMixer) {
    super(beans);
  }
  makeCoffee(shots: number): CoffeeCup {
    const coffee = super.makeCoffee(shots);
    return this.sugar.addSugar(coffee);
  }
}

// 달달한 카페라떼 머신 클래스
class SweetCaffeLatteMachine extends CoffeeMachine {
  constructor(
    private beans: number,
    private milk: CheapMilkSteamer,
    private sugar: CandySugarMixer
  ) {
    super(beans);
  }
  makeCoffee(shots: number): CoffeeCup {
    const coffee = super.makeCoffee(shots);
    const sugarAdded = this.sugar.addSugar(coffee);
    return this.milk.makeMilk(sugarAdded);
  }
}

const cheapMilkMaker = new CheapMilkSteamer();
const candySugar = new CandySugarMixer();
const sweetMachine = new SweetCoffeeMaker(12, candySugar);
const latteMachine = new CaffeLatteMachine(12, "SSM-2319", cheapMilkMaker);
const sweetLatteMachine = new SweetCaffeLatteMachine(
  12,
  cheapMilkMaker,
  candySugar
);
```

이렇게 필요한 기능(우유 제조, 설탕 공급)을 가져와서 외부에서 주입 받음으로서 컴포지션을 이용해 필요한 기능을 재사용할 수 있습니다.

하지만 현재 이 상태도 재사용성이 떨어집니다.

만약 비싼 커피 머신을 구입했는데, 판매처에서 "이 커피 머신은 서울우유만 넣을 수 있습니다." 라고 하면 어안이 벙벙할 것입니다.

아무리 좋은 우유 거품기, 좋은 설탕을 가져와도 지금의 커피 머신은 사용할 수 없게 됩니다.

이런 식으로 클래스들 사이에 서로 상호 작용을 하는 경우엔 클래스 자신을 노출하는 것이 아니라 계약서(interface)를 통해서 상호작용을 해야합니다.

결론적으로 조합으로 인해 강하게 커플링 되어있는 클래스들을 인터페이스로 디커플링 시킬 수 있습니다.

현재 CoffeeMachine 클래스를 상속하는 라떼 머신과 달달한 커피 머신도 인터페이스를 활용하여 충분히 대체할 수 있습니다.

# interface를 통해 개선된 조합

```ts
type CoffeeCup = {
  shots: number;
  hasMilk?: boolean;
  hasSugar?: boolean;
};

interface CoffeeMaker {
  makeCoffee(shots: number): CoffeeCup;
}

class CoffeeMachine implements CoffeeMaker {
  private static BEANS_GRAMM_PER_SHOT: number = 7; // class level
  private coffeeBeans: number = 0; // instance(object) level

  constructor(
    coffeeBeans: number,
    private milk: MilkFrother,
    private sugar: SugarProvider
  ) {
    this.coffeeBeans = coffeeBeans;
  }

  fillCoffeeBeans(beans: number) {
    if (beans < 0) {
      throw new Error("value for beans should be greater than 0");
    }
    this.coffeeBeans += beans;
  }

  clean() {
    console.log("cleaning the machine...");
  }

  private grindBeans(shots) {
    console.log(`grinding beans for ${shots}`);
    if (this.coffeeBeans < shots * CoffeeMachine.BEANS_GRAMM_PER_SHOT) {
      throw new Error("Not enough coffee beans!");
    }
    this.coffeeBeans -= shots * CoffeeMachine.BEANS_GRAMM_PER_SHOT;
  }

  private preheat(): void {
    console.log("heating up... 🔥");
  }

  private extract(shots: number): CoffeeCup {
    console.log(`Pulling ${shots} shots... ☕`);
    return {
      shots,
      hasMilk: false,
    };
  }

  makeCoffee(shots: number): CoffeeCup {
    this.grindBeans(shots);
    this.preheat();
    const coffee = this.extract(shots);
    const sugarAdded = this.sugar.addSugar(coffee);
    return this.milk.makeMilk(sugarAdded);
  }
}

interface MilkFrother {
  makeMilk(cup: CoffeeCup): CoffeeCup;
}

interface SugarProvider {
  addSugar(cup: CoffeeCup): CoffeeCup;
}

// 싸구려 우유 거품기
class CheapMilkSteamer implements MilkFrother {
  private steamMilk(): void {
    console.log("Steaming some milk... 🥛");
  }
  makeMilk(cup: CoffeeCup): CoffeeCup {
    this.steamMilk();
    return {
      ...cup,
      hasMilk: true,
    };
  }
}
// 고급 우유 거품기
class FancyMilkSteamer implements MilkFrother {
  private steamMilk(): void {
    console.log("Fancy Steaming some milk... 🥛");
  }
  makeMilk(cup: CoffeeCup): CoffeeCup {
    this.steamMilk();
    return {
      ...cup,
      hasMilk: true,
    };
  }
}
// 차가운 우유 거품기
class ColdMilkSteamer implements MilkFrother {
  private steamMilk(): void {
    console.log("Cold Fancy Steaming some milk... 🥛");
  }
  makeMilk(cup: CoffeeCup): CoffeeCup {
    this.steamMilk();
    return {
      ...cup,
      hasMilk: true,
    };
  }
}

// 우유를 넣지 않는 거품기 (아무 것도 하지 않음)
class NoMilk implements MilkFrother {
  makeMilk(cup: CoffeeCup): CoffeeCup {
    return cup;
  }
}

// 설탕 제조기
class CandySugarMixer implements SugarProvider {
  private getSugar() {
    console.log("Getting some sugar from candy 🍭");
    return true;
  }

  addSugar(cup: CoffeeCup): CoffeeCup {
    const sugar = this.getSugar();
    return {
      ...cup,
      hasSugar: sugar,
    };
  }
}

class SugarMixer implements SugarProvider {
  private getSugar() {
    console.log("Getting some sugar from jar... 🧉");
    return true;
  }

  addSugar(cup: CoffeeCup): CoffeeCup {
    const sugar = this.getSugar();
    return {
      ...cup,
      hasSugar: sugar,
    };
  }
}

class NoSugar implements SugarProvider {
  addSugar(cup: CoffeeCup): CoffeeCup {
    return cup;
  }
}

// Milk
const cheapMilkMaker = new CheapMilkSteamer();
const fancyMilkMaker = new FancyMilkSteamer();
const coldMilkMaker = new ColdMilkSteamer();
const noMilk = new NoMilk();

// Sugar
const candySugar = new CandySugarMixer();
const sugar = new SugarMixer();
const noSugar = new NoSugar();

// Machine
// 이렇게 우유가 필요 없을 땐 매개 변수에 noMilk를 넣어주는 것으로 만들 수 있습니다.
const sweetCandyMachine = new CoffeeMachine(12, noMilk, candySugar);
const sweetMachine = new CoffeeMachine(12, noMilk, sugar);

const latteMachine = new CoffeeMachine(12, cheapMilkMaker, noSugar);
const coldLatteMachine = new CoffeeMachine(12, coldMilkMaker, noSugar);
const sweetLatteMachine = new CoffeeMachine(12, cheapMilkMaker, candySugar);
```

이렇게 함으로써 다양한 우유와 설탕을 조합하면서 사용할 수 있게 되었습니다.

조합이 유용하지만, 상속이 무조건적으로 나쁜 것은 아닙니다.

상속이 유용하고 꼭 필요한 경우가 있지만, 상속의 관계가 너무 깊다면 조합을 이용해 필요한 기능들을 조립하여 확장 가능하고 재사용성이 높은 코딩을 지향해야 할 필요가 있습니다.

# Reference

[드림코딩 엘리 강의](https://www.youtube.com/watch?v=ZZib1YpxNdg)
