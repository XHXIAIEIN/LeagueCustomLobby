# LeagueLobbyHelper
英雄联盟创建5V5训练模式

### 工具库
[lcu-driver](https://github.com/sousa-andre/lcu-driver)


### 参考资料
- [LCU API 速查手册](https://lcu.vivide.re/#operation--lol-lobby-v2-lobby-get)
- [训练模式数据格式](https://riot-api-libraries.readthedocs.io/en/latest/lcu.html)


### 核心代码

#### 获取召唤师数据
```python
summoner = await connection.request('get', '/lol-summoner/v1/current-summoner')
print(await summoner.json())
```


####  自定义训练模式
```json
custom = {
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
```

#### 创建房间
```python
await connection.request('post', '/lol-lobby/v2/lobby', data=custom)
```


#### 自定义模式机器人列表
```python
data = await connection.request('GET', '/lol-lobby/v2/lobby/custom/available-bots')
champions = {bots['name']: bots['id'] for bots in await data.json()}
print(champions)
```


#### 批量添加机器人

**根据ID**
```python
champions = [122, 86, 1, 51, 25]
for id in champions:
	bots = {
		"championId": id,
		"botDifficulty": "MEDIUM",
		"teamId": "200"
	}
	await connection.request('post', '/lol-lobby/v1/lobby/custom/bots', data=bots)
```


**根据名称**
```python
activedata = await connection.request('GET', '/lol-lobby/v2/lobby/custom/available-bots')
champions = { bot['name']: bot['id'] for bot in await activedata.json() }

team2 = ["诺克萨斯之手", "德玛西亚之力", "曙光女神", "皮城女警", "众星之子"]

for name in team2:
	bots = {
		"championId": champions[name],
		"botDifficulty": "MEDIUM",
		"teamId": "200"
	}
	await connection.request('post', '/lol-lobby/v1/lobby/custom/bots', data=bots)
```

--

### TODO
1. 做个简单的UI，并脱离python环境?


### 其他工具
- [LeaueLobby](https://github.com/MarioCrane/LeaueLobby) @MarioCrane



