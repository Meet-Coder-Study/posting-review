# 열과 행을 다룰 수 있는 2차원 레이아웃 display: grid

## 01.display:grid에 대해서 (grid 소개)

display: grid 라는 속성이 있습니다.

display: grid를 처음 접하는 사람들에게 쉽게 이해를 할 수 있게 좀더 직관 적으로 설명을 해보면 grid는 다음과 같은 장점들이 있습니다.

1. grid를 사용 하면 아래의 형태의 레이아웃을 고민 안하고 쉽게 만들 수 있습니다.  ![그리드 예시 이미지](./images/grid01.jpg)  

2. 리스트 아이템 끼리 사이의 간격을 간단히 줄 수 있습니다.  ![그리드 예시 이미지02](./images/grid02.jpg)  
보충설명을 하면 일반적으로 위에 이미지처럼 간격이 있는 카드 리스트 형태의 레이아웃을 코딩을 하기 위해서는 margin에 관한 중복 작업이 필요합니다. grid의 grid-gap 속성을 이용하면 간단히 레이아웃을 만들 수 있습니다.  
퍼블리셔가 아닌 분들을 위해서 더 자세히 말씀드리면 아래의 css 소스에서  /* float 리스트 */ 주석 처리된 부분과   /* grid 리스트 */ 주석 처리된 부분의 라인 수만 보아도 grid를 사용 하면 좀 더 간편히 리스트를 만들 수 있는 것을 느낄 것입니다.
gird에 대한 속성들은 다음 포스팅에 할 예정이기 때문에 grid 속성에 대한 설명은 지금은 생략 하겠습니다.

````css
<style>
  /* 스타일 공통 시작 */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  ul {
    list-style: none;
  }
  .post-wrap {
    padding: 80px 100px;
  }
  .post-tit {
    font-size: 24px;
    margin-bottom: 10px;
  }
  .cards {
    padding: 0;
    list-style: none;
  }
  h2 {
    font-size: 14px;
  }
  .content-wrap {
    width: 754px;
    margin: 0 0 40px;
    padding: 10px;
    background: #f4e4f6;
  }
  .cards {
    overflow: hidden;
  }
  .cards:after {
    content: "";
    clear: both;
    display: block;
  }
  .cards li {
    background-color: #fff0f6;
    border: 1px solid #857e80;
    padding: 10px;
    border-radius: 5px;
  }
  /* 스타일 공통 끝 */
  /* float 리스트 */
  .cards--float {
    margin-top: -10px;
    margin-left: -7px;
  }
  .cards--float li {
    float: left;
    width: 240px;
    margin-left: 7px;
    margin-top: 10px;
  }

  /* grid 리스트 */
  .cards--grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 7px;
  }
</style>
````
````html
<div class="post-wrap">
  <h2 class="post-tit">float을 사용한 리스트</h2>
  <div class="content-wrap">
    <ul class="cards cards--float">
      <li>
        <h2>Card 1</h2>
      </li>
      <li>
        <h2>Card 2</h2>
      </li>
      <li>
        <h2>Card 3</h2>
      </li>
      <li>
        <h2>Card 4</h2>
      </li>
      <li>
        <h2>Card 5</h2>
      </li>
      <li>
        <h2>Card 6</h2>
      </li>
    </ul>
  </div>
  <h2 class="post-tit">gird를 사용한 리스트</h2>
  <div class="content-wrap">
    <ul class="cards cards--grid">
      <li>
        <h2>Card 1</h2>
      </li>
      <li>
        <h2>Card 2</h2>
      </li>
      <li>
        <h2>Card 3</h2>
      </li>
      <li>
        <h2>Card 4</h2>
      </li>
      <li>
        <h2>Card 5</h2>
      </li>
      <li>
        <h2>Card 6</h2>
      </li>
    </ul>
  </div>
</div>
````
![gird,float을 적용한 리스트 화면(동일한 결과)](./images/grid03.jpg)    

코드펜 소스 : [코드펜 에서 확인 해보세요](https://codepen.io/sanghwanAN/pen/BaoqGqz)  

지금 포스팅하는 내용은 그리드의 장점중 grid를 사용하면 편한 것에 중점을 두고 포스팅을 하였습니다.
좀 더 자세한 정보는 아래의 글에서 확인 할 수 있습니다.

[css-그리드-레이아웃을-지금-사용해도-정말-괜찮을까요](https://webactually.com/2017/11/css-%EA%B7%B8%EB%A6%AC%EB%93%9C-%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83%EC%9D%84-%EC%A7%80%EA%B8%88-%EC%82%AC%EC%9A%A9%ED%95%B4%EB%8F%84-%EC%A0%95%EB%A7%90-%EA%B4%9C%EC%B0%AE%EC%9D%84%EA%B9%8C%EC%9A%94/)

저도 아직 grid의 속성 및 사용법에 대해서 다 숙지를 하지 못한 상태인데 grid에 대해서 하나씩 하나씩 포스팅을 하면서 grid를 숙달 할 계획 입니다.
