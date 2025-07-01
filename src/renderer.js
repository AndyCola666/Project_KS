// renderer.js limpio y corregido con sistema de fila y mini reproductor funcional

// Referencias
const btn = document.getElementById('boton-carpeta');
const grid = document.getElementById('grid-videos');
const player = document.getElementById('player');
const tituloVideo = document.getElementById('titulo-video');
const inputBusqueda = document.getElementById('busqueda');
const filtrosBarra = document.getElementById('filtros-barra');
const filtrosBloque = document.getElementById('filtros-bloque');
const filtrosGenero = document.getElementById('filtros-genero');
const filtrosArtista = document.getElementById('filtros-artista');
const filtrosAño = document.getElementById('filtros-año');
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
const iconAdmin = document.getElementById('icon-admin ');
const popupAuthAdmin = document.getElementById('popup-auth-admin');
const formAuthAdmin = document.getElementById('form-auth-admin');
const btnCerrarAuthAdmin = document.getElementById('btn-cerrar-auth-admin');
const authAdminError = document.getElementById('auth-admin-error');
const popupAdmin = document.getElementById('popup-admin');
const btnCerrarAdmin = document.getElementById('btn-cerrar-admin');
const adminContenido = document.getElementById('admin-contenido');
const adminIconos = document.querySelectorAll('.admin-icono');
const overlayBloqueo = document.getElementById('overlay-bloqueo');

let videosOriginales = [];
let carpetaSeleccionada = null;
let videoActualRuta = null;
let filaReproduccion = [];
let indexActualFila = 0;
let modoMiniPlayer = false;

// Manejadores de eventos
btn.addEventListener('click', async () => {
  const resultado = await window.api.seleccionarCarpeta();
  if (resultado && resultado.videos) {
    videosOriginales = resultado.videos;
    carpetaSeleccionada = resultado.ruta;
    construirFiltros(videosOriginales);
    mostrarVideos(videosOriginales);
  }
});

iconBuscar.addEventListener('click', () => {
  // Solo mostrar la barra si el grid está visible (opcional)
  if (grid.style.display === 'grid' || grid.style.display === '') {
    filtrosBarra.style.display = (filtrosBarra.style.display === 'flex') ? 'none' : 'flex';

  }
});

btnActualizar.addEventListener('click', async () => {
  if (!carpetaSeleccionada) return;
  const resultados = await window.api.actualizarBase(carpetaSeleccionada);
  videosOriginales = resultados;
  construirFiltros(videosOriginales);
  mostrarVideos(videosOriginales);
});

btnToggleFiltros.addEventListener('click', () => {
  const visible = filtrosBloque.style.display === 'flex';
  filtrosBloque.style.display = visible ? 'none' : 'flex';
});

function construirFiltros(videos) {
  const generos = new Set();
  const artistas = new Set();  const años = new Set();

  videos.forEach(video => {
    if (video.genero) generos.add(video.genero);
    if (video.artista) artistas.add(video.artista);
    if (video.año) años.add(video.año);
  });

  poblarSelect(filtrosGenero, generos);
  poblarSelect(filtrosArtista, artistas);
  poblarSelect(filtrosAño, años);
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
  const añoSel = filtrosAño.value;

  const filtrados = videosOriginales.filter(video => {
    const coincideTexto = video.titulo.toLowerCase().includes(texto);
    const coincideGenero = !generoSel || video.genero === generoSel;
    const coincideArtista = !artistaSel || video.artista === artistaSel;
    const coincideAño = !añoSel || video.año === añoSel;
    return coincideTexto && coincideGenero && coincideArtista && coincideAño;
  });

  mostrarVideos(filtrados);
}

inputBusqueda.addEventListener('input', aplicarFiltros);
filtrosGenero.addEventListener('change', aplicarFiltros);
filtrosArtista.addEventListener('change', aplicarFiltros);
filtrosAño.addEventListener('change', aplicarFiltros);

