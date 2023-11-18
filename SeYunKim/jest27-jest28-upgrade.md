# jest 27 → 28 자충우돌 upgrade

 

## 서론

- 최근 회사에서 사용하던 jest를 27 버전에서 28로 업그레이드를 하는 작업을 진행하였습니다.
- 작업을 하면서 이전 문서를 확인해야 하고, 최신 지원 하는 기능들을 사용하기 위함이였습니다.
- 마이그레이션 문서 : https://jest-archive-august-2023.netlify.app/docs/28.x/upgrading-to-jest28/
- Breaking change : https://jest-archive-august-2023.netlify.app/blog/2022/04/25/jest-28

## 주요 Featrue

1. Github action reporter

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/2d6fa4ad-3b51-4f03-ad39-14f4ea22c77b/40cff2d2-a8ea-40bb-8655-f2e5c86a722e/Untitled.png)

- github action에서 CI를 실행할 시, File Chanege에서 실패한 테스트를 리포팅을 하는 기능을 내장 기능으로 제공해줍니다.
- 자세한 내용은 https://jest-archive-august-2023.netlify.app/docs/configuration#reporters-arraymodulename--modulename-options 해당 문서를 참고하시길 바랍니다.
1. jest-light-runner
    1. 미래의 jest 러너로 더 작은 추상화를 적용해서 테스트 속도를 더 높이기 위해 생성되었습니다.
    2. 현재는 알파 버전이라 적용을 하진 않았지만, 차후 적용을 진행해볼 예정입니다.
2. FakerTimer  변경
    1. jest 26부터 나온 기능으로 더 많은 기능들을 제공해줍니다.
3. testing shard
    1. —shard 옵션으로 인해 하나의 앱에 대한 테스트를 여러 job에서 실행할수 있습니다. 아주 손쉽게 적용이 가능합니다.

## **troubleshoot**

1. useFakeTimers syntax Change
    1. 해당 옵션이 아래와 같이 변경되었습니다.
    
    ```jsx
    - jest.useFakeTimers('modern')
    + jest.useFakeTimers()
    + jest.useFakeTimers({
    +   legacyFakeTimers: false
    + })
    
    - jest.useFakeTimers('legacy')
    + jest.useFakeTimers({
    +   legacyFakeTimers: true
    + })
    ```
    
    - 좀더 명시적으로 modern, legacy를 명시할수 있고 차후 추가될 옵션들을 대응하기 위해 변경된것으로 확인됩니다.
2. jsdom 테스트 환경시 `jest-enviroment-jsdom` 패키지 별도 설치
    
    ```jsx
    npm install --save-dev jest-environment-jsdom
    ```
    
    - 기존에 지원하던 패키지가 별도로 빠져나가게 되면서, 별도 설치가 필요했습니다.
3. **`package.json` `exports`[](https://jest-archive-august-2023.netlify.app/docs/28.x/upgrading-to-jest28/#packagejson-exports)**
    1. 몇몇 라이브러리와 충돌로 인해 아래와 같은 옵션을 `jest.config.ts` 에 설정이 필요했습니다. 노드 환경에서 테스트 환경을 돌리겠다라는 의미입니다.
    
    ```jsx
    testEnvironmentOptions: {
        customExportConditions: ['node'],
    },
    ```
    
4. msw headers-polyfill  error
    - 관련 이슈
        - https://github.com/mswjs/msw/issues/1419
    - headers-polyfill 3.1.1에서 관련 이슈가 해결되었으며, msw의 0.47.3에서 해결 되었습니다.
        - https://github.com/mswjs/msw/releases?page=4
    - cf) 현재 msw의 버전이 2.0.x버전인데 업그레이드를 하지 않은 이유는 이전에 너무 낮은 버전을 사용하고 있었는데, 현재 jest업그레이드에서 msw까지 최신 버전으로 업그레이드를 하면 의존성이 너무 심하게 하면서 심각한 트러블슈팅이 발생 할듯 하여 jest의 문제를 해결하기 위한 버전 정도로 합의를 봤습니다.
    - 버전 업그레이드를 하면서 0.44.0에서 req.body가 deprecation이 되고, req.json()을 사용하라는 부분으로 인해 관련한 코드를 변경하기도 했습니다.
5. eslint-plugin-jest 26.1.1 → 27.7.0
    - 27.0.0의 bracking chagnes에서 no-alias-methods가 새롭게 추천되면서 jest의 다음버전에서 제거될 methods를 손쉽게 변경할수 있도록 처리하는 변경이 필요했습니다.
    - 손쉽게 `eslint --fix` 를 이용해서 모든 코드를 변경하였습니다.
    - 관련 룰 : https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/no-alias-methods.md
6. ts-jest 27 → 28
    - ts-jest도 jest28 버전과 같이 버전 업그레이드가 필요했습니다.
    - https://github.com/kulshekhar/ts-jest/blob/main/CHANGELOG.md#2800-2022-05-02
    - mark `TsCompiler` and `TsJestCompiler` as legacy
        - 해당 변경점으로 인해 ts.config.json의 문법 오류가 있으면 테스트 단계에서 이제 발견이 가능해졌습니다.
        - 예를들어, 맨 마지막 key-value에 `,` 가 있다면 테스트 실행 시 에러를 발생시킵니다.
7. react 관련 테스트가 깨지는 이슈
    - testing-library/react도 13 → 14로 버전업그레이드를 하면서 테스트가 깨지는 부분이 많아졌습니다.
    - userEvent의 이벤트 함수가 있는 경우였는데요. act()를 사용해서 해결하였습니다.
    - act()는 함수로 인자를 받는데, 가상의 DOM에 적용하는 역할을 하는데, act 함수가 호출된 뒤에 DOM에 반영되었다고 가정하고 그 다음 코드를 쓸수 있게 되서 React가 브라우저에서 실행될떄와 비슷한 환경에서 테스트를 할수 있도록 합니다.
8. 모노레포의 의존성 문제
    - 저희 회사에선 마이크로프론트엔드의 모노레포를 사용하고 있는데, root package depencies와 각 앱들의 depencies의 버전이 맞지 않아 업그레이드를 할때 힘든 점이 있었습니다. 특히 testing-libery나, msw같은 경우 각 앱들과 루트에 있는 것들과 다른 버전을 가지고 있다보니 팬텀 의존성으로 인해 npm i를 할때마다 또한 각 앱마다 다른 버전을 가지게 되는 단점이 있었고, 그러다 보니 root depencies를 업그레이드를 할때 이슈가 있었습니다. 이번에 전체적으로 root depnecies에 있는 것들은 모두 root 버전을 따라가도록 설정하였습니다.

## 결론

- 27에서 28로 넘어가는 과정에서 트러블슈팅이 굉장히 많았는데, 그동안 부채가 쌓였다는 느낌이 들었습니다.
- 더 최신적인 부분을 사용하기 위해 부채가 쌓이지 않기 위해 주기적으로 관리가 필요하다고 생각이 듭니다
- 이 글을 쓰는 오늘 28 → 29로 바로 업그레이드를 진행했는데, 변경점이 많지 않아 10분내로 끝나기도 하였습니다.
- 주요 라이브러리들은 주요 변경점, 업그레이드 주요 사항들을 문서로 잘 작성해두기 때문에 업그레이드를 하는데 어려움이 없는듯 합니다 🙂
- ~~주기적으로 업그레이드를 합시다…~~
