// renderer.js actualizado con vista de video, recomendados y sistema de fila
const btn = document.getElementById('boton-carpeta');
const grid = document.getElementById('grid-videos');
const player = document.getElementById('player');
const contenedorPlayer = document.getElementById('contenedor-player');
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
const miniVideo = document.getElementById('mini-video');
const btnCerrarMini = document.getElementById('btn-cerrar-mini');


let videosOriginales = [];
let carpetaSeleccionada = null;
let filaReproduccion = [];
let indexActualFila = 0;

btn.addEventListener('click', async () => {
  const resultado = await window.api.seleccionarCarpeta();
  if (resultado && resultado.videos) {
    videosOriginales = resultado.videos;
    carpetaSeleccionada = resultado.ruta;
    construirFiltros(videosOriginales);
    mostrarVideos(videosOriginales);
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
  const artistas = new Set();
  const años = new Set();

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
    const tituloSinExtension = video.titulo.replace(/\\.[^/.]+$/, "");
    titulo.textContent = tituloSinExtension;

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

    card.onclick = () => mostrarVistaReproductor(video);
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      mostrarMenuContextual(e.pageX, e.pageY, video);
    });

    grid.appendChild(card);
  });
}

function mostrarVistaReproductor(video) {
  seccionReproductor.style.display = 'block';
  grid.style.display = 'none';
  player.src = video.ruta;
  player.load();
  player.play();
  llenarRecomendados(video);

  filtrosBarra.style.display = 'none';
  if (iconBuscar) iconBuscar.style.display = 'none';
  if (iconRegresarSidebar) iconRegresarSidebar.style.display = 'block';

  const placeholder2 = document.getElementById('icon-concurso');
  if (placeholder2) placeholder2.style.display = 'none';
}

iconRegresarSidebar.addEventListener('click', () => {
  if (!player.src) return;

  const videoActual = filaReproduccion.length > 0 ? filaReproduccion[indexActualFila] : null;
  // Si está en fila, usar esa canción, si no usar video del reproductor
  const videoParaMini = videoActual || { ruta: player.src };

  activarMiniPlayer(videoParaMini);

  player.pause();
  player.src = '';
});

function llenarRecomendados(videoBase) {
  recomendadosGrid.innerHTML = '';
  const similares = videosOriginales.filter(v => {
    return (
      v.ruta !== videoBase.ruta &&
      (v.artista === videoBase.artista ||
       v.genero === videoBase.genero ||
       v.album === videoBase.album)
    );
  }).slice(0, 10);

  similares.forEach(video => {
    const card = document.createElement('div');
    card.classList.add('card');

    const img = document.createElement('img');
    img.src = video.imagen ? `file://${video.imagen}` : 'https://via.placeholder.com/300x170/000000/ffffff?text=Video';
    img.alt = video.titulo;

    const titulo = document.createElement('h3');
    titulo.textContent = video.titulo.replace(/\\.[^/.]+$/, "");

    card.appendChild(img);
    card.appendChild(titulo);

    card.onclick = () => mostrarVistaReproductor(video);
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      mostrarMenuContextual(e.pageX, e.pageY, video);
    });

    recomendadosGrid.appendChild(card);
  });
}

iconBuscar.addEventListener('click', () => {
  const estaVisible = filtrosBarra.style.display === 'flex';
  filtrosBarra.style.display = estaVisible ? 'none' : 'flex';
  if (!estaVisible) {
    inputBusqueda.focus();
  }
});

const sidebar = document.querySelector('.sidebar');
sidebar.addEventListener('mouseenter', () => {
  document.body.classList.add('sidebar-expanded');
});
sidebar.addEventListener('mouseleave', () => {
  document.body.classList.remove('sidebar-expanded');
});

// Menú contextual
const menuContextual = document.createElement('div');
menuContextual.id = 'menu-contextual';
menuContextual.style.position = 'absolute';
menuContextual.style.background = '#222';
menuContextual.style.padding = '10px';
menuContextual.style.borderRadius = '6px';
menuContextual.style.display = 'none';
menuContextual.style.zIndex = 9999;
document.body.appendChild(menuContextual);

