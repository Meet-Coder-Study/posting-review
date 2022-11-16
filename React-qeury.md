# React-query
React-query는 서버의 값을 클라이언트에 가져오거나, 캐싱, 값 업데이트, 에러 핸들링 등 비동기 과정을 더욱 편하게 하는데 사용하는 라이브러리입니다.
React-query를 사용함으로써 서버, 클라이언트 데이터를 분류할 수 있습니다.
React-query의 장점으로는 다음과 같습니다.
### React-query의 장점
> 
- 캐싱
- get을 한 데이터에 대해 update를 하면 자동으로 get을 다시 수행한다. (예를 들면 게시판의 글을 가져왔을 때 게시판의 글을 생성하면 게시판 글을 get하는 api를 자동으로 실행 )
- 데이터가 오래 되었다고 판단되면 다시 get (`invalidateQueries`)
- 동일 데이터 여러번 요청하면 한번만 요청한다. (옵션에 따라 중복 호출 허용 시간 조절 가능)
- 무한 스크롤 (**[Infinite Queries (opens new window)](https://react-query.tanstack.com/guides/infinite-queries)**)
- 비동기 과정을 선언적으로 관리할 수 있다.
- react hook과 사용하는 구조가 비슷하다

아래부터는 제가 프로젝트에 한번 도입해본 React-qeury의 예시 코드입니다.
```js
//index.js
//...
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<QueryClientProvider client={queryClient}>
		<ReactQueryDevtools initialIsOpen={true} />
		<App />
	</QueryClientProvider>,
);
```
```js
// src>hooks>query>useGetProfile.js
import { useQuery } from 'react-query';
import { getProfile } from '../../api/getProfile';
export const useGetProfile = () => {
	return useQuery('getProfile', getProfile, {
		retry: 0,
		onSuccess: res => {
			console.log(res);
		},
	});
};
```
```js
// src>pages>Home>Main>HomaMain.js
// ...
const response = useGetProfile().data;
console.log(response);
```
위와 같이 출력하면 아래와 같이 화면에 출력이 됩니다.

![](https://velog.velcdn.com/images/gueit214/post/e107ca4f-aefa-4e9d-90d8-e5d17a98995f/image.png)
위 방법 외에도 
useQueries, useMutation등 많은 메소드들이 있는데 다음번에 작성하도록하겠습니다.
