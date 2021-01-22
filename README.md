# LeagueCustomLobby
英雄联盟创建5V5训练模式

# 工具库
[lcu-driver](https://github.com/sousa-andre/lcu-driver)


# 参考资料
- [Riot 开发者文档](https://developer.riotgames.com/docs/lol)
- [LCU API 速查手册](https://lcu.vivide.re/#operation--lol-lobby-v2-lobby-get)
- [训练模式数据格式](https://riot-api-libraries.readthedocs.io/en/latest/lcu.html)

  
<br>  

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
  
<br>  

# 如何使用

将 [LeagueLobby.py](https://github.com/XHXIAIEIN/LeagueCustomLobby/blob/main/LeagueLobby.py) 下载到本地任意地方，运行脚本即可。

  
<br>   


# 核心代码

### 客户端事件
```python
from lcu_driver import Connector
connector = Connector()

@connector.ready
async def connect(connection):
    print('LCU API is ready to be used.')

@connector.close
async def disconnect(connection):
    print('Finished task')

connector.start()
```
  
<br>  
  
### 获取召唤师数据
```python
async def getSummonerInfo(connection):
	summoner = await connection.request('get', '/lol-summoner/v1/current-summoner')
	print(await summoner.json())
```

  
<br>  
  
### 直接创建房间

快速根据 **queueId** 创建房间：

```python
async def createLobby(connection):
	queue = {'queueId': 1200}
	await connection.request('post', '/lol-lobby/v2/lobby', data=queue)
```
  
<br>  
  
### 5V5自定义训练模式

参数解释：
- **gameMode**: 游戏模式。训练模式为 "PRACTICETOOL"， 自定义模式为 "CLASSIC"
- **mapId**:  地图ID。召唤师峡谷：11。
- **lobbyName**: 房间名称

```json
async def creatCustomLabby(connection):
	# 房间数据
	LobbyConfig = {
	  "customGameLobby": {
	    "configuration": {
	      "gameMode": "PRACTICETOOL", 
	      "gameMutator": "", 
	      "gameServerRegion": "", 
	      "mapId": 11, 
	      "mutators": {"id": 1}, 
	      "spectatorPolicy": "AllAllowed", 
	      "teamSize": 5
	    },
	    "lobbyName": "Name",
	    "lobbyPassword": ""
	  },
	  "isCustom": true
	}

	# 发送创建房间请求
	await connection.request('post', '/lol-lobby/v2/lobby', data=LobbyConfig)
```
  
  
<br>  
  
### 批量添加机器人

参数解释：
- **championId**: 英雄ID，可以在下方表格查询。
- **botDifficulty**:  机器人难度。可惜国服只有 "EASY"
- **teamId**: 左边蓝队：100 / 右边红队：200

**根据ID添加**
```python
async def addBots(connection):
	team2 = [122, 86, 1, 51, 25]
	for id in team2:
		bots = {
			"championId": id,
			"botDifficulty": "MEDIUM",
			"teamId": "200"
		}
		await connection.request('post', '/lol-lobby/v1/lobby/custom/bots', data=bots)
```
  
<br>  
  
**根据名称添加**
```python
async def addBots(connection):
	# 获取可用的机器人列表
	activedata = await connection.request('GET', '/lol-lobby/v2/lobby/custom/available-bots')
	champions = { bot['name']: bot['id'] for bot in await activedata.json() }
	
	# 队伍2的机器人
	team2 = ["诺克萨斯之手", "德玛西亚之力", "曙光女神", "皮城女警", "众星之子"]
	
	for name in team2:
		bots = {
			"championId": champions[name],
			"botDifficulty": "MEDIUM",
			"teamId": "200"
		}
		await connection.request('post', '/lol-lobby/v1/lobby/custom/bots', data=bots)
```
  

<br>  
  
## 自定义模式机器人列表

自定义模式中的电脑机器人是有限的，只能选择列表中这些英雄。   
请求此方法的时候，需要先创建房间。  

```python
data = await connection.request('GET', '/lol-lobby/v2/lobby/custom/available-bots')
champions = {bots['name']: bots['id'] for bots in await data.json()}
print(champions)
```

| championId  | CN         | EN			   |	
| ----- | ---------------- | --------------------- |	
| 1	| 黑暗之女		| Annie			|	
| 3	| 正义巨像		| Galio			|	
| 8	| 猩红收割者        | Vladimir		|	
| 10	| 正义天使		| Kayle			|	
| 11	| 无极剑圣		| Master Yi		|	
| 12	| 牛头酋长		| Alistar		|	
| 13	| 符文法师		| Ryze			|	
| 15	| 战争女神		| Sivir			|	
| 16	| 众星之子		| Soraka		|	
| 18	| 麦林炮手		| Tristana		|	
| 19	| 祖安怒兽		| Warwick		|	
| 21	| 赏金猎人		| Miss Fortune		|	
| 22	| 寒冰射手		| Ashe			|	
| 24	| 武器大师		| Jax			|	
| 25	| 堕落天使		| Morgana		|	
| 26	| 时光守护者		| Zilean		|	
| 30	| 死亡颂唱者		| Karthus		|	
| 31	| 虚空恐惧		| Cho'Gath		|	
| 32	| 殇之木乃伊		| Amumu			|	
| 33	| 披甲龙龟		| Rammus		|	
| 36	| 祖安狂人		| Dr. Mundo		|	
| 44	| 瓦洛兰之盾		| Taric			|	
| 45	| 邪恶小法师		| Veigar		|	
| 48	| 巨魔之王		| Trundle		|	
| 51	| 皮城女警		| Caitlyn		|	
| 53	| 蒸汽机器人		| Blitzcrank		|	
| 54	| 熔岩巨兽		| Malphite		|	
| 58	| 荒漠屠夫		| Renekton		|	
| 62	| 齐天大圣		| Wukong		|	
| 63	| 复仇焰魂		| Brand			|	
| 69	| 魔蛇之拥		| Cassiopeia		|	
| 75	| 沙漠死神		| Nasus			|	
| 76	| 狂野女猎手		| Nidalee		|	
| 77	| 兽灵行者		| Udyr			|	
| 81	| 探险家		 | Ezreal		|	
| 86	| 德玛西亚之力      | Garen		      |	
| 89	| 曙光女神		| Leona			|	
| 96	| 深渊巨口		| Kog'Maw		|	
| 98	| 暮光之眼		| Shen			|	
| 99	| 光辉女郎		| Lux			|	
| 102	| 龙血武姬		| Shyvana		|	
| 104	| 法外狂徒		| Graves		|	
| 115	| 爆破鬼才		| Ziggs			|	
| 122	| 诺克萨斯之手	| Darius		|	
| 143	| 荆棘之兴		| Zyra			|	
| 236	| 圣枪游侠		| Lucian		|		

<br>  
  
### queue

必须是开放状态才能创建，即目前客户端可以玩极限闪击，才能创建极限闪击的房间。  
完整的 gameMode 列表可以在[官方文档](http://static.developer.riotgames.com/docs/lol/gameModes.json)查询。

如何获取：
**get queue**
```python
async def getQueuesInfo(connection):
	data = await connection.request('get', '/lol-game-queues/v1/queues')
	print(await data.json())
```

<br>  
  
**get queue by id**
```python
async def getQueuesInfo(connection):
	id = 900
	data = await connection.request('get', f'/lol-game-queues/v1/queues/{id}')
	print(await data.json())
```

<br>  
  
**get queue by type**
```python
async def getQueuesInfo(connection):
	queueType = 'URF'
	data = await connection.request('get', f'/lol-game-queues/v1/queues/type/{queueType}')
	print(await data.json())
```

<br>  
  
但是这样数据太多了，不方便看。
为了方便，输出一些适合预览的数据：
```
data = await connection.request('get', '/lol-game-queues/v1/queues')
print( [{
	"id":queue['id'], "type":queue['type'], 
	"name":queue['name'], 
	"shortName":queue['shortName'], 
	"description":queue['description'], 
	"category": queue['category'], 
	"gameMode": queue['gameMode'], 
	"mapId": queue['mapId'],  
	"gameTypeId": queue['gameTypeConfig']['id'], 
	"gameTypeName": queue['gameTypeConfig']['name']
	} for queue in await data.json()])
```

<br>  
  
输出结果（2021.01.21）  
这里使用了由 @kdelmonte 开发的 [JSON to Markdown Table](https://kdelmonte.github.io/json-to-markdown-table/) 工具，将数据转换为 Markdown 表格。

**常规模式**
| queuesId |      queuesName      |     queueType     |      gameMode     | mapId | category |
|----------|----------------------|-------------------|-------------------|-------|----------|



| queuesId |      queuesName      |     queueType     |      gameMode     | mapId | category |
|----------|----------------------|-------------------|-------------------|-------|----------|
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
  
对了，这其中还有一些空白的数据，估计是已经被官方废弃的地图，而后面推出了新的地图进行替换。不确定是否还能使用

| queuesId |      queuesName      |     queueType     |      gameMode     | mapId | category |
|----------|----------------------|-------------------|-------------------|-------|----------|
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

# 获取房间玩家数据

获取的是队伍真实玩家数据，观众、机器人不在列表中。
```
data = await connection.request('GET', '/lol-lobby/v2/lobby/members')
print(await data.json())
```

部分参数解释：
- **summonerId**: ID
- **summonerIconId**: 头像
- **summonerName**: 名称
- **summonerLevel**:  等级
- **teamId**: 左边蓝队：100 / 右边红队：200
- **isLeader**: 是否为房主
- **allowedKickOthers**: 是否允许踢人
- **allowedInviteOthers**: 是否允许邀请
- **ready**: 准备状态
- **firstPositionPreference**: 首选位置 UNSELECTED 未选择 / FILL 补位 / UTILITY 辅助 / ↓
- **firstPositionPreference**: 次选位置 TOP 上路 / JUNGLE 打野 / MIDDLE 中路 / BOTTOM 下路 

<br>  

# 获取服务器地区数据
```
data = await connection.request('GET', '/riotclient/get_region_locale')
print(await data.json())
```

参数解释：
- **locale**: 'zh_CN'
- **region**: 'TENCENT'
- **webLanguage**: 'zh'
- **'webRegion'**: 'staging.na'

<br>  

# 获取地图数据

可以得到地图的介绍、资源图标等信息

```
data = await connection.request('get', '/lol-maps/v1/maps')
print(await data.json())
```

<br>  


# 利用 **lockfile** 文件访问客户端


**获取游戏安装路径**
```
@connector.ready
async def connect(connection):
	connection.installation_path
```

**获取客户端通讯地址**
```
@connector.ready
async def connect(connection):
	print(connection.address)
```
  
**获取 lockfile 文件路径**
由于国服游戏路径会因为编码问题，额外生成 gbk 编码的 '鑻遍泟鑱旂洘' 文件夹，需要将它转换为 utf-8 编码的 '英雄联盟'
```python
path = path.encode('gbk').decode('utf-8')
lockfile_path = os.path.join(path, 'lockfile')
print(lockfile_path)
```

**读取 lockfile 文件内容**
```python
def get_lockfile(path):
	# 读取数据
	if os.path.isfile(lockfile_path):
		file = open(lockfile_path, 'r')
		text = file.readline().split(':')
		file.close()
		return text
	else:
		print(f'{lockfile_path} \n lockfile 文件不存在' )
	return None
```

**分析 lockfile**
该方案来源：[nomi-san](https://github.com/Pupix/rift-explorer/issues/111#issuecomment-593249708)
```
LeagueClient:{进程PID}:{端口}:{密码}:https
```
然后就可以通过浏览器访问 ` https://127.0.0.1:{端口}/process-control/v1/process `  打开提示需要输入账号密码
- 账号：**riot**
- 密码：{上面的密码}

<br>  

### 请求方法

然后在控制台中执行这个代码：  
该方案来源：[! xXKiller_BOSSXx](https://discord.com/channels/187652476080488449/516802588805431296/793654937795559474)

```javascript
def getResources(connection, url):
	lockfile = get_lockfile(connection.installation_path)
	request = requests.post(f'{lockfile[4]}://127.0.0.1:{lockfile[2]}/{url}',
		  headers={'Authorization': f'Basic {base64.b64encode(f"riot:{lockfile[3]}".encode("utf-8")).decode("utf-8")}' },
		  verify='riotgames.pem',
		  json={"queueId" : 450})
	print(f'{lockfile[4]}://127.0.0.1:{lockfile[2]}/{url}')
```

### 获取房间数据

然后先创建一个房间。  
创建完成后，继续在浏览器控制台发送请求  

```javascript
await request('GET', '/lol-lobby/v2/lobby');
```

这样就能获取到房间数据了。


<br>  


# TODO
1. 做个简单的UI，并脱离python环境?

  
<br> 

  
---
  
<br>  
  
# 其他工具
- [LeaueLobby](https://github.com/MarioCrane/LeaueLobby) @MarioCrane



