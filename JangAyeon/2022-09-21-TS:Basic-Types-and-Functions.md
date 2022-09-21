

**💙 타입스크립트 기본 타입 :**

string, number, boolean,

object, array, enum,

any, void, null, undefined, never

1\. 기본 타입

```
// 숫자
let age:number=30;
// 불리언
let isAdult:boolean=true;
// Object : 배열 - 숫자
let a:number[]=[1,2,3];
let a2:Array<number>=[1,2,3];
// Object : 배열 - 문자열
let b:string[]=["a","b","c"];
let b2:Array<string>=["a","b","c"];
```

2\. Object : 튜플

```
// Object : 배열 - 첫번째 원소 : 문자열, 두번째 원소 : 숫자
let b:[string, number] = ["ab", 1];

b = [1, "a"]; 
// 에러 발생 

b[0].toUpperCase();
// b[0]이 문자열이기 때문에 문자열 메소드 사용 가능

b[1].toUpperCase();
// b[1]은 숫자이기 때문에 문자열 메소드 사용 불가능
```

3\. void : 함수에서 아무 것도 반환되지 않는 경우



function 함수명(인자) : 함수반환타입 {}

```
function sayHello():void{
    console.log("say Hello");
}

sayHello();
```

4\. never

```
1. 항상 에러를 반환하는 경우
function showError():never {
	throw new Error();
}

2. 영원히 끝나지 않는 함수 타입
function infLoop():never {
	while (true) {
    	console.log("Infinite Loop")
    }
}
```

5\. enum

-   클래스를 상수처럼 사용 가능
-   Enum 클래스를 구현하는 경우 : 상수값과 같이 유일하게 하나의 인스턴스가 생성되어 사용됨
-   서로 관련이 있는 상수값 모아 enum으로 구현해 유용
-   클래스와 같은 문법 체계
-   상속 지원하지 않음

```
enum OS{
    Window, // 자동으로 0
    Ios, // 자동으로 1
    Android // 자동으로 2
}

// 값이 숫자인 경우 양방향으로 매핑 가능
console.log(OS[2]); // Android
console.log(OS["Android"]) // 2
```

```
// 값을 명시적으로 할당하지 않은 경우 순차적인 값이 할당됨
enum OS{
    Window = 3,
    Ios = 10, 
    Android // 자동으로 11
}

console.log(OS[10]); // Android
console.log(OS["Android"]) // 11
```

```
enum OS{
    Window = "window",
    Ios = "ios", 
    Android="android" // 자동으로 11
}
// 값이 문자인 경우 단방향 매핑만 가능
console.log(OS["Ios"]); // "ios"
console.log(OS["android"]) // 에러발생
```

6\. null

```
let a : null = null;
```

7\. undefined

```
let b : undefined = undefined;
```



💙 타입스크립트 활용한 함수의 3가지 타입 정의

1\. 함수 반환 타입 정의

2\. 함수 인자 타입 정의

3\. 함수 구조 타입 정의

**기본 함수 인자 타입 정의 및 반환 타입 정의**

```
1. 숫자 매개 변수 두개 받아 합산 결과 반환하는 함수
function Add(num1:number, num2:number):number{
    return num1+num2;
}

const res1 = Add(1,3); // 4

2. 나이 매개 변수 받아 성인 여부 반환하는 함수
function isAdult(age:number):boolean{
    return age>19;
}

const res2 = isAdult(18); // false
```

**함수** **Optional Argument**



**1\. 물음표를 붙임**

**2\. 해당 인자에 대한 기본값 지정**

**3\. Optional Parameter는 필수 인자보다 뒤에 작성되어야 함**

**( => 필수 인자보다 앞에 작성하고자 하는 경우 Undefined 사용)**

```
// 이름 인자 있는 경우 : hello + 이름, 없는 경우 hello + world 반환 함수

1. 물음표를 사용해 Option Param 명시
function sayHelloWithOptionParams(name?:string):string{
    return `Hello ${name || "World"}`;
}

const res3 = sayHelloWithOptionParams("Sam"); // "Hello Sam"
const res4 = sayHelloWithOptionParams(); // "Hello World"

2. 매개 변수 기본값 지정 이용
function sayHelloWithDefaultParams(name="world"):string{
    return `Hello ${name}`;
}

const res5 = sayHelloWithDefaultParams("Sam"); // "Hello Sam"
const res6 = sayHelloWithDefaultParams(); // "Hello World"
```

```
1. Optional Parameter는 필수 인자보다 뒤에 있어야 함
function sayHelloWithMultiParams1(name:string, age?:number){
    if(age!=undefined){
        return `Hello, ${name}. You are ${age}`;
    }
    else {
        return `Hello, ${name}`;
    }
}

const res7 = sayHelloWithMultiParams1("Sam"); // "Hello, Sam"
const res8 = sayHelloWithMultiParams1("Sam", 19); // "Hello, Sam. You are 19"

2. 만약 Optional Parameter를 필수 인자보다 앞에 작성하고자 하는 경우, Undefined 값이 될 수 있음을 명시 
function sayHelloWithMultiParams2(age:undefined|number, name:string){
    if(age!=undefined){
        return `Hello, ${name}. You are ${age}`;
    }
    else {
        return `Hello, ${name}`;
    }
}

const res9 = sayHelloWithMultiParams2(undefined,"Sam"); // "Hello, Sam"
const res10 = sayHelloWithMultiParams2(19, "Sam"); // "Hello, Sam",  "Hello, Sam. You are 19"
```

**함수 Rest Parameter**



1\. Rest Parameter를 Spread 문법 사용하고 타입 명시

```
function addWithRestParams(...nums:number[]){
    return nums.reduce((res, num)=>res+num,0);
}

const res11 = addWithRestParams(1,2,3,4); // 10
```

**함수 반환 타입 정의 오버라이딩**

```
interface User {
    name : string,
    age : number
}

각 각 경우로 override 해야만 Error 없음
function createUser (name:string, age:string):string;
function createUser (name:string, age:number):User;

return이 2가지인 경우 
function createUser (name:string, age:number|string):string|User{
    if (typeof age === "number"){
        return {name, age}
    }
    else {
        return "나이는 숫자로 입력하기!"
    }
};

const Sam:User=createUser("Sam", 30);
const Jane:string=createUser("Jane","30");

console.log(Sam); // { "name": "Sam", "age": 30 } 
console.log(Jane); // "나이는 숫자로 입력하기!"
```

**함수 this 바인딩**

```
interface User{
    name:String;
}

const Sam:User={name:"Sam"};

function showUserInfo(this:User, age:number, gender:"M"|"F"){
    console.log( this.name, age, gender);
}

const nameBindedShowUserInfo = showUserInfo.bind(Sam);
nameBindedShowUserInfo(30, "M"); // "Sam",  30,  "M"
```