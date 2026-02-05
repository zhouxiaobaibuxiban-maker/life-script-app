const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { analyzeWithDeepSeek } = require('./deepseek');
const app = express();
const PORT = 3000;

// CORS支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.json());
app.use(express.static('public'));

// 提供 manifest 和 service worker
app.get('/manifest.json', (req, res) => {
  res.contentType('application/manifest+json');
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

app.get('/service-worker.js', (req, res) => {
  res.contentType('application/javascript');
  res.sendFile(path.join(__dirname, 'service-worker.js'));
});

// 简单的用户存储（实际应用可用数据库）
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// 获取用户数据
app.get('/api/data/:userId', (req, res) => {
  const file = path.join(dataDir, `${req.params.userId}.json`);
  try {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      res.json(data);
    } else {
      res.json(null);
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 保存用户数据
app.post('/api/data/:userId', (req, res) => {
  const file = path.join(dataDir, `${req.params.userId}.json`);
  try {
    fs.writeFileSync(file, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// AI 分析 API
app.post('/api/analyze/:userId', async (req, res) => {
  try {
    const analysis = await analyzeWithDeepSeek(req.body);
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Web 前端
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-index-v5.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-index-v5.html'));
});

app.get('/v5', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-index-v5.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 Life Script Server 运行于 http://localhost:${PORT}`);
  console.log(`📱 局域网访问: http://${getLocalIP()}:${PORT}`);
});

function getLocalIP() {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}
