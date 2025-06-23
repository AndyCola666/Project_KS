// compress-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const carpetaImagenes = path.join('D:\\pruebakaraoke\\carpeta_imagenes\\Bruno Mars');
const extensionesValidas = ['.jpg', '.jpeg', '.png'];

function obtenerRutasImagenes(carpeta) {
  let rutas = [];
  const items = fs.readdirSync(carpeta, { withFileTypes: true });

  for (const item of items) {
    const rutaCompleta = path.join(carpeta, item.name);

    if (item.isDirectory()) {
      rutas = rutas.concat(obtenerRutasImagenes(rutaCompleta));
    } else if (
      item.isFile() &&
      extensionesValidas.includes(path.extname(item.name).toLowerCase())
    ) {
      rutas.push(rutaCompleta);
    }
  }

  return rutas;
}

async function comprimirImagen(ruta) {
  try {
    const originalSize = fs.statSync(ruta).size;
    const ext = path.extname(ruta).toLowerCase();

    // ✅ Normaliza ruta antes de pasársela a Sharp
    let pipeline = sharp(path.normalize(ruta));

    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 70 });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ quality: 70, compressionLevel: 9 });
    }

    const buffer = await pipeline.toBuffer();
    fs.writeFileSync(ruta, buffer);

    const newSize = fs.statSync(ruta).size;
    const savings = originalSize - newSize;
    const percent = ((savings / originalSize) * 100).toFixed(1);

    console.log(`✔ ${path.basename(ruta)}: -${(savings / 1024).toFixed(1)} KB (${percent}%)`);

    return { ruta, originalSize, newSize };
  } catch (err) {
    console.error(`✖ Error al comprimir ${ruta}:`, err.message);
    return null;
  }
}

async function comprimirTodas() {
  const imagenes = obtenerRutasImagenes(carpetaImagenes);
  console.log(`🔍 Encontradas ${imagenes.length} imágenes.\n`);

  let totalOriginal = 0;
  let totalFinal = 0;

  for (const ruta of imagenes) {
    const resultado = await comprimirImagen(ruta);
    if (resultado) {
      totalOriginal += resultado.originalSize;
      totalFinal += resultado.newSize;
    }
  }

  const totalSavings = totalOriginal - totalFinal;
  const percentTotal = ((totalSavings / totalOriginal) * 100).toFixed(1);

  console.log('\n📊 RESUMEN FINAL');
  console.log(`- Tamaño original total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Tamaño final total: ${(totalFinal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Ahorro total: ${(totalSavings / 1024 / 1024).toFixed(2)} MB (${percentTotal}%)`);
}

comprimirTodas();
