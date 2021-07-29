# RIOT API를 활용하는 discord bot 개발하기(1)

## 개요

League of Legends 라는 게임을 너무 열심히 하고있는 바람에 어떻게 하면 이기고 어떻게 하면 지는지 너무너무 궁금해져버렸습니다...(제발 이기게 해줘...) 주로 저는 5인 자유랭크나, 10인 내전을 하는데, 솔로랭크의 경우에는 나의 플레이, 나의 챔프 외에 다른 변수를 통제할 수 없어 밴픽이나 플레이방향을 꺾는데에 큰 의미가 없지만, 5인 자랭이나 10인 내전을 진행하면, 우리팀의 밴픽, 플레이 방향 자체를 바꿔나갈 수 있어 의미 있는 데이터를 쌓고, 참고할 수 있을 것 같아 평소 게임시에 활용하는 디스코드 플랫폼을 활용해 그때그때 데이터를 활용하고 게임플레이에 참고하기 위해 작업을 진행하게 되었습니다.

데이터 어쩌고 해결 어쩌고로 큰 막을 열었지만,  가장 큰 목표는 같이 롤하는 친구들이 즐길 수 있는 봇을 만드는 겁니다. 그래서 우리 팀의 마스코트가 된 친구네 집 고양이 금동이를 테마로해서, 처음 만나면 인사해주고, 반가워해주는 것을 가장 큰 목표로 삼았습니다.

