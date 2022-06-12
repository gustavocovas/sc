let mapCanvas = document.querySelector("#map");
let mapContext = mapCanvas.getContext("2d");

let hoverCanvas = document.querySelector("#hover");
let hoverContext = hoverCanvas.getContext("2d");

const CELL_SIZE = 20;
const WORLD_WIDTH = Math.floor(mapCanvas.width / CELL_SIZE);
const WORLD_HEIGHT = Math.floor(mapCanvas.height / CELL_SIZE);
const NOISE_SCALE = 5;

const COLORS = {
  yellow: { r: 252, g: 244, b: 4 },
  orange: { r: 255, g: 100, b: 4 },
  red: { r: 220, g: 8, b: 8 },
  magenta: { r: 240, g: 8, b: 132 },
  purple: { r: 72, g: 0, b: 164 },
  blue: { r: 0, g: 0, b: 212 },
  cyan: { r: 0, g: 172, b: 232 },
  green: { r: 32, g: 184, b: 20 },
  darkgreen: { r: 0, g: 100, b: 16 },
  brown: { r: 88, g: 44, b: 4 },
  tan: { r: 144, g: 112, b: 56 },
  lightgrey: { r: 192, g: 192, b: 192 },
  mediumgrey: { r: 128, g: 128, b: 128 },
  darkgrey: { r: 64, g: 64, b: 64 },
  black: { r: 0, g: 0, b: 0 },
};

function fillFromColor(color) {
  return "rgb(" + color.r + "," + color.g + "," + color.b + ")";
}

const CELL_TYPES = {
  land: {
    fill: fillFromColor(COLORS["tan"]),
    canBuild: true,
    canBulldoze: false,
  },
  forest: {
    fill: fillFromColor(COLORS["darkgreen"]),
    canBuild: true,
    canBulldoze: true,
  },
  water: {
    fill: fillFromColor(COLORS["blue"]),
    canBuild: false,
    canBulldoze: false,
  },
  house: {
    fill: fillFromColor(COLORS["orange"]),
    canBuild: false,
    canBulldoze: true,
  },
  road: {
    fill: fillFromColor(COLORS["darkgrey"]),
    canBuild: false,
    canBulldoze: true,
  },
  powerplant: {
    fill: fillFromColor(COLORS["purple"]),
    canBuild: false,
    canBulldoze: true,
  },
};

const MODE_HOVER_DIMENSIONS = {
  hover: { width: 1, height: 1 },
  query: { width: 1, height: 1 },
  bulldozer: { width: 1, height: 1 },
  buildHouse: { width: 1, height: 1 },
  buildRoad: { width: 1, height: 1 },
  buildPowerplant: { width: 3, height: 2 },
};

let world = [];
let elevation;
let hovering = false;
let hoveringIllegal = false;
let hovered = [];

let currentMode = "query";

start();

function changeMode(mode) {
  let currentModeBtn = document.querySelector("#" + currentMode + "Btn");
  if (!!currentModeBtn) {
    currentModeBtn.classList.remove("mediumgrey");
    currentModeBtn.classList.add("lightgrey");
  }

  let nextModeBtn = document.querySelector("#" + mode + "Btn");
  if (!!nextModeBtn) {
    nextModeBtn.classList.add("mediumgrey");
    console.log(nextModeBtn);
  }

  document.querySelector("#mode").innerHTML = mode;
  currentMode = mode;
}

function toggleMode(mode) {
  if (currentMode === mode) {
    changeMode("query");
  } else {
    changeMode(mode);
  }
}

