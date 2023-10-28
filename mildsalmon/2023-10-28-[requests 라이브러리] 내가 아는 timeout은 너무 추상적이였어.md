# 1. python에서의 HTTP 통신 그리고 timeout

python에서 HTTP 통신을 하기 위해서 보통 requests 라이브러리를 사용한다.

Get 요청이든 Post 요청이든 무한정으로 응답을 기다리는 비극을 막기 위해 timeout 파라미터에 값을 넣어주곤 한다.

이 timeout이 정확히 어떤 순간의 timeout을 의미할까?

나는 막연하게 client에서 server의 응답을 받기까지의 시간이라고 생각했다.
그러면 아래 코드는 timeout=0.12초를 초과한 0.32초가 걸렸으니 에러가 발생해야 하지 않을까?

```python
res = Session().get("https://google.co.kr", timeout=0.12)

print(res.elapsed)

# 0:00:00.323224
```

여기에서 뭔가 이상하다는 것이 느껴졌다.

그래서 코드를 보려고 한다.

코드를 봄으로써 파악하고 싶은 것은 2가지다.

1. ConnectionTimeoutError, ReadTimeoutError가 어디서 발생하는가?
2. timeout을 초과하는 위 경우(res.elapsed=0.32)에 왜 Error가 발생하지 않았는가?

# 2. ConnectionTimeoutError, ReadTimeoutError가 어디서 발생하는가?

### A. Session().get()

Session 클래스의 get 메소드를 사용했으므로 그 코드를 따라가봤다.

```python
# Session().get()

    def get(self, url, **kwargs):
        r"""Sends a GET request. Returns :class:`Response` object.

        :param url: URL for the new :class:`Request` object.
        :param \*\*kwargs: Optional arguments that ``request`` takes.
        :rtype: requests.Response
        """

        kwargs.setdefault("allow_redirects", True)
        return self.request("GET", url, **kwargs)
```

별거 없다.

timeout은 kwargs에 패킹되어서 `get 메소드`로 넘어오고 `self.request()`로 넘어갈 때 언패킹될 것이다.

### B. Session().request()

```python
# Session().request()

    def request(
        self,
        method,
        url,
				...
        timeout=None,
				...
    ):
        # Create the Request.
				...

        # Send the request.
        send_kwargs = {
            "timeout": timeout,
            "allow_redirects": allow_redirects,
        }
        send_kwargs.update(settings)
        resp = self.send(prep, **send_kwargs)

        return resp
```

쓸데 없는 것들은 다 지우고 timeout만 추적해보려고 위 코드만 남겼다.

timeout은 send_kwargs 딕셔너리에 value로 들어가고 `self.send()` 메소드에 언패킹되어서 전달된다.

### C. Session().send()

```python
# Session().send()

    def send(self, request, **kwargs):
        """Send a given PreparedRequest.

        :rtype: requests.Response
        """
			# Get the appropriate adapter to use
        adapter = self.get_adapter(url=request.url)

        # Start time (approximately) of the request
        start = preferred_clock()

        # Send the request
        r = adapter.send(request, **kwargs)

        # Total elapsed time of the request (approximately)
        elapsed = preferred_clock() - start
        r.elapsed = timedelta(seconds=elapsed)

        # Response manipulation hooks
        r = dispatch_hook("response", hooks, r, **kwargs)
```

또 코드를 필요한 것만 남기고 지우면,

kwargs를 다시 패킹하고 `adapter.send(request, **kwargs)`에서 언패킹하여 전달한다.
그런데 `adapter`가 뭘까?

`adapter`는 `self.get_adapter(url=request.url)`을 통해서 얻었다.

### D. Session().get_adapter()

```python
# Session().get_adapter()

    def get_adapter(self, url):
        """
        Returns the appropriate connection adapter for the given URL.

        :rtype: requests.adapters.BaseAdapter
        """
        for (prefix, adapter) in self.adapters.items():

            if url.lower().startswith(prefix.lower()):
                return adapter
	```

Session 클래스의 필드로 self.adapters가 존재하고 url prefix에 따라 알맞는 adapter를 반환해주는 로직이다.

### E. Session().__init__()

```python
# Session().__init__()

...
        # Default connection adapters.
        self.adapters = OrderedDict()
        self.mount("https://", HTTPAdapter())
        self.mount("http://", HTTPAdapter())
```

`self.adapters`는 위 처럼 prefix, HTTPAdapter가 mount된 Dict이다.

adpater가 뭔지 알았으니 2-C로 돌아가서 생각해보자.

