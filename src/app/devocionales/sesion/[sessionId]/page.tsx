"use client";

import {
  DevocionalCampoCard,
  DevocionalCuerpoLectura,
  DevocionalPreguntaReflexionCard,
  DevocionalPreguntaTestCard,
  DevocionalTipoBadge,
  DevocionalTituloLectura,
  DevocionalVersiculoCallout,
} from "@/components/devocionales/DevocionalReadingUI";
import { useAuth } from "@/contexts/AuthContext";
import { btnDevocionalPrimario } from "@/lib/devocionales-reading-styles";
import { contarPasosListosParaProgreso } from "@/lib/devocionales-utils";
import {
  ApiResponse,
  DevocionalSesionDetalle,
  ProgresoDevocionalVista,
} from "@/lib/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

function campoKey(pasoId: string, campoId: string) {
  return `${pasoId}:${campoId}`;
}

function preguntaKey(pasoId: string, preguntaId: string) {
  return `${pasoId}:${preguntaId}`;
}

/** Devuelve si todos los campos y preguntas de un paso tienen valor. */
function pasoEstaCompleto(
  pasoId: string,
  campos: { id: string }[],
  preguntas: { id: string }[],
  camposVals: Record<string, string>,
  preguntasVals: Record<string, string>,
  pasosHechos: string[]
): boolean {
  if (!pasosHechos.includes(pasoId)) return false;
  const todosLosCampos = campos.every(
    (c) => (camposVals[campoKey(pasoId, c.id)] ?? "").trim() !== ""
  );
  const todasLasPreguntas = preguntas.every(
    (p) => (preguntasVals[preguntaKey(pasoId, p.id)] ?? "").trim() !== ""
  );
  return todosLosCampos && todasLasPreguntas;
}

