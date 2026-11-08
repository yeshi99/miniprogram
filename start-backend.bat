@echo off
chcp 65001 >nul
title 武汉租售 - 后端服务
cd /d "%~dp0backend"

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 Node.js，请先安装 https://nodejs.org/ 的 LTS 版本后重试。
  pause
  exit /b 1
)

if not exist ".env" copy ".env.example" ".env" >nul
if not exist "node_modules" (
  echo [1/2] 首次运行，正在安装依赖（约 1-3 分钟）...
  call npm install
  if errorlevel 1 (
    echo [错误] 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
  )
)

echo [2/2] 启动后端服务： http://localhost:3000
echo 保持本窗口开启，然后在微信开发者工具中导入本项目根目录。
echo.
call npm run dev
pause
