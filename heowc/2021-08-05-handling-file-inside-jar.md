
다음과 같은 구조에 `test.txt`를 가져오는 애플리케이션이 있다고 가정해보겠습니다.

```text
project
   ㄴ src
       ㄴ main
           ㄴ java
                ㄴ com.example
                        ㄴ Main.java
           ㄴ resources
                ㄴ test.txt
```

```java
public Main {

    public static void main(String[] args) {
        ClassLoader classLoader = Main.class.getClassLoader();
        URL url = classLoader.getResource("test.txt");
        File file = new File(url.toURI());
    }
}
```

해당 코드는 잘 동작할까요? 

...

반은 맞고 반은 틀렸습니다.

### 문제점 

**해당 코드는 IDE에서 실행하면 잘 동작하지만, jar로 패키징하여 실행하게되면 다음과 같은 에러를 던집니다.**

```
Exception in thread "main" java.lang.IllegalArgumentException: URI is not hierarchical
        at java.base/java.io.File.<init>(File.java:420)
        ...
```

왜 그러는 것일까요? 일단 스택트레이스를 따라가보도록 하겠습니다.

```java
public File(URI uri) {

    ...

    if (uri.isOpaque())
            throw new IllegalArgumentException("URI is not hierarchical");

    ...
```

위 코드로만 보자면, `uri.isOpaque()`가 true로 나왓다는 것을 알 수 있는데요. 다시 `isOpaque()`를 따라가 보도록 하겠습니다.

```java
    /**
     * Tells whether or not this URI is opaque.
     *
     * <p> A URI is opaque if, and only if, it is absolute and its
     * scheme-specific part does not begin with a slash character ('/').
     * An opaque URI has a scheme, a scheme-specific part, and possibly
     * a fragment; all other components are undefined. </p>
     *
     * @return  {@code true} if, and only if, this URI is opaque
     */
    public boolean isOpaque() {
        return path == null;
    }
```

`URI`가 불투명한지(?)를 알려주는 메소드인데요. 필드에 path가 비어있는 경우 true가 됩니다.

아직까지... 왜 `path`가 비었는지 의아합니다. 저 `path`가 어떻게 채워지는걸까요? 우선, 이를 알아보기 이전에 각기 상황에서 URI가 어떻게 나오는지 알아보겠습니다.

#### IDE에서 실행시

> file:{프로젝트 경로}/target/classes/**test.txt**

#### jar로 패키징하여 실행시

> jar:file:{프로젝트 경로}/target/example-1.0-SNAPSHOT.jar!/**test.txt**

앞서 확인해본 바에 의하면, IDE에서 실행한 경우에는 빌드툴에 의해 만들어진 특정 디렉토리를 바라보게됩니다. 반면에, jar로 패키징하게되면 jar안에 경로를 바라보게 되죠.

이런 차이를 알고서 다시 코드를 확인해보도록 하겠습니다. `URI`를 만드는 코드를 따라가보면 (더 딥하게 얘기하진 않겠지만) 조건이 충족하지 않아 `path`에 값이 할당되는 않는 것을 알 수 있었습니다.

(아마도, `RFC2396`에서 명시한 구문과 상이한 부분때문에 그런게 아닐까 싶습니다만... - `//authority]<path>[?<query>`)

```java
// URI.java

// -- Parsing --

// [<scheme>:]<scheme-specific-part>[#<fragment>]
//
void parse(boolean rsa) throws URISyntaxException {
    requireServerAuthority = rsa;
    int n = input.length();
    int p = scan(0, n, "/?#", ":");
    if ((p >= 0) && at(p, n, ':')) {
        if (p == 0)
            failExpecting("scheme name", 0);
        checkChar(0, L_ALPHA, H_ALPHA, "scheme name");
        checkChars(1, p, L_SCHEME, H_SCHEME, "scheme name");
        scheme = input.substring(0, p);
        p++;  
        if (at(p, n, '/')) {
            p = parseHierarchical(p, n); // <-- 이 부분에서 path 셋팅합니다.
        } else {
    ...
```

https://www.ietf.org/rfc/rfc2396.txt

사실 이게 의도한건지, 명확히 알 수 없었습니다. 어쨋든 저는 이것을 해결하기 위해서 여러 방법을 모색해봤습니다.

### 해결책

#### 방법 1

위 스택트레이스로 구글링을 해보았는데요. 여기서는 **`InputStream`을 활용해라**입니다.

https://stackoverflow.com/a/10144757/8096208

> it is not a file!

코멘트를 조금 생각해보면, 이미 jar로 패키징된 하나의 파일 안에 존재하기 때문에 시스템 입장에서(?), 이를 파일이라고 칭하기엔 조금 어렵기 때문에 그런거 아닐까 싶습니다.

#### 방법 2

문득, Spring에서 resource에 위치한 파일을 가져오기 위해 `ResourceUtils.getFile(...)`을 사용했던 경험이 생각났습니다. 스프링에서는 어떻게 처리하고 있을까요?

```java
// https://github.com/spring-projects/spring-framework/blob/main/spring-core/src/main/java/org/springframework/util/ResourceUtils.java#L214...L228
return new File(toURI(resourceUrl).getSchemeSpecificPart());
```

위에 보시는 바와 같이, **`.getSchemeSpecificPart()` 라는 메소드**가 보입니다. 이것도 전부 설명하긴 힘드므로 간단히 얘기하면, 내부 로직 중에 `path`에 값을 할당해주는 부분이 있습니다.
(이것만 보면, jdk 코드도 흠... 낄끔하지 않은 것 같네요.)

```java
// URI.java

public String getRawSchemeSpecificPart() {
    String part = schemeSpecificPart;
    if (part != null) {
        return part;
    }

    String s = string;
    if (s != null) {
        // if string is defined, components will have been parsed
        int start = 0;
        int end = s.length();
        if (scheme != null) {
            start = scheme.length() + 1;
        }
        if (fragment != null) {
            end -= fragment.length() + 1;
        }
        if (path != null && path.length() == end - start) {
            part = path; // <-- path 셋팅
        } else {
            part = s.substring(start, end);
        }
    ...
```

이렇게 리소스 내의 파일 핸들링에 대한 차이점 및 해결책을 알아보았습니다.

### 참고

- https://stackoverflow.com/questions/10144210/java-jar-file-use-resource-errors-uri-is-not-hierarchical
- https://www.ietf.org/rfc/rfc2396.txt
- https://github.com/spring-projects/spring-framework/blob/main/spring-core/src/main/java/org/springframework/util/ResourceUtils.java
