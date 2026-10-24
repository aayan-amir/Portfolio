import type { ProjectId } from './navigation';
export const profile = {
  name: 'Aayan Amir',
  role: 'Software developer',
  email: 'aayanwork1@gmail.com',
  github: 'https://github.com/aayan-amir',
};
export interface Project {
  id: ProjectId;
  name: string;
  category: string;
  summary: string;
  problem: string;
  solution: string;
  contribution: string;
  outcome: string;
  decisions: { title: string; detail: string }[];
  capabilities: string[];
  limits: string;
  tags: string[];
  url?: string;
  source: string;
  readme: string;
}
export const projects: Project[] = [
  {
    id: 'noclash',
    name: 'NoClash',
    category: 'Student tool · Live project',
    summary: 'From timetable images to a schedule students can check.',
    problem:
      'University timetables arrive as photos, screenshots, scans and PDFs. Students have to identify sections, copy class details and compare overlapping times before they can plan a semester.',
    contribution:
      'I brought timetable interpretation, editable course data and clash checking into one planning workflow, so students can start with the timetable they already have instead of entering every class by hand.',
    solution:
      'Visual timetable input becomes structured courses, sections, instructors, rooms, days and time slots. Students review and correct the extraction, choose course components, and see specific explanations when classes overlap.',
    outcome:
      'The resulting planner supports weekly and day-by-day views, shareable schedule selections and high-resolution image export. Planning can continue with saved data through an offline-capable application shell.',
    decisions: [
      {
        title: 'Separate interpretation from validation',
        detail:
          'AI assists with reading inconsistent timetable documents. Reviewable structured data feeds deterministic client-side clash checks, keeping conflicts explainable rather than asking a model to decide them.',
      },
      {
        title: 'Keep planning lightweight',
        detail:
          'Versioned static JSON and Zod validation provide a consistent data format. Device-local state includes migration support; compact Base64URL selections make schedules shareable without a mandatory account.',
      },
      {
        title: 'Make timetable data maintainable',
        detail:
          'A local visual authoring studio and data-validation scripts support updates separately from the student planning interface.',
      },
    ],
    capabilities: [
      'Review and correct extracted course data',
      'Compare sections and theory, lab or tutorial components',
      'Explain overlaps and inspect weekly or daily schedules',
      'Share selections by URL and export a timetable image',
    ],
    limits:
      'Extraction can misread blurry text, merged cells or abbreviations; review remains part of the workflow.',
    tags: [
      'TypeScript',
      'Zod',
      'Deterministic scheduling',
      'Reviewable AI',
      'PWA',
    ],
    url: 'https://no-clash.vercel.app',
    source: 'https://github.com/aayan-amir/NoClash',
    readme: 'https://github.com/aayan-amir/NoClash/blob/main/README.md',
  },
  {
    id: 'student-portal',
    name: 'Student Portal',
    category: 'Full-stack web application',
    summary:
      'Shared classroom resources, with a review step before publication.',
    problem:
      'Notes, links, images and PDFs need a shared classroom home. Publishing every submission immediately gives administrators no opportunity to review what becomes visible.',
    contribution:
      'I connected student submissions, administrator moderation, persistent records and uploaded files in one application. The important boundary is publication: submitting a resource does not make it public.',
    solution:
      'Students browse subject/section classrooms and submit metadata with an optional file. New records enter Pending status. Cookie-authenticated administrators approve or reject submissions and manage classrooms; approved items appear in the room.',
    outcome:
      'The application provides a complete submit → review → publish workflow, with Cloudinary uploads and file open/download endpoints. PDFs are proxied for inline viewing and download; rejection also removes uploaded files.',
    decisions: [
      {
        title: 'Make moderation part of the data model',
        detail:
          'ClassRoom, ContentItem and ContentFile records, together with content/status enums, express room membership, submission state and file metadata. EF Core with Npgsql persists them in PostgreSQL.',
      },
      {
        title: 'Separate storage from delivery',
        detail:
          'Cloudinary handles optional JPG, PNG, WEBP, GIF and PDF uploads. Application endpoints handle approved-content access and PDF delivery rather than making the upload form the publication boundary.',
      },
      {
        title: 'Validate setup before serving requests',
        detail:
          'Startup checks required database, administrator and upload configuration. Local development uses user-secrets; the repository also contains a separate Capacitor Android wrapper for a hosted portal.',
      },
    ],
    capabilities: [
      'Classrooms grouped by subject and section',
      'Pending submissions with approve/reject moderation',
      'Room management and cookie-authenticated administrator access',
      'Approved file viewing and download, including inline PDFs',
    ],
    limits:
      'Running the portal requires PostgreSQL, Cloudinary and administrator configuration. The Android project is a web wrapper, not a separate native implementation.',
    tags: [
      'ASP.NET Core MVC',
      '.NET 10',
      'PostgreSQL',
      'EF Core',
      'Cloudinary',
    ],
    source: 'https://github.com/aayan-amir/StudentPortal',
    readme: 'https://github.com/aayan-amir/StudentPortal/blob/master/README.md',
  },
  {
    id: 'noterm',
    name: 'NoTerm',
    category: 'Linux desktop application',
    summary: 'Discover a Linux task. Review what it will run.',
    problem:
      'Routine Linux maintenance can require remembering commands, parameters and their consequences. A friendly interface still needs to make privileged or destructive operations explicit.',
    contribution:
      'I built a task-first command center around a predefined action catalog, validated inputs and visible execution results. It helps users find a task while preserving a review step before higher-impact actions.',
    solution:
      'Users search by intent, choose an action, supply any required parameter and review the command preview and impact badges. Risky actions request confirmation; execution reports standard output, standard error and exit status in the application.',
    outcome:
      'The desktop app includes 66 built-in actions across ten system areas. An optional PostgreSQL catalog can supply validated actions, while a built-in fallback keeps the catalog available when database loading fails.',
    decisions: [
      {
        title: 'Use predefined actions instead of arbitrary shell text',
        detail:
          'ProcessStartInfo.ArgumentList passes arguments without shell-string interpolation. Type-specific validation covers package/service names, hostnames, relative paths, process IDs and file names.',
      },
      {
        title: 'Keep privilege and impact visible',
        detail:
          'Administrator and destructive actions are marked and confirmed. Privileged operations delegate to pkexec; file-path actions are home-relative by design. These measures reduce risk, rather than guaranteeing every operation is harmless.',
      },
      {
        title: 'Treat the remote catalog as optional',
        detail:
          'The Supabase/PostgreSQL integration validates loaded data and falls back to the built-in catalog. A CLI consistency self-test checks duplicate IDs, categories and parameter placeholders; a separate mode seeds the database.',
      },
    ],
    capabilities: [
      '66 actions across System, Storage, Network and seven other areas',
      'Intent search, grouped actions and validated parameters',
      'Command previews, risk confirmations and polkit integration',
      'stdout/stderr and exit status, plus catalog diagnostics',
    ],
    limits:
      'Ubuntu/Linux is the primary target. Actions depend on installed utilities; privileged operations require working polkit and a desktop session.',
    tags: ['C#', '.NET 8', 'Avalonia UI 12', 'Npgsql 10', 'Linux'],
    source: 'https://github.com/aayan-amir/NOtoTERMINAL',
    readme: 'https://github.com/aayan-amir/NOtoTERMINAL/blob/main/README.md',
  },
];
