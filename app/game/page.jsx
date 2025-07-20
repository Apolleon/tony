"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMyContext } from "../_components/useGameContext";
import { GameActor, Level } from "../_components/classes";
import Link from "next/link";

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
const arrowCodes = { 37: "left", 38: "up", 39: "right" };

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

      const center = level.player?.pos
        .plus(level.player.size.times(0.5))
        .times(scale);

      if (center.x < left + margin)
        gameRef.current.scrollLeft = center.x - margin;
      else if (center.x > right - margin)
        gameRef.current.scrollLeft = center.x + margin - width;

      if (center.y < top + margin)
        gameRef.current.scrollTop = center.y - margin;
      else if (center.y > bottom - margin)
        gameRef.current.scrollTop = center.y + margin - height;
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [level, status]);

  if (!level) return <div>Loading...</div>;

  const restartLevel = () => {
    const newLevel = new Level(gameLevel);
    setLevel(newLevel);
    setActors([...newLevel.actors]);
    setStatus(null);
  };

  return (
    <section className="w-screen h-screen flex justify-center items-center">
      <div className={`game ${status || ""}`} ref={gameRef}>
        {status && (
          <div className="absolute size-full backdrop-brightness-50 flex items-center justify-center">
            <div className="flex flex-col gap-3 items-center p-5 py-3 bg-amber-600">
              <h2>{status === "won" ? "Ты выиграл!" : "Ты проиграл!"}</h2>
              <div className="flex gap-2">
                <Link href={"/"}>На главную</Link>
                <button onClick={restartLevel}>Заново</button>
              </div>
            </div>
          </div>
        )}
        <Background level={level} />
        {!status && (
          <div className="actors">
            {actors.map((actor, i) => (
              <GameActor key={i} actor={actor} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Game;
