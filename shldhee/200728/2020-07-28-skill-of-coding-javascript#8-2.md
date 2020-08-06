# 자바스크립트 코딩의 기술(시리즈 8 - 클래스로 인터페이스를 간결하게 유지하라#2)

- 자바스크립트 코딩의 기술 책을 읽고 복습 겸 정리하는 포스팅이다.
- 시리즈 1이 시작이며 시리즈 몇까지는 대지는 진행하면서 가늠잡아 보겠다.

## 개요

- 프로토타입이 조합된 자바스크립트 클래스를 살펴볼 예정이다.
  - `get`과 `set`으로 인터페이스를 단순하게 만들어라.
  - 제너레이터로 이터러블 속성을 생성하라
  - `bind()`로 문맥 문제를 해결하라

## get과 set으로 인터페이스를 단순하게 만들어라.

- 이전 tip에서 클래스에 기본을 알아 보았다.
  - 인스턴스 생성
  - 속성과 메서드 호출
  - 부모 클래스 확장(쌍속)
- 이번 tip에서는 get, set를 통해 비공개 속성처럼 사용해보기
- 클래스는 아래 코드처럼 속성에 접근하여 변경도 가능하다.
  - 같이 협업하는 개발자가 코드를 수정하여 문제가 생길 수 있다.

``` javascript
class Coupon {
  constructor(price, expiration) {
    this.price = price;
    this.expiration = expiration || '2주';
  }

  getPriceText() {
    return `$ ${this.price}`;
  }

  getExpirationMessage() {
    return `이 쿠폰은 ${this.expiration} 후에 만료됩니다.`;
  }
}

const coupon = new Coupon(5);
coupon.price = '$10'; // 이런식으로 수정이 가능하다.
coupon.getPriceText();
// '$ $10'

export default Coupon;
```

- 또 위에 코드에서 우린 `price`가 정수 값을 받는걸 당연하게 생각하는데 다른 누군가가 `'$10'`이라는 문자열을 사용하게 되면 원하지 않는 결과를 반환한다.(우리가 원하는 값은 `$10`)
- 해결책은 `get`,`set`를 이용해 함수를 속성처럼 사용하는 방법이 있다.

``` javascript
class Coupon {
  constructor(price, expiration) {
    this.price = price;
    this.expiration = expiration || '2주';
  }

  get priceText() {
    return `$ ${this.price}`;
  }

  get expirationMessage() {
    return `이 쿠폰은 ${this.expiration} 후에 만료됩니다.`;
  }
}

const coupon = new Coupon(5);
coupon.price = 10;
coupon.priceText;
// '$ 10'
coupon.expirationMessage
// "이 쿠폰은 2주 후에 만료됩니다."
```

- `getPriceText()` 기존 메서드를 `get`를 사용하여 리팩토링 하게 될 경우, `get`를 메서드명 앞에 사용한다.
- `get`을 사용할 경우 뒤에는 동작이 아니고 명사형태로 네이밍을 변경하면 아주 좋다.
- 코딩 컨벤션으로 메서드나 함수는 동사로!! 속성은 명사로 하는것이 아주 좋다.
- 특이한 점은 점 표기법으로 접근이 가능하다.


- 이번엔, 세터를 알아보자.
  - 인수를 하나만 받고, 정보를 노출하는것이 아닌 **속성을 변경한다.**
  - `=`(등호)를 사용한다.
- 아래 예제는 세터로서 쓸모없지만 사용법을 익히는 것이 목적이니 살펴보자.

``` javascript
class Coupon {
  constructor(price, expiration) {
    this.price = price;
  }

  set halfPrice(price) {
    this.price = price / 2;
  }
}

const coupon = new Coupon(5);
coupon.price;
// 5
coupon.halfPrice = 20;
coupon.price;
// 10
coupon.halfPrice
// undefined
coupon.halfPrice = 50;
coupon.price;
// 25
```

- 세터에 대응하는 게터가 없으므로 `coupon.halfPrice` 값이 `undefined`로 나온다.
- 항상 게터와 세터는 쌍을 이루는것이 아주 좋다. 하지만, 속성까지 같은 이름이면 아주 곤란하니 이러지는 말자.(호출 스택이 무한히 쌓인다.)
- 이런 경우,게터와 세터 사이의 가교(브릿지)를 사용해보자.
  - 사용자는 가교로 만든 속성에는 접근을 원치 않으니 비공개 속성을 사용해야 하는데 자바스크립트는 아직!! 없다....ㅠㅠ
- 컨벤션에 맞춰 `_` 이걸 사용해 비공개라는걸 알려준다.
  - `_price` 는 클래스 내에서 가교 역할로 사용하고 외부에서는 세터 `price`를 사용한다.

