"""
LCU 参数服务
提供快速获取常用 LCU API 参数的功能
"""

from typing import Dict, Any, Optional
from src.lcu_connector import LCUConnector


class LCUParamsService:
    """LCU 参数服务 - 从客户端自动提取常用参数"""

    def __init__(self, connector: LCUConnector):
        """
        初始化参数服务

        Args:
            connector: LCU 连接器实例
        """
        self.connector = connector

    def get_summoner_params(self) -> Dict[str, str]:
        """
        获取当前召唤师相关参数

        Returns:
            包含 summonerId, accountId, puuid, displayName 的字典
        """
        params = {}
        status, data, _ = self.connector.request('GET', '/lol-summoner/v1/current-summoner', None)

        if status == 200 and data:
            params.update({
                'summonerId': str(data.get('summonerId', '')),
                'accountId': str(data.get('accountId', '')),
                'puuid': data.get('puuid', ''),
                'displayName': data.get('displayName', '')
            })

        return params

    def get_champ_select_params(self) -> Dict[str, str]:
        """
        获取英雄选择阶段相关参数

        Returns:
            包含 actionId 的字典
        """
        params = {}
        status, data, _ = self.connector.request('GET', '/lol-champ-select/v1/session', None)

        if status == 200 and data:
            local_player_cell_id = data.get('localPlayerCellId', -1)
            actions = data.get('actions', [])

            for action_group in actions:
                for action in action_group:
                    if action.get('actorCellId') == local_player_cell_id:
                        params['actionId'] = str(action.get('id', ''))
                        break
                if 'actionId' in params:
                    break

        return params

    def get_lobby_params(self) -> Dict[str, str]:
        """
        获取大厅相关参数

        Returns:
            包含 botChampionId, botDifficulty 的字典
        """
        params = {}
        status, data, _ = self.connector.request('GET', '/lol-lobby/v2/lobby/custom/available-bots', None)

        if status == 200 and data and isinstance(data, list) and len(data) > 0:
            params['botChampionId'] = str(data[0].get('id', ''))
            params['botDifficulty'] = 'EASY'

        return params

    def get_all_params(self) -> Dict[str, str]:
        """
        获取所有常用参数

        Returns:
            包含所有可用参数的字典
        """
        all_params = {}

        # 合并所有参数
        all_params.update(self.get_summoner_params())
        all_params.update(self.get_champ_select_params())
        all_params.update(self.get_lobby_params())

        return all_params

    def get_param(self, param_name: str) -> Optional[str]:
        """
        获取特定参数的值

        Args:
            param_name: 参数名称

        Returns:
            参数值，如果不存在返回 None
        """
        # 参数分组映射
        param_groups = {
            'summonerId': self.get_summoner_params,
            'accountId': self.get_summoner_params,
            'puuid': self.get_summoner_params,
            'displayName': self.get_summoner_params,
            'actionId': self.get_champ_select_params,
            'botChampionId': self.get_lobby_params,
            'botDifficulty': self.get_lobby_params,
        }

        # 获取参数所属的组
        getter = param_groups.get(param_name)
        if getter:
            params = getter()
            return params.get(param_name)

        return None