사실 adapter를 알고 싶었던 이유는 `adpater.send()`를 찾기 위해서였다. (adapter가 BaseAdapter로 추상화되어 있어서 send 메소드의 구현을 한눈에 확인하기 어려웠다.)

### F. HTTPAdapter().send()

```python
    def send(
        self, request, stream=False, timeout=None, verify=True, cert=None, proxies=None
    ):
			...
        ... conn...

        if isinstance(timeout, tuple):
            try:
                connect, read = timeout
                timeout = TimeoutSauce(connect=connect, read=read)
            except ValueError:
                raise ValueError(
                    f"Invalid timeout {timeout}. Pass a (connect, read) timeout tuple, "
                    f"or a single float to set both timeouts to the same value."
                )
        elif isinstance(timeout, TimeoutSauce):
            pass
        else:
            timeout = TimeoutSauce(connect=timeout, read=timeout)

        try:
            resp = conn.urlopen(
                method=request.method,
                url=url,
                body=request.body,
                headers=request.headers,
                redirect=False,
                assert_same_host=False,
                preload_content=False,
                decode_content=False,
                retries=self.max_retries,
                timeout=timeout,
                chunked=chunked,
            )

        ...

        except MaxRetryError as e:
            if isinstance(e.reason, ConnectTimeoutError):
                # TODO: Remove this in 3.0.0: see #2811
                if not isinstance(e.reason, NewConnectionError):
                    raise ConnectTimeout(e, request=request)

            ...

        ...

        ...

        except (_SSLError, _HTTPError) as e:
            ...

            elif isinstance(e, ReadTimeoutError):
                raise ReadTimeout(e, request=request)

            ...

        ...
```

여기에 timeout(connection timeout, read timeout)같은 내가 궁금한 것들이 전부 다 있다.

크게 나누면 아래 두개로 나눌 수 있겠다.

1. 내부적으로 timeout을 connect, read로 쪼개는 부분
2. ConnectionTimeoutError, ReadTimeoutError가 발생하는 부분

##### a. 내부적으로 timeout을 connect, read로 쪼개는 부분

1번은 최초에 get 요청을 할때 보내는 파라미터에 timeout을 tuple로 주면 connect, read로 알아서 분리해서 생각하겠다는 의미이다. 만약 tuple이 아닌 값만 입력했다면 connect, read의 값을 동일하게 생각하겠다는 말이다.

```python
# tuple로 주는 경우
res = Session().get("https://google.co.kr", timeout=(0.1, 2))

# 값(int, float ...)으로 주는 경우 (TimeoutSauce 내부 로직을 보니 bool을 제외한 나머지 값들은 캐스팅을 해준다.)
res = Session().get("https://google.co.kr", timeout=0.12)
```

##### b. ConnectionTimeoutError, ReadTimeoutError가 발생하는 부분

사실 궁금했던 것은 이 부분이다.

`conn.urlopen()`로 url을 열고 except나오는 것에 따라 timeout을 걸러주는 방식으로 보인다.

이제부터 conn.urlopen()으로 가보려고 한다.

conn은 HTTPConnectionPool 클래스다. (HTTPConnectionPool을 파악하는 것을 이 포스트에서 다루면 한도 끝도 없어질 것 같아서 생략한다.. ㅎ)

```python
# HTTPConnectionPool().urlopen()

    def urlopen(  # type: ignore[override]
        self,
        method: str,
        url: str,
        ...
        timeout: _TYPE_TIMEOUT = _DEFAULT_TIMEOUT,
        ...
    ) -> BaseHTTPResponse:
        ...

        conn = None

        ...
        try:
            # Request a connection from the queue.
            timeout_obj = self._get_timeout(timeout)
            conn = self._get_conn(timeout=pool_timeout)

            conn.timeout = timeout_obj.connect_timeout  # type: ignore[assignment]

            # Is this a closed/new connection that requires CONNECT tunnelling?
            if self.proxy is not None and http_tunnel_required and conn.is_closed:
                try:
                    self._prepare_proxy(conn)
                except (BaseSSLError, OSError, SocketTimeout) as e:
                    self._raise_timeout(
                        err=e, url=self.proxy.url, timeout_value=conn.timeout
                    )
                    raise

            # If we're going to release the connection in ``finally:``, then
            # the response doesn't need to know about the connection. Otherwise
            # it will also try to release it and we'll have a double-release
            # mess.
            response_conn = conn if not release_conn else None

            # Make the request on the HTTPConnection object
            response = self._make_request(
                conn,
                method,
                url,
                timeout=timeout_obj,
                body=body,
                headers=headers,
                chunked=chunked,
                retries=retries,
                response_conn=response_conn,
                preload_content=preload_content,
                decode_content=decode_content,
                **response_kw,
            )
            ...

        ...

        except (
            TimeoutError,
            HTTPException,
            OSError,
            ProtocolError,
            BaseSSLError,
            SSLError,
            CertificateError,
            ProxyError,
        ) as e:
            # Discard the connection for these exceptions. It will be
            # replaced during the next _get_conn() call.
            clean_exit = False
            new_e: Exception = e
            ...

            if isinstance(
                new_e,
                (
                    OSError,
                    NewConnectionError,
                    TimeoutError,
                    SSLError,
                    HTTPException,
                ),
            ) and (conn and conn.proxy and not conn.has_connected_to_proxy):
                new_e = _wrap_proxy_error(new_e, conn.proxy.scheme)
        ...
```

