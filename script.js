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
    if (juego.adult) img.classList.add("blur");

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
