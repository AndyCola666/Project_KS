// renderer.js limpio y corregido con sistema de fila y mini reproductor funcional

// Referencias
const btn = document.getElementById('boton-carpeta');
const grid = document.getElementById('grid-videos');
const player = document.getElementById('player');
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
    inputBusqueda.focus();
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

    card.appendChild(img);
    card.appendChild(titulo);

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
    // Si el video ya está en la fila, no lo agregues de nuevo
    if (filaReproduccion.some(v => v.ruta === video.ruta)) {
      alert('Ya está en la fila.');
      menu.remove();
      return;
    }

    // Encuentra la posición del video actual en la fila (si está)
    let indexActual = filaReproduccion.findIndex(v => v.ruta === videoActualRuta);

    // Si el video actual NO está en la fila pero hay un video sonando, inserta después del actual
    if (videoActualRuta && indexActual === -1 && player.src) {
      // Si la fila está vacía, simplemente agrega el video
      if (filaReproduccion.length === 0) {
        filaReproduccion.push(video);
      } else {
        // Inserta como siguiente a reproducir
        filaReproduccion.splice(1, 0, video);
      }
    } else if (indexActual !== -1) {
      // Insertar después del video actual
      filaReproduccion.splice(indexActual + 1, 0, video);
    } else {
      // Si no hay video actual, agrega al final
      filaReproduccion.push(video);
    }

    alert('Agregado a la fila.');
    menu.remove();
  };

  // Elimina el menú contextual si el usuario hace click fuera de él
  document.addEventListener('click', function handler(e) {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', handler);
    }
  });
}


iconFila.addEventListener('click', () => {
  if (filaReproduccion.length === 0) {
    alert('No hay canciones en la fila');
    return;
  }
  // Solo muestra el menú de la fila como popup
  vistaFila.style.display = 'block';
  // No ocultes grid ni seccionReproductor
  listaFila.innerHTML = '';
  filaReproduccion.forEach((video, i) => {
    const li = document.createElement('li');
    li.textContent = video.titulo.replace(/\.[^/.]+$/, "");
    li.onclick = () => {
      vistaFila.style.display = 'none';
      reproducirDesdeFila(i);
    };
    listaFila.appendChild(li);
  });
});

// Para cerrar el menú de la fila:
btnCerrarFila.addEventListener('click', () => {
  vistaFila.style.display = 'none';
  // No muestres el grid aquí, solo cierra el popup
});

btnReproducirFila.addEventListener('click', () => {
  vistaFila.style.display = 'none';
  reproducirDesdeFila(0);
});

function reproducirDesdeFila(indice) {
  if (indice >= filaReproduccion.length) return;
  const video = filaReproduccion[indice];

  if (modoMiniPlayer) {
    miniPlayer.appendChild(player);
    miniPlayer.style.display = 'block';
    seccionReproductor.style.display = 'none';
    grid.style.display = 'grid'; // o como prefieras
  } else {
    videoPrincipal.appendChild(player);
    seccionReproductor.style.display = 'block';
    grid.style.display = 'none';
    miniPlayer.style.display = 'none';
  }

  player.src = video.ruta;
  player.play();
  videoActualRuta = video.ruta;

  player.onended = () => {
    filaReproduccion.shift();
    if (filaReproduccion.length === 0) {
      player.pause();
      player.src = '';
      if (modoMiniPlayer) {
        miniPlayer.style.display = 'none';
      } else {
        grid.style.display = 'grid';
        seccionReproductor.style.display = 'none';
      }
      return;
    }
    reproducirDesdeFila(0);
  };
}

// Además, cuando termina un video que NO está en la fila, revisa si hay fila:
player.addEventListener('ended', () => {
  if (filaReproduccion.length > 0) {
    reproducirDesdeFila(0);
  }
});