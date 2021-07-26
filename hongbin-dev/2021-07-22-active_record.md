최근 Ruby on rails를 다루다보니 기본으로 지원해주는 ActiveRecord에 관심이 생겼다.
기존에 사용중인 Spring Data JPA와 어떤 차이가 있을지 생각해봤다.

많은 언어가 ORM을 지원하지만, 각각의 특징들이 있는 것 같다. 가장 크게 갈리는 것은 ActiveRecord 패턴과 Datamapper 패턴이다. 루비온레일즈의 ORM ActiveRecord 프레임워크는 이름처럼 activerecord 패턴을 따른다. 또 Spring Data 진영에서 사용하고 있는 프레임워크는 Repository를 둬 데이터컨트롤과 엔티티와 분리시켰다. 이를 Datamapper패턴이라고 부른다.

ActiveRecord, Datamapper 패턴을 비교한 게 아닌 Spring Data JPA와 Rails ActiveRecord를 비교해보려고 한다.


## Rails ActiveRecord의 특징
####  액티브레코드는 모델(엔티티)에서 데이터할 수 있다(CRUD)

```ruby
class User < ActiveRecord::Base

  def change_password()
    # ...
  end

end


user = User.new("allen", "010....")
user.save
```

- 단일책임원칙이 위반된다고 생각한다. 모델이 데이터 컨트롤/비즈니스 로직을 모두 담당하고 있다.
- 자연스레 모델클래스는 PORO(POJO)가 아니게 된다. 여기서 테스트가 어려워진다.

만약 User class의 `change_password()`라는 메서드를 단위 테스트하려면, 미리 user 인스턴스를 만들어야한다. user 인스턴스를 만들려면 자연스레 데이터베이스 연결을 해야한다.
물론 여기서 데이터베이스를 Mock, stub, end-point 변경 등을 시도해볼 수 있지만 changePaword()를 테스트하는데, 데이터베이스를 왜 신경 써야 할까?


#### 테이블과 모델의 1:1매핑이 된다.
테이블과 모델의 1:1매핑이 된다는 것은, 데이터베이스의 컬럼이 추가되어 있으면 RoR는 런타임에 그 필드가 있는 것처럼 인식한다.

```sql
create table users (
    id int,
    name varchar(255),
    phone varchar(255)
);
```

```ruby
class User < ActiveRecord::Base
# 필드가 없어도 된다.
end

u = User.create(name: "allen", phone: "010xxxxx")
u.save

u = User.last # id기준으로 마지막에 저장된 엔티티를 찾는다.
puts u.name
# allen
puts u.phone
# 010xxxxx
```

RoR런타임에 데이터베이스 컬럼들을 스캔한다. 해당 컬럼들을 스캔하여 필드들의 getter, setter 등의 편의메서드들이 모두 열리게 된다. 그 코드조차 DRY(Don't Repeat Yourself) 철학의 영향을 미친 것 같다. 

```ruby
u = User.last
puts u.name # getter와 비슷하다

u.phone = "01011111" # setter와 비슷하다
```

**장점**
- 편하다. 컬럼을 추가하면 자동으로 메서드가 생기고, find_by_name 등의 편의 메서드도 모두 생긴다.
- 편함으로써의 빠른 개발이 가능해진다.

**단점**
- 데이터베이스와 애플리케이션이 1:1로 매핑되니 자연스레 인프라 침투적인 프로그래밍을 하게 된다.
- 비즈니스 중심적이 아닌 데이터 중심적인 프로그래밍을 하게 만든다. 
- JPA는 엔티티의 필드를 은닉할 수 있지만(필드나 메서드를 private로 둔다든지), 레일즈에서는 필드의 Getter Setter가 기본적으로 열리니 어느 곳에서도 꺼낼 수도, 수정할 수 있게 되어 데이터의 변경추적이 어려워질 수 있다.
- 코드 추적이 어렵다. 코드레벨에서 어떤 필드들을 가졌는지 모르기 때문이다.

---

글을 쓰다 보니 ActiveRecord의 단점이 많이보이지만, 작은규모의 서비스에서는 빠르고 심플하게 사용할 수 있는 장점이 있다. 

주관적인 내용이 들어갔다고 생각하는데, 아래글을 참고해서 보면 좋을 듯 하다.
- [https://www.mehdi-khalili.com/orm-anti-patterns-part-1-active-record](https://www.mehdi-khalili.com/orm-anti-patterns-part-1-active-record)
- [https://brunch.co.kr/@elijah17/1](https://brunch.co.kr/@elijah17/1)
- [https://martinfowler.com/eaaCatalog/repository.html](https://martinfowler.com/eaaCatalog/repository.html)