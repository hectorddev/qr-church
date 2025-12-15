"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

export default function FlappyBirdGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { usuario, updateUser } = useAuth();
    const router = useRouter();

    const [gameState, setGameState] = useState<"START" | "READY" | "PLAYING" | "GAME_OVER">("START");
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [difficulty, setDifficulty] = useState<"FACIL" | "MEDIO" | "DIFICIL">("MEDIO");

    // Milestone system: 100 pipes = 25 points, 200 = 50, 300 = 75, etc.
    const MILESTONE_INTERVAL = 100;
    const POINTS_PER_MILESTONE = 25;

    // Game constants - base values (will be adjusted by difficulty)
    const BASE_GRAVITY = 0.6;
    const BASE_JUMP = -8;
    const BASE_PIPE_SPEED = 2.2; // Slower than before (was 3)
    const BASE_PIPE_SPAWN_RATE = 1800; // Slower spawn rate (was 1500)
    const BIRD_SIZE = 30;
    const PIPE_WIDTH = 60;
    const BASE_PIPE_GAP = 170;

    // Difficulty multipliers
    const difficultySettings = {
        FACIL: {
            pipeSpeed: BASE_PIPE_SPEED * 0.7, // 70% speed
            pipeSpawnRate: BASE_PIPE_SPAWN_RATE * 1.3, // 30% slower spawn
            pipeGap: BASE_PIPE_GAP * 1.2, // 20% larger gap
            gravity: BASE_GRAVITY * 0.9, // 10% less gravity
            jump: BASE_JUMP * 1.1 // 10% stronger jump
        },
        MEDIO: {
            pipeSpeed: BASE_PIPE_SPEED, // Normal speed
            pipeSpawnRate: BASE_PIPE_SPAWN_RATE, // Normal spawn
            pipeGap: BASE_PIPE_GAP, // Normal gap
            gravity: BASE_GRAVITY, // Normal gravity
            jump: BASE_JUMP // Normal jump
        },
        DIFICIL: {
            pipeSpeed: BASE_PIPE_SPEED * 1.3, // 30% faster
            pipeSpawnRate: BASE_PIPE_SPAWN_RATE * 0.8, // 20% faster spawn
            pipeGap: BASE_PIPE_GAP * 0.85, // 15% smaller gap
            gravity: BASE_GRAVITY * 1.1, // 10% more gravity
            jump: BASE_JUMP * 0.95 // 5% weaker jump
        }
    };

    // Get current difficulty settings
    const getGameConstants = () => {
        return difficultySettings[difficulty];
    };

    // Game state refs (for loop)
    const birdY = useRef(300);
    const birdVelocity = useRef(0);
    const pipes = useRef<{ x: number; topHeight: number; passed: boolean }[]>([]);
    const lastTime = useRef(0);
    const animationFrameId = useRef<number>(0);
    const lastPipeSpawn = useRef(0);
    const isPlaying = useRef(false);

    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        // Background (Sky)
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#87CEEB"); // Sky Blue
        gradient.addColorStop(1, "#E0F7FA"); // Light Cyan
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Pipes
        const constants = getGameConstants();
        ctx.fillStyle = "#4CAF50"; // Green
        ctx.strokeStyle = "#2E7D32"; // Dark Green border
        ctx.lineWidth = 2;

        pipes.current.forEach(pipe => {
            // Top Pipe
            ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
            ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

            // Bottom Pipe cap
            ctx.fillRect(pipe.x - 2, pipe.topHeight - 20, PIPE_WIDTH + 4, 20);
            ctx.strokeRect(pipe.x - 2, pipe.topHeight - 20, PIPE_WIDTH + 4, 20);

            // Bottom Pipe
            const bottomPipeY = pipe.topHeight + constants.pipeGap;
            const bottomPipeHeight = canvas.height - bottomPipeY;
            ctx.fillRect(pipe.x, bottomPipeY, PIPE_WIDTH, bottomPipeHeight);
            ctx.strokeRect(pipe.x, bottomPipeY, PIPE_WIDTH, bottomPipeHeight);

            // Bottom Pipe cap
            ctx.fillRect(pipe.x - 2, bottomPipeY, PIPE_WIDTH + 4, 20);
            ctx.strokeRect(pipe.x - 2, bottomPipeY, PIPE_WIDTH + 4, 20);
        });

        // Bird
        ctx.font = `${BIRD_SIZE}px Arial`;
        ctx.fillText("🕊️", 50, birdY.current + BIRD_SIZE);

        // Ground
        ctx.fillStyle = "#8D6E63"; // Brown
        ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

        // Grass
        ctx.fillStyle = "#66BB6A"; // Light Green
        ctx.fillRect(0, canvas.height - 15, canvas.width, 5);
    };

    const gameOver = () => {
        isPlaying.current = false;
        setGameState("GAME_OVER");
        cancelAnimationFrame(animationFrameId.current);
        if (score > highScore) {
            setHighScore(score);
        }
    };

    const gameLoop = (time: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const constants = getGameConstants();
        const deltaTime = time - lastTime.current;
        lastTime.current = time;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update Physics
        birdVelocity.current += constants.gravity;
        birdY.current += birdVelocity.current;

        // Spawn Pipes
        if (time - lastPipeSpawn.current > constants.pipeSpawnRate) {
            const minPipeHeight = 50;
            const maxPipeHeight = canvas.height - constants.pipeGap - minPipeHeight;
            const randomHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1) + minPipeHeight);

            pipes.current.push({
                x: canvas.width,
                topHeight: randomHeight,
                passed: false
            });
            lastPipeSpawn.current = time;
        }

        // Update Pipes
        pipes.current.forEach(pipe => {
            pipe.x -= constants.pipeSpeed;
        });

        // Remove off-screen pipes
        pipes.current = pipes.current.filter(pipe => pipe.x + PIPE_WIDTH > 0);

        // Collision Detection
        const birdRect = {
            x: 50,
            y: birdY.current,
            width: BIRD_SIZE - 10, // Hitbox slightly smaller
            height: BIRD_SIZE - 10
        };

        // Floor/Ceiling collision
        if (birdY.current + BIRD_SIZE > canvas.height || birdY.current < 0) {
            gameOver();
            return;
        }

        // Pipe collision
        pipes.current.forEach(pipe => {
            // Check if bird is within pipe's horizontal area
            if (birdRect.x + birdRect.width > pipe.x && birdRect.x < pipe.x + PIPE_WIDTH) {
                // Check if bird hits top pipe or bottom pipe
                if (birdRect.y < pipe.topHeight || birdRect.y + birdRect.height > pipe.topHeight + constants.pipeGap) {
                    gameOver();
                    return;
                }
            }

            // Score update
            if (!pipe.passed && birdRect.x > pipe.x + PIPE_WIDTH) {
                pipe.passed = true;
                setScore(prev => prev + 1);
            }
        });

        if (!isPlaying.current) return;

        // Draw
        draw(ctx, canvas);

        animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    const prepareGame = useCallback(() => {
        // Cancel any existing animation frame
        cancelAnimationFrame(animationFrameId.current);

        setScore(0);
        birdY.current = canvasRef.current ? canvasRef.current.height / 2 : 300;
        birdVelocity.current = 0;
        pipes.current = [];
        lastTime.current = performance.now();
        lastPipeSpawn.current = 0;
        isPlaying.current = false;

        // Set game state to READY (waiting for tap to start)
        setGameState("READY");
    }, []);

    const startGame = useCallback(() => {
        // Cancel any existing animation frame
        cancelAnimationFrame(animationFrameId.current);

        isPlaying.current = true;

        // Set game state to PLAYING
        setGameState("PLAYING");

        // Start game loop immediately
        setTimeout(() => {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }, 0);
    }, []);

    const jump = useCallback(() => {
        if (gameState === "PLAYING") {
            const constants = getGameConstants();
            birdVelocity.current = constants.jump;
        } else if (gameState === "READY") {
            startGame();
        } else if (gameState === "START") {
            prepareGame();
        }
    }, [gameState, difficulty, startGame, prepareGame]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const handleResize = () => {
            // Make canvas responsive but keep aspect ratio roughly
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = Math.min(600, window.innerHeight - 200);
            }
        };

        // Keyboard event handler
        const handleKeyDown = (e: KeyboardEvent) => {
            // Space bar or arrow up
            if (e.code === "Space" || e.key === " " || e.code === "ArrowUp") {
                e.preventDefault();
                jump();
            }
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("keydown", handleKeyDown);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("keydown", handleKeyDown);
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [jump]);

    const savePoints = async () => {
        if (!usuario || score < MILESTONE_INTERVAL) return;

        setIsSaving(true);
        try {
            // Calculate points based on milestones reached
            const milestonesReached = Math.floor(score / MILESTONE_INTERVAL);
            const pointsToAdd = milestonesReached * POINTS_PER_MILESTONE;

            const currentPoints = usuario.puntuacion || 0;
            const newTotal = currentPoints + pointsToAdd;

            const response = await fetch(`/api/usuarios/${usuario.id}/puntuacion`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ puntuacion: newTotal }),
            });

            const data = await response.json();

            if (data.success) {
                updateUser({ ...usuario, puntuacion: newTotal });
                alert(`¡Felicidades! Pasaste ${score} túneles (${milestonesReached} hitos de ${MILESTONE_INTERVAL}). Has ganado ${pointsToAdd} puntos. Tu nuevo total es ${newTotal}.`);
                router.push("/mapa");
            } else {
                alert("Error al guardar los puntos: " + data.error);
            }
        } catch (error) {
            console.error("Error saving points:", error);
            alert("Error al conectar con el servidor.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-200 bg-white">
                <canvas
                    ref={canvasRef}
                    onClick={jump}
                    className="w-full cursor-pointer touch-none block"
                    style={{ maxHeight: "600px" }}
                />

                {/* UI Overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-purple-200">
                        <span className="text-2xl font-black text-purple-600">
                            {score}
                        </span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-purple-200">
                        <span className="text-sm font-bold text-gray-600">
                            Récord: {Math.max(score, highScore)}
                        </span>
                    </div>
                </div>

                {/* Start Screen */}
                {gameState === "START" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center border-4 border-purple-200 transform hover:scale-105 transition-transform max-w-md">
                            <h2 className="text-4xl font-black text-purple-600 mb-4">
                                🕊️ Vuelo Espiritual
                            </h2>
                            <p className="text-gray-600 mb-4 text-lg">
                                Toca la pantalla o haz clic para volar.<br />
                                ¡Esquiva los túneles y alcanza hitos!
                            </p>
                            
                            {/* Difficulty Selector */}
                            <div className="bg-purple-50 rounded-xl p-4 mb-4 border-2 border-purple-100">
                                <p className="text-sm font-bold text-purple-700 mb-3">⚙️ Dificultad</p>
                                <div className="flex gap-2 justify-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDifficulty("FACIL");
                                        }}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                            difficulty === "FACIL"
                                                ? "bg-green-500 text-white shadow-lg"
                                                : "bg-white text-gray-600 border-2 border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        Fácil
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDifficulty("MEDIO");
                                        }}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                            difficulty === "MEDIO"
                                                ? "bg-yellow-500 text-white shadow-lg"
                                                : "bg-white text-gray-600 border-2 border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        Medio
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDifficulty("DIFICIL");
                                        }}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                            difficulty === "DIFICIL"
                                                ? "bg-red-500 text-white shadow-lg"
                                                : "bg-white text-gray-600 border-2 border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        Difícil
                                    </button>
                                </div>
                            </div>

                            <div className="bg-purple-50 rounded-xl p-4 mb-6 border-2 border-purple-100">
                                <p className="text-sm font-bold text-purple-700 mb-2">🎯 Sistema de Hitos</p>
                                <p className="text-xs text-gray-600">
                                    • 100 túneles = 25 puntos<br />
                                    • 200 túneles = 50 puntos<br />
                                    • 300 túneles = 75 puntos<br />
                                    <span className="text-purple-600 font-semibold">¡Y así sucesivamente!</span>
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    prepareGame();
                                }}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                            >
                                ¡Jugar Ahora!
                            </button>
                        </div>
                    </div>
                )}

                {/* Ready Screen - Tap to Start */}
                {gameState === "READY" && (
                    <div 
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm cursor-pointer"
                        onClick={jump}
                    >
                        <div className="bg-white/95 p-8 rounded-3xl shadow-2xl text-center border-4 border-purple-300 max-w-md animate-pulse">
                            <div className="text-6xl mb-4">👆</div>
                            <h2 className="text-3xl font-black text-purple-600 mb-2">
                                ¡Toca para Empezar!
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Toca la pantalla o presiona ESPACIO cuando estés listo
                            </p>
                            <div className="mt-4 text-sm text-purple-500 font-semibold">
                                Dificultad: {
                                    difficulty === "FACIL" ? "🟢 Fácil" :
                                    difficulty === "MEDIO" ? "🟡 Medio" :
                                    "🔴 Difícil"
                                }
                            </div>
                        </div>
                    </div>
                )}

                {/* Game Over Screen */}
                {gameState === "GAME_OVER" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center border-4 border-purple-200 max-w-sm w-full mx-4">
                            <h2 className="text-3xl font-black text-gray-800 mb-2">
                                ¡Juego Terminado!
                            </h2>
                            <div className="text-6xl mb-4">🕊️</div>

                            <div className="bg-purple-50 rounded-xl p-4 mb-4 border-2 border-purple-100">
                                <p className="text-gray-600 text-sm uppercase tracking-wider font-bold">Túneles Pasados</p>
                                <p className="text-5xl font-black text-purple-600">{score}</p>
                                {score >= MILESTONE_INTERVAL && (
                                    <p className="text-green-600 font-bold mt-2">
                                        {Math.floor(score / MILESTONE_INTERVAL)} hito{Math.floor(score / MILESTONE_INTERVAL) > 1 ? 's' : ''} = {Math.floor(score / MILESTONE_INTERVAL) * POINTS_PER_MILESTONE} puntos
                                    </p>
                                )}
                                {score < MILESTONE_INTERVAL && (
                                    <p className="text-orange-600 font-medium mt-2 text-sm">
                                        Necesitas {MILESTONE_INTERVAL - score} túneles más para guardar
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        savePoints();
                                    }}
                                    disabled={isSaving || score < MILESTONE_INTERVAL}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? "Guardando..." : score < MILESTONE_INTERVAL ? `🔒 Alcanza ${MILESTONE_INTERVAL} túneles` : "💾 Guardar Puntos"}
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prepareGame();
                                    }}
                                    className="w-full px-6 py-3 bg-white text-purple-600 border-2 border-purple-200 rounded-xl font-bold text-lg hover:bg-purple-50 transition-colors"
                                >
                                    🔄 Intentar de nuevo
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push("/mapa");
                                    }}
                                    className="w-full px-6 py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                                >
                                    Volver al Mapa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 text-center text-purple-800/60 font-medium text-sm">
                Presiona espacio o toca la pantalla para saltar
            </div>
        </div>
    );
}
