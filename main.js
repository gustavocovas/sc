const WORLD_WIDTH = 25;
const WORLD_HEIGHT = 25;
const GRID_SIZE = 20;

const TILES = {
  land: { fill: "#F8EA87" },
  water: { fill: "#87DDF8" },
};

let world = [];
let hovered;

let canvas = document.querySelector("#tutorial");
let context = canvas.getContext("2d");

start();

function setMousePosition(e) {
  let rect = canvas.getBoundingClientRect();
  let mouseX = e.clientX - rect.left;
  let mouseY = e.clientY - rect.top;

  let i = Math.floor(mouseY / GRID_SIZE);
  let j = Math.floor(mouseX / GRID_SIZE);

  if (!!world[i] && !!world[i][j]) {
    hovered = world[i][j];
  } else {
    hovered = null;
  }
}

function resetHovering(e) {
  hovered = null;
}

function start() {
  init_world();
  canvas.addEventListener("mousemove", setMousePosition, false);
  canvas.addEventListener("mouseleave", resetHovering, false);
  update();
}

function init_world() {
  for (var i = 0; i < WORLD_HEIGHT; i++) {
    world[i] = [];
  }

  for (var i = 0; i < WORLD_HEIGHT; i++) {
    for (var j = 0; j < WORLD_WIDTH; j++) {
      let type = "land";
      if (Math.random() > 0.5) {
        type = "water";
      }

      world[i][j] = { x: j * GRID_SIZE, y: i * GRID_SIZE, type: type };
    }
  }
}

function update() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < WORLD_HEIGHT; i++) {
    for (var j = 0; j < WORLD_WIDTH; j++) {
      const cell = world[i][j];

      if (!!hovered && hovered.x === cell.x && hovered.y === cell.y) {
        context.beginPath();
        context.rect(cell.x, cell.y, GRID_SIZE, GRID_SIZE);
        context.fillStyle = "#41FFFF";
        context.fill();
      } else {
        context.fillStyle = "black";
        context.strokeRect(cell.x, cell.y, GRID_SIZE, GRID_SIZE);

        context.beginPath();
        context.rect(cell.x, cell.y, GRID_SIZE, GRID_SIZE);
        context.fillStyle = TILES[cell.type].fill;
        context.fill();
      }
    }
  }

  requestAnimationFrame(update);
}
