 elasticsearch에서 쓰이는 질의어 match / filter / bool / should / must 등 질의 쿼리와 tie_breaker, filter에 ^3 등을 붙이는 부스팅 쿼리(boosting) 가중치를 부여할 수 있다. 이러한 가중치는 검색 결과에 대한 가중치를 말한다.  **하지만, 이번에는 검색 결과에 대한 가중치가 아닌, 질의어를 쓰기 전에 특정 필드에 가중치를 우선 주고 시작하는 방법에 대해 포스팅하려고 한다.**

### **왜? 무엇때문에 필요했나?**

- 전체적인 데이터 중 특정 데이터를 우선적으로 보여주고 싶다. 왜냐면 질의어를 써서 검색을 하면 특정 질의어에 관련된 목록들만 나오기 때문이다.

### **무엇을 사용했는가?**

-  **function_score**를 사용하여 전체적인 데이터에 대해서 특정 데이터 필드에 가중치를 넣을 수가 있었다.

### **function_score를 어떻게 찾게 됐는가?**

사실 elasticsearch로 전체적인 데이터 중 특정 데이터를 우선적으로 보여주는 쿼리는 처음이었다. 그리고 elaticsearch에 대한 개념도 아직 제대로 잡히지는 않은 상태이다. 그래서 bool쿼리의 should를 이용하면 or로 적용이 되기 때문에 전체적인 내용 중에 특정 내용에 대해서만 우선적으로 나오는 줄 알았지만, 그게 아니었다. 그저 내가 검색한 질의어에 대해서만 결과가 나온 것을 확인할 수 있었다. 그래서 그때부터 어떻게 하면 전체적인 데이터 중 특정 데이터를 우선적으로 보여줘야 할지 찾아다닌 것 같다. 그래서 찾은 개념이 바로**function_score**이다.

### **function_score란?**

임의의 함수에 숫자로 점수를 지정하여 초기 질의에 맞는 문서의 점수를 결정하는데 이를 세부적으로 조절할 수 있도록 한다.

### **function_score를 어떻게 사용하면 되는데?**

**1) 일단 테스트 데이터를 넣어보자.**

```
{"index":{"_id":1}}
{"message":"The quick brown fox"}
{"index":{"_id":2}}
{"message":"The quick brown fox jumps over the lazy dog"}
{"index":{"_id":3}}
{"message":"The quick brown fox jumps over the quick dog"}
{"index":{"_id":4}}
{"message":"Brown fox brown dog"}
{"index":{"_id":5}}
{"message":"Lazy jumping dog"}
```

**2) 조회를 해보자.**

![](https://blog.kakaocdn.net/dn/blBI03/btrycRcmkb7/fBdK1qnKr0L6WG6RKJZ9f1/img.png)

1,2,3,4,5 순 데이터가 나오는 것을 볼 수가 있다.

해당 index를 select를 하면 전체적인 데이터를 조회하는 것이기 때문에 사진과 같이 모두 _score에 대해서는 1이 나온다.

여기서 이제 특정 데이터를 _score를 높이려고 한다. 나는 message에 lazy가 들어간 목록에 대해서 _score를 50으로 고정시키려고 한다.

**3) function_score를 이용하여 message에 lazy가 들어간 데이터에 대해 _score를 50을 주고 맨 위로 나타나도록 해보자.**

```
{
	"size": 50,
	"query": {
		"function_score": {
			"functions": [
				{
					"filter": {
						"match": {
						    "message": {
						        "query": "lazy"
						    }
						}
					},
					"weight": 50
				}
			]
		}
	}
}
```

function_score를 정의하고 functions 안의 filter를 두어 message에 lazy가 들어간 곳과 일치하는 데이터에 대해서만 50이라는 점수를 주게 했다.

해당 쿼리를 통하여 조회를 하면, 아래와 같은 결과가 나온다.

