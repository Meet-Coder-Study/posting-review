# [번역] **General Ruby on Rails Problems and Takeaways(일반적인 Ruby On Rails 문제 및 해결방법)**

<aside>
💡 원본 글 : https://blog.appsignal.com/2021/07/07/general-ruby-on-rails-problems-and-takeaways.html

</aside>

Ruby On Rails 패턴 및 안티 패턴 시리즈 마지막 파트에 오신 것을 환영합니다. 이 모든 주제를 리서치하고 작성하는 것은 꽤나 즐거운 일이였습니다. 이 블로그 게시물에서는 수년 동안 Ruby On Rails 애플리케이션을 빌드하고 출시 할 때 겪었던 가장 일반적인 문제들을 살펴볼 것입니다.

여기서 살펴볼 생각들은 코드의 거의 모든 곳에 적용됩니다. 따라서 MVC 패턴과 관련된 것이 아니라 일반적인 생각들로 봐주시면 좋겠습니다. Rails MVC와 관련된 패턴 및 안티 패턴에 관심이 있다면 [Model](https://blog.appsignal.com/2020/11/18/rails-model-patterns-and-anti-patterns.html)([번역](https://rutgo-letsgo.tistory.com/entry/%EB%B2%88%EC%97%AD-Ruby-on-Rails-Model-Patterns-and-Anti-patterns-Ruby-On-Rails%EC%9D%98-%EB%AA%A8%EB%8D%B8%EC%9D%98-%ED%8C%A8%ED%84%B4%EA%B3%BC-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4)), [View](https://blog.appsignal.com/2021/02/10/ruby-on-rails-view-patterns-and-anti-patterns.html)([번역](https://rutgo-letsgo.tistory.com/entry/%EB%B2%88%EC%97%AD-Ruby-on-Rails-View-Patterns-and-Anti-patterns)), [Controller](https://blog.appsignal.com/2021/04/14/ruby-on-rails-controller-patterns-and-anti-patterns.html)([번역](https://rutgo-letsgo.tistory.com/entry/%EB%B2%88%EC%97%AD-Ruby-on-Rails-Controller-Patterns-and-Anti-patterns)) 블로그 포스팅을 확인해보세요.

그럼 이제 일반적인 문제와 해결방법을 살펴보겠습니다.

# 이기적인 객체와 디미터의 법칙

**[디미터의 법칙](https://en.wikipedia.org/wiki/Law_of_Demeter)**은 디미터 프로젝트에서 여러 사람들이 함께 작업하면서 그 이름을 얻은 휴리스틱 입니다. 이 법칙은 객체가 한번에 하나의 메서드만 호출하고 여러 메서드의 호출을 연쇄적으로 하지 않는것이 좋다는 것입니다. 이것이 실제로 의미하는 바는 다음과 같습니다.

```ruby
# Bad
song.label.address

# Good
song.label_address

```

이제 **song** 객체는 더 이상 **address**가 어디서 가지고 있는지 알 필요가 없습니다. **address**는 **label** 객체의 책임입니다. 메서드 호출을 한 번만 하고, 객체를 이기적으로 만들어 전체 정보를 공유하지 않고 **helper** 메서드를 통해 공유하도록 하는 것이 좋습니다.

Rails에서는 helper 메서드 자체를 작성할 필요가 없이 **delegate** 헬퍼를 사용할수 있습니다.

```ruby
def Label < ApplicationModel
  belongs_to :song

  delegate :address, to: :song
end
```

**delegate**가 가능한 옵션은 [문서](https://apidock.com/rails/Module/delegate)에서 확인해볼수 있습니다. 하지만 관련한 내용과 실행은 매우 간단합니다. 디미터의 법칙을 적용하면 구조적 결합을 줄일 수 있습니다. 강력한 **delegate**와 함께 사용하면 더 적은 줄로, 더 많은 옵션이 포함된 상태로 이 작업을 수행할 수 있습니다.

디미터의 법칙과 매우 유시한 또 다른 아이디어는 [단일책임원칙(SRP)](https://en.wikipedia.org/wiki/Single-responsibility_principle)입니다. 이 원칙은 모듈, 클래스 또는 메서드가 시스템 한 부분을 책임져야 한다는 것입니다. 아래와 같은 말로 표현합니다.

> 같은 이유로 변경되는 항목을 한군데로 모읍니다. 다른 이유로 변경되는 항목은 분리합니다.
> 

사람들은 종종 SRP에 대해 서로 다른 이해를 가질수 있지만, 이것은 블록이 한 가지 일을 담당하도록 하는 것입니다. Rails 앱이 확장됨에 따라 SRP를 달성하는 것이 어려울 수 있지만, 리팩토링 할 때 이를 염두해 두세요.

기능을 추가하고 LOC를 늘릴 때 사람들은 종종 빠른 해결책을 찾는 다는 것을 알게 되었습니다. 그럼 빠른 해결 방법을 살펴보겠습니다.

> LOC란?

LOC는 **Lines of Code**의 약자로, 코드의 길이나 복잡도를 나타내는 지표 중 하나입니다. LOC가 많으면 코드가 더 복잡하고 유지보수하기 어려울 수 있습니다.
> 

# 내가 아는 남자 (Ruby Gem이 필요하신 가요?)

Rails가 화제가 되던 시절에는 오픈소스 협업이 붐을 이루면서 새로운 Ruby Gem이 곳곳에서 등장했습니다.(요즘은 모든 새로운 JavaScript 라이브러리가 등장하는 것과 마찬가지 입니다. 그러나 그 규모는 훨씬 작지만요.)

https://blog.appsignal.com/_next/image?url=%2Fimages%2Fblog%2F2021-07%2Fnpm-vs-rubygems.png&w=1920&q=75

👆 **[모듈 갯수](http://www.modulecounts.com/)**의 정보

어쨋든, 일반적인 접근 방식은 문제를 해결 할 수 있는 Gem을 찾는 것이였습니다.

이 방법이 잘못된 것은 아니지만, Gem을 설치하기로 결정하기 전에 몇 가지 조언을 드릴려고 합니다.

먼저 스스로에게 아래와 같은 질문을 해보세요.

- Gem의 기능 중 어떤 부분을 사용하려고 하시나요?
- 더 ‘단순’하거나 더 최신의 유사한 Gem이 있나요?
- 필요한 기능을 쉽고 확실하게 구현할 수 있나요?

Gem의 모든 기능을 사용할 계획이 아니라면 구현할 가치가 있는지도 평가해보세요. 또는 Gem의 구현이 너무 복잡해서 더 간단하게 구현할 수 있다고 생각되면 그걸로 선택하는 것도 좋습니다.

제가 고려하는 또 다른 요소는 해당 Gem 저장소가 얼마나 활성화되어 있는지, 즉 활동중인 메인테이너가 있는지? 마지막으로 릴리즈가 이루어진 시기는 언제인지? 확인해보세요.

또한 Gem의 종속성도 주의해야 합니다. 특정 버전의 종속성에 종속되는 것을 원치 않는다면 항상 “Gemfile.spec” 파일을 확인하시길 바랍니다. 루비 [Gem의 버전 지정 방법 문서](https://guides.rubygems.org/patterns/#pessimistic-version-constraint)를 확인해보세요.

Gem에 대해 이야기 하는 동안 제가 접한 관련된 부분이 있는데, 바로 Rails/Ruby 세계에 적용되는 ‘Not Invented Here’(NIH) 현상입니다. 다음 세션에서 그 내용을 살펴보겠습니다.

# 세상에 없던 발명품(결국 루비 보석이 필요한것일까요?)

직장 생활을 하면서 저를 포함한 많은 사람들이 “여기서 발명되지 않았다.” 신드롬에 빠지는 것을 몇 차례 경험한 적이 있습니다. 이 신드롬은 “바퀴를 재발명하지 않는다”와 비슷한 개념입니다. 때때로 팀과 조직은 자신이 통제할 수 없는 라이브러리(Gem)을 신뢰하지 않습니다. 신뢰의 부족은 이미 나와 있는 Gem을 재창조하는 계기가 될 수 있습니다.

때때로 NIH를 경험하는 것이 좋은 일이 될 수도 있습니다. 특히 시중에 나와 있는 다른 해결책보다 개선한다면 사내 해결책을 만드는 것이 좋을 수 있습니다. 해결책을 오픈소스화하기로 해결했다면 더욱 좋을 수 있습니다. (Ruby On Rails, React를 살펴보세요.) 하지만 이를 위해 바퀴를 재발명하고 싶다면 그렇게 하지 마세요. 바퀴 자체는 이미 꽤 휼륭합니다.

이 주제는 상당히 까다로운 주제이므로 이런 상황에 처하게 된다면 다음과 같은 질문을 스스로에게 해보세요.

- 기존 해결책보다 더 나은 해결책을 만들수 있다고 확신하는가?
- 만약 기존 오픈소스 해결책이 우리에게 필요한 것과 다르다면 오픈소스에 기여하여 개선할 수 있는가?
- 더 나아가 오픈소스 해결책의 메인테이너가 되어 많은 개발자들의 삶을 개선할 수 있을까요?

하지만 때때로 자신만의 방식으로 직접 라이브러리를 만들어야 할 때도 있습니다. 조직에서 오픈소스 라이브러리에 라이선스를 구매하는 것을 좋아하지 않아 직접 라이브러리를 구축해야 할 수도 있습니다. 하지만 어떤 경우든 기존의 것을 재창조하는 것은 피해야 합니다.

# 근무중인 인명구조원(과한 rescue exception)

사람들은 원래 목표했던 것보다 더 많은 예외를 rescue를 하는 경향이 있습니다.

이 주제는 앞의 주제보다 운영원칙과 더 관련이 있습니다. 일부 사람들에게 상식적인 내용일 수 있지만, 코드에서 가끔 볼수 있는 부분입니다.

```ruby
begin
  song.upload_lyrics
rescue
  puts 'Lyrics upload failed'
end
```

이 경우 **song** 객체가 **nil**이라는 문제가 있을수도 있습니다. 이 예외가 에러 트래커에 보고되면 업로드 프로세스가 문제가 있다고 생각할 수 있지만, 실제로는 완전히 다른 문제가 발생할 수 있습니다.

따라서 안전하게 예외를 rescue를 할때는 발생할 수 있는 모든 예외의 목록을 확보해야 합니다. 어떤 이유로는 모든 예외를 rescue를 할수 없는 경우엔 과도하게 rescue하는것 보다 적게 하는 것이 좋습니다. 알고 있는 예외부터 rescue하고 나머지 예외는 나중에 처리하세요.

# 너무 많은것을 묻습니다.(너무 많은 SQL 쿼리)

이 세션에서는 또 다른 웹 개발 문제인 관계형 데이터베이스 문제를 살펴보겠습니다.

한번의 요청에 너무 많은 SQL 쿼리로 웹 서버를 폭격하는 경우입니다. 어떻게 이런 문제가 발생할까요? 하나의 요청으로 여러 테이블에서 여러 레코드를 가져오려고 할 때 발생할 수 있습니다. 하지만 가장 자주 발생하는 것은 악명 높은 N+1 쿼리 문제입니다.

다음 모델을 상상해보세요.

```ruby
class Song < ApplicationRecord
  belongs_to :artist
end

class Artist < ApplicationRecord
  has_many :songs
end
```

한 장르의 노래 몇 곡과 해당 아티스트를 보여주고 싶은 경우:

```ruby
songs = Song.where(genre: genre).limit(10)

songs.each do |song|
  puts "#{song.title} by #{song.artist.name}"
end
```

이 코드 조각은 10곡을 가져오기 위해 하나의 SQL 쿼리를 트리거합니다. 그 후, 각 곡의 아티스트를 가져오기 위해 추가 SQL 쿼리가 수행됩니다. 총 11개의 쿼리가 수행됩니다.

더 많은 곡을 불러올 경우 모든 아티스트를 가져오기 위해 데이터베이스에서 더 많은 부하가 걸리는 시나리오를 상상해 보세요.

대안으로 Rails의 **includes**를 사용하세요: 

```ruby
songs = Song.includes(:artists).where(genre: genre).limit(10)

songs.each do |song|
  puts "#{song.title} by #{song.artist.name}"
end
```

**includes** 이후에, 이제 표시할 노래 수에 상과없이 두개의 SQL 쿼리만 수행됩니다. 정말 깔끔합니다.

너무 많은 SQL 쿼리를 진단할 수 있는 한 가지 방법은 개발하는 중에 있습니다. 동일한 테이블에서 데이터를 가져오는 유사한 SQL 쿼리 그룹이 보이면 뭔가 이상한 일이 일어나고 있는 것입니다. 그렇게 때문에 개발 환경에 SQL 로깅을 사용하도록 설정하는 것이 좋습니다. 또한 Rails는 코드에서 쿼리가 호출된 위치를 보여주는 **[verbose query logs](https://guides.rubyonrails.org/debugging_rails_applications.html#verbose-query-logs)**를 지원합니다.

로그를 보는 것이 귀찮거나 좀더 심각한 것을 원한다면 [AppSignal’s 성능 측정 및 N+1 쿼리 감지](https://blog.appsignal.com/2020/06/09/n-plus-one-queries-explained.html)를 사용해보세요. 이를 통해 문제가 N+1 쿼리에서 비롯되었는지에 대한 휼륭한 지표를 얻을 수 있습니다. 아래는 그 모습입니다.

https://blog.appsignal.com/_next/image?url=%2Fimages%2Fblog%2F2021-07%2Fnplus1.png&w=3840&q=75

# 요약

이 블로그 게시물 시리즈를 읽어주셔서 감사합니다. Rails의 패턴과 안티 패턴을 소개하는 것부터 시작하여 일반적인 문제에 대한 마지막 블로그 게시물에 이르지까지 Rails MVC 패턴 내부에서 패턴이 무엇인지 살펴보는 이 흥미로운 여정에 함께 해주셔서 기쁩니다.

많은 것을 배웠거나 적어도 이미 알고 있는 내용을 수정하고 확립하셨기를 바랍니다. 모든 내용을 외우느라 스트레스를 받지 마세요. 어떤 영역에서든 문제가 생기면 언제든지 시리즈를 참조할 수 있습니다.

이 세상(특히 소프트웨어 공학)은 이상적이지 않기 때문에 반드시 패턴과 안티패턴을 모두 만나게 될 것입니다. 그렇다고 걱정할 필요 없습니다.

패턴과 안티 패턴을 마스터하면 휼륭한 소프트웨어 엔지니어가 될 수 있습니다. 하지만 환벽한 해결책은 없기 때문에 이러한 패턴과 틀을 깨야 할 때를 아는 것이 여러분을 더욱 휼륭하게 만들어 줄 것입니다.

참여해주시고, 읽어주셔서 다시 한번 감사드립니다. 다음편에서 또 만나요!

PS. Ruby Magic 게시물이 보도되는 대로 읽고 싶으시면 [Ruby Magic 뉴스레터를 구독하시고 단 하나의 게시물도 놓치지 마세요!](https://blog.appsignal.com/ruby-magic)
