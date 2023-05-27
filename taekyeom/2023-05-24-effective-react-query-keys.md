# Effective React Query Keys

[TkDodo Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)

React Query에는 쿼리 키라는 개념이 있습니다

쿼리에 대한 종속성이 변경되면 라이브러리가 내부적으로 데이터를 캐시하고 자동으로 다시 가져올 수 있도록 합니다. 이러한 쿼리 캐시를 수동으로 상호 작용할 수 있습니다. 예를 들어 mutation 후 데이터를 업데이트하거나 일부 쿼리를 수동으로 무효화(invalidate)하는 경우가 있습니다.

## Caching Data

쿼리 키는 고유해야하며 React Query가 캐시에서 키에 대한 항목을 찾고 사용합니다. 동일한 키를 사용할 수는 없고 쿼리 캐시는 하나뿐입니다.

```tsx
useQuery(['todos'], fetchTodos)

// 🚨 this won't work
useInfiniteQuery(['todos'], fetchInfiniteTodos)

// ✅ choose something else instead
useInfiniteQuery(['infiniteTodos'], fetchInfiniteTodos)
```

## ****Automatic Refetching****

데이터를 변경하는 상태가 있는 경우 키가 변경될 때마다 refetch가 자동으로 트리거되므로 쿼리 키에 데이터를 넣기만 하면 됩니다.

```tsx
function Component() {
  const { data, refetch } = useQuery(['todos'], fetchTodos)

  // ❓ how do I pass parameters to refetch ❓
  return <Filters onApply={() => refetch(???)} />
}

function Component() {
  const [filters, setFilters] = React.useState()
  const { data } = useQuery(['todos', filters], () => fetchTodos(filters))

  // ✅ set local state and let it "drive" the query
  return <Filters onApply={setFilters} />
}
```

## ****Manual Interaction****

invalidateQueries 또는 setQueriesData와 같은 많은 상호 작용 메서드로 쿼리 키를 일치시킬 수 있는 Query Filters를 지원합니다.

## ****Colocate****

[Kent C. Dodds의 Colocation](https://kentcdodds.com/blog/colocation)

모든 쿼리 키를 /src/utils/queryKeys.ts에 글로벌하게 저장한다고 상황이 개선되지는 않습니다. 따라서 기능 디렉터리에 있는 해당 쿼리 옆에 쿼리 키를 보관합니다.

```tsx
- src
  - features
    - Profile
      - index.tsx
      - queries.ts
    - Todos
      - index.tsx
      - queries.ts
```

## ****Always use Array Keys****

쿼리 키도 문자열이 될 수 있지만, 통일성을 유지하기 위해 항상 배열을 사용해야 합니다.

React Query는 내부적으로 문자열을 배열로 변환합니다.

```tsx
// 🚨 will be transformed to ['todos'] anyhow
useQuery('todos')
// ✅
useQuery(['todos'])
```

## ****Structure****

```tsx
['todos', 'list', { filters: 'all' }]
['todos', 'list', { filters: 'done' }]
['todos', 'detail', 1]
['todos', 'detail', 2]
```

```tsx
function useUpdateTitle() {
  return useMutation(updateTitle, {
    onSuccess: (newTodo) => {
      // ✅ update the todo detail
      queryClient.setQueryData(['todos', 'detail', newTodo.id], newTodo)

      // ✅ update all the lists that contain this todo
      queryClient.setQueriesData(['todos', 'list'], (previous) =>
        previous.map((todo) => (todo.id === newTodo.id ? newtodo : todo))
      )
    },
  })
}
```

list와 detail의 구조가 많이 다르면 이 기능이 작동하지 않을 수 있으니 이를 대신해 모든 list를 무효화할 수 있습니다.

```tsx
function useUpdateTitle() {
  return useMutation(updateTitle, {
    onSuccess: (newTodo) => {
      queryClient.setQueryData(['todos', 'detail', newTodo.id], newTodo)

      // ✅ just invalidate all the lists
      queryClient.invalidateQueries(['todos', 'list'])
    },
  })
}
```

```tsx
function useUpdateTitle() {
  // imagine a custom hook that returns the current filters,
  // stored in the url
  const { filters } = useFilterParams()

  return useMutation(updateTitle, {
    onSuccess: (newTodo) => {
      queryClient.setQueryData(['todos', 'detail', newTodo.id], newTodo)

      // ✅ update the list we are currently on instantly
      queryClient.setQueryData(['todos', 'list', { filters }], (previous) =>
        previous.map((todo) => (todo.id === newTodo.id ? newtodo : todo))
      )

      // 🥳 invalidate all the lists, but don't refetch the active one
      queryClient.invalidateQueries({
        queryKey: ['todos', 'list'],
        refetchActive: false,
      })
    },
  })
}
```

## ****Use Query Key factories****

위의 예제에서는 쿼리 키를 수동으로 선언했습니다. 이는 오류가 발생하기 쉽고 변경을 더 어렵게 만듭니다. 따라서 더 많은 유연성을 위해 Query Key factory를 사용하는 것을 추천합니다.

```tsx
const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
}
```

```tsx
// 🕺 remove everything related to the todos feature
queryClient.removeQueries({ queryKey: todoKeys.all })

// 🚀 invalidate all the lists
queryClient.invalidateQueries({ queryKey: todoKeys.lists() })

// 🙌 prefetch a single todo
queryClient.prefetchQueries({
  queryKey: todoKeys.detail(id),
  queryFn: () => fetchTodo(id),
})
```