# 💙 var, let, const 차이
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F9f0Go%2FbtrLihCx9Ya%2F33QhKf6UeIrjF1oF2nrkvK%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbqxe4R%2FbtrLhhDexsw%2Fy1rdKECSKEQ5gRlsMXL5KK%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcHKorD%2FbtrLiqTDItj%2F8K61QjBqaLEeICOUXrWSa1%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Feizw9y%2FbtrLhfSZvec%2FYFtzZ8GV9u17n67NyKQ4zk%2Fimg.png)
# 💙함수선언형과 함수표현식의 차이
1. 함수 선언형
    ```
    function 함수명() { 구현 로직 };
    ```
    호이스팅에 영향 받음 <br>
2. 함수 표현형
    ```
    var 함수명 = function () { 구현 로직 };
    ```
    호이스팅에 영향 받지 않음 - 호이스팅 시 오류 발생 <br>
    콜백으로 사용 가능 (다른 함수의 인자로 넘길 수 있음)<br>
    클로저로 사용 가능<br>
    ```
    // 함수가 종료돼도, 렉시컬 스코프의 index와 같은 정보를 유지
    // index를 인자로 외부 함수에 전달하여 해당 값을 내부 함수에 전달할 수 있도록하는 것
    var list = ['item1', 'item2', 'item3']
    var i
    var doSomethingHandler = function (itemIndex) {
            return function doSomething(evt) {
                // 클로저가 생성되어, itemIndex를 인자로 참조 할 수 있게 된다.
                console.log(list[itemIndex]);
            };
        };

    for (i = 0; i < list.length; i += 1) {
        list[i].onclick = doSomethingHandler(i);
    }
    ```
# 💙 호이스팅
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdUmpU9%2FbtrLhhDeyCL%2FyWgvhNYjN1OZgBKT5VicVK%2Fimg.png)

# 💙 데이터 형변환

# 💙 얖은 복사와 깊은 복사 차이
1. 얕은 복사 <br>
원본 프로퍼티 값이 참조형인 경우<br>
주소 값만 복사하여<br>
원본과 동일한 참조형 데이터 주소 가르침 <br>
-> 사본과 원본의 변화 공유해 사이드 이펙트 발생<br>
2. 깊은 복사<br>
원본 프로터피 값이 참조형인 경우<br>
이와 동일한 객체 새로 생성하고 이 참조형 데이터 주소를 저장함<br>
-> 원본과 독립적임


# 💙 데이터 타입과 불변성
1. 데이터 타입 <br>
    (1) 원시 타입 

        number, string, boolean 
        null (객체 빈 값), undefined (선언 O, 값 없음) 
        symbol 
    (2) 객체 타입 

        object

2. 데이터 타입과 불변성 <br>
(1) 원시 타입의 불변성 <br>
    * 새로운 값 재할당 가능
    * 이미 생성된 원시값 변경 불가능  <br>

    (2) 객체 타입의 가변성

    * 내부 프로퍼티 변경 시 객체 참조하는 다른 값도 변경 반영됨

3. 불변성의 필요성 <br>
    원본 데이터 보존이 중요한 경우 존재함 <br>
    변경시 이에 대한 추적이 어려움

4. 상수와 불변 차이 <br>
    상수 : 변수의 값에 다른 값 재할당 불가능 <br>
    불변 : 메모리 내 데이터 변경 불가능 <br>

5. 객체 불변성 지키기 <br>
    spread 문법 사용 <br>
    array.concate() 함수 사용 <br>
    immer 라이브러리 사용 <br>

# 💙 클로저
1. 정의 c
함수와 그 함수가 선언된 렉시컬 환경의 조합
2. 의의 <br>
반환된 내부 함수가 <br>
자신이 선언되었던 렉시컬 환경인 스코프를 기억해 <br>
해당 스코프 밖에서 호출되어도 <br>
선언된 렉시컬 환경에 접근 가능한 함수 <br>
3. 활용 <br>
상태 유지 <br>
정보 은닉 <br>
전역 변수 사용 억제 (자신이 생성된 렉시컬 환경을 기억하기 때문) <br>
4. 예제 코드 분석
    ```
    function outerFunc(){ // 외부 함수
        var x = 10; // outerFunc의 지역 변수
        function innerFunc(){ // 내부 함수
            console.log(x);
        }
        return innerFunc;

    }

    var closure = outerFunc(); 
    closure(); // 10 출력됨 // 외부 함수 밖
    ```

    (1) `outerFunc`이 호출되며 `innerFunc`을 반환해 변수 `closure`에 할당함  <br>
    (2) `outerFunc`은 실행 컨텍스트에서 제거됨 <br>
    (2) `closure()` 실행 시, 실행 컨텍스트에서 제거된 `outerFunc`의 `지역변수 x`의 값이 콘솔에 출력됨 <br>

