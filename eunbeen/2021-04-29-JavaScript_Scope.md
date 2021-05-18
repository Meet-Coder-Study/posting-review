# JavaScript의 스코프

# 스코프란?

스코프(scope)는 변수와 상수, 매개변수가 언제 어디서 정의되는지 결정합니다. 예를 들어 함수 매개변수가 함수 바디 안에서만 존재하는 것도 스코프의 일종입니다.

```jsx
function f(x) {
	return x + 3;
}
f(5);
x;
```

위의 코드를 보면 `f(5)`를 통해 함수 `f`를 호출 하기 전까지는 `x`는 존재하지 않고 함수를 실행하는 동안만 존재 후 함수 바디를 벗어나면 `x`는 존재하지 않는 것처럼 보입니다. 

`x의 스코프가 함수 f`  

라고 부를 수 있습니다. 

🤔그럼, 변수가 스코프 안에 있지 않다면, 변수는 존재하지 않는 건가요?

→ 꼭 그런건 아닙니다! **스코프와 존재**를 반드시 구별해서 생각해야 합니다.

### 스코프와 존재

**스코프(가시성)**

- 현재 실행중인 부분, 즉 실행 컨텍스트(execution context)에서 보이고 접근 가능한 식별자

**존재**

- 식별자가 메모리가 할당된 무언가를 가리키고 있다는 뜻

    → JS는 무언가가 더는 존재하지 않는다고 해도 메모리 바로 회수하지 않습니다! 유지할 필요가 없다고 표시해 두면, 주기적으로 발생하는 가비지 콜렉션 프로세스에서 메모리를 회수합니다.

# JS의 정적 스코프

```jsx
const x = 3;

function f() {
	console.log(x);
	console.log(y);
}

{
	const y = 5;
	f();
}
```

JS의 스코프는 **정적**입니다. 

→ 즉, 어떤 변수가 함수 스코프 안에 있는지 함수를 **호출 할 때** 알 수 있는 것이 아닌 **정의할 때** 알 수 있습니다.

위의 코드를 보면 

- `x`는 함수 `f`를 정의 할 때 존재
- `y`는 함수 `f`를 정의 할 때 미 존재 → 다른 스코프에 존재
- 다른 스코프에서 `y` 선언 후 그 스코프에서 `f` 호출하더라도 `y`는 `f` 스코프에 미 존재

→ 함수 `f`는 자신이 정의 될 때 접근할 수 있었던 식별자에는 접근가능하지만, 호출할 떄 스코프에 있는 식별자에 접근 불가 = 정적 스코프

## 정적 스코프 종류

- 전역 스코프(global scope)
- 블록 스코프(block scope)
- 함수 스코프(function scope)

### 1. 전역 스코프(global scope)

전역 스코프는 **프로그램을 시작할 때 암시적으로 주어지는 스코프**입니다. 스코프는 계층적이며 트리의 **맨 아래에 바탕**이 되는 것이 전역 스코프 입니다. 

 JavaScript 프로그램을 시작할 때, 즉 어떤 함수도 호출하지 않았을때 실행 흐름은 전역 스코프에 있습니다.

전역 스코프에서 선언한 것(전역 변수)은 무엇이든 프로그램의 모든 스코프에서 볼 수 있습니다.

💥 하지만, 전역 스코프에 의존하는것은 피해야 합니다.

```jsx
let name = "Irena";
let age = 25;

function greet(){
	console.log(`Hello, ${name}!`);
}

function getBirthYear(){
	return new Date().getFullYear() - age;
}
```

이 코드의 문제는 함수가 호출하는 스코프에 의존적입니다. `greet`와 `getBirthYear`는 전역변수에 의존하고 있어 다른 함수에서 쉽게 변경이 가능합니다. 

```jsx
function greet(user){
	console.log(`Hello, ${user.name}!`);
}

function getBirthYear(user){
	return new Date().getFullYear() - user.age;
}
```

### 2. 블록 스코프(block scope)

블록 스코프는 **그 블록의 스코프에서만 보이는 식별자**를 의미합니다. 

```jsx
console.log('before block');
{
	console.log('inside block');
	const x = 3;
	console.log(x);
}
console.log(`outside block : x = ${x}`);
```

`x`는 블록 안에서 정의됐고, 블록을 나가는 즉시 `x`도 스코프 밖으로 사라지므로 마지막 줄에서 `ReferenceError`가 발생합니다.

💥 스코프가 **중첩**되면 **변수 숨김**이 발생해 혼란이 발생할 수 있습니다.

```jsx
//스코프 끝난 다음 스코프 오는 방식
{
	const x = 'blue';
	console.log(x);
}
console.log(typeof x);
{
	const x = 3;
	console.log(x);
}
console.log(typeof x);

//스코프가 중첩되는 방식
{
	let x = 'blue';
	console.log(x);
	{
		let x = 3;
		console.log(x);
	}
	console.log(3);
}
console.log(typeof x);
```

내부 블록의 `x`는 외부 블록에서 정의한 `x`와 다른 변수로 외부 스코프의 `x`를 숨기는 효과가 있습니다.

실행 흐름으로 보면, 

- 내부 블록에 들어가 새 변수 `x` 정의 → 두 변수가 모두 스코프 안에 존재
- 변수의 이름이 같으므로 외부 스코프에 있는 변수에 접근할 방법 없어짐

→ **변수를 숨기면 그 변수는 해당 이름으로는 절대 접근할 수 없습니다.**

🤔그럼, 스코프에 변수가 존재하는지 확인할 수 있는 방법이 있을까요?

스코프의 **계층적인 성격**으로 어떤 변수가 스코프에 존재하는지 확인하는 **스코프 체인**이 존재합니다. 스코프 체인에 존재하는 변수는 스코프에 있는 것이며, 숨겨지지 않았다면 접근 가능합니다.

### 3. 함수 스코프(function scope)

```jsx
globalFunc = function(){
	console.log(blockVar);
}
```

```jsx
let globalFunc; //정의되지 않은 전역 함수
{
	let blockVar = 'a'; //블록 스코프에 있는 변수
	globalFunc = function(){
		console.log(blockVar);
	}
}
globalFunc();
```

위의 코드는 `globalFunc`를 호출할 시 스코프에서 빠져 나왔음에도 `blockVar`에 접근이 가능합니다.

🤔 스코프 안에서 정의한 함수를 어떻게 스코프 밖에서 참조가 가능한가요?

→ 바로, **클로저(closure)**로 인해 참조가 가능합니다.
위의 예제에서는 블록 스코프와 부모인 전역 스코프가 클로저를 형성합니다.

### 클로저(closure)란?

> 클로저는 독립적인 (자유) 변수를 가리키는 함수이다. 또는, 클로저 안에 정의된 함수는 만들어진 환경을 ‘기억한다’. -MDN

함수가 특정 스코프에 접근할 수 있도록 의도적으로 그 스코프에서 정의하는 경우, 스코프를 함수 주변으로 좁히는 것입니다.

```jsx
let f;
{
	let o = {node : 'Safe'};
	f = function(){
		return o;
	}
}
let oRef = f();
oRef.note = "Not so safe after all!";
```

→ 함수는 클로저에 들어있는 식별자에 접근 가능합니다.

- 스코프 안에서 함수 정의 시 해당 스코프 더 오래 유지됩니다.
- 일반적으로 접근 불가한 것에 접근할 수 있는 효과 생깁니다.

# 출처

- Learning JavaScript 책 (이선 브라운 지음)
