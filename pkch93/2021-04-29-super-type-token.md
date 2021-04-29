# Super Type Token

## Type Token

```java
static Object createInstance(Object obj) throws InstantiationException, IllegalAccessException {
  return obj.getClass().newInstance();
}
```

다음과 같이 동적으로 객체를 생성하기 위해서 Object 타입의 `obj`를 받아 인스턴스로 생성하는 `createInstance` static 메서드가 있다고 가정한다.

```java
@Test
void typeUnsafe() throws InstantiationException, IllegalAccessException {
  // given & when
  String actual = (String) createInstance(new String());

  // then
  assertThat(actual.getClass()).isEqualTo(String.class);
}

@Test
void typeUnsafeFailed() {
  assertThatThrownBy(() -> {
      Integer instance = (Integer) createInstance(new String());
  }).isInstanceOf(ClassCastException.class);
}
```

정의한 createInstance를 토대로 값을 생성하면 결국 타입 캐스팅이 필요하다. 근데 첫 번째처럼 객체를 제대로 캐스팅이 가능한 경우라면 모르겠지만 두 번째 예시처럼 잘못 캐스팅하여 ClassCastException이 발생할 여지가 있다. 타입 캐스팅에 대해서는 컴파일러가 따로 잡아주지 못하기 때문이다.

위와 같이 예상치 못한 타입 에러를 방지하기 위해서 Type Token을 사용할 수 있다.
Type Token을 사용하는 가장 대표적인 예시가 Effective Java 3/E item 33에 소개된 타입 안전 이종 컨테이너이다.

```java
public class Favorites {
    private Map<Class<?>, Object> favorites = new HashMap<>();

    public <T> void putFavorite(Class<T> type, T instance) {
        favorites.put(Objects.requireNonNull(type), instance);
    }
    
    public <T> T getFavorite(Class<T> type) {
        return type.cast(favorites.get(type));
    }
}
```

Type Token은 `String.class`, `Integer.class`와 같은 형태로 `Class<T>`의 인자가 된다. Java에서 동적 타이핑을 할 때 타입 토큰을 활용하여 타입 안정성을 가져오는데 사용할 수 있다.

따라서 앞선 예시 `createInstance`를 Type Token을 활용한 형태로 수정해볼 수 있다.

```java
private static <T> T createInstance(Class<T> clazz) throws InstantiationException, IllegalAccessException {
  return clazz.newInstance();
}
```

위와 같이 Type Token 인자인 clazz를 받아서 인스턴스를 생성해 줄 수 있다.

```java
@Test
void typeToken() throws InstantiationException, IllegalAccessException {
  // given & when
  Object objectInstance = createInstance(Object.class);
  String stringInstance = createInstance(String.class);

  // then
  assertThat(objectInstance.getClass()).isEqualTo(Object.class);
  assertThat(stringInstance.getClass()).isEqualTo(String.class);
}
```

이를 활용하면 타입 캐스팅없이 깔끔하고 안전하게 인스턴스 생성이 가능하다.

## Java Type Token의 한계

