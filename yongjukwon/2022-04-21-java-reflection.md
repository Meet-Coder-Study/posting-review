# Reflection

## `Contents`  
### [1. Background](#1)  
### [2. What is Reflection?](#2)
### [3. Demo](#3)  
<!-- ### [4. Real usages of Reflection](#4) -->
### [4. Reflection의 실사용 예](#4)
<!-- ### [5. Why do we use Reflection?](#5) -->
### [5. Reflection의 장단점](#5)
### [6. Retrospective](#6)
### [7. References](#7)

<br />

## <a id="1"></a>`1. Background` 

지난 포스팅에서 Serialization과 Externalization을 비교할 때 Serialization의 performance가 상대적으로 느린데 그 이유가 reflection을 사용해서라고 설명했다. Reflection이 정확히 어떻게 작동하는 지, 왜 performance면에서 느린지 알고 싶어서 이 글을 작성하게 되었다.

<br />

## <a id="2"></a>`2. What is Reflection?` 

<!-- ***Java Reflection*** allows us to inspect or/and modify runtime attributes of classes, interfaces, fields, and methods. This particularly comes in handy when we don't know their names at compile time. Additionally, we can instantiate new objects, invoke methods, and get or set field values using reflection. -->

***Java Reflection***을 통해 우리는 클래스, 인터페이스, 필드 또는 메소드들의 런타임 속성을 들여다보거나 수정할 수 있다. 특히 컴파일 때 이 속성들의 이름을 정확히 모를 때 도움이 된다. 또한 ***Reflection***을 이용해 새 오브젝트를 만들거나 메소드를 실행 혹은 필드 값들을 가져오거나 수정할 수도 있다.

예를 들면, 프로그램이 돌아가는 중 어떤 클래스의 속성들을 가져와 출력할 수 있다.

<!-- ***Java Reflection*** is a process of examining or modifying the runtime behaviour of a class at runtime.

***Java Reflection*** allows an executing Java program to examine or inspect upon itself, and manipulate internal properties of the program. For example, it's possible for a Java class to obtain the names of all its members and display them.

***Java Reflection*** makes it possible to inspect classes, interfaces, fields and methods at runtime, without knowing the names of the classes, method etc. -->

<br />

## <a id="3"></a>`3. Demo` 

```java
// Test class
package main.java.reflection;

public class Test {
    private String s;

    public Test() {
        s = "Test class";
    }

    public void method1() {
        System.out.println("This is method1");
    }

    public void method2(int n) {
        System.out.println("This is method2 with integer " + n);
    }

    private void method3() {
        System.out.println("This is a private method");
    }

    public String getS() {
        return s;
    }

    public void setS(String s) {
        this.s = s;
    }
}

// Demo class
package main.java.reflection;

import java.beans.IntrospectionException;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

class Demo {
    public static void main(String[] args) throws NoSuchMethodException, InvocationTargetException,
              IllegalAccessException, NoSuchFieldException, IntrospectionException {
        Test test = new Test();

        Class cls = test.getClass();
        //Class class = Class.forName("main.java.reflection.Test");
        System.out.println("The name of class is " + cls.getName());
        // The name of class is main.java.reflection.Test

        Constructor constructor = cls.getConstructor();
        System.out.printf("The name of constructor is %s\n\n", constructor);
        // The name of constructor is public main.java.reflection.Test()

        System.out.println("The public methods of class are:");

        Method[] methods = cls.getDeclaredMethods();
        // Method[] methods = cls.getMethods();
        for (Method method: methods)
            System.out.println(method.getName());
        /*
          The public methods of class are:
          method1
          method2
          method3
          getS
          setS
        */

        // Calling method1
        Method methodCall1 = cls.getDeclaredMethod("method1");
        methodCall1.invoke(test);
        // This is method1


        // Calling method2
        Method methodCall2 = cls.getDeclaredMethod("method2", int.class); //Integer.TYPE
        methodCall2.invoke(test, 30);
        // This is method2 with integer 30


        // Calling method3
        Method methodCall3 = cls.getDeclaredMethod("method3");
        methodCall3.setAccessible(true); 
        /* 
          IllegalAccessException, 
          class main.java.reflection.Demo cannot access a member of class main.java.reflection.Test with modifiers "private" 
        */
        methodCall3.invoke(test);
        // This is a private method


        // Updating the private instance variable
        Field field = cls.getDeclaredField("s");
        field.setAccessible(true);
        /*
          IllegalAccessException,
          class main.java.reflection.Demo cannot access a member of class main.java.reflection.Test with modifiers "private"
        */
        field.set(test, "new string");
        System.out.println(field.get(test));
        // new string

        // Calling getS
        PropertyDescriptor pd = new PropertyDescriptor("s", cls);
        Method getter = pd.getReadMethod();
        System.out.println(getter.invoke(test));
        // new string
    }
}
```

