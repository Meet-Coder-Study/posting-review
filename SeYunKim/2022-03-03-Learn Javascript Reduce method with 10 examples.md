# [Learn Javascript Reduce method with 10 examples](https://dev.to/ramgendeploy/learn-javascript-reduce-method-with-5-examples-128n)

reduce 메서드는 배열의 모든 항목에 함수를 적용하고 시작점에서 반복적으로 결과를 누족한 다음 단일 값 또는 객체를 반환합니다.

![https://res.cloudinary.com/practicaldev/image/fetch/s--X9dFgOkC--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vfq63k5midy69c78cjno.png](https://res.cloudinary.com/practicaldev/image/fetch/s--X9dFgOkC--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vfq63k5midy69c78cjno.png)

시작 값을 지정할수 있으며, 지정하지 않으면 배열의 첫번째 값을 사용합니다.

## 합과 곱셈

∑의 *D*∏

```jsx
// 합
[3, 5, 4, 3, 6, 2, 3, 4].reduce((a, i) => a + i);

// 초기값 없이 사용
[3, 5, 4, 3, 6, 2, 3, 4].reduce((a, i) => a + i, 5 );

[3, 5, 4, 3, 6, 2, 3, 4].reduce(function(a, i){return (a + i)}, 0 );

// 곱셈
[3, 5, 4, 3, 6, 2, 3, 4].reduce((a, i) => a * i);

```

위 예제는 배열의 첫번째 값을 가져오기 때문에 초기 값을 그대로 둘수 있지만 오프셋을 사용할 수 있습니다.

## 배열에서 최대값 찾기

```jsx
[3, 5, 4, 3, 6, 2, 3, 4].reduce((a, i) => Math.max(a, i), -Infinity);
```

각 반복에서 최대값을 반환하기 때문에 배열의 최대값을 찾을 수 있습니다. 그러나 실제로 위와 같은 방법을 사용하는 것 보다는 아래와 같은 방법을 사용하는게 좋습니다,90

```jsx
Math.max(...[3, 5, 4, 3, 6, 2, 3, 4]);
```

## 배열 합치기

```jsx
let data = [
  ["The","red", "horse"],
  ["Plane","over","the","ocean"],
  ["Chocolate","ice","cream","is","awesome"],
  ["this","is","a","long","sentence"]
]
let dataConcat = data.map(item=>item.reduce((a,i)=>`${a} ${i}`))

// Result
['The red horse',
'Plane over the ocean',
'Chocolate ice cream is awesome',
'this is a long sentence']

```

위와 같이 단일 문자열로 축소가 가능합니다.

## 배열에서 중복값을 제거하기

```jsx
let dupes = [1,2,3,'a','a','f',3,4,2,'d','d']
let withOutDupes = dupes.reduce((noDupes, curVal) => {
  if (noDupes.indexOf(curVal) === -1) { noDupes.push(curVal) }
  return noDupes
}, [])

```

배열에 인덱스가 있는지 확인하고 없으면 `-1` 을 반환하므로 배열에 없으면 추가할 수 있도록 처리합니다. 사실 이 작업은 Set을 사용하면 쉽게 할 수 있지만 둘다 괜찮다고 생각합니다.

## 괄호를 확인하기

```jsx
[..."(())()(()())"].reduce((a,i)=> i==='('?a+1:a-1,0);

//Long way with for loop
status=0
for i in string:
  if(i=="("):
    status=status+1
  elif(i==")"):
    status=status-1
  if(status<0):
    return False

```

status가 0이면 괄호가 정확하지 않고 불균형이 있다는 뜻으로 위와 같이 작성할 수 있습니다.

## 속성별로 그룹화 하기

```jsx
let obj = [
  {name: 'Alice', job: 'Data Analyst', country: 'AU'},
  {name: 'Bob', job: 'Pilot', country: 'US'},
  {name: 'Lewis', job: 'Pilot', country: 'US'},
  {name: 'Karen', job: 'Software Eng', country: 'CA'},
  {name: 'Jona', job: 'Painter', country: 'CA'},
  {name: 'Jeremy', job: 'Artist', country: 'SP'},
]
let ppl = obj.reduce((group, curP) => {
  let newkey = curP['country']
  if(!group[newkey]){
    group[newkey]=[]
  }
  group[newkey].push(curP)
  return group
}, [])

```

country key로 첫번째 배열을 그룹화 하는 방식으로 반복에서 키가 없는지 확인해 배열을 만들고 사람을 추가해 그룹 배열을 반환합니다. 

## 2차월 배열의 병합

```jsx
let flattened = [[3, 4, 5], [2, 5, 3], [4, 5, 6]].reduce(
  (singleArr, nextArray) => singleArr.concat(nextArray), [])

// results is [3, 4, 5, 2, 5, 3, 4, 5, 6]
```

깊이가 1이지만 재귀 함수로 이를 조정할 수 있습니다. 그러나 재귀는 별로 좋은 방법은 아닙니다. 그래서 `flat` 메서드를 사용하면 같은 결과가 나옵니다.

```jsx
[ [3, 4, 5],
  [2, 5, 3],
  [4, 5, 6]
].flat();
```

## 양수만 거듭제곱 하기

```jsx
[-3, 4, 7, 2, 4].reduce((acc, cur) => {
  if (cur> 0) {
    let R = cur**2;
    acc.push(R);
  }
  return acc;
}, []);

// Result
[16, 49, 4, 144]

```

필터링하는것과 동일하게 양수만 거듭제곱 할 수 있습니다.

## 문자열 뒤집기

```jsx
const reverseStr = str=>[...str].reduce((a,v)=>v+a)
```

문자열뿐만 아니라 모든 객체에서 작동하며 `reduce` 가 있어 뒤집기가 가능합니다.

## 2진수를 10진수로

```jsx
const bin2dec = str=>[...String(str)].reduce((acc,cur)=>+cur+acc*2,0)

// Long format for readability
const bin2dec = (str) => {
  return [...String(str)].reduce((acc,cur)=>{
    return +cur+acc*2
  },0)
}

```
