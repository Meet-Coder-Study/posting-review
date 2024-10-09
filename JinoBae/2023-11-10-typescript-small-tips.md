// https://blex.me/@baealex/typescript-small-tips

#### 1. 최소/필수 타입 선언

###### 불필요한 선언을 줄이자

타입스크립트를 사용하며 타입 선언을 할 때 컴파일러가 타입 추론이 가능하다면 굳이 선언을 해줄 필요가 없다. 재사용되는 객체나 함수 구문에는 타입을 작성하는 것이 좋으며 초기값이 할당되는 원자값이나, 타입 추론이 가능한 값을 할당하거나, 인스턴스를 생성할 때 객체의 타입은 불필요하다.

```ts
// bad
const person = {
	name: 'Alex',
}

// good
const person: Person = {
	name: 'Alex',
}
```

```ts
// bad
const person: Person = new Person('Alex')
const personName: string = person.name
const hasPet: bool = true
const petAge: number = 2

// good
const person = new Person('Alex')
const personName = person.name
const hasPet = true
const petAge = 2
```

###### 함수의 반환 타입은 구체적으로 명시

객체를 반환할 때는 타입이 추론되는 상태로 반환되게 만들거나 함수의 반환 타입을 명시하시는 것이 좋다. 타입스크립트가 임의로 추론하는 객체로 반환되면 함수를 사용하는 사용자가 혼란을 겪을 수 있다. 함수의 반환 타입을 명시하면 함수 작성 및 수정시 실수할 수 있는 부분을 미리 잡아주는 효과도 있다,
```ts
// bad
function findPerson(id: number) {
	const { name } = PersonRepository.findById(id)
	return { name } // Typescript infers ReturnType is { name: string; }
}

// not bad
function findPerson(id: number) {
	const person = PersonRepository.findById(id)
	return person // Typescript infers ReturnType is Person
}

// good
function findPerson(id: number): Person {
	const { name } = PersonRepository.findById(id)
	return { name } // Typescript infers ReturnType is Person
}
```

###### 함수 표현식으로 타입 재사용

불필요한 타이핑을 줄이기 위해선 함수 선언식 보다는 함수 표현식을 사용하는게 좋다. 특히 함수의 타입이 재사용 될 때 유용할 수 있다.

```ts
// bad
function findPerson(name: string): Person {
    return PersonRepository.findByName(name)
}
function findProgrammerPerson(name: string): Person {
    ...
}

// good
type FindPerson = (name: string) => Person

const findPerson: FindPerson = (name) => PersonRepository.findByName(name)
const findProgrammerPerson: FindPerson = (name) => ...
```

<br>

#### 2. 객체의 키 순회

종종 키를 `Object.keys`를 사용해서 불러올 때 타입 오류가 발생한다. (구버전 타입스크립트의 경우에는 해당하지 않는다.) 이런 상황에서는 타입 단언(as)이나 any를 사용하기 보다는 `for in`을 사용하면 타입 오류 없이 처리 가능하다.

```ts
// compile failed
function recordToText<T extends object>(record: T) {
	// Error: No index signature with a parameter of type 'string' was found on type '{}'
	return Object.keys(record).map(key => `${key}: ${record[key]}`).join(', ')
}

// compile success
function recordToText<T extends object>(record: T) {
	const texts: string[] = []

	for (const key in record) {
		if (record[key] === undefined) {
			continue
		}
		texts.push(`${key}: ${String(record[key])}`)
	}
	return texts.join(', ')
}
```

<br>

#### 3. 같은 배열 다른 타입

예를 들어 아래와 같은 타입이 존재한다고 가정하자.

```ts
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string
}

interface Cat extends Animal {
  furColor: string
}

type Pet = Dog | Cat
```

요구사항에 의해 한 배열에 Dog과 Cat이 합성된 Pet이 한 배열로 존재할 때 현재 상황에선 코드를 작성할 때 타입과 관련된 문제를 겪게된다.

```ts
const { pets } = response.data // pets is Pet[]

pets.map(pet => {
  if (pet.breed) { // Error: Property 'breed' does not exist on type 'Cat'
    
  }
})
```

그래서 타입 단언을 통해서 값을 추론하게 만드는 경우가 있는데 그것보다는 아래와 같이 각 인터페이스에 해당 타입을 명확히 판별할 수 있는 구분값을 넣어준다. 이러면 코드를 작성할 때 구분값을 분기해주면 타입스크립트가 손쉽게 타입을 추론할 수 있다.

```ts
interface Animal {
  name: string
}

interface Dog extends Animal {
  type: 'dog' // +
  breed: string
}

interface Cat extends Animal {
  type: 'cat' // +
  furColor: string
}

type Pet = Dog | Cat;
```

```ts
const { pets } = response.data // pets is Pet[]

pets.map(pet => {
	if (pet.type === 'dog') {
		// Typescript infers pet: Dog
	}
	if (pet.type === 'cat') {
		// Typescript infers pet: Cat
	}
})
```

<br>

#### 4. any... 🤬

