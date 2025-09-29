'use client';

import React, { useState, useEffect } from 'react';
import { PuntoMapa, CrearPuntoData, ActualizarPuntoData, MapaCoordenadas, EMOJIS_COMUNES } from '@/lib/types';

interface FormularioPuntoProps {
  punto?: PuntoMapa;
  coordenadas?: MapaCoordenadas;
  onSubmit: (data: CrearPuntoData | ActualizarPuntoData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function FormularioPunto({
  punto,
  coordenadas,
  onSubmit,
  onCancel,
  isLoading = false
}: FormularioPuntoProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    emoji: '📍',
    pointerName: '',
    referencias: '',
    año: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar formulario con datos del punto o coordenadas
  useEffect(() => {
    if (punto) {
      setFormData({
        nombre: punto.nombre,
        descripcion: punto.descripcion || '',
        emoji: punto.emoji || '📍',
        pointerName: punto.pointerName || '',
        referencias: punto.referencias || '',
        año: punto.año || ''
      });
    } else if (coordenadas) {
      setFormData(prev => ({
        ...prev,
        nombre: '' // No mostrar punto por defecto
      }));
    }
  }, [punto, coordenadas]);

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.pointerName.trim()) {
      newErrors.pointerName = 'El nombre del pointer es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar selección de emoji
  const handleEmojiSelect = (emoji: string) => {
    setFormData(prev => ({
      ...prev,
      emoji
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (punto) {
      // Actualizar punto existente
      const updateData: ActualizarPuntoData = {
        id: punto.id,
        ...formData,
        ...(coordenadas && { x: coordenadas.x, y: coordenadas.y })
      };
      onSubmit(updateData);
    } else if (coordenadas) {
      // Crear nuevo punto
      const createData: CrearPuntoData = {
        ...formData,
        x: coordenadas.x,
        y: coordenadas.y
      };
      onSubmit(createData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {punto ? 'Editar Punto' : 'Nuevo Punto'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Principio *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Jerusalén, Belén, Nazaret..."
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          {/* Emoji */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emoji del Pointer
            </label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {EMOJIS_COMUNES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                    formData.emoji === emoji
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.emoji}
                onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl"
                placeholder="📍"
                maxLength={2}
              />
              <span className="text-sm text-gray-500">
                O pega un emoji de Google
              </span>
            </div>
          </div>

          {/* Nombre del Pointer */}
          <div>
            <label htmlFor="pointerName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Pointer *
            </label>
            <input
              type="text"
              id="pointerName"
              name="pointerName"
              value={formData.pointerName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.pointerName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Fe, Amor, Esperanza, Sabiduría..."
            />
            {errors.pointerName && (
              <p className="mt-1 text-sm text-red-600">{errors.pointerName}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe la importancia histórica o bíblica de este lugar..."
            />
          </div>

          {/* Referencias bíblicas */}
          <div>
            <label htmlFor="referencias" className="block text-sm font-medium text-gray-700 mb-1">
              Referencias bíblicas
            </label>
            <input
              type="text"
              id="referencias"
              name="referencias"
              value={formData.referencias}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Mateo 2:1, Lucas 2:4..."
            />
          </div>

          {/* Año/Período */}
          <div>
            <label htmlFor="año" className="block text-sm font-medium text-gray-700 mb-1">
              Aplicación Práctica 
            </label>
            <input
              type="text"
              id="año"
              name="año"
              value={formData.año}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Aplicar este principio en la vida diaria, en las relaciones, etc."
            />
          </div>


          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Guardando...' : (punto ? 'Actualizar' : 'Crear')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
