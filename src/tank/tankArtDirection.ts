import type { FishHungerStage, FishSpeciesTag } from "../sim/types";

type FishPalette = {
  body: string;
  belly: string;
  fin: string;
  eye: string;
  pupil: string;
};

type FloorPalette = {
  deep: string;
  mid: string;
  sand: string;
  highlight: string;
};

const HERBIVORE_PALETTE: FishPalette = {
  body: "#6bc0dd",
  belly: "#d6f1fb",
  fin: "#4f97bf",
  eye: "#f9fcff",
  pupil: "#0f1d2a",
};

const CARNIVORE_PALETTE: FishPalette = {
  body: "#d67667",
  belly: "#f9dbd6",
  fin: "#af4e44",
  eye: "#fff4ef",
  pupil: "#2e110e",
};

const HUNGER_TINT: Record<FishHungerStage, number> = {
  healthy: 1,
  hungry: 0.88,
  starving: 0.74,
};

export const FOOD_FLAKE_COLORS = ["#dcb775", "#cd9b54", "#e4c990", "#be8850"] as const;

export const FLOOR_PALETTE: FloorPalette = {
  deep: "#0f1f2a",
  mid: "#193647",
  sand: "#21445d",
  highlight: "#2f627f",
};

export function getFishPalette(species: FishSpeciesTag, hunger: FishHungerStage): FishPalette {
  const base = species.kind === "carnivore" ? CARNIVORE_PALETTE : HERBIVORE_PALETTE;
  const tint = HUNGER_TINT[hunger];
  return {
    ...base,
    body: multiplyHex(base.body, tint),
    fin: multiplyHex(base.fin, tint),
    belly: multiplyHex(base.belly, Math.min(1, tint + 0.06)),
  };
}

export function getFoodFlakeColor(index: number): string {
  return FOOD_FLAKE_COLORS[index % FOOD_FLAKE_COLORS.length];
}

export function createFloorTextureCanvas(size = 256): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const gradient = context.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, FLOOR_PALETTE.deep);
  gradient.addColorStop(0.52, FLOOR_PALETTE.mid);
  gradient.addColorStop(1, FLOOR_PALETTE.sand);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  context.strokeStyle = FLOOR_PALETTE.highlight;
  context.globalAlpha = 0.12;
  context.lineWidth = Math.max(1, size * 0.012);

  const bandStep = Math.max(14, Math.floor(size * 0.08));
  for (let y = bandStep; y < size; y += bandStep) {
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(size * 0.28, y - 4, size * 0.72, y + 4, size, y);
    context.stroke();
  }

  context.globalAlpha = 1;
  return canvas;
}

function multiplyHex(hex: string, multiplier: number): string {
  const clean = hex.replace("#", "");
  const int = Number.parseInt(clean, 16);
  const r = Math.min(255, Math.max(0, Math.round(((int >> 16) & 0xff) * multiplier)));
  const g = Math.min(255, Math.max(0, Math.round(((int >> 8) & 0xff) * multiplier)));
  const b = Math.min(255, Math.max(0, Math.round((int & 0xff) * multiplier)));
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, "0");
}
