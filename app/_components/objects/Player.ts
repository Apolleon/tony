import { Level } from "./Level";
import { Vector } from "./Vector";

export class Player {
  pos: Vector;
  size: Vector;
  speed: Vector;
  playerXSpeed = 7;
  gravity = 30;
  jumpSpeed = 17;
  type = "player";

  constructor(pos: Vector) {
    this.pos = pos.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
  }

  moveX(step: number, level: Level, keys: { left: boolean; right: boolean }) {
    this.speed.x = 0;
    if (keys.left) this.speed.x -= this.playerXSpeed;
    if (keys.right) this.speed.x += this.playerXSpeed;

    const motion = new Vector(this.speed.x * step, 0);
    const newPos = this.pos.plus(motion);
    const obstacle = level.obstacleAt(newPos, this.size);
    if (obstacle) level.playerTouched(obstacle);
    else this.pos = newPos;
  }
  moveY(step: number, level: Level, keys: { left: boolean; right: boolean; up: boolean }) {
    this.speed.y += step * this.gravity;
    const motion = new Vector(0, this.speed.y * step);
    const newPos = this.pos.plus(motion);
    const obstacle = level.obstacleAt(newPos, this.size);
    if (obstacle) {
      level.playerTouched(obstacle);
      if (keys.up && this.speed.y > 0) this.speed.y = -this.jumpSpeed;
      else this.speed.y = 0;
    } else {
      this.pos = newPos;
    }
  }
  act(step: number, level: Level, keys: { left: boolean; right: boolean; up: boolean }) {
    this.moveX(step, level, keys);
    this.moveY(step, level, keys);

    const otherActor = level.actorAt(this);
    if (otherActor) level.playerTouched(otherActor.type, otherActor);

    // Losing animation
    if (level.status == "lost") {
      this.pos.y += step;
      this.size.y -= step;
    }
  }
}