function setMousePosition(e) {
  let rect = hoverCanvas.getBoundingClientRect();
  let mouseX = e.clientX - rect.left;
  let mouseY = e.clientY - rect.top;

  let i = Math.floor(mouseY / CELL_SIZE);
  let j = Math.floor(mouseX / CELL_SIZE);

  if (hovering && i === hovered[0].i && j === hovered[0].j) {
    // The cell currently hovered is the same as last time, nothing to do
    return;
  }

  if (!!world[i] && !!world[i][j]) {
    hovering = true;
    hoveringIllegal = false;
    hovered = [];

    for (var k = 0; k < MODE_HOVER_DIMENSIONS[currentMode].height; k++) {
      for (var l = 0; l < MODE_HOVER_DIMENSIONS[currentMode].width; l++) {
        if (!!world[i + k] && !!world[i + k][j + l]) {
          hovered.push(world[i + k][j + l]);
          let hoveredCellType = CELL_TYPES[world[i + k][j + l].type];
          if (
            (currentMode === "bulldozer" && !hoveredCellType.canBulldoze) ||
            (currentMode.startsWith("build") && !hoveredCellType.canBuild)
          ) {
            hoveringIllegal = true;
          }
        } else {
          hoveringIllegal = true;
        }
      }
    }
  } else {
    hovering = false;
    hovered = [];
  }
}

function resetHovering(e) {
  hovering = false;
  hoveringIllegal = false;
  hovered = [];
}

function click(e) {
  if (hoveringIllegal) {
    return;
  }

  if (hovering) {
    for (var i = 0; i < hovered.length; i++) {
      switch (currentMode) {
        case "query":
          console.log(hovered[i]);
          break;
        case "bulldozer":
          hovered[i].type = "land";
          break;
        case "buildHouse":
          hovered[i].type = "house";
          break;
        case "buildRoad":
          hovered[i].type = "road";
          break;
        case "buildPowerplant":
          hovered[i].type = "powerplant";
          break;
        default:
          break;
      }
    }
    drawWorld();
  }
}

function start() {
  init_world();
  drawWorld();
  changeMode("query");
  hoverCanvas.addEventListener("mousemove", setMousePosition, false);
  hoverCanvas.addEventListener("mouseleave", resetHovering, false);
  hoverCanvas.addEventListener("click", click, false);
  update();
}

function init_world() {
  elevation = new Noise(WORLD_WIDTH, WORLD_HEIGHT, NOISE_SCALE);
  fertility = new Noise(WORLD_WIDTH, WORLD_HEIGHT, NOISE_SCALE);

  for (var i = 0; i < WORLD_HEIGHT; i++) {
    world[i] = [];
  }

  for (var i = 0; i < WORLD_HEIGHT; i++) {
    for (var j = 0; j < WORLD_WIDTH; j++) {
      let e = elevation.at(i, j);

      let type = "water";
      if (e > 0.45) {
        type = "land";

        let f = fertility.at(i, j);
        if (f > 0.5) {
          type = "forest";
        }
      }

      world[i][j] = { x: j * CELL_SIZE, y: i * CELL_SIZE, type: type };
    }
  }
}

function isHovering(cell) {
  if (!hovering) {
    return false;
  }

  for (var i = 0; i < hovered.length; i++) {
    if (hovered[i].x === cell.x && hovered[i].y === cell.y) {
      return true;
    }
  }

  return false;
}

function drawWorld() {
  mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

  for (var i = 0; i < WORLD_HEIGHT; i++) {
    for (var j = 0; j < WORLD_WIDTH; j++) {
      const cell = world[i][j];

      mapContext.fillStyle = fillFromColor(COLORS["black"]);
      mapContext.strokeRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);

      mapContext.beginPath();
      mapContext.rect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
      mapContext.fillStyle = CELL_TYPES[cell.type].fill;
      mapContext.fill();
    }
  }
}

function update() {
  hoverContext.clearRect(0, 0, hoverCanvas.width, hoverCanvas.height);

  for (var i = 0; i < WORLD_HEIGHT; i++) {
    for (var j = 0; j < WORLD_WIDTH; j++) {
      let cell = world[i][j];
      if (isHovering(cell)) {
        hoverContext.beginPath();
        hoverContext.rect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
        if (hoveringIllegal) {
          hoverContext.fillStyle = fillFromColor(COLORS["red"]);
        } else {
          hoverContext.fillStyle = fillFromColor(COLORS["cyan"]);
        }

        hoverContext.fill();
      }
    }
  }

  requestAnimationFrame(update);
}
