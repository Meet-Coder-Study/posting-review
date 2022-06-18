# ****[9 tips to Increase your Java performance(자바 성능을 향상시키기 위한 9가지 팁)](https://sendilkumarn.com/blog/9-tips-to-increase-your-java-performance/)****

> 어떤 바보라도 컴퓨터가 이해할 수 있는 코드를 작성할 수 있습니다. 좋은 프로그래머는 인간이 이해할 수 있는 코드를 작성합니다. - 마틴 파울러
> 

그러나 고성능 코드를 작성하고 싶은 마음은 어느 개발자나 가지고 있습니다. Java 코드를 더 빠르게 실행하는 방법을 알아보도록 하겠습니다.

> 참고 : JVM은 효과적으로 코드를 최적화 합니다. 일반적인 사용 사례에서 최적화할 필요는 없습니다. 그러나 JVM에 최대 성능을 내기를 원합니다. 여기에 초점을 맞춥니다.
> 

> 모든 테스트는 Mackbook Pro 2017 노트북의 OpenJDK 12.0.1에서 수행되었습니다.
> 

## **1. Instantiate in constructor(생성자에서 인스턴스화)**

만약 Collections가 한번만 초기화된다면 Collections의 생성자로 인스턴스화를 한 다음에 `addAll`로 값을 설정하는 것 보다 초기 값과 같이 한번에 초기화하는 것이 좋습니다.

```java
// Slower 🚶‍♂️
Set<String> set = new HashSet<>();
set.addAll(Arrays.asList("one", "two", "three"));

// Faster 🚀
Set<String> set = new HashSet<>(Arrays.asList("one", "two", "three"));
```

[JMH benchmarks](http://tutorials.jenkov.com/java-performance/jmh.html)를 사용해서 이를 확인해보도록 하겠습니다.

> 결과의 단위는 operations/second(op/s) 입니다. 숫자가 많을수록 성능은 떨어집니다.
> 

```java
@State(Scope.Thread)
public static class MyState {

    @Setup(Level.Trial)
    public void doSetup() {
        var arr = new Integer[100000];
        for (var i = 0; i < 100000; i++) {
            arr[i] = i;
        }
        list = Arrays.asList(arr);
    }

    public List list;
}

// Faster 🚀 > ~148,344 op/s
@Benchmark
public HashSet usingConstructor() {
    var set = new HashSet<>(list);
    return set;
}

// Slower 🚶‍♂️ > ~112,061 op/s
@Benchmark
public HashSet usingAddAll() {
    var set = new HashSet<>();
    set.addAll(list);
    return set;
}
```

> `addAll` 보다 생성자에서 초기화 하는것이 ~36000 op/s 를 제공합니다.
> 

---

## **2. `add` 보단 `addAll` 이 더 빠르다.**

유사하게 `addAll` 은 `add` 를 사용했을때 보다 더 빠른 작업을 제공합니다. 따라서 무엇가를 추가할때는 `add` 보단 `addAll` 을 사용하는것이 좋습니다.

```java
// Slower 🚶‍♂️ ~116116op/s
@Benchmark
public ArrayList<Integer> usingAdd() {
    var a = new int[1000];
    for (var i = 0; i < 1000; i++) {
        a[i] = i;
    }

    var arr = new ArrayList<Integer>();
    for (var i = 0; i < 1000; i++) {
        arr.add(a[i]);
    }

    return arr;
}

// Faster 🚀 ~299130 op/s
@Benchmark
public ArrayList<Integer> usingAddAll() {
    var a = new Integer[1000];
    for (var i = 0; i < 1000; i++) {
        a[i] = i;
    }

    var arr = new ArrayList<Integer>();
    arr.addAll(Arrays.asList(a));
    return arr;
}
```

거의`addAll` 이 `add` 보단 2개 이상 빠릅니다.

---

## **3. Map에서 `KeySet` 보단 `EntrySet` 를 사용하라.**

맵을 많이 반복한다면 ``keySet`` 보단 `entrySet`을 사용해야 합니다.

```java
// Slower 🚶‍♂️ ~37000 op/s
@Benchmark
public HashMap<Integer, Integer> keySetIteration(Blackhole blackhole) {
    var someMap = new HashMap<Integer, Integer>();

    for (var i = 0; i < 1000; i++) {
        someMap.put(i, i);
    }

    var sum = 0;
    for(Integer i: someMap.keySet()) {
        sum += i;
        sum += someMap.get(i);
    }
    blackhole.consume(sum);
    return someMap;
}

// Faster 🚀 ~45000 op/s
@Benchmark
public HashMap<Integer, Integer> entrySetIteration(Blackhole blackhole) {
    var someMap = new HashMap<Integer, Integer>();

    for (var i = 0; i < 1000; i++) {
        someMap.put(i, i);
    }

    var sum = 0;
    for(Map.Entry<Integer, Integer> e: someMap.entrySet()) {
        sum += e.getKey();
        sum += e.getValue();
    }

    blackhole.consume(sum);

    return someMap;
}
```

- `keySet`보다 `entrySet`이 ~9000op/s 빠릅니다.

## **4. 단건 요소인 경우 `arrayList` 대신에 `SingletonList` 를 사용하세요.**

```java
// Faster 🚀
var list = Collections.singletonList("S");

// Slower 🚶‍♂️
var list = new ArrayList(Arrays.asList("S"));
```

---

## **5. `HashSet`. `EnumSet` 대신에 `EnumSet` 을 사용하는게 더 빠릅니다.**

```java
// Faster 🚀
public enum Color {
    RED, YELLOW, GREEN
}

var colors = EnumSet.allOf(Color.class);

// Slower 🚶‍♂️
var colors = new HashSet<>(Arrays.asList(Color.values()));
```

EnumSet의 자세한 내용은 [여기](https://www.baeldung.com/java-enumset)를 참고해주세요.

---

## **6. 임의로 객체를 초기화하지 말고 재사용화 하세요.**

```java
// Faster 🚀
 var i = 0 ;
 i += addSomeNumber();
 i -= minusSomeNumber();
 return i;

 // Slower 🚶‍♂️
 var i = 0 ;
 var j = addSomeNumber();
 var k = minusSomeNumber();
 var l = i + j - k;
 return l;
```

---

## **7.  `String.isEmpty()` 를 사용해서 String이 비어있는지 확인하세요.**

문자열은 `byte[]` 이며, isEmpty()는 오직 Array가 비어 있는지 확인하기 때문에 더 빠릅니다.

```java
public boolean isEmpty() {
        return value.length == 0;
}
```

---

## **8. 만약 단일 문자를 사용한다면 String이 아니라 Character를 사용하세요.**

```java
 // Faster 🚀
 var r = 'R' ;
 var g = 'G' ;
 var b = 'B' ;

 // Slower 🚶‍♂️
 var r = "R" ;
 var g = "G" ;
 var b = "B" ;
```

---

## **9. 가능한 모든 곳에 [StringBuilder](https://docs.oracle.com/javase/7/docs/api/java/lang/StringBuilder.html) 를 사용하세요.**

```java
// Faster 🚀
StringBuilder str = new StringBuilder();
str.append("A");
str.append("B");
str.append("C");
str.append("D");
str.append("E");
....

// Slower 🚶‍♂️
var str = "";
str += "A";
str += "B";
str += "C";
str += "D";
str += "E";
....
```

> 그러나 단일 연결을 수행해야 할때는 StringBuilder를 사용하는것 보단 `+` 를 사용하는것이 더 빠릅니다.
>
