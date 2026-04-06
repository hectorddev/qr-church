
// Configuración de base de datos para producción y desarrollo
import { ensureMongoIndexes, getDb } from "./mongodb";
import {
  CrearPuntoData,
  CrearRetoData,
  CrearUsuarioData,
  PuntoMapa,
  Reto,
  Usuario,
  ReadingPlan,
  PlanChapter,
  UserProgress,
  CreatePlanData,
  CreateChapterData,
  PlanWithProgress,
  Devocional,
  CrearDevocionalData,
  DevocionalSesion,
  TemaDevocional,
  DevocionalProgresoUsuario,
  CrearSesionDevocionalInput,
  GuardarProgresoDevocionalInput,
  ResumenProgresoLecturas,
  LecturaDia,
} from "./types";
import {
  calcularPuntajeDesdeRespuestasPasos,
  contarPasosListosParaProgreso,
} from "./devocionales-utils";
import {
  buscarLecturaPorId,
  buscarTemaPorId,
  docDesdeCrearData,
  lecturaParaSesion,
  normalizarDevocionalDesdeDoc,
  ordenarLecturas,
  pasosDeLectura,
  temaActivo,
} from "./devocionales-model";

// Base de datos MongoDB (Atlas)
class MongoDatabase {
  private async col<T>(name: string) {
    const db = await getDb();
    return db.collection<T>(name);
  }

  // Helpers de mapeo
  private mapPunto(doc: any): PuntoMapa {
    return {
      id: doc.id ?? doc._id,
      nombre: doc.nombre,
      descripcion: doc.descripcion ?? undefined,
      x: typeof doc.x === "number" ? doc.x : parseFloat(doc.x),
      y: typeof doc.y === "number" ? doc.y : parseFloat(doc.y),
      emoji: doc.emoji,
      pointerName: doc.pointerName,
      referencias: doc.referencias ?? undefined,
      año: doc.año ?? undefined,
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    };
  }

  private mapUsuario(doc: any): Usuario {
    return {
      id: doc.id ?? doc._id,
      nombre: doc.nombre,
      versiculo_id: doc.versiculo_id,
      rol: doc.rol,
      puntuacion: typeof doc.puntuacion === "number" ? doc.puntuacion : 0,
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    };
  }

  private mapReto(doc: any): Reto {
    return {
      id: doc.id ?? doc._id,
      titulo: doc.titulo,
      descripcion: doc.descripcion,
      fecha_inicio: doc.fecha_inicio ? new Date(doc.fecha_inicio) : new Date(),
      fecha_fin: doc.fecha_fin ? new Date(doc.fecha_fin) : new Date(),
      activo: doc.activo ?? false,
      video_url: doc.video_url ?? undefined,
      iframe_content: doc.iframe_content ?? undefined,
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    };
  }

