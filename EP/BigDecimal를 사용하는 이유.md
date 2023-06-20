# Overview

금액을 다루는 값의 데이터 타입은 정밀도의 문제로 `BigDecimal`을 주로 사용한다. `double`, `long`, `float`가 왜 금액을 다루는 경우에 안좋은 선택이 되는지 확인해보자.

| Type | 범위 | 크기 | 유효자릿수 |
| --- | --- | --- | --- |
| float | 1.4E-45 ~ 3.4028235E38 | 4 byte | 소수점 7번째 까지 유효 |
| double | 4.9E~324 ~ 1.7976931348623157E308 | 8 byte | 소수점 16번째 까지 유효 |

소수점을 저장할 수 있는 타입인 `float`과 `double`은 소수점의 정밀도가 완벽하지 않아 값의 오차가 생길 수 있다. 소수점 이하의 수를 다룰 때 `double`과 `float`은 사칙연산시 정확한 값을 출력하지 않을 수 있다. 그 이유는 내부적으로 값을 저장할 때 이진수의 근사치를 저장하기 때문이다.

컴퓨터에서 소수점을 표현하는 방법은 2가지이다. 고정소수점과 부동소수점이다.

## 고정소수점

특정 비트를 기준으로 정수와 소수점을 구분하는 방법으로 고정적으로 정해놓은 방법

## 고정소수점

특정 비트를 기준으로 정수와 소수점을 구분하는 방법으로 고정적으로 정해놓은 방법

