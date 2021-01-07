from lcu_driver import Connector

#===============================================================================
# * 声明
#===============================================================================
# 作者：XHXIAIEIN
# 更新：2021/01/08
# 主页：https://github.com/XHXIAIEIN/LeagueLobbyHelper/
#===============================================================================

#-------------------------------------------------------------------------------
# 工具库
#-------------------------------------------------------------------------------
#  - lcu-driver 
#    https://github.com/sousa-andre/lcu-driver
#-------------------------------------------------------------------------------

#-------------------------------------------------------------------------------
# 参考资料
#-------------------------------------------------------------------------------
#  - LCU API 速查手册
#    https://lcu.vivide.re/#operation--lol-lobby-v2-lobby-get
#
#  - 训练模式数据格式
#    https://riot-api-libraries.readthedocs.io/en/latest/lcu.html
#-------------------------------------------------------------------------------

#-------------------------------------------------------------------------------
# 接下来的计划 TODO 
# 1. 可视化GUI
#-------------------------------------------------------------------------------

connector = Connector()

#-------------------------------------------------------------------------------
# 获取召唤师信息
#-------------------------------------------------------------------------------
async def getSummonerInfo(connection):
  summoner = await connection.request('get', '/lol-summoner/v1/current-summoner')
  if summoner.status == 200:
    data = await summoner.json()
    print(f'[获取信息] 召唤师：{data["displayName"]} (等级：{data["summonerLevel"]}）')
  else:
    print('账号信息获取失败')

#-------------------------------------------------------------------------------
# 创建训练模式 5V5自定义房间
#-------------------------------------------------------------------------------
async def creatLabby(connection):
  # 房间数据
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
      "lobbyName": "训练模式",
      "lobbyPassword": ""
    },
    "isCustom": True
  }

  lobby = await connection.request('post', '/lol-lobby/v2/lobby', data=custom)

  if lobby.status == 200:
    print(f'[创建5V5训练模式] 已成功创建 训练房间')

#-------------------------------------------------------------------------------
# 快速添加机器人
#-------------------------------------------------------------------------------
async def addBots(connection):
  # 获取自定义模式电脑玩家列表
  activedata = await connection.request('GET', '/lol-lobby/v2/lobby/custom/available-bots')
  champions = { bot['name']: bot['id'] for bot in await activedata.json() }
  # 添加机器人
  team2 = ["诺克萨斯之手", "德玛西亚之力", "曙光女神", "皮城女警", "众星之子"]
  for name in team2:
    bots = {
      "championId": champions[name],
      "botDifficulty": "MEDIUM",
      "teamId": "200"
    }
    await connection.request('post', '/lol-lobby/v1/lobby/custom/bots', data=bots)

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------

@connector.ready
async def connect(connection):
  await getSummonerInfo(connection)
  await creatLabby(connection)
  await addBots(connection)

@connector.close
async def disconnect(connection):
    print('Finished')

connector.start()
