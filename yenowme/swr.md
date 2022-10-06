## 1. 개요

-   `SWR`은 캐시로부터 데이터를 반환한 후, fetch 요청(재검증)을 하고, 최종적으로 최신화된 데이터를 가져오는 전략
-   `useSWR` 함수는 첫번째 인자로 통신 주소, 투번째 인자로 통신 함수를 받아 그 결과를 첫번째 객체로, 에러를 두번째 객체로 전달함.
-   구
    ```jsx
    const { data, error, isValidating, mutate } = useSWR(key, fetcher, options);
    ```
    -   params
        -   `key` : 식별자, api 주소가 주로 들어감
        -   `fetcher` : Promise data를 반환하는 함수
        -   `option` : swr 옵션 설정 객체
    -   return value
        -   `data` : fetcher로부터 반환된 데이터
        -   `error` : fetcher 에러 객체
        -   `isValidating` : boolean fetching 중일때 ?
        -   `mutate` : 캐싱 데이터 업데이트 함수

## 2. 설치

```bash
yarn add swr
or
npm i swr
```

## 3. useSWR

1. 콜백 인자로 사용할 `fetcher` 함수를 제작한다

    ```jsx
    const fetcher = (url) => axios.get(url).then((res) => res.data);
    ```

2. `useSWR` 을 임포트 하고 함수 컴포넌트에서 사용하면 된다.

    ```jsx
    import useSWR from "swr";
    const fetcher = (url) => axios.get(url).then((res) => res.data);

    function Profile() {
        const { data, error } = useSWR("/api/user", fetcher);

        if (error) return <div>failed to load</div>;
        if (!data) return <div>loading...</div>;
        return <div>hello {data.name}!</div>;
    }
    ```

3. 커스텀 훅을 만들어서 사용해도 된다.

    ```jsx
    function useUser(id) {
        const { data, error } = useSWR(`/api/user/${id}`, fetcher);

        return {
            user: data,
            isLoading: !error && !data,
            isError: error,
        };
    }
    ```

    - 여러 컴포넌트에서 동시에 호출하더라도 요청은 한번으로 병합된다.

## 4. mutate

```jsx
import useSWR, { useSWRConfig } from 'swr'

const App () => {

const { mutate } = useSWRConfig()
mutate('/api') //해당 키를 가진 swr에 갱신 요청

///...return
}
```

-   캐시를 업데이트 할 때 사용.
-   `mutate(key)` 를 호출하여 동일한 키를 사용하는 다른`SWR hook`에게 갱신 메시지를 전역으로 브로드캐스팅할 수 있다.

**포스트 요청 시**

-   기본적으로 swr은 get에 특화되어있다. 따라서 post만 사용할 때는 큰 이점이 없다고 한다.
-   하지만 get으로 받아온 데이터를 업데이트 할 땐 mutate를 사용하면 효과적이다

```jsx
mutate(key, postData, false);
```

-   포스트 요청을 보낼 때, 서버에서 받아오지 않고 로컬을 먼저 업데이트 시킬 수 있음 (세번째 인자를 false)로 두면 가능.
-   `useSWR`에 반환된 `mutate`로 `key`를 포함하지 않고 사용할 수 있음
    ```jsx
    import useSWR from "swr";

    function Profile() {
        const { data, mutate } = useSWR("/api/user", fetcher);

        return (
            <div>
                <h1>My name is {data.name}.</h1>
                <button
                    onClick={async () => {
                        const newName = data.name.toUpperCase();
                        // 데이터를 업데이트하기 위해 API로 요청을 전송
                        await requestUpdateUsername(newName);
                        // 로컬 데이터를 즉시 업데이트하고 갱신(refetch)
                        // 노트: 미리 바인딩 되었으므로 useSWR의 뮤테이트를 사용할 때는 key가 요구되지 않음
                        mutate({ ...data, name: newName });
                    }}
                >
                    Uppercase my name!
                </button>
            </div>
        );
    }
    ```
-   🚩 post api 와 get api가 다를 때
    1. `mutate`를 `false`로 한 뒤 로컬 데이터만 업데이트
    2. `axios`요청으로 데이터 post
    3. 다시 `mutate`실행해서 싱크 업데이트
    
    - 빠른 요청을 보내는 좋아요 버튼 같은 기능에 사용

## 5.데이터 자동 갱신

-   기본적으로 다시 사이트가 포커싱되면 캐시를 업데이트함
-   자주 업데이트가 필요한 값이라면 옵션에 `refreshInterval` 을 설정해서 데이터를 주기적으로 갱신할 수 있다
    ```jsx
    useSWR("/api/todos", fetcher, { refreshInterval: 1000 });
    ```

## 참고

-   [공식 사이트](https://swr.vercel.app/ko)
-   [공식 문서](https://swr.vercel.app/ko/docs/getting-started)
-   [공식 참고 깃 레포](https://github.com/vercel/swr/tree/master/examples)
    -   [Axios-typescript 예제](https://github.com/vercel/swr/blob/master/examples/axios-typescript/libs/useRequest.ts)
-   [typescirip-swr 참고 레포](https://github.com/diego3g/react-example-useswr/blob/master/src/services/useRequest.ts)
