"use client";

import {
  DevocionalCampoCard,
  DevocionalCuerpoLectura,
  DevocionalPreguntaReflexionCard,
  DevocionalPreguntaTestCard,
  DevocionalSeccionTitulo,
  DevocionalTituloLectura,
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
  const [guardadoOk, setGuardadoOk] = useState(false);
  const guardadoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (guardadoTimer.current) clearTimeout(guardadoTimer.current);
    };
  }, []);

  const recargar = useCallback(async () => {
    if (!token) return;
    const [r1, r2] = await Promise.all([
      fetch(`/api/devocionales/sesiones/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`/api/devocionales/sesiones/${sessionId}/progreso`, {
        headers: { Authorization: `Bearer ${token}` },
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
  }, [token, sessionId]);

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

  const guardar = async () => {
    if (!token || !puedeEscribir) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/devocionales/sesiones/${sessionId}/progreso`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
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
      setGuardadoOk(true);
      if (guardadoTimer.current) clearTimeout(guardadoTimer.current);
      guardadoTimer.current = setTimeout(() => setGuardadoOk(false), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="bg-[#F9F6EE] min-h-screen pb-28">
      <header className="px-4 sm:px-6 pt-4 pb-5 border-b border-stone-200/70 bg-[#F9F6EE]">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={backHref}
            className="inline-flex items-center rounded-full bg-stone-900/85 text-[#FAF7F0] text-xs font-semibold px-3.5 py-2.5 shadow-sm hover:bg-stone-900 transition-colors"
          >
            ← Lecturas del tema
          </Link>
          <Link
            href={dayHref}
            className="inline-flex items-center rounded-full border border-stone-300 bg-white text-stone-800 text-xs font-semibold px-3.5 py-2.5 shadow-sm hover:bg-stone-50 transition-colors"
          >
            Ver lectura
          </Link>
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          Sesión · Actividades
        </p>
        <p className="text-sm text-stone-600 mt-1 line-clamp-2">{L.titulo}</p>
        {tema_titulo ? (
          <p className="text-xs text-stone-500 mt-0.5">{tema_titulo}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
          <span>Progreso de esta lectura</span>
          <span className="text-stone-400">·</span>
          <span className={pct >= 100 ? "font-semibold text-emerald-800" : ""}>
            {progCount}/{totalPasos} pasos listos
            {pct >= 100 ? " · Listo" : ""}
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-stone-200 overflow-hidden max-w-md">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              pct >= 100 ? "bg-emerald-600" : "bg-stone-700"
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-stone-500 max-w-md leading-snug">
          Cuenta al 100% cuando cada paso está marcado y todos los campos y
          preguntas tienen respuesta.
        </p>
      </header>

      <div className="px-4 sm:px-6 space-y-4 pt-2">
        {guardadoOk && (
          <div
            className="rounded-2xl bg-emerald-50 text-emerald-900 px-4 py-3 text-sm border border-emerald-200/90 font-medium"
            role="status"
          >
            Progreso guardado. En el tema verás la barra al 100% en verde cuando
            todos los pasos estén completos y respondidos.
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-red-50 text-red-800 px-4 py-3 text-sm border border-red-100">
            {error}
          </div>
        )}
      </div>

      {pasosOrdenados.map((paso) => {
        const reflexivas = paso.preguntas.filter((p) => p.tipo === "reflexiva");
        const tests = paso.preguntas.filter((p) => p.tipo === "puntuacion");

        return (
          <section
            key={paso.id}
            className="px-4 sm:px-6 pt-6 pb-2 space-y-5 border-t border-stone-200/60 first:border-0"
          >
            {pasosOrdenados.length > 1 ? (
              <DevocionalTituloLectura titulo={paso.titulo} as="h2" />
            ) : null}

            {paso.reto?.trim() ? (
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 sm:p-5 space-y-2">
                <DevocionalSeccionTitulo
                  as="h3"
                  className="mt-0 mb-3 text-emerald-900 text-base sm:text-lg"
                >
                  Reto
                </DevocionalSeccionTitulo>
                <DevocionalCuerpoLectura texto={paso.reto} variant="reading" />
              </div>
            ) : null}

            {paso.campos.length > 0 && (
              <div className="space-y-3">
                <DevocionalSeccionTitulo>Tu información</DevocionalSeccionTitulo>
                {paso.campos.map((c) => {
                  const k = campoKey(paso.id, c.id);
                  return (
                    <DevocionalCampoCard
                      key={c.id}
                      etiqueta={c.etiqueta}
                      tipo={c.tipo}
                      value={campos[k] ?? ""}
                      onChange={(v) =>
                        setCampos((prev) => ({ ...prev, [k]: v }))
                      }
                      disabled={!puedeEscribir}
                    />
                  );
                })}
              </div>
            )}

            {reflexivas.length > 0 && (
              <div className="space-y-4">
                <DevocionalSeccionTitulo>
                  Preguntas de reflexión
                </DevocionalSeccionTitulo>
                {reflexivas.map((pr) => {
                  const k = preguntaKey(paso.id, pr.id);
                  return (
                    <DevocionalPreguntaReflexionCard
                      key={pr.id}
                      pregunta={pr.texto}
                      value={preguntas[k] ?? ""}
                      onChange={(v) =>
                        setPreguntas((prev) => ({ ...prev, [k]: v }))
                      }
                      disabled={!puedeEscribir}
                    />
                  );
                })}
              </div>
            )}

            {tests.length > 0 && (
              <div className="space-y-4">
                <DevocionalSeccionTitulo>
                  Preguntas de puntuación
                </DevocionalSeccionTitulo>
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

            <label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                className="size-4 rounded border-stone-300 accent-stone-700"
                checked={pasosHechos.includes(paso.id)}
                onChange={() => togglePaso(paso.id)}
                disabled={!puedeEscribir}
              />
              <span className="font-medium">
                Marcar este paso como completado
              </span>
            </label>
          </section>
        );
      })}

      {puedeEscribir && vista.mio.puntaje_puntuacion > 0 && (
        <p className="text-center text-sm text-stone-600 px-4 mt-4">
          Puntos en preguntas tipo test:{" "}
          <strong className="text-stone-800">
            {vista.mio.puntaje_puntuacion}
          </strong>
        </p>
      )}

      <div className="fixed bottom-20 left-0 right-0 z-30 px-4 sm:px-6 max-w-lg lg:max-w-2xl mx-auto lg:bottom-8 pointer-events-none">
        <button
          type="button"
          onClick={guardar}
          disabled={!puedeEscribir || saving}
          className={`pointer-events-auto w-full ${btnDevocionalPrimario}`}
        >
          {saving ? "Guardando…" : "Guardar mi progreso"}
        </button>
      </div>
    </div>
  );
}
