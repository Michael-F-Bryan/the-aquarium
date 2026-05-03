import { describe, expect, it } from "vitest";
import {
  TANK_CAMERA_FAR,
  TANK_CAMERA_FOV,
  TANK_CAMERA_NEAR,
  TANK_CAMERA_POSITION,
  TANK_FLOOR_Y,
  TANK_SCENE_BACKGROUND,
} from "./tankCameraConstants";

describe("tank camera constants", () => {
  it("uses a moderate FOV for readable framing on wide and tall screens", () => {
    expect(TANK_CAMERA_FOV).toBeGreaterThanOrEqual(35);
    expect(TANK_CAMERA_FOV).toBeLessThanOrEqual(55);
  });

  it("positions the camera above and in front of the origin", () => {
    const [x, y, z] = TANK_CAMERA_POSITION;
    expect(x).toBe(0);
    expect(y).toBeGreaterThan(0);
    expect(z).toBeGreaterThan(0);
  });

  it("keeps clip planes sensible for a room-scale tank", () => {
    expect(TANK_CAMERA_NEAR).toBeGreaterThan(0);
    expect(TANK_CAMERA_FAR).toBeGreaterThan(TANK_CAMERA_NEAR);
  });

  it("exposes scene styling tokens", () => {
    expect(TANK_SCENE_BACKGROUND).toMatch(/^#[0-9a-f]{6}$/i);
    expect(TANK_FLOOR_Y).toBeLessThan(0);
  });
});
