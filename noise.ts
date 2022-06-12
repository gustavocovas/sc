interface NoiseCell {
  i: number;
  j: number;
  vector: { x: number; y: number };
}

interface WorldCell {
  i: number;
  j: number;
}

export class Noise {
  private grid: NoiseCell[][] = [];
  private scale: number;

  constructor(width: number, height: number, grid_scale: number) {
    this.scale = grid_scale;

    let grid_height = Math.floor(height / grid_scale) + 1;
    let grid_width = Math.floor(width / grid_scale) + 1;

    for (var i = 0; i < grid_height; i++) {
      this.grid[i] = [];
    }

    for (var i = 0; i < grid_height; i++) {
      for (var j = 0; j < grid_width; j++) {
        let r = 2 * Math.PI * Math.random();
        let gradient = { x: Math.cos(r), y: Math.sin(r) };

        this.grid[i][j] = {
          i: i * this.scale,
          j: j * this.scale,
          vector: gradient,
        };
      }
    }
  }

  at(i: number, j: number): number {
    let cell: WorldCell = { i: i, j: j };

    //   Coordinates for noise cells
    let i0 = Math.floor(i / this.scale);
    let i1 = i0 + 1;
    let j0 = Math.floor(j / this.scale);
    let j1 = j0 + 1;

    let c00 = this.grid[i0][j0];
    let c01 = this.grid[i0][j1];
    let c10 = this.grid[i1][j0];
    let c11 = this.grid[i1][j1];

    // Determine interpolation weights
    let sj = (j + 0.5 - c00.j) / this.scale;
    let si = (i + 0.5 - c00.i) / this.scale;

    // Interpolate between grid point gradients
    let n0 = this.dotGridGradient(cell, c00);
    let n1 = this.dotGridGradient(cell, c01);
    let ix0 = this.interpolate(n0, n1, sj);

    n0 = this.dotGridGradient(cell, c10);
    n1 = this.dotGridGradient(cell, c11);
    let ix1 = this.interpolate(n0, n1, sj);

    let perlin = this.interpolate(ix0, ix1, si);
    return (1 + perlin) / 2;
  }

  // Computes the dot product of the distance and gradient vectors.
  private dotGridGradient(
    world_cell: WorldCell,
    noise_cell: NoiseCell
  ): number {
    // Compute the distance vector, considering the center of the world cell
    let dx = (world_cell.j + 0.5 - noise_cell.j) / this.scale;
    let dy = (world_cell.i + 0.5 - noise_cell.i) / this.scale;

    // Compute the dot-product
    return dx * noise_cell.vector.x + dy * noise_cell.vector.y;
  }

  private interpolate(a0: number, a1: number, w: number) {
    return (a1 - a0) * w + a0;
  }
}
