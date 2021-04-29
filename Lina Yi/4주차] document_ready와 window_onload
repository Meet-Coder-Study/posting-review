### 웹 브라우저의 HTML문서 렌더링 과정


#### 1. 불러오기(Loading)

- 불러오기는 HTTP 모듈 또는 파일시스템으로 전달 받은 리소스 스트림(Resource Stream)을 읽는 과정.
- 로더(Loader)가 이 역할을 맡고 있다.
- 로더는 단순히 읽는 것이 아니라, 이미 데이터를 읽었는지도 확인하고,   
  팝업창을 열지 말지, 또는 파일을 다운로드 받을 지를 결정한다.

#### 2. 파싱(Parsing)
- 파싱은 DOM(Document Object Model) 트리를 만드는 과정.
- 웹 엔진이 가지고 있는 HTML/XML 파서가 문서를 파싱해서 DOM Tree를 만든다.
- DOM Tree : 내용을 저장하는 트리로 javascript에서 접근하는 DOM객체를 쓸 때 이용됨.

#### 3. 렌더링 트리 만들기(Rendering Tree)
- 렌더링 트리 : DOM Tree와는 별도로 그리기 위한 트리가 만들어져야 하는데, 그것이 렌더링 트리다.
(그릴 때 필요없는 head, title, body 태그등이 없음
  + display:none; 처럼 DOM에는 있지만 화면에서는 걸러내야할 것들이 걸러내진 트리)

#### CSS 결정
- CSS는 선택자에 따라서 적용되는 태그가 다르기 때문에 
  모든 CSS 스타일을 분석해 태그에 스타일 규칙이 적용되게 결정한다.

#### 레이아웃(Layout)
- 렌더링 트리에서 위치나 크기를 가지고 있지 않기 때문에 
 객체들에게 위치와 크기를 정해주는 과정을 레이아웃이라고 한다.

#### 그리기(Painting)
- 렌더링 트리를 탐색하면서 페이지를 그려나간다.


### $(document).ready vs $(window).onolad

- $(document).ready 의 호출 시점 : 1~2번 과정이 완료되어 DOM Tree 생성이 완료된 후 호출
  $(window).onolad 의 호출 시점 : 모든 과정이 완료되어, 웹 페이지가 다 구성된 후 호출

- 한 페이지에 두 함수가 다 있다면 실행 우선순위 (.ready() → .onload() 순으로 실행)



### $(document).ready() 

```
$(document).ready(function() { 
  // DOM이 로드되었을 때 실행되어야 하는 코드 
  });
```

- jQuery에서,  document객체의 ready 이벤트. 

- 외부 리소스, 이미지와는 상관 없이 브라우저가 DOM 트리를 생성한 직후 실행된다. 

- 문서 객체모델( Document Object Model ) 즉 HTML 소스가 전부 로딩되었을 때 $(document).ready() 한에 위치한 코드가 실행 된다. 

- $(document).ready() 는, 해당 구문의 안에 있는 코드가 실행되기 전에, **페이지를 구성하는 DOM 객체를 로딩하는걸 보장**해준다. 

- 따라서, DOM 객체를 다루는 코드를 사용한다면 반드시 이 구문 안에 해당 코드를 위치시켜야 제대로 작동함을 보장한다.

- window.load()보다 더 빠르게 실행된다.
- 

예시)
```
$('#id_file').change(function() { // 파일 선택  input에 변화가 있으면
        console.log("체인지");
});
```
을, document.ready 밖에 적으면 file input에 파일을 넣어도, 이벤트 인식이 안 된다.

해당 함수를 document.ready 안에 넣으면 이벤트 인식이 된다.

```
$(document).ready(function(){

    $('#id_file').change(function() { // 파일 선택  input에 변화가 있으면
            console.log("체인지");
    });
```



**Q. 그러면 모든 DOM element에 대한 함수를 document.ready 안에 적어야 하나? document.ready 바깥으로 뺄 수 있는 이벤트/함수는 어떤 경우인가?**
-> ? 


### $(window).load()

- 화면에 필요한 모든 요소(css, js, image, iframe ...) 들이 웹 브라우저 메모리에 모두 올려진 다음 실행됨.

- 이미지 관련 요소가 모두 욜러진 다음의 애니매이션 등에 적합하다. 

- 전체 페이지의 모든 외부 리소스, 이미지가 브라우저에 불려온 후 작동하므로, 이미지가 안 뜨는 등 딜레이가 생길 때는 그만큼의 시간을 기다려야 한다. 


### window > document

- document는 window의 자식 객체다.
 (window의 자식객체: document, self, navigator, screen, forms, history, location etc..)

- document는 html 요소, 속성에 접근할 때 사용하는 객체

참고:https://twinsoul.tistory.com/74
https://www.phpschool.com/gnuboard4/bbs/board.php?bo_table=qna_html&wr_id=248685
https://diaryofgreen.tistory.com/96
https://hahahoho5915.tistory.com/28
