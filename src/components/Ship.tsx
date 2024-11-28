interface ShipProps {
  position: { x: number; y: number };
  rotation: number;
}

export function Ship({ position, rotation }: ShipProps) {
  return (
    <div
      className="absolute w-8 h-8"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
      }}
    >
      <div className="w-0 h-0 
        border-l-[16px] border-l-transparent
        border-b-[32px] border-b-blue-500
        border-r-[16px] border-r-transparent
        origin-center"
      />
    </div>
  );
}