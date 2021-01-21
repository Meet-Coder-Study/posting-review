# 8. Hooks

React를 다루는 기술 책

# Hook란?

- 리액트 v16.8 새로 도입된 기능
- **함수형 컴포넌트에서도 상태(**리액트 컴포넌트에서 동적인 값**)관리 가능**
    - 상태 관리 class를 쓰지 않고, **function에서 state 를 운용할 수 있는 기능**이다.
- **렌더링 직후 작업을 설정 가능**
- 기존의 함수형 컴포넌트에서 할 수 없었던 **다양한 작업 가능**

# 1. useState

- 가장 기본적인 hook 으로 함수형 컴포넌트에서 상태를 관리 가능
- 함수형 컴포넌트에서도 **가변적인 상태**를 지닐 수 있게 해줌
- `const [value, setValue] = useState(상태의 초기 값);`
    - 첫번째 원소(*value*) : 현재 상태 값 저장 변수
    - 두번째 원소(*setValue*) : 상태 값 설정(갱신) setter 함수
    (파라미터를 넣어서 호출 시 전달받은 파라미터로 값이 바뀐다음 컴포넌트 정상적 리렌더링)
    - return형 : 배열
    - ES6 문법 destructuring 통해 원소 추출 시 같은 사용 법

        ```jsx
        const valueState = userState(0);
        const value = valueState[0];
        const setValue = valueState[1];
        ```

    - `setValue(업데이트 할 새로운 값, 업데이트 하는 함수(함수형 업데이트);`
        - 상태 값 갱신 함수 사용
        - `setValue(value + 1)`  → 업데이트 할 새로운 값
        - `setValue(preValue ⇒ preValue + 1)` → 업데이트 하는 함수(함수형 업데이트)
            - 컴포넌트 최적화 시 주로 사용

```jsx
import React , { useState } from 'react';//useSatae 함수 불러옴
 
const Counter = () => {
 
   const [value , setValue ] = useState(0);

   return(
       <div>
           <p>
               현재 카운터 값은 <b>{value}</b>입니다.
               <button onClick={() => setValue(value + 1)}>+1</button>
               <button onClick={() => setValue(value - 1)}>-1</button>
           </p>
       </div>
   );
}
```

## 1.1. useState를 여러 번 사용하기

```jsx
const [name, setName] = useState('');
const [nickname, setNickname] = useState('');

const onChangeName = e =>{
   setName(e.target.value);
}

const onChangeNickname = e =>{
   setNickname(e.target.value);
}
```

# 2. useEffect

- 리액트 컴포넌트가 **렌더링 될 때마다 특정 작업 수행하도록 설정 hook**
    - component **mount***(처음 나타났을 때)*
    - component **unmount***(사라질때)*
    - component **update***(update 직후)*

    → **생명주기 메소드를 함수형 컴포넌트에서도 사용 가능**

    - 클래스형 컴포넌트의 componentDidMount + componentDidUpdate = useEffect
- 기본적으로 **렌더링되고 난 직후 실행**(cleanup 함수 사용 시에는 직전 실행)
- `useEffect(function, deps);`
    - *function* : 수행 작업
    - *deps* : 배열 형태
        - 검사하고자 하는 특정 값 → **특정 값**만 **mount, update, unmount**시 작동
        - 빈 배열 →  **mount,** **unmount(cleanup함수)**시에만 작동
        - 생략 → **리렌더링** 될때마다 실행

```jsx
import React , { useEffect } from 'react';//useEffect 함수 react lib로부터 불러옴

...

useEffect(() => {
   console.log('렌더링이 완료되었습니다!');
   console.log({
       name, nickname
   });
});
```

## 2.1. Mount 될 때만 실행하고 싶을 때

- `useEffect`에서 설정한 함수를 **컴포넌트가 화면에 맨 처음 렌더링 시에만 실행**
- `useEffect`함수의 **두 번째 파라미터로 비어있는 배열 전달**

```jsx
useEffect(() => {
   console.log('렌더링이 완료되었습니다!');
},[]);
```

