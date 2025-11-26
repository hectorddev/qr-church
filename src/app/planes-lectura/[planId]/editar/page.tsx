"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { ALL_BIBLE_BOOKS, getBookByCode } from "@/lib/bible-books";
import { getAvailableVersions } from "@/lib/youversion";
import { PlanWithProgress, PlanChapter, CreatePlanData } from "@/lib/types";

interface ChapterInput {
    id: string; // temporary id for UI only
    dia: number;
    libro: string;
    capitulo: number;
    version: string;
    orden: number;
}

export default function EditarPlanPage({ params }: { params: Promise<{ planId: string }> }) {
    const { planId } = use(params);
    const { usuario } = useAuth();
    const router = useRouter();

    const [plan, setPlan] = useState<PlanWithProgress | null>(null);
    const [loading, setLoading] = useState(true);

    // Form fields
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [icono, setIcono] = useState("📖");
    const [isPublic, setIsPublic] = useState(true);
    const [capitulos, setCapitulos] = useState<ChapterInput[]>([]);
    const [saving, setSaving] = useState(false);

    // New chapter temporary fields
    const [nuevoDia, setNuevoDia] = useState(1);
    const [nuevoLibro, setNuevoLibro] = useState("GEN");
    const [nuevoCapitulo, setNuevoCapitulo] = useState(1);
    const [nuevaVersion, setNuevaVersion] = useState("NVI");

    const emojis = ["📖", "✝️", "🙏", "📜", "⭐", "💎", "🕊️", "🔥", "💡", "❤️"];
    const versiones = getAvailableVersions();

    // Load existing plan
    useEffect(() => {
        if (!usuario) {
            router.push("/login");
            return;
        }
        cargarPlan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario, planId]);

    const cargarPlan = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/reading-plans/${planId}`, {
                headers: { "x-user-id": usuario!.id },
            });
            const data = await response.json();
            if (data.success) {
                const p: PlanWithProgress = data.data;
                setPlan(p);
                // Populate form fields
                setTitulo(p.titulo);
                setDescripcion(p.descripcion);
                setIcono(p.icono);
                setIsPublic(p.is_public);
                // Convert existing chapters to UI format (assign temporary ids)
                const uiChapters: ChapterInput[] = p.capitulos.map((c, idx) => ({
                    id: `orig_${c.id}`,
                    dia: c.dia,
                    libro: c.libro,
                    capitulo: c.capitulo,
                    version: c.version,
                    orden: c.orden,
                }));
                setCapitulos(uiChapters);
            } else {
                alert("Error al cargar el plan: " + data.error);
                router.push("/planes-lectura");
            }
        } catch (e) {
            console.error(e);
            alert("Error al cargar el plan");
            router.push("/planes-lectura");
        } finally {
            setLoading(false);
        }
    };

    const agregarCapitulo = () => {
        const book = getBookByCode(nuevoLibro);
        if (!book) {
            alert("Libro no válido");
            return;
        }
        if (nuevoCapitulo < 1 || nuevoCapitulo > book.chapters) {
            alert(`${book.name} solo tiene ${book.chapters} capítulos`);
            return;
        }
        const nuevoId = `temp_${Date.now()}_${Math.random()}`;
        setCapitulos([
            ...capitulos,
            {
                id: nuevoId,
                dia: nuevoDia,
                libro: nuevoLibro,
                capitulo: nuevoCapitulo,
                version: nuevaVersion,
                orden: capitulos.filter((c) => c.dia === nuevoDia).length,
            },
        ]);
        setNuevoCapitulo(nuevoCapitulo + 1);
    };

    const eliminarCapitulo = (id: string) => {
        setCapitulos(capitulos.filter((c) => c.id !== id));
    };

    const guardarCambios = async () => {
        if (!titulo || !descripcion) {
            alert("Título y descripción son obligatorios");
            return;
        }
        setSaving(true);
        try {
            const data: CreatePlanData = {
                titulo,
                descripcion,
                icono,
                is_public: isPublic,
                capitulos: capitulos.map((c) => ({
                    dia: c.dia,
                    libro: c.libro,
                    capitulo: c.capitulo,
                    version: c.version,
                    orden: c.orden,
                })),
            };

            const response = await fetch(`/api/reading-plans/${planId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": usuario!.id,
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                alert("Plan actualizado exitosamente");
                router.push(`/planes-lectura/${planId}`);
            } else {
                alert("Error: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error al guardar los cambios");
        } finally {
            setSaving(false);
        }
    };

    // Group chapters by day for preview
    const capitulosPorDia = capitulos.reduce((acc, cap) => {
        if (!acc[cap.dia]) acc[cap.dia] = [];
        acc[cap.dia].push(cap);
        return acc;
    }, {} as Record<number, ChapterInput[]>);
    const dias = Object.keys(capitulosPorDia).map(Number).sort((a, b) => a - b);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando plan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.push(`/planes-lectura/${planId}`)}
                    className="text-purple-600 hover:text-purple-700 font-medium mb-4 flex items-center gap-2"
                >
                    ← Volver al detalle
                </button>

                <h1 className="text-4xl font-bold text-purple-900 mb-8">✏️ Editar Plan de Lectura</h1>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Información Básica</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Título *</label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Icono</label>
                                <div className="flex gap-2 flex-wrap">
                                    {emojis.map((e) => (
                                        <button
                                            key={e}
                                            onClick={() => setIcono(e)}
                                            className={`text-3xl p-3 rounded-lg border-2 transition-all ${icono === e ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"
                                                }`}
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-700">
                                        Hacer este plan público
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Chapters Management */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Capítulos</h2>
                        {/* Add new chapter */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Día</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={nuevoDia}
                                    onChange={(e) => setNuevoDia(parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Libro</label>
                                <select
                                    value={nuevoLibro}
                                    onChange={(e) => {
                                        setNuevoLibro(e.target.value);
                                        setNuevoCapitulo(1);
                                    }}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                >
                                    {ALL_BIBLE_BOOKS.map((b) => (
                                        <option key={b.code} value={b.code}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Capítulo</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={nuevoCapitulo}
                                    onChange={(e) => setNuevoCapitulo(parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Versión</label>
                                <select
                                    value={nuevaVersion}
                                    onChange={(e) => setNuevaVersion(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                >
                                    {versiones.map((v) => (
                                        <option key={v.code} value={v.code}>
                                            {v.code}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={agregarCapitulo}
                                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                                >
                                    + Agregar
                                </button>
                            </div>
                        </div>

                        {/* Preview */}
                        {capitulos.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {dias.map((dia) => (
                                    <div key={dia} className="border-2 border-gray-200 rounded-lg p-4">
                                        <p className="font-bold text-gray-700 mb-2">Día {dia}</p>
                                        <div className="space-y-2">
                                            {capitulosPorDia[dia].map((c) => {
                                                const book = getBookByCode(c.libro);
                                                return (
                                                    <div
                                                        key={c.id}
                                                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                                    >
                                                        <span className="text-sm">
                                                            {book?.name} {c.capitulo} ({c.version})
                                                        </span>
                                                        <button
                                                            onClick={() => eliminarCapitulo(c.id)}
                                                            className="text-red-500 hover:text-red-700 font-medium text-sm"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push(`/planes-lectura/${planId}`)}
                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={guardarCambios}
                            disabled={saving}
                            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
