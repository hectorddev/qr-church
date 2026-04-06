import {
  obtenerDevocional,
  obtenerSesionDevocional,
  obtenerUsuario,
  puedeAccederSesionDevocional,
} from "@/lib/database";
import { getBearerAuth, isAdminPayload } from "@/lib/api-auth";
import { sanitizarLecturaParaCliente } from "@/lib/devocionales-utils";
import { lecturaParaSesion } from "@/lib/devocionales-model";
import {
  ApiResponse,
  DevocionalSesionDetalle,
} from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

// GET — sesión + devocional (sanitizado) si el usuario pertenece a la sesión
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
        { success: false, error: "No tienes acceso a esta sesión" },
        { status: 403 }
      );
    }
    const dev = await obtenerDevocional(sesion.devocional_id);
    if (!dev) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Devocional no encontrado" },
        { status: 404 }
      );
    }
    const lr = lecturaParaSesion(dev, sesion.lectura_id);
    if (!lr) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Lectura no encontrada" },
        { status: 404 }
      );
    }
    const uIni = await obtenerUsuario(sesion.usuario_iniciador_id);
    let nombrePareja: string | null = null;
    if (sesion.usuario_pareja_id) {
      const uPar = await obtenerUsuario(sesion.usuario_pareja_id);
      nombrePareja = uPar?.nombre ?? null;
    }
    const completo =
      isAdminPayload(auth) &&
      request.nextUrl.searchParams.get("completo") === "1";
    const lecturaOut = completo
      ? lr.lectura
      : sanitizarLecturaParaCliente(lr.lectura);

    const payload: DevocionalSesionDetalle = {
      sesion,
      lectura: lecturaOut,
      tema_id: lr.tema.id,
      tema_titulo: lr.tema.titulo,
      programa: {
        id: dev.id,
        titulo: dev.titulo,
        descripcion: dev.descripcion,
        imagen_url: dev.imagen_url,
      },
      nombres: {
        iniciador: uIni?.nombre ?? "Usuario",
        pareja: nombrePareja,
      },
    };
    return NextResponse.json<ApiResponse<DevocionalSesionDetalle>>({
      success: true,
      data: payload,
    });
  } catch (error) {
    console.error("GET sesión devocional:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
