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
const miniPlayer = document.getElementById('mini-player');
const miniClose = document.getElementById('mini-close');
const miniPause = document.getElementById('mini-pause');
const miniExpand = document.getElementById('mini-expand');
const videoPrincipal = document.getElementById('video-principal');

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

iconRegresarSidebar.addEventListener('click', () => {
  miniPlayer.appendChild(player);
  miniPlayer.style.display = 'block';
  modoMiniPlayer = true;
  seccionReproductor.style.display = 'none';
  grid.style.display = 'grid';
  iconRegresarSidebar.style.display = 'none';
  iconBuscar.style.display = 'block';
});

miniPause.addEventListener('click', (e) => {
  e.stopPropagation();
  if (player.paused) player.play();
  else player.pause();
});

miniClose.addEventListener('click', (e) => {
  e.stopPropagation();
  // Verifica si el video actual está en la fila
  const indexEnFila = filaReproduccion.findIndex(v => v.ruta === videoActualRuta);
  if (indexEnFila !== -1) {
    const confirmacion = confirm('Esta canción está en la fila, ¿Deseas eliminarla?');
    if (confirmacion) {
      filaReproduccion.splice(indexEnFila, 1);
      mostrarVistaFila(); // Opcional: actualiza la vista de la fila si está abierta
    }
  }
  player.pause();
  player.src = '';
  miniPlayer.style.display = 'none';
  modoMiniPlayer = false;
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
    alert('Ya está en la fila.');
    menu.remove();
    return;
  }
    filaReproduccion.push(video);

  alert('Agregado a la fila.');
  menu.remove();
  mostrarVistaFila(); // Opcional: actualiza la vista de la fila si está abierta
};
  let indexActual = filaReproduccion.findIndex(v => v.ruta === videoActualRuta);

  if (indexActual !== -1) {
    // Insertar después del video actual
    filaReproduccion.splice(indexActual + 1, 0, video);
  } else {
    // Si no hay video actual en la fila, agrega al final
    filaReproduccion.push(video);
  }


};

  // Elimina el menú contextual si el usuario hace click fuera de él
  document.addEventListener('click', (e) => {
  const menu = document.getElementById('menu-contextual');
  if (menu && !menu.contains(e.target)) {
    menu.remove();
  }
});

function mostrarVistaFila() {
  listaFila.innerHTML = '';
  filaReproduccion.forEach((video, i) => {
    const li = document.createElement('li');
    const tituloLimpio = video.titulo.replace(/\.[^/.]+$/, "");
    const esActual = video.ruta === videoActualRuta;

    li.innerHTML = `
      <strong>${tituloLimpio}</strong> ${esActual ? '🎵 <em style="color: lime;">(Ahora sonando)</em>' : ''}`;

    li.onclick = () => {
  vistaFila.style.display = 'none';
  indiceActualFila = i;
  reproducirDesdeFila(i);
};

    li.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const confirmacion = confirm(`¿Eliminar "${tituloLimpio}" de la fila?`);
      if (!confirmacion) return;

      if (video.ruta === videoActualRuta) {
        player.pause();
        player.src = '';
        filaReproduccion.splice(i, 1);
        if (filaReproduccion.length > 0) {
          reproducirDesdeFila(0);
        } else {
          alert('No hay más canciones en la fila.');
          vistaFila.style.display = 'none';
          grid.style.display = 'grid';
        }
      } else {
        filaReproduccion.splice(i, 1);
      }

      mostrarVistaFila(); // Recarga
    });

    listaFila.appendChild(li);
  });

  vistaFila.style.display = 'block';
}


iconFila.addEventListener('click', () => {
  if (filaReproduccion.length === 0) {
    alert('No hay canciones en la fila');
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
}

// Listener global:
player.addEventListener('ended', () => {
  if (filaReproduccion.length > 0) {
    // Elimina el primero de la fila y reproduce el siguiente
    filaReproduccion.shift();
    mostrarVistaFila();
    reproducirDesdeFila();
  }
});