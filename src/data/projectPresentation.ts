import type { ProjectId } from './navigation';
export const projectPresentation: Record<
  ProjectId,
  {
    image: string;
    alt: string;
    caption: string;
    evidence: 'actual' | 'illustration';
    anchor: [number, number, number];
    label: [number, number, number];
    mechanism: string[];
  }
> = {
  noclash: {
    image: '/evidence/noclash.webp',
    alt: 'The live NoClash application showing a weekly timetable and course choices',
    caption:
      'Actual NoClash application · public sample timetable, captured 26 October 2026',
    evidence: 'actual',
    anchor: [0, 1.43, 0.55],
    label: [0, 1.56, 1.335],
    mechanism: ['planner-input', 'planner-wing'],
  },
  'student-portal': {
    image: '/evidence/student-portal.svg',
    alt: 'Workflow illustration: resource submission, pending review, then approved publication',
    caption:
      'Workflow illustration based on the README · not an application screenshot',
    evidence: 'illustration',
    anchor: [-2.9, 1.43, -0.35],
    label: [-2.9, 1.56, 0.505],
    mechanism: ['archive-tray'],
  },
  noterm: {
    image: '/evidence/noterm.svg',
    alt: 'Workflow illustration: choose a task, review the command, read the result',
    caption:
      'Workflow illustration based on the README · not an application screenshot',
    evidence: 'illustration',
    anchor: [2.9, 1.43, -0.2],
    label: [2.9, 1.56, 0.505],
    mechanism: ['terminal-lever'],
  },
};
