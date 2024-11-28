interface BulletProps {
  position: { x: number; y: number };
}

export function Bullet({ position }: BulletProps) {
  return (
    <div
      className="absolute w-2 h-2 bg-yellow-400 rounded-full"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    />
  );
}