// https://blex.me/@baealex/create-spa-with-angular

## SPA란 무엇일까?

---

다음과 같은 조건을 만족하는 웹 사이트라면 SPA라고 부를 수 있다.

> **하나의 html 파일**에서 사용자가 웹 사이트의 **모든 기능**을 사용할 수 있다.

<br>

#### 왜 생겼을까? 🤔

웹의 태초 목적은 문서들을 링크로 연결하여 보여주는 것이었다. **링크를 누르면** 브라우저는 화면을 초기화하고 요청한 링크에 맞는 문서가 **새롭게 그려져** 보여진다. 그래서 전통적인 웹 사이트는 화면이 깜빡거리며 페이지가 전환된다. 단순하고 간단한 페이지라면 어색해 보이지 않지만, 복잡한 페이지 일수록 어색하게 보여진다.

웹 사이트의 기능 구현을 보조했던 자바스크립트의 기능과 성능이 개선되면서 그것은 SPA를 만들 수 있는 토대가 되었다. 웹 사이트는 오로지 하나의 HTML 파일만 가지고 있으며 해당 HTML 파일에서 자바스크립트를 로드하여 웹 사이트의 모든 기능을 사용할 수 있도록 만들 수 있게 되었다.

SPA에서 사용자와의 모든 상호작용은 **필요한 영역(화면)에 대한 업데이트**만 발생시키는 것을 기본으로 한다. 덕분에 사용자는 웹 사이트를 이용할 때 마치 컴퓨터 프로그램이나 모바일 어플리케이션에 준하는 경험을 할 수 있다.

이러한 장점과 더불어 웹이기 때문에 브라우저를 통해 네트워크에 연결된 모든 기기에서 사용이 가능하므로 각 기기에 맞게 어플리케이션을 만드는 것 보다 빠르게 제품을 만들 수 있으며, 업데이트를 실시간으로 반영할 수 있다는 장점도 가지고 있다.

<br>

#### 자바스크립트로 전부?

자바스크립트로 웹 서비스의 모든 기능을 사용할 수 있게 하려면 생각보다 많은 고려사항이 필요하다.

- 라우팅 : URL을 기반으로 적합한 페이지를 생성하기 위한 작업이 필요하다. (사용자 간에 링크를 공유하거나 검색을 목적으로 한다. 웹의 태초 목적에 맞는 기본적인 규칙을 준수하기 위함이다.)
- 상태 관리 : 한 페이지에서 모든 기능을 사용하려면 복잡한 상태 관리가 필요하다. (사이트 내에서 수 많은 상호작용이 일어나는 것을 모두 관리할 수 있어야 하기 때문이다.) 
- 히스토리 관리 : 뒤로가기 및 앞으로가기시에도 필요한 영역만 변경해야 하므로 작업이 필요하다. (결과적으로 브라우저에서 제공하는 모든 기능에 대응해야 할 필요가 있다.)

자바스크립트를 활용해서 SPA와 같은 형태로 동작하게 만드는 동시에 위 고려사항을 모두 충족하려면 복잡한 초기 작업이 필요해지며 규모가 커진다면 성능이나 관리에 대한 어려움이 발생할 수 있다. 

<br>

## Angular

---

복잡한 초기 작업과 성능·관리에 대한 부분까지 고려한 도구, 앵귤러는 구글에서 만든 SPA 프레임워크로 초창기(2010년대 ~ 2020년대 초반)에는 많은 인기를 얻었지만 최근에는 거의 사용하지 않는 분위기다.

<br>

#### 왜 사용하지 않을까? 😭

필자가 느낀 앵귤러의 단점은 아래와 같다.

###### 높은 진입장벽 ⛰

모든 SPA 프레임워크에서 높은 수준의 대규모 어플리케이션을 만드려면 많은 학습량을 요구하지만 앵귤러는 (웹 프론트엔드 개발 입문자 기준에서) 진입장벽을 높이는 또 다른 특징을 가지고 있다.

- 어플리케이션 설계를 위해 다양한 용어를 사용하고 있으며,  문서에서 이 용어들을 설명하는 장황한 문장을 이해하기가 어렵다고 느낄 수 있다.
- TypeScript, RxJS를 기반으로 만들어져 있기 때문에 이 기술에 대한 기본 지식을 요구한다.
- OOP에 크게 의존하는 형태이므로 이 패턴에 익숙하지 않다면 어렵게 느낄 수 있다.

###### 폐쇠성 ☠️

