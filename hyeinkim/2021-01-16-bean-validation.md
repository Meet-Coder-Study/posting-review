# Bean Validation : 컨트롤러에서 유효성 검사를 해보자

데이터 유효성 검사는 Presentation Layer, Business Layer, Data Access Layer 등 **모든 애플리케이션 계층에서 발생하는 작업**이다. 그래서 **같은 로직임에도 코드가 중복되는 문제**를 가지고 있다.

![application-layers](./images/application-layers.png)

![application-layers2](./images/application-layers2.png)

`Bean Validation`은 이 문제를 해결하기 위해 만들어졌다. 도메인 모델에 Bean Validation을 사용해서 데이터 유효성 로직을 구현하고, 이를 검증이 필요한 계층에서 사용할 수 있다. 

## Bean Validation? Hibernate Validator?
- `Bean Validation` : 엔티티와 메서드 검증을 위한 메타데이터 모델과 API를 정의한 명세
- `Hibernate Validater` : Bean Validation의 구현체(implementation)

Bean Validation은 명세이기 때문에 이것만 의존성 추가할 경우, 정상적으로 데이터 검증이 되지 않는다. (당연한 말이지만;) 반드시 프로젝트에 Hibernate Validater 의존성을 추가하도록 하자.

#### maven
```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```
Spring Boot를 사용하고 있다면 `spring-boot-starter-validation`이 자동으로 `Hibernate Validater`가 추가된다. 그 외 프로젝트는 아래의 방법으로 의존성을 추가하면 된다.

```maven
<dependency>
    <groupId>org.hibernate.validator</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>6.2.0.Final</version>
</dependency>
```

#### gradle
```gradle
implementation 'org.hibernate.validator:hibernate-validator:6.2.0.Final'
```

> 참고 : Hibernate Validator 6과 Bean Validation 2.0은 Java8 이상이 요구된다

## Bean Validation Constraint
Bean Validation의 제약(Constraint)은 어노테이션으로 표현할 수 있다. 빈 제약의 유형은 크게 4가지가 있다.

- `Field-level constraints`
- `Property-level constraints`
- `Container element constraints`
- `Class-level constraints`


## Spring MVC Controller에서 Validation 

### 1. 제약을 어노테이션으로 표현

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountDto {

	@NotNull
	private String name;

	private String phone;

	@Email
	private String email;

	@NotEmpty(message = "사용자 이름은 필수입니다")
	private String accountName;

	@Size(min = 4, max = 16, message = "비밀번호는 {min}~{max}자리여야 합니다")
	private String password;

}
```
회원가입 화면에서 적용할 데이터 유효성검사 목록은 아래와 같다.

- 이름은 null이 올 수 없다
- 이메일 형식을 가져야 한다.
- 사용자 이름은 필수다.
- 비밀번호는 4~16자리여야 한다.

Field-level 방식으로 제약을 어노테이션으로 표현한다. 제약의 message 속성으로 오류에 대한 메시지를 정의할 수 있다.

- `@NotNull` : value가 not null인지 체크한다. (모든 데이터 타입)
- `@NotEmpty` : element가 null이 아닌지, 비어있지 않은지 체크한다. (CharSequence, Collection, Map and arrays)
- `@Email` : 유효한 이메일 주소인지 체크한다. (CharSequence)
- `@Size(min=, max=)` : element의 사이즈가 min과 max 사이에 있는지 체크한다. (CharSequence, Collection, Map and arrays)
 


그 밖에도 Bean Validation은 [다양한 어노테이션]((https://beanvalidation.org/2.0/spec/#builtinconstraints))을 제공한다. 
- `@NotBlank`
- `@Null`
- `@AssertTrue`
- `@AssertFalse`
- `@Min`
- `@Max`
- `@DecimalMin`
- `@DecimalMax`
- `@Negative`
- `@Positive`
- `@Digits`
- `@Past`
- `@Future`
- `@Pattern`


### 2. @Valid로 유효성 검사, BindingResult(또는 Errors)로 결과 바인딩
```java
@AllArgsConstructor
@Controller
@RequestMapping(value = "/accounts")
public class AccountController {
	
    private AccountService accountService;
	
    @ResponseBody
    @PostMapping("/signup")
    public ResponseEntity<?> create(@RequestBody @Valid AccountDto accountDto, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(result);
        }
        
        Account account = Account.builder()
                                .name(accountDto.getName())
                                .phone(accountDto.getPhone())
                                .email(accountDto.getEmail())
                                .accountName(accountDto.getAccountName())
                                .password(accountDto.getPassword())
                                .build();
		
