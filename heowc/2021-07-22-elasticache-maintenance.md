> 최근 AWS의 Redis Service인 ElastiCache를 사용하면서 겪었던 유지관리 기간(Maintenance)에 대한 이슈 해결과정을 적어보고자 합니다.

### Maintenance 이란?

> https://aws.amazon.com/ko/elasticache/elasticache-maintenance/

보안 패치나 안정성을 위해 이용자가 지정한 시기에 노드를 교체하거나 클러스터가 다운되거나 특정 샤드의 노드들이 변경됩니다. 문서상에선 몇 초의 다운타임이 발생한다고 하는데요.

<br>

_제가 경험한 바로는 약간 틀린 점(?)이 있었습니다._


### 환경

- Redis Server: AWS ElastiCache Cluster
- Redis Client: lettuce `5.3.7`

※ lettuce의 경우, 사용하고 있는 버전(`5.1.1`)에서 버그가 있어 `5.3.7`으로 변경했었는데요. 자세한 내용은 아래서 다시 설명드리겠습니다.

### Maintenance 대응하기

Maintenance는 요일과 시간대(1시간 간격)를 지정해두면, AWS에서 event 알림과 함께 Maintenance 스케줄을 잡습니다. (물론, 갑작스럽게 스케줄이 잡히고 그러진 않습니다.) 이 때, 클러스터가 내려가거나 샤드의 노드들이 변경되거나 재배치하게 되는데요. lettuce client에서는 [각 노드들을 캐싱하고 있는 정보들(Partitions)](https://lettuce.io/core/release/api/io/lettuce/core/cluster/models/partitions/Partitions.html)을 리로드해야 하기 때문에 이에 맞는 [추가 옵션](https://lettuce.io/core/release/reference/#redis-cluster.refreshing-the-cluster-topology-view)이 필요합니다.

<br>

`spring-data-redis`를 사용한다면, 다음과 같이 적용할 수 있습니다.

```java
private static LettuceClientConfiguration lettuceClientConfiguration() {
    final ClusterClientOption clientOptions = 
            ClusterClientOptions.builder()
                                .topologyRefreshOptions(
                                    ClusterTopologyRefreshOptions.builder()
                                                                 .enablePeriodicRefresh(...) // <--
                                                                 .enableAllAdaptiveRefreshTriggers() // <--
                                                                 .build())
                                .timeoutOptions(...)
                                .build();
    return LettuceClientConfiguration.builder()
                                     .commandTimeout(...)
                                     .shutdownTimeout(...)
                                     .clientOptions(clientOptions)
            .build();
}
```


#### enablePeriodicRefresh(...)

주기적으로 connection을 갱신해주는 옵션 활성화와 기간을 지정할 수 있습니다. 기간은 기본 60초입니다.

#### enableAllAdaptiveRefreshTriggers()

[문제가 될만한 operation](https://lettuce.io/core/release/api/io/lettuce/core/cluster/ClusterTopologyRefreshOptions.RefreshTrigger.html)이 발생한다면 즉시 connection을 갱신해주는 이벤트를 트리거 시켜주는 설정입니다. 해당 기능은 rate-limit 같은(?) 처리가 되어 있어서 퍼포먼스에 문제가 되지 않습니다.


### 재현해보기

aws에서는 `aws-cli`를 통해 [`test-failover`](https://docs.aws.amazon.com/cli/latest/reference/elasticache/test-failover.html)라는 커맨드를 제공해주고 있으며, 이를 통해 위 현상을 재현해볼 수 있습니다.

> 해당 기능은 첫 시도 기준 5회의 제한을 두고 있기 때문에 무분별한 시도는 안하는게 좋습니다.

### 깔끔하지 않은 결론...

`aws-cli`를 통해 `test-failover`를 실행하면 클러스터가 내려갑니다. 해당 갭은 1분 정도 되는데요. 위 문서에서 얘기한 **몇 초의 다운타임보다 많은 시간이 소요**됨을 알 수 있습니다. 이를 해결할 방법은 딱히 없는 걸로 보여 '서비스 운영에서 있어 다운타임을 최소화 했다'라는 것에 의의를 두고 해당 이슈를 마무리 짓기로 했습니다. 기존에서는 10분정도의 다운타임이 발생했습니다.

<br>

다만, 클러스터가 내려가는게 아닌 샤드의 노드들이 변경되거나 재배치되는 것은 다운타임이 아예 없었습니다.

> 혹시 다른 방법이 있으면 공유해주시면 감사하겠습니다 :)

### 마무리...?!

옵션을 추가하고 배포를 몇 번 해보니, 배포 중 다음 에러로그와 함께 애플리케이션 서버가 내려가지 않는 현상이 발생합니다. 해당 버전은 lettuce `5.1.1`에서 발생했습니다.

```text
ERROR: Failed to submit a listener notification task. Event loop shut down?
java.util.concurrent.RejectedExecutionException: event executor terminated
	at io.netty.util.concurrent.SingleThreadEventExecutor.reject(SingleThreadEventExecutor.java:845)
	at io.netty.util.concurrent.SingleThreadEventExecutor.offerTask(SingleThreadEventExecutor.java:328)
	at io.netty.util.concurrent.SingleThreadEventExecutor.addTask(SingleThreadEventExecutor.java:321)
	at io.netty.util.concurrent.SingleThreadEventExecutor.execute(SingleThreadEventExecutor.java:756)
	at io.netty.util.concurrent.DefaultPromise.safeExecute(DefaultPromise.java:768)
	at io.netty.util.concurrent.DefaultPromise.notifyListeners(DefaultPromise.java:432)
	at io.netty.util.concurrent.DefaultPromise.addListener(DefaultPromise.java:162)
	at io.netty.channel.DefaultChannelPromise.addListener(DefaultChannelPromise.java:95)
	at io.netty.channel.DefaultChannelPromise.addListener(DefaultChannelPromise.java:30)
...
```

`jstack`을 확인해보니, 해당 애플리케이션 서버에 thread 중 `WAITING`이 존재하는 것을 알 수 있었습니다. 해당 stack은 shutdown시에 쓰레드 경합이 발생하면서 생긴 문제로 보였는데요. (아쉽게도... 로그가 유실되어 첨부하지 못 했습니다.) 이는 lettuce 저장소 [issue#989](https://github.com/lettuce-io/lettuce-core/issues/989)를 통해 바로 해결할 수 있었습니다. 

<br>

해당 이슈의 커밋 로그를 잠깐 살펴보자면, eventloop가 활성화되어 있는지 여부를 판단하는 [방어코드](https://github.com/lettuce-io/lettuce-core/commit/75506b8489094b7ad584a3da7e5e7c9eaec5bd39#diff-786974f002247796101b7c31ad0a26c363adc3c02df789d8981c4e2455c52ebaR262)가 추가된 것을 알 수 있습니다.

```java
private boolean isEventLoopActive() {

    EventExecutorGroup eventExecutors = clientResources.eventExecutorGroup();

    return !eventExecutors.isShuttingDown();
}
```

저희는 이것을 `5.2.0`에 해결된 것으로 보였으나, 그냥 마이너 최신버전(`5.3.7`)까지 올려서 테스트 해보기로 했습니다. 다행히 배포시에 위 현상이 해결되어 안정적인 스무스하게(?) 배포할 수 있었습니다.

### 참고

- https://aws.amazon.com/ko/elasticache/elasticache-maintenance/
- https://lettuce.io/core/release/reference/#redis-cluster.refreshing-the-cluster-topology-view
- https://docs.aws.amazon.com/cli/latest/reference/elasticache/test-failover.html
- https://github.com/lettuce-io/lettuce-core/issues/989
