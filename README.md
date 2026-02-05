# 人生脚本 — 本地 Electron 应用

这是基于你提供的 HTML 设计制作的本地 Electron 应用原型，会把用户数据保存到系统 `userData` 目录下的 `life-script.json`。

快速运行（macOS）：

```bash
cd "人生脚本-时间管理app"
npm install
npm start
```

说明：
- 主进程文件： [main.js](main.js)
- 渲染器页面： [index.html](index.html)
- Preload（安全桥接）： [preload.js](preload.js)
- 持久化文件位置：Electron `app.getPath('userData')/life-script.json`

下步建议：如果你希望我帮你把界面做成原生打包（macOS .dmg 或 mas），我可以继续添加打包脚本。
