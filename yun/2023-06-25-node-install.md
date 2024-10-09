## nvm

[mvn](https://github.com/nvm-sh/nvm)는 노드 버전 메니저로 노드 여러 버전을 설치하고 필요에 따라 버전을 자유롭게 변경해주는 프로그램입니다.

### 설치 방법

#### curl 설치
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

### export 적용 

```bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

* `~/.bash_profile`, `~/.zshrc`, `~/.profile`, `~/.bashrc` 각자 환경에 적용

### 사용방법

### node version list

```bash
$ nvm ls-remote --lts

v14.21.2   (LTS: Fermium)
v14.21.3   (Latest LTS: Fermium)
v16.13.0   (LTS: Gallium)
v16.13.1   (LTS: Gallium)
v16.13.2   (LTS: Gallium)
v16.14.0   (LTS: Gallium)
v16.14.1   (LTS: Gallium)
v16.14.2   (LTS: Gallium)
v16.15.0   (LTS: Gallium)
v16.15.1   (LTS: Gallium)
v16.16.0   (LTS: Gallium)
v16.17.0   (LTS: Gallium)
v16.17.1   (LTS: Gallium)
v16.18.0   (LTS: Gallium)
v16.18.1   (LTS: Gallium)
v16.19.0   (LTS: Gallium)
v16.19.1   (LTS: Gallium)
v16.20.0   (LTS: Gallium)
v16.20.1   (Latest LTS: Gallium)
v18.12.0   (LTS: Hydrogen)
v18.12.1   (LTS: Hydrogen)
v18.13.0   (LTS: Hydrogen)
v18.14.0   (LTS: Hydrogen)
v18.14.1   (LTS: Hydrogen)
v18.14.2   (LTS: Hydrogen)
v18.15.0   (LTS: Hydrogen)
v18.16.0   (LTS: Hydrogen)
v18.16.1   (Latest LTS: Hydrogen)
```
설치 가능한 lts 버전 노드

### 설치

```bash
$ nvm install v10.24.1
$ nvm alias default v10.24.1
$ node -v 
```
특정 버전 설치 및 기본 버전으로 지정,


### 특정 버전 적용

```bash
$ nvm use v16.16.0
$ node --version
Found '/Users/yun/yun/yun-blog/.nvmrc' with version <10.24.1>
Now using node v10.24.1 (npm v7.18.1)
```
특정 노드 버전으로 지정, 만약 프로젝트에 설정하는 방법은 `.nvmrc` 파일에 `10.24.1`을 작성하고 nvm use를 사용하면 해당 버전으로 쉽게 지정 가능