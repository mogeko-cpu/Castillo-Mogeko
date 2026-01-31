let juegosData = [];

/* Bloquear scroll por advertencia inicial */
document.body.classList.add("modal-open");

fetch("data/juegos.json")
  .then((res) => res.json())
  .then((data) => {
    juegosData = data;
    cargarGeneros(data);
    mostrarJuegos(data);
  });

function mostrarJuegos(lista) {
  const contenedor = document.getElementById("juegos");
  contenedor.innerHTML = "";

  lista.forEach((juego) => {
    const card = document.createElement("div");
    card.className = "card";
    card.onclick = () => abrirJuego(juego);

    const img = document.createElement("img");
    img.src = juego.imagen;

    if (juego.adult) {
      img.classList.add("blur");

      const badge = document.createElement("div");
      badge.className = "badge";
      badge.textContent = "+18";
      card.appendChild(badge);
    }

    const title = document.createElement("h3");
    title.textContent = juego.titulo;

    card.append(img, title);
    contenedor.appendChild(card);
  });
}

function abrirJuego(juego) {
  document.getElementById("modalTitulo").textContent = juego.titulo;
  document.getElementById("modalDescripcion").textContent =
    juego.descripcionCorta;
  document.getElementById("modalInstrucciones").textContent =
    juego.instrucciones;
  document.getElementById("modalDescarga").href = juego.descarga;

  /* Imagen fondo modal */
  document.getElementById("modalBgImage").src = juego.imagen;

  /* +18 */
  const adultBadge = document.getElementById("modalAdult");
  adultBadge.style.display = juego.adult ? "block" : "none";

  document.getElementById("gameModal").classList.add("active");
  document.body.classList.add("modal-open");
}

function closeGame() {
  document.getElementById("gameModal").classList.remove("active");
  document.body.classList.remove("modal-open");
}

function closeWarning() {
  document.getElementById("warning").classList.remove("active");
  document.body.classList.remove("modal-open");
}

function cargarGeneros(data) {
  const select = document.getElementById("filterGenero");
  const generos = new Set();

  data.forEach((j) => j.generos.forEach((g) => generos.add(g)));

  generos.forEach((g) => {
    const option = document.createElement("option");
    option.value = g;
    option.textContent = g;
    select.appendChild(option);
  });

  select.onchange = aplicarFiltros;
}

/* Buscador */
document.getElementById("search").addEventListener("input", aplicarFiltros);

/* Limpiar filtros */
document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("filterGenero").value = "todos";
  document.getElementById("search").value = "";
  mostrarJuegos(juegosData);
});

function aplicarFiltros() {
  const genero = document.getElementById("filterGenero").value;
  const texto = document.getElementById("search").value.toLowerCase();

  let filtrados = juegosData;

  if (genero !== "todos") {
    filtrados = filtrados.filter((j) => j.generos.includes(genero));
  }

  if (texto) {
    filtrados = filtrados.filter((j) => j.titulo.toLowerCase().includes(texto));
  }

  mostrarJuegos(filtrados);
}