function mostrarVideos(videos) {
  grid.innerHTML = '';
  seccionReproductor.style.display = 'none';
  grid.style.display = 'grid';

  videos.forEach(video => {
    const card = document.createElement('div');
    card.classList.add('card');

    const img = document.createElement('img');
    img.src = video.imagen ? `file://${video.imagen}` : 'https://via.placeholder.com/300x170/000000/ffffff?text=Video';
    img.alt = video.titulo;

    const titulo = document.createElement('h3');
    titulo.textContent = video.titulo.replace(/\.[^/.]+$/, "");

    const artista = document.createElement('p');
    artista.textContent = `Artista: ${video.artista || 'Desconocido'}`;

    const album = document.createElement('p');
    album.textContent = `Álbum: ${video.album || 'Desconocido'}`;

    const genero = document.createElement('p');
    genero.textContent = `Género: ${video.genero || 'Desconocido'}`;

    card.appendChild(img);
    card.appendChild(titulo);
    card.appendChild(artista);
    card.appendChild(album);
    card.appendChild(genero);

    card.onclick = () => {
      miniPlayer.style.display = 'none';
      player.pause();
      videoPrincipal.appendChild(player);
      seccionReproductor.style.display = 'block';
      grid.style.display = 'none';
      filtrosBarra.style.display = 'none';
      player.src = video.ruta;
      player.play();
      videoActualRuta = video.ruta; 
      llenarRecomendados(video);
      iconBuscar.style.display = 'none';
      iconRegresarSidebar.style.display = 'block';
      tituloVideo.textContent = video.titulo.replace(/\.[^/.]+$/, ""); // Actualiza el título del video
    };
    card.addEventListener('contextmenu', e => {
      e.preventDefault();
      mostrarMenuContextual(e.pageX, e.pageY, video);
    });

    grid.appendChild(card);
  });
}
// Función para saltar a la siguiente canción en la fila
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
};


btnSiguienteFila.addEventListener('click', saltarASiguienteEnFila);
miniNext.addEventListener('click', saltarASiguienteEnFila);

// Para el reproductor normal:
btnSiguienteFila.addEventListener('click', saltarASiguienteEnFila);

btnEliminarFila.addEventListener('click', () => {
  mostrarConfirmacion(
    '¿Seguro que deseas eliminar toda la fila de reproducción?',
    () => {
      filaReproduccion = [];
      mostrarVistaFila(); // Refresca la vista de la fila (quedará vacía)
      mostrarPopup('Fila eliminada.');
    }
  );
});

// Para el miniplayer:
miniNext.addEventListener('click', saltarASiguienteEnFila);

iconRegresarSidebar.addEventListener('click', () => {
  miniPlayer.appendChild(player);
  miniPlayer.style.display = 'block';
  modoMiniPlayer = true;
  seccionReproductor.style.display = 'none';
  grid.style.display = 'grid';
  iconRegresarSidebar.style.display = 'none';
  iconBuscar.style.display = 'block';
});

// --- Declaración de mostrarConfirmacion al inicio para evitar hoisting issues ---
function mostrarConfirmacion(mensaje, onConfirm, onCancel) {
  // Elimina cualquier confirmación anterior
  let confirmDiv = document.getElementById('popup-confirmacion');
  if (confirmDiv) confirmDiv.remove();

  confirmDiv = document.createElement('div');
  confirmDiv.id = 'popup-confirmacion';
  confirmDiv.style.position = 'fixed';
  confirmDiv.style.bottom = '30px';
  confirmDiv.style.left = '50%';
  confirmDiv.style.transform = 'translateX(-50%)';
  confirmDiv.style.background = '#222';
  confirmDiv.style.color = '#fff';
  confirmDiv.style.padding = '18px 32px';
  confirmDiv.style.borderRadius = '10px';
  confirmDiv.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
  confirmDiv.style.fontSize = '16px';
  confirmDiv.style.zIndex = 10000;
  confirmDiv.style.display = 'flex';
  confirmDiv.style.flexDirection = 'column';
  confirmDiv.style.alignItems = 'center';
  confirmDiv.style.gap = '18px';

  const msg = document.createElement('div');
  msg.textContent = mensaje;
  msg.style.marginBottom = '10px';

  const btns = document.createElement('div');
  btns.style.display = 'flex';
  btns.style.gap = '16px';

  const btnSi = document.createElement('button');
  btnSi.textContent = 'Sí';
  btnSi.style.background = '#27ae60';
  btnSi.style.color = '#fff';
  btnSi.style.border = 'none';
  btnSi.style.padding = '8px 22px';
  btnSi.style.borderRadius = '6px';
  btnSi.style.cursor = 'pointer';
  btnSi.onclick = () => {
    confirmDiv.remove();
    if (onConfirm) onConfirm();
  };

  const btnNo = document.createElement('button');
  btnNo.textContent = 'No';
  btnNo.style.background = '#c0392b';
  btnNo.style.color = '#fff';
  btnNo.style.border = 'none';
  btnNo.style.padding = '8px 22px';
  btnNo.style.borderRadius = '6px';
  btnNo.style.cursor = 'pointer';
  btnNo.onclick = () => {
    confirmDiv.remove();
    if (onCancel) onCancel();
  };

  btns.appendChild(btnSi);
  btns.appendChild(btnNo);

  confirmDiv.appendChild(msg);
  confirmDiv.appendChild(btns);

  document.body.appendChild(confirmDiv);
}

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
      // Si hay más videos en la fila, reproduce el siguiente
      if (filaReproduccion.length > 0) {
        modoMiniPlayer = true;
        reproducirDesdeFila(0);
      }
    }, cerrarMiniPlayer);
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
});

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
      videoActualRuta = video.ruta; // <--- aquí
      tituloVideo.textContent = video.titulo.replace(/\.[^/.]+$/, ""); // <-- aquí
      llenarRecomendados(video);
    };
    card.addEventListener('contextmenu', e => {
      e.preventDefault();
      mostrarMenuContextual(e.pageX, e.pageY, video);
    });

    recomendadosGrid.appendChild(card);
  });
}

