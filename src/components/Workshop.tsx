import '../styles/enhancements.css';
import '../styles/orbital-studio.css';
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
const LegacyRoom = import.meta.env.DEV
  ? lazy(() => import('../scene/Room'))
  : null;
const WorkbenchRoom = lazy(() => import('../scene/OrbitalWorkbench'));
const StarMap = lazy(() => import('./StarMap'));
const ProjectDemo = lazy(() => import('../demos/ProjectDemo'));
const names: Record<Section, string> = {
  about: 'About',
  work: 'Work',
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
  const Room =
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('legacyRoom') &&
    LegacyRoom
      ? LegacyRoom
      : WorkbenchRoom;
  const [docked, setDocked] = useState(false);
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
      else document.querySelector<HTMLElement>('.contact-shortcut')?.focus();
    }
  }, [destination.section]);
  const navigate = (
    section: Section | null,
    project: ProjectId | null = null,
    withSound = true,
  ) => {
    cancelOpening();
    setMapOpen(false);
    if (withSound)
      audio.play(section === null ? 'close' : (project ?? 'click'));
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
    if (body !== destination.body) audio.play('depart');
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
      audio.play(project);
      setPendingProject(project);
      setDemo((value) => value + 1);
      openingTimer.current = setTimeout(
        () => navigate(section, project, false),
        200,
      );
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
      audio.play('copy');
    } catch {
      setCopied(false);
    }
  }
  return (
    <main
      className={`workshop orbital-studio${capture ? ' capture-room' : ''}`}
      id="main"
      data-ready={ready}
      data-failed={failed}
      data-body={destination.body}
      data-low-effects={lowEffects}
      data-sound={audio.enabled ? 'on' : 'off'}
      data-music={audio.musicEnabled ? 'on' : 'off'}
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
      <picture className="studio-poster" aria-hidden="true">
        <source media="(max-width:700px)" srcSet="/orbital-studio-phone.webp" />
        <img
          src="/orbital-studio.webp"
          alt=""
          width="1440"
          height="900"
          decoding="async"
        />
      </picture>
      <div
        className="studio-loading"
        role="status"
        aria-hidden={ready || failed}
      >
        <span className="loading-orbit" aria-hidden="true" />
        <p>Opening the workshop</p>
        <span>Projects and contact are ready to explore.</span>
      </div>
      {mounted && !failed && (
        <SceneBoundary key={sceneRetry} onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <Room
              key={sceneRetry}
              docked={docked}
              personalNote={false}
              audioEnabled={audio.musicEnabled}
              onRadio={() => void audio.toggleMusic()}
              onDock={toggleDock}
              onDiscover={() => {}}
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
      {failed && (
        <div className="studio-failure" role="status">
          <span>
            Scenery unavailable. Projects and contact are still available.
          </span>
          <button
            onClick={() => {
              setFailed(false);
              setReady(false);
              setSceneRetry((v) => v + 1);
            }}
          >
            Retry scenery
          </button>
        </div>
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
          <button className="desktop-nav" onClick={() => navigate('work')}>
            Work
          </button>
          <button
            className="desktop-nav about-shortcut"
            aria-haspopup="dialog"
            onClick={() => navigate('about')}
          >
            About
          </button>
          <a
            className="resume-shortcut"
            aria-label="Download résumé (PDF)"
            href={resume.url}
            download={resume.filename}
          >
            Résumé ↓
          </a>
          <button
            className="contact-shortcut"
            type="button"
            aria-haspopup="dialog"
            onClick={() => navigate('contact')}
          >
            Contact me
          </button>
        </nav>
      </header>
      <section className="studio-introduction" aria-label="What I build">
        <h2>
          I turn messy documents and manual workflows into software people can
          use.
        </h2>
        <p>
          Backend & full-stack development.
          <br />
          Open to internships, junior roles & freelance projects.
        </p>
        <a
          className="studio-proof"
          href="/read/#experience"
          onClick={(event) => {
            event.preventDefault();
            navigate('about');
          }}
        >
          Company work · approximately 30% faster reconciliation ↗
        </a>
      </section>
      <nav className="studio-project-rail" aria-label="Projects">
        {projects.map((item) => (
          <button key={item.id} onClick={() => sceneSelect('work', item.id)}>
            {item.name}
          </button>
        ))}
      </nav>
      <details className="look-menu">
        <summary>Look around</summary>
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
          <button
            aria-label="Look down"
            onClick={() => setLookVertical((v) => v + 1)}
          >
            ↓
          </button>
          <button aria-label="Look right" onClick={() => setLook((v) => v + 1)}>
            →
          </button>
          <button onClick={() => setReset((v) => v + 1)}>Reset view</button>
        </div>
      </details>
      <details className="destination-forward">
        <summary>
          {bodies.find((b) => b.id === destination.body)?.name}{' '}
          <span aria-hidden="true">⌄</span>
        </summary>
        <div className="destination-options">
          {destinationControl}
          <button className="chart-button" onClick={() => setMapOpen(true)}>
            Open star map
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
      </details>
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
            <div className="settings-audio-group">
              <button
                aria-pressed={audio.musicEnabled}
                aria-describedby="music-description"
                onClick={() => void audio.toggleMusic()}
              >
                Ambient music: {audio.musicEnabled ? 'On' : 'Off'}
              </button>
              <p id="music-description" className="settings-note">
                Soft pads and distant chimes.
              </p>
              <label className="volume-control">
                Music volume
                <input
                  aria-label="Music volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audio.musicVolume}
                  onChange={(event) =>
                    audio.setMusicVolume(Number(event.target.value))
                  }
                />
              </label>
            </div>
            <div className="settings-audio-group">
              <button
                aria-pressed={audio.enabled}
                onClick={() => void audio.toggle()}
              >
                Sound effects: {audio.enabled ? 'On' : 'Off'}
              </button>
              <label className="volume-control">
                Effects volume
                <input
                  aria-label="Effects volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audio.volume}
                  onChange={(event) =>
                    audio.setVolume(Number(event.target.value))
                  }
                />
              </label>
            </div>
            {audio.error && (
              <p role="status" className="settings-note">
                {audio.error}
              </p>
            )}
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
            <a href={resume.url} download={resume.filename}>
              Résumé ↓
            </a>
          </nav>
        </div>
      </dialog>
    </main>
  );
}
