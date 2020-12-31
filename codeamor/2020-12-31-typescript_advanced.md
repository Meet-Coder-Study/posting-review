# 맵드 타입 (Mapped Type)

기존에 정의되어 있는 타입을 새로운 타입으로 변환해 주는 문법.
마치 자바스크립트 map()함수를 타입에 적용한 것과 같은 효과를 가집니다.

> ## 기본 문법

```ts
{ [ P in K ] : T }
{ [ P in K ] ? : T }
{ readonly [ P in K ] : T }
{ readonly [ P in K ] ? : T }
```

> ## 기본 예제

<br>

헐크, 토르, 캡틴을 유니온(합집합) 타입으로 묶어주는 Heroes라는 타입이 있습니다.

```ts
type Heroes = "Hulk" | "Thor" | "Capt";
```

여기서 이 세 영웅의 이름에 각각 나이까지 붙인 객체를 만들고 싶다고 한다면 아래와 같이 변환할 수 있습니다.

```ts
type HeroProfiles = { [K in Heroes]: number };
const heroInfo: HeroProfiles = {
  Hulk: 54,
  Thor: 1000,
  Capt: 33,
};
```

위 코드에서 [K in Heroes] 부분은 마치 자바스크립트의 for in 문법과 유사하게 동작합니다.
앞에서 정의한 Heroes 타입의 3개의 문자열을 각각 순회하여 number 타입을 값으로 가지는 객체의 키로 정의가 됩니다.

```ts
{
  Hulk: number;
} // 첫번째 순회
{
  Thor: number;
} // 두번째 순회
{
  Capt: number;
} // 세번째 순회
```

따라서 위의 원리가 적용된 HeroProfiles의 타입은 아래와 같이 정의됩니다.

```ts
type HeroProfiles = {
  Hulk: number;
  Thor: number;
  Capt: number;
};
```

> ## 실용 예제 1

<br>

앞에서 살펴본 예제는 맵드 타입의 문법과 동작을 이해하기 위해 간단한 코드를 사용했습니다. 실제로 서비스를 개발할 때는 위와 같은 코드보다는 아래와 같은 코드를 더 많이 사용하게 됩니다.

```ts
type Subset<T> = {
  [K in keyof T]?: T[K];
};
```

위 코드는 키와 값이 있는 객체를 정의하는 타입을 받아 그 객체의 부분 집합을 만족하는 타입으로 변환해주는 문법입니다. 예를 들면 만약 아래와 같은 인터페이스가 있다고 할 때

```ts
interface Person {
  age: number;
  name: string;
}
```

위 Subset 타입을 적용하면 아래와 같은 객체를 모두 정의할 수 있습니다.

```ts
const ageOnly: Subset<Person> = { age: 23 };
const nameOnly: Subset<Person> = { name: "Tony" };
const ironman: Subset<Person> = { age: 23, name: "Tony" };
const empty: Subset<Person> = {};
```

> ## 실용 예제 2

<br>

아래와 같이 사용자 프로필을 조회하는 API 함수가 있다고 했을 때

```ts
interface UserProfile {
  username: string;
  email: string;
  profilePhotoUrl: string;
}

function fetchUserProfile(): UserProfile {
  // ...
}
```

이 프로필의 정보를 수정하는 API는 아마 아래와 같은 형태일 것입니다.

```ts
interface UserProfileUpdate {
  username?: string;
  email?: string;
  profilePhotoUrl?: string;
}

function updateUserProfile(params: UserProfileUpdate) {
  // ...
}
```

이때 아래와 같이 동일한 타입에 대해서 반복하여 선언하는 것을 피해야 합니다.

```ts
interface UserProfile {
  username: string;
  email: string;
  profilePhotoUrl: string;
}

interface UserProfileUpdate {
  username?: string;
  email?: string;
  profilePhotoUrl?: string;
}
```

위의 인터페이스에서 반복되는 구조를 아래와 같이 재활용 할 수 있습니다.

```ts
type UserProfileUpdate = {
  username?: UserProfile["username"];
  email?: UserProfile["email"];
  profilePhotoUrl?: UserProfile["profilePhotoUrl"];
};
```

좀 더 줄여서 아래와 같이 정의할 수도 있습니다.

```ts
type UserProfileUpdate = {
  [p in "username" | "email" | "profilePhotoUrl"]?: UserProfile[p];
};
```

여기서 위 코드에 keyof를 적용하면 아래와 같이 줄일 수 있습니다.

```ts
type UserProfileUpdate = {
  [p in keyof UserProfile]?: UserProfile[p];
};
```
