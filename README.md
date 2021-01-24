# LeagueCustomLobby
英雄联盟创建5V5训练模式

# 工具库
[lcu-driver](https://github.com/sousa-andre/lcu-driver)


# 参考资料
- [Riot 开发者文档](https://developer.riotgames.com/docs/lol)
- [LCU API 速查手册](https://lcu.vivide.re/#operation--lol-lobby-v2-lobby-get)
- [游戏数据资源列表](https://github.com/CommunityDragon/Docs/blob/master/assets.md)
- [创建自定义训练模式房间数据](https://riot-api-libraries.readthedocs.io/en/latest/lcu.html)
  
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

```python
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
  

## 获取服务器地区
```python
data = await connection.request('GET', '/riotclient/get_region_locale')
print(await data.json())
```

参数解释：
- **locale**: 'zh_CN'
- **region**: 'TENCENT'
- **webLanguage**: 'zh'
- **webRegion**: 'staging.na'

<br>  

## 客户端资源信息
完整的列表可在[开发者文档](https://developer.riotgames.com/docs/lol)查询： 
- [queues](http://static.developer.riotgames.com/docs/lol/queues.json) 
- [mapsId](http://static.developer.riotgames.com/docs/lol/maps.json) 
- [gameMode](http://static.developer.riotgames.com/docs/lol/gameModes.json) 
- [gameTypes](http://static.developer.riotgames.com/docs/lol/gameTypes.json) 
- [versions](https://ddragon.leagueoflegends.com/api/versions.json)
- [tencent 国服客户端信息](https://ddragon.leagueoflegends.com/realms/tencent.json)
- [NA 美服客户端信息](https://ddragon.leagueoflegends.com/realms/na.json)
- [PBE 测试服客户端信息](https://ddragon.leagueoflegends.com/realms/pbe.json)

看到的都是英文，感觉头很大？  
没关系，下面可以通过 API 请求客户端的数据，就可以看到国服具体的信息了。

<br>  

## Queue, Maps, Game Modes, Game Types

游戏模式必须是当前开放状态才能创建，即目前客户端可以玩极限闪击，才能创建极限闪击的房间。  

#### 通过API获取：

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

## 获取地图模式数据

可以得到地图的介绍、资源图标等信息

```python
data = await connection.request('get', '/lol-maps/v1/maps')
print(await data.json())
```

<br>  
  
部分输出结果（2021.01.21）  
这里使用了由 @kdelmonte 开发的 [JSON to Markdown Table](https://kdelmonte.github.io/json-to-markdown-table/) 工具，将数据转换为 Markdown 表格。

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
  
对了，这其中还有一些空白的数据，估计是已经被官方废弃的地图，而后面推出了新的地图进行替换。

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
- **isLeader**: 是否为房主
- **allowedKickOthers**: 是否允许踢人
- **allowedInviteOthers**: 是否允许邀请
- **ready**: 准备状态
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

## 获取本地客户端通讯地址
```python
@connector.ready
async def connect(connection):
	print(connection.address)
```
  
<br>  

## 获取游戏安装路径

**通过 lcu_driver 内置属性**
```python
@connector.ready
async def connect(connection):
	path = connection.installation_path
	print(path)
```

**通过 LCU API 请求**
```python
@connector.ready
async def connect(connection):
	path = await connection.request('get', '/data-store/v1/install-dir')
	print(path)
```

注意，由于国服游戏路径会因为编码问题额外生成 gbk 编码的 '鑻遍泟鑱旂洘' 文件夹，需要将它转换为 utf-8 编码的 '英雄联盟'。

```python
path.encode('gbk').decode('utf-8')
```

<br>  

## lockfile
  
**获取 lockfile 文件路径**  
```python
@connector.ready
async def connect(connection):
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
		print(f'riot    {text[3]}')
		return text
	else:
		print(f'{path} \n lockfile 文件不存在' )
	return None
```

**lockfile 内容解释**
```
LeagueClient:{进程PID}:{端口}:{密码}:https
```

然后就可以通过浏览器访问本地资源了。   
` https://127.0.0.1:{端口}/{资源路径} `  

打开后提示需要登陆，输入用户名和密码：  
- 用户名：**riot**  
- 密码：{密码}
 
<br>  


---

## 本地资源与 dragon 对应关系
1. 将前面 plugins/rcp-be-lol-game-data 替换为 lol-game-data  
2. 将中间 global/default 或 global/<region>/<lang> 替换为 assets  
3. 部分资源地址是 lol-game-data/assets/assets/...
  
**小技巧**：  
你可以通过访问部分 .json 数据，读取里面的资源地址，快速找到对应的资源文件。

举例1：  
读取[召唤师技能数据表](http://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/summoner-spells.json)，找到icon 资源的路径  
- plugins/rcp-be-**lol-game-data**/global/default/**v1/summoner-spells.json**
- /lol-game-data/**assets**/v1/summoner-spells.json

举例2：
读取对应[英雄数据](http://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/champions/21.json)，找到此英雄对应的图片资源。
- plugins/rcp-be-**lol-game-data**/global/default/**v1/champions/21.json**
- /lol-game-data/**assets**/v1/champions/21.json


举例3：
读取对应[符文列表](http://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perkstyles.json)，找到对应的图片资源。
- plugins/rcp-be-**lol-game-data**/global/default/**v1/perkstyles.json**
- /lol-game-data/**assets**/v1/perkstyles.json

---

部分资源列表（持续更新中）：


**[召唤师头像](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/)** 
```
/lol-game-data/assets/v1/profile-icons/4804.jpg
```

**[英雄图标](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/)** 
```
/lol-game-data/assets/v1/champion-icons/1.png
```

**[英雄加载页面](https://raw.communitydragon.org/latest/game/assets/characters/)** 
```
/lol-game-data/assets/ASSETS/Characters/Sona/Skins/Base/SonaLoadScreen.jpg
```

**[英雄原画](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-splashes/)** 
```
/lol-game-data/assets/v1/champion-splashes/876/876000.jpg
```

**[英雄模型图](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-chroma-images/)** 
```
/lol-game-data/assets/v1/champion-chroma-images/53/53000.png
```

**[召唤师峡谷背景](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/content/src/leagueclient/gamemodeassets/classic_sru/img/)** 
```
/lol-game-data/assets/content/src/LeagueClient/GameModeAssets/Classic_SRU/img/map-south.png
```

**[地图模式图标](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/content/src/leagueclient/gamemodeassets/)**
```
召唤师峡谷 \ 嚎哭深渊 \ 云顶之弈
/lol-game-data/assets/content/src/leagueclient/gamemodeassets/classic_sru/img/game-select-icon-active.png
/lol-game-data/assets/content/src/leagueclient/gamemodeassets/aram/img/game-select-icon-active.png
/lol-game-data/assets/content/src/leagueclient/gamemodeassets/tft/img/game-select-icon-active.png
```
```
无限乱斗 \ 极限闪击
/lol-game-data/assets/content/src/leagueclient/gamemodeassets/shared/img/icon-rgm-active.png
/lol-game-data/assets/content/src/leagueclient/gamemodeassets/gamemodex/img/social-icon-victory.png
```


**[召唤师技能](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/data/spells/icons2d/)** 
```
/lol-game-data/assets/DATA/Spells/Icons2D/Summoner_teleport.png
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

**[选位图标](https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/)** 
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
  
<br>  


## [获取游戏数据](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/)
  
<br>  

**召唤师图标：Base64**
```python
profileIconId = 4804
image = await connection.request('GET', f'/lol-game-data/assets/v1/profile-icons/{profileIconId}.jpg')
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
  
## 在浏览器中调用 request 请求
该方案来源：[! xXKiller_BOSSXx](https://discord.com/channels/187652476080488449/516802588805431296/793654937795559474)  
  
在控制台中执行这个代码：   
```javascript
def getResources(connection, url):
	lockfile = get_lockfile(connection.installation_path)
	request = requests.post(f'{lockfile[4]}://127.0.0.1:{lockfile[2]}/{url}',
		  headers={'Authorization': f'Basic {base64.b64encode(f"riot:{lockfile[3]}".encode("utf-8")).decode("utf-8")}' },
		  verify='riotgames.pem',
		  json={"queueId" : 450})
	print(f'{lockfile[4]}://127.0.0.1:{lockfile[2]}/{url}')
```

## 通过浏览器控制台调用 API

例如，要获取房间数据  
先创建一个房间，然后通过浏览器控制台调用API发送请求    

```javascript
await request('GET', '/lol-lobby/v2/lobby');
```

就能在页面中看到返回的数据了。


<br>  

---

<br>  


## 启动脚本前，检查游戏是否已运行

需要用到 psutil 库

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
	QMessageBox.warning(Window(),"LeagueCustomLobby", "无法读取游戏数据\n需要先启动游戏，再运行此程序。")
	return
```


<br>  


# TODO
1. 做个简单的UI，并脱离python环境?
  
<br> 

  
---
  
<br>  
  
# 其他工具
- [LeaueLobby](https://github.com/MarioCrane/LeaueLobby) @MarioCrane


