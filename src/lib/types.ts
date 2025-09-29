// Tipos para el sistema de Principios del Camino

// Tipos de autenticación
export interface Usuario {
  id: string;
  nombre: string;
  versiculo_id: string;
  rol: 'admin' | 'usuario';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginData {
  nombre: string;
  versiculo_id: string;
}

export interface AuthResponse {
  success: boolean;
  usuario?: Usuario;
  token?: string;
  error?: string;
}

export interface CrearUsuarioData {
  nombre: string;
  versiculo_id: string;
  rol: 'admin' | 'usuario';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PuntoMapa {
  id: string;
  nombre: string;
  descripcion?: string; // Breve descripción del principio
  x: number; // Porcentaje horizontal (0-100)
  y: number; // Porcentaje vertical (0-100)
  emoji: string; // Emoji del pointer
  pointerName: string; // Nombre del tipo de pointer
  referencias?: string; // Versículos relevantes
  año?: string; // Aplicación práctica
  createdAt: Date;
  updatedAt: Date;
}

export interface CrearPuntoData {
  nombre: string;
  descripcion?: string;
  x: number;
  y: number;
  emoji: string;
  pointerName: string;
  referencias?: string;
  año?: string;
}

export interface ActualizarPuntoData extends Partial<CrearPuntoData> {
  id: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MapaCoordenadas {
  x: number;
  y: number;
}

// Tipos para los componentes
export interface MapaInteractivoProps {
  puntos: PuntoMapa[];
  modoEdicion?: boolean;
  onPuntoClick?: (punto: PuntoMapa) => void;
  onPuntoAdd?: (coordenadas: MapaCoordenadas) => void;
  onPuntoUpdate?: (punto: ActualizarPuntoData) => void;
  onPuntoDelete?: (id: string) => void;
}

export interface PuntoMapaProps {
  punto: PuntoMapa;
  modoEdicion?: boolean;
  isSelected?: boolean;
  onClick?: (punto: PuntoMapa) => void;
  onEdit?: (punto: PuntoMapa) => void;
  onDelete?: (id: string) => void;
}

export interface FormularioPuntoProps {
  punto?: PuntoMapa;
  coordenadas?: MapaCoordenadas;
  onSubmit: (data: CrearPuntoData | ActualizarPuntoData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Emojis comunes para seleccionar (estilo WhatsApp)
export const EMOJIS_COMUNES = [
  '🙏', '❤️', '🌟', '📚', '🤝', '💪', '🔥', '✨', '💡', '🎯',
  '📍', '⭐', '💎', '🌈', '🦋', '🌺', '🍀', '🎨', '🎵', '🎪'
] as const;
