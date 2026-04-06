import { DEVOCIONAL_IMAGEN_TEMA_PRINCIPAL } from "@/lib/devocionales-assets";

function optDate(v: unknown): Date | undefined {
  if (v == null || v === "") return undefined;
  const d = new Date(v as string | Date);
  return isNaN(d.getTime()) ? undefined : d;
}
import type {
  CrearDevocionalData,
  Devocional,
  LecturaDia,
  TemaDevocional,
} from "@/lib/types";

/** Normaliza documento Mongo (incluye legado con `pasos` en raíz). */
export function normalizarDevocionalDesdeDoc(doc: any): Devocional {
  const id = doc.id ?? doc._id;
  const now = new Date();

  if (Array.isArray(doc.temas) && doc.temas.length > 0) {
    return {
      id,
      titulo: doc.titulo ?? "",
      descripcion: doc.descripcion ?? "",
      imagen_url: doc.imagen_url?.trim?.() || undefined,
      activo: doc.activo !== false,
      orden: typeof doc.orden === "number" ? doc.orden : 0,
      duracion_tema_dias:
        typeof doc.duracion_tema_dias === "number" && doc.duracion_tema_dias > 0
          ? doc.duracion_tema_dias
          : 7,
      fecha_inicio_programa: doc.fecha_inicio_programa
        ? new Date(doc.fecha_inicio_programa)
        : null,
      temas: doc.temas.map(mapTema),
      createdAt: doc.createdAt ? new Date(doc.createdAt) : now,
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : now,
    };
  }

  const pasos = Array.isArray(doc.pasos) ? doc.pasos : [];
  const lecturaId = `lec_legacy_${id}`;
  const temaLegacy: TemaDevocional = {
    id: `tema_legacy_${id}`,
    orden: 0,
    titulo: "Contenido",
    descripcion: "",
    imagen_url:
      doc.imagen_url?.trim?.() || DEVOCIONAL_IMAGEN_TEMA_PRINCIPAL,
    lecturas: [
      {
        id: lecturaId,
        orden: 0,
        titulo: doc.titulo || "Lectura",
        descripcion: doc.descripcion ?? "",
        imagen_url: doc.imagen_url?.trim?.() || undefined,
        minutos_lectura: undefined,
        pasos,
      },
    ],
  };

  return {
    id,
    titulo: doc.titulo ?? "",
    descripcion: doc.descripcion ?? "",
    imagen_url: doc.imagen_url?.trim?.() || undefined,
    activo: doc.activo !== false,
    orden: typeof doc.orden === "number" ? doc.orden : 0,
    duracion_tema_dias:
      typeof doc.duracion_tema_dias === "number" && doc.duracion_tema_dias > 0
        ? doc.duracion_tema_dias
        : 7,
    fecha_inicio_programa: doc.fecha_inicio_programa
      ? new Date(doc.fecha_inicio_programa)
      : null,
    temas: [temaLegacy],
    createdAt: doc.createdAt ? new Date(doc.createdAt) : now,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : now,
  };
}

function mapTema(t: any): TemaDevocional {
  return {
    id: t.id,
    orden: typeof t.orden === "number" ? t.orden : 0,
    titulo: t.titulo ?? "",
    descripcion: t.descripcion ?? "",
    imagen_url:
      t.imagen_url?.trim?.() || DEVOCIONAL_IMAGEN_TEMA_PRINCIPAL,
    duracion_dias:
      typeof t.duracion_dias === "number" && t.duracion_dias > 0
        ? t.duracion_dias
        : undefined,
    fecha_activacion: optDate(t.fecha_activacion),
    lecturas: Array.isArray(t.lecturas) ? t.lecturas.map(mapLectura) : [],
  };
}

function mapLectura(l: any): LecturaDia {
  return {
    id: l.id,
    orden: typeof l.orden === "number" ? l.orden : 0,
    titulo: l.titulo ?? "",
    descripcion: l.descripcion ?? "",
    imagen_url: l.imagen_url?.trim?.() || undefined,
    minutos_lectura:
      typeof l.minutos_lectura === "number" && l.minutos_lectura >= 0
        ? l.minutos_lectura
        : undefined,
    fecha_disponible: optDate(l.fecha_disponible),
    pasos: Array.isArray(l.pasos) ? l.pasos : [],
  };
}

