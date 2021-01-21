# 13. 리액트 라우터로 SPA 개발하기

React를 다루는 기술 책

# SPA란?

- *Single Page Application*(싱글 페이지 애플리케이션)
    - **한 개의 페이지**로 이루어진 애플리케이션
    - 처음 하나의 빈 페이지만 서버측에서 제공 후 View에 대해 Client가 자바스크립트 통해 렌더링 →사용자의 브라우저에서 View 생성
    - 화면 한 종류? x → 서버에서 사용자에게 제공하는 페이지는 한 종류지만 **해당 페이지에서 로딩된 자바스크립트와 현재 사용자 브라우저의 주소 상태에 따라 다양한 화면** 보여줄 수 있다.
    - 장점
        - 사용자와의 인터랙션 발생 시 필요 부분만JS 활용 업데이트
        - **속도와 트래픽** 측면 우수
    - 단점
        - 앱의 규모가 커지면 **자바스크립트 파일 너무 커짐**
        - **자바스크립트가 실행될 때까지 페이지 비어있기 때문**에 JS 파일 로딩실행 되는 시간 중요(서버 사이드 렌더링 통해 해결 가능)
        - 페이지 로딩 시 사용자가 **실제 방문하지 않을 수 있는 스크립트**도 불러옴

# 라우터란?

- **다른 주소**에 **다른 화면** 보여주는 것
- **브라우저 API를 직접 사용하여 이를 관리**, 라이브러리 사용해 작업 더욱 쉽게 구현
- 리액트 라이브러리 **자체에 기능 내장 x**
    - 리액트 라우팅 **라이브러리** 사용
        - 리액트 라우터 ( 역사 길고 사용 빈도 높다)
        - 리치 라우터
        - Next.js
        - 등등....

# 리액트 라우터 라이브러리

- 클라이언트 사이드에서 이루어지는 **라우팅을 아주 간단하게 구현 제공**
- 후에 서버 사이드 렌더링 시에도 라우팅 도와주는 컴포넌트 제공

## 리액트 라우터 설치

`npm add react-router-dom`

## 프로젝트에 라우터 적용

- `src/index.js` 파일에서 `react-router-dom` 에 내장되어 있는 `BrowerRouter`라는 컴포넌트 사용해 감싸면 된다.
- `BrowerRouter` 컴포넌트
    - 웹 애플리케이션에 **html5의 history api 사용해 페이지를 새로고침하지 않고도 주소를 변경**할 수 있다.
    - **현재 주소에 관련된 정보**를 **props로 쉽게 조회하거나 사용**할 수 있다.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowerRouter} from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
 
ReactDOM.render(
	 <BrowerRouter>
	   <App />
	 </BrowerRouter>,
	 document.getElementById('root')
);
```

## Route 컴포넌트로 특정 주소에 컴포넌트 연결

Route 컴포넌트를 사용하면 **어떤 규칙을 가진 경로**에 어떤 **컴포넌트를 표출** 정의 가능

```jsx
<Route path="주소 규칙" component={보여 줄 컴포넌트} />
import logo from './logo.svg';
import './App.css';
import {Route} from 'react-router-dom';
import About from './About';
import Home from './Home';
 
function App() {
 return (
   <div>
     <Route path="/" component={Home}/>
     <Route path="/about" component={About}/>
		 <Route path="/" component="Home" exact={true}/>
   </div>
 );
}
 
export default App;
```

- 이렇게 코드를 작성하면 `/about` URL에 접속해도  `home`, `about` **두개의 컴포넌트가 나옴**
    - 이유는 `/about` 에 `/` 도 포함되기 때문에 `exact` props 사용해 방지

## Link 컴포넌트

- **클릭하면 다른 주소로 이동시켜 주는 컴포넌트**
- 일반 웹 애플리케이션 ⇒ **a 태그** 사용해 페이지 전환
    - **리액트 라우터 사용 시 이 태그 직접 사용 x**
    - 페이지를 전환하는 과정에서 페이지를 새로 불러오기 때문에 애플리케이션이 들고 있던 상태 모두 날려 버림
        - 렌더링된 컴포넌트들도 모두 사라지고 다시 처음부터 렌더링 됨
- Link 컴포넌트를 사용하여 페이지 전환
    - 페이지 새로 불러오지 않고 애플리케이션 그대로 유지 상태에서 HTML5 History API를 사용해 페이지의 주소만 변경해 준다.
- Link 컴포넌트 자체는 a 태그로 이루어져 있음
    - 페이지 전환 방지 기능이 내장
- `<Link to=”주소”>내용</Link>`

```jsx
import logo from './logo.svg';
import './App.css';
import {Link, Route} from 'react-router-dom';
import About from './About.js';
import Home from './Home.js';
 
function App() {
 return (
   <div>
     <ul>
       <li>
         <Link to="/">홈</Link>
       </li>
       <li>
         <Link to="/about">소개</Link>
       </li>
     </ul>
     <hr/>
     <Route path="/" component={Home} exact={true}/>{/*exact props 이유는 /about 규칙에 / 규칙도 포함되기 때문*/}
     <Route path="/about" component={About}/>
   </div>
 );
}
 
