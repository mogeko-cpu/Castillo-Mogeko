let juegosData = [];

/* Al cargar, bloquear scroll por advertencia */
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

  /* Imagen */
  const bgImg = document.getElementById("modalBgImage");
  bgImg.src = juego.imagen;

  /* +18 */
  const adultBadge = document.getElementById("modalAdult");
  adultBadge.style.display = juego.adult ? "block" : "none";

  /* Generos */
  document.getElementById("modalGeneros").textContent =
    "Generos: " + juego.generos.join(", ");

  /* CREADOR (LINK) */
  const creadorLink = document.getElementById("modalCreador");
  creadorLink.textContent = juego.creador || "Desconocido";

  if (juego.creadorUrl) {
    creadorLink.href = juego.creadorUrl;
    creadorLink.style.pointerEvents = "auto";
    creadorLink.style.opacity = "1";
  } else {
    creadorLink.removeAttribute("href");
    creadorLink.style.pointerEvents = "none";
    creadorLink.style.opacity = "0.6";
  }

  /* JUEGO ORIGINAL */
  const originalBtn = document.getElementById("modalOriginal");
  if (juego.juegoOriginal) {
    originalBtn.href = juego.juegoOriginal;
    originalBtn.style.display = "block";
  } else {
    originalBtn.style.display = "none";
  }

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

/* Buscador independiente */
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
