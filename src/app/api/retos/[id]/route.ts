import { actualizarReto, eliminarReto, obtenerReto } from "@/lib/database";
import { ApiResponse, CrearRetoData } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

// Función para validar URL de YouTube
function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return youtubeRegex.test(url);
}

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/retos/[id] - Obtener un reto específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const reto = await obtenerReto(id);

    if (!reto) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Reto no encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: reto,
    });
  } catch (error) {
    console.error("Error al obtener reto:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// PUT /api/retos/[id] - Actualizar un reto específico
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verificar que el reto existe
    const retoExistente = await obtenerReto(id);
    if (!retoExistente) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Reto no encontrado",
        },
        { status: 404 }
      );
    }

    // Validar fechas si se proporcionan
    if (body.fecha_inicio || body.fecha_fin) {
      const inicio = body.fecha_inicio
        ? new Date(body.fecha_inicio)
        : retoExistente.fecha_inicio;
      const fin = body.fecha_fin
        ? new Date(body.fecha_fin)
        : retoExistente.fecha_fin;

      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: "Las fechas deben tener un formato válido",
          },
          { status: 400 }
        );
      }

      if (fin <= inicio) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: "La fecha de fin debe ser posterior a la fecha de inicio",
          },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const datosActualizacion: Partial<CrearRetoData> = {};
    if (body.titulo !== undefined) datosActualizacion.titulo = body.titulo;
    if (body.descripcion !== undefined)
      datosActualizacion.descripcion = body.descripcion;
    if (body.fecha_inicio !== undefined)
      datosActualizacion.fecha_inicio = new Date(body.fecha_inicio);
    if (body.fecha_fin !== undefined)
      datosActualizacion.fecha_fin = new Date(body.fecha_fin);
    if (body.activo !== undefined) datosActualizacion.activo = body.activo;

    // Validar y agregar video_url si se proporciona
    if (body.video_url !== undefined) {
      if (body.video_url && body.video_url.trim() !== "") {
        if (!isValidYouTubeUrl(body.video_url)) {
          return NextResponse.json<ApiResponse>(
            {
              success: false,
              error: "La URL de YouTube no es válida. Usa formato: https://www.youtube.com/watch?v=... o https://youtu.be/...",
            },
            { status: 400 }
          );
        }
        datosActualizacion.video_url = body.video_url;
      } else {
        datosActualizacion.video_url = undefined;
      }
    }

    const retoActualizado = await actualizarReto(id, datosActualizacion);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: retoActualizado,
      message: "Reto actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar reto:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/retos/[id] - Eliminar un reto específico
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verificar que el reto existe
    const retoExistente = await obtenerReto(id);
    if (!retoExistente) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Reto no encontrado",
        },
        { status: 404 }
      );
    }

    await eliminarReto(id);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Reto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar reto:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
