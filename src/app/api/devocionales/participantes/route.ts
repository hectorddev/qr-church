import { obtenerUsuarios } from "@/lib/database";
import { getBearerAuth } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export type ParticipanteDevocional = { id: string; nombre: string };

// GET — lista mínima de usuarios (reservado para modo pareja cuando se reactive en la UI)
export async function GET(request: NextRequest) {
  try {
    const auth = await getBearerAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }
    const usuarios = await obtenerUsuarios();
    const data: ParticipanteDevocional[] = usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre,
    }));
    return NextResponse.json<ApiResponse<ParticipanteDevocional[]>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET participantes devocional:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
