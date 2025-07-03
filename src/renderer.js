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
const selectVista = document.getElementById('select-grid-vista');


let videosOriginales = [];
let carpetaSeleccionada = null;
let videoActualRuta = null;
let filaReproduccion = [];
let indexActualFila = 0;
let modoMiniPlayer = false;
let adminActual = null; // Guarda el usuario admin logueado

iconBuscar.addEventListener('click', () => {
  // Solo mostrar la barra si el grid está visible (opcional)
  if (grid.style.display === 'grid' || grid.style.display === '') {
    filtrosBarra.style.display = (filtrosBarra.style.display === 'flex') ? 'none' : 'flex';

  }
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

  const vista = localStorage.getItem('vistaGrid') || 'normal';
  // Limpia clases previas
  grid.className = 'grid';
  if (vista === 'mosaico') {
    grid.classList.add('mosaico');
  }

  // Lee el estado del switch
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
  confirmDiv.style.zIndex = 20000;
  confirmDiv.style.display = 'flex';
  confirmDiv.style.flexDirection = 'column';
  confirmDiv.style.alignItems = 'center';
  confirmDiv.style.gap = '18px';

  const msg = document.createElement('div');
  msg.innerHTML = mensaje;
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
  general: `    <h2>General</h2>
    <div style="margin-bottom:18px;">
      <label style="display:flex;align-items:center;gap:12px;">
        <input type="checkbox" id="chk-animaciones">
        Animaciones <span style="font-size:12px;color:#aaa;">(placeholder)</span>
      </label>
    </div>
    <div style="margin-bottom:18px;">
      <label style="display:flex;align-items:center;gap:12px;">
        <input type="checkbox" id="chk-info-canciones" checked>
        Información de canciones
      </label>
    </div>
    <div style="margin-bottom:18px;">
      <label style="display:flex;align-items:center;gap:12px;">
        <input type="checkbox" id="chk-musica-fondo">
        Música de fondo <span style="font-size:12px;color:#aaa;">(placeholder)</span>
      </label>
    </div>`,
  tema: `  <h2>Tema</h2>
    <div style="margin-bottom:18px;">
      <label for="select-fondo">Fondo de pantalla:</label>
      <select id="select-fondo"> 
        <option value="default">Predeterminado</option>
        <option value="fondo1">Fondo 1</option>
        <option value="fondo2">Fondo 2</option>
        <option value="fondo3">Fondo 3</option>
      </select>
    </div>
    <div style="margin-bottom:18px;">
      <label for="select-grid-vista">Vista del grid:</label>
      <select id="select-grid-vista">
        <option value="normal">Predeterminada</option>
        <option value="compacta">Compacta</option>
        <option value="detallada">Detallada</option>
        <option value="mosaico">Estilo mosaico (Windows 8)</option>
      </select>
    </div>`,
  info: `<h2>Información</h2><p>Versión, créditos y ayuda.</p>`
};



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
formAuthAdmin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usuario = document.getElementById('admin-usuario').value.trim();
  const password = document.getElementById('admin-password').value;

  // Obtener el admin completo para guardar en adminActual
  const lista = await window.api.adminListar();
  const admin = lista.find(a => a.usuario === usuario);
  const valido = await window.api.validarAdmin(usuario, password);

  if (valido && admin) {
    adminActual = admin;
    popupAuthAdmin.style.display = 'none';
    mostrarAdmin('usuarios');
    popupAdmin.style.display = 'block';
    overlayBloqueo.style.display = 'block';
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
    if (seccion === 'general') {
    // Animaciones y música de fondo son placeholders

    // Información de canciones
    const chkInfo = document.getElementById('chk-info-canciones');
    // Guarda el estado en localStorage
    chkInfo.checked = localStorage.getItem('mostrarInfoCanciones') !== 'false';
    chkInfo.addEventListener('change', () => {
      localStorage.setItem('mostrarInfoCanciones', chkInfo.checked ? 'true' : 'false');
      mostrarVideos(videosOriginales); // Refresca el grid
    });
  }
    if (seccion === 'tema') {
    // Cambiar fondo
    const selectFondo = document.getElementById('select-fondo');
    // Cargar fondo guardado
    selectFondo.value = localStorage.getItem('fondoApp') || 'default';
    selectFondo.addEventListener('change', () => {
      localStorage.setItem('fondoApp', selectFondo.value);
      aplicarFondo(selectFondo.value);
    });
    aplicarFondo(selectFondo.value);

    // Cambiar vista del grid
    const selectVista = document.getElementById('select-grid-vista');
    selectVista.value = localStorage.getItem('vistaGrid') || 'normal';
    selectVista.addEventListener('change', () => {
      localStorage.setItem('vistaGrid', selectVista.value);
      mostrarVideos(videosOriginales);
    });
  }
}

function aplicarFondo(fondo) {
  const body = document.body;
  switch (fondo) {
    case 'fondo1':
      body.style.background = 'linear-gradient(135deg, #232526 0%, #414345 100%)';
      break;
    case 'fondo2':
      body.style.background = 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';
      break;
    case 'fondo3':
      body.style.background = 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)';
      break;
    default:
      body.style.background = '';
  }
}

