> 타입스크립트의 필요성은 협업을 하는 프로젝트에서 거의 필수로 사용될 만큼 중요도도 높아졌습니다.
> 최근에 타입스크립트를 공부하게 되었는데 공부하다가 가장 이해하기 까다로웠던 generic에 대해 정리해 보고자 합니다.

### 제네릭의 형태

- 아래 코드는 타입스크립트 오픈소스에서 쉽게 볼 수 있는 코드입니다. 타입스크립트 입문자가 보게 되면 외계어를 보는 듯한 기분이 듭니다.
- 이 코드는 마지막에 다시 보고 해석해 보도록 하겠습니다.

```ts
// https://github.com/reduxjs/redux/blob/master/src/compose.ts
type Func<T extends any[], R> = (...a: T) => R

export default function compose<A, T extends any[], R>(
  f1: (a: A) => R,
  f2: Func<T, A>
): Func<T, R>

export default function compose(...funcs: Function[]) {
  if (funcs.length === 0) {
    return <T>(arg: T) => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args: any) => a(b(...args)))
}
```

### 제네릭이란?

함수나 클래스를 선언할 때 타입을 고정하지 않고, 사용할 때 명시해 타입을 유연하게 사용할 수 있게 하는 타입입니다.

> `any vs generic?`
- 제네릭과 함께 any도 유연한 타입에 속합니다. 하지만 any로 타입을 정의하면 어떤 값이든 올 수 있어 안정성이 떨어집니다. (들어오는 값에 따라 타입 추론을 하기 때문입니다.)
- any처럼 유연하게 여러 타입을 받으면서 안정성을 지키고 싶을 때 제네릭을 사용합니다.

### 제네릭의 특징

- 타입이 고정되는 것을 방지하고 재사용 가능한 요소를 선언할 수 있습니다.
- 타입 검사를 컴파일 시간에 진행함으로써 타입 안정성을 보장합니다.
- 캐스팅 관련 코드를 제거할 수 있습니다.
- 제네릭 로직을 이용해 타입을 다르게 받을 수 있는 재사용 코드를 만들 수 있습니다.

```ts
캐스팅에 대해 주의해야 할 점
- 캐스팅은 이미 선언된 타입이 런타임에서 변하는 것을 말합니다. Number, String, Boolean과 같은 래퍼 객체가 있습니다.
- <Type>과 as Type과 같은 형태는 타입 캐스팅이 아니라 타입 단언입니다.
- 위의 타입 단언은 런타임에 영향을 미치지 않고 컴파일타임에만 영향을 미칩니다.
```

### 호출할 때 정하는 타입: 타입 매개변수

- 아래는 `제네릭 함수`입니다. 함수 인자와 반환값 타입을 선언할 때 `타입 매개변수인 <T>`를 사용하면 호출할 때 타입을 넣어 결정할 수 있습니다.
- 호출 시 타입 매개변수를 생략하면 타입을 추론하여 실행됩니다.
- 타입 매개변수를 입력하고 다른 타입을 인자로 넣으면 타입 에러가 발생하게 됩니다.

```js
// 선언 시
function concat<T>(str1: T, str2: T): T[] {
  return [strs, str2];
}
// 호출 시
const strArr = concat<string>('aaa', 'str');
const numArr = concat<number>(123, 456);
```

### 바운드 타입 매개변수

- `<T>`는 어떤 타입이든 받아들이기 때문에 타입을 몇 가지로 제한해서 사용할 수 있습니다. 이를 `바운드 타입 매개변수`라고 부르고 아래와 같은 형태를 가지고 있습니다.

```ts
<T extends string> // string 타입을 상속받아 타입 제약
<T extends string | number> // union 타입으로 여러 타입으로 제약 가능
```

- 바운드 타입 매개변수로 문자열을 더하는 함수를 만들었습니다. 하지만 이 코드는 `컴파일 에러`가 발생합니다. 바운드 타입 매개변수끼리는 연산 진행이 불가능하기 때문입니다.
- 연산을 하려면 `오버로드 함수`로 제네릭 함수를 유연하게 만들어야 합니다. **하나의 함수에는 제네릭 함수를, 또 다른 함수에는 any 타입**을 적어 줍니다. 이렇게 하면 연산을 할 때는 any 타입으로, 제네릭 함수로 타입을 받아들여 사용 가능해 집니다.

```ts
// 에러
function concat<T extends string>(str1: T, str2: T): T {
  return str1 + str2;
}

// 오버로드
function concat<T extends string>(str1: T, str2: T): T;
function concat(str1: any, str2: any) {
  return str1 + str2;
}
```

### 여러 개의 타입 매개변수

- `<T>`와 같이 하나의 타입으로 여러 타입을 받게 되면 바운드 타입 매개변수로는 처리할 수 없습니다. 그래서 `<T1, T2>`와 같이 여러 개의 타입 매개변수를 선언할 수 있습니다.
- 아래 함수와 같이 여러 인자를 받을 때 타입을 분리시켜 받을 때 유용하게 쓰입니다.

```ts
function put<T1, T2>(arg1: T1, arg2: T2): T1;
function put(idx: any, str: any) {
    let arr = [];
    arr[idx] = str;
};

put<number, string>(1, 'hello');
```

### 오픈소스 코드 다시보기

- 그럼 이제 처음에 봤던 코드를 다시 보며 해석해 봅시다.
1. 바운드 타입 매개변수 T와 타입 매개변수인 R을 매개변수로 하는 타입 `Func`가 정의되었습니다. Func는 `T타입(any배열)`을 인자로 받고 `R타입`으로 결과를 리턴하는 함수입니다.
- 이 코드는 아래에서 반복적으로 사용하게 됩니다.

```ts
type Func<T extends any[], R> = (...a: T) => R
```

2. 실제 소스에서는 `compose`라는 함수가 오버로드되어 여러 형태의 타입이 정의되어 있고, 가장 마지막에 사용하는 코드가 작성되어 있습니다. 아래는 타입을 제네릭으로 정의한 것 중 하나입니다.

- compose는 `A, T, R` 이라는 3개의 타입 매개변수를 가집니다.
- 인자는 두 개의 함수입니다.
    - `f1`: A를 인자로 받아 R로 리턴
    - `f2`: 위의 Func에 타입을 compose의 T, A타입으로 설정
- `반환값`은 Func에 타입을 T, R로 설정하게 됩니다.

```ts
export default function compose<A, T extends any[], R>(
  f1: (a: A) => R,
  f2: Func<T, A>
): Func<T, R>
```

3. compose `함수의 연산`이 있는 부분입니다. 여기에서는 인자를 Function[](함수 배열)로 정하고 함수를 오른쪽에서 왼쪽으로 조합시키는 역할을 합니다.

> 실제 리액트에서 사용할 때는 미들웨어와 개발자도구 등 패키지를 합쳐서 스토어로 만들려고 할 때 사용하고 있습니다.

```ts
export default function compose(...funcs: Function[]) {
  if (funcs.length === 0) {
    return <T>(arg: T) => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args: any) => a(b(...args)))
}

// 사용할 때
compose(applyMiddleware(thunk), DevTools.instrument())
```

### 참고

- [타입스크립트 퀵스타트](http://www.yes24.com/Product/Goods/59719961)
- [TypeScript: 타입 추론과 타입 단언](https://hyunseob.github.io/2017/12/12/typescript-type-inteference-and-type-assertion/)
