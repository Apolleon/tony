"use client";
import { createContext, useContext, useState, Dispatch, SetStateAction, ReactNode } from "react";

type GameContextType = {
  gameLevel: string[];
  setLevel: Dispatch<SetStateAction<string[]>>;
  handleAddLine: () => void;
  clearLevel: () => void;
};

const EMPTY_LINE = new Array(20).fill(" ").join("");
const initialLinesArray = new Array(5).fill(EMPTY_LINE);

const initialContext: GameContextType = {
  gameLevel: initialLinesArray,
  setLevel: () => {},
  handleAddLine: () => {},
  clearLevel: () => {},
};

const MyContext = createContext(initialContext);

export function MyContextProvider({ children }: { children: ReactNode }) {
  const [gameLevel, setLevel] = useState<string[]>(initialLinesArray);

  const handleAddLine = () => {
    const currentLinesLength = gameLevel[0].length;
    const newLine = new Array(currentLinesLength).fill(" ").join("");
    setLevel((prev) => [...prev, newLine]);
  };

  const handleClear = () => {
    setLevel(initialLinesArray);
  };

  return (
    <MyContext.Provider value={{ gameLevel, handleAddLine, setLevel, clearLevel: handleClear }}>
      {children}
    </MyContext.Provider>
  );
}

export const useMyContext = () => useContext(MyContext);
