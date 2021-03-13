#Kotlin  
이번 포스팅은 Kotlin의 기본을 알아보는 포스팅입니다  

## 변수
Kotlin은 변수를 담을 때 var, val을 통해서 변수를 담습니다.  
```kotlin
fun main() {
    val value = "String"
    var variable = "String"
    val typeValue: String = "String"
    var typeVariable: String = "String"
    typeVariable = 123
}
```
이렇게 선언이 가능합니다.  
val을 사용한 변수는 문맥상 단 한번만 초기화가 가능합니다( java final)  
var을 사용한 변수는 선언된 변수의 값을 변경 할 수 있습니다.  
더불어 : + type 은 변수의 type 선언합니다.  
: 뒤에 type을 명시 하지 않으면 변수에 대입하는 data의 type에 따라 Kotlin이 자동으로 type을 설정해줍니다.  
설정된 type과 다른 type을 대입하면 
```
Kotlin: Type mismatch: inferred type is String but Int was expected
```
와 같은 메세지를 출력합니다.  
```kotlin
var a: Int = null
var a: Int? = null
```

Kotlin의 변수는 기본적으로 null을 대입 할 수 없습니다.  
만약 null을 대입한다면 type뒤에 ?를 붙여야 합니다.  
### 배열
```kotlin
var intArr = arrayOf(1,2,3,4,5);
var intArrr: Array<Int> = arrayOf(1,2,3,4)
var intNoneArrr: Array<Int?> = arrayOfNulls(5)
var nullArr = arrayOfNulls<Int>(5);
```
배열은 다음과 같이 선언이 가능합니다.  
만약 null값도 선언 하고 싶으면 Array<Int?>, arrayOfNulls를 통해 선언 하면됩니다.  

## 조건문
```kotlin
fun main() {
    if(tempt is Int) {
        println("Kotliner")
    }
    
    doWhen(1)
    doWhen("jung")
    doWhen(10L)
    doWhen(10)
    doWhen(10.45)

    val doWhenRt: String = dowhenRt(1)
}

fun doWhen(a: Any) {
    when(a) {
        1 -> println("정수 입니다")
        "jung" -> println("문자열입니다")
        is Long -> println("Long타입입니다.")
        is Int -> println("Int 타입입니다.")
        else -> println("어느 조건에도 안맞아요")
    }
}

fun doWhenRt(a: Any): String {
    val s = when (a) {
        1 -> "정수 입니다"
        "jung" -> "문자열입니다"
        is Long -> "Long타입입니다."
        is Int -> "Int 타입입니다."
        else -> "어느 조건에도 안맞아요"
    }
    return s
}
```
if의 경우 Java와 유사 하지만 type에 대한경우 is를 통해 비교 합니다.  
doWhen, doWhenRt안에 when구문의 경우 Javadml switch구문과 같습니다.  
doWhen(a: Any)에서 Any을 쓰면 파라미터에 들어온 모든 타입을 받습니다.  
그리고 when의 파라미터의 값에 따라 안에 여러 case에 따라 실행할 구문을 구현 할 수 있습니다.  
또한 else를 통해 조건 이외의 경우에 대해서도 구현 할 수 있습니다.  
그리고 fun에 :type을 붙이면return type을 정할 수 있습니다.  
이는 다른 fun에 대해서도 동일합니다.  

## 반복문
```kotlin
for(index in 0..9) {
        println(index)
    }

    for(index in 0..9 step 3) {
        println(index)
    }

    for(index in 'a'..'e') {
        println(index)
    }
```
반복문은 다음과 같이 작성이 가능합니다.  
자바에서 for(int index = 0; index < 10; index++)이 Kotlin에서 for(index in 0..9)로 표현 가능합니다.  
step의 경우 step 뒤의 Int 값만큼 단계를 건너 뜁니다.  
step 3이 있는 반복문은 0,3,6,9를 출력합니다.  
이는 문자열에서도 같습니다.  
3번째 for문은 a,b,c,d,e를 출력합니다.  

```kotlin
    //Java
    for (int index = 0; index <11; i++) {
        for (int j = 0; j<11 ; j++) {
            if (index == 1 && j == 2) {
                break
            }
            System.out.println("i : $index, j : $j")
        }
        break
    }
    //Kotlin
    loop@for (index in 1..10) {
        for (j in 1..10) {
            if (index == 1 && j == 2) {
                break@loop
            }
            println("i : $index, j : $j")
        }
    }
```
위 Java 이중for문의 경우 내부 for문에서 if 조건대한 구문을 실행하고 전체 for문의 진행을 정지 하고 싶은경우 break를 두번 써야 합니다.  
Kotlin은 이를 loop@ @loop를 통해 표현할 수 있습니다.  
@loop는 break뒤에 사용 가능합니다.  
그리고 break가 수행될때 loop@가 붙여진 for문 까지 break가 적용됩니다.  

