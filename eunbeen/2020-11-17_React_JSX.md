> 리액트를 다루는 기술 2장 JSX

## JSX란
 - 자바스크립트의 확장 문법이며 XML과 매우 비슷하게 생김
 - 브라우저에서 실행되기 전 코드가 번들링 되는 과정에서 바벨 사용해 일반 자바스크립트 형태의 코드로 변환됌
``` js
      //JSX 코드로 작성
      function App() {
          return(
              <div>
                 Hello <b>react</b>
              </div>
          )
      }

      //기존 JS 코드로 작성
      function App() {
          return React.createElement("div", null, "Hello", React.createElement("b", null, "react"));
      }
```


  - **장점**
      - 가독성 높아지고 작성하기 쉽다.
       - 활용도가 높다
           - JSX안 HTML 태그 사용 가능
            - 컴포넌트도 JSX안에서 작성 가능
            
## JSX 문법
#### 1. 감싸인 요소
  - 컴포넌트에 여러 요소 존재 시 반드시 부모 요소 하나로 감싸기
      - Vritual Dom에서 컴포넌트 변화 감시지 효율적으로 비교 위해(컴포넌트 내부는 하나의 DOM 트리로 구성되는 규칙 적용된다)
  - `<div>` 태그로 감싸거나 Fragment `<Fragment>`, `<>`  태그 사용
``` js
        import React from 'react';

        function App(){
            return (
                <div> {/*부모 태그로 닫아주지 않으면 에러 발생*/}
                    <h1>React</h1>
                </div>
            )
        }

        export default App;

```

#### 2. JavaScript 표현
 - JSX안 JavaScript 표현식 사용해 DOM 렌더링 가능
  - JSX 내부 코드 `{ }`  사용해서 JavaScript rkqt wkrtjd
``` js
        import React from 'react';

        function App(){
          const name = '리액트';
            return (
                <div> 
                    <h1>{name} 안녕~ </h1>
                </div>
            )
        }

        export default App;

```      

#### 3. if문 대신 조건부 연산자
 - JSX 내부 JavaScript표현식에서 if  문 사용 못함
    - JSX 밖에서 if문 사전에 값 설정
    - `{ }` 안 조건부 연산자(삼항 연산자) 사용
``` js
        import React from 'react';

        function App(){
          const name = '리액트';
            return (
                <div> 
              	    {name === '리액트' ? (
                    	<h1>React</h1>
                    ): ( 
              			<h2>Not React</h2>
              		)}{/*삼항 연산자 사용*/}
                </div>
            )
        }

        export default App;

```  

#### 4. AND 연산자(&&)를 사용한 조건부 렌더링
 - && 연산자로 조건부 렌더링 가능
     - false 렌더링할 때 null과 똑같이 아무것도 나타내지 않는다.
     - **주의** falsy한 값은 0 은 예외적으로 화면에 나타남
``` js
        import React from 'react';

        function App(){
          const name = '리액트';{/*const가 number로 정의되면 0이 return 된다.*/}
            return (
                <div> 
              	   return <div>{name === '리액트' && <h1>React</h1>}</div>;
                </div>
            )
        }

        export default App;

```  
#### 5. undefined를 렌더링하지 않기
 - 함수에서 undefined만 반환해서 렌더링 상황 만들면 안됌
     - OR 연산자 사용해 방지
     - JSX 내부에서 undefined 렌더링해서 방지
``` js
        import React from 'react';

        function App(){
          {/*OR 연산자 사용*/}
          const name = undefined;
          return name || ' + undefined';
          {/*JSX 내부에서 undefined 렌더링*/}
          const name = undefined;
          return <div>{name}</div>
        }

        export default App;

```  
#### 6. 인라인 스타일링
 - React에서 DOM 요소에 스타일 적용 시 문자열 형태 x > **객체** 형태
 - 카멜 표기법 작성('-' 문자 포함되는 이름은 '-' 문자 없애고 카멜 표기법으로)
     - background -color > backgroundColor
     - font-size > fontSize
``` js
        import React from 'react';

        function App(){
            const name = '리액트';
            const style = {color : 'blue', backgroundColor : 'gray', padding:16};
            return <div style={style}>{name}</div>
          
          {/*style값 바로 지정*/}
            return <div style={{color : 'blue', backgroundColor : 'gray', padding:16}}>
                       {name}
                   </div>
        }

        export default App;

```   
#### 7. class 대신 className 
 - JSX에서는 `<div class = "a">` 를  `<div className="a">` 로 사용 
``` js
        import React from 'react';

        function App(){
            const name = '리액트';
            return <div className="react">{name}</div>
        }

        export default App;

```   
#### 8. 주석
 - JSX 내부에서 주석 작성시 
     - `{/*주석주석*/}`
  - 시작 태그에서 주석 작성 시
      - `<div className="cla" //주석주석 `
