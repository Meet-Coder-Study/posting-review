# 이펙티브 타입스크립트

- 댄 밴더캄의 이펙티브 타입스크립트 도서의 아이템11,12 읽고 정리한 내용입니다.

## 아이템 12. 함수 표현식에 타입 적용하기

- 타입스크립트에서는 함수 선언문 보다 함수 표현식을 사용하는 것이 좋습니다.
- 그 이유는 함수 타입 선언은 함수 표현식에 재사용 할 수 있는 이점이 있기 때문입니다.

### 함수 타입 선언의 장점

#### 예제 1. `DiceRollFn` 함수 타입을 재사용할 수 있습니다.

**함수 선언문**

```typescript
function rollDice1(sides: number): number {
  /* COMPRESS */ return 0; /* END */
} // Statement
```

**함수 표현식**

```typescript
type DiceRollFn = (sides: number) => number;
const rollDice: DiceRollFn = (sides) => {
  /* COMPRESS */ return 0; /* END */
};
```

#### 예제 2. lib.dom.d.ts 에 정의되어 있는 `fetch` 타입 선언 함수 타입을 재사용하여 간결하게 작성할 수 있습니다.

**함수 선언문**

```typescript

async function checkedFetch(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw Error("request failed:", response.status);
  }

  return response;
}

async function getQuote() {
  const response = await checkedFetches('/quote?by=Mark+Twain');
  const quote = await response.json();
  return quote;
}
```

**함수 표현식**

```typescript
const checkedFetch: typeof fetch = async (input, init) => {
  const resp = await fetch(input, init);
  if (!response.ok) {
    throw Error("request failed:", response.status);
  }

  return response;
};

async function getQuote() {
  const response = await checkedFetches('/quote?by=Mark+Twain');
  const quote = await response.json();
  return quote;
}
```

- fetch 타입은 반환 타입까지 보장 합니다. 예를 들어 throw 대신 return 을 하게 되면 `Promise<Response>` 에서 `Promise<Response|Error>` 타입이 되어버리기 때문에, 에러를 냅니다.



```typescript


const checkedFetch: typeof fetch = async (input, init) => {
  const resp = await fetch(input, init);
  if (!response.ok) {
    return Error("request failed:", response.status); //❗️
  }

  return response;
};

async function getQuote() {
  const response = await checkedFetches('/quote?by=Mark+Twain');
  const quote = await response.json();
  return quote;
}
```
<img width="665" alt="Screen Shot 2021-12-10 at 1 42 49 AM" src="https://user-images.githubusercontent.com/26635607/145438970-9277a378-f994-4a5c-95d5-0f8e7f51a109.png">



## 아이템 13. 타입과 인터페이스의 차이 알기

대부분의 경우 타입을 사용해도되고 인터페이스를 사용해도 됩니다. 하지만 둘의 차이를 알고 동일한 방법으로 타입을 정의해 일관성을 유지해야 합니다.


### 차이점.

#### 1. 둘 모두 확장이 가능하나 확장의 개념이 서로 다릅니다.

```typescript
type StateType = {
  name: string;
  capital: string;
};

interface StateInterface {
  name: string;
  capital: string;
}

interface StateLocation {
  latitude: number;
}

interface StateWithPopInterface extends StateInterface {
  population: number;
}
type StateWithPopType = StateLocation & StateWithPopInterface;

const stateA: StateWithPopInterface = {};
const stateB: StateWithPopType = {};
```

- 인터페이스 타입을 가진 `stateA`에선 `name`,`capital`,`population` 모두 선언되어있지 않다고 에러를 내주고 있습니다.  

<img width="524" alt="Screen Shot 2021-12-09 at 11 39 03 PM" src="https://user-images.githubusercontent.com/26635607/145416672-86366ea8-55b4-4782-92e8-d97201f4096d.png">  


- type 키워드를 가진 `stateB`에선 `name`,`capital`,`population`,`latitude`까지 에러를 내야한다고 예상을 하지만, 실지 `name`,`capital`,`population` 만 에러를 내주고 있습니다.  

<img width="497" alt="Screen Shot 2021-12-09 at 11 39 15 PM" src="https://user-images.githubusercontent.com/26635607/145416707-46984f92-6bb4-47f0-8ea8-66061a40b0b5.png">

즉, 인터페이스는 유니온 타입 같은 복잡한 타입을 확장하지는 못합니다. 복잡한 타입의 확장을 원할 시, 타입과 `&`를 사용해야 합니다.

>참고  
타입은 인터페이스를 확장 가능하므로, 타입 정의시 인터페이스도 사용 가능 합니다.





