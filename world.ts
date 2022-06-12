import { CellType } from "./cellType.js";
import { Noise } from "./noise.js";

export interface Cell {
  i: number;
  j: number;
  x: number;
  y: number;
  type: CellType;
  landValue: number;
}

export class World {
  cellSize: number;
  width: number;
  height: number;
  noiseScale: number;
  private w: Cell[][] = [];

  constructor(
    cellSize: number,
    width: number,
    height: number,
    noiseScale: number
  ) {
    this.cellSize = cellSize;
    this.width = width;
    this.height = height;
    this.noiseScale = noiseScale;
  }

  init() {
    let elevation = new Noise(this.width, this.height, this.noiseScale);
    let fertility = new Noise(this.width, this.height, this.noiseScale);

    for (var i = 0; i < this.height; i++) {
      this.w[i] = [];
    }

    for (var i = 0; i < this.height; i++) {
      for (var j = 0; j < this.width; j++) {
        let e = elevation.at(i, j);

        let type = CellType.WATER;
        if (e > 0.45) {
          type = CellType.LAND;

          let f = fertility.at(i, j);
          if (f > 0.5) {
            type = CellType.FOREST;
          }
        }

        this.w[i][j] = {
          i: i,
          j: j,
          x: j * this.cellSize,
          y: i * this.cellSize,
          type: type,
          landValue: 0,
        };
      }
    }
  }

  at(i: number, j: number): Cell {
    return this.w[i][j];
  }

  existsAt(i: number, j: number): boolean {
    return i > 0 && i < this.height && j > 0 && j < this.width;
  }

  updateLandValue() {
    for (var i = 0; i < this.height; i++) {
      for (var j = 0; j < this.width; j++) {
        const cell = this.w[i][j];
        cell.landValue = 0;

        if (cell.type === CellType.WATER) {
          continue;
        }

        for (var r = i - 1; r <= i + 1; r++) {
          for (var c = j - 1; c <= j + 1; c++) {
            if (this.existsAt(r, c) && (r !== i || c !== j)) {
              this.w[i][j].landValue += this.w[r][c].type.value.landValue;
            }
          }
        }
      }
    }
  }
}
