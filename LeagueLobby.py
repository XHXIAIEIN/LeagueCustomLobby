from lcu_driver import Connector

#===============================================================================
# * 声明
#===============================================================================
# 作者：XHXIAIEIN
# 更新：2021/01/08
# 主页：https://github.com/XHXIAIEIN/LeagueLobbyHelper/
#===============================================================================

#-------------------------------------------------------------------------------
# 使用到的工具库
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
# 2. 快速添加电脑玩家（自定义角色、难度）
#-------------------------------------------------------------------------------

connector = Connector()

@connector.ready
async def connect(connection):
  await getSummonerInfo(connection)
  await creatLabby(connection)

@connector.close
async def disconnect(connection):
    print('Finished task')

# 获取召唤师信息
async def getSummonerInfo(connection):
  summoner = await connection.request('get', '/lol-summoner/v1/current-summoner')
  if summoner.status == 200:
    data = await summoner.json()
    print(f'[获取信息] 召唤师：{data["displayName"]} (等级：{data["summonerLevel"]}）')
  else:
    print('账号信息获取失败')

# 创建训练模式 5V5自定义房间
async def creatLabby(connection):
  customGameLobby = {
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
  lobby = await connection.request('post', '/lol-lobby/v2/lobby', data=customGameLobby)
  if lobby.status == 200:
    print(f'[创建5V5训练模式] 已成功创建 训练房间')

connector.start()
