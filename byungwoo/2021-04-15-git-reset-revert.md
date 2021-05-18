# Git 되돌리기: Reset, Revert (feat. 타임스톤)

개발을 하다보면 과거의 특정 시점으로 되돌려야 하는 경우가 있습니다. 그때마다 우리는 혹시나 하는 마음에 현재 코드를 일단 백업(~~복사~~)해놓고 `git 되돌리기`라고 검색을 하기 시작합니다.

Git을 활용하여 과거의 상태로 되돌리는 것은 생각보다 조심스러운 작업입니다.

마치 마블 코믹스의 닥터스트레인지가 위기상황에서만 조심스럽게 사용하는 타임스톤인 셈입니다.

이 글에서는 Git을 활용하여 과거로 되돌아갈 수 있는 git reset과 git revert에 대해서 알아보겠습니다.

![time-stone](./images/using-time-stone.jpeg)
<center>(우리도 잘 써봅시다)</center>

## 준비
다음과 같이 git 저장소을 초기화한 후에 파일을 생성하고, 생성한 파일을 Staging Area에 올리고 commit을 만듭니다.
총 3번을 반복하여 3개의 commit을 준비합니다.

```bash
# 처음부터 다시 시작하고 싶으시면 `rm -rf .git`으로 초기화하시면 됩니다. 
git init

# 첫번째 commit
echo first > first.txt
git add first.txt
git commit -m "add first.txt"

# 두번째 commit
echo second > second.txt
git add second.txt
git commit -m "add second.txt"

# 세번째 commit
echo third > third.txt
git add third.txt
git commit -m "add third.txt"
```

총 세 번의 commit을 완료한 후에 다음과 같이 commit log를 확인할 수 있습니다.
(실습을 위해서 git 저장소를 초기화하고 다시 commit을 만들때마다 hash값이 계속 바뀌기 때문에 편의상 `${*_commit_hash}`와 같이 표현하였습니다.)
```bash
> git log --oneline
${third_commit_hash} (HEAD -> master) add third.txt
${second_commit_hash} add second.txt
${first_commit_hash} add first.txt
```

## git rev-parse
과거로 시간을 되돌리기 전에 어느 정확히 어느 시점으로 돌아가야하는지 확인이 필요합니다. 
git은 캐럿(^)을 활용하여 상대참조하는 방식으로 명시한 commit id(hash)를 찾을 수 있습니다.

```bash
> git rev-parse HEAD
${third_commit_hash} # add third.txt (HEAD)
> git rev-parse HEAD^
${second_commit_hash} # add second.txt
> git rev-parse HEAD^^
${first_commit_hash} # add first.txt
```

## git reset
git reset을 활용하면 과거 특정 시점으로 코드와 변경이력을 되돌릴 수 있습니다. git reset은 soft, mixed, hard 옵션에 따라서 다른 방식으로 작동합니다.

### git reset --soft
`git reset --soft`를 사용하게 되면 현재 시점의 파일들을 그대로 보존하고 Staging Area도 유지한 상태에서 커밋만 과거로 돌릴 수 있습니다. 아래와 같이 첫번째 커밋으로 `--soft` 옵션으로 돌아간다고 할 때 첫 번째 커밋 메세지까지만 남지만 두번째, 세번째 파일 모두 Staging Area에 올라와 있는 것을 볼 수 있습니다.
```bash
> git reset --soft HEAD^^

> git log --oneline
${first_commit_hash} (HEAD -> master) add first.txt

> git status
On branch master
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   second.txt
	new file:   third.txt
```

### git reset --mixed
`git reset --mixed`를 사용하게 되면 현재 시점의 파일들을 그대로 보존하지만 Staging Area에서는 모두 제외된 것을 확인할 수 있습니다. `git reset`의 기본옵션은 `--mixed`이므로 생략 가능합니다. 커밋도 특정 시점으로 돌아가고 Staging Area에 있는 파일들도 전부 내리고 싶을 때 사용합니다.
```bash
> git reset --mixed HEAD^^ # git reset HEAD^^

> git log --oneline
${first_commit_hash} (HEAD -> master) add first.txt

> git status
git status
On branch master
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	second.txt
	third.txt

nothing added to commit but untracked files present (use "git add" to track)
```

