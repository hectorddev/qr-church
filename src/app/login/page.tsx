"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LoginData } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginData>({
    nombre: "",
    versiculo_id: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/mapa");
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(formData);

      if (result.success) {
        router.push("/mapa");
      } else {
        setError(result.error || "Credenciales incorrectas");
      }
    } catch (error) {
      setError("Error inesperado. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-purple-800 mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ✨ Pámpanos ✨
          </h1>
          <p className="text-lg text-purple-600 font-medium">
            🚀 Accede a los Principios del Camino
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl border-4 border-purple-200 p-8">
          <h2 className="text-2xl font-black text-purple-800 mb-6 text-center">
            🔐 Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Nombre */}
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
                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors text-lg font-medium"
                placeholder="Ingresa tu nombre"
                disabled={isLoading}
              />
            </div>

            {/* Campo Versículo ID */}
            <div>
              <label
                htmlFor="versiculo_id"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                📜 Versículo ID
              </label>
              <input
                type="password"
                id="versiculo_id"
                name="versiculo_id"
                value={formData.versiculo_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors text-lg font-medium"
                placeholder="Ingresa tu versículo ID"
                disabled={isLoading}
              />
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 rounded-2xl p-4">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🚨</div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Botón de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Iniciando sesión...
                </div>
              ) : (
                "🚀 Iniciar Sesión"
              )}
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              💡 Contacta al administrador si no tienes credenciales
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-purple-600">&copy; 2025 - Pampanos</p>
        </div>
      </div>
    </div>
  );
}
