---
created: 2024-01-18T17:41:31.+09:00
tags: []
source: https://cloud-whale.hashnode.dev/dart-hashmap-splaytreemap-linkedhashmap
author: Taejung Heo
---

원본: https://cloud-whale.hashnode.dev/dart-hashmap-splaytreemap-linkedhashmap

# [Dart] Map 구현체: HashMap, SplayTreeMap, LinkedHashMap

> [!Excerpt]
> Flutter 개발을 하다가 key를 기준으로 정렬되는 map 자료형이 필요하여 공부를 찾아보다가 생각보다 여러 가지 구현체가 있다는 것을 알게 됐다. Dart 언어를 접한지 벌써 3년이 다 되어가는데 이런 요구사항이 있었던 적이 한 번도 없었어서 이제야 알게 됐다는 것이 놀라웠다.
> 그래서 오늘은 세 가지 Dart Map 구현체 HashMap, SplayTreeMap, LinkedHashMap에 대해서 살펴보고 각 구현체를 언제 사용해야 하는지...

---

Flutter 개발을 하다가 key를 기준으로 정렬되는 map 자료형이 필요하여 공부를 찾아보다가 생각보다 여러 가지 구현체가 있다는 것을 알게 됐다. Dart 언어를 접한지 벌써 3년이 다 되어가는데 이런 요구사항이 있었던 적이 한 번도 없었어서 이제야 알게 됐다는 것이 놀라웠다.

그래서 오늘은 세 가지 Dart Map 구현체 `HashMap`, `SplayTreeMap`, `LinkedHashMap`에 대해서 살펴보고 각 구현체를 언제 사용해야 하는지에 대해서 정리를 해보려고 한다.

Map은 연관된 키를 사용하여 값을 검색하는 키/값 쌍의 컬렉션이다. 여러 프로그래밍 언어에서 기본적으로 제공하는 자료형으로 파이썬에서는 사전(dictionary)이라는 자료형으로 제공하고 있다.

`Map.entries` 속성을 통해서 Map안의 키/값 쌍을 반복할 수 있는데 이때 반복의 순서는 맵의 세부 구현에 따라서 달라지게 된다. 현재 Dart 3.2.5 버전의 Map 구현체는 `HashMap`, `SplayTreeMap`, `LinkedHashMap` 세 가지가 있다.

### **1\. HashMap**

`HashMap`은 Dart의 기본 Map 구현체로 해시 테이블을 활용하여 조회, 추가, 삭제가 빠르지만 요소의 순서를 유지하지 않는다는 특징이 있다.

#### `HashMap`이 적합한 상황

- **성능**: 빠른 조회, 추가, 삭제가 중요할 때
- **순서가 없는 데이터:** 요소들의 순서가 중요하지 않은 상황

#### 예제 시나리오: 앱 설정 저장, 검색

```dart
import 'dart:collection';

void main() {
  final userPreferences = HashMap&lt;String, dynamic&gt;();

  // 사용자 선호도 설정
  userPreferences['theme'] = 'Dark';
  userPreferences['fontSize'] = 14;
  userPreferences['notificationsEnabled'] = true;

  // 특정 선호도 접근
  final theme = userPreferences['theme'];
  print('사용자가 선택한 테마: $theme');

  // 더 많은 선호도 추가
  userPreferences['language'] = 'English';
}

// Output:
// 사용자가 선택한 테마: Dart
```

### **2\. SplayTreeMap**

