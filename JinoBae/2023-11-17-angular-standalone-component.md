// https://blex.me/@baealex/angular-standalone-component

## NgModule

---

오늘날의 프론트엔드 프레임워크는 컴포넌트 간의 결합으로 어플리케이션을 개발하는데 앵귤러는 그 위에 모듈(NgModule)이라는 것이 하나 더 있다. 이는 대규모 어플리케이션을 개발할 때, 코드의 재사용성을 높혀주고 어플리케이션의 구조를 명확하게 정의하는데 도움되지만...

특정 사례에서는 코드의 복잡성과 오버헤드 높히는 요소가 되기도 한다. 모듈은 재사용되기 좋은 단위이지만 모듈의 각 요소들은 재사용이 어렵다. 모듈 내에서 강하게 의존하고 있기 때문이다.

<br>

#### 모듈의 흔한 문제 사례

1. 복잡성을 높힌 사례 : 리펙토링이 필요하다. `A` 모듈의 `x` 컴포넌트를 `B` 모듈로 옮기자.
2. 오버헤드를 높힌 사례 : 이 컴포넌트는... 어디보자... `SharedModule`에 넣자!

먼저 1번 사례를 살펴보면, 리액트에서는 컴포넌트 파일만 봐도 의존성을 대체로 파악할 수 있는데 반해 모듈 기반으로 만들어진 앵귤러 어플리케이션은 컴포넌트 파일만 보고는 컴포넌트의 의존성을 정확히 파악하기 어렵다. 컴포넌트가 속한 모듈의 `declarations`을 비롯해 모듈이 `imports`하고 있는 다른 모듈의 `exports` 구문도 모두 살펴봐야 의존 관계를 파악할 수 있다.

따라서 1번 사례인 `A` 모듈의 `x` 컴포넌트를 `B` 모듈로 옮기는 작업은 의존 관계를 모두 파악하여 B 모듈에도 의존하는 요소를 동일하게 포함시켜야 하므로 리팩토링을 어렵게 만들고 결과적으로 컴포넌트를 비롯해 각 요소들의 재사용성을 떨어트린다.

2번 사례는 충분히 독립 가능한 컴포넌트가 거대한 모듈에 포함되어 (앵귤러는 모듈간에 결합이 이뤄지므로) 하나의 컴포넌트만 호출이 필요한 상황에서 묶여있는 모든 컴포넌트가 같이 호출되어 불필요한 오버헤드가 발생한다.

<br>

#### SCAM!

이것에 대한 해결책으로 제안된 것이 \*SCAM 패턴이다.

> \*SCAM = Single Component Angular Module

하나의 컴포넌트가 하나의 모듈에 속하는 것이다. 컴포넌트, 파이프, 디렉티브를 작은 단위의 모듈로 만든다. 그러면 보다 쉽게 의존 관계를 파악할 수 있고 재사용 가능하며, 앵귤러에서는 모듈 단위로 지연 로딩을 설정할 수 있으므로 불필요한 오버헤드를 발생시키지 않을 수 있다.

앵귤러의 독립형 컴포넌트는 이 패턴의 연장선이다. 앵귤러 14 부터 독립형 컴포넌트라는 개념을 실험적으로 도입하여 컴포넌트, 파이프, 디렉티브를 모듈없이 독립형으로 선언할 수 있도록 하였고, 이는 컴포넌트 간의 결합으로 어플리케이션을 개발할 수 있게 만들었다.

독립형 컴포넌트는 모듈에 대한 이해 없이도 앵귤러 어플리케이션을 개발할 수 있어 진입 장벽을 낮춰준다고 하는데... 최근 앵귤러를 접한 입문자로써 모듈과 독립형 컴포넌트가 섞여있는 현재 구조에서 더 많은 어려움과 혼란을 겪은 듯 하다. (나중에는 정말 쉬워질지도?)

여하지간 모듈에 대해서 어느정도 이해하니 이제야 독립형 컴포넌트가 눈에 들어오기 시작했다. 실제로 독립형 컴포넌트 만으로 작은 어플리케이션을 만들어보니 별다른 문제가 없었으며 모듈을 작성하지 않으니 오히려 간결하게 느껴지기도 했다.

