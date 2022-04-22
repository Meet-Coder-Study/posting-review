# OAuth2 Login with Springboot using Spring Security 5 On Kakao


- 보안
  - 인증 : 니가 너냐?
    - 로그인
      - 각 서버에서 각자 인증
      - 인증 서버에게 위임(OAuth)
    - 로그인 이후
      - 세션 방식
        - Session id
        - Access token
      - JWT 방식
        - JWT
  - 인가 : 니 권한은 뭐냐?

> 글에서 다룰 내용 : OAuth 로그인 + access token

## OAuth Login Flow

![image](https://user-images.githubusercontent.com/6725753/163434434-c6e2c28a-36ab-4cab-9abf-a360f95dd025.png)

https://datatracker.ietf.org/doc/html/rfc6749#section-1.3.1

- Auth Server / Resource Owner : KAKAO
- User-Agent : 웹브라우저
- Client : 우리 서버
- `Spring 에서는 Authorization / Resource / Client 3가지 모듈 제공`

1. (A) 클라이언트는 리소스 소유자의 사용자 에이전트를 권한 부여 끝점으로 안내하여 흐름을 시작합니다.
2. 클라이언트에는 클라이언트 식별자, 요청된 범위, 로컬 상태 및 액세스가 허용(또는 거부)되면 권한 부여 서버가 사용자 에이전트를 다시 보낼 리디렉션 URI가 포함됩니다.
3. (B) 권한 부여 서버는 사용자 에이전트를 통해 리소스 소유자를 인증하고 리소스 소유자가 클라이언트의 액세스 요청을 승인하거나 거부하는지 여부를 설정합니다.
4. (C) 리소스 소유자가 액세스 권한을 부여한다고 가정하면 권한 부여 서버는 이전에(요청에서 또는 클라이언트 등록 중에) 제공된 리디렉션 URI를 사용하여 사용자 에이전트를 클라이언트로 다시 리디렉션합니다. 리디렉션 URI에는 이전에 클라이언트가 제공한 인증 코드와 모든 로컬 상태가 포함됩니다.
5. (D) 클라이언트는 이전 단계에서 수신한 인증 코드를 포함하여 인증 서버의 토큰 끝점에서 액세스 토큰을 요청합니다. 요청 시 클라이언트는 권한 부여 서버로 인증합니다. 클라이언트에는 확인을 위한 인증 코드를 얻는 데 사용되는 리디렉션 URI가 포함되어 있습니다.
6. (E) 권한 부여 서버는 클라이언트를 인증하고, 권한 부여 코드를 검증하며, 수신된 리디렉션 URI가 (C) 단계에서 클라이언트를 리디렉션하는 데 사용된 URI와 일치하는지 확인합니다. 유효한 경우 권한 부여 서버는 액세스 토큰과 선택적으로 새로 고침 토큰으로 응답합니다.

> redirect

![image](https://user-images.githubusercontent.com/6725753/164593494-1f8bc7e3-4e9c-4bbe-bf66-9efa95bed2c8.png)



## Kakao OAuth 로그인

https://developers.kakao.com/docs/latest/ko/kakaologin/common

![image](https://user-images.githubusercontent.com/6725753/164592549-bcc08f6c-c68c-4d6c-b6b2-824c956a530a.png)
![image](https://user-images.githubusercontent.com/6725753/164592596-68668324-f144-4043-8368-183aaefa9763.png)

> 선작업 : client 등록

물론 위 작업을 하기 위해서는 우리의 앱을 client로 먼저 등록을 해야한다.

https://developers.kakao.com/console/app

- ![image](https://user-images.githubusercontent.com/6725753/164594452-ba9d2d3b-4075-4383-896c-dab7d7b1a989.png)
- ![image](https://user-images.githubusercontent.com/6725753/164592843-64d2d423-2119-4a49-be5b-cc86d5282f1d.png)
- ![image](https://user-images.githubusercontent.com/6725753/164593002-a089d3af-0520-43f4-aae3-0f42542100ae.png)
- ![image](https://user-images.githubusercontent.com/6725753/164593096-7a94946d-56c1-4c41-adea-fc9d20d999d6.png)
- ![image](https://user-images.githubusercontent.com/6725753/164593322-49e73d23-dca5-42b5-bbc2-7e1f093eb7c7.png)

## Spring boot OAuth Client

https://github.com/v0o0v/spring-oauth2-login-kakao

```yaml
## kakao
spring.security.oauth2.client.registration.kakao.client-id=a0542b246a156ebc7f2eb417dd5e29a2
spring.security.oauth2.client.registration.kakao.client-secret=kKLDO0Va1B70yQwkGzCgkvuNLPQdSykL
spring.security.oauth2.client.registration.kakao.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.kakao.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
spring.security.oauth2.client.registration.kakao.scope=profile_nickname, profile_image
spring.security.oauth2.client.registration.kakao.client-name=Kakao
spring.security.oauth2.client.registration.kakao.client-authentication-method=POST
spring.security.oauth2.client.provider.kakao.token-uri=https://kauth.kakao.com/oauth/token
spring.security.oauth2.client.provider.kakao.authorization-uri=https://kauth.kakao.com/oauth/authorize
spring.security.oauth2.client.provider.kakao.user-info-uri=https://kapi.kakao.com/v2/user/me
spring.security.oauth2.client.provider.kakao.user-name-attribute=id
```

- google 이나 facebook은 이미 대부분의 정보가 스프링에 포함되어 있지만 카카오는 다 입력해줘야 한다.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
        .authorizeRequests()
        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
        .anyRequest().authenticated()
        .and()
        .oauth2Login()
        .loginPage("/login")
        .permitAll();
  }
}
```

oauth2Login()을 통하여 기존에 귀찮았던 작업들이 마법처럼 해결이된다.

http://localhost:8080/login
로 접속을 하면 아래와 같은 화면이 나오고 kakao 버튼을 누르면 카카오의 인증 과정을 거쳐서 마침내 access 토큰을 획득할 수 있다.

![image](https://user-images.githubusercontent.com/6725753/164601275-ce011802-0f6b-4b72-96c1-244ea7e2998e.png)

이 과정에 이미 세션이 생성되었고 spring 내부적으로 사용자의 정보를 가지고 있게 된다.
![image](https://user-images.githubusercontent.com/6725753/164608573-884752a2-6afc-4b86-99c2-ba4ed885aeed.png)


## 참고
- https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html
- https://datatracker.ietf.org/doc/html/rfc6749#section-1.3.1
- https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api
- https://www.baeldung.com/spring-security-5-oauth2-login