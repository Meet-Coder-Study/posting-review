## spring http message convert 설명
- spring 에서 client 와 server 간 데이터를 주고 받을 때, 데이터를 어떻게 주고 받는지에 대해서 공부했습니다.
- 아래 예시는 spring mvc + json 기준입니다. 


## client 에서 server 로 request 를 보낼 때 메시지 변환 과정
- client 에서 json 데이터를 네트워크를 통해 보낼 때, server 의 spring 엔진 에서는 데이터 header 부분의 'Content-type' 을 살펴봅니다.
- spring 은 'Content-type' 을 보고, HttpMessageConverter 구현체를 찾기 시작합니다.
- HttpMessageConverter 구현체는 client 에서 보낸 body (데이터) 를 자바로 변환해줍니다.
- 변환 과정을 순서대로 나열한 예시는 다음과 같습니다.
    - client 에서 /test GET Method 를 호출했습니다. (conetent-type = 'application/json')
    - spring 엔진에서는 json 에 맞는 MessageConverter 를 찾아 자바로 컨버팅 해줍니다. 이것을 Unmarshal 이라고 합니다.
    - Unmarshal 은 직렬화된 (byte) 것을 오브젝트로 (자바 객체) 변환하는 것을 의미합니다.
         
## server 에서 client 로 response 보낼 때 메시지 변환 과정
- server 에서 client 로 json 데이터를 보낼려 할 때, server 의 spring 엔진에서는 request 에 담겨진 header 의 'Accept' 를 살펴봅니다.
- spring 엔진에서는 이 정보를 통해 response 를 어떤 MessageConvert 를 이용해서 데이터를 보낼지 결정합니다.
- 이를 marshal 이라고 하며, 오브젝트를 (자바 객체) 직렬화하는 (byte) 것입니다.  



## spring @RequestBody, @ResponseBody

#### @RequestBody
- 해당 annotation 은 Http Request body 를 특정 자바 객체로 비직렬화 (unmarshal) 하겠다는 의미입니다.
- 적절한 message converter 를 찾기 위해 header 의 'Content-type' 을 참조합니다.

#### @ResponseBody
- 해당 annotation 은 반환할 값을 Http Response 의 body 로 serialzed 하겠다는 의미입니다.
- 적절한 message converter 를 찾기 위해 header 의 'Accept' 를 참조합니다.

## RestController
- 위 설명과 별개로 Controller 와 ResponseBody 를 합친게 RestController 입니다.
- RestController 를 선언하면 별도 ResponseBody 는 필요없습니다.

## Reference
- https://www.baeldung.com/spring-httpmessageconverter-rest