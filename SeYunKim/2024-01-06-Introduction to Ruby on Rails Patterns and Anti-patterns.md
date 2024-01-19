# [번역] ****Introduction to Ruby on Rails Patterns and Anti-patterns (Ruby On Rails의 패턴과 안티패턴 소개)****

<aside>
💡 원본 글: https://blog.appsignal.com/2020/08/05/introduction-to-ruby-on-rails-patterns-and-anti-patterns.html
</aside>

Ruby On Rails 패턴 및 안티패턴 시리즈의 첫 번째 게시물에 오신 것을 환영합니다. 이 시리즈에서는 Rails 앱을 개발하는 동안 접할 수 있는 모든 종류의 패턴에 대해 자세히 살펴보겠습니다.

오늘 우리는 (디자인) 패턴이 무엇인지 보여주고 안티패턴이 무엇인지 설명하려고 노력할 것 입니다. 설명에 대한 이해를 높이기 위해, 오랜 역사를 가진 Ruby on Rails 프레임워크를 사용하여 설명하겠습니다. 당신이 Rails를 선호하지 않더라도 괜찮습니다. 여기 다루는 아이디어(또는 패턴)들은 다른 기술에서도 유용하게 활용될 수 있습니다.

하지만 패턴과 안티패턴에 대해 설명하기 전에, 왜 먼저 우리가 이런 개념들이 필요한 이유가 무엇일까요? 소프트웨어는 이러한 것이 필요한 이유가 무엇일까요? 우리 솔루션은 왜 디자인(설계)가 필요할까요?

## 맞습니다. 당신은 디자이너입니다.

컴퓨터 프로그래밍 초기부터 사람들은 자신이 작성하는 프로그램의 디자인(설계)를 직접 다루어야 했습니다. 프로그램(또는 소프트웨어)를 작성하고, 디자인(설계)한다는 것은 문제의 해결책을 제시하는 것입니다. 우리가 소프트웨어를 작성하는 동안, 우리는 디자이너입니다. 이를 직위에 자유롭게 추가하세요. 우리가 작성한 소프트웨어는 다른사람들이 읽고 수정할수 있으므로 좋은 해결책으로 디자인(설계)하는것이 중요합니다. 우리가 만들어낸 해결책들은 미래에 또 다른 사람들이 발전시켜 나갈 것입니다.

