# Vaadin - Intro

Site : https://vaadin.com/


## Overview

![image](https://user-images.githubusercontent.com/6725753/191420075-ee37c5cc-0b8b-4f58-af6b-e4879265df1a.png)

> 자바만으로 웹 앱을 제작 할 수 있다.

> 스프링 부트와 좋은 궁합을 보여준다.

> 개인이 쓰기에는 조금 비싼 가격이지만 Core Plan은 무료이고 Vaadin의 핵심 프레임워크라고 할 수 있는 Flow는 오픈소스이다. 또한 무수히 무료 Add-On들이 제공된다.
![image](https://user-images.githubusercontent.com/6725753/191420648-5612d4c0-50ac-4b77-b661-666a5999f74e.png)

> 백엔드 개발자가 간단하게 관리자툴을 제작할 때 적절하다.

> 국내 자료가 거의 없다. 단 한권의 국내 서적. 그나마도 2017년에 나온 8버전. 현재 23버전.

## Get Started

Vaadin 홈페이지에서 제공하는 퀵스타트 프로젝트를 통해서 간단하게 알아보자.

- https://vaadin.com/docs/latest/guide/quick-start
- Vaadin은 스프링 지원에 진심이다.
- https://github.com/v0o0v/my-todo_vaadin
- 놀랍게도 이름은 my-todo 이지만 실제로는 그렇지 않다.

MainView.java
```java
package com.example.application.views.main;

import com.vaadin.flow.component.Key;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;

@PageTitle("Main")
@Route(value = "")
public class MainView extends HorizontalLayout {

    private TextField name;
    private Button sayHello;

    public MainView() {
        name = new TextField("Your name");
        sayHello = new Button("Say hello");
        sayHello.addClickListener(e -> {
            Notification.show("Hello " + name.getValue());
        });
        sayHello.addClickShortcut(Key.ENTER);

        setMargin(true);
        setVerticalComponentAlignment(Alignment.END, name, sayHello);

        add(name, sayHello);
    }

}

```

- @PageTitle("Main")
    - 웹브라우저 타이틀
- @Route(value = "")
    - 웹페이지 주소(여기서는 localhost:8080)
- Notification.show("Hello " + name.getValue());
    - 알림창
- setVerticalComponentAlignment(Alignment.END, name, sayHello);
    - 해당 컴포넌트에 대해 가로 정렬 지정

- 결과화면
    - ![image](https://user-images.githubusercontent.com/6725753/191488277-335511ff-fac6-46ec-8d01-9a6cb27e3ba7.png)

    
Application.java
```java
@SpringBootApplication
@Theme(value = "mytodo")
@PWA(name = "My Todo", shortName = "My Todo", offlineResources = {})
@NpmPackage(value = "line-awesome", version = "1.3.0")
public class Application implements AppShellConfigurator {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```
- @PWA(name = "My Todo", shortName = "My Todo", offlineResources = {})
    - 프로그레시브 웹 앱으로 쉽게 설정 가능
  > PWA : 웹앱을 네이티브앱 처럼 쓸 수 있게 하는 기슬
  > https://blog.wishket.com/%ED%94%84%EB%A1%9C%EA%B7%B8%EB%A0%88%EC%8B%9C%EB%B8%8C-%EC%9B%B9-%EC%95%B1pwa%EC%9D%B4%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%B4%EB%A9%B0-%EC%99%9C-%ED%95%84%EC%9A%94%ED%95%9C%EA%B0%80/


## 조금 더 앱 같은 예제를 봅시다.
- Vaadin Start
- https://start.vaadin.com/app
- Spring Initializer 같이 Vaadin 프로젝트를 어느정도 필요한 부분을 채워서 예제로 만들어주는 유틸
- ![image](https://user-images.githubusercontent.com/6725753/191555429-adcb7ac2-360c-4e9b-9e88-e23367b0edb7.png)
- 왼쪽에 메뉴가 자리하고 몇개의 예제 화면을 추가할 수 있다
- 기본적으로 반응형 웹을 지원하는 앱을 만들어주고 스크린 사이즈에 맞게 화면에 어떻게 보이는지 알 수 있다.
- github에 바로 프로젝트를 생성할 수도 있고 프로젝트를 다운로드 받을 수도 있다.
- 화면에 보이는게 바로 앱의 실행 화면이기 때문에 바로 확인도 할 수 있고 소스코드도 같이 볼 수 있다.

