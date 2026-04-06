import {
  indiceTemaActivo,
  ordenarLecturas,
  ordenarTemas,
} from "@/lib/devocionales-model";
import type {
  Devocional,
  LecturaDia,
  ResumenProgresoLecturas,
  TemaDevocional,
} from "@/lib/types";

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Interpreta string | Date del API o Mongo; inicio del día local. */
export function parseFechaDia(v: unknown): Date | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return null;
    return startOfLocalDay(v);
  }
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return startOfLocalDay(d);
}

export function formatFechaHumana(d: Date): string {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Inicio del tema: fecha explícita del admin o derivada del calendario del programa. */
export function fechaInicioTema(dev: Devocional, tema: TemaDevocional): Date | null {
  const explicit = parseFechaDia(tema.fecha_activacion);
  if (explicit) return explicit;
  if (!dev.fecha_inicio_programa) return null;
  const temas = ordenarTemas(dev.temas);
  const idx = temas.findIndex((t) => t.id === tema.id);
  if (idx < 0) return null;
  const base = startOfLocalDay(new Date(dev.fecha_inicio_programa));
  const cursor = new Date(base);
  for (let j = 0; j < idx; j++) {
    const dur =
      temas[j].duracion_dias && temas[j].duracion_dias! > 0
        ? temas[j].duracion_dias!
        : dev.duracion_tema_dias;
    cursor.setDate(cursor.getDate() + dur);
  }
  return startOfLocalDay(cursor);
}

/**
 * El tema aparece desbloqueado en /devocionales/:id si ya llegó su fecha de activación
 * o, sin fecha explícita, según el índice activo del programa.
 */
export function temaDisponibleParaUsuario(
  dev: Devocional,
  tema: TemaDevocional,
  ahora = new Date()
): boolean {
  const fa = parseFechaDia(tema.fecha_activacion);
  if (fa) {
    return startOfLocalDay(ahora).getTime() >= fa.getTime();
  }
  const temas = ordenarTemas(dev.temas);
  const idx = temas.findIndex((t) => t.id === tema.id);
  if (idx < 0) return false;
  return idx <= indiceTemaActivo(dev, ahora);
}

/**
 * Día en que la lectura puede abrirse: fecha explícita o inicio del tema + `orden` días.
 */
export function fechaDisponibilidadLectura(
  dev: Devocional,
  tema: TemaDevocional,
  lectura: LecturaDia
): Date | null {
  const ex = parseFechaDia(lectura.fecha_disponible);
  if (ex) return ex;
  const inicio = fechaInicioTema(dev, tema);
  if (!inicio) return null;
  const d = new Date(inicio);
  d.setDate(d.getDate() + lectura.orden);
  return startOfLocalDay(d);
}

export type MotivoBloqueoLectura = "fecha" | "anterior" | null;

export function lecturaDisponibleParaUsuario(
  dev: Devocional,
  tema: TemaDevocional,
  lecturasOrdenadas: LecturaDia[],
  indice: number,
  progreso: ResumenProgresoLecturas,
  ahora = new Date()
): { ok: boolean; motivo: MotivoBloqueoLectura; fechaApertura?: Date } {
  const lec = lecturasOrdenadas[indice];
  const fec = fechaDisponibilidadLectura(dev, tema, lec);
  const hoy = startOfLocalDay(ahora);
  if (fec !== null && hoy.getTime() < fec.getTime()) {
    return { ok: false, motivo: "fecha", fechaApertura: fec };
  }
  if (indice > 0) {
    const prev = lecturasOrdenadas[indice - 1];
    const pct = progreso[prev.id]?.porcentaje ?? 0;
    if (pct < 100) {
      return { ok: false, motivo: "anterior" };
    }
  }
  return { ok: true, motivo: null };
}
