import { Player } from "./Player";
import { Coin } from "./Coin";
import { Lava } from "./Lava";
import { Vector } from "./Vector";

const actorChars = {
  "@": Player,
  o: Coin,
  "=": Lava,
  "|": Lava,
  "!": Lava,
};

export class Level {
  width;
  height;
  grid;
  actors;

  constructor(plan) {
    this.width = plan[0].length;
    this.height = plan.length;

    for (let y = 0; y < this.height; y++) {
      const line = plan[y],
        gridLine = [];
      for (let x = 0; x < this.width; x++) {
        const ch = line[x];
        let fieldType;
        const Actor = actorChars[ch];
        if (Actor) this.actors.push(new Actor(new Vector(x, y), ch));
        else if (ch == "x") fieldType = "wall";
        else if (ch == "!") fieldType = "lava";
        gridLine.push(fieldType);
      }
      this.grid.push(gridLine);
    }

    this.player = this.actors.filter((actor) => actor.type == "player")[0];
    this.status = this.finishDelay = null;
  }
  isFinished() {
    return this.status != null && this.finishDelay < 0;
  }
  obstacleAt(pos, size) {
    const xStart = Math.floor(pos.x);
    const xEnd = Math.ceil(pos.x + size.x);
    const yStart = Math.floor(pos.y);
    const yEnd = Math.ceil(pos.y + size.y);

    if (xStart < 0 || xEnd > this.width || yStart < 0) return "wall";
    if (yEnd > this.height) return "lava";
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        const fieldType = this.grid[y][x];
        if (fieldType) return fieldType;
      }
    }
  }
  actorAt(actor) {
    for (let i = 0; i < this.actors.length; i++) {
      const other = this.actors[i];
      if (
        other != actor &&
        actor.pos.x + actor.size.x > other.pos.x &&
        actor.pos.x < other.pos.x + other.size.x &&
        actor.pos.y + actor.size.y > other.pos.y &&
        actor.pos.y < other.pos.y + other.size.y
      )
        return other;
    }
  }
  animate(step, keys) {
    if (this.status != null) this.finishDelay -= step;

    while (step > 0) {
      const thisStep = Math.min(step, maxStep);
      this.actors.forEach((actor) => actor.act(thisStep, this, keys), this);
      step -= thisStep;
    }
  }
  playerTouched(type, actor) {
    if (type == "lava" && this.status == null) {
      this.status = "lost";
      this.finishDelay = 1;
    } else if (type == "coin") {
      this.actors = this.actors.filter((other) => other != actor);
      if (!this.actors.some((actor) => actor.type == "coin")) {
        this.status = "won";
        this.finishDelay = 1;
      }
    }
  }
}
