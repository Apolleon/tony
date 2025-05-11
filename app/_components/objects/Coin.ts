import { Vector } from "./Vector";

export class Coin {
  basePos: Vector;
  pos: Vector;
  size: Vector;
  wobble: number;
  type = "coin";
  wobbleSpeed = 8;
  wobbleDist = 0.07;

  constructor(pos: Vector) {
    this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
    this.size = new Vector(0.6, 0.6);
    this.wobble = Math.random() * Math.PI * 2;
  }
  act(step: number) {
    this.wobble += step * this.wobbleSpeed;
    const wobblePos = Math.sin(this.wobble) * this.wobbleDist;
    this.pos = this.basePos.plus(new Vector(0, wobblePos));
  }
}
