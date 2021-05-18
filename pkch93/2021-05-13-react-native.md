# React Native

React Native는 React를 사용하여 IOS와 Android 모바일 애플리케이션을 개발할 수 있는 **하이브리드 앱** 프레임워크이다.

> 하이브리드 앱이란 웹앱과 다르게 웹 뷰를 사용하지 않고 네이티브와 통신하는 방식의 앱을 말한다.

IOS와 Android는 각각의 OS 플랫폼에 최적화된 프로그래밍 언어를 사용한다. 각각 Swift/Objective-C와 Kotlin/Java를 개발언어로 사용한다. 이렇게 각 OS에 최적화된 언어를 사용하면 위치 정보, 카메라 등과 같은 네이티브 기능 사용이 용이하며 모바일 애플리케이션의 성능을 최대한 활용할 수 있다.

하지만 하나의 서비스를 각각의 플랫폼으로 따로 개발한다는 것은 개발 리소스를 그만큼 더 많이 필요하다는 이야기가 된다. 이런 문제로 **하이브리드 웹앱**이 등장한다.

하이브리드 웹앱이란 모바일 웹 브라우저에서 동작하며 이 웹 브라우저를 네이티브 기능으로 감싸서 제공한다. 즉, UI는 웹 브라우저를 통해 제공하고 사진, 위치, 파일 저장과 같은 네이티브 기능은 웹 브라우저에서 접근할 수 있도록 만들어 제공한다. 이런 하이브리드 웹앱으로는 폰갭 `PhoneGap`, 코르도바 `Cordova`, 아이오닉 `Ionic` 등이 있다.

하이브리드 웹앱은 기존의 웹 기술을 통해서 앱을 제작하고 유지보수 할 수 있다는 장점이 있지만 모바일 웹 브라우저를 사용하기 때문에 웹 브라우저의 이상으로 성능을 발휘할 수 없었다. 이런 성능 문제로 하이브리드 웹앱은 큰 성공을 거두지는 못한다.

이런 성능 문제를 해결하기 위해서 **하이브리드 앱**이 등장한다. React Native와 더불어 Flutter 등이 하이브리드 앱의 대표격이다.

## React Native 작동 원리

React Native는 앞선 하이브리드 웹앱의 문제를 해결하기 위해 Native Bridge를 사용한다.

![](https://user-images.githubusercontent.com/30178507/118124415-818f1580-b430-11eb-948f-60d772770696.png)

React Native가 구동되는 Javascript Thread와 모바일 앱을 구동하는 Native Thread와 통신하는 Native Bridge를 통해 성능을 최적화하였다.

### React Native의 4가지 Thread

1. UI Thread

    메인스레드로 각 플랫폼`Android, IOS`의 UI랜더링에 사용된다.

2. Javascript Thread

    Javascript 로직이 실행되는 Thread로 API 호출, 터치 이벤트를 처리하는 등의 스레드가 존재한다.

    네이티브 뷰에 대한 업데이트는 일괄 처리가 되며 Javascript Thread의 이벤트 루프 끝에서 네이티브 측으로 업데이트 결과를 전달하며 이를 받아 UI Thread에서 실행한다.

    따라서 Javasscript Thread는 좋은 성능을 유지하기 위해서 프레임 렌더링 데드라인 전에 배치 업데이트를 UI 스레드에 전달해야한다. 참고로 IOS의 경우는 초당 60프레임을 표시하며 프레임 생성까지 16.67ms가 소요되는데 UI 성능을 최적화하기 위해서는 Javascript Thread에서 네이티브 UI 변경으로 전달하기까지 16.67ms이내로 처리해야한다.

3. Native Modules Thread

    앱이 플랫폼 API에 엑세스 하는 경우에 Native Modules Thread를 통해 동작한다.

4. Render Thread

    Android L `5.0` 에서만 React Native의 UI를 그릴때 사용한다.

### 동작 과정

1. 앱이 시작하면서 UI Thread가 실행되며 Javascript 번들을 로드한다.
2. Javascript 번들의 로드가 완료되면 UI Thread는 Javascript 코드들을 Javascript Thread로 보낸다. 이를 통해 Javascirpt Thread가 무거운 작업을 하더라도 UI Thread가 문제를 일으키지 않는다.
3. React가 렌더링을 시작하면서 diffing을 시작한다. 새로운 Virtual DOM을 생성하고 변경점들을 Shadow Thread `위 캡처의 Background Thread`로 전달한다.
4. Shadow Thread가 레이아웃의 계산을 끝마치면 레이아웃의 parameter혹은 object를 UI Thread에 보낸다.
5. UI Thread는 Shadow Thread가 보낸 레이아웃을 화면에 렌더링한다.

### Native Bridge

> React Native가 하이브리드 웹앱보다는 뛰어난 성능을 보여주게 만들지만 Flutter 보다는 느린 성능을 보여주게 만드는 주된 원인

React Native의 Javascript Thread가 Native Thread와 통신을 하기 위해서는 Native Bridge가 필요하다. 이를 통해 Javscript Thread에서의 UI 변경을 Native Thread로 전달할 수 있고 네이티브 이벤트 `버튼 클릭 등` 를 Javascript Thread로 전달할 수 있다.

React Native는 UI Thread → Javascript Thread → Shadow Thread → Native Side 순으로 실행되는데 많은 수의 연산이 필요한 경우에는 Native Bridge에서 병목이 발생한다. 이점이 Flutter에 비해 성능이 떨어지는 주된 요인이다. Flutter는 Bridge를 사용하지 않고 실제 네이티브 코드로 컴파일된다.

참고로 React Native 팀에서도 이를 인지하고 Native Bridge를 제거하는 새로운 아키텍처를 작업하고 있다고 한다.

### 참고

[스무디 한 잔 마시며 끝내는 React Native 1장](http://www.kyobobook.co.kr/product/detailViewKor.laf?ejkGb=KOR&mallGb=KOR&barcode=9791190014625&orderClick=LEa&Kc=)

[https://dsc-university-of-seoul.github.io/about-react-native/](https://dsc-university-of-seoul.github.io/about-react-native/)