#### 2. 인터페이스에는 유니온을 할 수가 없습니다. 유니온 타입만 가능합니다.

```typescript
type AorB = "a" | "b"; //✅ 타입 별칭에서만 가능, 
```


```typescript
type Input = {
  /* ... */
};
type Output = {
  /* ... */
};

type NamedVariable = (Input | Output) & { name: string }; //✅ 타입 별칭에서만 가능 
```

#### 3. 인터페이스에는 타입에 없는 보강(augment)이 가능합니다.

```typescript
interface State {
  name: string;
  capital: string;
}

interface State {
  population: number;
}
const wyoming: State = {
  name: 'Wyoming',
  capital: 'Cheyenne',
  population: 500_000
};  // ✅ OK


```
- 만약 `State` 를 type 별칭을 사용하였다면 에러를 냅니다.  

<img width="480" alt="Screen Shot 2021-12-10 at 12 18 57 AM" src="https://user-images.githubusercontent.com/26635607/145423801-56d0a4b8-c23c-4819-9df3-2b81e35c75c2.png">

- 같은 이름의 인터페이스를 사용하여 속성을 확장하는 것을 **선언 병합(declaration merging)** 이라고 합니다. 

- 인터페이스는 타입선언 파일 작성시 선언병합을 위해 사용 됩니다.

- 예) Array 인터페이스 
    tsconfig의   `"target": "ES5"` 일 경우,   
    - array 의 인터페이스는 lib.es5.ts 에 선언된 인터페이스가 사용됩니다.
   <img width="600" alt="Screen Shot 2021-12-10 at 12 27 52 AM" src="https://user-images.githubusercontent.com/26635607/145425401-640e9e4a-82fa-4764-9562-282bbbab114a.png"> 

    <img width="600" alt="Screen Shot 2021-12-10 at 1 09 11 AM" src="https://user-images.githubusercontent.com/26635607/145432782-2d97578a-32c3-4378-a2fd-1ccd281511c1.png">  


   tsconfig 파일내 `lib:["esnext"]` 추가시 lib.es.2015.d.ts 에 선언된 인터페이스가 병합됩니다.  
    
   <img width="600" alt="Screen Shot 2021-12-10 at 1 01 36 AM" src="https://user-images.githubusercontent.com/26635607/145431521-5267beea-6a37-47ae-9824-e6dc35ebc003.png">

   <img width="600" alt="Screen Shot 2021-12-10 at 1 05 49 AM" src="https://user-images.githubusercontent.com/26635607/145432217-66dbee31-7c6e-42bb-8779-d2257b608cd5.png">

   결과적으로 각 선언이 병합되어 전체 메서드를 가지는 Array를 갖게 됩니다.    


   
## 어떤 것을 사용해야 할까?

- 복잡한 타입 일 경우 :  

    ✔️ 타입 별칭 사용   

- 타입과 인터페이스 두가지 방법으로 표현할 수 있는 간단한 객체일 경우:  

    ✔️ 일관성과 보강의 관점에서 고려 할 필요가 있습니다.

- 스타일이 확립되지 않은 프로젝트인 경우 :  

    ✔️ API 에 대한 타입선언일 경우 인터페이스를 사용 합니다. (병합에 유용)  

    ✔️ 그러나 프로젝트 내부적으로 사용되는 타입에 선언 병합이 발생하는 것은 잘못된 설계 입니다❗️ -> 타입 사용 권고.


## 정리 

- 동일한 타입 시그니처를 가지는 여러개의 함수를 작성할 때는 매개변수의 타입과 반환타입을 반복해서 작성하는 것보다 함수전체의 타입선언을 적용해야 합니다.

- 타입과 인터페이스의 차이를 이해하고 프로젝트에서 어떤 문법을 사용할지 결정할 때 일관성과 보강기법을 고려해야합니다.


---
#### 참고자료

* [도서 - 댄 밴더캄, 이펙티브 타입스크립트, O'REILLY /프로그래밍 인사이트](https://blog.insightbook.co.kr/2021/06/10/%e3%80%8a%ec%9d%b4%ed%8e%99%ed%8b%b0%eb%b8%8c-%ed%83%80%ec%9e%85%ec%8a%a4%ed%81%ac%eb%a6%bd%ed%8a%b8-%eb%8f%99%ec%9e%91-%ec%9b%90%eb%a6%ac%ec%9d%98-%ec%9d%b4%ed%95%b4%ec%99%80-%ea%b5%ac%ec%b2%b4/)