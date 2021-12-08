const $main = document.querySelector("main"),
  $fragment = document.createDocumentFragment();

// $template = document.getElementById("template__cards").content;
let urlPoke = "https://pokeapi.co/api/v2/pokemon/";

const loadPokemos = async (url) => {
  createLoader();

  document.querySelector(".loader").style.display = "block";
  try {
    let res = await fetch(url),
      json = await res.json(),
      $previus,
      $next,
      $template = "";

    if (!res.ok) throw { status: res.status, statusText: res.statusText };

    for (let i = 0; i < json.results.length; i++) {
      // console.log(json.results[i]);

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
    $div.appendChild($fragment);
    $main.appendChild($div);
    const $link1 = document.createElement("a"),
      $link2 = document.createElement("a"),
      $links = document.querySelector(".links");

    json.previous
      ? ($link1.setAttribute("href", json.previous),
        ($link1.textContent = "< Anterior"),
        $links.appendChild($link1))
      : "";

    $next = json.next
      ? ($link2.setAttribute("href", json.next),
        ($link2.textContent = "Siguitente >"),
        $links.appendChild($link2))
      : "";
  } catch (err) {
    console.log(err);
    let message = err.statusText || "Ocurrio un error";
    const p = document.createElement("p");
    p.textContent = message;
    $main.appendChild(p);
  } finally {
    document.querySelector(".loader").style.display = "none";
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
    const $spanTypes = document.createElement("span");
    $spanTypes.textContent = el.type.name;
    $template.querySelector(`.type${index}`).textContent = el.type.name;
  });
};
document.addEventListener("DOMContentLoaded", (e) => loadPokemos(urlPoke));

document.addEventListener("click", (e) => {
  if (e.target.matches(".links a")) {
    e.preventDefault();
    $main.innerHTML = "";
    loadPokemos(e.target.getAttribute("href"));
    console.log(e.target.getAttribute("href"));
  }
});

const createNav = () => {
  const $nav = document.createElement("nav");
  $nav.classList.add("links");
  $main.appendChild($nav);
};

const createLoader = () => {
  const $loader = document.createElement("img");
  $loader.setAttribute("src", "./img/loader.svg");
  $loader.classList.add("loader");
  $main.appendChild($loader);
};
