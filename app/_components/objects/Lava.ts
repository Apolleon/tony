import { Coordinate } from "../types";
import { Vector } from "./Vector";

export class Lava {
  pos: Coordinate;
  size: Vector;
  speed: Vector | undefined;
  repeatPos: Coordinate | undefined;
  type = "lava";

  constructor(pos: Coordinate, ch: string) {
    this.pos = pos;
    this.size = new Vector(1, 1);

    if (ch == "=") {
      this.speed = new Vector(2, 0);
    } else if (ch == "|") {
      this.speed = new Vector(0, 2);
    } else if (ch == "v") {
      this.speed = new Vector(0, 3);
      this.repeatPos = pos;
    }
  }
}
