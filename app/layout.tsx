"use client";
import { createContext, Dispatch, SetStateAction, useState } from "react";
import "./globals.css";

type GameContext = {
  gameLevel: string[];
  setLevel: Dispatch<SetStateAction<string[]>>;
  handleAddLine: () => void;
};

export const GameContext = createContext<GameContext>({} as GameContext);

const EMPTY_LINE = new Array(20).fill(" ").join("");
const initialLinesArray = new Array(5).fill(EMPTY_LINE);

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
