# 노션 API 활용

# 1. 노션 API란?

최근 노션 API가 개인 무료 사용자에게도 오픈되었다.

노션을 자주 사용하는 사용자의 입장으로 노션 API를 통해 다양한 것들을 할 수 있기에 이전부터 사이드 프로젝트에 활용하고자 노리고 있었는데 최근에 유튜브를 뒤적거리다 노마드 코더가 노션 API를 소개하는 영상을 찍은 것을 보고 이제야 기억나 테스트를 해보고자 블로그를 작성하게 되었다.

노션 API를 통해서 다양한 것들을 할 수 있다. 실제로 예전에 매일매일 어떤 것을 하고 수행했는지 안했는지를 서로 확인하는 스터디를 했을 때 어떤 개발자 분이 카톡방에 인증샷과 함께 `[닉네임] 인증` 으로 닉네임과 함께 오늘의 한 일을 인증하면, 노션 데이터베이스에 체크박스가 자동으로 체크되는 기능을 통해 스터디 인증을 했던 적도 있다. 

노션 데이터베이스 API를 통해 위 사례와 같이 노션을 마치 사이드 프로젝트의 데이터베이스와 같이 활용하여 DB를 조회, 삭제, 수정 등을 모두 할 수 있으며 혹은 페이지 API 등을 통해 새로운 페이지들을 생성하고 다른 사람들에게 공유할 수도 있다. 이러한 API를 통해 나만의 웹사이트를 구축하여 해당 데이터들을 잘 정제해 보여준다면 더욱 활용도가 높을 것이다.

## 2. 노션 API 사용하기

노션 API 사용하는 방법에 대해서는 노션 공식 가이드에서 잘 설명해주고 있다.

간단하게 설명하고 있는 것을 따라해본 후에 사용해볼 만한 API 몇 가지를 테스트해보려 한다.

[Start building with the Notion API](https://developers.notion.com/docs)

### 2.1 노션 API Integration 생성하기

1. 우선 [`https://www.notion.so/my-integrations`](https://www.notion.so/my-integrations) 링크로 이동한다.
2. 해당 링크에서 자신의 계정으로 로그인하면 아래와 같이 ‘내 API 통합'이라는 창이 뜨면 `새 API 통합 만들기`버튼을 클릭한다.
3. 버튼을 클릭하면 내가 해당 API 토큰에 부여할 권한들을 선택할 수 있다. 자격정보에 콘텐츠 읽기 , 업데이트, 입력, 댓글 읽기, 댓글 삽입 등의 권한을 부여할 수 있다. 기본 정보인 이름과 권한을 작성하고 API 통합 유형은 ‘프라이빗 API 통합'을 선택한다.

![Untitled](https://user-images.githubusercontent.com/37948906/180998180-66ffa56a-bf93-47ea-a21f-35b9eb83e66d.png)

![Untitled 1](https://user-images.githubusercontent.com/37948906/180998142-20c2dc59-0a9f-484f-be2e-bce7588522b0.png)

1. 위와 같이 변경사항을 저장한 뒤 나오면 아래와 같은 형식의 API 토큰이 발급된다. 해당 토큰을 잘 복사해둔다.

```
secret_UnKXXXAtcXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

1. 이제 토큰이 정상적으로 생성되었고 우리의 Application과 연결할 수 있게 되었다.

![Untitled 2](https://user-images.githubusercontent.com/37948906/180998155-94acc82e-a61e-4c67-80ac-e1cbbeb457c9.png)

## 2.2 간단한 데이터베이스 생성하고 API와 통합하기

1. 간단하게 노션에 데이터베이스를 생성한다.

데이터베이스 인라인은 페이지 내에 데이터베이스를 생성하는 것이고, 전체 페이지는 새로운 페이지로 만드는 것이다. 지금은 ‘전체 페이지'를 선택하여 생성한다.

![Untitled 3](https://user-images.githubusercontent.com/37948906/180998163-8f6d3fed-df96-4c44-809a-986064b6ae72.png)

![Untitled 4](https://user-images.githubusercontent.com/37948906/180998166-05b15611-2bdb-4d9c-b84c-157fbf10d5db.png)

데이터베이스를 생성하는 방법은 이미 잘 사용하고 있는 기능이라고 생각하고 자세한 내용은 생략한다. 만약 필요하다면 아래 블로그의 데이터베이스 생성 파트를 참고하자.

[노션 웹 클리퍼 사용하기](https://hirlawldo.tistory.com/154)

1. 나의 데이터베이스를 방금 만들었던 API 통합을 선택하여 공유한다.

<img width="524" alt="Untitled 5" src="https://user-images.githubusercontent.com/37948906/180998168-4bf9bec5-5ca5-4c76-89d6-f384ec6b9c84.png">

1. 정상적으로 추가되었다면 아래와 같이 API 통합이 가능하게 된다. API를 통해 데이터베이스 편집 기능을 사용할 수 있게 하려면 편집 허용으로 선택한다.

<img width="535" alt="Untitled 6" src="https://user-images.githubusercontent.com/37948906/180998171-1cd3ff0e-3463-4bcf-ab64-e109deee107c.png">

1. 생성한 데이터베이스의 ID를 복사한다.

웹 페이지에서 들어갔다면 웹 사이트 주소의 [https://www.notion.so/](https://www.notion.so/) 뒤에 ? 전까지 붙는 것이 데이터베이스 아이디 값이다. 앱에서 들어갔다면 링크 복사를 클릭하면 아래와 같은 URL이 복사되므로 중간 데이터베이스 아이디 값만 체크한다.

```
https://www.notion.so/**aa939347XXXXXXXXc4ad7b4**?v=938f55b6dd6b46da923a30dc260be82a
```

Database ID

```kotlin
**aa939347XXXXXXXXc4ad7b4**
```

[https://www.notion.so/aa939347233444dab2444c9a8c4ad7b4?v=938f55b6dd6b46da923a30dc260be82a](https://www.notion.so/aa939347233444dab2444c9a8c4ad7b4)

## 3. 본격적으로 어플리케이션에서 API 호출하기

### 3.1 데이터 셋팅하기

노션 공식 홈페이지에서 추천해주는 방법 중 하나인 JS 노션 클라이언트를 이용해서 노션 API를 활용해 보자. 먼저 방금 만들었던 노션의 토큰(키) 값과 데이터베이스 아이디를 아래와 같이 변수로 지정해둔다.

```kotlin
$ mkdir notion-example
$ cd notion-example
$ export NOTION_KEY=secret_UnXXXXXXkKPXXXXXXX
$ export NOTION_DATABASE_ID=aa939347233444daXXXXX
```

### 3.2 index.js 파일 생성하기

`index.js`

```
$ vi index.js
```

```kotlin
import { Client } from "@notionhq/client"

const notion = new Client({ auth: process.env.NOTION_KEY })

const databaseId = process.env.NOTION_DATABASE_ID

async function addItem(text) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: { 
          title:[
            {
              "text": {
                "content": text
              }
            }
          ]
        }
      },
    })
    console.log(response)
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }
}