function mostrarMenuContextual(x, y, video) {
  // Elimina cualquier menú contextual existente
  const menuExistente = document.getElementById('menu-contextual');
  if (menuExistente) menuExistente.remove();

  const menu = document.createElement('div');
  menu.id = 'menu-contextual';
  menu.style.position = 'absolute';
  menu.style.background = '#222';
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
    // Siempre agrega al final
    filaReproduccion.push(video);

   mostrarPopup ('Agregado a la fila.');
    menu.remove();
  };
}

  // Elimina el menú contextual si el usuario hace click fuera de él
  document.addEventListener('click', (e) => {
  const menu = document.getElementById('menu-contextual');
  if (menu && !menu.contains(e.target)) {
    menu.remove();
  }
});

function mostrarPopup(mensaje, tipo = 'info') {
  // Elimina cualquier popup anterior
  let popup = document.getElementById('popup-mensaje');
  if (popup) popup.remove();

  popup = document.createElement('div');
  popup.id = 'popup-mensaje';
  popup.textContent = mensaje;
  popup.style.position = 'fixed';
  popup.style.bottom = '30px';
  popup.style.left = '50%';
  popup.style.transform = 'translateX(-50%)';
  popup.style.background = tipo === 'error' ? '#c0392b' : '#222';
  popup.style.color = '#fff';
  popup.style.padding = '14px 28px';
  popup.style.borderRadius = '8px';
  popup.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
  popup.style.fontSize = '16px';
  popup.style.zIndex = 9999;
  popup.style.opacity = '0.95';
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.style.transition = 'opacity 0.5s';
    popup.style.opacity = '0';
    setTimeout(() => popup.remove(), 500);
  }, 1800);
}

