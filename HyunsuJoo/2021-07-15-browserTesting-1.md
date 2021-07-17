# 브라우저 테스팅 자동화 적용기(입문) -1


이 글은 제가 최근에 시작한 테스트 프로젝트에 playwright를 사용하게 되면서 느낀점, 테스트를 기획하면서 느낀점 그리고 외부자료를 통합하여 적은 글입니다. 이 글에는 저의 주관적 생각이 많이 포함되어 있는 글입니다. 특히 playerwight 설명 부분은 테스트 초보자로써 제가 사용하면서 느낀점들을 주로 적었습니다. 잘못된 정보를 담고 있다면 꼭 알려주시면 감사하겠습니다.☺️ 

## 브라우저 테스팅 자동화의 필요성

---

웹 개발을 하는 데 있어서 항상 빠지지 않고 생각해야 할 부분 중 하나가 cross-browser compatibility 일 것입니다. Chrome, Safari, Firefox, Edge 등의 브라우저들이 같은 방식으로 웹 어플리케이션을 출력하여 나타내면 이상적이겠지만, 브라우저마다 고유의 렌더링 엔진이 있고 또한 렌더링 엔진/ 자바스크립트 엔진이 다르기 때문에  HTML을 다루는 스타일 또한 다릅니다. 그래서 같은 소스라도 브라우저마다 다르게 그려지고 이슈가 발생하기도 합니다(cross browsing issue). 이런 이슈는 사용자 경험의 질을 낮추는 영향을 주기 때문에 E2E 테스트의 중요한 부분입니다. 또한 CI/CD 파이프라인에 브라우저 테스트를 추가함으로써 코드가 프로덕션으로 배송되기 전에 오류나 실패한 테스트를 포착 할 수 있습니다.

그럼 브라우저 마다 어떤 렌더링 엔진들이 있을까요?

브라우저 | 랜더링 엔진 | 소유권
--- | ---------- | ---
Edge | EdgeHTML, Blink(2019) | EdgeHTML : Microsoft, Blink: Google
Chrome | Webkit, Blink( 2013, 4, 버전 28 이후) | Blink : Google
Safari | Webkit | Apple
FireFox | Gecko | Mozilla
Opera| Webkit | Apple


브라우저 자동화의 강점은 매뉴얼로 시행될 테스팅 스토리를 그대로 자동화로 실현할 수 있다는 점입니다.  
매뉴얼 테스팅에서의 포함된 일들을 보면, 각 트랜잭션을 불러오고 각 시나리오테스트의 성공 여부를 리포트 하며, 폼이 있다면 폼의 유효성 검사를 스크린샷으로 찍습니다. 이런 브라우저 테스팅을 실제 사용자환경과 동일한 조건에 맞추어 여러 브라우저에서도 테스팅을 실현하게 도와주는 것이 headles browser를 이용하는 것입니다.  

## Headless Browser 
---

헤드리스 브라우저는 GUI(그래픽 사용자 인터페이스)를 지원하지 않는 웹브라우저입니다. 사용자 인터페이스가 없지만 완전한 웹브라우저의 기능을 가지고 있으며, 스크립트나 다른 소프트웨어를 통해서만 작동할 수 있는 브라우저를 말합니다. 다시 말해서 화면에서 UI 및 다양한 픽셀의 렌더링을 처리하는 그리는 작업을 건너뛰고 (사용자 인터페이스 없이) 백그라운드에서 동일한 테스트를 실행합니다.  
  
헤드리스 브라우저는 GUI가 생성되지 않아 메모리, 시간 및 리소스가 덜 소모되기 때문에 일반 브라우저보다 빠릅니다. 또한 헤드리스 브라우저는 일부 Linux 배포판 및 서버의 경우와 같이 명령줄을 통해서만 액세스할 수 있는 시스템 및 플랫폼에서 사용할 수 있습니다. 그래서 웹 테스트와 웹 스크래핑의 용도로 많이 사용됩니다.  
  
