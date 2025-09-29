'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PuntoMapa, CrearPuntoData, ActualizarPuntoData, MapaCoordenadas, ApiResponse } from '@/lib/types';
import MapaInteractivo from '@/components/mapa/MapaInteractivo';
import FormularioPunto from '@/components/mapa/FormularioPunto';

export default function AdminMapaPage() {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [puntos, setPuntos] = useState<PuntoMapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PuntoMapa | null>(null);
  const [newPointCoords, setNewPointCoords] = useState<MapaCoordenadas | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir si no es admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Cargar puntos al montar el componente
  useEffect(() => {
    if (isAdmin) {
      loadPuntos();
    }
  }, [isAdmin]);

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

  const handleAddPoint = (coordenadas: MapaCoordenadas) => {
    setNewPointCoords(coordenadas);
    setEditingPoint(null);
    setShowForm(true);
  };

  const handleEditPoint = (punto: PuntoMapa) => {
    setEditingPoint(punto);
    setNewPointCoords(null);
    setShowForm(true);
  };

  const handleSubmitForm = async (data: CrearPuntoData | ActualizarPuntoData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      let response: Response;
      let apiData: ApiResponse<PuntoMapa>;

      if (editingPoint) {
        // Actualizar punto existente
        response = await fetch(`/api/puntos/${editingPoint.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        apiData = await response.json();
      } else {
        // Crear nuevo punto
        response = await fetch('/api/puntos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        apiData = await response.json();
      }

      if (apiData.success) {
        // Recargar la lista de puntos
        await loadPuntos();
        setShowForm(false);
        setEditingPoint(null);
        setNewPointCoords(null);
      } else {
        throw new Error(apiData.error || 'Error al guardar punto');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePoint = async (id: string) => {
    try {
      const response = await fetch(`/api/puntos/${id}`, {
        method: 'DELETE',
      });
      const data: ApiResponse = await response.json();

      if (data.success) {
        await loadPuntos();
      } else {
        throw new Error(data.error || 'Error al eliminar punto');
      }
    } catch (err) {
      console.error('Error deleting point:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleClearAllPoints = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos los puntos?')) {
      return;
    }

    try {
      const response = await fetch('/api/puntos', {
        method: 'DELETE',
      });
      const data: ApiResponse = await response.json();

      if (data.success) {
        await loadPuntos();
      } else {
        throw new Error(data.error || 'Error al eliminar puntos');
      }
    } catch (err) {
      console.error('Error clearing points:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPoint(null);
    setNewPointCoords(null);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa...</p>
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
                ✏️ Editor de Principios
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-purple-100 font-medium">
                🚀 Administra los principios bíblicos del mapa
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 lg:gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-3 py-2 lg:px-4 lg:py-2 text-white font-bold text-sm lg:text-base">
                <span className="text-xl lg:text-2xl">📍</span> {puntos.length} principio{puntos.length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={handleClearAllPoints}
                disabled={puntos.length === 0}
                className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl lg:rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 font-bold text-sm lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                🗑️ <span className="hidden sm:inline">Limpiar Todo</span>
                <span className="sm:hidden">Limpiar</span>
              </button>
              <a
                href="/mapa"
                className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl lg:rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 font-bold text-sm lg:text-lg"
              >
                👁️ <span className="hidden sm:inline">Ver Mapa</span>
                <span className="sm:hidden">Ver</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🚨</div>
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

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Mapa */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl lg:rounded-3xl shadow-2xl border-2 lg:border-4 border-purple-200 h-[50vh] sm:h-[60vh] lg:h-[70vh] min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] max-h-[800px] overflow-hidden">
              <MapaInteractivo
                puntos={puntos}
                modoEdicion={true}
                onPuntoClick={(punto) => console.log('Punto clickeado:', punto)}
                onPuntoAdd={handleAddPoint}
                onPuntoUpdate={handleEditPoint}
                onPuntoDelete={handleDeletePoint}
              />
            </div>
          </div>

          {/* Panel lateral */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl lg:rounded-3xl shadow-2xl border-2 lg:border-4 border-purple-200 p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-black text-purple-800 mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                📋 Lista de Principios
              </h3>
              
              {puntos.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-6xl mb-4">📍</div>
                  <p className="text-lg font-bold text-gray-600 mb-2">No hay principios en el mapa</p>
                  <p className="text-sm text-gray-500">Haz clic en "Agregar Principio" para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] sm:max-h-[60vh] lg:max-h-96 overflow-y-auto pr-2">
                  {puntos.map((punto) => (
                    <div
                      key={punto.id}
                      className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-3 sm:p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                            {punto.nombre}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">
                            {punto.pointerName} • {punto.x.toFixed(1)}%, {punto.y.toFixed(1)}%
                          </p>
                          {punto.año && (
                            <p className="text-xs text-gray-500">{punto.año}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleEditPoint(punto)}
                            className="p-1 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
                            title="Editar punto"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeletePoint(punto.id)}
                            className="p-1 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                            title="Eliminar punto"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal del formulario */}
      {showForm && (
        <FormularioPunto
          punto={editingPoint}
          coordenadas={newPointCoords}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
