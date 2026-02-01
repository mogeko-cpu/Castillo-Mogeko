let juegosData = [];

/* Bloquear scroll por advertencia */
document.body.classList.add("modal-open");

/* Cargar juegos */
fetch("data/juegos.json")
  .then((res) => res.json())
  .then((data) => {
    juegosData = data;
    cargarGeneros(data);
    mostrarJuegos(data);
  })
  .catch((err) => console.error("Error cargando JSON:", err));

/* ===== MOSTRAR CARDS ===== */
function mostrarJuegos(lista) {
  const contenedor = document.getElementById("juegos");
  contenedor.innerHTML = "";

  lista.forEach((juego) => {
    const card = document.createElement("div");
    card.className = "card";
    card.onclick = () => abrirJuego(juego);

    const img = document.createElement("img");
    img.src = juego.imagen;
    img.alt = juego.titulo;

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

/* ===== ABRIR MODAL ===== */
function abrirJuego(juego) {
  /* Texto */
  document.getElementById("modalTitulo").textContent = juego.titulo;
  document.getElementById("modalDescripcion").textContent =
    juego.descripcionLarga || juego.descripcionCorta;
  document.getElementById("modalInstrucciones").textContent =
    juego.instrucciones || "";

  /* Imagen */
  document.getElementById("modalImagen").src = juego.imagen;

  /* +18 */
  const adultBadge = document.getElementById("modalAdult");
  adultBadge.style.display = juego.adult ? "block" : "none";

  /* Generos */
  document.getElementById("modalGeneros").textContent =
    "Generos: " + juego.generos.join(", ");

  /* ===== CREADOR (LINK) ===== */
  const creador = document.getElementById("modalCreador");
  creador.textContent = juego.Creador || "Desconocido";

  if (juego.creadorUrl) {
    creador.href = juego.creadorUrl;
    creador.style.pointerEvents = "auto";
    creador.style.opacity = "1";
  } else {
    creador.removeAttribute("href");
    creador.style.pointerEvents = "none";
    creador.style.opacity = "0.6";
  }

  /* ===== BOTON DESCARGA ===== */
  const descargaBtn = document.getElementById("modalDescarga");
  descargaBtn.href = juego.descarga;

  /* ===== JUEGO ORIGINAL ===== */
  const originalBtn = document.getElementById("modalOriginal");
  if (juego.juegoOriginal) {
    originalBtn.href = juego.juegoOriginal;
    originalBtn.style.display = "inline-block";
  } else {
    originalBtn.style.display = "none";
  }

  /* Mostrar modal */
  document.getElementById("gameModal").classList.add("active");
  document.body.classList.add("modal-open");
}

/* ===== CERRAR MODAL ===== */
function closeGame() {
  document.getElementById("gameModal").classList.remove("active");
  document.body.classList.remove("modal-open");
}

/* ===== CERRAR ADVERTENCIA ===== */
function closeWarning() {
  document.getElementById("warning").classList.remove("active");
  document.body.classList.remove("modal-open");
}

/* ===== GENEROS ===== */
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

  select.addEventListener("change", aplicarFiltros);
}

/* ===== BUSCADOR INDEPENDIENTE ===== */
document.getElementById("search").addEventListener("input", aplicarFiltros);

/* ===== LIMPIAR FILTROS ===== */
document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("filterGenero").value = "todos";
  document.getElementById("search").value = "";
  mostrarJuegos(juegosData);
});

/* ===== APLICAR FILTROS ===== */
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
