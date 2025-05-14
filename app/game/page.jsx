"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMyContext } from "../_components/useGameContext";

const simpleLevelPlan = [
  "                                     ",
  "                                    o",
  "             !!        x       xxxxxx",
  "    xx  xx        x                  ",
  "                 = x   x    =  о    o",
  "     x      o o        |  xxxxxx     ",
  "xxx @      xxxxx x                 !!",
  "  xxxxx            x     o         xx",
  "      x!!!!!!!!!!!!xxxxxxxxxxxxxxxxxx",
  "      xxxxxxxxxxxxxx  ",
];

const scale = 50;
const maxStep = 0.05;
const wobbleSpeed = 8;
const wobbleDist = 0.07;
const playerXSpeed = 7;
const gravity = 30;
const jumpSpeed = 17;
const arrowCodes = { 37: "left", 38: "up", 39: "right" };

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  plus(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }
  times(factor) {
    return new Vector(this.x * factor, this.y * factor);
  }
}

class Player {
  constructor(pos) {
    this.pos = pos.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
  }
  moveX(step, level, keys) {
    this.speed.x = 0;
    if (keys.left) this.speed.x -= playerXSpeed;
    if (keys.right) this.speed.x += playerXSpeed;

    const motion = new Vector(this.speed.x * step, 0);
    const newPos = this.pos.plus(motion);
    const obstacle = level.obstacleAt(newPos, this.size);
    if (obstacle) level.playerTouched(obstacle);
    else this.pos = newPos;
  }
  moveY(step, level, keys) {
    this.speed.y += step * gravity;
    const motion = new Vector(0, this.speed.y * step);
    const newPos = this.pos.plus(motion);
    const obstacle = level.obstacleAt(newPos, this.size);
    if (obstacle) {
      level.playerTouched(obstacle);
      if (keys.up && this.speed.y > 0) this.speed.y = -jumpSpeed;
      else this.speed.y = 0;
    } else {
      this.pos = newPos;
    }
  }
  act(step, level, keys) {
    this.moveX(step, level, keys);
    this.moveY(step, level, keys);

    const otherActor = level.actorAt(this);
    if (otherActor) level.playerTouched(otherActor.type, otherActor);

    if (level.status === "lost") {
      this.pos.y += step;
      this.size.y -= step;
    }
  }
}

Player.prototype.type = "player";

class Lava {
  constructor(pos, ch) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    if (ch === "=") {
      this.speed = new Vector(2, 0);
    } else if (ch === "|") {
      this.speed = new Vector(0, 2);
    } else if (ch === "!") {
      this.speed = new Vector(0, 3);
      this.repeatPos = pos;
    }
  }
  act(step, level) {
    const newPos = this.pos.plus(this.speed.times(step));
    if (!level.obstacleAt(newPos, this.size)) this.pos = newPos;
    else if (this.repeatPos) this.pos = this.repeatPos;
    else this.speed = this.speed.times(-1);
  }
}

Lava.prototype.type = "lava";

class Coin {
  constructor(pos) {
    this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
    this.size = new Vector(0.6, 0.6);
    this.wobble = Math.random() * Math.PI * 2;
  }
  act(step) {
    this.wobble += step * wobbleSpeed;
    const wobblePos = Math.sin(this.wobble) * wobbleDist;
    this.pos = this.basePos.plus(new Vector(0, wobblePos));
  }
}

Coin.prototype.type = "coin";

const actorChars = {
  "@": Player,
  o: Coin,
  "=": Lava,
  "|": Lava,
  "!": Lava,
};

class Level {
  constructor(plan) {
    this.width = plan[0].length;
    this.height = plan.length;
    this.grid = [];
    this.actors = [];

    for (let y = 0; y < this.height; y++) {
      const line = plan[y];
      const gridLine = [];
      for (let x = 0; x < this.width; x++) {
        let ch = line[x];
        let fieldType = null;
        const Actor = actorChars[ch];
        if (Actor) this.actors.push(new Actor(new Vector(x, y), ch));
        else if (ch === "x") fieldType = "wall";
        else if (ch === "!") fieldType = "lava";
        gridLine.push(fieldType);
      }
      this.grid.push(gridLine);
    }

    this.player = this.actors.filter((actor) => actor.type === "player")[0];
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
        other !== actor &&
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
      let thisStep = Math.min(step, maxStep);
      this.actors.forEach((actor) => {
        actor.act(thisStep, this, keys);
      });
      step -= thisStep;
    }
  }
  playerTouched(type, actor) {
    if (type === "lava" && this.status === null) {
      this.status = "lost";
      this.finishDelay = 1;
    } else if (type === "coin") {
      this.actors = this.actors.filter((other) => other !== actor);
      if (!this.actors.some((actor) => actor.type === "coin")) {
        this.status = "won";
        this.finishDelay = 1;
      }
    }
  }
}

