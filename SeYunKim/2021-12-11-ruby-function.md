# [Functions in Ruby(루비의 함수)](https://medium.com/kode-art/functions-in-ruby-66790e97ed4a)

Ruby에서의 함수와 함수의 사용법에 대해서 알아보겠습니다.

우선 함수는 수천 줄의 코드를 수백, 수십 또는 그 이하로 줄일 수 있는 것이라고 생각하면 좋습니다. 코드의 크기가 줄이고 최적화하고 단순화 시키는 작업입니다.

상황해 따라 내장 함수(bulit-in functions) 또는 사용자 정의 함수(user-defined functions)를 사용할 수 있지만, 이 글은 사용자 정의 함수에 초점을 맞춰서 작성되었습니다.

## 함수란 무엇인가?

함수란 거대한 프로그램의 빌딩 블록들(building bolcks) 이라고 부를 수 있습니다. 함수를 통해 반복적인 큰 블록들을 단순화 할 수 있습니다. 올바르게 이름을 짓는다면 프로그램의 어느 부분에서나 호출할 수 있습니다. 함수가 없다면 동일한 코드 블록을 여러번 작성해야 합니다.

짧게 말해 함수(function)이란 이름이 있는 코드 블록입니다. 함수의 특징은 아래와 같습니다.

- 함수는 고유한 이름이 있습니다.
- 함수는 입력 데이터를 사용할 수 있습니다.
- 함수는 값이 반환될 수 있습니다.

### **함수와 프로시저(A function and a procedure)**

함수(function)은 실제 수학에서 유래되었습니다. 수학에서 함수를 주의를 기울이면 항상 결과를 반환합니다. 이때문에 프로그래밍 언어에서 결과를 반환하는지 여부에 따라 일부 코드 블록을 함수라고 하며, 일부는 프로시저라고 합니다. 그러나 현대 프로그래밍 언어에서는 이러한 차이가 없어졌으며 모두 함수라고 부르고 있습니다.

### 입력값(input data)

계산을 하거나, 몇몇의 작업을 수행하거나, 행위를 하기 위해 때때로 초기값이 필요할 수 있습니다. 예를들어 아래와 같습니다.

- 손님의 이름으로 인사하기 위해 손님의 이름이 필요합니다.
- 회사가 잘 운영되는지 보기 위해 월별 수입 및 지출 보고서가 필요합니다.
- 상점의 주간 판매 보고서를 계산하기 위해 제품의 수량과 단가가 필요합니다.

프로그래밍에서도 동일한 논리를 사용합니다. 무언가를 계산하기 위해 초기 데이터가 필요할 때가 있으며 이걸 매개변수(parameters)라고 합니다.

함수를 호출하고 함수를 정의 할 때 이전에 매개변수(parameters)라고 불렀던 초기 데이터를 전달하면 이걸 인수(arguments)라고 합니다. 함수를 정의할 때 초기데이터를 나열하는 것을 매개변수(parameters)라고 하며, 함수를 호출해 초기 데이터를 나열 할때는 인수(agurments)라고 합니다.

### 출력/결과(Output/Result)

일부 코드 블록은 결과를 반환하고, 일부는 반환하지 않습니다. 일반적으로 `return` 이라는 키워드를 사용해 함수의 결과를 반환합니다.

## 함수 예제(**Function Examples)**

루비에서는 함수를 정의하기 위해 `def` 라는 키워드를 사용합니다. 

입력데이터도 없고 출력 데이터도 없는 함수는 아래와 같습니다.

```ruby
def say_hello
   puts "Hello Ruby"
end

say_hello()  # "Hello Ruby"
```

입력데이터를 지정하는 함수는 아래와 같습니다

```ruby
def say_hello(guest_name)
   puts "Hello #{guest_name}"
end

say_hello("Marco")  # "Hello Marco"
```

입력값도 받고 결과값도 반환 해보도록 하겠습니다.

```ruby
def say_hello(guest_name)
   return "Hello #{guest_name}"
end

puts say_hello("Marco") # "Hello Marco"
```

예제에서 `guest_name` 은 매개변수(parameter)이며, `Marco` 는 인수(Agument)라고 부릅니다.

## 매개변수/인수 그리고 출력 결과(**Parameters/Arguments and output result)**

만약 함수에 여러 데이터를 제공하기 위해서는 `,` 를 사용합니다. 여기서 주의할 점은 함수를 정의할 때 나열한 순서로 함수를 호출할때도 나열을 해줘야 합니다.

```ruby
def say_hello(first_name, last_name, age)
   puts "Hello #{first_name} #{last_name}, You are #{age} years old"
end

say_hello("Marco", "purple", 29)
```

강한 타입의 프로그래밍 언어는 매개 변수 이름과 함께 타입도 제공합니다. 예를들어 `integer`, `string`, `character`, `boolean` 등등

컴파일러가 잘못된 타입의 매개변수가 함수에 제공될 때 경고를 하거나 오류를 반환합니다.

그러나 `Ruby` 는 매개변수명과 같이 타입을 제공할 필요가 없습니다. 올바른 타입을 함수에 넣는 건 개발자가 주의해야 합니다.

우리는 항상 함수에서 결과값을 반환하지 않습니다. 그러나 결과값을 반환할 때 `return` 키워드를 사용합니다. 그러나 루비는 함수 블록의 마지막 부분이 결과로 반환합니다.

```ruby
def print_bill(unit_price, quantity)
   return unit_price * quantity
end

puts print_bill(3.5, 4) # 14.0.

def print_bill_2(unit_price, quantity)
   unit_price * quantity
end

puts print_bill_2(3.5, 4)# 14.0
```

## **내장 함수(“Built-in” functions)**

개발자들이 쉽게 개발할 수 있도록 모든 프로그래밍 언어에서는 내장 함수를 정의해놓습니다. 모든 프로그래밍 언어에서는 수학 계산 및 문자열에 대한 내장 함수/메서드 가 있는데 그 중 몇가지를 살펴보겠습니다.

```ruby
# 모든 문자를 대문자로 설정 - 'capitalize'
"hello".capitalize  # "HELLO"

# 데이터를 String 타입으로 변환 - 'to_s'
25.to_s  # "25"

# 주어진 숫자의 제곱근을 반환 - 'sqrt'
Math.sqrt(25)  # 5
```

더 많은 내장 함수 및 내장 메서드는 공식 문서 웹페이지에서 볼 수 있습니다.
