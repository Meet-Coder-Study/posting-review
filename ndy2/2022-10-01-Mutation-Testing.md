## Mutation Testing

**Mutation Test**란 지난주에 소개한 PBT와 유사하게 테스트가 개발자를 Fooling 하는 것을 막기위한 테스트 방법론 중 하나입니다.

### 돌연변이 테스트?
![image](https://user-images.githubusercontent.com/67302707/192438498-48ff248d-51d1-406d-8cf0-d6d0eee89752.png)

### 예시
```java
public class Calculator{

   public int add(int a, int b){
      log();
      return a+b;
   }
   
   public int sub(int a, int b){
      return a-b;
   }
   
   //... mul, div 
   
   // 로직과 관계 없는 void를 반환하는 메서드
   private void log(){
      log.info("계산기 덧셈 호출!");
   }
}
```
아주 잘 만든 계산기 클래스를 테스트 해봅시다.

```java
@Test
void add(){
  //given
  Calculator calculator = new Calculator();
  
  //when
  int actual = calculator.add(1, 2);
  
  //then
  assertThat(actual).isEqualTo(1 + 2);
}


@Test
void sub(){
  //when
  int actual = calculator.sub(1, 2);
}
```
테스트가 모두 통과합니다. 이제 Mutation Testing을 적용할 준비가 되었습니다.


### Mutation Testing 동작 방법
1. 일반 테스트가 모두 통과한다.
2. compile 된 프로덕션 코드를 **살짝** 바꾸어 테스트가 깨지는 지 확인한다.
3. Mutation Testing Report 를 제공한다.

### 코드에 돌연 변이를 만드는 법 (살짝 바꾸는 법)
Mutation operators - 수없이 많은 경우의 수가 있다.
- Change > to >= or <
- Change == to !=
- Chnage "true" to "false"
- Substitue one method call for another
- Comment out a method altogether
- 객체 반환을 null 로 바꿔버리기
- boolean 반환을 항상 flip 해버리기
- ...

### 돌연변이 계산기
```java
public class Calculator{

   public int add(int a, int b){
      //log(); <- 주석 처리 해버림
      return a+b;
   }
   
   public int sub(int a, int b){
      return a+b; // <- - 를 + 로 바꾸어 버림
   }
   
   //... sub, mul, div 
   
   // 로직과 관계 없는 void를 반환하는 메서드
   private void log(){
      log.info("계산기 덧셈 호출!");
   }
}
```
이럴수가.. 귀염둥이 계산기클래스가 돌연변이가 되었습니다.
Mutation Testing Report의 결과를 살펴보겠습니다.

```
1. Comment void method call -> SURVIVED // 빨간줄 
2. Replaced integer subtraction with addition -> SURVIVED // 빨간줄
```

void method call을 주석 처리 하였지만 여전히 테스트가 통과하였기 때문에 Mutation이 Survived 하였습니다.
즉, 테스트코드, 계산기코드 어딘가에 문제가 있다는 의심을 할 수 있습니다.

빼기를 더하기로 바꾸었는데도 테스트가 여전히 통과한다면?
역시 테스트코드, 계산기코드 어딘가에 문제가 있다는 의심을 할 수 있습니다.

다시 잘 통과하던 테스트 코드를 살펴보면 역시 문제가 있다는 것을 알 수 있습니다.

Mutation Testing은 이런 방식으로 코드에 돌연변이를 주어 Test가 실패하는 것을 확인하는 테스트 입니다.


### Mutation Testing Report
돌연변이 테스트의 결과는 세가지로 구분됩니다.
```
1. 코드에 변이가 발생하였고 이전에 통과하던 테스트가 깨지는 경우 - KILLED 👍
2. 코드에 변이가 발생하였지만 어떠한 테스트에도 커버되지 않은 경우 - NO COVERAGE
3. 코드에 변이가 발생하였음에도 이전에 통과하던 테스트가 깨지지 않는 경우 - SURVIVED 👎
```

### Library 
**PITest** - [https://pitest.org/](https://pitest.org/)
- JVM 계열에서는 거의 유일한 Mutation Testing 라이브러리 입니다.
- 다양한 **mutator** 를 제공합니다.
 - PITest report
 ![image](https://user-images.githubusercontent.com/67302707/192445311-42ff3cbe-ab87-42a6-a3e1-9f6ffec76902.png)


### 장점
- 테스트에 더 확신을 가질 수 있다.
- 일반적으로 이야기 되는 좋은 테스트코드를 작성하는 규칙을 자연스럽게 적용할 수 있다.

### 단점
- 모든 변이를 커버하기는 쉽지 않고 이들을 모두 고려해야 하는가에 대한 고민이 필요하다.
- 오래 걸린다.


@참고)
- 위키피디아 링크 - [Mutation Testing](https://en.wikipedia.org/wiki/Mutation_testing)
- 유튜브 동영상 Spring Developer - [Mutation Testing: Case Studies on Spring Boot APIs
](https://www.youtube.com/watch?v=88fDcPurp-Y&ab_channel=SpringDeveloper)
   Mutation Testing 과 함께 이를 Spring API에 적용해 보며 겪은 이슈들을 소개합니다.
- 유튜브 동영상 Diego Pacheco - [Java Mutation Testing with Pitest](https://www.youtube.com/watch?v=lDeTsMIN8As&ab_channel=DiegoPacheco)
   Pitest를 활용해 초간단 계산기를 테스트 해봅니다.
