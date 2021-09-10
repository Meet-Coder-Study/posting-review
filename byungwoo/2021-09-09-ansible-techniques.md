# 미리 알았으면 좋을 Ansible 테크닉들
> 원문: [Five Ansible Techniques I Wish I’d Known Earlier](https://zwischenzugs.com/2021/08/27/five-ansible-techniques-i-wish-id-known-earlier/)

[Ansible Playbook](https://docs.ansible.com/ansible/latest/user_guide/playbooks_intro.html)에서 수많은 task를 테스트할 때마다 많은 시간을 들이고 있다면 이 글은 당신에게 도움이 될 것입니다. 

Ansible을 활용하여 디버깅하는 것은 때때로 지루하고 그 과정이 모호할 수 있습니다. (예를 들어 내가 사용하려는 변수는 어떤 것으로부터 값을 추출하여 배열로 만들어서 찾아야하는지 같은 상황이 여기에 해당합니다.) 그래서 저는 이 과정을 빠르게 할 수 있는 방법과 동작하는 내부에서는 어떠한 일들이 일어나고 있는지 이해할 수 있는 방법을 찾기 시작했습니다.

결과적으로는 다음과 같이 도움을 줄 수 있는 5가지 도구 혹은 테크닉을 찾았고 이를 공유합니다.

이 팁들은 사용하기 쉬운 것에서 어려운 것 순으로 나열되어 있습니다.

## 1) --step 옵션
가장 쉽게 적용하고 따라할 수 있는 테크닉입니다. [--step 옵션](https://docs.ansible.com/ansible/latest/user_guide/playbooks_startnstep.html#step-mode)을 `ansible-playbook` 명령어에 추가하면 다음과 같은 명령 프롬프트가 나타납니다.
```bash
PLAY [Your play name] ****************************************************************************************
Perform task: TASK: Your task name (N)o/(y)es/(c)ontinue:
```

각 태스크마다 태스크를 실행할지(`yes`), 실행하지 않을지(`no`, 기본값), 혹은 현재부터 나머지 모두 실행할지(`continue`)를 선택할 수 있습니다.

나머지 태스크를 모두 `yes`로 실행하고 싶을 때 `continue` 옵션은 유용합니다. 참고로 `continue`를 선택하면 해당 play의 나머지 태스크를 실행하는 것이지 playbook의 나머지 태스크를 실행하는 것은 아닙니다.  
(역주: [ansible의 구성요소는 playbook > play > task 층위를 가집니다.](https://devops.stackexchange.com/a/9833) 예를 들어 nginx를 설치하는 play에 이어서 nginx를 실행하는 play를 하나의 playbook에 넣었을 경우 continue를 선택한 task가 속한 play가 nginx 설치일 겨우 nginx 실행하는 play 실행하기 전까지만 실행합니다.)

엔터키를 눌러서 `yes`를 손쉽게 입력할 수 있으나 태스크가 많을 경우 본인이 확인하려는 태스크를 지나칠 수도 있으니 주의해야 합니다.

개인적인 생각으로는 ansible이 오픈소스 프로젝트이므로 `back`, `skip` 기능을 누군가 추가해주면 좋겠습니다.

## 2) 인라인 로깅
고전적인 형식의(old-fashioned) 로그를 표시하여 변수를 손쉽게 확인하는 방법도 있습니다. 다음의 코드는 호스트 변수들을 json 형태로 가독성 있게 출력합니다.
```yaml
# playbook 파일에 다음의 play를 추가합니다.
- name: dump all
  hosts: all
  tasks:
    - name: Print some debug information
      vars:
        msg: |
          Module Variables ("vars"):
          --------------------------------
          {{ vars | to_nice_json }}
          ================================

          Environment Variables ("environment"):
          --------------------------------
          {{ environment | to_nice_json }}
          ================================

          Group Variables ("groups"):
          --------------------------------
          {{ groups | to_nice_json }}
          ================================

          Host Variables ("hostvars"):
          --------------------------------
          {{ hostvars | to_nice_json }}
          ================================
      debug:
        msg: "{{ msg.split('\n') }}"
      tags: debug_info
```

## 3) ansible-lint
다른 대부분의 linter와 마찬가지로 [ansible-lint](https://ansible-lint.readthedocs.io/en/latest/)를 활용하여 코드상의 문제를 찾거나 [안티패턴](https://ko.wikipedia.org/wiki/%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4)이 있는지 확인할 수 있습니다.

`ansible-lint` 실행결과는 다음과 같은 형식을 취하고 있습니다.
```yaml
roles/rolename/tasks/main.yml:8: risky-file-permissions File permissions unset or incorrect
```

[.ansible-lint 파일을 활용하여 필요시 특정 에러나 경고를 무시하도록 규칙을 설정할 수 있습니다.](https://ansible-lint.readthedocs.io/en/latest/default_rules.html)

## 4) ansible-console
[ansible-console](https://docs.ansible.com/ansible/latest/cli/ansible-console.html)을 활용하면 ansible 개발에 드는 시간을 상당히 줄일 수 있지만 아쉽게도 활용방법에 대한 정보가 많이 없는 것 같아서 구체적으로 설명을 하고자 합니다.

```bash
$ ansible-console -i hosts.yml
Welcome to the ansible console.
Type help or ? to list commands.
imiell@all (1)[f:5]$
```

ansible-console을 실행하면 인사말과 함께 도움말이 나타납니다. `help`를 실행할 수 있는 모든 명령어와 모듈을 조회할 수 있습니다.

```bash
Documented commands (type help <topic>):
========================================
EOF             dpkg_selections  include_vars   setup
add_host        exit             iptables       shell
apt             expect           known_hosts    slurp
apt_key         fail             lineinfile     stat
apt_repository  fetch            list           subversion
assemble        file             meta           systemd
assert          find             package        sysvinit
async_status    forks            package_facts  tempfile
async_wrapper   gather_facts     pause          template
become          get_url          ping           timeout
become_method   getent           pip            unarchive
become_user     git              raw            uri
blockinfile     group            reboot         user
cd              group_by         remote_user    validate_argument_spec
check           help             replace        verbosity
command         hostname         rpm_key        wait_for
copy            import_playbook  script         wait_for_connection
cron            import_role      serial         yum
debconf         import_tasks     service        yum_repository
debug           include          service_facts
diff            include_role     set_fact
dnf             include_tasks    set_stats
```

내장 명령어(built-in command)일 경우 `help`를 활용하여 간단한 설명을 볼 수 있습니다.
```bash
imiell@all (1)[f:5]$ help become_user
Given a username, set the user that plays are run by when using become
```

모듈(module)의 경우 전체적인 설명과 함께 파라미터 정보를 볼 수 있습니다.
```bash
imiell@all (1)[f:5]$ help shell
Execute shell commands on targets
Parameters:
  creates A filename, when it already exists, this step will B(not) be run.
  executable Change the shell used to execute the command.
  chdir Change into this directory before running the command.
  cmd The command to run followed by optional arguments.
  removes A filename, when it does not exist, this step will B(not) be run.
  warn Whether to enable task warnings.
  free_form The shell module takes a free form command to run, as a string.
  stdin_add_newline Whether to append a newline to stdin data.
  stdin Set the stdin of the command directly to the specified value.
```

ansible-console이 빛을 발휘하는 순간은 다음과 같이 모듈을 빠르게 테스트할 때입니다.
```bash
imiell@basquiat (1)[f:5]$ shell touch /tmp/asd creates=/tmp/asd
basquiat | CHANGED | rc=0 >>

imiell@basquiat (1)[f:5]$ shell touch /tmp/asd creates=/tmp/asd
basquiat | SUCCESS | rc=0 >>
skipped, since /tmp/asd exists
```

실행하고자 하는 호스트가 여러 개인 경우 여러 호스트를 대상으로 한 번에 명령어를 실행할 수 있습니다.

실행하고자 하는 호스트를 구체적으로 지정하고 싶은 경우 `cd` 명령어를 사용하면 하나의 호스트, 그룹 혹은 여러개의 그룹과 호스트를 선택할 수 있습니다. 기본값은 `all`입니다. (디렉토리를 이동하는 것처럼 호스트를 변경한다고 보면 됩니다.)
```yaml
# basquiat이라는 호스트에만 실행하도록 변경
imiell@all (4)[f:5]$ cd basquiat
imiell@basquiat (1)[f:5]$ command hostname
basquiat | CHANGED | rc=0 >>
basquiat
```

만약 명령어가 help의 결과로 나온 ansible 명령어나 모듈이 아닐 경우, ansible-console은 일반 shell 명령어로 인식하여 실행합니다.

```bash
# echo는 ansible-console의 help에서 조회된 명령어가 아니라서 호스트에서 echo 명령어를 실행한다고 인식
imiell@basquiat (1)[f:5]$ echo blah 
basquiat | CHANGED | rc=0 >>
blah
```

자동완성 기능이 있기 때문에 손쉽게 사용이 가능합니다.
```bash
imiell@basquiat (1)[f:5]$ expect <TAB><TAB>
chdir=      command=    creates=    echo=       removes=    responses=  timeout=
imiell@basquiat (1)[f:5]$ expect
```

## 5) Ansible Debugger
Ansible에는 실행 과정 중간에 자세히 확인할 수 있는 [디버거](https://docs.ansible.com/ansible/latest/user_guide/playbooks_debugger.html)를 포함하고 있습니다. 다음의 play를 playbook 중간에 추가합니다.
```yaml
- hosts: all
  debugger: on_failed
  gather_facts: no
  tasks:
    # 테스트를 위해서 강제로 실패하는 fail 태스크 사용
    - fail:
```
```bash
# ansible-playbook을 실행하여 디버그 모드로 진입
$ ansible-playbook playbook.yml
PLAY [all] ***************************
TASK [fail] **************************
Friday 27 August 2021  12:16:24 +0100 (0:00:00.282)       0:00:00.282 *********
fatal: [Ians-Air.home]: FAILED! => {"changed": false, "msg": "Failed as requested from task"}
[Ians-Air.home] help
EOF  c  continue  h  help  p  pprint  q  quit  r  redo  u  update_task
```
디버그 모드로 진입하면 파이썬 명령어를 직접 사용할 수 있습니다.
```bash
[Ians-Air.home] TASK: wrong variable (debug)> dir()
['host', 'play_context', 'result', 'task', 'task_vars']
```

혹은 디버거에서 제공하는 커맨드를 사용할 수 있습니다. 예를 들어 `p`는 pretty-print 명령어를 수행하며 다음과 같이 사용할 수 있습니다. 
```bash
[Ians-Air.home] TASK: wrong variable (debug)> p dir(task)
['DEPRECATED_ATTRIBUTES',
 '__class__',
 '__delattr__',
 '__dict__',
 '__doc__',
[...]
 'tags',
 'throttle',
 'untagged',
 'until',
 'validate',
 'vars',
 'when']
```