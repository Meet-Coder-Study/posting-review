# Tomcat Websocket 사용시 memory leak 이슈

웹소켓 서버의 Heap 사용량이 꾸준히 늘어나는 걸 볼 수 있다.

<img width="900" alt="leak" src="https://user-images.githubusercontent.com/30178507/163399196-943d3cde-42eb-4ee0-9893-b1882cc4beb6.png">

위 캡처는 JVM Old Gen 영역의 사용량이다. 힙 사이즈를 8G로 잡아뒀는데 계속해서 꾸준히 늘더니 8G가 되는 지점에서 늘어났다 줄었다 늘었다를 반복하고 있다. 이 시점에 Full GC가 발생하면서 CPU도 계속해서 튀고 있었다.

위 이슈는 결국 현재 서버에 Memory Leak이 발생하고 있기 때문이다.

## 왜 Memory Leak이 발생했을까?

위 웹소켓 서버는 Spring Boot Websocket 2.4.11 버전을 활용하고 있다.

우선 웹소켓 서버에서 어떤 객체가 Heap 메모리를 많이 사용하고 있는지 확인해봐야한다. 이를 위해 heap dump를 뜨고 Eclipse Memory Analyzer `MAT`를 활용해서 분석해보면 다음과 같이 분석결과가 나타난다.

<img width="900" alt="leak_report" src="https://user-images.githubusercontent.com/30178507/163399205-d5f7aa23-945b-4268-8611-728d17361fc8.png">

**`org.apache.coyote.http11.upgrade.UpgradeGroupInfo`**가 6.5GB를 사용하고 있다. 즉, tomcat의 UpgradeGroupInfo에서 Memory leak이 발생하고 있음을 짐작할 수 있다.

> Spring Boot 2.4.11에서는 tomcat-embed-core와 tomcat-embed-websocket의 버전은 9.0.53을 사용하고있다. spring-boot-starter-websocket은 spring-boot-starter-web을 가지고 있고 spring-boot-starter-web 내부에 spring-boot-starter-tomcat이 있다.
>
> [https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-tomcat/2.4.11](https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-tomcat/2.4.11) 

`UpgradeGroupInfo`는 다음과 같다.

```java
package org.apache.coyote.http11.upgrade;

import java.util.ArrayList;
import java.util.List;

import org.apache.tomcat.util.modeler.BaseModelMBean;

public class UpgradeGroupInfo extends BaseModelMBean {

  private final List<UpgradeInfo> upgradeInfos = new ArrayList<>();

  private long deadBytesReceived = 0;
  private long deadBytesSent = 0;
  private long deadMsgsReceived = 0;
  private long deadMsgsSent = 0;

  public synchronized void addUpgradeInfo(UpgradeInfo ui) {
    upgradeInfos.add(ui);
  }

  public synchronized void removeUpgradeInfo(UpgradeInfo ui) {
    if (ui != null) {
        deadBytesReceived += ui.getBytesReceived();
        deadBytesSent += ui.getBytesSent();
        deadMsgsReceived += ui.getMsgsReceived();
        deadMsgsSent += ui.getMsgsSent();

        upgradeInfos.remove(ui);
    }
  }

    // ...
}
```

`org.apache.coyote.http11.upgrade.UpgradeGroupInfo` 내부에는 `org.apache.coyote.http11.upgrade.UpgradeInfo`리스트를 관리하고 있다. 그리고 UpgradeInfo를 추가하고 제거하는 `addUpgradeInfo`와 `removeUpgradeInfo` 메서드가 있다.

결론은 `9.0.53` 버전에서 `UpgradeGroupInfo#removeUpgradeInfo`가 불리지 않는것이 문제이다. 이 때문에 웹소켓 커넥션이 끊어지더라도 upgradeInfos 객체가 계속해서 쌓이게되고 결국 Memory Leak이 발생한다.

## 해결방법

해결은 9.0.54 버전부터 버그 업데이트가 되었다. [톰캣 9.0.54 CHANGE LOG](https://tomcat.apache.org/tomcat-9.0-doc/changelog.html#Tomcat_9.0.54_(remm))를 보면 웹소켓 부분에 다음과 같은 변경 기록이 있다.

> The internal upgrade handler should close the associated `WebConnection` on destroy. (remm)

즉, `WebConnection`이 끊어졌을때 `close` 되지 않던 버그가 해결된 패치이다. 따라서 9.0.54 버전의 embed-tomcat을 사용하도록 만든다면 웹소켓 커넥션이 끊어졌을때 UpgradeGroupInfo에 쌓인 UpgradeInfo를 제거한다.
