"use client";

import type { DevocionalVersiculo } from "@/lib/types";
import React from "react";

/** Trozos entre **resaltado** (sin anidar). */
function splitHighlights(text: string): { plain: boolean; text: string }[] {
  if (!text) return [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts
    .filter(Boolean)
    .map((p) =>
      p.startsWith("**") && p.endsWith("**")
        ? { plain: false, text: p.slice(2, -2) }
        : { plain: true, text: p }
    );
}

/** Título: palabras entre ** ** en tono ámbar (referencia al diseño). */
export function DevocionalTituloLectura({
  titulo,
  as: Tag = "h1",
  className = "",
  variant = "page",
}: {
  titulo: string;
  as?: "h1" | "h2";
  className?: string;
  /** card: listas y vistas compactas · reading: intro del día, grande en móvil */
  variant?: "page" | "card" | "reading";
}) {
  const chunks = splitHighlights(titulo);
  const size =
    variant === "reading"
      ? "text-[1.875rem] sm:text-[2.25rem] leading-[1.12]"
      : Tag === "h1"
        ? "text-[1.65rem] sm:text-3xl"
        : variant === "card"
          ? "text-[1.08rem] sm:text-xl mt-0"
          : "text-xl sm:text-2xl mt-8 first:mt-0";
  return (
    <Tag
      className={`font-serif ${size} leading-tight text-stone-900 tracking-tight ${className}`}
    >
      {chunks.map((c, i) =>
        c.plain ? (
          <span key={i}>{c.text}</span>
        ) : (
          <span
            key={i}
            className={
              variant === "reading"
                ? "text-amber-800/95 font-semibold"
                : "text-amber-600 font-semibold"
            }
          >
            {c.text}
          </span>
        )
      )}
    </Tag>
  );
}

/** Párrafos: **texto** con fondo aguamarina suave. */
export function DevocionalCuerpoLectura({
  texto,
  variant = "default",
}: {
  texto: string;
  /** reading: día · programa: portada del programa, aún más grande en móvil */
  variant?: "default" | "reading" | "programa";
}) {
  if (!texto.trim()) return null;
  const blocks = texto.split(/\n\n+/);
  const bodyClass =
    variant === "programa"
      ? "space-y-6 text-[1.22rem] sm:text-[1.35rem] leading-[1.72] text-stone-900"
      : variant === "reading"
        ? "space-y-5 text-[1.125rem] sm:text-lg leading-[1.7] text-stone-800"
        : "space-y-4 text-[0.95rem] sm:text-base leading-relaxed text-stone-800";
  const highlightClass =
    variant === "programa"
      ? "rounded-md px-1.5 py-0.5 bg-amber-100/90 text-amber-950 font-semibold"
      : variant === "reading"
        ? "rounded-md px-1.5 py-0.5 bg-[#e8e0d4] text-stone-900 font-medium"
        : "rounded px-1 py-0.5 bg-[#b2dfdb]/90 text-stone-900 font-medium";
  return (
    <div className={bodyClass}>
      {blocks.map((block, bi) => (
        <p key={bi} className="whitespace-pre-wrap">
          {splitHighlights(block).map((c, i) =>
            c.plain ? (
              <span key={i}>{c.text}</span>
            ) : (
              <span key={i} className={highlightClass}>
                {c.text}
              </span>
            )
          )}
        </p>
      ))}
    </div>
  );
}

export function DevocionalVersiculoCallout({
  versiculo,
  variant,
}: {
  versiculo: DevocionalVersiculo;
  variant: "teal" | "amber";
}) {
  const isTeal = variant === "teal";
  const bg = isTeal ? "bg-[#D1F2EB]" : "bg-[#FDEBD0]";
  const quoteColor = isTeal ? "text-[#2a9d8f]" : "text-amber-600";
  const quotePos = isTeal
    ? "top-1 left-2 text-[4.5rem] leading-none"
    : "bottom-0 right-2 text-[4.5rem] leading-none translate-y-2";

  return (
    <div
      className={`relative rounded-2xl ${bg} px-5 py-6 sm:px-6 sm:py-7 overflow-hidden shadow-sm`}
    >
      <span
        className={`absolute font-serif ${quoteColor} opacity-35 pointer-events-none select-none ${quotePos}`}
        aria-hidden
      >
        “
      </span>
      <blockquote className="relative z-10 font-serif text-[1.05rem] sm:text-lg text-stone-900 leading-snug pl-1">
        {versiculo.texto?.trim() ? (
          <>
            <span>{versiculo.texto}</span>
            {versiculo.referencia ? (
              <cite className="mt-3 block not-italic text-sm font-sans font-semibold text-stone-700">
                {versiculo.referencia}
              </cite>
            ) : null}
          </>
        ) : versiculo.referencia ? (
          <cite className="not-italic font-sans font-semibold text-stone-800">
            {versiculo.referencia}
          </cite>
        ) : null}
      </blockquote>
    </div>
  );
}

export function DevocionalSeccionTitulo({
  children,
  className = "",
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3";
}) {
  return (
    <Tag
      className={`font-sans text-lg sm:text-xl font-bold text-stone-900 tracking-tight mt-10 mb-4 first:mt-0 ${className}`}
    >
      {children}
    </Tag>
  );
}

export function DevocionalPreguntaReflexionCard({
  pregunta,
  value,
  onChange,
  disabled,
  placeholder = "Escribe tu respuesta…",
}: {
  pregunta: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm">
      <p className="text-[0.95rem] sm:text-base font-medium text-stone-900 mb-3">
        {pregunta}
      </p>
      <textarea
        className="w-full min-h-[100px] rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-3 text-[0.95rem] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#4DB6AC]/50 focus:border-[#4DB6AC] resize-y disabled:opacity-50"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

export function DevocionalPreguntaTestCard({
  pregunta,
  groupName,
  opciones,
  selectedId,
  onSelect,
  disabled,
  puntos,
}: {
  pregunta: string;
  groupName: string;
  opciones: { id: string; texto: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  puntos?: number;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm">
      <p className="text-[0.95rem] sm:text-base font-medium text-stone-900 mb-3">
        {pregunta}
      </p>
      <ul className="space-y-2.5">
        {opciones.map((op) => (
          <li key={op.id}>
            <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-transparent px-2 py-2 has-[:checked]:border-[#4DB6AC]/40 has-[:checked]:bg-[#D1F2EB]/40">
              <input
                type="radio"
                name={groupName}
                className="mt-1 accent-[#4DB6AC]"
                checked={selectedId === op.id}
                onChange={() => onSelect(op.id)}
                disabled={disabled}
              />
              <span className="text-[0.95rem] text-stone-800 leading-snug">
                {op.texto}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {puntos != null && (
        <p className="text-xs text-stone-500 mt-2">{puntos} pt. si aciertas</p>
      )}
    </div>
  );
}

export function DevocionalCampoCard({
  etiqueta,
  tipo,
  value,
  onChange,
  disabled,
}: {
  etiqueta: string;
  tipo: "texto" | "textarea";
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-sm">
      <label className="block text-[0.95rem] font-medium text-stone-900 mb-2">
        {etiqueta}
      </label>
      {tipo === "textarea" ? (
        <textarea
          className="w-full min-h-[88px] rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-3 text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#4DB6AC]/50 disabled:opacity-50"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      ) : (
        <input
          type="text"
          className="w-full rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-3 text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#4DB6AC]/50 disabled:opacity-50"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
    </div>
  );
}
