# Javascript Generator 개념 이해하기

Javascript의 Generator Function 코루틴이라는 함수의 구현체이다. 사용자의 요구에 따라 다른 시간 간격으로 여러 값을 반환할 수 있으며, 내부 상태를 관리할 수 있다.
```function* make()``` 형식처럼 사용할 수 있다.

여기서 코루틴이란, 비동기 처리를 쉽게 할 수 있는 법으로 자세한 내용은  
https://wooooooak.github.io/kotlin/2019/08/25/%EC%BD%94%ED%8B%80%EB%A6%B0-%EC%BD%94%EB%A3%A8%ED%8B%B4-%EA%B0%9C%EB%85%90-%EC%9D%B5%ED%9E%88%EA%B8%B0/ 를 보면 자세히 알 수 있다.

![console](https://user-images.githubusercontent.com/35620465/95442989-fb40bb80-0996-11eb-88cd-4e78dde34052.png)

위와 같이 함수를 만들어보면, 기본적인 함수라면 1이 반환 됐겠지만 generator는 Generator 객체가 반환된다.
generator는 *와 yield 라는 키워드를 함께 사용한다.

```javascript
function* makeNumber() {
  let num = 1;

  while (true) {
    yield num++;
  }
}
```
위처럼 작성 했을때는 실제로 아무것도 반환되지 않는다.

![console1](https://user-images.githubusercontent.com/35620465/95443453-89b53d00-0997-11eb-9321-bba856079af0.png)

그래서 위처럼 test에는 아무것도 들어가있지 않다는것을 확인할 수 있다.
실제 Generator의 값을 가져오려면 ```test.next()``` 처럼 next를 사용해야 한다.

![console2](https://user-images.githubusercontent.com/35620465/95443683-d6007d00-0997-11eb-8e9d-870093fccf6e.png)

객체 형태로 값이 반환되는데 value에 1이 들어가 있는것을 확인할 수 있다. 그런데 여기서 done은 무엇일까? 바로 done 은 다음에 실행할게 있는지 없는지에 대한 플래그이다.  

위에 makeNumber로 만든 제너레이터 함수를 보면 while문이 true로 무한루프이다. 그래서 done이 false가 나왔는데  
```false``` => 다음에 실행할게 추가로 있다는 뜻  
```true``` => 다음에 더이상 실행할게 없다는 뜻 이다.

![console3](https://user-images.githubusercontent.com/35620465/95444542-e107dd00-0998-11eb-8732-0f6c32ae4433.png)

```test.next()```를 계속 작성해보면 yield 한 값이 계속 반환되는 것을 볼 수 있다.
정리해서 생각해보면, ```yield```는 함수를 끝내지 않고 값을 계속해서 밖으로 내보겠다는 뜻이다. 함수 내부와 외부 서로간에 핑퐁(?) 하는 느낌...
yield가 양보라는 의미를 생각해보면 더 이해하기 쉬울 것 같다.

마지막으로 간단한 generator 사용 예제 코드를 작성 해보자.
```javascript
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function* main() {
    console.log("시작");
    yield delay(3000);
    console.log("3초 뒤");
}

const it = main();

const { value } = it.next();

value.then(() => {
    it.next();
});
```
위 코드를 실행해보면 '시작' 이 출력된 후 3초뒤 '3초뒤'가 출력되는 것을 볼 수 있다.

![console4](https://user-images.githubusercontent.com/35620465/95445421-f7faff00-0999-11eb-961d-a9af6b215c70.png)

async await을 사용한 것과 비슷하게 delay함수가 종료될때까지 기다리게 된다.
async는 내부 함수가 Promise일때만 사용할 수 있다. 그래서 Promise에 최적화 되어 있는 사용 방법이다.
yield는 이것보다 일반적이다 라고 할 수 있는데 뒤에 반환되는 함수가 Promise 든 뭐든 상관없이 사용할 수 있다. 그런데 async 함수도 함수 자체 구현은 제너레이터로 구현되어 있다고 한다.

이렇게 generator 함수 사용 방법과 기본 개념을 다뤄봤다. yield 를 적절히 사용하면 비동기 처리 하는데 더 쉽고 수월하게 할 수 있을것 같다.
