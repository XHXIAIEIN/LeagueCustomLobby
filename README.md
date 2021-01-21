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
  
  
### mapID

mapID 必须是开放状态才能创建。即目前客户端可以玩极限闪击，才能创建极限闪击的房间。  
完整的 mapID 列表可以在[官方文档](http://static.developer.riotgames.com/docs/lol/maps.json)查询。

| mapId	| CN		    | mapName		   |   notes		  |
| ----- | ----------------- | -------------------- |  -------------------- |
| 3	| 教学模式		| The Proving Grounds	|  Tutorial Map		|
| 11	| 召唤师峡谷		| Summoner's Rift	| Current Version	|
| 12	| 嚎哭深渊		| Howling Abyss		| ARAM map		|
| 20	| 云顶之奕		| Convergence		| Teamfight Tactics map	|
| 21	| 极限闪击		| Nexus Blitz		| Nexus Blitz map	|

<br>  


### gameModes

必须是开放状态才能创建，即目前客户端可以玩极限闪击，才能创建极限闪击的房间。  
完整的 gameMode 列表可以在[官方文档](http://static.developer.riotgames.com/docs/lol/gameModes.json)查询。

| gameMode	| CN		   | 	
|---------------| ---------------- | 
| PRACTICETOOL	| 训练模式		| 
| CLASSIC	| 召唤师峡谷		|
| ARAM		| 嚎哭深渊		|
| GAMEMODEX	| 极限闪击		|
| URF		| 无限火力		|
| TFT		| 云顶之弈		|
| NORMAL	| 匹配模式		|
| TUTORIAL_MODULE_1	| 新手教程 第一部分	|
| TUTORIAL_MODULE_2	| 新手教程 第二部分	|
| TUTORIAL_MODULE_3	| 新手教程 第三部分	|
| ARSR		| 峡谷大乱斗		|
| KINGPORO	| 魄罗大乱斗		|
| ONEFORALL	| 克隆大作战		|
| SIEGE		| 枢纽攻防战 	|
| ASCENSION	| 飞升争夺战		|
| SNOWURF	| 冰雪无限火力 	|
| DARKSTAR	| 暗星		|
| ASSASSINATE	| 红月决		|
| ODYSSEY	| 奥德赛		|
| DOOMBOTSTEEMO	| 大提魔节 		|
| STARGUARDIAN	| 怪兽入侵		|
| PROJECT 	| 超频行动 		|
| FIRSTBLOOD	|  |

### queue

**get queue**
```python
async def getQueuesInfo(connection):
	data = await connection.request('get', '/lol-game-queues/v1/queues')
	print(await data.json())
```
  
**get queue by id**
```python
async def getQueuesInfo(connection):
	id = 900
	data = await connection.request('get', f'/lol-game-queues/v1/queues/{id}')
	print(await data.json())
```

  
  
# TODO
1. 做个简单的UI，并脱离python环境?

  
<br>  
  
---
  
<br>  
  
# 其他工具
- [LeaueLobby](https://github.com/MarioCrane/LeaueLobby) @MarioCrane