### git reset --hard (주의!)
`git reset --hard`를 사용하게 되면 파일과 커밋 모두 명시된 시점으로 돌립니다. 여기서 주의할 점은 git reset --hard를 통해서 과거 커밋으로 이동할 경우 **파일을 되돌릴 수 없다**는 점입니다. 따라서 `--hard` 옵션은 신중하게 사용하거나 유사시 복구할 수 있는 저장소가 있는 경우에만 사용합니다. 
```bash
> git reset --hard HEAD^^ 

> git log --oneline
${first_commit_hash} (HEAD -> master) add first.txt

> git status
On branch master
nothing to commit, working tree clean
```

위의 3가지의 옵션을 어느 때에 사용할지 판단하기 어려울 수가 있는데 이와 관련된 [stackoverflow 답변](https://stackoverflow.com/a/50022436) 을 공유합니다.  
- soft: uncommit changes, changes are left staged (index). (과거로 돌아가서 Staging Area도 현재와 같이 유지하고 싶을 때. ~~git add 안해도 되서 편하네~~)
- mixed (default): uncommit + unstage changes, changes are left in working tree. (과거 시점으로 돌아가고 Staging Area에 있는 파일도 모두 제거하고 싶을 때. ~~git add도 내가 다시 할래~~)
- hard: uncommit + unstage + delete changes, nothing left. (현재의 코드, 커밋에 미련없이 과거로 돌아가고 싶을 때. ~~현재에 미련없음. 나 돌아갈래.~~)


# Git Revert
`git revert`로 과거로 돌릴 수도 있습니다. 그러나 reset과 다르게 revert는 과거로 돌린 이력이 커밋 메세지로 남는다는 특징이 있습니다.

git revert를 사용하여 네번째 커밋으로 revert를 실행한 이력이 다음과 같이 남습니다.

```bash
> git revert HEAD^
[master ${fourth_commit_hash}] Revert "add second.txt"
 1 file changed, 1 deletion(-)
 delete mode 100644 second.txt
 
> git log --oneline
${fourth_commit_hash} (HEAD -> master) Revert "add second.txt"
${third_commit_hash} add third.txt
${second_commit_hash} add second.txt
${first_commit_hash} add first.txt

> ls
first.txt third.txt # 두번째 커밋을 revert했으므로 첫번째, 세번째 파일만 남음
```

git revert는 다음과 같이 커밋과 커밋의 범위로 지정할 수 있습니다.

예를 들어 second.txt와 third.txt 파일을 모두 삭제하고 싶다면 `${시작}..${끝}`와 같이 범위를 지정하여 revert할 수 있습니다. 여기서 주의할 점은 2,3번째 커밋을 수정하고 싶아면 1번째..3번째 커밋을 범위로 지정해야 합니다.
```bash
> git revert HEAD^^..HEAD
# 위와 동일: git revert ${second_commit_hash}^..${third_commit_hash}
# 위와 동일: git revert ${first_commit_hash}..${third_commit_hash}

> git log --oneline
${fifth_commit_hash} (HEAD -> master) Revert "add second.txt"
${fourth_commit_hash} Revert "add third.txt"
${third_commit_hash} add third.txt
${second_commit_hash} add second.txt
${first_commit_hash} add first.txt

> ls
first.txt # 두번째~세번째 커밋을 revert했으므로 첫번째 파일만 남음
```

# 참고
- [[초보용] Git 되돌리기( Reset, Revert )](https://www.devpools.kr/2017/02/05/%EC%B4%88%EB%B3%B4%EC%9A%A9-git-%EB%90%98%EB%8F%8C%EB%A6%AC%EA%B8%B0-reset-revert/)
- [[ GIT ] 작업 되돌리는 명령어 Reset & Revert](https://velog.io/@ha0kim/GIT-%EC%9E%91%EC%97%85-%EB%90%98%EB%8F%8C%EB%A6%AC%EB%8A%94-%EB%AA%85%EB%A0%B9%EC%96%B4-Reset-Revert)
- [7.7 Git 도구 - Reset 명확히 알고 가기
  ](https://git-scm.com/book/ko/v2/Git-%EB%8F%84%EA%B5%AC-Reset-%EB%AA%85%ED%99%95%ED%9E%88-%EC%95%8C%EA%B3%A0-%EA%B0%80%EA%B8%B0)
- [Git 다음 단계로](https://violetboralee.medium.com/git-next-level-25433466753a)
- [How to retrieve the hash for the current commit in Git?](https://stackoverflow.com/questions/949314/how-to-retrieve-the-hash-for-the-current-commit-in-git)