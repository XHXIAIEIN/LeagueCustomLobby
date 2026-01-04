"""
英雄联盟客户端语言管理器
用于切换游戏客户端的显示语言

支持两种方法：
1. 复制语言资源文件（推荐，不会被 Vanguard 重置）
2. 修改 YAML 配置文件（可能被 Vanguard 重置）
"""

import os
import yaml
import shutil
from typing import Optional, Tuple, List, Dict
from pathlib import Path


class LocaleManager:
    """
    游戏语言管理器

    支持两种切换语言的方法
    """

    # 支持的语言列表
    SUPPORTED_LOCALES = {
        'zh_CN': '简体中文',
        'zh_TW': '繁體中文',
        'en_US': 'English (US)',
        'en_GB': 'English (UK)',
        'ja_JP': '日本語',
        'ko_KR': '한국어',
        'fr_FR': 'Français',
        'de_DE': 'Deutsch',
        'es_ES': 'Español (ES)',
        'es_MX': 'Español (MX)',
        'it_IT': 'Italiano',
        'pl_PL': 'Polski',
        'ru_RU': 'Русский',
        'tr_TR': 'Türkçe',
        'pt_BR': 'Português (BR)',
        'cs_CZ': 'Čeština',
        'el_GR': 'Ελληνικά',
        'hu_HU': 'Magyar',
        'ro_RO': 'Română',
    }

    # 常见的 Riot Games 配置文件路径
    DEFAULT_CONFIG_PATHS = [
        r"C:\ProgramData\Riot Games\Metadata\league_of_legends.live\league_of_legends.live.product_settings.yaml",
        r"C:\ProgramData\Riot Games\RiotClientInstalls.json",
    ]

    def __init__(self):
        """初始化语言管理器"""
        self.config_path: Optional[str] = None
        self.current_locale: Optional[str] = None
        self.game_root: Optional[str] = None

    def find_config_file(self) -> Tuple[bool, str]:
        """
        查找 Riot Games 配置文件

        Returns:
            (成功与否, 消息或文件路径)
        """
        # 检查默认路径
        for path in self.DEFAULT_CONFIG_PATHS:
            if os.path.exists(path) and path.endswith('.yaml'):
                self.config_path = path
                return True, path

        # 尝试查找 Riot Games 安装目录
        programdata = os.environ.get('PROGRAMDATA', r'C:\ProgramData')
        riot_metadata = os.path.join(programdata, 'Riot Games', 'Metadata')

        if os.path.exists(riot_metadata):
            for root, dirs, files in os.walk(riot_metadata):
                for file in files:
                    if file.endswith('product_settings.yaml') and 'league_of_legends' in file:
                        full_path = os.path.join(root, file)
                        self.config_path = full_path
                        return True, full_path

        return False, "未找到 Riot Games 配置文件，请确保英雄联盟已正确安装"

    def read_current_locale(self) -> Tuple[bool, str]:
        """
        读取当前配置的语言

        Returns:
            (成功与否, 当前语言代码或错误消息)
        """
        if not self.config_path:
            success, msg = self.find_config_file()
            if not success:
                return False, msg

        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)

            # 尝试从多个位置读取语言设置
            locale = None
            if config:
                # 方法1: locale_data.default_locale (主要位置)
                if 'locale_data' in config and 'default_locale' in config['locale_data']:
                    locale = config['locale_data']['default_locale']
                # 方法2: settings.locale (备用位置)
                elif 'settings' in config and 'locale' in config['settings']:
                    locale = config['settings']['locale']
                # 方法3: settings.default_locale
                elif 'settings' in config and 'default_locale' in config['settings']:
                    locale = config['settings']['default_locale']

            if locale:
                self.current_locale = locale
                locale_name = self.SUPPORTED_LOCALES.get(locale, locale)
                return True, f"{locale} ({locale_name})"
            else:
                return False, "配置文件中未找到语言设置"

        except Exception as e:
            return False, f"读取配置文件失败: {str(e)}"

    def set_locale(self, locale_code: str) -> Tuple[bool, str]:
        """
        设置游戏语言（方法二：修改配置文件）

        Args:
            locale_code: 语言代码 (如 'zh_CN', 'en_US')

        Returns:
            (成功与否, 消息)
        """
        # 验证语言代码
        if locale_code not in self.SUPPORTED_LOCALES:
            return False, f"不支持的语言代码: {locale_code}"

        # 查找配置文件
        if not self.config_path:
            success, msg = self.find_config_file()
            if not success:
                return False, msg

        try:
            # 读取现有配置
            with open(self.config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)

            # 修改语言设置（同时更新两个位置）
            if not config:
                config = {}

            # 位置1: locale_data.default_locale
            if 'locale_data' not in config:
                config['locale_data'] = {}
            old_locale = config['locale_data'].get('default_locale', '未知')
            config['locale_data']['default_locale'] = locale_code

            # 位置2: settings.locale
            if 'settings' not in config:
                config['settings'] = {}
            config['settings']['locale'] = locale_code

            # 写入配置
            with open(self.config_path, 'w', encoding='utf-8') as f:
                yaml.safe_dump(config, f, allow_unicode=True, default_flow_style=False)

            self.current_locale = locale_code
            locale_name = self.SUPPORTED_LOCALES[locale_code]

            return True, f"语言已从 {old_locale} 切换到 {locale_code} ({locale_name})。请重启游戏客户端以应用更改。"

        except PermissionError:
            return False, "权限不足，请以管理员身份运行此程序"
        except Exception as e:
            return False, f"设置语言失败: {str(e)}"

    def get_available_locales(self) -> List[Dict[str, str]]:
        """
        获取所有可用的语言列表

        Returns:
            语言列表，每项包含 code 和 name
        """
        return [
            {'code': code, 'name': name}
            for code, name in self.SUPPORTED_LOCALES.items()
        ]

    def find_game_root(self) -> Tuple[bool, str]:
        """
        查找游戏根目录

        Returns:
            (成功与否, 游戏根目录路径或错误消息)
        """
        # 从配置文件获取游戏路径
        if not self.config_path:
            success, msg = self.find_config_file()
            if not success:
                return False, msg

        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)

            if config and 'product_install_full_path' in config:
                game_path = config['product_install_full_path']
                if os.path.exists(game_path):
                    self.game_root = game_path
                    return True, game_path

            # 尝试常见安装路径
            common_paths = [
                r"C:\Riot Games\League of Legends",
                r"D:\Riot Games\League of Legends",
                r"E:\Riot Games\League of Legends",
            ]

            for path in common_paths:
                if os.path.exists(path):
                    game_dir = os.path.join(path, 'Game')
                    if os.path.exists(game_dir):
                        self.game_root = path
                        return True, path

            return False, "未找到游戏根目录"

        except Exception as e:
            return False, f"查找游戏目录失败: {str(e)}"

    def set_locale_by_copy(self, locale_code: str) -> Tuple[bool, str]:
        """
        方法一：通过复制语言资源文件切换语言（推荐）

        Args:
            locale_code: 语言代码 (如 'fr_FR', 'en_US')

        Returns:
            (成功与否, 消息)
        """
        # 验证语言代码
        if locale_code not in self.SUPPORTED_LOCALES:
            return False, f"不支持的语言代码: {locale_code}"

        # 查找游戏根目录
        if not self.game_root:
            success, msg = self.find_game_root()
            if not success:
                return False, msg

        try:
            locale_name = self.SUPPORTED_LOCALES[locale_code]
            steps_completed = []

            # 步骤 1: 复制 Game/DATA/FINAL/{lang} 到 Game/DATA/FINAL
            source_final = os.path.join(self.game_root, 'Game', 'DATA', 'FINAL', locale_code)
            dest_final = os.path.join(self.game_root, 'Game', 'DATA', 'FINAL')

            if not os.path.exists(source_final):
                return False, f"未找到语言资源目录: {source_final}"

            # 复制文件（不覆盖现有文件）
            copied_count = 0
            for root, dirs, files in os.walk(source_final):
                for file in files:
                    src_file = os.path.join(root, file)
                    rel_path = os.path.relpath(src_file, source_final)
                    dest_file = os.path.join(dest_final, rel_path)

                    # 创建目标目录
                    os.makedirs(os.path.dirname(dest_file), exist_ok=True)

                    # 只在目标文件不存在时复制
                    if not os.path.exists(dest_file):
                        shutil.copy2(src_file, dest_file)
                        copied_count += 1

            steps_completed.append(f"复制了 {copied_count} 个游戏资源文件")

            # 步骤 2: 复制 LeagueClient 语言资源 WAD 文件
            source_wad = os.path.join(
                self.game_root, 'Plugins', 'rcp-be-lol-game-data', f'{locale_code}-assets.wad'
            )
            dest_wad_dir = os.path.join(self.game_root, 'LeagueClient', 'Plugins', 'rcp-be-lol-game-data')

            if os.path.exists(source_wad):
                os.makedirs(dest_wad_dir, exist_ok=True)
                dest_wad = os.path.join(dest_wad_dir, f'{locale_code}-assets.wad')

                # 检查是否需要复制
                if not os.path.exists(dest_wad):
                    shutil.copy2(source_wad, dest_wad)
                    steps_completed.append(f"复制了客户端语言资源文件")
                else:
                    steps_completed.append(f"客户端语言资源文件已存在")
            else:
                steps_completed.append(f"警告: 未找到客户端语言资源 {source_wad}")

            self.current_locale = locale_code
            message = f"语言已切换到 {locale_code} ({locale_name})\n" + "\n".join(f"- {step}" for step in steps_completed)
            message += "\n\n请重启游戏客户端以应用更改。"

            return True, message

        except PermissionError:
            return False, "权限不足，请以管理员身份运行此程序"
        except Exception as e:
            return False, f"复制语言文件失败: {str(e)}"

    def set_locale_by_config(self, locale_code: str) -> Tuple[bool, str]:
        """
        方法二：通过修改配置文件切换语言

        注意：此方法可能被 Vanguard 反作弊引擎重置

        Args:
            locale_code: 语言代码

        Returns:
            (成功与否, 消息)
        """
        return self.set_locale(locale_code)
