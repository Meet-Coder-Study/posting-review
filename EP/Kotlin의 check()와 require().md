# Overview

코틀린에서는 check와 require라는 함수를 제공한다. **[이펙티브 코틀린 - 아이템5. 예외를 활용해 코드에 제한을 걸어라]** 에서 자세한 내용이 기재되어있다.

> By using `require` and `check` we get three things
> 
> 1. We are able to validate function arguments and state.
> 2. We are able to throw particular exceptions depending on the case.
> 3. We are able to write idiomatic Kotlin code that is clean and readable.

- `check()`는 안에 있는 구문이 `false`일 때 `IllegalStateException`을  발생시킨다.
- `require()`는 안에 있는 구문이 `false`일 때 `IllegalArgumentException`을 발생시킨다.
- `checkNotNull`, `requireNotNull` 로 `null` 체크를 할 수 있으며 이후 `null`이 아니라고 가정한다. 따라서 스마트 캐스트를 사용할 수 있다.

check 예시

```kotlin
fun viewReview(reviewId: Long) {
    val review = reviewRepository.findById(reviewId)
    check(review.isPublic()) { "공개된 리뷰가 아닙니다." }
    review.addViewCount()
    return review
}
```

require 예시

```kotlin
fun validateReviewModifyForm(reviewModifyRequest: ReviewModifyForm) {
    val review = reviewRepository.findById(reviewModifyRequest.reviewId)
    
    require(reviewModifyRequest.content.isNotBlank() && reviewModifyRequest.content.length < MAX_CONTENT_LENGTH) {
        "리뷰 내용은 공백이거나 1000자를 초과하면 안됩니다."
    }
    review.modify(content = reviewModifyRequest.content)

    // 생략
}
```

# 이펙티브 코틀린 아이템5 - 예외를 활용해 코드에 제한을 걸어라

코드의 동작에 제한을 거는 방법

- require: argument를 제한할 수 있다.
- check: 상태와 관련된 동작을 제한할 수 있다.
- assert: 어떤 것이 true인지 확인할 수 있다. assert 테스트 모드에서만 작동한다.
- return 또는 throw와 함께 활용하는 Elvis 연산자

## 장점

- 제한을 걸면 문서를 읽지 않은 개발자도 문제를 확인할 수 있다.
- 문제가 있을 경우 함수가 예상하지 못한 동작을 하지 않고 예외를 던진다. 예상하지 못한 동작을 하는 것은 예외를 던지는 것보다 굉장히 위험하며 상태를 관리하는 것이 힘들다. 이러한 제한으로 인해 문제를 놓치지 않고 코드가 더 안정적으로 작동한다.
- 코드가 어느 정도 자체적으로 검사해서 단위 테스트를 줄일 수 있다.
- 스마트 캐스트 기능을 활용할 수 있게 되므로 타입 변환을 적게 할 수 있다.

## Argument

- 인자로 받은 값의 유효성을 검사하는 로직으로는 `require()` 함수를 사용한다. 제한을 확인하고 만족시키지 못할 경우 `IllegalArgumentException`을 발생시킨다.
- 조건을 만족하지 못할 때 발생시키므로 코드를 사용하는 사람이 알 수 있다. 또한 이 내용은 문서에도 포함이 되어야 한다.
- 예시
    - 숫자를 인자로 받아서 계산할 때 숫자는 양의 정수여야 할 때
    - 좌표를 인자로 받아서 클러스터를 찾을 때 비어있지 않은 좌표 목록이 필요할 때
    - 이메일 주소를 입력받을 때 값이 입력되어있는지 이메일 형식이 올바른지 확인할 때

## 상태

- 어떤 구체적인 조건을 만족할 때만 함수를 사용할 수 있게 해야할 때 `check()` 함수를 사용한다.
- 지정된 예측을 만족하지 못할 때 `IllegalStateException`을 `throw` 한다. 상태가 올바른지 확인할 때 사용한다.
- 사용자가 규약을 어기고 사용하면 안 되는 곳에서 함수를 호출하고 있다고 의심될 때 한다.
- 예시
    - 어떤 객체가 미리 초기화 되어있어야만 처리를 하게 하고 싶은 함수
    - 사용자가 로그인했을 때만 처리하게 하고 싶은 함수
    - 객체를 사용할 수 있는 시점에 사용하고 싶은 함수

## Assert 계열 함수 사용

- assert 계열 함수를 사용하면 모든 상황에 대해 테스트할 수 있다.
- 이 조건은 현재 코틀린/JVM에서만 활성화되며 -ea JVM 옵션을 활성화해야 확인할 수 있다.
- 프로덕션 환경에는 예외가 발생하지 않고 테스트할 때만 활성화할 수 있다.
- 만약 심각한 결과를 초래할 수 있는 경우에는 check를 사용이 좋다.

## Nullability와 스마트 캐스팅

- require와 check 블록으로 어떤 조건을 확인해서 true가 나왔다면 해당 조건은 이후로도 true일 거라고 가정한다.
- `requireNotNull`, `checkNotNull`을 활용해도 좋다. 둘 다 스마트 캐스트를 지원하므로 변수를 ‘언팩(unpack)’하는 용도로 활용할 수 있다.
- nullability를 목적으로 Elvis 연산자를 활용하는 경우가 많다.

# Reference

[check - Kotlin Programming Language](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/check.html)

[require - Kotlin Programming Language](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/require.html)

[Using require and check Functions in Kotlin](https://hugomartins.io/essays/2021/02/using-require-and-check-in-kotlin/)

[이펙티브 코틀린](https://book.naver.com/bookdb/book_detail.nhn?bid=21424027)
