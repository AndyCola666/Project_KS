const { app, BrowserWindow, ipcMain, dialog, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');
const Database = require('better-sqlite3');

const dbDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'videos.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS artistas (
    id INTEGER PRIMARY KEY,
    nombre TEXT UNIQUE
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

function buscarImagenAleatoriaDesdeCarpeta(carpetaImagenes, nombreArtista) {
  const carpetaArtista = path.join(carpetaImagenes, nombreArtista);
  if (!fs.existsSync(carpetaArtista)) return null;

  const imagenes = fs.readdirSync(carpetaArtista).filter(img => {
    return ['.jpg', '.jpeg', '.png'].includes(path.extname(img).toLowerCase());
  });

  if (imagenes.length === 0) return null;

  const imagen = imagenes[Math.floor(Math.random() * imagenes.length)];
  return path.join(carpetaArtista, imagen);
}

async function escanearCarpeta(carpetaRaiz) {
  const carpetaVideos = path.join(carpetaRaiz, 'Artistas');
  const carpetaImagenes = path.join(carpetaRaiz, 'carpeta_imagenes');
  const videos = obtenerArchivosRecursivos(carpetaVideos);

  for (const ruta of videos) {
    try {
      const metadata = await mm.parseFile(ruta);
      const common = metadata.common;
      const nombreArtista = common.artist || 'Desconocido';

      let artista = db.prepare('SELECT id FROM artistas WHERE nombre = ?').get(nombreArtista);
      let artistaId = artista ? artista.id : db.prepare('INSERT INTO artistas (nombre) VALUES (?)').run(nombreArtista).lastInsertRowid;

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

    } catch {
      db.prepare(`
        INSERT INTO videos (ruta, titulo)
        VALUES (?, ?)
        ON CONFLICT(ruta) DO NOTHING
      `).run(ruta, path.basename(ruta));
    }
  }

  const resultados = db.prepare(`
    SELECT v.*, a.nombre AS artista
    FROM videos v
    LEFT JOIN artistas a ON v.artista_id = a.id
  `).all();

  return resultados.map(video => {
    video.imagen = buscarImagenAleatoriaDesdeCarpeta(carpetaImagenes, video.artista) || null;
    return video;
  });
}

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

app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) focusedWindow.webContents.toggleDevTools();
  });
  createWindow();
});

ipcMain.handle('seleccionar-carpeta', async () => {
  const resultado = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (resultado.canceled || resultado.filePaths.length === 0) return { ruta: null, videos: [] };
  const rutaCarpeta = resultado.filePaths[0];
  const videos = await escanearCarpeta(rutaCarpeta);
  return { ruta: rutaCarpeta, videos };
});

ipcMain.handle('actualizar-base', async (_, rutaCarpeta) => {
  if (!rutaCarpeta || !fs.existsSync(rutaCarpeta)) return [];
  return await escanearCarpeta(rutaCarpeta);
});