# 💙 실행 컨텍스트와 렉시컬 환경
1. 실행 컨텍스트 정의 <br>
코드 실행에 필요한 환경(조건, 상태) 제공하는 객체

2. 실행 컨텍스트 환경 구성 <br>
    variable environment <br>
    lexical environment <br>
    thisbinding <br>

3. variable environment <br>
    선언 시점의 lexical environment의 스냅샷 <br> 
    현재 컨텍스트 내 식별자/환경 정보 담김 <br>
    변경 사항 반영 X <br>

4. lexical environment <br>
    variable environment와 동일함 <br>
    변경 사항 반영 O <br>

5. thisbinding <br>
    this 식별자가 바라봐야 할 대상 객체 <br>

6. 브라우저가 스크립트 로딩하면 <br>
    (1) 전역 컨텍스트 생성되고 콜스택에 쌓임 <br>
    (2) 함수 호출마다 함수 실행 컨텍스트 생성되며 콜스택에 쌓임 <br>

7. lexical environment 객체 <br>
    (1) 환경 레코드 

        * 지역 변수 : 블록 스코프 따름 : 렉시컬 환경 내 환경 레코드로 관리  
        * 함수 호출 : 실행 O (선언 X)시 렉시컬 환경 구성됨  <br>
            -> 변수에 함수 할당해 변수를 통한 호출 : 한 개의 렉시컬 환경 생성 후 계속 사용  <br>
            -> 변수에 함수 할당하지 않고 매번 직접 호출 : 매번 고유한 렉시컬 환경 생성 <br>

    (2) 외부 렉시컬 환경에 대한 참조 

        현재 환경 레코드에서 변수 찾고 없는 경우,  <br>
        외부 (상위) 렉시컬 환경 참조하며 찾아보는 **중첩 스코프** 발생 <br>
        값을 찾았거나 외부 렉시컬 환경 참조가 null인 경우 중지됨


# 💙 프로토타입이란?
1. 객체 생성 시, 생성된 객체의 부모가 되는 객체의 원형  <br>
2. 프로토타입 기반으로 상속을 구현해 코드 재사용/불필요한 중복 제거  <br>
3. 부모 객체인 프로토타입의 property, method 공유해 사용 가능  <br>
    생성자 함수가 생성하는 인스턴스가 공통적으로 사용할 property와 method를 프로토타입에 미리 구현함
4. 자신의 프로토타입 접근법
    ```
    instance.__proto__
    Object.getPrototypeof(instance)
    ```
5. 프로토타입 체이닝  <br>
---사진추가하기--- <br>
객체의 property 접근하려고 할 때, 해당 property가 없는 경우  <br>
__proto__ 접근자 property가 가르키는 곳을 따라  <br>
부모의 프로토타입의 property를 순차적으로 검색  <br>

# 💙 `requestAnimationFrame`이란?
1. 애니메이션 최적화
2. 역할 <br>
(1) 브라우저에게 수행하기를 원하는 애니메이션 알림 <br>
(2) 다음 리페인트 진행 전 해당 에니메이션 업데이트 함수 호출
3. 실행 주기 <BR>
기본적 : 1초에 60번 함수 실행됨 <BR>
모니터 주사율에 맞춘 실행 : 모니터 주사율 140FPS라면 1초에 140번 함수 실행 <br>
4. `setInterval()`과 비교 <br>
공통점 : 1초에 60번 동작 가능 <br>
차이점 :  `requestAnimationFrame`은 애니메이션 완료 시기에 따른 함수 실행 시점 조절함, `setInterval()`은 직접 throttle 걸어줘야함


# 💙 자바스크립트 성능 최적화 위해 적용한 것은?
1. DOM 접근 최소화 <br>
DOM에 접근하는 경우 변수에 할당하고 변수를 통해서 사용 <br>
Object인 DOM의 프로토타입 체인으로 인한 시간 소요 가능<br>
    ```
    let dom =  document.getElementById("container");
    // 변수에 할당해 사용
    ```
