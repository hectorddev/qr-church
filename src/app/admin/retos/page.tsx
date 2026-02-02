"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ApiResponse, CrearRetoData, Reto } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminRetosPage() {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [retos, setRetos] = useState<Reto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CrearRetoData>({
    titulo: "",
    descripcion: "",
    fecha_inicio: new Date(),
    fecha_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días por defecto
    activo: true,
    video_url: "",
    iframe_content: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingReto, setEditingReto] = useState<Reto | null>(null);

  // Redirigir si no es admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/login");
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Cargar retos
  useEffect(() => {
    if (isAdmin) {
      loadRetos();
    }
  }, [isAdmin]);

  const loadRetos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/retos");
      const data: ApiResponse<Reto[]> = await response.json();

      if (data.success && data.data) {
        setRetos(data.data);
      } else {
        throw new Error(data.error || "Error al cargar retos");
      }
    } catch (err) {
      console.error("Error loading retos:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: new Date(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validaciones del lado del cliente
    if (!formData.titulo.trim()) {
      setError("El título es requerido");
      setSubmitting(false);
      return;
    }

    if (!formData.descripcion.trim()) {
      setError("La descripción es requerida");
      setSubmitting(false);
      return;
    }

    if (formData.fecha_fin <= formData.fecha_inicio) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio");
      setSubmitting(false);
      return;
    }

    try {
      const url = editingReto ? `/api/retos/${editingReto.id}` : "/api/retos";
      const method = editingReto ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<Reto> = await response.json();

      if (data.success && data.data) {
        if (editingReto) {
          setRetos((prev) =>
            prev.map((r) => (r.id === editingReto.id ? data.data! : r))
          );
          setSuccessMessage("¡Reto actualizado exitosamente!");
        } else {
          setRetos((prev) => [...prev, data.data!]);
          setSuccessMessage("¡Reto creado exitosamente!");
        }

        setFormData({
          titulo: "",
          descripcion: "",
          fecha_inicio: new Date(),
          fecha_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          activo: true,
          iframe_content: "",
        });
        setShowForm(false);
        setEditingReto(null);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.error || "Error al guardar reto");
      }
    } catch (err) {
      console.error("Error saving reto:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReto = (reto: Reto) => {
    setEditingReto(reto);
    setFormData({
      titulo: reto.titulo,
      descripcion: reto.descripcion,
      fecha_inicio: new Date(reto.fecha_inicio),
      fecha_fin: new Date(reto.fecha_fin),
      activo: reto.activo,
      video_url: reto.video_url || "",
      iframe_content: reto.iframe_content || "",
    });
    setShowForm(true);
  };

  const handleDeleteReto = async (id: string, titulo: string) => {
    if (
      !confirm(`¿Estás seguro de que quieres eliminar el reto "${titulo}"?`)
    ) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(`/api/retos/${id}`, {
        method: "DELETE",
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setRetos((prev) => prev.filter((r) => r.id !== id));
        setSuccessMessage("¡Reto eliminado exitosamente!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.error || "Error al eliminar reto");
      }
    } catch (err) {
      console.error("Error deleting reto:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingReto(null);
    setFormData({
      titulo: "",
      descripcion: "",
      fecha_inicio: new Date(),
      fecha_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      activo: true,
      video_url: "",
      iframe_content: "",
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-purple-700">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Se redirigirá automáticamente
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-xl border-b-4 border-purple-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center py-4 lg:py-6 gap-4 lg:gap-0">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                🎯 Gestión de Retos Semanales
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-purple-100 font-medium">
                📅 Crea y administra retos para los usuarios
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl lg:rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 font-bold text-sm lg:text-lg"
              >
                ➕ Nuevo Reto
              </button>
              <a
                href="/admin/usuarios"
                className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl lg:rounded-2xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 font-bold text-sm lg:text-lg"
              >
                👥 Gestionar Usuarios
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success message */}
        {successMessage && (
          <div className="mb-6 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <h3 className="text-lg font-bold text-green-800">¡Éxito!</h3>
                <p className="text-green-700 mt-1 font-medium">
                  {successMessage}
                </p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-auto text-green-500 hover:text-green-700 text-2xl font-bold hover:scale-110 transition-transform"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🚨</div>
              <div>
                <h3 className="text-lg font-bold text-red-800">Error</h3>
                <p className="text-red-700 mt-1 font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700 text-2xl font-bold hover:scale-110 transition-transform"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Formulario de nuevo/editar reto */}
        {showForm && (
          <div className="mb-8 bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-3xl shadow-2xl border-4 border-green-200 p-6">
            <h2 className="text-2xl font-black text-green-800 mb-6">
              {editingReto ? "✏️ Editar Reto" : "➕ Crear Nuevo Reto"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="md:col-span-2">
                <label
                  htmlFor="titulo"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  📝 Título del Reto
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Ej: Lectura Diaria de la Biblia"
                  disabled={submitting}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="descripcion"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  📖 Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors resize-none"
                  placeholder="Describe el reto en detalle..."
                  disabled={submitting}
                />
              </div>

              {/* Campo Video URL */}
              <div className="md:col-span-2">
                <label
                  htmlFor="video_url"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  🎥 Video de YouTube (opcional)
                </label>
                <input
                  type="url"
                  id="video_url"
                  name="video_url"
                  value={formData.video_url || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Pega el enlace de YouTube o YouTube Shorts para mostrar un video en el reto
                </p>
              </div>

              {/* Campo Iframe Content */}
              <div className="md:col-span-2">
                <label
                  htmlFor="iframe_content"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  🧩 Iframe Embebido (opcional)
                </label>
                <textarea
                  id="iframe_content"
                  name="iframe_content"
                  value={formData.iframe_content || ""}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
                  placeholder='<iframe src="..."></iframe>'
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Pega aquí el código iframe de otras aplicaciones para embeberlas
                </p>
              </div>

              <div>
                <label
                  htmlFor="fecha_inicio"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  📅 Fecha de Inicio
                </label>
                <input
                  type="date"
                  id="fecha_inicio"
                  value={formData.fecha_inicio.toISOString().split("T")[0]}
                  onChange={(e) =>
                    handleDateChange("fecha_inicio", e.target.value)
                  }
                  required
                  className="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors"
                  disabled={submitting}
                />
              </div>

              <div>
                <label
                  htmlFor="fecha_fin"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  📅 Fecha de Fin
                </label>
                <input
                  type="date"
                  id="fecha_fin"
                  value={formData.fecha_fin.toISOString().split("T")[0]}
                  onChange={(e) =>
                    handleDateChange("fecha_fin", e.target.value)
                  }
                  required
                  className="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors"
                  disabled={submitting}
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="text-sm font-bold text-gray-700">
                    ✅ Reto Activo
                  </span>
                </label>
              </div>

              <div className="md:col-span-2">
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting
                      ? editingReto
                        ? "Actualizando..."
                        : "Creando..."
                      : editingReto
                        ? "✅ Actualizar Reto"
                        : "✅ Crear Reto"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Lista de retos */}
        <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl border-4 border-purple-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-purple-800">
              🎯 Retos Registrados
            </h2>
            <div className="text-sm text-purple-600 font-medium">
              Total: {retos.length} reto{retos.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {retos.map((reto) => (
              <div
                key={reto.id}
                className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-4 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <span className="font-bold text-gray-800">
                      {reto.titulo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${reto.activo
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                        }`}
                    >
                      {reto.activo ? "Activo" : "Inactivo"}
                    </span>
                    <button
                      onClick={() => handleEditReto(reto)}
                      className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Editar reto"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteReto(reto.id, reto.titulo)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Eliminar reto"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="line-clamp-2">{reto.descripcion}</p>
                  <p>
                    <strong>📅 Inicio:</strong>{" "}
                    {new Date(reto.fecha_inicio).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>📅 Fin:</strong>{" "}
                    {new Date(reto.fecha_fin).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>📆 Creado:</strong>{" "}
                    {new Date(reto.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {retos.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-xl font-bold text-gray-600 mb-2">
                No hay retos registrados
              </p>
              <p className="text-gray-500">
                Crea el primer reto usando el botón &quot;Nuevo Reto&quot;
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
