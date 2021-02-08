# **정규표현식이란?**

문자열에 나타나는 특정 문자 조합과 대응시키기 위해 사용되는 패턴입니다.

<br>

# **정규표현식 테스트 사이트**

[regex101](https://regex101.com/)

[regexr](https://regexr.com/)

[regexper](https://regexper.com/)

<br>

# **JavaScript 정규식 생성**

두 가지 생성 방식이 있고, 재할당이 가능합니다.

> ## **생성자 함수 방식**

```js
const regexp1 = new RegExp("^abc");
// new RegExg(표현식)
```

`RegExp` 생성자에 매개변수로 문자열 패턴을 선언합니다.

정규식 실행 시점에 컴파일되므로, 정규식을 동적으로 변화시키고 싶을 때 편리합니다.

<br>

> ## **리터럴(Literal) 방식**

```js
const regex = /abc/;
// /표현식/
```

리터럴 방식은 문자열을 `/` 로 감싸게 됩니다.

스크립트가 로드될 때마다 컴파일되므로, 정규식이 변하지 않는다면 리터럴 방식으로 선언하는 것이 성능적으로 더 좋습니다.

<br>

> ## **재할당 (Re-compile)**

```js
let regexp1 = /ipsum/g;
regexp1 = /lorem/i;

console.log(regexp1);
// /lorem/i

const regexp2 = /ipsum/g;
regexp2 = /lorem/i; // TypeError
```

상수가 아닌 변수로 선언했을 때, 사용 중인 정규식을 재할당할 수 있습니다.

<br>

# **자바스크립트 메소드**

JavaScript에는 정규표현식에서 제공하는 다양한 메소드들이 있습니다.

| 제목       | 내용                                                            |
| ---------- | --------------------------------------------------------------- |
| `exec`     | 일치하는 하나의 정보(Array) 반환                                |
| `test`     | 일치 여부(Boolean) 반환                                         |
| `match`    | 일치하는 문자열의 배열(Array) 반환                              |
| `search`   | 일치하는 문자열의 인덱스(Number) 반환                           |
| `replace`  | 일치하는 문자열을 대체하고 대체된 문자열(String) 반환           |
| `split`    | 일치하는 문자열을 분할하여 배열(Array)로 반환                   |
| `toString` | 생성자 함수 방식의 정규식을 리터럴 방식의 문자열(String)로 반환 |
|            |

## **메소드 사용하기**

```js
let name = "Sumin Son";
let namePattern = /Sumin/;

namePattern.test(name); // true
namePattern.exec(name); // ["Sumin"]
name.match(namePattern); // ["Sumin]
```

- `test()`는 boolean을 반환합니다.
- `exec()`는 문자열의 시작 부분을 가지는 배열을 반환합니다.<br>
  검색된 내용이 없으면 아무 것도 반환하지 않습니다.
- `match()`는 검색된 문자열 부분의 배열을 반환합니다. <br>
  마찬가지로 검색된 내용이 없다면 아무 것도 반환하지 않습니다.

## **exec와 match의 차이점**

- 실행 인자에서, `exec()`는 문자열을 받고, `match()`는 정규식 패턴을 받습니다. 서로 문자열과 패턴의 위치가 반대입니다.

- match는 string에서 제공하기 때문에 name.match()와 같이 사용합니다. <br>
  => [String.prototype.match()](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/String/match)

- exec() 함수는 `/g` 옵션을 붙이더라도 일치하는 첫 번째 값만 반환합니다.

```js
let name = "Sumin Son Sumin";
let namePattern = /Sumin/g;

namePattern.exec(name); // "Sumin"
name.match(namePattern); // [ "Sumin", "Sumin" ]
```

그러나 캡쳐 구문`()`과 함께 쓰이면 배열로 반환을 해줍니다.

```js
let name = "Sumin Son Sumin";
let namePattern = /(Sumin)/;

namePattern.exec(name);
```

<br>

# **이스케이프(Escape) 문자**

정규식 문자열은 특수문자를 포함할 수 있고, 몇몇 특수문자들은 특수한 용도가 있기 때문에 `\` 를 앞에 붙여주어서 문자 그대로 해석되게끔 만들어야 합니다.

```js
// 특수문자를 문자 그대로 해석
const regex1 = /\*/;
const regex2 = /\?/;
const regex3 = /\./;
const regex3 = /\\/;
```

<br>

# **자주 사용하는 플래그(Flags)**

JavaScript에서 정규식을 생성할 때 고급 검색을 위한 옵션을 설정할 수 있도록 플래그를 지원합니다.

생성자 방식인지, 리터럴 방식인지에 따라 설정 방식에 차이가 있습니다.

```js
const regex1 = /abc/afgls;
const regex2 = new Regex(/abc/, flags);
```

- `g` : 전역 검색(global)

전역 검색 플래그가 없으면 최초 검색만 반환하고, 있으면 모든 검색 결과를 배열로 반환합니다.

```js
// `a`가 두 개 포함된 문자열
const test = "abcabc";

// `g` 플래그 없이는 최초에 발견된 문자만 반환
test.match(/a/);
// "a"

// `g` 플래그와 함께라면 모든 결과가 배열로 반환
test.match(/a/g);
// ["a", "a"]
```

<br>

- `m` : 줄바꿈 검색(multiline)

여러 줄의 문자열이 실제로 여러 줄로 인식되어야 할 때 사용됩니다.

입력 시작(^) 앵커와 입력 종료(\$) 앵커가 전체 문자열이 아닌 각 줄 별로 대응됩니다.

```js
// 줄바꿈이 포함된 문자열
const test = `abc
abc`;

// 줄바꿈을 인식하지 못합니다.
test.match(/$/g);
// [""]

// 각 줄 별로 시작과 끝을 인식할 수 있습니다.
test.match(/$/gm);
// (2) ["", ""]
```

- `i` : 대소문자 구분 안함(case Insensitive)

정규식은 기본적으로 대소문자를 구분하지만 `i` 플래그를 통해 대소문자를 구분하지 않을 수 있습니다.

```js
const test = "abcABC";

test.match(/a/gi);
// (2) ["a", "A"]
```

이 외의 플래그들은 [여기](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/%EC%A0%95%EA%B7%9C%EC%8B%9D#%ED%94%8C%EB%9E%98%EA%B7%B8%EB%A5%BC_%EC%82%AC%EC%9A%A9%ED%95%9C_%EA%B3%A0%EA%B8%89%EA%B2%80%EC%83%89)에서 확인할 수 있습니다.

<br>

# **메타 문자(meta character)**

정규식 엔진에게 어떠한 단일 문자를 매칭할 지 알려주는 역할의 특수문자입니다.

<br>

> ## **문자 그룹(`[]`, `[^]`)**

```js
// bad와 bed를 모두 검색
const str = "bad and bed";

str.match(/b[ae]d/g);
// ["bad", "bed"]
```

중괄호로 감싸인 문자 그룹은 중괄호 내부의 문자열 중 하나 이상 일치하는 경우를 의미합니다.

중괄호 내부의 특수문자는 메타 문자로 인식되지 않아서 따로 이스케이프를 해주지 않아도 됩니다.

```js
// 특수문자
const str = "!?@#$%^&";

// 중괄호 내부의 특수문자는 리터럴 특수문자로 인식
str.match(/[?!.]/g);
// ["!", "?"]
```

연속된 문자열을 검색할 때, **범위 지정 구문(`-`)** 를 이용해서 간편하게 표현할 수 있습니다.

```js
// 같은 정규식
const regex1 = /[A-Z]/;
const regex2 = /[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/;

// 같은 정규식
const regex3 = /[0-9]/;
const regex4 = /[0123456789]/;

// 한글 전범위 표현
const regex5 = /[가-힣]/;
```

위의 내용이 (긍정) 문자 그룹이었다면, **부정 문자 그룹([^])**도 있습니다.

중괄호의 시작에 캐럿(`^`)을 쓰면 중괄호 내부를 제외한 문자열을 검색합니다.

```js
// 숫자와 문자가 섞인 문자열
const str = "2021 02 04 Thursday";

// 숫자만 검색
str.match(/[0-9]/g);
// ["2", "0", "2", "1", "0", "2", "0", "4"]

// 숫자를 제외하고 검색
str.match(/[^0-9]/g);
// [" ", " ", " ", "T", "h", "u", "r", "s", "d", "a", "y"]
```

<br>

> ## **캡쳐링 그룹(`()`)**

캡쳐링 그룹은 정규식 안의 작은 표현식과 같고, 특수 문자를 그대로 사용할 수 있습니다.

```js
let phonePattern = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
```

이렇게 번호 패턴을 체크하는 것에 있어서 () 캡쳐 그룹을 통해 어떻게 나뉘는지 확인할 수 있습니다.

<br>

> ## **10진수 문자(`\d`, `\D`)**

문자 그룹(`[0-9]`)와 동일한 역할입니다. 대문자 `\D`를 사용하면 그 **역집합**을 검색하게 됩니다.

```js
const str = "2021 02 04 Thursday";

// 숫자만 검색
str.match(/\d/g);
// ["2", "0", "2", "1", "0", "2", "0", "4"]

// 숫자를 제외하고 검색
str.match(/\D/g);
// [" ", " ", " ", "T", "h", "u", "r", "s", "d", "a", "y"]
```

<br>

> ## **단어 문자(`\w`, `\W`)**

영어 대소문자와 숫자, 그리고 언더스코어(_)를 포함하는 그룹(`[0-9a-zA-Z_]`)과 동일한 역할을 합니다.

대문자`\W`를 사용하면 그 역집합을 나타냅니다.

```js
const str = "2021 02 04 Thursday";

// 단어만 검색
str.match(/\w/g);
// ["2", "0", "2", "1", "0", "2", "0", "4", "T", "h", "u", "r", "s", "d", "a", "y"]

// 단어가 아닌 것만 검색
str.match(/\W/g);
// [" ", " ", " "]
```

<br>

> ## **공백 문자(`\s`, `\S`)**

공백 문자 \s는 스페이스, 탭, 폼피드, 줄 바꿈 문자 등을 포함한 하나의 공백 문자에 해당합니다.

대문자 \S 를 사용해 역집합을 검색합니다.

```js
const str = "2021 02 04 Thursday";

// 공백만 검색
str.match(/\s/g);
// [" ", " ", " "]

// 공백이 아닌 것만 검색
str.match(/\S/g);
// ["2", "0", "2", "1", "0", "2", "0", "4", "T", "h", "u", "r", "s", "d", "a", "y"]
```

<br>

> ## **임의의 문자(`.`)**

개행 문자를 제외한 모든 단일 문자를 매칭합니다.

```js
str.match(/./g);
// ["2", "0", "2", "1", " ", "0", "2", " ", "0", "4", " ", "T", "h", "u", "r", "s", "d", "a", "y"]
```

<br>

> ## **앵커(`^`, `$`)**

**메타 문자**들이 문자열 일치와 관련되었다면, **앵커**는 문자열이 어떤 위치에서 동작할지를 제한합니다.

**위치만 제한할 뿐 검색 결과에는 포함이 안됩니다.**

크게 패턴 시작 앵커와 패턴 종료 앵커가 있습니다.

```js
const str = "aaaa";

// 첫 번째 `a`만 반환
str.match(/^a/);
// "a"

// 마지막 `a`만 반환
str.match(/a$/);
// "a" (index: 3)
```

시작 앵커(`^`)는 해당 정규식이 줄의 시작 부분인지를 확인하는 역할을 합니다. 보통 정규식의 가장 앞에 붙여서 사용합니다.

종료 앵커(`$`)는 해당 정규식이 줄의 마지막 부분인지를 확인하는 역할을 합니다. 보통 정규식의 가장 마지막에 붙여서 사용합니다.

**부정 문자 그룹에서의 캐럿과의 차이점은 중괄호에 포함 여부입니다.**

<br>

# **수량자**

메타 문자들이 n회 반복됨을 나타냅니다. 문자의 오른쪽에 수량자가 위치합니다.

정규식은 기본적으로 **탐욕 알고리즘**을 따르기 때문에, 수량자에 여러 패턴이 매칭될 때에 가능한 길고 많은 패턴을 반환합니다.

```js
const str = "abc";

str.match(/abc?/);
// "abc"
```

c에 옵셔널(`?`) 플래그를 주어서 ab, abc라는 두 가지 값을 확인하게 됩니다.
하지만 탐욕적인 정규식은 ab와 abc 중에 더 긴 문자열인 abc를 반환하게 됩니다.

수량자 뒤에 `?`를 한번 더 붙임으로써 최대한 짧고 적은 값을 반환하게 할 수 있습니다.

이것을 **게으른 수량자(Lazy Quantifier)** 라고 합니다.

```js
str.match(/abc??/);
// "ab"
```

<br>

# Reference

[MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/%EC%A0%95%EA%B7%9C%EC%8B%9D)

[JAVASCRIPT.INFO](https://ko.javascript.info/regular-expressions)

[blog](https://heropy.blog/2018/10/28/regexp/)

[blog](https://wormwlrm.github.io/2020/07/19/Regular-Expressions-Tutorial.html)
