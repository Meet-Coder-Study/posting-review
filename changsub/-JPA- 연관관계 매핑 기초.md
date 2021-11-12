# \<JPA\> 연관관계 매핑 기초


## DB설계 상황
- Entity : Club, User
- 연관관계 : User가 1이고 Club이 多인 상황(하나의 유저가 여러개의 모임을 만든다)
## 단방향 연관관계
```java
public class User {
	@Id
	private String id;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false)
	private String email;

	@Column(length = 500, nullable = false)
	private String imgUrl;

	//...
}
```

```java
public class Club{

	//...

	@ManyToOne
	@JoinColumn(name ="user_id")
	private User user;

	//...

}
```
- 위의 코드를 이해하는데 상당히 오랜시간이 걸렸던것 같다.
- 우선 0번째로 이해해야하는 부분이 있는데 그건 RDB에서 일대다 관계가 성립 될 시 무조건 일에 있는 PK가 다쪽으로 넘어가서 해당 테이블의 FK가 된다는 것이다.
- 난 처음 RDB를 공부할 때 이러한 개념을 **카페에 가는 경우**로 이해했다.
- 먼저 동일한 프랜차이즈라도 하나의 카페지점은 너무 당연하게 하나이다.그리고 이러한 카페을 찾는 손님들은 항상 많다.
- 자연스럽게 카페 : 고객 =\> 일 대 다의 관계가 연상된다.
- 음료를 구매하면 종종 카페에서 우리에게 쿠폰 같은 것 준다.
- 여기서 나오는 쿠폰을 고객기준 FK라고 생각하면 된다.즉, 수많은 고객들이 있는데 하나의 어느 지점을 다녀왔다라고 남겨주는 것이라고 보면 이해하기 쉽다.
- 정리하자면 一인 엔티티쪽에서는 多인 엔티티를 구별하기 위해 본인의 PK 값을 남겨두고 이게 FK가 된다고 이해하자.
- 그러면 이제 JPA로 넘어와서 Club 기준으로 User는 FK이다.
- 그래서 Club 클래스의 User 객체에 @ManyToOne 어노테이션이 붙는다.(항상 해당 클래스 기준으로 어노테이션을 붙이면 이해하기 쉽다)
- 이런 식으로 두 객체간의 관계를 단방향으로 정의한 것이 단뱡향 연관관계이다.

## 양방향 연관관계
- 우선 테이블간의 연관관계부터 이해하면 왜 양방향 연관관계가 나왔는지 알기 쉽다.
- 테이블의 경우 처음부터 일대다,일대일 등등 테이블 간의 쌍방으로의 관계를 나타낸다.쉽게 말해 연관관계가 하나라는 뜻이다.
- 하지만 객체의 경우 테이블처럼 양방향으로 나타내려면 **연관관계를 두개를 써야한다.**
```java
public class Club{

	//...

	@ManyToOne
	@JoinColumn(name ="user_id")
	private User user;

	//...

}
```
 - 위와 같이 Club-\>User로가는 연관관계 하나, 그리고 아래와 같이 User-\>Club으로 가는 연관관계 하나를 더 해주면 객체의 양방향 연관관계가 완성된다.
```java
public class User {
    	@Id
    	private String id;
    
    	@Column(nullable = false)
    	private String name;
    
    	@Column(nullable = false)
    	private String email;
    
    	@Column(length = 500, nullable = false)
    	private String imgUrl;

		@OneToMany
		@MappedBy(name = "user")
		List<Club> clubs = new ArraryList<Club>();
    
    	//...
    }
```
- 위의 코드는 쉽게 말해 유저 입장에서 ‘내가 어떤 클럽들을 생성했더라??’라는 의문점을 해결해주기 위한 연관관계이다.
- 반면에 Club의 연관관계는 ‘내가 어떤놈한테 생성당한거지?’라는 의문점을 해결해준다.
- 여기서 중요한 점이 하나가 있는데 **연관관계의 주인**이라는 용어이다.
- 단어를 곱씹으면 이해가 금방 갈 수 있다. 연관관계에서 갑의 위치에 있으며 얘가 없으면 연관관계가 성립이 안되는 상황이라고 보면된다.
- 위의 경우, 제일 처음 단방향 연관관계를 설정할때, Club이라는 클래스에 **user**라는 객체를 초기화했다.두번째 양방향 연관관계를 설정할 때, 어떻게 clubs라는 리스트를 받아올수 있었을까?
- 이는 바로 처음에 user라는 객체가 Club에 있어 인식표 역할을 했기 때문이다.
- 쉽게 말해 ‘지금 이 Club은 어떤 user에 의해 생성됬어’라는 메세지를 user라는 객체가 전달해주고 있다.
- 결론적으로 중요한 역할을 하는 user가 연관관계의 주인이며 @MappedBy 어노테이션의 인자로 들어간다.
- 또한 위의 내용을 이해하면 연관관계의 주인은 결국 FK라는 것도 이해하게 된다.