## 2.2. 특정 값이 Update될 때만 실행하고 싶을 때

- 기존 클래스형 컴포넌트

```jsx
//props 안에 들어있는 값이 바뀔때만 특정 작업 수행
componentDidUpdate(prevProps , prevState){
   if(prevProps.value !== this.props.value){
       doSomething();
   }
}
```

- `useEffect`함수의 **두 번째 파라미터로 업데이트 하고 싶은 특정 값**
    - state 통해 관리하고 있는 상태, props로 전달받은 값 가능
    - 만약 **useEffect 안에서 의존하는 state, props가 있다면 deps에 넣어주는것 규칙**
        - useEffect 안의 함수가 실행될 때 최신상태, props 오류 발생

```jsx
useEffect(() => {
   console.log(name);
},[name]);
```

## 2.3. 뒷정리하기(cleanup)

- 컴포넌트 **unmount 전** , **업데이트 전** 작업 수행
    - `return()` 뒤에 나오는 함수 = `useEffect()`에 대한 뒷정리 함수
- **두번째 파라미터 배열에 따라 cleanup함수 실행 조건** 달라짐
    - unmount 전에만 실행  **:**  빈 배열
    - 업데이트 되기 직전 값 :  deps 배열 안 검사 값

```jsx
useEffect(() => {
       console.log('effect');
       console.log(name);
       return() => {
           console.log('cleanup');
           console.log(name);
       };
   },[name]);
```

# 3. useReducer

- useState보다 **더 다양한 컴포넌트 상황에 따라 다양한 상태를 다른 값으로 업데이트** 할 때 사용 Hooks
- 컴포넌트와 상태 업데이트 로직 분리 → 컴포넌트 외부에서도 상태 관리
- `reducer(state, action)`
    - 현재 상태 업데이트 위해 **필요한 정보 담은 액션(action) 값 전달**받아 **새로운 상태를 반환**하는 함수
    - *state*  : 현재 상태
    - *action* : 업데이트와 관련된 정보 가진 객체
    - *return*  : 컴포넌트가 지닐 새로운 상태(업데이트 될 값)
- `const [state, dispatch] = useReducer(reducer 함수 , 해당 reducer 기본값)`
    - *state* : 현재 가리키고 있는 상태
    - *dispatch* : 액션을 발생시키는 함수
- `dispatch(action)`
    - 함수 안에 파라미터로 **액션 값을 넣어주면 reducer 함수 호출**

```jsx
import React , { useReducer } from 'react';//useSatae 가져옴
 
 
function reducer(state, action){
   //action.type에 따라 다른 작업 수행
   switch(action.type) {
       case 'INCREMENT' :
           return {value : state.value + 1};
       case 'DECREMENT' :
           return {value : state.value - 1};
       default :
           //아무것도 해당되지 않을 때 기존 상태 변환
           return state;
   }
}
 
const Counter = () => {
 
   const [state, dispatch] = useReducer(reducer , {value : 0});

   return(
       <div>
           <p>
               현재 카운터 값은 <b>{state.value}</b>입니다.
               <button onClick={() => dispatch({type : 'INCREMENT'})}>+1</button>
               <button onClick={() => dispatch({type : 'DECREMENT'})}>-1</button>
           </p>
       </div>
   );
}
 
export default Counter;
```

- 인풋 상태 관리

    ```jsx
    import React, {useEffect, useState, useReducer} from 'react';
     
    function reducer(state, action) {
       //action은 그 어떤 값도 사용 가능
    	 //> 이벤트 객체가 지니고 있는 e.target 값 자체 액션 값으로 사용
       return{
           ...state,
           [action.name] : action.value
       };
    }
     
    const Info = () =>{
     
       // const [name, setName] = useState('');
       // const [nickname, setNickname] = useState('');
     
       const [state, dispatch] = useReducer(reducer,{
           name : '',
           nickname : ''
       })
     
       const {name, nickname} = state;
     
       const onChange = e =>{
           dispatch(e.target);
      
       }
     
     
       return(
           <div>
               <div>
                   <input value={name} onChange={onChange}/>
                   <input value={nickname} onChange={onChange}/>
               </div>
               <div>
                   <div>
                       <b>이름:</b> {name}
                   </div>
                   <div>
                       <b>닉네임:</b> {nickname}
                   </div>
               </div>
           </div>
       );
    }
     
    export default Info;
    ```

