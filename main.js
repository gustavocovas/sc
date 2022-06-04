let mapCanvas = document.querySelector("#map");
let mapContext = mapCanvas.getContext("2d");

let hoverCanvas = document.querySelector("#hover");
let hoverContext = hoverCanvas.getContext("2d");

const CELL_SIZE = 20;
const WORLD_WIDTH = Math.floor(mapCanvas.width / CELL_SIZE);
const WORLD_HEIGHT = Math.floor(mapCanvas.height / CELL_SIZE);
const NOISE_SCALE = 5;

const CELL_TYPES = {
  land: { fill: "#F8EA87", canBuild: true, canBulldoze: false },
  forest: { fill: "green", canBuild: true, canBulldoze: true },
  water: { fill: "#87DDF8", canBuild: false, canBulldoze: false },
  house: { fill: "orange", canBuild: false, canBulldoze: true },
  road: { fill: "gray", canBuild: false, canBulldoze: true },
};

let world = [];
let elevation;
let hovering = false;
let hovered;

let currentMode;

start();

function changeMode(mode) {
  currentMode = mode;
  document.querySelector("#mode").innerHTML = mode;
}

function toggleMode(mode) {
  if (currentMode === mode) {
    changeMode("hover");
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

  if (!!world[i] && !!world[i][j]) {
    hovering = true;
    hovered = world[i][j];
  } else {
    hovering = false;
    hovered = null;
  }
}

function resetHovering(e) {
  hovering = false;
  hovered = null;
}

function click(e) {
  if (hovering) {
    let hoveredCellType = CELL_TYPES[hovered.type];
    switch (currentMode) {
      case "bulldozer":
        if (hoveredCellType.canBulldoze) {
          hovered.type = "land";
          drawWorld();
        }
        break;
      case "buildHouse":
        if (hoveredCellType.canBuild) {
          hovered.type = "house";
          drawWorld();
        }
        break;
      case "buildRoad":
        if (hoveredCellType.canBuild) {
          hovered.type = "road";
          drawWorld();
        }
        break;
      default:
        break;
    }
  }
}

function start() {
  init_world();
  drawWorld();
  changeMode("hover");
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
  return hovering && hovered.x === cell.x && hovered.y === cell.y;
}

function drawWorld() {
  mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

  for (var i = 0; i < WORLD_HEIGHT; i++) {
    for (var j = 0; j < WORLD_WIDTH; j++) {
      const cell = world[i][j];

      mapContext.fillStyle = "black";
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
        hoverContext.fillStyle = "rgba(41,255,255,0.5)";
        hoverContext.fill();
      }
    }
  }

  requestAnimationFrame(update);
}
