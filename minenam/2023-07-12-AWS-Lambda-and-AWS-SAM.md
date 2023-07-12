# AWS Lambda 와 AWS SAM을 활용한 Local Test

## 소개

AWS에서 코드를 실행할 수 있는 서비리스 컴퓨팅 서비스로, 개발자가 코드 단위로 작업을 구현하고 이벤트 기반 작업에 적합하다.

> 예. 데이터 업데이트, 파일 변환, 알림 전송 등

### 장점

- 관리 및 유지보수 용이: 서버를 프로비저닝하거나 관리할 필요 없이 코드를 실행할 수 있다.
- 저렴한 비용: 사용한 리소스에 대해서 비용을 지불하기 때문에 상대적으로 트래픽이 많지 않으면 보다 효율적이다.
- 확장성과 유연성: 트래픽이 많아지면 자동으로 확장되기 때문에 서버를 관리할 필요가 없다.
- 빠른 배포: 간단히 코드를 업로드하고 구성을 설정하면 신속하게 배포를 할 수 있다.

#### 단점

- 제한된 환경: 서버리스 환경이 아닌, 특정 서버 설정이 필요한 인프라 기반의 환경에서는 사용하기 어려울 수 있다.
- 복잡성: 단순하지 않고 복잡한 비즈니스 로직을 처리하는 데 적합하지 않다.

## 로컬 환경에서 AWS Lambda Function 테스트하기

### AWS Lambda Console

### AWS SAM(Severless Application Model)

1. AWS CLI & Docker 설치
   - AWS SAM 을 사용하기 위해서는 AWS CLI와 Docker를 필수로 설치해야 한다.
   - [AWS CLI 설치 가이드](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
   - [AWS SAM CLI를 위한 Docker 설치](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-docker.html)
2. Lambda Event Test 작성
   - Lambda 함수를 테스트하기 위해 필요한 이벤트를 작성한다. Lambda 함수에 전달되는 입력 데이터로, 아래의 예시에서는 JSON 형태로 작성한다.
   ```json
   // events/event.json
   {
     "key1": "Hello",
     "key2": "World"
   }
   ```
3. Lambda Function 함수 작성

   ```typescript
   // app/index.ts
   export const handler = async (event, context) => {
     const { key1, key2 } = event;
     try {
       const response = {
         statusCode: 200,
         body: JSON.stringify({
           message: `${key1} ${key2}`,
         }),
       };

       return response;
     } catch (error) {
       console.log(error);
       return error;
     }
   };
   ```

4. AWS SAM 으로 로컬에서 Lambda Function 실행

   ```bash
   # sam local invoke -e <테스트 이벤트 파일 경로>
   $ sam local invoke -e events/event.json

   {"statusCode":200,"body":"{\"message\":\"Hello World\"}"}%
   ```

## 참고자료

- [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
