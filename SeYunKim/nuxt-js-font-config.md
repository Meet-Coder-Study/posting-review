# Nuxt.js config를 통해 웹폰트를 쉽게 적용해보자.

## 서론

- Nuxt의 애플리케이션의 모든 페이지에 같은 폰트를 다운로드 받아서 적용하는 작업을 해볼 예정입니다.
- 손쉽게 Configuration을 통해 가능합니다.
- 테스트해볼 폰트는 [google IBM Plex Sans font](https://fonts.google.com/specimen/IBM+Plex+Sans)를 이용해볼 예정입니다.
- 참고로 해당 예제는 nuxt3로 진행하였습니다.

## nuxt3 옵션

- nuxt3는 `nuxt.config.ts` 파일을 이용해 옵션을 설정할수 있습니다.

### app

- 공식문서 : https://nuxt.com/docs/api/configuration/nuxt-config#app
- app 전반의 옵션들을 설정하는 키값입니다.

### head

- 공식문서 : https://nuxt.com/docs/api/configuration/nuxt-config#head
- app 옵션 내에 있는 것으로 html의 head 태그 내부를 전역설정하는 옵션입니다.

### link

- head 태그의 공식문서 : https://developer.mozilla.org/ko/docs/Web/HTML/Element/link
- HTML의 `<link>` 태그를 설정하는 옵션으로 외부 리소스 연결을 하기 위해 사용합니다.
- link 태그는 하나가 아닐수 잇으니 배열로 값을 설정합니다.
- rel : 현재 문서와 연결한 아이템의 관계를 의미하는것입니다.
- type: 특성은 연결한 리소스의 MIME을 포함
- herf: 외부 문서의 주소

## 폰트를 전역으로 설정하기

```tsx
import {defineNuxtConfig} from 'nuxt/config'

export default defineNuxtConfig({
    app: {
        head: {
            htmlAttrs: {
                lang: 'ko'
            },
            link: [
                {
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@100;200;300;400;500;600;700&display=swap'
                }
            ]
        }
    },
});
```

- 위에서 설명한 옵션을 순서대로 적용해보면 위와 같이 적용이 가능합니다.

### head태그만 설정한다고 해서 폰트를 설정할수 있는가?

- 일단 결론은 아닙니다. css의 `font-family` 로 지정해둬야 합니다.
- 매번 css 파일을 매 페이지 파일마다 import해오는 작업은 귀찮을수 있으니 이것도 설정으로 쉽게 적용해보겠습니다.

### css

- 공식문서 : https://nuxt.com/docs/api/configuration/nuxt-config#css
- 전역으로 설정하려는 CSS 파일/모듈/라이브러리를 정의할 수 있습니다
- 역시 한개의 파일만 설정하지 않을수 있으니 배열로 값을 설정합니다.

### 전역 css를 적용해보자.

- `assets/scss/_global.scss`  파일을 만듭니다.
- 아래와 같이 설정합니다.

```tsx
body {
  margin: 0;
  padding: 0;
}
```

- `nuxt.config.ts` 에 아래와 같이 설정합니다.

```tsx
import {defineNuxtConfig} from 'nuxt/config'

export default defineNuxtConfig({
    css: [
        '~/assets/scss/_global.scss'
    ],
});
```

## 최종 설정

- `assets/scss/_global.scss`

```tsx
body {
  font-family: 'IBM Plex Sans KR', sans-serif;
}
```

- nuxt.config.ts

```tsx
import {defineNuxtConfig} from 'nuxt/config'

export default defineNuxtConfig({
    css: [
        '~/assets/scss/_global.scss'
    ],
    app: {
        head: {
            htmlAttrs: {
                lang: 'ko'
            },
            link: [
                {
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@100;200;300;400;500;600;700&display=swap'
                }
            ]
        }
    },
});
```

## 결론

- 프레임워크를 사용하는 이유는 이러한 전역 설정을 손쉽게 할수 잇다는것일거 같습니다.
- 한번 설정해두면 그뒤에 변경할 일이 많이 없다 보니, 설정법들을 잊게 되는 경우들이 많은데요.
- 한번씩 설정들을 학습해보면 좋지 않을까 생각합니다.
