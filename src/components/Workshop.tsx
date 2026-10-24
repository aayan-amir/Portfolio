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
  });
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
      restoreFocus.current?.focus();
    }
  }, [destination.section]);
  const navigate = (
    section: Section | null,
    project: ProjectId | null = null,
  ) => {
    const next = { section, project };
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
      className={`workshop${capture ? ' capture-room' : ''}`}
      id="main"
      data-ready={ready}
    >
      <a className="skip-link" href="/read">
        Read the text portfolio
      </a>
      <div
        className="room-poster"
        aria-hidden="true"
        style={{ backgroundImage: 'url(/workshop-poster.webp)' }}
      />
      {mounted && !staticView && !failed && (
        <SceneBoundary onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <Room
              section={destination.section}
              project={destination.project}
              reduced={reduced}
              reset={reset}
              onSelect={navigate}
              onReady={() => setReady(true)}
              onFailure={() => setFailed(true)}
            />
          </Suspense>
        </SceneBoundary>
      )}
      <div className="vignette" aria-hidden="true" />
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Aayan Amir, workshop home">
          aa<span>.</span>
        </a>
        <span className="header-caption">A small space for useful ideas.</span>
        <a className="availability" href="mailto:aayanwork1@gmail.com">
          <i />
          Open to opportunities
        </a>
      </header>
      <section className="identity" aria-label="Introduction">
        <p className="eyebrow">Software developer · Karachi, Pakistan</p>
        <h1>
          Aayan
          <br />
          Amir<span>.</span>
        </h1>
        <p className="intro-copy">
          A curious mind.
          <br />A practical approach.
        </p>
        <p className="role-copy">
          Building tools that make everyday work easier.
          <br />
          Seeking backend & full-stack internships and junior roles.
        </p>
        <button className="intro-link" onClick={() => navigate('work')}>
          Take a look at my work <span>↗</span>
        </button>
      </section>
      <div className="room-caption">
        <span className="tiny-cross">+</span>
        <div>
          <strong>The orbital workshop</strong>
          <span>
            {failed
              ? 'Text view is available below.'
              : staticView
                ? 'Still view · take your time.'
                : !ready
                  ? 'Preparing your little corner of orbit…'
                  : 'Look around. Pick something that catches your eye.'}
          </span>
        </div>
      </div>
      <footer className="room-footer">
        <div className="coordinates">
          24° 51′ N &nbsp; 67° 00′ E<span>Made with curiosity, on Earth.</span>
        </div>
        <nav className="main-nav" aria-label="Portfolio">
          <button onClick={() => navigate('about')}>About</button>
          <button onClick={() => navigate('work')}>Work</button>
          <button onClick={() => navigate('experience')}>Approach</button>
          <button onClick={() => navigate('contact')}>
            Contact <span>↗</span>
          </button>
        </nav>
        <div className="view-controls">
          <button
            title="Reset camera"
            onClick={() => setReset((value) => value + 1)}
            aria-label="Reset camera view"
          >
            ↺
          </button>
          <button
            onClick={() => setStaticView((value) => !value)}
            aria-pressed={staticView}
          >
            {staticView ? 'Enable 3D' : 'Still view'}
          </button>
          <a href="/read">Text view</a>
        </div>
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
          <div className="panel-top">
            <span className="panel-location">
              Aayan’s workshop /{' '}
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
                  tools for inventory keeping, outreach records, and student
                  scheduling.
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
                  From a student’s timetable to a company’s everyday records.
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
                <p className="eyebrow">How I approach the work</p>
                <h2 id="panel-title" tabIndex={-1}>
                  Understand.
                  <br />
                  Build. Refine<span>.</span>
                </h2>
                <p className="panel-lead">
                  The stack is a tool. The problem is the starting point.
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
                    href={`mailto:${profile.email}?subject=Resume%20request`}
                  >
                    Request résumé ↗
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
