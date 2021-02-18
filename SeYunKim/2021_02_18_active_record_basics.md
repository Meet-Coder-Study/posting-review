# [RubyOnRails Guides] Active Record Basics

## 💼 서론

- [RubyOnRails Guides Active Record Basics](https://guides.rubyonrails.org/v5.2/active_record_basics.html)  를 참고해 작성한 글입니다.
- Ruby version은 2.6.3을 사용합니다.
- Ruby On Rails version은 5.2.1을 사용합니다.

## 😮 Active Record?

- MVC 패턴 중 M에 해당 되며 Rails에서 제공하는 모듈로 주로 데이터베이스 로직을 제어하는데 있어 사용됩니다.
- Active Record는 ORM(Object Relational Mapping) 문법을 통해 DB를 제어하게 됩니다.

### ORM(Object Relational Mapping)

- 관계형 데이터베이스의 테이블과 Model(Object)를 매핑하는 기술로 SQL문을 직접 작성하지 않고도 DB를 액세스 할 수 있으며, 모델의 속성 및 관계를 DB에 쉽게 저장하고 조회할 수 있습니다.

### ORM의 Active Record 특징

- 모델과 데이터를 나타낸다.
- 모델 간의 연관성을 나타낸다
- 상속 계층을 나타낸다
- 유효성 검사를 제공한다.
- 객체 지향적으로 DB 작업을 수행한다.

## 👮‍♀️ Active Record Configuration의 규칙

### Naming Convention

- 모델은 단수로 DB 테이블을 복수로 작성합니다. 또한 모델은 첫 글자를 대문자로 사용하는 UpperCamelCase를 사용하며 DB의 테이블은 모두 소문자로 사용하면서 각 단어의 사이를 언더바(_)로 하는 snake_cate를 사용한다.
    - ex) Article / articles
    - ex) LineItem / line_items

### Schema Convention

- Foreign keys(외래키)는 [singularized_table_name]_id로 아래의 예시와 같이 작성합니다.
    - order_id
    - article_id
- Primary Keys
    - 기본키는 `id` 라는 이름을 사용하게 됩니다.
- created_at
    - 생성 날짜
- updated_at
    - 수정 날짜
- lock_version
    - 낙관적 잠금
- type
    - 단일 테이블 상속
- (association_name)_type
    - 다형성 객체 이름
- (table_name)_count
    - 연관관계(has_many)에 속한 개체의 수를 캐시하는데 사용

- Tip
    - created_at, updated_at은 Migration 파일 속에 :t.timestemp에 의해 자동으로 생성되게 됩니다.

## 👨‍🎨 Active Record Models 생성

- ApplicationRecord 상속하는 순간 Active Record를 사용할 수 있습니다.

```ruby
class Product < ApplicationRecord
end
```

### Naming Convetion 재정의

- `self.table_name` 로 테이블 이름을 지정할 수 있습니다.

```ruby
class Product < ApplicationRecord
  self.table_name = "my_products"
end
```

- text class도 변경해줘야 합니다.

```ruby
class ProductTest < ActiveSupport::TestCase
  set_fixture_class my_products: Product
  fixtures :my_products
  ...
end
```

- 기본 키도 재정의 할 수 있습니다.

```ruby
class Product < ApplicationRecord
  self.primary_key = "product_id"
end
```

## 📦 CRUD - Create

- `모델명.create()` 를 이용해 모델을 생성할 수 있습니다.

```ruby
user User.create(name: "David", occupation: "Code Artist")
```

- new() 메서드를 사용하면 객체를 인스턴스화 할 수 있습니다.

```ruby
user = User.new
user.name = "David"
user.occupation = "Code Artist"

user.save
```

- save 함수를 이용해 저장할 수 있습니다.

## 👓 CRUD - Read

```ruby
User.all # 모든 User Model을 가져오는 함수
User.first # 첫번째 User Model을 가져오는 함수
User.find_by(name: 'rutgo') #name을 이용해 조회하는 함수
User.where(name: 'rutgo', age: 29).order(created_at: :desc) # SELECT 쿼리에 WHERE 절을 추가하고 created_at을 이용해 정렬하는 함수
```

