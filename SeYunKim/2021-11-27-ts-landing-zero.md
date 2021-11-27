# Vue에서 TypeScript로 Timer의 Leading Zeros를 구현해보자.

> Vue에서 Javascript로 타이머를 구현해야 할 일이 생기면서 Leading Zeros까지 구현해야 했습니다. 실제 타이머의 포맷은 `00:00:00` 과 같이 나와야 하는 상황이였습니다. 이와 관련해서 어떻게 구현했는지 간략하게 공유해보려고 합니다.

## 주의사항

-   해당 코드는 Vue2 + Composition API를 쓴다는 전제하에 작성되었습니다.
-   관련 코드를 제외한 나머지에 대한 코드는 작성하지 않습니다.

## Timer 구현

```
import { computed } from '@vue/composition-api';

const useTimer = () => {
  const timer = ref<number>(0);
  const hour = computed(() => Math.floor(timer.value / (60 * 60)));
  const minute = computed(() => Math.floor((timer.value - hour.value * (60 * 60)) / 60));
  const second = computed(() => Math.floor(timer.value % 60));
  const stringifiedTimer = computed(() => `${hour.value}:${minute.value}:${second.value}`);

  const start = (baseTime: Date) => {
    const now = new Date();
    timer.value = Math.floor(now.valueOf() - baseTime.valueOf()) / 1000);

    setInterval(() => {
      timer.value++;
    }, 1000);
  };

  return { start, timer: stringifiedTimer };
};

start(new Date());
```

-   위 코드에서는 hour, minute, second를 각각 계싼해 setInterval()을 통해 1초마다 timer를 1씩 증가시켜주도록 하였습니다.
-   실제 timer는 초단위로 구성되어있습니다.
-   현 상태에서는 strungifiedTimer를 출력한다면 `00:00:00` 포맷이 아닐겁니다.

### TypeScript에서의 Date 연산

-   기본적으로 Date - Date를 지원하지 않습니다. 따라서 해당 Date를 숫자로 변환해주면 되는데, 숫자로 변환하면 Millisecneds가 나오게 됩니다. 따라서 위에서도 `/1000` 을 해준 이유가 다음과 같습니다.
-   따라서 숫자로 변환해주면 됩니다.

```
const durateTime = +(new Date()) - +(new Date("2013-02-20T12:01:04.753Z"));
```

-   위와 같이 `+` 를 이용해 숫자로 변환하면 되지만 이건 가독성이 낮습니다.

```
const durateTime = new Date().valueOf() - new Date("2013-02-20T12:01:04.753Z").valueOf();
```

-   따라서 위와 같이 `valueOf()` 메서드를 사용해서 나타내면 좋습니다.

## padStart() 함수를 이용해 포맷을 맞춰보자.

```
const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');
```

### String.prototype.padStart(targetLength, \[padString\])

-   현재 문자열의 시작을 다른 문자열로 채워, 주어진 길이를 만족하는 새로운 문자열을 반환하는 메서드입니다.
-   채워넣는것은 문자열의 시작부터 적용됩니다.

```
'abc'.padStart(10);         // "       abc"
'abc'.padStart(10, "foo");  // "foofoofabc"
'abc'.padStart(6,"123465"); // "123abc"
'abc'.padStart(8, "0");     // "00000abc"
'abc'.padStart(1);          // "abc"
```

-   targetLength : 목표 문자열의 길이이며, 문자열의 길이보다 작다면 채워넣지 않고 그대로 반환합니다.
-   padString : 채워 넣은 문자열로 기본값은 공백(" ") 입니다.
-   해당 메서드는 ECMAScript 2017부터 지원한 메서드로 지원하지 않는다면 아래 코드를 구현하면 됩니다.

```
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}
```

### String.prototype.padEnd()

-   위의 padStart와 반대로 끝에서 부터 채우는 함수이다.

## 참고자료

[String.prototype.padStart()](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/String/padStart)

[How can I calculate the time between 2 Dates in typescript](https://stackoverflow.com/questions/14980014/how-can-i-calculate-the-time-between-2-dates-in-typescript)
