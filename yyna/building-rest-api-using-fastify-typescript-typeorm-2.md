# fastify.js, typeORM, typescript 를 이용한 RESTful API 만들기 - (2) Route 생성, Middleware, Handler 작성

### Route 생성

1.  /memo route 추가하기

    ```typescript
    // src/modules/router.ts
    import fp from 'fastify-plugin';

    export default fp((server, opts, next) => {
      server.get('/memo', (request, reply) => {
        reply.code(200).send('get memo list');
      });

      server.get('/memo/:id', (request, reply) => {
        reply.code(200).send('get memo');
      });

      server.post('/memo', (request, reply) => {
        reply.code(200).send('create new memo');
      });

      server.patch('/memo/:id', (request, reply) => {
        reply.code(200).send('update memo');
      });

      server.delete('/memo/:id', (request, reply) => {
        reply.code(200).send('delete memo');
      });

      next();
    });
    ```

    fastify 인스턴스에 바로 Routes 를 추가할 수 있습니다. 자세한 내용은 https://www.fastify.io/docs/latest/Routes/ 를 참조해주세요.

    이제 { hello: 'world' } 를 응답하는 test code 를 지우고 route 를 추가해봅시다. decorator 를 등록하는 방법과 동일힙니다.

    ```typescript
    // src/index.ts
    import fastify from 'fastify';
    import { Server, IncomingMessage, ServerResponse } from 'http';

    import db from './decorators/db';
    import memo from './modules/memo/router'; // 추가된 부분 ✨

    const PORT = process.env.PORT || '3000';
    const server: fastify.FastifyInstance<
      Server,
      IncomingMessage,
      ServerResponse
    > = fastify({ logger: true });

    server.register(db);
    server.register(memo); // 추가된 부분 ✨

    server.listen(+PORT, '0.0.0.0', (err) => {
      if (err) throw err;
    });
    ```

2.  http request 만들기  
    테스트를 위해 VSCode extension 을 사용해서 http request 를 테스트해봅시다. Postman 으로 고통받고 있는 저를 보고 옆자리 개발자분이 추천해주셨는데 엄청 편리하더라구요.
    https://marketplace.visualstudio.com/items?itemName=humao.rest-client

    memo.http 파일을 생성

    ```
     # src/tests/requests/memo.http
     @host = http://localhost:3000

     ################################################ create new memo
     POST {{host}}/memo HTTP/1.1

     ################################################ get memo list
     GET {{host}}/memo HTTP/1.1

     ################################################ get memo
     GET {{host}}/memo/123 HTTP/1.1

     ################################################ update memo title
     PATCH {{host}}/memo/123 HTTP/1.1

     ################################################ delete memo
     DELETE {{host}}/memo/123 HTTP/1.1
    ```

    ![memo http](./image/building-rest-api-using-fastify-typescript-typeorm-2/1.png 'memo http')
    `Send Request` 텍스트를 눌러 바로 http request 생성이 가능합니다. 물론 서버가 실행중이어야 합니다. 5가지 request 모두 성공적으로 response 가 오네요. 💃🏻🕺🏻💃🏻🕺🏻

3.  /user route 추가
    memo route 를 추가한 것과 같은 방법으로 user route 도 추가합니다.

    ```typescript
    // src/index.ts
    import fastify from 'fastify';
    import { Server, IncomingMessage, ServerResponse } from 'http';

    import db from './decorators/db';
    import memo from './modules/memo/router';
    import user from './modules/user/router'; // 추가된 부분 ✨

    const PORT = process.env.PORT || '3000';
    const server: fastify.FastifyInstance<
      Server,
      IncomingMessage,
      ServerResponse
    > = fastify({ logger: true });

    server.register(db);
    server.register(memo);
    server.register(user); // 추가된 부분 ✨

    server.listen(+PORT, '0.0.0.0', (err) => {
      if (err) throw err;
    });
    ```

    http request 도 날려봅시다. 💃🏻🕺🏻💃🏻🕺🏻

    ```
     # src/tests/requests/user.http
     @host = http://localhost:3000

     ################################################ sign up
     POST {{host}}/sign-up HTTP/1.1

     ################################################ sign in
     POST {{host}}/sign-in HTTP/1.1
    ```

### Middleware 생성

1.  auth middleware 추가하기
    memo route 에 인증된 사용자만 접근할 수 있도록 middleware 를 추가합니다. JWT를 사용합니다.

    ```typescript
    // src/middlewares/auth.ts
    import fp from 'fastify-plugin';
    import jwt from 'fastify-jwt';

    export default fp((server, opts, next) => {
      server.register(jwt, {
        secret: 'secret',
      });
      server.decorate('auth', async (req: any, res: any) => {
        try {
          await req.jwtVerify();
        } catch (err) {
          res.send(err);
        }
      });

      next();
    });
    ```

    fastify 인스턴스에 추가합니다.

    ```typescript
    // src/index.ts
    import fastify from 'fastify';
    import { Server, IncomingMessage, ServerResponse } from 'http';

    import db from './decorators/db';
    import auth from './middlewares/auth'; // 추가된 부분 ✨

    import memo from './modules/memo/router';
    import user from './modules/user/router';

    const PORT = process.env.PORT || '3000';
    const server: fastify.FastifyInstance<
      Server,
      IncomingMessage,
      ServerResponse
    > = fastify({ logger: true });

    server.register(db);
    server.register(auth); // 추가된 부분 ✨

    server.register(memo);
    server.register(user);

    server.listen(+PORT, '0.0.0.0', (err) => {
      if (err) throw err;
    });
    ```

