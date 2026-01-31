let juegosData = [];

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
      badge.textContent = "+18";
      badge.style.position = "absolute";
      badge.style.top = "10px";
      badge.style.right = "10px";
      badge.style.background = "#ff4d4d";
      badge.style.padding = "4px 8px";
      badge.style.borderRadius = "8px";
      badge.style.fontSize = "0.8rem";
      badge.style.fontWeight = "600";

      card.style.position = "relative";
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
    juego.descripcionLarga;
  document.getElementById("modalInstrucciones").textContent =
    juego.instrucciones;
  document.getElementById("modalDescarga").href = juego.descarga;

  document.getElementById("gameModal").classList.add("active");
}

function closeGame() {
  document.getElementById("gameModal").classList.remove("active");
}

function closeWarning() {
  document.getElementById("warning").classList.remove("active");
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

  select.onchange = () => {
    if (select.value === "todos") {
      mostrarJuegos(juegosData);
    } else {
      mostrarJuegos(juegosData.filter((j) => j.generos.includes(select.value)));
    }
  };
}

document.getElementById("search").addEventListener("input", (e) => {
  const texto = e.target.value.toLowerCase();
  mostrarJuegos(
    juegosData.filter((j) => j.titulo.toLowerCase().includes(texto)),
  );
});

document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("filterGenero").value = "todos";
  document.getElementById("search").value = "";
  mostrarJuegos(juegosData);
});
