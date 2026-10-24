export const bodies = [
  {
    id: 'earth',
    name: 'Earth',
    color: '#70b8df',
    cue: 'A little closer to home.',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#b2a295',
    cue: 'Stone, silence, sunlight.',
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#e6bd77',
    cue: 'Above the golden clouds.',
  },
  { id: 'mars', name: 'Mars', color: '#ce7553', cue: 'A quiet red frontier.' },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#d7b597',
    cue: 'An ocean of moving clouds.',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#dfcc9b',
    cue: 'Between light and rings.',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#93d6d6',
    cue: 'A world turned on its side.',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#548fe5',
    cue: 'At the edge of the blue.',
  },
  {
    id: 'sun',
    name: 'Sun',
    color: '#ffab48',
    cue: 'Warmth from a distant fire.',
  },
] as const;
export type BodyId = (typeof bodies)[number]['id'];
export function validBody(value: string | null): BodyId {
  return bodies.some((b) => b.id === value) ? (value as BodyId) : 'earth';
}
