"use client";
import { createContext, Dispatch, SetStateAction, useState } from "react";
import "./globals.css";

type GameContext = {
  gameLevel: string[];
  setLevel: Dispatch<SetStateAction<string[]>>;
  handleAddLine: () => void;
};

const EMPTY_LINE = new Array(20).fill(" ").join("");
const initialLinesArray = new Array(5).fill(EMPTY_LINE);

const initialContext: GameContext = {
  gameLevel: initialLinesArray,
  setLevel: () => {},
  handleAddLine: () => {},
};

export const GameContext = createContext<GameContext>(initialContext);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [gameLevel, setLevel] = useState<string[]>(initialLinesArray);

  const handleAddLine = () => {
    setLevel((prev) => [...prev, EMPTY_LINE]);
  };
  return (
    <GameContext.Provider value={{ gameLevel, setLevel, handleAddLine }}>
      <html lang="en">
        <body>{children}</body>
      </html>
    </GameContext.Provider>
  );
}
