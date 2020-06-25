# AOP를 이해해보자. - 1

> 이 글은 jojoldu님의 글인 `[AOP 정리](https://jojoldu.tistory.com/69)` 글을 보고 정리한 글입니다.

## 문제 상황

- 게시판 서비스와 유저 서비스가 있다고 가정한다.
- Spring boot + JPA + H2 + Gradle로 구현한다.
- 게시글 전체조회, 유저 전체조회 기능을 구현한다.
- 해당 기능들의 실행 시간이 얼마나 걸리는지 확인한다.

- build.gradle

```groovy
plugins {
    id 'org.springframework.boot' version '2.3.0.RELEASE'
    id 'io.spring.dependency-management' version '1.0.9.RELEASE'
    id 'java'
}

group 'org.example'
version '1.0-SNAPSHOT'

sourceCompatibility = 1.8

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation'org.springframework.boot:spring-boot-starter-data-jpa'

    runtime 'com.h2database:h2'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

- Board

```java
package jojoldu.aop.ex.common;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Board {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column
	private String title;
	@Column
	private String content;

	public Board() {

	}

	public Board(final String title, final String content) {
		this.title = title;
		this.content = content;
	}

	public Long getId() {
		return id;
	}

	public String getTitle() {
		return title;
	}

	public String getContent() {
		return content;
	}
}
```

- BoardRepository

```java
package jojoldu.aop.ex.common;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, Long> {
}
```

- User

```java
package jojoldu.aop.ex.common;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column
	private String email;
	@Column
	private String name;

	public User() {

	}

	public User(final String email, final String name) {
		this.email = email;
		this.name = name;
	}

	public Long getId() {
		return id;
	}

	public String getEmail() {
		return email;
	}

	public String getName() {
		return name;
	}
}
```

- UserRepository

```java
package jojoldu.aop.ex.common;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
```

## 기초적인 방법

- BoardService

```java
package jojoldu.aop.ex.basic;

import java.util.List;

import org.springframework.stereotype.Service;

import jojoldu.aop.ex.common.Board;
import jojoldu.aop.ex.common.BoardRepository;

@Service
public class BoardService {

	private final BoardRepository boardRepository;

	public BoardService(final BoardRepository boardRepository) {
		this.boardRepository = boardRepository;
	}

	public void save(Board board) {
		boardRepository.save(board);
	}

	public List<Board> findAll() {
		long startTime = System.currentTimeMillis();
		List<Board> boards = boardRepository.findAll();
		long endTime = System.currentTimeMillis();
		System.out.printf("시작 시간 : %d, 끝나는 시간 %d, 총 걸리는 시간 : %d \n",
			startTime, endTime, endTime - startTime);
		return boards;
	}
}
```

- BoardController

```java
package jojoldu.aop.ex.basic;

import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jojoldu.aop.ex.common.Board;

@RestController
public class BoardController {
	private final BoardService boardService;

	public BoardController(final BoardService boardService) {
		this.boardService = boardService;
	}

	@PostConstruct
	public void setup() {
		for (int i = 0; i < 100; i++) {
			boardService.save(new Board(i + "번째 게시글의 제목", i + "번째 게시글의 내용"));
		}
	}

	@GetMapping("/boards")
	public List<Board> getBoards() {
		return boardService.findAll();
	}
}
```

- UserService

```java
package jojoldu.aop.ex.basic;

import java.util.List;

import org.springframework.stereotype.Service;

import jojoldu.aop.ex.common.User;
import jojoldu.aop.ex.common.UserRepository;

@Service
public class UserService {

	private final UserRepository userRepository;

	public UserService(final UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public void save(User user) {
		userRepository.save(user);
	}

	public List<User> findAll() {
		long startTime = System.currentTimeMillis();
		List<User> users = userRepository.findAll();
		long endTime = System.currentTimeMillis();
		System.out.printf("시작 시간 : %d, 끝나는 시간 %d, 총 걸리는 시간 : %d",
			startTime, endTime, endTime - startTime);
		return users;
	}
}
```

- UserController

```java
package jojoldu.aop.ex.basic;

import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jojoldu.aop.ex.common.User;

@RestController
public class UserController {
	private final UserService userService;

