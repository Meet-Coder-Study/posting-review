# 열과 행을 다룰 수 있는 2차원 레이아웃 display: grid

## 01.display:grid에 대해서 (grid 소개)

display: grid 라는 속성이 있습니다.

display: grid를 처음 접하는 사람들에게 쉽게 이해를 할 수 있게 좀더 직관 적으로 설명을 해보면 grid는 다음과 같은 장점들이 있습니다.

1. grid를 사용 하면 아래의 형태의 레이아웃을 고민 안하고 쉽게 만들 수 있습니다. ![그리드 예시 이미지](./images/grid01.jpg)  

2. 리스트 아이템 끼리 사이의 간격을 간단히 줄 수 있습니다.
   ![그리드 예시 이미지02](./images/grid02.jpg)  
보충설명을 하면 일반적으로 위에 이미지처럼 간격이 있는 카드 리스트 형태의 레이아웃을 코딩을 하기 위해서는 margin에 관한 중복 작업이 필요합니다. ( 리스트를 만들어 보신 분들은 알거라 생각하고 자세한 설명은 생략하겠습니다.)
grid의 grid-gap 속성을 이용하면 간단히 레이아웃을 만들 수 있습니다.  
 ~~~
 <style>
      /* 스타일 공통 시작 */
      * {
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
      /* 스타일 공통 끝 */
      /* grid 리스트 */
      .cards--grid {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-gap: 7px;
      }
    </style>
 ~~~
![gird,float을 적용한 리스트 화면(동일한 결과)](./images/grid03.jpg)    

지금 포스팅하는 내용은 그리드의 장점을 일부 포스팅 하는 것입니다.

좀 더 자세한 정보는 아래의 글에서 확인 할 수 있습니다.

[css-그리드-레이아웃을-지금-사용해도-정말-괜찮을까요](https://webactually.com/2017/11/css-%EA%B7%B8%EB%A6%AC%EB%93%9C-%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83%EC%9D%84-%EC%A7%80%EA%B8%88-%EC%82%AC%EC%9A%A9%ED%95%B4%EB%8F%84-%EC%A0%95%EB%A7%90-%EA%B4%9C%EC%B0%AE%EC%9D%84%EA%B9%8C%EC%9A%94/)

저도 아직 grid의 속성 및 사용법에 대해서 다 숙지를 하지 못한 상태인데 grid에 대해서 하나씩 하나씩 포스팅을 하면서 grid를 숙달 할 계획 입니다.
