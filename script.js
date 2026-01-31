document.body.classList.add("locked");

fetch("games.json")
  .then((res) => res.json())
  .then((games) => renderGames(games));

function renderGames(games) {
  const list = document.getElementById("gameList");

  games.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-card";

    if (game.adult) {
      card.classList.add("blurred");
      card.innerHTML = `
        <div class="adult-overlay">+18 · Click para ver</div>
        <h3>${game.titulo}</h3>
        <span class="tags">${game.generos.join(" · ")}</span>
        <p>${game.descripcionCorta}</p>
      `;

      card.onclick = () => revealAdult(card, game);
    } else {
      card.innerHTML = `
        <h3>${game.titulo}</h3>
        <span class="tags">${game.generos.join(" · ")}</span>
        <p>${game.descripcionCorta}</p>
      `;

      card.onclick = () => openModal(game);
    }

    list.appendChild(card);
  });
}

function revealAdult(card, game) {
  card.classList.remove("blurred");
  card.querySelector(".adult-overlay").remove();
  card.onclick = () => openModal(game);
}

function openModal(game) {
  const modal = document.getElementById("modal");
  const content = modal.querySelector(".modal-content");

  // esta es la línea que falta en tu repo
  content.style.setProperty("--modal-bg", `url(${game.imagen})`);

  document.getElementById("modal-title").textContent = game.titulo;
  document.getElementById("modal-tags").textContent = game.generos.join(" · ");
  document.getElementById("modal-desc").textContent = game.descripcionLarga;

  const link = content.querySelector("a");
  link.href = game.descarga;

  document.getElementById("modal-instructions").textContent =
    game.instrucciones;

  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function closeWarning() {
  document.getElementById("warning").style.display = "none";
  document.body.classList.remove("locked");
}
