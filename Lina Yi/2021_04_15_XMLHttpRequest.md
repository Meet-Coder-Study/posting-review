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

XMLHttpRequest 객체의 인스턴스를 생성하고, XMLHttpRequest.open 메소드를 사용하여 서버로의 요청을 준비한다. 

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
