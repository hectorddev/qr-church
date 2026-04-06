"use client";

import { DevocionalTituloLectura } from "@/components/devocionales/DevocionalReadingUI";
import { useAuth } from "@/contexts/AuthContext";
import { DEVOCIONAL_IMAGEN_TEMA_PRINCIPAL } from "@/lib/devocionales-assets";
import { ApiResponse, Devocional } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function contarLecturas(d: Devocional): number {
  return d.temas.reduce((n, t) => n + (t.lecturas?.length ?? 0), 0);
}

export default function DevocionalesPage() {
  const { isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [lista, setLista] = useState<Devocional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        const r1 = await fetch("/api/devocionales", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d1: ApiResponse<Devocional[]> = await r1.json();
        if (d1.success && d1.data) setLista(d1.data);
        else throw new Error(d1.error || "Error al cargar");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="py-20 text-center text-stone-600 font-medium">
        Cargando…
      </div>
    );
  }

  return (
    <div className="py-5 space-y-8">
      <header className="px-0.5">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          Devocionales
        </h1>
        <p className="text-stone-600 mt-2 text-[0.95rem] leading-relaxed">
          Programas por temas: lee el texto en la pantalla del día y, en la
          sesión, responde campos y preguntas para avanzar el progreso.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl bg-red-50 text-red-800 px-4 py-3 text-sm border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-stone-500 text-center py-8">Cargando…</p>
      ) : lista.length === 0 ? (
        <p className="text-stone-600 text-[0.95rem] leading-relaxed">
          Aún no hay devocionales. Un administrador puede publicarlos desde el
          panel.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {lista.map((d) => {
            const nTemas = d.temas?.length ?? 0;
            const nLec = contarLecturas(d);
            const portada =
              d.imagen_url || DEVOCIONAL_IMAGEN_TEMA_PRINCIPAL;
            const plainPreview = d.descripcion
              .replace(/\*\*([^*]+)\*\*/g, "$1")
              .trim();
            return (
              <li key={d.id}>
                <Link
                  href={`/devocionales/${d.id}`}
                  className="flex flex-col h-full rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-md shadow-stone-900/5 hover:border-[#4DB6AC]/40 hover:shadow-lg transition-all"
                >
                  <div className="aspect-[16/10] w-full bg-gradient-to-br from-[#2a9d8f] to-[#264653]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={portada}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1 min-h-0">
                    <DevocionalTituloLectura
                      titulo={d.titulo}
                      as="h2"
                      variant="card"
                      className="line-clamp-2"
                    />
                    {plainPreview ? (
                      <p className="text-sm text-stone-600 mt-2 line-clamp-3 leading-snug flex-1">
                        {plainPreview}
                      </p>
                    ) : (
                      <div className="flex-1" />
                    )}
                    <span className="inline-flex mt-3 self-start rounded-full bg-[#D1F2EB] px-2.5 py-0.5 text-[11px] font-bold text-[#1d6f64]">
                      {nTemas} tema{nTemas === 1 ? "" : "s"} · {nLec} lectura
                      {nLec === 1 ? "" : "s"}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
