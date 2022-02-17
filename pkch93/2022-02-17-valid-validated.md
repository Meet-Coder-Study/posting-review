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
