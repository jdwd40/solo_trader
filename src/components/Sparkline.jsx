import { sparklinePath } from '../utils/gameLogic';

/** Tiny SVG price sparkline */
export default function Sparkline({ values, width = 52, height = 18 }) {
  const { path, rising } = sparklinePath(values, width, height);
  if (!path) return <span className="sparkline empty">—</span>;

  return (
    <svg
      className={`sparkline ${rising ? 'up' : 'down'}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <path d={path} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
