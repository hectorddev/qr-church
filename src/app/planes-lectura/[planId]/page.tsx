"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { PlanWithProgress, PlanChapter } from "@/lib/types";
import { getYouVersionUrl } from "@/lib/youversion";

export default function PlanDetailPage({ params }: { params: Promise<{ planId: string }> }) {
    const { planId } = use(params);
    const { usuario } = useAuth();
    const router = useRouter();
    const [plan, setPlan] = useState<PlanWithProgress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!usuario) {
            router.push("/login");
            return;
        }

        cargarPlan();
    }, [usuario, planId]);

    const cargarPlan = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/reading-plans/${planId}`, {
                headers: {
                    "x-user-id": usuario!.id,
                },
            });

            const data = await response.json();
            if (data.success) {
                setPlan(data.data);
            } else {
                alert("Error: " + data.error);
                router.push("/planes-lectura");
            }
        } catch (error) {
            console.error("Error cargando plan:", error);
            alert("Error al cargar el plan");
            router.push("/planes-lectura");
        } finally {
            setLoading(false);
        }
    };

    const toggleCapitulo = async (chapterId: string, currentState: boolean) => {
        try {
            const response = await fetch(`/api/reading-plans/${planId}/progress`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": usuario!.id,
                },
                body: JSON.stringify({
                    chapterId,
                    completado: !currentState,
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Recargar plan para actualizar progreso
                cargarPlan();
            }
        } catch (error) {
            console.error("Error actualizando progreso:", error);
        }
    };

    const abrirEnYouVersion = (chapter: PlanChapter) => {
        const url = getYouVersionUrl(chapter.libro, chapter.capitulo, chapter.version);
        window.open(url, "_blank");
    };

    const isCompletado = (chapterId: string): boolean => {
        return plan?.progreso?.some((p) => p.chapter_id === chapterId && p.completado) || false;
    };

    // Agrupar capítulos por día
    const capitulosPorDia = plan?.capitulos.reduce((acc, cap) => {
        if (!acc[cap.dia]) {
            acc[cap.dia] = [];
        }
        acc[cap.dia].push(cap);
        return acc;
    }, {} as Record<number, PlanChapter[]>) || {};

    const dias = Object.keys(capitulosPorDia).map(Number).sort((a, b) => a - b);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando plan...</p>
                </div>
            </div>
        );
    }

    if (!plan) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push("/planes-lectura")}
                        className="text-purple-600 hover:text-purple-700 font-medium mb-4 flex items-center gap-2"
                    >
                        ← Volver a Planes
                    </button>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="text-5xl">{plan.icono}</div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800">{plan.titulo}</h1>
                                    <p className="text-gray-600 mt-1">{plan.descripcion}</p>
                                    {plan.nombre_creador && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            Creado por: {plan.nombre_creador}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <span
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${!plan.created_by
                                        ? "bg-yellow-100 text-yellow-800"
                                        : plan.is_public
                                            ? "bg-green-100 text-green-800"
                                            : "bg-blue-100 text-blue-800"
                                    }`}
                            >
                                {!plan.created_by ? "Oficial" : plan.is_public ? "Público" : "Privado"}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">Progreso</span>
                                <span className="text-sm font-semibold text-purple-600">
                                    {plan.porcentaje_completado}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${plan.porcentaje_completado}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {plan.capitulos_completados} de {plan.total_capitulos} capítulos completados
                            </p>
                        </div>
                    </div>
                </div>

                {/* Days and Chapters */}
                <div className="space-y-4">
                    {dias.map((dia) => (
                        <div key={dia} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                📅 Día {dia}
                            </h2>

                            <div className="space-y-3">
                                {capitulosPorDia[dia]
                                    .sort((a, b) => a.orden - b.orden)
                                    .map((capitulo) => {
                                        const completado = isCompletado(capitulo.id);
                                        return (
                                            <div
                                                key={capitulo.id}
                                                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${completado
                                                        ? "bg-green-50 border-green-200"
                                                        : "bg-gray-50 border-gray-200 hover:border-purple-200"
                                                    }`}
                                            >
                                                {/* Checkbox */}
                                                <input
                                                    type="checkbox"
                                                    checked={completado}
                                                    onChange={() => toggleCapitulo(capitulo.id, completado)}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                                                />

                                                {/* Chapter Info */}
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">
                                                        {capitulo.libro} {capitulo.capitulo}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{capitulo.version}</p>
                                                </div>

                                                {/* Open in YouVersion Button */}
                                                <button
                                                    onClick={() => abrirEnYouVersion(capitulo)}
                                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                                                >
                                                    📖 Leer
                                                </button>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Edit Button (only for creator) */}
                {plan.es_creador && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => router.push(`/planes-lectura/${plan.id}/editar`)}
                            className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                        >
                            ✏️ Editar Plan
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