![](https://blog.kakaocdn.net/dn/bdt4Ip/btrye4BzjVT/iqkvK9pvhhFLPmACzg60J0/img.png)

질의어 없이 전체적인 데이터에 대해서 message에 lazy가 들어간 항목에 대해서 _score가 50으로 변하고 score가 높은 순으로 위로 올라간 것을 볼 수가 있다. 그러면, 이제부터 전체 데이터에 대해서 해당 질의어로 검색을 하면 특정 필드에 대해서는 전체 데이터 중에 가장 위로 노출시킬 수가 있다.

적용을 하기 전에 간단한 테스트는 완료하였다. 이제 function_score에 대해서 더 자세히 알아보려고 한다. 내가 원하는 걸 얻어냈다고 그 개념에 대한 학습은 버리는 게 아니다. 언제든지 다른 방법으로 사용할 수 있기 때문에 개념과 다양한 사용 방법에 대해서 알아보아야 한다.

### **function_score가 어떻게 쓰이는지 알아보자.**

function_score는 "위에서 임의의 함수에 숫자로 점수를 지정하여 초기 질의에 맞는 문서의 점수를 결정하는데 이를 세부적으로 조절할 수 있도록 한다." 적어놓았다.

```
{
  "query": {
    "function_score": {
      "query": { "match_all": {} },
      "boost": "5", // 1)
      "functions": [
        {
          "filter": { "match": { "test": "bar" } }, 
          "random_score": {},   // 2)
          "weight": 23
        },
        {
          "filter": { "match": { "test": "cat" } },
          "weight": 42
        }
      ],
      "max_boost": 42, // 3)
      "score_mode": "max", // 4)
      "boost_mode": "multiply", // 5)
      "min_score": 42 // 6)
    }
  }
}
```

function_score는 여러 가지 항목이 들어간다. 이러한 항목들은 score에 대해 세부적으로 할 수 있도록 설정할 수 있도록 도와준다.

1.  boost : 전체 데이터에 대해 기본적인 스코어를 준다.
2.  random_score : 해당 데이터에게 각각 랜덤 스코어를 준다.
3.  max_boost : 최대 스코어를 해당 스코어에 넘지 않도록 한다.
4.  score_mode : functions안에서 계산된 스코어를 계산한다.
5.  boost_mode : functions안에서 계산된 스코어와 질의에 대한 쿼리에 대해 계산한다.
6.  min_score : 최소 스코어 이상인 데이터만 보여주도록 한다.

또한 내가 사용한 filter를 사용한 간단한 스코어링 방법 외에도 다양한 방법을 function_score에서 제공을 한다.

-   boost_factor : 가장 간단한 함수로서, 단순한 상수를 곱한다.
-   field_value_factor : 숫자형 필드의 값을 스코어에 이용한다.
-   script_score : 스크립트를 통하여 스코어를 구한다.
-   random_score : 랜덤 하게 스코어를 줄 수 있게 한다.
-   decay functions : 가중치 감소에 대해 구현할 수 있다.

## **회고**

요번에는 내가 구현해야 하는 부분에 대해 방법을 찾아가는 일련의 과정을 포스팅에 녹여내 봤다. function_score가 첫 시도지만, 써보니깐 그때 왜 내가 왜 찾았는지, 찾는 과정에서 어떠한 시도가 있었는지에 대해 정리할 수 있는 시간이 될 수 있었고 개념에 대해 한번 더 복습할 수 있는 시간이 되었다. 한동안 기술 포스팅은 이렇게 작성을 해봐야 되겠다. 처음은 비록 허술하지만 좀 더 진화시켜봐야 되겠다는 생각이 든다.

## **출처** 
[https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-function-score-query.html](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-function-score-query.html)
[https://kazaana2009.tistory.com/6?category=813463](https://kazaana2009.tistory.com/6?category=813463)
[https://ksk-developer.tistory.com/27](https://ksk-developer.tistory.com/27)