2.  FastifyInstance interface 에 property 추가하기  
    fastify 인스턴스에 db, auth, jwt decorator 를 추가했지만 FastifyInstance interface 에는 해당 property 가 없기때문에 사용을 위해 interface 변경이 필요합니다.

    ```typescript
    // src/@types/fastify/index.d.ts
    import { Server, IncomingMessage, ServerResponse } from 'http';
    import { Repository } from 'typeorm';

    import { Memo } from '../../modules/memo/entity';
    import { User } from '../../modules/user/entity';

    interface Repositories {
      memo: Repository<Memo>;
      user: Repository<User>;
    }

    declare module 'fastify' {
      export interface FastifyInstance<
        HttpServer = Server,
        HttpRequest = IncomingMessage,
        HttpResponse = ServerResponse
      > {
        db: Repositories;
        auth: any;
        jwt: any;
      }
    }
    ```

### Handler 작성하기

1.  로그인/회원가입 handler 작성하기

    ```typescript
    // src/modules/user/router.ts
    import fp from 'fastify-plugin';
    import bcrypt from 'bcrypt';

    export default fp((server, opts, next) => {
      server.post('/sign-up', async (request, reply) => {
        const { email, password } = request.body;
        const user = await server.db.user.findOne({ email });

        if (user) {
          reply.code(409).send('EMAIL_ALREADY_TAKEN');
        } else {
          await server.db.user.save({
            email,
            password: bcrypt.hashSync(password, 8),
          });
          reply.code(201).send();
        }
      });

      server.post('/sign-in', async (request, reply) => {
        const { email, password } = request.body;
        const user = await server.db.user.findOne({ email });

        if (user) {
          // check password
          if (bcrypt.compareSync(password, user.password)) {
            const token = server.jwt.sign(user.id + '');
            reply.code(200).send({ token });
          }
          // password mismatch
          else {
            reply.code(401).send('PASSWORD_MISMATCH');
          }
        } else {
          reply.code(404).send('USER_NOT_FOUND');
        }
      });

      next();
    });
    ```

    user.http 파일에 Content-Type 과 request.body 를 추가한 후 테스트 해봅니다.

    ```
    # src/tests/requests/user.http
    @host = http://localhost:3000

    ################################################ sign up
    POST {{host}}/sign-up HTTP/1.1
    Content-Type: application/json

    {
        "email": "test@email.com",
        "password": "testpassword"
    }

    ################################################ sign in
    POST {{host}}/sign-in HTTP/1.1
    Content-Type: application/json

    {
        "email": "test@email.com",
        "password": "testpassword"
    }
    ```

2.  메모 CRUD handler 작성하기  
    메모 handler 는 사용자 handler 와 다르게 preValidation 옵션을 사용합니다. 인증된 사용자만 접근할 수 있기 때문입니다. preValidation 으로 추가된 auth middleware 를 거쳐 request.user 에 사용자 정보가 담긴 채로 handler 에 전달 됩니다.

    ```typescript
    // src/modules/memo/router.ts
    // ....

    server.get(
      '/memo',
      { preValidation: server.auth },
      async (request, reply) => {
        const memos = await server.db.memo.find({
          where: {
            user: +request.user,
          },
        });
        reply.code(200).send({ memos });
      }
    );

    // ...
    ```

    [github 에서 router.ts 전체 코드 보기](https://github.com/yyna/fastify-typescript-typeorm/blob/master/src/modules/memo/router.ts)

3.  global 에러 핸들러 추가
    모든 에러를 한 곳에서 처리하기 위해 handler 에서 에러를 처리하지 않았습니다.

    ```typescript
    // src/index.ts
    // ...
    server.setErrorHandler((error, request, reply) => {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'INTERNAL_SERVER_ERROR';
      reply.code(statusCode).send({
        statusCode,
        message,
      });
    });
    // ...
    ```

    [github 에서 index.ts 전체 코드 보기](https://github.com/yyna/fastify-typescript-typeorm/blob/master/src/index.ts)

### 실행해보기

처음 만들고자 했던 API 접근 권한에 대해 다시 보면 아래와 같습니다.

> 인증된 사용자만 메모를 Create, Read, Update, Delete 할 수 있고 메모를 Create 한 사용자만 해당 메모를 Read, Update, Delete 하는 RESTful API 를 작성해봅시다.

/memo route 에 접근하기 위해서는 JWT token 이 필요합니다.  
회원가입 후 로그인시 응답에 포함된 token 을 memo.http 상단의 token 에 추가하면 memo route에 접근 가능합니다.

![로그인 응답 예시](./image/building-rest-api-using-fastify-typescript-typeorm-2/2.png '로그인 응답 예시')

아래 예시의 id=2, id=3 인 memo 는 id=1 인 사용자만 접근 가능합니다. 회원가입, 로그인 및 메모 Create, Read, Update, Delete 가 잘 작동됨을 확인할 수 있습니다.

![user table](./image/building-rest-api-using-fastify-typescript-typeorm-2/3.png 'user table')
![memo table](./image/building-rest-api-using-fastify-typescript-typeorm-2/4.png 'memo table')

RESTful API 가 완성되었습니다! 전체 코드는 github 에서 확인하실 수 있습니다.  
[github 에서 전체 코드 보기](https://github.com/yyna/fastify-typescript-typeorm)