2. Repaint, Reflow 최소화 <br>
3. import 부분적 호출 사용하기 <br>
    ```
    import lib from "library";
    // 전체가 필요한 경우 사용, 필요없는 js 파일 로드 가능성 존재
    import {getLib} from "library";
    // 부분적으로 불러오는 경우 사용, 빌드 시 파일의 크기 줄어듦
    ```
4. `requestAnimationFrame` 사용




# 💙 이벤트

1. 이벤트 등록법<br>
    `addEventListener()` 이용해 사용자 행동에 따라 웹페이지가 동적으로 기능하게 함
    
2. 이벤트 버블링과 이벤트 캡처링 정의 <br>
    브라우저가 이벤트를 감지하는 방식 2가지<br>
    (1) 이벤트 버블링<br>
        이벤트 발생 지점인 하위 요소에서 상위 요소로 이벤트가 전달됨<br>
        
    (2) 이벤트 캡처링<br>
        상위 요소에서 하위 요소로 이벤트 발생 지점을 찾아 내려감<br>

        
        각 <div> 태그의 class 명을 console.log 출력 이벤트 등록한 경우
        <body>
            <div class = "1">
                <div class = "2">
                    <div class = "3">
                    </div>
                </div>
            </div>
        </body>
        

3. 이벤트 버블링 예시 및 원리 <br>
    (1) 설계<br>
         각 `<div>` 태그의 class 명을 console.log 출력 이벤트 등록한 경우<br>
    (2) 최하위 class = “3” 클릭 시 출력 결과<br>
        3 → 2 → 1<br>
    (3) 동작 원리<br>
        특정 화면요소에서 이벤트 발생 시 브라우저가 해당 이벤트를 최상단 요소까지 전파함<br>
    (4) 주의  <br>
        모든 `<div>` 태그에 출력 이벤트를 등록하여 확인 가능했음<br>
        특정 `<div>`에만 이벤트 등록 시 확인 불가능함<br>
        
4. 이벤트 캡처링 예시 및 원리
    (1) 설계<br>
        모든 `<div>` 태그에 class 명을 console.log 출력 이벤트 등록하고 옵션객체의 capture를 true로 지정함 <br>
        
    (2) 최하위 class = “3” 클릭 시 출력 결과<br>
        1 → 2 → 3<br>
        
    (3) 동작원리<br>
        capture 옵션을 통해 이벤트 발생 요소의 최상위 요소에서 하위 요소로 이벤트 전파됨 <br>
        
5. 이벤트 버블링 막는법<br>
    (1) `stopPropagation` 사용<br>
        원하는 특정 화면요소의 이벤트만 신경 쓰고 싶은 경우<br>
        
    (2) 이벤트 버블링에서 사용한 경우<br>
        직접 이벤트 발생한 하위 요소만 이벤트 발생함 → 상위 요소로 전파 X<br>
        
    (3) 이벤트 캡처링에서 사용한 경우 <br>
        직접 이벤트 발생한 하위 요소의 최상위 요소에서만 이벤트 발생 → 하위 요소로 전파 X<br>
        
6. 자바스크립트 이벤트 설계 방식<br>
    (1) 이벤트 위임(`Event Delegation`) 사용<br>
    (2) 하위 요소 각각에 이벤트 등록하지 않고 상위 요소에서 하위 요소의 이벤트 제어함<br>
        최상위에 이벤트 리스너 등록하고 하위에서 발생한 이벤트 감지하도록 함<br>
        
    ```
        <ul class = "itemList">
            <li>
                <input/>
                <label/>
            </li>
            <li>
                <input/>
                <label/>
            </li>
        </ul>
    ```
    
    (1) `<input>` 태그에 각 각 이벤트 등록시 발생하는 문제점<br>
        
        추후에 `li>input` 요소가 추가될 때마다 매번 이벤트를 등록해야함
        
    (2) `<input>`의 상위 요소인 `<ul>` 태그에 이벤트 리스너 등록한 경우 이점
    
        `li>input` 요소 추가 여부와 상관없이 이벤트 버블링을 이용해 상위 요소인 `<ul>` 에서 하위 요소 `<input>` 태그의 이벤트 감지<br>
