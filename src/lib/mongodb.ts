// Helper de conexión y utilidades para MongoDB Atlas
// Uso: importar getDb() para obtener una instancia de Db y ensureMongoIndexes() para crear índices

import { Db, MongoClient } from "mongodb";

declare global {
  // Evitar múltiples conexiones en desarrollo (HMR)

  var _mongoClientPromise: Promise<MongoClient> | undefined;

  var _mongoDb: Db | undefined;
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "pampanos";

// Obtiene (o crea) una conexión singleton al cluster de MongoDB
export async function getMongoClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI no está configurado. Define MONGODB_URI en tu entorno (.env.local)"
    );
  }

  // Debug: mostrar información de conexión (sin exponer contraseña)
  const uriForLog = uri.replace(/:[^:@]+@/, ':****@');
  console.log("🔍 URI de conexión:", uriForLog);

  // Si hay una conexión existente, verificar si está conectada
  if (globalThis._mongoClientPromise) {
    try {
      const client = await globalThis._mongoClientPromise;
      // Verificar si la conexión sigue activa (usando listCollections como ping)
      await client.db(dbName).listCollections().toArray();
      return client;
    } catch (error) {
      // Si la conexión falló, resetear y reconectar
      console.warn("⚠️ Conexión MongoDB perdida, reconectando...");
      globalThis._mongoClientPromise = undefined;
      globalThis._mongoDb = undefined;
    }
  }

  // Crear nueva conexión con opciones mejoradas
  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    // Atlas / redes lentas o cluster recién reanudado: 10s suele disparar Server selection timed out
    connectTimeoutMS: 20000,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    // Reintentos automáticos
    retryWrites: true,
    retryReads: true,
    // Pool de conexiones
    maxPoolSize: 10,
    minPoolSize: 1,
    // Mantener conexión viva
    heartbeatFrequencyMS: 10000,
  });

  console.log("🔌 Conectando a MongoDB Atlas...");
  
  // Función de conexión con reintentos
  const connectWithRetry = async (retries = 3): Promise<MongoClient> => {
    for (let i = 0; i < retries; i++) {
      try {
        const connectedClient = await client.connect();
        console.log("✅ Conexión a MongoDB establecida");
        return connectedClient;
      } catch (error: any) {
        const isLastAttempt = i === retries - 1;
        const errorMessage = error.message || String(error);
        const errorName = error.constructor?.name || 'Error';
        
        console.error(
          `❌ Error conectando a MongoDB (intento ${i + 1}/${retries}):`,
          `[${errorName}] ${errorMessage}`
        );
        
        // Mensajes de ayuda específicos según el tipo de error
        if (errorMessage.includes('authentication') || errorMessage.includes('auth')) {
          console.error('💡 Error de autenticación: Verifica que la contraseña en MONGODB_URI sea correcta');
          console.error('💡 Si la contraseña tiene caracteres especiales, codifícala en URL (ej: @ → %40)');
        }
        
        if (errorMessage.includes('ECONNRESET') || errorMessage.includes('timeout')) {
          console.error('💡 Error de conexión: Verifica que tu IP esté en la whitelist de MongoDB Atlas');
          console.error('💡 Ve a MongoDB Atlas → Network Access → Add IP Address');
        }
        
        if (isLastAttempt) {
          const helpfulMessage = 
            `No se pudo conectar a MongoDB después de ${retries} intentos.\n` +
            `Verifica:\n` +
            `1. Tu IP está en la whitelist de MongoDB Atlas (Network Access)\n` +
            `2. La contraseña en MONGODB_URI es correcta (reemplaza <db_password>)\n` +
            `3. La cadena de conexión tiene el formato correcto\n` +
            `4. Tu conexión a internet es estable\n` +
            `Error: [${errorName}] ${errorMessage}`;
          
          throw new Error(helpfulMessage);
        }
        
        // Esperar antes de reintentar (backoff exponencial)
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error("No se pudo conectar a MongoDB");
  };

  globalThis._mongoClientPromise = connectWithRetry();
  return globalThis._mongoClientPromise;
}

// Devuelve la BD (usa MONGODB_DB_NAME o 'pampanos' por defecto)
export async function getDb(): Promise<Db> {
  try {
    if (globalThis._mongoDb) {
      // Verificar que la conexión sigue activa (usando listCollections como ping)
      try {
        await globalThis._mongoDb.listCollections().toArray();
        return globalThis._mongoDb;
      } catch (error) {
        // Si falla el ping, resetear y reconectar
        console.warn("⚠️ Base de datos MongoDB desconectada, reconectando...");
        globalThis._mongoDb = undefined;
        globalThis._mongoClientPromise = undefined;
      }
    }
    
    const client = await getMongoClient();
    const db = client.db(dbName);
    globalThis._mongoDb = db;
    return db;
  } catch (error: any) {
    console.error("❌ Error obteniendo base de datos MongoDB:", error.message);
    throw error;
  }
}

// Crea índices necesarios para garantizar unicidad y buenas consultas
export async function ensureMongoIndexes() {
  const db = await getDb();

  // Puntos
  await db.collection("puntos").createIndexes([
    { key: { nombre: 1 }, name: "idx_puntos_nombre" },
    { key: { createdAt: -1 }, name: "idx_puntos_createdAt" },
  ]);

  // Usuarios
  await db.collection("usuarios").createIndexes([
    // nombre único para evitar duplicados (respetando casos en UI)
    {
      key: { nombre: 1 },
      name: "uniq_usuarios_nombre",
      unique: true,
      sparse: true,
    },
    { key: { versiculo_id: 1 }, name: "idx_usuarios_versiculo" },
    { key: { createdAt: -1 }, name: "idx_usuarios_createdAt" },
  ]);

  // Retos
  await db.collection("retos").createIndexes([
    { key: { activo: 1, fecha_inicio: 1 }, name: "idx_retos_activo_inicio" },
    { key: { createdAt: -1 }, name: "idx_retos_createdAt" },
  ]);

  // Devocionales
  await db.collection("devocionales").createIndexes([
    { key: { activo: 1, orden: 1 }, name: "idx_devocionales_activo_orden" },
    { key: { createdAt: -1 }, name: "idx_devocionales_createdAt" },
  ]);

  await db.collection("devocional_sesiones").createIndexes([
    { key: { devocional_id: 1 }, name: "idx_dvs_devocional" },
    { key: { usuario_iniciador_id: 1 }, name: "idx_dvs_iniciador" },
    {
      key: { usuario_pareja_id: 1, estado: 1 },
      name: "idx_dvs_pareja_estado",
    },
  ]);

  await db.collection("devocional_progreso").createIndexes([
    {
      key: { sesion_id: 1, user_id: 1 },
      name: "uniq_dvp_sesion_user",
      unique: true,
    },
  ]);

  console.log("🧱 Índices de MongoDB verificados/creados");
}
