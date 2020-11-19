# Javascript 로 TodoList 만들어보기	
이번에 프로그래머스에서 [Javascript 스터디](https://programmers.co.kr/learn/courses/10785)를 진행하게 되었는데 거기서 해보았던 Javascript로 TodoList 만들기를 만들어보며 관련 내용 포스팅 해보려고 합니다.  	
(거금 35만원....)	

1. TodoList 구현	
2. setState 구현	
3. data Validation 구현	

이렇게 3가지를 구현해보려고 합니다.  	
먼저 index.html 의 코드부터 보시면...	
```html	
<html>	

<head>	
  <title>Mission 1</title>	
  <meta charset="utf-8" />	
</head>	

<body>	
  <div id="todo-list"></div>	
  <div id="todo-list2"></div>	
  <div id="todo-list3"></div>	
  <script src="TodoList.js"></script>	
  <script>	
    let data = [	
      {	
        text: 'JS 공부하기',	
        isCompleted: true,	
      },	
      {	
        text: 'JS 복습하기',	
        isCompleted: true,	
      }	
    ]	
    let data2 = [	
      {	
        text: '코드리뷰 하기',	
        isCompleted: false,	
      },	
      {	
        text: '코드리뷰 반영하기',	
        isCompleted: true,	
      }	
    ]	
    let data3 = [	
      {	
        text: 'React 공부하기',	
        isCompleted: false,	
      },	
      {	
        text: 'React 복습하기',	
        isCompleted: false,	
      }	
    ]	
    let todoList = new TodoList('#todo-list', data)	
    let todoList2 = new TodoList('#todo-list2', data2)	
    let todoList3 = new TodoList('#todo-list3', data3)	
    	
    todoList2.setState([	
      {	
        text: 'set State 로 수정된 데이터',	
        isCompleted: false,	
      }	
    ])	
    	
  </script>	
</body>	
</html>	
```	

위 코드처럼 index.html에 위와 같이 작성했습니다. data1, 2, 3 등 여러가지 데이터를 만들고, 각각 다른 인스턴스를 생성해서 거기에 data를 넣어 주었습니다. data의 property는 text와 isCompleted 가 있습니다.  	
isCompleted를 활용해서 true면 TodoList 텍스트에 가로선을 그어주는 것을 만들어보려고 합니다.  	
TodoList 파일은 따로 모듈로 빼두어	

```html	
<script src="TodoList.js"></script>	
```	
로 불러올 수 있도록 했습니다.	

다음은 TodoList.js 파일입니다.	

```javascript	
const isEmpty = (data) => {	
  if (data === null || data === undefined) {	
      return true	
    }	
  return false	
}	
const propertyChecker = (data) => {	
  let isValid = true	
  data.forEach(item => {	
    if(!item.hasOwnProperty('text')) {	
      isValid = false	
    }	
  })	
  return isValid	
}	
function TodoList (id, data) {	
  if (isEmpty(data) || !Array.isArray(data) || !propertyChecker(data)) {	
    throw new Error ('잘못된 데이터 입니다.')	
  }	
  	
  if (!new.target) {	
    throw new Error ('new 키워드를 사용해주세요.')	
  }	
  this.data = data	
  this.id = id	
  const renderItem = () => this.data.map(item => item.isCompleted ? `<s>${item.text}</s>` : item.text).join('</br>')	
  this.render = () => {	
    document.querySelector(this.id).innerHTML = renderItem()	
  }	
  this.setState = (nextData) => {	
    if (isEmpty(nextData) || !Array.isArray(nextData) || !propertyChecker(nextData)) {	
      throw new Error ('잘못된 데이터 입니다.')	
    }	
    this.data = nextData	
    this.render()	
  }	
  	
  this.render()	
}	
```	

TodoList는 function 스타일로 작성 했는데요. TodoList는 dom element id를 받아서 그것의 innerHtml 에 렌더링이 될 수 있도록 작성했습니다.  	
data는 각종 validation 함수를 거쳐 검사된 후 this.data에 들어갑니다.  	
this를 설명하자면 좀 길지만, 여기에서 말씀 드리면 this는 TodoList를 가리킵니다.  	
때문에 ```this.data = data``` 와 같은 형식으로 작성함으로써 TodoList function 의 data의 data를 대입합니다.  	
isEmpty는 null, undefined를 체크하고 Array 메소드로 isArray가 있더라구요. 이것을 활용해 배열 여부를 검사했습니다.  	

또한, ```propertyChecker``` 함수를 만들어서 올바른 property가 들어갔는지 검사를 해주었습니다. 이것은 hasOwnProperty 기본 내장 함수를 사용해서 검사 해주었습니다.  	

마지막으로 new.target 을 활용해서 해당 함수가 new 키워드를 사용해서 호출 했는지 검사를 할 수 있더라구요.  	
위 TodoList function은 맨 앞글자가 대문자로 생성자 함수입니다. 생성자 함수는 new 키워드를 붙이지 않고 그냥 호출하게 되면 undefined를 반환 합니다.	

setState는 nextData라는 인자를 받아 data 체킹을 한 뒤 다시 렌더링 해주는 형태로 작성 했습니다. 이로써 setState로 데이터를 변경할시 해당 데이터가 추가되면서 다시 렌더링 되어 화면에 그려지는 셈입니다.	

<img width="204" alt="스크린샷 2020-11-05 오후 11 55 20" src="https://user-images.githubusercontent.com/35620465/98256909-790ddc00-1fc2-11eb-86d5-5645ceb06149.png">	

위와 같이 간단히 TodoList를 만들어 보았습니다.	
추후 코드를 더 리팩토링 하고 모듈화 해서 더 다듬어볼 생각입니다.	
요즘 React로 개발을 하면서 Javascript 를 더 잘 알아야겠다는 생각이 들어 스터디도 하면서 이런 글을 작성해 봤는데 배울게 아직 많은것 같네요...  	

감사합니다.