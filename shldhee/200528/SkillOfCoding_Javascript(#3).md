# 자바스크립트 코딩의 기술(시리즈 3 - 특수한 컬렉션을 이용해 코드 명료성을 극대화하라)

- 자바스크립트 코딩의 기술 책을 읽고 복습 겸 정리하는 포스팅이다.
- 시리즈 1이 시작이며 시리즈 몇까지는 갈지는 진행하면서 가늠잡아 보겠다.

## 객체를 이용해 정적인 키-값을 탐색하라(TIP10)

- 데이터에 따라 UI에 색상을 적용해야 하는 경우를 생각해보자.
- 다음 예제 코드와 같이 배열에 16진수 값을 넣었지만, 이것만으로 각각 무슨 의미인지 알 수 없다.

``` javascript
const colors = ['#d10202', '#19d836','#0e33d8'];
```

- 사용자 정보를 담은 배열처럼 구조적으로 유사하고 다른 데이터와 교체해도 괜찮은 경우와 다르게 위에서 살펴본 색상들은 각각 **다른 목적**으로, **즉 사용자에게 값을 표시하기 위해 사용한다.** 적색이 첫번째인지 세번째인지 중요하지 않다.
- 배열 사용하는것이이 적절하지 않고 키-값 컬렉션을 사용해야 한다면 대부분의 개발자는 객체를 선택한다.
- 원칙적으로 객체는 변화가 없고 구조화된 키-값 데이터를 다루는 경우에 유용하다. 반면에, 자주 갱신되거나 실행되기 전에는 알 수 없는 동적인 정보를 다루기에는 적합하지 않다.(추후에 배울 `Map` 사용을 권장)
- 예를 들어, 색상 컬렉션을 공유하는 경우에는 객체를 선택하는것이 좋다. 데이터가 변경될 가능성이 없기 때문이다.

``` javascript
const colors = {
  red: '#d10202',
  green: '#19d836',
  blue: '#0e33d8'
}
``` 

- 설정 파일을 종종 객체로 작성하는데, **설정 파일이 런타임 전에 설정되고 단순한 정적인 정보를 담은 키-값 저장소이기때문이다.**

``` javascript
export const config = {
  endpoint: 'http://pragprog.com',
  key: 'secretkey'
}
``` 

- 객체를 프로그래밍적으로 정의하면 아래 코드와 같다.
- 함수내에서 각각 함수에서 (새로운) 객체를 생성하고 다른 함수에 넘겨준다. 이렇게 하면 조작 또는 갱신을 하지 않으므로 정적인 정보가 된다.

``` javascript
function getBill(item) {
  return {
    name: item.name,
    due: twoWeeksFromNow(),
    total: calculateTotal(item.price),
  };
}

const bill = getBill({
  name: '객실 청소',
  price: 30
});

function displayBill(bill) {
  return `${bill.name} 비용은 ${bill.total} 달러이며 납부일은 ${bill.due}입니다.`;
}
``` 

## `Object.assign()`으로 조작 없이 객체를 생성하라(TIP11)

- 객체도 배열과 마찬가지로 부수 효과로 인한 문제를 조심해야 한다.
- 객체에 무심코 필드(속성)를 추가하거나 변경하면 심각한 문제가 발생할 수 있다.
- 예를 들면, 키-값이 쌍인 여러 개인 객체가 있다.
- 객체에 기존 데이터가 있는 상태에서 새로운 필드를 추가 또는 외부 API에서 데이터를 가져와 할당하는 경우가 자주 발생한다.
- 새로운 필드, 데이터 할당되지 않는 경우는 디폴트 값으로 채운다.
- 위에 부합하게 작성한 아래코드를 보자.

``` javascript
const defaults = {
  author: '',
  title: '',
  year: 2017,
  rating: null
};

const book = {
  author: 'Joe Morgan',
  title: 'Simplifying Javascript',
};

function addBookDefaults(book, defaults) {
  const fields = Object.keys(defaults);
  const updated = {};
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    updated[field] = book[field] || defaults[field]
  }
  return updated;
}

addBookDefaults(book, defaults);
// {author: "Joe Morgan", title: "Simplifying Javascript", year: 2017, rating: null}
``` 

- 위코드는 잘 작동하지만 길다
- `Object.assign()`을 이용하면 다른 객체의 속성을 이용해서 객체를 갱신할 수 있습니다.
- 사용법은 맨처음 객체부터 적용되고 가장 나중에 전달한 객체가 맨 마지막으로 적용되면서 덮어 씌운다.


``` javascript
Object.assign(defaults, book)
// {author: "Joe Morgan", title: "Simplifying Javascript", year: 2017, rating: null}

const anotherBook = {
  title: 'Another Book', 
  year: 2016
};

Object.assign(defaults, anotherBook);
// {
//   author: 'Joe Morgan', // defaults 객체가 변경된 걸 볼 수 있다.
//   title: 'Another book',
//   year: 2016,
//   rating: null
// }

Object.assign({}, defaults, anotherBook); // 이렇게하면 빈객체가 변경되고 결과는 defaults, anotherBook 객체를 합친것과 같다.
```

- 중첩되지 않는 객체는 위와 같이 사용한다. 
- 중첩된 객체는 위와 같이 사용하며 얕은 복사로 이루어져 참조의 위치를 복사하므로 원본 또는 복사한 객체를 변경하면 둘다 변경 된다.


``` javascript
const defaultEmployee = {
  name: {
    first: '',
    last: '',
  },
  years: 0,
};

const employee = Object.assign({}, defaultEmployee);

employee.name.first = 'Joe';
defaultEmployee;

// {
//   name:
//   {
//     first: "Joe", 원본이 변경되었다.
//     last: ""
//   },
//   years: 0
// }
``` 

- 중첩된 객체를 복사하려면 중첩된 객체가 있는 경우 아래코드 `Object.assign()`를 이용한다.
- 물론 외부 라이브러리 로대시의 `cloneDeep()` 메서드를 이용해도 된다.

``` javascript
const employee2 = Object.assing(
  {},
  defaultEmployee,
  {
    name: Object.assign({}, defaultEmployee.name),
  },
);
``` 

## 객체 펼침 연산자로 정보를 갱신하라.(TIP12)

- 앞에서 살펴봤던 `Object.assign()` 에서 아쉬웠던 부분을 보충할 수 있는데 객체 펼침 연산자를 살펴보자.


``` javascript
const book = {
  title: 'Reason',
  author: 'Derek Parfit',
};

const update = { ...book, year: 1984 }
// {title: "Reason", author: "Derek Parfit", year: 1984}

//  동일한 키를 추가할 경우 마지막에 선언된 값을 사용한다,
const update2 = { ...book, title: 'Good job' }
// {title: "Good job", author: "Derek Parfit"}
``` 

- TIP11 에서 `Object.assign()`을 이용한 코드를 객체 펼침 연산자로 리팩토링 하자

``` javascript
const defaults = {
  author: '',
  title: '',
  year: 2017,
  rating: null
};

const book = {
  author: 'Joe Morgan',
  title: 'Simplifying Javascript',
};

// Object.assign({}, defaults, anotherBook);
const bookWithDefaults = { ...defaults, ...book };
// {author: "Joe Morgan", title: "Simplifying Javascript", year: 2017, rating: null}
``` 

- 중첩된 객체 복사는 역시 같은 문제(얕은 복사로 진행)가 발생한다.

``` javascript
const employee2 = Object.assing(
  {},
  defaultEmployee,
  {
    name: Object.assign({}, defaultEmployee.name),
  },
);

// 펼침 연산자로 변경
// 코드가 더 명확해지고 간결해졌다.

const employee = {
  ...defaultEmployee,
  name: {
    ...defaultEmployee.name
  }
}
```

## 맵으로 명확하게 키-값 데이터를 갱신하라(TIP13)

- 데이터 변경이 잦은 키-값 컬렉션에 맵 객체를 사용하는 방법을 살펴보자.
- 객체보다 맵을 사용할 경우 보통
  - 키-값 쌍이 자주 추가되거나 삭제되는 경우
  - 키가 문자열이 아닌 경우

- 첫째로 키-값 쌍이 자주 추가되거나 삭제되는 경우 살펴보자.
  - 반려견 입양 사이트를 예를 들어 보자.
  - 사람들이 덩치가 큰, 작은, 검정색인 등 선호하는 반려견이 다르기 때문에 강아지 목록에 필터링 기능을 추가하면 좋을 것이다.


``` javascript
const dogs =[
  {
    이름: '맥스',
    크기: '소형견',
    견종: '보스턴테리어',
    색상: '검정색'
  },
  {
    이름: '도니',
    크기: '대형건',
    견종: '래브라도레트리버',
    색상: '검정색'
  },
  {
    이름: '섀도',
    크기: '중형견',
    견종: '래브라도레트리버',
    색상: '갈색'
  }
]
``` 

- 강아지 컬렉션은 배열이다. 각 항목이 동일한 형태이므로 괜찮은 선택이다.
- 여기에 적용된 필터링 조건 목록을 담은 컬렉션이 필요하다.
- 필러팅 조건은 예를들면 키(색상), 값(검정색)을 가진 컬렉션이다.
- 이 조건 필터링을 추가하면 강아지 2마리가 있는 배열이 나온다. 세부 구현은 현재 알 필요 없다.
- **맵이 명세에 추가된 까닭을 이해하려면 같은 문제를 일반적인 객체로 해결하는 방법을 생각해봐야 한다.**
  - 새로운 필터링 정보를 담을 수 있는 빈객체를 만들자.


``` javascript
function addFilters(filters, key ,value) {
  filters[key] = value; // 객체 자체 메서드 사용
}
function deleteFilters(filters, key) {
  delete filters[key]; // 언어에 정의된 delete연산자 사용
}
function clearFilters(filters) {
  filters = {}; // 변수 재할당
  return filters;
}
```

- 추가, 삭제, 전체 제거처럼 3가지 기본적인 동작을 수행하는 데도 불구하고 서로 다른 3가지 패러다임을 적용했다.
- 위와 같은 객체에 추가, 삭제 등 자주 변경되는 경우에는 인터페이스가 명확하고, 메서드가 예측 가능하고, 반복과 같은 동작이 내장되어있는 `맵(Map)`을 사용하는게 좋다.

### Map 사용 예제

``` javascript
let filters = new Map(); // 객체를 조작할거니까니 let
filters.set('견종', '래브라도레트리버'); // 키, 값
filters.get('견종');
// '래브라도레트리버'
```

- 체이닝(메서드를 차례로 연결)을 사용하여 여러 키,값들을 한번에 설정할 수 있다.


``` javascript
let filters = new Map().
  .set('견종', '레브라도레트리버')
  .set('크기', '대형견')
  .set('색상', '갈색');
filters.get('크기');
// 대형견
``` 

- 키-값 쌍 배열을 전달하면, 첫 번째 항목은 키, 두 번째 항목은 값으로 추가됩니다.
- 앞에서 배웠던 [TIP5](https://blog-posting.github.io/2020-05-26/SkillOfCoding-Javascript-2#%EB%B0%B0%EC%97%B4%EB%A1%9C-%EC%9C%A0%EC%97%B0%ED%95%9C-%EC%BB%AC%EB%A0%89%EC%85%98%EC%9D%84-%EC%83%9D%EC%84%B1%ED%95%98%EB%9D%BCtip5){:target="_blank"} 배열로 유연한 컬렉션을 생성하라에서 키-값 쌍이 담긴 객체 배열로 변환하는 방법

``` javascript
let filters = new Map([
    ['견종','래브라도레트리버'],
    ['크기', '대형견'],
    ['색상', '갈색'],
  ]
)
filters.get('색상');
// 갈색

filters.delete('색상');
filters.get('색상');
// undefined

filters.clear();
filters.get('크기');
// undefined
```

- 이제 객체 대신 맵을 사용해 필터를 추가하는 함수를 만들어 보자.

``` javascript
const petFilters = new Map();
function addFilters(filters, key, value) {
  filters.set(key, value);
}

function deleteFilters(filters, key) {
  filters.delete(key);
}

function clearFilters(filters) {
  filters.clear();
}
```

- 새로 작성한 함수에서 다음과 같은 특징을 발견할 수 있다.
  - Map 인스턴스에 항상 메서드를 사용한다.
  - `delete()` 메서드를 사용하기 떄문에 인스턴스를 생성한 후에는 언어 수준의 연산자를 섞지 않는다.
  - `clear()` 메서드를 사용하기 때문에 인스턴스를 생성할 필요가 없다.
- **따라서 변경 사항이 많을때는 객체보다 맵이 좋다.**
- 객체의 경우 키에 사용할 수 있는 자료형에 제약이 있다.

``` javascript
const erros = {
  100: '이름이 잘못되었습니다',
  101: '이름에는 문자만 입력할 수 있습니다.',
  200: '색상이 잘못되었습니다.'
}

function isDataValid(data) {
  if (data.length < 10) {
    return erros.100
  }
  return true;
}
// error 발생
``` 

- 정수를 키로 하는 경우는 점 표기법으로 접근할 수 없고 `errors[100]`처럼 배열 표기법으로 접근
- 접근할 수 있는 이유는 오류 코드 객체를 생성했을때 모든 정수가 문자열로 변환됐기 때문이다.
- 그리고 배열 표기법을 사용하면 탐색에 앞서 정수가 문자열로 변경된다.

``` javascript
Object.keys(errors);
// ['100', '101', '200'] 문자열 반환
``` 

- 맵은 위와 같은 문제가 없다. 맵은 여러가지 자료형을 키로 받을 수 있다.

``` javascript
let erros = new Map([
  [100, '이름이 잘못되었습니다.']
  [101, '이름에는 문자만 입력할 수 있습니다.']
  [200, '색상이 잘못되었습니다.']
])
errors.get(100);
// 이름이 잘못되었습니다.

erros.keys();
// MapIterator { 100, 101, 200 }
``` 

- 배열은 반환하지 않고 맵이터레이터를 반환한다.
- 맵이터레이터를 이용하면 순회할 수 있다. 다음장에서 알아보자.

## 맵과 펼침 연산자로 키-값 데이터를 순회하라(TIP14)

- 순회가 필요한 컬렉션의 경우 살펴보자.
- 객체는 순회하는 것은 복잡한 작업이며 맵은 직접 순회가 가능하다.
- 필터링 조건으로 돌아가, 조건을 담은 객체가 있고, 적용한 조건을 나열하려고 한다.
- 결과적으로 사용자가 정보의 일부를 보고 있다는 점을 기억하게 하는 것이 목표다.
- `키-값` 쌍을 `키:값` 형식의 문자열로 변환하려면 어떻게 해야 될까?

``` javascript
const filters = {
  색상: '검정색', 
  견종: '래브라도레트리버',
};

function getAppliedFilters(filters) {
  const keys = Object.keys(filters);
  const applied = [];
  for ( const key of keys ) {
    applied.push(`${key}:${filters[key]}`);
  }
  return `선택한 조건은 ${applied.join(', ')} 입니다.`;
}

getAppliedFilters(filters);
// "선택한 조건은 색상:검정색, 견종:래브라도레트리버 입니다."
```

- `Object.keys()`로 객체의 키를 배열로 옮기고, `for`문으로 키를 순회하면서, 객체를 참조해 값을 꺼낸다.
- 또한, 객체의 순서를 보장되지 않으므로 정렬을 할 수 없다. 필터링 조건을 정렬하려면 키를 정렬해야 한다.

``` javascript
const filters = {
  색상: '검정색', 
  견종: '래브라도레트리버',
};

function getAppliedFilters(filters) {
  const keys = Object.keys(filters);
  key.sort();
  const applied = [];
  for ( const key of keys ) {
    applied.push(`${key}:${filters[key]}`);
  }
  return `선택한 조건은 ${applied.join(', ')} 입니다.`;
}

getAppliedFilters(filters);
// "선택한 조건은 색상:검정색, 견종:래브라도레트리버 입니다."
```

- 간단한 순회를 위해 관리해야 될것들이 많다.
- **반면에 맵은 정렬과 순회에 필요한 기능이 내장되어 있다.(이전 장에서 말함 맵이터레이터)**
- 맵이터레이터를 알아보기 위해 필터링 조건에 적용한 간단한 `for`문을 살펴보자.


``` javascript
const filters = new Map().set('색상','검정색').set('견종','래브라도리트리버')

function checkFilters(filters) {
  for (const entry of filters) {
    console.log(entry);
  }
}

checkFilters(filters)
//["색상", "검정색"]
//["견종", "래브라도리트리버"]

filters.entries();
// MapIterator {"색상" => "검정색", "견종" => "래브라도리트리버"}
```

- 이터레이터는 키-값 쌍을 넘겨준다.
- `entries()`는 키-값 쌍으로 묶은 맵이터레이터를 반환한다.
- 이제 `for`문을 이용해서 키-값을 문자열로 변환하는 메서드로 돌아가자. 
- 맵은 직접 순회 가능하므로 키를 먼저 꺼낼 필요가 없고, 해체 할당 문법으로 즉시 변수로 할당 할 수 있다.


``` javascript
function getAppliedFilters(filters) {
  const applied = [];
  for ( const [key, value] of filters ) {
    applied.push(`${key}:${value}`);
  }
  return `선택한 조건은 ${applied.join(', ')} 입니다.`;
}

getAppliedFilters(filters);
``` 

- 앞선 경험한 정렬 문제가 여기서도 발생한다.
- 좋은 점은 맵이 순서를 저장해 항상 맵의 첫 번째 항목을 첫 번째로 받는다.
- 나쁜 점은 배열 메서드처럼 `sort()` 메서드가 없다.
- 이 문제는 맵에도 배열과 동일하게 사용할 수 있는 펼침연산자를 통해 해결할 수 있다.

``` javascript
[...filters];
// [["색상", "검정색"], ["견종", "래브라도리트리버"]]
```

- 위 코드를 통해 배열의 배열을 정렬하면 됩니다. 그럼, 아래와 같은 코드로 작성했을 가능성이 큽니다.

``` javascript
function sortByKey(a, b) {
  return a[0] > b[0] ? 1 : -1;
}

function getSortedAppliedFilters(filters) {
  const applied = [];
  for (const [key, value] of [...filters].sort(sortByKey)) {
    applied.push(`${key}:${value}`);
  }
  return `선택한 조건은 ${applied.join(', ')} 입니다.`;
}

getSortedAppliedFilters(filters);
// "선택한 조건은 견종:래브라도리트리버, 색상:검정색 입니다."
``` 

- 위 코드에 사소한 문제점은 맵으로 시작했지만 실제 `for`문이 실제로 순회하는 것은 맵이 아닌 새로운 배열이다.(큰 문제는 아님)
- 이걸로 맵을 배열로 변환해 함수를 단순하게 만들었다. 맵을 배열로 변환함으로써 배열 메서드도 사용이 가능하다.
- 앞에서 맵 객체를 이용한 함수 대신 배열 메서드를 사용해 작성해보자.

``` javascript
function getAppliedFilters(filters) {
  const applied = [...filters].map(([key, value]) => {
    return `${key}:${value}`;
  });
  return `선택한 조건은 ${applied.join(', ')} 입니다.`;
}
// "선택한 조건은 색상:검정색, 견종:래브라도리트리버 입니다."
``` 

- 이제 모든 것이 배열이므로 체이닝을 이용해서 완성해보자.

``` javascript
function getAppliedFilters(filters) {
  const applied = [...filters]
    .sort(sortByKey)
    .map(([key, value]) => {
      return `${key}:${value}`;
    })
    .join(', ');
  return `선택한 조건은 ${applied} 입니다.`;
}
// "선택한 조건은 견종:래브라도리트리버, 색상:검정색 입니다."
```

## 맵 생성 시 부수 효과를 피하라(TIP15)

- 맵의 인스턴스를 이용해 작업하면 몇가지 문제점이 있다.
- 맵의 사본은 어떻게 생성할까? 부수 효과를 피하면서 맵을 변경하려면 어떻게 해야 할까?
- 우선 복사, 조작 문제를 혼합한 예제를 살펴보자.
- 앞에 살펴봤던 반려견 입양 사이트 예제 코드에서 사용자가 필터링 조건을 선택했는데, 아마 필터링의 기본값도 필요할 것이다.
- 즉, 사용자가 명시적으로 설정하지 않는 조건에 대해서는 기본값을 적용, 추가로 사용자가 적용하는 필터링 조건은 기본값을 덮어 쓴다.

``` javascript
const defaults = new Map()
  .set('색상','갈색')
  .set('견종','비글')
  .set('지역','캔자스')

const filters = new Map()
  .set('색상', '검정색')
``` 

- 위와 같이 기본값과 추가 필터링 조건을 합칠려면 어떻게 해야될까?
- 부수 효과를 신경쓰지 않으면 `has`메서드를 사용해 키를 체크해 설정한다.

``` javascript
function applyDefaults(map, defaults) {
  for (const [key,value] of defaults) {
    if (!map.has(key)) {
      map.set(key, value); // 여기서 filters를 조작한다.
    }
  }
}

console.log(filters);
// Map(3) {"색상" => "검정색", "견종" => "비글", "지역" => "캔자스"}
export { applyDefaults }
``` 

- 기본값, 사용자 데이터를 병합하는 것이 목적이라면 성공!
- 필터링 조건 객체에 대한 사용을 위해서는 생각이 필요하다.
  - 데이터에 필터링 조건을 적용하는데 사용
  - 사용자가 선택한 조건을 알려주는데 사용(이전 팁에서 문자로 보여주기)
- 위와 같은 경우에는 사용자가 선택한 조건에 기본값도 모두 노출 된다.
- 해결 방법은 사본을 만드는 것이다.(`entries`, 펼침연산자 사용) 아래 코드로 살펴보자.

``` javascript
function applyDefaults(map, defaults) {
  const copy = new Map([...map]);
  for (const [key,value] of defaults) {
    if (!copy.has(key)) {
      copy.set(key, value); // 여기서 filters를 조작한다.
    }
  }
  return copy;
}
``` 

- 여러가지 키의 존재 여부를 일일이 확인하고 있다.
- 맵은 객체와 마찬가지로 하나의 키를 한 번만 사용할 수 있다.
- 따라서, 새로운 키로 맵을 생성하면 어떤 값이든 해당 키에 마지막으로 선언한 값을 사용한다. 즉, 값을 설정하는 대신 갱신한다.

``` javascript
const filters = new Map()
  .set('color', 'black')
  .set('color', 'brown')
filters.get('color');
// 'brown'
``` 

- 이러한 특징을 이용해 맵 2개를 병합하는 코드를 한줄로 작성이 가능하다.

``` javascript
let filters = new Map()
  .set('색상','검정색');
let filters2 = new Map()
  .set('색상','갈색');
let update = new Map([...filters, ...filters2]);
update.get('색상');
// 갈색
``` 

- 최종 개선 코드

``` javascript
function applyDefaults(map, defaults) {
  return new Map([...defaults, ...map]);
}
```

## 세트를 이용해 고윳값을 관리하라(TIP16)

- 이번에는 세트(Set)를 이용해 배열에서 고유 항목만 분류하는 방법을 살펴보자.
- 앞에서 만들었던 필터링 조건으로 돌아가자.
- 사용자가 선택할 수 있는 조건을 알려면 선택할 수 있는 모든 값을 수집해야 한다.
- 아래는 강아지에 대한 정보가 담긴 배열이다.

``` javascript
const dogs = [
  {
    이름 : '맥스',
    크기: '소형견',
    견종: '보스턴테리어',
    색상: '검정색',
  },
  {
    이름 : '도니',
    크기: '대형견',
    견종: '래브라도레트리버',
    색상: '검정색',
  },
  {
    이름 : '섀도',
    크기: '중형견',
    견종: '래브라도레트리버',
    색상: '갈색',
  },
]
``` 

- 색상 조건을 수집하려면 어떻게 할까?
- 배열 메서드 `map()`을 활용하자.

``` javascript
function getColors(dogs) {
  return dogs.map(dog => dog['색상']);
}
getColors(dogs);
//  ["검정색", "검정색", "갈색"]
```

- 이제 중복된 값을 없애 보자.
- `for`문과 `reduce()` 메서드를 쓸 수 있다.
- `for`문을 사용해보자.

``` javascript
function getUnique(attributes) {
  const unique = [];
  for (const attribute of attributes) {
    if (!unique.includes(attribute)) {
      unique.push(attribute);
    }
  }
  return unique;
}

const colors = getColors(dogs);
getUnique(colors);
// ['검정색','갈색']
```

- 위에 코드는 잘 작동한다. 하지만 많은 코드를 쓰지 않고 세트객체를 사용해서 고윳값만 분류해낼 수 있다.
- 세트는 중첩하지 않은 배열을 인수로 받는다.

``` javascript
const colors = ['검정색', '검정색', '갈색'];
const unique = new Set(colors)
// Set {'검정색', '갈색'}
```

- 하지만 우리가 필요한건 set가 아니라, 고유 속성만 담긴 배열이다.
- 바로 펼침 연산자를 사용해보자.

``` javascript
function getUnique(attributes) {
  return [...new Set(attributes)];
}
```

- 위와 같은 코드는 색상 배열을 만들려면 처음에 강아지 정보가 담긴 배열을 한 차례 순회해야 한다.
- 귀찮으니 한번에 처리해보자.
- 아래와 같이 하나씩 추가한면 이미 존재하는 값이 있으면 새로운 값은 추가되지 않는다.

``` javascript
let names = new Set();
names.add('joe')
// Set {'joe'}
names.add('bea');
// Set {'joe','bea'}
names.add('joe')
// Set {'joe','bea'}
``` 

``` javascript
function getUniqueColors(dogs) {
  const unique = new Set();
  for (const dog of dogs) {
    unique.add(dog.색상);
  }
  return [...unique];
}
```

- `reduce()`를 사용하면 한줄로 가능하다.

``` javascript
[...dogs.reduce((colors, { 색상 }) => colors.add(색상), new Set())];
```

## 결론

- 데이터를 생성 또는 가공하기 위해서는 어떤 목적으로 사용할 것인지 데이터가 어떤 구조로 생성되었는지 등 고려해야 될 부분들을 상기시켰다.
- `Map, Set`은 아직 많이 사용하지 않지만 많은 공부와 연습을 통해 적재적소에 잘 사용하는것이 좋을 것 같다.