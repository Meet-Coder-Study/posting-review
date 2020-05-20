# 자바스크립트 코딩의 기술(시리즈 2 - 배열로 데이터 컬렉션을 관리하다)

- 자바스크립크 코딩의 기술 책을 읽고 복습 겸 정리하는 포스팅입니다.
- 시리즈 1이 시작이며 시리즈 몇까지는 갈지는 진행하면서 가늠잡아 보겠습니다.

## 배열로 유연한 컬렉션을 생성하라(TIP5)

- 자바스크립트에는 데이터 컬렉션을 다루는 구조로 배열, 객체 이렇게 두가지가 있었습니다.
- 모던 자바스크립트에서 맵(Map), 세트(Set), 위크맵(WeakMap), 위크셋(WeakSet), 객체, 배열을 사용할 수 있습니다.
- 컬렉션을 선택할 때는 정보로 어떤 작업을 할지 생각해봐야 됩니다. 대부분 배열을 사용하며 배열을 사용하지 않아도 배열에 적용되는 개념을 빌리게 됩니다.
- 배열의 순서가 기술적으로 보장되지 않지만 대부분 상황에서 동작한다고 생각하면 됩니다.(https://stackoverflow.com/questions/34955787/is-a-javascript-array-order-guaranteed)

``` javascript
const team = ['Lee','Kim','Son'];
function alphabetizeTeam(team) {
  return [...team].sort();
}
alphabetizeTeam(team);(3) // ["Kim", "Lee", "Son"]
```

- `map(), filter(), reduce()`등의 배열 메서드를 이용하면 코드 한줄로 정보를 변경하거나 갱신할 수 있다.

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

- 배열에 이터러블(`iterable`)이 내장되어 있다. 간단히 말해 컬렉션의 현재 위치를 알고 있는 상태에서 컬렉션의 항목을 한 번에 하나씩 처리하는 방법입니다. (https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Iteration_protocols)
- 배열을 특별한 컬렉션으로 쉽게 변환하거나 다시 배열로 만들 수 있습니다.
- 다음 코드는 객체를 키-값 쌍을 모은 배열로 바꿨습니다. 실제로 키-값 쌍을 사용해 맵 객체와 배열간의 데이터를 변화합니다.(`Object.entries()(https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)`)

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

- 기존 배열에서 특정 문자열을 포함하고 있는 확인하려면 문자열의 위치를 찾았습니다. 즉, `indexOf`를 사용하여 문자열이 있으면 해당 `index` 반환, 없으면 `-1`를 반환했습니다. 근데 이때 만약 `0`번째에서 찾아지면 if 문에서 `false` 를 반환하므로 문제가 생깁니다.

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

- `includes()` 를 사용하면 -1를 사용해 비교하는 번거로운 로직을 안써도 됩니다.

## 펼침 연산자로 배열을 본떠라(TIP7)

- 펼침 연산자(`spread operator`)(https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Spread_syntax) 는 마침표 3개(`...`)를 사용한다. 배열에 포함된 항목을 목록으로 바꿔준다. 

``` javascript
const cart = ['Nmaing and Necessity', 'Alice in Wonderland'];
...cart // 단독으로 사용할 경우 에러, 정보를 어디든 펼쳐 넣어야 합니다.
const copyCart = [...cart]; 
// ["Nmaing and Necessity", "Alice in Wonderland"]
```

- 