![자고있는 금동이](https://cdn.discordapp.com/attachments/301336894418059284/870002755958374450/20210729_030017.jpg)

자고있는 금동이....귀여워...

- 우선 쓸모있지않아도 귀여운 것이 첫 목표였습니다.
- 두번째로는 실물 금동이의 귀여움을 어필할 수 있게 되는 것
- 세번째는 귀여운데 쓸모있기까지한 것이 목표입니다.



## 쓸모있지 않아도 귀여운 금동이봇

> "금동이는 귀엽기만 하면 된다"      - 2021.07.29, 강예원

우선 인사하는 금동이 봇을 개발해봅시다.

먼저 배포를 위한 서버를 뭘로할까 하다가 heroku, aws 등을 고민해보았습니다.

하지만 사진용량(2기가의 압박...!), 높은 사용율(디스코드에서 심심하면 금동이를 부르는 친구들...) 등으로 프리티어 ~ 소과금 수준에서는 힘들 것 같아 고민하다가 집에서 놀고있는 라즈베리파이를 서버로 활용해서 배포하기로 마음먹었습니다.



### 서버세팅

#### 라즈베리파이에 OS 설치하기

미리 설치해 둔 라즈베리 파이를 활용해 저는 이 과정을 거치지 않았습니다ㅠ

SD카드에 라즈베리파이OS를 설치하고, ssh를 위한 설정을 추가해둡니다.

#### SSH접속을 위한 IP주소 확인하기

같은 공유기를 통해 접속하려고 한다면, 192.168.0.*와 포트번호를 통해 접속할 수 있습니다.

공유기 설정 페이지에서 내부네트워크, 사용중인 IP주소를 확인하면, SSH접속을 위한 모든 준비가 완료됩니다.

![image](https://user-images.githubusercontent.com/45934061/127484588-59ca3530-dea1-43c6-a155-0cd4fa9ca063.png)

192.168.0.5를 쓰는 것을 확인할 수 있습니다!



#### 포트포워딩 설정하기

근데 사실 완료되지 않았어요... 왜냐면 같은 망에서 뿐 아니라 github actions이 제 봇을 자동으로 배포해주기 원했기 때문에!

github actions는 가고싶은대로 가는 문도같은 친구기 때문에, 외부에서도 접근할 수 있게 공유기 설정 페이지에서 포트포워딩 설정을 열어줍니다. 내부 IP주소는 아까 확인했던 192.168.0.5번, 포트번호 22번(default)을 적어줍니다

저는 외부기준 9000번으로 포트번호를 열어주었습니다.

![image](https://user-images.githubusercontent.com/45934061/127484659-48a3d1a5-39cd-4f3d-9636-80dbe35bed1c.png)

설정을 완료하면, ip주소와 포트넘버가 노출됩니다. 확인 후에 SSH접속을 시도해봅시다!

#### SSH 접속하기

ssh접속해서 터미널로 vi활용해서 개발하다보니 답답해서 속도가 점점 더 느려지는 현상이 발견되었습니다... 처음엔 github actions로 자동배포시스템을 구축하고 그 후에 이거저거 테스트해보려고했는데 아뿔싸.... 금동봇을 맛보여주고 나니 친구들의 문의가 쇄도했습니다.

`금동이봇 언제나와?` `금동이 자러갔어?` `금동이 뭐해?` `빨리 금동봇 개발안하고 뭐해!!` 등등...

SSH로 접속해서 그냥 라즈베리파이에서 개발해버리기로 마음먹었습니다. vs code의 extension을 활용해봅시다.

![image](https://user-images.githubusercontent.com/45934061/127472958-c13668f7-44e8-41ac-b690-98b36a705f3a.png)

install 후에  ctrl + shift + p를 눌러 command pallet를 열고 username, 아까 확인한 ip주소를 통해 접속합니다.

이렇게 되면, 금동이봇을 개발하기 위한 서버 세팅이 모두 끝났습니다. 이제 개발을 진행하면 됩니다.



### 디스코드 봇을 만들어봅시다.

discord 봇 개발을 위해 discord api를 직접 활용해도 되지만, 얼마전에 geeknews에 올라왔던 discord.js를  인상깊게 봤던 기억이 있어서 node 환경에서 discord js 라이브러리를 활용해서 개발하기로 마음먹었습니다.

#### 디스코드 봇 초기설정하기

https://discord.com/developers/applications

위의 주소에 접속해 로그인하고, new application 생성버튼을 통해 이름설정 후 application을 생성한다. 이후 bot 탭에서 bot을 생성하고 이름, 아이콘 설정 후 token을 받습니다!

![image](https://user-images.githubusercontent.com/45934061/127484289-8c956730-dbb0-491c-be64-7c4110a069fc.png)

#### 금동이 인사시키기

```javascript
const Discord = require("discord.js")
const client = new Discord.Client()


client.on("ready", () => {
    console.log(`${client.user.tag}이에 로그인했습니다!`)
})


client.login(process.env.TOKEN)
```

[discord.js](https://discordjs.guide/)를 npm 으로 인스톨하고, 로그인을 해봅시다. 이후 커맨드 파일을 생성해서 login을 시도해봅시다. 금동이가 반갑게 로그인되었다는 메시지를 줄 겁니다.

```javascript
client.on("message", msg => {
    if (!msg.author.bot) {
        if (msg.include('금동이')) {
            msg.reply("불렀냥?")
        }
    }
})
```

![image](https://user-images.githubusercontent.com/45934061/127488106-f6565906-c734-4b09-8efe-a17a10d7eb88.png)



#### Command  분리하기

![image](https://user-images.githubusercontent.com/45934061/127487780-e101cf2b-01e7-4b9f-8c3f-3b0ce72481ab.png)

하지만 이런식으로 일일히 커맨드를 때려박다보면 스파게티코드를 만들기 십상입니다. 이를 방지하기 위해 command 폴더에 파일을 각각 분리하고, 파일을 읽어들여 커맨드를 excute 시킵니다.

```javascript
module.exports = {
  name: 'ping',
  description: 'Ping!',
  execute(message, args) {
    message.channel.send('Pong.')
  },
}
```



### 실물 금동이의 귀여움을 어필하는 금동이 봇

이제 그럼 금동이 봇이 그냥 귀여운 금동이봇으로 끝나면 안되니까, 실물 금동이의 귀여움을 널리널리 자랑할 수 있게 하는 커맨드를 만들어줍시다. static 폴더에 사진과 비디오를 각각 나눠 담아주고, discord embed를 통해 금동이의 사진을 나눠줍니다.

```javascript
const config = require('../config.json')

const Discord = require('discord.js')
const fs = require('fs')

const photoFolderPath = './static/photos'
const photos = fs.readdirSync(photoFolderPath)

module.exports = {
    name: '사진',
    description: `
        나는 세상에서 제일 귀여운 고양이!
        '/사진'처럼 사용해보라냥
        내 사진을 랜덤으로 준다냥!
    `,
    execute(message, args) {
        const randomNumber = Math.random() * photos.length
        const randomPhoto = photos[Math.trunc(randomNumber)]

        const photoEmbed = new Discord.MessageEmbed()
            .setTitle('내사진이다냥!')
            .attachFiles([photoFolderPath + '/' + randomPhoto])

            message.channel.send(photoEmbed)
    },
}
```

다음과 같이 설정하면, 금동이 봇이 이제 사진을 줍니다.

![image](https://user-images.githubusercontent.com/45934061/127490049-32da0234-8eef-4a12-8cc0-e9e2c82533f4.png)



## 다음 이 시간에

다음시간에는 `RIOT API를 활용하는 discord bot 개발하기(2)` 로 찾아뵙겠습니다.

라이엇 API를 통해 데이터를 적재하고, 이를 바탕으로 금동이가 어떻게 쓸모있는 정보를 나눠줄 수 있는지 확인해보겠습니다!

아쉬우니까 금동이 사진 몇장 더 놓고 갑니다!

![image](https://user-images.githubusercontent.com/45934061/127490708-da575029-81d0-461b-bcb8-339a8b2bc5ea.png)
![image](https://user-images.githubusercontent.com/45934061/127490714-97089294-176d-4525-91a9-bb3ff40461f8.png)



##### REFERENCE

- [discord.js guide](https://discordjs.guide/)
- 금동이 주인님이 사진 2기가 주심

