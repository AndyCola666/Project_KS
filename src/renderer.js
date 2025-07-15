// ==============================
// 1. 🔁 VARIABLES GLOBALES Y REFERENCIAS
// ==============================
const btn = document.getElementById('boton-carpeta');
const grid = document.getElementById('grid-videos');
const player = document.getElementById('player');
const tituloVideo = document.getElementById('titulo-video');
const inputBusqueda = document.getElementById('busqueda');
const filtrosBarra = document.getElementById('filtros-barra');
const filtrosBloque = document.getElementById('filtros-bloque');
const filtrosGenero = document.getElementById('filtros-genero');
const filtrosArtista = document.getElementById('filtros-artista');
const filtrosDecada = document.getElementById('filtros-decada');
const iconRegresarSidebar = document.getElementById('icon-regresar-sidebar');
const btnToggleFiltros = document.getElementById('boton-toggle-filtros');
const btnActualizar = document.getElementById('boton-actualizar');
const seccionReproductor = document.getElementById('vista-reproductor');
const recomendadosGrid = document.getElementById('grid-recomendados');
const iconBuscar = document.getElementById('icon-buscar');
const iconFila = document.getElementById('icon-fila');
const vistaFila = document.getElementById('vista-fila');
const listaFila = document.getElementById('lista-fila');
const btnReproducirFila = document.getElementById('btn-reproducir-fila');
const btnCerrarFila = document.getElementById('btn-cerrar-fila');
const btnSiguienteFila = document.getElementById('btn-siguiente-fila');
const btnEliminarFila = document.getElementById('btn-eliminar-fila');
const miniPlayer = document.getElementById('mini-player');
const miniClose = document.getElementById('mini-close');
const miniNext = document.getElementById('mini-next');
const miniExpand = document.getElementById('mini-expand');
const videoPrincipal = document.getElementById('video-principal');
const iconAjustes = document.getElementById('icon-ajustes');
const popupAjustes = document.getElementById('popup-ajustes');
const btnCerrarAjustes = document.getElementById('btn-cerrar-ajustes');
const ajustesContenido = document.getElementById('ajustes-contenido');
const ajustesIconos = document.querySelectorAll('.ajuste-icono');
const iconAdmin = document.getElementById('icon-admin');
const popupAuthAdmin = document.getElementById('popup-auth-admin');
const formAuthAdmin = document.getElementById('form-auth-admin');
const btnCerrarAuthAdmin = document.getElementById('btn-cerrar-auth-admin');
const authAdminError = document.getElementById('auth-admin-error');
const popupAdmin = document.getElementById('popup-admin');
const btnCerrarAdmin = document.getElementById('btn-cerrar-admin');
const adminContenido = document.getElementById('admin-contenido');
const adminIconos = document.querySelectorAll('.admin-icono');
const overlayBloqueo = document.getElementById('overlay-bloqueo');
const selectVista = document.getElementById('select-grid-vista');

let videosOriginales = [];
let carpetaSeleccionada = null;
let videoActualRuta = null;
let filaReproduccion = [];
let indexActualFila = 0;
let modoMiniPlayer = false;
let adminActual = null; // Guarda el usuario admin logueado

// ==============================
// 2. 🧩 FILTROS Y BÚSQUEDA
// ==============================
iconBuscar.addEventListener('click', () => {
  if (grid.style.display !== 'grid') return;
  filtrosBarra.classList.toggle('visible');
});

btnToggleFiltros.addEventListener('click', () => {
  const visible = filtrosBloque.style.display === 'flex';
  filtrosBloque.style.display = visible ? 'none' : 'flex';
});

function construirFiltros(videos) {
  const generos = new Set();
  const artistas = new Set();
  const decadas = new Set();

  videos.forEach(video => {
    if (video.genero) generos.add(video.genero);
    if (video.artista) artistas.add(video.artista);
    if (video.decada) decadas.add(video.decada);
  });

  poblarSelect(filtrosGenero, generos);
  poblarSelect(filtrosArtista, artistas);
  poblarSelect(filtrosDecada, decadas);
}

function poblarSelect(select, valores) {
  select.innerHTML = '<option value="">Todos</option>';
  Array.from(valores).sort().forEach(valor => {
    const option = document.createElement('option');
    option.value = valor;
    option.textContent = valor;
    select.appendChild(option);
  });
}

function aplicarFiltros() {
  const texto = inputBusqueda.value.toLowerCase();
  const generoSel = filtrosGenero.value;
  const artistaSel = filtrosArtista.value;
  const decadasSel = filtrosDecada.value;

  const filtrados = videosOriginales.filter(video => {
    const coincideTexto = video.titulo.toLowerCase().includes(texto);
    const coincideGenero = !generoSel || video.genero === generoSel;
    const coincideArtista = !artistaSel || video.artista === artistaSel;
    const coincideDecada = !decadasSel || video.decada === decadasSel;
    return coincideTexto && coincideGenero && coincideArtista && coincideDecada;
  });

  mostrarVideos(filtrados);
}

