우리가 가진 문제점은 아래 질문에서 시작됩니다.

'우리 어떤 이벤트를 발행하고 있지?'
'어떤 이벤트페이로드로 메세지를 전달하고 있지?'


우리는 이 질문의 정답을 찾기 위해 열심히 코드를 찾습니다.

도메인 이벤트의 이벤트페이로드가 코드 안에 숨겨져 있는 형태를 띄게 됩니다.

```javascript
const createdUserMessage = async (userId: string) => {
  const messageId: string = await Identity.getId();
  const payloadId: string = await Identity.getId();
  const occurredAt = moment.tz('Asia/Seoul').format('YYYY-MM-DD[T]HH:mm:ss.SSS');
  const userCreatedEvent = {
    messageId,
    payload: JSON.stringify({
      id : { value: payloadId },
      payload : JSON.stringify({ userId, 
                                age, 
                                name }),
      type: USER_SIGNED_UP_EVENT_TYPE,
      occurredAt,
    }),
  };
  const event = {
    MessageBody: JSON.stringify(userCreatedEvent),
    QueueUrl: USER_SIGNED_UP_QUEUE_URL,
    MessageAttributes: {
      "contentType": {
        DataType: "String",
        StringValue: "application/json"
      },
    }
  }
  ...
}
```

그러나 UserCreatedEvent 를 사용하는 클라이언트와 필드가 일치하지 않을 수 있습니다.

```java
@Data
public class UserSignedUpEvent {

    @NotNull(message = "userId 는 null 이 될 수 없습니다.")
    private final String userId;
}

```



어떻게 하면 이 문제를 해결할 수 있을까요?

**각 서비스의 API를 정의하는 source of truth(단일 공급원)**

