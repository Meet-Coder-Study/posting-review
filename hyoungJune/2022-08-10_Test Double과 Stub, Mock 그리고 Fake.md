TDD를 공부하게 되면, Test Double이라는 용어가 나오고, 그 뒤에 Stub, Mock 그리고 Fake가 나온다.

  

처음 TDD를 접한 사람이라면, 헷갈리는 개념이라고 생각을 한다. 나도 그랬다. 그리고 며칠 전에 Test Double을 알아요? Stub과 Mock에 대해서 알아요?라고 질문을 받았지만, 어렴풋이 알고 확실히 알지 못하여 질문에 대해 답을 하지 못했다.

  

그래서 요번 블로그 포스팅은 Test Double에 대해서 그리고 Stub, Mock 그리고 Fake에 대해서 설명을 하려고 한다.

### Test Double

  

![](https://blog.kakaocdn.net/dn/bJFqe6/btrJlpCA20H/um5L0pkC6Y5pvcogbyicl0/img.png)

Test Double는 테스트 시에 실제 객체가 아닌 가짜 객체를 활용하여 테스트를 할 수 있도록 만들어주는 것을 말한다.

  

실제 객체가 아닌 가짜 객체를 활용하여 테스트할 경우 도메인 로직에 외부 요인이 껴져 있을 때 필요하다고 생각한다. ex) 데이터베이스 조회, 외부 서버와의 API 통신, 파일 전송 등.

  

Test Double의 종류에는 Dummy Object, Test Stub, Test Spy, Mock Object, Fake Object가 있다.

  

요번 글의 주제인 Stub, Mock 그리고 Fake가 바로 Test Double에 속한다. 차례대로 설명하자면,

  

### Stub

메서드의 반환 값을 정해놓고 객체의 상태를 검사하는 것을 말한다. 자바, 코틀린 개발자가 테스트 코드를 만든다면 대게 Stub을 이용한 테스트 코드 작성한다고 생각한다.

  
```java
@Test
void addSection() {
    when(lineRepository.findById(이호선.getId())).thenReturn(Optional.of(이호선)); // stub
    when(stationService.findById(역삼역.getId())).thenReturn(역삼역);  // stub
    when(stationService.findById(삼성역.getId())).thenReturn(삼성역);  // stub

    lineService.addSection(이호선.getId(), new SectionRequest(역삼역.getId(), 삼성역.getId(), 10));

    Line line = lineService.findById(1L);

    assertThat(line.getSections().size()).isEqualTo(2);
}
```
  

해당 예제에서 Stub이란 Repository나 Service에서 메소드에 대한 결과 값을 가짜 객체로 받는 것을 말한다. 흔히, mockito의 when().thenReturn()이나, given().willReturn()을 말한다.

  

### Mock

Mock은 Stub과 다르게 상태가 아닌 행위를 검증한다. Mock을 사용하면 a라는 메서드가 실행 됐는지에 대한 체크와 a라는 메서드가 몇 번 실행됐는지에 대한 체크를 할 수가 있다.

  
```java
@Test
void addSection() {
    when(lineRepository.findById(이호선.getId())).thenReturn(Optional.of(이호선)); 
    when(stationService.findById(역삼역.getId())).thenReturn(역삼역);  
    when(stationService.findById(삼성역.getId())).thenReturn(삼성역);  

    lineService.addSection(이호선.getId(), new SectionRequest(역삼역.getId(), 삼성역.getId(), 10));

    verify(lineRepository).findById(이호선.getId()); // mock 사용 체크
    verify(stationService, times(2)).findById(any()); // mock 2번 사용 체크
}
```
  

해당 예제에서 Mock이란 linRepository나 Service에서 실행이 됐는지, 몇번 실행이 됐는지를 말한다. 흔히, mockito의 verify()를 말한다.

  

본인은 Mock 테스트에 대해 가장 사용해볼만한 부분은 바로 혼잡한 비즈니스 로직에 대해 메서드가 몇 번 실행됐는가에 대해서, 리턴이 없는 메서드에 대해서 사용하면 좋을 것 같다고 생각한다.

  

