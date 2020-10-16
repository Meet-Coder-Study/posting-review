# Vuex로 상태관리하기

> 컴포넌트 계층이 늘어나게 되면 props만으로 전달하거나 [이벤트 버스](https://vuejs-kr.github.io/jekyll/update/2017/02/13/vuejs-eventbus/)만으로 해결되지 않는 상태 관리의 어려움이 생기게 됩니다.  
> 이번 글에서는 이런 어려움을 해결한 Vuex 라이브러리의 패턴과 메소드를 알아 보도록 하겠습니다.

## 개요

1. Vuex 아키텍처
2. Store 영역
3. Vue Component 영역

## 1. Vuex 아키텍처

Vuex는 데이터가 `단방향 흐름`으로 되어 있습니다. 이 흐름은 **Flux 아키텍처**와 비슷한 양상을 보입니다.

Vuex 아키텍처  
![vuex](./images/vuex.png)

Flux 아키텍처  
![flux](./images/flux.png)

Vue 아키텍처의 흐름에 대해 설명하겠습니다.  
먼저, Vuex의 `Store`에서 관리하는 부분은 Actions, Mutations, State입니다.  
컴포넌트에서 `Action`이 일어나면 통신을 통해 값을 `Mutation`시킵니다. 그리고 그 결과를 받아 `State`가 변경되고 변경된 값을 `컴포넌트`에서 변경시킵니다.  
설명으로는 간단해 보이지만 각각이 무슨 일을 하는지 와닿지 않을 수 있습니다. 밑에서 각각의 역할을 더 얘기하도록 하겠습니다.

## 2. Store 영역

> Store는 `new Vue.store({})` 로 생성하고, `Vue.use(Vuex)` 구문으로 전역에서 사용할 수 있습니다.

### mutations

- mutation은 변이입니다. 변이의 목적은 `상태를 변경하는 것`입니다.
- 변이 안에서 상태 변경과 관련 없는 일(비동기적인 작업 등)은 Action에서 실행되도록 합니다. 
- Store는 state를 직접 변경하지 않기 때문에 반드시 변이를 통해서 변경해야 합니다. 
- DevTools에서는 변이 전후를 스냅샷 캡쳐해 디버깅을 제공합니다.

##### 인자

- 첫 번째 인자: state - 기존의 상태
- 두 번째 인자: payload - 변이에서 필요로 하는 데이터. 즉 상태를 변경할 때 필요한 정보
```js
  mutations: {
    save(state, userInfo) {
      state.id = userInfo.id;
      state.pw = userInfo.pw;
    }
  }
```

### state

- state는 애플리케이션에서 관리하는 중요한 데이터입니다. state는 `변이를 통해서만 변경`됩니다.
- 초기값을 객체 형태로 지정하는 형태입니다.

```js
  state: {
    id: "",
    pw: ""
  },
```

### getters

- `Store에서 사용하는 computed 프로퍼티`라고 할 수 있습니다. 즉, 필수는 아니지만 사용하면 편리함을 얻을 수 있습니다.
- 여러 컴포넌트에서 사용하는 state일 경우, `getters`를 사용하면 코드의 중복을 줄일 수 있습니다.
- 아래와 같이 자주 사용하게 되는 값을 getter 내부 메소드로 정의해 사용합니다. 

```js
getters: {
  currentId(state) {
    return state.currentId;
  }
}
```


### actions

- 외부 API를 실행하고 그 결과를 변이를 통해 전달해 상태를 변화시킵니다.
- API를 호출하거나 비동기를 사용해야 할 경우가 없다면 생략해도 됩니다.

##### 인자

> 변이는 **state, payload**를 전달하지만, 액션은 **store, payload**를 전달합니다. 액션 안에서 `state, commit(), dispatch()` 모두 사용할 수 있는 것입니다.

- 첫 번째 인자: store
- 두 번째 인자: payload

```js
  actions: {
    incrementAsync ({ commit }, payload) {
      setTimeout(() => {
        commit('increment', payload)
      }, 1000)
    }
  }
```


### namespace

- Store 내의 `actions, mutations, getters`는 전역 namespace 아래로 등록됩니다. 여러 모듈에서 동일한 핸들러 이름을 사용한다면 여러 모듈에서 `같은 반응`을 하게 됩니다.
- 독립적으로 사용하길 원한다면 `namespace 옵션을 true`로 설정해 사용하면 됩니다. true로 설정하면 경로 기반으로 namespace를 등록합니다.


## 3. Vue Component 영역

### 사용하기

사용할 컴포넌트 내부에서 `this.$store`로 Store를 접근하여 내부 메소드 사용 가능합니다.

- state 접근: `this.$store.state`
- mutation 접근: `this.$store.commit('mutationName', payload)`
- getters 접근: `this.$store.getters.currentId`
- actions 접근: `this.$store.dispatch('save', payload)`

### 헬퍼 메소드

> 위와 같이 사용하기 위해서는 `this.$store`를 계속 접근해야 하기 때문에 불편함이 있습니다. 
> 이런 불편함을 줄이기 위한 컴포넌트 바인딩을 해 주는 메소드가 Vuex에 존재합니다.

##### mapState

- Vuex의 상태는 컴포넌트의 `computed 속성`에 바인딩합니다. 그 이유는 컴포넌트 수준에서 상태를 직접 변경하지 않기 위함입니다. 직접 상태를 변경시킬 수 없게 하려면 Store의 속성 중 `strict: true` 옵션을 사용하면 됩니다.
- 아래 비교 코드를 보겠습니다. 상태가 많아질 수록 위의 코드는 상태를 작성하기가 힘들어질 것입니다.

```js
  computed: {
    id: this.$store.state.id,
    pw: this.$store.state.pw,
  }
```

- state명을 배열로 하여 넣으면 state와 동일한 이름으로 값을 사용할 수 있습니다.
- 이름을 바꿔야 한다면 `Spread Operator`를 사용해 다른 이름으로 가져옵니다.

```js
  computed: mapState(['id', 'pw'])
  
  computed: {
    ...mapState({
      id2: state => state.id,
      pw2: state => state.pw
    })
  }
```

##### mapMutations

- 변이를 동일한 이름의 메소드로 자동 연결되도록 해 줍니다.
- 변이를 일으키지 않는 일반 메소드가 함께 있을 때는 `Spread Operator`를 사용합니다.
- `mapState`와 동일하게 다른 이름으로 지정할 수 있습니다.

```js
 methods: {
    updateUserInfo() {
      this.$store.commit("save", this.$data);
    },
    ...mapMutations(['save'])
 }
```

##### mapGetters

- getters와 따로 이름을 설정하지 않으면 동일한 이름의 메소드로 연결됩니다.

```js
computed: mapGetters(['currentId']),
```

##### mapActions

- 컴포넌트에서 액션을 실행시키기 위해서는 `dispatch` 메소드를 사용해야 합니다. 그 이유는 *특정 객체에서 메소드를 호출하기 위해 메시지를 전달한다*는 의미가 있기 때문입니다.

```js
methods: {
  ...mapActions(['save'])
}
```

## 참고

- [Vue.js 퀵 스타트](http://www.yes24.com/Product/Goods/45091747)
- [Vue.js 공식 사이트](https://kr.vuejs.org/v2/)
- [[vuex] Modules](https://beomy.tistory.com/88)
