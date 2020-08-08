# ESLint와 Prettier에 대해 알아보자.(with Vue ESLint 설정)

- 코딩을 할 때 컨벤션이 굉장히 중요하다는 것은 다들 알고 있을 것이다.
- 이번에는 JavaScript 컨벤션 및 컨벤션을 편안하게 지킬 수 있는 방법(자동화)을 소개해보려고 한다.

- 유명한 자바스크립트 컨벤션 종류
    - [NHN Ent - Toast UI](https://ui.toast.com/fe-guide/ko_CODING-CONVENSION/)
    - [Airbnb](https://github.com/tipjs/javascript-style-guide)
    - [Google](https://google.github.io/styleguide/jsguide.html)

## eslint

- 여기서 lint란 소스 코드에 문제가 있는지 탐색하는 작업을 의미하고, linter는 이 작업을 도와주는 소프트웨어이다.
- 자바스크립트 컴파일 과정이 없는 인터프리터 언어로 런타임 에러가 발생할 확률이 높기 때문에 사전에 에러를 최대한 잡아주는 것이 중요하다.
- 이때 자바스크립트진영의 오픈소스로 정적 분석 도구로 eslint를 많이 사용된다. 정적 분석 도구란 코드를 분석해서 문법 오류, 안티 패턴 등을 찾아 일관된 코드 스타일로 작성할 수 있게 하는 것이다.
- 위에서 코딩 컨벤션을 공개한 Airbnb나 Goolge에서 스타일 가이드를 제공하기 때문에 서비스 로직에 집중하여 개발하기 쉽다.

### 설정하기

```
$ cd <project-folder>
$ npm init -y // 프로젝트 생성
$ npm install eslint // 설치
$ node_modules/.bin/eslint --init / 초기화
```

초기 설치 시 몇가지 질문들이 나오는데, 본인의 상황에 맞게끔 설정해주면 됩니다.

![https://techcourse-storage.s3.ap-northeast-2.amazonaws.com/2020-05-13T13%3A13%3A23.602image.png](https://techcourse-storage.s3.ap-northeast-2.amazonaws.com/2020-05-13T13%3A13%3A23.602image.png)

이렇게 설치를 마치고 나면 프로젝트의 루트 경로에 **`.eslintrc.js`**라는 파일이 생성된 것을 볼 수 있습니다.

```
module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: "eslint:recommended",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {}
};

```

- 여기서 중점적으로 봐야 하는 부분은 `extneds`와 `rules` 입니다.
    - extends : ESLint의 설정을 확장해서 사용할 때 사용합니다. 초기값은 ESLint에서 추천하는 규칙들이 적용된 `eslint:recommended` 이지만, 실제 프로젝트에서는 airbnb나 google에서 제안하는 방식을 많이 사용합니다.
    - rules : 기존의 rule을 덮어쓰고자 할 때 사용하는 곳으로 커스텀하게 규칙을 정할 수 있습니다.
- [airbnb eslint github](https://github.com/airbnb/javascript)
- [google eslint github](https://github.com/google/eslint-config-google)

- [eslint document](https://eslint.org/)
- [eslint import plugin](https://github.com/benmosher/eslint-plugin-import)

## Vue Style Guide에 맞춰 eslint 설정하기

- 이번 프로젝트에서 Vue를 사용하게 되어서 Vue Style Guide에 맞춰서 ESLint를 설정하는 방법을 소개하려고 한다. ([캡틴판교님 글](https://joshua1988.github.io/vue-camp/format/official.html#eslint%EC%97%90-vue-js-%EA%B3%B5%EC%8B%9D-%EC%8A%A4%ED%83%80%EC%9D%BC-%EA%B0%80%EC%9D%B4%EB%93%9C%EB%A5%BC-%EC%A0%81%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)을 참고한다.)
- vue-eslint-plugin
- `.eslintrc.js`를 아래와 같이 수정한다.

```jsx
module.exports = {
  // ...
  extends: [
		'plugin:vue/essential',
		'airbnb-base',
		'@vue/prettier'
	],
}
```

- 아래와 같이 rules를 추가한다. rules의 value의 값은 아래와 같다.
    - off 또는 0 : 끔
    - warn 또는 1 : 경고
    - error 또는 2는 오류
- 총 5개의 `rules`를 추가했다.

```json
semi: 0,
'import/no-unresolved': 'off',
'comma-dangle': 'off',
'no-new': 0,
indent: ['error', 2],
'import/extensions': ['error', 'always']
```

- [semi](https://eslint.org/docs/rules/semi#top) : 세미콜론을 사용할지 여부

```jsx
console.log('hello world'); // X
console.log('hello world') // O
```

- [import/no-unresolved](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unresolved.md) :  require.resolve동작에 정의 된대로 로컬 파일 시스템의 모듈로 해석 할 수 있도록 합니다. // 안함
- [comma-dangle](https://eslint.org/docs/rules/comma-dangle#top) : 맨 뒤에 붙은 쉼표를 허용을 하지 않는다는 의미입니다.

```jsx
var foo = {
    bar: "baz",
    qux: "quux",
}; // X
var foo = {
    bar: "baz",
    qux: "quux"
}; // O
```

- [no-new](https://eslint.org/docs/rules/no-new) : new 키워드를 이용해 생성자를 호출했다면 변수에 담아야 한다는 의미이다.

```jsx
new Person(); // X
const person = new Person();
```

- indent: ['error', 2] : indent를 2로 설정한다는 것으며, 2가 아닌 경우 error를 발생시키라는 의미이다.

- [import/extensions](https://github.com/benmosher/eslint-plugin-import#importextensions) : 확장자 명을 명시할 것인지에 대한 설정이다.
- 확장자를 명시하고 싶다면 import/extensions: ['error', 'always']를 사용한다.
- `off`값을 준다면 확장자가 있던 없던 상관을 안쓰겠다는 의미이다.

```jsx
import App from 'app.js'// X
import App from 'app' // O
```

- 필요한 부분들은 홈페이지를 보면서 계속 추가하면 될것 같다.

## prettier

- 일종의 Code Formatter로 개발자가 작성한 코드가 정해진 코딩 스타일을 따르도록 변환해주는 도구

### Eslint와 함께 사용하기

실제 프로젝트에서는 Prettier는 단독 CLI 도구가 아닌 일반적으로 ESLint와 같은 린터(Linter)와 함께 사용합니다.

먼저 Prttier를 설치합니다.

```
$ npm i -D prettier // 설치
$ npm i -D eslint-config-prettier eslint-plugin-prettier // ESLint와 통합을 위해
```

마지막으로 해당 프로젝트의 .eslintrc.js의 extends에 설정을 추가해줍니다.

```
{
  "extends": ["plugin:prettier/recommended"]
}
```

기존에 extends 옵션에 다른 값들이 있는 경우, 기존 설정보다 우선하려면 배열의 맨 뒤에 위치시키야 합니다.

- [prettier document](https://prettier.io/docs/en/index.html)

```jsx
tabWidth: 2,
semi: true,
singleQuote: true, // eslint에서도 잡아놓을께요.
endOfLine: 'lf',
trailingComma: true,
bracketSpacing: true,
printWidth: 120,
jsxBracketSameLine: false
jsxSingleQuote: false
quoteProps: as-needed
arrowParens: always
vueIndentScriptAndStyle: false

```

- tabWidth : tab에 대한 공백 수
- semi : 세미콜론 여부
- singleQuote : 작은 따옴표
- jsxSingleQuote : jsx에서의 작은 따옴표 여부
- quoteProps
    - as-needed : 필요한 경우 개체 속성 주위에 따옴표만 추가
    - consistent : 개체에서 하나 이상의 속성에 따옴표가 필요한 경우 모든 속성을 따옴표로 묶음
    - preserve : 객체 속성에서 따옴표의 입력 사용을 존중

```jsx
const object = {
	property: true
}
const object = {
	"prperty": true
}
```

- endOfLine : 줄바꿈을 어떤 옵션으로 사용할지
    - lf : \n
    - crlf : \r\m
    - cr : \r
    - auto : 기존 줄 끝을 유지
- trailingComma
    - 마지막에 쉼표를 붙일지 여부
- bracketSpacing : 대괄호 사이의 공백

```jsx
// true
{ foo: bar }
// false
{foo: bar}
```

- printWidth : 한 줄의 길이를 설정, 코드 스타일에서는 종종 100 또는 120으로 설정되어 있다.
- jsxBracketSameLine : jsx에서 혼자 있다면 마지막 줄 끝에 넣으라는 의미(자체 닫는 요소에는 적용되지 않음)

```jsx
// true
<button
	className="prettier-class"
	id="prettier-id"
	onClick={this.handleClick}>
	Click Here
</button>

// false
<button
	className="prettier-class"
	id="prettier-id"
	onClick={this.handleClick}
>
	Click Here
</button>
```

- arrowParens : 화살표 함수를 사용할 경우 매개 변수에 괄호를 포함할지 여부
    - always : 항상 괄호를 포함하시오. ex) (x) ⇒ x
    - avoid : 가능하면 괄호를 생략 ex) x ⇒ x
- rangeStart & rangeEnd
    - 포맷팅 부분의 시작과 끝을 지정할 수 있다.
    - 0 ~ Infinity 까지 가능하다.
- Parser : 사용할 파서를 지정하는 것이다.

![eslint-prettier-1](https://github.com/ksy90101/TIL/blob/master/javascript/img/eslint-prettier-1.png?raw=true)

- filepath : 사용할 구문 분석기를 유추하는데 사용
- requirePragma : 파일 상단에 미리 정의된 주석을 작성하고 Pragma로 포맷팅 사용 여부
- insertPragma : 미리 정의된 @format marker의 사용 여부
- proseWrap : markdown 텍스트의 줄바꿈 방식
    - always : 너비를 초과하면 사용
    - never : 사용하지 않음
    - preserve : 그대로 유지
- htmlWhitespaceSensitivity : HTML 공백 감도 설정
    - css
    - strict
    - ignore :
- vueIndentScriptAndStyle : <script>와 <style> 태그를 들여 쓸지 여부입니다.

```jsx
<script>
import
			
</script>

<script>
	import
</script>
```
