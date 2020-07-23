# Firebase function tips & tricks

Firebase의 공식 문서 (Tips & tricks)[https://firebase.google.com/docs/functions/tips#always_delete_temporary_files]의 내용을 소개하고 왜 그렇게 해야하는지 간단히 설명 드리겠습니다.

## 서론

Firebase의 공식 문서 Tips & tricks의 내용을 소개하고 

왜 그렇게 해야 하는지 Firebase function을 사용하며 경험한 내용을 바탕으로 설명을 드리겠습니다.

## Write idempotent functions

함수 실행의 결과가 여러번 호출 되어도 동일한 결과를 가져야 한다.

문서에는 함수가 멱등성을 가지면 이전 호출이 실패 하여도 재시도 할 수 있게 설정하여 함수가 성공적으로 실행 하는 것을 보장 할 수 있다고 합니다. 

하지만 실제로 사용해 보면 원인 모를 문제로 함수가 두번 씩 혹은 그 이상 실행 되곤 합니다. database trigger(아직 베타..)는 공식적으로 해당 이슈가 있고 아직 해결이 되지 않았다고 하고 Cloud function의 경우에도 아주 드물게 중복으로 호출 되는 경우가 발생하였습니다. 

위의 이슈 때문에 함수 작성시 가능하면 필히 멱등성을 지킬 수 있게 작성 하는게 중요합니다. 

간단한 예를 들면 클라이언트에서 새로운 할 일을 등록하는데 Cloud function을 통해 database에 저장 한다고 가정 해봅시다.

멱등성을 지키지 않는 예시

- cloud  function에 할 일 전송
- 자동 생성 키 생성 후 DB에 저장

⇒ 이 경우 중복 호출 될 경우 동일한 내용의 할 일이 생성 되어버립니다.

멱등성을 지키는 예시

- 클라이언트에서  자동 생성키 생성
- cloud function에 할 일, 자동 생성키 같이 전송
- DB에 저장

⇒ 이 경우 중복 호출 되더라도 동일한 위치에 쓰기를 하므로 중복 데이터가 DB에 저장 되진 않습니다.

## Do not start background activities

백그라운드 활동이란 함수가 종료된 뒤에 발생하는 모든 활동입니다. 함수 반환이 완료 된 이후에 활동은 예상치 못한 동작 및 진단하기 어려운 오류가 발생합니다.

함수를 작성하다 보면 더 빠른 응답을 위해 실패할 확률이 극히 드문 경우 백그라운드 처리가 종료되지 않은 시점에서 함수 반환을 우선적으로 작성하는 경우가 있었습니다.

```jsx
const requestSayHello = async (req, resp) => {
	
	bgPromise().then(() => {
		// blah blah	
	}) 
	
	bgCallback(() => {
		// blah blah	
	})
	

	resp.send('hello')
}
```

위의 예시에서 `bgPromise`, `bgCallback` 이 두 비동기 함수는 콜백 함수가 실행 되기전에 `resp.send`가 먼저 실행되고 그 뒤에 실행 되는 콜백함수는 백그라운드에 동작하게 됩니다. 

함수가 동작하는 인스턴스는 한 번에 하나의 요청 밖에 처리 할 수 없게 되어 매 함수가 동일한 환경에서 실행 되어 지는게 권장 되지만 백그라운드 활동으로 인해 두 번째 요청, 세번째 요청 차후 들어오는 요청들이 생길 때마다 백그라운드 활동이 늘어나게 되면 예기치 못한 오류, 메모리 초과 등 문제가 발생 할 수 있기 때문에 응답 하기 전 모든 비동기식 작업이 완료되도록 해야 합니다.

```jsx
const requestSayHello = async (req, resp) => {
	
 await bgPromise()
	
	// blah balh

	bgCallback(() => {
		// blah blah	
	 resp.send('hello')
	})
}
```