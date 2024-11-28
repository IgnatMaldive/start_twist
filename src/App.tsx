import { useEffect, useState, useCallback } from 'react';
import './index.css';
import { Ship } from './components/Ship';
import { Star } from './components/Star';
import { BlackHole } from './components/BlackHole';
import { Trail } from './components/Trail';
import { Asteroid } from './components/Asteroid';
import { Bullet } from './components/Bullet';

interface AsteroidType {
  id: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  rotation: number;
  size: 'large' | 'medium' | 'small';
}

interface BulletType {
  id: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
}

const COLLISION_THRESHOLDS = {
  large: 40,
  medium: 28,
  small: 18
};

const SHIP_HEIGHT = 32; // Ship's height in pixels

function checkCollision(pos1: { x: number; y: number }, pos2: { x: number; y: number }, threshold: number) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy) < threshold;
}

// Helper function to calculate ship's tip position
function getShipTipPosition(position: { x: number; y: number }, rotation: number) {
  const angleInRadians = (rotation - 90) * (Math.PI / 180);
  return {
    x: position.x + Math.cos(angleInRadians) * SHIP_HEIGHT,
    y: position.y + Math.sin(angleInRadians) * SHIP_HEIGHT
  };
}

// Helper function to wrap position around screen edges
function wrapPosition(x: number, y: number) {
  const newX = x < 0 ? window.innerWidth : x > window.innerWidth ? 0 : x;
  const newY = y < 0 ? window.innerHeight : y > window.innerHeight ? 0 : y;
  return { x: newX, y: newY };
}

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('startwist-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [shipPosition, setShipPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [shipRotation, setShipRotation] = useState(0);
  const [stars, setStars] = useState<Array<{ x: number; y: number }>>([]);
  const [blackHoles, setBlackHoles] = useState<Array<{ x: number; y: number }>>([]);
  const [trail, setTrail] = useState<Array<{ x: number; y: number }>>([]);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [asteroids, setAsteroids] = useState<AsteroidType[]>([]);
  const [bullets, setBullets] = useState<BulletType[]>([]);
  const [lastShootTime, setLastShootTime] = useState(0);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setShipPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setShipRotation(0);
    setStars([]);
    setBlackHoles([]);
    setTrail([]);
    setAsteroids([]);
    setBullets([]);
    setPressedKeys(new Set());
    setLastShootTime(0);
  };

  const endGame = useCallback(() => {
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('startwist-highscore', score.toString());
    }
  }, [score, highScore]);

  const spawnAsteroid = useCallback(() => {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(side) {
      case 0:
        x = Math.random() * window.innerWidth;
        y = -50;
        break;
      case 1:
        x = window.innerWidth + 50;
        y = Math.random() * window.innerHeight;
        break;
      case 2:
        x = Math.random() * window.innerWidth;
        y = window.innerHeight + 50;
        break;
      default:
        x = -50;
        y = Math.random() * window.innerHeight;
        break;
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const angle = Math.atan2(centerY - y, centerX - x);
    const speed = 1.5;

    const newAsteroid: AsteroidType = {
      id: Date.now(),
      position: { x, y },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      },
      rotation: Math.random() * 360,
      size: 'large'
    };

    setAsteroids(prev => [...prev, newAsteroid]);
  }, []);

  const splitAsteroid = useCallback((asteroid: AsteroidType) => {
    if (asteroid.size === 'small') return [];

    const newSize = asteroid.size === 'large' ? 'medium' : 'small';
    const baseSpeed = asteroid.size === 'large' ? 2 : 2.5;
    
    return [1, -1].map((direction): AsteroidType => ({
      id: Date.now() + direction,
      position: { ...asteroid.position },
      velocity: {
        x: asteroid.velocity.x + direction * baseSpeed * Math.random(),
        y: asteroid.velocity.y + direction * baseSpeed * Math.random()
      },
      rotation: Math.random() * 360,
      size: newSize
    }));
  }, []);

  const shoot = useCallback(() => {
    const now = Date.now();
    if (now - lastShootTime < 250) return;

    const angle = (shipRotation - 90) * (Math.PI / 180);
    const speed = 10;
    
    const tipPosition = getShipTipPosition(shipPosition, shipRotation);
    
    const bullet: BulletType = {
      id: now,
      position: { ...tipPosition },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      }
    };

    setBullets(prev => [...prev, bullet]);
    setLastShootTime(now);
  }, [shipPosition, shipRotation, lastShootTime]);

  const spawnStar = useCallback(() => {
    const newStar = {
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 100) + 50
    };
    setStars(prev => [...prev, newStar]);
  }, []);

  const spawnBlackHole = useCallback(() => {
    const newHole = {
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 100) + 50
    };
    setBlackHoles(prev => [...prev, newHole]);
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys(prev => new Set(prev).add(e.key));
      if (e.code === 'Space') {
        shoot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(e.key);
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = setInterval(() => {
      // Ship movement
      if (pressedKeys.has('ArrowLeft')) {
        setShipRotation(prev => prev - 5);
      }
      if (pressedKeys.has('ArrowRight')) {
        setShipRotation(prev => prev + 5);
      }
      if (pressedKeys.has('ArrowUp')) {
        const angle = (shipRotation - 90) * (Math.PI / 180);
        const speed = 5;
        setShipPosition(prev => {
          const newX = prev.x + Math.cos(angle) * speed;
          const newY = prev.y + Math.sin(angle) * speed;
          return wrapPosition(newX, newY);
        });
        setTrail(prev => [...prev, shipPosition].slice(-20));
      }

      // Collision detection
      stars.forEach((star, index) => {
        if (checkCollision(shipPosition, star, 20)) {
          setScore(prev => prev + 10);
          setStars(prev => prev.filter((_, i) => i !== index));
        }
      });

      blackHoles.forEach(hole => {
        if (checkCollision(shipPosition, hole, 20)) {
          endGame();
        }
      });

      asteroids.forEach(asteroid => {
        if (checkCollision(shipPosition, asteroid.position, COLLISION_THRESHOLDS[asteroid.size])) {
          endGame();
        }
      });

      // Update bullets and check collisions
      setBullets(prev => 
        prev.map(bullet => {
          const newPos = {
            x: bullet.position.x + bullet.velocity.x,
            y: bullet.position.y + bullet.velocity.y
          };

          // Check for asteroid collisions
          asteroids.forEach(asteroid => {
            if (checkCollision(newPos, asteroid.position, COLLISION_THRESHOLDS[asteroid.size])) {
              // Mark bullet for removal
              newPos.x = -1000;
              // Split or remove asteroid
              setAsteroids(prev => {
                const newAsteroids = prev.filter(a => a.id !== asteroid.id);
                if (asteroid.size !== 'small') {
                  newAsteroids.push(...splitAsteroid(asteroid));
                }
                return newAsteroids;
              });
              setScore(prev => prev + (asteroid.size === 'large' ? 20 : asteroid.size === 'medium' ? 50 : 100));
            }
          });

          return { ...bullet, position: newPos };
        }).filter(bullet => 
          bullet.position.x > 0 &&
          bullet.position.x < window.innerWidth &&
          bullet.position.y > 0 &&
          bullet.position.y < window.innerHeight
        )
      );

      // Update asteroids
      setAsteroids(prev =>
        prev.map(asteroid => ({
          ...asteroid,
          position: wrapPosition(
            asteroid.position.x + asteroid.velocity.x,
            asteroid.position.y + asteroid.velocity.y
          ),
          rotation: asteroid.rotation + 0.5
        }))
      );

      // Spawn new entities with reduced rates
      if (Math.random() < 0.01) spawnAsteroid();
      if (Math.random() < 0.01) spawnStar();
      if (Math.random() < 0.005) spawnBlackHole();
    }, 16);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(gameLoop);
    };
  }, [gameStarted, gameOver, shipPosition, shipRotation, pressedKeys, shoot, spawnAsteroid, spawnStar, spawnBlackHole, stars, blackHoles, asteroids, splitAsteroid, endGame]);

  const MenuScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-900 text-white">
      <h1 className="text-6xl font-bold mb-8">StarTwist</h1>
      {gameOver && (
        <div className="text-center mb-8">
          <p className="text-2xl">Game Over!</p>
          <p className="text-xl">Score: {score}</p>
          <p className="text-xl">High Score: {highScore}</p>
        </div>
      )}
      <button
        onClick={startGame}
        className="px-6 py-3 bg-blue-500 rounded-lg text-white text-xl hover:bg-blue-600 transition-colors"
      >
        {gameOver ? 'Play Again' : 'Start Game'}
      </button>
      <div className="mt-8 text-center">
        <p className="text-lg mb-2">How to play:</p>
        <p>↑ to move forward</p>
        <p>← → to rotate</p>
        <p>SPACE to shoot</p>
        <p>Collect stars and destroy asteroids!</p>
        <p>Avoid black holes and asteroid collisions</p>
      </div>
    </div>
  );

  const GameScreen = () => (
    <div className="w-screen h-screen overflow-hidden bg-slate-900 relative">
      <div className="absolute top-4 left-4 text-white text-xl">
        Score: {score}
      </div>
      <Trail points={trail} />
      <Ship position={shipPosition} rotation={shipRotation} />
      {stars.map((star, i) => (
        <Star key={i} position={star} />
      ))}
      {blackHoles.map((hole, i) => (
        <BlackHole key={i} position={hole} />
      ))}
      {asteroids.map((asteroid) => (
        <Asteroid
          key={asteroid.id}
          position={asteroid.position}
          velocity={asteroid.velocity}
          rotation={asteroid.rotation}
          size={asteroid.size}
        />
      ))}
      {bullets.map((bullet) => (
        <Bullet key={bullet.id} position={bullet.position} />
      ))}
    </div>
  );

  return (
    (!gameStarted || gameOver) ? <MenuScreen /> : <GameScreen />
  );
}

export default App;