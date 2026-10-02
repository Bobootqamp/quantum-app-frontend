import { describe, expect, it } from "vitest";
import { countsToProbabilities } from "../src/lib/probabilities";

describe("countsToProbabilities", () => {
  it("normalizes counts and sorts by bitstring", () => {
    expect(countsToProbabilities({ "11": 512, "00": 512 })).toEqual([
      { state: "00", count: 512, probability: 0.5 },
      { state: "11", count: 512, probability: 0.5 },
    ]);
  });

  it("returns an empty list for empty counts", () => {
    expect(countsToProbabilities({})).toEqual([]);
  });
});
