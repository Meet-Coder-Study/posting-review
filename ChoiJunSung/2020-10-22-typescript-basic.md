# Typescript 개념/프로젝트 만들기

Javascript 와 React 를 사용하면서 요즘은 거의 필수적으로 사용하고 있는 Typescript 의 기본 개념에 대해 학습해봤다.  
요즘은 Javascript 만으로 서비스를 만드는 회사는 드물다. 특히 규모가 큰 서비스일수록 Typescript 를 도입하는 경우가 많다.  

![typescript-rate](https://user-images.githubusercontent.com/35620465/96745619-4cbe6100-1401-11eb-96a8-15172f707687.png)

![typescript-usage](https://user-images.githubusercontent.com/35620465/96745554-37493700-1401-11eb-9230-f5d5d2b7b76f.png)

출처 : https://trends.google.com/trends/explore?date=today%205-y&geo=US&q=typescript

## Typescript 를 왜 쓸까?

Javascript 는 쉽고 진입작병이 낮고, 유연한 데이터 타입을 갖고 있다는 점이 장점이지 않을까 싶다.  
그러다 이 장점은 규모가 큰 서비스에서, 혹은 많은 개발자들과 협업을 해야하는 환경에서라면 단점이 될 수도 있다.

1. Javascript 는 어떤 데이터 타입이 들어올지 보장받지 못한다.
    - 예를 들어, React 프로젝트에서는 수많은 state 와 props 를 관리하게 된다. 그런데 이 state 와 props 들이 어떤 데이터인 줄 알고 그에 맞게 렌더링을 해줄 수 있을까? 에러 없이 항상 원하는대로 데이터들이 렌더링 된다고 보장받을 수 있을까?
2. Javascript 는 컴파일 단계에서 에러를 잡아내지 못한다.
    - 예를 들어, Javascript 는 존재하지 않는 프로퍼티에 접근도 가능하게 한다.
    ```javascript
    const myObj = {
      tomato: 123
    }
    myObj.potato
    ```
    라고 코드를 작성해보면 undefined 가 나오지, 에러를 표출하지는 않는다. Typescript 는 코드가 실행되기 전인 컴파일 중에 이러한 오류를 잡아줄 수 있다.

Typescript 를 [playground](https://www.typescriptlang.org/play) 라는 사이트에서 사용해보았다.

## Typescript 타입 지정

### 암시적 타입 지정
```javascript
let age = 10
age = false
```
로 작성했 을 경우 javascript 에서는 에러가 발생하지 않는다.  
하지만 Typescript 에서는 아래와 같이 빨간줄이 뜨는것을 볼 수 있다.

![error](https://user-images.githubusercontent.com/35620465/96749811-3f57a580-1406-11eb-9212-56da53249521.png)

![error](https://user-images.githubusercontent.com/35620465/96749900-5d250a80-1406-11eb-928f-9e6e7e09af1d.png)

첫째 줄에서 age 변수는 10으로 대입되면서 number 타입이 지정되었는데 이후에 false 라는 boolean 값을 대입하러고 하니 타입이 맞지 않는다는 에러가 발생한다.

### 명시적 타입 지정

```javascript
let age: number = 10;
age = false;
```

명시적 타입 지정은 위와 같이 작성할 수 있다. 마찬가지로 age 에 boolean 값을 대입하려고 하면 에러가 발생할 것 이다.

### 객체 타입 지정

객체 타입을 지정하는 방법으로 type 키워드를 사용한 type alias 방법, interface 키워드를 사용한 방법 2가지가 있다.

```typescript
type Foo = {
    age: number;
    name: string;
}

const foo: Foo = {
    age: 10,
    name: "Kim",
}

type Age = number;

interface Bar {
    age: Age;
    name: string;
}

const bar: Bar = {
    age: 10,
    name: "Kim",
};
```

이렇게 Typescript 의 기본 사용방법에 대해 알아봤다.  
이번 내용은 정말 Typescript 의 빙산의 일각이고, 이를 React 앱에서 활용하면 무궁무진하게 사용할 수 있는데, 다음 시간에 추가로 다뤄볼 예정이다.

#### 참고
1. https://typescript-kr.github.io/  
2. https://www.typescriptlang.org/play
