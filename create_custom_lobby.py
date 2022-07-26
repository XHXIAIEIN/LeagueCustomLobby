from lcu_driver import Connector

#=============================================================================
# * 声明
#=============================================================================
# 作者：XHXIAIEIN
# 更新：2021/01/08
# 主页：https://github.com/XHXIAIEIN/LeagueCustomLobby/
#=============================================================================

#-----------------------------------------------------------------------------
# 工具库
#-----------------------------------------------------------------------------
#  - lcu-driver 
#    https://github.com/sousa-andre/lcu-driver
#-----------------------------------------------------------------------------

connector = Connector()

#-----------------------------------------------------------------------------
# 获得召唤师数据
#-----------------------------------------------------------------------------
async def get_summoner_data(connection):
    data = await connection.request('GET', '/lol-summoner/v1/current-summoner')
    summoner = await data.json()
    print(f"displayName:    {summoner['displayName']}")
    print(f"summonerId:     {summoner['summonerId']}")
    print(f"puuid:          {summoner['puuid']}")
    print("-")

#-----------------------------------------------------------------------------
# 创建训练模式 5V5 自定义房间
#-----------------------------------------------------------------------------
async def create_custom_lobby(connection):
  custom = {
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
  await connection.request('POST', '/lol-lobby/v2/lobby', data=custom)

#-----------------------------------------------------------------------------
# 添加单个机器人
#-----------------------------------------------------------------------------
async def add_bots_team1(connection):
  soraka = {
    'championId':16,
    'botDifficulty':'EASY',
    'teamId':'100'
  }
  await connection.request('POST', '/lol-lobby/v1/lobby/custom/bots', data=soraka)

#-----------------------------------------------------------------------------
# 批量添加机器人
#-----------------------------------------------------------------------------
async def add_bots_team2(connection):
  # 获取自定义模式电脑玩家列表
  activedata = await connection.request('GET', '/lol-lobby/v2/lobby/custom/available-bots')
  champions = { bot['name']: bot['id'] for bot in await activedata.json() }

  team2 = ['诺克萨斯之手', '德玛西亚之力', '曙光女神', '皮城女警', '光辉女郎']

  for name in team2:
    bot = { 'championId': champions[name], 'botDifficulty': 'MEDIUM', 'teamId': '200'}
    await connection.request('POST', '/lol-lobby/v1/lobby/custom/bots', data=bot)

#-----------------------------------------------------------------------------
# websocket
#-----------------------------------------------------------------------------
@connector.ready
async def connect(connection):
  await get_summoner_data(connection)
  await create_custom_lobby(connection)
  await add_bots_team1(connection)
  await add_bots_team2(connection)

#-----------------------------------------------------------------------------
# Main
#-----------------------------------------------------------------------------
connector.start()
