const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  });
  win.loadFile('index.html');
}

const dataFilename = 'life-script.json';
function getDataPath() {
  return path.join(app.getPath('userData'), dataFilename);
}

ipcMain.handle('load-data', async () => {
  try {
    const p = getDataPath();
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      return JSON.parse(raw);
    }
    return null;
  } catch (err) {
    console.error('load-data error', err);
    return null;
  }
});

ipcMain.handle('save-data', async (event, data) => {
  try {
    const p = getDataPath();
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    return { ok: true };
  } catch (err) {
    console.error('save-data error', err);
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('save-file', async (event, dataUrl, filename) => {
  try {
    const buffer = Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
    const file = path.join(app.getPath('downloads'), filename);
    fs.writeFileSync(file, buffer);
    return { ok: true, path: file };
  } catch (err) {
    console.error('save-file error', err);
    return { ok: false, error: String(err) };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
