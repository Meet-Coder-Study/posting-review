## Unit Tests

* 코드의 특정 부분을 테스트하기 위한 것
* 테스트되는 라인의 비율이 코드 커버리지
* 단일성(unity)를 가져야 하고 빠르게 실행되어야 한다.
* 외부 의존성이 존재해서는 안된다. (db, spring context...)

## Integration Tests

* 오브젝트와 시스템의 일부 사이의 행동을 테스트하기 위한 것
* spring context, database, messages 등이 포함될 수 있다.
* Unit Tests보다 더 큰 스코프를 가지고 더 느리게 실행 된다.

## Functional Tests

* 실행되는 어플리케이션을 테스트하는 것
* 특정한 환경에 배포된 어플리케이션을 테스트 한다.
* 가장 규모가 크고 느리다.

## Which Tests?

* 대부분의 테스트는 Unit Tests로 이뤄져야 한다.
* Unit Tests는 작고 빠르고 가볍다.
* 구체적이고 세밀하다.

## importance of Clean Code

* 클린한 코드일 수록 테스트하기 좋다. 
* Quality code starts with QUALITY CODE
* 좋은 coding practices를 따른다.
* Test Coverage는 나쁜 코드를 극복할 수 없다.

## TDD

* Test Driven Development
* 테스트 코드를 먼저 작성하고, 테스트를 통과하도록 코드를 수정하고, 리팩토링을 진행한다.

## BDD

* Behavior Driven Development
* 기대되는 행동을 서술한다.
* given/when/then 등의 표현으로 작성될 수 있다. 
* BDD or TDD : 둘 중 하나만 사용하는 것이 아니라, 두 개를 모두 상황에 맞게 사용한다.