  // Puntos
  async crearPunto(data: CrearPuntoData): Promise<PuntoMapa> {
    const id = `punto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const doc = {
      _id: id,
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const col = await this.col<any>("puntos");
    await col.insertOne(doc);
    return this.mapPunto(doc);
  }

  async obtenerPuntos(): Promise<PuntoMapa[]> {
    const col = await this.col<any>("puntos");
    const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((d) => this.mapPunto(d));
  }

  async obtenerPunto(id: string): Promise<PuntoMapa | null> {
    const col = await this.col<any>("puntos");
    const doc = await col.findOne({ _id: id });
    return doc ? this.mapPunto(doc) : null;
  }

  async actualizarPunto(
    id: string,
    data: Partial<CrearPuntoData>
  ): Promise<PuntoMapa | null> {
    const col = await this.col<any>("puntos");
    const updateData: any = {};
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) updateData[k] = v;
    });
    if (Object.keys(updateData).length === 0)
      return await this.obtenerPunto(id);
    updateData.updatedAt = new Date();
    const res = await col.updateOne({ _id: id }, { $set: updateData });
    if (res.matchedCount === 0) return null;
    return await this.obtenerPunto(id);
  }

  async eliminarPunto(id: string): Promise<boolean> {
    const col = await this.col<any>("puntos");
    const res = await col.deleteOne({ _id: id });
    return res.deletedCount === 1;
  }

  async eliminarTodosPuntos(): Promise<number> {
    const col = await this.col<any>("puntos");
    const res = await col.deleteMany({});
    return res.deletedCount ?? 0;
  }

  // Usuarios
  async crearUsuario(data: CrearUsuarioData): Promise<Usuario> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const doc = {
      _id: id,
      id,
      nombre: data.nombre,
      versiculo_id: data.versiculo_id,
      rol: data.rol,
      puntuacion: data.puntuacion ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    const col = await this.col<any>("usuarios");
    await col.insertOne(doc);
    return this.mapUsuario(doc);
  }

  async obtenerUsuarios(): Promise<Usuario[]> {
    try {
      const col = await this.col<any>("usuarios");
      const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
      return docs.map((d) => this.mapUsuario(d));
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      return [];
    }
  }

  async obtenerUsuario(id: string): Promise<Usuario | null> {
    const col = await this.col<any>("usuarios");
    const doc = await col.findOne({ _id: id });
    return doc ? this.mapUsuario(doc) : null;
  }

  async actualizarUsuario(
    id: string,
    data: Partial<CrearUsuarioData>
  ): Promise<Usuario | null> {
    const col = await this.col<any>("usuarios");
    const updateData: any = {};
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) updateData[k] = v;
    });
    if (Object.keys(updateData).length === 0)
      return await this.obtenerUsuario(id);
    updateData.updatedAt = new Date();

    const res = await col.updateOne({ _id: id }, { $set: updateData });
    if (res.matchedCount === 0) return null;
    return await this.obtenerUsuario(id);
  }

  async actualizarPuntuacionUsuario(
    id: string,
    puntuacion: number
  ): Promise<Usuario | null> {
    return this.actualizarUsuario(id, { puntuacion });
  }

  async eliminarUsuario(id: string): Promise<boolean> {
    const col = await this.col<any>("usuarios");
    const res = await col.deleteOne({ _id: id });
    return res.deletedCount === 1;
  }

  // Retos
  async crearReto(data: CrearRetoData): Promise<Reto> {
    const id = Date.now().toString();
    const now = new Date();
    const doc = {
      _id: id,
      id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      activo: data.activo !== undefined ? data.activo : true,
      video_url: data.video_url || undefined,
      iframe_content: data.iframe_content || undefined,
      createdAt: now,
      updatedAt: now,
    };
    const col = await this.col<any>("retos");
    await col.insertOne(doc);
    return this.mapReto(doc);
  }

  async obtenerRetos(): Promise<Reto[]> {
    const col = await this.col<any>("retos");
    const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((d) => this.mapReto(d));
  }

  async obtenerRetosActivos(): Promise<Reto[]> {
    const col = await this.col<any>("retos");
    const docs = await col
      .find({ activo: true })
      .sort({ fecha_inicio: 1 })
      .toArray();
    return docs.map((d) => this.mapReto(d));
  }

  async obtenerReto(id: string): Promise<Reto | null> {
    const col = await this.col<any>("retos");
    const doc = await col.findOne({ _id: id });
    return doc ? this.mapReto(doc) : null;
  }

  async actualizarReto(
    id: string,
    data: Partial<CrearRetoData>
  ): Promise<Reto | null> {
    const col = await this.col<any>("retos");
    const updateData: any = {};
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) {
        if (k === "fecha_inicio" || k === "fecha_fin") {
          updateData[k] = v as Date;
        } else {
          updateData[k] = v;
        }
      }
    });
    if (Object.keys(updateData).length === 0) return await this.obtenerReto(id);
    updateData.updatedAt = new Date();
    const res = await col.updateOne({ _id: id }, { $set: updateData });
    if (res.matchedCount === 0) return null;
    return await this.obtenerReto(id);
  }

  async eliminarReto(id: string): Promise<boolean> {
    const col = await this.col<any>("retos");
    const res = await col.deleteOne({ _id: id });
    return res.deletedCount === 1;
  }

  // --- Reading Plans (Implementación Dummy/Incompleta preservada pero limpia) ---
  // Se recomienda implementar la lógica real de MongoDB aquí cuando sea necesario
  async crearPlanLectura(data: CreatePlanData, userId: string): Promise<ReadingPlan> {
    throw new Error("Implementar en MongoDB");
  }
  async obtenerPlanesLectura(userId: string, filter?: "official" | "my" | "public"): Promise<ReadingPlan[]> {
    return [];
  }
  async obtenerPlanConProgreso(planId: string, userId: string): Promise<PlanWithProgress | null> {
    return null;
  }
  async actualizarPlanLectura(planId: string, data: Partial<CreatePlanData>, userId: string): Promise<ReadingPlan | null> {
    return null;
  }
  async eliminarPlanLectura(planId: string, userId: string): Promise<boolean> {
    return false;
  }
  async marcarCapituloCompletado(chapterId: string, userId: string, completado: boolean): Promise<UserProgress> {
    throw new Error("Implementar en MongoDB");
  }

  private mapSesionDev(doc: any): DevocionalSesion {
    return {
      id: doc.id ?? doc._id,
      devocional_id: doc.devocional_id,
      lectura_id:
        typeof doc.lectura_id === "string" && doc.lectura_id.trim()
          ? doc.lectura_id
          : null,
      modo: doc.modo === "pareja" ? "pareja" : "solo",
      usuario_iniciador_id: doc.usuario_iniciador_id,
      usuario_pareja_id: doc.usuario_pareja_id ?? null,
      estado: doc.estado === "pendiente_pareja" ? "pendiente_pareja" : "activa",
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    };
  }

  private sesionVinculaLectura(
    sesion: DevocionalSesion,
    dev: Devocional,
    lecturaId: string
  ): boolean {
    if (sesion.lectura_id) return sesion.lectura_id === lecturaId;
    const prim = lecturaParaSesion(dev, null);
    return prim?.lectura.id === lecturaId;
  }

  /** Mongo puede devolver valores no string en mapas de respuestas. */
  private normalizeRespuestasDoc(raw: unknown): Record<string, string> {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (v == null) continue;
      out[String(k)] = typeof v === "string" ? v : String(v);
    }
    return out;
  }

  private mapProgresoDev(doc: any): DevocionalProgresoUsuario {
    return {
      id: doc.id ?? doc._id,
      sesion_id: doc.sesion_id,
      user_id: doc.user_id,
      pasos_completados: Array.isArray(doc.pasos_completados)
        ? doc.pasos_completados.map((x: unknown) => String(x))
        : [],
      respuestas_campos: this.normalizeRespuestasDoc(doc.respuestas_campos),
      respuestas_preguntas: this.normalizeRespuestasDoc(
        doc.respuestas_preguntas
      ),
      puntaje_puntuacion:
        typeof doc.puntaje_puntuacion === "number" ? doc.puntaje_puntuacion : 0,
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    };
  }

  /** Si hay varias sesiones para la misma lectura, usa la de mayor % (empate: progreso más reciente). */
  private async mejorProgresoEntreSesionesLectura(
    userId: string,
    dev: Devocional,
    lec: LecturaDia,
    sesiones: DevocionalSesion[]
  ): Promise<{ porcentaje: number; sesion_id: string | null }> {
    const candidatas = sesiones.filter((s) =>
      this.sesionVinculaLectura(s, dev, lec.id)
    );
    if (candidatas.length === 0) return { porcentaje: 0, sesion_id: null };
    const pasosL = pasosDeLectura(lec);
    const total = Math.max(pasosL.length, 1);
    let bestPct = -1;
    let bestSesionId: string | null = null;
    let bestUpdated = 0;
    for (const s of candidatas) {
      const prog = await this.obtenerProgresoDevocional(s.id, userId);
      const done = contarPasosListosParaProgreso(
        lec,
        prog?.pasos_completados ?? [],
        prog?.respuestas_campos ?? {},
        prog?.respuestas_preguntas ?? {}
      );
      const pct = Math.round((done / total) * 100);
      const u = prog?.updatedAt ? prog.updatedAt.getTime() : 0;
      if (pct > bestPct || (pct === bestPct && u > bestUpdated)) {
        bestPct = pct;
        bestSesionId = s.id;
        bestUpdated = u;
      }
    }
    return { porcentaje: Math.max(0, bestPct), sesion_id: bestSesionId };
  }

  async crearDevocional(data: CrearDevocionalData): Promise<Devocional> {
    const id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const now = new Date();
    const base = docDesdeCrearData(data);
    const doc = { _id: id, id, ...base, createdAt: now };
    const col = await this.col<any>("devocionales");
    await col.insertOne(doc);
    return normalizarDevocionalDesdeDoc(doc);
  }

  async obtenerDevocionales(soloActivos?: boolean): Promise<Devocional[]> {
    const col = await this.col<any>("devocionales");
    const q = soloActivos ? { activo: true } : {};
    const docs = await col.find(q).sort({ orden: 1, createdAt: -1 }).toArray();
    return docs.map((d) => normalizarDevocionalDesdeDoc(d));
  }

  async obtenerDevocional(id: string): Promise<Devocional | null> {
    const col = await this.col<any>("devocionales");
    const doc = await col.findOne({ _id: id });
    return doc ? normalizarDevocionalDesdeDoc(doc) : null;
  }

  async actualizarDevocional(
    id: string,
    data: Partial<CrearDevocionalData>
  ): Promise<Devocional | null> {
    const col = await this.col<any>("devocionales");
    const updateData: Record<string, unknown> = {};
    if (data.titulo !== undefined) updateData.titulo = data.titulo;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.imagen_url !== undefined) {
      updateData.imagen_url = data.imagen_url?.trim() || null;
    }
    if (data.activo !== undefined) updateData.activo = data.activo;
    if (data.orden !== undefined) updateData.orden = data.orden;
    if (data.temas !== undefined) updateData.temas = data.temas;
    if (data.duracion_tema_dias !== undefined) {
      updateData.duracion_tema_dias = data.duracion_tema_dias;
    }
    if (data.fecha_inicio_programa !== undefined) {
      updateData.fecha_inicio_programa = data.fecha_inicio_programa
        ? new Date(data.fecha_inicio_programa as string | Date)
        : null;
    }
    if (Object.keys(updateData).length === 0) return this.obtenerDevocional(id);
    updateData.updatedAt = new Date();
    const op: Record<string, unknown> = { $set: updateData };
    if (data.temas !== undefined) op.$unset = { pasos: "" };
    const res = await col.updateOne({ _id: id }, op);
    if (res.matchedCount === 0) return null;
    return this.obtenerDevocional(id);
  }

  async eliminarDevocional(id: string): Promise<boolean> {
    const col = await this.col<any>("devocionales");
    const res = await col.deleteOne({ _id: id });
    return res.deletedCount === 1;
  }

  async crearSesionDevocional(
    input: CrearSesionDevocionalInput,
    iniciadorId: string
  ): Promise<DevocionalSesion> {
    const dev = await this.obtenerDevocional(input.devocional_id);
    if (!dev || !dev.activo) {
      throw new Error("Devocional no encontrado o inactivo");
    }
    if (!input.lectura_id?.trim()) {
      throw new Error("Debes elegir una lectura");
    }
    const lecFound = buscarLecturaPorId(dev, input.lectura_id.trim());
    if (!lecFound) {
      throw new Error("Lectura no encontrada en este programa");
    }
    if (input.modo === "pareja") {
      if (!input.usuario_pareja_id?.trim()) {
        throw new Error("En modo pareja debes elegir a tu compañero");
      }
      if (input.usuario_pareja_id === iniciadorId) {
        throw new Error("No puedes elegirte a ti mismo como pareja");
      }
      const pareja = await this.obtenerUsuario(input.usuario_pareja_id);
      if (!pareja) throw new Error("Usuario pareja no encontrado");
    }

    if (input.modo === "solo") {
      const colEx = await this.col<any>("devocional_sesiones");
      const dup = await colEx
        .find({
          devocional_id: input.devocional_id,
          usuario_iniciador_id: iniciadorId,
          modo: "solo",
          lectura_id: input.lectura_id.trim(),
        })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();
      if (dup.length > 0) return this.mapSesionDev(dup[0]);
    }

    const id = `dvs_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const now = new Date();
    const modo = input.modo;
    const doc = {
      _id: id,
      id,
      devocional_id: input.devocional_id,
      lectura_id: input.lectura_id.trim(),
      modo,
      usuario_iniciador_id: iniciadorId,
      usuario_pareja_id: modo === "pareja" ? input.usuario_pareja_id! : null,
      estado: modo === "pareja" ? "pendiente_pareja" : "activa",
      createdAt: now,
      updatedAt: now,
    };
    const col = await this.col<any>("devocional_sesiones");
    await col.insertOne(doc);
    return this.mapSesionDev(doc);
  }

