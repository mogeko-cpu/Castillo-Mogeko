let juegosData = [];
let juegosFiltrados = [];
let favoritos = JSON.parse(localStorage.getItem("mogeko_favoritos")) || [];
let juegoActual = null;

/* ===== INICIALIZACIÓN ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Cargar favoritos
  actualizarContadorFavoritos();

  // Cargar juegos
  cargarJuegos();

  // Configurar event listeners
  configurarEventListeners();

  // Configurar teclas rápidas
  configurarTeclasRapidas();
});

function cargarJuegos() {
  const loading = document.getElementById("loading");
  const juegosContainer = document.getElementById("juegos");

  loading.classList.remove("hidden");
  juegosContainer.classList.add("hidden");

  fetch("data/juegos.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      juegosData = data.map((juego) => ({
        ...juego,
        // Añadir campos por defecto si no existen
        year: juego.year || "Desconocido",
        plataforma: juego.plataforma || "Windows",
        tamanio: juego.tamanio || "Desconocido",
        version: juego.version || "1.0",
        fechaAgregado:
          juego.fechaAgregado || new Date().toISOString().split("T")[0],
      }));

      juegosFiltrados = [...juegosData];
      cargarGeneros(juegosData);
      mostrarJuegos(juegosData);
      actualizarEstadisticas(juegosData.length, juegosData.length);

      loading.classList.add("hidden");
      juegosContainer.classList.remove("hidden");
    })
    .catch((err) => {
      console.error("Error cargando juegos:", err);
      loading.innerHTML = `
                <div class="error">
                    <p>❌ Error cargando los juegos</p>
                    <button onclick="cargarJuegos()" class="btn-secondary">Reintentar</button>
                </div>
            `;
    });
}

function configurarEventListeners() {
  // Buscador con debounce
  const searchInput = document.getElementById("search");
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => aplicarFiltros(), 300);
  });

  // Filtros
  document
    .getElementById("filterGenero")
    .addEventListener("change", aplicarFiltros);
  document
    .getElementById("filterOrden")
    .addEventListener("change", aplicarFiltros);

  // Limpiar filtros
  document
    .getElementById("clearFilters")
    .addEventListener("click", limpiarFiltros);

  // Cerrar modales al hacer clic fuera
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        if (modal.id === "warning") closeWarning();
        if (modal.id === "gameModal") closeGame();
      }
    });
  });
}

function configurarTeclasRapidas() {
  document.addEventListener("keydown", (e) => {
    // ESC cierra modales
    if (e.key === "Escape") {
      closeGame();
      closeWarning();
    }

    // Ctrl+F focus en buscador
    if (e.ctrlKey && e.key === "f") {
      e.preventDefault();
      document.getElementById("search").focus();
    }

    // Ctrl+L limpia filtros
    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      limpiarFiltros();
    }

    // Ctrl+S guarda favorito
    if (e.ctrlKey && e.key === "s" && juegoActual) {
      e.preventDefault();
      toggleFavorito();
    }
  });
}

/* ===== MOSTRAR JUEGOS ===== */
function mostrarJuegos(lista) {
  const contenedor = document.getElementById("juegos");
  const noResults = document.getElementById("noResults");

  if (lista.length === 0) {
    contenedor.innerHTML = "";
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");
  contenedor.innerHTML = "";

  lista.forEach((juego) => {
    const card = document.createElement("div");
    card.className = "card";
    if (favoritos.includes(juego.id)) {
      card.classList.add("favorito");
    }
    card.onclick = () => abrirJuego(juego);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Abrir detalles de ${juego.titulo}`);

    // Evento para tecla Enter
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrirJuego(juego);
      }
    });

    const img = document.createElement("img");
    img.src = juego.imagen;
    img.alt = `Portada de ${juego.titulo}`;
    img.loading = "lazy";

    if (juego.adult) {
      img.classList.add("blur");

      const badge = document.createElement("div");
      badge.className = "badge";
      badge.textContent = "+18";
      badge.setAttribute("aria-label", "Contenido para adultos");
      card.appendChild(badge);
    }

    if (favoritos.includes(juego.id)) {
      const favBadge = document.createElement("div");
      favBadge.className = "badge favorito-badge";
      favBadge.textContent = "⭐";
      favBadge.title = "En tus favoritos";
      favBadge.setAttribute("aria-label", "Juego en favoritos");
      card.appendChild(favBadge);
    }

    const title = document.createElement("h3");
    title.textContent = juego.titulo;

    const generos = document.createElement("div");
    generos.className = "card-generos";
    juego.generos.slice(0, 3).forEach((genero) => {
      const generoBadge = document.createElement("span");
      generoBadge.className = "card-genero";
      generoBadge.textContent = genero;
      generos.appendChild(generoBadge);
    });

    // Info adicional
    const info = document.createElement("div");
    info.className = "card-info";
    info.innerHTML = `
            <small>${juego.plataforma} • ${juego.tamanio}</small>
        `;

    card.append(img, title, generos, info);
    contenedor.appendChild(card);
  });
}

/* ===== ABRIR JUEGO ===== */
function abrirJuego(juego) {
  juegoActual = juego;

  // Actualizar elementos del modal
  document.getElementById("modalTitulo").textContent = juego.titulo;
  document.getElementById("modalDescripcion").textContent =
    juego.descripcionCorta;
  document.getElementById("modalInstrucciones").textContent =
    juego.instrucciones;
  document.getElementById("modalGeneros").textContent =
    `Géneros: ${juego.generos.join(", ")}`;
  document.getElementById("modalPlataforma").textContent =
    `Plataforma: ${juego.plataforma}`;
  document.getElementById("modalTamanio").textContent =
    `Tamaño: ${juego.tamanio}`;
  document.getElementById("modalYear").textContent = juego.year;
  document.getElementById("modalVersion").textContent = juego.version;

  // Imagen
  const bgImg = document.getElementById("modalBgImage");
  bgImg.src = juego.imagen;
  bgImg.alt = `Portada de ${juego.titulo}`;

  // +18 badge
  const adultBadge = document.getElementById("modalAdult");
  if (juego.adult) {
    adultBadge.style.display = "block";
    adultBadge.setAttribute("aria-hidden", "false");
  } else {
    adultBadge.style.display = "none";
    adultBadge.setAttribute("aria-hidden", "true");
  }

  // Creador (link)
  const creadorLink = document.getElementById("modalCreador");
  creadorLink.textContent = juego.creador || "Desconocido";

  if (juego.creadorUrl) {
    creadorLink.href = juego.creadorUrl;
    creadorLink.setAttribute("rel", "noopener noreferrer");
    creadorLink.style.pointerEvents = "auto";
    creadorLink.style.opacity = "1";
    creadorLink.removeAttribute("aria-disabled");
  } else {
    creadorLink.removeAttribute("href");
    creadorLink.style.pointerEvents = "none";
    creadorLink.style.opacity = "0.6";
    creadorLink.setAttribute("aria-disabled", "true");
  }

  // Juego original
  const originalBtn = document.getElementById("modalOriginal");
  if (juego.juegoOriginal) {
    originalBtn.href = juego.juegoOriginal;
    originalBtn.style.display = "block";
    originalBtn.setAttribute("rel", "noopener noreferrer");
  } else {
    originalBtn.style.display = "none";
  }

  // Descarga
  const descargaBtn = document.getElementById("modalDescarga");
  descargaBtn.href = juego.descarga;
  descargaBtn.setAttribute("rel", "noopener noreferrer");

  // Botón favorito
  const favoritoBtn = document.getElementById("btnFavorito");
  if (favoritos.includes(juego.id)) {
    favoritoBtn.textContent = "★ Quitar de favoritos";
    favoritoBtn.classList.add("favorito-activo");
    favoritoBtn.setAttribute("aria-label", "Quitar de favoritos");
  } else {
    favoritoBtn.textContent = "⭐ Añadir a favoritos";
    favoritoBtn.classList.remove("favorito-activo");
    favoritoBtn.setAttribute("aria-label", "Añadir a favoritos");
  }

  // Abrir modal
  const modal = document.getElementById("gameModal");
  modal.classList.add("active");
  document.body.classList.add("modal-open");

  // Focus en el botón de cerrar para accesibilidad
  setTimeout(() => {
    document.querySelector(".modal .close").focus();
  }, 100);

  // Registrar vista en localStorage
  registrarVista(juego.id);
}

function closeGame() {
  const modal = document.getElementById("gameModal");
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
  juegoActual = null;

  // Restaurar focus al elemento que abrió el modal
  if (document.activeElement.classList.contains("close")) {
    document.querySelector('.card[tabindex="0"]')?.focus();
  }
}

function closeWarning() {
  const warning = document.getElementById("warning");
  warning.classList.remove("active");
  document.body.classList.remove("modal-open");

  // Guardar en localStorage que se aceptó la advertencia
  localStorage.setItem("mogeko_advertencia_aceptada", "true");
}

/* ===== FILTROS Y BÚSQUEDA ===== */
function cargarGeneros(data) {
  const select = document.getElementById("filterGenero");
  const generos = new Set();

  data.forEach((j) => j.generos.forEach((g) => generos.add(g)));

  // Ordenar géneros alfabéticamente
  Array.from(generos)
    .sort()
    .forEach((g) => {
      const option = document.createElement("option");
      option.value = g;
      option.textContent = g;
      select.appendChild(option);
    });
}

function aplicarFiltros() {
  const genero = document.getElementById("filterGenero").value;
  const texto = document.getElementById("search").value.toLowerCase();
  const orden = document.getElementById("filterOrden").value;

  let filtrados = juegosData;

  // Filtrar por género
  if (genero !== "todos") {
    filtrados = filtrados.filter((j) => j.generos.includes(genero));
  }

  // Filtrar por texto
  if (texto.trim()) {
    filtrados = filtrados.filter(
      (j) =>
        j.titulo.toLowerCase().includes(texto) ||
        j.creador.toLowerCase().includes(texto) ||
        j.generos.some((g) => g.toLowerCase().includes(texto)),
    );
  }

  // Ordenar
  filtrados = ordenarJuegos(filtrados, orden);

  // Guardar resultados filtrados
  juegosFiltrados = filtrados;

  // Mostrar resultados
  mostrarJuegos(filtrados);
  actualizarEstadisticas(juegosData.length, filtrados.length);
}

function ordenarJuegos(juegos, criterio) {
  const juegosCopia = [...juegos];

  switch (criterio) {
    case "titulo":
      return juegosCopia.sort((a, b) => a.titulo.localeCompare(b.titulo));
    case "titulo-desc":
      return juegosCopia.sort((a, b) => b.titulo.localeCompare(a.titulo));
    case "adult":
      return juegosCopia.sort((a, b) => (b.adult ? 1 : 0) - (a.adult ? 1 : 0));
    case "safe":
      return juegosCopia.sort((a, b) => (a.adult ? 1 : 0) - (b.adult ? 1 : 0));
    case "favoritos":
      return juegosCopia.sort((a, b) => {
        const aFav = favoritos.includes(a.id);
        const bFav = favoritos.includes(b.id);
        return (bFav ? 1 : 0) - (aFav ? 1 : 0);
      });
    default:
      return juegosCopia;
  }
}

function limpiarFiltros() {
  document.getElementById("filterGenero").value = "todos";
  document.getElementById("filterOrden").value = "default";
  document.getElementById("search").value = "";

  mostrarJuegos(juegosData);
  actualizarEstadisticas(juegosData.length, juegosData.length);

  // Focus en el buscador
  document.getElementById("search").focus();
}

function actualizarEstadisticas(total, filtrados) {
  const statsCount = document.getElementById("statsCount");
  const statsFiltered = document.getElementById("statsFiltered");
  const filteredCount = document.getElementById("filteredCount");

  statsCount.textContent = `${total} juego${total !== 1 ? "s" : ""}`;

  if (filtrados < total) {
    statsFiltered.classList.remove("hidden");
    filteredCount.textContent = filtrados;
  } else {
    statsFiltered.classList.add("hidden");
  }
}

/* ===== FAVORITOS ===== */
function toggleFavorito() {
  if (!juegoActual) return;

  const index = favoritos.indexOf(juegoActual.id);
  const favoritoBtn = document.getElementById("btnFavorito");

  if (index > -1) {
    // Quitar de favoritos
    favoritos.splice(index, 1);
    favoritoBtn.textContent = "⭐ Añadir a favoritos";
    favoritoBtn.classList.remove("favorito-activo");
    favoritoBtn.setAttribute("aria-label", "Añadir a favoritos");

    // Mostrar notificación
    mostrarNotificacion(
      `"${juegoActual.titulo}" eliminado de favoritos`,
      "info",
    );
  } else {
    // Añadir a favoritos
    favoritos.push(juegoActual.id);
    favoritoBtn.textContent = "★ Quitar de favoritos";
    favoritoBtn.classList.add("favorito-activo");
    favoritoBtn.setAttribute("aria-label", "Quitar de favoritos");

    // Mostrar notificación
    mostrarNotificacion(
      `"${juegoActual.titulo}" añadido a favoritos`,
      "success",
    );
  }

  // Guardar en localStorage
  localStorage.setItem("mogeko_favoritos", JSON.stringify(favoritos));

  // Actualizar contador
  actualizarContadorFavoritos();

  // Actualizar vista si estamos en modo favoritos
  if (document.getElementById("filterOrden").value === "favoritos") {
    aplicarFiltros();
  }

  // Actualizar badge en la card
  actualizarBadgeFavorito(juegoActual.id, index === -1);
}

function actualizarBadgeFavorito(juegoId, esFavorito) {
  // Buscar todas las cards con este juego
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent;
    const juego = juegosData.find((j) => j.id === juegoId);

    if (juego && title === juego.titulo) {
      if (esFavorito) {
        card.classList.add("favorito");
        // Añadir badge si no existe
        if (!card.querySelector(".favorito-badge")) {
          const favBadge = document.createElement("div");
          favBadge.className = "badge favorito-badge";
          favBadge.textContent = "⭐";
          favBadge.title = "En tus favoritos";
          card.appendChild(favBadge);
        }
      } else {
        card.classList.remove("favorito");
        // Eliminar badge
        const badge = card.querySelector(".favorito-badge");
        if (badge) {
          badge.remove();
        }
      }
    }
  });
}

function actualizarContadorFavoritos() {
  const countElement = document.getElementById("favoritosCount");
  countElement.textContent = favoritos.length;
}

function mostrarFavoritos() {
  document.getElementById("filterOrden").value = "favoritos";
  aplicarFiltros();

  // Mostrar notificación
  if (favoritos.length > 0) {
    mostrarNotificacion(
      `Mostrando ${favoritos.length} favorito${favoritos.length !== 1 ? "s" : ""}`,
      "info",
    );
  } else {
    mostrarNotificacion("No tienes juegos en favoritos", "warning");
  }
}

/* ===== HISTORIAL DE VISTAS ===== */
function registrarVista(juegoId) {
  let vistas = JSON.parse(localStorage.getItem("mogeko_vistas")) || [];

  // Añadir al inicio y mantener solo las últimas 20
  vistas = [juegoId, ...vistas.filter((id) => id !== juegoId)].slice(0, 20);

  localStorage.setItem("mogeko_vistas", JSON.stringify(vistas));
}

/* ===== NOTIFICACIONES ===== */
function mostrarNotificacion(mensaje, tipo = "info") {
  // Eliminar notificación anterior si existe
  const notificacionAnterior = document.querySelector(".notificacion");
  if (notificacionAnterior) {
    notificacionAnterior.remove();
  }

  const notificacion = document.createElement("div");
  notificacion.className = `notificacion notificacion-${tipo}`;
  notificacion.textContent = mensaje;
  notificacion.setAttribute("role", "alert");
  notificacion.setAttribute("aria-live", "polite");

  // Estilos inline para la notificación
  notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        background: ${tipo === "success" ? "#4caf50" : tipo === "warning" ? "#ff9800" : "#2196f3"};
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        max-width: 300px;
    `;

  // Añadir al documento
  document.body.appendChild(notificacion);

  // Eliminar después de 3 segundos
  setTimeout(() => {
    notificacion.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notificacion.remove(), 300);
  }, 3000);
}

// Añadir estilos de animación para notificaciones
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/* ===== MODO OSCURO/CLARO ===== */
function toggleModoOscuro() {
  const body = document.body;
  const estaOscuro = body.getAttribute("data-theme") !== "light";

  if (estaOscuro) {
    body.setAttribute("data-theme", "light");
    localStorage.setItem("mogeko_tema", "light");
    mostrarNotificacion("Modo claro activado", "info");
  } else {
    body.setAttribute("data-theme", "dark");
    localStorage.setItem("mogeko_tema", "dark");
    mostrarNotificacion("Modo oscuro activado", "info");
  }
}

// Cargar tema guardado al iniciar
function cargarTemaGuardado() {
  const temaGuardado = localStorage.getItem("mogeko_tema");
  const prefiereOscuro = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  if (temaGuardado) {
    document.body.setAttribute("data-theme", temaGuardado);
  } else if (prefiereOscuro) {
    document.body.setAttribute("data-theme", "dark");
  }
}

// Ejecutar al cargar
cargarTemaGuardado();

/* ===== FUNCIONES AUXILIARES ===== */
function sanitizarInput(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^\w\s]/gi, "")
    .trim();
}

// Verificar si ya se aceptó la advertencia
window.addEventListener("load", () => {
  const advertenciaAceptada = localStorage.getItem(
    "mogeko_advertencia_aceptada",
  );
  if (advertenciaAceptada === "true") {
    closeWarning();
  }
});

// Exportar funciones para uso global (si es necesario)
window.mostrarFavoritos = mostrarFavoritos;
window.toggleModoOscuro = toggleModoOscuro;
window.limpiarFiltros = limpiarFiltros;
window.closeGame = closeGame;
window.closeWarning = closeWarning;
window.toggleFavorito = toggleFavorito;