inputBusqueda.addEventListener('input', aplicarFiltros);
filtrosGenero.addEventListener('change', aplicarFiltros);
filtrosArtista.addEventListener('change', aplicarFiltros);
filtrosDecada.addEventListener('change', aplicarFiltros);

// ==============================
// 3. 🖼️ MOSTRAR VIDEOS Y GRID
// ==============================
function mostrarVideos(videos) {
  grid.innerHTML = '';
  seccionReproductor.style.display = 'none';
  grid.style.display = 'grid';

  const vista = localStorage.getItem('vistaGrid') || 'normal';
  grid.className = 'grid';
  if (vista === 'mosaico') {
    grid.classList.add('mosaico');
  }

  const mostrarInfo = localStorage.getItem('mostrarInfoCanciones') !== 'false';

  videos.forEach(video => {
    const card = document.createElement('div');
    card.classList.add('card');

    const img = document.createElement('img');
    img.src = video.imagen ? `file://${video.imagen}` : 'https://via.placeholder.com/300x170/000000/ffffff?text=Video';
    img.alt = video.titulo;

    const titulo = document.createElement('h3');
    titulo.textContent = video.titulo.replace(/\.[^/.]+$/, "");

    card.appendChild(img);
    card.appendChild(titulo);

    if (mostrarInfo) {
      const artista = document.createElement('p');
      artista.textContent = `Artista: ${video.artista || 'Desconocido'}`;

      const album = document.createElement('p');
      album.textContent = `Álbum: ${video.album || 'Desconocido'}`;

      const genero = document.createElement('p');
      genero.textContent = `Género: ${video.genero || 'Desconocido'}`;

      card.appendChild(artista);
      card.appendChild(album);
      card.appendChild(genero);
    }

    card.onclick = () => {
      miniPlayer.style.display = 'none';
      player.pause();
      videoPrincipal.appendChild(player);
      seccionReproductor.style.display = 'block';
      grid.style.display = 'none';
      filtrosBarra.classList.remove('visible');
      player.src = video.ruta;
      player.play();
      videoActualRuta = video.ruta;
      llenarRecomendados(video);
      iconBuscar.style.display = 'none';
      iconRegresarSidebar.style.display = 'block';
      tituloVideo.textContent = video.titulo.replace(/\.[^/.]+$/, "");
      document.getElementById("video-principal").scrollIntoView({ behavior: "smooth", block: "start" });

    };
    card.addEventListener('contextmenu', e => {
      e.preventDefault();
      mostrarMenuContextual(e.pageX, e.pageY, video);
    });

    grid.appendChild(card);
  });
// Al final de mostrarVistaReproductor() por ejemplo

}

//Función para aleatorizar el grid.
function mezclarArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
//Animación banner
window.addEventListener('DOMContentLoaded', () => {
  const banner = document.querySelector('.banner');
  banner.classList.add('inicio-animado');
});

// ==============================
// 4. ▶️ REPRODUCTOR Y MINI-PLAYER
// ==============================

function saltarASiguienteEnFila() {
  if (filaReproduccion.length === 0) {
    mostrarPopup('No hay canciones en la fila');
    return;
  }
  if (filaReproduccion[0].ruta === videoActualRuta) {
    filaReproduccion.shift();
  }
  if (filaReproduccion.length > 0) {
    reproducirDesdeFila(0);
  } else {
    player.pause();
    player.src = '';
    grid.style.display = 'grid';
    seccionReproductor.style.display = 'none';
    miniPlayer.style.display = 'none';
    if (iconBuscar) iconBuscar.style.display = 'block';
    if (iconRegresarSidebar) iconRegresarSidebar.style.display = 'none';
    mostrarPopup('La fila se ha terminado. Agrega nuevas canciones.');
  }
}

btnSiguienteFila.addEventListener('click', saltarASiguienteEnFila);
miniNext.addEventListener('click', saltarASiguienteEnFila);

btnEliminarFila.addEventListener('click', () => {
  mostrarConfirmacion(
    '¿Seguro que deseas eliminar toda la fila de reproducción?',
    () => {
      filaReproduccion = [];
      mostrarVistaFila();
      mostrarPopup('Fila eliminada.');
    }
  );
});

iconRegresarSidebar.addEventListener('click', () => {
  miniPlayer.appendChild(player);
  miniPlayer.style.display = 'block';
  modoMiniPlayer = true;
  seccionReproductor.style.display = 'none';
  grid.style.display = 'grid';
  iconRegresarSidebar.style.display = 'none';
  iconBuscar.style.display = 'block';
});