timeout과 관련된 부분만 가져왔는데도, 코드가 길다.

내 궁금증을 해소할만한 부분만 집어서 정리해보자.

1. `conn = self._get_conn(timeout=pool_timeout)`
2. `response = self._make_request()`

핵심만 보자면 2번만 봐도 되는데, 중간에 conn 객체가 어떤 클래스의 객체인지 알기 위해서 1번도 집어봤다.

### G. HTTPConnectionPool().\_get\_conn()

HTTPConnectionPool() 클래스의 \_get\_conn() 메소드를 따라가면, 얻을 수 있는 것이 HTTPConnection() 클래스의 객체이다.

(코드를 몇번 타고 넘어가서 객체를 생성하기 때문에, 별도로 코드를 남기지는 않았다.)

### H. HTTPConnectionPool().\_make\_request()

2번을 따라서 메소드를 타고 넘어왔다.

```python
    def _make_request(
        self,
        conn: BaseHTTPConnection,
        method: str,
        url: str,
				...
        timeout: _TYPE_TIMEOUT = _DEFAULT_TIMEOUT,
				...
    ) -> BaseHTTPResponse:
				...
        timeout_obj = self._get_timeout(timeout)
        timeout_obj.start_connect()
        conn.timeout = Timeout.resolve_default_timeout(timeout_obj.connect_timeout)

        try:
            # Trigger any extra validation we need to do.
            try:
                self._validate_conn(conn)
            except (SocketTimeout, BaseSSLError) as e:
                self._raise_timeout(err=e, url=url, timeout_value=conn.timeout)
                raise

        # _validate_conn() starts the connection to an HTTPS proxy
        # so we need to wrap errors with 'ProxyError' here too.
        except (
            OSError,
            NewConnectionError,
            TimeoutError,
            BaseSSLError,
            CertificateError,
            SSLError,
        ) as e:
            new_e: Exception = e
            if isinstance(e, (BaseSSLError, CertificateError)):
                new_e = SSLError(e)
            # If the connection didn't successfully connect to it's proxy
            # then there
            if isinstance(
                new_e, (OSError, NewConnectionError, TimeoutError, SSLError)
            ) and (conn and conn.proxy and not conn.has_connected_to_proxy):
                new_e = _wrap_proxy_error(new_e, conn.proxy.scheme)
            raise new_e

        # conn.request() calls http.client.*.request, not the method in
        # urllib3.request. It also calls makefile (recv) on the socket.
        try:
            conn.request(
                method,
                url,
                body=body,
                headers=headers,
                chunked=chunked,
                preload_content=preload_content,
                decode_content=decode_content,
                enforce_content_length=enforce_content_length,
            )

        # We are swallowing BrokenPipeError (errno.EPIPE) since the server is
        # legitimately able to close the connection after sending a valid response.
        # With this behaviour, the received response is still readable.
        except BrokenPipeError:
            pass
        except OSError as e:
            # MacOS/Linux
            # EPROTOTYPE is needed on macOS
            # https://erickt.github.io/blog/2014/11/19/adventures-in-debugging-a-potential-osx-kernel-bug/
            if e.errno != errno.EPROTOTYPE:
                raise

        # Reset the timeout for the recv() on the socket
        read_timeout = timeout_obj.read_timeout

        if not conn.is_closed:
            # In Python 3 socket.py will catch EAGAIN and return None when you
            # try and read into the file pointer created by http.client, which
            # instead raises a BadStatusLine exception. Instead of catching
            # the exception and assuming all BadStatusLine exceptions are read
            # timeouts, check for a zero timeout before making the request.
            if read_timeout == 0:
                raise ReadTimeoutError(
                    self, url, f"Read timed out. (read timeout={read_timeout})"
                )
            conn.timeout = read_timeout

        # Receive the response from the server
        try:
            response = conn.getresponse()
        except (BaseSSLError, OSError) as e:
            self._raise_timeout(err=e, url=url, timeout_value=read_timeout)
            raise
```

