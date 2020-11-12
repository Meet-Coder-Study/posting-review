# 리눅스 명령어 - 검색
> 🕵️‍♀️ 검색 관련 명령어인 find, grep, locate를 정리했습니다. 
- [리눅스 명령어 - 검색](#리눅스-명령어---검색)
  - [find](#find)
    - [자주 사용되는 옵션](#자주-사용되는-옵션)
    - [예제](#예제)
  - [grep](#grep)
    - [자주 사용되는 옵션](#자주-사용되는-옵션-1)
    - [예제](#예제-1)
  - [locate](#locate)
    - [자주 사용되는 옵션](#자주-사용되는-옵션-2)
    - [예제](#예제-2)
- [참고자료](#참고자료)

## find
조건에 맞는 파일을 찾아 명령을 수행한다.

```
find [OPTIONS] path EXPR
```

### 자주 사용되는 옵션
1. 조건
- `-name` : 이름으로 검색
- `-regex` : regex에 매치로 검색
- `-empty` : 빈 디렉터리 혹은 빈 파일 검색
- `-size` : 사이즈로 검색(M, G로 표기 가능)
  - -N : 이하
  - +N : 이상
- `-type` : 파일 타입으로 검색
  - d : directory
  - p : named pipe
  - f : regular file
  - l : softlink
  - s : socket
- `-perm` : 퍼미션으로 검색
  - mode : 정확히 일치하는 파일
  - +mode : 모든 flag가 포함된 파일
  - /mode : 어떤 flag라도 포함된 파일

2. 액션
- `-delete` : 파일 삭제
- `-ls` : ls -dils 명령 수행
- `-print` : 파일 이름 출력 (default)
- `-printf` : 파일 이름을 포맷에 맞게 출력
- `-exec` : 주어진 명령 수행
- `-execdir` : 해당 디렉터리로 이동하여 명령 실행
- `-ok` : 사용자에게 확인 후 exec
- `-okdir` : 사용자에게 확인 후 실행 execdir

### 예제

```
# find .      
# find /
# find ~
```
- 현재 디렉토리(.)부터 파일을 찾는다.
- 루트 디렉토리(/)부터 파일을 찾는다.
- 홈 디렉토리(~)부터 파일을 찾는다.

```
# find . | grep eventdev_pipeline    
```
- 현재 디렉토리에서 "eventdev_pipeline" 내용이 있는 파일을 찾는다.

```
# find . -name "*.py"
```
- 현재 디렉토리에서 이름이 .py로 끝나는 파일을 찾는다.

```
# find . -empty
```
- 현재 디렉토리에서 빈 디렉토리 혹은 빈 파일을 찾는다.

```
# find . -type f
# find . -type d
```
- 현재 디렉토리에서 파일(f)을 찾는다. 
- 현재 디렉토리에서 디렉토리(d)를 찾는다.

```
# find . -perm 0777
# find . ! -perm 0777
```
- 현재 디렉토리에서 777 퍼미션을 가진 파일을 찾는다.
- 현재 디렉토리에서 777 퍼미션이 아닌 파일을 찾는다.
```
# find . -name "*.py" -exec stat {} \;
# find . -name "*.py" -execdir stat {} \;
```
- 현재 디렉토리에서 이름이 .py로 끝나는 파일을 찾아서 stat 명령을 수행한다.
- 현재 디렉토리에서 이름이 .py로 끝나는 파일을 찾아서 stat 명령을 수행한다. (해당 디렉토리로 이동)

```
# find . -name "*.py" -ok stat {} \;
# find . -name "*.py" -okdir stat {} \;
```
- 현재 디렉토리에서 이름이 .py로 끝나는 파일을 찾아서 사용자에게 확인 후 stat 명령을 수행한다. 
- 현재 디렉토리에서 이름이 .py로 끝나는 파일을 찾아서 사용자에게 확인 후 stat 명령을 수행한다. (해당 디렉토리로 이동)

```
# find / -type f -size +100M -exec rm -f {} \;
```
- 루트 디렉토리에서 크기가 100MB 이상의 파일을 찾아서 rm -f 명령을 수행한다.

> 참고 : [find의 더 많은 사용법](https://www.tecmint.com/35-practical-examples-of-linux-find-command/) 

## grep
파일 내용 중 원하는 내용을 찾는다.

```
grep [OPTIONS] PATTERN [FILE...]
```

### 자주 사용되는 옵션
- `-r` : recursive 
  - 하위 디렉토리까지 찾는다.
- `-i` : ignore case
- `-v` : invert match 
  - 패턴이 매치가 안되는 것을 찾아준다.
- `-q` : quiet mode 

### 예제

```
# grep stdio *.c
```
- *.c 파일들 중 "stdio"라는 내용이 있는 파일을 찾는다.

```
# grep fork *.c
# grep fork *.c -q
```
- *.c 파일들 중 "fork"라는 내용이 있는 파일을 찾는다.

```
# grep "\<for\>" *.c
```
- *.c 파일들 중 "for" 단어가 있는 파일을 검색한다. (단어 단위로 패턴을 검색한다.)
  - ex) for : 검색 o, fork : 검색 x


```
# grep "^int" *.c
```
- *.c 파일들 중 라인의 시작이 "int"인 파일을 검색한다.

```
# grep "^static.*(void)$" *.c
```
- *.c 파일들 중 라인의 시작(^)이 "static", 라인의 끝($)이 "(void)"인 파일을 검색한다.


## locate
파일의 위치를 찾아 보여준다. 이 명령은 find 명령처럼 디렉토리를 뒤지면서 파일 위치를 찾는 것이 아니라, updatedb라는 DB 안에 있는 파일 목록에서 파일 위치를 찾는다. 하루에 한 번 정기적으로 처리되기 때문에 처리되지 않은 파일을 검색할 경우 파일이 있음에도 위치를 찾지 못할 수 있다.

- mlocate : locate가 사용하는 데이터베이스
- updatedb : 데이터베이스 안에 있는 파일 목록. 리눅스 시스템에서 하루에 한 번 정기적으로 처리한다. 

```
locate [OPTION]... PATTERN...
```

### 자주 사용되는 옵션
- `-i`, `--ignore-casse` : 대소문자 구분없이 검색
- `-l`, `--limit`, `-n` LIMIT : 출력 결과를 LIMIT만큼 출력
- `--regex` : PATTERN을 regex로 해석

### 예제
```
# locate main.c
```
- main.c 파일의 위치를 찾는다. (절대 경로 기준)

```
# locate main.c -n 10
```
- main.c 파일의 위치를 10개 찾는다.

```
# locate --regex "/usr/src/.*\<main.c$"
```
- /usr/src/에 있는 ~main.c로 끝나는 파일의 위치를 찾는다.



# 참고자료
- [리눅스 커맨드라인 툴](https://www.inflearn.com/course/command-line/dashboard)
- [파일을 찾는 법](https://opentutorials.org/course/2598/14212)
- [find 명령의 35가지 예제](https://www.tecmint.com/35-practical-examples-of-linux-find-command/)