miniClose.addEventListener('click', (e) => {
  e.stopPropagation();
  const cerrarMiniPlayer = () => {
    miniPlayer.style.display = 'none';
    modoMiniPlayer = false;
  };
  const indexEnFila = filaReproduccion.findIndex(v => v.ruta === videoActualRuta);
  if (indexEnFila !== -1) {
    mostrarConfirmacion('Esta canción está en la fila, ¿Deseas eliminarla?', () => {
      filaReproduccion.splice(indexEnFila, 1);
      player.pause();
      player.src = '';
      cerrarMiniPlayer();
      if (filaReproduccion.length > 0) {
        modoMiniPlayer = true;
        reproducirDesdeFila(0);
      }
    },);
  } else {
    player.pause();
    player.src = '';
    cerrarMiniPlayer();
  }
});

miniExpand.addEventListener('click', () => {
  videoPrincipal.appendChild(player);
  seccionReproductor.style.display = 'block';
  grid.style.display = 'none';
  miniPlayer.style.display = 'none';
  modoMiniPlayer = false;
  iconRegresarSidebar.style.display = 'block';
  iconBuscar.style.display = 'none';
  document.getElementById("video-principal").scrollIntoView({ behavior: "smooth", block: "start" });
});

player.addEventListener('ended', () => {
  if (filaReproduccion.length > 0) {
    if (filaReproduccion[0].ruta === videoActualRuta) {
      filaReproduccion.shift();
    }
    reproducirDesdeFila();
  }
});

// ==============================
// 5. 🎵 FILA DE REPRODUCCIÓN
// ==============================
function mostrarVistaFila() {
  listaFila.innerHTML = '';
  filaReproduccion.forEach((video, i) => {
    const li = document.createElement('li');
    li.classList.add('lista-fila-item');
    const tituloLimpio = video.titulo.replace(/\.[^/.]+$/, "");
    const esActual = video.ruta === videoActualRuta;

    li.innerHTML = `<strong>${tituloLimpio}</strong> ${esActual ? '🎵 <em style="color: lime;">(Ahora sonando)</em>' : ''}`;
    li.draggable = true;
    li.dataset.index = i;

    li.onclick = () => {
      vistaFila.style.display = 'none';
      indiceActualFila = i;
      reproducirDesdeFila(i);
    };

    li.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      mostrarConfirmacion(`¿Eliminar "${tituloLimpio}" de la fila?`, () => {
        if (video.ruta === videoActualRuta) {
          player.pause();
          player.src = '';
          filaReproduccion.splice(i, 1);
          if (filaReproduccion.length > 0) {
            reproducirDesdeFila(0);
          } else {
            mostrarPopup('No hay más canciones en la fila.');
            vistaFila.style.display = 'none';
            grid.style.display = 'grid';
          }
        } else {
          filaReproduccion.splice(i, 1);
        }
        mostrarVistaFila();
      });
    });

    // Drag & Drop events
    li.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', i);
      li.classList.add('dragging');
    });

    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      li.classList.add('drag-over');
    });

    li.addEventListener('dragleave', () => {
      li.classList.remove('drag-over');
    });

    li.addEventListener('drop', (e) => {
      e.preventDefault();
      li.classList.remove('drag-over');
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
      const toIndex = parseInt(li.dataset.index, 10);
      if (fromIndex !== toIndex) {
        const [moved] = filaReproduccion.splice(fromIndex, 1);
        filaReproduccion.splice(toIndex, 0, moved);
        mostrarVistaFila();
      }
    });

    listaFila.appendChild(li);
  });

  vistaFila.style.display = 'block';
}

iconFila.addEventListener('click', () => {
  if (filaReproduccion.length === 0) {
    mostrarPopup('No hay canciones en la fila');
    return;
  }

  vistaFila.classList.toggle('visible');

  if (vistaFila.classList.contains('visible')) {
    mostrarVistaFila();
  }
});

btnCerrarFila.addEventListener('click', () => {
  vistaFila.classList.remove('visible');
});

btnReproducirFila.addEventListener('click', () => {
  indiceActualFila = 0;
  vistaFila.style.display = 'none';
  reproducirDesdeFila(indiceActualFila);
});

function reproducirDesdeFila(indice = 0) {
  if (filaReproduccion.length === 0) {
    player.pause();
    player.src = '';
    grid.style.display = 'grid';
    seccionReproductor.style.display = 'none';
    miniPlayer.style.display = 'none';
    if (iconBuscar) iconBuscar.style.display = 'block';
    if (iconRegresarSidebar) iconRegresarSidebar.style.display = 'none';
    mostrarPopup('La fila se ha terminado. Agrega nuevas canciones.');
    return;
  }
  if (indice > 0) {
    filaReproduccion.splice(0, indice);
  }
  const video = filaReproduccion[0];
  if (modoMiniPlayer) {
    miniPlayer.appendChild(player);
    miniPlayer.style.display = 'block';
    seccionReproductor.style.display = 'none';
    grid.style.display = 'grid';
  } else {
    videoPrincipal.appendChild(player);
    seccionReproductor.style.display = 'block';
    grid.style.display = 'none';
    miniPlayer.style.display = 'none';
  }
  player.src = video.ruta;
  player.play();
  videoActualRuta = video.ruta;
  llenarRecomendados(video);
  tituloVideo.textContent = video.titulo.replace(/\.[^/.]+$/, "");
  iconRegresarSidebar.style.display = 'block';
  iconBuscar.style.display = 'none';
  filtrosBarra.classList.remove('visible');
}

