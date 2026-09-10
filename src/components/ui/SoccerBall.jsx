import { cn } from '../../lib/cn';

/**
 * Football, drawn rather than shipped as an image so it stays crisp at any
 * size and can be tinted from the palette.
 *
 * Geometry: one dark pentagon in the middle, five more around the rim (part
 * clipped off by the ball's edge, exactly as they would be on a real ball),
 * and a seam joining each middle vertex to the rim pentagon facing it. The
 * whole ring is one shape rotated in 72-degree steps, which is why there is
 * only a single polygon/seam pair authored below.
 */
const RING = [0, 72, 144, 216, 288];

export default function SoccerBall({ className }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('block', className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="ck-ball-clip">
          <circle cx="50" cy="50" r="48" />
        </clipPath>
        {/* Light source up and to the left, so the ball reads as a sphere. */}
        <radialGradient id="ck-ball-shade" cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="62%" stopColor="#eef1f6" />
          <stop offset="100%" stopColor="#b9c2d1" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill="url(#ck-ball-shade)" />

      <g clipPath="url(#ck-ball-clip)">
        {/* Centre pentagon, one vertex pointing up. */}
        <polygon points="50,34 65.2,45.1 59.4,62.9 40.6,62.9 34.8,45.1" fill="#0a0e1c" />

        {/* Rim pentagon sized by measurement rather than by eye: this puts the
            dark panels at ~31% of the ball's face, which is where a real
            football sits, while still leaving ~34 degrees of white between
            neighbouring panels so they don't close up into one dark band. */}
        {RING.map((angle) => (
          <g key={angle} transform={`rotate(${angle} 50 50)`}>
            <polygon points="50,19 35.7,8.6 41.2,-8.1 58.8,-8.1 64.3,8.6" fill="#0a0e1c" />
            <line
              x1="50"
              y1="34"
              x2="50"
              y2="19"
              stroke="#0a0e1c"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>

      <circle cx="50" cy="50" r="48" fill="none" stroke="#0a0e1c" strokeWidth="3" />
    </svg>
  );
}
