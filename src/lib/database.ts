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

// Configuración de base de datos
const isProduction = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";
const hasSupabase =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasMongo = !!process.env.MONGODB_URI;
const dbProvider = (process.env.DB_PROVIDER || "").toLowerCase();

// Base de datos Supabase (GRATUITA)
class SupabaseDatabase {
  private supabase: any;

  constructor() {
    // Importar dinámicamente para evitar errores en desarrollo
    this.supabase = null;
  }

  private async getSupabase() {
    if (!this.supabase) {
      console.log("🔄 Importando Supabase dinámicamente...");
      try {
        const { supabase } = await import("./supabase");
        this.supabase = supabase;
        console.log("✅ Supabase importado correctamente");
      } catch (error) {
        console.error("❌ Error importando Supabase:", error);
        throw error;
      }
    }
    if (!this.supabase) {
      throw new Error(
        "Supabase no está configurado. Verifica las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
    return this.supabase;
  }

  async crearPunto(data: CrearPuntoData): Promise<PuntoMapa> {
    const supabase = await this.getSupabase();
    const id = `punto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const nuevoPunto: PuntoMapa = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { error } = await supabase.from("puntos").insert([
      {
        id,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        x: data.x,
        y: data.y,
        emoji: data.emoji,
        pointerName: data.pointerName,
        referencias: data.referencias || null,
        año: data.año || null,
      },
    ]);

    if (error) {
      console.error("Error creando punto en Supabase:", error);
      throw error;
    }

    console.log("Punto creado en Supabase:", nuevoPunto);
    return nuevoPunto;
  }

  async obtenerPuntos(): Promise<PuntoMapa[]> {
    console.log("🔍 SupabaseDatabase.obtenerPuntos() - Iniciando...");
    const supabase = await this.getSupabase();
    console.log("📡 Ejecutando query Supabase...");
    const { data, error } = await supabase
      .from("puntos")
      .select("id,nombre,descripcion,x,y,emoji,pointerName,referencias,año")
      .order("id", { ascending: false });

    if (error) {
      console.error("❌ Error obteniendo puntos de Supabase:", error);
      throw error;
    }

    console.log(
      "✅ Query completada, mapeando",
      data?.length || 0,
      "registros"
    );
    const puntos = data.map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      x: parseFloat(row.x),
      y: parseFloat(row.y),
      emoji: row.emoji,
      pointerName: row.pointerName,
      referencias: row.referencias,
      año: row.año,
      createdAt: new Date(), // Usar fecha actual si no existe en DB
      updatedAt: new Date(),
    }));
    console.log("📋 Puntos mapeados correctamente");
    return puntos;
  }

  async obtenerPunto(id: string): Promise<PuntoMapa | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("puntos")
      .select("id,nombre,descripcion,x,y,emoji,pointerName,referencias,año")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No encontrado
      console.error("Error obteniendo punto de Supabase:", error);
      throw error;
    }

    return {
      id: data.id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      x: parseFloat(data.x),
      y: parseFloat(data.y),
      emoji: data.emoji,
      pointerName: data.pointerName,
      referencias: data.referencias,
      año: data.año,
      createdAt: new Date(), // Usar fecha actual
      updatedAt: new Date(),
    };
  }

  async actualizarPunto(
    id: string,
    data: Partial<CrearPuntoData>
  ): Promise<PuntoMapa | null> {
    const supabase = await this.getSupabase();

    const updateData: any = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    if (Object.keys(updateData).length === 0) return null;

    const { error } = await supabase
      .from("puntos")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error actualizando punto en Supabase:", error);
      throw error;
    }

    return await this.obtenerPunto(id);
  }

  async eliminarPunto(id: string): Promise<boolean> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from("puntos").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando punto de Supabase:", error);
      throw error;
    }

    console.log("Punto eliminado de Supabase:", id);
    return true;
  }

  async eliminarTodosPuntos(): Promise<number> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from("puntos")
      .delete()
      .neq("id", "impossible_id"); // Eliminar todos

    if (error) {
      console.error("Error eliminando todos los puntos de Supabase:", error);
      throw error;
    }

    console.log("Todos los puntos eliminados de Supabase");
    return 0; // Supabase no retorna el count
  }

  // Métodos para usuarios
  async crearUsuario(data: CrearUsuarioData): Promise<Usuario> {
    const supabase = await this.getSupabase();
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const nuevoUsuario: Usuario = {
      id,
      ...data,
      puntuacion: data.puntuacion || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { error } = await supabase.from("usuarios").insert([
      {
        id,
        nombre: data.nombre,
        versiculo_id: data.versiculo_id,
        rol: data.rol,
        puntuacion: data.puntuacion || 0,
      },
    ]);

    if (error) {
      console.error("Error creando usuario en Supabase:", error);
      throw error;
    }

    console.log("Usuario creado en Supabase:", nuevoUsuario);
    return nuevoUsuario;
  }

  async obtenerUsuarios(): Promise<Usuario[]> {
    console.log("🔍 SupabaseDatabase.obtenerUsuarios() - Iniciando...");
    const supabase = await this.getSupabase();
    console.log("📡 Ejecutando query Supabase...");

    // Intentar obtener usuarios con puntuacion, si falla intentar sin puntuacion
    let { data, error } = await supabase
      .from("usuarios")
      .select("id,nombre,versiculo_id,rol,puntuacion,created_at,updated_at")
      .order("created_at", { ascending: false });

    if (error && error.code === "42703") {
      // Columna puntuacion no existe, intentar sin ella
      console.log("⚠️ Columna puntuacion no existe, intentando sin ella...");
      const result = await supabase
        .from("usuarios")
        .select("id,nombre,versiculo_id,rol,created_at,updated_at")
        .order("created_at", { ascending: false });

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("❌ Error obteniendo usuarios de Supabase:", error);
      throw error;
    }

    console.log("✅ Query completada, mapeando", data?.length || 0, "usuarios");
    const usuarios = data.map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      versiculo_id: row.versiculo_id,
      rol: row.rol,
      puntuacion: row.puntuacion || 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
    console.log("📋 Usuarios mapeados correctamente");
    return usuarios;
  }

  async obtenerUsuario(id: string): Promise<Usuario | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("usuarios")
      .select("id,nombre,versiculo_id,rol,puntuacion,created_at,updated_at")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No encontrado
      console.error("Error obteniendo usuario de Supabase:", error);
      throw error;
    }

    return {
      id: data.id,
      nombre: data.nombre,
      versiculo_id: data.versiculo_id,
      rol: data.rol,
      puntuacion: data.puntuacion || 0,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async actualizarUsuario(
    id: string,
    data: Partial<CrearUsuarioData>
  ): Promise<Usuario | null> {
    const supabase = await this.getSupabase();

    const updateData: any = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    if (Object.keys(updateData).length === 0) return null;

    const { error } = await supabase
      .from("usuarios")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error actualizando usuario en Supabase:", error);
      throw error;
    }

    return await this.obtenerUsuario(id);
  }

  async actualizarPuntuacionUsuario(
    id: string,
    puntuacion: number
  ): Promise<Usuario | null> {
    return await this.actualizarUsuario(id, { puntuacion });
  }

  async eliminarUsuario(id: string): Promise<boolean> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from("usuarios").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando usuario de Supabase:", error);
      throw error;
    }

    console.log("Usuario eliminado de Supabase:", id);
    return true;
  }

  // Métodos para retos
  async crearReto(data: CrearRetoData): Promise<Reto> {
    const supabase = await this.getSupabase();
    const id = Date.now(); // Usar timestamp numérico para BIGINT

    const nuevoReto: Reto = {
      id: id.toString(), // Convertir a string para mantener consistencia en el tipo Reto
      ...data,
      activo: data.activo !== undefined ? data.activo : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { error } = await supabase.from("retos").insert([
      {
        id, // Enviar como número para BIGINT
        titulo: data.titulo,
        descripcion: data.descripcion,
        fecha_inicio: data.fecha_inicio.toISOString(),
        fecha_fin: data.fecha_fin.toISOString(),
        activo: data.activo !== undefined ? data.activo : true,
      },
    ]);

    if (error) {
      console.error("Error creando reto en Supabase:", error);
      throw error;
    }

    console.log("Reto creado en Supabase:", nuevoReto);
    return nuevoReto;
  }

  async obtenerRetos(): Promise<Reto[]> {
    console.log("🔍 SupabaseDatabase.obtenerRetos() - Iniciando...");
    const supabase = await this.getSupabase();

    // Verificar si la tabla existe primero
    try {
      await supabase.from("retos").select("id").limit(1);
    } catch (error) {
      if (error.code === "PGRST205") {
        console.log(
          "❌ Tabla retos no existe. Debes crearla usando el script SQL."
        );
        throw new Error(
          "Tabla 'retos' no existe. Ejecuta el script scripts/create-usuarios-table.sql en Supabase Dashboard → SQL Editor"
        );
      }
      throw error;
    }

    console.log("📡 Ejecutando query Supabase...");
    const { data, error } = await supabase
      .from("retos")
      .select(
        "id,titulo,descripcion,fecha_inicio,fecha_fin,activo,created_at,updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error obteniendo retos de Supabase:", error);
      throw error;
    }

    console.log("✅ Query completada, mapeando", data?.length || 0, "retos");
    const retos = data.map((row: any) => ({
      id: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion,
      fecha_inicio: new Date(row.fecha_inicio),
      fecha_fin: new Date(row.fecha_fin),
      activo: row.activo,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
    console.log("📋 Retos mapeados correctamente");
    return retos;
  }

  async obtenerRetosActivos(): Promise<Reto[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("retos")
      .select(
        "id,titulo,descripcion,fecha_inicio,fecha_fin,activo,created_at,updated_at"
      )
      .eq("activo", true)
      .order("fecha_inicio", { ascending: true });

    if (error) {
      console.error("Error obteniendo retos activos de Supabase:", error);
      throw error;
    }

    return data.map((row: any) => ({
      id: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion,
      fecha_inicio: new Date(row.fecha_inicio),
      fecha_fin: new Date(row.fecha_fin),
      activo: row.activo,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async obtenerReto(id: string): Promise<Reto | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("retos")
      .select(
        "id,titulo,descripcion,fecha_inicio,fecha_fin,activo,created_at,updated_at"
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No encontrado
      console.error("Error obteniendo reto de Supabase:", error);
      throw error;
    }

    return {
      id: data.id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      fecha_inicio: new Date(data.fecha_inicio),
      fecha_fin: new Date(data.fecha_fin),
      activo: data.activo,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async actualizarReto(
    id: string,
    data: Partial<CrearRetoData>
  ): Promise<Reto | null> {
    const supabase = await this.getSupabase();

    const updateData: any = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === "fecha_inicio" || key === "fecha_fin") {
          updateData[key] = (value as Date).toISOString();
        } else {
          updateData[key] = value;
        }
      }
    });

    if (Object.keys(updateData).length === 0) return null;

    const { error } = await supabase
      .from("retos")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error actualizando reto en Supabase:", error);
      throw error;
    }

    return await this.obtenerReto(id);
  }

  async eliminarReto(id: string): Promise<boolean> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from("retos").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando reto de Supabase:", error);
      throw error;
    }

    console.log("Reto eliminado de Supabase:", id);
    return true;
  }

  // Reading Plans - Not implemented for Supabase yet
  async crearPlanLectura(data: CreatePlanData, userId: string): Promise<ReadingPlan> {
    throw new Error("Reading plans not implemented for Supabase yet. Use MongoDB.");
  }

  async obtenerPlanesLectura(userId: string, filter?: "official" | "my" | "public"): Promise<ReadingPlan[]> {
    throw new Error("Reading plans not implemented for Supabase yet. Use MongoDB.");
  }

  async obtenerPlanConProgreso(planId: string, userId: string): Promise<PlanWithProgress | null> {
    throw new Error("Reading plans not implemented for Supabase yet. Use MongoDB.");
  }

  async actualizarPlanLectura(planId: string, data: Partial<CreatePlanData>, userId: string): Promise<ReadingPlan | null> {
    throw new Error("Reading plans not implemented for Supabase yet. Use MongoDB.");
  }

  async eliminarPlanLectura(planId: string, userId: string): Promise<boolean> {
    throw new Error("Reading plans not implemented for Supabase yet. Use MongoDB.");
  }

  async marcarCapituloCompletado(chapterId: string, userId: string, completado: boolean): Promise<UserProgress> {
    throw new Error("Reading plans not implemented for Supabase yet. Use MongoDB.");
  }
}

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
    const col = await this.col<any>("usuarios");
    const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((d) => this.mapUsuario(d));
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

    // Debug: log de operación
    console.log("[MongoDB] actualizarUsuario -> filtro:", { _id: id });
    console.log("[MongoDB] actualizarUsuario -> set:", updateData);

    const res = await col.updateOne({ _id: id }, { $set: updateData });

    // Debug: resultado
    console.log("[MongoDB] actualizarUsuario -> resultado:", {
      matchedCount: res.matchedCount,
      modifiedCount: res.modifiedCount,
    });

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

  // ===== READING PLANS =====

  private mapReadingPlan(doc: any): ReadingPlan {
    return {
      id: doc.id ?? doc._id,
      titulo: doc.titulo,
      descripcion: doc.descripcion,
      icono: doc.icono,
      created_by: doc.created_by ?? null,
      is_public: !!doc.is_public,
      activo: !!doc.activo,
      orden: typeof doc.orden === "number" ? doc.orden : 0,
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    };
  }

  private mapPlanChapter(doc: any): PlanChapter {
    return {
      id: doc.id ?? doc._id,
      plan_id: doc.plan_id,
      dia: typeof doc.dia === "number" ? doc.dia : 1,
      libro: doc.libro,
      capitulo: typeof doc.capitulo === "number" ? doc.capitulo : 1,
      version: doc.version ?? "NVI",
      orden: typeof doc.orden === "number" ? doc.orden : 0,
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    };
  }

  private mapUserProgress(doc: any): UserProgress {
    return {
      id: doc.id ?? doc._id,
      user_id: doc.user_id,
      plan_id: doc.plan_id,
      chapter_id: doc.chapter_id,
      completado: !!doc.completado,
      fecha_completado: doc.fecha_completado
        ? new Date(doc.fecha_completado)
        : undefined,
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    };
  }

  async crearPlanLectura(
    data: CreatePlanData,
    userId: string
  ): Promise<ReadingPlan> {
    const id = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const doc = {
      _id: id,
      id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      icono: data.icono,
      created_by: userId,
      is_public: data.is_public,
      activo: true,
      orden: 0,
      createdAt: now,
      updatedAt: now,
    };

    const col = await this.col<any>("reading_plans");
    await col.insertOne(doc);

    // Crear capítulos si se proporcionan
    if (data.capitulos && data.capitulos.length > 0) {
      const chaptersCol = await this.col<any>("reading_plan_chapters");
      const chapters = data.capitulos.map((cap, index) => ({
        _id: `chapter_${id}_${Date.now()}_${index}`,
        id: `chapter_${id}_${Date.now()}_${index}`,
        plan_id: id,
        dia: cap.dia,
        libro: cap.libro,
        capitulo: cap.capitulo,
        version: cap.version,
        orden: cap.orden,
        createdAt: now,
      }));
      await chaptersCol.insertMany(chapters);
    }

    return this.mapReadingPlan(doc);
  }

  async obtenerPlanesLectura(
    userId: string,
    filter?: "official" | "my" | "public"
  ): Promise<ReadingPlan[]> {
    const col = await this.col<any>("reading_plans");

    let query: any = { activo: true };

    if (filter === "official") {
      query.created_by = null;
    } else if (filter === "my") {
      query.created_by = userId;
    } else if (filter === "public") {
      query.$or = [{ is_public: true }, { created_by: null }];
    } else {
      // Sin filtro: públicos + propios
      query.$or = [
        { is_public: true },
        { created_by: null },
        { created_by: userId },
      ];
    }

    const docs = await col.find(query).sort({ orden: 1, createdAt: -1 }).toArray();
    return docs.map((d) => this.mapReadingPlan(d));
  }

  async obtenerPlanConProgreso(
    planId: string,
    userId: string
  ): Promise<PlanWithProgress | null> {
    const col = await this.col<any>("reading_plans");
    const planDoc = await col.findOne({ _id: planId });

    if (!planDoc) return null;

    // Verificar permisos de visibilidad
    const plan = this.mapReadingPlan(planDoc);
    if (
      !plan.is_public &&
      plan.created_by !== null &&
      plan.created_by !== userId
    ) {
      return null; // Usuario no tiene permiso para ver este plan
    }

    // Obtener capítulos
    const chaptersCol = await this.col<any>("reading_plan_chapters");
    const chapterDocs = await chaptersCol
      .find({ plan_id: planId })
      .sort({ dia: 1, orden: 1 })
      .toArray();
    const capitulos = chapterDocs.map((d) => this.mapPlanChapter(d));

    // Obtener progreso del usuario
    const progressCol = await this.col<any>("user_reading_progress");
    const progressDocs = await progressCol
      .find({ plan_id: planId, user_id: userId })
      .toArray();
    const progreso = progressDocs.map((d) => this.mapUserProgress(d));

    // Calcular estadísticas
    const total_capitulos = capitulos.length;
    const capitulos_completados = progreso.filter((p) => p.completado).length;
    const porcentaje_completado =
      total_capitulos > 0
        ? Math.round((capitulos_completados / total_capitulos) * 100)
        : 0;

    // Obtener nombre del creador si no es oficial
    let nombre_creador: string | undefined;
    if (plan.created_by) {
      const usuariosCol = await this.col<any>("usuarios");
      const creador = await usuariosCol.findOne({ _id: plan.created_by });
      nombre_creador = creador?.nombre;
    }

    return {
      ...plan,
      capitulos,
      progreso,
      porcentaje_completado,
      nombre_creador,
      es_creador: plan.created_by === userId,
      total_capitulos,
      capitulos_completados,
    };
  }

  async actualizarPlanLectura(
    planId: string,
    data: Partial<CreatePlanData>,
    userId: string
  ): Promise<ReadingPlan | null> {
    const col = await this.col<any>("reading_plans");

    // Verificar permisos
    const planDoc = await col.findOne({ _id: planId });
    if (!planDoc) return null;

    // Solo el creador o admin puede editar (admin check debe hacerse en la API)
    if (planDoc.created_by && planDoc.created_by !== userId) {
      throw new Error("No tienes permiso para editar este plan");
    }

    const updateData: any = {};
    if (data.titulo !== undefined) updateData.titulo = data.titulo;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.icono !== undefined) updateData.icono = data.icono;
    if (data.is_public !== undefined) updateData.is_public = data.is_public;

    if (Object.keys(updateData).length === 0 && !data.capitulos) {
      return this.mapReadingPlan(planDoc);
    }

    updateData.updatedAt = new Date();
    await col.updateOne({ _id: planId }, { $set: updateData });

    // Actualizar capítulos si se proporcionan
    if (data.capitulos) {
      const chaptersCol = await this.col<any>("reading_plan_chapters");
      // Eliminar capítulos existentes
      await chaptersCol.deleteMany({ plan_id: planId });
      // Insertar nuevos
      if (data.capitulos.length > 0) {
        const now = new Date();
        const chapters = data.capitulos.map((cap, index) => ({
          _id: `chapter_${planId}_${Date.now()}_${index}`,
          id: `chapter_${planId}_${Date.now()}_${index}`,
          plan_id: planId,
          dia: cap.dia,
          libro: cap.libro,
          capitulo: cap.capitulo,
          version: cap.version,
          orden: cap.orden,
          createdAt: now,
        }));
        await chaptersCol.insertMany(chapters);
      }
    }

    const updatedDoc = await col.findOne({ _id: planId });
    return updatedDoc ? this.mapReadingPlan(updatedDoc) : null;
  }

  async eliminarPlanLectura(
    planId: string,
    userId: string
  ): Promise<boolean> {
    const col = await this.col<any>("reading_plans");

    // Verificar permisos
    const planDoc = await col.findOne({ _id: planId });
    if (!planDoc) return false;

    if (planDoc.created_by && planDoc.created_by !== userId) {
      throw new Error("No tienes permiso para eliminar este plan");
    }

    // Eliminar plan
    await col.deleteOne({ _id: planId });

    // Eliminar capítulos
    const chaptersCol = await this.col<any>("reading_plan_chapters");
    await chaptersCol.deleteMany({ plan_id: planId });

    // Eliminar progreso de todos los usuarios
    const progressCol = await this.col<any>("user_reading_progress");
    await progressCol.deleteMany({ plan_id: planId });

    return true;
  }

  async marcarCapituloCompletado(
    chapterId: string,
    userId: string,
    completado: boolean
  ): Promise<UserProgress> {
    const progressCol = await this.col<any>("user_reading_progress");

    // Buscar progreso existente
    const existing = await progressCol.findOne({
      user_id: userId,
      chapter_id: chapterId,
    });

    const now = new Date();

    if (existing) {
      // Actualizar
      const updateData: any = {
        completado,
        updatedAt: now,
      };

      if (completado) {
        updateData.fecha_completado = now;
      } else {
        updateData.fecha_completado = null;
      }

      await progressCol.updateOne(
        { _id: existing._id },
        { $set: updateData }
      );

      const updated = await progressCol.findOne({ _id: existing._id });
      return this.mapUserProgress(updated);
    } else {
      // Crear nuevo
      const chapterCol = await this.col<any>("reading_plan_chapters");
      const chapter = await chapterCol.findOne({ _id: chapterId });

      if (!chapter) {
        throw new Error("Capítulo no encontrado");
      }

      const id = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const doc = {
        _id: id,
        id,
        user_id: userId,
        plan_id: chapter.plan_id,
        chapter_id: chapterId,
        completado,
        fecha_completado: completado ? now : null,
        createdAt: now,
      };

      await progressCol.insertOne(doc);
      return this.mapUserProgress(doc);
    }
  }
}

// Variable global para la instancia de base de datos
let db: MongoDatabase | SupabaseDatabase | null = null;

// Función para inicializar la base de datos
async function initializeDatabase() {
  if (db) {
    return db;
  }

  try {
    // Prioridad: DB_PROVIDER > hasMongo > hasSupabase
    if (dbProvider === "mongo" || (dbProvider === "" && hasMongo)) {
      db = new MongoDatabase();
      console.log("✅ MongoDatabase inicializada correctamente");
    } else if (dbProvider === "supabase" || (dbProvider === "" && hasSupabase)) {
      db = new SupabaseDatabase();
      console.log("✅ SupabaseDatabase inicializada correctamente");
    } else {
      // Fallback a MongoDB si está disponible
      if (hasMongo) {
        db = new MongoDatabase();
        console.log("✅ MongoDatabase inicializada correctamente (fallback)");
      } else {
        throw new Error(
          "No hay proveedor de base de datos configurado. Define DB_PROVIDER=mongo o supabase y sus variables correspondientes."
        );
      }
    }
  } catch (error) {
    console.error("❌ Error inicializando la base de datos:", error);
    throw error;
  }

  return db;
}

// Obtener instancia de base de datos
export async function getDatabase() {
  if (!db) {
    return await initializeDatabase();
  }
  return db;
}

// Inicializar datos de ejemplo
async function initializeExampleData() {
  if (!db) {
    await initializeDatabase();
  }
  if (!db) return;

  const existingPoints = await db.obtenerPuntos();
  if (existingPoints.length === 0) {
    console.log("Inicializando datos de ejemplo...");

    const examplePoints = [
      {
        nombre: "Identidad",
        descripcion: "Soy Hijo de Dios",
        x: 58.5,
        y: 44.9,
        emoji: "🌟",
        pointerName: "Esperanza",
        referencias: "Lucas 3:22",
        año: "Reconocer nuestra identidad como hijos de Dios nos da esperanza y propósito en la vida.",
      },
      {
        nombre: "Fe",
        descripcion: "Creer sin ver",
        x: 45.2,
        y: 35.7,
        emoji: "🙏",
        pointerName: "Fe",
        referencias: "Juan 20:29",
        año: "La fe es la certeza de lo que se espera, la convicción de lo que no se ve.",
      },
      {
        nombre: "Amor",
        descripcion: "Amar como Cristo nos amó",
        x: 52.8,
        y: 28.3,
        emoji: "❤️",
        pointerName: "Amor",
        referencias: "Juan 13:34",
        año: "Amar a otros como Cristo nos amó es el mandamiento más importante.",
      },
      {
        nombre: "Sabiduría",
        descripcion: "Buscar la sabiduría de Dios",
        x: 38.9,
        y: 42.1,
        emoji: "📚",
        pointerName: "Sabiduría",
        referencias: "Proverbios 2:6",
        año: "La sabiduría viene del temor al Señor y nos guía en nuestras decisiones.",
      },
      {
        nombre: "Servicio",
        descripcion: "Servir a otros con humildad",
        x: 61.4,
        y: 37.6,
        emoji: "🤝",
        pointerName: "Servicio",
        referencias: "Marcos 10:45",
        año: "Jesús vino para servir, no para ser servido. Sigamos su ejemplo.",
      },
    ];

    // Insertar puntos de ejemplo
    for (const point of examplePoints) {
      await db.crearPunto(point);
    }
  }
}

// Funciones helper para puntos
export async function crearPunto(data: CrearPuntoData) {
  const database = await initializeDatabase();
  return await database.crearPunto(data);
}

export async function obtenerPuntos() {
  console.log("🔍 obtenerPuntos() - Llamando getDatabase()...");
  const database = await getDatabase();
  console.log("📊 DB obtenida, llamando database.obtenerPuntos()...");
  return await database.obtenerPuntos();
}

export async function obtenerPunto(id: string) {
  const database = await getDatabase();
  return await database.obtenerPunto(id);
}

export async function actualizarPunto(
  id: string,
  data: Partial<CrearPuntoData>
) {
  const database = await getDatabase();
  return await database.actualizarPunto(id, data);
}

export async function eliminarPunto(id: string) {
  const database = await getDatabase();
  return await database.eliminarPunto(id);
}

export async function eliminarTodosPuntos() {
  const database = await getDatabase();
  return await database.eliminarTodosPuntos();
}

// Funciones helper para usuarios
export async function crearUsuario(data: CrearUsuarioData) {
  const database = await getDatabase();
  return await database.crearUsuario(data);
}

export async function obtenerUsuarios() {
  const database = await getDatabase();
  return await database.obtenerUsuarios();
}

export async function obtenerUsuario(id: string) {
  const database = await getDatabase();
  return await database.obtenerUsuario(id);
}

export async function actualizarUsuario(
  id: string,
  data: Partial<CrearUsuarioData>
) {
  const database = await getDatabase();
  return await database.actualizarUsuario(id, data);
}

export async function actualizarPuntuacionUsuario(
  id: string,
  puntuacion: number
) {
  const database = await getDatabase();
  return await database.actualizarPuntuacionUsuario(id, puntuacion);
}

export async function eliminarUsuario(id: string) {
  const database = await getDatabase();
  return await database.eliminarUsuario(id);
}

// Funciones helper para retos
export async function crearReto(data: CrearRetoData) {
  const database = await getDatabase();
  return await database.crearReto(data);
}

export async function obtenerRetos() {
  const database = await getDatabase();
  return await database.obtenerRetos();
}

export async function obtenerRetosActivos() {
  const database = await getDatabase();
  return await database.obtenerRetosActivos();
}

export async function obtenerReto(id: string) {
  const database = await getDatabase();
  return await database.obtenerReto(id);
}

export async function actualizarReto(id: string, data: Partial<CrearRetoData>) {
  const database = await getDatabase();
  return await database.actualizarReto(id, data);
}

export async function eliminarReto(id: string) {
  const database = await getDatabase();
  return await database.eliminarReto(id);
}

// Funciones helper para planes de lectura
export async function crearPlanLectura(data: CreatePlanData, userId: string) {
  const database = await getDatabase();
  return await database.crearPlanLectura(data, userId);
}

export async function obtenerPlanesLectura(
  userId: string,
  filter?: "official" | "my" | "public"
) {
  const database = await getDatabase();
  return await database.obtenerPlanesLectura(userId, filter);
}

export async function obtenerPlanConProgreso(planId: string, userId: string) {
  const database = await getDatabase();
  return await database.obtenerPlanConProgreso(planId, userId);
}

export async function actualizarPlanLectura(
  planId: string,
  data: Partial<CreatePlanData>,
  userId: string
) {
  const database = await getDatabase();
  return await database.actualizarPlanLectura(planId, data, userId);
}

export async function eliminarPlanLectura(planId: string, userId: string) {
  const database = await getDatabase();
  return await database.eliminarPlanLectura(planId, userId);
}

export async function marcarCapituloCompletado(
  chapterId: string,
  userId: string,
  completado: boolean
) {
  const database = await getDatabase();
  return await database.marcarCapituloCompletado(chapterId, userId, completado);
}

// Exportar función de inicialización para uso externo
export { initializeDatabase };