// ==============================
// 6. 🖼️ RECOMENDADOS Y MENÚ CONTEXTUAL
// ==============================
function llenarRecomendados(videoBase) {
  recomendadosGrid.innerHTML = '';
  const similares = videosOriginales.filter(v =>
    v.ruta !== videoBase.ruta &&
    (v.artista === videoBase.artista ||
     v.genero === videoBase.genero ||
     v.album === videoBase.album)
  ).slice(0, 10);

  similares.forEach(video => {
    const card = document.createElement('div');
    card.classList.add('card');

    const img = document.createElement('img');
    img.src = video.imagen ? `file://${video.imagen}` : 'https://via.placeholder.com/300x170/000000/ffffff?text=Video';
    img.alt = video.titulo;

    const titulo = document.createElement('h3');
    titulo.textContent = video.titulo.replace(/\.[^/.]+$/, "");

    card.appendChild(img);
    card.appendChild(titulo);

    card.onclick = () => {
      videoPrincipal.appendChild(player);
      seccionReproductor.style.display = 'block';
      grid.style.display = 'none';
      filtrosBarra.style.display = 'none';
      player.src = video.ruta;
      player.play();
      videoActualRuta = video.ruta;
      tituloVideo.textContent = video.titulo.replace(/\.[^/.]+$/, "");
      llenarRecomendados(video);
      document.getElementById("video-principal").scrollIntoView({ behavior: "smooth", block: "start" });

    };
    card.addEventListener('contextmenu', e => {
      e.preventDefault();
      mostrarMenuContextual(e.pageX, e.pageY, video);
    });

    recomendadosGrid.appendChild(card);
  });
}

function mostrarMenuContextual(x, y, video) {
  const menuExistente = document.getElementById('menu-contextual');
  if (menuExistente) menuExistente.remove();

  const menu = document.createElement('div');
  menu.id = 'menu-contextual';
  menu.classList.add('menu-contextual-opcion');
  menu.style.position = 'absolute';
  menu.style.padding = '10px';
  menu.style.borderRadius = '6px';
  menu.style.color = '#fff';
  menu.style.zIndex = 97;
  menu.innerHTML = 'Agregar a fila';
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  document.body.appendChild(menu);

  menu.onclick = () => {
    if (filaReproduccion.some(v => v.ruta === video.ruta)) {
      mostrarPopup('Ya está en la fila.');
      menu.remove();
      return;
    }
    filaReproduccion.push(video);
    mostrarPopup('Agregado a la fila.');
    menu.remove();
  };
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('menu-contextual');
  if (menu && !menu.contains(e.target)) {
    menu.remove();
  }
});

// ==============================
// 7. ⚙️ AJUSTES Y TEMA
// ==============================

const ajustesVistas = {
  general: `
    <h2 class="ajuste-titulo">General</h2>
    <div class="ajuste-item">
      <label class="ajuste-label">
        <input type="checkbox" id="chk-animaciones">
        Animaciones <span class="ajuste-nota">(placeholder)</span>
      </label>
    </div>
    <div class="ajuste-item">
      <label class="ajuste-label">
        <input type="checkbox" id="chk-info-canciones" checked>
        Información de canciones
      </label>
    </div>
    <div class="ajuste-item">
      <label class="ajuste-label">
        <input type="checkbox" id="chk-musica-fondo">
        Música de fondo <span class="ajuste-nota">(placeholder)</span>
      </label>
    </div>
        <div class="ajuste-item">
      <label class="ajuste-label">
        <input type="checkbox" id="chk-musica-fondo">
        Efectos de sonido <span class="ajuste-nota">(placeholder)</span>
      </label>
    </div>
  `,
  tema: `
    <h2 class="ajuste-titulo">Tema</h2>
      <div class="ajuste-item">
    <label for="select-tema-color">Paleta de colores:</label>
    <select id="select-tema-color">
      <option value="default">Predeterminado</option>
      <option value="tema-oscuro">Oscuro</option>
      <option value="tema-claro">Claro</option>
      <option value="tema-naturaleza">Retro</option>
    </select>
  </div>
    <div class="ajuste-item">
      <label for="select-grid-vista">Vista del grid:</label>
      <select id="select-grid-vista">
        <option value="normal">Predeterminada</option>
        <option value="compacta">Compacta</option>
        <option value="detallada">Detallada</option>
        <option value="mosaico">Estilo mosaico (Windows 8)</option>
      </select>
    </div>
  `,
  info: `<h2 class="ajuste-titulo">Información</h2><p>Versión, créditos y ayuda.</p>`
};


// Mostrar overlay al abrir ajustes
iconAjustes.addEventListener('click', () => {
  overlayBloqueo.style.display = 'block';
  popupAjustes.style.display = 'block';
  mostrarAjuste('general');
});

