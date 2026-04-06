/**
 * Prueba de conexión a MongoDB Atlas (sin credenciales en el código).
 *
 * Desde la raíz del proyecto (Node 20+):
 *   node --env-file=.env.local test-mongodb-connection.js
 *
 * O en PowerShell:
 *   $env:MONGODB_URI="mongodb+srv://..."; node test-mongodb-connection.js
 */
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "pampanos";

async function testConnection() {
  if (!uri) {
    console.error(
      "❌ Falta MONGODB_URI. Ejecuta: node --env-file=.env.local test-mongodb-connection.js"
    );
    process.exit(1);
  }

  console.log("URI (oculta):", uri.replace(/:[^:@]+@/, ":****@"));
  console.log("Base de datos:", dbName);

  const client = new MongoClient(uri, {
    tls: true,
    connectTimeoutMS: 20000,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });

  try {
    console.log("\n⏳ Conectando…");
    await client.connect();
    console.log("✅ Conexión OK");

    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(
      "📚 Colecciones:",
      collections.length ? collections.map((c) => c.name).join(", ") : "(ninguna)"
    );

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.constructor.name, "-", error.message);

    if (
      error.message.includes("Server selection") ||
      error.message.includes("timed out")
    ) {
      console.error(`
💡 "Server selection timed out" casi siempre es RED / ATLAS, no el nombre de la BD:

1) MongoDB Atlas → Network Access
   - Debe existir una regla que permita TU IP actual (o 0.0.0.0/0 solo para pruebas).
   - Si tu IP cambió (ISP, reinicio de router), vuelve a "Add Current IP".

2) Atlas → Database → tu cluster
   - Estado "Active" / no pausado. Tras reanudar, espera 1–2 minutos.

3) Firewall / antivirus / empresa / escuela
   - Pueden bloquear salida hacia MongoDB. Prueba con datos móviles o otra red.

4) VPN
   - A veces la IP vista por Atlas es la del VPN; añade esa IP o desactiva VPN para probar.
`);
    }

    if (
      error.message.includes("authentication") ||
      error.message.includes("bad auth")
    ) {
      console.error(`
💡 Usuario o contraseña incorrectos en la URI.
   Codifica caracteres especiales en la contraseña (ej. @ → %40).
`);
    }

    process.exit(1);
  }
}

testConnection();
