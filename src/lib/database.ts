
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
} from "./types";

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
      activo: !!doc.activo,
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