const GameActor = ({ actor }) => {
  const style = {
    width: actor.size.x * scale + "px",
    height: actor.size.y * scale + "px",
    left: actor.pos.x * scale + "px",
    top: actor.pos.y * scale + "px",
  };

  return <div className={`actor ${actor.type}`} style={style}></div>;
};

const Background = ({ level }) => {
  return (
    <table className="background" style={{ width: level.width * scale + "px" }}>
      <tbody>
        {level.grid.map((row, y) => (
          <tr key={y} style={{ height: scale + "px" }}>
            {row.map((type, x) => (
              <td key={x} className={type}></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const trackKeys = (codes) => {
  const pressed = {};

  const handler = (event) => {
    if (codes.hasOwnProperty(event.keyCode)) {
      const down = event.type === "keydown";
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handler);
    window.addEventListener("keyup", handler);

    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("keyup", handler);
    };
  }, []);

  return pressed;
};

const validateLevel = (level) => {
  if (!level) return false;
  return level.every((line) => line.split("").every((char) => char === " "));
};

const Game = () => {
  const router = useRouter();
  const [level, setLevel] = useState(null);
  const [status, setStatus] = useState(null);
  const [actors, setActors] = useState([]);
  const gameRef = useRef(null);
  const keys = useRef({});
  const animationRef = useRef(null);
  const lastTime = useRef(null);
  const { gameLevel } = useMyContext();

  useEffect(() => {
    if (validateLevel(gameLevel)) return router.push("/");
    // Initial level setup
    const newLevel = new Level(gameLevel);
    setLevel(newLevel);
    setActors([...newLevel.actors]);

    // Setup key tracking
    keys.current = { left: false, right: false, up: false };
    const handler = (event) => {
      if (arrowCodes.hasOwnProperty(event.keyCode)) {
        const down = event.type === "keydown";
        keys.current[arrowCodes[event.keyCode]] = down;
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handler);
    window.addEventListener("keyup", handler);

    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("keyup", handler);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if (!level) return;

    const animate = (time) => {
      if (lastTime.current != null) {
        const timeStep = Math.min(time - lastTime.current, 100) / 1000;

        level.animate(timeStep, keys.current);
        setActors([...level.actors]);

        if (level.status !== status) {
          setStatus(level.status);
        }

        if (level.isFinished()) {
          if (level.status === "lost") {
            // Reset level
            const newLevel = new Level(gameLevel);
            setLevel(newLevel);
            setActors([...newLevel.actors]);
            setStatus(null);
          } else {
            console.log("You win!");
            return;
          }
        }

        scrollPlayerIntoView();
      }

      lastTime.current = time;
      animationRef.current = requestAnimationFrame(animate);
    };

    const scrollPlayerIntoView = () => {
      if (!gameRef.current || !level.player) return;

      const width = gameRef.current.clientWidth;
      const height = gameRef.current.clientHeight;
      const margin = width / 3;

      const left = gameRef.current.scrollLeft;
      const right = left + width;
      const top = gameRef.current.scrollTop;
      const bottom = top + height;

      const center = level.player?.pos.plus(level.player.size.times(0.5)).times(scale);

      if (center.x < left + margin) gameRef.current.scrollLeft = center.x - margin;
      else if (center.x > right - margin) gameRef.current.scrollLeft = center.x + margin - width;

      if (center.y < top + margin) gameRef.current.scrollTop = center.y - margin;
      else if (center.y > bottom - margin) gameRef.current.scrollTop = center.y + margin - height;
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [level, status]);

  if (!level) return <div>Loading...</div>;

  return (
    <div className={`game ${status || ""}`} ref={gameRef}>
      <Background level={level} />
      <div className="actors">
        {actors.map((actor, i) => (
          <GameActor key={i} actor={actor} />
        ))}
      </div>
    </div>
  );
};

export default Game;
