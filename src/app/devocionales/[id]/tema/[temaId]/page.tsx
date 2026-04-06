"use client";

import { useAuth } from "@/contexts/AuthContext";
import { DEVOCIONAL_IMAGEN_TEMA_PRINCIPAL } from "@/lib/devocionales-assets";
import {
  formatFechaHumana,
  lecturaDisponibleParaUsuario,
  temaDisponibleParaUsuario,
} from "@/lib/devocionales-fechas";
import { ordenarLecturas, ordenarTemas } from "@/lib/devocionales-model";
import {
  ApiResponse,
  Devocional,
  LecturaDia,
  ResumenProgresoLecturas,
} from "@/lib/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

function minutosEstimados(lectura: LecturaDia): number {
  if (
    typeof lectura.minutos_lectura === "number" &&
    lectura.minutos_lectura >= 0
  ) {
    return lectura.minutos_lectura;
  }
  const n = lectura.pasos?.length ?? 0;
  return Math.max(3, Math.min(25, Math.ceil(n * 2.5)));
}

function plainSnippet(text: string, max = 120) {
  const t = text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export default function DevocionalTemaLecturasPage() {
  const params = useParams();
  const id = params.id as string;
  const temaId = params.temaId as string;
  const router = useRouter();
  const { isAuthenticated, isLoading, token } = useAuth();
  const [dev, setDev] = useState<Devocional | null>(null);
  const [progreso, setProgreso] = useState<ResumenProgresoLecturas | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!token || !id || !temaId) return;
    (async () => {
      try {
        const encTema = encodeURIComponent(temaId);
        const [rDev, rProg] = await Promise.all([
          fetch(`/api/devocionales/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/devocionales/${id}/progreso-lecturas?tema_id=${encTema}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const d1: ApiResponse<Devocional> = await rDev.json();
        const d2: ApiResponse<ResumenProgresoLecturas> = await rProg.json();
        if (d1.success && d1.data) setDev(d1.data);
        else throw new Error(d1.error || "No encontrado");
        if (d2.success && d2.data) setProgreso(d2.data);
        else setProgreso({});
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    })();
  }, [token, id, temaId]);

  const tema = useMemo(() => {
    if (!dev) return null;
    return ordenarTemas(dev.temas).find((t) => t.id === temaId) ?? null;
  }, [dev, temaId]);

  const lecturas = useMemo(
    () => (tema ? ordenarLecturas(tema.lecturas) : []),
    [tema]
  );

  const temaDesbloqueado = useMemo(() => {
    if (!dev || !tema) return false;
    return temaDisponibleParaUsuario(dev, tema);
  }, [dev, tema]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-stone-600">
        Cargando…
      </div>
    );
  }

  if (!dev) {
    return (
      <div className="py-16 text-center px-4">
        {error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : (
          <p className="text-stone-600">Cargando programa…</p>
        )}
        <Link
          href="/devocionales"
          className="text-[#2a9d8f] font-medium underline text-sm mt-4 inline-block"
        >
          Volver
        </Link>
      </div>
    );
  }

  if (!tema) {
    return (
      <div className="py-16 text-center px-4 space-y-4">
        <p className="text-stone-700">Este tema no existe en el programa.</p>
        <Link
          href={`/devocionales/${id}`}
          className="text-[#2a9d8f] font-bold underline"
        >
          Volver al programa
        </Link>
      </div>
    );
  }

  if (!temaDesbloqueado) {
    return (
      <div className="min-h-screen bg-[#F9F6EE] -mx-4 sm:mx-0 pb-28 px-4 pt-4">
        <Link
          href={`/devocionales/${id}`}
          className="inline-flex items-center rounded-full bg-stone-800/90 text-white text-xs font-semibold px-3 py-2 mb-8"
        >
          ← Programa
        </Link>
        <div className="max-w-md mx-auto text-center space-y-4 pt-4">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-200 text-3xl"
            aria-hidden
          >
            🔒
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            {tema.titulo}
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed">
            Este bloque aún no está disponible. Se abrirá en la fecha de
            activación configurada por el administrador.
          </p>
          <Link
            href={`/devocionales/${id}`}
            className="inline-flex rounded-2xl bg-stone-900 text-[#FAF7F0] font-bold px-6 py-3 text-sm shadow-md border border-stone-800 hover:bg-stone-800 transition-colors"
          >
            Volver a los temas
          </Link>
        </div>
      </div>
    );
  }

  const prog = progreso ?? {};

  return (
    <div className="min-h-screen bg-[#F9F6EE] -mx-4 sm:mx-0 pb-28">
      <div className="px-4 sm:px-6 pt-4 pb-6">
        <Link
          href={`/devocionales/${id}`}
          className="inline-flex items-center rounded-full bg-stone-800/90 text-white text-xs font-semibold px-3 py-2 hover:bg-stone-800 transition-colors"
        >
          ← Programa
        </Link>
      </div>

      <div className="px-4 sm:px-1">
        {lecturas.length === 0 ? (
          <p className="text-stone-600 text-sm">
            Este tema aún no tiene lecturas publicadas.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {lecturas.map((lec, li) => {
              const img =
                lec.imagen_url ||
                tema.imagen_url ||
                dev.imagen_url ||
                DEVOCIONAL_IMAGEN_TEMA_PRINCIPAL;
              const pr = prog[lec.id];
              const pct = pr?.porcentaje ?? 0;
              const min = minutosEstimados(lec);
              const desc = plainSnippet(lec.descripcion || "", 100);
              const acceso = lecturaDisponibleParaUsuario(
                dev,
                tema,
                lecturas,
                li,
                prog
              );

              const cardInner = (
                <>
                  <div className="aspect-[4/3] w-full bg-gradient-to-br from-[#2a9d8f] to-[#264653] overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt=""
                      className={`h-full w-full object-cover ${
                        acceso.ok ? "group-hover:scale-[1.03]" : ""
                      } transition-transform duration-300 ${
                        acceso.ok ? "" : "grayscale-[0.4] brightness-[0.9]"
                      }`}
                      loading="lazy"
                    />
                    {!acceso.ok ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/50 text-white backdrop-blur-[2px] px-2">
                        <span className="text-2xl mb-1" aria-hidden>
                          🔒
                        </span>
                        <span className="text-[11px] font-bold uppercase text-center leading-tight">
                          {acceso.motivo === "anterior"
                            ? "Completa la lectura anterior"
                            : acceso.fechaApertura
                              ? `Desde ${formatFechaHumana(acceso.fechaApertura)}`
                              : "Próximamente"}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="p-4 flex flex-col flex-1 min-h-0">
                    <h2 className="font-serif text-lg font-bold text-stone-900 leading-snug line-clamp-2">
                      {lec.titulo}
                    </h2>
                    {desc ? (
                      <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed flex-1">
                        {desc}
                      </p>
                    ) : (
                      <div className="flex-1" />
                    )}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center text-[11px] font-semibold uppercase tracking-wide">
                        <span
                          className={
                            pct >= 100
                              ? "text-emerald-800"
                              : "text-stone-500"
                          }
                        >
                          Progreso
                        </span>
                        <span
                          className={
                            pct >= 100
                              ? "text-emerald-700 tabular-nums"
                              : "text-stone-500 tabular-nums"
                          }
                        >
                          {pct >= 100 ? "100% · Listo" : `${pct}%`}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 100
                              ? "bg-emerald-600"
                              : "bg-gradient-to-r from-[#4DB6AC] to-[#2a9d8f]"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-stone-500 pt-1">
                        ~{min} min lectura
                      </p>
                    </div>
                    {acceso.ok ? (
                      <span
                        className={`mt-3 text-sm font-bold ${
                          pct >= 100 ? "text-emerald-700" : "text-[#2a9d8f]"
                        }`}
                      >
                        {pct >= 100 ? "Repasar o continuar →" : "Abrir lectura →"}
                      </span>
                    ) : (
                      <span className="mt-3 text-xs text-stone-500 leading-snug">
                        {acceso.motivo === "anterior"
                          ? "Termina al 100% la lectura previa."
                          : "Se desbloquea en la fecha indicada."}
                      </span>
                    )}
                  </div>
                </>
              );

              return (
                <li key={lec.id}>
                  {acceso.ok ? (
                    <Link
                      href={`/devocionales/${id}/day/${lec.id}`}
                      className={`group flex flex-col h-full rounded-2xl border overflow-hidden shadow-md shadow-stone-900/5 transition-all ${
                        pct >= 100
                          ? "border-emerald-400/80 bg-emerald-50/25 hover:border-emerald-500 hover:shadow-lg"
                          : "border-stone-200/90 bg-white hover:border-[#4DB6AC]/45 hover:shadow-lg"
                      }`}
                    >
                      {cardInner}
                    </Link>
                  ) : (
                    <div className="flex flex-col h-full rounded-2xl border border-stone-200/70 bg-stone-50/90 overflow-hidden shadow-sm cursor-not-allowed">
                      {cardInner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
