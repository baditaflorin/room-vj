import type { FixtureDefinition, FixtureExpectation } from "./fixtureTypes";
import { analyzeFixture } from "./analysisEngine";

export interface FixtureResult {
  fixtureId: string;
  pass: boolean;
  mismatches: string[];
  sessionConfidence: number;
  message: string;
  action: string;
}

export function evaluateFixture(
  fixture: FixtureDefinition,
  expected: FixtureExpectation,
): FixtureResult {
  const result = analyzeFixture(fixture);
  const mismatches: string[] = [];
  const final = result.final;

  if (final.audioAssessment.classification !== expected.audioClass) {
    mismatches.push(
      `audio expected ${expected.audioClass} but got ${final.audioAssessment.classification}`,
    );
  }
  if (final.roomAssessment.classification !== expected.roomClass) {
    mismatches.push(
      `room expected ${expected.roomClass} but got ${final.roomAssessment.classification}`,
    );
  }
  if (final.personAssessment.classification !== expected.trackingClass) {
    mismatches.push(
      `tracking expected ${expected.trackingClass} but got ${final.personAssessment.classification}`,
    );
  }
  if (final.syncAssessment.classification !== expected.syncClass) {
    mismatches.push(
      `sync expected ${expected.syncClass} but got ${final.syncAssessment.classification}`,
    );
  }
  if (final.sessionConfidence < expected.minSessionConfidence) {
    mismatches.push(
      `session confidence expected >= ${expected.minSessionConfidence} but got ${final.sessionConfidence.toFixed(
        2,
      )}`,
    );
  }
  if (!final.message.includes(expected.messageIncludes)) {
    mismatches.push(
      `message expected to include "${expected.messageIncludes}" but got "${final.message}"`,
    );
  }
  if (!final.recommendedAction.includes(expected.actionIncludes)) {
    mismatches.push(
      `action expected to include "${expected.actionIncludes}" but got "${final.recommendedAction}"`,
    );
  }

  return {
    fixtureId: fixture.id,
    pass: mismatches.length === 0,
    mismatches,
    sessionConfidence: final.sessionConfidence,
    message: final.message,
    action: final.recommendedAction,
  };
}
