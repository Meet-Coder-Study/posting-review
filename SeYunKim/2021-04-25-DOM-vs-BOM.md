# DOM(Document Object Model) VS BOM(Browser OBject Model)

## 📝 DOM(Document Object Model)

> 문서 객체 모델(Document Object Model)은 HTML, XML 문서의 프로그래밍 interface입니다. DOM은 문서의 구조화된 표현(structured representation)을 제공하며 프로그래밍 언어가 DOM 구조에 접근 할 수 있는 방법을 제공하여 문서 구조 및 스타일, 내용 등을 변경할 수 있게 도와줍니다.
- 간단하게 말하자면 프로그래밍 언어(예를 들어 JavaScript)가 구조에 접근할 수 있는 방법을 제공해 문서 구조나 스타일, 내용을 변경할 수 있게 도와주는 모델입니다.
- JavaScript는 어떤 작업을 할 수 있게 해주는 언어라고 하면 DOM은 그 작업이 일어나는 장소라고 생각하면 됩니다.
- DOM은 기본적으로 노드 트리로 표현이 됩니다.

### 이걸 왜 알아야 하는가?

- JavaScript를 이용해 HTML 데이터를 가져오고 싶다면?
- 웹 페이지의 데이터를 변경하고 싶다면?
- 인터렉티브한 웹을 만들고 싶다면?
- 즉, 정적 웹페이지가 아니라 동적인 기능이 있는 웹 페이지를 만들고 싶다면 문서를 조작할 수 있는 DOM에 대한 개념이 있어야 합니다.

### 언제 쓰이는가!?

- 예를들어 검색한다고 했을때, 검색어를 가져와야 할때 모든 문자열에서 검색어를 가져올수가 없기 때문에 해당 HTML 태그를 DOM으로 가져와 API를 이용해 검색을 할 수 있습니다.

### Data Type

![image](https://user-images.githubusercontent.com/53366407/115981785-610e3100-a5d1-11eb-9290-aaa5c6958d38.png)

- 몇가지 Data Type이 존재합니다.
1. document
    - 브라우저가 불러온 웹 페이지를 의미하며, DOM 트리의 진입점 역할을 하게 됩니다.
    - 즉, 저희가 보고 있는 웹 페이지를 의미하게 되는 것입니다.
2. element
    - 위에서 \<title\> 태그나 \<a\> 링크들이 요소가 됩니다.
3. nodeList
    - getElementsByTagName() 메서드에 의해 반환된 nodeList로, DOM 트리의 노드들이라고 생각하면 됩니다.
4. arrtribute
    - 속성값으로 \<a href="#"\>에서 href가 여기에 속합니다.

### DOM API

- HTML 태그를 DOM으로 가져올 수 있는 메서드들이 있습니다. 몇가지만 설명해보도록 하겠습니다.
- 기본적으로 tag, id, class, cssSelector를 이용해 찾게 됩니다.

메소드 | 설명
:---: | :---:
document.getElementsByTagName(name) | 해당 태그 이름의 요소를 모두 선택함
document.getElementById(id) | 해당 아이디의 요소를 선택함
document.getElementByClassName(class) | 해당 클래스에 속한 요소를 모두 선택함
document.getElementByName(name) | 해당 name 속성 값을 가지는 요소를 모두 선택함
document.querySelector() | 해당 선택자로 선택되는 요소를 첫번째 하나만 선택함
document.querySelectorAll() | 해당 선택자로 선택되는 요소를 모두 선택함


### 예제

- 아래와 같이 input이 있다고 해봅시다.

```jsx
<input id="search" class="search-input-style">
```

1. Tag로 찾기

    ```jsx
    document.getElementsByTagName('input')
    ```

2. id로 찾기

    ```jsx
    document.getElementById('search')
    ```

    - 가장 속도가 빠르게 되는데, 그 이유는 id는 하나만 사용하기 때문입니다.
3. className으로 찾기

    ```jsx
    document.getElementsByClassName('search-input-style')
    ```

4. cssSelector로 찾기
    - 가장 많이 사용하게 되며, 위에서 Tag, id, class 모두를 이용해서 찾을 수 있는 방법입니다.

    ```jsx
    document.querySelector('.search-input-style') // 첫번째 Element
    document.querySelectorAll('.search-input-style') // 모든 Element
    ```

### 정리

- 따라서 DOM은 HTML을 위한 API이며, HTML을 탐색할 수 있고, HTML 구조를 바꿀수 있다.

## 🌱 BOM(Browser Object Model)

- 웹 브라우저의 환경의 다양한 기능을 객체처럼 다루는 모델로, 대부분 브라우저에서 구현되어 있는 기능들이 있지만 표준이 존재하지 않아 브라우저마다 세부사항은 다르다는 단점이 있습니다.
- 바로 이 BOM인데, 이걸 이용해 웹 브라우저의 버튼, URL 주소 입력창, 타이틀 바 등 웹 브라우저 윈도우 및 웹페이지의 일부분을 제어할 수 있게 합니다.
- window 객체를 통해 쉽게 접근이 가능합니다.

### 이걸 왜 알아야 하는가?

- 사용자가 클릭 했을때, 안내창을 보여주고 싶다!?
- 현재 url 위치 및 접속 히스토리를 알고 싶다!?
- 유저가 접속한 환경을 알고 싶다!?
- ....

### 대표적인 BOM 객체

1. window
    - Global Context
    - 브라우저 창
    - 모든 객체의 조상님
2. screen
    - 사용자 환경의 디스플레이 정보
    - 화면 크기마다 다르게 동작하고 싶을 때 사용
3. location
    - 현재 페이지 URL
4. navigator
    - 웹 브라우저 및 브라우저 환경
    - 브라우저마다 다른 기능을 제공해야 할때 사용
5. history
    - 현재의 브라우저가 접근햇던 URL 히스토리

1. ......

### 예제

```jsx
window.onbeforeunload = function() {
    return '작성 중인 메시지가 있습니다.'
}
```

- 위와 같은 코드를 이용하면 사용자가 나가기 전에 안내창을 띄울수 있습니다.

![image](https://user-images.githubusercontent.com/53366407/115981789-68cdd580-a5d1-11eb-87c8-fb171cf4775f.png)

- window를 이용하면 전역 변수도 선언이 가능합니다.

```jsx
const really = 'Really?'
window.really; // 'Really?'
```

### 정리

- 웹 브라우저 기능을 객체처럼 다루게 하고, 정의된 표준이 없어 브라우저마다 구현이 다르지만, 사용자 경험(UX)를 향상시킬 수 있는 방법이다.

## 출처

- NEXT-STEP 블랙커피 레벨 1 8기 강의 자료
- [Window 객체와 BOM](https://www.zerocho.com/category/JavaScript/post/573b321aa54b5e8427432946)
