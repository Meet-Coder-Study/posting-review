# 자바스크립트 코딩의 기술(시리즈 8 - 클래스로 인터페이스를 간결하게 유지하라#1)

- 자바스크립트 코딩의 기술 책을 읽고 복습 겸 정리하는 포스팅이다.
- 시리즈 1이 시작이며 시리즈 몇까지는 대지는 진행하면서 가늠잡아 보겠다.

## 개요

- 프로토타입이 조합된 자바스크립트 클래스를 살펴볼 예정이다.
  - 읽기 쉬운 클래스를 만들어라
  - 상속으로 메서드를 공유하라
  - 클래스로 기존의 프로토타입을 확장하라

## 읽기 쉬운 클래스를 만들어라(TIP37)

- 자바스크립트에서 클래스를 작성하는 방법을 살펴보자.

```javascript
class Coupon {
  constructor(price, expiration) {
    this.price = price;
    this.expiration = expiration || "2주";
  }
}

const coupon = new Coupon();
coupon.price; // 5
coupon["expiration"]; // 2주
```

- 클래스를 선언할때 `class` 키워드 사용
- 새로운 인스턴스 생성할땐 `new` 키워드 사용
- 생성자 함수(`constructor`)에서는 여러 속성 정의 가능

  - 반드시 생성해야되는건 아니지만 속성을 선언해야 하므로 대부분 사용한다.
  - `this` 문맥을 생성, 클래스에 속성(`price, expiration`) 추가 가능
  - 생성자에 인수 전달이 가능하므로 동적으로 속성 설정 가능

- 이제 클래스에 메서드를 추가해보자.

```javascript
class Coupon {
  constructor(price, expiration) {
    this.price = price;
    this.expiration = expiration || "2주";
  }
  getPriceText() {
    return `$ ${this.price}`;
  }
  getExpirationMessage() {
    return `이 쿠폰은 ${this.expiration} 후에 만료됩니다.`;
  }
}

const coupon = new Coupon(5);
coupon.getPriceText(); // '$ 5'
coupon.getExpirationMessage(); // '이 쿠폰은 2주 뒤에 만료됩니다.'
```

- 클래스 메서드를 클래스의 인스턴스에서 호출한다면 `this` 문맥이 클래스가 된다.
- 다음에는 클래스 상속을 알아보자.

## 상속으로 메서드를 공유하라.(TIP38)

- 클래스를 확장하고 부모 클래스의 메서드를 호출하는 방법을 살펴보자.
- 이전에 배운 `Coupon` 클래스를 상속(확장)해 짧은 기간만 사용하는 `FlashCoupon`를 만들어보자.

```javascript
import Coupon from "./extend";
class FlashCoupon extends Coupon {}
```

- `FlashCoupon`는 `extends` 키워드를 사용해 `Coupon` 클래스를 상속받는다.
- `Coupon`의 기존 속성, 메서드 접근 가능하다.
- 새로운 속성, 메서드를 추가할 것이 아니라면 상속한 이유가 없다.
- 속성을 추가해보자.

```javascript
import Coupon from "./extend";
class FlashCoupon extends Coupon {
  constructor(price, expiration) {
    super(price);
    this.expiration = expiration || "2시간";
  }
  //
  isRewardsEligible(user) {
    super.isRewardsEligible(user) && this.price > 20;
  }
  // super.isRewardsEligible() 는 부모클래스에 메서드를 불러온다.
  // 같은 이름의 메서드를 추가하고 부모 메서드를 부를때 super를 사용한다.
}
const flash = new FlashCoupon(10);
flash.price; // 10
flash.getExpirationMessage(); // '이 쿠폰은 2시간 뒤에 만료됩니다.'
```

- `super` 키워드를 이용해 부모 클래스의 생성자에 접근할 수 있다.
  - 상속받을 인자(`price`)를 넘기면 사용이 가능하다.
