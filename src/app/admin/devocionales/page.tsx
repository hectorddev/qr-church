"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  ApiResponse,
  CrearDevocionalData,
  Devocional,
  DevocionalCampo,
  DevocionalPaso,
  DevocionalPregunta,
  DevocionalVersiculo,
  LecturaDia,
  TemaDevocional,
} from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function pasoVacio(orden: number): DevocionalPaso {
  return {
    id: genId("paso"),
    orden,
    titulo: "",
    descripcion: "",
    reto: "",
    versiculos: [],
    campos: [],
    preguntas: [],
  };
}

function lecturaVacia(orden: number): LecturaDia {
  return {
    id: genId("lec"),
    orden,
    titulo: "",
    descripcion: "",
    fecha_disponible: null,
    pasos: [pasoVacio(0)],
  };
}

function temaVacio(orden: number): TemaDevocional {
  return {
    id: genId("tema"),
    orden,
    titulo: "",
    descripcion: "",
    fecha_activacion: null,
    lecturas: [lecturaVacia(0)],
  };
}

function isoInputDate(d: Date | string | null | undefined): string {
  if (d == null) return "";
  const x = d instanceof Date ? d : new Date(d);
  if (isNaN(x.getTime())) return "";
  return x.toISOString().slice(0, 10);
}