사실 여기서 헷갈릴만한 부분이 있다. 바로 Stub과 Mock에서 Mockito Library를 사용한다는 것이다. Mockito Library는 이름과 그대로 Mock을 위한 라이브러리가 아닌가요?라는 질문이 나올 수도 있고, Mock이라고 말하니, Stub도 Mock이 되는 건 아닌가요?라는 질문도 나올 수 있다. 하지만, 아니다. Mockito Library는 행위와 행동을 검증하는 테스트 라이브러리이기 때문에 혼돈을 안 했으면 좋겠다. (나는 처음 개발 시작했을 때 Mockito와 Mock이 똑같다고 봤다. 나 같은 사람이 있을까 봐 적어놨다.)

  

### Fake

Fake는 가짜 객체를 진짜로 구현하는 것을 말한다.

```java
public class ExchangeFakeRepository implements ExchangeRepository {
    public List<Exchange> findAll() {
        return List.of(
                new Exchange(1L, "USDAED", 3.673197, LocalDateTime.of(2022, 1, 1, 1, 1, 1)),
                new Exchange(2L, "USDAFN", 76.088502, LocalDateTime.of(2022, 1, 1, 1, 1, 1)),
                new Exchange(3L, "USDALL", 108.014949, LocalDateTime.of(2022, 1, 1, 1, 1, 1)),
                new Exchange(4L, "USDAMD", 484.684999, LocalDateTime.of(2022, 1, 1, 1, 1, 1)),
                new Exchange(5L, "USDANG", 1.78935, LocalDateTime.of(2022, 1, 1, 1, 1, 1)),
                new Exchange(6L, "USDAOA", 308.428019, LocalDateTime.of(2022, 1, 1, 1, 1, 1)),
                new Exchange(7L, "USDARS", 38.025498, LocalDateTime.of(2022, 1, 1, 1, 1, 1)),
                new Exchange(8L, "USDAUD", 1.41645, LocalDateTime.of(2022, 1, 1, 1, 1, 1)),
                new Exchange(9L, "USDAWG", 1.8005, LocalDateTime.of(2022, 1, 1, 1, 1, 1)),
                new Exchange(10L, "USDAZN", 1.704992, LocalDateTime.of(2022, 1, 1, 1, 1, 1))
        );
    }
} // 가짜 ExchangeRepository 구현

...

@Test
void 환율_리스트는_최신_목록의_환율_기준으로_불러온다() {
        // given
        Exchange recentExchange = new Exchange(1L, "USDAED", 3.673197, LocalDateTime.of(2022, 1, 1, 1, 1, 1));
        
        // when
        new ExchangeViewService(new ExchangeFakeRepository()); // 가짜 ExchangeRepository를 넣음
        List<ExchangeResponse> allExchange = exchangeViewService.getAllExchange();

        // then
        assertThat(allExchange.size()).isEqualTo(10);
}
```
  

해당 예제에서는 ExchangeRepository를 이용하여 가짜 객체(ExchangeFakeRepository)를 만들었고, 이를 이용하여 테스트를 작성하였다.

  

### 결론

지금까지 TestDoublc에 대해 Mock, Stub 그리고 Fake에 대해 간단히 설명을 해보았다.

  

여기서 더 생각해볼만한 부분이 있다면 이것 또한 여러 가지가 있을 것 같다.

  

- 테스트에 대해서 가짜 객체를 이용하여 모두 테스트 할 것인가?

- 테스트에 대해서 실제 객체를 이용하여 모두 테스트 할 것인가?

- 테스트에 대해 적절하게 섞어가며 할 것인가?

- TestDouble에서 여러가지가 있을 텐데, 무엇을 상황에 맞게 사용할 것인가?

- 빌드 시에 테스트도 모두 돌아갈텐데, 어떻게 해야 빌드 속도도 빠르게 할 것이고, 안정적인 테스트를 할 것인가?

  

여러분은 어떠한 선택을 할 것인가요?
