### 문제 상황

프로젝트 진행 중 소셜 로그인을 구현하기로 결정을 했습니다. 

소셜 로그인 도입 이유는 다음과 같았습니다. 

- 로그인시 보안을 신경쓰지 않아도 된다.
- 비밀번호 찾기, 변경을 신경쓰지 않아도 된다. 
- 추가 인증을 구현하지 않아도 된다. 



소셜 로그인을 구현 하면서 사용자의 정보를 가져오기 위해 DefaultOAuth2UserService를 상속한 OAuth2UserService를 만들어 사용하고 있었습니다. 



소셜 로그인을 구현 중 다음과 같은 문제가 발생했습니다. 

![img](https://blog.kakaocdn.net/dn/vV9wY/btsz2VDnca7/V1QE8JzvnWYYSiwvvTnmR0/img.png)

문제가 발생한 코드는 다음의 코드는 다음과 같습니다. 

```
httpSession.setAttribute("member", SessionUser.from(member));
```



해당 코드는 httpSession에  key : member, value : SessionUser를 넣는 로직입니다. 

### 문제 원인

> 근본적인 문제는 다음과 같습니다. 
> HttpSession에 값을 set 하려고 할 때, HttpServletRequest과 관련된 정보를 찾을 수 없어서 문제가 발생합니다. 



Security가 적용 될 경우 클라이언트의 요청은 다음과 같이 진행됩니다. 

![img](https://blog.kakaocdn.net/dn/b5EWxm/btsz1h8jsz6/2JRhUIfNR5kFSSQKbKDiD1/img.png)



소셜로그인을 진행하면 Security Filter Chain에서는 다음과 같은 절차가 진행됩니다. 

1. OAuth2AuthorizatopmReqiestRedirectFilter : registrationId에 따른 아이디 / 비밀번호를 입력할 수 있는 uri로 redirect
2. OAuth2LoginAuthenticationProvider : access token을 얻어오고, 유저 정보를 받아온다(OAuth2UserService 호출)
3. OAuth2UserService : 커스텀하게 생성한 UserService로, loadUser()를 통해 유저 정보를 받아온다. 

**No thread-bound reqeust found**



해당 예외는 현재 실행중인 thread에 HttpServletRequest가 바인딩 되어 있지 않을 때 발생하는 예외입니다. 사용자가 소셜로그인을 진행하기 위해 요청을 했지만 현재 DispatcherServlet 외부에서 요청에 대한 처리가 진행되고 있습니다. DispatcherServlet에서 요청을 처리하는 경우에는 현재 스레드의 RequestContextHolder에  HttpServletRequest, HttpServletResponse를 자동으로 바인딩 해줍니다. 하지만 DispatcherServlet 외부에서 요청을 처리하는 경우에는 수동으로 RequestContextHolder에 넣어주어야 합니다. 



**HttpSession과 HttpServletRequest, HttpServletResponse와 관련이 되어있나요?** 



관련이 되어있습니다.  Http는 기본적으로 Stateless한 속성을 가지기 때문에, 사용자의 상태 정보를 유지하기 위해 Session을 사용합니다. 클라이언트로 부터 웹 요청이 온다면, 서버에서 HttpSession을 만들고, 고유한 SessionId를 생성합니다. 그 후 응답을 할 때 쿠키로 SessionId를 전달해 줍니다. 

### 해결 방법

RequestContextListener, RequestContextFilter는 현재 스레드에 HttpServletRequest, HttpServletResponse를 직접 바인딩을 할 수 있습니다. RequestContextListener는 서블릿 리스너로, 요청이 시작될 때 HttpServletRequest를 RequestContextHolder에 바인딩 해주며, RequestContextFilter는 필터로, 필터체인을 통해 동일한 역할을 수행합니다. 



저의 경우에는 RequestContextListener를 스프링 Bean으로 등록해 줌으로써, 클라이언트 요청이 시작될 때 HttpServletRequest가 RequestContextHolder에 바인딩 될 수 있도록 해주었습니다.



```
    @Bean
    public RequestContextListener requestContextListener(){
        return new RequestContextListener();
    }
```



해당 빈을 등록 후 소셜로그인을 진행 해 본 결과 정상적으로 httpSession에 값이 담기는 것을 확인할 수 있었습니다.