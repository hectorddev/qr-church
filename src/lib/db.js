import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // No lanzar error al importar: deshabilitar en runtime.
  // Evita que el build de Vercel falle cuando no hay Mongo configurado.
  // eslint-disable-next-line no-console
  console.warn(
    "MONGODB_URI no definida. La API de eventos estará deshabilitada en este despliegue."
  );
}

/**
 * Variable global para mantener la conexión a la base de datos entre solicitudes
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Conecta a la base de datos de MongoDB
 * @returns {Promise<mongoose.Connection>}
 */
export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error(
      "Eventos API deshabilitada: falta MONGODB_URI en variables de entorno."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
