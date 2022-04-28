# package-lock.json

- [package-lock.json](#package-lockjson)
  - [lockfileVersion](#lockfileversion)
  - [참고](#참고)

`package-lock.json`은 `node_modules` 트리나 `package.json`이 수정이 되는 명령이 실행되었을 때 자동으로 생성된다. 즉, `package-lock.json`은 dependency update와 상관없이 `npm install` 로 생성되는 의존성에 대한 정확하고 구체적인 정보이다.

때문에 `package-lock.json` 이 존재할 때는 `package.json` 을 사용하지 않고 `package-lock.json`을 사용하여 `node_modules`를 생성한다.

때문에 개발자 간 npm 버전이 다르더라도 동일한 `node_modules` 트리를 생성하여 같은 의존성을 설치할 수 있도록 도와준다.

따라서 `package-lock.json`을 형상관리 `git, svn 등` 저장소에 반드시 포함해야한다.

> `package.json` 에 버전이 `package-lock.json`의 내용과 달라진다면 `package.json` 을 기준으로 `node_modules`를 생성한다.

추가로 git에서 관리하고 있는 `package-lock.json`은 삭제하면 안된다. 삭제 후 `npm install`을 하게되면 기존과는 다른 `node_modules` 트리로 `package-lock.json`이 생성된다. 이는 같이 협업하고 있는 다른 개발자들과 더 큰 comflict를 유발하기 때문에 더 복잡한 상황이 나타날 수 있다.

## lockfileVersion

npm v5와 v6은 lockfileVersion이 1인 `package-lock.json`을 생성한다. npm v7부터는 lockfileVersion이 2인 `package-lock.json`을 생성한다. 만약 lockfileVersion이 2인 `package-lock.json`을 가진 프로젝트에서 npm v5나 v6으로 `npm install`을 한다면 다음과 같이 메세지가 나타난다.

```
read-shrinkwrap This version of npm is compatible with lockfileVersion@1, but package-lock.json was generated for lockfileVersion@2. I'll try to do my best with it!
```

즉, lockfileVersion이 2인 `package-lock.json`에서 lockfileVersion이 1에 맞춰진 `package-lock.json`을 새롭게 생성한다.

> 반대로 기존에 lockfileVersion이 1인 `package-lock.json`을 가지고 있는 상태에서 lockfileVersion가 2인 `package-lock.json`을 생성하는 npm v7 이상으로 `npm install`을 하면 기존의 `package-lock.json`에 맞춰서 처리한다.

이렇게 팀원간에 npm 버전이 다르다면 `package-lock.json`이 달라질 수 있는 문제가 있을 수 있기 때문에 npm 버전을 맞추는 것이 필요해보인다.

## 참고

[https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json](https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json)

[https://velog.io/@whoyoung90/TIL-25-WECODE-React-LUSH-Cloning-npm-install%EC%98%A4%EB%A5%98-%ED%95%B4%EA%B2%B0](https://velog.io/@whoyoung90/TIL-25-WECODE-React-LUSH-Cloning-npm-install%EC%98%A4%EB%A5%98-%ED%95%B4%EA%B2%B0)

[https://junwoo45.github.io/2019-10-02-package-lock/](https://junwoo45.github.io/2019-10-02-package-lock/)