종류  

- [Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome) - Google, Chrome지원, 59버전부터 released
- [Headless Firefox]() - Mozilla, Firefox지원
- [PanthomJS](https://phantomjs.org/) - released 2011,  deprecated since March 2018, 관리자가 중단 선언 아카이브됨.
- [HtmlUnit Driver](https://htmlunit.sourceforge.io/)-자바를 지원하는 headless 브라우저 
- [Erik](http://phimage.github.io/Erik/) -webkit 지원 
- [triflejs](https://triflejs.org/)



위에서 제시한 헤드리스 브라우저를 구동/제어 하기위해선 cli 또는 프로그래밍 언어로 쓰여진 테스트 스크립트 방법이 있습니다. 헤드리스 크롬을 이용하여 웹페이지에서 pdf파일로 저장하는 경우의 예를 들어보겠습니다. (Mac and Linux ( Chrome 59부터 ) Windows( Chrome 60 부터)의 환경부터 가능)
[참고 자료 : headlessChrome 설치 및 사용에 대한 자세한 설명입니다](https://developers.google.com/web/updates/2017/04/headless-chrome)

1. cli로 직접적으로 headless browser로 접근할 수 있습니다. 
``` 
chrome \
  --headless \                   # Runs Chrome in headless mode.
  --disable-gpu \                # Temporarily needed if running on Windows.
  --remote-debugging-port=9222 \
  https://www.chromestatus.com   # URL to open. Defaults to about:blank.
```
```
alias chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
alias chrome-canary="/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary"
alias chromium="/Applications/Chromium.app/Contents/MacOS/Chromium"
```

현재 페이지에 대한 PDF파일을 만드는 기능을 사용하고 싶다면,  

```
chrome --headless --disable-gpu --print-to-pdf https://www.chromestatus.com/
```
파일은 현재 디렉토리에 저장됩니다.  

2. 또는 Puppeteer(Node js library)라는 툴을 사용하게 된다면 JavaScript 언어를 이용하여 프로그래밍 접근방식도 가능합니다.
Puppeteer라는 라이브러리 설치후,

```javascript
const puppeteer = require('puppeteer');

(async() => {
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://www.chromestatus.com', {waitUntil: 'networkidle2'});
await page.pdf({path: 'page.pdf', format: 'A4'});

await browser.close();
})();
```

3. 헤드리스 크롬 브라우저는 또한 Selenium이라는 툴을 통해서도 가능합니다. Selenium 의 경우 WebDriver 를 통해서 브라우저를 제어 할 수 있습니다. Selenium WebDriver란 다양한 브라우저를 자동화 테스트 할 수 있도록 도와주는 테스트 프레임워크 입니다.[더 자세한 설명은 이 분 설명이 좋은것 같습니다](https://testmanager.tistory.com/103). WebDriver는 WebDriver JSON Wire Protoco라는 프로토콜을 사용하여 브라우저 (Chrome/Firefox/Safari/IE)와 통신하거나 메시지를 보내게 됩니다. 각 브라우저에는 응용프로그램이 실행되는 각각의 드라이버 들이 있습니다. headless chrome의 경우 chrome Driver 가 필요합니다. chrome Driver란 Chromium() 과의 통신을 위한 WebDriver의 유선 프로토콜을 구현하는 독립된 실행가능한 서버입니다. [참고자료 : stackoverflow: How does chromedriver.exe work on a core and fundamental level](https://sqa.stackexchange.com/questions/28358/how-does-chromedriver-exe-work-on-a-core-and-fundamental-level)

  [selenium 에서 headlessChrome 설치 및 사용에 대한 자세한 설명입니다](https://developers.google.com/web/updates/2017/04/headless-chrome)

헤드리스 브라우저들을 사용할 수 있는 API를 제공하는 라이브러리들을 몇가지 추렸습니다. 

- Selenium
- Playwright
- Puppeteer
- Cypress
- CasperJS

더 많은 라이브러리 리스트는 [여기](https://reposhub.com/python/testing-codebases-and-generating-test-data/dhamaniasad-HeadlessBrowsers.html#articleHeader2)를 참조하시면 됩니다.

## Selenium  
---  
**released date**: 2004년  
**지원언어** : `Python`, `Java`, `C-Sharp`, `JavaScript`, `Ruby`, `PHP`, `Perl`.  
**지원 브라우저** : Chromium/Chrome, Firefox, Edge, Safari,Opera, Internet Explorer   

Selenium은 2004년부터 릴리즈 되었으며, 지원언어 및 지원 대상 브라우저 측면에서 가장 포괄적으로 제공합니다. 그래서 가장 널리 알려져 있으며 많이 쓰이기도 합니다.  
앞서 언급하였듯이 다른 브라우저의 환경에서 테스팅 하려면, 드라이버를 설치해야합니다. 예를 들어, Chrome의 경우 [ChromeDriver](https://chromedriver.chromium.org/downloads), Safari는 [Safaridriver](https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/safari/SafariDriver.html) , Firefox는 [Geckodriver 가](https://firefox-source-docs.mozilla.org/testing/geckodriver/index.html) 있습니다. 이 WebDriver 에 대해 알아야 할 한 가지는 브라우저 드라이버를 설치하여 한다는 것입니다. 다음에 설명할 puppeteer나 playwright 보단 복잡성이 조금 추가되는 일이지만 프로젝트의 요구사항에 따라 다양한 브라우저와 다양한 버전을 지원 하여 웹 애플리케이션의 브라우저 간 테스트를 가능하게 합니다.  
Selenium은 헤드리스 브라우저 자동화도 지원합니다. SeleniumWebDriver3 이전 버전에서는 HTMLUnitDriver를 이용하여 헤드리스 브라우저를 이용하였고, SeleniumWebDriver3 이후 부터는 실제브라우저의 헤드리스 버전도 지원합니다. GUI가 없기 때문에 사용자는 테스트 실행 화면을 볼 수 없습니다.  

## Puppeteer

---

**Released date** : Jan, 2018
**지원 언어**: `JavaScript`  
**지원 브라우저**: chrome, firefox 

이름에서 유추 할 수 있듯이, 웹페이지에서 일부 작업을 수행하기 위해 조작하는 꼭두각시입니다. Puppeteer는 Selenium의 일부 단점에 대한 Google의 대응으로써 Chrome DevTools팀의 아이디어로 진행된 프로젝트 입니다.   

Browser를 제어하는 방식이 셀레늄과는 다른 webdriver를 사용하지 않고 [DevTools프로토콜](https://chromedevtools.github.io/devtools-protocol/)을 통해 Chrome 또는  Chromium을 제어합니다.

> DevTools프로토콜은 디버그, 인스펙트, profile chromiun, Chrome 기능을 가능하게 해줍니다. 예로 크롬의 DevTools가 이 프로토콜을 이용합니다.

여기서 셀레늄과 반하는 장점으로는 Puppeteer를 설치할 때, Chromium이 번들로 제공됩니다. 즉, 셀레늄에서의 호환되는 browser driver를 설치/업그레이드  해줘야 하는 번거로움을 여기선 자동호환되는 브라우저로 문제를 해결 해줍니다. 셀레늄에서 이런 문제를 해결하기 위해  크롬드라이버를 자동으로 설치해주는 라이브러리를 설치할 수 있지만, 이런 과정 또한 Puppeteer에선 불필요한 과정이므로, Puppeteer가 프로젝트를 시작하기에 더 쉬운 이점이 있습니다. 하지만 지원되는 브라우저는 Chrome에 국한 됩니다. 최근 firefox를 지원하긴 했지만, [is Puppeteer Firefox ready yet?](https://puppeteer.github.io/ispuppeteerfirefoxready/)을 참고하는게 좋을 것 같습니다. 다양한 브라우저에서 테스팅을 진행하기가 어렵습니다. 그래서인지 Puppeteer는 테스트를 위한 툴보다는 automation 툴에 더 가깝다는 글, 정보들을 볼 수 있습니다. 즉, 스크래핑이나 pdf를 만들어내는 일들에 빠른 일처리를 합니다.

![webDriver](./images/protocol.png)  
이미지 발췌 : [yogendra.me](https://yogendra.me/2017/10/28/puppeteer-no-strings-attached/) 

## Playwright

---

**released date**: 31 January 2020  
**지원 언어**: `JavaScript`, `TypeScript`, `Java`, `Python`, `C#`  
**지원 브라우저**: Chrome, Friefox, Safari

Playwright 과 Puppeteer은 이름도 비슷할 뿐더러 깃헙 컨트리뷰터를 보면 중복되는 사람들이 보입니다. 그래서인지 제공되는 API가 거의 비슷합니다. 구글에 속해있었던 pupeteer팀이 마이크로소프트사로 이직했습니다.TestTalks를 다루는 Test Guild와 마이크로소프트사의 Playwright JS team 프로그램 매니저인 Arjun Attam와의 인터뷰에서 Playwright는 Puppeteer와는 다른 철학을 가지고 있다고 말헸습니다. 그의 말에 따르면이 툴은 E2E(End to End) 테스트와 테스트를 하는 디벨로퍼 들을 위해 만들어졌습니다. Playwright 팀은 종단 간 테스트에서 여러 브라우저의 테스팅 지원에 대한 갭을 발견하였고, Chrome, Safari, Firefox를 지원하게 하였습니다(Puppeteer의 한계를 개선). 다양한 브라우저를 지원해주는 장점이 있지만 selenium에 비해선 브라우저의 다양한 버전을 지원하진 못합니다.  

Playwright가 puppteer 보다 테스트를 위해 지원된 도구란 점을 알 수 있는 것은 테스트 러너를 지원하는 점과 codeless 테스트 자동화입니다. 테스트 코드를 작성하다 보면 반복적인 일들을 하게 되는데, 코드 없이 테스트 시나리오에 맞춰 브라우저에서 시행하는 것을 레코딩 하면 그것이 코드로 변환됩니다. 저도 영상으로만 봐서 얼마만큼 정확하게 코드로 변환할진 모르겠지만 정말 잘 된다면 생산성을 가속화 하는데 한몫할 것 같습니다. 또한 API를 직관적 만들어 낮은 러닝커브에도 접근할 수 있도록 하였습니다. Playwright는 selenium의 커뮤니티보단 작지만, 버그나 사용자들의 이용 편의성을 위해 slack 채널에서 매우 활동적으로 활동하고 있습니다.(물어보면 답변이 금방 옵니다!) 
playwright은 selenium의 커뮤니티보단 작지만, 버그나 사용자들의 이용 편의성을 위해 slack 채널에서 매우 활동적으로 활동하고 있습니다.(물어보면 답변이 금방 옵니다!) 


다음 글에선 playwright의 특징과 주요 기능들에 대해서 이야기 하겠습니다. 

**참고자료**

- [Headless Browser 101](https://www.bestproxyreviews.com/headless-browser/)
- [Playwright vs. Puppeteer](https://blog.logrocket.com/playwright-vs-puppeteer/)
- [What is the Microsoft Playwright JS Automation (2021 Tutorial)](https://testguild.com/what-is-microsoft-playwright-js/)
- [A list of (almost) all headless web browsers in existence](https://reposhub.com/python/testing-codebases-and-generating-test-data/dhamaniasad-HeadlessBrowsers.html#articleHeader2)
- [Puppeteer - No Strings Attached](https://yogendra.me/2017/10/28/puppeteer-no-strings-attached/)
- [[Browser] 브라우저 렌더링](https://beomy.github.io/tech/browser/browser-rendering/)