	public UserController(final UserService userService) {
		this.userService = userService;
	}

	@PostConstruct
	public void setup() {
		for (int i = 0; i < 100; i++) {
			userService.save(new User(i + "@email.com", i + "번째 사용자"));
		}
	}

	@GetMapping("/users")
	public List<User> getBoards() {
		return userService.findAll();
	}
}
```

- 실행결과

```
시작 시간 : 1593071018484, 끝나는 시간 1593071018602, 총 걸리는 시간 : 118
시작 시간 : 1593071029778, 끝나는 시간 1593071029786, 총 걸리는 시간 : 8
```

- 문제점
    - 단일 책임 원칙 위반
        - 메소드들은 `조회`라는 책임과 수행시간을 측정하고 출력하는 기능까지 여러개의 책임을 가지고 있다.
    - 중복 코드
        - 수행 시간 측정과 출력 기능이 중복이다.

## 상속

- SuperPerformance

```java
package jojoldu.aop.ex.inheritance;

import java.util.List;

public abstract class SuperPerformance<T> {
	private long start() {
		return System.currentTimeMillis();
	}

	private void end(long startTime) {
		long endTime = System.currentTimeMillis();
		System.out.printf("시작 시간 : %d, 끝나는 시간 %d, 총 걸리는 시간 : %d \n",
			startTime, endTime, endTime - startTime);
	}

	public abstract List<T> findAll();

	public List<T> getData() {
		long startTime = start();
		List<T> data = findAll();
		end(startTime);
		return data;
	}
}
```

- InheritBoardService

```java
package jojoldu.aop.ex.inheritance;

import java.util.List;

import org.springframework.stereotype.Service;

import jojoldu.aop.ex.common.Board;
import jojoldu.aop.ex.common.BoardRepository;

@Service
public class InheritBoardService extends SuperPerformance<Board> {

	private final BoardRepository boardRepository;

	public InheritBoardService(final BoardRepository boardRepository) {
		this.boardRepository = boardRepository;
	}

	public void save(Board board) {
		boardRepository.save(board);
	}

	@Override
	public List<Board> findAll() {
		return boardRepository.findAll();
	}
}
```

- InheritBoardController

```java
package jojoldu.aop.ex.inheritance;

import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jojoldu.aop.ex.common.Board;

@RestController
public class InheritBoardController {
	private final InheritBoardService inheritBoardService;

	public InheritBoardController(final InheritBoardService inheritBoardService) {
		this.inheritBoardService = inheritBoardService;
	}

	@PostConstruct
	public void setup() {
		for (int i = 0; i < 100; i++) {
			inheritBoardService.save(new Board(i + "번째 게시글의 제목", i + "번째 게시글의 내용"));
		}
	}

	@GetMapping("/inherit/boards")
	public List<Board> getBoards() {
		return inheritBoardService.getData();
	}
}
```

- InheritUserService

```java
package jojoldu.aop.ex.inheritance;

import java.util.List;

import org.springframework.stereotype.Service;

import jojoldu.aop.ex.common.User;
import jojoldu.aop.ex.common.UserRepository;

@Service
public class InheritUserService extends SuperPerformance<User> {

	private final UserRepository userRepository;

	public InheritUserService(final UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public void save(User user) {
		userRepository.save(user);
	}

	public List<User> findAll() {
		List<User> users = userRepository.findAll();
		return users;
	}
}
```

- InheritUserController

```java
package jojoldu.aop.ex.inheritance;

import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jojoldu.aop.ex.common.User;

@RestController
public class InheritUserController {
	private final InheritUserService inheritUserService;

	public InheritUserController(final InheritUserService inheritUserService) {
		this.inheritUserService = inheritUserService;
	}

	@PostConstruct
	public void setup() {
		for (int i = 0; i < 100; i++) {
			inheritUserService.save(new User(i + "@email.com", i + "번째 사용자"));
		}
	}

