# 英雄联盟客户端工具集

一个集成的 LOL 客户端工具，包含 **LCU API 测试器**、**Data Dragon 数据查询系统** 和 **游戏语言切换功能**。

## 快速开始

双击运行 **run_web.bat** 启动工具，浏览器会自动打开 http://localhost:8765

或者通过命令行启动：
```bash
python src/lcu_web_integrated.py
```

## 主要功能

### 1. LCU API 测试器
- 自动连接本地 LOL 客户端
- 测试客户端 API 接口
- 支持 GET/POST/PUT/PATCH/DELETE 请求
- 预设常用 API 端点
- 自动填充参数功能
- 实时响应展示

### 2. Data Dragon 数据查询
- 多语言/多版本支持
- 英雄资料库（背景故事、技能、皮肤等）
- 道具库（价格、属性、合成路线）
- 召唤师技能查询
- 召唤师图标浏览
- 支持搜索、筛选、排序

### 3. 游戏语言切换
- 支持 19 种官方语言
- 两种切换方法（文件复制 / 配置修改）
- 自动检测游戏路径和当前语言

## 项目结构

```
LOL/
├── src/                              # 后端 Python 源代码
│   ├── lcu_connector.py              # LCU API 连接器
│   ├── lcu_web_integrated.py         # 集成服务器主程序
│   ├── lcu_params_service.py         # 参数提取服务
│   └── lcu_locale_manager.py         # 语言切换管理器
│
├── templates/                        # 前端 Web 资源
│   ├── index.html                    # 主页面
│   ├── app.js                        # 前端 JavaScript
│   └── styles.css                    # 样式表
│
├── config/                           # 配置文件
│   └── endpoints.json                # LCU API 端点参考
│
├── README.md                         # 项目说明文档
├── LOCALE_SWITCHING_GUIDE.md         # 语言切换详细指南
└── run_web.bat                       # Windows 启动脚本
```

## 系统要求

- Python 3.6+
- 依赖库：psutil, pyyaml（首次运行会自动安装）
- 浏览器：Chrome / Firefox / Edge
- LCU 功能需要 LOL 客户端运行中

## 使用说明

### LCU API 测试器
1. 启动 LOL 客户端并登录
2. 点击"连接"按钮
3. 从左侧列表选择接口或手动输入
4. 发送请求并查看响应

### Data Dragon 数据查询
1. 切换到"Data Dragon 数据查询"标签
2. 选择语言和版本
3. 浏览英雄、道具、召唤师技能、召唤师图标

### 语言切换
1. 在 LCU API 测试器页面点击"语言切换"按钮
2. 选择目标语言
3. 选择切换方法（推荐方法一）
4. 重启游戏客户端以应用更改

## API 参考

### 本地服务器端点

#### LCU API
- `POST /api/lcu/connect` - 连接 LOL 客户端
- `POST /api/lcu/request` - 发送 LCU API 请求
- `POST /api/lcu/params` - 获取常用参数

#### Data Dragon API
- `GET /api/ddragon/languages` - 获取语言列表
- `GET /api/ddragon/versions` - 获取版本列表
- `GET /api/ddragon/champions` - 获取英雄列表
- `GET /api/ddragon/champion/{id}` - 获取英雄详情
- `GET /api/ddragon/items` - 获取道具列表
- `GET /api/ddragon/summoner-spells` - 获取召唤师技能
- `GET /api/ddragon/profile-icons` - 获取召唤师图标

#### 语言切换 API
- `POST /api/locale/get` - 获取当前语言
- `POST /api/locale/list` - 获取支持的语言列表
- `POST /api/locale/set` - 设置语言

## 参考资料

- **LCU API 文档**: https://www.mingweisamuel.com/lcu-schema/tool/
- **Data Dragon 文档**: https://developer.riotgames.com/docs/lol#data-dragon
- **相关项目**: https://github.com/XHXIAIEIN/LeagueCustomLobby

## 注意事项

- LCU API 为非官方接口，可能随客户端更新而变更
- 本工具仅用于学习和研究目的
- 所有游戏数据版权归 Riot Games 所有

## 许可

本项目仅用于学习和研究目的。所有游戏数据和商标版权归 Riot Games 所有。
