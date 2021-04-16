
# AJAX 

- AJAX는 Javascript의 라이브러리 중 하나. 
- Asynchronous Javascript And Xml(비동기식 자바스크립트와 xml)의 약자이다. 
- 브라우저가 가지고있는 XMLHttpRequest 객체를 이용해서 전체 페이지를 새로 고치지 않고도 페이지의 일부만을 위한 데이터를 로드하는 기법.
- JavaScript를 사용한 비동기 통신, 클라이언트와 서버간에 XML 데이터를 주고받는 기술이다.

즉, 쉽게 말하자면 **자바스크립트를 통해서 서버에 데이터를 요청하는 것**이다.

## AJAX를 사용 가능하게 만드는 것들

AJAX라는 기술은 여러가지 기술이 혼합적으로 사용되어 이루어진다.
대표적인 예로는 아래와 같은 것들이 있다.
- HTML
- DOM
- JavaScript
- XMLHttpRequest
- ..Etc

## AJAX로 할 수 있는 것
- AJAX를 이용하여 **클라이언트에서 서버로 데이터를 요청**하고 그에 대한 **결과를 돌려받을 수 있다.**

## 클라이언트란?

서버에서 정보를 가져와서 사용자에게 보여줄 수 있고 **사용자와 상호작용할 수 있는 소프트웨어**

Ex) 웹브라우저, 핸드폰 어플리케이션 등..

## 서버란?

네트워크 상에서 접근할 수 있는 프로그램으로서 **어떤 자료들에 대한 관리나 접근을

제어해주는 프로그램.**

서버는 일반적으로 사용자가 직접적으로 사용하지 않는다. 


## AJAX를 사용하는 이유

WEB화면에서 무언가 부르거나 데이터를 조회하고 싶을 경우, 
페이지 전체를 새로고침하지 않기 위해 사용한다고 볼 수 있다.

기본적으로 HTTP 프로토콜은 클라이언트쪽에서 Request를 보내고 서버쪽에서 Response를 받으면 이어졌던 연결이 끊기게 되어있다. 

그래서 화면의 내용을 갱신하기 위해서는 다시 request를 하고 response를 하며 페이지 전체를 갱신하게 된다. 

하지만 이렇게 할 경우, 엄청난 자원낭비와 시간낭비를 초래하고 말 것이다.

AJAX는 HTML 페이지 전체가 아닌 일부분만 갱신할 수 있도록 XMLHttpRequest객체를 통해 서버에 request한다. 

이 경우, **JSON이나 XML형태로 필요한 데이터만 받아 갱신하기 때문에 그만큼의 자원과 시간을 아낄 수 있다.**


# AJAX의 장단점

## 1. AJAX의 장점
- 웹페이지 속도 향상
- 서버의 처리가 완료될 때까지 기다리지 않고 처리가 가능하다.
- 서버에서 Data만 전송하면 되므로, 전체적인 코딩의 양이 줄어든다.
- 기존 웹에서 불가능했던 다양한 UI를 가능하게 해준다. (예시: Flickr의 경우, 사진의 제목이나 태그를 페이지 리로드 없이 수정할 수 있다.)

## 2. AJAX의 단점
- 히스토리 관리가 되지 않는다.
- 페이지 이동없는 통신으로 인한 보안상의 문제가 있다.
- 연속으로 데이터를 요청하면 서버 부하가 증가할 수 있다.
- XMLHttpRequest를 통해 통신하는 경우, 사용자에게 아무런 진행정보가 주어지지 않는다.  
(요청이 완료되지 않았는데, 사용자가 페이지를 떠나거나 오작동할 우려가 발생하게 된다.)
- AJAX를 쓸 수 없는 브라우저에 대한 문제 이슈가 있다.
- HTTP 클라이언트의 기능이 한정되어 있다.
- 지원하는 Charset이 한정되어 있다. 
- Script로 작성하므로 디버깅이 용이하지 않ㄴ다.
- 동일-출처 정책으로 인해 다른 도메인과는 통신이 불가능하다. (Cross-Domain문제)


# XMLHttpRequest

- XMLHttpRequest(XHR) 객체는 서버와 상호작용하기 위하여 사용된다.
전체 페이지의 새로고침없이도 URL 로부터 데이터를 받아올 수 있다. 
이는 웹 페이지가, 사용자가 하고 있는 것을 방해하지 않으면서 페이지의 일부를 업데이트할 수 있도록 해 준다. 


