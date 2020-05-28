# 자바스크립트 코딩의 기술(시리즈 1 - 변수 할당으로 의도를 표현하라)

- 자바스크립크 코딩의 기술 책을 읽고 복습 겸 정리하는 포스팅이다.
- 시리즈 1이 시작이며 시리즈 몇까지는 갈지는 진행하면서 가늠잡아 보겠다.

## `const`로 변하지 않는 값을 표현하라(TIP1)

- 과거에는 `var`만 사용하여 변수에 할당했으나 현재는 `let, const`를 사용하여 할당한다.
- `const`는 재할당 할 수 없는 변수 선언입니다. 즉, 한 번 선언하면 변경할 수 없다.
- 하지만, 값이 변경되지 않는 것, 즉 불변값이 되는 것이 아니다.
- `const`를 사용해 객체(배열)을 할당하고 객체의 프로퍼티(배열의 경우 요소)을 바꿀 수 있다.
  - 이는 const 변수의 타입이 객체(배열도 마찬가지)인 경우, 객체에 대한 참조를 변경하지 못한다는 것을 의미한다. 하지만 이때 객체의 프로퍼티는 보호되지 않는다. 다시 말하자면 재할당은 불가능하지만 할당된 객체의 내용(프로퍼티의 추가, 삭제, 프로퍼티 값의 변경)은 변경할 수 있다.(참고 - https://poiemaweb.com/es6-block-scope#23-const%EC%99%80-%EA%B0%9D%EC%B2%B4)
- `const`를 잘 사용하여 의도를 나타낼 수 있으면 코드를 훑어볼 때 해당 변수를 신경 쓰지 않아도 된다고 알려 줄 수 있다.

```javascript
const name = "duckhee";
// 100줄 코딩
return `당신의 이름은 ${name}입니다.`;

var name = "duckhee";
// 100줄 코딩
return `당신의 이름은 ${name}입니다.`;
```

- `const`와 `var`를 사용한 코드로 비교해보자.
- `const`를 사용한 코드는 가운데 100줄 코딩의 내용과 상관없이 반환되는 값을 정확히 알수 있다.
- 반면에 `var`를 사용한 코드는 가운데 100줄 사이에서 `name = 'babo'`라는 코드가 있을 경우 재할당이 가능해지므로 반환되는 값을 확신 할 수 없다.

- `const` 사용시 주의사항이 있습니다. 위에서 말한 불변성에 대한 내용이다.
- `const`에 할당된 값이 불변값이 되지는 않는다는 것이다. 즉, 변수를 재할당할 수 있는 없지만, 값을 바꿀 수는 있다. 모순되는 말처럼 들리겠지만 다음 코드를 살펴보자.

```javascript
const discountable = [];
// 100줄 코딩
for (let i = 0; i < cart.length; i++) {
  if (cart[i].discountable) {
    discountable.push(cart[i]);
  }
}
```

- 위 코드는 정상적으로 작동이 됩니다. 이러한 특성은 앞에 `var` 와 같은 문제를 만들어 낸다.
- 어떤 값을 반환하는지 확신 할 수 없다.
- `조작(mutation)`을 피하고 아래와 같이 작성한다.

```javascript
const discoutable = cart.filter((item) => item.discountAvailable);
```

## `let`과 `const`로 유효 범위 충돌을 줄여라(TIP2)

- `const`를 우선 사용하고 만약 재할당이 필요한 경우 `let`를 사용하자.
- `var`와 `let`는 유사하다.
- 차이점은 `var`는 어휘적 유효 범위(lexical scope)를 가지는 반면 `let`은 블록 유효 범위(block scope)를 가지고 있다.
- 간단히 정리하면 if, for 같은 블록의 내부에만 존재하는 것이 블록 유효 범위 변수(`let`) 블록 밖에서는 접근 불가 합니다. 즉, `{}`를 벗어나면 변수가 존재하지 않는다.

- 아래 예제를 통해 살펴보자.

```javascript
function getLowestPrice(item) {
  var count = item.inventory; // 아이템 재고
  var price = item.price; // 아이템 정상가
  // 할인중일때
  if (item.salePrice) {
    var count = item.saleInventory; // 할인중인 아이템 재고
    // 할인중인 아이템 재고가 있을때
    if (count > 0) {
      price = item.salePrice; //아이템 할인중인 가격을 기존 아이템 정상가인 price에 할당
    }
  }
  if (count) {
    return price;
  }
  return 0;
}
```

- 어떤 상품이 할인 중이 아니고 재고도 없는 경우에는 `item.salePrice`, `count` 조건문을 건너뛰고 0을 반환합니다.
- 할인 중이고 할인 상품의 재고가 있는 경우에는 할인 가격을 반환
- 할인 중이고 할인 상품 재고가 없는 경우에는 정상가격을 반환해야 하지만 0을 반환합니다.

```javascript
function getLowestPrice(item) {
  let count = item.inventory; // 아이템 재고 --> const count로 하면 더 좋다.
  let price = item.price; // 아이템 정상가
  // 할인중일때
  if (item.salePrice) {
    let count = item.saleInventory; // 할인중인 아이템 재고 --> const saleCount 이름을 변경하면 더 좋다.
    // 할인중인 아이템 재고가 있을때
    if (count > 0) {
      price = item.salePrice; //아이템 할인중인 가격을 기존 아이템 정상가인 price에 할당
    }
  }
  if (count) {
    return price;
  }
  return 0;
}
```

- 위와 같이 `var`를 `let`으로 변경하면 `if (item.salePrice)` 안에서 할당받은 `let` 변수들은 블록 범위에서만 존재하므로 블록 밖에 있는 `let price = item.price; // 아이템 정상가`를 사용할 수 있다.

- `var`의 단점에 대한 포스팅 참조 : <https://www.daleseo.com/js-var-issues/>

## 블록 유효 범위 변수로 정보를 격리하라(TIP3)

- **블록 유효 범위 변수**를 선언하면 블록 안에서만 접급이 되고 밖에서는 접근 불가이다.
- 반면에, **블록 밖에서 선언된 변수**는 블록안에서 접근이 가능하다.
- **어휘적 유효 범위 변수**를 선언하면 함수 내부 어디서든 접근이 가능하다.(호이스팅 참조)

```javascript
<body>
  <ul>
    <li>클릭하면 0 기대</li>
    <li>클릭하면 1 기대</li>
    <li>클릭하면 2 기대</li>
  </ul>
</body>;
const items = document.querySelectorAll("li");
for (var i = 0; i < items.length; i++) {
  items[i].addEventListener("click", () => {
    alert(i);
  });
}
```

- 클릭하면 0,1,2를 기대하는데 실제로 실행해보면 3만 나온다.
- 자바스크립트 변수를 할당하는 방법과 관련이 있다. 이러한 문제는 평범한 자바스크립트 코드에서도 발생할 수 있다.

```javascript
function addClick(items) {
  for (var i = 0; i < items.length; i++) {
    items[i].onClick = function () {
      return i;
    };
  }
  return items;
}
const example = [{}, {}];
const clickSet = addClick(example);
clickSet[0].onClick(); // 2
```

- `var`로 할당한 변수는 함수 유효 범위를 따르기 때문에 함수 내에서 마지막으로 **할당한 값을 참조**한다.
- 코드를 호출한 시점의 `i`의 값을 반환한다. `i`를 설정한 시점이 아니다.
- 이 방법을 해결하려면 아래 코드와 같이 클로저, 고차함수, 즉시실행 함수가 조합되어 있는데 지금은 잘 이해가 되지 않으니 천천히 나중에 알아보자.(매번 볼때마다 새로워서 확실하게 정리할 예정)

```javascript
function addClick(items) {
  for (var i = 0; i < items.length; i++) {
    items[i].onClick = (function (i) {
      return function () {
        return i;
      };
    })(i);
  }
  return items;
}
const example = [{}, {}];
const clickSet = addClick(example);
clickSet[0].onClick(); // 0
```

- 간단하게 수정하기 위해서는 `var` 대신 `let`를 사용하면 된다.

```javascript
function addClick(items) {
  for (let i = 0; i < items.length; i++) {
    items[i].onClick = function () {
      return i;
    };
  }
  return items;
}
const example = [{}, {}];
const clickSet = addClick(example);
clickSet[0].onClick(); // 0
```

- 블록 내에서 선언된 변수는 블록 내에서만 유효하다.
- 반복되어 값이 변경되더라도, 이전에 선언한 함수의 값은 변경되지 않는다.
- 쉽게 말해 `let`을 이용하면 `for`문이 반복될 때마다 값을 잠급니다.

## 템플릿 리터럴로 변수를 읽을 수 있는 문자열로 변환하라(TIP4)

- 변수를 연결하지 않고 새로운 문자열로 만드는 방법을 살펴봅시다.
- URL를 생성해보는 예제
- URL과 ID조합 , width를 쿼리 매개변수로 넘겨주는 형식

```javascript
function generateLink(image, width) {
  const widthInt = parseInt(width, 10);
  return 'https://' + getProvider() + '/' + image + '?width=' + widthInt;
}
```

- 위와 같이 ?, =, & 기호를 넣고 + 로 연결하면서 복잡해집니다.
- 템플릿 리터럴을 이용하면 아래와 같이 깔끔해집니다.
- 템플릿 리터럴을 일반 문자열(`'`,`"`)과 다른 (**`**) 백틱을 사용한다. 헷갈리지 않게 주의!

```javascript
function generateLink(image, width) {
  const widthInt = parseInt(width, 10);
  return `https://${getProvider()}/${image}?width=${parseInt(width, 10)}`;
}
```

- 템플릿 리터럴 예제

```javascript
function greet(name) {
  return `Hi, ${name}`;
}
greet("duckhee"); // 'Hi, duckhee'

function yell(name) {
  return `HI, ${name.toUpperCase()}`;
}
yell("duckhee"); // 'HI, DUCKHEE!'

function leapYHearConverter(age) {
  return `윤년에 태어났다면 ${Math.floor(age / 4)}살이야.`;
}
leapYHearConverter(34); // "윤년에 태어났다면 8살이야."
```

- 중괄호 내부에서 많은 처리를 할 경우 외부에서 처리하고 결괏값을 변수에 할당해 사용하기.
