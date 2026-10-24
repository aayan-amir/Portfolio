import '../styles/inhabited-room.css';
import '../styles/quiet-ship.css';
import '../styles/enhancements.css';
import { useCabinAudio } from '../state/useCabinAudio';
import { readLocal, writeLocal } from '../state/storage';
import ContributionLog from './ContributionLog';
import CaseStudy from './CaseStudy';
import type { ArrivalPhase } from '../scene/Environment';
import { bodies, type BodyId } from '../data/celestial';
import {
  lazy,
  startTransition,
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
const StarMap = lazy(() => import('./StarMap'));
const ProjectDemo = lazy(() => import('../demos/ProjectDemo'));
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
class OptionalBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export default function Workshop() {
  const [destination, setDestination] = useState<Destination>({
    section: null,
    project: null,
    body: 'earth',
  });
  const [mapOpen, setMapOpen] = useState(false);
  const [docked, setDocked] = useState(false);
  const [personalNote, setPersonalNote] = useState(false);
  const [visited, setVisited] = useState<BodyId[]>([]);
  const [arrival, setArrival] = useState<ArrivalPhase>('preparing');
  const [sceneRetry, setSceneRetry] = useState(0);
  const audio = useCabinAudio(!!destination.section || mapOpen);
  function toggleDock() {
    setDocked((value) => !value);
    audio.play('dock');
  }
  function arrived(body: BodyId) {
    setVisited((previous) => {
      const next = previous.includes(body) ? previous : [...previous, body];
      writeLocal('cabin-visited', next);
      return next;
    });
    audio.play('arrival');
  }
  function revealNote() {
    setPersonalNote((value) => !value);
    audio.play('click');
  }
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
  const [lookVertical, setLookVertical] = useState(0);
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
    startTransition(() => setMounted(true));
    const saved = readLocal<unknown>('cabin-visited', []);
    if (Array.isArray(saved))
      setVisited(
        saved.filter((id): id is BodyId => bodies.some((b) => b.id === id)),
      );
    setDestination(readDestination(window.location.search));
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    const history = () => {
      setMapOpen(false);
      setDestination(readDestination(window.location.search));
    };
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
    setMapOpen(false);
    audio.play('click');
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
    audio.play('click');
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
      data-sound={audio.enabled ? 'on' : 'off'}
      data-lighting="working"
      data-arrival={arrival}
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
        <SceneBoundary key={sceneRetry} onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <Room
              key={sceneRetry}
              docked={docked}
              personalNote={personalNote}
              audioEnabled={audio.enabled}
              onRadio={() => void audio.toggle()}
              onDock={toggleDock}
              onDiscover={revealNote}
              onMap={() => setMapOpen(true)}
              onArrivalPhase={setArrival}
              onArrived={arrived}
              labelBottom={null}
              look={look}
              lookVertical={lookVertical}
              section={destination.section}
              project={destination.project}
              activeProject={pendingProject ?? destination.project}
              demo={demo}
              body={destination.body}
              reduced={reduced || lowEffects || staticView}
              lowEffects={lowEffects}
              frozen={staticView || mapOpen}
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
        <button
          aria-label="Look up"
          onClick={() => setLookVertical((v) => v - 1)}
        >
          ↑
        </button>
        <span>Look around</span>
        <button
          aria-label="Look down"
          onClick={() => setLookVertical((v) => v + 1)}
        >
          ↓
        </button>
        <button aria-label="Look right" onClick={() => setLook((v) => v + 1)}>
          →
        </button>
      </div>
      <div className="destination-forward">
        {destinationControl}
        <button className="chart-button" onClick={() => setMapOpen(true)}>
          Star map
        </button>
        <span className="arrival-status" role="status">
          {arrival === 'preparing'
            ? 'Preparing destination…'
            : arrival === 'travelling'
              ? 'Arriving…'
              : arrival === 'fallback'
                ? 'Simplified scenery'
                : bodies.find((b) => b.id === destination.body)?.cue}
        </span>
        {(failed || arrival === 'fallback') && (
          <button
            onClick={() => {
              setFailed(false);
              setReady(false);
              setSceneRetry((v) => v + 1);
            }}
          >
            Retry scenery
          </button>
        )}
      </div>
      {mapOpen && (
        <OptionalBoundary
          fallback={
            <div className="map-loading" role="alert">
              Star map could not load. Use the destination selector or reload to
              retry. <button onClick={() => setMapOpen(false)}>Close</button>
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="map-loading" role="status">
                Opening star map…{' '}
                <button onClick={() => setMapOpen(false)}>Cancel</button>
              </div>
            }
          >
            <StarMap
              body={destination.body}
              visited={visited}
              onChoose={(body) => {
                chooseBody(body);
                setMapOpen(false);
              }}
              onClose={() => setMapOpen(false)}
              onReset={() => {
                setVisited([]);
                writeLocal('cabin-visited', []);
              }}
            />
          </Suspense>
        </OptionalBoundary>
      )}
      {personalNote && (
        <p className="discovery-caption" role="status">
          Off the clock: music, aviation, games, and astronomy.
        </p>
      )}
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
          <summary>Cabin controls</summary>
          <div className="settings-content">
            <button
              aria-pressed={audio.enabled}
              onClick={() => void audio.toggle()}
            >
              {audio.enabled ? 'Mute cabin sound' : 'Enable cabin sound'}
            </button>
            <label className="volume-control">
              Sound volume
              <input
                aria-label="Sound volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audio.volume}
                onChange={(e) => audio.setVolume(Number(e.target.value))}
              />
            </label>
            <button aria-pressed={docked} onClick={toggleDock}>
              {docked ? 'Launch inspection drone' : 'Dock inspection drone'}
            </button>
            <button aria-pressed={personalNote} onClick={revealNote}>
              Lunar note · left wall
            </button>
            <button
              disabled={!audio.enabled}
              onClick={() => audio.play('signal')}
            >
              Play radio signal
            </button>
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
                <ContributionLog />
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
                <CaseStudy project={project} />
                <OptionalBoundary
                  key={project.id}
                  fallback={
                    <p role="alert">
                      The optional example could not load. The case study and
                      source links are still available. Reload to retry the
                      example.
                    </p>
                  }
                >
                  <Suspense fallback={<p>Preparing the example…</p>}>
                    <ProjectDemo key={project.id} project={project.id} />
                  </Suspense>
                </OptionalBoundary>
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
                <ContributionLog />
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
