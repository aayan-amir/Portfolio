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
    id: 'student-portal',
    name: 'Student Portal',
    category: 'Full-stack web application',
    summary: 'Shared resources. A considered review process.',
    problem:
      'Class notes, links, and files need a shared home without every submission going straight to everyone.',
    solution:
      'A classroom resource portal with pending submissions, administrator approval and rejection, and access to approved files. The repository describes PostgreSQL data storage, Cloudinary uploads, cookie-based admin authentication, and an optional Android wrapper.',
    tags: ['ASP.NET Core MVC', '.NET 10', 'PostgreSQL', 'Moderation'],
    source: 'https://github.com/aayan-amir/StudentPortal',
  },
  {
    id: 'noterm',
    name: 'NoTerm',
    category: 'Linux desktop application',
    summary: 'Find the task. Understand the command.',
    problem:
      'Common Linux tasks can require remembering commands, parameters, and the consequences of running them.',
    solution:
      'An Avalonia command center with 66 predefined actions, intent search, validated parameters, command previews, risk confirmations, and execution output. Its optional PostgreSQL catalog has a built-in fallback. Designed for Linux and Ubuntu; available actions depend on installed system tools.',
    tags: ['C#', 'Avalonia', '.NET 8', 'Linux'],
    source: 'https://github.com/aayan-amir/NOtoTERMINAL',
  },
];
