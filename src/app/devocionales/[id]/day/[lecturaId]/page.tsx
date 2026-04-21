"use client";

import {
  DevocionalCuerpoLectura,
  DevocionalTituloLectura,
  DevocionalVersiculoCallout,
} from "@/components/devocionales/DevocionalReadingUI";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiResponse,
  Devocional,
  DevocionalSesion,
  LecturaDia,
  ResumenProgresoLecturas,
} from "@/lib/types";
import { DEVOCIONAL_IMAGEN_TEMA_PRINCIPAL } from "@/lib/devocionales-assets";
import {
  formatFechaHumana,
  lecturaDisponibleParaUsuario,
  temaDisponibleParaUsuario,
} from "@/lib/devocionales-fechas";
import { btnDevocionalPrimario } from "@/lib/devocionales-reading-styles";
import { buscarLecturaPorId, ordenarLecturas } from "@/lib/devocionales-model";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

export default function DevocionalDiaPage() {
  const params = useParams();
  const devId = params.id as string;
  const lecturaId = params.lecturaId as string;
  const router = useRouter();
  const { isAuthenticated, isLoading, token } = useAuth();
  const [dev, setDev] = useState<Devocional | null>(null);
  const [progreso, setProgreso] = useState<ResumenProgresoLecturas>({});
  const [sesiones, setSesiones] = useState<DevocionalSesion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hallazgo = useMemo(() => {
    if (!dev) return null;
    return buscarLecturaPorId(dev, lecturaId);
  }, [dev, lecturaId]);

  const lectura: LecturaDia | null = hallazgo?.lectura ?? null;
  const tema = hallazgo?.tema ?? null;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!token || !devId || !lecturaId) return;
    (async () => {
      try {
        const rDev = await fetch(`/api/devocionales/${devId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d1: ApiResponse<Devocional> = await rDev.json();
        if (!d1.success || !d1.data) throw new Error(d1.error || "No encontrado");
        setDev(d1.data);

        const hall = buscarLecturaPorId(d1.data, lecturaId);
        if (hall?.tema?.id) {
          const rProg = await fetch(
            `/api/devocionales/${devId}/progreso-lecturas?tema_id=${encodeURIComponent(hall.tema.id)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const dP: ApiResponse<ResumenProgresoLecturas> = await rProg.json();
          if (dP.success && dP.data) setProgreso(dP.data);
          else setProgreso({});
        } else {
          setProgreso({});
        }

        const rSes = await fetch(
          `/api/devocionales/sesiones?devocional_id=${encodeURIComponent(devId)}&lectura_id=${encodeURIComponent(lecturaId)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const d2: ApiResponse<DevocionalSesion[]> = await rSes.json();
        if (d2.success && d2.data) setSesiones(d2.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    })();
  }, [token, devId, lecturaId]);

  const sesionEstaLectura = useMemo(() => {
    return sesiones.find((s) => s.lectura_id === lecturaId) ?? null;
  }, [sesiones, lecturaId]);

  const heroSrc =
    lectura?.imagen_url ||
    tema?.imagen_url ||
    dev?.imagen_url ||
    DEVOCIONAL_IMAGEN_TEMA_PRINCIPAL;

  const pasosOrdenados = useMemo(() => {
    if (!lectura?.pasos) return [];
    return [...lectura.pasos].sort((a, b) => a.orden - b.orden);
  }, [lectura]);

  const pasosCount = pasosOrdenados.length;

  const iniciarSesion = async () => {
    if (!token || !lectura) return;
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        devocional_id: devId,
        lectura_id: lectura.id,
        modo: "solo" as const,
      };
      const res = await fetch("/api/devocionales/sesiones", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data: ApiResponse<DevocionalSesion> = await res.json();
      if (!data.success || !data.data) throw new Error(data.error || "Error");
      router.push(`/devocionales/sesion/${data.data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

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
          <p className="text-stone-600">Cargando…</p>
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

  if (!lectura || !tema) {
    return (
      <div className="py-16 text-center px-4 space-y-4">
        <p className="text-stone-700">Esta lectura no existe en el programa.</p>
        <Link
          href={
            tema
              ? `/devocionales/${devId}/tema/${tema.id}`
              : `/devocionales/${devId}`
          }
          className="text-[#2a9d8f] font-bold underline"
        >
          {tema ? "Volver al tema" : "Volver al programa"}
        </Link>
      </div>
    );
  }

  const lecturasOrden = ordenarLecturas(tema.lecturas);
  const idxLec = lecturasOrden.findIndex((l) => l.id === lecturaId);
  const accesoLectura =
    idxLec >= 0
      ? lecturaDisponibleParaUsuario(
          dev,
          tema,
          lecturasOrden,
          idxLec,
          progreso
        )
      : { ok: false as const, motivo: "fecha" as const };

  if (!temaDisponibleParaUsuario(dev, tema)) {
    return (
      <div className="min-h-screen bg-[#F9F6EE] px-4 py-16 text-center space-y-4 max-w-md mx-auto">
        <p className="text-stone-800 font-medium">Este tema aún no está disponible.</p>
        <Link
          href={`/devocionales/${devId}`}
          className="text-[#2a9d8f] font-bold underline"
        >
          Volver al programa
        </Link>
      </div>
    );
  }

  if (!accesoLectura.ok) {
    return (
      <div className="min-h-screen bg-[#F9F6EE] px-4 py-16 text-center space-y-4 max-w-md mx-auto">
        <p className="text-stone-800 font-medium">
          {accesoLectura.motivo === "anterior"
            ? "Completa la lectura anterior al 100% para abrir esta."
            : accesoLectura.fechaApertura
              ? `Esta lectura se desbloquea el ${formatFechaHumana(accesoLectura.fechaApertura)}.`
              : "Esta lectura aún no está disponible."}
        </p>
        <Link
          href={`/devocionales/${devId}/tema/${tema.id}`}
          className="inline-block text-[#2a9d8f] font-bold underline"
        >
          Volver a las lecturas del tema
        </Link>
      </div>
    );
  }

  const minutos =
    lectura.minutos_lectura ??
    Math.max(3, Math.min(25, Math.ceil(pasosCount * 2.5)));

  const tieneActividades = pasosOrdenados.some(
    (p) =>
      p.campos.length > 0 ||
      p.preguntas.length > 0
  );

  return (
    <div className="min-h-screen bg-[#F9F6EE] -mx-4 sm:mx-0 pb-28 overflow-x-hidden">
      {/* Hero */}
      <div className="w-screen ml-[calc(50%-50vw)] sm:ml-0 sm:w-full relative">
        <div
          className="absolute inset-0 z-10 pointer-events-none h-full bg-gradient-to-t from-[#F9F6EE] via-[#F9F6EE]/25 to-transparent"
          aria-hidden
        />
        <Link
          href={`/devocionales/${devId}/tema/${tema.id}`}
          className="absolute top-3 left-3 z-20 inline-flex items-center rounded-full bg-stone-900/80 text-[#FAF7F0] text-xs font-semibold px-3.5 py-2.5 backdrop-blur-sm hover:bg-stone-900 transition-colors shadow-md"
        >
          ← Lecturas del tema
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroSrc}
          alt=""
          className="h-[200px] sm:h-64 w-full object-cover"
          loading="eager"
        />
      </div>

      {/* Cabecera */}
      <div className="relative z-10 -mt-8 sm:-mt-10 rounded-t-[1.75rem] bg-[#F9F6EE] px-4 sm:px-6 pt-8 pb-2 shadow-[0_-10px_36px_rgba(28,25,23,0.06)] border-t border-stone-200/40">
        <div className="max-w-[40rem] mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="rounded-full bg-stone-800 text-[#F5F0E6] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5">
              {dev.titulo}
            </span>
            <span className="rounded-full bg-stone-200/95 text-stone-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5">
              {tema.titulo}
            </span>
            <span className="rounded-full bg-white border border-stone-300/90 text-stone-600 text-[10px] font-bold px-3 py-1.5">
              ~{minutos} min
            </span>
          </div>
          <DevocionalTituloLectura
            titulo={lectura.titulo}
            variant="reading"
            className="mb-1"
          />

          {/* Descripción general de la lectura */}
          {lectura.descripcion?.trim() ? (
            <div className="mt-6 rounded-2xl bg-white border border-stone-200/90 p-5 sm:p-7 shadow-[0_2px_20px_rgba(28,25,23,0.04)]">
              <DevocionalCuerpoLectura
                texto={lectura.descripcion}
                variant="reading"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Contenido de pasos: descripción + versículos */}
      {pasosOrdenados.length > 0 && (
        <div className="px-4 sm:px-6 mt-8 space-y-10 max-w-[40rem] mx-auto">
          {pasosOrdenados.map((paso, idx) => {
            const tieneContenido =
              paso.descripcion?.trim() || paso.versiculos?.length > 0;
            if (!tieneContenido) return null;
            return (
              <div key={paso.id} className="space-y-4">
                {/* Título del paso si hay varios */}
                {pasosOrdenados.length > 1 && paso.titulo?.trim() ? (
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-800 text-[#FAF7F0] text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                      {paso.titulo}
                    </h2>
                  </div>
                ) : null}

                {/* Descripción del paso */}
                {paso.descripcion?.trim() ? (
                  <DevocionalCuerpoLectura
                    texto={paso.descripcion}
                    variant="reading"
                  />
                ) : null}

                {/* Versículos bíblicos del paso */}
                {paso.versiculos?.length > 0 && (
                  <div className="space-y-3">
                    {paso.versiculos.map((v, vi) => (
                      <DevocionalVersiculoCallout
                        key={v.referencia ?? vi}
                        versiculo={v}
                        variant={vi % 2 === 0 ? "teal" : "amber"}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CTA de sesión */}
      <div className="px-4 sm:px-6 mt-10 space-y-6 max-w-[40rem] mx-auto">
        {error && (
          <div className="rounded-2xl bg-red-50 text-red-800 px-4 py-3 text-sm border border-red-100">
            {error}
          </div>
        )}

        {tieneActividades ? (
          sesionEstaLectura ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-7 shadow-[0_2px_24px_rgba(28,25,23,0.06)] space-y-5">
              <p className="text-base text-stone-600 leading-[1.65]">
                Ya tienes una sesión de actividades para esta lectura. Puedes seguir
                donde la dejaste.
              </p>
              <Link
                href={`/devocionales/sesion/${sesionEstaLectura.id}`}
                className={btnDevocionalPrimario}
              >
                Continuar sesión →
              </Link>
            </div>
          ) : (
            <section className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-7 shadow-[0_2px_24px_rgba(28,25,23,0.06)] space-y-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  Actividades
                </h2>
                <p className="text-base text-stone-600 mt-2 leading-[1.65]">
                  Abre la sesión para responder las preguntas y marcar tu avance.
                </p>
              </div>
              <button
                type="button"
                onClick={iniciarSesion}
                disabled={submitting}
                className={btnDevocionalPrimario}
              >
                {submitting ? "Abriendo…" : "Abrir sesión de actividades"}
              </button>
            </section>
          )
        ) : null}
      </div>
    </div>
  );
}
