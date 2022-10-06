# AWS S3 + CloudFront로 Micro Frontend Architecture 구성하기

이번주에는 AWS를 이용하여 Micro Frontend Architecture를 구성하는 것을 해보았습니다.

S3, CloudFront를 통해 구성했으며 해당 기술들에 대해서 설명하겠습니다.

아래 링크는 aws에서 micro frontend architecture에서 설명하는 글입니다.

[Micro-frontend Architectures on AWS](https://aws.amazon.com/ko/blogs/architecture/micro-frontend-architectures-on-aws/)

![aws-micro-frontend-architecture](https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2021/03/02/AWS-Micro-frontend.jpg)

Billing Service, Shipping Service, Profile Service, Parent Application Service를 각각의 Team들이 CI/CD Pipeline을 구축하고 S3 그리고 CloudFront를 통해 Parent application에서 합쳐서 유저에게 전달하는 모습을 볼 수 있습니다.

## [S3](https://docs.aws.amazon.com/ko_kr/AmazonS3/latest/userguide/Welcome.html)

Simple Storage Service의 약자로 S3라고 부릅니다.

Amazon S3는 데이터를 버킷 내의 객체로 저장하는 객체 스토리지 서비스입니다. 객체는 해당 파일을 설명하는 모든 메타데이터입니다. 버킷은 객체에 대한 컨테이너입니다.

### Bucket

모든 객체는 어떤 버킷에 포함됩니다. 예를 들어 photos/puppy.jpg로 명명된 객체는 미국 서부(오레곤) 리전의 DOC-EXAMPLE-BUCKET 버킷에 저장되며 

URL https://DOC-EXAMPLE-BUCKET.s3.us-west-2.amazonaws.com/photos/puppy.jpg 를 사용하여 주소를 지정할 수 있습니다.

## [CloudFront](https://docs.aws.amazon.com/ko_kr/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)

Amazon CloudFront는 .html, .css, .js 및 이미지 파일과 같은 정적 및 동적 웹 콘텐츠를 사용자에게 더 빨리 배포하도록 지원하는 웹 서비스입니다. 

CloudFront는 엣지 로케이션이라고 하는 데이터 센터의 전 세계 네트워크를 통해 콘텐츠를 제공합니다. 

CloudFront를 통해 서비스하는 콘텐츠를 사용자가 요청하면 지연 시간이 가장 낮은 엣지 로케이션(물리적으로 가장 가까운 위치)으로 요청이 라우팅되므로 가능한 최고의 성능으로 콘텐츠가 제공됩니다.

### [CDN](https://library.gabia.com/contents/infrahosting/8985/)

Content Delivery Network의 약자인 CDN은 지리적 제약 없이 전 세계 사용자에게 빠르고 안전하게 콘텐츠를 전송할 수 있는 콘텐츠 전송 기술을 의미합니다.

CDN은 서버와 사용자 사이의 물리적인 거리를 줄여 콘텐츠 로딩에 소요되는 시간을 최소화합니다. 

CDN은 각 지역에 캐시 서버(PoP, Points of presence)를 분산 배치해, 근접한 사용자의 요청에 원본 서버가 아닌 캐시 서버가 콘텐츠를 전달합니다.

예를 들어 미국에 있는 사용자가 한국에 호스팅 된 웹 사이트에 접근하는 경우 미국에 위치한 PoP 서버에서 웹사이트 콘텐츠를 사용자에게 전송하는 방식입니다.

## 실습

위의 아마존 블로그에서 구성한 구조와 달리 제가 구성한 방법입니다. 하나의 S3 bucket에 folder를 기준으로 routing 처리합니다. 

그 전의 CI/CD는 구성 아직 못해서 수동으로 빌드시킨 파일들을 업로드 합니다.

그리고 Cloudfront로 덮고 User는 Cloudfront를 주소를 통해 웹에 접근하는 구조로 설계했습니다.

밑에는 저와 유사한 구조로 그려진 그림이 있어 가져왔습니다.

![taekyeom-micro-frontend-architecture](https://miro.medium.com/max/720/1*T_OrAE8h81-7u_2x5DWJIw.png)

처음 써보다보니 걱정도 많고(무엇보다 돈나갈까봐의 무서움) 탈도 많았지만(처음 AWS를 사용) 그래도 구성한 거 같습니다. 그리고 제가 머리로 생각했던 구조를 구성하게 되니 뿌듯하고 재밌네요.

글 작성 기준으로 remote app(vue-cli로 구성한 프로젝트, vue-vite로 구성한 프로젝트)까지 가져왔습니다.

조금 더 많은 remote app(cra로 구성한 프로젝트, react-vite로 구성한 프로젝트 등)들을 추가해서 토요일 발표때 이야기하도록 노력하겠습니다.

## 이슈

CloudFront에서 S3에 설정했던 진입점(index.html)에 접근하지 못했습니다.

정확한 이유는 잘 모르겠습니다. 찾게되면 공유해보도록 하겠습니다. 그래서 오류페이지에서 오류 코드가 403 일때 응답페이지 경로를 index.html로 강제로 잡는 방식으로 처리했습니다.

[Micro-frontend Architectures on AWS](https://aws.amazon.com/ko/blogs/architecture/micro-frontend-architectures-on-aws/)

[Amazon S3란 무엇인가요?](https://docs.aws.amazon.com/ko_kr/AmazonS3/latest/userguide/Welcome.html)

[Amazon CloudFront란 무엇입니까?](https://docs.aws.amazon.com/ko_kr/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)

[[클라우드 이해] CDN이란?](https://library.gabia.com/contents/infrahosting/8985/)

[실전 Amazon S3와 CloudFront로 정적 파일 배포하기](https://aws.amazon.com/ko/blogs/korea/amazon-s3-amazon-cloudfront-a-match-made-in-the-cloud/)
