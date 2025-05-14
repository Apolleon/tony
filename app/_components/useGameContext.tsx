"use client";
import { createContext, useContext, useState, Dispatch, SetStateAction, ReactNode } from "react";

type GameContextType = {
  gameLevel: string[];
  setLevel: Dispatch<SetStateAction<string[]>>;
  handleAddLine: () => void;
};

const EMPTY_LINE = new Array(20).fill(" ").join("");
const initialLinesArray = new Array(5).fill(EMPTY_LINE);

const initialContext: GameContextType = {
  gameLevel: initialLinesArray,
  setLevel: () => {},
  handleAddLine: () => {},
};

const MyContext = createContext(initialContext);

export function MyContextProvider({ children }: { children: ReactNode }) {
  const [gameLevel, setLevel] = useState<string[]>(initialLinesArray);

  const handleAddLine = () => {
    setLevel((prev) => [...prev, EMPTY_LINE]);
  };

  return <MyContext.Provider value={{ gameLevel, handleAddLine, setLevel }}>{children}</MyContext.Provider>;
}

export const useMyContext = () => useContext(MyContext);
