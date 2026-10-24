import { test } from 'node:test';
import assert from 'node:assert/strict';
import { overlaps } from '../src/demos/scheduling.ts';
const session = { day: 'Monday', start: 540, end: 600 };
test('sample planner reports a real overlap', () =>
  assert.equal(
    overlaps(session, { day: 'Monday', start: 570, end: 630 }),
    true,
  ));
test('sample planner allows classes that meet at a boundary', () =>
  assert.equal(
    overlaps(session, { day: 'Monday', start: 600, end: 660 }),
    false,
  ));
test('sample planner never clashes across different days', () =>
  assert.equal(
    overlaps(session, { day: 'Tuesday', start: 540, end: 600 }),
    false,
  ));
test('sample planner detects containment and is symmetric', () => {
  const short = { day: 'Monday', start: 550, end: 560 };
  assert.equal(overlaps(session, short), true);
  assert.equal(overlaps(short, session), true);
});
