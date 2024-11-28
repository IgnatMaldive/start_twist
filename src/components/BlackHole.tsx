interface BlackHoleProps {
  position: { x: number; y: number };
}

export function BlackHole({ position }: BlackHoleProps) {
  return (
    <div
      className="absolute w-8 h-8 rounded-full bg-black shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    />
  );
}