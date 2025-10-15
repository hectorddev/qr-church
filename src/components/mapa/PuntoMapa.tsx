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

  // Estado visual al presionar (desktop y mobile) y efecto ripple
  const [isPressed, setIsPressed] = useState(false);
  const [showRipple, setShowRipple] = useState(false);

  // Usar el emoji del punto directamente
  const displayIcon = punto.emoji || "📍";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(punto);
    // Mostrar/ocultar tooltip al hacer click (desktop y mobile)
    setShowTooltip((prev) => !prev);
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
    e.preventDefault(); // Prevenir comportamiento por defecto en mobile
    setIsPressed(true);
    // Efecto ripple corto en mobile
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 250);
    // No mostrar tooltip en móvil para evitar repetición con el panel
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPressed(false);
    setShowRipple(false);
    // Mostrar tooltip en mobile por un corto tiempo
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2500);
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

  // Accesibilidad: permitir activar el punto con Enter o Espacio
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(punto);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Punto del mapa */}
      <div
        className={`
          relative w-12 h-12 sm:w-10 sm:h-10 rounded-full border-2 sm:border-4 border-white/90 shadow-xl cursor-pointer select-none touch-manipulation
          transition-transform duration-150 ease-out ${
            isPressed ? "scale-95" : "hover:scale-110"
          }
          bg-gradient-to-br from-purple-500 to-pink-500
          ${isSelected ? "ring-4 ring-purple-400/70 z-20" : "z-10"}
          focus-visible:ring-4 focus-visible:ring-purple-400/70
          motion-reduce:transition-none motion-reduce:transform-none
        `}
        onClick={handleClick}
        onMouseOver={() => setShowActions(true)}
        onMouseOut={() => setShowActions(false)}
        onMouseDown={() => {
          setIsPressed(true);
          setShowRipple(true);
          setTimeout(() => setShowRipple(false), 250);
        }}
        onMouseUp={() => setIsPressed(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
        role="button"
        aria-pressed={isSelected}
        aria-label={punto.nombre}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        {/* Ripple al presionar */}
        {showRipple && (
          <span className="absolute inset-0 rounded-full bg-white/40 animate-ping motion-reduce:animate-none pointer-events-none" />
        )}
        {/* Icono del tipo */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-2xl sm:text-xl font-black drop-shadow">
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
          className={`absolute z-50 ${
            tooltipPosition === "top"
              ? "bottom-full left-1/2 -translate-x-1/2 mb-3"
              : tooltipPosition === "bottom"
              ? "top-full left-1/2 -translate-x-1/2 mt-3"
              : tooltipPosition === "left"
              ? "right-full top-1/2 -translate-y-1/2 mr-3"
              : "left-full top-1/2 -translate-y-1/2 ml-3"
          }`}
        >
          <div className="relative">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-2xl px-4 py-3 shadow-2xl max-w-[240px] sm:max-w-xs break-words ring-2 ring-white">
              <div className="font-black text-lg leading-tight">
                {punto.nombre}
              </div>
              <div className="text-purple-100 font-bold">
                {displayIcon} {punto.pointerName}
              </div>
              {punto.año && (
                <div className="text-purple-200 text-xs mt-1">{punto.año}</div>
              )}
            </div>
            {/* Flecha del tooltip con gradiente consistente */}
            <div
              className={`w-3 h-3 bg-gradient-to-r from-purple-600 to-pink-600 rotate-45 absolute ring-2 ring-white shadow-md rounded-[2px] ${
                tooltipPosition === "top"
                  ? "top-full left-1/2 -translate-x-1/2"
                  : tooltipPosition === "bottom"
                  ? "bottom-full left-1/2 -translate-x-1/2"
                  : tooltipPosition === "left"
                  ? "left-full top-1/2 -translate-y-1/2"
                  : "right-full top-1/2 -translate-y-1/2"
              }`}
              style={{
                marginTop: tooltipPosition === "top" ? "-6px" : undefined,
                marginBottom: tooltipPosition === "bottom" ? "-6px" : undefined,
                marginLeft: tooltipPosition === "left" ? "-6px" : undefined,
                marginRight: tooltipPosition === "right" ? "-6px" : undefined,
              }}
            />
          </div>
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
