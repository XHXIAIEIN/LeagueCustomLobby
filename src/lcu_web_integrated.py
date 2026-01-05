"""
英雄联盟客户端工具集
包含 LCU API 测试器 + Data Dragon 数据查询

主要功能：
- LCU API 连接和请求代理
- Data Dragon 数据查询接口
- 静态资源服务
- LCU 客户端资源代理

快捷键：
- R: 重启服务
- C: 清除缓存
- O: 打开浏览器
- Q: 退出程序
"""

import http.server
import socketserver
import json
import urllib.parse
import urllib.request
import webbrowser
import threading
import socket
import psutil
import sys
import os
import time
import mimetypes
import signal
import io
from functools import lru_cache
from typing import Optional, Dict, Any

# 设置标准输出为 UTF-8 编码（解决 Windows GBK 编码问题）
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Windows 下的键盘输入支持
if sys.platform == 'win32':
    import msvcrt
else:
    import select
    import termios
    import tty

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.lcu_connector import LCUConnector, ENDPOINT_GROUPS
from src.lcu_params_service import LCUParamsService
from src.lcu_locale_manager import LocaleManager

# ==================== 配置常量 ====================
PORT = 8765
DDRAGON_BASE = "https://ddragon.leagueoflegends.com"
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'templates')

# ==================== 全局状态 ====================
server_running = True
server_instance = None
need_restart = False

# ==================== 全局实例 ====================
connector = LCUConnector()
params_service = LCUParamsService(connector)
locale_manager = LocaleManager()


# ==================== Data Dragon API ====================
class DataDragonAPI:
    """Data Dragon API 封装，提供英雄联盟游戏数据查询"""

    @staticmethod
    @lru_cache(maxsize=64)
    def fetch_json(url: str) -> Optional[Dict[str, Any]]:
        """
        获取 JSON 数据（带缓存）

        Args:
            url: 请求的 URL

        Returns:
            JSON 数据字典，失败返回 None
        """
        try:
            with urllib.request.urlopen(url, timeout=10) as response:
                return json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            print(f"HTTP Error {e.code} fetching {url}")
            return None
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None

    def get_languages(self) -> Optional[list]:
        """获取支持的语言列表"""
        return self.fetch_json(f"{DDRAGON_BASE}/cdn/languages.json")

    def get_versions(self) -> Optional[list]:
        """获取游戏版本列表"""
        return self.fetch_json(f"{DDRAGON_BASE}/api/versions.json")

    def get_champions(self, version: str, language: str) -> Optional[Dict]:
        """获取英雄列表"""
        return self.fetch_json(f"{DDRAGON_BASE}/cdn/{version}/data/{language}/champion.json")

    def get_champion_detail(self, version: str, language: str, champion_id: str) -> Optional[Dict]:
        """获取英雄详细信息"""
        return self.fetch_json(f"{DDRAGON_BASE}/cdn/{version}/data/{language}/champion/{champion_id}.json")

    def get_items(self, version: str, language: str) -> Optional[Dict]:
        """获取物品列表"""
        return self.fetch_json(f"{DDRAGON_BASE}/cdn/{version}/data/{language}/item.json")

    def get_summoner_spells(self, version: str, language: str) -> Optional[Dict]:
        """获取召唤师技能列表"""
        return self.fetch_json(f"{DDRAGON_BASE}/cdn/{version}/data/{language}/summoner.json")

    def get_profile_icons(self, version: str, language: str) -> Optional[Dict]:
        """获取召唤师图标列表"""
        return self.fetch_json(f"{DDRAGON_BASE}/cdn/{version}/data/{language}/profileicon.json")


ddragon_api = DataDragonAPI()


# ==================== 模板加载 ====================
@lru_cache(maxsize=1)
def load_html_template() -> str:
    """
    加载 HTML 模板文件（带缓存）

    Returns:
        HTML 模板内容
    """
    html_file = os.path.join(TEMPLATE_DIR, 'index.html')
    with open(html_file, 'r', encoding='utf-8') as f:
        return f.read()


