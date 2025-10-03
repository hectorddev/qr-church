"use client";

import { PuntoMapa as PuntoMapaType } from "@/lib/types";
import React, { useState } from "react";

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
  onDelete,
}: PuntoMapaProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<
    "top" | "bottom" | "left" | "right"
  >("top");

  // Usar el emoji del punto directamente
  const displayIcon = punto.emoji || "📍";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(punto);
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
    // Determinar la mejor posición del tooltip basada en la coordenada del punto
    const x = punto.x;
    const y = punto.y;

    if (x < 20) {
      // Punto cerca del borde izquierdo
      setTooltipPosition("right");
    } else if (x > 80) {
      // Punto cerca del borde derecho
      setTooltipPosition("left");
    } else if (y < 20) {
      // Punto cerca del borde superior
      setTooltipPosition("bottom");
    } else {
      // Punto en el centro o cerca del borde inferior
      setTooltipPosition("top");
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevenir comportamiento por defecto
    // No mostrar tooltip en móvil para evitar repetición con el panel
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setShowTooltip(false);
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
          ${
            isSelected
              ? "ring-4 ring-purple-400 ring-opacity-50 animate-pulse"
              : ""
          }
        `}
        style={{
          backgroundColor: "#8b5cf6", // Color púrpura por defecto
          boxShadow: "0 0 20px #8b5cf640, 0 0 40px #8b5cf620",
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        onMouseOver={() => setShowActions(true)}
        onMouseOut={() => setShowActions(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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

      {/* Tooltip con información - Posicionamiento dinámico */}
      {showTooltip && (
        <div
          className={`absolute z-20 ${
            tooltipPosition === "top"
              ? "bottom-full left-1/2 transform -translate-x-1/2 mb-3"
              : tooltipPosition === "bottom"
              ? "top-full left-1/2 transform -translate-x-1/2 mt-3"
              : tooltipPosition === "left"
              ? "right-full top-1/2 transform -translate-y-1/2 mr-3"
              : "left-full top-1/2 transform -translate-y-1/2 ml-3"
          }`}
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-2xl px-4 py-3 shadow-2xl border-2 border-white max-w-xs">
            <div className="font-black text-lg">{punto.nombre}</div>
            <div className="text-purple-100 font-bold">
              {displayIcon} {punto.pointerName}
            </div>
            {punto.año && (
              <div className="text-purple-200 text-xs mt-1">{punto.año}</div>
            )}
          </div>
          {/* Flecha del tooltip - ajustada según posición */}
          <div
            className={`absolute w-0 h-0 border-6 border-transparent ${
              tooltipPosition === "top"
                ? "top-full left-1/2 transform -translate-x-1/2 border-t-purple-600"
                : tooltipPosition === "bottom"
                ? "bottom-full left-1/2 transform -translate-x-1/2 border-b-purple-600"
                : tooltipPosition === "left"
                ? "left-full top-1/2 transform -translate-y-1/2 border-l-purple-600"
                : "right-full top-1/2 transform -translate-y-1/2 border-r-purple-600"
            }`}
          />
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
    </div>
  );
}