export function ordenarTemas(temas: TemaDevocional[]): TemaDevocional[] {
  return [...temas].sort((a, b) => a.orden - b.orden);
}

export function buscarTemaPorId(
  dev: Devocional,
  temaId: string
): TemaDevocional | null {
  const id = temaId.trim();
  if (!id) return null;
  return dev.temas.find((t) => t.id === id) ?? null;
}

/** Índice del tema en el orden del programa (0-based), o -1 si no existe. */
export function indiceTemaEnPrograma(dev: Devocional, temaId: string): number {
  const temas = ordenarTemas(dev.temas);
  return temas.findIndex((t) => t.id === temaId.trim());
}

export function ordenarLecturas(lecturas: LecturaDia[]): LecturaDia[] {
  return [...lecturas].sort((a, b) => a.orden - b.orden);
}

/** Índice del tema vigente según fecha de inicio y duración (0-based). */
export function indiceTemaActivo(dev: Devocional, ahora = new Date()): number {
  const temas = ordenarTemas(dev.temas);
  if (temas.length === 0) return 0;
  if (!dev.fecha_inicio_programa) return 0;
  const start = new Date(dev.fecha_inicio_programa);
  if (isNaN(start.getTime())) return 0;
  const msDia = 86400000;
  const dias = Math.floor((ahora.getTime() - start.getTime()) / msDia);
  if (dias < 0) return 0;
  let cursor = 0;
  for (let i = 0; i < temas.length; i++) {
    const dur =
      temas[i].duracion_dias && temas[i].duracion_dias! > 0
        ? temas[i].duracion_dias!
        : dev.duracion_tema_dias;
    if (dias < cursor + dur) return i;
    cursor += dur;
  }
  return temas.length - 1;
}

export function temaActivo(dev: Devocional, ahora = new Date()): TemaDevocional {
  const temas = ordenarTemas(dev.temas);
  if (temas.length === 0) {
    return {
      id: "vacío",
      orden: 0,
      titulo: "",
      descripcion: "",
      imagen_url: DEVOCIONAL_IMAGEN_TEMA_PRINCIPAL,
      lecturas: [],
    };
  }
  return temas[indiceTemaActivo(dev, ahora)] ?? temas[0];
}

export function buscarLecturaPorId(
  dev: Devocional,
  lecturaId: string
): { tema: TemaDevocional; lectura: LecturaDia } | null {
  for (const t of ordenarTemas(dev.temas)) {
    const l = ordenarLecturas(t.lecturas).find((x) => x.id === lecturaId);
    if (l) return { tema: t, lectura: l };
  }
  return null;
}

/** Sesiones antiguas sin lectura_id → primera lectura del programa. */
export function lecturaParaSesion(
  dev: Devocional,
  lecturaId: string | null | undefined
): { tema: TemaDevocional; lectura: LecturaDia } | null {
  if (lecturaId) {
    return buscarLecturaPorId(dev, lecturaId);
  }
  const t0 = ordenarTemas(dev.temas)[0];
  const l0 = t0 ? ordenarLecturas(t0.lecturas)[0] : null;
  if (t0 && l0) return { tema: t0, lectura: l0 };
  return null;
}

export function pasosDeLectura(lectura: LecturaDia) {
  return [...lectura.pasos].sort((a, b) => a.orden - b.orden);
}

/** Para persistir en Mongo desde formulario admin */
export function docDesdeCrearData(data: CrearDevocionalData) {
  const doc: Record<string, unknown> = {
    titulo: data.titulo,
    descripcion: data.descripcion,
    activo: data.activo !== false,
    orden: data.orden ?? 0,
    temas: data.temas,
    duracion_tema_dias: data.duracion_tema_dias ?? 7,
    fecha_inicio_programa: data.fecha_inicio_programa
      ? new Date(data.fecha_inicio_programa as string | Date)
      : null,
    updatedAt: new Date(),
  };
  if (data.imagen_url?.trim()) doc.imagen_url = data.imagen_url.trim();
  else doc.imagen_url = null;
  return doc;
}
