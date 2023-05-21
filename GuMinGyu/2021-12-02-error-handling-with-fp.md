---
title: Functional Programming에서 error handling 하는 법
author: mingyu.gu
date: 2021.12.02
---

# Functional Programming에서 error handling 하는 법

저번 포스팅에서 `스칼라로 배우는 함수형 프로그래밍` 책을 읽고 있다고 말씀드렸는데, 이번 포스팅은 연장되는 내용으로 책을 기반으로 적어보았습니다.
함수형 프로그래밍은 순수함수를 조합하여 프로그램을 만드는 것을 말합니다. 그런데 일반적으로 사용하는 예외처리, 비동기 구문등은 모두 부수효과가 발생하는데 어떻게 함수형 프로그래밍을 할 수 있을까요? 이번에는 부수효과가 발생하는 예외처리 함수를 순수함수로 변환하는 방법들을 소개하겠습니다.
**결론부터 말씀드리면 예외를 이용하지 않고 오류처리를 합니다.**

## 부수효과를 일으키는 예외

먼저 흔히 사용하는 예외가 순수하지 않다는 것을 설명드리겠습니다.

순수함수는 입력에 대해 항상 같은 값을 반환하고 그 이외의 일을 하지 않는 것을 말합니다. 순수함수의 이러한 개념을 **참조 투명성**이라는 개념을 이용해서 공식화 할 수 있습니다. 예로들자면 값 2와 3에 순수함수 + 를 적용한다면 여기에는 부수효과가 없고 표현식의 평가는 항상 5라는 같은 결과를 냅니다. 실제로 프로그램에 있는 모든 2 + 3을 값 5로 바꾸어도 프로그램은 전혀 바뀌지 않습니다. 이를 참조 투명성이라고 부릅니다.

```scala
def failingFn(i: Int): Int = {
  val y: Int = throw new Exception("fail!")
  try {
    val x = 42 + 5
    x + y
  }
  catch { case e: Exception => 43 }
}
```

위의 함수는 예상하듯히 오류가 발생합니다.

```bash
> failingFn(12)
java.lang.Exception: fail!
  at .failingFn(<console>:8)
```

y가 참조에 투명하지 않기 위해서는 x + y의 y를 throw new Exception("fail!")로 치환하면 그전과는 다른 결과가 나와야 합니다.

```scala
def failingFn2(i: Int): Int = {
  try {
    val x = 42 + 5
    x + ((throw new Exception("fail!")): Int)
  }
  catch { case e: Exception => 43 }
}
```

```bash
> failingFn(12)
res1: Int = 43
```

결과에서 보듯히 결과가 다릅니다. 예외를 잡아서 43을 돌려주는 try 블록안에서 예외가 발생하기 때문입니다. 따라서 failingFn은 참조 투명성이 깨졌고 순수함수가 아니게 됩니다.

위 함수의 문제 두 가지는

- **예외는 참조 투명성을 위반하고 문맥 의존성을 도입한다.** 따라서 치환 모형의 간단한 추론이 불가능해지고 예외에 기초한 혼란스러운 코드가 만들어진다.
- **예외는 형식에 안전하지 않다.** failingFn의 형식인 `Int => Int`만 보고는 이 함수가 예외를 던질 수 있다는 사실을 전혀 알 수 없으며, 그래서 컴파일러는 failingFn의 호출자에게 그 예외들을 처리하는 방식을 결정하라고 강제할 수 없다.

이런 단점들이 없으면서도 예외의 기본 장점인 오류 처리의 통합과 중앙집중화를 유지하는(오류 처리 논리를 코드 기반의 여기저기에 널어 놓지 않아도 되도록) 대안이 있으면 좋을 것 입니다. 지금부터 소개하는 대안 기법은 "예외를 던지는 대신, 예외적인 조건이 발생했음을 뜻하는 값을 돌려준다"라는 오래된 착안에 기초합니다. 이 전략은 형식에 완전히 안전하며, 실수를 미리 발견할 수 있습니다.

## Either 자료 형식

해법은 함수가 항상 답을 내지는 못한다는 점을 반환 형식을 통해 명시적으로 표현하는 것입니다. 실패와 예외를 보통의 값으로 표현하고 오류처리 및 복구에 대한 공통의 패턴을 추상화하는 함수를 만들어 보겠습니다.

scala에서는 이를 Option과 Either로 구현을 하는데 Either가 더 많이 사용되므로 Either를 설명하겠습니다. Option은 실패 시 유효한 값이 없음을 뜻하는 None을 돌려주고, Either는 성공 또는 실패를 나타낼 때 Right 생성자를 성공을 나타내는데 사용하고 Left는 실패에 사용합니다.

다음의 예제를 보면 실패의 경우 String을 돌려줍니다. 이로써 어디서 에러가 발생했는지 추적할 수 있습니다.

```scala
def mean(xs: IndexedSeq[Double]): Either[String, Double] =
  if (xs.isEmpty)
    Left("mean of empty list!")
  else
    Right(xs.sum / xs.length)
```

윗 함수처럼 오류에 대한 추가정보, 이를테면 소스코드에서 오류가 발생한 위치를 알 수 있는 스택 추적 정보가 있어 편리한 경우가 있는데, 이를위해 Either의 Left 쪽에서 그냥 예외를 돌려주면 됩니다.

```scala
def safeDiv(x: Int, y: Int): Either[Exception, Int] =
  try Right(x / y)
  catch { case e: Exception => Left(e) }
```

## TypeScript에서 맛보기

제가 직접 Either를 구현해보면 좋겠지만 ㅎ.ㅎ fp-ts 라이브러리를 이용해서 간단하게 password validation 로직을 구현해보겠습니다.

```ts
import { Either, left, right } from 'fp-ts/Either'

const minLength = (s: string): Either<string, string> =>
  s.length >= 6 ? right(s) : left('at least 6 characters')

const oneCapital = (s: string): Either<string, string> =>
  /[A-Z]/g.test(s) ? right(s) : left('at least one capital letter')

const oneNumber = (s: string): Either<string, string> =>
  /[0-9]/g.test(s) ? right(s) : left('at least one number')
```

```ts
console.log(validatePassword('ab'))
// => { _tag: 'Left', left: 'at least 6 characters' }

console.log(validatePassword('abcdef'))
// => { _tag: 'Left', left: 'at least one capital letter' }

console.log(validatePassword('Abcdef'))
// => { _tag: 'Left', left: 'at least one number' }
```

pipe는 함수형 프로그래밍에서 연속된 함수를 실행시키는 함수이고, chain은 Either를 승급시켜주는 함수입니다.

```ts
import { chain } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

const validatePassword = (s: string): Either<string, string> =>
  pipe(
    minLength(s),
    chain(oneCapital),
    chain(oneNumber)
  )

console.log(validatePassword("123FF456"))
// => { _tag: 'Right', right: '123FF456' }
```


## 요약​

예외를 사용할 때의 문제점 몇 가지를 지적하고 순수 함수적 오류 처리의 기본 원리를 소개했습니다. 예외를 보통의 값으로 표현하고 고차 함수를 이용해서 오류처리 및 전파의 공통 패턴들을 캡슐화합니다.

위의 방법을 이용하면, 예외는 정말로 복구 불가능한 조건에서만 사용하면 됩니다.