const adminVistas = {
  usuarios: `<h2>Usuarios</h2><p>Gestión de usuarios administradores.</p>`,
  logs: `<h2>Registros</h2><p>Historial de acciones y eventos.</p>`,
  config: `<h2>Configuración</h2><p>Opciones avanzadas de configuración.</p>`
};

// Cerrar popup de autenticación
btnCerrarAuthAdmin.addEventListener('click', () => {
  popupAuthAdmin.style.display = 'none';
});

// Validar usuario y contraseña (dummy, puedes cambiar la lógica después)
formAuthAdmin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usuario = document.getElementById('admin-usuario').value.trim();
  const password = document.getElementById('admin-password').value;

  const valido = await window.api.validarAdmin(usuario, password);

  if (valido) {
    popupAuthAdmin.style.display = 'none';
    mostrarAdmin('usuarios');
    popupAdmin.style.display = 'block';
    overlayBloqueo.style.display = 'block';
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
    if (btn.dataset.admin === 'usuarios') {
      cargarVistaUsuarios();
    } else if (btn.dataset.admin === 'bdir') {
      cargarVistaBDyDirectorio();
    }
  });
});

// Función para mostrar el contenido de la sección seleccionada
function mostrarAdmin(seccion) {
  adminIconos.forEach(btn => {
    btn.style.background = (btn.dataset.admin === seccion) ? '#333' : 'none';
  });
  if (seccion === 'usuarios') {
    cargarVistaUsuarios();
  } else if (seccion === 'logs') {
    adminContenido.innerHTML = '<h2>Registros</h2><p>Historial de acciones y eventos.</p>';
  } else if (seccion === 'config') {
    adminContenido.innerHTML = '<h2>Configuración</h2><p>Opciones avanzadas de configuración.</p>';
  } else {
    adminContenido.innerHTML = adminVistas[seccion] || '';
  }
}

