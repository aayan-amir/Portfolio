import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDestination, destinationSearch } from '../src/data/navigation.ts';
test('direct project links resolve', () =>
  assert.deepEqual(readDestination('?section=work&project=noclash'), {
    section: 'work',
    project: 'noclash',
  }));
test('rejects unknown destinations', () =>
  assert.deepEqual(readDestination('?section=unknown&project=outreach'), {
    section: null,
    project: null,
  }));
test('project never leaks into another section', () =>
  assert.deepEqual(readDestination('?section=about&project=noclash'), {
    section: 'about',
    project: null,
  }));
test('overview clears URL state', () =>
  assert.equal(destinationSearch({ section: null, project: null }), ''));
test('destination URLs round-trip', () => {
  for (const section of ['about', 'work', 'experience', 'contact']) {
    const dest = { section, project: section === 'work' ? 'inventory' : null };
    assert.deepEqual(readDestination(destinationSearch(dest)), dest);
  }
});
