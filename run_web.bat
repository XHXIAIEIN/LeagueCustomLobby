@echo off
chcp 65001 > nul
echo ╔══════════════════════════════════════════════════╗
echo ║      英雄联盟客户端工具集                         ║
echo ║      LOL Client Toolbox                          ║
echo ║                                                  ║
echo ║      • LCU API 测试器                            ║
echo ║      • Data Dragon 数据查询                      ║
echo ╚══════════════════════════════════════════════════╝
echo.
title LCU API Web Tester
python "%~dp0src\lcu_web_integrated.py"
pause