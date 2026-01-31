document.addEventListener("DOMContentLoaded", () => {
  const gamesContainer = document.getElementById("games");
  const genreFilter = document.getElementById("genreFilter");

  let gamesData = [];

  fetch("data/games.json")
    .then((res) => res.json())
    .then((data) => {
      gamesData = data;
      cargarGeneros();
      mostrarJuegos(gamesData);
    });

  /* =========================
     GENEROS
  ==========================*/
  function cargarGeneros() {
    const generos = new Set();

    gamesData.forEach((juego) => {
      juego.generos.forEach((g) => generos.add(g));
    });

    generos.forEach((genero) => {
      const option = document.createElement("option");
      option.value = genero;
      option.textContent = genero;
      genreFilter.appendChild(option);
    });
  }

  /* =========================
     MOSTRAR JUEGOS
  ==========================*/
  function mostrarJuegos(lista) {
    gamesContainer.innerHTML = "";

    lista.forEach((juego) => {
      const card = document.createElement("div");
      card.className = "card";

      const imgClass = juego.adult ? "blur" : "";

      card.innerHTML = `
  <img src="${juego.imagen}" class="${imgClass}" alt="${juego.titulo}">
  ${juego.adult ? `<span class="badge">+18</span>` : ""}
  <h3>${juego.titulo}</h3>
`;

      card.onclick = () => abrirJuego(juego);
      gamesContainer.appendChild(card);

      card.onclick = () => abrirJuego(juego);
      gamesContainer.appendChild(card);
    });
  }

  /* =========================
     FILTROS
  ==========================*/
  window.filterGames = function () {
    const genero = genreFilter.value;
    if (!genero) return mostrarJuegos(gamesData);

    const filtrados = gamesData.filter((j) => j.generos.includes(genero));

    mostrarJuegos(filtrados);
  };

  window.resetFilter = function () {
    genreFilter.value = "";
    mostrarJuegos(gamesData);
  };

  /* =========================
     MODAL
  ==========================*/
  window.abrirJuego = function (juego) {
    document.getElementById("modalTitulo").textContent = juego.titulo;
    document.getElementById("modalDescripcion").textContent =
      juego.descripcionLarga;
    document.getElementById("modalInstrucciones").textContent =
      juego.instrucciones;
    document.getElementById("modalDescarga").href = juego.descarga;

    const bg = document.getElementById("modalBg");
    bg.innerHTML = `<img src="${juego.imagen}" alt="">`;

    const adultIcon = document.getElementById("adultIcon");
    adultIcon.style.display = juego.adult ? "inline-block" : "none";

    document.getElementById("gameModal").style.display = "flex";
  };

  window.closeGame = function () {
    document.getElementById("gameModal").style.display = "none";
  };

  /* =========================
     ADVERTENCIA
  ==========================*/
  window.acceptWarning = function () {
    document.getElementById("warning").style.display = "none";
  };
});
