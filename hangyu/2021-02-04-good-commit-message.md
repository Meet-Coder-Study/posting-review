# [Good Commit Message] 좋은 커밋 메시지를 써야 하는 이유는 무엇일까? 

협업하는 개발자의 필수역량 중에 하나가 Git을 잘 사용하는 것인 세상이 되었다

Git을 쓰지 않는 회사를 찾기 힘들게 된 것 같다. 물론 모든 회사가 Git 을 쓰지는 않겠지만 적어도 Git 보다 좋은 평을 듣는 Source Vesion Control 프로그램은 듣지 못한 것 같다 

그리고 협업 툴이라는 것은 기본적으로 무엇이 되었든 공통 규칙 즉 Convension 이라는 것이 필요하다. 협업을 한다는 것은 의사소통비용이 소비되기 때문에 사람과 사람간에 의사소통을 잘하는 것으로도 일을 잘한다는 말을 들을 수 있다고 본다 

서두는 여기까지 하고 어떻게 하면 Good Commit Message 를 작성할 수 있는지 그리고 왜 Good Message 를 쓸 줄 알아야 하는지 그 이유와 결론을 내보자 

Good Commit Message를 작성하는 방법이라는 물음으로 아래 블로그글을 참고 해봤다 
* https://meetup.toast.com/posts/106 
* https://blog.ull.im/engineering/2019/03/10/logs-on-git.html

