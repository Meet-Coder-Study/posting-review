# [Vue 기초] Directive와 인스턴스 옵션

## 개요

1. Directive
2. Vue 인스턴스 옵션

## 1. Directive란?

- HTML 태그에 들어가는 속성이다.
- `v-` 라는 접두사가 붙는다.
- 대표적인 디렉티브: `v-bind, v-model, v-once, v-for, v-if, v-else, v-else-if, v-text, v-on`

### v-bind

- 뷰 인스턴스, 데이터, 이벤트를 바인딩할 때
- 하위 컴포넌트에 데이터를 전달할 때
- 사용 예시

```html
// 전체 표기
<a v-bind:href="url"></a>
<div v-bind:data="datas"></div>

// 생략 표기
<a :href="url"></a>
<div :data="datas"></div>
```

### v-model

- 사용자에게 입력을 받을 때 뷰 데이터 속성에 자동으로 연결할 때
- 사용 예시
  입력할 때마다 data의 id 값이 변한다.

```jsx
<input v-model="id">

new Vue({
  data: {
    id: ""
  }
})
```

### v-once

- 처음 데이터의 값을 계속해서 사용하고 싶을 때
- 데이터의 값이 변경되어도 처음 값으로 유지되어 렌더링된다.

### v-for

- 배열, 객체와 같은 여러 데이터를 같은 형태로 렌더링할 때
- 사용 예시

  데이터가 배열이라면 두 번째 인자로 index를, 객체라면 객체명을 받아 와 사용할 수도 있다.

```jsx
<ul id="example-1">
  <li v-for="item in items">{{ item.message }}</li>

  // 데이터가 배열일 때
  <li v-for="(item, index) in items">{{ item.message }} / {{ index }}</li>

  // 데이터가 객체일 때
  <li v-for="(item, name) in items">{{ item.message }} / {{ name }}</li>
</ul>
```

### v-if, v-else-if, v-else

- 특정 상황에서 렌더링을 진행할지 말지 Boolean 값으로 정해 줄 때
- v-if 를 쓴 후에는 `v-else-if나 v-else`를 사용해야 하며 속성들은 떨어져 있으면 안 된다. 예로, v-if와 v-else 사이에 다른 태그가 있으면 제대로 실행되지 않는다.
- 참고: 단순히 어떤 태그를 보여줄지 말지 결정하는 것이라면 `v-show` 를 사용하면 된다.
- 사용 예시

  v-for로 데이터가 반복되는데 특정 인덱스의 데이터만 다르게 렌더링되게 한다.

```html
<ul id="example-1">
  <li v-for="(item, index) in items" v-if="index >= 3">{{ item.message }} - 3 이상입니다.</li>
  <li v-for="(item, index) in items" v-else>{{ item.message }} - 3 미만입니다.</li>
</ul>

// 에러 상황
<ul id="example-1">
  <li v-for="(item, index) in items" v-if="index >= 3">{{ item.message }} - 3 이상입니다.</li>
  <img :src="imgUrl" />
  <li v-for="(item, index) in items" v-else>{{ item.message }} - 3 미만입니다.</li>
</ul>
```

### v-text

- v-text를 사용한 엘리먼트의 textContent를 해당 데이터로 업데이트할 때
- {{ }} 형태로 사용하는 것과 같다.
- 사용 예시

  두 예시는 같다.

```html
<span v-text="msg"></span> <span>{{ msg }}</span>
```

### v-on

- 엘리먼트에 이벤트 리스너 메소드를 연결할 때 기본 DOM 이벤트를 뒤에 붙여 사용한다.
- v-on:click를 기본 형태로 하고, @click 으로 축약해서 사용할 수도 있다.
- JS에서 이벤트를 제어할 때 사용하는 `preventDefault와 stopPropagation`는 v-on에서 제공하는 `@click.prevent, @click.stop`과 같은 수식어를 사용한다.
- 사용 예시

```html
<button v-on:click="increase">+</button>
<button v-on:click.stop="increase">STOP</button>
<button @click="decrease">-</button>
```

## 2. Vue 인스턴스 옵션

### data

- 사용될 데이터를 객체를 반환하는 함수 형태로 작성한다.
- template 안에서 {{ id }} 와 같은 형태로 사용한다.

```html
// template
<span>{{ id }} {{ pw }}</span>

// script data() { return { id: "", pw: "" }; },
```

### props

