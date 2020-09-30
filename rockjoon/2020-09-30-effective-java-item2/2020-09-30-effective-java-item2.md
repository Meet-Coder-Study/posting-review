# [이펙티브 자바] 아이템2. 생성자에 매개변수가 많다면 빌더를 고려하라.

정적 팩터리와 생성자 모두 *매개변수가 많아 질 때* 적절히 대응하기 어렵다.        
이러한 경우에는 다음과 같은 방법들이 있다.

## 1. 고전적인 방법

### (1) 점층적 생성자 패턴

```java
public class Score {
    private int mathScore;
    private int englishScore;
    private int koreanScore;
    private int historyScore;
    private int scienceScore;

    public Score(int mathScore) {
        this.mathScore = mathScore;
    }

    ...

    public Score(int mathScore, int englishScore) {
        this.mathScore = mathScore;
        this.englishScore = englishScore;
    }

    ...

    public Score(int mathScore, int englishScore, int koreanScore, int historyScore, int scienceScore) {
        this.mathScore = mathScore;
        this.englishScore = englishScore;
        this.koreanScore = koreanScore;
        this.historyScore = historyScore;
        this.scienceScore = scienceScore;
    }
}
```
> 점층적 생성자 패턴    
: 매개 변수의 숫자를 달리하는 생성자를 여러개 선언하는 방법

* 위의 클래스는 과목별 성적을 나타내는 클래스이다.    
* Score를 생성할 때 하나의 과목으로 생성할 수도 있고, 두개의 과목, 세개의 과목, 혹은 모든 과목의 점수를 넣어 생성할 수 도 있다. 
* 이 클래스의 인스턴스를 얻기 위해서는 원하는 매개변수만 들어 있는 생성자를 새롭게 만들거나, 사용하지 않는 필드에 의미 없는 값을 넣어 객체를 생성해야 한다.
```java
Score score = new Score(100, 90, 80, 77, 95);
```
* 호출할 때는 더욱 끔찍하다. *각각의 매개변수가 무엇을 의미하는지* 전혀 알 수가 없기 때문이다.
* 이처럼 점층적 생성자 패턴은 **매개변수가 늘어날 수록 코드를 읽고 쓰기가 불편**해진다.

---

### (2). 자바빈즈 패턴
```java
Score score = new Score();
score.setMathScore(100);
score.setEnglishScore(90);
score.setscienceScore(95);
...
```
> 자바빈즈 패턴     
: 객체 생성 후 set메소드를 통해 원하는 매개변수의 값을 설정하는 방법 

* 점층적 생성자 패턴에 비해 인스턴스를 만들기 쉽고 더 읽기 쉽다.
* 하지만 자바빈즈 패턴은 `원하는 객체를 얻기 위해 메소드를 여러번 호출`해야 한다.
* 이로 인하여 원하는 객체가 완성될 때까지 `객체의 일관성을 유지하기가 어렵다.`
* 때문에 클래스를 불변으로 만들 수 없고, 스레드 안정성을 보장하기 위해서는 추가적인 작업이 필요하다.

---

## 2. 빌더 패턴
빌더 패턴이란 클래스 내부에 Builder클래스를 만들고,     
 builder객체를 리턴하는 일종의 setter메소드를 선언하고,     
 최종적으로 build()메소드를 통해 해당 클래스의 인스턴스를 반환하는 방법이다.    
 다음의 Builder클래스를 위에서 살펴본 Score클래스 내부에 선언된 중첩클래스라 가정하자.
 ```java
 public class Builder{
        private int mathScore;
        private int englishScore;

        // Builder의 생성자
        public Builder(){}

        // mathScore를 설정하고 Builder인스턴스를 반환
        public Builder mathScore(int mathScore){
            this.mathScore = mathScore;
            return this;
        }

        public Builder englishScore(int englishScore){
            this.englishScore = englishScore;
            return this;
        }

        // build메소드로 Score의 인스턴스 반환
        public Score build(){
            return new Score(this);
        }
    }

    ...

    //Score의 생성자
    private Score(Builder builder){
        mathScore = builder.mathScore;
        englishScore = builder.englishScore;
    }
 ```
* 빌더 패턴은 한 곳에서 객체 생성을 끝내기 때문에 객체일관성을 유지할 수도 있고,      
* 코드를 읽고 쓰기에도 편하다.
* 즉 점층적 생성자와 자바빈즈 패턴의 장점만을 모아둔 패턴이다.
```java
Score score = new Score.Builder()
                    .mathScore(80)
                    .englishScore(95)
                    .build();
```
---

