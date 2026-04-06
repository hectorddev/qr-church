import {
  obtenerProgresoDevocional,
  obtenerSesionDevocional,
  guardarProgresoDevocional,
  puedeAccederSesionDevocional,
} from "@/lib/database";
import { getBearerAuth } from "@/lib/api-auth";
import {
  ApiResponse,
  DevocionalProgresoUsuario,
  GuardarProgresoDevocionalInput,
  ProgresoDevocionalVista,
} from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

function progresoVacio(
  sesionId: string,
  userId: string
): DevocionalProgresoUsuario {
  return {
    id: "",
    sesion_id: sesionId,
    user_id: userId,
    pasos_completados: [],
    respuestas_campos: {},
    respuestas_preguntas: {},
    puntaje_puntuacion: 0,
    updatedAt: new Date(),
  };
}

// GET — mi progreso y, si sesión en pareja activa, el de la pareja (reflexivas visibles entre ustedes)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getBearerAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }
    const { sessionId } = await params;
    const sesion = await obtenerSesionDevocional(sessionId);
    if (!sesion) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Sesión no encontrada" },
        { status: 404 }
      );
    }
    if (!puedeAccederSesionDevocional(sesion, auth.id)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No tienes acceso" },
        { status: 403 }
      );
    }

    const mio =
      (await obtenerProgresoDevocional(sessionId, auth.id)) ??
      progresoVacio(sessionId, auth.id);

    let pareja: DevocionalProgresoUsuario | null = null;
    if (
      sesion.modo === "pareja" &&
      sesion.estado === "activa" &&
      sesion.usuario_pareja_id
    ) {
      const otroId =
        sesion.usuario_iniciador_id === auth.id
          ? sesion.usuario_pareja_id
          : sesion.usuario_iniciador_id;
      pareja =
        (await obtenerProgresoDevocional(sessionId, otroId)) ??
        progresoVacio(sessionId, otroId);
    }

    const data: ProgresoDevocionalVista = { mio, pareja };
    return NextResponse.json<ApiResponse<ProgresoDevocionalVista>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET progreso devocional:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT — guardar mi progreso (merge parcial)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getBearerAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }
    const { sessionId } = await params;
    const body: GuardarProgresoDevocionalInput = await request.json();
    try {
      const guardado = await guardarProgresoDevocional(
        sessionId,
        auth.id,
        body
      );
      return NextResponse.json<ApiResponse<DevocionalProgresoUsuario>>({
        success: true,
        data: guardado,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo guardar";
      return NextResponse.json<ApiResponse>(
        { success: false, error: msg },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("PUT progreso devocional:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
