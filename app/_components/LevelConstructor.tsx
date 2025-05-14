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
  const { gameLevel, setLevel, handleAddLine } = useMyContext();
  const [tool, setTool] = useState<Tool>(" ");
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = useCallback(
    (lineIndex: number, charIndex: number) => {
      setIsMouseDown(true);
      setLevel((prev) =>
        prev.map((line, i) => {
          if (i === lineIndex) {
            return line.substring(0, charIndex) + tool + line.substring(charIndex + 1);
          }
          return line;
        })
      );
    },
    [tool, setLevel]
  );

  const handleMouseEnter = (blockId: number, lineIndex: number) => {
    if (!isMouseDown) return;
    setLevel((prev) =>
      prev.map((line, i) => {
        if (i === lineIndex) {
          return line.substring(0, blockId) + tool + line.substring(blockId + 1);
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
    <section className="flex flex-col gap-2 justify-center w-screen h-screen items-center">
      <Toolbar setTool={setTool} chosenTool={tool} />
      <div className="flex gap-2 items-center">
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
        <div className="flex flex-col gap-5">
          <div className="border-1 font-2xl w-5 text-center font-bold cursor-pointer" onClick={handleAddColumn}>
            +
          </div>
          <div className="border-1 font-2xl w-5 text-center font-bold cursor-pointer" onClick={handleDeleteColumn}>
            -
          </div>
        </div>
      </div>
      <button className="cursor-pointer" onClick={handleAddLine}>
        Add line
      </button>
      <button
        className={`cursor-pointer ${!validateLevel(gameLevel) ? "text-gray-500" : ""}`}
        onClick={() => router.push("/game")}
        disabled={!validateLevel(gameLevel)}
      >
        Play
      </button>
    </section>
  );
};
