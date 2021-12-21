const $main = document.querySelector("main"),
  $fragment = document.createDocumentFragment(),
  $modal = document.getElementById("modal");
let urlPoke = "https://pokeapi.co/api/v2/pokemon/";
const pokeData = [];
let $previous, $next, $component;
const loadPokemos = async (url) => {
  try {
    const $div = printElement("", "div", ["class"], ["container__cards"]);
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
        $div.appendChild($fragment);
      } catch (err) {
        console.log(err);
        let message = err.statusText || "Ocurrio un error";
      }
    }

    // handledBtnMore();

    $previous = json.previous;
    $next = json.next;

    return $div;
  } catch (err) {
    console.log(err);
    let message = err.statusText || "Ocurrio un error";
    const p = printElement(message, "p");
    $main.appendChild(p);
  }
};
const createFigure = (pokemon, $template) => {
  $template.querySelector("figcaption").textContent = pokemon.name;
  $template
    .querySelector("img")
    .setAttribute("src", pokemon.sprites.other.home.front_shiny);
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
document.addEventListener("DOMContentLoaded", async (e) => {
  createLoader();
  const $c = await loadPokemos(urlPoke);
  createMain($c);
  handledLoader.close();
});

const createMain = async (component) => {
  $main.appendChild(createNav());
  $main.appendChild(component);
  $main.appendChild(createNav());

  $component = await loadPokemos($next);
};
document.addEventListener("click", async (e) => {
  if (e.target.matches("#cards .btn__more")) {
    let $id = e.target.parentNode.id;
    $modal.querySelector("#inputs-1").checked = true;
    $main.querySelector(".loading")
      ? $main.removeChild($main.querySelector(".loading"))
      : "";

    createData($id);
  }
  if (e.target.matches("#modal .modal__close")) {
    $modal.classList.remove("modal__show");
  }
  if (e.target.matches(".links a")) {
    e.preventDefault();
    $main.innerHTML = "";
    handledLoader.show();
    $component = await loadPokemos(e.target.getAttribute("href"));
    createMain($component);
    handledLoader.close();
  }
});

const createNav = () => {
  const $nav = printElement("", "nav", ["class"], ["links"]);
  if ($previous === null) {
    $nav.appendChild(printElement("Next >", "a", ["href"], [$next]));
  } else {
    $nav.appendChild(printElement("< Previous", "a", ["href"], [$previous]));
    $nav.appendChild(printElement("Next >", "a", ["href"], [$next]));
  }
  return $nav;
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
  $divLoader.appendChild(printElement("Loading...", "span"));
  console.log(document.body);
  document.body.appendChild($divLoader);
};

const handledLoader = {
  show: () => {
    document.querySelector(".loading").style.display = "flex";
    document.querySelector(".loading").style.opacity = 1;
  },
  close: () => {
    document.querySelector(".loading").style.display = "none";
    document.querySelector(".loading").style.opacity = 0;
  },
};
const createData = async ($pokemon) => {
  handledLoader.show();
  try {
    removeChild("#about", "p");
    removeChild("#baseStats", "p");
    removeChild("#evolutions", "figure");
    removeChild("#moves", "span");
    let res = await fetch(urlPoke + $pokemon),
      json = await res.json();

    // title
    $modal.querySelector("h2").textContent = json.name;

    // img
    $modal
      .querySelector("img")
      .setAttribute("src", json.sprites.other.home.front_shiny);

    // span
    // createTypes(json.types, $modal);

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
    await createBaseStats(json.stats);
    await createEvolutios(json.species.url);
    createMoves(json.moves);
  } catch (err) {
    console.log(err);
  } finally {
    handledLoader.close();
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
const createEvolutios = async (url) => {
  let json = await fetchPeticion(url);
  json = await fetchPeticion(json.evolution_chain.url);

  let img, name;
  img = await fetchPeticion(
    `https://pokeapi.co/api/v2/pokemon/${json.chain.species.name}`
  );
  img = img.sprites.other.home.front_shiny;
  name = json.chain.species.name;
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
  const arr = [json.chain.evolves_to[0].evolution_details[0].min_level];
  try {
    arr.push(
      json.chain.evolves_to[0].evolves_to[0].evolution_details[0].min_level
    );
  } catch (err) {
    arr.push(undefined);
  }
  for (let i = 0; i < 2; i++) {
    img = await fetchPeticion(
      `https://pokeapi.co/api/v2/pokemon/${json.chain.evolves_to[0].species.name}`
    );
    img = img.sprites.other.home.front_shiny;
    name = json.chain.evolves_to[0].species.name;

    if (i === 0) {
      if (arr[i] !== null) {
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
        $evoContainer.appendChild(
          createAppendChild(
            "figure",
            ["img", "figcaption"],
            ["src"],
            [[], name],
            [img]
          )
        );
      } else {
        $evoContainer.appendChild(
          createAppendChild(
            "figure",
            ["img", "figcaption"],
            ["src"],
            [[], "No lvl required"],
            ["../img/arrow.svg"],
            ["class"],
            ["arrow"]
          )
        );
        $evoContainer.appendChild(
          createAppendChild(
            "figure",
            ["img", "figcaption"],
            ["src"],
            [[], name],
            [img]
          )
        );
      }
    } else {
      if (arr[i] === null || arr[i] !== undefined) {
        $evoContainer.appendChild(
          createAppendChild(
            "figure",
            ["img", "figcaption"],
            ["src"],
            [[], name],
            [img]
          )
        );
        $evoContainer.appendChild(
          createAppendChild(
            "figure",
            ["img", "figcaption"],
            ["src"],
            [[], "No lvl required"],
            ["../img/arrow.svg"],
            ["class"],
            ["arrow"]
          )
        );
      }
    }
  }
  // second Evolutions
  if (arr[1] !== undefined) {
    img = await fetchPeticion(
      `https://pokeapi.co/api/v2/pokemon/${json.chain.evolves_to[0].evolves_to[0].species.name}`
    );
    img = img.sprites.other.home.front_shiny;
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
  }
};

const createAppendChild = (typeP, typeC, attr, content, src, attrP, srcP) => {
  // console.log(attrP, srcP);
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

const createMoves = (moves) => {
  const $mov = $modal.querySelector("#moves");
  moves.forEach((mv, index) => {
    $mov.appendChild(printElement(`${index + 1}: ${mv.move.name} `, "span"));
  });
};
