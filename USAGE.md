# 人生脚本 - 完整版（Electron + Web PWA + 同步）

## 现在你有两种使用方式：

### 方式 1️⃣：Electron 应用（本地运行）
```bash
cd "/Users/bangbangdazhouxiaobai/Documents/人生脚本-时间管理app"
npm start
```
- 💾 数据自动保存到本地
- 📸 点击"导出图片"按钮可将日程表导出为 PNG 图片
- ⚡ 最快、离线可用

---

### 方式 2️⃣：Web 版本 + 后端服务（支持跨设备同步 + PWA）

**步骤 1：启动后端服务**（新终端窗口）
```bash
cd "/Users/bangbangdazhouxiaobai/Documents/人生脚本-时间管理app"
npm run server
```
看到 `🎬 Life Script Server 运行于 http://localhost:3000` 说明成功

**步骤 2：在浏览器打开 Web 版本**

电脑：`http://localhost:3000`  
手机：`http://你的电脑IP:3000`（自动显示在终端输出中）

**步骤 3：使用&同步**
- 在表单顶部输入一个用户 ID（比如你的名字）
- 点击"☁️ 同步"按钮保存到服务器
- 在其他设备访问相同地址，输入同一个用户 ID
- 点击"☁️ 同步"读取之前的数据

---

## 📱 手机上安装 PWA 应用

PWA = Progressive Web App，可以像真正的应用一样安装到主屏幕

### iOS（苹果手机）
1. 用 **Safari** 打开 `http://电脑IP:3000`
2. 点击下方分享按钮 ⬆️
3. 滑动找到"**添加到主屏幕**"
4. 点击"**添加**" → 完成！

### Android（安卓手机）
1. 用 **Chrome** 打开 `http://电脑IP:3000`
2. 点击右上角 **三点菜单**
3. 点击"**安装应用**"或"**添加到主屏幕**"
4. 确认 → 完成！

安装后就像真正的应用一样使用，支持离线缓存 📡

---

## 📸 导出图片功能

### Electron 版本
点击顶部"📸 导出图片"按钮 → 自动保存到下载文件夹

### Web 版本
点击顶部"📸 导出图片"按钮 → 浏览器下载 PNG

---

## 🔄 跨设备同步流程

1. **电脑上**：启动后端 `npm run server`
2. **编辑日程** → 点击"☁️ 同步"保存
3. **手机上**：在浏览器输入 `http://电脑IP:3000`
4. 输入同一个用户 ID → 点击"☁️ 同步"读取数据
5. 任何设备上修改后都点"☁️ 同步"自动更新所有设备

---

---

## 💡 快速建议

- **每天快速使用**：用 Electron 版本（最快、不需要网络）
- **多设备同步**：启动后端 + Web PWA 版本（在手机安装）
- **分享日程**：导出图片后发给朋友

---

## 📂 数据存储位置

- Electron：`~/Library/Application Support/Electron/life-script.json`
- Web 后端：`./data/{userId}.json`（和 server.js 同目录）

两个版本数据互不影响，各自独立保存。

---

## 🚀 一键启动所有功能

想同时用 Electron + Web，可以创建两个终端：

**终端 1**：
```bash
cd "/Users/bangbangdazhouxiaobai/Documents/人生脚本-时间管理app"
npm run server
```

**终端 2**：
```bash
cd "/Users/bangbangdazhouxiaobai/Documents/人生脚本-时间管理app"
npm start
```

这样两个版本都在运行，互不影响 ✨
