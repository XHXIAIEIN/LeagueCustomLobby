# 英雄联盟语言切换功能

切换英雄联盟客户端到任意支持的语言。

## 快速开始

```bash
python src/lcu_web_integrated.py
```

打开 http://localhost:8765 → 点击「语言切换」→ 选择语言 → 选择方法 → **重启客户端**

> ⚠️ 需要**管理员权限**运行

## 切换方法对比

| 方法 | 优点 | 缺点 |
|------|------|------|
| **方法一：复制资源文件** ⭐推荐 | 稳定持久，不被 Vanguard 重置 | 部分语言需先下载语言包 |
| **方法二：修改配置文件** | 操作简单快速 | 可能被 Vanguard 重置 |

## 支持的语言

| 语言 | 代码 | 语言 | 代码 |
|------|------|------|------|
| 简体中文 | zh_CN | 繁體中文 | zh_TW |
| English (US) | en_US | English (UK) | en_GB |
| 日本語 | ja_JP | 한국어 | ko_KR |
| Français | fr_FR | Deutsch | de_DE |
| Español (ES) | es_ES | Español (MX) | es_MX |
| Italiano | it_IT | Polski | pl_PL |
| Русский | ru_RU | Türkçe | tr_TR |
| Português (BR) | pt_BR | Čeština | cs_CZ |
| Ελληνικά | el_GR | Magyar | hu_HU |
| Română | ro_RO | | |

## API 接口

| 端点 | 说明 |
|------|------|
| `POST /api/locale/get` | 获取当前语言 |
| `POST /api/locale/list` | 获取支持的语言列表 |
| `POST /api/locale/set` | 设置语言 |

设置语言请求体：
```json
{"locale": "ja_JP", "method": "copy"}
```

## 代码调用

```python
from src.lcu_locale_manager import LocaleManager

manager = LocaleManager()
manager.read_current_locale()           # 获取当前语言
manager.set_locale_by_copy('ja_JP')     # 方法一：复制资源
manager.set_locale_by_config('ja_JP')   # 方法二：修改配置
```

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| 切换后没变化 | **重启客户端** |
| 权限不足 | 以**管理员身份**运行 |
| 显示乱码 | 先在游戏设置中下载语言包 |
| 方法二被重置 | 改用**方法一** |

## 项目结构

```
src/
├── lcu_locale_manager.py     # 语言管理核心模块
├── lcu_web_integrated.py     # Web 服务器
templates/
├── index.html                # 前端界面
├── app.js                    # 前端逻辑
```

---

⚠️ 本工具为非官方工具，使用风险自负。
