# 자바스크립트 코딩의 기술(시리즈 2 - 배열로 데이터 컬렉션을 관리하다)

- 자바스크립크 코딩의 기술 책을 읽고 복습 겸 정리하는 포스팅이다.
- 시리즈 1이 시작이며 시리즈 몇까지는 갈지는 진행하면서 가늠잡아 보겠다.

## 배열로 유연한 컬렉션을 생성하라(TIP5)

- 자바스크립트에는 데이터 컬렉션을 다루는 구조로 배열, 객체 이렇게 두가지가 있었다.
- 모던 자바스크립트에서 맵(Map), 세트(Set), 위크맵(WeakMap), 위크셋(WeakSet), 객체, 배열을 사용할 수 있다.
- 컬렉션을 선택할 때는 정보로 어떤 작업을 할지 생각해봐야 된다. 
- 대부분 배열을 사용하며 배열을 사용하지 않아도 배열에 적용되는 개념을 빌리게 된다.
- 배열의 순서가 기술적으로 보장되지 않지만 대부분 상황에서 동작한다고 생각하면 된다.(https://stackoverflow.com/questions/34955787/is-a-javascript-array-order-guaranteed)

``` javascript
const team = ['Lee','Kim','Son'];
function alphabetizeTeam(team) {
  return [...team].sort();
}
alphabetizeTeam(team);(3) // ["Kim", "Lee", "Son"]
```

- `map(), filter(), reduce()`등의 배열 메서드를 이용하면 코드 한줄로 정보를 변경하거나 갱신할 수 있다.
****
``` javascript
const staff = [{
  name: 'duckhee', 
  position: 'developer',
},
{
  name: 'rain', 
  position: 'musician'
}]

function getMusician(staff) {
  return staff.filter(member => member.position === 'musician')
}
getMusician(staff);  // [ {name: "rain", position: "musician"} ]
```

- 객체를 순회하려면 먼저 `Object.keys()`를 실행해서 객체의 키를 배열에 담은 후 생성한 배열을 이용해 순회

``` javascript
const game1 = {
  player: 'Lee',
  goal: 2,
  pass: 101,
  errors: 0
}
const game2 = {
  player: 'Son',
  goal: 1,
  pass: 205,
  errors: 1
}

const total = {}
const stats = Object.keys(game1);

for (let i = 0;  i < stats.length; i++) {
  const stat = stats[i];
  if (stat !== 'player') {
    total[stat] = game1[stat] + game2[stat]
  }
}
```

- 배열에 이터러블(`iterable`)이 내장되어 있다. 간단히 말해 컬렉션의 현재 위치를 알고 있는 상태에서 컬렉션의 항목을 한 번에 하나씩 처리하는 방법이다. (https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Iteration_protocols)
- 배열을 특별한 컬렉션으로 쉽게 변환하거나 다시 배열로 만들 수 있다.
- 다음 코드는 객체를 키-값 쌍을 모은 배열로 바꿨다. 실제로 키-값 쌍을 사용해 맵 객체와 배열간의 데이터를 변화 한다.(`Object.entries()` - (https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/entries))

``` javascript
const dog = {
  name: 'Binhee',
  color: 'brown',
};

dog.name; // Binhee

const dogPair = [['name','Binhee'],['color','brown']];
function getName(dog) {
  return dog.find(attribute => {
    return attribute[0] === 'name';
  })[1];
}
```

## `incdlues()`존재 여부를 확인하라(TIP6)

- 기존 배열에서 특정 문자열을 포함하고 있는 확인하려면 문자열의 위치를 찾았다. 즉, `indexOf`를 사용하여 문자열이 있으면 해당 `index` 반환, 없으면 `-1`를 반환했다. 근데 이때 만약 `0`번째에서 찾아지면 if 문에서 `false` 를 반환하므로 문제가 생긴다.

``` javascript
const sections = ['shipping'];

function displayShipping(sections) {
  if (sections.indexOf('shipping')) { // 0 를 빤환하므로 false로 실행된다.
    return true;
  }
  return false;
}
// false

보완코드
function displayShipping(sections) {
  return sections.indexOf('shipping') > -1
}
// true

includes() 를 사용한 코드
function displayShipping(sections) {
  return sections.includes('shipping')
}
```

- `includes()` 를 사용하면 -1를 사용해 비교하는 번거로운 로직을 안써도 된다.

## 펼침 연산자로 배열을 본떠라(TIP7)

- 펼침 연산자(`spread operator`)(https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Spread_syntax) 는 마침표 3개(`...`)를 사용한다. 배열에 포함된 항목을 목록으로 바꿔준다. 

``` javascript
const cart = ['Nmaing and Necessity', 'Alice in Wonderland'];
...cart // 단독으로 사용할 경우 에러, 정보를 어디든 펼쳐 넣어야 합니다.
const copyCart = [...cart]; 
// ["Nmaing and Necessity", "Alice in Wonderland"]
```

- 배열에서 항목을 제거할 경우

``` javascript
// removable에 해당 요소를 넣고 삭제할 요소 빼고 배열을 만든다.
function removeItem(items, removable) {
  const updated = [];
  for ( let i = 0; i < items.length; i++) {
    if (items[i] !== removable) {
      updated.push(items[i])
    }
  }
  return updated;
}
```

- 위에 코드는 잘 작동하지만 단순하게 변경해보자.
- `splice()` 사용한 코드

``` javascript
function removeItem(items, removable) {
  const index = items.indexOf(removable);
  items.splice(index, 1);
  return items;
}
```

- 문제는 `splice`는 원본 데이터를 조작한다.

``` javascript
const fruits = ['apple', 'banana', 'melon']
const isNotRedColorFruits = removeItem(fruits, 'apple') // ['banana', 'melon']
// fruits도 ['banana', 'melon']
const isNotYellowColorFruits = removeItem(fruits, 'banana') // ['melon']
// fruits도 ['melon']
```

- 원본 `fruits` 배열이 변경 된다. `const`를 사용해 만들어서 변경되지 않을거라고 생각되었지만 항상 그렇지는 않다.
- `slice`를 사용해보자. 원본 배열을 변경하지 않고 배열의 일부를 반환한다.


``` javascript
function removeItem(items, removable) {
  const index = items.indexOf(removable);
  return items.slice(0, index).concat(items.slice(index + 1));
}
```

- 작동은 잘되지만 `slice`,`concat`를 사용해 어떤 값이 반환되는지 직관적으로 알 수 없다.
- 이럴때 펼침 연산자를 사용한다.

``` javascript
function removeItem(items, removable) {
  const index = items.indexOf(removable);
  return [...items.slice(0, index), ...items.slice(index + 1)];
}
```

- 위에 코드보다 간결하고 재사용할 수 있으며 예측이 가능하다.(전 비슷한듯....)
- 또한 펼침 연산자를 사용하면 배열의 항목을 쉽게 꺼내 인수 목록을 쉽게 사용이 가능하다.
- 인수, 인자 차이(https://amagrammer91.tistory.com/9)

``` javascript
const book = ['Reasons and Persons', 'Derek Parfit', 19.99];
function formatBook(title, author, price) {
  return `${title} by ${author} $${price}`;
}

formatBook(book[0], book[1], book[2]) // 확장성이 없고 인수값이 늘어나면 또 작성해야된다.
formatBook(...book) // 나중에 인수가 추가되도 고치지 않아도 된다.
```

## `push()` 메서드 대신 펼침 연산자로 원본 변경을 피하라 (TIP8)

- 역시 원본 배열 조작을 피하는 방법을 살펴보자.
- 예측하지 못한 조작은 심각한 버그를 발생시키므로 가능하며 조작은 피하는게 좋고, 또한 모던자바스크립트의 대부분 함수형 프로그래밍 형식을 취하기떄문에 부수효과와 조작이 없는 코드를 작성해야 한다.(함수형 프로그래밍을 공부하자)
- `push()` 메서드를 통해 알아보자. `push()` 메서드는 새로운 항목을 배열 뒤에 추가해 원본 배열을 변경한다.
- 장바구니 상품 목록을 받아서 내용을 요약하는 간단한 함수 코드이다.
    1. 할인 금액 확인
    2. 할인 상품이 2개 이상인지 확인
       1. 2개 이상일때 오류 객체 반환
    3. 오류가 없고 상품이 3개이상 구매 시 사은품 증정

``` javascript
// 카트 정의
const cart = [{
    name: 'The Foundation Triology',
    price: 19.99,
    discount: false,
  },{
    name: 'Godel, Escher, Bach',
    price: 15.99,
    discount: false,
  },{
    name: 'Red Mars',
    price: 5.99,
    discount: true,
  }
];

// 사은품 정의
const reward = {
  name: 'Guide to Science Fiction',
  discount: true,
  price: 0,
}

// 사은품 증정
function addFreeGift(cart) {
  if (cart.length > 2) {
    cart.push(reward);
    return cart;
  }
  return cart;
}

// 카트 정리 - 기존
function summerizeCart(cart) {
  // 할인중인 상품이 있는지 확인
  const discountable = cart.filter(item => item.discount);

  // 할인 상품이 2개 이상인지 확인
  if(discountable.length > 1) {
    return {
      error: '할인 상품은 하나만 주문할 수 있습니다.'
    }
  }

  // 오류가 안나니 사은품 증정
  const cartWithReward = addFreeGift(cart);

  return {
    discounts: discountable.length,
    items: cartWithReward.length,
    cart: cartWithReward
  }
}
```

- 만약 새로운 개발자나 아무개나 코드 정리하고 싶어서 모든 변수 할당을 최상위로 옮기려고 한다면?

``` javascript
// 카트 정리 - 아무개 수정
function summerizeCart(cart) {
  // 할인중인 상품 체크 안하고 카트에 바로 사은품 증정 로직
  // push가 있으므로 원본 cart 조작
  const cartWithReward = addFreeGift(cart);
  // 조작된 cart로 할인중인 상품이 있는지 확인
  const discountable = cart.filter(item => item.discount); // 사은품이 discountable 하니 사은품 기본으로 포함해서 반환

  // 할인 상품이 2개 이상인지 확인
  // 사은품 제외하고 할인 상품이 1개라도 있으면 2개가 되서 오류!
  if(discountable.length > 1) {
    return {
      error: '할인 상품은 하나만 주문할 수 있습니다.'
    }
  }

  return {
    discounts: discountable.length,
    items: cartWithReward.length,
    cart: cartWithReward
  }
}
```

- 상품 3개이상 선택하고, 그 중 하나가 할인 상품이면 모든 고객에서 오류 발생한다.
- 예제를 통해 살펴본 문제의 대부분은 분리된 함수에서 의도치 않게 원본을 조작 한것이 원인이다.
- 부수효과가 없는 함수를 순수함수(pure function)라고 하며, 순수함수를 만들기 위해 노력해야 한다.
- 위에 코드를 펼침 연산자를 이용해 수정해보자.

``` javascript
function addFreeGift(card) {
  if (cart.length > 2) {
    return [...cart, reward];
  }
  return cart;
}
```

- 이렇게 하면 `discountable` 할당할때 `cart`가 변경되지 않은 원본 배열을 사용하므로 정상적인 코드가 된다.

``` javascript
const titles = ['Moby Dick', 'White Teeth'];
const moreTitles = [...titles, 'The Conscious Mind'];
// ['Moby Dick', 'White Teeth', 'The Conscious Mind'];
```

- 시작 부분에 새로운 항목울 추가하려면?
  
``` javascript
// 배열 앞에 추가하기
const titles = ['Moby Dick', 'White Teeth'];
titles.unshift('The Conscious Mind')
const moreTitles = ['Moby Dick', 'White Teeth'];
const evenMoreTitles = ['The Conscious Mind', ...moreTitles ];

// 복사하기
const toCopy = ['Moby Dick', 'White Teeth'];
const copied = toCopy.slice();
const moreCopies = ['Moby Dick', 'White Teeth'];
const moreCopied = [...moreCopies];
```

- `slice()` 메서드로 새울 배열을 생성할 수 있지만 기억이 나지 않을 수도 있고, 중괄호를 보면 어떤 값이 반환되는데 확실히 알 수 있다.
  

## 펼침 연산자로 정렬에 의한 혼란을 피하라 (TIP9)

- 이번 팁에서 배열을 여러번 정렬해도 항상 같은 결과가 나오게 펼침 연산자를 사용하는 방법을 알아보자.
- 직원 정보가 담긴 배열을 이름 또는 근속연수로 정렬하는 코드이다.

``` javascript
// 직원 정의
const staff = [
  {
    name: 'Joe',
    years: 10,
  },
  {
    name: 'Thoe',
    years: 5
  },
  {
    name: 'Dyan',
    years: 10,
  },
];

// 정렬 함수
function sortByYears(a, b) {
  if (a.years === b.years) {
    return 0;
  }
  return a.years - b.years;
}

const sortByName = (a, b) => {
  if (a.name === b.name) {
    return 0;
  }
  return b.name > a.name ? 1 : -1;
}
```

- `sort()` 메서드에 관한 내용은 문서(https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) 살펴보기

- 맨 처음 정렬을 근속 연수로 했을 경우이다.

``` javascript
staff.sort(sortByYears);

// [
//   {name: "Thoe", years: 5} {name: "Joe", years: 10} {name: "Dyan", years: 10}
// ]

// 이때 staff도 위와 같은 변경된 배열과 같다.
```

- 맨 처음 정렬을 이제 사용자 이름순으로 정렬한 경우이다.
  
``` javascript
staff.sort(sortByName);

//   {name: "Dyan", years: 10} {name: "Joe", years: 10} {name: "Theo", years: 5}
```

- 이제 사용자 이름순 -> 근속 년수로 정렬했을 경우이다.
- 처음 근속 연수로 정렬했을때와 같은 순서로 기대했는데 결과는 다르다.

``` javascript
staff.sort(sortByName);
staff.sort(sortByYears);

//   {name: "Theo", years: 5} {name: "Dyan", years: 10} {name: "Joe", years: 10}
```

- 만약 수백명의 직원리스트가 있어 정렬을 하는데 정렬할때마다 순서가 달라지게 되면 신뢰를 잃을 것입니다.
- 이 부분을 수정하기 위해서 간단합니다. 배열을 조작하지 않으면 됩니다. 사본을 만들고 사본을 조작하자.

``` javascript
[...staff].sort(sortByYears);

//   {name: "Thoe", years: 5} {name: "Joe", years: 10} {name: "Dyan", years: 10}
```