function mostrarVistaFila() {
  listaFila.innerHTML = '';
  filaReproduccion.forEach((video, i) => {
    const li = document.createElement('li');
    const tituloLimpio = video.titulo.replace(/\.[^/.]+$/, "");
    const esActual = video.ruta === videoActualRuta;

    li.innerHTML = `<strong>${tituloLimpio}</strong> ${esActual ? '🎵 <em style="color: lime;">(Ahora sonando)</em>' : ''}`;
    li.draggable = true; // Habilita drag & drop
    li.dataset.index = i; // Guarda el índice original

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
        mostrarVistaFila(); // Recarga
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
        // Reordena el array de la fila
        const [moved] = filaReproduccion.splice(fromIndex, 1);
        filaReproduccion.splice(toIndex, 0, moved);
        mostrarVistaFila(); // Recarga la vista
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
  mostrarVistaFila(); // Reutiliza la función modular
});

// Para cerrar el menú de la fila:
btnCerrarFila.addEventListener('click', () => {
  vistaFila.style.display = 'none';
  inputBusqueda.focus(); // Regresa el foco al input de búsqueda
  // No muestres el grid aquí, solo cierra el popup
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

  // Elimina todos los videos anteriores al seleccionado
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
  tituloVideo.textContent = video.titulo.replace(/\.[^/.]+$/, "");
  iconRegresarSidebar.style.display = 'block';
  iconBuscar.style.display = 'none';
  filtrosBarra.style.display = 'none'; // <-- Agrega esto
}

// Listener global:
player.addEventListener('ended', () => {
  if (filaReproduccion.length > 0) {
    // Solo elimina si el video actual es el primero de la fila
    if (filaReproduccion[0].ruta === videoActualRuta) {
      filaReproduccion.shift();
    }
    reproducirDesdeFila();
  }
});

const ajustesVistas = {
  general: `<h2>General</h2><p>Ajustes generales del programa.</p>`,
  tema: `<h2>Tema</h2><p>Opciones de apariencia y tema.</p>`,
  info: `<h2>Información</h2><p>Versión, créditos y ayuda.</p>`
};

// Mostrar popup al hacer click en el icono de ajustes
iconAjustes.addEventListener('click', () => {
  overlayBloqueo.style.display = 'block';
  popupAjustes.style.display = 'block';
  mostrarAjuste('general');
});

// Mostrar overlay al abrir ajustes o admin
iconAjustes.addEventListener('click', () => {
  overlayBloqueo.style.display = 'block';
  popupAjustes.style.display = 'block';
  mostrarAjuste('general');
});

iconAdmin.addEventListener('click', () => {
  overlayBloqueo.style.display = 'block';
  popupAuthAdmin.style.display = 'block';
  formAuthAdmin.reset();
  authAdminError.style.display = 'none';
});

// Ocultar overlay al cerrar popups
btnCerrarAjustes.addEventListener('click', () => {
  popupAjustes.style.display = 'none';
  overlayBloqueo.style.display = 'none';
});

btnCerrarAdmin.addEventListener('click', () => {
  popupAdmin.style.display = 'none';
  overlayBloqueo.style.display = 'none';
});

btnCerrarAuthAdmin.addEventListener('click', () => {
  popupAuthAdmin.style.display = 'none';
  overlayBloqueo.style.display = 'none';
});

// Cuando el usuario se autentica correctamente y se muestra el popup admin,
// el overlay debe seguir visible hasta que cierre el popup admin.
formAuthAdmin.addEventListener('submit', (e) => {
  e.preventDefault();
  const usuario = document.getElementById('admin-usuario').value.trim();
  const password = document.getElementById('admin-password').value;
  if (usuario === 'admin' && password === 'admin') {
    popupAuthAdmin.style.display = 'none';
    mostrarAdmin('usuarios');
    popupAdmin.style.display = 'block';
    // overlayBloqueo sigue visible
  } else {
    authAdminError.textContent = 'Usuario o contraseña incorrectos.';
    authAdminError.style.display = 'block';
  }
});

// Cerrar popup
btnCerrarAjustes.addEventListener('click', () => {
  popupAjustes.style.display = 'none';
});

// Cambiar de sección al hacer click en un icono
ajustesIconos.forEach(btn => {
  btn.addEventListener('click', () => {
    ajustesIconos.forEach(b => b.style.background = 'none');
    btn.style.background = '#333';
    mostrarAjuste(btn.dataset.ajuste);
  });
});

// Función para mostrar el contenido de la sección seleccionada
function mostrarAjuste(seccion) {
  ajustesContenido.innerHTML = ajustesVistas[seccion] || '';
  ajustesIconos.forEach(btn => {
    btn.style.background = (btn.dataset.ajuste === seccion) ? '#333' : 'none';
  });
}

const adminVistas = {
  usuarios: `<h2>Usuarios</h2><p>Gestión de usuarios administradores.</p>`,
  logs: `<h2>Registros</h2><p>Historial de acciones y eventos.</p>`,
  config: `<h2>Configuración</h2><p>Opciones avanzadas de configuración.</p>`
};

// Mostrar popup de autenticación al hacer click en el icono admin
iconAdmin.addEventListener('click', () => {
  popupAuthAdmin.style.display = 'block';
  formAuthAdmin.reset();
  authAdminError.style.display = 'none';
});

// Cerrar popup de autenticación
btnCerrarAuthAdmin.addEventListener('click', () => {
  popupAuthAdmin.style.display = 'none';
});

// Validar usuario y contraseña (dummy, puedes cambiar la lógica después)
formAuthAdmin.addEventListener('submit', (e) => {
  e.preventDefault();
  const usuario = document.getElementById('admin-usuario').value.trim();
  const password = document.getElementById('admin-password').value;
  // Aquí pondrás la validación real contra la base de datos
  if (usuario === 'admin' && password === 'admin') {
    popupAuthAdmin.style.display = 'none';
    mostrarAdmin('usuarios');
    popupAdmin.style.display = 'block';
  } else {
    authAdminError.textContent = 'Usuario o contraseña incorrectos.';
    authAdminError.style.display = 'block';
  }
});

// Cerrar popup admin
btnCerrarAdmin.addEventListener('click', () => {
  popupAdmin.style.display = 'none';
});

// Cambiar de sección admin al hacer click en un icono
adminIconos.forEach(btn => {
  btn.addEventListener('click', () => {
    adminIconos.forEach(b => b.style.background = 'none');
    btn.style.background = '#333';
    mostrarAdmin(btn.dataset.admin);
  });
});

// Función para mostrar el contenido de la sección seleccionada
function mostrarAdmin(seccion) {
  adminContenido.innerHTML = adminVistas[seccion] || '';
  adminIconos.forEach(btn => {
    btn.style.background = (btn.dataset.admin === seccion) ? '#333' : 'none';
  });
}