경험 많은 엔지니어들이 경력을 쌓으면서 코드와 아키텍처에서 유사한 설계 패턴을 반복해서 보게된다. 이를 추출하여 문서화하며 표준 해결책을 만들어 낸다. 이는 인간의 인지 기능이 어떻게 작동하는지 잘 보여주는 예시입니다. 우리는 보는 것에서 [카테고라이징(규칙)](https://en.wikipedia.org/wiki/Principles_of_grouping)과 [패턴을 찾기](https://en.wikipedia.org/wiki/Gestalt_psychology#Pr%C3%A4gnanz)를 좋아하며, 소프트웨어 개발도 예외는 아니다.

우리 인간의 본능인 패턴 찾기는 소프트웨어 엔지니어링이 점점 복잡해짐에 따라 더욱 두드러집니다.책, 글, 강연 등을 통해 잘 고안되고 실전에서 검증된 해결책에 대한 아이디어가 더욱 확산되면서, 소프트웨어 설계는 전 세계 엔지니어들 사이에서 발전하고 자리잡기 시작했습니다. 이러한 해결책은 많은 사람들의 시간과 비용을 절약해주었으므로, 이제 설계 패턴이라는 용어를 살펴 보고 그 본질이 무엇인지 알아보겠습니다.

## 디자인 패턴이란 무엇인가?

소프트웨어 엔지니어링에서 패턴은 공통된 문제를 해결하기 위한 재사용 가능한 해결책을 의미합니다. 패턴은 소프트웨어 엔지니어들 사이에서 일반적으로 좋은 관행으로 여겨집니다. 하지만 패턴은 잘못 적용될 경우 안티패턴이 될수도 있습니다. 안티패턴은 나중에 자세히 알아보겠습니다.

디자인 패턴은 해결책의 방향을 제시하지만, 코드 조각을 제공하지 않습니다. 패턴은 잘 설계된 코드를 작성할 수 있는 가이드이며, 구현까지는 제공하지 않습니다. 일상적인 코딩에서 패턴을 사용하는 것은 1980년대 후반에 등장했으며, Kent Back과 Ward Cunningham이 [‘패턴 언어’](https://c2.com/doc/oopsla87.html)를 사용하는 아이디어를 제시했습니다.

이 패턴 언어의 아이디어는 1970년대 후반 Christopher Alexander의 저서인 [A pattern Language](https://www.goodreads.com/book/show/79766.A_Pattern_Language)에서 처음 등장하였습니다. 놀랍게도 이 책은 소프트웨어 엔지니어링이 아니라 건축에 관한 책입니다. 패턴 언어는 체계적이고 일관성 있는 패턴의 집합이며, 각.패턴은 다양한 방법으로 사용될 수 있는 문제와 해결책의 핵심을 설명합니다. 뭔가 익숙하게 들리지 않나요? (예: 프레임워크, Rails)

이후 소프트웨어 엔지니어링의 디자인 패턴은 1994년 출판된 [Gang Of Four](https://wiki.c2.com/?GangOfFour)의 전설적인 책 [Design Partterns](https://www.goodreads.com/book/show/85009.Design_Patterns)를 통해 대중에게 널리 알려지게 되었습니다. 이 책에는 현재 사용되고 있는 Factory, Singleton, Decorator 등의 패턴에 대한 설명과 정의가 나와 있습니다.

이제 디자인 패턴에 대한 지식을 익히거나 되새겼으니, 안티 패턴이 무엇인지 알아보겠습니다.

## **안티패턴이란 무엇인가?**

만약 패턴을 좋은 용사라고 생각한다면, 안피패턴은 악당이라고 할 수있습니다. 좀 더 정확하게 말하자면, 소프트웨어의 안티패턴은 흔히 사용되지만 비 효율적이나 비 생산적인 패턴을 의미합니다. 안티패턴의 대표적인 예로는 많은 함수와 의존성을 포함하고 있어 다른 객체로 분리할 수 있는 God 객체가 있습니다.

코드에서 안티패턴이 발생하는 경우는 다양합니다. 예를들어 선한 용사(패턴)가 악당(안티패턴)이 되는 경우입니다. 이전 회사에서 특정 기술을 사용해서 높은 수준의 전문성을 쌓았다고 해봅시다. 예를들어 Docker를 사용한다고 가정해보겠습니다. 당신은 Docker 컨테이너에 애플리케이션을 효율적으로 패키징하고, 클라우드에서 오케스트레이션하고, 클라우드에서 로그를 가져오는 방법을 알고 있습니다. 그러나 갑자기 너가 프론트엔드 애플리케이션을 출시해야 하는 새 직장에 취직하게 되었습니다. Docker를 사용하여 앱을 배포하는 방법을 알고 있기 때문에 첫 번째 업무는 모든 것을 패키징해서 클라우드에 배포하는 것입니다.

하지만, 프론트엔드 앱이 그다지 복잡하지 않으며 이를 컨테이너에 넣는 것이 가장 효과적인 해결책이 아닐 수 있습니다. 처음에는 좋은 소시로 들릴수 있지만, 나중에는 비 생산적인 것으로 판명되게 됩니다. 이를 안티패턴에서도 [Golden Hammer(황금 망치)](https://en.wikipedia.org/wiki/Law_of_the_instrument)라고 불립니다.

이는 “망치를 가진 사람에게는 모든 것이 못으로 보인다”라는 속담으로 요약할 수 있습니다. 만약 Docker와 서비스 오케스트레이션에 정말 능숙하다면, 모든 것이 클라우드에서 오케스트레이션이 되도록 만들어진 Docker 서비스가 됩니다.

이런 일은 종종 발생합니다. 선한 용사가 악당으로 변하기도 하고, 그 반대도 마찬가지입니다. 하지만 Ruby와 Rails는 이 그림에서 어떤 위치에 있을까요?

## 먼저 Ruby, 그 다음에 Rails

대부분 사람들은 빠르게 웹 사이트를 구축하기 위해 Ruby On Rails를 사용하여 Ruby를 배우게 됩니다. 저도 같은 방법으로 Ruby를 배우게 되었고, 이는 나쁜게 아닙니다. Rails는 잘 정립된 소프트웨어 패턴인 MVC(Model-View-Controller)를 기반으로 합니다. 하지만 Rails에서 MVC 패턴의 세부사항을 살펴보기 전에 흔히 발생하는 큰 오류는 Ruby를 제대로 배우지 않고 Rails만을 사용하는 것입니다.

Rails 프레임워크는 아이디어가 떠올랐을 때 빠르게 구현하기 위한 최고의 선택 중 하나였습니다. 오늘날 Rails는 여전히 사용되고 있지만 최전성기 만큼의 인기를 유지하지 못하고 있습니다. 사용과 실행이 매우 간단하다는 점 때문에 많은 초보자들이 `rails new` 명령어를 사용하여 웹앱 개발을 시작합니다.  하지만 시간이 지나면 문제가 발생하기 시작합니다. 초보자로서 Rails의 빠르고 간단한 개발 속도에 매료되고 처음에는 모든 것이 마법처럼 원할하게 작동합니다. 하지만 시간이 지나면 ‘마법’에 너무 의존하게 되고 프레임워크 내부에서 어떤 일이 일어나는지 이해하지 못하게 됩니다.

저는 이러한 문제를 직접 겪었고, 많은 초보자와 중급 개발자들이 이로 인해 고통을 받고 있다는 것에 확신합니다. 프레임워크를 사용하여 개발을 시작하고 그 위에 기능을 쌓아 가다가, 고도로 맞춤화된 기능을 추가하려고 할 때, 프레임워크의 마법을 다 써버렸기 때문에 더 이상 진행할 수 없게 되는 경우가 있습니다. 이 시점에서 되돌아가서 기본을 배우는 것은 어려운일이 아닙니다. 누구에게나 일어날 수 있는 일입니다. 하지만 Ruby와 같은 필수적인 사항을 배우지 않고 앞으로 나아가면 문제가 더욱 심각해집니다. 이와 관련하여 추천하는 좋은 책은 [“The Well-Grounded Rubyist”](https://www.goodreads.com/book/show/3892688-the-well-grounded-rubyist) 입니다.

초보자라면 처음부터 끝까지 다 읽을 필요는 없습니다. 하지만 궁금할 때마다 쉽게 참고할 수 있도록 가까이에 두는 것이 좋습니다. 모든 것을 멈추고 책 전체를 읽으라고 하는 것이 아니라, 가끔식 멈추어 Ruby 기본 지식을 되새기는 것이 새로운 지평을 열어줄 수 있습니다

## **MVC: Rails의 빵과 버터**

좋아요 그럼 MVC는 어떤가요? Model-View-Controller 패턴은 오랫동안 사용되어 왔습니다. Python(Djnago), Java(Play, Spring MVC), Ruby(Rails) 등과 같은 다양한 많은 프레임워크에서 채택되었습니다. 이 패턴의 핵심은 각자 고유한 역할을 수행하는 분리된 구성 요소를 같은 것입니다.:

- Model은 데이터와 비지니스 모델을 처리합니다.
- View는 데이터와 사용자 인터페이스를 표현을 담당합니다.
- Controller는 Model에서 데이터를 가져와 View를 사용자에게 보여줌으로써 이 두 가지를 하나로 연결합니다.

이론적으로는 휼륭하게 들리며, 로직이 최소화되고 웹사이트에 복잡한 로직이 없을 때 매우 유용합니다. 하지만 로직이 복잡해지면 문제가 발생하며 까다로워지는 부분이 생기는데 이에 대해서는 곧 다루겠습니다.

MVC는 웹 개발 커뮤니티 전반에 걸쳐 급속도로 퍼져나갔습니다. 요즘 미친듯이 인기 있는 React와 같은 라이브러리 조차도 웹 애플리케이션의 View 계층으로 설명됩니다. 그 어떤 패턴도 대중화되어 떨쳐버릴 수 없는 패턴은 없습니다. Rails는 ActionCable에 [Publish-Subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)를 추가했는데 여기서 [채널의 개념은 MVC 패턴의 컨트롤러로 설명](https://guides.rubyonrails.org/action_cable_overview.html#terminology)이 가능합니다.

그렇다면 이렇게 널리 사용되는 패턴에서 안티패턴은 무엇일까요? MVC 패턴의 각 부부넹 대한 가장 일반적인 안티 패턴을 살펴보겠습니다.

### Model 문제

애플리케이션이 거대해지고 비지니스 로직이 자라날 수록 사람들은 모델에 과하게 채워넣는 경향이 있습니다. 이러한 지속적인 증가는 ‘Fat Model’이라는 안티패턴으로 이어질 수 있습니다.

유명한 ‘Fat Model, Skinny Controller’ 패턴은 일부에서는 선한 용사로 일부에서는 악당으로 여겨집니다. 우리는 뚱뚱함(fat) 자체가 안티패턴이라고 말할 것 입니다. 이해를 돕기 위해 예시를 살펴보겠습니다. Spotify 또는 Deezer와 같은 스트레밍 서비스가 있다고 가정해봅시다. 이 서비스에서는 다음과 같이 노래 모델이 있습니다:

```ruby
class Song < ApplicationRecord
  belongs_to :album
  belongs_to :artist
  belongs_to :publisher

  has_one :text
  has_many :downloads

  validates :artist_id, presence: true
  validates :publisher_id, presence: true

  after_update :alert_artist_followers
  after_update :alert_publisher

  def alert_artist_followers
    return if unreleased?

    artist.followers.each { |follower| follower.notify(self) }
  end

  def alert_publisher
    PublisherMailer.song_email(publisher, self).deliver_now
  end

  def includes_profanities?
    text.scan_for_profanities.any?
  end

  def user_downloaded?(user)
    user.library.has_song?(self)
  end

  def find_published_from_artist_with_albums
    ...
  end

  def find_published_with_albums
    ...
  end

  def to_wav
    ...
  end

  def to_mp3
    ...
  end

  def to_flac
    ...
  end
end
```

이와 같은 모델의 문제점은 노래와 관련된 다양한 로직의 쓰레기장이 된다는 것입니다. 이는 시간이 지남에 따라 메서드가 하나씩 천천히 추가되면서 발생합니다. 그러면 전체 모델이 크고 복잡해 보이므로 로직을 다른 몇 군데로 분할하면 나중에 도움이 될 수 있습니다.

이 모델이 위반하고 있는 몇 가지 권장 사례가 있습니다. 이 모델은 [단일 책임 원칙(SRP)](https://en.wikipedia.org/wiki/Single_responsibility_principle)를 위반하고 있습니다.

팔로우와 게시자에게 알림을 보내는 작업을 다룹니다. 텍스트에서 욕설을 확인하고, 노래를 다른 오디오 형식으로 내보내는 방법 등이 있습니다. 이 모든 것이 모델의 복잡성을 증가시키며, 이 모델의 테스트 파일은 상상조차 할 수 없습니다.

이 모델을 리팩토링하는 방법은 주로 다른 위치에서 메서드를 호출하고 사용하는 방법에 따라 다릅니다. 이러한 문제를 처리하는 몇 가지 일반적인 아이디어를 제시하고 귀하의 경우에 가장 적합한 것을 선택할 수 있습니다.

팔로워와 게시자에게 알리는 콜백은 Job으로 추출될 수 있습니다. Job이 대기열에 추가되고 로직이 모델에서 제외됩니다:

```ruby
class NotifyFollowers < ApplicationJob
  def perform(followers)
    followers.each { |follower| follower.notify }
  end
end

class NotifyPublisher < ApplicationJob
  def perform(publisher, song)
    PublisherMailer.song_email(publisher, self).deliver_now
  end
end
```

Job은 모델과 별개로 별도의 프로세스에서 자체적으로 실행됩니다. 이제 Job 로직을 별도로 테스트하고 모델에서 적절한 Job이 대기열에 추가되었는지 확인할 수 있습니다.

욕설 확인과 사용자가 노래를 다운로드 여부를 확인하는 작업이 모두 앱의 뷰 부분에서 발생한다고 가정 해 보겠습니다. 이 경우 [Decorator 패턴](https://en.wikipedia.org/wiki/Decorator_pattern)을 사용할 수 있습니다. 빠르게 시작할 수 있는 인기있는 해결책은 [Draper gem](https://github.com/drapergem/draper)을 사용하는 것입니다. 이를 사용하여 다음과 유시한 Decorator를 작성할 수 있습니다.

```ruby
class SongDecorator < Draper::Decorator
  delegate_all

  def includes_profanities?
    object.text.scan_for_profanities.any?
  end

  def user_downloaded?(user)
    object.user.library.has_song?(self)
  end
end
```

그 다음에, 컨트롤러에서 `decorate` 를 호출합니다. 예를들면 아래와 같습니다: 

```ruby
def show
  @song = Song.find(params[:id]).decorate
end
```

그리고 다음과 같이 view에서 사용해보세요:

```ruby
<%= @song.includes_profanities? %>
<%= @song.user_downloaded?(user) %>
```

만약 너가 외부 라이브러리에 대한 의존성을 좋아하지 않는다면, 직접 decorator를 만들수도 있습니다. 이 부분은 다른 블로그 게시물에서 다룰 예정입니다. 이제 모델의 대부분의 관심사를 분리했으므로 노래를 찾고 변환하는 메서드를 처리 해보겠습니다. 모듈을 사용하여 이들을 분리할 수 있습니다.

```ruby
module SongFinders
  def find_published_from_artist_with_albums
    ...
  end

  def find_published_with_albums
    ...
  end
end

module SongConverter
  def to_wav
    ...
  end

  def to_mp3
    ...
  end

  def to_flac
    ...
  end
end
```

Song 모델은 `**SongFinders**` 모듈을 확장하므로 해당 메서드를 클래스 메서드로 사용 할 수 있습니다. Song 모델에는 `**SongConverter**` 모듈이 포함되므로 모델 인스턴스에서 해당 메서드를 사용할 수 있습니다.

이 모든 것이 우리의 Song 모델을 매우 날씬하고 완벽하게 만들어 줄 것입니다:

```ruby
class Song < ApplicationRecord
  extend SongFinders
  include SongConverter

  belongs_to :album
  belongs_to :artist
  belongs_to :publisher

  has_one :text
  has_many :downloads

  validates :artist_id, presence: true
  validates :publisher_id, presence: true

  after_update :alert_artist_followers, if: :published?
  after_update :alert_publisher

  def alert_artist_followers
    NotifyFollowers.perform_later(self)
  end

  def alert_publisher
    NotifyPublisher.perform_later(publisher, self)
  end
end
```

더 많은 안티패턴들이 있으며 이는 모델을 통해 얻을 수 있는 것중에 하나의 예시일 뿐이였습니다. 이 시리즈의 다른 블로그 게시물을 계속 지켜봐 주시기 바랍니다. 여기서 더 많은 모델 안티 패턴에 대해서 자세히 설명하겠습니다. 지금은 view에 어떤 문제가 발생할 수 있는지 살펴보겠습니다.

## **View 문제**

모델 문제 외에도 Rails를 사용하는 사람들은 때때로 view의 복잡성으로 어려움을 겪을 수 있습니다. 예전에는 HTML과 CSS가 웹애플리케이션 view 부분에서 왕이였습니다. 시간이 지남에 따라 JavaScript가 지배하게 되었고 프론트엔드의 거의 모든 부분이 JavaScript로 작성되었습니다. Rails는 이와 약간 다른 패러다임을 따릅니다. view에서 모든 것을 JavaScript로 유지하는 대신 JS를 “약간만” 뿌려주는 것입니다.

어쨌든 HTML, CSS, JS, Ruby를 한 곳에 다루는 것은 복잡해 질 수 있습니다. Rails view를 만드는데 어려운 점은 도메인 로직이 때때로 view 내부에서 찾을수 있기 때문입니다. 이는 MVC 패턴을 깨뜨리기 때문에 처음부터 금지된 행위입니다.

또 다른 경우는 view와 부분 템플릿에 너무 많은 임베디드 ruby를 사용하는 것입니다. 일부 로직은 헬퍼나 데코레이터 (view 모델 또는 프리젠터라고 함) 내부에 들어 갈 수 있습니다. 이에 대한 예시는 이 시리즈 다음 게시물에서 다룰 예정이니 계속 주목해주세요.

## **Controller 문제**

Rails 컨트롤러 또한 다양한 문제에 시달릴 수 있습니다. 그 중 하나가 ‘Fat Controller’ 안티 패턴입니다. 

이전에는 모델이 비대해서 체중을 좀 감량했는데, 이제 보니 컨트롤러가 그 과정에서 살이 찐거 같습니다. 보통 이런 현상은 비지니스 로직이 큰트롤러 안에 들어있지만, 원래는 모델이나 다른 곳에 있어야 할때 발생합니다. Fat Model 영역에서 공유된 아이디어 중 일부는 컨트롤러에도 여전히 적용될 수 있습니다. presenter 코드로 추출하고, ActiveRecord 콜백을 사용하고, [서비스 객체](https://blog.appsignal.com/2020/06/17/using-service-objects-in-ruby-on-rails.html)를 사용하는 것입니다.

어떤 사람들은 [Trailblazer](https://github.com/trailblazer/trailblazer)나 [dry-transcation](https://dry-rb.org/gems/dry-transaction/0.15/)과 같은 보석을 사용하기도 합니다. 여기서의 아이디어는 특정 트랜잭션을 처리하는 클래스를 만드는 것입니다. 모든 것을 컨트롤러 밖으로 옮기고 모델을 가볍게 유지하면 이러한 별도의 클래스 안에 로직을 저장하고 테스트할 수 있습니다. 이 클래스를 서비스, 트랜잭션, 액션 등으로 불립니다.

## 결론

더 많은 안티패턴과 이에 대한 해결책이 있습니다. 이 게시물에서 모든 내용을 다루려고 하면 공간과 시간이 너무 많이 걸리고 뚱뚱해 보일것입니다.(우리가 이야기한 모델 및 컨트롤러 처럼) Rails MVC 패턴의 모든 측면을 자세히 알아보는 시리즈를 꼭 시청해보세요. 거기서 가장 유명한 안티패턴을 처리하는 방법을 배우게 됩니다. 그때까지는 패턴과 안티패턴이 무엇인지, 그리고 Ruby On Rails 프레임워크에서 가장 일반적인 패턴에 대한 개요를 재미있게 읽으셨기를 바랍니다.

다음 시간까지, 건배!

PS. Ruby Magic 게시물이 보도되는 대로 읽고 싶으시면 [Ruby Magic 뉴스레터를 구독하시고 단 하나의 게시물도 놓치지 마세요!](https://blog.appsignal.com/ruby-magic)
