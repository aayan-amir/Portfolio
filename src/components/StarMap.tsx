import { useEffect, useRef } from 'react';
import { bodies, type BodyId } from '../data/celestial';
const positions = [
  [50, 50],
  [67, 52],
  [68, 25],
  [38, 21],
  [20, 46],
  [31, 78],
  [70, 80],
  [88, 50],
  [86, 13],
];
export default function StarMap({
  body,
  visited,
  onChoose,
  onClose,
  onReset,
}: {
  body: BodyId;
  visited: BodyId[];
  onChoose: (body: BodyId) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const origin = document.activeElement as HTMLElement;
    ref.current?.showModal();
    return () => {
      ref.current?.close();
      if (origin?.isConnected) origin.focus();
    };
  }, []);
  const ordered = [
    bodies[8],
    ...bodies.slice(1, 3),
    bodies[0],
    ...bodies.slice(3, 8),
  ];
  return (
    <dialog
      ref={ref}
      className="star-map"
      aria-labelledby="map-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="map-heading">
        <h2 id="map-title">Choose a destination</h2>
        <button autoFocus onClick={onClose} aria-label="Close star map">
          ×
        </button>
      </div>
      <p>
        An illustrated navigation chart. Distances and orbits are not to scale.
      </p>
      <div className="map-drawing">
        <svg viewBox="0 0 500 360" aria-hidden="true">
          <g fill="none" stroke="#749a9c" opacity=".3">
            {[45, 75, 105, 135, 165].map((r) => (
              <ellipse key={r} cx="250" cy="180" rx={r * 1.3} ry={r} />
            ))}
          </g>
        </svg>
        {ordered.map((b, i) => (
          <button
            key={b.id}
            className="map-planet"
            style={
              {
                left: `${positions[i][0]}%`,
                top: `${positions[i][1]}%`,
                '--planet': b.color,
              } as import('react').CSSProperties
            }
            aria-label={`Travel to ${b.name}`}
            aria-pressed={body === b.id}
            title={b.name}
            onClick={() => onChoose(b.id)}
          >
            <span />
          </button>
        ))}
      </div>
      <div className="map-list">
        {bodies.map((b) => (
          <button
            key={b.id}
            aria-pressed={body === b.id}
            onClick={() => onChoose(b.id)}
          >
            <span style={{ background: b.color }} />
            {b.name}
            <small>
              {body === b.id
                ? 'Current'
                : visited.includes(b.id)
                  ? 'Visited'
                  : ''}
            </small>
          </button>
        ))}
      </div>
      <button className="map-reset" onClick={onReset}>
        Clear visited markers
      </button>
    </dialog>
  );
}
