# redis

In-Memory Data Structure Store `BSD 3 License - 오픈소스`

다양한 자료구조들을 지원한다. `Strings, set, sorted-set, hashes, list, Hyperloglog, bitmap, geospatial index, Stream`

Remote Data Store로서 여러 서버에서 데이터를 공유할 때 주로 사용한다. (ex. Session 등으로 사용)
Redis는 싱글스레드로 동작하여 Atomic을 보장한다.
주로 인증 토큰 저장, Ranking 보드 `Sorted Set`, 유저 API Limit 등에 사용한다.

## Data Structure

redis data-type: [https://redis.io/topics/data-types](https://redis.io/topics/data-types)

Redis는 단순 key-value 저장소가 아닌 value에 다양한 형태의 자료구조를 지원하는 서버이다. 즉, 전통적인 key-value 저장소에서 벗어나 여러 복잡한 자료구조의 형태를 value로 가질 수 있는 데이터 저장소이다.

### Redis Keys

Redis는 key-value 저장소이다. 따라서 Redis에 값을 저장하기 위해서는 무조건 key를 지정해야한다. Redis 공식문서에서는 key를 지정하기 위한 몇몇 룰을 소개하고 있다.

1. 너무 긴 key는 자제할 것.

    너무 긴 key는 메모리 낭비일 뿐 아니라 데이터에서 키를 탐색할 때 오버헤드를 불러일으킨다. 만약 어쩔 수 없이 크기가 큰 key를 사용해야 한다면 해싱을 추천한다.

2. 매우 짧은 key도 자제.

    매우 짧은 key는 가독성 측면에서 문제를 일으킬 수 있다. 짧은 key가 메모리를 작게 잡아먹음은 분명하지만 가독성을 해칠 정도로 너무 짧은 key는 피할 것.

3. 스키마를 고정시킬 것.

    예를 들어 `object-type:id` 방식이 있다. 이 양식을 따른다면 `user:1000`과 같이 key로 사용할 수 있다. redis에서는 multi-words 필드를 사용할 때는 `.`이나 `-`를 주로 사용한다. `comment:1234:reply.to or comment:1234:reply-to`

4. key 길이는 512MB를 넘지말 것.

    key의 자료구조가 string이므로 최대 512MB까지 지원한다.

### Redis Data Type

- Strings `Key/Value`

    > binary-safe strings
    참고로 binary-safe String은 길이가 정해지지 않은 문자열을 구현하기 위해 사용하는 방법이며 Redis에서는 한 String에 512MB까지 지정할 수 있다.

    참고: [https://stackoverflow.com/questions/44377344/what-is-a-binary-safe-string](https://stackoverflow.com/questions/44377344/what-is-a-binary-safe-string)

    Key-Value 형태로 값을 저장하는 형태. 이때 Key를 어떻게 저장할 지가 중요하다.
    prefix를 앞으로 붙일지, 뒤로 붙일지 등으로 key의 분산이 바뀔 수 있다.

    > 아마 key 분산이 중요한 이유는 redis cluster에서 key의 범위를 기반으로 노드 할당을 지원하기 때문으로 보임. `좀더 서치 필요`
    [http://redisgate.kr/redis/cluster/cluster_introduction.php](http://redisgate.kr/redis/cluster/cluster_introduction.php)

    string은 value의 타입으로 많이 사용되는 타입이다. HTML을 캐싱하는 등으로 유용하게 사용되고 있다.

    ![](https://user-images.githubusercontent.com/30178507/90517500-6f818e80-e1a0-11ea-8248-c65d16464ec2.png)

    위와 같이 `set <key> <value>`로 값을 등록하고 `get <key>`로 값 조회를 할 수 있다.
    이때 주의할 점은 `set` 명령을 했을 때 이미 등록된 key를 대상으로 한다면 해당 값을 대체한다.

    ![](https://user-images.githubusercontent.com/30178507/90517538-7f00d780-e1a0-11ea-8b30-c92d361fb1f2.png)

    그리고 set 명령에는 특별한 옵션이 있다. set은 기본적으로 이미 존재하는 키가 있다면 value를 대체한다. 이때 `nx` 옵션으로 이미 존재하는 키가 있다면 대체하지 못하도록 만들 수 있다.

    ![](https://user-images.githubusercontent.com/30178507/90517574-8b853000-e1a0-11ea-9704-df8549af6bb3.png)

    이렇게 set 명령 뒤에 `nx`를 넣어주는 경우 이미 있는 값이면 `nil`이 나타나게 된다.

    value는 모든 종류의 string `binary 포함`을 지원한다. 즉, 512MB를 넘지 않는 jpeg 이미지 등도 저장이 가능하다.

    또한 `mset`, `mget`으로 여러 `key-value`를 저장, 조회할 수 있다.

    ![](https://user-images.githubusercontent.com/30178507/90517602-95a72e80-e1a0-11ea-9873-21c08d431e13.png)

    위와 같이 `mset <key1> <value1> <key2> <value2> ... <keyN> <valueN>`으로 여러 `key-value`를 저장할 수 있다.

    마찬가지로 `mget <key1> <key2> ... <keyN>`으로 여러 key의 값을 조회할 수 있다. 위 예시에서 이전에 저장했던 name도 함께 조회할 수 있음을 알 수 있다.

    참고로 mget을 사용하면 Redis에서는 array로 값을 전달한다.

## List

참고로 List라는 자료구조는 순서를 가지는 값들의 집합이다.

기본적으로 Redis에서는 Linked List를 사용한다. 즉, 삽입, 삭제에 강력한 성능을 보인다. 반면, 조회 성능에 단점을 가진다. Array로 구현된 List라면 인덱스를 통해 O(1)의 시간복잡도를 가지지만 Linked List로 구현된 List는 O(n)의 시간복잡도를 가진다.

- 값을 List에 삽입할 때 `lpush와 rpush`

    lpush는 원소를 List의 head `앞부분`에서부터 삽입할 때, rpush는 tail `뒷부분`에서부터 삽입할 때 사용한다.

    ![https://user-images.githubusercontent.com/30178507/91317027-7dfd2500-e7f4-11ea-8d2b-0356f2122848.png](https://user-images.githubusercontent.com/30178507/91317027-7dfd2500-e7f4-11ea-8d2b-0356f2122848.png)

    위와 같이 lpush로 `1, 2`를 넣고 rpush로 `3`을 넣는 경우 `2, 1, 3`의 결과를 볼 수 있다. 

    > 참고로 리스트의 값을 확인할 때는 `lrange 0 -1`로 할 수 있다.
    여기서 -1은 마지막을 의미한다.
    `rrange`는 존재하지 않음

- 값을 List에서 빼낼 때 `lpop과 rpop`

    Redis의 pop은 List에서 값을 빼냄과 동시에 빼낸 값을 반환하는 명령이다.
    push와 마찬가지로 `lpop`은 List의 head부분 부터 빼낼 때, `rpop`은 반대로 tail 부분부터 빼낼 때 사용한다.

    ![https://user-images.githubusercontent.com/30178507/91317490-1398b480-e7f5-11ea-98dc-dde50bf1888c.png](https://user-images.githubusercontent.com/30178507/91317490-1398b480-e7f5-11ea-98dc-dde50bf1888c.png)

    아까 `2, 1, 3`의 순서로 들어간 mylist에 `lpop`과 `rpop`을 한번씩 수행하면 각각 2와 3의 값이 도출되는 것과 mylist에 1만 남아있는 것을 확인할 수 있다.

    Blpop/Brpop: 데이터를 push하기 전까지 대기

- 여러 값 잘라내기 `ltrim`

    List는 위와 같이 값을 저장하는 용도로도 사용할 수 있지만 최신의 값들을 관리하는데 사용하기도 한다. Redis는 이런 기능의 List를 지원한다. 이를 사용하기 위해서는 `ltrim` 명령어가 필요하다.

    ![https://user-images.githubusercontent.com/30178507/91317540-24e1c100-e7f5-11ea-85b4-f1707afca0dd.png](https://user-images.githubusercontent.com/30178507/91317540-24e1c100-e7f5-11ea-85b4-f1707afca0dd.png)

    방금 1만 남은 mylist에 2부터 10까지 값을 `rpush`로 넣었다.

    > 참고로 여러 값을 입력하면 multi insert가 된다.

    `ltrim`은 간단하다. `lrange`가 시작 인덱스부터 끝 인덱스까지 값을 보여주는 반면 `ltrim`은 시작-끝 인덱스의 값을 제외하고는 모두 버린다. 따라서 `ltrim mylist 0 2` 명령으로 `1, 2, 3`만 mylist에 남게되었다.

    > `lrange`와 마찬가지로 `ltrim`도 `rtrim`은 존재하지 않는다.

- List의 Blocking Operation `blpop과 brpop`

    polling의 개념을 따르는 `pop` 명령이다.
    polling 위키 참고: [https://ko.wikipedia.org/wiki/폴링_(컴퓨터_과학)](https://ko.wikipedia.org/wiki/%ED%8F%B4%EB%A7%81_(%EC%BB%B4%ED%93%A8%ED%84%B0_%EA%B3%BC%ED%95%99))

    즉, 값이 없는 경우 기존의 `lpop`이나 `rpop`은 null을 반환한다. 이를 해소하기 위해 값을 `pop`할 수 있을때까지 `pop` 명령을 계속해서 시도하는 명령이다.

    단, `blpop`과 `brpop`은 이런 단점을 가지고 있다.

    1. List가 비어있는 경우 Redis와 client에게 쓸모없는 명령을 하도록 강요한다. 즉, 비어있는 List에 오는 모든 명령을 null로 반환한다.
    2. null을 수신한 이후에 일정 시간 기다리므로 지연을 유발한다. 또한 polling으로 쓸데없는 요청을 유발한다.

    `blpop`과 `brpop`은 다음과 같이 사용한다.

    ```
    blpop(또는 brpop) <list 명> <timeout>
    ```

    이때, timeout의 기본 시간 단위는 초이다.

    ![https://user-images.githubusercontent.com/30178507/91317696-5490c900-e7f5-11ea-83cd-7ae448efaf2d.png](https://user-images.githubusercontent.com/30178507/91317696-5490c900-e7f5-11ea-83cd-7ae448efaf2d.png)

    다음과 같이 `1, 2, 3`이 있는 mylist에 `brpop`을 사용하면 바로 마지막에 위치한 3을 반환한다.

    ![https://user-images.githubusercontent.com/30178507/91317754-64101200-e7f5-11ea-80d2-5252acb44481.png](https://user-images.githubusercontent.com/30178507/91317754-64101200-e7f5-11ea-80d2-5252acb44481.png)

    반면 아무것도 없는 mylist에 1초의 타임아웃 기간동안 아무 값이 없으면 null을 반환한다.

    ![https://user-images.githubusercontent.com/30178507/91317764-65d9d580-e7f5-11ea-9347-554f2a5c6c19.png](https://user-images.githubusercontent.com/30178507/91317764-65d9d580-e7f5-11ea-9347-554f2a5c6c19.png)

    만일 아무것도 없는 mylist에 100초의 타임아웃을 줄 경우 다음과 같이 block 상태로 기다린다.

    ![https://user-images.githubusercontent.com/30178507/91317769-683c2f80-e7f5-11ea-8d3a-af1e1c34918d.png](https://user-images.githubusercontent.com/30178507/91317769-683c2f80-e7f5-11ea-8d3a-af1e1c34918d.png)

    ![https://user-images.githubusercontent.com/30178507/91317782-6c684d00-e7f5-11ea-8acf-005393f546c4.png](https://user-images.githubusercontent.com/30178507/91317782-6c684d00-e7f5-11ea-8acf-005393f546c4.png)

    이때 mylist에 값을 넣어준다면 `brpop`이 동작하면서 block에서 풀리게된다.

## Hash

Hash는 Objects를 표현하기 위한 방법이다. hash에는 메모리가 허용하는 한계까지 `즉, 무한대` 값을 넣을 수 있다. Hash는 field-value 쌍으로 이뤄진다.

- Hash에 여러 값을 넣을때는 `HMSET`

    ```
    hmset <key> <field> <value> {...<field> <value>}
    ```

    위와 같이 hash로 값을 넣을때 하나의 key와 해당 key에 담을 field-value 쌍을 넣어준다.

    ![https://user-images.githubusercontent.com/30178507/92742780-ecc4ab80-f3ba-11ea-8090-b3ce0e09a4e4.png](https://user-images.githubusercontent.com/30178507/92742780-ecc4ab80-f3ba-11ea-8090-b3ce0e09a4e4.png)

    위와 같이 `person:1`이라는 key에 `name-pkch`, `age-28`로 값을 넣을 수 있다.

- Hash 값 조회에는 `HGET`과 `HMGET`

    Hash를 조회하기 위한 명령으로는 `HGET`과 `HMGET`이 있다. `HGET`은 조회하려는 key의 하나의 field만 조회할 수 있는 반면 `HMGET`은 여러 field를 array형태로 조회하는 명령어이다.

    ![https://user-images.githubusercontent.com/30178507/92742787-ee8e6f00-f3ba-11ea-8554-a3b92eab7fbc.png](https://user-images.githubusercontent.com/30178507/92742787-ee8e6f00-f3ba-11ea-8554-a3b92eab7fbc.png)

    위와 같이 `HGET`은 하나의 field의 value를 조회하는 반면 `HMGET`은 여러 필드의 값을 array로 조회할 수 있다.

    만약 없는 field를 조회한다면 `nil`을 반환한다.

## Sets

Redis의 Sets은 HashTable을 사용하고 정렬이 되어있지 않은 strings 컬랙션이다.

> 참고로 set에 들어가는 element를 member라고 한다.

- Sets에 값 넣기 `SADD`

```
sadd <key> <member> {...member}
```

![https://user-images.githubusercontent.com/30178507/92742793-efbf9c00-f3ba-11ea-85e5-1039b908807c.png](https://user-images.githubusercontent.com/30178507/92742793-efbf9c00-f3ba-11ea-85e5-1039b908807c.png)

위 예시는 set이라는 key에 `1,2,3` member를 넣은 명령이다.

SMEMBERS: 해당 키에 저장된 모든 값 가져오기
SISMEMBER: 존재하는지 안하는지 파악

- 저장된 모든 값 조회하기 `SMEMBERS`

```
smemebers key
```

![https://user-images.githubusercontent.com/30178507/92742801-f1895f80-f3ba-11ea-9ff3-8e2e97b8b8c2.png](https://user-images.githubusercontent.com/30178507/92742801-f1895f80-f3ba-11ea-9ff3-8e2e97b8b8c2.png)

위 예시는`sadd`로 저장한 set이라는 key를 조회하는 명령이다. 

- Sets에 값이 있는지 확인하기 `SISMEMBER`

```
sismember key member
```

해당 key에 member가 있는지 없는지 확인하기 위한 명령어이다.

![https://user-images.githubusercontent.com/30178507/92742813-f3ebb980-f3ba-11ea-93e0-a7de1534a2d0.png](https://user-images.githubusercontent.com/30178507/92742813-f3ebb980-f3ba-11ea-93e0-a7de1534a2d0.png)

위와 같이 해당 key에 값이 있다면 1, 없다면 0을 반환한다.

- 다른 Set 사이의 교집합 구하기 `SINTER`

```
sinter key <...key>
```

위와 같이 여러 key와 함께 `SINTER`를 사용하면 해당 key를 가진 Sets들의 교집합을 구할 수 있다.

- 랜덤으로 Sets의 값 뽑아내기 `SPOP`

```
spop key count
```

해당 key를 가진 Sets에서 count 만큼 값을 뽑아내는 Command

- 다른 Sets에서 합집합 구하기 `SUNION`

```
sunion key <...key>
```

여러 key를 가진 Sets 사이의 합집합을 구하는 Command

> 차집합의 경우는 `SDIFF`를 사용한다.

- 다른 Sets의 합집합을 원하는 Sets에 저장하기 `SUNIONSTORE`

```
sunionstore destination key <...key>
```

key로 주어진 Sets들의 합집합을 destination의 Sets으로 저장하는 Command

> 차집합의 경우는 `SDIFFSTORE`를 사용한다.

- Sets 내부의 element 갯수를 알고싶을땐 `SCARD`

```
scard key
```

key의 Sets이 가진 element의 갯수를 반환한다.

- Sets에서 값을 제거하지 않고 랜덤으로 하나 조회할 때는 `SRANDMEMBER`

```
srandmember key <count>
```

key의 Sets에서 count만큼 값을 가져오는 Command
`SPOP`과 차이점은 조회하는 값을 Sets에서 제거하지 않는다는 점이다.

## Sorted Sets

Sorted Sets는 Set과 Hash의 기능을 섞은 것과 유사하다. Sorted Sets은 Sets 내부의 element가 정렬이 되어있는 자료구조이다. 정렬의 기준은 모든 element에 매겨져있는 score를 기준으로 한다.

Sorted Sets는 Skiplist와 HashTable을 이용하여 구현되었다. 따라서 sorted sets에 값을 추가할 때마다 `logn` 만큼의 시간복잡도를 가지는 연산이 수행된다. 때문에 많을 양을 update하는데 적합한 자료구조이다.

이런 특징으로 Sorted Sets는 leader board를 구현하는데 적합하다. 

- Sorted Sets에 값 넣기 `ZADD`

    ```
    zadd key <NX|XX> <CH> <INCR> score member <...score member>
    ```

    `ZADD`은 key, score, member를 필수적으로 주어야한다. 이때 Sets와 다른 차이점이 바로 score이다. 해당 member에 제공하는 score에 따라 정렬이 된다.

    그외 `ZADD`에는 다른 옵션들이 있다. 이 옵션들은 redis 3.0.2 이상에서 사용가능하다.

    - XX: 이미 있는 element에만 update만 한다. add 하지 않는다.
    - NX: 이미 있는 element라면 update를 하지 않는다. 오로지 새로운 값만 add한다.
    - CH: 몇개의 member가 수정되었는지 출력하는 옵션
    - INCR: ZADD가 ZINCRBY와 같이 동작하도록 하는 옵션이다. INCR 옵션에서는 오직 하나의 score-member에만 사용할 수 있다.
- Sorted Sets에 있는 값들 조회하기 `ZRANGE` `ZREVRANGE`

    List의 `LRANGE`와 거의 비슷한 명령어이다.

    ```
    zrange key start stop <withscores>
    ```

    따라서 `zrange ss 0 -1` 과 같이 사용하면 ss라는 Sorted Sets에 있는 모든 값을 조회할 수 있다.

    또한 반대순서로 조회할 수 있는 기능도 Sorted Sets에서 제공해준다. 이는 `ZREVRANGE`로 가능하다. 사용방법은 `ZRANGE`와 동일하다.

    withscores 옵션은 element와 함께 score도 조회하는 기능이다.

- Sorted Sets의 Score 범위를 활용한 명령어
    - `ZRANGEBYSCORE`

        ```
        zrangescore key start end
        ```

        start부터 end까지에 해당하는 score를 가진 element를 조회하는 명령이다.

        이때 사용할 수 있는 특수표현들이 존재한다.
        `inf`는 무한대를 의미하며 `-inf`로 마이너스 무한대를 `+inf`로 양수 무한대를 표현할 수 있다. 또한 그냥 숫자를 사용하면 해당 숫자를 포함한다는 의미인데 `(`와 함께 숫자를 사용하면 해당 숫자를 포함하지 않는다는 의미가 된다.

        ```
        ZRANGEBYSCORE myzset (1 2
        ```

        위 경우 `1 < score <= 2`의 의미가 된다.

    - `ZREMRANGEBYSCORE`

        또한 score 범위에 있는 값들을 지우고 싶을 수 있다. 이를 위해 `ZREMRANGEBYSCORE`를 지원한다.

        ```
        zremrangebyscore hackers 1940 1960
        ```

        다음과 같이 사용하면 hackers라는 Sorted Sets에서 1940 ~ 1960이라는 score를 가진 값들을 제거한다.

    참고로 Redis에서는 2.8버전 이후부터 lexicographical Scores를 지원한다. 즉, 사전식 Score를 지원한다. 이를 위해 `ZRANGEBYLEX`, `ZREVRANGEBYLEX`, `ZREMRANGEBYLEX`, `ZLEXCOUNT` 등의 명령어를 지원한다.

## Bitmaps

Bitmap은 실제 data type은 아니지만 String type에 정의된 bit 대상의 연산 집합이다. 실제로 Redis에서 String은 binary safe하며 최대 512MB의 길이를 가질 수 있다.

Bit 연산에는 하나의 single bit에 대한 연산과 bit 그룹에 대한 연산 2가지 그룹으로 나눌 수 있다.

- single bit 연산 `SETBIT` `GETBIT`

    ```
    setbit key offset value<0 or 1>
    ```

    `SETBIT` 연사는 key의 element에 offset만큼 떨어진 bit에 value를 할당하는 Command이다.

    `setbit key 10 1`이라는 명령은 key에 10번째 떨어진 bit에 1을 할당한다는 의미이다.

    ```
    getbit key offset
    ```

    반면 `GETBIT`는 해당 key에 offset만큼 떨어진 bit의 값을 반환한다. 만약 `setbit key 10 1`이라는 명령 후에 `getbit key 10`을 호출하면 `1`이 나타나게 된다. `getbit key 1`을 호출하면 `0`이 나타난다.

- bit group 연산 `BITOP` `BITCOUNT` `BITPOS`

    `BITOP`는 서로 다른 strings 간에 bit 연산을 하는 연산이다. `AND`, `OR`, `XOR`, `NOT` 연산을 할 수 있다.

    `BITCOUNT`는 해당 bit에 얼마나 1이 세팅되어있는지 알려주는 연산이다.

    `BITPOS`는 0 또는 1을 가진 첫번째 비트를 확인할 때 사용한다. 이때 `BITPOS`는 시작 비트와 끝 비트를 지정할 수 있다.

Bitmaps의 장점 중 하나는 정보를 저장할 때 극도로 저장 공간을 아낄 수 있다는 것이다. 만약 다양한 user들의 incremental id를 저장한다고 가정할 때 하나의 bitmap으로 최대 40억의 user id를 기억할 수 있는 것이다. `512MB`

## HyperLogLogs

HyperLogLogs는 유니크한 것을 카운트하기 위해 사용하는 확률적 자료구조이다. 기술적으로는 집합의 카디널리티를 추정하는 것을 의미한다. 일반적으로 이런 계산은 동일한 element를 똑같이 새지 않기 위해 elements의 갯수만큼 메모리를 소모해야하지만 Redis에서는 표준오차 1% 미만으로 표준 오차로 추정된 측정치로 끝나는 알고리즘을 사용한다. 이를 통해 최악의 경우 12KB를 사용하도록 설계되었다.

이러한 종류의 자료구조는 매일 유저들이 수행하는 쿼리를 카운트하는데 주로 사용된다.

HyperLogLogs의 연산들은 Sets를 사용하는 것과 같다.

- 값 추가 `PFADD`

    HyperLogLogs에 값을 추가하는 방식은 `PFADD`를 호출하는 것이다. 이는 `SADD`와 동일하다.

    ```
    pfadd key element <...element>
    ```

- 값의 갯수 조회 `PFCOUNT`

    ```
    pfcount key <...key>
    ```

    key에 존재하는 값들의 카디널리티를 측정하여 반환한다.

- 여러 HyperLogLogs에 있는 값들을 합쳐서 저장 `PFMERGE`

    ```
    pfmerge destination key <...key>
    ```

    N개의 HyperLogLogs의 값들을 하나로 합쳐서 destination에 해당하는 key에 저장하는 Command