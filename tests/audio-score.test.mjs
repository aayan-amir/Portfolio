import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cues, musicEvent } from '../src/state/audioScore.ts';
test('ambient score advances in even four-second events and repeats its harmony every 48 seconds', () => {
  for (let i = 0; i < 120; i++) {
    const event = musicEvent(i);
    assert.equal(event.at, i * 4);
    assert.ok(
      event.notes.every((n) => Number.isFinite(n) && n >= 80 && n <= 800),
    );
    assert.ok(event.gain > 0 && event.gain <= 0.02);
    assert.deepEqual(event.notes, musicEvent(i + 12).notes);
    if (i % 3 === 0) {
      assert.equal(event.kind, 'pad');
      assert.ok(event.duration > 12, 'pads overlap gently at chord changes');
    } else {
      assert.equal(event.kind, 'bell');
      assert.ok(event.duration < 4, 'bells leave breathing room');
    }
  }
});
test('interaction sounds have bounded gain/duration and each instrument has a distinct cue', () => {
  for (const cue of Object.values(cues)) {
    assert.ok(cue.gain <= 0.06);
    assert.ok(cue.duration >= 0.05 && cue.duration <= 0.6);
    assert.ok(
      cue.notes.every((n) => Number.isFinite(n) && n >= 80 && n <= 1000),
    );
    assert.ok(cue.notes.length <= 3);
  }
  assert.notDeepEqual(cues.noclash, cues['student-portal']);
  assert.notDeepEqual(cues['student-portal'], cues.noterm);
  assert.ok(cues.depart.noise);
  assert.ok(cues.close.notes[0] > cues.close.notes.at(-1));
});
