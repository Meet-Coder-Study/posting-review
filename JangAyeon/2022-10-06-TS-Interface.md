
# 💙 Literal Types

## 1. 문자열 리터럴 타입

예제 <1>

```
type Job = "police" | "developer" | "teacher";

interface User {
    name : string,
    job : Job
};

const user:User = {
    name : "Ayeon",
    job : "student",
}; // 에러 발생
```
분석 : 오류 발생함

사유 : job 프로퍼티로 위에서 명시한 3개의 값이 아닌 다른 문자열 값을 사용 했기 때문

## 2. 숫자 리터럴 타입
주로 설정값 설명할 때 사용

예제 <2> :  loc/lat 좌표에 지도 생성
```
declare function setupMap(config: MapConfig): void;

// ---생략---

interface MapConfig {
  lng: number;
  lat: number;
  tileSize: 8 | 16 | 32;
}

setupMap({ lng: -73.935242, lat: 40.73061, tileSize: 16 });
```

# 💙 Union Types
* OR : 유니언 타입
* 이미 존재하는 타입을 구성하거나 결합하는 방법

예제<1>
```
interface Car {
    name : "Car",
    color: string,
    start() : void,
}

interface Mobile {
    name : "mobile",
    color : string,
    call() : void,
}

function getGift(gift : Car | Mobile){

    console.log(gift.color);

    if (gift.name == "Car"){
        gift.start();
    }
    else {
        gift.call();
    }
}
```

분석
* `gift.color`는 Car와 Mobile에 동시에 존재하는 property이기 때문에 Error 발생지 않음
*  `gift.name`의 공통 propery의 값을 다르게 해서 식별 가능함
* Car 인터페이스의 `start()` 또는 Mobile 인터페이스의 `call()` 같이 공통적으로 존재하는 메서드가 아닐 때 구분 없이 바로 호출하게 되면 Error 발생

# 💙 Intersection Types
* AND : 교차 타입 : 합쳐줌
* 이미 존재하는 타입을 구성하거나 결합하는 방법

예제 <1>
```
interface Car {
    name : string,
    start() : void,
}

interface Toy {
    name : string,
    color : string,
    price : number
}

const ToyCar : Toy & Car = {
    name : "타요",
    start : ()=>console.log("ToyCar"),
    color : "blue",
    price : 1000
}
```
분석

* `ToyCar` 는 `Toy`와 `Car`가 가진 모든 property를 명시해줘야 에러가 발생하지 않음

# 💙 Interface

* 인터페이스에 정의된 속성과 타입의 조건 만족하는 경우, 객체의 속성 갯수 일치하지 않아도 됨
* 인터페이스에 선언된 속성 순서 지키지 않아도 됨

**기본 사용**

```
interface personAge {
    age : number,
}

function logAge(obj:personAge){
    console.log(obj.age);
}

let person = {name:"Ayeon", age : 28};
logAge(person);
```
분석

* `logAge()` 함수 인자의 타입이 `personAge` 임을 명시적 표현 가능
* `personAge` 인터페이스에 선언된 것은 number인 `age` 속성 한 개이지만 `logAge()` 함수로 받는 인자는 `age`를 포함해 `name`까지 추가된 형태여도 에러 없음

**옵션 속성**
* 속성 끝에 `?` 붙이기
* 인터페이스 사용 시 선택적인 속성 적용 가능
* 인터페이스에 정의 되지 않은 속성 사용 시 에러 발생

```
interface CraftBeer {
    name : string,
    hop? : number,
}

let myBeer = {
    name : "ayeon"
}

function brewBeer(beer:CraftBeer){
    console.log(beer.name);
}

brewBeer(myBeer);

```
분석

* `brewBeer` 함수 인자 타입이 `CraftBeer` 인터페이스
* 함수 인자로 넘겨진 `myBeer`는 `hop` 속성 없지만 해당 속성은 옵션으로 선언되어 에러 없음

**읽기 전용 속성**
* 첫 객체 생성 시에만 속성에 값을 할당하고 그 이후에는 변경 불가능함

```
interface CraftBeer {
    readonly brand : string,
}

let myBeer : CraftBeer = {
    brand : "belgian"
}

myBeer.brand = "Korean"; // 에러 발생
```

**읽기 전용 배열**

* `ReadOnlyArray<T>` 타입 사용해 읽기 전용 배열 생성
* 선언하는 시점에만 값 정의 가능

```
let arr : ReadonlyArray<number> = [1,2,3];
arr.splice(0,1); // 에러
arr.push(4); // 에러
arr[0] = 100; // 에러
```

**함수 타입 정의**
* 함수 인자의 타입, 반환 값 정의

```
interface login {
    (username : string, password : string) : boolean;
}

let loginUser:login;

loginUser = function (id : string, pw : string){
    console.log("로그인")
    return true;

}
```

**클래스 타입 정의**

```
interface CraftBeer {
    beerName : string;
    nameBeer(beer : string) : void;
}

class myBeer implements CraftBeer {
    beerName : string = "Beer";
    nameBeer(b:string){
        this.beerName = b;
    }
    constructor() {}
}
```

**인터페이스 확장**

* 인터페이스 간 확장 가능
* 여러 인터페이스 상속 가능

```
interface Person {
    name : string,
}
interface Developer extends Person {
    skill : string,
}

let fe = {} as Developer;
fe.name = "josh";
fe.name = "typeScript";
```

```
interface Person {
    name : string,
}
interface Drinker {
    drink : string,
}

interface Developer extends Person, Drinker {
    skill : string,
}

let fe = {} as Developer;
fe.name = "josh";
fe.skill = "typescript";
fe.drink = "Beer";
```

**하이브리드 타입**
* 유연하고 동적인 타입 특성에 따라 인터페이스를 여러 타입 조합으로 생성 가능

```
interface CraftBeer {
    (beer:string):string,
    brand : string,
    brew():void
}

function myBeer(): CraftBeer{
    let my = (function (beer : string){}) as CraftBeer; // 함수 타입
    my.brand = "Beer Brand";
    my.brew = function() {};
    return my;
}

let brewedBeer = myBeer(); // 객체 타입
brewedBeer("first Beer");
brewedBeer.brand = "craft";
brewedBeer.brew();
```