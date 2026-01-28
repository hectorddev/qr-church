"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ApiResponse, CrearUsuarioData, Usuario } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminUsuariosPage() {
  const {
    isAdmin,
    isAuthenticated,
    isLoading,
    usuario: currentUser,
    updateUser,
    token, // Obtenemos el token desde el contexto
  } = useAuth();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CrearUsuarioData>({
    nombre: "",
    versiculo_id: "",
    rol: "usuario",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingPuntuacion, setEditingPuntuacion] = useState<{
    [key: string]: number;
  }>({});
  const [updatingPuntuacion, setUpdatingPuntuacion] = useState<string | null>(
    null
  );

  // Redirigir si no es admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/login");
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Cargar usuarios
  useEffect(() => {
    if (isAdmin) {
      loadUsuarios();
    }
  }, [isAdmin]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/usuarios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: ApiResponse<Usuario[]> = await response.json();

      if (data.success && data.data) {
        setUsuarios(data.data);
      } else {
        throw new Error(data.error || "Error al cargar usuarios");
      }
    } catch (err) {
      console.error("Error loading usuarios:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validaciones del lado del cliente
    if (!formData.nombre.trim()) {
      setError("El nombre es requerido");
      setSubmitting(false);
      return;
    }

    if (!formData.versiculo_id.trim()) {
      setError("El versículo ID es requerido");
      setSubmitting(false);
      return;
    }

    if (formData.nombre.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      setSubmitting(false);
      return;
    }

    if (formData.versiculo_id.length < 3) {
      setError("El versículo ID debe tener al menos 3 caracteres");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<Usuario> = await response.json();

      if (data.success && data.data) {
        setUsuarios((prev) => [...prev, data.data!]);
        setFormData({ nombre: "", versiculo_id: "", rol: "usuario" });
        setShowForm(false);
        setSuccessMessage("¡Usuario creado exitosamente!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.error || "Error al crear usuario");
      }
    } catch (err) {
      console.error("Error creating usuario:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, nombre: string) => {
    if (
      !confirm(`¿Estás seguro de que quieres eliminar al usuario "${nombre}"?`)
    ) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(`/api/auth/usuarios?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setUsuarios((prev) => prev.filter((u) => u.id !== id));
        setSuccessMessage("¡Usuario eliminado exitosamente!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.error || "Error al eliminar usuario");
      }
    } catch (err) {
      console.error("Error deleting usuario:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handlePuntuacionChange = (userId: string, value: string) => {
    const puntuacion = parseInt(value) || 0;
    setEditingPuntuacion((prev) => ({
      ...prev,
      [userId]: puntuacion,
    }));
  };

  const handleUpdatePuntuacion = async (userId: string, nombre: string) => {
    const nuevaPuntuacion = editingPuntuacion[userId];
    if (nuevaPuntuacion === undefined) return;

    setUpdatingPuntuacion(userId);
    setError(null);

    try {
      const response = await fetch(`/api/usuarios/${userId}/puntuacion`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ puntuacion: nuevaPuntuacion }),
      });

      const data: ApiResponse<Usuario> = await response.json();

      if (data.success && data.data) {
        setUsuarios((prev) =>
          prev.map((u) => (u.id === userId ? data.data! : u))
        );
        setEditingPuntuacion((prev) => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });

        // Si el usuario actualizado es el usuario logueado, actualizar el contexto
        if (currentUser && currentUser.id === userId) {
          updateUser(data.data);
        }

        setSuccessMessage(`¡Puntuación de ${nombre} actualizada exitosamente!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(data.error || "Error al actualizar puntuación");
      }
    } catch (err) {
      console.error("Error updating puntuacion:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setUpdatingPuntuacion(null);
    }
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
                👥 Gestión de Usuarios
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-purple-100 font-medium">
                🔧 Administra los usuarios del sistema
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl lg:rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 font-bold text-sm lg:text-lg"
              >
                ➕ Nuevo Usuario
              </button>
              <a
                href="/admin/retos"
                className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl lg:rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 font-bold text-sm lg:text-lg"
              >
                🎯 Gestionar Retos
              </a>
              <a
                href="/admin/mapa"
                className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl lg:rounded-2xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 font-bold text-sm lg:text-lg"
              >
                🗺️ Editar Mapa
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

        {/* Formulario de nuevo usuario */}
        {showForm && (
          <div className="mb-8 bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-3xl shadow-2xl border-4 border-green-200 p-6">
            <h2 className="text-2xl font-black text-green-800 mb-6">
              ➕ Crear Nuevo Usuario
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  👤 Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Ej: maria_garcia, juan_perez"
                  disabled={submitting}
                />
              </div>

              <div>
                <label
                  htmlFor="versiculo_id"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  📜 Versículo ID
                </label>
                <input
                  type="text"
                  id="versiculo_id"
                  name="versiculo_id"
                  value={formData.versiculo_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Ej: juan316, mateo2819, salmo231"
                  disabled={submitting}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="rol"
                  className="block text-sm font-bold text-gray-700 mb-2"
                >
                  👑 Rol
                </label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors"
                  disabled={submitting}
                >
                  <option value="usuario">👤 Usuario</option>
                  <option value="admin">👑 Administrador</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4">
                  <h4 className="font-bold text-blue-800 mb-2">
                    💡 Información importante:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • El <strong>nombre</strong> será usado para el login del
                      usuario
                    </li>
                    <li>
                      • El <strong>versículo ID</strong> será la contraseña del
                      usuario
                    </li>
                    <li>
                      • Los <strong>administradores</strong> pueden editar
                      principios y gestionar usuarios
                    </li>
                    <li>
                      • Los <strong>usuarios</strong> solo pueden ver los
                      principios del camino
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? "Creando..." : "✅ Crear Usuario"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold"
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Lista de usuarios */}
        <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl border-4 border-purple-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-purple-800">
              👥 Usuarios Registrados
            </h2>
            <div className="text-sm text-purple-600 font-medium">
              Total: {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-4 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {usuario.rol === "admin" ? "👑" : "👤"}
                    </span>
                    <span className="font-bold text-gray-800">
                      {usuario.nombre}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${usuario.rol === "admin"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                        }`}
                    >
                      {usuario.rol}
                    </span>
                    {usuario.nombre !== "admin" && (
                      <button
                        onClick={() =>
                          handleDeleteUser(usuario.id, usuario.nombre)
                        }
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Eliminar usuario"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    <strong>📜 Versículo ID:</strong> {usuario.versiculo_id}
                  </p>
                  <div className="flex items-center gap-2">
                    <strong>🏆 Puntuación:</strong>
                    <input
                      type="number"
                      min="0"
                      value={
                        editingPuntuacion[usuario.id] !== undefined
                          ? editingPuntuacion[usuario.id]
                          : usuario.puntuacion
                      }
                      onChange={(e) =>
                        handlePuntuacionChange(usuario.id, e.target.value)
                      }
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      disabled={updatingPuntuacion === usuario.id}
                    />
                    {editingPuntuacion[usuario.id] !== undefined &&
                      editingPuntuacion[usuario.id] !== usuario.puntuacion && (
                        <button
                          onClick={() =>
                            handleUpdatePuntuacion(usuario.id, usuario.nombre)
                          }
                          disabled={updatingPuntuacion === usuario.id}
                          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                        >
                          {updatingPuntuacion === usuario.id ? "..." : "💾"}
                        </button>
                      )}
                  </div>
                  <p>
                    <strong>📅 Creado:</strong>{" "}
                    {new Date(usuario.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {usuarios.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-xl font-bold text-gray-600 mb-2">
                No hay usuarios registrados
              </p>
              <p className="text-gray-500">
                Crea el primer usuario usando el botón &quot;Nuevo Usuario&quot;
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
