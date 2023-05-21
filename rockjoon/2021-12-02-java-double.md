# 자바에서 double 타입 다루기(feat. BIgDecimal)

## 0. 자바의 double 형

가장 손쉽게 소수점을 다룰 수 있고, 저장 범위도 int 보다 넓기 때문에 종종 사용되지만  
정확한 숫자를 처리해야 한다면 주의해야 할 점들이 있다.

## 1. 무엇이 문제일까?

### (1). 부동 소수점 문제
단순한 사칙연산으로 보이는 다음의 테스트는 통과할까?
```java
@Test
void test1() {
    double a = 0.3001;
    double b = 3;
    assertThat(a * b).isEqualTo(0.9003);
}
```
정답은 '실패' 입니다.
```java
Expecting:
<0.9002999999999999>
to be equal to:
<0.9003>
```
널리 알려진 바와 같이 자바에서는 부동소수점 방식을 사용하여 소수점을 저장한다.  
이 방식은 정확한 숫자를 저장하지 않고 **최대한 가까운 값을 저장**하는 방식이다.

 

### (2). 지수로 표현되는 문제

그렇다면 단순히 double을 String으로 변환시킨 아래의 테스트는 어떨까?
```java
@Test
void test2() {
    double a = 20000000.0;
    String strA = Double.toString(a);
    assertThat(strA).isEqualTo("20000000.0");
}
```
마찬가지로 '실패'입니다.

```java
Expecting:
 <"2.0E7">
to be equal to:
 <"20000000.0">
```
쌩뚱맞게 2천만이 2.0E7 (= 2.0 * 10^7), 즉 지수로 표현되었다.

## 2. 부동 소수점 문제 해결하기

### (1) BigDecimal

부동 소수점 문제는 BigDecimal을 사용하면 간단하게 해결 할 수 있다.

```java
@Test
void test3() {
    BigDecimal a = new BigDecimal("0.3001");
    BigDecimal b = new BigDecimal("3");
    assertThat(a.multiply(b).doubleValue()).isEqualTo(0.9003);
}
// pass
```

### (2) BigDecimal 사용시 주의점

이대로 해피엔딩이면 좋았겠지만, BigDecimal을 사용할 때도 주의해야 할 점이 있다.  
 0.35의 값을 담고 있는 두 개의 BigDecimal이 있다. 아래의 테스트는 통과할까?
```java
@Test
void test4() {
    BigDecimal a = new BigDecimal(0.35);
    BigDecimal b = BigDecimal.valueOf(0.35);
    assertThat(a).isEqualTo(b);
}
```

정답은 '실패' 입니다.
```java
Expecting:
 <0.34999999999999997779553950749686919152736663818359375>
to be equal to:
 <0.35>
```
double을 BigDecimal로 변환할 때는 new 생성자가 아닌 `valueOf 팩터리 메서드`를 사용해야 안전하다.  
더불어 valueOf는 캐싱된 인스턴스를 먼저 찾으므로, 메모리 효율성 면에서도 더 효율적이다.

*참고로 String을 BigDecimal로 변활 할때는 new 생성자를 사용해도 안전하게 처리 가능하다.(위의 test3 참조)*


## 3. 지수 표현의 문제 해결하기

### (1). BigDecimal 사용
BigDecimal의 `toPlainString()` 메서드를 사용하면 지수표현식이 아닌 일반 표현식으로 표현할 수 있다.  
toString()을 사용하면 아래와 같이 지수로 표현됨을 유의하자.
```java
@Test
void test5() {
    double a = 20000000;
    BigDecimal b = BigDecimal.valueOf(a);
    assertThat(b.toString()).isEqualTo("2.0E+7");
    assertThat(b.toPlainString()).isEqualTo("20000000");
}
// test pass
```

### (2). NumberFormat 사용
double -> String 으로 변환할 때 좀더 간단한 방법이 있다. NumberFormat을 사용하는 방법이다.  
NumberFormat 의 groupingUsed를 false로 설정하면 된다.

```java
@Test
void test6() {
    NumberFormat numberFormat = NumberFormat.getInstance();
    numberFormat.setGroupingUsed(false);

    double a = 20000000;
    String formatted = numberFormat.format(a);

    assertThat(formatted).isEqualTo("20000000");
}
// pass
```

