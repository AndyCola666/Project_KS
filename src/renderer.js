// renderer.js actualizado
const btn = document.getElementById('boton-carpeta');
const grid = document.getElementById('grid-videos');
const player = document.getElementById('player');
const contenedorPlayer = document.getElementById('contenedor-player');
const inputBusqueda = document.getElementById('busqueda');
const filtroGenero = document.getElementById('filtro-genero');
const filtroArtista = document.getElementById('filtro-artista');
const filtroAño = document.getElementById('filtro-año');
const btnActualizar = document.getElementById('boton-actualizar');

let videosOriginales = [];
let carpetaSeleccionada = null;

document.getElementById('boton-carpeta').addEventListener('click', async () => {
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

inputBusqueda.addEventListener('input', aplicarFiltros);
filtroGenero.addEventListener('change', aplicarFiltros);
filtroArtista.addEventListener('change', aplicarFiltros);
filtroAño.addEventListener('change', aplicarFiltros);

function construirFiltros(videos) {
  const generos = new Set();
  const artistas = new Set();
  const años = new Set();

  videos.forEach(video => {
    if (video.genero) generos.add(video.genero);
    if (video.artista) artistas.add(video.artista);
    if (video.año) años.add(video.año);
  });

  poblarSelect(filtroGenero, generos);
  poblarSelect(filtroArtista, artistas);
  poblarSelect(filtroAño, años);
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
  const generoSel = filtroGenero.value;
  const artistaSel = filtroArtista.value;
  const añoSel = filtroAño.value;

  const filtrados = videosOriginales.filter(video => {
    const coincideTexto = video.titulo.toLowerCase().includes(texto);
    const coincideGenero = !generoSel || video.genero === generoSel;
    const coincideArtista = !artistaSel || video.artista === artistaSel;
    const coincideAño = !añoSel || video.año === añoSel;
    return coincideTexto && coincideGenero && coincideArtista && coincideAño;
  });

  mostrarVideos(filtrados);
}

function mostrarVideos(videos) {
  grid.innerHTML = '';

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

    card.onclick = () => {
      player.src = video.ruta;
      contenedorPlayer.style.display = 'block';
      player.scrollIntoView({ behavior: 'smooth' });
      player.load();
      player.play();
    };

    grid.appendChild(card);
  });
}

document.getElementById('icon-buscar').addEventListener('click', () => {
  const searchFilters = document.getElementById('search-filters');
  searchFilters.style.display = 'flex';
  document.getElementById('busqueda').focus();
});