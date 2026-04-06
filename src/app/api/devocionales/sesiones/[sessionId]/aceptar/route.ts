import { aceptarSesionDevocional } from "@/lib/database";
import { getBearerAuth } from "@/lib/api-auth";
import { ApiResponse, DevocionalSesion } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

// POST — la persona invitada acepta la sesión en pareja
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getBearerAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }
    const { sessionId } = await params;
    try {
      const sesion = await aceptarSesionDevocional(sessionId, auth.id);
      if (!sesion) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Sesión no encontrada" },
          { status: 404 }
        );
      }
      return NextResponse.json<ApiResponse<DevocionalSesion>>({
        success: true,
        data: sesion,
        message: "Sesión aceptada",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo aceptar";
      return NextResponse.json<ApiResponse>(
        { success: false, error: msg },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("POST aceptar sesión:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
