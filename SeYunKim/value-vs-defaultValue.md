# React의 defaultValue vs value

## 🧐 Input의 값을 어떻게 변수에 저장할까!?

Vue.js에서는 `v-model` 이라는 속성으로 쉽게 input의 값을 변수에 저장해서 사용할 수 있었다.

React를 하면서 v-model과 같이 Input값을 어떻게 변수를 저장할 수 있을지를 찾아본 결과 defaultValue와 value 라는 속성값이 나왔고, 둘의 차이를 비교해보기로 하였다.

참고로, `onChange` 이벤트를 이용해 직접 할당을 해줘야 하는 다른 점이 있지만, 지금 글과는 주제는 조금 다르기 때문에 아래 코드만 간단히 살펴보는것으로 하겠습니다.

```tsx
const [value, setValue] = useState(initialValue);

const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value);
};

<input value={value} onChange={onChange}/>
```

위의 코드처럼, event를 이용해 실제 값을 변수에 할당해주면 된다.

## 🆚 defaultValue vs value

```tsx
interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
	defaultValue?: string | number | ReadonlyArray<string> | undefined;
}

interface AllHTMLAttributes<T> extends HTMLAttributes<T> {
	value?: string | ReadonlyArray<string> | number | undefined;
}
```

실제 type을 보면, 두개의 type은 다른 interface의 정의되어 있습니다.

이제 하나씩 살펴보도록 하겠습니다.

### 1️⃣ defaultValue란?

defaultValue는 주로 비제어 컴포넌트랑 많이 사용됩니다.

그럼 여기서 비제어 컴포넌트란? 기존의 바닐라 자바스크립트 방식을 생각하면 되는데, 우리가 폼을 제출할때 버튼을 클릭 할 때, 요소 내부의 값을 얻어왔다. 이와 유사하게 비제어 컴포넌트이해하며되고 값이 실시간으로 동기화 되지 않기 때문에 제어 컴포넌트를 사용하는것이 좋다.

아울러 비제어 컴포넌트는 `useState` 가 아닌 `ref` 를 사용해야 합니다.

```jsx
render() {
  return (
    <form onSubmit={this.handleSubmit}>
      <label>
        Email:
        <input defaultValue="example@example.com" type="email"
        	ref={this.email} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
```

### 2️⃣ value란?

value는 defaultValue와 다르게 제어 컴포넌트랑 많이 사용됩니다.

input, textarea, select 등 자체적으로 상태를 유지하고 사용자 입력을 기반으로 업데이트를 하는 것을 제어 컴포넌트라고 부릅니다. 상태 속성이 계속 유지되어야 하기 때문에 `useState` 와 사용됩니다.

아울러 값이 계속 변경되어야 하기 때문에 `onChange` 이벤트를 지정해 `setState`와 같이 값의 싱크를 맞춰줘야 합니다.

React 진영에서는 Form을 구현할 때는 `value` 를 더 권장합니다.

```jsx
class NewsletterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    	email: ''
    };
  }

  handleEmail = (e) => {
    this.setState({
    	email: e.target.value
    });
  }

  render() {
    return (
      <form>
        <label>
          Email:
          <input type="email" value={this.state.email}
          	onChange={this.handleEmail}/>
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default NewsletterForm;
```

## ⁉️ 그럼 왜 이걸 알아보게 되었는가?

개발 중에 아래와 같은 경고를 만나게 되었습니다.

```jsx
Warning: Failed prop type:
You provided a `value` prop to a form field without an `onChange` handler.
This will render a read-only field. If the field should be mutable use `defaultValue`.
Otherwise, set either `onChange` or `readOnly`.
```

onChange가 없이 value를 사용했다는 것이고, readOnly나, onChange 둘중에 하나를 사용하거나 아니면 defaultValue를 사용하라는 경고 입니다.

본인의 코드를 확인 후에 적절한 판단을 통해 해당 에러를 변경할 수 있는 방법이라고 생각이 듭니다 🙂

## 출처

[https://scriptverse.academy/tutorials/reactjs-defaultvalue-value.html](https://scriptverse.academy/tutorials/reactjs-defaultvalue-value.html)