## 🆙 CRUD - Update

```ruby
@user = User.find_by(name: 'rutgo');
user.name = 'marco'
user.save
```

- 위와 같이 이름의 필드값만 변경하고 다시 save를 하면 수정이 가능합니다.
- 위의 코드를 update 함수로 좀 더 줄일 수도 있습니다.

```ruby
user = User.find_by(name: 'rutgo')
user.update(name: 'marco')
```

- 여러개를 update을 할 경우 update_all 메서드가 유용합니다.

```ruby
User.update_all "max_login_attempts = 3, must_change_password = 'true'"
```

## ⚰️ CRUD - Delete

```ruby
user = User.find_by(name: 'rutgo')
user.destroy
```

- 여러개를 삭제할 경우 destroy_all 메서드가 유용합니다.

```ruby
User.where(name: 'rutgo').destroy_all # 특정 조건에 맞는 User Model 삭제
User.destroy_all # 모든 User Model 삭제
```

## 👨‍⚕️ Validation

- DB에 저장되기 전에 Model의 상태를 확인해 유효성 검사를 할 수 있습니다.

```ruby
class User < ApplicationRecord
  validates :name, presence: true
end
```

- 위와 같이 validates로 validation할 필드와 presence는 빈값을 허용하지 않는다고 생각하면 좋스빈다.
- 따라서 아래와 같이 실행하면 에러가 발생합니다.

```ruby
user = User.new
user.save # return false
user.save! # Exception
```

- save, update 메서드를 실행할 때 validate는 실행되며 실패 성공을 true/false로 구분합니다. 좀 더 엄격하게 Exception을 발생시키고 싶다면 save!, update! 함수를 사용하면 됩니다.
- 자세한 내용은 [Active Record Validations](https://guides.rubyonrails.org/v5.2/active_record_validations.html) 를 참고하세요.

## ✒️ Callback

- Model 내에서 이벤트가 처리 되기 전에 내부적으로 어떤 이벤트 발생 전 또는 후에 검증하는 단계입니다.
- 즉, SQL 트랜잭션 작동 전(before) 및 후(after)에 자유롭게 접근이 가능합니다.
- 자세한 내용은 [Active Record Callback](https://guides.rubyonrails.org/v5.2/active_record_callbacks.html) 을 참고하세요.

## 🎖 Migrations

- Migration이란 데이터베이스에 접근 및 스키마를 관리하는 파일입니다.
- rails g model ~ 을 실행하면 model과 Migration 파일이 생성되는 걸 알 수 있습니다. Migration은 Table의 명세서라고 생각하면 좋습니다. 따라서 Table들의 Column들의 규칙 등을 정의해놓습니다.
- Migration을 하기 위해서는 `rake db:migration`  / `rails db:migration`명령어를 실행하면 됩니다.
- 중간에 에러가 발생하는 경우를 위해 Rollback 기능을 제공합니다.  `rake db:rollback`
- 또한 Migration은 DB(PostgreSQL, MySQL, Orcle) 등에서 모두 적용이 가능하기 때문에 호환성을 걱정할 필요가 없습니다.
- 자세한 내용은 [Active Record Migrations](https://guides.rubyonrails.org/v5.2/active_record_migrations.html) 를 참고해주세요.

## 😇 결론

- Rails는 Active Record로 ORM 기능을 지원합니다.
- 쉽게 DB관련 로직들을 작성할 수 있으며, 기본으로 제공되는 메서드들로 개발자들의 쿼리 생산을 최소화를 해줍니다.
- 또한 정확한 명명규칙을 명시해놓음으로써 개발자들간의 소통을 좀 더 유용하게 해주는것 같기도 합니다.
- 메서드 체이닝을 통해 Query Method가 가능함으로써 좀 더 가독성이 높아지는것 같습니다.
- 또한 Migaration 기능을 통해 Model과 DB Table의 간극을 많이 해결해주며, 개발자는 Model에 대한 지식을 통해 개발할 수 있다는 장점이 있는것 같습니다 😎

## 출처

[Active Record Basics - Ruby on Rails Guides](https://guides.rubyonrails.org/v5.2/active_record_basics.html)
