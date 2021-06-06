# Kotlin DSL

- DSL(Domain-Specific Language)
- 도메인 특화 언어
- 선언적 언어
- 특정 주제에 특화된 언어
- 대표예시: DB 에 접근하기 위한 SQL
- 코틀린에서는 고차함수와 람다식을 이용하여 읽기 좋고 간략한 코드 생성이 가능

# Background Knowledge

## Function literals with receiver(수신객체지정함수)

- 수신객체까지 지정된 함수 타입이다
- `A.(B) -> C` : A(수신객체) 타입의 함수 B를 실행하여 C를 리턴
- 확장함수와 비슷하다.
- 함수 본문 내에서 수신 개체의 멤버에 접근 가능

## Scope Function

- 코틀린 표준 라이브러리
- 객체 컨텍스트 내에서 코드 블록을 실행하는 것이 유일한 목적인 함수
- 객체내의 코드블럭 함수를 호출하는 것과 같음
- syntactic sugar 와 같다. 표현을 더 쉽게 해주는 것뿐이다.
- 표현방식의 차이일뿐 예시1과 예시2의 동작은 같다.

```kotlin
// 예시1
Person("Better", 20, "Seoul").let {
    println(it)
    it.moveTo("London")
    it.incrementAge()
    println(it)
}
// 예시2
val alice = Person("Better", 20, "Seoul")
println(alice)
alice.moveTo("London")
alice.incrementAge()
println(alice)
```

```text
// 출력결과
Person(name=Better, age=20, city=Seoul)
Person(name=Better, age=21, city=London)
```

- run, let, also, apply, with
- 각 scope function 에 대한 차이는 2가지로 구분된다.
  > - The way to refer to the context object
  > - The return value.

| Function |    Object reference |    Return value |    Is extension function |
|---|---|---|---|
| let    | it    | Lambda result | Yes |
| run    | this    | Lambda result    | Yes |
| run    | -    | Lambda result    | No: called without the context object |
| with    | this    | Lambda result | No: takes the context object as an argument. |
| apply    | this    | Context object    | Yes |
| also    | it    | Context object    | Yes |

# Type-Safe Builder (DSL)

- 수신객체지정함수를 사용하여 빌더를 만들면 타입이 정적으로 지정된 안전한 빌더를 만들 수 있다.
- 복잡한 계층적 데이터 구조를 선언 방식으로 구축하는 데 적합한 Kotlin 기반 도메인 별 언어 (DSL)를 만들 수 있다.

## 만들어보기

```kotlin
fun introduction() = Resume().introduce {
    name("김배럴")
    company("우테코코")
    skills {
        soft("problem solving")
        soft("Good communication")
        hard("Kotlin")
    }
    languages {
        "Korean" level 5
        "English" level 3
    }
}


fun main() {
    introduction()
}
```

```kotlin
class Resume {
    lateinit var name: String
    lateinit var company: String
    lateinit var skill: Skill
    lateinit var languages: Languages

    fun introduce(function: Resume.() -> Unit): Resume {
        this.function()
        return this
    }

    fun name(s: String) {
        name = s
    }

    fun company(s: String) {
        company = s
    }

    fun skills(function: Skill.() -> Unit) {
        val skill = Skill()
        skill.function() // 1        
        // skill.apply(function) //2
        // skill.apply { function() } //3
        // 1,2,3 의 작동은 같다 하지만 2,3 은 syntactic sugar 같은 방식으로 영미권 사람들이 코드를 읽을때 더 읽기 좋다고 한다.
        this.skill = skill
    }

    fun languages(function: Languages.() -> Unit) {
        val languages = Languages()
        languages.apply { function() }
        this.languages = languages
    }

}
```

```kotlin
class Languages {
    val languages = HashMap<String, Int>()

    infix fun String.level(level: Int) {
        languages[this] = level
    }

}

class Skill {
  val softSkills = mutableListOf<String>()
  val hardSkills = mutableListOf<String>()

  fun soft(s: String) {
    softSkills.add(s)
  }

  fun hard(s: String) {
    hardSkills.add(s)
  }

}

```

### TEST CODE

```kotlin
internal class ResumeTest {

  @Test
  internal fun introduce() {
    val introduce: Resume = Resume().introduce {
      name("김배럴")
      company("우테코코")
      skills {
        soft("problem solving")
        soft("Good communication")
        hard("Kotlin")
      }
      languages {
        "Korean" level 5
        "English" level 3
      }
    }
    assertThat(introduce.name).isEqualTo("김배럴")
    assertThat(introduce.company).isEqualTo("우테코코")
    assertThat(introduce.skill.softSkills).hasSize(2)
    assertThat(introduce.skill.softSkills[0]).isEqualTo("problem solving")
    assertThat(introduce.skill.softSkills[1]).isEqualTo("Good communication")
    assertThat(introduce.skill.hardSkills).hasSize(1)
    assertThat(introduce.skill.hardSkills[0]).isEqualTo("Kotlin")

    assertThat(introduce.languages.languages).hasSize(2)
    assertThat(introduce.languages.languages["Korean"]).isEqualTo(5)
    assertThat(introduce.languages.languages["English"]).isEqualTo(3)

  }
}
```

# 참고

- [kotlin 공식문서 type-safe-builder](https://kotlinlang.org/docs/type-safe-builders.html#full-definition-of-the-comexamplehtml-package)
- [kotlin 공식문서 scope-function](https://kotlinlang.org/docs/scope-functions.html#function-selection)