``` javascript
class Coupon {
  constructor(price, expiration) {
    this._price = price; // 생성자 함수에다 초기화를 해준다.
    this.expiration = expiration || '2주';
  }

  get priceText() {
    return `$${this._price}`;
  }

  get price() {
    return this._price;
  }

  set price(price) {
    const newPrice = price
      .toString()
      .replace(/[^\d]/g, ''); // 정수만 남기는 로직
    this._price = parseInt(newPrice, 10);
  }

  get expirationMessage() {
    return `이 쿠폰은 ${this.expiration} 후에 만료됩니다.`;
  }
}

const coupon = new Coupon(5);
coupon.price;
// 5
coupon.price = '$10';
coupon.price;
// 10
coupon.priceText;
// '$10'
```

- 장점은 복잡도를 숨길 수 있다.
- 단점은 다른 개발자가 이 클래스를 사용할때 실제로는 메서드를 호출하지만 속성을 설정한다고 생각할 수 있다.(의도를 정확히 파악을 못한다는 이야기 같네요)
- 디버깅 어려우니 테스트를 잘하고 사용하길!

## 제네레이터로 이터러블 속성을 생성하라(TIP41)

- 이번 팁에서는 제네레이터를 이용해 복잡한 데이터 구조를 이터러블로 변환하는 방법을 살펴보자.
- **이터러블**은 컬렉션을 순회가능하게 한다.(객체의 일부를 배열로 변경하여 순회 가능)
- **제네레이터**란? 함수가 호출 되었을때 끝까지 실행하지 않고 중간에 빠져나갔다가 다시 돌아올 수 있는 함수라고 MDN에서 정의하네요.
  - `funcion*()` 이렇게 사용하고
  - `next()`라는 메서드는 함수의 일부를 반환(value, done가 있는 객체를 반환)
    - `yield`로 선언한 항목이 `value`, `done`은 남은 항목이 없다는것을 알려준다.
  - `yield`키워드는 정보를 반환한다.(리턴같은놈)
- **3부작 책의 제목을 하나씩 알고 싶을때, 각각의 책을 반환하는 함수를 작성해야 한다.**
- 아래 코드를 통해 살펴보자
  
``` javascript
function* getCairoTrilogy() {
  yield '궁전 샛길';
  yield '욕망의 궁전';
  yield '설탕 거리';
}

const trilogy = getCairoTrilogy();
trilogy.next();
// { value: '궁전 샛길', done: false }
trilogy.next();
// { value: '욕망의 궁전', done: false }
trilogy.next();
// { value: '설탕 거리', done: false }
trilogy.next();
// { value: undefined, done: true }
```

- 제너레이터를 사용하려면 함수를 실행해 변수에 할당한다.
- 책의 제목이 필요할때마다 `next()` 사용
- 제네레이터가 함수를 이터러블로 바꿔준다는게 흥미롭다. 데이터에 하나씩 접근이 가능하다.
- 제네레이터를 이터러블로 사용할때 무조건 `next()`를 사용하는것이 아니다.
  - 이터러블이 필요한 작업은 무엇이든 가능하다.

- 펼침 연산자
  
``` javascript
[...getCairoTrilogy()];
// [ '궁전 샛길', '욕망의 궁전', '설탕 거리']
```

- for...of
  
``` javascript
const readingList = {
  '깡패단의 방문': true,
  '맨해튼 비치': false,
};
for (const book of getCairoTrilogy()) {
  readingList[book] = false;
}
readingList;
// {
//   '깡패단의 방문': true,
//   '맨해튼 비치': false,
//   '궁전 샛길': false,
//   '욕망의 궁전': false,
//   '설탕 거리': false
// }
```

- 이제 제네레이터가 클래스에서 어떻게 사용되는지 알아보자.
- 게터와 세터처럼 클래스에 단순한 인터페이스를 제공할 수 있다.
- 복잡한 데이터 구조를 다루는 클래스를 만들때, 단순한 배열을 다루는 것처럼 데이터에 접근할 수 있게 한다.
- 아래 예제는 한 가족의 가계도인데 자식이 자식을 낳고 또 그 자식이 자식을 낳았는데 이름을 배열로 구하는 코드입니다.

``` javascript
class FamilyTree {
  constructor() {
    this.family = {
      name: 'Doris',
      child: {
        name: 'Martha',
        child: {
          name: 'Dyan',
          child: {
            name: 'Bea',
          },
        },
      },
    };
  }

  getMembers() {
    const family = [];
    let node = this.family;
    while (node) {
      family.push(node.name);
      node = node.child;
    }
    return family;
  }
}

const family = new FamilyTree();
family.getMembers();
// ['Doris', 'Martha', 'Dyan', 'Bea'];
```

