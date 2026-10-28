import { describe, expect, it } from "vitest";
import {
  buildSearchQuery,
  inferPresence,
  isProspectPresence,
} from "./places";

describe("inferPresence", () => {
  it("flags missing website as Maps listing only", () => {
    expect(inferPresence(null)).toBe("Maps listing only");
    expect(inferPresence("")).toBe("Maps listing only");
  });

  it("detects Facebook and Instagram", () => {
    expect(inferPresence("https://facebook.com/shop")).toBe("Facebook only");
    expect(inferPresence("https://www.instagram.com/salon")).toBe(
      "Instagram only",
    );
  });

  it("treats other URLs as Has modern site", () => {
    expect(inferPresence("https://example.com")).toBe("Has modern site");
  });
});

describe("isProspectPresence", () => {
  it("marks website gaps as prospects", () => {
    expect(isProspectPresence("Maps listing only")).toBe(true);
    expect(isProspectPresence("Has modern site")).toBe(false);
  });
});

describe("buildSearchQuery", () => {
  it("expands Trichy alias and includes Tamil Nadu", () => {
    expect(buildSearchQuery("dental clinics", "Trichy")).toBe(
      "dental clinics in Tiruchirappalli, Tamil Nadu",
    );
  });

  it("includes area when provided", () => {
    expect(buildSearchQuery("restaurants", "Trichy", "Srirangam")).toBe(
      "restaurants in Srirangam, Tiruchirappalli, Tamil Nadu",
    );
  });
});
