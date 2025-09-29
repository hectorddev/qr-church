// Configuración de PlanetScale para producción
import { connect } from '@planetscale/database';

// Configuración de conexión
const config = {
  url: process.env.DATABASE_URL,
};

// Crear conexión
export const conn = connect(config);

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
  createdAt: Date;
  updatedAt: Date;
}

// Crear tablas si no existen
export async function createTables() {
  try {
    // Crear tabla de puntos
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS puntos (
        id VARCHAR(255) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        x DECIMAL(5,2) NOT NULL,
        y DECIMAL(5,2) NOT NULL,
        emoji VARCHAR(10) NOT NULL,
        pointerName VARCHAR(255) NOT NULL,
        referencias TEXT,
        año TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de usuarios
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id VARCHAR(255) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL UNIQUE,
        versiculo_id VARCHAR(255) NOT NULL,
        rol ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tablas creadas exitosamente en PlanetScale');
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    throw error;
  }
}

// Inicializar datos de ejemplo
export async function initializeExampleData() {
  try {
    // Verificar si ya hay datos
    const existingPoints = await conn.execute('SELECT COUNT(*) as count FROM puntos');
    const count = (existingPoints.rows[0] as any).count;

    if (count > 0) {
      console.log('📊 Datos ya existen en la base de datos');
      return;
    }

    console.log('🌱 Inicializando datos de ejemplo...');

    // Insertar puntos de ejemplo
    const examplePoints = [
      {
        id: 'punto_1',
        nombre: 'Identidad',
        descripcion: 'Soy Hijo de Dios',
        x: 58.5,
        y: 44.9,
        emoji: '🌟',
        pointerName: 'Esperanza',
        referencias: 'Lucas 3:22',
        año: 'Reconocer nuestra identidad como hijos de Dios nos da esperanza y propósito en la vida.'
      },
      {
        id: 'punto_2',
        nombre: 'Fe',
        descripcion: 'Creer sin ver',
        x: 45.2,
        y: 35.7,
        emoji: '🙏',
        pointerName: 'Fe',
        referencias: 'Juan 20:29',
        año: 'La fe es la certeza de lo que se espera, la convicción de lo que no se ve.'
      },
      {
        id: 'punto_3',
        nombre: 'Amor',
        descripcion: 'Amar como Cristo nos amó',
        x: 52.8,
        y: 28.3,
        emoji: '❤️',
        pointerName: 'Amor',
        referencias: 'Juan 13:34',
        año: 'Amar a otros como Cristo nos amó es el mandamiento más importante.'
      },
      {
        id: 'punto_4',
        nombre: 'Sabiduría',
        descripcion: 'Buscar la sabiduría de Dios',
        x: 38.9,
        y: 42.1,
        emoji: '📚',
        pointerName: 'Sabiduría',
        referencias: 'Proverbios 2:6',
        año: 'La sabiduría viene del temor al Señor y nos guía en nuestras decisiones.'
      },
      {
        id: 'punto_5',
        nombre: 'Servicio',
        descripcion: 'Servir a otros con humildad',
        x: 61.4,
        y: 37.6,
        emoji: '🤝',
        pointerName: 'Servicio',
        referencias: 'Marcos 10:45',
        año: 'Jesús vino para servir, no para ser servido. Sigamos su ejemplo.'
      }
    ];

    // Insertar usuarios de ejemplo
    const exampleUsers = [
      {
        id: 'user_1',
        nombre: 'admin',
        versiculo_id: 'juan316',
        rol: 'admin'
      },
      {
        id: 'user_2',
        nombre: 'usuario1',
        versiculo_id: 'mateo2819',
        rol: 'usuario'
      },
      {
        id: 'user_3',
        nombre: 'usuario2',
        versiculo_id: 'salmo231',
        rol: 'usuario'
      }
    ];

    // Insertar puntos
    for (const point of examplePoints) {
      await conn.execute(`
        INSERT INTO puntos (id, nombre, descripcion, x, y, emoji, pointerName, referencias, año)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        point.id,
        point.nombre,
        point.descripcion,
        point.x,
        point.y,
        point.emoji,
        point.pointerName,
        point.referencias,
        point.año
      ]);
    }

    // Insertar usuarios
    for (const user of exampleUsers) {
      await conn.execute(`
        INSERT INTO usuarios (id, nombre, versiculo_id, rol)
        VALUES (?, ?, ?, ?)
      `, [
        user.id,
        user.nombre,
        user.versiculo_id,
        user.rol
      ]);
    }

    console.log('✅ Datos de ejemplo inicializados correctamente');
  } catch (error) {
    console.error('❌ Error inicializando datos:', error);
    throw error;
  }
}

// Función para inicializar todo
export async function initializePlanetScale() {
  try {
    await createTables();
    await initializeExampleData();
    console.log('🚀 PlanetScale inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando PlanetScale:', error);
    throw error;
  }
}