        accountService.join(account);
		
        return ResponseEntity.ok().body(account);
	}
}

```
도메인 모델에 어노테이션을 사용해 제약을 걸었다. 유효성 검사는 회원가입 요청을 받는 컨트롤러 부분에서 진행한다. 

- 검증할 `AccountDto` 객체에 `@Valid`를 붙인다. 
- 컨트롤러에 요청이 들어왔을 때 유효성 검사가 실행된다.
- `BindingResult`는 항상 `@Valid` 다음 인자로 사용해야 한다(Spring MVC)
- 검증 결과는 `BindingResult` 객체에 담긴다. 

유효하지 않은 객체일 경우 `result.hasErros()`에서 `false`를 리턴한다. 이 경우 상태를 Bad Request(400), 결과를 body에 담아 반환하도록 한다.

하지만, 이대로 요청을 보내면 Bad Request(400)가 아닌 Internal Server Error(500) 에러가 발생한다. ResponseEntity의 body 부분에서 result 객체 직렬화가 실패했기 때문이다.

Spring Boot에서 제공하는 `ObjectMapper`(`BeanSerializer`)는 객체를 JSON으로 직렬화하는 작업을 수행한다. 하지만 `BindingResult`(또는 `Errors`)는 JavaBean 스펙에 맞지 않기 때문에 직렬화가 정상적으로 되지 않는다. 이런 경우 커스텀한 JsonSerializer를 만들어서 사용하면 직렬화를 할 수 있고 응답 body에 보낼 수 있다.

```java
@JsonComponent
public class BindingResultSerializer extends JsonSerializer<BindingResult>{

    @Override
    public void serialize(BindingResult value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartArray();
        value.getFieldErrors().stream().forEach(e -> {
            try {
                gen.writeStartObject();
                gen.writeStringField("field", e.getField());
                gen.writeStringField("objectName", e.getObjectName());
                gen.writeStringField("code", e.getCode());
                gen.writeStringField("defaultMessage", e.getDefaultMessage());
                
                Object rejectedValue = e.getRejectedValue();
                if (rejectedValue != null) {
                    gen.writeObjectField("rejectedValue", rejectedValue);
                }
                gen.writeEndObject();
            } catch(Exception e1) {	
			}
        });
        gen.writeEndArray();
	}
}
```

### 3. 실행 결과

#### 성공
```
POST / localhost:8080/accounts/signup
{
    "name" : "hi",
    "phone" : "01012345678",
    "email" : "test@test.com",
    "accountName" : "hyenny",
    "password" : "12345"
}
```

```
HTTP/1.1 200 OK
{
    "id": 2,
    "name": "hi",
    "phone": "01012345678",
    "email": "test@test.com",
    "accountName": "hyenny",
    "password": "12345",
    "createdDate": "2021-01-16T09:18:05.446",
    "updatedDate": "2021-01-16T09:18:05.446"
}
```

#### 실패
```
POST / localhost:8080/accounts/signup
{
    "name" : null,
    "phone" : "01012345678",
    "email" : "test@@",
    "accountName" : "",
    "password" : "12"
}
```

```
HTTP/1.1 400 Bad Request
[
    {
        "field": "accountName",
        "objectName": "accountDto",
        "code": "NotEmpty",
        "defaultMessage": "사용자 이름은 필수입니다",
        "rejectedValue": ""
    },
    {
        "field": "password",
        "objectName": "accountDto",
        "code": "Size",
        "defaultMessage": "비밀번호는 4~16자리여야 합니다",
        "rejectedValue": "12"
    },
    {
        "field": "name",
        "objectName": "accountDto",
        "code": "NotNull",
        "defaultMessage": "널이어서는 안됩니다"
    },
    {
        "field": "email",
        "objectName": "accountDto",
        "code": "Email",
        "defaultMessage": "올바른 형식의 이메일 주소여야 합니다",
        "rejectedValue": "test@@"
    }
]
```

> +Bean Validation의 그룹핑, 에러 핸들링, 동적 메시지 생성 등 더 많은 기능이 궁금하다면 [Validation 어디까지 해봤니?](https://meetup.toast.com/posts/223) 글을 추천한다.

# 참고자료
- [Hibernate Validater Documentation](https://docs.jboss.org/hibernate/validator/7.0/reference/en-US/html_single/#preface)
- [스프링 기반 REST API 개발](https://www.inflearn.com/course/spring_rest-api/dashboard)