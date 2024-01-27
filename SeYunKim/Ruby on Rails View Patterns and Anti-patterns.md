# [번역] **Ruby on Rails View Patterns and Anti-patterns**

<aside>
💡 원본글 : https://blog.appsignal.com/2021/02/10/ruby-on-rails-view-patterns-and-anti-patterns.html

</aside>

Ruby On Rails 패턴과 안티패턴 시리즈의 세 번째 편에 오신걸 환영합니다. 이전 게시물에서 우리는 Rails 모델과 관련한 패턴과 안티패턴과 일반적인 경우에 대해서 다루었습니다. 이번 글에서는 Rail의 view와 관련된 몇 가지 패턴과 안티패턴에 대해서 살펴보겠습니다.

Rails View는 때로는 완벽하고 빠르게 동작하기도 하지만, 온갖 종류의 문제가 발생할 수 있습니다. View를 처리하는 방법에 대한 자신감을 높이고 싶거나 이 주제에 대해 더 자세히 알고 싶다면 이 블로그 게시물이 도움이 될 것입니다. 그럼 바로 시작하겠습니다.

아시다시피 Rails 프레임워크는 구성에 대한 규칙을 따릅니다. 그리고 Rails는 모델-뷰-컨트롤러(MVC) 패턴을 중요시하기 때문에 이 모토는 자연스럽게 View 코드에도 적용됩니다. 여기에는 마크업(ERB 또는 Slim 파일), JavaScript 및 CSS 파일이 포함됩니다. 언뜻 보기에는 View 레이어가 매우 간단하고 쉽다고 생각할 수 있지만 요즘에는 View 레이어에 여러가지 기술이 혼재되어 있다는 점을 명심하세요.

View에는 JavaScript, HTML, CSS가 사용됩니다. 이 세가지 기술은 혼동과 코드의 무질서를 초래하여 큰 의미가 없는 구현으로 이어질수 있습니다. 다행히도 오늘은 Rails View 계층의 몇 가지 일반적인 문제와 해결 방법을 살펴보겠습니다.

## **Powerlifting Views**

이 실수는 자주 발생하지 않지만,, 발생하면 눈에 거슬리는 실수입니다. 때때로 사람들은 도메인 로직이나 쿼리를 View 내부에 직접 넣는 경향이 있습니다. 이렇게 하면 View 레이어가 무거운 작업이나 파워리프팅(Powerlifting)을 수행하게 됩니다. 흥미로운 점은 Rails를 사용하면 실제 이런 일이 쉽게 일어날 수 있다는 것입니다. 이와 관련하여 ‘안전망’이 없기 때문에 View 레이어가 원하는 무엇이든 다 할수가 있습니다.

MVC패턴의 View 레이어의 정의에 따라 해당 레이어에는 프리젠테이션(표현)하는 로직이 포함되어야 합니다. 도메인 로직이나 데이터 쿼리에는 신경 쓰지 않아야 합니다. Rails에는 루비 코드를 작성할 수 있는 ERB 파일(임베디드 루비)가 제공되며, 이 파일은 HTML로 평가됩니다. index 페이지에 노래를 나열하는 웹사이트의 예를 생각해보면, View 로젝은 **app/views/songs/index.html.erb**에 있을 것입니다.

파워리프팅(Powerlifting)이 무엇을 의미하고 무엇을 하지 말아야 하는지에 대해 설명 하기 위해 다음 예제를 살펴보겠습니다: 

```ruby
# app/views/songs/index.html.erb

<div class="songs">
  <% Song.where(published: true).order(:title) do |song| %>
    <section id="song_<%= song.id %>">
      <span><%= song.title %></span>

      <span><%= song.description %></span>

      <a href="<%= song.download_url %>">Download</a>
    </section>
  <% end %>
</div>
```

여기서 크게 보여지는 안티패턴은 마크업에서 바로 Song을 가져오는 “**Song.where(published: true).order(:title)**” 코드부분입니다. 데이터를 가져오는 책임은 Controller 또는 Service에 위임해야 하는데 가끔 Controller에서 일부 데이터를 준비한 후에 나중에 View에서 더 많은 데이터를 가져오는 경우를 봅니다. 이는 잘못된 설계이며 쿼리로 데이터베이스에 더 부하를 주기 때문에 웹사이트 속도가 느려집니다.

따라서 위와 같은 방식 대신에 Controller 액션에서 “**@Song**”의 인스턴스 변수를 노출하고 다음과 같이 마크업에서 호출하는 것이 좋습니다.

```ruby
class SongsController < ApplicationController
  ...

  def index
    @songs = Song.all.where(published: true).order(:title)
  end

  ...
end
```

```ruby
# app/views/songs/index.html.erb

<div class="songs">
  <% @songs.each do |song| %>
    <section id="song_<%= song.id %>">
      <span><%= song.title %></span>

      <span><%= song.description %></span>

      <a href="<%= song.download_url %>">Download</a>
    </section>
  <% end %>
</div>
```