  async obtenerSesionDevocional(id: string): Promise<DevocionalSesion | null> {
    const col = await this.col<any>("devocional_sesiones");
    const doc = await col.findOne({ _id: id });
    return doc ? this.mapSesionDev(doc) : null;
  }

  async aceptarSesionDevocional(
    sesionId: string,
    userId: string
  ): Promise<DevocionalSesion | null> {
    const col = await this.col<any>("devocional_sesiones");
    const doc = await col.findOne({ _id: sesionId });
    if (!doc) return null;
    if (doc.estado !== "pendiente_pareja") {
      throw new Error("Esta sesión ya no está pendiente");
    }
    if (doc.usuario_pareja_id !== userId) {
      throw new Error("Solo la persona invitada puede aceptar esta sesión");
    }
    await col.updateOne(
      { _id: sesionId },
      { $set: { estado: "activa", updatedAt: new Date() } }
    );
    return this.obtenerSesionDevocional(sesionId);
  }

  async listarSesionesPendientesParaUsuario(
    userId: string
  ): Promise<DevocionalSesion[]> {
    const col = await this.col<any>("devocional_sesiones");
    const docs = await col
      .find({
        usuario_pareja_id: userId,
        estado: "pendiente_pareja",
      })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => this.mapSesionDev(d));
  }

  async listarSesionesUsuarioEnDevocional(
    userId: string,
    devocionalId: string
  ): Promise<DevocionalSesion[]> {
    const col = await this.col<any>("devocional_sesiones");
    const docs = await col
      .find({
        devocional_id: devocionalId,
        $or: [
          { usuario_iniciador_id: userId },
          { usuario_pareja_id: userId },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => this.mapSesionDev(d));
  }

  /**
   * Sesión del usuario para esa lectura: si hay varias, la que mejor refleja el progreso
   * (mayor % completado; empate: progreso guardado más reciente).
   */
  async obtenerSesionUsuarioPorLectura(
    userId: string,
    devocionalId: string,
    lecturaId: string
  ): Promise<DevocionalSesion | null> {
    const dev = await this.obtenerDevocional(devocionalId);
    if (!dev) return null;
    const hall = buscarLecturaPorId(dev, lecturaId);
    if (!hall) return null;
    const sesiones = await this.listarSesionesUsuarioEnDevocional(
      userId,
      devocionalId
    );
    const candidatas = sesiones.filter((s) =>
      this.sesionVinculaLectura(s, dev, lecturaId)
    );
    if (candidatas.length === 0) return null;
    if (candidatas.length === 1) return candidatas[0];
    const lec = hall.lectura;
    const pasosL = pasosDeLectura(lec);
    const total = Math.max(pasosL.length, 1);
    let best: DevocionalSesion | null = null;
    let bestPct = -1;
    let bestUpdated = 0;
    for (const s of candidatas) {
      const prog = await this.obtenerProgresoDevocional(s.id, userId);
      const done = contarPasosListosParaProgreso(
        lec,
        prog?.pasos_completados ?? [],
        prog?.respuestas_campos ?? {},
        prog?.respuestas_preguntas ?? {}
      );
      const pct = Math.round((done / total) * 100);
      const u = prog?.updatedAt ? prog.updatedAt.getTime() : 0;
      if (pct > bestPct || (pct === bestPct && u > bestUpdated)) {
        bestPct = pct;
        best = s;
        bestUpdated = u;
      }
    }
    return best;
  }

  async obtenerResumenProgresoLecturas(
    userId: string,
    devocionalId: string,
    temaId?: string | null
  ): Promise<ResumenProgresoLecturas> {
    const dev = await this.obtenerDevocional(devocionalId);
    if (!dev) return {};
    let t: TemaDevocional;
    if (temaId?.trim()) {
      const found = buscarTemaPorId(dev, temaId.trim());
      if (!found) return {};
      t = found;
    } else {
      t = temaActivo(dev);
    }
    const lecturas = ordenarLecturas(t.lecturas);
    const sesiones = await this.listarSesionesUsuarioEnDevocional(
      userId,
      devocionalId
    );
    const out: ResumenProgresoLecturas = {};
    for (const lec of lecturas) {
      const { porcentaje, sesion_id } =
        await this.mejorProgresoEntreSesionesLectura(
          userId,
          dev,
          lec,
          sesiones
        );
      out[lec.id] = { porcentaje, sesion_id };
    }
    return out;
  }

  /** Comprueba si el usuario puede participar en la sesión (activa o es el iniciador en pendiente). */
  puedeAccederSesionDevocional(
    sesion: DevocionalSesion,
    userId: string
  ): boolean {
    if (sesion.usuario_iniciador_id === userId) return true;
    if (sesion.usuario_pareja_id === userId) {
      return (
        sesion.estado === "activa" ||
        sesion.estado === "pendiente_pareja"
      );
    }
    return false;
  }

  puedeEditarProgresoSesion(
    sesion: DevocionalSesion,
    userId: string
  ): boolean {
    if (sesion.modo === "solo") {
      return sesion.usuario_iniciador_id === userId;
    }
    if (sesion.estado !== "activa") return false;
    return (
      sesion.usuario_iniciador_id === userId ||
      sesion.usuario_pareja_id === userId
    );
  }

  async obtenerProgresoDevocional(
    sesionId: string,
    userId: string
  ): Promise<DevocionalProgresoUsuario | null> {
    const col = await this.col<any>("devocional_progreso");
    const doc = await col.findOne({ sesion_id: sesionId, user_id: userId });
    return doc ? this.mapProgresoDev(doc) : null;
  }

  async guardarProgresoDevocional(
    sesionId: string,
    userId: string,
    input: GuardarProgresoDevocionalInput
  ): Promise<DevocionalProgresoUsuario> {
    const sesion = await this.obtenerSesionDevocional(sesionId);
    if (!sesion) throw new Error("Sesión no encontrada");
    if (!this.puedeEditarProgresoSesion(sesion, userId)) {
      throw new Error(
        "No puedes guardar progreso: en pareja la sesión debe estar aceptada"
      );
    }

    const dev = await this.obtenerDevocional(sesion.devocional_id);
    if (!dev) throw new Error("Devocional no encontrado");
    const lr = lecturaParaSesion(dev, sesion.lectura_id);
    if (!lr) throw new Error("Lectura no encontrada");

    const col = await this.col<any>("devocional_progreso");
    const existing = await col.findOne({ sesion_id: sesionId, user_id: userId });

    const pasos_completados =
      input.pasos_completados ??
      (existing?.pasos_completados as string[]) ??
      [];
    const respuestas_campos = {
      ...this.normalizeRespuestasDoc(existing?.respuestas_campos),
      ...this.normalizeRespuestasDoc(input.respuestas_campos ?? {}),
    };
    const respuestas_preguntas = {
      ...this.normalizeRespuestasDoc(existing?.respuestas_preguntas),
      ...this.normalizeRespuestasDoc(input.respuestas_preguntas ?? {}),
    };

    const puntaje_puntuacion = calcularPuntajeDesdeRespuestasPasos(
      lr.lectura.pasos,
      respuestas_preguntas
    );
    const now = new Date();

    if (existing) {
      await col.updateOne(
        { _id: existing._id },
        {
          $set: {
            pasos_completados,
            respuestas_campos,
            respuestas_preguntas,
            puntaje_puntuacion,
            updatedAt: now,
          },
        }
      );
      const updated = await col.findOne({ _id: existing._id });
      return this.mapProgresoDev(updated!);
    }

    const id = `dvp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const doc = {
      _id: id,
      id,
      sesion_id: sesionId,
      user_id: userId,
      pasos_completados,
      respuestas_campos,
      respuestas_preguntas,
      puntaje_puntuacion,
      updatedAt: now,
    };
    await col.insertOne(doc);
    return this.mapProgresoDev(doc);
  }
}

// Instancia única (Singleton)
let dbInstance: MongoDatabase | null = null;
export async function getDatabase() {
  if (!dbInstance) {
    dbInstance = new MongoDatabase();
    // Asegurar índices al iniciar (opcional, pero recomendado)
    try {
      await ensureMongoIndexes();
    } catch (e) {
      console.warn("⚠️ No se pudieron crear índices al inicio:", e);
    }
  }
  return dbInstance;
}

// --- Exportaciones Simplificadas ---
// Al llamar a estas funciones, siempre se usará la instancia de MongoDatabase

export async function crearPunto(data: CrearPuntoData) {
  const db = await getDatabase();
  return db.crearPunto(data);
}
export async function obtenerPuntos() {
  const db = await getDatabase();
  return db.obtenerPuntos();
}
export async function obtenerPunto(id: string) {
  const db = await getDatabase();
  return db.obtenerPunto(id);
}
export async function actualizarPunto(id: string, data: Partial<CrearPuntoData>) {
  const db = await getDatabase();
  return db.actualizarPunto(id, data);
}
export async function eliminarPunto(id: string) {
  const db = await getDatabase();
  return db.eliminarPunto(id);
}
export async function eliminarTodosPuntos() {
  const db = await getDatabase();
  return db.eliminarTodosPuntos();
}

export async function crearUsuario(data: CrearUsuarioData) {
  const db = await getDatabase();
  return db.crearUsuario(data);
}
export async function obtenerUsuarios() {
  const db = await getDatabase();
  return db.obtenerUsuarios();
}
export async function obtenerUsuario(id: string) {
  const db = await getDatabase();
  return db.obtenerUsuario(id);
}
export async function actualizarUsuario(id: string, data: Partial<CrearUsuarioData>) {
  const db = await getDatabase();
  return db.actualizarUsuario(id, data);
}
export async function actualizarPuntuacionUsuario(id: string, puntuacion: number) {
  const db = await getDatabase();
  return db.actualizarPuntuacionUsuario(id, puntuacion);
}
export async function eliminarUsuario(id: string) {
  const db = await getDatabase();
  return db.eliminarUsuario(id);
}

export async function crearReto(data: CrearRetoData) {
  const db = await getDatabase();
  return db.crearReto(data);
}
export async function obtenerRetos() {
  const db = await getDatabase();
  return db.obtenerRetos();
}
export async function obtenerRetosActivos() {
  const db = await getDatabase();
  return db.obtenerRetosActivos();
}
export async function obtenerReto(id: string) {
  const db = await getDatabase();
  return db.obtenerReto(id);
}
export async function actualizarReto(id: string, data: Partial<CrearRetoData>) {
  const db = await getDatabase();
  return db.actualizarReto(id, data);
}
export async function eliminarReto(id: string) {
  const db = await getDatabase();
  return db.eliminarReto(id);
}

// Exports de planes de lectura (dummies para que no rompa importaciones si las hay)
export async function crearPlanLectura(data: CreatePlanData, userId: string) {
  const db = await getDatabase();
  return db.crearPlanLectura(data, userId);
}
export async function obtenerPlanesLectura(userId: string, filter?: any) {
  const db = await getDatabase();
  return db.obtenerPlanesLectura(userId, filter);
}
export async function obtenerPlanConProgreso(planId: string, userId: string) {
  const db = await getDatabase();
  return db.obtenerPlanConProgreso(planId, userId);
}
export async function actualizarPlanLectura(planId: string, data: any, userId: string) {
  const db = await getDatabase();
  return db.actualizarPlanLectura(planId, data, userId);
}
export async function eliminarPlanLectura(planId: string, userId: string) {
  const db = await getDatabase();
  return db.eliminarPlanLectura(planId, userId);
}
export async function marcarCapituloCompletado(chapterId: string, userId: string, completado: boolean) {
  const db = await getDatabase();
  return db.marcarCapituloCompletado(chapterId, userId, completado);
}

export async function crearDevocional(data: CrearDevocionalData) {
  const db = await getDatabase();
  return db.crearDevocional(data);
}
export async function obtenerDevocionales(soloActivos?: boolean) {
  const db = await getDatabase();
  return db.obtenerDevocionales(soloActivos);
}
export async function obtenerDevocional(id: string) {
  const db = await getDatabase();
  return db.obtenerDevocional(id);
}
export async function actualizarDevocional(id: string, data: Partial<CrearDevocionalData>) {
  const db = await getDatabase();
  return db.actualizarDevocional(id, data);
}
export async function eliminarDevocional(id: string) {
  const db = await getDatabase();
  return db.eliminarDevocional(id);
}
export async function crearSesionDevocional(
  input: CrearSesionDevocionalInput,
  iniciadorId: string
) {
  const db = await getDatabase();
  return db.crearSesionDevocional(input, iniciadorId);
}
export async function obtenerSesionDevocional(id: string) {
  const db = await getDatabase();
  return db.obtenerSesionDevocional(id);
}
export async function aceptarSesionDevocional(sesionId: string, userId: string) {
  const db = await getDatabase();
  return db.aceptarSesionDevocional(sesionId, userId);
}
export async function listarSesionesPendientesParaUsuario(userId: string) {
  const db = await getDatabase();
  return db.listarSesionesPendientesParaUsuario(userId);
}
export async function listarSesionesUsuarioEnDevocional(
  userId: string,
  devocionalId: string
) {
  const db = await getDatabase();
  return db.listarSesionesUsuarioEnDevocional(userId, devocionalId);
}
export async function obtenerSesionUsuarioPorLectura(
  userId: string,
  devocionalId: string,
  lecturaId: string
) {
  const db = await getDatabase();
  return db.obtenerSesionUsuarioPorLectura(userId, devocionalId, lecturaId);
}
export async function obtenerResumenProgresoLecturas(
  userId: string,
  devocionalId: string,
  temaId?: string | null
) {
  const db = await getDatabase();
  return db.obtenerResumenProgresoLecturas(userId, devocionalId, temaId);
}
export async function puedeAccederSesionDevocional(
  sesion: DevocionalSesion,
  userId: string
) {
  const db = await getDatabase();
  return db.puedeAccederSesionDevocional(sesion, userId);
}
export async function puedeEditarProgresoSesion(
  sesion: DevocionalSesion,
  userId: string
) {
  const db = await getDatabase();
  return db.puedeEditarProgresoSesion(sesion, userId);
}
export async function obtenerProgresoDevocional(sesionId: string, userId: string) {
  const db = await getDatabase();
  return db.obtenerProgresoDevocional(sesionId, userId);
}
export async function guardarProgresoDevocional(
  sesionId: string,
  userId: string,
  input: GuardarProgresoDevocionalInput
) {
  const db = await getDatabase();
  return db.guardarProgresoDevocional(sesionId, userId, input);
}
