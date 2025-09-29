// Configuración de base de datos para producción y desarrollo
import { PuntoMapa, CrearPuntoData } from './types';

// Configuración de base de datos
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Base de datos Supabase (GRATUITA)
class SupabaseDatabase {
  private supabase: any;

  constructor() {
    // Importar dinámicamente para evitar errores en desarrollo
    this.supabase = null;
  }

  private async getSupabase() {
    if (!this.supabase) {
      const { supabase } = await import('./supabase');
      this.supabase = supabase;
    }
    return this.supabase;
  }

  async crearPunto(data: CrearPuntoData): Promise<PuntoMapa> {
    const supabase = await this.getSupabase();
    const id = `punto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const nuevoPunto: PuntoMapa = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { error } = await supabase
      .from('puntos')
      .insert([{
        id,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        x: data.x,
        y: data.y,
        emoji: data.emoji,
        pointerName: data.pointerName,
        referencias: data.referencias || null,
        año: data.año || null
      }]);

    if (error) {
      console.error('Error creando punto en Supabase:', error);
      throw error;
    }

    console.log('Punto creado en Supabase:', nuevoPunto);
    return nuevoPunto;
  }

  async obtenerPuntos(): Promise<PuntoMapa[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('puntos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo puntos de Supabase:', error);
      throw error;
    }

    return data.map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      x: parseFloat(row.x),
      y: parseFloat(row.y),
      emoji: row.emoji,
      pointerName: row.pointerName,
      referencias: row.referencias,
      año: row.año,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  async obtenerPunto(id: string): Promise<PuntoMapa | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('puntos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      console.error('Error obteniendo punto de Supabase:', error);
      throw error;
    }

    return {
      id: data.id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      x: parseFloat(data.x),
      y: parseFloat(data.y),
      emoji: data.emoji,
      pointerName: data.pointerName,
      referencias: data.referencias,
      año: data.año,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async actualizarPunto(id: string, data: Partial<CrearPuntoData>): Promise<PuntoMapa | null> {
    const supabase = await this.getSupabase();
    
    const updateData: any = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    if (Object.keys(updateData).length === 0) return null;

    const { error } = await supabase
      .from('puntos')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error actualizando punto en Supabase:', error);
      throw error;
    }

    return await this.obtenerPunto(id);
  }

  async eliminarPunto(id: string): Promise<boolean> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('puntos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando punto de Supabase:', error);
      throw error;
    }

    console.log('Punto eliminado de Supabase:', id);
    return true;
  }

  async eliminarTodosPuntos(): Promise<number> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('puntos')
      .delete()
      .neq('id', 'impossible_id'); // Eliminar todos

    if (error) {
      console.error('Error eliminando todos los puntos de Supabase:', error);
      throw error;
    }

    console.log('Todos los puntos eliminados de Supabase');
    return 0; // Supabase no retorna el count
  }
}

// Base de datos en memoria para desarrollo (temporal)
class InMemoryDatabase {
  private puntos: PuntoMapa[] = [];
  private nextId = 1;

  async crearPunto(data: CrearPuntoData): Promise<PuntoMapa> {
    const nuevoPunto: PuntoMapa = {
      id: `punto_${this.nextId++}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.puntos.push(nuevoPunto);
    console.log('Punto creado:', nuevoPunto);
    return nuevoPunto;
  }

  async obtenerPuntos(): Promise<PuntoMapa[]> {
    return [...this.puntos];
  }

  async obtenerPunto(id: string): Promise<PuntoMapa | null> {
    return this.puntos.find(punto => punto.id === id) || null;
  }

  async actualizarPunto(id: string, data: Partial<CrearPuntoData>): Promise<PuntoMapa | null> {
    const index = this.puntos.findIndex(punto => punto.id === id);
    if (index === -1) return null;

    this.puntos[index] = {
      ...this.puntos[index],
      ...data,
      updatedAt: new Date()
    };
    return this.puntos[index];
  }

  async eliminarPunto(id: string): Promise<boolean> {
    const index = this.puntos.findIndex(punto => punto.id === id);
    if (index === -1) return false;
    this.puntos.splice(index, 1);
    return true;
  }

  async eliminarTodosPuntos(): Promise<number> {
    const count = this.puntos.length;
    this.puntos = [];
    return count;
  }
}

// Instancia de base de datos
let db: InMemoryDatabase | SupabaseDatabase;

// Inicializar base de datos
export function initializeDatabase() {
  if (!db) {
    if (hasSupabase) {
      console.log('🚀 Usando Supabase (GRATUITO) para base de datos');
      db = new SupabaseDatabase();
    } else {
      console.log('💾 Usando base de datos en memoria');
      db = new InMemoryDatabase();
      
      // Solo inicializar datos de ejemplo en desarrollo
      if (!isProduction) {
        initializeExampleData();
      }
    }
  }
  return db;
}

// Obtener instancia de base de datos
export function getDatabase() {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

// Inicializar datos de ejemplo
async function initializeExampleData() {
  const existingPoints = await db.obtenerPuntos();
  if (existingPoints.length === 0) {
    console.log('Inicializando datos de ejemplo...');
    
    const examplePoints = [
      {
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

    for (const pointData of examplePoints) {
      await db.crearPunto(pointData);
    }

    console.log('Datos de ejemplo inicializados correctamente');
  }
}

// Funciones helper para las API routes
export async function crearPunto(data: CrearPuntoData) {
  const database = getDatabase();
  return await database.crearPunto(data);
}

export async function obtenerPuntos() {
  const database = getDatabase();
  return await database.obtenerPuntos();
}

export async function obtenerPunto(id: string) {
  const database = getDatabase();
  return await database.obtenerPunto(id);
}

export async function actualizarPunto(id: string, data: Partial<CrearPuntoData>) {
  const database = getDatabase();
  return await database.actualizarPunto(id, data);
}

export async function eliminarPunto(id: string) {
  const database = getDatabase();
  return await database.eliminarPunto(id);
}

export async function eliminarTodosPuntos() {
  const database = getDatabase();
  return await database.eliminarTodosPuntos();
}
