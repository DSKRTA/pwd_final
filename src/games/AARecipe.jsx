import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './AARecipe.css';

const AARecipe = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const animationFrameRef = useRef(null);
    const raycasterRef = useRef(new THREE.Raycaster());
    const mouseRef = useRef(new THREE.Vector2());
    const bondsRef = useRef([]); // Store bond meshes for clicking

    // Game state
    const [gameState, setGameState] = useState('building'); // building, bending, finished
    const [selectedColor, setSelectedColor] = useState(0);
    const [aminoAcids, setAminoAcids] = useState([]); // Array of {color, position, rotation}
    const [bendHistory, setBendHistory] = useState([]); // For undo functionality
    const [proteinName, setProteinName] = useState('');
    const [selectedBondIndex, setSelectedBondIndex] = useState(null); // Which bond is selected for bending

    // Color palette - 5 colors for amino acids
    const colors = [
        '#FF6B6B', // Red
        '#66d87e', // Green-cyan
        '#45B7D1', // Blue
        '#FFA07A', // Orange
        '#eee062', // Yellow
    ];

    // Initialize Three.js scene
    useEffect(() => {
        if (!canvasRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            canvasRef.current.clientWidth / canvasRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 5, 15);
        cameraRef.current = camera;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            preserveDrawingBuffer: true, // Needed for screenshot
        });
        renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        rendererRef.current = renderer;

        // Lighting - Enhanced for better 3D depth perception
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
        scene.add(ambientLight);

        // Main directional light from top-right
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight1.position.set(10, 10, 10);
        directionalLight1.castShadow = true;
        scene.add(directionalLight1);

        // Secondary light from left for better edge definition
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight2.position.set(-10, 5, 5);
        scene.add(directionalLight2);

        // Rim light from behind for depth
        const rimLight = new THREE.DirectionalLight(0x8888ff, 0.3);
        rimLight.position.set(0, 5, -10);
        scene.add(rimLight);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 50;
        controlsRef.current = controls;

        // NO GRID HELPER - removed as requested

        // Animation loop
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
            if (!canvasRef.current) return;
            const width = canvasRef.current.clientWidth;
            const height = canvasRef.current.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            renderer.dispose();
            controls.dispose();
        };
    }, []);

    // Create corner-trimmed cube (chamfered box) - 1.5x1.5x1.5 size
    const createAminoAcidBlock = (color, position) => {
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

        // Chamfer the edges by modifying vertices
        const positionAttribute = geometry.attributes.position;
        const chamferAmount = 0.2;

        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);

            // Move vertices slightly inward based on their position
            const newX = x > 0 ? x - chamferAmount : x + chamferAmount;
            const newY = y > 0 ? y - chamferAmount : y + chamferAmount;
            const newZ = z > 0 ? z - chamferAmount : z + chamferAmount;

            positionAttribute.setXYZ(i, newX, newY, newZ);
        }

        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 100,
            specular: 0x444444,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    };

    // Create connection (bond) between two blocks
    const createBond = (pos1, pos2, isSelected = false) => {
        const direction = new THREE.Vector3().subVectors(pos2, pos1);
        const length = direction.length();
        const geometry = new THREE.CylinderGeometry(0.2, 0.2, length, 8);
        const material = new THREE.MeshPhongMaterial({
            color: isSelected ? 0xffff00 : 0xcccccc, // Yellow when selected
            shininess: 50,
            emissive: isSelected ? 0x444400 : 0x000000,
        });

        const bond = new THREE.Mesh(geometry, material);
        bond.position.copy(pos1).add(direction.multiplyScalar(0.5));

        // Align cylinder with the direction
        const axis = new THREE.Vector3(0, 1, 0);
        bond.quaternion.setFromUnitVectors(axis, direction.normalize());

        return bond;
    };

    // Handle bond click for selection
    const handleCanvasClick = (event) => {
        if (gameState !== 'bending') return;

        const rect = canvasRef.current.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(bondsRef.current);

        if (intersects.length > 0) {
            const clickedBond = intersects[0].object;
            const bondIndex = bondsRef.current.indexOf(clickedBond);
            setSelectedBondIndex(bondIndex);
        }
    };

    // Render amino acids and bonds
    useEffect(() => {
        if (!sceneRef.current) return;

        const scene = sceneRef.current;

        // Clear previous amino acids and bonds
        const objectsToRemove = [];
        scene.children.forEach((child) => {
            if (child.userData.isAminoAcid || child.userData.isBond) {
                objectsToRemove.push(child);
            }
        });
        objectsToRemove.forEach((obj) => scene.remove(obj));

        // Clear bonds array
        bondsRef.current = [];

        // Add amino acids
        aminoAcids.forEach((acid, index) => {
            const block = createAminoAcidBlock(colors[acid.color], acid.position);
            block.rotation.copy(acid.rotation);
            block.userData.isAminoAcid = true;
            scene.add(block);

            // Add bond to previous amino acid
            if (index > 0) {
                const isSelected = selectedBondIndex === index - 1;
                const bond = createBond(aminoAcids[index - 1].position, acid.position, isSelected);
                bond.userData.isBond = true;
                bond.userData.bondIndex = index - 1;
                scene.add(bond);
                bondsRef.current.push(bond);
            }
        });
    }, [aminoAcids, colors, selectedBondIndex]);

    // Add amino acid
    const handleAddAminoAcid = () => {
        const newPosition = new THREE.Vector3(
            aminoAcids.length * 2, // Spacing for 1.5x1.5x1.5 blocks
            0,
            0
        );

        const newAcid = {
            color: selectedColor,
            position: newPosition,
            rotation: new THREE.Euler(0, 0, 0),
        };

        setAminoAcids([...aminoAcids, newAcid]);
    };

    // Start bending mode
    const handleStartBending = () => {
        setGameState('bending');
        setBendHistory([JSON.parse(JSON.stringify(aminoAcids))]); // Save initial state
        setSelectedBondIndex(null);
    };

    // Apply bend at selected bond with specified axis and angle
    const handleBend = (axis, angle) => {
        if (aminoAcids.length < 2) return;
        if (selectedBondIndex === null) {
            alert('Please click on a bond (connection) to select where to bend!');
            return;
        }

        // Save current state for undo
        setBendHistory([...bendHistory, JSON.parse(JSON.stringify(aminoAcids))]);

        // The bend point is after the selected bond
        const bendIndex = selectedBondIndex;
        const angleRad = (angle * Math.PI) / 180;

        // Determine rotation axis
        let rotationAxis;
        switch (axis) {
            case 'X':
                rotationAxis = new THREE.Vector3(1, 0, 0);
                break;
            case 'Y':
                rotationAxis = new THREE.Vector3(0, 1, 0);
                break;
            case 'Z':
                rotationAxis = new THREE.Vector3(0, 0, 1);
                break;
            default:
                rotationAxis = new THREE.Vector3(0, 1, 0);
        }

        const newAminoAcids = aminoAcids.map((acid, index) => {
            if (index <= bendIndex) return acid;

            // Rotate around the bend point
            const bendPoint = aminoAcids[bendIndex].position;
            const relativePos = new THREE.Vector3().subVectors(acid.position, bendPoint);

            // Rotate around specified axis
            const rotatedPos = relativePos.clone();
            rotatedPos.applyAxisAngle(rotationAxis, angleRad);

            // Update rotation
            const newRotation = acid.rotation.clone();
            if (axis === 'X') newRotation.x += angleRad;
            if (axis === 'Y') newRotation.y += angleRad;
            if (axis === 'Z') newRotation.z += angleRad;

            return {
                ...acid,
                position: new THREE.Vector3().addVectors(bendPoint, rotatedPos),
                rotation: newRotation,
            };
        });

        setAminoAcids(newAminoAcids);
    };

    // Undo last bend
    const handleUndo = () => {
        if (bendHistory.length > 1) {
            const newHistory = [...bendHistory];
            newHistory.pop(); // Remove current state
            const previousState = newHistory[newHistory.length - 1];
            setAminoAcids(JSON.parse(JSON.stringify(previousState)));
            setBendHistory(newHistory);
        }
    };

    // State for saved proteins
    const [savedProteins, setSavedProteins] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Fetch saved proteins
    const fetchProteins = async () => {
        if (!user || !user.username) return;
        try {
            const res = await fetch(`${API_URL}/api/proteins/${user.username}`);
            const data = await res.json();
            if (data.proteins) {
                setSavedProteins(data.proteins);
            }
        } catch (err) {
            console.error('Failed to fetch proteins:', err);
        }
    };

    useEffect(() => {
        fetchProteins();
    }, [user]);

    // Capture screenshot and save
    const handleFinish = async () => {
        if (!rendererRef.current || !user) return;

        // Generate protein name
        const count = savedProteins.length + 1;
        const name = `Protein ${count}`;
        setProteinName(name);

        // Capture screenshot
        const screenshot = rendererRef.current.domElement.toDataURL('image/png');

        try {
            await fetch(`${API_URL}/api/proteins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.username,
                    name,
                    screenshot,
                    structure: aminoAcids
                })
            });
            // Refresh list
            fetchProteins();
        } catch (err) {
            console.error('Failed to save protein:', err);
        }

        setGameState('finished');
    };

    // Reset game
    const handleReset = () => {
        setGameState('building');
        setAminoAcids([]);
        setBendHistory([]);
        setProteinName('');
        setSelectedColor(0);
        setSelectedBondIndex(null);
    };

    return (
        <div className="aa-recipe-container">
            <div className="game-header">
                <h1 className="pixel-title">AA RECIPE</h1>
                <button className="pixel-button pixel-button-secondary back-button" onClick={() => navigate('/')}>
                    BACK TO MAIN
                </button>
            </div>

            <div className="game-content">
                <div className="game-info pixel-panel">
                    <h2 className="pixel-subtitle">How to Play</h2>
                    <p className="pixel-text">
                        Build your own 3D protein structure!<br /><br />
                        <strong>Building Mode:</strong><br />
                        1. Select an amino acid color<br />
                        2. Click "Add Amino Acid"<br />
                        3. Build a chain of 3 or more<br /><br />
                        <strong>Bending Mode:</strong><br />
                        1. Click on a bond (connection)<br />
                        2. Choose rotation axis (X/Y/Z)<br />
                        3. Select angle<br />
                        4. Create complex 3D shapes!<br /><br />
                        Use UNDO to fix mistakes.<br />
                        Click FINISH to save.
                    </p>
                </div>

                <div className="canvas-wrapper">
                    <canvas
                        ref={canvasRef}
                        className="aa-recipe-canvas"
                        onClick={handleCanvasClick}
                        style={{ cursor: gameState === 'bending' ? 'pointer' : 'default' }}
                    />

                    {gameState === 'finished' && (
                        <div className="finish-overlay">
                            <div className="finish-panel pixel-panel">
                                <h2 className="pixel-subtitle">Protein Created!</h2>
                                <p className="pixel-text">Name: {proteinName}</p>
                                <p className="pixel-text">Amino Acids: {aminoAcids.length}</p>
                                <button className="pixel-button" onClick={handleReset}>
                                    CREATE NEW PROTEIN
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="right-column">
                    <div className="controls-panel pixel-panel">
                        <h2 className="pixel-subtitle">CONTROLS</h2>

                        {gameState === 'building' && (
                            <>
                                <div className="control-section">
                                    <h3 className="pixel-label">SELECT AMINO ACID</h3>
                                    <div className="color-palette">
                                        {colors.map((color, index) => (
                                            <button
                                                key={index}
                                                className={`color-button ${selectedColor === index ? 'selected' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setSelectedColor(index)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="control-section">
                                    <button className="pixel-button" onClick={handleAddAminoAcid}>
                                        ADD AMINO ACID
                                    </button>
                                    <p className="pixel-text">Chain Length: {aminoAcids.length}</p>
                                </div>

                                {aminoAcids.length >= 3 && (
                                    <div className="control-section">
                                        <button className="pixel-button pixel-button-primary" onClick={handleStartBending}>
                                            START BENDING
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {gameState === 'bending' && (
                            <>
                                <div className="control-section">
                                    <h3 className="pixel-label">SELECT BOND</h3>
                                    <p className="pixel-text" style={{ fontSize: '0.9rem' }}>
                                        {selectedBondIndex !== null
                                            ? `Bond ${selectedBondIndex + 1} selected (yellow)`
                                            : 'Click a bond to select'}
                                    </p>
                                </div>

                                <div className="control-section">
                                    <h3 className="pixel-label">ROTATE X-AXIS</h3>
                                    <div className="bend-buttons">
                                        <button className="pixel-button bend-btn" onClick={() => handleBend('X', 30)}>
                                            X +30°
                                        </button>
                                        <button className="pixel-button bend-btn" onClick={() => handleBend('X', -30)}>
                                            X -30°
                                        </button>
                                        <button className="pixel-button bend-btn" onClick={() => handleBend('X', 45)}>
                                            X +45°
                                        </button>
                                        <button className="pixel-button bend-btn" onClick={() => handleBend('X', -45)}>
                                            X -45°
                                        </button>
                                    </div>
                                </div>

                                <div className="control-section">
                                    <h3 className="pixel-label">ROTATE Y-AXIS</h3>
                                    <div className="bend-buttons">
                                        <button className="pixel-button bend-btn" onClick={() => handleBend('Y', 30)}>
                                            Y +30°
                                        </button>
                                        <button className="pixel-button bend-btn" onClick={() => handleBend('Y', -30)}>
                                            Y -30°
                                        </button>
                                        <button className="pixel-button bend-btn" onClick={() => handleBend('Y', 45)}>
                                            Y +45°
                                        </button>
                                        <button className="pixel-button bend-btn" onClick={() => handleBend('Y', -45)}>
                                            Y -45°
                                        </button>
                                    </div>
                                </div>

                                <div className="control-section">
                                    <h3 className="pixel-label">ROTATE Z-AXIS</h3>
                                    <div className="bend-buttons">
                                        <button className="pixel-button bend-btn" onClick={() => handleBend('Z', 30)}>
                                            Z +30°
                                        </button>
                                        <button className="pixel-button bend-btn" onClick={() => handleBend('Z', -30)}>
                                            Z -30°
                                        </button>
                                        <button className="pixel-button bend-btn" onClick={() => handleBend('Z', 45)}>
                                            Z +45°
                                        </button>
                                        <button className="pixel-button bend-btn" onClick={() => handleBend('Z', -45)}>
                                            Z -45°
                                        </button>
                                    </div>
                                </div>

                                <div className="control-section">
                                    <button
                                        className="pixel-button pixel-button-secondary"
                                        onClick={handleUndo}
                                        disabled={bendHistory.length <= 1}
                                    >
                                        UNDO
                                    </button>
                                    <button className="pixel-button pixel-button-primary" onClick={handleFinish}>
                                        FINISH
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {gameState === 'building' && savedProteins.length > 0 && (
                        <div className="archive-panel pixel-panel">
                            <h2 className="pixel-subtitle">ARCHIVE</h2>
                            <div className="protein-grid">
                                {savedProteins.map((protein) => (
                                    <div key={protein.id} className="protein-card">
                                        <img src={protein.screenshot} alt={protein.name} className="protein-thumb" />
                                        <p className="pixel-text small">{protein.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AARecipe;
