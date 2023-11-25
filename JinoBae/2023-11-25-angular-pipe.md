// https://blex.me/@baealex/angular-pipe

앵귤러는 템플릿에 표기되는 데이터를 변환하는 기능을 파이프라고 부른다. 아래와 같이 사용할 수 있다.

```ts
{{ someData | somePipe }}
```

<br>

#### 기본 파이프

CommonModule에 포함된 기본 파이프

https://angular.io/api/common/CommonModule#pipes

- [AsyncPipe](https://angular.io/api/common/AsyncPipe)

```ts
promise = new Promise((resolve) => setTimeout(() => resolve('Umm... Hello!'), 1000))

{{ promise | async }}
// (1 second later) Umm... Hello!
```

- [DatePipe](https://angular.io/api/common/DatePipe)

```ts
date = new Date()

{{ date | date:'short' }}
// 2023-11-23
```

- [CurrencyPipe](https://angular.io/api/common/CurrencyPipe)

```ts
price = 100

{{ price | currency:'USD' }}
// $100.00
```

- [PercentPipe](https://angular.io/api/common/PercentPipe)

```ts
percentage = 0.15

{{ percentage | percent }}
// 15%
```

- [UpperCasePipe](https://angular.io/api/common/UpperCasePipe)

```ts
name = 'Jino Bae'

{{ name | uppercase }}
// JINO BAE
```

- [LowerCasePipe](https://angular.io/api/common/LowerCasePipe)

```ts
{{ name | lowercase }}
// jino bae
```

- [TitleCasePipe](https://angular.io/api/common/TitleCasePipe)

```ts
{{ name | titlecase }}
// Jino Bae
```

- [SlicePipe](https://angular.io/api/common/SlicePipe)

```ts
longText = "Hello, everyone. My name is Jino."

{{ longText | slice:0:10 }}
// Hello, eve
```

- [JsonPipe](https://angular.io/api/common/JsonPipe)

```ts
object = {
    name: 'Jino Bae'
}

{{ object | json }}
// { "name": "Jino Bae" }
```

<br>

#### 커스텀 파이프

파이프를 만드려면 `@Pipe` 테코레이터로 감싼 클래스를 `PipeTransform` 추상 클래스를 상속받아 `transform` 메서드를 구현해주면 된다. 파라미터는 `(value, ...args)`, 형태이고 위 기본 파이프를 보면 알겠지만 데이터가 `value`이고 뒤에 붙는 값이 각각의 `arg`가 된다.

```ts
{{ someData | somePipe : 'arg1' : 'arg2' : 'arg3' }}
```

파이프의 옵션은 다음과 같다.

###### name: `string`

파이프를 호출할 이름이다. 카멜 케이스로 작명할 것을 권장하고 있다.

```ts
import { Pipe } from '@angular/core';

@Pipe({
    name: 'myPipe',
})
export class MyPipePipe implements PipeTransform {
    transform(value: string, format: string): unknown {
        return null
    }
}
```

###### pure: `boolean`

옵셔널한 속성으로 기본값은 `true`이다. 순수 함수, 비순수 함수를 말하는 것은 알겠는데, 설명만 보고는 어떻게 동작하는지 명확히 이해하기가 어려웠다. 동작하는 형태로만 보면 pure pipe는 선언한 데이터의 참조 값에 변화가 있는 경우에만 실행되고 impure 파이프는 매 순간에 실행된다.

예를들어 아래와 같은 impure pipe가 있을 때

```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'myPipe',
    pure: false,
})
export class MyPipePipe implements PipeTransform {
    transform(value: string, format: string): unknown {
        console.log('pipe.transform()')
        return null
    }
}
```

아래와 같은 템플릿을 생성한 상황인 경우

```ts
<p>{{ state1 }}</p>
<p>{{ state2 | myPipe }}</p>
```

파이프를 바인딩하지 않은 `state1`의 값이 변화되는 시점에도 콘솔에는 `pipe.transform()`이 찍히게 된다. pure pipe의 경우에는 `state2`의 변화에만 해당 로그가 찍힌다.

정확히 말하면 pure pipe의 경우에는 컴포넌트의 렌더링을 새로하는 상황이라도 입력 데이터의 참조 값이 변하지 않았다면 해당 파이프의 transform 메서드를 실행하지 않는다. 입력에 대하여 캐싱된 결과를 출력하기 때문이다. pure pipe로 왠만하면 다 처리할 수 있을 것 같은데.. impure pipe는 어떨 때 사용하면 좋을까?

- 순수 파이프 : 같은 입력에 같은 결과가 나와도 상관없을 때 (`uppercase`, `format`)
- 비순수 파이프 : 매번 새로운 결과가 필요할 때 또는 값의 변화를 감지해야 할 때 (`sort`, `async`)

비순수 파이프가 필요한 상황을 생각하다가 기본으로 제공되는 `async` 파이프가 떠올랐다. 이 파이프를 간단하게 직접 구현해보자.

```ts
@Pipe({
    name: 'myAsync',
    pure: false
})
export class MyAsyncPipe implements PipeTransform {
    latestPromise: Promise<unknown> | null = null;
    value = null;

    transform(promise: Promise<unknown>, ...args: unknown[]) {
        if (this.latestPromise !== promise) {
            this.latestPromise = promise;
            this.latestPromise.then((value: any) => {
                this.value = value;
            });
        }
        return this.value;
    }
}
```

이 코드는 참고용으로 만들었다. 이 파이프를 pure pipe로 바꾸면 화면에는 영원히 resolve 되는 값을 출력할 수 없다. impure pipe는 참조 값 뿐 아니라 값의 변화에도 동작하므로 지속적으로 참조 비교 및 resolve 된 값을 출력할 수 있음에 반해 pure pipe 입장에서는 참조 값이 변한 것은 아니므로 캐싱된 결과인 null을 출력하기 때문이다.

###### standalone: `boolean` 

옵셔널한 속성으로 기본값은 `false`이다. 이 옵션을 사용하면 모듈에 포함하지 않고도 파이프 자체가 모듈로서 동작한다. 자세한 것은 여기를 참고하는게 좋을 듯 하다.

- Angular :: Standalone Component · BLEX @baealex
[#](https://blex.me/@baealex/angular-standalone-component)

텍스트의 포멧팅을 지정해주는 파이프를 생성해 보았다.

```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'myPipe',
    standalone: true,
})
export class MyPipePipe implements PipeTransform {
    transform(value: string, format: string, key = 'x'): string {
        let result = '';
        let j = 0;

        for (let i = 0; i < format.length; i++) {
            if (format[i] === key) {
                result += value.toString()[j++];
            } else {
                result += format[i];
            }
        }

        return result;
    }
}
```

```ts
<p>{{ '01012345678' | myPipe: 'xxx-xxxx-xxxx'}}</p>
// 010-1234-5678
```