# ==================== 端口管理 ====================
def is_port_in_use(port: int) -> bool:
    """
    检查端口是否被占用

    Args:
        port: 端口号

    Returns:
        True 表示被占用，False 表示可用
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('', port))
            return False
        except OSError:
            return True


def kill_process_on_port(port: int) -> bool:
    """
    关闭占用指定端口的进程

    Args:
        port: 端口号

    Returns:
        True 表示成功关闭进程，False 表示未找到或失败
    """
    killed = False
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            connections = proc.net_connections()
            for conn in connections:
                if conn.laddr.port == port:
                    print(f"发现进程 {proc.pid} ({proc.name()}) 占用端口 {port}")
                    print(f"正在关闭进程...")
                    proc.kill()
                    killed = True
                    print(f"✓ 已关闭进程 {proc.pid}")
                    break
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    return killed


def ensure_port_available(port: int) -> bool:
    """
    确保端口可用，如果被占用则询问用户是否关闭占用进程

    Args:
        port: 端口号

    Returns:
        True 表示端口可用，False 表示端口不可用
    """
    if not is_port_in_use(port):
        return True

    print(f"\n⚠️  端口 {port} 已被占用")
    response = input(f"是否关闭占用端口 {port} 的进程? (y/n): ").strip().lower()

    if response != 'y':
        return False

    if not kill_process_on_port(port):
        print(f"✗ 未找到占用端口 {port} 的进程")
        return False

    time.sleep(1)  # 等待端口释放

    if not is_port_in_use(port):
        print(f"✓ 端口 {port} 已释放\n")
        return True
    else:
        print(f"✗ 端口 {port} 仍被占用\n")
        return False


# ==================== HTTP 请求处理器 ====================
class IntegratedHandler(http.server.SimpleHTTPRequestHandler):
    """集成的 HTTP 请求处理器，处理所有 Web 请求"""

    def log_message(self, *_):
        """禁用默认的访问日志输出"""
        pass

    def do_GET(self):
        """处理 GET 请求"""
        # 路由映射
        routes = {
            '/': self._serve_index,
            '/index.html': self._serve_index,
            '/styles.css': lambda: self._serve_static('styles.css', 'text/css'),
            '/app.js': lambda: self._serve_static('app.js', 'application/javascript'),
        }

        # 精确路由匹配
        if self.path in routes:
            routes[self.path]()
        # 前缀路由匹配
        elif self.path.startswith('/api/ddragon/'):
            self._handle_ddragon_api()
        elif self.path.startswith('/lol-game-data/'):
            self._handle_lcu_assets()
        else:
            self.send_error(404, "Not Found")

    def _serve_index(self):
        """服务主页面"""
        try:
            html = load_html_template()
            # 注入预设数据
            groups_json = json.dumps(ENDPOINT_GROUPS, ensure_ascii=False)
            html = html.replace('__GROUPS_DATA_PLACEHOLDER__', groups_json)

            self._send_response(200, html, 'text/html; charset=utf-8')
        except Exception as e:
            print(f"Error serving index: {e}")
            self.send_error(500, "Internal Server Error")

    def _serve_static(self, filename: str, content_type: str):
        """
        提供静态文件服务

        Args:
            filename: 文件名
            content_type: MIME 类型
        """
        try:
            file_path = os.path.join(TEMPLATE_DIR, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            self.send_response(200)
            self.send_header('Content-type', f'{content_type}; charset=utf-8')
            self.send_header('Cache-Control', 'public, max-age=3600')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
        except FileNotFoundError:
            self.send_error(404, f"File not found: {filename}")
        except Exception as e:
            print(f"Error serving static file {filename}: {e}")
            self.send_error(500, "Internal Server Error")

    def _handle_ddragon_api(self):
        """处理 Data Dragon API 请求"""
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query_params = urllib.parse.parse_qs(parsed.query)

        # 路由映射
        api_routes = {
            '/api/ddragon/languages': lambda: ddragon_api.get_languages(),
            '/api/ddragon/versions': lambda: ddragon_api.get_versions(),
            '/api/ddragon/champions': lambda: ddragon_api.get_champions(
                query_params.get('version', [''])[0],
                query_params.get('language', ['zh_CN'])[0]
            ),
            '/api/ddragon/items': lambda: ddragon_api.get_items(
                query_params.get('version', [''])[0],
                query_params.get('language', ['zh_CN'])[0]
            ),
            '/api/ddragon/summoner-spells': lambda: ddragon_api.get_summoner_spells(
                query_params.get('version', [''])[0],
                query_params.get('language', ['zh_CN'])[0]
            ),
            '/api/ddragon/profile-icons': lambda: ddragon_api.get_profile_icons(
                query_params.get('version', [''])[0],
                query_params.get('language', ['zh_CN'])[0]
            ),
        }

        try:
            # 精确路由匹配
            if path in api_routes:
                data = api_routes[path]()
            # 英雄详情路由（动态参数）
            elif path.startswith('/api/ddragon/champion/'):
                champion_id = path.split('/')[-1]
                version = query_params.get('version', [''])[0]
                language = query_params.get('language', ['zh_CN'])[0]
                data = ddragon_api.get_champion_detail(version, language, champion_id)
            else:
                self.send_error(404, "API endpoint not found")
                return

            # 返回 JSON 响应
            response = {'success': data is not None, 'data': data}
            self._send_json_response(200, response)

        except Exception as e:
            print(f"Error in Data Dragon API: {e}")
            error_response = {'success': False, 'error': str(e)}
            self._send_json_response(500, error_response)

    def _handle_lcu_assets(self):
        """代理 LCU 客户端资源请求（图片等）"""
        try:
            status, data, _ = connector.request_binary('GET', self.path)

            if status == 200 and data:
                # 根据文件扩展名获取 MIME 类型
                content_type, _ = mimetypes.guess_type(self.path)
                if not content_type:
                    content_type = 'application/octet-stream'

                self.send_response(200)
                self.send_header('Content-type', content_type)
                self.send_header('Cache-Control', 'public, max-age=86400')  # 缓存1天
                self.end_headers()
                self.wfile.write(data)
            else:
                self.send_error(status or 404, "LCU asset not found")

        except Exception as e:
            print(f"Error proxying LCU asset {self.path}: {e}")
            self.send_error(500, "Error proxying LCU asset")

    def do_POST(self):
        """处理 POST 请求"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length else ''

        # 路由映射
        post_routes = {
            '/api/lcu/connect': self._lcu_connect,
            '/api/lcu/params': self._lcu_params,
            '/api/lcu/request': lambda: self._lcu_request(body),
            '/api/locale/get': self._locale_get,
            '/api/locale/list': self._locale_list,
            '/api/locale/set': lambda: self._locale_set(body),
        }

        if self.path in post_routes:
            response = post_routes[self.path]()
            self._send_json_response(200, response)
        else:
            self.send_error(404, "API endpoint not found")

    def _lcu_connect(self) -> Dict[str, Any]:
        """处理 LCU 连接请求"""
        success, msg = connector.connect()
        return {
            'success': success,
            'message': msg,
            'port': connector.port
        }

    def _lcu_params(self) -> Dict[str, Any]:
        """获取常用 LCU 参数（使用参数服务）"""
        try:
            params = params_service.get_all_params()
            return {'success': True, 'data': params}
        except Exception as e:
            print(f"Error getting LCU params: {e}")
            return {'success': False, 'error': str(e), 'data': {}}

    def _lcu_request(self, body: str) -> Dict[str, Any]:
        """处理 LCU API 请求代理"""
        try:
            req_data = json.loads(body) if body else {}
            method = req_data.get('method', 'GET')
            endpoint = req_data.get('endpoint', '')
            data_str = req_data.get('data', '{}')

            # 解析请求数据
            try:
                data = json.loads(data_str) if data_str and data_str.strip() != '{}' else None
            except json.JSONDecodeError:
                data = None

            status, resp_data, _ = connector.request(method, endpoint, data)
            return {'status': status, 'data': resp_data}

        except Exception as e:
            print(f"Error in LCU request: {e}")
            return {'status': 0, 'data': {'error': str(e)}}

    def _locale_get(self) -> Dict[str, Any]:
        """获取当前游戏语言"""
        success, msg = locale_manager.read_current_locale()
        return {
            'success': success,
            'current_locale': locale_manager.current_locale if success else None,
            'message': msg
        }

    def _locale_list(self) -> Dict[str, Any]:
        """获取支持的语言列表"""
        locales = locale_manager.get_available_locales()
        return {
            'success': True,
            'locales': locales
        }

    def _locale_set(self, body: str) -> Dict[str, Any]:
        """设置游戏语言"""
        try:
            req_data = json.loads(body) if body else {}
            locale_code = req_data.get('locale', '')
            method = req_data.get('method', 'copy')  # 'copy' 或 'config'

            if not locale_code:
                return {'success': False, 'message': '未指定语言代码'}

            # 使用配置文件方式设置语言（唯一方法）
            success, msg = locale_manager.set_locale(locale_code)

            return {
                'success': success,
                'message': msg,
                'locale': locale_code if success else None
            }

        except Exception as e:
            print(f"Error setting locale: {e}")
            return {'success': False, 'message': f'设置语言失败: {str(e)}'}

    def _send_response(self, status: int, content: str, content_type: str):
        """发送文本响应"""
        self.send_response(status)
        self.send_header('Content-type', content_type)
        self.end_headers()
        self.wfile.write(content.encode('utf-8'))

    def _send_json_response(self, status: int, data: Dict[str, Any]):
        """发送 JSON 响应"""
        self.send_response(status)
        self.send_header('Content-type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))


# ==================== 可重启的 TCP 服务器 ====================
class RestartableTCPServer(socketserver.TCPServer):
    """支持重启的 TCP 服务器"""
    allow_reuse_address = True

    def server_close(self):
        """关闭服务器并释放端口"""
        self.shutdown()
        super().server_close()


# ==================== 键盘输入处理 ====================
def get_key_press():
    """
    非阻塞地获取键盘输入

    Returns:
        按下的键字符，无输入返回 None
    """
    if sys.platform == 'win32':
        if msvcrt.kbhit():
            key = msvcrt.getch()
            # 处理特殊键
            if key in (b'\x00', b'\xe0'):
                msvcrt.getch()  # 跳过扩展键
                return None
            return key.decode('utf-8', errors='ignore').lower()
    else:
        # Unix/Linux/Mac
        if select.select([sys.stdin], [], [], 0)[0]:
            return sys.stdin.read(1).lower()
    return None


def clear_all_caches():
    """清除所有缓存"""
    # 清除 Data Dragon API 缓存
    DataDragonAPI.fetch_json.cache_clear()
    # 清除模板缓存
    load_html_template.cache_clear()
    print("✓ 缓存已清除")


def print_help():
    """打印帮助信息"""
    print("""
快捷键：
  R - 重启服务（重新加载模板和代码）
  C - 清除缓存（Data Dragon + 模板）
  O - 打开浏览器
  H - 显示此帮助信息
  Q - 退出程序
""")


def keyboard_listener():
    """键盘监听线程"""
    global server_running, need_restart

    while server_running:
        try:
            key = get_key_press()
            if key:
                if key == 'r':
                    print("\n⟳ 正在重启服务...")
                    need_restart = True
                    server_running = False
                elif key == 'c':
                    clear_all_caches()
                elif key == 'o':
                    print("✓ 正在打开浏览器...")
                    webbrowser.open(f'http://localhost:{PORT}')
                elif key == 'h':
                    print_help()
                elif key == 'q':
                    print("\n正在退出...")
                    server_running = False
            time.sleep(0.1)  # 避免 CPU 占用过高
        except Exception:
            pass


def run_server():
    """运行服务器"""
    global server_running, server_instance, need_restart

    server_running = True
    need_restart = False

    try:
        server_instance = RestartableTCPServer(("", PORT), IntegratedHandler)
        print(f"✓ 服务已启动: http://localhost:{PORT}")
        print("✓ 按 H 查看快捷键帮助\n")

        # 在独立线程中运行服务器
        server_thread = threading.Thread(target=server_instance.serve_forever)
        server_thread.daemon = True
        server_thread.start()

        # 主线程监听键盘输入
        while server_running:
            try:
                key = get_key_press()
                if key:
                    if key == 'r':
                        print("\n⟳ 正在重启服务...")
                        need_restart = True
                        break
                    elif key == 'c':
                        clear_all_caches()
                    elif key == 'o':
                        print("✓ 正在打开浏览器...")
                        webbrowser.open(f'http://localhost:{PORT}')
                    elif key == 'h':
                        print_help()
                    elif key == 'q':
                        print("\n正在退出...")
                        break
                time.sleep(0.1)
            except KeyboardInterrupt:
                print("\n正在退出...")
                break

        # 关闭服务器
        if server_instance:
            server_instance.shutdown()
            server_instance.server_close()

    except Exception as e:
        print(f"\n✗ 服务器错误: {e}")
        return False

    return need_restart


# ==================== 主程序 ====================
def main():
    """主程序入口"""
    global need_restart

    print(f"""
================================================
    英雄联盟客户端工具集
    LOL Client Toolbox

    - LCU API 测试器
    - Data Dragon 数据查询
================================================
""")

    # 检查并确保端口可用
    if not ensure_port_available(PORT):
        print(f"✗ 无法使用端口 {PORT}，程序退出")
        return

    # 延迟1秒后自动打开浏览器
    threading.Timer(1.0, lambda: webbrowser.open(f'http://localhost:{PORT}')).start()

    # 主循环 - 支持重启
    while True:
        # 重启时清除缓存
        if need_restart:
            clear_all_caches()
            time.sleep(0.5)  # 等待端口释放

        # 运行服务器
        should_restart = run_server()

        if not should_restart:
            break

        print("✓ 服务已重启\n")

    print("✓ 服务已停止")


if __name__ == "__main__":
    main()
