# LeagueCustomLobby
英雄联盟创建5V5训练模式

# 如何安装
1. [Python 3](https://www.python.org)   
2. [lcu-driver](https://github.com/sousa-andre/lcu-driver)  
    按下 Windows + R 打开运行窗口，输入 cmd ，在控制台输入指令：  
    ```
    pip install lcu-driver
    ```
3. 部分用户可能会遇到 **psutil.AccessDenied** 错误提示，需要额外执行安装：
    ```
    pip install -U psutil==5.6.5
    ```
  
# 如何使用

将 [create_custom_lobby.py](https://github.com/XHXIAIEIN/LeagueCustomLobby/blob/main/create_custom_lobby.py) 下载到本地任意地方，运行脚本即可。

  
<br><br>   
 
---

新增备注：
1. 官方已经更改了 lockfile 的方式，目前无法用以前的方法找到密钥了。   
推荐使用其他办法，例如读取进程数据。详情请参考这篇文章：https://hextechdocs.dev/getting-started-with-the-lcu-api/

用管理员权限打开终端，并运行以下指令
```
wmic PROCESS WHERE name='LeagueClientUx.exe' GET commandline
```

会得到类似这样的输出日志。当然，具体参数什么的，每次启动客户端看到的都不一样。  
注意，一定要使用管理员权限运行，否则你什么看不到。

```
Microsoft Windows [版本 10.0.19044.1865]
(c) Microsoft Corporation。保留所有权利。

C:\Users\XHXIAIEIN>wmic PROCESS WHERE name='LeagueClientUx.exe' GET commandline
CommandLine

"D:/Game/league of legends cn/英雄联盟/LeagueClient/LeagueClientUx.exe"
"--riotclient-auth-token=PVBsuiBiaNdAdIAnDoNg7yisxg"
"--riotclient-app-port=63381"
"--riotclient-tencent"
"--no-rads"
"--disable-self-update"
"--region=TENCENT"
"--locale=zh_CN"
"--t.lcdshost=hn1-sz-feapp.lol.qq.com"
"--t.chathost=hn1-sz-ejabberd.lol.qq.com"
"--t.lq=https://hn1-sz-login.lol.qq.com:8443"
"--t.storeurl=https://hn1-sr.lol.qq.com:8443"
"--t.rmsurl=wss://sz-rms-bcs.lol.qq.com:443"
"--rso-auth.url=https://prod-rso.lol.qq.com:3000"
"--rso_platform_id=HN1"
"--rso-auth.client=lol"
"--t.location=loltencent.sz.HN1"
"--tglog-endpoint=https://tglogsz.datamore.qq.com/lolcli/report/"
"--t.league_edge_url=https://ledge-hn1.lol.qq.com:22019"
"--ccs=https://cc-hn1.lol.qq.com:8093"
"--dradis-endpoint=http://some.url"
"--remoting-auth-token=lgxHX-LuAnDaXbyzA08w"        <---⭐ 找到这个参数 `--remoting-auth-token`
"--app-port=63405"                                  <---⭐ 找到这个参数 `--app-port`
"--install-directory=d:\game\league of legends cn\鑻遍泟鑱旂洘\LeagueClient"
"--app-name=LeagueClient"
"--ux-name=LeagueClientUx"
"--ux-helper-name=LeagueClientUxHelper"
"--log-dir=LeagueClient Logs"
"--crash-reporting=none"
"--crash-environment=HN1"
"--app-log-file-path=d:/game/league of legends cn/英雄联盟/LeagueClient/../Game/Logs/LeagueClient Logs/2022-08-03T14-38-37_8368_LeagueClient.log"
"--app-pid=8368"
"--output-base-dir=d:/game/league of legends cn/鑻遍泟鑱旂洘/LeagueClient/../Game"
"--no-proxy-server"

C:\Users\XHXIAIEIN>
```

主要需要找的信息就是  
```
--remoting-auth-token=XXXXX
--app-pid=XXX
--app-port=XXX
```
  
2. 这份笔记使用的是 lcu-driver，但我推荐你使用 [Willump](https://github.com/elliejs/Willump) 作为连接器会更方便。(因为当时 Willump 还没有出现)

Willump 快速上手
```python
import asyncio
import willump

async def get_summoner_data():
    summoner = await (await wllp.request("GET", "/lol-summoner/v1/current-summoner")).json()
    print(f"summonerName:    {summoner['displayName']}")
    print(f"summonerLevel:   {summoner['summonerLevel']}")
    print(f"profileIconId:   {summoner['profileIconId']}")
    print(f"summonerId:      {summoner['summonerId']}")
    print(f"puuid:           {summoner['puuid']}")
    print(f"---")


async def main():
    global wllp
    wllp = await willump.start()
    await get_summoner_data()
    await wllp.close()

if __name__ == '__main__':
  loop = asyncio.get_event_loop()
  loop.run_until_complete(main())
  loop.close()
```

<br><br>  


<br>  

# 参考资料
- [Riot 开发者文档](https://developer.riotgames.com/docs/lol)
- [版本英雄游戏数据](https://developer.riotgames.com/docs/lol#data-dragon_champions)
- [游戏数据资源列表](https://github.com/CommunityDragon/Docs/blob/master/assets.md)
- [LCU API 速查手册（需代理访问，来自 @mingweisamuel）](http://www.mingweisamuel.com/lcu-schema/tool/#/)
- [创建自定义训练模式房间数据](https://riot-api-libraries.readthedocs.io/en/latest/lcu.html)
- [掌盟战迹击杀记录地图](https://hextechdocs.dev/map-data/)      |      [游戏事件监听](https://github.com/XHXIAIEIN/LeagueCustomLobby/wiki/client:--game-client)      |      [战迹地图实现示例](http://jsfiddle.net/ow4tsbne)
- [LCU websocket ](https://www.hextechdocs.dev/lol/lcuapi/5.getting-started-with-the-lcu-websocket)

对了，别忘了看 [Wiki](https://github.com/XHXIAIEIN/LeagueCustomLobby/wiki)，这里也有一部分笔记哦

<br><br>  

# 笔记

如果你像我一样，突然对英雄联盟 API 感兴趣，可以继续阅读下方的内容。  
这里我使用了 lcu-driver 来对客户端进行通信，关于它的资料可以阅读 [lcu-driver 开发文档](https://lcu-driver.readthedocs.io/en/latest/index.html) 了解。

- [lol-lobby](https://github.com/XHXIAIEIN/LeagueCustomLobby/wiki/lol-lobby)
- [lol-lobby-bots](https://github.com/XHXIAIEIN/LeagueCustomLobby/wiki/lol-lobby-bots)
- [lol perks](https://github.com/XHXIAIEIN/LeagueCustomLobby/wiki/lol-perks)
- [lol-champ-select](https://github.com/XHXIAIEIN/LeagueCustomLobby/wiki/lol-champ-select)
- [lol-ranked](https://github.com/XHXIAIEIN/LeagueCustomLobby/wiki/lol-ranked)
- [lol collections](https://github.com/XHXIAIEIN/LeagueCustomLobby/wiki/lol-collections)
- [champion profile](https://github.com/XHXIAIEIN/LeagueCustomLobby/wiki/champion-profile)
- [champion spells](https://github.com/XHXIAIEIN/LeagueCustomLobby/wiki/champion-spells)
- [game-client](https://github.com/XHXIAIEIN/LeagueCustomLobby/wiki/game-client)
  
<br>  

### 快速上手
```python
from lcu_driver import Connector
connector = Connector()

@connector.ready
async def connect(connection):
    print(connection.address)
    print('LCU API is ready to be used.')

@connector.close
async def disconnect(connection):
    print('The client was closed')
    await connector.stop()

@connector.ws.register('/lol-lobby/v2/lobby', event_types=('CREATE',))
async def icon_changed(connection, event):
    print(f"The summoner {event.data['localMember']['summonerName']} created a lobby.")

connector.start()
```
  
<br>  
  
  
### 获取召唤师数据
```python
from lcu_driver import Connector
connector = Connector()

async def get_summoner_data(connection):
  summoner = await connection.request('GET', '/lol-summoner/v1/current-summoner')
  data = await summoner.json()
  print(f"summonerName:    {data['displayName']}")
  print(f"summonerLevel:   {data['summonerLevel']}")
  print(f"profileIconId:   {data['profileIconId']}")
  print(f"summonerId:      {data['summonerId']}")
  print(f"puuid:           {data['puuid']}")
  print(f"---")

@connector.ready
async def connect(connection):
    await get_summoner_data(connection)

connector.start()
```
  
<br>  
  
### 创建房间

根据 **queueId** 创建常规房间：

```python
async def createLobby(connection):
  queue = {'queueId': 430}
  await connection.request('POST', '/lol-lobby/v2/lobby', data=queue)
```
  
<br>  
  
### 5V5自定义训练模式

参数解释：
- **mapId**:  地图ID。召唤师峡谷：11, 嚎哭深渊：12
- **gameMode**: 游戏模式。自定义模式为 'CLASSIC'， 训练模式为 'PRACTICETOOL' (仅召唤师峡谷)
- **lobbyName**: 房间名称
- **lobbyPassword**: 房间密码
- **teamSize**: 队伍规模

```python
async def creatCustomLabby(connection):
  # 房间数据
  LobbyConfig = {
    'customGameLobby': {
      'configuration': {
        'gameMode': 'PRACTICETOOL', 
        'gameMutator': '', 
        'gameServerRegion': '', 
        'mapId': 11, 
        'mutators': {'id': 1}, 
        'spectatorPolicy': 'AllAllowed', 
        'teamSize': 5
      },
      'lobbyName': 'PRACTICETOOL',
      'lobbyPassword': ''
    },
    'isCustom': True
  }

  # 发送创建房间请求
  await connection.request('POST', '/lol-lobby/v2/lobby', data=LobbyConfig)
```
  
<br>  

### 添加单个机器人

参数解释：
- **championId**: 英雄ID，可以在下方表格查询。
- **botDifficulty**:  机器人难度。国服只有 "EASY"
- **teamId**: 左边蓝队：100, 右边红队：200

```python
bots = {
  'championId': 25,
  'botDifficulty': 'MEDIUM',
  'teamId': '200'
}
await connection.request('POST', '/lol-lobby/v1/lobby/custom/bots', data=bots)
```

<br> 
  
### 添加机器人

**根据ID添加**
```python
async def addBots(connection):
  team2 = [122, 86, 1, 51, 25]
  for id in team2:
    bots = { 'championId': id, 'botDifficulty': 'MEDIUM', 'teamId': '200' }
    await connection.request('POST', '/lol-lobby/v1/lobby/custom/bots', data=bots)
```
  
<br>  
  
**根据名称添加**
```python
async def addBots(connection):
  # 获取可用的机器人列表
  activedata = await connection.request('GET', '/lol-lobby/v2/lobby/custom/available-bots')
  champions = { bot['name']: bot['id'] for bot in await activedata.json() }
  
  # 队伍2的机器人
  team2 = ['诺克萨斯之手', '德玛西亚之力', '曙光女神', '皮城女警', '众星之子']
  
  for name in team2:
    bots = { 'championId': champions[name], 'botDifficulty': 'MEDIUM', 'teamId': '200' }
    await connection.request('POST', '/lol-lobby/v1/lobby/custom/bots', data=bots)
```
  

<br>  
  
## 自定义模式可用机器人列表

自定义模式中的电脑机器人是有限的，只能选择列表中这些英雄。   
请求此方法的时候，需要先创建房间。  

```python
data = await connection.request('GET', '/lol-lobby/v2/lobby/custom/available-bots')
champions = {bots['name']: bots['id'] for bots in await data.json()}
print(champions)
```

| championId  | CN           | EN                    |
| :---------- | :---------   | :-------------------- |
| 1           | 黑暗之女     | Annie                 |
| 3           | 正义巨像     | Galio                 |
| 8           | 猩红收割者   | Vladimir              |
| 10          | 正义天使     | Kayle                 |
| 11          | 无极剑圣     | Master Yi             |
| 12          | 牛头酋长     | Alistar               |
| 13          | 符文法师     | Ryze                  |
| 15          | 战争女神     | Sivir                 |
| 16          | 众星之子     | Soraka                |
| 18          | 麦林炮手     | Tristana              |
| 19          | 祖安怒兽     | Warwick               |
| 21          | 赏金猎人     | Miss Fortune          |
| 22          | 寒冰射手     | Ashe                  |
| 24          | 武器大师     | Jax                   |
| 25          | 堕落天使     | Morgana               |
| 26          | 时光守护者   | Zilean                |
| 30          | 死亡颂唱者   | Karthus               |
| 31          | 虚空恐惧     | Cho'Gath              |
| 32          | 殇之木乃伊   | Amumu                 |
| 33          | 披甲龙龟     | Rammus                |
| 36          | 祖安狂人     | Dr. Mundo             |
| 44          | 瓦洛兰之盾   | Taric                 |
| 45          | 邪恶小法师   | Veigar                |
| 48          | 巨魔之王     | Trundle               |
| 51          | 皮城女警     | Caitlyn               |
| 53          | 蒸汽机器人   | Blitzcrank            |
| 54          | 熔岩巨兽     | Malphite              |
| 58          | 荒漠屠夫     | Renekton              |
| 62          | 齐天大圣     | Wukong                |
| 63          | 复仇焰魂     | Brand                 |
| 69          | 魔蛇之拥     | Cassiopeia            |
| 75          | 沙漠死神     | Nasus                 |
| 76          | 狂野女猎手   | Nidalee               |
| 77          | 兽灵行者     | Udyr                  |
| 81          | 探险家       | Ezreal                |
| 86          | 德玛西亚之力 | Garen                 |
| 89          | 曙光女神     | Leona                 |
| 96          | 深渊巨口     | Kog'Maw               |
| 98          | 暮光之眼     | Shen                  |
| 99          | 光辉女郎     | Lux                   |
| 102         | 龙血武姬     | Shyvana               |
| 104         | 法外狂徒     | Graves                |
| 115         | 爆破鬼才     | Ziggs                 |
| 122         | 诺克萨斯之手 | Darius                |
| 143         | 荆棘之兴     | Zyra                  |
| 236         | 圣枪游侠     | Lucian                |


<br><br> 

---

<br>  

## 获取游戏服务器地区
```python
data = await connection.request('GET', '/riotclient/get_region_locale')
print(await data.json())
```

返回结果(部分)：
- **locale**: 'zh_CN'
- **region**: 'TENCENT'
- **webLanguage**: 'zh'
- **webRegion**: 'staging.na'

<br>  


噢 对了，这里还有个调试API的小技巧：  
如果按上面的办法，每次测试都要运行一次脚本，非常麻烦。其实可以直接从浏览器访问客户端。
  
<br>  

## 获取本地客户端通讯地址

```python
connection.address
```

返回结果：  
`https://127.0.0.1:<端口>`   

调用API时，实际就是请求 `https://127.0.0.1:<端口>/<资源路径>`   
因此，你也可以直接在浏览器中访问这个路径，直接查看资源。  
但是，你需要先获取一个密钥

<br>  

## 获取游戏安装路径

**通过 LCU API 请求**
```python
path = await connection.request('GET', '/data-store/v1/install-dir')
print(path)
```

**通过 lcu_driver 内置属性获得**
```python
connection.installation_path
```

注意，由于国服游戏路径会因为编码问题额外生成 gbk 编码的 '鑻遍泟鑱旂洘' 文件夹，需要将它转换为 utf-8 编码的 '英雄联盟'。

```python
path.encode('gbk').decode('utf-8')
```
  
## lockfile（弃用）
lockfile 文件会在每次客户端启动时生成，里面储存的是本次访问游戏客户端时的密钥，通过它来读取游戏需要的资源。  

```
LeagueClient:<进程PID>:<端口>:<密码>:https
```
  
**获取 lockfile 文件路径**    
(需要 import os )

```python
client_path = connection.installation_path.encode('gbk').decode('utf-8')
lockfile_path = os.path.join(client_path, 'lockfile')
print(lockfile_path)
```

**读取 lockfile 文件内容**

```python
def get_lockfile(path):
  # 读取数据
  if os.path.isfile(path):
    file = open(path, 'r')
    text = file.readline().split(':')
    file.close()
    print(f"riot    {text[3]}")
    return text
  else:
    print(f"{path} \n lockfile 文件不存在")
  return None
```

然后就可以通过浏览器访问本地资源了。   
`https://127.0.0.1:<端口>/<资源路径>` 

打开后提示需要登陆，输入用户名和密码：  
- 用户名：**riot**  
- 密码：{密码}
 
 
就能从浏览器页面看到返回的数据了。  
另外，个人推荐用 Egde， 我用Chrome打开在输入密码时总会卡住，不知道为啥。。

或者可以用 [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop) 或者 [swagger](https://inspector.swagger.io/) 之类的调试工具，会更加方便。(更重要的是，它们可以对返回的数据进行格式化！！) 或者可以在Chrome 安装一个 [JSON-handle](https://chrome.google.com/webstore/detail/json-handle/iahnhfdhidomcpggpaimmmahffihkfnj/related?hl=zh-CN) 之类的插件，也很不错

<br><br>

---


继续来看看其他API


## Queue, Maps, Game Modes, Game Types

你可以通过这个来获取目前所有的游戏模式，

**GET queue**
```python
data = await connection.request('GET', '/lol-game-queues/v1/queues')
print(await data.json())
```

从返回的结果来看，其中有个参数非常值得注意

| queueAvailability |                |
| :--------------   | :------------- |
| PlatformDisabled  | 平台禁用        |
| Available         | 当前可用        |

这个属性决定了你是否可以创建这个模式的房间，该模式必须是 `Available` 状态才能创建，即目前客户端可以玩极限闪击，才能创建极限闪击的房间。  
我筛选出了一份目前平台允许创建的模式：

| queuesId | queuesName           | queueType         | gameMode          | mapId | queueAvailability |
| -------- | -------------------- | ----------------- | ----------------- | ---   | ----------------- |
| 430      | 匹配模式             | NORMAL            | CLASSIC           | 11    | Available         |
| 420      | 排位赛 单排/双排     | RANKED_SOLO_5x5   | CLASSIC           | 11    | Available         |
| 440      | 排位赛 灵活排位      | RANKED_FLEX_SR    | CLASSIC           | 11    | Available         |
| 450      | 极地大乱斗           | ARAM_UNRANKED_5x5 | ARAM              | 12    | Available         |
| 1090     | 云顶之弈（匹配模式） | NORMAL_TFT        | TFT               | 22    | Available         |
| 1100     | 云顶之弈 (排位赛)    | RANKED_TFT        | TFT               | 22    | Available         |
| 700      | 冠军杯赛             | CLASH             | CLASSIC           | 11    | Available         |
| 840      | 新手                 | BOT               | CLASSIC           | 11    | Available         |
| 830      | 入门                 | BOT               | CLASSIC           | 11    | Available         |
| 850      | 一般                 | BOT               | CLASSIC           | 11    | Available         |
| 2000     | 新手教程 第一部分    | TUTORIAL_MODULE_1 | TUTORIAL_MODULE_1 | 11    | Available         |
| 2010     | 新手教程 第二部分    | TUTORIAL_MODULE_2 | TUTORIAL_MODULE_2 | 11    | Available         |
| 2020     | 新手教程 第三部分    | TUTORIAL_MODULE_3 | TUTORIAL_MODULE_3 | 11    | Available         |

也就是说，目前你在客户端看到是什么样，实际也就那样了。  

---

你可以根据 `queueId` 或者 `queueType` 去获取某个地图模式的详细信息：

**GET queue by queueId**
```python
id = 900
data = await connection.request('GET', f"/lol-game-queues/v1/queues/{id}")
print(await data.json())
```

<br>  
  
**GET queue by queueType**
```python
queueType = 'URF'
data = await connection.request('GET', f"/lol-game-queues/v1/queues/type/{queueType}")
print(await data.json())
```

<br>  

## 获取地图模式数据

可以得到地图的介绍、资源图标等信息

```python
data = await connection.request('GET', '/lol-maps/v1/maps')
print(await data.json())
```

<br>  
  
部分输出结果（2021.01.21）    
这里使用了由 @kdelmonte 开发的 [JSON to Markdown Table](https://kdelmonte.github.io/json-to-markdown-table/) 工具，将数据转换为 Markdown 表格。

| queuesId | queuesName           | queueType         |  gameMode         | mapId | category |
|:---------|:---------------------|:------------------|:------------------|:------|:---------|
|        2 | 匹配模式             | NORMAL            | CLASSIC           |    11 | PvP      |
|        8 | 匹配模式             | NORMAL_3x3        | CLASSIC           |    10 | PvP      |
|        9 | 排位赛 灵活排位      | RANKED_FLEX_TT    | CLASSIC           |    10 | PvP      |
|       31 | 入门                 | BOT               | CLASSIC           |    11 | VersusAi |
|       32 | 新手                 | BOT               | CLASSIC           |    11 | VersusAi |
|       33 | 一般                 | BOT               | CLASSIC           |    11 | VersusAi |
|       52 | 新手                 | BOT_3x3           | CLASSIC           |    10 | VersusAi |
|       65 | 极地大乱斗           | ARAM_UNRANKED_5x5 | ARAM              |    12 | PvP      |
|       91 | 大提魔节             | NIGHTMARE_BOT     | DOOMBOTSTEEMO     |    11 | PvP      |
|       92 | 100级铁手挑战        | NIGHTMARE_BOT     | DOOMBOTSTEEMO     |    11 | PvP      |
|       96 | 飞升争夺战           | ASCENSION         | ASCENSION         |     8 | PvP      |
|      100 | 匹配模式             | ARAM_UNRANKED_5x5 | ARAM              |    14 | PvP      |
|      300 | 魄罗大乱斗           | KING_PORO         | KINGPORO          |    12 | PvP      |
|      315 | 枢纽攻防战           | SIEGE             | SIEGE             |    11 | PvP      |
|      318 | 无限乱斗             | URF               | URF               |    11 | PvP      |
|      325 | 峡谷大乱斗           | ARSR              | ARSR              |    11 | PvP      |
|      400 | 匹配模式             | NORMAL            | CLASSIC           |    11 | PvP      |
|      420 | 排位赛 单排/双排     | RANKED_SOLO_5x5   | CLASSIC           |    11 | PvP      |
|      430 | 匹配模式             | NORMAL            | CLASSIC           |    11 | PvP      |
|      440 | 排位赛 灵活排位      | RANKED_FLEX_SR    | CLASSIC           |    11 | PvP      |
|      450 | 极地大乱斗           | ARAM_UNRANKED_5x5 | ARAM              |    12 | PvP      |
|      460 | 匹配模式             | NORMAL_3x3        | CLASSIC           |    10 | PvP      |
|      470 | 排位赛 灵活排位      | RANKED_FLEX_TT    | CLASSIC           |    10 | PvP      |
|      600 | 红月决               | ASSASSINATE       | ASSASSINATE       |    11 | PvP      |
|      610 | 暗星：奇点           | DARKSTAR          | DARKSTAR          |    16 | PvP      |
|      700 | 冠军杯赛             | CLASH             | CLASSIC           |    11 | PvP      |
|      800 | 一般                 | BOT_3x3           | CLASSIC           |    10 | VersusAi |
|      810 | 入门                 | BOT_3x3           | CLASSIC           |    10 | VersusAi |
|      820 | 新手                 | BOT_3x3           | CLASSIC           |    10 | VersusAi |
|      830 | 入门                 | BOT               | CLASSIC           |    11 | VersusAi |
|      840 | 新手                 | BOT               | CLASSIC           |    11 | VersusAi |
|      850 | 一般                 | BOT               | CLASSIC           |    11 | VersusAi |
|      900 | 无限火力             | URF               | URF               |    11 | PvP      |
|      910 | 飞升争夺战           | ASCENSION         | ASCENSION         |     8 | PvP      |
|      920 | 魄罗大乱斗           | KING_PORO         | KINGPORO          |    12 | PvP      |
|      930 | 极地大乱斗           | BILGEWATER        | CLASSIC           |    11 | PvP      |
|      940 | 枢纽攻防战           | SIEGE             | SIEGE             |    11 | PvP      |
|      950 | 100级铁手挑战        | NIGHTMARE_BOT     | DOOMBOTSTEEMO     |    11 | PvP      |
|      960 | 大提魔节             | NIGHTMARE_BOT     | DOOMBOTSTEEMO     |    11 | PvP      |
|      980 | 怪兽入侵（普通）     | STARGUARDIAN      | STARGUARDIAN      |    18 | PvP      |
|      990 | 怪兽入侵（狂袭）     | STARGUARDIAN      | STARGUARDIAN      |    18 | PvP      |
|     1000 | 超频行动             | PROJECT           | PROJECT           |    19 | PvP      |
|     1010 | 冰雪无限火力         | SNOWURF           | SNOWURF           |    11 | PvP      |
|     1020 | 克隆大作战           | ONEFORALL         | ONEFORALL         |    11 | PvP      |
|     1030 | 奥德赛(入门：一星)   | ODYSSEY           | ODYSSEY           |    20 | PvP      |
|     1040 | 奥德赛(学员：二星)   | ODYSSEY           | ODYSSEY           |    20 | PvP      |
|     1050 | 奥德赛(组员：三星)   | ODYSSEY           | ODYSSEY           |    20 | PvP      |
|     1060 | 奥德赛(船长：四星)   | ODYSSEY           | ODYSSEY           |    20 | PvP      |
|     1070 | 奥德赛(狂袭：五星)   | ODYSSEY           | ODYSSEY           |    20 | PvP      |
|     1090 | 云顶之弈（匹配模式） | NORMAL_TFT        | TFT               |    22 | PvP      |
|     1091 | 1v0                  | NORMAL_TFT        | TFT               |    22 | PvP      |
|     1092 | 2v0                  | NORMAL_TFT        | TFT               |    22 | PvP      |
|     1100 | 云顶之弈 (排位赛)    | RANKED_TFT        | TFT               |    22 | PvP      |
|     1110 | 云顶之弈 (新手教程)  | TUTORIAL_TFT      | TFT               |    22 | PvP      |
|     1111 | 云顶之弈模拟战       | NORMAL_TFT        | TFT               |    22 | PvP      |
|     1200 | 极限闪击             | GAMEMODEX         | GAMEMODEX         |    21 | PvP      |
|     1300 | 极限闪击             | NEXUSBLITZ        | NEXUSBLITZ        |    21 | PvP      |
|     2000 | 新手教程 第一部分    | TUTORIAL_MODULE_1 | TUTORIAL_MODULE_1 |    11 | PvP      |
|     2010 | 新手教程 第二部分    | TUTORIAL_MODULE_2 | TUTORIAL_MODULE_2 |    11 | PvP      |
|     2020 | 新手教程 第三部分    | TUTORIAL_MODULE_3 | TUTORIAL_MODULE_3 |    11 | PvP      |

<br>  
  
这其中还有一些空白的数据，估计是已经被官方废弃的地图，而后面推出了新的地图进行替换。

| queuesId | queuesName           | queueType         |  gameMode         | mapId | category |
|:---------|:---------------------|:------------------|:------------------|:------|:---------|
|       70 |                      | ONEFORALL_5x5     | CLASSIC           |    11 | PvP      |
|       72 |                      | FIRSTBLOOD_1x1    | FIRSTBLOOD        |    12 | PvP      |
|       73 |                      | FIRSTBLOOD_2x2    | FIRSTBLOOD        |    12 | PvP      |
|       75 |                      | SR_6x6            | CLASSIC           |    11 | PvP      |
|       76 |                      | URF               | URF               |    11 | PvP      |
|       78 |                      | ONEFORALL_5x5     | ARAM              |    12 | PvP      |
|       93 |                      | NIGHTMARE_BOT     | DOOMBOTSTEEMO     |    11 | PvP      |
|       98 |                      | HEXAKILL          | CLASSIC           |    10 | PvP      |
|      310 |                      | COUNTER_PICK      | CLASSIC           |    11 | PvP      |
|      313 |                      | BILGEWATER        | CLASSIC           |    11 | PvP      |
|      860 |                      | ARAM_BOT          | ARAM              |    12 | VersusAi |

<br>  

## 获取房间数据
获取的是整个房间的数据，包含了观众、机器人。
```
data = await connection.request('GET', '/lol-lobby/v2/lobby')
print(await data.json())
```


## 获取房间玩家数据

获取的是队伍真实玩家数据，观众、机器人不在列表中。
```python
data = await connection.request('GET', '/lol-lobby/v2/lobby/members')
print(await data.json())
```

部分参数解释：
- **summonerId**: ID
- **summonerIconId**: 头像
- **summonerName**: 名称
- **summonerLevel**:  等级
- **teamId**: 左边蓝队：100 / 右边红队：200
- **ready**: 准备状态
- **isLeader**: 是否为房主
- **allowedKickOthers**: 是否允许踢人
- **allowedInviteOthers**: 是否允许邀请
- **firstPositionPreference**: 首选位置 
- **firstPositionPreference**: 次选位置 

位置信息：
- **UNSELECTED** 未选择
- **FILL** 补位 
- **UTILITY** 辅助 
- **TOP** 上路
- **JUNGLE** 打野
- **MIDDLE** 中路 
- **BOTTOM** 下路 

<br>  

---


# 拳头开发者文档

[Riot 开发者文档](https://developer.riotgames.com/docs/lol)
- **地区语言列表** [Languages](https://developer.riotgames.com/docs/lol#data-dragon_languages)
- **所有英雄列表** [Champions](https://developer.riotgames.com/docs/lol#data-dragon_champions) 备注: 将 `en_US` 换成 `zh_CN` 就是国服的英雄数据
- **英雄原画资源** [Champion Splash Assets](https://developer.riotgames.com/docs/lol#data-dragon_champion-splash-assets)
- **游戏商城道具** [Items](https://developer.riotgames.com/docs/lol#data-dragon_items)

## 本地资源与 dragon 对应关系

关于游戏中的资源，你可以在  [raw.communitydragon.org](https://github.com/CommunityDragon/Docs/blob/master/assets.md) 中找到游戏中的所有资源。  

资源路径的格式通常为： `plugins/<plugin>/<region>/<lang>/..`
- `plugin` 代表插件的名称，如 `rcp-be-lol-game-data`
- `<region>` 代表地区。例如 `tencent`, 通用资源为 `global`
- `<lang>` 代表语言。例如 `zh_cn`, 通用资源为 `default`
 
大部分的游戏资源都储存在 `rcp-be-lol-game-data` 路径下。  
通常都是访问 `rcp-be-lol-game-data/global/default`
  
<br>  
  
当然，如果要实际使用，通常不会直接去引用 dragon 的地址，因为从国内访问它太慢了。也许可以直接从本地客户端读取资源？那么，就需要将 dragon 资源路径转换为本地客户端路径：
1. 将前面 `plugins/rcp-be-lol-game-data` 替换为 `lol-game-data`
2. 将中间 `global/default` 替换为 `assets`


### 小技巧1
需要获取某个资源时，如果找不到对应的路径。可以先找到它的数据，通常里面会有对应的资源地址。  

**举例1**  
读取[召唤师技能数据表](http://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/summoner-spells.json)，找到 icon 资源的路径  
  
|        | path |
| ------ | :---- |
| dragon | /plugins/rcp-be-**lol-game-data**/global/default/**v1/summoner-spells.json** | 
| lcu   | /lol-game-data/**assets**/v1/summoner-spells.json | 


**举例2**    
读取对应的[英雄数据](http://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/champions/21.json)，找到此英雄对应的图片资源。


|        | path |
| ------ | :---- |
| dragon | /plugins/rcp-be-**lol-game-data**/global/default/**v1/champions/21.json** | 
| lcu   | /lol-game-data/**assets**/v1/champions/21.json | 
  

**举例3**  
读取对应[符文列表](http://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perkstyles.json)，找到对应的图片资源。

|        | path |
| ------ | :---- |
| dragon | /plugins/rcp-be-**lol-game-data**/global/default/**v1/perkstyles.json** | 
| lcu   | /lol-game-data/**assets**/v1/perkstyles.json | 


<br>  

数据列表，配合 [dragon 搜索页面](https://raw.communitydragon.org/search.html) 使用更加
```
/lol-game-data/assets/v1/rarity-gem-icons
/lol-game-data/assets/v1/settingstopersist.json
/lol-game-data/assets/v1/summoner-backdrops/1429.jpg
/lol-game-data/assets/v1/summoner-banners.json
/lol-game-data/assets/v1/summoner-icon-sets.json
/lol-game-data/assets/v1/summoner-spells.json
/lol-game-data/assets/v1/summoner-trophies.json
/lol-game-data/assets/v1/tftgamevariations.json
/lol-game-data/assets/v1/tftpromodata.json
/lol-game-data/assets/v1/ward-skin-sets.json
/lol-game-data/assets/v1/ward-skins.json
```
 
<br>  
  
### 小技巧2
你可以通过访问 [cdragon](https://raw.communitydragon.org/latest/cdragon/) files.txt 查看所有的资源列表。  
然后存到本地，使用查找替换功能，快速替换关键词：
```
plugins/rcp-be-lol-game-data/    ->      https://127.0.0.1:{port}/lol-game-data/
/global/default/                 ->      assets
```
 
<br>  
  
但是暂时我还不知道怎么获取非 /lol-game-data/assets 路径的文件。  
有空再继续试，或者如果有人知道可以跟我说说...

---
 
<br>  

### 部分资源列表
（持续更新中

**[召唤师头像](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/)** 
```
/lol-game-data/assets/v1/profile-icons/4804.jpg
```

**[英雄图标](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/)** 
```
/lol-game-data/assets/v1/champion-icons/1.png
```

**[传说之证 边框](https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/content/src/leagueclient/prestigeborders/)** 
```
/lol-game-data/assets/content/src/leagueclient/prestigeborders/theme-1-simplified-border.png
```

**[英雄加载页面](https://raw.communitydragon.org/latest/game/assets/characters/)** 
```
/lol-game-data/assets/ASSETS/Characters/Sona/Skins/Base/SonaLoadScreen.jpg
```

**[加载页面排位边框](https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/regalia/banners/trims/)** 
```
/lol-game-data/assets/ASSETS/regalia/banners/trims/trim_bronze.png
```

**[英雄原画](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-splashes/)** 
```
/lol-game-data/assets/v1/champion-splashes/876/876000.jpg
```


**[英雄技能预览视频](https://na.leagueoflegends.com/en-us/champions/)** 
```
进入英雄页面，将右侧视频右键另存为即可
```

**[英雄模型图](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-chroma-images/)** 
```
/lol-game-data/assets/v1/champion-chroma-images/53/53000.png
```

**[英雄选择语音](https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/zh_cn/v1/champion-choose-vo/)** 
```
/lol-game-data/assets/v1/champion-choose-vo/350.ogg
```

**[英雄禁用语音](https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/zh_cn/v1/champion-ban-vo/)** 
```
/lol-game-data/assets/v1/champion-ban-vo/350.ogg
```

**[联赛锁定提醒](https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/zh_cn/content/src/leagueclient/clashvo/zh_cn/)** 
```
/game-data/assets/content/src/leagueclient/clashvo/zh_cn/vo-anncr-fem1-tournaments-lockin-10min-01.ogg
```

**[召唤师峡谷房间背景](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/content/src/leagueclient/gamemodeassets/classic_sru/img/)** 
```
/lol-game-data/assets/content/src/LeagueClient/GameModeAssets/Classic_SRU/img/gameflow-background.jpg
```

**[召唤师峡谷地图背景](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/content/src/leagueclient/gamemodeassets/classic_sru/img/)** 
```
/lol-game-data/assets/content/src/LeagueClient/GameModeAssets/Classic_SRU/img/map-south.png
/lol-game-data/assets/content/src/LeagueClient/GameModeAssets/Classic_SRU/img/map-north.png
```

**[召唤师峡谷天空](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/content/src/leagueclient/gamemodeassets/classic_sru/img/)** 
```
https://raw.communitydragon.org/pbe/game/assets/maps/skyboxes/riots_sru_skybox_cubemap.png
```

**[地图模式图标](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/content/src/leagueclient/gamemodeassets/)**
```
召唤师峡谷
/lol-game-data/assets/content/src/leagueclient/gamemodeassets/classic_sru/img/game-select-icon-active.png

嚎哭深渊
/lol-game-data/assets/content/src/leagueclient/gamemodeassets/aram/img/game-select-icon-active.png

云顶之弈
/lol-game-data/assets/content/src/leagueclient/gamemodeassets/tft/img/game-select-icon-active.png

无限乱斗 
/lol-game-data/assets/content/src/leagueclient/gamemodeassets/shared/img/icon-rgm-active.png

极限闪击
/lol-game-data/assets/content/src/leagueclient/gamemodeassets/gamemodex/img/social-icon-victory.png
```

**[召唤师技能](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/data/spells/icons2d/)** 
```
/lol-game-data/assets/DATA/Spells/Icons2D/Summoner_teleport.png
```

**[英雄技能](http://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/characters/yasuo/hud/icons2d/)** 
```
https://127.0.0.1:50956/lol-game-data/assets/assets/characters/yasuo/hud/icons2d/yasuo_e.png
```

**[守卫图标](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/content/src/leagueclient/wardskinimages/)**
```
/lol-game-data/assets/content/src/leagueclient/wardskinimages/wardhero_0.png
```

**[符文图标](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/)** 
```
/lol-game-data/assets/v1/perk-images/styles/runesicon.png
```

**[装备图标](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/items/icons2d/)** 
```
/lol-game-data/assets/ASSETS/items/icons2d/6672_marksman_t4_behemothslayer.png
```

**[选位图标](https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/ranked/positions/)** 
```
/lol-game-data/assets/v1/perk-images/statmods/statmodsattackspeedicon.png
```

**[属性图标](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/)** 
```
/lol-game-data/assets/v1/perk-images/statmods/statmodsattackspeedicon.png
```

**[表情图标](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/summoneremotes/)** 
```
/lol-game-data/assets/ASSETS/loadouts/summoneremotes/flairs/thumb_happy_up_inventory.png
```

**[成就表情](https://raw.communitydragon.org/latest/game/assets/ux/mastery/)** 
```
/lol-game-data/assets/ASSETS/ux/mastery/mastery_icon_7.png
```

**[战利品](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loot/)** 
```
/lol-game-data/assets/ASSETS/loot/hextech_mystery_shard_490x490.png
```

**[小小英雄](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loot/companions/)** 
```
/lol-game-data/assets/ASSETS/Loot/Companions/gemtiger/loot_gemtiger_shadowgem_tier1.png
```

**[永恒星碑](https://raw.communitydragon.org/pbe/game/assets/loadouts/statstones/categories/game/)** 
```
/lol-game-data/assets/ASSETS/Loadouts/StatStones/Categories/LCU/SS_Icon_Style_Unique_1.png
```

**[联赛奖杯](https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/summonertrophies/trophies/)** 
```
/lol-game-data/assets/ASSETS/Loadouts/SummonerTrophies/Trophies/Demacia/LeagueClient/Trophy_Demacia_4_Inventory.png
```

<br>  


### 其他资源

**[信号标记（问号、请求协助、正在路上）](https://raw.communitydragon.org/latest/game/data/images/ui/)** 
**[屏幕失控遮罩](https://raw.communitydragon.org//latest/game/data/images/vision/)** 


<br>  


## [获取游戏数据](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/)
  
<br>  

**召唤师图标：Base64**
```python
profileIconId = 4804
image = await connection.request('GET', f"/lol-game-data/assets/v1/profile-icons/{profileIconId}.jpg")
raw = base64.b64encode(await image.read())
print(raw)
```

**所有英雄皮肤资源数据**
```python
data = await connection.request('GET', f"/lol-champions/v1/inventories/{summonerData['summonerId']}/champions")
# print(data)
```
  
---

  
<br>  
  
## 监听客户端事件

**资料发生变化**
例如： 更改了头像、名字、等级、状态...
```javascript
@connector.ws.register('/lol-summoner/v1/current-summoner', event_types=('UPDATE',))
async def icon_changed(connection, event):
    print(event.data)
```

**创建房间事件**
```javascript
@connector.ws.register('/lol-lobby/v2/lobby', event_types=('CREATE',))
async def lobby_created(connection, event):
    print(event.data)
```


**房间状态更新**
```javascript
@connector.ws.register('/lol-lobby/v2/lobby', event_types=('UPDATE',))
async def lobby_created(connection, event):
    print(event.data)
```

匹配模式，正在**寻找对局**时，有这些属性会发生变化

|                                               | 在房间内 | 寻找对局 |
| --------------------------------------------  | ------- | ------- |
| canStartActivity                              |  True   |  False  |
| localMember["allowedStartActivity"]           |  True   |  False  |
| localMember['ready']                          |  True   |  False  |
| members["allowedStartActivity"]               |  True   |  False  |
| members['ready']                              |  True   |  False  |

找到对局后，会得到一个 `partyId` 属性
|                                               | 在房间内 | 开始游戏(选人页面) |
| --------------------------------------------  | ------- | -------- |
| partyId                                       |  ''     |  string  |
  

<br>  

---

<br>  


## 启动脚本前，检查游戏是否已运行
(需要 import psutil )

```python
def CheckProcess():
    process = psutil.pids()
    for pid in process:
        if psutil.Process(pid).name() == 'LeagueClient.exe':
            return pid
    else:
        return None
```

```python
if CheckProcess() == None:
  QMessageBox.warning(Window(),'LeagueCustomLobby', '无法读取游戏数据\n需要先启动游戏，再运行此程序。')
  return
```


<br>  


# TODO
1. 做个简单的UI，并脱离python环境? 
  
  
<br><br>  
 
# 其他工具
- [LeaueLobby](https://github.com/MarioCrane/LeaueLobby) @MarioCrane


<br><br>
 
 
# 免责声明

LeagueCustomLobby isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.


   
<br><br>  
<br><br>  
<br><br>  
<br><br>  
  


# 小伙子，你干得不错！

虽然说，我只是随手记了一份笔记，相当于课代表把老师上课讲的东西写了一份小抄。但如果这份笔记对你有帮助，节省了你的时间，提升了你的工作效率，让生活变得更美丽....
可以请我喝杯咖啡喔！我会非常高兴的！！

![xhxiaiein_sponsors](https://user-images.githubusercontent.com/45864744/116389688-d38c4480-a84f-11eb-9dec-036bc1abf397.png)
