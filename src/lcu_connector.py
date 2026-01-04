"""
LCU API Connector
League of Legends 客户端 API 连接器

提供自动连接和请求功能
"""

import subprocess
import base64
import json
import ssl
import urllib.request
import urllib.error
import re
from typing import Optional, Tuple, Dict, Any


class LCUConnector:
    """
    LCU 连接器 - 自动获取客户端凭证并发送 API 请求

    主要功能：
    - 自动检测并连接到 League Client
    - 发送 HTTP 请求（JSON 和二进制）
    - 处理认证和 SSL
    """

    def __init__(self):
        """初始化连接器"""
        self.port: Optional[int] = None
        self.token: Optional[str] = None
        self.base_url: Optional[str] = None
        self.auth_header: Optional[str] = None

        # 配置 SSL 上下文（忽略自签名证书）
        self._ssl_context = ssl.create_default_context()
        self._ssl_context.check_hostname = False
        self._ssl_context.verify_mode = ssl.CERT_NONE

    def connect(self) -> Tuple[bool, str]:
        """
        连接到 LCU 客户端

        Returns:
            (成功与否, 消息)
        """
        try:
            # 使用 WMIC 获取客户端进程的命令行参数
            result = subprocess.run(
                ['wmic', 'PROCESS', 'WHERE', "name='LeagueClientUx.exe'", 'GET', 'commandline'],
                capture_output=True,
                text=True,
                creationflags=subprocess.CREATE_NO_WINDOW,
                timeout=5
            )

            output = result.stdout

            if 'LeagueClientUx.exe' not in output:
                return False, "未找到 League 客户端进程，请确保游戏客户端已启动"

            # 提取端口和令牌
            port_match = re.search(r'--app-port=(\d+)', output)
            token_match = re.search(r'--remoting-auth-token=([\w-]+)', output)

            if not port_match or not token_match:
                return False, "无法提取连接信息，请检查客户端状态"

            self.port = int(port_match.group(1))
            self.token = token_match.group(1)
            self.base_url = f"https://127.0.0.1:{self.port}"

            # 构建 Basic Auth 头
            auth_string = f"riot:{self.token}"
            auth_bytes = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')
            self.auth_header = f"Basic {auth_bytes}"

            return True, f"连接成功! 端口: {self.port}"

        except subprocess.TimeoutExpired:
            return False, "连接超时，请检查系统性能或重试"
        except Exception as e:
            return False, f"连接失败: {str(e)}"

    def request(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Tuple[int, Dict[str, Any], str]:
        """
        发送 API 请求（JSON）

        Args:
            method: HTTP 方法 (GET, POST, PUT, PATCH, DELETE)
            endpoint: API 端点 (如 /lol-summoner/v1/current-summoner)
            data: 请求体数据 (仅 POST/PUT/PATCH)

        Returns:
            (状态码, 响应数据字典, 原始响应文本)
        """
        if not self.base_url or not self.auth_header:
            return 0, {"error": "未连接到 LCU"}, "未连接到 LCU，请先调用 connect()"

        # 确保 endpoint 以 / 开头
        if not endpoint.startswith('/'):
            endpoint = '/' + endpoint

        url = self.base_url + endpoint

        try:
            # 准备请求体
            body = json.dumps(data).encode('utf-8') if data else None

            # 创建请求
            req = urllib.request.Request(url, data=body, method=method)
            req.add_header('Authorization', self.auth_header)
            req.add_header('Content-Type', 'application/json')
            req.add_header('Accept', 'application/json')

            # 发送请求
            with urllib.request.urlopen(req, context=self._ssl_context, timeout=10) as response:
                status = response.status
                raw_response = response.read().decode('utf-8')

                # 解析 JSON 响应
                try:
                    json_response = json.loads(raw_response) if raw_response else {}
                except json.JSONDecodeError:
                    json_response = {"raw": raw_response}

                return status, json_response, raw_response

        except urllib.error.HTTPError as e:
            # HTTP 错误（4xx, 5xx）
            raw_response = e.read().decode('utf-8') if e.fp else ""
            try:
                json_response = json.loads(raw_response) if raw_response else {"error": f"HTTP {e.code}"}
            except json.JSONDecodeError:
                json_response = {"error": f"HTTP {e.code}", "raw": raw_response}
            return e.code, json_response, raw_response

        except urllib.error.URLError as e:
            return 0, {"error": str(e.reason)}, str(e.reason)

        except Exception as e:
            return 0, {"error": str(e)}, str(e)

    def request_binary(self, method: str, endpoint: str) -> Tuple[int, bytes, Dict[str, str]]:
        """
        发送 API 请求并返回二进制数据（用于图片等资源）

        Args:
            method: HTTP 方法
            endpoint: API 端点

        Returns:
            (状态码, 二进制数据, 响应头字典)
        """
        if not self.base_url or not self.auth_header:
            return 0, b'', {}

        # 确保 endpoint 以 / 开头
        if not endpoint.startswith('/'):
            endpoint = '/' + endpoint

        url = self.base_url + endpoint

        try:
            req = urllib.request.Request(url, method=method)
            req.add_header('Authorization', self.auth_header)

            with urllib.request.urlopen(req, context=self._ssl_context, timeout=10) as response:
                status = response.status
                data = response.read()
                headers = dict(response.headers)
                return status, data, headers

        except urllib.error.HTTPError as e:
            return e.code, b'', {}

        except Exception:
            return 0, b'', {}

    # ========== 便捷方法 ==========
    def get(self, endpoint: str) -> Tuple[int, Dict[str, Any], str]:
        """发送 GET 请求"""
        return self.request('GET', endpoint)

    def post(self, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Tuple[int, Dict[str, Any], str]:
        """发送 POST 请求"""
        return self.request('POST', endpoint, data)

    def put(self, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Tuple[int, Dict[str, Any], str]:
        """发送 PUT 请求"""
        return self.request('PUT', endpoint, data)

    def patch(self, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Tuple[int, Dict[str, Any], str]:
        """发送 PATCH 请求"""
        return self.request('PATCH', endpoint, data)

    def delete(self, endpoint: str) -> Tuple[int, Dict[str, Any], str]:
        """发送 DELETE 请求"""
        return self.request('DELETE', endpoint)

    @property
    def is_connected(self) -> bool:
        """检查是否已连接"""
        return self.base_url is not None and self.auth_header is not None


# ========== 加载端点配置 ==========
def load_endpoint_groups():
    """
    从配置文件加载端点组

    Returns:
        端点组列表
    """
    import os
    config_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'config',
        'endpoints.json'
    )

    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: Endpoint configuration file not found: {config_file}")
        return []
    except json.JSONDecodeError as e:
        print(f"Warning: Failed to parse endpoint configuration: {e}")
        return []


# 导出端点组配置（向后兼容）
ENDPOINT_GROUPS = load_endpoint_groups()
