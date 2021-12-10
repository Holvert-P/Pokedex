const $main = document.querySelector("main"),
  $fragment = document.createDocumentFragment();
// $template = document.getElementById("template__cards").content;
let urlPoke = "https://pokeapi.co/api/v2/pokemon/";
const pokeData = [];
const loadPokemos = async (url) => {
  createLoader();
  document.querySelector(".loading").style.display = "flex";
  document.querySelector(".loading").style.opacity = 1;
  try {
    let res = await fetch(url),
      json = await res.json(),
      $previus,
      $next,
      $template = "";

    if (!res.ok) throw { status: res.status, statusText: res.statusText };
    for (let i = 0; i < json.results.length; i++) {
      try {
        let res = await fetch(json.results[i].url),
          pokemon = await res.json();
        if (!res.ok) throw { status: res.status, statusText: res.statusText };
        $template = document.getElementById("template__cards").content;
        createFigure(pokemon, $template);
        createTypes(pokemon.types, $template);
        let $clone = document.importNode($template, true);

        $fragment.appendChild($clone);
      } catch (err) {
        console.log(err);
        let message = err.statusText || "Ocurrio un error";
      }
    }
    createNav();
    const $div = document.createElement("div");
    $div.classList.add("container__cards");
    $div.appendChild($fragment);
    $main.appendChild($div);
    createNav();
    handledBtnMore();
    const $links = document.querySelectorAll(".links");

    $links.forEach((link) => {
      const $link1 = document.createElement("a");
      json.previous
        ? ($link1.setAttribute("href", json.previous),
          ($link1.textContent = "< Anterior"))
        : "";
      link.appendChild($link1);
    });

    $links.forEach((link) => {
      const $link2 = document.createElement("a");
      $next = json.next
        ? ($link2.setAttribute("href", json.next),
          ($link2.textContent = "Siguitente >"))
        : "";
      link.appendChild($link2);
    });
  } catch (err) {
    console.log(err);
    let message = err.statusText || "Ocurrio un error";
    const p = document.createElement("p");
    p.textContent = message;
    $main.appendChild(p);
  } finally {
    document.querySelector(".loading").style.opacity = 0;
    document.querySelector(".loading").style.display = "none";
  }
};
const createFigure = (pokemon, $template) => {
  $template.querySelector("figcaption").textContent = pokemon.name;
  $template
    .querySelector("img")
    .setAttribute("src", pokemon.sprites.other.dream_world.front_default);
  $template.querySelector("img").setAttribute("alt", pokemon.name);
  $template.querySelector("figure").setAttribute("id", pokemon.id);
  $template
    .querySelector("figure")
    .setAttribute("class", pokemon.types[0].type.name + " card");
};

const createTypes = (types, $template) => {
  types.forEach((el, index) => {
    $template.querySelector(`.type${index}`).textContent = el.type.name;
  });
};
document.addEventListener("DOMContentLoaded", (e) => {
  loadPokemos(urlPoke);
});

document.addEventListener("click", (e) => {
  if (e.target.matches(".links a")) {
    e.preventDefault();
    $main.innerHTML = "";
    loadPokemos(e.target.getAttribute("href"));
  }
});

const createNav = () => {
  const $nav = document.createElement("nav");
  $nav.classList.add("links");
  $main.appendChild($nav);
};

const createLoader = () => {
  const $loader = document.createElement("img"),
    $divLoader = document.createElement("div"),
    $spanText = document.createElement("span");
  $spanText.textContent = "Cargando...";
  $loader.setAttribute("src", "./img/loader.svg");
  $loader.classList.add("loader");
  $divLoader.appendChild($loader);
  $divLoader.appendChild($spanText);
  $divLoader.classList.add("loading");
  $main.appendChild($divLoader);
};

const $modal = document.getElementById("modal"),
  $btn__close = document.querySelector(".modal__close");
$btn__close.addEventListener("click", () => {
  $modal.classList.remove("modal__show");
});

const handledBtnMore = () => {
  const $btn__more = document.querySelectorAll(".btn__more");
  $btn__more.forEach((btn) => {
    btn.addEventListener("click", () => {
      createData(btn.parentNode.id);
      $modal.querySelector("#inputs-1").setAttribute("checked", "checked");
    });
  });
};

const createData = async ($pokemon) => {
  document.querySelector(".loading").style.display = "flex";
  document.querySelector(".loading").style.opacity = 1;
  try {
    removeChild("#about");
    removeChild("#baseStats");
    let res = await fetch(urlPoke + $pokemon),
      json = await res.json();

    // title
    $modal.querySelector("figcaption").textContent = json.name;

    // img
    $modal
      .querySelector("img")
      .setAttribute("src", json.sprites.other.dream_world.front_default);

    // span
    createTypes(json.types, $modal);

    // // class
    $modal
      .querySelector(".modal__container")
      .setAttribute("class", "modal__container " + json.types[0].type.name);

    // about

    $modal
      .querySelector("#about")
      .appendChild(createItemAbout(json, "height", "pulg"));
    $modal
      .querySelector("#about")
      .appendChild(createItemAbout(json, "weight", "kg"));

    // abilities
    let abilitiesArr = [];
    json.abilities.forEach((ab) => {
      abilitiesArr.push(ab.ability.name);
    });

    $modal.querySelector("#about").appendChild(printP("Abilities:"));
    $modal.querySelector("#about").appendChild(printP(abilitiesArr.join(", ")));

    // create BaseStats
    createBaseStats(json.stats);
  } catch (err) {
    console.log(err);
  } finally {
    document.querySelector(".loading").style.display = "none";
    document.querySelector(".loading").style.opacity = 0;
    $modal.classList.add("modal__show");
  }
};

const createItemAbout = (json, type, unit) => {
  $fragmentAbout = document.createDocumentFragment();
  $fragmentAbout.appendChild(printP(`${type}:`));
  $fragmentAbout.appendChild(printP(json[`${type}`] + " " + unit));
  return $fragmentAbout;
};

const removeChild = (contenedor) => {
  const $item__about = document.querySelectorAll(`${contenedor} p`);
  for (let i = 0; i < $item__about.length; i++) {
    $modal.querySelector(`${contenedor}`).removeChild($item__about[i]);
  }
};

const createBaseStats = async (json) => {
  const stats = [
      "HP",
      "Attack",
      "Defense",
      "Sp. atk",
      "Sp. def",
      "Speed",
      "Total",
    ],
    $colors = [
      "--ghost-color",
      "--fire-color",
      "--electric-color",
      "--water-color",
      "  --grass-color",
      "--psychic-color",
      " --dark-color",
    ],
    $baseStats = $modal.querySelector("#baseStats");

  let total = 0;
  json.forEach((bs, index) => {
    $baseStats.appendChild(printP(stats[index]));
    $baseStats.appendChild(printP(bs.base_stat));
    $baseStats.appendChild(printBar(index, bs.base_stat - 100, $colors[index]));
    total += bs.base_stat;
  });
  $baseStats.appendChild(printP(stats[6]));
  $baseStats.appendChild(printP(total));
  $baseStats.appendChild(printBar(6, 0, $colors[6]));
};

const printP = (value) => {
  const $pValue = document.createElement("p");
  $pValue.textContent = value;
  return $pValue;
};
const printBar = (index, $width, $colors) => {
  const $pBar = document.createElement("p");
  $pBar.classList.add("bar");
  $pBar.style.setProperty("--width-bar", `${$width}%`);
  $pBar.style.setProperty("--bg-color", `var(${$colors})`);
  return $pBar;
};
