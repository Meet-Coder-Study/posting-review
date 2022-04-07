## 제목은 자바 오류를 찾아서 라고 하겠습니다. (근데 이제 면접 준비를 곁들인..?)

Java 버전과 관련하여 흥미로웠던 경험이 있어 저의 경험도 공유하고 다른분들의 경험도 들어보면 좋을 것 같아 쉬어가는 타임으로 주제를 정해보았습니다.

### 발단

이직준비 스터디에서 이런 저런 얘기를 하다가 어떤분이 면접에서 받은 질문을 공유해주셨습니다.

<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcyiHtt%2Fbtryww7zzwL%2Fh2lqQB72gGTPEu3pssgWl1%2Fimg.png">
(음.. 굳이 그렇게 할 필요 없는데 왜 그렇게 까지 해야하지?)

하지만 진정한 개발자는 궁금한게 많아야 이력서에도 쓸게 많고 면접에서도 좋으니까 알아보기로 했습니다.

<br>

### 전개

<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbS4qvH%2FbtryxImnBLV%2FXhzZqcAMISr2j0FLDweURk%2Fimg.png" width="400px">

개발자는 역시 구글링이지! 그래서 일단 구글 창을 켜보았습니다.  
근데 검색을 어떻게 해야.. 저 문제의 답을 찾을 수 있을까요?  
이런 저런 단어를 넣어 검색을 해보았지만 제가 원하는 글은 나오지 않았습니다..

> 아! 직접 해보면 되겠구나

<br>

### 위기

당시 제 노트북의 환경은 자바11만 설치되어 있었습니다.  
그래서 1) 자바17을 설치하고 2) 자바17의 기능을 추가해서 jar를 만든다음, 3) 자바11로 버전을 바꿔 테스트 해보자는 계획을 세웠습니다.


MAC에서 자바 jdk를 설치하는 방법은 크게 두 가지로 나뉩니다.  
1) 직접 다운로드 후 설치  
2) 터미널에서 brew를 통한 설치


이전의 11은 1번의 방법으로 설치를 했었어서 이번에는 2번의 방법으로 자바17을 설치해보았습니다.

```zsh
brew tap adoptopenjdk/openjdk
```

명령어를 입력하여 adopt open jdk를 설치하였습니다.  
무사히 설치가 되었는지 java -version 을 입력해보니 17이 잘 나옵니다


추가로 이제 자바 버전을 변경할 수 있도록 해야합니다.  
~/.bash\_profile을 변경해주라는 블로그 글들이 많았지만 제 컴퓨터에는 해당 파일이 없었습니다.  
알고보니 제가 현재 쓰는 쉘이 bash가 아닌 zsh 였습니다.  
`본인 컴퓨터의 쉘 종류를 정확히 알고 있어야 한다`는 배움을 하나 얻었습니다.  

~/.zshrc 파일을 열어 아래와 같이 버전을 변경할 수 있는 내용를 alias로 지정해주었습니다  
(jdk의 경우 조금씩 경로가 다를 수 있으므로 현재 설치한 jdk가 어떤 jdk인지 체크해주어야 합니다)
<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FtJ6Nh%2Fbtryyfj0m1h%2F5NlrjktKCiGAxxEDa2r8Yk%2Fimg.png">

<br>

### 절정

jdk 버전도 두개 설치했고, 버전을 alias로 변경할 수 있는 기능도 추가 하였으니 이제 자바17의 기능을 추가한 jar를 만들어 보겠습니다.  
인텔리제이에서 모듈 및 클래스 파일을 생성한 뒤 다음의 설정으로 인텔리제이의 자바 버전을 수정하였습니다.  
1) Preference > Java Compiler > java17로 설정  
2) 모듈 우클릭 > Open Module Settings  
  (1) Project의 SDK와 language level 17로 변경  
  (2) Modules의 해당 모듈에 대해 language level 17로 변경  
  (3) SDKs에서 자바17로 설정


설정을 완료한 뒤 자바17에서 preview로 나온 기능이지만 switch의 패턴 매칭 기능을 작성해보았습니다.

```java
public class HelloJava17 {
    public static void main(String[] args) {
        System.out.println("java 17 test...");
        System.out.println(formatter("hello!"));
        System.out.println(formatter(1004));
        System.out.println(formatter(10.4));
        System.out.println(formatter(1L));
    }

    static String formatter(Object o) {
        String formatted = "unknown";
        if (o instanceof Integer i) {
            formatted = String.format("int %d", i);
        } else if (o instanceof Long l) {
            formatted = String.format("long %d", l);
        } else if (o instanceof Double d) {
            formatted = String.format("double %f", d);
        } else if (o instanceof String s) {
            formatted = String.format("String %s", s);
        }
        return formatted;
    }
}
```

_실행을 해보았는데 동작하지 않았습니다....._

다행히 찾아보니 .iml 파일에 jdk 정보가 11로 되어있었습니다.  
잘 해결해서 테스트 해보니 정상적으로 데이터가 출력됩니다.

```zsh
java 17 test...
String hello!
int 1004
double 10.400000
long 1
```

이제 이 실행파일을 11 환경에서 실행하기만 하면 결과를 알 수 있습니다.  
실행을 위해 인텔리제이에서 jar를 만들어 보겠습니다.  
생각보다 과정이 길어 블로그 글로 대체하겠습니다([https://ifuwanna.tistory.com/244](https://ifuwanna.tistory.com/244))  
build 후 로그에서 ../out/artifacts/HelloJava17\_jar/ 경로에 jar가 생성되었다는 문구가 나타났습니다.  
경로를 찾아가보니 Java.jar 파일이 생성 된 것을 확인할 수 있습니다.  

이제 마지막으로 17버전으로 생성된 jar를 자바11 환경에서 실행해보겠습니다.  
버전이 11인것을 확인 후 java -jar Java.jar 명령을 입력해보았습니다.  
과연 결과는 어떻게 나올까요?

```zsh
java -jar Java.jar 
Error: LinkageError occurred while loading main class HelloJava17
        java.lang.UnsupportedClassVersionError: HelloJava17 has been compiled by a more recent version of the Java Runtime (class file version 61.0), this version of the Java Runtime only recognizes class file versions up to 55.0
```

실행결과 java.lang.UnsupportedClassVersionError 오류가 발생하는 것을 확인할 수 있었습니다.

<br>

### 결말

간단히 정리를 해보면  
java17에서 java -jar Java.jar -> OK  
java17에서 java11로 변경 -> OK  
java11에서 java -jar Java.jar -> **java.lang.UnsupportedClassVersionError 발생!**

<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FxMgjU%2FbtryxrdA1PQ%2FYCUITfUaY3mnmMK4CVbIhK%2Fimg.jpg">

해당 오류로 검색하니 글이 한가득이네~ 라는 결말입니다 ㅎㅎ

#### 느낀점 : 궁금하면 역시 테스트를 직접 해보는게 좋다. 문장에서 검색 키워드를 잘 찾아내는 것도 능력이다.

---

## 참고
[https://llighter.github.io/install-java-on-mac/](https://llighter.github.io/install-java-on-mac/)  
[https://ifuwanna.tistory.com/244](https://ifuwanna.tistory.com/244)  
[https://tlo-developer.tistory.com/296](https://tlo-developer.tistory.com/296)   
[https://tlo-developer.tistory.com/290](https://tlo-developer.tistory.com/290)  
[https://www.baeldung.com/java-lang-unsupportedclassversion](https://www.baeldung.com/java-lang-unsupportedclassversion)  
