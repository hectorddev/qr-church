// Script de prueba para verificar la conexión a MongoDB
// Ejecutar con: node test-mongodb-connection.js

const { MongoClient } = require('mongodb');
const dns = require('dns').promises;

// Tu URI con la contraseña
const uri = 'mongodb+srv://hectordmv21_db_user:javascript@pampanos01.fj0fsa4.mongodb.net/?appName=Pampanos01';

async function testDNS() {
  console.log('🔍 Verificando resolución DNS...');
  try {
    const hostname = 'pampanos01.fj0fsa4.mongodb.net';
    const addresses = await dns.resolve4(hostname);
    console.log('✅ DNS resuelto correctamente:', addresses);
    return true;
  } catch (error) {
    console.error('❌ Error resolviendo DNS:', error.message);
    return false;
  }
}

async function testConnection() {
  console.log('\n🔌 Probando conexión a MongoDB...');
  console.log('URI (sin mostrar contraseña):', uri.replace(/:[^:@]+@/, ':****@'));
  
  // Verificar DNS primero
  const dnsOk = await testDNS();
  if (!dnsOk) {
    console.error('\n❌ No se puede resolver el DNS. Verifica tu conexión a internet.');
    process.exit(1);
  }
  
  const client = new MongoClient(uri, {
    tls: true,
    connectTimeoutMS: 15000,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 30000,
  });

  try {
    console.log('\n⏳ Intentando conectar (esto puede tardar hasta 15 segundos)...');
    await client.connect();
    console.log('✅ Conexión exitosa!');
    
    // Probar una operación simple
    const db = client.db('pampanos');
    const collections = await db.listCollections().toArray();
    console.log('📚 Colecciones encontradas:', collections.length > 0 ? collections.map(c => c.name) : 'Ninguna');
    
    await client.close();
    console.log('\n✅ Prueba completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error de conexión:');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensaje:', error.message);
    
    if (error.message.includes('authentication') || error.message.includes('auth')) {
      console.error('\n💡 ERROR DE AUTENTICACIÓN:');
      console.error('1. Verifica que la contraseña "javascript" sea correcta');
      console.error('2. Asegúrate de que el usuario "hectordmv21_db_user" tenga permisos');
      console.error('3. Si la contraseña tiene caracteres especiales, codifícala en URL');
      console.error('   Ejemplo: @ → %40, # → %23, espacio → %20');
    }
    
    if (error.message.includes('ECONNRESET') || error.message.includes('timeout') || error.message.includes('Server selection')) {
      console.error('\n💡 ERROR DE CONEXIÓN/TIMEOUT:');
      console.error('1. Verifica que tu IP esté en la whitelist de MongoDB Atlas:');
      console.error('   - Ve a MongoDB Atlas Dashboard');
      console.error('   - Network Access → Add IP Address');
      console.error('   - Añade 0.0.0.0/0 para permitir todas las IPs (solo desarrollo)');
      console.error('   - O añade tu IP específica');
      console.error('2. Verifica que el cluster no esté pausado:');
      console.error('   - Ve a MongoDB Atlas → Clusters');
      console.error('   - Asegúrate de que el cluster esté activo (no pausado)');
      console.error('3. Verifica tu conexión a internet');
      console.error('4. Intenta desde otra red o usa un VPN');
      console.error('5. Verifica que no haya un firewall bloqueando la conexión');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n💡 ERROR DE DNS:');
      console.error('1. Verifica tu conexión a internet');
      console.error('2. Verifica que puedas resolver DNS');
      console.error('3. Intenta desde otra red');
    }
    
    process.exit(1);
  }
}

testConnection();

