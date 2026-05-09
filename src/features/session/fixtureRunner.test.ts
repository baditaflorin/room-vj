import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeFixture } from "./analysisEngine";
import { evaluateFixture } from "./fixtureRunner";
import type { FixtureDefinition, FixtureExpectation } from "./fixtureTypes";

const fixtureDir = join(process.cwd(), "test/fixtures/realdata");

function loadJson<T>(fileName: string): T {
  return JSON.parse(readFileSync(join(fixtureDir, fileName), "utf8")) as T;
}

function listFixtureIds() {
  return readdirSync(fixtureDir)
    .filter((name) => name.endsWith(".fixture.json"))
    .map((name) => name.replace(".fixture.json", ""))
    .sort();
}

describe("real-data fixtures", () => {
  for (const fixtureId of listFixtureIds()) {
    it(`matches expected analysis for ${fixtureId}`, () => {
      const fixture = loadJson<FixtureDefinition>(`${fixtureId}.fixture.json`);
      const expected = loadJson<FixtureExpectation>(
        `${fixtureId}.expected.json`,
      );
      const evaluation = evaluateFixture(fixture, expected);
      expect(evaluation.mismatches).toEqual([]);
      expect(evaluation.pass).toBe(true);
    });
  }

  it("produces deterministic analysis for the same fixture", () => {
    const fixture = loadJson<FixtureDefinition>("clean-studio.fixture.json");
    const first = analyzeFixture(fixture);
    const second = analyzeFixture(fixture);
    expect(second).toEqual(first);
  });
});
