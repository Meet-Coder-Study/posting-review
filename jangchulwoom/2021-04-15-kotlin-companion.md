# 들어가기전에 ..

kotlin을 사용하면서 불편했던(`혹은 익숙치 않았던`) 부분이 3가지 정도 있었는데요.

1. Nullable, 
2. singleton(`default final`)
3. static

위 내용 중, static 에 관하여, `왜 kotlin이 static 을 지원하지 않는지` 혹은 `유사하게 만들려면 어떻게해야하는지`를 정리해보려합니다.

# kotlin object keyword

* kotlin 에서는 singleton 을 언어에서 지원합니다.
    * sigleton 을 보장하는 `object` keyword 

```kotlin
object HelloWorld {
    fun helloWorld() = "helloWorld"
}
```

위처럼 선언하고자 하는 class 에 object keyword 를 대신 사용할 경우, java 에서는 아래처럼 표현됩니다.

```java
public final class HelloWorld {
   @NotNull
   public static final HelloWorld INSTANCE;

   @NotNull
   public final String helloWorld() {
      return "helloWorld";
   }

   private HelloWorld() {
   }

   static {
      HelloWorld var0 = new HelloWorld();
      INSTANCE = var0;
   }
}
```

static final로 객체를 선언하고, static block 을 사용해 초기화를 합니다. 

> 흔히 볼 수 있는 singleton pattern의 형태입니다. 

`public static final` 로 객체를 선언되어, kotlin 에서 아래처럼 사용할 수 있습니다.

```kotlin
    @Test
    fun helloWorldTest() {
        val expect = "helloWorld"

        assertEquals(expect, HelloWorld.helloWorld())
    }
```

static method 와 유사하게 사용 할 수 있으며, Java 로 변환 할 경우 아래처럼 사용할 수 있습니다.

`HelloWorld.INSTANCE.helloWorld()`

> 주의 : singleton 으로 인해 static `처럼` 쓸 수 있는것이지, static 이 아닙니다.

또한 `object`는 singleton 역할 외에도, 익명 클래스를 만드는 keyword 이기도합니다.

```kotlin
val typeReference = object : TypeReference<List<String>>() {}
```

# kotlin companion object

앞서 설명했듯, kotlin 에는 static 함수/변수를 지원하지 않습니다. static 과 *유사하게* 사용하기 위해서, companion object 라는 keyword를 사용 할 수 있습니다.
다만, 유사하게 동작할뿐 실제로 static 으로 생성되지 않습니다.

```kotlin
class Hello {
    companion object {
        fun hello() = "hello"
    }
}

class World {
    fun world() = Hello.hello()
}
```
> java 로 변환

```java
public final class Hello {
   @NotNull
   public static final Hello.Companion Companion = new Hello.Companion((DefaultConstructorMarker)null);

  public static final class Companion {
      // code 
  }
}
```

nested class 로 Companion이라는 이름의 class 를 선언하고, 이를 객체로 초기화하여 내부 변수로 들고있는 구조입니다.

#### 왜 다른 방식으로 지원하는가 ?

`The main advantage of this is that everything is an object.` [link](https://softwareengineering.stackexchange.com/questions/356415/why-is-there-no-static-keyword-in-kotlin/356421)

kotlin 에서 static 을 지원하지 않는 가장 큰 이유는, static member 가 object(`객체`) 로 취급되지 않기 때문입니다.
object 로 취급되지 않는다는 건, 상속을 이용할 수 없고, parameter 로 전달될 수 없으며, instance Map 등을 활용할 수 없다는 것을 의미합니다.

> first citizen 이 아니라는 의미죠

```kotlin
interface KeyGenerator {
    fun generate() : String
}


class Hello{
    companion object : KeyGenerator {
        override fun generate(): String = "this object key"
    }
}
```

객체의 역할이 아닌, 유틸성(?) Interface 를 아래처럼 분리해서 사용하면 꽤 유용할거 같은데요.
유틸성으로는 아래처럼 사용 할 수 있습니다.

```kotlin
// logger 선언 
interface Log {
  fun logger() = LoggerFactory.getLogger(this.javaClass)
}

class MyBusiness{
  // companion 으로 log 상속
  companion object : Log 
  
  fun hello(str:String) {
    logger.info("hello $str")
  }
}
```

위처럼 자주 사용되는 공통 유틸들을, object 상속을 이용해 편하게 사용할 수 있습니다 :)

#### [추가] Companion 의 특징 

- Companion keyword 를 사용하지않고, 축약하여 사용가능합니다. (1)

```kotlin
class Parent {
    companion object {
        val target = "json"
        val version = 1.0
    }
}
// test class 
@Test
@DisplayName("(1) Companion keyword 를 사용하지않고, 축약하여 사용가능합니다.")
fun shortcut() {
  val expect = Parent.Companion.target

  assertEquals(expect, Parent.target)
  
  val expectType = Parent

  assertTrue("class 할당 시, companion 을 바라봅니다.", expectType is Parent.Companion)
}
```

- Companion 에 이름을 지을 수 있으며, Interface 에도 선언할 수 있습니다. 
- 이름을 지을 경우, 축약을 그대로 사용할 수 있으나, `Parent.Companion.target` 을 `Parent.${CompanionName}.target` 으로 사용해야 합니다. 
- Companion 은 딱 하나만 사용 할 수 있습니다.

```kotlin
interface Parent {
    companion object AppVersion {
        val target = "json"
        val version = 1.0
    }
    companion object { // error !! 

    }
}
```

- java 로 변환 시, static 객체로 정의됨으로 외부 class 에서도 접근 가능합니다. 
  - companion 을 private 으로 설정시 접근 불가합니다.
- 객체 상속 시, companion 은 상속되지 않습니다.
- class 함수에서 companion 변수를 사용할 수 있습니다. 
  - companion 에서 class property는 사용 불가합니다. (companion 은 static 객체 입니다.)

```kotlin
open class Parent {
    companion object {
        val target = "json"
        val version = 1.0
    }

    open fun getTarget(): String = Companion.target
}

class Child : Parent() {
    companion object {
        val target = "html"
        val version = 1.0
    }
    // Companion 축약 가능하지만, 이해를 돕기위해 남겨둡니다.
    override fun getTarget() = Companion.target 
}

@Test
@DisplayName("(4) 다형성을 이용할 수 있습니다. (companion 의 특징은 아님) ")
fun polymorphism() {
  val child:Parent = Child()

  // companion 의 특징은 아니지만, 이렇게 사용할 수 도 있을거 같네요 :) 
  assertEquals(Child.Companion.target, child.getTarget())
}
```

> 개인적인 생각 :: java 개발자 관점(?)에서 봤을때 companion 은 그냥 static object 로 보이는데, `조금 더 우아한 사용처가 없을까?` 궁금합니다 :)    

#### 참고 

[Why is there no static keyword in Kotlin?](https://softwareengineering.stackexchange.com/questions/356415/why-is-there-no-static-keyword-in-kotlin/356421)    

[Kotlin in Action](http://www.yes24.com/Product/Goods/55148593)    

[[kotlin] Companion Object (1) – 자바의 static과 같은 것인가?](https://www.bsidesoft.com/8187)