addItem("Clean-Code-Architecture")
```

### 3.3 package.json 파일 생성하기

`package.json`

```
$ vi package.json
```

```kotlin
{
  "name": "notion-example",
  "type": "module",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "dependencies": {
    "@notionhq/client": "^1.0.1"
  } 
}
```

### 3.4 node 설치하고 실행하기

```json
$ npm install

added 13 packages, and audited 14 packages in 3s

found 0 vulnerabilities
npm notice
npm notice New minor version of npm available! 8.12.1 -> 8.15.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v8.15.0
npm notice Run npm install -g npm@8.15.0 to update!
npm notice
```

```kotlin
$ node index.js
{
  object: 'page',
  id: '970d0ec9-60c8-XXXXXXXf4a',
  created_time: '2022-07-23T13:08:00.000Z',
  last_edited_time: '2022-07-23T13:08:00.000Z',
  created_by: { object: 'user', id: '183e0ebf-XXXXXXXf67c' },
  last_edited_by: { object: 'user', id: '183e0ebf-b6XXXXXXff4f2ef67c' },
  cover: null,
  icon: null,
  parent: {
    type: 'database_id',
    database_id: 'aa939347-2334-44da-b244-4c9a8c4ad7b4'
  },
  archived: false,
  properties: {
    created: {
      id: 'SIL%7B',
      type: 'created_time',
      created_time: '2022-07-23T13:08:00.000Z'
    },
    read: { id: 'VWbU', type: 'checkbox', checkbox: false },
    tag: { id: '_lTZ', type: 'multi_select', multi_select: [] },
    title: { id: 'title', type: 'title', title: [Array] }
  },
  url: 'https://www.notion.so/Clean-Code-Architecture-970d0ecXXXXXX58b4d878f4a'
}
```

- 만약 404 에러가 발생한다면?
    
    만약 데이터베이스를 정상적으로 공유하지 않았다면 아래와 같은 에러가 발생하므로 다시 확인한다.
    
    ```json
    $ node index.js
    @notionhq/client warn: request fail {
      code: 'object_not_found',
      message: 'Could not find database with ID: aa93XXXXXXXXXXXXad7b4. Make sure the relevant pages and databases are shared with your integration.'
    }
    {"object":"error","status":404,"code":"object_not_found","message":"Could not find database with ID: aa939347-2334-44da-b244-4c9a8c4ad7b4. Make sure the relevant pages and databases are shared with your integration."}
    ```
    

### 3.5 생성된 데이터베이스 데이터 확인하기

![Untitled 7](https://user-images.githubusercontent.com/37948906/180998173-d14532da-ae91-4797-9abc-2824fd7eeada.png)

위와 같이 Notion API를 통해 node.js 에서 넣은 ‘Clean Code Architecture’라는 데이터가 성공적으로 들어갔음을 확인할 수 있다.

## 4. Notion API 추가 활용

### 4.1 노션 API Document 확인하기

노션 API는 위와 같이 Application에서도 활용할 수 있고 API를 직접 호출해서도 확인할 수 있다.

Developer를 위한 노션 API Document는 아래에 잘 설명해주고 있으니 참고하자.

[Start building with the Notion API](https://developers.notion.com/reference/database)

위에서 생성했던 데이터베이스나 페이지에 대한 정보를 불러오고, 업데이트하고, 생성하는 다양한 기능들이 있는데  Application에서 직접 호출하기 전에 Postman으로 DB 쿼리하는 API에 대해 테스트를 해보려 한다.

### 4.2 포스트맨 환경설정 해두기 (버전, Key)

postman environment에 간단하게 아까 생성했던 Notion API Key와 Notion Version 값을 넣어둔다.

이때 가장 최신 버전인 2022-06-28에서 페이로드를 줄이기 위해 기존에 디테일하게 반환하던 데이터들을 간략하게 줄였다. 나는 간단한 테스트용으로 확인하는 거라 이전 버전인 2022-02-22 버전을 사용하여 확인하겠다.

![Untitled 8](https://user-images.githubusercontent.com/37948906/180998175-b3959747-3a47-4b79-a660-4e73ff6f0099.png)

노션 API 버전별 차이는 아래 링크를 참고한다.

[Start building with the Notion API](https://developers.notion.com/reference/changes-by-version)

### 4.3 포스트맨을 통해 노션 API 호출하기

POST POST https://api.notion.com/v1/databases/{database-id}/query

위와 같은 URL에 다양한 필터를 사용해서 검색을 할 수 있다. 예를 들면 ‘read’라는 체크 박스를 생성해두고 읽은 책들의 리스트만 가져오는 필터를 통해 해당 리스트를 조회할 수 있다. 헤더에는 아까 환경설정에서 생성해둔 값들을 넣는다.

```json
POST https://api.notion.com/v1/databases/aa939347233444dab2444c9a8c4ad7b4/query
```

```json
**Header**
Authorization: {{NOTION_API_KEY}}
Notion-Version: {{NOTION_OLD_VERSION}}
```

```json
{
    "filter": {
        "and": [
            {
                "property": "read",
                "checkbox": {
                    "equals": true
                }
            }
        ]
    }
}
```

위 API를 포스트맨으로 호출하면 아래와 같은 쿼리 결과를 얻을 수 있다.

```json
{
    "object": "list",
    "results": [
        {
            "object": "page",
            "id": "c04072b2-2749-48c6XXXXX3a5d65db8",
            "created_time": "2022-07-23T11:22:00.000Z",
            "last_edited_time": "2022-07-23T13:07:00.000Z",
            "created_by": {
                "object": "user",
                "id": "d0263b7e-7cc8-XXXXX31f1fa1ceffe"
            },
            "last_edited_by": {
                "object": "user",
                "id": "d0263b7e-7cc8-XXXXX3fa1ceffe"
            },
            "cover": null,
            "icon": null,
            "parent": {
                "type": "database_id",
                "database_id": "aa939347-233XXXXX39a8c4ad7b4"
            },
            "archived": false,
            "properties": {
                "created": {
                    "id": "SIL%7B",
                    "type": "created_time",
                    "created_time": "2022-07-23T11:22:00.000Z"
                },
                "read": {
                    "id": "VWbU",
                    "type": "checkbox",
                    "checkbox": true
                },
                "tag": {
                    "id": "_lTZ",
                    "type": "multi_select",
                    "multi_select": [
                        {
                            "id": "328a2ccc-c1fXXXXX38-63dcb3f887e6",
                            "name": "자기계발",
                            "color": "orange"
                        }
                    ]
                },
                "title": {
                    "id": "title",
                    "type": "title",
                    "title": [
                        {
                            "type": "text",
                            "text": {
                                "content": "데일 카네기의 인간관계론",
                                "link": null
                            },
                            "annotations": {
                                "bold": false,
                                "italic": false,
                                "strikethrough": false,
                                "underline": false,
                                "code": false,
                                "color": "default"
                            },
                            "plain_text": "데일 카네기의 인간관계론",
                            "href": null
                        }
                    ]
                }
            },
            "url": "https://www.notion.so/c0XXXXX35d3a5d65db8"
        }
    ],
    "next_cursor": null,
    "has_more": false,
    "type": "page",
    "page": {}
}
```

![Untitled 9](https://user-images.githubusercontent.com/37948906/180998177-2714a0ad-73dd-41ba-8d49-82dd2070b1ee.png)

## 5. 마무리

이와 같이 노션에서 제공해주는 Open API를 통해 노션 데이터베이스뿐만 아니라 노션 페이지, 댓글 등도 작성할 수 있다. 다양한 곳에서 노션을 활용하고 있는 만큼, 노션 API를 통해 자신의 어플리케이션을 만들어보는 것도 사이드 프로젝트에 활용할만할 것 같아 소개한다.