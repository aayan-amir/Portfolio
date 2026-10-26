import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDestination, destinationSearch } from '../src/data/navigation.ts';
test('direct project links resolve', () =>
  assert.deepEqual(readDestination('?section=work&project=noclash'), {
    body: 'earth',
    section: 'work',
    project: 'noclash',
  }));
test('rejects unknown destinations', () =>
  assert.deepEqual(readDestination('?section=unknown&project=outreach'), {
    body: 'earth',
    section: null,
    project: null,
  }));
test('project never leaks into another section', () =>
  assert.deepEqual(readDestination('?section=about&project=noclash'), {
    body: 'earth',
    section: 'about',
    project: null,
  }));
test('overview clears URL state', () =>
  assert.equal(
    destinationSearch({ body: 'earth', section: null, project: null }),
    '',
  ));
test('destination URLs round-trip', () => {
  for (const section of ['about', 'work', 'contact']) {
    const dest = {
      body: 'earth',
      section,
      project: section === 'work' ? 'student-portal' : null,
    };
    assert.deepEqual(readDestination(destinationSearch(dest)), dest);
  }
});

test('planet and project share a URL', () => {
  const d = { body: 'saturn', section: 'work', project: 'noterm' };
  assert.deepEqual(readDestination(destinationSearch(d)), d);
});
test('unknown planet falls back to Earth', () =>
  assert.equal(readDestination('?destination=bad').body, 'earth'));

test('retired experience links resolve to About while retaining the planet', () => {
  assert.deepEqual(
    readDestination('?destination=neptune&section=experience&project=noclash'),
    { body: 'neptune', section: 'about', project: null },
  );
});