<br />

<!-- ## <a id="4"></a>`4. Real usages of Reflection`  -->
## <a id="4"></a>`4. Reflection의 실사용 예` 

<!-- ***Code Analyzer tools*** -->
- ***코드 분석 툴***
  - 코드 분석툴은 보통 최적화 방법, syntax error, 혹은 에러의 상태까지 어떤 클래스든지 분석이 가능하도록 프로그램이 짜여져 있다. ***Reflection***이 코드를 들여다 볼 때에 사용된다
<!-- ***IDEs' auto completion of method names*** -->
- ***IntelliJ나 Eclipse 같은 에디터들이 제공하는 메소드 이름 자동 완성***
  - 에디터 상의 메소드 이름 자동 완성 기능은 ***reflection***을 통해 제공된다
<!-- - ***Spring Framework for creating the beans*** -->
- ***Java Spring Framework***
  - Spring framework에서 각 bean에 의존성을 주입하기 위해 config file 혹은 annotation을 사용하는데, ***reflection***을 통해 이것들을 분석하고 의존성을 주입한다
<!-- - ***Parsing annotations by ORMs*** -->
- ***ORMs (e.g. hibernate)***
  - Hibernate 같은 ORM을 사용할 때도 보통 annotation을 사용하는데, 이 역시 ***reflection***을 통해 처리된다
<!-- - ***Junit Testcases*** -->
- ***Junit 테스트***
  - 초기 Junit은 메소드 이름들을 모두 test로 시작했어야 하고, 지금은 ***@test*** 라는 annotation을 사용하는데 이 역시 ***reflection***을 통해 처리된다


<br />

<!-- ## <a id="5"></a>`5. Pros and cons of reflection`  -->
## <a id="5"></a>`5. Reflection의 장점과 단점` 

<!-- ### **Uses of Reflection** -->
### **Reflection의 장점**

<!-- ***Reflection*** is commonly used by programs which require the ability to examine or modify the runtime behaviour of applications running in the Java virtual machine. This is a relatively advanced feature and should be used only by developers who have a strong grasp of the fundamentals of the language. With that caveat in mind, reflection is a powerful technique and can enable applications to perform operations which would otherwise be impossible. -->

***Reflection***은 위에서 설명했듯이 런타임 속성들을 분석하거나 수정할 때 사용된다. 상당히 고급(어려운?) 기능이기 때문에 Java의 핵심, 근본(fundamental)을 잘 알고 있는 개발자들만 사용해야 한다. 경각심을 가지고 사용한다면, ***reflection***은 굉장한 기술이고 ***reflection***이 아니면 할 수 없는 기능들을 사용 가능하게 만든다.

<!-- ***Extensibility Features***   -->
- ***확장성***
  - ***Reflection***을 이용해 런타임에서 유저가 정의하는 클래스를 이름만 가지고 만들어서 사용할 수 있다.
<!-- - An application may make use of external, user-defined classes by creating instances of extensibility objects using their fully-qualified names -->

<!-- ***Class Browsers and Visual Development Environments***   -->
- ***클래스 탐색 & 개발 시각화***
  - 클래스 탐색은 해당 클래스의 모든 멤버들을 나열할 수 있어야 한다
  - 개발 시각화는 개발자가 정확한 코드를 쓸 수 있도록 ***reflection***을 통해 정보를 제공한다
  <!-- - A class browser needs to be able to enumerate the members of classes. Visual development environments can benefit from making use of type information available in reflection to aid the developer in writing correct code. -->


<!-- ***Debuggers and Test Tools***   -->
- ***디버거 & 테스트 도구***
  - 디버거는 클래스들의 private 멤버를 분석할 수 있어야 한다
  - 테스트 도구들은 클래스 안에 ***reflection***을 통해 정의된 API들을 불러서 테스트 coverage를 높일 수 있다
