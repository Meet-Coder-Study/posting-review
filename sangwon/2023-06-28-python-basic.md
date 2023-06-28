# 파이썬을 파이썬답게 - 정수, 문자열, Iterable

## 1. 몫과 나머지

기본적으로 생각하는 방식

```py
a = 7
b = 5
print(a//b, a%b) # 1 2
```

내장 함수인 divmod와 unpacking(*) 사용

```py
a = 7
b = 5
print(*divmod(a, b)) # 1 2
```

> 무조건 divmod를 사용하는 게 좋은 방법은 아니다.
가독성이나, 팀의 코드 스타일에 따라서, a//b, a%b와 같이 쓸 때가 더 좋을 수도 있다.
또한, divmod는 작은 숫자를 다룰 때는 a//b, a%b 보다 느립니다. 대신, 큰 숫자를 다룰 때는 전자가 후자보다 더 빠르다. [참고 - Stack Overflow](https://stackoverflow.com/questions/30079879/is-divmod-faster-than-using-the-and-operators)

## 2. n진법으로 표기된 string을 10진법 숫자로 변환하기

파이썬에서는 파이썬의 int(x, base=10) 함수는 진법 변환을 지원한다.

```py
num = '444'
base = 5
answer = int(num, base)
print(answer) # 124
```
## 3. 문자열 정렬하기

파이썬에서는 ljust, center, rjust와 같은 string의 메소드를 사용해 코드를 획기적으로 줄일 수 있다.

```py
s = "abc"
n = 7
print(s.ljust(n)) # 좌측 정렬
print(s.center(n)) # 가운데 정렬
print(s.rjust(n)) # 우측 정렬

#"abc    
#  abc  
#    abc"
```

## 4. 알파벳 출력하기 - string 모듈

파이썬은 이런 데이터를 상수(constants)로 정의해놓았다.

```py
import string 

string.ascii_lowercase # 소문자 abcdefghijklmnopqrstuvwxyz
string.ascii_uppercase # 대문자 ABCDEFGHIJKLMNOPQRSTUVWXYZ
string.ascii_letters # 대소문자 모두 abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
string.digits # 숫자 0123456789
```

> 더 많은 string 상수를 [python documentation](https://docs.python.org/3/library/string.html)

## 5. 원본을 유지한채, 정렬된 리스트 구하기 - sorted

보통 다른 언어의 기준으로 보았을때 구현

```py
list1 = [3, 2, 5, 1]
list2 = [i for i in list1] # 또는 copy.deepcopy를 사용
list2.sort()
```

파이썬의 sorted 함수 사용

```py
list1 = [3, 2, 5, 1]
list2 = sorted(list1)
```

## 6. 2차원 리스트 뒤집기 - zip

보통은 다음과 같이 2중 for 문을 이용해 리스트의 row와 column을 뒤집는다.

```py
mylist = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
new_list = [[], [], []]

for i in range(len(mylist)):
    for j in range(len(mylist[i])):
        new_list[i].append(mylist[j][i])
```

파이썬의 zip과 unpacking 을 이용하면 코드 한 줄로 리스트를 뒤집을 수 있다.

```py
mylist = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
new_list = list(map(list, zip(*mylist)))
```

### zip

zip(*iterables)는 각 iterables 의 요소들을 모으는 이터레이터를 만든다.

```py
mylist = [1, 2, 3]
new_list = [40, 50, 60]
for i in zip(mylist, new_list):
    print (i)

(1, 40)
(2, 50)
(3, 60)
```

주요 사용 예

파이썬의 zip 함수와 dict 생성자를 이용하면 코드 단 한 줄로, 두 리스트를 합쳐 딕셔너리로 만들 수 있다.

```py
animals = ['cat', 'dog', 'lion']
sounds = ['meow', 'woof', 'roar']
answer = dict(zip(animals, sounds)) # {'cat': 'meow', 'dog': 'woof', 'lion': 'roar'}
```

---

> 참고 : 프로그래머스 [파이썬을 파이썬 답게](https://school.programmers.co.kr/learn/courses/4008/4008-%ED%8C%8C%EC%9D%B4%EC%8D%AC%EC%9D%84-%ED%8C%8C%EC%9D%B4%EC%8D%AC%EB%8B%B5%EA%B2%8C)