![image](https://user-images.githubusercontent.com/66561524/189508129-efb7e872-2e8f-45b7-bce2-ac7c525be536.png)

![image](https://user-images.githubusercontent.com/66561524/189508132-07213285-f2e0-489f-9845-0c72f41d88d7.png)

## 부동소수점

고정소수점 방식과 달리 소수점의 위치를 가변적으로 표현할 수 있는 방법(소수점이 가변적이기 때문에 떠다닌다해서 부동, float)

지수부에서 소수점의 위치값을 가지고 있고 가수부에서 숫자를 표현

![image](https://user-images.githubusercontent.com/66561524/189508139-bbdd73a7-13ff-4ca1-849c-82794baa0d91.png)

![image](https://user-images.githubusercontent.com/66561524/189508141-cc09cbba-f4ac-431b-a4b2-3d0075fb7c08.png)

- 자바의 `float`, `double`이 모두 부동소수점 방식으로 구현

# 1. 반올림 방법

Java SE 1.6에서 도입된 계수법으로 `Roundingmode`에 의해 제어가 된다. 통화를 위해 도입된 `NumberFormat`은 기본 반올림 모드가 `HALF_EVEN`이다. 남은 값이 등거리(equidistant)이면 짝수 쪽으로 라운딩된다.

```kotlin
RoundingMode 계수법에서 사용 가능한 또 하나의 모드는 다음과 같다.

CEILING 항상 양수 무한대로 라운딩한다.
DOWN 항상 0으로 라운딩한다.
FLOOR 항상 음수로 라운딩한다.
UP 항상 0으로부터 벗어나서 라운딩한다.
HALF_DOWN 항상 가장 가까운 인접 수로 라운딩한다. 단, 두 인접 수 모두 등거리라면 버림한다.
HALF_UP 항상 가장 가까운 인접 수로 라운딩한다. 단, 두 인접 수가 모두 등거리라면 올림한다.
UNNECESSARY 라운딩할 필요 없이 정확한 결과를 선언한다.
```

자바9 이후부터는 `BigDecmial` 반올림 사용시 `Roundingmode`가 일반적으로 사용된다.

```kotlin
BigDecimal tax = total.multiply(taxPercent);
tax = tax.setScale(2, RoundingMode.HALF_UP);
```

# 2. float, dobule에서 BigDecimal로 변환하는 방법

- float이나 double로 값을 선언하고 big decimal로 변환하면 역시나 정확하지 않는 값을 선언하게 되어 잘못된 값이 나온다.
- String으로 선언을 하거나 String.valueOf()를 사용해줘야 한다.

```kotlin
@Component
public class AppRunner implements ApplicationRunner {
    BigDecimal initWithFloat = new BigDecimal(1.1f);
    BigDecimal floatToStringBigDecimal = new BigDecimal(String.valueOf(1.1f));
    BigDecimal initWithDouble = new BigDecimal(1.1d);
    BigDecimal initWithString = new BigDecimal("1.1");

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("new BigDecimal(1.1f): " + initWithFloat);
        System.out.println("new BigDecimal(1.1d): "+ initWithDouble);
        System.out.println("new BigDecimal(stringVal): "+ initWithString);

        System.out.println("new BigDecimal(String.valueOf(1.1f)): "+floatToStringBigDecimal);
    }
}
```

![image](https://user-images.githubusercontent.com/66561524/189508150-1af35176-6c13-4e5c-bd57-6f46e35fc5b2.png)

## BigDecimal이 값을 저장하는 방법

BigDecimal은 `intVal(BigInteger), percision(int), scale(int), intCompact(int)`로 값을 구성한다.

`percision`은 해당 숫자의 총 자리 수를 나타내며, `scale`은 소수점 이후의 자리 수를 나타낸다.`intVal`은 정수로 표현된 `BigDecimal`의 값을 `BigInteger`에 저장한다. (ex. 123.45 -> 12345)

만약 `BigDecimal`의 길이(“.” 포함)가 **18자리 이하**일 땐, `intVal`에 값을 따로 저장하지 않고 `intCompact`에 **정수 값을 저장**한다.

```kotlin
// persion 6, scale 2, intVal = null, intCompact = 12345
BigDecimal b1 = new BigDecimal("123.45"); 

// persion 18, scale 0, intVal = null, intCompact = 123451234512345123
BigDecimal b2 = new BigDecimal("123451234512345123"); 

// persion 18, scale 8, intVal = 123451234512345123, intCompact = 123451234512345123
BigDecimal b3 = new BigDecimal("1234512345.12345123");
```

## BigDecimal 용어 정리

- precision: 숫자를 구성하는 전체 자리수라고 생각하면 편하나, 정확하게 풀이하면 왼쪽이 0이 아닌 수가 시작하는 위치부터 오른쪽이 0이 아닌 수로 끝나는 위치까지의 총 자리수다. `unscale`과 동의어다.
    
    
    **ex) 012345.67890의 precision은 11이 아닌 9입니다.**
    
- scale: 전체 소수점 자리수라고 생각하면 편하나, 정확하게 풀이하면 소수점 첫째 자리부터 오른쪽부터 0이 아닌 수로 끝나는 위치까지의 총 소수점 자리다. `fraction`과 동의어이다.
    
    
    **ex) 012345.67890의 scale은 4다. 하지만 0.00, 0.0의 scale은 모두 1이다. `BigDecimal`은 32bit의 소수점 크기를 가진다.**
    

- DECIMAL128: IEEE 754-2008에 의해 표준화된, 부호와 소수점을 수용하며, `최대 34자리까지 표현 가능한 10진수를 저장할 수 있는 형식이다`

> 극단적으로 미국 정부의 총 부채액이 15조 7천 500억 달러로 총 14자리임을 감안하면, 금융권에서 처리되는 대부분의 금액을 수용할 수 있는 크기이다. Java에서는 `BigDecimal` 타입을 공식적으로 지원한다.
> 

> `BigDecimal`은 연산처리가 기본타입보다 훨씬 느리다. 따라서 기본타입을 사용할 수 있는 범위안에서는 기본타입으로 사용해주고 정확한 계산을 해야하는 도메인 안에서만 사용을 해주자.

# Reference

[Big decimal은 왜 쓰는 거쥬?](https://velog.io/@probsno/Big-decimal%EC%9D%80-%EC%99%9C-%EC%93%B0%EB%8A%94-%EA%B1%B0%EC%A5%AC)

[서비의 다락방](http://www.yunsobi.com/blog/227)
