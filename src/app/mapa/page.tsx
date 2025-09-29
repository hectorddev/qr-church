'use client';

import React, { useState, useEffect } from 'react';
import { PuntoMapa, ApiResponse } from '@/lib/types';
import MapaInteractivo from '@/components/mapa/MapaInteractivo';

export default function MapaPage() {
  const [puntos, setPuntos] = useState<PuntoMapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<PuntoMapa | null>(null);

  // Cargar puntos al montar el componente
  useEffect(() => {
    loadPuntos();
  }, []);

  const loadPuntos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/puntos');
      const data: ApiResponse<PuntoMapa[]> = await response.json();
      
      if (data.success && data.data) {
        setPuntos(data.data);
      } else {
        throw new Error(data.error || 'Error al cargar puntos');
      }
    } catch (err) {
      console.error('Error loading puntos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
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
          <p className="text-2xl font-bold text-purple-700 mb-2">🚀 Cargando principios...</p>
          <p className="text-lg text-purple-600">Preparando tu experiencia espiritual</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header de la página */}
      <div className="bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 border-b-2 border-purple-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-purple-800 mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ✨ Principios del Camino ✨
            </h1>
            <p className="text-lg sm:text-xl text-purple-600 font-medium mb-4">
              🚀 Explora los principios bíblicos que transformarán tu vida
            </p>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-purple-200">
              <span className="text-2xl">📍</span>
              <span className="text-purple-700 font-bold">
                {puntos.length} principio{puntos.length !== 1 ? 's' : ''} disponible{puntos.length !== 1 ? 's' : ''}
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
                <h3 className="text-lg font-bold text-red-800">¡Ups! Algo salió mal</h3>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Mapa */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl lg:rounded-3xl shadow-2xl border-2 lg:border-4 border-purple-200 h-[60vh] sm:h-[70vh] lg:h-[80vh] min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] max-h-[900px] overflow-hidden">
              <MapaInteractivo
                puntos={puntos}
                modoEdicion={false}
                onPuntoClick={handlePointClick}
              />
            </div>
          </div>

          {/* Panel lateral de información */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl lg:rounded-3xl shadow-2xl border-2 lg:border-4 border-purple-200 p-4 lg:p-6 backdrop-blur-sm sticky top-6">
              {selectedPoint ? (
                <div>
                  <h3 className="text-2xl font-black text-purple-800 mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ✨ Principio ✨
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Nombre y tipo */}
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 border-2 border-purple-200">
                      <h4 className="font-black text-gray-900 text-2xl mb-3">
                        {selectedPoint.nombre}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {selectedPoint.emoji || '📍'}
                        </span>
                        <span className="text-lg font-bold text-gray-700">
                          {selectedPoint.pointerName}
                        </span>
                      </div>
                    </div>

                    {/* Descripción */}
                    {selectedPoint.descripcion && (
                      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-4 border-2 border-blue-200">
                        <h5 className="font-black text-blue-800 mb-3 text-lg">📖 Descripción</h5>
                        <p className="text-gray-800 leading-relaxed font-medium">
                          {selectedPoint.descripcion}
                        </p>
                      </div>
                    )}

                    {/* Versículos relevantes */}
                    {selectedPoint.referencias && (
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-4 border-2 border-green-200">
                        <h5 className="font-black text-green-800 mb-3 text-lg">📜 Versículos Relevantes</h5>
                        <p className="text-gray-800 font-medium">
                          {selectedPoint.referencias}
                        </p>
                      </div>
                    )}

                    {/* Aplicación práctica */}
                    {selectedPoint.año && (
                      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl p-4 border-2 border-orange-200">
                        <h5 className="font-black text-orange-800 mb-3 text-lg">🎯 Aplicación Práctica</h5>
                        <p className="text-gray-800 font-medium">
                          {selectedPoint.año}
                        </p>
                      </div>
                    )}

                    {/* Coordenadas */}
                    <div className="bg-gradient-to-r from-gray-100 to-slate-100 rounded-2xl p-4 border-2 border-gray-200">
                      <h5 className="font-black text-gray-800 mb-2 text-lg">📍 Ubicación</h5>
                      <p className="text-gray-600 font-medium">
                        {selectedPoint.x.toFixed(1)}%, {selectedPoint.y.toFixed(1)}%
                      </p>
                    </div>

                    {/* Botón para cerrar */}
                    <button
                      onClick={() => setSelectedPoint(null)}
                      className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-black text-lg"
                    >
                      ❌ Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-black text-purple-800 mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    🚀 Principios del Camino 🚀
                  </h3>
                  
                  {puntos.length === 0 ? (
                    <div className="text-center text-gray-600 py-12">
                      <div className="text-6xl mb-4">🌟</div>
                      <p className="text-xl font-bold mb-2">¡No hay principios aún!</p>
                      <p className="text-lg">Los principios bíblicos aparecerán aquí</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-center mb-6">
                        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 border-2 border-blue-200 mb-4">
                          <div className="text-4xl mb-2">🎯</div>
                          <p className="text-lg text-gray-700 font-medium">
                            Haz clic en un punto del mapa para explorar el principio bíblico
                          </p>
                        </div>
                      </div>
                      
                      {/* Lista de principios disponibles */}
                      <div className="space-y-3">
                        <h5 className="font-black text-gray-800 text-xl mb-4 text-center">📋 Principios disponibles</h5>
                        {puntos.map((punto) => (
                          <div 
                            key={punto.id} 
                            className="flex items-center justify-between bg-gradient-to-r from-white to-gray-50 rounded-2xl p-3 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
                            onClick={() => handlePointClick(punto)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {punto.emoji || '📍'}
                              </span>
                              <span className="font-bold text-gray-800">{punto.nombre}</span>
                            </div>
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold text-sm">
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

      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-indigo-600/5 border-t border-purple-200/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-lg font-bold text-purple-700 mb-1">✨ Pámpanos ✨</p>
            <p className="text-purple-600 font-medium">Principios del Camino</p>
            <p className="text-sm text-purple-500 mt-2">&copy; 2025 - Transformando vidas a través de la Palabra</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
