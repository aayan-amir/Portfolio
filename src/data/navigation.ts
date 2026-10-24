export type Section = 'about' | 'work' | 'experience' | 'contact';
export type ProjectId = 'noclash' | 'inventory' | 'outreach';
export type Destination = {
  section: Section | null;
  project: ProjectId | null;
};
const sections = ['about', 'work', 'experience', 'contact'];
const projects = ['noclash', 'inventory', 'outreach'];
export function readDestination(search: string): Destination {
  const params = new URLSearchParams(search);
  const section = params.get('section');
  const project = params.get('project');
  return {
    section: sections.includes(section ?? '') ? (section as Section) : null,
    project:
      section === 'work' && projects.includes(project ?? '')
        ? (project as ProjectId)
        : null,
  };
}
export function destinationSearch(destination: Destination): string {
  const params = new URLSearchParams();
  if (destination.section) params.set('section', destination.section);
  if (destination.section === 'work' && destination.project)
    params.set('project', destination.project);
  return params.size ? `?${params}` : '';
}