function mostrarMenuContextual(x, y, video) {
  menuContextual.innerHTML = '';

  const opcionAgregar = document.createElement('div');
  opcionAgregar.textContent = 'Agregar canción a la fila';
  opcionAgregar.style.cursor = 'pointer';
  opcionAgregar.style.color = '#fff';
  opcionAgregar.onclick = () => {
    filaReproduccion.push(video);
    alert('Canción agregada a la fila.');
    menuContextual.style.display = 'none';
  };

  menuContextual.appendChild(opcionAgregar);
  menuContextual.style.left = `${x}px`;
  menuContextual.style.top = `${y}px`;
  menuContextual.style.display = 'block';
}

document.addEventListener('click', () => {
  menuContextual.style.display = 'none';
});

iconFila.addEventListener('click', () => {
  if (filaReproduccion.length === 0) {
    alert('No hay canciones en la fila');
    return;
  }
  mostrarVistaFila();
});

function activarMiniPlayer(video) {
  // Si ya está mostrando el mismo video y no está oculto, no reiniciar
  if (miniPlayer.style.display === 'block' && miniVideo.src === video.ruta) {
    miniPlayer.style.display = 'block';
    miniVideo.play();
    return;
  }
  miniPlayer.style.display = 'block';
  if (miniVideo.src !== video.ruta) {
    miniVideo.src = video.ruta;
    miniVideo.load();
  }
  miniVideo.play();
  // Ocultar reproductor principal y grid
  seccionReproductor.style.display = 'none';
  grid.style.display = 'grid';
  if (iconRegresarSidebar) iconRegresarSidebar.style.display = 'none';
  if (iconBuscar) iconBuscar.style.display = 'block';
}

btnCerrarMini.addEventListener('click', (e) => {
  e.stopPropagation();
  miniPlayer.style.display = 'none';
  miniVideo.pause();
});

function reproducirDesdeFila(indice) {
  if (indice >= filaReproduccion.length) return;
  const video = filaReproduccion[indice];
  mostrarVistaReproductor(video);
player.onended = () => {
  // Eliminar la canción que acaba de terminar
  filaReproduccion.shift(); // elimina el primer elemento (la que se reprodujo)
  
  if (filaReproduccion.length === 0) {
    // Fin de fila: parar reproducción y volver al grid
    player.pause();
    player.src = '';
    seccionReproductor.style.display = 'none';
    grid.style.display = 'grid';

    if (iconRegresarSidebar) iconRegresarSidebar.style.display = 'none';
    if (iconBuscar) iconBuscar.style.display = 'block';

    const placeholder2 = document.getElementById('icon-concurso');
    if (placeholder2) placeholder2.style.display = 'block';

    alert('La fila ha terminado.');
    return;
  }

  // Reproducir siguiente video en la fila
  reproducirDesdeFila(0); // siempre 0 porque shift mueve la fila
};

iconFila.addEventListener('click', () => {
  if (filaReproduccion.length === 0) {
    alert('No hay canciones en la fila');
    return;
  }
  mostrarVistaFila();
});

btnReproducirFila.addEventListener('click', () => {
  vistaFila.style.display = 'none';
  indexActualFila = 0;
  reproducirDesdeFila(indexActualFila);
});

btnCerrarFila.addEventListener('click', () => {
  vistaFila.style.display = 'none';
  grid.style.display = 'grid';
});

function mostrarVistaFila() {
  // Oculta otras vistas
  grid.style.display = 'none';
  seccionReproductor.style.display = 'none';

  // Limpiar y mostrar lista actual
  listaFila.innerHTML = '';
  filaReproduccion.forEach((video, i) => {
    const li = document.createElement('li');
    li.style.borderBottom = '1px solid #444';
    li.style.padding = '10px 0';

    li.innerHTML = `
      <strong>${video.titulo.replace(/\.[^/.]+$/, "")}</strong><br>
      Artista: ${video.artista || 'Desconocido'}<br>
      Álbum: ${video.album || 'Desconocido'}<br>
      Género: ${video.genero || 'Desconocido'}
    `;

    li.style.cursor = 'pointer';
    li.title = 'Hacer click para reproducir esta canción';

    li.addEventListener('click', () => {
      vistaFila.style.display = 'none';
      reproducirDesdeFila(i);
    });

    listaFila.appendChild(li);
  });

  vistaFila.style.display = 'block';
}
}