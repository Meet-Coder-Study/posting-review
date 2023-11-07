## 서론

-   현재 프로그래머스 백엔드 데브코스 5기 멘토를 진행하던중, 아래와 같이 멘티의 질문이 있었다.

[##_Image|kage@n6Ere/btszRVidf5i/B0rgJBZvW63jYVP8Z7pmA0/img.png|CDM|1.3|{"originWidth":1280,"originHeight":270,"style":"alignCenter"}_##]

-   Java11까지만 해봤기 때문에 toList()에 대해서 잘 알지 못한다고 생각해 아래와 같이 정리를 해봤다.

## stream의 최종연산을 List로 반환하기.

-   stream의 최종연산을 List로 반환하는 방법은 Java11에선 아래와 두개가 있었다.

```
List<Integer> collectorToList = numbers.stream()
                .filter(it -> it % 2 == 0)
                .collect(Collectors.toList());
List<Integer> collectorToUnmodifiabledList = numbers.stream()
                .filter(it -> it % 2 == 0)
                .collect(Collectors.toUnmodifiableList());
```

-   즉, collect 함수에 함수형 인터페이스를 넣어서 List를 반환하는 법이였다.
-   Collectors.toList()와 Collectors.toUnmodifiableList() 두개의 차이는 가변 List냐, 불변 List이냐 이다.
-   불변 List라면 무엇을 못하느냐?
    -   랜덤 셔플, 정렬, 값 추가, 삭제 등을 할수가 없다. 즉, List를 아예 변경할수 있다는 것이다.
-   그렇다면 2개의 내부를 살펴보도록 하겠습니다.

```
/**
 * Returns a {@code Collector} that accumulates the input elements into a
 * new {@code List}. There are no guarantees on the type, mutability,
 * serializability, or thread-safety of the {@code List} returned; if more
 * control over the returned {@code List} is required, use {@link #toCollection(Supplier)}.
 *
 * @param <T> the type of the input elements
 * @return a {@code Collector} which collects all the input elements into a
 * {@code List}, in encounter order
 */
public static <T>
Collector<T, ?, List<T>> toList() {
    return new CollectorImpl<>(ArrayList::new, List::add,
                               (left, right) -> { left.addAll(right); return left; },
                               CH_ID);
}

/**
 * Returns a {@code Collector} that accumulates the input elements into an
 * <a href="../List.html#unmodifiable">unmodifiable List</a> in encounter
 * order. The returned Collector disallows null values and will throw
 * {@code NullPointerException} if it is presented with a null value.
 *
 * @param <T> the type of the input elements
 * @return a {@code Collector} that accumulates the input elements into an
 * <a href="../List.html#unmodifiable">unmodifiable List</a> in encounter order
 * @since 10
 */
public static <T>
Collector<T, ?, List<T>> toUnmodifiableList() {
    return new CollectorImpl<>(ArrayList::new, List::add,
                               (left, right) -> { left.addAll(right); return left; },
                               list -> {
                                   if (list.getClass() == ArrayList.class) { // ensure it's trusted
                                       return SharedSecrets.getJavaUtilCollectionAccess()
                                                           .listFromTrustedArray(list.toArray());
                                   } else {
                                       throw new IllegalArgumentException();
                                   }
                               },
                               CH_NOID);
}
```

```
CollectorImpl(Supplier<A> supplier,
              BiConsumer<A, T> accumulator,
              BinaryOperator<A> combiner,
              Set<Characteristics> characteristics) {
    this(supplier, accumulator, combiner, castingIdentity(), characteristics);
}
```

-   일단 toList()부터 살펴보면, Collector 인터페이스를 구현하고 있는데 각각 살펴보면
    -   supplier : 새로운 객체를 어떻게 생성하는지 정의하는데, 빈 ArrayList를 생성하고 있습니다.
    -   accumulator: Collector가 개별 요소를 어떻게 추가하는지 정의 합니다.
    -   combiner: 두 컨테이너를 어떻게 병합하는지 정의하는데, left List에 right 리스트를 addAll로 병합하고 잇습니다.
    -   characteristics: Collector의 특정을 정의하여 런타임 행동을 정의합니다.
-   중간 연산에서 나온 값들을 addAll로 한번에 추가하는 형식이라고 생각하면 좋습니다.
-   그렇다면 toUnmodifiabledList()는 `Function<A,R> finisher` 가 추가된걸 확인할수 있습니다.
    -   해당 로직을 간단히 설명해보면 아래와 같습니다.
    -   SharedSecrets 클래스는 서로 다른 패키지로 분리된 비공개 패키지 간의 공유 가능 상태를 제공하는 클래스로, JVM 내부 세부 정보를 추상화 하는데 사용합니다.
    -   여기서 getJavaUtilCollectionAceesss()는 java.util 패키지 내의 컬렉션 클래스에 대한 추가 접근을 허용하며 마지막의 listFromTrustedArray()메서드는 내부 배열을 복사하면서 새로운 불변 리스트를 만드는것이 아니라 이 배열에 대한 참조로 부터 직접 불변 리스트를 생성합니다. 이렇게 하는 이유는 메모리와 성능 향상을 위해서 입니다.
-   cf) 여기서 toUnmodifiableList()는 자바 10부터 추가되었습니다. 따라서 8~9인 경우에는 아래와 같이 작성하면 동일한 리스트를 반환받을수 있습니다.