	@GetMapping("/inherit/users")
	public List<User> getBoards() {
		return inheritUserService.getData();
	}
}
```

- 실행 결과

```java
시작 시간 : 1593072316052, 끝나는 시간 1593072316140, 총 걸리는 시간 : 88 
시작 시간 : 1593072322050, 끝나는 시간 1593072322060, 총 걸리는 시간 : 10
```

- 해결사항
    - 중복 코드와 단일 책임 원칙은 지켰습니다.
- 문제점
    - 상속은 부모 클래스에 너무 종속적이기 때문에 특별한 일이 있는 경우 피하는것이 좋습니다.

## DI(Dependency Injection)

- DiSuperService

```java
package jojoldu.aop.ex.Denpency;

import java.util.List;

public interface DiSuperService<T> {
	List<T> getData();

	T save(T t);
}
```

- DiBoardPerformance

```java
package jojoldu.aop.ex.Denpency;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import jojoldu.aop.ex.common.Board;

@Primary
@Service
public class DiBoardPerformance implements DiSuperService<Board> {
	@Qualifier("DiBoardServiceImpl")
	private final DiSuperService<Board> diBoardService;

	public DiBoardPerformance(final DiBoardServiceImpl diBoardService) {
		this.diBoardService = diBoardService;
	}

	@Override
	public List<Board> getData() {
		long startTime = start();
		List<Board> boards = diBoardService.getData();
		end(startTime);
		return boards;
	}

	@Override
	public Board save(final Board board) {
		return diBoardService.save(board);
	}

	private long start() {
		return System.currentTimeMillis();
	}

	private void end(long startTime) {
		long endTime = System.currentTimeMillis();
		System.out.printf("시작 시간 : %d, 끝나는 시간 %d, 총 걸리는 시간 : %d \n",
			startTime, endTime, endTime - startTime);
	}
}
```

- DiBoardServiceImpl

```java
package jojoldu.aop.ex.Denpency;

import java.util.List;

import org.springframework.stereotype.Service;

import jojoldu.aop.ex.common.Board;
import jojoldu.aop.ex.common.BoardRepository;

@Service
public class DiBoardServiceImpl implements DiSuperService<Board> {
	private final BoardRepository boardRepository;

	public DiBoardServiceImpl(final BoardRepository boardRepository) {
		this.boardRepository = boardRepository;
	}

	@Override
	public List<Board> getData() {
		return boardRepository.findAll();
	}

	@Override
	public Board save(final Board board) {
		return boardRepository.save(board);
	}
}
```

- DiBoardController

```java
package jojoldu.aop.ex.Denpency;

import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jojoldu.aop.ex.common.Board;

@RestController
public class DiBoardController {
	private final DiSuperService<Board> diBoardService;

	public DiBoardController(final DiSuperService<Board> diBoardService) {
		this.diBoardService = diBoardService;
	}

	@PostConstruct
	public void setup() {
		for (int i = 0; i < 100; i++) {
			diBoardService.save(new Board(i + "번째 게시글의 제목", i + "번째 게시글의 내용"));
		}
	}

	@GetMapping("/di/boards")
	public List<Board> getBoards() {
		return diBoardService.getData();
	}
}
```

- DiUserPerformance

```java
package jojoldu.aop.ex.Denpency;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import jojoldu.aop.ex.common.User;

@Primary
@Service
public class DiUserPerformance implements DiSuperService<User> {
	@Qualifier("DiUserServiceImpl")
	private final DiSuperService<User> diUserService;

	public DiUserPerformance(final DiSuperService<User> diUserService) {
		this.diUserService = diUserService;
	}

	@Override
	public List<User> getData() {
		long startTime = start();
		List<User> boards = diUserService.getData();
		end(startTime);
		return boards;
	}

	@Override
	public User save(final User user) {
		return diUserService.save(user);
	}

	private long start() {
		return System.currentTimeMillis();
	}

	private void end(long startTime) {
		long endTime = System.currentTimeMillis();
		System.out.printf("시작 시간 : %d, 끝나는 시간 %d, 총 걸리는 시간 : %d \n",
			startTime, endTime, endTime - startTime);
	}
}
```

- DiUserServiceImpl

```java
package jojoldu.aop.ex.Denpency;

import java.util.List;

import org.springframework.stereotype.Service;

import jojoldu.aop.ex.common.User;
import jojoldu.aop.ex.common.UserRepository;

@Service
public class DiUserServiceImpl implements DiSuperService<User> {
	private final UserRepository userRepository;

