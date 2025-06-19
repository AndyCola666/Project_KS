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

// 🔁 Escaneo recursivo
function obtenerArchivosRecursivos(carpeta, extensiones = ['.mp4', '.mkv', '.avi', '.mov']) {
  let archivos = [];
  const items = fs.readdirSync(carpeta, { withFileTypes: true });
  for (const item of items) {
    const rutaCompleta = path.join(carpeta, item.name);
    if (item.isDirectory()) {
      archivos = archivos.concat(obtenerArchivosRecursivos(rutaCompleta, extensiones));
    } else if (item.isFile() && extensiones.includes(path.extname(item.name).toLowerCase())) {
      archivos.push(rutaCompleta);
    }
  }
  return archivos;
}

// 🧠 Escanear y actualizar base de datos
async function escanearCarpeta(carpeta) {
  const videos = obtenerArchivosRecursivos(carpeta);

  for (const ruta of videos) {
    try {
      const metadata = await mm.parseFile(ruta);
      const common = metadata.common;

      // Maneja artista
      let artistaId = null;
      if (common.artist) {
        let artista = db.prepare('SELECT id FROM artistas WHERE nombre = ?').get(common.artist);
        if (!artista) {
          const info = db.prepare('INSERT INTO artistas (nombre) VALUES (?)').run(common.artist);
          artistaId = info.lastInsertRowid;
        } else {
          artistaId = artista.id;
        }
      }

      // Inserta o actualiza video
      db.prepare(`
        INSERT INTO videos (ruta, titulo, artista_id, album, genero, año)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(ruta) DO UPDATE SET
          titulo=excluded.titulo,
          artista_id=excluded.artista_id,
          album=excluded.album,
          genero=excluded.genero,
          año=excluded.año
      `).run(
        ruta,
        common.title || path.basename(ruta),
        artistaId,
        common.album || '',
        common.genre ? common.genre[0] : '',
        common.year ? String(common.year) : ''
      );
    } catch (err) {
      // Si no hay metadatos, al menos inserta el archivo
      db.prepare(`
        INSERT INTO videos (ruta, titulo)
        VALUES (?, ?)
        ON CONFLICT(ruta) DO NOTHING
      `).run(ruta, path.basename(ruta));
    }
  }

  // Devuelve todos los videos con artista
  const getVideosConArtista = db.prepare(`
    SELECT v.*, a.nombre AS artista
    FROM videos v
    LEFT JOIN artistas a ON v.artista_id = a.id
  `);
  return getVideosConArtista.all();
}

// 🪟 Crear ventana principal
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

// 🧠 Ctrl+Shift+I para DevTools
app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.webContents.toggleDevTools();
  });

  createWindow();
});

// 🧭 Canal para seleccionar carpeta
ipcMain.handle('seleccionar-carpeta', async () => {
  const resultado = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (resultado.canceled || resultado.filePaths.length === 0) return { ruta: null, videos: [] };
  const rutaCarpeta = resultado.filePaths[0];
  const videos = await escanearCarpeta(rutaCarpeta);
  return { ruta: rutaCarpeta, videos };
});

// 🔁 Canal para actualizar (desde botón en renderer)
ipcMain.handle('actualizar-base', async (_, rutaCarpeta) => {
  if (!rutaCarpeta || !fs.existsSync(rutaCarpeta)) return [];
  return await escanearCarpeta(rutaCarpeta);
});

function limpiarVideosNoExistentes() {
  const videos = db.prepare('SELECT ruta FROM videos').all();
  for (const video of videos) {
    if (!fs.existsSync(video.ruta)) {
      db.prepare('DELETE FROM videos WHERE ruta = ?').run(video.ruta);
    }
  }
}
