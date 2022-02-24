# Spring Validation - @Valid, @Validated의 동작

Spring에서는 JSR-303 명세에 따른 Bean Validation 기능을 제공한다. 이에 따라 `javax.validation.Valid` 어노테이션에 대한 유효성 검증과 Spring에서 정의한 `@Validated`를 통해서도 빈 유효성 검증을 제공해준다.

다만, 공식문서나 다른 자료에서 `@Valid`와 `@Validated`에 대한 자세한 설명이 되어 있는게 없어서 Spring 코드를 보고 확인해보고자한다.

## ArgumentResolver에서의 `@Valid`와 `@Validated`

컨트롤러의 메서드 핸들러에서 요청값 검증을 위해 `@Valid`와 `@Validated`를 주로 사용한다. 즉, ArgumentResolver에서 `@Valid`와 `@Validated`가 어떻게 사용되는지 확인해본다.

### validateIfApplicable

`validateIfApplicable`을 사용하여 `@Valid`와 `@Validated` 유효성 검증을 지원하는 ArgumentResolver가 있다.

- @RequestPart `RequestPartMethodArgumentResolver`
- @RequestBody `RequestResponseBodyMethodProcessor`
- @ModelAttribute `ModelAttributeMethodProcessor`

위 어노테이션에 대한 ArgumentResolver들은 resolveArgument 메서드 내부에 `validateIfApplicable`를 호출한다. `validateIfApplicable` 내부에는 `ValidationAnnotationUtils#determineValidationHints` 를 호출하는데 다음과 같다.

```java
protected void validateIfApplicable(WebDataBinder binder, MethodParameter parameter) {
    for (Annotation ann : parameter.getParameterAnnotations()) {
        Object[] validationHints = ValidationAnnotationUtils.determineValidationHints(ann);
        if (validationHints != null) {
            binder.validate(validationHints);
            break;
        }
    }
}
```

```java
@Nullable
public static Object[] determineValidationHints(Annotation ann) {
    Class<? extends Annotation> annotationType = ann.annotationType();
    String annotationName = annotationType.getName();
    if ("javax.validation.Valid".equals(annotationName)) {
        return EMPTY_OBJECT_ARRAY;
    }
    Validated validatedAnn = AnnotationUtils.getAnnotation(ann, Validated.class);
    if (validatedAnn != null) {
        Object hints = validatedAnn.value();
        return convertValidationHints(hints);
    }
    if (annotationType.getSimpleName().startsWith("Valid")) {
        Object hints = AnnotationUtils.getValue(ann);
        return convertValidationHints(hints);
    }
    return null;
}
```

즉, resolveArgument를 하고자하는 대상에 `@Valid`와 `@Validated`가 붙어있는지를 확인하는 과정이 위 `validateIfApplicable`와 `ValidationAnnotationUtils#determineValidationHints`에서 이뤄진다. `determineValidationHints`에서 반환되는 값은 그룹에 대한 힌트로 처리한다.

위 로직을 통해 `@Valid`나 `@Validated`가 존재하는지, 즉, 빈 유효성 검사의 대상인지 확인한 후에 `javax.validation.Validator`의 구현체인 ValidatorImpl의 validate를 통해 실제 유효성을 체크한다.

## MethodValidationBeanPostProcessor

컨트롤러에서 `@PathVariable`, `@RequestParam` 등으로 입력값 검증을 하거나 스프링 컨테이너에 생성하는 빈이 호출하는 메서드의 파라미터에 대해서도 Spring Validation을 사용하여 검증할 수 있다. 이를 도와주기 위해 스프링에서는 MethodValidationBeanPostProcessor를 제공한다.

MethodValidationBeanPostProcessor는 빈에서 사용하는 메서드의 파라미터를 Spring Validation으로 검증할 수 있도록 도와주는 BeanPostProcessor이다.

> BeanPostProcessor는 스프링 컨테이너에서 제공하는 생성로직을 추가하는 등 커스텀하게 변경할 수 있도록 지원한다. 빈이 생성되기 전후로 BeanPostProcessor의 `postProcessBeforeInitialization`와 `postProcessAfterInitialization`를 호출하여 빈에 기능을 추가하도록 도와준다. 

