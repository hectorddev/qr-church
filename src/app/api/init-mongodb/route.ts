import { ensureMongoIndexes, getDb } from "@/lib/mongodb";
import { ApiResponse } from "@/lib/types";
import { NextResponse } from "next/server";

// POST /api/init-mongodb - Crea índices y datos de ejemplo si no existen
export async function POST() {
  try {
    // Verificar variables
    if (!process.env.MONGODB_URI) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "MONGODB_URI no está configurado",
        },
        { status: 500 }
      );
    }

    const db = await getDb();

    // Asegurar índices (tolerante a errores para evitar bloquear inicialización)
    try {
      await ensureMongoIndexes();
    } catch (e) {
      console.warn(
        "⚠️ No se pudieron asegurar índices de MongoDB (continuando):",
        e
      );
    }

    // Semillas de ejemplo solo si está vacío
    const puntosCol = db.collection<any>("puntos");
    const usuariosCol = db.collection<any>("usuarios");
    const retosCol = db.collection<any>("retos");

    const [puntosCount, usuariosCount, retosCount] = await Promise.all([
      puntosCol.countDocuments({}),
      usuariosCol.countDocuments({}),
      retosCol.countDocuments({}),
    ]);

    // Insertar puntos de ejemplo
    if (puntosCount === 0) {
      const now = new Date();
      const examplePoints = [
        {
          _id: "punto_1",
          id: "punto_1",
          nombre: "Identidad",
          descripcion: "Soy Hijo de Dios",
          x: 58.5,
          y: 44.9,
          emoji: "🌟",
          pointerName: "Esperanza",
          referencias: "Lucas 3:22",
          año: "Reconocer nuestra identidad como hijos de Dios nos da esperanza y propósito en la vida.",
          createdAt: now,
          updatedAt: now,
        },
        {
          _id: "punto_2",
          id: "punto_2",
          nombre: "Fe",
          descripcion: "Creer sin ver",
          x: 45.2,
          y: 35.7,
          emoji: "🙏",
          pointerName: "Fe",
          referencias: "Juan 20:29",
          año: "La fe es la certeza de lo que se espera, la convicción de lo que no se ve.",
          createdAt: now,
          updatedAt: now,
        },
        {
          _id: "punto_3",
          id: "punto_3",
          nombre: "Amor",
          descripcion: "Amar como Cristo nos amó",
          x: 52.8,
          y: 28.3,
          emoji: "❤️",
          pointerName: "Amor",
          referencias: "Juan 13:34",
          año: "Amar a otros como Cristo nos amó es el mandamiento más importante.",
          createdAt: now,
          updatedAt: now,
        },
        {
          _id: "punto_4",
          id: "punto_4",
          nombre: "Sabiduría",
          descripcion: "Buscar la sabiduría de Dios",
          x: 38.9,
          y: 42.1,
          emoji: "📚",
          pointerName: "Sabiduría",
          referencias: "Proverbios 2:6",
          año: "La sabiduría viene del temor al Señor y nos guía en nuestras decisiones.",
          createdAt: now,
          updatedAt: now,
        },
        {
          _id: "punto_5",
          id: "punto_5",
          nombre: "Servicio",
          descripcion: "Servir a otros con humildad",
          x: 61.4,
          y: 37.6,
          emoji: "🤝",
          pointerName: "Servicio",
          referencias: "Marcos 10:45",
          año: "Jesús vino para servir, no para ser servido. Sigamos su ejemplo.",
          createdAt: now,
          updatedAt: now,
        },
      ];
      await puntosCol.insertMany(examplePoints);
    }

    // Insertar usuarios de ejemplo
    if (usuariosCount === 0) {
      const now = new Date();
      const exampleUsers = [
        {
          _id: "user_1",
          id: "user_1",
          nombre: "admin",
          versiculo_id: "juan316",
          rol: "admin",
          puntuacion: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          _id: "user_2",
          id: "user_2",
          nombre: "usuario1",
          versiculo_id: "mateo2819",
          rol: "usuario",
          puntuacion: 150,
          createdAt: now,
          updatedAt: now,
        },
        {
          _id: "user_3",
          id: "user_3",
          nombre: "usuario2",
          versiculo_id: "salmo231",
          rol: "usuario",
          puntuacion: 200,
          createdAt: now,
          updatedAt: now,
        },
      ];
      await usuariosCol.insertMany(exampleUsers);
    }

    // Insertar retos de ejemplo
    if (retosCount === 0) {
      const now = new Date();
      const in7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const exampleRetos = [
        {
          _id: "reto_1",
          id: "reto_1",
          titulo: "Lectura Diaria de la Biblia",
          descripcion:
            "Lee al menos un capítulo de la Biblia cada día durante esta semana",
          fecha_inicio: now,
          fecha_fin: in7days,
          activo: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          _id: "reto_2",
          id: "reto_2",
          titulo: "Oración Matutina",
          descripcion: "Dedica 15 minutos cada mañana a la oración personal",
          fecha_inicio: now,
          fecha_fin: in7days,
          activo: true,
          createdAt: now,
          updatedAt: now,
        },
      ];
      await retosCol.insertMany(exampleRetos);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message:
        "MongoDB inicializado correctamente con índices y datos de ejemplo (si no existían)",
    });
  } catch (error) {
    console.error("Error inicializando MongoDB:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Error interno del servidor al inicializar MongoDB",
      },
      { status: 500 }
    );
  }
}

// GET /api/init-mongodb - Verificar configuración/estado
export async function GET() {
  try {
    const uriConfigured = !!process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || "pampanos";

    if (!uriConfigured) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "MONGODB_URI no está configurado",
        },
        { status: 500 }
      );
    }

    const db = await getDb();
    // simple ping consultando la cantidad de colecciones
    const collections = await db.listCollections().toArray();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "MongoDB está configurado correctamente",
      data: {
        dbName,
        collections: collections.map((c) => c.name),
      },
    });
  } catch (error) {
    console.error("Error verificando MongoDB:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Error verificando configuración de MongoDB",
      },
      { status: 500 }
    );
  }
}
