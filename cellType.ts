import { Color } from "./colors.js";

interface CellTypeDefinition {
  fill: string;
  canBuild: boolean;
  canBulldoze: boolean;
  landValue: number;
}

export class CellType {
  static readonly LAND = new CellType("land", {
    fill: Color.TAN.toFill(),
    canBuild: true,
    canBulldoze: false,
    landValue: 5,
  });
  static readonly FOREST = new CellType("forest", {
    fill: Color.DARKGREEN.toFill(),
    canBuild: true,
    canBulldoze: true,
    landValue: 20,
  });
  static readonly WATER = new CellType("water", {
    fill: Color.BLUE.toFill(),
    canBuild: false,
    canBulldoze: false,
    landValue: 20,
  });
  static readonly HOUSE = new CellType("house", {
    fill: Color.ORANGE.toFill(),
    canBuild: false,
    canBulldoze: true,
    landValue: 10,
  });
  static readonly ROAD = new CellType("road", {
    fill: Color.DARKGREY.toFill(),
    canBuild: false,
    canBulldoze: true,
    landValue: -5,
  });
  static readonly POWERPLANT = new CellType("powerplant", {
    fill: Color.PURPLE.toFill(),
    canBuild: false,
    canBulldoze: true,
    landValue: -10,
  });

  private constructor(
    private readonly key: string,
    public readonly value: CellTypeDefinition
  ) {}

  toString() {
    return this.key;
  }
}
