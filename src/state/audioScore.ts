export type Cue =
  | 'click'
  | 'close'
  | 'arrival'
  | 'depart'
  | 'dock'
  | 'copy'
  | 'noclash'
  | 'student-portal'
  | 'noterm';
export const cues: Record<
  Cue,
  {
    notes: number[];
    gap: number;
    duration: number;
    gain: number;
    noise?: boolean;
  }
> = {
  click: { notes: [440], gap: 0, duration: 0.09, gain: 0.045 },
  close: { notes: [330, 220], gap: 0.055, duration: 0.14, gain: 0.035 },
  arrival: {
    notes: [196, 293.66, 392],
    gap: 0.13,
    duration: 0.55,
    gain: 0.045,
  },
  depart: {
    notes: [146.83, 220],
    gap: 0.12,
    duration: 0.5,
    gain: 0.028,
    noise: true,
  },
  dock: { notes: [220, 146.83], gap: 0.1, duration: 0.24, gain: 0.035 },
  copy: { notes: [523.25, 659.25], gap: 0.065, duration: 0.18, gain: 0.035 },
  noclash: {
    notes: [329.63, 440, 554.37],
    gap: 0.07,
    duration: 0.22,
    gain: 0.04,
  },
  'student-portal': {
    notes: [261.63, 392],
    gap: 0.1,
    duration: 0.25,
    gain: 0.035,
    noise: true,
  },
  noterm: { notes: [659.25, 440], gap: 0.07, duration: 0.12, gain: 0.035 },
};
const chords = [
  [146.83, 220, 277.18, 329.63, 369.99],
  [123.47, 220, 277.18, 293.66, 369.99],
  [98, 146.83, 220, 246.94, 369.99],
  [110, 164.81, 220, 246.94, 329.63],
];
/** Original 48-second orbital score: open chords, slow crossfades, sparse soft bells. */
export function musicEvent(index: number) {
  const phrase = Math.floor(index / 3),
    step = index % 3,
    chord = chords[phrase % chords.length];
  return {
    at: phrase * 12 + step * 4,
    kind: step === 0 ? ('pad' as const) : ('bell' as const),
    notes: step === 0 ? chord : [chord[step === 1 ? 3 : 4] * 2],
    duration: step === 0 ? 14 : 3.2,
    gain: step === 0 ? 0.014 : 0.018,
  };
}
