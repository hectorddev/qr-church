// Configuración de base de datos para el sistema de mapa
// Este archivo mantiene compatibilidad con el código existente
// pero ahora usa la nueva configuración de database.ts

import { 
  crearPunto as createPoint,
  obtenerPuntos as getPoints,
  obtenerPunto as getPoint,
  actualizarPunto as updatePoint,
  eliminarPunto as deletePoint,
  eliminarTodosPuntos as deleteAllPoints,
  initializeDatabase
} from './database';

// Inicializar la base de datos
initializeDatabase();

// Exportar las funciones con los nombres originales para compatibilidad
export const db = {
  crearPunto: createPoint,
  obtenerPuntos: getPoints,
  obtenerPunto: getPoint,
  actualizarPunto: updatePoint,
  eliminarPunto: deletePoint,
  eliminarTodosPuntos: deleteAllPoints
};

// Funciones helper para las API routes (mantener compatibilidad)
export async function crearPunto(data: any) {
  return await db.crearPunto(data);
}

export async function obtenerPuntos() {
  return await db.obtenerPuntos();
}

export async function obtenerPunto(id: string) {
  return await db.obtenerPunto(id);
}

export async function actualizarPunto(id: string, data: any) {
  return await db.actualizarPunto(id, data);
}

export async function eliminarPunto(id: string) {
  return await db.eliminarPunto(id);
}

export async function eliminarTodosPuntos() {
  return await db.eliminarTodosPuntos();
}
