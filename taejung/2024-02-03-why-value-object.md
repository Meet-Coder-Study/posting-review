원본: https://cloud-whale.hashnode.dev/why-value-object

# Value Object를 통한 안전한 데이터 사용

## 개요

최근 BLE 프로토콜을 통해서 IOT기기와 통신을 하는 애플리케이션을 개발할 일이 있었는데 펌웨어 업데이트 이후에 갑자기 통신이 안 되는 문제가 발생을 했다. 원인을 찾아보니 일부 기기의 unique key를 advertising 하는 로직이 바뀌어 포맷은 동일한데 일부 자릿수가 16진수로 표기될 때 앞의 0을 빼먹고 전달이 된 것과 대소문자의 차이로 이러한 문제가 발생을 했다는 것을 알게 됐다.

이때 단순하게 IoT device를 나타내는 클래스의 getter를 통해서 수정을 할까 하다가 코드가 너무 길어져서 가독성, 유지보수성이 떨어지기도 해서 value object로 분리하여 validation의 책임을 분리시키기로 했다. 오늘은 이때 공부했던 내용을 예시와 함께 정리를 해보려고 한다.

## Primitive Obsession

Primitive Obsession, 원시타입 집착은 복잡한 개념을 표현할 때 기본 자료형을 과도하게 사용하는 것을 말한다. 예를 들어, 2차원 좌표, 기간, 전화번호와 같은 복잡한 데이터 타입을 특정 클래스나 구조체를 만들지 않고 프리미티브로 표현하는 것이 여기에 포함된다.

전화번호는 문자열만을 이용해서 충분히 나타낼 수 있다. 하지만 문자열이 가지고 있는 모든 속성을 전화번호가 가지고 있지는 않다. 예를 들어, "문자열이 지원하는 더하기 연산을 전화번호가 지원을 해야 할까?"라고 생각한다면 그 대답은 "아니요"가 될 것이다.

Primitive Obsession는 이처럼 도메인적으로 해당 값이 나타내는 의미를 직관적으로 판단할 수 없게 만든다. 그뿐만 아니라 데이터와 관련된 검증 및 조작 로직을 코드 전체에 분산시켜 유지 관리를 어렵게 만들고 IDE의 도움을 받기 어렵기 때문에 실수가 일어나기도 쉽다.

Value Object가 바로 이러한 Primitive Obsession을 피하면서 값이 도메인 내에서 가지는 의미를 명확하게 전달할 수 있게 해주는 장치이다.

## Value Object(VO)란?

Value Object는 도메인 주도 설계(domain-driven development, DDD)의 핵심적인 개념 중 하나로 도메인의 한 측면을 나타내는 객체이다. 보통 한 개 또는 그 이상의 값들을 묶어서 특정 값을 나타내는 객체로 대표적인 예시로는 x, y 좌표로 구성되는 2차원 좌표나 시작 날짜와 끝 날짜로 구성되는 기간 등이 있다.

Value object가 가져야 하는 주요 특징은 값 기반 동등성 검사와 불변성, 자기 유효성 검사가 있다. 

## Value Object의 특징

### 값 기반 동등성 검사

