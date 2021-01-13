# 응집도(Cohesion) vs 결합도(Coupling)

## 서론

![cohesion-vs-coupling-1.png](https://github.com/ksy90101/TIL/blob/master/computerScience/image/cohesion-vs-coupling-1.png?raw=true)

- OPP에서는 응집도는 높히고 결합도는 낮춰야 한다는 말을 많이 하게 된다.
- 그렇다면 실제 응집도는 무엇이고 결합도는 무엇일까?

## 응집도(Cohesion)란?

- 하나의 모듈이 하나의 기능을 수행하는 요소들간의 연관성 척도
- 독립적인 모듈이 되기 위해서는 응집도가 강해야 한다.

### 응집도가 낮은 클래스의 문제점

- 이해하기 힘들고
- 따로 재사용하기 힘들며
- 유지보수하기 힘들고
- 다른 클래스의 변화에 민감하게 된다.

### 응집도가 높은 클래스의 특징

- 단일 책임을 가진 클래스
- 다른 클래스와 잘 협력하는 클래스

## 응집도의 종류

- 우연적 응집도 < 논리적 응집도 < 시간적 응집도 < 절차적 응집도 < 교환적 응집도 < 순차적 응집도 < 기능적 응집도

### 기능적 응집도(Functional Cohesion)

- 가장 응집도가 높은 형태로 가장 좋은 형태이다.
- 모듈 내부의 모든 기능이 단일 목적을 위해 수행되는 경우를 말한다.

### 순차적 응집도(Sequential Cohesion)

- 모듈 내에서 한 활동으로 부터 나온 출력값이 다른 기능에 사용할 경우

```java
public void readAndWriteFile(Path path) {
	String content = readFile(path);
	writeFile(content);
}
```

### 통신적(교환적) 응집도(Communicational Cohesion)

- 동일한 입력과 출력을 사용하여 다른 기능을 수행하는 활동들이 모여있는 경우
- 예제로 같은 입력 자료를 사용하여 A를 계산한 후 B를 계산하는 경우

### 절차적 응집도(Precedural Cohesion)

- 모듈이 다수 관련 기능을 가질 때 모듈 안의 구성요소이 그 기능을 순차적으로 수행할 경우

```java
public void getContnet(Path path) {
	if (path.isAccess()) {
		return readFile(path);
	}
		throw new IllegalAccessException();
}
```

### 일시적 **응집도(Temporal Cohesion)**

- 연관된 기능이라기 보단 특정 시간에 처리되어야 하는 활동들을 한 모듈에서 처리할 경우
- 예를 들면 예외 상황이 발생했을 때 로그를 개발자가 전송하는 기능 등 순서와 상관없는 경우를 말한다.

```java
public Feed getFeed(URI uri) {
	try {
		return crawing(uri);
	} catch (Exception e) {
		transferLog(e);
	}
}
```

### **논리적 응집도(Logical Cohesion)**

- 유사한 성격을 갖거나 특정 형태로 분류되는 처리 요소들이 한 모듈에서 처리되는 경우

```java
public void setValue(String name, int value) {
	if ("height".equals(name)) {
		height = value;
	}
	if ("width".equals(name)) {
		width = value;
	}
}
```

- 위의 코드를 아래와 같이 리팩토링을 하면 기능적 응집도 가된다.

```java
private void setHeight(int height) { this.height = height; }
private void setWidth(int width) { this.width = width; }
```

### **우연적 응집도(Coincidental Cohesion)**

- 모듈 내부의 각 구성요소들이 연관이 없을 경우
- 가장 좋지 않은 응집도이다.

## 결합도(Coupling)란?

- 어떤 모듈이 다른 모듈에 의존하는 정보를 측정하는 것이다
- 즉, 두 모듈간의 상호 의존하는 정도 또는 두 모듈 사이의 연관관계를 이야기 한다.
- 독립적인 모듈이 되기 위해서는 결합도가 낮아야 한다.

### 결합도가 높은 클래스의 문제점

- 연관된 다른 클래스가 변경되면 더불어 변경해야 하고
- 수정하려는 클래스를 이해하기 위해 연관된 다른 클래스를 함께 이해해야 하고
- 재사용하기 힘들다

### 결합도가 낮은 클래스의 특징

- OCP의 원칙을 잘 지킨 클래스
    - 즉, 확장에는 열려있고 변경에는 닫혀 있는 클래스
- 다형성을 잘 지킨 클래스

## 결합도의 종류

### 자료 결합도(Data Couling)

- 가장 결합도가 낮고 가장 좋은 형태이다.
- 모듈끼리 단순히 데이터를 주고 받는 경우를 말한다.
- 또한 기능 수행에 있어서 로직을 제어하거나 하지 않는 순수한 자료형 요소의 데이터를 주고 받는 것이다.

```java
public int calculateFee(int money) {
	return money - discountMoney(money);
}

public int discountMoney(int money) {
	return money * 0.2;
}
```

### 스탬프 결합도(Stamp Coupling)

- 모듈 간의 인터페이스로 배열이나 오브젝트와 같은 자료 구조가 전달될때 결합도입니다.
- 자료구조 형태가 변경되면 그것을 참조하는 모든 모듈에 영향을 주게 됩니다.

```java
public List<LottoBall> makeLottoBall() {
	List<LottobBall> lottoBalls = new ArrayList<>();

	for (int i = 1; i < 46; i++) {
		lottoBalls.add(new LottoBall(i);
	} 

	return lottoBalls;
}

public List<LottoBall> getAutomaticLottoBall() {
	List<LottoBall> lottoBalls = makeLottoBall();
	List<LottoBall> automaticLottoBalls = new ArrayList<>();
	
	while (automaticLottoBalls.size() != 7) {
		final int random = (int)(Math.random() * 46 + 1); 
		LottoBall lottoBall = lottoBalls.get(random);
		if(AutomaticLottoBalls.contains(lottoBall)) {
			continue;
		}
		automaticLottoBalls.add(lottoBall);
	}
		
	return automaticLottoBalls;	
}
```

- 위의 로직에서 List가 Set으로 변경되면?
- 두개의 메서드 모두 변경해줘야 하기 때문에 영향을 주게 된다고 말할 수 있다.

```java
public Set<LottoBall> makeLottoBall() {
	Set<LottobBall> lottoBalls = new HashSet<>();

	for (int i = 1; i < 46; i++) {
		lottoBalls.add(new LottoBall(i);
	} 

	return lottoBalls;
}

public Set<LottoBall> getAutomaticLottoBall() {
	Set<LottoBall> lottoBalls = makeLottoBall();
	Set<LottoBall> automaticLottoBalls = new HashSet<>();
	
	while (automaticLottoBalls.size() != 7) {
		final int random = (int)(Math.random() * 46 + 1); 
		LottoBall lottoBall = lottoBalls.get(random);
		automaticLottoBalls.add(lottoBall);
	}
		
	return automaticLottoBalls;	
}
```

### 제어 결합도(Control Coupling)

- 어떤 모듈이 다른 모듈 내부의 논리적인 흐름을 제어하는 제어 요소를 전달하는 경우

```java
public int calculateFee(int money, Payment payment) {
	return money - discountMoney(money);
}

public int discountMoney(int money, Payment payment) {
	if(payment == Payment.CARD) {
		return money * 0.1
	}
	if(payment == Payment.CASH) {
		return money * 0.2;
	}
}
```

### 외부 결합도(External Coupling)

- 모듈이 외부에 있는 다른 모듈의 데이터를 참조할 때의 결합도
- 외부의 데이터, 통신 프로토콜 등을 공유할때 발생하게 됩니다.
- 아래의 예제는 극단적인 예제입니다. 크롤링 하는 모듈이 있고 크롤링 결과를 다른 모듈에서 사용할 때 이야기 합니다.

```java
public int getImage(URI uri) {
	Feed feed = crawingOpenGraph(rui);
	return feed.getImage();
}

public int discountMoney(URI uri) {
	// 오픈 그래프 크롤링 로직
}
```

### 공통 결합도(Common Coupling)

- 여러 개의 모듈이 하나의 공통 데이터 영영ㄱ을 사용하는 결합도

```java
class LottoBalls {
	public static final int LOTTO_BALL_NUMBER = 7;
}

class AutomaticLottoBall {
	public getAutomaticLottoBall {
		// LottoBalls의 LOTTO_BALL_NUMBER 사용
	}
}

class MnualLottoBall {
	public getManualLottoBall {
		// LottoBalls의 LOTTO_BALL_NUMBER 사용
	}
}
```

- 이때 LottBalls에 있는 LOTTO_BALL_NUMBER가 변경되면 관련된 모듈들에 모두 영향을 미치는걸 볼수 있다.

### 내용 결합도(Content Coupling)

- 가장 높은 결합도를 갖으며, 가장 좋지 않은 결합 형태입니다.
- 어떤 모듈이 사용하려면 다른 모듈의 내부 기능과 데이터를 직접 참조하는 경우입니다.
- 이렇게 되면 A모듈, B모듈 모두 코드를 알고 있어야 하며 A모듈이 변경되면 B모듈도 영향을 미쳐 변경해야 합니다.

## 참고자료

[[초보개발자 일지] 소프트웨어 공학의 모듈화, 결합도, 응집도](https://medium.com/@shaul1991/%EC%B4%88%EB%B3%B4%EA%B0%9C%EB%B0%9C%EC%9E%90-%EC%9D%BC%EC%A7%80-%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4-%EB%AA%A8%EB%93%88%EA%B3%BC-%EB%AA%A8%EB%93%88%ED%99%94-%EA%B2%B0%ED%95%A9%EB%8F%84-%EC%9D%91%EC%A7%91%EB%8F%84%EC%9D%98-%EC%9D%B4%ED%95%B4-44af52e03a91)

[결합도(Coupling), 응집도(Cohesion)](https://lazineer.tistory.com/93)

[결합도와 응집도는 무엇일까?](https://madplay.github.io/post/coupling-and-cohesion-in-software-engineering)
