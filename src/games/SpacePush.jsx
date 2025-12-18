import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useScore } from '../contexts/ScoreContext';
import './SpacePush.css';

const SpacePush = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateScore, getScore } = useScore();
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const sprite1Ref = useRef(null);
  const sprite2Ref = useRef(null);
  const backgroundRef = useRef(null);
  const [sprite1Loaded, setSprite1Loaded] = useState(false);
  const [sprite2Loaded, setSprite2Loaded] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Canvas dimensions
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 600;

  // Game parameters
  const [mass1, setMass1] = useState(50); // kg
  const [mass2, setMass2] = useState(50); // kg
  const [acceleration1, setAcceleration1] = useState(5); // m/s² for astronaut 1
  const [acceleration2, setAcceleration2] = useState(5); // m/s² for astronaut 2
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('ready'); // ready, pushing, finished
  // Astronauts start at opposite ends - left and right edges
  // Calculate initial sizes based on mass (both start at 50kg by default)
  const initialWidth1 = 88 + (mass1 / 10) * 8.8;
  const initialHeight1 = 132 + (mass1 / 10) * 8.8;
  const initialWidth2 = 88 + (mass2 / 10) * 8.8;
  const initialHeight2 = 132 + (mass2 / 10) * 8.8;
  const [astronaut1, setAstronaut1] = useState({ x: initialWidth1 / 2, y: 300, vx: 0, width: initialWidth1, height: initialHeight1 });
  const [astronaut2, setAstronaut2] = useState({ x: CANVAS_WIDTH - initialWidth2 / 2, y: 300, vx: 0, width: initialWidth2, height: initialHeight2 });
  const [distance1, setDistance1] = useState(0);
  const [distance2, setDistance2] = useState(0);
  const [time, setTime] = useState(0);

  const highScore = user ? getScore('space-push', 'score') : null;

  // Load sprites and background
  useEffect(() => {
    const img1 = new Image();
    const img2 = new Image();
    const bgImg = new Image();

    img1.onload = () => {
      sprite1Ref.current = img1;
      setSprite1Loaded(true);
    };

    img2.onload = () => {
      sprite2Ref.current = img2;
      setSprite2Loaded(true);
    };

    bgImg.onload = () => {
      backgroundRef.current = bgImg;
      setBackgroundLoaded(true);
    };

    // Load sprites and background from public folder
    img1.src = '/sprites/astronaut1.png';
    img2.src = '/sprites/astronaut2.png';
    bgImg.src = '/sprites/space_background.png';
  }, []);

  // Collision detection
  const checkCollision = (a1, a2) => {
    const a1Left = a1.x - a1.width / 2;
    const a1Right = a1.x + a1.width / 2;
    const a2Left = a2.x - a2.width / 2;
    const a2Right = a2.x + a2.width / 2;

    return a1Right >= a2Left && a1Left <= a2Right;
  };




  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background image if loaded, otherwise draw procedural background
      if (backgroundLoaded && backgroundRef.current) {
        ctx.drawImage(
          backgroundRef.current,
          0,
          0,
          canvas.width,
          canvas.height
        );
      } else {
        // Fallback: Draw space background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
          const x = (i * 47) % canvas.width;
          const y = (i * 73) % canvas.height;
          ctx.fillRect(x, y, 2, 2);
        }
      }

      // Draw astronaut 1
      if (sprite1Ref.current) {
        ctx.drawImage(
          sprite1Ref.current,
          astronaut1.x - astronaut1.width / 2,
          astronaut1.y - astronaut1.height / 2,
          astronaut1.width,
          astronaut1.height
        );
      }

      // Draw astronaut 2
      if (sprite2Ref.current) {
        ctx.drawImage(
          sprite2Ref.current,
          astronaut2.x - astronaut2.width / 2,
          astronaut2.y - astronaut2.height / 2,
          astronaut2.width,
          astronaut2.height
        );
      }
    };

    draw();
  }, [astronaut1, astronaut2, gameState, distance1, distance2, mass1, mass2, sprite1Loaded, sprite2Loaded, backgroundLoaded]);

  // CACHE BUSTER: Removed astronaut 2 flip - v7.0
  const push = () => {
    if (gameState !== 'ready') return;

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas not available');
      return;
    }

    // Use functional updates to capture current state values
    setAstronaut1(currentA1 => {
      setAstronaut2(currentA2 => {
        // Update game state
        setGameState('pushing');
        setTime(0);
        setDistance1(0);
        setDistance2(0);

        // Astronauts start from opposite ends and move toward each other
        // Use acceleration directly, then v = at
        const pushTime = 0.5; // seconds of contact
        // Astronaut 1 (left) moves RIGHT toward center
        // Astronaut 2 (right) moves LEFT toward center  
        // acceleration1 is positive (RIGHT), acceleration2 is positive but applied LEFT (negative direction)

        const initialV1 = acceleration1 * pushTime; // positive velocity (moving right)
        const initialV2 = -acceleration2 * pushTime; // negative velocity (moving left)

        // Capture current values for animation (these won't change during animation)
        const startTime = Date.now();
        const startX1 = currentA1.x;
        const startX2 = currentA2.x;
        const startWidth1 = currentA1.width;
        const startWidth2 = currentA2.width;
        const startHeight1 = currentA1.height;
        const startHeight2 = currentA2.height;

        let collisionOccurred = false;
        let postCollisionV1 = 0;
        let postCollisionV2 = 0;
        let collisionTime = 0;
        let collisionX = 0;

        const animate = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          setTime(elapsed);

          let newX1 = startX1 + initialV1 * elapsed * 50;
          let newX2 = startX2 + initialV2 * elapsed * 50;
          let currentV1 = initialV1;
          let currentV2 = initialV2;

          if (!collisionOccurred) {
            // Before collision - move toward each other
            // Check for collision using current positions
            const newA1 = { ...currentA1, x: newX1, width: startWidth1, height: startHeight1 };
            const newA2 = { ...currentA2, x: newX2, width: startWidth2, height: startHeight2 };

            if (checkCollision(newA1, newA2)) {
              // Collision detected!
              collisionOccurred = true;
              collisionTime = elapsed;
              collisionX = (newX1 + newX2) / 2;

              // Conservation of momentum: m1*v1 + m2*v2 = (m1+m2)*v_final
              // v1 is positive (moving right), v2 is negative (moving left)
              // The signs of the velocities naturally determine the direction
              const momentum1 = mass1 * initialV1;  // positive momentum (moving right)
              const momentum2 = mass2 * initialV2;  // negative momentum (moving left)
              const totalMomentum = momentum1 + momentum2;
              const combinedMass = mass1 + mass2;

              // Final velocity after inelastic collision
              // If positive: move right (force1 dominates)
              // If negative: move left (force2 dominates)
              // If ≈0: they stop (equal forces)
              const finalVelocity = totalMomentum / combinedMass;

              console.log('COLLISION DETECTED!');
              console.log('Initial velocities - v1:', initialV1, 'v2:', initialV2);
              console.log('Masses - m1:', mass1, 'm2:', mass2);
              console.log('Momenta - p1:', momentum1, 'p2:', momentum2, 'total:', totalMomentum);
              console.log('Final velocity:', finalVelocity);

              // Both astronauts move together with the same velocity
              postCollisionV1 = finalVelocity;
              postCollisionV2 = finalVelocity;

              // Position them at collision point - they stick together
              newX1 = collisionX - startWidth1 / 2;
              newX2 = collisionX + startWidth2 / 2;
              currentV1 = postCollisionV1;
              currentV2 = postCollisionV2;
            }
          } else {
            // After collision - move together in direction of dominant force
            const timeAfterCollision = elapsed - collisionTime;

            // Move both together - maintain relative positions
            const offset = postCollisionV1 * timeAfterCollision * 50;
            newX1 = collisionX - startWidth1 / 2 + offset;
            newX2 = collisionX + startWidth2 / 2 + offset;
            currentV1 = postCollisionV1;
            currentV2 = postCollisionV2;
          }

          // Boundary checks
          let stopped1 = false;
          let stopped2 = false;

          if (newX1 < startWidth1 / 2) {
            newX1 = startWidth1 / 2;
            stopped1 = true;
          } else if (newX1 > canvas.width - startWidth1 / 2) {
            newX1 = canvas.width - startWidth1 / 2;
            stopped1 = true;
          }

          if (newX2 < startWidth2 / 2) {
            newX2 = startWidth2 / 2;
            stopped2 = true;
          } else if (newX2 > canvas.width - startWidth2 / 2) {
            newX2 = canvas.width - startWidth2 / 2;
            stopped2 = true;
          }

          // Update positions using functional updates to preserve other properties
          setAstronaut1(prev => ({ ...prev, x: newX1, vx: stopped1 ? 0 : currentV1 }));
          setAstronaut2(prev => ({ ...prev, x: newX2, vx: stopped2 ? 0 : currentV2 }));

          // Calculate distances traveled (in meters, scaled)
          const dist1 = Math.abs(startX1 - newX1) / 50;
          const dist2 = Math.abs(startX2 - newX2) / 50;
          setDistance1(dist1);
          setDistance2(dist2);

          // Continue animation based on collision state
          if (collisionOccurred) {
            console.log('Post-collision - stopped1:', stopped1, 'stopped2:', stopped2, 'vf:', postCollisionV1);

            // Check if velocity is zero (equal momenta) - they stop at collision point
            if (Math.abs(postCollisionV1) < 0.01) {
              console.log('GAME FINISHED - zero velocity (equal momenta)');
              setGameState('finished');
              if (user) {
                const expectedRatio = mass2 / mass1;
                const actualRatio = dist1 > 0 && dist2 > 0 ? dist1 / dist2 : 1;
                const accuracy = Math.max(0, 100 - Math.abs(expectedRatio - actualRatio) * 20);
                const pointsEarned = Math.round(accuracy);
                setScore(currentScore => {
                  const newScore = currentScore + pointsEarned;
                  updateScore('space-push', newScore, 'score');
                  return newScore;
                });
              }
            }
            // After collision - they move together, so if either hits boundary, both stop
            else if (stopped1 || stopped2) {
              console.log('GAME FINISHED - boundary hit');
              setGameState('finished');
              if (user) {
                const expectedRatio = mass2 / mass1;
                const actualRatio = dist1 > 0 && dist2 > 0 ? dist1 / dist2 : 1;
                const accuracy = Math.max(0, 100 - Math.abs(expectedRatio - actualRatio) * 20);
                const pointsEarned = Math.round(accuracy);
                setScore(currentScore => {
                  const newScore = currentScore + pointsEarned;
                  updateScore('space-push', newScore, 'score');
                  return newScore;
                });
              }
            } else {
              // Continue moving together
              animationFrameRef.current = requestAnimationFrame(animate);
            }
          } else {
            // Before collision - continue until collision happens
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };

        // Start animation
        animationFrameRef.current = requestAnimationFrame(animate);

        // Return unchanged state (positions will be updated in animate)
        return currentA2;
      });
      return currentA1;
    });
  };

  const reset = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    // Reset to initial positions - astronauts at opposite edges
    const initialWidth1 = 88 + (mass1 / 10) * 8.8;
    const initialHeight1 = 132 + (mass1 / 10) * 8.8;
    const initialWidth2 = 88 + (mass2 / 10) * 8.8;
    const initialHeight2 = 132 + (mass2 / 10) * 8.8;
    // Astronaut 1 at left edge, Astronaut 2 at right edge
    setAstronaut1({ x: initialWidth1 / 2, y: 300, vx: 0, width: initialWidth1, height: initialHeight1 });
    setAstronaut2({ x: CANVAS_WIDTH - initialWidth2 / 2, y: 300, vx: 0, width: initialWidth2, height: initialHeight2 });
    setDistance1(0);
    setDistance2(0);
    setTime(0);
    setGameState('ready');
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="game-container">
      <div className="game-header">
        <h1 className="pixel-title">SPACE PUSH</h1>
        <button className="pixel-button pixel-button-secondary back-button" onClick={() => navigate('/')}>
          BACK TO MAIN
        </button>
      </div>

      <div className="game-content">
        <div className="game-info pixel-panel">
          <h2 className="pixel-subtitle">Laws of Motion</h2>
          <p className="pixel-text">  Two astronauts are pushed toward each other in ZERO GRAVITY space! <br />  Control their acceleration and mass, then watch them move.</p>
        </div>

        <div className="game-canvas-container">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="game-canvas"
          />
        </div>

        <div className="game-controls pixel-panel">
          <h3 className="pixel-subtitle">CONTROLS</h3>
          <div className="control-group">
            <label className="pixel-label">ASTRONAUT 1 MASS: {mass1}kg</label>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={mass1}
              onChange={(e) => {
                setMass1(Number(e.target.value));
                if (gameState === 'ready') {
                  setAstronaut1(prev => ({ ...prev, width: 88 + (Number(e.target.value) / 10) * 8.8, height: 132 + (Number(e.target.value) / 10) * 8.8 }));
                }
              }}
              disabled={gameState === 'pushing' || gameState === 'finished'}
              className="pixel-slider"
            />
          </div>
          <div className="control-group">
            <label className="pixel-label">ASTRONAUT 2 MASS: {mass2}kg</label>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={mass2}
              onChange={(e) => {
                setMass2(Number(e.target.value));
                if (gameState === 'ready') {
                  setAstronaut2(prev => ({ ...prev, width: 88 + (Number(e.target.value) / 10) * 8.8, height: 132 + (Number(e.target.value) / 10) * 8.8 }));
                }
              }}
              disabled={gameState === 'pushing' || gameState === 'finished'}
              className="pixel-slider"
            />
          </div>
          <div className="control-group">
            <label className="pixel-label">ASTRONAUT 1 ACCELERATION: {acceleration1}m/s²</label>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={acceleration1}
              onChange={(e) => {
                setAcceleration1(Number(e.target.value));
              }}
              disabled={gameState === 'pushing' || gameState === 'finished'}
              className="pixel-slider"
            />
          </div>
          <div className="control-group">
            <label className="pixel-label">ASTRONAUT 2 ACCELERATION: {acceleration2}m/s²</label>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={acceleration2}
              onChange={(e) => {
                setAcceleration2(Number(e.target.value));
              }}
              disabled={gameState === 'pushing' || gameState === 'finished'}
              className="pixel-slider"
            />
          </div>
          <div className="control-buttons">
            <button
              className="pixel-button"
              onClick={push}
              disabled={gameState === 'pushing' || gameState === 'finished'}
            >
              PUSH!
            </button>
            <button
              className="pixel-button pixel-button-secondary"
              onClick={reset}
            >
              RESET
            </button>
          </div>
        </div>
      </div>

      {/* Academic Hint Section - Below entire game */}
      <div className="academic-hint-wrapper">
        <div className="academic-hint-container">
          <button
            className={`hint-tab ${showHint ? 'active' : ''}`}
            onClick={() => setShowHint(!showHint)}
          >
            ACADEMIC HINT
          </button>
          {showHint && (
            <div className="hint-content">
              <h3 className="pixel-subtitle">Scientific Concepts</h3>
              <div className="hint-section">
                <h4>🚀 F=ma </h4>
                <p><strong>The Key Concept:</strong> Force is Determined by Mass and Acceleration.</p>
                <p><strong>What This Means:</strong> Higher Mass and Acceleration results in Bigger Force.</p>
                <p><strong>In This Simulation:</strong> You control each astronaut's acceleration and mass directly.</p>
              </div>
              <div className="hint-section">
                <h4>🌌 Zero Gravity Motion</h4>
                <p><strong>Constant Velocity:</strong> After the initial push, there's no friction or gravity to slow them down.</p>
                <p><strong>Newton's First Law:</strong> Objects in motion stay in motion with constant velocity unless acted upon by an external force.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpacePush;