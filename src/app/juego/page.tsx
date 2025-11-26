"use client";

import FlappyBirdGame from "@/components/FlappyBirdGame";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function JuegoPage() {
    const { isAuthenticated, isLoading, usuario } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 mx-auto mb-6"></div>
                    <p className="text-2xl font-bold text-purple-700">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 border-b-2 border-purple-200/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.push("/mapa")}
                            className="flex items-center gap-2 text-purple-700 font-bold hover:text-purple-900 transition-colors"
                        >
                            <span>⬅️</span>
                            <span className="hidden sm:inline">Volver al Mapa</span>
                        </button>

                        <h1 className="text-xl sm:text-2xl font-black text-purple-800 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Vuelo Espiritual
                        </h1>

                        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-purple-200">
                            <span>🏆</span>
                            <span className="font-bold text-purple-800">{usuario?.puntuacion || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Container */}
            <main className="flex-1 flex items-center justify-center p-4">
                <FlappyBirdGame />
            </main>
        </div>
    );
}