- XMLHttpRequest 는 AJAX 프로그래밍에 주로 사용된다.
브라우저는 XMLHttpRequest 객체를 이용하여 Ajax 요청을 생성하고 전송한다. 



- XMLHttpRequest 는 이름으로만 봐서는 XML 만 받아올 수 있을 것 같아 보이지만, 
모든 종류의 데이터를 받아오는데 사용할 수 있다. 
또한 HTTP 이외의 프로토콜도 지원한다(file 과 ftp 포함).


- 서버가 브라우저의 요청에 대해 응답을 반환하면, 같은 XMLHttpRequest 객체가 그 결과를 처리한다.


```javascript
// XMLHttpRequest 객체의 생성
const xhr = new XMLHttpRequest();

// 비동기 방식으로 Request를 오픈한다
xhr.open('GET', '/users');

// Request를 전송한다
xhr.send();
```



## 생성자
```javascript
XMLHttpRequest() 
```

생성자는 XMLHttpRequest 를 초기화한다. 

다른 모든 메소드 호출이전에 호출되어야 한다.


## XMLHttpRequest.open

- XMLHttpRequest 객체의 인스턴스를 생성하고, XMLHttpRequest.open 메소드를 사용하여 서버로의 요청을 준비한다. 

XMLHttpRequest.open의 사용법은 아래와 같다.
```javascript
XMLHttpRequest.open(method, url[, async])
``` 

![image](https://user-images.githubusercontent.com/15938354/114855097-84dab580-9e20-11eb-976c-d84abffca565.png)  



##  XMLHttpRequest.send

XMLHttpRequest.send 메소드로 준비된 요청을 서버에 전달한다.

기본적으로 서버로 전송하는 데이터는 GET, POST 메소드에 따라 그 전송 방식에 차이가 있다.

GET 메소드의 경우, URL의 일부분인 쿼리문자열(query string)로 데이터를 서버로 전송한다.

POST 메소드의 경우, 데이터(페이로드)를 Request Body에 담아 전송한다.


![image](https://user-images.githubusercontent.com/15938354/114853106-6b386e80-9e1e-11eb-8594-81c3922ade48.png)

XMLHttpRequest.send 메소드에는 request body에 담아 전송할 인수를 전달할 수 있다.

```javascript
xhr.send(null);
// xhr.send('string');
// xhr.send(new Blob()); // 파일 업로드와 같이 바이너리 컨텐트를 보내는 방법
// xhr.send({ form: 'data' });
// xhr.send(document);
```

**만약 요청 메소드가 GET인 경우, send 메소드의 인수는 무시되고 request body은 null로 설정된다.**


## XMLHttpRequest.setRequestHeader

XMLHttpRequest.setRequestHeader 메소드는 HTTP Request Header의 값을 설정한다. 

setRequestHeader 메소드는 반드시 XMLHttpRequest.open 메소드 호출 이후에 호출한다.

자주 사용하는 Request Header인 Content-type, Accept에 대해 살펴보자.

### Content-type

Content-type은 request body에 담아 전송할 데이터의 MIME-type의 정보를 표현한다. 자주 사용되는 MIME-type은 아래와 같다.

![image](https://user-images.githubusercontent.com/15938354/114853911-3c6ec800-9e1f-11eb-9506-b053bcbbcbee.png)


다음은 request body에 담아 서버로 전송할 데이터의 MIME-type을 지정하는 예이다.

```javascript
// json으로 전송하는 경우
xhr.open('POST', '/users');

// 클라이언트가 서버로 전송할 데이터의 MIME-type 지정: json
xhr.setRequestHeader('Content-type', 'application/json');

const data = { id: 3, title: 'JavaScript', author: 'Park', price: 5000};

xhr.send(JSON.stringify(data));
```


### Accept

HTTP 클라이언트가 서버에 요청할 때 서버가 send back 할 데이터의 MIME-type을 Accept로 지정할 수 있다.

다음은 서버가 send back할 데이터의 MIME-type을 지정하는 예이다.

```javascript
// 서버가 센드백할 데이터의 MIME-type 지정: json
xhr.setRequestHeader('Accept', 'application/json');
```

만약 Accept 헤더를 설정하지 않으면, send 메소드가 호출될 때 Accept 헤더가 */*으로 전송된다.




참고 자료:
https://developer.mozilla.org/ko/docs/Web/API/XMLHttpRequest

https://poiemaweb.com/js-ajax

https://velog.io/@surim014/AJAX%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80