- 제네레이터를 사용하면 배열에 담지 않고 데이터를 바로 반환이 가능하다.
- `gemtMemebers()` 대신 `* [Symbol.iterator]()`로 변경 : 클래스의 이터러블에 제너레이터에 연결
  - 맵 객체가 맵이터레이터를 가지고 있는것과 비슷하다.
- `while` 문 추가하여 `family`를 `node`에 할당
- `node.name`으로 값을 반환하고 다시 `node`에 자식인 `node.child`를 할당해 반복한다.

``` javascript
class FamilyTree {
  constructor() {
    this.family = {
      name: 'Doris',
      child: {
        name: 'Martha',
        child: {
          name: 'Dyan',
          child: {
            name: 'Bea',
          },
        },
      },
    };
  }

  * [Symbol.iterator]() {
    let node = this.family;
    while (node) {
      yield node.name;
      node = node.child;
    }
  }
}

const family = new FamilyTree();
[...family];
// ['Doris', 'Martha', 'Dyan', 'Bea'];
```

- 복잡한 데이터 구조를 편하게 사용하려면 사용하는것을 추천하지만, 의도와 디버깅 등이 어려워지니 상황에 맞게 사용하자.

## **bind()**로 문맥 문제를 해결하라

- 저번 **TIP36 화살표 함수로 문맥 혼동을 피하라**에서 대략적으로 살펴봤는데 여기서 다시 자세히 살펴보자.

``` javascript
class Validator {
  constructor() {
    this.message = '가 유효하지 않습니다.';
  }

  // 입력값 하나다 유효하지 않는 경우 메세지 반환
  setInvalidMessage(field) {
    return `${field}${this.message}`;
  }

  // 모든 메세지를 담긴 배열을 순회하면서 유효하지 않는 메세지들 반환
  setInvalidMessages(...fields) {
    return fields.map(this.setInvalidMessage);
  }
}

const validator = new Validator();
validator.setInvalidMessage('도시');
// "도시가 유효하지 않습니다."
validator.setInvalidMessages('도시');
// VM5379:9 Uncaught TypeError: Cannot read property 'message' of undefined
```

- `setInvalidMessages` 메서드에서 `map`안에 `this.setInvalidMessage`는 `class` 내부에 바인딩외어
- `setInvalidMessage`을 호출하는데 여기서 `this`는 `map()` 메서드 콜백함수이므로 새로운문맥(`window`)에 바인딩 된다.
- 해결 방법은 메서드를 **화살표 함수로 변경하는 방법**과 명시적으로 **`bind()`를 사용하는 방법**이 있다.
  - 하지만 클래스에서는 메서드를 생성자에서 설정해야 한다.
- 
``` javascript
class Validator {
  constructor() {
    this.message = '가 유효하지 않습니다.';
    this.setInvalidMessage = field => `${field}${this.message}`;
  }

  setInvalidMessages(...fields) {
    return fields.map(this.setInvalidMessage);
  }
}
```

- 메서드가 많아지면 생성자함수는 너무 커진다.
- 그래서 `bind()`를 사용해보자. 문맥을 명시적으로 정할 수 있다.

``` javascript
function sayMessage() {
  return this.message;
}

const alert = {
  message: '위험해!',
};

const sayAlert = sayMessage.bind(alert);

sayAlert();
// '위험해!'
```

- 위에서 살펴본 `Validator`를 `bind()`를 사용해보자.

``` javascript
class Validator {
  constructor() {
    this.message = '가 유효하지 않습니다.';
  }

  setInvalidMessage(field) {
    return `${field}${this.message}`;
  }

  setInvalidMessages(...fields) {
    return fields.map(this.setInvalidMessage.bind(this));
  }
}
```

- 잘 작동하는데 좋긴한데 단점이 있다. 다른 곳에서 사용할때마다 `this.setInvalidMessage.bind(this)`를 계속 입력해야 한다.
- 생성자 함수 화살표 함수처럼 `bind()` 사용이 가능하다.
- 근데 직관적이긴하나 역시 함수가 많아지면 생성자 함수가 비대해진다.(화살표 함수에 단점이라고 책에서 말해 놓은 상태이다.)

``` javascript
class Validator {
  constructor() {
    this.message = '가 유효하지 않습니다.';
    this.setInvalidMessage = this.setInvalidMessage.bind(this);
  }

  setInvalidMessage(field) {
    return `${field}${this.message}`;
  }

  setInvalidMessages(...fields) {
    return fields.map(this.setInvalidMessage);
  }
}
```

- 가장 마지막에 설명해준걸 사용하는게 좋지 않을까? 책에서 항상 마지막에 해답을 알려주니깐..

## 결론

- `get`,`set`,`generator`를 사용하면 좋긴하다 의도 파악이 힘들니 잘 고려해서 사용하자.
- `this` 바인딩은 여러가지 방법이 있으니 상황에 맞게 알맞게 사용하자.(메서드가 적을때 많을때 등등 고려해보자.)