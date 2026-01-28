
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Premio } from "@/lib/types";
import React from "react";

// Catálogo de premios hardcoded por ahora
const CATALOGO_PREMIOS: Premio[] = [
    {
        id: "1",
        nombre: "Helado",
        costo: 500,
        emoji: "🍦",
    },
    {
        id: "2",
        nombre: "Exoneración de la salida de fin de año",
        costo: 2000,
        emoji: "🎉",
    },
    {
        id: "3",
        nombre: "Hamburguesita top o Su versión vegetariana",
        costo: 2000,
        emoji: "🍔",
    },
    {
        id: "4",
        nombre: "Salida al cine con David y Adriana",
        costo: 3000,
        emoji: "🎬",
    },
    {
        id: "5",
        nombre: "Franela/Chaqueta + Gorra",
        costo: 10000,
        emoji: "👕",
    },
    {
        id: "6",
        nombre: "Biblia de Estudio",
        costo: 50000,
        emoji: "📖",
    },
];

export default function PremiosPage() {
    const { usuario, isLoading, updateUser } = useAuth();

    // Refrescar datos del usuario al entrar para asegurar que los puntos estén actualizados
    React.useEffect(() => {
        const refreshToken = async () => {
            if (usuario?.id) {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) return;

                    const response = await fetch("/api/auth/me", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const result = await response.json();
                    if (result.success && result.usuario) {
                        updateUser(result.usuario);
                    }
                } catch (error) {
                    console.error("Error actualizando puntos:", error);
                }
            }
        };
        refreshToken();
    }, [usuario?.id]); // Dependency updated to be safer

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

    const puntosUsuario = usuario?.puntuacion || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 shadow-xl border-b-4 border-yellow-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row justify-between items-center py-6 lg:py-8 gap-4 lg:gap-0">
                        <div className="text-center lg:text-left">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 drop-shadow-md">
                                🏆 Catálogo de Premios
                            </h1>
                            <p className="text-base sm:text-lg lg:text-xl text-yellow-100 font-medium">
                                ¡Canjea tus puntos por recompensas increíbles!
                            </p>
                        </div>

                        {/* Tarjeta de Puntos */}
                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border-2 border-white/30 shadow-lg transform hover:scale-105 transition-all">
                            <p className="text-yellow-100 text-sm font-bold uppercase tracking-wider mb-1">
                                Tus Puntos
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-4xl lg:text-5xl">🪙</span>
                                <span className="text-4xl lg:text-5xl font-black text-white">
                                    {puntosUsuario.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {CATALOGO_PREMIOS.map((premio) => {
                        const puedeCanjear = puntosUsuario >= premio.costo;
                        const porcentajeProgreso = Math.min((puntosUsuario / premio.costo) * 100, 100);

                        return (
                            <div
                                key={premio.id}
                                className={`group relative bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col ${puedeCanjear ? "border-4 border-green-400" : "border border-gray-100"
                                    }`}
                            >
                                {/* Badge de Costo */}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-lg z-10 font-black text-gray-800 flex items-center gap-1 border-2 border-yellow-400">
                                    <span>🪙</span>
                                    {premio.costo.toLocaleString()}
                                </div>

                                {/* Emoji / Imagen */}
                                <div className={`h-48 flex items-center justify-center text-9xl bg-gradient-to-br ${puedeCanjear ? "from-green-100 to-emerald-100 group-hover:from-green-200 group-hover:to-emerald-200" : "from-gray-50 to-gray-100"}`}>
                                    {premio.emoji}
                                </div>

                                {/* Info */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-black text-gray-800 mb-2 leading-tight">
                                        {premio.nombre}
                                    </h3>

                                    <div className="mt-auto pt-4">
                                        {puedeCanjear ? (
                                            <div className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform active:scale-95 transition-all text-center cursor-pointer hover:brightness-110">
                                                ¡Canjear ahora! 🎁
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                                                    <span>Progreso</span>
                                                    <span>{Math.round(porcentajeProgreso)}%</span>
                                                </div>
                                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                                                        style={{ width: `${porcentajeProgreso}%` }}
                                                    />
                                                </div>
                                                <p className="text-center text-sm text-gray-400 font-medium">
                                                    Te faltan {(premio.costo - puntosUsuario).toLocaleString()} puntos
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
