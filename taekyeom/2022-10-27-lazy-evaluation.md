# 지연 평가(Lazy evaluation)

[함수형 프로그래밍과 ES6](https://www.youtube.com/watch?v=4sO0aWTd3yc) 영상을 그저께 부터 보고있습니다.

제가 기존의 알고 있는 상식들을 부수고? 발상의 전환? 같은 흥미로운 내용들이 많이 나와서 그 중 하나인 지연 평가를 이야기 드릴려고 합니다.

지연 평가는 계산의 결과 값이 필요할 때 까지 계산을 늦추는 기법입니다. 필요할 때까지 계산을 늦추어 불필요한 계산을 줄일 수 입니다.

## 장점

- 불필요한 계산을 하지 않으므로 빠른 계산이 가능합니다.
- 무한 자료 구조를 사용할 수 있습니다.
- 복잡한 수식에서 오류를 피할 수 있습니다.

## 동작 방식

### 엄격한 평가

```javascript
const arr = [0, 1, 2, 3, 4, 5];
const result = arr
  .map((num) => num + 10)
  .filter((num) => num % 2)
  .slice(0, 2);
console.log(result); // [11, 13]
```

엄격한 평가는 **평가 흐름이 왼쪽에서 오른쪽으로 흐릅니다.** 

아래의 도표를 보면 `map`, `filter`, `slice` 각각의 계산이 모두 종료되어야 다음 단계를 수행하는 것을 알 수 있습니다. 최종 결과물(`[11, 13]`)을 보면 `4`와 `5`에 대한 계싼을 불필요함을 알 수 있습니다.

![엄격한 평가](https://armadillo-dev.github.io/assets/images/strict-evaluation-process.png)

### 지연 평가

오른쪽 아래에서부터 왼쪽 위로 읽으면 됩니다. (사용된 함수는 뒤에 설명)

```javascript
const arr = [0, 1, 2, 3, 4, 5];
const result = _.take(2,                                                 
  L.filter((num) => num % 2,
  L.map((num) => num + 10, arr))
);
console.log(result); // [11, 13]
```

지연 평가는 **평가 흐름이 위에서 아래로 흐릅니다.** 

아래의 도표를 보면 배열의 각 원소들이 `map`, `filter`, `take` 함수를 차례대로 수행한다는 것을 알 수 있습니다. `3`까지 평가가 완료되었을 때 이미 원하는 결과가 나왔기 때문에 `4`와 `5`에 대한 계산은 하지 않습니다. 총 계산 횟수 10(map: 4, filter: 4, take: 2)

![지연 평가](https://armadillo-dev.github.io/assets/images/lazy-evaluation-process.png)

지연 평가는 연산 횟수 자체를 줄여서 보다 좋은 성능을 줍니다. 대상이 크면 클 수록 그 효과를 발휘할 수 있습니다.

## 지연 평가 활용 함수

`L` 객체 안에 각각의 함수들을 정의했습니다.

각각의 함수들이 Generator를 이용한 것을 볼 수 있습니다. Generator 함수를 호출하면 Generator 객체를 반환합니다. 

이 Generator 객체는 바로 내부 동작을 수행하지 않고 next 메서드를 호출할 때 비로소 연산을 수행합니다. 이러한 특징은 지연 평가를 가능하게 합니다.

```javascript
const L = {};

L.map = function* (f, iter) {
  for (let item of iter) {
    yield f(item);
  }
};

L.filter = function* (f, iter) {
  for (let item of iter) {
    if (f(item)) yield item;
  }
};

L.take = function* (limit, iter) {
  for (let item of iter) {
    yield item;
    if (!--limit) break;
  }
};
```

```javascript
const arr = [0, 1, 2, 3, 4, 5];
const result = _.take(2,                                                    
  L.filter((num) => num % 2,
  L.map((num) => num + 10, arr))
);
console.log(result); // [11, 13]
```

[함수형 프로그래밍과 ES6](https://www.youtube.com/watch?v=4sO0aWTd3yc)

[[Javascript] 지연 평가(Lazy evaluation) 를 이용한 성능 개선](https://armadillo-dev.github.io/javascript/whit-is-lazy-evaluation/)

[[Javascript] Generator 이해하기](https://armadillo-dev.github.io/javascript/what-is-generator/)

[[Javascript] Iterable과 Iterator 이해하기](https://armadillo-dev.github.io/javascript/what-is-iterable-and-iterator/)

