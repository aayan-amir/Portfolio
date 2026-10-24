import type { ProjectId } from './navigation';
export const profile = {
  name: 'Aayan Amir',
  role: 'Software developer',
  email: 'aayanwork1@gmail.com',
  github: 'https://github.com/aayan-amir',
};
export const projects: {
  id: ProjectId;
  name: string;
  category: string;
  summary: string;
  problem: string;
  solution: string;
  tags: string[];
  url?: string;
  source?: string;
}[] = [
  {
    id: 'noclash',
    name: 'NoClash',
    category: 'Student tool · Live project',
    summary: 'A little less timetable chaos.',
    problem:
      'University timetables arrive as images, scans, and PDFs. Comparing course sections and spotting overlaps means a lot of manual checking.',
    solution:
      'NoClash brings timetable extraction, reviewable course data, and clash-free planning into one workflow. Students can review the information before building their schedule.',
    tags: ['TypeScript', 'Scheduling', 'Reviewable AI'],
    url: 'https://no-clash.vercel.app',
    source: 'https://github.com/aayan-amir/NoClash',
  },
  {
    id: 'inventory',
    name: 'Inventory tools',
    category: 'In-house software',
    summary: 'Making stock keeping easier to keep up with.',
    problem:
      'Manual inventory keeping creates repetitive administrative work and makes records harder to maintain.',
    solution:
      'I developed software to move inventory record keeping online and support the people doing that work. A fuller case study will use approved company screenshots.',
    tags: ['Business workflows', 'Record keeping'],
  },
  {
    id: 'outreach',
    name: 'Outreach records',
    category: 'In-house software',
    summary: 'Keeping track of the conversations that matter.',
    problem:
      'Keeping records of clients contacted was another repetitive task that needed a more organized workflow.',
    solution:
      'I built software to bring those outreach records online. This work focuses on practical internal tools rather than a public-facing demo.',
    tags: ['Internal tools', 'Client records'],
  },
];
