# Redis PubSub

- [Redis PubSub](#redis-pubsub)
  - [Redis PubSub의 특징](#redis-pubsub의-특징)
  - [Redis Cluster와 PubSub](#redis-cluster와-pubsub)
  - [참고](#참고)

Apache Kafka, RabbitMQ 등의 메세지 브로커와 같이 Redis도 PubSub 기능을 통해 메세지 브로커 기능을 제공한다.

참고로 메세지 브로커란 송신자 `publisher, sender`와 수신자 `subscriber, receiver` 사이에서 메세지의 전달을 중개하는 모듈을 의미한다. 이들 메세지 브로커는 대게 하나의 토픽을 매개로하여 토픽에 전달되는 메세지를 구독하고 있는 Subscriber에게 전달하는 역할을 한다.

## Redis PubSub의 특징

Redis PubSub은 Kafka, RabbitMQ와 같은 메세지 브로커들과 달리 메세지가 반드시 전달된다는 것을 보장하지 않는다. 단순히 채널에 전달된 메세지를 구독하고 있는 모든 클라이언트에게 전달하는 역할만 Redis PubSub이 수행한다.

간혹 Redis PubSub을 메세지 큐와 혼동하는 경우도 종종 있는데 Redis는 따로 메세지를 큐잉 `Queueing` 하지 않기 때문에 메세지 큐라고는 할 수 없다.

Redis PubSub이 메세지의 신뢰성을 보장하지는 하지만 빠른 응답성과 높은 처리량을 자랑한다.

따라서 메세지가 반드시 전달이 되어야하는 시스템에서는 Redis PubSub보다는 Kafka나 RabbitMQ와 같은 메세지 브로커를 추천하며 빠른 응답성이 중요할 때는 Redis PubSub을 추천한다.

> [Scaling Redis PubSub with Shahar Mor - Redis Labs](https://www.youtube.com/watch?v=6G22a5Iooqk) 영상에 따르면 하나의 Redis Node 당 100,000 TPS를 전달할 수 있다고 한다.

## Redis Cluster와 PubSub

> Redis Cluster is awesome overall, just not for PubSub

보통 고가용성 및 부하분산을 위해 하나의 Redis를 사용하는 것이 아니라 여러 Redis Node로 이뤄진 클러스터를 구성하는 경우가 많다.

단, Redis PubSub에서는 클러스터 구성이 독이 될 수 있다.

![](https://user-images.githubusercontent.com/30178507/139267496-8af31c5e-6491-4142-9827-8130e50b6200.png)

Redis PubSub에서 클러스터를 구성할 경우 위와 같은 형태로 이뤄진다.

Subscriber는 클러스터의 단일 노드에 연결이 되는데 채널에 등록된 모든 Subscriber에 메세지가 전송됨을 보장하기 위해서 Publisher에게서 메세지를 받을 때 클러스터의 노드들에 메세지를 복사하여 전달한다. 복사하여 전달하는만큼 부하가 더 심해진다.

![](https://user-images.githubusercontent.com/30178507/139267858-56565671-9ffb-4b52-a3a6-90185647dc5b.png)

위 캡처와 같이 노드가 추가될수록 성능이 떨어지는 것을 볼 수 있다.

> 이를 해결하기 위한 솔루션으로 Discovery를 개발하는 것을 제시한다.

## 참고

[https://redis.io/topics/pubsub](https://redis.io/topics/pubsub)

[https://charsyam.wordpress.com/2013/03/12/입-개발-redis-pubsub-시스템은-일반적인-message-queue와-다르다/](https://charsyam.wordpress.com/2013/03/12/%ec%9e%85-%ea%b0%9c%eb%b0%9c-redis-pubsub-%ec%8b%9c%ec%8a%a4%ed%85%9c%ec%9d%80-%ec%9d%bc%eb%b0%98%ec%a0%81%ec%9d%b8-message-queue%ec%99%80-%eb%8b%a4%eb%a5%b4%eb%8b%a4/)

[Scaling Redis PubSub with Shahar Mor - Redis Labs](https://www.youtube.com/watch?v=6G22a5Iooqk)