<!-- - Debuggers need to be able to examine private members on classes. Test harnesses can make use of reflection to systematically call a discoverable set APIs defined on a class, to insure a high level of code coverage in a test suite -->

<!-- ### **Drawbacks of Reflection** -->
### **Reflection의 단점/주의할 점**

<!-- ***Reflection*** is powerful, but should not be used indiscriminately. If it is possible to perform an operation without using reflection, then it is preferable to avoid using it. The following concerns should be kept in mind when accessing code via reflection. -->
***Reflection***은 강력하지만 분간없이 사용되어서는 안된다. ***Reflection*** 없이 코드 작성이 가능하다면, 사용을 최대한 지양해야 한다는 것을 마음 속에 항상 담아두자.

<!-- ***Performance Overhead***   -->
- ***Performance 비용***
  - ***Reflection***은 dynamical하게 type을 처리하기 때문에 JVM의 최적화가 잘 이루어지지 않을 수 있다. 그로 이해 ***non-reflective***한 접근 방법보다 느린 performance로 처리하고, 때문에 performance에 민감한 프로그램들 중 해당 코드를 자주 사용하는 곳이라면 사용을 지양해야 한다.
<!-- - Because reflection involves types that are dynamically resolved, certain Java virtual machine optimizations can not be performed. Consequently, reflective operations have slower performance than their non-reflective counterparts, and should be avoided in sections of code which are called frequently in performance-sensitive applications -->

<!-- ***Security Restrictions*** -->
- ***보안***
  - ***Reflection***은 런타임 접근이 필요하고 그로 인해 security manager를 우회할 수도 있다. Applet 같은 웹 브라우저에서 작동하는 자바 프로그램 같은 경우에 이 점을 신중하게 생각하고 작성되어야 한다.
<!-- - ***Reflection*** requires a runtime permission which may not be present when running under a security manager. This is an important consideration for code which has to run in a restricted security context, such as in an Applet -->

<!-- ***Exposure of Internals***   -->
- ***Anti-abstraction***  
  - ***Non-reflective*** 코드 와는 다르게, ***reflection***을 이용해 private 필드나 메소드까지도 접근할 수 있기 떄문에 개발자는 예상하지 못한 side-effect(e.g. 오작동, 비지니스 조건 미충족)를 초래할 수도 있다. <!-- - Since reflection allows code to perform operations that would be illegal in non-reflective code, such as accessing **private** fields and methods, the user of reflection can result in unexpected side-effects, which may render code dysfunctional and may destroy portability. Reflective code breaks abstractions and therefore may change behaviour with upgrades of the platform -->


<br />

## <a id="6"></a>`6. Retrospective` 

리서치 중 두 가지 재미있는 글이 기억에 남는다.

- `“When you will need reflection; you will know it”.`(Reflection이 필요할 때면, 그게 언제인 지 알게 될 것이다.)\

- `Q: When somebody would need Reflection?` (언제 Reflection이 필요할까?)\
`A: More than a few professional programmers would answer “as rarely as possible, maybe even never.”`\
(적지 않은 수의 프로그래머들이 이렇게 답할 것이다. "그런 경우는 거의 없을 것이다, 아니면 아예 없을 수도")

<br />

## <a id="7"></a>`7. Reference` 

[Oracle, Trail: The Reflection API](https://docs.oracle.com/javase/tutorial/reflect/index.html)\
[Oracle, Using Java Reflection](https://www.oracle.com/technical-resources/articles/java/javareflection.html)\
[JavaPoint, Java Reflection API](https://www.javatpoint.com/java-reflection)\
[Baeldung, Guide to Java Reflection](https://www.baeldung.com/java-reflection)\
[Jenkov.com, Java Reflection Tutorial](https://jenkov.com/tutorials/java-reflection/index.html)\
[Geeksforgeeks.org, Reflection in Java](https://www.geeksforgeeks.org/reflection-in-java/)\
[Stackoverflow, What is reflection and why is it useful? - 1](https://stackoverflow.com/a/37632)\
[Stackoverflow, What is reflection and why is it useful? - 2](https://stackoverflow.com/a/26424561)\
[Stackoverflow, Integer.class vs int.class](https://stackoverflow.com/questions/22470985/integer-class-vs-int-class)\
[Java Reflection – Real Usage Examples](https://howtodoinjava.com/java/reflection/real-usage-examples-of-reflection-in-java/)