// Ocultar overlay al cerrar ajustes
btnCerrarAjustes.addEventListener('click', () => {
  popupAjustes.style.display = 'none';
  overlayBloqueo.style.display = 'none';
});

// Cambiar de sección al hacer click en un icono
ajustesIconos.forEach(btn => {
  btn.addEventListener('click', () => {
    mostrarAjuste(btn.dataset.ajuste);
  });
});

// Función para mostrar el contenido de la sección seleccionada
function mostrarAjuste(seccion) {
  // Inserta el HTML de la sección (usa clases, no estilos inline)
  ajustesContenido.innerHTML = ajustesVistas[seccion] || '';

  // Resalta el ícono activo en el sidebar de ajustes
ajustesIconos.forEach(btn => {
  btn.classList.toggle('activo', btn.dataset.ajuste === seccion);
});
  // Configuración para sección "General"
  if (seccion === 'general') {
    const chkInfo = document.getElementById('chk-info-canciones');
    chkInfo.checked = localStorage.getItem('mostrarInfoCanciones') !== 'false';
    chkInfo.addEventListener('change', () => {
      localStorage.setItem('mostrarInfoCanciones', chkInfo.checked ? 'true' : 'false');
      mostrarVideos(videosOriginales);
    });
  }

  // Configuración para sección "Tema"
  if (seccion === 'tema') {
    const selectPaleta = document.getElementById('select-tema-color');
    selectPaleta.value = localStorage.getItem('paletaApp') || 'default';

    selectPaleta.addEventListener('change', () => {
    localStorage.setItem('paletaApp', selectPaleta.value);
    aplicarPaleta(selectPaleta.value);
});

// Aplicar de inmediato
aplicarPaleta(selectPaleta.value);

    const selectVista = document.getElementById('select-grid-vista');
    selectVista.value = localStorage.getItem('vistaGrid') || 'normal';
    selectVista.addEventListener('change', () => {
      localStorage.setItem('vistaGrid', selectVista.value);
      mostrarVideos(videosOriginales);
    });
  }
}

function aplicarPaleta(nombre) {
  document.body.classList.remove('tema-oscuro', 'tema-claro', 'tema-naturaleza');

  if (nombre && nombre !== 'default') {
    document.body.classList.add(nombre);
  }
}
// Aplicar fondo guardado al cargar
window.addEventListener('DOMContentLoaded', async () => {
  aplicarPaleta(localStorage.getItem('paletaApp') || 'default');
  const carpeta = localStorage.getItem('carpetaSeleccionada');
  if (carpeta) {
    const resultado = await window.api.actualizarBase(carpeta);
    if (resultado && resultado.length) {
      videosOriginales = resultado;
      construirFiltros(videosOriginales);
      // Mezcla los videos antes de mostrarlos
      const videosMezclados = mezclarArray([...videosOriginales]);
      mostrarVideos(videosMezclados);
    }
  }
});

// Cerrar popup
btnCerrarAjustes.addEventListener('click', () => {
  popupAjustes.style.display = 'none';
});

// =====================================
// 8. 👤 ADMINISTRADORES y BASE DE DATOS
// =====================================


// --- Funciones para el manejo de administradores ---
async function cargarVistaAdmin(seccion) {
  let html = '';

  if (seccion === 'usuarios') {
    html += `
      <h2>Administradores</h2>
      <div style="margin-bottom:18px;">
        Sesión iniciada como <strong>${adminActual.usuario}</strong>
        <button id="btn-editar-admin-actual" style="margin-left:12px;">Editar usuario</button>
      </div>
      <div style="margin-bottom:18px;">
        <button id="btn-ver-admins">Ver administradores</button>
        <button id="btn-agregar-admin" style="margin-left:8px;">Agregar administrador</button>
        <button id="btn-eliminar-admin" style="margin-left:8px;">Eliminar administrador</button>
      </div>
      <div id="admin-accion"></div>
      <div id="tabla-admins" style="margin-top:18px;"></div>
    `;
  }

  if (seccion === 'bd') {
    const carpetaSeleccionada = localStorage.getItem('carpetaSeleccionada') || '';
    html += `
      <h2>Base de datos y directorio</h2>
      <div style="margin-bottom:18px;">
        <strong>Directorio de carpetas:</strong>
        <div style="margin:8px 0;">
          <span id="directorio-actual">${carpetaSeleccionada || 'No seleccionado'}</span>
          <button id="btn-seleccionar-carpeta" style="margin-left:12px;">Seleccionar carpeta</button>
        </div>
      </div>
      <div style="margin-bottom:18px;">
        <strong>Editar metadatos</strong>
        <div style="margin:8px 0;">
          <button id="btn-editar-metadatos">Editar metadatos de videos</button>
        </div>
      </div>
      <div style="margin-bottom:18px;">
        <strong>Actualizar Base de datos</strong>
        <div style="margin:8px 0;">
          <button id="btn-actualizar-base">Actualizar base de datos</button>
        </div>
      </div>
      <div id="bd-dir-msg" style="color:#27ae60;margin-top:10px;display:none;"></div>
      <div id="admin-accion"></div>
    `;
  }

  adminContenido.innerHTML = html;
  // Activar lógica según sección
  if (seccion === 'usuarios') {
    document.getElementById('btn-editar-admin-actual')?.addEventListener('click', mostrarEditarAdminActual);
    document.getElementById('btn-ver-admins')?.addEventListener('click', mostrarTablaAdmins);
    document.getElementById('btn-agregar-admin')?.addEventListener('click', mostrarAgregarAdmin);
    document.getElementById('btn-eliminar-admin')?.addEventListener('click', mostrarEliminarAdmin);
  }

  if (seccion === 'bd') {
    document.getElementById('btn-seleccionar-carpeta')?.addEventListener('click', async () => {
      const resultado = await window.api.seleccionarCarpeta();
      if (resultado?.ruta) {
        localStorage.setItem('carpetaSeleccionada', resultado.ruta);
        document.getElementById('directorio-actual').textContent = resultado.ruta;
        mostrarPopup('Directorio actualizado.');
      }
    });

    document.getElementById('btn-actualizar-base')?.addEventListener('click', async () => {
      const carpeta = localStorage.getItem('carpetaSeleccionada');
      if (!carpeta) return mostrarPopup('Selecciona primero un directorio.');

      const resultado = await window.api.actualizarBase(carpeta);
      if (resultado?.length) {
        videosOriginales = resultado;
        construirFiltros(videosOriginales);
        mostrarVideos(videosOriginales);
        mostrarPopup('Base de datos actualizada.');
      } else {
        mostrarPopup('No se pudo actualizar la base de datos.', 'error');
      }
    });

    document.getElementById('btn-editar-metadatos')?.addEventListener('click', mostrarEditorMetadatos);
  }
}

