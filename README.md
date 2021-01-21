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

### 导入模块
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
  
### 自定义训练模式

参数解释：
- **gameMode**: 游戏模式。训练模式为"PRACTICETOOL"，自定义模式为 "CLASSIC"
- **mapId**:  地图ID。召唤师峡谷：11。
- **lobbyName**: 房间名称

```json
async def creatLabby(connection):
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

**根据ID创建**
```python
async def addBots(connection):
	champions = [122, 86, 1, 51, 25]
	for id in champions:
		bots = {
			"championId": id,
			"botDifficulty": "MEDIUM",
			"teamId": "200"
		}
		await connection.request('post', '/lol-lobby/v1/lobby/custom/bots', data=bots)
```
  
<br>  
  
**根据名称创建**
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
  

### gameModes

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
  
输出结果：
这里使用了由 @kdelmonte 开发的 [JSON to Markdown Table](https://kdelmonte.github.io/json-to-markdown-table/) 工具，将数据转换为 Markdown 表格。

你看到前面一些空白的数据，可能是已经废弃的地图，后面有新的地图进行替换。


|  id  |        type       |         name         |      shortName       |    description    | category |      gameMode     | mapId | gameTypeId |            gameTypeName           |
| ---- | ----------------- | -------------------- | -------------------- | ----------------- | -------- | ----------------- | ----- | ---------- | --------------------------------- |
|    2 | NORMAL            | 匹配模式             | 匹配模式             | 自选模式          | PvP      | CLASSIC           |    11 |          1 | GAME_CFG_PICK_BLIND               |
|    8 | NORMAL_3x3        | 匹配模式             | 匹配模式             | 自选模式          | PvP      | CLASSIC           |    10 |          1 | GAME_CFG_PICK_BLIND               |
|    9 | RANKED_FLEX_TT    | 排位赛 灵活排位      | 排位赛 灵活排位      | 排位赛 灵活排位   | PvP      | CLASSIC           |    10 |          2 | GAME_CFG_DRAFT_STD                |
|   31 | BOT               | 入门                 | 入门                 | 入门              | VersusAi | CLASSIC           |    11 |          1 | GAME_CFG_PICK_BLIND               |
|   32 | BOT               | 新手                 | 新手                 | 新手              | VersusAi | CLASSIC           |    11 |          1 | GAME_CFG_PICK_BLIND               |
|   33 | BOT               | 一般                 | 一般                 | 一般              | VersusAi | CLASSIC           |    11 |          1 | GAME_CFG_PICK_BLIND               |
|   52 | BOT_3x3           | 新手                 | 新手                 | 新手              | VersusAi | CLASSIC           |    10 |          1 | GAME_CFG_PICK_BLIND               |
|   65 | ARAM_UNRANKED_5x5 | 极地大乱斗           | 极地大乱斗           | 极地大乱斗        | PvP      | ARAM              |    12 |          4 | GAME_CFG_PICK_RANDOM              |
|   70 | ONEFORALL_5x5     |                      |                      |                   | PvP      | CLASSIC           |    11 |         14 | GAME_CFG_BLIND_DUPE               |
|   72 | FIRSTBLOOD_1x1    |                      |                      |                   | PvP      | FIRSTBLOOD        |    12 |          7 | GAME_CFG_PICK_SIMUL_TD            |
|   73 | FIRSTBLOOD_2x2    |                      |                      |                   | PvP      | FIRSTBLOOD        |    12 |          7 | GAME_CFG_PICK_SIMUL_TD            |
|   75 | SR_6x6            |                      |                      |                   | PvP      | CLASSIC           |    11 |         16 | GAME_CFG_BLIND_DRAFT_ST           |
|   76 | URF               |                      |                      |                   | PvP      | URF               |    11 |         16 | GAME_CFG_BLIND_DRAFT_ST           |
|   78 | ONEFORALL_5x5     |                      |                      |                   | PvP      | ARAM              |    12 |         15 | GAME_CFG_CROSS_DUPE               |
|   91 | NIGHTMARE_BOT     | 大提魔节             | 大提魔节             | 大提魔节          | PvP      | DOOMBOTSTEEMO     |    11 |          1 | GAME_CFG_PICK_BLIND               |
|   92 | NIGHTMARE_BOT     | 100级铁手挑战        | 100级铁手挑战        | 100级铁手挑战     | PvP      | DOOMBOTSTEEMO     |    11 |          1 | GAME_CFG_PICK_BLIND               |
|   93 | NIGHTMARE_BOT     |                      |                      |                   | PvP      | DOOMBOTSTEEMO     |    11 |          1 | GAME_CFG_PICK_BLIND               |
|   96 | ASCENSION         | 飞升争夺战           | 飞升争夺战           | 飞升争夺战        | PvP      | ASCENSION         |     8 |         16 | GAME_CFG_BLIND_DRAFT_ST           |
|   98 | HEXAKILL          |                      |                      |                   | PvP      | CLASSIC           |    10 |         16 | GAME_CFG_BLIND_DRAFT_ST           |
|  100 | ARAM_UNRANKED_5x5 | 匹配模式             | 匹配模式             | 自选模式          | PvP      | ARAM              |    14 |          4 | GAME_CFG_PICK_RANDOM              |
|  300 | KING_PORO         | 魄罗大乱斗           | 魄罗大乱斗           | 魄罗大乱斗        | PvP      | KINGPORO          |    12 |         16 | GAME_CFG_BLIND_DRAFT_ST           |
|  310 | COUNTER_PICK      |                      |                      |                   | PvP      | CLASSIC           |    11 |         17 | GAME_CFG_COUNTER_PICK             |
|  313 | BILGEWATER        |                      |                      |                   | PvP      | CLASSIC           |    11 |         16 | GAME_CFG_BLIND_DRAFT_ST           |
|  315 | SIEGE             | 枢纽攻防战           | 枢纽攻防战           | 枢纽攻防战        | PvP      | SIEGE             |    11 |         16 | GAME_CFG_BLIND_DRAFT_ST           |
|  318 | URF               | 无限乱斗             | 无限乱斗             | 无限乱斗          | PvP      | URF               |    11 |          4 | GAME_CFG_PICK_RANDOM              |
|  325 | ARSR              | 峡谷大乱斗           | 峡谷大乱斗           | 峡谷大乱斗        | PvP      | ARSR              |    11 |          4 | GAME_CFG_PICK_RANDOM              |
|  400 | NORMAL            | 匹配模式             | 匹配模式             | 征召模式          | PvP      | CLASSIC           |    11 |         18 | GAME_CFG_TEAM_BUILDER_DRAFT       |
|  420 | RANKED_SOLO_5x5   | 排位赛 单排/双排     | 排位赛 单排/双排     | 排位赛 单排/双排  | PvP      | CLASSIC           |    11 |         18 | GAME_CFG_TEAM_BUILDER_DRAFT       |
|  430 | NORMAL            | 匹配模式             | 匹配模式             | 自选模式          | PvP      | CLASSIC           |    11 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
|  440 | RANKED_FLEX_SR    | 排位赛 灵活排位      | 排位赛 灵活排位      | 排位赛 灵活排位   | PvP      | CLASSIC           |    11 |         18 | GAME_CFG_TEAM_BUILDER_DRAFT       |
|  450 | ARAM_UNRANKED_5x5 | 极地大乱斗           | 极地大乱斗           | 极地大乱斗        | PvP      | ARAM              |    12 |         21 | GAME_CFG_TEAM_BUILDER_RANDOM      |
|  460 | NORMAL_3x3        | 匹配模式             | 匹配模式             | 自选模式          | PvP      | CLASSIC           |    10 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
|  470 | RANKED_FLEX_TT    | 排位赛 灵活排位      | 排位赛 灵活排位      | 排位赛 灵活排位   | PvP      | CLASSIC           |    10 |         18 | GAME_CFG_TEAM_BUILDER_DRAFT       |
|  600 | ASSASSINATE       | 红月决               | 红月决               | 红月决            | PvP      | ASSASSINATE       |    11 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
|  610 | DARKSTAR          | 暗星：奇点           | 暗星                 | 暗星：奇点        | PvP      | DARKSTAR          |    16 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
|  700 | CLASH             | 冠军杯赛             | 冠军杯赛             | 冠军杯赛          | PvP      | CLASSIC           |    11 |         18 | GAME_CFG_TEAM_BUILDER_DRAFT       |
|  800 | BOT_3x3           | 一般                 | 一般                 | 一般              | VersusAi | CLASSIC           |    10 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
|  810 | BOT_3x3           | 入门                 | 入门                 | 入门              | VersusAi | CLASSIC           |    10 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
|  820 | BOT_3x3           | 新手                 | 新手                 | 新手              | VersusAi | CLASSIC           |    10 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
|  830 | BOT               | 入门                 | 入门                 | 入门              | VersusAi | CLASSIC           |    11 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
|  840 | BOT               | 新手                 | 新手                 | 新手              | VersusAi | CLASSIC           |    11 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
|  850 | BOT               | 一般                 | 一般                 | 一般              | VersusAi | CLASSIC           |    11 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
|  860 | ARAM_BOT          |                      |                      |                   | VersusAi | ARAM              |    12 |         21 | GAME_CFG_TEAM_BUILDER_RANDOM      |
|  900 | URF               | 无限火力             | 无限火力             | 无限火力          | PvP      | URF               |    11 |         20 | GAME_CFG_TEAM_BUILDER_BLIND_DRAFT |
|  910 | ASCENSION         | 飞升争夺战           | 飞升争夺战           | 飞升争夺战        | PvP      | ASCENSION         |     8 |         20 | GAME_CFG_TEAM_BUILDER_BLIND_DRAFT |
|  920 | KING_PORO         | 魄罗大乱斗           | 魄罗大乱斗           | 魄罗大乱斗        | PvP      | KINGPORO          |    12 |         21 | GAME_CFG_TEAM_BUILDER_RANDOM      |
|  930 | BILGEWATER        | 极地大乱斗           | 极地大乱斗           | 极地大乱斗        | PvP      | CLASSIC           |    11 |         20 | GAME_CFG_TEAM_BUILDER_BLIND_DRAFT |
|  940 | SIEGE             | 枢纽攻防战           | 枢纽攻防战           | 枢纽攻防战        | PvP      | SIEGE             |    11 |         20 | GAME_CFG_TEAM_BUILDER_BLIND_DRAFT |
|  950 | NIGHTMARE_BOT     | 100级铁手挑战        | 100级铁手挑战        | 100级铁手挑战     | PvP      | DOOMBOTSTEEMO     |    11 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
|  960 | NIGHTMARE_BOT     | 大提魔节             | 大提魔节             | 大提魔节          | PvP      | DOOMBOTSTEEMO     |    11 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
|  980 | STARGUARDIAN      | 怪兽入侵（普通）     | 怪兽入侵（普通）     | 普通              | PvP      | STARGUARDIAN      |    18 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
|  990 | STARGUARDIAN      | 怪兽入侵（狂袭）     | 怪兽入侵（狂袭）     | 狂袭              | PvP      | STARGUARDIAN      |    18 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 1000 | PROJECT           | 超频行动             | 超频行动             | 超频行动          | PvP      | PROJECT           |    19 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 1010 | SNOWURF           | 冰雪无限火力         | 冰雪无限火力         | 冰雪无限火力      | PvP      | SNOWURF           |    11 |         21 | GAME_CFG_TEAM_BUILDER_RANDOM      |
| 1020 | ONEFORALL         | 克隆大作战           | 克隆大作战           | 克隆大作战        | PvP      | ONEFORALL         |    11 |         22 | GAME_CFG_TEAM_BUILDER_BLIND_DUPE  |
| 1030 | ODYSSEY           | 奥德赛(入门：一星)   | 奥德赛(入门：一星)   | 入门(难度：一星)  | PvP      | ODYSSEY           |    20 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 1040 | ODYSSEY           | 奥德赛(学员：二星)   | 奥德赛(学员：二星)   | 学员(难度：二星)  | PvP      | ODYSSEY           |    20 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 1050 | ODYSSEY           | 奥德赛(组员：三星)   | 奥德赛(组员：三星)   | 组员(难度：三星)  | PvP      | ODYSSEY           |    20 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 1060 | ODYSSEY           | 奥德赛(船长：四星)   | 奥德赛(船长：四星)   | 船长(难度：四星)  | PvP      | ODYSSEY           |    20 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 1070 | ODYSSEY           | 奥德赛(狂袭：五星)   | 奥德赛(狂袭：五星)   | 狂袭(难度：五星)  | PvP      | ODYSSEY           |    20 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 1090 | NORMAL_TFT        | 云顶之弈（匹配模式） | 云顶之弈（匹配模式） | 匹配模式          | PvP      | TFT               |    22 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 1091 | NORMAL_TFT        | 1v0                  | 1v0                  | 1v0               | PvP      | TFT               |    22 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 1092 | NORMAL_TFT        | 2v0                  | 2v0                  | 2v0               | PvP      | TFT               |    22 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 1100 | RANKED_TFT        | 云顶之弈 (排位赛)    | 云顶之弈 (排位赛)    | 排位              | PvP      | TFT               |    22 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 1110 | TUTORIAL_TFT      | 云顶之弈 (新手教程)  | 云顶之弈 (新手教程)  | 新手教程          | PvP      | TFT               |    22 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 1111 | NORMAL_TFT        | 云顶之弈模拟战       | 云顶之弈模拟战       | 模拟战            | PvP      | TFT               |    22 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 1200 | GAMEMODEX         | 极限闪击             | 极限闪击             | 自选模式          | PvP      | GAMEMODEX         |    21 |         18 | GAME_CFG_TEAM_BUILDER_DRAFT       |
| 1300 | NEXUSBLITZ        | 极限闪击             | 极限闪击             | 自选模式          | PvP      | NEXUSBLITZ        |    21 |         18 | GAME_CFG_TEAM_BUILDER_DRAFT       |
| 2000 | TUTORIAL_MODULE_1 | 新手教程 第一部分    | 新手教程 第一部分    | 新手教程 第一部分 | PvP      | TUTORIAL_MODULE_1 |    11 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 2010 | TUTORIAL_MODULE_2 | 新手教程 第二部分    | 新手教程 第二部分    | 新手教程 第二部分 | PvP      | TUTORIAL_MODULE_2 |    11 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |
| 2020 | TUTORIAL_MODULE_3 | 新手教程 第三部分    | 新手教程 第三部分    | 新手教程 第三部分 | PvP      | TUTORIAL_MODULE_3 |    11 |         19 | GAME_CFG_TEAM_BUILDER_BLIND       |


  
  
# TODO
1. 做个简单的UI，并脱离python环境?

  
<br>  
  
---
  
<br>  
  
# 其他工具
- [LeaueLobby](https://github.com/MarioCrane/LeaueLobby) @MarioCrane



