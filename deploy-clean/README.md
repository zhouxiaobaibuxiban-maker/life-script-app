# 人生脚本 App - 云端同步版

> 你的人生导演，现在支持多设备同步！

---

## ✨ 新特性

- ✅ **云同步**: 手机、电脑、平板数据自动同步
- ✅ **账号登录**: 手机号/邮箱登录，数据安全隔离
- ✅ **数据备份**: 云端永久保存，不怕丢失
- ✅ **AI 分析**: 使用智谱 GLM API 分析周/月数据

---

## 🚀 快速开始

### 选择部署方式

#### 方式 A：本地模式（无云同步）
- 适合：个人单设备使用
- 部署：直接打开 `index.html` 即可

#### 方式 B：云端同步版（推荐）
- 适合：多设备使用，需要数据同步
- 需要：配置 Supabase（免费）
- 查看：[详细配置指南](CLOUD_SETUP_GUIDE.md)

---

## ⚡ 5分钟部署（云端版）

### 步骤 1：创建 Supabase 项目

```bash
# 1. 访问并注册
open https://supabase.com

# 2. 创建项目后，在 SQL Editor 中执行
open supabase/schema.sql
```

### 步骤 2：获取 API 密钥

在 Supabase 项目设置中：
1. 复制 Project URL
2. 复制 anon public key

### 步骤 3：配置应用

编辑 `index.html` 第 902-906 行：

```html
<script>
  const SUPABASE_CONFIG = {
    url: 'https://你的项目ID.supabase.co',
    anonKey: '你的anon_key'
  };
</script>
```

### 步骤 4：部署

```bash
# 安装 Vercel CLI（如果还没装）
npm i -g vercel

# 登录并部署
vercel login
vercel --prod
```

完成！访问 Vercel 给你的 URL 即可。

---

## 📁 项目结构

```
deploy-clean/
├── index.html          # 主应用（已集成云同步）
├── cloud-sync.js       # 云同步模块
├── vercel.json         # Vercel 配置
├── supabase/
│   └── schema.sql      # 数据库架构
├── README.md           # 本文件
└── CLOUD_SETUP_GUIDE.md # 详细配置指南
```

---

## 🛠️ 配置说明

### Supabase 配置

| 配置项 | 说明 | 获取方式 |
|--------|------|---------|
| url | 项目 URL | Supabase Dashboard → Settings → API |
| anonKey | 匿名公钥 | 同上 |

### 智谱 API 配置

已内置默认配置，如需修改：

```javascript
// 在 index.html 中搜索
apiProvider: 'zhipu',
apiKey: 'your_key_here'
```

---

## 🔒 隐私与安全

- **数据加密**: 所有数据使用 HTTPS 传输
- **用户隔离**: 使用 Row Level Security，每个用户只能访问自己的数据
- **密码安全**: 使用 bcrypt 加密存储
- **本地优先**: 数据先保存到本地，再同步到云端

---

## 💡 使用技巧

### 多设备同步

1. 在任何设备打开应用网址
2. 使用相同的账号密码登录
3. 数据自动同步，无需手动操作

### 数据备份

所有数据自动保存在 Supabase 云端，可以：
- 在 Supabase 后台查看
- 导出 JSON 备份
- 随时恢复历史数据

---

## 🆘 常见问题

**Q: 部署后登录不工作？**
A: 检查浏览器控制台错误，确认 Supabase 配置正确

**Q: 数据不同步？**
A: 确保已登录，查看控制台是否有错误

**Q: 可以换回本地模式吗？**
A: 可以，点击登录界面的"暂不登录，使用本地模式"

**Q: Supabase 免费额度够用吗？**
A: 个人使用完全够（500MB 数据库 + 1GB 流量/月）

**Q: 控制台显示 406 Not Acceptable 错误？**
A: 这是 RLS (Row Level Security) 策略问题。按以下步骤修复：
1. 打开 Supabase Dashboard → SQL Editor
2. 点击 "New query"
3. 复制 `disable-rls.sql` 的全部内容（只有3行，很简单）
4. 粘贴并点击 Run
5. 刷新浏览器页面重试

---

## 📚 更多文档

- [详细配置指南](CLOUD_SETUP_GUIDE.md)
- [Supabase 文档](https://supabase.com/docs)
- [Vercel 文档](https://vercel.com/docs)

---

## 🎉 完成！

现在你的人生脚本可以在任何设备上使用了！

每一次打卡，都是你人生剧本的一次精彩演绎。
