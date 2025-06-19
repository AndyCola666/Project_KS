const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');
const { globalShortcut } = require('electron');

app.whenReady().then(() => {

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
  });
});

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('src/index.html');
}

ipcMain.handle('seleccionar-carpeta', async () => {
  const resultado = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (resultado.canceled || resultado.filePaths.length === 0) return [];

  const carpeta = resultado.filePaths[0];
  const archivos = fs.readdirSync(carpeta);

  const videos = archivos.filter(archivo => archivo.endsWith('.mp4'));
  const datos = [];

  for (const video of videos) {
    const ruta = path.join(carpeta, video);
    try {
      const metadata = await mm.parseFile(ruta);
      const common = metadata.common;

      datos.push({
        ruta,
        titulo: common.title || path.parse(video).name,
        artista: common.artist || '',
        album: common.album || '',
        genero: (common.genre && common.genre[0]) || '',
        año: common.year?.toString() || ''
      });
    } catch (err) {
      // Si hay error al leer metadatos, usar fallback
      datos.push({
        ruta,
        titulo: path.parse(video).name,
        artista: '',
        album: '',
        genero: ''
      });
    }
  }

  return datos;
});

app.whenReady().then(createWindow);
