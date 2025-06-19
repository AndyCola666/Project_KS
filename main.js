const { app, BrowserWindow, ipcMain, dialog, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');
const Database = require('better-sqlite3');

// 📁 Asegurar que la carpeta src/data exista
const dbDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 🗃️ Conexión a SQLite
const db = new Database(path.join(dbDir, 'videos.sqlite'));

// 🧱 Crear tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS artistas (
    id INTEGER PRIMARY KEY,
    nombre TEXT UNIQUE,
    carpeta_imagenes TEXT
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY,
    ruta TEXT UNIQUE,
    titulo TEXT,
    artista_id INTEGER,
    album TEXT,
    genero TEXT,
    año TEXT,
    FOREIGN KEY (artista_id) REFERENCES artistas(id)
  );
`);

app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.webContents.toggleDevTools();
  });

  createWindow();
});

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
}

// 📁 Selección de carpeta y escaneo
ipcMain.handle('seleccionar-carpeta', async () => {
  const resultado = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (resultado.canceled || resultado.filePaths.length === 0) return [];

  const carpeta = resultado.filePaths[0];
  const archivos = fs.readdirSync(carpeta);
  const videos = archivos.filter(archivo => archivo.endsWith('.mp4'));

  for (const video of videos) {
    const ruta = path.join(carpeta, video);
    try {
      const metadata = await mm.parseFile(ruta);
      const common = metadata.common;

      const titulo = common.title || path.parse(video).name;
      const artista = common.artist || 'Desconocido';
      const album = common.album || '';
      const genero = (common.genre && common.genre[0]) || '';
      const año = common.year?.toString() || '';

      // Insertar artista
      const insertArtista = db.prepare(`INSERT OR IGNORE INTO artistas (nombre) VALUES (?)`);
      insertArtista.run(artista);

      // Obtener ID del artista
      const getArtista = db.prepare(`SELECT id FROM artistas WHERE nombre = ?`);
      const { id: artista_id } = getArtista.get(artista);

      // Insertar video
      const insertVideo = db.prepare(`
        INSERT OR REPLACE INTO videos (ruta, titulo, artista_id, album, genero, año)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertVideo.run(ruta, titulo, artista_id, album, genero, año);
    } catch (err) {
      console.error('Error leyendo metadatos de:', ruta);
    }
  }

  // 🔍 Recuperar resultados para el renderer
  const getVideosConArtista = db.prepare(`
    SELECT v.*, a.nombre AS artista
    FROM videos v
    JOIN artistas a ON v.artista_id = a.id
  `);

  const resultados = getVideosConArtista.all();
  console.log('📦 Videos desde la base de datos:', resultados);
  return resultados;
});