function mostrarEditarAdminActual() {
  adminContenido.querySelector('#admin-accion').innerHTML = `
    <h3>Editar usuario actual</h3>
    <form id="form-editar-admin">
      <input type="text" id="nuevo-usuario" value="${adminActual.usuario}" placeholder="Nuevo usuario" required style="margin-bottom:8px;">
      <input type="password" id="nueva-password" placeholder="Nueva contraseña" required style="margin-bottom:8px;">
      <button type="submit">Guardar cambios</button>
    </form>
    <div id="editar-admin-error" style="color:#ff7675;margin-top:10px;display:none;"></div>
  `;
  adminContenido.querySelector('#form-editar-admin').onsubmit = async (e) => {
    e.preventDefault();
    const nuevoUsuario = document.getElementById('nuevo-usuario').value.trim();
    const nuevaPassword = document.getElementById('nueva-password').value;
    mostrarConfirmacion('¿Seguro que quieres guardar los cambios?', async () => {
      const res = await window.api.adminEditar(adminActual.id, nuevoUsuario, nuevaPassword);
      if (res.ok) {
        adminActual.usuario = nuevoUsuario;
        cargarVistaUsuarios();
      } else {
        document.getElementById('editar-admin-error').textContent = res.error;
        document.getElementById('editar-admin-error').style.display = 'block';
      }
    });
  };
}

async function mostrarTablaAdmins() {
  const lista = await window.api.adminListar();
  let html = `
    <table style="width:100%;font-size:15px;">
      <tr>
        <th>ID</th>
        <th>Usuario</th>
      </tr>
      ${lista.map(a => `
        <tr>
          <td>${a.id}</td>
          <td>${a.usuario}</td>
        </tr>
      `).join('')}
    </table>
  `;

  const tablaAdmins = document.getElementById('tabla-admins');
  if (tablaAdmins) {
    tablaAdmins.innerHTML = html;
  }
}

function mostrarAgregarAdmin() {
  adminContenido.querySelector('#admin-accion').innerHTML = `
    <h3>Agregar administrador</h3>
    <form id="form-agregar-admin">
      <input type="text" id="nuevo-admin-usuario" placeholder="Usuario" required style="margin-bottom:8px;">
      <input type="password" id="nuevo-admin-password" placeholder="Contraseña" required style="margin-bottom:8px;">
      <button type="submit">Agregar</button>
    </form>
    <div id="agregar-admin-error" style="color:#ff7675;margin-top:10px;display:none;"></div>
  `;
  adminContenido.querySelector('#form-agregar-admin').onsubmit = async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('nuevo-admin-usuario').value.trim();
    const password = document.getElementById('nuevo-admin-password').value;
    mostrarConfirmacion('¿Seguro que quieres agregar este administrador?', async () => {
      const res = await window.api.adminAgregar(usuario, password);
      if (res.ok) {
        cargarVistaUsuarios();
      } else {
        document.getElementById('agregar-admin-error').textContent = res.error;
        document.getElementById('agregar-admin-error').style.display = 'block';
      }
    });
  };
}