	public DiUserServiceImpl(final UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public List<User> getData() {
		return userRepository.findAll();
	}

	@Override
	public User save(final User user) {
		return userRepository.save(user);
	}
}
```

- DiUserController

```java
package jojoldu.aop.ex.Denpency;

import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jojoldu.aop.ex.common.User;

@RestController
public class DiUserController {
	private final DiSuperService<User> diUserService;

	public DiUserController(final DiSuperService<User> diUserService) {
		this.diUserService = diUserService;
	}

	@PostConstruct
	public void setup() {
		for (int i = 0; i < 100; i++) {
			diUserService.save(new User(i + "@email.com", i + "번째 사용자"));
		}
	}

	@GetMapping("/di/users")
	public List<User> getBoards() {
		return diUserService.getData();
	}
}
```

- 실행결과

```java
시작 시간 : 1593074101934, 끝나는 시간 1593074102035, 총 걸리는 시간 : 101 
시작 시간 : 1593074105001, 끝나는 시간 1593074105014, 총 걸리는 시간 : 13
```

- 문제점
    - 코드가 깔끔하지 않고 많은 관계가 필요하다.
    - 비지니스 로직과 부가 기능들의 관계가 복잡하다.
    - 비지니스 로직을 구현할때 부가 기능 로직도 같이 생각해야 한다.

## AOP(Aspect-Oriented Programming)

### AOP란?

- 애플리케이션 전체에 걸쳐 사용되는 기능(부가 기능)을 재사용하도록 지원한다.
- 관점 지향 프로그래밍으로 프로젝트 구조를 바라 보는 관점을 바꿔보자는 이야기로, 보통 제 3자의 관점에서 바라보자 라는 이야기를 합니다.
- 기존에 OPP에서 바라보던 관점을 다르게 하여 부가기능적인 측면에서 보았을 때 공통된 요소를 추출하자는 것으로 가로 영역의 공통 부분을 잘라냈다고 하여, 크로스 컷팅(Cross-Cutting) 이라고 불립니다.
- 지금까지 살펴본 상속과 의존성 주입으로도 공통된 기능을 재사용할 수 있지만, 깔끔한 모듈화가 어렵다.

- 장점
    - 애플리케이션 전체에 흩어진 공통 기능이 하나의 장소에서 관리
    - 다른 서비스 모듈들이 본인의 목적에만 충실하고 그외 사항들은 신경쓸 필요 없다.(비지니스 로직에 집중할 수 있다.)

### OOP와 AOP

- OOP(Obejct-Oriented-Programming)
    - 모듈화의 핵심 단위는 비즈니스 로직
- AOP(Aspected-Oriented-Programming)
    - 각 모듈의 주 목적 외에 필요한 부가적 기능

## AOP 용어

- Target
    - 부가 기능을 부여하는 대상
- Aspect
    - 부가 기능 모듈
    - advice + pointCut
- Advice
    - 부가기능을 담은 구현체
    - 종속적이기 않기 때문에 부가기능에만 집중이 가능
- PointCut
    - 부가기능이 적용될 대상을 선정하는 기법
- JoinPoint
    - adivce가 적용될 수 있는 위치
    - Spring에서는 메소드 조인포인트만 제공하고 있다.
- Proxy
    - Target을 감싸서 Target의 요청을 대신 받아주는 Wrapping Object
    - 클라이언트에서 Target을 호출하면 Target이 아닌 Proxy가 호출되어, 타켓 메소드 실행전에 선처리, 타켓 메소드 실행 후, 후처리를 실행하도록 구성되어 있습니다.

- Introduction
    - 타켓 클래스에 코드 변경없이 신규 메소드나 멤버변수를 추가하는 기능
- Weaving
    - 지정된 객체에 Aspect를 적용해서 새로운 Proxy Obejc를 만드는 과정이다.
    - 런타임, 컴파일, 클래스 로더 시점이 있는데 , Spring AOP는 런타임에서 프록시 객체가 생성됩니다.

### 어노테이션 기반 AOP

- PerfLogger

```java
package jojoldu.aop.ex.aop;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Target;

@Documented
@Target(ElementType.METHOD)
public @interface PerfLogger {
}
```

- Performance

```java
package jojoldu.aop.ex.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;

@Aspect
public class Performance {
	@Around("@annotation(jojoldu.aop.ex.aop.PerfLogger)")
	public Object calculatePerformanceTime(ProceedingJoinPoint proceedingJoinPoint) {
		Object result = null;
		try {
			long startTime = System.currentTimeMillis();
			result = proceedingJoinPoint.proceed();
			long endTime = System.currentTimeMillis();

			System.out.printf("시작 시간 : %d, 끝나는 시간 %d, 총 걸리는 시간 : %d \n",
				startTime, endTime, endTime - startTime);
		} catch (Throwable throwable) {
			System.out.println(throwable.getMessage());
		}
		return result;
	}
}
```

- AopBoardService

```java
package jojoldu.aop.ex.aop;

import java.util.List;

import org.springframework.stereotype.Service;

import jojoldu.aop.ex.common.Board;
import jojoldu.aop.ex.common.BoardRepository;

@Service
public class AopBoardService {

