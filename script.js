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
  document.getElementById("modal-title").textContent = game.titulo;
  document.getElementById("modal-tags").textContent = game.generos.join(" · ");
  document.getElementById("modal-desc").textContent = game.descripcionLarga;

  const link = document.querySelector(".modal-content a");
  link.href = game.descarga;

  document.querySelector(".modal-content h4 + p").textContent =
    game.instrucciones;

  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function closeWarning() {
  document.getElementById("warning").style.display = "none";
  document.body.classList.remove("locked");
}
