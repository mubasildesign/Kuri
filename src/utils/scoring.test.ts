import { describe, expect, it } from "vitest";
import {
  clamp,
  computePriorityScore,
  formatScore,
  getTier,
} from "./scoring";

describe("clamp", () => {
  it("clamps below min and above max", () => {
    expect(clamp(-1, 0, 5)).toBe(0);
    expect(clamp(9, 0, 5)).toBe(5);
    expect(clamp(3, 0, 5)).toBe(3);
  });
});

describe("computePriorityScore", () => {
  it("scores None presence with no reviews as 5", () => {
    expect(computePriorityScore(null, "None")).toBe(5);
  });

  it("caps review contribution at 5 (100 reviews)", () => {
    // min(100,100)/20 = 5 + Facebook only 4 = 9
    expect(computePriorityScore(100, "Facebook only")).toBe(9);
    expect(computePriorityScore(500, "Facebook only")).toBe(9);
  });

  it("scales reviews linearly up to 100", () => {
    // 40/20 = 2 + Maps listing only 4 = 6
    expect(computePriorityScore(40, "Maps listing only")).toBe(6);
  });

  it("gives Has modern site zero presence gap", () => {
    expect(computePriorityScore(80, "Has modern site")).toBe(4);
  });

  it("treats Instagram only and Outdated site as gap 3", () => {
    expect(computePriorityScore(0, "Instagram only")).toBe(3);
    expect(computePriorityScore(0, "Outdated site")).toBe(3);
  });
});

describe("getTier", () => {
  it("maps score thresholds", () => {
    expect(getTier(8)).toBe("Hot");
    expect(getTier(9.5)).toBe("Hot");
    expect(getTier(6)).toBe("Warm");
    expect(getTier(7.9)).toBe("Warm");
    expect(getTier(4)).toBe("Cool");
    expect(getTier(5.9)).toBe("Cool");
    expect(getTier(3.9)).toBe("Low");
    expect(getTier(0)).toBe("Low");
  });
});

describe("formatScore", () => {
  it("rounds to one decimal", () => {
    expect(formatScore(8)).toBe("8.0");
    expect(formatScore(6.25)).toBe("6.3");
  });
});
