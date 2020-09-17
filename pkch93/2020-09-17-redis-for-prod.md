# redis 운영상 주의점

참고: [https://sehajyang.github.io/2019/12/11/how-to-operate-redis/](https://sehajyang.github.io/2019/12/11/how-to-operate-redis/)
Toast 기술블로그: [https://meetup.toast.com/posts/227](https://meetup.toast.com/posts/227)

## 메모리 관리 잘하자!

메모리를 실제 메모리 사용량 이상으로 사용하게 되면 swap을 사용하게 된다. swap은 디스크 영역을 사용하는 것으로 매우 느려진다. 따라서 swap을 사용하지 않도록 메모리 관리하는 것이 중요. 보통 Redis가 느려지는 이유가 바로 swap을 사용하기 때문이다.

큰 메모리를 사용하는 하나의 Redis 인스턴스보다는 적은 메모리의 여러 Redis 인스턴스를 사용하는 것이 안전하다.

### Maxmemory를 설정하더라도 이보다 더 사용할 가능성이 크다.

> maxmemory의 권장 값은 가용 메모리의 60~70%이다.

Redis는 메모리 allocator에 의존하는데 `jemaloc` 이는 1바이트만 사용한다고 해도 페이지 단위에 따라 메모리를 할당하므로 4KB를 할당하게 된다. 이처럼 메모리 파편화가 일어나는 경우 레디스 사용량과 jemaloc 할당량이 달라진다.

Redis는 4버전부터 메모리 파편화가 일어날 수 있으므로 주의가 필요하다.

메모리를 효율적으로 사용하기 위해서는 Hash, Sorted Set, List보다 가능하다면 ZipList를 사용하는 것이 보다 효율적으로 메모리를 사용할 수 있다. `30%까지 메모리를 아낄 수 있다.`

### RSS 값 모니터링 필요

rss란 운영체제에서 봤을 때 Redis가 할당한 byte의 수를 의미한다.

특히 Redis는 메모리 파편화가 발생하기 쉬우므로 항상 RSS 실제 물리 메모리 사용량을 모니터링한 후 어느 수준의 증가가 보인다면 다른 장비로 데이터를 이전해야한다.

## Redis는 Single Thread

Redis는 Single Thread로 작동한다. 때문에 동시에 여러 명령을 처리할 수 없으므로 시간이 오래 걸리는 명령어를 사용을 자제해야한다.

때문에 Redis에서 제공하는 O(n) 시간복잡도의 명령은 자제해야한다. 대표적으로 `KEYS`, `FLUSHALL`, `FLUSHDB`, `SAVE`, `MONITOR` `Delete Collections`, `Get All Collections` 등이 있다.

### 실수 사례

- Key가 100만개 이상인데 `keys *` 명령을 사용한 경우

  이 경우는 SCAN 명령으로 대체할 수 있다. SCAN으로 짧게 여러번 명령하는 방식으로 KEYS를 대체한다.

- 아이템의 갯수가 몇만개 있는 hash, sorted set, set에서 모든 데이터를 가져오는 경우

  아이템 갯수를 여러 Collection들로 나눠서 저장한다. 개당 만개 이하로 저장하는 것이 좋다.

- Spring Security Oauth redis tokenstore

## redis.conf

참고: [https://meetup.toast.com/posts/227](https://meetup.toast.com/posts/227)

Redis를 설치한 후 기본 파라미터 값을 그대로 사용하는 것으로도 생각지 못한 장애를 유발할 수 있다.

- 보안을 위한 파라미터

  ```
  bind <server IP>
  protected-mode yes
  requirepass <password>
  ```

  위와 같이 `protected-mode`를 사용하게 되면 bind 된 서버들만 redis에 접근가능하다. requirepass는 redis에 접속할 때 사용할 password를 설정하는 것이다.

- persistence

  ```
  # RDB
  save ""
  stop-writes-on-bgsave-error no

  # AOF
  appendonly no
  auto-aof-rewrite-percentage 100
  ```

  캐시용도라면 RDB 파일을 저장하는 옵션인 `save`는 `""`로 설정하는 것을 권장. 만약 이 설정을 켜야한다면 `stop-writes-on-bgsave-error`를 끌 것! 이 옵션이 `yes`라면 RDB에 파일 저장이 실패하자마자 Redis에 write할 수 없게 된다.

  AOF파일을 저장하는 옵션인 `appendonly`도 캐시용으로 사용한다면 `no`로 설정해야한다. 그리고 `appendonly`한 AOF 파일은 rewrite하지 않으면 계속해서 늘어나므로 `auto-aof-rewrite-percentage`는 100으로 지정하여 주기적으로 rewrite하도록 해야한다.

- Replication

  ```
  replicaof <마스터ip> <마스터port>
  masterauth <마스터의 requirepass>
  ```

  설정 파일에 마스터 정보를 지정한 채로 서버를 시작할 수 있도록 할 수 있다.

- 기타

  ```
  daemonize yes
  ```

  기본적으로 `daemonize`는 `no`로 설정된다. 이 경우 redis는 foreground로 실행이 되므로 터미널을 끄거나 `Ctrl+C`를 누르면 Redis가 종료된다. 반면 `daemonize`가 `yes`라면 Redis를 background로 실행하게 되므로 yes로 설정하는 것이 좋다.

  ```
  maxmemory <가용 메모리의 60~70%>
  maxmemory-policy <policy>
  ```

  `maxmemory` 값이 0이면 redis는 swap 메모리를 사용할 때까지 메로리가 계속 커질 수 있다. 권장하는 `maxmemory` 값은 가용 메모리의 60~70% 선이다.

  메모리가 가득찼을 때 데이터를 어떻게 처리할지에 대한 정책은 `maxmemory-policy`에 따라 달라진다. 기본값은 `noeviction`으로 메모리가 가득찬다면 더이상 새로운 입력을 받지 않는 정책이다. 즉, 메모리가 가득차면 Redis write를 할 수 없는 상황이 되는 것이다.

  그외 값으로는 `volatile_lru`, `allkeys_lru` 등이 있다. `volatile_lru`는 TTL이 적용된 데이터만 lru방식으로 삭제한다. 때문에 TTL 없이 Redis를 사용한다면 `noeviction`과 크게 다르지 않다. 반면 `allkeys_lru`는 TTL에 상관없이 모든 저장된 데이터에 대해 lru 방식으로 삭제한다.