## 생성자
Kotlin에서도 class를 통해 객체를 생성할 수 있습니다.  
```kotlin
class Obj(var name: String, var age: Int, var type: String) {
    init{
        println("${this.name} + ${this.age} + ${this.type}")
    }
}
fun main() {
    val Objs = Obj("Kotlin", 2, "Better Java")
}

```
위와 같이 생성가능하고 Java와 달리 class안에 변수를 생성하지 않아도 됩니다.  
그리고 Obj("Kotlin", 2, "Better Java")와 처럼 생성하면됩니다.  
이는 클래스의 '속성'들을 선언함과 동시에 '생성자'도 생성하는 방식입니다.  

Obj class안에 인스턴스 생성시 구문을 수행하고 싶다면 위 처럼 init 함수를 사용하면됩니다.  

init함수는 파라미터나 반환형이 없는 함수인데 생성자를 통해 인스턴가 만들어 질때 호출됩니다.  
위처럼 class안에 init을 만들면 Obj class를 생성하는 시점에 init 함수가 실행됩니다.  
### 보조생성자
기본 생성자와 다른 형태의 생성자를 제공하여 인스턴스 생성시 편의를 제공하거나 추가 구문을 수행하는 기능을 제공하는 역할을 합니다

```kotlin
class Obj(var name: String, var age: Int, var type: String) {
    init{
        println("${this.name} + ${this.age} + ${this.type}")
    }
    
    constructor(name: String) : this(name, 10, "years")
}
fun main() {
    val Objs = Obj("Kotlin", 2, "Better Java")
    
    val CObjs = Obj("Java")
}

```
위처럼 class안에 constructor를 사용하고 파리미터를 추가해좁니다  
constructor를 사용할때는 반드시 기본생성자를 통해 속성을 초기화 해줘야 합니다.  
이는 constructor 뒤에 : this(기본생성자 파라미터 초기화) 를 통해 초기화 해줍니다.  

## 상속
```kotlin
open class Animal(var name: String, var age: Int, var type: String) {
    fun introduce() {
        println("${this.name} + ${this.age} + ${this.type}")
    }
}

class Dog(name: String, age: Int) : Animal (name, age, "Dog") {
    fun bark() {
        println("멍멍")
    }
}
```

상속은 다음과 같이 가능한데 여기서 class앞에 open을 붙여 줘야 합니다.  
Kotlin은 상속 금지가 기본값이기 떄문입니다.  
open은 class가 상속 할수 있도록 class앞에 선언 합니다.  
여기서 상속하는 Animal을 수퍼클래스, 받는 Dog은 서브클래스 라고 말합니다.  
클래스의 상속은 Dog클래스를 보시면 클래스 명 뒤에 : 수퍼클래스 생성자를 호출 하면됩니다.  

## 오버라이딩
```kotlin
open class Predator {
    open fun eat() {
        println("음식을 먹습니다")
    }
}

class Tiger : Predator() {
    override fun eat() {
        println("고기를 먹습니다")
    }
}
```
위 코드를 보면 Tiger는 Predator를 상속 받아 Predator의 eat 함수를 Tiger에서 오버라이딩 하고있습니다.  
여기서 중요한점은 Tiger의 경우 fun앞에 override를 선언 해야 하고 Predator의 eat 함수의 경우 open을 해줘야합니다.  


```kotlin
//추상화
abstract class AnotherPredator {
    abstract fun eat()
    fun sniff() {
        println("킁킁")
    }
}

class Rabbit : AnotherPredator() {
    override fun eat() {
        println("당근을 먹습니다")
    }

}
```
abstract class의 경우 수퍼클래스의 추상 메서드를 서브클래스에서 구현 할 때 override를 사용하여 구현 하면됩니다.  
Kotlin에서는 추상클래스에 속성, 추상함수, 일반함수 모두를 가질수 있지만 생성자를 가질수 없습니다. 
```kotlin
//인터페이스 
interface Runner {
    fun run()
}

interface Eater {
    fun eat() {
        println("음식을 먹습니다")
    }
}

class Cat : Runner, Eater {
    override fun run() {
        println("우다다다다닫다다닫다ㅏ")
    }

    override fun eat() {
        println("허겁지겁 먹습니다")
    }
}
```

인터페이스는 위와 같이 사용이 가능합니다.  
코틀린은 인터페이스에서 구현이 있는 함수는 open함수로 없는 함수는 abstract로 간주합니다.  
인터페이스에서 별도의 키워드가 없어도 서브 클래스에서 구현, 재정의가 가능하고 한번에 여러 인터페이스를 상속 받을 수 있습니다.  
여러 인터페이스나 클래스에서 같은 이름의 형태를 가진 함수를 구현하고 있다면 헷갈리지 않도록 주의해야 합니다.  

## 다음 포스팅에선
다음 포스팅에선 프로젝트 구조 부터 시작하여 접근 제한자. 람다 함수, 스코프 함수 등등을 알아 보겠습니다!