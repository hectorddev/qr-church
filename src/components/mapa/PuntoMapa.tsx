'use client';

import React, { useState } from 'react';
import { PuntoMapa as PuntoMapaType } from '@/lib/types';

interface PuntoMapaProps {
  punto: PuntoMapaType;
  modoEdicion?: boolean;
  isSelected?: boolean;
  onClick?: (punto: PuntoMapaType) => void;
  onEdit?: (punto: PuntoMapaType) => void;
  onDelete?: (id: string) => void;
}

export default function PuntoMapa({
  punto,
  modoEdicion = false,
  isSelected = false,
  onClick,
  onEdit,
  onDelete
}: PuntoMapaProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Usar el emoji del punto directamente
  const displayIcon = punto.emoji || '📍';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(punto);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(punto);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Estás seguro de que quieres eliminar "${punto.nombre}"?`)) {
      onDelete?.(punto.id);
    }
  };

  return (
    <div className="relative">
      {/* Punto del mapa */}
      <div
        className={`
          relative w-8 h-8 rounded-full border-4 border-white shadow-2xl cursor-pointer
          transition-all duration-300 hover:scale-150 hover:rotate-12
          ${isSelected ? 'ring-4 ring-purple-400 ring-opacity-50 animate-pulse' : ''}
        `}
        style={{
          backgroundColor: '#8b5cf6', // Color púrpura por defecto
          boxShadow: '0 0 20px #8b5cf640, 0 0 40px #8b5cf620'
        }}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onMouseOver={() => setShowActions(true)}
        onMouseOut={() => setShowActions(false)}
      >
        {/* Icono del tipo */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-black">
          {displayIcon}
        </div>

        {/* Indicador de edición */}
        {modoEdicion && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-white animate-bounce shadow-lg" />
        )}
      </div>

      {/* Tooltip con información */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-20">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-2xl px-4 py-3 shadow-2xl whitespace-nowrap border-2 border-white">
            <div className="font-black text-lg">{punto.nombre}</div>
            <div className="text-purple-100 font-bold">{displayIcon} {punto.pointerName}</div>
            {punto.año && (
              <div className="text-purple-200 text-xs">{punto.año}</div>
            )}
          </div>
          {/* Flecha del tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-purple-600" />
        </div>
      )}

      {/* Acciones de edición */}
      {modoEdicion && showActions && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-12 z-30">
          <div className="bg-gradient-to-r from-white to-purple-50 rounded-2xl shadow-2xl border-4 border-purple-200 p-3 flex gap-2">
            <button
              onClick={handleEdit}
              className="p-2 text-blue-500 hover:bg-blue-100 rounded-xl transition-all duration-300 transform hover:scale-110 font-bold text-lg"
              title="Editar principio"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-300 transform hover:scale-110 font-bold text-lg"
              title="Eliminar principio"
            >
              🗑️
            </button>
          </div>
        </div>
      )}

      {/* Etiqueta del punto - solo visible en hover */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10">
          <div className="bg-gradient-to-r from-white to-purple-50 text-gray-800 text-sm px-3 py-2 rounded-2xl shadow-lg border-2 border-purple-200 whitespace-nowrap font-bold">
            {punto.nombre}
          </div>
        </div>
      )}
    </div>
  );
}
