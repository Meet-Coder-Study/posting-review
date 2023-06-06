이번에는 서버로 데이터 전송하는 법에 대해 작성해보도록 하겠습니다! 
전송하다가 발생할 수 있는 CORS policy 이슈에 대해 대처하는 방법으로 proxy를 설명하고, 데이터를 전송할 때 필요한 Multi File개념과 Form Data에 대해 알아 보겠습니다.

아래와 같이 axios주소에 url에 넣어 작성하는 경우
```javascript
await axios({
  method: 'POST',
  url: `(서버 주소)/api/user/signup`,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  data: formData,
}).then(response => {
  console.log(response);
});
```
아래와 같이 CORS policy오류가 발생할 수 있습니다. 
![](https://velog.velcdn.com/images/gueit214/post/45251f38-34a0-4e0b-b403-cd9356ede639/image.png)

>
### CORS
###### https://evan-moon.github.io/2020/05/21/about-cors/
CORS란, Cross-Origin Resource Sharing의 약자로, 웹 개발을 하다보면 CORS 정책 위반으로 인해 에러가 발생하는 상황은 굉장히 흔해서 누구나 한 번쯤은 겪게 된다고 해도 과언이 아닙니다. 
#### Origin ; 서버의 위치를 의미
![](https://velog.velcdn.com/images/gueit214/post/6f5fff8b-d593-4ba2-b0be-c72b0e8447ef/image.png)
URL은 protocol + Host + Path + Query String + Fragment로 이루어져있습니다.
... 생략
간략하게 말씀드리면 CORS policy는 **자신의 출저(도메인, 포트, 프로토콜)와 다른 출저의 리소스를 교환할 수 없는 브라우저 보안 정책**을 말합니다. 다른 출처의 리소스를 교환하기 위해서는, 다른 출처의 리소스를 제공하는 서버쪽에서 CORS 설정을 헤더를 포함한 응답을 해주어야만 합니다.
이 것을 해결하기 위해서는 proxy를 설정해주면 됩니다. proxy는 대리인이라는 뜻인데, 대신 작동하는 가상서버라고 생각하면 됩니다. 예를들어 react dev서버가 localhost:3000, 백엔드 서버가 localhost:8000인 경우, proxy서버를 localhost:8000으로 설정해줍니다. ajax요청은 자동으로 8000으로 요청을 보내게 됩니다. 이렇게 되면 같은 포트로 접속하는 것이기에 CORS도 위반되지 않고, cookie도 공유하게 됩니다. CRA에서 제시하는 proxy사용방법에는 두 가지가 있습니다.
> ### 1. package.json에 proxy 설정하기
```javascript
// package.json
{
	...
    "proxy": "http://localhost:8000"
}
```

> ### 2. http-proxy-middleware사용하기
npm으로 http-proxy-middleware를 설치해줍니다.
src>setupProxy.js라는 파일을 생성 후 다음과 같은 코드를 작성해줍니다.
```javascript
// src/setupProxy.jsconst { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};
```
그런데, 백엔드 서버측에서 proxy-middleware까지 요구하지 않는 경우, setupProxy.js 파일로 인해 500오류가 계속 발생할 수 있습니다. 
![](https://velog.velcdn.com/images/gueit214/post/af36ebf8-c0c5-4066-8ba8-e500b03818f8/image.png)
그런 경우, setupProxy.js파일을 아애 삭제해주셔야 합니다.
###### 이 파일 하나 때문에 삽질 엄청 했습니다 ㅜㅜ

-----
위와 같은 proxy설정을 해주었다면 이제 MultiFile과 Formdata를 전송해보도록 하겠습니다.
>
### Multipart 
웹 클라이언트가 요청을 보낼 때, http 프로토콜의 바디 부분에 데이터를 여러 부분으로 나눠서 보내는 것
###### https://codingnotes.tistory.com/73
웹 클라이언트가 서버에게 파일을 업로드할 때, http 프로토콜의 바디 부분에 파일정보를 담아서 전송을 하는데, **파일을 한번에 여러개 전송을 하면 body 부분에 파일이 여러개의 부분으로 연결되어 전송**된다. 이렇게 여러 부분으로 나뉘어서 전송되는 것을 Multipart data라고 합니다.


> 
### FormData
XMLHttpRequest 전송을 위하여 설계된 특수한 객체 형태
###### https://inpa.tistory.com/entry/JS-%F0%9F%93%9A-FormData-%EC%A0%95%EB%A6%AC-fetch-api
FormaData는 key, value형식으로 되어있습니다.
```javascript
formData = new FormData();
formData.append('key',value);
```
>>
#### 용도
- 회원가입을 할 때
- 파일, 제목, 내용을 DB에 저장하는 페이지가 있을 때
-> 파일을 http 통신으로 전송할 때 사용
>
**값은 무조건 "문자열"로 자동 변환** 되기에 객체나 배열 같은 복잡한 데이터 넣을 수 없습니다. 객체같은 경우, 아래의 코드처럼 for문을 돌려 key와 value를 분리한 후 넣어주면 됩니다. 
```javascript
Object.entries(obj).forEach(item => formData.append(item[0], item[1]));
```
FormData에 이미지를 담고싶은 경우 아래와 같이 value값에 e.target.files[0]을 넣어주면 됩니다.
```javascript
const onUploadImage = useCallback(async e => {
	const formData = new FormData();
	formData.append('profiles', e.target.files[0]);
}, []);
```
그 외의 방법으로는 base64, buffer, 2진 data형식으로 서버로 전송할 수도 있습니다.
###### [참고](https://inpa.tistory.com/entry/JS-%F0%9F%93%9A-Base64-Blob-ArrayBuffer-File-%EB%8B%A4%EB%A3%A8%EA%B8%B0-%EC%A0%95%EB%A7%90-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-%EC%89%BD%EA%B2%8C-%EC%84%A4%EB%AA%85)

>
### Blob
Blob(Binay Large Object)은 이미지, 사운드, 비디오와 같은 멀티미디어 데이터를 다룰 때 사용
###### https://heropy.blog/2019/02/28/blob/
File 객체도 name과 lastModifiedDate 속성이 존재하는 Blob 객체입니다.

>
제가 진행한 프로젝트의 코드 일부입니다. 제출버튼을 누르면 실행되는 함수입니다.
`const formData=new FormData();`로 `FormData`를 생성해줍니다. 그리고 FormData는 key와 value값으로 구성되어있으므로 key에는 'profiles', value에는 imageFile을 넣어줍니다. imageFile은 File형식입니다. 그리고 data도 `key`와 `value`로 이루어진 객체입니다. 그렇기에 FormaData의 value값으로 바로 넣을 수 없습니다.
```javascript
const data = {
    name: 'test'
}
const submitBtn = async () => {
	const formData = new FormData();
	formData.append('profiles', imageFile);
	for (let [key, value] of Object.entries(data)) {
		formData.append(key, value);
	}
	await axios({
		method: 'POST',
		url: `주소/api/user/signup`,
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		data: formData,
	}).then(response => {
		console.log(response);
	});
};
```
위와 같은 식으로 객체와 사진 파일을 서버에 전송해주면 됩니다!
