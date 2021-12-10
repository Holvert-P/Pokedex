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
    const $div = printElement("", "div", ["class"], ["container__cards"]);
    $div.appendChild($fragment);
    $main.appendChild($div);
    createNav();
    handledBtnMore();
    const $links = document.querySelectorAll(".links");

    $links.forEach((link) => {
      const $link1 = printElement("", "a");
      json.previous
        ? ($link1.setAttribute("href", json.previous),
          ($link1.textContent = "< Anterior"))
        : "";
      link.appendChild($link1);
    });

    $links.forEach((link) => {
      const $link2 = printElement("", "a");
      $next = json.next
        ? ($link2.setAttribute("href", json.next),
          ($link2.textContent = "Siguitente >"))
        : "";
      link.appendChild($link2);
    });
  } catch (err) {
    console.log(err);
    let message = err.statusText || "Ocurrio un error";
    const p = printElement(message, "p");
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
  const $nav = printElement("", "nav", ["class"], ["links"]);
  $main.appendChild($nav);
};

const createLoader = () => {
  const $loader = printElement(
      "",
      "img",
      ["class", "src"],
      ["loader", "./img/loader.svg"]
    ),
    $divLoader = printElement("", "div", ["class"], ["loading"]);
  $divLoader.appendChild($loader);
  $divLoader.appendChild(printElement("Cargando...", "span"));
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
    removeChild("#about", "p");
    removeChild("#baseStats", "p");
    removeChild("#evolutions", "figure");

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

    $modal.querySelector("#about").appendChild(printElement("Abilities:", "p"));
    $modal
      .querySelector("#about")
      .appendChild(printElement(abilitiesArr.join(", "), "p"));

    // create BaseStats
    createBaseStats(json.stats);
    createEvolutios(
      json.species.url,
      json.sprites.other.dream_world.front_default,
      json.name
    );
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
  $fragmentAbout.appendChild(printElement(`${type}:`, "p"));
  $fragmentAbout.appendChild(printElement(json[`${type}`] + " " + unit, "p"));
  return $fragmentAbout;
};

const removeChild = (contenedor, type) => {
  const $item__about = document.querySelectorAll(`${contenedor} ${type}`);
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
    $baseStats.appendChild(printElement(stats[index], "p"));
    $baseStats.appendChild(printElement(bs.base_stat, "p"));
    $baseStats.appendChild(
      printBar(
        index,
        bs.base_stat - 100 > 0 ? 0 : bs.base_stat - 100,
        $colors[index]
      )
    );
    total += bs.base_stat;
  });
  $baseStats.appendChild(printElement(stats[6], "p"));
  $baseStats.appendChild(printElement(total, "p"));
  $baseStats.appendChild(printBar(6, 0, $colors[6]));
};

const printElement = (value, element, attr, valueAttr) => {
  const $pValue = document.createElement(element);
  $pValue.textContent = value;
  attr
    ? attr.forEach((at, index) => {
        $pValue.setAttribute(at, valueAttr[index]);
      })
    : "";

  return $pValue;
};

const printBar = (index, $width, $colors) => {
  const $pBar = document.createElement("p");
  $pBar.classList.add("bar");
  $pBar.style.setProperty("--width-bar", `${$width}%`);
  $pBar.style.setProperty("--bg-color", `var(${$colors})`);
  return $pBar;
};

const fetchPeticion = async (url) => {
  let res = await fetch(url),
    json = await res.json();
  return json;
};
const createEvolutios = async (url, img, name) => {
  let json = await fetchPeticion(url);
  json = await fetchPeticion(json.evolution_chain.url);
  // console.log(json.chain.evolves_to[0].species.name);
  // console.log(json.chain.evolves_to[0].evolution_details[0].min_level);
  // console.log(json.chain.evolves_to[0].evolves_to[0].species.name);
  // console.log(
  //   json.chain.evolves_to[0].evolves_to[0].evolution_details[0].min_level
  // );
  // Pokemon
  const $evoContainer = $modal.querySelector("#evolutions");
  $evoContainer.appendChild(
    createAppendChild(
      "figure",
      ["img", "figcaption"],
      ["src"],
      [[], name],
      [img]
    )
  );
  // firts Evolutions
  for (let i = 0; i < 2; i++) {
    const arr = [
      json.chain.evolves_to[0].evolution_details[0].min_level,
      json.chain.evolves_to[0].evolves_to[0].evolution_details[0].min_level,
    ];
    img = await fetchPeticion(
      `https://pokeapi.co/api/v2/pokemon/${json.chain.evolves_to[0].species.name}`
    );
    img = img.sprites.other.dream_world.front_default;
    name = json.chain.evolves_to[0].species.name;
    if (i === 0) {
      $evoContainer.appendChild(
        createAppendChild(
          "figure",
          ["img", "figcaption"],
          ["src"],
          [[], "Lvl " + arr[i]],
          ["../img/arrow.svg"],
          ["class"],
          ["arrow"]
        )
      );
    }
    $evoContainer.appendChild(
      createAppendChild(
        "figure",
        ["img", "figcaption"],
        ["src"],
        [[], name],
        [img]
      )
    );

    if (i === 1) {
      $evoContainer.appendChild(
        createAppendChild(
          "figure",
          ["img", "figcaption"],
          ["src"],
          [[], "Lvl " + arr[i]],
          ["../img/arrow.svg"],
          ["class"],
          ["arrow"]
        )
      );
    }
  }
  // second Evolutions
  img = await fetchPeticion(
    `https://pokeapi.co/api/v2/pokemon/${json.chain.evolves_to[0].evolves_to[0].species.name}`
  );
  img = img.sprites.other.dream_world.front_default;
  name = json.chain.evolves_to[0].evolves_to[0].species.name;

  $evoContainer.appendChild(
    createAppendChild(
      "figure",
      ["img", "figcaption"],
      ["src"],
      [[], name],
      [img]
    )
  );
};

const createAppendChild = (typeP, typeC, attr, content, src, attrP, srcP) => {
  console.log(attrP, srcP);
  const $evoFigure = printElement("", typeP, attrP, srcP);
  typeC.forEach((tpc, index) => {
    attr[index]
      ? $evoFigure.appendChild(
          printElement(content[index], tpc, [attr[index]], [src[index]])
        )
      : $evoFigure.appendChild(printElement(content[index], tpc));
  });
  return $evoFigure;
};