<grid-image col="1">
	![](https://static.blex.me/images/content/2023/11/17/2023111720_aO72TlqIQVTTP6LSiEKm.png)
	<caption>출처 : reddit - r/angular</caption>
</grid-image>

커뮤니티 반응을 살펴보니 아키텍처를 위해서 모듈을 유지하겠다는 의견도 있고, 변화를 긍정적으로 생각하는 사용자도 많다. 독립형 컴포넌트는 앵귤러 16 부터는 실험 기능이 아닌 정식 기능으로 도입되었다.

<br>

## 독립형 컴포넌트

---

> 여기서는 포괄적인 용어로 독립형 컴포넌트라는 단어를 사용하지만 파이프나 디렉티브도 독립형으로 선언할 수 있으니 포함된다고 생각해도 좋다.

독립형 컴포넌트를 어떻게 사용하고, 기존 모듈과 공존시키는지, 기존 앱 모듈을 걷어내고 시작부터 독립형 컴포넌트로 전환할 수 있을지, 라우터에서 간단하게 레이지 로딩하는 방안에 대해서 살펴본다.

<br>

#### standalone

독립형 컴포넌트는 컴포넌트를 생성할 때 `@Component` 데코레이터 안에  `standalone` 옵션을 설정해주면 된다. 그럼 컴포넌트 내부에서도 `imports`를 사용할 수 있다.

```ts
@Component({
    standalone: true, // +
    selector: 'app-my-component',
    imports: [
        // ...
    ],
    template: `
        <p>My Component</p>
    `,
    styles: [
    ]
})
```

<br>

#### 모듈과 공존하기

훗날 앵귤러에서 모듈이 사라진다면 말은 달라지겠지만, 쉽게 이해하기 위해 현재로써는 독립형 컴포넌트는 컴포넌트라는 이름으로 둔갑한 모듈(SCAM)이라고 생각하는게 편하다.

###### 독립형 컴포넌트 <- 모듈

`imports` 구문에는 모듈만 선언할 수 있다. 독립형 컴포넌트도 작은 단위의 모듈이라고 생각하자. 따라서 일반 컴포넌트의 경우에는 `imports` 구문에 직접 명시할 수 없으므로 기존과 동일하게 모듈을 통해 불러오거나 또는 `standalone`을 명시하여 독립형 컴포넌트로 전환하여 불러올 수 있다.

**잘못된 유형**

```ts
// general.component.ts
@Component({
  selector: 'app-general',
  template: `
    ...
  `,
  styles: [
  ]
})
export class GeneralComponent {

}

// standalone.componet.ts
@Component({
    standalone: true,
    selector: 'app-standalone',
    imports: [
        CommonModule,
        GeneralComponent // error
    ],
    template: `
        <app-general /> 
    `,
    styles: [
    ]
})
export class StandaloneComponent {

}
```

**수정 방안 1 : Module을 통한 결합**

```ts
// general.module.ts
@NgModule({
    declarations: [
        GeneralComponent,
    ],
    imports: [
        CommonModule
    ],
    exports: [
        GeneralComponent,
    ]
})
export class GeneralModule { }

// standalone.componet.ts
@Component({
    standalone: true,
    selector: 'app-standalone',
    imports: [
        CommonModule,
        GeneralModule
    ],
    template: `
        <app-general /> 
    `,
    styles: [
    ]
})
export class StandaloneComponent {

}
```

**수정 방안 2 : 독립형 컴포넌트로 전환**

```ts
// general.component.ts
@Component({
    standalone: true,
    selector: 'app-general',
    imports: [
        CommonModule,
    ],
    template: `
        ...
    `,
    styles: [
    ]
})
export class GeneralComponent {

}

// standalone.componet.ts
@Component({
    standalone: true,
    selector: 'app-standalone',
    imports: [
        CommonModule,
        GeneralComponent
    ],
    template: `
        <app-general />  
    `,
    styles: [
    ]
})
export class StandaloneComponent {

}
```

<br>

###### 모듈 <- 독립형 컴포넌트

모듈에서 일반 컴포넌트는 `declarations`에 선언됨에 반해 독립형 컴포넌트는 `imports` 구문에 선언되어야 함을 유의해야 한다.

  ```ts
// app.module.ts
@NgModule({
    declarations: [
        AppComponent,
        // StandaloneComponent (x)
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        StandaloneComponent // (o)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }

// app.component.ts
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <app-standalone />
    `,
    styles: []
})
export class AppComponent {
    title = 'app';
}
```

<br>

#### 부트스트랩

독립형 컴포넌트는 앵귤러의 진입점으로 지정하여 모듈을 전혀 사용하지 않고도 어플리케이션을 개발할 수 있다. 차이점을 살펴보기 위해서 모듈이 진입점으로 지정되는 기존의 형태를 살펴보자.

```ts
// main.ts
platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));

// app.module.ts
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
    ],
    providers: [
        // ...
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

기존 모듈의 경우 라우팅 모듈을 앱 모듈 내에서 임포트하여 부트스트랩하는 구조이지만, 독립형 컴포넌트는 라우팅 모듈이라는 개념 없이도 `provideRouter`를 활용해 라우터를 적용시킬 수 있다.

```ts
// main.ts
bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        // ...
    ]
}).catch((err) => console.error(err));

// app.component.ts
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet],
    template: `
        ...
    `,
    styles: [],
})
export class AppComponent {
    title = 'app';
}
```

<br>

#### 레이지 로딩

독립형 컴포넌트를 사용하면 라우터에서 손쉽게 레이지 로딩을 처리할 수 있다.

```ts
const routes: Routes = [{
    path: '',
    loadComponent: () => import('./list/list.component').then(m => m.ListComponent),
}]
```

독립형 컴포넌트를 활용하면 앵귤러로 작은 규모의 앱을 만들때 비교적 유용할 듯 하다.

<br>

## 참고자료

---

- Your Angular Module is a SCAM! · Medium @Younes
[#](https://medium.com/marmicode/your-angular-module-is-a-scam-b4136ca3917b)
- Getting started with standalone components ·  Angular
[#](https://angular.io/guide/standalone-components)
- Ngmodules vs Standalone Components or Angular2 vs Angular3 · DEV @layzee
[#](https://blog.stackademic.com/ngmodules-vs-standalone-components-or-angular2-vs-angular3-ba54fab04ce3)
