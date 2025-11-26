"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReadingPlan } from "@/lib/types";

export default function PlanesLecturaPage() {
    const { usuario } = useAuth();
    const router = useRouter();
    const [planes, setPlanes] = useState<ReadingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"all" | "official" | "my">("all");

    useEffect(() => {
        if (!usuario) {
            router.push("/login");
            return;
        }

        cargarPlanes();
    }, [usuario, activeTab]);

    const cargarPlanes = async () => {
        setLoading(true);
        try {
            const filter = activeTab === "all" ? undefined : activeTab === "official" ? "official" : "my";
            const response = await fetch(`/api/reading-plans?filter=${filter || ""}`, {
                headers: {
                    "x-user-id": usuario!.id,
                },
            });

            const data = await response.json();
            if (data.success) {
                setPlanes(data.data);
            }
        } catch (error) {
            console.error("Error cargando planes:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-purple-900 mb-2">
                        📖 Planes de Lectura Bíblica
                    </h1>
                    <p className="text-gray-600">
                        Crea y sigue planes personalizados de lectura bíblica
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === "all"
                                ? "text-purple-600 border-b-2 border-purple-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        📚 Todos
                    </button>
                    <button
                        onClick={() => setActiveTab("official")}
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === "official"
                                ? "text-purple-600 border-b-2 border-purple-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        ⭐ Oficiales
                    </button>
                    <button
                        onClick={() => setActiveTab("my")}
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === "my"
                                ? "text-purple-600 border-b-2 border-purple-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        ✏️ Mis Planes
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando planes...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && planes.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <div className="text-6xl mb-4">📖</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            No hay planes disponibles
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {activeTab === "my"
                                ? "Aún no has creado ningún plan de lectura"
                                : "No hay planes disponibles en esta categoría"}
                        </p>
                        {activeTab === "my" && (
                            <button
                                onClick={() => router.push("/planes-lectura/crear")}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                            >
                                ➕ Crear Mi Primer Plan
                            </button>
                        )}
                    </div>
                )}

                {/* Plans Grid */}
                {!loading && planes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {planes.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => router.push(`/planes-lectura/${plan.id}`)}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer p-6 border-2 border-transparent hover:border-purple-200"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-4xl">{plan.icono}</div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${!plan.created_by
                                                ? "bg-yellow-100 text-yellow-800"
                                                : plan.is_public
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-blue-100 text-blue-800"
                                            }`}
                                    >
                                        {!plan.created_by ? "Oficial" : plan.is_public ? "Público" : "Privado"}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {plan.titulo}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {plan.descripcion}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>📅 Ver Plan</span>
                                    <span>→</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Floating Action Button */}
                <button
                    onClick={() => router.push("/planes-lectura/crear")}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all flex items-center justify-center text-3xl"
                    title="Crear nuevo plan"
                >
                    +
                </button>
            </div>
        </div>
    );
}
