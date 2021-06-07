# Spring MockRestServiceServer

인수테스트 혹은 API 테스트를 하다보면, 외부 API를 호출하는 부분에 mocking 을 하고싶어질때가 있다.    
UnitTest 의 경우, Layer 를 갈라 RestTemplate을 mocking 하는 방향으로 TC를 작성하지만, 세부적인 핸들링을 하기 위해선, 조금 번잡한 코드가 추가되어야한다.

> equals 가 구현안되어있으면 mocking 이 어렵거나, API의 302 상황을 테스트해보고 싶은 경우... 여러모로 복잡해진다.

Spring에서는 RestTemplate 의 HttpRequestFactory를 Mocking 하는 방식으로, API Test 를 쉽게 짤 수 있도록 지원하는데, 이때 사용하는
객체가 `MockRestServiceServer` 이다.

> spring 3.2 부터 지원한다.

## 예제 코드

```kotlin

const val url = "http://naver.com"

class MockRestServiceServerTest {

    @Test
    fun rest() {
        // mockRestServiceServer setup
        val restTemplate = RestTemplate()
        val mockServer = MockRestServiceServer.bindTo(restTemplate)
            // ignoreExpectOrder - 여러 API 를 mocking 할 경우, API 호출 순서와 상관 없이 의도된 응답을 던질 수 있다.
            // bufferContent - 로깅등의 이유로 response 를 여러번 읽을 경우 사용    
            .build()

        // api mocking 
        val expect = "response"
        mockServer.expect(requestTo(url))
            .andExpect(method(HttpMethod.GET))
            .andExpect(header("MyHeader", "header"))
            .andRespond(withSuccess(expect, MediaType.TEXT_PLAIN))

        // httpCall
        val uri = UriComponentsBuilder.fromHttpUrl(url).build().toUri()
        val request = RequestEntity.get(uri)
            .header("MyHeader", "header")
            .build()

        // execute
        val actual = restTemplate.exchange(request, String::class.java)

        // assert
        mockServer.verify()
        assertEquals(expect, actual.body)
    }
}
```

> 1. mockServer setup

```kotlin
val restTemplate = RestTemplate()
val mockServer = MockRestServiceServer.bindTo(restTemplate)
    .build()
```

Test 할 RestTemplate 을 가져와, `MockRestServiceServer` 에 주입한다. Service Code 에서 사용하는 RestTemplate 을 주입해야한다.

MockRestServiceServer 생성시, restTemplate 외에도 몇몇 설정을 추가할 수 있다.

- `ignoreExpectOrder()`
  => 여러 API 를 mocking 할 경우, API 호출 순서와 상관 없이 의도된 응답을 던질 수 있다.
- `bufferContent()`
  => 로깅등의 이유로 response 를 여러번 읽을 경우 사용한다. (InputStream 은 한번만 읽을 수 있다.)

> 2. mocking

```kotlin
 mockServer.expect(requestTo(url))
    .andExpect(method(HttpMethod.GET))
    .andExpect(header("MyHeader", "header"))
    .andRespond(withSuccess(expect, MediaType.TEXT_PLAIN))
```

method chaining 으로 예상되는 url / header / method / param / response 를 지정할 수 있다. 시간에 따라 url 형태가 바뀌는
경우, `Matchers.matchesPattern` 을 사용하여, 정규식으로 커버할 수 있다.

> EX :: 시간을 이용하여 TOKEN 을 생성하는 경우



> 3. execute / verify

```kotlin
  // execute
val actual = restTemplate.exchange(request, String::class.java)

// assert
mockServer.verify()
// converting logic이 있을 경우 추가 단언
assertEquals(expect, actual.body)  
```

`mockServer.verify()` 를 통해, 의도한 API call 이 수행됐는지 확인 할 수 잇다.

## 작동 원리

`MockRestServiceServer` 의 `build` 함수에서 `MockClientHttpRequestFactory` 를 RequestFactory 에 주입한다.

```java
@Override
public MockRestServiceServer build(RequestExpectationManager manager) {
  MockRestServiceServer server = new MockRestServiceServer(manager);
  MockClientHttpRequestFactory factory = server.new MockClientHttpRequestFactory();
  if (this.restTemplate != null) {
    if (this.bufferContent) {
      this.restTemplate.setRequestFactory(new BufferingClientHttpRequestFactory(factory));
    }
    else {
      this.restTemplate.setRequestFactory(factory);
    }
  }
  if (this.asyncRestTemplate != null) {
    this.asyncRestTemplate.setAsyncRequestFactory(factory);
  }
  return server;
}
```

`MockCLientHttpRequestFactory.java`

```java
private class MockClientHttpRequestFactory implements ClientHttpRequestFactory,
			org.springframework.http.client.AsyncClientHttpRequestFactory {
// 일부 코드 생략
	
  private org.springframework.mock.http.client.MockAsyncClientHttpRequest createRequestInternal(
          URI uri, HttpMethod httpMethod) {

      Assert.notNull(uri, "'uri' must not be null");
      Assert.notNull(httpMethod, "'httpMethod' must not be null");
  
      return new org.springframework.mock.http.client.MockAsyncClientHttpRequest(httpMethod, uri) {
  
        @Override
        protected ClientHttpResponse executeInternal() throws IOException {
          ClientHttpResponse response = expectationManager.validateRequest(this);
          setResponse(response); // 사전에 정의해둔 Response 반환
          return response;
        }
      };
  }
}
```