- 데이터를 하위 컴포넌트로 전달하기 위한 옵션이다.
- HTML에서는 `kebab-case`를, JS에서는 `camelCase`를 사용한다.
- `props`에 들어갈 수 있는 형태는 문자열 배열과 객체이다.
  - **배열**은 v-bind를 사용해 props의 이름을 저장하고 거기에 데이터를 담아 사용한다.
  - **객체**는 데이터의 타입을 지정해 체크하도록 하거나 더 나아가서 default, validator 등으로 추가적인 검사를 진행할 수 있다.

```jsx
// 배열
props: ['myProps', 'myCar']

// 객체
props: {
  myProps: string,
  myCar: {
	type: Number,
	default: 0,
	required: true,
	validator: (value) => value >= 0
  }
}
```

### computed

- Vue에서는 계산되는 부분이 html 안에 있는 것을 권장하지 않고 있다. 대신에 Vue의 옵션인 `computed` 안에 계산 로직을 작성해 사용할 수 있다.

```html
<p>{{ reverseMessage }}</p>

computed: { reverseMessage: () => message.split('').reverse().join('') }
```

### watch

- 특정 데이터의 변화를 감지해 자동으로 특정 로직을 수행해 주는 옵션이다.
- computed 옵션이 간단한 연산에 적합하다면 watch는 데이터 호출과 같이 시간이 많이 소모되는 비동기 처리에 적합하다.
- watch 속성으로 사용 가능한 경우
  1. methods를 매칭하여 사용
  2. `handler()`와 `immediate`(초기 실행 여부) 속성 정의 가능

```jsx
watch: {
  message: (value, oldValue) => console.log(value, oldValue);
}
```

### methods

- Vue 인스턴스에 추가해 사용할 메소드를 **기능 단위**로 작성하는 옵션이다.

```html
<button @click="updateUserInfo">Update</button>

methods: { updateUserInfo() { this.id = 'choisohyun'; this.pw = 'pw'; } }
```

### model

- `v-model`을 사용할 때 **prop, 이벤트**를 커스터마이징할 수 있도록 하는 옵션이다.
- 일반적으로 v-model을 사용할 때 value를 보조 변수로 사용하는데, 일부 입력 타입이 다른 목적으로 value로 사용하게 되면 충돌이 날 수 있다. 이런 충돌을 피하기 위해 사용한다.

```jsx
model: {
  prop: 'checked',
  event: 'change'
},
// prop을 checked로 지정했기 때문에 value 대신 checked를 사용해 충돌을 피합니다.
```

### mixins

- 여러 컴포넌트에서 공통으로 사용하는 로직, 기능을 재사용 할 수 있도록 하는 옵션이다.
- `data, methods, created` 와 같은 옵션을 재사용 할 수 있다.

```jsx
<script>
import { TableMixin } from './mixins.js';

export default {
	mixins: [TableMixin],
	methods: //...
}
</script>
```

### life cycle

- `created`: 이벤트와 데이터 등이 초기화되고 화면에 주입된다. 아직 화면이 나타나기 전이다.
- `mounted`: 화면이 값을 가지고 나타나게 된다.
- `updated`: 데이터가 변경되고 화면이 재랜더링된다.
- `destroyed`: 컴포넌트, 인스턴스, 디렉티브 등이 모두 해제된다.

위의 대표 라이프 사이클에 before 키워드를 붙이면 해당 사이클이 일어나기 전을 감지하는 것이다.

일어나는 시점이 화면이 구성되는 라이프 사이클에 있다면 함수를 만들어서 아래와 같은 형태로 실행시킬 수 있다.

```jsx
created: () => this.fetchData();
```

## 참고

- [https://kr.vuejs.org/](https://kr.vuejs.org/)
- [https://joshua1988.github.io/vue-camp/](https://joshua1988.github.io/vue-camp/)
- [https://medium.com/@hozacho/맨땅에-vuejs-003-vuejs-directive-v-bind-a4844574e6ae](https://medium.com/@hozacho/%EB%A7%A8%EB%95%85%EC%97%90-vuejs-003-vuejs-directive-v-bind-a4844574e6ae)
- [https://bamdule.tistory.com/83](https://bamdule.tistory.com/83)
- [https://velopert.com/3044](https://velopert.com/3044)
- [http://hong.adfeel.info/frontend/계산된-속성computed-감시자watch/](http://hong.adfeel.info/frontend/%EA%B3%84%EC%82%B0%EB%90%9C-%EC%86%8D%EC%84%B1computed-%EA%B0%90%EC%8B%9C%EC%9E%90watch/)
