# fastify.js, typeORM, typescript 를 이용한 RESTful API 만들기 - (1) 프로젝트 설정, 모델 생성

## 뭘 만드나

월요일부터 출근한 새 직장에서 fastify.js 와 PostgreSQL 를 사용하고 있어서 공부를 위해 간단한 프로젝트를 만들어보려 합니다. 🤓

인증된 사용자만 메모를 Create, Read, Update, Delete 할 수 있고 메모를 Create 한 사용자만 해당 메모를 Read, Update, Delete 하는 RESTful API 를 작성해봅시다.

사용자(User) Model 이 있고 메모(Memo) 모델은 사용자에게 속하는 Memo belongs to User 관계를 가지게 됩니다.

프로젝트에 사용된 코드는 [github](https://github.com/yyna/fastify-typescript-typeorm) 에서 확인 가능합니다.

## 만들어 봅시다

### 프로젝트 설정

1. initialize npm project
   ```
   npm init -y
   ```
2. install npm packages
   ```
   npm install --save fastify fastify-jwt fastify-plugin pg typeorm bcrypt
   ```
   - fastify
   - fastify-plugin
   - fastify-jwt: JWT 토큰을 이용한 인증을 구현하기 위해 사용합니다.
   - pg: PostgreSQL 클라이언트
   - typeorm
   - bcrypt: 회원가입/로그인 기능 구현 시 비밀번호 암호화에 사용합니다.
   ```
   npm install --save-dev @types/bcrypt @types/node typescript
   ```
   - typescript 사용을 위한 패키지 설치
3. 타입스크립트 설정 파일 생성

   ```
   npx tsc --init
   ```

   위 명령어를 입력하면 tsconfig.json 이라는 파일이 생깁니다. Model 작성을 위해 아래 표시된 두 옵션만 변경해줍니다.

   - experimentalDecorators: ES7 에서 추가된 decorator 를 사용하기 위해 true 로 변경해줍니다.  
     [ES7 decorator 에 관해 참조할만한 블로그](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841)
   - strictPropertyInitialization: 모델 클래스에선 property에 값을 초기화하지 않기 때문에 false 로 변경해줍니다.

   ```JSON
   {
        "strictPropertyInitialization": false,
        "experimentalDecorators": true
   }
   ```

4. package.json 에 start script 추가하기

   ```JSON
   {
       "scripts": {
            "start": "ts-node --files ./src/index.ts"
        }
   }
   ```

### fastify 인스턴스 (서버) 실행

```TypeScript
// src/index.ts
import fastify from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'

const PORT = process.env.PORT || '3000'
const server: fastify.FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse
> = fastify({ logger: true })

// test code
server.get('/', async (request, reply) => {
    return { hello: 'world' }
})

server.listen(+PORT, '0.0.0.0', (err) => {
    if (err) throw err
})
```

npm start 를 통해 src/index.ts 를 실행 후 브라우저로 localhost:3000 에 들어가보면 아래와 같이 잘 작동합니다.
![src/index.ts](./image/building-rest-api-using-fastify-typescript-typeorm-1/1.png 'src/index.ts')

### 모델 생성

1. Memo 모델 생성하기

   ```typescript
   // src/modules/memo/entity.ts
   import {
     CreateDateColumn,
     Column,
     Entity,
     PrimaryGeneratedColumn,
     UpdateDateColumn,
   } from 'typeorm';

   @Entity()
   export class Memo {
     @PrimaryGeneratedColumn()
     id: number;

     @Column({ type: 'varchar', length: 20, nullable: false })
     title: string;

     @Column({ type: 'varchar', length: 1000, nullable: false })
     content: string;

     @CreateDateColumn()
     created_at: Date;

     @UpdateDateColumn()
     updated_at: Date;
   }
   ```

2. 데이터베이스 연결 decorator 생성  
    fastify 인스턴스에 새로운 property 를 추가하는 decorate 라는 API가 있습니다. 자세한 설명은 [https://www.fastify.io/docs/v1.14.x/Decorators/](https://www.fastify.io/docs/v1.14.x/Decorators/) 를 참고해주세요.

   ```typescript
   // src/decorators/db.ts
   import fp from 'fastify-plugin';
   import { createConnection, getConnectionOptions } from 'typeorm';
   import { Memo } from '../modules/memo/entity';

   export default fp(async (fastify) => {
     try {
       const connectionOptions = await getConnectionOptions();
       const connection = await createConnection(connectionOptions);

       fastify.decorate('db', {
         memo: connection.getRepository(Memo),
       });
     } catch (error) {
       console.log(error);
     }
   });
   ```

   memo repository를 포함한 'db' decorator 를 생성합니다.

3. fastify 인스턴스에 'db' decorator 추가

```typescript
import fastify from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';

import db from './decorators/db'; // 추가된 부분 ✨

const PORT = process.env.PORT || '3000';
const server: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({ logger: true });

// test code
server.get('/', async (request, reply) => {
  return { hello: 'world' };
});

server.register(db); // 추가된 부분 ✨

server.listen(+PORT, '0.0.0.0', (err) => {
  if (err) throw err;
});
```

4. 데이터베이스 연결하기  
    TypeORM 에 PostgreSQL 을 연결하기 위한 설정을 해봅시다. 여러 방법으로 설정이 가능합니다. 저는 .env 를 통해 설정하는 방법을 사용하려고 합니다. 더 많은 방법은 https://github.com/typeorm/typeorm/blob/master/docs/using-ormconfig.md 링크를 참조해주세요.

   ```
   // .env
   TYPEORM_CONNECTION=postgres
   TYPEORM_PORT=5432
   TYPEORM_HOST=localhost
   TYPEORM_USERNAME=admin
   TYPEORM_PASSWORD=password123!
   TYPEORM_DATABASE=test
   TYPEORM_SYNCHRONIZE=true
   TYPEORM_ENTITIES=src/modules/*/entity.ts
   ```

   설정을 보면 알 수 있듯이 localhost 에 postgres 가 실행중이어야 합니다.

   ```yaml
   # docker-compose.yml
   services:
     postgres:
       image: postgres
       environment:
         POSTGRES_USER: admin
         POSTGRES_PASSWORD: password123!
         POSTGRES_DB: test
       ports:
         - '5432:5432'
       volumes:
         - my_dbdata:/var/lib/postgres
   volumes:
     my_dbdata:
   ```

   ```
   docker-compose up
   ```

   저는 docker-compose 를 사용하여 데이터베이스를 실행했습니다. 로컬에서 직접 실행해도 상관없습니다.

   npm start 를 통해 다시 서버를 실행합니다. localhost 에서 실행중인 PostgreSQL에 memo 라는 테이블이 생겼습니다. 성공적으로 작동하네요. 👏👏👏
   ![memo table](./image/building-rest-api-using-fastify-typescript-typeorm-1/2.png 'memo table')

5. User 모델 생성하기  
   위의 Memo 모델에는 Memo 를 소유한 사용자 정보가 없습니다. 사용자 모델을 추가해봅시다.

   ```typescript
   // modules/user/entity.ts
   import {
     CreateDateColumn,
     Column,
     Entity,
     PrimaryGeneratedColumn,
     UpdateDateColumn,
   } from 'typeorm';

   @Entity()
   export class User {
     @PrimaryGeneratedColumn()
     id: number;

     @Column({ type: 'varchar', nullable: false })
     email: string;

     @Column({ type: 'varchar', nullable: false })
     password: string;

     @CreateDateColumn()
     created_at: string;

     @UpdateDateColumn()
     updated_at: string;
   }
   ```

   db 데코레이터에 memo repository 를 추가했던 것과 같은 방법으로 user repository 도 추가합니다.

   ```typescript
   import fp from 'fastify-plugin';
   import { createConnection, getConnectionOptions } from 'typeorm';
   import { Memo } from '../modules/memo/entity';
   import { User } from '../modules/user/entity'; // 추가된 부분 ✨

   export default fp(async (fastify) => {
     try {
       const connectionOptions = await getConnectionOptions();
       const connection = await createConnection(connectionOptions);

       fastify.decorate('db', {
         memo: connection.getRepository(Memo),
         user: connection.getRepository(User), // 추가된 부분 ✨
       });
     } catch (error) {
       console.log(error);
     }
   });
   ```

   그리고 Memo 모델에 (메모를 소유한) 사용자 정보를 추가합니다.

   ```typescript
   // src/modules/memo/entity.ts
   import {
     CreateDateColumn,
     Column,
     Entity,
     PrimaryGeneratedColumn,
     UpdateDateColumn,
     ManyToOne, // 추가된 부분 ✨
     JoinColumn, // 추가된 부분 ✨
   } from 'typeorm';

   @Entity()
   export class Memo {
     @PrimaryGeneratedColumn()
     id: number;

     @Column({ type: 'varchar', length: 20, nullable: false })
     title: string;

     @Column({ type: 'varchar', length: 1000, nullable: false })
     content: string;

     @ManyToOne((type) => User) // 추가된 부분 ✨
     @JoinColumn({ name: 'user_id' }) // 추가된 부분 ✨
     user: User; // 추가된 부분 ✨

     @CreateDateColumn()
     created_at: Date;

     @UpdateDateColumn()
     updated_at: Date;
   }
   ```

   다시 npm start 를 해보면 user table 이 성공적으로 생성되었고 memo table 에 user_id 가 추가되었습니다!!!!
   ![memo table 2](./image/building-rest-api-using-fastify-typescript-typeorm-1/3.png 'memo table 2')
   ![user table](./image/building-rest-api-using-fastify-typescript-typeorm-1/4.png 'user table')
