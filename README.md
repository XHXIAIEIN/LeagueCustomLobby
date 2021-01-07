# LeagueLobbyHelper
英雄联盟创建5V5训练模式

# 工具库
[lcu-driver](https://github.com/sousa-andre/lcu-driver)


# 参考资料
- [LCU API 速查手册](https://lcu.vivide.re/#operation--lol-lobby-v2-lobby-get)
- [训练模式数据格式](https://riot-api-libraries.readthedocs.io/en/latest/lcu.html)


# 核心代码


## 获取召唤师数据
```python
summoner = await connection.request('get', '/lol-summoner/v1/current-summoner')
print(await summoner.json())
```


##  自定义训练模式，基本数据格式
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
    "lobbyPassword": ''
  },
  "isCustom": true
}
```

## 创建房间
```python
await connection.request('post', '/lol-lobby/v2/lobby', data=custom)
```


--

# TODO
1. 做个简单的UI，并且可以脱离python环境?
2. 快速添加电脑玩家，并且可以自定义角色，以及难度？



