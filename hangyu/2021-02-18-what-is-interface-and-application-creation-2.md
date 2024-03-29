# [what is interface and application creation 2] 인터페이스와 어플리케이션 제작 2

인터페이스와 어플리케이션 제작 1에 이은 내용이다

1탄과 마찬가지로 아래 글에서 시작한다 
- (https://www.slipp.net/questions/21 - 어플리케이션 개발은 어떤 순서로 하면 좋을까?)
- 1탄에서 언급된 컨트롤러 드리븐은 아래의 방식을 취한다
  1. Controller 개발
  2. Business Layer Interface 도출 (Operate Contract)
  3. Business Layer Concreate Class 구현 (Data Access and Biz Layer)
  4. Persistence Layer Interface 도출 (Data Contract)
  
어플리케이션 개발은 어떤 순서로 하면 좋을까? 

이에 대한 윗 글속의 자바지기 님의 순번을 매겨보면 아래와 같다 

1. 중심이 되는 도메인을 설계한다. (Model Class –> business Model)
   - 필수로 쓰이는 개념을 가지고 클래스로 생각하고 연관 클래스 모델과 Package 구조를 잡는다 (모델 설계)
2. 클래스 구조를 잡은 후 속성들을 하나씩 채워 나간다. (column or property) (모델의 속성 설계)
   - 물리적인 데이터 베이스와 매핑은 하지 않은 상태이기 때문에 기본적인 뼈대와 속성 추가에만 집중하며 전단계의 모델 설계가 개념적 모델링에 가깝다면 지금 단계에서는 논리적 모델링으로 접근한다
3. 만족할만한 수준으로 뼈대가 완성되면 이때부터 데이터베이스에 대한 매핑 정보를 추가하고 Repository를 구현한다 (DAO or DA의 기초 interface)
   - Repository가 Spring Data JPA를 사용하고 있다면 상관없고 그렇지 않다면 Entity(Model)에 기본적인 CRUD 기능이 가능한 상태로 만들어 준다

그 다음에 

4. Controller를 추가하고 View와 연관지어 사용자 관점의 화면 흐름을 구현하고 테스트한다 (Controller 에서 Business를 구분)

5. 이 과정을 마친 후에 Business Layer를 하나씩 추가해 Controller와 Repository를 연결하는 방식을 취한다
    - 도메인 모델에 대한 속성이나 구조는 기능을 하나씩 구현해 가면서 계속해서 수정하면서 완성시켜 나간다
      - (위 컨트롤러 드리븐의 2,3,4 번의 일을 하는 것)

여기서

Business Layer의 Interface를 도출하기 가장 좋은 시점은 Controller를 구현한 후 요구사항을 만족하기 위한 Business Layer를 만들어 가는 과정이지 않을까 생각한다는 자바지기 님의 의견이 나온다 

이 경우는 실질적인 로직을 Controller 이후부터 보게 된다는 말인 것 같다

처음에는 이런 고민들이 잘 와닿지 않았다 

유지보수로만 코딩하다보니 지금까지 정해진 원칙 없이 내가 필요하다고 생각하는 시점에 하나씩 추가하는 방식을 취했기 때문이다 

그렇다보니 Interface에 메소드를 하나 추가하는 것을 너무 쉽게 생각하는 것이 아닐까? 라는 의구심이 들었다

"Business Layer에 Interface를 만들어야 할까?" 글에서도 언급되었지만 Interface와 구현 클래스가 1:1 관계라면 Interface를 만들지 않았다

특별히 필요성을 느끼지 못했기 때문이다

그런데 Interface를 만들지 않고 바로 구현 클래스로 넘어가다 보니 Interface의 인자와 반환 값에 대해 신경 쓰는 시간보다 일단 바로 구현을 고민하는 상황이 되었던 것은 아닌가라는 생각도 해본다

즉, Interface를 통한 협업이나 느슨한 의존성 또는 재활용 관점이나 확장에 유연하고 변경에 엄격하게 유지보수를 할 수 있는 방법을 고민하지 못했다는 자아성찰 및 반성이 되는 글이었다 

자바지기님 정도의 내공을 가진 사람도 interface에 대한 Input과 Output 보다 내부 구조부터 고민하는 것을 보니 시간이 지나고 실력이 늘어도 더 좋은 방법이라는 고민은 쉽게 풀리지 않는 구나 라는 생각이 들었다 

아무래도 정답이 없는 것에 대한 고민은 개발자가 평생 겪는 고민 같은 것이고 만약 나의 답을 내려도 시니어가 되었을 때 내 답만 고집하게 될 수도 있을 것 같다는 생각도 들었다 (개발자도 확장에 열려있어야 한다) 

좋은 기준을 정한다는 게 누구나 겪는 쉽지 않은 고민이라는 부분이 눈에 띄었다

댓글의 토론에서 C기반의 헤더파일을 인터페이스에 비유하는 부분이나 그렇기 때문에 헤더파일에 Function을 추가하는 거랑 Interface/Class 에 Method를 추가하는 것에 대한 차이를 논하는 것은 참신하게 놀라웠다

결과적으로는 문법적인 영역으로는 검증이 불가능한부분 이라고 말하고 있지만 개념적으로는 비슷한 부분이 있다고 생각되었다
```
Object(Class) != Structure + Function 
```
``` 
요즘 OOP에서 강조하는 부분은 Message passing 입니다. Method Call을 Function Call 관점에서 보는 것이 아니라, 특정 Object에 Message를 보낸다는 형태로 보는 관점이죠. 이 관점에서 Interface를 바라보면, 정의되어 있는 Receive Message 에 대한 규칙이에요
```

이 말을 보면 Object를 가지고 Request / Response를 하는 느낌이다

단순히 Getter와 Setter만 해도 조회와 저장이라는 Message를 보내고 Return을 받기 때문이다

Call / Return 은 Method / Function은 둘 다 가지고 있는 개념이고 Object로서 Message 전달이나 내부 로직에 의한 데이터 가공이 Request / Response 의 역할로 추가된 은유이다 

여기에 하나의 전제조건이 있다

Interface 설계를 (좀 더 이상적으로) 하려면 설계자는 필히 외부 API 설계 경험이 있어야 한다

```
"Facebook API 고쳐주세요!"하면 "있는 걸로 하세요. 다음 버전에는 고려해 볼께요." 라는 이야기가 나오는게 정상이지

 "고객님 죄송합니다. 바로 고쳐 드릴께요."라고 할 리가 없다고 봅니다
```

이 부분이 너무 찔리고 있다…. 

초기 개발 수준에는 Interface의 역할에 대한 이해 조차 없다고 봐야겠다 

그냥 비슷한데 결과만 다른 메소드 하나 추가하면 저런 요구사항은 구현으로는 누구나 할 수 있다 

하지만 변화가 발생했을 때 

어디까지 영향이 가는지 그리고 이런 예측이 힘들면 새로 만드는 명함만 개발자들의 특성상 1:1 매칭되는 클래스나 인터페이스나 메소드나 이런류의 결과가 계속 나오게 되는 것이다 

이런 부분의 1:1로 개발하는 이유가 전체 구조에 대한 고민은 적게하고 당장 요구한 부분만 고민을 하면서 개발이라는 흉내를 내기 때문이다

요구사항만 들어주면 되고 내부 구조는 갉아먹고 있었던 것이다…… 

근데 진짜 고민했는데도 기존 구조상에서 좌절해서 포기해서 어쩔 수 없이 1번 2번 숫자 네이밍 달린 매소드를 만들 때 (전체적으로 바꿔야 하는 10년이상의 시스템에서) 이를 방지하려면 처음부터 고민해서 잘 만들어 나가야 한다 

일단 만들고 나중에 리팩토링도 가능하겠지만 이는 능력자들의 고려대상 이고 보통의 개발자라면 충분히 고민하고 품질관리가 무었인지 알고 품질이라는 것은 제조업의 QC, QA가 아니라 SW에서 충분히 보증서가 된다는 것을 몸소 느끼는게 성장하는 방향이 맞다고 본다(어디가 좋은 회사이지? 이런 것을 결정할 수 있는 이유로도) 

결론이 기술적인 탐구보다는 반성이 되었는데 이게 과거에 썼던 글이고 처음으로 SW 개발을 어떻게 해야 좋은 방법이지? 라는 의구심의 시작이었던 것 같다

그래도 고쳐쓰면서 다시 한번 새롭게 시작할 수 있었던 것 같다 

참고된 글을 몇개 더 남기자면 

- https://www.slipp.net/questions/22 - DTO(VO) 작성하시나요? 

위 연관 시리즈에서 맨 처음 보게된 글이었고 여기서 든 생각은 계층과 계층간에 data를 주고 받을 때 DTO를 사용할 것이며 그 DTO안에는 DB로부터 얻은 결과 or Business Model 들을 가지고 있다 라는 생각이다

그리고 지금은 DTO를 여러개 만들기 보다는 DA나 Biz에서 사용하는 Model들을 내부 Method를 통해 Builder 형태나 Static Method를 통해 생성시키고 모델 내부에서 비즈니스 변경을 처리하는 구조로도 개발 해보고 있다 

- https://www.slipp.net/wiki/pages/viewpage.action?pageId=4489243 - 인터페이스 설계 

마지막으로 고민해봐야 하는 내용이 있다

```
Java를 만든사람들이 보기에, Object-oriented Programming 은 "How" 보다는 "What"에 초점을 맞추고 있다고 합니다. 여기서 대명사처럼 쓰인 Java는 OOP라는 개념으로 생각됩니다.
```
```
전체 개발 과정에서 "What(Domain)"에 관심을 가지면, Interface 설계는 자동으로 따라오는 거라고 봅니다. 
```
```
결론은 정상적인 Domain 설계는 Interface 설계를 포함하고 있다고 한다 (1탄의 명사와 동사의 관계와 비슷한 느낌이 있다) 
Method 들의 Set(집합) 으로 Domain이 겪어야 할 Method를 같이 설계에 넣어야 하는 것이라면 CRUD도 Interface 설계의 일부분이다  
```

이제 최종적으로 내가 이 글을 쓰면서 생각하게 된 Application(why) 개발에 대해 남긴다  

글쓰기는 그렇지 않지만 프로그래밍에서는 항상 How(구현이)가 생각난다 

How를 생각하면 일정도 산정할 수 있을 것 같고 문제를 푸는 기분으로 뭔가 일을 해결할 것 같다

이 당시 Spring을 사용하지 않기에 .Net에 기반에서는 IoC Container는 객체를 생성하고 삭제하는 것을 쉽게 “대신” 해주는 라이브러리로 사용하는 녀석이고 

DI Patten도 Interface를 사용했기 때문에 생성과 사용에서 느슨한 결합상태가 되었고(특정 하나의 class로 강제하지 않기 때문) 이 인터페이스를 사용하는 객체가 올 거라고 의존성 주입이라는 어려운 말을 써서 “미리” setting 된 Object를 적시적소에 사용 할 수 있는 부분들이었다

위 내용을 보면 Why 이런걸 사용해야 하지?? 라는 생각보다 이걸 어떻게 구현하거나 사용해야 하지? 와 같은 How에 대한 생각들이 먼저 되었다   

달라져 보기로 했으니 보편적인 언어로 다시 고쳐써 본다면 

여기서 why를 먼저 생각한다는 것은 개발자가 현재 Coding 하는 것이 과거와 비교해서 더 편해 보려고(레거시 프레임워크) 대신해주는 녀석을 새로 만들게 되었고 

유지보수 할 때 Interface를 사용해서 변경에 종속되는 것이 아니라 느슨하게 결합되어 

관심사에 따라 Interface가 분리되어 업무에 따른 다른 사람의 수정사항에 대해 영향을 받지 않고 다른 개발자와 Interface로도 협업이 가능하게 하는 구조로 개발하는 것이 되었다  

즉, 구현에 전전 긍긍하고 쫄리기 보다는 어떻게 하면 개발자 편하게 뭔가 생성해 내고 여러 명이 같이 유지보수 할 수 있는 구조를 정할 수 있지?? 

단순한 규칙을 정해서 복잡하지 않고 누구나 쉽게 개발에 접근할 수 있는 것을 어덯게 만들지?? 

이런 접근 방법이라면 

1. Application 개발도 결국에는 개발자가 편한 구조가 되야 하고  
   
2. 변경에 대한 영향도가 없고 확장이 쉽게 개발하는 접근이 되야 하며 
   
3. 새로운 것을 도입하거나 기존방법에서 변경사항이 생길 때에도 이걸 왜 해? 질문을 하고 대답할 수 있어야 한다 
 
이 결과물과 고민이 더 편한 Application 개발을 할 수 있는 것이라면 

```
한 문장의 결론 : Interface를 통해 OOP 개발을 하는 것은 이것을 이용하는 것이 라이브러리의 활용이나 개발 방법에서 기존의 개발방법 보다 더 편하고 생산적인 Application 구조가 되기 때문에 더 좋은 SW 만드는 것이 가능하기 때문에 잘 활용할 수 있어야 한다    
```

하지만 정답은 없다고 본다. 다만 지금의 생각이 나중에 새로운 걸 접했을 때 머물지 말고 더 발전되길 바란다
