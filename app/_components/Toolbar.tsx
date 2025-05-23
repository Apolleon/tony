import { Dispatch, FC, useState, useEffect, useRef, ReactNode } from "react";
import { Tool } from "./types";
import { GameActor, Lava, Level, Vector, Coin } from "../game/page";

interface ToolbarProps {
  setTool: Dispatch<Tool>;
  chosenTool: Tool;
}

const LEVEL = new Level(["   ", "  "]);

export const Toolbar: FC<ToolbarProps> = ({ setTool, chosenTool }) => {
  const [actors, setActors] = useState([
    new Lava(new Vector(0, 0), "="),
    new Coin(new Vector(0, 1)),
    new Lava(new Vector(0, 1), "!"),
    new Lava(new Vector(0, 0), "|"),
  ]);
  const animationRef = useRef<number>(null);
  const lastTime = useRef<number>(null);

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTime.current != null) {
        let step = Math.min(time - lastTime.current, 100) / 1000;

        while (step > 0) {
          const thisStep = Math.min(step, 0.05);
          const newActors = actors.map((actor) => {
            actor.act(thisStep, LEVEL);
            return actor;
          });

          step -= thisStep;

          setActors(newActors);
        }
      }

      lastTime.current = time;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef?.current);
    };
  }, []);

  return (
    <div className="flex flex-col fixed left-10 -top-30 bg-black w-40 text-center items-center scale-50">
      <ToolItem isChosen={chosenTool === "x"} setTool={setTool} symbol={"x"} title={"Wall"}>
        <div className="wall size-10" />
      </ToolItem>
      <ToolItem isChosen={chosenTool === " "} setTool={setTool} symbol={" "} title={"Empty space"} />
      <ToolItem isChosen={chosenTool === "="} setTool={setTool} symbol={"="} title={"Horizontal lava"}>
        <GameActor actor={actors[0]} />
      </ToolItem>
      <ToolItem isChosen={chosenTool === "|"} setTool={setTool} symbol={"|"} title={"Vertical lava"}>
        <GameActor actor={actors[3]} />
      </ToolItem>
      <ToolItem isChosen={chosenTool === "!"} setTool={setTool} symbol={"!"} title={"Lava"}>
        <GameActor actor={actors[2]} />
      </ToolItem>
      <ToolItem isChosen={chosenTool === "o"} setTool={setTool} symbol={"o"} title={"Coin"}>
        <GameActor actor={actors[1]} />
      </ToolItem>
      <ToolItem isChosen={chosenTool === "@"} setTool={setTool} symbol={"@"} title={"Player"}>
        <img alt="tony" src={"/tony.png"} className="h-20 w-8" />
      </ToolItem>
    </div>
  );
};

const ToolItem = ({
  isChosen,
  setTool,
  symbol,
  title,
  children,
}: {
  isChosen: boolean;
  setTool: Dispatch<Tool>;
  symbol: Tool;
  title: string;
  children?: ReactNode;
}) => {
  return (
    <div
      onClick={() => setTool(symbol)}
      className={`w-full flex flex-col text-white font-semibold aspect-square hover:drop-shadow-indigo-500 cursor-pointer overflow-hidden relative items-center ${
        isChosen ? "bg-amber-600" : ""
      }`}
    >
      <div className="grow" />
      {children}
      {title}
    </div>
  );
};
