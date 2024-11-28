interface AsteroidProps {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  size: 'large' | 'medium' | 'small';
  rotation: number;
}

const asteroidShapes = [
  "M -3,-3 L 1,-4 L 4,-2 L 3,2 L 1,4 L -2,3 L -4,0 L -3,-2 Z",
  "M -2,-4 L 2,-4 L 4,-1 L 3,3 L -1,4 L -4,2 L -3,-2 Z",
  "M 0,-4 L 3,-2 L 4,1 L 2,4 L -3,3 L -4,-1 L -2,-3 Z",
  "M -2,-3 L 2,-4 L 4,0 L 2,4 L -2,3 L -4,0 Z"
];

export function Asteroid({ position, rotation, size }: AsteroidProps) {
  const sizeScale = {
    large: 10,
    medium: 7,
    small: 4.5
  };

  const shapeIndex = Math.floor(rotation) % asteroidShapes.length;
  const path = asteroidShapes[shapeIndex];

  return (
    <div
      className="absolute transform-gpu"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        transition: 'transform 16ms linear',
      }}
    >
      <svg
        viewBox="-4 -4 8 8"
        style={{
          width: `${sizeScale[size] * 8}px`,
          height: `${sizeScale[size] * 8}px`,
        }}
      >
        <defs>
          <radialGradient id="asteroidGradient">
            <stop offset="20%" stopColor="#8B8B8B" />
            <stop offset="60%" stopColor="#696969" />
            <stop offset="100%" stopColor="#4A4A4A" />
          </radialGradient>
          <filter id="asteroidGlow">
            <feGaussianBlur stdDeviation="0.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        <path
          d={path}
          fill="rgba(255,255,255,0.1)"
          filter="url(#asteroidGlow)"
        />
        
        <path
          d={path}
          fill="url(#asteroidGradient)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="0.2"
          vectorEffect="non-scaling-stroke"
        />
        
        <path
          d={path}
          fill="none"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="0.1"
          strokeDasharray="0.3 0.6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}