두 블로그 모두 공통의 영문 블로그를 참고하고 있다 (https://chris.beams.io/posts/git-commit/) 

일단 고려사항을 정리하면 
1. 언어적 특성 
   - 영어 or 한글 
2. 문장의 구성
   - 글을 남기는 방법 : 자세하게가 아닌 간결하게 작성하는 것은 한영 구분이 없다 (오픈소스는 전세계에서 사용하는 도구) 
   - 기본적으로 형태 : 명령문의 형태를 가지고 있다 
  
### 개발자가 왜 글쓰기를 고민해야 하지? 라는 물음을 한다면 일단 좋은 Git Commit을 써야 하는 이유부터 생각해 보자 
* Commit Log 의 가독성을 위해서 
* 더 나은 협업과 리뷰 프로세스를 가진 팀이 되기 위해서 
* 더 쉬운 코드 유지보수를 하기 위해 히스토리 관리를 하기 위해서 

이런저런 이유를 나열 하면 끝이 없을 것 같고 크게 가독성 / 조직 화합 / 유지보수성 이 3가지를 생각했다

즉, 내가 한 일을 잘 나타내기 위해 작성하는 짧은 글쓰기로서 필요하다고 주장한다 

### 위 블로그의 내용의 기반이 영어로 되어있고 내용을 읽어보면 내가 딱히 수정을 하거나 더 요약할 필요성을 느끼지 못해서 영어가 아닌 한글로 Commit Log를 남기려면 어떻게 해야할까? 라는 질문으로 수정해본다

### 먼저 좋은 Git Commit Messge를 위한 보편적인 노력으로 나열해 보면 
1. 제목과 본문을 한 줄 띄워 분리하기
2. 제목은 글 기준 25자 이내로 
3. 제목 끝에 . 금지 
4. 제목은 명령조로 
5. 본문은 36자 마다 줄 바꾸기 
6. 본문은 어떻게 보다 무엇을, 왜에 맞춰 작성하기 

## 1. 제목과 본문을 한 줄 띄워 분리하기 
- 꿀팁과 같은 내용으로 제목 + 빈줄 + 설명문으로 구성하면 log 내용을 한줄로 보기로 출력하면 제목만 볼 수 있어서 좋다. 만약 줄 바꿈이 되지 않으면 설명문까지 모두 한줄에 포함되어 나오기 때문에 가독성이 저하된다
- git log --oneline / git shortlog
  - 이 명령어로 보면 가독성 차이를 알 수 있다 

## 2. 제목은 글 기준 25자 이내로 
- 영문기준 50자로 가이드 되어 있어 한글 기준으로 절반으로 줄이면 좋을 것 같다 

## 3. 제목 끝에 . 금지 
- 문법적인 접근으로 제목에는 보통 점을 찍지 않는다 

## 4. 제목은 명령조로 
- 영어에서 가져와서 첫 단어를 동사원형으로 쓰기 위함이다 
- 명령문보다는 설명문의 느낌으로 하자 
  - "인증 메소드 고쳐라" 가 아닌 "인증 메소드 고쳤다" 의 느낌 
  - "인증 메소드 수정" 으로 한글에서는 문장보다 구문이 낫다 

## 5. 본문은 36자 마다 줄 바꾸기
- git 은 자동으로 메시지 내용은 줄 바꿈을 해주지 않는다 
- 영문기준 72자 이기 때문에 한글로는 절반인 36자로 잡았다 
- 가독성을 위해 끊이 쓰기를 하는 것이다 

## 6. 본문은 어떻게 보다 무엇을, 왜에 맞춰 작성하기 
- 이 부분은 내용 전달에 대한 부분이라 글쓰기를 하는 방법으로 보인다 
- 무엇을? 왜? 와 같은 부분은 결론을에 대한 접근 방법이고 어떻게? 는 과정에 대한 접근이라면 간결한 의미 전달을 위해 결론 부터 쓰는 접근으로 이해된다 

추가로 영어일 경우 문법적으로 아래를 권장한다고 한다 

1. 동명사 보다는 명사를 사용
   - ing 를 붙이기 보다는 순수 명사 그대로 쓰기 
2. 부정문 Don't 를 사용하기 
   - 명령조 어투에서 반대인 부정 명령구를 써서 부연 설명없이 간단하게 부정하기 
3. 오타 수정과 같은 경우 correct miss spelled 가 아닌 그냥 Fix typo로 쓰기 
   - 사소한 것에 대해 구구절절 설명할 필요는 없다

## 이제 좋은 Commit Message를 위한 영어 동사를 한글로 변환한다면 어떻게 접근하고 사용해야 될까? 

일단 영어 방법의 경우 위의 블로그 설명대로 동사로 시작하는 convention을 적용해도 전혀 손색이 없어 보인다. 한글일 때도 한번 동일하게 접근해보자 

ex) Fix 를 사용하기 - 이 경우 올바르지 않은 동작을 고친 경우에 사용하게 된다 
   - Fix 회원 가입 
   - 고침 회원가입
   - 수정 회원 가입 
   - 회원 가입 수정  

위의 예시는 Fix를 나타내고 싶은데 한글과 어울림이 애매한 어투가 느껴진다 

일단 4번의 경우가 가장 일반적인 한글 사용법으로 보인다. 즉 명령조로 시작하니 한글 구조에서 어색함이 느껴진다. 그렇다고 평서문의 느낌으로 단순한 구문인 회원 가입 수정이라고 목적어 + 서술어로 표현하니 이 또한 동사원형 표현법과 비교해 어색함이 느껴진다

영어의 동서원형이 제목과 같은 키워드 성격이 있어서 처음부터 눈에 들어오는 부분이 있어 생각의 연결성을 이어주었으나 한글은 실제 행위의 서술어가 마지막에 있어 문장 전체를 보아야 정확히 의미 전달이 종료된다 

영어의 동사원형을 말머리에 썼을 때 어떻게 눈에 들어오는 지 나열해보고 그 통일성 있는 규칙에서 차이를 발견해 보자 

```
Make config object read-only
make 'floating patch' message informational
Make values optional in ViewPropTypes
make read() be called indefinitely if the user wants so
make IsolateData store ArrayBufferAllocator
```

이런 형태를 보면 차이가 느껴지는가? 실제 내용을 떠나서 막연히 뭔가 만들었구나 하고 생각이 시작 된다. 조금만 더 명분을 찾아 보자 

