import { Dispatch, FC } from "react";
import { Tool } from "./types";

interface ToolbarProps {
  setTool: Dispatch<Tool>;
  chosenTool: Tool;
}

export const Toolbar: FC<ToolbarProps> = ({ setTool, chosenTool }) => {
  return (
    <div className="flex flex-col fixed left-10 top-8">
      <div
        onClick={() => setTool("x")}
        className={`w-fit text-black aspect-square hover:drop-shadow-indigo-500 cursor-pointer ${
          chosenTool === "x" ? "bg-amber-600" : ""
        }`}
      >
        block
      </div>
      <div
        onClick={() => setTool(" ")}
        className={`w-fit text-black aspect-square hover:drop-shadow-indigo-500 cursor-pointer ${
          chosenTool === " " ? "bg-amber-600" : ""
        }`}
      >
        space
      </div>
      <div
        onClick={() => setTool("=")}
        className={`w-fit text-black aspect-square hover:drop-shadow-indigo-500 cursor-pointer ${
          chosenTool === "=" ? "bg-amber-600" : ""
        }`}
      >
        hLava
      </div>
      <div
        onClick={() => setTool("|")}
        className={`w-fit text-black aspect-square hover:drop-shadow-indigo-500 cursor-pointer ${
          chosenTool === "|" ? "bg-amber-600" : ""
        }`}
      >
        vLava
      </div>
      <div
        onClick={() => setTool("!")}
        className={`w-fit text-black aspect-square hover:drop-shadow-indigo-500 cursor-pointer ${
          chosenTool === "!" ? "bg-amber-600" : ""
        }`}
      >
        lava
      </div>
      <div
        onClick={() => setTool("@")}
        className={`w-fit text-black aspect-square hover:drop-shadow-indigo-500 cursor-pointer ${
          chosenTool === "@" ? "bg-amber-600" : ""
        }`}
      >
        player
      </div>
      <div
        onClick={() => setTool("o")}
        className={`w-fit text-black aspect-square hover:drop-shadow-indigo-500 cursor-pointer ${
          chosenTool === "o" ? "bg-amber-600" : ""
        }`}
      >
        coin
      </div>
    </div>
  );
};
