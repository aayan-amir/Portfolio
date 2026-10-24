import type { Project } from '../data/content';
export default function CaseStudy({
  project,
  level = 3,
}: {
  project: Project;
  level?: 3 | 4;
}) {
  const Heading = level === 4 ? 'h4' : 'h3';
  return (
    <div className="case-study">
      <Heading>What I brought to the project</Heading>
      <p>{project.contribution}</p>
      <Heading>The problem</Heading>
      <p>{project.problem}</p>
      <Heading>The approach</Heading>
      <p>{project.solution}</p>
      <Heading>What the application delivers</Heading>
      <p>{project.outcome}</p>
      <ul>
        {project.capabilities.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Heading>Engineering decisions</Heading>
      {project.decisions.map((item) => (
        <section key={item.title}>
          <strong>{item.title}</strong>
          <p>{item.detail}</p>
        </section>
      ))}
      <Heading>Scope and limitations</Heading>
      <p>{project.limits}</p>
      <p className="case-source">
        Based on the{' '}
        <a href={project.readme} target="_blank" rel="noreferrer">
          project README
        </a>
        , reviewed 24 October 2026.{' '}
      </p>
    </div>
  );
}
