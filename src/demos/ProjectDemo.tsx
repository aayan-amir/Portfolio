import { useState } from 'react';
import type { ProjectId } from '../data/navigation';
import { overlaps } from './scheduling';
export default function ProjectDemo({ project }: { project: ProjectId }) {
  const [section, setSection] = useState('overlap'),
    [status, setStatus] = useState<'Pending' | 'Approved' | 'Rejected'>(
      'Pending',
    );
  const [task, setTask] = useState('disk'),
    [confirmed, setConfirmed] = useState(false),
    [result, setResult] = useState(false);
  const examples = {
    disk: {
      title: 'Check disk usage',
      command: 'df -h',
      output: 'Filesystem  Size  Used  Available\n/dev/sample  100G  42G   58G',
    },
    memory: {
      title: 'Check memory usage',
      command: 'free -h',
      output:
        '              total   used   available\nMem (sample): 16 GiB  5 GiB  11 GiB',
    },
    identity: {
      title: 'Show current user',
      command: 'whoami',
      output: 'sample-user',
    },
  };
  const sample = examples[task as keyof typeof examples];
  const clash = overlaps(
    { day: 'Monday', start: 9 * 60, end: 10 * 60 },
    {
      day: 'Monday',
      start: section === 'overlap' ? 9 * 60 + 30 : 10 * 60,
      end: section === 'overlap' ? 10 * 60 + 30 : 11 * 60,
    },
  );
  return (
    <section
      className="project-demo"
      aria-label={`${project} interactive example`}
    >
      <h3>Try a small example</h3>
      <p className="demo-caption">Local workflow illustration · sample data</p>
      {project === 'noclash' ? (
        <>
          <p>Systems is Monday, 09:00–10:00. Choose a section for Databases.</p>
          <label>
            Databases section
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              <option value="overlap">Section A · 09:30–10:30</option>
              <option value="clear">Section B · 10:00–11:00</option>
            </select>
          </label>
          <div className="demo-timeline">
            <span>Systems · 09:00–10:00</span>
            <span className={clash ? 'has-clash' : 'no-clash'}>
              Databases · {clash ? '09:30–10:30' : '10:00–11:00'}
            </span>
          </div>
          <p role="status">
            {clash
              ? 'Overlap: both classes run from 09:30 to 10:00.'
              : 'No overlap. One class ends when the next begins.'}
          </p>
          <button onClick={() => setSection('overlap')}>Reset example</button>
        </>
      ) : project === 'student-portal' ? (
        <>
          <p>
            <strong>Sample resource:</strong> Database revision notes.pdf
          </p>
          <p>
            Submission status: <strong>{status}</strong>
          </p>
          <div className="demo-actions">
            <button
              disabled={status !== 'Pending'}
              onClick={() => setStatus('Approved')}
            >
              Approve sample
            </button>
            <button
              disabled={status !== 'Pending'}
              onClick={() => setStatus('Rejected')}
            >
              Reject sample
            </button>
            <button onClick={() => setStatus('Pending')}>Reset example</button>
          </div>
          <div className="student-view" role="status">
            <strong>Student view</strong>
            <p>
              {status === 'Approved'
                ? 'Database revision notes.pdf is now visible in the classroom.'
                : status === 'Rejected'
                  ? 'The rejected resource is not published.'
                  : 'This resource is awaiting review and is not published.'}
            </p>
          </div>
          <p className="demo-caption">
            This demonstrates the workflow locally; it is not an administrator
            session.
          </p>
        </>
      ) : (
        <>
          <label>
            Example task
            <select
              value={task}
              onChange={(e) => {
                setTask(e.target.value);
                setConfirmed(false);
                setResult(false);
              }}
            >
              <option value="disk">Check disk usage</option>
              <option value="memory">Check memory usage</option>
              <option value="identity">Show current user</option>
            </select>
          </label>
          <p>Command preview</p>
          <pre>{sample.command}</pre>
          <label className="demo-confirm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />{' '}
            I have reviewed this example command
          </label>
          <button disabled={!confirmed} onClick={() => setResult(true)}>
            Show sample result
          </button>
          {result && <pre role="status">{sample.output}</pre>}
          <p className="demo-caption">
            Illustrative output only. No command runs on your device.
          </p>
        </>
      )}
    </section>
  );
}