```
List<Integer> collectorToList = Collections.unmodifiableList(numbers.stream().filter(it -> it % 2 == 0)     
                                            .collect(Collectors.toList()));`
```

-   그럼 Java16에 추가된 toList()를 살펴보겠습니다.

```
List<Integer> collectorToList = numbers.stream().filter(it -> it % 2 == 0)
                                             .toList()
```

```
  /**
     * Accumulates the elements of this stream into a {@code List}. The elements in
     * the list will be in this stream's encounter order, if one exists. The returned List
     * is unmodifiable; calls to any mutator method will always cause
     * {@code UnsupportedOperationException} to be thrown. There are no
     * guarantees on the implementation type or serializability of the returned List.
     *
     * <p>The returned instance may be <a href="{@docRoot}/java.base/java/lang/doc-files/ValueBased.html">value-based</a>.
     * Callers should make no assumptions about the identity of the returned instances.
     * Identity-sensitive operations on these instances (reference equality ({@code ==}),
     * identity hash code, and synchronization) are unreliable and should be avoided.
     *
     * <p>This is a <a href="package-summary.html#StreamOps">terminal operation</a>.
     *
     * @apiNote If more control over the returned object is required, use
     * {@link Collectors#toCollection(Supplier)}.
     *
     * @implSpec The implementation in this interface returns a List produced as if by the following:
     * <pre>{@code
     * Collections.unmodifiableList(new ArrayList<>(Arrays.asList(this.toArray())))
     * }</pre>
     *
     * @implNote Most instances of Stream will override this method and provide an implementation
     * that is highly optimized compared to the implementation in this interface.
     *
     * @return a List containing the stream elements
     *
     * @since 16
     */
    @SuppressWarnings("unchecked")
    default List<T> toList() {
        return (List<T>) Collections.unmodifiableList(new ArrayList<>(Arrays.asList(this.toArray())));
    } 
```

-   아주 심플해졌는데, 해당 List를 `Collections.unmodifiableList()`로 감싸서 불변 리스트를 반환하게 됩니다.

### 각 반환값들 테스트 해보기

```
package org.example;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1,2,3,4,5,6,7,8,9,10);

        // Collections
        List<Integer> collectorToList = numbers.stream()
                .filter(it -> it % 2 == 0)
                .collect(Collectors.toList());
        List<Integer> collectorToUnmodifiabledList = numbers.stream()
                .filter(it -> it % 2 == 0)
                .collect(Collectors.toUnmodifiableList());
        List<Integer> toList = numbers.stream()
                .toList();

        // add
        collectorToList.add(11);
        collectorToUnmodifiabledList.add(11); // 예외발생
        toList.add(11); // 예외 발생

        // remove
        collectorToList.remove(0);
        collectorToUnmodifiabledList.remove(0); // 예외 발생
        toList.remove(0); // 예외 발생

        // sort
        Collections.sort(collectorToList);
        Collections.sort(collectorToUnmodifiabledList); // 예외 발생
        Collections.sort(toList); // 예외 발생

        // shuffle
        Collections.shuffle(collectorToList);
        Collections.shuffle(collectorToUnmodifiabledList); // 예외 발생
        Collections.shuffle(toList); // 예외 발생
    }
}
```

-   예외는 아래와 같이 지원하지 않은 메서드라는 의미로 예외가 발생합니다.

```
Exception in thread "main" java.lang.UnsupportedOperationException
    at java.base/java.util.ImmutableCollections.uoe(ImmutableCollections.java:142)
    at java.base/java.util.ImmutableCollections$AbstractImmutableCollection.add(ImmutableCollections.java:147)
```

## 결론

-   Java8에 stream이 추가되면서 최종연산을 리스트로 반환하는 `.collect(Collectors.toList());` 메서드가 추가되었지만, mutable(가변) list가 반환되었다.
-   그러나 Java10에서 thread safe하고 안정적으로 관리하기 위해 `.collect(Collectors.toUnmodifiableList());` 메서드가 추가되었고 해당 메서드는 immutable(불변) list가 반환된다.
-   해당 메서드를 좀더 쉽게 사용할수 있게 하는 `toList()`를 java16에 추가되었고 동일하게 immutable(불변) list가 반환된다.