any 타입 체계를 무력화시키고, 다른 개발자의 타입 추론을 어렵게 만들어 개발을 방해하는 아주 나쁜 요소가 될 수 있다. 따라서 가능한 any를 사용하지 않는 것이 좋으며, *정말* **굳이** ***반드시*** 사용해야 한다면 아래 방안을 권장한다.

###### 가능한 최소한으로 제한하기

any가 들어가야 할 부분을 최소화한다. 예를들어 배열이라면 아래와 같이 작성할 수 있다.

```ts
// horrible
const x: any = [1, 'x', false]

// bad
const x: any[] = [1, 'x', false]
```

객체 형태인데 키 값은 타입을 구분할 수 있다면 아래와 같이 작성할 수 있다.

```ts
// horrible
const map: any = {
	a: { x: 1, y: 2 },
	b: false
}

// bad
const map: { [key: string]: any } = {
	a: { x: 1, y: 2 },
	b: false
}

// or
const map: Record<string, any> = {
	a: { x: 1, y: 2 },
	b: false
}
```

추론이 가능한 영역은 최대한 타입을 작성해주고 그 외에 부분에서만 사용하자.

###### 타입스크립트가 추론하도록 두기

타입이 없는 객체를 선언할 때 any를 사용하는 경우가 있는데 객체에 키가 더 이상 추가되지 않는다면 이 경우에는 차라리 타입스크립트가 객체의 구조를 추론하도록 두는 것이 좋다.

```ts
// bad
const option: any = {
	someOption1: '1',
	someOption2: '2',
	someOption3: '3',
}

// good
const option = {
	someOption1: '1',
	someOption2: '2',
	someOption3: '3',
}
```

추론이라도 가능하게 두는 경우 같은 코드 레벨에서 만큼은 option의 타입을 재사용 가능하고 다른 개발자도 추론된 타입에서 변경이 발생하지 않는다는 것을 인지할 수 있다.

```ts
type MergeOption = (otherOption: Partial<typeof option>) => typeof option

const mergeOption: MergeOption = (otherOption) => ({
	...option,
	...otherOption
})
```

###### 여러 타입의 원자값이 매개변수 일 때

이 경우에는 any를 사용하더라도 최대한 추론이 가능한 상황에서는 추론할 수 있도록 만들어주는 것이 좋다. 이 상황에서는 함수 오버로딩이나 제네릭 타입을 사용할 수 있다.

```ts
// horrible
const double = (x: any) => x + x

// not bad
function double(x: number): number
function double(x: string): string
function double(x) { return x + x }

// good
function double<T extends number | string>(x: T): T extends string ? string : number
function double(x) { return x + x }
```

<br>

#### 5. 안전한 타입 단언

내가 타입스크립트를 좋아하는 이유는 실수를 사전에 방지할 수 있기 때문인데, 위 항목에서 다뤘던 any나
지금 다룰 타입 단언은 이러한 실수 방지를 어렵게 만든다 😮‍💨 타입 단언은 타입스크립트가 타입을 제대로 인지하지 못하는 (개발자가 더 정확한 타입을 알고 있는) 순간에만 일시적, 제한적으로 사용해야 한다.

종종 상황에 따라서 특정 값의 타입을 예측하기 어려운 경우가 발생할 수 있는데, 이때 타입 단언을 간단하게 해버릴 수 있지만, 해당 값을 신뢰하기 어렵다면 (모든 입출력은 의심부터 해야한다.) 타입 가드를 통해 타입을 할당하여 다른 개발자에게 해당 타입을 검증했다고 전파해 주는 것이 좋다.

```ts
// If we have horroble base code like this.
const getCommentsSomewhere = (): any => {
	try {
		// ...complex logic
	} catch(e) {
		// ...complex logic
	}
}

// bad
const comments = getCommentsSomewhere() as CommentState[]

// good
class Comment {
	static isComment(comment: CommentState) {
		return (
			typeof comment.id === number &&
			typeof comment.content === string
		)
	}

	static isCommentArray(comments: CommentState[]) {
		if (Array.isArray(comments) && comments.every(Comment.isComment)) {
			return comments
		}
		return null
	}
}

const comments = Comment.isCommentArray(getCommentsSomewhere())
if (comments) {
	// comments is safe
}
```

물론 각 방식의 장단점이 있다.

**타입 가드 사용시**
- 장점:
  - 런타임에서 코드가 안전하게 동작
- 단점:
  - 코드가 더 복잡해짐
  - 타입 체크에 연산이 발생함

**타입 단언 사용시**
- 장점:
  - 코드가 간단하고 직관적
- 단점:
  - 타입 안정성이 상대적으로 낮음
  - 런타임에서 문제 발생 여지가 있음

타입이 너무나도 명확한 상황에서는 불필요하게 연산이 이뤄지는 셈이니 무분멸한 사용은 권장하지 않는다. 애초에 타입 단언이 이뤄져야 하는 상황을 최소화 하는 것이 중요하다. (DOM을 조작하는 것은 논외로 한다.) 하지만 그것이 불가능한 상황에서 정말 안전하게 타입을 확인해야 할 때는 위에서 작성한 타입 가드를 고려해 볼만하다.