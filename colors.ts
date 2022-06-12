interface ColorDefinition {
  r: number;
  g: number;
  b: number;
}

export class Color {
  static readonly YELLOW = new Color("yellow", { r: 252, g: 244, b: 4 });
  static readonly ORANGE = new Color("orange", { r: 255, g: 100, b: 4 });
  static readonly RED = new Color("red", { r: 220, g: 8, b: 8 });
  static readonly MAGENTA = new Color("magenta", { r: 240, g: 8, b: 132 });
  static readonly PURPLE = new Color("purple", { r: 72, g: 0, b: 164 });
  static readonly BLUE = new Color("blue", { r: 0, g: 0, b: 212 });
  static readonly CYAN = new Color("cyan", { r: 0, g: 172, b: 232 });
  static readonly GREEN = new Color("green", { r: 32, g: 184, b: 20 });
  static readonly DARKGREEN = new Color("darkgreen", { r: 0, g: 100, b: 16 });
  static readonly BROWN = new Color("brown", { r: 88, g: 44, b: 4 });
  static readonly TAN = new Color("tan", { r: 144, g: 112, b: 56 });
  static readonly LIGHTGREY = new Color("lightgrey", {
    r: 192,
    g: 192,
    b: 192,
  });
  static readonly MEDIUMGREY = new Color("mediumgrey", {
    r: 128,
    g: 128,
    b: 128,
  });
  static readonly DARKGREY = new Color("darkgrey", { r: 64, g: 64, b: 64 });
  static readonly BLACK = new Color("black", { r: 0, g: 0, b: 0 });

  private constructor(
    private readonly key: string,
    public readonly value: ColorDefinition
  ) {}

  toString() {
    return this.key;
  }

  toFill(): string {
    return (
      "rgb(" + this.value.r + "," + this.value.g + "," + this.value.b + ")"
    );
  }
}
