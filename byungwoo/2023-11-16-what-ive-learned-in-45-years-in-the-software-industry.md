# [번역] 내가 45년 동안 소프트웨어 업계에서 배운 점

> 이 글은 [What I’ve Learned in 45 Years in the Software Industry
](https://www.bti360.com/what-ive-learned-in-45-years-in-the-software-industry/)을 번역하였습니다

<hr>
[BTI360](https://www.bti360.com/) 팀원인 조엘 골드버그는 40년 넘게 소프트웨어 업계에서 일한 후 최근 은퇴했습니다. 그는 퇴사하면서 자신의 경력을 통해 얻은 몇 가지 교훈을 우리 팀과 공유했습니다. 그의 허락을 받아 여기에서 그의 지혜를 다시 공유합니다.
<hr/>

소프트웨어 업계에서 보낸 40년을 되돌아보면 많은 변화가 있었다는 사실에 놀라움을 금치 못합니다. 저는 펀치 카드로 커리어를 시작했고 클라우드 컴퓨팅 시대를 맞이하고 있습니다. 이 모든 변화에도 불구하고 제 경력 전반에 걸쳐 도움이 되었던 많은 원칙은 변하지 않았고 여전히 유효합니다. 키보드를 내려놓으면서 소프트웨어 엔지니어로서의 커리어에서 배운 6가지 아이디어를 공유하고자 합니다.

## 1. 지식의 저주를 조심하세요
무언가를 알게 되면 그것을 모른다는 것이 어떤 것인지 상상하기란 거의 불가능합니다. 이것이 바로 지식의 저주이며 수많은 오해와 비효율의 시작입니다. 복잡한 것에 익숙한 똑똑한 사람들은 특히 이런 저주에 걸리기 쉽습니다!

> 지식의 저주(curse of knowledge)란 어떤 개인이 다른 사람들과 의사소통을 할 때 다른 사람도 해할 수 있는 배경을 가지고 있다고 자신도 모르게 추측하여 발생하는 인식적 편견이다.
> 즉 자신이 알고 있는 지식을 다른사람도 당연히 알고있을 것이라 생각하는 인식적 차이나 오류를 말한다. 지식을 알게 된 사람은 자신도 모르던 때를 기억하지 못하고 다른 사람도 당연히 알고 있을 것이라는 선입견이 생기는데 이것을 모른다는 것이 마치 저주처럼 공감하기 힘들어지는 것
> ~~아니 이걸 모른다고? 이걸 왜 모르지?~~
> 번역가나 교육자들이 흔히 겪는 문제중 하나이기도 하다.
> https://namu.wiki/w/%EC%A7%80%EC%8B%9D%EC%9D%98%20%EC%A0%80%EC%A3%BC

지식의 저주를 경계하지 않으면 코드를 포함한 모든 형태의 의사소통이 어려워질 가능성이 있습니다. 업무가 전문화될수록 비전문가가 이해할 수 없는 방식으로 커뮤니케이션할 위험이 커집니다. 지식의 저주와 싸우세요. 청중을 이해하기 위해 노력하세요. 자신이 전달하고자 하는 내용을 처음으로 배우는 것이 어떤 느낌일지 상상해 보세요.

## 2. 기본(fundamentals)에 집중하세요
기술은 끊임없이 변화하지만 소프트웨어 개발에 대한 몇 가지 근본적인 접근 방식은 이러한 트렌드를 초월합니다. 다음은 오랫동안 계속 유효할 6가지 기본 원칙입니다.

- 팀워크 - 훌륭한 팀은 훌륭한 소프트웨어를 만듭니다. 팀워크를 당연한 것으로 여기지 마세요.
- 신뢰 - 팀은 신뢰의 속도로 움직입니다. 함께 일하고 싶은 신뢰할 수 있는 사람이 되세요.
- 커뮤니케이션 - 정직하고 적극적으로 소통하세요. 지식의 저주를 피하세요.
- 합의 도출 - 시간을 내어 팀원 전체를 참여시키세요. 토론과 의견 불일치를 통해 최선의 해결책을 찾도록 하세요.
- 자동화된 테스트 - 잘 테스트된(well-tested) 코드는 팀이 자신감을 가지고 빠르게 움직일 수 있게 해줍니다.
- 깔끔하고 이해하기 쉬우며 탐색 가능한 코드 및 디자인 - 코드를 이어받을 다음 엔지니어를 고객으로 생각하세요. 후임자가 읽고, 유지 관리하고, 업데이트하는 데 문제가 없는 코드를 작성하세요.

## 3. 단순함(simplicity)
복잡성과 싸우는 것은 끝없는 원인(never-ending cause)입니다. 해결방안(solution)은 가능한 한 단순해야 합니다. 코드를 유지보수할 다음 사람이 여러분만큼 똑똑하지 않다고 가정해 보세요. 더 적은 기술을 사용할 수 있다면 그렇게 하세요.

> _디자이너는 더 이상 추가할 것이 없을 때가 아니라 더 이상 뺄 것이 없을 때 자신이 완벽에 도달했음을 알 수 있습니다._
> _앙투안 드 생텍쥐페리 (Antoine de Saint-Exupery)_

## 4. 먼저 이해하려고 노력하세요
[스티븐 코비(Stephen Covey, 커비 리더쉽 센터의 창립자)](https://ko.wikipedia.org/wiki/%EC%8A%A4%ED%8B%B0%EB%B8%90_%EC%BB%A4%EB%B9%84)의 7가지 습관 중 하나는 "먼저 이해하려고 노력한 다음 이해받으려고 노력하라"입니다. 이 격언은 제가 좋은 경청자(listener)이자 팀원(teammate)이 되기 위해 다른 어떤 조언보다 큰 도움이 되었습니다. 다른 사람에게 영향을 미치고 효과적으로 일하려면 먼저 상대를 이해해야 합니다. 자신의 생각을 말하기 전에 상대방의 감정, 생각, 관점을 이해하기 위해 적극적으로 경청하세요.

## 5. 종속(lock-in)을 주의하세요
소프트웨어 구축 방식에 혁신을 가져올 차세대 생산성 제품은 항상 존재합니다. 컴퓨터 지원 소프트웨어 엔지니어링(CASE, Computer Assisted Software Engineering) 도구, COTS(상용기성품, Commercial off-the-shelf), Peoplesoft 및 SAP와 같은 엔터프라이즈 리소스 계획 제품, 심지어 Ruby도 마찬가지입니다. 이들은 총체적인 개발 철학을 도입하면 비용과 시간을 크게 절감할 수 있다고 주장합니다. 항상 명확하지 않은 것은 상당한 초기 비용이나 제약이 따를 수 있다는 점입니다. 종속(lock-in)은 주로 공급업체(vendor)에서 발생했지만 이제는 프레임워크(framework)에서도 발생할 수 있습니다. 어느 쪽이든 종속(lock-in)은 변경에 상당한 비용이 든다는 것을 의미합니다. 현명하게 선택하세요. 새로운 것이 항상 좋은 것은 아닙니다!

제가 GM에 근무할 당시에는 더 많은 인원을 관리하거나 더 크고 복잡한 프로젝트를 맡지 않는다면 실패한 사람으로 간주했습니다. 많은 사람에게 이는 비참한 커리어 경로를 만들었습니다([피터의 법칙](https://ko.wikipedia.org/wiki/%ED%94%BC%ED%84%B0%EC%9D%98_%EB%B2%95%EC%B9%99) 참조). EDS(Electronic Data Systems)의 문화는 그렇지 않았습니다. 사람들은 관리직을 왔다 갔다 했습니다. 전략 기획자처럼 업무 범위가 넓은 직책에서 PM이나 프로젝트 레벨 개발자처럼 업무 범위가 좁은 직책으로 이동하는 것에 대한 낙인이 찍히지 않았습니다. 저는 이러한 유연성을 활용하여 기술 피라미드의 정점에 있던 역할에서 프로젝트 수준의 개발자로 다시 이동한 사람 중 한 명이었습니다. 뒤도 돌아보지 않았습니다.

> 피터의 법칙(Peter Principle)는 1969년 로렌스 피터 교수가 발표한 경영 이론이다. 이론에 따르면 승진은 승진 후보자의 승진 후 직책에 관련된 능력보다는 현재 직무 수행 능력에 근거하여 이루어진다. 따라서 승진자는 현재 직무 수행 능력을 더 이상 수행할 수 없는 직책까지 직위가 올라가게 되고, 결국 무능하게 된 상태로 고위직에 있는다고 한다. 다시 말해, 무능함에 따라 직위가 달라진다고 한다. 관료제의 단점을 보여주는 이론 중 하나이다.
> https://ko.wikipedia.org/wiki/%ED%94%BC%ED%84%B0%EC%9D%98_%EB%B2%95%EC%B9%99

## 6. 역할에 맞지 않을 때 정직하게 인정하세요
커리어의 어느 시점에서 적성에 맞지 않는 역할을 맡게 될 수도 있습니다. 적성에 맞지 않는다고 해서 성격에 결함이 있는 것은 아니지만 무시해서는 안 되는 문제입니다. 이러한 딜레마에 대한 해결책은 여러 가지가 있을 수 있습니다. 본인이 변화(evolve)하거나 역할이 변화(evolve)할 수 있습니다. 핵심은 무슨 일이 일어나고 있는지 스스로 인식하고 건강하지 않은 상황에서 벗어날 수 있는 자각 능력을 갖추는 것입니다. 불행은 누구에게도 이익이 되지 않으며, BTI360은 이를 잘 알고 있습니다.

## 마지막 생각
저는 BTI360에 입사하기 전부터 이 문화에 대해 충분히 알고 있었기 때문에 위에서 설명한 원칙을 중시하는 곳이라는 것을 알 수 있었습니다. 여러분 각자가 주인의식을 가지고 강력한 엔지니어링 문화를 유지하여 BTI360을 소프트웨어를 구축하기 좋은 곳으로 계속 만들어 주길 바랍니다.