![img](https://documents.lucid.app/documents/a6b2e07d-a201-4959-8dad-8c191ba78039/pages/0_0?a=30291&x=4811&y=9575&w=642&h=540&store=1&accept=image%2F*&auth=LCA%2058625252244f20d4a5da8217cdbbbb9e1cba7dcd-ts%3D1663293566)



이 행위를 하기위해서는 여러 선택지가 있습니다. 우리가 사용하는 OpenAPI 을 사용할 수도 있고, Protobuf, Thrift 등 interface definition language(IDL) 을 지원하는 방식이 다양합니다.

*그 중에 Protobuf 를 활용한 One Source Multiple Use 방식을 활용하려 합니다.*

OpenAPI 의 경우 MSA 환경에서 자바가 아닌 타 언어 활용시 일부 호환되지 않거나 또는 불필요하게 많은 코드가 삽입되는 것을 확인했습니다.


[참고자료](https://blog.banksalad.com/tech/production-ready-grpc-in-golang/)

--

## Protocol Buffers 이해하기

[Protocol Buffers](https://developers.google.com/protocol-buffers)

- 프로토콜 버퍼는 정방향 호환 및 역호환 방식으로 구조화된 데이터를 직렬화하기 위해 사용된다.
- JSON 과 비슷한데 차이가 있다면, 더 작고 더 빠르며 네이티브 언어 바인딩을 생성한다는 점이 다르다.
-  .proto 파일 형식을 가진다.


### Protocal Buffers는 무엇을 풀고 싶었는지?

- 프로토콜 버퍼는 패킷의 타입을 위한 직렬화 포맷을 제공합니다. 이 형식은 임시 네트워크 트래픽과 장기 데이터 저장에 모두 적합합니다. 프로토콜 버퍼는 기존 데이터를 무효화하거나 코드를 업데이트하지 않고도 새로운 정보로 확장할 수 있습니다.

- **서버 간 통신**과 디스크에 데이터를 보관하는데 광범위하게 사용될 수 있있습니다.

```protobuf
message Person {
  optional string name = 1;
  optional int32 id = 2;
  optional string email = 3;
}
```

- 생성된 각 클래스에는 각 필드에 대한 간단한 접근자와 원시 바이트에서 전체 구조를 직렬화하고 구문 분석하는 메서드가 포함되어 있습니다.

```java
Person john = Person.newBuilder()
    .setId(1234)
    .setName("John Doe")
    .setEmail("jdoe@example.com")
    .build();
output = new FileOutputStream(args[0]);
john.writeTo(output);
```



### Protocal Buffers 사용하면 어떤 이점이 있는가?

- 프로토콜 버퍼는 언어 중립적, 플랫폼 중립적, 확장 가능한 방식으로 구조화된 레코드와 같은 유형 데이터를 직렬화해야 하는 모든 상황에서 이상적입니다. 통신 프로토콜 gRPC 또는 데이터 저장에 가장 많이 사용됩니다.
    - Compact 한 데이터 스토리지
    - 빠른 구문 분석
    - 많은 프로그래밍 언어에서 사용 가능
    - 자동생성 클래스를 통한 최적화 기능
- 언어 간 호환성  
  지원되는 모든 프로그래밍 언어로 작성된 코드로 동일한 메시지를 읽을 수 있습니다. 예를 들어 Java 프로그램에서 데이터를 캡처하고 `.proto`  정의에 따라 직렬화한 다음 다른 플랫폼에서 실행되는 별도의 Python 프로그램에서 직렬화된 데이터에서 특정 값을 추출하도록 할 수 있습니다.
- 프로젝트 간 지원
    - `message` 있는 파일의 형식을 정의하여 프로젝트 전체에서 프로로톨 버퍼를 사용할 수 있습니다.
        - 흔한 예제는 timestamp.proto, status.proto
- 코드를 업데이트하지 않고 proto 정의 업데이트하기
    - 이전 버전과 호환되는 경우의 코드를 작성할 때 새로운 필드/삭제된 필드에 대한 기본값을 가지거나 비어있습니다.
    - 좀 더 자세한 내용은 [여기서](https://developers.google.com/protocol-buffers/docs/proto#updating) 알 수 있고, 지금은 overview 이기 때문에 다루지 않습니다.



### 그럼 프로토콜 버퍼가 적합하지 않는 경우는 언제입니까?

- 프로토콜 버퍼는 전체 메세지를 한 번에 메모리에 로드할 수 있고 일반적인 프로토콜보다 크지 않다고 가정하는 경우가 있습니다. 그러나 몇 메가바이트를 초과하는 데이터의 경우에는 다른 솔루션을 고려해야 합니다. 더 큰 데이터로 작업할 때 직렬화된 복사본으로 인해 데이터 복사본이 여러 개 생성될 수 있으며, 이로 인해 메모리 사용량이 급증할 수 있습니다.
- 프로토콜 버퍼는 직렬화되면 동일한 데이터가 다양한 이진 직렬화를 가질 수 있습니다. 두 메시지를 완전히 구문 분석하지 않고는 동일한지 비교할 수 없습니다.
- `message`는 압축되지 않습니다. 다른 파일과 마찬가지로 `message`를 압축하거나 gzip 으로 압축할 수 있지만 JPEG 및 PNG에서 사용되는 것과 같은 특수 목적 압축 알고리즘은 적절한 유형의 데이터에 대해 훨씬 더 작은 파일을 생성합니다.

- 프로토콜 버퍼 메시지는 부동 소수점 숫자의 큰 다차원 배열을 포함하는 많은 과학 및 엔지니어링 용도에서 크기와 속도 모두에서 최대 효율보다 떨어집니다.
- 비객체지향언어에서는 잘 지원되지 않습니다.
- 프로토콜 버퍼 메시지는 본질적으로 데이터를 자체 설명하지 않지만 **자체 설명을 구현하는 데 사용할 수 있는 완전히 반영하는 스키마**를 가지고 있습니다. 즉, 해당 `.proto`파일에 액세스하지 않고는 완전히 해석할 수 없습니다.



### 프로토콜 버퍼는 어떻게 동작되나요?

![img](https://developers.google.com/static/protocol-buffers/docs/images/protocol-buffers-concepts.png)



### 프로토콜 버퍼의 문법 정의는 무엇이 있는지?

파일을 정의할 때 `.proto` 필드을 `optioanl` or `repeated` or `singular` 로 지정할 수 있습니다

메시지 필드가 다음 중 하나임을 지정합니다.

- `required`: 잘 구성된 메시지에는 이 필드가 정확히 하나만 있어야 합니다.
- `optional`: 잘 구성된 메시지는 이 필드 중 0개 또는 1개를 가질 수 있습니다(하나 이상은 아님).
- `repeated`: 이 필드는 올바른 형식의 메시지에서 여러 번(0 포함) 반복될 수 있습니다. 반복되는 값의 순서는 유지됩니다.

필드는 다음 중 하나일 수도 있습니다.

- `message`: 반복되는 데이터 집합과 같이 정의의 일부를 중첩할 수 있는 유형입니다.
- `enum`: 선택할 값 집합을 지정할 수 있는 유형입니다.
- `oneof`: 메시지에 많은 선택 필드가 있고 최대 하나의 필드가 동시에 설정될 때 사용할 수 있는 유형입니다.
- `map`: 정의에 키-값 쌍을 추가 하는 유형입니다.

선택 사항 및 필드 유형을 설정한 후 필드 번호를 할당합니다. 필드 번호는 용도를 변경하거나 재사용할 수 없습니다. **필드를 삭제하는 경우 누군가가 실수로 번호를 재사용하는 것을 방지하기 위해 필드 번호를 예약해야 합니다.**