async function mostrarEliminarAdmin() {
  const lista = await window.api.adminListar();
  let opciones = lista.map(a => `<option value="${a.id}">${a.usuario}</option>`).join('');
  adminContenido.querySelector('#admin-accion').innerHTML = `
    <h3>Eliminar administrador</h3>
    <form id="form-eliminar-admin">
      <select id="admin-a-eliminar">${opciones}</select>
      <button type="submit" style="margin-left:8px;">Eliminar</button>
    </form>
    <div id="eliminar-admin-error" style="color:#ff7675;margin-top:10px;display:none;"></div>
  `;
  adminContenido.querySelector('#form-eliminar-admin').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('admin-a-eliminar').value;
    mostrarConfirmacion('¿Seguro que quieres eliminar este administrador?', async () => {
      const res = await window.api.adminEliminar(id);
      if (res.ok) {
        cargarVistaUsuarios();
      } else {
        document.getElementById('eliminar-admin-error').textContent = res.error;
        document.getElementById('eliminar-admin-error').style.display = 'block';
      }
    });
  };
}

// Mostrar popup de autenticación al hacer click en el icono admin
iconAdmin.addEventListener('click', () => {
  overlayBloqueo.style.display = 'block';
  popupAuthAdmin.style.display = 'block';
  formAuthAdmin.reset();
  authAdminError.style.display = 'none';
});

// Cerrar popup de autenticación
btnCerrarAuthAdmin.addEventListener('click', () => {
  popupAuthAdmin.style.display = 'none';
  overlayBloqueo.style.display = 'none';
});

// Manejar login de administrador
formAuthAdmin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usuario = document.getElementById('admin-usuario').value.trim();
  const password = document.getElementById('admin-password').value;
  const res = await window.api.adminLogin(usuario, password);
  if (res.ok) {
    adminActual = res.admin;
    popupAuthAdmin.style.display = 'none';
    popupAdmin.style.display = 'block';
    cargarVistaUsuarios();
  } else {
    authAdminError.textContent = res.error;
    authAdminError.style.display = 'block';
  }
});

// Cerrar popup admin
btnCerrarAdmin.addEventListener('click', () => {
  popupAdmin.style.display = 'none';
  overlayBloqueo.style.display = 'none';
  adminActual = null;
});

// Cambiar de sección en el menú admin
adminIconos.forEach(btn => {
  btn.addEventListener('click', () => {
    adminIconos.forEach(b => b.style.background = 'none');
    btn.style.background = '#333';
    mostrarAdmin(btn.dataset.admin);
  });
});

function mostrarAdmin(seccion) {
  adminIconos.forEach(btn => {
    btn.style.background = (btn.dataset.admin === seccion) ? '#333' : 'none';
  });
  cargarVistaAdmin(seccion);
}

async function mostrarEditorMetadatos() {
  const videos = await window.api.videosListar();
  let html = `<h3>Editar metadatos de videos</h3>
    <form id="form-editar-metadatos">
    <div style="max-height:60vh;overflow:auto;">
      <table style="width:100%;font-size:15px;">
        <tr>
          <th>Título</th>
          <th>Artista</th>
          <th>Álbum</th>
          <th>Género</th>
          <th>Década</th>
        </tr>
        ${videos.map(video => `
          <tr data-id="${video.id}">
            <td><input type="text" value="${video.titulo || ''}" data-original="${video.titulo || ''}" style="width:120px;"></td>
            <td><input type="text" value="${video.artista || ''}" data-original="${video.artista || ''}" style="width:80px;"></td>
            <td><input type="text" value="${video.album || ''}" data-original="${video.album || ''}" style="width:80px;"></td>
            <td><input type="text" value="${video.genero || ''}" data-original="${video.genero || ''}" style="width:80px;"></td>
            <td><input type="text" value="${video.decada || ''}" data-original="${video.decada || ''}" style="width:60px;"></td>
          </tr>
        `).join('')}
      </table>
    </div>
    <div style="margin-top:18px; text-align:right;">
      <button type="submit" id="btn-guardar-todos-metadatos" style="padding:8px 24px;">Guardar cambios</button>
    </div>
    <div id="editar-metadatos-msg" style="color:#27ae60;margin-top:10px;display:none;"></div>
    </form>
  `;
  document.getElementById('contenido-metadatos').innerHTML = html;
  document.getElementById('popup-metadatos').style.display = 'block';

  document.getElementById('form-editar-metadatos').onsubmit = async (e) => {
    e.preventDefault();
    // Detectar cambios
    const filas = Array.from(document.querySelectorAll('#form-editar-metadatos tr[data-id]'));
    const cambios = [];
    filas.forEach(tr => {
      const id = tr.dataset.id;
      const inputs = tr.querySelectorAll('input');
      const datos = {
        titulo: inputs[0].value,
        artista: inputs[1].value, 
        album: inputs[2].value,
        genero: inputs[3].value,
        decada: inputs[4].value
      };
      // Detecta si hay algún cambio respecto al valor original
      let cambiado = false;
      inputs.forEach((input, idx) => {
        if (input.value !== input.getAttribute('data-original')) cambiado = true;
      });
      if (cambiado) {
        cambios.push({ id, datos, antes: {
          titulo: inputs[0].getAttribute('data-original'),
          artista_id: inputs[1].getAttribute('data-original'),
          album: inputs[2].getAttribute('data-original'),
          genero: inputs[3].getAttribute('data-original'),
          decada: inputs[4].getAttribute('data-original')
        }});
      }
    });

    if (cambios.length === 0) {
      mostrarPopup('No hay cambios para guardar.');
      return;
    }

    // Muestra resumen de cambios
    let resumen = `<div style="max-height:40vh;overflow:auto;"><strong>Resumen de cambios:</strong><ul>`;
    cambios.forEach(c => {
      resumen += `<li>
        <b>ID ${c.id}</b>:<br>
        ${Object.keys(c.datos).map(key => 
          c.antes[key] !== c.datos[key]
            ? `<span style="color:#f1c40f">${key}:</span> <span style="color:#aaa">${c.antes[key]}</span> <b>→</b> <span style="color:#2ecc71">${c.datos[key]}</span>`
            : ''
        ).filter(Boolean).join('<br>')}
      </li>`;
    });
    resumen += `</ul></div>¿Seguro que quieres guardar estos cambios?`;

    mostrarConfirmacion(resumen, async () => {
      for (const c of cambios) {
        await window.api.videoEditarMetadatos(c.id, c.datos);
      }
      document.getElementById('editar-metadatos-msg').textContent = 'Metadatos actualizados.';
      document.getElementById('editar-metadatos-msg').style.display = 'block';

      // No refrescar el grid aquí, solo al actualizar base de datos
    });
  };
}

