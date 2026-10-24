import '../styles/inhabited-room.css';
import '../styles/quiet-ship.css';
import { bodies, type BodyId } from '../data/celestial';
import {
  lazy,
  Suspense,
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { profile, projects } from '../data/content';
import { resume } from '../data/resume';
import {
  readDestination,
  destinationSearch,
  type Destination,
  type Section,
  type ProjectId,
} from '../data/navigation';
const Room = lazy(() => import('../scene/Room'));
const names: Record<Section, string> = {
  about: 'About',
  work: 'Work',
  experience: 'Approach',
  contact: 'Contact',
};
class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function Workshop() {
  const [destination, setDestination] = useState<Destination>({
    section: null,
    project: null,
    body: 'earth',
  });
  const [pendingProject, setPendingProject] = useState<ProjectId | null>(null);
  const [demo, setDemo] = useState(0);
  const openingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function cancelOpening() {
    if (openingTimer.current !== null) clearTimeout(openingTimer.current);
    openingTimer.current = null;
    setPendingProject(null);
  }
  useEffect(() => {
    const cancel = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancelOpening();
    };
    window.addEventListener('keydown', cancel);
    window.addEventListener('popstate', cancelOpening);
    return () => {
      if (openingTimer.current !== null) clearTimeout(openingTimer.current);
      window.removeEventListener('keydown', cancel);
      window.removeEventListener('popstate', cancelOpening);
    };
  }, []);
  const [look, setLook] = useState(0);
  const [lowEffects, setLowEffects] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [staticView, setStaticView] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [reset, setReset] = useState(0);
  const [copied, setCopied] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    setMounted(true);
    setDestination(readDestination(window.location.search));
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    const history = () =>
      setDestination(readDestination(window.location.search));
    window.addEventListener('popstate', history);
    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('popstate', history);
    };
  }, []);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (destination.section && !element.open) {
      restoreFocus.current = document.activeElement as HTMLElement;
      element.showModal();
    }
    if (!destination.section && element.open) {
      element.close();
      if (restoreFocus.current?.isConnected) restoreFocus.current.focus();
      else
        document
          .querySelector<HTMLButtonElement>('.ship-header button')
          ?.focus();
    }
  }, [destination.section]);
  const navigate = (
    section: Section | null,
    project: ProjectId | null = null,
  ) => {
    cancelOpening();
    const next = { ...destination, section, project };
    setDestination(next);
    const nextUrl = window.location.pathname + destinationSearch(next);
    if (nextUrl !== window.location.pathname + window.location.search)
      window.history.pushState(null, '', nextUrl);
  };
  useEffect(() => {
    if (destination.section)
      dialog.current
        ?.querySelector<HTMLElement>('#panel-title')
        ?.focus({ preventScroll: true });
  }, [destination.section, destination.project]);
  function chooseBody(body: BodyId) {
    cancelOpening();
    const next = { ...destination, body };
    setDestination(next);
    if (body !== destination.body)
      window.history.pushState(
        null,
        '',
        window.location.pathname + destinationSearch(next),
      );
  }
  function sceneSelect(section: Section, project?: ProjectId) {
    cancelOpening();
    if (
      section === 'work' &&
      project &&
      !reduced &&
      !lowEffects &&
      !staticView
    ) {
      setPendingProject(project);
      setDemo((value) => value + 1);
      openingTimer.current = setTimeout(() => navigate(section, project), 650);
    } else navigate(section, project ?? null);
  }
  const destinationControl = (
    <label className="destination-control">
      Destinations
      <select
        aria-label="Choose destination"
        value={destination.body}
        onChange={(e) => chooseBody(e.target.value as BodyId)}
      >
        {bodies.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </label>
  );
  const capture =
    mounted &&
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has('capture');
  const project = projects.find((item) => item.id === destination.project);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <main
      className={`workshop quiet-ship inhabited-room${capture ? ' capture-room' : ''}`}
      id="main"
      data-ready={ready}
      data-body={destination.body}
      data-low-effects={lowEffects}
      style={
        {
          '--body-color': bodies.find((b) => b.id === destination.body)?.color,
        } as import('react').CSSProperties
      }
    >
      <a className="skip-link" href="/read">
        Read the text portfolio
      </a>
      <div className="room-poster" aria-hidden="true" />
      {mounted && !failed && (
        <SceneBoundary onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <Room
              labelBottom={null}
              look={look}
              section={destination.section}
              project={destination.project}
              activeProject={pendingProject ?? destination.project}
              demo={demo}
              body={destination.body}
              reduced={reduced || lowEffects || staticView}
              lowEffects={lowEffects}
              frozen={staticView}
              reset={reset}
              onSelect={sceneSelect}
              onReady={() => setReady(true)}
              onFailure={() => setFailed(true)}
            />
          </Suspense>
        </SceneBoundary>
      )}
      <span className="sr-only" role="status">
        {pendingProject
          ? `Opening ${projects.find((item) => item.id === pendingProject)?.name} case study`
          : ''}
      </span>
      <div className="vignette" aria-hidden="true" />
      <header className="ship-header">
        <h1 className="ship-title">
          <a className="ship-name" href="/">
            Aayan Amir<span>Software developer</span>
          </a>
        </h1>
        <nav aria-label="Portfolio">
          <button onClick={() => navigate('work')}>Work</button>
          <button onClick={() => navigate('about')}>About</button>
          <a
            className="resume-shortcut"
            href={resume.url}
            download={resume.filename}
          >
            Download résumé
          </a>
          <button onClick={() => navigate('contact')}>Contact ↗</button>
        </nav>
      </header>
      <div className="room-welcome">
        <span>Welcome to my corner of orbit.</span>
        <p>
          Useful software.
          <br />A curious mind.
        </p>
        <small>Backend & full-stack internships / junior roles</small>
      </div>
      <div
        className="look-actions"
        role="group"
        aria-label="Look around the room"
      >
        <button aria-label="Look left" onClick={() => setLook((v) => v - 1)}>
          ←
        </button>
        <span>Look around</span>
        <button aria-label="Look right" onClick={() => setLook((v) => v + 1)}>
          →
        </button>
      </div>
      <div className="destination-forward">{destinationControl}</div>
      <footer className="ship-footer">
        <span className="scene-hint">
          {failed
            ? '3D unavailable · text view is ready'
            : !ready
              ? 'Preparing the engineering cabin…'
              : staticView
                ? 'Still view · select an object to explore'
                : 'Select an instrument to explore a project'}
        </span>
        <details className="ship-settings">
          <summary>View & destinations</summary>
          <div className="settings-content">
            <button
              aria-pressed={lowEffects}
              onClick={() => setLowEffects((v) => !v)}
            >
              Reduced effects
            </button>
            <button
              aria-pressed={staticView}
              onClick={() => setStaticView((v) => !v)}
            >
              {staticView ? 'Enable movement' : 'Still view'}
            </button>
            <button onClick={() => setReset((v) => v + 1)}>
              Reset camera view
            </button>
            <a href="/read">Text portfolio ↗</a>
            <a href="/read#credits">Scene credits</a>
          </div>
        </details>
      </footer>
      <dialog
        ref={dialog}
        className="info-dialog"
        aria-labelledby="panel-title"
        onCancel={(event) => {
          event.preventDefault();
          navigate(null);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) navigate(null);
        }}
      >
        <div className="panel-shell">
          <div className="panel-destination">{destinationControl}</div>
          <div className="panel-top">
            <span className="panel-location">
              Aayan’s engineering cabin /{' '}
              {destination.section && names[destination.section]}
            </span>
            <button
              className="close-panel"
              onClick={() => navigate(null)}
              aria-label="Close information panel"
            >
              ×
            </button>
          </div>
          <div
            className="panel-scroll"
            key={`${destination.section}-${destination.project}`}
          >
            {destination.section === 'about' && (
              <>
                <p className="eyebrow">The person behind the tools</p>
                <h2 id="panel-title" tabIndex={-1}>
                  Hello, I’m Aayan<span>.</span>
                </h2>
                <p className="panel-lead">
                  I like finding a better way to do the things people do every
                  day.
                </p>
                <p>
                  I’m a software developer in Karachi, looking for backend and
                  full-stack internships and junior roles. My work includes
                  student scheduling, moderated resource sharing, and desktop
                  tools for Linux.
                </p>
                <p>
                  I’m drawn to practical problems: understanding the task,
                  building something useful, and making it easier for someone to
                  get their work done.
                </p>
                <div className="note-card">
                  <span>Off the clock</span>
                  <p>
                    Music, aviation, games, and whatever’s out there beyond the
                    atmosphere.
                  </p>
                </div>
                <button
                  className="solid-button"
                  onClick={() => navigate('work')}
                >
                  Explore my work ↗
                </button>
              </>
            )}
            {destination.section === 'work' && !project && (
              <>
                <p className="eyebrow">Selected projects</p>
                <h2 id="panel-title" tabIndex={-1}>
                  Useful things,
                  <br />
                  thoughtfully built<span>.</span>
                </h2>
                <p className="panel-lead">
                  Scheduling, shared knowledge, and making Linux more
                  approachable.
                </p>
                <div className="project-list">
                  {projects.map((item, index) => (
                    <button
                      className="project-row"
                      key={item.id}
                      onClick={() => navigate('work', item.id)}
                    >
                      <span className={`project-symbol symbol-${item.id}`}>
                        {index === 0 ? '⌘' : index === 1 ? '▦' : '≡'}
                      </span>
                      <span>
                        <small>{item.category}</small>
                        <strong>{item.name}</strong>
                        <p>{item.summary}</p>
                      </span>
                      <span className="row-arrow">↗</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {destination.section === 'work' && project && (
              <>
                <button className="back-link" onClick={() => navigate('work')}>
                  ← All projects
                </button>
                <p className="eyebrow">{project.category}</p>
                <h2 id="panel-title" tabIndex={-1}>
                  {project.name}
                  <span>.</span>
                </h2>
                <p className="panel-lead">{project.summary}</p>
                <div className="tags">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                {project.id === 'noclash' && (
                  <div
                    className="schedule-art"
                    aria-label="Illustration of a timetable organized into a weekly schedule"
                  >
                    <div className="schedule-days">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                    </div>
                    <div className="schedule-grid">
                      {Array.from({ length: 20 }, (_, i) => (
                        <div
                          key={i}
                          className={
                            [0, 6, 12, 18].includes(i) ? 'class-block' : ''
                          }
                        >
                          {[0, 6, 12, 18].includes(i)
                            ? ['Design', 'Systems', 'Lab', 'Seminar'][
                                Math.floor(i / 6)
                              ]
                            : ''}
                        </div>
                      ))}
                    </div>
                    <small>
                      Workflow illustration · not an application screenshot
                    </small>
                  </div>
                )}
                <h3>The problem</h3>
                <p>{project.problem}</p>
                <h3>The approach</h3>
                <p>{project.solution}</p>
                {project.id === 'noclash' && (
                  <div className="note-card">
                    <span>A thoughtful boundary</span>
                    <p>
                      AI helps interpret the timetable. Students review the
                      extracted data; scheduling rules handle the clash checks.
                    </p>
                  </div>
                )}
                <div className="panel-actions">
                  {project.url && (
                    <a
                      className="solid-button"
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Try NoClash ↗
                    </a>
                  )}
                  {project.source && (
                    <a
                      className="outline-button"
                      href={project.source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Source code
                    </a>
                  )}
                </div>
              </>
            )}
            {destination.section === 'experience' && (
              <>
                <p className="eyebrow">Experience & approach</p>
                <h2 id="panel-title" tabIndex={-1}>
                  Practical work.
                  <br />
                  Thoughtful process<span>.</span>
                </h2>
                <p className="panel-lead">
                  The stack is a tool. The problem is the starting point.
                </p>
                <p>
                  I'm Aayan, a software developer in Karachi seeking backend and
                  full-stack internships and junior roles. Alongside these
                  projects, I've built in-house software to move repetitive
                  inventory and outreach record keeping online.
                </p>
                <p>
                  I care about understanding the task, reviewing the details,
                  and building something that helps the person doing the work.
                </p>
                <div className="approach-step">
                  <span>Understand the task</span>
                  <p>
                    Start with how people work, where repetition creeps in, and
                    what would make the task easier.
                  </p>
                </div>
                <div className="approach-step">
                  <span>Build a practical solution</span>
                  <p>
                    Turn manual inventory keeping and outreach records into
                    useful online workflows.
                  </p>
                </div>
                <div className="approach-step">
                  <span>Use AI with judgment</span>
                  <p>
                    I use AI tools to help with development, review what they
                    generate, and check the result rather than treating the
                    first answer as finished work.
                  </p>
                </div>
                <div className="note-card">
                  <span>What’s next</span>
                  <p>
                    A backend or full-stack internship or junior role where I
                    can contribute, learn, and keep improving.
                  </p>
                </div>
              </>
            )}
            {destination.section === 'contact' && (
              <>
                <p className="eyebrow">A conversation is a good start</p>
                <h2 id="panel-title" tabIndex={-1}>
                  Let’s build
                  <br />
                  something useful<span>.</span>
                </h2>
                <p className="panel-lead">
                  Backend and full-stack opportunities, a freelance project, or
                  a good idea.
                </p>
                <a className="email-link" href={`mailto:${profile.email}`}>
                  {profile.email} ↗
                </a>
                <div className="panel-actions">
                  <button className="outline-button" onClick={copyEmail}>
                    {copied ? 'Email copied' : 'Copy email'}
                  </button>
                  <a
                    className="outline-button"
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub ↗
                  </a>
                  <a
                    className="outline-button"
                    href={resume.url}
                    download={resume.filename}
                  >
                    Download résumé ↗
                  </a>
                </div>
                <p className="contact-footnote" role="status">
                  {copied
                    ? 'Ready to paste into your email app.'
                    : 'Based in Karachi, Pakistan. Always curious about the next good problem.'}
                </p>
              </>
            )}
          </div>
          <nav className="panel-nav" aria-label="Other sections">
            {(Object.keys(names) as Section[]).map((section) => (
              <button
                key={section}
                className={section === destination.section ? 'selected' : ''}
                onClick={() => navigate(section)}
              >
                {names[section]}
              </button>
            ))}
          </nav>
        </div>
      </dialog>
    </main>
  );
}
