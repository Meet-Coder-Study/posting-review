# 메이플스토리 만렙 찍는게 불가능한 이유

메이플스토리가 취미인 제 남자친구가 하루는 그런 말을 했습니다.  
현재 메이플스토리 만렙인 275 레벨이 되기 위해 본인 캐릭터(레벨 239)가 달성한 경험치 누적 총량이 3% 정도 밖에 안된다구요....
🤔 말도 안된다고 생각했고 검색을 해봤습니다.

[메이플스토리/시스템/경험치 - 나무위키](https://namu.wiki/w/%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC/%EC%8B%9C%EC%8A%A4%ED%85%9C/%EA%B2%BD%ED%97%98%EC%B9%98)를 확인해보니 사실이더라구요.

만렙의 총 누적 경험치 = 86,471,480,103,891  
239레벨의 총 누적 경험치 = 3,136,345,550,079

3,136,345,550,079 \* 100 / 86,471,480,103,891 = **3.627%**

캐릭터 레벨을 알고있는 상태에서 위 나무위키 페이지를 확인하면 쉽게 경험치 획득 정도를 알 수 있지만! 재미있는 아이디어가 생각나면 바로 뚝딱뚝딱 만들 수 있는 뚝딱이 개발자가 되는 것이 제 꿈이기 때문에 `캐릭터 이름`을 입력하면 경험치 달성율을 확인할 수 있는 서비스를 만들어 보기로 했습니다.

## 메이플스토리 랭킹 웹 크롤링

[지난번 LCK 실시간 스코어 크롤링](https://github.com/Blog-Posting/posting-review/blob/master/yyna/check_lck_scores_at_your_company.md)했던 작업과 비슷하게 웹 크롤링 작업을 통해서 캐릭터 레벨 정보와 경험치 정보를 가져오려고 합니다.

https://maplestory.nexon.com/Ranking/World/Total?c=%EA%B0%93%EC%A0%95%EC%9E%89 메이플스토리 홈페이지의 월드 랭킹에 가면 쉽게 원하는 정보를 가져올 수 있습니다.

![메이플스토리 랭킹](./image/impossible-to-reach-275-level-in-maplestory/1.png '메이플스토리 랭킹')

원하는 정보를 어떻게 가져올 수 있을지 확인하기 위해 소스보기를 확인해봅시다.

![메이플스토리 랭킹 소스보기](./image/impossible-to-reach-275-level-in-maplestory/2.png '메이플스토리 랭킹 소스보기')

LCK 실시간 스코어와 달리 메이플스토리 랭킹 페이지는 서버에서 모두 만들어진 상태로 클라이언트로 보내고 있습니다.

## 프로젝트 계획

웹에서 어떻게 정보를 크롤링해올지 확인했으니 이제 프로젝트를 어떤 식으로 만들지 구상해봅시다.

![프로젝트 계획](./image/impossible-to-reach-275-level-in-maplestory/3.png '프로젝트 계획')

위 그림처럼 간단한 두 페이지를 가지는 웹 서비스를 만들어 보겠습니다.
1번째 페이지는 캐릭터 이름을 입력받는 `<input>`을 가지고 검색을 하면 검색 결과가 나오는 2번째 페이지로 이동하도록 합니다. 간단하네요!

## 프로젝트 시작

`Next.js` 를 사용해서 만들어 봅시다. 아래 명령어를 입력하면 프로젝트 이름을 입력하라고 뜹니다. 적당한 이름을 입력해주고 `Default starter app` 을 template 으로 선택하면 프로젝트가 생성됩니다.

[Getting Started | Next.js](https://nextjs.org/docs)

```
yarn create next-app
```

아래 명령어를 통해 앱을 실행합니다.

```
cd ${project-name}
yarn dev
```

![weltcome to next.js](./image/impossible-to-reach-275-level-in-maplestory/4.png 'weltcome to next.js')

필요한 파일을 추가하고 필요없는 파일은 삭제합니다.

### 삭제할 것

- `public/vercel.svg` 파일
- `pages/api/hello.js` 파일

### 생성할 것

- `pages/api/[user].js` 파일
- `pages/[user].js` 파일
- `pages/_app.js` 파일
- `components` 폴더
- `components/layout.js` 파일
- `components/search.js` 파일
- `components/layout.module.css` 파일
- `lib` 폴더
- `lib/api.j` 파일
- `experience-point.json` 파일

### 추가 라이브러리 설치

```
yarn add bootstrap cheerio react-bootstrap swr
```

- bootstrap, react-bootstrap: 간단하고 빠른 스타일링을 위해 추가
- axios: http 요청을 보내기 위해 사용
- cheerio: axios를 통해 받은 text/html 형태의 응답을 다시 dom 형태로 바꾸기 위해 사용
- [swr](https://nextjs.org/docs/basic-features/data-fetching#swr): Next.js 에서 data fetching을 위해 만든 React hook

간단한 프로젝트라 구현에 대한 설명을 자세히 하진 않겠습니다! 아래 코드를 참고해주세요.

[GitHub 에서 전체 코드 보기](https://github.com/yyna/maple-zz)

## 배포하기

이 간단한 프로젝트를 위해 서버를 구매할 순 없습니다...ㅎ 배보다 배꼽이 더 크니까요.

`next export` 명령어를 통해 static 배포를 위한 빌드를 한 후 github pages를 활용해서 배포를 하려고했으나 `pages/api` 폴더는 `next export` 할때 무시된다고 합니다.

> API Routes are not supported by this method because they can't be prerendered to HTML.

방법을 알아보던 중 Next.js를 만든 Vercel이라는 회사에서 배포를 위한 무료 플랫폼을 제공하고 있다는 것을 알게 되었습니다.

https://vercel.com/solutions/nextjs

![Vercel](./image/impossible-to-reach-275-level-in-maplestory/5.png 'Vercel')

**Deploy Free** 버튼을 누르면 GitHub, GitLab, Bitbucket을 연동해서 배포를 할 수 있도록 해줍니다. 저는 이미 GitHub에 프로젝트를 올려둔 상태이기 때문에 GitHub을 선택했습니다.

Vercel에 권한을 제 프로젝트 권한을 승인하면 `*.vercel.app` 도메인으로 배포를 시작합니다.

![CICD](./image/impossible-to-reach-275-level-in-maplestory/6.png 'CICD')

배포가 완료되었다고 뜨면 들어가서 확인해봅시다!
https://maple-zz.vercel.app

![page-1](./image/impossible-to-reach-275-level-in-maplestory/7.png 'page-1')  
![page-2](./image/impossible-to-reach-275-level-in-maplestory/8.png 'page-2')

너무 배포가 잘 되었죠,,,? CI/CD 너무 좋네요 너무 좋아 💕

## 주의할 점

- 메이플스토리 리부트 월드?는 랭킹이 따로다... 크롤링할때 파라미터 하나만 더 추가하면 정보를 가져올 수 있다.
- 요청 너무 많이보내면 내 IP가 차단당한다.
- 테라버닝해서 레벨 200까지 올려도 만렙까지 가는길 중 0.017%를 달성할 뿐이다...

## 느낀 점

- Nuxt.js 가 Next.js 보단 좀 더 쉬운 것 같다... 왜냐 Vue 가 더 쉬우니까!
- 백엔드 개발자이지만 프론트를 어느 정도 할 줄 아는 건 유용하다.
- 어느 정도 내가 원하는 걸 뚝딱 만들어낼 수 있게된 것 같아 뿌듯하다.
- CI/CD가 없는 세상에서 어떻게 살았을까?
- 이 모든 사실을 알고있지만 오늘도 피곤한 몸을 이끌고 일일퀘스트를 깨고 자는 나의 남자친구는 지독한 겜돌이이다......
- 만렙이 게임의 목표는 아니니 상관없다.
