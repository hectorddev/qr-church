import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔍 Verificando conexión a MongoDB...");
    
    // Verificar que la URI esté configurada
    const uriConfigured = !!process.env.MONGODB_URI;
    if (!uriConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: "MONGODB_URI no está configurada en las variables de entorno",
          tip: "Crea un archivo .env.local con MONGODB_URI=tu_uri_aqui",
        },
        { status: 500 }
      );
    }

    // Intentar conectar
    const db = await getDb();
    
    // Probar una operación simple
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({
      success: true,
      message: "✅ Conexión a MongoDB exitosa",
      data: {
        dbName: process.env.MONGODB_DB_NAME || "pampanos",
        collections: collections.map((c) => c.name),
        collectionCount: collections.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Error en test de MongoDB:", error);
    
    const errorMessage = error.message || String(error);
    let helpfulTips: string[] = [];

    if (errorMessage.includes("authentication") || errorMessage.includes("auth")) {
      helpfulTips = [
        "Verifica que la contraseña en MONGODB_URI sea correcta",
        "Asegúrate de que el usuario tenga permisos",
        "Si la contraseña tiene caracteres especiales, codifícala en URL",
      ];
    }

    if (
      errorMessage.includes("ECONNRESET") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("Server selection")
    ) {
      helpfulTips = [
        "Verifica que tu IP esté en la whitelist de MongoDB Atlas",
        "Ve a MongoDB Atlas → Network Access → Add IP Address",
        "Añade 0.0.0.0/0 para permitir todas las IPs (solo desarrollo)",
        "Verifica que el cluster no esté pausado",
        "Verifica tu conexión a internet",
      ];
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorType: error.constructor?.name || "Error",
        tips: helpfulTips,
      },
      { status: 500 }
    );
  }
}

