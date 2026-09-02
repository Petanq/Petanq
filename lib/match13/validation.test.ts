import { describe, expect, it } from "vitest";
import { isCompleteMatch, isInvalidMatch } from "./validation";
import type { Match } from "./types";

function m(scoreA?: number, scoreB?: number): Match {
  return { court: 1, teamA: "A", teamB: "B", scoreA, scoreB };
}

describe("isCompleteMatch", () => {
  it("is always complete for a BYE", () => {
    expect(isCompleteMatch({ court: 1, teamA: "A", teamB: null })).toBe(true);
  });

  it("is incomplete when no scores are entered yet", () => {
    expect(isCompleteMatch(m())).toBe(false);
  });

  it("is incomplete when only one score is entered", () => {
    expect(isCompleteMatch(m(13, undefined))).toBe(false);
  });

  it("is complete when exactly one side has 13 and the other is 0-12", () => {
    expect(isCompleteMatch(m(13, 7))).toBe(true);
    expect(isCompleteMatch(m(2, 13))).toBe(true);
    expect(isCompleteMatch(m(13, 0))).toBe(true);
  });

  it("rejects a 13-13 tie", () => {
    expect(isCompleteMatch(m(13, 13))).toBe(false);
  });

  it("rejects a result where neither side reached 13", () => {
    expect(isCompleteMatch(m(10, 8))).toBe(false);
  });

  it("does NOT treat a Meli-Melo match (teamB = \"\", not null) as a BYE", () => {
    const melee: Match = {
      court: 1,
      teamA: "",
      teamB: "",
      playersA: ["p1", "p2", "p3"],
      playersB: ["p4", "p5", "p6"],
    };
    expect(isCompleteMatch(melee)).toBe(false); // no scores yet — must still require them
    expect(isCompleteMatch({ ...melee, scoreA: 13, scoreB: 7 })).toBe(true);
  });

  it("needs BOTH Kwartet sub-scores individually at 13, not just the summed total", () => {
    const kwartet: Match = { court: 1, teamA: "A", teamB: "B", alleenNaamA: "Jan", alleenNaamB: "Piet" };
    expect(isCompleteMatch({ ...kwartet, scoreEnkelA: 13, scoreEnkelB: 4 })).toBe(false); // triplet part missing
    expect(
      isCompleteMatch({ ...kwartet, scoreEnkelA: 13, scoreEnkelB: 4, scoreTripletA: 8, scoreTripletB: 13 })
    ).toBe(true);
    // A combined total of 13 (e.g. 6+7) means nothing on its own for Kwartet.
    expect(
      isCompleteMatch({ ...kwartet, scoreA: 13, scoreB: 8, scoreEnkelA: 6, scoreEnkelB: 5, scoreTripletA: 7, scoreTripletB: 3 })
    ).toBe(false);
  });
});

describe("isInvalidMatch", () => {
  it("is false while the match is still empty or half-filled", () => {
    expect(isInvalidMatch(m())).toBe(false);
    expect(isInvalidMatch(m(13, undefined))).toBe(false);
  });

  it("is true once both scores are filled in but don't form a valid result", () => {
    expect(isInvalidMatch(m(13, 13))).toBe(true);
    expect(isInvalidMatch(m(10, 8))).toBe(true);
  });

  it("is false for a valid finished result", () => {
    expect(isInvalidMatch(m(13, 6))).toBe(false);
  });

  it("flags an invalid Kwartet sub-score even while the other sub-match is still empty", () => {
    const kwartet: Match = { court: 1, teamA: "A", teamB: "B", alleenNaamA: "Jan", alleenNaamB: "Piet" };
    expect(isInvalidMatch({ ...kwartet, scoreEnkelA: 13, scoreEnkelB: 13 })).toBe(true);
    expect(isInvalidMatch({ ...kwartet, scoreEnkelA: 13, scoreEnkelB: 4 })).toBe(false);
  });
});
