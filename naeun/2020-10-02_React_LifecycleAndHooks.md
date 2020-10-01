# React - LifeCycle and Hooks

## 1. LifeCycle

- 리액트에서는 컴포넌트가 처음 나타날때 및 변경될 때마다, render를 다시 한다. render 되는 과정을 나타내는 것이 lifecycle이다.

![lifecycle](./images/2020-10-02_React_LifecycleAndHooks/lifecycle.png)

- 가장 많이 사용하는 lifecycle의 단계

  1. componentDidMount : 컴포넌트의 인스턴스(데이터)가 생성되어 DOM 상에 삽입되어 렌더링 된 후
  2. componentDidUpdate : props 또는 state가 변경되어 다시 렌더링 된 후
  3. componentWillUnmount :컴포넌트가 DOM 상에서 제거될 때

- lifecycle에서 clean-up이 필요할 때

  외부 데이터를 subscribe(구독)한 것은 componentWillUnmount에서 해제를 한다.
  : 메모리 누수가 발생하지 않도록 하기 위함

## 2. Hooks

- 기존에는 class 사용할 때만 Lifecycle을 사용하여 state의 값을 업데이트하고 변경하는 것이 가능했다.
  하지만, Hook이 등장하면서 함수에서도 state 값을 변경하는 것이 가능해졌다.

- Hook의 장점 (왜 만들어졌는가?)

  1. class는 사용하기 어렵다ㅠㅠ
     : this를 사용 해야하는 것, 바인딩을 해줘야 하는 것, lifeCycle 단계에 따라 설정해 줘야 하는 것 등
  2. 기능별로 나눠 재사용가능하며, 가독성을 높힐 수 있다
     : 리액트의 개념에 부합하는 것!! 기능별로 더 잘게 쪼개 각각의 기능을 조작이 가능하다.
  3. 리액트의 기존 기능들과 100% 호환가능하다.

- 가장 많이 사용되는 Hooks

  1. useState : class에서 state를 초기지정하고, setState를 통해 업데이트 해주는데, 그 역할을 담당
  2. useEffect : lifecycle에서 componentDidMount, componentDidUpdate, componentWillUnmount를 합쳐 놓은 것.

## 3. Comparison - LifeCycle and Hooks

#### LifeCycle in Class

```javascript
class LifeCycle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "Mary",
      surname: "Poppins",
      width: window.innerWidth,
    };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleSurnameChange = this.handleSurnameChange.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount() {
    //initial render
    document.title = this.state.name + " " + this.state.surname;
    //subscribe event
    window.addEventListener("resize", this.handleResize);
  }
  componentDidUpdate() {
    //every update
    document.title = this.state.name + " " + this.state.surname;
  }
  componentWillUnmount() {
    //unsubscribe event
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize() {
    this.setState({
      width: window.innerWidth,
    });
  }

  handleNameChange(e) {
    this.setState({
      name: e.target.value,
    });
  }

  handleSurnameChange(e) {
    this.setState({
      surname: e.target.value,
    });
  }
  render() {
    return (
      <>
        <h1>Made with LifeCyle in Class</h1>
        <h1>Name</h1>
        <input value={this.state.name} onChange={this.handleNameChange} />

        <h1>Surname</h1>
        <input value={this.state.surname} onChange={this.handleSurnameChange} />
        <h1>Width</h1>
        <span>{this.state.width}</span>
      </>
    );
  }
}

export default LifeCycle;
```

#### Hooks in Function

```javascript
import React, { useState, useEffect } from "react";

function Hooks(props) {
  const [name, setName] = useState("Mary");
  const [surname, setSurname] = useState("Poppins");

  useEffect(() => {
    document.title = name + " " + surname;
    //initial render and every update
  });

  //subscribing window event and unsubscribing
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    //opitional when using useEffect -  return : clean up
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  function handleNameChange(e) {
    setName(e.target.value);
  }
  function handleSurnameChange(e) {
    setSurname(e.target.value);
  }

  return (
    <>
      <h1>Made with Hooks</h1>
      <h1>Name</h1>
      <input value={name} onChange={handleNameChange} />
      <h1>Surname</h1>
      <input value={surname} onChange={handleSurnameChange} />
      <h1>Width</h1>
      <span>{width}</span>
    </>
  );
}
export default Hooks;
```

###### 참고

[리액트 hook 동영상](https://www.youtube.com/watch?v=dpw9EHDh2bM&feature=youtu.be)
[리액트 hook 공식 문서](https://ko.reactjs.org/docs/hooks-intro.html)

리액트 hook 동영상을 기반으로 작성였습니다.