언어적인 Convention을 만드려는 이유는 무엇인가? 

주관적인 생각이지만 의사소통 비용을 줄이기 위함이라고 생각한다. 사람간의 대화에 있어 의사소통 비용이라는 것은 때로는 피로감을 만들 수 있다.

즉, 이번에 이 얘기를 했으니 다음에 또 반복해서 하지 말자식의 약속을 암묵적으로 하게되면 적어도 까먹지 않게 일정한 패턴을 가지거나 암기하기 쉬운 구조가 있어야 한다 (방정식의 풀이를 가르쳐 줄 때 "근의 공식"을 써라 이런 대화도 비슷한 이치) 

아래와 같은 형태는 어떠한가? 

```
[수정] 회원 가입의 버그를 수정
```

명령문처럼 어떤 작업이었는지 한 눈에 읽히고자 했고 어설픈 영어 번역을 할 필요없이 국어적인 주어 / 목적어 / 서술어로 제목 키워드를 보충 설명이 되었다고 보이는가? 

동사원형이 아닌 명사로 행위의 목적이 무엇인지 표현했다

간단하면서 한 줄로 명확하게 의미 전달을 하고자 한다면 그리고 제목과 본문 중에 더 중요한 내용이 제목이라면 블로그의 글쓴이가 작문이 아니라 패턴으로 접근해야 한다는 말이 공감이 되었다 

```
 "결국 커밋 로그 메시지의 작성은 작문이 아니라 패턴으로 접근해야 합니다. 자신의 커밋이 가진 특징을 패턴에 대입시켜 단어들을 뽑아내는 것이죠. 작문의 결과로 보면 너무 단순해서 부족해 보일지 몰라도, 여러 사람들에게 쉽게 읽히고 쉽게 이해되도록 하기에는 패턴화된 단순한 문장이 훨씬 낫습니다"
출처: <https://blog.ull.im/engineering/2019/03/10/logs-on-git.html>
 ```

작성한 당사자가 아닌 제 3자가 이해할 수 있는 문장을 만드는 것 자체가 쉬운일이 아닌 것이고 그것이 필요한 이유는 의사소통 비용을 줄이기 위함이라면 최선의 단어를 쓰는 것과 최선의 문장 혹은 문단을 고민해서 남에게 보여주는 부분은 코딩을 잘해서 보여주기 위함과 비슷한 이치를 가진다 

좋은 Message를 작성해서 내가 한 일에 대해 의미 전달을 잘 하는 것으로 내가 작성한 변수 혹은 함수나 인터페이스를 통해 더 발전된 협업과 대화를 하고자 함이기 때문에 같이 프로그래밍 일을 하는 사람의 기본 소양으로도 부합된다  

다만 차이가 있다면 컴퓨터 언어적 이쁜 코드를 작성하는 것이 아니라 함축적이지만 이해하기 쉬운 패턴으로 의미를 전달하는 방법이 중요한 차이점이라면 그 차이가 이 글의 질문이었던 Good Commit Message 에 대한 답이 되었을까?

```
질문 : 좋은 커밋 메시지는 무엇인가요? 
대답 : 함축적이지만 이해하기 쉬운 패턴으로 만들어진 문장 or 문단 
```

마지막으로 한글과 영어로 구분한 예시 표로 마무리한다

아래의 내용을 보면 중복되는 의미의 단어들도 많이 보인다. 해당 부분은 센스있게 자주 쓰이는 단어를 쓰면 되겠다