- 컴포넌트 관리 값 1개 + 구조 단순 → `useState()`
- 컴포넌트 관리 값 다수 + 구조 복잡 → `useReduce()`

# 4. useMemo

- 함수형 **컴포넌트 내부에서 발생하는 연산 최적화 가능**
- 컴포넌트가 렌더링을 하는 과정에서 특정 값이 바뀌었을 때만 연산 실행 
→ 바귀지 않았다면 이전 결과 다시 사용**(연산된 값 렌더링 시 재사용)**
- `useMemo(function, deps)`
    - function : 연산 정의 함수
    - deps : 검사할 특정 값 배열 → 배열 안 값 변환시 함수 호출해 연산

```jsx
import React, {useEffect, useState, useReducer, useMemo} from 'react';
 
const getAverage = numbers => {
   console.log('평균값 계산 중 ..');
   if(numbers.length === 0) return 0;
   const sum = numbers.reduce((a, b) => a +b);
   return sum / numbers.length;
};
 
const Average = () =>{
   const [list, setList] = useState([]);
   const[number,setNumber] = useState('');
  
   const onChange = e => {
       setNumber(e.target.value);
   }
 
   const onInsert = e =>{
       const nextList = list.concat(parseInt(number));
       setList(nextList);
       setNumber('');
   }
 
   const avg = useMemo(() => getAverage(list), [list]);
   //list 내용이 변경될 땨만 geAverage 함수 호출된다.
 
   return(
       <div>
           <input value={number} onChange={onChange}/>
           <button onClick={onInsert}>등록</button>
           <ul>
               {list.map((value, index) => (
                 <li key ={index}>{value}</li> 
               ))}
           </ul>
           <div>
               <b>평균값 :</b> {avg}
           </div>
       </div>
   );
}
 
export default Average;
```

# 5. useCallback

- `useMemo` 기반으로 만들어진 Hooks
    - `useMemo` : 특정 **결과값 재사용** 시 사용
    - `useCallBack` : 특정 **함수 재사용** 시 사용
- 렌더링 성능 최적화시 사용 → 만들어 놨던 함수 **재사용** 가능
- 사용시 주의사항
    - `useCallback` 사용 시 함수에 의존하는 **state, props → 반드시 deps 배열 안 포함**
    - 컴포넌트에서 **props 함수 받아옴 → 그 함수 deps에 포함**
    - 함수를 자식 컴포넌트에 **props로 넘겨줄 때 → 항상 `useCallback` 사용**
        - 자식컴포넌트는 계속 새로운 함수를 생성한다고 받아들이기 때문
- `useCallback(*function*, *deps*)`
    - *function* : 재사용할 함수
    - *deps* : 검사할 특정 값 배열
        - → 어떤 값이 바뀌었을 때 **함수 새로 생성 명시**(비어있으면 렌더링시 만들었던 함수 계속 재사용)

```jsx
import React, {useEffect, useState, useReducer, useMemo ,useCallback} from 'react';
 
const getAverage = numbers => {
   console.log('평균값 계산 중 ..');
   if(numbers.length === 0) return 0;
   const sum = numbers.reduce((a, b) => a +b);
   return sum / numbers.length;
};
 
const Average = () =>{
   const [list, setList] = useState([]);
   const[number,setNumber] = useState('');
  
   const onChange = useCallback(e => {
       setNumber(e.target.value);
   }, []);

   const onInsert = useCallback(e =>{
       const nextList = list.concat(parseInt(number));
       setList(nextList);
       setNumber('');
   },[number, list]);//number, list가 바귀었을 때만 함수 생성

   const avg = useMemo(() => getAverage(list), [list]);

   return(
       <div>
           <input value={number} onChange={onChange}/>
           <button onClick={onInsert}>등록</button>
           <ul>
               {list.map((value, index) => (
                 <li key ={index}>{value}</li> 
               ))}
           </ul>
           <div>
               <b>평균값 :</b> {avg}
           </div>
       </div>
   );
}
 
export default Average;
```

