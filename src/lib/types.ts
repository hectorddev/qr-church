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
  video_url?: string;
  iframe_content?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrearRetoData {
  titulo: string;
  descripcion: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  activo?: boolean;
  video_url?: string;
  iframe_content?: string;
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

// --- Devocionales (tema padre + pasos / subtemas) ---

export type DevocionalModoSesion = "solo" | "pareja";

export type EstadoSesionDevocional = "activa" | "pendiente_pareja";

export interface DevocionalVersiculo {
  referencia: string;
  texto?: string;
}

export type DevocionalCampoTipo = "texto" | "textarea";

export interface DevocionalCampo {
  id: string;
  etiqueta: string;
  tipo: DevocionalCampoTipo;
}

export interface DevocionalPreguntaReflexiva {
  id: string;
  tipo: "reflexiva";
  texto: string;
}

export interface DevocionalPreguntaPuntuacion {
  id: string;
  tipo: "puntuacion";
  texto: string;
  opciones: { id: string; texto: string }[];
  /** Solo en datos de admin / BD; no se envía al cliente público. */
  opcion_correcta_id: string;
  puntos?: number;
}

export type DevocionalPregunta =
  | DevocionalPreguntaReflexiva
  | DevocionalPreguntaPuntuacion;

export interface DevocionalPaso {
  id: string;
  orden: number;
  titulo: string;
  descripcion?: string;
  /** Reto práctico: se muestra en la sesión (actividades), no en la lectura del día. */
  reto?: string;
  versiculos: DevocionalVersiculo[];
  campos: DevocionalCampo[];
  preguntas: DevocionalPregunta[];
}

/** Una lectura concreta (día / subtema) dentro de un tema semanal */
export interface LecturaDia {
  id: string;
  orden: number;
  titulo: string;
  descripcion: string;
  imagen_url?: string;
  /** Tiempo estimado en minutos (mostrado en grid) */
  minutos_lectura?: number;
  /** Día en que se desbloquea (inicio del día local). Si falta: inicio del tema + `orden` días. */
  fecha_disponible?: string | Date | null;
  pasos: DevocionalPaso[];
}

/** Tema = bloque temporal (p. ej. una semana) con varias lecturas */
export interface TemaDevocional {
  id: string;
  orden: number;
  titulo: string;
  descripcion: string;
  imagen_url?: string;
  /** Si se define, sustituye la duración global del programa para este tema */
  duracion_dias?: number;
  /**
   * Fecha en que el tema se muestra desbloqueado en el programa (inicio del día local).
   * Si falta, se usa `fecha_inicio_programa` del programa + duraciones de temas anteriores.
   */
  fecha_activacion?: string | Date | null;
  lecturas: LecturaDia[];
}

export interface Devocional {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url?: string;
  activo: boolean;
  orden: number;
  /** Días por tema si el tema no trae `duracion_dias` (por defecto 7) */
  duracion_tema_dias: number;
  /** Inicio del calendario del programa (tema activo por fechas) */
  fecha_inicio_programa: Date | null;
  temas: TemaDevocional[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CrearDevocionalData {
  titulo: string;
  descripcion: string;
  imagen_url?: string;
  activo?: boolean;
  orden?: number;
  duracion_tema_dias?: number;
  fecha_inicio_programa?: string | Date | null;
  temas: TemaDevocional[];
}

export interface DevocionalSesion {
  id: string;
  devocional_id: string;
  /** Lectura asociada (omitida en sesiones antiguas → primera del programa) */
  lectura_id: string | null;
  modo: DevocionalModoSesion;
  usuario_iniciador_id: string;
  usuario_pareja_id: string | null;
  estado: EstadoSesionDevocional;
  createdAt: Date;
  updatedAt: Date;
}

export interface DevocionalProgresoUsuario {
  id: string;
  sesion_id: string;
  user_id: string;
  pasos_completados: string[];
  /** Clave: `${pasoId}:${campoId}` */
  respuestas_campos: Record<string, string>;
  /** Clave: `${pasoId}:${preguntaId}` — reflexiva: texto; puntuación: id de opción elegida */
  respuestas_preguntas: Record<string, string>;
  puntaje_puntuacion: number;
  updatedAt: Date;
}

export interface CrearSesionDevocionalInput {
  devocional_id: string;
  lectura_id: string;
  modo: DevocionalModoSesion;
  /** Obligatorio si modo es pareja */
  usuario_pareja_id?: string;
}

export interface GuardarProgresoDevocionalInput {
  pasos_completados?: string[];
  respuestas_campos?: Record<string, string>;
  respuestas_preguntas?: Record<string, string>;
}

export interface DevocionalSesionDetalle {
  sesion: DevocionalSesion;
  lectura: LecturaDia;
  tema_id: string;
  tema_titulo: string;
  programa: {
    id: string;
    titulo: string;
    descripcion: string;
    imagen_url?: string;
  };
  nombres: {
    iniciador: string;
    pareja: string | null;
  };
}

/** Progreso por lectura en el tema actual (grid /devocionales/:id) */
export type ResumenProgresoLecturas = Record<
  string,
  { porcentaje: number; sesion_id: string | null }
>;

export interface ProgresoDevocionalVista {
  mio: DevocionalProgresoUsuario;
  pareja: DevocionalProgresoUsuario | null;
}
