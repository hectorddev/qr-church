'use client';

import React, { useState, useRef, useCallback } from 'react';
import { PuntoMapa, MapaCoordenadas } from '@/lib/types';
import PuntoMapaComponent from './PuntoMapa';

interface MapaInteractivoProps {
  puntos: PuntoMapa[];
  modoEdicion?: boolean;
  onPuntoClick?: (punto: PuntoMapa) => void;
  onPuntoAdd?: (coordenadas: MapaCoordenadas) => void;
  onPuntoUpdate?: (punto: PuntoMapa) => void;
  onPuntoDelete?: (id: string) => void;
}

export default function MapaInteractivo({
  puntos,
  modoEdicion = false,
  onPuntoClick,
  onPuntoAdd,
  onPuntoUpdate,
  onPuntoDelete
}: MapaInteractivoProps) {
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Manejar clic en el mapa
  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingPoint || !modoEdicion) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const coordenadas: MapaCoordenadas = { x, y };
    onPuntoAdd?.(coordenadas);
    setIsAddingPoint(false);
  }, [isAddingPoint, modoEdicion, onPuntoAdd]);

  // Activar modo de agregar punto
  const handleAddPoint = useCallback(() => {
    if (!modoEdicion) return;
    setIsAddingPoint(true);
  }, [modoEdicion]);

  // Cancelar modo de agregar punto
  const handleCancelAdd = useCallback(() => {
    setIsAddingPoint(false);
  }, []);

  // Manejar clic en un punto
  const handlePointClick = useCallback((punto: PuntoMapa) => {
    setSelectedPoint(punto.id);
    onPuntoClick?.(punto);
  }, [onPuntoClick]);

  return (
    <div className="relative w-full h-full">
      {/* Controles de edición - Movidos fuera del mapa */}
      {modoEdicion && (
        <div className="absolute top-2 left-2 right-2 z-10 bg-gradient-to-r from-white to-purple-50 rounded-xl shadow-xl p-3 border-2 border-purple-200 sm:top-4 sm:left-4 sm:right-auto sm:rounded-2xl sm:p-4 sm:border-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {!isAddingPoint ? (
              <button
                onClick={handleAddPoint}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl sm:rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 font-bold text-sm sm:text-lg"
              >
                <span>📍</span>
                <span className="hidden sm:inline">Agregar Principio</span>
                <span className="sm:hidden">Agregar</span>
              </button>
            ) : (
              <button
                onClick={handleCancelAdd}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl sm:rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 font-bold text-sm sm:text-lg"
              >
                <span>❌</span>
                <span className="hidden sm:inline">Cancelar</span>
                <span className="sm:hidden">Cancelar</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mensaje de instrucción - Posicionado en la parte inferior */}
      {modoEdicion && isAddingPoint && (
        <div className="absolute bottom-2 left-2 right-2 z-10 sm:bottom-4 sm:left-4 sm:right-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-3 shadow-xl border-2 border-blue-300 sm:rounded-2xl sm:p-4">
            <div className="flex items-center justify-center gap-2 text-center">
              <span className="text-lg sm:text-xl">🎯</span>
              <p className="font-bold text-sm sm:text-lg">
                <span className="hidden sm:inline">Haz clic en el mapa para agregar un principio</span>
                <span className="sm:hidden">Toca el mapa para agregar</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor del mapa */}
      <div
        ref={mapRef}
        className={`relative w-full h-full bg-white rounded-lg shadow-lg overflow-hidden ${
          isAddingPoint ? 'cursor-crosshair' : 'cursor-default'
        }`}
        onClick={handleMapClick}
      >
        {/* Imagen del mapa */}
        <img
          src="/image.png"
          alt="Mapa de Principios del Camino"
          className="w-full h-full object-contain"
          draggable={false}
        />

        {/* Capa de puntos */}
        <div className="absolute inset-0 pointer-events-none">
          {puntos.map((punto) => (
            <div
              key={punto.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${punto.x}%`,
                top: `${punto.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <PuntoMapaComponent
                punto={punto}
                modoEdicion={modoEdicion}
                isSelected={selectedPoint === punto.id}
                onClick={handlePointClick}
                onEdit={onPuntoUpdate}
                onDelete={onPuntoDelete}
              />
            </div>
          ))}
        </div>

        {/* Overlay cuando está agregando puntos */}
        {isAddingPoint && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 pointer-events-none" />
        )}
      </div>
    </div>
  );
}
