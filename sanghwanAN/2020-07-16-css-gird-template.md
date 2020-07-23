# 열과 행을 다룰 수 있는 2차원 레이아웃 display: grid
## 05.grid 로 리스트 배열 해보기
### 1. 리스트들의 부모 요소를 Grid Container로 만든다.
### 2. 몇 행 몇 열을 만들 건지 정의 합니다.

#### 가. grid-template-columns / grid-template-rows 사용법

Grid-item 들을 몇 행 몇 열 로 배치를 할 지 **grid-template-columns** 와 **grid-template-rows** 속성을 사용하여 정 할 수 있습니다.

**grid-template-columns** 와 **grid-template-rows** 속성 사용법에 대해서 설명을 할껀데요, 그전에 먼저 추가로 알아야 할 Grid 관련 용어를 포스팅을 하고 속성 사용법에 대해 포스팅을 하겠습니다.  

**Grid Tracks** / **Cells**을 알아야 합니다.  

아래 내용은  [w3.org](https://www.w3.org/TR/css-grid-1/#grid-track-concept)의 내용입니다.

**Grid Tracks** / **Cells** 
* **Grid track** is a generic term for a grid column or grid row—in other words, it is the space between two adjacent grid lines. Each grid track is assigned a sizing function, which controls how wide or tall the column or row may grow, and thus how far apart its bounding grid lines are. Adjacent grid tracks can be separated by gutters but are otherwise packed tightly.  

* A **grid cell** is the intersection of a grid row and a grid column. It is the smallest unit of the grid that can be referenced when positioning grid items.

해석을 하면 **Grid Track**은 grid row 또는 grid column의 다른 말이고,  각 **Grid Track**은 크기 조정 기능이 있으며, 행 / 열 / grid Line을 넓히고 키울수 있고 멀리 떨어트릴 수 있게 할 수 있고, **grid cell**은 grid row와 grid Colum의 교차점인데 grid item의 위치를 옮길 때 사용하는 최소 단위 라고 정리 할 수 있겟습니다. (혹시 제가 잘 못 해석한 부분이 있으면 코멘트 부탁 드립니다.)  

위에 설명을 더 간단히 그림으로 풀면 아래 와 같습니다.  (Grid track은  grid column/row의 다른 명칭이고 **cell**은 작은 단위, grid row와 column을 이루는 **한 칸**으로 이해 하면 될 것 같습니다.)
![Grid Tracks / Cells](https://webkit.org/wp-content/uploads/grid-concepts.svg) 


grid 속성에 대해서 찾아보니간 다른 css 속성들보다는 단순 하지 않아서 제가 어느 정도 깊이 까지 포스팅을 해야 될지 모르겠는대요, 일단 하는 대까지 해 보겠습니다.

**grid-template-columns** 와 **grid-template-rows** 속성의 **Value**를 보면 아래와 같습니다.  
(참조 사이트 :  [w3.org : grid-template-columns/rows properties](https://www.w3.org/TR/css-grid-1/#track-sizing))  

 >Value:	none | &lt;track-list&gt; | &lt;auto-track-list&gt;  
 
아.. 봐도 모르겠습니다. 그래서 track-list와 auto-track-list는 무엇인지 찾아 봤더니 다음과 같이 나왔습니다.
(참조 사이트 :  [w3.org : typedef-track-list](https://www.w3.org/TR/css-grid-1/#typedef-track-list))

> **&lt;track-list&gt;** | **&lt;auto-track-list&gt;**  
Specifies the track list as a series of track sizing functions and line names. Each track sizing function can be specified as a length, a percentage of the grid container’s size, a measurement of the contents occupying the column or row, or a fraction of the free space in the grid. It can also be specified as a range using the minmax() notation, which can combine any of the previously mentioned mechanisms to specify separate min and max track sizing functions for the column or row.

정리를 하면 track-list는 track sizing function 과 Line name으로 지정하는데, track sizing function은 Column 과 Row를 length, 그리드 컨테이너의 percentage , Grid 안에 여유공간의 일부로 나타 낼 수 있다. 그리고 
minmax() 표기법을 사용 하여 Column과 row의 최소, 최대의 범위를 지정 할 수 있습니다. 라고 정리하면 될 것 같습니다.(이부분도 제가 해석을 잘 못했으면 코멘트 부탁 드립니다.)  


그리고 w3.org에 track-list의 구문도 나왔는데  관련 새로운 용어들도 많고 구문들도 다양해서 이것을 다 찾아보기에는 시간이 너무 걸릴 것 같아 넘어 가겠습니다.  

 이제 위에 내용대로 한번 **grid-template-columns** 와 **grid-template-rows** 속성을 사용 해서 리스트를 배치 해 보겠습니다.

w3.org의 내용이 방대하고 어려운데 w3.org의 내용을 이해하기 쉽게 관련 이미지와 함께 요점만 간단히 정리 한 곳이 있습니다.

[css-tricks.com](https://css-tricks.com/snippets/css/complete-guide-grid/#grid-table-of-contents) 이라는 곳인대요,
[css-tricks.com](https://css-tricks.com/snippets/css/complete-guide-grid/#grid-table-of-contents) 에서 나와있는 설명과 css 및 html 예제 소스를 참고 하여 포스팅을 하겟습니다.  

* grid01. 트랙 값 사이 빈 공간을 grid Line이 자동으로 할당 됩니다.  

```css
.cards--grid01 {
    grid-template-columns: 120px 100px auto 100px 120px;
    grid-template-rows: 25% 100px auto;
}
```

* grid02. 명시적으로 이름을 줄 수 있습니다.  
```css
.cards--grid02 {
    grid-template-columns: [first] 120px [line2] 100px [line3] auto [col4-start] 100px [five] 120px [end];
    grid-template-rows: [row1-start] 25% [row1-end] 100px [third-line] auto [last-line];
}
```

* grid03. 라인은 하나 이상의 이름을 가질 수 있습니다.    
```css
.cards--grid03 {
    grid-template-rows: [row1-start] 25% [row1-end row2-start] 25% [row2-end];
}
```

* grid04. 정의에 반복되는 부분이 포함 된 경우 repeat()표기법을 사용하여 작업을 간소화 할 수 있습니다.  
```css
.cards--grid05 {   
    grid-template-columns: repeat(3, 33.3% [col-start]);
}
.cards--grid04 {
    grid-template-columns: 33.3%  [col-start] 33.3%  [col-start] 33.3%  [col-start];
}
```
* grid05. 여러 줄이 같은 이름을 공유하는 경우 해당 줄 이름과 개수로 참조 할 수 있습니다. 
```css
.cards--grid__item {
  grid-column-start: col-start 2;
}
```

* grid06. fr장치를 사용하면 트랙의 크기를 그리드 컨테이너의 여유 공간의 일부로 설정할 수 있습니다. <br/>예를 들어, 이것은 각 항목을 그리드 컨테이너 너비의 1/3로 설정합니다.  
```css
.cards--grid06 {
    grid-template-columns: 1fr 1fr 1fr;
}
```

* grid07. fr 과 px 혼합 사용 가능(여유 공간은 계산 적용은 은 유연하지 않은 단위 먼저 계산 후 남은 공간을 계산함) 
```css
.cards--grid07 {
    grid-template-columns: 1fr 50px 1fr 1fr;
}
```

>css 적용 화면은 아래의 링크에서 확인 할 수 있습니다.  
[codepen - grid-template-columns 와 grid-template-rows 사용법](https://codepen.io/sanghwanAN/pen/mdVwxLK) 