function PasoEditorBlock({
  paso,
  stepTitle,
  onPatch,
  onRemove,
  canRemove,
}: {
  paso: DevocionalPaso;
  stepTitle: string;
  onPatch: (p: Partial<DevocionalPaso>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50/50">
      <div className="flex justify-between gap-2">
        <span className="text-sm font-semibold text-slate-700">{stepTitle}</span>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="text-xs text-red-600 disabled:opacity-40"
        >
          Quitar paso
        </button>
      </div>
      <input
        placeholder="Título del paso"
        className="w-full border rounded px-2 py-1 text-sm"
        value={paso.titulo}
        onChange={(e) => onPatch({ titulo: e.target.value })}
      />
      <textarea
        placeholder="Descripción (opcional)"
        className="w-full border rounded px-2 py-1 text-sm min-h-[50px]"
        value={paso.descripcion ?? ""}
        onChange={(e) => onPatch({ descripcion: e.target.value })}
      />
      <p className="text-[11px] text-amber-950/90 bg-amber-50 border border-amber-200/80 rounded-md px-2.5 py-2 leading-snug">
        En la app, la descripción y los versículos del paso no aparecen en la
        pantalla de actividades. Coloca el texto de lectura principal en cada{" "}
        <strong>lectura del día</strong>. El <strong>reto</strong> sí se muestra
        en actividades.
      </p>
      <div className="rounded-md border border-emerald-200/90 bg-emerald-50/60 p-3 space-y-2">
        <p className="text-xs font-semibold text-emerald-900">Reto</p>
        <p className="text-[11px] text-emerald-900/85 leading-snug">
          Instrucción práctica (canción, acción, tiempo a solas…). Aparece en la
          sesión con el título &quot;Reto&quot;, antes de campos y preguntas.
        </p>
        <textarea
          placeholder="Ej. Dedica 10 minutos escuchando… / Escribe a alguien…"
          className="w-full border border-emerald-200 rounded px-2 py-2 text-sm min-h-[72px] bg-white"
          value={paso.reto ?? ""}
          onChange={(e) => onPatch({ reto: e.target.value })}
        />
      </div>
      <label className="block text-xs">
        Orden
        <input
          type="number"
          className="ml-2 w-20 border rounded px-2 py-1"
          value={paso.orden}
          onChange={(e) =>
            onPatch({ orden: parseInt(e.target.value, 10) || 0 })
          }
        />
      </label>

      <div>
        <p className="text-xs font-medium text-slate-600 mb-1">Versículos</p>
        {paso.versiculos.map((v, vi) => (
          <div key={vi} className="flex gap-1 mb-1">
            <input
              placeholder="Referencia (ej. Juan 3:16)"
              className="flex-1 border rounded px-2 py-1 text-xs"
              value={v.referencia}
              onChange={(e) => {
                const vers = [...paso.versiculos];
                vers[vi] = { ...vers[vi], referencia: e.target.value };
                onPatch({ versiculos: vers });
              }}
            />
            <input
              placeholder="Texto (opc.)"
              className="flex-1 border rounded px-2 py-1 text-xs"
              value={v.texto ?? ""}
              onChange={(e) => {
                const vers = [...paso.versiculos];
                vers[vi] = { ...vers[vi], texto: e.target.value };
                onPatch({ versiculos: vers });
              }}
            />
            <button
              type="button"
              className="text-red-500 text-xs px-1"
              onClick={() => {
                onPatch({
                  versiculos: paso.versiculos.filter((_, i) => i !== vi),
                });
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs text-indigo-600"
          onClick={() => {
            const v: DevocionalVersiculo = { referencia: "", texto: "" };
            onPatch({ versiculos: [...paso.versiculos, v] });
          }}
        >
          + Versículo
        </button>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-600 mb-1">
          Campos (llenar información)
        </p>
        {paso.campos.map((c, ci) => (
          <div
            key={c.id}
            className="flex flex-wrap gap-1 mb-1 items-center"
          >
            <input
              placeholder="Etiqueta"
              className="flex-1 min-w-[120px] border rounded px-2 py-1 text-xs"
              value={c.etiqueta}
              onChange={(e) => {
                const campos = [...paso.campos];
                campos[ci] = { ...campos[ci], etiqueta: e.target.value };
                onPatch({ campos });
              }}
            />
            <select
              className="border rounded px-2 py-1 text-xs"
              value={c.tipo}
              onChange={(e) => {
                const campos = [...paso.campos];
                campos[ci] = {
                  ...campos[ci],
                  tipo: e.target.value as DevocionalCampo["tipo"],
                };
                onPatch({ campos });
              }}
            >
              <option value="texto">texto</option>
              <option value="textarea">textarea</option>
            </select>
            <button
              type="button"
              className="text-red-500 text-xs"
              onClick={() => {
                onPatch({
                  campos: paso.campos.filter((_, i) => i !== ci),
                });
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs text-indigo-600"
          onClick={() => {
            const c: DevocionalCampo = {
              id: genId("campo"),
              etiqueta: "",
              tipo: "texto",
            };
            onPatch({ campos: [...paso.campos, c] });
          }}
        >
          + Campo
        </button>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-600 mb-1">Preguntas</p>
        {paso.preguntas.map((pr, pri) => (
          <div
            key={pr.id}
            className="border border-slate-200 rounded p-2 mb-2 bg-white text-xs space-y-2"
          >
            <div className="flex justify-between">
              <span className="font-medium">
                {pr.tipo === "reflexiva" ? "Reflexiva" : "Puntuación"}
              </span>
              <button
                type="button"
                className="text-red-500"
                onClick={() => {
                  onPatch({
                    preguntas: paso.preguntas.filter((_, i) => i !== pri),
                  });
                }}
              >
                ×
              </button>
            </div>
            <textarea
              placeholder="Texto de la pregunta"
              className="w-full border rounded px-2 py-1"
              value={pr.texto}
              onChange={(e) => {
                const preguntas = [...paso.preguntas];
                preguntas[pri] = {
                  ...preguntas[pri],
                  texto: e.target.value,
                } as DevocionalPregunta;
                onPatch({ preguntas });
              }}
            />
            {pr.tipo === "puntuacion" && (
              <>
                <div className="space-y-1">
                  {pr.opciones.map((op, oi) => (
                    <div key={op.id} className="flex gap-1 items-center">
                      <input
                        className="flex-1 border rounded px-2 py-1"
                        value={op.texto}
                        onChange={(e) => {
                          const preguntas = [...paso.preguntas];
                          const p = preguntas[pri];
                          if (p.tipo !== "puntuacion") return;
                          const opciones = [...p.opciones];
                          opciones[oi] = {
                            ...opciones[oi],
                            texto: e.target.value,
                          };
                          preguntas[pri] = { ...p, opciones };
                          onPatch({ preguntas });
                        }}
                      />
                      <label className="flex items-center gap-1 whitespace-nowrap">
                        <input
                          type="radio"
                          name={`ok-${paso.id}-${pr.id}`}
                          checked={pr.opcion_correcta_id === op.id}
                          onChange={() => {
                            const preguntas = [...paso.preguntas];
                            const p = preguntas[pri];
                            if (p.tipo !== "puntuacion") return;
                            preguntas[pri] = {
                              ...p,
                              opcion_correcta_id: op.id,
                            };
                            onPatch({ preguntas });
                          }}
                        />
                        OK
                      </label>
                      <button
                        type="button"
                        className="text-red-500"
                        onClick={() => {
                          const preguntas = [...paso.preguntas];
                          const p = preguntas[pri];
                          if (p.tipo !== "puntuacion") return;
                          const opciones = p.opciones.filter((_, i) => i !== oi);
                          let opcion_correcta_id = p.opcion_correcta_id;
                          if (opcion_correcta_id === op.id) {
                            opcion_correcta_id = opciones[0]?.id ?? "";
                          }
                          preguntas[pri] = {
                            ...p,
                            opciones,
                            opcion_correcta_id,
                          };
                          onPatch({ preguntas });
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-indigo-600"
                  onClick={() => {
                    const preguntas = [...paso.preguntas];
                    const p = preguntas[pri];
                    if (p.tipo !== "puntuacion") return;
                    const nid = genId("op");
                    const opciones = [...p.opciones, { id: nid, texto: "" }];
                    preguntas[pri] = {
                      ...p,
                      opciones,
                      opcion_correcta_id: p.opcion_correcta_id || nid,
                    };
                    onPatch({ preguntas });
                  }}
                >
                  + Opción
                </button>
                <label className="flex items-center gap-2">
                  Puntos si acierta
                  <input
                    type="number"
                    className="w-16 border rounded px-1"
                    value={pr.puntos ?? 1}
                    onChange={(e) => {
                      const preguntas = [...paso.preguntas];
                      const p = preguntas[pri];
                      if (p.tipo !== "puntuacion") return;
                      preguntas[pri] = {
                        ...p,
                        puntos: parseInt(e.target.value, 10) || 1,
                      };
                      onPatch({ preguntas });
                    }}
                  />
                </label>
              </>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button
            type="button"
            className="text-xs text-indigo-600"
            onClick={() => {
              const q: DevocionalPregunta = {
                id: genId("pr"),
                tipo: "reflexiva",
                texto: "",
              };
              onPatch({ preguntas: [...paso.preguntas, q] });
            }}
          >
            + Reflexiva
          </button>
          <button
            type="button"
            className="text-xs text-indigo-600"
            onClick={() => {
              const oid = genId("op");
              const q: DevocionalPregunta = {
                id: genId("pr"),
                tipo: "puntuacion",
                texto: "",
                opciones: [
                  { id: oid, texto: "Opción A" },
                  { id: genId("op"), texto: "Opción B" },
                ],
                opcion_correcta_id: oid,
                puntos: 1,
              };
              onPatch({ preguntas: [...paso.preguntas, q] });
            }}
          >
            + Puntuación
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDevocionalesPage() {
  const { isAdmin, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [lista, setLista] = useState<Devocional[]>([]);
  const [editingId, setEditingId] = useState<string | "nuevo" | null>(null);
  const [form, setForm] = useState<CrearDevocionalData>({
    titulo: "",
    descripcion: "",
    imagen_url: "",
    activo: true,
    orden: 0,
    duracion_tema_dias: 7,
    fecha_inicio_programa: null,
    temas: [temaVacio(0)],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push("/login");
  }, [isAuthenticated, isAdmin, isLoading, router]);

  const cargarLista = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/devocionales?todos=1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data: ApiResponse<Devocional[]> = await res.json();
    if (data.success && data.data) setLista(data.data);
  }, [token]);

  useEffect(() => {
    if (!isAdmin || !token) return;
    (async () => {
      try {
        setLoading(true);
        await cargarLista();
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin, token, cargarLista]);

  const resetNuevo = () => {
    setEditingId("nuevo");
    setForm({
      titulo: "",
      descripcion: "",
      imagen_url: "",
      activo: true,
      orden: 0,
      duracion_tema_dias: 7,
      fecha_inicio_programa: null,
      temas: [temaVacio(0)],
    });
    setError(null);
  };

  const editar = async (id: string) => {
    if (!token) return;
    setError(null);
    const res = await fetch(`/api/devocionales/${id}?completo=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data: ApiResponse<Devocional> = await res.json();
    if (!data.success || !data.data) {
      setError(data.error || "Error");
      return;
    }
    const d = data.data;
    setEditingId(id);
    setForm({
      titulo: d.titulo,
      descripcion: d.descripcion,
      imagen_url: d.imagen_url ?? "",
      activo: d.activo,
      orden: d.orden,
      duracion_tema_dias: d.duracion_tema_dias,
      fecha_inicio_programa: d.fecha_inicio_programa
        ? isoInputDate(d.fecha_inicio_programa)
        : null,
      temas:
        d.temas?.length > 0
          ? JSON.parse(JSON.stringify(d.temas)) as TemaDevocional[]
          : [temaVacio(0)],
    });
  };

  const guardar = async () => {
    if (!token || editingId === null) return;
    setSaving(true);
    setError(null);
    try {
      const payload: CrearDevocionalData = {
        ...form,
        fecha_inicio_programa: form.fecha_inicio_programa
          ? (typeof form.fecha_inicio_programa === "string"
              ? form.fecha_inicio_programa
              : isoInputDate(form.fecha_inicio_programa as Date))
          : null,
      };
      const url =
        editingId === "nuevo"
          ? "/api/devocionales"
          : `/api/devocionales/${editingId}`;
      const method = editingId === "nuevo" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data: ApiResponse<Devocional> = await res.json();
      if (!data.success) throw new Error(data.error || "Error");
      await cargarLista();
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id: string) => {
    if (!token || !confirm("¿Eliminar este devocional?")) return;
    const res = await fetch(`/api/devocionales/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data: ApiResponse<unknown> = await res.json();
    if (!data.success) {
      setError(data.error || "No se pudo eliminar");
      return;
    }
    await cargarLista();
    if (editingId === id) setEditingId(null);
  };

  const updatePaso = (
    ti: number,
    li: number,
    pi: number,
    p: Partial<DevocionalPaso>
  ) => {
    setForm((f) => {
      const temas = f.temas.map((t, i) =>
        i !== ti
          ? t
          : {
              ...t,
              lecturas: t.lecturas.map((l, j) =>
                j !== li
                  ? l
                  : {
                      ...l,
                      pasos: l.pasos.map((paso, k) =>
                        k !== pi ? paso : { ...paso, ...p }
                      ),
                    }
              ),
            }
      );
      return { ...f, temas };
    });
  };

  const addPaso = (ti: number, li: number) => {
    setForm((f) => {
      const temas = f.temas.map((t, i) => {
        if (i !== ti) return t;
        const lecturas = t.lecturas.map((l, j) => {
          if (j !== li) return l;
          return {
            ...l,
            pasos: [...l.pasos, pasoVacio(l.pasos.length)],
          };
        });
        return { ...t, lecturas };
      });
      return { ...f, temas };
    });
  };

  const removePaso = (ti: number, li: number, pi: number) => {
    setForm((f) => {
      const temas = f.temas.map((t, i) => {
        if (i !== ti) return t;
        const lecturas = t.lecturas.map((l, j) => {
          if (j !== li) return l;
          if (l.pasos.length <= 1) return l;
          return { ...l, pasos: l.pasos.filter((_, k) => k !== pi) };
        });
        return { ...t, lecturas };
      });
      return { ...f, temas };
    });
  };

  const updateLectura = (
    ti: number,
    li: number,
    patch: Partial<LecturaDia>
  ) => {
    setForm((f) => {
      const temas = f.temas.map((t, i) =>
        i !== ti
          ? t
          : {
              ...t,
              lecturas: t.lecturas.map((l, j) =>
                j !== li ? l : { ...l, ...patch }
              ),
            }
      );
      return { ...f, temas };
    });
  };

  const addLectura = (ti: number) => {
    setForm((f) => {
      const temas = f.temas.map((t, i) =>
        i !== ti
          ? t
          : {
              ...t,
              lecturas: [...t.lecturas, lecturaVacia(t.lecturas.length)],
            }
      );
      return { ...f, temas };
    });
  };

  const removeLectura = (ti: number, li: number) => {
    setForm((f) => {
      const temas = f.temas.map((t, i) => {
        if (i !== ti) return t;
        if (t.lecturas.length <= 1) return t;
        return { ...t, lecturas: t.lecturas.filter((_, j) => j !== li) };
      });
      return { ...f, temas };
    });
  };

  const updateTema = (ti: number, patch: Partial<TemaDevocional>) => {
    setForm((f) => ({
      ...f,
      temas: f.temas.map((t, i) => (i !== ti ? t : { ...t, ...patch })),
    }));
  };

  const addTema = () => {
    setForm((f) => ({
      ...f,
      temas: [...f.temas, temaVacio(f.temas.length)],
    }));
  };

  const removeTema = (ti: number) => {
    setForm((f) => {
      if (f.temas.length <= 1) return f;
      return { ...f, temas: f.temas.filter((_, i) => i !== ti) };
    });
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-slate-900 mb-2">
        Admin · Devocionales
      </h1>
      <p className="text-slate-600 text-sm mb-6">
        Programa con <strong>temas</strong> (bloques en el tiempo, p. ej. una
        semana), <strong>lecturas</strong> dentro de cada tema y{" "}
        <strong>pasos</strong> con versículos, campos y preguntas.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-800 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={resetNuevo}
          className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold"
        >
          Nuevo devocional
        </button>
        <button
          type="button"
          onClick={() => router.push("/devocionales")}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
        >
          Ver como usuario
        </button>
      </div>

      {loading ? (
        <p className="text-slate-600">Cargando…</p>
      ) : (
        <ul className="space-y-2 mb-8">
          {lista.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap justify-between gap-2 items-center bg-white rounded-lg border border-slate-200 px-3 py-2"
            >
              <span className="font-medium text-slate-800">
                {d.titulo}{" "}
                {!d.activo && (
                  <span className="text-xs text-amber-600">(inactivo)</span>
                )}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => editar(d.id)}
                  className="text-sm text-indigo-600 underline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => eliminar(d.id)}
                  className="text-sm text-red-600 underline"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingId !== null && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-sm">
          <h2 className="font-bold text-lg text-slate-900">
            {editingId === "nuevo" ? "Crear" : "Editar"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-600">Título</span>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={form.titulo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titulo: e.target.value }))
                }
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-600">
                Descripción (presentación del programa)
              </span>
              <textarea
                className="mt-1 w-full border rounded-lg px-3 py-2 min-h-[80px]"
                value={form.descripcion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descripcion: e.target.value }))
                }
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-600">
                URL imagen de portada del programa (opcional)
              </span>
              <input
                type="url"
                placeholder="https://…"
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={form.imagen_url ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imagen_url: e.target.value }))
                }
              />
              <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                En textos puedes usar{" "}
                <code className="bg-slate-100 px-1 rounded">**palabra**</code>{" "}
                para resaltar.
              </p>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">
                Días por tema (por defecto)
              </span>
              <input
                type="number"
                min={1}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={form.duracion_tema_dias ?? 7}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    duracion_tema_dias: Math.max(
                      1,
                      parseInt(e.target.value, 10) || 7
                    ),
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">
                Inicio del calendario del programa
              </span>
              <input
                type="date"
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={isoInputDate(form.fecha_inicio_programa ?? undefined)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    fecha_inicio_programa: e.target.value || null,
                  }))
                }
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Calendario por defecto si un tema no tiene su propia{" "}
                <strong>fecha de activación</strong>.
              </p>
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, activo: e.target.checked }))
                }
              />
              <span className="text-sm">Activo (visible en lista pública)</span>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Orden</span>
              <input
                type="number"
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={form.orden}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    orden: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </label>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Temas</h3>
              <button
                type="button"
                onClick={addTema}
                className="text-sm text-indigo-600 font-medium"
              >
                + Tema
              </button>
            </div>

            {form.temas.map((tema, ti) => (
              <div
                key={tema.id}
                className="border-2 border-indigo-100 rounded-xl p-4 space-y-4 bg-indigo-50/30"
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-indigo-900">
                    Tema {ti + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTema(ti)}
                    disabled={form.temas.length <= 1}
                    className="text-xs text-red-600 disabled:opacity-40"
                  >
                    Quitar tema
                  </button>
                </div>
                <label className="block text-xs">
                  Id (no cambiar si ya hay usuarios con sesiones)
                  <input
                    className="mt-1 w-full border rounded px-2 py-1 font-mono text-xs"
                    value={tema.id}
                    onChange={(e) => updateTema(ti, { id: e.target.value })}
                  />
                </label>
                <input
                  placeholder="Título del tema (se muestra como «semana actual»)"
                  className="w-full border rounded-lg px-3 py-2 text-sm font-medium"
                  value={tema.titulo}
                  onChange={(e) => updateTema(ti, { titulo: e.target.value })}
                />
                <textarea
                  placeholder="Descripción del tema (opcional)"
                  className="w-full border rounded-lg px-3 py-2 text-sm min-h-[60px]"
                  value={tema.descripcion}
                  onChange={(e) =>
                    updateTema(ti, { descripcion: e.target.value })
                  }
                />
                <label className="block text-xs">
                  URL imagen del tema (opcional; si no hay, usa la del programa)
                  <input
                    type="url"
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                    value={tema.imagen_url ?? ""}
                    onChange={(e) =>
                      updateTema(ti, { imagen_url: e.target.value || undefined })
                    }
                  />
                </label>
                <label className="block text-xs">
                  Duración de este tema en días (vacío = usar días por tema del
                  programa)
                  <input
                    type="number"
                    min={1}
                    placeholder={`${form.duracion_tema_dias ?? 7}`}
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                    value={tema.duracion_dias ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateTema(ti, {
                        duracion_dias: v
                          ? Math.max(1, parseInt(v, 10) || 1)
                          : undefined,
                      });
                    }}
                  />
                </label>
                <label className="block text-xs">
                  <span className="font-semibold text-indigo-900">
                    Fecha de activación del tema
                  </span>
                  <input
                    type="date"
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                    value={isoInputDate(tema.fecha_activacion ?? undefined)}
                    onChange={(e) =>
                      updateTema(ti, {
                        fecha_activacion: e.target.value || null,
                      })
                    }
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Desde este día el tema se desbloquea en el programa. Si lo
                    dejas vacío, se usa la fecha de inicio del programa + la
                    duración de los temas anteriores.
                  </p>
                </label>
                <label className="block text-xs">
                  Orden
                  <input
                    type="number"
                    className="mt-1 w-20 border rounded px-2 py-1"
                    value={tema.orden}
                    onChange={(e) =>
                      updateTema(ti, {
                        orden: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </label>

                <div className="border-t border-indigo-100 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-slate-800">
                      Lecturas en este tema
                    </h4>
                    <button
                      type="button"
                      onClick={() => addLectura(ti)}
                      className="text-xs text-indigo-600 font-medium"
                    >
                      + Lectura
                    </button>
                  </div>

                  {tema.lecturas.map((lec, li) => (
                    <div
                      key={lec.id}
                      className="border border-slate-200 rounded-lg p-3 space-y-3 bg-white"
                    >
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-slate-700">
                          Lectura {li + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLectura(ti, li)}
                          disabled={tema.lecturas.length <= 1}
                          className="text-xs text-red-600 disabled:opacity-40"
                        >
                          Quitar lectura
                        </button>
                      </div>
                      <label className="block text-xs font-mono">
                        Id lectura
                        <input
                          className="mt-1 w-full border rounded px-2 py-1"
                          value={lec.id}
                          onChange={(e) =>
                            updateLectura(ti, li, { id: e.target.value })
                          }
                        />
                      </label>
                      <input
                        placeholder="Título (tarjeta y cabecera del día)"
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={lec.titulo}
                        onChange={(e) =>
                          updateLectura(ti, li, { titulo: e.target.value })
                        }
                      />
                      <textarea
                        placeholder="Descripción breve (vista previa en grid)"
                        className="w-full border rounded px-2 py-1 text-sm min-h-[50px]"
                        value={lec.descripcion}
                        onChange={(e) =>
                          updateLectura(ti, li, { descripcion: e.target.value })
                        }
                      />
                      <label className="block text-xs">
                        Imagen de la lectura (opcional)
                        <input
                          type="url"
                          className="mt-1 w-full border rounded px-2 py-1 text-sm"
                          value={lec.imagen_url ?? ""}
                          onChange={(e) =>
                            updateLectura(ti, li, {
                              imagen_url: e.target.value || undefined,
                            })
                          }
                        />
                      </label>
                      <label className="block text-xs">
                        Minutos de lectura (opcional; si vacío se estima)
                        <input
                          type="number"
                          min={0}
                          className="mt-1 w-full border rounded px-2 py-1 text-sm"
                          value={lec.minutos_lectura ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateLectura(ti, li, {
                              minutos_lectura: v
                                ? Math.max(0, parseInt(v, 10) || 0)
                                : undefined,
                            });
                          }}
                        />
                      </label>
                      <label className="block text-xs">
                        Fecha en que se desbloquea esta lectura (opcional)
                        <input
                          type="date"
                          className="mt-1 w-full border rounded px-2 py-1 text-sm"
                          value={isoInputDate(lec.fecha_disponible ?? undefined)}
                          onChange={(e) =>
                            updateLectura(ti, li, {
                              fecha_disponible: e.target.value || null,
                            })
                          }
                        />
                        <p className="mt-1 text-[11px] text-slate-500">
                          Si está vacío: inicio del tema + tantos días como su
                          campo <strong>Orden</strong>. Además debe cumplirse
                          completar la lectura anterior al 100%.
                        </p>
                      </label>
                      <label className="block text-xs">
                        Orden
                        <input
                          type="number"
                          className="mt-1 w-20 border rounded px-2 py-1"
                          value={lec.orden}
                          onChange={(e) =>
                            updateLectura(ti, li, {
                              orden: parseInt(e.target.value, 10) || 0,
                            })
                          }
                        />
                      </label>

                      <div className="border-t pt-3 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-600">
                            Pasos
                          </span>
                          <button
                            type="button"
                            onClick={() => addPaso(ti, li)}
                            className="text-xs text-indigo-600"
                          >
                            + Paso
                          </button>
                        </div>
                        {lec.pasos.map((paso, pi) => (
                          <PasoEditorBlock
                            key={paso.id}
                            paso={paso}
                            stepTitle={`Paso ${pi + 1}`}
                            onPatch={(p) => updatePaso(ti, li, pi, p)}
                            onRemove={() => removePaso(ti, li, pi)}
                            canRemove={lec.pasos.length > 1}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={guardar}
              disabled={saving}
              className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