이 코드의 대부분은 except 구분으로 에러를 핸들링하는 부분이기 때문에 봐야할 코드가 딱 2줄 있다.

1. `self._validate_conn(conn)`
2. `conn.request(...)`부터 `response = conn.getresponse()`까지

##### a. self.\_validate\_conn(conn)

```python
        conn.timeout = Timeout.resolve_default_timeout(timeout_obj.connect_timeout)
```

우선 `self._validate_conn()`를 하기 전에 `conn.timeout`에 connect_timeout을 할당한다.
즉, 위 코드 이후에 호출하는 `self._validate_conn(conn)`에서 connect와 관련된 일이 진행될 것이라 생각해볼 수 있다.

2-G 에서 파악한 HTTPConnection 객체는 is_closed 프로퍼티가 False를 반환한다. 정확히는 HTTPConnection().sock 필드가 None이다.

왜냐하면, (내가 파악한게 맞다면) HTTPConnection 객체를 생성하고 별도의 작업을 안해주었기 때문이다.

그래서 `conn.connect()`을 호출하여 새로운 커넥션을 연결한다.

그리고 이 과정에서 HTTPConnection 클래스의 connect 메소드는 내부적으로 `self._new_conn()`을 호출한다.

```python
# HTTPConnection()._new_conn()

				....
        try:
            sock = connection.create_connection(
                (self._dns_host, self.port),
                self.timeout,
                source_address=self.source_address,
                socket_options=self.socket_options,
            )
				...
        except SocketTimeout as e:
            raise ConnectTimeoutError(
                self,
                f"Connection to {self.host} timed out. (connect timeout={self.timeout})",
            ) from e
```

여기에서 Socket을 연결할 때 Timeout이 발생하면 Connection Timeout이 발생하게 된다. (ConnectionTimeoutError)

##### b. conn.request(...)

`conn.request()`에서 요청을 전부 던진다.

그 다음 `conn.timeout = read_timeout`에서 read_timeout을 `conn.timeout`을 설정한다.
이제 이후에 호출되는 `response = conn.getresponse()`는 read와 관련되었다는 것을 유추할 수 있다.

`response = conn.getresponse()` 로 위에서 보낸 요청의 응답을 받는다.
이때 ReadTimeoutError가 발생할 수 있다.

즉, read timeout은 단순하게 생각해서 `서버가 요청을 처리하는 시간 + 서버가 보낸 요청이 클라이언트에 도달하는 시간`이라고 생각할 수 있다. (블러킹된 시간)

request()와 response()는 socket의 send()와 recv()가 추상화된 형태라고 볼 수 있다. 그래서 코드를 쭉 따라가면 socket 모듈쪽에서 막히는 부분이 생긴다. (구현이 안되어 있다거나..) 이 부분이 구현이 되어 있지 않아도 코드가 동작하는 이유는 CPython으로 구현되어 있기 때문이다.

좀 더 구체적으로는 request()는 sendall()이라는 메소드에서 막히게 된다. response()는 fp.readline()에서 막히게 된다.

request와 response가 순차적으로 처리되는데도 **대기**하는 작업이 없는 이유는 send()와 recv()가 내부적으로 blocking으로 구현되었기 때문이다.

# 3. timeout을 초과하는 위 경우(res.elapsed=0.32)에 왜 Error가 발생하지 않았는가?

이건 정확하게는 잘 모르겠다. 다만 코드를 보니까 여러 가능성을 추론해볼 수 있겠다.

### A. elapsed가 측정되는 위치를 생각해보면..

```python
        # Total elapsed time of the request (approximately)
        elapsed = preferred_clock() - start
```

elapsed는 connect와 read가 진행되는 상황을 전부 포함해서 측정한 시간이다.

그래서 최악의 경우 connect timeout 시간을 가득 채우고 read timeout 시간을 가득채울 경우 `Session().get("https://google.co.kr", timeout=0.12)`는 0.24가 나올 수 있다.

-> 그런데, 실제로는 0.32가 나왔다.

### B. read timeout이 패킷별로 적용된다?

만약에, read timeout이 패킷별로 적용된다고 생각해보자.

그러면 0.1초 걸리는 패킷이 3개라면 충분히 가능하다고 생각할 수 있는 시나리오가 된다.

-> 그런데, 버퍼관련된 코드는 찾았는데, 패킷마다 read timeout이 별도로 적용되는 코드는 찾지 못했다..

### C. 진실은?

와이어샤크를 통해 다 뜯어보면 알 수 있지 않을까? ㅎ