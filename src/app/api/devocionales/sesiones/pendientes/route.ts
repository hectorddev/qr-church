import { listarSesionesPendientesParaUsuario } from "@/lib/database";
import { getBearerAuth } from "@/lib/api-auth";
import { ApiResponse, DevocionalSesion } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

// GET /api/devocionales/sesiones/pendientes — invitaciones a aceptar
export async function GET(request: NextRequest) {
  try {
    const auth = await getBearerAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }
    const lista = await listarSesionesPendientesParaUsuario(auth.id);
    return NextResponse.json<ApiResponse<DevocionalSesion[]>>({
      success: true,
      data: lista,
    });
  } catch (error) {
    console.error("GET pendientes sesiones:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
