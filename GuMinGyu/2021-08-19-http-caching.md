---
title: HTTP Caching
author: mingyu.gu
date: 2021.08.19
---

# HTTP Caching

빠른 웹사이트 로딩(First load times)을 위한 방법들은 여러가지가 있습니다.

- WebCache
- Code Compress
- Lazy loading
- Critical Rendering Path
- ...

이중 Http Cache에 대해 정리해보았습니다.
HTTP 캐시들은 일반적으로 `GET`에 대한 응답만을 캐싱합니다. `GET`이 REST적 의미로 가져오다이기 때문에, 가져온 데이터를 저장해두고 두고두고 사용합니다. 일반적으로 200(성공), 301(다른 주소로 이동 후 가져옴), 404(가져올게 없음) 상태 코드로 온 응답을 캐싱합니다.

## `Cache-control` 헤더

캐시 정책들을 정의할 때 쓰는 헤더입니다.

### 캐시하지 않음

클라이언트 요청 혹은 응답에 대해 어떤 것도 저장하지 않습니다.

```
Cache-Control: no-store
```

### 캐시하지만 재검증

캐시를 사용하기 전에 서버에게 이 캐시 진짜 써도 되는지 물어봅니다.

```
Cache-Control: no-cache
```

### 사설 캐시와 공개 캐시

"public"은 어떤 캐시(CDN)에 의해서든지 캐시되어도 좋다는 뜻입니다.

"private"는 공유 캐시에 저장되어서는 안된다는 뜻입니다.(브라우저)

```
Cache-Control: private
Cache-Control: public
```

### 만료

**max-age**  
리소스가 유효하다고 판단되는 최대 시간을 말합니다. 요청 시간에 상대적이며, `Expires`가 설정되어 있어도 그보다 우선합니다. 변경되지 않을 파일에 대해 긴시간 캐싱할 수 있습니다. 예를들어 이미지, CSS 파일, JS파일과 같은 정적 파일들입니다.

```
Cache-Control: max-age=3153600
```

**Age**\
Age 헤더는 캐시 응답 때 나타나는데, max-age 시간 내에서 얼마나 흘렸는지 초 단위로 알려줍니다.
max-age를 1시간으로 설정한 후 1분이 지나면

```
Cache-Control: max-age=3600
Age: 60
```

이 캐시 응답 헤더에 포함됩니다.

**Expires**  
Cache-Control과 별개로 응답에 Expires라는 헤더를 줄 수도 있습니다.  
response contents가 언제 만료되는지를 나타내며, Cache-Control의 max-age가 있는 경우 이 헤더는 무시됩니다.

### 검증

만료된 캐시면 서버에서 확인을 받아야 합니다.

```
Cache-Control: must-revalidate
```

## 유효성(Freshness)

리소스가 캐시에 저장되고 나면 이론적으로는 영원히 캐시에 의해 서비스될 수 있습니다. 하지만 캐시는 유한한 저장공간을 가지므로 주기적으로 스토리지에서 제거되는데 이를 캐시축출(cache eviction)이라고 부릅니다.

만료시간 이전의 리소스는 유효하다(fresh)라고 부르고, 만료시간 이후의 리소스는 실효(stale)됐다고 이야기 합니다.

캐시가 실효된 리소스에 대해 요청을 받았을 때(max-age 초과, no-cache, must-revalidate) 리소스가 아직 유효한지 아닌지를 확인하고, 유효하다면 서버는 요청된 리소스 본문을 전송하지 않고 304(Not Modified)헤더를 돌려보내 대역폭을 절약합니다.

## 캐시 검증

캐시된 리소스의 만료시간이 가까워지면, 리소스를 검증하거나 다시 불러오게 됩니다.

### ETags

HTTP 컨텐츠가 바뀌였는지를 검사할 수 있는 태그입니다. 같은 주소의 자원이더라도 컨텐츠가 달라졌다면 ETag가 다릅니다.

## Example

### 200 (from memory cache)

max-age가 거의 무한이고, age도 많이 흐르지 않았기에 유효한 리소스라 memory에 있는 리소스(캐시된 리소스)를 그대로 사용한다.

```
[General]
Request URL: https://abcd.com/a.js
Request Method: GET
Status Code: 200  (from memory cache)
Remote Address: 54.192.175.42:443
Referrer Policy: strict-origin-when-cross-origin

[Response Headers]
accept-ranges: bytes
age: 34710
cache-control: public, max-age=31536000, immutable
content-encoding: gzip
content-type: application/javascript; charset=UTF-8
date: Thu, 19 Aug 2021 04:48:26 GMT
etag: W/"1ffd7-17b5cba00f8"
last-modified: Thu, 19 Aug 2021 04:44:59 GMT
server: CloudFront
vary: Accept-Encoding
via: 1.1 f681dbff28feeb503e3ad2f4be29ead3.cloudfront.net (CloudFront)
x-amz-cf-id: Lcm5rnqwYZiSzQT9XETch79qqg6XHOpATvBUWVnefT4VlI2CNs9Veg==
x-amz-cf-pop: ICN55-C1
x-cache: Hit from cloudfront
```

### 304 (Not Modified)

max-age=0 이라 컨텐츠가 유효한지 sever로 재검증을 하게 된다. 하지만 CloudFront의 ETag가 일치하므로 서버의 리소스가 갱신되지 않았기에 304 status code를 보내고 브라우저에 저장된 캐시를 재사용한다.

```
[General]
Request URL: https://abcd.com/a.png
Request Method: GET
Status Code: 304
Remote Address: 54.192.175.42:443
Referrer Policy: strict-origin-when-cross-origin

[Response Headers]
accept-ranges: bytes
cache-control: public, max-age=0
date: Thu, 19 Aug 2021 14:27:09 GMT
etag: W/"82cc92-17b5cb83408"
last-modified: Thu, 19 Aug 2021 04:43:01 GMT
server: CloudFront
via: 1.1 f681dbff28feeb503e3ad2f4be29ead3.cloudfront.net (CloudFront)
x-amz-cf-id: OgTtmM59-0C7A8KfeXsoiUWBrAduM1CHuVZnjHNFuFzPy6BgS7Datg==
x-amz-cf-pop: ICN55-C1
x-cache: Miss from cloudfront
```

## Reference

- https://developer.mozilla.org/ko/docs/Web/HTTP/Caching
