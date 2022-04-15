# Describe - Context - It 패턴 테스트 소개
## Describe - Context - It 패턴
Describe - Context - It 패턴은 BDD 테스트 코드 작성 패턴 중 하나이다.

해당 패턴의 장점은 Given-When-Then 처럼 상황을 설명하기 보다는 테스트 대상을 중심으로 설명할 수 있다는 점이다.

<br>

| 키워드      | 설명                                     |
|:---------|:---------------------------------------|
| Describe | 테스트 대상이 되는 클래스, 메소드 이름을 명시한다.          |
| Context  | 테스트할 메소드에 입력할 파라미터를 설명한다.              |
| It       | 테스트 대상 메소드가 무엇을 리턴하는지 설명한다.            |

<br>

## Java BDD ??
일반적으로 자바에서는 아래와 같이 테스트 코드를 작성한다.

```java
// given
int a = 200;
int b = 300;

// when
int result = sum(a, b);

// then
assertThat(result).isEqualTo(500);
```

<br>

## Junit5 의 @Nested 를 사용하자
Describe - Context - It 패턴을 사용하여 테스트를 작성하면 아래와 같은 결과를 얻을 수 있다.

![image](https://user-images.githubusercontent.com/60383031/163583897-f494ca8a-c7f3-4a58-9c59-5cc4552979d2.png)


자바 코드로 어떻게 테스트를 작성하면 되는지 알아보자.

먼저, 아래는 회원가입을 하는 간단한 서비스 코드다.

```java
@Service
@RequiredArgsConstructor
public class AccountService {
  private final AccountRepository accountRepository;

  @Transactional
  public AccountDto createAccount(@Valid final SignUpDto accountDto) {
    final Account existAccount = accountRepository.findAccountByEmail(accountDto.getEmail()).orElse(null);
    if (existAccount != null) {
      throw new IllegalArgumentException("duplicated");
    }

    final Account account = Account.builder()
        .name(accountDto.getName())
        .email(accountDto.getEmail())
        .password(accountDto.getPassword())
        .build();

    return AccountDto.of(accountRepository.save(account));
  }
}
```

<br>

이제 테스트 코드를 살펴보자.

```java
@ExtendWith(MockitoExtension.class)
@DisplayName("AccountService 클래스")
class AccountServiceTest {

    @Mock
    AccountRepository accountRepository;

    @InjectMocks
    AccountService accountService;

    @Nested
    @DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
    class createAccount_메소드는 {
        // Describe

        @Nested
        @DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
        class 회원가입_요청이_들어올_때 {
            // Context
            String givenEmail = "test@gmail.com";

            SignUpDto givenSignUpDto = SignUpDto.builder()
                    .name("테스트")
                    .email("test@gmail.com")
                    .password("test1234!")
                    .build();

            Account givenAccount = Account.builder()
                    .name("테스트")
                    .email("test@gmail.com")
                    .password("test1234!")
                    .build();

            @Test
            @DisplayName("이메일_중복이면_예외를_던진다")
            void 이메일_중복이면_예외를_던진다() {
                // it
                given(accountRepository.findAccountByEmail(givenEmail))
                        .willReturn(Optional.of(givenAccount));

                assertThatThrownBy(() -> accountService.createAccount(givenSignUpDto))
                        .isInstanceOf(IllegalArgumentException.class);
            }

            @Test
            @DisplayName("회원_정보를_저장한다")
            void 회원_정보를_저장한다() {
                // it
                given(accountRepository.findAccountByEmail(givenEmail))
                        .willReturn(Optional.empty());

                given(accountRepository.save(any(Account.class)))
                        .willReturn(givenAccount);

                AccountDto result = accountService.createAccount(givenSignUpDto);

                assertThat(result.getEmail()).isEqualTo("test@gmail.com");
            }
        }
    }
}
```

#### 참고
https://johngrib.github.io/wiki/junit5-nested/

https://helloworld.kurly.com/blog/try-bdd/