- 그 다음 새로운 속성을 추가하거 덮어 씌울 수 있다(`expiration`).
- `getExpirationMessage` 메서드 실행할때 `FlashCoupon`에 있는지 확인 후 없으면 부모클래스에서 찾는다.

## 클래스로 기존의 프로토타입을 확장하라(TIP39)

- 기존의 프로토타입과 함께 클래스를 사용하는 방법을 살펴보자.
- 자바스크립트는 프로토타입언어이다.
- 새로운 인스턴스를 생성할때 메서드를 복제하지 않는다.(전통 적인 객체 지향 언어에서는 모든 속성, 메서드가 복사된다.)
- 객체 인스턴스에 있는 메서드를 호출하면 프로토타입에 있는 메서드를 호출한다.
- [참고 : 자바스크립트 프로토타입, 클래스의 차이](https://medium.com/javascript-scene/master-the-javascript-interview-what-s-the-difference-between-class-prototypal-inheritance-e4cd0a7562e9)
- 따라서 `class`가 새로운 기능이 아니다.

- ES5이전 `new`키워드를 이용한 생성자 함수를 통해 살펴보자.

```javascript
function Coupon(price, expiration) {
  this.price = price;
  this.expiration = expiration || "2주";
}
const coupon = new Coupon(5, "2개월");
coupon.price; // 5
```

- `new` 키워드 사용
- 함수를 생성자로 사용하고 `this` 문맥을 생성되는 인스턴스에 바인딩
- 이때 함수 이름 첫번째는 대문자!
- 여기서 메서드를 추가할 수도 있지만 프로토타입에 직접 추가하는 것이 훨씬 더 효율적이다.
  - 인스턴스가 만들어질때마다 메서드를 추가해야되지만 프로토타입에 추가하면 한번만 추가된다.
  - 아래 코드를 참고하자.

```javascript
Coupon.prototype.getExpirationMessage = function () {
  return `이 쿠폰은 ${this.expiration} 후에 만료됩니다.`;
};
coupon.getExpirationMessage(); // 이 쿠폰은 2개월 후에 만료됩니다.
```

- `class` 키워드를 이용해서 객체를 생성할때도 프로토타입을 생성하고 문맥을 바인딩한다.
- 단지, 장점은 직관적인 인터페이스이다. 겉만 다르고 속은 똑같다.
- `class` 를 사용하면서 프로토타입 생성자 함수를 상속받을 수 있다.

```javascript
class FlashCoupon extends Coupon {
  constructor(price, expiration) {
    super(price);
    this.expiration = expiration || "2시간";
  }
  getExpirationMessage() {
    return `이 쿠폰은 깜짝 쿠폰이며 ${this.expiration} 후에 만료됩니다.`;
  }
}
```

## 결론

- 시간이 되면 자바스크립트 프로토타입 체인 개념을 살펴보면 더 도움이 많이 될것이다.
  - [쉽게 이해하는 자바스크립트 프로토타입 체인](https://meetup.toast.com/posts/104)
  - [상속과 프로토타입 MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain)

- JavaScript에서 class를 만든 이유에 대한 내용은 [ES6 class 도입에 대한 이해](https://mygumi.tistory.com/235) 참고!
- [자바스크립크에스 클래스 사용하기](https://levelup.gitconnected.com/using-classes-in-javascript-e677d248bb6e) 참고!
  - 여기서 class가 만든 이유를 단순히 객체를 쉽게 생성하기 위해서라고 한다.
  
> The most important thing to remember: Classes are just normal JavaScript functions and could be completely replicated without using the class syntax. It is special syntactic sugar added in ES6 to make it easier to declare and inherit complex objects.
> 번역 - 기억해야 할 가장 중요한 점 : 클래스는 일반적인 JavaScript 함수일 뿐이며 클래스 구문을 사용하지 않고 완전히 복제 할 수 있습니다. 복잡한 객체를보다 쉽게 선언하고 상속 할 수 있도록 ES6에 추가 된 특수한 구문 설탕입니다.