[[[근거]]](https://github.com/angular/angular-cli/issues/1656)

근거로 제시한 링크는 웹팩 설정에 대한 오버라이딩에 대한 논쟁인데, 2016년까지도 앵귤러에는 웹팩을 오버라이딩하는 방법 따위가 존재하지 않았다. 이처럼 앵귤러는 어플리케이션의 전체적인 제어 권한을 앵귤러가 가지고 있다. (당연히 현재 시점에서는 가능하며 번들러를 변경하는 것 또한 지원된다.)

<br>

#### 그럼에도 사용하는 이유? 🤔

필자가 느낀 앵귤러의 장점은 아래와 같다.

###### 단점은 양날의 검 ⚔️

위에서 언급한 단점들은 사실 양날의 검이라 장점도 뚜렷하다.

- 높은 진입장벽을 넘으면 대규모 어플리케이션을 설계하기 위한 지식을 터득할 수 있다.
- 폐쇠적이지만 대규모 어플리케이션을 만드는 상황에서 보다 신뢰 가능하고 안전하게 서비스를 개발할 수 있다.

###### 이미 다 있어요 🛠

앵귤러는 대규모 어플리케이션을 만들기 위한 모든 기능을 이미 기본적으로 갖추고 있다. 이로인한 최대 장점은 커뮤니케이션 비용을 낮출 수 있다는 점이다. 리액트의 경우 대규모 어플케이션 개발시 라이브러리를 일부 활용하게 된다. 이 과정에서 리액트는 자신 혹은 팀에게 익숙한 방식으로 구현된 라이브러리를 선정해야 한다.

- 라우팅 처리를 위한 도구 : React  (`react-router`) => Angular (`RouterModule`)
- 폼을 다루기 위한 도구 : React (`react-hook-form`) => Angualr (`FormModule`)
- API 통신을 위한 도구 : React (`react-query`) => Angular (`HttpModule`)
- 상태 관리를 위한 도구 : React (`recoil`, `MobX`, `Redux`) => Anguar (`?`)

리액트는 프로젝트 초기에 기술 선정 외에도 프로젝트의 아키텍처, 컨벤션을 정하는데 많은 시간을 들이게 된다. 반면에 앵귤러는 기본적인 틀이 잡혀있고 권장하는 아키텍쳐가 있기 때문에 기본적인 컨벤션을 맞추는 것 외에는 별다른 커뮤니케이션 비용이 발생하지 않는다.

추가적으로 앵귤러는 테스트 환경이 사전에 구성되어 있으며, 개발 생산성을 향상시켜주는 유틸리티 CLI 등이 미리 구현되어 있어 개발에만 집중할 수 있다. 구조와 용어만 잘 이해한다면 개발에만 몰두할 수 프레임워크임은 분명하다.

<br>

#### 앵귤러 기본 구조

앵귤러에서 사용되는 용어들이 어떻게 합쳐지는지 간단하게 살펴보자. 아래는 앵귤러에 구조에 대한 기본적인 형태를 그림으로 그려 본 것이다.

<grid-image col="1">
	![](https://static.blex.me/images/content/2023/11/1/202311121_f5Zb2cyk93df1lxI3OiP.png)
	<caption>앵귤러의 구조</caption>
</grid-image>
	
위에서 대부분의 SPA 프레임워크가 컴포넌트 간의 결합이라고 말했는데, 앵귤러는 컴포넌트 위에 하나의 개념을 더해 **모듈**간의 결합으로 어플리케이션을 개발하게 된다. 모듈은 컴포넌트, 디렉티브, 파이프, 서비스와 같은 요소들이 결합된 것이다. `AppModule`은 어플리케이션의 시작점이 된다. 앵귤러는 SPA 구성에 필요한 각 기능을 모듈 형태로 제공하고 있다.

그럼 이제 모듈을 구성하는 컴포넌트, 디렉티브, 파이브, 서비스에 대해서 알아보자.

- **컴포넌트**는 상태 및 메소드를 정의한 클래스와 사용자에게 보여줄 템플릿이 결합된 것으로, 앵귤러는 컴포넌트 클래스의 상태를 기반으로 템플릿을 렌더링한다. 상태가 변경되면 이를 감지하여 업데이트가 필요한 영역을 업데이트 한다.
- **디렉티브**는 컴포넌트의 템플릿에서 사용할 수 있는 도구의 모음이다. 기본적으로 제공되는 구조 디렉티브 중에 `<div *ngIf="shouldRender">Redered!</div>` 와 같이 엘리먼트에 조건(`*ngIf`)을 명시하여 엘리먼트를 조건별로 렌더하는 등 DOM을 조작할 수 있다.
- **파이프**는 컴포넌트의 템플릿에서 데이터를 가공하기 위한 도구의 모음이다. 템플릿에서 데이터 표기는 다음과 같이 처리하는데 `{{ someDateState }}` 파이프는 이 안에서 `{{ someDateState | date: 'yyyy/MM/dd' }}`와 같이 데이터의 형태를 가공할 수 있다.
- **서비스**는 재사용 가능한 비즈니스 로직, 컴포넌트간 공유 가능한 데이터을 포함한 객체이며 서비스의 인스턴스는 앵귤러에 의해 적절한 계층에서 싱글톤으로 유지된다. 컴포넌트는 서비스를 [[[의존성 주입]]](https://blex.me/@baealex/2023-10-10-til-angular-dependency-injection)을 통해 사용하게 된다.

이처럼 앵귤러는 위처럼 용도별로 기능을 분리하여 보다 복잡한 어플리케이션을 개발하더라도 효과적으로 관리하고 확장할 수 있도록 만들어 준다.

<br>

#### 빠르게 시작해보기

Node를 설치하여 아래 명령어를 입력하면 Angular는 기본적인 앱의 토대를 만들어 준다.

```bash
npx -p @angular/cli ng new my_app
```

앱을 생성할 때 친절한 앵귤러는 Router 사용 여부와 스타일시트 포맷에 대한 선택지를 제공한다.

![](https://static.blex.me/images/content/2023/11/1/202311122_QOQBzz6lFOnWhaytqXv1.png)

여기서는 라우터를 사용하며 SCSS를 선택하였다.

![](https://static.blex.me/images/content/2023/9/24/202392420_NLYquRBj6tpHw0Yd7PcA.png)

위와같은 구조로 만들어주는데 흥미롭게도 유닛 테스트(`npm run test`)는 기본적으로 갖추고 있으며 e2e 환경을 셋팅하려면 아래 명령어를 입력하여 설정해주면 된다.

```bash
npm run e2e

Would you like to add a package with "e2e" capabilities now? (Use arrow keys)
❯ No 
  Cypress 
  Nightwatch 
  WebdriverIO 
  Puppeteer
```

선호하는 e2e 라이브러리를 선택하면 기본 셋팅이 추가된다.

`npm run start` 명령어를 입력하여 앱이 실행되면 http://localhost:4200 으로 접근하면 아래와 같은 기본 페이지가 보여진다.

![](https://static.blex.me/images/content/2023/9/24/202392421_cYno4EQu2HXiynUdHJH0.png)

위 페이지에도 나와있듯 앵귤러 CLI를 이용하여 컴포넌트를 생성해보자.

```bash
npm run ng generate component button -- --inline-style --inline-template

# 또는 아래와 같이 축약 명령어로 생성
npm run ng generate c button -- -s -t
```

그럼 앵귤러는 컴포넌트를 생성해주고 AppModule에도 해당 컴포넌트를 자동으로 추가해준다.

![](https://static.blex.me/images/content/2023/11/1/202311122_MN6XtJBxB37UrQDKtxnA.png)

위에서 말했던 것 처럼 앵귤러는 번거로울 수 있는 컴포넌트, 디렉티브, 서비스 등 다양한 구성 요소에 대한 생성 작업을 CLI를 통해서 간단하게 처리할 수 있도록 제공하고 있다.

```ts
// button.component.ts
import { Component } from '@angular/core';

@Component({
    selector: 'app-button',
    template: `
        <p>
            button works!
        </p>
    `,
    styles: [
    ]
})
export class ButtonComponent {

}
```

기본적으로 앵귤러에서 제공되는 모든 기능들은 위와같이 데코레이터를 활용하여 개발하게 된다. 이제 해당 컴포넌트에 `selector`에 명시된 이름을 하나의 태그명처럼 이용하여 해당 컴포넌트가 위치하는 모듈과 같은 레벨에 있는 다른 컴포넌트의 템플릿에서 해당 컴포넌트를 호출할 수 있다.

버튼이 기본적인 처리를 할 수 있도록 조금 수정하였다.

```ts
// button.component.ts
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-button',
    template: `
        <button (click)="onClick.emit()">
            My Button
        </button>
    `,
    styles: [`
        button {
            color: #735af2;
        }
    `]
})
export class ButtonComponent {
    @Output() onClick = new EventEmitter<void>();
}
```

```ts
// app.component.ts
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'my_app';

    handleClickButton() {
        alert('Hello, My App!');
    }
}
```

```html
// app.component.html
<app-button (onClick)="handleClickButton()" />
```

그럼 브라우저 화면이 우리가 생성한 컴포넌트로 대체되었고, 버튼을 눌렀을 때도 얼럿이 잘 뜬다.

![](https://static.blex.me/images/content/2023/11/3/20231130_KfLHYaZ5E5G8ohN9mNy6.png)

앱(?) 완성!

더 자세하게 앵귤러를 시작해 보고 싶다면 앵귤러에서 제공하는 [튜토리얼 문서](https://angular.io/tutorial/first-app)를 살펴보거나 이 글의 시리즈인 [앵귤러 파헤치기 시리즈](https://blex.me/@baealex/series/%EC%95%B5%EA%B7%A4%EB%9F%AC-%ED%8C%8C%ED%97%A4%EC%B9%98%EA%B8%B0)를 살펴보는 것도 조금은(?) 도움이 될 수 있겠다.

이번 SPA 개발은 앵귤러 어떠세요?

@gif[https://static.blex.me/images/content/2020/7/27/13_Z42j0455vSEEGQGVDXiE.mp4]