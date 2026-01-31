const juegos = [
  {
    titulo: "Castillo Mogeko",
    genero: "terror",
    descripcion: "Juego de terror psicologico creado por Deep-Sea Prisoner.",
    instrucciones: "Extrae el parche y copialo en la carpeta del juego.",
    imagen: "https://i.imgur.com/v5Z4GxN.jpg",
    descarga: "https://ejemplo.com/descarga",
  },
];

const contenedor = document.getElementById("juegos");
const filtroGenero = document.getElementById("filterGenero");
const search = document.getElementById("search");
const clearBtn = document.getElementById("clearFilters");

/* MODALS */
const gameModal = document.getElementById("gameModal");
const modalBg = document.getElementById("modalBg");

function closeWarning() {
  document.getElementById("warning").classList.remove("active");
}

function closeGame() {
  gameModal.classList.remove("active");
}

/* Cargar generos */
function cargarGeneros() {
  const generos = new Set(juegos.map((j) => j.genero));
  generos.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    filtroGenero.appendChild(opt);
  });
}

/* Mostrar juegos */
function mostrarJuegos(lista) {
  contenedor.innerHTML = "";
  lista.forEach((juego) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${juego.imagen}">
      <h3>${juego.titulo}</h3>
    `;

    card.onclick = () => abrirModal(juego);
    contenedor.appendChild(card);
  });
}

function abrirModal(juego) {
  document.getElementById("modalTitulo").textContent = juego.titulo;
  document.getElementById("modalDescripcion").textContent = juego.descripcion;
  document.getElementById("modalInstrucciones").textContent =
    juego.instrucciones;
  document.getElementById("modalDescarga").href = juego.descarga;

  modalBg.style.backgroundImage = `url(${juego.imagen})`;
  gameModal.classList.add("active");
}

/* Filtros */
function aplicarFiltros() {
  let resultado = juegos;

  if (filtroGenero.value !== "todos") {
    resultado = resultado.filter((j) => j.genero === filtroGenero.value);
  }

  if (search.value.trim() !== "") {
    resultado = resultado.filter((j) =>
      j.titulo.toLowerCase().includes(search.value.toLowerCase()),
    );
  }

  mostrarJuegos(resultado);
}

filtroGenero.addEventListener("change", aplicarFiltros);
search.addEventListener("input", aplicarFiltros);

clearBtn.addEventListener("click", () => {
  filtroGenero.value = "todos";
  search.value = "";
  mostrarJuegos(juegos);
});

/* INIT */
cargarGeneros();
mostrarJuegos(juegos);
