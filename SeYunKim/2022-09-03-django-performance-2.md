# Django 성능 향상 - Part2: 코드 최적화

# [Django Performance Improvements - Part 2: Code Optimization(Django 성능 향상 - Part2: 코드 최적화)](https://blog.sentry.io/2022/07/05/django-performance-improvements-part-2-code-optimization/)

다음으로 소개할 글은Sentry 및 Python용 애플리케이션의 Profiler(프로파일러를 사용해 서비스를 개선하는 방법을 설명합니다. 이 게시물을 확인하여 Sentiry의 향후 애플리케이션 및 모바일 애플리케이션의 프로파일링 제인을 확인해보 긴급한 문제를 더 빨리 해결할 수 있도록 성능 모니터링에 대해서 투자하고 있습니다. 프로파일링을 처음 접하는 사람들을 위해 애플리케이션 프로파일러는 주어진 작업에서 발생하는 모든 단일 호출을 캡처해 성능 모니터링 데이터로 사용합니다. 아래에서 읽을 수 있듯이 프로파일링 데이터는 자체적으로는 분석하기 어려울 수 있습니다. Sentry의 오류 및 성능 모니터링과 함께 사용하면 개발자는 속도가 느린것을 알 수 있을뿐만 아니라 원인이 되는 함수까지 확인할 수 있습니다.

개발자는 지속적으로 사용자가 만족하고, 애플리케이션의 속도가 빠르게 실행될 수 있도록 성능 최적화를 합니다. 코드 최적화는 코드 품질과 효율성을 향상 시키기 위해 적용합니다.

코드 최적화는 실행 시간을 적게 걸리는 코드 작성합니다. Django 애플리케이션의 느린 코드를 분석하고 속도를 향상시키는 방법을 알아보겠습니다.

다음 원칙에 따라 코드 최적화를 수행하는 방법을 다룹니다.

-   Django Debug Toolbar를 사용한 성능 개선(Performance Insights with Django debug Toolbar)
-   Profiling
-   지속적인 데이터 베이스 연결(Persistent Database Connections)
-   비동기 요청(Asynchronous requests)
-   작업 스케줄링(Task Scheduling)
-   Django Serializer 최적화(Optimizing Django Serializers)
-   외부 의존성(Third-party Dependencies)

## Django Debug Toolbar를 사용한 성능 개선(Performance Insights with Django debug Toolbar)

Django 애플리케이션의 코드를 최적화 하기 위해선 몇가지 정보가 필요합니다.

-   주어진 시간에 실행되는 쿼리 수와 쿼리에 소요된 시간
-   캐시된 쿼리 등

[Django Debug Toolbar](https://github.com/jazzband/django-debug-toolbar) 를 pip로 설치해 위와 같은 정보를 얻을 수 있습니다.

```
python -m pip install django-debug-toolbar
```

설치가 완료되면 `[settings.py](http://settings.py)` 의 추가합니다.

```
INSTALLED_APPS = [
    *# ...*
        "debug_toolbar",
    *# ...*
]
```

다음엔 Django Debug Toolbar URL을 기본 URL로 추가합니다.

```
from django.urls import include, path

urlpatterns = [
    *# ...*
    path('__debug__/', include('debug_toolbar.urls')),
]
```

마지막으로 `[setting.py](http://setting.py)` 에 미들웨어로 추가합니다.

```
MIDDLEWARE = [
    *# ...*
        "debug_toolbar.middleware.DebugToolbarMiddleware",
    *# ...*
]
```

아래와 같이 Django Debug Toolbar가 동작합니다.

![https://images.ctfassets.net/em6l9zw4tzag/4jfRozprC4685lWNUPBRqF/019036bb1e363b36133f9bcf4276d2b1/djangp-performance-code-optimization-pt-2-image5.png](https://images.ctfassets.net/em6l9zw4tzag/4jfRozprC4685lWNUPBRqF/019036bb1e363b36133f9bcf4276d2b1/djangp-performance-code-optimization-pt-2-image5.png)

Django debug toolbar를 통해 얻은 정보로 코드 최적화가 필요한 부분을 알 수 있습니다.

## Profiling

코드 프로파일링은 RAM, 실행 시간 등과 같은 리소스를 사용하는 방법을 결정하는데 사용됩니다.

프로파일링은 어느 부분이 실행되는데 오래 걸리는지 진단하는기 위해 사용됨으로 코드 최적화의 첫 번째 단계가 됩니다.

만약 프로그램이 최적의 속도로 수행된다면 최적화는 필요가 없습니다. 그러나 코드의 특정 부분을 실행하는 데 너무 오래 걸리는 경우 더 나은 성능을 위해 최적화를 시작할 수 있습니다.

Python에는 대부분 사용자에게 권장되는 [cProfile](https://docs.python.org/3/library/profile.html#module-cProfile)라고 불리는 C 언어를 확장한 내장 프로파일러가 있습니다. 긴 시간 실행되는 프로그램에도 적합하며, 쉽고 빠르게 run() 함수를 이용해 프로파일링을 할 수 있습니다.

예를 들어, 간단한 파이썬 코드에서 cProfiler를 사용하는 방법은 아래와 같습니다.

```
import cProfile
import numpy as np
cProfile.run(np.sum(np.arange(1, 1000)))
```

### **Profiling Django applications**

Django-silk는 Django 애플리케이션에 프로파일링 기능을 쉽게 추가 해주는 도구입니다. django-silk로 프로파일링을 활성화하려면 먼저 pip로 설치해야 합니다.

```
pip install django_silk
```

설치 이후에 `[settings.py](http://settings.py)` 에 아래와 같이 추가합니다.

```
MIDDLEWARE = [
    ...
    'silk.middleware.SilkyMiddleware',
    ...
]

INSTALLED_APPS = (
    ...
    'silk'
)
```

다음에 urls.py에 아래와 같이 추가해 사용자 인터페이스를 활성화 합니다.

```
urlpatterns += [path('silk/', include('silk.urls', namespace='silk'))]
```

마이그레이션을 적용합니다.

```
python manage.py migrate
```

설정이 완료되면 django-silk가 모든 http 요청을 가로 채, 성능을 분석합니다.

### profiling 다음엔 무엇을 해야 하는가?

실행하는데 너무 오래 걸리는 부분을 발견한 다음 필요한 부분을 최적화할 수 있습니다.

프로파일링이 크게 변경되지 않는 경우에는 코드를 처음부터 다시 설계를 할 수 있지만 이는 상당한 노력이 필요합니다. 그러나 코드를 새롭게 다시 작성하는 것은 최후의 수단이어야 합니다.

코드 프로파일링이 제대로 수행되면 성능이 크게 향상되고 실행 시간이 향상될 수 있습니다.

## 지속적인 데이터베이스 연결(Persistent Database Connections)

기본적으로 Django는 자동으로 각 요청에 대해서 데이터베이스를 새로 연결해 실행한 후 요청이 끝나면 닫습니다. 데이터베이스 연결을 열고 닫는 이 프로세스는 예상보다 많은 리소스를 사용합니다.

Django 애플리케이션에서 지속적인 데이터베이스 연결을 유지하기 위해 `[settings.py](http://settings.py)` 에 `CONN_MAX-AGE`를 추가합니다.

```
DATABASES = {
    'default': {
        ...
        'CONN_MAX_AGE': 500
        }
}
```

[pgBouncer](https://www.pgbouncer.org/)와 [Pgpool](https://www.pgpool.net/mediawiki/index.php/Main_Page)와 같은 connection pooler를 사용할 수도 있습니다. 데이터베이스 connection pooler는 요청에 연결을 열고, 닫음으로써 데이터베이스가 주어진 시간에 여러 연결을 유지할 수 있게 합니다.

## 작업 스케줄링(Scheduling Tasks)

작업 스케줄링은 프로세스를 실행하는데 걸리는 시간을 제어할 수 없는 기능에 대해서는 필수적인 방법입니다.

예를들어, 고객이 외부 이메일 공급자를 사용해 일부 데이터를 보내도록 요청한다고 한다면, 이메일 공급자가 응답하는 데 시간이 걸릴 수 있으므로 이러한 작업을 작업 스케줄링으로 예약을 걸어두는것이 좋습니다.

무거운 작업은 성능을 저하시킬 수 있습니다. 따라서 백그라운드에서 실행하는 것이 좋으며 사용자는 계속 사이트를 이용할 수 있게 할 수 있습니다.

Django는 작업 대기열 관리도구로 [celery](https://docs.celeryq.dev/en/stable/django/first-steps-with-django.html?highlight=django)를 지원합니다.

pip를 통해 celery를 설치합니다.

```
pip install celery
```

Celery는 메시지를 전송하고 수신하기 위해 메시지 브로커가 필요합니다. Redis는 가장 일반적으로 사용되는 메시지 브로커입니다.

redis를 이용해 Celery를 구성하고 작업을 생성하는 방법은 아래와 같습니다.

```
from celery import Celery

# Create celery instance and set the broker location (RabbitMQ)
app = Celery('tasks', broker='redis://localhost')

@app.task
def generate_statement(user):
# fetch user data

# prepare a pdf file

# send an email with pdf data
```

보고서를 생성하는 전체 프로세스가 대기열(Queue)에 추가되고 Celery 작업자가 처리해 앱의 리소스를 확보합니다. Celery 작업자는 Django애플리케이션 웹 서버와 다르게 실행되어야 합니다.

## 외부 의존성(Third-party Dependencies)

외부 의존성으로 인해 코드에 불필요한 과부하가 추가되어 애플리케이션이 느리게 실행될 수 있습니다. Django 애플리케이션에 불필요한 패키지가 너무 많이 의존하지 않도록 하는 것이 좋습니다.

코드 성능을 위해 아래와 같이 가능합니다.

-   항상 패키지가 최신 버전인지 확인
-   성능이 좋지 않은 패키지는 다른 패키지로 교체
-   성능을 최적화 하는 자체 패키지 빌드

Django 애플리케이션의 속도를 늦추는 외부 의존성을 진단하기 위해 [Sentry](https://sentry.io/for/performance/)와 같이 API 호출에 대해 개요를 제공하는 도구를 사용하면 됩니다.

## 기타 최적화 방법

### **Loops**

Loops는 모든 프로그래밍 언어에서 요소들을 반복적으로 실행해야 하는 코드를 구성하는데 사용합니다.

Loops는 코드에 상당한 오버헤드가 발생할 수 있습니다. 대신 필요한 경우 `map()`을 사용해 봅시다. `map()` 함수는 메모리를 절약합니다. Loops가 목록을 메모리에 저장하는 동안 `map()` 함수는 주어진 시간에 메모리에 하나의 항목만 저장합니다.

```
import timeit

a =''
my_list = range(1,10)

for i in my_list:
    if i % 2 == 0:
        result = i**2
```

```
loop_time = timeit.timeit(stmt=a, number = 10000)
print(loop_time) #result is 0.0116
```

```
import timeit

b = ''
my_list = range(1,10)
result = map(lambda x: x**2, filter(lambda x: x%2 ==0, my_list))
```

```
map_time = timeit.timeit(stmt=b, number = 10000)
print(map_time) #result is 0.0034
```

위와 같이 `map()` 이 for문 보다 훨씬 빠릅니다.

### 최신 파이썬 버전을 사용

명백히 보이지만, 항상 최신 버전의 Python을 사용하는 것이 좋습니다. Python 3.10보다 [Python 3.11](https://www.phoronix.com/review/python-311-benchmarks)이 10-60% 더 빠릅니다.

### **NumPy 사용**

Numpy는 Python의 과학 컴퓨팅을 위한 기본 패키지 입니다. Numpy는 속도나 효율성 면에서 더 나은 성능을 보이는 데이터 구조를 제공합니다. Numpy의 배열은 Python list보다 빠르고 공간을 덜 차지 합니다.

Django 프로젝트에서 느린 부분을 진단해 더 빠르게 만드는 방법을 설명하였습니다. 이제 Sentry를 사용해 Django 애플리케이션의 상태를 모니터링하고 느린 데이터베이스 및 http 요청을 보는 방법을 다룰 것입니다.

## 성능 모니터링 방법

Sentry는 애플리케이션이 속도가 느린 위치와 해결 방법을 보여주는 진단 매트릭을 제공합니다. 각 요청-응답 주기에 소요된 총 시간과 사용자 만족도를 나타내는 성능 대시보드에 표시합니다.

다음과 같이 pip를 이용해 Sentry를 설치하고, [settings.py](http://settings.py)에 sdk를 추가합니다.

```
pip install --upgrade sentry-sdk
```

```
import sentry_sdk

def traces_sampler(sampling_context):
sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",

    traces_sample_rate=1.0,

    traces_sampler=traces_sampler
)
```

`traces_sample_rate` 는 프로덕션에 사용될 때 상당한 오버헤드를 발생시킬 수 있으므로, 조정해야 합니다.

대시보드는 아래와 같습니다.

![https://images.ctfassets.net/em6l9zw4tzag/2f2tQbGRdxRaVZAnz8fp64/c87b08dd2a8f5adf1e5fef1cd9b2dd1e/djangp-performance-code-optimization-pt-2-image2.png](https://images.ctfassets.net/em6l9zw4tzag/2f2tQbGRdxRaVZAnz8fp64/c87b08dd2a8f5adf1e5fef1cd9b2dd1e/djangp-performance-code-optimization-pt-2-image2.png)

여기서 정보를 수집하고 조치할 수 있습니다. 예를들어 사용자가 리소스에 접근하는데 걸린 평균 시간이 평균 시간을 초과하면 사용자 지표가 높아집니다.

![https://images.ctfassets.net/em6l9zw4tzag/4KgIn75zDUCO1ZjMA3yzDU/bfae113f03ae2f10df4caefcbe646e08/djangp-performance-code-optimization-pt-2-image3.png](https://images.ctfassets.net/em6l9zw4tzag/4KgIn75zDUCO1ZjMA3yzDU/bfae113f03ae2f10df4caefcbe646e08/djangp-performance-code-optimization-pt-2-image3.png)![https://images.ctfassets.net/em6l9zw4tzag/4YDhYQHPnbSJJm7b1SzxfM/77016cba7cb6ae16c8edb7c034b861b1/djangp-performance-code-optimization-pt-2-image1.png](https://images.ctfassets.net/em6l9zw4tzag/4YDhYQHPnbSJJm7b1SzxfM/77016cba7cb6ae16c8edb7c034b861b1/djangp-performance-code-optimization-pt-2-image1.png)

응답을 받는데 걸린 시간과 같은 모든 요청에 대한 자세한 정보도 확인할 수 있습니다.

![https://images.ctfassets.net/em6l9zw4tzag/7qF9fIkVpfUgw0KW66bGhM/4226144a0115de6481c00a47e3b1a625/djangp-performance-code-optimization-pt-2-image4.png](https://images.ctfassets.net/em6l9zw4tzag/7qF9fIkVpfUgw0KW66bGhM/4226144a0115de6481c00a47e3b1a625/djangp-performance-code-optimization-pt-2-image4.png)

## 결론

약간의 최적화를 통해 Django 애플리케이션 성능을 크게 향상시킬 수 잇지만, 코드 최적화는 멈출수 없습니다. 애플리케이션이 성장함에 따라 다루지 못할 수도 있는 심각한 문제가 발생할 수 있습니다. 따라서 모든 응용 프로그램 단계에서 코드 최적화 기술을 계속 업데이트해야 합니다. 조기에 최적화를 필요하는 것도 중요합니다. 조기에 최적화를 하는 방법은 프로덕션 환경에서 코드가 어떻게 수행되는지 파악하기 전에 코드를 최적화 하는 것입니다.

모든 최적화 프로세스의 첫번째 단계는 코드의 고성능을 보장하기 위해 프로파일링하는 것입니다. 그런 다음 동일한 방법을 사용해 고성능 코드를 작성할 수 있습니다. 애플리케이션이 성장함에 따라 각 단계에는 다른 최적화 기술이 필요합니다.
