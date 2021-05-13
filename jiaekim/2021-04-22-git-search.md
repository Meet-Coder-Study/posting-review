# Github 똑똑하게 검색하기

항상 사용하는 깃헙. 우리는 깃헙을 똑똑하게 사용하고 있을까?
가끔 코드를 검색하거나 다른 레포를 염탐하면서 코드를 구경할 때나 다른 사람 코드를 참고할 때 사용하기 좋은 다양한 깃헙 검색 방법에 대해 알아보자

### 1. Go to file
바로 파일을 검색할 수 있는 편하지만 은근히 사람들이 모르는 기능

![20210422-1](https://user-images.githubusercontent.com/37948906/115726798-03ee6180-a3be-11eb-952e-0d1177a03b44.PNG)
- Go to file을 누른다.

![20210422-2](https://user-images.githubusercontent.com/37948906/115726796-0355cb00-a3be-11eb-90c5-3d92780958d4.PNG)
- 파일 이름을 검색해서 바로 해당 파일로 이동할 수 있다.

### 2. Repository 검색하기

#### 2.1 저장소 이름, 저장소 설명, README 파일의 내용 등으로 검색하기
| 지시자 | 예시 | 설명 |
| - | - | - |
| `in:name` | [spring in:name](https://github.com/search?q=spring+in%3Aname&type=Repositories) | 레포지토리에 'spring'이라는 이름이 있는 레포지토리를 검색한다.|
| `in:description` | [spring batch in:description](https://github.com/search?q=spring+batch+in%3Aname%2Cdescription&type=Repositories) | 레포지토리 설명에 'spring batch'라는 설명이 있는 레포지토리를 검색한다. |
| `in:readme` | [spring jpa in:readme](https://github.com/search?q=spring+jpa+in%3Areadme&type=Repositories) | readme에 'spring jpa'라는 설명이 있는 레포지토리를 검색한다. |
| `repo:owner/name` | [repo:Meet-Coder-Study/posting-review](https://github.com/search?q=repo%3AMeet-Coder-Study%2Fposting-review) | 특정 레포 이름에 해당하는 것을 검색한다. |

#### 2.2 사용자 또는 조직의 저장소 내에서 검색하기
| 지시자 | 예시 | 설명 |
| - | - | - |
| `user:USERNAME` | [user:pkch93 forks:>=2](https://github.com/search?q=user%3Apkch93+forks%3A%3E%3D2&type=Repositories) | 특정 유저 이름과 특정 조건을 통해 레포를 검색할 수 있다. |
| `org:ORGNAME` | [org:Meet-Coder-Study](https://github.com/search?q=org%3AMeet-Coder-Study&type=Repositories) | 특정 조직과 특정 조건을 통해 조직 내 레포를 검색할 수 있다. |

#### 2.3 팔로워 수로 검색하기
| 지시자 | 예시 | 설명 |
| - | - | - |
| `followers:n` | [kubernetes followers:>=10000](https://github.com/search?q=kubernetes+followers%3A%3E%3D10000) | 일정 팔로워 이상되는 레포를 검색할 수 있다. |
| | [kubernetes followers:100..1000](https://github.com/search?q=kubernetes+followers%3A100..1000&type=Repositories) | kubernetes라는 단어를 언급하면서 100 ~ 1000명의 팔로워가 있는 저장소와 일치한다.

#### 2.4 포크 수로 검색하기
| 지시자 | 예시 | 설명 |
| - | - | - |
| `forks:n` | [forks:5](https://github.com/search?q=forks%3A5&type=Repositories) | 포크가 5 개인 저장소와 일치합니다. |
| | [forks:>=205](https://github.com/search?q=forks%3A%3E%3D205&type=Repositories) | 최소 205 개의 포크가있는 저장소와 일치합니다. |
| | [forks:<90](https://github.com/search?q=forks%3A%3C90&type=Repositories) | 포크가 90 개 미만인 저장소와 일치합니다. |
| | [forks:10..20](https://github.com/search?q=forks%3A10..20&type=Repositories) |  10 ~ 20 개의 포크가있는 저장소와 일치합니다. |

#### 2.5 Star 수로 검색하기
| 지시자 | 예시 | 설명 |
| - | - | - |
| `stars:n` | [stars:500](https://github.com/search?utf8=%E2%9C%93&q=stars%3A500&type=Repositories) | 정확히 500 개의 별이있는 저장소와 일치합니다. |
| | [stars:10..20](https://github.com/search?q=stars%3A10..20+size%3A%3C1000&type=Repositories) | 10부터 20 사이의 별을 받은 저장소와 일치합니다. |
| | [stars:>=500 fork:true language:java](https://github.com/search?q=stars%3A%3E%3D500+fork%3Atrue+language%3Ajava&type=Repositories) | 자바로 작성된 fork 된 별을 포함하여 최소 500개의 별이 있는 저장소와 일치합니다. |

#### 2.6 저장소가 생성되었거나 마지막으로 업데이트 된 시기로 검색
| 지시자 | 예시 | 설명 |
| - | - | - |
| `created:YYYY-MM-DD` | [webos created:<2011-01-01](https://github.com/search?q=webos+created%3A%3C2011-01-01&type=Repositories) | 2011 년 이전에 생성 된 "webos"라는 단어가있는 저장소와 일치합니다. |
| `pushed:YYYY-MM-DD` | [css pushed :> 2013-02-01](https://github.com/search?utf8=%E2%9C%93&q=css+pushed%3A%3E2013-02-01&type=Repositories) | 2013 년 1 월 이후에 푸시 된 "css"라는 단어가있는 저장소와 일치합니다. | 
| | [case pushed:>=2013-03-06 fork](https://github.com/search?q=case+pushed%3A%3E%3D2013-03-06+fork%3Aonly&type=Repositories) |

#### 2.7 언어로 검색
| 지시자 | 예시 | 설명 |
| - | - | - |
| `language:LANGUAGE` | [shopping-mall language:java](https://github.com/search?q=shopping-mall+language%3Ajava) | 자바 언어로 작성되고 shopping-mall 단어를 포함한 레포지토리를 검색합니다. |


### 3. 코드 검색하기

#### 3.1 파일 내용 또는 파일 경로로 검색
| 지시자 | 예시 | 설명 |
| - | - | - |
| `in:file` | [password in:file](https://github.com/search?q=password+in%3Afile&type=Code) | 파일 내용에 'password'가 나타나는 코드와 일치합니다. |
| `in:path` | [config in:path](https://github.com/search?q=config+in%3Apath&type=code) | 파일 경로에 'application.propertes'가 나타나는 코드와 일치합니다. |

#### 3.2 파일 이름으로 검색
| 지시자 | 예시 | 설명 |
| - | - | - |
| `filename:FILENAME` | [filename:application.properties password](https://github.com/search?q=filename%3Aapplication.properties&type=code) | 파일 이름이 'application.properties'이고 내용에 password가 포함된 코드를 검색한다. |
| | [filename:.vimrc commands](https://github.com/search?q=filename%3A.vimrc+commands&type=Code) | 확장자가 .vimrc이고 commands를 포함한 파일을 검색한다.|
| | [filename:test_helper path:test language:ruby](https://github.com/search?q=minitest+filename%3Atest_helper+path%3Atest+language%3Aruby&type=Code) | 루비 파일이고 이름은 test_helper이며 test 디렉토리에 포함된 파일을 검색한다. |

#### 3.3 확장자로 검색하기
| 지시자 | 예시 | 설명 |
| - | - | - |
| `extension:EXTENSION` | [form path:image extension:py](https://github.com/search?q=form+path%3Aimage+extension%3Apy&type=Code) | 파일이 .py 확장자이고 path에 image가 포함되며 form이라는 내용을 포함한 코드 검색 | 


---
### 후기

어떻게 이렇게 깃헙 검색이 빠를까? 구현한 코드 진짜 보고 싶다...

잡다하지만 어딘가 쓰이지 않을까.. 어딘가 유용하게 쓰는 분이 있기를..ㅎㅎ

이 방법으로 몇 개 실험해보다가 몇몇 괜찮아보이는 레포를 발견했다.
- [무료 프로그래밍 책 모아둔 레포](https://github.com/EbookFoundation/free-programming-books)
- [코딩인터뷰 레포 (영어주의)](https://github.com/jwasham/coding-interview-university)
- [개발자 로드맵](https://github.com/kamranahmedse/developer-roadmap)

### 참고링크
[깃헙 검색하기](https://docs.github.com/en/github/searching-for-information-on-github)