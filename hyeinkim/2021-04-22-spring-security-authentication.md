# Spring Security Authentication 기초

## SecurityContextHolder
Spring Security 인증 모델의 핵심이다. **누가 인증되었는지 세부 사항을 저장하는 곳**으로, SecurityContext를 포함하고 있다. 세부 사항(details)을 저장하기 위해 ThreadLocal을 사용한다.

![SecurityContextHolder](./images/securitycontextholder.png)

## SecurityContext
현재 인증된 사용자의 인증 정보를 담고 있다. `SecurityContextHolder`에서 가져올 수 있다.

```java
SecurityContext context = SecurityContextHolder.getContext();
```

## Authentication
`SecurityContext`에서 `Authentication` 객체를 가져올 수 있다.
Spring Security에서 Authentication은 2가지 목적을 제공한다.

### 현재 사용자의 인증 정보를 꺼내는 방법
```java
SecurityContext context = SecurityContextHolder.getContext();
Authentication authentication = context.getAuthentication();
String username = authentication.getName();
Object principal = authentication.getPrincipal();
Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
```

- `principal` : 사용자를 식별한다. username/password 인증할 때 
- `credential` : 
- `authorities` : 

## GrantedAuthority

- 인가? : ROLE_ADMINISTRATOR or ROLE_HR_SUPERVISOR 같은 roles
- username/password 기반 인증에서 GrantedAuthority는 보통 UserDetailService에 의해 로드되어진다.

- application-wide permissions

## AuthenticationManager

<center><img src="./images/providermanagers-parent.png" width="550"></center>


## 

<center><img src="./images/usernamepasswordauthenticationfilter.png" width="650" height="600"></center>