MethodValidationBeanPostProcessor는 빈 클래스에 `@Validated` 어노테이션이 붙은 빈에 프록시를 활용하여 Spring Validation을 사용할 수 있도록 지원한다.

```java
// MethodValidationBeanPostProcessor

private Class<? extends Annotation> validatedAnnotationType = Validated.class;

// ...

@Override
public void afterPropertiesSet() {
    Pointcut pointcut = new AnnotationMatchingPointcut(this.validatedAnnotationType, true);
    this.advisor = new DefaultPointcutAdvisor(pointcut, createMethodValidationAdvice(this.validator));
}

protected Advice createMethodValidationAdvice(@Nullable Validator validator) {
    return (validator != null ? new MethodValidationInterceptor(validator) : new MethodValidationInterceptor());
}
```

MethodValidationBeanPostProcessor은 MethodValidationBeanPostProcessor 생성 직후 `afterPropertiesSet` 콜백을 통해 `@Validated` 포인트컷을 가지고 MethodValidationInterceptor를 어드바이스로 가지는 어드바이저를 할당한다.

이를 기반으로 빈이 생성되었을때 타겟 빈이 `@Validated`가 매핑되어있는지 확인하고 Validation을 위한 프록시 팩토리를 생성한다.

> 위 부분은 `MethodValidationBeanPostProcessor`의 상위 클래스 `AbstractAdvisingBeanPostProcessor`의 `postProcessAfterInitialization` 를 참고한다. 빈이  `MethodValidationBeanPostProcessor`에서 정의한 포인트 컷에 할당이 가능한지를 판단하는데 이 기준이 `@Validated`이다.
>
> 이와 같은 이유로 `@Validated`를 사용하여 Spring Validation 기능을 적용하는 경우에는 AOP의 기능을 사용한다. 그리고 빈 클래스에 `@Validated`가 붙어있어야 AOP의 지원을 받을 수 있기 때문에 메서드 레벨의 `@Validated`는 Spring Validation을 사용할 수 없다.

실제 Validation을 처리하는 로직은 MethodValidationInterceptor를 참고해야한다. MethodValidationInterceptor에서 Hibernate Validator 구현체를 활용하여 자바 표준의 Bean Validation 1.1을 지원한다.

## 컨트롤러에서의 Bean Validation

앞서 ArgumentResolver에서의 `@Valid`와 `@Validated`에서 봤듯이 몇몇 ArgumentResolver에서 Bean Validation을 지원한다.

`RequestPartMethodArgumentResolver`,  `RequestResponseBodyMethodProcessor`, `ModelAttributeMethodProcessor`에서 resolveArgument를 할 때 Bean Validation이 이뤄진다.

이때 ArgumentResolver에서 파라미터에 붙은 `@Valid`와 `@Validated` 어노테이션만 보고 Bean Validation을 한다. 이때 `@Validated`에는 group을 지정할 수 있는데 파라미터의 `@Validated`의 group만 적용을 한다. `ValidationAnnotationUtils#determineValidationHints 참고`

## 컴포넌트 빈에서의 Bean Validation

컴포넌트 클래스에 `@Validated`를 붙인다면 MethodValidationBeanPostProcessor에 의해 메서드에서 Bean Validation을 사용할 수 있도록 만들 수 있다.

```java
@Slf4j
@Service
@Validated
public class GroupingValidationService {
    // ...
}
```

위와 같이 빈 컴포넌트에 `@Validated`를 붙이면 활용할 수 있다.

여기에 Bean Validation으로 유효성 검증을 하고자하는 파라미터에 `@Valid`를 붙이면 유효성 검증을 할 수 있다. 빈 유효성 검증 로직은 MethodValidationInterceptor에서 담당한다. 메서드 AOP를 통해 MethodValidationInterceptor에서 파라미터 유효성 검증을 하도록 MethodValidationBeanPostProcessor가 포인트컷을 등록하기 때문에 가능하다.

단, 파라미터에 `@Validated`를 붙이는 경우에는 유효성 검증이 불가능하다. 이는 MethodValidationInterceptor에서 표준 Bean Validation의 구현체로 검증하기 때문으로 보인다. 때문에 Spring의 어노테이션인 `@Validated`로는 검증을 하지 못하는 것이다.

