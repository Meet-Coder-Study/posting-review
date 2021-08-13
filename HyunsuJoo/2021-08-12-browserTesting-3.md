# 브라우저 테스팅 자동화 적용기(입문) -3

- 이번에 소개된 환경 세팅이 꼭 best practice이 아님을 알려드립니다.



## Typescript + Playwright + Jest 환경설정  


**Jest를 선택하기 까지**  
  
  
가장 안정적이고 널리 알려진 Mocha와의 성능차이를 비교한 가운데, 테스팅 속도 또한 의견이 분분 하였습니다. 사실 저희 프로젝트에 맞는 결정적 요인이 내려지지 않았습니다.(아마도 저의 지식부족이 아닌가 싶습니다). 점유율을 확인 후, JEST가 높은 가운데  테스트를 작성하는 개발자 및 프로젝트의 특성을 고려하여 얻을 수 있는 이점으로 선택하였습니다. (혹시 경험이 있으시거나 고려할 사항들이 있다면 알려주시면 감사하겠습니다!)

1. 테스트 스크립트를 작성하면서 cli에서 내장된 코드 커버리지를 확인할 수 있다는 점.
2. Playwright 커뮤니티에서 jest와 함께 사용할수 있는 프레임워크 지원
3. Jest 또한 Typescript 를 지원
4. 테스트를 실행하는 파일/디렉토리에 대한 지정이 유동적 (실행하려는 파일을 regex로 구분하므로 통합테스트나, 웹 접근성 테스트 시 구별하여 따로 테스트 실행 가능)
5. 테스트케이스를 병렬로 실행 (가장 느린 테스트를 먼저 실행) -> 효율적.  

<img src="./images/stackshare.png" width="530" height="350">