export default function DevocionalSesionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  const { isAuthenticated, isLoading, token } = useAuth();
  const [detalle, setDetalle] = useState<DevocionalSesionDetalle | null>(null);
  const [vista, setVista] = useState<ProgresoDevocionalVista | null>(null);
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [preguntas, setPreguntas] = useState<Record<string, string>>({});
  const [pasosHechos, setPasosHechos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const guardadoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  useEffect(() => {
    return () => {
      if (guardadoTimer.current) clearTimeout(guardadoTimer.current);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const recargar = useCallback(async () => {
    if (!tokenRef.current) return;
    const [r1, r2] = await Promise.all([
      fetch(`/api/devocionales/sesiones/${sessionId}`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      }),
      fetch(`/api/devocionales/sesiones/${sessionId}/progreso`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      }),
    ]);
    const d1: ApiResponse<DevocionalSesionDetalle> = await r1.json();
    const d2: ApiResponse<ProgresoDevocionalVista> = await r2.json();
    if (!d1.success || !d1.data) throw new Error(d1.error || "Sesión");
    if (!d2.success || !d2.data) throw new Error(d2.error || "Progreso");
    setDetalle(d1.data);
    setVista(d2.data);
    setCampos({ ...d2.data.mio.respuestas_campos });
    setPreguntas({ ...d2.data.mio.respuestas_preguntas });
    setPasosHechos([...d2.data.mio.pasos_completados]);
  }, [sessionId]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        await recargar();
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    })();
  }, [token, recargar]);

  const pasosOrdenados = useMemo(() => {
    if (!detalle) return [];
    return [...detalle.lectura.pasos].sort((a, b) => a.orden - b.orden);
  }, [detalle]);

  const sesion = detalle?.sesion;
  const puedeEscribir =
    sesion &&
    (sesion.modo === "solo" ||
      (sesion.modo === "pareja" && sesion.estado === "activa"));

  const guardarInterno = useCallback(
    async (opts: { silencioso?: boolean } = {}) => {
      if (!tokenRef.current || !puedeEscribir) return;
      if (!opts.silencioso) setSaving(true);
      else setAutoSaving(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/devocionales/sesiones/${sessionId}/progreso`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${tokenRef.current}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pasos_completados: pasosHechos,
              respuestas_campos: campos,
              respuestas_preguntas: preguntas,
            }),
          }
        );
        const data: ApiResponse<unknown> = await res.json();
        if (!data.success) throw new Error(data.error || "No se guardó");
        await recargar();
        if (!opts.silencioso) {
          setGuardadoOk(true);
          if (guardadoTimer.current) clearTimeout(guardadoTimer.current);
          guardadoTimer.current = setTimeout(() => setGuardadoOk(false), 4000);
        }
      } catch (e) {
        if (!opts.silencioso) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!opts.silencioso) setSaving(false);
        else setAutoSaving(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionId, puedeEscribir, pasosHechos, campos, preguntas, recargar]
  );

  /** Auto-save con debounce de 1.5 s cuando cambia cualquier respuesta. */
  useEffect(() => {
    if (!puedeEscribir) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      guardarInterno({ silencioso: true });
    }, 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campos, preguntas]);

  const guardar = () => guardarInterno({ silencioso: false });

  const togglePaso = (pasoId: string) => {
    setPasosHechos((prev) =>
      prev.includes(pasoId)
        ? prev.filter((x) => x !== pasoId)
        : [...prev, pasoId]
    );
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-stone-600">
        Cargando…
      </div>
    );
  }

  if (!detalle || !vista) {
    return (
      <div className="px-4 py-16 text-center space-y-4">
        {error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : (
          <p className="text-stone-600">Cargando sesión…</p>
        )}
        <Link
          href="/devocionales"
          className="text-stone-700 font-medium underline text-sm"
        >
          Volver
        </Link>
      </div>
    );
  }

  const { sesion: s, lectura: L, programa: prog, tema_id, tema_titulo } =
    detalle;
  const backHref =
    prog.id && tema_id
      ? `/devocionales/${prog.id}/tema/${tema_id}`
      : `/devocionales/${prog.id}`;
  const dayHref = `/devocionales/${prog.id}/day/${L.id}`;
  const totalPasos = Math.max(pasosOrdenados.length, 1);
  const progCount = contarPasosListosParaProgreso(
    L,
    pasosHechos,
    campos,
    preguntas
  );
  const pct = Math.round((progCount / totalPasos) * 100);
  const completo = pct >= 100;

  return (
    <div className="bg-[#F9F6EE] min-h-screen pb-28">
      {/* ── Cabecera compacta ── */}
      <header className="px-4 sm:px-6 pt-4 pb-4 border-b border-stone-200/70 bg-[#F9F6EE]">
        {/* Navegación */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={backHref}
            className="inline-flex items-center rounded-full bg-stone-900/85 text-[#FAF7F0] text-xs font-semibold px-3.5 py-2.5 shadow-sm hover:bg-stone-900 transition-colors"
          >
            ← Lecturas
          </Link>
          <Link
            href={dayHref}
            className="inline-flex items-center rounded-full border border-stone-300 bg-white text-stone-800 text-xs font-semibold px-3.5 py-2.5 shadow-sm hover:bg-stone-50 transition-colors"
          >
            Ver lectura
          </Link>
          {autoSaving && (
            <span className="text-[10px] text-stone-400 animate-pulse">
              Guardando…
            </span>
          )}
        </div>

        {/* Título + subtítulo */}
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          Actividades
        </p>
        <p className="text-sm font-semibold text-stone-800 mt-0.5 line-clamp-2">
          {L.titulo}
        </p>
        {tema_titulo ? (
          <p className="text-xs text-stone-500 mt-0.5">{tema_titulo}</p>
        ) : null}

        {/* Barra de progreso */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-stone-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                completo
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-[#4DB6AC] to-[#2a9d8f]"
              }`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span
            className={`text-xs font-bold tabular-nums shrink-0 ${
              completo ? "text-emerald-700" : "text-stone-600"
            }`}
          >
            {completo ? "✓ Listo" : `${pct}%`}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-stone-500">
          {progCount}/{totalPasos} paso{totalPasos === 1 ? "" : "s"} completo{totalPasos === 1 ? "" : "s"}
        </p>
      </header>

      {/* ── Notificaciones ── */}
      <div className="px-4 sm:px-6 space-y-4 pt-3">
        {guardadoOk && (
          <div
            className="rounded-2xl bg-emerald-50 text-emerald-900 px-4 py-3 text-sm border border-emerald-200/90 font-medium"
            role="status"
          >
            ✓ Progreso guardado correctamente.
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-red-50 text-red-800 px-4 py-3 text-sm border border-red-100">
            {error}
          </div>
        )}
      </div>

      {/* ── Pasos ── */}
      {pasosOrdenados.map((paso, pasoIdx) => {
        const reflexivas = paso.preguntas.filter((p) => p.tipo === "reflexiva");
        const tests = paso.preguntas.filter((p) => p.tipo === "puntuacion");
        const esCompleto = pasoEstaCompleto(
          paso.id,
          paso.campos,
          paso.preguntas,
          campos,
          preguntas,
          pasosHechos
        );

        return (
          <section
            key={paso.id}
            className="px-4 sm:px-6 pt-6 pb-4 space-y-5 border-t border-stone-200/60 first:border-0"
          >
            {/* Encabezado del paso */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {pasosOrdenados.length > 1 && (
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-800 text-[#FAF7F0] text-xs font-bold flex items-center justify-center">
                    {pasoIdx + 1}
                  </span>
                )}
                {pasosOrdenados.length > 1 ? (
                  <DevocionalTituloLectura
                    titulo={paso.titulo}
                    as="h2"
                    className="min-w-0"
                  />
                ) : null}
              </div>
              <span
                className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${
                  esCompleto
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-stone-100 text-stone-500 border-stone-200"
                }`}
              >
                {esCompleto ? "✓ Completo" : "Pendiente"}
              </span>
            </div>

            {/* Descripción del paso */}
            {paso.descripcion?.trim() ? (
              <DevocionalCuerpoLectura texto={paso.descripcion} variant="reading" />
            ) : null}

            {/* Versículos bíblicos */}
            {paso.versiculos?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DevocionalTipoBadge tipo="versiculo" />
                </div>
                {paso.versiculos.map((v, vi) => (
                  <DevocionalVersiculoCallout
                    key={v.referencia ?? vi}
                    versiculo={v}
                    variant={vi % 2 === 0 ? "teal" : "amber"}
                  />
                ))}
              </div>
            )}

            {/* Reto */}
            {paso.reto?.trim() ? (
              <div className="rounded-2xl border-l-4 border-emerald-500 bg-emerald-50/60 border border-emerald-200/80 pl-4 pr-4 py-4 sm:py-5 space-y-3">
                <DevocionalTipoBadge tipo="reto" />
                <DevocionalCuerpoLectura texto={paso.reto} variant="reading" />
              </div>
            ) : null}

            {/* Campos */}
            {paso.campos.length > 0 && (
              <div className="space-y-3">
                {paso.campos.map((c) => {
                  const k = campoKey(paso.id, c.id);
                  const val = campos[k] ?? "";
                  return (
                    <DevocionalCampoCard
                      key={c.id}
                      etiqueta={c.etiqueta}
                      tipo={c.tipo}
                      value={val}
                      onChange={(v) =>
                        setCampos((prev) => ({ ...prev, [k]: v }))
                      }
                      disabled={!puedeEscribir}
                      hasValue={val.trim() !== ""}
                    />
                  );
                })}
              </div>
            )}

            {/* Preguntas de reflexión */}
            {reflexivas.length > 0 && (
              <div className="space-y-4">
                {reflexivas.map((pr) => {
                  const k = preguntaKey(paso.id, pr.id);
                  const val = preguntas[k] ?? "";
                  return (
                    <DevocionalPreguntaReflexionCard
                      key={pr.id}
                      pregunta={pr.texto}
                      value={val}
                      onChange={(v) =>
                        setPreguntas((prev) => ({ ...prev, [k]: v }))
                      }
                      disabled={!puedeEscribir}
                      hasValue={val.trim() !== ""}
                    />
                  );
                })}
              </div>
            )}

            {/* Preguntas de puntuación */}
            {tests.length > 0 && (
              <div className="space-y-4">
                {tests.map((pr) => {
                  const k = preguntaKey(paso.id, pr.id);
                  return (
                    <DevocionalPreguntaTestCard
                      key={pr.id}
                      pregunta={pr.texto}
                      groupName={k}
                      opciones={pr.opciones}
                      selectedId={preguntas[k] ?? ""}
                      onSelect={(id) =>
                        setPreguntas((prev) => ({ ...prev, [k]: id }))
                      }
                      disabled={!puedeEscribir}
                      puntos={pr.puntos}
                    />
                  );
                })}
              </div>
            )}

            {/* Checkbox de completado */}
            <label
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-stone-800 cursor-pointer transition-colors ${
                pasosHechos.includes(paso.id)
                  ? "border-emerald-300/70 bg-emerald-50/30"
                  : "border-stone-200 bg-white/80"
              }`}
            >
              <input
                type="checkbox"
                className="size-4 rounded border-stone-300 accent-emerald-600"
                checked={pasosHechos.includes(paso.id)}
                onChange={() => togglePaso(paso.id)}
                disabled={!puedeEscribir}
              />
              <span className="font-medium">
                {pasosHechos.includes(paso.id)
                  ? "Paso marcado como completado"
                  : "Marcar este paso como completado"}
              </span>
            </label>
          </section>
        );
      })}

      {/* Puntaje */}
      {puedeEscribir && vista.mio.puntaje_puntuacion > 0 && (
        <p className="text-center text-sm text-stone-600 px-4 mt-4">
          Puntos acumulados:{" "}
          <strong className="text-stone-800">
            {vista.mio.puntaje_puntuacion}
          </strong>
        </p>
      )}

      {/* Botón guardar fijo */}
      <div className="fixed bottom-20 left-0 right-0 z-30 px-4 sm:px-6 max-w-lg lg:max-w-2xl mx-auto lg:bottom-8 pointer-events-none">
        <button
          type="button"
          onClick={guardar}
          disabled={!puedeEscribir || saving}
          className={`pointer-events-auto w-full ${btnDevocionalPrimario}`}
        >
          {saving ? "Guardando…" : completo ? "✓ Guardar progreso" : "Guardar mi progreso"}
        </button>
      </div>
    </div>
  );
}
