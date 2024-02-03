# [번역] **Ruby on Rails Controller Patterns and Anti-patterns**

<aside>
💡 원본글 : https://blog.appsignal.com/2021/04/14/ruby-on-rails-controller-patterns-and-anti-patterns.html

</aside>

Ruby On Rails 패턴 및 안티 패턴 시리즈의 네 번째 편에 오신걸 환영합니다.

이전에 패턴과 안티패턴에 대해 전반적으로 살펴보고 Models과 Views와 관련된 내용을 다뤘습니다. 이번 글에서는 MVC패턴의 마지막 부분인 Controller에 대해 분석해 보겠습니다. Rails Controller와 관련된 패턴과 안티패턴에 대해 자세히 살펴보겠습니다.

## **최전선에서**

Ruby On Rails는 웹 프레임워크이므로 HTTP 요청은 매우 중요한 부분입니다. 모든 종류의 클라이언트는 요청을 통해 Rails 백엔드에 도달하며, 바로 이 지점에서 컨트롤러가 빛을 발합니다. 컨트롤러는 요청을 수신하고 처리하는 최전선에 있습니다. 따라서 컨트롤러는 Ruby On Rails 프레임워크의 기본적인 부분입니다. 물론 컨트롤러보다 먼저 나오는 코드도 있지만 컨트롤러 코드는 우리가 대부분 제어할 수 있는 부분입니다.

일단 “**config/routes.rb**”에서 경로를 지정하고 설정된 경로로 서버를 호출하면 나머지는 해당 컨트롤러가 알아서 처리합니다. 앞의 문장을 읽으면 모든 것이 간단하다는 인상을 받을 수 있습니다. 하지만 실제로는 많은 부분이 컨트롤러의 어깨에 달려 있습니다. 인증 및 권한 부여에 대한 문제가 있고, 필요한 데이터를 가져오는 방법과 비즈니스 로직을 수행하는 위치 및 방법에 대한 문제가 있습니다.

컨트롤러 내부에서 발생할 수 있는 우려와 책임은 몇가지 안티패턴으로 이어질 수 있습니다. 가장 유명한 안티패턴은 뚱뚱한(fat) 컨트롤러 안티패턴 입니다.

## **뚱뚱한(비만) 컨트롤러**

컨트롤러에 너무 많은 로직을 넣을때 생기는 문제점은 단일 책임 원칙(SRP)을 위반하기 시작한다는 것입니다. 이는 컨트롤러 내부에서 너무 많은 작업을 수행한다는 것을 의미하기 때문입니다. 이로 인해 종종 많은 코드와 책임이 쌓이게 됩니다. 여기서 “fat(뚱뚱한)”이라는 의미는 컨트롤러 파일에 포함된 광범위한 코드와 컨트롤러가 지원하는 로직을 의미합니다. 이는 종종 안티패턴으로 간주됩니다.

컨트롤러가 무엇을 해야 하는지에 대해서는 많은 의견이 있습니다. 컨트롤러가 가져야 할 책임의 공통점은 다음과 같습니다.

- **인증 및 권한 부여** — checking whether the entity (oftentimes, a user) behind the request is who it says it is and whether it is allowed to access the resource or perform the action. Often, authentication is saved in the session or the cookie, but the controller should still check whether authentication data is still valid.
- **인증 및 권한 부여** - 요청자와 매핑된 엔티티(보통은 사용자)가 본인인지, 리소스에 액세스하거나 작업을 수행할 수 있는 권한이 있는지 확인합니다. 인증은 세션이나 쿠키에 저장되는 경우가 많지만, 컨트롤러는 인증 데이터가 여전히 유효한지 확인해야 합니다.
- **Data fetching** — it should call the logic for finding the right data based on the parameters that came with the request. In the perfect world, it should be a call to one method that does all the work. The controller should not do the heavy work, it should delegate it further.
- **데이터 불러오기** - 요청과 함께 제공된 매개변수를 기반으로 올바른 데이터를 찾기 위한 로직을 호출해야 합니다. 완벽한 세계에서는 모든 작업을 수행하는 하나의 메서드에 대한 호출이어야 합니다. 컨트롤러는 무거운 작업을 수행해서는 안되며, 더 많은 작업을 위임해야 합니다.
- **템플릿 랜더링** - 마지막으로, 적절한 형식(HTML, JSON 등)으로 결과를 랜더링하여 올바른 응답을 반환해야 합니다. 또는 다른 경로나 URL로 리다이렉션을 해야 합니다.

