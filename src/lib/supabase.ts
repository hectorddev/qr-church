// Configuración de Supabase (Base de datos gratuita)
import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Crear cliente de Supabase solo si las variables están disponibles
console.log("🔍 Creando cliente Supabase...");
console.log("🔗 supabaseUrl presente:", !!supabaseUrl);
console.log("🔑 supabaseKey presente:", !!supabaseKey);

export const supabase =
  supabaseUrl && supabaseKey
    ? (() => {
        try {
          const client = createClient(supabaseUrl, supabaseKey);
          console.log("✅ Cliente Supabase creado correctamente");
          return client;
        } catch (error) {
          console.error("❌ Error creando cliente Supabase:", error);
          throw error;
        }
      })()
    : null;

if (!supabase) {
  console.log("⚠️ Cliente Supabase no creado (variables faltantes)");
}

// Tipos para la base de datos
export interface PuntoMapaDB {
  id: string;
  nombre: string;
  descripcion: string | null;
  x: number;
  y: number;
  emoji: string;
  pointerName: string;
  referencias: string | null;
  año: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsuarioDB {
  id: string;
  nombre: string;
  versiculo_id: string;
  rol: "admin" | "usuario";
  puntuacion: number;
  created_at: string;
  updated_at: string;
}

export interface RetoDB {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// Crear tablas si no existen
export async function createTables() {
  if (!supabase) {
    throw new Error("Supabase no está configurado");
  }

  try {
    console.log("🔧 Creando/verificar tablas en Supabase...");

    // Crear tabla usuarios si no existe
    const { error: usuariosError } = await supabase.rpc(
      "create_usuarios_table_if_not_exists"
    );

    if (usuariosError && usuariosError.code !== "PGRST116") {
      console.log(
        "⚠️ Función RPC no existe, intentando crear tabla manualmente..."
      );

      // Intentar crear la tabla directamente (puede fallar si ya existe)
      try {
        await supabase.from("usuarios").select("id").limit(1);
        console.log("✅ Tabla usuarios ya existe");
      } catch (error) {
        if (error.code === "PGRST205") {
          console.log(
            "❌ Tabla usuarios no existe. Debes crearla manualmente en Supabase Dashboard:"
          );
          console.log("📋 SQL para crear la tabla:");
          console.log(`
CREATE TABLE usuarios (
  id VARCHAR(255) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  versiculo_id VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
  puntuacion INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
          `);
          throw new Error(
            "Tabla 'usuarios' no existe. Crea la tabla manualmente en Supabase Dashboard usando el SQL proporcionado."
          );
        }
        throw error;
      }
    } else {
      console.log("✅ Tabla usuarios verificada/creada");
    }

    console.log("✅ Todas las tablas verificadas");
  } catch (error) {
    console.error("❌ Error configurando Supabase:", error);
    throw error;
  }
}

// Inicializar datos de ejemplo
export async function initializeExampleData() {
  if (!supabase) {
    throw new Error("Supabase no está configurado");
  }

  try {
    // Verificar si ya hay datos (con manejo de error si tabla no existe)
    let existingPoints = null;
    try {
      const { data, error } = await supabase
        .from("puntos")
        .select("id")
        .limit(1);

      if (error && error.code !== "PGRST205") {
        // PGRST205 = tabla no existe
        throw error;
      }

      existingPoints = data;
    } catch (error) {
      if (error.code === "PGRST205") {
        console.log(
          "⚠️ Tabla puntos no existe, se creará con el primer insert"
        );
      } else {
        throw error;
      }
    }

    if (existingPoints && existingPoints.length > 0) {
      console.log("📊 Datos ya existen en la base de datos");
      return;
    }

    console.log("🌱 Inicializando datos de ejemplo...");

    // Insertar puntos de ejemplo
    const examplePoints = [
      {
        id: "punto_1",
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
        id: "punto_2",
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
        id: "punto_3",
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
        id: "punto_4",
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
        id: "punto_5",
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

    // Insertar usuarios de ejemplo
    const exampleUsers = [
      {
        id: "user_1",
        nombre: "admin",
        versiculo_id: "juan316",
        rol: "admin",
        puntuacion: 0,
      },
      {
        id: "user_2",
        nombre: "usuario1",
        versiculo_id: "mateo2819",
        rol: "usuario",
        puntuacion: 150,
      },
      {
        id: "user_3",
        nombre: "usuario2",
        versiculo_id: "salmo231",
        rol: "usuario",
        puntuacion: 200,
      },
    ];

    // Insertar retos de ejemplo
    const exampleRetos = [
      {
        id: "reto_1",
        titulo: "Lectura Diaria de la Biblia",
        descripcion:
          "Lee al menos un capítulo de la Biblia cada día durante esta semana",
        fecha_inicio: new Date().toISOString(),
        fecha_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días desde ahora
        activo: true,
      },
      {
        id: "reto_2",
        titulo: "Oración Matutina",
        descripcion: "Dedica 15 minutos cada mañana a la oración personal",
        fecha_inicio: new Date().toISOString(),
        fecha_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        activo: true,
      },
    ];

    // Insertar puntos
    console.log("📝 Insertando puntos de ejemplo...");
    const { error: puntosError } = await supabase
      .from("puntos")
      .insert(examplePoints);

    if (puntosError) {
      console.error("❌ Error insertando puntos:", puntosError);
      throw puntosError;
    } else {
      console.log("✅ Puntos insertados correctamente");
    }

    // Insertar usuarios
    console.log("👥 Insertando usuarios de ejemplo...");
    const { error: usuariosError } = await supabase
      .from("usuarios")
      .insert(exampleUsers);

    if (usuariosError) {
      console.error("❌ Error insertando usuarios:", usuariosError);
      throw usuariosError;
    } else {
      console.log("✅ Usuarios insertados correctamente");
    }

    // Insertar retos
    console.log("🎯 Insertando retos de ejemplo...");
    const { error: retosError } = await supabase
      .from("retos")
      .insert(exampleRetos);

    if (retosError) {
      console.error("❌ Error insertando retos:", retosError);
      throw retosError;
    } else {
      console.log("✅ Retos insertados correctamente");
    }

    console.log("✅ Datos de ejemplo inicializados correctamente");
  } catch (error) {
    console.error("❌ Error inicializando datos:", error);
    throw error;
  }
}

// Función para inicializar todo
export async function initializeSupabase() {
  console.log("🚀 Iniciando inicialización de Supabase...");
  try {
    console.log("📋 Paso 1: Creando/verificando tablas...");
    await createTables();
    console.log("✅ Tablas verificadas");

    console.log("📊 Paso 2: Inicializando datos de ejemplo...");
    await initializeExampleData();
    console.log("✅ Datos de ejemplo inicializados");

    console.log("🚀 Supabase inicializado correctamente");
  } catch (error) {
    console.error("❌ Error inicializando Supabase:", error);
    console.error("Stack trace:", error.stack);
    throw error;
  }
}
