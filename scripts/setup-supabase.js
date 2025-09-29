#!/usr/bin/env node

// Script para configurar Supabase (GRATUITO)
const fs = require('fs');
const path = require('path');

console.log('🆓 Configurando Supabase (GRATUITO) para Pámpanos...\n');

// Verificar que @supabase/supabase-js esté instalado
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (!packageJson.dependencies['@supabase/supabase-js']) {
  console.log('❌ @supabase/supabase-js no está instalado');
  console.log('📦 Ejecuta: npm install @supabase/supabase-js');
  process.exit(1);
}

console.log('✅ @supabase/supabase-js está instalado');

// Verificar archivos necesarios
const requiredFiles = [
  'src/lib/supabase.ts',
  'src/lib/database.ts',
  'src/app/api/init-supabase/route.ts'
];

console.log('\n📁 Verificando archivos de Supabase:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
    process.exit(1);
  }
});

// Verificar variables de entorno
console.log('\n🔐 Verificando variables de entorno:');
const envExample = fs.readFileSync('env.example', 'utf8');

if (envExample.includes('NEXT_PUBLIC_SUPABASE_URL')) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL está en env.example');
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL no está en env.example');
}

if (envExample.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY está en env.example');
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no está en env.example');
}

console.log('\n📋 Pasos para configurar Supabase (GRATUITO):');
console.log('1. 🌐 Ve a https://supabase.com y crea una cuenta');
console.log('2. 🏗️  Crea un nuevo proyecto');
console.log('3. 🔑 Copia la URL y la clave anon');
console.log('4. ⚙️  Configura las variables en Vercel:');
console.log('   - Ve a tu proyecto en Vercel Dashboard');
console.log('   - Settings → Environment Variables');
console.log('   - Agrega: NEXT_PUBLIC_SUPABASE_URL=tu-url');
console.log('   - Agrega: NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key');
console.log('5. 🚀 Despliega tu aplicación');
console.log('6. 🔧 Inicializa la base de datos:');
console.log('   - POST a /api/init-supabase');

console.log('\n🎯 Ejemplo de variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

console.log('\n📖 Para más detalles, lee SUPABASE-SETUP.md');

console.log('\n🎉 ¡Configuración de Supabase (GRATUITO) completada!');