// --- Nuevas funciones para el manejo de administradores ---
async function cargarVistaUsuarios() {
  const lista = await window.api.adminListar();
  let html = `
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
  `;
  adminContenido.innerHTML = html;

  document.getElementById('btn-editar-admin-actual').onclick = mostrarEditarAdminActual;
  document.getElementById('btn-ver-admins').onclick = mostrarTablaAdmins;
  document.getElementById('btn-agregar-admin').onclick = mostrarAgregarAdmin;
  document.getElementById('btn-eliminar-admin').onclick = mostrarEliminarAdmin;
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
  let tabla = `<table style="width:100%;margin-top:10px;"><tr><th>ID</th><th>Usuario</th></tr>`;
  for (const admin of lista) {
    tabla += `<tr><td>${admin.id}</td><td>${admin.usuario}</td></tr>`;
  }
  tabla += `</table>`;
  adminContenido.querySelector('#admin-accion').innerHTML = tabla;
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

// Nueva función para cargar la vista de Base de datos y directorio
async function cargarVistaBDyDirectorio() {
  // Obtén el directorio actual (puedes guardar la última carpeta seleccionada en localStorage)
  let carpetaSeleccionada = localStorage.getItem('carpetaSeleccionada') || '';
  let html = `
    <h2>Base de datos y directorio</h2>
    <div style="margin-bottom:18px;">
      <strong>Directorio de carpetas:</strong>
      <div style="margin:8px 0;">
        <span id="directorio-actual">${carpetaSeleccionada ? carpetaSeleccionada : 'No seleccionado'}</span>
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
  adminContenido.innerHTML = html;
  //

  // Seleccionar carpeta
  document.getElementById('btn-seleccionar-carpeta').onclick = async () => {
    const resultado = await window.api.seleccionarCarpeta();
    if (resultado && resultado.ruta) {
      localStorage.setItem('carpetaSeleccionada', resultado.ruta);
      document.getElementById('directorio-actual').textContent = resultado.ruta;
      mostrarPopup('Directorio actualizado.');
    }
  };

  // Actualizar base de datos
document.getElementById('btn-actualizar-base').onclick = async () => {
  const carpeta = localStorage.getItem('carpetaSeleccionada');
  if (!carpeta) {
    mostrarPopup('Selecciona primero un directorio.');
    return;
  }
  const resultado = await window.api.actualizarBase(carpeta);
  if (resultado && resultado.length) {
    videosOriginales = resultado;
    construirFiltros(videosOriginales);
    mostrarVideos(videosOriginales);
    mostrarPopup('Base de datos actualizada.');
  } else {
    mostrarPopup('No se pudo actualizar la base de datos.', 'error');
  }
};

  // Editar metadatos 
  document.getElementById('btn-editar-metadatos').onclick = mostrarEditorMetadatos;
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
          <th>Año</th>
        </tr>
        ${videos.map(video => `
          <tr data-id="${video.id}">
            <td><input type="text" value="${video.titulo || ''}" data-original="${video.titulo || ''}" style="width:120px;"></td>
            <td><input type="text" value="${video.artista || ''}" data-original="${video.artista || ''}" style="width:80px;"></td>
            <td><input type="text" value="${video.album || ''}" data-original="${video.album || ''}" style="width:80px;"></td>
            <td><input type="text" value="${video.genero || ''}" data-original="${video.genero || ''}" style="width:80px;"></td>
            <td><input type="text" value="${video.año || ''}" data-original="${video.año || ''}" style="width:60px;"></td>
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
        año: inputs[4].value
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
          año: inputs[4].getAttribute('data-original')
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

  // Refresca los videos en memoria y el grid
  //const nuevosVideos = await window.api.videosListar();
  //videosOriginales = nuevosVideos;
  //construirFiltros(videosOriginales);
  //mostrarVideos(videosOriginales);
    });
  };
}

// Cerrar el popup de metadatos
document.getElementById('btn-cerrar-metadatos').onclick = () => {
  document.getElementById('popup-metadatos').style.display = 'none';
};

// Cargar videos al iniciar
window.addEventListener('DOMContentLoaded', async () => {
  const carpeta = localStorage.getItem('carpetaSeleccionada');
  if (carpeta) {
    const resultado = await window.api.actualizarBase(carpeta);
    if (resultado && resultado.length) {
      videosOriginales = resultado;
      construirFiltros(videosOriginales);
      mostrarVideos(videosOriginales);
    }
  }
});
// Aplicar fondo guardado al cargar
window.addEventListener('DOMContentLoaded', () => {
  aplicarFondo(localStorage.getItem('fondoApp') || 'default');
});

