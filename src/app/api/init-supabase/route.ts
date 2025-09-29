import { NextResponse } from 'next/server';
import { initializeSupabase } from '@/lib/supabase';
import { ApiResponse } from '@/lib/types';

export async function POST() {
  try {
    // Verificar que las variables de Supabase estén configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Variables de Supabase no están configuradas. Necesitas NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY'
      }, { status: 400 });
    }

    // Inicializar Supabase
    await initializeSupabase();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Supabase inicializado correctamente con tablas y datos de ejemplo'
    });

  } catch (error) {
    console.error('Error inicializando Supabase:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor al inicializar Supabase'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Verificar estado de la base de datos
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Variables de Supabase no están configuradas'
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Supabase está configurado correctamente',
      data: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurado' : 'No configurado',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'No configurado',
        environment: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('Error verificando Supabase:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error verificando configuración de Supabase'
    }, { status: 500 });
  }
}