Following these ideas can save you from having too much going on inside the controller actions and controller in general. Keeping it simple at the controller level will allow you to delegate work to other areas of your application. Delegating responsibilities and testing them one by one will ensure that you are developing your app to be robust.

이러한 생각을 따르면 일반적으로 컨트롤러 액션과 컨트롤러에서 너무 많은 일이 일어나는 것을 방지할 수 있습니다. 컨트롤러 수준에서 단순하게 유지하면 애플리케이션의 다른 영역에 작업을 위임할 수 있습니다. 책임을 위임하고 하나씩 테스트하면 앱을 견고하게 개발할수 있습니다.

물론 위의 원칙을 따를수도 있지만, 몇 가지 예시를 들어보겠습니다. 이제 어떤 패턴을 사용하여 컨트롤러의 부담을 덜어줄 수 있는지 살펴봅시다.

## **Query Objects**

One of the problems that happen inside controller actions is too much querying of data. If you followed our blog post on [Rails Model anti-patterns and patterns](https://blog.appsignal.com/2020/11/18/rails-model-patterns-and-anti-patterns.html), we went through a similar problem where models had too much querying logic. But, this time we'll use a pattern called Query Object. A Query Object is a technique that isolates your complex queries into a single object.

컨트롤러 액션 내부에서 발생하는 문제 중 하나는 데이터에 대한 지나친 쿼리입니다. [Rails Model anti-patterns and patterns](https://blog.appsignal.com/2020/11/18/rails-model-patterns-and-anti-patterns.html)([번역본](https://rutgo-letsgo.tistory.com/entry/%EB%B2%88%EC%97%AD-Ruby-on-Rails-Model-Patterns-and-Anti-patterns-Ruby-On-Rails%EC%9D%98-%EB%AA%A8%EB%8D%B8%EC%9D%98-%ED%8C%A8%ED%84%B4%EA%B3%BC-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4)) 블로그 포스팅을 보셨다면, 모델에 너무 많은 쿼리 로직이 있는 비슷한 문제를 겪은 적이 있습니다. 하지만 이번에는 Query Object 패턴을 사용하겠습니다. Query Object는 복잡한 쿼리를 하나의 객체로 분리하는 기법입니다.

대부분의 경우 쿼리 객체는 “**ActiveRecord**” 관계로 초기화 되는 평범한 루비 객체입니다. 일반적인 쿼리 객체는 다음과 같습니다.

```ruby
# app/queries/all_songs_query.rb

class AllSongsQuery
  def initialize(songs = Song.all)
    @songs = songs
  end

  def call(params, songs = Song.all)
    songs.where(published: true)
         .where(artist_id: params[:artist_id])
         .order(:title)
  end
end
```

컨트롤러 내부에서 사용한다면 다음과 같이 사용할 수 있습니다.

```ruby
class SongsController < ApplicationController
  def index
    @songs = AllSongsQuery.new.call(all_songs_params)
  end

  private

  def all_songs_params
    params.slice(:artist_id)
  end
end
```

You can also try out another approach of the query object:

또한 너는 Query Object를 다른 방식으로 작성해볼수 있습니다.

rb

```ruby
# app/queries/all_songs_query.rb

class AllSongsQuery
  attr_reader :songs

  def initialize(songs = Song.all)
    @songs = songs
  end

  def call(params = {})
    scope = published(songs)
    scope = by_artist_id(scope, params[:artist_id])
    scope = order_by_title(scope)
  end

  private

  def published(scope)
    scope.where(published: true)
  end

  def by_artist_id(scope, artist_id)
    artist_id ? scope.where(artist_id: artist_id) : scope
  end

  def order_by_title(scope)
    scope.order(:title)
  end
end
```

후자의 접근 방식은 매개변수를 선택사항으로 만들어 Query Object를 더 강력하게 만듭니다. 또한 이제 **AllSongQuery.new.call**을 호출할 수 있습니다. 이 방법이 마음에 들지 않는다면 Class Method를 사용할 수 있습니다. Class Method로 작성하면 더 이상 Object는 아니지만, 개인적인 취향 차이일 뿐입니다. 예시를 위해 **makeAllSongsQuery**를 더 간단하게 호출할 수 있는 방법을 살펴보겠습니다.

```ruby
# app/queries/all_songs_query.rb

class AllSongsQuery
  class << self
    def call(params = {}, songs = Song.all)
      scope = published(songs)
      scope = by_artist_id(scope, params[:artist_id])
      scope = order_by_title(scope)
    end

    private

    def published(scope)
      scope.where(published: true)
    end

    def by_artist_id(scope, artist_id)
      artist_id ? scope.where(artist_id: artist_id) : scope
    end

    def order_by_title(scope)
      scope.order(:title)
    end
  end
end
```

이제 “**AllSongsQuery.call**”을 호출하면 완료됩니다. **artist_id**와 함께 매개변수를 전달할 수 있습니다. 또한 어떤 이유로 변경해야 하는 경우 초기 범위를 전달할수도 있습니다. QueryClass를 통해 **new**를 호출하는 것을 정말 피하고 싶다면 이 트릭을 시도해보세요.

```ruby
# app/queries/application_query.rb

class ApplicationQuery
  def self.call(*params)
    new(*params).call
  end
end
```

“**ApplicationQuery**”를 만들어서, 이걸 상속받아서 또 다른 QueryClass를 만들수도 있습니다.

```ruby
# app/queries/all_songs_query.rb
class AllSongsQuery < ApplicationQuery
  ...
end
```

You still kept the **`AllSongsQuery.call`**, but you made it more elegant.

여전히 “**AllSongsQuery.call**”을 유지했지만, 더 우아하게 만들었습니다.

Query Object의 장점은 객체를 개별적으로 테스트하고 객체가 제대로 작동하는지 확인할 수 있다는 것입니다. 또한 이러한 Query Class를 확장하여 컨트롤러의 로직에 대해 크게 걱정하지 않고 테스트를 할 수 있습니다. 한 가지 주의할 점은 요청 매개변수를 Query Object에 의존하지 말고 다른 곳에서 처리해야 한다는 것입니다. 어떻게 생각하시나요? Query Object를 사용해 보시겠어요?

## **Ready To Serve**

지금까지 Query Object로 데이터를 조회하는 작업을 위임하는 방법을 살펴보았습니다. 그렇다면 조회와 랜더링 단계 사이에 쌓여 있는 로직을 어떻게 처리할까요? 잘 물어보셨습니다. 해결책 중 하나는 Service를 사용하는 것입니다. 이 서비스는 종종 단일 (비즈니스) 작업을 수행하는 PORO(Plain Old Ruby Object)로 간주됩니다. 아래에서 이 내용을 조금 더 자세히 살펴보겠습니다.

두개의 서비스가 있다고 가정해봅시다. 하나는 영수증을 생성하고 다른 하나는 영수증을 사용자에게 이렇게 전송합니다.

```ruby
# app/services/create_receipt_service.rb
class CreateReceiptService
  def self.call(total, user_id)
    Receipt.create!(total: total, user_id: user_id)
  end
end

# app/services/send_receipt_service.rb
class SendReceiptService
  def self.call(receipt)
    UserMailer.send_receipt(receipt).deliver_later
  end
end
```

그리고 “**SendReceiptService**”를 아래와 같이 컨트롤러에 사용할 수 있습니다.

```ruby
# app/controllers/receipts_controller.rb

class ReceiptsController < ApplicationController
  def create
    receipt = CreateReceiptService.call(total: receipt_params[:total],
                                        user_id: receipt_params[:user_id])

    SendReceiptService.call(receipt)
  end
end
```

이제 두 개의 서비스가 모든 작업을 수행하고 컨트롤러는 이를 호출하기만 하면 됩니다. 이를 개별적으로 테스트 할 수 있지만 문제는 서비스간의 명확한 연결이 없다는 것입니다. 이론적으로는 모두 하나의 비즈니스 작업을 수행합니다. 하지만 이해관계자의 관점에서 추상화 수준을 고려한다면, 영수증을 생성하는 작업은 영수증을 이메일로 보내는 것과 관련이 있습니다. 누구의 추상화 수준이 옳은가요?

이 사고 실험을 좀 더 복잡하게 만들기 위해 영수증을 생성하는 동안 영수증의 총액을 계산하거나 어딘가에서 가져와야 한다는 요구 사항을 추가해 보겠습니다. 그러면 어떻게 해야 할까요? 총합의 합계를 처리하는 다른 서비스를 작성해야 할까요? 정답은 단일 책임 원칙(SRP)를 따르고 서로 다른 것을 추상화 하는 것입니다.

```ruby
# app/services/create_receipt_service.rb
class CreateReceiptService
  ...
end

# app/services/send_receipt_service.rb
class SendReceiptService
  ...
end

# app/services/calculate_receipt_total_service.rb
class CalculateReceiptTotalService
  ...
end

# app/controllers/receipts_controller.rb
class ReceiptsController < ApplicationController
  def create
    total = CalculateReceiptTotalService.call(user_id: receipts_controller[:user_id])

    receipt = CreateReceiptService.call(total: total,
                                        user_id: receipt_params[:user_id])

    SendReceiptService.call(receipt)
  end
end
```

SRP를 따름으로써 우리는 서비스를 “ReceiptCreation” 프로세스와 같은 더 큰 추상화로 함께 구성할 수 있습니다. 이 class를 만들면 프로세스를 완료하는 데 필요한 모든 작업을 그룹화 할 수 있습니다. 이 아이디어에 대해 어떻게 생각하시나요? 처음에는 너무 추상적으로 들릴 수도 있지만, 이러한 액션을 여기저기서 호출할 때 유용할 수 있습니다. 이 방법이 마음에 드신다면 “[선구자의 작전](https://trailblazer.to/2.1/docs/operation.html)”을 확인해보세요.

요약하자면, 새로운 “**CalculateReceiptTotalService**”는 모든 숫자의 계산을 처리할 수 있습니다. 영수증을 데이터베이스에 기록하는 것은 “**CreateReceiptService**”가 담당합니다. 영수증에 대한 이메일을 사용자에게 발송하는 것은 “**SendReceiptService**”가 담당합니다. 이렇게 작고 집중된 클래스를 사용하면 다른 사용 사례에서 쉽게 결헙할 수 있으므로 유지 관리가 쉽고 코드베이스를 테스트하기 쉬워집니다.

### 서비스 배경 이야기

In the Ruby world, the approach of using service classes is also known as actions, operations, and similar. What these all boil down to is the [Command pattern](https://en.wikipedia.org/wiki/Command_pattern). The idea behind the Command pattern is that an object (or in our example, a class) is encapsulating all the information needed to perform a business action or trigger an event. The information that the caller of the command should know is:

루비 세계에서는 서비스 클래스를 사용하는 접근 방식을 액션, 연산 등으로도 부릅니다. 이 모든 것이 **[Command 패턴](https://en.wikipedia.org/wiki/Command_pattern)**으로 설명됩니다.

- name of the command
- Command의 이름
- Command 객체/클래스에서 호출할 메서드 이름
- 메서드 매개변수로 전달할 값

따라서 이 경우 Command를 호출하는 것은 컨트롤러입니다. 접근 방식은 매우 유사하지만 Ruby의 이름이 서비스라는 점만 다릅니다.

## 작업 분할하기

만약 컨트롤러가 일부 다른 서비스를 호출하고 있는데 해당 서비스가 랜더링을 차단하는 경우 이러한 호출을 추출하여 다른 컨트롤러 액션으로 별도로 랜더링해야 할 수도 있습니다. 예를들어 책 정보를 랜더링 하고 Goodreads와 같이 실제로 제어를 할 수 없는 다른 서비스에서 평점을 가져오려고 할 때를 들수가 있습니다.

```ruby
# app/controllers/books_controller.rb

class BooksController < ApplicationController
  def show
    @book = Book.find(params[:id])

    @rating = GoodreadsRatingService.new(book).call
  end
end
```

Goodreads의 서버가 다운되었거나 이와 유사한 상황으로 장애가 발생하면 사용자는 Goodreads 서버에 대한 요청이 시간 초과될 때까지 기다려야 합니다. 또는 서버에 문제가 있는 경우 페이지가 느리게 로드됩니다. 다음과 같이 타사 서비스 호출을 다른 작업으로 추출할 수 있습니다.

```ruby
# app/controllers/books_controller.rb

class BooksController < ApplicationController
  ...

  def show
    @book = Book.find(params[:id])
  end

  def rating
    @rating = GoodreadsRatingService.new(@book).call

    render partial: 'book_rating'
  end

  ...
end
```

그런 다음 조회수에서 **rating path**를 호출해야 하지만, show 액션에서는 더이상 문제가 될 부분이 없습니다. 또한 “**book_rating**”이라는 partial도 필요합니다. 이 작업을 더 쉽게 수행하려면 [render_async gem](https://github.com/renderedtext/render_async)을 사용할 수 있습니다. 책의 등급을 랜더링하는 위치에 다음 문장만 넣기만 하면 됩니다.

erb

```ruby
<%= render_async book_rating_path %>
```

실제 rating을 랜더링 하기 위한 GTML을 book_rating partial로 추출해 입력합니다.

```ruby
<%= content_for :render_async %>
```

또는, 원하는 경우 Basecamp의 Turbo Frames를 사용할 수 있습니다. 아이디어는 동일히자만 마크업으로 “**[<turbo-frame>](https://turbo.hotwired.dev/handbook/frames#lazily-loading-frames)**”을 다음과 같이 사용하면 됩니다.

```
<turbo-frame id="rating_1" src="/books/1/rating"> </turbo-frame>
```

어떤 선택을 하든, 기본적으로 컨트롤러에서 무겁거나 가벼운 작업을 분리하여 가능한 한 빨리 사용자에게 페이지를 표시하는 것이 중요합니다.

## 마지막 생각

컨트롤러를 다른 메소드의 호출자(callers)로만 생가한다면 이 포스팅을 통해 컨트롤러를 얇게 유지하는 방법에 대한 새로운 관점을 얻을 수 있을 것입니다. 물론 여기서 언급한 몇 가지 패턴과 안티 패턴이 다 가 아닙니다. 더 나은 방법이나 선호하는 방법에 대한 아이디어가 있다면 트워터로 연락해주시면 함께 논의해보겠습니다.

이 시리즈를 계속 지켜봐 주시기 바라며, 앞으로 한 번 더 블로그 포스팅을 통해 공통 Rails 문제와 이번 시리즈에서 얻은 시사점을 정리하겠습니다.

다음 시간까지 화이팅

PS. Ruby Magic 게시물이 보도되는 대로 읽고 싶으시면 [Ruby Magic 뉴스레터를 구독하시고 단 하나의 게시물도 놓치지 마세요!](https://blog.appsignal.com/ruby-magic)