export default App;
```

## Route 하나에 여러 개의 path 설정하기

- **Route 하나**에 **여러개의 path 지정**하는 것
 → 최신 버전의 **리액트 라우터 v5**부터 적용
- 이전 버전

    ```jsx
    <Route path="/about" component={About}/>
    <Route path="/info" component={About}/>
    ```

    - 위 코드와 같이 **Route 두번 설정**하여 여러 경로에서 같은 컴포넌트 보여줌
- 현재 버전

    ```jsx
    <Route path={['/info', "/about"]} component={About}/>
    ```

    - `path` props **배열**로 설정해 **여러 경로에서 같은 컴포넌트** 보여줌

# URL 파라미터와 쿼리

- **페이지 주소 정의 ⇒ 유동적인 값 전달**
- **파라미터**와 **쿼리**로 구분
    - 파라미터 :  `/propfile/velopert`
    - 쿼리        :  `/about?details=true`
    - 유동적인 값 사용 시 파라미터 vs 쿼리
        - 일반적으로 **파라미터** → 특정 아이디 이름 사용 조회
        - 일반적으로 **쿼리** → 키워드 검색, 페이지 필요한 옵션 전달
        - 정해진 **규칙은 없다**!!

## URL 파라미터

```jsx
import React from 'react';
 
const data = {
   velopert : {
       name : '김민준',
       description : '리액트를 좋아하는 개발자'
   },
   gildong : {
       name : '홍길동',
       description : '고전 소설 홍길동전의 주인공'
   }
};

const Profile = ({match}) => {
   const {username} =match.params;
   const profile = data[username];
   if(!profile){
       return <div>존재하지 않는 사용자입니다.</div>;
   }
 
   return(
       <div>
           <h3>
               {username} ({profile.name})
           </h3>
           <p>{profile.description}</p>
       </div>
   );
};
 
export default Profile;

<li>
   <Link to="/profile/gildong">gildong 프로필</Link>
 </li>
</ul>
<hr/>
<Route path="/" component={Home} exact={true}/>{/*exact props 이유는 /about 규칙에 / 규칙도 포함되기 때문*/}
<Route path={['/info', "/about"]} component={About}/>
<Route path='/profile/:username' component={Profile}/>
{/*이렇게 설정하면 match.params.username 값을 통해 username 값 조회 가능*/}
```

- 라우트로 사용되는 컴포넌트에서 받아오는 `match` 객체 안 `params`값 참조
- `match` 객체
    - **현재 컴포넌트가 어떤 경로 규칙에 의해 보이는지에 대한 정**

## URL 쿼리

- 쿼리는 `location` **객체**에 들어있는 `search` **값**에서 **조회 가능**
- `location` 객체
    - **라우트로 사용된 컴포넌트**에게 prop로 전달
    - **웹 애플리케이션의 현재 주소에 대한 정보를 지니고 있다.**

    ```json
    //location 형태
    //http://localhost :3000/about?detail=true 주소 들어갔을 때 값
    {
     "pathname" : '/about',
     "search" : "?detail=true",
     "hash" : ""
    }
    ```

    - url 쿼리를 읽을 때는 `location` 객체가 지닌 값 중 `search` 값 확인
        - url 쿼리는 ? 과 같이 ***문자열***에 **여러가지 값을 설정 가능**
        - `search` 값에서 특정 값을 읽어 오기 위한 방법
            - **문자열을 객체 형태로 변환(**qs라는 라이브러리 사용)
            - `npm add qs`
            - 주의 사항

    ```jsx
    import logo from './logo.svg';
    import './App.css';
    import {Link, Route} from 'react-router-dom';
    import About from './About.js';
    import Home from './Home.js';
    import Profile from './Profile';
     
    function App() {
     return (
       <div>
         <ul>
           <li>
             <Link to="/">홈</Link>
           </li>
           <li>
             <Link to="/about">소개</Link>
           </li>
           <li>
             <Link to="/profile/velopert">velopert 프로필</Link>
           </li>
           <li>
             <Link to="/profile/gildong">gildong 프로필</Link>
           </li>
         </ul>
         <hr/>
         <Route path="/" component={Home} exact={true}/>
         <Route path={['/info', "/about"]} component={About}/>
         <Route path='/profile/:username' component={Profile}/>
         {/*이렇게 설정하면 match.params.username 값을 통해 username 값 조회 가능*/}
       </div>
     );
    }
     
    export default App;
    ```

    - 쿼리 사용시 **쿼리 문자열 → 객체로 파싱 과정**
        - **결과값 : 항상 문자열 주의**

            `value=1`  `value=true`  ⇒ 다 문자열이다.

             `pareInt` 함수 사용하고 `=== “true”` 이렇게 문자열 비교 

# 서브 라우트

- **라우트 내부에 또 라우트를 정의**
- **라우트로 사용되고 있는 컴포넌트의 내부**에 **Route 컴포넌트** 사용!

```jsx
import React from 'react';
import {Link, Route} from 'react-router-dom';
import Profile from './Profile';
 
const Profiles = () => {
   return(
       <div>
           <h3>사용자 목록:</h3>
           <ul>
               <li>
                    <Link to="/propfiles/velopert">
											velopert
										</Link>
               </li>
               <li>
                    <Link to="/profiles/gildong">
											gildong
										</Link>
               </li>
           </ul>
 
           <Route
               path="/profiles"
               exact
               render={() => <div>사용자를 선택해 주세요.</div>}
           />
           <Route paht="/profiles/:username" 
									component={Profile}
						/>
       </div>
   );
};
 
export default Profile;
```

- `compoenet` 대신 `render` props 사용
 → 컴포넌트를 전달하는 것이 아니라 **보여주고 싶은 JSX 넣어줌**
- **JSX에서 props 설정 시 값 생략하면 자동으로 true 설정**  
 → `exact` == `exact={true}`