# 6. useRef

- 함수형 컴포넌트에서 **ref를 쉽게 사용**할 수 있도록 해줌
    - 클래스형 컴포넌트에서는 콜백 함수 or `React.createRef` 사용
- 특정 DOM 선택 시 사용(JS에서는 Dom seletor 사용)
- `useRef(null);`
    - Ref 객체 생성
- `<input ref={ref값} value={text}/>`
    - 선택할 DOM에 속성으로 ref 값 설정
- `ref 값.current.focus();`
    - useRef를 통해 만든 객체 안의 current값이 선택하고자 하는 DOM 가리킴
- useRef로 변수 관리 시 **변수 업데이트 되어도 리렌더링 발생 x**
    - DOM 선택 외에도 **컴포넌트 안에서 조회 및 수정 가능한 변수 관리** 가능(ex. scroll 위치 등)

```java
import React, {useState, useRef} from 'react';

const Average = () =>{
		const [text, setText] = useState('');
    const input = useRef(null);//Ref 객체 생성

		const onReset = () => {
			setText('');
			input.current.focus();
		}
			
    return(
        <div>
            <input ref={input} value={text}/>
						<button onclick={onReset}>
							초기화
						</button>
        </div>
    );
}

export default Average;
```

# 7. 커스텀 Hooks 만들기

```jsx
import React, {useEffect, useState, useReducer} from 'react';
import useInputs from './useInputs';
 
 
const Info = () =>{
 
   // const [name, setName] = useState('');
   // const [nickname, setNickname] = useState('');
 
   const [state, onChange] = useInputs({
       name : '',
       nickname : ''
   })
 
   const {name, nickname} = state;
 
   return(
       <div>
           <div>
               <input value={name} onChange={onChange}/>
               <input value={nickname} onChange={onChange}/>
           </div>
           <div>
               <div>
                   <b>이름:</b> {name}
               </div>
               <div>
                   <b>닉네임:</b> {nickname}
               </div>
           </div>
       </div>
   );
}
 
export default Info;
 
 
 
import { useReducer } from 'react';
 
function reducer(state, action ){
   // //action은 그 어떤 값도 사용 가능 > 이벤트 객체가 지니고 있는 e.target 값 자체 액션 값으로 사용
   return {
       ...state,
       [action.name] : action.value
   };
}
 
export default function useInputs(initalForm){
   const[state, dispatch] = useReducer(reducer, initalForm);
   const onChange = e =>{
       dispatch(e.target);
   };
   return [state, onChange];
}
```

- 다른 개발자가 만든 **Hooks도 라이브러리로 설치 해 사용 가능**

# 8. 정리

- 앞으로는 함수형 컴포넌트와 Hooks 사용하는 형태 권장
- 기존의 함수형 컴포넌트에서 할 수 없었던 다양한 작업 가능
- useState
    - → 함수형 컴포넌트에서 상태관리(가변적 상태 가능)
- useEffect
    - → 함수형 컴포넌트에서 생명주기 메소드 사용한 것 처럼 렌더링 될때마다 특정 작업 수행하도록 설정
- useReducer
    - → 더 다양한 컴포넌트 상황에 따라 다양한 상태를 다른 값으로 업데이트
    - → 컴포넌트와 상태 업데이트 로직 분리로 컴포넌트 외부에서도 상태 관리
- useMemo
    - → 컴포넌트 내부에서 발생하는 연산 최적화 가능(특정 연산 재사용 시 사용)
- useCallback
    - → 컴포넌트 내부에서 발생하는 함수 최적화 가능(특정 함수 재사용 시 사용)
- useRef
    - → 함수형 컴포넌트에서 ref를 쉽게 사용할 수 있도록 해줌