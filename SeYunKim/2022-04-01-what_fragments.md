# <> Fragments? </>란?

React 16.2부 터 Fragements를 지원해 DOM에 노드를 추가하지 않고 자식 목록을 그룹화 할 수 있습니다.

```java
render() {
  return (
    <>
      <ChildA />
      <ChildB />
      <ChildC />
    </>
  );
}
```

## Fragments란?

일반적으로 자식 목록을 반환하는 용도로 사용합니다.

이전에는 아래와 같이 `div` 또는 `span` 을 사용해 자식 요소를 래핑하였습니다.

```java
render() {
  return (
    // Extraneous div element :(
    <div>
      Some text.
      <h2>A heading</h2>
      More text.
      <h2>Another heading</h2>
      Even more text.
    </div>
  );
}
```

위와 같은 방식에서 16.0 버전에서는 요소 배열을 반환하는 방식을 지원하기도 하였습니다.

```java
render() {
 return [
  "Some text.",
  <h2 key="heading-1">A heading</h2>,
  "More text.",
  <h2 key="heading-2">Another heading</h2>,
  "Even more text."
 ];
}
```

그러나 이 방식이 불편한 점이 많이 나오게 됩니다.

1. 자식들을 쉼표로 구분해야 합니다.
2. React의 키 경고를 방지 하기 위해 키가 있어야 합니다.
3. 문자열을 따옴표로 묶어야 합니다.
4. 직관적이지 않습니다.

위와 같은 단점을 해결하기 위해 Fragments가 나오게 되었습니다.

```java
render() {
  return (
    <Fragment>
      Some text.
      <h2>A heading</h2>
      More text.
      <h2>Another heading</h2>
      Even more text.
    </Fragment>
  );
}
```

## JSX Fragment Syntax

Fragment를 선언하기 보다는 슈가를 제공합니다.

```java
render() {
  return (
    <>
      Some text.
      <h2>A heading</h2>
      More text.
      <h2>Another heading</h2>
      Even more text.
    </>
  );
}
```

`실제 요소를 추가하지 않는다` 라는 의미를 담기 위해 `<></>` 방식을 사용하였습니다.

## keyed Fragment

`<></>` 는 키 속성을 포함하고 있지 않습니다. 키 속성을 사용하기 위해서는 `Fragment` 를 직접 사용하여야 합니다.

```java
render() {
  return (
    <>
      Some text.
      <h2>A heading</h2>
      More text.
      <h2>Another heading</h2>
      Even more text.
    </>
  );
}
```

## 지원 사양

1. Babel v7.9.9-beta.31 이상
2. Typescript 2.6.2
3. flow-bin 0.59
4. Prettier 1.9
5. EsLint 3.x

## 출처

**[React v16.2.0: Improved Support for Fragments](https://reactjs.org/blog/2017/11/28/react-v16.2.0-fragment-support.html)**