	private final BoardRepository boardRepository;

	public AopBoardService(final BoardRepository boardRepository) {
		this.boardRepository = boardRepository;
	}

	public void save(Board board) {
		boardRepository.save(board);
	}

	@PerfLogger
	public List<Board> findAll() {
		List<Board> boards = boardRepository.findAll();
		return boards;
	}
}
```

- AopBoardController

```java
package jojoldu.aop.ex.aop;

import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jojoldu.aop.ex.common.Board;

@RestController
public class AopBoardController {
	private final AopBoardService aopBoardService;

	public AopBoardController(final AopBoardService aopBoardService) {
		this.aopBoardService = aopBoardService;
	}

	@PostConstruct
	public void setup() {
		for (int i = 0; i < 100; i++) {
			aopBoardService.save(new Board(i + "번째 게시글의 제목", i + "번째 게시글의 내용"));
		}
	}

	@GetMapping("/aop/boards")
	public List<Board> getBoards() {
		return aopBoardService.findAll();
	}
}
```

- AopUserService

```java
package jojoldu.aop.ex.aop;

import java.util.List;

import org.springframework.stereotype.Service;

import jojoldu.aop.ex.common.User;
import jojoldu.aop.ex.common.UserRepository;

@Service
public class AopUserService {

	private final UserRepository userRepository;

	public AopUserService(final UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public void save(User user) {
		userRepository.save(user);
	}

	@PerfLogger
	public List<User> findAll() {
		return userRepository.findAll();
	}
}
```

- AopUserController

```java
package jojoldu.aop.ex.aop;

import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jojoldu.aop.ex.common.User;

@RestController
public class AopUserController {
	private final AopUserService aopUserService;

	public AopUserController(final AopUserService aopUserService) {
		this.aopUserService = aopUserService;
	}

	@PostConstruct
	public void setup() {
		for (int i = 0; i < 100; i++) {
			aopUserService.save(new User(i + "@email.com", i + "번째 사용자"));
		}
	}

	@GetMapping("/aop/users")
	public List<User> getBoards() {
		return aopUserService.findAll();
	}
}
```

- 실행 결과

```java
시작 시간 : 1593076030403, 끝나는 시간 1593076030495, 총 걸리는 시간 : 92 
시작 시간 : 1593076037710, 끝나는 시간 1593076037721, 총 걸리는 시간 : 11
```

### 코드 설명

- `Around()` : advice로 Aspect가 무엇을 언제 할지를 의미한다. 여기서 무엇은 `calcualtePerformanceTime()` 입니다.
- `annotation()` : 포인트컷 표현식 중 하나로, 어노테이션을 의미합니다.
- `ProceedingJoinPoint` : `Around Advice`에서 사용할 공통 기능 메서드는 대부분 파라미터로 전달 받은 이 클래스의 `proceed()` 메서드만 호출하면 된다.
- `proceed()` : Target메소드를 지칭하는 것으로, `@Around`를 사용했다는 반드시 이 메소드가 호출되어야 합니다.