이미지 발췌 : [npmtrends](https://www.npmtrends.com/jest-vs-mocha)

현재 버전
`jest 27.0`

### 1. 타입스크립트 설치 

```typescript 
npm install -D typescript

```
  

### 2. Jest Playwright 설치 (Jest 및 Playwright 관련 패키지)

```typescript

npm install -D jest jest-playwright-preset playwright
 ts-jest @types/jest
```
- `jest-playwright-preset` : Playwright로 제어되는 브라우저(headless browser)에서 Jest로 테스트를 실행할 수 있도록 필요한 플러그인들로 구성되어 있는 preset입니다.

- `ts-jest`  : Jest는 테스트가 실행 될 때 type-check을 하지 않기 때문에, type-check을 하기 위해선 ts-jest를 사용하거나 tsc를 별도로 실행할 수 있습니다. 조금 더 수월하게 하도록  ts-jest를 사용했습니다. https://github.com/kulshekhar/ts-jest


- `@types/jest`: jest를 위한 타입이 정의 되어 있는 패키지 입니다.  [types에 대한 자세한 설명](https://blog.angular-university.io/typescript-2-type-system-how-do-type-definitions-work-in-npm-when-to-use-types-and-why-what-are-compiler-opt-in-types/)

> NOTE : @types/* 모듈들은 관련있는 모듈과 버전을 일치 시키는 것을 권고합니다. 예를 들어 26.4.0 버전의 jest를 사용하고 있다면, 26.4.*의 @types /jest를 사용해야 합니다. (즉 메이저 버전과 마이너 버전을 가능한 매치 해야합니다.)
[출처: JEST 공식문서](https://jestjs.io/docs/getting-started)



### 3. JEST configuration

Jest 의 환경설정은 `package.json` 또는 jest.config.ts 처럼 파일을 root 디렉토리 내에 생성해도 됩니다.
[configuration 공식문서 참조](https://jestjs.io/docs/configuration)  

 
저는 좀 더 다양한 환경설정이 필요할 것 같아 파일을 따로 생성하였습니다.


```typescript

module.exports = {
   
    preset: 'jest-playwright-preset',
    testTimeout:20000,
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    testEnvironmentOptions: {
      'jest-playwright': {
        // Options...
        browsers:["chromium"], //사용할 브라우저 지정, ["chromium","firefox","safari"] 모두 사용할 경우 병렬로 실행  
        launchOptions: {
            headless: false, //브라우저를 스크린상에 보여줄 것인지 false- 보여줌
            slowMo: 100 // 브라우저의 진행속도 
        },
        
      },
    },
}
```

* `transform` : Jest는 프로젝트 코드를 JavaScript로  실행하지만 Node.js에서 지원하지 않는 유형들 (Typescript, Vue)의 경우 transform의 구성 옵션을 통해 JavaScirpt로 변환합니다. 

* `testTimeout`: playwright-jest 에선 playwright 을 실행하는데 시간이 걸리기 때문에, 5초에서 15초 정도를 기존의 jest설정을 재정의 하는데 `testTimeout` 으로 다시 설정할 수 있다고 합니다. [jest-playwright 참조](https://github.com/playwright-community/jest-playwright)
 

  * 제가 실제 겪은 `BeforeAll`에서 테스트를 running 하지 못하고 timeout이 되는 경우가 있었습니다.
    `thrown: "Exceeded timeout of 15000 ms for a hook.
    Use jest.setTimeout(newTimeout) to increase the timeout value, if this is a long-running test."`

* `testEnvironmentOptions` : playwright의 환경설정을 할 수 있습니다.  


### 4. TypeScript Configuration  

 
최소한의 설정을 담은 tsconfig.json 입니다.  
  
```typescript
{
  "compilerOptions": {
    "target": "ESNext", 
    "module": "commonjs",
    "strict": true, 
    "forceConsistentCasingInFileNames": true,
    "types": [
        "@types/jest",
        "jest-playwright-preset",
       // "expect-playwright",
      ]
    "rootDir": "src",
    "outDir": "lib",
    "lib": [ "es2017", "DOM","DOM.iterable" ]
  },
  "files": []
}


```

[strict에 대한 이펙티브 타입스립트 정리 글](https://github.com/sooster910/EffectiveTypeScript/tree/main/src/item02)


### 5. package.json

```typescript
{
  ...,
  "scripts": {
    "test": "jest",
  },
  ...
}

```  

## 디버깅 방법

**1.** Run in headed mode 

```typescript
await chromium.launch({ headless: false, slowMo: 100 }); // or firefox, webkit
```

**2.** Playwright Inspector

저같은 경우는 selector에 많이 할애 했기 때문에 inspector를 통해 찾거나 간단한 스크립트 작성으로 이용 하였습니다. 

**2-1.** 스크립트에서 breakpoint를 사용하듯이 `await page.pause();` 원하는 라인에 호출합니다. 


```typescript
describe("GitHub", () => {
    
    it("should show the microsoft/Playwright project in the search if you search for Playwright", async () => {
      await page.goto("https://github.com");
      await page.pause() 
      await page.type('input[name="q"]', "Playwright");
      await page.press('input[name="q"]', "Enter");
      await expect(page).toMatchText(".repo-list-item", "microsoft/playwright");

    })

})

```
**2-2.** `PWDEBUG=1` 환경변수 사용

`PWDEBUG=1` 환경변수를 사용하게 되면, `await page.pause()` 의 위치와 상관없이 중단점이 스크립트의 맨 첫줄에서 트리거 됩니다. 

```
# Linux/macOS
PWDEBUG=1 npm run test

# Windows with cmd.exe
set PWDEBUG=1
npm run test

# Windows with PowerShell
$env:PWDEBUG=1
npm run test

```

또한 inspector에서는 브라우저 내에서 일어나는 모든 이벤트의 코드를 생성 해줍니다. 

예를 들어, 


```typescript
jest.setTimeout(1000000)

describe("GitHub", () => {
    
    it("should show the microsoft/Playwright project in the search if you search for Playwright", async () => {
      
      await page.goto("https://wikipedia.org");
      await page.pause()

    })

})
```

위의 스크립트와 함께 `PWDEBUG=1 npm run test`을 실행시킨 후, 
Record 버튼을 누르게 되면, 녹화모드로 스크립트가 새로 만들어집니다.  

<img src="./images/recording1.png" width="720" height="380">


오른쪽의 브라우저에서 원하는 이벤트를 하게 되면 코드가 생성됩니다.  


<img src="./images/recording2.png" width="720" height="380">


이 부분이 유용하다고 느낀점은, 제가 이것을 사용하기 전까진 promise race condition 부분을 처리하느라 코드를 vscode 디버깅을 돌리고, promise return 값을 확인하고 다시 스크립트를 작성 해야 했었는데, Promise.all로 자동 생성하여 race condition이 일어나는 경우의 수를 줄여줄 수 있는 것 같습니다.  

<img src="./images/recording3.png" width="720" height="380"> 


이상 개발 환경 설정 및 디버깅 편이었습니다.

---

참고자료 

* [Getting started with Playwright with Jest and TypeScript](https://www.carlrippon.com/getting-started-with-playwright/)

* [Start UI tests with Playwright + Jest + Typescript](https://dilshani.medium.com/start-ui-tests-with-playwright-jest-typescript-8dcbf4646bcb)

* [Playwright 공식문서](https://playwright.dev/)
