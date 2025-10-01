// Configuración de base de datos para producción y desarrollo
import {
  CrearPuntoData,
  CrearRetoData,
  CrearUsuarioData,
  PuntoMapa,
  Reto,
  Usuario,
} from "./types";

// Configuración de base de datos
const isProduction = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";
const hasSupabase =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
    const id = `reto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const nuevoReto: Reto = {
      id,
      ...data,
      activo: data.activo !== undefined ? data.activo : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { error } = await supabase.from("retos").insert([
      {
        id,
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
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("retos")
      .select(
        "id,titulo,descripcion,fecha_inicio,fecha_fin,activo,created_at,updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo retos de Supabase:", error);
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
}

// Base de datos en memoria para desarrollo (temporal)
class InMemoryDatabase {
  private puntos: PuntoMapa[] = [];
  private usuarios: Usuario[] = [];
  private retos: Reto[] = [];
  private nextId = 1;

  async crearPunto(data: CrearPuntoData): Promise<PuntoMapa> {
    const nuevoPunto: PuntoMapa = {
      id: `punto_${this.nextId++}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.puntos.push(nuevoPunto);
    console.log("Punto creado:", nuevoPunto);
    return nuevoPunto;
  }

  async obtenerPuntos(): Promise<PuntoMapa[]> {
    return [...this.puntos];
  }

  async obtenerPunto(id: string): Promise<PuntoMapa | null> {
    return this.puntos.find((punto) => punto.id === id) || null;
  }

  async actualizarPunto(
    id: string,
    data: Partial<CrearPuntoData>
  ): Promise<PuntoMapa | null> {
    const index = this.puntos.findIndex((punto) => punto.id === id);
    if (index === -1) return null;

    this.puntos[index] = {
      ...this.puntos[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.puntos[index];
  }

  async eliminarPunto(id: string): Promise<boolean> {
    const index = this.puntos.findIndex((punto) => punto.id === id);
    if (index === -1) return false;
    this.puntos.splice(index, 1);
    return true;
  }

  async eliminarTodosPuntos(): Promise<number> {
    const count = this.puntos.length;
    this.puntos = [];
    return count;
  }

  // Implementaciones básicas para usuarios (solo para desarrollo)
  async crearUsuario(data: CrearUsuarioData): Promise<Usuario> {
    const nuevoUsuario: Usuario = {
      id: `user_${this.nextId++}`,
      ...data,
      puntuacion: data.puntuacion || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.usuarios.push(nuevoUsuario);
    return nuevoUsuario;
  }

  async obtenerUsuarios(): Promise<Usuario[]> {
    return [...this.usuarios];
  }

  async obtenerUsuario(id: string): Promise<Usuario | null> {
    return this.usuarios.find((u) => u.id === id) || null;
  }

  async actualizarUsuario(
    id: string,
    data: Partial<CrearUsuarioData>
  ): Promise<Usuario | null> {
    const index = this.usuarios.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.usuarios[index] = {
      ...this.usuarios[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.usuarios[index];
  }

  async actualizarPuntuacionUsuario(
    id: string,
    puntuacion: number
  ): Promise<Usuario | null> {
    return this.actualizarUsuario(id, { puntuacion });
  }

  async eliminarUsuario(id: string): Promise<boolean> {
    const index = this.usuarios.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.usuarios.splice(index, 1);
    return true;
  }

  // Implementaciones básicas para retos (solo para desarrollo)
  async crearReto(data: CrearRetoData): Promise<Reto> {
    const nuevoReto: Reto = {
      id: `reto_${this.nextId++}`,
      ...data,
      activo: data.activo !== undefined ? data.activo : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.retos.push(nuevoReto);
    return nuevoReto;
  }

  async obtenerRetos(): Promise<Reto[]> {
    return [...this.retos];
  }

  async obtenerRetosActivos(): Promise<Reto[]> {
    return this.retos.filter((r) => r.activo);
  }

  async obtenerReto(id: string): Promise<Reto | null> {
    return this.retos.find((r) => r.id === id) || null;
  }

  async actualizarReto(
    id: string,
    data: Partial<CrearRetoData>
  ): Promise<Reto | null> {
    const index = this.retos.findIndex((r) => r.id === id);
    if (index === -1) return null;
    this.retos[index] = {
      ...this.retos[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.retos[index];
  }

  async eliminarReto(id: string): Promise<boolean> {
    const index = this.retos.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.retos.splice(index, 1);
    return true;
  }
}

// Instancia de base de datos
let db: InMemoryDatabase | SupabaseDatabase;

// Inicializar base de datos
export function initializeDatabase() {
  if (!db) {
    console.log("🔍 Inicializando base de datos...");
    console.log("📊 isProduction:", isProduction);
    console.log("🌐 isVercel:", isVercel);
    console.log("🗄️ hasSupabase:", hasSupabase);
    console.log(
      "🔗 NEXT_PUBLIC_SUPABASE_URL presente:",
      !!process.env.NEXT_PUBLIC_SUPABASE_URL
    );
    console.log(
      "🔑 NEXT_PUBLIC_SUPABASE_ANON_KEY presente:",
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (hasSupabase) {
      console.log("🚀 Usando Supabase (GRATUITO) para base de datos");
      try {
        db = new SupabaseDatabase();
        console.log("✅ SupabaseDatabase inicializada correctamente");
      } catch (error) {
        console.error("❌ Error inicializando SupabaseDatabase:", error);
        throw error;
      }
    } else {
      console.log("💾 Usando base de datos en memoria");
      db = new InMemoryDatabase();

      // Solo inicializar datos de ejemplo en desarrollo
      if (!isProduction) {
        console.log("🌱 Inicializando datos de ejemplo...");
        initializeExampleData();
      }
    }
  }
  return db;
}

// Obtener instancia de base de datos
export function getDatabase() {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

// Inicializar datos de ejemplo
async function initializeExampleData() {
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

    for (const pointData of examplePoints) {
      await db.crearPunto(pointData);
    }

    console.log("Datos de ejemplo inicializados correctamente");
  }
}

// Funciones helper para las API routes
export async function crearPunto(data: CrearPuntoData) {
  const database = getDatabase();
  return await database.crearPunto(data);
}

export async function obtenerPuntos() {
  console.log("🔍 obtenerPuntos() - Llamando getDatabase()...");
  const database = getDatabase();
  console.log("📊 DB obtenida, llamando database.obtenerPuntos()...");
  return await database.obtenerPuntos();
}

export async function obtenerPunto(id: string) {
  const database = getDatabase();
  return await database.obtenerPunto(id);
}

export async function actualizarPunto(
  id: string,
  data: Partial<CrearPuntoData>
) {
  const database = getDatabase();
  return await database.actualizarPunto(id, data);
}

export async function eliminarPunto(id: string) {
  const database = getDatabase();
  return await database.eliminarPunto(id);
}

export async function eliminarTodosPuntos() {
  const database = getDatabase();
  return await database.eliminarTodosPuntos();
}

// Funciones helper para usuarios
export async function crearUsuario(data: CrearUsuarioData) {
  const database = getDatabase();
  return await database.crearUsuario(data);
}

export async function obtenerUsuarios() {
  const database = getDatabase();
  return await database.obtenerUsuarios();
}

export async function obtenerUsuario(id: string) {
  const database = getDatabase();
  return await database.obtenerUsuario(id);
}

export async function actualizarUsuario(
  id: string,
  data: Partial<CrearUsuarioData>
) {
  const database = getDatabase();
  return await database.actualizarUsuario(id, data);
}

export async function actualizarPuntuacionUsuario(
  id: string,
  puntuacion: number
) {
  const database = getDatabase();
  return await database.actualizarPuntuacionUsuario(id, puntuacion);
}

export async function eliminarUsuario(id: string) {
  const database = getDatabase();
  return await database.eliminarUsuario(id);
}

// Funciones helper para retos
export async function crearReto(data: CrearRetoData) {
  const database = getDatabase();
  return await database.crearReto(data);
}

export async function obtenerRetos() {
  const database = getDatabase();
  return await database.obtenerRetos();
}

export async function obtenerRetosActivos() {
  const database = getDatabase();
  return await database.obtenerRetosActivos();
}

export async function obtenerReto(id: string) {
  const database = getDatabase();
  return await database.obtenerReto(id);
}

export async function actualizarReto(id: string, data: Partial<CrearRetoData>) {
  const database = getDatabase();
  return await database.actualizarReto(id, data);
}

export async function eliminarReto(id: string) {
  const database = getDatabase();
  return await database.eliminarReto(id);
}
