import { NextResponse } from 'next/server';
import { initializePlanetScale } from '@/lib/planetscale';
import { ApiResponse } from '@/lib/types';

export async function POST() {
  try {
    // Verificar que estamos en producción o que DATABASE_URL esté configurado
    if (!process.env.DATABASE_URL) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'DATABASE_URL no está configurado'
      }, { status: 400 });
    }

    // Inicializar PlanetScale
    await initializePlanetScale();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'PlanetScale inicializado correctamente con tablas y datos de ejemplo'
    });

  } catch (error) {
    console.error('Error inicializando PlanetScale:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor al inicializar PlanetScale'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Verificar estado de la base de datos
    if (!process.env.DATABASE_URL) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'DATABASE_URL no está configurado'
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'PlanetScale está configurado correctamente',
      data: {
        databaseUrl: process.env.DATABASE_URL ? 'Configurado' : 'No configurado',
        environment: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('Error verificando PlanetScale:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error verificando configuración de PlanetScale'
    }, { status: 500 });
  }
}
