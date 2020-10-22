# 빌드 에러 "window is not available..." 해결법

개츠비로 블로그를 개발하면서 아래의 당황스러운 에러를 맞닥뜨렸다. `gatsby develop` 으로 실행했을 땐 전혀 문제가 없던 코드였는데, `gatsby build` 로 빌드했을 때만 발생했기에 더 당황스러웠다.

```zsh
ERROR #95312

"window" is not available during server side rendering.
See our docs page for more info on this error: https://gatsby.dev/debug-html

  4 | const useMenu = ({ navRef, curtainRef, listRef, device }) => {
  5 |   const [toggle, setToggle] = useState(false);
> 6 |   const mql = window.matchMedia(`(max-width: ${device.sm})`);
    |               ^
  7 |
  8 |   const onClickHandler = () =>
  9 |     toggle === true ? setToggle(false) : setToggle(true);


  WebpackError: ReferenceError: window is not defined
```

## 원인 파악

[공식 사이트](https://www.gatsbyjs.com/docs/debugging-html-builds/)와 여러 관련 포스트들을 통해 해결법을 검색해봤다.

Gatsby의 문제가 아니고, 리액트에서 서버 사이드 렌더링에 대한 문제였다. `window`, `document` 같은 브라우저 전역 객체는 초기 Gatsby가 빌드를 시도할 때, Node.js는 해당 객체들을 가지고 있지 않기 때문에 참조할 수 없어 생기는 문제였다.

## 해결법

### 첫 번째: typeof

브라우저 코드를 조건문으로 감싸주면 된다.

```js
if (typeof window !== "undefined") {
  // 코드 작성
}
```

`typeof` 를 작성하지 않으면, `ReferenceError: window is not defined` 에러가 나오기 때문에 `typeof` 를 앞에 붙여줘야만 한다. window 객체가 없다면 Node.js는 `undefined` 를 반환한다. 위의 에러가 발생한 코드의 경우, 아래처럼 변경하면 잘 작동한다.

```js
const useMenu = ({ navRef, curtainRef, listRef, device }) => {
  let mql = null;
  if (typeof window !== "undefined") {
    mql = window.matchMedia(`(max-width: ${device.sm})`);
  }
  /* ... */
}
```

### 두 번째: useEffect

`useEffect` 는 렌더링 시에 실행되기 때문에, 초기 서버 빌드 시 `useEffect` 내부 코드는 실행되지 않는다. `useEffect` 내부로 에러가 발생하는 코드를 옮겨주면 해결된다.

```js
const useMenu = ({ navRef, curtainRef, listRef, device }) => {
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${device.sm})`);
  })
  /* ... */
}
```

에러가 발생하는 코드가 여러 곳에서 사용된다면 첫 번째 해결법처럼 작성해줘도 괜찮다.

```js
const useMenu = ({ navRef, curtainRef, listRef, device }) => {
  let mql = null;
  useEffect(() => {
    mql = window.matchMedia(`(max-width: ${device.sm})`);
  })
  /* ... */
}
```
