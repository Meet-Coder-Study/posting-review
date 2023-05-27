# Numeric의 zero? & positive? & negative?

## Numeric

-   루비의 숫자 타입으로 숫자인 경우에 Numeric Class가 됩니다.
-   to\_i로 integer로 변경하면 Numeric 메서드를 사용할수 있습니다.

cf) nil을 to\_i로 하면 어떻게 되는가?

```
nil.to_i // 0
```

-   혹시라도 zero? & positive? & negative? 메서드를 사용할때, null safe를 해야할 경우 nil.to\_i를 하는것도 방법임.
-   그러나 zero?인 경우에 true가 나오기 때문에 nil이 0이라는 조건 하에 사용해야함.

## zero?

-   [APIdock](https://apidock.com/ruby/Numeric/zero%3F)
-   메서드명에서 보이다 싶이, 해당 숫자가 0인지를 체크하는 메서드 입니다.
-   구현 코드
-   `static VALUE num_zero_p(VALUE num) { if (FIXNUM_P(num)) { if (FIXNUM_ZERO_P(num)) { return Qtrue; } } else if (RB_TYPE_P(num, T_BIGNUM)) { if (rb_bigzero_p(num)) { /* this should not happen usually */ return Qtrue; } } else if (rb_equal(num, INT2FIX(0))) { return Qtrue; } return Qfalse; }`
-   예시 코드
-   `-1.positive? // false 0.positive? // true 1.positive? // false`

### positive?

-   [APIdock](https://apidock.com/ruby/v2_6_3/Numeric/positive%3F)
-   0보다 큰(양수) 경우에 true를 리턴한다.
-   구현 코드
-   `static VALUE num_positive_p(VALUE num) { const ID mid = '>'; if (FIXNUM_P(num)) { if (method_basic_p(rb_cInteger)) return (SIGNED_VALUE)num > (SIGNED_VALUE)INT2FIX(0) ? Qtrue : Qfalse; } else if (RB_TYPE_P(num, T_BIGNUM)) { if (method_basic_p(rb_cInteger)) return BIGNUM_POSITIVE_P(num) && !rb_bigzero_p(num) ? Qtrue : Qfalse; } return rb_num_compare_with_zero(num, mid); }`
-   예시 테스트
-   `-1.positive? // false 0.positive? // false 1.positive? // true`

### negative?

-   APIdock
-   0보다 작은(음수) 경우에 true를 리턴한다.
-   구현 코드
-   `static VALUE num_negative_p(VALUE num) { return rb_num_negative_int_p(num) ? Qtrue : Qfalse; }`
-   예시 테스트
-   `-1.positive? // true 0.positive? // false 1.positive? // false`

## 결론

-   ruby의 기본 숫자 메서드에서 양수, 음수, 0에 대한 부분을 검증해볼수 있음.
-   또한, even?, odd?를 통해 짝홀수도 검증이 가능함.
-   좀더 쉽게 숫자 조건식을 사용하기 위해 기억해두는것이 좋을거 같음.
