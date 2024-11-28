interface TrailProps {
  points: Array<{ x: number; y: number }>;
}

export function Trail({ points }: TrailProps) {
  if (points.length < 2) return null;

  // Adjust each point to align with ship's center (ship is 32px tall, 32px wide)
  const adjustedPoints = points.map(p => ({
    x: p.x + 16, // half of ship width
    y: p.y + 16  // half of ship height
  }));

  const pathData = `M ${adjustedPoints[0].x} ${adjustedPoints[0].y} ` + 
    adjustedPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <path
        d={pathData}
        stroke="rgba(59, 130, 246, 0.5)"
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
}