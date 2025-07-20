"use client";
import { useState, useEffect, useCallback } from "react";
import { Tool } from "./types";
import { Toolbar } from "./Toolbar";
import { useRouter } from "next/navigation";
import { useMyContext } from "./useGameContext";

const actorChars: { [key: string]: string } = {
  "@": "player",
  o: "coin",
  "=": "lava",
  "|": "lava",
  "!": "lava",
  x: "wall",
  " ": "space",
};

const validateLevel = (level: string[]) => {
  return level.some((line) => line.includes("@"));
};

export const LeveLconstructor = () => {
  const router = useRouter();
  const { gameLevel, setLevel, handleAddLine, clearLevel } = useMyContext();
  const [tool, setTool] = useState<Tool>(" ");
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = useCallback(
    (lineIndex: number, charIndex: number) => {
      setIsMouseDown(true);

      let newLevel = gameLevel;
      if (tool === "@") {
        if (lineIndex === 0) return;
        if (newLevel[lineIndex - 1][charIndex] !== " ") return;
        newLevel = newLevel.map((line) => line.replace("@", " "));
      }

      newLevel = newLevel.map((line, i) => {
        if (i === lineIndex) {
          return (
            line.substring(0, charIndex) + tool + line.substring(charIndex + 1)
          );
        }
        return line;
      });

      setLevel(newLevel);
    },
    [tool, setLevel, gameLevel]
  );

  const handleMouseEnter = (blockId: number, lineIndex: number) => {
    if (!isMouseDown || tool === "@") return;

    setLevel((prev) =>
      prev.map((line, i) => {
        if (i === lineIndex) {
          return (
            line.substring(0, blockId) + tool + line.substring(blockId + 1)
          );
        }
        return line;
      })
    );
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleAddColumn = () => {
    setLevel((prev) => prev.map((line) => line + " "));
  };

  const handleDeleteColumn = () => {
    setLevel((prev) => prev.map((line) => line.substring(0, line.length - 1)));
  };

  return (
    <section className="flex gap-8 justify-center w-screen h-screen items-center">
      <div className="grid grid-cols-[auto_30px] gap-8 w-min">
        <Toolbar setTool={setTool} chosenTool={tool} />
        <div className="flex gap-8 items-center">
          <div className="w-fit overflow-auto grid bg-blue-500">
            {gameLevel.map((line, lineIndex) => (
              <div key={lineIndex} className="flex">
                {line.split("").map((char, charIndex) => (
                  <div
                    onMouseDown={() => handleMouseDown(lineIndex, charIndex)}
                    onMouseEnter={() => handleMouseEnter(charIndex, lineIndex)}
                    className={`${actorChars[char]} border-1 border-black w-5 h-5 cursor-pointer`}
                    key={charIndex}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5 h-full justify-center">
          <div className="btn" onClick={handleAddColumn}>
            <span>+</span>
          </div>
          <button className="btn" onClick={handleDeleteColumn}>
            <span>-</span>
          </button>
        </div>
        <div className="flex gap-5 w-full justify-center">
          <button className="btn !text-xl" onClick={handleAddLine}>
            Add line
          </button>
          <button
            className="btn"
            onClick={() => router.push("/game")}
            disabled={!validateLevel(gameLevel)}
          >
            Play
          </button>
          <button className="btn !text-xl" onClick={clearLevel}>
            Clear
          </button>
        </div>
      </div>
    </section>
  );
};
