import { CellType } from "./cellType.js";
import { Color } from "./colors.js";
import { Cell, World } from "./world.js";

let mapCanvas: HTMLCanvasElement = document.querySelector("#map")!;
let mapContext = mapCanvas.getContext("2d")!;

let hoverCanvas: HTMLCanvasElement = document.querySelector("#hover")!;
let hoverContext = hoverCanvas.getContext("2d")!;

let minimapCanvas: HTMLCanvasElement = document.querySelector("#minimap")!;
let minimapContext = minimapCanvas.getContext("2d")!;

const CELL_SIZE = 20;
const WORLD_WIDTH = Math.floor(mapCanvas.width / CELL_SIZE);
const WORLD_HEIGHT = Math.floor(mapCanvas.height / CELL_SIZE);
const NOISE_SCALE = 5;

// function fillForLandValue(landValue) {
// let colorScale = ["red", "orange", "yellow", "green", "darkgreen"];
// let i = Math.floor((80 + landValue) / 60);
// return fillFromColor(COLORS[colorScale[i]]);
// }

const MODE_HOVER_DIMENSIONS = {
  hover: { width: 1, height: 1 },
  query: { width: 1, height: 1 },
  bulldozer: { width: 1, height: 1 },
  buildHouse: { width: 1, height: 1 },
  buildRoad: { width: 1, height: 1 },
  buildPowerplant: { width: 3, height: 2 },
};

let hovering = false;
let hoveringIllegal = false;
let hovered: Cell[] = [];

let currentMode = "query";
let world: World;

start();

function changeMode(mode: string) {
  let currentModeBtn = document.querySelector("#" + currentMode + "Btn");
  if (!!currentModeBtn) {
    currentModeBtn.classList.remove("mediumgrey");
    currentModeBtn.classList.add("lightgrey");
  }

  let nextModeBtn = document.querySelector("#" + mode + "Btn");
  if (!!nextModeBtn) {
    nextModeBtn.classList.add("mediumgrey");
  }

  document.querySelector("#mode")!.innerHTML = mode;
  currentMode = mode;
}

// TODO: Not working, probable because we are using script type="module"
export function toggleMode(mode: string) {
  if (currentMode === mode) {
    changeMode("query");
  } else {
    changeMode(mode);
  }
}

function setMousePosition(e: MouseEvent) {
  let rect = hoverCanvas.getBoundingClientRect();
  let mouseX = e.clientX - rect.left;
  let mouseY = e.clientY - rect.top;

  let i = Math.floor(mouseY / CELL_SIZE);
  let j = Math.floor(mouseX / CELL_SIZE);

  if (hovering && i === hovered[0].i && j === hovered[0].j) {
    // The cell currently hovered is the same as last time, nothing to do
    return;
  }

  if (world.existsAt(i, j)) {
    hovering = true;
    hoveringIllegal = false;
    hovered = [];

    // TODO: fix
    // for (var k = 0; k < MODE_HOVER_DIMENSIONS[currentMode].height; k++) {
    //   for (var l = 0; l < MODE_HOVER_DIMENSIONS[currentMode].width; l++) {
    for (var k = 0; k < 1; k++) {
      for (var l = 0; l < 1; l++) {
        if (world.existsAt(i + k, j + l)) {
          hovered.push(world.at(i + k, j + l));
          let hoveredCellType = world.at(i + k, j + l).type.value;
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

function resetHovering(e: MouseEvent) {
  hovering = false;
  hoveringIllegal = false;
  hovered = [];
}

function click(e: MouseEvent) {
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
          hovered[i].type = CellType.LAND;
          break;
        case "buildHouse":
          hovered[i].type = CellType.HOUSE;
          break;
        case "buildRoad":
          hovered[i].type = CellType.ROAD;
          break;
        case "buildPowerplant":
          hovered[i].type = CellType.POWERPLANT;
          break;
        default:
          break;
      }
    }
    world.updateLandValue();
    drawWorld();
  }
}

function start() {
  world = new World(CELL_SIZE, WORLD_WIDTH, WORLD_HEIGHT, NOISE_SCALE);
  world.init();
  world.updateLandValue();

  drawWorld();
  toggleMode("query");
  changeMode("query");

  hoverCanvas.addEventListener("mousemove", setMousePosition, false);
  hoverCanvas.addEventListener("mouseleave", resetHovering, false);
  hoverCanvas.addEventListener("click", click, false);
  update();
}

function isHovering(cell: Cell) {
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
  mapContext!.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

  for (var i = 0; i < WORLD_HEIGHT; i++) {
    for (var j = 0; j < WORLD_WIDTH; j++) {
      const cell = world.at(i, j);

      mapContext.fillStyle = Color.BLACK.toFill();
      mapContext.strokeRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);

      mapContext.beginPath();
      mapContext.rect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
      mapContext.fillStyle = cell.type.value.fill;

      mapContext.fill();
    }
  }

  // minimapContext.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);

  // for (var i = 0; i < WORLD_HEIGHT; i++) {
  //   for (var j = 0; j < WORLD_WIDTH; j++) {
  //     const cell = world[i][j];

  //     let minimap_cell_size = 2;

  //     minimapContext.beginPath();

  //     minimapContext.rect(
  //       j * minimap_cell_size,
  //       i * minimap_cell_size,
  //       minimap_cell_size,
  //       minimap_cell_size
  //     );

  //     // minimapContext.fillStyle = fillForLandValue(cell.landValue);
  //     minimapContext.fill();
  //   }
  // }
}

function update() {
  hoverContext.clearRect(0, 0, hoverCanvas.width, hoverCanvas.height);

  for (var i = 0; i < WORLD_HEIGHT; i++) {
    for (var j = 0; j < WORLD_WIDTH; j++) {
      let cell = world.at(i, j);
      if (isHovering(cell)) {
        hoverContext.beginPath();
        hoverContext.rect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
        if (hoveringIllegal) {
          hoverContext.fillStyle = Color.RED.toFill();
        } else {
          hoverContext.fillStyle = Color.CYAN.toFill();
        }

        hoverContext.fill();
      }
    }
  }

  requestAnimationFrame(update);
}