|단어|한글|영어|뜻|
|:---:|:---|:---|:---|
|Fix|[고침] 통계 캐시 버그를 수정 <br /> [고침] 첫 로그 항목을 변경 <br /> [고침] 깨진 검색 경로를 고침|Fix stat cache <br /> Fix changelog entry <br /> Fix broken jsiexecutor search path | 보통 올바르지 않은 동작을 고친 경우에 사용합니다|
|Add|[추가] 에러 내용을 추가 <br /> [추가] ListView에 미사용 문구를 추가 | Add error description to Image onError callback <br /> Add displayName to ActivityIndicator <br /> Add deprecation notice to SwipeableListView | 코드나 테스트, 예제, 문서 등의 추가가 있을 때 사용합니다 |
|Remove|[삭제] 불필요한 문구 삭제<br />[삭제] 사용하지 않는 파일 삭제|Remove unnecessary italics from child_process.md<br />Remove useless additionnal blur call<br />Remove unneeded .gitignore entries<br />Remove unused variable<br />Remove duplicated buffer negative allocation test|코드의 삭제가 있을 때 사용합니다. ‘Clean’이나 ‘Eliminate’를 사용하기도 합니다. 보통 A 앞에 ‘unnecessary’, ‘useless’, ‘unneeded’, ‘unused’, ‘duplicated’가 붙는 경우가 많습니다|
|Use|[사용] message 전달에 가짜 Event를 사용<br />[사용] error 내용 전달에 객체 writer를 사용|Use fake MessageEvent for port.onmessage<br />Use object writer for thrown errors<br />Use ru_stime for system CPU calculation<br />Use relative path for SCRIPTDIR|특별히 무언가를 사용해 구현을 하는 경우입니다|
|Refactor|[개선] 쓰레드 관리 체게를 개선|Refactor tick objects prune function<br />Refactor thread life cycle management<br />Refactor QueryWrap lifetime management<br />Refactor argument validation<br />Refactor thread life cycle management<br />Refactor MockNativeMethods in Jest|전면 수정이 있을 때 사용합니다|
|Simplify|[단순화] 쓰지 않는 검사를 단순화 시킴<br />[단순화] GetCPUInfo 반복을 개선|Simplify code and remove obsolete checks<br />Simplify the setup of async hooks trace events<br />Simplify heap space iteration<br />Simplify TriggerNodeReport()<br />Simplify AliasedBuffer lifetime management<br />Simplify loop arithmetic in GetCPUInfo|복잡한 코드를 단순화 할 때 사용합니다. <br /> Refactor의 성격이 강하나 이보다는 약한 수정의 경우 이용하면 좋습니다|
|Update|[수정] acorn 의 버전을 수정|Update acorn to 6.1.0|개정이나 버전 업데이트가 있을 때 사용합니다. Fix와는 달리 Update는 잘못된 것을 바로잡는 것이 아니라는 점에 주의해야 합니다. 원래도 정상적으로 동작하고 있었지만, 수정, 추가, 보완을 한다는 개념입니다. 코드보다는 주로 문서나 리소스, 라이브러리등에 사용합니다|
|Improve|[향상] http/1의 호환성을 향상|Improve compatibility with http/1<br />Improve Unicode handling<br />Improve test coverage in perf_hooks<br />Improve validation of report output<br />Improve performance of test-crypto-timing-safe-equal-benchmarks<br />Improve color detection<br />Improve Android Network Security config<br />Improve Accessibility<br />Improve iOS's accessibilityLabel performance by up to 20%|향상이 있을 때 사용합니다. 호환성, 테스트 커버리지, 성능, 검증 기능, 접근성 등 다양한 것들이 목적이 될 수 있습니다|
|Make|[변경] 읽기 전용 설정의 속성을 변경|Make config object read-only<br />make 'floating patch' message informational<br />Make values optional in ViewPropTypes<br />make read() be called indefinitely if the user wants so<br />make IsolateData store ArrayBufferAllocator|주로 기존 동작의 변경을 명시합니다<br />새롭게 뭔가를 만들었을 때는 Make 대신, Add를 사용해야 합니다|
|Implement|[향상] 캐시를 사용해서 get data 속도를 향상|Implement requiresMainQueueSetup in RCTTVNavigationEventEmitter to satisfy Xcode warning<br />Implement an in-memory cache store to save parsed and validated documents and provide performance benefits for repeat executions of the same document|코드가 추가된 정도보다 더 주목할 만한 구현체를 완성시켰을 때 사용합니다|
|Revice|[문서수정] Readme.md 파일을 수정|Revise deprecation semverness info in Collaborator Guide|Update와 비슷하나 문서의 개정이 있을 때 주로 사용합니다|
|Correct|[타입변경] 회원 Id의 리턴 타입을 문자열에서 정수로 변경|Correct grammatical error in BUILDING.md<br />Correct parameters, return types in crypto.md<br />Correct styling of _GitHub_ in onboarding doc<br />Correct buffer changelog ordering<br />Correct async_hooks resource names|주로 문법의 오류나 타입의 변경, 이름 변경 등에 사용합니다|
|Ensure|[성능보장] 탐색 알고리즘의 복잡도를 nlogn을 보장<br />[기능보장] 에러를 던졌을 때 알람발생을 보장|Ensure quiet always takes precedence<br />Ensure cookies with illegal characters are not sent to okhttp<br />Ensure require.main for CJS top-level loads<br />Ensure Stream.pipeline re-throws errors without callback<br />Ensure options.flag defaults to 'r' in readFile|무엇이 확실하게 보장받는다는 것을 명시합니다. if 구문처럼 조건을 확실하게 주었을 때에도 사용 될 수 있습니다. ‘Make sure’도 같은 용도로 사용될 수 있습니다|
|Prevent|[방지] 회원 검색 로직에서 무한루프를 방지|Prevent multiple connection errors<br />Prevent constructing console methods<br />Prevent event loop blocking<br />Prevent a potential error in event handling if Object.prototype is extended.<br />Prevent an infinite loop when attempting to render portals with SSR.|특정한 처리를 못하게 막습니다|
|Avoid|[회피] 불필요한 밸리데이션 체크를 회피|Avoid flusing uninitialized traces<br />Avoid overrun on UCS-2 string write<br />Avoid race condition in OnHeaderCallback<br />Avoid memory leak on gc observer<br />Avoid materializing ArrayBuffer for creation|‘Prevent’는 못하게 막지만, ‘Avoid’는 회피합니다. if 구문으로 특정한 동작을 제외시키는 경우에도 사용 할 수 있습니다|
|Move|[이동] Member Package 의 위치를 Account로 이동|Move test-process-uptime to parallel<br />Move function from header to source file<br />Move async hooks trace events setup to pre_execution.js<br />move initialization of node-report into pre_execution.js|코드의 이동이 있을 때 사용합니다|
|Rename|[이름변경] Member 클래스 이름을 Members로 복수로 변경|Rename node-report to report<br />Rename location to trigger<br />Rename node-report suite to report|이름 변경이 있을 때 사용합니다|
|Allow|[허용] 서비스 레이어의 로깅을 필수로 하도록 허용|Allow the output filename to be a {Function}<br />Allow Node.js-like runtimes to identify as Node.js as well.<br />Allow passing parseOptions to ApolloServerBase constructor.<br />Allow an optional function to resolve the rootValue, passing the DocumentNode AST to determine the value.|Make와 비슷하지만, 허용을 표현할 때 사용합니다|
|Verify|[검증추가] 메모리 누수 방지를 위한 방어코드를 추가|Verify heap buffer allocations occur|검증 코드를 넣을 때 주로 사용합니다|
|Set|[속성변경] 회원 가입 상태 확인 배치 스케줄러의 시간을 12시간으로 변경|Set tls.DEFAULT_ECDH_CURVE to 'auto'|변수 값을 변경하는 등의 작은 수정에 주로 사용합니다|
|Pass|[전달] 회원가입 API 요청값을 응답값에도 재활용하도록 전달|Pass the response toolkit to the context function.|파라메터를 넘기는 처리에 주로 사용합니다|