// Cerrar el popup de metadatos
document.getElementById('btn-cerrar-metadatos').onclick = () => {
  document.getElementById('popup-metadatos').style.display = 'none';
};


// ==============================
// 9. 🪟 UTILIDADES Y POPUPS
// ==============================

function mostrarConfirmacion(mensaje, onConfirm, onCancel) {
  // Elimina cualquier confirmación previa
  const existente = document.getElementById('popup-confirmacion');
  if (existente) existente.remove();

  const overlay = document.createElement('div');
  overlay.id = 'popup-confirmacion';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.35)';
  overlay.style.zIndex = 20000;
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';

  const box = document.createElement('div');
  box.style.background = '#232323';
  box.style.color = '#fff';
  box.style.padding = '32px 24px 18px 24px';
  box.style.borderRadius = '12px';
  box.style.boxShadow = '0 4px 32px #000a';
  box.style.minWidth = '320px';
  box.style.maxWidth = '90vw';
  box.style.maxHeight = '80vh';
  box.style.overflowY = 'auto';
  box.style.textAlign = 'center';

  const msg = document.createElement('div');
  msg.innerHTML = mensaje;
  msg.style.marginBottom = '18px';

  const btns = document.createElement('div');
  btns.style.display = 'flex';
  btns.style.justifyContent = 'center';
  btns.style.gap = '24px';

  const btnOk = document.createElement('button');
  btnOk.textContent = 'Aceptar';
  btnOk.style.padding = '8px 24px';
  btnOk.style.background = '#27ae60';
  btnOk.style.color = '#fff';
  btnOk.style.border = 'none';
  btnOk.style.borderRadius = '6px';
  btnOk.style.cursor = 'pointer';

  const btnCancel = document.createElement('button');
  btnCancel.textContent = 'Cancelar';
  btnCancel.style.padding = '8px 24px';
  btnCancel.style.background = '#e74c3c';
  btnCancel.style.color = '#fff';
  btnCancel.style.border = 'none';
  btnCancel.style.borderRadius = '6px';
  btnCancel.style.cursor = 'pointer';

  btnOk.onclick = () => {
    overlay.remove();
    if (onConfirm) onConfirm();
  };
  btnCancel.onclick = () => {
    overlay.remove();
    if (onCancel) onCancel();
  };

  btns.appendChild(btnOk);
  btns.appendChild(btnCancel);

  box.appendChild(msg);
  box.appendChild(btns);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function mostrarPopup(mensaje, tipo = 'info') {
  const anterior = document.getElementById('popup-msg');
  if (anterior) anterior.remove();

  const popup = document.createElement('div');
  popup.id = 'popup-msg';
  popup.className = 'popup-msg popup-entrada';
  popup.textContent = mensaje;

  if (tipo === 'error') {
    popup.style.background = 'var(--color-error, #e74c3c)';
  } else {
    popup.style.background = 'var(--color-popup, #444)';
  }

  document.body.appendChild(popup);

  // Luego de 2s, cambia a animación de salida
  setTimeout(() => {
    popup.classList.remove('popup-entrada');
    popup.classList.add('popup-salida');

    // Elimina después de la animación de salida (400ms)
    popup.addEventListener('animationend', () => {
      popup.remove();
    }, { once: true });
  }, 2200);
}

