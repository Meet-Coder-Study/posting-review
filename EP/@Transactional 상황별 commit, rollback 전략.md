# Overview



스프링을 사용하여 개발을 하면서 예외를 가장 예민하게 처리하는 기능 중 하나가 `@Transactional`입니다. `@Transactional`은 우리가 아는 데이터베이스의 트랜잭션과 같이 ACID의 특징을 가지면서 더 이상 쪼갤 수 없는 최소 단위의 작업입니다. 트랜잭션 경계안에서 진행된 작업은 commit을 통해 성공하거나 rollback을 통해 모두 취소되어야 합니다. 애플리케이션 단위에서 논리적인 단위로 트랜잭션을 묶습니다. 스프링에서는 이를 메서드 단위로 묶습니다. 이를 명시적으로 선언하기 위해 우리는 인터페이스, 클래스, 메서드 등의 `@Transactional`을 붙여주기만 하면 됩니다.

![image](https://user-images.githubusercontent.com/66561524/193181547-65ac4f7f-a091-4b77-b341-42ec2561a457.png)

그런데 이놈의 `@Transactional`은 사용하기 편한 정도에 비해 문제를 발견하기가 쉽지 않습니다. 이는 `@Transactional`을 기본적으로 이해하려면 Spring AOP와 프록시 객체를 이해해야 하고 [Transaction의 전파(propagation)와 격리(isolation)을 이해](https://github.com/eastperson/TIL/blob/main/Spring/%40Transactional%EC%9D%98%20%EC%A0%84%ED%8C%8C(propagation)%EC%99%80%20%EA%B2%A9%EB%A6%AC(isolation).md)해야 합니다.  그리고 Transactional의 다양한 properties를 숙지해야 합니다. 이런 문제를 각 상황에 맞게 해결하려고 하면 그때 그때 원인을 찾아내기 어려울 뿐만 아니라 테스트하기가 어렵습니다.

저는 이번 글에서 다양한 `@Transactional`의 use case를 테스트 코드를 통해 살펴보겠습니다. 코드를 보고 에러가 날지 추론을 하고 예상한 결과를 실제 결과를 비교해보겠습니다.

# 테스트 환경



- kotlin 1.6.21
- spring boot 2.7.4
- jpa
- java 17
- testcontainer 1.17.3
    - container image: mysql

테스트는 kotlin과 Spring, Spring Data JPA, Junit의 TestContainer 환경에서 진행 했습니다. 트랜잭션의 특징상 통합 테스트가 적절하다고 판단하였습니다. `@Transacitonal`은 DB Transaction의 영향을 받기 때문에 H2 등의 인메모리 데이터베이스가 아닌 프로덕션 환경과 똑같은 데이터베이스를 사용했습니다.

엔티티는 다음과 같이 2개의 엔티티를 정의했습니다.

```kotlin
@Entity
class Product(
    @Id
    val id: Long? = null,
    var name: String,
    val price: BigDecimal
)
```

```kotlin
@Entity
class Addition(
    @Id
    val id: Long? = null,
    val quantity: Long,
    @Column(length = 20)
    var name: String,
    val price: BigDecimal
)
```

그리고 우리는 두 가지의 Exception을 정의해줬습니다. 이 둘은 모두 `RuntimeException`을 상속받습니다.

```kotlin
class AdditionException : RuntimeException()
class ProductException : RuntimeException()
```

우리가 이 엔티티와 예외를 가지고 여러 경우를 테스트 해볼 예정입니다. Product와 Addition 각각의 트랜잭션이 모두 commit, rollback이 되는 상황과 트랜잭션을 분리하여 Product는 commit이 되고 Addition은 rollback이 되는 경우 등을 알아보겠습니다.

```kotlin
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
logging.level.org.springframework.transaction.interceptor=trace
```

테스트는 hibernate, transaction 로깅을 통해 확인해보았습니다. 실제 case별 테스트 코드는 [깃허브](https://github.com/eastperson/transactional_example)를 통해 확인할 수 있습니다.

# 우리가 예상하는 커밋과 롤백



## Case 1.

```kotlin
@Component
class ProductProcessor(
    private val productRepository: ProductRepository
) {

	@Transactional
	fun create(id: Long, name: String, price: BigDecimal) {
	    val product = Product(id = id, name = name, price = price)
	    productRepository.save(product)
	}
}
```

우선 가장 평범한 `@Transactional`의 사용입니다. 트랜잭션이 이 메서드를 호출하면서 트랜잭션이 시작되고 메서드가 끝나면서 트랜잭션이 commit이 됩니다.

```kotlin
[main] o.s.t.i.TransactionInterceptor : Getting transaction for [com.ep.transactional_example.command.ProductProcessor.create]

[main] o.s.t.i.TransactionInterceptor : Getting transaction for [org.springframework.data.jpa.repository.support.SimpleJpaRepository.save]

Hibernate: select product0_.id as id1_1_0_, product0_.name as name2_1_0_, product0_.price as price3_1_0_ from product product0_ where product0_.id=?

[main] o.s.t.i.TransactionInterceptor : Completing transaction for [org.springframework.data.jpa.repository.support.SimpleJpaRepository.save]

[main] o.s.t.i.TransactionInterceptor : Completing transaction for [com.ep.transactional_example.command.ProductProcessor.create]

Hibernate: insert into product (name, price, id) values (?, ?, ?)
```

로그를 보면 `TransactionManager`가 트랜잭션을 가져오고 비즈니스 로직이 끝난 후 트랜잭션을 complete 처리하는 것을 확인할 수 있습니다. 트랜잭션이 완료가 되고 나서 hibernate의 insert 쿼리가 발생하는 것을 알 수 있습니다.

## Case 2.

```kotlin
@Component
class ProductProcessor(
    private val productRepository: ProductRepository
) {

	@Transactional
  fun create(id: Long, name: String, price: BigDecimal) {
      val product = Product(id = id, name = name, price = price)
      productRepository.save(product)
      throw ProductException()
  }
}
```

이런, 트랜잭션 진행 중에 Runtime 예외가 발생했습니다. 이런 경우 해당 트랜잭션은 예상했던 대로 롤백이 됩니다.

```kotlin
[main] o.s.t.i.TransactionInterceptor : Getting transaction for [com.ep.transactional_example.command.ProductProcessor.create]

...

[main] o.s.t.i.TransactionInterceptor : Completing transaction for [com.ep.transactional_example.command.ProductProcessor.create] after exception: com.ep.transactional_example.exception.ProductException
```

마찬가지로 트랜잭션을 가져오고 complete 처리를 하지만 Exception 이후에 완료가 되었다는 로깅을 확인할 수 있습니다. 이 부분에서 롤백마크가 있는지 확인을 하고 커밋 혹은 롤백 처리를 하게 됩니다. 실제로 hibernate의 insert 쿼리가 발생하지 않은 것을 확인할 수 있습니다.

# Case 3.

```kotlin
@Component
class ProductProcessor(
    private val productRepository: ProductRepository
) {

	@Transactional
  fun create(id: Long, name: String, price: BigDecimal) {
      val product = Product(id = id, name = name, price = price)
      productRepository.save(product)
      try {
          throw ProductException()
      } catch (e: RuntimeException) {
          println("Runtime Exception catch")
      }
  }
}
```

그렇다면 이렇게 발생한 `RuntimeException`을 try-catch경우는 어떻게 처리가 될까요? 이 경우 트랜잭션 범위 안에서 발생한 예외를 잡아주었기 때문에 트랜잭션이 정상적으로 완료가 되면서 commit이 됩니다.

```kotlin
[main] o.s.t.i.TransactionInterceptor : Getting transaction for [com.ep.transactional_example.command.ProductProcessor.create]

[main] o.s.t.i.TransactionInterceptor : Getting transaction for [org.springframework.data.jpa.repository.support.SimpleJpaRepository.save]

Hibernate: select product0_.id as id1_1_0_, product0_.name as name2_1_0_, product0_.price as price3_1_0_ from product product0_ where product0_.id=?

[main] o.s.t.i.TransactionInterceptor : Completing transaction for [org.springframework.data.jpa.repository.support.SimpleJpaRepository.save]

Runtime Exception catch

[main] o.s.t.i.TransactionInterceptor : Completing transaction for [com.ep.transactional_example.command.ProductProcessor.create]

Hibernate: insert into product (name, price, id) values (?, ?, ?)
```

예외를 처리한 로깅(Runtime Exception catch)만 확인할 수 있고 실제로 예외가 발생한 로그가 남지 않았습니다.

# 트랜잭션 전파 속성



## Case 4.

```kotlin
@Component
class ProductProcessor(
    private val productRepository: ProductRepository,
    private val additionProcessor: AdditionProcessor
) {
	@Transactional
    fun create(createProduct: CreateProduct) {
        val product = Product(id = createProduct.id, name = createProduct.name, price = createProduct.price)
        productRepository.save(product)
        additionProcessor.create(createProduct.createAdditionList)
    }
}
```

```kotlin
@Component
class AdditionProcessor(
    private val additionRepository: AdditionRepository
) {

    @Transactional
    fun create(createAdditionList: List<CreateAddition>) {
        createAdditionList.forEach {
            val addition = Addition(id = it.id, quantity = it.quantity, name = it.name, price = it.price)
            additionRepository.save(addition)
        }
    }
}
```

조금 코드가 길어졌지만 예상하기 쉬운 코드입니다.  외부 클래스에서 트랜잭션이 최초로 실행이 되었고 다른 트랜잭션 메서드를 호출했습니다. `@Transactional`의 propagation의 default 설정은 `Propagation.REQUIRED` 이므로 두 트랜잭션은 병합이 됩니다. 따라서 최초 트랜잭션이 시작한 메서드를 마칠 때 트랜잭션이 완료되면서 commit이 됩니다.

```kotlin
[main] o.s.t.i.TransactionInterceptor : Getting transaction for [com.ep.transactional_example.command.ProductProcessor.create]

[main] o.s.t.i.TransactionInterceptor : Getting transaction for [org.springframework.data.jpa.repository.support.SimpleJpaRepository.save]

Hibernate: select product0_.id as id1_1_0_, product0_.name as name2_1_0_, product0_.price as price3_1_0_ from product product0_ where product0_.id=?

[main] o.s.t.i.TransactionInterceptor           : Completing transaction for [org.springframework.data.jpa.repository.support.SimpleJpaRepository.save]

[main] o.s.t.i.TransactionInterceptor: Getting transaction for [com.ep.transactional_example.command.AdditionProcessor.create]

[main] o.s.t.i.TransactionInterceptor: Getting transaction for [org.springframework.data.jpa.repository.support.SimpleJpaRepository.save]

Hibernate: select addition0_.id as id1_0_0_, addition0_.name as name2_0_0_, addition0_.price as price3_0_0_, addition0_.quantity as quantity4_0_0_ from addition addition0_ where addition0_.id=?

[main] o.s.t.i.TransactionInterceptor : Completing transaction for [org.springframework.data.jpa.repository.support.SimpleJpaRepository.save]

[main] o.s.t.i.TransactionInterceptor : Completing transaction for [com.ep.transactional_example.command.AdditionProcessor.create]

[main] o.s.t.i.TransactionInterceptor: Completing transaction for [com.ep.transactional_example.command.ProductProcessor.create]

Hibernate: insert into product (name, price, id) values (?, ?, ?)
Hibernate: insert into addition (name, price, quantity, id) values (?, ?, ?, ?)
```

여기서 확인해야할 것은 `ProductProcessor`와 `AdditionProcessor`의 트랜잭션이 각각 가져와 지고 각각 complete 된 내용입니다. 트랜잭션이 병합은 되었지만 완료는 각각의 시점에서 완료됩니다. 전파의 의미는 트랜잭션이 commit, rollback이 되는 범위를 뜻하는 것이지 트랜잭션이 완전히 하나가 되는 것은 아님을 알 수 있습니다. `ProductProcessor`의 트랜잭션이 가장 처음에 시작이 되어 가장 마지막에 완료가 됩니다.

## Case 5.

```kotlin
@Component
class ProductProcessor(
    private val productRepository: ProductRepository,
    private val additionProcessor: AdditionProcessor
) {
	@Transactional
  fun create(createProduct: CreateProduct) {
      val product = Product(id = createProduct.id, name = createProduct.name, price = createProduct.price)
      productRepository.save(product)
      additionProcessor.createForRequiredExceptionCatch(createProduct.createAdditionList)
  }
}
```

```kotlin
@Component
class AdditionProcessor(
    private val additionRepository: AdditionRepository
) {

	@Transactional(propagation = Propagation.REQUIRED)
  fun create(createAdditionList: List<CreateAddition>) {
      createAdditionList.forEach {
          val addition = Addition(id = it.id, quantity = it.quantity, name = it.name, price = it.price)
          additionRepository.save(addition)
      }
      try {
          throw AdditionException()
      } catch (e: RuntimeException) {
          println("Runtime Catch")
      }
  }
}
```

이번에는 `AdditionProcessor`에서 `additionRepository.save(addition)`는 완료했지만 이후에 `RuntimeException`이 터졌고 try-catch로 에러를 잡아준 모습입니다. 이 역시도 두 Transaction이 정상적으로 완료되며 commit이 됩니다.

```kotlin
[main] o.s.t.i.TransactionInterceptor : Getting transaction for [com.ep.transactional_example.command.ProductProcessor.create]

...

[main] o.s.t.i.TransactionInterceptor: Getting transaction for [com.ep.transactional_example.command.AdditionProcessor.create]

...

[main] o.s.t.i.TransactionInterceptor : Completing transaction for [com.ep.transactional_example.command.AdditionProcessor.create]

[main] o.s.t.i.TransactionInterceptor: Completing transaction for [com.ep.transactional_example.command.ProductProcessor.create]

Hibernate: insert into product (name, price, id) values (?, ?, ?)
Hibernate: insert into addition (name, price, quantity, id) values (?, ?, ?, ?)
```

## Case 6.

```kotlin
@Component
class ProductProcessor(
    private val productRepository: ProductRepository
) {

	@Transactional
  fun createWithChildMethod(createProduct: CreateProduct) {
      val product = Product(id = createProduct.id, name = createProduct.name, price = createProduct.price)
      productRepository.save(product)
      try {
          additionProcessor.create(createProduct.createAddition)
      } catch (e: RuntimeException) {
          println("RuntimeException catch")
      }
  }
}
```

```kotlin
@Component
class AdditionProcessor(
    private val additionRepository: AdditionRepository
) {

fun create(createadditionList: List<CreateAddition>) {
      createadditionList.forEach {
          val addition = Addition(id = it.id, quantity = it.quantity, name = it.name, price = it.price)
          additionRepository.save(addition)
      }
      throw AdditionException()
  }
}
```

이번 코드는 `@Transacitonal`이 붙지 않은 외부 클래스를 호출한 코드입니다. `@Transactional`이 없으면 새로운 트랜잭션이 병합되는 것이 아닙니다. 따라서 이 경우에는 `AdditionProcessor`의 메서드를 호출한 지점에서 try-catch로 예외를 잡아줘도 에러가 발생하지 않습니다.

```kotlin
[main] o.s.t.i.TransactionInterceptor : Getting transaction for [com.ep.transactional_example.command.ProductProcessor.create]

...

RuntimeException catch

[main] o.s.t.i.TransactionInterceptor: Completing transaction for [com.ep.transactional_example.command.ProductProcessor.create]

Hibernate: insert into product (name, price, id) values (?, ?, ?)
Hibernate: insert into addition (name, price, quantity, id) values (?, ?, ?, ?)
```

이전과는 달리 `AdditionProcessor` 의 트랜잭션은 생성되지 않았고 try-catch 로깅(RuntimeException catch)은 발생했습니다. 트랜잭션이 정상적으로 complete 처리가 되어 commit이 되었습니다.

# 왜 롤백이 안되지?



지금까지는 조금 지루했을 수 있습니다. 자 이제 조금 꼬여진 상황을 확인해보겠습니다.

## Case 7.

```kotlin
@Component
class ProductProcessor(
    private val productRepository: ProductRepository,
    private val additionProcessor: AdditionProcessor
) {

		fun create(id: Long, name: String, price: BigDecimal) {
        val product = Product(id = id, name = name, price = price)
        createWithInnerMethod(product)
    }

    @Transactional
    fun createWithInnerMethod(product: Product) {
        productRepository.save(product)
        throw ProductException()
    }
}
```

우리는 외부에서 `createWithInnerMethod()` 를 호출했습니다. 이 메서드는 엔티티를 생성한 뒤 `@Transactional`이 걸려있는 메서드를 호출했습니다. 그런데 내부 메서드인 `createWithInnerMethod`에서 Exception이 발생하고 있네요. 이런 경우는 어떻게 될까요?

결과는 ‘롤백이 되지 않는다는 점입니다.’ 이 이슈를 처음 겪는 사람은 당황할 텐데요. `@Transactional`의 범위는 정해져있으니 그 안에서 터져서 위의 다른 예시와 같이 롤백이 되어야할 거라고 예상했을 것입니다. 하지만 실제로 그렇게 작동하지 않습니다.

이는 `@Transactional`이 스프링의 프록시 방식을 사용한 AOP로 구현이 되었기 입니다. 프록시 패턴은 객체를 상속받아 해당 메서드를 실행하기 전과 후에 미리 정의 된 코드를 먼저 실행시키는 방식으로 구현됩니다. 따라서 target 객체와 메서드가 정의되어있을 때 annotation 정보를 읽고 로직이 추가되는됩니다. 하지만 `@Transactional`이 정의되어 있지 않은 메서드를 target 했을 때, `@Transactional`이 적용되지 않았고 그 안에있는 다른 메서드를 호출할 때, 객체를 상속받아서 진행되는 프록시 패턴이 적용되지 않으므로 AOP가 적용되지 않습니다.

쉽게 말해 처음 진입한 메서드에서 다른 `@Transactional` 메서드를 호출해서 새로운 트랜잭션(전파 속성에 따라 다름)을 만들고 싶을 경우 다른 클래스의 있는 메서드를 호출해야 합니다. 즉 내부 메서드 호출은 `@Transactional`이 적용되지 않습니다.

따라서 위의 예시는 `@Transactional`이 적용되지 않기 때문에 롤백이 되지 않습니다.

다만, `SimpleJpaRepository` 등의 `repositiory.save(entity)`는 내부적으로 `@Transactional`이 구현되어 있어서 해당 내용은 영속화 됩니다. 이 메서드는 외부에서 호출했기 때문에 프록시 패턴이 적용됩니다.

```kotlin
/*
 * (non-Javadoc)
 * @see org.springframework.data.repository.CrudRepository#save(java.lang.Object)
 */
@Transactional
@Override
public <S extends T> S save(S entity) {

	Assert.notNull(entity, "Entity must not be null.");

	if (entityInformation.isNew(entity)) {
		em.persist(entity);
		return entity;
	} else {
		return em.merge(entity);
	}
}
```

실제로 테스트 결과는 아래와 같습니다.

```kotlin
[main] o.s.t.i.TransactionInterceptor : Getting transaction for [org.springframework.data.jpa.repository.support.SimpleJpaRepository.save]

Hibernate: select product0_.id as id1_1_0_, product0_.name as name2_1_0_, product0_.price as price3_1_0_ from product product0_ where product0_.id=?

[main] o.s.t.i.TransactionInterceptor           : Completing transaction for [org.springframework.data.jpa.repository.support.SimpleJpaRepository.save]

Hibernate: insert into product (name, price, id) values (?, ?, ?)
```

`ProductProcessor`의 새로운 트랜잭션은 생성되지 않았고 jpa repository의 트랜잭션만 발생했음을 확인할 수 있습니다.

## Case 8.

한 시름 넘겼습니다. 다음 사례를 보겠습니다.

```kotlin
@Component
class ProductProcessor(
    private val productRepository: ProductRepository,
    private val additionProcessor: AdditionProcessor
) {

	@Transactional
  fun create(createProduct: CreateProduct) {
      val product = Product(id = createProduct.id, name = createProduct.name, price = createProduct.price)
      productRepository.save(product)
      try {
          additionProcessor.create(createProduct.createAdditionList)
      } catch (e: RuntimeException) {
          println("RuntimeException catch")
      }
  }
}
```

```kotlin
@Component
class AdditionProcessor(
    private val additionRepository: AdditionRepository
) {

	@Transactional(propagation = Propagation.REQUIRED)
  fun create(createAdditionList: List<CreateAddition>) {
      createAdditionList.forEach {
          val addition = Addition(id = it.id, quantity = it.quantity, name = it.name, price = it.price)
          additionRepository.save(addition)
      }
      throw AdditionException()
  }
}
```

위의 사례는 `ProductProcessor`의 트랜잭션 메서드에서 `AdditionProcessor`의 `create()`메서드를 호출했습니다. 전파 속성은 `Propagation.REQUIRED` 이므로 두 트랜잭션은 병합이 될 것이고요. 다만 호출된 메서드에서 에러가 `RuntimeException`이 발생했습니다. 하지만 다행이도 호출부에서 이 예외를 예상했는지 try-catch로 잡아두었습니다. 

그런데 이 메서드의 내용은 모두 롤백이 됩니다. 이해가 되지 않습니다. 두 트랜잭션은 분명 병합(merge)가 되어 최초 트랜잭션이 끝날 때 commit 혹은 rollback이 되어야하기 때문입니다.  뿐만 아니라 생소한 Exception이 발생됩니다. 

```
Caused by: org.springframework.transaction.UnexpectedRollbackException: 
    Transaction silently rolled back because it has been marked as rollback-only
```

이미 롤백마크가 되어있는 트랜잭션이어서 예외가 발생한 모양입니다. 사실 전파속성(*propagation*) 때문에 실제 트랜잭션이 재사용되더라도 트랜잭션 메서드의 반환시점마다 트랜잭션의 완료처리(completion)를 합니다. 물론 커밋이나 롤백같은 최종완료처리는 최초 트랜잭션이 반환될 때 일어납니다. 

따라서 호출한 트랜잭션 메서드에서 Exception이 발생했고 해당 트랜잭션이 완료처리가 되면서 기존 트랜잭션을 전역적으로 rollback-only로 마킹할 것인지 설정이 됩니다. 따라서 병합된 트랜잭션은 전역 롤백 처리가 되므로 최초 트랜잭션이 끝날 때 `UnexpectedRollbackException`이 발생하면서 롤백을 하게 됩니다. [자세한 내용은 우아한 형제 블로그 참조](https://techblog.woowahan.com/2606/)

```kotlin
[main] o.s.t.i.TransactionInterceptor : Getting transaction for [com.ep.transactional_example.command.ProductProcessor.create]

...

[main] o.s.t.i.TransactionInterceptor: Getting transaction for [com.ep.transactional_example.command.AdditionProcessor.create]

...

[main] o.s.t.i.TransactionInterceptor : Completing transaction for [com.ep.transactional_example.command.AdditionProcessor.create] after exception: com.ep.transactional_example.exception.AdditionException

RuntimeException catch

[main] o.s.t.i.TransactionInterceptor: Completing transaction for [com.ep.transactional_example.command.ProductProcessor.create]
```

테스트 결과를 보면 AdditionProcessor의 트랜잭션이 먼저 complete 처리가 되었습니다. 이 시점에서 rollback 마크가 global 트랜잭션에 묻었고 그 이후에 try-catch 처리(`RuntimeException catch`)가 되었습니다. 그 이후에 최초의 트랜잭션이 complete 처리가 되었죠. 따라서 `UnexpectedRollbackException` 이 발생하였고 hibernate insert 쿼리가 발생하지 않게 되었습니다.

# 트랜잭션 분리



만약 한 로직안에서 실행되지만 두 가지이상의 트랜잭션으로 나누고 싶을 때는 어떻게 해야할까요? `Propagation.REQUIRES_NEW`를 통해서 이 문제를 해결할 수 있습니다.

## Case 9.

```kotlin
@Component
class ProductProcessor(
    private val productRepository: ProductRepository,
    private val additionProcessor: AdditionProcessor
) {

	@Transactional
  fun create(createProduct: CreateProduct) {
      val product = Product(id = createProduct.id, name = createProduct.name, price = createProduct.price)
      productRepository.save(product)
      try {
          additionProcessor.create(createProduct.createAdditionList)
      } catch (e: RuntimeException) {
          println("RuntimeException catch")
      }
  }
}
```

```kotlin
@Component
class AdditionProcessor(
    private val additionRepository: AdditionRepository
) {

	@Transactional(propagation = Propagation.REQUIRES_NEW)
  fun create(createAdditionList: List<CreateAddition>) {
      createAdditionList.forEach {
          val addition = Addition(id = it.id, quantity = it.quantity, name = it.name, price = it.price)
          additionRepository.save(addition)
      }
      throw AdditionException()
  }
}
```

코드를 보면 마지막에 호출된 곳에서 예외가 발생하고 밖에서는 잡아줬습니다. 이 경우 이전의 `Propagation.REQUIRED` 속성에서는 오류가 난 걸 볼 수 있었습니다. 하지만 `Propagation.REQUIRES_NEW`로 트랜잭션을 분리하면 트랜잭션의 완료 연산이 나뉘게 됩니다. 

위 코드의 경우 에러가 발생하면서 트랜잭션이 완료되었지만 분리되어있는 상황이라 트랜잭션 롤백 마크가 최초 트랜잭션에 묻지 않았습니다. 또한 호출부에서는 try-catch를 잡아주기 때문에 해당 트랜잭션 내에 예외가 발생하지 않았고 Product 관련 Transaction은 commit이 되고 Addtion 코드는 rollback이 되는 트랜잭션 분리를 할 수 있습니다.

```kotlin
[main] o.s.t.i.TransactionInterceptor : Getting transaction for [com.ep.transactional_example.command.ProductProcessor.create]

...

[main] o.s.t.i.TransactionInterceptor: Getting transaction for [com.ep.transactional_example.command.AdditionProcessor.create]

...

[main] o.s.t.i.TransactionInterceptor : Completing transaction for [com.ep.transactional_example.command.AdditionProcessor.create] after exception: com.ep.transactional_example.exception.AdditionException

RuntimeException catch

[main] o.s.t.i.TransactionInterceptor: Completing transaction for [com.ep.transactional_example.command.ProductProcessor.create]

Hibernate: insert into product (name, price, id) values (?, ?, ?)
```

테스트 내용은 Case8과 상당히 유사합니다. 하지만 실제로 product에 대한 쿼리가 발생했습니다. 이는 트랜잭션이 분리가 되어있었기 때문입니다. 

# 트랜잭션과 예외



트랜잭션은 예외를 통해 롤백을 처리하므로 다양한 옵션이 주어진다.

## Case 10.

```kotlin
@Component
class ProductProcessor(
    private val productRepository: ProductRepository,
    private val additionProcessor: AdditionProcessor
) {

	@Transactional
  fun create(createProduct: CreateProduct) {
      val product = Product(id = createProduct.id, name = createProduct.name, price = createProduct.price)
      productRepository.save(product)
      additionProcessor.create(createProduct.createAdditionList)
      throw IOException()
  }
}
```

잘 처리하다가 마지막에 `IOException`이 터져버렸습니다. 그러면 자연스럽게 롤백이 될거라 생각했지만 그렇지 않습니다. `IOException`는 CheckedException이기 때문입니다. CheckedException은 롤백이 되지 않는 대상입니다. 예제에서는 코틀린을 사용하고 있어 checked exception을 thorws하지 않아도 됩니다. 코틀린과 Checked Exception에 대한 자세한 내용은 [해당 포스팅](https://github.com/eastperson/TIL/blob/main/Kotlin/Kotlin%20Checked%20Exception%20%EC%B2%98%EB%A6%AC.md)을 참고하면 됩니다.

```kotlin
[main] o.s.t.i.TransactionInterceptor : Getting transaction for [com.ep.transactional_example.command.ProductProcessor.create]

...

[main] o.s.t.i.TransactionInterceptor: Getting transaction for [com.ep.transactional_example.command.AdditionProcessor.create]

...

[main] o.s.t.i.TransactionInterceptor : Completing transaction for [com.ep.transactional_example.command.AdditionProcessor.create]

[main] o.s.t.i.TransactionInterceptor: Completing transaction for [com.ep.transactional_example.command.ProductProcessor.create] after exception: java.io.IOException

Hibernate: insert into product (name, price, id) values (?, ?, ?)
Hibernate: insert into addition (name, price, quantity, id) values (?, ?, ?, ?)
```

내용을 보면 실제로 exception이 발생하고 로깅이 남았지만 롤백이되지 않습니다. `TransactionAspectSupport.completeTransactionAfterThrowing()` 구현부에서 사용되는 `rollbackOn()` 메서드에서

```kotlin
@Override
public boolean rollbackOn(Throwable ex) {
    return (ex instanceof RuntimeException || ex instanceof Error);
}
```

를 보면 Runtime 에러에만 rollback을 해주는 내용을 확인할 수 있습니다.

## Case 11.

```kotlin
@Component
class ProductProcessor(
    private val productRepository: ProductRepository,
    private val additionProcessor: AdditionProcessor
) {

	@Transactional(rollbackFor = [IOException::class])
  fun create(createProduct: CreateProduct) {
      val product = Product(id = createProduct.id, name = createProduct.name, price = createProduct.price)
      productRepository.save(product)
      additionProcessor.create(createProduct.createAdditionList)
      throw IOException()
  }
}
```

이렇게 CheckedException이 롤백 처리가 되지 않으면 상황상 문제가 발생할 수 있습니다. 따라서 roobackFor라는 속성을 통해 CheckedException을 정의해서 해당 에러가 발생하면 트랜잭션의 모든 내용이 롤백됩니다.

```kotlin
[main] o.s.t.i.TransactionInterceptor : Getting transaction for [com.ep.transactional_example.command.ProductProcessor.create]

...

[main] o.s.t.i.TransactionInterceptor: Getting transaction for [com.ep.transactional_example.command.AdditionProcessor.create]

...

[main] o.s.t.i.TransactionInterceptor : Completing transaction for [com.ep.transactional_example.command.AdditionProcessor.create]

[main] o.s.t.i.TransactionInterceptor: Completing transaction for [com.ep.transactional_example.command.ProductProcessor.create] after exception: java.io.IOException
```

hibernate의 쿼리가 발생하지 않습니다.

## Case 12.

```kotlin
@Component
class ProductProcessor(
    private val productRepository: ProductRepository,
    private val additionProcessor: AdditionProcessor
) {

	@Transactional(noRollbackFor = [ProductException::class])
	fun create(createProduct: CreateProduct) {
	    val product = Product(id = createProduct.id, name = createProduct.name, price = createProduct.price)
	    productRepository.save(product)
	    additionProcessor.create(createProduct.createAdditionList)
	    throw ProductException()
	}
}
```

```kotlin
@Component
class AdditionProcessor(
    private val additionRepository: AdditionRepository
) {

	@Transactional(propagation = Propagation.REQUIRED)
  fun create(createAdditionList: List<CreateAddition>) {
      createAdditionList.forEach {
          val addition = Addition(id = it.id, quantity = it.quantity, name = it.name, price = it.price)
          additionRepository.save(addition)
      }
  }
}
```

반대로 예외가 발생해도 rollback을 하지 않고 commit을 시키는 경우가 있습니다. 이런 경우 `noRollbackFor`로 예외를 설정하면 롤백이 되지 않습니다.

```kotlin
[main] o.s.t.i.TransactionInterceptor : Getting transaction for [com.ep.transactional_example.command.ProductProcessor.create]

...

[main] o.s.t.i.TransactionInterceptor: Getting transaction for [com.ep.transactional_example.command.AdditionProcessor.create]

...

[main] o.s.t.i.TransactionInterceptor : Completing transaction for [com.ep.transactional_example.command.AdditionProcessor.create]

[main] o.s.t.i.TransactionInterceptor: Completing transaction for [com.ep.transactional_example.command.ProductProcessor.create] after exception: com.ep.transactional_example.exception.ProductException

Hibernate: insert into product (name, price, id) values (?, ?, ?)
Hibernate: insert into addition (name, price, quantity, id) values (?, ?, ?, ?)
```

hibernate 쿼리가 발생합니다.

# 얘는 왜 롤백이 되는거야?



## Case 13.

마지막 케이스입니다. 우리는 Case 8의 상황(호출부에서 호출되는 메서드의 예외를 잡을 때 롤백마크가 묻어 예외가 발생)을 생각해서 Case 5(호출되는 메서드에서 예외를 잡는)의 형태로 예외를 잡아내기 위해 아래와 같은 방식으로 작성했습니다.

```kotlin
@Component
class ProductProcessor(
    private val productRepository: ProductRepository,
    private val additionProcessor: AdditionProcessor
) {

	@Transactional
  fun updateName(productId: Long, productName: String, additionId: Long, additionName: String) {
      val product = productRepository.read(productId)
      product.updateName(productName)
      additionProcessor.updateName(additionId, additionName)
  }
}
```

```kotlin
@Component
class AdditionProcessor(
    private val additionRepository: AdditionRepository
) {

	@Transactional(propagation = Propagation.REQUIRES_NEW)
  fun updateName(additionId: Long, additionName: String) {
      try {
          val addition = additionRepository.read(additionId)
          addition.updateName(additionName)
      } catch (e: RuntimeException) {
          println("Runtime Catch")
      }
  }
}
```

호출되는 부분의 모든 구현부를 try-catch로 RuntimeException을 잡았습니다. 또한 `Propagation.REQUIRES_NEW`의 전파 속성이어서 롤백이 되지 않기를 기대했습니다. 그런데 동작중에 `DataIntegrityViolationException` 에러가 발생했습니다. column의 길이보다 긴 문자열이 들어가서 생긴 SQL Exception이었습니다. `AdditionProcessor`에서 try-catch로 잡아주지못한 Exception이 발생했으므로 모든 트랜잭션이 rollback이 되는 상황입니다. 

이는 `@Transactional`의 구현 내용을 보면 됩니다. `@Transactional`을 붙인 메서드는 스프링이 트랜잭션 메니징 코드를 AOP를 통해 둘러쌉니다. 수도(pseudo-code)로 보면 아래와 같습니다.

```kotlin
createTransactionIfNecessary();
try {
    callMethod();
    commitTransactionAfterReturning();
} catch (exception) {
    completeTransactionAfterThrowing();
    throw exception;
}
```

여기서 `callMethod(`)가 우리의 `updateName()`라고 보시면 됩니다. 하지만 실제로 SQL Exception이 발생한 내용은 `callMethod()` 이후겠죠. 결국 `@Transactional`이 달린 메서드 구현부에서 try-catch를 잡아줄 수 없는 상황이 발생합니다. 따라서 호출부에서 이런 상황을 예상하고 `DataIntegrityViolationException` 를 catch해줘야 합니다.

```kotlin
[main] o.s.t.i.TransactionInterceptor: Getting transaction for [com.ep.transactional_example.command.ProductProcessor.updateName]

[main] o.s.t.i.TransactionInterceptor: Getting transaction for [com.ep.transactional_example.command.AdditionProcessor.updateName]

[main] o.s.t.i.TransactionInterceptor           : Completing transaction for [com.ep.transactional_example.command.AdditionProcessor.updateName]
Hibernate: update addition set name=?, price=?, quantity=? where id=?

[main] o.h.engine.jdbc.spi.SqlExceptionHelper: SQL Error: 1406, SQLState: 22001
[main] o.h.engine.jdbc.spi.SqlExceptionHelper: Data truncation: Data too long for column 'name' at row 1
[main] o.h.e.j.b.internal.AbstractBatchImpl: HHH000010: On release of batch it still contained JDBC statements

[main] o.s.t.i.TransactionInterceptor: Completing transaction for [com.ep.transactional_example.command.ProductProcessor.updateName] after exception: org.springframework.dao.DataIntegrityViolationException: could not execute statement; SQL [n/a]; nested exception is org.hibernate.exception.DataException: could not execute statement
```

테스트 결과를 보면 2가지 트랜잭션이 실행되었습니다. 그리고 `AdditionProcessor`의 트랜잭션은 정상적으로 쿼리가 발생했습니다. 하지만 DB를 다녀오면서 `SQLException`이 발생했고 내부 try-catch로 잡아주지 못하는 Exception이 발생했습니다. 또한 이렇게 발생한  `DataIntegrityViolationException`이 호출부로 전파되고 이것을 try-catch하지 못해 롤백이 되었습니다.

# Conclusion

물론 개념을 깊게 알고 언제나 적용하면 좋겠지만, 간혹 이러한 케이스를 한 번에 기억해내기 어려울 때가 있습니다. 이 글에서는 상황별로 `@Transactional`을 어떻게 적용하면 좋을지 간단한 예제를 통해 알아보았습니다. 원리나 혹은 깊은 내용을 찾고 싶으신 분은 제가 참조한 포스팅 글 목록을 보고 공부하시면 좋을 것 같습니다.

# Reference

[Transaction marked as rollback](https://brunch.co.kr/@purpledev/8)

[응? 이게 왜 롤백되는거지? | 우아한형제들 기술블로그](https://techblog.woowahan.com/2606/)

[Spring Transaction 사용 시 주의할 점](https://suhwan.dev/2020/01/16/spring-transaction-common-mistakes/)

[Exception & Transaction rollback 정리](https://ws-pace.tistory.com/m/138)

[[Spring Boot] @Transactional 어노테이션의 롤백 테스트](https://bortfolio.tistory.com/144)

[스프링 테스트 케이스에서의 @Transactional 유의점](https://velog.io/@tmdgh0221/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EC%BC%80%EC%9D%B4%EC%8A%A4%EC%97%90%EC%84%9C%EC%9D%98-Transactional-%EC%9C%A0%EC%9D%98%EC%A0%90)

[[Spring] @Transactional propagation 동작 방식 기초](https://kangwoojin.github.io/programing/transaction-1/)

[](https://www.baeldung.com/spring-transactional-propagation-isolation)

[Should my tests be @Transactional?](https://www.marcobehler.com/2014/06/25/should-my-tests-be-transactional)

[[Spring]@Transactional과 JUnit Test](https://me-analyzingdata.tistory.com/entry/SpringTransactional%EA%B3%BC-JUnit-Test)

[JPA 사용시 테스트 코드에서 @Transactional 주의하기](https://javabom.tistory.com/103)

1. [TransactionalTestExecutionListener](https://docs.spring.io/spring/docs/5.2.4.RELEASE/javadoc-api/org/springframework/test/context/transaction/TransactionalTestExecutionListener.html)
2. [Automatic Rollback of Transactions in Spring Tests](https://relentlesscoding.com/posts/automatic-rollback-of-transactions-in-spring-tests/)

[JPA 사용시 테스트 코드에서 @Transactional 주의하기](https://tecoble.techcourse.co.kr/post/2020-08-31-jpa-transaction-test/)

[SpringBoot - Transaction (트랜잭션)](https://blog.breakingthat.com/2018/04/03/springboot-transaction-%ED%8A%B8%EB%9E%9C%EC%9E%AD%EC%85%98/)
