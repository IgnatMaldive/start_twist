interface StarProps {
  position: { x: number; y: number };
}

export function Star({ position }: StarProps) {
  return (
    <div
      className="absolute w-6 h-6 text-yellow-400"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  );
}