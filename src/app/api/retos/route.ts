import { crearReto, obtenerRetos, obtenerRetosActivos } from "@/lib/database";
import { ApiResponse, CrearRetoData, Reto } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

// Función para validar URL de YouTube
function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return youtubeRegex.test(url);
}

// Función para extraer video ID de YouTube
function extractYouTubeVideoId(url: string): string | null {
  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];

  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];

  // youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
  if (embedMatch) return embedMatch[1];

  return null;
}

// GET /api/retos - Obtener todos los retos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const soloActivos = searchParams.get("activos") === "true";

    let retos: Reto[];
    if (soloActivos) {
      retos = await obtenerRetosActivos();
    } else {
      retos = await obtenerRetos();
    }

    return NextResponse.json<ApiResponse<Reto[]>>({
      success: true,
      data: retos,
    });
  } catch (error) {
    console.error("Error al obtener retos:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// POST /api/retos - Crear un nuevo reto
export async function POST(request: NextRequest) {
  try {
    const body: CrearRetoData = await request.json();
    const {
      titulo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      activo,
      video_url,
      iframe_content,
    } = body;

    // Validar campos requeridos
    if (!titulo || !descripcion || !fecha_inicio || !fecha_fin) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error:
            "Título, descripción, fecha de inicio y fecha de fin son requeridos",
        },
        { status: 400 }
      );
    }

    // Validar fechas
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

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

    // Validar video_url si se proporciona
    if (video_url && video_url.trim() !== "") {
      if (!isValidYouTubeUrl(video_url)) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: "La URL de YouTube no es válida. Usa formato: https://www.youtube.com/watch?v=... o https://youtu.be/...",
          },
          { status: 400 }
        );
      }
    }

    // Crear reto
    const nuevoReto = await crearReto({
      titulo,
      descripcion,
      fecha_inicio: inicio,
      fecha_fin: fin,
      activo: activo !== undefined ? activo : true,
      video_url: video_url && video_url.trim() !== "" ? video_url : undefined,
      iframe_content:
        iframe_content && iframe_content.trim() !== ""
          ? iframe_content
          : undefined,
    });

    return NextResponse.json<ApiResponse<Reto>>(
      {
        success: true,
        data: nuevoReto,
        message: "Reto creado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear reto:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