## 4. 더 좋은 방법은 없을까?

double 로 인한 문제를 해결하기 위해 가장 좋은 방법은 double을 쓰지 않는 것이라고 생각한다.  
**double은 불안정하고, 이를 보완하기 위해서는 많은 부수적 작업들이 필요하다.**  
개인적으로도 실무에서 개발할 때 double을 종종 사용하긴 하지만, 다음과 같은 방법들도 고려해볼 수 있다.

### (1). double 대신 String 사용

모든 double 타입 대신에 String을 사용하고 연산이 필요한 경우에만 BigDecimal로 변환하는 방법이다.  
String <-> BigDecimal 간의 타입변환은 대체로 의도한 대로 이루어진다.

하지만 단점이 있다. **BigDecimal 자체가 무겁다**는 것이다.(참고로 BigDecimal 클래스는 5000라인이 넘는다.)  
또한 BigDecimal도 Integer와 마찬가지로 **immutable** 객체이기 때문에 변경이 이뤄질 때 마다 객체가 새롭게 만들어진다.  
거기에 연산할 때마다 매번 타입변환을 하기 때문에 연산작업이 많다면 이러한 것들이 부담이 될 수 있다.

따라서 이 방법은 *연산이 많지 않은 어플리케이션에서 간단하게 적용할 때* 적절하다.  
(ex. 적립 포인트들을 더하여 주문 금액에서 차감 해주는 어플리케이션)

### (2). double 대신 int 사용

double 대신 int를 사용하는 방법을 고려해 볼 수 있다.(범위가 +-21억이 넘을 경우에는 long사용)  
그럼 소숫점은 어떻게 하느냐? 단위를 변환시키는 것이다.

실제로 비트코인을 예로 들어 보자.  
1비트 코인은 현재 시세 기준으로 7000만원이다.  
0.0001 비트 코인이라도 잘못 연산될 경우 큰 차이가 벌어진다.  
이를 위해 비트코인에서는 '사토시'라는 단위를 사용한다.

```
0.00000001 BTC = 1 satoshi (약 0.7원)
```
0.0001 비트코인이 3개 값을 구하는 연산을 비교해보자.
```java
//BTC 로 연산할 경우
BigDecimal btc1 = BigDecimal.valueOf(0.0001);
BigDecimal count = BigDecimal.valueOf(3);
BigDecimal result = btc1.multiply(count);
```
```java
// satoshi 로 연산할 경우
int sts = 1000;
int count = 3;
int result = sts * count;
```

이 방법은 int를 계산하는 것이기 때문에 우리에게 너무나도 친숙한 연산자들 (+, -, *, /, >, <. =)을 바로 적용할 수 있다.  
또한 실수의 표현 문제나 지수 표현 문제 같은 것으로 부터 자유롭고, 근사치 표현으로 인한 부적확성도 걱정할 필요 없다.  

다만 이 방법도 단점이 있다. 설계 단계에서부터 철저하게 통일 되어야 한다는 것과  
나눗셈의 경우 mod(나누기 연산) 등을 사용하여 별도 처리를 해줘야 한다는 것이다.

## 5. 결론

* double을 사용할 때 정확히 원하는 값을 얻으려면 주의가 필요하다.  
* double 대신 String 이나 단위 변환을 하는 것도 하나의 방법이다. 
* 문득 은행이나 주식거래와 같이 매우 엄격한 환경에서는 이런 문제들을 어떻게 처리할까 궁금해졌다.


---
참고자료

* https://stackoverflow.com/questions/11368496/java-bigdecimal-bugs-with-string-constructor-to-rounding-with-round-half-up
* https://janggiraffe.tistory.com/190
* https://en.bitcoin.it/wiki/Satoshi_(unit)
* https://deersoul6662.tistory.com/82
* https://velog.io/@new_wisdom/Java-BigDecimal%EA%B3%BC-%ED%95%A8%EA%BB%98%ED%95%98%EB%8A%94-%EC%95%84%EB%A7%88%EC%B0%8C%EC%9D%98-%EB%84%88%EB%93%9C%EC%A7%93
