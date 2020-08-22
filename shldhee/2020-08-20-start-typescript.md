# 타입스크립트 시작하기

## 개요

- 타입스크립트는 새로운 언어보다는 자바스크립트의 상위집합(Superset)으로 이해하면 된다.
- 자바스크립트 파일을 `.ts`를 바꿔도 경고만 나오고 실행은 된다.
- 타입스크립트 파일(`.ts`)를 컴파일하면 자바스크립트 파일(`.js`)이 생성된다. 컴파일 시 타입체크를 한다.
- 타입스크립트의 가장 중요한 기능은 **정적 타입**이다. 자바스크립트는 지원하지 않고 있다.

``` js
var state = 1;
stae = "success";
```

- 숫자형으로 할당된 변수에 문자열을 넣어도 에러가 발생하지 않는다. 
- 간단하게 편하게 사용할 수 있으나, 프로젝트 규모가 커지고 관리해야될 변수가 많을 경우에는 오류가 발생하기 쉽다.
- 브라우저에서 타입스크립트를 자바스크립트로 바로 컴파일해준다.[타입스크립트 플레이그라운드](https://www.typescriptlang.org/play)

## 타입스크립트 설치

```
node 환경에 타입스크립트 설치하기.
npm install -g typescript
설치 후 `tsc --version`으로 설치 잘 되었는지 확인!

.ts파일을 .js파일로 컴파일 하는 방법
tsc helloworld.ts

컴파일하지 않고 바로 .ts파일을 실행하고 싶으면 ts-node 패키지를 설치
npm install -g ts-node
ts-node helloworld.ts
```

## 기본 타입

``` javascript
- 논리(Boolean)
let isRun: boolean = false;

- 숫자(Number)
  - 16진수, 10진수, 8진수, 2진수도 지원한다.
let decimal: number = 5;
let hex: number = 0xff;

- 문자열(String)
let fristName: string = '이';
let lastName: string = '덕희';

- 배열(Array)
  - 타입을 정하고 [] 를 넣는 방법과, 제네릭 배열형(`< >`)을 사용하는 방법이 있다.
let list: number[] = [1,2,3];
let list2: Array<number> = [1,2,3,];

- 튜플(Tuple)
  - 배열타입에 동일한 요소가 아닌 다양한 타입을 사용할때
let point: [string, number];
point = ["x",10];
point = [10,"x"]; // error 배열 순서 일치하지 않음

- 열거(Enum)
enum Color { Red = 1, Green, Blue };
let color: Color = Color.Green
console.log(color); // 2
let color1: Color = Color.Blue
console.log(color1); // 3

- 임의(Any)
  - 명칭 그대로 아무 타입이 다 들어간다.
  - 기존 자바스크립트 코드를 타입스크립트로 변경시에 유용하다.
  - 자주 사용하면 타입스크립트를 사용하는 이유가 없어진다.

let sure: any = 1
sure = "이건 문자열"
sure = true

- 보이드(Void)
  - '어떤 것도 없다'라는 의미로 일반적으로 값을 반환하지 않는 함수의 반환 유형으로 사용한다.
function log(msg): void {
  console.log("LOG : " + msg)
}

- 널(Null)과 미선언(Undefined)
  - null, undefined는 기본적으로 다른 모든 타입의 하위 타입이다. 그 의미는 모든 타입에 null, undefined를 지정할 수 있다는 말이다.
  - 하지만, 타입스크립트 설정 파일에 -strictNullChecks라는 옵션을 사용중이라면 오류가 발생한다. null로 인해 오류가 발생할 수 있는 항상 사용하는것을 추천한다.

let a: number = null;
let b: string = undefined;

- 네버(Never)
  - 절대 발생하지 않을 값의 타입을 나타낸다., 절대 리턴이 발생하지 않는다던가, 항상 예외값을 던져서 절대 반환을 하지 않는 경우이다.

function error(message: string): never {
  throw new Error(message)
}

function forever(): never {
  while(true){

  }
}

- 객체(Object)
  - 객체는 타입으로 정의되지 않는 형이다. 즉, number, string, symbol, null, undefined가 아닌 다른 유형을 말한다.

let user: { name: string, age: number } = { name: '이덕희', age: 100 };
console.log(user.name);
```

- 위 타입스크립트 코드들이 컴파일 되면 아래와 같이 변환된다.(에러나는 코드 제외)

``` javascript
"use strict";
let isRun = false;
let decimal = 5;
let hex = 0xff;
let fristName = '이';
let lastName = '덕희';
let list = [1, 2, 3];
let list2 = [1, 2, 3,];
let point;
point = ["x", 10];
var Color;
(function (Color) {
    Color[Color["Red"] = 1] = "Red";
    Color[Color["Green"] = 2] = "Green";
    Color[Color["Blue"] = 3] = "Blue";
})(Color || (Color = {}));
;
let color = Color.Green;
console.log(color); // 2
let color1 = Color.Blue;
console.log(color1); // 3
let sure = 1;
sure = "이건 문자열";
sure = true;
function error(message) {
    throw new Error(message);
}
function forever() {
    while (true) {
    }
}
let user = { name: '이덕희', age: 100 };
console.log(user.name);3
```

## 타입 별칭(type alias)

- 이미 존재하는 타입에 다른 이름을 붙여서 복잡한 타입을 간단하게 쓸 수 있도록 하는 기능
- 타입을 조합해서 하나의 타입을 만드는 느낌이다.

``` javascript
type UNIQID = string | null
function getUserID(id: UNIQID) {
  console.log(id)
}
getUserID('aidfjidf324');
getUserID(null)
getUserID(12); // error 문자열이 아니기 때문에
```

- 여러가지 타입을 섞어서 사용할 수 있다. 아래 코드는 특정값만 받게하는 타입이다.

``` javascript
type USER_TYPE = 'TESTER' | 'ADMIN'
let userType: USER_TYPE = 'TESTER'
userType = 'asdf' // Type '"asdf"' is not assignable to type 'USER_TYPE'.
```

## 함수(Function)

- 함수의 타입 작성은 각 파라미터의 타입과 함수의 리턴타입을 넣어줄수 있다.
- `?`는 옵셔널이라는 기능인데 필수 매개변수가 아니라는 뜻이다. 즉 매개변수를 넣어도되고 안넣어도 되고 자유다!

``` javascript
function point(x: number, y: nubmer = 10): number {
  return x + y;
}
console.log(point(20)) // 30
console.log(point(20,20)) // 40

function optionPoint(x: number, y?: number): number {
  if(y) {
    return x + y;
  }
  return x;
}
console.log(optionPoint(10,10)) // 20
console.log(optionPoint(10)) // 10

function cities(name: string, ...restName: string[]) {
  return name + "," + restName.join(",");
}

let ourCities = cities('서울','경기도','부산','대구','광주')
console.log(ourCities); // 서울,경기도,부산,대구,광주 
``` 

## 인터페이스(interface)

- 타입의 이름을 지정하는 역할을 해서 코드의 타입을 정의하는 방법
- 인터페이스와 타입이 비슷해서 찾아봤는데 자세한 설명은 링크를 참조
  - [TypeScript에서 Type을 기술하는 두 가지 방법, Interface와 Type Alias
](https://joonsungum.github.io/post/2019-02-25-typescript-interface-and-type-alias/)
- 간단히 정리하면 타입대신 인터페이스를 사용을 권장한다.

``` javascript
interface Size {
  width: number;
  height: number;
}

interface Label {
  title: string;
  size: Size;
}

function labelPrint(label: Label): void {
  console.log(label);
} 

let myLabel = <Label>{
  title: '타입스크립트 도서', size: {width: 30, height: 40}
};

labelPrint(myLabel);

// js 컴파일
function labelPrint(label) {
    console.log(label);
}
var myLabel = {
    title: "타입스크립트 도서",
    size: { width: 30, height: 40 }
};
labelPrint(myLabel);
```

- 자바스크립트도 컴파인된 파일을 보면 interface 부분은 사라진다.
- 인터페이스도 함수 파라미터와 마찬가지로 ?를 사용해서 필수 프로퍼티가 아닐때 표시한다.

``` javascript
interface Config {
  name: string;
  path: string; 
  version?: string;
}

interface App {
  fullPath: string;
  version?: string;
}

function applicationInit(config: Config): App {
  let app = {fullPath: config.path + config.name} as App
  if (config.version) {
    app.version = config.version
  }
  return app
}

console.log(applicationInit(<Config>{ path: '/home/', name: 'user' }))
console.log(applicationInit({ path: '/home/', name: 'user', version: '0.1.1' } as Config ))

// { fullPath: '/home/user' }
// { fullPath: '/home/user', version: '0.1.1' }
```

- `<Config>`나 `as Config`는 타입어셜션(Type Assertions)의 표현식으로 같은 의미다.

## 클래스(Class)

- 자바스크립트와 기본적으로 같은 방법으로 클래스를 사용할 수 있고, 타입스크립트 클래스에서 중요한 기능은 **접근 제한자**이다. 프로퍼티에 대한 접근 권한을 설정 가능하다.
- **public** : 클래스, 서브클래스, 클래스 바깥에서 접근가능
- **private** : 해당 클래스에서만 접근 가능
- **protected** : 클래스, 서브클래스에서 접근 가능 클래스 바깥에서 불가능  

``` javascript
class Person {
  public height: number;
  private weight: number;
  protected age: number;

  constructor(height: number, weight: number, age: number) {
    this.height = height;
    this.weight = weight;
    this.age = age;
  }

  protected getWeight() {
    return this.weight;
  }
}

class Lee extends Person {
  constructor(height: number, weight: number, age: number) {
    super(height, weight, age);
  }

  public getHeight() {
    return this.height;
  }
  public subGetWeight() {
    // return this.weight; // Property 'weight' is private and only accessible within class 'Person'.
    return this.getWeight();
  }
  public getAge() {
    return this.age;
  }
}

const lee = new Lee(190, 100, 30);
console.log(lee.getHeight());
console.log(lee.subGetWeight());
console.log(lee.getAge());
// console.log(lee.age); Property 'age' is protected and only accessible within class 'Person' and its subclasses.
```

## 결론

- 타입스크립트를 책을 보고 간략히 요약해봤다.
- 자세한 내용은 공식홈페이를 통해 살펴보시길 바란다.
- [타입스크립트 공홈](typescriptlang.org)