# Reflection

## `Contents`  
### [1. Background](#1)  
### [2. What is Reflection?](#2)
### [3. Why do we use Reflection?](#3)
### [4. Demo](#4)  
### [5. References](#5)

<br />

## <a id="1"></a>`1. Background` 

지난 포스팅에서 Serialization과 Externalization을 비교할 때 Serialization의 performance가 상대적으로 느린데 그 이유가 reflection을 사용해서라고
설명했다. Reflection이 왜 performance면에서 느린지, 정확히 어떻게 작동하는 지 몰라서 이 글을 작성하게 되었다.

<br />

## <a id="2"></a>`2. What is Reflection?` 

***Java Reflection*** allows us to inspect or/and modify runtime attributes of classes, interfaces, fields, and methods. This particularly comes in handy when we don't know their names at compile time. Additionally, we can instantiate new objects, invoke methods, and get or set field values using reflection.

***Java Reflection*** is a process of examining or modifying the runtime behaviour of a class at runtime.

***Java Reflection*** allows an executing Java program to examine or inspect upon itself, and manipulate internal properties of the program. For example, it's possible for a Java class to obtain the names of all its members and display them

***Java Reflection*** makes it possible to inspect classes, interfaces, fields and methods at runtime, without knowing the names of the classes, method etc.

<br />

## <a id="3"></a>`3. Why do we use Reflection?` 

### **Uses of Reflection**

***Reflection*** is commonly used by programs which require the ability to examine or modify the runtime behaviour of applications running in the Java virtual machine. This is a relatively advanced feature and should be used only by developers who have a strong grasp of the fundamentals of the language. With that caveat in mind, reflection is a powerful technique and can enable applications to perform operations which would otherwise be impossible.

***Extensibility Features***  
- An application may make use of external, user-defined classes by creating instances of extensibility objects using their fully-qualified names

***Class Browsers and Visual Development Environments***  
- A class browser needs to be able to enumerate the members of classes. Visual development environments can benefit from making use of type information available in reflection to aid the developer in writing correct code.

***Debuggers and Test Tools***  
- Debuggers need to be able to examine private members on classes. Test harnesses can make use of reflection to systematically call a discoverable set APIs defined on a class, to insure a high level of code coverage in a test suite

### **Drawbacks of Reflection**

***Reflection*** is powerful, but should not be used indiscriminately. If it is possible to perform an operation without using reflection, then it is preferable to avoid using it. The following concerns should be kept in mind when accessing code via reflection.

***Performance Overhead***  
- Because reflection involves types that are dynamically resolved, certain Java virtual machine optimizations can not be performed. Consequently, reflective operations have slower performance than their non-reflective counterparts, and should be avoided in sections of code which are called frequently in performance-sensitive applications

***Security Restrictions***
- ***Reflection*** requires a runtime permission which may not be present when running under a security manager. This is an important consideration for code which has to run in a restricted security context, such as in an Applet

***Exposure of Internals***  
Since reflection allows code to perform operations that would be illegal in non-reflective code, such as accessing **private** fields and methods, the user of reflection can result in unexpected side-effects, which may render code dysfunctional and may destroy portability. Reflective code breaks abstractions and therefor may change behaviour with upgrades of the platform

<br />

## <a id="4"></a>`4. Demo` 

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

## <a id="5"></a>`5. Reference` 

[Oracle, Trail: The Reflection API](https://docs.oracle.com/javase/tutorial/reflect/index.html)\
[Oracle, Using Java Reflection](https://www.oracle.com/technical-resources/articles/java/javareflection.html)\
[JavaPoint, Java Reflection API](https://www.javatpoint.com/java-reflection)\
[Baeldung, Guide to Java Reflection](https://www.baeldung.com/java-reflection)\
[Jenkov.com, Java Reflection Tutorial](https://jenkov.com/tutorials/java-reflection/index.html)\
[Geeksforgeeks.org, Reflection in Java](https://www.geeksforgeeks.org/reflection-in-java/)\
[Stackoverflow, What is reflection and why is it useful? - 1](https://stackoverflow.com/a/37632)\
[Stackoverflow, What is reflection and why is it useful? - 2](https://stackoverflow.com/a/26424561)\
[Stackoverflow, Integer.class vs int.class](https://stackoverflow.com/questions/22470985/integer-class-vs-int-class)