# 英雄联盟语言切换功能说明

## 功能概述

本工具集新增了游戏客户端语言切换功能，支持切换英雄联盟客户端到任意支持的语言。

## 支持的语言

- 🇨🇳 简体中文 (zh_CN)
- 🇹🇼 繁體中文 (zh_TW)
- 🇺🇸 English (US) (en_US)
- 🇬🇧 English (UK) (en_GB)
- 🇯🇵 日本語 (ja_JP)
- 🇰🇷 한국어 (ko_KR)
- 🇫🇷 Français (fr_FR)
- 🇩🇪 Deutsch (de_DE)
- 🇪🇸 Español (ES) (es_ES)
- 🇲🇽 Español (MX) (es_MX)
- 🇮🇹 Italiano (it_IT)
- 🇵🇱 Polski (pl_PL)
- 🇷🇺 Русский (ru_RU)
- 🇹🇷 Türkçe (tr_TR)
- 🇧🇷 Português (BR) (pt_BR)
- 🇨🇿 Čeština (cs_CZ)
- 🇬🇷 Ελληνικά (el_GR)
- 🇭🇺 Magyar (hu_HU)
- 🇷🇴 Română (ro_RO)

## 两种切换方法

### 方法一：复制语言资源文件（推荐）⭐

**优点：**
- ✅ 不会被 Vanguard 反作弊引擎重置
- ✅ 更稳定可靠
- ✅ 持久生效

**工作原理：**
1. 从 `Game/DATA/FINAL/{语言代码}/` 复制语言资源文件到 `Game/DATA/FINAL/`
2. 复制 `Plugins/rcp-be-lol-game-data/{语言代码}-assets.wad` 到 `LeagueClient/Plugins/rcp-be-lol-game-data/`

**注意事项：**
- 需要以管理员身份运行程序
- 部分语言资源需要先在游戏设置中下载

### 方法二：修改配置文件

**优点：**
- ✅ 操作简单快速
- ✅ 不需要复制大量文件

**缺点：**
- ⚠️ 可能被 Vanguard 反作弊引擎重置
- ⚠️ 需要以管理员身份运行

**工作原理：**
修改 `C:\ProgramData\Riot Games\Metadata\league_of_legends.live\league_of_legends.live.product_settings.yaml` 配置文件中的语言设置。

## 使用步骤

1. 启动工具 `python src/lcu_web_integrated.py`
2. 在浏览器中打开 http://localhost:8765
3. 点击左侧边栏的「语言切换」按钮
4. 在弹窗中查看当前语言
5. 选择目标语言
6. 选择切换方法：
   - 点击「方法一（推荐）」使用文件复制方式
   - 点击「方法二」使用配置文件方式
7. 等待切换完成
8. **重启游戏客户端**以应用更改

## 技术实现

### 后端 API

- `POST /api/locale/get` - 获取当前语言
- `POST /api/locale/list` - 获取支持的语言列表
- `POST /api/locale/set` - 设置语言
  - 请求体：`{"locale": "zh_CN", "method": "copy"}` 或 `{"locale": "zh_CN", "method": "config"}`

### 前端功能

- 语言切换模态框
- 当前语言检测
- 支持的语言下拉选择
- 切换进度和结果显示

### 模块结构

```
src/
├── lcu_connector.py          # LCU API 连接器
├── lcu_locale_manager.py     # 语言管理核心模块
├── lcu_params_service.py     # 参数提取服务
└── lcu_web_integrated.py     # Web 服务器（已集成语言切换 API）
templates/
├── index.html                # 前端 HTML（包含语言切换 UI）
├── app.js                    # 前端 JavaScript（包含语言切换逻辑）
└── styles.css                # 样式表
```

## 常见问题

### Q: 切换后游戏没有变化？
A: 确保已经**重启游戏客户端**。语言设置只有在客户端重启后才会生效。

### Q: 提示权限不足？
A: 请以**管理员身份**运行 Python 程序。右键点击命令提示符/PowerShell，选择"以管理员身份运行"。

### Q: 某些语言切换后显示乱码？
A: 该语言的资源文件可能未完全下载。请先在游戏设置中下载对应的语言包。

### Q: 方法二切换后被重置？
A: 这是正常现象。Vanguard 反作弊引擎可能会重置配置文件。建议使用**方法一**。

### Q: 支持自动检测游戏路径吗？
A: 是的，工具会自动从配置文件中读取游戏路径，也会尝试常见的安装位置。

## 安全说明

- 本功能仅修改游戏语言设置，不涉及任何游戏内容修改
- 所有操作都是可逆的
- 使用方法一不会覆盖原有文件，仅复制不存在的文件
- 建议在切换前备份配置文件（如果使用方法二）

## 开发者信息

### 依赖

- Python 3.7+
- PyYAML

### 代码示例

```python
from src.lcu_locale_manager import LocaleManager

manager = LocaleManager()

# 获取当前语言
success, msg = manager.read_current_locale()
print(msg)

# 切换语言（方法一）
success, msg = manager.set_locale_by_copy('zh_CN')
print(msg)

# 切换语言（方法二）
success, msg = manager.set_locale_by_config('zh_CN')
print(msg)
```

## 更新日志

### v2.1.0 (2024)
- ✨ 新增游戏语言切换功能
- ✨ 支持两种切换方法（文件复制 + 配置修改）
- ✨ 支持 19 种官方语言
- ✨ 自动检测游戏路径和当前语言
- 🎨 新增语言切换 UI 界面

---

**注意：** 本工具为非官方工具，使用风险自负。如有任何问题，请联系开发者或提交 Issue。
