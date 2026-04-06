import type {
  CrearDevocionalData,
  Devocional,
  DevocionalPaso,
  DevocionalPregunta,
  LecturaDia,
  TemaDevocional,
} from "@/lib/types";

function sanitizarPasos(pasos: DevocionalPaso[]): DevocionalPaso[] {
  return pasos.map((p) => ({
    ...p,
    preguntas: p.preguntas.map((pr) => {
      if (pr.tipo === "puntuacion") {
        const { opcion_correcta_id: _c, ...rest } = pr;
        void _c;
        return {
          ...rest,
          tipo: "puntuacion" as const,
          opciones: pr.opciones,
        } as DevocionalPregunta;
      }
      return pr;
    }),
  }));
}

export function sanitizarLecturaParaCliente(lectura: LecturaDia): LecturaDia {
  return {
    ...lectura,
    pasos: sanitizarPasos(lectura.pasos),
  };
}

/** Devocional completo para cliente (preguntas test sin solución). */
export function sanitizarDevocionalParaCliente(dev: Devocional): Devocional {
  return {
    ...dev,
    temas: dev.temas.map((t) => ({
      ...t,
      lecturas: t.lecturas.map((l) => sanitizarLecturaParaCliente(l)),
    })),
  };
}

function validarPasos(pasos: DevocionalPaso[], ctx: string): string | null {
  if (!Array.isArray(pasos)) return `${ctx}: pasos inválidos`;
  if (pasos.length === 0) return `${ctx}: añade al menos un paso`;
  for (const p of pasos) {
    if (!p.id?.trim() || !p.titulo?.trim()) {
      return `${ctx}: cada paso necesita id y título`;
    }
    for (const c of p.campos ?? []) {
      if (!c.id?.trim() || !c.etiqueta?.trim()) {
        return `${ctx}: cada campo necesita id y etiqueta`;
      }
    }
    for (const pr of p.preguntas ?? []) {
      if (pr.tipo === "reflexiva") {
        if (!pr.texto?.trim()) return `${ctx}: pregunta reflexiva sin texto`;
      } else if (pr.tipo === "puntuacion") {
        if (!pr.texto?.trim()) return `${ctx}: pregunta test sin texto`;
        if (!pr.opciones?.length) return `${ctx}: añade opciones al test`;
        const ids = new Set(pr.opciones.map((o) => o.id));
        if (ids.size !== pr.opciones.length)
          return `${ctx}: ids de opciones únicos`;
        if (!pr.opcion_correcta_id || !ids.has(pr.opcion_correcta_id)) {
          return `${ctx}: opción correcta inválida`;
        }
      }
    }
  }
  return null;
}

export function validarCrearDevocional(data: CrearDevocionalData): string | null {
  if (!data.titulo?.trim()) return "El título es obligatorio";
  if (!Array.isArray(data.temas) || data.temas.length === 0) {
    return "Añade al menos un tema";
  }
  for (let ti = 0; ti < data.temas.length; ti++) {
    const t = data.temas[ti];
    if (!t.id?.trim() || !t.titulo?.trim()) {
      return `Tema ${ti + 1}: id y título obligatorios`;
    }
    if (!Array.isArray(t.lecturas) || t.lecturas.length === 0) {
      return `Tema "${t.titulo}": añade al menos una lectura`;
    }
    for (let li = 0; li < t.lecturas.length; li++) {
      const l = t.lecturas[li];
      if (!l.id?.trim() || !l.titulo?.trim()) {
        return `Lectura ${li + 1} en tema "${t.titulo}": id y título obligatorios`;
      }
      const err = validarPasos(
        l.pasos ?? [],
        `Lectura "${l.titulo}"`
      );
      if (err) return err;
    }
  }
  return null;
}

export function calcularPuntajeDesdeRespuestasPasos(
  pasos: DevocionalPaso[],
  respuestasPreguntas: Record<string, string>
): number {
  let total = 0;
  for (const paso of pasos) {
    for (const pr of paso.preguntas) {
      if (pr.tipo !== "puntuacion") continue;
      const key = `${paso.id}:${pr.id}`;
      if (respuestasPreguntas[key] === pr.opcion_correcta_id) {
        total += pr.puntos ?? 1;
      }
    }
  }
  return total;
}

function respuestaTrim(
  map: Record<string, string>,
  key: string
): string {
  const v = map[key];
  if (v == null) return "";
  return String(v).trim();
}

/** Paso marcado como hecho y con todos los campos y preguntas respondidos (texto no vacío). */
export function pasoListoParaProgreso(
  paso: DevocionalPaso,
  pasosCompletados: string[],
  respuestasCampos: Record<string, string>,
  respuestasPreguntas: Record<string, string>
): boolean {
  if (!pasosCompletados.includes(paso.id)) return false;
  for (const c of paso.campos ?? []) {
    if (!respuestaTrim(respuestasCampos, `${paso.id}:${c.id}`)) return false;
  }
  for (const pr of paso.preguntas ?? []) {
    if (!respuestaTrim(respuestasPreguntas, `${paso.id}:${pr.id}`))
      return false;
  }
  return true;
}

/** Cuántos pasos cuentan para el % de lectura (desbloqueo siguiente día). */
export function contarPasosListosParaProgreso(
  lectura: LecturaDia,
  pasosCompletados: string[],
  respuestasCampos: Record<string, string>,
  respuestasPreguntas: Record<string, string>
): number {
  const pasos = [...lectura.pasos].sort((a, b) => a.orden - b.orden);
  return pasos.filter((p) =>
    pasoListoParaProgreso(
      p,
      pasosCompletados,
      respuestasCampos,
      respuestasPreguntas
    )
  ).length;
}
