"use client";

import MapaInteractivo from "@/components/mapa/MapaInteractivo";
import capitalizeName from "@/components/ui/capitalizeName";
import { useAuth } from "@/contexts/AuthContext";
import { ApiResponse, PuntoMapa, Reto, Usuario } from "@/lib/types";
import { useEffect, useState } from "react";

export default function MapaPage() {
  const { usuario } = useAuth();
  const [puntos, setPuntos] = useState<PuntoMapa[]>([]);
  const [retos, setRetos] = useState<Reto[]>([]);
  const [ranking, setRanking] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<PuntoMapa | null>(null);
  const [selectedReto, setSelectedReto] = useState<Reto | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadPuntos();
    loadRetos();
    loadRanking();
  }, []);

  const loadPuntos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/puntos");
      const data: ApiResponse<PuntoMapa[]> = await response.json();

      if (data.success && data.data) {
        setPuntos(data.data);
      } else {
        throw new Error(data.error || "Error al cargar puntos");
      }
    } catch (err) {
      console.error("Error loading puntos:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const loadRetos = async () => {
    try {
      const response = await fetch("/api/retos?activos=true");
      const data: ApiResponse<Reto[]> = await response.json();

      if (data.success && data.data) {
        setRetos(data.data);
      }
    } catch (err) {
      console.error("Error loading retos:", err);
    }
  };

  const loadRanking = async () => {
    try {
      const response = await fetch("/api/auth/usuarios");
      const data: ApiResponse<Usuario[]> = await response.json();

      if (data.success && data.data) {
        // Ordenar por puntuación descendente y tomar top 3
        const top3 = data.data
          .sort((a, b) => b.puntuacion - a.puntuacion)
          .slice(0, 3);
        setRanking(top3);
      } else {
        setRanking([]);
      }
    } catch (err) {
      console.error("Error loading ranking:", err);
    }
  };

  // Componente para embeber videos de YouTube
  const YouTubeEmbed = ({ url }: { url: string }) => {
    const extractVideoId = (url: string): string | null => {
      // youtube.com/watch?v=VIDEO_ID
      const watchMatch = url.match(/[?&]v=([^&]+)/);
      if (watchMatch) return watchMatch[1];

      // youtu.be/VIDEO_ID
      const shortMatch = url.match(/youtu\.be\/([^?]+)/);
      if (shortMatch) return shortMatch[1];

      // youtube.com/embed/VIDEO_ID
      const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
      if (embedMatch) return embedMatch[1];

      return null;
    };

    const videoId = extractVideoId(url);

    if (!videoId) return null;

    return (
      <div className="relative w-full mb-4" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-xl border-2 border-green-200"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  };

  const handlePointClick = (punto: PuntoMapa) => {
    setSelectedPoint(punto);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 mx-auto mb-6"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-pink-500 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-2xl font-bold text-purple-700 mb-2">
            🚀 Cargando principios...
          </p>
          <p className="text-lg text-purple-600">
            Preparando tu experiencia espiritual
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header de la página */}
      <div className="bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 border-b-2 border-purple-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-purple-800 mb-2 sm:mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ✨ Principios del Camino ✨
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-purple-600 font-medium mb-3 sm:mb-4 px-2">
              🚀 Explora los principios bíblicos que transformarán tu vida
            </p>

            {/* Información del usuario */}
            {usuario && (
              <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-yellow-100 to-orange-100 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-3 shadow-lg border-2 border-yellow-300">
                  <span className="text-xl sm:text-2xl">👤</span>
                  <span className="text-gray-800 font-bold text-sm sm:text-base md:text-lg">
                    ¡Hola, {capitalizeName(usuario.nombre)}!
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-md">
                  <span className="text-sm sm:text-base md:text-lg">🏆</span>
                  <span className="font-bold text-sm sm:text-base">
                    {usuario.puntuacion} puntos
                  </span>
                </div>
              </div>
            )}

            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 shadow-lg border border-purple-200">
              <span className="text-lg sm:text-2xl">📍</span>
              <span className="text-purple-700 font-bold text-sm sm:text-base">
                {puntos.length} principio{puntos.length !== 1 ? "s" : ""}{" "}
                disponible{puntos.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🚨</div>
              <div>
                <h3 className="text-lg font-bold text-red-800">
                  ¡Ups! Algo salió mal
                </h3>
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

        {/* Grid principal */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 xl:gap-6">
          {/* Mapa */}
          <div className="xl:col-span-3 order-2 xl:order-1">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl xl:rounded-3xl shadow-xl xl:shadow-2xl border-2 xl:border-4 border-purple-200 h-[50vh] sm:h-[60vh] md:h-[70vh] xl:h-[75vh] min-h-[350px] sm:min-h-[400px] md:min-h-[500px] xl:min-h-[600px] max-h-[800px] xl:max-h-[900px] overflow-visible">
              <MapaInteractivo
                puntos={puntos}
                modoEdicion={false}
                onPuntoClick={handlePointClick}
              />
            </div>
          </div>

          {/* Panel lateral de información */}
          <div className="xl:col-span-2 order-1 xl:order-2">
            <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-xl sm:rounded-2xl xl:rounded-3xl shadow-xl xl:shadow-2xl border-2 xl:border-4 border-purple-200 p-3 sm:p-4 xl:p-6 backdrop-blur-sm xl:sticky xl:top-6">
              {selectedPoint ? (
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-purple-800 mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ✨ Principio ✨
                  </h3>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Nombre y tipo */}
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-purple-200">
                      <h4 className="font-black text-gray-900 text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3">
                        {selectedPoint.nombre}
                      </h4>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl">
                          {selectedPoint.emoji || "📍"}
                        </span>
                        <span className="text-sm sm:text-base md:text-lg font-bold text-gray-700">
                          {selectedPoint.pointerName}
                        </span>
                      </div>
                    </div>

                    {/* Descripción */}
                    {selectedPoint.descripcion && (
                      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-blue-200">
                        <h5 className="font-black text-blue-800 mb-2 sm:mb-3 text-sm sm:text-base md:text-lg">
                          📖 Descripción
                        </h5>
                        <p className="text-gray-800 leading-relaxed font-medium text-sm sm:text-base">
                          {selectedPoint.descripcion}
                        </p>
                      </div>
                    )}

                    {/* Versículos relevantes */}
                    {selectedPoint.referencias && (
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-green-200">
                        <h5 className="font-black text-green-800 mb-2 sm:mb-3 text-sm sm:text-base md:text-lg">
                          📜 Versículos Relevantes
                        </h5>
                        <p className="text-gray-800 font-medium text-sm sm:text-base">
                          {selectedPoint.referencias}
                        </p>
                      </div>
                    )}

                    {/* Aplicación práctica */}
                    {selectedPoint.año && (
                      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-orange-200">
                        <h5 className="font-black text-orange-800 mb-2 sm:mb-3 text-sm sm:text-base md:text-lg">
                          🎯 Aplicación Práctica
                        </h5>
                        <p className="text-gray-800 font-medium text-sm sm:text-base">
                          {selectedPoint.año}
                        </p>
                      </div>
                    )}

                    {/* Coordenadas */}
                    <div className="bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-gray-200">
                      <h5 className="font-black text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">
                        📍 Ubicación
                      </h5>
                      <p className="text-gray-600 font-medium text-sm sm:text-base">
                        {selectedPoint.x.toFixed(1)}%,{" "}
                        {selectedPoint.y.toFixed(1)}%
                      </p>
                    </div>

                    {/* Botón para cerrar */}
                    <button
                      onClick={() => setSelectedPoint(null)}
                      className="w-full mt-4 sm:mt-6 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl sm:rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-black text-sm sm:text-base md:text-lg"
                    >
                      ❌ Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-purple-800 mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    🚀 Principios del Camino 🚀
                  </h3>

                  {puntos.length === 0 ? (
                    <div className="text-center text-gray-600 py-8 sm:py-12">
                      <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">
                        🌟
                      </div>
                      <p className="text-lg sm:text-xl font-bold mb-2">
                        ¡No hay principios aún!
                      </p>
                      <p className="text-sm sm:text-base md:text-lg">
                        Los principios bíblicos aparecerán aquí
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-blue-200 mb-3 sm:mb-4">
                          <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">
                            🎯
                          </div>
                          <p className="text-sm sm:text-base md:text-lg text-gray-700 font-medium">
                            Haz clic en un punto del mapa para explorar el
                            principio bíblico
                          </p>
                        </div>
                      </div>

                      {/* Lista de principios disponibles */}
                      <div className="space-y-2 sm:space-y-3">
                        <h5 className="font-black text-gray-800 text-lg sm:text-xl mb-3 sm:mb-4 text-center">
                          📋 Principios disponibles
                        </h5>
                        {puntos.map((punto) => (
                          <div
                            key={punto.id}
                            className="flex items-center justify-between bg-gradient-to-r from-white to-gray-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
                            onClick={() => handlePointClick(punto)}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <span className="text-lg sm:text-xl md:text-2xl flex-shrink-0">
                                {punto.emoji || "📍"}
                              </span>
                              <span className="font-bold text-gray-800 text-sm sm:text-base truncate">
                                {punto.nombre}
                              </span>
                            </div>
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm flex-shrink-0 ml-2">
                              {punto.pointerName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección de retos semanales */}
        {retos.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border-2 sm:border-4 border-green-200 p-4 sm:p-6 md:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-green-800 mb-3 sm:mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  🎯 Retos Semanales
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-green-700 font-medium">
                  ¡Participa en nuestros retos espirituales y gana puntos!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {retos.map((reto) => (
                  <div
                    key={reto.id}
                    onClick={() => setSelectedReto(reto)}
                    className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <h3 className="text-xl font-black text-green-800 mb-4">
                      🎯 {reto.titulo}
                    </h3>
                    <p className="text-gray-700 mb-4 text-sm leading-relaxed line-clamp-3">
                      {reto.descripcion}
                    </p>

                    {/* Video de YouTube si existe */}
                    {reto.video_url && (
                      <YouTubeEmbed url={reto.video_url} />
                    )}

                    <div className="flex flex-col gap-2 mb-4">
                      <p className="text-xs text-gray-600">
                        <strong className="font-bold text-green-700">📅 Inicio:</strong>{" "}
                        {new Date(reto.fecha_inicio).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong className="font-bold text-green-700">📅 Fin:</strong>{" "}
                        {new Date(reto.fecha_fin).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${reto.activo
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-100 text-gray-600 border border-gray-300"
                          }`}
                      >
                        {reto.activo ? "✅ Activo" : "❌ Finalizado"}
                      </span>
                      <span className="text-xs text-green-600 font-bold">
                        👆 Click para ver más
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sección de Minijuegos */}
        <div className="mt-8 sm:mt-12">
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border-2 sm:border-4 border-blue-200 p-4 sm:p-6 md:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-800 mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                🎮 Minijuegos
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-blue-700 font-medium">
                ¡Diviértete y gana puntos extra para tu perfil!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              <div
                onClick={() => window.location.href = '/juego'}
                className="bg-gradient-to-r from-white to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-3xl group-hover:scale-125 transition-transform duration-300">🕊️</span>
                  <h3 className="font-black text-blue-800 text-lg sm:text-xl">
                    Vuelo Espiritual
                  </h3>
                </div>

                <p className="text-gray-700 font-medium mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                  Ayuda a la paloma a volar entre los obstáculos. ¡Cada obstáculo superado es un punto!
                </p>

                <div className="mt-3 sm:mt-4 flex items-center justify-between">
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    Jugar Ahora
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking Top 3 */}
        {ranking.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border-2 sm:border-4 border-yellow-200 p-4 sm:p-6 md:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-yellow-800 mb-3 sm:mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  🏆 Ranking de Campeones
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-yellow-700 font-medium">
                  ¡Los mejores participantes de nuestra comunidad!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                {ranking.map((usuario, index) => (
                  <div
                    key={usuario.id}
                    className={`text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border-2 transform transition-all duration-300 hover:scale-105 w-full sm:w-auto max-w-xs ${index === 0
                      ? "bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300"
                      : index === 1
                        ? "bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300"
                        : "bg-gradient-to-r from-orange-100 to-red-100 border-orange-300"
                      }`}
                  >
                    <div
                      className={`text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3 ${index === 0
                        ? "text-yellow-500"
                        : index === 1
                          ? "text-gray-500"
                          : "text-orange-500"
                        }`}
                    >
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                    </div>
                    <h3 className="font-black text-gray-800 text-lg sm:text-xl mb-1 sm:mb-2">
                      {usuario.nombre}
                    </h3>
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <span className="text-lg sm:text-xl md:text-2xl">🏆</span>
                      <span className="font-bold text-sm sm:text-base md:text-lg text-gray-700">
                        {usuario.puntuacion} puntos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-indigo-600/5 border-t border-purple-200/30 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <p className="text-base sm:text-lg font-bold text-purple-700 mb-1">
              ✨ Pámpanos ✨
            </p>
            <p className="text-sm sm:text-base text-purple-600 font-medium">
              Principios del Camino
            </p>
            <p className="text-xs sm:text-sm text-purple-500 mt-1 sm:mt-2">
              &copy; 2026 - Pampanos
            </p>
          </div>
        </div>
      </footer>

      {/* Modal de Detalles del Reto */}
      {selectedReto && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedReto(null)}
        >
          <div
            className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-green-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-3xl border-b-4 border-green-400 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-black mb-2">
                    🎯 {selectedReto.titulo}
                  </h2>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${selectedReto.activo
                      ? "bg-white text-green-700"
                      : "bg-gray-200 text-gray-700"
                      }`}
                  >
                    {selectedReto.activo ? "✅ Activo" : "❌ Finalizado"}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedReto(null)}
                  className="ml-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
                  aria-label="Cerrar"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Video de YouTube si existe */}
              {selectedReto.video_url && (
                <div>
                  <h3 className="text-lg font-bold text-green-800 mb-3">
                    🎥 Video del Reto
                  </h3>
                  <YouTubeEmbed url={selectedReto.video_url} />
                </div>
              )}

              {/* Iframe si existe */}
              {selectedReto.iframe_content && (
                <div>
                  <h3 className="text-lg font-bold text-green-800 mb-3">
                    🧩 Contenido Interactivo
                  </h3>
                  <div
                    className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden border-2 border-green-200"
                    dangerouslySetInnerHTML={{
                      __html: selectedReto.iframe_content,
                    }}
                  />
                </div>
              )}

              {/* Descripción */}
              <div>
                <h3 className="text-lg font-bold text-green-800 mb-3">
                  📝 Descripción
                </h3>
                <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-xl border-2 border-green-200">
                  {selectedReto.descripcion}
                </p>
              </div>

              {/* Fechas */}
              <div>
                <h3 className="text-lg font-bold text-green-800 mb-3">
                  📅 Fechas del Reto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border-2 border-green-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      Fecha de Inicio
                    </p>
                    <p className="text-base sm:text-lg font-bold text-green-700">
                      {new Date(selectedReto.fecha_inicio).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border-2 border-green-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      Fecha de Fin
                    </p>
                    <p className="text-base sm:text-lg font-bold text-red-600">
                      {new Date(selectedReto.fecha_fin).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl text-center">
                <p className="text-xl sm:text-2xl font-black mb-2">
                  🎯 ¡Acepta el Reto!
                </p>
                <p className="text-sm opacity-90">
                  Participa en este reto espiritual y gana puntos en tu perfil
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-green-50 p-4 border-t-2 border-green-200 rounded-b-3xl z-10">
              <button
                onClick={() => setSelectedReto(null)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