`SplayTreeMap`은 [self-balancing binary search tree](https://en.wikipedia.org/wiki/Self-balancing_binary_search_tree)를 기반으로 하는 Map 구현체로 키를 기준으로 값을 정렬한다. 자주 사용하는 값은 트리의 루트에 가까운 위치로 이동되어 이후에 접근할 때 더 빠르게 접근할 수 있게 만든다는 특징이 있다.

#### `SplayTreeMap`이 적합한 상황

- **정렬:** 키를 기준으로 요소들을 정렬된 상태로 유지해야 할 때 (순서가 중요한 데이터)
- **효율적인 접근:** 데이터별로 접근 빈도가 크게 차이나는 상황

#### 예시 시나리오: 리더보드

점수 순으로 정렬된 상태를 유지하면서 Top3와 같이 자주 접근하는 데이터가 있을 경우가 있을 때 `SplayTreeMap`이 유용하게 사용될 수 있다.

```dart
import 'dart:collection';

void main() {
  final scores = &lt;String, int&gt;{};
  final leaderboard = SplayTreeMap&lt;int, Set&lt;String&gt;&gt;();

  // 플레이어 점수 추가/업데이트하는 함수
  void updateScore(String playerId, int score) {
    leaderboard[scores[playerId]]?.remove(playerId);
    leaderboard.putIfAbsent(score, () =&gt; {}).add(playerId);
    scores[playerId] = score;
  }

  // 점수 추가/업데이트
  updateScore('player1', 100);
  updateScore('player2', 150);
  updateScore('player3', 100);

  // 리더보드를 내림차순으로 표시 (가장 높은 점수가 먼저)
  for (var score in leaderboard.keys.toList().reversed) {
    print('점수: $score, 플레이어들: ${leaderboard[score]}');
  }

  // 점수 추가/업데이트
  updateScore('player1', 120);
  updateScore('player2', 200);
  updateScore('player3', 150);

  // 리더보드를 내림차순으로 표시 (가장 높은 점수가 먼저)
  print("\n업데이트 후");
  for (var score in leaderboard.keys.toList().reversed) {
    if(leaderboard[score] != null &amp;&amp; leaderboard[score]!.isNotEmpty) {
      print('점수: $score, 플레이어들: ${leaderboard[score]}');
    }
  }
}

// Output:
// 점수: 150, 플레이어들: {player2}
// 점수: 100, 플레이어들: {player1, player3}
//
// 업데이트 후
// 점수: 200, 플레이어들: {player2}
// 점수: 150, 플레이어들: {player3}
// 점수: 120, 플레이어들: {player1}
```

### **3\. LinkedHashMap**

`LinkedHashMap`은 항목이 추가된 순서를 유지한다. 즉, 맵을 순회할 때 항목이 추가된 순서대로 반환된다. 항목의 삽입 순서가 중요할 때 특히 유용하다.

#### `LinkedHashMap`이 적합한 상황

- **순서 유지:** 데이터의 순서가 중요한 애플리케이션

#### 예시 시나리오: 쇼핑 카트

쇼핑카트에는 담은 순서대로 표시가 되며 쇼핑카트의 수량이 변경되더라도 그 순서는 변경되지 않는다. 쇼핑카트는 `LinkedHashMap`이 동작하는 방식과 유사하다.

```dart
import 'dart:collection';

void main() {
  var shoppingCart = LinkedHashMap&lt;String, int&gt;();

  // 상품을 쇼핑 카트에 추가
  shoppingCart['Apple'] = 1;
  shoppingCart['Banana'] = 2;
  shoppingCart['Orange'] = 2;

  // 카트 내용 확인
  print("쇼핑 카트:");
  shoppingCart.forEach((itemNumber, itemName) {
    print("$itemNumber: $itemName개");
  });

  // 수량 변경
  shoppingCart['Apple'] = 6;

  print("\n수량 변경 후 쇼핑 카트:");
  shoppingCart.forEach((itemNumber, itemName) {
    print("$itemNumber: $itemName개");
  });
}

// Output:
// 쇼핑 카트:
// Apple: 1개
// Banana: 2개
// Orange: 2개
//
// 수량 변경 후 쇼핑 카트:
// Apple: 6개
// Banana: 2개
// Orange: 2개
```

## 결론 - 무엇을 사용해야 할까?

- 순서가 중요하지 않고 빠른 검색, 삽입, 삭제가 필요한 경우 `HashMap`
- 정렬과 자주 접근하는 요소에 대한 효율적인 접근이 필요할 때 `SplayTreeMap`
- 삽입 순서가 유지되어야 하는 경우 `LinkedHashMap`

## 추가 자료 및 참고 자료:

- [Dart Collection - HashMap](https://api.dart.dev/stable/3.2.5/dart-collection/HashMap-class.html)
- [Dart Collection - SplayTreeMap](https://api.dart.dev/stable/3.2.5/dart-collection/SplayTreeMap-class.html)
- [Dart Collection - LinkedHashMap](https://api.dart.dev/stable/3.2.5/dart-collection/LinkedHashMap-class.html)
