// renderer.js actualizado con vista de video y recomendados
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
const btnRegresar = document.getElementById('btn-regresar');

let videosOriginales = [];
let carpetaSeleccionada = null;

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
    const tituloSinExtension = video.titulo.replace(/\.[^/.]+$/, "");
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
  if (iconRegresarSidebar) iconRegresarSidebar.style.display = 'block';
  if (iconBuscar) iconBuscar.style.display = 'none';
}

btnRegresar.addEventListener('click', () => {
  seccionReproductor.style.display = 'none';
  grid.style.display = 'grid';
  player.pause();
  player.src = '';

  // Restaurar íconos del sidebar
  if (iconRegresarSidebar) iconRegresarSidebar.style.display = 'none';
  if (iconBuscar) iconBuscar.style.display = 'block';
});

iconRegresarSidebar.addEventListener('click', () => {
  btnRegresar.click(); // Dispara el mismo efecto del botón principal
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
    titulo.textContent = video.titulo.replace(/\.[^/.]+$/, "");

    card.appendChild(img);
    card.appendChild(titulo);

    card.onclick = () => mostrarVistaReproductor(video);

    recomendadosGrid.appendChild(card);
  });
}

const iconBuscar = document.getElementById('icon-buscar');
// Cambia searchFilters a filtrosBarra para que funcione con el nuevo id

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
