// Tipos para el sistema de Principios del Camino

// Tipos de autenticación
export interface Usuario {
  id: string;
  nombre: string;
  versiculo_id: string;
  rol: "admin" | "usuario";
  puntuacion: number;
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
  rol: "admin" | "usuario";
  puntuacion?: number;
}

// Tipos para retos semanales
export interface Reto {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrearRetoData {
  titulo: string;
  descripcion: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  activo?: boolean;
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

// Tipos para premios
export interface Premio {
  id: string;
  nombre: string;
  costo: number;
  imagen?: string; // URL de la imagen o emoji
  emoji?: string;
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
  "🙏",
  "❤️",
  "🌟",
  "📚",
  "🤝",
  "💪",
  "🔥",
  "✨",
  "💡",
  "🎯",
  "📍",
  "⭐",
  "🪙",
  "🌈",
  "🦋",
  "🌺",
  "🍀",
  "🎨",
  "🎵",
  "🎪",
] as const;

// Tipos para planes de lectura bíblica
export interface ReadingPlan {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  created_by: string | null; // null = plan oficial del sistema
  is_public: boolean;
  activo: boolean;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanChapter {
  id: string;
  plan_id: string;
  dia: number;
  libro: string; // Código OSIS del libro (e.g., "JER", "GEN")
  capitulo: number;
  version: string; // Versión de la Biblia (e.g., "NVI", "RVR1960")
  orden: number; // Orden dentro del día
  createdAt: Date;
}

export interface UserProgress {
  id: string;
  user_id: string;
  plan_id: string;
  chapter_id: string;
  completado: boolean;
  fecha_completado?: Date;
  createdAt: Date;
}

export interface PlanWithProgress extends ReadingPlan {
  capitulos: PlanChapter[];
  progreso?: UserProgress[];
  porcentaje_completado?: number;
  nombre_creador?: string; // Nombre del usuario que creó el plan
  es_creador?: boolean; // true si el usuario actual es el creador
  total_capitulos?: number;
  capitulos_completados?: number;
}

export interface CreatePlanData {
  titulo: string;
  descripcion: string;
  icono: string;
  is_public: boolean;
  capitulos: {
    dia: number;
    libro: string;
    capitulo: number;
    version: string;
    orden: number;
  }[];
}

export interface CreateChapterData {
  dia: number;
  libro: string;
  capitulo: number;
  version: string;
  orden: number;
}
