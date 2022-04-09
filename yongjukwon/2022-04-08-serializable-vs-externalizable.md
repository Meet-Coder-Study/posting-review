# Serializable vs Externalizable

## `Contents`  
### [1. What is Serialization?](#1)  
### [2. Serialization 관련 주의할 점](#2)
<!-- ### [2. What is Externalization?](#)  
<!-- ### [3. Difference between Serialization & Externalization](#3)   -->
### [3. Serialization 과 Externalization의 차이점](#4)  
### [4. References](#5)

<br />

## <a id="1"></a>`1. What is Serialization` 

  <!-- - Serialization is a Java-provided mechanism where a object can be represented as a sequence of bytes that includes the object's data as well as information about the object's type and the types of data stored in the object -->
  - Serialization 은 자바가 제공하는 기능 중 하나로, Object에 대한 Data와 Type, 그리고 Object안의 Data와 그의 Type까지 Byte stream으로 변환해준다. 반대로 Deserialization은 변환된 Byte Stream을 다시 Object로 변환해주는 과정이다.

    <img src="./images/serialize-deserialize-java.png" style=" display: block; margin: 0 auto; margin-bottom: 20px;">

  <!-- - A Java object is serializable if its class or any of its superclasses implements either `java.io.Serializable` interface or its sub-interface, `java.io.Externalizable`. -->
  - Java Object는 클래스나 그 클래스의 부모 클래스가 `java.io.Serialzable`나 `java.io.Externalizable`을 implement했을 때 Serialization이 가능하다.

  <!-- - When an object is serialized, information that identifies its class is recorded in the serialized stream. However, the class's definition("class file") itself is not recorded.  -->
  - Object가 Serialize 될 때 어떤 클래스가 저장되었는지에 대한 정보가 serialized stream에 함께 기록이 된다. 하지만 클래스의 definition(class file) 자체를 저장하지는 않는다.  

    ```Java
    import java.io.Serializable;

    public class Employee implements Serializable {
        public String name;
        public String address;
        public transient int SSN;
        public int number;

        public void mailCheck() {
            System.out.println("Mailing a check to " + name + " " + address);
        }
    }

        ------------------------------------------------------------------------------------------
    /* Serialization */
    
    import java.io.FileOutputStream;
    import java.io.IOException;
    import java.io.ObjectOutputStream;

    public class SerializeDemo {

        public static void main(String [] args) {
            Employee employee = new Employee();
            employee.name = "Reyan Ali";
            employee.address = "Phokka Kuan, Ambehta Peer";
            employee.SSN = 11122333;
            employee.number = 101;

            String path = "src/main/resources/employee.ser";

            try (FileOutputStream fileOut = new FileOutputStream(path);
                ObjectOutputStream out = new ObjectOutputStream(fileOut)) {
                out.writeObject(employee);

                System.out.printf("Serialized data is saved in {}", path);
            } catch (IOException i) {
                i.printStackTrace();
            }
        }
    }

    ------------------------------------------------------------------------------------------
    /* Deserialization */

    import java.io.FileInputStream;
    import java.io.IOException;
    import java.io.ObjectInputStream;

    public class DeserializeDemo {
        public static void main(String [] args) {
            Employee e = null;

            try (FileInputStream fileIn = new FileInputStream("src/main/resources/employee.ser");
                ObjectInputStream in = new ObjectInputStream(fileIn)) {
                e = (Employee) in.readObject();
            } catch (IOException i) {
                i.printStackTrace();
                return;
            } catch (ClassNotFoundException c) {
                System.out.println("Employee class not found");
                c.printStackTrace();
                return;
            }

            System.out.println("Deserialized Employee...");
            System.out.printf("Name: {}\n", e.name);
            System.out.printf("Address: {}\n" + e.address);
            System.out.printf("SSN: {}\n" + e.SSN);
            System.out.printf("Number: {}\n" + e.number);
        }
    }

    /**
      Deserialized Employee...
      Name: Reyan Ali
      Address: Phokka Kuan, Ambehta Peer
      SSN: 0
      Number: 101
    */
    ```

  <!-- - The byte stream created is a platform independent. So, the object serialized on one platform can be deserialized on a different platform -->
  - 변환된 Byte stream은 platform(JVM)과 독립적이다. 즉, 한 platform에서 serialize 된 Object는 다른 platform에서 deserializing 이 가능하다.

  <!-- - The Serialization runtime associates a version number with each Serializable class called a SerialVersionUID, which is used during Deserialization to verify that sender and receiver of a serialized object have loaded classes for that object which are compatible with respect to serialization. If the receiver has loaded a class for the object that has different UID that that of corresponding sender's class, the Deserialization will result in an `InvalidClassException`. A serializable class can declare its own UID explicitly by declaring a field name.  
  The automatically generated number is compiler dependent. This means it may cause an unlikely `InvalidClassException` -->
  - Serialization 과정에는 `SerialVersionUID`라는 version number가 함께 관여가 되는데 이 ID는 deserialization 과정 중에 sender class(serialization 때의 class) 와 receiver class(deserialization 때의 class)가 compatible한 지 확인할 때 쓰인다. 만약 receiver class가 다른 ID를 가지고 있다면 deserialization 과정 중 `InvalidClassException`을 발생한다. 개발자가 직접 ID를 작성할 수도 있고, 그렇지 않다면 자동으로 생성된다. 자동생성 된 ID는 Compiler에 의존적이기 떄문에 직접 ID를 작성하는 걸 추천한다.

    e.g.
    ```Java
      // It must be static, vinal and of type long
      (any access modifier) static final long serialVersionUID = 42L;
    ```

<br />

