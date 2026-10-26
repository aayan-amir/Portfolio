import type { ProjectId } from '../data/navigation';
import { projectPresentation } from '../data/projectPresentation';
export default function ProjectEvidence({ id }: { id: ProjectId }) {
  const item = projectPresentation[id];
  return (
    <figure className="project-evidence">
      <img
        src={item.image}
        alt={item.alt}
        width={id === 'noclash' ? 1280 : 1240}
        height={id === 'noclash' ? 800 : 560}
        decoding="async"
      />
      <figcaption>{item.caption}</figcaption>
    </figure>
  );
}
