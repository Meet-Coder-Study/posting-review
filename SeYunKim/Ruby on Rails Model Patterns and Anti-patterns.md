<aside>
💡 원본글 : https://blog.appsignal.com/2020/11/18/rails-model-patterns-and-anti-patterns.html
</aside>

Ruby on Rails 패턴 및 안티패턴 시리즈의 . 두번째 게시물에 오신걸 환영합니다. [지난 블로그 게시글](https://blog.appsignal.com/2020/08/05/introduction-to-ruby-on-rails-patterns-and-anti-patterns.html)([번역본](https://rutgo-letsgo.tistory.com/380))에서 우리는 일반적인 패턴과 안티패턴이 무엇인지 살펴보았습니다. 우리는 또한 Rails 세계에서 가장 유명한 패턴과 안티패턴에 대해서도 언급했습니다. 이 게시글에서는 몇 가지 Rails 모델 안티 패턴과 패턴을 살펴보겠습니다.

만약 모델 문제로 어려움을 겪고 있다면 이 게시글이 도움이 될 것입니다. 모델을 다이어트를 하는 과정을 빠르게 진행하고 마이그레이션 작성 시 피해야 할 몇 가지 사항으로 마무리 하겠습니다. 바로 띄어들어 봅시다.

## **~~지방~~ 과체중 모델**

Rails 웹사이트이든 API이든 Rails 애플리케이션을 개발할 때 사람들은 대부분의 로직을 모델에 저장하는 경향이 있습니다. 지난 블로그 게시물에서 우리는 많은 일을 하는 `Song` 클래스를 예시를 보았습니다. 이 모델과 같이 모델에 많은 일을 하면 그것은 [단일 책임 원칙(SRP)](https://en.wikipedia.org/wiki/Single_responsibility_principle)에 위반하게 됩니다.

한번 살펴봅시다.

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

이 모델에 문제점은 노래와 관련된 다양한 로직의 쓰레기장이 된다는 것입니다. 메소드는 시간이 지남에 따라 하나씩 천천히 추가되면서 쌓이게 됩니다.

나는 모델 내부의 코드를 더 작은 모듈로 분할할 것을 제안했습니다. 하지만 그렇게 하면 단순히 코드를 한 곳에서 다른 곳으로 옮기는 . 것뿐입니다. 그럼에도 불구하고 코드를 이동하면 코드를 더  잘구성하고 가독성이 떨어지는 Fat Modal을 피할 수 있습니다.

일부 사람들은 [Rails의 concerns](https://blog.appsignal.com/2020/09/16/rails-concers-to-concern-or-not-to-concern.html)를 사용하여 모델 전반에 걸쳐 로직을 재사용할 수 있다는 사실을 발견하기도 합니다. 이전에 이 주제에 대해 글을 쓴 적이 있는데, 어떤 사람들은 좋아하기도 하고, 어떤 사람들은 좋아하지 않기도 했습니다. 어쨌든, concerns의 개념은 모듈과 유사하죠. concerns를 사용한다는 것은 코드를 단순히 어디에나 포함시킬 수 있는 모듈로 옮기는 것뿐이라는 점을 인식해야 합니다.

또 다른 대안은 소규모 클래스를 만든 다음에 필요할 때 마다 호출하는 것입니다. 예를 들어 변환 코드를 별도의 클래스로 추출 할 수 있습니다.

```ruby
class SongConverter
  attr_reader :song

  def initialize(song)
    @song = song
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

class Song
  ...

  def converter
    SongConverter.new(self)
  end

  ...
end
```

우리는 이제 다른 포맷의 songs를 다른 형식으로 변환하는 목적을 가진 `Songconverter` 가 있습니다. 변환에 대한 자체 테스트와 향후에 로직을 가질 수 있습니다. 그리고 노래를 MP3로 변환하려면 다음과 같이 할 수 있습니다.

```ruby
@song.converter.to_mp3
```

나아겐 이게 module이나 concern을 사용하는것보다 더 명확해 보입니다. 어쩌면 상속보다 조합을 더 선호하기 때문일수 있습니다. 이것이 더 직관적이고 읽기 쉽다고 생각합니다. 어느 길로 갈 것인지에 결정을 하기 전에 두 가지 사례를 모두 검토해보시길 바랍니다. 또한 원하면 둘다 선택할. 수 있습니다. 아무도 당신을 막을 . 순없습니다.

## **SQL Pasta Parmesan**

실생활에서 맛잇는 파스타를 좋아하지 않는 사람이 있을까요? 반면에 코드 파스타에 관해해서는 이야기가 다릅니다. 거의 아무도 좋아하지 않죠. 그럴 만한 이유가 있습니다. Rails모델에서 ActiveRecord 사용이 스파게티처럼 엉키기 시작하면 코드베이스 전체를 뒤덮을 수 있습니다. 어떻게 이 문제를 피할 수 있을까요?

긴 쿼리가 스파게티처럼 꼬이는 것을 방지하기 위한 몇가지 방법이 있습니다. 먼저 데이터베이스 관련 코드가 어떻게 어디에나 있을 . 수 있는지 살펴보겠습니다. Song 모델로 돌아가봅시다. 특히, 모델에서 데이터를 가져오려고 할때를 생각해보겠습니다.

```ruby
class SongReportService
  def gather_songs_from_artist(artist_id)
    songs = Song.where(status: :published)
                .where(artist_id: artist_id)
                .order(:title)

    ...
  end
end

class SongController < ApplicationController
  def index
    @songs = Song.where(status: :published)
                 .order(:release_date)

    ...
  end
end

class SongRefreshJob < ApplicationJob
  def perform
    songs = Song.where(status: :published)

    ...
  end
end
```

위 예시에서 Song 모델이 쿼리되는 세 가지 사용 사례가 있습니다.  노래에 대한 데이터 보고에 사용되는 SongReporterService에서는 특정 아티스트의 노래를 가져오려고 합니다. 그런 다음에 SongController에서 게시된 노래를 가져와 출시 날짜순으로 정렬합니다. 마지막으로 SongRefreshJob에서는 게시된 노래만 가져와서 Job을 수행합니다.

이 정도면 괜찮지만, 갑자기 상태 이름을 released로 변경하거나 노래를 가져오는 방식을 변경하기로 결정하면 어떻게 될까요? 모든 발생 부분을 개별적으로 수정해야 합니다. 또한 . 위코드는 DRY 원칙을 따르지 않습니다. 애플리케이션 전체에서 코드가 반복되고 있습니다. 실망하지마세요. 다행히 이 문제에 대한 해결책이 있습니다.

Rails의 scope를 사용하여 이 코드를 DRY하게 만들 수 있습니다. scope는 연관 및 객체에서 호출할 수 있는 일반적으로 사용되는 쿼리를 정의할 수 있도록 합니다. 이렇게 하면 코드가 읽기 쉽고 변경하기 쉬워집니다. 하지만, 어쩌면 가장 중요한 점은 scope를 사용하면 joins, where 등과 같은 다른 activeRecord 메서드를 연결할 수 있다는 점입니다. scope를 사용하여 코드가 어떻게 보이는지 살펴보겠습니다.

```ruby
class Song < ApplicationRecord
  ...

  scope :published, ->            { where(published: true) }
  scope :by_artist, ->(artist_id) { where(artist_id: artist_id) }
  scope :sorted_by_title,         { order(:title) }
  scope :sorted_by_release_date,  { order(:release_date) }

  ...
end

class SongReportService
  def gather_songs_from_artist(artist_id)
    songs = Song.published.by_artist(artist_id).sorted_by_title

    ...
  end
end

class SongController < ApplicationController
  def index
    @songs = Song.published.sorted_by_release_date

    ...
  end
end

class SongRefreshJob < ApplicationJob
  def perform
    songs = Song.published

    ...
  end
end
```

위와 같이 할수 있습니다. 반복되는 코드를 잘라내서 모델에 넣을 수 있었습니다. 하지만 이것이 항상 최선의 결과를 가져오는 것은 아닙니다. 특히 [God 객체](https://en.wikipedia.org/wiki/God_object)나 Fat Model이라고 진단받은 경우에는 더욱 그렇습니다. 모델에 점점 더 많은 메서드와 책임을 추가하는 것은 좋은 생각이 아닐 수 있습니다.

제 조언은 범위 사용을 최소한으로 유지하고 거기에 일반적인 쿼리만 추출하는 것입니다. 우리의 경, **where(published: true)**는 어디에서나 사용되기 때문에 완벽한 scope가 될 수 있습니다. 다른 SQL 관련 코드의 경우 Repository 패턴을 사용할 수 있습니다. 그게 무엇인지 알아보겠습니다.

## **Repository Pattern**

이번에 우리가 보여드릴 것은 [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design) 책에 정의된 1:1 Repository 패턴입니다. Rails Repository 패턴의 기본적인 정의는 데이터베이스 논리와 비즈니스 논리를 분리하는 것입니다. 또한 Active Record 대신 원시 SQL 호출을 수행하는 리포지토리 클래스를 생성하는 방법도 있지만, 정말 필요하지 않은 한 이러한 방법은 권장하지 않습니다.

우리가 할수 있는 일은 SongRepository를 만들고 거기에 데이터베이스 로직을 넣는것입니다.

```ruby
class SongRepository
  class << self
    def find(id)
      Song.find(id)
    rescue ActiveRecord::RecordNotFound => e
      raise RecordNotFoundError, e
    end

    def destroy(id)
      find(id).destroy
    end

    def recently_published_by_artist(artist_id)
      Song.where(published: true)
          .where(artist_id: artist_id)
          .order(:release_date)
    end
  end
end

class SongReportService
  def gather_songs_from_artist(artist_id)
    songs = SongRepository.recently_published_by_artist(artist_id)

    ...
  end
end

class SongController < ApplicationController
  def destroy
    ...

    SongRepository.destroy(params[:id])

    ...
  end
end
```

우리가 여기서 한 일은 쿼리 로직을 테스트 가능한 클래스로 분리한것 입니다. 또한, 모델은 더 이상 scope와 로직과 관련이 없습니다. 컨틀롤러와 모델이 얇아서 모두가 만족합니다. 올바른것처럼 보이나요?? 글쎄요. 여전히 ActiveRecord가 모든 무거운 작업을 수행하고 있습니다. 우리의 시나리오는 **find**를 사용해서 다음을 생성하는 것입니다.

```sql
SELECT "songs".* FROM "songs" WHERE "songs"."id" = $1 LIMIT $2  [["id", 1], ["LIMIT", 1]]
```

최신의 방법은 이 모든 것을 SongRepository 내부에 정의하는 것입니다. 앞서 말했듯이 저는 이 방법을 권장하지 않습니다. 굳이 필요하지 않고, 모든 권한을 갖고 싶어하기 때문입니다. ActiveRecord 대신 raw SQL을 사용해야 하는 경우는 ActiveRecord에서 쉽게 지원하지 않는 복잡한 SQL 트릭이 필요한 경우일 뿐입니다.

raw SQL과 ActiveRecord에 대해서 이야기를 하다 보니 한 가지 더 언급해야 할 주제가 있습니다. 바로 마이그레이션과 그것을 올바르게 수행하는 방법이다. 이제 자세히 알아보겠습니다.

## **Migrations — 누가 신경쓰나요?**

마이그레이션을 작성할 때 종종 듣는 말이 ‘마이그레이션 코드는 나머지 애플리케이션 코드만큼 훌륭할 필요가 없다.’는 이야기 입니다. 저는 이 주장에 전혀 공감하지 못합니다. 사람들은 마이그레이션은 ‘한 번만 실행되고 잊혀지는 것’이라는 변명으로 냄새 나는 코드를 쉽게 넣어버립니다.

현실은 다른 경우가 많습니다. 애플리케이션은 더 많은 사람들이 작업할 수 있으며, 그들은 애플리케이션 내 다른 부분들과의 상호 작용에 대해 잘 모를 수 있습니다. 엉터리 일회성 코드를 마이그레이션에 삽입하면 데이터베이스 상태가 손상되거나 이상한 마이그레이션으로 인해 누군가의 개발 환경을 몇 시간 동안 망칠 수도 있습니다. 이것이 안티패턴인지는 확실하지는 않지만, 반드시 유념해야 하는 사항입니다.

다른 사람들이 마이그레이션을 쉽게 사용할 수 있도록 하려면 어떻게 해야 할까요? 프로젝트 참여자 모두에게 마이그레이션을 더 쉽게 만드는 팁 목록을 살펴보겠습니다.

### 항상 Down 메서드를 제공해야 합니다.

언제 어떤것이 롤백될지 알수가 없습니다. 마이그레이션을 되돌릴수 없는 경우 `ActiveRecord::IrreversibleMigration` 예외를 발생시키세요:

```ruby
def down
  raise ActiveRecord::IrreversibleMigration
end
```

### **마이그레이션에서 ActiveRecord를 피하세요.**

마이그레이션을 실행해야 하는 시점의 데이터베이스 상태를 제외한 외부 종속성을 최소화 해야 합니다. 따라서 ActiveRecord validation이 없어서 상황을 망칠(또는 어쩌면 구해줄) 수도 없습니다. 순수한 SQL만 남았습니다. 예를 들어, 특정 아티스트의 모든 노래를 게시하는 마이그레이션을 작성해 보겠습니다.

```ruby
class UpdateArtistsSongsToPublished < ActiveRecord::Migration[6.0]
  def up
    execute <<-SQL
      UPDATE songs
      SET published = true
      WHERE artist_id = 46
    SQL
  end

  def down
    execute <<-SQL
      UPDATE songs
      SET published = false
      WHERE artist_id = 46
    SQL
  end
end
```

만약 Song 모델이 필요한 경우 마이그레이션 내부에서 모델을 정의하는 것이 좋습니다. 이렇게 하면 애플리케이션의 `app/models` 에 있는 실제 ActiveRecord 모델이 변경되어도 마이그레이션을 보호할 수 있습니다. 하지만 이것이 완벽한 해결책이라고 할 수 있을까요? 다음 주제로 넘어갑시다.

### **데이터마이그레이션과 스키마 마이그레이션을 분리해라.**

[마이그레이션에 대한 Rails 가이드](https://edgeguides.rubyonrails.org/active_record_migrations.html)를 살펴보면 다음 내용을 읽을 수 있습니다.

> 마이그레이션은 Active Record의 기능으로, 시간이 지남에 따라 데이터베이스 스키마를 발전시킬 수 있습니다. raw SQL로 스키마 수정을 작성하는 대신, 마이그레이션을 사용하면 Ruby DSL을 사용하여 테이블 변경 사항을 기술할 수 있습니다.
> 

가이드의 요약 내용에 데이터베이스 테이블의 실제 데이터를 편집하는 것에 대한 언급은 없고, 오직 구조에 대해서만 언급만 있습니다. 따라서 두 번째 포인트에서 song을 업데이트하기 위해 일반 마이그레이션을 사용한 것은 완전히 올바른 방법은 아닙니다. 프로젝트에서 정기적으로 이와 유사한 작업을 해야 하는 경우 `[data_migrate gem](https://github.com/ilyakatz/data-migrate)` 을 사용하는 것을 고려해보세요. 데이터 마이그레이션과 스키마 마이그레이션을 분리하는 좋은 방법입니다. 이 gem을 사용하면 이전 예제를 쉽게 작성할 수 있습니다. 데이터 마이그레이션을 생성하려면 다음과 같이 수행할 수 있습니다.

```bash
bin/rails generate data_migration update_artists_songs_to_published
```

그리고 다음으로 마이그레이션 로직을 추가합니다: 

```ruby
class UpdateArtistsSongsToPublished < ActiveRecord::Migration[7.0]
  def up
    execute <<-SQL
      UPDATE songs
      SET published = true
      WHERE artist_id = 46
    SQL
  end

  def down
    execute <<-SQL
      UPDATE songs
      SET published = false
      WHERE artist_id = 46
    SQL
  end
end
```

이렇게 하면 `db/migrate` 디렉터리 내부의 모든 스키마 마이그레이션과 `db/data` 에선 데이터를 처리하는 마이그레이션이 유지되니다.

## 마지막 생각

Rails에서 모델을 다루고 읽기 쉽게 유지하는 것은 끊임없는 도전입니다. 이 블로그 글에서 흔히 발생하는 문제에 대한 함정과 해결책을 살펴보셨길 바랍니다. 이 글에서 모델 반 패턴과 패턴 목록은 완벽하지 않습니다만, 최근에 발견한 가장 주목할 만한 것들을 소개했습니다.

더 많은 Rails 패턴과 반 패턴에 관심이 있다면 시리즈의 다음 에피소드를 기대해 주세요. 다가오는 글에서는 Rails MVC의 뷰 및 컨트롤러 부분에서 발생하는 일반적인 문제와 해결책을 살펴보겠습니다.

다음 시간까지, 건배!

PS. Ruby Magic 게시물이 보도되는 대로 읽고 싶으시면 [Ruby Magic 뉴스레터를 구독하시고 단 하나의 게시물도 놓치지 마세요!](https://blog.appsignal.com/ruby-magic)