RestTemplate 내부의 execute 함수에서 `createRequest()` 시, 위 Factory 가 사용되며, 생성된 request가 실행된다.
```java
// RestTemplate 의 doExecute 일부

ClientHttpRequest request = createRequest(url, method);
if (requestCallback != null) {
    requestCallback.doWithRequest(request);
}
response = request.execute();
```

결론 : RequestFactory 를 재정의한 MockClientHttpRequestFactory 를 사용하여 구현 함

## 어떻게 쓰고 있나 ?

다른 서비스의 API 형태가 바뀌지 않았는지, 의도된 contents 가 내려오는지 등을 확인하기 위해 실제 API 를 쏘는 TC는 필요하다.

> 해당 TC는 JUnit 을 이용해 실제 Bean 을 올려 Test 를 돌리고 있다.

우리 프로젝트에선 `사용자 시나리오기반의 TC`를 작성할 경우 `MockRestServiceServer` 를 사용하고 있다.   
Cucumber 를 이용해, `사용자 시나리오기반의 TC`(서버입장에선 API EndPoint Test)를 작성하고 있는데, 이때에도 실제 API 호출을 하게 두었더니, 다른팀의 dev 서버 배포라거나, 만료 기한이
있는 데이터 API의 경우 TC가 너무 쉽게 깨졌다.

> 해당 모듈이 API Gateway 역할이 였기에 API mocking이 반드시 필요했다.

```kotlin
@Configuration
@ConditionalOnProperty("test.cucumber")
open class MockRestServiceServerConfig {

    @Bean
    open fun mockRestServiceServer(): MockRestServiceServer =
        MockRestServiceServer.bindTo(restTemplate()).ignoreExpectOrder(true).build()


    // interceptor 등을 통한 Header 검증은 Unit Test 로 진행해야한다.
    @Bean
    open fun restTemplate() = RestTemplate()
}
```

> 1. test.cucumber property

앞서 말했듯, 해당 모듈에는 2벌의 TC(Unit Test / Scenario Test)가 존재한다. 별도 설정을 하지 않으면, UnitTest 를 돌릴때, Scenario Test 의 Bean 이 읽히기 때문에
Property로 bean 설정을 갈라두었다.

위 방법 외에도, `Profile 을 통한 분리` / `Test Direcotry를 통한 분리` 등을 검토하였으나, 유지보수 측면에서 추가 비용이
들거같아, `@ConditionalOnProperty("test.cucumber")
` 로 갈라두었다.

> 2. interceptor 등을 통한 Header 검증은 Unit Test 로 진행해야한다.

위 설정은 `모든 HTTP API` 호출에 사용된다. 때문에 RestTemplateBuilder 등을 사용하여, Interceptor 단에서 Header 를 추가할 경우, 관련 없는 API 가 잘못 동작할 수 있다.

이를 위해 RestTemplate 을 기본으로 설정해두고, 주입이 어려운 Header 검증은 Unit Test 에서 진행해야한다.

*각 API Test config 를 관리 할 수 있으나, 얻는 이득에 비해 관리 비용이 크다고 판단했다.*

```kotlin
@Configuration
@ConditionalOnProperty("test.cucumber")
open class MockAuthorRestTemplate(
    val property: Property,
    val restTemplate: RestTemplate
) {

    @Bean
    @Primary
    open fun mockAuthorRestTemplate(): AuthorRestTemplate {
        return AuthorRestTemplate(restTemplate, property, property.caller)
    }
}
```

`@Primary` annotation을 사용하여, Service Code 의 `AuthorRestTemplate`을 Test Bean 으로 생성 / 사용하도록 설정한다.

```kotlin
init {
    Given("사용자는 로그인 권한이 있다.") { mockAuthorCheckApi(EMPTY) }
}

private fun mockAuthorCheckApi(body: String) {
    mockRestServiceServer.expect(MockRestRequestMatchers.requestTo(Matchers.matchesPattern("${AuthorApi.GET_AUTHOR_CHECK.url}.*account=${userStep.userId}.*")))
        .andExpect(MockRestRequestMatchers.method(HttpMethod.GET))
        .andRespond(
            MockRestResponseCreators.withStatus(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
        )
}
```

위 처럼 scenario 에 mocking 을 할 수 있다. `@SpringBootTest`를 사용하면, 한번 bean 을 만들어 재활용하기에 필요하다면 `mockRestServiceServer.reset()` 을
사용해 mocking 을 reset 해야한다.

> 여러 시나리오가 한번에 실행될 경우, 이미 mocking 된 API를 다시 Mocking 하는 경우가 발생한다.


위처럼 `MockRestServiceServer`를 설정해두면, 외부 API 에 대해 깨지지 않는 Scenario Test 가 완성된다.
