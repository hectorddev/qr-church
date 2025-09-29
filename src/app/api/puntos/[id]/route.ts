// API Route para manejar operaciones específicas de un punto por ID
import { NextRequest, NextResponse } from 'next/server';
import { 
  obtenerPunto, 
  actualizarPunto, 
  eliminarPunto 
} from '@/lib/db';
import { CrearPuntoData, ApiResponse } from '@/lib/types';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/puntos/[id] - Obtener un punto específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const punto = await obtenerPunto(id);
    
    if (!punto) {
      const response: ApiResponse = {
        success: false,
        error: 'Punto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse = {
      success: true,
      data: punto,
      message: 'Punto obtenido exitosamente'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al obtener punto:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Error interno del servidor'
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/puntos/[id] - Actualizar un punto específico
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validar que el punto existe
    const puntoExistente = await obtenerPunto(id);
    if (!puntoExistente) {
      const response: ApiResponse = {
        success: false,
        error: 'Punto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Validar coordenadas si se proporcionan
    if (body.x !== undefined && (body.x < 0 || body.x > 100)) {
      const response: ApiResponse = {
        success: false,
        error: 'La coordenada x debe estar entre 0 y 100'
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (body.y !== undefined && (body.y < 0 || body.y > 100)) {
      const response: ApiResponse = {
        success: false,
        error: 'La coordenada y debe estar entre 0 y 100'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const datosActualizacion: Partial<CrearPuntoData> = {};
    
    // Solo actualizar campos proporcionados
    if (body.nombre !== undefined) datosActualizacion.nombre = body.nombre;
    if (body.descripcion !== undefined) datosActualizacion.descripcion = body.descripcion;
    if (body.x !== undefined) datosActualizacion.x = body.x;
    if (body.y !== undefined) datosActualizacion.y = body.y;
    if (body.tipo !== undefined) datosActualizacion.tipo = body.tipo;
    if (body.referencias !== undefined) datosActualizacion.referencias = body.referencias;
    if (body.año !== undefined) datosActualizacion.año = body.año;

    const puntoActualizado = await actualizarPunto(id, datosActualizacion);
    
    const response: ApiResponse = {
      success: true,
      data: puntoActualizado,
      message: 'Punto actualizado exitosamente'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al actualizar punto:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Error interno del servidor'
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/puntos/[id] - Eliminar un punto específico
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Validar que el punto existe
    const puntoExistente = await obtenerPunto(id);
    if (!puntoExistente) {
      const response: ApiResponse = {
        success: false,
        error: 'Punto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const eliminado = await eliminarPunto(id);
    
    if (!eliminado) {
      const response: ApiResponse = {
        success: false,
        error: 'Error al eliminar el punto'
      };
      return NextResponse.json(response, { status: 500 });
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Punto eliminado exitosamente'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al eliminar punto:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Error interno del servidor'
    };

    return NextResponse.json(response, { status: 500 });
  }
}
