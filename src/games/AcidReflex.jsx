import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useScore } from '../contexts/ScoreContext';
import './AcidReflex.css';

const AcidReflex = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { updateScore, getScore } = useScore();

    // Game State
    const [gameState, setGameState] = useState('menu'); // menu, playing, won, gameover
    const [currentStage, setCurrentStage] = useState(1);
    const [startTime, setStartTime] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [finalTime, setFinalTime] = useState(null);
    const [levelData, setLevelData] = useState({ blueCount: 0, redCount: 0, moving: false });
    const [particles, setParticles] = useState([]);
    const [shake, setShake] = useState(false);
    const [flash, setFlash] = useState(null); // 'green', 'red', or null

    const timerRef = useRef(null);
    const TOTAL_STAGES = 15;

    const bestTime = user ? getScore('acid-reflex', 'time') : null;

    // Generate Level Data
    const generateLevel = (stage) => {
        // Difficulty Logic
        let margin;
        let moving = false;
        let speed = 'slow';
        let scale = 1.0;

        if (stage === 1) {
            // Tutorial: High margin, static, large ions
            margin = 12 + Math.floor(Math.random() * 3);
            moving = false;
            scale = 1.4; // Reduced from 1.6 based on feedback
        } else if (stage <= 4) {
            // Ramp Up: Moving, medium margin
            margin = 8 + Math.floor(Math.random() * 3);
            moving = true;
            speed = 'slow';
            scale = 1.3; // Increased size
        } else {
            // Stage 5+: HARD MODE
            margin = (Math.random() > 0.5) ? 2 : 4;
            moving = true;
            speed = 'fast';
            scale = stage <= 10 ? 1.1 : 1.0; // Increased size, but smaller than early stages
        }

        // Ensure margin is even
        if (margin % 2 !== 0) margin += 1;

        const totalItems = 30; // Increased from 20 for more density
        const winnerCount = (totalItems + margin) / 2;
        const loserCount = totalItems - winnerCount;

        const acidWins = Math.random() > 0.5;
        const blueCount = acidWins ? winnerCount : loserCount;
        const redCount = acidWins ? loserCount : winnerCount;

        return { blueCount, redCount, moving, speed, scale };
    };

    // Generate Particles
    const generateParticles = (blue, red, moving, speed, scale) => {
        const newParticles = [];
        const createParticle = (type) => ({
            id: Math.random(),
            type, // 'acid' or 'base'
            top: Math.random() * 80 + 10 + '%',
            left: Math.random() * 80 + 10 + '%',
            animationDuration: moving ? (speed === 'fast' ? Math.random() * 2 + 1 + 's' : Math.random() * 5 + 5 + 's') : '0s',
            animationDelay: Math.random() * -5 + 's',
            moveX: (Math.random() - 0.5) * 100 + 'px',
            moveY: (Math.random() - 0.5) * 100 + 'px',
            scale: scale
        });

        for (let i = 0; i < blue; i++) newParticles.push(createParticle('acid'));
        for (let i = 0; i < red; i++) newParticles.push(createParticle('base'));

        return newParticles.sort(() => Math.random() - 0.5);
    };

    // Start Specific Stage
    const startStage = (stageNum) => {
        const data = generateLevel(stageNum);
        setLevelData(data);
        setParticles(generateParticles(data.blueCount, data.redCount, data.moving, data.speed, data.scale));
    };

    // ... (keep handleGuess, handleWin, handleGameOver same)

    const handleGuess = (guess) => {
        if (gameState !== 'playing') return;

        const isAcid = levelData.blueCount > levelData.redCount;
        const correct = (guess === 'acid' && isAcid) || (guess === 'base' && !isAcid);

        if (correct) {
            setFlash('green');
            setTimeout(() => setFlash(null), 150);

            if (currentStage >= TOTAL_STAGES) {
                handleWin();
            } else {
                const nextStage = currentStage + 1;
                setCurrentStage(nextStage);
                startStage(nextStage);
            }
        } else {
            handleGameOver();
        }
    };

    const handleWin = () => {
        clearInterval(timerRef.current);
        const finalMs = Date.now() - startTime;
        setFinalTime(finalMs);
        setGameState('won');
        if (user) {
            updateScore('acid-reflex', finalMs, 'time');
        }
    };

    const handleGameOver = () => {
        clearInterval(timerRef.current);
        setShake(true);
        setFlash('red');
        setGameState('gameover');
        setTimeout(() => setShake(false), 500);
    };

    // ... (keep formatTime same, startGame same)

    // Start Game
    const startGame = () => {
        setGameState('playing');
        setCurrentStage(1);
        setStartTime(Date.now());
        setCurrentTime(0);
        setFinalTime(null);
        startStage(1);

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentTime(Date.now() - Date.now());
        }, 33);
    };

    // Fix timer update logic
    useEffect(() => {
        if (gameState === 'playing' && startTime) {
            timerRef.current = setInterval(() => {
                setCurrentTime(Date.now() - startTime);
            }, 33);
        }
        return () => clearInterval(timerRef.current);
    }, [gameState, startTime]);

    const formatTime = (ms) => {
        if (!ms) return "00:00.00";
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centis = Math.floor((ms % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`game2-container ${shake ? 'shake' : ''}`}>
            {/* Header: Title - Exit */}
            <div className="game2-header">
                <div className="header-left">
                    <h1 className="pixel-title">ACID REFLEX</h1>
                </div>

                <div className="header-right">
                    <button className="pixel-button pixel-button-secondary back-button" onClick={() => navigate('/')}>
                        BACK TO MAIN
                    </button>
                </div>
            </div>

            <div className="game2-main-layout">
                {/* Left Column: Info & Knowledge */}
                <div className="info-sidebar pixel-panel">

                    {/* Stats at Top */}
                    <div className="stats-section">
                        <div className="stat-row">
                            <span>STAGE</span>
                            <span className="highlight">{currentStage} / {TOTAL_STAGES}</span>
                        </div>
                        <div className="stat-row">
                            <span>BEST</span>
                            <span className="gold-text">{bestTime ? formatTime(bestTime) : "--:--.--"}</span>
                        </div>
                    </div>

                    {/* Timer below Stats */}
                    <div className="sidebar-timer">
                        <span className="timer-label">TIME</span>
                        <div className="timer-display">
                            {gameState === 'playing' ? formatTime(currentTime) : (finalTime ? formatTime(finalTime) : "00:00.00")}
                        </div>
                    </div>

                    <div className="info-section">
                        <h3>The Rules</h3>
                        <p>Identify the <strong>dominant ion</strong> to determine if the solution is Acid or Base.</p>
                        <ul className="rules-list">
                            <br />
                            <li><span className="blue-text">More H+</span> = ACID</li>
                            <li><span className="red-text">More OH-</span> = BASE</li>
                        </ul>
                    </div>

                    <div className="info-section">
                        <h3>Ion Guide</h3>
                        <div className="ion-legend-item">
                            <div className="info-icon acid">H+</div>
                            <span>Hydrogen Ion (Acidic)</span>
                        </div>
                        <div className="ion-legend-item">
                            <div className="info-icon base">OH-</div>
                            <span>Hydroxide Ion (Basic)</span>
                        </div>
                    </div>
                </div>

                {/* Center: Game Screen (Relative Wrapper for Scoped Popups) */}
                <div className="game-screen-wrapper pixel-panel">
                    {/* SCOPED OVERLAYS - Only cover this wrapper */}
                    {gameState === 'menu' && (
                        <div className="scoped-overlay">
                            <h1 className="overlay-title">SPEED RUN</h1>
                            <p className="overlay-subtitle">Identify the dominant ion!</p>
                            <button className="pixel-button large" onClick={startGame}>START</button>
                        </div>
                    )}

                    {gameState === 'gameover' && (
                        <div className="scoped-overlay">
                            <h1 className="overlay-title error">GAME OVER!</h1>
                            <p className="overlay-subtitle">Wrong Choice</p>
                            <button className="pixel-button large" onClick={startGame}>RETRY</button>
                        </div>
                    )}

                    {gameState === 'won' && (
                        <div className="scoped-overlay">
                            <h1 className="overlay-title success">SUCCESS!</h1>
                            <p className="overlay-subtitle">TIME: {formatTime(finalTime)}</p>
                            <button className="pixel-button large" onClick={startGame}>AGAIN</button>
                        </div>
                    )}

                    {flash && <div className={`scoped-flash ${flash}`}></div>}

                    {/* Game Content */}
                    <div className={`game-content-inner ${gameState !== 'playing' ? 'blur-content' : ''}`}>
                        <div className="beaker-container">
                            <div className="beaker">
                                {particles.map(p => (
                                    <div
                                        key={p.id}
                                        className={`particle ${p.type} ${levelData.moving ? 'moving' : ''}`}
                                        style={{
                                            top: p.top,
                                            left: p.left,
                                            '--move-x': p.moveX,
                                            '--move-y': p.moveY,
                                            animationDuration: p.animationDuration,
                                            animationDelay: p.animationDelay,
                                            transform: `scale(${p.scale})`
                                        }}
                                    >
                                        {p.type === 'acid' ? 'H+' : 'OH-'}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Controls INSIDE the Game Screen */}
                        <div className="embedded-controls">
                            <button
                                className="control-button acid-btn"
                                onClick={() => handleGuess('acid')}
                                disabled={gameState !== 'playing'}
                            >
                                ACID
                            </button>
                            <div className="vs-badge">VS</div>
                            <button
                                className="control-button base-btn"
                                onClick={() => handleGuess('base')}
                                disabled={gameState !== 'playing'}
                            >
                                BASE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcidReflex;
