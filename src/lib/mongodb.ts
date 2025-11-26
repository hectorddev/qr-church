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

  if (!globalThis._mongoClientPromise) {
    const client = new MongoClient(uri, {
      // Opciones aquí si las necesitas (por defecto excelentes para Atlas)
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    console.log("🔌 Conectando a MongoDB Atlas...");
    globalThis._mongoClientPromise = client.connect().then((c) => {
      console.log("✅ Conexión a MongoDB establecida");
      return c;
    });
  }
  return globalThis._mongoClientPromise;
}

// Devuelve la BD (usa MONGODB_DB_NAME o 'pampanos' por defecto)
export async function getDb(): Promise<Db> {
  if (globalThis._mongoDb) return globalThis._mongoDb;
  const client = await getMongoClient();
  const db = client.db(dbName);
  globalThis._mongoDb = db;
  return db;
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

  console.log("🧱 Índices de MongoDB verificados/creados");
}