```java
@Override
@Nullable
public Object invoke(MethodInvocation invocation) throws Throwable {
    // ...

    Class<?>[] groups = determineValidationGroups(invocation);

    // Standard Bean Validation 1.1 API
    ExecutableValidator execVal = this.validator.forExecutables();
    Method methodToValidate = invocation.getMethod();
    Set<ConstraintViolation<Object>> result;

    // ...
}
```

> `Standard Bean Validation 1.1 API` 위 주석으로 표준 Bean Validation에서 지원하는 `@Valid`로 유효성 검증을 지원할 것으로 추측된다.

그렇다면 `@Validated`는 단지 빈 컴포넌트가 유효성 검증을 사용할 수 있도록 만들기만 할까? 그렇지는 않다. 그룹을 지정하는 용도로도 사용이 가능하다.

```java
public @interface GroupA {
}

public @interface GroupD {
}

@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class GroupingRequest {
    public static final String A_INVALID_MESSAGE = "a는 5 이상이어야 합니다.";
    public static final String B_INVALID_MESSAGE = "b는 10 이상이어야 합니다.";
    public static final String D_INVALID_MESSAGE = "d는 100이하여야 합니다.";

    @Min(value = 5, groups = GroupA.class, message = A_INVALID_MESSAGE)
    private int a;

    @Min(value = 10, message = B_INVALID_MESSAGE)
    private int b;

    private int c;

    @Max(value = 100, groups = GroupD.class, message = D_INVALID_MESSAGE)
    private int d;

    @Builder
    public GroupingRequest(int a, int b, int c, int d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
}
```

```java
@Slf4j
@Service
@Validated(GroupD.class)
public class GroupDValidationService {

  public void validateForGroupD(@Valid GroupingRequest request) {
      log.info("grouping request: {}", request);
  }

}
```

위와 같이 클래스 레벨에 `GroupD.class`로 그룹을 지정하면 GroupingRequest에서 `GroupD.class`로 지정된 필드만 유효성 검증을 한다.

`@Validated`는 메서드에서 지정할 수 있다. 메서드 지정하는 `@Validated`는 빈 컴포넌트에서 검증할 그룹을 지정할 때 사용할 수 있다.

```java
@Slf4j
@Service
@Validated(GroupD.class)
public class GroupDValidationService {

  @Validated(GroupA.class)
  public void validateForGroupAAndD(@Valid GroupingRequest request) {
      log.info("grouping request: {}", request);
  }

}
```

위와 같이 `GroupDValidationService#validateForGroupAAndD`에 `@Validated`를 달 수 있다. 단, 위 예시만 보면 `validateForGroupAAndD`에서는 GroupA와 GroupD에 대해서 유효성 검증을 할 것으로 보인다. 하지만 위 경우는 GroupA에 대해서만 유효성 검증을 한다. 즉, GroupingRequest의 필드 a만 검증을 한다.

이는 `MethodValidationInterceptor`에서 그룹을 판단하는 로직 때문이다.

```java
protected Class<?>[] determineValidationGroups(MethodInvocation invocation) {
    Validated validatedAnn = AnnotationUtils.findAnnotation(invocation.getMethod(), Validated.class);
    if (validatedAnn == null) {
        Object target = invocation.getThis();
        Assert.state(target != null, "Target must not be null");
        validatedAnn = AnnotationUtils.findAnnotation(target.getClass(), Validated.class);
    }
    return (validatedAnn != null ? validatedAnn.value() : new Class<?>[0]);
}
```

위 메서드 `determineValidationGroups`는 `MethodValidationInterceptor`에서 유효성 검증을 위한 그룹을 판단하기 위한 로직이다.

이때 처음에 호출하는 메서드의 `@Validated` 어노테이션을 찾는다. `invocation.getMethod()` 만약 존재한다면 메서드의 `@Validated` 에서 value인 그룹을 반환한다.

메서드 레벨의 `@Validated`가 존재하지 않는다면 호출되는 메서드의 클래스를 찾는다. 그리고 그 클래스에 붙은 `@Validated`의 value를 그룹으로 판단한다.

즉, 메서드 `@Validated`의 그룹을 우선으로 사용하며 존재하지 않으면 클래스 `@Validated`의 그룹을 유효성 검증에 사용할 그룹으로 판단한다.
