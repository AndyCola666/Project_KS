const fs = require('fs');

const testPath = 'D:/pruebakaraoke\\carpeta_imagenes\\Bruno Mars\\brunomars1.jpg';

try {
  const data = fs.readFileSync(testPath);
  console.log(`OK: Pude leer ${testPath}, tamaño: ${data.length}`);
} catch (e) {
  console.error('ERROR accediendo a imagen:', e.message);
}
