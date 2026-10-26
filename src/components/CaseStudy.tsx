import ProjectEvidence from './ProjectEvidence';
import type { Project } from '../data/content';
export default function CaseStudy({
  project,
  level = 3,
}: {
  project: Project;
  level?: 2 | 3 | 4;
}) {
  const Heading = level === 2 ? 'h2' : level === 4 ? 'h4' : 'h3';
  return (
    <div className="case-study">
      <ProjectEvidence id={project.id} />
      <Heading>What I brought to the project</Heading>
      <p>{project.contribution}</p>
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
      <Heading>The problem</Heading>
      <p>{project.problem}</p>
      <Heading>The approach</Heading>
      <p>{project.solution}</p>
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
