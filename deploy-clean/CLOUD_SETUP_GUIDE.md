# 人生脚本 App - 云端同步配置指南

## 📋 前置准备

在开始之前，你需要：
- ✅ 一个 Supabase 账号（免费）
- ✅ 一个 Vercel 账号（免费）
- ✅ 大约 15 分钟时间

---

## 🚀 第一步：创建 Supabase 项目（5分钟）

### 1. 注册 Supabase

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 或邮箱注册（免费）

### 2. 创建新项目

1. 登录后点击 "New Project"
2. 填写项目信息：
   - **Name**: `life-script-app`
   - **Database Password**: 设置一个强密码（请保存好）
   - **Region**: 选择 `Southeast Asia (Singapore)` 或离你最近的区域
3. 点击 "Create new project"
4. 等待项目创建完成（约 2 分钟）

### 3. 执行数据库架构

1. 在项目左侧菜单，点击 **SQL Editor**
2. 点击 "New query"
3. 复制 `supabase/schema.sql` 文件的全部内容
4. 粘贴到 SQL Editor 中
5. 点击 **Run** 或按 `Cmd+Enter`
6. 看到成功提示后关闭

### 4. 获取 API 密钥

1. 在项目左侧菜单，点击 **Project Settings** → **API**
2. 复制以下信息（后面会用到）：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public key**: 一段很长的字符串

---

## ⚙️ 第二步：配置应用（3分钟）

### 1. 修改 Supabase 配置

打开 `index.html`，找到第 902-906 行：

```html
<script>
  // Supabase 配置（部署时请修改为你的实际配置）
  const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here'
  };
</script>
```

替换为你的实际配置：

```html
<script>
  const SUPABASE_CONFIG = {
    url: 'https://你的项目ID.supabase.co',
    anonKey: '你的anon_public_key'
  };
</script>
```

### 2. 配置手机号登录（可选）

Supabase 默认支持邮箱登录。如果需要手机号登录：

1. 在 Supabase 项目中，进入 **Authentication** → **Providers**
2. 找到 "Phone" 提供商
3. 开启 "Enable Phone provider"
4. 配置 SMS 提供商（推荐使用 Twilio 或阿里云）
5. **免费替代方案**：使用邮箱登录更简单

### 3. 修改为邮箱登录（推荐）

如果不想配置手机号，可以修改登录界面为邮箱模式。

---

## 🌐 第三步：部署到 Vercel（2分钟）

### 方式一：命令行部署

```bash
cd deploy-clean
vercel login
vercel --prod
```

### 方式二：网页部署

1. 访问 https://vercel.com/new
2. 导入这个 `deploy-clean` 文件夹
3. 或者拖拽文件夹到页面
4. 点击 "Deploy"

---

## ✅ 第四步：测试部署（2分钟）

### 1. 访问你的应用

部署完成后，Vercel 会给你一个 URL，类似：
`https://life-script-app-xxxxx.vercel.app`

### 2. 测试登录流程

1. 打开应用，会看到登录界面
2. 输入手机号和密码
3. 首次使用会自动注册
4. 登录成功后可以看到数据同步状态

### 3. 测试数据同步

1. 在一台设备上添加一些计划
2. 等待几秒（自动同步）
3. 在另一台设备/浏览器上登录
4. 应该能看到刚才添加的数据

---

## 🔧 常见问题

### Q1: 登录提示 "Invalid login credentials"

**原因**: 账号不存在或密码错误

**解决**:
- 首次使用会自动注册，确保手机号格式正确
- 如果忘记密码，需要在 Supabase 后台重置

### Q2: 数据不同步

**原因**: Supabase 配置错误或网络问题

**解决**:
1. 打开浏览器控制台 (F12)
2. 查看是否有错误信息
3. 检查 SUPABASE_CONFIG 配置是否正确
4. 确认网络连接正常

### Q3: 手机号登录不工作

**原因**: 未配置 SMS 提供商

**解决**:
- 使用邮箱登录代替（更简单）
- 或配置 Twilio 等短信服务

### Q4: Supabase 免费额度够用吗？

**免费额度**:
- 500MB 数据库存储
- 1GB 出站流量/月
- 50,000 月活跃用户
- 3 条短信/月

**评估**:
- 个人使用完全够用
- 100 人以内的小团队也够用

### Q5: 数据安全吗？

**安全措施**:
- ✅ 数据使用 HTTPS 加密传输
- ✅ 数据库使用 Row Level Security
- ✅ 每个用户只能访问自己的数据
- ✅ 密码使用 bcrypt 加密存储

---

## 📱 部署后的使用

### 多设备使用流程

1. **首次使用**:
   - 打开网页，看到登录界面
   - 输入手机号/邮箱和密码
   - 自动注册并登录

2. **在其他设备使用**:
   - 打开同样的网址
   - 用相同的账号密码登录
   - 数据自动同步

3. **数据备份**:
   - 所有数据自动保存在 Supabase
   - 可以在 Supabase 后台导出备份

### 退出登录

如果想换账号或使用本地模式：
1. 在 Supabase Dashboard → Authentication → Users
2. 可以查看所有用户

---

## 🎯 下一步优化

### 功能增强建议

1. **添加邮箱验证**:
   - 用户注册后发送验证邮件
   - 提高安全性

2. **添加密码重置**:
   - 忘记密码时通过邮箱重置

3. **添加数据导出**:
   - 允许用户导出 JSON 备份

4. **添加数据统计**:
   - 显示总使用时长
   - 知行合一率趋势图

5. **多人协作**:
   - 共享计划给家人
   - 团队协作功能

---

## 📞 技术支持

遇到问题？

1. **查看控制台错误** (F12)
2. **检查 Supabase 日志** (Dashboard → Logs)
3. **检查 Vercel 部署日志** (Deployments → 点击最新部署)

---

## 🎉 完成！

现在你的应用已经支持：
- ✅ 手机/邮箱登录
- ✅ 多设备数据同步
- ✅ 云端数据备份
- ✅ 用户数据隔离

享受使用吧！🎬
