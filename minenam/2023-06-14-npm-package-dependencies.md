# [npm] package.json - dependency vs devDependency vs peerDependency

## npm package.json에서의 의존성

npm(Node Package Manager)의 package.json 파일에서는 다양한 의존성(dependency)들이 정의되어 있다. 프로젝트에 사용되는 외부 패키지이나, 해당 프로젝트의 버전을 관리하는데 핵심적인 역할을 한다.

우선 npm init 으로 npm 을 설치하면 아래 예시와 같이 package.json 파일이 생성된다. 
(실제로 최초 설치시에는 내용이 적기 때문에 다른 라이브러리의 예시를 가져왔다)



<details>
<summary>ex. read-package-json | package.json </summary>

```json
{
  "name": "read-package-json",
  "version": "6.0.4",
  "author": "GitHub Inc.",
  "description": "The thing npm uses to read package.json files with semantics and defaults and validation",
  "repository": {
    "type": "git",
    "url": "https://github.com/npm/read-package-json.git"
  },
  "main": "lib/read-json.js",
  "scripts": {
    "prerelease": "npm t",
    "postrelease": "npm publish && git push --follow-tags",
    "release": "standard-version -s",
    "test": "tap",
    "npmclilint": "npmcli-lint",
    "lint": "eslint \"**/*.js\"",
    "lintfix": "npm run lint -- --fix",
    "posttest": "npm run lint",
    "postsnap": "npm run lintfix --",
    "postlint": "template-oss-check",
    "snap": "tap",
    "template-oss-apply": "template-oss-apply --force"
  },
  "dependencies": {
    "glob": "^10.2.2",
    "json-parse-even-better-errors": "^3.0.0",
    "normalize-package-data": "^5.0.0",
    "npm-normalize-package-bin": "^3.0.0"
  },
  "devDependencies": {
    "@npmcli/eslint-config": "^4.0.0",
    "@npmcli/template-oss": "4.15.1",
    "tap": "^16.0.1"
  },
  "license": "ISC",
  "files": [
    "bin/",
    "lib/"
  ],
  "engines": {
    "node": "^14.17.0 || ^16.13.0 || >=18.0.0"
  },
  "tap": {
    "branches": 73,
    "functions": 77,
    "lines": 77,
    "statements": 77,
    "nyc-arg": [
      "--exclude",
      "tap-snapshots/**"
    ]
  },
  "templateOSS": {
    "//@npmcli/template-oss": "This file is partially managed by @npmcli/template-oss. Edits may be overwritten.",
    "version": "4.15.1",
    "publish": "true"
  }
}
```

- 출처: [read-package-json | package.json](https://github.com/npm/read-package-json/blob/main/package.json)

</details>



> 많은 의존성이 공식 문서에 적혀있으나, 접근 빈도수가 높은 의존성 3가지를 정리해보았다.

### 의존성(dependencies)

프로젝트가 실행될 때 필요한 패키지를 지정하는 데 쓰인다.

애플리케이션을 제대로 작동시키려면 패키지가 필요한데, 프로젝트를 설치할 때 (`npm install` 등) 자동으로 나열된 의존성을 다운로드하고 설치한다.

런타임 환경에 프로젝트가 올바르게 작동하기 위해 필요하며, 일반적으로 프로덕션 환경에서 필요한 패키지를 뜻한다.

특정버전이 함께 명시되어야 일관된 설치가 가능하다.

### 개발 의존성(devDependency)

프로젝트 개발 및 테스트 단계에서만 필요한 패키지를 설치하는 데 사용된다. 

애플리케이션의 최종 빌드나 배포에서는 제외되며 테스트, 번들링, 트랜스파일링 등 개발 워크 플로우 개선에 쓰인다.

개발 의존성을 이용하면 production 빌드를 가볍게 유지할 수 있다.

### 피어 의존성(peerDependency)

자신이 패키지를 직접 만드는 경우, 다른 사람이 프로젝트 의존성으로 사용할 때 설치해야 하는 패키지를 지정하는데 사용한다.

직접 만든 패키지와 다른 사람의 프로젝트가 동일한 버전의 공유 의존성을 사용하므로 버전 충돌을 방지할 수 있다.

주로 플러그인, 확장 기능이나 다른 패키지와의 호환성을 위해 반드시 포함되어야 하는 패키지를 나타낸다.

<aside>
💡 npm 버전 3~6에서, 피어 의존성(peerDependencies)은 자동으로 설치되지 않고 유효하지 않은 피어 의존성이 발견되는 경우 경고문을 발생시킨다.
npm v7에서부터는 피어 의존성(peerDependencies)이 자동으로 설치된다.

</aside>


## 결론

**의존성(dependency)**

프로젝트의 런타임 및 production 환경에 필요한 필수 패키지

**개발 의존성(devDependency)**

개발 및 테스트에에 특화된 패키지

**피어 의존성(peerDependency)**

해당 패키지와 패키지를 사용하는 다른 프로젝트 간의 호환성을 보장하기 위한 의존성

**다양한 의존성 구분의 장점**

애플리케이션 실행을 위한 설치 과정을 간소화하고 빌드 시간을 개선하며 잠재적인 충돌 또는 호환성 문제를 피할 수 있음


## 참고자료
[package.json | npm Docs](https://docs.npmjs.com/cli/v8/configuring-npm/package-json?v=true#peerdependencies)
[Peer Dependencies | Node.js](https://nodejs.org/en/blog/npm/peer-dependencies)
[Difference between dependencies, devDependencies and peerDependencies - GeeksforGeeks](https://www.geeksforgeeks.org/difference-between-dependencies-devdependencies-and-peerdependencies/)