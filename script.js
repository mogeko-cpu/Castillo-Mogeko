const juegosContainer = document.getElementById("juegos");
const filterGenero = document.getElementById("filterGenero");
const searchInput = document.getElementById("search");
const clearFiltersBtn = document.getElementById("clearFilters");

const warningModal = document.getElementById("warning");
const acceptWarningBtn = document.getElementById("acceptWarning");

const gameModal = document.getElementById("gameModal");
const closeGameBtn = document.getElementById("closeGame");

let juegos = [];

acceptWarningBtn.addEventListener("click", () => {
  warningModal.classList.remove("active");
});

closeGameBtn.addEventListener("click", () => {
  gameModal.classList.remove("active");
});

fetch("data/juegos.json")
  .then((res) => res.json())
  .then((data) => {
    juegos = data;
    cargarGeneros();
    mostrarJuegos(juegos);
  });

function cargarGeneros() {
  const generos = new Set();

  juegos.forEach((j) => j.generos.forEach((g) => generos.add(g)));

  generos.forEach((g) => {
    const option = document.createElement("option");
    option.value = g;
    option.textContent = g;
    filterGenero.appendChild(option);
  });
}

function mostrarJuegos(lista) {
  juegosContainer.innerHTML = "";

  lista.forEach((juego) => {
    const card = document.createElement("div");
    card.className = "card" + (juego.adult ? " adult" : "");

    card.innerHTML = `
      <img src="${juego.imagen}">
      <h4>${juego.titulo}</h4>
    `;

    card.onclick = () => abrirJuego(juego);
    juegosContainer.appendChild(card);
  });
}

function abrirJuego(juego) {
  document.getElementById("modalTitulo").textContent = juego.titulo;
  document.getElementById("modalDescripcion").textContent =
    juego.descripcionLarga;
  document.getElementById("modalInstrucciones").textContent =
    juego.instrucciones;
  document.getElementById("modalDescarga").href = juego.descarga;
  document.getElementById("modalBg").style.backgroundImage =
    `url(${juego.imagen})`;

  gameModal.classList.add("active");
}

function aplicarFiltros() {
  let resultado = juegos;

  const texto = searchInput.value.toLowerCase();
  const genero = filterGenero.value;

  if (texto) {
    resultado = resultado.filter((j) => j.titulo.toLowerCase().includes(texto));
  }

  if (genero !== "todos") {
    resultado = resultado.filter((j) => j.generos.includes(genero));
  }

  mostrarJuegos(resultado);
}

searchInput.addEventListener("input", aplicarFiltros);
filterGenero.addEventListener("change", aplicarFiltros);

clearFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterGenero.value = "todos";
  mostrarJuegos(juegos);
});