이 예제는 완벽하지는 않습니다. Controller 코드를 더 읽기 쉽게 만들고 SQL 파스타 코드를 피하고 싶다면 [이전 블로그](https://blog.appsignal.com/2020/11/18/rails-model-patterns-and-anti-patterns.html)([번역본](https://rutgo-letsgo.tistory.com/entry/%EB%B2%88%EC%97%AD-Ruby-on-Rails-Model-Patterns-and-Anti-patterns-Ruby-On-Rails%EC%9D%98-%EB%AA%A8%EB%8D%B8%EC%9D%98-%ED%8C%A8%ED%84%B4%EA%B3%BC-%EC%95%88%ED%8B%B0%ED%8C%A8%ED%84%B4))를 확인하시기 바랍니다. 또한 View 레이어에서 로직을 제외하면 다른 사람들이 이를 기반으로 해결책을 구축하려는 가능성이 높아집니다.

## Rails가 제공하는 기능을 활용하기

여기서는 짧게 설명하겠습니다. 프레임워크로서 Ruby On Rails는 특히 View 내부에 깔끔한 Helper가 많이 포함되어 있습니다. 이 멋진 작은 Helper를 사용하면 View 레이어를 빠르고 쉽게 빌드할 수 있습니다. Rails의 초보자라면 erb파일 내에 전체 HTML을 아래와 같이 작성하고 싶을 수도 있습니다:

```ruby
# app/views/songs/new.html.erb

<form action="/songs" method="post">
  <div class="field">
    <label for="song_title">Title</label>
    <input type="text" name="song[title]" id="song_title">
  </div>

  <div class="field">
    <label for="song_description">Description</label>
    <textarea name="song[description]" id="song_description"></textarea>
  </div>

  <div class="field">
    <label for="song_download_url">Download URL</label>
    <textarea name="song[download_url]" id="song_download_url"></textarea>
  </div>

  <input type="submit" name="commit" value="Create Song">
</form>
```

https://blog.appsignal.com/_next/image?url=%2Fimages%2Fcomponents%2Fbanner%2Fimg-left%402x.png&w=3840&q=75

https://blog.appsignal.com/_next/image?url=%2Fimages%2Fcomponents%2Fbanner%2Fimg-right%402x.png&w=3840&q=75

이 HTML을 사용하면 아래 스크린샷과 같이 새로운 노래를 등록할 수 있는 Form을 얻을수 있습니다.

https://blog.appsignal.com/_next/image?url=%2Fimages%2Fblog%2F2021-02%2Fnew-song-form.png&w=640&q=75

하지만 Rails를 사용한다면, Rails가 기능을 제공해주기 때문에 일반 HTML을 작성할 필요도 없고 작성해서도 안됩니다. **form_with** view helper를 사용하면 HTML을 자동으로 생성해 줍니다. **form_with**은 Rails 5.1에 도입되었으며 일부 사용자에게 익숙한 **form_tag** 및 **form_for**를 대체하기 위한 것입니다. **form_with**이 어떻게 추가 코드 작성을 덜어주는지 살펴보겠습니다.

```ruby
<%= form_with(model: song, local: true) do |form| %>
  <div class="field">
    <%= form.label :title %>
    <%= form.text_field :title %>
  </div>

  <div class="field">
    <%= form.label :description %>
    <%= form.text_area :description %>
  </div>

  <div class="field">
    <%= form.label :download_url do %>
      Download URL
    <% end %>
    <%= form.text_area :download_url %>
  </div>

  <%= form.submit %>
<% end %>
```

“**form_with**”은 HTML을 생성하는 것 외에도 CSRF 공격을 방지하는 인증 토큰도 생성합니다. 따라서 거의 모든 경우에 지정된 헬퍼를 사용하는 것이 더 좋으며, 이는 Rails 프레임워크와 잘 작동할 수 있기 때문입니다. 일반 HTML Form을 제출하려고 하면 요청과 함께 제출된 유효한 토큰이 없기 때문에 실패합니다.

> **CSRF*(Cross Site Request Forgery)*란?**

*웹 어플리케이션 취약점 중 하나로, 사용자가 자신의 의지와는 다르게 공격자가 의도한 행위를 특정 웹사이트에 요청하게 만드는 공격입니다. 예를 들어, 사용자가 로그인한 상태에서 페이스북에 글을 쓰는 것처럼 보이는 피싱 사이트에 접속하면, 공격자가 만든 광고성 글이 페이스북에 게시될 수 있습니다. 이러한 공격을 방지하기 위해, 서버에서는 임의의 난수 값을 생성하여 세션에 저장하고, 요청마다 이 값을 전달합니다. 서버는 요청을 받을 때마다 세션에 저장된 값과 요청에 전달된 값이 일치하는지 검증하여, 위조 요청을 거부합니다. 이러한 난수 값을 Security Token이라고 부릅니다.*
> 

“**form_with**”, “**label**”, “**text_area**”, “**submit**” 헬퍼 외에도 Rails에는 View 헬퍼가 더 많이 기본으로 제공됩니다. 이러한 View 헬퍼는 여러분들의 개발 삶을 더 쉽게 만들어 주기 위해 존재하므로 더 잘 알아둬야 합니다. 올스타중 하나는 “**link_to**” 입니다.

```ruby
<%= link_to "Songs", songs_path %>
```

아래와 같이 HTML이 생성됩니다.

```html
<a href="/songs">Songs</a>
```

각 헬퍼에 대해서 자세히 설명하다 보면 이글이 너무 길어지고, 모든 헬퍼를 살펴보는 것이 오늘의 주제는 아니므로 자세히 설명하지 않겠습니다. 궁금하시다면 **[Rails Action View helpers guide](https://guides.rubyonrails.org/action_view_helpers.html)**를 참고해서 필요한 헬퍼를 선택하는것이 좋습니다.

## View **코드를 재사용하고 정리하기**

완벽한 웹 애플리케이션이 있다고 상상해 봅시다. 완벽한 사용 사례에는 if-else문이 없고 Controller에서 데이터를 가져와 HTML 태그 사이에 넣는 순수한 코드만 있습니다. 이러한 종류의 애플리케이션은 해커톤이나 꿈속에서나 존재할 수 있지만, 실제 애플리케이션에는 View를 랜더링할 때 여러가지 분기와 조건이 존재합니다.

페이지의 일부를 표시하는 로직이 너무 복잡해지면 어떻게 해야 할까요? 일반적인 대답은 최신 JavaScript 라이브러리나 프레임워크를 사용하여 복잡한 것을 구축하는 것입니다. 하지만 이 게시물은 Rails View에 관한 것이므로 그 안에 있는 선택지들을 살펴보겠습니다.

## **After-Market (Custom) Helpers**

Song 아래에 CTA(call-to-action) 버튼을 표시하고 싶다고 가정해보겠습니다. 하지만 한 가지 정책이 있습니다. Song에 다운로드 URL이 존재할수도 있고 아닐수도 있습니다. 그렇다면 다음과 같이 코드를 작성하게 될것입니다.

```ruby
app/views/songs/show.html.erb

...

<div class="song-cta">
  <% if @song.download_url %>
    <%= link_to "Download", download_url %>
  <% else %>
    <%= link_to "Subscribe to artists updates",
                artist_updates_path(@song.artist) %>
  <% end %>
</div>

...
```

If we look at the example above as an isolated presentational logic, it doesn't look too bad, right? But, if there are more of these conditional renders, then the code becomes less readable. It also increases the chances of something, somewhere not getting rendered properly, especially if there are more conditions.

위의 예시에서 고립된 프레젠테이션 로직으로만 본다면 그렇게 나쁘지 않을거 같습니다. 그쵸? 하지만 이러한 조건부 랜더링이 많아진다면 코드의 가독성이 떨어집니다. 특히 조건이 많으면 어딘가에서 제대로 랜더링 되지 않을 가능성도 높아집니다.

이러한 문제를 해결하는 한 가지 방법은 별도의 헬퍼로 추출하는 것입니다. 다행히도 Rails는 사용자 정의 헬퍼를 쉽게 작성할 수 있는 방법을 제공합니다. “**app/helpers**”에서 다음과 같이 “**SongHelper**”를 만들수 있습니다.

```ruby
module SongsHelper
  def song_cta_link
    content_tag(:div, class: 'song-cta') do
      if @song.download_url
        link_to "Download", @song.download_url
      else
        link_to "Subscribe to artists updates",
                artist_updates_path(@song.artist)
      end
    end
  end
end
```

Song의 show 페이지를 열어도 여전히 동일한 결과를 얻을수가 있습니다. 하지만 이 예제를 조금 더 개선할 수 있습니다. 위의 예제에서는 인스턴스 변수인 “**@Song**”을 사용했습니다. 노래가 **nil**인 곳에서 이 헬퍼를 사용하기로 결정했다면 이 메서드를 사용할수가 없을수도 있습니다. 따라서 인스턴스 변수 형태의 외부 종속성을 차단하기 위해 다음과 같이 헬퍼에게 인수를 전달할수 있습니다.

```ruby
module SongsHelper
  def song_cta_link(song)
    content_tag(:div, class: 'song-cta') do
      if song.download_url
        link_to "Download", song.download_url
      else
        link_to "Subscribe to artists updates",
                artist_updates_path(song.artist)
      end
    end
  end
end
```

view에서 아래와 같이 사용할수 있습니다

```ruby
app/views/songs/show.html.erb
...
<%= song_cta_link(@song) %>
...

```

이렇게 하면 View에서 이전과 동일한 결과를 얻을 수 있습니다. 헬퍼를 사용할 때의 장점은 헬퍼에 대한 테스트를 작성해서 향후 헬퍼와 관련된 회귀가 발생하지 않도록 할 수 있다는 점입니다. 단점은 헬퍼가 전역적으로 정의되므로 앱 전체에서 헬퍼 이름이 고유한지 확인해야 한다는 점이빈다.

Rails 사용자 헬퍼를 작성하는 것을 좋아하지 않는 다면 **draper gem**을 사용해 View Model패턴을 사용해볼수도 있습니다. 여기에서 자신만의 View Model 패턴을 직접 만들수 있으며, 그렇게 복잡하지 않습니다. 웹앱을 막 시작하는 경우에는 사용자 정의 헬퍼를 작성하여 천천히 시작하고 문제가 발생하면 다른 해결책으로 전환하는 것이 좋습니다.

## **DRY up Your Views**

Rails를 시작하면서 정말 마음에 들었던 점은 마크업을 쉽게 정리할 수 있다는 점이였습니다. Rails는 어디에나 포함될 수 있는 재사용 가능한 코드 조각인 partials를 생성할 수 있는 기능을 제공합니다. 예를 들어 여러 곳에서 Song을 랜더링하고 있고 여러 파일에 동일한 코드가 있는 경우 Song partial을 만드는 것이 좋습니다.

아래와 같이 노래를 표시한다고 가정해보겠습니다.

```ruby
# app/views/songs/show.html.erb

<p id="notice"><%= notice %></p>

<p>
  <strong>Title:</strong>
  <%= @song.title %>
</p>

<p>
  <strong>Description:</strong>
  <%= @song.description %>
</p>

<%= song_cta_link %>

<%= link_to 'Edit', edit_song_path(@song) %> |
<%= link_to 'Back', songs_path %>
```

하지만 동일한 마크업으로 다른 페이지에도 표시하고 싶을수도 있습니다. 그렇다면 “**app/views/songs/_song.html.erb**”와 같이 언더바(_) 접두사가 붙은 새 파일을 만들면 됩니다.

```ruby
# app/views/songs/_song.html.erb

<p>
  <strong>Title:</strong>
  <%= @song.title %>
</p>

<p>
  <strong>Description:</strong>
  <%= @song.description %>
</p>

<%= song_cta_link(@song) %>
```

그리고 어디에서나 원하는 곳에 Song partial을 아래와 같이 추가하면 됩니다.

```ruby
...
<%= render "song" %>
...

```

**“_Song**” partial의 존재 여부를 자동으로 조회한 후에 랜더링을 합니다. 사용자 정의 헬퍼를 사용한 예제와 마찬가지로 partial에서 인스턴스 변수의 “**@song**”을 제거하는 것이 가장 좋습니다.

```ruby
# app/views/songs/_song.html.erb
<p>
  <strong>Title:</strong>
  <%= song.title %>
</p>

<p>
  <strong>Description:</strong>
  <%= song.description %>
</p>

<%= song_cta_link(song) %>
```

그런 다음 song의 변수를 partial에 전달하여 재사용성을 높이고 다른 곳에 포함시키기에 적합하도록 만들어야 합니다.

```ruby
...
<%= render "song", song: @song %>
...

```

## 마지막 생각

That's all folks for this post. To summarize, we went through a few patterns and anti-patterns that you can come across in the Rails View realm. Here are a few takeaways:

이 포스팅은 여기까지입니다. 요약하자면 Rails View 영역에서 볼 수 있는 몇 가지 패턴과 안티패턴을 살펴봤습니다. 다음은 몇 가지 요점입니다:

- Avoid complex logic in the UI (do not make the View do lots of powerlifting)
- UI에서 복잡한 로직 피하기(View가 많은 Powerlifting을 수행하지 않도록 만들기.)
- Learn what Rails gives you out-of-the-box in terms of View helpers.
- Rails가 View 헬퍼와 관련된 기본적으로 제공하는 기능에 대해 알아보세요.
- Structure and reuse your code with custom helpers and partials
- 사용자 지정 헬퍼 및 partial 코드를 구조화하고 재사용 하세요.
- 인스턴스 변수에 너무 많이 의존하지 마세요.

다음 게시물에서는 상당히 지저분해질수 있는 Rails Controller 패턴과 안티 패턴에 대해 다룰 것입니다. 기대해주세요.

다음 시간까지 화이팅!

PS. Ruby Magic 게시물이 보도되는 대로 읽고 싶으시면 [Ruby Magic 뉴스레터를 구독하시고 단 하나의 게시물도 놓치지 마세요!](https://blog.appsignal.com/ruby-magic)
