import { Coin } from "./objects/Coin";
import { Lava } from "./objects/Lava";
import { Player } from "./objects/Player";

export type Tool = "x" | "=" | "|" | "!" | " " | "@" | "o";

export type Actor = Lava | Coin | Player;
export type Coordinate = { x: number; y: number };
