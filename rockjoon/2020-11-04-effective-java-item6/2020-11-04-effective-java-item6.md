# [ 이펙티브 자바 ] 아이템6. 불필요한 객체 생성을 피하라.

## 1. 불변 객체의 재사용

다음은 잘못된 객체 생성의 예이다.
```java
String s = new String("bikini");
```
위의 예는 실행될 때마다 **String 인스턴스를 새롭게 만든다.**
이를 아래와 같이 바꿀 수 있다.
```java
String s = "bikini";
```
이 방법은 `하나의 String 인스턴스를 사용`한다. 또한 같은 **문자 리터럴에 대해 같은 객체를 사용**하는 것이 보장된다.

---

## 2. 정적 팩터리 메서드를 통한 객체 재사용
아래의 예는 마찬가지로 **새로운 Boolean 인스턴스를 생성**한다.
```java
Boolean b = new Boolean("true");
```
하지만 `정적 팩터리 메서드를 사용하면 기존의 인스턴스를 반환`할 수 있다.    
(참고 : 아이템1 - 정적팩터리 메서드의 장점 : 기존의 인스턴스를 반환할 수 있음.)
```java
Boolean b = Boolean.valueOf("true");
```
Boolean의 valueOf는 Boolean 인스턴스를 반환하는 팩터리 메서드이다.      
Boolean 클래스는 내부적으로 TRUE와 FALSE 인스턴스를 미리 생성해놓고, 필요할 때마다 가져다 쓰는 `인스턴스 캐싱` 방법을 사용하고 있다.
```java
// TRUE와 FALSE를 미리 생성해놓고 필요할 때마다 이를 사용한다.
public static final Boolean TRUE = new Boolean(true);
public static final Boolean FALSE = new Boolean(false);
...

// valueOf 팩터리 메서드는 위에서 생성해 놓은 인스턴스를 반환한다.
public static Boolean valueOf(String s) {
        return parseBoolean(s) ? TRUE : FALSE;
}
```

---

## 3. 생성 비용이 비싼 객체의 재사용
생성 비용이 비싼 경우에도 인스턴스 캐싱을 통해 생성 비용을 줄일 수 있다.
다음의 예는 주어진 문자열이 유효한 로마 숫자인지를 확인하는 메서드이다.
```java
static boolean isRomanNumeral(String s) {
  return s.matches("^(?=.)M*(C[MD]|D?C{0,3})"
                   + "(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$");
}
```
String.matches 메서드는 **내부적으로 정규표현식을 위해 Pattern 인스턴스를 생성**한다.   
하지만 이 인스턴스는 메서드가 실행되고 나서 즉시 버려진다. 위의 메서드가 여러번 호출되면 **불필요한 Pattern 인스턴스가 여러번 생성**되고 사라지는 것이다.

이를 개선하기 위하여 `Pattern을 직접 생성해 캐싱`해두고, isRomanNumeral **메서드가 호출될 때 재사용**하도록 바꿀 수 있다.
```java
// Pattern 인스턴스를 미리 캐싱한다.
private static final Pattern ROMAN = Pattern.compile(
  "^(?=.)M*(C[MD]|D?C{0,3})"
  + "(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$");

// 메서드 내부에서 미리 생성한 Pattern 인스턴스를 사용한다.
static boolean isRomanNumeral(String s) {
  return ROMAN.matcher(s).matches();
}
```

---
## 4. 어댑터(뷰) 패턴에서의 객체 재사용

> 어댑터 패턴 : 실제 작업은 뒷단 객체에 위임하고, 자신은 제 2의 인터페이스 역할을 하는 객체

어댑터 객체는 뒷단 객체를 관리하기 위한 객체이므로 뒷단 객체 외에 관리할 상태가 없다.   
따라서 뒷단 객체 하나 당 어댑터 객체 하나씩만 만들어 재사용할 수 있다.

다음은 Map인터페이스의 keySet 메서드의 예이다.  
`keySet 메서드는 호출할 때마다 새로운 Set인스턴스를 반환하는 것이 아니라, 같은 Set 인스턴스를 반환한다.`
```java
Map<String, String> map = new HashMap<>();
        map.put("key1", "value1");
        Set keySet1 = map.keySet();
        Set keySet2 = map.keySet();

        System.out.println(keySet1 == keySet2);             //true
        System.out.println(keySet1.equals(keySet2));        //true
```
* 이 예에서는 `Map이 실제 작업을 처리하는 뒷단 객체`가 되고, `keySet으로 생성된 뷰가 어댑터 객체`가 된다.     

* 하나의 **Map에 대해서는 모든 keySet이 같으므로**, 여러개가 생성될 필요가 없다. 따라서 같은 Set 인스턴스를 반환하도록 되어있다.

---
## 5. 오토박싱 사용 시 주의점
> 오토박싱 : 기본타입과 박싱된 기본타입 간의 상호 변환을 자동으로 진행해주는 기술
```java
private static long sum(){
  Long sum = 0L;	
  for(long i =0; i <= Integer.MAX_VALUE; i++){
    sum += i;       // 오토박싱 과정에서 Long인스턴스 생성됨
  }
  return sum;
}
````
위의 예는 얼핏 봤을봤을 때 별 문제가 없어보인다. 하지만 함정이 숨어 있다.    
바로 sum을 Long으로 선언한 것 때문에 long과의 오토박싱 과정에서 불필요한 Long인스턴스가 생성된다는 것이다.

**박싱된 기본타입보다는 기본타입을 하고, 의도치 않은 오토박싱이 숨어들지 않도록 주의하자.**

---
## 6. 마무리
* 이번 아이템은 주제는 `객체 생성을 피하라`가 아니라 `재사용이 가능한 객체의 생성을 피하라`로 이해해야 한다.
* 현대의 jvm에서는 작은 객체를 생성하고 회수하는 일이 크게 부담되지 않는다.
* 오히려 적절한 객체의 추가 생성은 프로그램의 명확성, 간결성, 기능을 위해 좋은 경우가 많다.