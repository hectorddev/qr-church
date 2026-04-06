"use client";

import {
  DevocionalCuerpoLectura,
  DevocionalTituloLectura,
} from "@/components/devocionales/DevocionalReadingUI";
import { useAuth } from "@/contexts/AuthContext";
import { DEVOCIONAL_IMAGEN_TEMA_PRINCIPAL } from "@/lib/devocionales-assets";
import {
  formatFechaHumana,
  parseFechaDia,
  temaDisponibleParaUsuario,
} from "@/lib/devocionales-fechas";
import { indiceTemaActivo, ordenarTemas } from "@/lib/devocionales-model";
import { ApiResponse, Devocional, TemaDevocional } from "@/lib/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

function plainSnippet(text: string, max = 120) {
  const t = text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

function badgeTema(
  dev: Devocional,
  tema: TemaDevocional,
  i: number,
  desbloqueado: boolean,
  idxActivo: number
): string {
  if (!desbloqueado) {
    const fa = parseFechaDia(tema.fecha_activacion);
    return fa ? `Desde ${formatFechaHumana(fa)}` : "Próximamente";
  }
  if (parseFechaDia(tema.fecha_activacion)) return "Disponible";
  if (i === idxActivo) return "Esta semana";
  if (i < idxActivo) return "Disponible";
  return "Disponible";
}

export default function DevocionalProgramaPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated, isLoading, token } = useAuth();
  const [dev, setDev] = useState<Devocional | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!token || !id) return;
    (async () => {
      try {
        const rDev = await fetch(`/api/devocionales/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d1: ApiResponse<Devocional> = await rDev.json();
        if (d1.success && d1.data) setDev(d1.data);
        else throw new Error(d1.error || "No encontrado");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    })();
  }, [token, id]);

  const temasOrdenados = useMemo(
    () => (dev ? ordenarTemas(dev.temas) : []),
    [dev]
  );

  const idxActivo = useMemo(
    () => (dev ? indiceTemaActivo(dev) : 0),
    [dev]
  );

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
          className="text-stone-700 font-medium underline text-sm mt-4 inline-block"
        >
          Volver
        </Link>
      </div>
    );
  }

  /** Imagen de cabecera unificada (misma que en el resto del flujo por defecto). */
  const heroSrc = DEVOCIONAL_IMAGEN_TEMA_PRINCIPAL;

  return (
    <div className="min-h-screen bg-[#F9F6EE] -mx-4 sm:mx-0 pb-28">
      <div className="w-screen ml-[calc(50%-50vw)] sm:ml-0 sm:w-full relative">
        <div
          className="absolute inset-0 z-10 pointer-events-none h-full bg-gradient-to-t from-[#F9F6EE] via-[#F9F6EE]/20 to-transparent"
          aria-hidden
        />
        <Link
          href="/devocionales"
          className="absolute top-3 left-3 z-20 inline-flex items-center rounded-full bg-stone-900/85 text-[#FAF7F0] text-xs font-semibold px-3.5 py-2.5 shadow-sm hover:bg-stone-900 transition-colors"
        >
          ← Devocionales
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroSrc}
          alt=""
          className="h-[200px] sm:h-56 w-full object-cover"
          loading="eager"
        />
      </div>

      <div className="relative z-10 -mt-6 rounded-t-[1.75rem] bg-[#F9F6EE] px-4 sm:px-6 pt-7 pb-2 shadow-[0_-8px_30px_rgba(28,25,23,0.06)] border-t border-stone-200/40 max-w-[40rem] mx-auto">
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          Programa
        </p>
        <DevocionalTituloLectura
          titulo={dev.titulo}
          variant="reading"
          className="mt-1"
        />
        {dev.descripcion?.trim() ? (
          <div className="mt-6 rounded-2xl bg-white border border-stone-200/90 p-5 sm:p-8 shadow-[0_2px_24px_rgba(28,25,23,0.05)]">
            <DevocionalCuerpoLectura
              texto={dev.descripcion}
              variant="programa"
            />
          </div>
        ) : null}
      </div>

      {temasOrdenados.length > 0 ? (
        <div className="px-4 sm:px-6 max-w-[40rem] mx-auto mt-10 sm:mt-12 mb-2">
          <div className="rounded-2xl border-2 border-amber-400/70 bg-gradient-to-b from-amber-50 to-[#F5E6C8]/90 px-4 py-5 sm:py-4 text-center shadow-[0_12px_32px_-8px_rgba(120,80,20,0.2)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-amber-900/90">
              Tus bloques del programa
            </p>
            <p className="mt-2 text-base sm:text-[0.95rem] font-semibold text-stone-900 leading-snug">
              Desliza hacia abajo para ver cada tema y entrar a las lecturas
            </p>
            <div
              className="mt-3 flex justify-center text-stone-800 text-3xl leading-none motion-safe:animate-bounce"
              aria-hidden
            >
              ↓
            </div>
          </div>
        </div>
      ) : null}

      <div className="px-4 sm:px-1 mt-6 sm:mt-8">
        {temasOrdenados.length === 0 ? (
          <p className="text-stone-600 text-sm">
            Este programa aún no tiene temas publicados.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-5 max-w-[40rem] sm:max-w-none mx-auto">
            {temasOrdenados.map((tema: TemaDevocional, i: number) => {
              const desbloqueado = temaDisponibleParaUsuario(dev, tema);
              const nLec = tema.lecturas?.length ?? 0;
              const img =
                tema.imagen_url ||
                dev.imagen_url ||
                DEVOCIONAL_IMAGEN_TEMA_PRINCIPAL;
              const desc = plainSnippet(tema.descripcion || "", 100);
              const badge = badgeTema(dev, tema, i, desbloqueado, idxActivo);
              const fa = parseFechaDia(tema.fecha_activacion);

              const inner = (
                <>
                  <div className="aspect-[4/3] w-full bg-gradient-to-br from-[#2a9d8f] to-[#264653] overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt=""
                      className={`h-full w-full object-cover transition-transform duration-300 ${
                        desbloqueado ? "group-hover:scale-[1.03]" : ""
                      } ${desbloqueado ? "" : "grayscale-[0.35] brightness-[0.92]"}`}
                      loading="lazy"
                    />
                    {!desbloqueado ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/45 text-white backdrop-blur-[2px]">
                        <span className="text-3xl mb-1" aria-hidden>
                          🔒
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider px-2 text-center">
                          Próximamente
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="p-4 flex flex-col flex-1 min-h-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          desbloqueado
                            ? i === idxActivo && !fa
                              ? "bg-[#D1F2EB] text-[#145a52]"
                              : "bg-stone-200 text-stone-700"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {badge}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-400">
                        Bloque {i + 1}
                      </span>
                    </div>
                    <h2 className="font-serif text-xl sm:text-lg font-bold text-stone-900 leading-snug line-clamp-2">
                      {tema.titulo}
                    </h2>
                    {desc ? (
                      <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed flex-1">
                        {desc}
                      </p>
                    ) : (
                      <div className="flex-1" />
                    )}
                    <span className="inline-flex mt-3 self-start rounded-full bg-[#D1F2EB]/80 px-2.5 py-0.5 text-[11px] font-bold text-[#1d6f64]">
                      {nLec} lectura{nLec === 1 ? "" : "s"}
                    </span>
                    {desbloqueado ? (
                      <span className="mt-3 text-sm font-bold text-[#2a9d8f]">
                        Ver lecturas →
                      </span>
                    ) : (
                      <span className="mt-3 text-sm font-medium text-stone-400">
                        {fa
                          ? `Abre el ${formatFechaHumana(fa)}`
                          : "Define la fecha de activación en admin"}
                      </span>
                    )}
                  </div>
                </>
              );

              return (
                <li key={tema.id}>
                  {desbloqueado ? (
                    <Link
                      href={`/devocionales/${id}/tema/${tema.id}`}
                      className="group flex flex-col h-full rounded-[1.25rem] sm:rounded-2xl border-2 border-stone-800/[0.12] sm:border-stone-200/90 bg-white overflow-hidden shadow-[0_22px_56px_-18px_rgba(28,25,23,0.38)] sm:shadow-md sm:shadow-stone-900/5 hover:border-[#2a9d8f]/50 hover:shadow-[0_20px_50px_-15px_rgba(42,157,143,0.35)] transition-all duration-200 active:scale-[0.985] sm:active:scale-100 ring-1 ring-black/[0.04] sm:ring-0"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex flex-col h-full rounded-[1.25rem] sm:rounded-2xl border-2 border-stone-300/80 bg-stone-50/90 overflow-hidden shadow-[0_16px_40px_-14px_rgba(28,25,23,0.2)] sm:shadow-sm cursor-not-allowed opacity-[0.97]">
                      {inner}
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
