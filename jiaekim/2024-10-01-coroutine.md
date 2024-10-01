# 코루틴(coroutine)이란?

코루틴 이야기는 많이 들었지만 코루틴이 뭘까?

사실 처음 코틀린에서 사용하는 비동기 서비스인가? 해서 코루틴(koroutine)인줄 알았다. 그런데 알고보니 협력 루틴이라는 의미로 (co-routine)이었다.

[위키피디아에 코루틴](https://en.wikipedia.org/wiki/Coroutine)을 검색해보면 아래와 같이 나온다.

- 비선점형 멀티태스킹(non-preemptive multi-tasking)을 수행하는 일반화환 서브루틴(subroutine)
- 코루틴의 실행은 일시 중단(suspend)하고 재개(resume)할 수 있는 여러 진입 지점(entry point)를 허용한다

하지만 읽어보면 너무 어려워서 이게 무슨말인가 싶다.

하나씩 풀어보자. 일단 한번에 이게 뭐지 싶은 단어는 ‘비선점형 멀티태스킹’과 ‘서브루틴’이 있다.

- **비선점형 멀티태스킹**
    - `멀티태스킹`은 여러 자업을 동시에 수행하는 것처럼 보이거나 실제로 동시에 수행하는 것이다.
    - `비선점형` 은 멀티태스킹의 각 작업의 실행을 운영체제가 강제로 일시 중단시키고 다른 참여자를 실행하게 만들 수 없다는 뜻이다. 즉, 각 작업의 참여자들이 서로 자발적으로 협력해야만 ‘비선점형’ 멀티태스킹을 작동할 수 있다.
- **서브루틴**
    - 서브루틴은 여러 명령어를 모아 이름을 부여해서 반복 호출할 수 있게 정의한 프로그램의 구성요소이다.
    - 즉, 다른말로 `함수`다.
    - 어떤 서브루틴에 진입하는 방법은 오직 한가지(함수의 호출)이고, 나오는 방법은 여러 return이 있을 수 있다. 서브루틴이 실행될 때 활성 레코드가 스택에 할당되어 로컬변수 등을 초기화하고, 서브루틴을 반환할 때 활성 레코드가 스택에서 사라지며 실행 중인 상태를 잃어버린다.

즉, 코루틴은 `'서로 협력해서 실행을 주고받으면서 작동’하는 여러 ‘서브루틴(함수)'`를 말한다.

![image.png](https://github.com/user-attachments/assets/7beba9a8-1bc0-43fb-bf51-ad64a0e06eb4)

서브루틴은 일반적인 함수와 같다.

반면에 코루틴은 루틴 A가 실행되다 루틴 B를 실행하면 B를 실행하다가 실행을 A에게 양보(yield)한다. 그리고 코루틴 호출 다음부분부터 실행을 계속 하다가 또 코루틴 B를 호출한다. 이 때 루틴 B의 처음부분부터 시작하는게 아니라 이전에 yield로 실행을 양보했던 지점부터 실행을 이어간다.

# Kotlin 코루틴 주요 개념

## 1. suspend(일시중지)

- suspend
    - 스레드를 차단하지 않고 실행을 실시 중지하고 나중에 다시 시작할 수 있다.
    - 일시중단 함수는 다른 일시중단 함수나 코루틴 내에서만 호출될 수있다.

```jsx
suspend fun doSomething() {
    // Some long-running operation
}
```

## 2. ‘launch’

- launch
    - 결과를 반환하지 않는 코루틴을 시작하는데 사용된다.

```jsx
GlobalScope.launch {
    // Code that runs in the coroutine
}
```

## 3. async

- async & await
    - 코루틴이 결과를 반환하기를 원할 때사용
    - async가 코드 블록을 비동기로 실행하고
    - await는 코루틴이 결과 값을 내놓을 때까지 기다렸다가 결과 값을 얻어냄

    ```jsx
    val deferred = GlobalScope.async {
        // Perform some work and return a result
        42
    }
    val result = deferred.await()
    ```


## 4. runBlocking

- runBlocking
    - 코루틴 실행이 끝날 때까지 현재 스레드를 블록시키는 함수
    - 메인함수에서 GlobalScope.launch가 만들어낸 코루틴이 서로 다른 스레드에서 도니 main이 코루틴보다 먼저 끝나는 것을 방지

```jsx
runBlocking {
    launch {
        // This coroutine is part of the runBlocking scope
    }
}
```

## 참고자료

- 코틀린 인 액션 (부록 E 코루틴과 Async/Await)
- https://en.wikipedia.org/wiki/Coroutine
- https://kotlinlang.org/docs/coroutines-guide.html