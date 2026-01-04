"""
英雄联盟客户端语言管理器
用于切换游戏客户端的显示语言

通过修改 Riot Games 配置文件实现语言切换
"""

import os
import yaml
from typing import Optional, Tuple, List, Dict


class LocaleManager:
    """
    游戏语言管理器

    通过修改配置文件切换客户端显示语言
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