## <a id="2"></a>`2. Serialization 관련 주의할 점` 

  <!-- - If a parent class implemented Serializable interface, child class doesn't need to implement it but vice-versa is not true   -->
  - 만약 부모 클래스가 Serializable 인터페이스를 implement 했다면 자식 클래스는 직접 implement 할 필요는 없다. 하지만 그 반대는 그렇지 않다.

  <!-- - Only non-static members are saved via Serialization process -->
  - 오직 non-static 멤버들만 Serialization이 가능하다 

  <!-- - Static data members and transient data members are not saved via Serialization process. So, if you don't want to save value of non-static data member, make it transient -->
  - 만약 저장하고 싶지 않은 데이터가 있다면 Static 혹은 transient을 이용하면 된다

  <!-- - Constructor of object is never called when an object is deserialized -->
  - Object가 deserialize될 때 Constructor는 관여하지 않는다

  <!-- - Associated objects must be implementing Serializable interface -->
  - 관련된 object들 역시 serializable interface를 implement 해야한다

    ```Java
    class A implements Serializable{

      // B also implements Serializable interface
      B ob=new B();  
    }
    ```

  <!-- - If we are trying to serialize a non-serializable object, we will get `NotSerializableException` -->
  - Non-serializable object를 serialize 하려고 하면 `NotSerializableException`이 발생한다
  
<br />

## <a id="3"></a>`3. What is Externalization`

  <!-- - Externalizable extends from the `java.io.Serializable` interface. Any class that implements Externalizable interface should override the `writeExternal(), readExternal()` methods. That way we can change the JVM's default serialization behaviour -->
  - Extrenalizable은 `java.io.Serializable` interface를 상속한다. Serializable과 다른 점은 Externalizable을 implement한 class는 `writeExternal`과 `readExternal`을 override 해야 한다. 

  - Serializable 과는 달리 개발자가 control을 할 수 있기 때문에 JVM이 제공하는 기본 serialization 변경할 수 있다.

    ```Java
    import java.io.Externalizable;
    import java.io.IOException;
    import java.io.ObjectInput;
    import java.io.ObjectOutput;

    public class EmployeeExternalizable implements Externalizable {

        public String name;
        public String address;
        public int SSN;
        public int number;

        // getter, setter

        // Serialize 할 때 쓰임
        @Override
        public void writeExternal(ObjectOutput out) throws IOException {
            out.writeObject(name);
            out.writeObject(address);
            out.writeInt(number);
        }

        // Deserialize 할 때 쓰임
        @Override
        public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
            this.name = (String) in.readObject();
            this.address = (String) in.readObject();
            this.number = in.readInt();
        }
    }

    ------------------------------------------------------------------------------------------

    import java.io.*;

    public class ExternalizeDemo {

        public static void main(String[] args) throws IOException, ClassNotFoundException {
            EmployeeExternalizable employeeEx = new EmployeeExternalizable();
            employeeEx.setAddress("438 Seymour Street");
            employeeEx.setName("John Doe");
            employeeEx.setNumber(101);

            String path = "src/main/resources/employeeEx.ser";

            // Serialization
            try (FileOutputStream fos = new FileOutputStream(path);
                ObjectOutputStream oos = new ObjectOutputStream(fos)) {
                employeeEx.writeExternal(oos);
            } catch (IOException e) {
                System.err.println("Error occurred during serialization!");
                e.printStackTrace();
            }

            // Deserialization
            EmployeeExternalizable employeeEx2 = new EmployeeExternalizable();

            try(FileInputStream fis = new FileInputStream(path);
                ObjectInputStream ois = new ObjectInputStream(fis)) {
                employeeEx2.readExternal(ois);
            } catch (IOException | ClassNotFoundException e) {
                System.err.println("Error occurred during deserialization!");
                e.printStackTrace();
            }

            System.out.println(employeeEx2.getAddress().equals(employeeEx.getAddress()));
            System.out.println(employeeEx2.getName().equals(employeeEx.getName()));
            System.out.println(employeeEx2.getNumber() == employeeEx.getNumber());
        }
    }

    /**
      true
      true
      true
    */
    ```
<br />

## <a id="4"></a>`4. Serialization 과 Externalization 의 차이점`

<!-- 
 &nbsp; | Key | Serialization | Externalization
| :---: | :---: | :---: | :---: |
1  | Interface | It is a marker interface | Contains `readExternal()` and `writeExternal()`
2  | Implementation logic | Gives responsibility to JVM for serializing | Provides implementation logic control to developer
3  | Way to ignore variables | JVM ignores transient variables | Developer can choose variables to ignore or transient
4  | Performance | Relatively slow as it uses reflection | Relatively faster as it provides a full control over the implementation approach
-->

  &nbsp; | Key | Serialization | Externalization
| :---: | :---: | :---: | :---: |
1  | Interface | 마커 인터페이스 | `readExternal()`,  `writeExternal()` 포함
2  | Implementation logic | JVM이 모든 권한을 가짐 | 개발자가 logic을 변경할 수 있음
3  | Way to ignore variables | JVM이 static 혹은 transient data를 제외함 | 개발자가 선택할 수 있음
4  | Performance | Reflection을 사용하기 때문에 상대적으로 느림 | 개발자가 implementation을 control할 수 있기 때문에 상대적으로 빠름

<br />

## <a id="4"></a>`4. References`

[`Java Documentation - Serializable Objects`]("https://docs.oracle.com/javase/tutorial/jndi/objects/serial.html")  
[`TutorialsPoint - Java Serialization`]("https://www.tutorialspoint.com/java/java_serialization.htm")  
[`Geeksforgeeks - Serialization and Deserialization in Java with Example`]("https://www.geeksforgeeks.org/serialization-in-java/")  
[`Baeldung - Introduction to Java Serialization`]("https://www.baeldung.com/java-serialization")