## Test Coverage

Test coverage 란,Product Code 가 자동화된 Test 로 얼마나 수행되었는지 확인 할 수 있는 metrics 을 말한다.
측정 방법에는 여러가지가 있는데, 이 글에선 `Statement / Branch / Condition Coverage` 에 대해서만 정리한다.


## Statement Coverage

Line coverage 라고도 불리며, 말그대로 테스트 코드로 인해 수행된 Line 수를 측정한다.

> 측정 방법

`테스트로 수행된 라인 / 전체 코드 라인 * 100`

Line coverage 가 100% 라고 해서, `모든 경우를 다 Test 했다` 라고 보긴 어렵다.

```java
public class CoverageSample {
	public int sample(int size) {
		String str = null;
		if (size > 5 || size < 0 ) {
			str = "hello";
		}
		return str.length();
	}
}

// test

@Test
void lineCoverage() {
    CoverageSample coverageSample = new CoverageSample();

    assertEquals(5, coverageSample.sample(7));
}
```

위 예시는 Line Coverage 로 측정시, 100%로 나오지만, boolean 값을 false 로 설정시, NPE 가 발생하는 코드이다.


![jacoco report](./jacoco-report.png)

위 report 를 통해, Line 은 100%지만, branch 는 50%인걸 확인 할 수 있다.

## Branch Coverage 혹은 Decision Coverage

테스트 대상 코드의 분기문(`branch`)을 얼마나 검증했는가를 나타내는 지표.
각 branch 의 결과에 대한 지표로 coverage 를 표시한다.

> branch 에 들어가는 조건이 2개 이상일 경우, 세부 항목의 true / false 값은 측정하지 않으며, 결과만을 측정한다.

`검증한 분기 수 / 전체 분기 수 (true/false) * 100`    
`(CT + CF) / (2*B)`

위 예시에선 branch coverage 100%를 채우기 위해, true / false 2개의 case 가 필요하다.

```java
@Test
void lineCoverage() {
    CoverageSample coverageSample = new CoverageSample();

    assertEquals(5, coverageSample.sample(7));
    assertThrows(NullPointerException.class, () -> {
        coverageSample.sample(3);
    });
}
```

## Condition Coverage

Branch coverage 가 분기문의 전체 결과를 확인한다면, Condition Coverage 는 분기문의 세부 조건식이 true/ false로 테스트 되었는지를 확인한다.

`[(수행된 분기 + 조건의 수) / (전체 분기 + 조건의 수)] × 100`

```java
@Test
void lineCoverage() {
    CoverageSample coverageSample = new CoverageSample();

    assertEquals(5, coverageSample.sample(7));
    assertThrows(NullPointerException.class, () -> {
        coverageSample.sample(3);
    });
}
```

Condition Coverage 100%를 만족하기 위해선, 분기에 들어가있는 조건 식이 true / false 로 계산되어야한다.
아래 경우에도 Condition coverage 가 통과 한다.

```
true / true
false / false
```

> 모든 조합을 확인하는 mc/dc coverage 도 있지만, 여기선 다루지 않는다.

## Jacoco 와 SonarQube

[Jacoco](https://www.jacoco.org/jacoco/) 는 사용자가 작성한 테스트를 이용하여, report 를 생성해주는 plugin 이다.
Jacoco는 agent를 이용해 바이트 코드를 읽어 report 를 생성한다. (class 파일을 조작하지않고, byte code를 메모리에 로드할때 조작한다. `On-the-fly`)
jacoco 가 생성한 report를 이용하여 sonarQube 가 coverage 를 계산하는 방식.

## 여담

sonarQube 에서는 Condition Coverage 를 branch Coverage 와 동일시한다. [참고](https://docs.sonarqube.org/latest/user-guide/metric-definitions/#header-9)
관련 링크를 모아놓은 블로그 [참고](https://m.blog.naver.com/genycho/221412530521)

## 참고

[[Java] JaCoCo with PowerMock code coverage problem](https://sanghaklee.tistory.com/68)    
[Code Coverage Tutorial: Branch, Statement, Decision, FSM](https://www.guru99.com/code-coverage.html)    
[differences-between-line-and-branch-coverage](https://stackoverflow.com/questions/8229236/differences-between-line-and-branch-coverage)   
[Gradle 프로젝트에 JaCoCo 설정하기](https://woowabros.github.io/experience/2020/02/02/jacoco-config-on-gradle-project.html)