토비의 봄 TV 2회 - 수퍼 타입 토큰 `33:50부터`: [https://www.youtube.com/watch?v=01sdXvZSjcI](https://www.youtube.com/watch?v=01sdXvZSjcI&t=888s)

기존에 Object를 활용한 방법에 비해서는 Type Token이 훨씬 나은 방법을 제공하지만 한계가 존재한다. 바로 Generic을 사용했을 때이다.

```java
public class Favorites {
    private Map<Class<?>, Object> favorites = new HashMap<>();

    public <T> void putFavorite(Class<T> type, T instance) {
        favorites.put(Objects.requireNonNull(type), instance);
    }
    public <T> T getFavorite(Class<T> type) {
        return type.cast(favorites.get(type));
    }
}
```

타입 안전 이종 컨테이너인 Favorites에 여러 String 값과 Integer 값을 넣고 싶다고 가정한다. 여러 값이니 `List`를 활용할 것이다.

```java
Favorites favorites = new Favorites();
favorites.putFavorite(List.class, List.of("딸기", "수박", "멜론"));
favorites.putFavorite(List.class, List.of(1, 3, 7));
```

위와 같이 실행하면 결과는 아래 `List.of(1, 3, 7)`만이 favorites에 남는다. List 타입이 같으므로 덮어씌워지는 것이다.

사실 정확히는 첫 리스트는 `List<String>`이고 두번째 리스트는 `List<Integer>`이다. 그러면 아래와 같이 타입 키값에 각각 `List<String>.class`와 `List<Integer>.class`로 제네릭 파라미터 타입을 주면 어떻게 될까?

```java
Favorites favorites = new Favorites();
favorites.putFavorite(List<String>.class, List.of("딸기", "수박", "멜론")); // compile error!
favorites.putFavorite(List<Integer>.class, List.of(1, 3, 7)); // compile error!
```

아예 컴파일 되지 않는다. 왜냐면 `Class` Type Token에는 타입 파라미터에 대한 정보가 존재할 수 없기 때문이다. 즉, Java에서 일반적으로 제공하는 Type Token으로는 Generic 정보를 사용할 수 없다는 의미이다.

### Type Token에 파라미터 타입을 넣을 수 없는 이유

Java의 파라미터 타입, 즉, Generic 타입은 처음부터 존재했던 것이 아니다. Java 1.5부터 Generic이 등장했다. 언어에서 Generic을 구현하는 방식은 Type Erasure `삭제`와 Type Reification `구체화`가 있다. 자바는 여기서 Erasure 방식을 활용하여 Generic을 구현하였다.

> 참고로 C#은 Type Reification을 활용하였다.

Type Erasure를 사용하면 Generic 타입 정보를 지워버리는 방법이다. 즉, 컴파일 이후 Java 바이트코드에서는 Generic 타입 정보를 알 수 없다는 의미이다.

Java가 Erasure를 사용할 수 밖에 없었던 이유는 당시 상황과 연관이 있다. 이미 그 당시에도 Java는 엔터프라이즈 환경에서 널리 사용되던 언어였다. 또한 수년간 Java 생태계가 지속되면서 수많은 라이브러리들도 만들어지고 운영되어져 왔는데 Type Reification으로 Generic을 구현하면 이전에 구현된 라이브러리가 Generic과 호환되도록 업데이트 하지 않는 이상 호환이 불가능했다. 이런 문제로 이전 버전과의 호환성을 위해 Java는 Type Erasure를 사용하였다.

> Java 1.5는 2004년 9월에 릴리즈되었다.

## SuperTypeToken

Super Type Token은 Neal Gafter가 만든 기법으로 다음과 같이 사용할 수 있다.

```java
static class Type<T> {
  T value;
}

static class SuperTypeToken extends Type<String> {}
```

위와 같은 방식으로 Generic 타입을 컴파일 후에도 보존할 수 있다.

```java
List<String> words = List.of("첼시", "맨시티", "레알마드리드", "PSG");
```

`words`와 같이 Generic 클래스를 인스턴스화 할때 준 파라미터 타입 `String`은 컴파일러에 의해 지워진다. `Type Erasure` 즉, 기존타입인 `List`에 파라미터 타입을 전달하는 것이기 때문에 지워지는 것이다.

하지만 `static class SuperTypeToken extends Type<String> {}` 이 방식은 아예 새로운 타입이 정의되는 것이다. 즉, `Type`만 하나의 타입이 되는 것이 아니라 파라미터 타입까지 포함하여 `Type<String>`가 새로운 타입이 되는 것이다. 이 덕분에 Java 컴파일러는 컴파일 후에도 Generic 정보를 가질 수 있다.

이를 활용하여 앞선 Favorites의 문제를 해결할 수 있다.

### 문제 해결

```java
public class Favorites {
  private Map<Class<?>, Object> favorites = new HashMap<>();
  
	public <T> void putFavorite(Class<T> type, T instance) {
    favorites.put(Objects.requireNonNull(type), instance);
  }
  public <T> T getFavorite(Class<T> type) {
    return type.cast(favorites.get(type));
  }
}
```

앞서 위 Favorites에 문제는 `List<String>`과 `List<Integer>`를 구별하지 못한다는 것이었다. 이를 SuperTypeToken으로 해결해본다.

```java
static class SuperTypeToken<T> {
  Type type;

  public SuperTypeToken() {
      Type sType = getClass().getGenericSuperclass();
      if (sType instanceof ParameterizedType) {
          this.type = ((ParameterizedType) sType).getActualTypeArguments()[0];
      } else {
          throw new RuntimeException();
      }
  }

  @Override
  public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass().getSuperclass() != o.getClass().getSuperclass()) return false;
      SuperTypeToken<?> that = (SuperTypeToken<?>) o;
      return Objects.equals(type, that.type);
  }

  @Override
  public int hashCode() {
      return Objects.hash(type);
  }
}
```

SuperTypeToken은 위와 같다. 생성자를 통해 Generic 타입 정보를 type에 저장한다. 제네릭 타입 정보가 없는 경우는 `RuntimeException`을 던진다.

그리고 equals와 hashCode를 구현한다. 이는 SuperTypeToken에서 관심있는 것은 SuperTypeToken 그 자체가 아니라 SuperTypeToken이 가진 Generic 타입 정보이다. 때문에 type끼리 비교가 필요하다.

그리고 equals 메서드를 보면 `getClass().getSuperclass() != o.getClass().getSuperclass()` 이렇게 superClass 비교하는 것을 볼 수 있다. 이는 보통 SuperTypeToken을 익명클래스 형태로 생성하게 되는데 익명클래스는 매번 새로운 클래스를 정의한다. 따라서 클래스 비교로는 equals가 false가 되므로 슈퍼클래스간 비교가 필요하다.

위 SuperTypeToken을 활용해서 Favorites를 다음과 같이 변경할 수 있다.

```java
static class Favorites {
    private Map<SuperTypeToken<?>, Object> favorites = new HashMap<>();

    public <T> void putFavorite(SuperTypeToken<T> type, T instance) {
        favorites.put(Objects.requireNonNull(type), instance);
    }

    @SuppressWarnings("unchecked")
    public <T> T getFavorite(SuperTypeToken<T> superTypeToken) {
        if (superTypeToken.type instanceof Class<?>) {
            return ((Class<T>) superTypeToken.type).cast(favorites.get(superTypeToken));
        } else {
            return ((Class<T>)((ParameterizedType) superTypeToken.type).getRawType()).cast(favorites.get(superTypeToken));
        }
    }
}
```

putFavorite은 큰 차이가 없다. 단지 TypeToken `Class<T>`을 받는 인자를 SuperTypeToken으로 변경했다. 그리고 이 SuperTypeToken을 키로 저장한다.

getFavorite은 많이 길어졌다. 만약 type이 파라미터 타입을 가진 타입이 아니라면 곧바로 타입 캐스팅을 통해 리턴한다. `ex. String, Integer 등`
하지만 type이 파라미터 타입을 가졌다면 `ParameterizedType` 타입의 Raw Type을 가져와서 타입 캐스팅을 해준다.

```java
@Test
void superTypeToken() {
  // given
  Favorites favorites = new Favorites();

  favorites.putFavorite(new SuperTypeToken<List<String>>(){}, Arrays.asList("딸기", "수박", "멜론"));
  favorites.putFavorite(new SuperTypeToken<List<Integer>>(){}, Arrays.asList(1, 3, 9));

  // when
  List<String> favoriteFruits = favorites.getFavorite(new SuperTypeToken<List<String>>(){});
  List<Integer> favoriteNumbers = favorites.getFavorite(new SuperTypeToken<List<Integer>>(){});

  // then
  assertThat(favoriteFruits).hasSize(3).containsExactly("딸기", "수박", "멜론");
  assertThat(favoriteNumbers).hasSize(3).containsExactly(1, 3, 9);
}
```

이제 정상적으로 `List<String>`과 `List<Integer>`가 구별이 가능해졌다.

> 참고로 Spring의 ParameterizedTypeReference가 Super Type Token 방식으로 구현되어있다.
