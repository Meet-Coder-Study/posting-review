> source 는 [Github](https://github.com/leechoongyon/spring-rest-docs-example) 에 있습니다.

## spring rest docs 정리
- spring rest docs 은 test 를 작성하면서 동시에 document 를 작성하는 오픈소스입니다.
- Controller Api 부분만 빠르게 테스트 하기 위해 @WebMvcTest 로 테스트 환경을 만들었습니다.

## spring rest docs 특징
- 테스트가 성공해야 document 가 작성이 됩니다.
- learning cost 가 꽤 큽니다.
    - ascii 문법을 새로 배워야 합니다.


## build.gradle 설정
- source 중간 중간에 설명을 달아놨습니다.

```groovy

plugins {
    id 'org.springframework.boot' version '2.5.1'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    id 'org.asciidoctor.convert' version '1.5.9.2' // asciiDoc 파일을 index.html 로 변경해주고 build 폴더에 copy 해주는 플러그입니다.
    id 'java'
}

ext {
    snippetsDir = file('build/generated-snippets')  // asciidoc 문서가 만들어지는 폴더 위치입니다.
}

dependencies {
    implementation('org.springframework.boot:spring-boot-starter-web')
    runtimeOnly('com.h2database:h2')
    testImplementation('org.springframework.boot:spring-boot-starter-test')
    testImplementation('org.springframework.restdocs:spring-restdocs-mockmvc')
    implementation 'org.springdoc:springdoc-openapi-ui:1.5.9'
    asciidoctor 'org.springframework.restdocs:spring-restdocs-asciidoctor'  // Mockmvc 를 restdocs 에서 사용할 수 있게 해주는 라이브러리입니다.
}

test {
    outputs.dir snippetsDir
    useJUnitPlatform()
}

asciidoctor {   // build/generated-snippets 폴더에 있는 ascii 파일들을 묶어서 index.html 으로 묶어주는 task 입니다.
    inputs.dir snippetsDir
    dependsOn test  // test task 가 실행되어야 asciidoctor
}

```

## test source
- 중간중간에 설명을 달았습니다.
- 아래 테스트를 수행하면 build/generated-snippets 폴더에 get-member, save-member 폴더가 만들어집니다.
    - build/generated-snippets 설정은 build.gradle 에서 설정이 가능합니다.
- get-member, save-member 폴더에 만들어진 파일들을 하나로 묶기 위해서는 build.gradle 에 선언한 asciidoctor task 를 실행해주면 됩니다.
- 자세한건 아래에서 설명하겠습니다.


```java

/**
 *  1. ApiCommonModule 을 만든 이유는
 *      테스트 수행 시, spring context 가 지속적으로 생성되고 소멸되기에
 *      test annotation 이 많아질수록 느려질 수 밖에 없는 구조입니다.
 *      그걸 방지하기 위해 상속클래스에서 한 번만 spring context 를 로딩하고,
 *      테스트들은 abstact 을 상속받아 해당 spring context 를 공유해서 사용하는 것입니다.
 *      이렇게 할 경우 성능 향상이 있습니다.
 */
@RunWith(SpringRunner.class)
// WebMvc 관련 가벼운 테스트를 위해 설정합니다. SpringBootTest 는 IocContainer 띄우기에 느립니다.
@WebMvcTest(controllers = {
        MemberApiControllerTest.class,
})
// spring rest docs 에 대한 auto-configuration 을 가능하게 해주는 annotation 입니다.
// 자동 구성은 MockMvc 기반, WebTestClient, Http 를 통한 웹 애플리케이션의 RestAssured 기반 테스트를 설정합니다.
@AutoConfigureRestDocs
public abstract class ApiCommonModule {
  @Autowired
  protected MockMvc mockMvc;

  @Autowired
  protected ObjectMapper objectMapper;

  @MockBean
  protected MemberApiService memberApiService; // controller api 테스트이기에 service 는 mocking 처리 합니다.
}



--------------------------------------------------------------


public class MemberApiControllerTest extends ApiCommonModule {
  @Test
  public void getMemberTest() throws Exception {
    this.mockMvc.perform(get("/api/member/{id}",5)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andDo(document("get-member",   // get-member 라는 이름으로 asciidoc 문서가 만들어집니다.
                    DocumentUtils.getDocumentRequest(), // 문서를 이쁘게 출력합니다.
                    DocumentUtils.getDocumentResponse(),    // 문서를 이쁘게 출력합니다.
                    pathParameters( // id 가 url 뒤에 붙는 변수이기에 PathParameters 로 설정해줍니다.
                            parameterWithName("id").description("member id")
                    ),
                    responseFields( // responseField 를 써줍니다.
                            fieldWithPath("id").description("member id"),
                            fieldWithPath("name").description("member name")
                    )
            ))
            .andExpect(jsonPath("$.id", is(notNullValue())))    // id 가 notNull 이 아닌 것을 확인합니다.
            .andExpect(jsonPath("$.name", is(notNullValue())))  // name 이 notNull 이 아닌 것을 확인합니다.
    ;
  }

  @Test
  public void saveMemberTest() throws Exception {
    // given
    MemberCreateRequest request = MemberCreateRequest.builder()
            .name("test")
            .age(20)
            .build();
    MemberCreateResponse response = MemberCreateResponse.builder()
            .name("test")
            .id(1L)
            .age(20)
            .build();

    when(memberApiService.saveMember(any())).thenReturn(response);  // service 에 대한 mocking 입니다.

    String content = objectMapper.writeValueAsString(request);

    this.mockMvc.perform(post("/api/member")
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.name").value("test"))
            .andExpect(jsonPath("$.age").value(20))
            .andDo(document("save-member",
                    requestFields(
                            fieldWithPath("name").description("member name"),
                            fieldWithPath("age").description("member age").optional()   // optional 을 주면 필수 값이 아닙니다.
                    ),
                    responseFields(
                            fieldWithPath("id").description("member id"),
                            fieldWithPath("name").description("member name"),
                            fieldWithPath("age").description("member age")
                    )
            ))
    ;
  }
}


```


## 통합 문서 파일 만들기
- ascciidoctor task 를 실행하기 전, src/docs/asciidoc/index.adoc 파일을 수정해줘야 합니다.

```text
= Member API
:doctype: book
:icons: font
:source-highlighter: highlightjs
:toc: left
:toclevels: 4
:sectlinks:

== 1. Member Api

== 1.1 getMember API

operation::get-member[snippets='curl-request,http-request,http-response,response-fields']


== 1.2 saveMember API
operation::save-member[snippets='curl-request,http-request,request-fields, http-response,response-fields']

```


## 결론
- spring-rest-docs 를 이용해서 테스트하며, 문서를 작성할 수 있습니다.
- ascii 관련 문법은 추가로 계속 정리해나갈 예정입니다.

## reference
- https://techblog.woowahan.com/2597/
- https://techblog.woowahan.com/2678/