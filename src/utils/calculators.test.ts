import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCircuitSizing, calculatePaintRequirement } from './calculators.ts';

test('calculateCircuitSizing selects 230V MCB and SLS 733 cable gauge accurately', () => {
  const result = calculateCircuitSizing({
    watts: 3500,
    phase: 'single-230v',
    distanceMeters: 20,
  });

  assert.equal(result.currentAmps, 17.9);
  assert.equal(result.recommendedMcbAmps, 25);
  assert.equal(result.recommendedCableMm2, '4.0 mm²');
});

test('calculateCircuitSizing upsizes cable gauge for runs over 35 metres', () => {
  const result = calculateCircuitSizing({
    watts: 1500,
    phase: 'single-230v',
    distanceMeters: 50,
  });

  assert.equal(result.recommendedMcbAmps, 10);
  assert.equal(result.recommendedCableMm2, '2.5 mm²');
});

test('calculatePaintRequirement optimizes 10L drums and 4L buckets', () => {
  const result = calculatePaintRequirement({
    areaSqm: 120,
    coats: 2,
  });

  assert.equal(result.totalAreaSqm, 240);
  assert.equal(result.litresNeeded, 20);
  assert.equal(result.drums10L, 2);
  assert.equal(result.buckets4L, 0);
});
