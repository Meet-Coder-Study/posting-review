---
title: Type-safe 그리고 Reliable
date: 2024-10-02
description: Typescript를 보다 신뢰할 수 있는 코드로 만드는 방법을 소개합니다.
tags: ["Typescript", "Zod"]
published: true
category: Typescript
introTitle: Typescript를 보다 신뢰할 수 있는 코드로 만드는 방법을 소개합니다.
introDesc: Zod를 통해서 Api Response에 Type을 설정하는 방법을 소개합니다.
---

### 우리가 TypeScript를 사용하는 목적은 무엇일까요?

저는 작성한 코드를 안전하게 관리하고, 예상치 못한 오류를 방지하는 것이라고 생각해요. 우리는 작성한 타입 정의를 **신뢰**할 수 있어야 합니다. 그렇지 않으면, 타입 정의로 인해 코드에서 버그가 발생할 수 있으며, 이는 생산성을 크게 저하시킬 수 있으니까요.

이 문제를 해결하는 간단하면서도 효과적인 방법으로, [**Zod**](https:https://zod.dev/)를 사용해 API 응답을 type-safe하게 관리할 수 있는 방안을 제안해볼게요.

### 왜 API Response를 검증해야 할까?

TypeScript로 프론트엔드 개발을 하면서 API Response에 타입을 설정하는 것은 흔한 일입니다. 하지만 실제로 서버에서 반환된 데이터의 타입이 우리가 정의한 타입과 일치하지 않는다면, 프론트엔드에서는 예상치 못한 오류가 발생할 수 있어요.

물론, 프론트엔드에서 에러 처리를 하거나 공통된 에러 처리 로직이 있다면 큰 문제는 방지할 수 있지만, 여전히 **보다 체계적이고 안전한 방식**으로 API 응답을 검증하고, 오류를 쉽게 핸들링할 수 있는 방법이 필요하다고 생각해요.

이번 포스팅에서는 **Zod**를 사용해 API Response 타입을 검증하고, 오류가 발생했을 때 간단하게 처리할 수 있는 방법을 소개해볼게요.

### Zod를 사용한 타입 검증

아래 코드는 API 응답 타입을 검증하는 `safeFactory` 함수입니다. 이 함수는 API 요청의 응답 타입이 우리가 기대한 타입과 일치하는지 검증하고, 일치하지 않으면 에러를 발생시킵니다.

```tsx:safeFactory {10-13}
import { z, ZodType } from "zod";
import { del, get, patch, post, put } from "../instance";

type Method = typeof get | typeof post | typeof put | typeof patch | typeof del;

const safeFactory =
  <A extends Parameters<Method>>(method: (...args: A) => ReturnType<Method>) =>
  <Z extends ZodType>(zodSchema: Z) =>
  async (...args: A): Promise<z.infer<Z>> => {
    const response = await method(...args);
    const parsed = zodSchema.safeParse(response);

    if (parsed.error) throw new Error("API_TYPE_NOT_MATCH");

    return parsed.data;
  };

export const safeGet = safeFactory(get);
export const safePost = safeFactory(post);
export const safePut = safeFactory(put);
export const safePatch = safeFactory(patch);
export const safeDel = safeFactory(del);

```

`safeFactory`는 API 요청 메서드와 Zod 스키마를 받아서, 응답이 스키마와 일치하는지 검증합니다.

해당 코드는 응답 데이터가 우리가 정의한 Zod 스키마와 100% 일치하는지 확인하는 간단한 과정입니다. 이 과정 덕분에 우리는 서버로부터 받아오는 데이터 타입에 대한 신뢰성을 확보할 수 있게 됩니다.

### 어떻게 사용할 수 있을까?

다음은 `safeFactory`를 실제로 사용하는 예시입니다:

```tsx:user-api
const UserSchema = z.object({
  userId: z.number(),
  userName: z.string(),
  image: z.string().url(),
  tags: z.array(z.string()),
});

type User = z.infer<typeof UserSchema>;

const user = await safeGet(UserSchema)("/user");
```

우리는 기존에 `axios.get`을 사용하던 방식과 매우 유사하게 API 요청을 작성할 수 있으며, 동시에 응답 타입을 안전하게 검증할 수 있어요. 이를 통해 API 응답에 대한 타입 신뢰도를 크게 높일 수 있었구요.

### 마치며

프론트엔드에서 중요한 과제중 하나는 데이터 검증이라고 생각해요. 우리가 작성한 타입 정의가 실제로도 신뢰할 수 있는지, 그리고 예상치 못한 오류를 미리 방지할 수 있는지를 점검하는 과정은 필수적이라고 생각합니다. Zod와 같은 도구를 통해 API 응답 타입을 검증하고, 코드의 안전성을 한층 강화할 수 있습니다.

타입 안정성에 대해 다시 한번 생각해보고, 코드가 더 신뢰할 수 있도록 개선해보는 건 어떨까요?