[동일성(identity)과 동등성(equality)의 차이](https://hudi.blog/identity-vs-equality/)를 간략하게 설명하면 동일성은 비교 대상인 두 객체의 메모리 주소가 같음을 의미하고 동등성은 두 객체가 논리적으로 동일한 값을 나타내고 있음을 의미한다.

```javascript
const point1 = { x: 1, y: 10 };
const point2 = { x: 1, y: 10 };
```

예를 들어, 2차원 좌표를 표현하는 값을 가지고 있는 두 변수 `point1`, `point2`가 있을때 두 값은 내부의 x, y 좌표값이 같기 때문에 동등하지만 서로 다른 변수이기 때문에 동일하지는 않다고 볼 수 있다.

동등성 검사는 언어마다 다르게 이루어진다. 예를 들어 Java에서는 `equals`, `hashcode`를 재정의해야 하는 반면에 functional programming 언어인 Haskell이나 Clojure에서는 기본적으로 속성을 기준으로 한 동등성 검사를 지원한다.

### 불변성 (Immutability)

Value Object는 그 자체로 값인 객체이고 이 값이 불변이어야 한다는 원칙이 있다. 그렇기 때문에 수정자를 가지고 있지 않아야 하며 만약에 값을 바꾸고 싶다면 새로운 객체를 만들어서 값을 할당하는 방법 뿐이다.

이러한 특징 덕분에 side effect 발생을 방지할 수 있어 의도하지 않은 곳에서 이 값이 수정되어 발생하는 [Aliasing Bug](https://martinfowler.com/bliki/AliasingBug.html) 걱정 없이 사용할 수 있다.

### 자기 유효성 검사 (Self-validation)

만약에 원시타입을 사용하여 복잡한 값을 표현한다면 값의 유효성을 사용하는 측에서 검사를 해야 한다. Value Object의 유효성 검사는 생성 시간에 이루어져서 항상 유효한 상태를 유지할 수 있도록 해야 하며 유효하지 않는 값이 들어왔을 때는 Value Object를 생성할 수 없어야한다.

Value Object의 불변성과 자기 유효성 검사를 통해 항상 유효한 상태 유지를 보장할 수 있어 클라이언트 쪽에서 도메인 규칙이 깨질 염려를 하지 않을 수 있다.

## Device의 unique key를 Value Object로 표현

```dart
class DeviceUniqueKey {
  final String _uniqueKey;

  DeviceUniqueKey(String uniqueKey)
      : assert(uniqueKey.isNotEmpty),
        assert(
          uniqueKey
              .split(":")
              .map((e) => int.tryParse(e, radix: 16) != null)
              .every((element) => element),
        ),
        _uniqueKey = uniqueKey.toUpperCase();

  @override
  bool operator ==(Object other) {
    return other.hashCode == hashCode;
  }

  @override
  int get hashCode => _uniqueKey.hashCode;
}
```

위의 dart로 작성된 unique key를 나타내는 value object을 살펴보면 앞서 본 Value Object의 특징처럼 생성 시점에 validation을 수행하여 특정한 포맷을 만족하도록 강제하며 자기 유효성 검사를 수행하는 것을 볼 수 있다. 그리고 불변성을 보장하기 위해 내부의 값을 수정할 수 없게 만들었으며 `==` 연산자와 `hashCode`를 재정의하여 값을 통한 동등성 검사를 지원하고 있다.

## 결론

Value Object가 가지는 불변성, 자기 유효성 검사 등 클라이언트가 안심하고 사용할 수 있게 해주는 특성들은 협업 상황에서 더욱 빛을 발하는 것 같다. 특히 내가 만들어둔 객체가 의도한 상태대로 있게 해준다는 것은 커뮤니케이션 과정에서 발생할 수 있는 오류들을 줄일 수 있다는 것이 굉장히 큰 매력으로 느껴졌다. 도메인이 더 복잡해질수록 Value Object가 가져다주는 코드의 명확성, 유지보수성이 더 큰 장점으로 다가올 것 같다.

앞으로는 혼자서 개발을 할 때도 꽤 오래 전에 만들어 둔 로직들은 까먹을 수도 있기 때문에 앞으로 validation 이 필요한 값의 경우에는 Value Object를 통해서 처리를 하는 습관을 들여야겠다.

다음에는 Value Object를 공부하면서 정리를 하고 있었던 일급 컬렉션에 대한 포스팅을 할 것이다.

## References

* https://martinfowler.com/bliki/ValueObject.html
    
* https://en.wikipedia.org/wiki/Value\_object
    
* https://hudi.blog/value-object/
    
* https://hudi.blog/identity-vs-equality/
    
* https://ksh-coding.tistory.com/83
    
* https://velog.io/@livenow/Java-VOValue-Object%EB%9E%80
    
* https://medium.com/@nicolopigna/value-objects-like-a-pro-f1bfc1548c72
    
* https://medium.com/fistkim101/ddd-%EC%84%B8%EB%A0%88%EB%82%98%EB%8D%B0-3-%EB%8F%84%EB%A9%94%EC%9D%B8-%EC%A3%BC%EB%8F%84-%EC%84%A4%EA%B3%84-%EA%B8%B0%EB%B3%B8-%EC%9A%94%EC%86%8C-99eead8e96f3