## 3. 계층적 구조와 빌더 패턴

빌더 패턴은 계층적으로 설계된 클래스와 함께 쓰기에도 좋다.

다음은 추상클래스 Pizza와 하위 클래스 NyPizza의 코드이다.

```java
public abstract class Pizza {
    public enum Topping {HAM, MUSHROOM, ONION, PEPPER, SAUSAGE,}
    final Set<Topping> toppings;

    abstract static class Builder<T extends Builder<T>>{
        //Topping 타입이 저장되는 비어 있는 set을 반환
        EnumSet<Topping> toppings = EnumSet.noneOf(Topping.class);

        // Topping을 set에 추가
        // 추가 후 자기 self()를 통해 인스턴스 반환
        public T addTopping(Topping topping) {
            toppings.add(Objects.requireNonNull(topping));
            return self();
        }

        // Pizza 인스턴스를 반환하기 위한 build메소드
        // 하위 객체마다 반환 타입을 달리하기 위해 추상메소드로 정의
        abstract Pizza build();


        // 하위 객체에서 오버라이드 하도록 되어있음(하위 객체마다 반환 타입을 달리하기 위해)
        protected abstract T self();
    }

    // Pizza생성자
    // builder를 파라미터로 받음.
    Pizza(Builder<?> builder) {
        toppings = builder.toppings.clone();
    }

}
```

```java
public class NyPizza extends Pizza{
    // 뉴욕 피자의 경우 Topping 외에 Size를 추가적으로 정의함.
    public enum Size {SMALL, MEDIUM, LARGE}
    private final Size size;

    //Pizza.Builder를 상속 받음.
    public static class Builder extends Pizza.Builder<Builder> {
        private final Size size;

        // Builder의 생성자
        // size를 파라미터로 받고 검증한다.
        // 매개변수의 타당성을 Builder의 생성자자 또는 메서드에서 수행하면 잘못된 매개변수를 최대한 일찍 확인할 수 있다.
        public Builder(Size size){
            this.size = Objects.requireNonNull(size);
        }

        // 부모객체의 build를 오버라이드
        // NyPizza객체를 반환하도록 재정의.
        @Override
        public NyPizza build(){
            return new NyPizza(this);
        }

        // 부모객체의 self() 오버라이드
        // NyPizza.Builder를 반환하도록 재정의.
        // 부모 객체의 addTopping() 메소드에서 사용.
        // 즉 부모 객체에서 addTopping()을 호출하면 self()에 정의된 데로, 자식객체의 인스턴스를 반환함.
        @Override
        protected Builder self() { return this;}
    }

    // NyPizza의 생성자, builder를 매개변수로 받음.
    // Builder의 build() 메소드에서, NyPizza의 인스턴스를 반환하기 위해 사용
    private NyPizza(Builder builder) {
        super(builder);
        size = builder.size;
    }
    
}
```
* 여기서 self() 메서드를 오버라이드 하여, 하위 클래스의 Builder를 반환하도록 했고, 이로 인해 형변환 없이 인스턴스를 유지할 수 있었는데 이러한 방법을 `셀프타입 관용구 (simulated self-type)`라고 한다.
* 또한 build메서드와 같이 하위  클래스의 메서드가 상위 클래스의 메서드가 정의한 반환 타입이 아닌, 그 하위 타입을 반환하는 기능을 `공변 반환 타이핑(covariant return typing)`이라 한다.
* 이러한 점들로 인해 빌더패턴은 계층적 구조에서도 유연하게 사용할 수 있다.

---

4. 정리

* 다만 빌더 패턴은 객체를 만들기 위해 빌더를 만들어야 한다는 단점이 있다.(하지만 일반적으로 빌더의 생성 비용이 크다고 볼 수는 없다.)
* 또한 빌더 패턴을 사용하기 위해 필요한 절대적인 코드량이 있기 때문에 매개변수가 적을 경우에는 비효율적이다.
* 즉 빌더 패턴은 선택적인 매개변수의 수가 많아야 가치가 있다.
* 하지만 시스템은 지간이 지날수록 매개변수가 많아질 가능성이 높다. 따라서 애초에 빌더로 시작하는 편이 나을 때가 많다.

