#!/usr/bin/env node

// Script de verificación pre-despliegue
const fs = require('fs');
const path = require('path');

console.log('🚀 Verificando preparación para despliegue...\n');

// Verificar archivos críticos
const criticalFiles = [
  'package.json',
  'next.config.mjs',
  'vercel.json',
  'src/app/layout.js',
  'src/lib/database.ts',
  'src/lib/db.ts'
];

console.log('📁 Verificando archivos críticos:');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
    process.exit(1);
  }
});

// Verificar que no hay archivos .env en el repo
console.log('\n🔐 Verificando archivos sensibles:');
const envFiles = ['.env', '.env.local', '.env.production'];
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`⚠️  ${file} - Este archivo NO debe estar en el repositorio`);
  } else {
    console.log(`✅ ${file} - Correctamente ignorado`);
  }
});

// Verificar package.json
console.log('\n📦 Verificando package.json:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (packageJson.scripts && packageJson.scripts.build) {
  console.log('✅ Script de build encontrado');
} else {
  console.log('❌ Script de build no encontrado');
  process.exit(1);
}

if (packageJson.dependencies && packageJson.dependencies.next) {
  console.log('✅ Next.js encontrado');
} else {
  console.log('❌ Next.js no encontrado');
  process.exit(1);
}

// Verificar estructura de directorios
console.log('\n📂 Verificando estructura de directorios:');
const requiredDirs = [
  'src/app',
  'src/components',
  'src/lib',
  'src/contexts',
  'public'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - FALTANTE`);
    process.exit(1);
  }
});

console.log('\n🎉 ¡Verificación completada exitosamente!');
console.log('\n📋 Próximos pasos:');
console.log('1. Configura las variables de entorno en Vercel');
console.log('2. Haz push a tu repositorio');
console.log('3. Vercel desplegará automáticamente');
console.log('\n📖 Lee DEPLOYMENT.md para más detalles');
