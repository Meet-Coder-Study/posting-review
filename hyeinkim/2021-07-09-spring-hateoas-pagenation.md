# Spring HATEOAS - Pagination link 만들기 
페이징 처리된 목록 조회 API에 Spring HATEOAS로 link를 적용한다.

- Spring Web
- Spring Data JPA
- Spring HATEAOS 
- H2

## Spring HATEOAS?
- Spring, Spring MVC에서 HATEOAS 원칙을 따르는 REST 표현을 쉽게 만들 수 있는 API를 제공
- link creation, representation assembly

> HATEOAS? : 클라이언트에 응답할 때 결과 데이터만 제공해주기보다 URI를 함께 제공해야 한다는 원칙

### Spring HATEOAS 1.x에서 바뀐 점 : Representation models
- `ResourceSupport` -> `RepresentationModel`
- `Resource` -> `EntityModel`
- `Resources` ->  `CollectionModel`
- `PagedResources` -> `PagedModel`

- `ResourceAssembler` -> `RepresentationModelAssembler`
    - `toResource(...)` -> `toModel(...)`
    - `toResources(…)` -> `toCollectionModel(…)`

처음에 강의를 따라하면서 예제를 만드려고 했는데 import가 되지 않아 당황했다. 레퍼런스를 찾아보니 Spring HATEOAS 1.0부터 클래스명이 싹 다 변경되었다...ㅎ 

> [더보기](https://docs.spring.io/spring-hateoas/docs/current/reference/html/#preface) 

## Pagination link 만들기

### Spring HATEOAS 의존성 추가
```
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-hateoas'
}
```
### 목록 조회 API
```java
    @GetMapping
    public ResponseEntity<Page<Board>> list(@PageableDefault(size = 5, sort="createdDate") Pageable pageable) {
        return new ResponseEntity<>(boardService.findBoards(pageable), HttpStatus.OK);
    }
```
게시글 전체 목록을 조회하는 API다. 5개씩 페이징, 등록일 순으로 정렬이 되어 출력된다. 
이 API에 필요한 Pagination link를 생성해야 한다. Spring HATEOAS에는 아래와 같은 모듈로 손쉽게 Pagenation link를 만들어준다. 


- `EntityModel<T>` : 도메인 객체에 links를 추가하여 wrapping한 모델
- `PagedModel<T>` : Pageable Collections 모델
- `PagedResourcesAssembler<T>` : 엔티티 타입의 PageModel를 만들어준다.
    - `toModel(Page<T> entity)`
    - `toModel(Page<T> page, Link selfLink)`
    - `toModel(Page<T> page, RepresentationModelAssembler<T, R> assembler)`

```java
    @GetMapping
    public ResponseEntity<PagedModel<EntityModel<Board>>> list(@PageableDefault(size = 5, sort="createdDate") Pageable pageable, PagedResourcesAssembler<Board> assembler) {
        Page<Board> boards = boardService.findBoards(pageable);
        return new ResponseEntity<>(assembler.toModel(boards), HttpStatus.OK);
    }
```

```json
{
    "_embedded": {
        "boardList": [
            {
                "id": 1,
                "title": "title1",
                "content": "content1",
                "createdDate": "2021-07-08T23:02:22.597",
                "updatedDate": "2021-07-08T23:02:22.597"
            },
            {
                "id": 2,
                "title": "title2",
                "content": "content2",
                "createdDate": "2021-07-08T23:02:22.672",
                "updatedDate": "2021-07-08T23:02:22.672"
            },
            ...
        ]
    },
    "_links": {
        "first": {
            "href": "http://localhost:8080/api/v1/boards?page=0&size=5&sort=createdDate,asc"
        },
        "self": {
            "href": "http://localhost:8080/api/v1/boards?page=0&size=5&sort=createdDate,asc"
        },
        "next": {
            "href": "http://localhost:8080/api/v1/boards?page=1&size=5&sort=createdDate,asc"
        },
        "last": {
            "href": "http://localhost:8080/api/v1/boards?page=3&size=5&sort=createdDate,asc"
        }
    },
    "page": {
        "size": 5,
        "totalElements": 20,
        "totalPages": 4,
        "number": 0
    }
}
```

- 상태 전이를 위한 `first`, `self`, `next`, `last` 링크가 제공된다.
- 각각의 엔티티에 대한 링크를 생성하려면 `RepresentationModelAssembler`을 통해 구현하면 된다.

# 참고자료
- [Spring HATEOAS - pagination link](https://howtodoinjava.com/spring5/hateoas/pagination-links/)
- [Spring HATEOAS Reference](https://docs.spring.io/spring-hateoas/docs/current/reference/html/#preface)